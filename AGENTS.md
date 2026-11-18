# Chỉ dẫn Agent — DingDong Gift Parallel Effects System

Dự án phát triển hiệu ứng theo kiến trúc package độc lập.

## Quy tắc bắt buộc cho Worker:
1. Đọc kỹ file `src/effects/<EFFECT_ID>/assignment.json` và `TASK.md` trước khi thao tác.
2. Worker **chỉ được sửa** các file trong phạm vi:
   - `src/effects/<EFFECT_ID>/**`
   - `.local/<EFFECT_ID>/**` (dành cho file log, video mẫu, ảnh kiểm tra tạm - không commit).
3. **Tuyệt đối không sửa**:
   - `package.json`, `package-lock.json`
   - `src/app/**`, `src/effect-host/**`, `src/effect-sdk/**`, `src/shared-assets/**`
   - Cấu hình root (`vite.config.ts`, `tsconfig.json`, `eslint.config.js`)
   - Package hiệu ứng của worker khác.
4. **Không import chéo** giữa các package hiệu ứng (`src/effects/<other-id>`). Chỉ sử dụng public API từ `src/effect-sdk` và `src/shared-assets`.
5. Không tự đổi nhánh hoặc tự ý merge từ worker. Không tự động push hoặc deploy.
6. Chạy kiểm tra bắt buộc trước khi bàn giao:
   - `npm run effects:check -- --id <EFFECT_ID>`
   - `npm run effects:scope -- --id <EFFECT_ID> --base <BASELINE_COMMIT>`
7. Báo cáo trung thực trong `QA.md` và `HANDOFF.md`: phân biệt rõ giữa kiểm tra kỹ thuật (typecheck, tests) và đánh giá thị giác (visual rendering). Phần nào chưa kiểm chứng phải ghi rõ.

## Vai trò của Điều phối viên (Coordinator / Integrator):
- Sở hữu và bảo trì Host, SDK, shared-assets, templates, scripts, config root và lockfile.
- Chuẩn bị lô nhiệm vụ, tạo worktrees độc lập cho từng worker (`effects:batch`).
- Kiểm tra vi phạm phạm vi (`effects:scope`) và tương thích trước khi ghép.
- Ghép tuần tự từng package hoàn thành vào nhánh tích hợp và kiểm tra hồi quy toàn hệ thống.
