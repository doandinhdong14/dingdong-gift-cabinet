import { AssetManifest } from '../gift-library/types';

/**
 * Normalizes a string by removing Vietnamese diacritics, lowercasing, and trimming.
 * Handles đ/Đ and combined unicode accent characters.
 */
export function removeVietnameseDiacritics(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, (m) => (m === 'đ' ? 'd' : 'D'))
    .toLowerCase()
    .trim();
}

/**
 * Checks whether an asset manifest matches a query string.
 * Supports case-insensitive matching with and without Vietnamese accents
 * against ID, name, description, category, and tags.
 */
export function matchesAssetSearch(manifest: AssetManifest, query: string): boolean {
  if (!query || !query.trim()) return true;

  const normalizedQuery = removeVietnameseDiacritics(query);
  const rawQuery = query.toLowerCase().trim();

  // Targets
  const id = manifest.id.toLowerCase();
  const nameRaw = manifest.name.toLowerCase();
  const nameNormalized = removeVietnameseDiacritics(manifest.name);
  const descRaw = (manifest.description || '').toLowerCase();
  const descNormalized = removeVietnameseDiacritics(manifest.description || '');
  const tagsRaw = manifest.tags.map((t) => t.toLowerCase()).join(' ');
  const tagsNormalized = removeVietnameseDiacritics(manifest.tags.join(' '));
  const categoryRaw = (manifest.category || '').toLowerCase();
  const categoryNormalized = removeVietnameseDiacritics(manifest.category || '');

  // Check raw or normalized match
  return (
    id.includes(rawQuery) ||
    nameRaw.includes(rawQuery) ||
    nameNormalized.includes(normalizedQuery) ||
    descRaw.includes(rawQuery) ||
    descNormalized.includes(normalizedQuery) ||
    tagsRaw.includes(rawQuery) ||
    tagsNormalized.includes(normalizedQuery) ||
    categoryRaw.includes(rawQuery) ||
    categoryNormalized.includes(normalizedQuery)
  );
}
