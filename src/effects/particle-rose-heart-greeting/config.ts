import { createConfigCodec, type ConfigCodec } from '../../effect-sdk';
import rosePeach from './assets/roses/rose_1_peach.png';
import roseSoftPink from './assets/roses/rose_2_soft_pink.png';
import roseCrimson from './assets/roses/rose_3_crimson.png';
import roseCoralTop from './assets/roses/rose_4_coral_top.png';
import roseVelvet from './assets/roses/rose_5_velvet.png';
import roseCoralCenter from './assets/roses/rose_6_coral_center.png';
import bearBouquet from './assets/teddy_bear_bouquet.png';
import bearFlying from './assets/teddy_bear_flying.png';

export interface ParticleRoseHeartConfig {
  // Content
  greetingText: string;
  occasionText: string;
  holdText: string;

  // Colors & Visual Styling
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  particleGlow: number;
  particleMotion: number;

  // Particles
  particleCount: number;
  particleSize: number;
  particleSpeed: number;
  particleSeed: number;

  // Trigger & Timeline
  triggerMode: 'hold' | 'click' | 'auto';
  holdDuration: number; // in ms
  playbackSpeed: number;
  heartDisplayDuration: number; // in seconds
  endBehavior: 'loop-final-stage' | 'hold' | 'replay-ready';

  // Rose Heart
  roseCount: number;
  heartScale: number;
  roseColorVariation: number;

  // Flying Teddy Bears
  bearCount: number;
  bearSpeed: number;

  // Presentation & Assets
  quality: 'low' | 'medium' | 'high';
  roseAssets: string[];
  bearAssets: string[];
  backgroundMusic: string;
}

export const defaultRoseAssets = [
  rosePeach,
  roseSoftPink,
  roseCrimson,
  roseCoralTop,
  roseVelvet,
  roseCoralCenter,
];
export const defaultBearAssets = [bearBouquet, bearFlying];

export const defaults: ParticleRoseHeartConfig = {
  // Content
  greetingText: 'Chúc\nMừng',
  occasionText: "women's\nday",
  holdText: 'Giữ để bắt đầu',

  // Colors & Visual Styling
  primaryColor: '#ff4f9a',
  secondaryColor: '#e83c85',
  backgroundColor: '#000000',
  particleGlow: 0.35,
  particleMotion: 1.0,

  // Particles
  particleCount: 14000,
  particleSize: 1.2,
  particleSpeed: 1.0,
  particleSeed: 20261119,

  // Trigger & Timeline
  triggerMode: 'hold',
  holdDuration: 700,
  playbackSpeed: 1.0,
  heartDisplayDuration: 4.2,
  endBehavior: 'loop-final-stage',

  // Rose Heart
  roseCount: 48,
  heartScale: 1.0,
  roseColorVariation: 0.5,

  // Flying Teddy Bears
  bearCount: 35,
  bearSpeed: 1.0,

  // Presentation & Assets
  quality: 'high',
  roseAssets: defaultRoseAssets,
  bearAssets: defaultBearAssets,
  backgroundMusic: '',
};

export const configCodec: ConfigCodec<ParticleRoseHeartConfig> = createConfigCodec<ParticleRoseHeartConfig>(
  (raw: unknown) => {
    if (!raw || typeof raw !== 'object') {
      return { success: true, data: { ...defaults } };
    }

    const r = raw as Record<string, unknown>;

    const data: ParticleRoseHeartConfig = {
      greetingText: typeof r.greetingText === 'string' ? r.greetingText : defaults.greetingText,
      occasionText: typeof r.occasionText === 'string' ? r.occasionText : defaults.occasionText,
      holdText: typeof r.holdText === 'string' ? r.holdText : defaults.holdText,

      primaryColor: typeof r.primaryColor === 'string' ? r.primaryColor : defaults.primaryColor,
      secondaryColor: typeof r.secondaryColor === 'string' ? r.secondaryColor : defaults.secondaryColor,
      backgroundColor: typeof r.backgroundColor === 'string' ? r.backgroundColor : defaults.backgroundColor,
      particleGlow: typeof r.particleGlow === 'number' ? Math.max(0.1, Math.min(1.0, r.particleGlow)) : defaults.particleGlow,
      particleMotion: typeof r.particleMotion === 'number' ? Math.max(0.2, Math.min(2.0, r.particleMotion)) : defaults.particleMotion,

      particleCount: typeof r.particleCount === 'number' ? Math.max(5000, Math.min(30000, r.particleCount)) : defaults.particleCount,
      particleSize: typeof r.particleSize === 'number' ? Math.max(0.5, Math.min(3.0, r.particleSize)) : defaults.particleSize,
      particleSpeed: typeof r.particleSpeed === 'number' ? Math.max(0.2, Math.min(3.0, r.particleSpeed)) : defaults.particleSpeed,
      particleSeed: typeof r.particleSeed === 'number' ? r.particleSeed : defaults.particleSeed,

      triggerMode: r.triggerMode === 'click' || r.triggerMode === 'auto' ? r.triggerMode : 'hold',
      holdDuration: typeof r.holdDuration === 'number' ? Math.max(200, Math.min(3000, r.holdDuration)) : defaults.holdDuration,
      playbackSpeed: typeof r.playbackSpeed === 'number' ? Math.max(0.2, Math.min(3.0, r.playbackSpeed)) : defaults.playbackSpeed,
      heartDisplayDuration: typeof r.heartDisplayDuration === 'number' ? Math.max(2.0, Math.min(10.0, r.heartDisplayDuration)) : defaults.heartDisplayDuration,
      endBehavior: r.endBehavior === 'hold' || r.endBehavior === 'replay-ready' ? r.endBehavior : 'loop-final-stage',

      roseCount: typeof r.roseCount === 'number' ? Math.max(20, Math.min(120, r.roseCount)) : defaults.roseCount,
      heartScale: typeof r.heartScale === 'number' ? Math.max(0.5, Math.min(1.5, r.heartScale)) : defaults.heartScale,
      roseColorVariation: typeof r.roseColorVariation === 'number' ? Math.max(0, Math.min(1, r.roseColorVariation)) : defaults.roseColorVariation,

      bearCount: typeof r.bearCount === 'number' ? Math.max(10, Math.min(60, r.bearCount)) : defaults.bearCount,
      bearSpeed: typeof r.bearSpeed === 'number' ? Math.max(0.2, Math.min(3.0, r.bearSpeed)) : defaults.bearSpeed,

      quality: r.quality === 'low' || r.quality === 'medium' ? r.quality : 'high',
      roseAssets: Array.isArray(r.roseAssets) && r.roseAssets.length > 0 ? r.roseAssets : defaultRoseAssets,
      bearAssets: Array.isArray(r.bearAssets) && r.bearAssets.length > 0 ? r.bearAssets : defaultBearAssets,
      backgroundMusic: typeof r.backgroundMusic === 'string' ? r.backgroundMusic : defaults.backgroundMusic,
    };

    return { success: true, data };
  }
);
