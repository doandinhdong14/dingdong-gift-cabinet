import { AssetManifest } from '../../types';

export const heart01Manifest: AssetManifest = {
  schemaVersion: 1,
  id: 'heart-01',
  name: 'Card 1',
  version: '0.1.0',
  category: 'Trái tim',
  kind: '3d',
  description: 'Trái tim 3D hồng san hô ngọt ngào, cảm giác viên kẹo mềm, bề mặt satin hơi bóng, hai thùy tròn đều, rãnh trên mềm mại và đỉnh dưới bo nhẹ.',
  tags: ['trái tim', 'tình yêu', 'kẹo ngọt', 'valentine', '3d', 'satin'],
  status: 'review', // Chờ chủ dự án duyệt trực quan hình ảnh
  thumbnail: '/assets/heart-01/thumbnail.svg',
  fallback: '/assets/heart-01/fallback.svg',
  source: 'procedural',
  license: 'MIT',
  author: 'DingDong Team',
  dependencies: ['three', '@react-three/fiber'],
  supportedMotions: ['float', 'heartbeat', 'spin'],
};
