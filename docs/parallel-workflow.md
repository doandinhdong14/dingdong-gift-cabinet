# Quy trình Điều phối và Phát triển Song song (Parallel Workflow)

Tài liệu dành cho Điều phối viên (Coordinator) để phân chia công việc cho 10 agent và ghép các hiệu ứng vào tủ đồ.

## 1. Cơ chế Cách ly Không gian làm việc (Worktree)
Để 10 agent làm việc đồng thời mà không ghi đè mã nguồn của nhau, mỗi agent được cấp:
- Một thư mục vật lý riêng (Git worktree)
- Một nhánh Git riêng (`effect/<batchId>/<slot>`)
- Một cổng máy chủ cố định (ví dụ `5211` đến `5220`)
- Một phạm vi file độc quyền: `src/effects/<EFFECT_ID>/**`

```text
dingdong-gift-cabinet/ (Repo chính - Coordinator)
├── parallel-effects-system.md
└── src/effects/

../dingdong-gift-workers/batch-001/
├── agent-01/ (Branch: effect/batch-001/01, Port: 5211)
├── agent-02/ (Branch: effect/batch-001/02, Port: 5212)
└── ...
```

## 2. Bảng phân bổ 10 Slot tham khảo
| Slot | Workspace | Nhánh | Port | Vai trò gợi ý |
|---|---|---|---|---|
| 01 | agent-01 | effect/batch-001/01 | 5211 | Transition: Hộp quà mở nắp |
| 02 | agent-02 | effect/batch-001/02 | 5212 | Transition: Phong bì mở thư |
| 03 | agent-03 | effect/batch-001/03 | 5213 | Object3D: Máy bay giấy |
| 04 | agent-04 | effect/batch-001/04 | 5214 | Scene: Bóng bay bay lên |
| 05 | agent-05 | effect/batch-001/05 | 5215 | Scene: Bướm lượn quanh ảnh |
| 06 | agent-06 | effect/batch-001/06 | 5216 | Background: Pháo hoa trái tim |
| 07 | agent-07 | effect/batch-001/07 | 5217 | Background: Tuyết & ánh sáng |
| 08 | agent-08 | effect/batch-001/08 | 5218 | Transition: Thiệp lật trang |
| 09 | agent-09 | effect/batch-001/09 | 5219 | Scene: Bó hoa bung ảnh |
| 10 | agent-10 | effect/batch-001/10 | 5220 | Scene: Đèn lồng chúc mừng |

## 3. Lệnh tạo hàng loạt Worktree & Phân việc
1. Tạo hoặc chỉnh sửa file cấu hình lô `batches/batch-001.json`.
2. Chạy lệnh:
   ```bash
   npm run effects:batch -- --file batches/batch-001.json
   ```
   Hệ thống sẽ tự động khởi tạo các worktree và scaffold sẵn thư mục `src/effects/<id>` cho từng agent.

## 4. Kiểm tra tiến độ các Agent
Điều phối viên có thể kiểm tra trạng thái toàn bộ 10 agent bằng lệnh:
```bash
npm run effects:report -- --file batches/batch-001.json
```

## 5. Quy trình Ghép (Merge & Integration)
Khi một worker bàn giao:
1. Xác định commit hash worker đã bàn giao:
   ```bash
   git rev-parse effect/batch-001/01
   ```
2. Kiểm tra vi phạm phạm vi:
   ```bash
   npm run effects:scope -- --id <effect-id> --base <BASELINE_COMMIT>
   ```
3. Ghép nhánh của worker vào nhánh tích hợp:
   ```bash
   git merge --no-ff effect/batch-001/01 -m "feat(effect): tích hợp <effect-id>"
   ```
4. Do hệ thống sử dụng cơ chế **Auto-discovery**, không cần sửa bất kỳ file registry hay router nào! Hiệu ứng mới sẽ ngay lập tức xuất hiện trong bộ sưu tập.
5. Chạy kiểm tra hồi quy toàn repo:
   ```bash
   npm run typecheck
   npm run test
   ```
