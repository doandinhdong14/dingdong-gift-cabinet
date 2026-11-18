export interface WorldPortrait {
  id: string;
  name?: string;
  image: string;
  worldX: number;
  baselineY: number; // percentage from top, e.g. 43
  scale: number;
  zIndex: number;
  hasRibbonLoop?: 'left' | 'right';
}

export interface GardenDimensions {
  worldWidth: number;
  viewportWidth: number;
  viewportHeight: number;
}
