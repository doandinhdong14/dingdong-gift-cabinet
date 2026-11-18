# DingDong Gift — Hệ thống phát triển hiệu ứng song song

Phiên bản thiết kế: 2.0 • Ngày: 18/11/2026

## 1. Mục tiêu và cách dùng tài liệu

Nâng cấp tủ đồ hiện có để **10 agent có thể phát triển 10 hiệu ứng khác nhau cùng lúc**, sau đó ghép vào cùng một ứng dụng bằng quy trình kiểm tra thống nhất.

Đây là đặc tả điều chỉnh hệ thống và bộ prompt, **chưa phải thay đổi đã áp dụng vào mã nguồn**. Người triển khai phải đọc repo thực tế. Không tự khởi tạo một ứng dụng thay thế nếu repo hiện tại đã tồn tại.

Tài liệu bổ sung cho spec.md của DingDong Gift, không liên quan spec.md của DingDongNote. Trong phạm vi kiến trúc và quy trình làm song song, tài liệu này thay thế quy định cũ về đăng ký thủ công từng mẫu. Hình ảnh, hành vi và cấu hình đã được người dùng duyệt vẫn phải giữ.

Cách dùng:
1. Đặt tài liệu này ở root repo dưới tên **parallel-effects-system.md**.
2. Dùng **Prompt A** ở mục 19 để một agent nâng cấp nền tảng trước.
3. Khi nền tảng được kiểm tra và chốt phiên bản, dùng **Prompt B** chuẩn bị một lô công việc.
4. Mở từng workspace riêng, gửi video và **Prompt C** cho từng agent.
5. Dùng **Prompt D** để kiểm tra và ghép các hiệu ứng hoàn thành.

Agent làm nền tảng có thể là một trong 10 tab, làm vai trò điều phối trước và sau lô. Nếu muốn đủ 10 hiệu ứng được làm cùng lúc thì dùng 10 worker; agent điều phối không cần chạy liên tục trong thời gian đó.

**Không mặc định rằng 10 tab chat trong cùng folder là 10 môi trường độc lập.** Mỗi worker cần một thư mục Git worktree hoặc checkout riêng, một nhánh riêng và một phạm vi file được phép sửa.

## 2. Các quyết định đã chốt

| Vấn đề | Quyết định |
|---|---|
| Đơn vị phân việc | Một hiệu ứng hoàn chỉnh cho một agent; không chia hoa/ánh sáng/animation của cùng mẫu cho nhiều agent trong lô đầu |
| Ranh giới mã nguồn | Lõi dùng chung + SDK + kho thành phần dùng chung + các gói hiệu ứng độc lập |
| Đăng ký hiệu ứng | Tự phát hiện từ folder khi dev/build; worker không sửa registry trung tâm |
| Môi trường agent | Một worktree và nhánh riêng cho mỗi nhiệm vụ |
| Camera/renderer/global state | Do host quản lý, hiệu ứng dùng API đã chốt |
| Lưu preset và media | Host quản lý; hiệu ứng nhận dữ liệu và phát sự kiện |
| Dependencies | Chốt trước lô; chỉ điều phối viên sửa package/lockfile |
| Ghép kết quả | Tuần tự trên nhánh tích hợp, kiểm tra từng gói |
| Đánh giá chất lượng | Qua kiểm tra kỹ thuật rồi duyệt hình ảnh; build pass chưa phải approved |
| Phạm vi hiện tại | Frontend và quy trình local; không thêm backend, auth, chợ plugin hoặc dịch vụ chạy agent |

Mục đích là giảm công việc lặp: agent chỉ dựng hình, chuyển động và thông số riêng. Mở rộng hệ thống không tự bảo đảm hoa đẹp hay video giống; mỗi mẫu vẫn cần đối chiếu thị giác.

## 3. Tách trách nhiệm hệ thống

### 3.1. Host — phần ứng dụng chung

Chịu trách nhiệm:
- Gallery, tìm kiếm, lọc, trang chi tiết, preview toàn màn hình.
- Một đường dẫn preview chung nhận effectId; không thêm route thủ công cho từng hiệu ứng.
- Khởi tạo renderer, Canvas, quality, camera, ánh sáng mặc định và hậu kỳ.
- Tải tài nguyên, báo lỗi, loading, fallback.
- Bảng chỉnh sinh từ mô tả điều khiển; lưu preset, import/export, migration.
- Chọn ảnh/nhạc người dùng và quản lý vòng đời URL tài nguyên.
- Đồng hồ animation, pause, reset, tab visibility và reduced motion.
- Điều phối mở quà, chuyển scene/trang và lịch sử điều hướng.
- Trạng thái review/approved và hiển thị kết quả kiểm tra.

### 3.2. Effect SDK — hợp đồng dùng chung

Một bộ API có tài liệu và phiên bản:
- Khai báo hiệu ứng, kiểu props, validator, control schema.
- Hook thời gian và các helper chuyển động.
- Sự kiện tương tác, completion, lỗi và yêu cầu chuẩn bị trang đích.
- Quyền dùng camera rig, đăng ký đối tượng glow, resolve media.
- Trợ giúp cleanup và reset.

SDK không được thay đổi phá vỡ tương thích giữa lúc 10 agent đang làm. Mỗi lô chốt đúng một commit nền tảng; thay đổi SDK sau đó phải đi qua điều phối viên.

### 3.3. Shared assets — thành phần đồ họa dùng chung

Ví dụ: geometry tim đã duyệt, vật liệu chuẩn, cánh hoa cong, bộ sao nền, thuật toán phân bố đều, chữ glow.

- Chỉ quảng bá thành shared khi đã có nhu cầu và chất lượng ổn định.
- Không biến mọi hàm nhỏ thành abstraction chung ngay từ đầu.
- Worker chỉ đọc shared đã có ở baseline.
- Nếu cần chức năng chưa có, viết helper cục bộ trong gói hoặc ghi yêu cầu.
- Sau lô, điều phối viên mới cân nhắc gom phần trùng thành shared và kiểm tra hồi quy.
- Cấm import từ gói hiệu ứng của worker khác đang phát triển.

### 3.4. Effect package — phần worker sở hữu

Mỗi package chứa toàn bộ:
- Brief và nguồn tham chiếu.
- Manifest, config, defaults, presets, controls.
- Component scene, overlay hoặc object.
- Geometry, shader, texture/model/font nội bộ.
- Kiểm thử, thumbnail, tài liệu, QA và bàn giao.

**Thêm hiệu ứng thông thường chỉ được làm thay đổi một subtree: src/effects/<effect-id>/.**

## 4. Phân loại hiệu ứng để không ép mọi thứ vào một khuôn

| kind | Ví dụ | Cách dùng |
|---|---|---|
| object3d | Tim, bánh, hộp quà | Đồ vật 3D trong cảnh; host cung cấp camera/đèn |
| background | Sao băng, tuyết, hạt sáng | Lớp nền của scene; khai báo không chiếm tương tác nếu không cần |
| scene | Vũ trụ lời chúc | Một cảnh hoàn chỉnh, có camera profile và nhiều thành phần |
| transition | Hoa nở mở quà, phong bì mở thư | Có bắt đầu/kết thúc và hợp đồng chuyển nội dung |
| overlay2d | Chữ, ánh sáng hoặc trang trí DOM/SVG | Render trong DOM overlay của host |

“Gói độc lập” không có nghĩa mọi gói đều ghép được với nhau trong cùng một Canvas mà không kiểm tra. Object/background có khả năng kết hợp; scene/transition có thể sở hữu toàn cảnh. Manifest phải khai báo khả năng kết hợp và yêu cầu môi trường.

Trong một preview chỉ có một scene chủ và một chủ sở hữu camera. Không cho hai scene toàn màn hình cùng ghi camera, background hoặc exposure.

## 5. Cấu trúc thư mục đích

~~~text
dingdong-gift/
  parallel-effects-system.md
  spec.md
  AGENTS.md
  package.json
  package-lock.json
  src/
    app/                          # shell và router hiện có
    effect-host/
      catalog.ts
      EffectHost.tsx
      EffectPreviewPage.tsx
      RuntimeProvider.tsx
      AutoControls.tsx
      PresetRepository.ts
      TransitionController.tsx
    effect-sdk/
      index.ts                    # public API duy nhất
      types.ts
      defineEffect.ts
      hooks/
      validation/
    shared-assets/
      index.ts                    # exports được phép dùng
      ...
    effects/
      <effect-id>/
        AGENTS.md                 # giới hạn của worker
        TASK.md
        assignment.json
        manifest.json
        index.ts
        config.ts
        controls.ts
        presets.ts
        Scene.tsx                 # khi có nội dung R3F
        Overlay.tsx               # khi có nút/lời nhắn HTML
        Effect.module.css         # tùy chọn
        geometry/
        shaders/
        assets/                   # tài nguyên dùng lúc chạy
        references/
          README.md               # nguồn, vai trò video, mốc cần xem
        tests/
        preview/
          thumbnail.webp
          fallback.svg
        QA.md
        HANDOFF.md
        REQUESTS.md               # chỉ tạo khi cần hỗ trợ từ core
  templates/
    effect/
    prompts/
      worker.md
      integrator.md
  scripts/
    effects/
  docs/
    architecture/
    effect-api.md
    shared-assets.md
    effect-authoring.md
    parallel-workflow.md
    migration-report.md
    batches/
  .local/                         # ignored: video, log, ảnh kiểm tra tạm
~~~

Giữ cấu trúc tương đương nếu repo đang có tổ chức hợp lý; ghi mapping cụ thể. Không chuyển hàng loạt file chỉ vì tên khác.

Không tạo một package npm và một bộ React/Three riêng cho từng hiệu ứng. Ban đầu đây là module trong cùng repo, dùng chung dependency đã khóa. Không cần Nx/Turborepo/microfrontend để đáp ứng yêu cầu.

## 6. Hợp đồng package phiên bản 1

Các tên API dưới đây là **thiết kế đích**, không phải khẳng định đã có trong repo. Điều phối viên triển khai và viết ví dụ chạy thật trước khi giao worker.

### 6.1. Manifest là metadata, không chứa code

~~~json
{
  "manifestVersion": 1,
  "id": "paper-plane-flight-01",
  "name": "Máy bay mang lời chúc",
  "version": "0.1.0",
  "configVersion": 1,
  "sdkApiVersion": 1,
  "kind": "object3d",
  "renderer": "r3f",
  "description": "Máy bay giấy bay theo đường cong.",
  "tags": ["máy bay", "lời chúc"],
  "status": "draft",
  "thumbnail": "./preview/thumbnail.webp",
  "fallback": "./preview/fallback.svg",
  "capabilities": {
    "composable": true,
    "interactive": true,
    "completionEvent": false,
    "mediaInputs": [],
    "cameraRig": false,
    "glow": false
  },
  "sharedAssets": [],
  "licenses": []
}
~~~

- ID unique, khớp tên folder, lowercase-kebab-case. Generator từ chối ghi đè ID đã có.
- Manifest không chứa camera mutable, JSX, URL để chạy code hoặc import tùy ý.
- version là phiên bản asset; configVersion dành cho migration dữ liệu; sdkApiVersion dành cho tương thích API.
- Worker đưa status lên review khi bàn giao; chỉ sau duyệt hình mới approved.
- Worker không sửa metadata các mẫu khác.
- Thumbnail/fallback tạm phải ghi rõ placeholder; trước bàn giao thumbnail lấy từ render thật.
- Metadata hỏng cần hiện chẩn đoán rõ trong môi trường phát triển, không biến mất im lặng.

### 6.2. Entry point thống nhất

~~~ts
// Minh họa hợp đồng; SDK phải cung cấp đầy đủ các type/helper này.
import { defineEffect } from '../../effect-sdk';
import manifest from './manifest.json';
import { configCodec, defaults } from './config';
import { controls } from './controls';
import { presets } from './presets';
import { presentation } from './presentation';
import { Scene } from './Scene';

export default defineEffect({
  manifest,
  configCodec,
  defaults,
  controls,
  presets,
  presentation,
  Scene
});
~~~

Nếu dùng presentation riêng thì generator tạo presentation.ts trong cùng folder. Manifest JSON phải qua validator; không ép type bằng cast rộng để bỏ kiểm tra. defineEffect giữ liên hệ generic giữa config, props, controls và preset.

Public SDK cần diễn đạt các khái niệm:
- EffectProps<C>: config đã validate, media đã resolve, runtime, emit.
- configCodec.parse(unknown): kết quả thành công hoặc lỗi có đường dẫn field.
- configCodec.migrate(fromVersion, value): chuỗi migration minh bạch.
- Scene: nội dung R3F, không tự tạo Canvas.
- Overlay: DOM của hiệu ứng trong vùng host cấp; nút và lời nhắn.
- Editor tùy chọn: chỉ dùng khi control schema chung không đủ; vẫn cập nhật config qua host.
- presentation: đề xuất camera/ánh sáng/nền/quality/glow; host kiểm tra rồi áp dụng.

Gói overlay2d không cần Scene. Gói object3d không được giả làm scene chỉ để chiếm camera. Tất cả callable export và manifest phải được kiểm tra nhất quán.

### 6.3. Config và panel điều khiển

- Config chỉ chứa JSON serializable; không có function, Three object, File, DOM node hoặc Blob URL.
- Defaults/preset đi qua cùng validator như dữ liệu nhập.
- Quy định khoảng số, số hữu hạn, enum, màu, giới hạn nội dung; không eval.
- Controls hỗ trợ number, toggle, color, text, select, media và group.
- Với danh sách nhóm vật thể, hỗ trợ repeater có ID ổn định hoặc Editor riêng; không lấy index mảng làm danh tính lâu dài.
- Nút replay/start là runtime action; không lưu tiến trình animation vào preset.
- Trường nào chỉ để debug không xuất hiện trong luồng người nhận thiệp.
- Slider sửa đúng giá trị thực và số thập phân; không dùng boolean thay cường độ.
- configVersion mới hơn chưa hỗ trợ phải báo lỗi; không lặng lẽ làm mất field.
- Khóa lưu preset gồm effectId và instanceId/presetId phù hợp, không dùng key chung "settings".

### 6.4. Runtime và sự kiện

Host cung cấp:
- instanceId, runId, quality, reducedMotion, viewport.
- Đồng hồ qua useEffectFrame hoặc API tương đương: deltaSeconds và elapsedSeconds của lần chạy hiệu lực.
- Start, pause, resume, reset; reset cấp runId mới.
- Completion dạng emit({ type: 'complete', runId }); host dedupe theo instanceId + runId.
- Khi có interaction cụ thể, runtime phát sự kiện có tên/kiểu payload được khai báo, không dùng DOM event toàn cục tùy tiện.
- Hook media cho ảnh/nhạc đã được host giải quyết.
- API camera/glow có ownership và cleanup, nếu manifest xin capability tương ứng.

Quy tắc:
- Pause đóng băng pose. Tab ẩn tạm ngưng; quay lại không bù quãng đường.
- Không đổi speed bằng elapsedSeconds * speed hiện tại nếu gây nhảy; tích phân delta hoặc dùng helper liên tục.
- Runtime không đẩy React state toàn app mỗi frame.
- Một cơ chế frame scheduler; không tự thêm requestAnimationFrame độc lập.
- Timer phục vụ animation phải theo motion time hoặc scheduler, không để pause vẫn hoàn tất chuyển trang.
- Component không tự đổi window.location, không tự gọi router của app.
- Component không đọc/ghi localStorage/IndexedDB trực tiếp.
- Không set global exposure, renderer size, scene.background, document.body.style hoặc CSS body/html.
- Quy ước vật thể: Y lên, mặt trước +Z, pivot rõ ràng; vật thể chuẩn cao 2 đơn vị nếu hợp lý. Full scene khai báo framing riêng.
- Shared geometry/texture không được dispose khi instance khác còn dùng; ownership/refcount phải rõ.

### 6.5. Host quản lý chuyển cảnh

State tối thiểu: preparing → ready → running → revealing → completed/error.

- Hiệu ứng transition phát sự kiện vào mốc bắt đầu reveal và complete; trang đích đến từ lựa chọn bên ngoài.
- Host chuẩn bị tài nguyên trang đích, giữ overlay/canvas tới lúc chuyển xong.
- Không unmount hiệu ứng giữa lúc cánh hoa đang bay.
- Internal route/scene được resolve qua danh sách action hợp lệ, không thực thi URL/code nhận từ JSON.
- Loading/error có xử lý rõ. Double click không tạo hai lần chuyển.
- Trong MVP host có thể crossfade giữa WebGL và DOM; không buộc hỗ trợ hai scene có camera khác nhau trong cùng một frame nếu chưa có compositor đúng.
- Nêu giới hạn compositing thật trong API, không hứa mọi transition ghép được tự động.

## 7. Tự phát hiện hiệu ứng và preview không sửa file chung

Nếu repo dùng Vite, host triển khai một lần:
- Glob literal đọc metadata JSON từ src/effects/*/manifest.json.
- Glob lazy cho src/effects/*/index.ts.
- Map riêng URL thumbnail/fallback được bundler xử lý để gallery không import code 3D chỉ để lấy ảnh.
- Ghép manifest và loader theo tên folder; validate ID, entry, version và đường dẫn.
- Gallery dùng metadata/thumbnail; chỉ load module khi mở hiệu ứng.
- Đường preview generic, ví dụ #/effects/<id> với router hash; giữ router thực tế nếu đã dùng cách khác.

Worker không sửa:
- catalog.ts, registry.ts, App.tsx, router.
- Một danh sách import hoặc file index tổng hợp dùng chung.
- Danh sách ảnh thumbnail trung tâm.
- package.json chỉ để thêm script preview mẫu của mình.

Auto-discovery là **lúc dev/build từ mã nguồn tin cậy trong repo**. Thêm folder vào production đã deploy không tự có hiệu ứng mới; phải build/release lại. Không hỗ trợ tải file JS bất kỳ trên UI rồi chạy.

Nếu repo không dùng Vite: điều phối viên tạo generator catalog tương đương. File sinh tự động được tạo trong bước dev/build, không giao worker cùng sửa. Không đổi framework chỉ để dùng glob.

Runtime boundary bắt được lỗi render/import phù hợp, hiển thị fallback; **không phải sandbox bảo mật** và không chặn được vòng lặp vô hạn hoặc mọi lỗi GPU. Một module lỗi cú pháp vẫn có thể làm production build thất bại; vì vậy phải kiểm tra trước khi ghép.

## 8. Những nền tảng nên làm chung một lần

Ưu tiên các vấn đề đã gặp trong dự án:
1. Motion clock có pause/resume/reset/visibility.
2. Helper trôi tuần hoàn giữ mật độ, phân bố có seed, tốc độ theo từng groupId.
3. Text glow với cường độ liên tục và độ lan riêng; pipeline màu và ownership rõ.
4. Media resolver, nạp ảnh và cleanup.
5. Transition controller có callback một lần, loading trang đích và replay.
6. Error/loading/fallback, quality profile và báo cáo render cơ bản.

Không bắt mọi effect dùng đủ sáu. Ví dụ hoa nở không cần logic rơi tuần hoàn liên tục; sao băng không cần logic mở quà.

Nếu chức năng đã có và hoạt động thì bọc API dùng chung, không viết lại cho “đẹp kiến trúc”. Chỉ tách shared khi đã kiểm tra khác biệt trước/sau.

## 9. Phạm vi file và quy tắc AGENTS.md

### Điều phối viên sở hữu

Host, SDK, shared-assets, template, scripts, config root, lockfile, tài liệu kiến trúc và bảng lô công việc. Có quyền chuyển đổi mẫu cũ qua adapter trong phạm vi migration đã thống nhất.

### Worker sở hữu

Chỉ:
- src/effects/<assigned-id>/**
- .local/<assigned-id>/** cho file tạm, không commit.

Worker đọc được SDK/shared/docs nhưng không sửa chúng. Không sửa ngay cả khi lỗi core làm nhiệm vụ khó hơn. Viết REQUESTS.md trong gói, nêu nhu cầu và cách tái hiện; tiếp tục phần độc lập hoặc dùng local helper hợp lệ.

### Nội dung root AGENTS.md cần bổ sung

~~~text
Dự án phát triển hiệu ứng theo package.
Đọc assignment.json/TASK.md của nhiệm vụ trước khi sửa.
Worker chỉ sửa src/effects/<effect-id>/** đã được giao.
Host, SDK, shared-assets, root config và lockfile thuộc điều phối viên.
Không import chéo package hiệu ứng; chỉ dùng public API của SDK/shared.
Không đổi nhánh hoặc merge từ worker. Không push/deploy tự động.
Chạy effects:check và effects:scope cho package trước bàn giao.
Nêu trung thực phần hình ảnh chưa xem/kiểm tra.
~~~

Giữ lại hướng dẫn root có sẵn. Nested AGENTS.md chỉ bổ sung phạm vi, không tự xóa hoặc vô hiệu hóa quy tắc dự án.

**AGENTS.md là hướng dẫn, không phải khóa filesystem.** Cần script kiểm tra file đã thay đổi, import boundary và quy trình ghép để phát hiện vi phạm.

## 10. Công cụ điều phối cần triển khai

Dùng Node scripts để chạy được trên Windows của người dùng. Không phụ thuộc bash-only hoặc hardcode đường dẫn C:/D:. Gọi Git bằng argument array, không ghép dữ liệu người dùng thành shell command.

Các lệnh sau là interface phải được agent nền tảng tạo, chưa phải lệnh đã có:

| Lệnh | Công việc |
|---|---|
| npm run effects:create -- --id <id> --kind <kind> | Tạo package scaffold có manifest/schema/example chạy được, từ chối ghi đè |
| npm run effects:check -- --id <id> | Schema, boundary, typecheck, test phù hợp và kiểm tra build package |
| npm run effects:scope -- --id <id> --base <sha> | Kiểm tra mọi thay đổi committed, staged, unstaged và untracked ngoài phạm vi |
| npm run effects:preview -- --id <id> --port <port> | Mở host ở effect được giao; port cố định, báo rõ khi đang bận |
| npm run effects:batch -- --file <batch.json> | Validate nhiệm vụ và tạo worktree/assignment tuần tự |
| npm run effects:report -- --file <batch.json> | Tổng hợp trạng thái từ các workspace thành báo cáo của điều phối viên |

- Phải tận dụng package manager/lockfile hiện có; ví dụ npm trong tài liệu không là lý do đổi pnpm/yarn.
- Check không âm thầm sửa root. Output/log sinh ra vào .local hoặc thư mục ignored.
- Scope scan phải phát hiện rename/delete, sửa lockfile, import lén qua barrel/dynamic import và các file chưa tracked.
- Scope không thể chỉ dựa git diff không có tham số vì bỏ sót commit.
- Port bận thì báo/đổi qua điều phối viên; không kill process lạ, không tự nhảy port khiến assignment sai.
- Lệnh batch chỉ tạo workspaces; không tự mở/điều khiển 10 phiên AI hoặc tự gửi tin.
- Báo cáo build không thay QA thị giác.
- Không dựng dashboard quản lý agent với backend trong đợt nâng cấp này.

## 11. Worktree: tách không gian của 10 agent

### Trước khi tách

1. Kiểm tra Git và trạng thái hiện tại. Nếu chưa có Git, điều phối viên thiết lập repo local và .gitignore phù hợp.
2. Giữ nguyên thay đổi người dùng. Không dùng reset --hard, git clean hoặc tự stash/xóa để ép sạch.
3. Lưu thay đổi thuộc nhiệm vụ nền tảng vào commit, xác định chính xác commit baseline.
4. Ghi sdkApiVersion, dependency lock và danh sách shared export được dùng.
5. Baseline phải có host, SDK, template và ít nhất fixture chạy được. Các package mới sẽ được tạo riêng trong worktree.

### Ví dụ minh họa

~~~text
git worktree add -b effect/batch-001/01 ../dingdong-gift-workers/batch-001/agent-01 <BASE_COMMIT>
git worktree add -b effect/batch-001/02 ../dingdong-gift-workers/batch-001/agent-02 <BASE_COMMIT>
~~~

Script tạo tương tự cho 10 nhiệm vụ với nhánh khác nhau. BASE_COMMIT phải lấy từ repo thật; không chèn tên giả rồi thông báo đã làm xong.

Mỗi worktree có toàn bộ code để chạy thử, nhưng worker chỉ được sửa package của mình. Dùng cài đặt dependency theo lockfile trong từng worktree; không dùng một node_modules đang được nhiều worker sửa. Điều phối viên nên cài tuần tự hoặc giới hạn số cài đồng thời để tránh nghẽn máy.

Git worktrees vẫn dùng chung một phần metadata repo. Worker không sửa Git hooks/config chung, xóa nhánh của người khác hoặc thao tác dọn worktree.

Nếu môi trường agent không hỗ trợ nhiều workspace đồng thời, dùng checkout/clone local riêng và patch/branch bàn giao. Không gắn nhãn “đã cách ly” cho 10 tab vẫn đang ghi cùng folder.

### Phân bổ cổng tham khảo

| Slot | Workspace gợi ý | Port |
|---|---|---|
| 01 | agent-01 | 5211 |
| 02 | agent-02 | 5212 |
| 03 | agent-03 | 5213 |
| 04 | agent-04 | 5214 |
| 05 | agent-05 | 5215 |
| 06 | agent-06 | 5216 |
| 07 | agent-07 | 5217 |
| 08 | agent-08 | 5218 |
| 09 | agent-09 | 5219 |
| 10 | agent-10 | 5220 |

Cổng là đề xuất; kiểm tra thực tế trước khi giao. URL preview chỉ được báo “đang chạy” khi server đã khởi động thành công.

10 agent viết code không có nghĩa cần mở 10 WebGL preview cùng lúc. Preview bằng thumbnail trong gallery; chỉ chạy vài cảnh nặng đồng thời tùy cấu hình máy. Dừng server của chính nhiệm vụ khi không cần, không ảnh hưởng server khác.

## 12. Phiếu công việc độc lập cho mỗi agent

Mỗi assignment.json có:
- taskId, batchId, slot, effectId.
- baselineCommit, sdkApiVersion, branch, workspacePath, port.
- allowedPaths và requested kind.
- referenceFiles có đường dẫn thật/vai trò; không bịa file chưa được gửi.
- Target summary và acceptance criteria.

BaselineCommit là commit nền tảng; assignment/scaffold có thể được điều phối viên commit riêng trên nhánh nhiệm vụ trước khi worker bắt đầu. Cả scaffold và code worker phải nằm trong phạm vi cho phép.

TASK.md đủ thông tin để một tab chưa biết lịch sử vẫn làm được:

~~~text
TASK ID: <mã>
EFFECT ID: <id duy nhất>
MODE: new | improve
KIND: object3d | background | scene | transition | overlay2d

MỤC TIÊU:
<mô tả ngắn trải nghiệm>

THAM CHIẾU:
<video/ảnh + đường dẫn + vai trò + thời điểm cần xem>
Không có reference thì ghi rõ thiết kế tự đề xuất.

HÌNH ẢNH:
<hình dáng, bố cục, vật liệu, ánh sáng>

TƯƠNG TÁC/CHUYỂN ĐỘNG:
<trạng thái đầu, kích hoạt, các giai đoạn, loop/complete>

CẤU HÌNH:
<các điều khiển thực sự cần>

TÁI SỬ DỤNG:
<SDK/shared được phép dùng; mọi phụ thuộc phải có trong baseline>

NGHIỆM THU:
<các hành vi và góc nhìn cần kiểm tra>

PHẠM VI:
Chỉ src/effects/<id>/** và .local/<id>/**.
Giữ root config/lockfile, SDK và package khác nguyên trạng.
~~~

Video tham chiếu của người dùng mặc định đặt trong .local/<id>/references/ hoặc được đính kèm trực tiếp tab. references/README.md ghi metadata và mốc cần xem; video không tự được đưa vào bundle/deploy. Tài nguyên ảnh/model thực sự dùng lúc chạy đặt trong assets/ với nguồn và quyền dùng rõ ràng.

Trong cùng lô: một ID chỉ có một owner. Nếu hai nhiệm vụ cần cùng geometry chưa có, giao dependency đó chuẩn bị trước hoặc cho mỗi bên giải pháp local; không tạo phụ thuộc vào nhánh chưa hoàn thành của nhau.

## 13. Quy trình của worker

1. Xác minh đúng workspace/branch/taskId, đọc TASK.md, SDK docs và ví dụ có thật.
2. Xem video ở các mốc quan trọng; không dựa mỗi thumbnail.
3. Dựng mẫu tĩnh/endpoint trước, rồi chuyển động, điều khiển và tích hợp.
4. Dùng generic preview; không tạo app, Canvas, router hoặc entry root riêng.
5. Lưu tiến độ trong package của mình. Không cập nhật bảng tổng hợp chung.
6. Kiểm tra scope/boundary và tests phù hợp.
7. Quan sát desktop/mobile; nếu không có browser thì báo chưa kiểm chứng hình, không đánh dấu visual pass.
8. Viết QA.md/HANDOFF.md, đặt review nếu đủ điều kiện kỹ thuật.
9. Commit chỉ file của package; báo branch và HEAD commit sau khi commit. Không push/merge.

Không yêu cầu người dùng duyệt từng bước code nhỏ. Worker hoàn thành công việc được giao; việc duyệt hình cuối cùng không đồng nghĩa dừng triển khai khi mới có kế hoạch.

### HANDOFF.md tối thiểu

- Effect ID/version, SDK version, baseline.
- Tóm tắt kết quả và file chính.
- Cách mở preview và những thao tác phải thử.
- Kiểm tra đã chạy, output hoặc log path; phần chưa kiểm tra.
- Ảnh/video so sánh và cấu hình/seed/viewport dùng khi chụp.
- Kết quả hiệu năng nếu đã đo; không bịa FPS.
- Hạn chế, REQUESTS còn mở, nguy cơ hồi quy nếu có.
- Migration config khi chỉnh mẫu có sẵn.

Không ghi “commit của chính HANDOFF.md” vào file rồi tạo vòng lặp cập nhật commit hash; trả HEAD chính xác trong tin nhắn bàn giao sau commit.

## 14. Ghép kết quả có kiểm soát

Điều phối viên dùng nhánh tích hợp riêng, không làm thẳng trên bản người dùng đang xem nếu chưa có checkpoint.

Với từng package:
1. Ghi nhận HEAD worker đã bàn giao; không merge theo một branch đang tiếp tục thay đổi mà chưa chốt hash.
2. Kiểm tra diff từ baseline, kể cả scaffold: chỉ các file cho phép.
3. Kiểm tra metadata, dependencies, import boundary, asset license và SDK compatibility.
4. Đọc QA/HANDOFF và chạy check của gói.
5. Ghép commit/nhánh local đã xác định, tuần tự từng package.
6. Host tự phát hiện gói; kiểm tra route, defaults, controls, preset và cleanup.
7. Chạy regression nhanh các mẫu cũ đã có mốc so sánh.
8. Nếu gói hỏng, cô lập/revert phần tích hợp của gói đó trên nhánh điều phối; không xóa công việc worker hoặc sửa lan sang gói khác.
9. Sau khi ghép đủ, chạy build toàn repo và kiểm tra tổng thể.

Nếu xung đột file chung xuất hiện, coi đó là dấu hiệu đã vi phạm ranh giới hoặc baseline thay đổi. Không chọn “ours/theirs” toàn bộ một cách máy móc. Xác định nguồn thay đổi và xử lý cụ thể.

Worker không tự cherry-pick công việc từ worker khác. Điều phối viên không merge song song 10 nhánh vào cùng index.

Duyệt:
- draft: đang làm.
- review: đủ để mở kiểm tra.
- approved: chủ dự án đã duyệt hình/hành vi.
- needs-fix: chưa đạt.
Trạng thái tích hợp/commit nằm trong báo cáo batch, tách khỏi trạng thái duyệt hình.

Không tự publish/deploy/push sau khi ghép, trừ khi người dùng yêu cầu.

## 15. Chuyển đổi từ hệ thống hiện tại

### Bước 1 — Kiểm kê và chụp mốc hiện tại

- Đọc repo, lockfile, AGENTS.md, spec và dữ liệu preset.
- Liệt kê hiệu ứng thực sự có; không coi ví dụ trong tài liệu là code đã tồn tại.
- Ghi ID, route, configVersion, storage key, asset path và trạng thái duyệt.
- Chụp/check các mốc trước migration, nhất là glow chữ, mật độ rơi, tốc độ từng nhóm, hoa nở và chuyển trang nếu đã có.
- Xuất bản sao cấu hình/preset người dùng trước khi migrate; không xóa IndexedDB.

### Bước 2 — Thêm host/SDK ở cạnh code cũ

- Giữ đường chạy cũ hoạt động.
- Tạo adapter cho một mẫu đơn giản, dùng chính component cũ.
- Alias/mapping storage chỉ khi cần; giữ ID đã có.
- Adapter tạm có thể import legacy theo ngoại lệ coordinator ghi rõ; worker mới không được dùng ngoại lệ này.
- Nếu adapter vẫn phụ thuộc file legacy ngoài package, ghi rõ chưa portable. Không tuyên bố copy một folder là đủ.

### Bước 3 — Kiểm chứng hợp đồng

- Một fixture object3d và một fixture transition nội bộ kiểm tra lifecycle.
- Hai fixture nằm trong khu kiểm thử, không đưa lên gallery như sản phẩm.
- Thử hai instance cùng mẫu khác màu/tốc độ, không ảnh hưởng nhau.
- Thử scene có CSS/đèn riêng rồi chuyển sang mẫu khác: không rò state.
- Kiểm tra migration giữ nguyên config số thập phân và media references.

### Bước 4 — Chốt nền tảng và mở lô

- Hoàn thành scripts/template/SDK docs.
- Chốt commit nền tảng và lockfile.
- Tạo dry-run hai worktree/fixture để chứng minh không cần sửa root khi thêm effect.
- Xác minh luồng ghép rồi mới phát 10 nhiệm vụ thật.
- Dry-run do agent nền tảng thực hiện được, không cần spawn thêm agent hoặc bắt người dùng vận hành thủ công.

### Bước 5 — Di chuyển phần cũ dần dần

Chỉ chuyển package legacy sang cấu trúc mới khi có lợi và có hồi quy. Không sửa toàn bộ hình học các mẫu đã đẹp cùng lúc với refactor.

## 16. Nguyên tắc xử lý yêu cầu core/dependency giữa lô

Nếu worker thiếu API hoặc thư viện:
1. Ghi REQUESTS.md: nhu cầu, vì sao SDK hiện tại chưa đủ, giải pháp local nếu có.
2. Không tự sửa package.json/lockfile hoặc tạo phiên bản SDK riêng.
3. Điều phối viên chọn giải pháp local, hoãn tính năng phụ, hoặc tạo commit core bổ sung tương thích ngược.
4. Nếu cần cập nhật nền tảng, pause các worker bị ảnh hưởng ở mốc an toàn; điều phối viên đồng bộ vào worktree liên quan khi không đang ghi file.
5. Chạy lại compatibility checks. Ghi baseline gốc và supplemental core commit rõ ràng.
6. Không âm thầm cherry-pick một core commit vào mọi worktree đang hoạt động.

Mục tiêu lô đầu là không thay SDK giữa chừng. Các loại khác nhau như model/scene/transition cần được thử trong giai đoạn nền tảng để tránh khóa API quá hẹp.

## 17. Tiêu chí nghiệm thu hệ thống song song

- Thêm một package chỉ sửa subtree của package, nó xuất hiện trong gallery/dev preview.
- Không import eager toàn bộ geometry/shader/texture để hiển thị gallery.
- Hai worker ở hai workspace khác nhau sửa độc lập; hai gói ghép lại không yêu cầu sửa registry.
- Tạo được 10 assignment có ID, nhánh, path và port không trùng.
- Worktree không trùng đường dẫn; kiểm tra port bận có thông báo đúng.
- Một gói đổi màu/đèn/seed/animation không làm đổi các mẫu khác.
- Cleanup sau nhiều lần chuyển mẫu không tích tụ RAF/timer/listener/canvas.
- Không cập nhật React toàn app mỗi frame.
- Import media và lưu preset hoạt động; dữ liệu cũ không bị mất.
- Scope checker phát hiện cả commit ngoài phạm vi và untracked ngoài phạm vi.
- Worker vi phạm import chéo bị check chặn.
- Manifest/entry lỗi, thiếu texture, callback trùng và preset schema mới hơn đều có xử lý.
- Module lỗi build không bị “nuốt” rồi công bố toàn hệ thống đạt.
- Kiểm tra readme/scripts chạy được trên môi trường người dùng, không chỉ ghi lệnh giả.
- Các file QA phân biệt rõ kết quả kỹ thuật và chất lượng hình ảnh.
- Có hướng dẫn ngắn cho người không rành code: folder nào mở, prompt nào dán, xem kết quả ở đâu.

## 18. Bộ tài liệu agent nền tảng phải bàn giao

1. Host/SDK/cấu trúc package hoạt động thật.
2. docs/effect-api.md với type/API cuối cùng và ví dụ chạy được.
3. docs/shared-assets.md liệt kê exports được phép dùng.
4. docs/effect-authoring.md: tạo mới, thử, đóng gói và bàn giao.
5. docs/parallel-workflow.md: worktree, cổng, giao task, ghép và rollback.
6. docs/migration-report.md: phần đã chuyển, dữ liệu giữ được, ngoại lệ legacy.
7. templates/prompts/worker.md và integrator.md tự đầy đủ.
8. Script tạo scaffold, check, scope, preview, batch và report.
9. Mẫu batch.json cùng task template; không tự nghĩ ra 10 yêu cầu hình ảnh rồi coi là đã được giao.
10. Báo cáo baseline commit, thử nghiệm hai workspace, build và phần chưa kiểm chứng.

## 19. Prompt A — nâng cấp nền tảng một lần

~~~text
Đọc parallel-effects-system.md, spec.md và code DingDong Gift hiện tại.

Hãy trực tiếp triển khai kiến trúc phát triển hiệu ứng song song trong
parallel-effects-system.md để sau đó 10 agent làm 10 mẫu độc lập.
Đây là nâng cấp hệ thống có sẵn, không tạo app thay thế.

Ưu tiên:
- Tách host / SDK / shared-assets / effect packages.
- Package tự được phát hiện, không sửa registry/router khi thêm mẫu.
- Preview generic, control schema, preset, lifecycle và transition API.
- Mỗi worker chỉ sửa src/effects/<effect-id>/**.
- Script tạo worktree/assignment, check phạm vi và ghép kết quả.
- Giữ dữ liệu và hình ảnh/hành vi các mẫu cũ qua adapter/migration.

Giữ dependency phù hợp với repo; không nâng version hàng loạt.
Hoàn thiện template và tài liệu API thật trước khi chốt baseline.
Tự chạy dry-run với hai worktree để chứng minh thêm hai mẫu độc lập
không cần sửa root và có thể ghép lại.

Chưa phát triển 10 hiệu ứng thật và chưa yêu cầu tôi mở 10 tab.
Làm hoàn chỉnh bước nền tảng trước; đây là phạm vi hiện tại.

Không chỉ trả kế hoạch. Chạy kiểm tra/build và kiểm tra hồi quy.
Cuối cùng báo baseline commit, file prompt worker, cách chuẩn bị lô
và các giới hạn còn lại. Không push/deploy tự động.
~~~

## 20. Prompt B — chuẩn bị lô công việc

~~~text
Hệ thống nền tảng đã được triển khai. Đọc parallel-effects-system.md,
docs/parallel-workflow.md và kiểm tra baseline thực tế.

Chuẩn bị một lô tối đa 10 nhiệm vụ từ danh sách tôi cung cấp dưới đây.
Mỗi nhiệm vụ một effectId, branch, worktree và port riêng.
Nếu chưa đủ 10 đề bài, chỉ tạo nhiệm vụ đã có; không tự bịa yêu cầu.

Viết TASK.md/assignment.json có nội dung đủ cho một agent không biết
lịch sử. Ghi đúng vai trò video/ảnh, tách tài liệu tham chiếu khỏi assets
chạy thực tế. Copy reference vào workspace khi file local khả dụng.

Tạo worktrees/scaffold theo công cụ dự án, kiểm tra các path/ID/port.
Chốt baseline và dependencies; không giao các task phụ thuộc vào
package chưa xong của nhau.

Bàn giao bảng: số tab, nhiệm vụ, folder phải mở, branch, port,
lệnh preview, file TASK.md và prompt worker đã điền sẵn.
Không tuyên bố các server đã chạy nếu chưa khởi động.

DANH SÁCH NHIỆM VỤ:
1. <tên mẫu + mô tả + video/ảnh>
2. <...>
~~~

## 21. Prompt C — dán vào từng tab worker

~~~text
Bạn là worker của DingDong Gift, chỉ làm nhiệm vụ được giao.

Đọc:
1. AGENTS.md ở root và trong folder hiệu ứng.
2. src/effects/<EFFECT_ID>/assignment.json và TASK.md.
3. docs/effect-api.md, docs/shared-assets.md, docs/effect-authoring.md.

EFFECT_ID: <ID>
WORKSPACE: <đường dẫn worktree đã tạo>
REFERENCE: <file đính kèm hoặc đường dẫn trong TASK.md>

Xác minh workspace/branch đúng assignment trước khi sửa.
Nếu đang ở nhầm folder, chuyển tới folder được giao nếu môi trường
cho phép; không viết vào checkout chung để thay thế.

Chỉ sửa src/effects/<EFFECT_ID>/**; file tạm ở .local/<EFFECT_ID>/**.
Không sửa root config, package/lockfile, host, SDK, shared-assets,
router hoặc package khác. Không tự merge/push.

Xem kỹ reference. Triển khai hình dáng, chuyển động và controls theo
TASK.md. Dùng SDK có thật, không đoán API. Tự hoàn thành công việc,
không chỉ gửi kế hoạch.

Nếu cần API/dependency chưa có, ghi REQUESTS.md trong package;
tiếp tục phần độc lập hoặc dùng helper local không phá hợp đồng.

Chạy preview bằng host chung, kiểm tra hình các trạng thái quan trọng.
Lưu QA.md/HANDOFF.md, thumbnail từ render thật; chạy check và scope.
Nêu phần chưa kiểm chứng, không tự đánh dấu approved.

Commit chỉ thay đổi thuộc package khi hoàn tất.
Bàn giao: effectId, branch, HEAD commit, cách xem, kiểm tra đã chạy
và hạn chế còn lại.
~~~

## 22. Prompt D — kiểm tra và ghép lô

~~~text
Đóng vai điều phối viên tích hợp DingDong Gift.
Đọc parallel-effects-system.md và báo cáo các worker của lô <BATCH_ID>.

Xác định đúng commit đã bàn giao của từng worker.
Tạo/dùng nhánh tích hợp riêng, giữ checkpoint bản hiện tại.
Kiểm tra scope, API, dependencies và QA trước khi ghép.
Ghép tuần tự từng package, chạy check package và regression cần thiết.

Không lấy nguyên folder app của worker đè vào repo chính.
Không chấp nhận thay đổi core/lockfile lẫn trong branch worker mà
không review riêng. Không tự chọn ours/theirs hàng loạt khi conflict.

Sau khi ghép, kiểm tra gallery tự nhận đủ các mẫu, preview/preset,
pause/replay/completion và cleanup; chạy build toàn repo.
Gói lỗi thì cô lập và báo rõ, giữ các gói đã đạt.
Giữ status review cho mẫu chưa được tôi duyệt hình.

Bàn giao bảng kết quả từng mẫu, commit tích hợp, link preview thật
nếu server đang chạy, lỗi cần sửa và cách quay lại checkpoint.
Không push/deploy tự động.
~~~

## 23. Ví dụ phân 10 slot — chỉ minh họa, không tự tạo sản phẩm

| Slot | Mẫu độc lập có thể giao | kind |
|---|---|---|
| 01 | Hộp quà mở nắp | transition |
| 02 | Phong bì kéo thư ra | transition |
| 03 | Máy bay giấy mang lời nhắn | object3d |
| 04 | Bóng bay nổi lên | scene |
| 05 | Bướm bay quanh ảnh | scene |
| 06 | Pháo hoa hình tim | background |
| 07 | Tuyết và ánh sáng đêm | background |
| 08 | Thiệp lật trang | transition |
| 09 | Bó hoa bung ảnh | scene |
| 10 | Đèn lồng mang lời chúc | scene |

Người dùng có thể thay toàn bộ tên mẫu bằng video khác. Mỗi lô có file nhiệm vụ riêng; slot không phải ID sản phẩm cố định.

## 24. Tài liệu kỹ thuật đối chiếu

- Git worktree: https://git-scm.com/docs/git-worktree — một repository có thể có nhiều working tree, với nhánh riêng cho các nhiệm vụ.
- Vite glob import: https://vite.dev/guide/features.html#glob-import — dùng glob literal để khám phá module; loader mặc định có thể lazy-load. Không phải tính năng của trình duyệt thuần.

Đây là cơ sở chọn công cụ; toàn bộ ranh giới module, nhiệm vụ, SDK và quy trình duyệt trong tài liệu là thiết kế đề xuất cho DingDong Gift. Agent triển khai phải đối chiếu phiên bản thực tế trong repo.

