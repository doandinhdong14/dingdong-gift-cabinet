import React from 'react';
import type { PastelMemoryGardenConfig } from '../config';

interface SkyLayerProps {
  config: PastelMemoryGardenConfig;
  cameraX: number;
}

const PALETTES = {
  sunset: {
    skyTop: '#fbcfe8',      // soft pink / lilac
    skyMid: '#fed7aa',      // warm peach / apricot
    skyBottom: '#fecdd3',   // soft rose
    cloudTint: '#ffffff',
    cloudGlow: 'rgba(254, 215, 170, 0.45)',
  },
  dawn: {
    skyTop: '#e0e7ff',      // lavender mist
    skyMid: '#fed7aa',      // morning gold
    skyBottom: '#fce7f3',   // pink dawn
    cloudTint: '#ffffff',
    cloudGlow: 'rgba(224, 231, 255, 0.4)',
  },
  rose: {
    skyTop: '#f472b6',      // fairy tale rose
    skyMid: '#fbcfe8',      // pastel pink
    skyBottom: '#fed7aa',   // peach
    cloudTint: '#ffffff',
    cloudGlow: 'rgba(244, 114, 182, 0.35)',
  },
  golden: {
    skyTop: '#fed7aa',      // warm honey gold
    skyMid: '#fde047',      // golden light
    skyBottom: '#fecdd3',   // soft peach pink
    cloudTint: '#ffffff',
    cloudGlow: 'rgba(253, 224, 71, 0.4)',
  },
};

export const SkyLayer: React.FC<SkyLayerProps> = ({ config, cameraX }) => {
  const p = PALETTES[config.backgroundPalette] || PALETTES.sunset;
  const skyShift = (cameraX * 0.08) % 1200;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `linear-gradient(to bottom, ${p.skyTop} 0%, ${p.skyMid} 42%, ${p.skyBottom} 75%, #ffe4e6 100%)`,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {/* Soft atmospheric radial glow for the setting sun */}
      <div
        style={{
          position: 'absolute',
          top: '12%',
          left: '48%',
          width: '600px',
          height: '400px',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(ellipse at center, ${p.cloudGlow} 0%, rgba(255,255,255,0) 70%)`,
          filter: 'blur(30px)',
          opacity: 0.85,
        }}
      />

      {/* Procedural soft drifting sunset clouds (SVG) */}
      <div
        style={{
          position: 'absolute',
          top: '5%',
          left: 0,
          width: '2400px',
          height: '240px',
          transform: `translate3d(${-skyShift}px, 0, 0)`,
          willChange: 'transform',
          opacity: 0.72,
        }}
      >
        <svg width="2400" height="240" viewBox="0 0 2400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="cloudBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="16" />
            </filter>
            <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#fed7aa" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#f472b6" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Cloud cluster 1 */}
          <path
            d="M120,80 Q180,30 280,60 Q360,20 460,50 Q560,35 620,85 Q680,140 580,160 Q450,175 320,165 Q180,170 120,80 Z"
            fill="url(#cloudGrad)"
            filter="url(#cloudBlur)"
          />
          {/* Cloud cluster 2 */}
          <path
            d="M780,95 Q850,45 960,65 Q1050,30 1160,70 Q1240,110 1180,150 Q1060,170 940,160 Q820,165 780,95 Z"
            fill="url(#cloudGrad)"
            filter="url(#cloudBlur)"
          />
          {/* Cloud cluster 3 */}
          <path
            d="M1380,85 Q1450,35 1560,55 Q1660,25 1780,60 Q1880,105 1800,155 Q1680,175 1540,165 Q1420,165 1380,85 Z"
            fill="url(#cloudGrad)"
            filter="url(#cloudBlur)"
          />
          {/* Cloud cluster 4 */}
          <path
            d="M1980,90 Q2060,40 2160,65 Q2250,35 2340,75 Q2390,120 2320,150 Q2220,170 2120,160 Q2020,165 1980,90 Z"
            fill="url(#cloudGrad)"
            filter="url(#cloudBlur)"
          />
        </svg>
      </div>
    </div>
  );
};
