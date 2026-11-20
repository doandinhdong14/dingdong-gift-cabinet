import type { EffectControls } from '../../effect-sdk';
import type { WordLoveCodeConfig } from './config';

export const controls: EffectControls<WordLoveCodeConfig> = {
  // NỘI DUNG CHỮ
  wordSequence: {
    type: 'text',
    label: 'Chuỗi từ morphing',
    placeholder: 'You|Are|My|Love',
    description: 'Các từ hiển thị lần lượt, ngăn cách bằng dấu | (ví dụ: You|Are|My|Love hoặc Anh|Yêu|Em)',
  },
  countdownStart: {
    type: 'number',
    label: 'Đếm ngược (giây)',
    min: 0,
    max: 5,
    step: 1,
    description: 'Đếm ngược 3, 2, 1 trước khi bắt đầu chuỗi chữ (chọn 0 để bắt đầu ngay)',
  },
  centerText: {
    type: 'text',
    label: 'Chữ trung tâm trái tim',
    placeholder: 'Wuv U❤️Bao Bao',
    description: 'Lời nhắn xuất hiện giữa trái tim phát sáng (ví dụ: Wuv U❤️Bao Bao hoặc Yêu Bé Yêu)',
  },
  centerTextColor: {
    type: 'color',
    label: 'Màu chữ trung tâm',
    description: 'Màu sắc của dòng chữ giữa trái tim',
  },
  centerFontSize: {
    type: 'number',
    label: 'Cỡ chữ trái tim (px)',
    min: 18,
    max: 56,
    step: 2,
    description: 'Kích cỡ phông chữ trung tâm',
  },

  // MATRIX RAIN
  enableMatrix: {
    type: 'toggle',
    label: 'Bật mưa rơi Matrix',
    description: 'Hiệu ứng ma trận mưa chữ số công nghệ tình yêu',
  },
  matrixText: {
    type: 'text',
    label: 'Ký tự mưa Matrix',
    placeholder: 'I LOVE UI LOVE UI LOVE UI LOVE UI LOVE U ❤',
    description: 'Nội dung các ký tự rơi tự do theo cột ma trận',
  },
  matrixColor: {
    type: 'color',
    label: 'Màu mưa rơi Matrix',
    description: 'Màu sắc của những dòng chữ Matrix rơi',
  },
  matrixFontSize: {
    type: 'number',
    label: 'Cỡ chữ ma trận',
    min: 8,
    max: 20,
    step: 1,
    description: 'Kích thước điểm chữ rơi ma trận',
  },

  // TRÁI TIM PHÁT SÁNG
  heartColor: {
    type: 'color',
    label: 'Màu hạt trái tim',
    description: 'Màu hạt phát sáng nở rộ theo hình trái tim',
  },
  heartParticleCount: {
    type: 'number',
    label: 'Số lượng hạt tim',
    min: 200,
    max: 1000,
    step: 50,
    description: 'Mật độ các hạt bụi tình yêu trên viền tim',
  },
  heartScale: {
    type: 'number',
    label: 'Kích thước trái tim',
    min: 0.6,
    max: 1.5,
    step: 0.1,
    description: 'Tỷ lệ phóng to/thu nhỏ của trái tim hạt',
  },

  // THỜI GIAN & HẠT MORPHING
  wordDuration: {
    type: 'number',
    label: 'Thời gian mỗi chữ (giây)',
    min: 0.8,
    max: 4.0,
    step: 0.2,
    description: 'Thời lượng dừng lại của từng từ trước khi biến đổi',
  },
  dotColor: {
    type: 'color',
    label: 'Màu hạt chữ morphing',
    description: 'Màu sắc các hạt cấu thành chữ',
  },
  dotSize: {
    type: 'number',
    label: 'Cỡ hạt chữ morphing',
    min: 2,
    max: 7,
    step: 0.5,
    description: 'Kích thước hạt điểm kết tụ thành chữ',
  },
  autoReplay: {
    type: 'toggle',
    label: 'Tự động phát lại',
    description: 'Lặp lại hoạt cảnh từ đầu sau khi hết lượt',
  },
};
