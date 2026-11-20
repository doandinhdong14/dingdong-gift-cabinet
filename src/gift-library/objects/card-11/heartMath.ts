import * as THREE from 'three';

/**
 * Keyframe points extracted exactly from the original card 11 (i-love-you-matrix/style.css):
 * 
 * @keyframes horizontal {
 *   from { transform: translateX(0); }
 *   to { transform: translateX(450px); }
 * }
 * 
 * @keyframes vertical {
 *   0% { transform: translateY(180px); }
 *   10% { transform: translateY(45px); }
 *   15% { transform: translateY(4.5px); }
 *   18% { transform: translateY(0); }
 *   20% { transform: translateY(4.5px); }
 *   22% { transform: translateY(34.61538px); }
 *   24% { transform: translateY(64.28571px); }
 *   25% { transform: translateY(112.5px); }
 *   26% { transform: translateY(64.28571px); }
 *   28% { transform: translateY(34.61538px); }
 *   30% { transform: translateY(4.5px); }
 *   32% { transform: translateY(0); }
 *   35% { transform: translateY(4.5px); }
 *   40% { transform: translateY(45px); }
 *   50% { transform: translateY(180px); }
 *   71% { transform: translateY(428.57143px); }
 *   72.5% { transform: translateY(441.17647px); }
 *   75% { transform: translateY(450px); }
 *   77.5% { transform: translateY(441.17647px); }
 *   79% { transform: translateY(428.57143px); }
 *   100% { transform: translateY(180px); }
 * }
 */
export interface KeyframePoint {
  p: number; // Normalized progress 0.0 to 1.0
  y: number; // Vertical translation in px
}

export const MATRIX_KEYFRAMES_Y: KeyframePoint[] = [
  { p: 0.00, y: 180 },
  { p: 0.10, y: 45 },
  { p: 0.15, y: 4.5 },
  { p: 0.18, y: 0 },
  { p: 0.20, y: 4.5 },
  { p: 0.22, y: 34.61538 },
  { p: 0.24, y: 64.28571 },
  { p: 0.25, y: 112.5 },
  { p: 0.26, y: 64.28571 },
  { p: 0.28, y: 34.61538 },
  { p: 0.30, y: 4.5 },
  { p: 0.32, y: 0 },
  { p: 0.35, y: 4.5 },
  { p: 0.40, y: 45 },
  { p: 0.50, y: 180 },
  { p: 0.71, y: 428.57143 },
  { p: 0.725, y: 441.17647 },
  { p: 0.75, y: 450 },
  { p: 0.775, y: 441.17647 },
  { p: 0.79, y: 428.57143 },
  { p: 1.00, y: 180 },
];

/**
 * Evaluates the vertical keyframe position Y(u) using smooth Hermite interpolation
 * across the CSS keyframe points.
 */
export function evaluateKeyframeY(u: number): number {
  const normU = ((u % 1) + 1) % 1; // [0, 1)

  for (let i = 0; i < MATRIX_KEYFRAMES_Y.length - 1; i++) {
    const k0 = MATRIX_KEYFRAMES_Y[i];
    const k1 = MATRIX_KEYFRAMES_Y[i + 1];

    if (normU >= k0.p && normU <= k1.p) {
      const span = k1.p - k0.p;
      if (span <= 1e-6) return k0.y;
      const alpha = (normU - k0.p) / span;
      // Smooth step easing
      const smooth = alpha * alpha * (3 - 2 * alpha);
      return k0.y + (k1.y - k0.y) * smooth;
    }
  }

  return MATRIX_KEYFRAMES_Y[0].y;
}

/**
 * Calculates 3D coordinates (x, y, z) along the heart curve.
 * 
 * @param progress Normalized progress along trajectory [0, 1)
 * @param mode 'original-matrix' or 'smooth-3d'
 * @param heartScale Overall scale factor
 * @param depth3D Depth displacement in Z axis
 * @param target Vector3 to store the result
 */
export function getHeartPosition(
  progress: number,
  mode: 'original-matrix' | 'smooth-3d',
  heartScale: number,
  depth3D: number,
  target: THREE.Vector3 = new THREE.Vector3()
): THREE.Vector3 {
  const u = ((progress % 1) + 1) % 1;

  if (mode === 'smooth-3d') {
    // Elegant parametric 3D heart knot
    const t = u * Math.PI * 2;
    const sinT = Math.sin(t);
    const cosT = Math.cos(t);

    // Parametric 2D heart base
    const rawX = 16 * Math.pow(sinT, 3);
    const rawY = 13 * cosT - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

    // Scale to standard Three.js unit coordinates (-2.5 to 2.5)
    const x = (rawX / 16) * 2.3 * heartScale;
    const y = ((rawY + 2.5) / 16) * 2.3 * heartScale;

    // Spatial 3D curvature: lobes curve forward, center cleft dips back, tip tapers
    const z = Math.sin(t) * Math.cos(t) * 1.6 * depth3D * heartScale;

    return target.set(x, y, z);
  }

  // Original Matrix CSS Keyframe Reproduction:
  // X: 225 * (1 - cos(2*pi*u)) -> from 0 to 450px
  // Y: evaluated from MATRIX_KEYFRAMES_Y -> from 0 to 450px
  const rawX = 225 * (1 - Math.cos(2 * Math.PI * u));
  const rawY = evaluateKeyframeY(u);

  // Center coordinate around (0, 0):
  // X in [-225, +225], Y in [-225, +225]
  // Flip Y because CSS Y goes down, 3D Y goes up.
  const worldScale = 0.011 * heartScale;
  const x = (rawX - 225) * worldScale;
  const y = -(rawY - 225) * worldScale;

  // 3D Spatial depth offset:
  // Allows the user to rotate and view the heart with sculptural 3D volume.
  // Front lobes (+Z) vs dip in the cleft (-Z).
  const z = Math.sin(2 * Math.PI * u) * 0.85 * depth3D * worldScale * 100;

  return target.set(x, y, z);
}

/**
 * Computes the tangent vector and rotation angle along the trajectory.
 */
export function getHeartTangent(
  progress: number,
  mode: 'original-matrix' | 'smooth-3d',
  heartScale: number,
  depth3D: number,
  delta = 0.005
): { tangent: THREE.Vector3; angleZ: number } {
  const pPrev = getHeartPosition(progress - delta, mode, heartScale, depth3D);
  const pNext = getHeartPosition(progress + delta, mode, heartScale, depth3D);

  const tangent = new THREE.Vector3().subVectors(pNext, pPrev).normalize();
  const angleZ = Math.atan2(tangent.y, tangent.x);

  return { tangent, angleZ };
}
