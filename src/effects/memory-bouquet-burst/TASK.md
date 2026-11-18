# Nhiệm Vụ: Bó hoa kỷ niệm (memory-bouquet-burst)

## Mục tiêu
Triển khai mẫu hiệu ứng bó hoa kỷ niệm ở giữa nền sao tối:
1. Ban đầu chỉ thấy bó hoa trên nền sao tối cùng gợi ý "Chạm vào bó hoa".
2. Chạm vào bó hoa: các ảnh kỷ niệm xuất hiện xen vào phần hoa phía trên (reaveal với stagger mượt mà).
3. Ấn giữ bó hoa: vòng tiến trình tròn màu hồng trắng chạy theo chiều kim đồng hồ quanh nơ.
4. Giữ đủ thời gian (100%): các ảnh kỷ niệm bật khỏi bó hoa và tung lên không trung, xòe sang hai phía với quỹ đạo tự nhiên.
5. Kết thúc: hiện nút "Xem lại" để reset về ban đầu.

## Video tham chiếu
- Video: `chrome_eRX7W2Rz03.mp4`
- Các mốc quan trọng:
  - 00:01: Bó hoa nguyên bản trên nền sao tối
  - 00:03 - 00:04: Sáu ảnh kỷ niệm xuất hiện lồng trong hoa, chân ảnh được mép giấy gói và nơ che lại.
