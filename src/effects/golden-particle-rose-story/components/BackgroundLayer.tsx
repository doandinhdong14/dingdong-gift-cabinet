import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  phase: number;
  twinkleSpeed: number;
  color: string;
}

interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  active: boolean;
}

export const BackgroundLayer: React.FC<{
  width: number;
  height: number;
  time: number;
  isPaused: boolean;
}> = ({ width, height, time, isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const meteorsRef = useRef<Meteor[]>([]);

  // Initialize stars once
  useEffect(() => {
    const stars: Star[] = [];
    const count = 120;
    const colors = [
      '#ffffff',
      '#fff4cc',
      '#ffe082',
      '#ffd54f',
      'rgba(190, 215, 255, 0.9)',
      'rgba(235, 180, 255, 0.8)',
    ];

    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * (width || 358),
        y: Math.random() * (height || 746),
        size: 0.6 + Math.random() * 1.4,
        baseAlpha: 0.3 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: 1.5 + Math.random() * 3.0,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    starsRef.current = stars;

    // Meteors
    meteorsRef.current = [
      { x: -50, y: -50, length: 70, speed: 450, angle: Math.PI * 0.28, alpha: 0, active: false },
      { x: -50, y: -50, length: 50, speed: 520, angle: Math.PI * 0.32, alpha: 0, active: false },
    ];
  }, [width, height]);

  // Render on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Deep radial dark sky background
    const bgGrad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.45,
      20,
      width * 0.5,
      height * 0.5,
      height * 0.75
    );
    bgGrad.addColorStop(0, '#0a0a14');
    bgGrad.addColorStop(0.5, '#06060c');
    bgGrad.addColorStop(1, '#030306');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Draw stars
    for (const star of starsRef.current) {
      const alpha = Math.max(
        0.1,
        star.baseAlpha + Math.sin(time * star.twinkleSpeed + star.phase) * 0.3
      );
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = star.color;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Spawn / update shooting stars occasionally
    if (!isPaused) {
      for (const meteor of meteorsRef.current) {
        if (!meteor.active) {
          if (Math.random() < 0.003) {
            meteor.active = true;
            meteor.x = Math.random() * (width * 0.7);
            meteor.y = Math.random() * (height * 0.35);
            meteor.alpha = 0.85;
          }
        } else {
          meteor.x += Math.cos(meteor.angle) * 7.5;
          meteor.y += Math.sin(meteor.angle) * 7.5;
          meteor.alpha -= 0.018;

          if (meteor.alpha <= 0 || meteor.x > width + 100 || meteor.y > height + 100) {
            meteor.active = false;
          } else {
            // Draw meteor streak
            ctx.save();
            ctx.globalAlpha = meteor.alpha;
            const grad = ctx.createLinearGradient(
              meteor.x,
              meteor.y,
              meteor.x - Math.cos(meteor.angle) * meteor.length,
              meteor.y - Math.sin(meteor.angle) * meteor.length
            );
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.3, '#ffd700');
            grad.addColorStop(1, 'transparent');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(meteor.x, meteor.y);
            ctx.lineTo(
              meteor.x - Math.cos(meteor.angle) * meteor.length,
              meteor.y - Math.sin(meteor.angle) * meteor.length
            );
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    }
  }, [width, height, time, isPaused]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};
