import { describe, it, expect } from 'vitest';
import {
  generateConfigJson,
  generateJsxSnippet,
  generateAiInstructions,
  getComponentNameFromId,
} from '../src/utils/codeGeneration';
import { devBoxManifest } from '../src/gift-library/objects/dev-fixture/manifest';
import { devBoxDefaultConfig } from '../src/gift-library/objects/dev-fixture/presets';

describe('Code Generation & AI Snippets', () => {
  it('should format component name from ID correctly', () => {
    expect(getComponentNameFromId('dev-box-fixture')).toBe('DevBox');
    expect(getComponentNameFromId('heart-01')).toBe('Heart01');
    expect(getComponentNameFromId('paper-plane-02')).toBe('PaperPlane02');
  });

  it('should generate valid JSON string from AssetConfig', () => {
    const jsonStr = generateConfigJson(devBoxDefaultConfig);
    const parsed = JSON.parse(jsonStr);
    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.assetId).toBe('dev-box-fixture');
    expect(parsed.appearance.color).toBe(devBoxDefaultConfig.appearance.color);
  });

  it('should generate runnable JSX with real project imports', () => {
    const jsx = generateJsxSnippet(devBoxManifest, devBoxDefaultConfig);
    expect(jsx).toContain("import { Canvas } from '@react-three/fiber';");
    expect(jsx).toContain("import { MotionRig } from './gift-library/motion/MotionRig';");
    expect(jsx).toContain("import { DevBox } from './gift-library/objects/dev-fixture';");
    expect(jsx).toContain('<Canvas');
    expect(jsx).toContain('<MotionRig');
    expect(jsx).toContain('<DevBox');
  });

  it('should generate complete instructions for AI', () => {
    const aiText = generateAiInstructions(devBoxManifest, devBoxDefaultConfig);
    expect(aiText).toContain('Chỉ dẫn AI: Ghép chi tiết thiệp DingDong Gift');
    expect(aiText).toContain('dev-box-fixture');
    expect(aiText).toContain('KHÔNG TỰ Ý DỰNG LẠI HÌNH HỌC (GEOMETRY)');
    expect(aiText).toContain('npm install three @react-three/fiber @react-three/drei');
    expect(aiText).toContain(devBoxDefaultConfig.appearance.color);
  });
});
