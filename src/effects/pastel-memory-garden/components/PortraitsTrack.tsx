import React, { useState } from 'react';
import type { PastelMemoryGardenConfig, CharacterItem } from '../config';
import type { EffectEvent } from '../../../effect-sdk';
import { DEFAULT_CHARACTERS } from './defaultCharacters';

interface PortraitsTrackProps {
  config: PastelMemoryGardenConfig;
  cameraX: number;
  worldWidth: number;
  viewportWidth: number;
  viewportHeight: number;
  emit: (event: EffectEvent) => void;
  overrideCharacters?: CharacterItem[];
}

export const PortraitsTrack: React.FC<PortraitsTrackProps> = ({
  config,
  cameraX,
  worldWidth,
  viewportWidth,
  viewportHeight,
  emit,
  overrideCharacters,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // If in Test A (only background) or Test E (hide girls), don't render portraits
  if (config.testMode === 'testA_bg_only' || config.testMode === 'testE_hide_girls') {
    return null;
  }

  // Active characters list: priority: overrideCharacters -> config.characters -> DEFAULT_CHARACTERS
  let activeList: CharacterItem[] =
    overrideCharacters && overrideCharacters.length > 0
      ? overrideCharacters
      : config.characters && config.characters.length > 0
      ? config.characters
      : DEFAULT_CHARACTERS;

  // In Test D (replace demo): replace the first character with a distinct test image and name
  if (config.testMode === 'testD_replace_demo' && activeList.length > 0) {
    activeList = activeList.map((item, idx) => {
      if (idx === 0) {
        return {
          ...item,
          name: 'Ánh Tuyết (Ảnh đã thay)',
          scale: 1.12,
        };
      }
      return item;
    });
  }

  // Responsive scale factor based on viewport height (calibrated to 900px standard)
  const responsiveScale = Math.max(0.65, Math.min(1.0, viewportHeight / 850));
  // Standard portrait height is around 42% of viewport height
  const basePortraitHeight = Math.round(viewportHeight * 0.42);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10, // Sits in front of background (zIndex: 2), behind foreground flower hedge (zIndex: 15)
      }}
    >
      {activeList.map((item) => {
        if (item.visible === false) return null;

        // Calculate screen position with seamless wrapping
        const rawOffset = item.worldX - cameraX;
        let screenX = ((rawOffset % worldWidth) + worldWidth) % worldWidth;
        if (screenX > worldWidth - 600) {
          screenX -= worldWidth;
        }

        const positions = [screenX];
        if (screenX < 600) {
          positions.push(screenX + worldWidth);
        }

        return positions.map((posX, pIdx) => {
          // Cull off-screen elements
          if (posX < -500 || posX > viewportWidth + 500) {
            return null;
          }

          const isHovered = hoveredId === item.id;
          const totalScale = item.scale * responsiveScale * (isHovered ? 1.04 : 1.0);
          const portraitHeight = Math.round(basePortraitHeight * totalScale);

          return (
            <div
              key={`${item.id}-${pIdx}`}
              style={{
                position: 'absolute',
                // Anchor at baseline (bottom edge where feet touch the terrace ground)
                bottom: `${100 - item.baselineY}%`,
                left: `${posX}px`,
                transform: 'translate(-50%, 0)',
                transformOrigin: 'bottom center',
                transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
                zIndex: (item.zIndex || 10) + (isHovered ? 15 : 0),
                pointerEvents: 'auto',
                cursor: config.dragEnabled ? 'grab' : 'pointer',
                userSelect: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => {
                emit({
                  type: 'interaction',
                  name: 'portrait_click',
                  payload: { id: item.id, name: item.name },
                });
              }}
            >
              {/* Character Image Element */}
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={item.imageUrl}
                  alt={item.name || 'Girl Portrait'}
                  draggable={false}
                  style={{
                    display: 'block',
                    height: `${portraitHeight}px`,
                    width: 'auto',
                    maxWidth: '480px',
                    objectFit: 'contain',
                    filter: isHovered
                      ? 'drop-shadow(0 14px 28px rgba(244, 114, 182, 0.45)) brightness(1.03)'
                      : 'drop-shadow(0 8px 18px rgba(219, 39, 119, 0.16))',
                    transition: 'filter 0.25s ease',
                  }}
                />

                {/* Hand-written Cursive Name Badge (placed gracefully near the bottom) */}
                {config.showNames && item.name && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: `${item.labelOffsetY || -12}px`,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 14px',
                      borderRadius: '18px',
                      background: 'rgba(255, 255, 255, 0.88)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.95)',
                      boxShadow: '0 4px 16px rgba(236, 72, 153, 0.2)',
                      pointerEvents: 'none',
                      zIndex: 22, // Above foreground flower hedge
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Dancing Script', 'Brush Script MT', 'Great Vibes', cursive",
                        fontSize: '22px',
                        fontWeight: 700,
                        fontStyle: 'italic',
                        color: '#831843', // deep rose
                        textShadow:
                          '0 1px 2px rgba(255, 255, 255, 0.8), 0 0 10px rgba(244, 114, 182, 0.35)',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {item.name}
                    </span>
                    <span style={{ fontSize: '11px', color: '#f43f5e', opacity: 0.85 }}>✦</span>
                  </div>
                )}
              </div>
            </div>
          );
        });
      })}
    </div>
  );
};
