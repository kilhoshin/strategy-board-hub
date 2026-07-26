'use client';

import { useCallback, useMemo, useState } from 'react';
import * as g from '@/lib/games/gomoku';
import type { Side } from '@/lib/games/types';
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

const N = g.SIZE;
const pct = (i: number) => (100 * (i + 0.5)) / N;
const STARS = [
  [3, 3],
  [3, 11],
  [11, 3],
  [11, 11],
  [7, 7],
];

export function GomokuGame({ dict, hubHref }: { dict: Dictionary; hubHref: string }) {
  const [hover, setHover] = useState<number | null>(null);

  const match = useMatch<g.GomokuState, number>({
    game: 'gomoku',
    create: g.initial,
    apply: g.apply,
    outcome: g.outcome,
    turn: (s) => s.turn,
  });

  const { state, result, mySide, myTurn } = match;
  const winLine = useMemo(() => new Set(g.winningLine(state.board) ?? []), [state.board]);

  const onCell = useCallback(
    (i: number) => {
      if (!myTurn || state.board[i]) return;
      match.play(i);
    },
    [match, myTurn, state.board],
  );

  const moves = state.history.map((m, i) => {
    const [r, c] = g.rc(m);
    return `${i % 2 === 0 ? '●' : '○'} ${String.fromCharCode(65 + c)}${N - r}`;
  });

  return (
    <GameLayout
      status={
        <StatusBar
          dict={dict}
          thinking={match.thinking}
          myTurn={myTurn}
          result={result}
          extra={
            <span className="chip">
              {mySide === 1 ? dict.game.black : dict.game.white} · {state.history.length}
            </span>
          }
        />
      }
      board={
        <BoardFrame>
          <div className="absolute inset-[3.4%]">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
              {Array.from({ length: N }, (_, i) => (
                <g key={i}>
                  <line
                    x1={pct(0)}
                    y1={pct(i)}
                    x2={pct(N - 1)}
                    y2={pct(i)}
                    stroke="var(--wood-line)"
                    strokeWidth="0.32"
                  />
                  <line
                    x1={pct(i)}
                    y1={pct(0)}
                    x2={pct(i)}
                    y2={pct(N - 1)}
                    stroke="var(--wood-line)"
                    strokeWidth="0.32"
                  />
                </g>
              ))}
              {STARS.map(([r, c]) => (
                <circle key={`${r}-${c}`} cx={pct(c)} cy={pct(r)} r="0.62" fill="var(--wood-line)" />
              ))}
            </svg>

            {state.board.map((v, i) => {
              const [r, c] = g.rc(i);
              const isLast = state.last === i;
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={`${String.fromCharCode(65 + c)}${N - r}`}
                  disabled={!myTurn || !!v}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover((h) => (h === i ? null : h))}
                  onClick={() => onCell(i)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full disabled:cursor-default"
                  style={{
                    left: `${pct(c)}%`,
                    top: `${pct(r)}%`,
                    width: `${100 / N}%`,
                    height: `${100 / N}%`,
                  }}
                >
                  {v ? (
                    <span
                      className={`placed block h-[86%] w-[86%] rounded-full ${
                        v === 1 ? 'stone-black' : 'stone-white'
                      } ${isLast ? 'last-move' : ''} ${
                        winLine.has(i) ? 'ring-2 ring-[var(--color-gold-400)]' : ''
                      }`}
                      style={{ margin: '7%' }}
                    />
                  ) : (
                    hover === i &&
                    myTurn && (
                      <span
                        className={`block h-[70%] w-[70%] rounded-full opacity-35 ${
                          state.turn === 1 ? 'stone-black' : 'stone-white'
                        }`}
                        style={{ margin: '15%' }}
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
            firstLabel={`${dict.game.black} · ${dict.game.playFirst}`}
            secondLabel={`${dict.game.white} · ${dict.game.playSecond}`}
          />
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="btn" onClick={() => match.reset()}>
              {dict.game.newGame}
            </button>
            <button
              type="button"
              className="btn"
              onClick={match.undo}
              disabled={!match.canUndo}
            >
              {dict.game.undo}
            </button>
          </div>
        </>
      }
      sidebar={<MoveLog entries={moves} title={dict.game.moveLog} />}
    />
  );
}
