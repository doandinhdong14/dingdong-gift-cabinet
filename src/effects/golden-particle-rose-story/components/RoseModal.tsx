import React, { useEffect, useCallback } from 'react';
import type { RoseMemoryItem } from '../config';

export interface RoseModalProps {
  isOpen: boolean;
  activeRoseId: number | null;
  rosePhotos: RoseMemoryItem[];
  fallbackPhoto?: string;
  onClose: () => void;
  onNavigate: (newRoseId: number) => void;
}

export const RoseModal: React.FC<RoseModalProps> = ({
  isOpen,
  activeRoseId,
  rosePhotos,
  fallbackPhoto,
  onClose,
  onNavigate,
}) => {
  // Find current photo item
  const currentItem = activeRoseId
    ? rosePhotos.find((p) => p.id === activeRoseId) || rosePhotos[activeRoseId - 1]
    : null;

  const photoSrc = currentItem?.url || fallbackPhoto || '';
  const caption = currentItem?.caption || `Kỷ niệm bông hồng số ${activeRoseId || 1} ♥`;
  const date = currentItem?.date;

  const handlePrev = useCallback(() => {
    if (!activeRoseId) return;
    const prevId = activeRoseId === 1 ? 9 : activeRoseId - 1;
    onNavigate(prevId);
  }, [activeRoseId, onNavigate]);

  const handleNext = useCallback(() => {
    if (!activeRoseId) return;
    const nextId = activeRoseId === 9 ? 1 : activeRoseId + 1;
    onNavigate(nextId);
  }, [activeRoseId, onNavigate]);

  // Keyboard navigation (ESC, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !activeRoseId) return null;

  return (
    <div
      className="rose-modal-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(5, 5, 10, 0.88)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px 20px',
        boxSizing: 'border-box',
        zIndex: 100,
        animation: 'modalFadeIn 0.25s ease-out',
        userSelect: 'none',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Chi tiết ảnh bông hồng số ${activeRoseId}`}
    >
      <div
        className="rose-modal-card"
        style={{
          width: '100%',
          maxWidth: '320px',
          backgroundColor: '#120d18',
          border: '1.5px solid rgba(255, 215, 0, 0.45)',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.75), 0 0 24px rgba(225, 29, 72, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 215, 0, 0.15)',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: "'Comfortaa', sans-serif",
              fontSize: '13px',
              fontWeight: 600,
              color: '#ffd700',
            }}
          >
            <span>🌹 Bông hồng số {activeRoseId} / 9</span>
          </div>

          {/* Close button */}
          <button
            style={{
              background: 'none',
              border: 'none',
              color: '#fecdd3',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '8px',
              lineHeight: 1,
            }}
            onClick={onClose}
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {/* PHOTO CONTAINER */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '240px',
            backgroundColor: '#0a070e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {photoSrc ? (
            <img
              src={photoSrc}
              alt={`Ảnh kỷ niệm bông hồng ${activeRoseId}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : (
            <div style={{ color: '#ffd700', fontSize: '13px' }}>Chưa có ảnh</div>
          )}

          {/* Left Arrow Button */}
          <button
            style={{
              position: 'absolute',
              left: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'rgba(15, 10, 20, 0.75)',
              border: '1px solid rgba(255, 215, 0, 0.4)',
              color: '#ffd700',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
            onClick={handlePrev}
            aria-label="Ảnh trước"
          >
            ‹
          </button>

          {/* Right Arrow Button */}
          <button
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'rgba(15, 10, 20, 0.75)',
              border: '1px solid rgba(255, 215, 0, 0.4)',
              color: '#ffd700',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
            onClick={handleNext}
            aria-label="Ảnh tiếp theo"
          >
            ›
          </button>
        </div>

        {/* CAPTION & FOOTER */}
        <div
          style={{
            padding: '14px 16px 16px 16px',
            textAlign: 'center',
          }}
        >
          {date && (
            <div
              style={{
                fontFamily: "'Quicksand', sans-serif",
                fontSize: '12px',
                color: '#f43f5e',
                marginBottom: '4px',
                fontWeight: 500,
              }}
            >
              {date}
            </div>
          )}
          <div
            style={{
              fontFamily: "'Comfortaa', 'Quicksand', sans-serif",
              fontSize: '13.5px',
              fontWeight: 500,
              color: '#ffe4e6',
              lineHeight: '1.4',
            }}
          >
            {caption}
          </div>
        </div>
      </div>
    </div>
  );
};
