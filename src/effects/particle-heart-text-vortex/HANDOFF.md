# TÀI LIỆU BÀN GIAO HIỆU ỨNG (HANDOFF)

GÓI HIỆU ỨNG: `particle-heart-text-vortex`
TÊN: Trái tim hạt sáng trên đế chữ xoay
DỰ ÁN: DINGDONG GIFT

## 1. THÔNG TIN GÓI
- **Package Path**: `src/effects/particle-heart-text-vortex/`
- **Manifest ID**: `particle-heart-text-vortex`
- **Renderer**: `r3f` (React Three Fiber / Three.js)
- **Status**: `review`

## 2. NĂNG LỰC HIỂN THỊ & CẢI TIẾN
- **Trái tim hạt mịn 3D tinh khiết**:
  - Dựng bằng 13.500 hạt chấm nhỏ tròn mềm mại, không gai, không sợi, không vệt nứt.
  - Phân bố thể tích 3D đều đặn, cấu trúc xuyên thấu với các khoảng tối tự nhiên.
  - Nhịp thở tự nhiên rất khẽ (~2% biên độ, chu kỳ ~3 giây).
- **Đế chữ xoay 10 tầng dày dặn**:
  - 10 vòng đồng tâm xoay so le đa chiều quanh trục $Y$.
  - Cấu trúc đĩa trũng 3D tạo chiều sâu phối cảnh xa gần rõ rệt.
  - Chữ tiếng Việt sắc nét, chuẩn tỷ lệ 1:1, viền phát quang hồng rực rỡ và các emoji trái tim.
- **Luồng ký tự nối hình phễu**:
  - Rơi nhào lộn liên tục, mượt mà từ chóp tim xuống tâm đĩa, độ tản ngang chiếm 18–24% chiều rộng tim.
- **Khung nhìn cân đối**:
  - Chừa khoảng thở rộng rãi cả phía trên tim và dưới đĩa, không chạm viền trên mọi khung hình.

## 3. LỆNH XÁC THỰC
- Chạy kiểm tra TypeScript riêng cho package:
  ```powershell
  cd dingdong-gift-cabinet
  node .local/particle-heart-text-vortex/check_ts.mjs
  ```
- Chạy unit tests:
  ```powershell
  node ./node_modules/vitest/vitest.mjs run src/effects/particle-heart-text-vortex/tests/effect.test.ts
  ```
- Mở xem trực tiếp:
  ```powershell
  npm run effects:preview -- --id particle-heart-text-vortex --port 5211
  ```
- URL: `http://localhost:5211/#/effects/particle-heart-text-vortex`
