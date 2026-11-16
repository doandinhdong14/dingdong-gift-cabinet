import * as THREE from 'three';

let cachedHeartGeometry: THREE.BufferGeometry | null = null;

/**
 * Procedural 3D Heart Geometry Generator.
 * Implements a watertight, smooth mathematical manifold based on the Taubin algebraic formulation.
 *
 * Geometric Contract & Spec Specifications:
 * - Height: Exactly 2.0 units (Y from -1.0 to +1.0)
 * - Width: ~2.08 units (within spec range 2.0 - 2.2)
 * - Depth/Thickness: ~0.78 units (within spec range 0.65 - 0.9)
 * - Centered at (0, 0, 0)
 * - Front faces +Z
 * - Continuous front & back puffiness (no flat planar faces)
 * - Two rounded, plump lobes with a soft, distinct cleft at top
 * - Gently rounded bottom tip
 * - Triangle count: exactly 8,000 triangles (well below the 25,000 limit)
 * - Watertight manifold with analytical normal smoothing at poles
 */
export function createHeartGeometry(numTheta = 80, numPhi = 50): THREE.BufferGeometry {
  // Implicit function: F(x, y, z) = 0 defines the heart surface
  function F(x: number, y: number, z: number): number {
    const t = x * x + y * y + (9 / 4) * z * z - 1;
    return t * t * t - x * x * y * y * y - (9 / 80) * z * z * y * y * y;
  }

  const y0 = 0.2; // Internal star-shaped center point for spherical projection
  const rawVertices: number[] = [];
  const uvs: number[] = [];

  for (let j = 0; j <= numPhi; j++) {
    const v = j / numPhi;
    // phi from -pi/2 (south pole / bottom tip) to +pi/2 (north pole / top cleft)
    const phi = v * Math.PI - Math.PI / 2;
    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);

    for (let i = 0; i <= numTheta; i++) {
      const u = i / numTheta;
      // theta from -pi to +pi around the Y axis
      const theta = u * Math.PI * 2 - Math.PI;

      const dx = cosPhi * Math.sin(theta);
      const dy = sinPhi;
      const dz = cosPhi * Math.cos(theta);

      // Find radial distance r such that F(r*dx, y0 + r*dy, r*dz) = 0
      let rMin = 0.1;
      let rMax = 2.5;
      for (let step = 0.2; step <= 2.5; step += 0.05) {
        if (F(step * dx, y0 + step * dy, step * dz) > 0) {
          rMax = step;
          rMin = step - 0.05;
          break;
        }
      }

      // Binary search root finding (18 iterations gives sub-millimeter precision)
      for (let it = 0; it < 18; it++) {
        const mid = (rMin + rMax) / 2;
        if (F(mid * dx, y0 + mid * dy, mid * dz) > 0) {
          rMax = mid;
        } else {
          rMin = mid;
        }
      }
      const r = (rMin + rMax) / 2;

      let px = r * dx;
      let py = y0 + r * dy;
      let pz = r * dz;

      // Normalization to spec:
      // Height 2.0, Centered at Y=0, Width ~2.08, Depth ~0.78
      const rawCenterY = 0.118068;
      const scaleY = 2.0 / 2.236136;
      py = (py - rawCenterY) * scaleY;
      px = px * scaleY * 1.02;
      pz = pz * 0.58;

      rawVertices.push(px, py, pz);
      uvs.push(u, v);
    }
  }

  // Generate triangles with CCW winding (outward facing normals)
  const indices: number[] = [];
  for (let j = 0; j < numPhi; j++) {
    for (let i = 0; i < numTheta; i++) {
      const a = j * (numTheta + 1) + i;
      const b = (j + 1) * (numTheta + 1) + i;
      const c = (j + 1) * (numTheta + 1) + (i + 1);
      const d = j * (numTheta + 1) + (i + 1);

      indices.push(a, d, b);
      indices.push(b, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(rawVertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  // Smooth pole vertex normals
  const normals = geometry.getAttribute('normal') as THREE.BufferAttribute;

  // North pole (cleft apex)
  const northPoleNormal = new THREE.Vector3();
  for (let i = 0; i <= numTheta; i++) {
    const idx = numPhi * (numTheta + 1) + i;
    northPoleNormal.add(new THREE.Vector3(normals.getX(idx), normals.getY(idx), normals.getZ(idx)));
  }
  northPoleNormal.normalize();
  for (let i = 0; i <= numTheta; i++) {
    const idx = numPhi * (numTheta + 1) + i;
    normals.setXYZ(idx, northPoleNormal.x, northPoleNormal.y, northPoleNormal.z);
  }

  // South pole (bottom tip)
  const southPoleNormal = new THREE.Vector3();
  for (let i = 0; i <= numTheta; i++) {
    const idx = i;
    southPoleNormal.add(new THREE.Vector3(normals.getX(idx), normals.getY(idx), normals.getZ(idx)));
  }
  southPoleNormal.normalize();
  for (let i = 0; i <= numTheta; i++) {
    const idx = i;
    normals.setXYZ(idx, southPoleNormal.x, southPoleNormal.y, southPoleNormal.z);
  }

  normals.needsUpdate = true;
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  return geometry;
}

/**
 * Returns a cached singleton of the Heart geometry to prevent redundant GPU allocations.
 */
export function getHeartGeometry(): THREE.BufferGeometry {
  if (!cachedHeartGeometry) {
    cachedHeartGeometry = createHeartGeometry();
  }
  return cachedHeartGeometry;
}
