import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Upload,
  Trash2,
  RefreshCw,
  Sparkles,
  Type,
  Box,
  Compass,
  CheckCircle2,
  Heart,
  Plus,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { AssetConfig, UniverseConfig, UniverseDecorationGroup } from '../gift-library/types';
import {
  getAllUniversePhotos,
  saveUniversePhoto,
  deleteUniversePhoto,
  clearAllUniversePhotos,
  StoredUniversePhoto,
} from '../storage/universeImageStorage';
import { DEFAULT_WISHES } from '../gift-library/objects/love-universe-01/presets';

export interface UniverseParameterPanelProps {
  config: AssetConfig;
  onChange: (updated: AssetConfig) => void;
}

interface GroupFallSpeedControlProps {
  label: string;
  enabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  speed: number;
  onChangeSpeed: (speed: number) => void;
  onResetDefault: () => void;
  globalMultiplier: number;
  globalDriftEnabled?: boolean;
  defaultSpeed?: number;
}

const GroupFallSpeedControl: React.FC<GroupFallSpeedControlProps> = ({
  label,
  enabled,
  onToggleEnabled,
  speed,
  onChangeSpeed,
  onResetDefault,
  globalMultiplier,
  globalDriftEnabled = true,
  defaultSpeed = 0.35,
}) => {
  const effectiveSpeed = (globalDriftEnabled && enabled) ? speed * globalMultiplier : 0;
  const isZeroOrStopped = !globalDriftEnabled || !enabled || speed === 0 || globalMultiplier === 0;

  return (
    <div
      className="group-fall-speed-box"
      style={{
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        padding: '10px 12px',
        marginTop: '10px',
        marginBottom: '6px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <label className="checkbox-control-label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggleEnabled(e.target.checked)}
          />
          <span>Bật rơi ({label})</span>
        </label>

        <button
          type="button"
          className="btn-text-action"
          onClick={onResetDefault}
          title={`Khôi phục tốc độ rơi mặc định (${defaultSpeed.toFixed(2)} u/s)`}
          style={{ fontSize: '0.74rem', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '3px' }}
        >
          <RotateCcw size={11} /> Mặc định ({defaultSpeed.toFixed(2)})
        </button>
      </div>

      <div className="param-row" style={{ marginBottom: 0 }}>
        <div className="param-label-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span className="param-label" style={{ fontSize: '0.8rem', color: '#475569' }}>
            Tốc độ rơi (0 – 3.0 u/s)
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="number"
              min="0"
              max="3.0"
              step="0.05"
              value={Number(speed.toFixed(2))}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onChangeSpeed(isNaN(val) ? 0 : Math.max(0, Math.min(3.0, val)));
              }}
              style={{
                width: '60px',
                padding: '2px 6px',
                fontSize: '0.82rem',
                borderRadius: '4px',
                border: '1px solid #CBD5E1',
                textAlign: 'right',
              }}
            />
            <span className="param-value-tag" style={{ fontSize: '0.78rem' }}>
              {speed.toFixed(2)} u/s
            </span>
          </div>
        </div>

        <div className="slider-container">
          <input
            type="range"
            min="0"
            max="3.0"
            step="0.05"
            value={speed}
            onChange={(e) => onChangeSpeed(parseFloat(e.target.value))}
            className="param-slider"
          />
          <div className="slider-limits" style={{ fontSize: '0.72rem' }}>
            <span>0 (Đứng yên)</span>
            <span>{defaultSpeed.toFixed(2)} (Mặc định)</span>
            <span>3.0 (Rất nhanh)</span>
          </div>
        </div>

        <div style={{ marginTop: '4px', fontSize: '0.74rem', color: isZeroOrStopped ? '#EF4444' : '#059669' }}>
          {isZeroOrStopped ? (
            <span>
              ⏸ <em>Đang đứng yên (không rơi)</em>
              {!enabled
                ? ' — Đã tắt Bật rơi'
                : speed === 0
                ? ' — Tốc độ = 0'
                : !globalDriftEnabled
                ? ' — Rơi toàn cảnh đang tắt'
                : ' — Hệ số chung = 0'}
            </span>
          ) : (
            <span>
              ✓ Tốc độ thực tế: <strong>{effectiveSpeed.toFixed(2)} u/s</strong>
              {globalMultiplier !== 1.0 && ` (${speed.toFixed(2)} × ${globalMultiplier.toFixed(2)}x hệ số chung)`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const UniverseParameterPanel: React.FC<UniverseParameterPanelProps> = ({
  config,
  onChange,
}) => {
  const u: UniverseConfig = {
    wishes: [...DEFAULT_WISHES],
    textCount: 110,
    photoCount: 10,
    heartCount: 20,
    cloudWidth: 6.8,
    cloudHeight: 7.2,
    cloudDepth: 5.6,
    rotationSpeed: 1.5,
    textColor: '#FFFDF0',
    glowIntensity: 1.0,
    heartColor: '#FF3824',
    seed: 42,
    showIntro: true,
    glowEnabled: true,
    glowSpread: 0.5,
    glowColor: '#FFBE28',
    textScaleFactor: 1.15,
    photoScaleFactor: 0.72,
    heartScaleFactor: 1.0,
    heartRoughness: 0.35,
    heartSpinSpeed: 1.0,
    heartFloatAmp: 0.14,
    driftEnabled: true,
    driftSpeed: 0.35,
    globalSpeedMultiplier: 1.0,
    textDriftEnabled: true,
    textDriftSpeed: 0.35,
    photoDriftEnabled: true,
    photoDriftSpeed: 0.35,
    heartDriftEnabled: true,
    heartDriftSpeed: 0.35,
    decorations: [],
    ...(config.universe || {}),
  };

  const [savedPhotos, setSavedPhotos] = useState<StoredUniversePhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [photoFeedback, setPhotoFeedback] = useState<string | null>(null);
  const [wishesText, setWishesText] = useState(() => (u.wishes || []).join('\n'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state for adding new decoration group
  const [showAddDeco, setShowAddDeco] = useState(false);
  const [newDecoType, setNewDecoType] = useState<'heart' | 'star3d' | 'giftbox'>('star3d');
  const [newDecoName, setNewDecoName] = useState('Ngôi sao 3D');
  const [newDecoCount, setNewDecoCount] = useState(12);
  const [newDecoColor, setNewDecoColor] = useState('#FFD700');
  const [newDecoScale, setNewDecoScale] = useState(1.0);
  const [newDecoSpeed, setNewDecoSpeed] = useState(1.0);
  const [newDecoDriftEnabled, setNewDecoDriftEnabled] = useState(true);
  const [newDecoDriftSpeed, setNewDecoDriftSpeed] = useState(0.35);

  // Load photos from IndexedDB on mount
  useEffect(() => {
    let active = true;
    getAllUniversePhotos().then((photos) => {
      if (active) {
        setSavedPhotos(photos);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const updateUniverse = useCallback(
    (patch: Partial<UniverseConfig>) => {
      const updatedUniverse: UniverseConfig = {
        ...u,
        ...patch,
      };

      const updatedConfig: AssetConfig = {
        ...config,
        appearance: {
          ...config.appearance,
          color: patch.textColor ?? u.textColor ?? config.appearance.color,
        },
        motion: {
          ...config.motion,
          spin: {
            ...config.motion.spin,
            speedDegPerSecond: patch.rotationSpeed ?? u.rotationSpeed ?? config.motion.spin.speedDegPerSecond,
          },
        },
        universe: updatedUniverse,
      };

      onChange(updatedConfig);
    },
    [u, config, onChange]
  );

  // Handle wish text change (multiline input)
  const handleWishesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setWishesText(text);
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    updateUniverse({
      wishes: lines.length > 0 ? lines : ['Yêu cậu'],
    });
  };

  // Reset wishes to defaults
  const handleResetWishes = () => {
    setWishesText(DEFAULT_WISHES.join('\n'));
    updateUniverse({ wishes: [...DEFAULT_WISHES] });
  };

  // Reset text lighting to video reference standards
  const handleResetLighting = () => {
    updateUniverse({
      glowEnabled: true,
      glowIntensity: 1.0,
      glowSpread: 0.5,
      textColor: '#FFFDF0',
      glowColor: '#FFBE28',
      textScaleFactor: 1.15,
    });
  };

  // Upload user photos to IndexedDB
  const handleUploadPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setPhotoFeedback(null);
    let successCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        await saveUniversePhoto(file);
        successCount++;
      }

      const refreshed = await getAllUniversePhotos();
      setSavedPhotos(refreshed);
      setPhotoFeedback(`Đã lưu thành công ${successCount} ảnh vào IndexedDB!`);
      setTimeout(() => setPhotoFeedback(null), 3500);
    } catch (err) {
      console.error('Error saving photos to IndexedDB:', err);
      setPhotoFeedback('Có lỗi khi lưu ảnh vào trình duyệt.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Delete a single photo
  const handleDeletePhoto = async (id: string) => {
    try {
      await deleteUniversePhoto(id);
      const refreshed = await getAllUniversePhotos();
      setSavedPhotos(refreshed);
    } catch (err) {
      console.error('Error deleting photo:', err);
    }
  };

  // Clear all saved photos
  const handleClearAllPhotos = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tất cả ảnh kỷ niệm đã lưu trong IndexedDB?')) {
      return;
    }
    try {
      await clearAllUniversePhotos();
      setSavedPhotos([]);
      setPhotoFeedback('Đã xóa sạch toàn bộ ảnh lưu trữ.');
      setTimeout(() => setPhotoFeedback(null), 3000);
    } catch (err) {
      console.error('Error clearing photos:', err);
    }
  };

  // Randomize seed
  const handleRandomSeed = () => {
    const newSeed = Math.floor(Math.random() * 90000) + 1000;
    updateUniverse({ seed: newSeed });
  };

  // Add decorative group
  const handleAddDecorationGroup = () => {
    const defaultTitle = newDecoType === 'star3d'
      ? 'Ngôi sao 3D'
      : newDecoType === 'giftbox'
      ? 'Hộp quà 3D'
      : 'Trái tim 3D';

    const newGroup: UniverseDecorationGroup = {
      id: `deco_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: newDecoType,
      name: newDecoName.trim() || defaultTitle,
      count: newDecoCount,
      color: newDecoColor,
      scale: newDecoScale,
      spinSpeed: newDecoSpeed,
      enabled: true,
      driftEnabled: newDecoDriftEnabled,
      driftSpeed: newDecoDriftSpeed,
    };

    const updated = [...(u.decorations || []), newGroup];
    updateUniverse({ decorations: updated });
    setShowAddDeco(false);
  };

  const handleUpdateDeco = (id: string, patch: Partial<UniverseDecorationGroup>) => {
    const updated = (u.decorations || []).map((d) =>
      d.id === id ? { ...d, ...patch } : d
    );
    updateUniverse({ decorations: updated });
  };

  const handleToggleDeco = (id: string) => {
    const updated = (u.decorations || []).map((d) =>
      d.id === id ? { ...d, enabled: !d.enabled } : d
    );
    updateUniverse({ decorations: updated });
  };

  const handleDeleteDeco = (id: string) => {
    const updated = (u.decorations || []).filter((d) => d.id !== id);
    updateUniverse({ decorations: updated });
  };

  return (
    <div className="parameter-panel-body universe-parameter-panel">
      {/* SECTION 1: CÂU CHÚC */}
      <section className="param-section">
        <div className="section-header-row">
          <h4 className="section-title">
            <Type size={16} /> 1. Câu chúc & Lời nhắn gửi
          </h4>
          <button
            type="button"
            className="btn-text-action"
            onClick={handleResetWishes}
            title="Khôi phục danh sách câu chúc mẫu"
          >
            <RefreshCw size={12} /> Đặt lại mẫu chúc
          </button>
        </div>

        <div className="param-row">
          <label htmlFor="universe-wishes-input" className="param-label">
            Danh sách câu chúc (mỗi câu một dòng)
          </label>
          <textarea
            id="universe-wishes-input"
            className="universe-wishes-textarea"
            rows={5}
            value={wishesText}
            onChange={handleWishesChange}
            placeholder="Nhập mỗi câu chúc trên một dòng..."
          />
          <span className="param-help-text">
            Hỗ trợ đầy đủ tiếng Việt có dấu. Hệ thống phân bố ngẫu nhiên các câu chúc khắp không gian.
          </span>
        </div>

        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="param-text-count" className="param-label">
              Mật độ / Số lượng chữ hiển thị
            </label>
            <span className="param-value-tag">{u.textCount} câu</span>
          </div>
          <div className="slider-container">
            <input
              id="param-text-count"
              type="range"
              min="30"
              max="180"
              step="5"
              value={u.textCount}
              onChange={(e) => updateUniverse({ textCount: parseInt(e.target.value, 10) })}
              className="param-slider"
            />
            <div className="slider-limits">
              <span>30 (Thoáng)</span>
              <span>180 (Dày đặc)</span>
            </div>
          </div>
        </div>

        {/* Falling Speed Control for Text */}
        <GroupFallSpeedControl
          label="Chữ"
          enabled={u.textDriftEnabled ?? true}
          onToggleEnabled={(en) => updateUniverse({ textDriftEnabled: en })}
          speed={u.textDriftSpeed ?? 0.35}
          onChangeSpeed={(sp) => updateUniverse({ textDriftSpeed: sp })}
          onResetDefault={() => updateUniverse({ textDriftEnabled: true, textDriftSpeed: 0.35 })}
          globalMultiplier={u.globalSpeedMultiplier ?? 1.0}
          globalDriftEnabled={u.driftEnabled ?? true}
          defaultSpeed={0.35}
        />
      </section>

      {/* SECTION 2: ÁNH SÁNG CHỮ (TEXT LIGHTING) */}
      <section className="param-section" style={{ borderLeft: '3px solid #FFBE28' }}>
        <div className="section-header-row">
          <h4 className="section-title">
            <Sparkles size={16} /> 2. Ánh sáng chữ (Glow Luminous)
          </h4>
          <button
            type="button"
            className="btn-text-action"
            onClick={handleResetLighting}
            title="Khôi phục thông số ánh sáng chuẩn mẫu video"
          >
            <RotateCcw size={12} /> Khôi phục ánh sáng mẫu
          </button>
        </div>

        {/* Toggle Glow */}
        <div className="param-row">
          <label className="checkbox-control-label">
            <input
              type="checkbox"
              checked={u.glowEnabled ?? true}
              onChange={(e) => updateUniverse({ glowEnabled: e.target.checked })}
            />
            <span className="checkbox-text">
              <strong>Bật quầng sáng phát quang (Glow Halo)</strong>
            </span>
          </label>
        </div>

        {/* Glow Intensity 0 - 3 */}
        <div className="param-row">
          <div className="param-label-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <label htmlFor="param-glow-intensity" className="param-label">
              Cường độ phát sáng hào quang (0 – 3.0)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                id="param-glow-intensity-num"
                type="number"
                min="0"
                max="3.0"
                step="0.05"
                value={Number((u.glowIntensity ?? 1.0).toFixed(2))}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  updateUniverse({ glowIntensity: isNaN(val) ? 0 : Math.max(0, Math.min(3.0, val)) });
                }}
                style={{
                  width: '60px',
                  padding: '2px 6px',
                  fontSize: '0.82rem',
                  borderRadius: '4px',
                  border: '1px solid #CBD5E1',
                  textAlign: 'right',
                }}
              />
              <span className="param-value-tag">{(u.glowIntensity ?? 1.0).toFixed(2)}x</span>
            </div>
          </div>
          <div className="slider-container">
            <input
              id="param-glow-intensity"
              type="range"
              min="0"
              max="3.0"
              step="0.05"
              value={u.glowIntensity ?? 1.0}
              onChange={(e) => updateUniverse({ glowIntensity: parseFloat(e.target.value) })}
              className="param-slider"
            />
            <div className="slider-limits">
              <span>0 (Tắt)</span>
              <span>1.0 (Vừa)</span>
              <span>2.0 (Mạnh)</span>
              <span>3.0 (Rất mạnh)</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
            {[
              { val: 0, label: '0 (Tắt)' },
              { val: 0.25, label: '0.25 (Rất nhẹ)' },
              { val: 0.5, label: '0.5 (Nhẹ)' },
              { val: 1.0, label: '1.0 (Vừa)' },
              { val: 2.0, label: '2.0 (Mạnh)' },
              { val: 3.0, label: '3.0 (Rất mạnh)' },
            ].map((preset) => (
              <button
                key={preset.val}
                type="button"
                className="btn-text-action"
                onClick={() => updateUniverse({ glowIntensity: preset.val, glowEnabled: preset.val > 0 ? true : u.glowEnabled })}
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 6px',
                  background: Math.abs((u.glowIntensity ?? 1.0) - preset.val) < 0.02 ? '#FEF3C7' : '#F1F5F9',
                  border: Math.abs((u.glowIntensity ?? 1.0) - preset.val) < 0.02 ? '1px solid #F59E0B' : '1px solid #CBD5E1',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: Math.abs((u.glowIntensity ?? 1.0) - preset.val) < 0.02 ? 600 : 400,
                  color: Math.abs((u.glowIntensity ?? 1.0) - preset.val) < 0.02 ? '#B45309' : '#475569',
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Glow Spread 0 - 1 */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="param-glow-spread" className="param-label">
              Độ lan quầng sáng (Spread)
            </label>
            <span className="param-value-tag">{(u.glowSpread ?? 0.5).toFixed(2)}</span>
          </div>
          <div className="slider-container">
            <input
              id="param-glow-spread"
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={u.glowSpread ?? 0.5}
              onChange={(e) => updateUniverse({ glowSpread: parseFloat(e.target.value) })}
              className="param-slider"
            />
            <div className="slider-limits">
              <span>0.1 (Gọn)</span>
              <span>1.0 (Lan tỏa rộng)</span>
            </div>
          </div>
        </div>

        {/* Text Color + Glow Color */}
        <div className="param-row-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label className="param-label" style={{ marginBottom: '6px', display: 'block' }}>
              Màu lõi chữ
            </label>
            <div className="color-picker-input-group">
              <input
                type="color"
                value={u.textColor ?? '#FFFDF0'}
                onChange={(e) => updateUniverse({ textColor: e.target.value })}
                className="color-swatch-picker"
              />
              <input
                type="text"
                value={u.textColor ?? '#FFFDF0'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith('#') && val.length <= 7) updateUniverse({ textColor: val });
                }}
                className="color-text-input"
                maxLength={7}
              />
            </div>
          </div>

          <div>
            <label className="param-label" style={{ marginBottom: '6px', display: 'block' }}>
              Màu quầng sáng
            </label>
            <div className="color-picker-input-group">
              <input
                type="color"
                value={u.glowColor ?? '#FFBE28'}
                onChange={(e) => updateUniverse({ glowColor: e.target.value })}
                className="color-swatch-picker"
              />
              <input
                type="text"
                value={u.glowColor ?? '#FFBE28'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith('#') && val.length <= 7) updateUniverse({ glowColor: val });
                }}
                className="color-text-input"
                maxLength={7}
              />
            </div>
          </div>
        </div>

        {/* Text Scale Factor 0.5 - 2.0 */}
        <div className="param-row" style={{ marginTop: '12px' }}>
          <div className="param-label-group">
            <label htmlFor="param-text-scale" className="param-label">
              Kích thước chữ (Hệ số phóng to/thu nhỏ)
            </label>
            <span className="param-value-tag">{(u.textScaleFactor ?? 1.15).toFixed(2)}x</span>
          </div>
          <div className="slider-container">
            <input
              id="param-text-scale"
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={u.textScaleFactor ?? 1.15}
              onChange={(e) => updateUniverse({ textScaleFactor: parseFloat(e.target.value) })}
              className="param-slider"
            />
            <div className="slider-limits">
              <span>0.5x (Nhỏ)</span>
              <span>1.15x (Chuẩn)</span>
              <span>2.0x (Lớn)</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: TRÁI TIM 3D THẬT (PUFFY SOLIDS) */}
      <section className="param-section" style={{ borderLeft: '3px solid #FF3824' }}>
        <h4 className="section-title">
          <Heart size={16} /> 3. Trái tim 3D (Khối đặc phồng)
        </h4>

        {/* Heart Count */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="param-heart-count" className="param-label">
              Số lượng trái tim 3D
            </label>
            <span className="param-value-tag">{u.heartCount} tim</span>
          </div>
          <div className="slider-container">
            <input
              id="param-heart-count"
              type="range"
              min="8"
              max="50"
              step="1"
              value={u.heartCount}
              onChange={(e) => updateUniverse({ heartCount: parseInt(e.target.value, 10) })}
              className="param-slider"
            />
            <div className="slider-limits">
              <span>8</span>
              <span>50</span>
            </div>
          </div>
        </div>

        {/* Heart Color & Roughness */}
        <div className="param-row-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label className="param-label" style={{ marginBottom: '6px', display: 'block' }}>
              Màu sắc tim 3D
            </label>
            <div className="color-picker-input-group">
              <input
                type="color"
                value={u.heartColor}
                onChange={(e) => updateUniverse({ heartColor: e.target.value })}
                className="color-swatch-picker"
              />
              <input
                type="text"
                value={u.heartColor}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith('#') && val.length <= 7) updateUniverse({ heartColor: val });
                }}
                className="color-text-input"
                maxLength={7}
              />
            </div>
          </div>

          <div>
            <label className="param-label" style={{ marginBottom: '6px', display: 'block' }}>
              Độ bóng satin (Roughness)
            </label>
            <div className="slider-container" style={{ marginTop: '6px' }}>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={u.heartRoughness ?? 0.35}
                onChange={(e) => updateUniverse({ heartRoughness: parseFloat(e.target.value) })}
                className="param-slider"
              />
            </div>
          </div>
        </div>

        {/* Heart Size & Spin Speed */}
        <div className="param-row-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
          <div>
            <div className="param-label-group">
              <label className="param-label">Kích thước tim</label>
              <span className="param-value-tag">{(u.heartScaleFactor ?? 1.0).toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={u.heartScaleFactor ?? 1.0}
              onChange={(e) => updateUniverse({ heartScaleFactor: parseFloat(e.target.value) })}
              className="param-slider"
            />
          </div>

          <div>
            <div className="param-label-group">
              <label className="param-label">Tốc độ xoay 3D</label>
              <span className="param-value-tag">{(u.heartSpinSpeed ?? 1.0).toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0"
              max="4.0"
              step="0.2"
              value={u.heartSpinSpeed ?? 1.0}
              onChange={(e) => updateUniverse({ heartSpinSpeed: parseFloat(e.target.value) })}
              className="param-slider"
            />
          </div>
        </div>

        {/* Falling Speed Control for Heart */}
        <GroupFallSpeedControl
          label="Trái tim 3D"
          enabled={u.heartDriftEnabled ?? true}
          onToggleEnabled={(en) => updateUniverse({ heartDriftEnabled: en })}
          speed={u.heartDriftSpeed ?? 0.35}
          onChangeSpeed={(sp) => updateUniverse({ heartDriftSpeed: sp })}
          onResetDefault={() => updateUniverse({ heartDriftEnabled: true, heartDriftSpeed: 0.35 })}
          globalMultiplier={u.globalSpeedMultiplier ?? 1.0}
          globalDriftEnabled={u.driftEnabled ?? true}
          defaultSpeed={0.35}
        />
      </section>

      {/* SECTION 4: CHUYỂN ĐỘNG TOÀN CẢNH & HỆ SỐ CHUNG */}
      <section className="param-section" style={{ borderLeft: '3px solid #10B981' }}>
        <h4 className="section-title">
          <Compass size={16} /> 4. Chuyển động toàn cảnh
        </h4>

        {/* Toggle Drift */}
        <div className="param-row">
          <label className="checkbox-control-label">
            <input
              type="checkbox"
              checked={u.driftEnabled ?? true}
              onChange={(e) => updateUniverse({ driftEnabled: e.target.checked })}
            />
            <span className="checkbox-text">
              <strong>Bật rơi toàn cảnh</strong> (Cho phép các nhóm vật thể rơi theo tốc độ đã cấu hình)
            </span>
          </label>
        </div>

        {/* Global Speed Multiplier (Slider + Number input side by side) */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="param-global-speed-multiplier" className="param-label">
              Hệ số tốc độ chung (0 – 2.0x, mặc định 1.0x)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                id="param-global-speed-multiplier-num"
                type="number"
                min="0"
                max="2.0"
                step="0.05"
                value={Number((u.globalSpeedMultiplier ?? 1.0).toFixed(2))}
                onChange={(e) =>
                  updateUniverse({
                    globalSpeedMultiplier: Math.max(0, Math.min(2.0, parseFloat(e.target.value) || 0)),
                  })
                }
                style={{ width: '64px', padding: '3px 6px', fontSize: '0.82rem', borderRadius: '4px', border: '1px solid #CBD5E1', textAlign: 'right' }}
              />
              <span className="param-value-tag">{(u.globalSpeedMultiplier ?? 1.0).toFixed(2)}x</span>
              <button
                type="button"
                className="btn-text-action"
                onClick={() => updateUniverse({ globalSpeedMultiplier: 1.0 })}
                title="Khôi phục hệ số tốc độ chung về 1.0x"
                style={{ fontSize: '0.75rem', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                <RotateCcw size={11} /> 1.0x
              </button>
            </div>
          </div>
          <div className="slider-container">
            <input
              id="param-global-speed-multiplier"
              type="range"
              min="0"
              max="2.0"
              step="0.05"
              value={u.globalSpeedMultiplier ?? 1.0}
              onChange={(e) => updateUniverse({ globalSpeedMultiplier: parseFloat(e.target.value) })}
              className="param-slider"
            />
            <div className="slider-limits">
              <span>0x (Dừng rơi toàn cảnh)</span>
              <span>1.0x (Mặc định)</span>
              <span>2.0x (Gấp đôi)</span>
            </div>
          </div>
          <span className="param-help-text">
            Tốc độ rơi thực tế = tốc độ riêng của từng nhóm × hệ số chung. Nhóm đã tắt rơi hoặc có tốc độ = 0 vẫn đứng yên dù hệ số chung thay đổi.
          </span>
        </div>

        {/* Rotation Speed */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="param-rotation-speed" className="param-label">
              Tốc độ tự xoay ngân hà
            </label>
            <span className="param-value-tag">{u.rotationSpeed.toFixed(1)}°/s</span>
          </div>
          <div className="slider-container">
            <input
              id="param-rotation-speed"
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={u.rotationSpeed}
              onChange={(e) => updateUniverse({ rotationSpeed: parseFloat(e.target.value) })}
              className="param-slider"
            />
            <div className="slider-limits">
              <span>0 (Đứng yên)</span>
              <span>12°/s</span>
            </div>
          </div>
        </div>

        {/* Toggle Intro Screen */}
        <div className="param-row">
          <label className="checkbox-control-label">
            <input
              type="checkbox"
              checked={u.showIntro}
              onChange={(e) => updateUniverse({ showIntro: e.target.checked })}
            />
            <span className="checkbox-text">
              Bật màn mở đầu "Chạm để mở vũ trụ"
            </span>
          </label>
        </div>
      </section>

      {/* SECTION 5: VẬT THỂ TRANG TRÍ (DECORATIONS: STAR3D, GIFTBOX, HEART) */}
      <section className="param-section" style={{ borderLeft: '3px solid #8B5CF6' }}>
        <div className="section-header-row">
          <h4 className="section-title">
            <Box size={16} /> 5. Vật thể trang trí 3D
          </h4>
          <button
            type="button"
            className="btn-seed-random"
            onClick={() => setShowAddDeco(!showAddDeco)}
            style={{ fontSize: '0.8rem', padding: '4px 10px' }}
          >
            <Plus size={13} /> {showAddDeco ? 'Đóng form' : 'Thêm vật thể'}
          </button>
        </div>

        {/* Add Decoration Form */}
        {showAddDeco && (
          <div className="add-deco-form-card" style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '14px' }}>
            <h5 style={{ margin: '0 0 10px 0', fontSize: '0.88rem', fontWeight: 600 }}>Tùy chỉnh vật thể mới</h5>
            
            <div className="param-row" style={{ marginBottom: '8px' }}>
              <label className="param-label">Loại vật thể 3D</label>
              <select
                value={newDecoType}
                onChange={(e) => {
                  const val = e.target.value as 'heart' | 'star3d' | 'giftbox';
                  setNewDecoType(val);
                  setNewDecoName(val === 'star3d' ? 'Ngôi sao 3D' : val === 'giftbox' ? 'Hộp quà 3D' : 'Trái tim 3D');
                  setNewDecoColor(val === 'star3d' ? '#FFD700' : val === 'giftbox' ? '#E63946' : '#FF3824');
                }}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              >
                <option value="star3d">⭐ Ngôi sao 3D bo cạnh</option>
                <option value="giftbox">🎁 Hộp quà 3D có nắp & ruy-băng</option>
                <option value="heart">💖 Trái tim 3D phồng bổ sung</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div>
                <label className="param-label">Số lượng</label>
                <input
                  type="number"
                  min="3"
                  max="40"
                  value={newDecoCount}
                  onChange={(e) => setNewDecoCount(parseInt(e.target.value, 10) || 10)}
                  style={{ width: '100%', padding: '5px 8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label className="param-label">Màu sắc</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="color"
                    value={newDecoColor}
                    onChange={(e) => setNewDecoColor(e.target.value)}
                    style={{ width: '36px', height: '32px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                  />
                  <input
                    type="text"
                    value={newDecoColor}
                    onChange={(e) => setNewDecoColor(e.target.value)}
                    style={{ width: '100%', padding: '5px 6px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div>
                <label className="param-label">Kích thước (Hệ số)</label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={newDecoScale}
                  onChange={(e) => setNewDecoScale(parseFloat(e.target.value))}
                  className="param-slider"
                />
              </div>

              <div>
                <label className="param-label">Tốc độ xoay</label>
                <input
                  type="range"
                  min="0"
                  max="3.0"
                  step="0.2"
                  value={newDecoSpeed}
                  onChange={(e) => setNewDecoSpeed(parseFloat(e.target.value))}
                  className="param-slider"
                />
              </div>
            </div>

            {/* Falling speed initial settings for new decoration */}
            <div style={{ background: '#FFF', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="checkbox-control-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={newDecoDriftEnabled}
                    onChange={(e) => setNewDecoDriftEnabled(e.target.checked)}
                  />
                  <span>Bật rơi khi khởi tạo</span>
                </label>
                <span className="param-value-tag" style={{ fontSize: '0.76rem' }}>
                  {newDecoDriftSpeed.toFixed(2)} u/s
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="range"
                  min="0"
                  max="3.0"
                  step="0.05"
                  value={newDecoDriftSpeed}
                  onChange={(e) => setNewDecoDriftSpeed(parseFloat(e.target.value))}
                  className="param-slider"
                  style={{ flex: 1 }}
                />
                <input
                  type="number"
                  min="0"
                  max="3.0"
                  step="0.05"
                  value={Number(newDecoDriftSpeed.toFixed(2))}
                  onChange={(e) => setNewDecoDriftSpeed(Math.max(0, Math.min(3.0, parseFloat(e.target.value) || 0)))}
                  style={{ width: '54px', padding: '2px 4px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #CBD5E1', textAlign: 'right' }}
                />
              </div>
            </div>

            <button
              type="button"
              className="btn-seed-random"
              onClick={handleAddDecorationGroup}
              style={{ background: '#8B5CF6', color: '#FFF', border: 'none', width: '100%', justifyContent: 'center', padding: '8px' }}
            >
              <Plus size={14} /> Thêm vào vũ trụ
            </button>
          </div>
        )}

        {/* List of active decoration groups */}
        {(u.decorations || []).length > 0 ? (
          <div className="deco-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(u.decorations || []).map((deco) => {
              const decoDefaultSpeed = deco.type === 'giftbox' ? 0.25 : 0.35;
              const decoCurrentSpeed = deco.driftSpeed ?? decoDefaultSpeed;
              const decoCurrentEnabled = deco.driftEnabled ?? true;

              return (
                <div
                  key={deco.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '10px 12px',
                    background: '#F1F5F9',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          background: deco.color,
                          display: 'inline-block',
                          boxShadow: '0 0 4px rgba(0,0,0,0.2)',
                        }}
                      />
                      <strong style={{ fontSize: '0.88rem' }}>{deco.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        ({deco.count} vật thể, scale {deco.scale}x, xoay {deco.spinSpeed}x)
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={deco.enabled}
                          onChange={() => handleToggleDeco(deco.id)}
                        />
                        <span>{deco.enabled ? 'Hiển thị' : 'Ẩn'}</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleDeleteDeco(deco.id)}
                        style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '2px' }}
                        title="Xóa nhóm vật thể này"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Group-specific falling controls */}
                  <GroupFallSpeedControl
                    label={deco.name}
                    enabled={decoCurrentEnabled}
                    onToggleEnabled={(en) => handleUpdateDeco(deco.id, { driftEnabled: en })}
                    speed={decoCurrentSpeed}
                    onChangeSpeed={(sp) => handleUpdateDeco(deco.id, { driftSpeed: sp })}
                    onResetDefault={() => handleUpdateDeco(deco.id, { driftEnabled: true, driftSpeed: decoDefaultSpeed })}
                    globalMultiplier={u.globalSpeedMultiplier ?? 1.0}
                    globalDriftEnabled={u.driftEnabled ?? true}
                    defaultSpeed={decoDefaultSpeed}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="photo-empty-hint">
            <span>Chưa thêm vật thể trang trí riêng. Mặc định hiển thị Trái tim 3D. Nhấn "Thêm vật thể" để bổ sung Ngôi sao 3D hoặc Hộp quà 3D!</span>
          </div>
        )}
      </section>

      {/* SECTION 6: BỐ CỤC & TỶ LỆ ẢNH / CHỮ */}
      <section className="param-section">
        <h4 className="section-title">
          <Sliders size={16} /> 6. Tỷ lệ ảnh & Bố cục đám mây
        </h4>

        {/* Photo Scale Factor */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="param-photo-scale" className="param-label">
              Kích thước mặt phẳng ảnh (Photo Scale)
            </label>
            <span className="param-value-tag">{(u.photoScaleFactor ?? 0.72).toFixed(2)}x</span>
          </div>
          <div className="slider-container">
            <input
              id="param-photo-scale"
              type="range"
              min="0.4"
              max="1.5"
              step="0.05"
              value={u.photoScaleFactor ?? 0.72}
              onChange={(e) => updateUniverse({ photoScaleFactor: parseFloat(e.target.value) })}
              className="param-slider"
            />
            <div className="slider-limits">
              <span>0.4x (Gọn nhẹ, tôn vinh chữ)</span>
              <span>0.72x (Chuẩn mẫu)</span>
              <span>1.5x (Lớn)</span>
            </div>
          </div>
        </div>

        {/* Photo Count */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="param-photo-count" className="param-label">
              Số lượng ảnh hiển thị
            </label>
            <span className="param-value-tag">{u.photoCount} ảnh</span>
          </div>
          <div className="slider-container">
            <input
              id="param-photo-count"
              type="range"
              min="4"
              max="24"
              step="1"
              value={u.photoCount}
              onChange={(e) => updateUniverse({ photoCount: parseInt(e.target.value, 10) })}
              className="param-slider"
            />
            <div className="slider-limits">
              <span>4 ảnh</span>
              <span>10 (Chuẩn)</span>
              <span>24 ảnh</span>
            </div>
          </div>
        </div>

        {/* Falling Speed Control for Photo */}
        <GroupFallSpeedControl
          label="Ảnh kỷ niệm"
          enabled={u.photoDriftEnabled ?? true}
          onToggleEnabled={(en) => updateUniverse({ photoDriftEnabled: en })}
          speed={u.photoDriftSpeed ?? 0.35}
          onChangeSpeed={(sp) => updateUniverse({ photoDriftSpeed: sp })}
          onResetDefault={() => updateUniverse({ photoDriftEnabled: true, photoDriftSpeed: 0.35 })}
          globalMultiplier={u.globalSpeedMultiplier ?? 1.0}
          globalDriftEnabled={u.driftEnabled ?? true}
          defaultSpeed={0.35}
        />

        {/* Upload photos from PC */}
        <div className="photo-actions-bar" style={{ marginTop: '10px' }}>
          <label className="btn-upload-photo" htmlFor="universe-file-upload">
            <Upload size={14} />
            <span>{isUploading ? 'Đang lưu...' : 'Chọn ảnh từ máy (IndexedDB)'}</span>
            <input
              id="universe-file-upload"
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleUploadPhotos}
              style={{ display: 'none' }}
              disabled={isUploading}
            />
          </label>

          {savedPhotos.length > 0 && (
            <button
              type="button"
              className="btn-clear-photos"
              onClick={handleClearAllPhotos}
              title="Xóa toàn bộ ảnh đã lưu trong IndexedDB"
            >
              <Trash2 size={13} /> Xóa ảnh đã lưu ({savedPhotos.length})
            </button>
          )}
        </div>

        {photoFeedback && (
          <div className="photo-feedback-message">
            <CheckCircle2 size={14} className="text-success" />
            <span>{photoFeedback}</span>
          </div>
        )}

        {/* Saved Photos Thumbnails Grid */}
        {savedPhotos.length > 0 && (
          <div className="uploaded-photos-grid">
            {savedPhotos.map((photo) => (
              <div key={photo.id} className="uploaded-photo-item" title={photo.name}>
                <img src={photo.url} alt={photo.name} className="photo-thumb-img" />
                <button
                  type="button"
                  className="btn-delete-single-photo"
                  onClick={() => handleDeletePhoto(photo.id)}
                  title={`Xóa ảnh ${photo.name}`}
                  aria-label={`Xóa ảnh ${photo.name}`}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Seed Input + Random button */}
        <div className="param-row" style={{ marginTop: '16px' }}>
          <div className="param-label-group">
            <label htmlFor="param-seed" className="param-label">
              Mã bố cục (Seed cố định)
            </label>
            <span className="param-value-tag">#{u.seed}</span>
          </div>
          <div className="seed-input-group">
            <input
              id="param-seed"
              type="number"
              value={u.seed}
              onChange={(e) => updateUniverse({ seed: parseInt(e.target.value, 10) || 1 })}
              className="seed-number-input"
            />
            <button
              type="button"
              className="btn-seed-random"
              onClick={handleRandomSeed}
              title="Sinh mã bố cục ngẫu nhiên mới"
            >
              <RefreshCw size={13} /> Đổi bố cục
            </button>
          </div>
        </div>

        {/* Cloud Dimensions: Width, Height, Depth */}
        <div className="param-row-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '10px' }}>
          <div>
            <label className="param-label">Độ rộng (W: {Number(u.cloudWidth).toFixed(1)})</label>
            <input
              type="range"
              min="3.0"
              max="10.0"
              step="0.2"
              value={u.cloudWidth}
              onChange={(e) => updateUniverse({ cloudWidth: parseFloat(e.target.value) })}
              className="param-slider"
            />
          </div>
          <div>
            <label className="param-label">Chiều cao (H: {Number(u.cloudHeight).toFixed(1)})</label>
            <input
              type="range"
              min="3.0"
              max="9.0"
              step="0.2"
              value={u.cloudHeight}
              onChange={(e) => updateUniverse({ cloudHeight: parseFloat(e.target.value) })}
              className="param-slider"
            />
          </div>
          <div>
            <label className="param-label">Chiều sâu (D: {Number(u.cloudDepth).toFixed(1)})</label>
            <input
              type="range"
              min="2.5"
              max="8.0"
              step="0.2"
              value={u.cloudDepth}
              onChange={(e) => updateUniverse({ cloudDepth: parseFloat(e.target.value) })}
              className="param-slider"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default UniverseParameterPanel;
