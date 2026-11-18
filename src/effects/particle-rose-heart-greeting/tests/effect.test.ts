import { describe, it, expect } from 'vitest';
import manifest from '../manifest.json';
import { configCodec, defaults } from '../config';
import { presets } from '../presets';
import { validateManifest } from '../../../effect-sdk';

describe('ParticleRoseHeartGreeting Package Unit Tests', () => {
  it('validates manifest schema strictly', () => {
    const result = validateManifest(manifest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('particle-rose-heart-greeting');
      expect(result.data.renderer).toBe('dom');
      expect(result.data.manifestVersion).toBe(1);
      expect(result.data.capabilities.interactive).toBe(true);
      expect(result.data.capabilities.completionEvent).toBe(true);
    }
  });

  it('validates defaults with configCodec', () => {
    const parsed = configCodec.parse(defaults);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.particleSpeed).toBeGreaterThan(0);
      expect(parsed.data.particleCount).toBeGreaterThanOrEqual(5000);
      expect(parsed.data.greetingText).toBe('Chúc\nMừng');
      expect(parsed.data.occasionText).toBe("women's\nday");
      expect(parsed.data.roseCount).toBe(defaults.roseCount);
      expect(parsed.data.bearCount).toBe(defaults.bearCount);
    }
  });

  it('validates all presets with configCodec', () => {
    expect(presets.length).toBeGreaterThanOrEqual(4);
    for (const preset of presets) {
      const parsed = configCodec.parse(preset.config);
      expect(parsed.success).toBe(true);
      expect(preset.name).toBeTruthy();
      expect(preset.id).toBeTruthy();
      if (parsed.success) {
        expect(parsed.data.particleCount).toBeGreaterThan(0);
        expect(parsed.data.roseCount).toBeGreaterThan(0);
      }
    }
  });

  it('handles corrupted and empty raw input safely with fallbacks', () => {
    const emptyParsed = configCodec.parse({});
    expect(emptyParsed.success).toBe(true);
    if (emptyParsed.success) {
      expect(emptyParsed.data.greetingText).toBe('Chúc\nMừng');
      expect(emptyParsed.data.occasionText).toBe("women's\nday");
      expect(emptyParsed.data.particleCount).toBe(defaults.particleCount);
    }

    const invalidParsed = configCodec.parse({
      particleCount: 'invalid',
      playbackSpeed: -99,
      triggerMode: 'unknown-mode',
    });
    expect(invalidParsed.success).toBe(true);
    if (invalidParsed.success) {
      expect(invalidParsed.data.triggerMode).toBe('hold');
      expect(invalidParsed.data.playbackSpeed).toBeGreaterThanOrEqual(0.2);
    }
  });

  it('clamps numerical values strictly within defined bounds', () => {
    const clamped = configCodec.parse({
      particleCount: 999999,
      roseCount: 999,
      particleGlow: 5.0,
      heartScale: 0.1,
    });
    expect(clamped.success).toBe(true);
    if (clamped.success) {
      expect(clamped.data.particleCount).toBeLessThanOrEqual(30000);
      expect(clamped.data.roseCount).toBeLessThanOrEqual(120);
      expect(clamped.data.particleGlow).toBeLessThanOrEqual(1.0);
      expect(clamped.data.heartScale).toBeGreaterThanOrEqual(0.5);
    }
  });

  it('contains valid rose and bear assets arrays', () => {
    expect(defaults.roseAssets.length).toBeGreaterThanOrEqual(5);
    expect(defaults.bearAssets.length).toBe(2);
    for (const r of defaults.roseAssets) {
      expect(typeof r).toBe('string');
      expect(r.length).toBeGreaterThan(0);
    }
    for (const b of defaults.bearAssets) {
      expect(typeof b).toBe('string');
      expect(b.length).toBeGreaterThan(0);
    }
  });
});
