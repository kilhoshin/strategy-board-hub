'use client';

import { useEffect, useRef } from 'react';

interface Stone {
  gx: number;
  gy: number;
  color: 0 | 1;
  born: number;
  life: number;
}

/**
 * A slow, self-playing ghost game behind the hero: a drifting lattice with
 * stones that settle, breathe and fade. Purely decorative — it is aria-hidden
 * and freezes entirely under prefers-reduced-motion.
 */
export function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let width = 0;
    let height = 0;
    let cell = 0;
    let cols = 0;
    let rows = 0;

    const stones: Stone[] = [];
    const occupied = new Set<string>();
    let nextDrop = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = Math.max(34, Math.min(64, width / 22));
      cols = Math.ceil(width / cell) + 2;
      rows = Math.ceil(height / cell) + 2;
    };

    const drawGrid = (t: number) => {
      const drift = reduced ? 0 : Math.sin(t / 9000) * 8;
      ctx.lineWidth = 1;
      for (let i = 0; i < cols; i++) {
        const x = i * cell + drift;
        const fade = 0.055 * (1 - Math.abs(x - width / 2) / (width * 0.9));
        ctx.strokeStyle = `rgba(232,194,116,${Math.max(0.012, fade)})`;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let j = 0; j < rows; j++) {
        const y = j * cell - drift;
        const fade = 0.055 * (1 - Math.abs(y - height / 2) / (height * 1.4));
        ctx.strokeStyle = `rgba(232,194,116,${Math.max(0.012, fade)})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    const drawStone = (s: Stone, t: number) => {
      const age = t - s.born;
      const inT = Math.min(1, age / 620);
      const outT = Math.max(0, 1 - Math.max(0, age - s.life) / 1600);
      const alpha = Math.min(inT, outT);
      if (alpha <= 0) return false;

      const drift = reduced ? 0 : Math.sin(t / 9000) * 8;
      const x = s.gx * cell + drift;
      const y = s.gy * cell - drift;
      const r = cell * 0.4 * (0.72 + 0.28 * inT);

      ctx.save();
      ctx.globalAlpha = alpha * 0.9;

      const grad = ctx.createRadialGradient(x - r * 0.34, y - r * 0.36, r * 0.1, x, y, r);
      if (s.color === 0) {
        grad.addColorStop(0, '#6e7683');
        grad.addColorStop(0.36, '#232830');
        grad.addColorStop(1, '#05070a');
      } else {
        grad.addColorStop(0, '#fffdf7');
        grad.addColorStop(0.42, '#efe9dc');
        grad.addColorStop(1, '#b6ac98');
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = alpha * 0.45;
      ctx.strokeStyle = 'rgba(232,194,116,0.5)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();
      return true;
    };

    const frame = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      drawGrid(t);

      if (!reduced && t > nextDrop && stones.length < 46) {
        nextDrop = t + 260 + Math.random() * 520;
        for (let tries = 0; tries < 12; tries++) {
          const gx = 1 + Math.floor(Math.random() * (cols - 2));
          const gy = 1 + Math.floor(Math.random() * (rows - 2));
          const key = `${gx}:${gy}`;
          if (occupied.has(key)) continue;
          occupied.add(key);
          stones.push({
            gx,
            gy,
            color: (stones.length % 2) as 0 | 1,
            born: t,
            life: 5200 + Math.random() * 7000,
          });
          break;
        }
      }

      for (let i = stones.length - 1; i >= 0; i--) {
        if (!drawStone(stones[i], t)) {
          occupied.delete(`${stones[i].gx}:${stones[i].gy}`);
          stones.splice(i, 1);
        }
      }

      raf = requestAnimationFrame(frame);
    };

    resize();
    if (reduced) {
      // One static frame: the lattice alone, no animation loop.
      ctx.clearRect(0, 0, width, height);
      drawGrid(0);
    } else {
      raf = requestAnimationFrame(frame);
    }

    const onResize = () => {
      resize();
      stones.length = 0;
      occupied.clear();
      if (reduced) drawGrid(0);
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
