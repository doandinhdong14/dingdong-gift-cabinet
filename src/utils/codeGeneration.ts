import { AssetConfig, AssetManifest, Preset } from '../gift-library/types';

/**
 * Format AssetConfig as formatted JSON
 */
export function generateConfigJson(config: AssetConfig): string {
  return JSON.stringify(config, null, 2);
}

/**
 * Format full export JSON wrapper for presets
 */
export function generatePresetExportJson(presets: Preset[]): string {
  return JSON.stringify(
    {
      version: 1,
      type: 'dingdong-preset-export',
      exportedAt: new Date().toISOString(),
      data: presets,
    },
    null,
    2
  );
}

/**
 * Capitalizes an asset ID to a valid PascalCase React component name.
 * e.g. "dev-box-fixture" -> "DevBoxFixture"
 * e.g. "heart-01" -> "Heart01"
 */
export function getComponentNameFromId(assetId: string): string {
  if (assetId === 'dev-box-fixture') return 'DevBox';
  return assetId
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Generates ready-to-run JSX snippet using real project APIs and imports.
 */
export function generateJsxSnippet(manifest: AssetManifest, config: AssetConfig): string {
  const componentName = getComponentNameFromId(manifest.id);
  const importFolder = manifest.id === 'dev-box-fixture' ? 'dev-fixture' : manifest.id;

  if (manifest.id === 'love-universe-01') {
    return `import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { LoveUniverse01 } from './gift-library/objects/love-universe-01';

// Cấu hình Vũ trụ lời chúc trích xuất từ DingDong Gift Cabinet
const assetConfig = ${JSON.stringify(config, null, 2)};

export function CardGreetingUniverse() {
  return (
    <div style={{ width: '100%', height: '520px', position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, 0, 9.2], fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <LoveUniverse01
            config={assetConfig}
            showIntro={true}
          />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableDamping={true}
          dampingFactor={0.05}
          minDistance={3.5}
          maxDistance={22.0}
        />
      </Canvas>
    </div>
  );
}

export default CardGreetingUniverse;`;
  }

  return `import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { MotionRig } from './gift-library/motion/MotionRig';
import { ${componentName} } from './gift-library/objects/${importFolder}';

// Cấu hình trích xuất từ DingDong Gift Cabinet
const assetConfig = ${JSON.stringify(config, null, 2)};

export function CardGreeting() {
  return (
    <div style={{ width: '100%', height: '400px', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Ánh sáng studio mềm theo quy ước DingDong Gift */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 5, 4]} intensity={1.2} />
        <directionalLight position={[-3, -2, -2]} intensity={0.3} color="#B58CEB" />

        <Suspense fallback={null}>
          <MotionRig
            transform={assetConfig.transform}
            motion={assetConfig.motion}
          >
            <${componentName}
              color={assetConfig.appearance.color}
              roughness={assetConfig.appearance.roughness}
              metalness={assetConfig.appearance.metalness}
            />
          </MotionRig>
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={2.5}
          maxDistance={8}
        />
      </Canvas>
    </div>
  );
}

export default CardGreeting;`;
}

/**
 * Generates complete instructions for an AI assistant to reuse the asset in a greeting card.
 */
export function generateAiInstructions(manifest: AssetManifest, config: AssetConfig): string {
  const componentName = getComponentNameFromId(manifest.id);
  const importFolder = manifest.id === 'dev-box-fixture' ? 'dev-fixture' : manifest.id;

  if (manifest.id === 'love-universe-01') {
    return `### Chỉ dẫn AI: Ghép Vũ trụ lời chúc vào thiệp DingDong Gift

**Tài nguyên:** ${manifest.name} (ID: \`${manifest.id}\`, Phiên bản: \`v${manifest.version}\`)
**Loại:** ${manifest.kind.toUpperCase()} (${manifest.source})

---

#### 1. Nguyên tắc quan trọng:
- **KHÔNG TỰ Ý DỰNG LẠI HÌNH HỌC HOẶC SHADER:** Tái sử dụng trực tiếp component \`LoveUniverse01\` và toàn bộ thư mục \`src/gift-library/objects/love-universe-01/\`.
- Component tự quản lý nền sao batched (Points), ảnh kỷ niệm phân tầng, shader chống đọc ngược chữ từ mặt sau và hoa nở (bloom) mở đầu.
- Component nhận \`config\` hoặc các thuộc tính trực tiếp (\`wishes\`, \`photoUrls\`, \`textColor\`, \`heartColor\`, \`glowIntensity\`, \`showIntro\`, v.v.).

#### 2. Các file cần sao chép sang dự án thiệp:
- Thư mục component: \`src/gift-library/objects/love-universe-01/\`
- Thư mục geometry tim 3D: \`src/gift-library/objects/heart-01/geometry.ts\`
- Tiện ích lưu trữ ảnh (nếu dùng): \`src/storage/universeImageStorage.ts\`
- File định nghĩa kiểu: \`src/gift-library/types.ts\`

#### 3. Các thư viện phụ thuộc (Dependencies):
\`\`\`bash
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three
\`\`\`

#### 4. Cấu hình tham số đã tinh chỉnh (AssetConfig JSON):
\`\`\`json
${JSON.stringify(config, null, 2)}
\`\`\`

#### 5. Cách tích hợp vào Canvas React Three Fiber:
- Đặt camera tại \`position: [0, 0, 9.2]\`, \`fov: 45\`.
- Sử dụng OrbitControls với \`enableDamping={true}\`, \`dampingFactor={0.05}\`, \`minDistance={3.5}\`, \`maxDistance={22.0}\`.
- Truyền \`config={assetConfig}\` hoặc danh sách câu chúc vào \`<LoveUniverse01 />\`.
`;
  }

  return `### Chỉ dẫn AI: Ghép chi tiết thiệp DingDong Gift

**Tài nguyên:** ${manifest.name} (ID: \`${manifest.id}\`, Phiên bản: \`v${manifest.version}\`)
**Loại:** ${manifest.kind.toUpperCase()} (${manifest.source})

---

#### 1. Nguyên tắc quan trọng:
- **KHÔNG TỰ Ý DỰNG LẠI HÌNH HỌC (GEOMETRY):** Tuyệt đối tái sử dụng nguyên vẹn file component gốc \`${componentName}.tsx\` cùng các file hình học đi kèm. Không thay thế bằng các khối hình cầu/nón đơn giản hoặc ảnh phẳng.
- Component đồ vật là thuần túy (pure): không tự tạo Canvas, camera, đèn hoặc OrbitControls. Hãy bọc component bên trong \`MotionRig\` và \`Canvas\`.

#### 2. Các file cần sao chép sang dự án thiệp:
- Thư mục component: \`src/gift-library/objects/${importFolder}/\`
- Thư mục MotionRig: \`src/gift-library/motion/\`
- File định nghĩa kiểu (nếu dùng TypeScript): \`src/gift-library/types.ts\`

#### 3. Các thư viện phụ thuộc (Dependencies):
\`\`\`bash
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three
\`\`\`

#### 4. Cấu hình tham số đã tinh chỉnh (AssetConfig JSON):
\`\`\`json
${JSON.stringify(config, null, 2)}
\`\`\`

#### 5. Cách tích hợp vào Canvas React Three Fiber:
- Đặt camera tại \`position: [0, 0, 4.5]\`, \`fov: 45\`.
- Thiết lập ánh sáng studio: \`ambientLight intensity={0.7}\`, \`directionalLight position={[3, 5, 4]} intensity={1.2}\`, \`fillLight position={[-3, -2, -2]} intensity={0.3}\`.
- Truyền \`transform\` và \`motion\` vào \`MotionRig\`.
- Truyền \`color\`, \`roughness\`, \`metalness\` từ \`config.appearance\` vào props của \`<${componentName} />\`.
`;
}
