'use client';

import { useCallback, useMemo, useState } from 'react';
import * as bc from '@/lib/games/baghchal';
import type { Dictionary } from '@/lib/i18n/types';
import {
  BoardFrame,
  GameLayout,
  LevelPicker,
  MoveLog,
  ResultOverlay,
  SidePicker,
  StatusBar,
} from './shell';
import { useMatch } from './useMatch';

const N = 5;
const pos = (i: number) => 8 + i * 21;
const rc = (i: number) => [Math.floor(i / N), i % N] as const;

export function BaghchalGame({ dict, hubHref }: { dict: Dictionary; hubHref: string }) {
  const [from, setFrom] = useState<number | null>(null);

  const match = useMatch<bc.BaghchalState, bc.BaghchalMove>({
    game: 'baghchal',
    create: bc.initial,
    apply: bc.apply,
    outcome: bc.outcome,
    turn: (s) => s.turn,
  });

  const { state, result, mySide, myTurn } = match;
  const isPlacing = state.turn === 1 && state.goatsPlaced < 20;
  const legal = useMemo(() => (myTurn ? bc.legalMoves(state) : []), [state, myTurn]);
  const movable = useMemo(
    () => new Set(legal.filter((m) => m.from !== null).map((m) => m.from as number)),
    [legal],
  );
  const targets = useMemo(
    () => new Set(legal.filter((m) => m.from === from).map((m) => m.to)),
    [legal, from],
  );
  const captureTargets = useMemo(
    () => new Set(legal.filter((m) => m.from === from && m.capture !== null).map((m) => m.to)),
    [legal, from],
  );

  const commit = useCallback(
    (a: number | null, b: number) => {
      const options = legal.filter((m) => m.from === a && m.to === b);
      if (options.length === 0) return;
      match.play(options[0]);
      setFrom(null);
    },
    [legal, match],
  );

  const onPoint = (i: number) => {
    if (!myTurn) return;
    if (isPlacing) {
      commit(null, i);
      return;
    }
    if (from !== null && targets.has(i)) {
      commit(from, i);
      return;
    }
    setFrom(movable.has(i) ? i : null);
  };

  const goatsRemaining = 20 - state.goatsPlaced;

  const label = (i: number) => `${Math.floor(i / N) + 1}-${(i % N) + 1}`;
  const moves = useMemo(
    () =>
      match.history
        .slice(1)
        .map((s) => s.last)
        .filter((m): m is bc.BaghchalMove => m !== null)
        .map((m) =>
          m.from === null
            ? `+${label(m.to)}`
            : `${label(m.from)}→${label(m.to)}${m.capture !== null ? ` ×${label(m.capture)}` : ''}`,
        ),
    [match.history],
  );

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
              <span className="chip">
                <span className="inline-block h-2.5 w-2.5 rounded-full stone-tiger" />
                {dict.game.captured} {state.goatsCaptured}/5
              </span>
              {isPlacing && (
                <span className="chip">
                  <span className="inline-block h-2.5 w-2.5 rounded-full stone-white" />
                  {goatsRemaining}
                </span>
              )}
            </>
          }
        />
      }
      board={
        <BoardFrame tone="wood">
          <div className="absolute inset-[7%]">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
              {bc.EDGES.map(([a, b], i) => {
                const [ar, ac] = rc(a);
                const [br, bcol] = rc(b);
                return (
                  <line
                    key={i}
                    x1={pos(ac)}
                    y1={pos(ar)}
                    x2={pos(bcol)}
                    y2={pos(br)}
                    stroke="var(--wood-line)"
                    strokeWidth="0.6"
                  />
                );
              })}
            </svg>

            {state.board.map((v, i) => {
              const [r, c] = rc(i);
              const selected = from === i;
              const target = targets.has(i);
              const captureTarget = captureTargets.has(i);
              const lastHere = state.last && (state.last.to === i || state.last.from === i);
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={`${r + 1}-${c + 1}`}
                  disabled={!myTurn || (!isPlacing && v === 0 && !target)}
                  onClick={() => onPoint(i)}
                  className="group absolute -translate-x-1/2 -translate-y-1/2 disabled:cursor-default"
                  style={{
                    left: `${pos(c)}%`,
                    top: `${pos(r)}%`,
                    width: `${100 / N}%`,
                    height: `${100 / N}%`,
                  }}
                >
                  {lastHere && (
                    <span className="pointer-events-none absolute inset-[16%] rounded-full bg-[var(--color-gold-400)] opacity-25" />
                  )}
                  {v !== 0 ? (
                    <span
                      className={`placed relative z-10 block h-[68%] w-[68%] rounded-full ${
                        v === 1 ? 'stone-white' : 'stone-tiger'
                      } ${selected ? 'ring-4 ring-[var(--color-gold-400)]' : ''}`}
                      style={{ margin: '16%' }}
                    />
                  ) : (
                    target && (
                      <span
                        className={`mx-auto block rounded-full transition-all duration-300 ${
                          captureTarget
                            ? 'h-[52%] w-[52%] bg-transparent ring-[3px] ring-[var(--color-vermilion-500)]/80'
                            : 'h-[26%] w-[26%] bg-[var(--color-gold-300)] opacity-50 group-hover:h-[48%] group-hover:w-[48%] group-hover:opacity-75'
                        }`}
                      />
                    )
                  )}
                </button>
              );
            })}
          </div>

          <ResultOverlay
            dict={dict}
            result={result}
            mySide={mySide}
            onReset={() => match.reset()}
            otherGamesHref={hubHref}
            detail={`${dict.game.captured} ${state.goatsCaptured}/5`}
          />
        </BoardFrame>
      }
      controls={
        <>
          <LevelPicker dict={dict} level={match.level} onChange={match.setLevel} />
          <SidePicker
            dict={dict}
            mySide={mySide}
            onChange={match.chooseSide}
            firstLabel={dict.game.goat}
            secondLabel={dict.game.tiger}
          />
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="btn" onClick={() => match.reset()}>
              {dict.game.newGame}
            </button>
            <button type="button" className="btn" onClick={match.undo} disabled={!match.canUndo}>
              {dict.game.undo}
            </button>
          </div>
        </>
      }
      sidebar={<MoveLog entries={moves} title={dict.game.moveLog} />}
    />
  );
}
