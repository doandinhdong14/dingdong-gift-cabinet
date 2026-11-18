import React, { useMemo } from 'react';
import type { GoldenParticleStoryConfig } from '../config';

export interface BouquetRendererProps {
  config: GoldenParticleStoryConfig;
  bloomProgress: number; // 0 (tight bud) to 1 (full bloom)
  opacity: number;
  time: number;
  onRoseClick?: (roseId: number) => void;
  hoveredRoseId?: number | null;
  onRoseHover?: (roseId: number | null) => void;
}

export interface RoseDef {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  delay: number; // Bloom stagger delay (0..1)
}

export const ROSE_COORDINATES: RoseDef[] = [
  { id: 1, x: -50, y: -72, rotation: -16, scale: 0.98, delay: 0.05 },
  { id: 2, x: 50, y: -72, rotation: 16, scale: 0.98, delay: 0.08 },
  { id: 3, x: -84, y: -18, rotation: -24, scale: 1.02, delay: 0.02 },
  { id: 4, x: 0, y: -10, rotation: 0, scale: 1.15, delay: 0.0 }, // Center Queen Rose
  { id: 5, x: 84, y: -18, rotation: 24, scale: 1.02, delay: 0.06 },
  { id: 6, x: -66, y: 38, rotation: -14, scale: 0.96, delay: 0.12 },
  { id: 7, x: -26, y: 70, rotation: -6, scale: 0.96, delay: 0.15 },
  { id: 8, x: 26, y: 70, rotation: 6, scale: 0.96, delay: 0.14 },
  { id: 9, x: 66, y: 38, rotation: 14, scale: 0.96, delay: 0.10 },
];

/**
 * Procedural luxury velvet rose with realistic multi-tiered petal geometry,
 * organic blooming motion, and luminous hover feedback.
 */
const LayeredRose: React.FC<{
  def: RoseDef;
  roseColor: string;
  bloomProgress: number;
  isHovered: boolean;
  time: number;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}> = ({
  def,
  bloomProgress,
  isHovered,
  time,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  // Staggered bloom progress for organic unfolding
  const staggeredBloom = useMemo(() => {
    const start = def.delay * 0.35;
    const end = start + 0.65;
    if (bloomProgress <= start) return 0;
    if (bloomProgress >= end) return 1;
    const t = (bloomProgress - start) / (end - start);
    return 1 - Math.pow(1 - t, 3);
  }, [bloomProgress, def.delay]);

  // Subtle breathing
  const breathe = Math.sin(time * 2.2 + def.id * 1.3) * 0.015;
  const currentScale = def.scale * (0.42 + staggeredBloom * 0.58 + breathe) * (isHovered ? 1.08 : 1.0);

  const outerPetalExpand = staggeredBloom;
  const midPetalExpand = Math.pow(staggeredBloom, 1.2);

  return (
    <g
      transform={`translate(${def.x}, ${def.y}) rotate(${def.rotation}) scale(${currentScale})`}
      style={{
        cursor: 'pointer',
        transition: 'filter 0.25s ease, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        filter: isHovered
          ? 'drop-shadow(0 0 14px rgba(255, 215, 0, 0.95)) drop-shadow(0 0 22px rgba(225, 29, 72, 0.85))'
          : 'drop-shadow(0 5px 9px rgba(0, 0, 0, 0.7))',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="button"
      tabIndex={0}
      aria-label={`Bông hồng số ${def.id}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* 1. Golden Hover Aura Ring */}
      {isHovered && (
        <circle
          cx="0"
          cy="0"
          r="44"
          fill="none"
          stroke="rgba(255, 230, 100, 0.85)"
          strokeWidth="2.5"
          strokeDasharray="4 4"
          style={{ animation: 'spin 8s linear infinite' }}
        />
      )}

      {/* 2. BASE CALYX / SEPAL SHADOW */}
      <ellipse cx="0" cy="2" rx="36" ry="34" fill="#1e0205" opacity={0.8} />

      {/* 3. TIER 1: BROAD OUTER GUARD PETALS (5 Petals with soft petal curves & notches) */}
      <g opacity={0.7 + outerPetalExpand * 0.3}>
        {/* Outer Top Petal */}
        <path
          d="M -24,-12 C -28,-36 -4,-46 14,-42 C 30,-38 34,-20 22,-8 C 8,4 -16,4 -24,-12 Z"
          fill="url(#outerPetalGrad)"
          stroke="#3d0309"
          strokeWidth="0.7"
          transform={`scale(${0.68 + outerPetalExpand * 0.32}) rotate(${4 - (1 - outerPetalExpand) * 14})`}
        />
        {/* Outer Top-Right Petal */}
        <path
          d="M 6,-18 C 24,-30 46,-16 42,6 C 38,24 16,34 2,24 C -8,14 -4,-8 6,-18 Z"
          fill="url(#outerPetalGrad2)"
          stroke="#3d0309"
          strokeWidth="0.7"
          transform={`scale(${0.70 + outerPetalExpand * 0.30}) rotate(${12 + (1 - outerPetalExpand) * 12})`}
        />
        {/* Outer Bottom-Right Petal */}
        <path
          d="M 12,4 C 36,12 38,36 18,44 C -2,52 -18,36 -12,20 C -6,6 -2,-2 12,4 Z"
          fill="url(#outerPetalGrad)"
          stroke="#3d0309"
          strokeWidth="0.7"
          transform={`scale(${0.72 + outerPetalExpand * 0.28})`}
        />
        {/* Outer Bottom-Left Petal */}
        <path
          d="M -14,4 C 0,0 4,8 0,22 C -6,38 -28,44 -38,26 C -46,8 -24,-2 -14,4 Z"
          fill="url(#outerPetalGrad2)"
          stroke="#3d0309"
          strokeWidth="0.7"
          transform={`scale(${0.72 + outerPetalExpand * 0.28})`}
        />
        {/* Outer Top-Left Petal */}
        <path
          d="M -8,-18 C 4,-8 4,12 -12,24 C -28,34 -48,18 -42,-4 C -38,-22 -20,-28 -8,-18 Z"
          fill="url(#outerPetalGrad)"
          stroke="#3d0309"
          strokeWidth="0.7"
          transform={`scale(${0.70 + outerPetalExpand * 0.30}) rotate(${-12 - (1 - outerPetalExpand) * 12})`}
        />
      </g>

      {/* 4. TIER 2: INTERMEDIATE OVERLAPPING PETAL CUP (4 Petals) */}
      <g opacity={0.85 + midPetalExpand * 0.15}>
        {/* Mid North-West */}
        <path
          d="M -16,-6 C -28,-22 -2,-30 16,-22 C 30,-14 18,8 2,6 C -12,4 -6,6 -16,-6 Z"
          fill="url(#midPetalGrad1)"
          stroke="#48040d"
          strokeWidth="0.7"
          transform={`scale(${0.74 + midPetalExpand * 0.26}) rotate(-12)`}
        />
        {/* Mid North-East */}
        <path
          d="M 16,-6 C 28,-22 2,-30 -16,-22 C -30,-14 -18,8 -2,6 C 12,4 6,6 16,-6 Z"
          fill="url(#midPetalGrad2)"
          stroke="#48040d"
          strokeWidth="0.7"
          transform={`scale(${0.74 + midPetalExpand * 0.26}) rotate(12)`}
        />
        {/* Mid South-East */}
        <path
          d="M 12,2 C 24,12 18,28 0,30 C -16,32 -22,18 -12,10 C -2,2 4,-6 12,2 Z"
          fill="url(#midPetalGrad1)"
          stroke="#48040d"
          strokeWidth="0.7"
          transform={`scale(${0.78 + midPetalExpand * 0.22})`}
        />
        {/* Mid South-West */}
        <path
          d="M -12,2 C -24,12 -18,28 0,30 C 16,32 22,18 12,10 C 2,2 -4,-6 -12,2 Z"
          fill="url(#midPetalGrad2)"
          stroke="#48040d"
          strokeWidth="0.7"
          transform={`scale(${0.78 + midPetalExpand * 0.22})`}
        />
      </g>

      {/* 5. TIER 3: INNER ROSETTE WITH REALISTIC PETAL FOLDS (NOT a bullseye spiral) */}
      <g>
        {/* Velvet Shadow Cup */}
        <ellipse cx="0" cy="0" rx="16" ry="14" fill="#240105" />

        {/* Inner Left Petal Flap (Cupped around heart) */}
        <path
          d="M -14,2 C -16,-8 -6,-16 4,-14 C 12,-12 14,-2 6,4 C -2,10 -10,8 -14,2 Z"
          fill="url(#corePetalGrad)"
          stroke="#550412"
          strokeWidth="0.6"
        />

        {/* Inner Right Petal Flap (Interlocking wrap) */}
        <path
          d="M 12,0 C 16,-6 10,-14 -2,-14 C -12,-14 -12,-4 -4,4 C 2,10 8,8 12,0 Z"
          fill="url(#midPetalGrad1)"
          stroke="#550412"
          strokeWidth="0.6"
        />

        {/* Inner Bottom Cupping Petal Lip */}
        <path
          d="M -10,3 C -10,12 10,12 10,3 C 6,7 -6,7 -10,3 Z"
          fill="#e11d48"
          stroke="#550412"
          strokeWidth="0.6"
        />

        {/* Delicate Center Bud Petal Heart (Folded spiral center) */}
        <path
          d="M -5,-1 C -7,-5 -2,-8 3,-6 C 7,-4 6,2 2,3 C -2,4 -3,2 -3,0 C -3,-2 0,-3 1,-2"
          fill="none"
          stroke="#be123c"
          strokeWidth="2.4"
          strokeLinecap="round"
        />

        {/* Golden/Velvet Petal Edge Highlight */}
        <path
          d="M -4,-2 C -5,-5 0,-7 4,-5 C 7,-3 5,2 2,3"
          fill="none"
          stroke="url(#roseGoldEdge)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Deepest Core Shadow Hollow */}
        <circle cx="0" cy="-1" r="2.2" fill="#140003" />
      </g>

      {/* 6. Dewdrops catching the light */}
      <circle
        cx="7"
        cy="-8"
        r={0.9 + Math.sin(time * 3 + def.id) * 0.35}
        fill="#ffffff"
        opacity="0.9"
        filter="drop-shadow(0 0 2px rgba(255,255,255,0.85))"
      />
      <circle
        cx="-9"
        cy="7"
        r={0.8 + Math.cos(time * 2.7 + def.id) * 0.3}
        fill="#fff9e0"
        opacity="0.8"
      />

      {/* 7. Hitbox Circle for Touch/Click */}
      <circle cx="0" cy="0" r="40" fill="transparent" />
    </g>
  );
};

export const BouquetRenderer: React.FC<BouquetRendererProps> = ({
  config,
  bloomProgress,
  opacity,
  time,
  onRoseClick,
  hoveredRoseId,
  onRoseHover,
}) => {
  const roses = useMemo(() => {
    const count = Math.min(config.roseCount, ROSE_COORDINATES.length);
    return ROSE_COORDINATES.slice(0, count);
  }, [config.roseCount]);

  if (opacity <= 0.005) return null;

  const bouquetScale = config.bouquetScale || 1.0;

  return (
    <div
      className="bouquet-container"
      style={{
        position: 'absolute',
        bottom: '8%',
        left: '50%',
        transform: `translateX(-50%) scale(${bouquetScale})`,
        width: '358px',
        height: '460px',
        opacity,
        pointerEvents: opacity > 0.4 ? 'auto' : 'none',
        transition: 'opacity 0.6s ease-out',
        userSelect: 'none',
      }}
    >
      <svg
        viewBox="-179 -230 358 460"
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
      >
        <defs>
          {/* Pleated Kraft / Champagne Wrapper Gradient */}
          <linearGradient id="wrapperFanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f5ecd7" />
            <stop offset="30%" stopColor="#ebd9ba" />
            <stop offset="65%" stopColor="#dac29a" />
            <stop offset="100%" stopColor="#bda278" />
          </linearGradient>

          {/* Stem Bundle Gradient */}
          <linearGradient id="stemGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e5422" />
            <stop offset="45%" stopColor="#2e7d32" />
            <stop offset="75%" stopColor="#1e5422" />
            <stop offset="100%" stopColor="#143817" />
          </linearGradient>

          {/* Satin Crimson Ribbon Gradient */}
          <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="30%" stopColor="#be123c" />
            <stop offset="70%" stopColor="#9f1239" />
            <stop offset="100%" stopColor="#4c0519" />
          </linearGradient>

          {/* Rose Outer Petal Radial Gradients */}
          <radialGradient id="outerPetalGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="40%" stopColor="#b91c1c" />
            <stop offset="75%" stopColor="#7f1d1d" />
            <stop offset="100%" stopColor="#450a0a" />
          </radialGradient>

          <radialGradient id="outerPetalGrad2" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="45%" stopColor="#b91c1c" />
            <stop offset="80%" stopColor="#7f1d1d" />
            <stop offset="100%" stopColor="#3d0707" />
          </radialGradient>

          {/* Rose Mid Petal Gradients */}
          <radialGradient id="midPetalGrad1" cx="30%" cy="28%" r="65%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="40%" stopColor="#dc2626" />
            <stop offset="75%" stopColor="#991b1b" />
            <stop offset="100%" stopColor="#450a0a" />
          </radialGradient>

          <radialGradient id="midPetalGrad2" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="35%" stopColor="#dc2626" />
            <stop offset="75%" stopColor="#7f1d1d" />
            <stop offset="100%" stopColor="#3d0707" />
          </radialGradient>

          {/* Core Petal Gradient */}
          <radialGradient id="corePetalGrad" cx="35%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="55%" stopColor="#b91c1c" />
            <stop offset="100%" stopColor="#450a0a" />
          </radialGradient>

          {/* Rose Golden Sheen Edge */}
          <linearGradient id="roseGoldEdge" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffd700" />
            <stop offset="50%" stopColor="#fff2a8" />
            <stop offset="100%" stopColor="#ff9ebb" />
          </linearGradient>
        </defs>

        {/* 1. BACKGROUND WRAPPER (PLEATED ACCORDION KRAFT FAN) */}
        <g id="wrapper-fan">
          {/* Main Scalloped Fan Silhouette */}
          <path
            d="M 0,118 
               L -125,-75 C -135,-95 -118,-115 -90,-122 
               L -60,-128 C -35,-132 -10,-132 0,-132 
               C 10,-132 35,-132 60,-128 
               L 90,-122 C 118,-115 135,-95 125,-75 
               Z"
            fill="url(#wrapperFanGrad)"
            stroke="rgba(255, 235, 170, 0.45)"
            strokeWidth="1.5"
            filter="drop-shadow(0 6px 14px rgba(0,0,0,0.5))"
          />

          {/* Pleated Fold Creases (giving 3D accordion depth) */}
          {[-100, -75, -50, -25, 0, 25, 50, 75, 100].map((topX, idx) => {
            const isRidge = idx % 2 === 0;
            return (
              <line
                key={`crease-${idx}`}
                x1={topX}
                y1={-124 + Math.abs(topX) * 0.15}
                x2={topX * 0.18}
                y2={116}
                stroke={isRidge ? 'rgba(255, 255, 255, 0.55)' : 'rgba(70, 45, 18, 0.38)'}
                strokeWidth={isRidge ? 2.0 : 1.5}
              />
            );
          })}

          {/* Golden Scalloped Top Edge Trim */}
          <path
            d="M -125,-75 C -110,-115 -50,-132 0,-132 C 50,-132 110,-115 125,-75"
            fill="none"
            stroke="rgba(255, 215, 0, 0.85)"
            strokeWidth="2.5"
          />

          {/* Inner Translucent Frosted Vellum Tissue */}
          <path
            d="M 0,105 
               L -105,-35 C -80,-55 -30,-62 0,-62 C 30,-62 80,-55 105,-35 
               Z"
            fill="rgba(255, 255, 255, 0.28)"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="1"
          />
        </g>

        {/* 2. FOLIAGE (Lavender, Eucalyptus, Baby's Breath) */}
        <g id="foliage-layer">
          {/* Lavender Spikes Top Center & Flanks */}
          <g transform="translate(0, -118) scale(0.9)">
            {[-24, -12, 0, 12, 24].map((lx, idx) => (
              <g key={`lavender-${idx}`} transform={`translate(${lx}, 0) rotate(${lx * 0.4})`}>
                <line x1="0" y1="20" x2="0" y2="-22" stroke="#3b7a42" strokeWidth="1.6" />
                {[-18, -12, -6, 0, 6, 12].map((ly, bidx) => (
                  <ellipse
                    key={`lav-floret-${bidx}`}
                    cx={bidx % 2 === 0 ? -3 : 3}
                    cy={ly}
                    rx="3.5"
                    ry="2.2"
                    fill={bidx % 2 === 0 ? '#9333ea' : '#c084fc'}
                    transform={`rotate(${bidx % 2 === 0 ? -25 : 25}, ${bidx % 2 === 0 ? -3 : 3}, ${ly})`}
                  />
                ))}
              </g>
            ))}
          </g>

          {/* Eucalyptus Leaf Sprays */}
          {[
            { x: -110, y: -45, rot: -40, scale: 0.9 },
            { x: -115, y: 10, rot: -65, scale: 0.85 },
            { x: 110, y: -45, rot: 40, scale: 0.9 },
            { x: 115, y: 10, rot: 65, scale: 0.85 },
            { x: -50, y: -95, rot: -20, scale: 0.8 },
            { x: 50, y: -95, rot: 20, scale: 0.8 },
          ].map((euc, idx) => (
            <g key={`euc-${idx}`} transform={`translate(${euc.x}, ${euc.y}) rotate(${euc.rot}) scale(${euc.scale})`}>
              <line x1="0" y1="25" x2="0" y2="-25" stroke="#2e5938" strokeWidth="1.8" />
              {[-18, -6, 6, 18].map((ey, pidx) => (
                <g key={`pair-${pidx}`}>
                  <ellipse cx="-10" cy={ey} rx="8.5" ry="6" fill="#4d7c58" stroke="#71a980" strokeWidth="0.8" />
                  <ellipse cx="10" cy={ey} rx="8.5" ry="6" fill="#40694a" stroke="#71a980" strokeWidth="0.8" />
                </g>
              ))}
            </g>
          ))}

          {/* Baby's Breath Florets */}
          {[
            { x: -45, y: -40 },
            { x: 45, y: -40 },
            { x: 0, y: -65 },
            { x: -75, y: 5 },
            { x: 75, y: 5 },
            { x: -15, y: 35 },
            { x: 15, y: 35 },
          ].map((bb, idx) => (
            <g key={`bb-${idx}`} transform={`translate(${bb.x}, ${bb.y})`}>
              {[-6, 0, 6].map((ox, oidx) => (
                <circle
                  key={oidx}
                  cx={ox}
                  cy={(oidx - 1) * 4}
                  r="2.4"
                  fill="#ffffff"
                  filter="drop-shadow(0 0 2px rgba(255,255,255,0.85))"
                />
              ))}
            </g>
          ))}
        </g>

        {/* 3. STEMS BUNDLE */}
        <g id="stems-bundle">
          {[-12, -8, -4, 0, 4, 8, 12].map((sx, idx) => (
            <line
              key={`stem-${idx}`}
              x1={sx}
              y1={115}
              x2={sx * 0.75}
              y2={190 + Math.abs(sx) * 0.8}
              stroke="url(#stemGrad)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* 4. THE 9 ROSE BLOOMS */}
        <g id="nine-roses-group">
          {roses.map((def) => (
            <LayeredRose
              key={`rose-${def.id}`}
              def={def}
              roseColor={config.roseColor || '#b91c1c'}
              bloomProgress={bloomProgress}
              isHovered={hoveredRoseId === def.id}
              time={time}
              onClick={() => onRoseClick?.(def.id)}
              onMouseEnter={() => onRoseHover?.(def.id)}
              onMouseLeave={() => onRoseHover?.(null)}
            />
          ))}
        </g>

        {/* 5. SATIN CRIMSON RIBBON & BOW */}
        <g id="ribbon-bow" transform="translate(0, 124)">
          {/* Ribbon Tails Fluttering Down */}
          <path
            d="M -7,6 
               C -18,35 -32,55 -24,85 
               C -20,95 -12,85 -8,80 
               C -14,50 -2,25 0,8 Z"
            fill="url(#ribbonGrad)"
            filter="drop-shadow(0 3px 6px rgba(0,0,0,0.5))"
          />
          <path
            d="M 7,6 
               C 18,35 32,55 24,85 
               C 20,95 12,85 8,80 
               C 14,50 2,25 0,8 Z"
            fill="url(#ribbonGrad)"
            filter="drop-shadow(0 3px 6px rgba(0,0,0,0.5))"
          />

          {/* Left Ribbon Bow Loop */}
          <path
            d="M 0,0 
               C -18,-15 -42,-12 -42,5 
               C -42,18 -18,12 0,4 Z"
            fill="url(#ribbonGrad)"
            stroke="rgba(255, 180, 200, 0.45)"
            strokeWidth="1.2"
            filter="drop-shadow(0 4px 8px rgba(0,0,0,0.5))"
          />
          {/* Right Ribbon Bow Loop */}
          <path
            d="M 0,0 
               C 18,-15 42,-12 42,5 
               C 42,18 18,12 0,4 Z"
            fill="url(#ribbonGrad)"
            stroke="rgba(255, 180, 200, 0.45)"
            strokeWidth="1.2"
            filter="drop-shadow(0 4px 8px rgba(0,0,0,0.5))"
          />

          {/* Bow Knot */}
          <ellipse
            cx="0"
            cy="2"
            rx="8.5"
            ry="7.5"
            fill="#7f1d1d"
            stroke="rgba(255, 200, 220, 0.5)"
            strokeWidth="1.5"
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.6))"
          />
        </g>
      </svg>
    </div>
  );
};
