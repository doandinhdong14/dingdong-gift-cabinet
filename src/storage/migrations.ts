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

  // Handle LoveUniverse01 preset migration for independent group speeds
  if (obj.assetId === 'love-universe-01' && obj.universe && typeof obj.universe === 'object') {
    const u = { ...(obj.universe as Record<string, unknown>) };
    let hasChanges = false;

    const baseSpeed = typeof u.driftSpeed === 'number' ? u.driftSpeed : 0.35;
    const baseEnabled = typeof u.driftEnabled === 'boolean' ? u.driftEnabled : true;

    if (u.globalSpeedMultiplier === undefined) {
      u.globalSpeedMultiplier = 1.0;
      hasChanges = true;
    }
    if (u.textDriftEnabled === undefined) {
      u.textDriftEnabled = baseEnabled;
      hasChanges = true;
    }
    if (u.textDriftSpeed === undefined) {
      u.textDriftSpeed = baseSpeed;
      hasChanges = true;
    }
    if (u.photoDriftEnabled === undefined) {
      u.photoDriftEnabled = baseEnabled;
      hasChanges = true;
    }
    if (u.photoDriftSpeed === undefined) {
      u.photoDriftSpeed = baseSpeed;
      hasChanges = true;
    }
    if (u.heartDriftEnabled === undefined) {
      u.heartDriftEnabled = baseEnabled;
      hasChanges = true;
    }
    if (u.heartDriftSpeed === undefined) {
      u.heartDriftSpeed = baseSpeed;
      hasChanges = true;
    }

    if (Array.isArray(u.decorations)) {
      const migratedDecos = u.decorations.map((d) => {
        if (!d || typeof d !== 'object') return d;
        const dObj = { ...(d as Record<string, unknown>) };
        let decoChanged = false;
        if (dObj.driftEnabled === undefined) {
          dObj.driftEnabled = baseEnabled;
          decoChanged = true;
        }
        if (dObj.driftSpeed === undefined) {
          dObj.driftSpeed = baseSpeed;
          decoChanged = true;
        }
        if (decoChanged) hasChanges = true;
        return dObj;
      });
      u.decorations = migratedDecos;
    }

    if (hasChanges) {
      return {
        config: {
          ...obj,
          universe: u,
        } as unknown as AssetConfig,
        migrated: true,
      };
    }
  }

  return {
    config: rawConfig as unknown as AssetConfig,
    migrated: false,
  };
}
