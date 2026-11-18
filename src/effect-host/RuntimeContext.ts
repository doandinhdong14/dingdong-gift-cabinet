import { createContext, useContext } from 'react';
import type { EffectEvent, EffectRuntime } from '../effect-sdk/types';

export interface RuntimeContextValue {
  runtime: EffectRuntime;
  media: Record<string, string>;
  emit: (event: EffectEvent) => void;
  setPaused: (paused: boolean) => void;
  setSpeed: (speed: number) => void;
  reset: () => void;
  replay: () => void;
  setQuality: (quality: 'low' | 'medium' | 'high') => void;
  setReducedMotion: (reduced: boolean) => void;
  setMedia: (key: string, url: string) => void;
  eventsLog: EffectEvent[];
}

export const RuntimeContext = createContext<RuntimeContextValue | null>(null);

export function useRuntimeContext(): RuntimeContextValue {
  const ctx = useContext(RuntimeContext);
  if (!ctx) {
    throw new Error('useRuntimeContext must be used within a RuntimeProvider');
  }
  return ctx;
}
