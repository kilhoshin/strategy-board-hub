import { Level, Outcome, Side, TIME_BUDGET, other } from './types';

/* ------------------------------------------------------------------ *
 * Oware (West African mancala / sowing game). 12 houses in a ring,
 * index 0-5 belong to side 1 (moves first), 6-11 to side 2. A move
 * picks up every seed from one of your own houses and sows them one
 * at a time into successive houses going counter-clockwise (increasing
 * index, wrapping 11 -> 0), skipping the house you sowed from.
 *
 * If the very last seed sown lands in an opponent's house and brings
 * it to 2 or 3, you capture it — and keep walking backward along the
 * houses you just passed through, capturing every further opponent
 * house that is also at 2 or 3, until the chain breaks. A capture that
 * would empty every one of the opponent's houses ("grand slam") is
 * refused outright; the seeds stay on the board instead.
 * ------------------------------------------------------------------ */

export const PITS = 12;
const SEEDS_PER_PIT = 4;

const SIDE1 = [0, 1, 2, 3, 4, 5];
const SIDE2 = [6, 7, 8, 9, 10, 11];

export const ownerOf = (i: number): Side => (i < 6 ? 1 : 2);
const rangeFor = (side: Side) => (side === 1 ? SIDE1 : SIDE2);

export interface OwareMove {
  pit: number;
}

export interface OwareState {
  board: number[]; // 12 houses, seeds each
  turn: Side;
  score: [number, number]; // captured seeds, index 0 = side 1
  last: OwareMove | null;
  log: string[];
}

export function initial(): OwareState {
  return {
    board: new Array(PITS).fill(SEEDS_PER_PIT),
    turn: 1,
    score: [0, 0],
    last: null,
    log: [],
  };
}

/** Sows the pit's seeds without capturing or mutating the input board. */
function simulateSow(board: number[], p: number) {
  const b = board.slice();
  let remaining = b[p];
  b[p] = 0;
  let idx = p;
  let lastPit = p;
  const sown: number[] = [];
  while (remaining > 0) {
    idx = (idx + 1) % PITS;
    if (idx === p) continue; // the origin house is skipped, not sown into
    b[idx]++;
    remaining--;
    lastPit = idx;
    sown.push(idx);
  }
  return { board: b, lastPit, sown };
}

export function legalMoves(state: OwareState): OwareMove[] {
  const mine = rangeFor(state.turn).filter((i) => state.board[i] > 0);
  const oppRange = rangeFor(other(state.turn));
  const oppEmpty = oppRange.every((i) => state.board[i] === 0);
  const all = mine.map((pit) => ({ pit }));
  if (!oppEmpty) return all;
  // "Must feed" rule: if the opponent has no seeds at all, you must play a
  // move that gives them at least one, if any such move exists.
  const feeding = all.filter((m) => simulateSow(state.board, m.pit).sown.some((i) => oppRange.includes(i)));
  return feeding.length ? feeding : all;
}

export function apply(state: OwareState, move: OwareMove): OwareState {
  const me = state.turn;
  const opp = other(me);
  const { board, lastPit } = simulateSow(state.board, move.pit);

  let captureTotal = 0;
  if (ownerOf(lastPit) === opp) {
    const oppRange = rangeFor(opp);
    const capturedPits: number[] = [];
    let idx = lastPit;
    while (ownerOf(idx) === opp && (board[idx] === 2 || board[idx] === 3)) {
      capturedPits.push(idx);
      idx = (idx - 1 + PITS) % PITS;
    }
    if (capturedPits.length) {
      const capturedSet = new Set(capturedPits);
      const wouldEmptyRow = oppRange.every((i) => capturedSet.has(i) || board[i] === 0);
      if (!wouldEmptyRow) {
        for (const i of capturedPits) {
          captureTotal += board[i];
          board[i] = 0;
        }
      }
    }
  }

  const score: [number, number] = [...state.score];
  score[me - 1] += captureTotal;

  // If the side about to move has nothing to sow, the game is over and
  // whoever still has seeds on their side sweeps them into their own score.
  const nextRange = rangeFor(opp);
  if (nextRange.every((i) => board[i] === 0)) {
    const mineRange = rangeFor(me);
    const sweep = mineRange.reduce((sum, i) => sum + board[i], 0);
    if (sweep > 0) {
      score[me - 1] += sweep;
      for (const i of mineRange) board[i] = 0;
    }
  }

  return {
    board,
    turn: opp,
    score,
    last: move,
    log: [...state.log, `${pitName(move.pit)}${captureTotal ? `x${captureTotal}` : ''}`],
  };
}

export function pitName(i: number) {
  const side = ownerOf(i);
  const local = side === 1 ? i : i - 6;
  return `${side === 1 ? 'A' : 'B'}${local + 1}`;
}

export function outcome(state: OwareState): Outcome {
  if (state.score[0] >= 25) return { over: true, winner: 1, reason: 'majority' };
  if (state.score[1] >= 25) return { over: true, winner: 2, reason: 'majority' };
  const total = state.score[0] + state.score[1];
  if (total >= 48) {
    if (state.score[0] === state.score[1]) return { over: true, winner: 0, reason: 'split' };
    return { over: true, winner: state.score[0] > state.score[1] ? 1 : 2, reason: 'exhausted' };
  }
  return { over: false };
}

/* ------------------------------ evaluation ----------------------------- */

function evaluate(state: OwareState, me: Side): number {
  const opp = other(me);
  let score = (state.score[me - 1] - state.score[opp - 1]) * 100;
  // Houses sitting at 1 or 2 seeds are one sow away from becoming a capture.
  for (const i of rangeFor(me)) if (state.board[i] === 1 || state.board[i] === 2) score -= 3;
  for (const i of rangeFor(opp)) if (state.board[i] === 1 || state.board[i] === 2) score += 3;
  return score;
}

/* -------------------------------- search ------------------------------- */

const TIMEOUT = Symbol('timeout');

function captureValue(state: OwareState, move: OwareMove): number {
  const { board, lastPit } = simulateSow(state.board, move.pit);
  const opp = other(state.turn);
  if (ownerOf(lastPit) !== opp) return 0;
  let idx = lastPit;
  let total = 0;
  while (ownerOf(idx) === opp && (board[idx] === 2 || board[idx] === 3)) {
    total += board[idx];
    idx = (idx - 1 + PITS) % PITS;
  }
  return total;
}

function negamax(
  state: OwareState,
  me: Side,
  depth: number,
  alpha: number,
  beta: number,
  deadline: number,
): number {
  const o = outcome(state);
  if (o.over) {
    if (o.winner === 0) return 0;
    return o.winner === me ? 100000 : -100000;
  }
  if (depth === 0) return evaluate(state, me);
  if (Date.now() > deadline) throw TIMEOUT;

  const moves = legalMoves(state).sort((a, b) => captureValue(state, b) - captureValue(state, a));
  let best = -Infinity;
  for (const m of moves) {
    const next = apply(state, m);
    const v = -negamax(next, other(me), depth - 1, -beta, -alpha, deadline);
    if (v > best) best = v;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

const MAX_DEPTH: Record<Level, number> = { 1: 2, 2: 4, 3: 8, 4: 12 };

export function bestMove(state: OwareState, level: Level = 3): OwareMove | null {
  const moves = legalMoves(state);
  if (moves.length === 0) return null;
  if (moves.length === 1) return moves[0];

  const me = state.turn;

  if (level === 1) {
    const captures = moves.filter((m) => captureValue(state, m) > 0);
    const pool = captures.length && Math.random() < 0.5 ? captures : moves;
    return pool[(Math.random() * pool.length) | 0];
  }

  const deadline = Date.now() + TIME_BUDGET[level];
  let order = [...moves].sort((a, b) => captureValue(state, b) - captureValue(state, a));
  let chosen = order[0];

  for (let depth = 2; depth <= MAX_DEPTH[level]; depth++) {
    let alpha = -Infinity;
    let localBest = order[0];
    const scored: { m: OwareMove; v: number }[] = [];
    try {
      for (const m of order) {
        const next = apply(state, m);
        const v = -negamax(next, other(me), depth - 1, -Infinity, -alpha, deadline);
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
    if (alpha >= 99000) break;
    if (Date.now() > deadline) break;
  }

  return chosen;
}
