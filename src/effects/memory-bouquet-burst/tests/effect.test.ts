import { describe, it, expect } from 'vitest';
import manifest from '../manifest.json';
import { configCodec, defaults } from '../config';
import { presets } from '../presets';
import { presentation } from '../presentation';
import { validateManifest } from '../../../effect-sdk';

describe('Memory Bouquet Burst Package Tests', () => {
  it('validates manifest schema strictly', () => {
    const result = validateManifest(manifest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('memory-bouquet-burst');
      expect(result.data.manifestVersion).toBe(1);
      expect(result.data.kind).toBe('transition');
      expect(result.data.renderer).toBe('r3f');
      expect(result.data.capabilities.interactive).toBe(true);
      expect(result.data.capabilities.completionEvent).toBe(true);
    }
  });

  it('validates defaults with configCodec', () => {
    const parsed = configCodec.parse(defaults);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.photos.length).toBe(6);
      expect(parsed.data.holdDuration).toBe(1.8);
      expect(parsed.data.burstSpeed).toBe(1.0);
      expect(parsed.data.burstSpread).toBe(1.0);
      expect(parsed.data.enableStars).toBe(true);
    }
  });

  it('validates all presets with configCodec', () => {
    for (const preset of presets) {
      const parsed = configCodec.parse(preset.config);
      expect(parsed.success).toBe(true);
      expect(preset.name).toBeTruthy();
    }
  });

  it('sanitizes out-of-bounds config parameters gracefully', () => {
    const rawBadConfig = {
      holdDuration: 999, // Should clamp to 4.0
      burstSpeed: -5,    // Should clamp to 0.5
      burstSpread: 0.1,  // Should clamp to 0.4
      ringColor: 'invalid-color', // Should fallback to default
      starDensity: 500,  // Should clamp to 300
    };
    const parsed = configCodec.parse(rawBadConfig);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.holdDuration).toBe(4.0);
      expect(parsed.data.burstSpeed).toBe(0.5);
      expect(parsed.data.burstSpread).toBe(0.4);
      expect(parsed.data.ringColor).toBe(defaults.ringColor);
      expect(parsed.data.starDensity).toBe(300);
    }
  });

  it('validates presentation camera and background', () => {
    expect(presentation.camera?.fov).toBe(45);
    expect(presentation.background?.color).toBe('#020204');
  });
});
