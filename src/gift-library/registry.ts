import { RegistryEntry } from './types';
import { devBoxManifest } from './objects/dev-fixture/manifest';
import { devBoxDefaultConfig, devBoxPresets } from './objects/dev-fixture/presets';

/**
 * Standard categories defined in spec
 */
export const CATEGORIES = [
  'Tất cả',
  'Trái tim',
  'Phong bì',
  'Hộp quà',
  'Máy bay',
  'Trang trí',
  'Yêu thích',
] as const;

export type CategoryName = typeof CATEGORIES[number];

/**
 * Technical test fixture entry.
 * Separated from product registry per spec:
 * "Dùng một khối hình kỹ thuật đơn giản trong mục kiểm tra nội bộ để kiểm tra pipeline;
 * không quảng cáo nó là sản phẩm hoàn thiện. Demo kỹ thuật của A nằm ngoài registry sản phẩm."
 */
export const DEV_FIXTURE_ENTRY: RegistryEntry = {
  manifest: devBoxManifest,
  loadComponent: () => import('./objects/dev-fixture/DevBox'),
  defaultConfig: devBoxDefaultConfig,
  defaultPresets: devBoxPresets,
};

/**
 * PRODUCT REGISTRY:
 * In Stage A, this is strictly empty: no fake products, no Heart01 yet.
 * In Stage B, heart-01 will be added here.
 */
export const PRODUCT_REGISTRY: RegistryEntry[] = [];

/**
 * Retrieve all product assets (for gallery display)
 */
export function getProductAssets(): RegistryEntry[] {
  return [...PRODUCT_REGISTRY];
}

/**
 * Retrieve an asset by its immutable ID.
 * Looks up product registry, or returns dev fixture if matched.
 */
export function getAssetById(id: string): RegistryEntry | undefined {
  if (id === DEV_FIXTURE_ENTRY.manifest.id) {
    return DEV_FIXTURE_ENTRY;
  }
  return PRODUCT_REGISTRY.find((entry) => entry.manifest.id === id);
}

/**
 * Compute counts per category strictly from real registry and user favorites.
 * Never displays fake numbers.
 */
export function getCategoryCounts(favorites: string[] = []): Record<CategoryName, number> {
  const counts: Record<CategoryName, number> = {
    'Tất cả': PRODUCT_REGISTRY.length,
    'Trái tim': PRODUCT_REGISTRY.filter((e) => e.manifest.category === 'Trái tim').length,
    'Phong bì': PRODUCT_REGISTRY.filter((e) => e.manifest.category === 'Phong bì').length,
    'Hộp quà': PRODUCT_REGISTRY.filter((e) => e.manifest.category === 'Hộp quà').length,
    'Máy bay': PRODUCT_REGISTRY.filter((e) => e.manifest.category === 'Máy bay').length,
    'Trang trí': PRODUCT_REGISTRY.filter((e) => e.manifest.category === 'Trang trí').length,
    'Yêu thích': PRODUCT_REGISTRY.filter((e) => favorites.includes(e.manifest.id)).length,
  };
  return counts;
}
