import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AssetTransform, AssetMotion } from '../types';
import {
  clampDelta,
  calculateFloatOffset,
  calculateSpinRotation,
  calculateHeartbeatScale,
  degreesToRadians,
} from './motionMath';

export interface MotionRigProps {
  transform: AssetTransform;
  motion: AssetMotion;
  paused?: boolean;
  children: React.ReactNode;
}

export const MotionRig: React.FC<MotionRigProps> = ({
  transform,
  motion,
  paused = false,
  children,
}) => {
  // Nested groups to isolate transforms cleanly
  const userTransformGroupRef = useRef<THREE.Group>(null);
  const spinGroupRef = useRef<THREE.Group>(null);
  const floatGroupRef = useRef<THREE.Group>(null);
  const heartbeatGroupRef = useRef<THREE.Group>(null);

  // Active cumulative time in seconds (only advances when NOT paused)
  const activeTimeRef = useRef<number>(0);

  // Detect prefers-reduced-motion
  const prefersReducedMotionRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      prefersReducedMotionRef.current = mediaQuery.matches;

      const listener = (event: MediaQueryListEvent) => {
        prefersReducedMotionRef.current = event.matches;
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // Update base user transform immediately
  useEffect(() => {
    if (userTransformGroupRef.current) {
      const baseScale = transform.scale ?? 1;
      userTransformGroupRef.current.scale.set(baseScale, baseScale, baseScale);
      userTransformGroupRef.current.rotation.set(
        degreesToRadians(transform.rotationDeg?.[0] ?? 0),
        degreesToRadians(transform.rotationDeg?.[1] ?? 0),
        degreesToRadians(transform.rotationDeg?.[2] ?? 0)
      );
    }
  }, [transform.scale, transform.rotationDeg]);

  useFrame((_, delta) => {
    // If paused, keep frozen at current activeTimeRef and do not advance
    if (paused) {
      return;
    }

    // Clamp delta to protect against large time jumps when tab was backgrounded
    const safeDelta = clampDelta(delta);
    activeTimeRef.current += safeDelta;
    const time = activeTimeRef.current;

    // 1. Float Motion (applied to floatGroupRef on Y axis)
    if (floatGroupRef.current) {
      if (motion.float.enabled) {
        const yOffset = calculateFloatOffset(time, motion.float.amplitude, motion.float.speed);
        floatGroupRef.current.position.y = yOffset;
      } else {
        floatGroupRef.current.position.y = 0;
      }
    }

    // 2. Spin Motion (applied to spinGroupRef around Y axis)
    if (spinGroupRef.current) {
      if (motion.spin.enabled) {
        const spinRad = calculateSpinRotation(time, motion.spin.speedDegPerSecond);
        spinGroupRef.current.rotation.y = spinRad;
      } else {
        spinGroupRef.current.rotation.y = 0;
      }
    }

    // 3. Heartbeat Motion (applied to heartbeatGroupRef scale)
    if (heartbeatGroupRef.current) {
      if (motion.heartbeat.enabled) {
        const s = calculateHeartbeatScale(time, motion.heartbeat.strength, motion.heartbeat.bpm);
        heartbeatGroupRef.current.scale.set(s, s, s);
      } else {
        heartbeatGroupRef.current.scale.set(1, 1, 1);
      }
    }
  });

  return (
    // Hierarchy: User Transform Group -> Float Group -> Spin Group -> Heartbeat Group -> Children
    <group ref={userTransformGroupRef}>
      <group ref={floatGroupRef}>
        <group ref={spinGroupRef}>
          <group ref={heartbeatGroupRef}>
            {children}
          </group>
        </group>
      </group>
    </group>
  );
};
