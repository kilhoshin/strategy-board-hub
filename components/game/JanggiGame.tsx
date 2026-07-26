'use client';

import { useMemo, useState } from 'react';
import * as j from '@/lib/games/janggi';
import type { Side } from '@/lib/games/types';
import type { Dictionary } from '@/lib/i18n/types';
import {
  BoardFrame,
  GameLayout,
  HintMarks,
  HintPanel,
  LevelPicker,
  MoveLog,
  Panel,
  ResultOverlay,
  SidePicker,
  StatusBar,
} from './shell';
import { useMatch } from './useMatch';

const COLS = 9;
const ROWS = 10;
const px = (c: number) => (100 * (c + 0.5)) / COLS;
const py = (r: number) => (100 * (r + 0.5)) / ROWS;

/** Cho (side 1) uses the green seal script, Han (side 2) the red. */
const LABEL: Record<number, [string, string]> = {
  [j.GENERAL]: ['楚', '漢'],
  [j.GUARD]: ['士', '士'],
  [j.ELEPHANT]: ['象', '象'],
  [j.HORSE]: ['馬', '馬'],
  [j.CHARIOT]: ['車', '車'],
  [j.CANNON]: ['包', '包'],
  [j.SOLDIER]: ['卒', '兵'],
};

const SIZE: Record<number, number> = {
  [j.GENERAL]: 1.18,
  [j.CHARIOT]: 1,
  [j.CANNON]: 1,
  [j.HORSE]: 0.94,
  [j.ELEPHANT]: 0.94,
  [j.GUARD]: 0.84,
  [j.SOLDIER]: 0.84,
};

export function JanggiGame({ dict, hubHref }: { dict: Dictionary; hubHref: string }) {
  const [setup, setSetup] = useState<j.Setup>('inner');
  const [from, setFrom] = useState<number | null>(null);

  const match = useMatch<j.JanggiState, j.JanggiMove>({
    game: 'janggi',
    create: useMemo(() => () => j.initial(setup), [setup]),
    apply: j.apply,
    outcome: j.outcome,
    turn: (s) => s.turn,
  });

  const { state, result, mySide, myTurn } = match;
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
  const check = useMemo(() => j.inCheck(state.board, state.turn), [state]);

  const onPoint = (i: number) => {
    if (!myTurn) return;
    if (from !== null && targets.has(i)) {
      match.play({ from, to: i });
      setFrom(null);
      return;
    }
    setFrom(movable.has(i) ? i : null);
  };

  const order = (i: number) => (flip ? ROWS * COLS - 1 - i : i);
  const cells = Array.from({ length: ROWS * COLS }, (_, k) => order(k));

  /** Board-relative percentage of an intersection, honouring the flip. */
  const at = (i: number): [number, number] => {
    const slot = order(i);
    return [px(slot % COLS), py(Math.floor(slot / COLS))];
  };
  const hintLabel = match.hint
    ? match.hint.from < 0
      ? dict.game.pass
      : `${LABEL[j.jType(state.board[match.hint.from])][j.jOwner(state.board[match.hint.from]) - 1]} ` +
        `${j.coordName(match.hint.from)}→${j.coordName(match.hint.to)}`
    : null;

  const capturedByMe = state.captured.filter((p) => j.jOwner(p) !== mySide);
  const capturedByAi = state.captured.filter((p) => j.jOwner(p) === mySide);

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
              <span className="chip">{mySide === 1 ? dict.game.cho : dict.game.han}</span>
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
                <g key={top} stroke="var(--wood-line)" strokeWidth="0.35" vectorEffect="non-scaling-stroke">
                  <line x1={px(3)} y1={py(top)} x2={px(5)} y2={py(top + 2)} />
                  <line x1={px(5)} y1={py(top)} x2={px(3)} y2={py(top + 2)} />
                </g>
              ))}
            </svg>

            {cells.map((i, slot) => {
              const r = Math.floor(i / COLS);
              const cIdx = i % COLS;
              const dr = Math.floor(slot / COLS);
              const dc = slot % COLS;
              const piece = state.board[i];
              const owner = piece ? j.jOwner(piece) : null;
              const isTarget = targets.has(i);
              const isFrom = from === i;
              const lastTo = state.last?.to === i;

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
                    <span className="pointer-events-none block h-[24%] w-[24%] rounded-full bg-[#3d2508]/45" />
                  )}
                  {piece !== 0 && owner && (
                    <span
                      className={`placed relative flex items-center justify-center rounded-[22%] border-2 font-bold leading-none transition-transform duration-200 ${
                        owner === 1
                          ? 'border-[#1f6f4f] text-[#155c40]'
                          : 'border-[#b83c2c] text-[#a8321f]'
                      } ${isFrom ? 'scale-110 ring-2 ring-[var(--color-gold-400)]' : ''} ${
                        lastTo ? 'last-move' : ''
                      } ${isTarget ? 'ring-2 ring-[var(--color-vermilion-500)]' : ''}`}
                      style={{
                        width: `${SIZE[j.jType(piece)] * 92}%`,
                        height: `${SIZE[j.jType(piece)] * 92}%`,
                        fontSize: `${(SIZE[j.jType(piece)] * 5.2).toFixed(2)}cqw`,
                        background:
                          'radial-gradient(circle at 34% 26%, #fdf4dd, #edd9ac 62%, #d8bd85)',
                        boxShadow: '0 3px 6px rgba(0,0,0,0.42)',
                        clipPath:
                          'polygon(28% 0,72% 0,100% 28%,100% 72%,72% 100%,28% 100%,0 72%,0 28%)',
                      }}
                    >
                      {LABEL[j.jType(piece)][owner - 1]}
                    </span>
                  )}
                </button>
              );
            })}

            {match.hint && match.hint.from >= 0 && (
              <HintMarks
                from={at(match.hint.from)}
                to={at(match.hint.to)}
                ratio={0.88}
                label={`${dict.game.hints.suggestion} ${hintLabel ?? ''}`}
              />
            )}
          </div>

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
            firstLabel={`${dict.game.cho} · ${dict.game.playFirst}`}
            secondLabel={`${dict.game.han} · ${dict.game.playSecond}`}
          />
          <div>
            <div className="eyebrow mb-2">{dict.game.setup}</div>
            <select
              value={setup}
              onChange={(e) => {
                const next = e.target.value as j.Setup;
                setSetup(next);
                setFrom(null);
                match.reset(j.initial(next));
              }}
              className="btn w-full cursor-pointer justify-between text-xs"
            >
              {(['inner', 'outer', 'left', 'right'] as j.Setup[]).map((s) => (
                <option key={s} value={s} className="bg-[var(--bg-elev)] text-[var(--fg)]">
                  {dict.game.setups[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button type="button" className="btn !px-2 text-xs" onClick={() => match.reset()}>
              {dict.game.newGame}
            </button>
            <button
              type="button"
              className="btn !px-2 text-xs"
              onClick={() => {
                setFrom(null);
                match.undo();
              }}
              disabled={!match.canUndo}
            >
              {dict.game.undo}
            </button>
            <button
              type="button"
              className="btn !px-2 text-xs"
              onClick={() => match.play({ from: -1, to: -1 })}
              disabled={!myTurn || check}
            >
              {dict.game.pass}
            </button>
          </div>
        </>
      }
      sidebar={
        <>
          <HintPanel dict={dict} controller={match} moveLabel={hintLabel} />
          <Panel title={dict.game.captured}>
            <div className="space-y-2">
              <CapturedRow pieces={capturedByMe} />
              <CapturedRow pieces={capturedByAi} />
            </div>
          </Panel>
          <MoveLog entries={state.log} title={dict.game.moveLog} />
        </>
      }
    />
  );
}

function CapturedRow({ pieces }: { pieces: number[] }) {
  if (pieces.length === 0) return <div className="min-h-6 text-xs opacity-50">—</div>;
  return (
    <div className="flex min-h-6 flex-wrap gap-1">
      {pieces.map((p, i) => (
        <span
          key={i}
          className={`inline-flex h-6 w-6 items-center justify-center rounded-[22%] border text-[0.7rem] font-bold ${
            j.jOwner(p) === 1
              ? 'border-[#1f6f4f]/60 text-[#1f6f4f]'
              : 'border-[#b83c2c]/60 text-[#b83c2c]'
          }`}
          style={{ background: 'radial-gradient(circle at 34% 26%, #fdf4dd, #e6d0a2)' }}
        >
          {LABEL[j.jType(p)][j.jOwner(p) - 1]}
        </span>
      ))}
    </div>
  );
}
