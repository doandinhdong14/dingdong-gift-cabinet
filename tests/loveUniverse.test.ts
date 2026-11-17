import { describe, it, expect } from 'vitest';
import { generateUniverseLayout } from '../src/gift-library/objects/love-universe-01/universeLayout';
import {
  loveUniverse01DefaultConfig,
  loveUniverse01Presets,
  DEFAULT_WISHES,
} from '../src/gift-library/objects/love-universe-01/presets';
import { validateAssetConfig } from '../src/utils/configValidation';
import { DEFAULT_UNIVERSE_PLACEHOLDERS } from '../src/gift-library/objects/love-universe-01/placeholders';
import {
  saveUniversePhoto,
  getAllUniversePhotos,
  deleteUniversePhoto,
  clearAllUniversePhotos,
} from '../src/storage/universeImageStorage';

describe('LoveUniverse01 Layout & PRNG Determinism', () => {
  it('should generate identical layout when given identical seed', () => {
    const params = {
      wishes: [...DEFAULT_WISHES],
      photoUrls: [...DEFAULT_UNIVERSE_PLACEHOLDERS],
      textCount: 15,
      photoCount: 4,
      heartCount: 10,
      cloudWidth: 20,
      cloudHeight: 24,
      cloudDepth: 18,
      seed: 42,
    };

    const layout1 = generateUniverseLayout(params);
    const layout2 = generateUniverseLayout(params);

    expect(layout1.textItems).toHaveLength(15);
    expect(layout1.photoItems).toHaveLength(4);
    expect(layout1.heartItems).toHaveLength(10);

    // Verify exact coordinate determinism
    expect(layout1.textItems[0].position).toEqual(layout2.textItems[0].position);
    expect(layout1.textItems[0].rotation).toEqual(layout2.textItems[0].rotation);
    expect(layout1.photoItems[0].position).toEqual(layout2.photoItems[0].position);
    expect(layout1.heartItems[0].position).toEqual(layout2.heartItems[0].position);
  });

  it('should generate different layouts for different seeds', () => {
    const paramsA = {
      wishes: [...DEFAULT_WISHES],
      photoUrls: [...DEFAULT_UNIVERSE_PLACEHOLDERS],
      textCount: 10,
      photoCount: 3,
      heartCount: 8,
      cloudWidth: 20,
      cloudHeight: 24,
      cloudDepth: 18,
      seed: 123,
    };

    const paramsB = {
      ...paramsA,
      seed: 999,
    };

    const layoutA = generateUniverseLayout(paramsA);
    const layoutB = generateUniverseLayout(paramsB);

    expect(layoutA.textItems[0].position).not.toEqual(layoutB.textItems[0].position);
  });

  it('should distribute elements across near, mid, and far layers', () => {
    const layout = generateUniverseLayout({
      wishes: [...DEFAULT_WISHES],
      photoUrls: [...DEFAULT_UNIVERSE_PLACEHOLDERS],
      textCount: 20,
      photoCount: 6,
      heartCount: 15,
      cloudWidth: 20,
      cloudHeight: 24,
      cloudDepth: 18,
      seed: 777,
    });

    const layers = new Set(layout.textItems.map((t) => t.layer));
    expect(layers.has('near')).toBe(true);
    expect(layers.has('mid')).toBe(true);
    expect(layers.has('far')).toBe(true);
  });
});

describe('LoveUniverse01 Config & Presets Validation', () => {
  it('should pass schema validation for default config', () => {
    const res = validateAssetConfig(loveUniverse01DefaultConfig);
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
    expect(res.data?.assetId).toBe('love-universe-01');
    expect(res.data?.universe?.wishes.length).toBeGreaterThan(0);
  });

  it('should pass schema validation for all 3 built-in presets', () => {
    for (const preset of loveUniverse01Presets) {
      const res = validateAssetConfig(preset.config);
      expect(res.valid).toBe(true);
      expect(res.errors).toHaveLength(0);
    }
  });

  it('should reject invalid universe configurations', () => {
    // Invalid text count
    expect(
      validateAssetConfig({
        ...loveUniverse01DefaultConfig,
        universe: {
          ...loveUniverse01DefaultConfig.universe!,
          textCount: 9999,
        },
      }).valid
    ).toBe(false);

    // Invalid hex color
    expect(
      validateAssetConfig({
        ...loveUniverse01DefaultConfig,
        universe: {
          ...loveUniverse01DefaultConfig.universe!,
          textColor: 'not-a-color',
        },
      }).valid
    ).toBe(false);

    // Malicious injected field inside universe
    expect(
      validateAssetConfig({
        ...loveUniverse01DefaultConfig,
        universe: {
          ...loveUniverse01DefaultConfig.universe!,
          injectedScript: 'alert(1)',
        },
      }).valid
    ).toBe(false);
  });
});

describe('Universe Photo Storage (IndexedDB / Memory fallback)', () => {
  it('should save, list, delete, and clear photos cleanly', async () => {
    await clearAllUniversePhotos();

    // Create a mock image file
    const file1 = new File(['mock-image-data-1'], 'photo1.png', { type: 'image/png' });
    const saved1 = await saveUniversePhoto(file1);
    expect(saved1.id).toBeDefined();
    expect(saved1.name).toBe('photo1.png');

    const file2 = new File(['mock-image-data-2'], 'photo2.jpg', { type: 'image/jpeg' });
    const saved2 = await saveUniversePhoto(file2);

    let all = await getAllUniversePhotos();
    expect(all.length).toBe(2);

    // Delete photo 1
    await deleteUniversePhoto(saved1.id);
    all = await getAllUniversePhotos();
    expect(all.length).toBe(1);
    expect(all[0].id).toBe(saved2.id);

    // Clear all
    await clearAllUniversePhotos();
    all = await getAllUniversePhotos();
    expect(all.length).toBe(0);
  });
});

describe('3D Geometries & Downward Drift Motion', () => {
  it('should verify 3D puffy heart geometry has volume and watertight bounding box', async () => {
    const { getHeartGeometry } = await import('../src/gift-library/objects/heart-01/geometry');
    const geo = getHeartGeometry();
    expect(geo.boundingBox).toBeDefined();
    const size = new (await import('three')).Vector3();
    geo.boundingBox?.getSize(size);

    // Height ~ 2.0, Width ~ 2.08, Thickness ~ 0.78 (37.5% of width)
    expect(size.y).toBeCloseTo(2.0, 1);
    expect(size.x).toBeGreaterThan(1.9);
    expect(size.z).toBeGreaterThan(0.65); // Clear 3D volume, not flat!
    expect(size.z / size.x).toBeGreaterThan(0.30); // 30-45% thickness
  });

  it('should verify 3D faceted star geometry', async () => {
    const { createStar3DGeometry } = await import(
      '../src/gift-library/objects/love-universe-01/decorations/decorationGeometries'
    );
    const starGeo = createStar3DGeometry();
    expect(starGeo.getAttribute('position').count).toBe(12);
    expect(starGeo.getIndex()?.count).toBe(60); // 20 triangles * 3 indices
  });

  it('should verify wrapY smoothly wraps coordinates across buffer boundaries', async () => {
    const { wrapY } = await import(
      '../src/gift-library/objects/love-universe-01/motionUtils'
    );
    const cloudHeight = 7.2;
    const buffer = 2.0;
    const halfH = cloudHeight * 0.5; // 3.6
    const yMin = -halfH - buffer; // -5.6
    const yMax = halfH + buffer;  // +5.6

    // Baseline point at y = 0
    expect(wrapY(0, 0, cloudHeight)).toBeCloseTo(0, 5);

    // Drifting down by 1.0 unit
    expect(wrapY(0, 1.0, cloudHeight)).toBeCloseTo(-1.0, 4);

    // Drifting down past yMin (-5.6) wraps to near yMax (+5.6)
    const wrapped = wrapY(0, 6.0, cloudHeight);
    expect(wrapped).toBeGreaterThan(yMin);
    expect(wrapped).toBeLessThanOrEqual(yMax);
  });
});
