import React from 'react';
import type { PastelMemoryGardenConfig } from '../config';
import bgPanoramaImg from '../assets/garden_panorama_bg.jpg';

interface BackgroundPanoramaLayerProps {
  config: PastelMemoryGardenConfig;
  cameraX: number;
  worldWidth: number;
}

export const BackgroundPanoramaLayer: React.FC<BackgroundPanoramaLayerProps> = ({
  config,
  cameraX,
  worldWidth,
}) => {
  // Parallax ratio for background scenery
  const parallax = 0.35 * config.parallaxStrength;
  const shift = ((cameraX * parallax) % worldWidth + worldWidth) % worldWidth;

  // Additional tinting overlay according to the chosen sunset palette
  const PALETTE_TINTS = {
    sunset: 'rgba(254, 215, 170, 0.12)', // warm peach
    dawn: 'rgba(224, 231, 255, 0.15)',   // morning lavender
    rose: 'rgba(244, 114, 182, 0.14)',   // rose pink
    golden: 'rgba(253, 224, 71, 0.14)',  // golden hour
  };

  const tintColor = PALETTE_TINTS[config.backgroundPalette] || PALETTE_TINTS.sunset;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
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
          display: 'flex',
          transform: `translate3d(${-shift}px, 0, 0)`,
          willChange: 'transform',
        }}
      >
        {/* Seamlessly repeating background panorama */}
        {[0, 1, 2].map((idx) => (
          <div
            key={idx}
            style={{
              position: 'relative',
              width: `${worldWidth}px`,
              height: '100%',
              flexShrink: 0,
              backgroundImage: `url(${bgPanoramaImg})`,
              backgroundSize: '100% 100%',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Palette color atmosphere tone */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: tintColor,
                mixBlendMode: 'soft-light',
              }}
            />

            {/* Test F indicator: subtle seamless boundary indicator during motion test */}
            {config.testMode === 'testF_panorama_motion' && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '2px',
                  height: '100%',
                  backgroundColor: 'rgba(236, 72, 153, 0.5)',
                  boxShadow: '0 0 8px rgba(236, 72, 153, 0.8)',
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
