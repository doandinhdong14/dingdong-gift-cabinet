import React from 'react';
import { RotateCcw, BookmarkPlus, Copy, Code, Sparkles, Check, AlertCircle } from 'lucide-react';
import { AssetConfig } from '../gift-library/types';
import { UniverseParameterPanel } from './UniverseParameterPanel';
import { RoseParameterPanel } from '../gift-library/objects/rose-reveal-01/RoseParameterPanel';

export interface ParameterPanelProps {
  config: AssetConfig;
  defaultConfig: AssetConfig;
  onChange: (updated: AssetConfig) => void;
  onReset: () => void;
  onOpenSavePreset: () => void;
  onCopyJson: () => void;
  onCopyJsx: () => void;
  onCopyAiPrompt: () => void;
  copyStatus?: { type: string; success: boolean } | null;
}

export const ParameterPanel: React.FC<ParameterPanelProps> = ({
  config,
  onChange,
  onReset,
  onOpenSavePreset,
  onCopyJson,
  onCopyJsx,
  onCopyAiPrompt,
  copyStatus,
}) => {
  const updateAppearance = <K extends keyof AssetConfig['appearance']>(
    key: K,
    val: AssetConfig['appearance'][K]
  ) => {
    onChange({
      ...config,
      appearance: {
        ...config.appearance,
        [key]: val,
      },
    });
  };

  const updateTransform = (
    key: 'scale' | 'rotationDeg',
    val: number | [number, number, number]
  ) => {
    onChange({
      ...config,
      transform: {
        ...config.transform,
        [key]: val,
      },
    });
  };

  const updateRotationIndex = (index: 0 | 1 | 2, val: number) => {
    const nextRot: [number, number, number] = [...config.transform.rotationDeg];
    nextRot[index] = val;
    updateTransform('rotationDeg', nextRot);
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

  return (
    <div className="parameter-panel" role="form" aria-label="Bảng điều khiển tham số">
      {/* Action header with quick actions */}
      <div className="panel-actions-top">
        <button
          type="button"
          className="btn-action-primary"
          onClick={onOpenSavePreset}
          title="Lưu các thông số hiện tại thành biến thể riêng trong trình duyệt"
        >
          <BookmarkPlus size={16} /> Lưu biến thể
        </button>

        <button
          type="button"
          className="btn-action-ghost"
          onClick={onReset}
          title="Khôi phục tất cả thông số về mặc định của mẫu (không ảnh hưởng biến thể đã lưu)"
        >
          <RotateCcw size={16} /> Đặt lại mẫu
        </button>
      </div>

      {/* Accordion / Sections */}
      <div className="panel-scroll-content">
        {config.assetId === 'love-universe-01' ? (
          <UniverseParameterPanel config={config} onChange={onChange} />
        ) : config.assetId === 'rose-reveal-01' ? (
          <RoseParameterPanel config={config} onChange={onChange} />
        ) : (
          <>
            {/* SECTION 1: Appearance */}
            <section className="param-section">
              <h4 className="section-title">1. Hình dáng & Vật liệu</h4>

          {/* Color */}
          <div className="param-row">
            <div className="param-label-group">
              <label htmlFor="param-color" className="param-label">Màu sắc</label>
              <span className="param-value-tag">{config.appearance.color.toUpperCase()}</span>
            </div>
            <div className="color-picker-input-group">
              <input
                id="param-color-picker"
                type="color"
                value={config.appearance.color}
                onChange={(e) => updateAppearance('color', e.target.value)}
                className="color-swatch-picker"
                aria-label="Chọn màu bằng bảng màu"
              />
              <input
                id="param-color"
                type="text"
                value={config.appearance.color}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith('#') && val.length <= 7) {
                    updateAppearance('color', val);
                  }
                }}
                className="color-text-input"
                maxLength={7}
                placeholder="#F46C91"
              />
            </div>
          </div>

          {/* Roughness */}
          <div className="param-row">
            <div className="param-label-group">
              <label htmlFor="param-roughness" className="param-label">Độ nhám (Roughness)</label>
              <span className="param-value-tag">{config.appearance.roughness.toFixed(2)}</span>
            </div>
            <div className="slider-container">
              <input
                id="param-roughness"
                type="range"
                min="0.15"
                max="0.90"
                step="0.01"
                value={config.appearance.roughness}
                onChange={(e) => updateAppearance('roughness', parseFloat(e.target.value))}
                className="param-slider"
              />
              <div className="slider-limits">
                <span>0.15 (Bóng mịn)</span>
                <span>0.90 (Mờ nhám)</span>
              </div>
            </div>
          </div>

          {/* Metalness */}
          <div className="param-row">
            <div className="param-label-group">
              <label htmlFor="param-metalness" className="param-label">Độ kim loại (Metalness)</label>
              <span className="param-value-tag">{config.appearance.metalness.toFixed(2)}</span>
            </div>
            <div className="slider-container">
              <input
                id="param-metalness"
                type="range"
                min="0.00"
                max="0.30"
                step="0.01"
                value={config.appearance.metalness}
                onChange={(e) => updateAppearance('metalness', parseFloat(e.target.value))}
                className="param-slider"
              />
              <div className="slider-limits">
                <span>0.00 (Phi kim/satin)</span>
                <span>0.30 (Phản chiếu nhẹ)</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Transform */}
        <section className="param-section">
          <h4 className="section-title">2. Kích thước & Góc xoay ban đầu</h4>

          {/* Scale */}
          <div className="param-row">
            <div className="param-label-group">
              <label htmlFor="param-scale" className="param-label">Tỉ lệ kích thước (Scale)</label>
              <span className="param-value-tag">{config.transform.scale.toFixed(2)}x</span>
            </div>
            <div className="slider-container">
              <input
                id="param-scale"
                type="range"
                min="0.50"
                max="1.50"
                step="0.05"
                value={config.transform.scale}
                onChange={(e) => updateTransform('scale', parseFloat(e.target.value))}
                className="param-slider"
              />
              <div className="slider-limits">
                <span>0.5x</span>
                <span>1.0x (Chuẩn)</span>
                <span>1.5x</span>
              </div>
            </div>
          </div>

          {/* Rotation X */}
          <div className="param-row">
            <div className="param-label-group">
              <label htmlFor="param-rot-x" className="param-label">Góc xoay X</label>
              <span className="param-value-tag">{config.transform.rotationDeg[0]}°</span>
            </div>
            <input
              id="param-rot-x"
              type="range"
              min="-180"
              max="180"
              step="1"
              value={config.transform.rotationDeg[0]}
              onChange={(e) => updateRotationIndex(0, parseInt(e.target.value, 10))}
              className="param-slider"
            />
          </div>

          {/* Rotation Y */}
          <div className="param-row">
            <div className="param-label-group">
              <label htmlFor="param-rot-y" className="param-label">Góc xoay Y</label>
              <span className="param-value-tag">{config.transform.rotationDeg[1]}°</span>
            </div>
            <input
              id="param-rot-y"
              type="range"
              min="-180"
              max="180"
              step="1"
              value={config.transform.rotationDeg[1]}
              onChange={(e) => updateRotationIndex(1, parseInt(e.target.value, 10))}
              className="param-slider"
            />
          </div>

          {/* Rotation Z */}
          <div className="param-row">
            <div className="param-label-group">
              <label htmlFor="param-rot-z" className="param-label">Góc xoay Z</label>
              <span className="param-value-tag">{config.transform.rotationDeg[2]}°</span>
            </div>
            <input
              id="param-rot-z"
              type="range"
              min="-180"
              max="180"
              step="1"
              value={config.transform.rotationDeg[2]}
              onChange={(e) => updateRotationIndex(2, parseInt(e.target.value, 10))}
              className="param-slider"
            />
          </div>
        </section>

        {/* SECTION 3: Motion */}
        <section className="param-section">
          <h4 className="section-title">3. Chuyển động (Motion)</h4>

          {/* Float */}
          <div className="motion-sub-card">
            <div className="motion-header">
              <div className="toggle-switch-group">
                <input
                  id="motion-float-toggle"
                  type="checkbox"
                  checked={config.motion.float.enabled}
                  onChange={(e) => updateMotion('float', 'enabled', e.target.checked)}
                  className="switch-checkbox"
                />
                <label htmlFor="motion-float-toggle" className="switch-label">
                  <strong>Lơ lửng bồng bềnh (Float)</strong>
                </label>
              </div>
              <span className={`status-pill ${config.motion.float.enabled ? 'active' : ''}`}>
                {config.motion.float.enabled ? 'Đang bật' : 'Tắt'}
              </span>
            </div>

            {config.motion.float.enabled && (
              <div className="sub-params">
                <div className="param-row">
                  <div className="param-label-group">
                    <label htmlFor="param-float-amp" className="param-label-sub">Biên độ lơ lửng</label>
                    <span className="param-value-tag">{config.motion.float.amplitude.toFixed(2)} đơn vị</span>
                  </div>
                  <input
                    id="param-float-amp"
                    type="range"
                    min="0.00"
                    max="0.20"
                    step="0.01"
                    value={config.motion.float.amplitude}
                    onChange={(e) => updateMotion('float', 'amplitude', parseFloat(e.target.value))}
                    className="param-slider"
                  />
                </div>

                <div className="param-row">
                  <div className="param-label-group">
                    <label htmlFor="param-float-spd" className="param-label-sub">Tốc độ lơ lửng</label>
                    <span className="param-value-tag">{config.motion.float.speed.toFixed(2)} chu kỳ/s</span>
                  </div>
                  <input
                    id="param-float-spd"
                    type="range"
                    min="0.10"
                    max="1.00"
                    step="0.05"
                    value={config.motion.float.speed}
                    onChange={(e) => updateMotion('float', 'speed', parseFloat(e.target.value))}
                    className="param-slider"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Heartbeat */}
          <div className="motion-sub-card">
            <div className="motion-header">
              <div className="toggle-switch-group">
                <input
                  id="motion-heartbeat-toggle"
                  type="checkbox"
                  checked={config.motion.heartbeat.enabled}
                  onChange={(e) => updateMotion('heartbeat', 'enabled', e.target.checked)}
                  className="switch-checkbox"
                />
                <label htmlFor="motion-heartbeat-toggle" className="switch-label">
                  <strong>Nhịp tim co bóp (Heartbeat)</strong>
                </label>
              </div>
              <span className={`status-pill ${config.motion.heartbeat.enabled ? 'active' : ''}`}>
                {config.motion.heartbeat.enabled ? 'Đang bật' : 'Tắt'}
              </span>
            </div>

            {config.motion.heartbeat.enabled && (
              <div className="sub-params">
                <div className="param-row">
                  <div className="param-label-group">
                    <label htmlFor="param-heartbeat-str" className="param-label-sub">Cường độ nhịp</label>
                    <span className="param-value-tag">+{((config.motion.heartbeat.strength) * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    id="param-heartbeat-str"
                    type="range"
                    min="0.00"
                    max="0.12"
                    step="0.01"
                    value={config.motion.heartbeat.strength}
                    onChange={(e) => updateMotion('heartbeat', 'strength', parseFloat(e.target.value))}
                    className="param-slider"
                  />
                </div>

                <div className="param-row">
                  <div className="param-label-group">
                    <label htmlFor="param-heartbeat-bpm" className="param-label-sub">Tốc độ nhịp tim</label>
                    <span className="param-value-tag">{config.motion.heartbeat.bpm} BPM</span>
                  </div>
                  <input
                    id="param-heartbeat-bpm"
                    type="range"
                    min="40"
                    max="140"
                    step="2"
                    value={config.motion.heartbeat.bpm}
                    onChange={(e) => updateMotion('heartbeat', 'bpm', parseInt(e.target.value, 10))}
                    className="param-slider"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Spin */}
          <div className="motion-sub-card">
            <div className="motion-header">
              <div className="toggle-switch-group">
                <input
                  id="motion-spin-toggle"
                  type="checkbox"
                  checked={config.motion.spin.enabled}
                  onChange={(e) => updateMotion('spin', 'enabled', e.target.checked)}
                  className="switch-checkbox"
                />
                <label htmlFor="motion-spin-toggle" className="switch-label">
                  <strong>Tự xoay đều (Spin Y)</strong>
                </label>
              </div>
              <span className={`status-pill ${config.motion.spin.enabled ? 'active' : ''}`}>
                {config.motion.spin.enabled ? 'Đang bật' : 'Tắt'}
              </span>
            </div>

            {config.motion.spin.enabled && (
              <div className="sub-params">
                <div className="param-row">
                  <div className="param-label-group">
                    <label htmlFor="param-spin-spd" className="param-label-sub">Tốc độ xoay</label>
                    <span className="param-value-tag">{config.motion.spin.speedDegPerSecond}°/s</span>
                  </div>
                  <input
                    id="param-spin-spd"
                    type="range"
                    min="0"
                    max="60"
                    step="1"
                    value={config.motion.spin.speedDegPerSecond}
                    onChange={(e) => updateMotion('spin', 'speedDegPerSecond', parseInt(e.target.value, 10))}
                    className="param-slider"
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      </>
    )}

        {/* SECTION 4: Quick Copy Snippets */}
        <section className="param-section">
          <h4 className="section-title">4. Xuất cấu hình cho dự án</h4>
          <div className="quick-export-buttons">
            <button
              type="button"
              className="btn-export-tile"
              onClick={onCopyJson}
              title="Sao chép toàn bộ đối tượng AssetConfig dưới dạng JSON"
            >
              <Copy size={16} />
              <div className="export-text">
                <span className="export-title">Sao chép JSON</span>
                <span className="export-sub">Dữ liệu tham số thuần</span>
              </div>
              {copyStatus?.type === 'json' && (
                copyStatus.success ? <Check size={16} className="text-success" /> : <AlertCircle size={16} className="text-danger" />
              )}
            </button>

            <button
              type="button"
              className="btn-export-tile"
              onClick={onCopyJsx}
              title="Sao chép đoạn mã React Three Fiber hoàn chỉnh sẵn sàng chạy"
            >
              <Code size={16} />
              <div className="export-text">
                <span className="export-title">Sao chép JSX</span>
                <span className="export-sub">Mã nguồn React chuẩn</span>
              </div>
              {copyStatus?.type === 'jsx' && (
                copyStatus.success ? <Check size={16} className="text-success" /> : <AlertCircle size={16} className="text-danger" />
              )}
            </button>

            <button
              type="button"
              className="btn-export-tile highlight"
              onClick={onCopyAiPrompt}
              title="Sao chép hướng dẫn đầy đủ để gửi cho AI lập trình ghép thiệp"
            >
              <Sparkles size={16} />
              <div className="export-text">
                <span className="export-title">Hướng dẫn cho AI</span>
                <span className="export-sub">Quy ước & lệnh ghép thiệp</span>
              </div>
              {copyStatus?.type === 'ai' && (
                copyStatus.success ? <Check size={16} className="text-success" /> : <AlertCircle size={16} className="text-danger" />
              )}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ParameterPanel;
