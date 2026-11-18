import type { Preset } from '../../effect-sdk';
import { defaults, type EffectConfig } from './config';

export const presets: Preset<EffectConfig>[] = [
  {
    id: 'default',
    name: 'Tiêu chuẩn',
    description: 'Cấu hình tiêu chuẩn ban đầu',
    config: { ...defaults },
    isDefault: true,
  },
  {
    id: 'energetic',
    name: 'Sôi nổi rực rỡ',
    description: 'Tốc độ nhanh, màu tươi và cường độ cao',
    config: {
      ...defaults,
      speed: 1.8,
      intensity: 1.5,
      color: '#f43f5e',
    },
  },
  {
    id: 'gentle',
    name: 'Nhẹ nhàng thanh lịch',
    description: 'Chuyển động êm dịu, tông màu pastel',
    config: {
      ...defaults,
      speed: 0.6,
      intensity: 0.8,
      color: '#fb7185',
    },
  },
];
