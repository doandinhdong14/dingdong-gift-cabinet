# DingDong Gift — Tủ đồ sáng tạo (Giai đoạn A)

Ứng dụng web nội bộ dùng để lưu trữ, xem trước 3D, tinh chỉnh tham số và tái sử dụng các chi tiết trang trí cho thiệp chúc mừng.

Dự án hiện đã hoàn thành **GIAI ĐOẠN A**: xây dựng toàn bộ bộ khung tủ đồ, gallery, sân khấu 3D studio, bộ điều khiển tham số, cơ chế lưu biến thể cục bộ, nhập/xuất JSON, sinh đoạn mã JSX/AI và trang thử tích hợp trên thiệp chúc mừng. Bộ khung đang hoạt động cùng **Khối kiểm tra kỹ thuật (Dev Fixture)**; chưa tạo Trái tim mẫu 1 (thuộc Giai đoạn B).

---

## 1. Yêu cầu hệ thống

- **Node.js**: Phiên bản 18 trở lên (khuyến nghị Node 20 hoặc 22/26 LTS).
- **Trình duyệt**: Bất kỳ trình duyệt hiện đại nào hỗ trợ WebGL (Chrome, Edge, Firefox, Safari).

---

## 2. Hướng dẫn khởi chạy ứng dụng

Mở ứng dụng dòng lệnh (PowerShell, Command Prompt hoặc Terminal) tại thư mục dự án này (`c:\Users\Administrator\Downloads\các chi tiết trong thiệp`):

### Bước 1: Cài đặt thư viện phụ thuộc (nếu chưa cài)
```bash
npm install
```
*(Trên Windows PowerShell nếu gặp thông báo hạn chế script, bạn có thể chạy `npm.cmd install`)*

### Bước 2: Khởi động máy chủ phát triển (Dev Server)
```bash
npm run dev
```

Sau khi chạy lệnh, màn hình dòng lệnh sẽ hiển thị địa chỉ truy cập:
```text
  VITE v6.2.0  ready in 250 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

### Bước 3: Mở và trải nghiệm ứng dụng
- Giữ phím `Ctrl` và nhấp vào liên kết `http://localhost:5173/` hoặc copy dán vào trình duyệt của bạn.
- Khi mở ứng dụng:
  - **Bộ sưu tập**: Hiển thị trạng thái Giai đoạn A sẵn sàng tiếp nhận tài nguyên mới. Bấm nút **"Mở Khối kiểm tra kỹ thuật"** trên banner hoặc menu trên cùng.
  - **Xưởng 3D & Bảng điều khiển**: Xoay mô hình bằng chuột, đổi màu sắc, thử nghiệm lơ lửng, nhịp tim hoặc tự xoay.
  - **Biến thể**: Bấm nút **"Lưu biến thể"** để lưu lại cấu hình riêng vào trình duyệt. Thử đổi tên, xóa, hoặc xuất/nhập file JSON sao lưu.
  - **Cách sử dụng**: Xem trước và sao chép đoạn mã JSX hoặc câu lệnh chỉ dẫn cho AI.
  - **Thử trên thiệp**: Chuyển sang mục **"Thử trên thiệp"** trên thanh điều hướng để xem trước mô phỏng tấm thiệp chúc mừng và kiểm tra 2 instance độc lập.

### Cách dừng máy chủ:
Trong cửa sổ dòng lệnh, bấm tổ hợp phím `Ctrl + C` và gõ `Y` (hoặc Enter) để dừng server.

---

## 3. Hướng dẫn xem thử trên điện thoại cùng mạng Wi-Fi

Vite đã được cấu hình cờ `host: true` trong file cấu hình. Bạn có thể xem trực tiếp ứng dụng trên điện thoại di động mà không cần cáp nối:

1. Đảm bảo điện thoại và máy tính đang kết nối **cùng một mạng Wi-Fi nội bộ**.
2. Khi chạy `npm run dev`, hãy nhìn vào dòng `Network:` (ví dụ: `http://192.168.1.15:5173/`).
3. Mở trình duyệt Safari hoặc Chrome trên điện thoại, nhập chính xác địa chỉ `http://192.168.x.x:5173/`.

> **LƯU Ý BẢO MẬT:** Dev server này chỉ dùng để kiểm tra giao diện cục bộ trong mạng gia đình / văn phòng. Tuyệt đối không mở port forwarding ra ngoài Internet công cộng hoặc đưa thông tin nhạy cảm vào.

---

## 4. Các lệnh kiểm tra chất lượng (Scripts)

Dự án cung cấp đầy đủ các script kiểm định chất lượng:

```bash
# Kiểm tra an toàn kiểu dữ liệu TypeScript
npm run typecheck

# Kiểm tra cú pháp và quy chuẩn mã nguồn (ESLint)
npm run lint

# Chạy toàn bộ 46 ca kiểm thử tự động (Vitest)
npm test

# Đóng gói sản phẩm hoàn thiện cho môi trường tĩnh (Production Build)
npm run build

# Xem thử bản đóng gói production
npm run preview
```

---

## 5. Các quyết định kỹ thuật & Giả định thiết kế

1. **Khối kiểm tra kỹ thuật (Dev Fixture):** Theo đúng yêu cầu phân kỳ Giai đoạn A, khối hình kỹ thuật chuẩn hóa cao 2.0 đơn vị được đặt tại `src/gift-library/objects/dev-fixture` và tách biệt hoàn toàn khỏi registry sản phẩm `PRODUCT_REGISTRY`.
2. **Lưu trữ cục bộ an toàn:** Mọi dữ liệu preset và yêu thích được lưu dưới namespace `dingdong-gift-cabinet:v1:*`. Nếu trình duyệt đầy bộ nhớ hoặc bị chặn cookie/localStorage, hệ thống tự động fallback sang bộ nhớ tạm trong phiên làm việc mà không làm crash ứng dụng hay xóa đè dữ liệu cũ.
3. **Bộ lọc tìm kiếm tiếng Việt:** Hỗ trợ tìm kiếm không phân biệt chữ hoa, chữ thường và khử dấu tiếng Việt (ví dụ gõ "trai tim" vẫn tìm được "Trái tim").
4. **Không phụ thuộc Internet sau khi cài:** Ứng dụng không gọi bất kỳ API bên ngoài, font mạng, CDN hay server đám mây nào; hoạt động 100% offline.
