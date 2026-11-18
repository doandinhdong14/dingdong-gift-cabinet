import React from 'react';
import type { EffectProps } from '../../effect-sdk';
import type { PastelMemoryGardenConfig } from './config';

/**
 * Scene component stub.
 * Pastel Memory Garden uses the 'dom' renderer hosted in Overlay.tsx
 * for pixel-perfect 2.5D multi-layered DOM/Canvas2D/SVG compositing.
 */
export const Scene: React.FC<EffectProps<PastelMemoryGardenConfig>> = () => {
  return null;
};
