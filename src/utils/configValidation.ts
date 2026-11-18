import { AssetConfig, Preset } from '../gift-library/types';

export const CURRENT_SCHEMA_VERSION = 1;
export const MAX_IMPORT_SIZE_BYTES = 100 * 1024; // 100 KB

export interface ValidationResult<T> {
  valid: boolean;
  errors: string[];
  warnings: string[];
  data?: T;
}

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function isFiniteNumber(val: unknown): val is number {
  return typeof val === 'number' && Number.isFinite(val);
}

function inRange(val: number, min: number, max: number): boolean {
  return val >= min && val <= max;
}

/**
 * Validates an AssetConfig object strictly against schema, types and ranges.
 * Rejects unsupported fields and malicious injection.
 */
export function validateAssetConfig(raw: unknown): ValidationResult<AssetConfig> {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { valid: false, errors: ['Cấu hình phải là một đối tượng JSON hợp lệ.'], warnings };
  }

  const obj = raw as Record<string, unknown>;

  // Check allowed keys at root
  const allowedRootKeys = ['schemaVersion', 'assetId', 'assetVersion', 'appearance', 'transform', 'motion', 'universe', 'roseReveal'];
  for (const k of Object.keys(obj)) {
    if (!allowedRootKeys.includes(k)) {
      errors.push(`Trường không được hỗ trợ trong cấu hình: '${k}'`);
    }
  }

  // schemaVersion
  if (!('schemaVersion' in obj)) {
    errors.push('Thiếu schemaVersion.');
  } else if (typeof obj.schemaVersion !== 'number') {
    errors.push('schemaVersion phải là một số nguyên.');
  } else if (obj.schemaVersion > CURRENT_SCHEMA_VERSION) {
    errors.push(`Phiên bản schemaVersion ${obj.schemaVersion} mới hơn phiên bản ứng dụng hỗ trợ (${CURRENT_SCHEMA_VERSION}). Vui lòng cập nhật ứng dụng.`);
  } else if (obj.schemaVersion < 1) {
    errors.push(`schemaVersion không hợp lệ: ${obj.schemaVersion}`);
  }

  // assetId
  if (!obj.assetId || typeof obj.assetId !== 'string' || obj.assetId.trim() === '') {
    errors.push('assetId phải là một chuỗi định danh không rỗng.');
  }

  // assetVersion
  if (!obj.assetVersion || typeof obj.assetVersion !== 'string') {
    errors.push('assetVersion phải là chuỗi phiên bản.');
  }

  // appearance
  if (!obj.appearance || typeof obj.appearance !== 'object' || Array.isArray(obj.appearance)) {
    errors.push('Thiếu mục appearance hoặc không đúng định dạng.');
  } else {
    const app = obj.appearance as Record<string, unknown>;
    const allowedAppKeys = ['color', 'roughness', 'metalness'];
    for (const k of Object.keys(app)) {
      if (!allowedAppKeys.includes(k)) errors.push(`Trường không hỗ trợ trong appearance: '${k}'`);
    }

    if (typeof app.color !== 'string' || !HEX_COLOR_REGEX.test(app.color)) {
      errors.push('appearance.color phải là mã màu HEX hợp lệ (ví dụ: #F46C91 hoặc #FFF).');
    }
    if (!isFiniteNumber(app.roughness) || !inRange(app.roughness, 0, 1)) {
      errors.push('appearance.roughness phải là số hữu hạn trong khoảng từ 0 đến 1.');
    }
    if (!isFiniteNumber(app.metalness) || !inRange(app.metalness, 0, 1)) {
      errors.push('appearance.metalness phải là số hữu hạn trong khoảng từ 0 đến 1.');
    }
  }

  // transform
  if (!obj.transform || typeof obj.transform !== 'object' || Array.isArray(obj.transform)) {
    errors.push('Thiếu mục transform hoặc không đúng định dạng.');
  } else {
    const tr = obj.transform as Record<string, unknown>;
    const allowedTrKeys = ['scale', 'rotationDeg'];
    for (const k of Object.keys(tr)) {
      if (!allowedTrKeys.includes(k)) errors.push(`Trường không hỗ trợ trong transform: '${k}'`);
    }

    if (!isFiniteNumber(tr.scale) || !inRange(tr.scale, 0.1, 5.0)) {
      errors.push('transform.scale phải là số hữu hạn từ 0.1 đến 5.0.');
    }
    if (!Array.isArray(tr.rotationDeg) || tr.rotationDeg.length !== 3) {
      errors.push('transform.rotationDeg phải là mảng gồm 3 góc xoay [X, Y, Z] tính bằng độ.');
    } else {
      for (let i = 0; i < 3; i++) {
        const val = tr.rotationDeg[i];
        if (!isFiniteNumber(val) || !inRange(val, -360, 360)) {
          errors.push(`Góc xoay rotationDeg[${i}] phải là số hữu hạn trong khoảng -360° đến 360°.`);
        }
      }
    }
  }

  // motion
  if (!obj.motion || typeof obj.motion !== 'object' || Array.isArray(obj.motion)) {
    errors.push('Thiếu mục motion hoặc không đúng định dạng.');
  } else {
    const mo = obj.motion as Record<string, unknown>;
    const allowedMotionKeys = ['float', 'heartbeat', 'spin'];
    for (const k of Object.keys(mo)) {
      if (!allowedMotionKeys.includes(k)) errors.push(`Trường không hỗ trợ trong motion: '${k}'`);
    }

    // float
    if (!mo.float || typeof mo.float !== 'object') {
      errors.push('Thiếu cấu hình motion.float.');
    } else {
      const fl = mo.float as Record<string, unknown>;
      if (typeof fl.enabled !== 'boolean') errors.push('motion.float.enabled phải là boolean.');
      if (!isFiniteNumber(fl.amplitude) || !inRange(fl.amplitude, 0, 2.0)) {
        errors.push('motion.float.amplitude phải là số hữu hạn từ 0 đến 2.0.');
      }
      if (!isFiniteNumber(fl.speed) || !inRange(fl.speed, 0.01, 10)) {
        errors.push('motion.float.speed phải là số hữu hạn từ 0.01 đến 10.');
      }
    }

    // heartbeat
    if (!mo.heartbeat || typeof mo.heartbeat !== 'object') {
      errors.push('Thiếu cấu hình motion.heartbeat.');
    } else {
      const hb = mo.heartbeat as Record<string, unknown>;
      if (typeof hb.enabled !== 'boolean') errors.push('motion.heartbeat.enabled phải là boolean.');
      if (!isFiniteNumber(hb.strength) || !inRange(hb.strength, 0, 1.0)) {
        errors.push('motion.heartbeat.strength phải là số hữu hạn từ 0 đến 1.0.');
      }
      if (!isFiniteNumber(hb.bpm) || !inRange(hb.bpm, 10, 300)) {
        errors.push('motion.heartbeat.bpm phải là số hữu hạn từ 10 đến 300 BPM.');
      }
    }

    // spin
    if (!mo.spin || typeof mo.spin !== 'object') {
      errors.push('Thiếu cấu hình motion.spin.');
    } else {
      const sp = mo.spin as Record<string, unknown>;
      if (typeof sp.enabled !== 'boolean') errors.push('motion.spin.enabled phải là boolean.');
      if (!isFiniteNumber(sp.speedDegPerSecond) || !inRange(sp.speedDegPerSecond, -720, 720)) {
        errors.push('motion.spin.speedDegPerSecond phải là số hữu hạn từ -720°/s đến 720°/s.');
      }
    }
  }

  // universe (optional extension for love-universe-01)
  if ('universe' in obj && obj.universe !== undefined) {
    if (!obj.universe || typeof obj.universe !== 'object' || Array.isArray(obj.universe)) {
      errors.push('Mục universe phải là một đối tượng hợp lệ.');
    } else {
      const u = obj.universe as Record<string, unknown>;
      const allowedUniverseKeys = [
        'wishes',
        'textCount',
        'photoCount',
        'heartCount',
        'cloudWidth',
        'cloudHeight',
        'cloudDepth',
        'rotationSpeed',
        'textColor',
        'glowIntensity',
        'heartColor',
        'seed',
        'showIntro',
        'savedImageIds',
        'glowEnabled',
        'glowSpread',
        'glowColor',
        'textScaleFactor',
        'photoScaleFactor',
        'heartScaleFactor',
        'heartRoughness',
        'heartSpinSpeed',
        'heartFloatAmp',
        'driftEnabled',
        'driftSpeed',
        'globalSpeedMultiplier',
        'textDriftEnabled',
        'textDriftSpeed',
        'photoDriftEnabled',
        'photoDriftSpeed',
        'heartDriftEnabled',
        'heartDriftSpeed',
        'decorations',
      ];
      for (const uk of Object.keys(u)) {
        if (!allowedUniverseKeys.includes(uk)) {
          errors.push(`Trường không được hỗ trợ trong universe: '${uk}'`);
        }
      }

      if ('wishes' in u) {
        if (!Array.isArray(u.wishes)) {
          errors.push('universe.wishes phải là một mảng chuỗi câu chúc.');
        } else if (u.wishes.some((w) => typeof w !== 'string')) {
          errors.push('Mỗi câu chúc trong universe.wishes phải là chuỗi văn bản.');
        }
      }

      if ('textCount' in u && (!isFiniteNumber(u.textCount) || !inRange(u.textCount, 1, 250))) {
        errors.push('universe.textCount phải là số hữu hạn từ 1 đến 250.');
      }
      if ('photoCount' in u && (!isFiniteNumber(u.photoCount) || !inRange(u.photoCount, 1, 50))) {
        errors.push('universe.photoCount phải là số hữu hạn từ 1 đến 50.');
      }
      if ('heartCount' in u && (!isFiniteNumber(u.heartCount) || !inRange(u.heartCount, 1, 100))) {
        errors.push('universe.heartCount phải là số hữu hạn từ 1 đến 100.');
      }
      if ('cloudWidth' in u && (!isFiniteNumber(u.cloudWidth) || !inRange(u.cloudWidth, 2, 60))) {
        errors.push('universe.cloudWidth phải là số hữu hạn từ 2 đến 60.');
      }
      if ('cloudHeight' in u && (!isFiniteNumber(u.cloudHeight) || !inRange(u.cloudHeight, 2, 60))) {
        errors.push('universe.cloudHeight phải là số hữu hạn từ 2 đến 60.');
      }
      if ('cloudDepth' in u && (!isFiniteNumber(u.cloudDepth) || !inRange(u.cloudDepth, 2, 60))) {
        errors.push('universe.cloudDepth phải là số hữu hạn từ 2 đến 60.');
      }
      if ('rotationSpeed' in u && (!isFiniteNumber(u.rotationSpeed) || !inRange(u.rotationSpeed, -60, 60))) {
        errors.push('universe.rotationSpeed phải là số hữu hạn từ -60 đến 60 độ/giây.');
      }
      if ('glowIntensity' in u && (!isFiniteNumber(u.glowIntensity) || !inRange(u.glowIntensity, 0, 5))) {
        errors.push('universe.glowIntensity phải là số hữu hạn từ 0 đến 5.');
      }
      if ('seed' in u && !isFiniteNumber(u.seed)) {
        errors.push('universe.seed phải là một số nguyên hữu hạn.');
      }
      if ('textColor' in u && (typeof u.textColor !== 'string' || !HEX_COLOR_REGEX.test(u.textColor))) {
        errors.push('universe.textColor phải là mã màu HEX hợp lệ.');
      }
      if ('heartColor' in u && (typeof u.heartColor !== 'string' || !HEX_COLOR_REGEX.test(u.heartColor))) {
        errors.push('universe.heartColor phải là mã màu HEX hợp lệ.');
      }
      if ('showIntro' in u && typeof u.showIntro !== 'boolean') {
        errors.push('universe.showIntro phải là boolean.');
      }
      if ('glowEnabled' in u && typeof u.glowEnabled !== 'boolean') {
        errors.push('universe.glowEnabled phải là boolean.');
      }
      if ('glowSpread' in u && (!isFiniteNumber(u.glowSpread) || !inRange(u.glowSpread, 0, 1.5))) {
        errors.push('universe.glowSpread phải là số hữu hạn từ 0 đến 1.5.');
      }
      if ('glowColor' in u && (typeof u.glowColor !== 'string' || !HEX_COLOR_REGEX.test(u.glowColor))) {
        errors.push('universe.glowColor phải là mã màu HEX hợp lệ.');
      }
      if ('textScaleFactor' in u && (!isFiniteNumber(u.textScaleFactor) || !inRange(u.textScaleFactor, 0.2, 5))) {
        errors.push('universe.textScaleFactor phải là số hữu hạn từ 0.2 đến 5.');
      }
      if ('photoScaleFactor' in u && (!isFiniteNumber(u.photoScaleFactor) || !inRange(u.photoScaleFactor, 0.2, 5))) {
        errors.push('universe.photoScaleFactor phải là số hữu hạn từ 0.2 đến 5.');
      }
      if ('heartScaleFactor' in u && (!isFiniteNumber(u.heartScaleFactor) || !inRange(u.heartScaleFactor, 0.2, 5))) {
        errors.push('universe.heartScaleFactor phải là số hữu hạn từ 0.2 đến 5.');
      }
      if ('heartRoughness' in u && (!isFiniteNumber(u.heartRoughness) || !inRange(u.heartRoughness, 0, 1))) {
        errors.push('universe.heartRoughness phải là số hữu hạn từ 0 đến 1.');
      }
      if ('heartSpinSpeed' in u && (!isFiniteNumber(u.heartSpinSpeed) || !inRange(u.heartSpinSpeed, 0, 10))) {
        errors.push('universe.heartSpinSpeed phải là số hữu hạn từ 0 đến 10.');
      }
      if ('heartFloatAmp' in u && (!isFiniteNumber(u.heartFloatAmp) || !inRange(u.heartFloatAmp, 0, 1))) {
        errors.push('universe.heartFloatAmp phải là số hữu hạn từ 0 đến 1.');
      }
      if ('driftEnabled' in u && typeof u.driftEnabled !== 'boolean') {
        errors.push('universe.driftEnabled phải là boolean.');
      }
      if ('driftSpeed' in u && (!isFiniteNumber(u.driftSpeed) || !inRange(u.driftSpeed, 0, 10))) {
        errors.push('universe.driftSpeed phải là số hữu hạn từ 0 đến 10.');
      }
      if ('globalSpeedMultiplier' in u && (!isFiniteNumber(u.globalSpeedMultiplier) || !inRange(u.globalSpeedMultiplier, 0, 5))) {
        errors.push('universe.globalSpeedMultiplier phải là số hữu hạn từ 0 đến 5.');
      }
      if ('textDriftEnabled' in u && typeof u.textDriftEnabled !== 'boolean') {
        errors.push('universe.textDriftEnabled phải là boolean.');
      }
      if ('textDriftSpeed' in u && (!isFiniteNumber(u.textDriftSpeed) || !inRange(u.textDriftSpeed, 0, 10))) {
        errors.push('universe.textDriftSpeed phải là số hữu hạn từ 0 đến 10.');
      }
      if ('photoDriftEnabled' in u && typeof u.photoDriftEnabled !== 'boolean') {
        errors.push('universe.photoDriftEnabled phải là boolean.');
      }
      if ('photoDriftSpeed' in u && (!isFiniteNumber(u.photoDriftSpeed) || !inRange(u.photoDriftSpeed, 0, 10))) {
        errors.push('universe.photoDriftSpeed phải là số hữu hạn từ 0 đến 10.');
      }
      if ('heartDriftEnabled' in u && typeof u.heartDriftEnabled !== 'boolean') {
        errors.push('universe.heartDriftEnabled phải là boolean.');
      }
      if ('heartDriftSpeed' in u && (!isFiniteNumber(u.heartDriftSpeed) || !inRange(u.heartDriftSpeed, 0, 10))) {
        errors.push('universe.heartDriftSpeed phải là số hữu hạn từ 0 đến 10.');
      }
      if ('decorations' in u && u.decorations !== undefined) {
        if (!Array.isArray(u.decorations)) {
          errors.push('universe.decorations phải là mảng.');
        } else {
          for (let i = 0; i < u.decorations.length; i++) {
            const dec = u.decorations[i];
            if (!dec || typeof dec !== 'object') {
              errors.push(`universe.decorations[${i}] phải là đối tượng.`);
            } else {
              const dObj = dec as Record<string, unknown>;
              if (!['heart', 'star3d', 'giftbox'].includes(dObj.type as string)) {
                errors.push(`universe.decorations[${i}].type không hợp lệ.`);
              }
              if ('driftEnabled' in dObj && typeof dObj.driftEnabled !== 'boolean') {
                errors.push(`universe.decorations[${i}].driftEnabled phải là boolean.`);
              }
              if ('driftSpeed' in dObj && (!isFiniteNumber(dObj.driftSpeed) || !inRange(dObj.driftSpeed, 0, 10))) {
                errors.push(`universe.decorations[${i}].driftSpeed phải là số hữu hạn từ 0 đến 10.`);
              }
            }
          }
        }
      }
    }
  }

  // roseReveal validation
  if ('roseReveal' in obj) {
    if (!obj.roseReveal || typeof obj.roseReveal !== 'object' || Array.isArray(obj.roseReveal)) {
      errors.push('roseReveal phải là một đối tượng cấu hình.');
    } else {
      const r = obj.roseReveal as Record<string, unknown>;
      const allowedRoseKeys = [
        'petalColor',
        'petalInnerColor',
        'petalEdgeColor',
        'stemColor',
        'backgroundColor',
        'flowerScale',
        'bloomDuration',
        'flyingPetalsCount',
        'burstSpeed',
        'fallSpeed',
        'spinSpeed',
        'ambientLightIntensity',
        'messageText',
        'buttonText',
        'destinationTarget',
        'manualBloomProgress',
        'inspectionMode',
      ];
      for (const rk of Object.keys(r)) {
        if (!allowedRoseKeys.includes(rk)) {
          errors.push(`Trường không được hỗ trợ trong roseReveal: '${rk}'`);
        }
      }

      if ('petalColor' in r && (typeof r.petalColor !== 'string' || !HEX_COLOR_REGEX.test(r.petalColor))) {
        errors.push('roseReveal.petalColor phải là mã màu HEX hợp lệ.');
      }
      if ('petalInnerColor' in r && (typeof r.petalInnerColor !== 'string' || !HEX_COLOR_REGEX.test(r.petalInnerColor))) {
        errors.push('roseReveal.petalInnerColor phải là mã màu HEX hợp lệ.');
      }
      if ('petalEdgeColor' in r && (typeof r.petalEdgeColor !== 'string' || !HEX_COLOR_REGEX.test(r.petalEdgeColor))) {
        errors.push('roseReveal.petalEdgeColor phải là mã màu HEX hợp lệ.');
      }
      if ('stemColor' in r && (typeof r.stemColor !== 'string' || !HEX_COLOR_REGEX.test(r.stemColor))) {
        errors.push('roseReveal.stemColor phải là mã màu HEX hợp lệ.');
      }
      if ('backgroundColor' in r && (typeof r.backgroundColor !== 'string' || !HEX_COLOR_REGEX.test(r.backgroundColor))) {
        errors.push('roseReveal.backgroundColor phải là mã màu HEX hợp lệ.');
      }
      if ('flowerScale' in r && (!isFiniteNumber(r.flowerScale) || !inRange(r.flowerScale, 0.2, 5.0))) {
        errors.push('roseReveal.flowerScale phải là số hữu hạn từ 0.2 đến 5.0.');
      }
      if ('bloomDuration' in r && (!isFiniteNumber(r.bloomDuration) || !inRange(r.bloomDuration, 0.5, 10.0))) {
        errors.push('roseReveal.bloomDuration phải là số hữu hạn từ 0.5 đến 10.0 giây.');
      }
      if ('flyingPetalsCount' in r && (!isFiniteNumber(r.flyingPetalsCount) || !inRange(r.flyingPetalsCount, 0, 200))) {
        errors.push('roseReveal.flyingPetalsCount phải là số hữu hạn từ 0 đến 200.');
      }
      if ('burstSpeed' in r && (!isFiniteNumber(r.burstSpeed) || !inRange(r.burstSpeed, 0.1, 10.0))) {
        errors.push('roseReveal.burstSpeed phải là số hữu hạn từ 0.1 đến 10.0.');
      }
      if ('fallSpeed' in r && (!isFiniteNumber(r.fallSpeed) || !inRange(r.fallSpeed, 0.1, 10.0))) {
        errors.push('roseReveal.fallSpeed phải là số hữu hạn từ 0.1 đến 10.0.');
      }
      if ('spinSpeed' in r && (!isFiniteNumber(r.spinSpeed) || !inRange(r.spinSpeed, 0.0, 10.0))) {
        errors.push('roseReveal.spinSpeed phải là số hữu hạn từ 0.0 đến 10.0.');
      }
      if ('ambientLightIntensity' in r && (!isFiniteNumber(r.ambientLightIntensity) || !inRange(r.ambientLightIntensity, 0.0, 5.0))) {
        errors.push('roseReveal.ambientLightIntensity phải là số hữu hạn từ 0.0 đến 5.0.');
      }
      if ('messageText' in r && typeof r.messageText !== 'string') {
        errors.push('roseReveal.messageText phải là chuỗi văn bản.');
      }
      if ('buttonText' in r && typeof r.buttonText !== 'string') {
        errors.push('roseReveal.buttonText phải là chuỗi văn bản.');
      }
      if ('destinationTarget' in r && !['demo-card', 'love-universe-01'].includes(r.destinationTarget as string)) {
        errors.push('roseReveal.destinationTarget phải là "demo-card" hoặc "love-universe-01".');
      }
      if ('manualBloomProgress' in r && r.manualBloomProgress !== undefined && (!isFiniteNumber(r.manualBloomProgress) || !inRange(r.manualBloomProgress, -1, 1))) {
        errors.push('roseReveal.manualBloomProgress phải là số hữu hạn từ -1 đến 1.');
      }
      if ('inspectionMode' in r && r.inspectionMode !== undefined && typeof r.inspectionMode !== 'boolean') {
        errors.push('roseReveal.inspectionMode phải là boolean.');
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  return {
    valid: true,
    errors: [],
    warnings,
    data: obj as unknown as AssetConfig,
  };
}

/**
 * Validates a Preset object.
 */
export function validatePreset(raw: unknown): ValidationResult<Preset> {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { valid: false, errors: ['Preset phải là đối tượng hợp lệ.'], warnings };
  }

  const p = raw as Record<string, unknown>;
  if (!p.id || typeof p.id !== 'string') errors.push('Preset thiếu id hoặc id không phải chuỗi.');
  if (!p.name || typeof p.name !== 'string' || p.name.trim().length === 0 || p.name.trim().length > 60) {
    errors.push('Tên preset phải từ 1 đến 60 ký tự.');
  }
  if (!p.assetId || typeof p.assetId !== 'string') errors.push('Preset thiếu assetId.');
  if (!p.assetVersion || typeof p.assetVersion !== 'string') errors.push('Preset thiếu assetVersion.');

  const configValidation = validateAssetConfig(p.config);
  if (!configValidation.valid) {
    errors.push(...configValidation.errors.map((e) => `Trong cấu hình của preset: ${e}`));
  }
  warnings.push(...configValidation.warnings);

  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  return {
    valid: true,
    errors: [],
    warnings,
    data: {
      id: String(p.id),
      name: String(p.name).trim(),
      assetId: String(p.assetId),
      assetVersion: String(p.assetVersion),
      config: configValidation.data!,
      createdAt: p.createdAt ? String(p.createdAt) : new Date().toISOString(),
      updatedAt: p.updatedAt ? String(p.updatedAt) : new Date().toISOString(),
      isBuiltIn: Boolean(p.isBuiltIn),
    },
  };
}

/**
 * Safely parses and validates an imported JSON string.
 * Enforces the 100 KB file size limit and prevents arbitrary code execution.
 */
export function parseAndValidateImport(
  jsonText: string,
  targetAssetId?: string
): ValidationResult<{ type: 'single-config' | 'presets-list'; config?: AssetConfig; presets?: Preset[] }> {
  // Check size limit: 100 KB
  const byteLength = new TextEncoder().encode(jsonText).length;
  if (byteLength > MAX_IMPORT_SIZE_BYTES) {
    return {
      valid: false,
      errors: [`File quá lớn (${(byteLength / 1024).toFixed(1)} KB). Giới hạn tối đa là 100 KB.`],
      warnings: [],
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi cú pháp';
    return {
      valid: false,
      errors: [`JSON không hợp lệ: ${msg}`],
      warnings: [],
    };
  }

  const warnings: string[] = [];

  // Check if it's an export wrapper
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const wrapper = parsed as Record<string, unknown>;
    if (wrapper.type === 'dingdong-config-export') {
      const res = validateAssetConfig(wrapper.data);
      if (!res.valid) return { valid: false, errors: res.errors, warnings };
      if (targetAssetId && res.data!.assetId !== targetAssetId) {
        warnings.push(`Cấu hình nhập vào thuộc asset '${res.data!.assetId}', khác asset hiện tại ('${targetAssetId}').`);
      }
      return {
        valid: true,
        errors: [],
        warnings: [...warnings, ...res.warnings],
        data: { type: 'single-config', config: res.data },
      };
    }

    if (wrapper.type === 'dingdong-preset-export' && Array.isArray(wrapper.data)) {
      parsed = wrapper.data; // proceed to array processing
    }
  }

  // Check if it's an array of presets
  if (Array.isArray(parsed)) {
    const validPresets: Preset[] = [];
    const errors: string[] = [];

    parsed.forEach((item, index) => {
      const pRes = validatePreset(item);
      if (!pRes.valid) {
        errors.push(`Preset ở vị trí [${index}]: ${pRes.errors.join(', ')}`);
      } else {
        if (targetAssetId && pRes.data!.assetId !== targetAssetId) {
          warnings.push(`Preset '${pRes.data!.name}' thuộc asset '${pRes.data!.assetId}', khác asset hiện tại ('${targetAssetId}').`);
        }
        validPresets.push(pRes.data!);
      }
    });

    if (errors.length > 0) {
      return { valid: false, errors, warnings };
    }

    return {
      valid: true,
      errors: [],
      warnings,
      data: { type: 'presets-list', presets: validPresets },
    };
  }

  // Otherwise, attempt to validate as a single AssetConfig
  const configRes = validateAssetConfig(parsed);
  if (configRes.valid) {
    if (targetAssetId && configRes.data!.assetId !== targetAssetId) {
      warnings.push(`Cấu hình nhập vào thuộc asset '${configRes.data!.assetId}', khác asset hiện tại ('${targetAssetId}').`);
    }
    return {
      valid: true,
      errors: [],
      warnings: [...warnings, ...configRes.warnings],
      data: { type: 'single-config', config: configRes.data },
    };
  }

  // Also attempt to validate as a single Preset
  const singlePresetRes = validatePreset(parsed);
  if (singlePresetRes.valid) {
    return {
      valid: true,
      errors: [],
      warnings: singlePresetRes.warnings,
      data: { type: 'presets-list', presets: [singlePresetRes.data!] },
    };
  }

  return {
    valid: false,
    errors: [
      'Nội dung JSON không khớp với định dạng cấu hình AssetConfig hoặc Preset.',
      ...configRes.errors.slice(0, 3),
    ],
    warnings,
  };
}
