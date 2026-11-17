import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { UniverseElementLayout } from './types';
import { createFlipUvMaterial } from './flipUvShader';
import { wrapY } from './motionUtils';

export interface PhotoCardMeshProps {
  item: UniverseElementLayout;
  photoScaleFactor?: number;
  driftEnabled?: boolean;
  driftSpeed?: number;
  cloudHeight?: number;
  isOpened: boolean;
  paused?: boolean;
  floatAmplitude?: number;
}

export const PhotoCardMesh: React.FC<PhotoCardMeshProps> = ({
  item,
  photoScaleFactor = 0.72,
  driftEnabled = true,
  driftSpeed = 0.35,
  cloudHeight = 7.2,
  isOpened,
  paused = false,
  floatAmplitude = 0.12,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const timeRef = useRef<number>(0);
  const driftOffsetRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(isOpened ? 1 : 0);

  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let active = true;
    const loader = new THREE.TextureLoader();

    loader.load(
      item.content,
      (loadedTex) => {
        if (!active) {
          loadedTex.dispose();
          return;
        }
        loadedTex.generateMipmaps = true;
        loadedTex.minFilter = THREE.LinearMipmapLinearFilter;
        loadedTex.magFilter = THREE.LinearFilter;
        setTexture(loadedTex);
      },
      undefined,
      (err) => {
        console.warn('Failed to load universe photo texture:', err);
      }
    );

    return () => {
      active = false;
      if (texture) {
        texture.dispose();
      }
    };
  }, [item.content]);

  const material = useMemo(() => {
    if (!texture) return null;
    const mat = createFlipUvMaterial(texture, '#FFFFFF', isOpened ? 1 : 0);
    materialRef.current = mat;
    return mat;
  }, [texture, isOpened]);

  useEffect(() => {
    return () => {
      if (material) {
        material.dispose();
      }
    };
  }, [material]);

  // Borderless rectangular 3D photo plane (3:4 portrait ratio) scaled by photoScaleFactor
  const cardWidth = 0.85 * Math.max(0.3, Math.min(2.0, photoScaleFactor));
  const cardHeight = 1.14 * Math.max(0.3, Math.min(2.0, photoScaleFactor));

  useFrame((_, delta) => {
    const safeDelta = Math.min(delta, 0.1);
    if (!paused) {
      timeRef.current += safeDelta;
    }

    // Entrance animation progress smoothly toward target
    const target = isOpened ? 1 : 0;
    const animSpeed = 1.2;
    if (currentProgressRef.current < target) {
      currentProgressRef.current = Math.min(target, currentProgressRef.current + safeDelta * animSpeed);
    } else if (currentProgressRef.current > target) {
      currentProgressRef.current = Math.max(target, currentProgressRef.current - safeDelta * 2.5);
    }

    if (groupRef.current) {
      const time = timeRef.current;
      const amp = floatAmplitude;

      // Continuous downward drift distance accumulation (no jump on speed change)
      if (!paused && driftEnabled) {
        driftOffsetRef.current += driftSpeed * safeDelta;
      }

      // Wrap Y coordinate for continuous downward drift
      const wrappedY = wrapY(item.position[1], driftOffsetRef.current, cloudHeight);

      const dy = Math.sin(time * item.floatSpeed + item.phase) * amp;
      const dx = Math.cos(time * item.floatSpeed * 0.7 + item.phase) * (amp * 0.3);
      const dRotZ = Math.sin(time * item.floatSpeed * 0.5 + item.phase) * 0.02;

      groupRef.current.position.set(
        item.position[0] + dx,
        wrappedY + dy,
        item.position[2]
      );
      groupRef.current.rotation.z = item.rotation[2] + dRotZ;

      // Staggered entrance animation
      const stagger = (item.phase / (Math.PI * 2)) * 0.25;
      const rawP = currentProgressRef.current;
      const progress = Math.max(0, Math.min(1, (rawP - stagger) / (1 - stagger)));
      const ease = 1 - Math.pow(1 - progress, 3);

      const targetScale = item.scale[0] * ease;
      groupRef.current.scale.set(targetScale, targetScale, targetScale);

      if (materialRef.current) {
        materialRef.current.uniforms.uOpacity.value = ease;
      }

      groupRef.current.visible = progress > 0.01;
    }
  });

  return (
    <group
      ref={groupRef}
      position={item.position}
      rotation={item.rotation}
    >
      <mesh material={material || undefined}>
        <planeGeometry args={[cardWidth, cardHeight]} />
      </mesh>
    </group>
  );
};

export default PhotoCardMesh;
