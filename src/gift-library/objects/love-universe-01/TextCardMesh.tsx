import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { UniverseElementLayout } from './types';
import { createFlipUvMaterial } from './flipUvShader';
import { wrapY } from './motionUtils';

export interface TextCardMeshProps {
  item: UniverseElementLayout;
  textColor?: string;
  glowEnabled?: boolean;
  glowIntensity?: number;
  glowSpread?: number;
  glowColor?: string;
  textScaleFactor?: number;
  driftEnabled?: boolean;
  driftSpeed?: number;
  cloudHeight?: number;
  isOpened: boolean;
  paused?: boolean;
  floatAmplitude?: number;
}

/**
 * Creates dual procedural textures:
 * 1) coreTex: ultra-crisp near-white cream text with 0 blur
 * 2) haloTex: wide warm-gold luminous halo for Additive Blending
 */
function createTextDualTextures(
  text: string,
  textColor: string,
  glowColor: string,
  glowSpread: number
): {
  coreTexture: THREE.CanvasTexture;
  haloTexture: THREE.CanvasTexture;
  aspect: number;
} {
  const fontSpec = '400 36px "Comfortaa", "Quicksand", "Be Vietnam Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

  // Measure text width using temporary canvas
  const testCanvas = document.createElement('canvas');
  const testCtx = testCanvas.getContext('2d');
  if (testCtx) {
    testCtx.font = fontSpec;
  }
  const textMetrics = testCtx ? testCtx.measureText(text) : { width: text.length * 20 };
  const textWidth = Math.ceil(textMetrics.width || text.length * 20);

  // Generous padding so glowing aura fades to complete zero well before edge
  const paddingX = 96;
  const paddingY = 52;
  const baseWidth = textWidth + paddingX * 2;
  const baseHeight = 36 + paddingY * 2;
  const scale = 2; // High-DPI 2x

  const centerX = baseWidth / 2;
  const centerY = baseHeight / 2;

  // --- 1. CORE TEXT CANVAS (Ultra-crisp 0-blur lettering) ---
  const coreCanvas = document.createElement('canvas');
  coreCanvas.width = baseWidth * scale;
  coreCanvas.height = baseHeight * scale;
  const coreCtx = coreCanvas.getContext('2d');
  if (coreCtx) {
    coreCtx.scale(scale, scale);
    coreCtx.clearRect(0, 0, baseWidth, baseHeight);
    coreCtx.font = fontSpec;
    coreCtx.textAlign = 'center';
    coreCtx.textBaseline = 'middle';

    coreCtx.shadowBlur = 0;
    coreCtx.shadowColor = 'transparent';
    coreCtx.fillStyle = textColor || '#FFFDF0';
    coreCtx.fillText(text, centerX, centerY);
  }

  const coreTexture = new THREE.CanvasTexture(coreCanvas);
  coreTexture.generateMipmaps = true;
  coreTexture.minFilter = THREE.LinearMipmapLinearFilter;
  coreTexture.magFilter = THREE.LinearFilter;

  // --- 2. HALO GLOW CANVAS (Soft radiating amber aura) ---
  const haloCanvas = document.createElement('canvas');
  haloCanvas.width = baseWidth * scale;
  haloCanvas.height = baseHeight * scale;
  const haloCtx = haloCanvas.getContext('2d');
  if (haloCtx) {
    haloCtx.scale(scale, scale);
    haloCtx.clearRect(0, 0, baseWidth, baseHeight);
    haloCtx.font = fontSpec;
    haloCtx.textAlign = 'center';
    haloCtx.textBaseline = 'middle';

    const spreadFactor = Math.max(0.1, Math.min(1.2, glowSpread));
    const gold = glowColor || '#FFBE28';

    // Pass 1: Broad soft outer aura
    haloCtx.shadowColor = gold;
    haloCtx.shadowBlur = Math.round(26 + 32 * spreadFactor);
    haloCtx.lineWidth = Math.round(10 + 16 * spreadFactor);
    haloCtx.strokeStyle = gold;
    haloCtx.strokeText(text, centerX, centerY);

    // Pass 2: Mid-intensity golden bloom
    haloCtx.shadowColor = gold;
    haloCtx.shadowBlur = Math.round(14 + 16 * spreadFactor);
    haloCtx.lineWidth = Math.round(4 + 8 * spreadFactor);
    haloCtx.strokeStyle = gold;
    haloCtx.strokeText(text, centerX, centerY);

    // Pass 3: Warm inner radiance
    haloCtx.shadowColor = '#FFF5CC';
    haloCtx.shadowBlur = 6;
    haloCtx.fillStyle = gold;
    haloCtx.fillText(text, centerX, centerY);
  }

  const haloTexture = new THREE.CanvasTexture(haloCanvas);
  haloTexture.generateMipmaps = true;
  haloTexture.minFilter = THREE.LinearMipmapLinearFilter;
  haloTexture.magFilter = THREE.LinearFilter;

  const aspect = baseWidth / baseHeight;
  return { coreTexture, haloTexture, aspect };
}

export const TextCardMesh: React.FC<TextCardMeshProps> = ({
  item,
  textColor = '#FFFDF0',
  glowEnabled = true,
  glowIntensity = 1.0,
  glowSpread = 0.5,
  glowColor = '#FFBE28',
  textScaleFactor = 1.0,
  driftEnabled = true,
  driftSpeed = 0.35,
  cloudHeight = 7.2,
  isOpened,
  paused = false,
  floatAmplitude = 0.12,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const coreMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const haloMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const timeRef = useRef<number>(0);
  const driftOffsetRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(isOpened ? 1 : 0);
  const [fontReady, setFontReady] = useState(false);

  useEffect(() => {
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        setFontReady(true);
      });
    }
  }, []);

  const { coreTexture, haloTexture, aspect } = useMemo(() => {
    return createTextDualTextures(item.content, textColor, glowColor, glowSpread);
  }, [item.content, textColor, glowColor, glowSpread, fontReady]);

  // Core material: NormalBlending, crisp core text
  const coreMaterial = useMemo(() => {
    const mat = createFlipUvMaterial(coreTexture, '#FFFFFF', isOpened ? 1 : 0, THREE.NormalBlending);
    coreMatRef.current = mat;
    return mat;
  }, [coreTexture, isOpened]);

  // Halo material: AdditiveBlending, true luminous light emission on space background
  const haloMaterial = useMemo(() => {
    const mat = createFlipUvMaterial(haloTexture, glowColor, isOpened ? 1 : 0, THREE.AdditiveBlending);
    haloMatRef.current = mat;
    return mat;
  }, [haloTexture, glowColor, isOpened]);

  useEffect(() => {
    return () => {
      coreTexture.dispose();
      haloTexture.dispose();
      coreMaterial.dispose();
      haloMaterial.dispose();
    };
  }, [coreTexture, haloTexture, coreMaterial, haloMaterial]);

  // Plane dimensions
  const basePlaneHeight = 0.30;
  const planeHeight = basePlaneHeight * Math.max(0.4, Math.min(2.5, textScaleFactor));
  const planeWidth = planeHeight * aspect;

  useFrame((_, delta) => {
    const safeDelta = Math.min(delta, 0.1);
    if (!paused) {
      timeRef.current += safeDelta;
    }

    const target = isOpened ? 1 : 0;
    const animSpeed = 1.2;
    if (currentProgressRef.current < target) {
      currentProgressRef.current = Math.min(target, currentProgressRef.current + safeDelta * animSpeed);
    } else if (currentProgressRef.current > target) {
      currentProgressRef.current = Math.max(target, currentProgressRef.current - safeDelta * 2.5);
    }

    if (groupRef.current && coreMatRef.current && haloMatRef.current) {
      const time = timeRef.current;
      const amp = floatAmplitude;

      // Continuous downward drift distance accumulation (no jump on speed change)
      if (!paused && driftEnabled) {
        driftOffsetRef.current += driftSpeed * safeDelta;
      }

      // Wrap coordinate for continuous downward drift
      const wrappedY = wrapY(item.position[1], driftOffsetRef.current, cloudHeight);

      // Subtle organic float
      const dy = Math.sin(time * item.floatSpeed + item.phase) * amp;
      const dx = Math.cos(time * item.floatSpeed * 0.7 + item.phase) * (amp * 0.35);
      const dRotZ = Math.sin(time * item.floatSpeed * 0.5 + item.phase) * 0.025;

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

      // Core opacity
      coreMatRef.current.uniforms.uOpacity.value = ease;

      // Halo glow intensity mapping
      // If glowEnabled is false or glowIntensity === 0, halo is completely hidden!
      // Otherwise, scales with glowIntensity (0 to 3)
      const effectiveGlow = glowEnabled && glowIntensity > 0
        ? Math.min(3.0, glowIntensity) * 0.85
        : 0.0;

      haloMatRef.current.uniforms.uOpacity.value = ease * effectiveGlow;

      groupRef.current.visible = progress > 0.01;
    }
  });

  return (
    <group
      ref={groupRef}
      position={item.position}
      rotation={item.rotation}
    >
      {/* 1. Additive luminous glow halo (behind core) */}
      <mesh material={haloMaterial} position={[0, 0, -0.001]} visible={glowEnabled && glowIntensity > 0}>
        <planeGeometry args={[planeWidth, planeHeight]} />
      </mesh>

      {/* 2. Crisp core lettering (in front) */}
      <mesh material={coreMaterial} position={[0, 0, 0.001]}>
        <planeGeometry args={[planeWidth, planeHeight]} />
      </mesh>
    </group>
  );
};

export default TextCardMesh;
