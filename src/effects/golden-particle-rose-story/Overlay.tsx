import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import type { EffectProps } from '../../effect-sdk';
import type { GoldenParticleStoryConfig } from './config';
import { ParticleEngine, type ParticleTarget } from './components/ParticleEngine';
import { BackgroundLayer } from './components/BackgroundLayer';
import { HeartPhotoLayer } from './components/HeartPhotoLayer';
import { BouquetRenderer } from './components/BouquetRenderer';
import { FinalTypography } from './components/FinalTypography';
import { RoseModal } from './components/RoseModal';

type StoryPhase =
  | 'VORTEX'
  | 'HEART'
  | 'MSG_1'
  | 'MSG_2'
  | 'MSG_3'
  | 'MSG_4'
  | 'PHOTO'
  | 'BOUQUET_ASSEMBLY'
  | 'ROSE_BLOOM'
  | 'INTERACTIVE';

interface FallingPetal {
  x: number;
  y: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotSpeed: number;
  scale: number;
  opacity: number;
  wobblePhase: number;
  color: string;
}

export const Overlay: React.FC<EffectProps<GoldenParticleStoryConfig>> = ({
  config,
  runtime,
  media,
  emit,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ParticleEngine | null>(null);

  // Responsive stage dimensions (normalized to 358 x 746)
  const STAGE_WIDTH = 358;
  const STAGE_HEIGHT = 746;
  const [stageScale, setStageScale] = useState(1);

  // Timeline & State Machine
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);
  const phaseRef = useRef<StoryPhase>('VORTEX');
  const [currentPhase, setCurrentPhase] = useState<StoryPhase>('VORTEX');

  // Interactive Rose Modal State
  const [activeRoseId, setActiveRoseId] = useState<number | null>(null);
  const [hoveredRoseId, setHoveredRoseId] = useState<number | null>(null);

  // Completed & revealed emission tracker
  const hasEmittedCompleteRef = useRef(false);
  const lastRunIdRef = useRef(runtime.runId);

  // Falling petals
  const petalsRef = useRef<FallingPetal[]>([]);

  // Initialize Particle Engine
  useEffect(() => {
    const engine = new ParticleEngine(config.particleCount, config.particleSeed);
    engineRef.current = engine;

    // Initialize initial vortex targets
    const vortexTargets = engine.generateVortex(STAGE_WIDTH, STAGE_HEIGHT);
    engine.morphTo(vortexTargets, 0);

    // Initialize falling petals
    const petalColors = ['#f43f5e', '#e11d48', '#be123c', '#fb7185', '#fda4af'];
    const petals: FallingPetal[] = [];
    const count = config.petalDensity || 24;
    for (let i = 0; i < count; i++) {
      petals.push({
        x: Math.random() * STAGE_WIDTH,
        y: Math.random() * STAGE_HEIGHT,
        speedY: (25 + Math.random() * 45) * (config.petalFallSpeed || 1.0),
        speedX: (Math.random() - 0.5) * 15,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 45,
        scale: 0.65 + Math.random() * 0.7,
        opacity: 0.4 + Math.random() * 0.5,
        wobblePhase: Math.random() * Math.PI * 2,
        color: petalColors[Math.floor(Math.random() * petalColors.length)],
      });
    }
    petalsRef.current = petals;
  }, [config.particleCount, config.particleSeed, config.petalDensity, config.petalFallSpeed]);

  // Handle runId change (Replay trigger from Host)
  useEffect(() => {
    if (runtime.runId !== lastRunIdRef.current) {
      lastRunIdRef.current = runtime.runId;
      elapsedRef.current = 0;
      setElapsed(0);
      phaseRef.current = 'VORTEX';
      setCurrentPhase('VORTEX');
      setActiveRoseId(null);
      hasEmittedCompleteRef.current = false;

      if (engineRef.current) {
        const vortexTargets = engineRef.current.generateVortex(STAGE_WIDTH, STAGE_HEIGHT);
        engineRef.current.morphTo(vortexTargets, config.dispersionStrength);
      }
    }
  }, [runtime.runId, config.dispersionStrength]);

  // Handle viewport resizing & responsive stage scaling
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const parentW = rect.width || window.innerWidth;
      const parentH = rect.height || window.innerHeight;

      // Fit 358 x 746 inside available viewport preserving aspect ratio
      const scaleX = parentW / STAGE_WIDTH;
      const scaleY = parentH / STAGE_HEIGHT;
      const scale = Math.min(scaleX, scaleY, 1.25);
      setStageScale(scale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Scene timing thresholds based on durations config
  const timings = useMemo(() => {
    const d = config.sceneDurations;
    const t0 = 0;
    const t1 = t0 + d.vortex; // ~2.2s
    const t2 = t1 + d.heart; // ~7.2s
    const t3 = t2 + d.msg1; // ~10.8s
    const t4 = t3 + d.msg2; // ~14.8s
    const t5 = t4 + d.msg3; // ~18.6s
    const t6 = t5 + d.msg4; // ~22.6s
    const t7 = t6 + d.photo; // ~30.1s
    const t8 = t7 + d.bouquetAssembly; // ~33.6s
    const t9 = t8 + d.roseBloom; // ~35.8s
    return { t0, t1, t2, t3, t4, t5, t6, t7, t8, t9 };
  }, [config.sceneDurations]);

  // Transition helper when entering a new phase
  const transitionToPhase = useCallback(
    (newPhase: StoryPhase) => {
      const engine = engineRef.current;
      if (!engine) return;

      phaseRef.current = newPhase;
      setCurrentPhase(newPhase);

      const dispersion = config.dispersionStrength || 1.0;
      let targets: ParticleTarget[] = [];

      switch (newPhase) {
        case 'VORTEX':
          targets = engine.generateVortex(STAGE_WIDTH, STAGE_HEIGHT);
          break;
        case 'HEART':
          targets = engine.generateHeart(STAGE_WIDTH, STAGE_HEIGHT);
          break;
        case 'MSG_1': {
          const msg = config.greetingMessages[0] || 'Chúc mừng';
          targets = engine.generateTextShape(msg.split('\n'), 38, STAGE_WIDTH, STAGE_HEIGHT);
          break;
        }
        case 'MSG_2': {
          const msg = config.greetingMessages[1] || 'Ngày Quốc\ntế Nam giới';
          targets = engine.generateTextShape(msg.split('\n'), 34, STAGE_WIDTH, STAGE_HEIGHT);
          break;
        }
        case 'MSG_3': {
          const msg = config.greetingMessages[2] || '19 tháng 11';
          targets = engine.generateTextShape(msg.split('\n'), 38, STAGE_WIDTH, STAGE_HEIGHT);
          break;
        }
        case 'MSG_4': {
          const msg = config.greetingMessages[3] || 'Cảm ơn anh\nvì tất cả';
          targets = engine.generateTextShape(msg.split('\n'), 34, STAGE_WIDTH, STAGE_HEIGHT);
          break;
        }
        case 'PHOTO':
          targets = engine.generatePhotoBorder(STAGE_WIDTH, STAGE_HEIGHT);
          break;
        case 'BOUQUET_ASSEMBLY':
          targets = engine.generateBouquetSilhouette(STAGE_WIDTH, STAGE_HEIGHT);
          break;
        case 'ROSE_BLOOM':
        case 'INTERACTIVE':
          // Disperse particles to margins/ambient stardust so flowers bloom clearly
          targets = engine.generateAmbientDispersal(STAGE_WIDTH, STAGE_HEIGHT);
          break;
      }

      if (targets.length > 0) {
        engine.morphTo(targets, dispersion);
      }
    },
    [config]
  );

  // Expose precise timeline seeker for automated test & inspection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__GOLDEN_SEEK__ = (targetSec: number) => {
        elapsedRef.current = targetSec;
        setElapsed(targetSec);
        const { t1, t2, t3, t4, t5, t6, t7, t8, t9 } = timings;
        let nextPhase: StoryPhase = 'VORTEX';
        if (targetSec < t1) nextPhase = 'VORTEX';
        else if (targetSec < t2) nextPhase = 'HEART';
        else if (targetSec < t3) nextPhase = 'MSG_1';
        else if (targetSec < t4) nextPhase = 'MSG_2';
        else if (targetSec < t5) nextPhase = 'MSG_3';
        else if (targetSec < t6) nextPhase = 'MSG_4';
        else if (targetSec < t7) nextPhase = 'PHOTO';
        else if (targetSec < t8) nextPhase = 'BOUQUET_ASSEMBLY';
        else if (targetSec < t9) nextPhase = 'ROSE_BLOOM';
        else nextPhase = 'INTERACTIVE';
        transitionToPhase(nextPhase);

        // Instantly settle particles toward targets on seek
        if (engineRef.current) {
          for (let step = 0; step < 80; step++) {
            engineRef.current.update(0.04, targetSec, 1.0);
          }
        }
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__GOLDEN_SEEK__;
      }
    };
  }, [timings, transitionToPhase]);

  // Main Animation & Physics Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      animId = requestAnimationFrame(loop);

      const deltaMs = now - lastTime;
      lastTime = now;
      const deltaSec = Math.min(deltaMs / 1000, 0.1);

      // Respect runtime pause
      if (runtime.isPaused) return;

      const speed = (config.playbackSpeed || 1.0) * (runtime.speed || 1.0);
      const effectiveDt = deltaSec * speed;

      // Update elapsed timeline
      elapsedRef.current += effectiveDt;
      const t = elapsedRef.current;
      setElapsed(t);

      const { t1, t2, t3, t4, t5, t6, t7, t8, t9 } = timings;

      // Determine target phase
      let nextPhase: StoryPhase = 'VORTEX';
      if (t < t1) nextPhase = 'VORTEX';
      else if (t < t2) nextPhase = 'HEART';
      else if (t < t3) nextPhase = 'MSG_1';
      else if (t < t4) nextPhase = 'MSG_2';
      else if (t < t5) nextPhase = 'MSG_3';
      else if (t < t6) nextPhase = 'MSG_4';
      else if (t < t7) nextPhase = 'PHOTO';
      else if (t < t8) nextPhase = 'BOUQUET_ASSEMBLY';
      else if (t < t9) nextPhase = 'ROSE_BLOOM';
      else nextPhase = 'INTERACTIVE';

      if (nextPhase !== phaseRef.current) {
        transitionToPhase(nextPhase);
      }

      // Check completion
      if (t >= t9 && !hasEmittedCompleteRef.current) {
        hasEmittedCompleteRef.current = true;
        emit({ type: 'complete', runId: runtime.runId });
      }

      // Loop support
      if (config.loop && t >= t9 + 15) {
        elapsedRef.current = 0;
        transitionToPhase('VORTEX');
      }

      // Update particle engine simulation
      if (engineRef.current) {
        engineRef.current.update(effectiveDt, t, config.particleSpeed || 1.0);
      }

      // Update falling petals
      if (t >= t8) {
        for (const petal of petalsRef.current) {
          petal.y += petal.speedY * effectiveDt;
          petal.x += Math.sin(t * 2.0 + petal.wobblePhase) * 18 * effectiveDt + petal.speedX * effectiveDt;
          petal.rotation += petal.rotSpeed * effectiveDt;

          if (petal.y > STAGE_HEIGHT + 20) {
            petal.y = -20;
            petal.x = Math.random() * STAGE_WIDTH;
          }
        }
      }

      // Render Canvas
      const canvas = canvasRef.current;
      if (canvas && engineRef.current) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);

          // Render particle system with luminous glow
          const glowMult = config.glowIntensity ?? 0.8;
          engineRef.current.render(ctx, STAGE_WIDTH, STAGE_HEIGHT, 1.0, t, glowMult);

          // Render falling petals if in bloom/interactive phase
          if (t >= t8) {
            ctx.save();
            for (const petal of petalsRef.current) {
              ctx.save();
              ctx.translate(petal.x, petal.y);
              ctx.rotate((petal.rotation * Math.PI) / 180);
              ctx.scale(petal.scale, petal.scale);
              ctx.globalAlpha = petal.opacity;

              // Draw curved rose petal
              ctx.fillStyle = petal.color;
              ctx.beginPath();
              ctx.moveTo(0, -6);
              ctx.bezierCurveTo(-5, -6, -8, 2, 0, 8);
              ctx.bezierCurveTo(8, 2, 5, -6, 0, -6);
              ctx.fill();

              // Subtle petal highlight line
              ctx.strokeStyle = 'rgba(255, 230, 240, 0.4)';
              ctx.lineWidth = 0.8;
              ctx.beginPath();
              ctx.moveTo(0, -4);
              ctx.lineTo(0, 5);
              ctx.stroke();

              ctx.restore();
            }
            ctx.restore();
          }
        }
      }
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [runtime.isPaused, runtime.speed, config.playbackSpeed, config.particleSpeed, config.glowIntensity, config.loop, timings, transitionToPhase, emit, runtime.runId]);

  // Derived opacity & visibility helpers
  const { t1, t2, t3, t4, t5, t6, t7, t8, t9 } = timings;

  // Scene 2: White Handwriting Text "Anh Yêu" at center of heart
  const anhYeuOpacity = useMemo(() => {
    if (elapsed < t1 || elapsed >= t2) return 0;
    const sceneElapsed = elapsed - t1;
    const dur = t2 - t1;
    if (sceneElapsed < 0.8) return sceneElapsed / 0.8;
    if (sceneElapsed > dur - 0.8) return Math.max(0, (dur - sceneElapsed) / 0.8);
    return 1;
  }, [elapsed, t1, t2]);

  // Scene 3: Greeting Messages 1..4 text opacities (crisp typography overlay)
  const getMessageOpacity = useCallback(
    (startT: number, endT: number) => {
      if (elapsed < startT || elapsed >= endT) return 0;
      const dt = elapsed - startT;
      const dur = endT - startT;
      if (dt < 0.6) return dt / 0.6;
      if (dt > dur - 0.6) return Math.max(0, (dur - dt) / 0.6);
      return 1;
    },
    [elapsed]
  );

  const msg1Opacity = getMessageOpacity(t2, t3);
  const msg2Opacity = getMessageOpacity(t3, t4);
  const msg3Opacity = getMessageOpacity(t4, t5);
  const msg4Opacity = getMessageOpacity(t5, t6);

  // Scene 4: Heart Photo Reveal Opacity
  const photoOpacity = useMemo(() => {
    if (elapsed < t6 || elapsed >= t7) return 0;
    const dt = elapsed - t6;
    const dur = t7 - t6;
    if (dt < 1.0) return dt / 1.0;
    if (dt > dur - 0.9) return Math.max(0, (dur - dt) / 0.9);
    return 1;
  }, [elapsed, t6, t7]);

  // Scene 5 & 6 & 7: Bouquet visibility & Bloom Progress
  // The SVG bouquet is hidden during assembly (t7..t8) so the pure colored particle silhouette shines!
  // It fades in during bloom (t8..t9) as the buds open into roses.
  const bouquetOpacity = useMemo(() => {
    if (elapsed < t8) return 0;
    if (elapsed < t8 + 0.8) {
      return (elapsed - t8) / 0.8;
    }
    return 1;
  }, [elapsed, t8]);

  const bloomProgress = useMemo(() => {
    if (elapsed < t8) return 0; // Tight buds
    const bloomDur = config.bloomDuration || 2.0;
    const dt = elapsed - t8;
    return Math.min(1, Math.max(0, dt / bloomDur));
  }, [elapsed, t8, config.bloomDuration]);

  // Scene 7: Final Typography Opacity
  const finalTypographyOpacity = useMemo(() => {
    if (elapsed < t9) return 0;
    return Math.min(1, (elapsed - t9) / 1.2);
  }, [elapsed, t9]);

  // Manual replay button action
  const handleManualReplay = useCallback(() => {
    elapsedRef.current = 0;
    setElapsed(0);
    setActiveRoseId(null);
    hasEmittedCompleteRef.current = false;
    transitionToPhase('VORTEX');
  }, [transitionToPhase]);

  // Rose click handler
  const handleRoseClick = useCallback(
    (roseId: number) => {
      setActiveRoseId(roseId);
      emit({ type: 'interaction', name: 'rose-click', payload: { roseId } });
    },
    [emit]
  );

  return (
    <div
      ref={containerRef}
      className="golden-particle-story-root"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: config.backgroundColor || '#050508',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Dynamic Keyframes & Fonts Injection */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Comfortaa:wght@600;700&family=Dancing+Script:wght@600;700&family=Great+Vibes&family=Playpen+Sans:wght@600;700&family=Quicksand:wght@500;600;700&display=swap');
        @keyframes pulseHint {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5), 0 0 10px rgba(225, 29, 72, 0.25); }
          50% { transform: scale(1.035); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6), 0 0 16px rgba(225, 29, 72, 0.5); }
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* FIXED ASPECT RATIO STAGE (358 x 746) */}
      <div
        className="golden-stage"
        style={{
          position: 'relative',
          width: `${STAGE_WIDTH}px`,
          height: `${STAGE_HEIGHT}px`,
          transform: `scale(${stageScale})`,
          transformOrigin: 'center center',
          boxShadow: '0 0 40px rgba(0, 0, 0, 0.85)',
          overflow: 'hidden',
          borderRadius: '16px',
        }}
      >
        {/* LAYER 1 — DEEP SKY BACKGROUND WITH TWINKLING STARS & METEORS */}
        <BackgroundLayer
          width={STAGE_WIDTH}
          height={STAGE_HEIGHT}
          time={elapsed}
          isPaused={runtime.isPaused}
        />

        {/* LAYER 2 — PARTICLE CANVAS (Vortex, Heart, Text, Photo Border, Bouquet Silhouette) */}
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
            zIndex: 6,
          }}
        />

        {/* LAYER 3A — "Anh Yêu" CALLIGRAPHY TEXT (Scene 2) */}
        {anhYeuOpacity > 0.01 && (
          <div
            style={{
              position: 'absolute',
              top: '45%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
              opacity: anhYeuOpacity,
              zIndex: 8,
              transition: 'opacity 0.4s ease',
            }}
          >
            <span
              style={{
                fontFamily: "'Dancing Script', 'Caveat', 'Great Vibes', cursive",
                fontSize: '48px',
                fontWeight: 700,
                color: '#ffffff',
                textShadow:
                  '0 0 14px rgba(255, 255, 255, 0.95), 0 0 26px rgba(255, 215, 0, 0.8), 0 2px 6px rgba(0, 0, 0, 0.9)',
                letterSpacing: '1.5px',
              }}
            >
              {config.openingText || 'Anh Yêu'}
            </span>
          </div>
        )}

        {/* LAYER 3B — GREETING MESSAGES (Crisp typography overlay for Scene 3) */}
        {[
          { text: config.greetingMessages[0] || 'Chúc mừng', opacity: msg1Opacity, size: 38 },
          { text: config.greetingMessages[1] || 'Ngày Quốc\ntế Nam giới', opacity: msg2Opacity, size: 34 },
          { text: config.greetingMessages[2] || '19 tháng 11', opacity: msg3Opacity, size: 38 },
          { text: config.greetingMessages[3] || 'Cảm ơn anh\nvì tất cả', opacity: msg4Opacity, size: 34 },
        ].map((item, idx) =>
          item.opacity > 0.01 ? (
            <div
              key={`msg-overlay-${idx}`}
              style={{
                position: 'absolute',
                top: '46%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                width: '320px',
                pointerEvents: 'none',
                opacity: item.opacity,
                zIndex: 8,
                whiteSpace: 'pre-line',
                transition: 'opacity 0.3s ease',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  fontFamily: "'Dancing Script', 'Caveat', 'Playpen Sans', 'Comfortaa', cursive, sans-serif",
                  fontSize: `${item.size}px`,
                  fontWeight: 700,
                  background: 'linear-gradient(180deg, #ffffff 0%, #fff6bd 20%, #ffd700 55%, #d99100 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter:
                    'drop-shadow(0 0 14px rgba(255, 215, 0, 0.85)) drop-shadow(0 0 28px rgba(245, 158, 11, 0.5)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9))',
                  lineHeight: '1.35',
                  letterSpacing: '0.8px',
                }}
              >
                {item.text}
              </span>
            </div>
          ) : null
        )}

        {/* LAYER 4 — HEART PHOTO (Scene 4) */}
        <HeartPhotoLayer
          config={config}
          opacity={photoOpacity}
          time={elapsed}
          mediaOverride={media?.heartPhoto}
        />

        {/* LAYER 5 — FLOWER BOUQUET & 9 BLOOMING ROSES (Scenes 5, 6, 7) */}
        <BouquetRenderer
          config={config}
          bloomProgress={bloomProgress}
          opacity={bouquetOpacity}
          time={elapsed}
          hoveredRoseId={hoveredRoseId}
          onRoseHover={setHoveredRoseId}
          onRoseClick={handleRoseClick}
        />

        {/* LAYER 6 — FINAL TYPOGRAPHY & HINT (Scene 7) */}
        <FinalTypography
          config={config}
          opacity={finalTypographyOpacity}
        />

        {/* REPLAY BUTTON (Discreet top-right corner during Interactive stage) */}
        {config.replayEnabled && currentPhase === 'INTERACTIVE' && (
          <button
            onClick={handleManualReplay}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(25, 15, 25, 0.75)',
              border: '1px solid rgba(255, 215, 0, 0.45)',
              color: '#ffd700',
              fontSize: '17px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 30,
              boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
            title="Xem lại từ đầu"
            aria-label="Xem lại hiệu ứng"
          >
            ↻
          </button>
        )}

        {/* LAYER 7 — INTERACTIVE PHOTO MODAL (When tapping any rose) */}
        <RoseModal
          isOpen={activeRoseId !== null}
          activeRoseId={activeRoseId}
          rosePhotos={config.rosePhotos}
          fallbackPhoto={media?.heartPhoto || config.heartPhoto}
          onClose={() => setActiveRoseId(null)}
          onNavigate={(newId) => setActiveRoseId(newId)}
        />
      </div>
    </div>
  );
};
