/**
 * Types specific to LoveUniverse01 ("Vũ trụ lời chúc")
 */

export interface UniverseElementLayout {
  id: string;
  type: 'text' | 'photo' | 'heart' | 'star3d' | 'giftbox';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  layer: 'near' | 'mid' | 'far';
  phase: number;
  floatSpeed: number;
  content: string; // Text string for text, image url for photo, empty for decorations
  groupId?: string;
  color?: string;
  roughness?: number;
}

export interface UniverseLayoutResult {
  textItems: UniverseElementLayout[];
  photoItems: UniverseElementLayout[];
  heartItems: UniverseElementLayout[];
  decorationItems?: UniverseElementLayout[];
}
