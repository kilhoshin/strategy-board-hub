'use client';

import { useCallback, useMemo, useState } from 'react';
import * as c from '@/lib/games/chess';
import type { Dictionary } from '@/lib/i18n/types';
import type { ChessPuzzle as ChessPuzzleData } from '@/lib/puzzles/types';
import { CHESS_PUZZLES } from '@/lib/puzzles/chess';
import { BoardFrame, GameLayout, HintMarks, Panel } from './shell';
import { usePuzzle } from './usePuzzle';

const GLYPH: Record<number, string> = {
  [c.PAWN]: '♟',
  [c.KNIGHT]: '♞',
  [c.BISHOP]: '♝',
  [c.ROOK]: '♜',
  [c.QUEEN]: '♛',
  [c.KING]: '♚',
};

const PROMO_CHOICES = [c.QUEEN, c.ROOK, c.BISHOP, c.KNIGHT];

export function ChessPuzzle({ dict }: { dict: Dictionary }) {
  const [from, setFrom] = useState<number | null>(null);
  const [promo, setPromo] = useState<{ from: number; to: number } | null>(null);

  const game = usePuzzle<c.ChessState, c.ChessMove, ChessPuzzleData>({
    puzzles: CHESS_PUZZLES,
    base: (p) => c.fromFen(p.fen),
    apply: c.apply,
    outcome: c.outcome,
    turn: (s) => s.turn,
    movesEqual: (a, b) => a.from === b.from && a.to === b.to && (a.promo ?? 0) === (b.promo ?? 0),
  });

  const { state, myTurn, puzzle } = game;
  const flip = puzzle.sideToMove === 2;
  const legal = useMemo(() => (myTurn ? c.legalMoves(state) : []), [state, myTurn]);
  const targets = useMemo(
    () => new Set(legal.filter((m) => m.from === from).map((m) => m.to)),
    [legal, from],
  );
  const movable = useMemo(() => new Set(legal.map((m) => m.from)), [legal]);
  const check = useMemo(() => c.inCheck(state), [state]);

  const commit = useCallback(
    (a: number, b: number) => {
      const options = legal.filter((m) => m.from === a && m.to === b);
      if (options.length === 0) return;
      if (options.some((m) => m.promo)) {
        setPromo({ from: a, to: b });
        return;
      }
      game.play(options[0]);
      setFrom(null);
    },
    [legal, game],
  );

  const onSquare = (sq: number) => {
    if (!myTurn) return;
    if (from !== null && targets.has(sq)) {
      commit(from, sq);
      return;
    }
    setFrom(movable.has(sq) ? sq : null);
  };

  const rows = flip ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const cols = flip ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  const at = (sq: number): [number, number] => {
    const r = rows.indexOf(c.sqRank(sq));
    const f = cols.indexOf(c.sqFile(sq));
    return [(100 * (f + 0.5)) / 8, (100 * (r + 0.5)) / 8];
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
          {check && game.status === 'active' && (
            <span className="chip !border-[var(--color-vermilion-500)] !text-[var(--color-vermilion-400)]">
              {dict.game.check}
            </span>
          )}
          <span className="ml-auto text-xs text-[var(--fg-muted)]">
            {p.progress} {game.index + 1} / {game.total}
          </span>
        </div>
      }
      board={
        <BoardFrame tone="slate">
          <div className="absolute inset-[2.4%] overflow-hidden rounded-[8px]">
            <div className="grid h-full w-full grid-cols-8 grid-rows-8">
              {rows.map((r) =>
                cols.map((f) => {
                  const sq = c.sq88(r, f);
                  const piece = state.board[sq];
                  const light = (r + f) % 2 === 0;
                  const selected = from === sq;
                  const target = targets.has(sq);
                  const lastMove = state.last && (state.last.from === sq || state.last.to === sq);
                  return (
                    <button
                      key={sq}
                      type="button"
                      onClick={() => onSquare(sq)}
                      aria-label={c.squareName(sq)}
                      className={`relative flex items-center justify-center transition-colors duration-200 ${
                        light ? 'bg-[#e8d5b0]' : 'bg-[#93704a]'
                      } ${selected ? '!bg-[var(--color-gold-400)]' : ''}`}
                    >
                      {lastMove && (
                        <span className="pointer-events-none absolute inset-0 bg-[var(--color-gold-400)] opacity-25" />
                      )}
                      {target && !piece && (
                        <span className="pointer-events-none absolute h-[26%] w-[26%] rounded-full bg-black/35" />
                      )}
                      {target && piece && (
                        <span className="pointer-events-none absolute inset-[6%] rounded-full ring-[3px] ring-[var(--color-vermilion-500)]/70" />
                      )}
                      {piece !== 0 && (
                        <span
                          className="placed relative select-none leading-none"
                          style={{
                            fontSize: '8.6cqw',
                            color: c.pieceColor(piece) === c.WHITE ? '#fffdf7' : '#16120c',
                            textShadow:
                              c.pieceColor(piece) === c.WHITE
                                ? '0 0 1.5px #3a2a18, 0 0 1.5px #3a2a18, 0 2px 3px rgba(0,0,0,0.45)'
                                : '0 0 1.2px #d8c9ae, 0 2px 3px rgba(0,0,0,0.45)',
                          }}
                        >
                          {GLYPH[c.pieceType(piece)]}
                        </span>
                      )}
                      {f === cols[0] && (
                        <span className="pointer-events-none absolute left-0.5 top-0 text-[0.5rem] font-semibold opacity-45">
                          {8 - r}
                        </span>
                      )}
                      {r === rows[7] && (
                        <span className="pointer-events-none absolute bottom-0 right-0.5 text-[0.5rem] font-semibold opacity-45">
                          {String.fromCharCode(97 + f)}
                        </span>
                      )}
                    </button>
                  );
                }),
              )}
            </div>

            {game.hintMove && (
              <HintMarks from={at(game.hintMove.from)} to={at(game.hintMove.to)} label={p.hint} />
            )}
          </div>

          {promo && (
            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[14px] bg-black/60 backdrop-blur-sm">
              <div className="panel p-4 text-center">
                <p className="mb-3 text-xs font-semibold">{dict.game.promotePrompt}</p>
                <div className="flex gap-2">
                  {PROMO_CHOICES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className="btn h-12 w-12 !p-0 text-2xl"
                      onClick={() => {
                        game.play({ from: promo.from, to: promo.to, promo: t });
                        setPromo(null);
                        setFrom(null);
                      }}
                    >
                      <span style={{ color: puzzle.sideToMove === 1 ? '#fffdf7' : '#16120c' }}>
                        {GLYPH[t]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
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
        </>
      }
      sidebar={
        <Panel title={p.tierLabel[puzzle.tier - 1]}>
          <p className="text-sm leading-relaxed text-[var(--fg-muted)]">{p.tagline}</p>
        </Panel>
      }
    />
  );
}
