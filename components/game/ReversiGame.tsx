'use client';

import { useMemo } from 'react';
import * as r from '@/lib/games/reversi';
import type { Dictionary } from '@/lib/i18n/types';
import {
  BoardFrame,
  GameLayout,
  LevelPicker,
  Panel,
  ResultOverlay,
  SidePicker,
  StatusBar,
} from './shell';
import { useMatch } from './useMatch';

const N = 8;
const pct = (i: number) => (100 * (i + 0.5)) / N;

export function ReversiGame({ dict, hubHref }: { dict: Dictionary; hubHref: string }) {
  const match = useMatch<r.ReversiState, number>({
    game: 'reversi',
    create: r.initial,
    apply: r.apply,
    outcome: r.outcome,
    turn: (s) => s.turn,
  });

  const { state, result, mySide, myTurn } = match;
  const legal = useMemo(
    () => (myTurn ? new Set(r.legalMoves(state)) : new Set<number>()),
    [state, myTurn],
  );
  const tally = r.counts(state.board);
  const mine = mySide === 1 ? tally.black : tally.white;
  const theirs = mySide === 1 ? tally.white : tally.black;

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
                <span className="inline-block h-2.5 w-2.5 rounded-full stone-black" />
                {tally.black}
              </span>
              <span className="chip">
                <span className="inline-block h-2.5 w-2.5 rounded-full stone-white" />
                {tally.white}
              </span>
              {state.passed && !result.over && (
                <span className="chip !text-[var(--color-gold-400)]">{dict.game.passedNotice}</span>
              )}
            </>
          }
        />
      }
      board={
        <BoardFrame tone="felt">
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
                    strokeWidth="0.4"
                  />
                  <line
                    x1={(100 * i) / N}
                    y1="0"
                    x2={(100 * i) / N}
                    y2="100"
                    stroke="var(--wood-line)"
                    strokeWidth="0.4"
                  />
                </g>
              ))}
              {[2, 6].map((a) =>
                [2, 6].map((b) => (
                  <circle
                    key={`${a}-${b}`}
                    cx={(100 * a) / N}
                    cy={(100 * b) / N}
                    r="0.85"
                    fill="var(--wood-line)"
                  />
                )),
              )}
            </svg>

            {state.board.map((v, i) => {
              const row = i >> 3;
              const col = i & 7;
              const playable = legal.has(i);
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={`${String.fromCharCode(97 + col)}${8 - row}`}
                  disabled={!playable}
                  onClick={() => match.play(i)}
                  className="group absolute -translate-x-1/2 -translate-y-1/2 disabled:cursor-default"
                  style={{
                    left: `${pct(col)}%`,
                    top: `${pct(row)}%`,
                    width: `${100 / N}%`,
                    height: `${100 / N}%`,
                  }}
                >
                  {v ? (
                    <span
                      className={`placed block h-[82%] w-[82%] rounded-full ${
                        v === 1 ? 'stone-black' : 'stone-white'
                      } ${state.last === i ? 'last-move' : ''}`}
                      style={{ margin: '9%' }}
                    />
                  ) : (
                    playable && (
                      <span className="mx-auto block h-[26%] w-[26%] rounded-full bg-[var(--color-gold-300)] opacity-40 transition-all duration-300 group-hover:h-[74%] group-hover:w-[74%] group-hover:opacity-70" />
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
            detail={`${mine} – ${theirs}`}
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
            <button type="button" className="btn" onClick={match.undo} disabled={!match.canUndo}>
              {dict.game.undo}
            </button>
          </div>
        </>
      }
      sidebar={
        <Panel title={dict.game.score}>
          <div className="space-y-3">
            <Bar label={dict.game.black} value={tally.black} total={64} dark />
            <Bar label={dict.game.white} value={tally.white} total={64} />
            <p className="text-[0.7rem] tabular-nums text-[var(--fg-muted)]">
              {64 - tally.empty} / 64
            </p>
          </div>
        </Panel>
      }
    />
  );
}

function Bar({
  label,
  value,
  total,
  dark,
}: {
  label: string;
  value: number;
  total: number;
  dark?: boolean;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-xs">
        <span className="text-[var(--fg-muted)]">{label}</span>
        <span className="font-semibold tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--hairline)]">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${
            dark
              ? 'bg-[linear-gradient(90deg,#4b5361,#0c1017)]'
              : 'bg-[linear-gradient(90deg,#efe9dc,#ffffff)]'
          }`}
          style={{ width: `${(value / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
