'use client';

import { useMemo, useState } from 'react';
import * as go from '@/lib/games/go';
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

const SIZES: go.GoSize[] = [9, 13, 19];

export function GoGame({ dict, hubHref }: { dict: Dictionary; hubHref: string }) {
  const [size, setSize] = useState<go.GoSize>(9);
  const [hover, setHover] = useState<number | null>(null);

  const match = useMatch<go.GoState, number>({
    game: 'go',
    create: useMemo(() => () => go.initial(size), [size]),
    apply: go.apply,
    outcome: go.outcome,
    turn: (s) => s.turn,
  });

  const { state, result, mySide, myTurn } = match;
  const n = state.size;
  const pct = (i: number) => (100 * (i + 0.5)) / n;

  const score = useMemo(
    () => (result.over ? go.finalScore(state, n === 9 ? 300 : n === 13 ? 180 : 120) : null),
    [result.over, state, n],
  );

  const stars = go.STAR_POINTS[n as go.GoSize] ?? [];
  const stoneSize = n <= 9 ? 92 : n <= 13 ? 94 : 96;

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
                {state.captured[1]}
              </span>
              <span className="chip">
                <span className="inline-block h-2.5 w-2.5 rounded-full stone-white" />
                {state.captured[2]}
              </span>
              {state.last === go.PASS && !result.over && (
                <span className="chip !text-[var(--color-gold-400)]">{dict.game.pass}</span>
              )}
            </>
          }
        />
      }
      board={
        <BoardFrame maxWidth={640}>
          <div className="absolute inset-[3.2%]">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
              {Array.from({ length: n }, (_, i) => (
                <g key={i}>
                  <line
                    x1={pct(0)}
                    y1={pct(i)}
                    x2={pct(n - 1)}
                    y2={pct(i)}
                    stroke="var(--wood-line)"
                    strokeWidth={n > 13 ? 0.24 : 0.34}
                  />
                  <line
                    x1={pct(i)}
                    y1={pct(0)}
                    x2={pct(i)}
                    y2={pct(n - 1)}
                    stroke="var(--wood-line)"
                    strokeWidth={n > 13 ? 0.24 : 0.34}
                  />
                </g>
              ))}
              {stars.map((p) => (
                <circle
                  key={p}
                  cx={pct(p % n)}
                  cy={pct(Math.floor(p / n))}
                  r={n > 13 ? 0.5 : 0.7}
                  fill="var(--wood-line)"
                />
              ))}
            </svg>

            {state.board.map((v, i) => {
              const r = Math.floor(i / n);
              const col = i % n;
              const own = score?.ownership[i] ?? 0;
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={go.coordName(n, i)}
                  disabled={!myTurn || !!v}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover((h) => (h === i ? null : h))}
                  onClick={() => {
                    if (myTurn && go.isLegal(state, i)) match.play(i);
                  }}
                  className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center disabled:cursor-default"
                  style={{
                    left: `${pct(col)}%`,
                    top: `${pct(r)}%`,
                    width: `${100 / n}%`,
                    height: `${100 / n}%`,
                  }}
                >
                  {v ? (
                    <span
                      className={`placed block rounded-full ${
                        v === 1 ? 'stone-black' : 'stone-white'
                      } ${state.last === i ? 'last-move' : ''}`}
                      style={{ width: `${stoneSize}%`, height: `${stoneSize}%` }}
                    />
                  ) : score && Math.abs(own) > 0.25 ? (
                    <span
                      className={`block h-[34%] w-[34%] rounded-[2px] ${
                        own > 0 ? 'bg-[#0a0c10]' : 'bg-[#f2eee5]'
                      } opacity-70`}
                    />
                  ) : (
                    hover === i &&
                    myTurn && (
                      <span
                        className={`block rounded-full opacity-35 ${
                          state.turn === 1 ? 'stone-black' : 'stone-white'
                        }`}
                        style={{ width: `${stoneSize * 0.8}%`, height: `${stoneSize * 0.8}%` }}
                      />
                    )
                  )}
                  {state.ko === i && !v && (
                    <span className="pointer-events-none absolute h-[30%] w-[30%] border border-[#3d2508]/60" />
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
            detail={
              score
                ? `${dict.game.black} ${score.black} · ${dict.game.white} ${score.white.toFixed(1)}`
                : undefined
            }
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
          <div>
            <div className="eyebrow mb-2">{dict.game.boardSize}</div>
            <div className="grid grid-cols-3 gap-1 rounded-full border border-[var(--hairline)] bg-[var(--surface)] p-1">
              {SIZES.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => {
                    setSize(sz);
                    match.reset(go.initial(sz));
                  }}
                  className={`rounded-full px-2 py-1.5 text-xs font-semibold transition-all duration-300 ${
                    size === sz
                      ? 'bg-[var(--surface-strong)] text-[var(--fg)]'
                      : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
                  }`}
                >
                  {sz}×{sz}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button type="button" className="btn !px-2 text-xs" onClick={() => match.reset()}>
              {dict.game.newGame}
            </button>
            <button
              type="button"
              className="btn !px-2 text-xs"
              onClick={match.undo}
              disabled={!match.canUndo}
            >
              {dict.game.undo}
            </button>
            <button
              type="button"
              className="btn !px-2 text-xs"
              onClick={() => match.play(go.PASS)}
              disabled={!myTurn}
            >
              {dict.game.pass}
            </button>
          </div>
        </>
      }
      sidebar={
        <Panel title={dict.game.score}>
          <dl className="space-y-1.5 text-xs">
            <Row label={dict.game.komi} value={state.komi.toFixed(1)} />
            <Row label={`${dict.game.black} ${dict.game.captured}`} value={state.captured[1]} />
            <Row label={`${dict.game.white} ${dict.game.captured}`} value={state.captured[2]} />
            {score && (
              <>
                <div className="rule my-2" />
                <Row label={dict.game.black} value={score.black} />
                <Row label={dict.game.white} value={score.white.toFixed(1)} />
              </>
            )}
          </dl>
          <p className="mt-3 text-[0.7rem] leading-relaxed text-[var(--fg-muted)]">
            {dict.game.scoringNote}
          </p>
        </Panel>
      }
    />
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[var(--fg-muted)]">{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
