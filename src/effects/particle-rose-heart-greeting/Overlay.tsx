import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { EffectProps } from '../../effect-sdk';
import type { ParticleRoseHeartConfig } from './config';
import { ParticleEngine, type ParticleTarget } from './components/ParticleEngine';
import { RoseHeartRenderer } from './components/RoseHeartRenderer';
import { TeddyBearField } from './components/TeddyBearField';
import { HoldButton } from './components/HoldButton';

export type SequencePhase =
  | 'IDLE'
  | 'PARTICLE_COLLAPSE'
  | 'GREETING_TEXT'
  | 'TEXT_RIBBON'
  | 'WOMENS_DAY_TEXT'
  | 'HEART_FORMING'
  | 'HEART_DISPLAY'
  | 'HEART_DISPERSE'
  | 'BEAR_FIELD';

export const Overlay: React.FC<EffectProps<ParticleRoseHeartConfig>> = ({
  config,
  runtime,
  emit,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ParticleEngine | null>(null);

  // Exact mobile portrait stage dimensions matching reference video (354 x 738)
  const STAGE_WIDTH = 354;
  const STAGE_HEIGHT = 738;
  const [stageScale, setStageScale] = useState(1);

  // Sequence state machine
  const [phase, setPhase] = useState<SequencePhase>('IDLE');
  const phaseRef = useRef<SequencePhase>('IDLE');

  // Elapsed time (seconds) since sequence trigger
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);
  const isSequenceActiveRef = useRef(false);

  // Debug modes for visual QA
  const [debugMode, setDebugMode] = useState<'SHOW_SINGLE_ROSE' | 'SHOW_ROSE_CLUSTER' | 'SHOW_HEART'>('SHOW_HEART');

  // Trackers
  const lastRunIdRef = useRef(runtime.runId);
  const hasEmittedCompleteRef = useRef(false);

  // Initialize Particle Engine
  useEffect(() => {
    const engine = new ParticleEngine(config.particleCount, config.particleSeed);
    engineRef.current = engine;

    // Initial state: Full-screen organic particle cloud
    const cloud = engine.generateCloud(STAGE_WIDTH, STAGE_HEIGHT);
    engine.morphTo(cloud, 0);
  }, [config.particleCount, config.particleSeed]);

  // Handle runId change (Replay from Host)
  useEffect(() => {
    if (runtime.runId !== lastRunIdRef.current) {
      lastRunIdRef.current = runtime.runId;
      isSequenceActiveRef.current = false;
      elapsedRef.current = 0;
      setElapsed(0);
      phaseRef.current = 'IDLE';
      setPhase('IDLE');
      hasEmittedCompleteRef.current = false;

      if (engineRef.current) {
        const cloud = engineRef.current.generateCloud(STAGE_WIDTH, STAGE_HEIGHT);
        engineRef.current.morphTo(cloud, 0);
      }
    }
  }, [runtime.runId]);

  // Responsive stage scaling
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scaleX = rect.width / STAGE_WIDTH;
      const scaleY = rect.height / STAGE_HEIGHT;
      setStageScale(Math.min(scaleX, scaleY));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Timeline durations calibrated to match reference video (~25.7s total)
  const timeline = useMemo(() => {
    const t0 = 0.0;
    const t1 = 2.0; // Inward particle collapse -> Greeting text
    const t2 = 4.2; // Greeting text -> Horizontal ribbon transition
    const t3 = 5.4; // Ribbon transition -> Women's day text
    const t4 = 7.6; // Women's day text -> Heart particle silhouette
    const t5 = 9.8; // Heart silhouette -> Roses start blooming
    const t6 = 11.8; // Roses reach full bloom -> Rose heart display
    const t7 = t6 + (config.heartDisplayDuration || 4.2); // ~16.0s -> Heart disperse
    const t8 = t7 + 3.8; // ~19.8s -> Flying teddy bears
    return { t0, t1, t2, t3, t4, t5, t6, t7, t8 };
  }, [config.heartDisplayDuration]);

  // Phase transition handler
  const transitionToPhase = useCallback(
    (newPhase: SequencePhase) => {
      const engine = engineRef.current;
      if (!engine) return;

      phaseRef.current = newPhase;
      setPhase(newPhase);

      let targets: ParticleTarget[] = [];
      switch (newPhase) {
        case 'IDLE':
          targets = engine.generateCloud(STAGE_WIDTH, STAGE_HEIGHT);
          break;
        case 'PARTICLE_COLLAPSE': {
          const cloud = engine.generateCloud(STAGE_WIDTH, STAGE_HEIGHT);
          targets = cloud.map((p) => ({
            ...p,
            x: STAGE_WIDTH * 0.5 + (p.x - STAGE_WIDTH * 0.5) * 0.32,
            y: STAGE_HEIGHT * 0.46 + (p.y - STAGE_HEIGHT * 0.46) * 0.32,
            alpha: 0.85,
          }));
          break;
        }
        case 'GREETING_TEXT': {
          const lines = (config.greetingText || 'Chúc\nMừng').split('\n');
          targets = engine.generateTextShape(lines, 42, STAGE_WIDTH, STAGE_HEIGHT);
          break;
        }
        case 'TEXT_RIBBON':
          targets = engine.generateHorizontalRibbon(STAGE_WIDTH, STAGE_HEIGHT);
          break;
        case 'WOMENS_DAY_TEXT': {
          const lines = (config.occasionText || "women's\nday").split('\n');
          targets = engine.generateTextShape(lines, 38, STAGE_WIDTH, STAGE_HEIGHT);
          break;
        }
        case 'HEART_FORMING':
        case 'HEART_DISPLAY':
          targets = engine.generateHeartSilhouette(STAGE_WIDTH, STAGE_HEIGHT, config.heartScale);
          break;
        case 'HEART_DISPERSE':
          targets = engine.disperseBurst(STAGE_WIDTH, STAGE_HEIGHT);
          break;
        case 'BEAR_FIELD':
          targets = engine.generateCloud(STAGE_WIDTH, STAGE_HEIGHT).map((p) => ({
            ...p,
            alpha: (p.alpha ?? 0.5) * 0.28,
            size: 0.7,
          }));
          break;
      }

      if (targets.length > 0) {
        engine.morphTo(targets, 1.0);
      }
    },
    [config.greetingText, config.occasionText, config.heartScale]
  );

  // Trigger from HoldButton
  const handleTrigger = useCallback(() => {
    isSequenceActiveRef.current = true;
    elapsedRef.current = 0;
    setElapsed(0);
    transitionToPhase('PARTICLE_COLLAPSE');
  }, [transitionToPhase]);

  // Precision timeline seeker and debug mode API for automated inspection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__PARTICLE_SEEK__ = (targetSec: number, mode?: 'SHOW_SINGLE_ROSE' | 'SHOW_ROSE_CLUSTER' | 'SHOW_HEART') => {
        isSequenceActiveRef.current = true;
        elapsedRef.current = targetSec;
        setElapsed(targetSec);

        if (mode) {
          setDebugMode(mode);
        } else {
          setDebugMode('SHOW_HEART');
        }

        const { t1, t2, t3, t4, t5, t6, t7, t8 } = timeline;
        let p: SequencePhase = 'PARTICLE_COLLAPSE';
        if (targetSec < t1) p = 'PARTICLE_COLLAPSE';
        else if (targetSec < t2) p = 'GREETING_TEXT';
        else if (targetSec < t3) p = 'TEXT_RIBBON';
        else if (targetSec < t4) p = 'WOMENS_DAY_TEXT';
        else if (targetSec < t5) p = 'HEART_FORMING';
        else if (targetSec < t6) p = 'HEART_FORMING';
        else if (targetSec < t7) p = 'HEART_DISPLAY';
        else if (targetSec < t8) p = 'HEART_DISPERSE';
        else p = 'BEAR_FIELD';

        transitionToPhase(p);
      };

      (window as any).__PARTICLE_DEBUG_MODE__ = (mode: 'SHOW_SINGLE_ROSE' | 'SHOW_ROSE_CLUSTER' | 'SHOW_HEART') => {
        setDebugMode(mode);
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__PARTICLE_SEEK__;
        delete (window as any).__PARTICLE_DEBUG_MODE__;
      }
    };
  }, [timeline, transitionToPhase]);

  // Main RAF Physics & Rendering Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      animId = requestAnimationFrame(loop);

      const deltaMs = now - lastTime;
      lastTime = now;
      const deltaSec = Math.min(deltaMs / 1000, 0.1);

      if (runtime.isPaused) return;

      const speed = (config.playbackSpeed || 1.0) * (runtime.speed || 1.0);
      const effectiveDt = deltaSec * speed;

      if (isSequenceActiveRef.current) {
        elapsedRef.current += effectiveDt;
        const t = elapsedRef.current;
        setElapsed(t);

        const { t1, t2, t3, t4, t5, t6, t7, t8 } = timeline;
        let nextP: SequencePhase = 'PARTICLE_COLLAPSE';
        if (t < t1) nextP = 'PARTICLE_COLLAPSE';
        else if (t < t2) nextP = 'GREETING_TEXT';
        else if (t < t3) nextP = 'TEXT_RIBBON';
        else if (t < t4) nextP = 'WOMENS_DAY_TEXT';
        else if (t < t5) nextP = 'HEART_FORMING';
        else if (t < t6) nextP = 'HEART_FORMING';
        else if (t < t7) nextP = 'HEART_DISPLAY';
        else if (t < t8) nextP = 'HEART_DISPERSE';
        else nextP = 'BEAR_FIELD';

        if (nextP !== phaseRef.current) {
          transitionToPhase(nextP);
        }

        // Completion signal at 25.7s
        if (t >= 25.7 && !hasEmittedCompleteRef.current) {
          hasEmittedCompleteRef.current = true;
          emit?.({ type: 'complete', runId: runtime.runId });
        }
      }

      const engine = engineRef.current;
      const canvas = canvasRef.current;
      if (engine && canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          engine.update(
            effectiveDt,
            config.particleSpeed,
            config.particleMotion,
            elapsedRef.current
          );

          ctx.clearRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);

          let particleOpacity = 1.0;
          if (phaseRef.current === 'HEART_DISPLAY') {
            particleOpacity = 0.25;
          } else if (phaseRef.current === 'BEAR_FIELD') {
            particleOpacity = 0.35;
          }

          engine.render(
            ctx,
            STAGE_WIDTH,
            STAGE_HEIGHT,
            particleOpacity,
            config.particleGlow
          );
        }
      }
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [
    runtime.isPaused,
    runtime.speed,
    runtime.runId,
    config.playbackSpeed,
    config.particleSpeed,
    config.particleMotion,
    config.particleGlow,
    timeline,
    transitionToPhase,
    emit,
  ]);

  // Derived layer opacities
  const { t1, t2, t3, t4, t5, t6, t7, t8 } = timeline;

  // Text 1 ("Chúc Mừng") Opacity: Clean typography fades in and out smoothly
  const greetingTextOpacity = useMemo(() => {
    if (elapsed < t1 || elapsed >= t2) return 0;
    const dur = t2 - t1;
    const dt = elapsed - t1;
    if (dt < 0.35) return dt / 0.35;
    if (dt > dur - 0.35) return Math.max(0, (dur - dt) / 0.35);
    return 1;
  }, [elapsed, t1, t2]);

  // Text 2 ("women's day") Opacity
  const womensDayTextOpacity = useMemo(() => {
    if (elapsed < t3 || elapsed >= t4) return 0;
    const dur = t4 - t3;
    const dt = elapsed - t3;
    if (dt < 0.35) return dt / 0.35;
    if (dt > dur - 0.35) return Math.max(0, (dur - dt) / 0.35);
    return 1;
  }, [elapsed, t3, t4]);

  // Rose heart blooming progress (0.0 to 1.0 during t5 to t6)
  const bloomProgress = useMemo(() => {
    if (elapsed < t5) return 0;
    if (elapsed >= t6) return 1;
    return (elapsed - t5) / (t6 - t5);
  }, [elapsed, t5, t6]);

  // Rose heart visibility (Visible from t5 through t7, fades out as heart disperses)
  const roseHeartOpacity = useMemo(() => {
    if (elapsed < t5) return 0;
    if (elapsed < t7) return 1;
    if (elapsed < t7 + 1.2) {
      return Math.max(0, 1 - (elapsed - t7) / 1.2);
    }
    return 0;
  }, [elapsed, t5, t7]);

  // Teddy bears visibility (Begins flowing into view from t8 onwards)
  const teddyBearOpacity = useMemo(() => {
    if (elapsed < t7 + 1.5) return 0;
    if (elapsed < t8) {
      return (elapsed - (t7 + 1.5)) / (t8 - (t7 + 1.5));
    }
    return 1;
  }, [elapsed, t7, t8]);

  return (
    <div
      ref={containerRef}
      className="particle-rose-heart-root"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#000000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Dynamic Cursive Fonts Injection */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Great+Vibes&display=swap');
      `}</style>

      {/* PORTRAIT MOBILE STAGE (354 x 738) */}
      <div
        className="particle-stage"
        style={{
          position: 'relative',
          width: `${STAGE_WIDTH}px`,
          height: `${STAGE_HEIGHT}px`,
          transform: `scale(${stageScale})`,
          transformOrigin: 'center center',
          backgroundColor: '#000000',
          overflow: 'hidden',
        }}
      >
        {/* LAYER 1: PARTICLE CANVAS */}
        <canvas
          ref={canvasRef}
          width={STAGE_WIDTH}
          height={STAGE_HEIGHT}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />

        {/* LAYER 2A: CRISP CURSIVE SCRIPT "Chúc Mừng" (2 Lines, Rich Vibrant Pink, No White Bar) */}
        {greetingTextOpacity > 0.01 && (
          <div
            style={{
              position: 'absolute',
              top: '46%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
              opacity: greetingTextOpacity,
              zIndex: 4,
              whiteSpace: 'pre-line',
              transition: 'opacity 0.2s ease',
            }}
          >
            <div
              style={{
                fontFamily: "'Dancing Script', 'Great Vibes', 'Brush Script MT', 'Segoe Script', cursive, sans-serif",
                fontSize: '46px',
                fontWeight: 700,
                color: '#ff4f9a',
                textShadow:
                  '0 0 12px rgba(255, 79, 154, 0.8), 0 0 24px rgba(232, 60, 133, 0.6), 0 2px 4px rgba(0, 0, 0, 0.9)',
                lineHeight: '1.2',
                letterSpacing: '1px',
              }}
            >
              {config.greetingText || 'Chúc\nMừng'}
            </div>
          </div>
        )}

        {/* LAYER 2B: CRISP CURSIVE SCRIPT "women's day" (2 Lines, Rich Vibrant Pink, No White Bar) */}
        {womensDayTextOpacity > 0.01 && (
          <div
            style={{
              position: 'absolute',
              top: '46%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
              opacity: womensDayTextOpacity,
              zIndex: 4,
              whiteSpace: 'pre-line',
              transition: 'opacity 0.2s ease',
            }}
          >
            <div
              style={{
                fontFamily: "'Dancing Script', 'Great Vibes', 'Brush Script MT', 'Segoe Script', cursive, sans-serif",
                fontSize: '42px',
                fontWeight: 700,
                color: '#ff4f9a',
                textShadow:
                  '0 0 12px rgba(255, 79, 154, 0.8), 0 0 24px rgba(232, 60, 133, 0.6), 0 2px 4px rgba(0, 0, 0, 0.9)',
                lineHeight: '1.2',
                letterSpacing: '1px',
              }}
            >
              {config.occasionText || "women's\nday"}
            </div>
          </div>
        )}

        {/* LAYER 3: ROSE HEART RENDERER (48 distinct large velvety roses) */}
        <RoseHeartRenderer
          config={config}
          bloomProgress={bloomProgress}
          opacity={roseHeartOpacity}
          time={elapsed}
          width={STAGE_WIDTH}
          height={STAGE_HEIGHT}
          debugMode={debugMode}
        />

        {/* LAYER 4: FLYING TEDDY BEARS (3D space perspective field, 35 bears, deep parallax) */}
        <TeddyBearField
          config={config}
          opacity={teddyBearOpacity}
          time={elapsed}
          isPaused={runtime.isPaused}
          width={STAGE_WIDTH}
          height={STAGE_HEIGHT}
        />

        {/* LAYER 5: HOLD BUTTON */}
        <HoldButton
          config={config}
          opacity={phase === 'IDLE' ? 1 : 0}
          onTrigger={handleTrigger}
          disabled={phase !== 'IDLE'}
        />
      </div>
    </div>
  );
};
