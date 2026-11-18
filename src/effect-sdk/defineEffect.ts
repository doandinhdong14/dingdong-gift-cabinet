import type { EffectDefinition } from './types';
import { validateManifest } from './validation/manifestValidator';

export function defineEffect<C>(definition: EffectDefinition<C>): EffectDefinition<C> {
  const manifestValidation = validateManifest(definition.manifest);
  if (!manifestValidation.success) {
    const errorMsg = manifestValidation.errors.map((e) => `[${e.path}]: ${e.message}`).join(', ');
    console.error(`Invalid manifest for effect "${(definition.manifest as any)?.id || 'unknown'}": ${errorMsg}`);
  }

  // Validate defaults
  const defaultValidation = definition.configCodec.parse(definition.defaults);
  if (!defaultValidation.success) {
    const err = defaultValidation.errors.map((e) => `[${e.path}]: ${e.message}`).join(', ');
    console.warn(`Default config for effect "${definition.manifest?.id}" failed validation: ${err}`);
  }

  // Validate presets
  if (Array.isArray(definition.presets)) {
    for (const preset of definition.presets) {
      const pVal = definition.configCodec.parse(preset.config);
      if (!pVal.success) {
        const err = pVal.errors.map((e) => `[${e.path}]: ${e.message}`).join(', ');
        console.warn(`Preset "${preset.name}" (${preset.id}) for effect "${definition.manifest?.id}" failed validation: ${err}`);
      }
    }
  }

  return definition;
}
