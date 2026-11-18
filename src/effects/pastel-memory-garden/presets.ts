import type { Preset } from '../../effect-sdk';
import type { PastelMemoryGardenConfig } from './config';
import { defaults } from './config';

export const presets: Preset<PastelMemoryGardenConfig>[] = [
  {
    id: 'reference_standard',
    name: 'Chuẩn Video Tham Chiếu',
    description: 'Bố cục vườn hoa cổ tích chuẩn xác, nền thoáng đãng, nhân vật nổi bật rõ ràng',
    isDefault: true,
    config: {
      ...defaults,
      scrollSpeed: 0.16,
      parallaxStrength: 0.40,
      foregroundFlowerHeight: 0.22,
      foregroundFlowerDensity: 1.0,
      ribbonIntensity: 1.0,
      butterflyCount: 4,
      backgroundPalette: 'sunset',
      autoPlay: true,
      testMode: 'normal',
    },
  },
  {
    id: 'gentle_memory',
    name: 'Thảnh Thơi Ký Ức',
    description: 'Chuyển động êm đềm, ánh bình minh sương tím và không gian thoáng đãng',
    config: {
      ...defaults,
      scrollSpeed: 0.10,
      parallaxStrength: 0.25,
      foregroundFlowerHeight: 0.18,
      foregroundFlowerDensity: 0.8,
      ribbonIntensity: 0.8,
      butterflyCount: 3,
      backgroundPalette: 'dawn',
      autoPlay: true,
      testMode: 'normal',
    },
  },
  {
    id: 'blooming_romance',
    name: 'Vườn Hoa Rực Rỡ',
    description: 'Sắc hồng rực rỡ, mật độ hoa phong phú và đàn bướm vỗ cánh sinh động',
    config: {
      ...defaults,
      scrollSpeed: 0.18,
      parallaxStrength: 0.50,
      foregroundFlowerHeight: 0.25,
      foregroundFlowerDensity: 1.3,
      ribbonIntensity: 1.3,
      butterflyCount: 6,
      backgroundPalette: 'rose',
      autoPlay: true,
      testMode: 'normal',
    },
  },
  {
    id: 'manual_gallery',
    name: 'Tương Tác Thủ Công',
    description: 'Tắt tự động cuộn để người xem tự do kéo vuốt ngắm từng chân dung và khung cảnh',
    config: {
      ...defaults,
      scrollSpeed: 0,
      autoPlay: false,
      dragEnabled: true,
      testMode: 'normal',
    },
  },
];
