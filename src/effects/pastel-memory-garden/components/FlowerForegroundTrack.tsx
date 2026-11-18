import React from 'react';
import type { PastelMemoryGardenConfig } from '../config';
import flowerRibbonImg from '../assets/foreground_flower_ribbon.png';

interface FlowerForegroundTrackProps {
  config: PastelMemoryGardenConfig;
  cameraX: number;
  worldWidth: number;
  viewportHeight: number;
}

export const FlowerForegroundTrack: React.FC<FlowerForegroundTrackProps> = ({
  config,
  cameraX,
  worldWidth,
  viewportHeight,
}) => {
  // If disabled or in Test A (background only) or Test B (bg + girls, no foreground), don't render
  if (
    !config.showForegroundFlowers ||
    config.testMode === 'testA_bg_only' ||
    config.testMode === 'testB_bg_girls'
  ) {
    return null;
  }

  // Parallax ratio for foreground flowers is strictly 1.0 (synchronous with character feet)
  const shift = ((cameraX % worldWidth) + worldWidth) % worldWidth;
  const responsiveRatio = Math.max(0.65, Math.min(1.0, viewportHeight / 900));

  // Natural scale: strip width of each repeating segment
  const stripWidth = Math.round(1920 * responsiveRatio);

  // Height is modest (around 18% - 24% of viewport height) so it only gently covers the bottom feet/laps
  const stripHeight = Math.round(
    viewportHeight * config.foregroundFlowerHeight * config.foregroundFlowerDensity
  );

  return (
    <div
      style={{
        position: 'absolute',
        // Placed gently at the base of the flower terrace (around 62% to 68% from top)
        // so it only overlaps the bottom 10-15% of the girl's skirt/feet without ever touching chest/face
        top: '60%',
        left: 0,
        width: '100%',
        height: `${stripHeight}px`,
        pointerEvents: 'none',
        zIndex: 15, // In front of character photos (zIndex: 10), but behind UI overlay
        overflow: 'visible',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${worldWidth * 2}px`,
          height: '100%',
          display: 'flex',
          transform: `translate3d(${-shift}px, 0, 0)`,
          willChange: 'transform',
        }}
      >
        {/* Seamless Repeating Flower Hedge with Pink Satin Ribbon */}
        {[0, 1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            style={{
              position: 'relative',
              width: `${stripWidth}px`,
              height: '100%',
              flexShrink: 0,
              backgroundImage: `url(${flowerRibbonImg})`,
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'bottom center',
              filter: 'drop-shadow(0 6px 16px rgba(219, 39, 119, 0.22))',
            }}
          />
        ))}
      </div>
    </div>
  );
};
