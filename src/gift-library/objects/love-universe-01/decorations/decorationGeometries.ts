import * as THREE from 'three';
import { getHeartGeometry } from '../../heart-01/geometry';

export { getHeartGeometry };

let cachedStar3DGeometry: THREE.BufferGeometry | null = null;
let cachedGiftBox3DGeometry: THREE.BufferGeometry | null = null;

/**
 * Creates a faceted, watertight 3D 5-pointed star with beveled front & back faces.
 */
export function createStar3DGeometry(): THREE.BufferGeometry {
  const numPoints = 5;
  const rOuter = 0.55;
  const rInner = 0.24;
  const depth = 0.22;

  const positions: number[] = [];
  const indices: number[] = [];

  // Vertex 0: Front Apex (0, 0, +depth)
  positions.push(0, 0, depth);
  // Vertex 1: Back Apex (0, 0, -depth)
  positions.push(0, 0, -depth);

  // Vertices 2..11: Perimeter points at z = 0
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const r = i % 2 === 0 ? rOuter : rInner;
    positions.push(Math.cos(angle) * r, Math.sin(angle) * r, 0);
  }

  // Front faces: connecting Front Apex (0) with perimeter edge (i, i+1)
  for (let i = 0; i < 10; i++) {
    const curr = 2 + i;
    const next = 2 + ((i + 1) % 10);
    indices.push(0, curr, next);
  }

  // Back faces: connecting Back Apex (1) with perimeter edge (i+1, i)
  for (let i = 0; i < 10; i++) {
    const curr = 2 + i;
    const next = 2 + ((i + 1) % 10);
    indices.push(1, next, curr);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  return geometry;
}

export function getStar3DGeometry(): THREE.BufferGeometry {
  if (!cachedStar3DGeometry) {
    cachedStar3DGeometry = createStar3DGeometry();
  }
  return cachedStar3DGeometry;
}

/**
 * Helper to merge non-indexed geometries into a single BufferGeometry
 */
function mergeGeometries(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const nonIndexed = geos.map((g) => (g.index ? g.toNonIndexed() : g.clone()));
  let totalVerts = 0;
  for (const g of nonIndexed) {
    totalVerts += g.getAttribute('position').count;
  }

  const posArr = new Float32Array(totalVerts * 3);
  const normArr = new Float32Array(totalVerts * 3);
  let offset = 0;

  for (const g of nonIndexed) {
    const p = g.getAttribute('position').array as Float32Array;
    const n = g.getAttribute('normal').array as Float32Array;
    posArr.set(p, offset * 3);
    normArr.set(n, offset * 3);
    offset += g.getAttribute('position').count;
    g.dispose();
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normArr, 3));
  merged.computeBoundingBox();
  merged.computeBoundingSphere();
  return merged;
}

/**
 * Creates a watertight 3D Gift Box mesh: main cube + lid + crossed ribbon wrapping
 */
export function createGiftBox3DGeometry(): THREE.BufferGeometry {
  // 1. Box container
  const boxGeo = new THREE.BoxGeometry(0.55, 0.55, 0.55);
  boxGeo.translate(0, -0.05, 0);

  // 2. Lid
  const lidGeo = new THREE.BoxGeometry(0.60, 0.14, 0.60);
  lidGeo.translate(0, 0.24, 0);

  // 3. Ribbon band along Z
  const ribbonZ = new THREE.BoxGeometry(0.12, 0.65, 0.62);
  ribbonZ.translate(0, 0.01, 0);

  // 4. Ribbon band along X
  const ribbonX = new THREE.BoxGeometry(0.62, 0.65, 0.12);
  ribbonX.translate(0, 0.01, 0);

  // 5. Bow knot on top
  const bowGeo = new THREE.SphereGeometry(0.09, 8, 8);
  bowGeo.scale(1.3, 0.7, 1.3);
  bowGeo.translate(0, 0.33, 0);

  const merged = mergeGeometries([boxGeo, lidGeo, ribbonZ, ribbonX, bowGeo]);
  boxGeo.dispose();
  lidGeo.dispose();
  ribbonZ.dispose();
  ribbonX.dispose();
  bowGeo.dispose();

  return merged;
}

export function getGiftBox3DGeometry(): THREE.BufferGeometry {
  if (!cachedGiftBox3DGeometry) {
    cachedGiftBox3DGeometry = createGiftBox3DGeometry();
  }
  return cachedGiftBox3DGeometry;
}
