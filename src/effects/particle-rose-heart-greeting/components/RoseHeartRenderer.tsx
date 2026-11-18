import React, { useMemo } from 'react';
import type { ParticleRoseHeartConfig } from '../config';
import { createPrng } from './ParticleEngine';

export interface RoseHeartRendererProps {
  config: ParticleRoseHeartConfig;
  bloomProgress: number; // 0.0 to 1.0 during Phase E
  opacity: number; // Overall visibility of the rose heart
  time: number;
  width: number;
  height: number;
  debugMode?: 'SHOW_SINGLE_ROSE' | 'SHOW_ROSE_CLUSTER' | 'SHOW_HEART';
}

interface RoseItem {
  id: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  assetIdx: number;
  bloomDelay: number;
  depth: number;
}

export const RoseHeartRenderer: React.FC<RoseHeartRendererProps> = ({
  config,
  bloomProgress,
  opacity,
  time,
  width,
  height,
  debugMode = 'SHOW_HEART',
}) => {
  // Generate deterministic packed rose positions inside the mathematical heart shape
  const roses: RoseItem[] = useMemo(() => {
    const prng = createPrng(config.particleSeed + 999);
    const count = config.roseCount || 48; // Calibrated 40-50 large distinct roses
    const items: RoseItem[] = [];

    const cx = width * 0.5;
    const cy = height * 0.42;

    // Aspect-calibrated scale: 72-73% width (~256px), 30% height (~220px) on 354x738
    const scaleX = 7.9 * (config.heartScale || 1.0);
    const scaleY = 9.2 * (config.heartScale || 1.0);

    const assetsCount = config.roseAssets.length || 6;

    if (debugMode === 'SHOW_SINGLE_ROSE') {
      return [
        {
          id: 0,
          x: cx,
          y: cy,
          scale: 1.8,
          rotation: 0,
          assetIdx: 0,
          bloomDelay: 0,
          depth: 0,
        },
      ];
    }

    if (debugMode === 'SHOW_ROSE_CLUSTER') {
      const cluster: RoseItem[] = [];
      for (let i = 0; i < 7; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const rad = i === 0 ? 0 : 42;
        cluster.push({
          id: i,
          x: cx + Math.cos(ang) * rad,
          y: cy + Math.sin(ang) * rad,
          scale: i === 0 ? 1.25 : 1.05,
          rotation: (i * 45) % 360,
          assetIdx: i % assetsCount,
          bloomDelay: 0,
          depth: i,
        });
      }
      return cluster;
    }

    // 1. Boundary contour roses (22 roses defining the clean lobes and cleft)
    const boundaryCount = 22;
    for (let i = 0; i < boundaryCount; i++) {
      // Step around parameter t from -PI to PI
      const t = -Math.PI + (i / boundaryCount) * (Math.PI * 2);

      // Skip the exact bottom pole to avoid sharp stem elongation
      if (Math.abs(t) < 0.18) continue;

      const hx = 16 * Math.pow(Math.sin(t), 3);
      let hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

      // Inset boundary slightly near the bottom to ensure smooth convergence
      if (hy > 13) {
        hy = 13 + (hy - 13) * 0.65;
      }

      const x = cx + hx * scaleX;
      const y = cy + hy * scaleY;

      items.push({
        id: i,
        x,
        y,
        scale: 0.95 + prng() * 0.22,
        rotation: (prng() * 360),
        assetIdx: Math.floor(prng() * assetsCount),
        bloomDelay: 0.15 + prng() * 0.7,
        depth: y,
      });
    }

    // 2. Center-bottom tip rose (graceful natural convergence, NO tail)
    items.push({
      id: 99,
      x: cx,
      y: cy + 14.8 * scaleY,
      scale: 0.88,
      rotation: 12,
      assetIdx: 1, // Crimson rose
      bloomDelay: 0.5,
      depth: cy + 15 * scaleY,
    });

    // 3. Interior filling roses (packed inside heart volume with minimum distance)
    const interiorTarget = count - items.length;
    let attempts = 0;
    let added = 0;

    while (added < interiorTarget && attempts < 900) {
      attempts++;
      const t = prng() * Math.PI * 2;
      const fillR = Math.sqrt(prng()) * 0.78; // Inset from boundary
      const hx = 16 * Math.pow(Math.sin(t), 3) * fillR;
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * fillR;

      const x = cx + hx * scaleX + (prng() - 0.5) * 6;
      const y = cy + hy * scaleY + (prng() - 0.5) * 6;

      // Relaxed minimum spacing: ~26px to allow large prominent blooms
      let tooClose = false;
      for (const existing of items) {
        if (Math.hypot(existing.x - x, existing.y - y) < 26) {
          tooClose = true;
          break;
        }
      }

      if (!tooClose) {
        // Prominent Queen roses in center & lobes
        const isQueen = added < 6 && fillR < 0.5;
        items.push({
          id: 100 + added,
          x,
          y,
          scale: isQueen ? 1.15 + prng() * 0.15 : 0.95 + prng() * 0.22,
          rotation: prng() * 360,
          assetIdx: Math.floor(prng() * assetsCount),
          bloomDelay: prng() * 0.65,
          depth: y,
        });
        added++;
      }
    }

    // Sort by depth (y coordinate) so higher roses are behind lower roses
    return items.sort((a, b) => a.depth - b.depth);
  }, [width, height, config.roseCount, config.heartScale, config.particleSeed, config.roseAssets, debugMode]);

  if (opacity <= 0.005) return null;

  // Gentle organic breathing pulse during display phase
  const breath = 1.0 + Math.sin(time * 2.2) * 0.012;

  return (
    <div
      className="rose-heart-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: `${width}px`,
        height: `${height}px`,
        pointerEvents: 'none',
        opacity,
        transform: `scale(${breath})`,
        transformOrigin: '50% 42%',
        transition: 'opacity 0.4s ease-out',
        zIndex: 5,
        filter: 'brightness(1.1) saturate(1.2) contrast(1.05)',
      }}
    >
      {roses.map((rose) => {
        // Staggered blooming calculation with smooth backOut overshoot easing
        const localProgress = Math.max(0, Math.min(1, (bloomProgress - rose.bloomDelay * 0.4) / 0.6));
        const easedScale =
          localProgress === 0
            ? 0
            : localProgress === 1
            ? 1
            : 1 + 2.4 * Math.pow(localProgress - 1, 3) + 1.4 * Math.pow(localProgress - 1, 2);

        const currentScale = Math.max(0, rose.scale * easedScale);
        if (currentScale <= 0.01) return null;

        const assetUrl = config.roseAssets[rose.assetIdx] || config.roseAssets[0];

        return (
          <div
            key={`rose-${rose.id}`}
            style={{
              position: 'absolute',
              left: `${rose.x}px`,
              top: `${rose.y}px`,
              width: '56px',
              height: '56px',
              marginLeft: '-28px',
              marginTop: '-28px',
              transform: `scale(${currentScale}) rotate(${rose.rotation}deg)`,
              transformOrigin: 'center center',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))',
              willChange: 'transform, opacity',
            }}
          >
            <img
              src={assetUrl}
              alt="Rose"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
