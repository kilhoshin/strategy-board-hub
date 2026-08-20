import { LIVE, Level, Outcome, Side, TIME_BUDGET, other } from './types';

/* ------------------------------------------------------------------ *
 * Janggi (Korean chess). 9 files x 10 ranks, index = row * 9 + col.
 * Row 0 is the top (Han, side 2); row 9 is the bottom (Cho, side 1),
 * and Cho moves first. Piece = type | (side 2 ? 8 : 0).
 * ------------------------------------------------------------------ */

export const COLS = 9;
export const ROWS = 10;
const CELLS = 90;

export const GENERAL = 1; // 궁/장
export const GUARD = 2; // 사
export const ELEPHANT = 3; // 상
export const HORSE = 4; // 마
export const CHARIOT = 5; // 차
export const CANNON = 6; // 포
export const SOLDIER = 7; // 졸/병

export const jType = (p: number) => p & 7;
export const jOwner = (p: number): Side => ((p & 8) === 0 ? 1 : 2);

export interface JanggiMove {
  from: number; // -1 means "pass" (한수쉼)
  to: number;
}

export interface JanggiState {
  board: number[];
  turn: Side;
  last: JanggiMove | null;
  captured: number[]; // pieces removed from the board, in order
  quiet: number; // plies since the last capture
  log: string[];
}

export type Setup = 'inner' | 'outer' | 'left' | 'right';

/** The four traditional back-rank arrangements, from file a to file i. */
const BACK_RANK: Record<Setup, number[]> = {
  inner: [CHARIOT, HORSE, ELEPHANT, GUARD, 0, GUARD, ELEPHANT, HORSE, CHARIOT],
  outer: [CHARIOT, ELEPHANT, HORSE, GUARD, 0, GUARD, HORSE, ELEPHANT, CHARIOT],
  left: [CHARIOT, ELEPHANT, HORSE, GUARD, 0, GUARD, ELEPHANT, HORSE, CHARIOT],
  right: [CHARIOT, HORSE, ELEPHANT, GUARD, 0, GUARD, HORSE, ELEPHANT, CHARIOT],
};

export function initial(setup: Setup = 'inner'): JanggiState {
  const board = new Array(CELLS).fill(0);
  const rank = BACK_RANK[setup];
  for (let c = 0; c < COLS; c++) {
    if (rank[c]) {
      board[0 * COLS + c] = rank[c] | 8;
      board[9 * COLS + c] = rank[c];
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

/** Palace diagonal graph: corner <-> centre for both palaces. */
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

/** Corner -> [centre, opposite corner] for the straight-through palace slide. */
const PALACE_THROUGH: Record<number, [number, number]> = {
  3: [13, 23],
  5: [13, 21],
  21: [13, 5],
  23: [13, 3],
  66: [76, 86],
  68: [76, 84],
  84: [76, 68],
  86: [76, 66],
};

const HORSE_LEGS: { block: [number, number]; steps: [number, number][] }[] = [
  { block: [-1, 0], steps: [[-2, -1], [-2, 1]] },
  { block: [1, 0], steps: [[2, -1], [2, 1]] },
  { block: [0, -1], steps: [[-1, -2], [1, -2]] },
  { block: [0, 1], steps: [[-1, 2], [1, 2]] },
];

const ELEPHANT_LEGS: { block: [number, number]; mid: [number, number]; to: [number, number] }[] = [
  { block: [-1, 0], mid: [-2, -1], to: [-3, -2] },
  { block: [-1, 0], mid: [-2, 1], to: [-3, 2] },
  { block: [1, 0], mid: [2, -1], to: [3, -2] },
  { block: [1, 0], mid: [2, 1], to: [3, 2] },
  { block: [0, -1], mid: [-1, -2], to: [-2, -3] },
  { block: [0, -1], mid: [1, -2], to: [2, -3] },
  { block: [0, 1], mid: [-1, 2], to: [-2, 3] },
  { block: [0, 1], mid: [1, 2], to: [2, 3] },
];

/** Pseudo-legal destinations for the piece on `from`, appended to `out`. */
function collect(b: ArrayLike<number>, from: number, out: number[]): number[] {
  const p = b[from];
  if (!p) return out;
  const me = jOwner(p);
  const ty = jType(p);
  const r = row(from);
  const c = col(from);
  const add = (to: number) => {
    if (to < 0) return;
    const t = b[to];
    if (t && jOwner(t) === me) return;
    out.push(to);
  };

  switch (ty) {
    case GENERAL:
    case GUARD: {
      for (const [dr, dc] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]) {
        const to = at(r + dr, c + dc);
        if (to >= 0 && inPalace(to) && samePalace(from, to)) add(to);
      }
      for (const to of PALACE_DIAG[from] ?? []) add(to);
      break;
    }

    case SOLDIER: {
      const fwd = me === 1 ? -1 : 1;
      add(at(r + fwd, c));
      add(at(r, c - 1));
      add(at(r, c + 1));
      for (const to of PALACE_DIAG[from] ?? []) {
        if ((row(to) - r) * fwd > 0) add(to);
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
      for (const leg of ELEPHANT_LEGS) {
        const blk = at(r + leg.block[0], c + leg.block[1]);
        if (blk < 0 || b[blk]) continue;
        const mid = at(r + leg.mid[0], c + leg.mid[1]);
        if (mid < 0 || b[mid]) continue;
        add(at(r + leg.to[0], c + leg.to[1]));
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
            if (jOwner(b[to]) !== me) out.push(to);
            break;
          }
          out.push(to);
          nr += dr;
          nc += dc;
          to = at(nr, nc);
        }
      }
      // Straight slide along the palace diagonal.
      for (const to of PALACE_DIAG[from] ?? []) add(to);
      const through = PALACE_THROUGH[from];
      if (through && !b[through[0]]) add(through[1]);
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
            if (t) {
              if (jType(t) === CANNON) break; // a cannon may not be jumped
              screen = to;
            }
          } else if (t) {
            if (jOwner(t) !== me && jType(t) !== CANNON) out.push(to);
            break;
          } else {
            out.push(to);
          }
          nr += dr;
          nc += dc;
          to = at(nr, nc);
        }
      }
      // Palace diagonal jump: corner -> opposite corner over the centre.
      const through = PALACE_THROUGH[from];
      if (through) {
        const screen = b[through[0]];
        const dest = b[through[1]];
        if (screen && jType(screen) !== CANNON) {
          if (!dest || (jOwner(dest) !== me && jType(dest) !== CANNON)) out.push(through[1]);
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

/**
 * Points that are currently stopping this horse or elephant — the "leg" that
 * has been blocked (멱/덜미). Only legs that would otherwise lead somewhere are
 * reported, so the board never marks a direction that was off the edge anyway.
 */
export function blockedLegs(b: ArrayLike<number>, from: number): number[] {
  const p = b[from];
  if (!p) return [];
  const ty = jType(p);
  const me = jOwner(p);
  const r = row(from);
  const c = col(from);
  const out = new Set<number>();

  const reachable = (to: number) => to >= 0 && (!b[to] || jOwner(b[to]) !== me);

  if (ty === HORSE) {
    for (const leg of HORSE_LEGS) {
      const blk = at(r + leg.block[0], c + leg.block[1]);
      if (blk < 0 || !b[blk]) continue;
      if (leg.steps.some(([dr, dc]) => reachable(at(r + dr, c + dc)))) out.add(blk);
    }
  } else if (ty === ELEPHANT) {
    for (const leg of ELEPHANT_LEGS) {
      if (!reachable(at(r + leg.to[0], c + leg.to[1]))) continue;
      const blk = at(r + leg.block[0], c + leg.block[1]);
      const mid = at(r + leg.mid[0], c + leg.mid[1]);
      if (blk >= 0 && b[blk]) out.add(blk);
      else if (mid >= 0 && b[mid]) out.add(mid);
    }
  }

  return [...out];
}

/** Reused across the search so move generation never allocates. */
const scratch: number[] = [];

function moveCount(b: ArrayLike<number>, from: number) {
  scratch.length = 0;
  collect(b, from, scratch);
  return scratch.length;
}

function samePalace(a: number, b: number) {
  return row(a) <= 4 === row(b) <= 4;
}

function generalSquare(b: ArrayLike<number>, side: Side) {
  const want = side === 1 ? GENERAL : GENERAL | 8;
  for (let i = 0; i < CELLS; i++) if (b[i] === want) return i;
  return -1;
}

export function isAttacked(b: ArrayLike<number>, sq: number, by: Side) {
  for (let i = 0; i < CELLS; i++) {
    const p = b[i];
    if (!p || jOwner(p) !== by) continue;
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

/** Generals staring at each other down an open file — an immediate draw. */
export function isBikjang(b: ArrayLike<number>) {
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

export function legalMoves(state: JanggiState): JanggiMove[] {
  const out: JanggiMove[] = [];
  const b = state.board;
  for (let i = 0; i < CELLS; i++) {
    const p = b[i];
    if (!p || jOwner(p) !== state.turn) continue;
    for (const to of movesFrom(b, i)) {
      const saved = b[to];
      (b as number[])[to] = p;
      (b as number[])[i] = 0;
      const ok = !inCheck(b, state.turn);
      (b as number[])[i] = p;
      (b as number[])[to] = saved;
      if (ok) out.push({ from: i, to });
    }
  }
  // Passing is legal in Janggi, but only when it does not leave you in check.
  if (!inCheck(b, state.turn)) out.push({ from: -1, to: -1 });
  return out;
}

export const PIECE_NAME: Record<number, string> = {
  [GENERAL]: 'general',
  [GUARD]: 'guard',
  [ELEPHANT]: 'elephant',
  [HORSE]: 'horse',
  [CHARIOT]: 'chariot',
  [CANNON]: 'cannon',
  [SOLDIER]: 'soldier',
};

export function apply(state: JanggiState, move: JanggiMove): JanggiState {
  if (move.from < 0) {
    return {
      ...state,
      board: state.board.slice(),
      turn: other(state.turn),
      last: move,
      quiet: state.quiet + 1,
      log: [...state.log, '--'],
    };
  }
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

export function outcome(state: JanggiState): Outcome {
  if (isBikjang(state.board)) return { over: true, winner: 0, reason: 'bikjang' };
  const moves = legalMoves(state);
  const real = moves.filter((m) => m.from >= 0);
  if (real.length === 0 && inCheck(state.board, state.turn))
    return { over: true, winner: other(state.turn), reason: 'checkmate' };
  if (state.quiet >= 120) return { over: true, winner: 0, reason: 'quiet' };
  return LIVE;
}

/* ------------------------------ evaluation ----------------------------- */

const VALUE: Record<number, number> = {
  [GENERAL]: 0,
  [GUARD]: 300,
  [ELEPHANT]: 300,
  [HORSE]: 500,
  [CHARIOT]: 1300,
  [CANNON]: 700,
  [SOLDIER]: 200,
};

/** Soldiers gain value as they advance and again inside the enemy palace. */
function soldierBonus(i: number, side: Side) {
  const r = row(i);
  const adv = side === 1 ? 6 - r : r - 3;
  return Math.max(0, adv) * 18 + (inPalace(i) && (side === 1 ? r <= 2 : r >= 7) ? 90 : 0);
}

function evaluate(b: Int8Array, me: Side): number {
  let score = 0;
  for (let i = 0; i < CELLS; i++) {
    const p = b[i];
    if (!p) continue;
    const side = jOwner(p);
    const sign = side === me ? 1 : -1;
    const ty = jType(p);
    let v = VALUE[ty];
    if (ty === SOLDIER) v += soldierBonus(i, side);
    else if (ty === CHARIOT || ty === CANNON) v += moveCount(b, i) * 6;
    else if (ty === GUARD && inPalace(i)) v += 40;
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
    if (!p || jOwner(p) !== side) continue;
    for (const to of movesFrom(b, i)) out.push({ from: i, to, taken: b[to] });
  }
  out.sort((a, z) => (z.taken ? VALUE[jType(z.taken)] : 0) - (a.taken ? VALUE[jType(a.taken)] : 0));
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
    if (inCheck(b, me)) {
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

  if (legal === 0) return inCheck(b, me) ? -MATE + ply : 0;
  return best;
}

const MAX_DEPTH: Record<Level, number> = { 1: 1, 2: 2, 3: 4, 4: 6 };

export function bestMove(state: JanggiState, level: Level = 3): JanggiMove | null {
  const all = legalMoves(state);
  const moves = all.filter((m) => m.from >= 0);
  if (moves.length === 0) return all.length ? { from: -1, to: -1 } : null;

  const me = state.turn;
  const b = Int8Array.from(state.board);

  if (level === 1) {
    const scored = moves.map((m) => ({
      m,
      v: (state.board[m.to] ? VALUE[jType(state.board[m.to])] : 0) + Math.random() * 250,
    }));
    scored.sort((a, z) => z.v - a.v);
    return scored[0].m;
  }

  const deadline = Date.now() + TIME_BUDGET[level];
  let order = [...moves].sort(
    (a, z) =>
      (state.board[z.to] ? VALUE[jType(state.board[z.to])] : 0) -
      (state.board[a.to] ? VALUE[jType(state.board[a.to])] : 0),
  );
  let chosen = order[0];

  for (let depth = 1; depth <= MAX_DEPTH[level]; depth++) {
    let alpha = -Infinity;
    let localBest = order[0];
    const scored: { m: JanggiMove; v: number }[] = [];
    try {
      for (const m of order) {
        const piece = b[m.from];
        const taken = b[m.to];
        b[m.to] = piece;
        b[m.from] = 0;
        // A move that hands the opponent an instant bikjang draw is worthless
        // when we are ahead, so fold it straight into the score.
        const draw = isBikjang(b);
        const v = draw
          ? 0
          : -negamax(b, other(me), depth - 1, 1, -Infinity, -alpha, deadline);
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

/** Forced-mate distance in our own moves, when the score is a genuine mate score. */
function mateInFor(score: number): number | undefined {
  return score > MATE - 1000 ? Math.ceil((MATE - score) / 2) : undefined;
}

/**
 * Like `bestMove`, but returns every root move with its search score instead
 * of only the chosen one. Offline-only (puzzle generation) — not used by the
 * live hint/AI path, so it always runs the real search.
 */
export function analyzeRoot(
  state: JanggiState,
  level: Level = 3,
): { move: JanggiMove; score: number; mateIn?: number }[] {
  const all = legalMoves(state);
  const moves = all.filter((m) => m.from >= 0);
  if (moves.length === 0) return [];

  const me = state.turn;
  const b = Int8Array.from(state.board);

  const deadline = Date.now() + TIME_BUDGET[level];
  let order = [...moves].sort(
    (a, z) =>
      (state.board[z.to] ? VALUE[jType(state.board[z.to])] : 0) -
      (state.board[a.to] ? VALUE[jType(state.board[a.to])] : 0),
  );
  let final = order.map((m) => ({ m, v: -Infinity }));

  for (let depth = 1; depth <= MAX_DEPTH[level]; depth++) {
    let alpha = -Infinity;
    const scored: { m: JanggiMove; v: number }[] = [];
    try {
      for (const m of order) {
        const piece = b[m.from];
        const taken = b[m.to];
        b[m.to] = piece;
        b[m.from] = 0;
        const draw = isBikjang(b);
        const v = draw
          ? 0
          : -negamax(b, other(me), depth - 1, 1, -Infinity, -alpha, deadline);
        b[m.from] = piece;
        b[m.to] = taken;
        scored.push({ m, v });
        if (v > alpha) alpha = v;
      }
    } catch (e) {
      if (e !== TIMEOUT) throw e;
      break;
    }
    scored.sort((a, z) => z.v - a.v);
    order = scored.map((s) => s.m);
    final = scored;
    if (alpha > MATE - 100) break;
    if (Date.now() > deadline) break;
  }

  return final.map(({ m, v }) => ({ move: m, score: v, mateIn: mateInFor(v) }));
}
