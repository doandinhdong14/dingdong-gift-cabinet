/**
 * universeLayout.ts
 *
 * Deterministic 3D space cloud layout generator for LoveUniverse01.
 * Strict compliance with video reference & user instructions:
 * - Deterministic Mulberry32 PRNG with seed so layout never shuffles randomly on re-render.
 * - Vertically elongated space cloud with layered depth (near, mid, far).
 * - Clear scale disparity: near items are noticeably large (framing edges), mid items medium, far items small.
 * - Avoids dense clustering in initial center view while maintaining rich space density.
 * - Unified forward orientation with subtle 3D tilt (not tangential billboard knife-edges).
 */

import { UniverseElementLayout, UniverseLayoutResult } from './types';
import { generateStratifiedHeights } from './motionUtils';

/**
 * Fast 32-bit deterministic Mulberry32 PRNG
 */
export function createRNG(seed: number) {
  let s = Math.floor(Math.abs(seed)) >>> 0;
  if (s === 0) s = 1337;

  return function next(): number {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface GenerateUniverseLayoutParams {
  wishes: string[];
  photoUrls: string[];
  textCount: number;
  photoCount: number;
  heartCount: number;
  cloudWidth: number;   // horizontal extent, e.g. 5.5 - 8.5
  cloudHeight: number;  // vertical extent, e.g. 5.5 - 8.5
  cloudDepth: number;   // depth extent, e.g. 4.5 - 7.5
  seed: number;
}

export function generateUniverseLayout({
  wishes,
  photoUrls,
  textCount,
  photoCount,
  heartCount,
  cloudWidth,
  cloudHeight,
  cloudDepth,
  seed,
}: GenerateUniverseLayoutParams): UniverseLayoutResult {
  const rng = createRNG(seed);

  const safeWishes = wishes.length > 0 ? wishes : ['Yêu cậu'];
  const safePhotos = photoUrls.length > 0 ? photoUrls : [];

  const textItems: UniverseElementLayout[] = [];
  const photoItems: UniverseElementLayout[] = [];
  const heartItems: UniverseElementLayout[] = [];

  const randRange = (min: number, max: number) => min + rng() * (max - min);

  // Keep track of placed items to prevent exact overlapping
  const placedAnchors: Array<{ x: number; y: number; z: number; r: number }> = [];

  const isTooClose = (x: number, y: number, z: number, minDist: number, checkScreenProj = false) => {
    for (let i = 0; i < placedAnchors.length; i++) {
      const p = placedAnchors[i];
      const dx = x - p.x;
      const dy = y - p.y;
      const dz = (z - p.z) * 0.7; // depth separation factor
      const distSq = dx * dx + dy * dy + dz * dz;
      const combined = minDist + p.r;
      if (distSq < combined * combined) return true;

      // In initial forward view, avoid text occluding other text or sitting right on photos
      if (checkScreenProj) {
        // Perspective projection factor from camera at z=7.5
        const pCamDist = Math.max(0.1, 7.5 - p.z);
        const curCamDist = Math.max(0.1, 7.5 - z);
        const projX_p = p.x / pCamDist;
        const projY_p = p.y / pCamDist;
        const projX_cur = x / curCamDist;
        const projY_cur = y / curCamDist;

        const dProjX = Math.abs(projX_cur - projX_p) * 7.0;
        const dProjY = Math.abs(projY_cur - projY_p) * 7.0;

        if (dProjX < 0.65 && dProjY < 0.28) {
          return true;
        }
      }
    }
    return false;
  };

  const halfW = cloudWidth * 0.5;
  const halfD = cloudDepth * 0.5;

  // 1. Generate Photo Planes (12–20 items, distributed across height and depth)
  const actualPhotoCount = Math.max(1, Math.min(photoCount, 40));
  const photoHeights = generateStratifiedHeights(actualPhotoCount, cloudHeight, rng, 2.0, 0.70);
  for (let i = 0; i < actualPhotoCount; i++) {
    const layerRand = rng();
    const layerType: 'near' | 'mid' | 'far' = layerRand < 0.22 ? 'near' : layerRand < 0.72 ? 'mid' : 'far';

    let bestX = 0;
    const bestY = photoHeights[i];
    let bestZ = 0;
    let attempts = 0;

    while (attempts < 12) {
      attempts++;
      let x = 0;
      let z = 0;

      if (layerType === 'near') {
        // Near photos: placed at side edges ($|x| > 1.5$) to keep center open for glowing text
        const side = rng() > 0.5 ? 1 : -1;
        x = side * randRange(1.55, halfW * 0.98);
        z = randRange(halfD * 0.35, halfD * 0.85);
      } else if (layerType === 'mid') {
        // Mid photos: distributed with gentle central clearance
        const rawX = randRange(-halfW * 0.80, halfW * 0.80);
        x = Math.abs(rawX) < 0.5 ? (rawX >= 0 ? rawX + 0.6 : rawX - 0.6) : rawX;
        z = randRange(-halfD * 0.2, halfD * 0.35);
      } else {
        x = randRange(-halfW * 0.85, halfW * 0.85);
        z = randRange(-halfD * 0.85, -halfD * 0.2);
      }

      bestX = x;
      bestZ = z;

      if (!isTooClose(x, bestY, z, 0.65)) break;
    }

    placedAnchors.push({ x: bestX, y: bestY, z: bestZ, r: 0.55 });

    // Consistent forward-facing 3D orientation with subtle natural tilt
    const rotY = randRange(-0.14, 0.14); // ~ -8 to +8 deg
    const rotX = randRange(-0.08, 0.08); // ~ -4.5 to +4.5 deg
    const rotZ = randRange(-0.04, 0.04);

    // Scale disparity across depth (calibrated so photos never overpower text)
    const scaleVal = layerType === 'near'
      ? randRange(1.10, 1.30)
      : layerType === 'mid'
      ? randRange(0.85, 1.05)
      : randRange(0.58, 0.75);

    const photoUrl = safePhotos.length > 0 ? safePhotos[i % safePhotos.length] : '';

    photoItems.push({
      id: `photo_${i}`,
      type: 'photo',
      position: [bestX, bestY, bestZ],
      rotation: [rotX, rotY, rotZ],
      scale: [scaleVal, scaleVal, scaleVal],
      layer: layerType,
      phase: randRange(0, Math.PI * 2),
      floatSpeed: randRange(0.4, 0.8),
      content: photoUrl,
    });
  }

  // 2. Generate Text Wish Items (100–160 items, rich layered space)
  const actualTextCount = Math.max(1, Math.min(textCount, 220));
  const textHeights = generateStratifiedHeights(actualTextCount, cloudHeight, rng, 2.0, 0.75);
  for (let i = 0; i < actualTextCount; i++) {
    const layerRand = rng();
    // Near ~18%, Mid ~47%, Far ~35%
    const layerType: 'near' | 'mid' | 'far' = layerRand < 0.18 ? 'near' : layerRand < 0.65 ? 'mid' : 'far';

    let bestX = 0;
    const bestY = textHeights[i];
    let bestZ = 0;
    let attempts = 0;

    while (attempts < 20) {
      attempts++;
      let x = 0;
      let z = 0;

      if (layerType === 'near') {
        // Foreground phrases: frame the screen, prominent at corners/edges
        const side = rng() > 0.5 ? 1 : -1;
        x = side * randRange(1.25, halfW * 1.05);
        z = randRange(halfD * 0.35, halfD * 0.9);
      } else if (layerType === 'mid') {
        x = randRange(-halfW * 0.85, halfW * 0.85);
        z = randRange(-halfD * 0.2, halfD * 0.35);
      } else {
        // Far background: dense starfield of wishes
        x = randRange(-halfW * 0.95, halfW * 0.95);
        z = randRange(-halfD * 0.9, -halfD * 0.2);
      }

      bestX = x;
      bestZ = z;

      if (!isTooClose(x, bestY, z, 0.42, true)) break;
    }

    placedAnchors.push({ x: bestX, y: bestY, z: bestZ, r: 0.32 });

    // Forward-facing orientation with slight organic tilt
    const rotY = randRange(-0.14, 0.14);
    const rotX = randRange(-0.08, 0.08);
    const rotZ = randRange(-0.04, 0.04);

    // Apparent scale by depth layer: near is prominent (1.45-1.85x), mid 0.85-1.15x, far 0.42-0.65x
    const scaleBase = layerType === 'near'
      ? randRange(1.45, 1.85)
      : layerType === 'mid'
      ? randRange(0.85, 1.15)
      : randRange(0.42, 0.65);

    const wishText = safeWishes[i % safeWishes.length];

    textItems.push({
      id: `text_${i}`,
      type: 'text',
      position: [bestX, bestY, bestZ],
      rotation: [rotX, rotY, rotZ],
      scale: [scaleBase, scaleBase, scaleBase],
      layer: layerType,
      phase: randRange(0, Math.PI * 2),
      floatSpeed: randRange(0.35, 0.85),
      content: wishText,
    });
  }

  // 3. Generate Floating Coral-Red Silhouette Hearts (15–25 items)
  const actualHeartCount = Math.max(1, Math.min(heartCount, 60));
  const heartHeights = generateStratifiedHeights(actualHeartCount, cloudHeight, rng, 2.0, 0.75);
  for (let i = 0; i < actualHeartCount; i++) {
    const layerRand = rng();
    const layerType: 'near' | 'mid' | 'far' = layerRand < 0.25 ? 'near' : layerRand < 0.75 ? 'mid' : 'far';

    const y = heartHeights[i];

    let x = 0;
    let z = 0;
    if (layerType === 'near') {
      x = randRange(-halfW * 0.85, halfW * 0.85);
      z = randRange(halfD * 0.3, halfD * 0.85);
    } else if (layerType === 'mid') {
      x = randRange(-halfW * 0.75, halfW * 0.75);
      z = randRange(-halfD * 0.2, halfD * 0.3);
    } else {
      x = randRange(-halfW * 0.85, halfW * 0.85);
      z = randRange(-halfD * 0.85, -halfD * 0.2);
    }

    // Hearts tilt like floating petals in space
    const rotX = randRange(-0.25, 0.25);
    const rotY = randRange(-0.25, 0.25);
    const rotZ = randRange(-0.35, 0.35);

    const heartScale = layerType === 'near'
      ? randRange(0.65, 0.88)
      : layerType === 'mid'
      ? randRange(0.42, 0.60)
      : randRange(0.24, 0.35);

    heartItems.push({
      id: `heart_${i}`,
      type: 'heart',
      position: [x, y, z],
      rotation: [rotX, rotY, rotZ],
      scale: [heartScale, heartScale, heartScale],
      layer: layerType,
      phase: randRange(0, Math.PI * 2),
      floatSpeed: randRange(0.45, 1.05),
      content: '',
    });
  }

  return { textItems, photoItems, heartItems };
}
