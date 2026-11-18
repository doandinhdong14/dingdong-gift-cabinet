export interface SliceRenderInfo {
  index: number;
  sy: number; // Source Y in offscreen canvas
  sh: number; // Source height of slice
  dy: number; // Destination Y on canvas
  dh: number; // Destination height of slice
  z: number;  // Depth (for Painter's algorithm sort)
  lighting: number; // Multiplier (0.6 to 1.35)
  isBackface: boolean;
  dx?: number; // Lateral offset for diagonal peel
  sliceTilt?: number; // Slight tilt for organic paper feel
}

export interface CurlParams {
  progress: number; // 0 to 1
  pageWidth: number;
  pageHeight: number;
  curlIntensity: number;
  paperStiffness: number;
  pageIndex: number;
}

/**
 * Generates an organic, irregular ragged torn paper path across width W.
 * Uses deterministic multi-octave pseudo-noise seeded by pageIndex so
 * every page has its own unique, realistic tear pattern.
 */
export function generateTearPoints(width: number, seed: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const numPoints = 48;
  const step = width / numPoints;
  let s = (seed + 1) * 19937 + 73;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  for (let i = 0; i <= numPoints; i++) {
    const x = i * step;
    // Multi-frequency noise for organic ripped paper fibers
    const n1 = Math.sin(i * 0.42 + seed * 2.7) * 2.6;
    const n2 = Math.cos(i * 1.15 + seed * 4.9) * 1.6;
    const n3 = (rand() - 0.5) * 2.2;
    const y = n1 + n2 + n3;
    points.push({ x, y });
  }
  return points;
}

export function computeCurlSlices(params: CurlParams): {
  slices: SliceRenderInfo[];
  tearTilted: boolean;
  flyY: number;
  flyX: number;
  tiltAngle: number;
  flyOpacity: number;
  shadowY: number;
  shadowIntensity: number;
  rollY: number;
  peelAngle: number;
} {
  const { progress, pageHeight, curlIntensity, pageIndex } = params;
  const numSlices = 90;
  const sliceHeight = pageHeight / numSlices;
  const rawSlices: SliceRenderInfo[] = [];

  // Tear threshold: at 50% progress, top snaps and tears off from binder
  const TEAR_THRESHOLD = 0.50;

  // Alternate diagonal corner peel direction:
  // Even pageIndex (15, 17): bottom-right corner peels first (dir = 1)
  // Odd pageIndex (16, 18): bottom-left corner peels first (dir = -1)
  const cornerDir = pageIndex % 2 === 0 ? 1 : -1;

  if (progress < TEAR_THRESHOLD) {
    // -------------------------------------------------------------
    // Phase 1: Diagonal Corner Peel & Arc Bend (Natural Paper Peel)
    // -------------------------------------------------------------
    const norm = progress / TEAR_THRESHOLD;
    // Smooth natural acceleration as paper tension builds up
    const curved = Math.pow(norm, 1.28);
    // rollY moves from pageHeight (bottom) up to ~12% pageHeight (near clamp)
    const rollY = pageHeight * (1 - curved * 0.88);

    // Diagonal peel angle that gradually levels out as it approaches the binder
    const peelAngle = cornerDir * 0.14 * (1 - norm * 0.65);

    // Cylinder radius: flexible paper arc, tightening slightly under tension
    const radius = Math.max(14, (24 - curved * 8) * curlIntensity);

    // Dynamic drop shadow cast onto the revealed next page beneath the fold line
    const shadowY = rollY + 2;
    const shadowIntensity = Math.min(0.60, curved * 0.75);

    for (let i = 0; i < numSlices; i++) {
      const sy = i * sliceHeight;
      const sh = sliceHeight;

      if (sy + sh <= rollY) {
        // Flat section: still resting flat on the calendar pad
        rawSlices.push({
          index: i,
          sy,
          sh,
          dy: sy,
          dh: sh + 0.5,
          z: 0,
          lighting: 1.0,
          isBackface: false,
          dx: 0,
          sliceTilt: 0,
        });
      } else {
        // Curled section: wrapping around upward arc with asymmetric corner pull
        const s = (sy + sh * 0.5) - rollY; // distance along paper past roll line
        const theta = s / radius;          // angle around cylinder (radians)

        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);

        // Rolling UPWARDS means y decreases by radius * sinTheta
        const dy = rollY - radius * sinTheta;
        const dh = Math.max(0.4, sliceHeight * Math.abs(cosTheta));
        const z = radius * (1 - cosTheta);

        // When cosTheta > 0, normal faces toward viewer (front page)
        // When cosTheta < 0, normal faces away (backface of paper)
        const isBackface = cosTheta < 0;

        let light = 1.0;
        if (!isBackface) {
          // Specular highlight crest near theta = pi / 2
          const spec = Math.max(0, sinTheta);
          light = 0.88 + spec * 0.38;
        } else {
          // Backface inside the roll: soft ambient shadow
          light = 0.65 + Math.max(0, sinTheta) * 0.22;
        }

        // Asymmetric diagonal displacement for natural corner peel
        const lateralPull = cornerDir * Math.sin(theta) * (sy / pageHeight) * 7;
        const sliceTilt = cornerDir * 0.05 * Math.sin(theta) * (1 - norm * 0.5);

        rawSlices.push({
          index: i,
          sy,
          sh,
          dy: dy - dh * 0.5,
          dh: dh + 0.8, // slight overlap to prevent sub-pixel gaps
          z: isBackface ? -z : z, // backface is drawn deeper in z
          lighting: light,
          isBackface,
          dx: lateralPull,
          sliceTilt,
        });
      }
    }

    // Painter's Algorithm: draw deepest (smallest z) first, nearest (largest z) on top
    const sortedSlices = [...rawSlices].sort((a, b) => a.z - b.z);

    return {
      slices: sortedSlices,
      tearTilted: false,
      flyY: 0,
      flyX: 0,
      tiltAngle: 0,
      flyOpacity: 1.0,
      shadowY,
      shadowIntensity,
      rollY,
      peelAngle,
    };
  } else {
    // -------------------------------------------------------------
    // Phase 2: Detached, Ripped at Binder, Aerodynamic Flight & Flutter
    // -------------------------------------------------------------
    const flyProgress = (progress - TEAR_THRESHOLD) / (1 - TEAR_THRESHOLD);
    // Acceleration curve for paper floating into the air
    const flyAcc = Math.pow(flyProgress, 1.35);

    // Alternating tilt direction: even page index tilts left, odd tilts right
    const dir = pageIndex % 2 === 0 ? -1 : 1;

    // Aerodynamic flutter: paper oscillates gently in air current
    const flutter = Math.sin(flyProgress * 15) * 0.045 * (1 - flyProgress);
    const tiltAngle = dir * (flyProgress * 0.28) + flutter;

    const flyX = dir * (Math.pow(flyProgress, 1.1) * 62);
    const flyY = -flyAcc * (pageHeight * 1.5);
    const flyOpacity = Math.max(0, 1 - Math.pow(flyProgress, 1.6));

    // Natural paper relaxation: released paper uncurls as it flies away!
    const radius = Math.max(22, (26 + flyProgress * 32) * curlIntensity);
    const rollY = pageHeight * (0.18 + flyProgress * 0.16);

    for (let i = 0; i < numSlices; i++) {
      const sy = i * sliceHeight;
      const sh = sliceHeight;

      const s = sy - rollY;
      const theta = Math.max(0, s / radius);
      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);

      const dy = rollY - radius * sinTheta;
      const dh = Math.max(0.5, sliceHeight * Math.abs(cosTheta));
      const z = radius * (1 - cosTheta);
      const isBackface = cosTheta < 0;

      const light = isBackface ? 0.72 : 0.95 + Math.max(0, sinTheta) * 0.25;
      const lateralPull = dir * Math.sin(theta) * 4;

      rawSlices.push({
        index: i,
        sy,
        sh,
        dy: dy - dh * 0.5,
        dh: dh + 0.8,
        z: isBackface ? -z : z,
        lighting: light,
        isBackface,
        dx: lateralPull,
        sliceTilt: flutter,
      });
    }

    const sortedSlices = [...rawSlices].sort((a, b) => a.z - b.z);

    return {
      slices: sortedSlices,
      tearTilted: true,
      flyY,
      flyX,
      tiltAngle,
      flyOpacity,
      shadowY: pageHeight,
      shadowIntensity: Math.max(0, 0.3 * (1 - flyProgress)),
      rollY,
      peelAngle: 0,
    };
  }
}
