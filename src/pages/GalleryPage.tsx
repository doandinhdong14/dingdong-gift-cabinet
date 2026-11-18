import React, { useState, useMemo } from 'react';
import { Sparkles, Terminal, ArrowRight, FolderSearch } from 'lucide-react';
import { AssetCard } from '../components/AssetCard';
import { AssetFilters } from '../components/AssetFilters';
import {
  getProductAssets,
  getCategoryCounts,
  CategoryName,
} from '../gift-library/registry';
import { getPackageEffects } from '../effect-host/catalog';
import { AssetManifest, RegistryEntry } from '../gift-library/types';
import { matchesAssetSearch } from '../utils/searchUtils';

export interface GalleryPageProps {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectAsset: (id: string) => void;
  onNavigateDev: () => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({
  favorites,
  onToggleFavorite,
  onSelectAsset,
  onNavigateDev,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryName>('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  const allAssets = useMemo(() => {
    const legacy = getProductAssets();
    const packages = getPackageEffects();
    const combined: RegistryEntry[] = [...legacy];

    for (const pkg of packages) {
      if (!combined.some((item) => item.manifest.id === pkg.id)) {
        const mappedManifest: AssetManifest = {
          schemaVersion: 1,
          id: pkg.manifest.id,
          name: pkg.manifest.name,
          version: pkg.manifest.version,
          category: pkg.manifest.tags?.[0] || 'Trang trí',
          kind: pkg.manifest.kind === 'overlay2d' ? '2d' : '3d',
          description: pkg.manifest.description,
          tags: pkg.manifest.tags || [],
          status: (pkg.manifest.status === 'needs-fix' ? 'draft' : pkg.manifest.status) as any,
          thumbnail: pkg.manifest.thumbnail,
          fallback: pkg.manifest.fallback,
          source: 'procedural',
          license: pkg.manifest.licenses?.[0] || 'MIT',
          author: 'Worker',
          dependencies: pkg.manifest.sharedAssets || [],
          supportedMotions: [],
        };

        combined.push({
          manifest: mappedManifest,
          loadComponent: () => pkg.loadDefinition().then((d) => ({ default: d.Scene as any })),
          defaultConfig: {} as any,
          defaultPresets: [],
        });
      }
    }

    return combined;
  }, []);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = getCategoryCounts(favorites);
    // Add package effects into counts
    const packages = getPackageEffects();
    for (const pkg of packages) {
      if (!getProductAssets().some((item) => item.manifest.id === pkg.id)) {
        counts['Tất cả'] = (counts['Tất cả'] || 0) + 1;
        const cat = (pkg.manifest.tags?.[0] || 'Trang trí') as CategoryName;
        if (cat in counts) {
          counts[cat] = (counts[cat] || 0) + 1;
        }
        if (favorites.includes(pkg.id)) {
          counts['Yêu thích'] = (counts['Yêu thích'] || 0) + 1;
        }
      }
    }
    return counts;
  }, [favorites]);

  // Filter items by category and search query
  const filteredAssets = useMemo(() => {
    return allAssets.filter((entry) => {
      // 1. Category filter
      if (selectedCategory === 'Yêu thích') {
        if (!favorites.includes(entry.manifest.id)) return false;
      } else if (selectedCategory !== 'Tất cả') {
        if (entry.manifest.category !== selectedCategory) return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        if (!matchesAssetSearch(entry.manifest, searchQuery)) return false;
      }

      return true;
    });
  }, [allAssets, selectedCategory, searchQuery, favorites]);

  return (
    <div className="gallery-page-container">
      {/* Stage Banner */}
      <div className="stage-a-banner" role="status">
        <div className="banner-left">
          <span className="banner-tag">GIAI ĐOẠN B</span>
          <p className="banner-text">
            Đã hoàn thiện Trái tim mẫu 1 (<code>heart-01</code>) với hình khối 3D phồng mềm, bề mặt satin san hô và chuyển động độc lập. Mẫu đang ở trạng thái <strong>review</strong> để bạn duyệt hình ảnh trước khi duyệt chính thức.
          </p>
        </div>
        <button
          type="button"
          className="btn-open-dev"
          onClick={() => onSelectAsset('heart-01')}
          title="Mở Trái tim mẫu 1 trong xưởng 3D"
        >
          <Sparkles size={15} />
          <span>Xem & Tinh chỉnh Trái tim 3D</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="gallery-layout">
        {/* Sidebar Filters */}
        <AssetFilters
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categoryCounts={categoryCounts}
        />

        {/* Main Content Gallery */}
        <main className="gallery-main" role="region" aria-label="Danh sách tài nguyên trang trí">
          <div className="gallery-header-bar">
            <div className="gallery-title-group">
              <h2 className="gallery-category-title">{selectedCategory}</h2>
              <span className="gallery-item-count">
                ({filteredAssets.length} mẫu)
              </span>
            </div>
          </div>

          {filteredAssets.length > 0 ? (
            <div className="assets-grid">
              {filteredAssets.map((entry) => (
                <AssetCard
                  key={entry.manifest.id}
                  manifest={entry.manifest}
                  isFavorite={favorites.includes(entry.manifest.id)}
                  onToggleFavorite={onToggleFavorite}
                  onSelect={onSelectAsset}
                />
              ))}
            </div>
          ) : (
            <div className="empty-gallery-state" role="status">
              <div className="empty-state-icon-box">
                {searchQuery ? <FolderSearch size={44} /> : <Sparkles size={44} />}
              </div>

              <h3 className="empty-state-title">
                {searchQuery
                  ? `Không tìm thấy chi tiết nào khớp với "${searchQuery}"`
                  : selectedCategory === 'Yêu thích'
                  ? 'Bạn chưa đánh dấu yêu thích chi tiết nào'
                  : 'Chưa có mẫu nào trong bộ sưu tập'}
              </h3>

              <p className="empty-state-description">
                {searchQuery
                  ? 'Hãy thử tìm kiếm bằng từ khóa khác hoặc xóa bộ lọc tìm kiếm.'
                  : selectedCategory === 'Yêu thích'
                  ? 'Bấm vào biểu tượng trái tim trên thẻ chi tiết để lưu vào danh sách yêu thích của bạn.'
                  : 'Theo kế hoạch Giai đoạn A, gallery sản phẩm giữ trạng thái trống rõ ràng, không dùng mẫu giả để lấp đầy. Bạn có thể kiểm tra toàn bộ pipeline bằng khối kỹ thuật nội bộ.'}
              </p>

              <div className="empty-state-actions">
                <button
                  type="button"
                  className="btn-primary-action"
                  onClick={onNavigateDev}
                >
                  <Terminal size={16} /> Kiểm tra bằng Khối kỹ thuật (Dev Fixture)
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default GalleryPage;
