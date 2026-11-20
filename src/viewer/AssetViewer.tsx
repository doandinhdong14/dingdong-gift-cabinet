import React, { Suspense, useRef, useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Play, Pause, RotateCcw, RotateCw, Sun, Moon, Grid, Sparkles, AlertCircle } from 'lucide-react';
import { AssetConfig, AssetManifest } from '../gift-library/types';
import { MotionRig } from '../gift-library/motion/MotionRig';
import { StudioLighting } from './StudioLighting';
import { ViewerErrorBoundary } from './ViewerErrorBoundary';
import { resolveAssetUrl } from '../utils/assetUrl';
import { LoveUniverseIntroButton } from '../gift-library/objects/love-universe-01/LoveUniverseIntroButton';
import { RoseRevealUI } from '../gift-library/objects/rose-reveal-01/RoseRevealUI';
import { RoseRevealState } from '../gift-library/objects/rose-reveal-01/types';

export type BackgroundMode = 'light' | 'dark' | 'checkerboard';
export type QualityMode = 'low' | 'high';

export interface AssetViewerProps {
  manifest: AssetManifest;
  config: AssetConfig;
  onConfigChange?: (newConfig: AssetConfig) => void;
  loadComponent: () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>;
}

export const AssetViewer: React.FC<AssetViewerProps> = ({
  manifest,
  config,
  onConfigChange,
  loadComponent,
}) => {
  const isUniverse = manifest.id === 'love-universe-01';
  const isRose = manifest.id === 'rose-reveal-01';
  const isCard11 = manifest.id === 'card-11';

  const [LoadedComponent, setLoadedComponent] = useState<React.ComponentType<Record<string, unknown>> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [bgMode, setBgMode] = useState<BackgroundMode>(() => (isUniverse || isRose || isCard11 ? 'dark' : 'light'));
  const [qualityMode, setQualityMode] = useState<QualityMode>('high');
  const [webGlContextLost, setWebGlContextLost] = useState(false);
  const [isUniverseOpened, setIsUniverseOpened] = useState(() => {
    if (!isUniverse) return true;
    return config.universe?.showIntro === false;
  });

  // Rose Reveal state & animation control
  const [roseState, setRoseState] = useState<RoseRevealState>('idle');
  const [roseBloomProgress, setRoseBloomProgress] = useState(0);
  const [roseFlightProgress, setRoseFlightProgress] = useState(0);
  const roseHasTriggeredRef = useRef(false);
  const roseAnimFrameRef = useRef<number | null>(null);
  const roseStartTimeRef = useRef<number | null>(null);
  const isRoseTabHiddenRef = useRef(false);

  useEffect(() => {
    const handleVis = () => {
      isRoseTabHiddenRef.current = document.hidden;
    };
    document.addEventListener('visibilitychange', handleVis);
    return () => document.removeEventListener('visibilitychange', handleVis);
  }, []);

  const handleTriggerRoseBloom = useCallback(() => {
    if (roseHasTriggeredRef.current || roseState !== 'idle') return;
    roseHasTriggeredRef.current = true;
    setRoseState('blooming');
    roseStartTimeRef.current = performance.now();

    const duration = (config.roseReveal?.bloomDuration || 1.8) * 1000;
    const totalDuration = duration + 1800;

    const tick = (now: number) => {
      if (!roseStartTimeRef.current) roseStartTimeRef.current = now;
      if (isRoseTabHiddenRef.current) {
        roseAnimFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      const elapsed = now - roseStartTimeRef.current;
      const bNorm = Math.min(1, Math.max(0, elapsed / duration));
      const bEased = bNorm * bNorm * (3 - 2 * bNorm);
      setRoseBloomProgress(bEased);

      const flightStart = duration * 0.70;
      if (elapsed >= flightStart) {
        const fNorm = Math.min(1, Math.max(0, (elapsed - flightStart) / (totalDuration - flightStart)));
        setRoseFlightProgress(fNorm);
      }

      if (elapsed >= duration + 400 && elapsed < totalDuration) {
        setRoseState('revealing');
      }

      if (elapsed < totalDuration) {
        roseAnimFrameRef.current = requestAnimationFrame(tick);
      } else {
        setRoseState('completed');
      }
    };

    roseAnimFrameRef.current = requestAnimationFrame(tick);
  }, [roseState, config.roseReveal?.bloomDuration]);

  const handleReplayRose = useCallback(() => {
    if (roseAnimFrameRef.current) cancelAnimationFrame(roseAnimFrameRef.current);
    roseHasTriggeredRef.current = false;
    roseStartTimeRef.current = null;
    setRoseBloomProgress(0);
    setRoseFlightProgress(0);
    setRoseState('idle');
    if (controlsRef.current) controlsRef.current.reset();
  }, []);

  useEffect(() => {
    return () => {
      if (roseAnimFrameRef.current) cancelAnimationFrame(roseAnimFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (isUniverse && config.universe?.showIntro === false) {
      setIsUniverseOpened(true);
    }
  }, [isUniverse, config.universe?.showIntro]);

  const controlsRef = useRef<OrbitControlsImpl>(null);

  // Dynamically load the component on mount or change
  useEffect(() => {
    let active = true;
    setLoadError(null);
    loadComponent()
      .then((mod) => {
        if (active) {
          setLoadedComponent(() => mod.default);
        }
      })
      .catch((err) => {
        if (active) {
          console.error('Failed to load asset 3D component:', err);
          setLoadError('Không thể tải mã nguồn của mô hình 3D.');
        }
      });
    return () => {
      active = false;
    };
  }, [loadComponent]);

  // Reset camera view angle back to default [0, 0, 4.5]
  const handleResetCamera = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, []);

  // Toggle auto-spin on the asset
  const handleToggleAutoSpin = useCallback(() => {
    if (onConfigChange) {
      onConfigChange({
        ...config,
        motion: {
          ...config.motion,
          spin: {
            ...config.motion.spin,
            enabled: !config.motion.spin.enabled,
          },
        },
      });
    }
  }, [config, onConfigChange]);

  // Handle Play/Pause
  const handleTogglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  // DPR configuration according to quality mode and device
  const dpr = qualityMode === 'high' ? Math.min(window.devicePixelRatio || 1, 2) : 1;

  return (
    <div className={`asset-viewer-wrapper bg-mode-${bgMode}`}>
      {/* Background container (checkerboard is styled with CSS) */}
      <div
        className="viewer-canvas-container"
        role="region"
        aria-label="Khung hiển thị 3D"
        style={
          isRose && config.roseReveal?.backgroundColor
            ? { background: `radial-gradient(ellipse at 50% 35%, ${config.roseReveal.backgroundColor} 0%, #0d040c 100%)` }
            : isCard11 && config.card11?.backgroundColor
            ? { background: `radial-gradient(ellipse at 50% 50%, ${config.card11.backgroundColor} 0%, #030005 100%)` }
            : undefined
        }
      >
        {webGlContextLost ? (
          <div className="viewer-fallback-container">
            <div className="fallback-badge">
              <AlertCircle size={14} /> Chế độ 2D Fallback (Mất WebGL Context)
            </div>
            <img
              src={resolveAssetUrl(manifest.fallback)}
              alt={`${manifest.name} (Chế độ 2D)`}
              className="fallback-image"
            />
            <button
              type="button"
              className="btn-retry-3d"
              onClick={() => setWebGlContextLost(false)}
            >
              <RotateCcw size={14} /> Thử khôi phục 3D
            </button>
          </div>
        ) : loadError ? (
          <div className="viewer-load-error">
            <p>{loadError}</p>
          </div>
        ) : (
          <ViewerErrorBoundary fallbackSvgUrl={resolveAssetUrl(manifest.fallback)}>
            {isCard11 ? (
              <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                {LoadedComponent && (
                  <LoadedComponent
                    config={config}
                    paused={isPaused}
                    quality={qualityMode}
                  />
                )}
              </div>
            ) : (
              <Canvas
                camera={{ position: isUniverse ? [0, 0, 9.2] : isRose ? [0, 1.1, 6.2] : [0, 0, 4.5], fov: 45 }}
                dpr={dpr}
                gl={{
                  alpha: true,
                  antialias: true,
                  powerPreference: 'high-performance',
                }}
                onCreated={({ gl }) => {
                  const domEl = gl.domElement;
                  const handleContextLost = (e: Event) => {
                    e.preventDefault();
                    setWebGlContextLost(true);
                  };
                  const handleContextRestored = () => {
                    setWebGlContextLost(false);
                  };
                  domEl.addEventListener('webglcontextlost', handleContextLost, false);
                  domEl.addEventListener('webglcontextrestored', handleContextRestored, false);
                }}
              >
                {!isUniverse && !isRose && <StudioLighting />}

                <Suspense fallback={null}>
                  {LoadedComponent && (
                    isUniverse ? (
                      <LoadedComponent
                        config={config}
                        paused={isPaused}
                        quality={qualityMode}
                        isOpened={isUniverseOpened}
                      />
                    ) : isRose ? (
                      <LoadedComponent
                        config={config}
                        paused={isPaused}
                        quality={qualityMode}
                        state={roseState}
                        bloomProgress={
                          config.roseReveal?.manualBloomProgress !== undefined && config.roseReveal.manualBloomProgress >= 0
                            ? config.roseReveal.manualBloomProgress
                            : roseBloomProgress
                        }
                        flightProgress={roseFlightProgress}
                        onTriggerBloom={handleTriggerRoseBloom}
                      />
                    ) : (
                      <MotionRig
                        transform={config.transform}
                        motion={config.motion}
                        paused={isPaused}
                      >
                        <LoadedComponent
                          color={config.appearance.color}
                          roughness={config.appearance.roughness}
                          metalness={config.appearance.metalness}
                        />
                      </MotionRig>
                    )
                  )}
                </Suspense>

                <OrbitControls
                  ref={controlsRef}
                  enablePan={false}
                  enableDamping={true}
                  dampingFactor={0.05}
                  enabled={!isRose || config.roseReveal?.inspectionMode === true}
                  minDistance={isUniverse ? 3.5 : 2.5}
                  maxDistance={isUniverse ? 24.0 : 8.0}
                  makeDefault
                />
              </Canvas>
            )}
          </ViewerErrorBoundary>
        )}

        {/* Intro Touch Button Overlay for Love Universe */}
        {isUniverse && !isUniverseOpened && (
          <LoveUniverseIntroButton onOpen={() => setIsUniverseOpened(true)} />
        )}

        {/* Overlay for Rose Reveal */}
        {isRose && (
          <RoseRevealUI
            state={roseState}
            messageText={config.roseReveal?.messageText || 'Có một điều nhỏ bé dành cho bạn'}
            buttonText={config.roseReveal?.buttonText || 'Chạm để mở quà ♡'}
            destinationTarget={config.roseReveal?.destinationTarget || 'demo-card'}
            onTriggerBloom={handleTriggerRoseBloom}
            onReplay={handleReplayRose}
          />
        )}
      </div>

      {/* Viewer toolbar overlay */}
      <div className="viewer-toolbar" role="toolbar" aria-label="Bảng công cụ xem trước">
        <div className="toolbar-group">
          {/* Play/Pause */}
          <button
            type="button"
            className={`toolbar-btn ${isPaused ? 'active' : ''}`}
            onClick={handleTogglePause}
            title={isPaused ? 'Tiếp tục chuyển động' : 'Tạm dừng chuyển động'}
            aria-label={isPaused ? 'Tiếp tục' : 'Tạm dừng'}
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
            <span className="btn-label">{isPaused ? 'Tiếp tục' : 'Tạm dừng'}</span>
          </button>

          {/* Toggle Auto Spin */}
          <button
            type="button"
            className={`toolbar-btn ${config.motion.spin.enabled ? 'active' : ''}`}
            onClick={handleToggleAutoSpin}
            title="Bật / tắt tự xoay quanh trục Y"
            aria-label="Tự xoay"
          >
            <RotateCw size={16} />
            <span className="btn-label">Tự xoay</span>
          </button>

          {/* Reset Camera View */}
          <button
            type="button"
            className="toolbar-btn"
            onClick={handleResetCamera}
            title="Đặt lại góc nhìn camera về mặc định (không thay đổi tham số mẫu)"
            aria-label="Đặt lại góc nhìn camera"
          >
            <RotateCcw size={16} />
            <span className="btn-label">Góc chuẩn</span>
          </button>
        </div>

        <div className="toolbar-group">
          {/* Background Modes */}
          <div className="btn-segmented" role="group" aria-label="Chế độ nền">
            <button
              type="button"
              className={`segmented-btn ${bgMode === 'light' ? 'selected' : ''}`}
              onClick={() => setBgMode('light')}
              title="Nền sáng phòng studio"
              aria-label="Nền sáng"
            >
              <Sun size={14} />
            </button>
            <button
              type="button"
              className={`segmented-btn ${bgMode === 'dark' ? 'selected' : ''}`}
              onClick={() => setBgMode('dark')}
              title="Nền tối studio"
              aria-label="Nền tối"
            >
              <Moon size={14} />
            </button>
            <button
              type="button"
              className={`segmented-btn ${bgMode === 'checkerboard' ? 'selected' : ''}`}
              onClick={() => setBgMode('checkerboard')}
              title="Nền ô caro (nhận biết không gian trong suốt)"
              aria-label="Nền ô caro"
            >
              <Grid size={14} />
            </button>
          </div>

          {/* Quality Toggle */}
          <button
            type="button"
            className={`toolbar-btn btn-quality ${qualityMode === 'high' ? 'active' : ''}`}
            onClick={() => setQualityMode((q) => (q === 'high' ? 'low' : 'high'))}
            title={`Chất lượng hiển thị: ${qualityMode === 'high' ? 'Cao (sắc nét)' : 'Thấp (tiết kiệm pin)'}`}
            aria-label="Chuyển đổi chất lượng"
          >
            <Sparkles size={14} />
            <span className="btn-label">{qualityMode === 'high' ? 'HD' : 'Tiết kiệm'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetViewer;
