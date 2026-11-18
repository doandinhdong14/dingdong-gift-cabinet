import type { Preset } from '../../effect-sdk';
import type { ParticleRoseHeartConfig } from './config';
import { defaults } from './config';

export const presets: Preset<ParticleRoseHeartConfig>[] = [
  {
    id: 'sweet-pink',
    name: 'Sweet Pink (Mặc định)',
    description: 'Hạt hồng lãng mạn, hoa hồng phấn tươi thắm và bầy gấu bông ôm hoa ngọt ngào',
    config: {
      ...defaults,
      primaryColor: '#ff5fad',
      secondaryColor: '#ff2a70',
      backgroundColor: '#000000',
      particleGlow: 0.45,
      roseCount: 72,
      bearCount: 30,
    },
    isDefault: true,
  },
  {
    id: 'passion-crimson',
    name: 'Passion Crimson',
    description: 'Tông đỏ nhung quyến rũ, hạt sáng rực rỡ và hoa hồng đỏ thẫm nồng nàn',
    config: {
      ...defaults,
      primaryColor: '#ff2e63',
      secondaryColor: '#b80d38',
      backgroundColor: '#050204',
      particleGlow: 0.6,
      roseCount: 80,
      roseColorVariation: 0.7,
      bearCount: 35,
    },
  },
  {
    id: 'lavender-dream',
    name: 'Lavender Dream',
    description: 'Tông tím ngân hà kỳ ảo phối cùng hạt phấn ngọc trai và hoa hồng pastel',
    config: {
      ...defaults,
      primaryColor: '#d946ef',
      secondaryColor: '#8b5cf6',
      backgroundColor: '#040208',
      particleGlow: 0.5,
      roseCount: 68,
      roseColorVariation: 0.6,
      bearCount: 28,
    },
  },
  {
    id: 'golden-peach',
    name: 'Golden Peach',
    description: 'Tông hoàng hôn san hô và vàng kem ấm áp, hoa hồng đào thanh tao',
    config: {
      ...defaults,
      primaryColor: '#fb7185',
      secondaryColor: '#f59e0b',
      backgroundColor: '#050302',
      particleGlow: 0.55,
      roseCount: 70,
      roseColorVariation: 0.4,
      bearCount: 25,
    },
  },
];
