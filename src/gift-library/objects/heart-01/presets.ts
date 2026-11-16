import { AssetConfig, Preset } from '../../types';

export const heart01DefaultConfig: AssetConfig = {
  schemaVersion: 1,
  assetId: 'heart-01',
  assetVersion: '0.1.0',
  appearance: {
    color: '#F46C91',
    roughness: 0.32,
    metalness: 0.0,
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

export const heart01Presets: Preset[] = [
  {
    id: 'heart-01-preset-soft-pink',
    name: 'Hồng dịu (Mặc định)',
    assetId: 'heart-01',
    assetVersion: '0.1.0',
    config: heart01DefaultConfig,
    createdAt: '2026-11-16T00:00:00.000Z',
    updatedAt: '2026-11-16T00:00:00.000Z',
    isBuiltIn: true,
  },
  {
    id: 'heart-01-preset-passion-red',
    name: 'Đỏ yêu thương',
    assetId: 'heart-01',
    assetVersion: '0.1.0',
    config: {
      ...heart01DefaultConfig,
      appearance: {
        color: '#E84C65',
        roughness: 0.4,
        metalness: 0.0,
      },
    },
    createdAt: '2026-11-16T00:00:00.000Z',
    updatedAt: '2026-11-16T00:00:00.000Z',
    isBuiltIn: true,
  },
  {
    id: 'heart-01-preset-dreamy-purple',
    name: 'Tím mộng mơ',
    assetId: 'heart-01',
    assetVersion: '0.1.0',
    config: {
      ...heart01DefaultConfig,
      appearance: {
        color: '#B58CEB',
        roughness: 0.35,
        metalness: 0.0,
      },
    },
    createdAt: '2026-11-16T00:00:00.000Z',
    updatedAt: '2026-11-16T00:00:00.000Z',
    isBuiltIn: true,
  },
];
