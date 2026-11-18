import { createConfigCodec, type ConfigCodec } from '../../effect-sdk';

export interface VintageCalendarConfig {
  year: number;
  startDate: string;
  targetDate: string;
  targetLabel: string;
  finalMessage: string;
  backgroundColor: string;
  calendarColor: string;
  paperColor: string;
  accentColor: string;
  animationSpeed: number;
  flipDuration: number;
  flipInterval: number;
  curlIntensity: number;
  paperStiffness: number;
  heartDrawDuration: number;
  heartParticleCount: number;
  particleIntensity: number;
  autoplay: boolean;
  showStartButton: boolean;
  quality: 'low' | 'medium' | 'high';
}

export const defaults: VintageCalendarConfig = {
  year: 2026,
  startDate: '2026-11-15',
  targetDate: '2026-11-19',
  targetLabel: 'Ngày Quốc tế Nam giới',
  finalMessage: 'Ngày của anh ♥',
  backgroundColor: '#120308',
  calendarColor: '#8f182b',
  paperColor: '#fbf7ee',
  accentColor: '#e82855',
  animationSpeed: 1.0,
  flipDuration: 0.42,
  flipInterval: 0.12,
  curlIntensity: 0.65,
  paperStiffness: 0.55,
  heartDrawDuration: 0.60,
  heartParticleCount: 15,
  particleIntensity: 0.5,
  autoplay: false,
  showStartButton: true,
  quality: 'high',
};

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

export const configCodec: ConfigCodec<VintageCalendarConfig> = createConfigCodec<VintageCalendarConfig>(
  (input: unknown) => {
    if (!input || typeof input !== 'object') {
      return { success: false, errors: [{ path: '', message: 'Config must be an object' }] };
    }

    const obj = input as Record<string, unknown>;

    const year = typeof obj.year === 'number' && Number.isFinite(obj.year) ? obj.year : defaults.year;
    const startDate = typeof obj.startDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(obj.startDate)
      ? obj.startDate
      : defaults.startDate;
    const targetDate = typeof obj.targetDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(obj.targetDate)
      ? obj.targetDate
      : defaults.targetDate;
    const targetLabel = typeof obj.targetLabel === 'string' ? obj.targetLabel.slice(0, 100) : defaults.targetLabel;
    const finalMessage = typeof obj.finalMessage === 'string' ? obj.finalMessage.slice(0, 100) : defaults.finalMessage;

    const backgroundColor = typeof obj.backgroundColor === 'string' && HEX_COLOR_REGEX.test(obj.backgroundColor)
      ? obj.backgroundColor
      : defaults.backgroundColor;
    const calendarColor = typeof obj.calendarColor === 'string' && HEX_COLOR_REGEX.test(obj.calendarColor)
      ? obj.calendarColor
      : defaults.calendarColor;
    const paperColor = typeof obj.paperColor === 'string' && HEX_COLOR_REGEX.test(obj.paperColor)
      ? obj.paperColor
      : defaults.paperColor;
    const accentColor = typeof obj.accentColor === 'string' && HEX_COLOR_REGEX.test(obj.accentColor)
      ? obj.accentColor
      : defaults.accentColor;

    const animationSpeed = typeof obj.animationSpeed === 'number' && Number.isFinite(obj.animationSpeed)
      ? Math.max(0.5, Math.min(2.0, obj.animationSpeed))
      : defaults.animationSpeed;
    const flipDuration = typeof obj.flipDuration === 'number' && Number.isFinite(obj.flipDuration)
      ? Math.max(0.2, Math.min(1.0, obj.flipDuration))
      : defaults.flipDuration;
    const flipInterval = typeof obj.flipInterval === 'number' && Number.isFinite(obj.flipInterval)
      ? Math.max(0.05, Math.min(0.8, obj.flipInterval))
      : defaults.flipInterval;
    const curlIntensity = typeof obj.curlIntensity === 'number' && Number.isFinite(obj.curlIntensity)
      ? Math.max(0.2, Math.min(1.0, obj.curlIntensity))
      : defaults.curlIntensity;
    const paperStiffness = typeof obj.paperStiffness === 'number' && Number.isFinite(obj.paperStiffness)
      ? Math.max(0.2, Math.min(0.9, obj.paperStiffness))
      : defaults.paperStiffness;
    const heartDrawDuration = typeof obj.heartDrawDuration === 'number' && Number.isFinite(obj.heartDrawDuration)
      ? Math.max(0.2, Math.min(2.0, obj.heartDrawDuration))
      : defaults.heartDrawDuration;
    const heartParticleCount = typeof obj.heartParticleCount === 'number' && Number.isFinite(obj.heartParticleCount)
      ? Math.max(0, Math.min(40, Math.round(obj.heartParticleCount)))
      : defaults.heartParticleCount;
    const particleIntensity = typeof obj.particleIntensity === 'number' && Number.isFinite(obj.particleIntensity)
      ? Math.max(0.0, Math.min(1.0, obj.particleIntensity))
      : defaults.particleIntensity;

    const autoplay = typeof obj.autoplay === 'boolean' ? obj.autoplay : defaults.autoplay;
    const showStartButton = typeof obj.showStartButton === 'boolean' ? obj.showStartButton : defaults.showStartButton;

    const quality = obj.quality === 'low' || obj.quality === 'medium' || obj.quality === 'high'
      ? obj.quality
      : defaults.quality;

    return {
      success: true,
      data: {
        year,
        startDate,
        targetDate,
        targetLabel,
        finalMessage,
        backgroundColor,
        calendarColor,
        paperColor,
        accentColor,
        animationSpeed,
        flipDuration,
        flipInterval,
        curlIntensity,
        paperStiffness,
        heartDrawDuration,
        heartParticleCount,
        particleIntensity,
        autoplay,
        showStartButton,
        quality,
      },
    };
  },
  (_fromVersion: number, value: unknown) => {
    return value as VintageCalendarConfig;
  }
);
