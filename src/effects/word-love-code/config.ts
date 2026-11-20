import { createConfigCodec, type ConfigCodec } from '../../effect-sdk';

export interface WordLoveCodeConfig {
  // Words & countdown morphing
  wordSequence: string;
  countdownStart: number;
  wordDuration: number;
  dotSize: number;
  dotColor: string;
  dotGap: number;

  // Heart center text
  centerText: string;
  centerTextColor: string;
  centerFontSize: number;

  // Matrix digital rain
  enableMatrix: boolean;
  matrixText: string;
  matrixColor: string;
  matrixFontSize: number;
  matrixSpeed: number;

  // Particle pulsing heart
  heartColor: string;
  heartParticleCount: number;
  heartScale: number;

  // Atmosphere & playback
  backgroundColor: string;
  autoReplay: boolean;
}

export const defaults: WordLoveCodeConfig = {
  // Words & countdown morphing
  wordSequence: 'You|Are|My|Love',
  countdownStart: 3,
  wordDuration: 2.0,
  dotSize: 4,
  dotColor: '#ffffff',
  dotGap: 13,

  // Heart center text
  centerText: 'Wuv U❤️Bao Bao',
  centerTextColor: '#ff5ba5',
  centerFontSize: 34,

  // Matrix digital rain
  enableMatrix: true,
  matrixText: 'I LOVE UI LOVE UI LOVE UI LOVE UI LOVE U ❤',
  matrixColor: '#ff5ba5',
  matrixFontSize: 11,
  matrixSpeed: 33,

  // Particle pulsing heart
  heartColor: '#ff30c5',
  heartParticleCount: 500,
  heartScale: 1.0,

  // Atmosphere & playback
  backgroundColor: '#000000',
  autoReplay: false,
};

export const configCodec: ConfigCodec<WordLoveCodeConfig> = createConfigCodec<WordLoveCodeConfig>(
  (raw: unknown) => {
    if (!raw || typeof raw !== 'object') {
      return { success: true, data: { ...defaults } };
    }

    const r = raw as Record<string, unknown>;

    const data: WordLoveCodeConfig = {
      wordSequence: typeof r.wordSequence === 'string' && r.wordSequence.trim().length > 0 ? r.wordSequence : defaults.wordSequence,
      countdownStart: typeof r.countdownStart === 'number' ? Math.max(0, Math.min(10, Math.round(r.countdownStart))) : defaults.countdownStart,
      wordDuration: typeof r.wordDuration === 'number' ? Math.max(0.6, Math.min(6.0, r.wordDuration)) : defaults.wordDuration,
      dotSize: typeof r.dotSize === 'number' ? Math.max(2, Math.min(10, r.dotSize)) : defaults.dotSize,
      dotColor: typeof r.dotColor === 'string' ? r.dotColor : defaults.dotColor,
      dotGap: typeof r.dotGap === 'number' ? Math.max(8, Math.min(22, Math.round(r.dotGap))) : defaults.dotGap,

      centerText: typeof r.centerText === 'string' && r.centerText.trim().length > 0 ? r.centerText : defaults.centerText,
      centerTextColor: typeof r.centerTextColor === 'string' ? r.centerTextColor : defaults.centerTextColor,
      centerFontSize: typeof r.centerFontSize === 'number' ? Math.max(16, Math.min(64, Math.round(r.centerFontSize))) : defaults.centerFontSize,

      enableMatrix: typeof r.enableMatrix === 'boolean' ? r.enableMatrix : defaults.enableMatrix,
      matrixText: typeof r.matrixText === 'string' && r.matrixText.length > 0 ? r.matrixText : defaults.matrixText,
      matrixColor: typeof r.matrixColor === 'string' ? r.matrixColor : defaults.matrixColor,
      matrixFontSize: typeof r.matrixFontSize === 'number' ? Math.max(8, Math.min(24, Math.round(r.matrixFontSize))) : defaults.matrixFontSize,
      matrixSpeed: typeof r.matrixSpeed === 'number' ? Math.max(15, Math.min(80, Math.round(r.matrixSpeed))) : defaults.matrixSpeed,

      heartColor: typeof r.heartColor === 'string' ? r.heartColor : defaults.heartColor,
      heartParticleCount: typeof r.heartParticleCount === 'number' ? Math.max(100, Math.min(1500, Math.round(r.heartParticleCount))) : defaults.heartParticleCount,
      heartScale: typeof r.heartScale === 'number' ? Math.max(0.5, Math.min(2.0, r.heartScale)) : defaults.heartScale,

      backgroundColor: typeof r.backgroundColor === 'string' ? r.backgroundColor : defaults.backgroundColor,
      autoReplay: typeof r.autoReplay === 'boolean' ? r.autoReplay : defaults.autoReplay,
    };

    return { success: true, data };
  }
);
