import type { PresentationConfig } from '../../effect-sdk';

export const presentation: PresentationConfig = {
  camera: {
    fov: 45,
    position: [0, 0, 5],
    target: [0, 0, 0],
  },
  lighting: {
    ambientIntensity: 0.8,
    mainLightColor: '#ffffff',
    mainLightIntensity: 1.0,
    mainLightPosition: [0, 3, 4],
  },
  background: {
    color: '#020204',
    transparent: false,
  },
  quality: 'high',
};
