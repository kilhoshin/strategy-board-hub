'use client';

import { useEffect, useMemo, useState } from 'react';
import * as j from '@/lib/games/janggi';
import type { Side } from '@/lib/games/types';
import type { Dictionary } from '@/lib/i18n/types';
import {
  JanggiChip,
  JanggiPiece,
  LETTER,
  PIECE_KEY,
  PIECE_ORDER,
  SIZE,
  type ColorScheme,
  type PieceStyle,
} from './JanggiPiece';
import {
  BoardFrame,
  GameLayout,
  HintMarks,
  HintPanel,
  LevelPicker,
  MoveLog,
  Panel,
  ResultOverlay,
  SegmentedControl,
  SidePicker,
  StatusBar,
} from './shell';
import { useMatch } from './useMatch';

const COLS = 9;
const ROWS = 10;
const px = (c: number) => (100 * (c + 0.5)) / COLS;
const py = (r: number) => (100 * (r + 0.5)) / ROWS;
/** Inner board is inset 6% horizontally and 5% vertically of a 9:10 frame. */
const BOARD_RATIO = 0.88;

const STYLE_KEY = 'sbh-janggi-style';
const COLOR_KEY = 'sbh-janggi-colors';

export function JanggiGame({ dict, hubHref }: { dict: Dictionary; hubHref: string }) {
  const [setup, setSetup] = useState<j.Setup>('inner');
  const [from, setFrom] = useState<number | null>(null);
  const [style, setStyle] = useState<PieceStyle>(dict.game.defaultPieceStyle);
  const [scheme, setScheme] = useState<ColorScheme>('traditional');

  // Presentation is a personal preference, so it outlives the session.
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
  /** Pieces that are shutting down a leg of the selected horse or elephant. */
  const blockers = useMemo(
    () => (from === null ? new Set<number>() : new Set(j.blockedLegs(state.board, from))),
    [state.board, from],
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

  const at = (i: number): [number, number] => {
    const slot = order(i);
    return [px(slot % COLS), py(Math.floor(slot / COLS))];
  };

  const nameOf = (piece: number) => {
    const key = PIECE_KEY[j.jType(piece)];
    if (!key) return '';
    return style === 'letter' ? LETTER[j.jType(piece)] : dict.game.pieces[key].name;
  };

  const hintLabel = match.hint
    ? match.hint.from < 0
      ? dict.game.pass
      : `${nameOf(state.board[match.hint.from])} ${j.coordName(match.hint.from)}→${j.coordName(match.hint.to)}`
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

                  {/* The blocked leg (멱): the point stopping a horse or
                      elephant. Western players consistently miss this, so it is
                      marked explicitly — as a corner badge, so the piece it
                      sits on stays readable. */}
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

            {match.hint && match.hint.from >= 0 && (
              <HintMarks
                from={at(match.hint.from)}
                to={at(match.hint.to)}
                ratio={BOARD_RATIO}
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

          <Panel title={dict.game.legend}>
            <ul className="space-y-2.5">
              {PIECE_ORDER.map((type) => {
                const key = PIECE_KEY[type];
                return (
                  <li key={type} className="flex gap-2.5">
                    <JanggiChip
                      piece={type | (mySide === 2 ? 8 : 0)}
                      style={style}
                      scheme={scheme}
                    />
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
            <p className="mt-3 border-t border-[var(--hairline)] pt-3 text-[0.7rem] leading-relaxed text-[var(--fg-muted)]">
              {dict.game.blockedNote}
            </p>
          </Panel>

          <Panel title={dict.game.captured}>
            <div className="space-y-2">
              <CapturedRow pieces={capturedByMe} style={style} scheme={scheme} />
              <CapturedRow pieces={capturedByAi} style={style} scheme={scheme} />
            </div>
          </Panel>

          <MoveLog entries={state.log} title={dict.game.moveLog} />
        </>
      }
    />
  );
}

function CapturedRow({
  pieces,
  style,
  scheme,
}: {
  pieces: number[];
  style: PieceStyle;
  scheme: ColorScheme;
}) {
  if (pieces.length === 0) return <div className="min-h-7 text-xs opacity-50">—</div>;
  return (
    <div className="flex min-h-7 flex-wrap gap-1">
      {pieces.map((p, i) => (
        <JanggiChip key={i} piece={p} style={style} scheme={scheme} className="!h-6 !w-6" />
      ))}
    </div>
  );
}
