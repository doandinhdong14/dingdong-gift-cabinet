import { describe, it, expect } from 'vitest';
import {
  PRODUCT_REGISTRY,
  getProductAssets,
  getAssetById,
  getCategoryCounts,
  DEV_FIXTURE_ENTRY,
} from '../src/gift-library/registry';

describe('Gift Library Registry Contract', () => {
  it('should register heart-01, love-universe-01, rose-reveal-01, and card-11 in product registry', () => {
    expect(PRODUCT_REGISTRY).toHaveLength(4);
    const productAssets = getProductAssets();
    expect(productAssets).toHaveLength(4);

    // Heart-01
    const heart = productAssets.find((a) => a.manifest.id === 'heart-01');
    expect(heart).toBeDefined();
    expect(heart?.manifest.name).toBe('Card 1');
    expect(heart?.manifest.status).toBe('review');
    expect(heart?.manifest.version).toBe('0.1.0');
    expect(heart?.manifest.category).toBe('Trái tim');

    // LoveUniverse-01
    const universe = productAssets.find((a) => a.manifest.id === 'love-universe-01');
    expect(universe).toBeDefined();
    expect(universe?.manifest.name).toBe('Card 2');
    expect(universe?.manifest.status).toBe('review');
    expect(universe?.manifest.version).toBe('0.1.0');
    expect(universe?.manifest.category).toBe('Trang trí');
    expect(universe?.manifest.kind).toBe('3d');

    // RoseReveal-01
    const rose = productAssets.find((a) => a.manifest.id === 'rose-reveal-01');
    expect(rose).toBeDefined();
    expect(rose?.manifest.name).toBe('Card 3');
    expect(rose?.manifest.status).toBe('approved');
    expect(rose?.manifest.version).toBe('1.0.0');
    expect(rose?.manifest.category).toBe('Hộp quà');
    expect(rose?.manifest.kind).toBe('3d');

    // Card-11
    const card11 = productAssets.find((a) => a.manifest.id === 'card-11');
    expect(card11).toBeDefined();
    expect(card11?.manifest.name).toBe('Card 11');
    expect(card11?.manifest.status).toBe('approved');
    expect(card11?.manifest.version).toBe('1.0.0');
    expect(card11?.manifest.category).toBe('Trái tim');
    expect(card11?.manifest.kind).toBe('3d');
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

  it('should provide love-universe-01 with 3 default presets', () => {
    const universe = getAssetById('love-universe-01');
    expect(universe).toBeDefined();
    expect(universe?.defaultPresets).toHaveLength(3);
    expect(universe?.defaultPresets[0].name).toContain('Vũ trụ vàng kem & san hô');
  });

  it('should provide card-11 with 5 built-in presets', () => {
    const card11 = getAssetById('card-11');
    expect(card11).toBeDefined();
    expect(card11?.defaultPresets).toHaveLength(5);
    expect(card11?.defaultPresets[0].name).toBe('Hồng Neon Kinh Điển (Card 11)');
    expect(card11?.defaultPresets[1].name).toBe('Lời Yêu Ngọt Ngào (Tiếng Việt)');
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

  it('should retrieve heart-01, love-universe-01, rose-reveal-01, card-11, and dev fixture by ID', () => {
    expect(getAssetById('heart-01')).toBeDefined();
    expect(getAssetById('love-universe-01')).toBeDefined();
    expect(getAssetById('rose-reveal-01')).toBeDefined();
    expect(getAssetById('card-11')).toBeDefined();
    expect(getAssetById('dev-box-fixture')).toBeDefined();
    expect(getAssetById('non-existent-asset')).toBeUndefined();
  });

  it('should accurately compute category counts strictly from real registry', () => {
    const countsWithoutFav = getCategoryCounts([]);
    expect(countsWithoutFav['Tất cả']).toBe(4);
    expect(countsWithoutFav['Trái tim']).toBe(2);
    expect(countsWithoutFav['Phong bì']).toBe(0);
    expect(countsWithoutFav['Hộp quà']).toBe(1);
    expect(countsWithoutFav['Máy bay']).toBe(0);
    expect(countsWithoutFav['Trang trí']).toBe(1);
    expect(countsWithoutFav['Yêu thích']).toBe(0);

    const countsWithFav = getCategoryCounts(['love-universe-01', 'rose-reveal-01', 'card-11']);
    expect(countsWithFav['Yêu thích']).toBe(3);
  });
});
