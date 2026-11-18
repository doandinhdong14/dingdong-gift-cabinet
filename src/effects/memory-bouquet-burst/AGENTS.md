# Chỉ dẫn cho Worker của Gói Hiệu Ứng Bó Hoa Kỷ Niệm

Bạn được phân công làm việc độc lập trên hiệu ứng này.

## Phạm vi cho phép:
- Chỉ sửa các file bên trong thư mục này: `src/effects/memory-bouquet-burst/**`.

## Nghiêm cấm:
- Không sửa bất kỳ file nào ngoài thư mục của package này.
- Không sửa `package.json`, `package-lock.json`, cấu hình root hoặc code trong `src/effect-host`, `src/effect-sdk`, `src/shared-assets`.
- Không import chéo từ package hiệu ứng khác (`src/effects/<other>`).
- Chỉ dùng các export chính thức từ `../../effect-sdk` và `../../shared-assets`.

## Trước khi bàn giao:
1. Chạy `npm run effects:check -- --id memory-bouquet-burst`
2. Cập nhật `QA.md` và `HANDOFF.md`.
