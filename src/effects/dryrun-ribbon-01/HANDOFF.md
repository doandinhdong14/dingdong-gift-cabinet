# Biên bản Bàn giao Hiệu ứng

- **Effect ID**: dryrun-ribbon-01
- **Phiên bản**: 0.1.0
- **Nhánh nhiệm vụ**: effect/dryrun-test/01
- **Trạng thái**: review

## 1. Tóm tắt kết quả
Mô tả các thành phần đã hoàn thành trong gói.

## 2. Cách xem thử
- Lệnh mở preview:
  `npm run effects:preview -- --id dryrun-ribbon-01 --port 5211`
- Đường dẫn trực tiếp:
  `http://localhost:5211/#/effects/dryrun-ribbon-01`

## 3. Các thao tác cần thử
1. Kéo thanh trượt tốc độ và kích thước.
2. Thử nút tạm dừng và chạy lại.
3. Chuyển đổi giữa các preset trong tab "Biến thể".

## 4. Báo cáo kiểm tra
- `npm run effects:check -- --id dryrun-ribbon-01`
- `npm run effects:scope -- --id dryrun-ribbon-01 --base <BASELINE_COMMIT>`
