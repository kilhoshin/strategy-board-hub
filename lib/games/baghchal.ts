import { LIVE, Level, Outcome, Side, TIME_BUDGET, other } from './types';

export const SIZE = 5;
const N = 25;

const GOAT: Side = 1;
const TIGER: Side = 2;
const TOTAL_GOATS = 20;
const GOATS_TO_WIN = 5;

/**
 * The 25-point Bagh-Chal board (same graph as the Alquerque board): every
 * point's orthogonal/diagonal neighbours, plus — for tigers only — the
 * landing point of a jump-capture over each neighbour and the goat square
 * that jump passes over. This isn't derivable from the plain-English rules;
 * it's transcribed from a tested reference implementation
 * (github.com/basnetsoyuj/baghchal) and verified here to be symmetric.
 */
const ADJ: number[][] = [
  [1, 5, 6],
  [0, 2, 6],
  [1, 3, 6, 7, 8],
  [2, 4, 8],
  [3, 8, 9],
  [0, 6, 10],
  [0, 1, 2, 5, 7, 10, 11, 12],
  [2, 6, 8, 12],
  [2, 3, 4, 7, 9, 12, 13, 14],
  [4, 8, 14],
  [5, 6, 11, 15, 16],
  [6, 10, 12, 16],
  [6, 7, 8, 11, 13, 16, 17, 18],
  [8, 12, 14, 18],
  [8, 9, 13, 18, 19],
  [10, 16, 20],
  [10, 11, 12, 15, 17, 20, 21, 22],
  [12, 16, 18, 22],
  [12, 13, 14, 17, 19, 22, 23, 24],
  [14, 18, 24],
  [15, 16, 21],
  [16, 20, 22],
  [16, 17, 18, 21, 23],
  [18, 22, 24],
  [18, 19, 23],
];

const JUMPS: { to: number; mid: number }[][] = [
  [{ to: 2, mid: 1 }, { to: 10, mid: 5 }, { to: 12, mid: 6 }],
  [{ to: 3, mid: 2 }, { to: 11, mid: 6 }],
  [{ to: 0, mid: 1 }, { to: 4, mid: 3 }, { to: 10, mid: 6 }, { to: 12, mid: 7 }, { to: 14, mid: 8 }],
  [{ to: 1, mid: 2 }, { to: 13, mid: 8 }],
  [{ to: 2, mid: 3 }, { to: 12, mid: 8 }, { to: 14, mid: 9 }],
  [{ to: 7, mid: 6 }, { to: 15, mid: 10 }],
  [{ to: 8, mid: 7 }, { to: 16, mid: 11 }, { to: 18, mid: 12 }],
  [{ to: 5, mid: 6 }, { to: 9, mid: 8 }, { to: 17, mid: 12 }],
  [{ to: 6, mid: 7 }, { to: 16, mid: 12 }, { to: 18, mid: 13 }],
  [{ to: 7, mid: 8 }, { to: 19, mid: 14 }],
  [{ to: 0, mid: 5 }, { to: 2, mid: 6 }, { to: 12, mid: 11 }, { to: 20, mid: 15 }, { to: 22, mid: 16 }],
  [{ to: 1, mid: 6 }, { to: 13, mid: 12 }, { to: 21, mid: 16 }],
  [
    { to: 0, mid: 6 },
    { to: 2, mid: 7 },
    { to: 4, mid: 8 },
    { to: 10, mid: 11 },
    { to: 14, mid: 13 },
    { to: 20, mid: 16 },
    { to: 22, mid: 17 },
    { to: 24, mid: 18 },
  ],
  [{ to: 3, mid: 8 }, { to: 11, mid: 12 }, { to: 23, mid: 18 }],
  [{ to: 2, mid: 8 }, { to: 4, mid: 9 }, { to: 12, mid: 13 }, { to: 22, mid: 18 }, { to: 24, mid: 19 }],
  [{ to: 5, mid: 10 }, { to: 17, mid: 16 }],
  [{ to: 6, mid: 11 }, { to: 8, mid: 12 }, { to: 18, mid: 17 }],
  [{ to: 7, mid: 12 }, { to: 15, mid: 16 }, { to: 19, mid: 18 }],
  [{ to: 6, mid: 12 }, { to: 8, mid: 13 }, { to: 16, mid: 17 }],
  [{ to: 9, mid: 14 }, { to: 17, mid: 18 }],
  [{ to: 10, mid: 15 }, { to: 12, mid: 16 }, { to: 22, mid: 21 }],
  [{ to: 11, mid: 16 }, { to: 23, mid: 22 }],
  [{ to: 10, mid: 16 }, { to: 12, mid: 17 }, { to: 14, mid: 18 }, { to: 20, mid: 21 }, { to: 24, mid: 23 }],
  [{ to: 13, mid: 18 }, { to: 21, mid: 22 }],
  [{ to: 12, mid: 18 }, { to: 14, mid: 19 }, { to: 22, mid: 23 }],
];

/** Every board edge once, (lower, higher) index — for drawing the lattice. */
export const EDGES: [number, number][] = ADJ.flatMap((neighbours, i) =>
  neighbours.filter((j) => j > i).map((j): [number, number] => [i, j]),
);

export interface BaghchalMove {
  /** null = placing a new goat (only legal while goatsPlaced < 20). */
  from: number | null;
  to: number;
  /** Square of the goat captured by a tiger's jump, if any. */
  capture: number | null;
}

export interface BaghchalState {
  board: number[]; // 0 empty, 1 goat, 2 tiger
  turn: Side; // 1 = goat (moves/places first), 2 = tiger
  goatsPlaced: number; // 0..20
  goatsCaptured: number; // 0..5
  last: BaghchalMove | null;
  /** Position fingerprints, oldest first — powers the threefold-repetition draw. */
  posLog: string[];
}

export function initial(): BaghchalState {
  const board = new Array(N).fill(0);
  board[0] = TIGER;
  board[4] = TIGER;
  board[20] = TIGER;
  board[24] = TIGER;
  return { board, turn: GOAT, goatsPlaced: 0, goatsCaptured: 0, last: null, posLog: [] };
}

function fingerprint(board: number[], turn: Side, goatsPlaced: number, goatsCaptured: number): string {
  return `${board.join('')}|${turn}|${goatsPlaced}|${goatsCaptured}`;
}

function tigerMovesFrom(board: number[], t: number): BaghchalMove[] {
  const out: BaghchalMove[] = [];
  for (const a of ADJ[t]) if (board[a] === 0) out.push({ from: t, to: a, capture: null });
  for (const j of JUMPS[t]) {
    if (board[j.to] === 0 && board[j.mid] === GOAT) out.push({ from: t, to: j.to, capture: j.mid });
  }
  return out;
}

export function legalMoves(state: {
  board: number[];
  turn: Side;
  goatsPlaced: number;
}): BaghchalMove[] {
  const { board, turn, goatsPlaced } = state;
  const out: BaghchalMove[] = [];
  if (turn === GOAT) {
    if (goatsPlaced < TOTAL_GOATS) {
      for (let i = 0; i < N; i++) if (board[i] === 0) out.push({ from: null, to: i, capture: null });
      return out;
    }
    for (let i = 0; i < N; i++) {
      if (board[i] !== GOAT) continue;
      for (const a of ADJ[i]) if (board[a] === 0) out.push({ from: i, to: a, capture: null });
    }
    return out;
  }
  for (let i = 0; i < N; i++) if (board[i] === TIGER) out.push(...tigerMovesFrom(board, i));
  return out;
}

export function apply(state: BaghchalState, move: BaghchalMove): BaghchalState {
  const board = state.board.slice();
  let goatsPlaced = state.goatsPlaced;
  let goatsCaptured = state.goatsCaptured;

  if (move.from === null) {
    board[move.to] = GOAT;
    goatsPlaced++;
  } else {
    board[move.to] = board[move.from];
    board[move.from] = 0;
    if (move.capture !== null) {
      board[move.capture] = 0;
      goatsCaptured++;
    }
  }

  const turn = other(state.turn);
  return {
    board,
    turn,
    goatsPlaced,
    goatsCaptured,
    last: move,
    posLog: [...state.posLog, fingerprint(board, turn, goatsPlaced, goatsCaptured)],
  };
}

function tigersHaveNoMoves(board: number[]): boolean {
  for (let i = 0; i < N; i++) {
    if (board[i] === TIGER && tigerMovesFrom(board, i).length > 0) return false;
  }
  return true;
}

export function outcome(state: BaghchalState): Outcome {
  if (state.goatsCaptured >= GOATS_TO_WIN) {
    return { over: true, winner: TIGER, reason: 'goatsCaptured' };
  }
  // Checked unconditionally (not just on tigers' turn): a goat move that
  // simultaneously immobilises every tiger ends the game right there.
  if (tigersHaveNoMoves(state.board)) {
    return { over: true, winner: GOAT, reason: 'tigersTrapped' };
  }
  if (state.turn === GOAT && legalMoves(state).length === 0) {
    return { over: true, winner: TIGER, reason: 'goatsTrapped' };
  }
  const key = state.posLog[state.posLog.length - 1];
  if (key !== undefined && state.posLog.filter((k) => k === key).length >= 3) {
    return { over: true, winner: 0, reason: 'repetition' };
  }
  return LIVE;
}

/* ------------------------------- evaluation ------------------------------ */

const WIN_SCORE = 1_000_000;

/** Always scored from the tiger's point of view; negated for the goat side. */
function evaluateForTiger(board: number[], goatsCaptured: number): number {
  let mobility = 0;
  let threats = 0;
  let tigerCount = 0;
  let goatsOnBoard = 0;
  for (let i = 0; i < N; i++) {
    if (board[i] === GOAT) {
      goatsOnBoard++;
      continue;
    }
    if (board[i] !== TIGER) continue;
    tigerCount++;
    for (const a of ADJ[i]) if (board[a] === 0) mobility++;
    for (const j of JUMPS[i]) {
      if (board[j.to] === 0 && board[j.mid] === GOAT) {
        mobility += 2;
        threats++;
      }
    }
  }
  if (tigerCount > 0 && mobility === 0) return -WIN_SCORE + 1; // every tiger blocked
  return goatsCaptured * 900 + threats * 70 + mobility * 12 - goatsOnBoard * 4;
}

function evaluate(state: { board: number[]; goatsCaptured: number }, me: Side): number {
  const score = evaluateForTiger(state.board, state.goatsCaptured);
  return me === TIGER ? score : -score;
}

/* -------------------------------- search ------------------------------- */

const TIMEOUT = Symbol('timeout');

function negamax(
  state: BaghchalState,
  me: Side,
  depth: number,
  ply: number,
  alpha: number,
  beta: number,
  deadline: number,
): number {
  const o = outcome(state);
  if (o.over) {
    if (o.winner === 0) return 0;
    return o.winner === me ? WIN_SCORE - ply : -(WIN_SCORE - ply);
  }
  if (depth === 0) return evaluate(state, me);
  if (Date.now() > deadline) throw TIMEOUT;

  const moves = legalMoves(state);
  // Try captures first — by far the strongest tiger moves, and worth
  // considering early for goats too (best alpha-beta cuts from the AI's pov).
  moves.sort((a, b) => (b.capture !== null ? 1 : 0) - (a.capture !== null ? 1 : 0));

  let best = -Infinity;
  for (const m of moves) {
    const next = apply(state, m);
    const v = -negamax(next, other(me), depth - 1, ply + 1, -beta, -alpha, deadline);
    if (v > best) best = v;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

const MAX_DEPTH: Record<Level, number> = { 1: 1, 2: 3, 3: 5, 4: 7 };

export function bestMove(state: BaghchalState, level: Level = 3): BaghchalMove | null {
  const moves = legalMoves(state);
  if (moves.length === 0) return null;
  if (moves.length === 1) return moves[0];

  const me = state.turn;

  if (level === 1) {
    // Beginner: leans on captures when available, otherwise plays loosely at random.
    const captures = moves.filter((m) => m.capture !== null);
    const pool = captures.length && Math.random() < 0.6 ? captures : moves;
    return pool[(Math.random() * pool.length) | 0];
  }

  const deadline = Date.now() + TIME_BUDGET[level];
  let chosen = moves[0];
  let order = moves;

  for (let depth = 2; depth <= MAX_DEPTH[level]; depth++) {
    let alpha = -Infinity;
    let localBest = order[0];
    const scored: { m: BaghchalMove; v: number }[] = [];
    try {
      for (const m of order) {
        const next = apply(state, m);
        const v = -negamax(next, other(me), depth - 1, 1, -Infinity, -alpha, deadline);
        scored.push({ m, v });
        if (v > alpha) {
          alpha = v;
          localBest = m;
        }
      }
    } catch (e) {
      if (e !== TIMEOUT) throw e;
      break;
    }
    chosen = localBest;
    scored.sort((a, b) => b.v - a.v);
    order = scored.map((s) => s.m);
    if (alpha >= WIN_SCORE - 100) break; // forced win found
    if (Date.now() > deadline) break;
  }

  return chosen;
}
