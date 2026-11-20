import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { Card11 } from '../src/gift-library/objects/card-11/Card11';
import { card11Manifest } from '../src/gift-library/objects/card-11/manifest';
import { card11DefaultConfig, card11Presets } from '../src/gift-library/objects/card-11/presets';
import {
  evaluateKeyframeY,
  getHeartPosition,
  getHeartTangent,
} from '../src/gift-library/objects/card-11/heartMath';
import { validateAssetConfig } from '../src/utils/configValidation';
import { generateJsxSnippet, generateAiInstructions } from '../src/utils/codeGeneration';
import * as THREE from 'three';

describe('Card 11 (Exact I Love You Animation Matrix) Tests', () => {
  it('should render the exact HTML DOM from card 11 with id="ui" and 100 love items', () => {
    const { container } = render(React.createElement(Card11, { config: card11DefaultConfig }));
    const ui = container.querySelector('#ui');
    expect(ui).not.toBeNull();
    const loves = container.querySelectorAll('.love');
    expect(loves.length).toBe(100);
    const word = container.querySelector('.love_word');
    expect(word).not.toBeNull();
    expect(word?.textContent).toBe('I love you');
  });

  it('should have a compliant and approved manifest', () => {
    expect(card11Manifest.id).toBe('card-11');
    expect(card11Manifest.name).toBe('Card 11');
    expect(card11Manifest.version).toBe('1.0.0');
    expect(card11Manifest.kind).toBe('3d');
    expect(card11Manifest.category).toBe('Trái tim');
    expect(card11Manifest.status).toBe('approved');
    expect(card11Manifest.source).toBe('procedural');
    expect(card11Manifest.supportedMotions).toEqual(
      expect.arrayContaining(['float', 'heartbeat', 'spin'])
    );
    expect(card11Manifest.tags).toContain('card 11');
  });

  it('should have a valid default config matching card 11 specification', () => {
    expect(card11DefaultConfig.schemaVersion).toBe(1);
    expect(card11DefaultConfig.assetId).toBe('card-11');
    expect(card11DefaultConfig.card11).toBeDefined();

    const c11 = card11DefaultConfig.card11!;
    expect(c11.text).toBe('I love you');
    expect(c11.phrases).toContain('I love you');
    expect(c11.itemCount).toBe(100);
    expect(c11.speed).toBe(1.0);
    expect(c11.heartScale).toBe(0.85);
    expect(c11.depth3D).toBe(0);
    expect(c11.textColor).toBe('#EA80B0');
    expect(c11.glowColor).toBe('#FFFFFF');
    expect(c11.orientationMode).toBe('tangent');
    expect(c11.trajectoryMode).toBe('original-matrix');

    const validation = validateAssetConfig(card11DefaultConfig);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('should provide 5 high-quality built-in presets with distinct themes', () => {
    expect(card11Presets).toHaveLength(5);

    const names = card11Presets.map((p) => p.name);
    expect(names).toContain('Hồng Neon Kinh Điển (Card 11)');
    expect(names).toContain('Lời Yêu Ngọt Ngào (Tiếng Việt)');
    expect(names).toContain('Vàng Ánh Kim Hoàng Gia');
    expect(names).toContain('Tím & Xanh Huyền Ảo Cyber');
    expect(names).toContain('Đỏ Rượu Nồng Nàn');

    card11Presets.forEach((preset) => {
      expect(preset.assetId).toBe('card-11');
      expect(preset.isBuiltIn).toBe(true);
      const validation = validateAssetConfig(preset.config);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('Heart Trajectory & Math Evaluation', () => {
    it('should accurately evaluate keyframes at exact time fractions', () => {
      expect(evaluateKeyframeY(0.0)).toBeCloseTo(180, 1);
      expect(evaluateKeyframeY(0.18)).toBeCloseTo(0, 1);
      expect(evaluateKeyframeY(0.25)).toBeCloseTo(112.5, 1);
      expect(evaluateKeyframeY(0.50)).toBeCloseTo(180, 1);
      expect(evaluateKeyframeY(0.75)).toBeCloseTo(450, 1);
      expect(evaluateKeyframeY(1.0)).toBeCloseTo(180, 1);
    });

    it('should compute smooth continuous 3D heart positions in original-matrix mode', () => {
      const pos = new THREE.Vector3();
      getHeartPosition(0.0, 'original-matrix', 1.0, 1.0, pos);
      expect(Number.isFinite(pos.x)).toBe(true);
      expect(Number.isFinite(pos.y)).toBe(true);
      expect(Number.isFinite(pos.z)).toBe(true);

      getHeartPosition(0.5, 'original-matrix', 1.0, 1.0, pos);
      expect(Number.isFinite(pos.x)).toBe(true);
      expect(Number.isFinite(pos.y)).toBe(true);
      expect(Number.isFinite(pos.z)).toBe(true);
    });

    it('should compute 3D spatial depth when depth3D is enabled', () => {
      const pos3D = new THREE.Vector3();
      getHeartPosition(0.25, 'original-matrix', 1.0, 1.5, pos3D);
      const posFlat = new THREE.Vector3();
      getHeartPosition(0.25, 'original-matrix', 1.0, 0.0, posFlat);

      expect(posFlat.z).toBeCloseTo(0, 5);
      expect(Math.abs(pos3D.z)).toBeGreaterThan(0.5);
    });

    it('should compute smooth-3d parametric positions', () => {
      const pos = new THREE.Vector3();
      getHeartPosition(0.0, 'smooth-3d', 1.0, 1.0, pos);
      expect(Number.isFinite(pos.x)).toBe(true);
      expect(Number.isFinite(pos.y)).toBe(true);
      expect(Number.isFinite(pos.z)).toBe(true);
    });

    it('should compute valid 3D tangent vectors and angles', () => {
      const { tangent, angleZ } = getHeartTangent(0.25, 'original-matrix', 1.0, 1.0);
      expect(Number.isFinite(tangent.x)).toBe(true);
      expect(Number.isFinite(tangent.y)).toBe(true);
      expect(Number.isFinite(tangent.z)).toBe(true);
      expect(Number.isFinite(angleZ)).toBe(true);
      expect(tangent.length()).toBeCloseTo(1.0, 3);
    });
  });

  describe('Config Validation & Error Handling', () => {
    it('should reject invalid card11 properties', () => {
      const badConfig = {
        ...card11DefaultConfig,
        card11: {
          ...card11DefaultConfig.card11!,
          textColor: 'invalid-color',
          itemCount: 9999, // exceeds max 160
          speed: -5,       // out of range
        },
      };

      const result = validateAssetConfig(badConfig);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });

    it('should validate multi-phrase streams and custom fonts', () => {
      const customConfig = {
        ...card11DefaultConfig,
        card11: {
          ...card11DefaultConfig.card11!,
          text: 'Anh yêu em',
          phrases: ['Anh yêu em', 'Thương em nhất', 'Mãi mãi bên nhau'],
          fontSize: 1.4,
          tiltAngleDeg: -45,
          useAlternatingColors: true,
          secondaryColor: '#38BDF8',
        },
      };

      const result = validateAssetConfig(customConfig);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Code Generation for Card 11', () => {
    it('should generate ready-to-run JSX snippet for Card 11', () => {
      const jsx = generateJsxSnippet(card11Manifest, card11DefaultConfig);
      expect(jsx).toContain("import { Card11 } from './gift-library/objects/card-11';");
      expect(jsx).toContain('<Card11');
      expect(jsx).toContain('CardGreeting11');
      expect(jsx).toContain('card11');
    });

    it('should generate complete AI integration instructions for Card 11', () => {
      const aiPrompt = generateAiInstructions(card11Manifest, card11DefaultConfig);
      expect(aiPrompt).toContain('Chỉ dẫn AI: Ghép Card 11');
      expect(aiPrompt).toContain('card-11');
      expect(aiPrompt).toContain('Card11');
    });
  });
});
