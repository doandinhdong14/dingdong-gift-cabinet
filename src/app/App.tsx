import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './Header';
import GalleryPage from '../pages/GalleryPage';
import AssetDetailPage from '../pages/AssetDetailPage';
import IntegrationPage from '../pages/IntegrationPage';
import GuidePage from '../pages/GuidePage';
import { getAssetById } from '../gift-library/registry';
import { loadFavorites, toggleFavorite } from '../storage/presetStorage';
import { AssetConfig } from '../gift-library/types';
import './App.css';

export const App: React.FC = () => {
  // Current route parsed from window.location.hash
  const [currentHash, setCurrentHash] = useState<string>(() => {
    return window.location.hash || '#/';
  });

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites());

  // Last edited config to optionally carry over to Integration page
  const [lastActiveConfig, setLastActiveConfig] = useState<AssetConfig | undefined>(undefined);

  // Listen to hash change for zero-backend static deep links
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/';
      setCurrentHash(hash);
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((path: string) => {
    const hash = path.startsWith('#') ? path : `#${path.startsWith('/') ? path : `/${path}`}`;
    window.location.hash = hash;
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    const updated = toggleFavorite(id);
    setFavorites([...updated]);
  }, []);

  // Parse path from hash: e.g. "#/asset/dev-box-fixture" -> "/asset/dev-box-fixture"
  const currentPath = useMemo(() => {
    const raw = currentHash.replace(/^#/, '');
    return raw.startsWith('/') ? raw : `/${raw}`;
  }, [currentHash]);

  // Route matching
  const renderCurrentPage = () => {
    // 1. Asset detail page: /asset/:id
    if (currentPath.startsWith('/asset/')) {
      const assetId = currentPath.replace('/asset/', '');
      const entry = getAssetById(assetId);

      if (!entry) {
        return (
          <div className="not-found-page">
            <h3>Không tìm thấy tài nguyên "{assetId}"</h3>
            <p>Mẫu này có thể chưa được khai báo trong hệ thống hoặc đường dẫn không đúng.</p>
            <button
              type="button"
              className="btn-primary-action"
              onClick={() => navigate('/')}
            >
              Về Bộ sưu tập
            </button>
          </div>
        );
      }

      return (
        <AssetDetailPage
          entry={entry}
          isFavorite={favorites.includes(entry.manifest.id)}
          onToggleFavorite={handleToggleFavorite}
          onBackToGallery={() => navigate('/')}
          onOpenCardIntegration={(cfg) => {
            setLastActiveConfig(cfg);
            navigate('/integration');
          }}
        />
      );
    }

    // 2. Integration page: /integration
    if (currentPath === '/integration') {
      return <IntegrationPage lastActiveConfig={lastActiveConfig} />;
    }

    // 3. Guide page: /guide
    if (currentPath === '/guide') {
      return <GuidePage />;
    }

    // 4. Default: Gallery page /
    return (
      <GalleryPage
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        onSelectAsset={(id) => navigate(`/asset/${id}`)}
        onNavigateDev={() => navigate('/asset/dev-box-fixture')}
      />
    );
  };

  return (
    <div className="app-root">
      <Header currentPath={currentPath} onNavigate={navigate} />
      <div className="app-content-body">{renderCurrentPage()}</div>
    </div>
  );
};

export default App;
