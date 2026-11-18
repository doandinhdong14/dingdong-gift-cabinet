import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { RosePetalMesh } from './RosePetalMesh';
import { RoseStemAssembly } from './RoseStemAssembly';
import { FlyingPetals } from './FlyingPetals';
import { AmbientDustParticles } from './AmbientDustParticles';
import { RoseRevealConfig } from '../../types';
import { RoseRevealState } from './types';

export interface RoseRevealSceneProps {
  config: RoseRevealConfig;
  state: RoseRevealState;
  bloomProgress: number;     // 0 to 1
  flightProgress: number;    // 0 to 1
  sceneOpacity?: number;     // 1 to 0 during transition
  paused?: boolean;
  onTriggerBloom: () => void;
  reducedMotion?: boolean;
}

export const RoseRevealScene: React.FC<RoseRevealSceneProps> = ({
  config,
  state,
  bloomProgress,
  flightProgress,
  sceneOpacity: _sceneOpacity = 1.0,
  paused = false,
  onTriggerBloom,
  reducedMotion = false,
}) => {
  const { camera } = useThree();
  const flowerGroupRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<OrbitControlsImpl>(null);

  const isInspecting = config.inspectionMode === true;
  const isInteractive = state === 'idle';

  // Manual inspection progress override if set in panel
  const effectiveBloomProgress =
    config.manualBloomProgress !== undefined && config.manualBloomProgress >= 0
      ? config.manualBloomProgress
      : bloomProgress;

  // Elevated camera perspective looking slightly down (approx 18-20 deg total)
  // reveals the lush concentric rosette and spiral heart while framing stem and leaves
  const baseCamPos = useMemo(() => new THREE.Vector3(0, 1.85, 7.2), []);
  const targetCamPos = useMemo(() => new THREE.Vector3(0, 2.1, 5.6), []);

  useFrame((r3fState, delta) => {
    if (paused) return;

    const time = r3fState.clock.getElapsedTime();
    const flower = flowerGroupRef.current;

    // 1. Subtle living sway with forward tilt
    if (flower) {
      const baseTiltX = 0.28; // ~16 deg forward tilt toward camera to present the bloom face
      if (state === 'idle') {
        flower.rotation.z = Math.sin(time * 0.85) * 0.012;
        flower.rotation.x = baseTiltX + Math.cos(time * 0.65) * 0.008;
        flower.position.y = 0.20 + Math.sin(time * 1.1) * 0.015;
      } else {
        flower.rotation.z = THREE.MathUtils.lerp(flower.rotation.z, 0, delta * 3);
        flower.rotation.x = THREE.MathUtils.lerp(flower.rotation.x, baseTiltX, delta * 3);
        flower.position.y = THREE.MathUtils.lerp(flower.position.y, 0.20, delta * 3);
      }
    }

    // 2. Camera Dolly and subtle Parallax
    if (!isInspecting && !reducedMotion) {
      if (state === 'blooming' || state === 'revealing' || state === 'completed') {
        const tDolly = Math.min(1, Math.max(0, flightProgress * 1.25));
        const eased = tDolly * tDolly * (3 - 2 * tDolly);
        camera.position.lerpVectors(baseCamPos, targetCamPos, eased);
      } else {
        const mouseX = r3fState.pointer.x * 0.12;
        const mouseY = r3fState.pointer.y * 0.08;
        const desiredX = baseCamPos.x + mouseX;
        const desiredY = baseCamPos.y + mouseY;
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, desiredX, delta * 2.5);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, desiredY, delta * 2.5);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, baseCamPos.z, delta * 2.5);
      }
      camera.lookAt(0, -0.45, 0);
    }
  });

  return (
    <>
      {/* Studio Romantic Lighting */}
      <ambientLight intensity={config.ambientLightIntensity * 0.85} color="#FFE4E8" />
      
      {/* Soft warm key light from top-right */}
      <directionalLight
        position={[2.5, 5.0, 4.0]}
        intensity={1.35}
        color="#FFF5F5"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Gentle cool lavender fill light for interior petal depth */}
      <directionalLight
        position={[-3.0, -0.5, 2.5]}
        intensity={0.45}
        color="#DDA0DD"
      />

      {/* Delicate rim light to trace petal silhouette */}
      <directionalLight
        position={[0, 3.2, -4.2]}
        intensity={0.92}
        color="#FFE4E8"
      />

      {/* Floating ambient dust particles */}
      <AmbientDustParticles count={36} color="#FFE4E8" speed={0.32} />

      {/* OrbitControls: Only active when inspectionMode is toggled on */}
      {isInspecting && (
        <OrbitControls
          ref={orbitRef}
          enablePan={false}
          enableDamping={true}
          dampingFactor={0.05}
          minDistance={2.5}
          maxDistance={12.0}
        />
      )}

      {/* Flying Petals Layer */}
      <FlyingPetals
        active={flightProgress > 0}
        flightProgress={flightProgress}
        count={config.flyingPetalsCount}
        burstSpeed={config.burstSpeed}
        fallSpeed={config.fallSpeed}
        spinSpeed={config.spinSpeed}
        petalColor={config.petalColor}
        petalInnerColor={config.petalInnerColor}
        petalEdgeColor={config.petalEdgeColor}
        flowerScale={config.flowerScale}
      />

      {/* Main Rose Model Group */}
      <group
        ref={flowerGroupRef}
        position={[0, 0.20, 0]}
        scale={[config.flowerScale, config.flowerScale, config.flowerScale]}
      >
        {/* Clickable hit proxy for the flower head */}
        {isInteractive && (
          <mesh
            position={[0, 0.65, 0]}
            onPointerDown={(e) => {
              e.stopPropagation();
              onTriggerBloom();
            }}
            onPointerOver={() => {
              if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
            }}
          >
            <sphereGeometry args={[0.9, 16, 16]} />
            <meshBasicMaterial visible={false} />
          </mesh>
        )}

        {/* Stem, Calyx & Leaves Assembly */}
        <RoseStemAssembly stemColor={config.stemColor} />

        {/* Multi-layered Petals Head */}
        <group position={[0, 0, 0]}>
          <RosePetalMesh
            bloomProgress={effectiveBloomProgress}
            petalColor={config.petalColor}
            petalInnerColor={config.petalInnerColor}
            petalEdgeColor={config.petalEdgeColor}
          />
        </group>
      </group>
    </>
  );
};
