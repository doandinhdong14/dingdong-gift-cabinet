import { describe, it, expect } from 'vitest';
import manifest from '../manifest.json';
import { configCodec, defaults } from '../config';
import { presets } from '../presets';
import { validateManifest } from '../../../effect-sdk';

describe('Effect Package Unit Tests', () => {
  it('validates manifest schema strictly', () => {
    const result = validateManifest(manifest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(manifest.id);
      expect(result.data.manifestVersion).toBe(1);
    }
  });

  it('validates defaults with configCodec', () => {
    const parsed = configCodec.parse(defaults);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.speed).toBeGreaterThan(0);
    }
  });

  it('validates all presets with configCodec', () => {
    for (const preset of presets) {
      const parsed = configCodec.parse(preset.config);
      expect(parsed.success).toBe(true);
      expect(preset.name).toBeTruthy();
    }
  });
});
