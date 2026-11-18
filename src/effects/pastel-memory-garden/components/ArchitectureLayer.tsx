import React from 'react';
import type { PastelMemoryGardenConfig } from '../config';

interface ArchitectureLayerProps {
  config: PastelMemoryGardenConfig;
  cameraX: number;
  worldWidth: number;
}

export const ArchitectureLayer: React.FC<ArchitectureLayerProps> = ({
  config,
  cameraX,
  worldWidth,
}) => {
  // Parallax ratio for distant architecture
  const parallax = 0.35 * config.parallaxStrength;
  const shift = ((cameraX * parallax) % worldWidth + worldWidth) % worldWidth;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '62%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 2,
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
        <svg
          width={worldWidth * 2}
          height="100%"
          viewBox={`0 0 ${worldWidth * 2} 480`}
          fill="none"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Distant Mountains Gradient */}
            <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#d8b4e2" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#f472b6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#fed7aa" stopOpacity="0.1" />
            </linearGradient>

            {/* Classical Stone Rotunda Gradient */}
            <linearGradient id="marbleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fff5f5" />
              <stop offset="40%" stopColor="#ffe4e6" />
              <stop offset="70%" stopColor="#fce7f3" />
              <stop offset="100%" stopColor="#fecdd3" />
            </linearGradient>

            {/* Rotunda Dome Shadow/Highlight */}
            <linearGradient id="domeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#fbcfe8" stopOpacity="0.8" />
              <stop offset="85%" stopColor="#f472b6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#fed7aa" stopOpacity="0.3" />
            </linearGradient>

            {/* Floral Garland Gradient */}
            <linearGradient id="floralGarland" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.75" />
              <stop offset="30%" stopColor="#f472b6" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#c084fc" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#fb7185" stopOpacity="0.75" />
            </linearGradient>

            <filter id="softGlow">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>

          {/* 1. Layer of Distant Misty Mountains across world width */}
          {Array.from({ length: 8 }).map((_, mIdx) => {
            const mx = mIdx * 1300;
            return (
              <path
                key={`mt-${mIdx}`}
                d={`M${mx - 200},380 L${mx + 200},140 L${mx + 550},240 L${mx + 850},90 L${mx + 1150},210 L${mx + 1500},380 Z`}
                fill="url(#mountainGrad)"
              />
            );
          })}

          {/* 2. Classical Rotunda Pavilions & Colonnades spaced along the track */}
          {Array.from({ length: 10 }).map((_, rIdx) => {
            const rx = rIdx * 1040 + 450;
            const isGrand = rIdx % 2 === 0;
            const rWidth = isGrand ? 380 : 280;
            const rHeight = isGrand ? 320 : 260;
            const domeY = 400 - rHeight;

            return (
              <g key={`rotunda-${rIdx}`} opacity="0.82">
                {/* Main Dome */}
                <path
                  d={`M${rx - rWidth / 2},${domeY + 60} Q${rx},${domeY - 40} ${rx + rWidth / 2},${domeY + 60} Z`}
                  fill="url(#domeGrad)"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeOpacity="0.8"
                />
                {/* Dome Finial / Cupola */}
                <circle cx={rx} cy={domeY - 42} r="7" fill="#ffffff" stroke="#f472b6" strokeWidth="1.5" />
                <line x1={rx} y1={domeY - 49} x2={rx} y2={domeY - 60} stroke="#ffffff" strokeWidth="2.5" />

                {/* Classical Entablature / Architrave */}
                <rect
                  x={rx - rWidth / 2 - 15}
                  y={domeY + 60}
                  width={rWidth + 30}
                  height="16"
                  rx="3"
                  fill="url(#marbleGrad)"
                  stroke="#f472b6"
                  strokeWidth="1"
                  strokeOpacity="0.4"
                />

                {/* Cascading Floral Wisteria / Rose Garlands draped across the cornice */}
                <path
                  d={`M${rx - rWidth / 2},${domeY + 76} Q${rx - rWidth / 4},${domeY + 110} ${rx},${domeY + 76} Q${rx + rWidth / 4},${domeY + 110} ${rx + rWidth / 2},${domeY + 76}`}
                  stroke="url(#floralGarland)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d={`M${rx - rWidth / 2},${domeY + 76} Q${rx - rWidth / 4},${domeY + 110} ${rx},${domeY + 76} Q${rx + rWidth / 4},${domeY + 110} ${rx + rWidth / 2},${domeY + 76}`}
                  stroke="#ffffff"
                  strokeWidth="3"
                  strokeDasharray="4 6"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Classical Fluted Columns */}
                {[-0.42, -0.22, 0, 0.22, 0.42].map((colRatio, cIdx) => {
                  const colX = rx + colRatio * rWidth;
                  return (
                    <g key={`col-${cIdx}`}>
                      {/* Corinthian Capital */}
                      <rect
                        x={colX - 10}
                        y={domeY + 76}
                        width="20"
                        height="10"
                        rx="2"
                        fill="#ffffff"
                        stroke="#f472b6"
                        strokeWidth="1"
                        strokeOpacity="0.5"
                      />
                      {/* Column Shaft */}
                      <rect
                        x={colX - 6}
                        y={domeY + 86}
                        width="12"
                        height={rHeight - 90}
                        fill="url(#marbleGrad)"
                        stroke="#f472b6"
                        strokeWidth="0.8"
                        strokeOpacity="0.3"
                      />
                      {/* Inner Fluting Line */}
                      <line
                        x1={colX}
                        y1={domeY + 88}
                        x2={colX}
                        y2={domeY + rHeight - 6}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        strokeOpacity="0.8"
                      />
                      {/* Molded Base */}
                      <rect
                        x={colX - 9}
                        y={domeY + rHeight - 6}
                        width="18"
                        height="8"
                        rx="2"
                        fill="#ffffff"
                      />
                    </g>
                  );
                })}

                {/* Classical Balustrade Base */}
                <rect
                  x={rx - rWidth / 2 - 20}
                  y={domeY + rHeight + 2}
                  width={rWidth + 40}
                  height="18"
                  rx="3"
                  fill="url(#marbleGrad)"
                />
              </g>
            );
          })}
        </svg>

        {/* Soft atmospheric mist overlay along the lower edge */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '45%',
            background:
              'linear-gradient(to bottom, rgba(254, 215, 226, 0) 0%, rgba(254, 215, 226, 0.65) 55%, rgba(254, 215, 226, 0.95) 100%)',
          }}
        />
      </div>
    </div>
  );
};
