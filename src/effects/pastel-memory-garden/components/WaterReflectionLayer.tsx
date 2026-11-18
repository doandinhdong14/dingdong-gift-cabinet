import React from 'react';
import type { PastelMemoryGardenConfig } from '../config';
import waterLakeImg from '../assets/water_lake_clean.png';

interface WaterReflectionLayerProps {
  config: PastelMemoryGardenConfig;
  cameraX: number;
  worldWidth: number;
  viewportHeight: number;
  elapsedTime: number;
}

export const WaterReflectionLayer: React.FC<WaterReflectionLayerProps> = ({
  config,
  cameraX,
  worldWidth,
  viewportHeight,
  elapsedTime,
}) => {
  const responsiveRatio = Math.max(0.65, Math.min(1.0, viewportHeight / 900));
  const waterHeight = Math.round(viewportHeight * 0.28);

  // Synchronized horizontal scroll
  const shift = ((cameraX % worldWidth) + worldWidth) % worldWidth;
  const stripWidth = Math.round(1916 * responsiveRatio);

  // Subtle ripple oscillation
  const rippleOffset = Math.sin(elapsedTime * 2.0) * (4 * config.reflectionStrength);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: `${waterHeight}px`,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 5, // Behind flower hedge & portraits, in front of sky
      }}
    >
      {/* 1. Base Scrolling Water Surface */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${worldWidth * 2}px`,
          height: '100%',
          display: 'flex',
          transform: `translate3d(${-shift + rippleOffset}px, 0, 0)`,
          willChange: 'transform',
        }}
      >
        {[0, 1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            style={{
              position: 'relative',
              width: `${stripWidth}px`,
              height: '100%',
              flexShrink: 0,
              backgroundImage: `url(${waterLakeImg})`,
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              opacity: 0.95 * config.reflectionStrength,
            }}
          />
        ))}
      </div>

      {/* 2. Soft horizontal water ripples and light shimmer overlay */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 200"
        fill="none"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          opacity: 0.45 * config.reflectionStrength,
          mixBlendMode: 'screen',
        }}
      >
        <defs>
          <linearGradient id="rippleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#fed7aa" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Animated undulating ripple lines */}
        {[30, 65, 105, 145, 175].map((ry, rIdx) => {
          const wavePhase = elapsedTime * 1.5 + rIdx;
          const yWave = Math.sin(wavePhase) * 2;
          return (
            <path
              key={rIdx}
              d={`M0,${ry + yWave} Q250,${ry - 3 + yWave} 500,${ry + yWave} T1000,${ry + yWave}`}
              stroke="url(#rippleGrad)"
              strokeWidth={1.5 + rIdx * 0.4}
              strokeOpacity={0.65}
              fill="none"
            />
          );
        })}
      </svg>

      {/* 3. Soft gradient fade towards bottom edge */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '45%',
          background:
            'linear-gradient(to bottom, rgba(254, 215, 226, 0) 0%, rgba(253, 210, 222, 0.6) 65%, rgba(252, 205, 218, 0.95) 100%)',
        }}
      />
    </div>
  );
};
