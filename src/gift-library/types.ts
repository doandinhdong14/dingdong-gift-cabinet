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
  driftEnabled?: boolean; // Bật rơi riêng cho nhóm này (mặc định: true)
  driftSpeed?: number;    // Tốc độ rơi riêng: 0 - 3 đơn vị scene/giây (bước 0.05)
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

  // Scene-wide drift controls
  driftEnabled?: boolean;           // Bật/tắt rơi toàn cảnh
  driftSpeed?: number;              // (Legacy / fallback: 0.35)
  globalSpeedMultiplier?: number;   // Hệ số tốc độ chung (0 - 2, mặc định 1.0)

  // Independent group drift controls
  textDriftEnabled?: boolean;       // Bật rơi chữ (mặc định: true)
  textDriftSpeed?: number;          // Tốc độ rơi chữ (0 - 3 đơn vị scene/s, bước 0.05)

  photoDriftEnabled?: boolean;      // Bật rơi ảnh (mặc định: true)
  photoDriftSpeed?: number;         // Tốc độ rơi ảnh (0 - 3 đơn vị scene/s, bước 0.05)

  heartDriftEnabled?: boolean;      // Bật rơi trái tim chính (mặc định: true)
  heartDriftSpeed?: number;         // Tốc độ rơi trái tim chính (0 - 3 đơn vị scene/s, bước 0.05)

  // New decorative objects
  decorations?: UniverseDecorationGroup[];
}

export interface RoseRevealConfig {
  petalColor: string;
  petalInnerColor: string;
  petalEdgeColor: string;
  stemColor: string;
  backgroundColor: string;
  flowerScale: number;
  bloomDuration: number;
  flyingPetalsCount: number;
  burstSpeed: number;
  fallSpeed: number;
  spinSpeed: number;
  ambientLightIntensity: number;
  messageText: string;
  buttonText: string;
  destinationTarget: 'demo-card' | 'love-universe-01';
  manualBloomProgress?: number;
  inspectionMode?: boolean;
}

export interface Card11Config {
  text: string;
  phrases: string[];
  itemCount: number;
  speed: number;
  heartScale: number;
  depth3D: number;
  textColor: string;
  glowColor: string;
  glowIntensity: number;
  secondaryColor?: string;
  useAlternatingColors: boolean;
  backgroundColor: string;
  orientationMode: 'tangent' | 'billboard';
  trajectoryMode: 'original-matrix' | 'smooth-3d';
  autoRotate: boolean;
  autoRotateSpeed: number;
  tiltAngleDeg: number;
  fontSize: number;
}

export interface AssetConfig {
  schemaVersion: 1;
  assetId: string;
  assetVersion: string;
  appearance: AssetAppearance;
  transform: AssetTransform;
  motion: AssetMotion;
  universe?: UniverseConfig;
  roseReveal?: RoseRevealConfig;
  card11?: Card11Config;
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
