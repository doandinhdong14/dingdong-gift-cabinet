import { defineEffect } from '../../effect-sdk';
import manifest from './manifest.json';
import { configCodec, defaults, type VintageCalendarConfig } from './config';
import { controls } from './controls';
import { presets } from './presets';
import { presentation } from './presentation';
import { Overlay } from './Overlay';

export default defineEffect<VintageCalendarConfig>({
  manifest: manifest as any,
  configCodec,
  defaults,
  controls,
  presets,
  presentation,
  Overlay,
});
