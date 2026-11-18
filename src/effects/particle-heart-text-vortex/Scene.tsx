import React, { useRef, useEffect } from 'react';
import type * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import type { EffectProps } from '../../effect-sdk';
import type { EffectConfig } from './config';
import { ParticleHeart3D } from './components/ParticleHeart3D';
import { VortexTextDisk } from './components/VortexTextDisk';
import { ConnectingStream } from './components/ConnectingStream';
import { StarDust } from './components/StarDust';

export const Scene: React.FC<EffectProps<EffectConfig>> = ({ config, runtime }) => {
  const rootGroupRef = useRef<THREE.Group>(null);
  const { viewport, controls, gl } = useThree();

  // Cấu hình OrbitControls để kiểm tra chiều sâu khi cần, nhưng mặc định giữ góc chính diện ổn định
  useEffect(() => {
    if (controls) {
      const oc = controls as any;
      oc.target.set(0, 0.05, 0); // Trọng tâm cân bằng giữa tim và đĩa
      oc.enableDamping = true;
      oc.dampingFactor = 0.06;
      oc.rotateSpeed = 0.85;
      oc.zoomSpeed = 0.9;
      oc.minDistance = 2.2;
      oc.maxDistance = 12.0;
      oc.maxPolarAngle = Math.PI / 2 + 0.35;
      oc.minPolarAngle = 0.15;
      oc.update();
    }

    if (gl.domElement) {
      gl.domElement.style.touchAction = 'none';
      gl.domElement.style.cursor = 'grab';

      const handleDown = () => {
        gl.domElement.style.cursor = 'grabbing';
      };
      const handleUp = () => {
        gl.domElement.style.cursor = 'grab';
      };

      gl.domElement.addEventListener('pointerdown', handleDown);
      window.addEventListener('pointerup', handleUp);

      return () => {
        gl.domElement.removeEventListener('pointerdown', handleDown);
        window.removeEventListener('pointerup', handleUp);
      };
    }
  }, [controls, gl]);

  // Căn khung responsive để không bao giờ cắt đầu tim hoặc mép đĩa dưới trên mọi khung hình
  // (536x750, 694x648, mobile dọc)
  const responsiveScale = React.useMemo(() => {
    const aspect = viewport.width / viewport.height;
    if (aspect < 0.75) {
      // Khung dọc mobile (536x750 ~ 0.71)
      return Math.min(1.0, aspect / 0.72) * 0.90;
    }
    // Khung studio hoặc màn hình ngang
    return 0.94;
  }, [viewport.width, viewport.height]);

  return (
    <group ref={rootGroupRef} scale={responsiveScale}>
      {/* 1. Lớp bụi sao mờ lấp lánh ở hậu cảnh */}
      <StarDust config={config} runtime={runtime} />

      {/* 2. Trái tim 3D hạt mịn phát sáng ở nửa trên (chấm nhỏ, không gai/lông) */}
      <ParticleHeart3D config={config} runtime={runtime} />

      {/* 3. Luồng ký tự và biểu tượng tản nhẹ từ chóp tim xuống tâm đĩa */}
      <ConnectingStream config={config} runtime={runtime} />

      {/* 4. Đế chữ xoay 3D dày dặn 10 vòng đồng tâm ở nửa dưới */}
      <VortexTextDisk config={config} runtime={runtime} />
    </group>
  );
};
