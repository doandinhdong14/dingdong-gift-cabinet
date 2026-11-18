import type { PresentationConfig } from '../../effect-sdk';

export const presentation: PresentationConfig = {
  camera: {
    fov: 45,
    position: [0, 0, 5],
    target: [0, 0, 0],
  },
  lighting: {
    ambientIntensity: 0.7,
    mainLightColor: '#ffffff',
    mainLightIntensity: 1.2,
    mainLightPosition: [3, 5, 4],
  },
  background: {
    color: '#000000',
    transparent: false,
  },
  quality: 'high',
};
