# NHIỆM VỤ PHÁT TRIỂN & CẢI TIẾN HIỆU ỨNG (PHIÊN BẢN HẠT MỊN & ĐẾ 10 TẦNG)

TASK ID: task-particle-heart-text-vortex
EFFECT ID: particle-heart-text-vortex
TÊN HIỆU ỨNG: Trái tim hạt sáng trên đế chữ xoay
KIND: scene
RENDERER: r3f (Three.js / React Three Fiber)
STATUS: review

## 1. MỤC TIÊU CẢI TIẾN MỚI NHẤT
Theo yêu cầu đối chiếu với video gốc `chrome_LExBXDcfHx.mp4` và sửa chữa bản lỗi `chrome_DmAF25Awv1.mp4`:
1. **Trái tim hạt mịn 3D tinh khiết**:
   - Loại bỏ hoàn toàn cảm giác "lông/gai sáng trắng": TẮT vệt dài, TẮT trail, TẮT hiệu ứng sợi `LineSegments`, KHÔNG dựng gai theo normal bề mặt, KHÔNG hướng sprite thành tia xuyên tâm.
   - Sử dụng 13.500 hạt dạng chấm nhỏ gần tròn (1–2 CSS pixel), phân bố thể tích 3D bằng Taubin Rejection Sampling.
   - Xóa bỏ triệt để hiện tượng 2 "con mắt"/tâm xoáy tối.
   - Màu sắc chủ đạo hồng sen (`#ff2d7a`) và hồng phấn (`#f472b6`), điểm xuyết ánh vàng champagne và trắng lấp lánh nhẹ nhàng.
   - Giữ các khe tối giữa các hạt để thấy rõ cấu trúc thể tích 3D xuyên thấu.
   - Chuyển động vi mô tại chỗ trơn tru theo thời gian, kết hợp nhịp phồng-thu rất nhẹ (~2% biên độ, chu kỳ ~3 giây).
2. **Đế chữ xoay 10 tầng dày dặn có chiều sâu**:
   - Tăng số vòng từ 5 lên 10 vòng quỹ đạo đồng tâm ($R = 1.55$ đến $0.36$), khoảng cách gần nhau (~0.13) giúp đĩa chữ liên tục, dày dặn.
   - Phân tầng chênh cao (3D concave saucer / đĩa trũng): Các vòng trong hơi trũng dần xuống tạo chiều sâu không gian chân thực.
   - Chữ tiếng Việt rõ nét, tỷ lệ 1:1 chuẩn xác trên từng vòng.
   - Xoáy bụi sao và ký tự nhỏ ở mắt tâm đĩa.
   - Vòng chữ xoay so le đa chiều quanh trục $Y$.
3. **Luồng ký tự nối hai phần tự nhiên**:
   - Tản nhẹ từ chóp nhọn tim ($Y = -0.18$) xuống tâm đĩa ($Y = -1.25$).
   - Độ rộng tản ngang chiếm 18–24% chiều rộng tim (không thành ống cứng).
   - Ký tự và biểu tượng trái tim rơi nhào lộn liên tục, không xuất hiện theo đợt hay teleport.
4. **Căn khung chuẩn & Chuyển động nội tại độc lập**:
   - Camera cố định ở góc chính diện.
   - Đảm bảo ít nhất 8 giây chuyển động nội tại thuần túy khi camera đứng yên hoàn toàn.
   - Căn lề an toàn: mép trên của tim và mép dưới của đĩa có khoảng thở rộng rãi, không bị cắt hay chạm viền trên mọi khung hình (536×750, 694×648, mobile dọc).

## 2. CẤU TRÚC GÓI ĐÃ TRIỂN KHAI
- `manifest.json`: Metadata chuẩn SDK v1, ID: `particle-heart-text-vortex`.
- `config.ts`: Defaults 11.000 hạt tim, 10 vòng đế, cấu hình codec an toàn.
- `controls.ts`: 18 bộ tham số điều khiển trực quan trên giao diện studio.
- `presets.ts`: 4 bộ preset phối màu (`romantic-pink`, `mystic-purple`, `golden-elegance`, `calm-minimal`).
- `presentation.ts`: Camera góc nhìn chính diện FOV 44, khoảng cách $Z = 5.6$.
- `components/ParticleHeart3D.tsx`: Hạt mịn 3D Taubin, Points thuần tuý.
- `components/VortexTextDisk.tsx`: 10 tầng cylinder hở hai đầu, texture canvas 2048x112 chuẩn 1:1, chênh cao 3D.
- `components/ConnectingStream.tsx`: Luồng ký tự và stardust hình phễu mềm mại.
- `components/StarDust.tsx`: Bụi sao không gian hậu cảnh.
- `Scene.tsx`: Scene tổng hợp R3F căn khung responsive.
- `tests/effect.test.ts`: Bộ 4 bài test unit kiểm thử codec và presets.
- `QA.md` & `HANDOFF.md`: Tài liệu kiểm thử và bàn giao.
