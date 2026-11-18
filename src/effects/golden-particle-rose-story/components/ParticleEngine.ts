/**
 * ParticleEngine.ts
 * High-performance 2D particle simulation for cinematic golden love story transitions.
 * Supports up to 25,000 particles with Float32Array buffers and additive spark rendering.
 */

export interface ParticleTarget {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
  a: number;
  size: number;
  group: number; // 0: primary/outline, 1: secondary/fill, 2: ambient
}

export interface ParticleSystemState {
  count: number;
  x: Float32Array;
  y: Float32Array;
  tx: Float32Array;
  ty: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  r: Float32Array;
  g: Float32Array;
  b: Float32Array;
  a: Float32Array;
  size: Float32Array;
  seed: Float32Array;
  group: Uint8Array;
}

// Simple deterministic PRNG (Linear Congruential Generator)
function createPrng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export class ParticleEngine {
  private count: number;
  private state: ParticleSystemState;
  private prng: () => number;
  private sparkSprite: HTMLCanvasElement | null = null;
  private haloSprite: HTMLCanvasElement | null = null;
  private currentMode: 'vortex' | 'heart' | 'text' | 'photo' | 'bouquet' | 'ambient' = 'vortex';

  constructor(count = 12000, seed = 20261119) {
    this.count = count;
    this.prng = createPrng(seed);

    this.state = {
      count,
      x: new Float32Array(count),
      y: new Float32Array(count),
      tx: new Float32Array(count),
      ty: new Float32Array(count),
      vx: new Float32Array(count),
      vy: new Float32Array(count),
      r: new Float32Array(count),
      g: new Float32Array(count),
      b: new Float32Array(count),
      a: new Float32Array(count),
      size: new Float32Array(count),
      seed: new Float32Array(count),
      group: new Uint8Array(count),
    };

    // Initialize initial random positions & seeds
    for (let i = 0; i < count; i++) {
      this.state.x[i] = 179 + (this.prng() - 0.5) * 350;
      this.state.y[i] = 373 + (this.prng() - 0.5) * 700;
      this.state.tx[i] = this.state.x[i];
      this.state.ty[i] = this.state.y[i];
      this.state.vx[i] = (this.prng() - 0.5) * 15;
      this.state.vy[i] = (this.prng() - 0.5) * 15;
      this.state.r[i] = 255;
      this.state.g[i] = 215;
      this.state.b[i] = 80;
      this.state.a[i] = 0.45 + this.prng() * 0.4;
      this.state.size[i] = 1.0 + this.prng() * 1.3;
      this.state.seed[i] = this.prng() * 1000;
      this.state.group[i] = 0;
    }

    this.initSprites();
  }

  private initSprites() {
    if (typeof document === 'undefined') return;

    try {
      // 1. Sharp diamond spark sprite (keeps individual particles crisp and diamond-like)
      const sCanvas = document.createElement('canvas');
      sCanvas.width = 16;
      sCanvas.height = 16;
      const sCtx = sCanvas.getContext?.('2d');
      if (sCtx) {
        const grad = sCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        grad.addColorStop(0.2, 'rgba(255, 235, 150, 0.9)');
        grad.addColorStop(0.5, 'rgba(240, 180, 50, 0.4)');
        grad.addColorStop(1, 'rgba(200, 140, 20, 0)');
        sCtx.fillStyle = grad;
        sCtx.fillRect(0, 0, 16, 16);
        this.sparkSprite = sCanvas;
      }

      // 2. Soft halo sprite for ambient glow
      const hCanvas = document.createElement('canvas');
      hCanvas.width = 24;
      hCanvas.height = 24;
      const hCtx = hCanvas.getContext?.('2d');
      if (hCtx) {
        const grad = hCtx.createRadialGradient(12, 12, 0, 12, 12, 12);
        grad.addColorStop(0, 'rgba(255, 240, 180, 0.7)');
        grad.addColorStop(0.35, 'rgba(235, 180, 50, 0.25)');
        grad.addColorStop(1, 'rgba(180, 120, 20, 0)');
        hCtx.fillStyle = grad;
        hCtx.fillRect(0, 0, 24, 24);
        this.haloSprite = hCanvas;
      }
    } catch {
      // Non-browser / test environment fallback
    }
  }

  public setCount(newCount: number) {
    if (newCount !== this.count && newCount > 1000 && newCount <= 30000) {
      this.count = newCount;
      this.state = {
        count: newCount,
        x: new Float32Array(newCount),
        y: new Float32Array(newCount),
        tx: new Float32Array(newCount),
        ty: new Float32Array(newCount),
        vx: new Float32Array(newCount),
        vy: new Float32Array(newCount),
        r: new Float32Array(newCount),
        g: new Float32Array(newCount),
        b: new Float32Array(newCount),
        a: new Float32Array(newCount),
        size: new Float32Array(newCount),
        seed: new Float32Array(newCount),
        group: new Uint8Array(newCount),
      };
      for (let i = 0; i < newCount; i++) {
        this.state.x[i] = 179 + (this.prng() - 0.5) * 350;
        this.state.y[i] = 373 + (this.prng() - 0.5) * 700;
        this.state.tx[i] = this.state.x[i];
        this.state.ty[i] = this.state.y[i];
        this.state.r[i] = 255;
        this.state.g[i] = 215;
        this.state.b[i] = 80;
        this.state.a[i] = 0.45 + this.prng() * 0.4;
        this.state.size[i] = 1.0 + this.prng() * 1.3;
        this.state.seed[i] = this.prng() * 1000;
      }
    }
  }

  public setMode(mode: 'vortex' | 'heart' | 'text' | 'photo' | 'bouquet' | 'ambient') {
    this.currentMode = mode;
  }

  public morphTo(targets: ParticleTarget[], dispersion = 1.0) {
    const n = Math.min(this.count, targets.length);
    const prng = this.prng;

    for (let i = 0; i < this.count; i++) {
      const target = targets[i % n];
      this.state.tx[i] = target.x;
      this.state.ty[i] = target.y;

      if (dispersion > 0.05) {
        const angle = prng() * Math.PI * 2;
        const speed = (12 + prng() * 32) * dispersion;
        this.state.vx[i] += Math.cos(angle) * speed;
        this.state.vy[i] += Math.sin(angle) * speed;
      }

      this.state.r[i] = target.r;
      this.state.g[i] = target.g;
      this.state.b[i] = target.b;
      this.state.a[i] = target.a;
      this.state.size[i] = target.size;
      this.state.group[i] = target.group;
    }
  }

  public update(deltaSeconds: number, time: number, speedMultiplier = 1.0) {
    const dt = Math.min(deltaSeconds, 0.05) * speedMultiplier;
    const { count, x, y, tx, ty, vx, vy, seed, group } = this.state;

    const spring = 8.5;
    const damping = 0.84;

    const cx = 179;
    const cy = 358;

    for (let i = 0; i < count; i++) {
      let targetX = tx[i];
      let targetY = ty[i];

      // Swirling rotation during vortex mode
      if (this.currentMode === 'vortex') {
        const dx = targetX - cx;
        const dy = targetY - cy;
        const r = Math.sqrt(dx * dx + dy * dy);
        const currentAngle = Math.atan2(dy, dx);
        // Differential angular speed: inner core spins faster
        const omega = (0.9 + 18.0 / (r + 15.0)) * 0.9;
        const newAngle = currentAngle + omega * dt;
        targetX = cx + Math.cos(newAngle) * r;
        targetY = cy + Math.sin(newAngle) * r;
        this.state.tx[i] = targetX;
        this.state.ty[i] = targetY;
      }

      const dx = targetX - x[i];
      const dy = targetY - y[i];

      const s = seed[i];
      const isAmbient = group[i] === 2;
      const driftX = Math.sin(time * 2.2 + s) * (isAmbient ? 5.0 : 1.2);
      const driftY = Math.cos(time * 2.5 + s * 1.2) * (isAmbient ? 5.0 : 1.2);

      vx[i] = (vx[i] + (dx * spring + driftX) * dt) * Math.pow(damping, dt * 60);
      vy[i] = (vy[i] + (dy * spring + driftY) * dt) * Math.pow(damping, dt * 60);

      x[i] += vx[i] * dt;
      y[i] += vy[i] * dt;
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    baseScale = 1.0,
    time = 0,
    glowMult = 1.0
  ) {
    const { count, x, y, r, g, b, a, size, seed, group } = this.state;
    const sprite = this.sparkSprite;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < count; i++) {
      const px = x[i] * baseScale;
      const py = y[i] * baseScale;

      if (px < -15 || px > width + 15 || py < -15 || py > height + 15) continue;

      const twinkle = 0.85 + 0.15 * Math.sin(time * 4.0 + seed[i]);
      const alpha = Math.min(0.9, a[i] * twinkle * glowMult * 0.7);
      if (alpha <= 0.01) continue;

      const pSize = size[i] * baseScale * (0.92 + 0.16 * Math.sin(time * 3.2 + seed[i]));

      ctx.globalAlpha = alpha;

      if (this.currentMode === 'bouquet') {
        // True colored particles for bouquet assembly (Ruby roses, emerald foliage, cream wrapper)
        ctx.fillStyle = `rgb(${r[i] | 0}, ${g[i] | 0}, ${b[i] | 0})`;
        ctx.beginPath();
        ctx.arc(px, py, pSize * 1.1, 0, Math.PI * 2);
        ctx.fill();
      } else if (group[i] === 0 && sprite && pSize > 0.6) {
        // Draw crisp diamond spark sprite
        const drawSize = pSize * 2.2;
        ctx.drawImage(sprite, px - drawSize * 0.5, py - drawSize * 0.5, drawSize, drawSize);
      } else if (group[i] === 1 && this.haloSprite && pSize > 0.8) {
        const drawSize = pSize * 2.8;
        ctx.drawImage(this.haloSprite, px - drawSize * 0.5, py - drawSize * 0.5, drawSize, drawSize);
      } else {
        // Direct pixel spark fill for pristine sharpness
        ctx.fillStyle = `rgb(${r[i] | 0}, ${g[i] | 0}, ${b[i] | 0})`;
        ctx.fillRect(px - pSize * 0.5, py - pSize * 0.5, pSize, pSize);
      }
    }

    ctx.restore();
  }

  // =========================================================================
  // SHAPE GENERATORS (NORMALIZED TO 358 x 746 REFERENCE COORDINATE SYSTEM)
  // =========================================================================

  /**
   * 1. Vortex (Golden Spiral Galaxy with curved arms & clear dark gaps)
   */
  public generateVortex(width = 358, height = 746): ParticleTarget[] {
    this.currentMode = 'vortex';
    const targets: ParticleTarget[] = [];
    const cx = width * 0.5;
    const cy = height * 0.48;
    const prng = this.prng;

    const arms = 2;
    const maxRadius = Math.min(width, height) * 0.52;

    for (let i = 0; i < this.count; i++) {
      const armIndex = i % arms;
      const frac = Math.pow(prng(), 0.85);
      const r = 14 + frac * (maxRadius - 14);

      const armOffset = (armIndex * Math.PI * 2) / arms;
      const spiralTheta = armOffset + Math.pow(r / maxRadius, 0.7) * Math.PI * 3.6;

      const armWidth = 8 + r * 0.15;
      const jitterR = (prng() - 0.5) * armWidth;
      const jitterA = (prng() - 0.5) * 0.16;

      const angle = spiralTheta + jitterA;
      const finalR = Math.max(6, r + jitterR);

      const px = cx + Math.cos(angle) * finalR;
      const py = cy + Math.sin(angle) * (finalR * 0.95);

      const isCore = finalR < 25;
      const red = 255;
      const green = isCore ? 245 : 210 + prng() * 30;
      const blue = isCore ? 190 : 75 + prng() * 65;
      const alpha = isCore ? 0.75 : 0.4 + (1 - finalR / maxRadius) * 0.4;
      const pSize = isCore ? 1.4 + prng() * 1.0 : 1.0 + prng() * 1.1;

      targets.push({
        x: px,
        y: py,
        r: red,
        g: green,
        b: blue,
        a: alpha,
        size: pSize,
        group: isCore ? 0 : 1,
      });
    }

    return targets;
  }

  /**
   * 2. Golden Heart (Crisp glowing perimeter line, diagonal Saturn stardust ring, open center for "Anh Yêu")
   */
  public generateHeart(width = 358, height = 746): ParticleTarget[] {
    this.currentMode = 'heart';
    const targets: ParticleTarget[] = [];
    const cx = width * 0.5;
    const cy = height * 0.45;
    const prng = this.prng;

    const scale = 7.6;
    const ringAngle = -0.38; // ~ -22 degrees diagonal tilt

    for (let i = 0; i < this.count; i++) {
      const mode = prng();

      if (mode < 0.72) {
        // 72% ON THE CRISP GLOWING PERIMETER LINE
        const t = prng() * Math.PI * 2;
        const sinT = Math.sin(t);
        const cosT = Math.cos(t);
        const hx = 16 * Math.pow(sinT, 3);
        const hy = -(13 * cosT - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

        // Very tight jitter for a razor sharp glowing golden contour
        const borderJitter = (prng() - 0.5) * 1.8;

        targets.push({
          x: cx + hx * scale + borderJitter,
          y: cy + hy * scale + borderJitter,
          r: 255,
          g: 228 + prng() * 25,
          b: 140 + prng() * 90,
          a: 0.85,
          size: 1.2 + prng() * 1.0,
          group: 0,
        });
      } else if (mode < 0.88) {
        // 16% DIAGONAL STARDUST ORBIT RING (Saturn-like ring crossing the heart)
        const ringT = prng() * Math.PI * 2;
        const rx = 105 + (prng() - 0.5) * 14;
        const ry = 28 + (prng() - 0.5) * 8;
        const localX = Math.cos(ringT) * rx;
        const localY = Math.sin(ringT) * ry;

        // Rotate by ringAngle
        const rotX = localX * Math.cos(ringAngle) - localY * Math.sin(ringAngle);
        const rotY = localX * Math.sin(ringAngle) + localY * Math.cos(ringAngle);

        targets.push({
          x: cx + rotX,
          y: cy + rotY + 15,
          r: 255,
          g: 225,
          b: 110,
          a: 0.45 + prng() * 0.35,
          size: 1.0 + prng() * 1.1,
          group: 1,
        });
      } else {
        // 12% FAINT AMBIENT STARDUST OUTSIDE (CENTER IS COMPLETELY CLEAR FOR ANH YEU)
        const angle = prng() * Math.PI * 2;
        const rad = 145 + prng() * 120;
        targets.push({
          x: cx + Math.cos(angle) * rad,
          y: cy + Math.sin(angle) * (rad * 1.15),
          r: 245,
          g: 215,
          b: 110,
          a: 0.18 + prng() * 0.25,
          size: 0.8 + prng() * 0.8,
          group: 2,
        });
      }
    }

    return targets;
  }

  /**
   * 3. Text Shape (Airy sparkling dust cloud flowing around crisp golden text)
   */
  public generateTextShape(
    lines: string[],
    fontSize = 32,
    width = 358,
    height = 746
  ): ParticleTarget[] {
    this.currentMode = 'text';
    const targets: ParticleTarget[] = [];
    const prng = this.prng;

    let sampledPoints: Array<{ x: number; y: number }> = [];

    if (typeof document !== 'undefined') {
      const offscreen = document.createElement('canvas');
      offscreen.width = width;
      offscreen.height = height;
      const ctx = offscreen.getContext('2d');

      if (ctx) {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `bold ${fontSize}px 'Dancing Script', 'Playpen Sans', 'Comfortaa', cursive, sans-serif`;

        const lineHeight = fontSize * 1.4;
        const totalTextHeight = lines.length * lineHeight;
        const startY = height * 0.46 - totalTextHeight * 0.5 + lineHeight * 0.5;

        for (let idx = 0; idx < lines.length; idx++) {
          ctx.fillText(lines[idx], width * 0.5, startY + idx * lineHeight);
        }

        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // Sample with 3.5px stride
        const stride = 3;
        for (let y = 0; y < height; y += stride) {
          for (let x = 0; x < width; x += stride) {
            const alpha = data[(y * width + x) * 4 + 3];
            if (alpha > 80) {
              sampledPoints.push({ x, y });
            }
          }
        }
      }
    }

    if (sampledPoints.length === 0) {
      for (let i = 0; i < 400; i++) {
        sampledPoints.push({
          x: width * 0.5 + (prng() - 0.5) * 160,
          y: height * 0.46 + (prng() - 0.5) * 50,
        });
      }
    }

    const nPoints = sampledPoints.length;
    for (let i = 0; i < this.count; i++) {
      const mode = prng();

      if (mode < 0.08) {
        // 8% OF PARTICLES DELICATELY TRACE THE LETTERS
        const pt = sampledPoints[i % nPoints];
        const jitter = (prng() - 0.5) * 1.8;
        targets.push({
          x: pt.x + jitter,
          y: pt.y + jitter,
          r: 255,
          g: 228 + prng() * 25,
          b: 120 + prng() * 70,
          a: 0.32 + prng() * 0.2,
          size: 0.9 + prng() * 0.8,
          group: 0,
        });
      } else {
        // 92% OF PARTICLES FORM A WIDE SWIRLING STARDUST HALO AROUND THE TEXT
        const angle = prng() * Math.PI * 2;
        const rad = 45 + prng() * 135;
        targets.push({
          x: width * 0.5 + Math.cos(angle) * rad,
          y: height * 0.46 + Math.sin(angle) * (rad * 0.68),
          r: 245 + prng() * 10,
          g: 215 + prng() * 30,
          b: 110 + prng() * 60,
          a: 0.12 + prng() * 0.22,
          size: 0.8 + prng() * 0.8,
          group: 2,
        });
      }
    }

    return targets;
  }

  /**
   * 4. Heart Photo Frame (Double golden border hugging the heart photo perimeter)
   */
  public generatePhotoBorder(width = 358, height = 746): ParticleTarget[] {
    this.currentMode = 'photo';
    const targets: ParticleTarget[] = [];
    const cx = width * 0.5;
    const cy = height * 0.44 + 6;
    const scale = 8.6;
    const prng = this.prng;

    for (let i = 0; i < this.count; i++) {
      const mode = prng();
      const t = prng() * Math.PI * 2;
      const sinT = Math.sin(t);
      const cosT = Math.cos(t);
      const hx = 16 * Math.pow(sinT, 3);
      const hy = -(13 * cosT - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

      if (mode < 0.65) {
        // Bright sharp border framing the heart photo edge
        const offset = (prng() - 0.5) * 2.0;
        targets.push({
          x: cx + hx * scale + offset,
          y: cy + hy * scale + offset,
          r: 255,
          g: 235,
          b: 160,
          a: 0.85,
          size: 1.2 + prng() * 1.1,
          group: 0,
        });
      } else if (mode < 0.88) {
        // Soft shimmering aura outer halo radiating outward
        const haloScale = scale * (1.03 + prng() * 0.08);
        targets.push({
          x: cx + hx * haloScale + (prng() - 0.5) * 4,
          y: cy + hy * haloScale + (prng() - 0.5) * 4,
          r: 250,
          g: 215,
          b: 95,
          a: 0.45 + prng() * 0.35,
          size: 1.0 + prng() * 1.0,
          group: 1,
        });
      } else {
        // Floating sparkles outside
        const dist = 155 + prng() * 115;
        const angle = prng() * Math.PI * 2;
        targets.push({
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * (dist * 1.1),
          r: 240,
          g: 210,
          b: 120,
          a: 0.18 + prng() * 0.25,
          size: 0.8 + prng() * 0.8,
          group: 2,
        });
      }
    }

    return targets;
  }

  /**
   * 5. Flower Bouquet Silhouette Assembly (Colored particles matching bouquet structure)
   */
  public generateBouquetSilhouette(width = 358, _height = 746): ParticleTarget[] {
    this.currentMode = 'bouquet';
    const targets: ParticleTarget[] = [];
    const cx = width * 0.5;
    const cy = 456; // Exact center of bouquet SVG container
    const prng = this.prng;

    const rosePositions = [
      { x: -54, y: -76 },
      { x: 54, y: -76 },
      { x: -85, y: -20 },
      { x: 0, y: -10 },
      { x: 85, y: -20 },
      { x: -68, y: 40 },
      { x: -28, y: 70 },
      { x: 28, y: 70 },
      { x: 68, y: 40 },
    ];

    for (let i = 0; i < this.count; i++) {
      const mode = prng();

      if (mode < 0.38) {
        // 9 Rose Buds (Ruby red & pink particles)
        const rose = rosePositions[i % 9];
        const angle = prng() * Math.PI * 2;
        const rad = Math.sqrt(prng()) * 18;
        targets.push({
          x: cx + rose.x + Math.cos(angle) * rad,
          y: cy + rose.y + Math.sin(angle) * (rad * 1.15),
          r: 235 + prng() * 20,
          g: 28 + prng() * 45,
          b: 55 + prng() * 45,
          a: 0.75 + prng() * 0.2,
          size: 1.3 + prng() * 1.1,
          group: 0,
        });
      } else if (mode < 0.60) {
        // Leaves and Stems (Emerald & sage green particles)
        const t = prng();
        let lx = 0;
        let ly = 0;
        if (prng() < 0.6) {
          const baseRose = rosePositions[Math.floor(prng() * 9)];
          lx = baseRose.x + (prng() - 0.5) * 36;
          ly = baseRose.y + (prng() - 0.5) * 32;
        } else {
          lx = (prng() - 0.5) * 24 * (1 - t);
          ly = 55 + t * 65;
        }
        targets.push({
          x: cx + lx,
          y: cy + ly,
          r: 34 + prng() * 35,
          g: 175 + prng() * 45,
          b: 75 + prng() * 45,
          a: 0.65 + prng() * 0.2,
          size: 1.0 + prng() * 1.1,
          group: 1,
        });
      } else if (mode < 0.78) {
        // Kraft Fan Wrapper (Cream & golden champagne particles)
        const fanT = prng();
        const fanAngle = -Math.PI * 0.5 + (prng() - 0.5) * 1.25;
        const fanDist = 40 + fanT * 165;
        targets.push({
          x: cx + Math.cos(fanAngle) * fanDist,
          y: cy + 115 + Math.sin(fanAngle) * fanDist,
          r: 245,
          g: 228 + prng() * 20,
          b: 170 + prng() * 35,
          a: 0.45 + prng() * 0.25,
          size: 1.0 + prng() * 1.0,
          group: 1,
        });
      } else if (mode < 0.88) {
        // Ribbon Bow & Tails (Crimson & pink particles)
        const isTail = prng() < 0.45;
        let rx = cx;
        let ry = cy + 124;
        if (isTail) {
          const tailT = prng();
          rx += (prng() < 0.5 ? -10 : 10) + (prng() - 0.5) * 8;
          ry += tailT * 48;
        } else {
          const bowAngle = prng() * Math.PI * 2;
          const loopSide = prng() < 0.5 ? -20 : 20;
          rx += loopSide + Math.cos(bowAngle) * 15;
          ry += Math.sin(bowAngle) * 9;
        }
        targets.push({
          x: rx,
          y: ry,
          r: 220 + prng() * 30,
          g: 28 + prng() * 25,
          b: 50 + prng() * 35,
          a: 0.72 + prng() * 0.2,
          size: 1.2 + prng() * 1.0,
          group: 0,
        });
      } else {
        // Ambient stardust around bouquet
        const rad = 50 + prng() * 150;
        const angle = prng() * Math.PI * 2;
        targets.push({
          x: cx + Math.cos(angle) * rad,
          y: cy + Math.sin(angle) * (rad * 1.05),
          r: 255,
          g: 215,
          b: 130,
          a: 0.22 + prng() * 0.28,
          size: 0.8 + prng() * 0.8,
          group: 2,
        });
      }
    }

    return targets;
  }

  /**
   * 6. Ambient Dispersal (Gentle sparkles around edges, leaves bouquet completely clear)
   */
  public generateAmbientDispersal(width = 358, height = 746): ParticleTarget[] {
    this.currentMode = 'ambient';
    const targets: ParticleTarget[] = [];
    const prng = this.prng;

    for (let i = 0; i < this.count; i++) {
      // Float along top, bottom, and side margins, avoiding bouquet center
      let px: number;
      let py: number;

      if (prng() < 0.45) {
        // Top header area around title
        px = prng() * width;
        py = prng() * (height * 0.32);
      } else if (prng() < 0.75) {
        // Bottom area around hint pill
        px = prng() * width;
        py = height * 0.82 + prng() * (height * 0.18);
      } else {
        // Outer left/right edges
        const isLeft = prng() < 0.5;
        px = isLeft ? prng() * 45 : width - prng() * 45;
        py = height * 0.3 + prng() * (height * 0.55);
      }

      targets.push({
        x: px,
        y: py,
        r: 255,
        g: 220 + prng() * 30,
        b: 130 + prng() * 70,
        a: 0.15 + prng() * 0.25,
        size: 0.8 + prng() * 0.8,
        group: 2,
      });
    }

    return targets;
  }
}
