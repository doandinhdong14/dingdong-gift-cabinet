import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useEffectFrame, type EffectRuntime } from '../../../effect-sdk';
import type { EffectConfig } from '../config';

interface VortexTextDiskProps {
  config: EffectConfig;
  runtime: EffectRuntime;
}

interface RingLayer {
  radius: number;
  height: number;
  speed: number;
  direction: number;
  meshRef: React.RefObject<THREE.Mesh | null>;
  texture: THREE.CanvasTexture;
  yOffset: number;
}

export const VortexTextDisk: React.FC<VortexTextDiskProps> = ({ config, runtime }) => {
  const groupRef = useRef<THREE.Group>(null);
  const coreParticlesRef = useRef<THREE.Points>(null);

  // 10 câu thông điệp phong phú phủ đều 10 vòng quỹ đạo (chuẩn video gốc)
  const ringTexts = useMemo(() => {
    return [
      'Công chúa của anh   💕   vui vẻ với món quà tuyệt nhất   💕   ',
      'Mừng ngày 20/10   💖   Người con gái tuyệt nhất của anh   💖   ',
      'yêu em nhiều lắm   💕   chúc em luôn ngập tràn tiếng cười   💕   ',
      'Luôn xinh đẹp và hạnh phúc   💛   công chúa nhỏ   💛   ',
      'Mãi mãi bên nhau   💕   yêu thương đong đầy   💕   ',
      '20/10 ngọt ngào   💖   dành trọn cho em   💖   ',
      'Nụ cười của em là ánh sáng   💛   yêu em vô cùng   💛   ',
      'Hạnh phúc mỗi ngày   💕   bên em mãi mãi   💕   ',
      'yêu em   ✨   công chúa của anh   ✨   ',
      '20/10   💖   yêu em   💖   ',
    ];
  }, []);

  // Chiều cao vành đĩa chuẩn để chữ to, rõ nét, dễ đọc
  const ringHeight = 0.086;

  // 10 quỹ đạo đồng tâm dày dặn, khoảng cách gần nhau (~0.13), có chênh cao tạo độ sâu hình phễu/đĩa trũng
  const ringParams = useMemo(() => {
    const baseR = config.diskRadius ?? 1.55;
    const ringCount = Math.min(12, Math.max(6, config.diskRingCount ?? 10));
    const list = [];

    const minR = 0.36;
    const maxR = baseR;

    for (let i = 0; i < ringCount; i++) {
      // Bán kính từ ngoài vào trong
      const frac = i / (ringCount - 1);
      const radius = maxR - frac * (maxR - minR);

      // Chênh cao nhẹ giữa các vòng: vòng ngoài cao hơn, vòng trong trũng dần xuống tạo độ sâu 3D
      const yOffset = -0.075 * Math.pow(frac, 1.25);

      // Tốc độ và chiều quay so le độc lập
      const speed = 0.20 + 0.045 * (ringCount - i);
      const direction = i % 2 === 0 ? 1 : -1;

      list.push({ radius, yOffset, speed, direction });
    }

    return list;
  }, [config.diskRadius, config.diskRingCount]);

  // Tạo texture chữ độ nét cao cho từng vành đĩa với chuẩn tỷ lệ 1:1
  const ringLayers = useMemo<RingLayer[]>(() => {
    const canvasW = 2048;
    const canvasH = 112;
    const canvasAspect = canvasW / canvasH;

    return ringParams.map((param, index) => {
      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d');

      const phrase = ringTexts[index % ringTexts.length];

      if (ctx) {
        ctx.clearRect(0, 0, canvasW, canvasH);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';

        // Font chữ tiếng Việt sắc nét, rõ ràng
        ctx.font = 'bold 54px "Segoe UI", Roboto, "Helvetica Neue", sans-serif';

        // Chuỗi chữ điền kín canvas 2048px liền mạch
        const measured = ctx.measureText(phrase).width;
        const repeatCount = Math.max(1, Math.ceil(canvasW / measured) + 1);

        for (let j = 0; j < repeatCount; j++) {
          const offsetX = j * measured;

          // Viền phát quang hồng rực rỡ
          ctx.shadowColor = config.diskAccentColor || '#ff4d8d';
          ctx.shadowBlur = 12;
          ctx.fillStyle = config.diskTextColor || '#fff5fa';

          ctx.fillText(phrase, offsetX, canvasH / 2);
        }
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;

      // Chuẩn hoá tỷ lệ lặp texture theo chu vi thực tế để chữ không bị kéo dẹt
      const circ = 2 * Math.PI * param.radius;
      const geomAspect = circ / ringHeight;
      const repeatX = Math.max(1, Math.round(geomAspect / canvasAspect));

      texture.repeat.set(repeatX, 1);
      texture.needsUpdate = true;

      return {
        radius: param.radius,
        height: ringHeight,
        speed: param.speed,
        direction: param.direction,
        meshRef: React.createRef<THREE.Mesh>(),
        texture,
        yOffset: param.yOffset,
      };
    });
  }, [ringParams, ringTexts, config.diskAccentColor, config.diskTextColor, ringHeight]);

  // Dọn dẹp textures khi unmount
  useEffect(() => {
    return () => {
      ringLayers.forEach((l) => l.texture.dispose());
    };
  }, [ringLayers]);

  // Bụi kim tuyến và ký tự nhỏ xoáy ở tâm đĩa (Core Vortex)
  const coreParticleCount = 140;
  const { coreGeo, corePos, coreSeeds } = useMemo(() => {
    const pos = new Float32Array(coreParticleCount * 3);
    const col = new Float32Array(coreParticleCount * 3);
    const seeds: { r: number; angle: number; speed: number; y: number }[] = [];

    const colGlow = new THREE.Color(config.diskAccentColor || '#ff4d8d');
    const colWhite = new THREE.Color('#ffffff');
    const colGold = new THREE.Color('#ffe082');

    for (let i = 0; i < coreParticleCount; i++) {
      const r = 0.08 + Math.random() * 0.28;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 1.5;
      const y = (Math.random() - 0.5) * 0.06 - 0.07;

      seeds.push({ r, angle, speed, y });

      pos[i * 3 + 0] = Math.cos(angle) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * r;

      const rand = Math.random();
      const c = rand < 0.2 ? colWhite : rand < 0.4 ? colGold : colGlow;
      col[i * 3 + 0] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    return { coreGeo: geo, corePos: pos, coreSeeds: seeds };
  }, [coreParticleCount, config.diskAccentColor]);

  // Cập nhật quay độc lập cho từng vòng chữ và bụi kim tuyến tâm đĩa
  useEffectFrame(runtime, ({ elapsedSeconds }) => {
    if (!groupRef.current) return;

    const t = runtime.reducedMotion ? 0 : elapsedSeconds;
    const speedMult = config.diskSpeed;

    ringLayers.forEach((layer) => {
      if (layer.meshRef.current) {
        layer.meshRef.current.rotation.y = t * layer.speed * layer.direction * speedMult;
      }
    });

    if (coreParticlesRef.current) {
      for (let i = 0; i < coreParticleCount; i++) {
        const s = coreSeeds[i];
        const curAngle = s.angle + t * s.speed * speedMult;
        corePos[i * 3 + 0] = Math.cos(curAngle) * s.r;
        corePos[i * 3 + 1] = s.y;
        corePos[i * 3 + 2] = Math.sin(curAngle) * s.r;
      }
      coreGeo.attributes.position.needsUpdate = true;
    }
  });

  // Vị trí đĩa: đặt ở phía dưới, căn chuẩn để không chạm mép đáy khung hình
  const diskPosY = -1.35;

  return (
    <group
      ref={groupRef}
      position={[0, diskPosY, 0]}
      rotation={[0.44, 0, 0]} // Độ nghiêng phối cảnh ~25 độ nhìn nghiêng mặt elip sang trọng
    >
      {ringLayers.map((layer, idx) => (
        <mesh key={idx} ref={layer.meshRef} position={[0, layer.yOffset, 0]}>
          <cylinderGeometry
            args={[layer.radius, layer.radius, layer.height, 64, 1, true]}
          />
          <meshBasicMaterial
            map={layer.texture}
            transparent={true}
            opacity={0.94}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      {/* Bụi sáng xoáy ở mắt tâm đĩa */}
      <points ref={coreParticlesRef} geometry={coreGeo}>
        <pointsMaterial
          size={0.028}
          vertexColors={true}
          transparent={true}
          opacity={0.85}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};
