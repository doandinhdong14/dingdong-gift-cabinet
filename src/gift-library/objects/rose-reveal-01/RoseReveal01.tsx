import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { AssetConfig, RoseRevealConfig } from '../../types';
import { defaultRoseRevealConfig } from './presets';
import { RoseRevealScene } from './RoseRevealScene';
import { RoseRevealState } from './types';

export interface RoseReveal01Props {
  config?: AssetConfig;
  paused?: boolean;
  quality?: 'low' | 'high';
  state?: RoseRevealState;
  bloomProgress?: number;
  flightProgress?: number;
  onTriggerBloom?: () => void;
  onRevealComplete?: () => void;
  onStateChange?: (state: RoseRevealState) => void;
  reducedMotion?: boolean;
}

export const RoseReveal01: React.FC<RoseReveal01Props> = ({
  config,
  paused = false,
  state: propState,
  bloomProgress: propBloomProgress,
  flightProgress: propFlightProgress,
  onTriggerBloom: propOnTriggerBloom,
  onRevealComplete,
  onStateChange,
  reducedMotion: propReducedMotion,
}) => {
  const roseConfig: RoseRevealConfig = useMemo(() => {
    return {
      ...defaultRoseRevealConfig,
      ...(config?.roseReveal || {}),
    };
  }, [config?.roseReveal]);

  // Internal state if not controlled by parent
  const [internalState, setInternalState] = useState<RoseRevealState>('idle');
  const [internalBloomProgress, setInternalBloomProgress] = useState(0);
  const [internalFlightProgress, setInternalFlightProgress] = useState(0);

  const activeState = propState !== undefined ? propState : internalState;
  const activeBloomProgress = propBloomProgress !== undefined ? propBloomProgress : internalBloomProgress;
  const activeFlightProgress = propFlightProgress !== undefined ? propFlightProgress : internalFlightProgress;

  const animationClockRef = useRef<number>(0);
  const hasTriggeredRef = useRef<boolean>(false);
  const hasCompletedRef = useRef<boolean>(false);

  // Detect reduced motion preference if not explicitly provided
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setSystemReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setSystemReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  const effectiveReducedMotion = propReducedMotion !== undefined ? propReducedMotion : systemReducedMotion;

  // Handle visibility change (pause timeline when tab hidden, resume cleanly)
  const isTabHiddenRef = useRef<boolean>(false);
  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabHiddenRef.current = document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Internal trigger handler with debounce lock
  const handleInternalTrigger = useCallback(() => {
    if (hasTriggeredRef.current || activeState !== 'idle') return;
    hasTriggeredRef.current = true;
    setInternalState('blooming');
    onStateChange?.('blooming');
    animationClockRef.current = 0;
  }, [activeState, onStateChange]);

  const triggerHandler = propOnTriggerBloom || handleInternalTrigger;

  // Animation timeline advancement
  useFrame((_, delta) => {
    if (paused || isTabHiddenRef.current) return;

    // Only run internal timeline if state is not externally controlled
    if (propState === undefined && activeState !== 'idle' && activeState !== 'error') {
      animationClockRef.current += delta;
      const t = animationClockRef.current;

      const duration = effectiveReducedMotion ? 0.8 : roseConfig.bloomDuration;
      const totalDuration = duration + (effectiveReducedMotion ? 0.5 : 1.8);

      // 1. Bloom progress (0 to 1)
      const bProgress = Math.min(1, Math.max(0, t / duration));
      // Cubic easing
      const easedBloom = bProgress * bProgress * (3 - 2 * bProgress);
      setInternalBloomProgress(easedBloom);

      // 2. Flight progress
      if (!effectiveReducedMotion) {
        const flightStartTime = duration * 0.70;
        if (t >= flightStartTime) {
          const flightDuration = totalDuration - flightStartTime;
          const fProgress = Math.min(1, Math.max(0, (t - flightStartTime) / flightDuration));
          setInternalFlightProgress(fProgress);
        }
      }

      // 3. State transitions
      if (t >= duration + 0.5 && activeState === 'blooming') {
        setInternalState('revealing');
        onStateChange?.('revealing');
      }

      if (t >= totalDuration && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        setInternalState('completed');
        onStateChange?.('completed');
        onRevealComplete?.();
      }
    }
  });

  return (
    <RoseRevealScene
      config={roseConfig}
      state={activeState}
      bloomProgress={activeBloomProgress}
      flightProgress={activeFlightProgress}
      paused={paused}
      onTriggerBloom={triggerHandler}
      reducedMotion={effectiveReducedMotion}
    />
  );
};

export default RoseReveal01;
