import React, { useState, useRef } from 'react';
import type { CharacterItem, PastelMemoryGardenConfig } from '../config';

interface CharacterEditorDockProps {
  config: PastelMemoryGardenConfig;
  characters: CharacterItem[];
  onUpdateCharacters: (newChars: CharacterItem[]) => void;
  onUpdateTestMode: (mode: PastelMemoryGardenConfig['testMode']) => void;
  cameraX: number;
}

export const CharacterEditorDock: React.FC<CharacterEditorDockProps> = ({
  config,
  characters,
  onUpdateCharacters,
  onUpdateTestMode,
  cameraX,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle uploading a new character photo
  const handleAddCharacter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const newChar: CharacterItem = {
        id: `user_char_${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, '').slice(0, 15),
        imageUrl: dataUrl,
        worldX: Math.round(cameraX + 450), // place right in current view
        baselineY: 58,
        scale: 1.0,
        zIndex: 10,
        labelOffsetY: 0,
        visible: true,
      };

      const updated = [...characters, newChar];
      onUpdateCharacters(updated);
      try {
        localStorage.setItem('dingdong_pastel_memory_garden_characters', JSON.stringify(updated));
      } catch {
        // quota ignore
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Replace photo of an existing character
  const handleReplacePhoto = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const updated = characters.map((c) => (c.id === id ? { ...c, imageUrl: dataUrl } : c));
      onUpdateCharacters(updated);
      try {
        localStorage.setItem('dingdong_pastel_memory_garden_characters', JSON.stringify(updated));
      } catch {}
    };
    reader.readAsDataURL(file);
  };

  // Update specific property of a character
  const handleUpdateChar = (id: string, updates: Partial<CharacterItem>) => {
    const updated = characters.map((c) => (c.id === id ? { ...c, ...updates } : c));
    onUpdateCharacters(updated);
    try {
      localStorage.setItem('dingdong_pastel_memory_garden_characters', JSON.stringify(updated));
    } catch {}
  };

  // Delete a character
  const handleDeleteChar = (id: string) => {
    const updated = characters.filter((c) => c.id !== id);
    onUpdateCharacters(updated);
    try {
      localStorage.setItem('dingdong_pastel_memory_garden_characters', JSON.stringify(updated));
    } catch {}
  };

  // Reset to initial default characters
  const handleResetDefaults = () => {
    try {
      localStorage.removeItem('dingdong_pastel_memory_garden_characters');
    } catch {}
    window.location.reload();
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        id="character-editor-dock-toggle"
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'absolute',
          top: '18px',
          left: '120px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: isOpen
            ? 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)'
            : 'rgba(255, 255, 255, 0.92)',
          color: isOpen ? '#ffffff' : '#831843',
          border: '1px solid rgba(244, 114, 182, 0.4)',
          borderRadius: '24px',
          boxShadow: '0 4px 16px rgba(244, 63, 94, 0.25)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <span>🌸</span>
        <span>{isOpen ? 'Đóng Editor' : 'Quản lý ảnh & Layer Debug'}</span>
      </button>

      {/* Editor Drawer Modal */}
      {isOpen && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '64px',
            left: '20px',
            width: '380px',
            maxHeight: 'calc(100% - 90px)',
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '16px',
            border: '1px solid rgba(244, 114, 182, 0.35)',
            boxShadow: '0 12px 36px rgba(219, 39, 119, 0.22)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: "'Segoe UI', Roboto, sans-serif",
            color: '#1e293b',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid rgba(244, 114, 182, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(to right, #fff1f2, #fdf2f8)',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#831843' }}>
                Quản lý ảnh & Debug Layer
              </div>
              <div style={{ fontSize: '11px', color: '#9d174d' }}>
                Upload ảnh PNG/WebP trong suốt, kéo chỉnh vị trí
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#94a3b8',
              }}
            >
              ✕
            </button>
          </div>

          <div
            style={{
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* 1. LAYER DEBUG MODES (TEST A - TEST F) */}
            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#9f1239',
                  marginBottom: '8px',
                }}
              >
                Chế độ kiểm tra Layer (TEST A - F)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {[
                  { mode: 'normal', label: 'Bình thường (Đầy đủ)' },
                  { mode: 'testA_bg_only', label: 'TEST A: Chỉ Background' },
                  { mode: 'testB_bg_girls', label: 'TEST B: Nền + Nhân vật' },
                  { mode: 'testC_with_foreground', label: 'TEST C: + Tiền cảnh nhẹ' },
                  { mode: 'testD_replace_demo', label: 'TEST D: Đổi 1 ảnh demo' },
                  { mode: 'testE_hide_girls', label: 'TEST E: Ẩn nhân vật' },
                  { mode: 'testF_panorama_motion', label: 'TEST F: Chuyển động' },
                ].map((item) => (
                  <button
                    key={item.mode}
                    type="button"
                    onClick={() => onUpdateTestMode(item.mode as PastelMemoryGardenConfig['testMode'])}
                    style={{
                      padding: '6px 8px',
                      fontSize: '11px',
                      fontWeight: config.testMode === item.mode ? 700 : 500,
                      borderRadius: '8px',
                      border:
                        config.testMode === item.mode
                          ? '1px solid #e11d48'
                          : '1px solid #fecdd3',
                      background:
                        config.testMode === item.mode ? '#ffe4e6' : '#ffffff',
                      color: config.testMode === item.mode ? '#9f1239' : '#475569',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. UPLOAD NEW CHARACTER */}
            <div
              style={{
                padding: '12px',
                background: '#fff1f2',
                borderRadius: '12px',
                border: '1px dashed #f43f5e',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#9f1239' }}>
                Thêm cô gái mới vào vườn hoa
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAddCharacter}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '9px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(244, 63, 94, 0.3)',
                }}
              >
                + Tải ảnh mới từ máy tính (PNG/WebP)
              </button>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                * Hỗ trợ ảnh người thật đã tách nền trong suốt để hòa tự nhiên vào vườn hoa.
              </div>
            </div>

            {/* 3. CHARACTERS LIST */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#9f1239',
                  }}
                >
                  Danh sách nhân vật ({characters.length})
                </div>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: '11px',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Khôi phục gốc
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {characters.map((char) => (
                  <div
                    key={char.id}
                    style={{
                      padding: '10px',
                      background: '#ffffff',
                      borderRadius: '10px',
                      border: '1px solid #fce7f3',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* Image Thumbnail */}
                      <img
                        src={char.imageUrl}
                        alt={char.name}
                        style={{
                          width: '42px',
                          height: '52px',
                          objectFit: 'contain',
                          borderRadius: '6px',
                          background: '#fff1f2',
                          border: '1px solid #fecdd3',
                        }}
                      />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <input
                          type="text"
                          value={char.name}
                          placeholder="Tên nhân vật..."
                          onChange={(e) => handleUpdateChar(char.id, { name: e.target.value })}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        />
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <label
                            style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              background: '#f1f5f9',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: '#475569',
                              border: '1px solid #cbd5e1',
                            }}
                          >
                            Đổi ảnh
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleReplacePhoto(char.id, f);
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleUpdateChar(char.id, { visible: !char.visible })}
                            style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              background: char.visible ? '#dcfce7' : '#fee2e2',
                              borderRadius: '4px',
                              border: 'none',
                              color: char.visible ? '#166534' : '#991b1b',
                              cursor: 'pointer',
                            }}
                          >
                            {char.visible ? 'Đang hiện' : 'Đã ẩn'}
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteChar(char.id)}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '4px',
                          fontSize: '14px',
                        }}
                        title="Xóa nhân vật"
                      >
                        🗑
                      </button>
                    </div>

                    {/* Sliders for X, Y, Scale */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                          <span>Vị trí X</span>
                          <span>{char.worldX}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="5200"
                          step="50"
                          value={char.worldX}
                          onChange={(e) =>
                            handleUpdateChar(char.id, { worldX: parseInt(e.target.value, 10) })
                          }
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                          <span>Vị trí chân Y</span>
                          <span>{char.baselineY}%</span>
                        </div>
                        <input
                          type="range"
                          min="35"
                          max="75"
                          step="1"
                          value={char.baselineY}
                          onChange={(e) =>
                            handleUpdateChar(char.id, { baselineY: parseInt(e.target.value, 10) })
                          }
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
