import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useEffectFrame, type EffectRuntime } from '../../../effect-sdk';
import type { EffectConfig } from '../config';

interface ConnectingStreamProps {
  config: EffectConfig;
  runtime: EffectRuntime;
}

interface StreamGlyph {
  char: string;
  isHeart: boolean;
  color: string;
  seedProgress: number;
  seedAngle: number;
  seedRadius: number;
  seedJitterX: number;
  seedJitterZ: number;
  scale: number;
  sprite: THREE.Sprite;
}

export const ConnectingStream: React.FC<ConnectingStreamProps> = ({ config, runtime }) => {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Ký tự và biểu tượng phong phú trong luồng nối
  const charPool = useMemo(() => {
    return [
      { char: 'a', isHeart: false },
      { char: 'n', isHeart: false },
      { char: 'h', isHeart: false },
      { char: 'y', isHeart: false },
      { char: 'e', isHeart: false },
      { char: 'u', isHeart: false },
      { char: '2', isHeart: false },
      { char: '0', isHeart: false },
      { char: '1', isHeart: false },
      { char: 'c', isHeart: false },
      { char: 'o', isHeart: false },
      { char: 'n', isHeart: false },
      { char: 'g', isHeart: false },
      { char: '❤', isHeart: true },
      { char: '💖', isHeart: true },
      { char: '💛', isHeart: true },
      { char: '✨', isHeart: true },
    ];
  }, []);

  // Tạo texture atlas sắc nét cho các ký tự rơi
  const glyphTextures = useMemo(() => {
    const map = new Map<string, THREE.CanvasTexture>();

    charPool.forEach((item) => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 128, 128);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (item.isHeart) {
          ctx.font = '60px sans-serif';
          ctx.shadowColor = config.heartGlowColor || '#ff4d8d';
          ctx.shadowBlur = 10;
          ctx.fillStyle = config.diskAccentColor || '#ff4d8d';
          ctx.fillText(item.char, 64, 68);
        } else {
          ctx.font = 'bold 60px "Segoe UI", Roboto, sans-serif';
          ctx.shadowColor = config.heartGlowColor || '#ff4d8d';
          ctx.shadowBlur = 8;
          ctx.fillStyle = '#ffffff';
          ctx.fillText(item.char, 64, 68);
        }
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      map.set(item.char, tex);
    });

    return map;
  }, [charPool, config.heartGlowColor, config.diskAccentColor]);

  // Tạo các Sprites ký tự rơi lững lờ
  const glyphs = useMemo<StreamGlyph[]>(() => {
    if (!config.streamEnabled) return [];

    const count = Math.min(60, Math.max(25, config.streamDensity ?? 45));
    const list: StreamGlyph[] = [];

    for (let i = 0; i < count; i++) {
      const poolItem = charPool[i % charPool.length];
      const tex = glyphTextures.get(poolItem.char);
      if (!tex) continue;

      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const sprite = new THREE.Sprite(mat);
      const scale = poolItem.isHeart ? 0.13 : 0.11;
      sprite.scale.set(scale, scale, 1.0);

      list.push({
        char: poolItem.char,
        isHeart: poolItem.isHeart,
        color: poolItem.isHeart ? config.diskAccentColor : '#ffffff',
        seedProgress: (i / count) + (Math.random() * 0.06 - 0.03),
        seedAngle: Math.random() * Math.PI * 2,
        seedRadius: 0.40 + Math.random() * 0.60,
        seedJitterX: (Math.random() - 0.5) * 0.16,
        seedJitterZ: (Math.random() - 0.5) * 0.16,
        scale,
        sprite,
      });
    }

    return list;
  }, [config.streamEnabled, config.streamDensity, charPool, glyphTextures, config.diskAccentColor]);

  // Gắn sprites vào group
  useEffect(() => {
    const grp = groupRef.current;
    if (!grp) return;

    glyphs.forEach((g) => grp.add(g.sprite));

    return () => {
      glyphs.forEach((g) => {
        grp.remove(g.sprite);
        g.sprite.material.dispose();
      });
    };
  }, [glyphs]);

  // Giải phóng textures
  useEffect(() => {
    return () => {
      glyphTextures.forEach((tex) => tex.dispose());
    };
  }, [glyphTextures]);

  // Hạt bụi sao li ti phụ trợ trong luồng nối
  const particleCount = 160;
  const particleSeeds = useMemo(() => {
    const seeds = [];
    for (let i = 0; i < particleCount; i++) {
      seeds.push({
        progress: i / particleCount,
        angle: Math.random() * Math.PI * 2,
        radius: 0.30 + Math.random() * 0.70,
        jitterX: (Math.random() - 0.5) * 0.14,
        jitterZ: (Math.random() - 0.5) * 0.14,
        isWhite: Math.random() < 0.35,
      });
    }
    return seeds;
  }, [particleCount]);

  const { particleGeometry, particlePositions } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const glow = new THREE.Color(config.heartGlowColor || '#ff4d8d');
    const white = new THREE.Color('#fff0f5');

    for (let i = 0; i < particleCount; i++) {
      const col = particleSeeds[i].isWhite ? white : glow;
      colors[i * 3 + 0] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return { particleGeometry: geo, particlePositions: positions };
  }, [particleCount, particleSeeds, config.heartGlowColor]);

  // Cập nhật toạ độ rơi liên tục trong vùng chuyển tiếp [yStart, yEnd]
  useEffectFrame(runtime, ({ elapsedSeconds }) => {
    if (!config.streamEnabled) return;

    const effectiveTime = runtime.reducedMotion ? elapsedSeconds * 0.1 : elapsedSeconds;
    const speed = config.streamSpeed * 0.16;

    // VÙNG RƠI CHUẨN XÁC:
    // Từ chóp nhọn của tim (yStart = -0.18) xuống tâm đĩa chữ (yEnd = -1.25)
    // Tuyệt đối không xâm lấn lên trên lòng khối tim
    const yStart = -0.18;
    const yEnd = -1.25;
    const yDist = yEnd - yStart;

    // 1. Cập nhật các ký tự
    glyphs.forEach((g) => {
      let p = (g.seedProgress + effectiveTime * speed) % 1.0;
      if (p < 0) p += 1.0;

      const y = yStart + yDist * p;

      // Độ rộng tản ngang chiếm khoảng 18–24% chiều rộng tim (chuẩn đặc tả người dùng)
      const funnelSpread = (0.09 + p * 0.28) * (config.streamSpread ?? 0.35);
      const r = funnelSpread * g.seedRadius;

      // Góc xoắn ốc chuyển động nhẹ nhàng
      const angle = g.seedAngle + p * 2.8 + effectiveTime * 0.55;
      const x = Math.cos(angle) * r + g.seedJitterX * Math.sin(p * Math.PI);
      const z = Math.sin(angle) * r * 0.75 + g.seedJitterZ * Math.sin(p * Math.PI);

      g.sprite.position.set(x, y, z);

      // Fade-in khi rời chóp tim và fade-out khi chạm đĩa
      const alpha = Math.pow(Math.sin(p * Math.PI), 0.85);
      g.sprite.material.opacity = alpha * 0.90;
    });

    // 2. Cập nhật hạt bụi sao li ti
    if (particlesRef.current) {
      for (let i = 0; i < particleCount; i++) {
        const seed = particleSeeds[i];
        let p = (seed.progress + effectiveTime * speed * 1.12) % 1.0;
        if (p < 0) p += 1.0;

        const y = yStart + yDist * p;
        const funnelSpread = (0.07 + p * 0.25) * (config.streamSpread ?? 0.35);
        const r = funnelSpread * seed.radius;
        const angle = seed.angle + p * 3.0 + effectiveTime * 0.65;

        particlePositions[i * 3 + 0] = Math.cos(angle) * r + seed.jitterX * Math.sin(p * Math.PI);
        particlePositions[i * 3 + 1] = y;
        particlePositions[i * 3 + 2] = Math.sin(angle) * r * 0.75 + seed.jitterZ * Math.sin(p * Math.PI);
      }

      particleGeometry.attributes.position.needsUpdate = true;
    }
  });

  if (!config.streamEnabled) return null;

  return (
    <group ref={groupRef}>
      <points ref={particlesRef} geometry={particleGeometry}>
        <pointsMaterial
          size={0.026}
          vertexColors={true}
          transparent={true}
          opacity={0.75}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};
