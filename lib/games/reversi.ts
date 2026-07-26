import { LIVE, Level, Outcome, Side, TIME_BUDGET, other } from './types';

export const SIZE = 8;
const CELLS = 64;

export interface ReversiState {
  board: number[]; // 0 empty, 1 black, 2 white
  turn: Side;
  last: number | null;
  /** True when the previous side had to pass — the UI surfaces this. */
  passed: boolean;
}

export function initial(): ReversiState {
  const board = new Array(CELLS).fill(0);
  board[27] = 2;
  board[28] = 1;
  board[35] = 1;
  board[36] = 2;
  return { board, turn: 1, last: null, passed: false };
}

const DIRS: readonly (readonly [number, number])[] = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

/** Pre-computed ray of cells in each direction, so we never index off the edge. */
const RAYS: number[][][] = Array.from({ length: CELLS }, (_, i) => {
  const r = i >> 3;
  const c = i & 7;
  return DIRS.map(([dr, dc]) => {
    const ray: number[] = [];
    let nr = r + dr;
    let nc = c + dc;
    while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      ray.push(nr * 8 + nc);
      nr += dr;
      nc += dc;
    }
    return ray;
  });
});

export function flipsFor(board: ArrayLike<number>, pos: number, p: Side): number[] {
  if (board[pos] !== 0) return [];
  const opp = other(p);
  const out: number[] = [];
  const rays = RAYS[pos];
  for (let d = 0; d < 8; d++) {
    const ray = rays[d];
    let k = 0;
    while (k < ray.length && board[ray[k]] === opp) k++;
    if (k > 0 && k < ray.length && board[ray[k]] === p) {
      for (let j = 0; j < k; j++) out.push(ray[j]);
    }
  }
  return out;
}

export function legalMoves(state: { board: number[]; turn: Side }): number[] {
  const out: number[] = [];
  for (let i = 0; i < CELLS; i++) if (flipsFor(state.board, i, state.turn).length) out.push(i);
  return out;
}

export function counts(board: ArrayLike<number>) {
  let black = 0;
  let white = 0;
  for (let i = 0; i < CELLS; i++) {
    if (board[i] === 1) black++;
    else if (board[i] === 2) white++;
  }
  return { black, white, empty: CELLS - black - white };
}

export function apply(state: ReversiState, move: number): ReversiState {
  const board = state.board.slice();
  const flips = flipsFor(board, move, state.turn);
  board[move] = state.turn;
  for (const f of flips) board[f] = state.turn;
  const next = other(state.turn);
  const hasMove = legalMoves({ board, turn: next }).length > 0;
  return {
    board,
    turn: hasMove ? next : state.turn,
    last: move,
    passed: !hasMove,
  };
}

export function outcome(state: ReversiState): Outcome {
  const mine = legalMoves(state).length;
  if (mine > 0) return LIVE;
  const opp = legalMoves({ board: state.board, turn: other(state.turn) }).length;
  if (opp > 0) return LIVE;
  const { black, white } = counts(state.board);
  if (black === white) return { over: true, winner: 0, reason: 'discs' };
  return { over: true, winner: black > white ? 1 : 2, reason: 'discs' };
}

/* ------------------------------ evaluation ----------------------------- */

const SQUARE = [
  120, -20, 20, 5, 5, 20, -20, 120, -20, -40, -5, -5, -5, -5, -40, -20, 20, -5, 15, 3, 3, 15, -5,
  20, 5, -5, 3, 3, 3, 3, -5, 5, 5, -5, 3, 3, 3, 3, -5, 5, 20, -5, 15, 3, 3, 15, -5, 20, -20, -40,
  -5, -5, -5, -5, -40, -20, 120, -20, 20, 5, 5, 20, -20, 120,
];

const CORNERS = [0, 7, 56, 63];

function countMoves(board: Int8Array, p: Side) {
  let n = 0;
  for (let i = 0; i < CELLS; i++) if (board[i] === 0 && flipsFor(board, i, p).length) n++;
  return n;
}

/** Discs on a corner-anchored edge run can never be flipped again. */
function stableDiscs(board: Int8Array, p: Side) {
  let n = 0;
  const edges: number[][] = [
    [0, 1, 2, 3, 4, 5, 6, 7],
    [56, 57, 58, 59, 60, 61, 62, 63],
    [0, 8, 16, 24, 32, 40, 48, 56],
    [7, 15, 23, 31, 39, 47, 55, 63],
  ];
  for (const edge of edges) {
    for (let k = 0; k < 8 && board[edge[k]] === p; k++) n++;
    for (let k = 7; k >= 0 && board[edge[k]] === p; k--) n++;
  }
  return n;
}

function evaluate(board: Int8Array, me: Side, empty: number): number {
  const opp = other(me);
  let disc = 0;
  let pos = 0;
  let mine = 0;
  let theirs = 0;
  for (let i = 0; i < CELLS; i++) {
    const v = board[i];
    if (v === 0) continue;
    if (v === me) {
      mine++;
      pos += SQUARE[i];
    } else {
      theirs++;
      pos -= SQUARE[i];
    }
  }
  disc = mine - theirs;

  if (empty === 0) return disc * 100000;

  let corner = 0;
  for (const c of CORNERS) {
    if (board[c] === me) corner += 100;
    else if (board[c] === opp) corner -= 100;
  }

  const mob = countMoves(board, me) - countMoves(board, opp);
  const stable = stableDiscs(board, me) - stableDiscs(board, opp);

  // Discs only start mattering once the board is nearly settled.
  const discWeight = empty > 20 ? 0 : empty > 10 ? 8 : 30;
  return pos + corner * 6 + mob * 18 + stable * 14 + disc * discWeight;
}

/* -------------------------------- search ------------------------------- */

const TIMEOUT = Symbol('timeout');

function applyFast(board: Int8Array, move: number, p: Side): number[] {
  const flips = flipsFor(board, move, p);
  board[move] = p;
  for (const f of flips) board[f] = p;
  return flips;
}

function undoFast(board: Int8Array, move: number, flips: number[], p: Side) {
  const opp = other(p);
  board[move] = 0;
  for (const f of flips) board[f] = opp;
}

function search(
  board: Int8Array,
  me: Side,
  depth: number,
  alpha: number,
  beta: number,
  passes: number,
  empty: number,
  deadline: number,
): number {
  if (Date.now() > deadline) throw TIMEOUT;
  if (passes >= 2 || empty === 0) {
    let d = 0;
    for (let i = 0; i < CELLS; i++) if (board[i]) d += board[i] === me ? 1 : -1;
    return d * 100000;
  }
  if (depth === 0) return evaluate(board, me, empty);

  const moves: number[] = [];
  for (let i = 0; i < CELLS; i++) if (board[i] === 0 && flipsFor(board, i, me).length) moves.push(i);

  if (moves.length === 0) {
    return -search(board, other(me), depth, -beta, -alpha, passes + 1, empty, deadline);
  }

  moves.sort((a, b) => SQUARE[b] - SQUARE[a]);

  let best = -Infinity;
  for (const m of moves) {
    const flips = applyFast(board, m, me);
    const v = -search(board, other(me), depth - 1, -beta, -alpha, 0, empty - 1, deadline);
    undoFast(board, m, flips, me);
    if (v > best) best = v;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

const MAX_DEPTH: Record<Level, number> = { 1: 1, 2: 3, 3: 8, 4: 14 };
/** Empty-square count at which we switch to a full solve to the last disc. */
const EXACT_AT: Record<Level, number> = { 1: 0, 2: 6, 3: 12, 4: 18 };

export function bestMove(state: ReversiState, level: Level = 3): number | null {
  const moves = legalMoves(state);
  if (moves.length === 0) return null;
  if (moves.length === 1) return moves[0];

  const me = state.turn;
  const board = Int8Array.from(state.board);
  const { empty } = counts(board);

  if (level === 1) {
    // Greedy-ish beginner: prefers corners, otherwise picks loosely at random.
    const ranked = [...moves].sort((a, b) => SQUARE[b] - SQUARE[a]);
    const pool = ranked.slice(0, Math.max(1, Math.ceil(ranked.length / 2)));
    return pool[(Math.random() * pool.length) | 0];
  }

  const deadline = Date.now() + TIME_BUDGET[level];
  const exact = empty <= EXACT_AT[level];
  const target = exact ? empty : MAX_DEPTH[level];

  let chosen = moves[0];
  let order = [...moves].sort((a, b) => SQUARE[b] - SQUARE[a]);

  for (let depth = 2; depth <= target; depth++) {
    let alpha = -Infinity;
    let localBest = order[0];
    const scored: { m: number; v: number }[] = [];
    try {
      for (const m of order) {
        const flips = applyFast(board, m, me);
        const v = -search(board, other(me), depth - 1, -Infinity, -alpha, 0, empty - 1, deadline);
        undoFast(board, m, flips, me);
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
    if (Date.now() > deadline) break;
  }

  return chosen;
}
