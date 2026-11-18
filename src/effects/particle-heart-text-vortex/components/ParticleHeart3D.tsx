import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useEffectFrame, type EffectRuntime } from '../../../effect-sdk';
import type { EffectConfig } from '../config';

interface ParticleHeart3DProps {
  config: EffectConfig;
  runtime: EffectRuntime;
}

// Phương trình 3D Taubin Heart chuẩn toán học:
// f(x, y, z) = (x^2 + 2.25*y^2 + z^2 - 1)^3 - x^2 * z^3 - 0.1125 * y^2 * z^3 <= 0
// Toạ độ Three.js: X = x (ngang), Y = z (cao), Z = y (chiều sâu)
function evaluateTaubin(x: number, y: number, z: number): number {
  const a = x * x + 2.25 * y * y + z * z - 1.0;
  return a * a * a - x * x * z * z * z - 0.1125 * y * y * z * z * z;
}

// Tạo texture chấm sáng tròn mịn màng phát quang (lõi sáng tròn, viền mờ Gaussian)
function createFineDotTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    // Lõi sáng tròn dịu nhẹ (1-2px)
    grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.18, 'rgba(255, 225, 245, 0.95)');
    grad.addColorStop(0.42, 'rgba(255, 95, 175, 0.65)');
    grad.addColorStop(0.70, 'rgba(230, 40, 140, 0.22)');
    grad.addColorStop(1.0, 'rgba(190, 20, 110, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

interface HeartParticleData {
  baseX: number;
  baseY: number;
  baseZ: number;
  jitterX: number;
  jitterY: number;
  jitterZ: number;
  speed: number;
  phase: number;
  baseAlpha: number;
  color: THREE.Color;
}

export const ParticleHeart3D: React.FC<ParticleHeart3DProps> = ({ config, runtime }) => {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);

  const dotTexture = useMemo(() => createFineDotTexture(), []);

  // Số lượng hạt mịn phát sáng (chất lượng cao: 13500 hạt mịn)
  const effectiveCount = useMemo(() => {
    let count = config.heartParticleCount ?? 13500;
    if (runtime.quality === 'low') count = Math.round(count * 0.45);
    else if (runtime.quality === 'medium') count = Math.round(count * 0.75);
    return Math.max(4000, Math.min(25000, count));
  }, [config.heartParticleCount, runtime.quality]);

  // Sinh phân bố điểm thể tích 3D bằng Rejection Sampling đồng đều tuyệt đối
  // KHÔNG dùng tia, KHÔNG dùng LineSegments, KHÔNG có 2 con mắt xoáy rỗng
  const heartData = useMemo(() => {
    const baseScale = 1.14;
    const yCenterOffset = 0.82; // Đặt tim ở nửa trên màn hình

    const particles: HeartParticleData[] = [];

    // Bảng màu hồng tím/hồng nhạt theo video gốc, trắng chỉ làm điểm xuyết tinh tế
    const colDeepMagenta = new THREE.Color(config.heartPrimaryColor || '#ff2d7a'); // Hồng sen rực rỡ
    const colSoftPink = new THREE.Color(config.heartGlowColor || '#f472b6');       // Hồng phấn
    const colChampagne = new THREE.Color('#ffe082');                              // Ánh vàng champagne nhẹ
    const colGlitterWhite = new THREE.Color('#ffffff');                           // Trắng lấp lánh

    let attempts = 0;
    const maxAttempts = effectiveCount * 10;

    while (particles.length < effectiveCount && attempts < maxAttempts) {
      attempts++;
      // Bounding box chuẩn của khối Taubin 3D heart
      const rx = (Math.random() - 0.5) * 2.5; // [-1.25, 1.25]
      const ry = (Math.random() - 0.5) * 1.4; // [-0.70, 0.70] (chiều sâu Z)
      const rz = Math.random() * 2.35 - 1.05; // [-1.05, 1.30] (chiều cao Y)

      const val = evaluateTaubin(rx, ry, rz);
      if (val <= 0.0) {
        // 70% hạt phân bố gần bề mặt (shell) để đường bao cong mềm sắc nét, 30% hạt trải trong lòng thể tích
        const isShell = val > -0.18;
        if (!isShell && Math.random() < 0.35) {
          // Điều tiết mật độ lòng tim để giữ khe tối xuyên thấu, không bị mờ đặc
          continue;
        }

        // Chọn màu sắc hạt
        const randType = Math.random();
        let pColor: THREE.Color;
        let pAlpha: number;

        if (randType < 0.08) {
          // 8% điểm trắng lấp lánh tinh tế
          pColor = colGlitterWhite;
          pAlpha = 0.95;
        } else if (randType < 0.18) {
          // 10% điểm ánh vàng nhạt champagne
          pColor = colChampagne;
          pAlpha = 0.85;
        } else if (randType < 0.48) {
          // 30% hồng phấn phát quang
          pColor = colSoftPink.clone().lerp(colGlitterWhite, 0.25);
          pAlpha = isShell ? 0.85 : 0.65;
        } else {
          // 52% hồng sen / tím cánh sen ngọt ngào
          pColor = colDeepMagenta.clone().lerp(colSoftPink, Math.random() * 0.4);
          pAlpha = isShell ? 0.80 : 0.60;
        }

        // Vector dao động vi mô tại chỗ ngẫu nhiên
        const jAng = Math.random() * Math.PI * 2;
        const jPitch = (Math.random() - 0.5) * Math.PI;

        particles.push({
          baseX: rx * baseScale,
          baseY: rz * baseScale + yCenterOffset,
          baseZ: ry * baseScale,
          jitterX: Math.cos(jAng) * Math.cos(jPitch),
          jitterY: Math.sin(jPitch),
          jitterZ: Math.sin(jAng) * Math.cos(jPitch),
          speed: 1.2 + Math.random() * 2.8,
          phase: Math.random() * Math.PI * 2.0,
          baseAlpha: pAlpha,
          color: pColor,
        });
      }
    }

    const count = particles.length;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      positions[i * 3 + 0] = p.baseX;
      positions[i * 3 + 1] = p.baseY;
      positions[i * 3 + 2] = p.baseZ;

      colors[i * 3 + 0] = p.color.r;
      colors[i * 3 + 1] = p.color.g;
      colors[i * 3 + 2] = p.color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return {
      particles,
      geometry,
      positions,
      count,
    };
  }, [
    effectiveCount,
    config.heartPrimaryColor,
    config.heartGlowColor,
  ]);

  // Cập nhật dao động vi mô tại chỗ và nhịp phồng-thu nhẹ (~2% biên độ, chu kỳ ~3s)
  useEffectFrame(runtime, ({ elapsedSeconds }) => {
    if (!groupRef.current || !pointsRef.current) return;

    const t = runtime.reducedMotion ? 0 : elapsedSeconds;
    const pulseSpeed = config.heartPulseSpeed ?? 0.7;
    const pulseAmp = config.heartPulseAmplitude ?? 0.02;

    // Nhịp tim tự nhiên rất khẽ (Lub-Dub ~2% biên độ, chu kỳ ~3s)
    const beat = Math.sin(t * pulseSpeed * 2.1) * 0.75 + Math.sin(t * pulseSpeed * 4.2 + 0.35) * 0.25;
    const currentScale = config.heartScale * (1.0 + pulseAmp * beat);

    // Co giãn nhẹ nhàng quanh trọng tâm [0, 0.82, 0]
    groupRef.current.scale.set(currentScale, currentScale, currentScale);

    // Dao động vi mô tại chỗ của từng hạt mịn (biến thiên trơn theo thời gian, không phá vỡ đường bao)
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;

    const { particles, count } = heartData;
    const jitterMult = 0.012 * (config.heartJitterStrength ?? 1.0);

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      // Dao động điều hoà trơn tru, không sinh ra vệt dài hay kéo sợi
      const wave = Math.sin(t * p.speed + p.phase) * jitterMult + Math.cos(t * p.speed * 1.7 + p.phase * 2) * (jitterMult * 0.5);

      posArr[i * 3 + 0] = p.baseX + p.jitterX * wave;
      posArr[i * 3 + 1] = p.baseY + p.jitterY * wave;
      posArr[i * 3 + 2] = p.baseZ + p.jitterZ * wave;
    }

    posAttr.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      {/* Khối hạt mịn 3D tinh khiết dạng Points: không gai, không sợi, không vệt nứt */}
      <points ref={pointsRef} geometry={heartData.geometry}>
        <pointsMaterial
          size={0.038 * (config.heartParticleSize ?? 1.2)}
          map={dotTexture}
          vertexColors={true}
          transparent={true}
          opacity={0.88 * (config.heartCoreBrightness ?? 1.0)}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};
