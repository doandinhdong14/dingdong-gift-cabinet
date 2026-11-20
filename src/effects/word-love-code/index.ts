import { defineEffect } from '../../effect-sdk';
import manifest from './manifest.json';
import { configCodec, defaults } from './config';
import { controls } from './controls';
import { presets } from './presets';
import { presentation } from './presentation';
import { Scene } from './Scene';
import { Overlay } from './Overlay';

export default defineEffect({
  manifest: manifest as any,
  configCodec,
  defaults,
  controls,
  presets,
  presentation,
  Scene,
  Overlay,
});
