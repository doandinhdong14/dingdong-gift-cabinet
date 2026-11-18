import { RoseRevealConfig } from '../../types';

export type RoseRevealState = 'loading' | 'idle' | 'blooming' | 'revealing' | 'completed' | 'error';

export interface PetalLayerDefinition {
  layerIndex: number;
  count: number;
  radius: number;
  length: number;
  width: number;
  cupDepth: number;
  archDepth: number;
  curlEdge: number;
  ruffleAmp: number;
  baseTiltDeg: number;       // Inward tilt when closed (e.g. -15 deg)
  openTiltDeg: number;       // Outward tilt when bloomed (e.g. +75 deg)
  bloomStart: number;        // Bloom progress interval [start, end]
  bloomEnd: number;
}

export interface FlyingPetalData {
  spawnTime: number;
  x0: number;
  y0: number;
  z0: number;
  vx: number;
  vy: number;
  vz: number;
  fallSpeed: number;
  rotSpeedX: number;
  rotSpeedY: number;
  rotSpeedZ: number;
  initialRotX: number;
  initialRotY: number;
  initialRotZ: number;
  scale: number;
  phase: number;
}

export interface RoseRevealProps {
  config?: {
    roseReveal?: RoseRevealConfig;
    [key: string]: unknown;
  };
  paused?: boolean;
  quality?: 'low' | 'high';
  isInspecting?: boolean;
  onRevealComplete?: () => void;
  onStateChange?: (state: RoseRevealState) => void;
}
