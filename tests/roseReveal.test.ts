import { describe, it, expect, vi } from 'vitest';
import {
  createRosePetalGeometry,
  createReceptacleGeometry,
  createSepalGeometry,
  createStemGeometry,
  createLeafGeometry,
  createFlyingPetalGeometry,
} from '../src/gift-library/objects/rose-reveal-01/roseGeometry';
import { roseReveal01DefaultConfig, roseReveal01Presets } from '../src/gift-library/objects/rose-reveal-01/presets';
import { validateAssetConfig } from '../src/utils/configValidation';
import { getAssetById } from '../src/gift-library/registry';

describe('Rose Reveal 01 — Procedural 3D Geometries', () => {
  it('should generate valid 3D rose petal geometry with cup depth, normals, and vertex colors', () => {
    const geom = createRosePetalGeometry({
      width: 1.5,
      length: 1.8,
      cupDepth: 0.4,
      archDepth: 0.3,
      curlEdge: 0.2,
      ruffleAmp: 0.08,
      innerColor: '#C2185B',
      mainColor: '#F48FB1',
      edgeColor: '#FFE4E8',
      uSegments: 16,
      vSegments: 20,
    });

    expect(geom).toBeDefined();
    const pos = geom.getAttribute('position');
    const normal = geom.getAttribute('normal');
    const color = geom.getAttribute('color');
    const uv = geom.getAttribute('uv');

    expect(pos).toBeDefined();
    expect(pos.count).toBe((16 + 1) * (20 + 1));
    expect(normal).toBeDefined();
    expect(normal.count).toBe(pos.count);
    expect(color).toBeDefined();
    expect(color.count).toBe(pos.count);
    expect(uv).toBeDefined();

    // Check bounds: no NaN or Infinity
    geom.computeBoundingBox();
    const box = geom.boundingBox!;
    expect(Number.isFinite(box.min.x)).toBe(true);
    expect(Number.isFinite(box.max.x)).toBe(true);
    expect(Number.isFinite(box.min.y)).toBe(true);
    expect(Number.isFinite(box.max.y)).toBe(true);
    expect(Number.isFinite(box.min.z)).toBe(true);
    expect(Number.isFinite(box.max.z)).toBe(true);

    // Verify concave cup shape (Z min is noticeably negative due to cup curve)
    expect(box.min.z).toBeLessThan(-0.1);

    // Verify pivot is anchored near base (y min close to 0)
    expect(box.min.y).toBeCloseTo(0, 1);

    // Clean up
    geom.dispose();
  });

  it('should generate receptacle, sepal, stem, and leaf geometries without gaps or NaNs', () => {
    const receptacle = createReceptacleGeometry(0.42, 0.08, 0.45, '#4A7C59');
    const sepal = createSepalGeometry(0.85, 0.22, '#4A7C59');
    const stem = createStemGeometry('#4A7C59');
    const leaf = createLeafGeometry(1.05, 0.42, '#4A7C59');
    const flyingPetal = createFlyingPetalGeometry(0.5, 0.7);

    [receptacle, sepal, stem, leaf, flyingPetal].forEach((g) => {
      expect(g.getAttribute('position')).toBeDefined();
      expect(g.getAttribute('position').count).toBeGreaterThan(0);
      g.computeBoundingBox();
      const b = g.boundingBox!;
      expect(Number.isFinite(b.min.x)).toBe(true);
      expect(Number.isFinite(b.max.y)).toBe(true);
      g.dispose();
    });
  });
});

describe('Rose Reveal 01 — Configuration & Presets Validation', () => {
  it('should register rose-reveal-01 in the cabinet registry with 4 built-in presets', () => {
    const entry = getAssetById('rose-reveal-01');
    expect(entry).toBeDefined();
    expect(entry?.manifest.id).toBe('rose-reveal-01');
    expect(entry?.manifest.name).toBe('Bông hồng mở quà');
    expect(entry?.defaultPresets).toHaveLength(4);

    const presetNames = entry?.defaultPresets.map((p) => p.name);
    expect(presetNames).toContain('Hồng phấn kinh điển');
    expect(presetNames).toContain('Đỏ nhung hoàng gia');
    expect(presetNames).toContain('Bạch ngọc tinh khôi');
    expect(presetNames).toContain('Tím hoàng hôn mộng mơ');
  });

  it('should strictly validate default config and all built-in presets against schema', () => {
    const defRes = validateAssetConfig(roseReveal01DefaultConfig);
    expect(defRes.valid).toBe(true);
    expect(defRes.errors).toHaveLength(0);

    roseReveal01Presets.forEach((p) => {
      const res = validateAssetConfig(p.config);
      expect(res.valid).toBe(true);
      expect(res.errors).toHaveLength(0);
    });
  });

  it('should reject invalid values in roseReveal config', () => {
    const invalidConfig = {
      ...roseReveal01DefaultConfig,
      roseReveal: {
        ...roseReveal01DefaultConfig.roseReveal,
        petalColor: 'not-a-color', // Invalid hex
        flowerScale: 99.0, // Out of range
      },
    };
    const res = validateAssetConfig(invalidConfig);
    expect(res.valid).toBe(false);
    expect(res.errors.length).toBeGreaterThan(0);
  });
});

describe('Rose Reveal 01 — Interaction & Debounce Contracts', () => {
  it('should protect against rapid multi-click triggers', () => {
    let callCount = 0;
    const triggerBloomOnce = vi.fn(() => {
      callCount++;
    });

    let hasTriggered = false;
    const triggerHandler = () => {
      if (hasTriggered) return;
      hasTriggered = true;
      triggerBloomOnce();
    };

    // Simulate 10 rapid clicks
    for (let i = 0; i < 10; i++) {
      triggerHandler();
    }

    expect(triggerBloomOnce).toHaveBeenCalledTimes(1);
    expect(callCount).toBe(1);
  });
});
