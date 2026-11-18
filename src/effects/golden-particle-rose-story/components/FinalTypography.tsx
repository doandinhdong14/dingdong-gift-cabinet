import React from 'react';
import type { GoldenParticleStoryConfig } from '../config';

export interface FinalTypographyProps {
  config: GoldenParticleStoryConfig;
  opacity: number;
}

export const FinalTypography: React.FC<FinalTypographyProps> = ({
  config,
  opacity,
}) => {
  if (opacity <= 0.005) return null;

  return (
    <div
      className="final-typography-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '42px 18px 24px 18px',
        boxSizing: 'border-box',
        opacity,
        transition: 'opacity 0.8s ease-out',
        zIndex: 12,
        userSelect: 'none',
      }}
    >
      {/* TOP HEADER SECTION */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          width: '100%',
          maxWidth: '340px',
        }}
      >
        {/* 1. Main Title: "Tặng anh bó hoa không bao giờ tàn" */}
        <h1
          style={{
            margin: '0 0 10px 0',
            fontFamily: "'Dancing Script', 'Caveat', 'Playpen Sans', cursive, sans-serif",
            fontWeight: 700,
            fontSize: '28px',
            lineHeight: '1.25',
            color: '#fff0f3',
            textShadow: '0 0 16px rgba(255, 180, 195, 0.85), 0 2px 4px rgba(0,0,0,0.85)',
            whiteSpace: 'pre-line',
            letterSpacing: '0.4px',
          }}
        >
          {config.finalTitle}
        </h1>

        {/* 2. Pill/Badge: "9 bông hồng ♥ Mãi mãi bên nhau" */}
        <div
          style={{
            margin: '0 0 10px 0',
            padding: '5px 18px',
            borderRadius: '20px',
            backgroundColor: 'rgba(28, 14, 20, 0.82)',
            border: '1px solid rgba(244, 63, 94, 0.45)',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5), inset 0 0 8px rgba(244, 63, 94, 0.2)',
            backdropFilter: 'blur(5px)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span
            style={{
              fontFamily: "'Quicksand', 'Comfortaa', sans-serif",
              fontSize: '13px',
              fontWeight: 600,
              color: '#ffe4e6',
              letterSpacing: '0.4px',
            }}
          >
            {config.finalSubtitle}
          </span>
        </div>

        {/* 3. Message: "Cảm ơn anh vì đã luôn là điểm tựa..." */}
        <p
          style={{
            margin: 0,
            fontFamily: "'Caveat', 'Dancing Script', 'Quicksand', cursive, sans-serif",
            fontStyle: 'italic',
            fontWeight: 600,
            fontSize: '15.5px',
            lineHeight: '1.45',
            color: '#ffd5dd',
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.9), 0 0 8px rgba(244, 63, 94, 0.35)',
            whiteSpace: 'pre-line',
            padding: '0 6px',
          }}
        >
          {config.finalMessage}
        </p>
      </div>

      {/* BOTTOM HINT PILL: "Nhấn vào bông hồng để xem ảnh nhé" */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'auto',
          marginBottom: '6px',
        }}
      >
        <div
          style={{
            padding: '9px 24px',
            borderRadius: '24px',
            backgroundColor: 'rgba(25, 12, 22, 0.88)',
            border: '1px solid rgba(251, 113, 133, 0.5)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.55), 0 0 12px rgba(225, 29, 72, 0.35)',
            backdropFilter: 'blur(6px)',
            color: '#ffe4e6',
            fontFamily: "'Quicksand', 'Comfortaa', sans-serif",
            fontSize: '13.5px',
            fontWeight: 500,
            letterSpacing: '0.3px',
            textAlign: 'center',
            animation: 'pulseHint 2.4s ease-in-out infinite',
          }}
        >
          {config.interactionHint}
        </div>
      </div>
    </div>
  );
};
