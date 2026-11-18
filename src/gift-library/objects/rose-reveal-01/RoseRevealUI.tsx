import React from 'react';
import { Sparkles, RotateCcw, Gift, AlertCircle } from 'lucide-react';
import { RoseRevealState } from './types';
import './roseReveal.css';

export interface RoseRevealUIProps {
  state: RoseRevealState;
  messageText: string;
  buttonText: string;
  destinationTarget: 'demo-card' | 'love-universe-01';
  onTriggerBloom: () => void;
  onReplay: () => void;
  error?: string | null;
  onRetry?: () => void;
}

export const RoseRevealUI: React.FC<RoseRevealUIProps> = ({
  state,
  messageText,
  buttonText,
  destinationTarget,
  onTriggerBloom,
  onReplay,
  error,
  onRetry,
}) => {
  const isIdle = state === 'idle';
  const isFinished = state === 'completed';
  const isRevealing = state === 'revealing';

  // Handle keyboard interaction on the button
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onTriggerBloom();
    }
  };

  return (
    <div className="rose-reveal-ui-overlay">
      {/* 1. Quick Replay button when completed */}
      {isFinished && (
        <button
          type="button"
          className="rose-reveal-quick-replay"
          onClick={onReplay}
          title="Xem lại hiệu ứng mở hoa từ đầu"
        >
          <RotateCcw size={14} />
          <span>Xem lại hoa</span>
        </button>
      )}

      {/* 2. Error Fallback */}
      {state === 'error' && (
        <div className="rose-reveal-error" role="alert">
          <AlertCircle size={32} color="#FFCDD2" />
          <p>{error || 'Đã xảy ra lỗi khi hiển thị mô hình 3D.'}</p>
          {onRetry && (
            <button type="button" className="rose-reveal-replay-btn" onClick={onRetry}>
              <RotateCcw size={14} /> Thử lại
            </button>
          )}
        </div>
      )}

      {/* 3. Bottom message and trigger button (visible in idle, fades out during bloom) */}
      <div
        className={`rose-reveal-bottom-content ${
          !isIdle ? 'fade-out' : ''
        }`}
      >
        <p className="rose-reveal-message">{messageText}</p>

        <button
          type="button"
          className="rose-reveal-open-btn"
          onClick={onTriggerBloom}
          onKeyDown={handleKeyDown}
          tabIndex={isIdle ? 0 : -1}
          aria-label={buttonText}
        >
          <div className="rose-reveal-btn-pulse" />
          <Sparkles size={16} />
          <span>{buttonText}</span>
        </button>
      </div>

      {/* 4. Destination Demo Card (shown when revealing or completed) */}
      {(isRevealing || isFinished) && destinationTarget === 'demo-card' && (
        <div className="rose-reveal-destination-overlay" role="region" aria-label="Nội dung món quà">
          <div className="rose-reveal-card">
            <div className="rose-reveal-card-icon">
              <Gift size={28} />
            </div>
            <h3 className="rose-reveal-card-title">Món quà dành cho bạn</h3>
            <p className="rose-reveal-card-body">
              Mong rằng mỗi ngày của bạn đều ngập tràn niềm vui, ngọt ngào và những điều dịu dàng nhất.
            </p>
            <button
              type="button"
              className="rose-reveal-replay-btn"
              onClick={onReplay}
            >
              <RotateCcw size={16} />
              <span>Xem lại bông hoa</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
