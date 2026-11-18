import type { EffectControls } from '../../effect-sdk';
import type { ParticleRoseHeartConfig } from './config';

export const controls: EffectControls<ParticleRoseHeartConfig> = {
  // CONTENT
  greetingText: {
    type: 'text',
    label: 'Chữ mở đầu',
    maxLength: 30,
    placeholder: 'Chúc Mừng',
    description: 'Chữ script xuất hiện đầu tiên từ hạt',
  },
  occasionText: {
    type: 'text',
    label: 'Dòng sự kiện',
    maxLength: 30,
    placeholder: "women's day",
    description: 'Dòng chữ thứ hai sau chuyển động dải hạt',
  },
  holdText: {
    type: 'text',
    label: 'Chữ hướng dẫn giữ',
    maxLength: 30,
    placeholder: 'Giữ để bắt đầu',
    description: 'Nhãn hướng dẫn người dùng nhấn giữ',
  },

  // COLORS & STYLE
  primaryColor: {
    type: 'color',
    label: 'Màu hạt chính',
    description: 'Màu sắc chủ đạo của đám hạt và chữ',
  },
  secondaryColor: {
    type: 'color',
    label: 'Màu hạt nhấn',
    description: 'Màu phụ tạo chiều sâu cho hạt và viền hoa',
  },
  backgroundColor: {
    type: 'color',
    label: 'Màu nền',
    description: 'Màu nền không gian vũ trụ',
  },
  particleGlow: {
    type: 'number',
    label: 'Độ phát sáng',
    min: 0.1,
    max: 1.0,
    step: 0.05,
    description: 'Cường độ ánh hào quang hạt',
  },
  particleMotion: {
    type: 'number',
    label: 'Biên độ dao động',
    min: 0.2,
    max: 2.0,
    step: 0.1,
    description: 'Mức độ chuyển động drift tự nhiên',
  },

  // PARTICLES
  particleCount: {
    type: 'number',
    label: 'Số lượng hạt',
    min: 3000,
    max: 25000,
    step: 1000,
    description: 'Mật độ hạt trong toàn bộ sequence',
  },
  particleSize: {
    type: 'number',
    label: 'Kích cỡ hạt',
    min: 0.8,
    max: 3.0,
    step: 0.1,
    description: 'Kích thước điểm ảnh hạt',
  },
  particleSpeed: {
    type: 'number',
    label: 'Tốc độ hạt',
    min: 0.5,
    max: 2.5,
    step: 0.1,
    description: 'Tốc độ bay và hội tụ của hạt',
  },

  // TRIGGER & TIMELINE
  triggerMode: {
    type: 'select',
    label: 'Cách kích hoạt',
    options: [
      { label: 'Nhấn giữ nút tròn (Mặc định)', value: 'hold' },
      { label: 'Nhấp một lần', value: 'click' },
      { label: 'Tự động chạy', value: 'auto' },
    ],
    description: 'Phương thức bắt đầu hoạt cảnh',
  },
  holdDuration: {
    type: 'number',
    label: 'Thời gian giữ (ms)',
    min: 400,
    max: 1500,
    step: 50,
    description: 'Thời gian giữ nút để bắt đầu',
  },
  playbackSpeed: {
    type: 'number',
    label: 'Tốc độ phát',
    min: 0.5,
    max: 2.0,
    step: 0.1,
    description: 'Hệ số tốc độ toàn bộ timeline',
  },
  heartDisplayDuration: {
    type: 'number',
    label: 'Thời gian ngắm hoa (s)',
    min: 2.0,
    max: 10.0,
    step: 0.5,
    description: 'Thời gian giữ trái tim hoa hồng ổn định',
  },
  endBehavior: {
    type: 'select',
    label: 'Hành vi kết thúc',
    options: [
      { label: 'Lặp lại bầy gấu bay (Mặc định)', value: 'loop-final-stage' },
      { label: 'Dừng ở cảnh cuối', value: 'hold' },
      { label: 'Sẵn sàng phát lại', value: 'replay-ready' },
    ],
    description: 'Trạng thái khi hết sequence',
  },

  // ROSE HEART
  roseCount: {
    type: 'number',
    label: 'Số lượng hoa hồng',
    min: 40,
    max: 110,
    step: 2,
    description: 'Mật độ các bông hoa tạo hình trái tim',
  },
  heartScale: {
    type: 'number',
    label: 'Tỷ lệ trái tim',
    min: 0.7,
    max: 1.3,
    step: 0.05,
    description: 'Kích thước tổng thể của trái tim hoa',
  },
  roseColorVariation: {
    type: 'number',
    label: 'Đa dạng màu hoa',
    min: 0.0,
    max: 1.0,
    step: 0.1,
    description: 'Mức độ xen kẽ các sắc độ hoa hồng',
  },

  // FLYING BEARS
  bearCount: {
    type: 'number',
    label: 'Số lượng gấu bông',
    min: 10,
    max: 60,
    step: 5,
    description: 'Số lượng gấu bông cùng bay trong không gian',
  },
  bearSpeed: {
    type: 'number',
    label: 'Tốc độ gấu bay',
    min: 0.4,
    max: 2.5,
    step: 0.1,
    description: 'Vận tốc di chuyển xuyên không gian của gấu',
  },
};
