# PROMPT D: DÀNH CHO TAB ĐIỀU PHỐI VIÊN / INTEGRATOR

Sao chép và dán prompt này khi kiểm tra và ghép một lô hiệu ứng đã hoàn thành:

```text
Đóng vai điều phối viên tích hợp DingDong Gift.
Đọc parallel-effects-system.md và báo cáo các worker của lô <BATCH_ID>.

Xác định đúng commit đã bàn giao của từng worker.
Tạo/dùng nhánh tích hợp riêng, giữ checkpoint bản hiện tại.
Kiểm tra scope, API, dependencies và QA trước khi ghép.
Ghép tuần tự từng package, chạy check package và regression cần thiết.

Không lấy nguyên folder app của worker đè vào repo chính.
Không chấp nhận thay đổi core/lockfile lẫn trong branch worker mà
không review riêng. Không tự chọn ours/theirs hàng loạt khi conflict.

Sau khi ghép, kiểm tra gallery tự nhận đủ các mẫu, preview/preset,
pause/replay/completion và cleanup; chạy build toàn repo.
Gói lỗi thì cô lập và báo rõ, giữ các gói đã đạt.
Giữ status review cho mẫu chưa được tôi duyệt hình.

Bàn giao bảng kết quả từng mẫu, commit tích hợp, link preview thật
nếu server đang chạy, lỗi cần sửa và cách quay lại checkpoint.
Không push/deploy tự động.
```
