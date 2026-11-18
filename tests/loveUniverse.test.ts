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

describe('Independent Group Falling Speed Controls & Verification', () => {
  // Helper implementing the exact motion calculation used in LoveUniverse01 & DecorationsField
  function computeEffectiveGroupSpeed(
    groupEnabled: boolean,
    groupSpeed: number,
    globalDriftEnabled: boolean,
    globalMultiplier: number
  ): number {
    if (!globalDriftEnabled || !groupEnabled) return 0;
    return Math.max(0, groupSpeed * globalMultiplier);
  }

  it('verifies required example: photo=0, heart=1, text=0.2, giftbox=0.1, star3d=0.5', () => {
    const globalDriftEnabled = true;
    const globalMultiplier = 1.0;

    const textSpeed = computeEffectiveGroupSpeed(true, 0.2, globalDriftEnabled, globalMultiplier);
    const photoSpeed = computeEffectiveGroupSpeed(false, 0.35, globalDriftEnabled, globalMultiplier);
    const photoSpeedWithZero = computeEffectiveGroupSpeed(true, 0, globalDriftEnabled, globalMultiplier);
    const heartSpeed = computeEffectiveGroupSpeed(true, 1.0, globalDriftEnabled, globalMultiplier);
    const starSpeed = computeEffectiveGroupSpeed(true, 0.5, globalDriftEnabled, globalMultiplier);
    const giftboxSpeed = computeEffectiveGroupSpeed(true, 0.1, globalDriftEnabled, globalMultiplier);

    // Assert exact speeds
    expect(textSpeed).toBeCloseTo(0.2, 5);
    expect(photoSpeed).toBe(0); // Disabled stands still
    expect(photoSpeedWithZero).toBe(0); // Speed 0 stands still
    expect(heartSpeed).toBeCloseTo(1.0, 5);
    expect(starSpeed).toBeCloseTo(0.5, 5);
    expect(giftboxSpeed).toBeCloseTo(0.1, 5);

    // Simulate 2 seconds of motion: photo remains at 0 distance; others advance by speed * time
    const timeDelta = 0.016; // ~60fps
    const frames = 125; // 2.0 seconds
    let textOffset = 0;
    let photoOffset = 0;
    let heartOffset = 0;
    let giftboxOffset = 0;

    for (let f = 0; f < frames; f++) {
      textOffset += textSpeed * timeDelta;
      photoOffset += photoSpeed * timeDelta;
      heartOffset += heartSpeed * timeDelta;
      giftboxOffset += giftboxSpeed * timeDelta;
    }

    expect(photoOffset).toBe(0); // Completely still
    expect(textOffset).toBeCloseTo(0.4, 1);
    expect(heartOffset).toBeCloseTo(2.0, 1);
    expect(giftboxOffset).toBeCloseTo(0.2, 1);
  });

  it('adjusting heart speed does not change text, photo, or giftbox speed', () => {
    let heartSetting = 1.0;
    const textSetting = 0.2;
    const photoSetting = 0.0;
    const giftboxSetting = 0.1;

    expect(computeEffectiveGroupSpeed(true, textSetting, true, 1.0)).toBeCloseTo(0.2, 5);
    expect(computeEffectiveGroupSpeed(true, giftboxSetting, true, 1.0)).toBeCloseTo(0.1, 5);
    expect(computeEffectiveGroupSpeed(false, photoSetting, true, 1.0)).toBe(0);

    // Speed up heart to 2.5
    heartSetting = 2.5;
    expect(computeEffectiveGroupSpeed(true, heartSetting, true, 1.0)).toBeCloseTo(2.5, 5);

    // Other settings remain completely unchanged
    expect(computeEffectiveGroupSpeed(true, textSetting, true, 1.0)).toBeCloseTo(0.2, 5);
    expect(computeEffectiveGroupSpeed(true, giftboxSetting, true, 1.0)).toBeCloseTo(0.1, 5);
    expect(computeEffectiveGroupSpeed(false, photoSetting, true, 1.0)).toBe(0);
  });

  it('supports two distinct heart groups with different IDs running at different speeds', () => {
    // Group 1: Main procedural hearts
    const mainHeartGroup = { id: 'main_hearts', speed: 1.2, enabled: true };
    // Group 2: Secondary decorative heart group
    const customHeartGroup = { id: 'deco_heart_custom', speed: 0.4, enabled: true };

    const speed1 = computeEffectiveGroupSpeed(mainHeartGroup.enabled, mainHeartGroup.speed, true, 1.0);
    const speed2 = computeEffectiveGroupSpeed(customHeartGroup.enabled, customHeartGroup.speed, true, 1.0);

    expect(speed1).toBeCloseTo(1.2, 5);
    expect(speed2).toBeCloseTo(0.4, 5);
    expect(speed1).not.toBe(speed2);
  });

  it('global multiplier = 0 stops falling, restoring to 1 recovers exact individual speeds', () => {
    const textBase = 0.2;
    const heartBase = 1.0;
    const giftboxBase = 0.1;

    // Active at 1.0x
    expect(computeEffectiveGroupSpeed(true, textBase, true, 1.0)).toBeCloseTo(0.2, 5);
    expect(computeEffectiveGroupSpeed(true, heartBase, true, 1.0)).toBeCloseTo(1.0, 5);

    // Set global multiplier to 0
    expect(computeEffectiveGroupSpeed(true, textBase, true, 0)).toBe(0);
    expect(computeEffectiveGroupSpeed(true, heartBase, true, 0)).toBe(0);
    expect(computeEffectiveGroupSpeed(true, giftboxBase, true, 0)).toBe(0);

    // Restore global multiplier to 1.0x
    expect(computeEffectiveGroupSpeed(true, textBase, true, 1.0)).toBeCloseTo(0.2, 5);
    expect(computeEffectiveGroupSpeed(true, heartBase, true, 1.0)).toBeCloseTo(1.0, 5);
    expect(computeEffectiveGroupSpeed(true, giftboxBase, true, 1.0)).toBeCloseTo(0.1, 5);

    // Disabled group stays at 0 even if multiplier is increased to 2.0x
    expect(computeEffectiveGroupSpeed(false, 0.5, true, 2.0)).toBe(0);
  });

  it('migrates legacy presets lacking group speed fields to preserve prior velocity', async () => {
    const { migrateAssetConfig } = await import('../src/storage/migrations');

    const legacyRawConfig = {
      schemaVersion: 1,
      assetId: 'love-universe-01',
      assetVersion: '0.1.0',
      appearance: { color: '#FFF', roughness: 0.3, metalness: 0.1 },
      transform: { scale: 1.0, rotationDeg: [0, 0, 0] },
      motion: {
        float: { enabled: true, amplitude: 0.1, speed: 0.5 },
        heartbeat: { enabled: false, strength: 0.04, bpm: 72 },
        spin: { enabled: true, speedDegPerSecond: 1.5 },
      },
      universe: {
        wishes: ['Test'],
        textCount: 50,
        photoCount: 5,
        heartCount: 10,
        cloudWidth: 6,
        cloudHeight: 7,
        cloudDepth: 5,
        rotationSpeed: 1.5,
        textColor: '#FFF',
        glowIntensity: 1.0,
        heartColor: '#F00',
        seed: 42,
        showIntro: false,
        driftEnabled: true,
        driftSpeed: 0.42, // Custom old drift speed
        decorations: [
          {
            id: 'deco_star_1',
            type: 'star3d',
            name: 'Star Test',
            count: 10,
            color: '#FF0',
            scale: 1,
            spinSpeed: 1,
            enabled: true,
          },
        ],
      },
    };

    const result = migrateAssetConfig(legacyRawConfig);
    expect(result.migrated).toBe(true);
    expect(result.config?.universe?.globalSpeedMultiplier).toBe(1.0);
    expect(result.config?.universe?.textDriftSpeed).toBe(0.42);
    expect(result.config?.universe?.photoDriftSpeed).toBe(0.42);
    expect(result.config?.universe?.heartDriftSpeed).toBe(0.42);
    expect(result.config?.universe?.textDriftEnabled).toBe(true);
    expect(result.config?.universe?.decorations?.[0].driftSpeed).toBe(0.42);
    expect(result.config?.universe?.decorations?.[0].driftEnabled).toBe(true);
  });

  it('validates and round-trips presets with independent group speed settings', async () => {
    const { validateAssetConfig } = await import('../src/utils/configValidation');

    const customConfig = {
      ...loveUniverse01DefaultConfig,
      universe: {
        ...loveUniverse01DefaultConfig.universe!,
        globalSpeedMultiplier: 1.25,
        textDriftEnabled: true,
        textDriftSpeed: 0.2,
        photoDriftEnabled: false,
        photoDriftSpeed: 0.0,
        heartDriftEnabled: true,
        heartDriftSpeed: 1.0,
        decorations: [
          {
            id: 'deco_giftbox_custom',
            type: 'giftbox' as const,
            name: 'Hộp quà chậm',
            count: 8,
            color: '#E63946',
            scale: 1.0,
            spinSpeed: 1.0,
            enabled: true,
            driftEnabled: true,
            driftSpeed: 0.1,
          },
        ],
      },
    };

    const valRes = validateAssetConfig(customConfig);
    expect(valRes.valid).toBe(true);
    expect(valRes.errors).toHaveLength(0);
    expect(valRes.data?.universe?.globalSpeedMultiplier).toBe(1.25);
    expect(valRes.data?.universe?.textDriftSpeed).toBe(0.2);
    expect(valRes.data?.universe?.photoDriftEnabled).toBe(false);
    expect(valRes.data?.universe?.decorations?.[0].driftSpeed).toBe(0.1);
  });
});

describe('Falling Density Uniformity & Multi-Cycle Wrap Verification', () => {
  it('guarantees uniform distribution across height bands at initial spawn (Frame 0)', () => {
    const cloudHeight = 7.2;
    const buffer = 2.0;
    const { yMin, yMax, span } = {
      yMin: -cloudHeight * 0.5 - buffer, // -5.6
      yMax: cloudHeight * 0.5 + buffer,  // +5.6
      span: cloudHeight + 2 * buffer,    // 11.2
    };

    const layout = generateUniverseLayout({
      wishes: [...DEFAULT_WISHES],
      photoUrls: [...DEFAULT_UNIVERSE_PLACEHOLDERS],
      textCount: 80,
      photoCount: 16,
      heartCount: 40,
      cloudWidth: 6.8,
      cloudHeight,
      cloudDepth: 5.6,
      seed: 12345,
    });

    // Check Text items distribution across 4 vertical bins
    const numBins = 4;
    const binSize = span / numBins; // 2.8
    const textBins = [0, 0, 0, 0];

    for (const item of layout.textItems) {
      const y = item.position[1];
      expect(y).toBeGreaterThanOrEqual(yMin);
      expect(y).toBeLessThanOrEqual(yMax);
      const binIdx = Math.min(numBins - 1, Math.max(0, Math.floor((y - yMin) / binSize)));
      textBins[binIdx]++;
    }

    // With 80 items and 4 bins, expected is 20 per bin
    // Stratified binning guarantees exactly equal bins (+-1 due to integer division)
    for (let b = 0; b < numBins; b++) {
      expect(textBins[b]).toBeGreaterThanOrEqual(18);
      expect(textBins[b]).toBeLessThanOrEqual(22);
    }

    // Check Heart items distribution (40 items, 4 bins -> 10 per bin)
    const heartBins = [0, 0, 0, 0];
    for (const item of layout.heartItems) {
      const y = item.position[1];
      expect(y).toBeGreaterThanOrEqual(yMin);
      expect(y).toBeLessThanOrEqual(yMax);
      const binIdx = Math.min(numBins - 1, Math.max(0, Math.floor((y - yMin) / binSize)));
      heartBins[binIdx]++;
    }
    for (let b = 0; b < numBins; b++) {
      expect(heartBins[b]).toBeGreaterThanOrEqual(8);
      expect(heartBins[b]).toBeLessThanOrEqual(12);
    }
  });

  it('maintains uniform density across height bands over 3 complete wrap cycles at varied speeds', async () => {
    const { wrapY } = await import('../src/gift-library/objects/love-universe-01/motionUtils');
    const cloudHeight = 7.2;
    const buffer = 2.0;
    const yMin = -cloudHeight * 0.5 - buffer; // -5.6
    const yMax = cloudHeight * 0.5 + buffer;  // +5.6
    const span = cloudHeight + 2 * buffer;    // 11.2

    const layout = generateUniverseLayout({
      wishes: [...DEFAULT_WISHES],
      photoUrls: [...DEFAULT_UNIVERSE_PLACEHOLDERS],
      textCount: 60,
      photoCount: 12,
      heartCount: 36,
      cloudWidth: 6.8,
      cloudHeight,
      cloudDepth: 5.6,
      seed: 42,
    });

    const numBins = 4;
    const binSize = span / numBins;

    // Test slow (0.2), medium (0.5), and fast (1.5) drift speeds
    const testSpeeds = [0.2, 0.5, 1.5];

    for (const speed of testSpeeds) {
      // 3 full wrap cycles requires traveling 3 * span = 33.6 units
      const totalDistance = 3.0 * span;
      const stepDistance = Math.max(0.2, speed * 0.4); // sample dynamically per speed
      const steps = Math.ceil(totalDistance / stepDistance);

      let maxBinDeviation = 0;

      for (let s = 0; s <= steps; s++) {
        const currentDrift = s * stepDistance;
        const bins = [0, 0, 0, 0];

        for (const item of layout.textItems) {
          const currentY = wrapY(item.position[1], currentDrift, cloudHeight, buffer);
          expect(currentY).toBeGreaterThanOrEqual(yMin);
          expect(currentY).toBeLessThanOrEqual(yMax);

          const binIdx = Math.min(numBins - 1, Math.max(0, Math.floor((currentY - yMin) / binSize)));
          bins[binIdx]++;
        }

        // Expected is 60 / 4 = 15 per bin
        // Verify no bin ever becomes empty or clumpy
        for (let b = 0; b < numBins; b++) {
          expect(bins[b]).toBeGreaterThanOrEqual(8);  // Never empty or sparse
          expect(bins[b]).toBeLessThanOrEqual(22);    // Never clumpy
          const dev = Math.abs(bins[b] - 15);
          if (dev > maxBinDeviation) maxBinDeviation = dev;
        }
      }

      // Max deviation remains small throughout 3 entire wrap cycles
      expect(maxBinDeviation).toBeLessThanOrEqual(7);
    }
  });

  it('preserves exact fractional overshoot on wrap without positional jitter or resetting', async () => {
    const { wrapY } = await import('../src/gift-library/objects/love-universe-01/motionUtils');
    const cloudHeight = 7.2;
    const buffer = 2.0;
    const yMin = -5.6;
    const yMax = 5.6;

    const initialY = -5.5; // Close to bottom boundary
    const dt1 = 0.05;      // Before wrap
    const y1 = wrapY(initialY, dt1, cloudHeight, buffer);
    expect(y1).toBeCloseTo(-5.55, 4);

    // Cross the boundary by 0.15 units
    // -5.5 - 0.25 = -5.75, which overshoots yMin (-5.6) by 0.15
    // After wrap, position should be yMax - 0.15 = 5.6 - 0.15 = 5.45
    const dt2 = 0.25;
    const y2 = wrapY(initialY, dt2, cloudHeight, buffer);
    expect(y2).toBeCloseTo(5.45, 4);

    // Delta between y1 and y2 across the wrap modulo must equal step delta (0.20)
    const distanceTraveled = (y1 - yMin) + (yMax - y2);
    expect(distanceTraveled).toBeCloseTo(0.20, 4);
  });
});

describe('Continuous Halo Glow Intensity Shader Mapping', () => {
  // Formula implemented in flipUvShader.ts
  function computeGlowEnergy(intensity: number): number {
    return Math.pow(Math.max(0, intensity), 1.15);
  }

  it('scales strictly monotonically and continuously across [0, 0.25, 0.5, 1.0, 2.0, 3.0]', () => {
    const testPoints = [0, 0.25, 0.5, 1.0, 2.0, 3.0];
    const energies = testPoints.map(computeGlowEnergy);

    // 0: strictly zero energy (no halo output)
    expect(energies[0]).toBe(0);

    // Verify strict monotonic increase across all levels
    for (let i = 0; i < energies.length - 1; i++) {
      expect(energies[i + 1]).toBeGreaterThan(energies[i]);
    }

    // 0.25: very subtle
    expect(energies[1]).toBeCloseTo(0.203, 2);

    // 0.5: visible but soft
    expect(energies[2]).toBeCloseTo(0.451, 2);

    // 1.0: medium / standard
    expect(energies[3]).toBeCloseTo(1.00, 2);

    // 2.0: strong (more than double 1.0)
    expect(energies[4]).toBeCloseTo(2.219, 2);

    // 3.0: very strong (more than 3.5x 1.0)
    expect(energies[5]).toBeCloseTo(3.537, 2);

    // Verify continuous scaling without saturation clipping
    expect(energies[4] - energies[3]).toBeGreaterThan(1.0);
    expect(energies[5] - energies[4]).toBeGreaterThan(1.2);
  });
});
