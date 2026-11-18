import { describe, it, expect } from 'vitest';
import manifest from '../manifest.json';
import { configCodec, defaults } from '../config';
import { presets } from '../presets';
import { validateManifest } from '../../../effect-sdk';
import { buildCalendarDays } from '../calendarData';
import { computeCurlSlices } from '../curlGeometry';

describe('vintage-calendar-heart Package Tests', () => {
  it('validates manifest schema strictly', () => {
    const result = validateManifest(manifest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('vintage-calendar-heart');
      expect(result.data.renderer).toBe('dom');
      expect(result.data.kind).toBe('scene');
    }
  });

  it('validates defaults with configCodec', () => {
    const parsed = configCodec.parse(defaults);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.year).toBe(2026);
      expect(parsed.data.startDate).toBe('2026-11-15');
      expect(parsed.data.targetDate).toBe('2026-11-19');
      expect(parsed.data.curlIntensity).toBeGreaterThan(0);
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

  it('handles invalid config gracefully with defaults and clamping', () => {
    const invalidInput = {
      year: 'invalid',
      curlIntensity: 999, // Should clamp to 1.0
      animationSpeed: -5,  // Should clamp to 0.5
      startDate: 'bad-date',
    };
    const parsed = configCodec.parse(invalidInput);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.year).toBe(defaults.year);
      expect(parsed.data.curlIntensity).toBe(1.0);
      expect(parsed.data.animationSpeed).toBe(0.5);
      expect(parsed.data.startDate).toBe(defaults.startDate);
    }
  });

  it('buildCalendarDays correctly generates 15-19 Nov 2026 sequence matching video', () => {
    const days = buildCalendarDays(defaults);
    expect(days.length).toBe(5);

    // Day 15
    expect(days[0].dayNumber).toBe(15);
    expect(days[0].dayOfWeek).toBe('CHỦ NHẬT');
    expect(days[0].lunarDay).toBe(7);
    expect(days[0].noteText).toBe('Còn 4 ngày nữa');
    expect(days[0].isTarget).toBe(false);

    // Day 16
    expect(days[1].dayNumber).toBe(16);
    expect(days[1].dayOfWeek).toBe('THỨ HAI');
    expect(days[1].lunarDay).toBe(8);
    expect(days[1].noteText).toBe('Còn 3 ngày nữa');

    // Day 17
    expect(days[2].dayNumber).toBe(17);
    expect(days[2].dayOfWeek).toBe('THỨ BA');
    expect(days[2].lunarDay).toBe(9);
    expect(days[2].noteText).toBe('Còn 2 ngày nữa');

    // Day 18
    expect(days[3].dayNumber).toBe(18);
    expect(days[3].dayOfWeek).toBe('THỨ TƯ');
    expect(days[3].lunarDay).toBe(10);
    expect(days[3].noteText).toBe('Ngày mai tới...');

    // Day 19 (Target Day)
    expect(days[4].dayNumber).toBe(19);
    expect(days[4].dayOfWeek).toBe('THỨ NĂM');
    expect(days[4].lunarDay).toBe(11);
    expect(days[4].noteText).toBe('Ngày Quốc tế Nam giới');
    expect(days[4].isTarget).toBe(true);
  });

  it('computeCurlSlices produces valid cylinder slice geometry in curl phase', () => {
    const result = computeCurlSlices({
      progress: 0.35,
      pageWidth: 206,
      pageHeight: 270,
      curlIntensity: 0.65,
      paperStiffness: 0.55,
      pageIndex: 0,
    });

    expect(result.tearTilted).toBe(false);
    expect(result.slices.length).toBeGreaterThan(0);
    expect(result.shadowIntensity).toBeGreaterThan(0);
    for (const slice of result.slices) {
      expect(Number.isFinite(slice.dy)).toBe(true);
      expect(Number.isFinite(slice.dh)).toBe(true);
      expect(slice.lighting).toBeGreaterThan(0);
    }
  });

  it('computeCurlSlices produces tear detachment and upward flight in fly phase', () => {
    const result = computeCurlSlices({
      progress: 0.85,
      pageWidth: 206,
      pageHeight: 270,
      curlIntensity: 0.65,
      paperStiffness: 0.55,
      pageIndex: 0,
    });

    expect(result.tearTilted).toBe(true);
    expect(result.flyY).toBeLessThan(0); // Flying upward
    expect(result.tiltAngle).toBeLessThan(0); // Page 0 tilts left
    expect(result.flyOpacity).toBeGreaterThanOrEqual(0);
    expect(result.flyOpacity).toBeLessThanOrEqual(1);
  });
});
