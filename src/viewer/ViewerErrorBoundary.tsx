import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Eye } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackSvgUrl?: string;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  force2DFallback: boolean;
}

export class ViewerErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    force2DFallback: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, force2DFallback: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ViewerErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, force2DFallback: false });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  private handleToggleFallback = () => {
    this.setState((prev) => ({ force2DFallback: !prev.force2DFallback }));
  };

  public render() {
    if (this.state.force2DFallback && this.props.fallbackSvgUrl) {
      return (
        <div className="viewer-fallback-container" role="region" aria-label="Hình ảnh 2D thay thế">
          <div className="fallback-badge">
            <Eye size={14} /> Chế độ 2D Fallback
          </div>
          <img
            src={this.props.fallbackSvgUrl}
            alt="Mẫu hiển thị ở chế độ 2D fallback"
            className="fallback-image"
          />
          <button
            type="button"
            className="btn-retry-3d"
            onClick={this.handleRetry}
            aria-label="Thử khởi động lại 3D"
          >
            <RefreshCw size={14} /> Thử lại chế độ 3D
          </button>
        </div>
      );
    }

    if (this.state.hasError) {
      return (
        <div className="viewer-error-container" role="alert">
          <div className="viewer-error-content">
            <AlertTriangle size={32} className="error-icon" />
            <h3 className="error-title">Không thể hiển thị sân khấu 3D</h3>
            <p className="error-desc">
              Có thể do WebGL bị mất context hoặc trình duyệt gặp sự cố đồ họa.
            </p>
            <div className="error-actions">
              <button
                type="button"
                className="btn-primary-action"
                onClick={this.handleRetry}
              >
                <RefreshCw size={14} /> Khởi động lại 3D
              </button>
              {this.props.fallbackSvgUrl && (
                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={this.handleToggleFallback}
                >
                  <Eye size={14} /> Xem ảnh 2D thay thế
                </button>
              )}
            </div>
            {this.state.error && (
              <details className="error-details">
                <summary>Chi tiết lỗi kỹ thuật</summary>
                <pre>{this.state.error.message}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ViewerErrorBoundary;
