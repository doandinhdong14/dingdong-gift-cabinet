import { createConfigCodec, type ConfigCodec } from '../../effect-sdk';
import samplePhoto1 from './assets/sample_photo_1.png';
import samplePhoto2 from './assets/sample_photo_2.png';
import samplePhoto3 from './assets/sample_photo_3.png';
import samplePhoto4 from './assets/sample_photo_4.png';
import samplePhoto5 from './assets/sample_photo_5.png';
import samplePhoto6 from './assets/sample_photo_6.png';

export interface PhotoItem {
  id: string;
  url: string;
  cropX?: number; // 0 to 100%
  cropY?: number; // 0 to 100%
  customRotation?: number; // -30 to 30 deg
  customScale?: number; // 0.8 to 1.3
}

export interface EffectConfig {
  photos: PhotoItem[];
  bouquetScale: number;
  holdDuration: number; // in seconds
  burstSpeed: number; // multiplier
  burstSpread: number; // horizontal fanning multiplier
  burstRotation: number; // rotation multiplier
  ringColor: string; // hex color for charging ring
  enableStars: boolean;
  starDensity: number; // particle count
  starSpeed: number; // drift velocity multiplier
  glowIntensity: number; // aura brightness
  guideTextIdle: string;
  guideTextReady: string;
}

export const defaultPhotos: PhotoItem[] = [
  { id: 'photo-1', url: samplePhoto1, cropX: 50, cropY: 45, customRotation: -8, customScale: 1.0 },
  { id: 'photo-2', url: samplePhoto2, cropX: 50, cropY: 40, customRotation: 2, customScale: 1.05 },
  { id: 'photo-3', url: samplePhoto3, cropX: 50, cropY: 45, customRotation: 8, customScale: 1.0 },
  { id: 'photo-4', url: samplePhoto4, cropX: 50, cropY: 45, customRotation: -13, customScale: 0.98 },
  { id: 'photo-5', url: samplePhoto5, cropX: 50, cropY: 40, customRotation: 0, customScale: 1.08 },
  { id: 'photo-6', url: samplePhoto6, cropX: 50, cropY: 45, customRotation: 11, customScale: 0.98 },
];

export const defaults: EffectConfig = {
  photos: defaultPhotos,
  bouquetScale: 1.0,
  holdDuration: 1.8,
  burstSpeed: 1.0,
  burstSpread: 1.0,
  burstRotation: 1.0,
  ringColor: '#f472b6',
  enableStars: true,
  starDensity: 150,
  starSpeed: 0.6,
  glowIntensity: 1.0,
  guideTextIdle: 'Chạm vào bó hoa',
  guideTextReady: 'Ấn giữ bó hoa để tung những kỷ niệm',
};

function sanitizePhoto(item: unknown, index: number): PhotoItem {
  if (!item || typeof item !== 'object') {
    return defaultPhotos[index % defaultPhotos.length];
  }
  const obj = item as Record<string, unknown>;
  const id = typeof obj.id === 'string' && obj.id ? obj.id : `photo-${index + 1}`;
  const url = typeof obj.url === 'string' && obj.url ? obj.url : defaultPhotos[index % defaultPhotos.length].url;
  const cropX = typeof obj.cropX === 'number' && Number.isFinite(obj.cropX) ? Math.max(0, Math.min(100, obj.cropX)) : 50;
  const cropY = typeof obj.cropY === 'number' && Number.isFinite(obj.cropY) ? Math.max(0, Math.min(100, obj.cropY)) : 50;
  const customRotation = typeof obj.customRotation === 'number' && Number.isFinite(obj.customRotation)
    ? Math.max(-45, Math.min(45, obj.customRotation))
    : 0;
  const customScale = typeof obj.customScale === 'number' && Number.isFinite(obj.customScale)
    ? Math.max(0.5, Math.min(2.0, obj.customScale))
    : 1.0;

  return { id, url, cropX, cropY, customRotation, customScale };
}

export const configCodec: ConfigCodec<EffectConfig> = createConfigCodec<EffectConfig>(
  (input: unknown) => {
    if (!input || typeof input !== 'object') {
      return { success: false, errors: [{ path: '', message: 'Config must be an object' }] };
    }

    const obj = input as Record<string, unknown>;

    let photos = defaults.photos;
    if (Array.isArray(obj.photos) && obj.photos.length > 0) {
      photos = obj.photos.slice(0, 6).map((p, idx) => sanitizePhoto(p, idx));
    }

    const bouquetScale = typeof obj.bouquetScale === 'number' && Number.isFinite(obj.bouquetScale)
      ? Math.max(0.6, Math.min(1.5, obj.bouquetScale))
      : defaults.bouquetScale;

    const holdDuration = typeof obj.holdDuration === 'number' && Number.isFinite(obj.holdDuration)
      ? Math.max(0.8, Math.min(4.0, obj.holdDuration))
      : defaults.holdDuration;

    const burstSpeed = typeof obj.burstSpeed === 'number' && Number.isFinite(obj.burstSpeed)
      ? Math.max(0.5, Math.min(2.5, obj.burstSpeed))
      : defaults.burstSpeed;

    const burstSpread = typeof obj.burstSpread === 'number' && Number.isFinite(obj.burstSpread)
      ? Math.max(0.4, Math.min(2.5, obj.burstSpread))
      : defaults.burstSpread;

    const burstRotation = typeof obj.burstRotation === 'number' && Number.isFinite(obj.burstRotation)
      ? Math.max(0.0, Math.min(2.5, obj.burstRotation))
      : defaults.burstRotation;

    const ringColor = typeof obj.ringColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(obj.ringColor)
      ? obj.ringColor
      : defaults.ringColor;

    const enableStars = typeof obj.enableStars === 'boolean' ? obj.enableStars : defaults.enableStars;

    const starDensity = typeof obj.starDensity === 'number' && Number.isFinite(obj.starDensity)
      ? Math.max(30, Math.min(300, Math.round(obj.starDensity)))
      : defaults.starDensity;

    const starSpeed = typeof obj.starSpeed === 'number' && Number.isFinite(obj.starSpeed)
      ? Math.max(0.0, Math.min(3.0, obj.starSpeed))
      : defaults.starSpeed;

    const glowIntensity = typeof obj.glowIntensity === 'number' && Number.isFinite(obj.glowIntensity)
      ? Math.max(0.0, Math.min(2.5, obj.glowIntensity))
      : defaults.glowIntensity;

    const guideTextIdle = typeof obj.guideTextIdle === 'string' && obj.guideTextIdle.trim()
      ? obj.guideTextIdle.slice(0, 80)
      : defaults.guideTextIdle;

    const guideTextReady = typeof obj.guideTextReady === 'string' && obj.guideTextReady.trim()
      ? obj.guideTextReady.slice(0, 100)
      : defaults.guideTextReady;

    return {
      success: true,
      data: {
        photos,
        bouquetScale,
        holdDuration,
        burstSpeed,
        burstSpread,
        burstRotation,
        ringColor,
        enableStars,
        starDensity,
        starSpeed,
        glowIntensity,
        guideTextIdle,
        guideTextReady,
      },
    };
  },
  (_fromVersion: number, value: unknown) => {
    return value as EffectConfig;
  }
);
