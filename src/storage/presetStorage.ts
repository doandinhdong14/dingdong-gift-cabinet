import { Preset, AssetConfig } from '../gift-library/types';
import { validatePreset } from '../utils/configValidation';

const STORAGE_NAMESPACE = 'dingdong-gift-cabinet:v1';
const PRESET_KEY_PREFIX = `${STORAGE_NAMESPACE}:presets:`;
const FAVORITES_KEY = `${STORAGE_NAMESPACE}:favorites`;

// In-memory fallback when localStorage is blocked or fails
const memoryStorage = new Map<string, string>();

let isLocalStorageUsable: boolean | null = null;

export function checkLocalStorage(): boolean {
  if (isLocalStorageUsable !== null) return isLocalStorageUsable;
  try {
    const testKey = `${STORAGE_NAMESPACE}:__test__`;
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    isLocalStorageUsable = true;
    return true;
  } catch {
    isLocalStorageUsable = false;
    return false;
  }
}

function getItem(key: string): string | null {
  if (checkLocalStorage()) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryStorage.get(key) ?? null;
    }
  }
  return memoryStorage.get(key) ?? null;
}

function setItem(key: string, value: string): { success: boolean; error?: string } {
  if (checkLocalStorage()) {
    try {
      window.localStorage.setItem(key, value);
      return { success: true };
    } catch (err: unknown) {
      // QuotaExceededError or security block
      const msg = err instanceof Error ? err.message : 'QuotaExceeded';
      memoryStorage.set(key, value);
      return {
        success: false,
        error: `Bộ nhớ trình duyệt (localStorage) đã đầy hoặc bị chặn. Dữ liệu tạm thời được lưu trong bộ nhớ phiên làm việc. (${msg})`,
      };
    }
  }
  memoryStorage.set(key, value);
  return {
    success: false,
    error: 'Bộ nhớ trình duyệt không khả dụng. Dữ liệu chỉ được lưu tạm thời trong phiên này.',
  };
}

/**
 * Load user presets for a specific assetId
 */
export function loadUserPresets(assetId: string): { presets: Preset[]; warning?: string } {
  const key = `${PRESET_KEY_PREFIX}${assetId}`;
  const raw = getItem(key);
  if (!raw) {
    return { presets: [] };
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return {
        presets: [],
        warning: `Dữ liệu preset của '${assetId}' trong bộ nhớ không đúng định dạng. Dữ liệu cũ được giữ nguyên, không bị ghi đè.`,
      };
    }

    const validPresets: Preset[] = [];
    const errors: string[] = [];

    parsed.forEach((item, index) => {
      const res = validatePreset(item);
      if (res.valid && res.data) {
        validPresets.push(res.data);
      } else {
        errors.push(`Mục ${index}: ${res.errors.join('; ')}`);
      }
    });

    let warning: string | undefined;
    if (errors.length > 0) {
      warning = `Đã bỏ qua ${errors.length} preset không hợp lệ trong bộ nhớ cục bộ.`;
    }

    return { presets: validPresets, warning };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown';
    return {
      presets: [],
      warning: `Không thể đọc dữ liệu preset từ localStorage (JSON hỏng: ${msg}). Không xóa dữ liệu cũ.`,
    };
  }
}

/**
 * Save a new user preset for an assetId
 */
export function saveUserPreset(
  assetId: string,
  preset: Preset
): { success: boolean; error?: string; presets: Preset[] } {
  const { presets: currentPresets } = loadUserPresets(assetId);

  // Validate the incoming preset
  const validation = validatePreset(preset);
  if (!validation.valid) {
    return {
      success: false,
      error: `Preset không hợp lệ: ${validation.errors.join(', ')}`,
      presets: currentPresets,
    };
  }

  const newPreset: Preset = {
    ...validation.data!,
    isBuiltIn: Boolean(preset.isBuiltIn),
    updatedAt: new Date().toISOString(),
  };

  // Replace if exists, or append
  const existingIdx = currentPresets.findIndex((p) => p.id === newPreset.id);
  let updatedList: Preset[];
  if (existingIdx >= 0) {
    updatedList = [...currentPresets];
    updatedList[existingIdx] = newPreset;
  } else {
    updatedList = [...currentPresets, newPreset];
  }

  const key = `${PRESET_KEY_PREFIX}${assetId}`;
  const saveRes = setItem(key, JSON.stringify(updatedList));

  return {
    success: saveRes.success,
    error: saveRes.error,
    presets: updatedList,
  };
}

/**
 * Rename or update an existing user preset
 */
export function updateUserPreset(
  assetId: string,
  id: string,
  updates: { name?: string; config?: AssetConfig }
): { success: boolean; error?: string; presets: Preset[] } {
  const { presets: currentPresets } = loadUserPresets(assetId);
  const targetIdx = currentPresets.findIndex((p) => p.id === id);

  if (targetIdx === -1) {
    return {
      success: false,
      error: `Không tìm thấy preset có ID '${id}'.`,
      presets: currentPresets,
    };
  }

  const existing = currentPresets[targetIdx];
  if (existing.isBuiltIn) {
    return {
      success: false,
      error: 'Preset mặc định là chỉ đọc, không thể sửa đổi trực tiếp. Hãy lưu thành biến thể mới.',
      presets: currentPresets,
    };
  }

  const updated: Preset = {
    ...existing,
    name: updates.name !== undefined ? updates.name.trim() : existing.name,
    config: updates.config ?? existing.config,
    updatedAt: new Date().toISOString(),
  };

  const validation = validatePreset(updated);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.errors.join(', '),
      presets: currentPresets,
    };
  }

  const updatedList = [...currentPresets];
  updatedList[targetIdx] = validation.data!;

  const key = `${PRESET_KEY_PREFIX}${assetId}`;
  const saveRes = setItem(key, JSON.stringify(updatedList));

  return {
    success: saveRes.success,
    error: saveRes.error,
    presets: updatedList,
  };
}

/**
 * Delete a user preset
 */
export function deleteUserPreset(
  assetId: string,
  id: string
): { success: boolean; error?: string; presets: Preset[] } {
  const { presets: currentPresets } = loadUserPresets(assetId);
  const target = currentPresets.find((p) => p.id === id);

  if (!target) {
    return { success: false, error: 'Không tìm thấy preset cần xóa.', presets: currentPresets };
  }

  if (target.isBuiltIn) {
    return { success: false, error: 'Không thể xóa preset mặc định của hệ thống.', presets: currentPresets };
  }

  const filtered = currentPresets.filter((p) => p.id !== id);
  const key = `${PRESET_KEY_PREFIX}${assetId}`;
  const saveRes = setItem(key, JSON.stringify(filtered));

  return {
    success: saveRes.success,
    error: saveRes.error,
    presets: filtered,
  };
}

/**
 * Load user favorite asset IDs
 */
export function loadFavorites(): string[] {
  const raw = getItem(FAVORITES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * Save user favorite asset IDs
 */
export function saveFavorites(ids: string[]): boolean {
  const res = setItem(FAVORITES_KEY, JSON.stringify(ids));
  return res.success;
}

/**
 * Toggle favorite status of an asset ID
 */
export function toggleFavorite(assetId: string): string[] {
  const favorites = loadFavorites();
  const exists = favorites.includes(assetId);
  const updated = exists ? favorites.filter((id) => id !== assetId) : [...favorites, assetId];
  saveFavorites(updated);
  return updated;
}
