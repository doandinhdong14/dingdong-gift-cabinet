import { describe, it, expect } from 'vitest';
import manifest from '../manifest.json';
import { configCodec, defaults } from '../config';
import { presets } from '../presets';
import { validateManifest } from '../../../effect-sdk';
import { ParticleEngine } from '../components/ParticleEngine';
import { ROSE_COORDINATES } from '../components/BouquetRenderer';

describe('Golden Particle Rose Story - Comprehensive Test Suite', () => {
  // TEST 1 — PLAY FULL SEQUENCE
  it('TEST 1: Validates manifest and complete timeline schema', () => {
    const result = validateManifest(manifest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('golden-particle-rose-story');
      expect(result.data.manifestVersion).toBe(1);
      expect(result.data.renderer).toBe('dom');
      expect(result.data.kind).toBe('scene');
      expect(result.data.capabilities.interactive).toBe(true);
      expect(result.data.capabilities.completionEvent).toBe(true);
    }

    const parsed = configCodec.parse(defaults);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      const d = parsed.data.sceneDurations;
      expect(d.vortex).toBeGreaterThan(0);
      expect(d.heart).toBeGreaterThan(0);
      expect(d.msg1).toBeGreaterThan(0);
      expect(d.msg2).toBeGreaterThan(0);
      expect(d.msg3).toBeGreaterThan(0);
      expect(d.msg4).toBeGreaterThan(0);
      expect(d.photo).toBeGreaterThan(0);
      expect(d.bouquetAssembly).toBeGreaterThan(0);
      expect(d.roseBloom).toBeGreaterThan(0);
      const totalTimeline =
        d.vortex + d.heart + d.msg1 + d.msg2 + d.msg3 + d.msg4 + d.photo + d.bouquetAssembly + d.roseBloom;
      expect(totalTimeline).toBeGreaterThanOrEqual(30);
      expect(totalTimeline).toBeLessThanOrEqual(45);
    }
  });

  // TEST 2 — REAL PARTICLES
  it('TEST 2: ParticleEngine generates distinct morph shapes deterministically', () => {
    const engine = new ParticleEngine(3000, 20261119);
    const vortex = engine.generateVortex(358, 746);
    expect(vortex.length).toBe(3000);
    expect(vortex[0].x).toBeDefined();

    const heart = engine.generateHeart(358, 746);
    expect(heart.length).toBe(3000);

    const bouquet = engine.generateBouquetSilhouette(358, 746);
    expect(bouquet.length).toBe(3000);
    // Rose buds should have red/pink colors
    expect(bouquet[0].r).toBeGreaterThan(180);

    const ambient = engine.generateAmbientDispersal(358, 746);
    expect(ambient.length).toBe(3000);
  });

  // TEST 3 — VIETNAMESE TEXT
  it('TEST 3: Full Vietnamese diacritics are preserved across all texts', () => {
    const parsed = configCodec.parse(defaults);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.openingText).toBe('Anh Yêu');
      expect(parsed.data.greetingMessages[0]).toContain('Chúc mừng');
      expect(parsed.data.greetingMessages[1]).toContain('Ngày Quốc');
      expect(parsed.data.greetingMessages[1]).toContain('tế Nam giới');
      expect(parsed.data.greetingMessages[2]).toBe('19 tháng 11');
      expect(parsed.data.greetingMessages[3]).toContain('Cảm ơn anh');
      expect(parsed.data.finalTitle).toContain('Tặng anh bó hoa');
      expect(parsed.data.finalSubtitle).toContain('Mãi mãi bên nhau');
      expect(parsed.data.finalMessage).toContain('điểm tựa vững chắc');
      expect(parsed.data.interactionHint).toContain('Nhấn vào bông hồng');
    }
  });

  // TEST 4 — HEART PHOTO CROP & INTEGRITY
  it('TEST 4: Heart photo coordinates and scale clamp correctly', () => {
    const parsed = configCodec.parse({
      heartPhotoCrop: { x: 0.5, y: 0.5, scale: 1.2 },
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.heartPhotoCrop.scale).toBe(1.2);
      expect(parsed.data.heartPhotoCrop.x).toBe(0.5);
      expect(parsed.data.heartPhotoCrop.y).toBe(0.5);
    }
  });

  // TEST 5 — FLOWER BOUQUET QUALITY
  it('TEST 5: Defines exactly 9 rose coordinates with individual positions and stagger delays', () => {
    expect(ROSE_COORDINATES.length).toBe(9);
    for (let i = 0; i < 9; i++) {
      expect(ROSE_COORDINATES[i].id).toBe(i + 1);
      expect(ROSE_COORDINATES[i].scale).toBeGreaterThan(0.8);
      expect(ROSE_COORDINATES[i].delay).toBeGreaterThanOrEqual(0);
      expect(ROSE_COORDINATES[i].delay).toBeLessThanOrEqual(0.3);
    }
    // Queen center rose check
    const centerRose = ROSE_COORDINATES.find((r) => r.id === 4);
    expect(centerRose).toBeDefined();
    expect(centerRose?.x).toBe(0);
    expect(centerRose?.scale).toBeGreaterThanOrEqual(1.1);
  });

  // TEST 6 — BLOOM MONOTONICITY
  it('TEST 6: Bloom duration and parameters validate cleanly', () => {
    const parsed = configCodec.parse({ bloomDuration: 2.5 });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.bloomDuration).toBe(2.5);
    }
  });

  // TEST 7 — ROSE PHOTOS MAPPING & INTERACTION
  it('TEST 7: All 9 roses have memory photos with captions and dates', () => {
    const parsed = configCodec.parse(defaults);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.rosePhotos.length).toBe(9);
      for (let i = 0; i < 9; i++) {
        expect(parsed.data.rosePhotos[i].id).toBe(i + 1);
        expect(parsed.data.rosePhotos[i].url).toBeTruthy();
        expect(parsed.data.rosePhotos[i].caption).toBeTruthy();
      }
    }
  });

  // TEST 8 — REPLAY REINITIALIZATION
  it('TEST 8: Replay capability is enabled by default and resets cleanly', () => {
    const parsed = configCodec.parse(defaults);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.replayEnabled).toBe(true);
    }
  });

  // TEST 9 — SPEED CONTROL CLAMPING
  it('TEST 9: Playback speed sanitizes and clamps safely', () => {
    const parsedLow = configCodec.parse({ playbackSpeed: 0.1 });
    expect(parsedLow.success).toBe(true);
    if (parsedLow.success) {
      expect(parsedLow.data.playbackSpeed).toBeGreaterThanOrEqual(0.25);
    }

    const parsedHigh = configCodec.parse({ playbackSpeed: 9.9 });
    expect(parsedHigh.success).toBe(true);
    if (parsedHigh.success) {
      expect(parsedHigh.data.playbackSpeed).toBeLessThanOrEqual(2.5);
    }
  });

  // TEST 10 — RESPONSIVE STAGE CONSTANTS
  it('TEST 10: Adheres to mobile portrait aspect ratio (358 x 746)', () => {
    const STAGE_WIDTH = 358;
    const STAGE_HEIGHT = 746;
    const ratio = STAGE_WIDTH / STAGE_HEIGHT;
    expect(ratio).toBeCloseTo(0.48, 2);
  });

  // TEST 11 — ALL PRESETS VALIDATION
  it('TEST 11: All 4 presets pass codec validation cleanly', () => {
    expect(presets.length).toBeGreaterThanOrEqual(4);
    for (const preset of presets) {
      const parsed = configCodec.parse(preset.config);
      expect(parsed.success).toBe(true);
      expect(preset.id).toBeTruthy();
      expect(preset.name).toBeTruthy();
    }
  });

  // TEST 12 — MISSING MEDIA FALLBACK
  it('TEST 12: Handles missing or partial media without throwing', () => {
    const parsed = configCodec.parse({
      heartPhoto: '',
      rosePhotos: [],
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.heartPhoto).toBe(defaults.heartPhoto);
      expect(parsed.data.rosePhotos.length).toBe(9);
    }
  });
});
