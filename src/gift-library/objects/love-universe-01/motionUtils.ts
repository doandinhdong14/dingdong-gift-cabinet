/**
 * motionUtils.ts
 *
 * Smooth downward drift and continuous buffer wrapping utilities
 * for LoveUniverse01 ("Vũ trụ lời chúc").
 */

export const DEFAULT_WRAP_BUFFER = 2.0;

export interface WrapBounds {
  yMin: number;
  yMax: number;
  span: number;
  buffer: number;
}

/**
 * Returns exact periodic vertical wrapping bounds for a given cloud height.
 */
export function getWrapBounds(
  cloudHeight: number,
  buffer = DEFAULT_WRAP_BUFFER
): WrapBounds {
  const halfH = cloudHeight * 0.5;
  const yMin = -halfH - buffer;
  const yMax = halfH + buffer;
  const span = yMax - yMin;
  return { yMin, yMax, span, buffer };
}

/**
 * Calculates seamlessly wrapped vertical Y coordinate in world space.
 * Items drift downwards smoothly. Once passing below the bottom boundary buffer,
 * they wrap to the top buffer zone outside the camera view without visual jumping.
 * Overshoot is strictly preserved: wrapped = ((((rawY - yMin) % span) + span) % span) + yMin.
 */
export function wrapY(
  baseY: number,
  driftOffset: number,
  cloudHeight: number,
  buffer = DEFAULT_WRAP_BUFFER
): number {
  const { yMin, span } = getWrapBounds(cloudHeight, buffer);
  const rawY = baseY - driftOffset;
  const wrapped = ((((rawY - yMin) % span) + span) % span) + yMin;
  return wrapped;
}

/**
 * Generates stratified height coordinates for N items uniformly partitioning
 * the entire periodic wrap cycle [yMin, yMax), avoiding clustering and gaps.
 *
 * Each slice has length span / count, ensuring exactly 1 item per slice
 * with bounded organic jitter. Fisher-Yates deterministic shuffle separates
 * ordering so items do not appear rigidly sequential.
 */
export function generateStratifiedHeights(
  count: number,
  cloudHeight: number,
  rng: () => number,
  buffer = DEFAULT_WRAP_BUFFER,
  jitterFraction = 0.75
): number[] {
  if (count <= 0) return [];
  const { yMin, span } = getWrapBounds(cloudHeight, buffer);
  const binSize = span / count;

  const heights: number[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const jitter = (rng() - 0.5) * binSize * Math.max(0, Math.min(0.85, jitterFraction));
    heights[i] = yMin + (i + 0.5) * binSize + jitter;
  }

  // Deterministic Fisher-Yates shuffle
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = heights[i];
    heights[i] = heights[j];
    heights[j] = temp;
  }

  return heights;
}
