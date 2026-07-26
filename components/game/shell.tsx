'use client';

import { Link } from '@/components/site/Link';
import type { ReactNode } from 'react';
import type { Level, Outcome, Side } from '@/lib/games/types';
import type { Dictionary } from '@/lib/i18n/types';

/* ------------------------------- board frame ------------------------------ */

export function BoardFrame({
  children,
  aspect = '1 / 1',
  tone = 'wood',
  maxWidth = 620,
}: {
  children: ReactNode;
  aspect?: string;
  tone?: 'wood' | 'slate' | 'felt';
  maxWidth?: number;
}) {
  const toneClass =
    tone === 'slate' ? 'board-slate' : tone === 'felt' ? 'board-felt' : 'board-wood';
  return (
    <div className="mx-auto w-full" style={{ maxWidth }}>
      {/* An inline-size container so piece glyphs can be sized in `cqw`, i.e.
          relative to the board rather than to the inherited font size. */}
      <div
        className={`relative w-full rounded-[14px] ${toneClass}`}
        style={{ aspectRatio: aspect, containerType: 'inline-size' }}
      >
        {children}
      </div>
    </div>
  );
}

/* -------------------------------- controls -------------------------------- */

export function LevelPicker({
  dict,
  level,
  onChange,
  disabled,
}: {
  dict: Dictionary;
  level: Level;
  onChange: (l: Level) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <div className="eyebrow mb-2">{dict.game.difficulty}</div>
      <div className="grid grid-cols-4 gap-1 rounded-full border border-[var(--hairline)] bg-[var(--surface)] p-1">
        {([1, 2, 3, 4] as Level[]).map((l) => (
          <button
            key={l}
            type="button"
            disabled={disabled}
            onClick={() => onChange(l)}
            title={dict.game.levelHints[l - 1]}
            className={`rounded-full px-2 py-1.5 text-xs font-semibold transition-all duration-300 ${
              level === l
                ? 'bg-[linear-gradient(180deg,var(--color-gold-400),var(--color-gold-600))] text-[#241a08] shadow-[0_6px_18px_-8px_rgba(211,163,75,0.9)]'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
            }`}
          >
            {dict.game.levels[l - 1]}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[0.7rem] leading-relaxed text-[var(--fg-muted)]">
        {dict.game.levelHints[level - 1]}
      </p>
    </div>
  );
}

/** Pill-style radio group used for the presentation options. */
export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <div className="eyebrow mb-2">{label}</div>
      <div
        role="radiogroup"
        aria-label={label}
        className="grid gap-1 rounded-full border border-[var(--hairline)] bg-[var(--surface)] p-1"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            onClick={() => onChange(option.value)}
            className={`truncate rounded-full px-2 py-1.5 text-xs font-semibold transition-all duration-300 ${
              value === option.value
                ? 'bg-[var(--surface-strong)] text-[var(--fg)] shadow-inner'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SidePicker({
  dict,
  mySide,
  onChange,
  firstLabel,
  secondLabel,
}: {
  dict: Dictionary;
  mySide: Side;
  onChange: (s: Side) => void;
  firstLabel: string;
  secondLabel: string;
}) {
  return (
    <div>
      <div className="eyebrow mb-2">{dict.game.yourSide}</div>
      <div className="grid grid-cols-2 gap-1 rounded-full border border-[var(--hairline)] bg-[var(--surface)] p-1">
        {([1, 2] as Side[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={`rounded-full px-2 py-1.5 text-xs font-semibold transition-all duration-300 ${
              mySide === s
                ? 'bg-[var(--surface-strong)] text-[var(--fg)] shadow-inner'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
            }`}
          >
            {s === 1 ? firstLabel : secondLabel}
          </button>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- hints ---------------------------------- */

export interface HintController {
  hintsEnabled: boolean;
  setHintsEnabled: (on: boolean) => void;
  hintLoading: boolean;
  hintEmpty: boolean;
  requestHint: () => void;
  clearHint: () => void;
  canHint: boolean;
}

/**
 * On-demand advice panel. The suggestion comes from the same bounded search
 * that plays the opponent, so the disclaimer is not boilerplate — it is the
 * literal truth about how good this advice is.
 */
export function HintPanel({
  dict,
  controller,
  /** Human-readable notation for the current suggestion, if there is one. */
  moveLabel,
}: {
  dict: Dictionary;
  controller: HintController;
  moveLabel?: string | null;
}) {
  const h = dict.game.hints;
  const { hintsEnabled, setHintsEnabled, hintLoading, hintEmpty, canHint } = controller;

  return (
    <section className="panel overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 pt-4">
        <h3 className="eyebrow !text-[var(--accent)]">{h.title}</h3>
        <button
          type="button"
          role="switch"
          aria-checked={hintsEnabled}
          aria-label={h.enable}
          onClick={() => setHintsEnabled(!hintsEnabled)}
          className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-300 ${
            hintsEnabled
              ? 'border-transparent bg-[linear-gradient(180deg,var(--color-gold-400),var(--color-gold-600))]'
              : 'border-[var(--hairline-strong)] bg-[var(--surface)]'
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full shadow-md transition-transform duration-300 ${
              hintsEnabled
                ? 'translate-x-[1.375rem] bg-[#2a1e08]'
                : 'translate-x-0.5 bg-[var(--fg-muted)]'
            }`}
          />
        </button>
      </div>

      {!hintsEnabled ? (
        <p className="px-4 pb-4 pt-3 text-[0.7rem] leading-relaxed text-[var(--fg-muted)]">
          {h.offNote}
        </p>
      ) : (
        <div className="px-4 pb-4 pt-3">
          <button
            type="button"
            onClick={controller.requestHint}
            disabled={!canHint}
            className="btn btn-primary w-full !py-3 text-sm"
          >
            {hintLoading ? (
              <>
                <span className="thinking-bar relative h-[2px] w-10 overflow-hidden rounded-full bg-black/25" />
                {h.thinking}
              </>
            ) : (
              <>
                <span aria-hidden="true">✦</span>
                {h.show}
              </>
            )}
          </button>

          {moveLabel && (
            <div className="mt-3 rounded-xl border border-[rgba(232,194,116,0.35)] bg-[var(--accent-soft)] p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[0.65rem] uppercase tracking-[0.18em] text-[var(--fg-muted)]">
                  {h.suggestion}
                </span>
                <button
                  type="button"
                  onClick={controller.clearHint}
                  className="text-[0.7rem] text-[var(--fg-muted)] underline underline-offset-2 transition-colors hover:text-[var(--fg)]"
                >
                  {h.hide}
                </button>
              </div>
              <p className="display mt-1 text-2xl text-[var(--accent)]">{moveLabel}</p>
            </div>
          )}

          {hintEmpty && (
            <p className="mt-3 text-xs text-[var(--fg-muted)]">{h.none}</p>
          )}

          <p className="mt-3 flex gap-2 text-[0.7rem] leading-relaxed text-[var(--fg-muted)]">
            <span aria-hidden="true" className="shrink-0 opacity-70">
              ⚠
            </span>
            <span>{h.disclaimer}</span>
          </p>
        </div>
      )}
    </section>
  );
}

/**
 * The suggestion drawn on the board itself: a pulsing ring on the destination,
 * a fainter one on the origin, and an arrow between them. Coordinates are
 * percentages of the board's inner area; `ratio` is its width / height so the
 * arrowhead stays square on non-square boards.
 */
export function HintMarks({
  from,
  to,
  ratio = 1,
  label,
}: {
  from?: [number, number] | null;
  to: [number, number];
  ratio?: number;
  label?: string;
}) {
  const w = 100 * ratio;
  const tx = to[0] * ratio;
  const ty = to[1];

  let shaft: { x1: number; y1: number; x2: number; y2: number; angle: number } | null = null;
  if (from) {
    const fx = from[0] * ratio;
    const fy = from[1];
    const dx = tx - fx;
    const dy = ty - fy;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    // Pull both ends clear of the rings.
    const pad = Math.min(3.4, len / 3);
    shaft = {
      x1: fx + ux * pad,
      y1: fy + uy * pad,
      x2: tx - ux * pad * 1.6,
      y2: ty - uy * pad * 1.6,
      angle: (Math.atan2(dy, dx) * 180) / Math.PI,
    };
  }

  return (
    <svg
      viewBox={`0 0 ${w} 100`}
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      aria-label={label}
      role="img"
    >
      <defs>
        <filter id="hint-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter="url(#hint-glow)">
        {shaft && (
          <>
            <circle
              cx={from![0] * ratio}
              cy={from![1]}
              r="3.1"
              fill="none"
              stroke="#f5d99b"
              strokeWidth="0.9"
              strokeDasharray="1.6 1.2"
              opacity="0.85"
            />
            <line
              x1={shaft.x1}
              y1={shaft.y1}
              x2={shaft.x2}
              y2={shaft.y2}
              stroke="#f5d99b"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.95"
            />
            <polygon
              points="0,-2.1 4.2,0 0,2.1"
              fill="#f5d99b"
              transform={`translate(${tx} ${ty}) rotate(${shaft.angle}) translate(-4.4 0)`}
            />
          </>
        )}

        <circle cx={tx} cy={ty} r="4" fill="none" stroke="#f5d99b" strokeWidth="1.6">
          <animate attributeName="r" values="4;5.2;4" dur="1.6s" repeatCount="indefinite" />
          <animate
            attributeName="opacity"
            values="1;0.45;1"
            dur="1.6s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx={tx} cy={ty} r="1.1" fill="#f5d99b" opacity="0.9" />
      </g>
    </svg>
  );
}

/* ------------------------------- status bar ------------------------------- */

export function StatusBar({
  dict,
  thinking,
  myTurn,
  result,
  extra,
}: {
  dict: Dictionary;
  thinking: boolean;
  myTurn: boolean;
  result: Outcome;
  extra?: ReactNode;
}) {
  const label = result.over
    ? (result.reason && dict.game.reasons[result.reason]) || ''
    : thinking
      ? dict.game.thinking
      : myTurn
        ? dict.game.yourTurn
        : dict.game.aiTurn;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span
        className={`relative inline-flex h-2 w-2 shrink-0 rounded-full transition-colors ${
          result.over
            ? 'bg-[var(--fg-muted)]'
            : myTurn
              ? 'bg-[var(--color-jade-400)]'
              : 'bg-[var(--color-gold-400)]'
        }`}
      >
        {!result.over && (
          <span
            className={`absolute inset-0 animate-ping rounded-full ${
              myTurn ? 'bg-[var(--color-jade-400)]' : 'bg-[var(--color-gold-400)]'
            } opacity-60`}
          />
        )}
      </span>
      <span className="text-sm font-semibold">{label}</span>
      {extra}
      {thinking && (
        <span className="thinking-bar relative ml-auto h-[2px] w-24 overflow-hidden rounded-full bg-[var(--hairline)]" />
      )}
    </div>
  );
}

/* ----------------------------- result overlay ----------------------------- */

export function ResultOverlay({
  dict,
  result,
  mySide,
  onReset,
  otherGamesHref,
  detail,
}: {
  dict: Dictionary;
  result: Outcome;
  mySide: Side;
  onReset: () => void;
  otherGamesHref: string;
  detail?: string;
}) {
  if (!result.over) return null;
  const won = result.winner === mySide;
  const drew = result.winner === 0;
  const headline = drew ? dict.game.draw : won ? dict.game.youWin : dict.game.youLose;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[14px] bg-black/62 p-6 backdrop-blur-sm">
      <div className="panel w-full max-w-xs p-6 text-center shadow-[var(--shadow-lift)]">
        <div
          className={`display text-4xl ${
            drew ? 'text-[var(--fg)]' : won ? 'gold-text' : 'text-[var(--color-vermilion-400)]'
          }`}
        >
          {headline}
        </div>
        {result.reason && dict.game.reasons[result.reason] && (
          <p className="mt-2 text-xs text-[var(--fg-muted)]">{dict.game.reasons[result.reason]}</p>
        )}
        {detail && <p className="mt-1 text-sm font-semibold">{detail}</p>}
        <div className="mt-5 flex flex-col gap-2">
          <button type="button" className="btn btn-primary" onClick={onReset}>
            {dict.game.playAgain}
          </button>
          <Link href={otherGamesHref} className="btn">
            {dict.game.tryAnother}
          </Link>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- side panel ------------------------------ */

export function Panel({
  title,
  children,
  className = '',
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel p-4 ${className}`}>
      <h3 className="eyebrow mb-3">{title}</h3>
      {children}
    </section>
  );
}

export function MoveLog({ entries, title }: { entries: string[]; title: string }) {
  return (
    <Panel title={title}>
      <ol className="thin-scroll max-h-44 space-y-0.5 overflow-y-auto pr-1 text-xs tabular-nums">
        {entries.length === 0 && <li className="text-[var(--fg-muted)] opacity-60">—</li>}
        {entries.map((entry, i) => (
          <li key={i} className="flex gap-2">
            <span className="w-6 shrink-0 text-right text-[var(--fg-muted)] opacity-60">
              {i + 1}
            </span>
            <span>{entry}</span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

/* ------------------------------- layout ---------------------------------- */

export function GameLayout({
  board,
  sidebar,
  status,
  controls,
}: {
  board: ReactNode;
  sidebar: ReactNode;
  status: ReactNode;
  controls: ReactNode;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        <div className="panel mb-4 px-4 py-3">{status}</div>
        {board}
      </div>
      <aside className="flex flex-col gap-4">
        <section className="panel space-y-5 p-4">{controls}</section>
        {sidebar}
      </aside>
    </div>
  );
}
