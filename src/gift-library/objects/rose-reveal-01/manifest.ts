import { AssetManifest } from '../../types';

export const roseReveal01Manifest: AssetManifest = {
  schemaVersion: 1,
  id: 'rose-reveal-01',
  name: 'Card 3',
  version: '1.0.0',
  category: 'Hộp quà',
  kind: '3d',
  description:
    'Trải nghiệm mở quà 3D lãng mạn: Bông hồng phấn khép mình e ấp, từ từ nở rộ từng lớp cánh mềm mại khi chạm vào, tỏa ra làn mưa cánh hoa bay ngập tràn không gian và mở lối vào trang đích ngọt ngào.',
  tags: ['hoa hồng', 'bông hồng', 'mở quà', 'nở hoa', 'rose reveal', '3d', 'lãng mạn', 'quà tặng'],
  status: 'approved',
  thumbnail: '/assets/rose-reveal-01/thumbnail.svg',
  fallback: '/assets/rose-reveal-01/fallback.svg',
  source: 'procedural',
  license: 'MIT',
  author: 'DingDong Gift',
  dependencies: ['three', '@react-three/fiber', '@react-three/drei'],
  supportedMotions: ['float', 'spin'],
};
