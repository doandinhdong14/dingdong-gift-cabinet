import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AssetConfig } from '../../types';
import { StarsBackground } from './StarsBackground';
import { TextCardMesh } from './TextCardMesh';
import { PhotoCardMesh } from './PhotoCardMesh';
import { HeartsField } from './HeartsField';
import { DecorationsField } from './decorations/DecorationsField';
import { generateUniverseLayout } from './universeLayout';
import { DEFAULT_UNIVERSE_PLACEHOLDERS } from './placeholders';
import { degreesToRadians } from '../../motion/motionMath';

export interface LoveUniverse01Props {
  // Can receive either a full AssetConfig or individual override props
  config?: AssetConfig;
  wishes?: string[];
  photoUrls?: string[];
  textCount?: number;
  photoCount?: number;
  heartCount?: number;
  cloudWidth?: number;
  cloudHeight?: number;
  cloudDepth?: number;
  rotationSpeed?: number;
  textColor?: string;
  glowIntensity?: number;
  heartColor?: string;
  seed?: number;
  showIntro?: boolean;
  isOpened?: boolean;
  paused?: boolean;
  quality?: 'low' | 'high';
  onOpenStateChange?: (opened: boolean) => void;
}

export const LoveUniverse01: React.FC<LoveUniverse01Props> = ({
  config,
  wishes: propWishes,
  photoUrls: propPhotoUrls,
  textCount: propTextCount,
  photoCount: propPhotoCount,
  heartCount: propHeartCount,
  cloudWidth: propCloudWidth,
  cloudHeight: propCloudHeight,
  cloudDepth: propCloudDepth,
  rotationSpeed: propRotationSpeed,
  textColor: propTextColor,
  glowIntensity: propGlowIntensity,
  heartColor: propHeartColor,
  seed: propSeed,
  showIntro: propShowIntro,
  isOpened: propIsOpened,
  paused = false,
  quality = 'high',
  onOpenStateChange,
}) => {
  // Extract values with priority: explicit prop > config.universe > defaults
  const uCfg = config?.universe;

  const wishes = useMemo(() => {
    return propWishes || uCfg?.wishes || [
      'Iu em nhất trên đời',
      'Chào cậu mình iu cậu nhiều lắm',
      'Iu 1000 lần',
      'iu ní nhiều lắm',
      '17/11/200X',
      'Mỗi ngày đều yêu cậu',
      'Hạnh phúc vì có cậu bên cạnh',
      'Cảm ơn vì đã đến bên mình',
      'Luôn mỉm cười thật tươi nhé',
      'Mãi mãi bên nhau',
      'My favorite person',
      'Thế giới dịu dàng vì có em',
      'Bình yên là khi ở cạnh cậu',
      'Chúc người tôi yêu luôn rực rỡ',
      'Iu em',
    ];
  }, [propWishes, uCfg?.wishes]);

  const photoUrls = useMemo(() => {
    if (propPhotoUrls && propPhotoUrls.length > 0) return propPhotoUrls;
    return DEFAULT_UNIVERSE_PLACEHOLDERS;
  }, [propPhotoUrls]);

  const textCount = propTextCount ?? uCfg?.textCount ?? 110;
  const photoCount = propPhotoCount ?? uCfg?.photoCount ?? 10;
  const heartCount = propHeartCount ?? uCfg?.heartCount ?? 20;
  const cloudWidth = propCloudWidth ?? uCfg?.cloudWidth ?? 6.8;
  const cloudHeight = propCloudHeight ?? uCfg?.cloudHeight ?? 7.2;
  const cloudDepth = propCloudDepth ?? uCfg?.cloudDepth ?? 5.6;
  const rotationSpeed = propRotationSpeed ?? uCfg?.rotationSpeed ?? config?.motion?.spin?.speedDegPerSecond ?? 1.5;
  const textColor = propTextColor ?? uCfg?.textColor ?? config?.appearance?.color ?? '#FFFDF0';
  const glowIntensity = propGlowIntensity ?? uCfg?.glowIntensity ?? 1.0;
  const heartColor = propHeartColor ?? uCfg?.heartColor ?? '#FF3824';
  const seed = propSeed ?? uCfg?.seed ?? 42;
  const showIntro = propShowIntro ?? uCfg?.showIntro ?? true;

  // New text lighting controls
  const glowEnabled = uCfg?.glowEnabled ?? true;
  const glowSpread = uCfg?.glowSpread ?? 0.5;
  const glowColor = uCfg?.glowColor ?? '#FFBE28';
  const textScaleFactor = uCfg?.textScaleFactor ?? 1.15;

  // New photo scale controls
  const photoScaleFactor = uCfg?.photoScaleFactor ?? 0.72;

  // New heart controls
  const heartScaleFactor = uCfg?.heartScaleFactor ?? 1.0;
  const heartRoughness = uCfg?.heartRoughness ?? 0.35;
  const heartSpinSpeed = uCfg?.heartSpinSpeed ?? 1.0;
  const heartFloatAmp = uCfg?.heartFloatAmp ?? 0.14;

  // New downward drift scene motion controls
  const driftEnabled = uCfg?.driftEnabled ?? true;
  const driftSpeed = uCfg?.driftSpeed ?? 0.35;

  // Decorative objects
  const decorations = uCfg?.decorations ?? [];

  // Intro opening state
  const isControlled = propIsOpened !== undefined;
  const [internalOpened, setInternalOpened] = useState(!showIntro);
  const activeOpened = isControlled ? propIsOpened : internalOpened;

  // Group references
  const universeGroupRef = useRef<THREE.Group>(null);
  const spinGroupRef = useRef<THREE.Group>(null);

  // Reduced motion detection
  const prefersReducedMotionRef = useRef<boolean>(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      prefersReducedMotionRef.current = mediaQuery.matches;
      const listener = (e: MediaQueryListEvent) => {
        prefersReducedMotionRef.current = e.matches;
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // When showIntro prop changes
  useEffect(() => {
    if (!showIntro) {
      setInternalOpened(true);
    }
  }, [showIntro]);

  // Notify parent of open state change if callback provided
  useEffect(() => {
    if (onOpenStateChange) {
      onOpenStateChange(activeOpened);
    }
  }, [activeOpened, onOpenStateChange]);

  // Compute deterministic layout
  const layout = useMemo(() => {
    return generateUniverseLayout({
      wishes,
      photoUrls,
      textCount,
      photoCount,
      heartCount,
      cloudWidth,
      cloudHeight,
      cloudDepth,
      seed,
    });
  }, [wishes, photoUrls, textCount, photoCount, heartCount, cloudWidth, cloudHeight, cloudDepth, seed]);

  // Animation frame loop for universe slow auto-spin (isolated from camera orbit)
  useFrame((_, delta) => {
    const safeDelta = Math.min(delta, 0.1);

    if (!paused && spinGroupRef.current && !prefersReducedMotionRef.current) {
      const spinRadPerSec = degreesToRadians(rotationSpeed);
      spinGroupRef.current.rotation.y += spinRadPerSec * safeDelta;
    }
  });

  return (
    <group ref={universeGroupRef}>
      {/* 1. Deep space starry sky background */}
      <StarsBackground quality={quality} paused={paused} />

      {/* 2. Soft space ambient lighting */}
      <ambientLight intensity={0.9} color="#eef3ff" />
      <directionalLight position={[5, 12, 10]} intensity={1.1} color="#FFF5EA" />
      <directionalLight position={[-5, -8, -6]} intensity={0.5} color="#FFD1DC" />

      {/* 3. Universe Cloud Group (Slow auto-spin applied here) */}
      <group ref={spinGroupRef}>
        {/* Glowing Texts */}
        {layout.textItems.map((item) => (
          <TextCardMesh
            key={item.id}
            item={item}
            textColor={textColor}
            glowEnabled={glowEnabled}
            glowIntensity={glowIntensity}
            glowSpread={glowSpread}
            glowColor={glowColor}
            textScaleFactor={textScaleFactor}
            driftEnabled={driftEnabled}
            driftSpeed={driftSpeed}
            cloudHeight={cloudHeight}
            isOpened={activeOpened}
            paused={paused}
          />
        ))}

        {/* Floating borderless Photos */}
        {layout.photoItems.map((item) => (
          <PhotoCardMesh
            key={item.id}
            item={item}
            photoScaleFactor={photoScaleFactor}
            driftEnabled={driftEnabled}
            driftSpeed={driftSpeed}
            cloudHeight={cloudHeight}
            isOpened={activeOpened}
            paused={paused}
          />
        ))}

        {/* True 3D Watertight Puffy Hearts */}
        <HeartsField
          items={layout.heartItems}
          heartColor={heartColor}
          scaleFactor={heartScaleFactor}
          roughness={heartRoughness}
          spinSpeed={heartSpinSpeed}
          floatAmplitude={heartFloatAmp}
          driftEnabled={driftEnabled}
          driftSpeed={driftSpeed}
          cloudHeight={cloudHeight}
          isOpened={activeOpened}
          paused={paused}
        />

        {/* User-added Decorative 3D Objects (Star3D, GiftBox, etc.) */}
        <DecorationsField
          decorations={decorations}
          seed={seed}
          cloudWidth={cloudWidth}
          cloudHeight={cloudHeight}
          cloudDepth={cloudDepth}
          driftEnabled={driftEnabled}
          driftSpeed={driftSpeed}
          isOpened={activeOpened}
          paused={paused}
        />
      </group>
    </group>
  );
};

export default LoveUniverse01;
