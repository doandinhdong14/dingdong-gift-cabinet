import { RegistryEntry } from './types';
import { devBoxManifest } from './objects/dev-fixture/manifest';
import { devBoxDefaultConfig, devBoxPresets } from './objects/dev-fixture/presets';
import { heart01Manifest } from './objects/heart-01/manifest';
import { heart01DefaultConfig, heart01Presets } from './objects/heart-01/presets';
import { loveUniverse01Manifest } from './objects/love-universe-01/manifest';
import { loveUniverse01DefaultConfig, loveUniverse01Presets } from './objects/love-universe-01/presets';
import { roseReveal01Manifest } from './objects/rose-reveal-01/manifest';
import { roseReveal01DefaultConfig, roseReveal01Presets } from './objects/rose-reveal-01/presets';

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
 * Kept for internal pipeline validation and testing.
 */
export const DEV_FIXTURE_ENTRY: RegistryEntry = {
  manifest: devBoxManifest,
  loadComponent: () => import('./objects/dev-fixture/DevBox'),
  defaultConfig: devBoxDefaultConfig,
  defaultPresets: devBoxPresets,
};

/**
 * PRODUCT REGISTRY:
 * Official products catalog available in the cabinet gallery.
 */
export const PRODUCT_REGISTRY: RegistryEntry[] = [
  {
    manifest: heart01Manifest,
    loadComponent: () => import('./objects/heart-01/Heart01'),
    defaultConfig: heart01DefaultConfig,
    defaultPresets: heart01Presets,
  },
  {
    manifest: loveUniverse01Manifest,
    loadComponent: () => import('./objects/love-universe-01/LoveUniverse01'),
    defaultConfig: loveUniverse01DefaultConfig,
    defaultPresets: loveUniverse01Presets,
  },
  {
    manifest: roseReveal01Manifest,
    loadComponent: () => import('./objects/rose-reveal-01/RoseReveal01'),
    defaultConfig: roseReveal01DefaultConfig,
    defaultPresets: roseReveal01Presets,
  },
];

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
