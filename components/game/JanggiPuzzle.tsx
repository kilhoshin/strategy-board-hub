'use client';

import { useEffect, useMemo, useState } from 'react';
import * as j from '@/lib/games/janggi';
import type { Dictionary } from '@/lib/i18n/types';
import type { JanggiPuzzle as JanggiPuzzleData } from '@/lib/puzzles/types';
import { JANGGI_PUZZLES } from '@/lib/puzzles/janggi';
import {
  JanggiChip,
  JanggiPiece,
  PIECE_KEY,
  PIECE_ORDER,
  SIZE,
  type ColorScheme,
  type PieceStyle,
} from './JanggiPiece';
import { BoardFrame, GameLayout, HintMarks, Panel, SegmentedControl } from './shell';
import { usePuzzle } from './usePuzzle';

const COLS = 9;
const ROWS = 10;
const px = (c: number) => (100 * (c + 0.5)) / COLS;
const py = (r: number) => (100 * (r + 0.5)) / ROWS;
const BOARD_RATIO = 0.88;

const STYLE_KEY = 'sbh-janggi-style';
const COLOR_KEY = 'sbh-janggi-colors';

export function JanggiPuzzle({ dict }: { dict: Dictionary }) {
  const [from, setFrom] = useState<number | null>(null);
  const [style, setStyle] = useState<PieceStyle>(dict.game.defaultPieceStyle);
  const [scheme, setScheme] = useState<ColorScheme>('traditional');

  useEffect(() => {
    try {
      const s = window.localStorage.getItem(STYLE_KEY);
      if (s === 'hanja' || s === 'icon' || s === 'letter') setStyle(s);
      const c = window.localStorage.getItem(COLOR_KEY);
      if (c === 'traditional' || c === 'mono') setScheme(c);
    } catch {
      /* private mode — keep the locale default */
    }
  }, []);

  const chooseStyle = (next: PieceStyle) => {
    setStyle(next);
    try {
      window.localStorage.setItem(STYLE_KEY, next);
    } catch {
      /* nothing to persist to */
    }
  };
  const chooseScheme = (next: ColorScheme) => {
    setScheme(next);
    try {
      window.localStorage.setItem(COLOR_KEY, next);
    } catch {
      /* nothing to persist to */
    }
  };

  const game = usePuzzle<j.JanggiState, j.JanggiMove, JanggiPuzzleData>({
    puzzles: JANGGI_PUZZLES,
    base: () => j.initial(),
    apply: j.apply,
    outcome: j.outcome,
    turn: (s) => s.turn,
    movesEqual: (a, b) => a.from === b.from && a.to === b.to,
  });

  const { state, myTurn, puzzle } = game;
  const mySide = puzzle.sideToMove;
  const flip = mySide === 2;
  const legal = useMemo(() => (myTurn ? j.legalMoves(state) : []), [state, myTurn]);
  const movable = useMemo(
    () => new Set(legal.filter((m) => m.from >= 0).map((m) => m.from)),
    [legal],
  );
  const targets = useMemo(
    () => new Set(legal.filter((m) => m.from === from).map((m) => m.to)),
    [legal, from],
  );
  const blockers = useMemo(
    () => (from === null ? new Set<number>() : new Set(j.blockedLegs(state.board, from))),
    [state.board, from],
  );

  const onPoint = (i: number) => {
    if (!myTurn) return;
    if (from !== null && targets.has(i)) {
      game.play({ from, to: i });
      setFrom(null);
      return;
    }
    setFrom(movable.has(i) ? i : null);
  };

  const order = (i: number) => (flip ? ROWS * COLS - 1 - i : i);
  const cells = Array.from({ length: ROWS * COLS }, (_, k) => order(k));

  const at = (i: number): [number, number] => {
    const slot = order(i);
    return [px(slot % COLS), py(Math.floor(slot / COLS))];
  };

  const p = dict.puzzle;
  const statusLabel =
    game.status === 'solved' ? p.solved : game.status === 'wrong' ? p.incorrect : p.prompt;

  return (
    <GameLayout
      status={
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`relative inline-flex h-2 w-2 shrink-0 rounded-full ${
              game.status === 'solved'
                ? 'bg-[var(--color-jade-400)]'
                : game.status === 'wrong'
                  ? 'bg-[var(--color-vermilion-500)]'
                  : 'bg-[var(--color-gold-400)]'
            }`}
          />
          <span className="text-sm font-semibold">{statusLabel}</span>
          <span className="chip">{p.tierLabel[puzzle.tier - 1]}</span>
          <span className="ml-auto text-xs text-[var(--fg-muted)]">
            {p.progress} {game.index + 1} / {game.total}
          </span>
        </div>
      }
      board={
        <BoardFrame aspect="9 / 10" maxWidth={560}>
          <div className="absolute inset-[5%_6%]">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              {Array.from({ length: ROWS }, (_, r) => (
                <line
                  key={`r${r}`}
                  x1={px(0)}
                  y1={py(r)}
                  x2={px(COLS - 1)}
                  y2={py(r)}
                  stroke="var(--wood-line)"
                  strokeWidth="0.35"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {Array.from({ length: COLS }, (_, c) => (
                <line
                  key={`c${c}`}
                  x1={px(c)}
                  y1={py(0)}
                  x2={px(c)}
                  y2={py(ROWS - 1)}
                  stroke="var(--wood-line)"
                  strokeWidth="0.35"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {[0, 7].map((top) => (
                <g
                  key={top}
                  stroke="var(--wood-line)"
                  strokeWidth="0.35"
                  vectorEffect="non-scaling-stroke"
                >
                  <line x1={px(3)} y1={py(top)} x2={px(5)} y2={py(top + 2)} />
                  <line x1={px(5)} y1={py(top)} x2={px(3)} y2={py(top + 2)} />
                </g>
              ))}
            </svg>

            {cells.map((i, slot) => {
              const dr = Math.floor(slot / COLS);
              const dc = slot % COLS;
              const piece = state.board[i];
              const isTarget = targets.has(i);
              const isFrom = from === i;
              const isBlocker = blockers.has(i);
              const lastTo = state.last?.to === i;
              const size = piece ? SIZE[j.jType(piece)] : 1;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onPoint(i)}
                  aria-label={j.coordName(i)}
                  className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                  style={{
                    left: `${px(dc)}%`,
                    top: `${py(dr)}%`,
                    width: `${100 / COLS}%`,
                    height: `${100 / ROWS}%`,
                  }}
                >
                  {isTarget && !piece && (
                    <span className="pointer-events-none block h-[30%] w-[30%] rounded-full bg-[#3d2508]/50 ring-2 ring-[#3d2508]/25" />
                  )}

                  {piece !== 0 && (
                    <span
                      className={`placed relative flex items-center justify-center transition-transform duration-200 ${
                        isFrom ? 'scale-110' : ''
                      } ${lastTo ? 'last-move rounded-[22%]' : ''}`}
                      style={{ width: `${size * 92}%`, height: `${size * 92}%` }}
                    >
                      <JanggiPiece piece={piece} style={style} scheme={scheme} size={size} />
                      {isFrom && (
                        <span className="pointer-events-none absolute -inset-[12%] rounded-[26%] ring-2 ring-[var(--color-gold-400)]" />
                      )}
                      {isTarget && (
                        <span className="pointer-events-none absolute -inset-[14%] rounded-full ring-[3px] ring-[var(--color-vermilion-500)]" />
                      )}
                    </span>
                  )}

                  {isBlocker && (
                    <span
                      className="pointer-events-none absolute right-[6%] top-[4%] block h-[34%] w-[34%]"
                      aria-hidden="true"
                    >
                      <svg viewBox="0 0 24 24" className="h-full w-full drop-shadow">
                        <circle cx="12" cy="12" r="11" fill="#cf5540" stroke="#fff" strokeWidth="2" />
                        <path
                          d="M8.4 8.4l7.2 7.2M15.6 8.4l-7.2 7.2"
                          stroke="#fff"
                          strokeWidth="2.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}

            {game.hintMove && game.hintMove.from >= 0 && (
              <HintMarks
                from={at(game.hintMove.from)}
                to={at(game.hintMove.to)}
                ratio={BOARD_RATIO}
                label={p.hint}
              />
            )}
          </div>
        </BoardFrame>
      }
      controls={
        <>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="btn"
              onClick={() => {
                setFrom(null);
                game.retry();
              }}
            >
              {p.retry}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setFrom(null);
                game.next();
              }}
            >
              {p.next}
            </button>
          </div>
          <button
            type="button"
            className="btn w-full"
            onClick={game.toggleHint}
            disabled={game.status !== 'active'}
          >
            {p.showHint}
          </button>

          <SegmentedControl
            label={dict.game.pieceStyle}
            value={style}
            onChange={chooseStyle}
            options={[
              { value: 'hanja', label: dict.game.pieceStyles.hanja },
              { value: 'icon', label: dict.game.pieceStyles.icon },
              { value: 'letter', label: dict.game.pieceStyles.letter },
            ]}
          />
          <SegmentedControl
            label={dict.game.colorScheme}
            value={scheme}
            onChange={chooseScheme}
            options={[
              { value: 'traditional', label: dict.game.colorSchemes.traditional },
              { value: 'mono', label: dict.game.colorSchemes.mono },
            ]}
          />
        </>
      }
      sidebar={
        <>
          <Panel title={p.tierLabel[puzzle.tier - 1]}>
            <p className="text-sm leading-relaxed text-[var(--fg-muted)]">{p.tagline}</p>
          </Panel>
          <Panel title={dict.game.legend}>
            <ul className="space-y-2.5">
              {PIECE_ORDER.map((type) => {
                const key = PIECE_KEY[type];
                return (
                  <li key={type} className="flex gap-2.5">
                    <JanggiChip piece={type | (mySide === 2 ? 8 : 0)} style={style} scheme={scheme} />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold">{dict.game.pieces[key].name}</div>
                      <p className="mt-0.5 text-[0.7rem] leading-snug text-[var(--fg-muted)]">
                        {dict.game.pieces[key].move}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </>
      }
    />
  );
}
