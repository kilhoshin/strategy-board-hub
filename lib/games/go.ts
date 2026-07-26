import { LIVE, Level, Outcome, Side, TIME_BUDGET, makeRng, other } from './types';

export const PASS = -1;
export type GoSize = 9 | 13 | 19;

export interface GoState {
  size: GoSize;
  board: number[]; // 0 empty, 1 black, 2 white
  turn: Side;
  ko: number; // forbidden point for the simple ko rule, -1 when none
  captured: { 1: number; 2: number };
  passes: number;
  last: number | null;
  moveCount: number;
  komi: number;
}

export const DEFAULT_KOMI: Record<GoSize, number> = { 9: 6.5, 13: 6.5, 19: 6.5 };

export function initial(size: GoSize = 9): GoState {
  return {
    size,
    board: new Array(size * size).fill(0),
    turn: 1,
    ko: -1,
    captured: { 1: 0, 2: 0 },
    passes: 0,
    last: null,
    moveCount: 0,
    komi: DEFAULT_KOMI[size],
  };
}

/* --------------------------- board mechanics --------------------------- */

const MAX = 19 * 19;
const mark = new Int32Array(MAX);
const stack = new Int32Array(MAX);
let gen = 0;

const neighborCache = new Map<number, { off: Int32Array; start: Int32Array }>();

function neighbors(size: number) {
  let cached = neighborCache.get(size);
  if (cached) return cached;
  const off: number[] = [];
  const start = new Int32Array(size * size + 1);
  for (let i = 0; i < size * size; i++) {
    start[i] = off.length;
    const r = (i / size) | 0;
    const c = i % size;
    if (r > 0) off.push(i - size);
    if (r < size - 1) off.push(i + size);
    if (c > 0) off.push(i - 1);
    if (c < size - 1) off.push(i + 1);
  }
  start[size * size] = off.length;
  cached = { off: Int32Array.from(off), start };
  neighborCache.set(size, cached);
  return cached;
}

const diagonalCache = new Map<number, { off: Int32Array; start: Int32Array }>();

function diagonals(size: number) {
  let cached = diagonalCache.get(size);
  if (cached) return cached;
  const off: number[] = [];
  const start = new Int32Array(size * size + 1);
  for (let i = 0; i < size * size; i++) {
    start[i] = off.length;
    const r = (i / size) | 0;
    const c = i % size;
    for (const [dr, dc] of [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size) off.push(nr * size + nc);
    }
  }
  start[size * size] = off.length;
  cached = { off: Int32Array.from(off), start };
  diagonalCache.set(size, cached);
  return cached;
}

/** Depth-first liberty probe with early exit. */
function hasLiberty(b: Int8Array, size: number, pt: number) {
  const { off, start } = neighbors(size);
  const color = b[pt];
  gen++;
  let sp = 0;
  stack[sp++] = pt;
  mark[pt] = gen;
  while (sp > 0) {
    const p = stack[--sp];
    for (let k = start[p]; k < start[p + 1]; k++) {
      const q = off[k];
      const v = b[q];
      if (v === 0) return true;
      if (v === color && mark[q] !== gen) {
        mark[q] = gen;
        stack[sp++] = q;
      }
    }
  }
  return false;
}

function removeGroup(b: Int8Array, size: number, pt: number) {
  const { off, start } = neighbors(size);
  const color = b[pt];
  let removed = 0;
  let sp = 0;
  stack[sp++] = pt;
  b[pt] = 0;
  removed++;
  while (sp > 0) {
    const p = stack[--sp];
    for (let k = start[p]; k < start[p + 1]; k++) {
      const q = off[k];
      if (b[q] === color) {
        b[q] = 0;
        removed++;
        stack[sp++] = q;
      }
    }
  }
  return removed;
}

export interface PlayResult {
  ok: boolean;
  captured: number;
  ko: number;
}

/** Mutates `b`. Returns ok:false and leaves the board untouched when illegal. */
export function playStone(
  b: Int8Array,
  size: number,
  pt: number,
  color: Side,
  koPoint: number,
): PlayResult {
  if (b[pt] !== 0 || pt === koPoint) return { ok: false, captured: 0, ko: -1 };
  const opp = other(color);
  const { off, start } = neighbors(size);
  b[pt] = color;

  let captured = 0;
  let lastCapturedPoint = -1;
  for (let k = start[pt]; k < start[pt + 1]; k++) {
    const q = off[k];
    if (b[q] === opp && !hasLiberty(b, size, q)) {
      lastCapturedPoint = q;
      captured += removeGroup(b, size, q);
    }
  }

  if (captured === 0 && !hasLiberty(b, size, pt)) {
    b[pt] = 0;
    return { ok: false, captured: 0, ko: -1 };
  }

  // Simple ko: a single stone captured a single stone and now stands alone in atari.
  let ko = -1;
  if (captured === 1) {
    let ownGroup = 1;
    let libs = 0;
    for (let k = start[pt]; k < start[pt + 1]; k++) {
      const q = off[k];
      if (b[q] === 0) libs++;
      else if (b[q] === color) ownGroup = 2;
    }
    if (ownGroup === 1 && libs === 1) ko = lastCapturedPoint;
  }

  return { ok: true, captured, ko };
}

export function isLegal(state: GoState, pt: number): boolean {
  if (pt === PASS) return true;
  const b = Int8Array.from(state.board);
  return playStone(b, state.size, pt, state.turn, state.ko).ok;
}

export function apply(state: GoState, pt: number): GoState {
  if (pt === PASS) {
    return {
      ...state,
      board: state.board.slice(),
      turn: other(state.turn),
      ko: -1,
      passes: state.passes + 1,
      last: PASS,
      moveCount: state.moveCount + 1,
    };
  }
  const b = Int8Array.from(state.board);
  const res = playStone(b, state.size, pt, state.turn, state.ko);
  if (!res.ok) return state;
  return {
    ...state,
    board: Array.from(b),
    turn: other(state.turn),
    ko: res.ko,
    captured: { ...state.captured, [state.turn]: state.captured[state.turn] + res.captured },
    passes: 0,
    last: pt,
    moveCount: state.moveCount + 1,
  };
}

export function outcome(state: GoState): Outcome {
  if (state.passes < 2) return LIVE;
  const { winner } = finalScore(state);
  return { over: true, winner, reason: 'area' };
}

/* ------------------------------- playouts ------------------------------ */

/** A point only the given colour can sensibly fill — used to stop playouts self-destructing. */
function isOwnEye(b: Int8Array, size: number, pt: number, color: Side) {
  if (b[pt] !== 0) return false;
  const { off, start } = neighbors(size);
  for (let k = start[pt]; k < start[pt + 1]; k++) if (b[off[k]] !== color) return false;
  const d = diagonals(size);
  const n = d.start[pt + 1] - d.start[pt];
  let bad = 0;
  for (let k = d.start[pt]; k < d.start[pt + 1]; k++) if (b[d.off[k]] !== color) bad++;
  // On the edge every diagonal must be ours; in the centre one may be loose.
  return n < 4 ? bad === 0 : bad <= 1;
}

/** Shared scratch so playouts never allocate. */
const orderBuf = new Int32Array(MAX);
const ownerBuf = new Int8Array(MAX);
const regionBuf = new Int32Array(MAX);

function playout(
  b: Int8Array,
  size: number,
  toPlay: Side,
  ko: number,
  rng: () => number,
  ownership: Float32Array | null,
  komi: number,
): number {
  const cells = size * size;
  const maxMoves = cells * 2 + 40;
  for (let i = 0; i < cells; i++) orderBuf[i] = i;
  for (let i = cells - 1; i > 0; i--) {
    const j = (rng() * (i + 1)) | 0;
    const t = orderBuf[i];
    orderBuf[i] = orderBuf[j];
    orderBuf[j] = t;
  }

  let passes = 0;
  let cur: Side = toPlay;
  let curKo = ko;

  for (let m = 0; m < maxMoves && passes < 2; m++) {
    // Sweep the shuffled point list from a random offset: uniform enough, and
    // far cheaper than re-shuffling on every single move.
    const startAt = (rng() * cells) | 0;
    let played = false;
    for (let s = 0; s < cells; s++) {
      const pt = orderBuf[(startAt + s) % cells];
      if (b[pt] !== 0 || pt === curKo) continue;
      if (isOwnEye(b, size, pt, cur)) continue;
      const res = playStone(b, size, pt, cur, curKo);
      if (!res.ok) continue;
      curKo = res.ko;
      played = true;
      break;
    }
    if (played) passes = 0;
    else {
      passes++;
      curKo = -1;
    }
    cur = other(cur);
  }

  const diff = areaScore(b, size, ownership);
  return diff - komi > 0 ? 1 : 0; // 1 = black wins
}

const regionMark = new Int32Array(MAX);
let regionGen = 0;

/**
 * Single-pass Chinese area score. Each empty region is flood-filled once and
 * its owner written back into every point of that region.
 */
function areaScore(b: Int8Array, size: number, ownership: Float32Array | null): number {
  const cells = size * size;
  const { off, start } = neighbors(size);
  regionGen++;
  let black = 0;
  let white = 0;

  for (let i = 0; i < cells; i++) {
    const v = b[i];
    if (v !== 0) {
      ownerBuf[i] = v;
      continue;
    }
    if (regionMark[i] === regionGen) continue;

    let sp = 0;
    let n = 0;
    stack[sp++] = i;
    regionMark[i] = regionGen;
    let sawBlack = false;
    let sawWhite = false;
    const region = regionBuf;
    while (sp > 0) {
      const p = stack[--sp];
      region[n++] = p;
      for (let k = start[p]; k < start[p + 1]; k++) {
        const q = off[k];
        const w = b[q];
        if (w === 0) {
          if (regionMark[q] !== regionGen) {
            regionMark[q] = regionGen;
            stack[sp++] = q;
          }
        } else if (w === 1) sawBlack = true;
        else sawWhite = true;
      }
    }
    const owner = sawBlack && !sawWhite ? 1 : sawWhite && !sawBlack ? 2 : 0;
    for (let k = 0; k < n; k++) ownerBuf[region[k]] = owner;
  }

  for (let i = 0; i < cells; i++) {
    const o = ownerBuf[i];
    if (o === 1) black++;
    else if (o === 2) white++;
    if (ownership) ownership[i] += o === 1 ? 1 : o === 2 ? -1 : 0;
  }
  return black - white;
}

/* --------------------------------- MCTS -------------------------------- */

interface Node {
  move: number;
  children: Node[];
  untried: number[];
  visits: number;
  wins: number; // wins for black, matching the playout convention
  toPlay: Side;
}

function candidateMoves(b: Int8Array, size: number, color: Side, ko: number, moveNo: number) {
  const cells = size * size;
  const out: number[] = [];
  const edgeGuard = size >= 13 ? 1 : 0;
  for (let i = 0; i < cells; i++) {
    if (b[i] !== 0 || i === ko) continue;
    if (isOwnEye(b, size, i, color)) continue;
    if (moveNo < size && edgeGuard) {
      const r = (i / size) | 0;
      const c = i % size;
      if (r === 0 || c === 0 || r === size - 1 || c === size - 1) continue;
    }
    // A point with a free neighbour always has a liberty, so it cannot be
    // suicide — only the fully surrounded ones need the expensive probe.
    const { off, start } = neighbors(size);
    let free = false;
    for (let k = start[i]; k < start[i + 1]; k++)
      if (b[off[k]] === 0) {
        free = true;
        break;
      }
    if (!free) {
      const probe = Int8Array.from(b);
      if (!playStone(probe, size, i, color, ko).ok) continue;
    }
    out.push(i);
  }
  out.push(PASS);
  return out;
}

function ucb(child: Node, parentVisits: number, forBlack: boolean) {
  const winRate = forBlack ? child.wins / child.visits : 1 - child.wins / child.visits;
  return winRate + 0.9 * Math.sqrt(Math.log(parentVisits) / child.visits);
}

export function bestMove(state: GoState, level: Level = 3): number {
  const size = state.size;
  const cells = size * size;
  const rng = makeRng(0x9e3779b9 ^ (state.moveCount * 2654435761));
  const root: Node = {
    move: -2,
    children: [],
    untried: candidateMoves(Int8Array.from(state.board), size, state.turn, state.ko, state.moveCount),
    visits: 0,
    wins: 0,
    toPlay: state.turn,
  };

  if (level === 1) {
    // Beginner: one random sensible point, biased away from the first line.
    const pool = root.untried.filter((m) => m !== PASS);
    if (!pool.length) return PASS;
    const inner = pool.filter((m) => {
      const r = (m / size) | 0;
      const c = m % size;
      return r > 0 && c > 0 && r < size - 1 && c < size - 1;
    });
    const src = inner.length ? inner : pool;
    return src[(rng() * src.length) | 0];
  }

  const deadline = Date.now() + TIME_BUDGET[level] * (size === 9 ? 1 : size === 13 ? 1.6 : 2.4);
  const work = new Int8Array(cells);
  let iterations = 0;

  while (true) {
    if ((iterations & 31) === 0 && Date.now() > deadline) break;
    iterations++;

    work.set(state.board);
    let ko = state.ko;
    let toPlay = state.turn;
    let passes = state.passes;
    let node = root;
    const path: Node[] = [root];

    // --- selection -------------------------------------------------------
    while (node.untried.length === 0 && node.children.length > 0) {
      const forBlack = node.toPlay === 1;
      let best = node.children[0];
      let bestVal = -Infinity;
      for (const c of node.children) {
        const v = ucb(c, node.visits + 1, forBlack);
        if (v > bestVal) {
          bestVal = v;
          best = c;
        }
      }
      node = best;
      path.push(node);
      if (node.move === PASS) {
        passes++;
        ko = -1;
      } else {
        const res = playStone(work, size, node.move, toPlay, ko);
        ko = res.ok ? res.ko : -1;
        passes = 0;
      }
      toPlay = other(toPlay);
    }

    // --- expansion -------------------------------------------------------
    if (node.untried.length > 0 && passes < 2) {
      const pick = (rng() * node.untried.length) | 0;
      const move = node.untried.splice(pick, 1)[0];
      if (move === PASS) {
        passes++;
        ko = -1;
      } else {
        const res = playStone(work, size, move, toPlay, ko);
        ko = res.ok ? res.ko : -1;
        passes = 0;
      }
      toPlay = other(toPlay);
      const child: Node = {
        move,
        children: [],
        untried: candidateMoves(work, size, toPlay, ko, state.moveCount + path.length),
        visits: 0,
        wins: 0,
        toPlay,
      };
      node.children.push(child);
      path.push(child);
      node = child;
    }

    // --- simulation ------------------------------------------------------
    const result =
      passes >= 2
        ? scoreBoard(work, size, state.komi) > 0
          ? 1
          : 0
        : playout(Int8Array.from(work), size, toPlay, ko, rng, null, state.komi);

    // --- backpropagation -------------------------------------------------
    for (const n of path) {
      n.visits++;
      n.wins += result;
    }
  }

  if (root.children.length === 0) return PASS;

  let best = root.children[0];
  for (const c of root.children) if (c.visits > best.visits) best = c;

  // Resign-by-passing: if even our best line is hopeless, end the game politely.
  const winRate = state.turn === 1 ? best.wins / best.visits : 1 - best.wins / best.visits;
  const alive = state.board.filter((v) => v !== 0).length;
  if (winRate > 0.92 && alive > cells * 0.5 && best.move !== PASS) {
    const passChild = root.children.find((c) => c.move === PASS);
    if (passChild) {
      const passRate =
        state.turn === 1 ? passChild.wins / passChild.visits : 1 - passChild.wins / passChild.visits;
      if (passRate > 0.92) return PASS;
    }
  }

  return best.move;
}

function scoreBoard(b: Int8Array, size: number, komi: number) {
  return areaScore(b, size, null) - komi;
}

/* ------------------------------- scoring -------------------------------- */

export interface ScoreResult {
  black: number;
  white: number;
  winner: 0 | Side;
  margin: number;
  /** Per-point ownership in [-1, 1]; +1 = certainly black. */
  ownership: number[];
}

/**
 * Monte-Carlo scoring: play the position out many times and let the statistics
 * decide which stones were actually dead, instead of demanding the players
 * capture every last one.
 */
export function finalScore(state: GoState, samples = 240): ScoreResult {
  const size = state.size;
  const cells = size * size;
  const ownership = new Float32Array(cells);
  const rng = makeRng(0x51ed270b ^ state.moveCount);
  const base = Int8Array.from(state.board);

  for (let s = 0; s < samples; s++) {
    playout(Int8Array.from(base), size, state.turn, -1, rng, ownership, state.komi);
  }

  let black = 0;
  let white = 0;
  const own: number[] = new Array(cells);
  for (let i = 0; i < cells; i++) {
    const v = ownership[i] / samples;
    own[i] = v;
    if (v > 0.25) black++;
    else if (v < -0.25) white++;
  }

  const margin = black - (white + state.komi);
  return {
    black,
    white: white + state.komi,
    winner: margin === 0 ? 0 : margin > 0 ? 1 : 2,
    margin: Math.abs(margin),
    ownership: own,
  };
}

export function coordName(size: number, pt: number) {
  if (pt === PASS) return 'pass';
  const letters = 'ABCDEFGHJKLMNOPQRST';
  const r = (pt / size) | 0;
  const c = pt % size;
  return `${letters[c]}${size - r}`;
}

export const STAR_POINTS: Record<GoSize, number[]> = {
  9: [20, 24, 40, 56, 60],
  13: [42, 48, 84, 120, 126],
  19: [60, 66, 72, 174, 180, 186, 288, 294, 300],
};
