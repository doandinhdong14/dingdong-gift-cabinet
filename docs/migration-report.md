# Báo cáo Chuyển đổi & Nâng cấp Nền tảng (Migration Report)

## 1. Trạng thái Mã nguồn Trước Nâng cấp
- Dự án: `dingdong-gift-cabinet`
- Phiên bản: Giai đoạn B / Stage C / Rose Reveal
- Các mẫu hiện có:
  - `dev-box-fixture`: Khối kỹ thuật kiểm tra pipeline nội bộ.
  - `heart-01`: Trái tim mẫu 1 (Giai đoạn B) - hình khối 3D phồng mềm, bề mặt satin san hô.
  - `love-universe-01`: Vũ trụ lời chúc (Stage C) - cảnh 3D thẻ ảnh bay tuần hoàn trong không gian sao.
  - `rose-reveal-01`: Hoa hồng bung nở chuyển cảnh mở quà.
- Bộ kiểm thử hiện tại: 10 tệp kiểm thử (80 unit tests) đều đạt 100%.

## 2. Các thành phần nền tảng đã nâng cấp
1. **Kiến trúc phân tầng độc lập**:
   - `src/effect-host`: Quản lý bộ sưu tập, preview generic tại `#/effects/:id`, điều khiển runtime, camera rig, auto-controls và bộ quản lý preset cách ly.
   - `src/effect-sdk`: Hợp đồng công khai duy nhất cho các worker, bao gồm validator, đồng hồ animation `useEffectFrame`, bộ giải phóng bộ nhớ `useMediaCleanup`, và motion math.
   - `src/shared-assets`: Các thư viện geometry (trái tim, ngôi sao) và shader tái sử dụng an toàn.
   - `src/effects/`: Không gian riêng biệt dành cho từng package hiệu ứng độc lập.
2. **Cơ chế Tự động Nhận diện (Auto-Discovery)**:
   - Sử dụng Vite glob import (`import.meta.glob('../effects/*/manifest.json')`).
   - Tự động nạp danh mục, thumbnail, và module mà không cần sửa bất kỳ file trung tâm nào (`catalog.ts`, `registry.ts`, `App.tsx` hoặc router).
3. **Bộ công cụ dòng lệnh (CLI Node.js)**:
   - `npm run effects:create`: Tạo khung mã nguồn theo chuẩn từ chối ghi đè.
   - `npm run effects:check`: Kiểm tra tính hợp lệ của manifest, kiểm tra ranh giới import (chặn import chéo) và chạy tests.
   - `npm run effects:scope`: Quét toàn diện các thay đổi committed, staged, unstaged và untracked ngoài phạm vi.
   - `npm run effects:preview`: Khởi động máy chủ xem trước ở cổng cố định.
   - `npm run effects:batch`: Tạo worktree và phân việc tự động cho tối đa 10 agent.
   - `npm run effects:report`: Tổng hợp trạng thái tiến độ cho Điều phối viên.

## 3. Bảo toàn Dữ liệu & Hành vi Hiện tại
- Giữ nguyên toàn bộ các mẫu `heart-01`, `love-universe-01`, `rose-reveal-01` và các route cũ `#/asset/:id`.
- Bộ đếm danh mục trong gallery tính toán chính xác cả mẫu cũ lẫn các package hiệu ứng mới được phát hiện.
- Không thay đổi các dependency trong `package.json` hoặc phá vỡ lockfile.
- 100% các unit test cũ đều tiếp tục vượt qua mà không cần sửa đổi mã kiểm thử.
