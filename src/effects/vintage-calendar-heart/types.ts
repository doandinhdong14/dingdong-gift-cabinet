export interface CalendarDayData {
  dayNumber: number;
  monthName: string;
  year: number;
  dayOfWeek: string;
  numberColor: string;
  dayOfWeekColor: string;
  lunarMonth: string;
  lunarDay: number;
  lunarYear: string;
  canChi: string;
  noteText: string;
  isTarget: boolean;
}

export type TimelinePhase =
  | 'IDLE'
  | 'FLIPPING_PAGE'
  | 'SETTLING'
  | 'DRAWING_HEART'
  | 'CELEBRATING'
  | 'REVEALING_MESSAGE'
  | 'COMPLETED';

export interface FloatingParticle {
  id: number;
  x: number;
  y: number;
  baseX: number;
  vy: number;
  wobbleAmp: number;
  wobbleFreq: number;
  wobblePhase: number;
  scale: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  type: 'heart' | 'sparkle';
  color: string;
}

export interface FlipProgressInfo {
  pageIndex: number;
  progress: number; // 0 to 1
  isCurlPhase: boolean;
  isFlyPhase: boolean;
  tiltAngle: number;
  flyY: number;
  flyX: number;
  opacity: number;
}
