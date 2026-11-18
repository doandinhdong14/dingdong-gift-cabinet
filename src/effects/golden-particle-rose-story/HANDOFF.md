# Biên bản Bàn giao Hiệu ứng (Handoff Report)

- **Effect ID**: `golden-particle-rose-story`
- **Tên hiệu ứng**: Golden Particle Rose Story (Thiệp tình yêu hạt vàng & bó hoa hồng tương tác)
- **Phiên bản**: 1.0.0
- **Trạng thái**: READY FOR INTEGRATION / PASS REVIEW
- **Renderer**: DOM / 2.5D Layered Animation with High-Performance Canvas Particles

---

## 1. Tóm tắt kết quả

Hiệu ứng thiệp chúc mừng điện tử tương tác cao cấp dựa trên video tham chiếu gốc ~38.27s đã hoàn thiện đầy đủ 7 phân cảnh theo kịch bản:

1. **Scene 1 — Golden Vortex (0–2.2s)**: Hàng nghìn hạt vàng xoay chuyển theo quỹ đạo xoắn ốc 2 nhánh vi sai quanh lõi sáng trên nền vũ trụ sao đêm lấp lánh và sao băng.
2. **Scene 2 — Golden Heart & "Anh Yêu" (2.2–7.2s)**: Hạt vàng hội tụ thành viền trái tim phát sáng sắc nét có vành đai bụi sao (Saturn-like ring) nghiêng bao quanh, chữ trắng "Anh Yêu" calligraphy xuất hiện trang nhã ở tâm.
3. **Scene 3 — Cinematic Messages (7.2–22.6s)**: Chuỗi 4 thông điệp chuyển cảnh ("Chúc mừng", "Ngày Quốc\ntế Nam giới", "19 tháng 11", "Cảm ơn anh\nvì tất cả") với typography vàng kim ánh kim rực rỡ và hào quang hạt bụi vàng bao quanh.
4. **Scene 4 — Heart Photo Reveal (22.6–30.1s)**: Hạt vàng tụ lại thành khung ảnh trái tim có viền kép mạ vàng phát hào quang, ảnh đôi/ảnh cá nhân xuất hiện mượt mà bên trong mà không bị biến dạng khuôn mặt.
5. **Scene 5 — Bouquet Assembly (30.1–33.6s)**: Các hạt đổi màu thực tế thành hình bó hoa: hạt đỏ hồng tạo 9 nụ hoa, hạt xanh lá tạo cành lá, hạt kem vàng tạo giấy gói, hạt hồng tạo nơ ruy băng.
6. **Scene 6 — Rose Bloom (33.6–35.8s)**: 9 nụ hồng bung nở các lớp cánh hoa nhung đỏ thắm theo nhịp so le hữu cơ, cánh hoa rơi rải rác bay lượn trong gió tạo cảm xúc lãng mạn.
7. **Scene 7 — Interactive Final Typography (35.8s+)**: Xuất hiện tiêu đề chúc mừng, thanh pill "9 bông hồng ♥ Mãi mãi bên nhau", lời nhắn nhủ, và gợi ý nhấn vào từng bông hoa.
8. **Interactive Feature — 9 Rose Photo Memories**: Người nhận có thể bấm vào bất kỳ bông hồng nào để xem ảnh kỷ niệm gắn liền với bông hoa đó, kèm ngày tháng, lời tâm sự và điều hướng tiến/lùi mượt mà.

---

## 2. Cách xem thử (Preview)

- **Khởi động server Vite**:
  ```bash
  npm run dev
  # hoặc: npm run effects:preview -- --id golden-particle-rose-story --port 5211
  ```
- **Truy cập trực tiếp trên trình duyệt**:
  `http://localhost:5173/#/effects/golden-particle-rose-story`
  hoặc
  `http://localhost:5211/#/effects/golden-particle-rose-story`

- **Tua nhanh đến phân cảnh bất kỳ bằng Seeker (trong Console F12)**:
  ```javascript
  window.__GOLDEN_SEEK__(0.8);  // Xoáy hạt vàng
  window.__GOLDEN_SEEK__(4.2);  // Trái tim & Anh Yêu
  window.__GOLDEN_SEEK__(12.8); // Lời chúc Ngày Quốc tế Nam giới
  window.__GOLDEN_SEEK__(26.0); // Khung ảnh trái tim cá nhân
  window.__GOLDEN_SEEK__(31.8); // Hạt đổi màu tạo bó hoa & 9 nụ
  window.__GOLDEN_SEEK__(34.6); // Hoa hồng bung nở & cánh hoa rơi
  window.__GOLDEN_SEEK__(37.0); // Giao diện hoàn tất & tương tác
  ```

---

## 3. Cách cấu hình & Tùy biến (Customization Guide)

### A. Thay đổi ảnh cá nhân & lời chúc
Thông qua bảng điều khiển Host Controls hoặc truyền cấu hình:
- `heartPhoto`: URL ảnh đôi/ảnh cá nhân hiển thị trong khung trái tim Scene 4.
- `heartPhotoCrop`: `{ x: 0.5, y: 0.5, scale: 1.0 }` để căn chỉnh góc chụp khuôn mặt đẹp nhất.
- `openingText`: Chữ viết tay Scene 2 (Mặc định: `"Anh Yêu"`).
- `greetingMessages`: Mảng 4 chuỗi thông điệp (Mặc định: `['Chúc mừng', 'Ngày Quốc\ntế Nam giới', '19 tháng 11', 'Cảm ơn anh\nvì tất cả']`).
- `finalTitle`: Tiêu đề Scene 7 (Mặc định: `"Tặng anh bó hoa không bao\ngiờ tàn"`).
- `finalSubtitle`: Dòng phụ trong pill badge (Mặc định: `"9 bông hồng ♥ Mãi mãi bên nhau"`).
- `finalMessage`: Lời nhắn nhủ chân thành cuối thiệp.
- `interactionHint`: Dòng nhắc nhở ở chân trang (Mặc định: `"Nhấn vào bông hồng để xem ảnh nhé"`).

### B. Cấu hình 9 bông hồng tương tác
Mỗi bông hồng trong mảng `rosePhotos` (id từ 1 đến 9) có thể tùy biến độc lập:
```typescript
{
  id: 1,
  url: "https://your-domain.com/photo-1.jpg",
  caption: "Khoảnh khắc đầu tiên ta gặp nhau ♥",
  date: "Mùa thu ấy"
}
```

### C. Bộ Presets có sẵn
1. **Romantic Gold (Mặc định)**: Tông đen vàng kinh điển của video gốc, hoa hồng nhung đỏ rượu vang.
2. **Royal Velvet**: Tông xanh đen đêm sâu, hoa hồng đỏ nhung sang trọng quý phái.
3. **Starlight Fairy Dust**: Tông tím ngân hà mộng mơ với hạt vàng ngọc trai.
4. **Gentle Sunset**: Tông hổ phách và hoàng hôn ấm áp, hoa hồng san hô.

---

## 4. Kết quả kiểm tra kỹ thuật (Verification Summary)

Chạy lệnh kiểm tra tổng thể dự án:
```bash
node scripts/effects/check.mjs --id golden-particle-rose-story
```

Kết quả:
```
========================================
Running Technical Checks for "golden-particle-rose-story"
========================================

[1/4] Checking manifest.json...
PASS: manifest.json ID matches folder.

[2/4] Checking import boundaries...
PASS: All imports strictly respect package boundaries (SDK/shared-assets only).

[3/4] Running package tests...
 ✓ src/effects/golden-particle-rose-story/tests/effect.test.ts (12 tests) 39ms
PASS: Package unit tests passed.

[4/4] Running TypeScript typecheck...
PASS: TypeScript compilation clean.

========================================
ALL CHECKS PASSED for effect "golden-particle-rose-story"!
========================================
```

---

## 5. Danh sách file bàn giao

```
src/effects/golden-particle-rose-story/
├── manifest.json                  # Metadata hiệu ứng
├── config.ts                      # Interface, codec và defaults
├── controls.ts                    # Schema bảng điều khiển AutoControls
├── presets.ts                     # 4 Preset phong cách màu sắc & hạt
├── presentation.ts                # Cấu hình hiển thị nền & chất lượng
├── index.ts                       # Entry point xuất hiệu ứng
├── Scene.tsx                      # Scene entry component
├── Overlay.tsx                    # Stage chính, state machine & RAF loop
├── components/
│   ├── ParticleEngine.ts          # Bộ engine 12k hạt vàng & morphing vật lý
│   ├── BouquetRenderer.tsx        # Render bó hoa 2.5D & 9 bông hồng nở
│   ├── HeartPhotoLayer.tsx        # Khung ảnh trái tim cá nhân viền kép
│   ├── FinalTypography.tsx        # Header, pill badge, subtitle & hint
│   ├── RoseModal.tsx              # Modal xem ảnh kỷ niệm 9 bông hoa
│   └── BackgroundLayer.tsx        # Bầu trời sao đêm & sao băng
├── assets/
│   ├── sample_couple.png          # Ảnh mẫu cặp đôi khung trái tim
│   └── sample_photo_1..9.png      # 9 ảnh kỷ niệm mẫu cho 9 bông hồng
├── preview/
│   ├── fallback.svg               # SVG fallback
│   └── thumbnail.webp             # Ảnh thumbnail phát hiện hiệu ứng
├── tests/
│   └── effect.test.ts             # 12 Unit tests kiểm thử đầy đủ 12 test cases
├── QA.md                          # Báo cáo Đảm bảo Chất lượng
└── HANDOFF.md                     # Biên bản Bàn giao Hiệu ứng
```

---

## 6. Yêu cầu tích hợp cho Coordinator (Integration Notes)

1. Gói hiệu ứng hoàn toàn độc lập và tương thích 100% với `effect-sdk`.
2. Không cần cài thêm thư viện phụ thuộc ngoài (zero extra npm dependencies).
3. Hỗ trợ đầy đủ các lifecycle hook: `runtime.isPaused`, `runtime.speed`, `runtime.runId` (replay), và phát sự kiện `emit({ type: 'complete' })` cũng như `emit({ type: 'interaction' })`.
