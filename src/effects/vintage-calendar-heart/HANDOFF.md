# Biên bản Bàn giao Hiệu ứng (Handoff Report)

- **Effect ID**: `vintage-calendar-heart`
- **Tên hiệu ứng**: Lịch Treo Tường Cổ Điển (Vintage Calendar Flip & Heart Reveal)
- **Phiên bản**: 0.3.0 (Natural Paper Tear & Realistic Bloc Physics Edition)
- **Trạng thái**: `review` (Sẵn sàng nghiệm thu)

---

## 1. Tóm tắt kết quả nâng cấp chuyển động Xé Giấy Tự Nhiên (Natural Paper Tear)

Để đạt độ chân thực tối đa theo đúng cảm giác xé một tờ lịch bloc truyền thống, hiệu ứng đã được tinh chỉnh toàn diện với các yếu tố vật lý sống động:

1. **Uốn lật chéo góc bất đối xứng (Diagonal Corner Peel)**:
   - Trang lịch không còn cuộn ngang cơ học như rèm cuốn mà nhấc từ một góc chéo lên trước ($\sim 10^\circ - 14^\circ$).
   - Các trang chẵn (15, 17) nhấc góc dưới phải; các trang lẻ (16, 18) nhấc góc dưới trái, mô phỏng sinh động nhịp tay người lật.
   - Bề mặt giấy uốn lượn có độ võng parabol mềm mại.

2. **Xé nẹp hữu cơ bất quy tắc & Viền xơ bột giấy (Ragged Torn Edge & Pulp Fibers)**:
   - Thuật toán `generateTearPoints` tạo đường rách bất quy tắc 48 điểm bằng nhiễu đa tần số (multi-octave noise).
   - Tờ giấy tách rời có mép xé tự nhiên với viền xơ bột giấy trắng sáng bắt ánh sáng.

3. **Vết cuống giấy rách dở đọng lại dưới nẹp (Persistent Torn Clamp Stubs)**:
   - Dưới nẹp gỗ kẹp lịch, các trang đã xé (15, 16, 17, 18) lần lượt để lại các lớp cuống giấy rách dở (`torn stubs`) chìa ra ngoài.
   - Người xem lập tức cảm nhận được cuốn lịch bloc đang thực sự bị xé từng tờ qua thời gian.

4. **Bụi giấy & Sợi vụn xé bay ra (Paper Fiber Micro-Particles)**:
   - Tại tích tắc giấy đứt toạc khỏi nẹp ($progress \approx 0.50$), $20-24$ mảnh sợi giấy siêu nhỏ bật tung lên trên và lượn nhẹ rơi xuống dưới tác động của trọng lực và lực cản không khí.
   - Đem lại cảm giác xé dứt khoát, xúc giác rõ nét.

5. **Thấu quang mặt sau giấy (Translucent Print Bleed-Through)**:
   - Mặt sau giấy mỏng ngả vàng ấm (`#f5eee1`) để lộ hình in mờ xuyên qua từ mặt trước (`opacity: 10%`), đúng tính chất giấy lịch mỏng nhẹ.

6. **Khí động học bay lượn & Thả lỏng nếp cuộn (Flutter & Uncurling)**:
   - Khi bay trong không khí, tờ giấy rung rinh lượn sóng mềm mại và nếp cuộn dần mở rộng ra (uncurling), bay bổng tự nhiên.

---

## 2. Danh mục 10 Khung hình Kiểm thử (Mandatory Frames)

Đã đối chiếu và chụp kiểm chứng tự động đủ 10 khung hình tại `.local/vintage-calendar-heart/previews/`:

1. `frame_A_day15_idle.png`: Ngày 15 đứng yên (IDLE).
2. `frame_B_15_curling_start.png`: Góc dưới trang 15 nhấc chéo uốn cong mềm mại.
3. `frame_C_15_curled_midway.png`: Trang 15 uốn dẻo lộ mặt sau in mờ thấu quang, trang 16 hé lộ.
4. `frame_D_15_flying_away.png`: Trang 15 xé rách nẹp bay vút, cuống giấy rách đọng lại dưới nẹp, bụi giấy bung ra.
5. `frame_E_16_flipping_to_17.png`: Trang 16 nhấc góc đối xứng, xé nẹp bay lệch phải lộ trang 17.
6. `frame_F_day18_displayed.png`: Trang 18 hiển thị hoàn chỉnh, cuống giấy tích tụ dưới nẹp, tạm dừng 0.25s.
7. `frame_G_18_flying_to_19.png`: Trang 18 xé rời bay ra, để lộ ngày đặc biệt 19.
8. `frame_H_day19_settled_no_heart.png`: Trang 19 hiển thị trọn vẹn, ổn định 0.45s tĩnh.
9. `frame_I_heart_drawing.png`: Đường trái tim uốn lượn Catmull-Rom đang được vẽ quanh số 19 và "THỨ NĂM".
10. `frame_J_celebration_complete.png`: Trái tim hoàn chỉnh, 15 hạt tim bay, sao vàng lấp lánh và dòng chữ "Ngày của anh ♥" xuất hiện mở nét.

---

## 3. Cách xem thử trên máy (Preview Guide)

1. **Khởi chạy Host preview server**:
   ```bash
   node scripts/effects/preview.mjs --id vintage-calendar-heart --port 5211
   ```
2. **Mở trình duyệt truy cập**:
   [http://localhost:5211/#/effects/vintage-calendar-heart](http://localhost:5211/#/effects/vintage-calendar-heart)

3. **Thao tác kiểm tra**:
   - Nhấn nút tim hồng ở đáy hoặc click vào cuốn lịch để bắt đầu chuỗi lật.
   - Cảm nhận chuyển động xé giấy tự nhiên với góc nhấc chéo, tiếng rách trực giác qua bụi giấy xé và cuống giấy rách tích tụ dưới nẹp.
   - Thử các nút trên thanh điều khiển Host: **Tạm dừng**, **Tiếp tục**, **Chạy lại (Replay)**, tùy chỉnh thông số trong tab **Tùy chỉnh** / **Biến thể (Presets)**.

---

## 4. Lệnh kiểm tra kỹ thuật (Technical Check)

```bash
node scripts/effects/check.mjs --id vintage-calendar-heart
```
Kết quả: `ALL CHECKS PASSED for effect "vintage-calendar-heart"`.
