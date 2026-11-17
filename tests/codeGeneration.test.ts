import { describe, it, expect } from 'vitest';
import {
  generateConfigJson,
  generateJsxSnippet,
  generateAiInstructions,
  getComponentNameFromId,
} from '../src/utils/codeGeneration';
import { devBoxManifest } from '../src/gift-library/objects/dev-fixture/manifest';
import { devBoxDefaultConfig } from '../src/gift-library/objects/dev-fixture/presets';
import { loveUniverse01Manifest } from '../src/gift-library/objects/love-universe-01/manifest';
import { loveUniverse01DefaultConfig } from '../src/gift-library/objects/love-universe-01/presets';

describe('Code Generation & AI Snippets', () => {
  it('should format component name from ID correctly', () => {
    expect(getComponentNameFromId('dev-box-fixture')).toBe('DevBox');
    expect(getComponentNameFromId('heart-01')).toBe('Heart01');
    expect(getComponentNameFromId('love-universe-01')).toBe('LoveUniverse01');
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

  it('should generate runnable JSX for love-universe-01 without wrapping MotionRig', () => {
    const jsx = generateJsxSnippet(loveUniverse01Manifest, loveUniverse01DefaultConfig);
    expect(jsx).toContain("import { LoveUniverse01 } from './gift-library/objects/love-universe-01';");
    expect(jsx).toContain('<LoveUniverse01');
    expect(jsx).toContain('config={assetConfig}');
  });

  it('should generate complete instructions for AI', () => {
    const aiText = generateAiInstructions(devBoxManifest, devBoxDefaultConfig);
    expect(aiText).toContain('Chỉ dẫn AI: Ghép chi tiết thiệp DingDong Gift');
    expect(aiText).toContain('dev-box-fixture');
    expect(aiText).toContain('KHÔNG TỰ Ý DỰNG LẠI HÌNH HỌC (GEOMETRY)');
    expect(aiText).toContain('npm install three @react-three/fiber @react-three/drei');
    expect(aiText).toContain(devBoxDefaultConfig.appearance.color);
  });

  it('should generate complete AI instructions for love-universe-01', () => {
    const aiText = generateAiInstructions(loveUniverse01Manifest, loveUniverse01DefaultConfig);
    expect(aiText).toContain('Chỉ dẫn AI: Ghép Vũ trụ lời chúc vào thiệp DingDong Gift');
    expect(aiText).toContain('love-universe-01');
    expect(aiText).toContain('LoveUniverse01');
  });
});
