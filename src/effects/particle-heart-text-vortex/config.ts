import { createConfigCodec, type ConfigCodec } from '../../effect-sdk';

export interface EffectConfig {
  // Trái tim hạt sáng
  heartScale: number;
  heartParticleCount: number;
  heartParticleSize: number;
  heartPrimaryColor: string;
  heartGlowColor: string;
  heartCoreBrightness: number;
  heartPulseSpeed: number;
  heartPulseAmplitude: number;
  heartJitterStrength: number;

  // Đế chữ xoay
  diskRadius: number;
  diskRingCount: number;
  diskFontSize: number;
  diskTextColor: string;
  diskAccentColor: string;
  diskSpeed: number;
  diskVerticalGap: number;
  diskMessages: string;

  // Luồng ký tự nối giữa tim và đế
  streamEnabled: boolean;
  streamDensity: number;
  streamSpeed: number;
  streamSpread: number;

  // Nền & Hậu cảnh
  backgroundColor: string;
  starDustEnabled: boolean;
  starDustCount: number;
}

export const defaults: EffectConfig = {
  // Trái tim hạt sáng (Hạt mịn, chấm nhỏ tròn, không gai/lông)
  heartScale: 1.0,
  heartParticleCount: 11000,
  heartParticleSize: 1.2,
  heartPrimaryColor: '#e02874',
  heartGlowColor: '#f472b6',
  heartCoreBrightness: 0.9,
  heartPulseSpeed: 0.7,
  heartPulseAmplitude: 0.02,
  heartJitterStrength: 1.0,

  // Đế chữ xoay (10 vòng đồng tâm dày dặn, có chiều sâu phối cảnh)
  diskRadius: 1.55,
  diskRingCount: 10,
  diskFontSize: 16,
  diskTextColor: '#fff5fa',
  diskAccentColor: '#ff4d8d',
  diskSpeed: 0.65,
  diskVerticalGap: 2.15,
  diskMessages: 'Công chúa của anh | Mừng ngày 20/10 | Người con gái tuyệt nhất | Yêu em nhiều lắm | Luôn xinh đẹp và hạnh phúc | Mãi mãi bên nhau | 20/10 ngọt ngào | Nụ cười của em | Hạnh phúc mỗi ngày | Dành trọn cho em',

  // Luồng ký tự nối giữa tim và đế (tản nhẹ, không thành ống cứng)
  streamEnabled: true,
  streamDensity: 45,
  streamSpeed: 1.0,
  streamSpread: 0.35,

  // Nền & Hậu cảnh
  backgroundColor: '#05030a',
  starDustEnabled: true,
  starDustCount: 300,
};

function isValidHexColor(val: unknown): boolean {
  return typeof val === 'string' && /^#[0-9a-fA-F]{6}$/.test(val);
}

function clampNumber(val: unknown, min: number, max: number, fallback: number): number {
  if (typeof val !== 'number' || !Number.isFinite(val)) return fallback;
  return Math.min(Math.max(val, min), max);
}

export const configCodec: ConfigCodec<EffectConfig> = createConfigCodec<EffectConfig>(
  (input: unknown) => {
    if (!input || typeof input !== 'object') {
      return { success: false, errors: [{ path: '', message: 'Config must be an object' }] };
    }

    const obj = input as Record<string, unknown>;

    const data: EffectConfig = {
      // Trái tim
      heartScale: clampNumber(obj.heartScale, 0.4, 2.5, defaults.heartScale),
      heartParticleCount: Math.round(clampNumber(obj.heartParticleCount, 500, 25000, defaults.heartParticleCount)),
      heartParticleSize: clampNumber(obj.heartParticleSize, 0.4, 3.5, defaults.heartParticleSize),
      heartPrimaryColor: isValidHexColor(obj.heartPrimaryColor) ? (obj.heartPrimaryColor as string) : defaults.heartPrimaryColor,
      heartGlowColor: isValidHexColor(obj.heartGlowColor) ? (obj.heartGlowColor as string) : defaults.heartGlowColor,
      heartCoreBrightness: clampNumber(obj.heartCoreBrightness, 0.0, 3.0, defaults.heartCoreBrightness),
      heartPulseSpeed: clampNumber(obj.heartPulseSpeed, 0.0, 4.0, defaults.heartPulseSpeed),
      heartPulseAmplitude: clampNumber(obj.heartPulseAmplitude, 0.0, 0.15, defaults.heartPulseAmplitude),
      heartJitterStrength: clampNumber(obj.heartJitterStrength, 0.0, 3.0, defaults.heartJitterStrength),

      // Đế chữ xoay
      diskRadius: clampNumber(obj.diskRadius, 1.0, 4.0, defaults.diskRadius),
      diskRingCount: Math.round(clampNumber(obj.diskRingCount, 2, 16, defaults.diskRingCount)),
      diskFontSize: Math.round(clampNumber(obj.diskFontSize, 10, 32, defaults.diskFontSize)),
      diskTextColor: isValidHexColor(obj.diskTextColor) ? (obj.diskTextColor as string) : defaults.diskTextColor,
      diskAccentColor: isValidHexColor(obj.diskAccentColor) ? (obj.diskAccentColor as string) : defaults.diskAccentColor,
      diskSpeed: clampNumber(obj.diskSpeed, -3.0, 3.0, defaults.diskSpeed),
      diskVerticalGap: clampNumber(obj.diskVerticalGap, 1.2, 4.0, defaults.diskVerticalGap),
      diskMessages: typeof obj.diskMessages === 'string' && obj.diskMessages.trim().length > 0
        ? obj.diskMessages.slice(0, 500)
        : defaults.diskMessages,

      // Luồng ký tự
      streamEnabled: typeof obj.streamEnabled === 'boolean' ? obj.streamEnabled : defaults.streamEnabled,
      streamDensity: Math.round(clampNumber(obj.streamDensity, 10, 150, defaults.streamDensity)),
      streamSpeed: clampNumber(obj.streamSpeed, 0.0, 3.0, defaults.streamSpeed),
      streamSpread: clampNumber(obj.streamSpread, 0.1, 1.0, defaults.streamSpread),

      // Nền & Hậu cảnh
      backgroundColor: isValidHexColor(obj.backgroundColor) ? (obj.backgroundColor as string) : defaults.backgroundColor,
      starDustEnabled: typeof obj.starDustEnabled === 'boolean' ? obj.starDustEnabled : defaults.starDustEnabled,
      starDustCount: Math.round(clampNumber(obj.starDustCount, 50, 1000, defaults.starDustCount)),
    };

    return {
      success: true,
      data,
    };
  },
  (_fromVersion: number, value: unknown) => {
    return value as EffectConfig;
  }
);
