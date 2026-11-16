/**
 * Math utilities for the gift motion rig.
 * Adheres strictly to spec:
 * - Deterministic, time-based calculations
 * - Non-accumulating scale/position
 * - Pose preserved on pause
 * - Clamped delta time to prevent jumps on tab restore
 */

/**
 * Clamps delta time to prevent large physics/animation jumps after tab restore.
 * @param dt Delta time in seconds
 * @param maxDelta Maximum allowed delta in seconds (default 0.1s = 100ms)
 */
export function clampDelta(dt: number, maxDelta: number = 0.1): number {
  if (!Number.isFinite(dt) || dt < 0) return 0;
  return Math.min(dt, maxDelta);
}

/**
 * Calculates vertical float offset in units.
 * Symmetrical oscillation around origin (0). Does not drift base position.
 */
export function calculateFloatOffset(time: number, amplitude: number, speed: number): number {
  if (!amplitude || amplitude <= 0 || !speed) return 0;
  // speed is in cycles per second (Hz)
  return amplitude * Math.sin(time * speed * Math.PI * 2);
}

/**
 * Calculates spin angle in radians.
 * @param time Elapsed active time in seconds
 * @param speedDegPerSecond Degrees per second
 */
export function calculateSpinRotation(time: number, speedDegPerSecond: number): number {
  if (!speedDegPerSecond) return 0;
  const radPerSecond = (speedDegPerSecond * Math.PI) / 180;
  return (time * radPerSecond) % (Math.PI * 2);
}

/**
 * Calculates heartbeat scale factor.
 * Soft contraction/expansion with two subtle pulses per beat (lub-dub).
 * BPM defines the duration of the entire two-pulse cycle.
 * Scale is always calculated from 1.0 (base multiplier) without frame accumulation.
 */
export function calculateHeartbeatScale(time: number, strength: number, bpm: number): number {
  if (!strength || strength <= 0 || !bpm || bpm <= 0) return 1.0;

  // Cycle duration in seconds for one full heartbeat (lub-dub)
  const cycleDuration = 60 / bpm;
  // Normalized phase [0, 1) within cycle
  const phase = ((time % cycleDuration) + cycleDuration) % cycleDuration / cycleDuration;

  let pulse = 0;
  // Pulse 1: "Lub" - primary ventricular contraction (phase 0.00 to 0.18)
  if (phase < 0.18) {
    const p1 = Math.sin((phase / 0.18) * Math.PI);
    pulse = Math.pow(p1, 1.8);
  }
  // Pulse 2: "Dub" - secondary atrial contraction (phase 0.22 to 0.38)
  else if (phase >= 0.22 && phase < 0.38) {
    const p2 = Math.sin(((phase - 0.22) / 0.16) * Math.PI);
    pulse = 0.65 * Math.pow(p2, 1.8);
  }
  // Resting phase (diastole): pulse = 0

  return 1.0 + strength * pulse;
}

/**
 * Helper to convert degree angles to radians
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
