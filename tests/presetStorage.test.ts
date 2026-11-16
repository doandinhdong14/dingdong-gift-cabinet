import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadUserPresets,
  saveUserPreset,
  updateUserPreset,
  deleteUserPreset,
  loadFavorites,
  toggleFavorite,
} from '../src/storage/presetStorage';
import { devBoxDefaultConfig } from '../src/gift-library/objects/dev-fixture/presets';
import { Preset } from '../src/gift-library/types';

describe('Preset Storage & LocalStorage Resilience', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  const testAssetId = 'test-asset-fixture';

  const mockPreset: Preset = {
    id: 'user-preset-1',
    name: 'Biến thể thử nghiệm 1',
    assetId: testAssetId,
    assetVersion: '0.1.0',
    config: devBoxDefaultConfig,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('should save and load user presets roundtrip', () => {
    const saveRes = saveUserPreset(testAssetId, mockPreset);
    expect(saveRes.success).toBe(true);

    const { presets, warning } = loadUserPresets(testAssetId);
    expect(warning).toBeUndefined();
    expect(presets).toHaveLength(1);
    expect(presets[0].id).toBe('user-preset-1');
    expect(presets[0].name).toBe('Biến thể thử nghiệm 1');
  });

  it('should rename existing user preset', () => {
    saveUserPreset(testAssetId, mockPreset);

    const updateRes = updateUserPreset(testAssetId, 'user-preset-1', {
      name: 'Tên mới sau khi đổi',
    });
    expect(updateRes.success).toBe(true);

    const { presets } = loadUserPresets(testAssetId);
    expect(presets[0].name).toBe('Tên mới sau khi đổi');
  });

  it('should delete existing user preset', () => {
    saveUserPreset(testAssetId, mockPreset);
    expect(loadUserPresets(testAssetId).presets).toHaveLength(1);

    const deleteRes = deleteUserPreset(testAssetId, 'user-preset-1');
    expect(deleteRes.success).toBe(true);
    expect(loadUserPresets(testAssetId).presets).toHaveLength(0);
  });

  it('should prevent deleting built-in system presets', () => {
    const builtInPreset: Preset = {
      ...mockPreset,
      id: 'builtin-1',
      isBuiltIn: true,
    };
    saveUserPreset(testAssetId, builtInPreset);

    const deleteRes = deleteUserPreset(testAssetId, 'builtin-1');
    expect(deleteRes.success).toBe(false);
    expect(deleteRes.error).toContain('mặc định');
  });

  it('should recover safely without crash when localStorage contains corrupted JSON', () => {
    const key = `dingdong-gift-cabinet:v1:presets:${testAssetId}`;
    window.localStorage.setItem(key, '{ corrupted json invalid text !!!');

    const res = loadUserPresets(testAssetId);
    expect(res.presets).toEqual([]);
    expect(res.warning).toBeDefined();
    expect(res.warning).toContain('JSON hỏng');
    // Ensure raw corrupt data was not silently wiped
    expect(window.localStorage.getItem(key)).toContain('corrupted json');
  });

  it('should handle favorites list and toggle favorites', () => {
    expect(loadFavorites()).toEqual([]);

    const afterAdd = toggleFavorite('dev-box-fixture');
    expect(afterAdd).toEqual(['dev-box-fixture']);
    expect(loadFavorites()).toEqual(['dev-box-fixture']);

    const afterRemove = toggleFavorite('dev-box-fixture');
    expect(afterRemove).toEqual([]);
    expect(loadFavorites()).toEqual([]);
  });
});
