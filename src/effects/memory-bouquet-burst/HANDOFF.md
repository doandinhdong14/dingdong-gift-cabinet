# Bàn Giao: Bó hoa kỷ niệm (memory-bouquet-burst)

## Tóm tắt triển khai
- **Asset**: Đã xử lý bóc tách bó hoa (`bouquet_back.png`), lớp che mép giấy trước và nơ satin (`bouquet_front.png`), cùng 6 ảnh chân dung mẫu (`sample_photo_1..6.png`).
- **Lớp che**: 
  - Khi ảnh ở trạng thái sẵn sàng (ready), mép giấy trước và nơ (`zIndex: 10`) che chân ảnh (`zIndex: 4`), tạo cảm giác cắm sâu vào bó hoa.
  - Khi tung ảnh (bursting), ảnh được đưa lên `zIndex: 50` và bay tự do lên cao, không bị overflow cắt mất.
- **Tương tác**:
  - Hỗ trợ chuột, cảm ứng chạm và phím (Space / Enter).
  - Tách biệt rõ giữa cú chạm mở ảnh và thao tác ấn giữ.
  - Vòng tiến trình tròn màu hồng trắng quay từ 12 giờ.
  - Hủy giữ mượt mà (draining) nếu thả tay trước khi đầy, ảnh không bị mất.
  - Tự động kích hoạt tung ảnh ngay khi đạt 100%.
- **Nền sao**: Three.js particle system với màu ấm, champagne và hồng phấn, trôi và lấp lánh nhẹ nhàng.
