# Hướng dẫn Phát triển Hiệu ứng Độc lập (Authoring Guide)

Quy trình chuẩn từng bước dành cho các AI Agent hoặc lập trình viên khi nhận một nhiệm vụ phát triển hiệu ứng.

## Bước 1: Tiếp nhận và xác minh không gian làm việc
1. Kiểm tra bạn đang đứng đúng thư mục workspace được giao (ví dụ `agent-01`).
2. Đọc kỹ:
   - `src/effects/<EFFECT_ID>/assignment.json`
   - `src/effects/<EFFECT_ID>/TASK.md`
   - `references/README.md`
3. Xem video hoặc ảnh mẫu đặt tại `.local/<EFFECT_ID>/references/`.

## Bước 2: Khởi động Preview và bắt đầu dựng hình
Chạy máy chủ xem trước ở cổng được chỉ định:
```bash
npm run effects:preview -- --id <EFFECT_ID> --port <PORT>
```
Truy cập trình duyệt tại `http://localhost:<PORT>/#/effects/<EFFECT_ID>`.

## Bước 3: Triển khai theo từng giai đoạn
1. **Dựng khung tĩnh**: Hoàn thiện hình dáng, lưới mesh, vật liệu màu sắc trong `Scene.tsx`.
2. **Thêm chuyển động**: Sử dụng `useEffectFrame` để điều khiển xoay, bay, bung nở theo `elapsedSeconds`.
3. **Khai báo controls**: Cập nhật các trường tùy chỉnh trong `config.ts` và `controls.ts`.
4. **Tạo biến thể (presets)**: Khai báo ít nhất 2 biến thể đẹp mắt trong `presets.ts`.

## Bước 4: Kiểm tra kỹ thuật và ranh giới tệp
Chạy kiểm tra kỹ thuật của gói:
```bash
npm run effects:check -- --id <EFFECT_ID>
```
Kiểm tra xem có vô tình sửa file nào ngoài phạm vi hay không:
```bash
npm run effects:scope -- --id <EFFECT_ID> --base <BASELINE_COMMIT>
```

## Bước 5: Bàn giao
1. Cập nhật `QA.md` và `HANDOFF.md`.
2. Đưa `status` trong `manifest.json` lên `"review"`.
3. Thực hiện git commit chỉ các file thuộc `src/effects/<EFFECT_ID>/**`:
   ```bash
   git add src/effects/<EFFECT_ID>
   git commit -m "feat(effect): hoàn thiện hiệu ứng <EFFECT_ID>"
   ```
4. Báo cáo lại cho Điều phối viên: ID, nhánh, commit hash và lệnh xem thử.
