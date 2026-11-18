import React from 'react';
import type { EffectEvent } from '../../../effect-sdk';
import type { PastelMemoryGardenConfig } from '../config';
import { Volume2, VolumeX, Image as ImageIcon, Mail } from 'lucide-react';

interface FixedUIOverlayProps {
  config: PastelMemoryGardenConfig;
  emit: (event: EffectEvent) => void;
  onToggleSound: () => void;
}

export const FixedUIOverlay: React.FC<FixedUIOverlayProps> = ({
  config,
  emit,
  onToggleSound,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 50, // Topmost fixed layer
      }}
    >
      {/* 1. Top-Left Logo Button */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '24px',
          pointerEvents: 'auto',
        }}
      >
        <button
          type="button"
          aria-label="DingDong Logo"
          onClick={() => {
            emit({ type: 'interaction', name: 'logo_click' });
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1.5px solid rgba(244, 114, 182, 0.45)',
            boxShadow: '0 4px 12px rgba(244, 114, 182, 0.25)',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.06)';
            e.currentTarget.style.boxShadow = '0 6px 18px rgba(244, 114, 182, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(244, 114, 182, 0.25)';
          }}
        >
          {/* Stylized Heart Gift Icon 'D' */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="5" width="20" height="16" rx="5" stroke="#f43f5e" strokeWidth="2" />
            <path
              d="M7 5C7 2.8 8.8 1.5 10.5 3L12 4.5L13.5 3C15.2 1.5 17 2.8 17 5"
              stroke="#f43f5e"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M12 9V17M8 13H16"
              stroke="#f43f5e"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* 2. Top-Right Sound Button */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '24px',
          pointerEvents: 'auto',
        }}
      >
        <button
          type="button"
          aria-label={config.soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          onClick={() => {
            onToggleSound();
            emit({
              type: 'interaction',
              name: 'sound_toggle',
              payload: { enabled: !config.soundEnabled },
            });
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.82)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1.5px solid rgba(255, 255, 255, 0.9)',
            boxShadow: '0 4px 14px rgba(236, 72, 153, 0.2)',
            cursor: 'pointer',
            color: '#be185d',
            transition: 'transform 0.2s ease, background-color 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {config.soundEnabled ? (
            <Volume2 size={20} strokeWidth={2.2} />
          ) : (
            <VolumeX size={20} strokeWidth={2.2} />
          )}
        </button>
      </div>

      {/* 3. Bottom-Right Action Buttons: "Miền ký ức" and "Lá thư" */}
      <div
        style={{
          position: 'absolute',
          bottom: '26px',
          right: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          pointerEvents: 'auto',
        }}
      >
        {/* "Miền ký ức" Button */}
        <button
          type="button"
          onClick={() => {
            emit({ type: 'interaction', name: 'open_memory_realm' });
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.95)',
            boxShadow: '0 4px 16px rgba(236, 72, 153, 0.22)',
            color: '#831843',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
            userSelect: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(236, 72, 153, 0.32)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(236, 72, 153, 0.22)';
          }}
        >
          <ImageIcon size={17} strokeWidth={2.2} color="#f43f5e" />
          <span>Miền ký ức</span>
        </button>

        {/* "Lá thư" Button */}
        <button
          type="button"
          onClick={() => {
            emit({ type: 'interaction', name: 'open_letter' });
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.95)',
            boxShadow: '0 4px 16px rgba(236, 72, 153, 0.22)',
            color: '#831843',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
            userSelect: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(236, 72, 153, 0.32)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(236, 72, 153, 0.22)';
          }}
        >
          <Mail size={17} strokeWidth={2.2} color="#f43f5e" />
          <span>Lá thư</span>
        </button>
      </div>
    </div>
  );
};
