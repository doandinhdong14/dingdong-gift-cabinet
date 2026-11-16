import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Heart,
  Sliders,
  Bookmark,
  Code,
  Info,
  Terminal,
  Check,
  AlertCircle,
} from 'lucide-react';
import { AssetConfig, Preset, RegistryEntry } from '../gift-library/types';
import { AssetViewer } from '../viewer/AssetViewer';
import { ParameterPanel } from '../components/ParameterPanel';
import { PresetManager } from '../components/PresetManager';
import { UsageSnippet } from '../components/UsageSnippet';
import { AssetInfoPanel } from '../components/AssetInfoPanel';
import { SavePresetModal } from '../components/SavePresetModal';
import {
  loadUserPresets,
  saveUserPreset,
  updateUserPreset,
  deleteUserPreset,
} from '../storage/presetStorage';
import {
  generateConfigJson,
  generateJsxSnippet,
  generateAiInstructions,
} from '../utils/codeGeneration';

export interface AssetDetailPageProps {
  entry: RegistryEntry;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onBackToGallery: () => void;
  onOpenCardIntegration: (config: AssetConfig) => void;
}

type DetailTab = 'params' | 'presets' | 'usage' | 'info';

export const AssetDetailPage: React.FC<AssetDetailPageProps> = ({
  entry,
  isFavorite,
  onToggleFavorite,
  onBackToGallery,
}) => {
  const { manifest, defaultConfig, defaultPresets, loadComponent } = entry;

  // Active runtime configuration for the 3D model
  const [config, setConfig] = useState<AssetConfig>(defaultConfig);

  // Active tab in controls panel
  const [activeTab, setActiveTab] = useState<DetailTab>('params');

  // User presets loaded from localStorage
  const [userPresets, setUserPresets] = useState<Preset[]>([]);
  const [storageWarning, setStorageWarning] = useState<string | undefined>(undefined);

  // Modal for saving new preset
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // Toast notification for actions
  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(null);
  const [copyStatus, setCopyStatus] = useState<{ type: string; success: boolean } | null>(null);

  const showToast = useCallback((message: string, isError: boolean = false) => {
    setToast({ message, isError });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  // Load user presets on mount or asset change
  useEffect(() => {
    const { presets, warning } = loadUserPresets(manifest.id);
    setUserPresets(presets);
    setStorageWarning(warning);
    // Reset config to default on asset switch
    setConfig(defaultConfig);
  }, [manifest.id, defaultConfig]);

  // Reset model parameters to default (does NOT delete saved presets)
  const handleResetModel = useCallback(() => {
    setConfig({ ...defaultConfig });
    showToast('Đã đặt lại thông số mẫu về cấu hình chuẩn.');
  }, [defaultConfig, showToast]);

  // Save new user preset
  const handleSavePreset = useCallback(
    (presetName: string) => {
      const newPreset: Preset = {
        id: `preset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: presetName,
        assetId: manifest.id,
        assetVersion: manifest.version,
        config: JSON.parse(JSON.stringify(config)),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isBuiltIn: false,
      };

      const res = saveUserPreset(manifest.id, newPreset);
      if (res.success) {
        setUserPresets(res.presets);
        showToast(`Đã lưu biến thể "${presetName}" thành công!`);
      } else {
        showToast(res.error || 'Không thể lưu biến thể.', true);
      }
    },
    [manifest.id, manifest.version, config, showToast]
  );

  // Apply a preset
  const handleApplyPreset = useCallback((preset: Preset) => {
    setConfig(JSON.parse(JSON.stringify(preset.config)));
    showToast(`Đã áp dụng biến thể "${preset.name}".`);
  }, [showToast]);

  // Delete a user preset
  const handleDeletePreset = useCallback(
    (presetId: string) => {
      const res = deleteUserPreset(manifest.id, presetId);
      if (res.success) {
        setUserPresets(res.presets);
        showToast('Đã xóa biến thể thành công.');
      } else {
        showToast(res.error || 'Lỗi khi xóa biến thể.', true);
      }
    },
    [manifest.id, showToast]
  );

  // Rename a user preset
  const handleRenamePreset = useCallback(
    (presetId: string, newName: string) => {
      const res = updateUserPreset(manifest.id, presetId, { name: newName });
      if (res.success) {
        setUserPresets(res.presets);
        showToast(`Đã đổi tên thành "${newName}".`);
      } else {
        showToast(res.error || 'Lỗi khi đổi tên.', true);
      }
    },
    [manifest.id, showToast]
  );

  // Import presets
  const handleImportPresets = useCallback(
    (imported: Preset[]) => {
      // Save each to storage
      let updated = [...userPresets];
      for (const p of imported) {
        const res = saveUserPreset(manifest.id, p);
        if (res.success) {
          updated = res.presets;
        }
      }
      setUserPresets(updated);
      showToast(`Đã nhập ${imported.length} biến thể vào danh sách.`);
    },
    [manifest.id, userPresets, showToast]
  );

  // Clipboard copy helpers
  const copyToClipboard = async (text: string, type: string, label: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopyStatus({ type, success: true });
        showToast(`Đã sao chép ${label} vào Clipboard!`);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      setCopyStatus({ type, success: false });
      showToast(`Không thể tự động sao chép. Vui lòng mở tab "Cách sử dụng" để sao chép thủ công.`, true);
    }

    setTimeout(() => {
      setCopyStatus(null);
    }, 3000);
  };

  const handleCopyJson = () => {
    const text = generateConfigJson(config);
    copyToClipboard(text, 'json', 'cấu hình JSON');
  };

  const handleCopyJsx = () => {
    const text = generateJsxSnippet(manifest, config);
    copyToClipboard(text, 'jsx', 'mã JSX');
  };

  const handleCopyAiPrompt = () => {
    const text = generateAiInstructions(manifest, config);
    copyToClipboard(text, 'ai', 'chỉ dẫn cho AI');
  };

  const isDevFixture = manifest.id === 'dev-box-fixture';

  return (
    <div className="asset-detail-page">
      {/* Toast popup */}
      {toast && (
        <div className={`toast-notification ${toast.isError ? 'error' : 'success'}`} role="status">
          {toast.isError ? <AlertCircle size={16} /> : <Check size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header / Breadcrumbs */}
      <div className="detail-top-nav">
        <div className="breadcrumbs">
          <button type="button" className="btn-back-link" onClick={onBackToGallery}>
            <ArrowLeft size={16} />
            <span>Bộ sưu tập</span>
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{manifest.name}</span>
          {isDevFixture && <span className="dev-tag"><Terminal size={12} /> Khối kỹ thuật</span>}
        </div>

        <div className="detail-header-actions">
          <button
            type="button"
            className={`btn-header-favorite ${isFavorite ? 'favorited' : ''}`}
            onClick={() => onToggleFavorite(manifest.id)}
            aria-label={isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
          >
            <Heart size={16} fill={isFavorite ? '#F46C91' : 'none'} color={isFavorite ? '#F46C91' : 'currentColor'} />
            <span>{isFavorite ? 'Đã yêu thích' : 'Yêu thích'}</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Left 3D Stage / Right Control Workshop */}
      <div className="detail-stage-layout">
        {/* Left Side: 3D Stage */}
        <div className="stage-left-column">
          <AssetViewer
            manifest={manifest}
            config={config}
            onConfigChange={setConfig}
            loadComponent={loadComponent}
          />
        </div>

        {/* Right Side: Workshop & Parameter Controls */}
        <div className="stage-right-column">
          {/* Tabs bar */}
          <div className="workshop-tabs-nav" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'params'}
              className={`workshop-tab-btn ${activeTab === 'params' ? 'active' : ''}`}
              onClick={() => setActiveTab('params')}
            >
              <Sliders size={16} />
              <span>Tùy chỉnh</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'presets'}
              className={`workshop-tab-btn ${activeTab === 'presets' ? 'active' : ''}`}
              onClick={() => setActiveTab('presets')}
            >
              <Bookmark size={16} />
              <span>Biến thể ({defaultPresets.length + userPresets.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'usage'}
              className={`workshop-tab-btn ${activeTab === 'usage' ? 'active' : ''}`}
              onClick={() => setActiveTab('usage')}
            >
              <Code size={16} />
              <span>Cách sử dụng</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'info'}
              className={`workshop-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              <Info size={16} />
              <span>Thông tin</span>
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="workshop-tab-body">
            {activeTab === 'params' && (
              <ParameterPanel
                config={config}
                defaultConfig={defaultConfig}
                onChange={setConfig}
                onReset={handleResetModel}
                onOpenSavePreset={() => setIsSaveModalOpen(true)}
                onCopyJson={handleCopyJson}
                onCopyJsx={handleCopyJsx}
                onCopyAiPrompt={handleCopyAiPrompt}
                copyStatus={copyStatus}
              />
            )}

            {activeTab === 'presets' && (
              <PresetManager
                assetId={manifest.id}
                defaultPresets={defaultPresets}
                userPresets={userPresets}
                activeConfig={config}
                onApplyPreset={handleApplyPreset}
                onDeletePreset={handleDeletePreset}
                onRenamePreset={handleRenamePreset}
                onImportPresets={handleImportPresets}
                onApplyImportedConfig={(cfg) => {
                  setConfig(cfg);
                  setActiveTab('params');
                }}
                storageWarning={storageWarning}
              />
            )}

            {activeTab === 'usage' && (
              <UsageSnippet manifest={manifest} config={config} />
            )}

            {activeTab === 'info' && (
              <AssetInfoPanel manifest={manifest} />
            )}
          </div>
        </div>
      </div>

      {/* Save Preset Modal */}
      <SavePresetModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSavePreset}
        config={config}
      />
    </div>
  );
};

export default AssetDetailPage;
