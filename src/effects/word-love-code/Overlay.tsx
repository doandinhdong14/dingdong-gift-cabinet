import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { EffectProps } from '../../effect-sdk';
import type { WordLoveCodeConfig } from './config';

/**
 * 2D Point structure for ShapeShifter dots
 */
interface DotPoint {
  x: number;
  y: number;
  z: number;
  a: number;
  h: number;
}

class ShapeDot {
  p: DotPoint;
  e: number;
  s: boolean;
  t: DotPoint;
  q: DotPoint[];

  constructor(x: number, y: number, z: number = 4) {
    this.p = { x, y, z, a: 1, h: 0 };
    this.e = 0.07;
    this.s = true;
    this.t = { ...this.p };
    this.q = [];
  }

  distanceTo(n: { x: number; y: number }): [number, number, number] {
    const dx = this.p.x - n.x;
    const dy = this.p.y - n.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    return [dx, dy, d];
  }

  move(p: Partial<DotPoint>) {
    this.q.push({
      x: p.x !== undefined ? p.x : this.p.x,
      y: p.y !== undefined ? p.y : this.p.y,
      z: p.z !== undefined ? p.z : this.p.z,
      a: p.a !== undefined ? p.a : this.p.a,
      h: p.h !== undefined ? p.h : 0,
    });
  }

  update(): void {
    const details = this.distanceTo(this.t);
    const dx = details[0];
    const dy = details[1];
    const d = details[2];
    const e = this.e * d;

    let reached = false;
    if (this.p.h === -1) {
      this.p.x = this.t.x;
      this.p.y = this.t.y;
      reached = true;
    } else if (d > 1) {
      this.p.x -= (dx / d) * e;
      this.p.y -= (dy / d) * e;
    } else {
      if (this.p.h > 0) {
        this.p.h--;
      } else {
        reached = true;
      }
    }

    if (reached) {
      const nextP = this.q.shift();
      if (nextP) {
        this.t.x = nextP.x;
        this.t.y = nextP.y;
        this.t.z = nextP.z;
        this.t.a = nextP.a;
        this.p.h = nextP.h;
      } else {
        if (this.s) {
          this.p.x -= Math.sin(Math.random() * Math.PI);
          this.p.y -= Math.sin(Math.random() * Math.PI);
        } else {
          this.move({
            x: this.p.x + Math.random() * 50 - 25,
            y: this.p.y + Math.random() * 50 - 25,
          });
        }
      }
    }

    const da = this.p.a - this.t.a;
    this.p.a = Math.max(0.1, this.p.a - da * 0.05);
    const dz = this.p.z - this.t.z;
    this.p.z = Math.max(1, this.p.z - dz * 0.05);
  }

  draw(ctx: CanvasRenderingContext2D, baseColor: string): void {
    ctx.fillStyle = baseColor;
    ctx.globalAlpha = Math.max(0, Math.min(1, this.p.a));
    ctx.beginPath();
    ctx.arc(this.p.x, this.p.y, Math.max(0.5, this.p.z), 0, 2 * Math.PI, true);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

/**
 * Parametric heart particle for Pinkboard
 */
class HeartPoint {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  clone(): HeartPoint {
    return new HeartPoint(this.x, this.y);
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize(targetLength = 1): HeartPoint {
    const len = this.length();
    if (len > 0.0001) {
      this.x = (this.x / len) * targetLength;
      this.y = (this.y / len) * targetLength;
    }
    return this;
  }
}

class HeartParticle {
  position = new HeartPoint();
  velocity = new HeartPoint();
  acceleration = new HeartPoint();
  age = 0;

  initialize(x: number, y: number, dx: number, dy: number, effectAcc: number): void {
    this.position.x = x;
    this.position.y = y;
    this.velocity.x = dx;
    this.velocity.y = dy;
    this.acceleration.x = dx * effectAcc;
    this.acceleration.y = dy * effectAcc;
    this.age = 0;
  }

  update(deltaTime: number): void {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.velocity.x += this.acceleration.x * deltaTime;
    this.velocity.y += this.acceleration.y * deltaTime;
    this.age += deltaTime;
  }

  draw(ctx: CanvasRenderingContext2D, sprite: HTMLCanvasElement, duration: number): void {
    function ease(t: number) {
      const it = t - 1;
      return it * it * it + 1;
    }
    const size = sprite.width * ease(Math.min(1, this.age / duration));
    ctx.globalAlpha = Math.max(0, 1 - this.age / duration);
    ctx.drawImage(sprite, this.position.x - size / 2, this.position.y - size / 2, size, size);
    ctx.globalAlpha = 1;
  }
}

class HeartParticlePool {
  particles: HeartParticle[];
  firstActive = 0;
  firstFree = 0;
  duration: number;

  constructor(length: number, duration: number) {
    this.duration = duration;
    this.particles = new Array(length);
    for (let i = 0; i < length; i++) {
      this.particles[i] = new HeartParticle();
    }
  }

  add(x: number, y: number, dx: number, dy: number, effectAcc: number): void {
    this.particles[this.firstFree].initialize(x, y, dx, dy, effectAcc);
    this.firstFree++;
    if (this.firstFree === this.particles.length) this.firstFree = 0;
    if (this.firstActive === this.firstFree) this.firstActive++;
    if (this.firstActive === this.particles.length) this.firstActive = 0;
  }

  update(deltaTime: number): void {
    if (this.firstActive < this.firstFree) {
      for (let i = this.firstActive; i < this.firstFree; i++) {
        this.particles[i].update(deltaTime);
      }
    }
    if (this.firstFree < this.firstActive) {
      for (let i = this.firstActive; i < this.particles.length; i++) {
        this.particles[i].update(deltaTime);
      }
      for (let i = 0; i < this.firstFree; i++) {
        this.particles[i].update(deltaTime);
      }
    }
    while (this.particles[this.firstActive].age >= this.duration && this.firstActive !== this.firstFree) {
      this.firstActive++;
      if (this.firstActive === this.particles.length) this.firstActive = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D, sprite: HTMLCanvasElement): void {
    if (this.firstActive < this.firstFree) {
      for (let i = this.firstActive; i < this.firstFree; i++) {
        this.particles[i].draw(ctx, sprite, this.duration);
      }
    }
    if (this.firstFree < this.firstActive) {
      for (let i = this.firstActive; i < this.particles.length; i++) {
        this.particles[i].draw(ctx, sprite, this.duration);
      }
      for (let i = 0; i < this.firstFree; i++) {
        this.particles[i].draw(ctx, sprite, this.duration);
      }
    }
  }
}

export const Overlay: React.FC<EffectProps<WordLoveCodeConfig>> = ({
  config,
  runtime,
  emit,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const matrixCanvasRef = useRef<HTMLCanvasElement>(null);
  const morphCanvasRef = useRef<HTMLCanvasElement>(null);
  const heartCanvasRef = useRef<HTMLCanvasElement>(null);

  // Heart center namebox visibility
  const [showHeartStage, setShowHeartStage] = useState(false);

  // Heart particle sprite cache
  const heartSpriteRef = useRef<HTMLCanvasElement | null>(null);

  // References for animation loops & timers
  const animFrameIdRef = useRef<number | null>(null);
  const matrixTimerRef = useRef<number | null>(null);
  const sequenceTimerRef = useRef<number | null>(null);
  const autoReplayTimerRef = useRef<number | null>(null);

  // ShapeShifter Dots State
  const dotsRef = useRef<ShapeDot[]>([]);
  const shapeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Replay tracker
  const lastRunIdRef = useRef(runtime.runId);
  const hasEmittedCompleteRef = useRef(false);

  // Helper to get point on mathematical heart curve
  const getPointOnHeart = useCallback((t: number, scale: number = 1.0): HeartPoint => {
    const rawX = 160 * Math.pow(Math.sin(t), 3);
    const rawY = 130 * Math.cos(t) - 50 * Math.cos(2 * t) - 20 * Math.cos(3 * t) - 10 * Math.cos(4 * t) + 25;
    return new HeartPoint(rawX * scale, rawY * scale);
  }, []);

  // Pre-generate heart particle sprite
  useEffect(() => {
    const spriteSize = 30;
    const canvas = document.createElement('canvas');
    canvas.width = spriteSize;
    canvas.height = spriteSize;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const to = (t: number) => {
        const p = getPointOnHeart(t, 1.0);
        return {
          x: spriteSize / 2 + (p.x * spriteSize) / 350,
          y: spriteSize / 2 - (p.y * spriteSize) / 350,
        };
      };

      ctx.beginPath();
      let t = -Math.PI;
      const startP = to(t);
      ctx.moveTo(startP.x, startP.y);
      while (t < Math.PI) {
        t += 0.01;
        const pt = to(t);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();
      ctx.fillStyle = config.heartColor || '#ff30c5';
      ctx.fill();
    }
    heartSpriteRef.current = canvas;
  }, [config.heartColor, getPointOnHeart]);

  // Main Effect Sequence and Canvas Setup
  useEffect(() => {
    const container = containerRef.current;
    const matrixCanvas = matrixCanvasRef.current;
    const morphCanvas = morphCanvasRef.current;
    const heartCanvas = heartCanvasRef.current;
    if (!container || !matrixCanvas || !morphCanvas || !heartCanvas) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    const resizeCanvases = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;

      matrixCanvas.width = width;
      matrixCanvas.height = height;

      morphCanvas.width = width;
      morphCanvas.height = height;

      heartCanvas.width = width;
      heartCanvas.height = height;
    };

    resizeCanvases();
    window.addEventListener('resize', resizeCanvases);

    // 1. Matrix Digital Rain Initialization
    const matrixCtx = matrixCanvas.getContext('2d');
    const fontSize = config.matrixFontSize || 11;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = Array.from({ length: columns }, () => 1);

    const letters = (config.matrixText || 'I LOVE UI LOVE UI LOVE UI LOVE UI LOVE U ❤').split('');

    const drawMatrix = () => {
      if (!matrixCtx || !config.enableMatrix || runtime.isPaused) return;

      matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

      matrixCtx.fillStyle = config.matrixColor || '#ff5ba5';
      matrixCtx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)] || '❤';
        matrixCtx.fillText(text, i * fontSize, drops[i] * fontSize);

        drops[i]++;
        if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.95) {
          drops[i] = 0;
        }
      }
    };

    const matrixInterval = window.setInterval(drawMatrix, Math.max(15, config.matrixSpeed || 33));
    matrixTimerRef.current = matrixInterval;

    // 2. Shape Shifter Setup
    if (!shapeCanvasRef.current) {
      shapeCanvasRef.current = document.createElement('canvas');
    }
    const offCanvas = shapeCanvasRef.current;
    const offCtx = offCanvas.getContext('2d');
    const gap = Math.max(8, config.dotGap || 13);

    const rasterizeLetter = (letter: string) => {
      if (!offCtx) return { dots: [] as { x: number; y: number }[], w: 0, h: 0 };
      offCanvas.width = Math.floor(width / gap) * gap;
      offCanvas.height = Math.floor(height / gap) * gap;

      const baseFontSize = Math.min(offCanvas.height * 0.45, 450);
      offCtx.font = `bold ${baseFontSize}px Avenir, 'Helvetica Neue', Helvetica, Arial, sans-serif`;
      offCtx.fillStyle = 'red';
      offCtx.textBaseline = 'middle';
      offCtx.textAlign = 'center';

      const measured = offCtx.measureText(letter).width || 1;
      const s = Math.min(
        baseFontSize,
        (offCanvas.width / measured) * 0.78 * baseFontSize,
        (offCanvas.height / baseFontSize) * 0.45 * baseFontSize
      );
      offCtx.font = `bold ${Math.max(16, s)}px Avenir, 'Helvetica Neue', Helvetica, Arial, sans-serif`;
      offCtx.clearRect(0, 0, offCanvas.width, offCanvas.height);
      offCtx.fillText(letter, offCanvas.width / 2, offCanvas.height / 2);

      const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height).data;
      const targetDots: { x: number; y: number }[] = [];
      let minX = offCanvas.width;
      let maxX = 0;
      let minY = offCanvas.height;
      let maxY = 0;

      for (let y = 0; y < offCanvas.height; y += gap) {
        for (let x = 0; x < offCanvas.width; x += gap) {
          const idx = (y * offCanvas.width + x) * 4;
          if (imgData[idx + 3] > 64) {
            targetDots.push({ x, y });
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      return {
        dots: targetDots,
        w: Math.max(0, maxX - minX),
        h: Math.max(0, maxY - minY),
      };
    };

    const switchShapeToLetter = (letter: string, fast = false) => {
      const shape = rasterizeLetter(letter);
      const dots = dotsRef.current;

      if (shape.dots.length > dots.length) {
        const diff = shape.dots.length - dots.length;
        for (let i = 0; i < diff; i++) {
          dots.push(new ShapeDot(width / 2, height / 2, config.dotSize || 4));
        }
      }

      let d = 0;
      const remainingTargets = [...shape.dots];
      while (remainingTargets.length > 0 && d < dots.length) {
        const randIdx = Math.floor(Math.random() * remainingTargets.length);
        const target = remainingTargets.splice(randIdx, 1)[0];

        dots[d].e = fast ? 0.25 : dots[d].s ? 0.14 : 0.11;
        if (dots[d].s) {
          dots[d].move({
            z: Math.random() * 8 + 4,
            a: Math.random() * 0.8 + 0.2,
            h: 18,
          });
        }
        dots[d].s = true;
        dots[d].move({
          x: target.x - (offCanvas.width / 2 - width / 2),
          y: target.y - (offCanvas.height / 2 - height / 2),
          a: 1,
          z: config.dotSize || 4,
          h: 0,
        });
        d++;
      }

      for (let i = d; i < dots.length; i++) {
        if (dots[i].s) {
          dots[i].s = false;
          dots[i].e = 0.04;
          dots[i].move({
            x: Math.random() * width,
            y: Math.random() * height,
            a: 0.2,
            z: Math.random() * 3 + 1,
            h: 0,
          });
        }
      }
    };

    const scatterAllDots = () => {
      const dots = dotsRef.current;
      for (let i = 0; i < dots.length; i++) {
        dots[i].s = false;
        dots[i].e = 0.05;
        dots[i].move({
          x: Math.random() * width,
          y: Math.random() * height,
          a: 0.15,
          z: Math.random() * 2 + 1,
          h: 0,
        });
      }
    };

    // 3. Heart Particle Fountain Initialization
    const heartCtx = heartCanvas.getContext('2d');
    const heartDuration = 2.0;
    const heartPool = new HeartParticlePool(config.heartParticleCount || 500, heartDuration);
    const particleRate = (config.heartParticleCount || 500) / heartDuration;
    let lastTime = performance.now() / 1000;

    let isHeartActive = false;

    // Timeline Sequence Execution
    const startSequence = () => {
      setShowHeartStage(false);
      isHeartActive = false;
      dotsRef.current = [];

      // Build sequence: Countdown (if > 0) + Words
      const seq: { label: string; duration: number }[] = [];
      const countdown = Math.round(config.countdownStart || 3);
      for (let c = countdown; c >= 1; c--) {
        seq.push({ label: String(c), duration: 1000 });
      }

      const rawWords = (config.wordSequence || 'You|Are|My|Love')
        .split('|')
        .map((w) => w.trim())
        .filter((w) => w.length > 0);

      const wordTimeMs = Math.round((config.wordDuration || 2.0) * 1000);
      for (const word of rawWords) {
        seq.push({ label: word, duration: wordTimeMs });
      }

      let step = 0;
      const advanceStep = () => {
        if (step < seq.length) {
          const item = seq[step];
          switchShapeToLetter(item.label, step < countdown);
          step++;
          sequenceTimerRef.current = window.setTimeout(advanceStep, item.duration);
        } else {
          // Reached the end of words: Scatter dots & activate Heart Stage!
          scatterAllDots();
          isHeartActive = true;
          setShowHeartStage(true);

          if (!hasEmittedCompleteRef.current) {
            hasEmittedCompleteRef.current = true;
            emit({ type: 'complete', runId: runtime.runId });
          }

          if (config.autoReplay) {
            autoReplayTimerRef.current = window.setTimeout(() => {
              startSequence();
            }, 7000);
          }
        }
      };

      advanceStep();
    };

    startSequence();

    // 4. Unified Animation Frame Loop
    const morphCtx = morphCanvas.getContext('2d');

    const renderLoop = () => {
      const now = performance.now() / 1000;
      const deltaTime = Math.min(0.1, now - lastTime);
      lastTime = now;

      if (!runtime.isPaused) {
        // Render ShapeShifter Morph Dots
        if (morphCtx) {
          morphCtx.clearRect(0, 0, morphCanvas.width, morphCanvas.height);
          const dots = dotsRef.current;
          for (let i = 0; i < dots.length; i++) {
            dots[i].update();
            dots[i].draw(morphCtx, config.dotColor || '#ffffff');
          }
        }

        // Render Pinkboard Heart Particles
        if (heartCtx) {
          heartCtx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);

          if (isHeartActive && heartSpriteRef.current) {
            const amount = particleRate * deltaTime;
            const hScale = config.heartScale || 1.0;

            for (let i = 0; i < amount; i++) {
              const pos = getPointOnHeart(Math.PI - 2 * Math.PI * Math.random(), hScale);
              const dir = pos.clone().normalize(100);
              heartPool.add(
                heartCanvas.width / 2 + pos.x,
                heartCanvas.height / 2 - pos.y,
                dir.x,
                -dir.y,
                -0.75
              );
            }

            heartPool.update(deltaTime);
            heartPool.draw(heartCtx, heartSpriteRef.current);
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('resize', resizeCanvases);
      if (matrixTimerRef.current) clearInterval(matrixTimerRef.current);
      if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current);
      if (autoReplayTimerRef.current) clearTimeout(autoReplayTimerRef.current);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [
    config,
    runtime.isPaused,
    runtime.runId,
    emit,
    getPointOnHeart,
  ]);

  // Handle runId change from Host toolbar (Replay button)
  useEffect(() => {
    if (runtime.runId !== lastRunIdRef.current) {
      lastRunIdRef.current = runtime.runId;
      hasEmittedCompleteRef.current = false;
      setShowHeartStage(false);
    }
  }, [runtime.runId]);

  return (
    <div
      ref={containerRef}
      className="word-love-code-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '480px',
        overflow: 'hidden',
        backgroundColor: config.backgroundColor || '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* 1. Matrix Digital Rain Canvas */}
      <canvas
        ref={matrixCanvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          display: config.enableMatrix ? 'block' : 'none',
        }}
      />

      {/* 2. Shape Shifter Morphing Letters Canvas */}
      <canvas
        ref={morphCanvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
        }}
      />

      {/* 3. Pinkboard Beating Particle Heart Canvas */}
      <canvas
        ref={heartCanvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 3,
          pointerEvents: 'none',
        }}
      />

      {/* 4. Center Glowing Message Container (.namebox) */}
      <div
        className="namebox"
        style={{
          position: 'absolute',
          zIndex: 4,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          opacity: showHeartStage ? 1 : 0,
          transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          whiteSpace: 'nowrap',
          maxWidth: '90%',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: "'Comic Sans MS', cursive, sans-serif",
            fontSize: `${config.centerFontSize || 34}px`,
            color: config.centerTextColor || '#ff5ba5',
            textShadow: `0 0 12px ${config.centerTextColor || '#ff5ba5'}, 0 0 24px rgba(255, 91, 165, 0.45)`,
            letterSpacing: '0.5px',
          }}
        >
          {config.centerText || 'Wuv U❤️Bao Bao'}
        </h1>
      </div>
    </div>
  );
};
