'use client';

import { Link } from './Link';
import { useRef } from 'react';
import type { GameId } from '@/lib/games/types';
import { BoardPreview } from './BoardPreview';

interface Props {
  game: GameId;
  href: string;
  name: string;
  aka: string;
  blurb: string;
  cta: string;
  index: number;
}

/** Hub card: a tilting board vignette that lights up under the cursor. */
export function GameCard({ game, href, name, aka, blurb, cta, index }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = node.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    node.style.setProperty('--mx', `${px * 100}%`);
    node.style.setProperty('--my', `${py * 100}%`);
    node.style.setProperty('--rx', `${(0.5 - py) * 7}deg`);
    node.style.setProperty('--ry', `${(px - 0.5) * 9}deg`);
  };

  const reset = () => {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty('--rx', '0deg');
    node.style.setProperty('--ry', '0deg');
  };

  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className="frame group relative block overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[linear-gradient(180deg,var(--surface-strong),var(--surface))] p-5 transition-[transform,box-shadow] duration-500 [transform-style:preserve-3d] hover:shadow-[var(--shadow-lift)] sm:p-6"
      style={{
        transform: 'perspective(1100px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))',
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(340px circle at var(--mx,50%) var(--my,50%), rgba(232,194,116,0.14), transparent 65%)',
        }}
      />

      <div className="flex items-start gap-5">
        <div className="relative w-24 shrink-0 sm:w-28">
          <div className="absolute inset-0 -z-10 translate-y-2 rounded-xl bg-black/40 blur-lg" />
          <div className="aspect-square overflow-hidden rounded-xl shadow-[0_16px_36px_-18px_rgba(0,0,0,0.9)] ring-1 ring-black/30 transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[-2deg]">
            <BoardPreview game={game} id={`prev-${game}-${index}`} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="display text-2xl font-normal tracking-tight text-[var(--fg)]">{name}</h3>
            <span className="chip !border-transparent !bg-transparent !px-0 !text-[0.65rem] normal-case tracking-normal">
              {aka}
            </span>
          </div>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--fg-muted)]">{blurb}</p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)]">
            {cta}
            <span
              aria-hidden="true"
              className="transition-transform duration-500 group-hover:translate-x-1.5"
            >
              →
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
