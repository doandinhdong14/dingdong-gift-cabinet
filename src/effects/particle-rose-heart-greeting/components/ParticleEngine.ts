export interface ParticleTarget {
  x: number;
  y: number;
  z?: number;
  size?: number;
  alpha?: number;
  r?: number;
  g?: number;
  b?: number;
}

// Deterministic linear congruential generator
export function createPrng(seed: number) {
  let s = Math.abs(seed) || 1234567;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export class ParticleEngine {
  readonly count: number;
  readonly seed: number;

  readonly x: Float32Array;
  readonly y: Float32Array;
  readonly z: Float32Array;
  readonly tx: Float32Array;
  readonly ty: Float32Array;
  readonly tz: Float32Array;
  readonly vx: Float32Array;
  readonly vy: Float32Array;
  readonly vz: Float32Array;
  readonly size: Float32Array;
  readonly alpha: Float32Array;
  readonly targetAlpha: Float32Array;
  readonly r: Float32Array;
  readonly g: Float32Array;
  readonly b: Float32Array;
  readonly tr: Float32Array;
  readonly tg: Float32Array;
  readonly tb: Float32Array;
  readonly wobbleSpeed: Float32Array;
  readonly wobblePhase: Float32Array;
  readonly wobbleRadius: Float32Array;

  private glowSprite: HTMLCanvasElement | null = null;

  constructor(count: number, seed: number) {
    this.count = count;
    this.seed = seed;

    this.x = new Float32Array(count);
    this.y = new Float32Array(count);
    this.z = new Float32Array(count);
    this.tx = new Float32Array(count);
    this.ty = new Float32Array(count);
    this.tz = new Float32Array(count);
    this.vx = new Float32Array(count);
    this.vy = new Float32Array(count);
    this.vz = new Float32Array(count);
    this.size = new Float32Array(count);
    this.alpha = new Float32Array(count);
    this.targetAlpha = new Float32Array(count);
    this.r = new Float32Array(count);
    this.g = new Float32Array(count);
    this.b = new Float32Array(count);
    this.tr = new Float32Array(count);
    this.tg = new Float32Array(count);
    this.tb = new Float32Array(count);
    this.wobbleSpeed = new Float32Array(count);
    this.wobblePhase = new Float32Array(count);
    this.wobbleRadius = new Float32Array(count);

    this.initBuffers();
    this.createGlowSprite();
  }

  private initBuffers() {
    const prng = createPrng(this.seed);
    for (let i = 0; i < this.count; i++) {
      this.wobbleSpeed[i] = 1.0 + prng() * 2.2;
      this.wobblePhase[i] = prng() * Math.PI * 2;
      this.wobbleRadius[i] = 0.5 + prng() * 1.8;
      this.size[i] = 0.8 + prng() * 1.4;
      this.alpha[i] = 0.35 + prng() * 0.45;
      this.targetAlpha[i] = this.alpha[i];

      // Multi-tonal pink palette matching reference:
      // #FF4F9A (255, 79, 154), #F96AAA (249, 106, 170), #E83C85 (232, 60, 133), #FF9DC6 (255, 157, 198)
      const colorType = prng();
      if (colorType < 0.4) {
        this.r[i] = 255;
        this.g[i] = 79;
        this.b[i] = 154;
      } else if (colorType < 0.7) {
        this.r[i] = 249;
        this.g[i] = 106;
        this.b[i] = 170;
      } else if (colorType < 0.88) {
        this.r[i] = 232;
        this.g[i] = 60;
        this.b[i] = 133;
      } else {
        this.r[i] = 255;
        this.g[i] = 170;
        this.b[i] = 205;
      }

      this.tr[i] = this.r[i];
      this.tg[i] = this.g[i];
      this.tb[i] = this.b[i];
    }
  }

  private createGlowSprite() {
    if (typeof document === 'undefined') return;
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 120, 180, 0.9)');
    grad.addColorStop(0.35, 'rgba(255, 79, 154, 0.45)');
    grad.addColorStop(0.7, 'rgba(232, 60, 133, 0.15)');
    grad.addColorStop(1, 'rgba(232, 60, 133, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(16, 16, 16, 0, Math.PI * 2);
    ctx.fill();
    this.glowSprite = canvas;
  }

  /**
   * Phase A: Organic pink particle field across the entire mobile screen.
   * Multi-Gaussian center density + full viewport soft starry background.
   * ABSOLUTELY ZERO BORDER CLAMPING.
   */
  generateCloud(w: number, h: number): ParticleTarget[] {
    const prng = createPrng(this.seed + 101);
    const targets: ParticleTarget[] = [];
    const cx = w * 0.5;
    const cy = h * 0.46;

    for (let i = 0; i < this.count; i++) {
      let x = 0;
      let y = 0;
      let alpha = 0.5;
      let size = 1.0;

      const pType = prng();

      if (pType < 0.55) {
        // Core cluster: Dense around visual center with elliptical soft falloff
        const u1 = prng();
        const u2 = prng();
        // Box-Muller transform for natural Gaussian distribution
        const randStd = Math.sqrt(-2.0 * Math.log(Math.max(1e-6, u1))) * Math.cos(2.0 * Math.PI * u2);
        const randStdY = Math.sqrt(-2.0 * Math.log(Math.max(1e-6, u1))) * Math.sin(2.0 * Math.PI * u2);

        // Core radius spans 45% of width, 38% of height
        x = cx + randStd * (w * 0.22);
        y = cy + randStdY * (h * 0.20);

        const dist = Math.hypot((x - cx) / (w * 0.5), (y - cy) / (h * 0.5));
        alpha = Math.max(0.18, 0.88 - dist * 0.5) * (0.6 + prng() * 0.4);
        size = 0.9 + prng() * 1.5;
      } else if (pType < 0.82) {
        // Intermediate organic veil: Asymmetric lobe
        const angle = prng() * Math.PI * 2;
        const radDist = Math.pow(prng(), 0.6);
        const rx = w * 0.44 * radDist;
        const ry = h * 0.42 * radDist;
        x = cx + Math.cos(angle) * rx;
        y = cy + Math.sin(angle) * ry;

        const dist = Math.hypot((x - cx) / (w * 0.5), (y - cy) / (h * 0.5));
        alpha = Math.max(0.12, 0.65 - dist * 0.45) * (0.5 + prng() * 0.5);
        size = 0.8 + prng() * 1.3;
      } else {
        // Full screen starry background stardust across entire 354 x 738 viewport
        x = prng() * w;
        y = prng() * h;

        // Soft fade near screen edges (no harsh cutoff)
        const edgeDistX = Math.min(x, w - x) / (w * 0.2);
        const edgeDistY = Math.min(y, h - y) / (h * 0.2);
        const edgeFade = Math.min(1.0, Math.min(edgeDistX, edgeDistY));

        alpha = (0.08 + prng() * 0.35) * edgeFade;
        size = 0.6 + prng() * 1.1;
      }

      // Palette assignment
      let r = 255;
      let g = 79 + Math.round(prng() * 45);
      let b = 154 + Math.round(prng() * 35);

      if (prng() < 0.12) {
        // Sparkling highlights
        g = 180 + Math.round(prng() * 60);
        b = 210 + Math.round(prng() * 40);
      }

      targets.push({
        x,
        y,
        z: (prng() - 0.5) * 40,
        alpha,
        size,
        r,
        g,
        b,
      });
    }

    return targets;
  }

  /**
   * Phase C & D: Glyph sampling for Unicode text ("Chúc Mừng", "women's day").
   * Controlled particle allocation (1,100 particles on strokes, rest ambient).
   * ZERO OVEREXPOSURE. ALWAYS RICH VIBRANT PINK.
   */
  generateTextShape(lines: string[], fontSize: number, w: number, h: number): ParticleTarget[] {
    if (typeof document === 'undefined') return [];

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${fontSize}px "Dancing Script", "Great Vibes", "Brush Script MT", "Segoe Script", cursive, sans-serif`;

    const lineHeight = fontSize * 1.28;
    const totalHeight = lines.length * lineHeight;
    const startY = h * 0.46 - totalHeight * 0.5 + lineHeight * 0.5;

    lines.forEach((line, idx) => {
      ctx.fillText(line, w * 0.5, startY + idx * lineHeight);
    });

    const imgData = ctx.getImageData(0, 0, w, h);
    const pixels = imgData.data;

    const strokePoints: { x: number; y: number }[] = [];
    const step = 2;
    for (let py = 0; py < h; py += step) {
      for (let px = 0; px < w; px += step) {
        const idx = (py * w + px) * 4;
        if (pixels[idx] > 60) {
          strokePoints.push({ x: px, y: py });
        }
      }
    }

    const prng = createPrng(this.seed + 202);
    const targets: ParticleTarget[] = [];

    // Strictly limit text particles to ~1,100 particles to prevent ANY white blowout
    const textParticles = Math.min(1100, strokePoints.length);

    for (let i = 0; i < this.count; i++) {
      if (i < textParticles && strokePoints.length > 0) {
        const pt = strokePoints[Math.floor(prng() * strokePoints.length)];
        targets.push({
          x: pt.x + (prng() - 0.5) * 1.5,
          y: pt.y + (prng() - 0.5) * 1.5,
          z: (prng() - 0.5) * 8,
          alpha: 0.65 + prng() * 0.3,
          size: 1.1 + prng() * 0.8,
          r: 255,
          g: 65 + Math.round(prng() * 30), // Saturated bright pink
          b: 145 + Math.round(prng() * 35),
        });
      } else {
        // Surrounding ambient stardust across the screen
        const x = prng() * w;
        const y = prng() * h;
        const distFromCenter = Math.hypot(x - w * 0.5, y - h * 0.46);

        // Keep ambient particles slightly thinner near the text center for clear contrast
        const alpha = distFromCenter < 80 ? 0.04 + prng() * 0.1 : 0.08 + prng() * 0.25;

        targets.push({
          x,
          y,
          z: (prng() - 0.5) * 35,
          alpha,
          size: 0.7 + prng() * 1.0,
          r: 255,
          g: 80 + Math.round(prng() * 50),
          b: 155 + Math.round(prng() * 45),
        });
      }
    }

    return targets;
  }

  /**
   * Phase D Transition: Soft horizontal ribbon streaks between texts.
   * Multi-band with vertical dispersion, rich pink color (never solid white bar).
   */
  generateHorizontalRibbon(w: number, h: number): ParticleTarget[] {
    const prng = createPrng(this.seed + 303);
    const targets: ParticleTarget[] = [];
    const cy = h * 0.46;

    for (let i = 0; i < this.count; i++) {
      // 3 distinct horizontal ribbon bands with natural vertical spread
      const band = prng() < 0.45 ? 0 : prng() < 0.8 ? 1 : 2;
      let bandY = cy;
      if (band === 0) bandY = cy - 24 + (prng() - 0.5) * 16;
      else if (band === 1) bandY = cy + 18 + (prng() - 0.5) * 16;
      else bandY = cy + (prng() - 0.5) * 60;

      const bandX = w * 0.5 + (prng() - 0.5) * (w * 0.75);

      targets.push({
        x: bandX,
        y: bandY,
        z: (prng() - 0.5) * 15,
        alpha: 0.35 + prng() * 0.4,
        size: 0.9 + prng() * 1.1,
        r: 255,
        g: 65 + Math.round(prng() * 40),
        b: 145 + Math.round(prng() * 45),
      });
    }
    return targets;
  }

  /**
   * Phase E: Heart silhouette & volume before rose bloom.
   * 73% width, 30% height, smooth rounded lobes, clear cleft, natural bottom.
   */
  generateHeartSilhouette(w: number, h: number, scale = 1.0): ParticleTarget[] {
    const prng = createPrng(this.seed + 404);
    const targets: ParticleTarget[] = [];
    const cx = w * 0.5;
    const cy = h * 0.42;

    const baseScaleX = 7.8 * scale;
    const baseScaleY = 9.4 * scale;

    for (let i = 0; i < this.count; i++) {
      const t = prng() * Math.PI * 2;
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

      // 60% on perimeter, 40% interior stardust
      let fill = 1.0;
      if (prng() > 0.6) {
        fill = Math.sqrt(prng());
      }

      const x = cx + hx * baseScaleX * fill + (prng() - 0.5) * 6;
      const y = cy + hy * baseScaleY * fill + (prng() - 0.5) * 6;

      targets.push({
        x,
        y,
        z: (prng() - 0.5) * 20,
        alpha: 0.4 + prng() * 0.45,
        size: 0.9 + prng() * 1.2,
        r: 255,
        g: 60 + Math.round(prng() * 45),
        b: 140 + Math.round(prng() * 50),
      });
    }
    return targets;
  }

  /**
   * Phase G: Heart dispersion into expanding particle cloud.
   * Originates from the ENTIRE heart volume (center + body + edges).
   * ZERO HOLE IN THE CENTER. EXPANDS ACROSS ENTIRE VIEWPORT.
   */
  disperseBurst(w: number, h: number): ParticleTarget[] {
    const prng = createPrng(this.seed + 505);
    const targets: ParticleTarget[] = [];
    const cx = w * 0.5;
    const cy = h * 0.42;

    for (let i = 0; i < this.count; i++) {
      // Particles expand uniformly from center outwards (radius 0 to 280)
      const angle = prng() * Math.PI * 2;
      const radius = Math.pow(prng(), 0.75) * (w * 0.85);

      const x = cx + Math.cos(angle) * radius + (prng() - 0.5) * 30;
      const y = cy + Math.sin(angle) * radius * 1.15 + (prng() - 0.5) * 40;

      // 3D forward projection towards viewer
      const z = (prng() - 0.3) * 180;

      const normDist = radius / (w * 0.85);
      const alpha = Math.max(0.1, 0.75 - normDist * 0.45) * (0.6 + prng() * 0.4);

      targets.push({
        x,
        y,
        z,
        alpha,
        size: 0.9 + prng() * 1.5,
        r: 255,
        g: 70 + Math.round(prng() * 55),
        b: 150 + Math.round(prng() * 50),
      });
    }
    return targets;
  }

  generateCollapse(w: number, h: number): ParticleTarget[] {
    const prng = createPrng(this.seed + 150);
    const targets: ParticleTarget[] = [];
    const cx = w * 0.5;
    const cy = h * 0.46;

    for (let i = 0; i < this.count; i++) {
      const angle = prng() * Math.PI * 2;
      const rad = Math.pow(prng(), 1.5) * (w * 0.18);
      const x = cx + Math.cos(angle) * rad;
      const y = cy + Math.sin(angle) * rad * 0.9;

      targets.push({
        x,
        y,
        z: (prng() - 0.5) * 15,
        alpha: 0.7 + prng() * 0.3,
        size: 1.2 + prng() * 1.4,
        r: 255,
        g: 80 + Math.round(prng() * 50),
        b: 160 + Math.round(prng() * 50),
      });
    }
    return targets;
  }

  generateBearFieldStardust(w: number, h: number): ParticleTarget[] {
    const prng = createPrng(this.seed + 606);
    const targets: ParticleTarget[] = [];
    const cx = w * 0.5;
    const cy = h * 0.48;

    for (let i = 0; i < this.count; i++) {
      const angle = prng() * Math.PI * 2;
      const radDist = Math.pow(prng(), 0.60);
      const radX = (w * 0.58) * radDist;
      const radY = (h * 0.56) * radDist;

      const x = cx + Math.cos(angle) * radX;
      const y = cy + Math.sin(angle) * radY;

      const edgeFactorX = Math.sin(Math.max(0, Math.min(Math.PI, (x / w) * Math.PI)));
      const edgeFactorY = Math.sin(Math.max(0, Math.min(Math.PI, (y / h) * Math.PI)));
      const edgeWeight = Math.pow(edgeFactorX * edgeFactorY, 0.6);

      targets.push({
        x,
        y,
        z: (prng() - 0.5) * 60,
        alpha: (0.10 + prng() * 0.25) * edgeWeight,
        size: 0.8 + prng() * 1.2,
        r: 255,
        g: 90 + Math.round(prng() * 70),
        b: 165 + Math.round(prng() * 65),
      });
    }
    return targets;
  }

  // Morph targets with smooth interpolation
  morphTo(targets: ParticleTarget[], dispersion = 1.0) {
    const len = Math.min(this.count, targets.length);
    const prng = createPrng(this.seed + 808);

    for (let i = 0; i < len; i++) {
      const tg = targets[i];
      const dispX = (prng() - 0.5) * 3 * dispersion;
      const dispY = (prng() - 0.5) * 3 * dispersion;

      this.tx[i] = tg.x + dispX;
      this.ty[i] = tg.y + dispY;
      this.tz[i] = tg.z ?? 0;
      this.targetAlpha[i] = tg.alpha ?? 0.7;

      if (tg.size) this.size[i] = tg.size;
      if (tg.r !== undefined) this.tr[i] = tg.r;
      if (tg.g !== undefined) this.tg[i] = tg.g;
      if (tg.b !== undefined) this.tb[i] = tg.b;
    }
  }

  // Physics simulation step
  update(dt: number, speedMult = 1.0, motionMult = 1.0, time = 0) {
    const effectiveDt = Math.min(dt, 0.05) * speedMult;
    const ease = Math.min(1.0, effectiveDt * 4.2);

    for (let i = 0; i < this.count; i++) {
      const phase = this.wobblePhase[i] + time * this.wobbleSpeed[i];
      const wobbleX = Math.cos(phase) * this.wobbleRadius[i] * motionMult;
      const wobbleY = Math.sin(phase * 1.1) * this.wobbleRadius[i] * motionMult;

      const targetX = this.tx[i] + wobbleX;
      const targetY = this.ty[i] + wobbleY;
      const targetZ = this.tz[i];

      this.x[i] += (targetX - this.x[i]) * ease;
      this.y[i] += (targetY - this.y[i]) * ease;
      this.z[i] += (targetZ - this.z[i]) * ease;

      this.alpha[i] += (this.targetAlpha[i] - this.alpha[i]) * ease;
      this.r[i] += (this.tr[i] - this.r[i]) * ease;
      this.g[i] += (this.tg[i] - this.g[i]) * ease;
      this.b[i] += (this.tb[i] - this.b[i]) * ease;
    }
  }

  // High-performance batch render
  render(
    ctx: CanvasRenderingContext2D,
    _w: number,
    _h: number,
    globalOpacity = 1.0,
    glowMult = 0.35
  ) {
    if (globalOpacity <= 0.005) return;

    ctx.save();
    const sprite = this.glowSprite;

    // 1. Ethereal glow aura with screen blending (soft opacity, zero whiteout)
    if (sprite && glowMult > 0.05) {
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < this.count; i += 3) {
        const a = this.alpha[i] * globalOpacity;
        if (a <= 0.05) continue;

        const px = this.x[i];
        const py = this.y[i];
        const pz = this.z[i];
        const fov = 400;
        const zScale = Math.max(0.4, Math.min(2.0, fov / (fov + pz)));
        const finalSize = Math.max(0.7, this.size[i] * zScale);

        if (finalSize > 1.2) {
          ctx.globalAlpha = a * glowMult * 0.18;
          const sSize = finalSize * 3.2;
          ctx.drawImage(sprite, px - sSize * 0.5, py - sSize * 0.5, sSize, sSize);
        }
      }
    }

    // 2. Crisp colored particle cores with source-over (preserves vibrant pink colors)
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < this.count; i++) {
      const a = this.alpha[i] * globalOpacity;
      if (a <= 0.02) continue;

      const px = this.x[i];
      const py = this.y[i];
      const pz = this.z[i];
      const fov = 400;
      const zScale = Math.max(0.4, Math.min(2.0, fov / (fov + pz)));
      const finalSize = Math.max(0.5, this.size[i] * zScale);

      ctx.globalAlpha = a;
      ctx.fillStyle = `rgb(${Math.round(this.r[i])},${Math.round(this.g[i])},${Math.round(this.b[i])})`;
      ctx.beginPath();
      ctx.arc(px, py, finalSize * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
