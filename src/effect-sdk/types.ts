import type { ComponentType } from 'react';

export type EffectKind = 'object3d' | 'background' | 'scene' | 'transition' | 'overlay2d';

export type EffectRenderer = 'r3f' | 'dom' | 'canvas2d';

export type EffectStatus = 'draft' | 'review' | 'approved' | 'needs-fix';

export interface EffectCapabilities {
  composable: boolean;
  interactive: boolean;
  completionEvent: boolean;
  mediaInputs?: string[];
  cameraRig?: boolean;
  glow?: boolean;
}

export interface EffectManifest {
  manifestVersion: number;
  id: string;
  name: string;
  version: string;
  configVersion: number;
  sdkApiVersion: number;
  kind: EffectKind;
  renderer: EffectRenderer;
  description: string;
  tags: string[];
  status: EffectStatus;
  thumbnail: string;
  fallback: string;
  capabilities: EffectCapabilities;
  sharedAssets?: string[];
  licenses?: string[];
}

export interface NumberControl {
  type: 'number';
  label: string;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  description?: string;
}

export interface ToggleControl {
  type: 'toggle';
  label: string;
  description?: string;
}

export interface ColorControl {
  type: 'color';
  label: string;
  description?: string;
}

export interface TextControl {
  type: 'text';
  label: string;
  maxLength?: number;
  placeholder?: string;
  description?: string;
}

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectControl {
  type: 'select';
  label: string;
  options: SelectOption[];
  description?: string;
}

export interface MediaControl {
  type: 'media';
  label: string;
  mediaType: 'image' | 'audio';
  description?: string;
}

export interface GroupControl {
  type: 'group';
  label: string;
  description?: string;
  controls: Record<string, EffectControlDefinition>;
  collapsed?: boolean;
}

export interface RepeaterControl {
  type: 'repeater';
  label: string;
  description?: string;
  min?: number;
  max?: number;
  itemSchema: Record<string, EffectControlDefinition>;
}

export type EffectControlDefinition =
  | NumberControl
  | ToggleControl
  | ColorControl
  | TextControl
  | SelectControl
  | MediaControl
  | GroupControl
  | RepeaterControl;

export type EffectControls<C = any> = {
  [K in keyof C]?: EffectControlDefinition;
} & Record<string, EffectControlDefinition>;

export interface ValidationError {
  path: string;
  message: string;
}

export type ConfigValidationResult<C> =
  | { success: true; data: C }
  | { success: false; errors: ValidationError[] };

export interface ConfigCodec<C> {
  parse: (input: unknown) => ConfigValidationResult<C>;
  migrate?: (fromVersion: number, value: unknown) => C;
}

export interface Preset<C> {
  id: string;
  name: string;
  description?: string;
  config: C;
  isDefault?: boolean;
}

export interface PresentationCamera {
  fov?: number;
  position?: [number, number, number];
  target?: [number, number, number];
}

export interface PresentationLighting {
  ambientIntensity?: number;
  mainLightColor?: string;
  mainLightIntensity?: number;
  mainLightPosition?: [number, number, number];
}

export interface PresentationBackground {
  color?: string;
  transparent?: boolean;
}

export interface PresentationGlow {
  enabled?: boolean;
  intensity?: number;
  color?: string;
}

export interface PresentationConfig {
  camera?: PresentationCamera;
  lighting?: PresentationLighting;
  background?: PresentationBackground;
  quality?: 'low' | 'medium' | 'high';
  glow?: PresentationGlow;
}

export interface MotionClock {
  deltaSeconds: number;
  elapsedSeconds: number;
}

export interface EffectRuntime {
  instanceId: string;
  runId: string;
  quality: 'low' | 'medium' | 'high';
  reducedMotion: boolean;
  isPaused: boolean;
  isVisible: boolean;
  viewport: { width: number; height: number };
  clock: MotionClock;
  speed: number;
  registerGlow?: (id: string, intensity?: number) => void;
  requestCamera?: (rig: unknown) => void;
}

export type EffectEvent =
  | { type: 'complete'; runId: string; payload?: unknown }
  | { type: 'reveal'; runId: string; payload?: unknown }
  | { type: 'interaction'; name: string; payload?: unknown }
  | { type: 'error'; message: string; error?: unknown };

export interface EffectProps<C> {
  config: C;
  runtime: EffectRuntime;
  media: Record<string, string>;
  emit: (event: EffectEvent) => void;
}

export type EffectSceneComponent<C> = ComponentType<EffectProps<C>>;
export type EffectOverlayComponent<C> = ComponentType<EffectProps<C>>;

export interface EffectDefinition<C = any> {
  manifest: EffectManifest;
  configCodec: ConfigCodec<C>;
  defaults: C;
  controls: EffectControls<C>;
  presets: Preset<C>[];
  presentation?: PresentationConfig;
  Scene?: EffectSceneComponent<C>;
  Overlay?: EffectOverlayComponent<C>;
  Editor?: ComponentType<{ config: C; onChange: (c: C) => void }>;
}
