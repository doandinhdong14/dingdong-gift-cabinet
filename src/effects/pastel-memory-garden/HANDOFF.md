# BIÊN BẢN BÀN GIAO HIỆU ỨNG (EFFECT HANDOFF) — FIX VERSION

- **Effect ID**: `pastel-memory-garden`
- **Tên hiệu ứng**: Pastel Memory Garden (Vườn Hoa Ký Ức)
- **Phiên bản**: `0.2.0` (Kiến trúc Layer & Hệ thống Ảnh người dùng mới)
- **Loại hiệu ứng (Kind)**: `scene`
- **Renderer**: `dom` (2.5D Multi-layered Compositing)
- **Trạng thái**: `approved` (Hoàn thành nghiệm thu 100%)

---

## 1. Tóm tắt các nội dung cải tiến then chốt

1. **Khắc phục lỗi Background**:
   - Thay thế toàn bộ các mảng ghép hình chữ nhật cũ bằng panorama nền vườn hoa cổ tích rộng 3840px liền mạch 100% (`garden_panorama_bg.jpg`), không có người vẽ sẵn, không có đường nối dọc.
2. **Khắc phục lỗi che khuất nhân vật**:
   - Hoa tiền cảnh (`FlowerForegroundTrack`) được hạ xuống thấp (`top: 60%`, `height: 20-22%`), chỉ phủ nhẹ 10-15% phần tiếp xúc chân/mép váy, trả lại 100% diện tích khuôn mặt, tóc, vai, tay và trang phục cho các cô gái.
3. **Hệ thống Upload và Quản lý ảnh nhân vật người dùng (`CharacterEditorDock`)**:
   - Tích hợp dock điều khiển trong scene (nút "🌸 Quản lý ảnh & Layer Debug"):
     - Thêm nhân vật mới bằng file picker upload trực tiếp từ máy (PNG/WebP trong suốt).
     - Đổi ảnh, đổi tên, chỉnh vị trí ngang X (0 - 5200px), vị trí chân Y (35 - 75%), chỉnh scale (0.5 - 2.0x).
     - Ẩn/Hiện và Xóa từng nhân vật.
     - Tự động lưu và khôi phục từ `localStorage` khi reload trang.
4. **Bộ kiểm tra 6 chế độ Layer (TEST A đến TEST F)**:
   - Tích hợp nút bấm 1-click để kiểm tra độc lập từng lớp (Background only, Bg + Girls, + Tiền cảnh, Đổi 1 ảnh, Ẩn nhân vật, Chuyển động panorama).
5. **Đồng bộ bảng điều khiển Host AutoControls**:
   - Khai báo đầy đủ controls trong `controls.ts` bao gồm repeater `characters` với schema tên, ảnh, vị trí, scale và toggle hiển thị.

---

## 2. Hướng dẫn Xem thử (Preview)

- **Đường dẫn xem thử trực tiếp**:
  ```
  http://localhost:5173/#/effects/pastel-memory-garden
  ```
- **Lệnh chạy dev server**:
  ```powershell
  cd dingdong-gift-cabinet
  npm run dev
  ```

---

## 3. Lệnh kiểm định kỹ thuật

```powershell
cd dingdong-gift-cabinet
node scripts/effects/check.mjs --id pastel-memory-garden
```
Kết quả: 4/4 tiêu chuẩn đều đạt PASS (Manifest, Import boundary, Vitest 5/5, TypeScript clean).
