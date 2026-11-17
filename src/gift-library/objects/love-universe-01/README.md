# Vũ trụ lời chúc (`love-universe-01`)

- **ID:** `love-universe-01`
- **Tên:** Vũ trụ lời chúc
- **Phiên bản:** `0.1.0`
- **Trạng thái:** `review`
- **Danh mục:** `Trang trí`
- **Tác giả:** DingDong Gift

---

## 1. Mục tiêu hình ảnh & trải nghiệm

Lấy cảm hứng từ không gian vũ trụ lãng mạn trong video tham chiếu, mẫu cảnh **"Vũ trụ lời chúc"** mang đến một trải nghiệm thị giác 3D độc đáo:

- **Bầu trời đêm sâu thẳm:** Nền xanh đen huyền bí (`#040817`), điểm xuyết hàng ngàn vì sao nhỏ màu trắng & vàng ấm có chiều sâu và hiệu ứng lấp lánh nhẹ nhàng.
- **Lời chúc phát sáng dịu dàng:** Chữ màu vàng kem (`#FFF7D6`) với ánh sáng hào quang (glow) mềm, hỗ trợ đầy đủ tiếng Việt có dấu, đọc rõ ràng và không bị cháy sáng.
- **Ảnh cá nhân / Kỷ niệm:** Các tấm ảnh Polaroid hình chữ nhật phân bố ở các tầng sâu (gần, vừa, xa). Nếu chưa tải ảnh lên, hệ thống tự động hiển thị 6 tấm ảnh mẫu ký ức nghệ thuật vẽ bằng vector.
- **Trái tim 3D bồng bềnh:** Sử dụng hình học trái tim 3D procedural từ hệ thống của dự án, tối ưu bằng `InstancedMesh` (1 draw call duy nhất cho toàn bộ trái tim).
- **Không ép camera billboard:** Các tấm ảnh và câu chúc có độ nghiêng/lật 3D tự nhiên. Khi xoay góc nhìn, người dùng cảm nhận rõ không gian ba chiều.
- **Không bao giờ bị chữ ngược khi nhìn từ phía sau:** Sử dụng shader lật tọa độ UV khi mặt quay lưng (`gl_FrontFacing ? vUv : vec2(1.0 - vUv.x, vUv.y)`), giúp chữ và ảnh luôn đọc xuôi từ cả hai mặt trước và sau.
- **Bố cục có chủ đích:** Tối ưu hóa hướng nhìn ban đầu qua thuật toán phân bố mây xoắn ốc kết hợp seed ngẫu nhiên xác định.

---

## 2. Chuyển động & Tương tác

- **Màn mở đầu tương tác:** Khởi đầu chỉ với bầu trời sao lung linh và nút bấm tròn phát sáng *"Chạm để mở vũ trụ"*.
- **Hiệu ứng nở hoa (Bloom transition):** Khi chạm vào nút, toàn bộ ảnh, chữ và trái tim xuất hiện dần bằng chuyển động bung tỏa mềm mại trong ~1.6 giây.
- **Tự xoay rất chậm:** Toàn bộ cụm vũ trụ trôi xoay êm ái theo trục Y (2.5°/giây).
- **Tách biệt điều khiển:** OrbitControls chỉ xoay camera; cụm vũ trụ xoay độc lập, triệt tiêu hiện tượng xoay kép (double-spin).
- **Lơ lửng hữu cơ:** Mỗi phần tử có pha dao động ($\phi$) và vận tốc riêng, trôi nhẹ không rung lắc.
- **Hỗ trợ Pause & Giảm chuyển động:** Tương thích với `prefers-reduced-motion` và nút Tạm dừng.

---

## 3. Lưu trữ ảnh an toàn với IndexedDB

- Ảnh do người dùng tải lên từ máy tính được lưu trữ trực tiếp vào **IndexedDB** (`dingdong-gift-cabinet-universe`).
- Tuyệt đối **không** nhét chuỗi base64 khổng lồ vào `localStorage` gây tràn hạn ngạch trình duyệt.
- Cung cấp thao tác tải thêm ảnh, xóa từng ảnh và nút "Xóa tất cả ảnh đã lưu".

---

## 4. Cách tái sử dụng trên thiệp chúc mừng

\`\`\`tsx
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { LoveUniverse01 } from './gift-library/objects/love-universe-01';

export function GreetingCardUniverse() {
  return (
    <div style={{ width: '100%', height: '520px', position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, 0, 8.5], fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <LoveUniverse01
            wishes={[
              'Iu em nhất trên đời',
              'Chào cậu mình iu cậu nhiều lắm',
              '1000 lần yêu em',
              'Mỗi ngày đều yêu cậu',
            ]}
            textColor="#FFF7D6"
            heartColor="#FF3B69"
            glowIntensity={0.85}
            showIntro={true}
          />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableDamping={true}
          dampingFactor={0.05}
          minDistance={3.5}
          maxDistance={18.0}
        />
      </Canvas>
    </div>
  );
}
\`\`\`
