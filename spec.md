# DingDong Gift — Tủ đồ sáng tạo

Phiên bản đặc tả: 1.0 • Ngày: 16/11/2026

## 1. Chỉ dẫn cho AI triển khai

Bạn đóng vai kỹ sư frontend, kỹ sư đồ họa 3D và người kiểm thử. Hãy xây sản phẩm hoạt động thật theo tài liệu này. Đây là đặc tả cho một dự án mới, không phải yêu cầu sửa ứng dụng DingDongNote hay một dự án khác.

- Đọc toàn bộ spec trước khi sửa code; kiểm tra cấu trúc repo và hướng dẫn hiện có.
- Nếu thư mục trống, khởi tạo dự án. Nếu đã có code, tái sử dụng phần phù hợp, không xóa hoặc ghi đè công việc không liên quan.
- Tự xử lý quyết định kỹ thuật thông thường, ghi giả định vào README. Chỉ hỏi khi có xung đột dữ liệu hoặc yêu cầu thật sự chặn triển khai.
- Không dừng ở kế hoạch, giao diện tĩnh hoặc danh sách TODO: hoàn thành phạm vi giai đoạn được yêu cầu, chạy kiểm tra, cung cấp cách mở ứng dụng.
- Không tự triển khai các mục ngoài phạm vi. Không tự publish, mua dịch vụ, tạo tài khoản hoặc yêu cầu token.
- Chọn phiên bản thư viện ổn định và tương thích tại thời điểm triển khai; kiểm tra tài liệu chính thức khi cần, lưu lockfile. Không đoán API.
- Báo cáo trung thực kiểm tra nào đã chạy, kết quả và giới hạn; không tuyên bố đã kiểm tra trên điện thoại thật nếu chỉ giả lập viewport.

## 2. Mục tiêu sản phẩm

Xây một website nội bộ mang tên **DingDong Gift — Tủ đồ**, dùng để lưu, xem trước, tinh chỉnh và tái sử dụng các chi tiết trang trí cho thiệp chúc mừng.

“Tủ đồ” là thư viện component và tài nguyên đi kèm, không phải mô hình 3D của một chiếc tủ. Giao diện là một gallery hiện đại, dễ thao tác. Người dùng không rành code có thể chọn đồ vật, xem chuyển động, chỉnh tham số và lấy cấu hình để đưa cho AI ghép vào thiệp.

Luồng cốt lõi: Mở tủ đồ → chọn mẫu → xem 3D → đổi màu/chuyển động → lưu biến thể → sao chép hướng dẫn sử dụng → AI dùng component gốc trong một tấm thiệp.

Kết quả quan trọng: một mẫu đã đẹp được sử dụng lại mà không bị AI dựng lại hình học mỗi lần.

## 3. Phân kỳ thực hiện

### Giai đoạn A — Xây tủ đồ trước

Hoàn thiện bộ khung ứng dụng, gallery, trang chi tiết, sân khấu 3D, bảng điều khiển, bộ đăng ký tài nguyên, lưu cấu hình, tài liệu và trang thử tích hợp. Dùng một khối hình kỹ thuật đơn giản trong mục kiểm tra nội bộ để kiểm tra pipeline; không quảng cáo nó là sản phẩm hoàn thiện. Gallery tài nguyên thật có trạng thái trống rõ ràng. Không tạo trái tim chính thức ở bước này.

### Giai đoạn B — Trái tim mẫu 1

Thay nội dung kiểm tra bằng tài nguyên thật `heart-01`, tinh chỉnh chất lượng hình dáng và chuyển động. Chỉ tạo đúng một mẫu trái tim, không tự tạo thêm máy bay/hộp quà. Nếu prompt yêu cầu cả A và B thì thực hiện liên tiếp; nếu chỉ yêu cầu A thì dừng sau khi A chạy được.

### Chưa làm trong MVP

- Đăng nhập, phân quyền, database, backend, thanh toán, đồng bộ đám mây.
- Kéo thả dựng thiệp, timeline nhiều cảnh, trình sửa mesh, xuất video/GIF, chợ mua bán model.
- Upload model từ giao diện hoặc tự sinh model bằng AI.
- Xuất một gói component độc lập bằng một nút bấm. MVP dùng quy trình sao chép mã nguồn được tài liệu hóa.

## 4. Kiến trúc và công nghệ mặc định

- React + TypeScript + Vite, ứng dụng frontend chạy cục bộ.
- Three.js + React Three Fiber cho 3D; Drei cho tiện ích khi phù hợp.
- CSS thuần theo design token hoặc CSS Modules; không thêm framework UI lớn chỉ để làm gallery.
- React state/context là đủ; chỉ thêm state library nếu có nhu cầu cụ thể.
- localStorage cho yêu thích, lựa chọn giao diện và preset của người dùng. Mã nguồn/manifest mới là nguồn dữ liệu tài nguyên gốc.
- Có thể dùng router dạng hash để deep link hoạt động trên hosting tĩnh mà không cần rewrite.
- Không cần Railway hay Firebase trong phiên bản này. Sau này có thể host phần frontend tĩnh; quyết định hosting không chặn MVP.
- Sau khi cài dependency, chức năng chính không phụ thuộc CDN, font từ mạng, HDRI ngoài hoặc API key. Tài nguyên cần thiết phải nằm trong repo.

## 5. Giao diện và nhận diện

Phong cách: studio trưng bày đồ vật sáng tạo; sạch, sáng, tinh tế; nền trắng ngà, điểm nhấn tím nhẹ và hồng. Không lạm dụng gradient, kính mờ hoặc hiệu ứng nền.

- UI bằng tiếng Việt, tên kỹ thuật hiển thị trong phần thông tin nâng cao.
- Header: logo chữ DingDong Gift, tên Tủ đồ, điều hướng Bộ sưu tập / Thử trên thiệp / Hướng dẫn.
- Desktop: thanh danh mục bên trái, nội dung chính rộng, khoảng cách thoáng.
- Màn hình nhỏ: danh mục chuyển thành hàng lọc hoặc drawer; không có thanh cuộn ngang toàn trang.
- Gallery dùng thumbnail tĩnh, không tạo một WebGL canvas cho mỗi thẻ.
- Thẻ tài nguyên: ảnh, tên, loại 2D/3D, trạng thái, phiên bản, nút yêu thích, nút Xem mẫu.
- Danh mục dự kiến: Tất cả, Trái tim, Phong bì, Hộp quà, Máy bay, Trang trí, Yêu thích. Danh mục chưa có đồ vật hiện trạng thái trống, không dùng asset giả để lấp đầy.
- Search không phân biệt hoa thường và hỗ trợ tìm tiếng Việt có/không dấu theo tên, ID, tag.
- Số lượng hiển thị được tính từ registry thật. Không hiển thị số liệu giả.

### Trang chi tiết / xưởng thử

Desktop có vùng xem trước lớn bên trái và bảng điều khiển bên phải. Mobile xếp vùng xem trước lên trên, bảng điều khiển bên dưới.

Vùng xem trước có: kéo để xoay camera, zoom có giới hạn, bật/tắt tự xoay vật thể, phát/tạm dừng, đặt lại góc nhìn, nền sáng/tối/ô caro. Nền ô caro chỉ giúp nhận biết vùng nền; không phải chức năng xuất ảnh trong suốt.

Các tab: Tùy chỉnh, Biến thể đã lưu, Cách sử dụng, Thông tin.

Bảng điều khiển có label, giá trị hiện tại, giới hạn rõ ràng. Mọi thay đổi cập nhật trực tiếp. Có nút Đặt lại mẫu, Lưu biến thể, Sao chép JSON, Sao chép JSX, Sao chép hướng dẫn cho AI.

Tách rõ Đặt lại góc nhìn với Đặt lại mẫu. Đặt lại mẫu không xóa các biến thể đã lưu.

## 6. Cấu trúc thư mục đề xuất

```text
dingdong-gift-cabinet/
  spec.md
  README.md
  package.json
  package-lock.json
  src/
    app/
    pages/
      GalleryPage.tsx
      AssetDetailPage.tsx
      IntegrationPage.tsx
      GuidePage.tsx
    components/
      AssetCard.tsx
      AssetFilters.tsx
      ParameterPanel.tsx
      PresetManager.tsx
    viewer/
      AssetViewer.tsx
      StudioLighting.tsx
      ViewerErrorBoundary.tsx
    gift-library/
      types.ts
      registry.ts
      motion/
        MotionRig.tsx
        motionMath.ts
      objects/
        heart-01/
          Heart01.tsx
          geometry.ts
          manifest.ts
          presets.ts
          index.ts
          README.md
    storage/
      presetStorage.ts
      migrations.ts
    utils/
      configValidation.ts
      codeGeneration.ts
  public/
    assets/
      heart-01/
        thumbnail.png
        fallback.svg
  docs/
    ADDING_ASSETS.md
    REUSE_IN_CARD.md
    QA.md
  tests/
```

Folder `heart-01` và ảnh tương ứng được tạo ở giai đoạn B. Ảnh thumbnail phải phản ánh mẫu thật, không dùng hình đẹp khác để che chất lượng model. Demo kỹ thuật của A nằm ngoài registry sản phẩm, ví dụ trong viewer/dev.

## 7. Hợp đồng tài nguyên — bắt buộc để tái sử dụng

### Quy ước hình học

- Hệ tọa độ: Y hướng lên, mặt trước nhìn theo phía +Z; tâm hình học sau chuẩn hóa đặt tại gốc tọa độ.
- Chiều cao mẫu mặc định là 2 đơn vị; scale=1 tương ứng kích thước chuẩn này.
- Vật thể không tự tạo Canvas, camera, đèn, nền, controls hoặc UI.
- Component không đọc localStorage, không biết router, không import CSS của app.
- Xuất component qua `index.ts`; import nội bộ dùng đường dẫn tương đối, không phụ thuộc alias riêng của ứng dụng tủ đồ.
- Component nhận thuộc tính hình dáng/vật liệu; chuyển động nằm trong MotionRig dùng chung.
- Một cảnh có thể chứa nhiều instance độc lập. Không sửa mutable state dùng chung khiến đổi màu một vật thể làm đổi tất cả.
- Geometry được tạo một lần theo tham số hình học, không tạo lại mỗi frame; quy định rõ ownership/disposal để tránh leak và dispose nhầm geometry dùng chung.

### Manifest tối thiểu

```ts
type AssetStatus = 'draft' | 'review' | 'approved';

interface AssetManifest {
  schemaVersion: 1;
  id: string;                 // ví dụ heart-01; duy nhất, không đổi
  name: string;               // Trái tim mẫu 1
  version: string;            // bắt đầu 0.1.0, chưa duyệt
  category: string;
  kind: '3d' | '2d';
  description: string;
  tags: string[];
  status: AssetStatus;
  thumbnail: string;
  fallback: string;
  source: 'procedural' | 'model' | 'svg';
  license: string;
  author: string;
  dependencies: string[];
  supportedMotions: string[];
}
```

Registry là danh sách import tường minh, dùng dynamic import để chỉ tải code mẫu khi mở. Không tải thực thi code từ JSON hoặc URL do người dùng nhập. Registry entry liên kết manifest, loader, defaults, presets và schema điều khiển có type.

Nếu dùng tài nguyên bên thứ ba ở phiên bản sau, ghi nguồn và giấy phép cụ thể. Không tự nhận tài nguyên tải về là tự tạo.

### Cấu hình có thể mang sang dự án khác

```ts
interface AssetConfig {
  schemaVersion: 1;
  assetId: string;
  assetVersion: string;
  appearance: {
    color: string;
    roughness: number;
    metalness: number;
  };
  transform: {
    scale: number;
    rotationDeg: [number, number, number];
  };
  motion: {
    float: { enabled: boolean; amplitude: number; speed: number };
    heartbeat: { enabled: boolean; strength: number; bpm: number };
    spin: { enabled: boolean; speedDegPerSecond: number };
  };
}
```

Đây là hợp đồng MVP cho heart-01. Tài nguyên sau có thể dùng discriminated union theo assetId để có appearance/motion riêng; không ép phong bì phải có heartbeat. Viewer state như góc camera, nền, quality, pause không nằm trong AssetConfig, nên không đi theo component khi ghép thiệp.

## 8. Lưu, nhập và sao chép cấu hình

- Mỗi preset người dùng: ID riêng, tên 1–60 ký tự, assetId, assetVersion, config, thời điểm tạo/cập nhật.
- Có Lưu mới, Đổi tên, Xóa với xác nhận. Preset mặc định là read-only; chỉnh rồi lưu thành bản riêng.
- Tải lại trang giữ được preset/yêu thích; thông báo rõ dữ liệu chỉ ở trình duyệt hiện tại, không đồng bộ thiết bị.
- Dùng key localStorage có namespace `dingdong-gift-cabinet:v1:*`.
- Storage đầy/bị chặn/JSON hỏng: không crash, thông báo phù hợp và tiếp tục dùng bộ nhớ tạm. Không ghi đè dữ liệu lỗi một cách im lặng.
- Xuất và nhập JSON cấu hình/preset để sao lưu, giới hạn file nhập 100 KB.
- Validate schemaVersion, assetId, assetVersion, kiểu dữ liệu, số hữu hạn, màu hex và khoảng giá trị. Reject field không hỗ trợ; tuyệt đối không eval.
- Phiên bản schema mới hơn không hỗ trợ: báo lỗi dễ hiểu. Phiên bản asset không khớp: cảnh báo và không tự áp dụng cho tới khi người dùng xác nhận hoặc có migration rõ ràng.
- Sao chép JSON/JSX có trạng thái thành công/thất bại; nếu clipboard bị chặn, hiển thị vùng text có thể chọn thủ công.
- JSX sinh ra phải dùng đúng API thật trong repo và bao gồm import cần thiết. Đừng chỉ in một đoạn minh họa không chạy.
- Hướng dẫn AI sao chép gồm: asset ID/version, config hiện tại, file cần mang sang, dependencies, quy ước Canvas/ánh sáng và yêu cầu không dựng lại mẫu.

## 9. Viewer và chuyển động

- Chỉ một canvas đang hoạt động trên trang chi tiết. Gallery dùng ảnh.
- Component đồ vật được bọc trong các group riêng cho transform người dùng, spin, float và heartbeat để tránh ghi đè cùng thuộc tính.
- Đơn vị rotation trong config là độ; chuyển sang radian ở biên render.
- Chuyển động dựa trên delta time hoặc thời gian hiệu lực, không dựa số frame. Chặn delta bất thường sau khi tab khôi phục.
- Pause dừng motion time và giữ nguyên pose; người dùng vẫn xoay camera được. Resume tiếp tục từ pose đó.
- Giảm chuyển động theo `prefers-reduced-motion`: mặc định tắt chuyển động tự chạy; người dùng có thể chủ động bật.
- Khi tab ẩn hoặc viewer không hiện, dừng cập nhật animation. Khi không có motion, dùng render theo nhu cầu nếu kiến trúc cho phép.
- Orbit controls chỉ điều khiển camera, tự xoay chỉ điều khiển vật thể; hai khái niệm không dùng chung state.
- Giới hạn zoom để không chui vào vật thể hoặc mất mẫu. Reset camera trả về góc chuẩn.
- Error boundary, loading indicator, nút thử lại và fallback SVG khi WebGL không dùng được hoặc context bị mất. Fallback phải ghi rõ đang hiển thị 2D.
- Ánh sáng studio mềm: key, fill và ambient vừa phải; ánh sáng phải giúp đọc hình khối, không làm cháy màu. Không cần bloom hay shadow nặng trong MVP.
- Nền ô caro là lớp CSS phía sau canvas alpha. Tránh gắn nền opaque vào scene khi chế độ này hoạt động.
- Quality gồm Thấp và Cao, mặc định phù hợp mobile; giới hạn DPR khoảng 1–1.5 trên mobile, tối đa 2 trên desktop. Đây là mục tiêu cấu hình, không phải cam kết FPS cho mọi thiết bị.

## 10. Trái tim mẫu 1 — brief hình ảnh

ID: `heart-01` • Tên: **Trái tim mẫu 1** • Phiên bản đầu: `0.1.0` • Trạng thái: `review` khi đã hoàn thiện kỹ thuật; chỉ chuyển `approved` sau khi chủ dự án duyệt hình ảnh.

### Hình dáng

- Trái tim 3D hồng san hô, cảm giác viên kẹo mềm, bề mặt satin hơi bóng.
- Hai thùy tròn đều, rãnh trên rõ và mềm, phần dưới thu về một đỉnh bo nhẹ.
- Mặt trước và sau phồng liên tục; có chiều dày thật, không phải một tấm phẳng dày được chiếu sáng giả.
- Silhouette đối xứng ở góc chính diện; không có khe hở giữa hai nửa, góc gãy, gai, lỗ hoặc mặt tự cắt.
- Tỉ lệ tham chiếu: chiều cao 2, rộng khoảng 2–2.2, dày khoảng 0.65–0.9 đơn vị. Có thể tinh chỉnh trong khoảng gần đó để hình đẹp hơn.
- Mặc định xoay nhẹ Y khoảng -15 độ để thấy độ dày, X khoảng 5 độ; toàn bộ vật thể nằm trong khung với khoảng thở.
- Không mắt, tay chân, chữ, cánh, hạt bay hoặc trang trí phụ ở mẫu này.

### Cách dựng đề xuất

Dựng procedural bằng một mesh kín với contour Bézier và bề mặt phồng được tạo có kiểm soát, hoặc một phương pháp parametric tương đương. Một mesh liền mạch là ưu tiên. Nếu chọn extrude có bevel thì bắt buộc kiểm tra mặt trước/sau có thực sự phồng và không tạo cảm giác miếng nhựa phẳng. Không dùng hai quả cầu và một hình nón ghép chồng để thay thế mẫu hoàn thiện.

AI được thử nhiều cách dựng nội bộ nhưng chỉ giữ một implementation sạch. Kiểm tra normals, winding, UV nếu dùng, seam và shading ở chính diện, góc 45 độ, cạnh bên và mặt sau. Không tăng polygon vô tội vạ để che lỗi hình học.

Nếu chưa đạt chất lượng, ghi rõ vấn đề để chỉnh tiếp; không thay bằng ảnh 2D rồi tuyên bố đã xong 3D. Không cần tạo file GLB vì mẫu này được dựng bằng code.

### Tham số người dùng được chỉnh

| Tham số | Mặc định | Giới hạn |
|---|---|---|
| Màu | #F46C91 | Hex RGB hợp lệ |
| Scale | 1 | 0.5–1.5 |
| Roughness | 0.32 | 0.15–0.9 |
| Metalness | 0 | 0–0.3 |
| Góc X/Y/Z | 5 / -15 / 0 độ | -180–180 |
| Lơ lửng | Bật | Bật/tắt |
| Biên độ lơ lửng | 0.08 | 0–0.2 đơn vị |
| Tốc độ lơ lửng | 0.35 | 0.1–1 chu kỳ/giây |
| Nhịp tim | Tắt | Bật/tắt |
| Cường độ nhịp | 0.04 | 0–0.12 phần tăng scale |
| Tốc độ nhịp | 72 | 40–140 BPM |
| Tự xoay | Tắt | Bật/tắt |
| Tốc độ xoay | 15 | 0–60 độ/giây |

Nhịp tim là một chu kỳ co giãn mềm có hai nhấn nhẹ trong mỗi nhịp; BPM tính theo chu kỳ đầy đủ, không đếm từng nhấn. Scale luôn được tính từ base scale, không nhân tích lũy qua frame. Float không làm thay đổi vĩnh viễn vị trí gốc. Các hiệu ứng có thể bật cùng lúc và vẫn đặt lại chính xác.

Preset mặc định: Hồng dịu (như bảng); Đỏ yêu thương (#E84C65, roughness 0.4); Tím mộng mơ (#B58CEB, roughness 0.35). Đây là ba cấu hình màu của cùng một mẫu, không phải ba asset riêng.

## 11. Thử tích hợp vào thiệp

Trang “Thử trên thiệp” là bài kiểm tra tái sử dụng tối giản, không phải card builder hoàn chỉnh.

- Nền kem, tiêu đề “Một chút yêu thương dành cho bạn”, dòng phụ ngắn và một Heart01 ở giữa.
- Import chính component và MotionRig từ gift-library; không copy hình học sang trang demo.
- Có nút Áp dụng cấu hình đang xem. Có thể thêm instance thứ hai nhỏ hơn để kiểm tra màu/scale/chuyển động độc lập.
- Giai đoạn A hiện trạng thái Chưa có mẫu; giai đoạn B hiển thị trái tim.
- docs/REUSE_IN_CARD.md hướng dẫn copy `gift-library/objects/heart-01`, motion và dependencies nội bộ cần thiết sang dự án React tương thích; chỉ rõ assets công khai cần copy và cách sửa URL theo base path.
- Cho ví dụ hoàn chỉnh có Canvas, camera, ánh sáng, import và props đúng implementation thật.
- Nêu rõ việc chỉ copy JSON không mang theo mã nguồn/geometry/dependency. JSON là cấu hình, không phải một model 3D.
- Dự án HTML thuần hoặc framework khác cần lớp tích hợp phù hợp; MVP không hứa component React chạy trực tiếp ở mọi môi trường.

## 12. Quy trình bổ sung tài nguyên và bảo vệ mẫu đã duyệt

docs/ADDING_ASSETS.md hướng dẫn:

1. Tạo folder ID mới, ví dụ `paper-plane-01`.
2. Viết component thuần, manifest, defaults, presets, schema điều khiển và README.
3. Đăng ký loader trong registry; thêm thumbnail/fallback và ghi giấy phép.
4. Kiểm tra cô lập, trong viewer và trên thiệp thử; cập nhật kiểm thử liên quan.
5. Đưa về trạng thái review để chủ dự án duyệt, rồi mới approved.

Mỗi README tài nguyên ghi: hình dáng mong muốn, API, dependencies, file cần copy, ngân sách đồ họa đo được, giới hạn và ảnh kiểm tra nếu có.

Khi dùng asset approved để làm thiệp, chỉ thay props được công khai; không tự sửa geometry/material mặc định. Thay đổi hình dáng đáng kể cần mẫu mới (`heart-02`) hoặc nâng version có ghi thay đổi. Không ghi đè mẫu cũ chỉ để đáp ứng một tấm thiệp riêng.

Không triển khai cơ chế “khóa file tuyệt đối” giả; đây là quy ước phát triển và version control. Nếu repo có Git, dùng commit để lưu các mốc ổn định, không tự push khi chưa được yêu cầu.

## 13. Chất lượng, hiệu năng và accessibility

- Responsive tại 360px, 768px và 1440px, không tràn màn hình; panel mobile cuộn bình thường, tương tác canvas không chặn toàn bộ thao tác cuộn trang.
- Nút có nhãn dễ hiểu, focus bàn phím rõ, input liên kết label, thông báo copy/save có aria-live. Không dùng màu làm tín hiệu trạng thái duy nhất.
- Preview có mô tả văn bản; đầy đủ fallback khi không render 3D.
- Mục tiêu heart-01: không quá khoảng 25.000 tam giác, không texture mạng; ghi số tam giác và draw calls thực đo trong QA. Nếu vượt, giải thích và tối ưu trước khi thêm hiệu ứng.
- Lazy load 3D khỏi gallery. Không tải toàn bộ mẫu tương lai khi vào trang.
- Mục tiêu thao tác mượt trên điện thoại tầm trung; đo nếu có thiết bị. Nếu chưa có, ghi rõ chưa đo FPS thực tế, không cam kết 60 FPS.
- Mở/đóng trang chi tiết nhiều lần không làm tăng vô hạn canvas/listener/tài nguyên GPU. Kiểm tra cleanup và ownership bộ nhớ.
- Không có lỗi console liên quan ứng dụng, asset URL hỏng hoặc dependency thiếu.

## 14. Kiểm thử và tiêu chí nghiệm thu

### Kiểm tra tự động có ý nghĩa

- Typecheck, lint, production build.
- Unit test: registry ID duy nhất; defaults hợp lệ; validate JSON sai schema/màu/số; roundtrip preset và khôi phục lỗi storage; math chuyển động không tích lũy scale và giữ pose khi pause.
- Integration/smoke: mở gallery → vào asset → đổi màu → lưu preset → reload → khôi phục; tìm kiếm không dấu; empty state; copy thất bại có fallback.
- Kiểm thử cấu hình nhập phiên bản không hỗ trợ và tài nguyên không tồn tại.
- Giai đoạn B kiểm tra hai instance khác màu độc lập và config JSX được dùng thực tế trong trang tích hợp.

### Kiểm tra hình ảnh thủ công

Chụp/quan sát heart-01 chính diện, 45 độ, mặt bên, mặt sau; thử nền sáng/tối, 360px và desktop. Kiểm tra trực quan: cân đối, không seam, không bẹt, ánh sáng mềm, không bị cắt khi chạy motion hoặc tăng scale trong giới hạn.

Đây là vòng kiểm tra bắt buộc cho chất lượng 3D; build pass không có nghĩa hình đã đẹp. Nếu công cụ hiện tại không xem được trình duyệt, cung cấp checklist kiểm tra cho chủ dự án và ghi phần chưa xác minh.

### A được coi là xong khi

- Chạy được ứng dụng bằng lệnh trong README, gallery trống đúng thiết kế.
- Demo kỹ thuật kiểm tra được viewer và bộ điều khiển, không xuất hiện như asset hoàn thiện.
- Registry, cấu hình, storage, import/export và cơ chế sinh snippet đã có kiến trúc hoạt động với fixture kỹ thuật.
- Có hướng dẫn thêm asset; không tạo hàng loạt mẫu giả.

### B được coi là xong về kỹ thuật khi

- Heart01 là 3D thật, đáp ứng brief, điều khiển và chuyển động hoạt động.
- Gallery có thumbnail đúng mẫu; preset được lưu/khôi phục; lỗi được xử lý.
- Có thể dùng chính component trên thiệp demo và hiển thị hai instance độc lập.
- README của asset và hướng dẫn tái sử dụng đủ để AI mang sang dự án khác.
- Đã chạy kiểm tra phù hợp và ghi kết quả. Trạng thái vẫn review cho tới khi chủ dự án duyệt hình ảnh.

## 15. Bàn giao của AI triển khai

- Mã nguồn đầy đủ, file lock và scripts: dev, build, preview, typecheck, lint, test.
- README tiếng Việt hướng dẫn mở terminal tại folder, cài dependency, `npm run dev`, mở chính URL terminal cung cấp, và cách dừng server.
- Hướng dẫn xem trên điện thoại cùng Wi-Fi bằng dev server bind host khi người dùng cần; chỉ rõ không đưa dev server ra Internet.
- docs/QA.md ghi môi trường, kiểm tra đã chạy, kết quả, phần chưa kiểm tra và lỗi còn lại.
- Nếu gặp lỗi dependency/build: tự chẩn đoán và sửa trong phạm vi, không chuyển việc thường lệ về người dùng.
- Trả lời kết thúc ngắn: đã làm gì, đường dẫn/URL thật nếu có, lệnh chạy, kết quả kiểm tra và bước tiếp theo.

## 16. Prompt A — dán vào Antigravity để xây tủ đồ

```text
Đọc toàn bộ file spec.md trong thư mục hiện tại. Đây là dự án DingDong Gift — Tủ đồ: thư viện chi tiết tái sử dụng cho thiệp chúc mừng.

Hãy triển khai đầy đủ GIAI ĐOẠN A theo spec. Kiểm tra repo trước; nếu trống thì khởi tạo React + TypeScript + Vite. Xây gallery, trang chi tiết, viewer 3D, bộ điều khiển, registry, preset localStorage, import/export JSON, sinh snippet và trang thử tích hợp. Dùng fixture hình học đơn giản để kiểm tra hệ thống, tách khỏi registry sản phẩm. Gallery thật hiện trạng thái trống; CHƯA tạo Trái tim mẫu 1, chưa thêm các đồ vật khác.

Tự thực hiện đến khi chạy được, không chỉ trả lại kế hoạch. Giữ đúng ranh giới component độc lập với Canvas/ánh sáng/UI; chuẩn bị khả năng thêm heart-01 ở bước sau. Không thêm backend, tài khoản, database hoặc deploy. Chạy typecheck/lint/test/build, kiểm tra UI nếu có trình duyệt, ghi phần chưa xác minh vào docs/QA.md. Cuối cùng hướng dẫn tôi bằng tiếng Việt cách mở ứng dụng và nêu chính xác kết quả kiểm tra. Không hỏi lại các lựa chọn đã chốt trong spec.
```

## 17. Prompt B — sau khi tủ đồ chạy được, tạo Trái tim mẫu 1

```text
Đọc lại spec.md và code hiện có. Giữ nguyên kiến trúc tủ đồ đã hoàn thiện. Bây giờ triển khai GIAI ĐOẠN B: chỉ tạo asset heart-01 tên “Trái tim mẫu 1” theo brief hình ảnh, API và tiêu chí chất lượng trong spec.

Ưu tiên hình dáng 3D đẹp: hai thùy cân đối, mặt trước/sau phồng, rãnh trên mềm, đỉnh dưới bo nhẹ, không seam, không cảm giác tấm phẳng. Tạo mesh procedural sạch và kiểm tra normals. Không lấy hai quả cầu với hình nón ghép lại làm kết quả cuối, không thay bằng ảnh 2D. Hoàn thiện vật liệu satin hồng và ánh sáng studio; thêm float, heartbeat, spin độc lập theo spec.

Đăng ký asset, tạo thumbnail từ mẫu thật, fallback, ba preset màu, README và snippet chạy đúng. Dùng cùng component trên trang Thử trên thiệp; kiểm tra hai instance độc lập. Kiểm tra hình ở chính diện, 45 độ, cạnh bên, mặt sau và viewport mobile; tự sửa các lỗi thấy được. Chạy các kiểm tra liên quan và build, cập nhật docs/QA.md. Chỉ đặt trạng thái review, không tự đánh dấu approved. Bàn giao để tôi mở và duyệt hình trước khi làm mẫu tiếp theo.
```
