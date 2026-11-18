import type { CalendarDayData, FloatingParticle } from './types';
import type { VintageCalendarConfig } from './config';
import { computeCurlSlices, generateTearPoints } from './curlGeometry';

export const LOGICAL_WIDTH = 368;
export const LOGICAL_HEIGHT = 740;

export interface PaperFiber {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  vRot: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
}

export class VintageCalendarRenderer {
  private offscreenPages: Map<number, HTMLCanvasElement> = new Map();
  private width = LOGICAL_WIDTH;
  private height = LOGICAL_HEIGHT;
  private scale = 1;
  private offsetX = 0;
  private offsetY = 0;
  private smoothHeartPoints: Array<[number, number]> = [];
  private paperFibers: PaperFiber[] = [];
  private lastSpawnedTearPage = -1;

  constructor() {
    this.precomputeSmoothHeartPath();
  }

  private precomputeSmoothHeartPath(): void {
    // Exact key anchor points around "19" and "THỨ NĂM", nicely framed below the header line (y=27)
    const cx = 103; // center of 206px page
    const anchors: Array<[number, number]> = [
      [cx, 54], // top cleft below header
      [cx - 26, 42],
      [cx - 58, 44],
      [cx - 84, 62],
      [cx - 88, 92], // left peak
      [cx - 82, 126],
      [cx - 62, 154],
      [cx - 32, 176],
      [cx + 6, 192], // bottom crossing
      [cx + 12, 195], // loop tail
      [cx - 4, 194],
      [cx - 22, 186],
      [cx + 32, 168],
      [cx + 62, 142],
      [cx + 82, 114],
      [cx + 86, 84], // right peak
      [cx + 82, 58],
      [cx + 58, 44],
      [cx + 26, 42],
      [cx, 54], // back to top cleft
    ];

    // Generate Catmull-Rom spline with high density (240 points)
    const points: Array<[number, number]> = [];
    const n = anchors.length;
    const samplesPerSegment = 14;

    for (let i = 0; i < n - 1; i++) {
      const p0 = anchors[Math.max(0, i - 1)];
      const p1 = anchors[i];
      const p2 = anchors[i + 1];
      const p3 = anchors[Math.min(n - 1, i + 2)];

      for (let s = 0; s < samplesPerSegment; s++) {
        const t = s / samplesPerSegment;
        const t2 = t * t;
        const t3 = t2 * t;

        const x =
          0.5 *
          (2 * p1[0] +
            (-p0[0] + p2[0]) * t +
            (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
            (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);

        const y =
          0.5 *
          (2 * p1[1] +
            (-p0[1] + p2[1]) * t +
            (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
            (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);

        points.push([x, y]);
      }
    }
    points.push(anchors[n - 1]);
    this.smoothHeartPoints = points;
  }

  public resize(width: number, height: number, _dpr = 1): void {
    this.width = width;
    this.height = height;

    const scaleX = width / LOGICAL_WIDTH;
    const scaleY = height / LOGICAL_HEIGHT;
    this.scale = Math.min(scaleX, scaleY);

    this.offsetX = (width - LOGICAL_WIDTH * this.scale) * 0.5;
    this.offsetY = (height - LOGICAL_HEIGHT * this.scale) * 0.5;
  }

  public preparePages(days: CalendarDayData[], config: VintageCalendarConfig): void {
    this.offscreenPages.clear();
    const PAGE_W = 206;
    const PAGE_H = 270;
    const pDpr = 2;

    for (const day of days) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(PAGE_W * pDpr);
      canvas.height = Math.round(PAGE_H * pDpr);
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      ctx.scale(pDpr, pDpr);
      this.renderPageSheetContent(ctx, day, PAGE_W, PAGE_H, config);
      this.offscreenPages.set(day.dayNumber, canvas);
    }
  }

  private renderPageSheetContent(
    ctx: CanvasRenderingContext2D,
    day: CalendarDayData,
    w: number,
    h: number,
    config: VintageCalendarConfig
  ): void {
    // Paper gradient background
    const paperGrad = ctx.createLinearGradient(0, 0, 0, h);
    paperGrad.addColorStop(0, '#fffef9');
    paperGrad.addColorStop(0.5, config.paperColor || '#fbf7ee');
    paperGrad.addColorStop(1, '#f5efdf');

    ctx.fillStyle = paperGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle edge border
    ctx.strokeStyle = '#e6ddcc';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);

    // Header
    const headerRed = '#b51f2d';
    ctx.fillStyle = headerRed;
    ctx.font = '700 10.5px "Be Vietnam Pro", sans-serif';
    ctx.letterSpacing = '0.8px';
    ctx.textAlign = 'left';
    ctx.fillText(day.monthName, 12, 22);

    ctx.textAlign = 'right';
    ctx.font = '700 11.5px "Be Vietnam Pro", sans-serif';
    ctx.fillText(String(day.year), w - 12, 22);

    // Red divider line
    ctx.strokeStyle = headerRed;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(12, 27);
    ctx.lineTo(w - 12, 27);
    ctx.stroke();

    // Huge Date Number
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = day.numberColor;
    ctx.font = '700 90px "Playfair Display", Georgia, "Times New Roman", serif';
    ctx.fillText(String(day.dayNumber), w * 0.5, 96);

    // Day of Week
    ctx.fillStyle = day.dayOfWeekColor;
    ctx.font = '700 12.5px "Be Vietnam Pro", sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText(day.dayOfWeek, w * 0.5, 150);
    ctx.letterSpacing = '0px';

    // Thin Divider Line
    ctx.strokeStyle = '#ded5c2';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(14, 168);
    ctx.lineTo(w - 14, 168);
    ctx.stroke();

    // Bottom info - Left Column (Lunar)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#6b7280';
    ctx.font = '500 8.5px "Be Vietnam Pro", sans-serif';
    ctx.fillText(day.lunarMonth, 44, 182);

    ctx.fillStyle = '#22385a';
    ctx.font = '700 22px "Playfair Display", Georgia, serif';
    ctx.fillText(String(day.lunarDay), 44, 204);

    ctx.fillStyle = '#6b7280';
    ctx.font = '500 8.5px "Be Vietnam Pro", sans-serif';
    ctx.fillText(day.lunarYear, 44, 220);

    // Vertical Divider
    ctx.strokeStyle = '#ded5c2';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(78, 174);
    ctx.lineTo(78, 224);
    ctx.stroke();

    // Bottom info - Right Column (Notes / Countdown)
    ctx.textAlign = 'center';
    if (day.isTarget) {
      ctx.fillStyle = '#b51f2d';
      ctx.font = 'italic 700 13.5px "Dancing Script", "Playfair Display", cursive, serif';
      ctx.fillText('Ngày Quốc tế', 138, 195);
      ctx.fillText('Nam giới', 138, 212);
    } else {
      ctx.fillStyle = '#645345';
      ctx.font = 'italic 600 13px "Dancing Script", cursive, serif';
      ctx.fillText(day.noteText, 138, 204);
    }

    // Day Name / Solar term (bottom small)
    if (day.canChi) {
      ctx.fillStyle = '#8c7d6b';
      ctx.font = '500 8px "Be Vietnam Pro", sans-serif';
      ctx.fillText(day.canChi, w * 0.5, 240);
    }
  }

  public renderScene(
    ctx: CanvasRenderingContext2D,
    config: VintageCalendarConfig,
    activeDay: CalendarDayData,
    nextDay: CalendarDayData | null,
    flipProgress: number,
    flipPageIndex: number,
    heartDrawProgress: number,
    particles: FloatingParticle[],
    messageRevealProgress: number,
    isIdle: boolean,
    buttonPulse: number,
    totalPages = 5
  ): void {
    ctx.save();
    ctx.clearRect(0, 0, this.width, this.height);

    // Full Viewport Background Gradient
    this.renderBackground(ctx, config);

    // Center & scale logical 368x740 composition
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);

    // Hanger cords and gold knob
    this.renderHanger(ctx);

    // Calendar Backing Board & Stack Depth
    this.renderBackingBoard(ctx, config, flipPageIndex, totalPages);

    // Paper Pages (Active & Underlying & Curl)
    this.renderPaperPad(
      ctx,
      config,
      activeDay,
      nextDay,
      flipProgress,
      flipPageIndex,
      heartDrawProgress
    );

    // Clamping Bar (sits on top of the paper pad)
    this.renderClampingBar(ctx);

    // Heart Particles & Stardust
    this.renderParticles(ctx, particles);

    // Final Message Reveal
    if (messageRevealProgress > 0) {
      this.renderFinalMessage(ctx, config, messageRevealProgress);
    }

    // Interactive Start Button
    if (isIdle && config.showStartButton) {
      this.renderStartButton(ctx, config, buttonPulse);
    }

    ctx.restore();
  }

  private renderBackground(ctx: CanvasRenderingContext2D, config: VintageCalendarConfig): void {
    const cx = this.width * 0.5;
    const cy = this.height * 0.35;
    const maxRadius = Math.max(this.width, this.height) * 0.8;

    const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, maxRadius);
    bgGrad.addColorStop(0, '#2e0a15');
    bgGrad.addColorStop(0.35, config.backgroundColor || '#140308');
    bgGrad.addColorStop(0.7, '#0b0105');
    bgGrad.addColorStop(1, '#050002');

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  private renderHanger(ctx: CanvasRenderingContext2D): void {
    const pinX = 184;
    const pinY = 88;
    const leftAnchorX = 184 - 88;
    const rightAnchorX = 184 + 88;
    const boardTopY = 124;

    ctx.save();

    // Shadow for cords
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pinX, pinY + 2);
    ctx.lineTo(leftAnchorX, boardTopY + 2);
    ctx.moveTo(pinX, pinY + 2);
    ctx.lineTo(rightAnchorX, boardTopY + 2);
    ctx.stroke();

    // Golden cords
    const cordGrad = ctx.createLinearGradient(leftAnchorX, boardTopY, rightAnchorX, boardTopY);
    cordGrad.addColorStop(0, '#d1a74d');
    cordGrad.addColorStop(0.5, '#f7e199');
    cordGrad.addColorStop(1, '#d1a74d');

    ctx.strokeStyle = cordGrad;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(pinX, pinY);
    ctx.lineTo(leftAnchorX, boardTopY);
    ctx.moveTo(pinX, pinY);
    ctx.lineTo(rightAnchorX, boardTopY);
    ctx.stroke();

    // Top Hanging Pin / Knob (Metallic Gold Ball)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;

    const knobGrad = ctx.createRadialGradient(pinX - 2, pinY - 2, 1, pinX, pinY, 7);
    knobGrad.addColorStop(0, '#fffbf0');
    knobGrad.addColorStop(0.3, '#f3d37a');
    knobGrad.addColorStop(0.8, '#bd9433');
    knobGrad.addColorStop(1, '#745413');

    ctx.fillStyle = knobGrad;
    ctx.beginPath();
    ctx.arc(pinX, pinY, 6.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderBackingBoard(
    ctx: CanvasRenderingContext2D,
    config: VintageCalendarConfig,
    activePageIndex = 0,
    totalPages = 5
  ): void {
    const boardX = 184 - 116;
    const boardY = 124;
    const boardW = 232;
    const boardH = 348;
    const radius = 16;

    ctx.save();

    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 12;

    const boardGrad = ctx.createLinearGradient(boardX, boardY, boardX, boardY + boardH);
    boardGrad.addColorStop(0, '#9e1c2f');
    boardGrad.addColorStop(0.4, config.calendarColor || '#8a1727');
    boardGrad.addColorStop(1, '#660e1b');

    ctx.fillStyle = boardGrad;
    this.roundRect(ctx, boardX, boardY, boardW, boardH, radius);
    ctx.fill();

    // Subtle edge bevel stroke
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(255, 160, 180, 0.22)';
    ctx.lineWidth = 1.2;
    this.roundRect(ctx, boardX + 0.6, boardY + 0.6, boardW - 1.2, boardH - 1.2, radius - 1);
    ctx.stroke();

    // "Lịch 2026" Gold Header Script
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.font = 'italic 700 23px "Dancing Script", "Playfair Display", cursive, serif';
    ctx.fillText('Lịch 2026', 184, 154);

    const goldTextGrad = ctx.createLinearGradient(184 - 40, 153, 184 + 40, 153);
    goldTextGrad.addColorStop(0, '#eac675');
    goldTextGrad.addColorStop(0.5, '#fff0c7');
    goldTextGrad.addColorStop(1, '#deb25b');
    ctx.fillStyle = goldTextGrad;
    ctx.fillText('Lịch 2026', 184, 153);

    // Dynamic Paper Stack Bottom Edges (decreases as pages flip)
    const padX = 184 - 103;
    const padY = 188;
    const padW = 206;
    const padH = 270;

    const remainingPages = Math.max(1, totalPages - activePageIndex);
    const maxVisibleLayers = Math.min(4, remainingPages);

    for (let layer = maxVisibleLayers; layer >= 1; layer--) {
      const lyOffset = layer * 1.5;
      const lxOffset = layer % 2 === 0 ? 0.5 : -0.5;
      ctx.fillStyle = layer === 4 ? '#d6cbba' : layer === 3 ? '#e0d6c6' : '#ece4d5';
      ctx.fillRect(padX + lxOffset, padY + padH + lyOffset - 1, padW, 1.5);
    }

    ctx.restore();
  }

  private renderClampingBar(ctx: CanvasRenderingContext2D): void {
    const barX = 184 - 108;
    const barY = 174;
    const barW = 216;
    const barH = 18;
    const r = 4;

    ctx.save();

    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;

    const clampGrad = ctx.createLinearGradient(barX, barY, barX, barY + barH);
    clampGrad.addColorStop(0, '#4a0e19');
    clampGrad.addColorStop(0.3, '#320811');
    clampGrad.addColorStop(1, '#20040a');

    ctx.fillStyle = clampGrad;
    this.roundRect(ctx, barX, barY, barW, barH, r);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(barX + r, barY + 1);
    ctx.lineTo(barX + barW - r, barY + 1);
    ctx.stroke();

    ctx.restore();
  }

  public resetTearState(): void {
    this.paperFibers = [];
    this.lastSpawnedTearPage = -1;
  }

  public updatePaperFibers(delta: number): void {
    for (let i = this.paperFibers.length - 1; i >= 0; i--) {
      const f = this.paperFibers[i];
      f.life += delta;
      if (f.life >= f.maxLife) {
        this.paperFibers.splice(i, 1);
        continue;
      }
      f.x += f.vx * delta;
      f.y += f.vy * delta;
      f.vy += 150 * delta; // gentle gravity
      f.vx *= 0.96; // air drag
      f.rot += f.vRot * delta;
      f.alpha = Math.max(0, 0.95 * (1 - f.life / f.maxLife));
    }
  }

  private spawnTearFibers(padX: number, padY: number, padW: number): void {
    const count = 22;
    for (let i = 0; i < count; i++) {
      const fx = padX + 8 + Math.random() * (padW - 16);
      const fy = padY + 4 + (Math.random() - 0.5) * 4;
      this.paperFibers.push({
        x: fx,
        y: fy,
        vx: (Math.random() - 0.5) * 50,
        vy: -(25 + Math.random() * 60), // pops upward from tear seam
        w: 1.5 + Math.random() * 2.5,
        h: 1.0 + Math.random() * 2.0,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 14,
        alpha: 0.95,
        life: 0,
        maxLife: 0.45 + Math.random() * 0.35,
        color: Math.random() > 0.4 ? '#ffffff' : '#f5eee1',
      });
    }
  }

  private renderTornClampStubs(
    ctx: CanvasRenderingContext2D,
    padX: number,
    padY: number,
    padW: number,
    activePageIndex: number,
    flipProgress: number
  ): void {
    // Number of pages already torn off (plus current page if past tear threshold)
    const tornCount = activePageIndex + (flipProgress >= 0.50 ? 1 : 0);
    if (tornCount <= 0) return;

    ctx.save();
    for (let k = 0; k < tornCount; k++) {
      const tearPts = generateTearPoints(padW, k);
      const stubBaseY = padY;
      const stubDepth = 5.5 + (k % 3) * 1.5;

      ctx.save();
      // Drop shadow for the torn stub onto the revealed sheet below
      ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetY = 1.5;

      // Fill torn paper stub
      ctx.fillStyle = k % 2 === 0 ? '#faf6ec' : '#f4eee0';
      ctx.beginPath();
      ctx.moveTo(padX, stubBaseY);
      ctx.lineTo(padX + padW, stubBaseY);
      ctx.lineTo(padX + padW, stubBaseY + stubDepth + tearPts[tearPts.length - 1].y);
      for (let i = tearPts.length - 1; i >= 0; i--) {
        ctx.lineTo(padX + tearPts[i].x, stubBaseY + stubDepth + tearPts[i].y);
      }
      ctx.closePath();
      ctx.fill();

      // Delicate frayed white fiber highlight on torn edge
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(padX + tearPts[0].x, stubBaseY + stubDepth + tearPts[0].y);
      for (let i = 1; i < tearPts.length; i++) {
        ctx.lineTo(padX + tearPts[i].x, stubBaseY + stubDepth + tearPts[i].y);
      }
      ctx.stroke();

      ctx.restore();
    }
    ctx.restore();
  }

  private renderPaperFibers(ctx: CanvasRenderingContext2D): void {
    if (this.paperFibers.length === 0) return;
    ctx.save();
    for (const f of this.paperFibers) {
      if (f.alpha <= 0.01) continue;
      ctx.save();
      ctx.globalAlpha = f.alpha;
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rot);
      ctx.fillStyle = f.color;
      ctx.fillRect(-f.w * 0.5, -f.h * 0.5, f.w, f.h);
      ctx.restore();
    }
    ctx.restore();
  }

  private renderPaperPad(
    ctx: CanvasRenderingContext2D,
    config: VintageCalendarConfig,
    activeDay: CalendarDayData,
    nextDay: CalendarDayData | null,
    flipProgress: number,
    flipPageIndex: number,
    heartDrawProgress: number
  ): void {
    const padX = 184 - 103;
    const padY = 188;
    const padW = 206;
    const padH = 270;

    ctx.save();

    if (flipProgress <= 0 || !nextDay) {
      // Static single page
      const pageCanvas = this.offscreenPages.get(activeDay.dayNumber);
      if (pageCanvas) {
        ctx.drawImage(pageCanvas, padX, padY, padW, padH);
      }

      // Draw persistent torn stubs from previously torn days under the clamp
      this.renderTornClampStubs(ctx, padX, padY, padW, flipPageIndex, 0);

      // Draw Animated Heart if this is target day
      if (activeDay.isTarget && heartDrawProgress > 0) {
        this.renderHeartOutline(ctx, padX, padY, config, heartDrawProgress);
      }
    } else {
      // FLIPPING: Next day is revealed underneath
      const nextCanvas = this.offscreenPages.get(nextDay.dayNumber);
      if (nextCanvas) {
        ctx.drawImage(nextCanvas, padX, padY, padW, padH);

        if (nextDay.isTarget && heartDrawProgress > 0) {
          this.renderHeartOutline(ctx, padX, padY, config, heartDrawProgress);
        }
      }

      // Draw persistent torn paper stubs from previous days (and active day if torn)
      this.renderTornClampStubs(ctx, padX, padY, padW, flipPageIndex, flipProgress);

      // Spawn paper fibers at the exact rip moment (progress >= 0.50)
      if (flipProgress >= 0.50 && flipPageIndex !== this.lastSpawnedTearPage) {
        this.lastSpawnedTearPage = flipPageIndex;
        this.spawnTearFibers(padX, padY, padW);
      }

      // Render Curling & Flying active page
      const activeCanvas = this.offscreenPages.get(activeDay.dayNumber);
      if (activeCanvas) {
        this.renderCurlingSheet(
          ctx,
          activeCanvas,
          padX,
          padY,
          padW,
          padH,
          config,
          flipProgress,
          flipPageIndex
        );
      }

      // Render fluttering torn paper fiber particles
      this.renderPaperFibers(ctx);
    }

    ctx.restore();
  }

  private renderCurlingSheet(
    ctx: CanvasRenderingContext2D,
    pageCanvas: HTMLCanvasElement,
    padX: number,
    padY: number,
    padW: number,
    padH: number,
    config: VintageCalendarConfig,
    progress: number,
    pageIndex: number
  ): void {
    const curlData = computeCurlSlices({
      progress,
      pageWidth: padW,
      pageHeight: padH,
      curlIntensity: config.curlIntensity,
      paperStiffness: config.paperStiffness,
      pageIndex,
    });

    const { slices, tearTilted, flyY, flyX, tiltAngle, flyOpacity, shadowY, shadowIntensity } =
      curlData;

    // Draw Cast Shadow on Underlying Page
    if (shadowIntensity > 0 && !tearTilted) {
      ctx.save();
      const shadowH = 22;
      const sy = padY + shadowY;
      const shadowGrad = ctx.createLinearGradient(padX, sy, padX, sy + shadowH);
      shadowGrad.addColorStop(0, `rgba(0, 0, 0, ${shadowIntensity})`);
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(padX, sy, padW, shadowH);
      ctx.restore();
    }

    // Draw Slices with Painter's depth order
    ctx.save();
    let tearPoints: { x: number; y: number }[] = [];

    if (tearTilted) {
      ctx.globalAlpha = flyOpacity;
      const pivotX = padX + padW * 0.5 + flyX;
      const pivotY = padY + flyY + padH * 0.4;
      ctx.translate(pivotX, pivotY);
      ctx.rotate(tiltAngle);
      ctx.translate(-pivotX, -pivotY);

      // Organic ragged torn paper edge at top (deterministic multi-octave noise)
      tearPoints = generateTearPoints(padW, pageIndex);
      ctx.beginPath();
      ctx.moveTo(padX + flyX + tearPoints[0].x, padY + flyY + tearPoints[0].y);
      for (let i = 1; i < tearPoints.length; i++) {
        ctx.lineTo(padX + flyX + tearPoints[i].x, padY + flyY + tearPoints[i].y);
      }
      ctx.lineTo(padX + flyX + padW, padY + flyY + padH * 2);
      ctx.lineTo(padX + flyX, padY + flyY + padH * 2);
      ctx.closePath();
      ctx.clip();
    }

    const srcW = pageCanvas.width;
    const srcH = pageCanvas.height;
    const scaleFactor = srcH / padH;

    for (const slice of slices) {
      if (slice.dh <= 0.1) continue;

      const sy = slice.sy * scaleFactor;
      const sh = slice.sh * scaleFactor;

      const curX = padX + (slice.dx || 0) + (tearTilted ? flyX : 0);
      const curY = padY + slice.dy + (tearTilted ? flyY : 0);

      ctx.save();

      if (slice.isBackface) {
        // Natural warm aged paper tone
        ctx.fillStyle = '#f5eee1';
        ctx.fillRect(curX, curY, padW, slice.dh + 0.5);

        // Faint ghosted bleed-through of front page (calendar print shows through thin paper)
        ctx.save();
        ctx.globalAlpha = 0.10;
        ctx.drawImage(pageCanvas, 0, sy, srcW, sh, curX, curY, padW, slice.dh + 0.5);
        ctx.restore();

        // Ambient shading inside the roll
        ctx.fillStyle = `rgba(35, 22, 16, ${Math.max(0, 0.42 * (1 - slice.lighting))})`;
        ctx.fillRect(curX, curY, padW, slice.dh + 0.5);
      } else {
        ctx.drawImage(pageCanvas, 0, sy, srcW, sh, curX, curY, padW, slice.dh + 0.5);

        if (slice.lighting < 0.98) {
          ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.48, (1 - slice.lighting) * 0.75)})`;
          ctx.fillRect(curX, curY, padW, slice.dh + 0.5);
        } else if (slice.lighting > 1.02) {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.38, (slice.lighting - 1.0) * 0.75)})`;
          ctx.fillRect(curX, curY, padW, slice.dh + 0.5);
        }
      }

      ctx.restore();
    }

    // Frayed white fiber highlight along the torn top edge
    if (tearTilted && tearPoints.length > 0) {
      ctx.beginPath();
      ctx.moveTo(padX + flyX + tearPoints[0].x, padY + flyY + tearPoints[0].y);
      for (let i = 1; i < tearPoints.length; i++) {
        ctx.lineTo(padX + flyX + tearPoints[i].x, padY + flyY + tearPoints[i].y);
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.0;
      ctx.stroke();
    }

    ctx.restore();
  }

  public renderHeartOutline(
    ctx: CanvasRenderingContext2D,
    padX: number,
    padY: number,
    config: VintageCalendarConfig,
    progress: number
  ): void {
    if (progress <= 0 || this.smoothHeartPoints.length === 0) return;

    ctx.save();
    ctx.translate(padX, padY);

    const points = this.smoothHeartPoints;
    const totalCount = points.length;
    const targetCount = Math.max(2, Math.floor(progress * totalCount));

    ctx.strokeStyle = config.accentColor || '#ff3b68';
    ctx.lineWidth = 3.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.shadowColor = 'rgba(255, 60, 100, 0.45)';
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);

    for (let i = 1; i < targetCount; i++) {
      ctx.lineTo(points[i][0], points[i][1]);
    }

    ctx.stroke();

    ctx.restore();
  }

  private renderParticles(ctx: CanvasRenderingContext2D, particles: FloatingParticle[]): void {
    ctx.save();
    for (const p of particles) {
      if (p.alpha <= 0.01) continue;

      ctx.save();
      ctx.globalAlpha = p.alpha;

      if (p.type === 'heart') {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        this.drawHeartPath(ctx, p.x, p.y, p.scale * 16);
        ctx.fill();
      } else {
        ctx.fillStyle = '#fff4cc';
        ctx.shadowColor = '#e5be68';
        ctx.shadowBlur = 6;
        this.drawSparkleStar(ctx, p.x, p.y, p.scale * 6);
        ctx.fill();
      }

      ctx.restore();
    }
    ctx.restore();
  }

  private drawHeartPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
    ctx.save();
    ctx.translate(cx, cy);
    const s = size / 30;

    ctx.beginPath();
    ctx.moveTo(0, -6 * s);
    ctx.bezierCurveTo(-10 * s, -18 * s, -22 * s, -6 * s, -22 * s, 6 * s);
    ctx.bezierCurveTo(-22 * s, 16 * s, -12 * s, 26 * s, 0, 34 * s);
    ctx.bezierCurveTo(12 * s, 26 * s, 22 * s, 16 * s, 22 * s, 6 * s);
    ctx.bezierCurveTo(22 * s, -6 * s, 10 * s, -18 * s, 0, -6 * s);
    ctx.closePath();
    ctx.restore();
  }

  private drawSparkleStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    const innerR = r * 0.25;
    for (let i = 0; i < 8; i++) {
      const radius = i % 2 === 0 ? r : innerR;
      const angle = (i * Math.PI) / 4;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.restore();
  }

  private renderFinalMessage(
    ctx: CanvasRenderingContext2D,
    config: VintageCalendarConfig,
    progress: number
  ): void {
    const text = config.finalMessage || 'Ngày của anh ♥';
    const textY = 516;
    const textX = 184;

    ctx.save();

    // Clip-path left-to-right wipe reveal
    const maxClipW = 280;
    const clipW = maxClipW * Math.min(1, progress * 1.15);
    const clipX = textX - maxClipW * 0.5;

    ctx.beginPath();
    ctx.rect(clipX, textY - 35, clipW, 70);
    ctx.clip();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.shadowColor = 'rgba(255, 140, 180, 0.75)';
    ctx.shadowBlur = 14;

    ctx.font = '700 32px "Dancing Script", "Playfair Display", cursive, serif';
    ctx.fillStyle = '#fff0f5';
    ctx.fillText(text, textX, textY);

    ctx.restore();
  }

  private renderStartButton(
    ctx: CanvasRenderingContext2D,
    config: VintageCalendarConfig,
    pulse: number
  ): void {
    const btnX = 184;
    const btnY = 620;
    const radius = 26;

    ctx.save();

    const ringScale = 1 + pulse * 0.18;
    const ringAlpha = Math.max(0, 0.6 * (1 - pulse));
    ctx.strokeStyle = `rgba(255, 90, 140, ${ringAlpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(btnX, btnY, radius * ringScale, 0, Math.PI * 2);
    ctx.stroke();

    const btnGrad = ctx.createRadialGradient(btnX, btnY, 4, btnX, btnY, radius);
    btnGrad.addColorStop(0, '#4a0e1c');
    btnGrad.addColorStop(0.7, '#2f0610');
    btnGrad.addColorStop(1, '#1b0308');

    ctx.fillStyle = btnGrad;
    ctx.shadowColor = 'rgba(255, 60, 100, 0.4)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(btnX, btnY, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 120, 160, 0.5)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = config.accentColor || '#ff4070';
    ctx.shadowColor = '#ff4070';
    ctx.shadowBlur = 10;
    this.drawHeartPath(ctx, btnX, btnY - 1, 14);
    ctx.fill();

    ctx.shadowColor = 'rgba(255, 150, 180, 0.6)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#fce7ee';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = 'italic 700 17px "Dancing Script", cursive, serif';
    ctx.fillText('Nhấn để lật lịch', btnX, btnY + radius + 10);

    ctx.restore();
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }
}
