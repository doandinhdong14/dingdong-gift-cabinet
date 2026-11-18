import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { EffectEvent, EffectRuntime } from '../effect-sdk/types';
import { RuntimeContext, type RuntimeContextValue } from './RuntimeContext';

interface RuntimeProviderProps {
  children: React.ReactNode;
  initialQuality?: 'low' | 'medium' | 'high';
  onEvent?: (event: EffectEvent) => void;
}

export const RuntimeProvider: React.FC<RuntimeProviderProps> = ({
  children,
  initialQuality = 'high',
  onEvent,
}) => {
  const instanceId = useMemo(() => `inst_${Math.random().toString(36).slice(2, 9)}`, []);
  const [runId, setRunId] = useState<string>(() => `run_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1.0);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>(initialQuality);
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  });
  const [isVisible, setIsVisible] = useState<boolean>(() => document.visibilityState === 'visible');
  const [media, setMediaState] = useState<Record<string, string>>({});
  const [eventsLog, setEventsLog] = useState<EffectEvent[]>([]);

  // Listen for tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const completedRunIdsRef = useRef<Set<string>>(new Set());

  const emit = useCallback(
    (event: EffectEvent) => {
      // Deduplicate completion events per runId
      if (event.type === 'complete') {
        if (completedRunIdsRef.current.has(event.runId)) {
          return;
        }
        completedRunIdsRef.current.add(event.runId);
      }

      setEventsLog((prev) => [event, ...prev.slice(0, 49)]); // keep last 50 events
      onEvent?.(event);
    },
    [onEvent]
  );

  const reset = useCallback(() => {
    const newRun = `run_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setRunId(newRun);
    setIsPaused(false);
  }, []);

  const replay = useCallback(() => {
    reset();
  }, [reset]);

  const setMedia = useCallback((key: string, url: string) => {
    setMediaState((prev) => ({ ...prev, [key]: url }));
  }, []);

  const runtime: EffectRuntime = useMemo(
    () => ({
      instanceId,
      runId,
      quality,
      reducedMotion,
      isPaused,
      isVisible,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      clock: { deltaSeconds: 0, elapsedSeconds: 0 },
      speed,
    }),
    [instanceId, runId, quality, reducedMotion, isPaused, isVisible, speed]
  );

  const contextValue: RuntimeContextValue = useMemo(
    () => ({
      runtime,
      media,
      emit,
      setPaused: setIsPaused,
      setSpeed,
      reset,
      replay,
      setQuality,
      setReducedMotion,
      setMedia,
      eventsLog,
    }),
    [runtime, media, emit, reset, replay, eventsLog, setMedia]
  );

  return <RuntimeContext.Provider value={contextValue}>{children}</RuntimeContext.Provider>;
};
