// Public Effect SDK API
export type {
  EffectKind,
  EffectRenderer,
  EffectStatus,
  EffectCapabilities,
  EffectManifest,
  NumberControl,
  ToggleControl,
  ColorControl,
  TextControl,
  SelectOption,
  SelectControl,
  MediaControl,
  GroupControl,
  RepeaterControl,
  EffectControlDefinition,
  EffectControls,
  ValidationError,
  ConfigValidationResult,
  ConfigCodec,
  Preset,
  PresentationCamera,
  PresentationLighting,
  PresentationBackground,
  PresentationGlow,
  PresentationConfig,
  MotionClock,
  EffectRuntime,
  EffectEvent,
  EffectProps,
  EffectSceneComponent,
  EffectOverlayComponent,
  EffectDefinition,
} from './types';

export { defineEffect } from './defineEffect';
export { validateManifest } from './validation/manifestValidator';
export { createConfigCodec, isJsonSerializable } from './validation/configValidator';
export { useEffectFrame, type EffectFrameCallback, type EffectFrameCallbackInfo } from './hooks/useEffectFrame';
export { useMediaCleanup, resolveMediaUrl } from './hooks/useMedia';
export {
  lerp,
  easeInOutQuad,
  easeOutCubic,
  easeOutBack,
  createSeededRandom,
  wrapRange,
} from './hooks/useMotionMath';
