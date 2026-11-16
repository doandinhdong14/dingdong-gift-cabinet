import { describe, it, expect } from 'vitest';
import {
  PRODUCT_REGISTRY,
  getProductAssets,
  getAssetById,
  getCategoryCounts,
  DEV_FIXTURE_ENTRY,
} from '../src/gift-library/registry';

describe('Gift Library Registry Contract (Stage B: Heart-01)', () => {
  it('should register exactly one product asset (heart-01) in Stage B', () => {
    expect(PRODUCT_REGISTRY).toHaveLength(1);
    const productAssets = getProductAssets();
    expect(productAssets).toHaveLength(1);
    expect(productAssets[0].manifest.id).toBe('heart-01');
    expect(productAssets[0].manifest.name).toBe('Trái tim mẫu 1');
    expect(productAssets[0].manifest.status).toBe('review');
    expect(productAssets[0].manifest.version).toBe('0.1.0');
    expect(productAssets[0].manifest.category).toBe('Trái tim');
    expect(productAssets[0].manifest.kind).toBe('3d');
    expect(productAssets[0].manifest.source).toBe('procedural');
  });

  it('should provide heart-01 with 3 default presets per spec', () => {
    const heart = getAssetById('heart-01');
    expect(heart).toBeDefined();
    expect(heart?.defaultPresets).toHaveLength(3);
    expect(heart?.defaultPresets.map((p) => p.name)).toEqual([
      'Hồng dịu (Mặc định)',
      'Đỏ yêu thương',
      'Tím mộng mơ',
    ]);
  });

  it('should provide the Dev Fixture with unique ID and valid manifest', () => {
    expect(DEV_FIXTURE_ENTRY.manifest.id).toBe('dev-box-fixture');
    expect(DEV_FIXTURE_ENTRY.manifest.schemaVersion).toBe(1);
    expect(DEV_FIXTURE_ENTRY.manifest.kind).toBe('3d');
    expect(DEV_FIXTURE_ENTRY.manifest.dependencies).toContain('@react-three/fiber');
    expect(DEV_FIXTURE_ENTRY.manifest.supportedMotions).toEqual(
      expect.arrayContaining(['float', 'heartbeat', 'spin'])
    );
  });

  it('should retrieve both heart-01 and dev fixture by ID', () => {
    expect(getAssetById('heart-01')).toBeDefined();
    expect(getAssetById('dev-box-fixture')).toBeDefined();
    expect(getAssetById('non-existent-asset')).toBeUndefined();
  });

  it('should accurately compute category counts strictly from real registry', () => {
    const countsWithoutFav = getCategoryCounts([]);
    expect(countsWithoutFav['Tất cả']).toBe(1);
    expect(countsWithoutFav['Trái tim']).toBe(1);
    expect(countsWithoutFav['Phong bì']).toBe(0);
    expect(countsWithoutFav['Hộp quà']).toBe(0);
    expect(countsWithoutFav['Máy bay']).toBe(0);
    expect(countsWithoutFav['Trang trí']).toBe(0);
    expect(countsWithoutFav['Yêu thích']).toBe(0);

    const countsWithFav = getCategoryCounts(['heart-01']);
    expect(countsWithFav['Yêu thích']).toBe(1);
  });
});
