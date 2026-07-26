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
