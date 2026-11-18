# TÀI LIỆU THAM CHIẾU VÀ ĐỐI CHIẾU THỊ GIÁC

- Tệp video tham chiếu: `chrome_LExBXDcfHx.mp4` (Thời lượng 10.11s, khung hình 536 × 750, 30 FPS).
- Nguồn lưu trữ kiểm tra local: `.local/particle-heart-text-vortex/`

## 1. Phân tích đối chiếu từ video tham chiếu
- **Khung hình**: Dọc 536 × 750 (tỷ lệ 0.71).
- **Trái tim**: Nằm ở nửa trên, chiếm ~38% chiều cao viewport. Gồm vô số hạt sáng nhỏ li ti màu hồng sen (#ff4d8d), hồng phấn viền ngoài (#f472b6) và điểm xuyết các hạt kim cương trắng ngà (#ffffff). Hai múi trên tròn căng, khe giữa sâu rõ, chóp dưới thu nhọn.
- **Đế chữ xoay**: Nằm ở nửa dưới, rộng hơn trái tim khoảng 15%, chiều cao elip chiếu lên màn hình ~26% viewport. Gồm nhiều vòng đồng tâm (10 vòng) xoay quanh trục đứng Y. Cung trước gần camera chữ to rõ nét tiếng Việt và icon trái tim, cung sau nhỏ và nén lại theo phối cảnh xa gần.
- **Luồng nối**: Nối từ chóp nhọn trái tim xuống tâm đĩa, dạng phễu xoắn ốc nhẹ với các hạt sáng và ký tự nhỏ lấp lánh.
- **Hậu cảnh**: Không gian tối sâu thẳm với bụi sao mờ li ti.

## 2. Các điểm loại trừ theo yêu cầu
- Nút play và con trỏ chuột trong video là giao diện quay màn hình người dùng, không thuộc sản phẩm $\to$ Đã loại trừ.
- Dòng chữ tiêu đề "Quà 20/10 cho công chúa của anh" và watermark "Sao Nào" không thuộc sản phẩm $\to$ Đã loại trừ.
- Không có âm thanh, không có ảnh cá nhân, không có thao tác click/hold làm nổ tim.
