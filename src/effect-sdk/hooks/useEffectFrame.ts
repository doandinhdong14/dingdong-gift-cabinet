import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import type { EffectRuntime } from '../types';

export interface EffectFrameCallbackInfo {
  deltaSeconds: number;
  elapsedSeconds: number;
  runId: string;
  isPaused: boolean;
  speed: number;
}

export type EffectFrameCallback = (info: EffectFrameCallbackInfo) => void;

/**
 * Hook for R3F components inside an Effect scene.
 * Provides stable time integration, handles pause/resume, speed scaling,
 * tab visibility, and resets accumulated time when runId changes.
 */
export function useEffectFrame(
  runtime: EffectRuntime,
  callback: EffectFrameCallback
) {
  const accumulatedTimeRef = useRef<number>(0);
  const lastRunIdRef = useRef<string>(runtime.runId);

  // Reset accumulated time when runId changes (e.g. replay/reset)
  useEffect(() => {
    if (runtime.runId !== lastRunIdRef.current) {
      accumulatedTimeRef.current = 0;
      lastRunIdRef.current = runtime.runId;
    }
  }, [runtime.runId]);

  useFrame((_, delta) => {
    // If paused or tab hidden, delta is 0 and we do not advance time
    if (runtime.isPaused || !runtime.isVisible) {
      return;
    }

    // Clamp delta to prevent huge jumps when resuming after background pause
    const clampedDelta = Math.min(delta, 0.1);
    const speed = typeof runtime.speed === 'number' && Number.isFinite(runtime.speed) ? runtime.speed : 1.0;
    const effectiveDelta = clampedDelta * speed;

    accumulatedTimeRef.current += effectiveDelta;

    callback({
      deltaSeconds: effectiveDelta,
      elapsedSeconds: accumulatedTimeRef.current,
      runId: runtime.runId,
      isPaused: runtime.isPaused,
      speed,
    });
  });
}
