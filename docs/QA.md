# Báo cáo Kiểm định Chất lượng (QA Report) — Giai đoạn A

**Dự án:** DingDong Gift — Tủ đồ sáng tạo  
**Mốc triển khai:** Giai đoạn A (Xây dựng tủ đồ & Khung ứng dụng hoàn chỉnh)  
**Thời điểm thực hiện:** 16/11/2026  

---

## 1. Môi trường kiểm thử

| Thành phần | Phiên bản / Môi trường | Ghi chú |
|---|---|---|
| Hệ điều hành | Windows (x64) | Môi trường máy trạm cục bộ |
| Runtime Node.js | v26.13.1 | Node 26 LTS/Current |
| Trình quản lý gói | npm v11.20.0 | |
| Framework chính | React v19.1.0 + TypeScript 5.7 | Kiến trúc component thuần |
| 3D Pipeline | Three.js v0.180.0 + R3F v9.1.2 + Drei v10.0.7 | WebGL Studio Stage |
| Bundler & Test | Vite v6.2.0 + Vitest v3.0.7 + Testing Library | JSDOM & ESM Native |

---

## 2. Kết quả kiểm tra tự động (Automated Verification)

### A. Kiểm tra Typecheck (`npm run typecheck`)
- **Lệnh thực thi:** `tsc --noEmit`
- **Kết quả:** **ĐẠT (PASS)** — 0 lỗi, 0 cảnh báo. Khớp 100% kiểu dữ liệu giữa các module `types.ts`, `registry.ts`, `motionRig.tsx`, `presetStorage.ts`, và `configValidation.ts`.

### B. Kiểm tra Mã nguồn (`npm run lint`)
- **Lệnh thực thi:** `eslint .`
- **Kết quả:** **ĐẠT (PASS)** — 0 lỗi, 0 cảnh báo (đã tinh chỉnh triệt để loại bỏ kiểu `any`).

### C. Bộ kiểm thử tự động (`npm test`)
- **Lệnh thực thi:** `vitest run`
- **Tổng số test suites:** 7/7 suites passed
- **Tổng số ca kiểm thử:** 46/46 tests passed (100%)

| Test Suite | Số ca kiểm thử | Nội dung kiểm tra | Kết quả |
|---|---|---|---|
| `tests/motionMath.test.ts` | 13 | Thuật toán lơ lửng đối xứng, nhịp tim chu kỳ kép lub-dub không tích lũy frame, xoay tròn radian, clamp delta chống nhảy giật khi đổi tab, bảo toàn pose khi tạm dừng. | PASS |
| `tests/configValidation.test.ts` | 10 | Validate AssetConfig, từ chối schemaVersion mới hơn, chặn màu hex sai, chặn số vô hạn (NaN/Infinity), giới hạn file nhập 100 KB, kiểm tra preset name 1-60 ký tự, cảnh báo lệch assetId. | PASS |
| `tests/presetStorage.test.ts` | 6 | Vòng đời preset (Lưu, Sửa tên, Xóa), bảo vệ preset mặc định của hệ thống, khôi phục an toàn khi localStorage bị hỏng JSON mà không xóa đè dữ liệu cũ, danh sách yêu thích. | PASS |
| `tests/registry.test.ts` | 5 | Đảm bảo `PRODUCT_REGISTRY` rỗng trong Giai đoạn A, Khối kiểm tra kỹ thuật (`dev-box-fixture`) có ID duy nhất và manifest hợp lệ, tính số lượng danh mục chuẩn xác không số liệu ảo. | PASS |
| `tests/searchUtils.test.ts` | 5 | Khử dấu tiếng Việt (đ/Đ, dấu thanh), tìm kiếm không phân biệt hoa thường và không dấu theo tên, ID, thẻ phân loại và danh mục. | PASS |
| `tests/codeGeneration.test.ts` | 4 | Sinh JSON cấu hình chuẩn, sinh mã nguồn React Three Fiber JSX sẵn sàng chạy với đúng import thật, sinh đoạn hướng dẫn AI đầy đủ quy ước. | PASS |
| `tests/smoke.test.tsx` | 3 | Khởi tạo trang Gallery với banner Giai đoạn A và trạng thái trống, tương tác trên bảng điều khiển tham số, chuyển đổi tab đoạn mã JSX/JSON/AI. | PASS |

### D. Kiểm tra Đóng gói Production (`npm run build`)
- **Lệnh thực thi:** `tsc -b && vite build`
- **Kết quả:** **ĐẠT (PASS)** — Đóng gói thành công vào thư mục `dist/`, mã nguồn được tách chunk tối ưu (`three-vendor`, `react-vendor`).

---

## 3. Các hạng mục đã được kiểm tra và xác minh

1. **Bộ khung ứng dụng (Shell & Routing):**
   - Header với logo DingDong Gift, chuyển trang qua hash router (`#/`, `#/integration`, `#/guide`, `#/asset/dev-box-fixture`).
   - Deep link hoạt động trực tiếp không cần server rewrite.
2. **Gallery & Bộ lọc:**
   - Bộ sưu tập sản phẩm giữ trạng thái trống rõ ràng, không dùng mock asset để lấp đầy.
   - Banner Giai đoạn A có nút mở thẳng Khối kiểm tra kỹ thuật.
   - Tìm kiếm tiếng Việt có dấu / không dấu hoạt động chính xác.
   - Số lượng tài nguyên hiển thị tính đúng theo registry thực tế.
3. **Sân khấu 3D & Bảng điều khiển (Workshop):**
   - Sân khấu 3D hiển thị khối kỹ thuật chuẩn mực (chiều cao 2.0 đơn vị, tâm tại gốc, mặt trước +Z).
   - Ánh sáng studio 3 điểm dịu nhẹ, đọc rõ khối hộp.
   - Thanh công cụ xem trước: Tạm dừng / Tiếp tục, Bật/tắt tự xoay, Đặt lại góc camera, 3 chế độ nền (Sáng, Tối, Ô caro), chế độ chất lượng (HD / Tiết kiệm).
   - Tách biệt rành mạch giữa **Đặt lại góc nhìn camera** và **Đặt lại mẫu**.
   - Bảng điều khiển 4 tab: Tùy chỉnh tham số thời gian thực, Quản lý biến thể (Lưu, Sửa, Xóa, Nhập/Xuất JSON), Đoạn mã sử dụng (JSX/JSON/AI) và Thông tin kỹ thuật.
4. **Trang "Thử trên thiệp":**
   - Thể hiện đúng trạng thái *Chưa có mẫu* ở Giai đoạn A.
   - Có công tắc bật thử nghiệm với Khối kỹ thuật và hiển thị đồng thời 2 instance độc lập (khác biệt về màu sắc, scale và chuyển động) để kiểm tra pipeline tái sử dụng.
5. **Khả năng chịu lỗi (Resilience):**
   - Bắt lỗi WebGL context lost và fallback sang ảnh vector 2D có nhãn rõ ràng.
   - Bắt lỗi localStorage đầy/bị chặn và chuyển sang bộ nhớ phiên an toàn.
   - Chặn các đoạn mã không an toàn hoặc payload vượt quá 100 KB khi nhập JSON.

---

## 4. Các hạng mục chưa kiểm tra & Giới hạn hiện tại

1. **Chưa tạo Trái tim mẫu 1 (`heart-01`):**
   - Đúng theo phân kỳ của spec: Giai đoạn A chỉ xây dựng tủ đồ và dùng khối kỹ thuật; Trái tim mẫu 1 sẽ được phát triển ở Giai đoạn B.
2. **Chưa đo FPS thực tế trên điện thoại di động vật lý:**
   - Đã kiểm tra responsive trên JSDOM và thiết lập media query theo các mốc 360px, 768px, 1440px.
   - Chưa tiến hành đo đạc FPS hoặc cảm ứng đa điểm (pinch-to-zoom) trên thiết bị di động thật (sẽ tiến hành khi chạy dev server bind host và kiểm tra trực tiếp qua Wi-Fi).
3. **Các tính năng nằm ngoài phạm vi MVP:**
   - Đăng nhập, đồng bộ đám mây, kéo thả dựng thiệp nhiều cảnh (đã được ghi rõ là chưa làm trong mục 3 của spec).
