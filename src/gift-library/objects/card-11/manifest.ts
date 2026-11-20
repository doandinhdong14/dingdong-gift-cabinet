import { AssetManifest } from '../../types';

export const card11Manifest: AssetManifest = {
  schemaVersion: 1,
  id: 'card-11',
  name: 'Card 11',
  version: '1.0.0',
  category: 'Trái tim',
  kind: '3d',
  description:
    'Card 11: Trái tim ma trận 3D không gian - Hàng trăm dòng chữ tình yêu chuyển động uốn lượn theo quỹ đạo hình tim phát sáng neon lung linh, có thể tùy chỉnh chữ, đổi màu sắc và dùng tay xoay đa chiều trong không gian 3D.',
  tags: ['card 11', 'trái tim', 'kinetic love', 'i-love-you-matrix', 'ma trận tình yêu', 'chữ bay', 'neon', '3d không gian'],
  status: 'approved',
  thumbnail: '/assets/card-11/thumbnail.svg',
  fallback: '/assets/card-11/fallback.svg',
  source: 'procedural',
  license: 'MIT',
  author: 'DingDong Gift',
  dependencies: ['three', '@react-three/fiber', '@react-three/drei'],
  supportedMotions: ['float', 'heartbeat', 'spin'],
};
