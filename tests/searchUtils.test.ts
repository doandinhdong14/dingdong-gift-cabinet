import { describe, it, expect } from 'vitest';
import { removeVietnameseDiacritics, matchesAssetSearch } from '../src/utils/searchUtils';
import { devBoxManifest } from '../src/gift-library/objects/dev-fixture/manifest';

describe('Search Utils (Diacritics & Case Insensitive)', () => {
  it('should remove Vietnamese accents correctly including đ/Đ', () => {
    expect(removeVietnameseDiacritics('Trái tim đỏ')).toBe('trai tim do');
    expect(removeVietnameseDiacritics('ĐỒ VẬT SÁNG TẠO')).toBe('do vat sang tao');
    expect(removeVietnameseDiacritics('Hộp quà')).toBe('hop qua');
    expect(removeVietnameseDiacritics('Máy bay')).toBe('may bay');
  });

  it('should match manifest with exact Vietnamese accents', () => {
    expect(matchesAssetSearch(devBoxManifest, 'Khối kiểm tra')).toBe(true);
    expect(matchesAssetSearch(devBoxManifest, 'kỹ thuật')).toBe(true);
  });

  it('should match manifest without accents (khong dau)', () => {
    expect(matchesAssetSearch(devBoxManifest, 'khoi kiem tra')).toBe(true);
    expect(matchesAssetSearch(devBoxManifest, 'ky thuat')).toBe(true);
    expect(matchesAssetSearch(devBoxManifest, 'trang tri')).toBe(true);
  });

  it('should match by ID, tags, and description', () => {
    expect(matchesAssetSearch(devBoxManifest, 'dev-box')).toBe(true);
    expect(matchesAssetSearch(devBoxManifest, 'pipeline')).toBe(true);
    expect(matchesAssetSearch(devBoxManifest, 'chuan hoa')).toBe(true);
  });

  it('should return false when query does not match', () => {
    expect(matchesAssetSearch(devBoxManifest, 'xe hoi phi co')).toBe(false);
  });
});
