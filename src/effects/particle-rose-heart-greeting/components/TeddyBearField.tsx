import React, { useEffect, useRef } from 'react';
import type { ParticleRoseHeartConfig } from '../config';
import { createPrng } from './ParticleEngine';

export interface TeddyBearFieldProps {
  config: ParticleRoseHeartConfig;
  opacity: number;
  time: number;
  isPaused: boolean;
  width: number;
  height: number;
}

interface BearInstance {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rot: number;
  rotSpeed: number;
  scale: number;
  assetIdx: number;
  opacity: number;
  tier: 'NEAR' | 'MID' | 'FAR';
}

interface StarDust {
  x: number;
  y: number;
  size: number;
  alpha: number;
  twinkleSpeed: number;
}

export const TeddyBearField: React.FC<TeddyBearFieldProps> = ({
  config,
  opacity,
  isPaused,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bearsRef = useRef<BearInstance[]>([]);
  const stardustRef = useRef<StarDust[]>([]);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const prngRef = useRef(createPrng(config.particleSeed + 777));
  const lastTimeRef = useRef(performance.now());

  // Load and cache bear images
  useEffect(() => {
    const assets = config.bearAssets || [];
    const loadedImgs: HTMLImageElement[] = [];

    assets.forEach((src) => {
      const img = new Image();
      img.src = src;
      loadedImgs.push(img);
    });

    imagesRef.current = loadedImgs;
  }, [config.bearAssets]);

  // Initialize bear population & stardust
  useEffect(() => {
    const prng = createPrng(config.particleSeed + 777);
    prngRef.current = createPrng(config.particleSeed + 999);
    const count = Math.max(40, config.bearCount || 42); // Dense, rich population matching reference video
    const bears: BearInstance[] = [];

    const fov = 340;
    const speedMult = config.bearSpeed || 1.0;

    for (let i = 0; i < count; i++) {
      let tier: 'NEAR' | 'MID' | 'FAR' = 'MID';
      let z = 150;
      let scale = 1.0;
      let vz = -85;

      if (i < 8) {
        // Foreground Near Bears (large, close, fast)
        tier = 'NEAR';
        z = 15 + prng() * 85;
        scale = 1.5 + prng() * 0.7;
        vz = -(110 + prng() * 50) * speedMult;
      } else if (i < 24) {
        // Midground Bears (medium, distributed across screen)
        tier = 'MID';
        z = 100 + prng() * 190;
        scale = 0.95 + prng() * 0.4;
        vz = -(75 + prng() * 35) * speedMult;
      } else {
        // Deep Space Background Bears (small, slow, atmospheric)
        tier = 'FAR';
        z = 290 + prng() * 320;
        scale = 0.5 + prng() * 0.35;
        vz = -(45 + prng() * 25) * speedMult;
      }

      const spread = (fov + z) / fov;

      bears.push({
        x: (prng() - 0.5) * width * 1.15 * spread,
        y: (prng() - 0.5) * height * 1.15 * spread,
        z,
        vx: (prng() - 0.5) * 20,
        vy: (prng() - 0.5) * 20,
        vz,
        rot: (prng() - 0.5) * 35,
        rotSpeed: (prng() - 0.5) * 16,
        scale,
        assetIdx: prng() < 0.65 ? 0 : 1, // 65% bouquet bears, 35% flying bears
        opacity: Math.min(1.0, (650 - z) / 160),
        tier,
      });
    }

    bearsRef.current = bears;

    // Ambient floating stardust
    const stardust: StarDust[] = [];
    for (let j = 0; j < 90; j++) {
      stardust.push({
        x: prng() * width,
        y: prng() * height,
        size: 0.8 + prng() * 1.6,
        alpha: 0.2 + prng() * 0.6,
        twinkleSpeed: 1.5 + prng() * 3.0,
      });
    }
    stardustRef.current = stardust;
  }, [config.bearCount, config.bearSpeed, config.particleSeed, width, height]);

  // Main 3D simulation loop
  useEffect(() => {
    let animId: number;

    const renderLoop = (now: number) => {
      animId = requestAnimationFrame(renderLoop);

      const deltaMs = now - lastTimeRef.current;
      lastTimeRef.current = now;
      const deltaSec = Math.min(deltaMs / 1000, 0.1);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Always clear canvas first to prevent ghost frames when opacity drops
      ctx.clearRect(0, 0, width, height);

      if (isPaused || opacity <= 0.005) return;

      const fov = 340;
      const cx = width * 0.5;
      const cy = height * 0.46;
      const images = imagesRef.current;
      const bears = bearsRef.current;
      const stardust = stardustRef.current;
      const prng = prngRef.current;

      // 1. Render ambient twinkling stardust
      ctx.save();
      for (const s of stardust) {
        const tw = 0.5 + Math.sin(now * 0.003 * s.twinkleSpeed) * 0.5;
        ctx.globalAlpha = s.alpha * tw * opacity;
        ctx.fillStyle = '#ffb3d9';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 2. Update bear physics and depth
      for (const b of bears) {
        b.z += b.vz * deltaSec;
        b.x += b.vx * deltaSec;
        b.y += b.vy * deltaSec;
        b.rot += b.rotSpeed * deltaSec;

        // Recycle bear when passing camera (z < -50)
        if (b.z < -50) {
          b.z = 520 + prng() * 150;
          const spread = (fov + b.z) / fov;
          b.x = (prng() - 0.5) * width * 1.15 * spread;
          b.y = (prng() - 0.5) * height * 1.15 * spread;
          b.rot = (prng() - 0.5) * 35;
          b.rotSpeed = (prng() - 0.5) * 16;
          b.assetIdx = prng() < 0.65 ? 0 : 1;
        }

        b.opacity = Math.max(0, Math.min(1.0, (650 - b.z) / 160));
      }

      // Depth sort: furthest drawn first, nearest drawn last
      bears.sort((a, b) => b.z - a.z);

      // 3. Render 3D projected bears
      ctx.save();
      for (const b of bears) {
        if (b.z <= -fov) continue;

        const pScale = fov / (fov + b.z);
        const screenX = cx + b.x * pScale;
        const screenY = cy + b.y * pScale;

        // Skip if way outside screen
        if (screenX < -160 || screenX > width + 160 || screenY < -160 || screenY > height + 160) {
          continue;
        }

        const img = images[b.assetIdx] || images[0];
        if (!img || !img.complete || img.naturalWidth === 0) continue;

        const baseW = b.assetIdx === 0 ? 84 : 74;
        const baseH = b.assetIdx === 0 ? 110 : 74;
        const drawW = baseW * b.scale * pScale;
        const drawH = baseH * b.scale * pScale;

        ctx.save();
        ctx.globalAlpha = b.opacity * opacity;
        ctx.translate(screenX, screenY);

        // Organic gentle floating tilt wobble
        const wobble = Math.sin(now * 0.0022 + b.scale * 5) * 8;
        ctx.rotate(((b.rot + wobble) * Math.PI) / 180);

        ctx.drawImage(img, -drawW * 0.5, -drawH * 0.5, drawW, drawH);
        ctx.restore();
      }
      ctx.restore();
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, opacity, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 6,
      }}
    />
  );
};
