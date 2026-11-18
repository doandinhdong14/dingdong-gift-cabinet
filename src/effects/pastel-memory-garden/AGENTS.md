# Chỉ dẫn cho Worker của Gói Hiệu Ứng

Bạn được phân công làm việc độc lập trên hiệu ứng này.

## Phạm vi cho phép:
- Chỉ sửa các file bên trong thư mục này: `src/effects/pastel-memory-garden/**`.
- Dùng `.local/pastel-memory-garden/**` để chứa video, ảnh kiểm tra tạm, file scratch (không commit).

## Nghiêm cấm:
- Không sửa bất kỳ file nào ngoài thư mục của package này.
- Không sửa `package.json`, `package-lock.json`, cấu hình root hoặc code trong `src/effect-host`, `src/effect-sdk`, `src/shared-assets`.
- Không import chéo từ package hiệu ứng khác (`src/effects/<other>`).
- Chỉ dùng các export chính thức từ `../../effect-sdk` và `../../shared-assets`.

## Trước khi bàn giao:
1. Chạy `npm run effects:check -- --id pastel-memory-garden`
2. Chạy `npm run effects:scope -- --id pastel-memory-garden --base <BASELINE_COMMIT>`
3. Cập nhật `QA.md` và `HANDOFF.md`.
4. Commit chỉ các file trong package này trên nhánh nhiệm vụ được giao.
