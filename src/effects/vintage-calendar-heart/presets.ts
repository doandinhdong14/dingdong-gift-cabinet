import type { Preset } from '../../effect-sdk';
import { defaults, type VintageCalendarConfig } from './config';

export const presets: Preset<VintageCalendarConfig>[] = [
  {
    id: 'mens-day-2026',
    name: 'Ngày Quốc tế Nam giới 2026',
    description: 'Bản chuẩn theo video tham chiếu: lật từ 15 đến 19/11/2026, vẽ tim và lời chúc',
    config: { ...defaults },
    isDefault: true,
  },
  {
    id: 'swift-flip',
    name: 'Nhịp điệu nhanh sôi động',
    description: 'Tốc độ lật nhanh, cuộn dứt khoát, hạt sáng lấp lánh mạnh hơn',
    config: {
      ...defaults,
      animationSpeed: 1.35,
      flipDuration: 0.32,
      flipInterval: 0.08,
      curlIntensity: 0.75,
      heartDrawDuration: 0.45,
      heartParticleCount: 24,
      particleIntensity: 0.8,
    },
  },
  {
    id: 'romantic-gentle',
    name: 'Lãng mạn dịu êm',
    description: 'Chuyển động cuộn mềm mại, thời gian thưởng thức dài hơn, trái tim bay bổng',
    config: {
      ...defaults,
      animationSpeed: 0.85,
      flipDuration: 0.52,
      flipInterval: 0.16,
      curlIntensity: 0.60,
      paperStiffness: 0.65,
      heartDrawDuration: 0.80,
      heartParticleCount: 30,
      particleIntensity: 0.6,
      accentColor: '#fb7185',
    },
  },
];
