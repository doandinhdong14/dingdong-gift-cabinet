import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useEffectFrame, type EffectRuntime } from '../../../effect-sdk';
import type { EffectConfig } from '../config';

interface StarDustProps {
  config: EffectConfig;
  runtime: EffectRuntime;
}

export const StarDust: React.FC<StarDustProps> = ({ config, runtime }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  const { geometry } = useMemo(() => {
    const count = config.starDustCount;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const white = new THREE.Color('#ffffff');
    const faintPink = new THREE.Color('#ffe4e6');
    const faintPurple = new THREE.Color('#ede9fe');

    for (let i = 0; i < count; i++) {
      // Bụi sao phân bố rộng ở hậu cảnh phía sau
      positions[i * 3 + 0] = (Math.random() - 0.5) * 14.0;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14.0;
      positions[i * 3 + 2] = -3.0 - Math.random() * 6.0; // Z sâu từ -3 đến -9

      // Màu sắc dịu nhẹ
      const u = Math.random();
      const col = u < 0.6 ? white : u < 0.85 ? faintPink : faintPurple;
      colors[i * 3 + 0] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return { geometry: geo };
  }, [config.starDustCount]);

  // Hiệu ứng lấp lánh nhẹ nhàng mờ ảo ở hậu cảnh
  useEffectFrame(runtime, ({ elapsedSeconds }) => {
    if (!materialRef.current || !config.starDustEnabled) return;

    // Lấp lánh chậm rãi
    const t = runtime.reducedMotion ? 0 : elapsedSeconds * 1.2;
    const pulse = 0.4 + 0.15 * Math.sin(t);
    materialRef.current.opacity = pulse;
  });

  if (!config.starDustEnabled) return null;

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        ref={materialRef}
        size={0.045}
        vertexColors={true}
        transparent={true}
        opacity={0.4}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
