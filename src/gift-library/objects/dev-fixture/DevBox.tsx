import React from 'react';

export interface DevBoxProps {
  color?: string;
  roughness?: number;
  metalness?: number;
}

/**
 * DevBox: A clean technical 3D fixture for Stage A pipeline testing.
 * Height is 2.0 units, centered at (0, 0, 0). Front faces +Z.
 * Pure component with no internal Canvas, lighting, UI, or mutable global state.
 */
export const DevBox: React.FC<DevBoxProps> = ({
  color = '#8A63D2',
  roughness = 0.4,
  metalness = 0.1,
}) => {
  return (
    <group>
      {/* Main beveled/rounded box body (height 2.0) */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.6, 2.0, 1.2]} />
        <meshStandardMaterial
          color={color}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>

      {/* Front indicator pill to clearly identify +Z orientation */}
      <mesh position={[0, 0, 0.61]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
        <meshStandardMaterial
          color="#FFFFFF"
          roughness={0.2}
          metalness={0.0}
        />
      </mesh>
    </group>
  );
};

export default DevBox;
