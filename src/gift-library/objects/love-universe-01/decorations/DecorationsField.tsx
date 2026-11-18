import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { UniverseDecorationGroup } from '../../../types';
import {
  getHeartGeometry,
  getStar3DGeometry,
  getGiftBox3DGeometry,
} from './decorationGeometries';
import { createRNG } from '../universeLayout';
import { wrapY, generateStratifiedHeights } from '../motionUtils';

export interface DecorationsFieldProps {
  decorations?: UniverseDecorationGroup[];
  seed: number;
  cloudWidth: number;
  cloudHeight: number;
  cloudDepth: number;
  driftEnabled?: boolean;
  driftSpeed?: number;
  globalDriftEnabled?: boolean;
  globalSpeedMultiplier?: number;
  isOpened: boolean;
  paused?: boolean;
}

interface SingleGroupItem {
  pos: [number, number, number];
  rot: [number, number, number];
  scale: number;
  phase: number;
  speed: number;
  spinAxes: { x: number; y: number; z: number };
}

const SingleDecorationGroupMesh: React.FC<{
  group: UniverseDecorationGroup;
  seed: number;
  cloudWidth: number;
  cloudHeight: number;
  cloudDepth: number;
  driftEnabled: boolean;
  driftSpeed: number;
  isOpened: boolean;
  paused: boolean;
}> = ({
  group,
  seed,
  cloudWidth,
  cloudHeight,
  cloudDepth,
  driftEnabled,
  driftSpeed,
  isOpened,
  paused,
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const timeRef = useRef<number>(0);
  const driftOffsetRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(isOpened ? 1 : 0);

  const geometry = useMemo(() => {
    if (group.type === 'star3d') return getStar3DGeometry();
    if (group.type === 'giftbox') return getGiftBox3DGeometry();
    return getHeartGeometry();
  }, [group.type]);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: group.color,
      roughness: group.roughness ?? 0.35,
      metalness: 0.12,
      emissive: group.color,
      emissiveIntensity: 0.14,
      side: THREE.FrontSide,
    });
  }, [group.color, group.roughness]);

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  // Generate deterministic positions within cloud
  const items = useMemo(() => {
    const groupSeed = seed + group.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const rng = createRNG(groupSeed);
    const list: SingleGroupItem[] = [];
    const count = Math.max(1, Math.min(group.count || 12, 60));

    const halfW = cloudWidth * 0.5;
    const halfD = cloudDepth * 0.5;
    const yCoords = generateStratifiedHeights(count, cloudHeight, rng, 2.0, 0.75);

    for (let i = 0; i < count; i++) {
      const y = yCoords[i];
      const x = (rng() - 0.5) * halfW * 1.6;
      const z = (rng() - 0.5) * halfD * 1.5;

      list.push({
        pos: [x, y, z],
        rot: [rng() * Math.PI, rng() * Math.PI, rng() * Math.PI],
        scale: (0.75 + rng() * 0.5) * (group.scale || 1.0),
        phase: rng() * Math.PI * 2,
        speed: 0.4 + rng() * 0.6,
        spinAxes: {
          x: 0.5 + rng() * 0.7,
          y: 0.6 + rng() * 0.8,
          z: 0.4 + rng() * 0.6,
        },
      });
    }
    return list;
  }, [group.id, group.count, group.scale, seed, cloudWidth, cloudHeight, cloudDepth]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!meshRef.current || items.length === 0) return;

    const safeDelta = Math.min(delta, 0.1);
    if (!paused) {
      timeRef.current += safeDelta;
    }

    const target = isOpened ? 1 : 0;
    const animSpeed = 1.2;
    if (currentProgressRef.current < target) {
      currentProgressRef.current = Math.min(target, currentProgressRef.current + safeDelta * animSpeed);
    } else if (currentProgressRef.current > target) {
      currentProgressRef.current = Math.max(target, currentProgressRef.current - safeDelta * 2.5);
    }

    const time = timeRef.current;
    const rawProgress = currentProgressRef.current;
    const mesh = meshRef.current;

    // Continuous downward drift distance accumulation (once per frame, no jump on speed change)
    if (!paused && driftEnabled) {
      driftOffsetRef.current += driftSpeed * safeDelta;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const stagger = (item.phase / (Math.PI * 2)) * 0.25;
      const progress = Math.max(0, Math.min(1, (rawProgress - stagger) / (1 - stagger)));
      const ease = 1 - Math.pow(1 - progress, 3);

      const wrappedY = wrapY(item.pos[1], driftOffsetRef.current, cloudHeight);
      const dy = Math.sin(time * item.speed + item.phase) * 0.12;

      dummy.position.set(item.pos[0], wrappedY + dy, item.pos[2]);

      const spin = (group.spinSpeed ?? 1.0) * 0.8;
      dummy.rotation.set(
        item.rot[0] + time * spin * item.spinAxes.x,
        item.rot[1] + time * spin * item.spinAxes.y,
        item.rot[2] + time * spin * item.spinAxes.z
      );

      // Base geometry scaling
      let baseFactor = 0.45;
      if (group.type === 'heart') baseFactor = 0.22;
      else if (group.type === 'star3d') baseFactor = 0.42;
      else if (group.type === 'giftbox') baseFactor = 0.40;

      const s = item.scale * baseFactor * ease;
      dummy.scale.set(s, s, s);

      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    mesh.visible = rawProgress > 0.01;
  });

  return (
    <instancedMesh
      key={`dec_${group.id}_${group.color}_${items.length}`}
      ref={meshRef}
      args={[geometry, material, items.length]}
      frustumCulled={false}
    />
  );
};

export const DecorationsField: React.FC<DecorationsFieldProps> = ({
  decorations = [],
  seed,
  cloudWidth,
  cloudHeight,
  cloudDepth,
  driftEnabled = true,
  driftSpeed = 0.35,
  globalDriftEnabled,
  globalSpeedMultiplier,
  isOpened,
  paused = false,
}) => {
  const activeGroups = useMemo(() => {
    return decorations.filter((d) => d.enabled);
  }, [decorations]);

  if (activeGroups.length === 0) return null;

  const isGloballyActive = globalDriftEnabled !== undefined ? globalDriftEnabled : driftEnabled;
  const multiplier = globalSpeedMultiplier !== undefined ? globalSpeedMultiplier : 1.0;

  return (
    <group>
      {activeGroups.map((group) => {
        const groupDriftEnabled = group.driftEnabled ?? true;
        const groupDriftSpeed = group.driftSpeed ?? (group.type === 'giftbox' ? 0.25 : driftSpeed);
        const effectiveSpeed = (isGloballyActive && groupDriftEnabled) ? groupDriftSpeed * multiplier : 0;

        return (
          <SingleDecorationGroupMesh
            key={group.id}
            group={group}
            seed={seed}
            cloudWidth={cloudWidth}
            cloudHeight={cloudHeight}
            cloudDepth={cloudDepth}
            driftEnabled={isGloballyActive && groupDriftEnabled && effectiveSpeed > 0}
            driftSpeed={effectiveSpeed}
            isOpened={isOpened}
            paused={paused}
          />
        );
      })}
    </group>
  );
};

export default DecorationsField;
