import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { EffectDefinition } from '../effect-sdk/types';
import { useRuntimeContext } from './RuntimeContext';
import { ViewerErrorBoundary } from '../viewer/ViewerErrorBoundary';
import { StudioLighting } from '../viewer/StudioLighting';

export interface EffectHostProps<C = any> {
  definition: EffectDefinition<C>;
  config: C;
  backgroundMode?: 'light' | 'dark' | 'checker';
  autoRotate?: boolean;
  enableOrbitControls?: boolean;
}

export const EffectHost: React.FC<EffectHostProps> = ({
  definition,
  config,
  backgroundMode = 'light',
  autoRotate = false,
  enableOrbitControls = true,
}) => {
  const { runtime, media, emit } = useRuntimeContext();

  const { manifest, presentation, Scene, Overlay } = definition;

  const cameraConfig = useMemo(() => {
    return {
      fov: presentation?.camera?.fov ?? 45,
      position: presentation?.camera?.position ?? ([0, 0, 5] as [number, number, number]),
    };
  }, [presentation]);

  const bgStyle = useMemo(() => {
    if (presentation?.background?.color) {
      return { backgroundColor: presentation.background.color };
    }
    switch (backgroundMode) {
      case 'dark':
        return { backgroundColor: '#1e293b' };
      case 'checker':
        return {
          backgroundColor: '#f1f5f9',
          backgroundImage:
            'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        };
      case 'light':
      default:
        return { backgroundColor: '#f8fafc' };
    }
  }, [backgroundMode, presentation]);

  return (
    <div
      className="effect-host-root"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '400px',
        overflow: 'hidden',
        borderRadius: '12px',
        ...bgStyle,
      }}
    >
      <ViewerErrorBoundary fallbackSvgUrl={manifest.fallback}>
        {manifest.renderer === 'r3f' && Scene && (
          <Canvas
            camera={{
              fov: cameraConfig.fov,
              position: cameraConfig.position,
            }}
            gl={{
              antialias: runtime.quality !== 'low',
              powerPreference: runtime.quality === 'low' ? 'low-power' : 'high-performance',
            }}
            style={{ width: '100%', height: '100%', display: 'block' }}
          >
            <Suspense fallback={null}>
              {presentation?.lighting ? (
                <>
                  <ambientLight intensity={presentation.lighting.ambientIntensity ?? 0.7} />
                  <directionalLight
                    color={presentation.lighting.mainLightColor ?? '#ffffff'}
                    intensity={presentation.lighting.mainLightIntensity ?? 1.2}
                    position={presentation.lighting.mainLightPosition ?? [3, 5, 4]}
                  />
                </>
              ) : (
                <StudioLighting />
              )}

              {enableOrbitControls && (
                <OrbitControls
                  makeDefault
                  enableDamping
                  dampingFactor={0.05}
                  autoRotate={autoRotate && !runtime.isPaused}
                  autoRotateSpeed={1.5}
                />
              )}

              <Scene
                config={config}
                runtime={runtime}
                media={media}
                emit={emit}
              />
            </Suspense>
          </Canvas>
        )}

        {Overlay && (
          <div
            className="effect-host-overlay"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <div style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}>
              <Overlay
                config={config}
                runtime={runtime}
                media={media}
                emit={emit}
              />
            </div>
          </div>
        )}
      </ViewerErrorBoundary>
    </div>
  );
};
