import React from 'react';
import { Search, X, Sparkles, Heart, Box, Mail, Gift, Send, Palette } from 'lucide-react';
import { CATEGORIES, CategoryName } from '../gift-library/registry';

export interface AssetFiltersProps {
  selectedCategory: CategoryName;
  onSelectCategory: (cat: CategoryName) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  categoryCounts: Record<CategoryName, number>;
}

export const AssetFilters: React.FC<AssetFiltersProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  categoryCounts,
}) => {
  const getCategoryIcon = (category: CategoryName) => {
    switch (category) {
      case 'Tất cả':
        return <Sparkles size={16} />;
      case 'Trái tim':
        return <Heart size={16} />;
      case 'Phong bì':
        return <Mail size={16} />;
      case 'Hộp quà':
        return <Gift size={16} />;
      case 'Máy bay':
        return <Send size={16} />;
      case 'Trang trí':
        return <Box size={16} />;
      case 'Yêu thích':
        return <Palette size={16} />;
    }
  };

  return (
    <aside className="asset-filters-sidebar" role="search" aria-label="Bộ lọc danh mục và tìm kiếm">
      {/* Search Input */}
      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên, ID, thẻ (hỗ trợ không dấu)..."
            className="search-input"
            aria-label="Tìm kiếm chi tiết trang trí"
          />
          {searchQuery && (
            <button
              type="button"
              className="btn-clear-search"
              onClick={() => onSearchChange('')}
              aria-label="Xóa từ khóa tìm kiếm"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="categories-container">
        <h4 className="categories-header">Danh mục chi tiết</h4>
        <nav className="categories-list" aria-label="Danh sách danh mục">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat] || 0;
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                type="button"
                className={`category-item-btn ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat)}
                aria-current={isSelected ? 'true' : undefined}
              >
                <span className="category-left">
                  {getCategoryIcon(cat)}
                  <span className="category-label">{cat}</span>
                </span>
                <span className="category-count-badge">{count}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default AssetFilters;
