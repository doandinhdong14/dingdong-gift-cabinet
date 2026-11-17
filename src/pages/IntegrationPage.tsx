import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Sparkles, Heart, RefreshCw, CheckCircle2, Orbit } from 'lucide-react';
import { MotionRig } from '../gift-library/motion/MotionRig';
import { Heart01 } from '../gift-library/objects/heart-01/Heart01';
import { heart01DefaultConfig } from '../gift-library/objects/heart-01/presets';
import { LoveUniverse01 } from '../gift-library/objects/love-universe-01/LoveUniverse01';
import { loveUniverse01DefaultConfig } from '../gift-library/objects/love-universe-01/presets';
import { LoveUniverseIntroButton } from '../gift-library/objects/love-universe-01/LoveUniverseIntroButton';
import { StudioLighting } from '../viewer/StudioLighting';
import { AssetConfig } from '../gift-library/types';

export interface IntegrationPageProps {
  lastActiveConfig?: AssetConfig;
}

export const IntegrationPage: React.FC<IntegrationPageProps> = ({ lastActiveConfig }) => {
  const [activeAssetId, setActiveAssetId] = useState<'heart-01' | 'love-universe-01'>(() => {
    return lastActiveConfig?.assetId === 'love-universe-01' ? 'love-universe-01' : 'heart-01';
  });

  const [showSecondInstance, setShowSecondInstance] = useState(true);

  // Instance 1 config for Heart01
  const [heartConfig, setHeartConfig] = useState<AssetConfig>(() => {
    return lastActiveConfig && lastActiveConfig.assetId === 'heart-01'
      ? lastActiveConfig
      : heart01DefaultConfig;
  });

  // Universe config for LoveUniverse01
  const [universeConfig, setUniverseConfig] = useState<AssetConfig>(() => {
    return lastActiveConfig && lastActiveConfig.assetId === 'love-universe-01'
      ? lastActiveConfig
      : loveUniverse01DefaultConfig;
  });

  const [isCardUniverseOpened, setIsCardUniverseOpened] = useState(false);

  // Secondary heart config to verify independent instances
  const secondaryHeartConfig: AssetConfig = {
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
    if (lastActiveConfig) {
      if (lastActiveConfig.assetId === 'heart-01') {
        setHeartConfig({ ...lastActiveConfig });
      } else if (lastActiveConfig.assetId === 'love-universe-01') {
        setUniverseConfig({ ...lastActiveConfig });
      }
    }
  };

  return (
    <div className="integration-page-container">
      {/* Asset Switcher Row */}
      <div className="integration-tabs-bar" role="tablist" aria-label="Chọn mẫu thiệp thử nghiệm">
        <button
          type="button"
          role="tab"
          aria-selected={activeAssetId === 'heart-01'}
          className={`integration-tab-btn ${activeAssetId === 'heart-01' ? 'active' : ''}`}
          onClick={() => setActiveAssetId('heart-01')}
        >
          <Heart size={16} />
          <span>Trái tim mẫu 1 (heart-01)</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeAssetId === 'love-universe-01'}
          className={`integration-tab-btn ${activeAssetId === 'love-universe-01' ? 'active' : ''}`}
          onClick={() => setActiveAssetId('love-universe-01')}
        >
          <Orbit size={16} />
          <span>Vũ trụ lời chúc (love-universe-01)</span>
        </button>
      </div>

      {/* Status Notice Banner */}
      <div className="integration-notice-card">
        <div className="notice-icon-col">
          {activeAssetId === 'heart-01' ? (
            <Heart size={24} className="text-primary" />
          ) : (
            <Orbit size={24} className="text-primary" />
          )}
        </div>
        <div className="notice-body-col">
          <h4>
            {activeAssetId === 'heart-01'
              ? 'Thử nghiệm tái sử dụng Trái tim mẫu 1 (heart-01) trên thiệp'
              : 'Thử nghiệm tái sử dụng Vũ trụ lời chúc (love-universe-01) trên thiệp'}
          </h4>
          <p>
            {activeAssetId === 'heart-01'
              ? 'Trang này xác minh khả năng tái sử dụng thực tế của component Heart01 và MotionRig. Bạn có thể kiểm tra 2 instance hoạt động đồng thời và hoàn toàn độc lập về màu sắc, scale và chuyển động.'
              : 'Trang này xác minh việc nhúng toàn bộ component LoveUniverse01 vào một tấm thiệp chúc mừng. Bạn có thể bấm "Chạm để mở vũ trụ", xoay đa chiều có damping, và xem ảnh/lời chúc bồng bềnh.'}
          </p>
          <div className="notice-actions-row">
            {lastActiveConfig && lastActiveConfig.assetId === activeAssetId && (
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

            {activeAssetId === 'heart-01' && (
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
            )}
          </div>
        </div>
      </div>

      {/* Greeting Card Mockup */}
      <div className="card-mockup-wrapper">
        <div className={`greeting-card-surface ${activeAssetId === 'love-universe-01' ? 'card-surface-universe' : ''}`}>
          <div className="card-decorative-border">
            <div className="card-content-area">
              <header className="card-greeting-header">
                <span className="card-tagline">
                  <Sparkles size={14} /> DingDong Card
                </span>
                <h2 className="card-main-title">
                  {activeAssetId === 'heart-01'
                    ? 'Một chút yêu thương dành cho bạn'
                    : 'Vũ trụ yêu thương trao gửi đến bạn'}
                </h2>
                <p className="card-sub-title">
                  {activeAssetId === 'heart-01'
                    ? 'Chúc bạn một ngày ấm áp, ngập tràn nụ cười và những điều dịu dàng nhất.'
                    : 'Nơi lưu giữ ngàn lời chúc ngọt ngào và những kỷ niệm rực rỡ nhất giữa các vì sao.'}
                </p>
              </header>

              {/* 3D Scene viewport on card */}
              <div
                className={`card-viewport-stage ${activeAssetId === 'love-universe-01' ? 'stage-universe-height' : ''}`}
                role="region"
                aria-label="Khung chi tiết trang trí thiệp"
              >
                {activeAssetId === 'heart-01' ? (
                  <Canvas
                    camera={{ position: [0, 0, 4.8], fov: 42 }}
                    dpr={[1, 1.5]}
                    gl={{ alpha: true, antialias: true }}
                  >
                    <StudioLighting />

                    <Suspense fallback={null}>
                      {/* Instance 1 */}
                      <group position={showSecondInstance ? [-0.65, 0.05, 0] : [0, 0, 0]}>
                        <MotionRig
                          transform={heartConfig.transform}
                          motion={heartConfig.motion}
                        >
                          <Heart01
                            color={heartConfig.appearance.color}
                            roughness={heartConfig.appearance.roughness}
                            metalness={heartConfig.appearance.metalness}
                          />
                        </MotionRig>
                      </group>

                      {/* Instance 2 */}
                      {showSecondInstance && (
                        <group position={[1.15, -0.35, 0]}>
                          <MotionRig
                            transform={secondaryHeartConfig.transform}
                            motion={secondaryHeartConfig.motion}
                          >
                            <Heart01
                              color={secondaryHeartConfig.appearance.color}
                              roughness={secondaryHeartConfig.appearance.roughness}
                              metalness={secondaryHeartConfig.appearance.metalness}
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
                ) : (
                  <Canvas
                    camera={{ position: [0, 0, 9.2], fov: 45 }}
                    dpr={[1, 1.5]}
                    gl={{ alpha: false, antialias: true, powerPreference: 'high-performance' }}
                  >
                    <Suspense fallback={null}>
                      <LoveUniverse01
                        config={universeConfig}
                        isOpened={isCardUniverseOpened}
                        showIntro={true}
                      />
                    </Suspense>

                    <OrbitControls
                      enablePan={false}
                      enableDamping={true}
                      dampingFactor={0.05}
                      minDistance={3.5}
                      maxDistance={22.0}
                    />
                  </Canvas>
                )}

                {activeAssetId === 'love-universe-01' && !isCardUniverseOpened && (
                  <LoveUniverseIntroButton onOpen={() => setIsCardUniverseOpened(true)} />
                )}
              </div>

              {/* Card Footer */}
              <footer className="card-greeting-footer">
                <span className="card-signature">
                  {activeAssetId === 'heart-01'
                    ? 'Thân gửi từ DingDong Gift ✨'
                    : 'Gửi ngàn vì sao đến người đặc biệt ✨'}
                </span>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationPage;
