import type { EffectManifest, ValidationError } from '../types';

const KEBAB_CASE_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SEMVER_REGEX = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/;
const VALID_KINDS = ['object3d', 'background', 'scene', 'transition', 'overlay2d'] as const;
const VALID_RENDERERS = ['r3f', 'dom', 'canvas2d'] as const;
const VALID_STATUSES = ['draft', 'review', 'approved', 'needs-fix'] as const;

export function validateManifest(input: unknown): { success: true; data: EffectManifest } | { success: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (!input || typeof input !== 'object') {
    return { success: false, errors: [{ path: '', message: 'Manifest must be an object' }] };
  }

  const m = input as Record<string, unknown>;

  if (typeof m.manifestVersion !== 'number' || m.manifestVersion < 1) {
    errors.push({ path: 'manifestVersion', message: 'manifestVersion must be a positive integer (e.g. 1)' });
  }

  if (typeof m.id !== 'string' || !KEBAB_CASE_REGEX.test(m.id)) {
    errors.push({ path: 'id', message: 'id must be a lowercase kebab-case string (e.g. "rose-reveal-01")' });
  }

  if (typeof m.name !== 'string' || m.name.trim().length === 0) {
    errors.push({ path: 'name', message: 'name must be a non-empty string' });
  }

  if (typeof m.version !== 'string' || !SEMVER_REGEX.test(m.version)) {
    errors.push({ path: 'version', message: 'version must follow semver format (e.g. "0.1.0")' });
  }

  if (typeof m.configVersion !== 'number' || m.configVersion < 1) {
    errors.push({ path: 'configVersion', message: 'configVersion must be a positive integer' });
  }

  if (typeof m.sdkApiVersion !== 'number' || m.sdkApiVersion < 1) {
    errors.push({ path: 'sdkApiVersion', message: 'sdkApiVersion must be a positive integer' });
  }

  if (!VALID_KINDS.includes(m.kind as any)) {
    errors.push({ path: 'kind', message: `kind must be one of: ${VALID_KINDS.join(', ')}` });
  }

  if (!VALID_RENDERERS.includes(m.renderer as any)) {
    errors.push({ path: 'renderer', message: `renderer must be one of: ${VALID_RENDERERS.join(', ')}` });
  }

  if (typeof m.description !== 'string') {
    errors.push({ path: 'description', message: 'description must be a string' });
  }

  if (!Array.isArray(m.tags)) {
    errors.push({ path: 'tags', message: 'tags must be an array of strings' });
  }

  if (!VALID_STATUSES.includes(m.status as any)) {
    errors.push({ path: 'status', message: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  if (typeof m.thumbnail !== 'string' || m.thumbnail.trim().length === 0) {
    errors.push({ path: 'thumbnail', message: 'thumbnail must be a non-empty string path' });
  }

  if (typeof m.fallback !== 'string' || m.fallback.trim().length === 0) {
    errors.push({ path: 'fallback', message: 'fallback must be a non-empty string path' });
  }

  if (!m.capabilities || typeof m.capabilities !== 'object') {
    errors.push({ path: 'capabilities', message: 'capabilities must be an object' });
  } else {
    const caps = m.capabilities as Record<string, unknown>;
    if (typeof caps.composable !== 'boolean') {
      errors.push({ path: 'capabilities.composable', message: 'composable must be a boolean' });
    }
    if (typeof caps.interactive !== 'boolean') {
      errors.push({ path: 'capabilities.interactive', message: 'interactive must be a boolean' });
    }
    if (typeof caps.completionEvent !== 'boolean') {
      errors.push({ path: 'capabilities.completionEvent', message: 'completionEvent must be a boolean' });
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: input as EffectManifest };
}
