import React from 'react';
import {
  RotateCcw,
  Play,
  Eye,
  Palette,
  Wind,
  MessageSquare,
} from 'lucide-react';
import { AssetConfig, RoseRevealConfig } from '../../types';
import { defaultRoseRevealConfig } from './presets';

export interface RoseParameterPanelProps {
  config: AssetConfig;
  onChange: (updated: AssetConfig) => void;
  onTriggerPreview?: () => void;
  onReplay?: () => void;
}

export const RoseParameterPanel: React.FC<RoseParameterPanelProps> = ({
  config,
  onChange,
  onTriggerPreview,
  onReplay,
}) => {
  const rCfg: RoseRevealConfig = {
    ...defaultRoseRevealConfig,
    ...(config.roseReveal || {}),
  };

  const updateRose = <K extends keyof RoseRevealConfig>(key: K, val: RoseRevealConfig[K]) => {
    onChange({
      ...config,
      roseReveal: {
        ...rCfg,
        [key]: val,
      },
    });
  };

  // Helper for quick inspection presets (0%, 25%, 50%, 75%, 100%)
  const setInspectionProgress = (prog: number) => {
    onChange({
      ...config,
      roseReveal: {
        ...rCfg,
        manualBloomProgress: prog,
      },
    });
  };

  return (
    <div className="rose-parameter-panel" role="region" aria-label="Bảng tùy chỉnh Bông hồng mở quà">
      {/* Action Bar for Rose Reveal */}
      <div className="panel-actions-top" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
        {onTriggerPreview && (
          <button
            type="button"
            className="btn-action-primary"
            onClick={onTriggerPreview}
            title="Kích hoạt hiệu ứng hoa nở và cánh bay xem thử"
          >
            <Play size={15} /> Xem thử nở hoa
          </button>
        )}
        {onReplay && (
          <button
            type="button"
            className="btn-action-ghost"
            onClick={onReplay}
            title="Đặt lại hoa về trạng thái khép ban đầu"
          >
            <RotateCcw size={15} /> Phát lại
          </button>
        )}
      </div>

      {/* SECTION 1: Inspection Mode & Manual Bloom Progress */}
      <section className="param-section">
        <h4 className="section-title">
          <Eye size={16} /> 1. Chế độ kiểm tra (Inspection & Debug)
        </h4>

        {/* Orbit inspection toggle */}
        <div className="param-row" style={{ marginBottom: '0.8rem' }}>
          <div className="toggle-switch-group">
            <input
              id="param-inspection-orbit"
              type="checkbox"
              checked={rCfg.inspectionMode === true}
              onChange={(e) => updateRose('inspectionMode', e.target.checked)}
              className="switch-checkbox"
            />
            <label htmlFor="param-inspection-orbit" className="switch-label">
              <strong>Góc nhìn tự do (3D Orbit)</strong>
            </label>
          </div>
          <span className={`status-pill ${rCfg.inspectionMode ? 'active' : ''}`}>
            {rCfg.inspectionMode ? 'Bật xoay 360°' : 'Cố định'}
          </span>
        </div>

        {/* Manual Bloom Progress Slider (0% - 100%) */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="param-manual-bloom" className="param-label">Tiến trình nở (Kiểm tra từng lớp)</label>
            <span className="param-value-tag">
              {rCfg.manualBloomProgress !== undefined && rCfg.manualBloomProgress >= 0
                ? `${Math.round(rCfg.manualBloomProgress * 100)}%`
                : 'Tự động (Chạy timeline)'}
            </span>
          </div>

          <div className="slider-container">
            <input
              id="param-manual-bloom"
              type="range"
              min="-0.01"
              max="1.0"
              step="0.01"
              value={rCfg.manualBloomProgress !== undefined ? rCfg.manualBloomProgress : -0.01}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                updateRose('manualBloomProgress', v < 0 ? -1 : v);
              }}
              className="param-slider"
            />
          </div>

          {/* Quick preset buttons: 0%, 25%, 50%, 75%, 100%, Auto */}
          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
            {[
              { label: '0% (Khép)', val: 0.0 },
              { label: '25%', val: 0.25 },
              { label: '50%', val: 0.50 },
              { label: '75%', val: 0.75 },
              { label: '100% (Nở rộ)', val: 1.0 },
              { label: 'Tự động', val: -1 },
            ].map((btn) => (
              <button
                key={btn.label}
                type="button"
                className={`btn-sub-action ${(rCfg.manualBloomProgress ?? -1) === btn.val ? 'active' : ''}`}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color, #444)',
                  background: (rCfg.manualBloomProgress ?? -1) === btn.val ? '#F46C91' : 'transparent',
                  color: (rCfg.manualBloomProgress ?? -1) === btn.val ? '#fff' : 'inherit',
                  cursor: 'pointer',
                }}
                onClick={() => setInspectionProgress(btn.val)}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: Màu sắc & Vật liệu */}
      <section className="param-section">
        <h4 className="section-title">
          <Palette size={16} /> 2. Màu sắc & Vật liệu
        </h4>

        {/* Petal Color */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="param-petal-color" className="param-label">Màu cánh hoa chính</label>
            <span className="param-value-tag">{rCfg.petalColor.toUpperCase()}</span>
          </div>
          <div className="color-picker-input-group">
            <input
              id="param-petal-color-picker"
              type="color"
              value={rCfg.petalColor}
              onChange={(e) => updateRose('petalColor', e.target.value)}
              className="color-swatch-picker"
            />
            <input
              id="param-petal-color"
              type="text"
              value={rCfg.petalColor}
              onChange={(e) => updateRose('petalColor', e.target.value)}
              className="color-text-input"
              maxLength={7}
            />
          </div>
        </div>

        {/* Petal Inner Core Color */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="param-inner-color" className="param-label">Màu lòng cánh hoa (Đậm hơn)</label>
            <span className="param-value-tag">{rCfg.petalInnerColor.toUpperCase()}</span>
          </div>
          <div className="color-picker-input-group">
            <input
              id="param-inner-color-picker"
              type="color"
              value={rCfg.petalInnerColor}
              onChange={(e) => updateRose('petalInnerColor', e.target.value)}
              className="color-swatch-picker"
            />
            <input
              id="param-inner-color"
              type="text"
              value={rCfg.petalInnerColor}
              onChange={(e) => updateRose('petalInnerColor', e.target.value)}
              className="color-text-input"
              maxLength={7}
            />
          </div>
        </div>

        {/* Petal Edge Highlight Color */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="param-edge-color" className="param-label">Màu viền cánh hoa (Sáng hơn)</label>
            <span className="param-value-tag">{rCfg.petalEdgeColor.toUpperCase()}</span>
          </div>
          <div className="color-picker-input-group">
            <input
              id="param-edge-color-picker"
              type="color"
              value={rCfg.petalEdgeColor}
              onChange={(e) => updateRose('petalEdgeColor', e.target.value)}
              className="color-swatch-picker"
            />
            <input
              id="param-edge-color"
              type="text"
              value={rCfg.petalEdgeColor}
              onChange={(e) => updateRose('petalEdgeColor', e.target.value)}
              className="color-text-input"
              maxLength={7}
            />
          </div>
        </div>

        {/* Stem & Leaves Color */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="param-stem-color" className="param-label">Màu thân & lá xanh</label>
            <span className="param-value-tag">{rCfg.stemColor.toUpperCase()}</span>
          </div>
          <div className="color-picker-input-group">
            <input
              id="param-stem-color-picker"
              type="color"
              value={rCfg.stemColor}
              onChange={(e) => updateRose('stemColor', e.target.value)}
              className="color-swatch-picker"
            />
            <input
              id="param-stem-color"
              type="text"
              value={rCfg.stemColor}
              onChange={(e) => updateRose('stemColor', e.target.value)}
              className="color-text-input"
              maxLength={7}
            />
          </div>
        </div>

        {/* Background Color */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="param-bg-color" className="param-label">Màu nền tối (Tím mận / Nâu tím)</label>
            <span className="param-value-tag">{rCfg.backgroundColor.toUpperCase()}</span>
          </div>
          <div className="color-picker-input-group">
            <input
              id="param-bg-color-picker"
              type="color"
              value={rCfg.backgroundColor}
              onChange={(e) => updateRose('backgroundColor', e.target.value)}
              className="color-swatch-picker"
            />
            <input
              id="param-bg-color"
              type="text"
              value={rCfg.backgroundColor}
              onChange={(e) => updateRose('backgroundColor', e.target.value)}
              className="color-text-input"
              maxLength={7}
            />
          </div>
        </div>

        {/* Ambient Light Intensity */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="param-ambient-light" className="param-label">Cường độ ánh sáng môi trường</label>
            <span className="param-value-tag">{rCfg.ambientLightIntensity.toFixed(2)}</span>
          </div>
          <input
            id="param-ambient-light"
            type="range"
            min="0.2"
            max="2.0"
            step="0.05"
            value={rCfg.ambientLightIntensity}
            onChange={(e) => updateRose('ambientLightIntensity', parseFloat(e.target.value))}
            className="param-slider"
          />
        </div>

        {/* Flower Scale */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="param-flower-scale" className="param-label">Kích thước bông hoa</label>
            <span className="param-value-tag">{rCfg.flowerScale.toFixed(2)}x</span>
          </div>
          <input
            id="param-flower-scale"
            type="range"
            min="0.6"
            max="1.8"
            step="0.05"
            value={rCfg.flowerScale}
            onChange={(e) => updateRose('flowerScale', parseFloat(e.target.value))}
            className="param-slider"
          />
        </div>
      </section>

      {/* SECTION 3: Chuyển động hoa & Cánh bay */}
      <section className="param-section">
        <h4 className="section-title">
          <Wind size={16} /> 3. Chuyển động & Cánh hoa bay
        </h4>

        {/* Bloom Duration */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="param-bloom-duration" className="param-label">Thời gian nở hoa</label>
            <span className="param-value-tag">{rCfg.bloomDuration.toFixed(1)} giây</span>
          </div>
          <input
            id="param-bloom-duration"
            type="range"
            min="1.0"
            max="4.0"
            step="0.1"
            value={rCfg.bloomDuration}
            onChange={(e) => updateRose('bloomDuration', parseFloat(e.target.value))}
            className="param-slider"
          />
        </div>

        {/* Flying Petals Count */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="param-flying-count" className="param-label">Số lượng cánh bay</label>
            <span className="param-value-tag">{rCfg.flyingPetalsCount} cánh</span>
          </div>
          <input
            id="param-flying-count"
            type="range"
            min="20"
            max="120"
            step="5"
            value={rCfg.flyingPetalsCount}
            onChange={(e) => updateRose('flyingPetalsCount', parseInt(e.target.value, 10))}
            className="param-slider"
          />
        </div>

        {/* Burst Speed (Tốc độ tỏa) */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="param-burst-spd" className="param-label">
              Tốc độ tỏa (Vận tốc ban đầu khi rời đầu hoa)
            </label>
            <span className="param-value-tag">{rCfg.burstSpeed.toFixed(2)}</span>
          </div>
          <input
            id="param-burst-spd"
            type="range"
            min="0.5"
            max="3.5"
            step="0.1"
            value={rCfg.burstSpeed}
            onChange={(e) => updateRose('burstSpeed', parseFloat(e.target.value))}
            className="param-slider"
          />
        </div>

        {/* Fall Speed (Tốc độ rơi) */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="param-fall-spd" className="param-label">
              Tốc độ rơi (Chuyển động xuống sau khi tỏa)
            </label>
            <span className="param-value-tag">{rCfg.fallSpeed.toFixed(2)}</span>
          </div>
          <input
            id="param-fall-spd"
            type="range"
            min="0.2"
            max="2.5"
            step="0.05"
            value={rCfg.fallSpeed}
            onChange={(e) => updateRose('fallSpeed', parseFloat(e.target.value))}
            className="param-slider"
          />
        </div>

        {/* Spin Speed (Tốc độ xoay cánh) */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="param-spin-spd" className="param-label">
              Tốc độ xoay (Tự xoay quanh bản thân cánh)
            </label>
            <span className="param-value-tag">{rCfg.spinSpeed.toFixed(2)}</span>
          </div>
          <input
            id="param-spin-spd"
            type="range"
            min="0.5"
            max="4.0"
            step="0.1"
            value={rCfg.spinSpeed}
            onChange={(e) => updateRose('spinSpeed', parseFloat(e.target.value))}
            className="param-slider"
          />
        </div>
      </section>

      {/* SECTION 4: Nội dung chữ & Trang đích */}
      <section className="param-section">
        <h4 className="section-title">
          <MessageSquare size={16} /> 4. Lời nhắn & Trang đích
        </h4>

        {/* Message Text */}
        <div className="param-row">
          <label htmlFor="param-message-text" className="param-label">Lời nhắn mở đầu</label>
          <input
            id="param-message-text"
            type="text"
            value={rCfg.messageText}
            onChange={(e) => updateRose('messageText', e.target.value)}
            className="form-control"
            placeholder="Có một điều nhỏ bé dành cho bạn"
            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', background: 'var(--input-bg, #222)', color: 'inherit', border: '1px solid var(--border-color, #444)' }}
          />
        </div>

        {/* Button Text */}
        <div className="param-row">
          <label htmlFor="param-button-text" className="param-label">Chữ trên nút mở quà</label>
          <input
            id="param-button-text"
            type="text"
            value={rCfg.buttonText}
            onChange={(e) => updateRose('buttonText', e.target.value)}
            className="form-control"
            placeholder="Chạm để mở quà ♡"
            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', background: 'var(--input-bg, #222)', color: 'inherit', border: '1px solid var(--border-color, #444)' }}
          />
        </div>

        {/* Destination Target */}
        <div className="param-row">
          <div className="param-label-group">
            <label htmlFor="param-dest-target" className="param-label">Trang đích sau khi mở</label>
            <span className="param-value-tag">{rCfg.destinationTarget}</span>
          </div>
          <select
            id="param-dest-target"
            value={rCfg.destinationTarget}
            onChange={(e) => updateRose('destinationTarget', e.target.value as 'demo-card' | 'love-universe-01')}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '6px',
              background: 'var(--input-bg, #222)',
              color: 'inherit',
              border: '1px solid var(--border-color, #444)',
            }}
          >
            <option value="demo-card">Thẻ quà tặng demo (Món quà dành cho bạn)</option>
            <option value="love-universe-01">Vũ trụ lời chúc 3D (love-universe-01)</option>
          </select>
        </div>
      </section>
    </div>
  );
};

export default RoseParameterPanel;
