import React from 'react';
import { Gift, Sparkles, Layers, BookOpen, Terminal } from 'lucide-react';

export interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate }) => {
  return (
    <header className="app-header" role="banner">
      <div className="header-container">
        {/* Brand logo */}
        <div className="header-brand" onClick={() => onNavigate('/')}>
          <div className="brand-icon">
            <Gift size={22} />
          </div>
          <div className="brand-text">
            <h1 className="brand-title">DingDong Gift</h1>
            <span className="brand-subtitle">Tủ đồ sáng tạo</span>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="header-nav" role="navigation" aria-label="Điều hướng chính">
          <button
            type="button"
            className={`nav-link ${currentPath === '/' || currentPath.startsWith('/asset') ? 'active' : ''}`}
            onClick={() => onNavigate('/')}
          >
            <Layers size={16} />
            <span>Bộ sưu tập</span>
          </button>

          <button
            type="button"
            className={`nav-link ${currentPath === '/integration' ? 'active' : ''}`}
            onClick={() => onNavigate('/integration')}
          >
            <Sparkles size={16} />
            <span>Thử trên thiệp</span>
          </button>

          <button
            type="button"
            className={`nav-link ${currentPath === '/guide' ? 'active' : ''}`}
            onClick={() => onNavigate('/guide')}
          >
            <BookOpen size={16} />
            <span>Hướng dẫn</span>
          </button>

          {/* Dev Test Fixture Quick Link */}
          <button
            type="button"
            className={`nav-link dev-link ${currentPath === '/asset/dev-box-fixture' ? 'active' : ''}`}
            onClick={() => onNavigate('/asset/dev-box-fixture')}
            title="Mở khối kiểm tra kỹ thuật nội bộ (Pipeline Dev Fixture)"
          >
            <Terminal size={15} />
            <span>Khu kiểm tra Dev</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
