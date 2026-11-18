# Báo cáo Đảm bảo Chất lượng (QA) - Cải tiến Xé Giấy Tự Nhiên (Natural Paper Tear)

- **Effect ID**: `vintage-calendar-heart`
- **Tên hiệu ứng**: Lịch Treo Tường Cổ Điển (Vintage Calendar Flip & Heart Reveal)
- **Mã kiểm thử**: 2026-11-19
- **Phiên bản**: 0.3.0
- **Trạng thái**: review (sẵn sàng nghiệm thu)

---

## I. Cải tiến Chuyển động Xé Giấy Tự Nhiên (Natural Paper Tearing Physics)

Theo phản hồi thực tế về cảm giác uốn lật cơ học trước đây, hệ thống đã được nâng cấp toàn diện về mặt vật lý chuyển động uốn giấy và xé rời (bloc tear physics):

### 1. Uốn cong chéo góc bất đối xứng (Diagonal Corner Peel)
- **Vấn đề cũ**: Lát cắt uốn hình trụ hoàn toàn ngang bằng nhau từ đáy lên đỉnh, trông giống một chiếc rèm cuốn kim loại cơ học hơn là trang giấy mềm.
- **Giải pháp mới**:
  - Tích hợp góc nghiêng lật chéo $\alpha \approx 10^\circ - 14^\circ$:
    - Trang chẵn (Ngày 15, 17): Góc dưới bên phải nhấc lên trước, dải uốn lượn chéo góc quét dần lên trên.
    - Trang lẻ (Ngày 16, 18): Góc dưới bên trái nhấc lên trước, so le tự nhiên theo nhịp tay người lật.
  - Mỗi lát cắt giấy có độ dời ngang (`dx`) và góc nghiêng (`sliceTilt`) tạo độ võng parabol mềm mại tự nhiên cho bề mặt giấy.

### 2. Đường rách xé nẹp hữu cơ (Organic Ragged Tear Line)
- **Vấn đề cũ**: Mép rách trước đây chỉ dùng 24 răng cưa tam giác đều đặn, nhìn giống tem thư hoặc lưỡi cưa nhân tạo.
- **Giải pháp mới**:
  - Xây dựng thuật toán `generateTearPoints(width, seed)` sử dụng hàm nhiễu đa tần số (multi-octave pseudo-noise, 48 đỉnh điểm).
  - Tạo các vết rách nông sâu ngẫu nhiên xen lẫn sợi xơ giấy tự nhiên.
  - Mỗi ngày có một hoa văn rách riêng biệt xác định theo `pageIndex`.
  - Bổ sung nét viền xơ bột giấy trắng sáng (`frayed white pulp fiber highlight`) dọc theo mép rách để bắt ánh sáng chân thực.

### 3. Vết cuống giấy rách đọng lại dưới nẹp (Persistent Torn Clamp Stubs)
- **Đặc trưng độc đáo của lịch bloc Việt Nam**: Khi xé từng tờ lịch, phần chân giấy phía trên bị nẹp gỗ kẹp chặt sẽ để lại các cuống giấy xé rách dở (`torn paper stubs`).
- **Triển khai**:
  - Khi ngày 15 bị xé bay đi, trên cuốn lịch xuất hiện một dải cuống giấy rách dở chìa ra dưới nẹp gỗ ($y \approx 193.5 - 198\text{px}$).
  - Khi ngày 16, 17, 18 lần lượt bị xé, các lớp cuống giấy rách tiếp tục xếp chồng tích tụ dưới thanh nẹp, mang lại cảm giác thời gian và vật lý vô cùng chân thực.

### 4. Hệ thống hạt bụi sợi giấy xé (Paper Tear Fibers Particle System)
- Ngay tại thời điểm tờ giấy bị kéo căng và đứt toạc khỏi nẹp ($progress \approx 0.50$):
  - Phun trào tức thì $20 - 24$ mảnh sợi vụn giấy li ti (`PaperFiber`):
    - Kích thước siêu nhỏ $1.5 \times 3\text{px}$ đến $2.5 \times 4.5\text{px}$ màu trắng kem.
    - Bật ngược lên trên với vận tốc $vy \approx -25 \dots -85\text{px/s}$, xoay tròn ngẫu nhiên.
    - Rơi lượn bồng bềnh dưới tác động của trọng lực và lực cản không khí trong $0.45 - 0.75\text{s}$.
  - Tạo cảm giác "xé toạc" (tactile tear snap) vô cùng đã mắt và sống động.

### 5. Thấu quang mặt sau giấy (Translucent Print Bleed-Through)
- Giấy lịch bloc truyền thống rất mỏng ($60 - 70\text{ gsm}$).
- Khi giấy cuộn lộ mặt sau, hệ thống render:
  - Tông màu giấy ngả vàng ấm tự nhiên (`#f5eee1`).
  - Lớp in mờ xuyên qua từ mặt trước (`ghosted print bleed-through` với opacity $10\%$).
  - Đổ bóng ambient occlusion sâu bên trong lòng nếp cuộn.

### 6. Khí động học bay lượn & Thả lỏng nếp cuộn (Aerodynamic Flutter & Uncurling)
- Sau khi rách khỏi nẹp:
  - Tờ giấy không bay cứng nhắc mà dao động lắc lư nhẹ theo luồng khí ($\sin(t \cdot 15) \cdot 0.045$).
  - Nếp cuộn ban đầu mở rộng dần bán kính (từ $22\text{px}$ lên $58\text{px}$), mô phỏng trang giấy bung nhẹ ra khi được tự do bay trong không khí.

---

## II. Bảng đối chiếu 10 Khung hình Kiểm thử (Mandatory Frames)

Đã chụp và đối chiếu đầy đủ 10 khung hình thực tế tại thư mục `.local/vintage-calendar-heart/previews/`:

| STT | Khung hình | Tên file ảnh đã chụp | Mô tả trạng thái thực tế quan sát được | Đánh giá |
|:---:|:---:|---|---|:---:|
| 1 | **FRAME A** | `frame_A_day15_idle.png` | **Ngày 15 đứng yên (IDLE)**: Bảng lịch đỏ thẫm cân giữa, chốt treo vàng kim 2 sợi dây mảnh, nẹp gỗ sẫm, số 15 đỏ serif, "CHỦ NHẬT" đỏ, âm lịch "7 Bính Ngọ", nút tim hồng nhấp nháy "Nhấn để lật lịch". | **ĐẠT** |
| 2 | **FRAME B** | `frame_B_15_curling_start.png` | **Mép dưới trang 15 bắt đầu cuộn**: Góc dưới bên phải nhấc lên trước với góc chéo $12^\circ$, dải bóng đổ chuyển động sâu dần, lộ mép trang 16. | **ĐẠT** |
| 3 | **FRAME C** | `frame_C_15_curled_midway.png` | **Trang 15 cuộn đến giữa, trang 16 lộ ra**: Nếp uốn mềm mại dẻo dai, mặt sau có ánh sáng thấu quang in mờ, lộ rõ trang 16 ("16", "THỨ HAI", "8 Bính Ngọ"). | **ĐẠT** |
| 4 | **FRAME D** | `frame_D_15_flying_away.png` | **Trang 15 xé rách khỏi nẹp & bay vút**: Mép trên rách nẹp hữu cơ với sợi xơ trắng; cuống giấy rách đọng lại dưới nẹp; bụi giấy xé li ti văng ra; tờ 15 lắc lư lượn sóng bay lên góc trái. | **ĐẠT** |
| 5 | **FRAME E** | `frame_E_16_flipping_to_17.png` | **Trang 16 đang lật sang trang 17**: Góc trái nhấc trước (so le), cuộn dẻo và xé rời bay chếch về bên phải, lộ rõ trang 17 ("17", "THỨ BA", "9 Bính Ngọ"). | **ĐẠT** |
| 6 | **FRAME F** | `frame_F_day18_displayed.png` | **Trang 18 hiển thị hoàn chỉnh**: Trang 17 đã bay đi, dưới nẹp kẹp gỗ xuất hiện các cuống giấy xé tích tụ; trang 18 dừng nghỉ ngắn 0.25s theo nhịp video. | **ĐẠT** |
| 7 | **FRAME G** | `frame_G_18_flying_to_19.png` | **Trang 18 xé rời bay ra, trang 19 xuất hiện**: Trang 18 rách mép bay vút lên, bụi giấy bung nhẹ, để lộ trang đích đặc biệt ngày 19. | **ĐẠT** |
| 8 | **FRAME H** | `frame_H_day19_settled_no_heart.png` | **Trang 19 hiển thị ổn định, chưa vẽ trái tim**: Trang 19 dừng lại trọn vẹn ("19" đỏ lớn, "THỨ NĂM", "11 Bính Ngọ", "Ngày Quốc tế Nam giới"), giữ nguyên 0.45s tĩnh. | **ĐẠT** |
| 9 | **FRAME I** | `frame_I_heart_drawing.png` | **Đường trái tim đang được vẽ quanh ngày 19**: Nét vẽ màu hồng đỏ (`#ff3b68`) xuất phát từ chóp trên, uốn lượn Catmull-Rom mượt mà bao quanh số 19 và chữ "THỨ NĂM", hoàn toàn nằm dưới vạch tiêu đề đỏ. | **ĐẠT** |
| 10 | **FRAME J** | `frame_J_celebration_complete.png` | **Trái tim hoàn chỉnh, hạt bay và lời chúc xuất hiện**: Trái tim khép nét với móc xoắn đáy; 15 hạt tim hồng bay lượn ngẫu nhiên; sao vàng lấp lánh quanh chốt treo; dòng chữ "Ngày của anh ♥" xuất hiện mở nét ánh sáng hồng ấm. | **ĐẠT** |

---

## III. Kết quả Kiểm tra Tự động (Automated Verification)

Lệnh kiểm tra: `node scripts/effects/check.mjs --id vintage-calendar-heart`

```
========================================
Running Technical Checks for "vintage-calendar-heart"
========================================

[1/4] Checking manifest.json...
PASS: manifest.json ID matches folder.

[2/4] Checking import boundaries...
PASS: All imports strictly respect package boundaries (SDK/shared-assets only).

[3/4] Running package tests...
 ✓ src/effects/vintage-calendar-heart/tests/effect.test.ts (7 tests) 11ms
 Test Files  1 passed (1)
      Tests  7 passed (7)
PASS: Package unit tests passed.

[4/4] Running TypeScript typecheck...
PASS: TypeScript compilation clean.

========================================
ALL CHECKS PASSED for effect "vintage-calendar-heart"!
========================================
```
