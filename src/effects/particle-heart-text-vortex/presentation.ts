import type { PresentationConfig } from '../../effect-sdk';

export const presentation: PresentationConfig = {
  camera: {
    fov: 44,
    position: [0, 0.40, 5.6],
    target: [0, 0.05, 0],
  },
  lighting: {
    ambientIntensity: 0.6,
    mainLightColor: '#ffffff',
    mainLightIntensity: 0.9,
    mainLightPosition: [2, 4, 3],
  },
  background: {
    color: '#05030a',
    transparent: false,
  },
  quality: 'high',
};
