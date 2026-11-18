import React, { useState, useEffect } from 'react';
import type { EffectDefinition, Preset } from '../effect-sdk/types';
import { loadEffectDefinition } from './catalog';
import { RuntimeProvider } from './RuntimeProvider';
import { useRuntimeContext } from './RuntimeContext';
import { EffectHost } from './EffectHost';
import { AutoControls } from './AutoControls';
import {
  loadCustomPresets,
  saveCustomPreset,
  deleteCustomPreset,
} from './PresetRepository';
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Bookmark,
  Info,
  ArrowLeft,
  Sun,
  Moon,
  Grid,
  Activity,
  Copy,
  Check,
} from 'lucide-react';

interface EffectPreviewPageProps {
  effectId: string;
  onBackToGallery: () => void;
}

export const EffectPreviewPage: React.FC<EffectPreviewPageProps> = ({
  effectId,
  onBackToGallery,
}) => {
  const [definition, setDefinition] = useState<EffectDefinition | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    loadEffectDefinition(effectId)
      .then((def) => {
        if (isCancelled) return;
        if (!def) {
          setError(`Không tìm thấy định nghĩa hiệu ứng cho "${effectId}".`);
        } else {
          setDefinition(def);
        }
      })
      .catch((err) => {
        if (isCancelled) return;
        setError(`Lỗi nạp hiệu ứng: ${err.message}`);
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [effectId]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        <p>Đang tải hiệu ứng "{effectId}"...</p>
      </div>
    );
  }

  if (error || !definition) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h3 style={{ color: '#ef4444' }}>Không thể mở hiệu ứng</h3>
        <p style={{ color: '#64748b' }}>{error || 'Không tìm thấy hiệu ứng'}</p>
        <button
          type="button"
          onClick={onBackToGallery}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            backgroundColor: '#6366f1',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            marginTop: '16px',
          }}
        >
          Quay lại Bộ sưu tập
        </button>
      </div>
    );
  }

  return (
    <RuntimeProvider>
      <EffectPreviewInner
        effectId={effectId}
        definition={definition}
        onBackToGallery={onBackToGallery}
      />
    </RuntimeProvider>
  );
};

interface EffectPreviewInnerProps {
  effectId: string;
  definition: EffectDefinition;
  onBackToGallery: () => void;
}

const EffectPreviewInner: React.FC<EffectPreviewInnerProps> = ({
  effectId,
  definition,
  onBackToGallery,
}) => {
  const { runtime, setPaused, replay, setSpeed, setQuality, eventsLog } = useRuntimeContext();

  const [activeTab, setActiveTab] = useState<'controls' | 'presets' | 'events' | 'info'>('controls');
  const [config, setConfig] = useState<any>(() => definition.defaults);
  const [backgroundMode, setBackgroundMode] = useState<'light' | 'dark' | 'checker'>('light');
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [customPresets, setCustomPresets] = useState<Preset<any>[]>(() => loadCustomPresets(effectId));
  const [newPresetName, setNewPresetName] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Apply preset
  const handleApplyPreset = (presetConfig: any) => {
    setConfig(presetConfig);
    replay();
  };

  // Save new custom preset
  const handleSavePreset = () => {
    if (!newPresetName.trim()) return;
    const newPreset: Preset<any> = {
      id: `custom_${Date.now()}`,
      name: newPresetName.trim(),
      config: JSON.parse(JSON.stringify(config)),
    };
    saveCustomPreset(effectId, newPreset);
    setCustomPresets(loadCustomPresets(effectId));
    setNewPresetName('');
  };

  const handleDeletePreset = (presetId: string) => {
    deleteCustomPreset(effectId, presetId);
    setCustomPresets(loadCustomPresets(effectId));
  };

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      className="effect-preview-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '20px',
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={onBackToGallery}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            <ArrowLeft size={16} /> Bộ sưu tập
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
              {definition.manifest.name}
            </h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: '#e0e7ff',
                  color: '#4338ca',
                  fontWeight: 600,
                }}
              >
                {definition.manifest.kind}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>v{definition.manifest.version}</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor:
                    definition.manifest.status === 'approved'
                      ? '#dcfce7'
                      : definition.manifest.status === 'review'
                      ? '#fef3c7'
                      : '#f1f5f9',
                  color:
                    definition.manifest.status === 'approved'
                      ? '#15803d'
                      : definition.manifest.status === 'review'
                      ? '#b45309'
                      : '#475569',
                }}
              >
                {definition.manifest.status}
              </span>
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setPaused(!runtime.isPaused)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: runtime.isPaused ? '#fef3c7' : '#fff',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            {runtime.isPaused ? <Play size={16} color="#d97706" /> : <Pause size={16} />}
            {runtime.isPaused ? 'Tiếp tục' : 'Tạm dừng'}
          </button>

          <button
            type="button"
            onClick={replay}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            <RotateCcw size={16} /> Chạy lại
          </button>

          <select
            value={runtime.speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              fontSize: '0.875rem',
            }}
          >
            <option value="0.5">0.5x</option>
            <option value="1">1.0x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2.0x</option>
          </select>

          <select
            value={runtime.quality}
            onChange={(e) => setQuality(e.target.value as any)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              fontSize: '0.875rem',
            }}
          >
            <option value="high">Chất lượng cao</option>
            <option value="medium">Trung bình</option>
            <option value="low">Tiết kiệm</option>
          </select>

          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: autoRotate ? '#e0e7ff' : '#fff',
              color: autoRotate ? '#4338ca' : '#334155',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Tự xoay: {autoRotate ? 'Bật' : 'Tắt'}
          </button>

          {/* Background switcher */}
          <div style={{ display: 'flex', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setBackgroundMode('light')}
              title="Nền sáng"
              style={{
                padding: '6px 8px',
                border: 'none',
                background: backgroundMode === 'light' ? '#e2e8f0' : '#fff',
                cursor: 'pointer',
              }}
            >
              <Sun size={14} />
            </button>
            <button
              type="button"
              onClick={() => setBackgroundMode('dark')}
              title="Nền tối"
              style={{
                padding: '6px 8px',
                border: 'none',
                background: backgroundMode === 'dark' ? '#e2e8f0' : '#fff',
                cursor: 'pointer',
              }}
            >
              <Moon size={14} />
            </button>
            <button
              type="button"
              onClick={() => setBackgroundMode('checker')}
              title="Nền ô caro"
              style={{
                padding: '6px 8px',
                border: 'none',
                background: backgroundMode === 'checker' ? '#e2e8f0' : '#fff',
                cursor: 'pointer',
              }}
            >
              <Grid size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Area: Canvas on left (65%), Panel on right (35%) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 380px',
          gap: '20px',
          minHeight: '600px',
        }}
      >
        {/* Stage */}
        <div style={{ width: '100%', height: '640px' }}>
          <EffectHost
            definition={definition}
            config={config}
            backgroundMode={backgroundMode}
            autoRotate={autoRotate}
          />
        </div>

        {/* Control Sidebar */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            height: '640px',
            overflow: 'hidden',
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('controls')}
              style={{
                flex: 1,
                padding: '10px 8px',
                border: 'none',
                borderBottom: activeTab === 'controls' ? '2px solid #6366f1' : 'none',
                background: activeTab === 'controls' ? '#fff' : 'transparent',
                fontWeight: activeTab === 'controls' ? 600 : 500,
                color: activeTab === 'controls' ? '#4f46e5' : '#64748b',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <Sliders size={14} /> Tùy chỉnh
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              style={{
                flex: 1,
                padding: '10px 8px',
                border: 'none',
                borderBottom: activeTab === 'presets' ? '2px solid #6366f1' : 'none',
                background: activeTab === 'presets' ? '#fff' : 'transparent',
                fontWeight: activeTab === 'presets' ? 600 : 500,
                color: activeTab === 'presets' ? '#4f46e5' : '#64748b',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <Bookmark size={14} /> Biến thể
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('events')}
              style={{
                flex: 1,
                padding: '10px 8px',
                border: 'none',
                borderBottom: activeTab === 'events' ? '2px solid #6366f1' : 'none',
                background: activeTab === 'events' ? '#fff' : 'transparent',
                fontWeight: activeTab === 'events' ? 600 : 500,
                color: activeTab === 'events' ? '#4f46e5' : '#64748b',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <Activity size={14} /> Sự kiện
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              style={{
                flex: 1,
                padding: '10px 8px',
                border: 'none',
                borderBottom: activeTab === 'info' ? '2px solid #6366f1' : 'none',
                background: activeTab === 'info' ? '#fff' : 'transparent',
                fontWeight: activeTab === 'info' ? 600 : 500,
                color: activeTab === 'info' ? '#4f46e5' : '#64748b',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <Info size={14} /> Chi tiết
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {activeTab === 'controls' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setConfig(definition.defaults)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Đặt lại mặc định
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyConfig}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    {copiedCode ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                    {copiedCode ? 'Đã chép' : 'Sao chép JSON'}
                  </button>
                </div>
                <AutoControls
                  controls={definition.controls}
                  config={config}
                  onChange={setConfig}
                />
              </div>
            )}

            {activeTab === 'presets' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.875rem', color: '#1e293b' }}>
                    Biến thể mặc định ({definition.presets.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {definition.presets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyPreset(preset.config)}
                        style={{
                          textAlign: 'left',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#f8fafc',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{preset.name}</div>
                        {preset.description && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{preset.description}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.875rem', color: '#1e293b' }}>
                    Biến thể tùy lưu ({customPresets.length})
                  </h4>
                  {customPresets.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: '#94a3b8' }}>Chưa có biến thể lưu nào.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {customPresets.map((preset) => (
                        <div
                          key={preset.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#fff',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleApplyPreset(preset.config)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              textAlign: 'left',
                              cursor: 'pointer',
                              flex: 1,
                            }}
                          >
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{preset.name}</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePreset(preset.id)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#ef4444',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                            }}
                          >
                            Xóa
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Save current config */}
                  <div style={{ marginTop: '12px', display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      placeholder="Tên biến thể mới..."
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.8125rem',
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleSavePreset}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#6366f1',
                        color: '#fff',
                        border: 'none',
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                      }}
                    >
                      Lưu
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.875rem', color: '#1e293b' }}>
                  Nhật ký sự kiện runtime ({eventsLog.length})
                </h4>
                {eventsLog.length === 0 ? (
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Chưa có sự kiện nào được phát ra.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {eventsLog.map((ev, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '4px',
                          backgroundColor: '#f1f5f9',
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                        }}
                      >
                        <span style={{ fontWeight: 600, color: '#4f46e5' }}>[{ev.type}]</span>{' '}
                        {JSON.stringify(ev)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'info' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8125rem' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Mã định danh (ID):</span>{' '}
                  <strong>{definition.manifest.id}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Loại hiệu ứng (Kind):</span>{' '}
                  <strong>{definition.manifest.kind}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Renderer:</span>{' '}
                  <strong>{definition.manifest.renderer}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Mô tả:</span>
                  <p style={{ margin: '4px 0 0 0', color: '#334155' }}>{definition.manifest.description}</p>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Thẻ (Tags):</span>{' '}
                  <span>{definition.manifest.tags.join(', ')}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Khả năng (Capabilities):</span>
                  <pre
                    style={{
                      background: '#f8fafc',
                      padding: '8px',
                      borderRadius: '6px',
                      margin: '4px 0 0 0',
                    }}
                  >
                    {JSON.stringify(definition.manifest.capabilities, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
