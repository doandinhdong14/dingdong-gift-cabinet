/**
 * Motion math helpers for deterministic and continuous animations
 */

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * Math.max(0, Math.min(1, t));
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
}

export function easeInOutQuad(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped < 0.5 ? 2 * clamped * clamped : 1 - Math.pow(-2 * clamped + 2, 2) / 2;
}

export function easeOutBack(t: number, s = 1.70158): number {
  const c1 = s;
  const c3 = c1 + 1;
  const clamped = Math.max(0, Math.min(1, t));
  return 1 + c3 * Math.pow(clamped - 1, 3) + c1 * Math.pow(clamped - 1, 2);
}

/**
 * Creates a deterministic pseudorandom number generator with a given seed.
 */
export function createSeededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function next(): number {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Wraps a value cleanly within [min, max] range.
 */
export function wrapRange(val: number, min: number, max: number): number {
  const span = max - min;
  if (span <= 0) return min;
  let normalized = (val - min) % span;
  if (normalized < 0) normalized += span;
  return min + normalized;
}
