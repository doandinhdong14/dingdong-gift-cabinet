import { AssetConfig, Preset } from '../../types';

export const devBoxDefaultConfig: AssetConfig = {
  schemaVersion: 1,
  assetId: 'dev-box-fixture',
  assetVersion: '0.1.0',
  appearance: {
    color: '#8A63D2',
    roughness: 0.35,
    metalness: 0.1,
  },
  transform: {
    scale: 1,
    rotationDeg: [5, -15, 0],
  },
  motion: {
    float: {
      enabled: true,
      amplitude: 0.08,
      speed: 0.35,
    },
    heartbeat: {
      enabled: false,
      strength: 0.04,
      bpm: 72,
    },
    spin: {
      enabled: false,
      speedDegPerSecond: 15,
    },
  },
};

export const devBoxPresets: Preset[] = [
  {
    id: 'dev-preset-default',
    name: 'Tím studio (Mặc định)',
    assetId: 'dev-box-fixture',
    assetVersion: '0.1.0',
    config: devBoxDefaultConfig,
    createdAt: '2026-11-16T00:00:00.000Z',
    updatedAt: '2026-11-16T00:00:00.000Z',
    isBuiltIn: true,
  },
  {
    id: 'dev-preset-coral',
    name: 'Hồng san hô satin',
    assetId: 'dev-box-fixture',
    assetVersion: '0.1.0',
    config: {
      ...devBoxDefaultConfig,
      appearance: {
        color: '#F46C91',
        roughness: 0.32,
        metalness: 0.0,
      },
    },
    createdAt: '2026-11-16T00:00:00.000Z',
    updatedAt: '2026-11-16T00:00:00.000Z',
    isBuiltIn: true,
  },
  {
    id: 'dev-preset-metallic',
    name: 'Xanh ngọc kim loại',
    assetId: 'dev-box-fixture',
    assetVersion: '0.1.0',
    config: {
      ...devBoxDefaultConfig,
      appearance: {
        color: '#2DD4BF',
        roughness: 0.2,
        metalness: 0.25,
      },
      motion: {
        ...devBoxDefaultConfig.motion,
        spin: { enabled: true, speedDegPerSecond: 20 },
      },
    },
    createdAt: '2026-11-16T00:00:00.000Z',
    updatedAt: '2026-11-16T00:00:00.000Z',
    isBuiltIn: true,
  },
];
