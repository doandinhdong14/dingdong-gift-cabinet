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

**Mốc triển khai:** Cải tiến và đồng bộ hóa mẫu cảnh “Vũ trụ lời chúc” — ID `love-universe-01` bám sát VIDEO THAM CHIẾU GỐC (`chrome_cMXJXTGrhn.mp4`)  
**Trạng thái tài nguyên:** `review` (Đã hoàn thiện hiệu chỉnh và xác minh tự động, sẵn sàng để chủ dự án duyệt hình trực quan)  

### A. Kết quả kiểm tra tự động
- **Typecheck (`npm run typecheck`):** **PASS** (0 errors).
- **Test Suites (`npm test`):** **PASS 9/9 suites, 61/61 tests (100%)**.
  - `tests/loveUniverse.test.ts` (7 tests): PRNG Mulberry32 determinism, phân bổ 3 lớp (near/mid/far), xác thực schema AssetConfig & presets, IndexedDB & in-memory fallback CRUD.
  - `tests/codeGeneration.test.ts`: JSX generation cho LoveUniverse01 & prompt AI.
  - `tests/registry.test.ts`: Đăng ký `love-universe-01` trong `PRODUCT_REGISTRY`.
- **Production Build (`npm run build`):** **PASS**. Bundle chia chunk sạch đẹp (`three-vendor`, `react-vendor`, `index`).

### B. Bảng đối chiếu chi tiết với video tham chiếu gốc (`chrome_cMXJXTGrhn.mp4`)
| Hạng mục | Video chuẩn gốc (Chuẩn hình ảnh) | Thực tế triển khai trên `love-universe-01` | Đánh giá |
|---|---|---|---|
| **Nền không gian** | Xanh navy rất đậm (gần `#061525`), không đen kịt, không tinh vân rực màu hay chòm sao vẽ nét. | Nền vòm cầu màu `#061525` (`.bg-mode-dark` đồng bộ `#061525`), không gian sâu thẳm dịu mắt. | ĐẠT |
| **Hệ thống sao** | Vô số chấm nhỏ mờ làm nền + một số ít chấm lớn/bokeh sáng mềm trắng ấm/vàng nhạt (`#FFFFFF`, `#FFFDF0`, `#FFE8A3`). | 90% hạt sao nhỏ li ti tạo chiều sâu nền + 10% hạt bokeh phát sáng mềm ấm, 1 draw call batching, 0 light sources thừa. | ĐẠT |
| **Kiểu dáng chữ & Font** | Font nét mảnh/regular bo tròn nhẹ (Comfortaa/Quicksand), hỗ trợ dấu tiếng Việt đầy đủ, không dùng font nét dày/bold thô. | Google Fonts `Comfortaa` regular 400 kết hợp fallback `Quicksand` & `Be Vietnam Pro`, lắng nghe `document.fonts.ready` để rasterize chuẩn xác. | ĐẠT |
| **Màu sắc & Quầng sáng chữ** | Lõi chữ màu trắng tinh/vàng kem gần trắng; quầng sáng vàng hổ phách mềm mại xung quanh; nét chữ sắc bén không nhòe. | Multi-pass glow rasterization: Pass 1 quầng sáng vàng hổ phách rộng (`rgba(255, 185, 30, 0.85)`), Pass 2 bloom vàng rực rỡ, Pass 3 chữ trắng core `#FFFFFF` không blur. Padding 64px H, 40px V chống cắt viền. | ĐẠT |
| **Phân lớp cỡ chữ & Bố cục** | Cụm vũ trụ kéo dài theo phương thẳng đứng. Cỡ chữ biểu kiến phân tầng rõ rệt: vài câu gần lớn framing rìa khung hình, nhiều câu vừa và câu xa nhỏ. Lặp lại câu ngắn nhưng không chồng lấp đè chữ. | Stratified Y generation với `scaleBase`: near (1.35–1.70x), mid (0.78–1.05x), far (0.40–0.60x). Thuật toán kiểm tra va chạm 3D kết hợp hình chiếu 2D (screen projection check) loại bỏ hoàn toàn đè chữ ở góc nhìn ban đầu. | ĐẠT |
| **Mặt phẳng ảnh** | Ảnh chữ nhật 3:4 hiển thị trực tiếp trên mặt phẳng 3D, borderless không viền Polaroid, không caption, không icon mạng xã hội, không làm cháy trắng ảnh. | Mặt phẳng ảnh 3D `0.90 x 1.20` borderless (tỉ lệ 3:4 portrait), không khung viền Polaroid, giữ nguyên màu sắc gốc, dùng 6 ảnh mẫu vector nghệ thuật trung tính cho tới khi người dùng tải ảnh thật. | ĐẠT |
| **Trái tim điểm nhấn** | Trái tim silhouette phẳng màu đỏ cam san hô tươi sáng (`#FF3824` / `#FF453A`), quầng sáng đỏ nhẹ, không bóng nhựa, không lấn át chữ. | Mesh phẳng `PlaneGeometry(0.85, 0.85)` + Canvas texture silhouette tim đỏ cam san hô phát sáng mềm, dùng `MeshBasicMaterial` và `InstancedMesh` (1 draw call cho 22 tim), không bóng lộn. | ĐẠT |
| **Góc nghiêng 3D & Chống lật ngược** | Khi xoay thấy rõ độ nghiêng 3D và các lớp che phủ lẫn nhau. Không billboard xoay toàn bộ theo camera. Mặt sau không hiển thị chữ ngược. | Các mặt phẳng có hướng tương đối đồng nhất phía trước với độ lệch tự nhiên $\pm 8^\circ$ yaw và $\pm 4.5^\circ$ pitch. Custom shader `gl_FrontFacing ? vUv : vec2(1.0 - vUv.x, vUv.y)` tự động lật UV X mặt sau, chữ luôn đọc xuôi từ cả hai chiều. | ĐẠT |
| **Tương tác & Chuyển động** | Mở đầu với nút "Chạm để mở vũ trụ", chuyển động bung nở êm ái, xoay tự động rất chậm (1.5°/s), kéo vuốt damping 0.05 mượt mà, zoom có giới hạn, nút đặt lại góc nhìn chuẩn. | Tách biệt chuyển động camera và chuyển động vật thể, OrbitControls damping 0.05, minDistance 3.0 / maxDistance 16.0, nút "Góc chuẩn", hỗ trợ Pause và Giảm chuyển động. | ĐẠT |
| **Tùy biến & Lưu trữ** | Nhập nhiều câu chúc, chọn ảnh máy tính lưu IndexedDB, chỉnh số lượng/kích thước/tốc độ/glow/seed, mức chất lượng di động. | Bảng điều khiển `UniverseParameterPanel` đầy đủ, lưu trữ ảnh qua `universeImageStorage.ts` (IndexedDB, không base64 localStorage, có nút xóa), hỗ trợ Responsive Mobile. | ĐẠT |
