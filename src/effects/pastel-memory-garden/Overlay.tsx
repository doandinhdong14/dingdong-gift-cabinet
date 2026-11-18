import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { EffectProps } from '../../effect-sdk';
import type { PastelMemoryGardenConfig, CharacterItem } from './config';
import { DEFAULT_CHARACTERS } from './components/defaultCharacters';
import { SkyLayer } from './components/SkyLayer';
import { BackgroundPanoramaLayer } from './components/BackgroundPanoramaLayer';
import { PortraitsTrack } from './components/PortraitsTrack';
import { FlowerForegroundTrack } from './components/FlowerForegroundTrack';
import { RibbonTrack } from './components/RibbonTrack';
import { ButterfliesAndParticles } from './components/ButterfliesAndParticles';
import { FixedUIOverlay } from './components/FixedUIOverlay';
import { CharacterEditorDock } from './components/CharacterEditorDock';

const WORLD_WIDTH = 5200; // Total panorama cycle width in pixels

export const Overlay: React.FC<EffectProps<PastelMemoryGardenConfig>> = ({
  config,
  runtime,
  emit,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ width: 1916, height: 952 });

  // Camera X state (in world space pixels)
  const cameraXRef = useRef<number>(0);
  const [cameraX, setCameraX] = useState<number>(0);

  // Time tracking
  const elapsedTimeRef = useRef<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Drag interaction state
  const isDraggingRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartCameraXRef = useRef<number>(0);
  const lastDragTimeRef = useRef<number>(0);
  const dragVelocityRef = useRef<number>(0);

  // Sound active state
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(!config.soundEnabled);

  // Local user-managed characters state (with persistence)
  const [characters, setCharacters] = useState<CharacterItem[]>(() => {
    try {
      const saved = localStorage.getItem('dingdong_pastel_memory_garden_characters');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return config.characters && config.characters.length > 0
      ? config.characters
      : DEFAULT_CHARACTERS;
  });

  // Local test mode override (for in-scene QA dock)
  const [activeTestMode, setActiveTestMode] = useState<PastelMemoryGardenConfig['testMode']>(
    config.testMode || 'normal'
  );

  // Sync testMode if config prop changes
  useEffect(() => {
    if (config.testMode) {
      setActiveTestMode(config.testMode);
    }
  }, [config.testMode]);

  // Sync characters if config.characters is provided from host
  useEffect(() => {
    if (config.characters && config.characters.length > 0) {
      setCharacters(config.characters);
    }
  }, [config.characters]);

  // Observe container size (responsive tracking)
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setViewport({ width, height });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Main Motion Engine (requestAnimationFrame with delta integration)
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const deltaMs = currentTime - lastTime;
      lastTime = currentTime;

      // Clamp delta to prevent huge jumps after tab pause
      const deltaSeconds = Math.min(deltaMs / 1000, 0.1);

      if (!runtime.isPaused && runtime.isVisible) {
        const speedMultiplier = typeof runtime.speed === 'number' ? runtime.speed : 1.0;
        const effectiveDelta = deltaSeconds * speedMultiplier;
        elapsedTimeRef.current += effectiveDelta;
        setElapsedTime(elapsedTimeRef.current);

        // Apply drag inertia decay when not actively dragging
        if (!isDraggingRef.current && Math.abs(dragVelocityRef.current) > 5) {
          cameraXRef.current -= dragVelocityRef.current * effectiveDelta;
          dragVelocityRef.current *= Math.pow(0.88, effectiveDelta * 60); // friction
        } else if (!isDraggingRef.current && config.autoPlay) {
          // Autoplay horizontal scroll
          const pxPerSecond = config.scrollSpeed * viewport.width;
          cameraXRef.current -= pxPerSecond * effectiveDelta;
        }

        // Modulo wrapping within WORLD_WIDTH
        cameraXRef.current = ((cameraXRef.current % WORLD_WIDTH) + WORLD_WIDTH) % WORLD_WIDTH;
        setCameraX(cameraXRef.current);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [config.autoPlay, config.scrollSpeed, runtime.isPaused, runtime.isVisible, runtime.speed, viewport.width]);

  // Pointer drag event handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!config.dragEnabled) return;
      isDraggingRef.current = true;
      dragStartXRef.current = e.clientX;
      dragStartCameraXRef.current = cameraXRef.current;
      lastDragTimeRef.current = performance.now();
      dragVelocityRef.current = 0;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [config.dragEnabled]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current || !config.dragEnabled) return;
      const now = performance.now();
      const dt = Math.max((now - lastDragTimeRef.current) / 1000, 0.001);
      const dx = e.clientX - dragStartXRef.current;

      const newCameraX = dragStartCameraXRef.current - dx;
      cameraXRef.current = ((newCameraX % WORLD_WIDTH) + WORLD_WIDTH) % WORLD_WIDTH;
      setCameraX(cameraXRef.current);

      // Compute velocity for release inertia
      dragVelocityRef.current = e.movementX / dt;
      lastDragTimeRef.current = now;
    },
    [config.dragEnabled]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  }, []);

  const mergedConfig: PastelMemoryGardenConfig = {
    ...config,
    testMode: activeTestMode,
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        touchAction: 'none',
        userSelect: 'none',
        cursor: config.dragEnabled ? (isDraggingRef.current ? 'grabbing' : 'grab') : 'default',
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Google Web Fonts for handwritten cursive script */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Great+Vibes&display=swap"
      />

      {/* Layer 0: Sky and Sunset Clouds */}
      <SkyLayer config={mergedConfig} cameraX={cameraX} />

      {/* Layer 1: Background Panorama (Fairytale garden, palaces, columns, mountains, lake) */}
      <BackgroundPanoramaLayer
        config={mergedConfig}
        cameraX={cameraX}
        worldWidth={WORLD_WIDTH}
      />

      {/* Layer 2: Girl Portraits (User photos, full heads & bodies visible) */}
      <PortraitsTrack
        config={mergedConfig}
        cameraX={cameraX}
        worldWidth={WORLD_WIDTH}
        viewportWidth={viewport.width}
        viewportHeight={viewport.height}
        emit={emit}
        overrideCharacters={characters}
      />

      {/* Layer 3: Foreground Flower Bed (Gentle low hedge, only covering feet/baseline) */}
      <FlowerForegroundTrack
        config={mergedConfig}
        cameraX={cameraX}
        worldWidth={WORLD_WIDTH}
        viewportHeight={viewport.height}
      />

      {/* Layer 4: Satin Ribbons */}
      <RibbonTrack
        config={mergedConfig}
        cameraX={cameraX}
        worldWidth={WORLD_WIDTH}
        viewportHeight={viewport.height}
        elapsedTime={elapsedTime}
      />

      {/* Layer 5: Animated Butterflies & Glowing Sparkles */}
      <ButterfliesAndParticles
        config={mergedConfig}
        elapsedTime={elapsedTime}
        viewportWidth={viewport.width}
        viewportHeight={viewport.height}
      />

      {/* Layer 6: Fixed UI Overlay (Logo, Sound, Memory Realm & Letter buttons) */}
      <FixedUIOverlay
        config={{
          ...mergedConfig,
          soundEnabled: !isSoundMuted,
        }}
        emit={emit}
        onToggleSound={() => setIsSoundMuted((prev) => !prev)}
      />

      {/* Layer 7: Interactive Character Upload & Layer Debug Dock */}
      <CharacterEditorDock
        config={mergedConfig}
        characters={characters}
        onUpdateCharacters={setCharacters}
        onUpdateTestMode={setActiveTestMode}
        cameraX={cameraX}
      />
    </div>
  );
};
