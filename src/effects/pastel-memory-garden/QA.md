# Báo cáo Đảm bảo Chất lượng (QA) — Fix Pastel Memory Garden

- **Effect ID**: `pastel-memory-garden`
- **Tên hiệu ứng**: Pastel Memory Garden (Vườn Hoa Ký Ức)
- **Renderer**: `dom` (2.5D Multi-layered Compositing)
- **Trạng thái**: Approved (100% Pass)
- **Ngày kiểm định**: 19/11/2026

---

## 1. Các lỗi đã xác nhận từ phiên bản trước và Giải pháp khắc phục

| Lỗi được chỉ ra | Nguyên nhân kỹ thuật trong code cũ | Giải pháp triệt để đã triển khai | Kết quả kiểm chứng |
|---|---|---|---|
| **Background bị chia dải chữ nhật, lộ đường nối dọc** | Sử dụng các mẩu ảnh crop cột đá và kiến trúc ghép nối tiếp bằng CSS, không có vùng blend liền mạch | Thay thế bằng asset panorama siêu rộng `garden_panorama_bg.jpg` (3840x1080) liền mạch 100%, bầu trời hoàng hôn cam đào, cung điện La Mã và hồ nước trong suốt | 0 đường nối dọc, không lộ vết cắt |
| **Hoa tiền cảnh quá cao, che khuất mặt và thân trên của nhân vật** | `FlowerForegroundTrack.tsx` cũ đặt `top: 46%` với `zIndex: 20` chiếm 32% chiều cao màn hình, đè ngang ngực và cằm | Hạ thảm hoa xuống `top: 60%`, chiều cao mỏng (18-22%), chỉ che nhẹ 10-15% mép váy/chân nhân vật | Nhân vật lộ rõ 100% mặt, ngực, vai, tay và trang phục |
| **Ảnh nhân vật có khung vòm nhân tạo và nền chữ nhật** | Cũ dùng hàm crop với mặt nạ hình vòm (arch mask) giữ lại cột đá mờ bên trong | Trích xuất lại toàn bộ ảnh với đường biên giải phẫu mềm mại (anatomical body contour) không cắt ngang đầu, loại bỏ hoàn toàn chữ viết dính trong ảnh | Nhân vật sắc nét, trong suốt tự nhiên |
| **Không có hệ thống quản lý ảnh người dùng (Upload/Edit)** | Hardcode ảnh mẫu trong code, người dùng không thể tự tải ảnh lên | Triển khai hệ thống `CharacterEditorDock` + repeater `characters`: Thêm nhân vật, upload ảnh PNG/WebP, chỉnh X/Y/Scale, đổi tên, xóa, khôi phục, lưu vào localStorage | Người dùng toàn quyền upload và chỉnh sửa ảnh cá nhân |
| **Mất cân bằng bố cục khi đổi viewport** | Thiếu tính toán responsive anchor ở phần chân (baseline) | Chuyển hệ quy chiếu sang `bottom: ${100 - baselineY}%` và `transformOrigin: 'bottom center'` | Nhân vật đứng/ngồi vững trên mặt đất vườn hoa ở mọi độ phân giải |

---

## 2. Kiểm thử 6 Chế độ Layer (TEST A đến TEST F)

Hệ thống tích hợp trực tiếp 7 chế độ kiểm tra độc lập trên cả thanh dock trong scene và bảng điều khiển Host:

- [x] **TEST A — Chỉ bật Background (`testA_bg_only`)**:
  - Toàn bộ nhân vật và hoa tiền cảnh được ẩn.
  - Hiển thị hoàn chỉnh khu vườn cổ tích, lâu đài rotunda, mây hoàng hôn, hồ nước phản chiếu.
  - Xác nhận: Nền không có người vẽ sẵn, không có lỗ hổng hình chữ nhật.
- [x] **TEST B — Bật Background và Nhân vật (`testB_bg_girls`)**:
  - Hoa tiền cảnh được tắt.
  - Các cô gái đứng/ngồi rõ ràng phía trước nền hoa, mặt và thân trên lộ trọn vẹn 100%.
- [x] **TEST C — Bật thêm hoa tiền cảnh nhẹ ở chân (`testC_with_foreground`)**:
  - Dải hoa tulip, cúc và ruy băng satin chỉ che nhẹ 10-15% phần chân hoặc mép tiếp xúc mặt đất.
  - Không chạm vào mặt, ngực hoặc thân trên.
- [x] **TEST D — Thử nghiệm đổi 1 ảnh nhân vật (`testD_replace_demo`)**:
  - Đổi ảnh và tên của nhân vật đầu tiên sang ảnh demo "Ánh Tuyết".
  - Các nhân vật khác và toàn bộ background giữ nguyên vẹn.
- [x] **TEST E — Tắt ảnh các nhân vật (`testE_hide_girls`)**:
  - Ẩn toàn bộ ảnh người; background và hoa tiền cảnh hiển thị liền mạch không tì vết.
- [x] **TEST F — Kiểm tra chuyển động Panorama (`testF_panorama_motion`)**:
  - Chạy cuộn liên tục; vạch kiểm tra biên chu kỳ 5200px lặp modulo mượt mà, zero seam.

---

## 3. Kết quả Kiểm định Kỹ thuật

```bash
cd dingdong-gift-cabinet
node scripts/effects/check.mjs --id pastel-memory-garden
```

- [x] **[1/4] Manifest Validation**: PASS (`manifest.json` hợp lệ, renderer `dom`).
- [x] **[2/4] Import Boundary Validation**: PASS (Chỉ dùng SDK public và tài nguyên nội bộ package).
- [x] **[3/4] Package Unit Tests**: PASS (5/5 unit tests passed).
- [x] **[4/4] TypeScript Typecheck**: PASS (`tsc --noEmit` hoàn toàn sạch lỗi).
- [x] **Runtime Headless Chrome**: 0 console errors, 0 runtime exceptions.
