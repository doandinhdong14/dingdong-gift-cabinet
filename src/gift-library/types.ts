export type AssetStatus = 'draft' | 'review' | 'approved';

export interface AssetManifest {
  schemaVersion: 1;
  id: string;                 // e.g. heart-01; unique, immutable
  name: string;               // Display name, e.g. Trái tim mẫu 1
  version: string;            // Semantic versioning, e.g. 0.1.0
  category: string;           // Category e.g. Trái tim, Phong bì, Hộp quà, Máy bay, Trang trí
  kind: '3d' | '2d';
  description: string;
  tags: string[];
  status: AssetStatus;
  thumbnail: string;
  fallback: string;
  source: 'procedural' | 'model' | 'svg';
  license: string;
  author: string;
  dependencies: string[];
  supportedMotions: string[];
}

export interface AssetAppearance {
  color: string;
  roughness: number;
  metalness: number;
}

export interface AssetTransform {
  scale: number;
  rotationDeg: [number, number, number];
}

export interface FloatMotionConfig {
  enabled: boolean;
  amplitude: number;
  speed: number;
}

export interface HeartbeatMotionConfig {
  enabled: boolean;
  strength: number;
  bpm: number;
}

export interface SpinMotionConfig {
  enabled: boolean;
  speedDegPerSecond: number;
}

export interface AssetMotion {
  float: FloatMotionConfig;
  heartbeat: HeartbeatMotionConfig;
  spin: SpinMotionConfig;
}

export interface UniverseDecorationGroup {
  id: string;
  type: 'heart' | 'star3d' | 'giftbox';
  name: string;
  count: number;
  color: string;
  scale: number;        // 0.5 - 2.0
  spinSpeed: number;    // 0 - 5.0
  roughness?: number;   // 0.1 - 0.9
  enabled: boolean;
}

export interface UniverseConfig {
  wishes: string[];
  textCount: number;
  photoCount: number;
  heartCount: number;
  cloudWidth: number;
  cloudHeight: number;
  cloudDepth: number;
  rotationSpeed: number;
  textColor: string;
  glowIntensity: number;
  heartColor: string;
  seed: number;
  showIntro: boolean;
  savedImageIds?: string[];

  // New text lighting controls
  glowEnabled?: boolean;
  glowSpread?: number;
  glowColor?: string;
  textScaleFactor?: number;

  // New photo scale controls
  photoScaleFactor?: number;

  // New heart controls
  heartScaleFactor?: number;
  heartRoughness?: number;
  heartSpinSpeed?: number;
  heartFloatAmp?: number;

  // New downward drift scene motion controls
  driftEnabled?: boolean;
  driftSpeed?: number;

  // New decorative objects
  decorations?: UniverseDecorationGroup[];
}

export interface AssetConfig {
  schemaVersion: 1;
  assetId: string;
  assetVersion: string;
  appearance: AssetAppearance;
  transform: AssetTransform;
  motion: AssetMotion;
  universe?: UniverseConfig;
}

export interface Preset {
  id: string;
  name: string;
  assetId: string;
  assetVersion: string;
  config: AssetConfig;
  createdAt: string;
  updatedAt: string;
  isBuiltIn?: boolean;
}

export interface RegistryEntry {
  manifest: AssetManifest;
  loadComponent: () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>;
  defaultConfig: AssetConfig;
  defaultPresets: Preset[];
}

export interface ExportData {
  version: 1;
  type: 'dingdong-preset-export' | 'dingdong-config-export';
  exportedAt: string;
  data: Preset[] | AssetConfig;
}
