import type { Preset } from '../../effect-sdk';
import { defaults, type EffectConfig } from './config';

export const presets: Preset<EffectConfig>[] = [
  {
    id: 'default',
    name: 'Bó hoa kỷ niệm mặc định',
    description: 'Thiết lập chuẩn cân bằng: 6 ảnh kỷ niệm, ấn giữ 1.8s và xòe tự nhiên',
    config: { ...defaults },
    isDefault: true,
  },
  {
    id: 'fast-burst',
    name: 'Tung hoa nhanh & bung tỏa',
    description: 'Nhịp điệu nhanh, chỉ cần giữ 1.0s và ảnh bay bung rộng sang hai phía',
    config: {
      ...defaults,
      holdDuration: 1.0,
      burstSpeed: 1.35,
      burstSpread: 1.3,
      burstRotation: 1.2,
      ringColor: '#fb7185',
    },
  },
  {
    id: 'gentle-romance',
    name: 'Dịu dàng & thơ mộng',
    description: 'Ấn giữ 2.2s thư thái, quầng hoa hồng sáng ấm, ảnh bay nhẹ nhàng',
    config: {
      ...defaults,
      holdDuration: 2.2,
      burstSpeed: 0.85,
      burstSpread: 0.85,
      burstRotation: 0.8,
      starSpeed: 0.35,
      glowIntensity: 1.4,
      ringColor: '#f472b6',
    },
  },
];
