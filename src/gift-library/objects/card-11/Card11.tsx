import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { AssetConfig } from '../../types';
import './Card11.css';

export interface Card11Props {
  config?: AssetConfig;
  color?: string;
  roughness?: number;
  metalness?: number;
  paused?: boolean;
  quality?: 'low' | 'high';
}

/**
 * Card11: "Card 11" (ID: card-11)
 *
 * 100% exact faithful reproduction of "card 11/i-love-you-matrix":
 * - Exact DOM structure: <div id="ui"> with .love > .love_horizontal > .love_vertical > .love_word
 * - Exact CSS animations: @keyframes horizontal (10s alternate) and @keyframes vertical (20s linear)
 * - Exact staggering: -300ms delay per item index (--i: 1 to 100), ensuring perfect continuous loop spacing
 * - Supports real-time text/phrase editing, color customization, and full 3D spatial hand/mouse gestures
 */
export const Card11: React.FC<Card11Props> = ({
  config,
  paused = false,
  quality = 'high',
}) => {
  const c11 = config?.card11;
  const motion = config?.motion;

  // Customization parameters with original defaults
  const primaryText = c11?.text?.trim() || 'I love you';
  const phrases = useMemo(() => {
    if (c11?.phrases && c11.phrases.length > 0) {
      const valid = c11.phrases.filter((p) => p && p.trim().length > 0);
      if (valid.length > 0) return valid;
    }
    return [primaryText];
  }, [c11?.phrases, primaryText]);

  const rawItemCount = c11?.itemCount ?? 100;
  const totalItems = quality === 'low'
    ? Math.min(60, Math.max(10, rawItemCount))
    : Math.min(160, Math.max(10, rawItemCount));

  const speed = c11?.speed ?? 1.0;
  const textColor = c11?.textColor || config?.appearance?.color || '#ea80b0';
  const glowColor = c11?.glowColor || '#ffffff';
  const glowIntensity = c11?.glowIntensity ?? 1.0;
  const secondaryColor = c11?.secondaryColor || '#ff6584';
  const useAlternatingColors = c11?.useAlternatingColors ?? false;
  const backgroundColor = c11?.backgroundColor || '#000000';
  const tiltAngleDeg = c11?.tiltAngleDeg ?? -30;
  const fontSize = c11?.fontSize ?? 1.0;
  const depth3D = c11?.depth3D ?? 0;
  const heartScale = c11?.heartScale ?? 0.85;
  const autoRotate = (c11?.autoRotate ?? false) || (motion?.spin?.enabled ?? false);
  const autoRotateSpeed = c11?.autoRotateSpeed ?? (motion?.spin?.speedDegPerSecond ? motion.spin.speedDegPerSecond / 15 : 0.8);

  // 3D Spatial hand/touch manipulation state
  const [rotX, setRotX] = useState<number>(0);
  const [rotY, setRotY] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1.0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const dragStartRef = useRef<{ x: number; y: number; startRotX: number; startRotY: number }>({
    x: 0,
    y: 0,
    startRotX: 0,
    startRotY: 0,
  });

  const pinchDistRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Auto-rotation in 3D space
  useEffect(() => {
    if (!autoRotate || isDragging || paused) return;

    let lastTime = performance.now();
    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      setRotY((prev) => (prev + dt * autoRotateSpeed * 15) % 360);
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [autoRotate, autoRotateSpeed, isDragging, paused]);

  // Pointer drag 3D rotation (Hand gestures & mouse drag)
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startRotX: rotX,
      startRotY: rotY,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [rotX, rotY]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    const nextRotY = (dragStartRef.current.startRotY + dx * 0.45) % 360;
    const nextRotX = Math.max(-85, Math.min(85, dragStartRef.current.startRotX - dy * 0.45));

    setRotY(nextRotY);
    setRotX(nextRotX);
  }, [isDragging]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  }, []);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    setZoom((prev) => {
      const next = prev - e.deltaY * 0.0015;
      return Math.max(0.4, Math.min(2.5, next));
    });
  }, []);

  // Multi-touch pinch zoom
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      pinchDistRef.current = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && pinchDistRef.current !== null) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const newDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const ratio = newDist / pinchDistRef.current;
      setZoom((prev) => Math.max(0.4, Math.min(2.5, prev * ratio)));
      pinchDistRef.current = newDist;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    pinchDistRef.current = null;
  }, []);

  // Reset 3D camera angle
  const handleResetView = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setRotX(0);
    setRotY(0);
    setZoom(1.0);
  }, []);

  // MotionRig subtle effects
  const floatY = motion?.float?.enabled ? Math.sin(Date.now() * 0.002 * (motion.float.speed || 1)) * (motion.float.amplitude * 40 || 5) : 0;
  const heartbeatScale = motion?.heartbeat?.enabled ? 1 + Math.sin(Date.now() * 0.007) * (motion.heartbeat.strength || 0.04) : 1;

  // Prepare exact totalItems (default 100) with exact timing delay calculation
  const items = useMemo(() => {
    const delayPerItem = 300 / speed;
    return Array.from({ length: totalItems }, (_, idx) => {
      const i = idx + 1; // 1 to totalItems
      const phrase = phrases[idx % phrases.length];
      const isAlt = useAlternatingColors && idx % 2 === 1;
      const c = isAlt ? secondaryColor : textColor;
      // Staggered negative delay in milliseconds: -300ms, -600ms, -900ms...
      const delayMs = -i * delayPerItem;
      // 3D Z-depth displacement
      const zOffset = depth3D > 0
        ? Math.sin((idx / totalItems) * Math.PI * 2) * depth3D * 120
        : 0;

      return {
        i,
        text: phrase,
        color: c,
        delayMs,
        zOffset,
      };
    });
  }, [totalItems, phrases, useAlternatingColors, secondaryColor, textColor, depth3D, speed]);

  const hDuration = `${10 / speed}s`;
  const vDuration = `${20 / speed}s`;

  return (
    <div
      className={`card11-root ${paused ? 'card11-paused' : ''}`}
      style={{
        backgroundColor,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Card 11: I Love You Animation Matrix"
    >
      {/* 3D Perspective Stage for interactive hand / mouse gesture rotation */}
      <div className="card11-perspective-wrapper">
        <div
          className="card11-3d-stage"
          style={{
            transform: `translate3d(0, ${floatY}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${zoom * heartScale * heartbeatScale})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          {/* EXACT ORIGINAL #ui CONTAINER FROM index.html */}
          <div id="ui">
            {items.map((item) => (
              <div
                key={item.i}
                className="love"
                style={{
                  '--i': item.i,
                  transform: item.zOffset !== 0 ? `translate3d(0, 0, ${item.zOffset}px)` : undefined,
                } as React.CSSProperties}
              >
                <div
                  className="love_horizontal"
                  style={{
                    animationDelay: `${item.delayMs}ms`,
                    animationDuration: hDuration,
                  }}
                >
                  <div
                    className="love_vertical"
                    style={{
                      animationDelay: `${item.delayMs}ms`,
                      animationDuration: vDuration,
                    }}
                  >
                    <div
                      className="love_word"
                      style={{
                        color: item.color,
                        fontSize: `${1.4 * fontSize}rem`,
                        textShadow: `0 0 ${10 * glowIntensity}px ${glowColor}`,
                        transform: `translateY(-100%) rotate(${tiltAngleDeg}deg)`,
                      }}
                    >
                      {item.text}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3D Reset view button */}
      {(rotX !== 0 || rotY !== 0 || zoom !== 1.0) && (
        <button
          type="button"
          onClick={handleResetView}
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            background: 'rgba(0, 0, 0, 0.75)',
            border: '1px solid rgba(234, 128, 176, 0.4)',
            color: '#ea80b0',
            borderRadius: '20px',
            padding: '6px 14px',
            fontSize: '12px',
            cursor: 'pointer',
            backdropFilter: 'blur(6px)',
            zIndex: 10,
          }}
          title="Đặt lại góc nhìn 3D"
        >
          ↺ Góc nhìn chuẩn
        </button>
      )}
    </div>
  );
};

export default Card11;