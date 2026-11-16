import { describe, it, expect } from 'vitest';
import {
  PRODUCT_REGISTRY,
  getProductAssets,
  getAssetById,
  getCategoryCounts,
  DEV_FIXTURE_ENTRY,
} from '../src/gift-library/registry';

describe('Gift Library Registry Contract', () => {
  it('should have strictly empty PRODUCT_REGISTRY in Stage A (per spec)', () => {
    // In Stage A, no heart-01 and no fake assets
    expect(PRODUCT_REGISTRY).toHaveLength(0);
    expect(getProductAssets()).toHaveLength(0);
  });

  it('should provide the Dev Fixture with unique ID and valid manifest', () => {
    expect(DEV_FIXTURE_ENTRY.manifest.id).toBe('dev-box-fixture');
    expect(DEV_FIXTURE_ENTRY.manifest.schemaVersion).toBe(1);
    expect(DEV_FIXTURE_ENTRY.manifest.kind).toBe('3d');
    expect(DEV_FIXTURE_ENTRY.manifest.status).toBe('draft');
    expect(DEV_FIXTURE_ENTRY.manifest.dependencies).toContain('@react-three/fiber');
    expect(DEV_FIXTURE_ENTRY.manifest.supportedMotions).toEqual(
      expect.arrayContaining(['float', 'heartbeat', 'spin'])
    );
  });

  it('should retrieve Dev Fixture by ID through getAssetById', () => {
    const entry = getAssetById('dev-box-fixture');
    expect(entry).toBeDefined();
    expect(entry?.manifest.id).toBe('dev-box-fixture');
  });

  it('should return undefined for non-existent asset ID', () => {
    expect(getAssetById('non-existent-asset')).toBeUndefined();
  });

  it('should accurately compute category counts without fake numbers', () => {
    const counts = getCategoryCounts(['favorite-1', 'favorite-2']);
    // In Stage A with empty product registry:
    expect(counts['Tất cả']).toBe(0);
    expect(counts['Trái tim']).toBe(0);
    expect(counts['Phong bì']).toBe(0);
    expect(counts['Hộp quà']).toBe(0);
    expect(counts['Máy bay']).toBe(0);
    expect(counts['Trang trí']).toBe(0);
    expect(counts['Yêu thích']).toBe(0); // since none of the favorites match product assets
  });
});
