import type { Preset } from '../../effect-sdk';
import { defaults, type EffectConfig } from './config';

export const presets: Preset<EffectConfig>[] = [
  {
    id: 'romantic-pink',
    name: 'Hồng lãng mạn (Gốc)',
    description: 'Bản sắc chuẩn theo video tham chiếu với khối hạt mịn hồng tím lấp lánh, đế 10 vòng chữ xoay có chiều sâu và luồng ký tự nối êm dịu',
    config: { ...defaults },
    isDefault: true,
  },
  {
    id: 'mystic-purple',
    name: 'Tím mộng mơ',
    description: 'Gam màu tím khói huyền ảo kết hợp hạt phát sáng tím lilac và đĩa chữ màu trắng ngọc',
    config: {
      ...defaults,
      heartPrimaryColor: '#d946ef',
      heartGlowColor: '#c084fc',
      diskAccentColor: '#f472b6',
      backgroundColor: '#070210',
      heartCoreBrightness: 0.95,
      heartPulseSpeed: 0.65,
    },
  },
  {
    id: 'golden-elegance',
    name: 'Hoàng kim sang trọng',
    description: 'Sắc vàng óng ánh ấm áp, đế chữ kem sáng xen lẫn tim vàng rực rỡ',
    config: {
      ...defaults,
      heartPrimaryColor: '#f59e0b',
      heartGlowColor: '#fbbf24',
      diskTextColor: '#fef3c7',
      diskAccentColor: '#f59e0b',
      backgroundColor: '#0c0702',
      heartCoreBrightness: 1.0,
      heartPulseSpeed: 0.75,
    },
  },
  {
    id: 'calm-minimal',
    name: 'Tối giản êm dịu',
    description: 'Mật độ hạt vừa phải, chuyển động chậm rãi êm đềm, phù hợp cho thiết bị cấu hình nhẹ',
    config: {
      ...defaults,
      heartParticleCount: 5500,
      heartParticleSize: 1.1,
      diskRingCount: 7,
      diskSpeed: 0.45,
      heartPulseAmplitude: 0.015,
      heartJitterStrength: 0.6,
      streamDensity: 30,
      starDustCount: 180,
    },
  },
];
