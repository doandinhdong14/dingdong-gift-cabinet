import React from 'react';
import type { PastelMemoryGardenConfig } from '../config';

interface MidgroundLayerProps {
  config: PastelMemoryGardenConfig;
  cameraX: number;
  worldWidth: number;
}

export const MidgroundLayer: React.FC<MidgroundLayerProps> = ({
  config,
  cameraX,
  worldWidth,
}) => {
  const parallax = 0.65 * config.parallaxStrength;
  const shift = (cameraX * parallax) % worldWidth;

  return (
    <div
      style={{
        position: 'absolute',
        top: '25%',
        left: 0,
        width: '100%',
        height: '45%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 3,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${worldWidth * 2}px`,
          height: '100%',
          transform: `translate3d(${-shift}px, 0, 0)`,
          willChange: 'transform',
        }}
      >
        {/* Soft pastel garden haze and arbor silhouettes */}
        <svg width={worldWidth * 2} height="100%" viewBox={`0 0 ${worldWidth * 2} 400`} fill="none" preserveAspectRatio="none">
          <defs>
            <linearGradient id="treeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e879f9" stopOpacity="0.15" />
              <stop offset="60%" stopColor="#f472b6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#fed7aa" stopOpacity="0.05" />
            </linearGradient>
            <filter id="hazeBlur">
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>

          {/* Repeating soft cypress trees & floral arbors */}
          {Array.from({ length: 16 }).map((_, i) => {
            const cx = i * 650 + 200;
            return (
              <g key={i} filter="url(#hazeBlur)">
                {/* Slender garden cypress */}
                <path
                  d={`M${cx},350 C${cx - 25},240 ${cx - 15},120 ${cx},60 C${cx + 15},120 ${cx + 25},240 ${cx},350 Z`}
                  fill="url(#treeGrad)"
                />
                <path
                  d={`M${cx + 80},350 C${cx + 60},260 ${cx + 70},150 ${cx + 80},90 C${cx + 90},150 ${cx + 100},260 ${cx + 80},350 Z`}
                  fill="url(#treeGrad)"
                />
                {/* Soft arbor curve */}
                <path
                  d={`M${cx - 150},350 Q${cx - 70},160 ${cx},160 Q${cx + 70},160 ${cx + 150},350 Z`}
                  fill="none"
                  stroke="url(#treeGrad)"
                  strokeWidth="30"
                  strokeOpacity="0.4"
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
