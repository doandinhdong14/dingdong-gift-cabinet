import React from 'react';
import { Type, Palette, Compass, Hand, Activity } from 'lucide-react';
import { AssetConfig } from '../../types';
import { card11DefaultConfig } from './presets';

export interface Card11ParameterPanelProps {
  config: AssetConfig;
  onChange: (updated: AssetConfig) => void;
}

export const Card11ParameterPanel: React.FC<Card11ParameterPanelProps> = ({
  config,
  onChange,
}) => {
  const c11 = config.card11 || card11DefaultConfig.card11!;

  const updateCard11 = <K extends keyof NonNullable<AssetConfig['card11']>>(
    key: K,
    val: NonNullable<AssetConfig['card11']>[K]
  ) => {
    const updated: AssetConfig = {
      ...config,
      card11: {
        ...c11,
        [key]: val,
      },
    };
    if (key === 'textColor' && typeof val === 'string') {
      updated.appearance = {
        ...updated.appearance,
        color: val,
      };
    }
    onChange(updated);
  };

  const updateMotion = <
    M extends keyof AssetConfig['motion'],
    K extends keyof AssetConfig['motion'][M],
  >(
    motionKey: M,
    subKey: K,
    val: AssetConfig['motion'][M][K]
  ) => {
    onChange({
      ...config,
      motion: {
        ...config.motion,
        [motionKey]: {
          ...config.motion[motionKey],
          [subKey]: val,
        },
      },
    });
  };

  const updatePhrasesText = (raw: string) => {
    const list = raw
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const validList = list.length > 0 ? list : ['I love you'];
    onChange({
      ...config,
      card11: {
        ...c11,
        text: validList[0] || 'I love you',
        phrases: validList,
      },
    });
  };

  return (
    <div className="card11-parameter-panel" role="form" aria-label="Bảng điều khiển Card 11">
      {/* 3D Hand gesture hint callout */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(234, 128, 176, 0.18), rgba(139, 92, 246, 0.18))',
          border: '1px solid rgba(234, 128, 176, 0.4)',
          borderRadius: '12px',
          padding: '12px 14px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '13px',
          color: '#FCE7F3',
          lineHeight: '1.45',
        }}
      >
        <Hand size={22} style={{ color: '#EA80B0', flexShrink: 0 }} />
        <span>
          <strong>Thao tác 3D bằng tay:</strong> Dùng ngón tay (trên điện thoại/tablet) hoặc chuột kéo xoay trực tiếp trên Canvas để quan sát trái tim từ mọi góc độ 360°. Cuộn hoặc chụm để phóng to/thu nhỏ.
        </span>
      </div>

      {/* SECTION 1: CHỮ VÀ NỘI DUNG */}
      <section className="param-section">
        <h4 className="section-title">
          <Type size={16} style={{ verticalAlign: 'middle', marginRight: '6px', color: '#EA80B0' }} />
          1. Tùy chỉnh chữ & nội dung
        </h4>

        {/* Primary Text input */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="card11-param-text" className="param-label">
              Chữ chính hiển thị
            </label>
          </div>
          <input
            id="card11-param-text"
            type="text"
            value={c11.text}
            onChange={(e) => {
              const val = e.target.value;
              const currentPhrases = (c11.phrases && c11.phrases.length > 1)
                ? [val, ...c11.phrases.slice(1)]
                : [val];
              onChange({
                ...config,
                card11: {
                  ...c11,
                  text: val,
                  phrases: currentPhrases,
                },
              });
            }}
            placeholder="I love you / Anh yêu em..."
            className="color-text-input"
            style={{ width: '100%', maxWidth: '280px' }}
          />
        </div>

        {/* Multi-phrase stream input */}
        <div className="param-row" style={{ alignItems: 'flex-start' }}>
          <div className="param-label-group">
            <label htmlFor="card11-param-phrases" className="param-label">
              Chuỗi thông điệp xoay vòng (mỗi dòng 1 câu)
            </label>
            <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
              Các dòng chữ sẽ lần lượt nối tiếp nhau uốn lượn quanh trái tim
            </span>
          </div>
          <textarea
            id="card11-param-phrases"
            rows={3}
            value={(c11.phrases || []).join('\n')}
            onChange={(e) => updatePhrasesText(e.target.value)}
            className="color-text-input"
            style={{
              width: '100%',
              maxWidth: '280px',
              fontFamily: 'inherit',
              padding: '8px',
              fontSize: '12px',
              borderRadius: '6px',
            }}
            placeholder="I love you&#10;Anh yêu em&#10;My Forever"
          />
        </div>

        {/* Font size */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="card11-param-fontsize" className="param-label">
              Kích thước chữ (Font Size)
            </label>
            <span className="param-value-tag">{c11.fontSize.toFixed(2)}x</span>
          </div>
          <div className="slider-container">
            <input
              id="card11-param-fontsize"
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={c11.fontSize}
              onChange={(e) => updateCard11('fontSize', parseFloat(e.target.value))}
              className="param-slider"
            />
          </div>
        </div>

        {/* Number of words / stream density */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="card11-param-count" className="param-label">
              Số lượng chữ trong ma trận (Item Count)
            </label>
            <span className="param-value-tag">{c11.itemCount} chữ</span>
          </div>
          <div className="slider-container">
            <input
              id="card11-param-count"
              type="range"
              min="20"
              max="160"
              step="5"
              value={c11.itemCount}
              onChange={(e) => updateCard11('itemCount', parseInt(e.target.value, 10))}
              className="param-slider"
            />
          </div>
        </div>

        {/* Speed */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="card11-param-speed" className="param-label">
              Tốc độ chuyển động lướt
            </label>
            <span className="param-value-tag">{c11.speed.toFixed(2)}x</span>
          </div>
          <div className="slider-container">
            <input
              id="card11-param-speed"
              type="range"
              min="0.2"
              max="3.0"
              step="0.05"
              value={c11.speed}
              onChange={(e) => updateCard11('speed', parseFloat(e.target.value))}
              className="param-slider"
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: CHỈNH MÀU SẮC */}
      <section className="param-section">
        <h4 className="section-title">
          <Palette size={16} style={{ verticalAlign: 'middle', marginRight: '6px', color: '#EC4899' }} />
          2. Màu sắc & Ánh sáng Neon
        </h4>

        {/* Primary Text Color */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="card11-param-color" className="param-label">
              Màu chữ chính
            </label>
            <span className="param-value-tag">{c11.textColor.toUpperCase()}</span>
          </div>
          <div className="color-picker-input-group">
            <input
              id="card11-param-color-picker"
              type="color"
              value={c11.textColor}
              onChange={(e) => updateCard11('textColor', e.target.value)}
              className="color-swatch-picker"
            />
            <input
              id="card11-param-color"
              type="text"
              value={c11.textColor}
              onChange={(e) => {
                const val = e.target.value;
                if (val.startsWith('#') && val.length <= 7) {
                  updateCard11('textColor', val);
                }
              }}
              className="color-text-input"
              maxLength={7}
            />
          </div>
        </div>

        {/* Glow / text-shadow color */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="card11-param-glow-color" className="param-label">
              Màu vầng sáng Neon (Glow)
            </label>
            <span className="param-value-tag">{c11.glowColor.toUpperCase()}</span>
          </div>
          <div className="color-picker-input-group">
            <input
              id="card11-param-glow-color-picker"
              type="color"
              value={c11.glowColor}
              onChange={(e) => updateCard11('glowColor', e.target.value)}
              className="color-swatch-picker"
            />
            <input
              id="card11-param-glow-color"
              type="text"
              value={c11.glowColor}
              onChange={(e) => {
                const val = e.target.value;
                if (val.startsWith('#') && val.length <= 7) {
                  updateCard11('glowColor', val);
                }
              }}
              className="color-text-input"
              maxLength={7}
            />
          </div>
        </div>

        {/* Glow Intensity */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="card11-param-glow-intensity" className="param-label">
              Độ chói phát sáng Neon
            </label>
            <span className="param-value-tag">{c11.glowIntensity.toFixed(2)}x</span>
          </div>
          <div className="slider-container">
            <input
              id="card11-param-glow-intensity"
              type="range"
              min="0.2"
              max="2.5"
              step="0.05"
              value={c11.glowIntensity}
              onChange={(e) => updateCard11('glowIntensity', parseFloat(e.target.value))}
              className="param-slider"
            />
          </div>
        </div>

        {/* Alternating Colors Toggle */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="card11-param-alt-toggle" className="param-label">
              Màu xen kẽ (Dual Color)
            </label>
          </div>
          <label className="toggle-switch">
            <input
              id="card11-param-alt-toggle"
              type="checkbox"
              checked={c11.useAlternatingColors}
              onChange={(e) => updateCard11('useAlternatingColors', e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        {/* Secondary Color (if alternating enabled) */}
        {c11.useAlternatingColors && (
          <div className="param-row">
            <div className="param-label-group">
              <label htmlFor="card11-param-sec-color" className="param-label">
                Màu chữ thứ hai
              </label>
              <span className="param-value-tag">{(c11.secondaryColor || '#FF6584').toUpperCase()}</span>
            </div>
            <div className="color-picker-input-group">
              <input
                id="card11-param-sec-color-picker"
                type="color"
                value={c11.secondaryColor || '#FF6584'}
                onChange={(e) => updateCard11('secondaryColor', e.target.value)}
                className="color-swatch-picker"
              />
              <input
                id="card11-param-sec-color"
                type="text"
                value={c11.secondaryColor || '#FF6584'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith('#') && val.length <= 7) {
                    updateCard11('secondaryColor', val);
                  }
                }}
                className="color-text-input"
                maxLength={7}
              />
            </div>
          </div>
        )}

        {/* Background Color */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="card11-param-bg-color" className="param-label">
              Màu nền không gian
            </label>
            <span className="param-value-tag">{c11.backgroundColor.toUpperCase()}</span>
          </div>
          <div className="color-picker-input-group">
            <input
              id="card11-param-bg-color-picker"
              type="color"
              value={c11.backgroundColor}
              onChange={(e) => updateCard11('backgroundColor', e.target.value)}
              className="color-swatch-picker"
            />
            <input
              id="card11-param-bg-color"
              type="text"
              value={c11.backgroundColor}
              onChange={(e) => {
                const val = e.target.value;
                if (val.startsWith('#') && val.length <= 7) {
                  updateCard11('backgroundColor', val);
                }
              }}
              className="color-text-input"
              maxLength={7}
            />
          </div>
        </div>
      </section>

      {/* SECTION 3: KHÔNG GIAN 3D & THAO TÁC TAY */}
      <section className="param-section">
        <h4 className="section-title">
          <Compass size={16} style={{ verticalAlign: 'middle', marginRight: '6px', color: '#8B5CF6' }} />
          3. Không gian 3D & Thao tác tay
        </h4>

        {/* 3D Depth Slider */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="card11-param-depth" className="param-label">
              Độ sâu không gian 3D (Z-Depth)
            </label>
            <span className="param-value-tag">
              {c11.depth3D === 0 ? 'Phẳng 2D' : `${c11.depth3D.toFixed(2)}x 3D`}
            </span>
          </div>
          <div className="slider-container">
            <input
              id="card11-param-depth"
              type="range"
              min="0.0"
              max="2.5"
              step="0.05"
              value={c11.depth3D}
              onChange={(e) => updateCard11('depth3D', parseFloat(e.target.value))}
              className="param-slider"
            />
          </div>
        </div>

        {/* Heart scale */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="card11-param-heart-scale" className="param-label">
              Tỉ lệ kích thước trái tim
            </label>
            <span className="param-value-tag">{c11.heartScale.toFixed(2)}x</span>
          </div>
          <div className="slider-container">
            <input
              id="card11-param-heart-scale"
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={c11.heartScale}
              onChange={(e) => updateCard11('heartScale', parseFloat(e.target.value))}
              className="param-slider"
            />
          </div>
        </div>

        {/* Orientation Mode: Tangent vs Billboard */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="card11-param-orient" className="param-label">
              Hướng chữ hiển thị
            </label>
          </div>
          <select
            id="card11-param-orient"
            value={c11.orientationMode}
            onChange={(e) => updateCard11('orientationMode', e.target.value as 'tangent' | 'billboard')}
            className="dropdown-select"
          >
            <option value="tangent">Uốn lượn theo đường cong (Tangent)</option>
            <option value="billboard">Luôn hướng về mắt nhìn (Billboard)</option>
          </select>
        </div>

        {/* Tilt angle (when in tangent mode) */}
        {c11.orientationMode === 'tangent' && (
          <div className="param-row">
            <div className="param-label-group">
              <label htmlFor="card11-param-tilt" className="param-label">
                Góc nghiêng chữ (Tilt Angle)
              </label>
              <span className="param-value-tag">{c11.tiltAngleDeg}°</span>
            </div>
            <div className="slider-container">
              <input
                id="card11-param-tilt"
                type="range"
                min="-90"
                max="90"
                step="5"
                value={c11.tiltAngleDeg}
                onChange={(e) => updateCard11('tiltAngleDeg', parseInt(e.target.value, 10))}
                className="param-slider"
              />
            </div>
          </div>
        )}

        {/* Trajectory mode: original-matrix vs smooth-3d */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="card11-param-traj" className="param-label">
              Kiểu quỹ đạo trái tim
            </label>
          </div>
          <select
            id="card11-param-traj"
            value={c11.trajectoryMode}
            onChange={(e) => updateCard11('trajectoryMode', e.target.value as 'original-matrix' | 'smooth-3d')}
            className="dropdown-select"
          >
            <option value="original-matrix">Ma trận CSS Keyframes gốc (Card 11)</option>
            <option value="smooth-3d">Đường cong 3D tham số mượt mà</option>
          </select>
        </div>

        {/* Auto Rotate Toggle */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="card11-param-autorotate" className="param-label">
              Tự động quay chậm trong không gian
            </label>
          </div>
          <label className="toggle-switch">
            <input
              id="card11-param-autorotate"
              type="checkbox"
              checked={c11.autoRotate}
              onChange={(e) => updateCard11('autoRotate', e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>
      </section>

      {/* SECTION 4: CHUYỂN ĐỘNG KHÔNG GIAN (MOTION RIG) */}
      <section className="param-section">
        <h4 className="section-title">
          <Activity size={16} style={{ verticalAlign: 'middle', marginRight: '6px', color: '#10B981' }} />
          4. Nhịp đập & Bồng bềnh 3D
        </h4>

        {/* Heartbeat toggle */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="card11-param-heartbeat-toggle" className="param-label">
              Nhịp đập phập phồng (Heartbeat)
            </label>
          </div>
          <label className="toggle-switch">
            <input
              id="card11-param-heartbeat-toggle"
              type="checkbox"
              checked={config.motion.heartbeat.enabled}
              onChange={(e) => updateMotion('heartbeat', 'enabled', e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        {/* Heartbeat strength slider */}
        {config.motion.heartbeat.enabled && (
          <div className="param-row">
            <div className="param-label-group">
              <label htmlFor="card11-param-heartbeat-strength" className="param-label">
                Độ mạnh nhịp đập
              </label>
              <span className="param-value-tag">{(config.motion.heartbeat.strength * 100).toFixed(0)}%</span>
            </div>
            <div className="slider-container">
              <input
                id="card11-param-heartbeat-strength"
                type="range"
                min="0.01"
                max="0.12"
                step="0.01"
                value={config.motion.heartbeat.strength}
                onChange={(e) => updateMotion('heartbeat', 'strength', parseFloat(e.target.value))}
                className="param-slider"
              />
            </div>
          </div>
        )}

        {/* Float motion toggle */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="card11-param-float-toggle" className="param-label">
              Bồng bềnh lơ lửng (Float)
            </label>
          </div>
          <label className="toggle-switch">
            <input
              id="card11-param-float-toggle"
              type="checkbox"
              checked={config.motion.float.enabled}
              onChange={(e) => updateMotion('float', 'enabled', e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        {/* Float amplitude slider */}
        {config.motion.float.enabled && (
          <div className="param-row">
            <div className="param-label-group">
              <label htmlFor="card11-param-float-amp" className="param-label">
                Biên độ bồng bềnh
              </label>
              <span className="param-value-tag">{config.motion.float.amplitude.toFixed(2)}</span>
            </div>
            <div className="slider-container">
              <input
                id="card11-param-float-amp"
                type="range"
                min="0.02"
                max="0.25"
                step="0.01"
                value={config.motion.float.amplitude}
                onChange={(e) => updateMotion('float', 'amplitude', parseFloat(e.target.value))}
                className="param-slider"
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Card11ParameterPanel;