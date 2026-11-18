# Bông hồng mở quà (Rose Reveal 01) — `rose-reveal-01`

Mẫu trải nghiệm mở quà 3D tương tác lãng mạn dành cho DingDong Gift.

## Đặc điểm nổi bật
- **Bông hồng 3D thực thụ**: Tạo hình bằng toán học tham số (procedural parametric surface) với 29 cánh hoa xếp 5 lớp so le, lòng cánh cong lõm mềm mại, mép lượn sóng tự nhiên, đổ bóng 2 mặt (DoubleSide) và chuyển màu từ lõi đậm đến viền phát sáng.
- **Thân và lá liền mạch**: Đế đài hoa, 5 lá đài uốn cong, thân cây cong nhẹ tự nhiên và 3 tầng lá có gân giữa tinh tế.
- **Chuyển động nở từng lớp**: Quá trình nở điều khiển bằng tiến trình `bloomProgress` liên tục từ 0 đến 1, lớp ngoài nở trước, lớp trong nở sau, giữ độ sâu tâm hoa.
- **Cơn mưa cánh hoa bay**: 60–90 cánh hoa 3D phân lớp gần/xa, tỏa ra theo lực ban đầu và trôi cong rơi nhẹ với chuyển động xoay đa trục.
- **Tương tác đa điểm**: Chạm vào đầu bông hoa hoặc bấm nút mở quà đều kích hoạt luồng chuyển cảnh mượt mà.
- **Chuyển trang đúng chuẩn**: Callback `onRevealComplete` phát đúng 1 lần, hỗ trợ trang đích demo hoặc tích hợp scene `love-universe-01`.
- **Bảng điều khiển chuyên sâu**: Tùy chỉnh màu sắc cánh/thân/nền, thời gian nở, số lượng cánh bay, tốc độ tỏa, rơi, xoay, chế độ kiểm tra tiến trình nở 0–100% và góc nhìn tự do 3D Orbit.
- **Khả năng tiếp cận & Hiệu năng**: Khóa kích hoạt lặp, điều hướng bàn phím, tạm dừng khi chuyển tab, hỗ trợ `prefers-reduced-motion`.

## Cấu trúc thư mục
- `manifest.ts`: Khai báo siêu dữ liệu asset cho DingDong Gift.
- `types.ts`: Định nghĩa kiểu dữ liệu `RoseRevealConfig`, layer cánh hoa và trạng thái.
- `presets.ts`: Cấu hình mặc định và 4 biến thể preset phong phú.
- `roseGeometry.ts`: Toán học sinh hình học cánh hoa, đài, thân, lá và cánh hoa bay.
- `RosePetalMesh.tsx`: Nhóm cánh hoa 5 tầng chuyển động nở.
- `RoseStemAssembly.tsx`: Đài hoa, thân uốn lượn và 3 lá.
- `FlyingPetals.tsx`: Hệ thống cánh hoa bay tối ưu bằng InstancedMesh.
- `AmbientDustParticles.tsx`: Hạt bụi sáng lơ lửng trong không gian ấm áp.
- `RoseRevealScene.tsx`: Toàn bộ cảnh 3D và ánh sáng studio.
- `RoseRevealUI.tsx`: Giao diện lời nhắn, nút bấm và thẻ quà tặng đích.
- `RoseReveal01.tsx`: Thành phần xuất chuẩn cho Cabinet viewer.
- `RoseRevealStandalone.tsx`: Thành phần trọn gói độc lập sẵn sàng nhúng vào bất kỳ thiệp nào.
- `RoseParameterPanel.tsx`: Bảng điều khiển tham số trong xưởng tủ đồ.
