# Đặc tả Hợp đồng Effect SDK (Phiên bản 1.0)

Tài liệu hướng dẫn sử dụng bộ API duy nhất của Effect SDK dành cho các tác giả hiệu ứng (`worker`).

## 1. Nguyên tắc cốt lõi
- **Public API duy nhất**: Mọi import vào package hiệu ứng chỉ được lấy từ `../../effect-sdk`.
- **Không tự tạo Canvas**: Host quản lý renderer, Canvas R3F, camera chính, ánh sáng và tối ưu hóa FPS.
- **Không đọc/ghi state toàn cục**: Không trực tiếp truy cập `localStorage`, `document.body.style`, hoặc router.
- **Animation chuẩn xác**: Dùng hook `useEffectFrame` với thời gian thực tính theo giây (`elapsedSeconds`), không bị gián đoạn hay nhảy vọt khi tab bị ẩn hoặc tạm dừng.

## 2. Cấu trúc một Package Hiệu ứng
```text
src/effects/<effect-id>/
  manifest.json       # Metadata khai báo (không chứa mã thực thi)
  config.ts           # Kiểu dữ liệu cấu hình và bộ validator (ConfigCodec)
  controls.ts         # Schema các nút bấm, thanh trượt trên bảng điều khiển
  presets.ts          # Các biến thể thông số mẫu sẵn
  presentation.ts     # Khuyến nghị góc camera, ánh sáng, màu nền
  Scene.tsx           # Component 3D (R3F)
  Overlay.tsx         # Component 2D (DOM)
  index.ts            # Entry point kết nối defineEffect
```

## 3. Khai báo Manifest (`manifest.json`)
```json
{
  "manifestVersion": 1,
  "id": "ribbon-flow-01",
  "name": "Dải lụa bay uốn lượn",
  "version": "0.1.0",
  "configVersion": 1,
  "sdkApiVersion": 1,
  "kind": "object3d",
  "renderer": "r3f",
  "description": "Dải lụa 3D mềm mại bay trong không gian.",
  "tags": ["dải lụa", "trang trí"],
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
  "licenses": ["MIT"]
}
```

## 4. Entry Point (`index.ts`)
```typescript
import { defineEffect } from '../../effect-sdk';
import manifest from './manifest.json';
import { configCodec, defaults } from './config';
import { controls } from './controls';
import { presets } from './presets';
import { presentation } from './presentation';
import { Scene } from './Scene';
import { Overlay } from './Overlay';

export default defineEffect({
  manifest: manifest as any,
  configCodec,
  defaults,
  controls,
  presets,
  presentation,
  Scene,
  Overlay,
});
```

## 5. Đồng hồ Animation `useEffectFrame`
Hook dùng bên trong `Scene.tsx`:
```typescript
import { useEffectFrame, type EffectProps } from '../../effect-sdk';

export const Scene: React.FC<EffectProps<MyConfig>> = ({ config, runtime, emit }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffectFrame(runtime, ({ deltaSeconds, elapsedSeconds, isPaused, speed }) => {
    if (!meshRef.current) return;
    // Chuyển động dựa trên elapsedSeconds
    meshRef.current.rotation.y = elapsedSeconds * config.speed;
  });

  return <mesh ref={meshRef}>...</mesh>;
};
```

## 6. Phát sự kiện `emit`
Khi hoàn thành một chu kỳ hoặc khi người dùng tương tác:
```typescript
emit({
  type: 'complete',
  runId: runtime.runId,
  payload: { duration: elapsedSeconds },
});

emit({
  type: 'interaction',
  name: 'card-clicked',
  payload: { id: 'card-1' },
});
```
Host sẽ tự động khử trùng lặp sự kiện `complete` theo từng `runId`.
