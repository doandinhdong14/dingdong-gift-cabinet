import React, { useState, useCallback, useRef } from 'react';
import type { EffectEvent } from '../effect-sdk/types';

export type TransitionState = 'preparing' | 'ready' | 'running' | 'revealing' | 'completed' | 'error';

interface TransitionControllerProps {
  onReveal?: () => void;
  onComplete?: () => void;
  children: (props: {
    state: TransitionState;
    start: () => void;
    reset: () => void;
    handleEvent: (event: EffectEvent) => void;
  }) => React.ReactNode;
}

export const TransitionController: React.FC<TransitionControllerProps> = ({
  onReveal,
  onComplete,
  children,
}) => {
  const [state, setState] = useState<TransitionState>('ready');
  const isTransitioningRef = useRef<boolean>(false);

  const start = useCallback(() => {
    if (isTransitioningRef.current || state === 'running' || state === 'revealing') {
      return; // prevent duplicate clicks
    }
    isTransitioningRef.current = true;
    setState('running');
  }, [state]);

  const reset = useCallback(() => {
    isTransitioningRef.current = false;
    setState('ready');
  }, []);

  const handleEvent = useCallback(
    (event: EffectEvent) => {
      if (event.type === 'reveal') {
        setState('revealing');
        onReveal?.();
      } else if (event.type === 'complete') {
        setState('completed');
        isTransitioningRef.current = false;
        onComplete?.();
      } else if (event.type === 'error') {
        setState('error');
        isTransitioningRef.current = false;
      }
    },
    [onReveal, onComplete]
  );

  return <>{children({ state, start, reset, handleEvent })}</>;
};
