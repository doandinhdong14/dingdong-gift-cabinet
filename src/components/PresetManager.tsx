import React, { useState, useRef } from 'react';
import {
  Bookmark,
  Check,
  Trash2,
  Edit2,
  Download,
  Upload,
  Info,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Preset, AssetConfig } from '../gift-library/types';
import {
  generatePresetExportJson,
} from '../utils/codeGeneration';
import { parseAndValidateImport } from '../utils/configValidation';

export interface PresetManagerProps {
  assetId: string;
  defaultPresets: Preset[];
  userPresets: Preset[];
  activeConfig: AssetConfig;
  onApplyPreset: (preset: Preset) => void;
  onDeletePreset: (presetId: string) => void;
  onRenamePreset: (presetId: string, newName: string) => void;
  onImportPresets: (importedPresets: Preset[]) => void;
  onApplyImportedConfig: (config: AssetConfig) => void;
  storageWarning?: string;
}

export const PresetManager: React.FC<PresetManagerProps> = ({
  assetId,
  defaultPresets,
  userPresets,
  activeConfig,
  onApplyPreset,
  onDeletePreset,
  onRenamePreset,
  onImportPresets,
  onApplyImportedConfig,
  storageWarning,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [importNotice, setImportNotice] = useState<{ message: string; isError: boolean } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Combine default and user presets
  const allPresets = [...defaultPresets, ...userPresets];

  // Check if a preset is actively applied by comparing color and scale
  const isPresetActive = (p: Preset) => {
    return (
      p.config.appearance.color.toLowerCase() === activeConfig.appearance.color.toLowerCase() &&
      p.config.appearance.roughness === activeConfig.appearance.roughness &&
      p.config.transform.scale === activeConfig.transform.scale
    );
  };

  const handleStartRename = (preset: Preset) => {
    setEditingId(preset.id);
    setEditingName(preset.name);
  };

  const handleSaveRename = (presetId: string) => {
    if (!editingName.trim()) return;
    onRenamePreset(presetId, editingName.trim());
    setEditingId(null);
  };

  const handleExportPresets = () => {
    const jsonStr = generatePresetExportJson(allPresets);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dingdong-presets-${assetId}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024) {
      setImportNotice({
        message: 'File vượt quá giới hạn 100 KB. Vui lòng kiểm tra lại.',
        isError: true,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const res = parseAndValidateImport(text, assetId);

      if (!res.valid) {
        setImportNotice({
          message: `Lỗi nhập dữ liệu: ${res.errors.join('; ')}`,
          isError: true,
        });
        return;
      }

      if (res.data?.type === 'presets-list' && res.data.presets) {
        onImportPresets(res.data.presets);
        setImportNotice({
          message: `Đã nhập thành công ${res.data.presets.length} biến thể!`,
          isError: false,
        });
      } else if (res.data?.type === 'single-config' && res.data.config) {
        onApplyImportedConfig(res.data.config);
        setImportNotice({
          message: 'Đã nạp thành công cấu hình đơn lẻ vào xưởng thử!',
          isError: false,
        });
      }

      if (res.warnings.length > 0) {
        console.warn('Import warnings:', res.warnings);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="preset-manager" role="region" aria-label="Quản lý biến thể đã lưu">
      {/* Privacy & Storage Notice */}
      <div className="notice-box info">
        <Info size={16} className="notice-icon" />
        <div className="notice-text">
          Dữ liệu biến thể được lưu trong trình duyệt hiện tại (localStorage) và không đồng bộ qua đám mây.
        </div>
      </div>

      {storageWarning && (
        <div className="notice-box warning">
          <AlertTriangle size={16} className="notice-icon" />
          <div className="notice-text">{storageWarning}</div>
        </div>
      )}

      {importNotice && (
        <div className={`notice-box ${importNotice.isError ? 'error' : 'success'}`}>
          {importNotice.isError ? <AlertTriangle size={16} /> : <Check size={16} />}
          <div className="notice-text">{importNotice.message}</div>
        </div>
      )}

      {/* Preset List */}
      <div className="preset-list">
        {allPresets.map((preset) => {
          const active = isPresetActive(preset);
          const isBuiltIn = Boolean(preset.isBuiltIn);

          return (
            <div
              key={preset.id}
              className={`preset-card ${active ? 'active-preset' : ''}`}
            >
              <div
                className="preset-color-badge"
                style={{ backgroundColor: preset.config.appearance.color }}
                title={`Mã màu: ${preset.config.appearance.color}`}
              />

              <div className="preset-details" onClick={() => onApplyPreset(preset)}>
                {editingId === preset.id ? (
                  <div className="preset-rename-box" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      maxLength={60}
                      className="input-rename"
                      autoFocus
                    />
                    <button
                      type="button"
                      className="btn-confirm-rename"
                      onClick={() => handleSaveRename(preset.id)}
                    >
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="preset-title-row">
                      <span className="preset-name">{preset.name}</span>
                      {isBuiltIn ? (
                        <span className="badge-system">
                          <ShieldCheck size={12} /> Mẫu gốc
                        </span>
                      ) : (
                        <span className="badge-user">Tự tạo</span>
                      )}
                    </div>
                    <div className="preset-meta">
                      Màu: {preset.config.appearance.color} • Roughness: {preset.config.appearance.roughness.toFixed(2)}
                    </div>
                  </>
                )}
              </div>

              <div className="preset-actions">
                <button
                  type="button"
                  className={`btn-apply-preset ${active ? 'current' : ''}`}
                  onClick={() => onApplyPreset(preset)}
                  title="Áp dụng cấu hình này vào mô hình"
                >
                  {active ? <Check size={16} /> : <Bookmark size={16} />}
                  <span>{active ? 'Đang dùng' : 'Áp dụng'}</span>
                </button>

                {!isBuiltIn && (
                  <>
                    <button
                      type="button"
                      className="btn-icon-subtle"
                      onClick={() => handleStartRename(preset)}
                      title="Đổi tên biến thể"
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      type="button"
                      className="btn-icon-subtle danger"
                      onClick={() => setDeleteConfirmId(preset.id)}
                      title="Xóa biến thể"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete confirmation dialog */}
      {deleteConfirmId && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h4>Xác nhận xóa biến thể?</h4>
            <p>Biến thể này sẽ bị xóa khỏi bộ nhớ trình duyệt và không thể phục hồi.</p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDeleteConfirmId(null)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  onDeletePreset(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
              >
                Xóa biến thể
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import / Export Controls */}
      <div className="preset-io-footer">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json,application/json"
          style={{ display: 'none' }}
        />

        <button
          type="button"
          className="btn-footer-io"
          onClick={() => fileInputRef.current?.click()}
          title="Nhập file JSON cấu hình hoặc danh sách biến thể (tối đa 100 KB)"
        >
          <Upload size={14} /> Nhập JSON (Sao lưu)
        </button>

        <button
          type="button"
          className="btn-footer-io"
          onClick={handleExportPresets}
          title="Tải xuống toàn bộ biến thể dưới dạng file JSON"
        >
          <Download size={14} /> Xuất JSON biến thể
        </button>
      </div>
    </div>
  );
};

export default PresetManager;
