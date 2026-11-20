import { describe, it, expect } from 'vitest';
import manifest from '../manifest.json';
import { configCodec, defaults } from '../config';
import { presets } from '../presets';
import { validateManifest } from '../../../effect-sdk';

describe('WordLoveCode Package Unit Tests (Card 10)', () => {
  it('validates manifest schema strictly', () => {
    const result = validateManifest(manifest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('word-love-code');
      expect(result.data.name).toBe('Card 10');
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
      expect(parsed.data.wordSequence).toBe('You|Are|My|Love');
      expect(parsed.data.countdownStart).toBe(3);
      expect(parsed.data.centerText).toBe('Wuv U❤️Bao Bao');
      expect(parsed.data.heartParticleCount).toBe(500);
      expect(parsed.data.enableMatrix).toBe(true);
    }
  });

  it('validates all presets with configCodec', () => {
    expect(presets.length).toBeGreaterThanOrEqual(3);
    for (const preset of presets) {
      const parsed = configCodec.parse(preset.config);
      expect(parsed.success).toBe(true);
      expect(preset.name).toBeTruthy();
      expect(preset.id).toBeTruthy();
      if (parsed.success) {
        expect(parsed.data.wordSequence).toBeTruthy();
        expect(parsed.data.centerText).toBeTruthy();
      }
    }
  });

  it('handles corrupted and empty raw input safely with fallbacks', () => {
    const emptyParsed = configCodec.parse({});
    expect(emptyParsed.success).toBe(true);
    if (emptyParsed.success) {
      expect(emptyParsed.data.wordSequence).toBe('You|Are|My|Love');
      expect(emptyParsed.data.centerText).toBe('Wuv U❤️Bao Bao');
      expect(emptyParsed.data.countdownStart).toBe(3);
    }

    const invalidParsed = configCodec.parse({
      wordSequence: '',
      centerText: '   ',
      countdownStart: -99,
      wordDuration: 'invalid',
    });
    expect(invalidParsed.success).toBe(true);
    if (invalidParsed.success) {
      expect(invalidParsed.data.wordSequence).toBe(defaults.wordSequence);
      expect(invalidParsed.data.centerText).toBe(defaults.centerText);
      expect(invalidParsed.data.countdownStart).toBe(0);
      expect(invalidParsed.data.wordDuration).toBe(defaults.wordDuration);
    }
  });

  it('clamps numerical values strictly within defined bounds', () => {
    const clamped = configCodec.parse({
      countdownStart: 999,
      wordDuration: 100,
      dotSize: 50,
      heartParticleCount: 99999,
      heartScale: 10,
    });
    expect(clamped.success).toBe(true);
    if (clamped.success) {
      expect(clamped.data.countdownStart).toBeLessThanOrEqual(10);
      expect(clamped.data.wordDuration).toBeLessThanOrEqual(6.0);
      expect(clamped.data.dotSize).toBeLessThanOrEqual(10);
      expect(clamped.data.heartParticleCount).toBeLessThanOrEqual(1500);
      expect(clamped.data.heartScale).toBeLessThanOrEqual(2.0);
    }
  });
});
