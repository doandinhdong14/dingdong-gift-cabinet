/**
 * motionUtils.ts
 *
 * Smooth downward drift and continuous buffer wrapping utilities
 * for LoveUniverse01 ("Vũ trụ lời chúc").
 */

/**
 * Calculates seamlessly wrapped vertical Y coordinate in world space.
 * Items drift downwards smoothly. Once passing below the bottom boundary buffer,
 * they wrap to the top buffer zone outside the camera view without visual jumping.
 */
export function wrapY(
  baseY: number,
  driftOffset: number,
  cloudHeight: number,
  buffer = 2.0
): number {
  const halfH = cloudHeight * 0.5;
  const yMin = -halfH - buffer;
  const yMax = halfH + buffer;
  const span = yMax - yMin;

  const rawY = baseY - driftOffset;
  const wrapped = ((((rawY - yMin) % span) + span) % span) + yMin;
  return wrapped;
}
