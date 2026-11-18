import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { createFlyingPetalGeometry } from './roseGeometry';
import { FlyingPetalData } from './types';

export interface FlyingPetalsProps {
  active: boolean;
  flightProgress: number; // 0 to 1 across the flying phase
  count?: number;
  burstSpeed?: number;
  fallSpeed?: number;
  spinSpeed?: number;
  petalColor: string;
  petalInnerColor: string;
  petalEdgeColor: string;
  flowerScale?: number;
}

function createPseudoRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const FlyingPetals: React.FC<FlyingPetalsProps> = ({
  active,
  flightProgress,
  count = 55,
  burstSpeed = 1.6,
  fallSpeed = 0.75,
  spinSpeed = 1.6,
  petalColor,
  petalInnerColor,
  petalEdgeColor,
  flowerScale = 1.0,
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Single shared 3D curved petal geometry for all instances: delicate, spoon-shaped
  const geometry = useMemo(() => {
    return createFlyingPetalGeometry(0.28, 0.38, petalInnerColor, petalColor, petalEdgeColor);
  }, [petalInnerColor, petalColor, petalEdgeColor]);

  // Satin double-sided material
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.42,
      metalness: 0.04,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.96,
      depthWrite: true,
    });
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  // Precompute deterministic particle parameters once per count/speed change
  const particles = useMemo<FlyingPetalData[]>(() => {
    const rng = createPseudoRandom(2026);
    const list: FlyingPetalData[] = [];

    for (let i = 0; i < count; i++) {
      // Spawn time staggered across early burst
      const spawnTime = rng() * 0.65;

      // Spawn position around the flower head
      const spawnAngle = rng() * Math.PI * 2;
      const spawnRadius = 0.10 + rng() * 0.30;
      const x0 = Math.cos(spawnAngle) * spawnRadius * flowerScale;
      const y0 = (0.35 + rng() * 0.55) * flowerScale;
      const z0 = Math.sin(spawnAngle) * spawnRadius * flowerScale;

      // Initial burst velocity: upward + outward + forward towards viewer
      const burstAngle = spawnAngle + (rng() - 0.5) * 0.4;
      const horizSpeed = (0.6 + rng() * 1.2) * burstSpeed;
      const vx = Math.cos(burstAngle) * horizSpeed;
      // Upward thrust
      const vy = (1.2 + rng() * 1.5) * burstSpeed;
      // Gentle forward bias (+Z)
      const vzBias = rng() < 0.6 ? 0.8 : -0.2;
      const vz = (Math.sin(burstAngle) * 0.5 + vzBias * (0.6 + rng() * 0.9)) * burstSpeed;

      // Terminal downward fall speed
      const particleFall = (0.5 + rng() * 0.5) * fallSpeed;

      // Tumbling rotation speeds
      const rotSpeedX = (rng() - 0.5) * 3.8 * spinSpeed;
      const rotSpeedY = (rng() - 0.5) * 3.4 * spinSpeed;
      const rotSpeedZ = (rng() - 0.5) * 2.8 * spinSpeed;

      const initialRotX = rng() * Math.PI * 2;
      const initialRotY = rng() * Math.PI * 2;
      const initialRotZ = rng() * Math.PI * 2;

      // Delicate natural scales (no gigantic shreds)
      const tierRand = rng();
      let scale = 1.0;
      if (tierRand < 0.25) {
        // Foreground
        scale = 1.0 + rng() * 0.25;
      } else if (tierRand < 0.75) {
        // Midground
        scale = 0.75 + rng() * 0.25;
      } else {
        // Distant background
        scale = 0.50 + rng() * 0.20;
      }

      list.push({
        spawnTime,
        x0,
        y0,
        z0,
        vx,
        vy,
        vz,
        fallSpeed: particleFall,
        rotSpeedX,
        rotSpeedY,
        rotSpeedZ,
        initialRotX,
        initialRotY,
        initialRotZ,
        scale: scale * flowerScale,
        phase: rng() * Math.PI * 2,
      });
    }

    return list;
  }, [count, burstSpeed, fallSpeed, spinSpeed, flowerScale]);

  // Reusable math objects
  const dummyMatrix = useMemo(() => new THREE.Matrix4(), []);
  const dummyPos = useMemo(() => new THREE.Vector3(), []);
  const dummyQuat = useMemo(() => new THREE.Quaternion(), []);
  const dummyEuler = useMemo(() => new THREE.Euler(), []);
  const dummyScale = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    if (!active || flightProgress <= 0) {
      dummyScale.set(0, 0, 0);
      dummyMatrix.makeScale(0, 0, 0);
      for (let i = 0; i < count; i++) {
        mesh.setMatrixAt(i, dummyMatrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      return;
    }

    const totalDuration = 3.6;
    const elapsed = flightProgress * totalDuration;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const localT = elapsed - p.spawnTime;

      if (localT <= 0) {
        dummyScale.set(0, 0, 0);
        dummyMatrix.makeScale(0, 0, 0);
        mesh.setMatrixAt(i, dummyMatrix);
        continue;
      }

      // 1. Aerodynamic drag on initial burst: v(t) = v0 * e^(-k*t)
      const dragK = 1.7;
      const burstFactor = (1 - Math.exp(-dragK * localT)) / dragK;

      // 2. Gentle sway and curl from air turbulence
      const windSwayX = Math.sin(localT * 2.0 + p.phase) * 0.30;
      const windSwayZ = Math.cos(localT * 1.6 + p.phase) * 0.20;

      // 3. Downward gravity drift kicking in smoothly
      const fallDistance = p.fallSpeed * Math.max(0, localT - 0.22);

      const x = p.x0 + p.vx * burstFactor + windSwayX;
      const y = p.y0 + p.vy * burstFactor - fallDistance;
      const z = p.z0 + p.vz * burstFactor + windSwayZ;
      dummyPos.set(x, y, z);

      // 4. Multi-axis tumbling rotation
      dummyEuler.set(
        p.initialRotX + p.rotSpeedX * localT,
        p.initialRotY + p.rotSpeedY * localT,
        p.initialRotZ + p.rotSpeedZ * localT
      );
      dummyQuat.setFromEuler(dummyEuler);

      // 5. Scale lifecycle: pop in fast, stay, then dissolve at end of transition
      let currentScale = p.scale;
      if (localT < 0.20) {
        currentScale *= localT / 0.20;
      }
      const timeLeft = totalDuration - elapsed;
      if (timeLeft < 0.8) {
        currentScale *= Math.max(0, timeLeft / 0.8);
      }

      dummyScale.set(currentScale, currentScale, currentScale);
      dummyMatrix.compose(dummyPos, dummyQuat, dummyScale);
      mesh.setMatrixAt(i, dummyMatrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      frustumCulled={false}
      castShadow
    />
  );
};
