import React from 'react';
import type { PastelMemoryGardenConfig } from '../config';

interface ButterfliesAndParticlesProps {
  config: PastelMemoryGardenConfig;
  elapsedTime: number;
  viewportWidth: number;
  viewportHeight: number;
}

// Stable organic flight path seeds
const BUTTERFLY_SEEDS = [
  { xBase: 0.18, yBase: 0.38, xSpeed: 0.22, ySpeed: 0.40, xAmp: 85, yAmp: 30, flapSpeed: 8.5 },
  { xBase: 0.44, yBase: 0.32, xSpeed: 0.18, ySpeed: 0.32, xAmp: 110, yAmp: 42, flapSpeed: 9.0 },
  { xBase: 0.68, yBase: 0.36, xSpeed: 0.25, ySpeed: 0.45, xAmp: 90, yAmp: 28, flapSpeed: 8.0 },
  { xBase: 0.88, yBase: 0.33, xSpeed: 0.20, ySpeed: 0.36, xAmp: 100, yAmp: 36, flapSpeed: 8.8 },
  { xBase: 0.30, yBase: 0.42, xSpeed: 0.28, ySpeed: 0.35, xAmp: 95, yAmp: 30, flapSpeed: 8.2 },
  { xBase: 0.58, yBase: 0.28, xSpeed: 0.16, ySpeed: 0.38, xAmp: 115, yAmp: 45, flapSpeed: 9.2 },
  { xBase: 0.12, yBase: 0.40, xSpeed: 0.22, ySpeed: 0.34, xAmp: 80, yAmp: 26, flapSpeed: 7.8 },
  { xBase: 0.82, yBase: 0.44, xSpeed: 0.24, ySpeed: 0.42, xAmp: 105, yAmp: 35, flapSpeed: 8.6 },
];

export const ButterfliesAndParticles: React.FC<ButterfliesAndParticlesProps> = ({
  config,
  elapsedTime,
  viewportWidth,
  viewportHeight,
}) => {
  const count = Math.min(config.butterflyCount, BUTTERFLY_SEEDS.length);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 30, // in front of scene
        overflow: 'hidden',
      }}
    >
      {/* 1. Realistic Ethereal SVG Butterflies */}
      {Array.from({ length: count }).map((_, i) => {
        const s = BUTTERFLY_SEEDS[i];
        const bx = s.xBase * viewportWidth + Math.sin(elapsedTime * s.xSpeed + i * 1.5) * s.xAmp;
        const by = s.yBase * viewportHeight + Math.cos(elapsedTime * s.ySpeed + i * 1.2) * s.yAmp;
        const flightTilt = Math.cos(elapsedTime * s.xSpeed + i * 1.5) * 14;
        const wingFlap = Math.sin(elapsedTime * s.flapSpeed * 2 * Math.PI) * 55;

        const isBlue = i % 2 === 0;
        const gradId = `bFlyGrad-${i}`;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: `${by}px`,
              left: `${bx}px`,
              width: '40px',
              height: '36px',
              transform: `translate(-50%, -50%) rotate(${flightTilt}deg)`,
              filter: 'drop-shadow(0 3px 8px rgba(244, 114, 182, 0.45))',
              perspective: '350px',
            }}
          >
            <svg
              width="40"
              height="36"
              viewBox="0 0 40 36"
              fill="none"
              style={{ overflow: 'visible' }}
            >
              <defs>
                <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={isBlue ? '#bfdbfe' : '#fbcfe8'} />
                  <stop offset="50%" stopColor={isBlue ? '#60a5fa' : '#f472b6'} />
                  <stop offset="100%" stopColor={isBlue ? '#c084fc' : '#fda4af'} />
                </linearGradient>
              </defs>

              {/* Left Wing with 3D flap */}
              <g
                style={{
                  transformOrigin: '20px 18px',
                  transform: `rotateY(${wingFlap}deg)`,
                }}
              >
                {/* Forewing */}
                <path
                  d="M20,18 C16,10 6,2 3,6 C0,10 4,20 20,18 Z"
                  fill={`url(#${gradId})`}
                  opacity="0.9"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                />
                {/* Hindwing */}
                <path
                  d="M20,18 C16,22 6,32 4,28 C2,24 10,16 20,18 Z"
                  fill={`url(#${gradId})`}
                  opacity="0.85"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                />
              </g>

              {/* Right Wing with opposite 3D flap */}
              <g
                style={{
                  transformOrigin: '20px 18px',
                  transform: `rotateY(${-wingFlap}deg)`,
                }}
              >
                {/* Forewing */}
                <path
                  d="M20,18 C24,10 34,2 37,6 C40,10 36,20 20,18 Z"
                  fill={`url(#${gradId})`}
                  opacity="0.9"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                />
                {/* Hindwing */}
                <path
                  d="M20,18 C24,22 34,32 36,28 C38,24 30,16 20,18 Z"
                  fill={`url(#${gradId})`}
                  opacity="0.85"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                />
              </g>

              {/* Slender Butterfly Body & Antennae */}
              <ellipse cx="20" cy="18" rx="1.4" ry="7" fill="#831843" opacity="0.85" />
              <path d="M20,11 Q17,7 16,5" stroke="#831843" strokeWidth="0.8" strokeLinecap="round" fill="none" />
              <path d="M20,11 Q23,7 24,5" stroke="#831843" strokeWidth="0.8" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        );
      })}

      {/* 2. Floating Golden-Pink Dust Motes & Sparkles */}
      {Array.from({ length: 16 }).map((_, pIdx) => {
        const px = (pIdx * 125 + elapsedTime * 20) % viewportWidth;
        const py =
          ((pIdx * 55 + Math.sin(elapsedTime * 0.9 + pIdx) * 32 + viewportHeight * 0.3) %
            (viewportHeight * 0.52)) +
          viewportHeight * 0.22;
        const pOpacity = (Math.sin(elapsedTime * 2.2 + pIdx) + 1) * 0.35 + 0.15;
        const pSize = 3 + (pIdx % 3) * 1.5;

        return (
          <div
            key={`p-${pIdx}`}
            style={{
              position: 'absolute',
              top: `${py}px`,
              left: `${px}px`,
              width: `${pSize}px`,
              height: `${pSize}px`,
              borderRadius: '50%',
              background: pIdx % 2 === 0 ? '#fde047' : '#f472b6',
              boxShadow: `0 0 8px ${pIdx % 2 === 0 ? '#fde047' : '#f472b6'}`,
              opacity: pOpacity,
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}
    </div>
  );
};
