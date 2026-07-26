'use client';

import { useMemo, useState } from 'react';
import * as s from '@/lib/games/shogi';
import type { Side } from '@/lib/games/types';
import type { Dictionary } from '@/lib/i18n/types';
import {
  BoardFrame,
  GameLayout,
  LevelPicker,
  MoveLog,
  Panel,
  ResultOverlay,
  SidePicker,
  StatusBar,
} from './shell';
import { useMatch } from './useMatch';

const N = 9;
const pct = (i: number) => (100 * (i + 0.5)) / N;

type Selection = { kind: 'square'; at: number } | { kind: 'hand'; piece: number } | null;

export function ShogiGame({ dict, hubHref }: { dict: Dictionary; hubHref: string }) {
  const [sel, setSel] = useState<Selection>(null);
  const [promo, setPromo] = useState<s.ShogiMove[] | null>(null);

  const match = useMatch<s.ShogiState, s.ShogiMove>({
    game: 'shogi',
    create: s.initial,
    apply: s.apply,
    outcome: s.outcome,
    turn: (st) => st.turn,
  });

  const { state, result, mySide, myTurn } = match;
  const flip = mySide === 2;
  const legal = useMemo(() => (myTurn ? s.legalMoves(state) : []), [state, myTurn]);
  const movable = useMemo(
    () => new Set(legal.filter((m) => m.from >= 0).map((m) => m.from)),
    [legal],
  );
  const targets = useMemo(() => {
    if (!sel) return new Set<number>();
    if (sel.kind === 'square')
      return new Set(legal.filter((m) => m.from === sel.at).map((m) => m.to));
    return new Set(legal.filter((m) => m.from < 0 && m.drop === sel.piece).map((m) => m.to));
  }, [legal, sel]);
  const check = useMemo(() => s.inCheck(state), [state]);

  const onSquare = (i: number) => {
    if (!myTurn) return;
    if (sel && targets.has(i)) {
      const options =
        sel.kind === 'square'
          ? legal.filter((m) => m.from === sel.at && m.to === i)
          : legal.filter((m) => m.from < 0 && m.drop === sel.piece && m.to === i);
      if (options.length > 1 && options.some((m) => m.promote)) {
        setPromo(options);
        return;
      }
      if (options[0]) {
        match.play(options[0]);
        setSel(null);
      }
      return;
    }
    setSel(movable.has(i) ? { kind: 'square', at: i } : null);
  };

  const order = (k: number) => (flip ? N * N - 1 - k : k);
  const cells = Array.from({ length: N * N }, (_, k) => order(k));

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
              <span className="chip">{mySide === 1 ? dict.game.sente : dict.game.gote}</span>
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
        <div className="space-y-3">
          <Hand
            dict={dict}
            side={flip ? 1 : 2}
            counts={state.hands[flip ? 1 : 2]}
            selected={null}
            onSelect={() => undefined}
            interactive={false}
          />

          <BoardFrame maxWidth={560}>
            <div className="absolute inset-[3%]">
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
                {Array.from({ length: N + 1 }, (_, i) => (
                  <g key={i}>
                    <line
                      x1="0"
                      y1={(100 * i) / N}
                      x2="100"
                      y2={(100 * i) / N}
                      stroke="var(--wood-line)"
                      strokeWidth="0.3"
                    />
                    <line
                      x1={(100 * i) / N}
                      y1="0"
                      x2={(100 * i) / N}
                      y2="100"
                      stroke="var(--wood-line)"
                      strokeWidth="0.3"
                    />
                  </g>
                ))}
                {[3, 6].map((a) =>
                  [3, 6].map((b) => (
                    <circle
                      key={`${a}-${b}`}
                      cx={(100 * a) / N}
                      cy={(100 * b) / N}
                      r="0.7"
                      fill="var(--wood-line)"
                    />
                  )),
                )}
              </svg>

              {cells.map((i, slot) => {
                const piece = state.board[i];
                const dr = Math.floor(slot / N);
                const dc = slot % N;
                const isTarget = targets.has(i);
                const isFrom = sel?.kind === 'square' && sel.at === i;
                const lastTo = state.last?.to === i;
                const gote = piece ? s.sOwner(piece) === 2 : false;
                const facing = flip ? !gote : gote;

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onSquare(i)}
                    className="absolute flex items-center justify-center"
                    style={{
                      left: `${pct(dc)}%`,
                      top: `${pct(dr)}%`,
                      width: `${100 / N}%`,
                      height: `${100 / N}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    aria-label={`${9 - (i % N)}${Math.floor(i / N) + 1}`}
                  >
                    {isTarget && !piece && (
                      <span className="pointer-events-none block h-[24%] w-[24%] rounded-full bg-[#3d2508]/40" />
                    )}
                    {piece !== 0 && (
                      <span
                        className={`placed relative flex h-[88%] w-[80%] items-center justify-center ${
                          isFrom ? 'scale-110' : ''
                        } ${lastTo ? 'last-move rounded-sm' : ''}`}
                        style={{ transform: facing ? 'rotate(180deg)' : undefined }}
                      >
                        <svg viewBox="0 0 40 44" className="absolute inset-0 h-full w-full">
                          <path
                            d="M20 1 L34 8 L37 43 L3 43 L6 8 Z"
                            fill={isFrom ? '#f7dfa8' : '#f4e2bd'}
                            stroke={isTarget ? '#cf5540' : '#7a5423'}
                            strokeWidth={isTarget ? 2.4 : 1.2}
                          />
                        </svg>
                        <span
                          className="relative font-bold leading-none"
                          style={{
                            fontSize:
                              s.sPromoted(piece) && s.sType(piece) !== s.FU ? '3.2cqw' : '5.2cqw',
                            color: s.sPromoted(piece) ? '#a8321f' : '#2a1d0c',
                            writingMode:
                              s.sPromoted(piece) && s.sType(piece) !== s.FU
                                ? 'vertical-rl'
                                : undefined,
                          }}
                        >
                          {s.pieceLabel(piece)}
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {promo && (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[14px] bg-black/60 backdrop-blur-sm">
                <div className="panel p-4 text-center">
                  <p className="mb-3 text-xs font-semibold">{dict.game.promotePrompt}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        const m = promo.find((x) => x.promote);
                        if (m) match.play(m);
                        setPromo(null);
                        setSel(null);
                      }}
                    >
                      {dict.game.promoteYes}
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => {
                        const m = promo.find((x) => !x.promote);
                        if (m) match.play(m);
                        setPromo(null);
                        setSel(null);
                      }}
                    >
                      {dict.game.promoteNo}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <ResultOverlay
              dict={dict}
              result={result}
              mySide={mySide}
              onReset={() => {
                setSel(null);
                match.reset();
              }}
              otherGamesHref={hubHref}
            />
          </BoardFrame>

          <Hand
            dict={dict}
            side={flip ? 2 : 1}
            counts={state.hands[flip ? 2 : 1]}
            selected={sel?.kind === 'hand' ? sel.piece : null}
            onSelect={(piece) =>
              setSel((prev) =>
                prev?.kind === 'hand' && prev.piece === piece ? null : { kind: 'hand', piece },
              )
            }
            interactive={myTurn}
          />
        </div>
      }
      controls={
        <>
          <LevelPicker dict={dict} level={match.level} onChange={match.setLevel} />
          <SidePicker
            dict={dict}
            mySide={mySide}
            onChange={(side: Side) => {
              setSel(null);
              match.chooseSide(side);
            }}
            firstLabel={`${dict.game.sente} · ${dict.game.playFirst}`}
            secondLabel={`${dict.game.gote} · ${dict.game.playSecond}`}
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="btn"
              onClick={() => {
                setSel(null);
                match.reset();
              }}
            >
              {dict.game.newGame}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setSel(null);
                match.undo();
              }}
              disabled={!match.canUndo}
            >
              {dict.game.undo}
            </button>
          </div>
        </>
      }
      sidebar={<MoveLog entries={state.log} title={dict.game.moveLog} />}
    />
  );
}

function Hand({
  dict,
  side,
  counts,
  selected,
  onSelect,
  interactive,
}: {
  dict: Dictionary;
  side: Side;
  counts: number[];
  selected: number | null;
  onSelect: (piece: number) => void;
  interactive: boolean;
}) {
  const held = s.HAND_ORDER.filter((t) => counts[t] > 0);
  return (
    <div className="panel flex min-h-12 items-center gap-2 px-3 py-2">
      <span className="eyebrow shrink-0 !text-[0.6rem]">
        {side === 1 ? dict.game.sente : dict.game.gote} {dict.game.inHand}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        {held.length === 0 && <span className="text-xs opacity-40">—</span>}
        {held.map((t) => (
          <button
            key={t}
            type="button"
            disabled={!interactive}
            onClick={() => onSelect(t)}
            className={`relative flex h-8 w-7 items-center justify-center rounded-[3px] border text-sm font-bold transition-transform ${
              selected === t
                ? 'scale-110 border-[var(--color-gold-400)] ring-2 ring-[var(--color-gold-400)]'
                : 'border-[#7a5423]/70'
            } ${interactive ? 'hover:-translate-y-0.5' : 'cursor-default opacity-80'}`}
            style={{
              background: 'linear-gradient(180deg,#f6e6c4,#e8d3a6)',
              color: '#2a1d0c',
            }}
          >
            {s.pieceLabel(t)}
            {counts[t] > 1 && (
              <span className="absolute -bottom-1 -right-1 rounded-full bg-[var(--color-gold-500)] px-1 text-[0.55rem] font-bold text-[#241a08]">
                {counts[t]}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
