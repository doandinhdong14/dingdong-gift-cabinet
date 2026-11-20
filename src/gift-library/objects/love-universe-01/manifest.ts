import { AssetManifest } from '../../types';

export const loveUniverse01Manifest: AssetManifest = {
  schemaVersion: 1,
  id: 'love-universe-01',
  name: 'Card 2',
  version: '0.1.0',
  category: 'Trang trí',
  kind: '3d',
  description:
    'Không gian vũ trụ 3D sâu thẳm lung linh hàng ngàn vì sao, nơi những câu chúc màu vàng kem phát sáng nhẹ, ảnh kỷ niệm và trái tim bồng bềnh trôi trong một đám mây không gian.',
  tags: ['vũ trụ', 'lời chúc', 'ảnh kỷ niệm', 'trái tim', 'ngân hà', 'galaxy', 'tình yêu'],
  status: 'review',
  thumbnail: '/assets/love-universe-01/thumbnail.svg',
  fallback: '/assets/love-universe-01/fallback.svg',
  source: 'procedural',
  license: 'MIT',
  author: 'DingDong Gift',
  dependencies: ['three', '@react-three/fiber', '@react-three/drei'],
  supportedMotions: ['spin', 'float'],
};
