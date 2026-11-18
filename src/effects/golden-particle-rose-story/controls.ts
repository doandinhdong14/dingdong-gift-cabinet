import type { EffectControls } from '../../effect-sdk';
import type { GoldenParticleStoryConfig } from './config';

export const controls: EffectControls<GoldenParticleStoryConfig> = {
  // CONTENT
  openingText: {
    type: 'text',
    label: 'Lời mở đầu',
    maxLength: 30,
    placeholder: 'Anh Yêu',
    description: 'Chữ xuất hiện ở tâm trái tim đầu tiên',
  },
  finalTitle: {
    type: 'text',
    label: 'Tiêu đề cuối',
    maxLength: 60,
    placeholder: 'Tặng anh bó hoa...',
    description: 'Tiêu đề hiển thị ở màn hình kết thúc',
  },
  finalSubtitle: {
    type: 'text',
    label: 'Dòng phụ đề hoa',
    maxLength: 50,
    placeholder: '9 bông hồng ♥ Mãi mãi bên nhau',
    description: 'Nhãn số lượng hoa và ý nghĩa',
  },
  finalMessage: {
    type: 'text',
    label: 'Lời nhắn gửi',
    maxLength: 150,
    placeholder: 'Cảm ơn anh vì đã luôn...',
    description: 'Thông điệp tình cảm ở màn hình tương tác',
  },
  interactionHint: {
    type: 'text',
    label: 'Gợi ý tương tác',
    maxLength: 50,
    placeholder: 'Nhấn vào bông hồng để xem ảnh nhé',
    description: 'Dòng hướng dẫn người nhận chạm vào hoa',
  },

  // MEDIA
  heartPhoto: {
    type: 'media',
    label: 'Ảnh trái tim chính',
    mediaType: 'image',
    description: 'Ảnh cá nhân xuất hiện trong khung trái tim vàng',
  },

  // PARTICLES
  particleCount: {
    type: 'number',
    label: 'Số lượng hạt',
    min: 3000,
    max: 20000,
    step: 1000,
    unit: 'hạt',
    description: 'Mật độ hạt vàng lấp lánh (12.000 khuyến nghị)',
  },
  particleSize: {
    type: 'number',
    label: 'Kích cỡ hạt',
    min: 0.8,
    max: 3.5,
    step: 0.1,
    unit: 'px',
    description: 'Độ to nhỏ của hạt vàng',
  },
  glowIntensity: {
    type: 'number',
    label: 'Độ phát sáng Glow',
    min: 0.2,
    max: 2.0,
    step: 0.1,
    description: 'Cường độ vầng hào quang lấp lánh',
  },
  particleSpeed: {
    type: 'number',
    label: 'Tốc độ hạt',
    min: 0.5,
    max: 2.0,
    step: 0.1,
    unit: 'x',
    description: 'Tốc độ bay và xoáy của hạt',
  },
  particleColor: {
    type: 'color',
    label: 'Màu hạt vàng',
    description: 'Tông màu vàng kim chính của hạt',
  },

  // BOUQUET
  roseColor: {
    type: 'color',
    label: 'Màu hoa hồng',
    description: 'Sắc đỏ thắm của 9 bông hồng',
  },
  bouquetScale: {
    type: 'number',
    label: 'Kích thước bó hoa',
    min: 0.7,
    max: 1.3,
    step: 0.05,
    unit: 'x',
    description: 'Tỷ lệ thu phóng bó hoa',
  },
  bloomDuration: {
    type: 'number',
    label: 'Thời gian hoa nở',
    min: 1.0,
    max: 4.0,
    step: 0.2,
    unit: 'giây',
    description: 'Độ mượt khi nụ hồng bung nở',
  },
  petalDensity: {
    type: 'number',
    label: 'Mật độ cánh hoa rơi',
    min: 10,
    max: 40,
    step: 5,
    description: 'Số lượng cánh hoa rơi lãng mạn',
  },

  // TIMELINE & CONTROLS
  playbackSpeed: {
    type: 'number',
    label: 'Tốc độ chuyển cảnh',
    min: 0.5,
    max: 2.0,
    step: 0.1,
    unit: 'x',
    description: 'Hệ số thời gian toàn bộ timeline',
  },
  autoplay: {
    type: 'toggle',
    label: 'Tự động phát',
    description: 'Tự động chạy chuỗi khi vào xem',
  },
  loop: {
    type: 'toggle',
    label: 'Lặp lại vô tận',
    description: 'Chạy lại từ đầu sau khi hết chuỗi',
  },
  replayEnabled: {
    type: 'toggle',
    label: 'Hiện nút Replay',
    description: 'Cho phép xem lại chuỗi sau khi kết thúc',
  },

  // PRESENTATION
  quality: {
    type: 'select',
    label: 'Chất lượng đồ họa',
    options: [
      { label: 'Cao (Mượt mà nhất)', value: 'high' },
      { label: 'Trung bình', value: 'medium' },
      { label: 'Tiết kiệm pin', value: 'low' },
    ],
    description: 'Chất lượng render và mật độ hạt tối ưu theo thiết bị',
  },
};
