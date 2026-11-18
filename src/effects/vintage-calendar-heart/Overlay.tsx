import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import type { EffectProps } from '../../effect-sdk';
import { createSeededRandom } from '../../effect-sdk';
import type { VintageCalendarConfig } from './config';
import type { TimelinePhase, FloatingParticle } from './types';
import { buildCalendarDays } from './calendarData';
import { VintageCalendarRenderer } from './CanvasRenderer';
import styles from './Effect.module.css';

export const Overlay: React.FC<EffectProps<VintageCalendarConfig>> = ({
  config,
  runtime,
  emit,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<VintageCalendarRenderer | null>(null);

  const days = useMemo(() => buildCalendarDays(config), [config]);

  // Timeline & State Machine Refs
  const phaseRef = useRef<TimelinePhase>(config.autoplay ? 'FLIPPING_PAGE' : 'IDLE');
  const [currentPhase, setCurrentPhase] = useState<TimelinePhase>(phaseRef.current);

  const activePageRef = useRef<number>(0);
  const flipProgressRef = useRef<number>(0);
  const heartDrawProgressRef = useRef<number>(0);
  const messageRevealProgressRef = useRef<number>(0);
  const timelineTimeRef = useRef<number>(0);
  const transitionTimerRef = useRef<number>(0);
  const isWaitingBetweenPagesRef = useRef<boolean>(false);
  const buttonPulseRef = useRef<number>(0);

  const particlesRef = useRef<FloatingParticle[]>([]);
  const hasEmittedCompleteRef = useRef<boolean>(false);
  const hasEmittedRevealRef = useRef<boolean>(false);
  const lastRunIdRef = useRef<string>(runtime.runId);

  // Initialize particles with deterministic PRNG
  const initParticles = useCallback(() => {
    const prng = createSeededRandom(19112026);
    const count = config.heartParticleCount ?? 15;
    const particles: FloatingParticle[] = [];

    const heartColors = [
      config.accentColor || '#ff4070',
      '#ff6b8b',
      '#f43f5e',
      '#fb7185',
      '#fda4af',
    ];

    for (let i = 0; i < count; i++) {
      const isHeart = prng() < 0.75;
      const baseX = 40 + prng() * 288;
      const baseY = 240 + prng() * 260;

      particles.push({
        id: i,
        x: baseX,
        y: baseY,
        baseX,
        vy: -(22 + prng() * 38),
        wobbleAmp: 8 + prng() * 16,
        wobbleFreq: 1.5 + prng() * 2.5,
        wobblePhase: prng() * Math.PI * 2,
        scale: isHeart ? 0.7 + prng() * 0.7 : 0.8 + prng() * 1.0,
        alpha: 0,
        maxAlpha: isHeart ? 0.45 + prng() * 0.35 : 0.6 + prng() * 0.4,
        life: 0,
        maxLife: 3.5 + prng() * 2.5,
        type: isHeart ? 'heart' : 'sparkle',
        color: heartColors[Math.floor(prng() * heartColors.length)],
      });
    }

    particlesRef.current = particles;
  }, [config.heartParticleCount, config.accentColor]);

  // Handle runId reset (Replay / Reset)
  useEffect(() => {
    if (runtime.runId !== lastRunIdRef.current) {
      lastRunIdRef.current = runtime.runId;
      phaseRef.current = config.autoplay ? 'FLIPPING_PAGE' : 'IDLE';
      setCurrentPhase(phaseRef.current);
      activePageRef.current = 0;
      flipProgressRef.current = 0;
      heartDrawProgressRef.current = 0;
      messageRevealProgressRef.current = 0;
      timelineTimeRef.current = 0;
      transitionTimerRef.current = 0;
      isWaitingBetweenPagesRef.current = false;
      hasEmittedCompleteRef.current = false;
      hasEmittedRevealRef.current = false;
      rendererRef.current?.resetTearState();
      initParticles();
    }
  }, [runtime.runId, config.autoplay, initParticles]);

  // Start sequence trigger
  const handleStart = useCallback(() => {
    if (phaseRef.current === 'IDLE') {
      phaseRef.current = 'FLIPPING_PAGE';
      setCurrentPhase('FLIPPING_PAGE');
      activePageRef.current = 0;
      flipProgressRef.current = 0;
      transitionTimerRef.current = 0;
      isWaitingBetweenPagesRef.current = false;
      rendererRef.current?.resetTearState();
      emit({
        type: 'interaction',
        name: 'flip-start',
      });
    }
  }, [emit]);

  // Initialize renderer and prepare pages
  useEffect(() => {
    const renderer = new VintageCalendarRenderer();
    rendererRef.current = renderer;
    renderer.preparePages(days, config);
    initParticles();
  }, [days, config, initParticles]);

  // Canvas size and resize observer
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.max(300, Math.floor(rect.width));
      const h = Math.max(400, Math.floor(rect.height));

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      rendererRef.current?.resize(w, h, dpr);
    };

    handleResize();

    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Main animation loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const rawDelta = Math.min(0.064, (now - lastTime) / 1000);
      lastTime = now;

      const isPaused = runtime.isPaused;
      const isVisible = runtime.isVisible;
      const speed = config.animationSpeed || 1.0;
      const delta = isPaused || !isVisible ? 0 : rawDelta * speed;

      // Update state machine & timeline
      if (delta > 0) {
        timelineTimeRef.current += delta;
        buttonPulseRef.current = (buttonPulseRef.current + delta * 1.8) % 1;
        rendererRef.current?.updatePaperFibers(delta);

        const currentPhaseVal = phaseRef.current;
        const totalPages = days.length;
        const targetPageIndex = totalPages - 1; // Index 4 (Day 19)

        if (currentPhaseVal === 'FLIPPING_PAGE') {
          const flipDuration = config.flipDuration || 0.48; // ~0.48s per flip
          const flipInterval = config.flipInterval || 0.08;

          // Special pause on Day 18 (page index 3) before flipping to Day 19
          const isDay18 = activePageRef.current === targetPageIndex - 1;
          const currentPause = isDay18 ? 0.25 : flipInterval;

          if (!isWaitingBetweenPagesRef.current) {
            // Actively curling and flying current page
            transitionTimerRef.current += delta;
            const progress = Math.min(1, transitionTimerRef.current / flipDuration);
            flipProgressRef.current = progress;

            if (progress >= 1) {
              // Current page has completed flight and is gone
              // Now the next page is resting flat on the pad!
              activePageRef.current += 1;
              flipProgressRef.current = 0;
              transitionTimerRef.current = 0;
              isWaitingBetweenPagesRef.current = true;

              if (activePageRef.current >= targetPageIndex) {
                // We have landed on Day 19!
                activePageRef.current = targetPageIndex;
                phaseRef.current = 'SETTLING';
                setCurrentPhase('SETTLING');
                transitionTimerRef.current = 0;
                isWaitingBetweenPagesRef.current = false;
              }
            }
          } else {
            // Brief rest interval showing current newly revealed page before next flip
            transitionTimerRef.current += delta;
            if (transitionTimerRef.current >= currentPause) {
              // Begin next page flip
              transitionTimerRef.current = 0;
              isWaitingBetweenPagesRef.current = false;
              flipProgressRef.current = 0;
            }
          }
        } else if (currentPhaseVal === 'SETTLING') {
          // Day 19 rests flat on pad (0.45s) as seen in video
          transitionTimerRef.current += delta;
          if (transitionTimerRef.current >= 0.45) {
            phaseRef.current = 'DRAWING_HEART';
            setCurrentPhase('DRAWING_HEART');
            transitionTimerRef.current = 0;
          }
        } else if (currentPhaseVal === 'DRAWING_HEART') {
          const drawDuration = config.heartDrawDuration || 0.60;
          transitionTimerRef.current += delta;
          heartDrawProgressRef.current = Math.min(1, transitionTimerRef.current / drawDuration);

          if (!hasEmittedRevealRef.current && heartDrawProgressRef.current >= 0.7) {
            hasEmittedRevealRef.current = true;
            emit({
              type: 'reveal',
              runId: runtime.runId,
            });
          }

          if (heartDrawProgressRef.current >= 1) {
            phaseRef.current = 'CELEBRATING';
            setCurrentPhase('CELEBRATING');
            transitionTimerRef.current = 0;
          }
        } else if (currentPhaseVal === 'CELEBRATING') {
          transitionTimerRef.current += delta;
          // After 0.45s of floating hearts blooming, reveal final message
          if (transitionTimerRef.current >= 0.45) {
            phaseRef.current = 'REVEALING_MESSAGE';
            setCurrentPhase('REVEALING_MESSAGE');
            transitionTimerRef.current = 0;
          }
        } else if (currentPhaseVal === 'REVEALING_MESSAGE') {
          transitionTimerRef.current += delta;
          messageRevealProgressRef.current = Math.min(1, transitionTimerRef.current / 0.65);

          if (messageRevealProgressRef.current >= 1) {
            phaseRef.current = 'COMPLETED';
            setCurrentPhase('COMPLETED');
            if (!hasEmittedCompleteRef.current) {
              hasEmittedCompleteRef.current = true;
              emit({
                type: 'complete',
                runId: runtime.runId,
              });
            }
          }
        }

        // Update floating particles (hearts & sparkles)
        if (
          currentPhaseVal === 'DRAWING_HEART' ||
          currentPhaseVal === 'CELEBRATING' ||
          currentPhaseVal === 'REVEALING_MESSAGE' ||
          currentPhaseVal === 'COMPLETED'
        ) {
          const particles = particlesRef.current;
          for (const p of particles) {
            p.life += delta;
            p.y += p.vy * delta;
            p.x = p.baseX + Math.sin(p.wobbleFreq * p.life + p.wobblePhase) * p.wobbleAmp;

            const normLife = p.life / p.maxLife;
            if (normLife < 0.25) {
              p.alpha = (normLife / 0.25) * p.maxAlpha;
            } else if (normLife > 0.7) {
              p.alpha = Math.max(0, (1 - (normLife - 0.7) / 0.3) * p.maxAlpha);
            } else {
              p.alpha = p.maxAlpha;
            }

            if (p.life >= p.maxLife) {
              p.life = 0;
              p.y = 380 + Math.random() * 120;
            }
          }
        }
      }

      // Render Canvas
      const canvas = canvasRef.current;
      const renderer = rendererRef.current;
      if (canvas && renderer) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const activeIdx = activePageRef.current;
          const activeDay = days[activeIdx] || days[0];
          const nextDay = activeIdx < days.length - 1 ? days[activeIdx + 1] : null;

          renderer.renderScene(
            ctx,
            config,
            activeDay,
            nextDay,
            flipProgressRef.current,
            activeIdx,
            heartDrawProgressRef.current,
            particlesRef.current,
            messageRevealProgressRef.current,
            phaseRef.current === 'IDLE',
            buttonPulseRef.current,
            days.length
          );
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [days, config, runtime, emit]);

  return (
    <div
      ref={containerRef}
      className={styles.container}
      onClick={handleStart}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleStart();
        }
      }}
      aria-label="Lịch treo tường cổ điển"
    >
      <canvas ref={canvasRef} className={styles.canvas} />

      {currentPhase === 'IDLE' && config.showStartButton && (
        <button
          type="button"
          className={styles.startButtonOverlay}
          onClick={(e) => {
            e.stopPropagation();
            handleStart();
          }}
          aria-label="Nhấn để lật lịch"
        >
          {/* Accessible button overlay */}
        </button>
      )}
    </div>
  );
};
