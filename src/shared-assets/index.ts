/**
 * Shared assets repository for DingDong Gift effects.
 * Workers may read and use these approved, baseline components.
 */

// Geometries
export { createHeartGeometry, getHeartGeometry } from '../gift-library/objects/heart-01/geometry';
export { createStar3DGeometry } from '../gift-library/objects/love-universe-01/decorations/decorationGeometries';

// Motion math & physics algorithms
export {
  clampDelta,
  calculateFloatOffset,
  calculateSpinRotation,
  calculateHeartbeatScale,
} from '../gift-library/motion/motionMath';

export {
  wrapY,
  getWrapBounds,
} from '../gift-library/objects/love-universe-01/motionUtils';

// Shaders
export { flipUvVertexShader, flipUvFragmentShader } from '../gift-library/objects/love-universe-01/flipUvShader';
