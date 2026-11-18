import { describe, it, expect } from 'vitest';
import manifest from '../manifest.json';
import { configCodec, defaults } from '../config';
import { presets } from '../presets';
import { controls } from '../controls';
import { validateManifest } from '../../../effect-sdk';
import { DEFAULT_CHARACTERS } from '../components/defaultCharacters';

describe('Pastel Memory Garden Package Tests', () => {
  it('validates manifest schema strictly', () => {
    const result = validateManifest(manifest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('pastel-memory-garden');
      expect(result.data.kind).toBe('scene');
      expect(result.data.renderer).toBe('dom');
      expect(result.data.status).toBe('approved');
    }
  });

  it('validates defaults with configCodec', () => {
    const parsed = configCodec.parse(defaults);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.scrollSpeed).toBe(defaults.scrollSpeed);
      expect(parsed.data.parallaxStrength).toBe(defaults.parallaxStrength);
      expect(parsed.data.butterflyCount).toBe(4);
      expect(parsed.data.autoPlay).toBe(true);
      expect(parsed.data.showNames).toBe(true);
      expect(parsed.data.showForegroundFlowers).toBe(true);
    }
  });

  it('validates all presets with configCodec', () => {
    expect(presets.length).toBeGreaterThanOrEqual(3);
    for (const preset of presets) {
      const parsed = configCodec.parse(preset.config);
      expect(parsed.success).toBe(true);
      expect(preset.name).toBeTruthy();
      expect(preset.id).toBeTruthy();
    }
  });

  it('ensures controls match config keys', () => {
    const keys = Object.keys(defaults);
    for (const key of keys) {
      expect(controls[key as keyof typeof controls]).toBeDefined();
    }
  });

  it('contains character portraits with valid positions and scales', () => {
    expect(DEFAULT_CHARACTERS.length).toBeGreaterThanOrEqual(8);
    for (const item of DEFAULT_CHARACTERS) {
      expect(item.id).toBeTruthy();
      expect(item.imageUrl).toBeTruthy();
      expect(item.worldX).toBeGreaterThanOrEqual(0);
      expect(item.baselineY).toBeGreaterThan(0);
      expect(item.scale).toBeGreaterThan(0.5);
    }
  });
});
