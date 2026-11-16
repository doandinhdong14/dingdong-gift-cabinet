import { describe, it, expect } from 'vitest';
import {
  validateAssetConfig,
  validatePreset,
  parseAndValidateImport,
  CURRENT_SCHEMA_VERSION,
} from '../src/utils/configValidation';
import { devBoxDefaultConfig } from '../src/gift-library/objects/dev-fixture/presets';

describe('Config Validation & Sanitization', () => {
  it('should accept valid default config', () => {
    const res = validateAssetConfig(devBoxDefaultConfig);
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
    expect(res.data).toBeDefined();
    expect(res.data?.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
  });

  it('should reject non-object payloads', () => {
    expect(validateAssetConfig(null).valid).toBe(false);
    expect(validateAssetConfig('string').valid).toBe(false);
    expect(validateAssetConfig([1, 2, 3]).valid).toBe(false);
  });

  it('should reject newer schemaVersion with clear error', () => {
    const res = validateAssetConfig({
      ...devBoxDefaultConfig,
      schemaVersion: CURRENT_SCHEMA_VERSION + 1,
    });
    expect(res.valid).toBe(false);
    expect(res.errors[0]).toContain('mới hơn phiên bản ứng dụng hỗ trợ');
  });

  it('should reject invalid hex colors', () => {
    const invalidColors = ['red', 'rgb(255,0,0)', '#12', '#ZZZZZZ', '#1234567'];
    for (const color of invalidColors) {
      const res = validateAssetConfig({
        ...devBoxDefaultConfig,
        appearance: { ...devBoxDefaultConfig.appearance, color },
      });
      expect(res.valid).toBe(false);
      expect(res.errors.some((e) => e.includes('HEX'))).toBe(true);
    }
  });

  it('should accept valid 3-digit and 6-digit hex colors', () => {
    const validColors = ['#FFF', '#fff', '#F46C91', '#10B981', '#000000'];
    for (const color of validColors) {
      const res = validateAssetConfig({
        ...devBoxDefaultConfig,
        appearance: { ...devBoxDefaultConfig.appearance, color },
      });
      expect(res.valid).toBe(true);
    }
  });

  it('should reject non-finite numbers and out-of-bounds parameters', () => {
    // Roughness out of [0, 1]
    expect(
      validateAssetConfig({
        ...devBoxDefaultConfig,
        appearance: { ...devBoxDefaultConfig.appearance, roughness: 1.5 },
      }).valid
    ).toBe(false);

    // NaN metalness
    expect(
      validateAssetConfig({
        ...devBoxDefaultConfig,
        appearance: { ...devBoxDefaultConfig.appearance, metalness: NaN },
      }).valid
    ).toBe(false);

    // Negative scale
    expect(
      validateAssetConfig({
        ...devBoxDefaultConfig,
        transform: { ...devBoxDefaultConfig.transform, scale: -1 },
      }).valid
    ).toBe(false);

    // Rotation angle out of bounds
    expect(
      validateAssetConfig({
        ...devBoxDefaultConfig,
        transform: { ...devBoxDefaultConfig.transform, rotationDeg: [500, 0, 0] },
      }).valid
    ).toBe(false);
  });

  it('should reject unsupported root keys to avoid injection/pollution', () => {
    const res = validateAssetConfig({
      ...devBoxDefaultConfig,
      maliciousField: 'exploit',
    });
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes('maliciousField'))).toBe(true);
  });

  it('should validate Preset names (1 to 60 chars)', () => {
    const validPreset = {
      id: 'p1',
      name: 'Màu đẹp',
      assetId: 'dev-box-fixture',
      assetVersion: '0.1.0',
      config: devBoxDefaultConfig,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(validatePreset(validPreset).valid).toBe(true);

    // Empty name
    expect(validatePreset({ ...validPreset, name: '   ' }).valid).toBe(false);

    // Too long name (>60 chars)
    expect(validatePreset({ ...validPreset, name: 'A'.repeat(61) }).valid).toBe(false);
  });

  it('should reject import payloads exceeding 100 KB limit', () => {
    const largePayload = JSON.stringify({
      ...devBoxDefaultConfig,
      dummy: 'x'.repeat(105 * 1024),
    });
    const res = parseAndValidateImport(largePayload);
    expect(res.valid).toBe(false);
    expect(res.errors[0]).toContain('100 KB');
  });

  it('should warn when importing config from a different assetId', () => {
    const configFromAnotherAsset = {
      ...devBoxDefaultConfig,
      assetId: 'different-asset-99',
    };
    const res = parseAndValidateImport(
      JSON.stringify(configFromAnotherAsset),
      'dev-box-fixture'
    );
    expect(res.valid).toBe(true);
    expect(res.warnings.length).toBeGreaterThan(0);
    expect(res.warnings[0]).toContain('different-asset-99');
  });
});
