import React, { useState, useMemo } from 'react';
import { Sparkles, Terminal, ArrowRight, FolderSearch } from 'lucide-react';
import { AssetCard } from '../components/AssetCard';
import { AssetFilters } from '../components/AssetFilters';
import {
  getProductAssets,
  getCategoryCounts,
  CategoryName,
} from '../gift-library/registry';
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

  const productAssets = useMemo(() => getProductAssets(), []);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    return getCategoryCounts(favorites);
  }, [favorites]);

  // Filter items by category and search query
  const filteredAssets = useMemo(() => {
    return productAssets.filter((entry) => {
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
  }, [productAssets, selectedCategory, searchQuery, favorites]);

  return (
    <div className="gallery-page-container">
      {/* Dev Stage A Banner */}
      <div className="stage-a-banner" role="status">
        <div className="banner-left">
          <span className="banner-tag">GIAI ĐOẠN A</span>
          <p className="banner-text">
            Khung ứng dụng tủ đồ đã sẵn sàng. Gallery hiện trạng thái trống theo đúng đặc tả (chưa tạo Trái tim mẫu 1). Bạn có thể mở khối kiểm tra kỹ thuật để thử nghiệm toàn bộ tính năng.
          </p>
        </div>
        <button
          type="button"
          className="btn-open-dev"
          onClick={onNavigateDev}
          title="Mở khối kiểm tra kỹ thuật trong xưởng 3D"
        >
          <Terminal size={15} />
          <span>Mở Khối kiểm tra kỹ thuật</span>
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
