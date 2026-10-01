'use client';

import { useMemo } from 'react';
import * as o from '@/lib/games/oware';
import { other } from '@/lib/games/types';
import type { Dictionary } from '@/lib/i18n/types';
import {
  BoardFrame,
  GameLayout,
  HintMarks,
  HintPanel,
  MoveLog,
  Panel,
  ResultOverlay,
  SidePicker,
  StatusBar,
} from './shell';
import { OwareSeeds } from './OwareSeeds';
import { useMatch } from './useMatch';

const TOTAL_SEEDS = 48;
const COLS = 6;
const ROWS = 2;
const px = (c: number) => (100 * (c + 0.5)) / COLS;
const py = (r: number) => (100 * (r + 0.5)) / ROWS;

export function OwareGame({ dict, hubHref }: { dict: Dictionary; hubHref: string }) {
  const match = useMatch<o.OwareState, o.OwareMove>({
    game: 'oware',
    create: o.initial,
    apply: o.apply,
    outcome: o.outcome,
    turn: (s) => s.turn,
  });

  const { state, result, mySide, myTurn } = match;
  const otherSide = other(mySide);
  const flip = mySide === 2;

  const legal = useMemo(() => (myTurn ? o.legalMoves(state) : []), [state, myTurn]);
  const movable = useMemo(() => new Set(legal.map((m) => m.pit)), [legal]);

  const pitAt = (slot: number) => (flip ? (slot + 6) % 12 : slot);
  const bottomPits = [0, 1, 2, 3, 4, 5].map(pitAt);
  const topPits = [11, 10, 9, 8, 7, 6].map(pitAt);

  /** Board-relative percentage of a pit's centre, honouring the row layout above. */
  const posOf = new Map<number, [number, number]>();
  topPits.forEach((pit, c) => posOf.set(pit, [px(c), py(0)]));
  bottomPits.forEach((pit, c) => posOf.set(pit, [px(c), py(1)]));

  const mine = state.score[mySide - 1];
  const theirs = state.score[otherSide - 1];

  const hintLabel = match.hint ? o.pitName(match.hint.pit) : null;

  const onPit = (i: number) => {
    if (!myTurn || !movable.has(i)) return;
    match.play({ pit: i });
  };

  const Pit = ({ i, row, col }: { i: number; row: number; col: number }) => {
    const clickable = myTurn && movable.has(i);
    const isLast = state.last?.pit === i;
    return (
      <button
        type="button"
        disabled={!clickable}
        onClick={() => onPit(i)}
        aria-label={`${o.pitName(i)}: ${state.board[i]}`}
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${px(col)}%`,
          top: `${py(row)}%`,
          width: `${100 / COLS}%`,
          height: `${100 / ROWS}%`,
        }}
      >
        <span
          className={`relative flex h-[86%] w-[86%] items-center justify-center rounded-full border-2 transition-transform duration-200 ${
            clickable
              ? 'cursor-pointer border-[var(--color-gold-400)]/70 hover:-translate-y-1'
              : 'cursor-default border-[var(--hairline)]'
          }`}
          style={{
            background:
              'radial-gradient(circle at 50% 38%, rgb(28 17 7 / 0.62), rgb(60 38 16 / 0.38) 75%)',
            boxShadow: 'inset 0 7px 14px rgb(0 0 0 / 0.45), inset 0 -2px 4px rgb(255 255 255 / 0.1)',
          }}
        >
          <OwareSeeds count={state.board[i]} seed={i} />
          <span className="absolute left-[8%] top-[4%] rounded-full bg-black/45 px-1.5 text-[0.6rem] font-semibold tabular-nums text-[#f2ead8] sm:text-xs">
            {state.board[i]}
          </span>
          {isLast && (
            <span className="pointer-events-none absolute -inset-1 rounded-full ring-2 ring-[var(--color-vermilion-500)]/70" />
          )}
        </span>
      </button>
    );
  };

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
                {dict.game.you} {mine}
              </span>
              <span className="chip">
                {dict.game.ai} {theirs}
              </span>
            </>
          }
        />
      }
      board={
        <BoardFrame aspect="3 / 1" maxWidth={680}>
          <div className="absolute inset-[6%]">
            {topPits.map((i, c) => (
              <Pit key={i} i={i} row={0} col={c} />
            ))}
            {bottomPits.map((i, c) => (
              <Pit key={i} i={i} row={1} col={c} />
            ))}

            {match.hint && (
              <HintMarks
                to={posOf.get(match.hint.pit)!}
                label={`${dict.game.hints.suggestion} ${hintLabel ?? ''}`}
              />
            )}
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
          <div>
            <div className="eyebrow mb-2">{dict.game.difficulty}</div>
            <div className="grid grid-cols-4 gap-1 rounded-full border border-[var(--hairline)] bg-[var(--surface)] p-1">
              {([1, 2, 3, 4] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => match.setLevel(l)}
                  title={dict.game.levelHints[l - 1]}
                  className={`rounded-full px-2 py-1.5 text-xs font-semibold transition-all duration-300 ${
                    match.level === l
                      ? 'bg-[linear-gradient(180deg,var(--color-gold-400),var(--color-gold-600))] text-[#241a08] shadow-[0_6px_18px_-8px_rgba(211,163,75,0.9)]'
                      : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
                  }`}
                >
                  {dict.game.levels[l - 1]}
                </button>
              ))}
            </div>
          </div>
          <SidePicker
            dict={dict}
            mySide={mySide}
            onChange={match.chooseSide}
            firstLabel={dict.game.playFirst}
            secondLabel={dict.game.playSecond}
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
        <>
          <HintPanel dict={dict} controller={match} moveLabel={hintLabel} />

          <Panel title={dict.game.score}>
            <div className="space-y-3">
              <Bar label={dict.game.you} value={mine} total={TOTAL_SEEDS} />
              <Bar label={dict.game.ai} value={theirs} total={TOTAL_SEEDS} />
            </div>
          </Panel>

          <MoveLog entries={state.log} title={dict.game.moveLog} />
        </>
      }
    />
  );
}

function Bar({ label, value, total }: { label: string; value: number; total: number }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-xs">
        <span className="text-[var(--fg-muted)]">{label}</span>
        <span className="font-semibold tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--hairline)]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-gold-400),var(--color-gold-600))] transition-[width] duration-500"
          style={{ width: `${(value / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
