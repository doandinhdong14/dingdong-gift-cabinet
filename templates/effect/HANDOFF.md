# Biên bản Bàn giao Hiệu ứng

- **Effect ID**: __EFFECT_ID__
- **Phiên bản**: 0.1.0
- **Nhánh nhiệm vụ**: effect/__BATCH_ID__/__SLOT__
- **Trạng thái**: review

## 1. Tóm tắt kết quả
Mô tả các thành phần đã hoàn thành trong gói.

## 2. Cách xem thử
- Lệnh mở preview:
  `npm run effects:preview -- --id __EFFECT_ID__ --port __PORT__`
- Đường dẫn trực tiếp:
  `http://localhost:__PORT__/#/effects/__EFFECT_ID__`

## 3. Các thao tác cần thử
1. Kéo thanh trượt tốc độ và kích thước.
2. Thử nút tạm dừng và chạy lại.
3. Chuyển đổi giữa các preset trong tab "Biến thể".

## 4. Báo cáo kiểm tra
- `npm run effects:check -- --id __EFFECT_ID__`
- `npm run effects:scope -- --id __EFFECT_ID__ --base <BASELINE_COMMIT>`
