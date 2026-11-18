import type { ConfigCodec, ConfigValidationResult, ValidationError } from '../types';

export function isJsonSerializable(value: unknown, seen = new WeakSet()): boolean {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') {
    return true;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value);
  }
  if (typeof value === 'function' || typeof value === 'symbol' || typeof value === 'undefined') {
    return false;
  }
  if (typeof value === 'object') {
    if (seen.has(value as object)) {
      return false; // circular reference
    }
    seen.add(value as object);
    if (Array.isArray(value)) {
      return value.every((item) => isJsonSerializable(item, seen));
    }
    // Check plain object
    const proto = Object.getPrototypeOf(value);
    if (proto !== null && proto !== Object.prototype) {
      return false; // non-plain object (e.g. Three.js Object, DOM node, etc.)
    }
    for (const key of Object.keys(value)) {
      if (!isJsonSerializable((value as Record<string, unknown>)[key], seen)) {
        return false;
      }
    }
    return true;
  }
  return false;
}

export function createConfigCodec<C>(
  validator: (val: unknown) => { success: true; data: C } | { success: false; errors: ValidationError[] },
  migrate?: (fromVersion: number, val: unknown) => C
): ConfigCodec<C> {
  return {
    parse: (input: unknown): ConfigValidationResult<C> => {
      if (!isJsonSerializable(input)) {
        return {
          success: false,
          errors: [{ path: '', message: 'Config must be purely JSON-serializable (no functions or class instances)' }],
        };
      }
      return validator(input);
    },
    migrate,
  };
}
