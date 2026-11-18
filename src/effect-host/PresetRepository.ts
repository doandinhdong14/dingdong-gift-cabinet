import type { Preset } from '../effect-sdk/types';

function getStorageKey(effectId: string): string {
  return `dingdong_effect_${effectId}_custom_presets`;
}

function getActivePresetKey(effectId: string): string {
  return `dingdong_effect_${effectId}_active_preset`;
}

export function loadCustomPresets<C>(effectId: string): Preset<C>[] {
  try {
    const raw = localStorage.getItem(getStorageKey(effectId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error(`Failed to load custom presets for effect "${effectId}":`, err);
    return [];
  }
}

export function saveCustomPreset<C>(effectId: string, preset: Preset<C>): void {
  try {
    const current = loadCustomPresets<C>(effectId);
    const existingIndex = current.findIndex((p) => p.id === preset.id);
    let updated: Preset<C>[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = preset;
    } else {
      updated = [...current, preset];
    }
    localStorage.setItem(getStorageKey(effectId), JSON.stringify(updated));
  } catch (err) {
    console.error(`Failed to save custom preset for effect "${effectId}":`, err);
  }
}

export function deleteCustomPreset(effectId: string, presetId: string): void {
  try {
    const current = loadCustomPresets(effectId);
    const updated = current.filter((p) => p.id !== presetId);
    localStorage.setItem(getStorageKey(effectId), JSON.stringify(updated));
  } catch (err) {
    console.error(`Failed to delete custom preset for effect "${effectId}":`, err);
  }
}

export function loadActivePresetId(effectId: string): string | null {
  try {
    return localStorage.getItem(getActivePresetKey(effectId));
  } catch {
    return null;
  }
}

export function saveActivePresetId(effectId: string, presetId: string): void {
  try {
    localStorage.setItem(getActivePresetKey(effectId), presetId);
  } catch {
    // ignore
  }
}

export function exportPresetsAsJson<C>(presets: Preset<C>[]): string {
  return JSON.stringify(presets, null, 2);
}

export function importPresetsFromJson<C>(json: string): Preset<C>[] {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) {
      throw new Error('Imported data must be an array of presets');
    }
    return parsed;
  } catch (err: any) {
    throw new Error(`Invalid preset JSON format: ${err.message}`);
  }
}
