import React from 'react';
import type { PastelMemoryGardenConfig } from '../config';

interface RibbonTrackProps {
  config: PastelMemoryGardenConfig;
  cameraX: number;
  worldWidth: number;
  viewportHeight: number;
  elapsedTime: number;
}

export const RibbonTrack: React.FC<RibbonTrackProps> = ({
  config,
  cameraX,
  worldWidth,
  viewportHeight,
  elapsedTime,
}) => {
  const shift = ((cameraX % worldWidth) + worldWidth) % worldWidth;
  const responsiveRatio = Math.max(0.65, Math.min(1.0, viewportHeight / 900));

  // Subtle natural floating wave for the ribbon loops
  const waveY = Math.sin(elapsedTime * 1.2) * (3 * config.ribbonIntensity);
  const waveRotate = Math.cos(elapsedTime * 0.9) * (0.8 * config.ribbonIntensity);

  return (
    /* Behind-Character Tall Ribbon Arches (zIndex: 7) */
    <div
      style={{
        position: 'absolute',
        top: '18%',
        left: 0,
        width: '100%',
        height: '48%',
        pointerEvents: 'none',
        zIndex: 7, // behind portraits (zIndex: 8-10)
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${worldWidth * 2}px`,
          height: '100%',
          transform: `translate3d(${-shift}px, ${waveY * 0.5}px, 0)`,
          willChange: 'transform',
        }}
      >
        {/* Key Satin Ribbon Loops positioned beside featured characters */}
        {[520, 1560, 2600, 3640, 4680].map((loopX, lIdx) => (
          <div
            key={lIdx}
            style={{
              position: 'absolute',
              top: 0,
              left: `${loopX}px`,
              width: `${Math.round(220 * responsiveRatio)}px`,
              height: `${Math.round(380 * responsiveRatio)}px`,
              transform: `scale(${config.ribbonIntensity}) rotate(${lIdx % 2 === 0 ? waveRotate : -waveRotate}deg)`,
              transformOrigin: 'bottom center',
              filter: 'drop-shadow(0 10px 20px rgba(244, 114, 182, 0.3))',
              opacity: 0.95 * config.ribbonIntensity,
            }}
          >
            {/* Elegant Satin Ribbon Loop SVG */}
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 220 380"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id={`satinGrad-${lIdx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fecdd3" />
                  <stop offset="35%" stopColor="#fda4af" />
                  <stop offset="65%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="85%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#fb7185" />
                </linearGradient>
                <linearGradient id={`satinBack-${lIdx}`} x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f472b6" />
                  <stop offset="50%" stopColor="#db2777" />
                  <stop offset="100%" stopColor="#fda4af" />
                </linearGradient>
              </defs>

              {/* Back twist curve */}
              <path
                d="M180,360 C195,240 185,120 120,50 C70,0 20,40 30,120 C40,190 110,250 150,340"
                stroke={`url(#satinBack-${lIdx})`}
                strokeWidth="38"
                strokeLinecap="round"
              />

              {/* Front lustrous satin ribbon curve with specular highlight */}
              <path
                d="M180,360 C195,240 185,120 120,50 C70,0 20,40 30,120 C40,190 110,250 150,340"
                stroke={`url(#satinGrad-${lIdx})`}
                strokeWidth="32"
                strokeLinecap="round"
              />

              {/* Satin specular center sheen */}
              <path
                d="M178,350 C190,240 182,125 120,55 C75,10 30,45 38,120 C46,185 110,245 148,335"
                stroke="#ffffff"
                strokeWidth="8"
                strokeLinecap="round"
                strokeOpacity="0.75"
              />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
};
