import { LIVE, Level, Outcome, Side, TIME_BUDGET, other } from './types';

export const SIZE = 15;
const CELLS = SIZE * SIZE;

export interface GomokuState {
  board: number[]; // 0 empty, 1 black, 2 white
  turn: Side;
  last: number | null;
  history: number[];
}

export function initial(): GomokuState {
  return { board: new Array(CELLS).fill(0), turn: 1, last: null, history: [] };
}

export const rc = (i: number) => [Math.floor(i / SIZE), i % SIZE] as const;
export const idx = (r: number, c: number) => r * SIZE + c;

/* ------------------------------------------------------------------ *
 * Pre-computed geometry: every 5-in-a-row window, and a reverse index
 * from a cell to the windows that pass through it. The evaluator keeps
 * per-window stone counts up to date incrementally, so make/unmake
 * costs ~20 integer ops and the position score is always O(1).
 * ------------------------------------------------------------------ */

const WINDOWS: number[][] = [];
const WINDOWS_AT: number[][] = Array.from({ length: CELLS }, () => []);

for (const [dr, dc] of [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
] as const) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const er = r + dr * 4;
      const ec = c + dc * 4;
      if (er < 0 || er >= SIZE || ec < 0 || ec >= SIZE) continue;
      const w: number[] = [];
      for (let k = 0; k < 5; k++) w.push(idx(r + dr * k, c + dc * k));
      const wi = WINDOWS.length;
      WINDOWS.push(w);
      for (const cell of w) WINDOWS_AT[cell].push(wi);
    }
  }
}

const NW = WINDOWS.length;

/** Value of owning n of the five cells in a window the opponent has not touched. */
const W = [0, 1, 14, 220, 3400, 1_000_000];
const WIN_SCORE = 900_000;

/** Cells within Chebyshev distance 2 — used to keep the branching factor sane. */
const NEAR: number[][] = Array.from({ length: CELLS }, (_, i) => {
  const [r, c] = rc(i);
  const out: number[] = [];
  for (let dr = -2; dr <= 2; dr++)
    for (let dc = -2; dc <= 2; dc++) {
      if (!dr && !dc) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) out.push(idx(nr, nc));
    }
  return out;
});

class Position {
  board = new Int8Array(CELLS);
  c1 = new Int8Array(NW);
  c2 = new Int8Array(NW);
  near = new Int8Array(CELLS);
  s1 = 0;
  s2 = 0;
  stones = 0;
  winner: 0 | Side = 0;

  load(board: number[]) {
    this.board.fill(0);
    this.c1.fill(0);
    this.c2.fill(0);
    this.near.fill(0);
    this.s1 = this.s2 = this.stones = 0;
    this.winner = 0;
    for (let i = 0; i < CELLS; i++) if (board[i]) this.place(i, board[i] as Side);
  }

  place(i: number, p: Side) {
    this.board[i] = p;
    this.stones++;
    const ws = WINDOWS_AT[i];
    for (let k = 0; k < ws.length; k++) {
      const w = ws[k];
      let a = this.c1[w];
      let b = this.c2[w];
      if (b === 0) this.s1 -= W[a];
      if (a === 0) this.s2 -= W[b];
      if (p === 1) a = ++this.c1[w];
      else b = ++this.c2[w];
      if (b === 0) this.s1 += W[a];
      if (a === 0) this.s2 += W[b];
      if (a === 5) this.winner = 1;
      else if (b === 5) this.winner = 2;
    }
    const nb = NEAR[i];
    for (let k = 0; k < nb.length; k++) this.near[nb[k]]++;
  }

  unplace(i: number, p: Side) {
    this.board[i] = 0;
    this.stones--;
    this.winner = 0;
    const ws = WINDOWS_AT[i];
    for (let k = 0; k < ws.length; k++) {
      const w = ws[k];
      let a = this.c1[w];
      let b = this.c2[w];
      if (b === 0) this.s1 -= W[a];
      if (a === 0) this.s2 -= W[b];
      if (p === 1) a = --this.c1[w];
      else b = --this.c2[w];
      if (b === 0) this.s1 += W[a];
      if (a === 0) this.s2 += W[b];
    }
    const nb = NEAR[i];
    for (let k = 0; k < nb.length; k++) this.near[nb[k]]--;
  }

  evaluate(me: Side) {
    return me === 1 ? this.s1 - this.s2 : this.s2 - this.s1;
  }

  /** Heuristic worth of playing `i`, counting both what it builds and what it denies. */
  moveScore(i: number, me: Side) {
    const opp = other(me);
    let atk = 0;
    let def = 0;
    const ws = WINDOWS_AT[i];
    for (let k = 0; k < ws.length; k++) {
      const w = ws[k];
      const a = this.c1[w];
      const b = this.c2[w];
      const mine = me === 1 ? a : b;
      const theirs = me === 1 ? b : a;
      if (theirs === 0) atk += W[mine + 1] - W[mine];
      if (mine === 0) def += W[theirs + 1] - W[theirs];
    }
    return atk + def * 0.9 + (this.near[i] > 4 ? 2 : 0);
  }

  candidates(me: Side, cap: number) {
    const scored: { i: number; s: number }[] = [];
    for (let i = 0; i < CELLS; i++) {
      if (this.board[i] || this.near[i] === 0) continue;
      scored.push({ i, s: this.moveScore(i, me) });
    }
    scored.sort((x, y) => y.s - x.s);
    return scored.slice(0, cap).map((m) => m.i);
  }
}

export function winningLine(board: number[]): number[] | null {
  for (let w = 0; w < NW; w++) {
    const cells = WINDOWS[w];
    const first = board[cells[0]];
    if (!first) continue;
    if (cells.every((c) => board[c] === first)) return cells;
  }
  return null;
}

export function outcome(state: GomokuState): Outcome {
  const line = winningLine(state.board);
  if (line) return { over: true, winner: state.board[line[0]] as Side, reason: 'five' };
  if (state.board.every((v) => v !== 0)) return { over: true, winner: 0, reason: 'boardFull' };
  return LIVE;
}

export function legalMoves(state: GomokuState): number[] {
  const out: number[] = [];
  for (let i = 0; i < CELLS; i++) if (!state.board[i]) out.push(i);
  return out;
}

export function apply(state: GomokuState, move: number): GomokuState {
  const board = state.board.slice();
  board[move] = state.turn;
  return {
    board,
    turn: other(state.turn),
    last: move,
    history: [...state.history, move],
  };
}

/* ------------------------------- search ------------------------------- */

const CAP_BY_PLY = [14, 12, 10, 8, 8, 6, 6, 6, 4, 4];

function negamax(
  p: Position,
  me: Side,
  depth: number,
  ply: number,
  alpha: number,
  beta: number,
  deadline: number,
): number {
  if (p.winner) return p.winner === me ? WIN_SCORE - ply : -(WIN_SCORE - ply);
  if (depth === 0 || p.stones >= CELLS) return p.evaluate(me);
  if (Date.now() > deadline) throw TIMEOUT;

  const moves = p.candidates(me, CAP_BY_PLY[Math.min(ply, CAP_BY_PLY.length - 1)]);
  if (moves.length === 0) return p.evaluate(me);

  let best = -Infinity;
  for (const m of moves) {
    p.place(m, me);
    const v = -negamax(p, other(me), depth - 1, ply + 1, -beta, -alpha, deadline);
    p.unplace(m, me);
    if (v > best) best = v;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

const TIMEOUT = Symbol('timeout');

const MAX_DEPTH: Record<Level, number> = { 1: 1, 2: 3, 3: 6, 4: 10 };

export function bestMove(state: GomokuState, level: Level = 3): number | null {
  const me = state.turn;
  const p = new Position();
  p.load(state.board);

  if (p.stones === 0) return idx(7, 7);

  const roots = p.candidates(me, CAP_BY_PLY[0]);
  if (roots.length === 0) {
    const free = legalMoves(state);
    return free.length ? free[(Math.random() * free.length) | 0] : null;
  }

  // Level 1 plays the shallow heuristic with a little noise so it feels human.
  if (level === 1) {
    const pick = roots.slice(0, 3);
    return pick[(Math.random() * pick.length) | 0];
  }

  const deadline = Date.now() + TIME_BUDGET[level];
  let chosen = roots[0];
  let order = roots;

  for (let depth = 2; depth <= MAX_DEPTH[level]; depth++) {
    let alpha = -Infinity;
    let localBest = order[0];
    const scored: { m: number; v: number }[] = [];
    try {
      for (const m of order) {
        p.place(m, me);
        const v = -negamax(p, other(me), depth - 1, 1, -Infinity, -alpha, deadline);
        p.unplace(m, me);
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
    if (alpha >= WIN_SCORE - 50) break; // forced win found, stop burning time
    if (Date.now() > deadline) break;
  }

  return chosen;
}
