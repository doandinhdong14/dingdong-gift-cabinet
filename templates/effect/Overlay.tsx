import React from 'react';
import type { EffectProps } from '../../effect-sdk';
import type { EffectConfig } from './config';

export const Overlay: React.FC<EffectProps<EffectConfig>> = ({ config, emit }) => {
  if (!config.message) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(8px)',
        padding: '8px 20px',
        borderRadius: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <span
        style={{
          fontWeight: 600,
          fontSize: '0.875rem',
          color: '#1e293b',
        }}
      >
        {config.message}
      </span>
      <button
        type="button"
        onClick={() => {
          emit({
            type: 'interaction',
            name: 'badge-click',
          });
        }}
        style={{
          border: 'none',
          background: config.color,
          color: '#fff',
          borderRadius: '12px',
          padding: '2px 8px',
          fontSize: '0.75rem',
          cursor: 'pointer',
        }}
      >
        Tương tác
      </button>
    </div>
  );
};
