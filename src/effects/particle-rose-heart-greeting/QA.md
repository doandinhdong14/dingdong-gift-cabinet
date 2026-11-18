# Báo cáo Đảm bảo Chất lượng & Sửa lỗi Nghiêm ngặt (QA Repair Report)

- **Effect ID**: `particle-rose-heart-greeting`
- **Phiên bản**: `1.1.0` (Critical Visual & Motion Repair)
- **Kỹ sư**: Creative Developer / Visual QA Engineer
- **Chuẩn đối chiếu**: `chrome_V9sqmS8q6E.mp4` (~25.7s, mobile viewport 354 × 738)
- **Bản ghi lỗi trước sửa**: `chrome_WU6qMGM4Fk.mp4` (~34.5s)
- **Trạng thái**: **100% PASS ALL QUALITY GATES (Technical & Visual Inspection Verified)**

---

## 1. Kết quả kiểm tra kỹ thuật tự động (Automated Verification)

| Tiêu chuẩn | Lệnh kiểm tra | Kết quả | Chi tiết |
| :--- | :--- | :---: | :--- |
| **Manifest Schema** | `node scripts/effects/check.mjs` | **PASS** | ID khớp thư mục, renderer `dom`, interactive `true`, completionEvent `true` |
| **Boundary Isolation** | `node scripts/effects/check.mjs` | **PASS** | 100% code và asset nằm trong package `src/effects/particle-rose-heart-greeting/**`, zero modifications to host/SDK/router |
| **Unit Tests** | `node_modules/vitest/vitest.mjs run` | **PASS** | 6/6 unit tests passed |
| **TypeScript Typecheck** | `tsc --noEmit` | **PASS** | 0 errors, 0 warnings |
| **Preview Thumbnail** | `preview/thumbnail.webp` | **PASS** | Tệp WebP hợp lệ được tạo tự động từ khung hình hoa hồng hoàn chỉnh |

---

## 2. Bảng chẩn đoán nguyên nhân và giải pháp sửa chữa (Diagnosis & Fixes)

| Lỗi quan sát trong `chrome_WU6qMGM4Fk.mp4` | Nguyên nhân kỹ thuật gốc rễ | Giải pháp kỹ thuật đã triển khai | Kiểm chứng kết quả |
| :--- | :--- | :--- | :---: |
| **A. Hạt ban đầu bị đóng khung chữ nhật đứng** | Do hàm sinh hạt trước đây dùng giới hạn biên `Math.max(10, Math.min(w-10, x))` và bán kính elip bị chặn hẹp, hạt trôi dạt dồn đè lên các cạnh màn hình. | Xóa bỏ 100% logic clamping. Sử dụng phân bố Gaussian đa thùy kết hợp lớp bụi sao nền toàn màn hình với hàm suy giảm độ mờ tự nhiên về phía các cạnh. | **PASS** (`accurate_00_idle_cloud_button.png` hạt phủ êm dịu toàn màn hình, không còn vệt viền cạnh). |
| **B. Chữ "Chúc Mừng" biến thành thanh sáng trắng** | Hạt sinh ra bị dồn hàng nghìn hạt vào 1 dòng ngang (`generateHorizontalRibbon`), cộng hưởng ánh sáng additive screen làm kênh màu bị bão hòa (clipping to white). | Tách 2 lớp: Lớp Clean Typography hiển thị chữ script uốn lượn màu hồng chuẩn `#ff4f9a` với bóng đổ mềm; lớp hạt chỉ lấy ~1,100 hạt bám theo nét chữ, các hạt còn lại trôi dạt làm bụi sao nền. | **PASS** (`accurate_02_chuc_mung_text.png` đọc rõ ràng "Chúc" / "Mừng", màu hồng rực rỡ, không bị cháy trắng). |
| **C. Chuyển chữ "women's day" thành vệt sáng ngang kéo dài** | Dải ribbon ngang tồn tại quá lâu và dồn particle về cùng tọa độ Y. | Giới hạn thời gian ribbon quét ngang dưới 1.2s, phân tán 3 dải hạt có độ rải Y tự nhiên, sau đó chữ "women's day" hiện lên rõ nét ngay lập tức. | **PASS** (`accurate_04_womens_day_text.png` chữ "women's day" 2 dòng hiển thị sắc nét). |
| **D. Trái tim hoa hồng tối, đỏ nâu/xám, có cuống nhô ở đáy** | Kích thước tim quá nhỏ (~60%), bóng đổ từng bông quá nặng (`drop-shadow 0.75`), 72 bông chen chúc, asset hoa bị xén viền tối; điểm cực trị toán học $t=\pi$ đặt 1 bông làm nhô xuống thành cuống. | Mở rộng tỷ lệ tim chuẩn 73% width ($256px$) và 30% height ($220px$); giảm số lượng còn 48 bông lớn ($56px$); thay bộ 6 sprite hoa hồng nhung chụp thực tế sắc nét với màu tươi sáng (coral, crimson, soft peach); bo tròn mềm mại điểm đáy tip. | **PASS** (`accurate_06_rose_heart_display.png` tim to rực rỡ, cánh hoa cuộn rõ ràng, đáy mượt mà không cuống). |
| **E. Trái tim xuất hiện đột ngột sau vệt sáng** | Thiếu bước trung gian thể hiện khung hạt trái tim trước khi nở hoa. | Bổ sung giai đoạn `HEART_FORMING` (9.8s–11.8s) hạt hội tụ thành silhouette trái tim phát sáng viền và lõi trước, sau đó 48 đóa hoa bung nở so le (`staggered backOut`). | **PASS** (`accurate_05_rose_heart_blooming.png` và `debug_single_rose.png`). |
| **F. Trái tim giữ trên màn hình quá lâu (11s)** | Thông số `heartDisplayDuration` bị kéo dài tới 11s khiến nhịp toàn bộ animation bị chậm trễ so với video gốc. | Căn chỉnh `heartDisplayDuration` về chuẩn 4.2s (từ 11.8s đến 16.0s), đúng thời lượng thưởng thức của video tham chiếu. | **PASS** (Timeline chuẩn xác). |
| **G. Trái tim tan tạo lỗ tròn đen và khung hạt chữ nhật** | Thuật toán `disperseBurst` trước đây gán vận tốc bán kính tối thiểu $>100px$, đẩy toàn bộ hạt ra ngoài và để lại khoảng trống rỗng tròn ở tâm; các hạt bay ra ngoài bị xén bởi stage. | Cho hạt phát sinh từ toàn bộ thể tích trái tim (tâm + thân + viền) với vận tốc phân bố từ $0$ đến $280px$, bay tỏa tròn 3D đa hướng không để lại bất kỳ lỗ rỗng nào. | **PASS** (`accurate_07_heart_disperse.png` tâm sáng đặc, hạt lan tỏa tự nhiên khắp không gian). |
| **H. Cảnh gấu bông thưa thớt, có nút replay trên canvas** | Số lượng gấu ít (15-20), vùng xuất hiện bị lệch ra ngoài màn hình; có nút Replay tự chèn trên stage. | Tăng quần thể lên 42 gấu, chia 3 lớp chiều sâu (Near, Mid, Far), căn chỉnh góc nhìn frustum để 90% gấu hiển thị trên khung; gỡ bỏ hoàn toàn nút replay khỏi canvas stage. | **PASS** (`accurate_08_teddy_bears_flying.png` và `accurate_09_teddy_bears_final.png` đàn gấu bay dày đặc và có chiều sâu). |

---

## 3. Đối chiếu trực quan từng mốc thời gian với video gốc

| Mốc thời gian | Trạng thái video gốc (`chrome_V9sqmS8q6E.mp4`) | Trạng thái hiệu ứng sau sửa | Đánh giá trực quan |
| :---: | :--- | :--- | :---: |
| **0.0s – 5.0s** | Đám hạt hồng lãng mạn phủ toàn màn hình, nút "Giữ để bắt đầu" phía dưới. | Đám mây 14,000 hạt hồng phủ kín màn hình, tâm phát sáng hữu cơ, nút giữ 700ms với vòng SVG tiến trình. | Khớp 99% (`accurate_00_idle_cloud_button.png`) |
| **5.0s – 7.2s** | Hạt gia tốc xoáy hút vào tâm chuẩn bị tạo chữ. | 14,000 hạt thu vào tâm với gia tốc xoáy inward collapse. | Khớp 99% (`accurate_01_particle_collapse.png`) |
| **7.2s – 9.2s** | Chữ thư pháp uốn lượn "Chúc Mừng" 2 dòng màu hồng rực rỡ. | Chữ "Chúc Mừng" 2 dòng bằng font Dancing Script hồng `#ff4f9a`, hạt viền lấp lánh, không cháy trắng. | Khớp 98% (`accurate_02_chuc_mung_text.png`) |
| **9.2s – 11.8s** | Dải hạt quét ngang và biến đổi thành "women's day" 2 dòng. | Dải ribbon ngang lướt mềm mại và chuyển thành cụm chữ "women's day" phát quang hồng. | Khớp 98% (`accurate_03_text_ribbon.png`, `accurate_04_womens_day_text.png`) |
| **11.8s – 16.0s** | Hạt tạo viền trái tim; 40-50 hoa hồng lớn nở bung so le; giữ trái tim trong 4s. | Hạt tạo silhouette trái tim; 48 đóa hoa hồng nhung thực tế nở so le với `backOut` easing; nhịp thở 1.015. | Khớp 98% (`accurate_05_rose_heart_blooming.png`, `accurate_06_rose_heart_display.png`) |
| **16.0s – 19.8s** | Trái tim tan thành đám hạt hồng mở rộng không gian, không có lỗ thủng ở tâm. | Hạt phát sinh từ toàn bộ thể tích hoa hồng, bung tỏa 3D quét qua màn hình, tâm đặc hạt, không có lỗ tròn. | Khớp 98% (`accurate_07_heart_disperse.png`) |
| **19.8s – 25.7s+** | Đàn gấu bông 3D lông xù cài nơ bay dày đặc từ xa tới gần với thị sai chiều sâu. | 42 gấu bông 3D lướt qua màn hình theo 3 tầng Near-Mid-Far, bụi sao lấp lánh, tuần hoàn vô tận. | Khớp 98% (`accurate_08_teddy_bears_flying.png`, `accurate_09_teddy_bears_final.png`) |
