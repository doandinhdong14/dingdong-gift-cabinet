import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ParticleRoseHeartConfig } from '../config';

export interface HoldButtonProps {
  config: ParticleRoseHeartConfig;
  opacity: number;
  onTrigger: () => void;
  disabled?: boolean;
}

export const HoldButton: React.FC<HoldButtonProps> = ({
  config,
  opacity,
  onTrigger,
  disabled = false,
}) => {
  const [progress, setProgress] = useState(0); // 0.0 to 1.0
  const [isHolding, setIsHolding] = useState(false);
  const holdStartRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isTriggeredRef = useRef(false);

  // Auto trigger mode
  useEffect(() => {
    if (config.triggerMode === 'auto' && !disabled && !isTriggeredRef.current) {
      const timer = setTimeout(() => {
        isTriggeredRef.current = true;
        onTrigger();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [config.triggerMode, disabled, onTrigger]);

  const handlePointerDown = useCallback(() => {
    if (disabled || isTriggeredRef.current) return;

    if (config.triggerMode === 'click') {
      isTriggeredRef.current = true;
      onTrigger();
      return;
    }

    setIsHolding(true);
    holdStartRef.current = performance.now();

    const checkProgress = (now: number) => {
      if (!holdStartRef.current) return;
      const elapsed = now - holdStartRef.current;
      const dur = Math.max(200, config.holdDuration || 700);
      const p = Math.min(1.0, elapsed / dur);
      setProgress(p);

      if (p >= 1.0) {
        setIsHolding(false);
        isTriggeredRef.current = true;
        onTrigger();
      } else {
        animFrameRef.current = requestAnimationFrame(checkProgress);
      }
    };

    animFrameRef.current = requestAnimationFrame(checkProgress);
  }, [disabled, config.triggerMode, config.holdDuration, onTrigger]);

  const handlePointerUp = useCallback(() => {
    if (config.triggerMode === 'click') return;
    setIsHolding(false);
    holdStartRef.current = null;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    // Reset progress smoothly
    setProgress(0);
  }, [config.triggerMode]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  if (opacity <= 0.005) return null;

  // SVG circular arc progress metrics
  const radius = 24;
  const stroke = 3;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div
      className="hold-button-container"
      style={{
        position: 'absolute',
        bottom: '36px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        opacity,
        transition: 'opacity 0.4s ease',
        pointerEvents: disabled ? 'none' : 'auto',
        userSelect: 'none',
        zIndex: 10,
      }}
    >
      {/* Label text: "Giữ để bắt đầu" */}
      <span
        style={{
          fontFamily: "'Dancing Script', 'Comfortaa', cursive, sans-serif",
          fontSize: '16px',
          fontWeight: 600,
          color: '#ff85c0',
          letterSpacing: '0.5px',
          textShadow: '0 0 10px rgba(255, 95, 173, 0.8), 0 2px 4px rgba(0, 0, 0, 0.9)',
          opacity: isHolding ? 0.9 : 0.75,
          transition: 'all 0.2s ease',
        }}
      >
        {config.holdText || 'Giữ để bắt đầu'}
      </span>

      {/* Circular Interactive Button */}
      <div
        role="button"
        tabIndex={0}
        aria-label={config.holdText || 'Giữ để bắt đầu'}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          position: 'relative',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: disabled ? 'default' : 'pointer',
          transform: isHolding ? 'scale(0.94)' : 'scale(1)',
          transition: 'transform 0.15s ease',
          background: 'radial-gradient(circle, rgba(255, 95, 173, 0.15) 0%, rgba(20, 5, 15, 0.4) 100%)',
          touchAction: 'none',
        }}
      >
        <svg
          width="56"
          height="56"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: 'rotate(-90deg)',
          }}
        >
          {/* Background circle track */}
          <circle
            cx="28"
            cy="28"
            r={normalizedRadius}
            fill="none"
            stroke="rgba(255, 105, 180, 0.35)"
            strokeWidth={stroke}
          />
          {/* Active progress ring */}
          <circle
            cx="28"
            cy="28"
            r={normalizedRadius}
            fill="none"
            stroke="#ff5fad"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{
              strokeDashoffset,
              transition: isHolding ? 'none' : 'stroke-dashoffset 0.2s ease',
              filter: 'drop-shadow(0 0 6px #ff5fad)',
            }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center glowing dot */}
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#ff85c0',
            boxShadow: '0 0 10px #ff5fad, 0 0 20px rgba(255, 42, 112, 0.6)',
            transform: isHolding ? 'scale(1.25)' : 'scale(1)',
            transition: 'transform 0.15s ease',
          }}
        />
      </div>
    </div>
  );
};
