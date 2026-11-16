import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Sparkles, Terminal, Info, RefreshCw } from 'lucide-react';
import { MotionRig } from '../gift-library/motion/MotionRig';
import { DevBox } from '../gift-library/objects/dev-fixture/DevBox';
import { devBoxDefaultConfig } from '../gift-library/objects/dev-fixture/presets';
import { StudioLighting } from '../viewer/StudioLighting';
import { AssetConfig } from '../gift-library/types';

export interface IntegrationPageProps {
  lastActiveConfig?: AssetConfig;
}

export const IntegrationPage: React.FC<IntegrationPageProps> = ({ lastActiveConfig }) => {
  // In Stage A, product card shows "Chưa có mẫu" by default
  const [showDevFixturePreview, setShowDevFixturePreview] = useState(false);
  const [showSecondInstance, setShowSecondInstance] = useState(true);

  // Instance 1 config
  const [instance1Config, setInstance1Config] = useState<AssetConfig>(
    lastActiveConfig || devBoxDefaultConfig
  );

  // Instance 2 config (independent instance to test isolation)
  const instance2Config: AssetConfig = {
    ...devBoxDefaultConfig,
    appearance: {
      color: '#F46C91',
      roughness: 0.25,
      metalness: 0.0,
    },
    transform: {
      scale: 0.55,
      rotationDeg: [0, 25, 10],
    },
    motion: {
      float: { enabled: true, amplitude: 0.05, speed: 0.5 },
      heartbeat: { enabled: true, strength: 0.08, bpm: 90 },
      spin: { enabled: true, speedDegPerSecond: 25 },
    },
  };

  const handleApplyCurrentConfig = () => {
    if (lastActiveConfig) {
      setInstance1Config({ ...lastActiveConfig });
    }
  };

  return (
    <div className="integration-page-container">
      {/* Stage A Status Notice */}
      <div className="integration-notice-card">
        <div className="notice-icon-col">
          <Info size={24} className="text-primary" />
        </div>
        <div className="notice-body-col">
          <h4>Kiểm tra khả năng tái sử dụng trên thiệp chúc mừng</h4>
          <p>
            Theo đặc tả <strong>Giai đoạn A</strong>: Thẻ thiệp hiển thị trạng thái <em>Chưa có mẫu</em> cho đến khi Trái tim mẫu 1 được tạo ở Giai đoạn B.
            Bạn có thể bật chế độ kiểm tra với <strong>Khối kỹ thuật (Dev Fixture)</strong> để xác minh tính độc lập của các instance 3D và pipeline tái sử dụng.
          </p>
          <div className="notice-actions-row">
            <button
              type="button"
              className={`btn-toggle-dev-card ${showDevFixturePreview ? 'active' : ''}`}
              onClick={() => setShowDevFixturePreview((v) => !v)}
            >
              <Terminal size={15} />
              <span>{showDevFixturePreview ? 'Ẩn bản thử kỹ thuật' : 'Bật bản thử kỹ thuật trên thiệp'}</span>
            </button>

            {showDevFixturePreview && lastActiveConfig && (
              <button
                type="button"
                className="btn-apply-recent-config"
                onClick={handleApplyCurrentConfig}
                title="Áp dụng các thông số bạn vừa tinh chỉnh trong xưởng thử"
              >
                <RefreshCw size={14} />
                <span>Áp dụng cấu hình vừa tinh chỉnh</span>
              </button>
            )}

            {showDevFixturePreview && (
              <label className="checkbox-dual-instance">
                <input
                  type="checkbox"
                  checked={showSecondInstance}
                  onChange={(e) => setShowSecondInstance(e.target.checked)}
                />
                <span>Hiển thị instance thứ hai (kiểm tra tính độc lập màu sắc/motion)</span>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Greeting Card Mockup */}
      <div className="card-mockup-wrapper">
        <div className="greeting-card-surface">
          <div className="card-decorative-border">
            <div className="card-content-area">
              <header className="card-greeting-header">
                <span className="card-tagline">
                  <Sparkles size={14} /> DingDong Card
                </span>
                <h2 className="card-main-title">Một chút yêu thương dành cho bạn</h2>
                <p className="card-sub-title">
                  Chúc bạn một ngày ấm áp, ngập tràn nụ cười và những điều dịu dàng nhất.
                </p>
              </header>

              {/* 3D Scene viewport on card */}
              <div className="card-viewport-stage" role="region" aria-label="Khung chi tiết trang trí thiệp">
                {showDevFixturePreview ? (
                  <Canvas
                    camera={{ position: [0, 0, 5], fov: 42 }}
                    dpr={[1, 1.5]}
                    gl={{ alpha: true, antialias: true }}
                  >
                    <StudioLighting />

                    <Suspense fallback={null}>
                      {/* Instance 1 (Main object) */}
                      <group position={showSecondInstance ? [-0.8, 0, 0] : [0, 0, 0]}>
                        <MotionRig
                          transform={instance1Config.transform}
                          motion={instance1Config.motion}
                        >
                          <DevBox
                            color={instance1Config.appearance.color}
                            roughness={instance1Config.appearance.roughness}
                            metalness={instance1Config.appearance.metalness}
                          />
                        </MotionRig>
                      </group>

                      {/* Instance 2 (Secondary independent instance) */}
                      {showSecondInstance && (
                        <group position={[1.2, -0.4, 0]}>
                          <MotionRig
                            transform={instance2Config.transform}
                            motion={instance2Config.motion}
                          >
                            <DevBox
                              color={instance2Config.appearance.color}
                              roughness={instance2Config.appearance.roughness}
                              metalness={instance2Config.appearance.metalness}
                            />
                          </MotionRig>
                        </group>
                      )}
                    </Suspense>

                    <OrbitControls
                      enablePan={false}
                      minDistance={3}
                      maxDistance={7}
                      autoRotate={false}
                    />
                  </Canvas>
                ) : (
                  <div className="card-empty-placeholder">
                    <div className="placeholder-content">
                      <span className="placeholder-badge">Chưa có mẫu chính thức</span>
                      <p className="placeholder-desc">
                        Giai đoạn A: Khung thiệp đã sẵn sàng. Trái tim 3D chính thức sẽ xuất hiện tại đây sau khi hoàn tất Giai đoạn B.
                      </p>
                      <button
                        type="button"
                        className="btn-enable-preview"
                        onClick={() => setShowDevFixturePreview(true)}
                      >
                        <Terminal size={14} /> Bật thử nghiệm với Dev Fixture
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <footer className="card-greeting-footer">
                <span className="card-signature">Thân gửi từ DingDong Gift ✨</span>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationPage;
