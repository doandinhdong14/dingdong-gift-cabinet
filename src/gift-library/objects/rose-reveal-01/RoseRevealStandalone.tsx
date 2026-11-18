import React, { useState, useRef, useEffect, useCallback, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { AssetConfig, RoseRevealConfig } from '../../types';
import { defaultRoseRevealConfig } from './presets';
import { RoseRevealScene } from './RoseRevealScene';
import { RoseRevealUI } from './RoseRevealUI';
import { RoseRevealState } from './types';
import './roseReveal.css';

// Lazy-load LoveUniverse01 for destination integration if needed
const LazyLoveUniverse = React.lazy(() => import('../love-universe-01/LoveUniverse01'));

export interface RoseRevealStandaloneProps {
  config?: AssetConfig;
  onRevealComplete?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const RoseRevealStandalone: React.FC<RoseRevealStandaloneProps> = ({
  config,
  onRevealComplete,
  className = '',
  style,
}) => {
  const roseConfig: RoseRevealConfig = useMemo(() => {
    return {
      ...defaultRoseRevealConfig,
      ...(config?.roseReveal || {}),
    };
  }, [config?.roseReveal]);

  const [state, setState] = useState<RoseRevealState>('idle');
  const [bloomProgress, setBloomProgress] = useState(0);
  const [flightProgress, setFlightProgress] = useState(0);

  const hasTriggeredRef = useRef(false);
  const hasCompletedRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const isTabHiddenRef = useRef(false);

  // Reduced motion
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mq.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, []);

  // Page visibility
  useEffect(() => {
    const handleVisibility = () => {
      isTabHiddenRef.current = document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Trigger bloom with double-click / rapid-click lock
  const handleTriggerBloom = useCallback(() => {
    if (hasTriggeredRef.current || state !== 'idle') return;
    hasTriggeredRef.current = true;
    setState('blooming');
    startTimeRef.current = performance.now();

    const duration = reducedMotion ? 800 : roseConfig.bloomDuration * 1000;
    const totalDuration = duration + (reducedMotion ? 500 : 1800);

    const tick = (now: number) => {
      if (!startTimeRef.current) startTimeRef.current = now;
      if (isTabHiddenRef.current) {
        // Pause animation when tab is not visible
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      const elapsed = now - startTimeRef.current;

      // 1. Bloom progress
      const bNorm = Math.min(1, Math.max(0, elapsed / duration));
      const bEased = bNorm * bNorm * (3 - 2 * bNorm);
      setBloomProgress(bEased);

      // 2. Flight progress
      if (!reducedMotion) {
        const flightStart = duration * 0.70;
        if (elapsed >= flightStart) {
          const fNorm = Math.min(1, Math.max(0, (elapsed - flightStart) / (totalDuration - flightStart)));
          setFlightProgress(fNorm);
        }
      }

      // 3. State transitions
      if (elapsed >= duration + 400 && elapsed < totalDuration) {
        setState('revealing');
      }

      if (elapsed < totalDuration) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        setState('completed');
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          onRevealComplete?.();
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, [state, reducedMotion, roseConfig.bloomDuration, onRevealComplete]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Replay
  const handleReplay = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    hasTriggeredRef.current = false;
    hasCompletedRef.current = false;
    startTimeRef.current = null;
    setBloomProgress(0);
    setFlightProgress(0);
    setState('idle');
  }, []);

  // Background styling
  const bgStyle = useMemo(() => {
    return {
      background: `radial-gradient(ellipse at 50% 35%, ${roseConfig.backgroundColor} 0%, #0d040c 100%)`,
      ...style,
    };
  }, [roseConfig.backgroundColor, style]);

  return (
    <div className={`rose-reveal-container ${className}`} style={bgStyle}>
      <Canvas
        camera={{ position: [0, -0.65, 5.0], fov: 45 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <RoseRevealScene
            config={roseConfig}
            state={state}
            bloomProgress={bloomProgress}
            flightProgress={flightProgress}
            onTriggerBloom={handleTriggerBloom}
            reducedMotion={reducedMotion}
          />

          {/* Render Love Universe behind petals if configured as destination */}
          {roseConfig.destinationTarget === 'love-universe-01' && (state === 'revealing' || state === 'completed') && (
            <group position={[0, 0, -2.5]}>
              <LazyLoveUniverse isOpened={true} />
            </group>
          )}
        </Suspense>
      </Canvas>

      {/* HTML Overlay with Message, Button, and Destination */}
      <RoseRevealUI
        state={state}
        messageText={roseConfig.messageText}
        buttonText={roseConfig.buttonText}
        destinationTarget={roseConfig.destinationTarget}
        onTriggerBloom={handleTriggerBloom}
        onReplay={handleReplay}
      />
    </div>
  );
};

export default RoseRevealStandalone;
