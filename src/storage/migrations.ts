import { AssetConfig } from '../gift-library/types';
import { CURRENT_SCHEMA_VERSION } from '../utils/configValidation';

/**
 * Migration pipeline for stored AssetConfigs.
 * Upgrades older configurations when schema versions evolve.
 */
export function migrateAssetConfig(rawConfig: unknown): { config: AssetConfig | null; migrated: boolean; error?: string } {
  if (!rawConfig || typeof rawConfig !== 'object') {
    return { config: null, migrated: false, error: 'Dữ liệu không phải đối tượng' };
  }

  const obj = rawConfig as Record<string, unknown>;
  const version = typeof obj.schemaVersion === 'number' ? obj.schemaVersion : 1;

  if (version > CURRENT_SCHEMA_VERSION) {
    return {
      config: null,
      migrated: false,
      error: `Phiên bản schema ${version} mới hơn phiên bản hỗ trợ (${CURRENT_SCHEMA_VERSION}).`,
    };
  }

  // Future migrations can be chained here:
  // if (version === 1) { ... upgrade to 2 }

  return {
    config: rawConfig as unknown as AssetConfig,
    migrated: false,
  };
}
