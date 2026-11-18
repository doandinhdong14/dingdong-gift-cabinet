import React, { useRef } from 'react';
import type * as THREE from 'three';
import { useEffectFrame, type EffectProps } from '../../effect-sdk';
import type { EffectConfig } from './config';

export const Scene: React.FC<EffectProps<EffectConfig>> = ({ config, runtime, emit }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const completionTriggeredRef = useRef<boolean>(false);

  useEffectFrame(runtime, ({ elapsedSeconds }) => {
    if (!meshRef.current) return;

    // Smooth deterministic rotation based on elapsed motion time and speed
    meshRef.current.rotation.y = elapsedSeconds * 1.5;
    meshRef.current.rotation.x = Math.sin(elapsedSeconds * 0.8) * 0.3;

    // Subtle breathing pulse
    const pulse = 1.0 + Math.sin(elapsedSeconds * 3.0) * 0.08 * config.intensity;
    meshRef.current.scale.setScalar(config.scale * pulse);

    // If an animation duration completes, emit event once per runId
    if (elapsedSeconds >= 4.0 && !completionTriggeredRef.current) {
      completionTriggeredRef.current = true;
      emit({
        type: 'complete',
        runId: runtime.runId,
        payload: { finishedAt: elapsedSeconds },
      });
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        onClick={() => {
          emit({
            type: 'interaction',
            name: 'mesh-click',
            payload: { timestamp: Date.now() },
          });
        }}
      >
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial
          color={config.color}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
};
