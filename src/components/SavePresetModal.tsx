import React, { useState } from 'react';
import { BookmarkPlus, X, AlertCircle } from 'lucide-react';
import { AssetConfig } from '../gift-library/types';

export interface SavePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (presetName: string) => void;
  config: AssetConfig;
}

export const SavePresetModal: React.FC<SavePresetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  config,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Vui lòng nhập tên biến thể (1-60 ký tự).');
      return;
    }
    if (trimmed.length > 60) {
      setError('Tên biến thể không được vượt quá 60 ký tự.');
      return;
    }

    onSave(trimmed);
    setName('');
    setError(null);
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-save-title">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title-row">
            <BookmarkPlus size={20} className="text-primary" />
            <h3 id="modal-save-title">Lưu biến thể mới</h3>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Đóng cửa sổ">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="modal-hint">
              Lưu toàn bộ màu sắc, tỉ lệ và chuyển động hiện tại thành một biến thể riêng trong trình duyệt.
            </p>

            <div className="preset-preview-summary">
              <div
                className="color-pill-sample"
                style={{ backgroundColor: config.appearance.color }}
              />
              <div className="summary-texts">
                <span>Màu: <strong>{config.appearance.color}</strong></span>
                <span>Tỉ lệ: <strong>{config.transform.scale}x</strong></span>
                <span>Lơ lửng: <strong>{config.motion.float.enabled ? 'Bật' : 'Tắt'}</strong></span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="preset-name-input" className="form-label">
                Tên biến thể <span className="char-count">({name.length}/60)</span>
              </label>
              <input
                id="preset-name-input"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                maxLength={60}
                placeholder="Ví dụ: Hồng pastel lơ lửng nhẹ..."
                className={`form-input ${error ? 'input-error' : ''}`}
                autoFocus
              />
              {error && (
                <div className="form-error-msg">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-primary-action">
              Lưu biến thể
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SavePresetModal;
