# Báo cáo Kiểm định Chất lượng (QA Report) — Giai đoạn B

**Dự án:** DingDong Gift — Tủ đồ sáng tạo  
**Mốc triển khai:** GIAI ĐOẠN B: Tạo “Trái tim mẫu 1” (`heart-01`)  
**Thời điểm thực hiện:** 16/11/2026  
**Trạng thái tài nguyên:** `review` (Chờ chủ dự án nghiệm thu trực quan hình ảnh)  

---

## 1. Môi trường kiểm thử

| Thành phần | Phiên bản / Môi trường | Ghi chú |
|---|---|---|
| Hệ điều hành | Windows (x64) | Môi trường máy trạm cục bộ |
| Runtime Node.js | v26.13.1 | Node 26 LTS/Current |
| Trình quản lý gói | npm v11.20.0 | |
| Framework chính | React v19.1.0 + TypeScript 5.7 | Kiến trúc component thuần túy |
| 3D Pipeline | Three.js v0.180.0 + R3F v9.1.2 + Drei v10.0.7 | WebGL Studio Stage |
| Bundler & Test | Vite v6.2.0 + Vitest v3.0.7 + Testing Library | JSDOM & ESM Native |

---

## 2. Kết quả kiểm tra tự động (Automated Verification)

### A. Kiểm tra Typecheck (`npm run typecheck`)
- **Lệnh thực thi:** `tsc --noEmit`
- **Kết quả:** **ĐẠT (PASS)** — 0 lỗi, 0 cảnh báo. Toàn bộ types của `Heart01`, `createHeartGeometry`, presets và các trang đều đồng bộ 100%.

### B. Kiểm tra Mã nguồn (`npm run lint`)
- **Lệnh thực thi:** `eslint .`
- **Kết quả:** **ĐẠT (PASS)** — 0 lỗi, 0 cảnh báo.

### C. Bộ kiểm thử tự động (`npm test`)
- **Lệnh thực thi:** `vitest run`
- **Tổng số test suites:** 8/8 suites passed
- **Tổng số ca kiểm thử:** 51/51 tests passed (100%)

| Test Suite | Số ca | Nội dung kiểm tra | Kết quả |
|---|---|---|---|
| `tests/heartGeometry.test.ts` | 5 | Kích thước hình học chuẩn theo spec: Chiều cao 2.0 (Y: -1 đến +1), Rộng 2.08 (2.0–2.2), Dày 0.78 (0.65–0.90), đối xứng qua trục YZ, ngân sách 8.000 tam giác (ngân sách < 25.000), pháp tuyến outward-facing chuẩn xác, caching singleton geometry. | PASS |
| `tests/motionMath.test.ts` | 13 | Thuật toán lơ lửng đối xứng, nhịp tim chu kỳ kép lub-dub không tích lũy scale, xoay tròn radian, clamp delta chống nhảy giật khi đổi tab, bảo toàn pose khi tạm dừng. | PASS |
| `tests/configValidation.test.ts` | 10 | Validate AssetConfig, từ chối schemaVersion mới hơn, chặn màu hex sai, chặn số vô hạn (NaN/Infinity), giới hạn file nhập 100 KB, kiểm tra preset name 1-60 ký tự, cảnh báo lệch assetId. | PASS |
| `tests/presetStorage.test.ts` | 6 | Vòng đời preset (Lưu, Sửa tên, Xóa), bảo vệ preset mặc định của hệ thống, khôi phục an toàn khi localStorage bị hỏng JSON mà không xóa đè dữ liệu cũ, danh sách yêu thích. | PASS |
| `tests/registry.test.ts` | 5 | Đăng ký chính thức `heart-01` trong `PRODUCT_REGISTRY`, trạng thái `review`, 3 preset màu sắc mặc định (Hồng dịu, Đỏ yêu thương, Tím mộng mơ), tính số lượng danh mục chuẩn xác. | PASS |
| `tests/searchUtils.test.ts` | 5 | Khử dấu tiếng Việt (đ/Đ, dấu thanh), tìm kiếm không phân biệt hoa thường và không dấu theo tên, ID, thẻ phân loại và danh mục. | PASS |
| `tests/codeGeneration.test.ts` | 4 | Sinh JSON cấu hình chuẩn, sinh mã nguồn React Three Fiber JSX với `Heart01` và `Canvas` sẵn sàng chạy, sinh đoạn hướng dẫn AI đầy đủ quy ước. | PASS |
| `tests/smoke.test.tsx` | 3 | Khởi tạo trang Gallery với thẻ `heart-01` hiển thị trạng thái "Chờ duyệt", tương tác trên bảng điều khiển tham số, chuyển đổi tab đoạn mã JSX/JSON/AI của Heart01. | PASS |

### D. Kiểm tra Đóng gói Production (`npm run build`)
- **Lệnh thực thi:** `tsc -b && vite build`
- **Kết quả:** **ĐẠT (PASS)** — Đóng gói thành công vào thư mục `dist/`, mã nguồn được tách chunk tối ưu (`three-vendor`, `DevBox`, `index`).

---

## 3. Checklist nghiệm thu hình học 3D (3D Visual Verification)

Theo yêu cầu của mục 10 và 14 trong `spec.md`, các tiêu chí hình ảnh của `heart-01` đã được đo đạc và thiết lập như sau:

| Tiêu chí | Đặc tả yêu cầu | Thực tế đạt được | Đánh giá |
|---|---|---|---|
| Hình dáng tổng thể | Trái tim 3D hồng san hô satin, cảm giác viên kẹo mềm, phồng liên tục | Dựng bằng phương trình đại số Taubin manifold mượt mà, không dùng hình hộp/cầu chắp vá | ĐẠT |
| Chiều cao chuẩn | 2.0 đơn vị ($Y \in [-1.0, 1.0]$) | Thực đo: **2.000** đơn vị, tâm tại gốc $(0, 0, 0)$ | ĐẠT |
| Chiều rộng | Khoảng 2.0 – 2.2 đơn vị | Thực đo: **2.078** đơn vị | ĐẠT |
| Chiều dày (độ phồng) | Khoảng 0.65 – 0.90 đơn vị | Thực đo: **0.787** đơn vị | ĐẠT |
| Hai thùy trên | Tròn đều, phồng mềm | Phồng cong đều ở cả mặt trước và mặt sau | ĐẠT |
| Rãnh trên (Cleft) | Rõ và mềm, không gãy nhọn | Rãnh uốn lượn mềm mại sâu 0.21 đơn vị | ĐẠT |
| Đỉnh dưới (Tip) | Thu về đỉnh bo nhẹ, không gai nhọn | Bo tròn êm ái tại $(0, -1.0, 0)$ | ĐẠT |
| Mặt cắt ngang & Seam | Không có khe hở, lỗ thủng, seam | Mesh kín 100% (Watertight Manifold), pháp tuyến cực được làm mượt | ĐẠT |
| Ngân sách đồ họa | Dưới 25.000 tam giác, 0 texture mạng | **8.000** tam giác, 0 KB texture mạng (100% procedural PBR) | ĐẠT |
| Chuyển động độc lập | Lơ lửng, nhịp tim 2 nhịp (lub-dub), tự xoay | Hoạt động trơn tru qua `MotionRig`, không tích lũy frame | ĐẠT |
| 2 Instance độc lập | Kiểm tra trên thiệp với 2 màu/scale/motion khác nhau | Đã tích hợp trên trang "Thử trên thiệp" (Instance 1: Hồng san hô; Instance 2: Tím mộng mơ scale 0.52x, nhịp tim 84 BPM độc lập) | ĐẠT |

---

## 4. Các hạng mục chưa kiểm tra & Giới hạn hiện tại

1. **Duyệt hình trực quan cuối cùng (Visual Sign-off):**
   - Mẫu hiện đang ở trạng thái `review` (đúng theo phân kỳ của spec). Mẫu chỉ chuyển sang `approved` sau khi chủ dự án mở giao diện xoay 360 độ và duyệt hình.
2. **Hiệu năng FPS trên thiết bị di động vật lý:**
   - Đã cấu hình responsive CSS tại các mốc 360px, 768px, 1440px.
   - Chưa tiến hành đo đạc FPS bằng công cụ profiling trên điện thoại thật (cần người dùng kết nối qua mạng Wi-Fi `http://192.168.x.x:5173/`).

---

## 5. Báo cáo Kiểm định Chất lượng — Mẫu "Vũ trụ lời chúc" (`love-universe-01`)

**Mốc triển khai:** Cải tiến và đồng bộ hóa mẫu cảnh “Vũ trụ lời chúc” — ID `love-universe-01` bám sát VIDEO THAM CHIẾU GỐC (`chrome_cMXJXTGrhn.mp4`), đáp ứng toàn bộ các yêu cầu đợt 2 (Chữ phát sáng chỉnh được, Trái tim 3D khối thật, Chuyển động trôi xuống liên tục, Vật thể trang trí 3D bổ sung).  
**Trạng thái tài nguyên:** `review` (Đã hoàn thiện hiệu chỉnh và xác minh tự động, sẵn sàng để chủ dự án duyệt hình trực quan)  

### A. Kết quả kiểm tra tự động
- **Typecheck (`npm run typecheck`):** **PASS** (0 errors).
- **Test Suites (`npm test`):** **PASS 9/9 suites, 64/64 tests (100%)**.
  - `tests/loveUniverse.test.ts` (10 tests): PRNG Mulberry32 determinism, phân bổ 3 lớp (near/mid/far), kiểm định hình học khối đặc tim 3D (độ dày ~37.5% bề rộng), kiểm định ngôi sao 3D 20 tam giác kín, kiểm định hàm cuốn trôi liên tục `wrapY`, xác thực schema AssetConfig & presets, IndexedDB & in-memory fallback CRUD.
  - `tests/codeGeneration.test.ts`: JSX generation cho LoveUniverse01 & prompt AI.
  - `tests/registry.test.ts`: Đăng ký `love-universe-01` trong `PRODUCT_REGISTRY`.
- **Production Build (`npm run build`):** **PASS**. Bundle chia chunk sạch đẹp (`three-vendor`, `react-vendor`, `index`).

### B. Bảng đối chiếu chi tiết với video tham chiếu gốc & Yêu cầu đợt 2
| Hạng mục | Yêu cầu kiểm định | Thực tế triển khai trên `love-universe-01` | Đánh giá |
|---|---|---|---|
| **1. Ánh sáng chữ (Glow Luminous)** | Lõi chữ vàng kem gần trắng rõ nét tiếng Việt. Quầng sáng vàng mềm lan tỏa. Glow 0 / 1 / 3 thấy khác biệt rõ. Cường độ = 0 hết quầng sáng nhưng chữ vẫn đọc rõ. Không viền texture/clipping. Ảnh không bị cháy sáng. | Thiết kế cấu trúc dual-layer mesh: Layer Halo AdditiveBlending (phát quang thuần túy, 0 background clipping) + Layer Core NormalBlending (chữ trắng nét). Multi-pass canvas texture với padding 96px H x 52px V. Khi glow = 0, layer halo biến mất hoàn toàn (`visible = false`). Ảnh dùng normal blending riêng biệt nên không bị cháy sáng. | **ĐẠT** |
| **2. Trái tim 3D thật (Khối đặc phồng)** | Bỏ tim dẹt/sprite. Khối 3D phồng 2 mặt trước sau, 2 thùy mềm, rãnh trên rõ, đỉnh dưới bo nhẹ. Nhìn nghiêng 90° vẫn thấy rõ độ dày (30-45% chiều rộng). Vật liệu satin PBR có highlight và vùng tối. Xoay 3D nhẹ. | Tái sử dụng hình học Taubin algebraic manifold từ `heart-01` (chiều cao 2.0, rộng 2.08, dày 0.787 ~ 37.5% chiều rộng, 8.000 tam giác kín). Dùng `MeshStandardMaterial` satin roughness 0.35, clearcoat và emissive nhẹ 0.12. Tumbling 3D đa trục mượt mà. Đạt chuẩn khi nhìn chính diện, 45° và 90°. | **ĐẠT** |
| **3. Chuyển động trôi xuống liên tục** | Toàn bộ chữ + ảnh + tim + vật thể trôi xuống theo trục Y thế giới. Tích lũy delta time, đổi tốc độ không giật nhảy. Tạm dừng/tiếp tục giữ nguyên pose. Vòng lặp cuộn trơn tru qua buffer zone 2.0u ngoài khung nhìn, không biến mất đồng loạt. | Triển khai hàm `wrapY(baseY, driftOffset, cloudHeight)` với buffer 2.0 units. Mỗi element tự tích lũy quãng đường `driftOffset += speed * safeDelta` trong Three.js render loop. Đổi vận tốc (0–2 u/s) mượt mà không nhảy vị trí. Từng phần tử cuộn riêng lẻ êm ái khi ra khỏi cạnh dưới và tái xuất hiện ở cạnh trên. | **ĐẠT** |
| **4. Vật thể trang trí 3D** | Mục “Vật thể trang trí”: danh sách, nút thêm, chọn loại, số lượng, màu, kích thước, tốc độ xoay, bật/tắt/xóa. Hỗ trợ Ngôi sao 3D bo cạnh (`star3d`), Hộp quà 3D (`giftbox`), Trái tim 3D (`heart`). | Tạo module `decorationGeometries.ts` sinh hình học sao 3D 5 cánh 20 mặt và hộp quà 3D kèm nắp và ruy-băng. Component `DecorationsField` kết xuất bằng `InstancedMesh` (1 draw call/nhóm). Giao diện thêm/bật/tắt/xóa hoàn chỉnh trong `UniverseParameterPanel`. | **ĐẠT** |
| **5. Cân bằng tỷ lệ Chữ / Ảnh** | Ảnh nhỏ lại và thoáng hơn, chữ phát sáng làm chủ đạo. Phân tầng gần-trung-xa rõ rệt. Thêm điều khiển "Kích thước ảnh" và "Mật độ chữ". | Giảm `photoScaleFactor` xuống 0.72x (tỉ lệ 3:4 gọn gàng), số ảnh mặc định 10; tăng `textScaleFactor` lên 1.15x (near text 1.45-1.85x). Đẩy ảnh gần ra rìa biên ($|X| > 1.55$), mở rộng hành lang trung tâm để chữ phát sáng tỏa sáng rực rỡ như video. | **ĐẠT** |
| **6. Lưu trữ cấu hình & Preset** | Tất cả tham số mới lưu được trong preset và localStorage. Schema mở rộng backward-compatible với preset cũ. | Cập nhật `UniverseConfig` trong `types.ts`, `configValidation.ts`, `presets.ts`. Preset cũ thiếu trường mới tự động nạp giá trị mặc định, bảo vệ 100% dữ liệu ảnh và câu chúc. | **ĐẠT** |
