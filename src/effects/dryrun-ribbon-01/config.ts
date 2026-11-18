import { createConfigCodec, type ConfigCodec } from '../../effect-sdk';

export interface EffectConfig {
  speed: number;
  scale: number;
  color: string;
  intensity: number;
  message: string;
}

export const defaults: EffectConfig = {
  speed: 1.0,
  scale: 1.0,
  color: '#e11d48',
  intensity: 1.0,
  message: 'Chúc mừng!',
};

export const configCodec: ConfigCodec<EffectConfig> = createConfigCodec<EffectConfig>(
  (input: unknown) => {
    if (!input || typeof input !== 'object') {
      return { success: false, errors: [{ path: '', message: 'Config must be an object' }] };
    }

    const obj = input as Record<string, unknown>;

    const speed = typeof obj.speed === 'number' && Number.isFinite(obj.speed) ? obj.speed : defaults.speed;
    const scale = typeof obj.scale === 'number' && Number.isFinite(obj.scale) ? obj.scale : defaults.scale;
    const color = typeof obj.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(obj.color) ? obj.color : defaults.color;
    const intensity = typeof obj.intensity === 'number' && Number.isFinite(obj.intensity) ? obj.intensity : defaults.intensity;
    const message = typeof obj.message === 'string' ? obj.message.slice(0, 100) : defaults.message;

    return {
      success: true,
      data: { speed, scale, color, intensity, message },
    };
  },
  (_fromVersion: number, value: unknown) => {
    // Migration logic when configVersion increments
    return value as EffectConfig;
  }
);
