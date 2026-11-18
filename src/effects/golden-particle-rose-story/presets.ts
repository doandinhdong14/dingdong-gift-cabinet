import type { Preset } from '../../effect-sdk';
import { defaults, type GoldenParticleStoryConfig } from './config';

export const presets: Preset<GoldenParticleStoryConfig>[] = [
  {
    id: 'default-romantic-gold',
    name: 'Mặc định — Vàng Kim Lãng Mạn',
    description: 'Chuỗi cinematic 38s nguyên bản với hạt vàng kim, tim phát sáng và bó 9 bông hồng nở rực rỡ.',
    config: { ...defaults },
    isDefault: true,
  },
  {
    id: 'royal-velvet-passion',
    name: 'Đêm Hoàng Gia — Nhung Đỏ Quý Phái',
    description: 'Tông hoa hồng đỏ thẫm quý phái, hạt vàng đồng sang trọng và ánh sáng sâu lắng.',
    config: {
      ...defaults,
      roseColor: '#99001a',
      particleColor: '#f1c40f',
      glowIntensity: 1.1,
      bloomDuration: 2.5,
    },
  },
  {
    id: 'starlight-fairy-dust',
    name: 'Bụi Sao Huyền Ảo — Vũ Trụ Tình Yêu',
    description: 'Mật độ hạt cao với ánh sáng vàng champagne lấp lánh như dải ngân hà bao quanh lời chúc.',
    config: {
      ...defaults,
      particleCount: 15000,
      particleSize: 1.3,
      particleColor: '#fae392',
      glowIntensity: 1.2,
      petalDensity: 32,
    },
  },
  {
    id: 'gentle-sunset-memories',
    name: 'Hoàng Hôn Êm Đềm — Dịu Dàng Sâu Lắng',
    description: 'Nhịp điệu chậm rãi hơn, sắc hồng đào và vàng ấm áp giúp người xem ngắm nhìn trọn vẹn từng khoảnh khắc.',
    config: {
      ...defaults,
      playbackSpeed: 0.85,
      roseColor: '#be123c',
      particleColor: '#ffd166',
      bloomDuration: 2.8,
    },
  },
];
