# Kho Tài nguyên Dùng chung (Shared Assets)

Tài liệu liệt kê danh sách các thành phần đồ họa, thuật toán toán học và shader dùng chung được phép import từ `../../shared-assets`.

## 1. Nguyên tắc
- Worker chỉ được phép đọc các export có trong baseline.
- Tuyệt đối không import chéo từ thư mục của package hiệu ứng khác (`src/effects/<other>`).
- Không tự tiện sửa mã nguồn trong `src/shared-assets/` giữa đợt làm việc của 10 agent.

## 2. Danh mục Geometries đã duyệt
### `createHeartGeometry()` / `getHeartGeometry()`
- **Mô tả**: Tạo hình khối Trái tim 3D phồng mềm, liền khối, chuẩn hóa chiều cao 2 đơn vị.
- **Nguồn gốc**: `src/gift-library/objects/heart-01/geometry.ts`
- **Cách dùng**:
```typescript
import { createHeartGeometry } from '../../shared-assets';
const geo = useMemo(() => createHeartGeometry(), []);
```

### `createStar3DGeometry()`
- **Mô tả**: Tạo ngôi sao 5 cánh 3D vát mép sắc nét, kín nước (watertight).
- **Nguồn gốc**: `src/gift-library/objects/love-universe-01/decorations/decorationGeometries.ts`

## 3. Thuật toán Vật lý & Chuyển động (Motion Math)
### `clampDelta(dt, maxDelta)`
- Giới hạn delta time để tránh bước nhảy lớn khi người dùng khôi phục tab từ nền.

### `calculateFloatOffset(time, amplitude, speed)`
- Chuyển động bập bênh bồng bềnh dọc trục Y, đối xứng quanh gốc tọa độ.

### `calculateSpinRotation(time, speedDegPerSecond)`
- Xoay tròn đều mượt mà theo góc độ mỗi giây.

### `calculateHeartbeatScale(time, strength, bpm)`
- Nhịp đập phồng xẹp tự nhiên gồm 2 xung liên tiếp (lub-dub).

### `wrapY(baseY, driftOffset, cloudHeight, buffer)`
- Cuộn vị trí dọc tuần hoàn, giữ mật độ hạt đồng đều trong không gian.

## 4. Shaders dùng chung
### `flipUvVertexShader` & `flipUvFragmentShader`
- Shader hiển thị 2 mặt độc lập của thẻ ảnh / thiệp mỏng trong không gian 3D.
