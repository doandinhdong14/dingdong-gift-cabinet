import type { EffectControls } from '../../effect-sdk';
import type { EffectConfig } from './config';

export const controls: EffectControls<EffectConfig> = {
  speed: {
    type: 'number',
    label: 'Tốc độ',
    min: 0.1,
    max: 3.0,
    step: 0.1,
    unit: 'x',
    description: 'Điều chỉnh tốc độ diễn hoạt',
  },
  scale: {
    type: 'number',
    label: 'Kích thước',
    min: 0.5,
    max: 2.5,
    step: 0.05,
    unit: 'x',
    description: 'Tỷ lệ kích thước đối tượng',
  },
  color: {
    type: 'color',
    label: 'Màu sắc chủ đạo',
    description: 'Màu sắc chính của hiệu ứng',
  },
  intensity: {
    type: 'number',
    label: 'Cường độ',
    min: 0.0,
    max: 2.0,
    step: 0.1,
    description: 'Độ sáng hoặc lực tác động',
  },
  message: {
    type: 'text',
    label: 'Thông điệp',
    maxLength: 60,
    placeholder: 'Nhập thông điệp...',
    description: 'Lời chúc hiển thị kèm',
  },
};
