import { LIVE, Level, Outcome, Side, TIME_BUDGET, other } from './types';

/* ------------------------------------------------------------------ *
 * Xiangqi (Chinese chess). 9 files x 10 ranks, index = row * 9 + col.
 * Row 0 is the top (Black, side 2); row 9 is the bottom (Red, side 1),
 * and Red moves first. Piece = type | (side 2 ? 8 : 0).
 *
 * Geometrically this is the same 9x10 palace-and-point board as Janggi
 * (see lib/games/janggi.ts), which is why the palace/board helpers below
 * are structurally identical to that file. The pieces themselves move
 * differently: the General/Advisor never leave the palace diagonals are
 * for the Advisor only, the Elephant cannot cross the river, the Cannon
 * may freely jump another cannon, and Soldiers gain sideways movement
 * only after crossing the river.
 * ------------------------------------------------------------------ */

export const COLS = 9;
export const ROWS = 10;
const CELLS = 90;

export const GENERAL = 1; // 帥/將
export const ADVISOR = 2; // 仕/士
export const ELEPHANT = 3; // 相/象
export const HORSE = 4; // 馬
export const CHARIOT = 5; // 俥/車
export const CANNON = 6; // 炮/包
export const SOLDIER = 7; // 兵/卒

export const xType = (p: number) => p & 7;
export const xOwner = (p: number): Side => ((p & 8) === 0 ? 1 : 2);

export interface XiangqiMove {
  from: number;
  to: number;
}

export interface XiangqiState {
  board: number[];
  turn: Side;
  last: XiangqiMove | null;
  captured: number[];
  quiet: number; // plies since the last capture
  log: string[];
}

/** The one traditional back-rank arrangement. */
const BACK_RANK = [CHARIOT, HORSE, ELEPHANT, ADVISOR, 0, ADVISOR, ELEPHANT, HORSE, CHARIOT];

export function initial(): XiangqiState {
  const board = new Array(CELLS).fill(0);
  for (let c = 0; c < COLS; c++) {
    if (BACK_RANK[c]) {
      board[0 * COLS + c] = BACK_RANK[c] | 8;
      board[9 * COLS + c] = BACK_RANK[c];
    }
  }
  board[1 * COLS + 4] = GENERAL | 8;
  board[8 * COLS + 4] = GENERAL;
  board[2 * COLS + 1] = CANNON | 8;
  board[2 * COLS + 7] = CANNON | 8;
  board[7 * COLS + 1] = CANNON;
  board[7 * COLS + 7] = CANNON;
  for (const c of [0, 2, 4, 6, 8]) {
    board[3 * COLS + c] = SOLDIER | 8;
    board[6 * COLS + c] = SOLDIER;
  }
  return { board, turn: 1, last: null, captured: [], quiet: 0, log: [] };
}

/* -------------------------- board geometry -------------------------- */

const row = (i: number) => (i / COLS) | 0;
const col = (i: number) => i % COLS;
const at = (r: number, c: number) => (r < 0 || r >= ROWS || c < 0 || c >= COLS ? -1 : r * COLS + c);

export const inPalace = (i: number) => {
  const r = row(i);
  const c = col(i);
  return c >= 3 && c <= 5 && (r <= 2 || r >= 7);
};

/** Palace diagonal graph: corner <-> centre for both palaces — the Advisor's lines. */
export const PALACE_DIAG: Record<number, number[]> = {
  3: [13],
  5: [13],
  13: [3, 5, 21, 23],
  21: [13],
  23: [13],
  66: [76],
  68: [76],
  76: [66, 68, 84, 86],
  84: [76],
  86: [76],
};

const HORSE_LEGS: { block: [number, number]; steps: [number, number][] }[] = [
  { block: [-1, 0], steps: [[-2, -1], [-2, 1]] },
  { block: [1, 0], steps: [[2, -1], [2, 1]] },
  { block: [0, -1], steps: [[-1, -2], [1, -2]] },
  { block: [0, 1], steps: [[-1, 2], [1, 2]] },
];

/** Each diagonal direction: the "eye" that must be empty, and the landing square two points out. */
const ELEPHANT_LEGS: [number, number][] = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
];

function samePalace(a: number, b: number) {
  return row(a) <= 4 === row(b) <= 4;
}

/** Pseudo-legal destinations for the piece on `from`, appended to `out`. */
function collect(b: ArrayLike<number>, from: number, out: number[]): number[] {
  const p = b[from];
  if (!p) return out;
  const me = xOwner(p);
  const ty = xType(p);
  const r = row(from);
  const c = col(from);
  const add = (to: number) => {
    if (to < 0) return;
    const t = b[to];
    if (t && xOwner(t) === me) return;
    out.push(to);
  };

  switch (ty) {
    case GENERAL: {
      for (const [dr, dc] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]) {
        const to = at(r + dr, c + dc);
        if (to >= 0 && inPalace(to) && samePalace(from, to)) add(to);
      }
      break;
    }

    case ADVISOR: {
      for (const to of PALACE_DIAG[from] ?? []) add(to);
      break;
    }

    case SOLDIER: {
      const crossed = me === 1 ? r <= 4 : r >= 5;
      const fwd = me === 1 ? -1 : 1;
      add(at(r + fwd, c));
      if (crossed) {
        add(at(r, c - 1));
        add(at(r, c + 1));
      }
      break;
    }

    case HORSE: {
      for (const leg of HORSE_LEGS) {
        const blk = at(r + leg.block[0], c + leg.block[1]);
        if (blk < 0 || b[blk]) continue;
        for (const [dr, dc] of leg.steps) add(at(r + dr, c + dc));
      }
      break;
    }

    case ELEPHANT: {
      for (const [dr, dc] of ELEPHANT_LEGS) {
        const eye = at(r + dr, c + dc);
        if (eye < 0 || b[eye]) continue;
        const toR = r + 2 * dr;
        const toC = c + 2 * dc;
        if (r <= 4 !== toR <= 4) continue; // may never cross the river
        add(at(toR, toC));
      }
      break;
    }

    case CHARIOT: {
      for (const [dr, dc] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]) {
        let nr = r + dr;
        let nc = c + dc;
        let to = at(nr, nc);
        while (to >= 0) {
          if (b[to]) {
            if (xOwner(b[to]) !== me) out.push(to);
            break;
          }
          out.push(to);
          nr += dr;
          nc += dc;
          to = at(nr, nc);
        }
      }
      break;
    }

    case CANNON: {
      for (const [dr, dc] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]) {
        let nr = r + dr;
        let nc = c + dc;
        let to = at(nr, nc);
        let screen = -1;
        while (to >= 0) {
          const t = b[to];
          if (screen < 0) {
            if (t) screen = to;
            else out.push(to);
          } else if (t) {
            if (xOwner(t) !== me) out.push(to);
            break;
          }
          nr += dr;
          nc += dc;
          to = at(nr, nc);
        }
      }
      break;
    }
  }

  return out;
}

export function movesFrom(b: ArrayLike<number>, from: number): number[] {
  return collect(b, from, []);
}

/** Reused across the search so move generation never allocates. */
const scratch: number[] = [];

function moveCount(b: ArrayLike<number>, from: number) {
  scratch.length = 0;
  collect(b, from, scratch);
  return scratch.length;
}

function generalSquare(b: ArrayLike<number>, side: Side) {
  const want = side === 1 ? GENERAL : GENERAL | 8;
  for (let i = 0; i < CELLS; i++) if (b[i] === want) return i;
  return -1;
}

export function isAttacked(b: ArrayLike<number>, sq: number, by: Side) {
  for (let i = 0; i < CELLS; i++) {
    const p = b[i];
    if (!p || xOwner(p) !== by) continue;
    scratch.length = 0;
    collect(b, i, scratch);
    for (let k = 0; k < scratch.length; k++) if (scratch[k] === sq) return true;
  }
  return false;
}

export function inCheck(b: ArrayLike<number>, side: Side) {
  const g = generalSquare(b, side);
  return g >= 0 && isAttacked(b, g, other(side));
}

/**
 * The "flying general" rule: the two generals may never face each other down
 * an open file with nothing between them. Unlike Janggi's bikjang, this is
 * not a draw — it makes the move that produces it illegal outright, exactly
 * like leaving your own general in check.
 */
export function generalsFacing(b: ArrayLike<number>) {
  const g1 = generalSquare(b, 1);
  const g2 = generalSquare(b, 2);
  if (g1 < 0 || g2 < 0) return false;
  if (col(g1) !== col(g2)) return false;
  const c = col(g1);
  const lo = Math.min(row(g1), row(g2));
  const hi = Math.max(row(g1), row(g2));
  for (let r = lo + 1; r < hi; r++) if (b[r * COLS + c]) return false;
  return true;
}

export function legalMoves(state: XiangqiState): XiangqiMove[] {
  const out: XiangqiMove[] = [];
  const b = state.board;
  for (let i = 0; i < CELLS; i++) {
    const p = b[i];
    if (!p || xOwner(p) !== state.turn) continue;
    for (const to of movesFrom(b, i)) {
      const saved = b[to];
      (b as number[])[to] = p;
      (b as number[])[i] = 0;
      const ok = !inCheck(b, state.turn) && !generalsFacing(b);
      (b as number[])[i] = p;
      (b as number[])[to] = saved;
      if (ok) out.push({ from: i, to });
    }
  }
  return out;
}

export function apply(state: XiangqiState, move: XiangqiMove): XiangqiState {
  const board = state.board.slice();
  const taken = board[move.to];
  board[move.to] = board[move.from];
  board[move.from] = 0;
  return {
    board,
    turn: other(state.turn),
    last: move,
    captured: taken ? [...state.captured, taken] : state.captured,
    quiet: taken ? 0 : state.quiet + 1,
    log: [...state.log, `${coordName(move.from)}${taken ? 'x' : '-'}${coordName(move.to)}`],
  };
}

export function coordName(i: number) {
  return `${col(i) + 1}${ROWS - row(i)}`;
}

export function outcome(state: XiangqiState): Outcome {
  const moves = legalMoves(state);
  if (moves.length === 0) {
    return {
      over: true,
      winner: other(state.turn),
      reason: inCheck(state.board, state.turn) ? 'checkmate' : 'noMoves',
    };
  }
  if (state.quiet >= 120) return { over: true, winner: 0, reason: 'quiet' };
  return LIVE;
}

/* ------------------------------ evaluation ----------------------------- */

const VALUE: Record<number, number> = {
  [GENERAL]: 0,
  [ADVISOR]: 200,
  [ELEPHANT]: 200,
  [HORSE]: 420,
  [CHARIOT]: 950,
  [CANNON]: 450,
  [SOLDIER]: 100,
};

/** Soldiers gain value after crossing the river, and again deep in enemy territory. */
function soldierBonus(i: number, side: Side) {
  const r = row(i);
  const crossed = side === 1 ? r <= 4 : r >= 5;
  if (!crossed) return 0;
  const depth = side === 1 ? 4 - r : r - 5;
  return 60 + depth * 22;
}

function evaluate(b: Int8Array, me: Side): number {
  let score = 0;
  for (let i = 0; i < CELLS; i++) {
    const p = b[i];
    if (!p) continue;
    const side = xOwner(p);
    const sign = side === me ? 1 : -1;
    const ty = xType(p);
    let v = VALUE[ty];
    if (ty === SOLDIER) v += soldierBonus(i, side);
    else if (ty === CHARIOT || ty === CANNON || ty === HORSE) v += moveCount(b, i) * 5;
    score += sign * v;
  }
  return score;
}

/* -------------------------------- search ------------------------------- */

const TIMEOUT = Symbol('timeout');
const MATE = 200000;

interface Ply {
  from: number;
  to: number;
  taken: number;
}

function genPseudo(b: Int8Array, side: Side): Ply[] {
  const out: Ply[] = [];
  for (let i = 0; i < CELLS; i++) {
    const p = b[i];
    if (!p || xOwner(p) !== side) continue;
    for (const to of movesFrom(b, i)) out.push({ from: i, to, taken: b[to] });
  }
  out.sort((a, z) => (z.taken ? VALUE[xType(z.taken)] : 0) - (a.taken ? VALUE[xType(a.taken)] : 0));
  return out;
}

function negamax(
  b: Int8Array,
  me: Side,
  depth: number,
  ply: number,
  alpha: number,
  beta: number,
  deadline: number,
): number {
  if (Date.now() > deadline) throw TIMEOUT;
  if (generalSquare(b, me) < 0) return -MATE + ply;
  if (generalSquare(b, other(me)) < 0) return MATE - ply;
  if (depth <= 0) return evaluate(b, me);

  const moves = genPseudo(b, me);
  let legal = 0;
  let best = -Infinity;

  for (const m of moves) {
    const piece = b[m.from];
    b[m.to] = piece;
    b[m.from] = 0;
    if (inCheck(b, me) || generalsFacing(b)) {
      b[m.from] = piece;
      b[m.to] = m.taken;
      continue;
    }
    legal++;
    const v = -negamax(b, other(me), depth - 1, ply + 1, -beta, -alpha, deadline);
    b[m.from] = piece;
    b[m.to] = m.taken;
    if (v > best) best = v;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }

  if (legal === 0) return -MATE + ply; // no legal move always loses in xiangqi
  return best;
}

const MAX_DEPTH: Record<Level, number> = { 1: 1, 2: 2, 3: 4, 4: 6 };

export function bestMove(state: XiangqiState, level: Level = 3): XiangqiMove | null {
  const moves = legalMoves(state);
  if (moves.length === 0) return null;

  const me = state.turn;
  const b = Int8Array.from(state.board);

  if (level === 1) {
    const scored = moves.map((m) => ({
      m,
      v: (state.board[m.to] ? VALUE[xType(state.board[m.to])] : 0) + Math.random() * 250,
    }));
    scored.sort((a, z) => z.v - a.v);
    return scored[0].m;
  }

  const deadline = Date.now() + TIME_BUDGET[level];
  let order = [...moves].sort(
    (a, z) =>
      (state.board[z.to] ? VALUE[xType(state.board[z.to])] : 0) -
      (state.board[a.to] ? VALUE[xType(state.board[a.to])] : 0),
  );
  let chosen = order[0];

  for (let depth = 1; depth <= MAX_DEPTH[level]; depth++) {
    let alpha = -Infinity;
    let localBest = order[0];
    const scored: { m: XiangqiMove; v: number }[] = [];
    try {
      for (const m of order) {
        const piece = b[m.from];
        const taken = b[m.to];
        b[m.to] = piece;
        b[m.from] = 0;
        const v = -negamax(b, other(me), depth - 1, 1, -Infinity, -alpha, deadline);
        b[m.from] = piece;
        b[m.to] = taken;
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
    scored.sort((a, z) => z.v - a.v);
    order = scored.map((s) => s.m);
    if (alpha > MATE - 100) break;
    if (Date.now() > deadline) break;
  }

  return chosen;
}
