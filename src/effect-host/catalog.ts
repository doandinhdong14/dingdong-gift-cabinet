import type { EffectDefinition, EffectManifest } from '../effect-sdk/types';
import { validateManifest } from '../effect-sdk/validation/manifestValidator';
import { PRODUCT_REGISTRY } from '../gift-library/registry';

export interface CatalogPackageEntry {
  id: string;
  manifest: EffectManifest;
  folderName: string;
  loadDefinition: () => Promise<EffectDefinition>;
  isLegacy?: boolean;
}

// Vite glob imports for zero-central-file auto-discovery
const manifestModules = import.meta.glob('../effects/*/manifest.json', { eager: true }) as Record<
  string,
  { default: unknown } | unknown
>;

const entryModules = import.meta.glob('../effects/*/index.ts') as Record<
  string,
  () => Promise<{ default: EffectDefinition }>
>;

// Resolve thumbnail/preview URLs
const previewAssets = import.meta.glob('../effects/*/preview/*', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

function extractFolderName(path: string): string {
  // Matches "../effects/<folderName>/..."
  const match = path.match(/\.\.\/effects\/([^/]+)\//);
  return match ? match[1] : '';
}

const discoveredPackages: Map<string, CatalogPackageEntry> = new Map();
const discoveryErrors: Array<{ path: string; error: string }> = [];

// Initialize auto-discovery
for (const [manifestPath, moduleExport] of Object.entries(manifestModules)) {
  const folderName = extractFolderName(manifestPath);
  if (!folderName) continue;

  const rawManifest = (moduleExport && typeof moduleExport === 'object' && 'default' in moduleExport)
    ? (moduleExport as { default: unknown }).default
    : moduleExport;

  const validation = validateManifest(rawManifest);
  if (!validation.success) {
    const errorDetails = validation.errors.map((e) => `${e.path}: ${e.message}`).join(', ');
    console.error(`[AutoDiscovery] Invalid manifest in "${folderName}": ${errorDetails}`);
    discoveryErrors.push({ path: manifestPath, error: errorDetails });
    continue;
  }

  const manifest = validation.data;

  // Folder name must strictly match manifest id
  if (manifest.id !== folderName) {
    const err = `Folder name "${folderName}" does not match manifest.id "${manifest.id}"`;
    console.error(`[AutoDiscovery] ${err}`);
    discoveryErrors.push({ path: manifestPath, error: err });
    continue;
  }

  // Look for matching entry module
  const expectedEntryPath = `../effects/${folderName}/index.ts`;
  const loadModule = entryModules[expectedEntryPath];

  if (!loadModule) {
    console.warn(`[AutoDiscovery] Missing index.ts entry for effect "${folderName}"`);
    continue;
  }

  // Resolve thumbnail if available
  const thumbnailKey = `../effects/${folderName}/preview/thumbnail.webp`;
  const fallbackKey = `../effects/${folderName}/preview/fallback.svg`;
  if (previewAssets[thumbnailKey]) {
    manifest.thumbnail = previewAssets[thumbnailKey];
  }
  if (previewAssets[fallbackKey]) {
    manifest.fallback = previewAssets[fallbackKey];
  }

  discoveredPackages.set(manifest.id, {
    id: manifest.id,
    manifest,
    folderName,
    loadDefinition: async () => {
      const mod = await loadModule();
      return mod.default;
    },
    isLegacy: false,
  });
}

/**
 * Get all auto-discovered package effects
 */
export function getPackageEffects(): CatalogPackageEntry[] {
  return Array.from(discoveredPackages.values());
}

/**
 * Get a package effect by ID
 */
export function getPackageEffectById(id: string): CatalogPackageEntry | undefined {
  return discoveredPackages.get(id);
}

/**
 * Load full effect definition
 */
export async function loadEffectDefinition(id: string): Promise<EffectDefinition | undefined> {
  const pkg = discoveredPackages.get(id);
  if (pkg) {
    return await pkg.loadDefinition();
  }
  return undefined;
}

/**
 * Get any discovery errors detected during initialization
 */
export function getDiscoveryErrors(): Array<{ path: string; error: string }> {
  return [...discoveryErrors];
}

/**
 * Combined catalog item format compatible with both legacy and new packages
 */
export interface CombinedCatalogItem {
  id: string;
  name: string;
  category: string;
  kind: string;
  version: string;
  status: string;
  description: string;
  tags: string[];
  thumbnail: string;
  fallback: string;
  isPackage: boolean;
  packageEntry?: CatalogPackageEntry;
}

/**
 * Returns a unified list of all assets: legacy and newly discovered package effects
 */
export function getAllCatalogItems(): CombinedCatalogItem[] {
  const items: CombinedCatalogItem[] = [];

  // 1. Add legacy items from PRODUCT_REGISTRY
  for (const legacy of PRODUCT_REGISTRY) {
    items.push({
      id: legacy.manifest.id,
      name: legacy.manifest.name,
      category: legacy.manifest.category || 'Trang trí',
      kind: legacy.manifest.kind === '2d' ? 'overlay2d' : 'object3d',
      version: legacy.manifest.version,
      status: legacy.manifest.status,
      description: legacy.manifest.description,
      tags: legacy.manifest.tags || [],
      thumbnail: legacy.manifest.thumbnail,
      fallback: legacy.manifest.fallback,
      isPackage: false,
    });
  }

  // 2. Add auto-discovered package effects
  for (const pkg of discoveredPackages.values()) {
    // If ID already exists in legacy (e.g. if migrated), prefer package
    const existingIndex = items.findIndex((i) => i.id === pkg.id);
    const item: CombinedCatalogItem = {
      id: pkg.manifest.id,
      name: pkg.manifest.name,
      category: pkg.manifest.tags?.[0] || 'Hiệu ứng mới',
      kind: pkg.manifest.kind,
      version: pkg.manifest.version,
      status: pkg.manifest.status,
      description: pkg.manifest.description,
      tags: pkg.manifest.tags,
      thumbnail: pkg.manifest.thumbnail,
      fallback: pkg.manifest.fallback,
      isPackage: true,
      packageEntry: pkg,
    };

    if (existingIndex >= 0) {
      items[existingIndex] = item;
    } else {
      items.push(item);
    }
  }

  return items;
}
