# DingDong Gift — Tủ đồ sáng tạo

Ứng dụng web nội bộ dùng để lưu trữ, xem trước 3D, tinh chỉnh tham số và tái sử dụng các chi tiết trang trí cho thiệp chúc mừng.

Dự án hiện đã hoàn thành **GIAI ĐOẠN B**:
- Hoàn thiện toàn bộ bộ khung tủ đồ, gallery, sân khấu 3D studio, bộ điều khiển tham số, preset localStorage, import/export JSON, sinh snippet JSX/AI.
- Tạo chi tiết 3D chính thức đầu tiên: **Trái tim mẫu 1 (`heart-01`)** với hình khối phồng mềm procedural, bề mặt satin hồng san hô, rãnh trên mềm, đỉnh dưới bo nhẹ, không seam, 3 preset màu sắc mặc định và chuyển động lơ lửng, nhịp tim kép (lub-dub), tự xoay độc lập.
- Tích hợp mẫu vào thiệp chúc mừng trên trang **"Thử trên thiệp"** với 2 instance độc lập về màu sắc, kích thước và chuyển động.
- Trạng thái hiện tại: `review` để chủ dự án duyệt hình dáng 3D.

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
  VITE v6.4.6  ready in 244 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

### Bước 3: Mở và trải nghiệm ứng dụng
- Giữ phím `Ctrl` và nhấp vào liên kết `http://localhost:5173/` hoặc copy dán vào trình duyệt của bạn.
- Khi mở ứng dụng:
  - **Bộ sưu tập**: Thẻ **Trái tim mẫu 1** xuất hiện nổi bật với nhãn trạng thái *Chờ duyệt (Review)* và hình thu nhỏ hồng san hô. Nhấn nút **"Xem mẫu"** để vào xưởng 3D.
  - **Xưởng 3D & Bảng điều khiển**: Xoay ngắm trái tim ở mọi góc nhìn (chính diện, 45 độ, cạnh bên, mặt sau), thử 3 chế độ nền (Sáng, Tối, Ô caro), đổi màu sang "Đỏ yêu thương" hoặc "Tím mộng mơ", bật nhịp tim hoặc tự xoay.
  - **Biến thể**: Bấm nút **"Lưu biến thể"** để lưu lại cấu hình riêng vào trình duyệt. Thử đổi tên, xóa, hoặc xuất/nhập file JSON sao lưu.
  - **Cách sử dụng**: Xem trước và sao chép đoạn mã React Three Fiber JSX sẵn sàng chạy hoặc câu lệnh chỉ dẫn cho AI ghép thiệp.
  - **Thử trên thiệp**: Chuyển sang mục **"Thử trên thiệp"** trên thanh điều hướng để xem trước mô phỏng tấm thiệp chúc mừng với 2 instance `Heart01` hoạt động đồng thời và độc lập.

### Cách dừng máy chủ:
Trong cửa sổ dòng lệnh, bấm tổ hợp phím `Ctrl + C` và gõ `Y` (hoặc Enter) để dừng server.

---

## 3. Hướng dẫn xem thử trên điện thoại cùng mạng Wi-Fi

Vite đã được cấu hình cờ `host: true` trong file cấu hình. Bạn có thể xem trực tiếp ứng dụng trên điện thoại di động mà không cần cáp nối:

1. Đảm bảo điện thoại và máy tính đang kết nối **cùng một mạng Wi-Fi nội bộ**.
2. Khi chạy `npm run dev`, hãy nhìn vào dòng `Network:` (ví dụ: `http://192.168.1.15:5173/`).
3. Mở trình duyệt Safari hoặc Chrome trên điện thoại, nhập chính xác địa chỉ `http://192.168.x.x:5173/`.

---

## 4. Các lệnh kiểm tra chất lượng (Scripts)

Dự án cung cấp đầy đủ các script kiểm định chất lượng:

```bash
# Kiểm tra an toàn kiểu dữ liệu TypeScript (0 lỗi)
npm run typecheck

# Kiểm tra cú pháp và quy chuẩn mã nguồn ESLint (0 lỗi)
npm run lint

# Chạy toàn bộ 51 ca kiểm thử tự động (Vitest - 100% PASS)
npm test

# Đóng gói sản phẩm hoàn thiện cho môi trường tĩnh (Production Build)
npm run build

# Xem thử bản đóng gói production
npm run preview
```

---

## 5. Tài liệu kỹ thuật đi kèm

- [docs/ADDING_ASSETS.md](file:///c:/Users/Administrator/Downloads/c%C3%A1c%20chi%20ti%E1%BA%BFt%20trong%20thi%E1%BB%87p/docs/ADDING_ASSETS.md): Quy trình 5 bước thêm tài nguyên mới và quy tắc bảo vệ mẫu đã duyệt.
- [docs/REUSE_IN_CARD.md](file:///c:/Users/Administrator/Downloads/c%C3%A1c%20chi%20ti%E1%BA%BFt%20trong%20thi%E1%BB%87p/docs/REUSE_IN_CARD.md): Hướng dẫn tái sử dụng `Heart01` và `MotionRig` trong dự án thiệp chúc mừng.
- [docs/QA.md](file:///c:/Users/Administrator/Downloads/c%C3%A1c%20chi%20ti%E1%BA%BFt%20trong%20thi%E1%BB%87p/docs/QA.md): Báo cáo chi tiết kết quả kiểm định chất lượng và kích thước hình học thực đo của `heart-01`.
- [src/gift-library/objects/heart-01/README.md](file:///c:/Users/Administrator/Downloads/c%C3%A1c%20chi%20ti%E1%BA%BFt%20trong%20thi%E1%BB%87p/src/gift-library/objects/heart-01/README.md): Tài liệu kỹ thuật chi tiết của `heart-01`.
