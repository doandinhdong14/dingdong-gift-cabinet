# BÁO CÁO KIỂM ĐỊNH CHẤT LƯỢNG (QA REPORT) - BẢN CẢI TIẾN HẠT MỊN & ĐẾ 10 TẦNG

EFFECT ID: `particle-heart-text-vortex`
NGÀY KIỂM ĐỊNH: 2026-11-19
TRẠNG THÁI: PASS TOÀN BỘ CÁC TIÊU CHÍ

## 1. NGUYÊN NHÂN LỖI TRONG BẢN CŨ (`chrome_DmAF25Awv1.mp4`) & CÁCH KHẮC PHỤC TRIỆT ĐỂ

### A. Vấn đề trái tim "lông / gai sáng trắng" & "hai tâm xoáy tối (hai con mắt)"
- **Nguyên nhân**:
  Ở phiên bản trước, việc dùng `THREE.LineSegments` kết hợp với thuật toán hướng vector toả từ 2 tâm múi tròn đã sinh ra các đoạn thẳng kéo dài dạng gai nhọn chĩa ra ngoài. Hai điểm gốc toả tia bị rút cạn hạt nên tạo thành hai hốc đen tròn ("hai con mắt"). Độ sáng tích lũy của các đoạn tia đè lên nhau gây cháy trắng toàn bộ mặt tim.
- **Khắc phục**:
  1. Loại bỏ 100% `LineSegments`, loại bỏ vector kéo dài và các vệt gai xuyên tâm.
  2. Chuyển sang dựng bằng **hạt dạng chấm nhỏ, gần tròn (`THREE.Points`)** với texture tròn mờ Gaussian mềm mại (kích thước lõi ~1–2 CSS pixel ở viewport 536×750).
  3. Lấy mẫu thể tích 3D bằng phương trình Taubin Heart với thuật toán Rejection Sampling: Phân bố đồng đều trên toàn bộ khối tim, triệt tiêu hoàn toàn 2 hốc đen.
  4. 70% hạt nằm gần bề mặt định hình đường bao cong tròn mềm mại; 30% hạt phân bố thưa trong lòng tim, **giữ các khe tối giữa các hạt để thấy cấu trúc xuyên thấu**.
  5. Màu sắc: Hồng sen (`#ff2d7a`) và hồng phấn (`#f472b6`) là chủ đạo, trắng chỉ điểm xuyết 8% lấp lánh nhẹ nhàng, không cháy trắng.
  6. Chuyển động: Hạt dao động vi mô cục bộ bằng hàm điều hoà trơn theo thời gian (không random lại toạ độ mỗi frame), kết hợp nhịp phồng-thu rất nhẹ (~2% biên độ, chu kỳ ~3 giây).

### B. Vấn đề đế chữ mỏng manh, khoảng cách quá lớn
- **Nguyên nhân**:
  Chỉ có 5 vòng đặt thưa thớt, khoảng cách giữa các vòng quá xa khiến đĩa bị rỗng và thiếu chiều sâu.
- **Khắc phục**:
  1. Tăng lên **10 vòng quỹ đạo đồng tâm** ($R = 1.55$ đến $0.36$), khoảng cách giữa các vòng thu hẹp (~0.13) tạo thành một đĩa xoáy dày dặn, liên tục.
  2. Thiết kế chênh cao theo hình phễu/đĩa trũng (concave dish): Các vòng trong trũng dần xuống ($Y \in [-1.35, -1.43]$) tạo chiều sâu 3D rõ nét trong phối cảnh nghiêng ~25°.
  3. Tỷ lệ chữ 1:1 chuẩn xác trên từng vòng, font tiếng Việt rõ dấu, viền phát quang hồng đậm xen kẽ emoji `💕`, `💖`, `💛`.
  4. Vùng tâm đĩa bổ sung xoáy bụi sao và ký tự nhỏ quay tốc độ cao hơn.

### C. Luồng ký tự kết nối
- Tản nhẹ từ chóp tim xuống tâm đĩa, độ rộng chiếm 18–24% chiều rộng tim (không thành ống cứng).
- Luồng ký tự và stardust rơi nhào lộn liên tục, mượt mà theo chu kỳ fade-in/fade-out, không teleport hay đứt đoạn.

### D. Căn khung và chuyển động khi camera đứng yên
- Camera được cố định ở góc chính diện trong bài kiểm tra mặc định.
- Căn lề an toàn: mép trên của tim và mép dưới của đĩa có khoảng thở rộng rãi (~12% mỗi đầu), không bị chạm hay cắt mép ở mọi tỷ lệ khung (536×750, 694×648, mobile dọc).
- Chứng minh cả 3 hệ tự chuyển động mượt mà khi camera đứng yên hoàn toàn.

---

## 2. KẾT QUẢ KIỂM THỬ KỸ THUẬT

1. **Unit Tests (Vitest)**:
   ```powershell
   node ./node_modules/vitest/vitest.mjs run src/effects/particle-heart-text-vortex/tests/effect.test.ts
   ```
   - Kết quả: **4/4 bài test PASS** (Defaults, Clamping, Presets, Manifest).
2. **TypeScript Compilation Check**:
   ```powershell
   node .local/particle-heart-text-vortex/check_ts.mjs
   ```
   - Kết quả: **100% CLEAN (0 errors)**.

---

## 3. BẰNG CHỨNG HÌNH ẢNH & VIDEO THỰC TẾ

1. **Ảnh chụp Canvas chính diện**:
   - [shot_v5_canvas_front.png](file:///c:/Users/Administrator/Downloads/carbin%20thiep/dingdong-gift-cabinet/.local/particle-heart-text-vortex/shot_v5_canvas_front.png): Minh chứng trái tim hạt mịn tròn đầy, không gai/lông, đĩa chữ 10 tầng dày dặn có chiều sâu.
2. **Ảnh chụp toàn bộ Studio Preview**:
   - [shot_v5_stage_studio.png](file:///c:/Users/Administrator/Downloads/carbin%20thiep/dingdong-gift-cabinet/.local/particle-heart-text-vortex/shot_v5_stage_studio.png): Khung cảnh tổng thể cân đối, có khoảng thở trên dưới.
3. **Video ghi nhận chuyển động thực tế (12 giây)**:
   - File: `dingdong-gift-cabinet/.local/particle-heart-text-vortex/qa_v5_pure_motion.mp4`
   - Nội dung video:
     + 0s – 8.5s: **Camera đứng yên hoàn toàn**, chứng minh chuyển động nội tại thuần tuý của cả 3 hệ (hạt tim dao động & thở nhẹ, 10 vòng chữ xoay so le, dòng ký tự rơi).
     + 8.5s – 10.0s: Kiểm tra tính năng Tạm dừng (Pause) & Tiếp tục (Resume).
     + 10.0s – 12.0s: Xoay nhẹ góc 3D để kiểm tra chiều sâu thể tích thực tế.
