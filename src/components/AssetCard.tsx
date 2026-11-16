import React from 'react';
import { Heart, ArrowRight, ShieldCheck, Clock, FileEdit } from 'lucide-react';
import { AssetManifest } from '../gift-library/types';
import { resolveAssetUrl } from '../utils/assetUrl';

export interface AssetCardProps {
  manifest: AssetManifest;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSelect: (id: string) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  manifest,
  isFavorite,
  onToggleFavorite,
  onSelect,
}) => {
  const getStatusBadge = (status: AssetManifest['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="card-badge approved" title="Mẫu đã qua kiểm duyệt chính thức">
            <ShieldCheck size={12} /> Đã duyệt
          </span>
        );
      case 'review':
        return (
          <span className="card-badge review" title="Mẫu đang chờ chủ dự án kiểm tra hình ảnh">
            <Clock size={12} /> Chờ duyệt
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="card-badge draft" title="Bản nháp thử nghiệm kỹ thuật">
            <FileEdit size={12} /> Bản nháp
          </span>
        );
    }
  };

  return (
    <div className="asset-card" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onSelect(manifest.id)}>
      {/* Thumbnail area with fallback */}
      <div className="card-thumbnail-container" onClick={() => onSelect(manifest.id)}>
        <img
          src={resolveAssetUrl(manifest.thumbnail)}
          alt={`Hình thu nhỏ của ${manifest.name}`}
          className="card-thumbnail-img"
          loading="lazy"
          onError={(e) => {
            // Fallback to SVG if thumbnail image fails
            (e.target as HTMLImageElement).src = resolveAssetUrl(manifest.fallback);
          }}
        />

        <div className="card-top-badges">
          <span className="card-badge kind">{manifest.kind.toUpperCase()}</span>
          {getStatusBadge(manifest.status)}
        </div>

        <button
          type="button"
          className={`btn-card-favorite ${isFavorite ? 'favorited' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(manifest.id);
          }}
          aria-label={isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
          title={isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
        >
          <Heart size={16} fill={isFavorite ? '#F46C91' : 'none'} color={isFavorite ? '#F46C91' : '#6B7280'} />
        </button>
      </div>

      {/* Card Info */}
      <div className="card-body">
        <div className="card-header-row">
          <h3 className="card-title" onClick={() => onSelect(manifest.id)}>
            {manifest.name}
          </h3>
          <span className="card-version">v{manifest.version}</span>
        </div>

        <p className="card-description">{manifest.description}</p>

        <div className="card-footer-row">
          <div className="card-tags">
            {manifest.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="card-tag">
                #{tag}
              </span>
            ))}
          </div>

          <button
            type="button"
            className="btn-card-action"
            onClick={() => onSelect(manifest.id)}
            aria-label={`Xem mẫu ${manifest.name}`}
          >
            <span>Xem mẫu</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetCard;
