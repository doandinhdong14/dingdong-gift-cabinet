# Hướng dẫn tái sử dụng chi tiết DingDong Gift vào Thiệp chúc mừng

Tài liệu này hướng dẫn cách đưa một chi tiết trang trí 3D đã tinh chỉnh từ **Tủ đồ DingDong Gift** sang một dự án làm thiệp chúc mừng React bất kỳ.

---

## 1. Lưu ý căn bản về Cấu hình (JSON) và Mã nguồn (Component)

> **CẢNH BÁO QUAN TRỌNG:**
> Đoạn mã **JSON cấu hình (AssetConfig)** chỉ lưu trữ các tham số trạng thái (mã màu, độ nhám, tỉ lệ, biên độ dao động, nhịp tim).
> **JSON KHÔNG PHẢI LÀ FILE MÔ HÌNH 3D.**
> Để mô hình hiển thị và hoạt động trên thiệp, bạn **bắt buộc phải sao chép mã nguồn component và thư viện chuyển động (MotionRig)** sang dự án đích.

---

## 2. Các file cần sao chép sang dự án thiệp

Giả sử bạn muốn sử dụng mẫu `heart-01` (hoặc mẫu `dev-box-fixture`):

1. **Thư mục component:**
   Sao chép thư mục `src/gift-library/objects/<asset-id>/` sang thư mục tương ứng trong dự án thiệp (ví dụ: `src/components/gift-library/objects/<asset-id>/`).
2. **Thư viện chuyển động chung:**
   Sao chép toàn bộ thư mục `src/gift-library/motion/` (`MotionRig.tsx` và `motionMath.ts`).
3. **Định nghĩa kiểu TypeScript (nếu dự án dùng TS):**
   Sao chép `src/gift-library/types.ts`.
4. **Tài nguyên ảnh tĩnh (Thumbnail & Fallback SVG):**
   Sao chép `public/assets/<asset-id>/` sang thư mục `public/assets/<asset-id>/` của dự án thiệp. Hãy lưu ý điều chỉnh base path nếu dự án thiệp được host trên subpath (ví dụ: `/my-card/assets/...`).

---

## 3. Cài đặt thư viện phụ thuộc (Dependencies)

Trong dự án thiệp (React 18 hoặc React 19):

```bash
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three
```

---

## 4. Ví dụ mã nguồn hoàn chỉnh sẵn sàng chạy

Dưới đây là một component tấm thiệp React Three Fiber chuẩn hóa, tích hợp đầy đủ Canvas, ánh sáng studio, MotionRig và cấu hình tham số:

```tsx
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { MotionRig } from './gift-library/motion/MotionRig';
import { DevBox } from './gift-library/objects/dev-fixture'; // Hoặc Heart01 ở Giai đoạn B
import { AssetConfig } from './gift-library/types';

// Cấu hình đã tinh chỉnh từ Tủ đồ (hoặc xuất từ nút "Sao chép JSON")
const cardHeartConfig: AssetConfig = {
  schemaVersion: 1,
  assetId: 'dev-box-fixture',
  assetVersion: '0.1.0',
  appearance: {
    color: '#F46C91',
    roughness: 0.32,
    metalness: 0.05,
  },
  transform: {
    scale: 1.0,
    rotationDeg: [5, -15, 0],
  },
  motion: {
    float: { enabled: true, amplitude: 0.08, speed: 0.35 },
    heartbeat: { enabled: true, strength: 0.05, bpm: 72 },
    spin: { enabled: false, speedDegPerSecond: 15 },
  },
};

export function GreetingCard() {
  return (
    <div style={{
      maxWidth: '600px',
      margin: '40px auto',
      background: '#FAF7F2',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
      textAlign: 'center',
      fontFamily: 'sans-serif'
    }}>
      <h2 style={{ color: '#2B2824', marginBottom: '8px' }}>
        Một chút yêu thương dành cho bạn
      </h2>
      <p style={{ color: '#736B63', fontSize: '15px' }}>
        Chúc bạn một ngày luôn rạng rỡ và tràn ngập niềm vui.
      </p>

      {/* Sân khấu 3D độc lập trên thiệp */}
      <div style={{ width: '100%', height: '360px', position: 'relative' }}>
        <Canvas
          camera={{ position: [0, 0, 4.5], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
        >
          {/* Ánh sáng studio mềm chuẩn DingDong */}
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 5, 4]} intensity={1.2} />
          <directionalLight position={[-3, -2, -2]} intensity={0.3} color="#E0D7F5" />

          <Suspense fallback={null}>
            <MotionRig
              transform={cardHeartConfig.transform}
              motion={cardHeartConfig.motion}
            >
              <DevBox
                color={cardHeartConfig.appearance.color}
                roughness={cardHeartConfig.appearance.roughness}
                metalness={cardHeartConfig.appearance.metalness}
              />
            </MotionRig>
          </Suspense>

          {/* Controls cho phép người nhận xoay nhẹ ngắm nhìn */}
          <OrbitControls
            enablePan={false}
            minDistance={2.5}
            maxDistance={7.0}
          />
        </Canvas>
      </div>

      <p style={{ fontSize: '13px', color: '#9B948A', fontStyle: 'italic' }}>
        Thân gửi từ DingDong Gift ✨
      </p>
    </div>
  );
}

export default GreetingCard;
```

---

## 5. Hỗ trợ dự án thuần HTML / Framework khác

Các component trong `gift-library` là các React component sử dụng cú pháp React Three Fiber.
Nếu dự án thiệp của bạn được xây dựng bằng HTML/CSS/JS thuần hoặc framework khác (Vue, Svelte), bạn có thể:
1. Đóng gói component thành Web Component hoặc Micro-frontend.
2. Hoặc trích xuất trực tiếp thuật toán hình học từ file `geometry.ts` để sử dụng trực tiếp với Three.js thuần.
