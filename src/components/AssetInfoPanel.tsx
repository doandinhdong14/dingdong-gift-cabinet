import React from 'react';
import { Tag, Package, Shield, User, Activity, Layers } from 'lucide-react';
import { AssetManifest } from '../gift-library/types';

export interface AssetInfoPanelProps {
  manifest: AssetManifest;
}

export const AssetInfoPanel: React.FC<AssetInfoPanelProps> = ({ manifest }) => {
  const getStatusBadge = (status: AssetManifest['status']) => {
    switch (status) {
      case 'approved':
        return <span className="status-badge approved">Đã duyệt (Approved)</span>;
      case 'review':
        return <span className="status-badge review">Đang xem xét (Review)</span>;
      case 'draft':
      default:
        return <span className="status-badge draft">Bản nháp / Thử nghiệm (Draft)</span>;
    }
  };

  return (
    <div className="asset-info-panel" role="region" aria-label="Thông tin kỹ thuật tài nguyên">
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Định danh (ID)</span>
          <span className="info-value font-mono">{manifest.id}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Phiên bản</span>
          <span className="info-value">v{manifest.version}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Trạng thái</span>
          <span className="info-value">{getStatusBadge(manifest.status)}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Loại tài nguyên</span>
          <span className="info-value">
            {manifest.kind.toUpperCase()} • Phương pháp: {manifest.source}
          </span>
        </div>

        <div className="info-item">
          <span className="info-label">
            <User size={14} /> Tác giả
          </span>
          <span className="info-value">{manifest.author}</span>
        </div>

        <div className="info-item">
          <span className="info-label">
            <Shield size={14} /> Giấy phép
          </span>
          <span className="info-value">{manifest.license}</span>
        </div>
      </div>

      <div className="info-section">
        <h5 className="info-section-title">
          <Layers size={14} /> Mô tả
        </h5>
        <p className="info-description">{manifest.description}</p>
      </div>

      <div className="info-section">
        <h5 className="info-section-title">
          <Package size={14} /> Thư viện phụ thuộc (Dependencies)
        </h5>
        <div className="tag-cloud">
          {manifest.dependencies.map((dep) => (
            <span key={dep} className="code-pill">
              {dep}
            </span>
          ))}
        </div>
      </div>

      <div className="info-section">
        <h5 className="info-section-title">
          <Activity size={14} /> Chuyển động hỗ trợ
        </h5>
        <div className="tag-cloud">
          {manifest.supportedMotions.map((m) => (
            <span key={m} className="motion-pill">
              {m}
            </span>
          ))}
        </div>
      </div>

      <div className="info-section">
        <h5 className="info-section-title">
          <Tag size={14} /> Thẻ phân loại (Tags)
        </h5>
        <div className="tag-cloud">
          {manifest.tags.map((tag) => (
            <span key={tag} className="tag-pill">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssetInfoPanel;
