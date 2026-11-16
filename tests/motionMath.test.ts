import { describe, it, expect } from 'vitest';
import {
  clampDelta,
  calculateFloatOffset,
  calculateSpinRotation,
  calculateHeartbeatScale,
  degreesToRadians,
} from '../src/gift-library/motion/motionMath';

describe('Motion Math - Spec Compliance', () => {
  describe('clampDelta', () => {
    it('should allow normal delta values under maxDelta', () => {
      expect(clampDelta(0.016)).toBeCloseTo(0.016);
      expect(clampDelta(0.033)).toBeCloseTo(0.033);
    });

    it('should clamp delta spikes caused by tab restoring or sleep', () => {
      expect(clampDelta(1.5, 0.1)).toBe(0.1);
      expect(clampDelta(10.0, 0.1)).toBe(0.1);
    });

    it('should handle negative or non-finite numbers safely', () => {
      expect(clampDelta(-0.5)).toBe(0);
      expect(clampDelta(NaN)).toBe(0);
      expect(clampDelta(Infinity)).toBe(0);
    });
  });

  describe('calculateFloatOffset', () => {
    it('should oscillate symmetrically around 0', () => {
      // At t=0, offset is 0
      expect(calculateFloatOffset(0, 0.1, 1)).toBeCloseTo(0);
      // At quarter period (t=0.25 when speed=1 cycle/s), sin is 1 -> offset is amplitude
      expect(calculateFloatOffset(0.25, 0.1, 1)).toBeCloseTo(0.1);
      // At three-quarter period (t=0.75), offset is -amplitude
      expect(calculateFloatOffset(0.75, 0.1, 1)).toBeCloseTo(-0.1);
      // At full cycle (t=1.0), offset returns to 0
      expect(calculateFloatOffset(1.0, 0.1, 1)).toBeCloseTo(0);
    });

    it('should return 0 when disabled or amplitude is 0', () => {
      expect(calculateFloatOffset(5.5, 0, 1)).toBe(0);
      expect(calculateFloatOffset(5.5, 0.1, 0)).toBe(0);
    });

    it('should never drift base position over long duration', () => {
      const offsetAfter1Hour = calculateFloatOffset(3600, 0.08, 0.35);
      expect(offsetAfter1Hour).toBeGreaterThanOrEqual(-0.08);
      expect(offsetAfter1Hour).toBeLessThanOrEqual(0.08);
    });
  });

  describe('calculateSpinRotation', () => {
    it('should calculate correct rotation angle in radians', () => {
      // 90 deg/s for 1 second = 90 deg = PI/2 rad
      expect(calculateSpinRotation(1, 90)).toBeCloseTo(Math.PI / 2);
      // 360 deg/s for 1 second = 0 rad (modulo 2PI)
      expect(calculateSpinRotation(1, 360)).toBeCloseTo(0);
    });

    it('should return 0 when speed is 0', () => {
      expect(calculateSpinRotation(10, 0)).toBe(0);
    });
  });

  describe('calculateHeartbeatScale', () => {
    it('should return 1.0 (base scale) when strength is 0 or bpm is 0', () => {
      expect(calculateHeartbeatScale(1.0, 0, 72)).toBe(1.0);
      expect(calculateHeartbeatScale(1.0, 0.05, 0)).toBe(1.0);
    });

    it('should be strictly non-accumulating (derived purely from time)', () => {
      const scaleA = calculateHeartbeatScale(10.05, 0.04, 72);
      const scaleB = calculateHeartbeatScale(10.05, 0.04, 72);
      expect(scaleA).toBe(scaleB);
    });

    it('should produce 2 distinct pulses (lub-dub) within one full cycle', () => {
      const bpm = 60; // 1 second per cycle
      const strength = 0.1;

      // Pulse 1 peak around phase 0.09s
      const scalePulse1 = calculateHeartbeatScale(0.09, strength, bpm);
      expect(scalePulse1).toBeGreaterThan(1.05);

      // Brief dip between pulse 1 and 2 around phase 0.19s
      const scaleDip = calculateHeartbeatScale(0.19, strength, bpm);
      expect(scaleDip).toBeCloseTo(1.0, 1);

      // Pulse 2 peak around phase 0.30s
      const scalePulse2 = calculateHeartbeatScale(0.30, strength, bpm);
      expect(scalePulse2).toBeGreaterThan(1.02);

      // Rest phase (diastole) from 0.45s to 0.95s
      const scaleRest = calculateHeartbeatScale(0.60, strength, bpm);
      expect(scaleRest).toBe(1.0);
    });

    it('should preserve pose exactly when paused (time does not change)', () => {
      const frozenTime = 0.28;
      const pose1 = calculateHeartbeatScale(frozenTime, 0.08, 80);
      const pose2 = calculateHeartbeatScale(frozenTime, 0.08, 80);
      expect(pose1).toBe(pose2);
    });
  });

  describe('degreesToRadians', () => {
    it('should convert degrees to radians correctly', () => {
      expect(degreesToRadians(0)).toBe(0);
      expect(degreesToRadians(180)).toBeCloseTo(Math.PI);
      expect(degreesToRadians(90)).toBeCloseTo(Math.PI / 2);
      expect(degreesToRadians(-90)).toBeCloseTo(-Math.PI / 2);
    });
  });
});
