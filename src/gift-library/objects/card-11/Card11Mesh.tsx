import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AssetConfig } from '../../types';
import { getHeartPosition, getHeartTangent } from './heartMath';

export interface Card11MeshProps {
  config?: AssetConfig;
  color?: string;
  roughness?: number;
  metalness?: number;
  paused?: boolean;
  quality?: 'low' | 'high';
}

/**
 * Creates high-DPI glowing canvas texture for a text phrase
 */
function createTextTexture(
  text: string,
  textColor: string,
  glowColor: string,
  glowIntensity: number
): { texture: THREE.CanvasTexture; aspect: number } {
  if (typeof document === 'undefined') {
    const canvas = {} as HTMLCanvasElement;
    return { texture: new THREE.CanvasTexture(canvas), aspect: 3.5 };
  }

  const fontSpec = 'bold 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';

  // Measure text width accurately
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  if (tempCtx) {
    tempCtx.font = fontSpec;
  }
  const metrics = tempCtx ? tempCtx.measureText(text) : { width: text.length * 26 };
  const textWidth = Math.ceil(metrics.width || text.length * 26);

  const padX = 48;
  const padY = 32;
  const baseW = textWidth + padX * 2;
  const baseH = 50 + padY * 2;
  const dpr = 2; // Sharp 2x retina

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(64, baseW * dpr);
  canvas.height = Math.max(32, baseH * dpr);
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, baseW, baseH);
    ctx.font = fontSpec;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const cx = baseW / 2;
    const cy = baseH / 2;

    // Pass 1: Broad luminous neon bloom
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = Math.round(18 * Math.max(0.2, glowIntensity));
    ctx.fillStyle = textColor;
    ctx.fillText(text, cx, cy);

    // Pass 2: Tight high-intensity core glow (matches text-shadow: 0 0 10px #fff)
    ctx.shadowBlur = Math.round(8 * Math.max(0.2, glowIntensity));
    ctx.shadowColor = '#FFFFFF';
    ctx.fillText(text, cx, cy);

    // Pass 3: Ultra crisp primary text
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = textColor;
    ctx.fillText(text, cx, cy);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  const aspect = Math.max(0.5, baseW / baseH);
  return { texture, aspect };
}

export const Card11Mesh: React.FC<Card11MeshProps> = ({
  config,
  color,
  paused = false,
  quality = 'high',
}) => {
  const c11 = config?.card11;

  // Extract parameters with safe fallbacks
  const primaryText = c11?.text?.trim() || 'I love you';
  const phrases = useMemo(() => {
    if (c11?.phrases && c11.phrases.length > 0) {
      const valid = c11.phrases.filter((p) => p && p.trim().length > 0);
      if (valid.length > 0) return valid;
    }
    return [primaryText];
  }, [c11?.phrases, primaryText]);

  const rawItemCount = c11?.itemCount ?? 100;
  const itemCount = quality === 'low'
    ? Math.min(60, Math.max(10, rawItemCount))
    : Math.min(160, Math.max(10, rawItemCount));

  const speed = c11?.speed ?? 1.0;
  const heartScale = c11?.heartScale ?? 1.0;
  const depth3D = c11?.depth3D ?? 1.0;
  const textColor = c11?.textColor || color || '#EA80B0';
  const glowColor = c11?.glowColor || '#FFFFFF';
  const secondaryColor = c11?.secondaryColor || '#FF6584';
  const useAlternatingColors = c11?.useAlternatingColors ?? false;
  const glowIntensity = c11?.glowIntensity ?? 1.2;
  const orientationMode = c11?.orientationMode || 'tangent';
  const trajectoryMode = c11?.trajectoryMode || 'original-matrix';
  const autoRotate = c11?.autoRotate ?? false;
  const autoRotateSpeed = c11?.autoRotateSpeed ?? 0.8;
  const tiltAngleDeg = c11?.tiltAngleDeg ?? -30;
  const textScale = c11?.fontSize ?? 1.0;

  // Generate cached textures for each phrase & color combination
  const textureCache = useMemo(() => {
    const map = new Map<string, { texture: THREE.CanvasTexture; aspect: number }>();

    phrases.forEach((phrase) => {
      // Primary color texture
      const keyPrimary = `${phrase}_${textColor}_${glowColor}_${glowIntensity}`;
      if (!map.has(keyPrimary)) {
        map.set(keyPrimary, createTextTexture(phrase, textColor, glowColor, glowIntensity));
      }

      // Secondary color texture if alternating colors enabled
      if (useAlternatingColors) {
        const keySecondary = `${phrase}_${secondaryColor}_${glowColor}_${glowIntensity}`;
        if (!map.has(keySecondary)) {
          map.set(keySecondary, createTextTexture(phrase, secondaryColor, glowColor, glowIntensity));
        }
      }
    });

    return map;
  }, [phrases, textColor, glowColor, secondaryColor, useAlternatingColors, glowIntensity]);

  // Clean up textures on unmount or cache recreation
  useEffect(() => {
    return () => {
      textureCache.forEach(({ texture }) => texture.dispose());
    };
  }, [textureCache]);

  // Base plane height for typography ribbon
  const basePlaneHeight = 0.26 * textScale;

  // Optimized geometry reuse: create one PlaneGeometry per phrase
  const geometries = useMemo(() => {
    const map = new Map<string, THREE.PlaneGeometry>();
    phrases.forEach((phrase) => {
      const keyPrimary = `${phrase}_${textColor}_${glowColor}_${glowIntensity}`;
      const texData = textureCache.get(keyPrimary);
      const aspect = texData?.aspect || 3.0;
      const width = basePlaneHeight * aspect;
      map.set(phrase, new THREE.PlaneGeometry(width, basePlaneHeight));
    });
    return map;
  }, [phrases, basePlaneHeight, textureCache, textColor, glowColor, glowIntensity]);

  useEffect(() => {
    return () => {
      geometries.forEach((geom) => geom.dispose());
    };
  }, [geometries]);

  // Setup items configuration array
  const items = useMemo(() => {
    return Array.from({ length: itemCount }, (_, i) => {
      const phraseIndex = i % phrases.length;
      const phrase = phrases[phraseIndex];
      const isAlt = useAlternatingColors && i % 2 === 1;
      const c = isAlt ? secondaryColor : textColor;
      const key = isAlt
        ? `${phrase}_${secondaryColor}_${glowColor}_${glowIntensity}`
        : `${phrase}_${textColor}_${glowColor}_${glowIntensity}`;
      const texData = textureCache.get(key) || createTextTexture(phrase, c, glowColor, glowIntensity);

      // Phase spacing: items are evenly spaced across the full 0..1 cycle
      const phaseOffset = i / itemCount;

      return {
        id: i,
        phrase,
        color: c,
        phaseOffset,
        texture: texData.texture,
        aspect: texData.aspect,
      };
    });
  }, [itemCount, phrases, useAlternatingColors, secondaryColor, textColor, glowColor, glowIntensity, textureCache]);

  // References for per-frame animation
  const groupRef = useRef<THREE.Group>(null);
  const itemMeshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (paused) return;

    // Advance trajectory time: speed 1.0 completes a full 0..1 cycle in 20 seconds
    const dt = delta * speed * 0.05;
    timeRef.current += dt;
    const baseTime = timeRef.current;

    // Optional subtle auto-rotation of whole 3D heart
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * autoRotateSpeed * 0.5;
    }

    const tempPos = new THREE.Vector3();
    const tiltRad = THREE.MathUtils.degToRad(tiltAngleDeg);

    // Update positions and orientations for each text item
    for (let i = 0; i < items.length; i++) {
      const mesh = itemMeshRefs.current[i];
      if (!mesh) continue;

      const item = items[i];
      const u = (baseTime + item.phaseOffset) % 1;

      // 3D spatial position on heart curve
      getHeartPosition(u, trajectoryMode, heartScale, depth3D, tempPos);
      mesh.position.copy(tempPos);

      if (orientationMode === 'tangent') {
        // Tangent orientation with custom tilt angle (default -30deg matching original CSS)
        const { angleZ } = getHeartTangent(u, trajectoryMode, heartScale, depth3D);
        mesh.rotation.set(0, 0, angleZ + tiltRad);
      } else {
        // Billboard mode: always face the camera directly in 3D for effortless readability
        mesh.quaternion.copy(state.camera.quaternion);
      }
    }
  });

  const fallbackGeom = useMemo(() => new THREE.PlaneGeometry(basePlaneHeight * 3, basePlaneHeight), [basePlaneHeight]);
  useEffect(() => {
    return () => fallbackGeom.dispose();
  }, [fallbackGeom]);

  return (
    <group ref={groupRef} name="card-11-kinetic-heart">
      {/* 3D Ambient center glow aura */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.38 * heartScale, 16, 16]} />
        <meshBasicMaterial
          color={textColor}
          transparent
          opacity={0.14 * glowIntensity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Array of streaming glowing text meshes */}
      {items.map((item, idx) => {
        const geom = geometries.get(item.phrase) || fallbackGeom;
        return (
          <mesh
            key={item.id}
            geometry={geom}
            ref={(el) => {
              itemMeshRefs.current[idx] = el;
            }}
          >
            <meshBasicMaterial
              map={item.texture}
              transparent
              opacity={0.92}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
};

export default Card11Mesh;