import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import {
  createReceptacleGeometry,
  createSepalGeometry,
  createStemGeometry,
  createLeafGeometry,
} from './roseGeometry';

export interface RoseStemAssemblyProps {
  stemColor: string;
}

export const RoseStemAssembly: React.FC<RoseStemAssemblyProps> = ({ stemColor }) => {
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.50,
      metalness: 0.04,
      side: THREE.DoubleSide,
    });
  }, []);

  // Receptacle (Calyx cup): compact, inverted pear shape snugly cradling and covering petal roots
  const receptacleGeom = useMemo(
    () => createReceptacleGeometry(0.14, 0.042, 0.28, stemColor),
    [stemColor]
  );

  // 5 delicate sepals: pointed, curving upward around the base of the bud and flaring at tips
  const sepalGeom = useMemo(
    () => createSepalGeometry(0.46, 0.14, stemColor),
    [stemColor]
  );

  // Slender, naturally curved stem
  const stemGeom = useMemo(() => createStemGeometry(stemColor), [stemColor]);

  // Three natural leaves placed along stem
  const upperLeafGeom = useMemo(() => createLeafGeometry(0.92, 0.40, stemColor), [stemColor]);
  const midLeafGeom = useMemo(() => createLeafGeometry(1.05, 0.45, stemColor), [stemColor]);
  const lowerLeafGeom = useMemo(() => createLeafGeometry(0.88, 0.38, stemColor), [stemColor]);

  useEffect(() => {
    return () => {
      material.dispose();
      receptacleGeom.dispose();
      sepalGeom.dispose();
      stemGeom.dispose();
      upperLeafGeom.dispose();
      midLeafGeom.dispose();
      lowerLeafGeom.dispose();
    };
  }, [
    material,
    receptacleGeom,
    sepalGeom,
    stemGeom,
    upperLeafGeom,
    midLeafGeom,
    lowerLeafGeom,
  ]);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Receptacle (Calyx base cup) - positioned to enclose petal roots */}
      <group position={[0, 0.01, 0]}>
        <mesh geometry={receptacleGeom} material={material} castShadow receiveShadow />
      </group>

      {/* 2. 5 Green Sepals cupping under the petals */}
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 5 + 0.3;
        const radius = 0.11;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;

        return (
          <group
            key={`sepal-${i}`}
            position={[x, 0.00, z]}
            rotation={[0, angle, 0]}
          >
            {/* Clasping the bud base with gentle outward flare at tip */}
            <mesh geometry={sepalGeom} material={material} castShadow receiveShadow />
          </group>
        );
      })}

      {/* 3. Curved slender stem tube */}
      <mesh geometry={stemGeom} material={material} castShadow receiveShadow />

      {/* 4. Three leaves branching off the stem */}
      {/* Upper leaf right-forward */}
      <group position={[0.02, -1.15, 0.01]} rotation={[0.25, 0.85, -0.42]}>
        <mesh geometry={upperLeafGeom} material={material} castShadow receiveShadow />
      </group>

      {/* Middle leaf left-backward */}
      <group position={[-0.02, -2.05, -0.01]} rotation={[-0.2, -2.2, -0.38]}>
        <mesh geometry={midLeafGeom} material={material} castShadow receiveShadow />
      </group>

      {/* Lower leaf forward-right */}
      <group position={[0.01, -2.95, 0.01]} rotation={[0.35, 0.3, -0.45]}>
        <mesh geometry={lowerLeafGeom} material={material} castShadow receiveShadow />
      </group>
    </group>
  );
};
