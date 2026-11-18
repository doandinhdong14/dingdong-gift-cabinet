import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useEffectFrame, wrapRange, type EffectProps } from '../../effect-sdk';
import type { EffectConfig } from './config';

export const Scene: React.FC<EffectProps<EffectConfig>> = ({ config, runtime, emit }) => {
  const count = 60;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Pre-generate stable positions and colors for confetti
  const particles = useMemo(() => {
    const list = [];
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    for (let i = 0; i < count; i++) {
      list.push({
        x: (Math.random() - 0.5) * 8,
        initialY: (Math.random() - 0.5) * 8,
        z: (Math.random() - 0.5) * 4,
        speedY: 1.0 + Math.random() * 1.5,
        rotSpeedX: 2.0 + Math.random() * 3.0,
        rotSpeedY: 1.5 + Math.random() * 2.5,
        color: new THREE.Color(colors[i % colors.length]),
      });
    }
    return list;
  }, [count]);

  // Set instance colors once
  React.useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < count; i++) {
      meshRef.current.setColorAt(i, particles[i].color);
    }
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [particles, count]);

  useEffectFrame(runtime, ({ elapsedSeconds }) => {
    if (!meshRef.current) return;

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      // Continuous fall with smooth wrap between -4 and +4
      const y = wrapRange(p.initialY - elapsedSeconds * p.speedY * config.speed, -4, 4);

      dummy.position.set(p.x, y, p.z);
      dummy.rotation.set(
        elapsedSeconds * p.rotSpeedX,
        elapsedSeconds * p.rotSpeedY,
        0
      );
      dummy.scale.set(0.12 * config.scale, 0.22 * config.scale, 0.02);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group
      onClick={() => {
        emit({
          type: 'interaction',
          name: 'confetti-burst',
          payload: { timestamp: Date.now() },
        });
      }}
    >
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, count]}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          roughness={0.4}
          metalness={0.2}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
    </group>
  );
};
