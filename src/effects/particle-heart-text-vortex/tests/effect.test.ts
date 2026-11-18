import { describe, it, expect } from 'vitest';
import { configCodec, defaults } from '../config';
import { presets } from '../presets';
import manifest from '../manifest.json';

describe('particle-heart-text-vortex Effect Package', () => {
  it('validates manifest integrity', () => {
    expect(manifest.id).toBe('particle-heart-text-vortex');
    expect(manifest.kind).toBe('scene');
    expect(manifest.renderer).toBe('r3f');
    expect(manifest.manifestVersion).toBe(1);
    expect(manifest.configVersion).toBe(1);
    expect(manifest.sdkApiVersion).toBe(1);
    expect(manifest.status).toBe('review');
  });

  it('parses valid default config correctly', () => {
    const result = configCodec.parse(defaults);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.heartScale).toBe(1.0);
      expect(result.data.heartParticleCount).toBe(11000);
      expect(result.data.diskRingCount).toBe(10);
      expect(result.data.diskRadius).toBe(1.55);
      expect(result.data.streamEnabled).toBe(true);
      expect(result.data.backgroundColor).toBe('#05030a');
    }
  });

  it('clamps invalid or out-of-range config parameters', () => {
    const malformed = {
      heartScale: 999, // Should clamp to max 2.5
      heartParticleCount: -50, // Should clamp to min 500
      diskRadius: 0.1, // Should clamp to min 1.0
      diskRingCount: 50, // Should clamp to max 16
      heartPrimaryColor: 'not-a-color', // Should fallback to default
      streamSpeed: -10, // Should clamp to min 0.0
    };

    const result = configCodec.parse(malformed);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.heartScale).toBe(2.5);
      expect(result.data.heartParticleCount).toBe(500);
      expect(result.data.diskRadius).toBe(1.0);
      expect(result.data.diskRingCount).toBe(16);
      expect(result.data.heartPrimaryColor).toBe(defaults.heartPrimaryColor);
      expect(result.data.streamSpeed).toBe(0.0);
    }
  });

  it('verifies all registered presets pass configCodec validation', () => {
    expect(presets.length).toBeGreaterThanOrEqual(4);

    presets.forEach((preset) => {
      const parsed = configCodec.parse(preset.config);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.heartParticleCount).toBeGreaterThanOrEqual(500);
        expect(parsed.data.diskRingCount).toBeGreaterThanOrEqual(4);
      }
    });
  });
});
