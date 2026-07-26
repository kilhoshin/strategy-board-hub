'use client';

import { useCallback, useMemo, useState } from 'react';
import * as c from '@/lib/games/chess';
import type { Side } from '@/lib/games/types';
import type { Dictionary } from '@/lib/i18n/types';
import {
  BoardFrame,
  GameLayout,
  HintMarks,
  HintPanel,
  LevelPicker,
  Panel,
  ResultOverlay,
  SidePicker,
  StatusBar,
} from './shell';
import { useMatch } from './useMatch';

/** Solid glyphs for both sides; colour comes from CSS so the contrast is ours. */
const GLYPH: Record<number, string> = {
  [c.PAWN]: '♟',
  [c.KNIGHT]: '♞',
  [c.BISHOP]: '♝',
  [c.ROOK]: '♜',
  [c.QUEEN]: '♛',
  [c.KING]: '♚',
};

const PROMO_CHOICES = [c.QUEEN, c.ROOK, c.BISHOP, c.KNIGHT];

export function ChessGame({ dict, hubHref }: { dict: Dictionary; hubHref: string }) {
  const [from, setFrom] = useState<number | null>(null);
  const [promo, setPromo] = useState<{ from: number; to: number } | null>(null);

  const match = useMatch<c.ChessState, c.ChessMove>({
    game: 'chess',
    create: c.initial,
    apply: c.apply,
    outcome: c.outcome,
    turn: (s) => s.turn,
  });

  const { state, result, mySide, myTurn } = match;
  const flip = mySide === 2;
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
      match.play(options[0]);
      setFrom(null);
    },
    [legal, match],
  );

  const onSquare = (sq: number) => {
    if (!myTurn) return;
    if (from !== null && targets.has(sq)) {
      commit(from, sq);
      return;
    }
    setFrom(movable.has(sq) ? sq : null);
  };

  const captured = useMemo(() => {
    const start: Record<number, number> = {
      [c.PAWN]: 8,
      [c.KNIGHT]: 2,
      [c.BISHOP]: 2,
      [c.ROOK]: 2,
      [c.QUEEN]: 1,
    };
    const alive: Record<number, [number, number]> = {};
    for (const t of Object.keys(start).map(Number)) alive[t] = [0, 0];
    for (let sq = 0; sq < 128; sq++) {
      if (sq & 0x88) continue;
      const p = state.board[sq];
      if (!p) continue;
      const ty = c.pieceType(p);
      if (ty === c.KING) continue;
      if (!alive[ty]) alive[ty] = [0, 0];
      alive[ty][c.pieceColor(p)]++;
    }
    const lost = (color: number) =>
      Object.entries(start).flatMap(([t, n]) =>
        Array.from({ length: Math.max(0, n - (alive[Number(t)]?.[color] ?? 0)) }, () => Number(t)),
      );
    return { white: lost(c.WHITE), black: lost(c.BLACK) };
  }, [state.board]);

  const pairs = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i < state.san.length; i += 2) {
      out.push([state.san[i], state.san[i + 1]].filter(Boolean).join('  '));
    }
    return out;
  }, [state.san]);

  const rows = flip ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const cols = flip ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  /** Board-relative percentage of a square's centre, honouring the flip. */
  const at = (sq: number): [number, number] => {
    const r = rows.indexOf(c.sqRank(sq));
    const f = cols.indexOf(c.sqFile(sq));
    return [(100 * (f + 0.5)) / 8, (100 * (r + 0.5)) / 8];
  };
  const hintLabel = match.hint ? c.describeMove(state, match.hint) : null;

  return (
    <GameLayout
      status={
        <StatusBar
          dict={dict}
          thinking={match.thinking}
          myTurn={myTurn}
          result={result}
          extra={
            <>
              <span className="chip">{state.fullmove}</span>
              {check && !result.over && (
                <span className="chip !border-[var(--color-vermilion-500)] !text-[var(--color-vermilion-400)]">
                  {dict.game.check}
                </span>
              )}
            </>
          }
        />
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

            {match.hint && (
              <HintMarks
                from={at(match.hint.from)}
                to={at(match.hint.to)}
                label={`${dict.game.hints.suggestion} ${hintLabel ?? ''}`}
              />
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
                        match.play({ from: promo.from, to: promo.to, promo: t });
                        setPromo(null);
                        setFrom(null);
                      }}
                    >
                      <span style={{ color: mySide === 1 ? '#fffdf7' : '#16120c' }}>{GLYPH[t]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <ResultOverlay
            dict={dict}
            result={result}
            mySide={mySide}
            onReset={() => {
              setFrom(null);
              match.reset();
            }}
            otherGamesHref={hubHref}
          />
        </BoardFrame>
      }
      controls={
        <>
          <LevelPicker dict={dict} level={match.level} onChange={match.setLevel} />
          <SidePicker
            dict={dict}
            mySide={mySide}
            onChange={(s: Side) => {
              setFrom(null);
              match.chooseSide(s);
            }}
            firstLabel={`${dict.game.white} · ${dict.game.playFirst}`}
            secondLabel={`${dict.game.black} · ${dict.game.playSecond}`}
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="btn"
              onClick={() => {
                setFrom(null);
                match.reset();
              }}
            >
              {dict.game.newGame}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setFrom(null);
                match.undo();
              }}
              disabled={!match.canUndo}
            >
              {dict.game.undo}
            </button>
          </div>
        </>
      }
      sidebar={
        <>
          <HintPanel dict={dict} controller={match} moveLabel={hintLabel} />
          <Panel title={dict.game.captured}>
            <div className="space-y-2 text-2xl leading-none">
              <div className="min-h-7" style={{ color: '#16120c', textShadow: '0 0 1.2px #d8c9ae' }}>
                {captured.black.map(GLYPH_OF).join('') || '—'}
              </div>
              <div className="min-h-7" style={{ color: '#fffdf7', textShadow: '0 0 1.5px #3a2a18' }}>
                {captured.white.map(GLYPH_OF).join('') || '—'}
              </div>
            </div>
          </Panel>
          <Panel title={dict.game.moveLog}>
            <ol className="thin-scroll max-h-44 space-y-0.5 overflow-y-auto pr-1 text-xs tabular-nums">
              {pairs.length === 0 && <li className="opacity-50">—</li>}
              {pairs.map((p, i) => (
                <li key={i} className="flex gap-2">
                  <span className="w-5 shrink-0 text-right opacity-50">{i + 1}.</span>
                  <span className="whitespace-pre">{p}</span>
                </li>
              ))}
            </ol>
          </Panel>
        </>
      }
    />
  );
}

function GLYPH_OF(t: number) {
  return GLYPH[t] ?? '';
}
