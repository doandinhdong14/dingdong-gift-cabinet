# Quy trình bổ sung tài nguyên 3D & Bảo vệ mẫu đã duyệt

Tài liệu này hướng dẫn các kỹ sư đồ họa, kỹ sư frontend và AI trợ lý quy trình chuẩn hóa để thêm một chi tiết trang trí mới vào **DingDong Gift — Tủ đồ sáng tạo**.

---

## 1. Nguyên tắc cốt lõi (Resource Contract)

1. **Tính độc lập & Tinh khiết (Pure Component):**
   - Chi tiết đồ vật **KHÔNG ĐƯỢC** tự tạo `<Canvas>`, camera, ánh sáng, nền, orbit controls hoặc thanh công cụ UI.
   - Component nhận thuộc tính hình dáng/vật liệu (`color`, `roughness`, `metalness`); chuyển động được đảm nhiệm bởi `MotionRig` dùng chung.
   - Không đọc `localStorage`, không phụ thuộc router ứng dụng, không import CSS toàn cục.

2. **Quy ước hình học (Geometry Conventions):**
   - Hệ trục tọa độ: **Y hướng lên**, mặt trước nhìn về phía **+Z**.
   - Tâm hình học chuẩn hóa đặt tại gốc tọa độ `(0, 0, 0)`.
   - Chiều cao chuẩn là **2 đơn vị** (tương ứng `scale = 1`).
   - Hình học (Geometry) được khởi tạo một lần hoặc dùng geometry có sẵn, không tái tạo mỗi frame nhằm tránh rò rỉ bộ nhớ GPU.
   - Hỗ trợ nhiều instance độc lập cùng hiển thị trong một scene mà không xung đột vật liệu/biến đổi.

---

## 2. Quy trình 5 bước thêm tài nguyên mới

### Bước 1: Tạo thư mục theo ID định danh
Tạo thư mục mới trong `src/gift-library/objects/<asset-id>/`.
Ví dụ: `src/gift-library/objects/paper-plane-01/`.

Cấu trúc thư mục con bắt buộc:
```text
paper-plane-01/
  PaperPlane01.tsx    # Component 3D thuần túy
  geometry.ts         # Thuật toán hình học procedural / geometry (nếu có)
  manifest.ts         # Khai báo AssetManifest
  presets.ts          # DefaultConfig và danh sách Presets mặc định
  index.ts            # Xuất khẩu công khai component và metadata
  README.md           # Tài liệu kỹ thuật chi tiết của mẫu
```

### Bước 2: Khai báo AssetManifest & Presets
Trong `manifest.ts`:
```ts
import { AssetManifest } from '../../types';

export const paperPlaneManifest: AssetManifest = {
  schemaVersion: 1,
  id: 'paper-plane-01',
  name: 'Máy bay giấy mẫu 1',
  version: '0.1.0',
  category: 'Máy bay',
  kind: '3d',
  description: 'Mô hình máy bay giấy gấp cổ điển với đường nếp sắc nét và bề mặt nhám satin.',
  tags: ['máy bay', 'giấy', 'origami', 'thư tình'],
  status: 'review', // Luôn bắt đầu ở trạng thái review
  thumbnail: '/assets/paper-plane-01/thumbnail.png',
  fallback: '/assets/paper-plane-01/fallback.svg',
  source: 'procedural',
  license: 'MIT',
  author: 'DingDong Team',
  dependencies: ['three', '@react-three/fiber'],
  supportedMotions: ['float', 'spin'],
};
```

Trong `presets.ts`:
- Cung cấp `defaultConfig` hợp lệ (tuân thủ `AssetConfig`).
- Cung cấp ít nhất 2–3 `Preset` mang tính thẩm mỹ cao, đánh dấu `isBuiltIn: true`.

### Bước 3: Đăng ký vào Registry
Mở `src/gift-library/registry.ts`:
1. Import manifest và presets.
2. Thêm entry vào `PRODUCT_REGISTRY`:
```ts
export const PRODUCT_REGISTRY: RegistryEntry[] = [
  // ... các mẫu trước
  {
    manifest: paperPlaneManifest,
    loadComponent: () => import('./objects/paper-plane-01/PaperPlane01'),
    defaultConfig: paperPlaneDefaultConfig,
    defaultPresets: paperPlanePresets,
  },
];
```
*Lưu ý:* Bắt buộc dùng Dynamic Import `() => import(...)` để đảm bảo cơ chế Lazy Loading, không tải toàn bộ geometry khi người dùng chỉ duyệt gallery.

### Bước 4: Chuẩn bị tài nguyên hình ảnh (Thumbnail & Fallback)
Thêm vào `public/assets/<asset-id>/`:
- `thumbnail.png` hoặc `thumbnail.svg`: Ảnh chụp/render chính xác từ model thật (không dùng ảnh 3D đẹp từ nguồn khác để che giấu hình dáng thực tế).
- `fallback.svg`: Ảnh vector 2D hiển thị khi WebGL không khả dụng, có nhãn rõ ràng "2D Fallback".

### Bước 5: Kiểm tra và Duyệt (Review Gate)
1. Chạy `npm run typecheck`, `npm run lint`, `npm run test` và `npm run build`.
2. Mở trình duyệt tại xưởng chi tiết:
   - Kiểm tra góc chính diện, góc 45 độ, cạnh bên và mặt sau.
   - Thử nghiệm trên nền sáng, nền tối và ô caro.
   - Thử nghiệm các chuyển động lơ lửng, nhịp tim và tự xoay.
   - Thử nghiệm lưu biến thể mới vào `localStorage`, đổi tên, xuất/nhập JSON.
   - Mở trang "Thử trên thiệp" để xác nhận 2 instance render độc lập.
3. Giữ trạng thái `status: 'review'`. Chỉ chuyển sang `status: 'approved'` khi chủ dự án đã nghiệm thu hình ảnh trực quan.

---

## 3. Quy tắc bảo vệ mẫu đã duyệt (Protection of Approved Assets)

- **Không ghi đè (Never Mutate Approved Models):** Khi một chi tiết đã đạt trạng thái `approved` và được đưa vào sử dụng trong các tấm thiệp, tuyệt đối không chỉnh sửa cấu trúc mesh, material mặc định hoặc API của nó chỉ để phục vụ một tấm thiệp cá biệt.
- **Tạo mẫu mới khi thay đổi lớn:** Nếu cần thay đổi hình dáng đáng kể, hãy tạo mẫu mới (ví dụ: `heart-02`) hoặc nâng version theo chuẩn semver (ví dụ: `0.2.0`) và ghi rõ changelog.
- **Điều chỉnh qua Props:** Khi ghép thiệp, chỉ thay đổi các tham số được công khai trong `AssetConfig` (`color`, `roughness`, `scale`, `rotation`, `motion`).
