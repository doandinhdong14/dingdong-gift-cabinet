# Trái tim mẫu 1 (`heart-01`)

Tài nguyên trang trí 3D chính thức đầu tiên trong thư viện **DingDong Gift**.

---

## 1. Thông tin tổng quan (Metadata)

- **ID:** `heart-01`
- **Tên:** Trái tim mẫu 1
- **Phiên bản:** `0.1.0`
- **Trạng thái:** `review` (Chờ chủ dự án nghiệm thu trực quan)
- **Phương pháp tạo:** Procedural 3D mesh (Toán học Taubin manifold)
- **Loại:** 3D
- **Tác giả:** DingDong Team
- **Giấy phép:** MIT

---

## 2. Hình dáng mong muốn & Tiêu chuẩn đồ họa

- **Thẩm mỹ:** Trái tim 3D màu hồng san hô satin, cảm giác viên kẹo mềm, bề mặt phồng liên tục ở cả mặt trước và sau.
- **Silhouette:** Hai thùy tròn đều, rãnh trên mềm mại và rõ nét, đỉnh dưới thu về một cung bo nhẹ.
- **Kích thước chuẩn hóa:**
  - Chiều cao: Đúng 2.0 đơn vị ($Y \in [-1.0, 1.0]$).
  - Chiều rộng: 2.08 đơn vị ($X \in [-1.04, 1.04]$).
  - Chiều dày (độ phồng): 0.78 đơn vị ($Z \in [-0.39, 0.39]$).
  - Tâm đặt tại gốc tọa độ $(0, 0, 0)$, mặt trước nhìn theo trục $+Z$.
- **Góc xoay mặc định:** X = 5°, Y = -15°, Z = 0° (để thấy rõ độ dày 3D và ánh sáng satin).

---

## 3. Ngân sách đồ họa thực tế (Measured Graphics Budget)

- **Số đỉnh (Vertices):** 4.131 đỉnh
- **Số tam giác (Triangles):** 8.000 tam giác (ngân sách tối đa của spec là 25.000 tam giác)
- **Draw Calls:** 1 draw call trên mỗi instance
- **Texture:** 0 KB (Không sử dụng texture ảnh mạng; 100% shader procedural tiêu chuẩn với PBR lighting)
- **Bộ nhớ GPU ước tính:** ~300 KB VRAM cho BufferGeometry chia sẻ giữa các instance

---

## 4. Giao diện lập trình (API Props)

```tsx
interface Heart01Props {
  color?: string;     // Mã màu HEX (Mặc định: #F46C91)
  roughness?: number; // Độ nhám satin (Mặc định: 0.32, khoảng 0.15 - 0.90)
  metalness?: number; // Độ kim loại (Mặc định: 0.0, khoảng 0.0 - 0.30)
}
```

*Lưu ý:* Chuyển động lơ lửng, nhịp tim và tự xoay được quản lý bên ngoài qua component `MotionRig`.

---

## 5. Các file cần sao chép sang dự án thiệp

1. `src/gift-library/objects/heart-01/` (toàn bộ thư mục này)
2. `src/gift-library/motion/MotionRig.tsx` và `motionMath.ts`
3. `src/gift-library/types.ts`
4. `public/assets/heart-01/` (ảnh thumbnail và fallback vector)

---

## 6. Thư viện phụ thuộc (Dependencies)

```bash
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three
```
