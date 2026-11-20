import type { Preset } from '../../effect-sdk';
import type { WordLoveCodeConfig } from './config';
import { defaults } from './config';

export const presets: Preset<WordLoveCodeConfig>[] = [
  {
    id: 'default',
    name: 'You Are My Love (Mặc định)',
    description: 'Bản gốc lãng mạn với mưa chữ Matrix và đếm ngược You Are My Love',
    config: {
      ...defaults,
    },
  },
  {
    id: 'vietnamese-sweet',
    name: 'Anh Yêu Em (Tiếng Việt)',
    description: 'Phiên bản lời nhắn tiếng Việt ngọt ngào tràn ngập tình yêu',
    config: {
      ...defaults,
      wordSequence: 'Anh|Yêu|Em|Mãi Mãi',
      centerText: 'Yêu Em Nhất Trên Đời ❤️',
      matrixText: 'ANH YEU EM ❤ ANH YEU EM ❤ ANH YEU EM ❤',
      heartColor: '#ff2a6d',
      centerTextColor: '#ff6392',
    },
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon Love',
    description: 'Phong cách ma trận Cyberpunk ánh xanh ngọc lam neon hiện đại',
    config: {
      ...defaults,
      wordSequence: 'Always|With|You|Forever',
      centerText: 'Forever & Always 💙',
      matrixText: 'LOVE.EXE 01010101 ❤ FOREVER 01010101',
      matrixColor: '#00f5d4',
      centerTextColor: '#00f5d4',
      heartColor: '#9d4edd',
      dotColor: '#00f5d4',
    },
  },
];
