import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Sparkles, Heart, RefreshCw, CheckCircle2 } from 'lucide-react';
import { MotionRig } from '../gift-library/motion/MotionRig';
import { Heart01 } from '../gift-library/objects/heart-01/Heart01';
import { heart01DefaultConfig } from '../gift-library/objects/heart-01/presets';
import { StudioLighting } from '../viewer/StudioLighting';
import { AssetConfig } from '../gift-library/types';

export interface IntegrationPageProps {
  lastActiveConfig?: AssetConfig;
}

export const IntegrationPage: React.FC<IntegrationPageProps> = ({ lastActiveConfig }) => {
  const [showSecondInstance, setShowSecondInstance] = useState(true);

  // Instance 1 config: defaults to heart01DefaultConfig or user's active config
  const [instance1Config, setInstance1Config] = useState<AssetConfig>(
    lastActiveConfig && lastActiveConfig.assetId === 'heart-01'
      ? lastActiveConfig
      : heart01DefaultConfig
  );

  // Instance 2 config: an independent, smaller purple companion heart to verify isolation
  const instance2Config: AssetConfig = {
    ...heart01DefaultConfig,
    appearance: {
      color: '#B58CEB', // Dreamy purple
      roughness: 0.35,
      metalness: 0.0,
    },
    transform: {
      scale: 0.52,
      rotationDeg: [10, 20, 5],
    },
    motion: {
      float: { enabled: true, amplitude: 0.06, speed: 0.45 },
      heartbeat: { enabled: true, strength: 0.05, bpm: 84 },
      spin: { enabled: false, speedDegPerSecond: 15 },
    },
  };

  const handleApplyCurrentConfig = () => {
    if (lastActiveConfig && lastActiveConfig.assetId === 'heart-01') {
      setInstance1Config({ ...lastActiveConfig });
    }
  };

  return (
    <div className="integration-page-container">
      {/* Stage B Status Banner */}
      <div className="integration-notice-card">
        <div className="notice-icon-col">
          <Heart size={24} className="text-primary" />
        </div>
        <div className="notice-body-col">
          <h4>Thử nghiệm tái sử dụng Trái tim mẫu 1 (`heart-01`) trên thiệp</h4>
          <p>
            Trang này xác minh khả năng tái sử dụng thực tế của component <code>Heart01</code> và <code>MotionRig</code>.
            Mô hình được nhúng trực tiếp vào sân khấu thiệp chúc mừng với ánh sáng studio mềm.
            Bạn có thể kiểm tra 2 instance hoạt động đồng thời và hoàn toàn độc lập về màu sắc, scale và chuyển động.
          </p>
          <div className="notice-actions-row">
            {lastActiveConfig && lastActiveConfig.assetId === 'heart-01' && (
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

            <label className="checkbox-dual-instance">
              <input
                type="checkbox"
                checked={showSecondInstance}
                onChange={(e) => setShowSecondInstance(e.target.checked)}
              />
              <span>
                <CheckCircle2 size={14} className="text-success" />
                Hiển thị instance thứ hai (Tím mộng mơ • Scale 0.52x • Nhịp tim 84 BPM độc lập)
              </span>
            </label>
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
                <Canvas
                  camera={{ position: [0, 0, 4.8], fov: 42 }}
                  dpr={[1, 1.5]}
                  gl={{ alpha: true, antialias: true }}
                >
                  <StudioLighting />

                  <Suspense fallback={null}>
                    {/* Instance 1 (Main Heart01 object) */}
                    <group position={showSecondInstance ? [-0.65, 0.05, 0] : [0, 0, 0]}>
                      <MotionRig
                        transform={instance1Config.transform}
                        motion={instance1Config.motion}
                      >
                        <Heart01
                          color={instance1Config.appearance.color}
                          roughness={instance1Config.appearance.roughness}
                          metalness={instance1Config.appearance.metalness}
                        />
                      </MotionRig>
                    </group>

                    {/* Instance 2 (Secondary independent instance) */}
                    {showSecondInstance && (
                      <group position={[1.15, -0.35, 0]}>
                        <MotionRig
                          transform={instance2Config.transform}
                          motion={instance2Config.motion}
                        >
                          <Heart01
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
                    minDistance={3.0}
                    maxDistance={7.5}
                    autoRotate={false}
                  />
                </Canvas>
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
