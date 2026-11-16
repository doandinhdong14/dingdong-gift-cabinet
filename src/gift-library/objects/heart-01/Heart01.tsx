import React, { useMemo } from 'react';
import { getHeartGeometry } from './geometry';

export interface Heart01Props {
  color?: string;
  roughness?: number;
  metalness?: number;
}

/**
 * Heart01: "Trái tim mẫu 1" (ID: heart-01)
 *
 * Visual brief compliance:
 * - 3D coral pink candy aesthetic, soft satin surface sheen.
 * - Symmetrical silhouette, continuous front & back curvature.
 * - Rounded lobes, soft upper cleft, gently boed lower tip.
 * - Standard height: 2.0 units, centered at origin (0, 0, 0), front faces +Z.
 * - Pure component: accepts appearance props; motion handled externally by MotionRig.
 * - Supports multiple independent instances concurrently in the same scene.
 */
export const Heart01: React.FC<Heart01Props> = ({
  color = '#F46C91',
  roughness = 0.32,
  metalness = 0.0,
}) => {
  // Reusable procedural geometry singleton (8,000 triangles, watertight manifold)
  const geometry = useMemo(() => getHeartGeometry(), []);

  return (
    <group>
      <mesh
        geometry={geometry}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={color}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>
    </group>
  );
};

export default Heart01;
