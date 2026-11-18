import { createConfigCodec, type ConfigCodec } from '../../effect-sdk';
import sampleCouple from './assets/sample_couple.png';
import samplePhoto1 from './assets/sample_photo_1.png';
import samplePhoto2 from './assets/sample_photo_2.png';
import samplePhoto3 from './assets/sample_photo_3.png';
import samplePhoto4 from './assets/sample_photo_4.png';
import samplePhoto5 from './assets/sample_photo_5.png';
import samplePhoto6 from './assets/sample_photo_6.png';
import samplePhoto7 from './assets/sample_photo_7.png';
import samplePhoto8 from './assets/sample_photo_8.png';
import samplePhoto9 from './assets/sample_photo_9.png';

export interface RoseMemoryItem {
  id: number;
  url: string;
  caption?: string;
  date?: string;
}

export interface SceneDurationsConfig {
  vortex: number;
  heart: number;
  msg1: number;
  msg2: number;
  msg3: number;
  msg4: number;
  photo: number;
  bouquetAssembly: number;
  roseBloom: number;
}

export interface GoldenParticleStoryConfig {
  // Content
  openingText: string;
  greetingMessages: string[];
  finalTitle: string;
  finalSubtitle: string;
  finalMessage: string;
  interactionHint: string;

  // Media
  heartPhoto: string;
  heartPhotoCrop: {
    x: number;
    y: number;
    scale: number;
  };
  rosePhotos: RoseMemoryItem[];
  backgroundMusic: string;

  // Particles
  particleCount: number;
  particleSize: number;
  glowIntensity: number;
  particleSpeed: number;
  dispersionStrength: number;
  particleColor: string;
  particleSeed: number;

  // Bouquet
  roseCount: number;
  roseColor: string;
  bouquetScale: number;
  bloomDuration: number;
  petalDensity: number;
  petalFallSpeed: number;

  // Timeline
  sceneDurations: SceneDurationsConfig;
  playbackSpeed: number;
  autoplay: boolean;
  loop: boolean;
  replayEnabled: boolean;

  // Presentation
  backgroundColor: string;
  goldColor: string;
  textColor: string;
  fontFamily: string;
  quality: 'low' | 'medium' | 'high';
}

export const defaultRosePhotos: RoseMemoryItem[] = [
  { id: 1, url: samplePhoto1, caption: 'Khoảnh khắc đầu tiên ta gặp nhau ♥', date: 'Mùa thu ấy' },
  { id: 2, url: samplePhoto2, caption: 'Nụ cười tỏa nắng ấm áp của anh ♥', date: 'Ngày nắng đẹp' },
  { id: 3, url: samplePhoto3, caption: 'Những chuyến đi đầy ắp tiếng cười ♥', date: 'Chuyến đi xa' },
  { id: 4, url: samplePhoto4, caption: 'Bờ vai vững chãi nhất em từng tựa ♥', date: 'Chiều hoàng hôn' },
  { id: 5, url: samplePhoto5, caption: 'Những ngày bình yên giản đơn bên anh ♥', date: 'Góc quán quen' },
  { id: 6, url: samplePhoto6, caption: 'Từng cái ôm xoa dịu mọi âu lo đời thường ♥', date: 'Đêm se lạnh' },
  { id: 7, url: samplePhoto7, caption: 'Dành trọn vẹn yêu thương chân thành cho anh ♥', date: 'Kỷ niệm đẹp' },
  { id: 8, url: samplePhoto8, caption: 'Cùng nhau đi qua bốn mùa thương nhớ ♥', date: 'Mùa chung đôi' },
  { id: 9, url: samplePhoto9, caption: 'Mãi mãi bên nhau đến suốt cuộc đời này ♥', date: 'Trọn đời yêu' },
];

export const defaults: GoldenParticleStoryConfig = {
  // Content
  openingText: 'Anh Yêu',
  greetingMessages: [
    'Chúc mừng',
    'Ngày Quốc\ntế Nam giới',
    '19 tháng 11',
    'Cảm ơn anh\nvì tất cả',
  ],
  finalTitle: 'Tặng anh bó hoa không bao\ngiờ tàn',
  finalSubtitle: '9 bông hồng ♥ Mãi mãi bên nhau',
  finalMessage: 'Cảm ơn anh vì đã luôn là điểm tựa vững chắc\nvà dịu dàng nhất của em.',
  interactionHint: 'Nhấn vào bông hồng để xem ảnh nhé',

  // Media
  heartPhoto: sampleCouple,
  heartPhotoCrop: {
    x: 0.5,
    y: 0.5,
    scale: 1.0,
  },
  rosePhotos: defaultRosePhotos,
  backgroundMusic: '',

  // Particles
  particleCount: 12000,
  particleSize: 1.5,
  glowIntensity: 0.8,
  particleSpeed: 1.0,
  dispersionStrength: 1.0,
  particleColor: '#f9d976',
  particleSeed: 20261119,

  // Bouquet
  roseCount: 9,
  roseColor: '#b91c1c',
  bouquetScale: 1.0,
  bloomDuration: 2.0,
  petalDensity: 24,
  petalFallSpeed: 1.0,

  // Timeline
  sceneDurations: {
    vortex: 2.2,
    heart: 5.0,
    msg1: 3.6,
    msg2: 4.0,
    msg3: 3.8,
    msg4: 4.0,
    photo: 7.5,
    bouquetAssembly: 3.5,
    roseBloom: 2.2,
  },
  playbackSpeed: 1.0,
  autoplay: true,
  loop: false,
  replayEnabled: true,

  // Presentation
  backgroundColor: '#050508',
  goldColor: '#ffd700',
  textColor: '#ffffff',
  fontFamily: "'Comfortaa', 'Dancing Script', cursive, sans-serif",
  quality: 'high',
};

export const configCodec: ConfigCodec<GoldenParticleStoryConfig> = createConfigCodec<GoldenParticleStoryConfig>(
  (input: unknown) => {
    if (!input || typeof input !== 'object') {
      return { success: false, errors: [{ path: '', message: 'Config must be an object' }] };
    }

    const obj = input as Partial<GoldenParticleStoryConfig> & Record<string, any>;

    // Sanitize string helpers
    const str = (val: unknown, fallback: string, maxLen = 300): string =>
      typeof val === 'string' && val.trim().length > 0 ? val.slice(0, maxLen) : fallback;

    const num = (val: unknown, fallback: number, min = -Infinity, max = Infinity): number =>
      typeof val === 'number' && Number.isFinite(val) ? Math.min(Math.max(val, min), max) : fallback;

    const bool = (val: unknown, fallback: boolean): boolean =>
      typeof val === 'boolean' ? val : fallback;

    // Greeting messages
    const greetingMessages = Array.isArray(obj.greetingMessages) && obj.greetingMessages.length > 0
      ? obj.greetingMessages.map((m: unknown, i: number) =>
          typeof m === 'string' && m.trim().length > 0
            ? m.slice(0, 100)
            : defaults.greetingMessages[i] || 'Yêu anh'
        )
      : defaults.greetingMessages;

    // Heart photo crop
    const cropObj = (obj.heartPhotoCrop && typeof obj.heartPhotoCrop === 'object')
      ? (obj.heartPhotoCrop as Record<string, any>)
      : {};
    const heartPhotoCrop = {
      x: num(cropObj.x, defaults.heartPhotoCrop.x, 0, 1),
      y: num(cropObj.y, defaults.heartPhotoCrop.y, 0, 1),
      scale: num(cropObj.scale, defaults.heartPhotoCrop.scale, 0.5, 3.0),
    };

    // Rose photos array
    let rosePhotos: RoseMemoryItem[] = defaults.rosePhotos;
    if (Array.isArray(obj.rosePhotos) && obj.rosePhotos.length > 0) {
      rosePhotos = obj.rosePhotos.map((item: any, idx: number) => {
        const defaultItem = defaults.rosePhotos[idx] || defaults.rosePhotos[0];
        if (typeof item === 'string') {
          return {
            id: idx + 1,
            url: item,
            caption: defaultItem.caption,
            date: defaultItem.date,
          };
        }
        return {
          id: typeof item?.id === 'number' ? item.id : idx + 1,
          url: typeof item?.url === 'string' && item.url ? item.url : defaultItem.url,
          caption: typeof item?.caption === 'string' ? item.caption : defaultItem.caption,
          date: typeof item?.date === 'string' ? item.date : defaultItem.date,
        };
      });
    }

    // Scene durations
    const durObj = (obj.sceneDurations && typeof obj.sceneDurations === 'object')
      ? (obj.sceneDurations as Record<string, any>)
      : {};
    const sceneDurations: SceneDurationsConfig = {
      vortex: num(durObj.vortex, defaults.sceneDurations.vortex, 0.5, 10),
      heart: num(durObj.heart, defaults.sceneDurations.heart, 1.0, 15),
      msg1: num(durObj.msg1, defaults.sceneDurations.msg1, 1.0, 10),
      msg2: num(durObj.msg2, defaults.sceneDurations.msg2, 1.0, 10),
      msg3: num(durObj.msg3, defaults.sceneDurations.msg3, 1.0, 10),
      msg4: num(durObj.msg4, defaults.sceneDurations.msg4, 1.0, 10),
      photo: num(durObj.photo, defaults.sceneDurations.photo, 2.0, 20),
      bouquetAssembly: num(durObj.bouquetAssembly, defaults.sceneDurations.bouquetAssembly, 1.0, 10),
      roseBloom: num(durObj.roseBloom, defaults.sceneDurations.roseBloom, 0.5, 10),
    };

    const qualityVal = obj.quality === 'low' || obj.quality === 'medium' || obj.quality === 'high'
      ? obj.quality
      : defaults.quality;

    const data: GoldenParticleStoryConfig = {
      openingText: str(obj.openingText, defaults.openingText, 40),
      greetingMessages,
      finalTitle: str(obj.finalTitle, defaults.finalTitle, 100),
      finalSubtitle: str(obj.finalSubtitle, defaults.finalSubtitle, 80),
      finalMessage: str(obj.finalMessage, defaults.finalMessage, 250),
      interactionHint: str(obj.interactionHint, defaults.interactionHint, 80),

      heartPhoto: str(obj.heartPhoto, defaults.heartPhoto, 1000),
      heartPhotoCrop,
      rosePhotos,
      backgroundMusic: typeof obj.backgroundMusic === 'string' ? obj.backgroundMusic : '',

      particleCount: num(obj.particleCount, defaults.particleCount, 2000, 30000),
      particleSize: num(obj.particleSize, defaults.particleSize, 0.5, 5.0),
      glowIntensity: num(obj.glowIntensity, defaults.glowIntensity, 0.0, 2.0),
      particleSpeed: num(obj.particleSpeed, defaults.particleSpeed, 0.2, 3.0),
      dispersionStrength: num(obj.dispersionStrength, defaults.dispersionStrength, 0.0, 3.0),
      particleColor: typeof obj.particleColor === 'string' ? obj.particleColor : defaults.particleColor,
      particleSeed: num(obj.particleSeed, defaults.particleSeed, 0, 99999999),

      roseCount: num(obj.roseCount, defaults.roseCount, 1, 12),
      roseColor: typeof obj.roseColor === 'string' ? obj.roseColor : defaults.roseColor,
      bouquetScale: num(obj.bouquetScale, defaults.bouquetScale, 0.5, 1.6),
      bloomDuration: num(obj.bloomDuration, defaults.bloomDuration, 0.5, 5.0),
      petalDensity: num(obj.petalDensity, defaults.petalDensity, 10, 50),
      petalFallSpeed: num(obj.petalFallSpeed, defaults.petalFallSpeed, 0.2, 3.0),

      sceneDurations,
      playbackSpeed: num(obj.playbackSpeed, defaults.playbackSpeed, 0.25, 2.5),
      autoplay: bool(obj.autoplay, defaults.autoplay),
      loop: bool(obj.loop, defaults.loop),
      replayEnabled: bool(obj.replayEnabled, defaults.replayEnabled),

      backgroundColor: typeof obj.backgroundColor === 'string' ? obj.backgroundColor : defaults.backgroundColor,
      goldColor: typeof obj.goldColor === 'string' ? obj.goldColor : defaults.goldColor,
      textColor: typeof obj.textColor === 'string' ? obj.textColor : defaults.textColor,
      fontFamily: typeof obj.fontFamily === 'string' ? obj.fontFamily : defaults.fontFamily,
      quality: qualityVal,
    };

    return {
      success: true,
      data,
    };
  },
  (_fromVersion: number, value: unknown) => {
    return value as GoldenParticleStoryConfig;
  }
);
