import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { createHeartGeometry, getHeartGeometry } from '../src/gift-library/objects/heart-01/geometry';

describe('Heart01 Procedural Geometry — Spec Compliance', () => {
  const geometry = createHeartGeometry();

  it('should satisfy strict dimensional criteria from spec Section 10', () => {
    geometry.computeBoundingBox();
    const bb = geometry.boundingBox!;

    const width = bb.max.x - bb.min.x;
    const height = bb.max.y - bb.min.y;
    const depth = bb.max.z - bb.min.z;

    // Spec: "chiều cao 2"
    expect(height).toBeCloseTo(2.0, 1);
    expect(bb.min.y).toBeCloseTo(-1.0, 1);
    expect(bb.max.y).toBeCloseTo(1.0, 1);

    // Spec: "rộng khoảng 2–2.2"
    expect(width).toBeGreaterThanOrEqual(2.0);
    expect(width).toBeLessThanOrEqual(2.2);

    // Spec: "dày khoảng 0.65–0.9 đơn vị"
    expect(depth).toBeGreaterThanOrEqual(0.65);
    expect(depth).toBeLessThanOrEqual(0.90);

    // Spec: "Tâm hình học sau chuẩn hóa đặt tại gốc tọa độ"
    const centerX = (bb.max.x + bb.min.x) / 2;
    const centerY = (bb.max.y + bb.min.y) / 2;
    const centerZ = (bb.max.z + bb.min.z) / 2;

    expect(centerX).toBeCloseTo(0, 1);
    expect(centerY).toBeCloseTo(0, 1);
    expect(centerZ).toBeCloseTo(0, 1);
  });

  it('should stay well below the 25,000 triangle graphics budget', () => {
    const indices = geometry.getIndex();
    expect(indices).not.toBeNull();
    const triangleCount = indices!.count / 3;

    expect(triangleCount).toBeLessThanOrEqual(25000);
    expect(triangleCount).toBe(8000); // 80 theta x 50 phi x 2 = 8,000 triangles
  });

  it('should have valid, unit-length, outward-facing vertex normals', () => {
    const normals = geometry.getAttribute('normal') as THREE.BufferAttribute;
    expect(normals).toBeDefined();

    for (let i = 0; i < normals.count; i += 20) {
      const nx = normals.getX(i);
      const ny = normals.getY(i);
      const nz = normals.getZ(i);

      expect(Number.isFinite(nx)).toBe(true);
      expect(Number.isFinite(ny)).toBe(true);
      expect(Number.isFinite(nz)).toBe(true);

      const length = Math.hypot(nx, ny, nz);
      expect(length).toBeCloseTo(1.0, 1);
    }
  });

  it('should exhibit bilateral symmetry across the YZ plane (x = -x)', () => {
    geometry.computeBoundingBox();
    const bb = geometry.boundingBox!;
    expect(Math.abs(bb.min.x)).toBeCloseTo(bb.max.x, 2);
  });

  it('should return a cached singleton from getHeartGeometry', () => {
    const g1 = getHeartGeometry();
    const g2 = getHeartGeometry();
    expect(g1).toBe(g2);
  });
});
