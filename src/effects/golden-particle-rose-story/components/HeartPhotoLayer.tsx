import React, { useMemo } from 'react';
import type { GoldenParticleStoryConfig } from '../config';

export interface HeartPhotoLayerProps {
  config: GoldenParticleStoryConfig;
  opacity: number;
  time: number;
  mediaOverride?: string;
}

export const HeartPhotoLayer: React.FC<HeartPhotoLayerProps> = ({
  config,
  opacity,
  time,
  mediaOverride,
}) => {
  const photoUrl = mediaOverride || config.heartPhoto;
  const crop = config.heartPhotoCrop || { x: 0.5, y: 0.5, scale: 1.0 };

  // Subtle breathing pulse on the photo
  const pulse = 1.0 + Math.sin(time * 2.2) * 0.012;

  // Normalized heart bezier curve centered in a 280 x 260 box
  const heartPathData = useMemo(() => {
    return `
      M 140, 240
      C 95, 205 20, 155 20, 95
      C 20, 45 60, 20 100, 20
      C 120, 20 135, 30 140, 42
      C 145, 30 160, 20 180, 20
      C 220, 20 260, 45 260, 95
      C 260, 155 185, 205 140, 240
      Z
    `;
  }, []);

  if (opacity <= 0.005) return null;

  return (
    <div
      className="heart-photo-container"
      style={{
        position: 'absolute',
        top: '44%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${pulse})`,
        width: '280px',
        height: '260px',
        opacity,
        transition: 'opacity 0.5s ease-out',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      <svg
        viewBox="0 0 280 260"
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
      >
        <defs>
          <clipPath id="goldenHeartClip">
            <path d={heartPathData} />
          </clipPath>

          {/* Golden Double Border Gradient */}
          <linearGradient id="photoBorderGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffe58f" />
            <stop offset="25%" stopColor="#ffd700" />
            <stop offset="50%" stopColor="#fff8db" />
            <stop offset="75%" stopColor="#e5a93b" />
            <stop offset="100%" stopColor="#ffd700" />
          </linearGradient>

          {/* Soft Golden Outer Halo */}
          <filter id="heartGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Outer Glowing Heart Silhouette Halo */}
        <path
          d={heartPathData}
          fill="none"
          stroke="rgba(255, 215, 0, 0.45)"
          strokeWidth="10"
          filter="url(#heartGlowFilter)"
        />

        {/* 2. Photo Clipped Inside Heart Mask */}
        <g clipPath="url(#goldenHeartClip)">
          {photoUrl ? (
            <image
              href={photoUrl}
              xlinkHref={photoUrl}
              x={140 - 120 * crop.scale}
              y={130 - 110 * crop.scale}
              width={240 * crop.scale}
              height={220 * crop.scale}
              preserveAspectRatio="xMidYMid slice"
            />
          ) : (
            <g>
              <rect width="280" height="260" fill="#140710" />
              <circle cx="140" cy="115" r="45" fill="none" stroke="#ffd700" strokeWidth="2" strokeDasharray="6 4" />
              <text
                x="140"
                y="120"
                textAnchor="middle"
                fill="#ffd700"
                fontSize="14"
                fontFamily="sans-serif"
                fontWeight="500"
              >
                Tải ảnh đôi
              </text>
            </g>
          )}
        </g>

        {/* 3. Golden Double Border (Sharp Inner Gold + Sparkling Outer Gold) */}
        {/* Outer Border */}
        <path
          d={heartPathData}
          fill="none"
          stroke="url(#photoBorderGold)"
          strokeWidth="3.2"
          filter="drop-shadow(0 0 6px rgba(255, 215, 0, 0.85))"
        />

        {/* Inner Thin White-Gold Accent Line */}
        <path
          d={heartPathData}
          fill="none"
          stroke="rgba(255, 255, 255, 0.75)"
          strokeWidth="1.2"
          transform="scale(0.975) translate(3.5, 3.5)"
        />

        {/* 4. Sparkling Corner Gems on the Heart Lobes & Tip */}
        <circle
          cx="140"
          cy="42"
          r={2.2 + Math.sin(time * 4) * 0.8}
          fill="#ffffff"
          filter="drop-shadow(0 0 4px #ffd700)"
        />
        <circle
          cx="140"
          cy="240"
          r={2.5 + Math.cos(time * 3.5) * 0.8}
          fill="#ffffff"
          filter="drop-shadow(0 0 4px #ffd700)"
        />
      </svg>
    </div>
  );
};
