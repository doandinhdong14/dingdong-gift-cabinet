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
  const allowedRootKeys = ['schemaVersion', 'assetId', 'assetVersion', 'appearance', 'transform', 'motion'];
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
