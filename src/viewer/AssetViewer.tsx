import React, { Suspense, useRef, useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Play, Pause, RotateCcw, RotateCw, Sun, Moon, Grid, Sparkles, AlertCircle } from 'lucide-react';
import { AssetConfig, AssetManifest } from '../gift-library/types';
import { MotionRig } from '../gift-library/motion/MotionRig';
import { StudioLighting } from './StudioLighting';
import { ViewerErrorBoundary } from './ViewerErrorBoundary';

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
  const [LoadedComponent, setLoadedComponent] = useState<React.ComponentType<Record<string, unknown>> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [bgMode, setBgMode] = useState<BackgroundMode>('light');
  const [qualityMode, setQualityMode] = useState<QualityMode>('high');
  const [webGlContextLost, setWebGlContextLost] = useState(false);

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
      <div className="viewer-canvas-container" role="region" aria-label="Khung hiển thị 3D">
        {webGlContextLost ? (
          <div className="viewer-fallback-container">
            <div className="fallback-badge">
              <AlertCircle size={14} /> Chế độ 2D Fallback (Mất WebGL Context)
            </div>
            <img
              src={manifest.fallback}
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
          <ViewerErrorBoundary fallbackSvgUrl={manifest.fallback}>
            <Canvas
              camera={{ position: [0, 0, 4.5], fov: 45 }}
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
              <StudioLighting />

              <Suspense fallback={null}>
                {LoadedComponent && (
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
                )}
              </Suspense>

              <OrbitControls
                ref={controlsRef}
                enablePan={false}
                minDistance={2.5}
                maxDistance={8.0}
                makeDefault
              />
            </Canvas>
          </ViewerErrorBoundary>
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
