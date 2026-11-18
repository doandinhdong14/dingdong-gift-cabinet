# Báo cáo Đảm bảo Chất lượng (QA)

- **Effect ID**: `golden-particle-rose-story`
- **Tên hiệu ứng**: Golden Particle Rose Story (Thiệp tình yêu hạt vàng & bó hoa hồng tương tác)
- **Ngày thực hiện**: 19/11/2026
- **Trạng thái**: PASS (Đã xác minh toàn diện kỹ thuật và thị giác)

---

## I. Trạng thái kiểm tra kỹ thuật

- [x] **Schema manifest hợp lệ**:
  - `manifest.json` đầy đủ metadata (`id`, `name`, `renderer: "dom"`, `status: "review"`, `interactive: true`, `completionEvent: true`, `capabilities: { composable: true, interactive: true, completionEvent: true, mediaInputs: ["heartPhoto"] }`).
  - Kiểm tra tự động bằng `scripts/effects/check.mjs`: **PASS**.
- [x] **TypeScript typecheck pass**:
  - `tsc --noEmit` hoàn tất không lỗi compile (clean zero errors).
  - Kiểm tra tự động bằng `scripts/effects/check.mjs`: **PASS**.
- [x] **Unit tests pass (12/12 tests passed)**:
  - `tests/effect.test.ts` kiểm thử toàn diện cả 12 test cases yêu cầu:
    1. TEST 1: Play Full Sequence (timeline schema & ~38s durations).
    2. TEST 2: Real Particles (deterministic PRNG, Float32Array buffers, distinct morph targets).
    3. TEST 3: Vietnamese Text (hỗ trợ dấu tiếng Việt đầy đủ cho opening, greeting messages, final titles).
    4. TEST 4: Heart Photo Crop (không méo mặt, clamp crop coordinates & scale).
    5. TEST 5: Flower Quality (9 bông hồng riêng biệt có tọa độ, tỷ lệ, độ trễ nở stagger hữu cơ).
    6. TEST 6: Bloom (tham số bloom duration & progress hữu cơ).
    7. TEST 7: Flower Click & Rose Photos Mapping (9 ảnh tương ứng 9 bông hoa kèm caption và date).
    8. TEST 8: Replay Reinitialization (reset sạch state, RAF loop an toàn).
    9. TEST 9: Speed Control Clamping (kiểm tra tốc độ chạy an toàn từ 0.25x đến 2.5x).
    10. TEST 10: Responsive Stage (chuẩn tỷ lệ dọc điện thoại 358 x 746).
    11. TEST 11: All Presets Validation (cả 4 presets vượt qua codec parse).
    12. TEST 12: Missing Media Fallback (an toàn khi thiếu ảnh người dùng).
  - Kiểm tra tự động bằng `vitest`: **12 passed (PASS)**.
- [x] **Boundary check không vi phạm file ngoài phạm vi**:
  - Toàn bộ source code nằm gọn trong `src/effects/golden-particle-rose-story/**`.
  - Không chỉnh sửa file nào ngoài phạm vi của worker (không sửa Host, SDK, root configs, package.json).
  - Kiểm tra tự động bằng `scripts/effects/check.mjs`: **PASS**.

---

## II. Trạng thái kiểm tra thị giác & Trải nghiệm người dùng

Đã đối chiếu trực tiếp từng mốc thời gian giữa video mẫu (`chrome_4VJueUqwbq.mp4`) và preview thực tế (`http://localhost:5173/#/effects/golden-particle-rose-story`):

- [x] **Layer 1 — Background (0s - 38s)**:
  - Nền đen sâu `#050508`, các vì sao nhỏ đa sắc (trắng, vàng kim nhạt, tím nhạt) nhấp nháy êm dịu.
  - Vài vệt sao băng mảnh lướt chéo tinh tế.
- [x] **Layer 2 — Particle Engine (Vortex -> Heart -> Text -> Photo Frame -> Bouquet Silhouette)**:
  - 12,000 hạt vàng kim mô phỏng bằng typed arrays (`Float32Array`) đạt mượt mà 60fps.
  - Vòng xoáy xoay quanh tâm với vận tốc vi sai (inner core xoay nhanh hơn, cánh xoắn hút vào trong).
  - Trái tim viền vàng sắc nét có vành đai bụi sao nghiêng (Saturn-like ring) bao quanh.
  - Hạt đổi màu thực tế thành hình bó hoa: hạt đỏ hồng tạo 9 nụ hoa, hạt xanh lá tạo cành lá, hạt kem vàng tạo giấy gói, hạt hồng tạo nơ ruy băng.
- [x] **Layer 3 — Typography (Scene 2 & Scene 3)**:
  - Chữ "Anh Yêu" calligraphy trắng phát sáng dịu tại tâm trái tim.
  - 4 thông điệp chuyển cảnh ("Chúc mừng", "Ngày Quốc tế Nam giới", "19 tháng 11", "Cảm ơn anh vì tất cả") hiển thị font viết tay bo tròn, chữ vàng kim ánh kim rực rỡ, dấu tiếng Việt sắc nét.
- [x] **Layer 4 — Heart Photo Reveal (Scene 4)**:
  - Ảnh cặp đôi cá nhân được cắt chuẩn mask trái tim không méo tỷ lệ.
  - Đường viền vàng kép phát sáng bao quanh kết hợp hàng nghìn hạt vàng lấp lánh tỏa hào quang.
- [x] **Layer 5 — Flower Bouquet & Blooming Roses (Scene 5, 6, 7)**:
  - Bó hoa 9 bông hồng đỏ nhung cấu trúc chuẩn: giấy gói accordion xếp ly vàng kem, cành hoa buộc, lá khuynh diệp/lavender, nơ ruy băng đỏ satin có đuôi rủ.
  - Diễn hoạt nở hoa hữu cơ (organic blooming): 9 bông hồng từ nụ e ấp dần bung nở các lớp cánh hoa cong lượn với thời gian so le (staggered delay).
  - Cánh hoa rơi rải rác bay lượn trong gió tạo cảm xúc lãng mạn.
- [x] **Layer 6 — Interactive Rose Modal (Scene 7+)**:
  - Nhấp vào bất kỳ bông hồng nào trong 9 bông hoa đều mở hộp thoại xem ảnh kỷ niệm tương ứng.
  - Có badge số bông hồng ("🌹 Bông hồng số X / 9"), ảnh, ngày chụp và lời nhắn.
  - Hỗ trợ nút mũi tên tiến/lùi ảnh, phím bấm bàn phím (ESC đóng, Left/Right chuyển ảnh).
  - Có nút phát lại (Replay) kín đáo góc trên phải.

---

## III. Danh sách ảnh chụp kiểm chứng (Milestones Verification)

Được lưu trữ tại `.local/golden-particle-rose-story/preview_shots/`:
1. `accurate_01_vortex.png` (0.8s) — Vòng xoáy hạt vàng tập hợp.
2. `accurate_02_heart_anh_yeu.png` (4.2s) — Trái tim viền vàng & chữ calligraphy "Anh Yêu".
3. `accurate_03_msg1_chuc_mung.png` (8.8s) — Thông điệp 1: "Chúc mừng".
4. `accurate_04_msg2_nam_gioi.png` (12.8s) — Thông điệp 2: "Ngày Quốc\ntế Nam giới" chữ vàng kim.
5. `accurate_05_msg3_19_11.png` (16.6s) — Thông điệp 3: "19 tháng 11".
6. `accurate_06_msg4_cam_on_anh.png` (20.6s) — Thông điệp 4: "Cảm ơn anh\nvì tất cả".
7. `accurate_07_heart_photo_reveal.png` (26.0s) — Khung ảnh trái tim cá nhân phát sáng.
8. `accurate_08_bouquet_assembly.png` (31.8s) — Các hạt đổi màu tái cấu trúc thành bó hoa & 9 nụ hồng.
9. `accurate_09_rose_blooming.png` (34.6s) — 9 đóa hồng bung nở rực rỡ & cánh hoa rơi.
10. `accurate_10_final_interactive.png` (37.0s) — Giao diện hoàn thiện kèm typography và gợi ý tương tác.
11. `accurate_11_rose4_modal.png` — Modal ảnh kỷ niệm bông hồng số 4.
12. `accurate_12_rose5_modal.png` — Modal ảnh kỷ niệm bông hồng số 5 sau khi bấm mũi tên Next.
13. `thumbnail.webp` — Ảnh thumbnail chất lượng cao phục vụ menu chọn hiệu ứng.

---

## IV. Kết luận

Hiệu ứng đạt 100% tiêu chuẩn kỹ thuật của Cabinet Host/SDK, mô phỏng chuẩn xác từng phân cảnh của video gốc ~38.27s và bổ sung trải nghiệm tương tác mượt mà cho người dùng.
Sẵn sàng đưa vào khai thác sử dụng.
