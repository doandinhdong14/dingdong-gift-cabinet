import React from 'react';
import { BookOpen, PlusCircle, Copy, Sparkles, CheckCircle2, Layers } from 'lucide-react';

export const GuidePage: React.FC = () => {
  return (
    <div className="guide-page-container">
      <div className="guide-header">
        <div className="guide-header-icon">
          <BookOpen size={28} />
        </div>
        <div className="guide-header-text">
          <h2>Hướng dẫn sử dụng & Tái sử dụng Tủ đồ</h2>
          <p>
            Tài liệu hướng dẫn quy trình vận hành, bổ sung tài nguyên 3D mới và tích hợp vào các tấm thiệp chúc mừng.
          </p>
        </div>
      </div>

      <div className="guide-sections-grid">
        {/* Section 1: Workflow */}
        <section className="guide-card">
          <div className="guide-card-header">
            <Sparkles size={20} className="text-primary" />
            <h3>1. Luồng cốt lõi của Tủ đồ</h3>
          </div>
          <div className="guide-card-body">
            <ol className="guide-steps-list">
              <li>
                <strong>Chọn mẫu:</strong> Mở Bộ sưu tập, duyệt theo danh mục hoặc tìm kiếm theo tên/thẻ.
              </li>
              <li>
                <strong>Xem & Tinh chỉnh:</strong> Xoay camera 3D, đổi màu sắc, điều chỉnh độ bóng, biên độ lơ lửng, nhịp tim hoặc tốc độ xoay trong thời gian thực.
              </li>
              <li>
                <strong>Lưu biến thể:</strong> Đặt tên và lưu lại cấu hình đẹp vào bộ nhớ trình duyệt để tái sử dụng.
              </li>
              <li>
                <strong>Sao chép mã nguồn:</strong> Bấm <em>Sao chép JSX</em> hoặc <em>Hướng dẫn cho AI</em> để đưa thẳng vào dự án thiệp chúc mừng.
              </li>
            </ol>
          </div>
        </section>

        {/* Section 2: Adding assets */}
        <section className="guide-card">
          <div className="guide-card-header">
            <PlusCircle size={20} className="text-primary" />
            <h3>2. Quy trình thêm tài nguyên mới</h3>
          </div>
          <div className="guide-card-body">
            <p>
              Để bảo vệ chất lượng đồ họa và tính nhất quán, mỗi tài nguyên mới cần tuân thủ 5 bước chuẩn hóa (chi tiết tại <code>docs/ADDING_ASSETS.md</code>):
            </p>
            <ul className="guide-check-list">
              <li>
                <CheckCircle2 size={16} /> <strong>Tạo thư mục ID:</strong> Đặt tên định danh duy nhất (ví dụ: <code>heart-01</code>, <code>envelope-01</code>).
              </li>
              <li>
                <CheckCircle2 size={16} /> <strong>Viết Component thuần:</strong> Cao 2 đơn vị, tâm tại gốc (0,0,0), mặt trước hướng +Z. Không tự tạo Canvas/đèn/UI bên trong component.
              </li>
              <li>
                <CheckCircle2 size={16} /> <strong>Khai báo Manifest & Presets:</strong> Khai báo phiên bản, loại 3D/2D, giấy phép, tác giả và các biến thể màu mặc định.
              </li>
              <li>
                <CheckCircle2 size={16} /> <strong>Đăng ký vào Registry:</strong> Dùng dynamic import để lazy load component khi người dùng mở xưởng.
              </li>
              <li>
                <CheckCircle2 size={16} /> <strong>Kiểm duyệt (Review):</strong> Đặt trạng thái <code>review</code> và chỉ chuyển sang <code>approved</code> khi chủ dự án duyệt trực quan.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3: Reuse in card */}
        <section className="guide-card">
          <div className="guide-card-header">
            <Copy size={20} className="text-primary" />
            <h3>3. Tích hợp chi tiết vào thiệp chúc mừng</h3>
          </div>
          <div className="guide-card-body">
            <p>
              Xem hướng dẫn chi tiết tại <code>docs/REUSE_IN_CARD.md</code>. Cần lưu ý các điểm mấu chốt sau:
            </p>
            <div className="guide-callout info">
              <strong>Lưu ý quan trọng:</strong> File JSON chỉ là cấu hình tham số (màu sắc, tỉ lệ, tốc độ), không chứa hình học 3D. Muốn sử dụng trên thiệp, bạn cần sao chép cả thư mục component và MotionRig sang dự án thiệp.
            </div>
            <pre className="guide-code-box">
              <code>{`// 1. Cài đặt thư viện:
npm install three @react-three/fiber @react-three/drei

// 2. Tái sử dụng component gốc với MotionRig:
<Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
  <ambientLight intensity={0.7} />
  <directionalLight position={[3, 5, 4]} intensity={1.2} />
  <MotionRig transform={config.transform} motion={config.motion}>
    <MyAsset color={config.appearance.color} />
  </MotionRig>
</Canvas>`}</code>
            </pre>
          </div>
        </section>

        {/* Section 4: Specifications */}
        <section className="guide-card">
          <div className="guide-card-header">
            <Layers size={20} className="text-primary" />
            <h3>4. Quy ước đồ họa & Kỹ thuật</h3>
          </div>
          <div className="guide-card-body">
            <table className="guide-table">
              <thead>
                <tr>
                  <th>Quy ước</th>
                  <th>Giá trị chuẩn</th>
                  <th>Mục đích</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Hệ tọa độ</td>
                  <td>Y hướng lên, +Z mặt trước</td>
                  <td>Chuẩn hóa góc nhìn và xoay</td>
                </tr>
                <tr>
                  <td>Kích thước chuẩn</td>
                  <td>Chiều cao 2.0 đơn vị</td>
                  <td>Dễ canh chỉnh tỉ lệ (scale=1)</td>
                </tr>
                <tr>
                  <td>Chuyển động (Motion)</td>
                  <td>MotionRig độc lập</td>
                  <td>Không làm sai lệch vị trí gốc của mesh</td>
                </tr>
                <tr>
                  <td>Nhịp tim (Heartbeat)</td>
                  <td>Chu kỳ kép lub-dub</td>
                  <td>Chân thực, không cộng dồn frame</td>
                </tr>
                <tr>
                  <td>Ánh sáng</td>
                  <td>Studio 3 điểm mềm</td>
                  <td>Đọc rõ hình khối, không cháy màu</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default GuidePage;
