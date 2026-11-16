import { AssetManifest } from '../../types';

export const devBoxManifest: AssetManifest = {
  schemaVersion: 1,
  id: 'dev-box-fixture',
  name: 'Khối kiểm tra kỹ thuật',
  version: '0.1.0',
  category: 'Trang trí',
  kind: '3d',
  description: 'Khối hình hộp kỹ thuật chuẩn hóa (cao 2 đơn vị, tâm tại gốc tọa độ, mặt trước hướng +Z) dùng để kiểm thử viewer, motion rig và hệ thống tham số.',
  tags: ['kỹ thuật', 'kiểm thử', 'pipeline', 'dev'],
  status: 'draft',
  thumbnail: '/assets/dev-fixture/thumbnail.svg',
  fallback: '/assets/dev-fixture/fallback.svg',
  source: 'procedural',
  license: 'MIT',
  author: 'DingDong Team',
  dependencies: ['three', '@react-three/fiber'],
  supportedMotions: ['float', 'heartbeat', 'spin'],
};
