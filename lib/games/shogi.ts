import { LIVE, Level, Outcome, Side, TIME_BUDGET, other } from './types';

/* ------------------------------------------------------------------ *
 * Shogi. 9x9, index = row * 9 + col. Row 0 is Gote's back rank, row 8
 * is Sente's, so Sente (side 1, moves first) marches toward row 0.
 * Piece = type | PROMO | GOTE.
 * ------------------------------------------------------------------ */

export const FU = 1; // 歩 pawn
export const KY = 2; // 香 lance
export const KE = 3; // 桂 knight
export const GI = 4; // 銀 silver
export const KI = 5; // 金 gold
export const KA = 6; // 角 bishop
export const HI = 7; // 飛 rook
export const OU = 8; // 玉 king

const PROMO = 16;
const GOTE = 32;
const CELLS = 81;

export const sType = (p: number) => p & 15;
export const sPromoted = (p: number) => (p & PROMO) !== 0;
export const sOwner = (p: number): Side => ((p & GOTE) === 0 ? 1 : 2);
export const HAND_ORDER = [HI, KA, KI, GI, KE, KY, FU];

export interface ShogiMove {
  from: number; // -1 for a drop
  to: number;
  promote?: boolean;
  drop?: number; // piece type, only when from === -1
}

export interface ShogiState {
  board: number[];
  hands: Record<Side, number[]>; // counts indexed by piece type
  turn: Side;
  last: ShogiMove | null;
  log: string[];
  seen: string[];
}

export function initial(): ShogiState {
  const board = new Array(CELLS).fill(0);
  const back = [KY, KE, GI, KI, OU, KI, GI, KE, KY];
  for (let c = 0; c < 9; c++) {
    board[0 * 9 + c] = back[c] | GOTE;
    board[8 * 9 + c] = back[c];
    board[2 * 9 + c] = FU | GOTE;
    board[6 * 9 + c] = FU;
  }
  board[1 * 9 + 1] = HI | GOTE;
  board[1 * 9 + 7] = KA | GOTE;
  board[7 * 9 + 1] = KA;
  board[7 * 9 + 7] = HI;
  const state: ShogiState = {
    board,
    hands: { 1: new Array(9).fill(0), 2: new Array(9).fill(0) },
    turn: 1,
    last: null,
    log: [],
    seen: [],
  };
  state.seen = [positionKey(state)];
  return state;
}

export function positionKey(s: Pick<ShogiState, 'board' | 'hands' | 'turn'>) {
  return `${s.board.join(',')}|${s.hands[1].join('')}|${s.hands[2].join('')}|${s.turn}`;
}

/* ---------------------------- move geometry ---------------------------- */

const row = (i: number) => (i / 9) | 0;
const col = (i: number) => i % 9;
const at = (r: number, c: number) => (r < 0 || r > 8 || c < 0 || c > 8 ? -1 : r * 9 + c);

type Vec = readonly [number, number];

const GOLD: Vec[] = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, 0],
];
const SILVER: Vec[] = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [1, -1],
  [1, 1],
];
const KING: Vec[] = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];
const DIAG: Vec[] = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
];
const ORTHO: Vec[] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

/** Single-step destinations and sliding rays for a piece, from Sente's view. */
function pieceVectors(p: number): { steps: Vec[]; slides: Vec[] } {
  const t = sType(p);
  const pro = sPromoted(p);
  if (pro) {
    if (t === KA) return { steps: ORTHO, slides: DIAG };
    if (t === HI) return { steps: DIAG, slides: ORTHO };
    return { steps: GOLD, slides: [] };
  }
  switch (t) {
    case FU:
      return { steps: [[-1, 0]], slides: [] };
    case KY:
      return { steps: [], slides: [[-1, 0]] };
    case KE:
      return {
        steps: [
          [-2, -1],
          [-2, 1],
        ],
        slides: [],
      };
    case GI:
      return { steps: SILVER, slides: [] };
    case KI:
      return { steps: GOLD, slides: [] };
    case KA:
      return { steps: [], slides: DIAG };
    case HI:
      return { steps: [], slides: ORTHO };
    default:
      return { steps: KING, slides: [] };
  }
}

/* Direction indices 0-7 follow KING; 8/9 are the two knight jumps.
 * Looked up by a flat (dr+2)*5 + (dc+2) key so the hot path stays numeric. */
const DIR_KEY = (dr: number, dc: number) => (dr + 2) * 5 + (dc + 2);
const DIR_INDEX = new Int8Array(25).fill(-1);
KING.forEach(([dr, dc], i) => {
  DIR_INDEX[DIR_KEY(dr, dc)] = i;
});
DIR_INDEX[DIR_KEY(-2, -1)] = 8;
DIR_INDEX[DIR_KEY(-2, 1)] = 9;

/**
 * Bit masks of the directions each piece code steps and slides in, in its own
 * frame of reference. Lets us answer "is this square attacked?" by looking
 * outward from the square instead of generating every enemy move.
 */
const STEP_MASK = new Uint16Array(64);
const SLIDE_MASK = new Uint16Array(64);
for (let p = 1; p < 64; p++) {
  if (sType(p) < 1 || sType(p) > OU) continue;
  const { steps, slides } = pieceVectors(p);
  for (const [dr, dc] of steps) {
    const i = DIR_INDEX[DIR_KEY(dr, dc)];
    if (i >= 0) STEP_MASK[p] |= 1 << i;
  }
  for (const [dr, dc] of slides) {
    const i = DIR_INDEX[DIR_KEY(dr, dc)];
    if (i >= 0) SLIDE_MASK[p] |= 1 << i;
  }
}

const KNIGHT_PROBE: Vec[] = [
  [-2, -1],
  [-2, 1],
  [2, -1],
  [2, 1],
];

/** True when `by` attacks `sq`, found by looking outward from `sq`. */
function isAttackedBy(b: Int8Array, sq: number, by: Side): boolean {
  const r = row(sq);
  const c = col(sq);
  const flip = by === 1 ? 1 : -1;

  for (let d = 0; d < 8; d++) {
    const dr = KING[d][0];
    const dc = KING[d][1];
    const n = at(r + dr, c + dc);
    if (n < 0) continue;
    const p = b[n];
    if (!p || sOwner(p) !== by) continue;
    const key = DIR_INDEX[DIR_KEY(-dr * flip, -dc)];
    if (key >= 0 && STEP_MASK[p] & (1 << key)) return true;
  }

  for (const [dr, dc] of KNIGHT_PROBE) {
    const n = at(r + dr, c + dc);
    if (n < 0) continue;
    const p = b[n];
    if (!p || sOwner(p) !== by) continue;
    const key = DIR_INDEX[DIR_KEY(-dr * flip, -dc)];
    if (key >= 0 && STEP_MASK[p] & (1 << key)) return true;
  }

  for (let d = 0; d < 8; d++) {
    const dr = KING[d][0];
    const dc = KING[d][1];
    let nr = r + dr;
    let nc = c + dc;
    let n = at(nr, nc);
    while (n >= 0) {
      const p = b[n];
      if (p) {
        if (sOwner(p) === by) {
          const key = DIR_INDEX[DIR_KEY(-dr * flip, -dc)];
          if (key >= 0 && SLIDE_MASK[p] & (1 << key)) return true;
        }
        break;
      }
      nr += dr;
      nc += dc;
      n = at(nr, nc);
    }
  }

  return false;
}

function collect(b: ArrayLike<number>, from: number, out: number[]) {
  const p = b[from];
  if (!p) return out;
  const me = sOwner(p);
  const flip = me === 1 ? 1 : -1;
  const r = row(from);
  const c = col(from);
  const { steps, slides } = pieceVectors(p);

  for (const [dr, dc] of steps) {
    const to = at(r + dr * flip, c + dc);
    if (to < 0) continue;
    const t = b[to];
    if (t && sOwner(t) === me) continue;
    out.push(to);
  }
  for (const [dr, dc] of slides) {
    let nr = r + dr * flip;
    let nc = c + dc;
    let to = at(nr, nc);
    while (to >= 0) {
      const t = b[to];
      if (t) {
        if (sOwner(t) !== me) out.push(to);
        break;
      }
      out.push(to);
      nr += dr * flip;
      nc += dc;
      to = at(nr, nc);
    }
  }
  return out;
}

export function movesFrom(b: ArrayLike<number>, from: number) {
  return collect(b, from, []);
}

const inZone = (i: number, side: Side) => (side === 1 ? row(i) <= 2 : row(i) >= 6);

export function canPromote(p: number, from: number, to: number) {
  const t = sType(p);
  if (sPromoted(p) || t === KI || t === OU) return false;
  const side = sOwner(p);
  return inZone(from, side) || inZone(to, side);
}

export function mustPromote(p: number, to: number) {
  const t = sType(p);
  if (sPromoted(p)) return false;
  const side = sOwner(p);
  const r = side === 1 ? row(to) : 8 - row(to);
  if ((t === FU || t === KY) && r === 0) return true;
  if (t === KE && r <= 1) return true;
  return false;
}

/* --------------------------- mutable position --------------------------- */

interface Undo {
  from: number;
  to: number;
  captured: number;
  promoted: boolean;
  drop: number;
  king: number;
}

const scratch: number[] = [];

class Position {
  b: Int8Array;
  hands: [Int8Array, Int8Array]; // index 0 = side 1
  turn: Side;
  kings: [number, number] = [-1, -1];
  private undo: Undo[] = [];

  constructor(s: ShogiState) {
    this.b = Int8Array.from(s.board);
    this.hands = [Int8Array.from(s.hands[1]), Int8Array.from(s.hands[2])];
    this.turn = s.turn;
    this.syncKings();
  }

  private syncKings() {
    this.kings = [-1, -1];
    for (let i = 0; i < CELLS; i++) {
      const p = this.b[i];
      if (p && sType(p) === OU) this.kings[sOwner(p) - 1] = i;
    }
  }

  attacked(sq: number, by: Side) {
    return isAttackedBy(this.b, sq, by);
  }

  inCheck(side: Side = this.turn) {
    const k = this.kings[side - 1];
    return k >= 0 && this.attacked(k, other(side));
  }

  make(m: ShogiMove) {
    const me = this.turn;
    if (m.from < 0) {
      const t = m.drop!;
      this.hands[me - 1][t]--;
      this.b[m.to] = t | (me === 2 ? GOTE : 0);
      this.undo.push({ from: -1, to: m.to, captured: 0, promoted: false, drop: t, king: -1 });
    } else {
      const p = this.b[m.from];
      const captured = this.b[m.to];
      const kingBefore = this.kings[me - 1];
      if (captured) {
        const t = sType(captured);
        this.hands[me - 1][t]++;
        if (sType(captured) === OU) this.kings[other(me) - 1] = -1;
      }
      this.b[m.from] = 0;
      this.b[m.to] = m.promote ? p | PROMO : p;
      if (sType(p) === OU) this.kings[me - 1] = m.to;
      this.undo.push({
        from: m.from,
        to: m.to,
        captured,
        promoted: !!m.promote,
        drop: 0,
        king: kingBefore,
      });
    }
    this.turn = other(me);
  }

  unmake(m: ShogiMove) {
    const u = this.undo.pop()!;
    this.turn = other(this.turn);
    const me = this.turn;
    if (u.from < 0) {
      this.hands[me - 1][u.drop]++;
      this.b[u.to] = 0;
      return;
    }
    const moved = this.b[u.to];
    this.b[u.from] = u.promoted ? moved & ~PROMO : moved;
    this.b[u.to] = u.captured;
    if (u.captured) {
      this.hands[me - 1][sType(u.captured)]--;
      if (sType(u.captured) === OU) this.kings[other(me) - 1] = u.to;
    }
    if (sType(moved) === OU) this.kings[me - 1] = u.king;
  }

  generate(capturesOnly = false): ShogiMove[] {
    const me = this.turn;
    const out: ShogiMove[] = [];

    for (let from = 0; from < CELLS; from++) {
      const p = this.b[from];
      if (!p || sOwner(p) !== me) continue;
      scratch.length = 0;
      collect(this.b, from, scratch);
      for (let k = 0; k < scratch.length; k++) {
        const to = scratch[k];
        if (capturesOnly && !this.b[to]) continue;
        const forced = mustPromote(p, to);
        if (!forced) out.push({ from, to });
        if (canPromote(p, from, to)) out.push({ from, to, promote: true });
      }
    }

    if (capturesOnly) return out;

    const hand = this.hands[me - 1];
    const pawnFiles = new Uint8Array(9);
    for (let i = 0; i < CELLS; i++) {
      const p = this.b[i];
      if (p && sOwner(p) === me && sType(p) === FU && !sPromoted(p)) pawnFiles[col(i)] = 1;
    }
    for (const t of HAND_ORDER) {
      if (!hand[t]) continue;
      for (let to = 0; to < CELLS; to++) {
        if (this.b[to]) continue;
        const r = me === 1 ? row(to) : 8 - row(to);
        if ((t === FU || t === KY) && r === 0) continue;
        if (t === KE && r <= 1) continue;
        if (t === FU && pawnFiles[col(to)]) continue; // nifu
        out.push({ from: -1, to, drop: t });
      }
    }
    return out;
  }

  legal(): ShogiMove[] {
    const me = this.turn;
    const out: ShogiMove[] = [];
    for (const m of this.generate()) {
      this.make(m);
      const ok = !this.attacked(this.kings[me - 1], other(me));
      // Uchifuzume: a dropped pawn may not deliver immediate checkmate.
      let banned = false;
      if (ok && m.from < 0 && m.drop === FU && this.inCheck() && this.legalCount() === 0) {
        banned = true;
      }
      this.unmake(m);
      if (ok && !banned) out.push(m);
    }
    return out;
  }

  /** Cheap legal-move existence count, used only by the uchifuzume test. */
  private legalCount() {
    const me = this.turn;
    let n = 0;
    for (const m of this.generate()) {
      this.make(m);
      const ok = !this.attacked(this.kings[me - 1], other(me));
      this.unmake(m);
      if (ok) {
        n++;
        break;
      }
    }
    return n;
  }
}

/* ------------------------------ public API ------------------------------ */

export function legalMoves(state: ShogiState): ShogiMove[] {
  return new Position(state).legal();
}

export function inCheck(state: ShogiState): boolean {
  return new Position(state).inCheck();
}

const KANJI: Record<number, string> = {
  [FU]: '歩',
  [KY]: '香',
  [KE]: '桂',
  [GI]: '銀',
  [KI]: '金',
  [KA]: '角',
  [HI]: '飛',
  [OU]: '玉',
};
const KANJI_PROMO: Record<number, string> = {
  [FU]: 'と',
  [KY]: '成香',
  [KE]: '成桂',
  [GI]: '成銀',
  [KA]: '馬',
  [HI]: '龍',
};

export function pieceLabel(p: number) {
  return sPromoted(p) ? (KANJI_PROMO[sType(p)] ?? KANJI[sType(p)]) : KANJI[sType(p)];
}

const NUM = '一二三四五六七八九';

export function moveLabel(state: ShogiState, m: ShogiMove) {
  const file = 9 - col(m.to);
  const rank = NUM[row(m.to)];
  const mark = state.turn === 1 ? '▲' : '△';
  if (m.from < 0) return `${mark}${file}${rank}${KANJI[m.drop!]}打`;
  const p = state.board[m.from];
  return `${mark}${file}${rank}${pieceLabel(p)}${m.promote ? '成' : ''}`;
}

export function apply(state: ShogiState, m: ShogiMove): ShogiState {
  const pos = new Position(state);
  const label = moveLabel(state, m);
  pos.make(m);
  const next: ShogiState = {
    board: Array.from(pos.b),
    hands: { 1: Array.from(pos.hands[0]), 2: Array.from(pos.hands[1]) },
    turn: pos.turn,
    last: m,
    log: [...state.log, label],
    seen: state.seen,
  };
  next.seen = [...state.seen, positionKey(next)];
  return next;
}

export function outcome(state: ShogiState): Outcome {
  const pos = new Position(state);
  if (pos.legal().length === 0)
    return { over: true, winner: other(state.turn), reason: pos.inCheck() ? 'checkmate' : 'stalemate' };
  const key = state.seen[state.seen.length - 1];
  if (state.seen.filter((k) => k === key).length >= 4)
    return { over: true, winner: 0, reason: 'sennichite' };
  return LIVE;
}

/* ------------------------------ evaluation ------------------------------ */

const VALUE: Record<number, number> = {
  [FU]: 100,
  [KY]: 350,
  [KE]: 400,
  [GI]: 550,
  [KI]: 600,
  [KA]: 850,
  [HI]: 1000,
  [OU]: 0,
};
const PROMO_VALUE: Record<number, number> = {
  [FU]: 540,
  [KY]: 580,
  [KE]: 600,
  [GI]: 600,
  [KA]: 1250,
  [HI]: 1400,
};
/** A piece in hand can be dropped anywhere, so it is worth a little more. */
const HAND_BONUS = 1.12;

function pieceValue(p: number) {
  return sPromoted(p) ? (PROMO_VALUE[sType(p)] ?? VALUE[sType(p)]) : VALUE[sType(p)];
}

function evaluate(pos: Position, me: Side): number {
  let score = 0;
  for (let i = 0; i < CELLS; i++) {
    const p = pos.b[i];
    if (!p) continue;
    const side = sOwner(p);
    const sign = side === me ? 1 : -1;
    let v = pieceValue(p);
    // Advancement matters: pieces heading into the promotion zone are worth more.
    const adv = side === 1 ? 8 - row(i) : row(i);
    const t = sType(p);
    if (t !== OU && t !== HI && t !== KA) v += adv * 6;
    score += sign * v;
  }
  for (const side of [1, 2] as Side[]) {
    const sign = side === me ? 1 : -1;
    const hand = pos.hands[side - 1];
    for (const t of HAND_ORDER) score += sign * hand[t] * VALUE[t] * HAND_BONUS;
  }

  // King safety: friendly pieces hugging the king are worth real points.
  for (const side of [1, 2] as Side[]) {
    const k = pos.kings[side - 1];
    if (k < 0) continue;
    const sign = side === me ? 1 : -1;
    let guards = 0;
    for (const [dr, dc] of KING) {
      const n = at(row(k) + dr, col(k) + dc);
      if (n >= 0 && pos.b[n] && sOwner(pos.b[n]) === side) guards++;
    }
    score += sign * guards * 28;
  }

  return score;
}

/* -------------------------------- search -------------------------------- */

const TIMEOUT = Symbol('timeout');
const MATE = 300000;

function moveScore(pos: Position, m: ShogiMove) {
  const victim = m.from < 0 ? 0 : pos.b[m.to];
  let s = victim ? pieceValue(victim) * 8 : 0;
  if (m.promote) s += 400;
  if (m.from < 0) s += 40;
  return s;
}

function negamax(
  pos: Position,
  me: Side,
  depth: number,
  ply: number,
  alpha: number,
  beta: number,
  deadline: number,
): number {
  if (Date.now() > deadline) throw TIMEOUT;
  if (pos.kings[other(me) - 1] < 0) return MATE - ply;
  if (pos.kings[me - 1] < 0) return -MATE + ply;
  if (depth <= 0) return evaluate(pos, me);

  const moves = pos.generate();
  moves.sort((a, b) => moveScore(pos, b) - moveScore(pos, a));

  let legal = 0;
  let best = -Infinity;
  for (const m of moves) {
    pos.make(m);
    if (pos.attacked(pos.kings[me - 1], other(me))) {
      pos.unmake(m);
      continue;
    }
    legal++;
    const v = -negamax(pos, other(me), depth - 1, ply + 1, -beta, -alpha, deadline);
    pos.unmake(m);
    if (v > best) best = v;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }

  if (legal === 0) return pos.inCheck(me) ? -MATE + ply : -MATE + ply;
  return best;
}

const MAX_DEPTH: Record<Level, number> = { 1: 1, 2: 2, 3: 4, 4: 6 };

export function bestMove(state: ShogiState, level: Level = 3): ShogiMove | null {
  const pos = new Position(state);
  const roots = pos.legal();
  if (roots.length === 0) return null;
  if (roots.length === 1) return roots[0];

  const me = state.turn;

  if (level === 1) {
    const scored = roots.map((m) => ({ m, v: moveScore(pos, m) + Math.random() * 500 }));
    scored.sort((a, b) => b.v - a.v);
    return scored[0].m;
  }

  const deadline = Date.now() + TIME_BUDGET[level];
  let order = [...roots].sort((a, b) => moveScore(pos, b) - moveScore(pos, a));
  let chosen = order[0];

  for (let depth = 1; depth <= MAX_DEPTH[level]; depth++) {
    let alpha = -Infinity;
    let localBest = order[0];
    const scored: { m: ShogiMove; v: number }[] = [];
    try {
      for (const m of order) {
        pos.make(m);
        const v = -negamax(pos, other(me), depth - 1, 1, -Infinity, -alpha, deadline);
        pos.unmake(m);
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
    if (alpha > MATE - 200) break;
    if (Date.now() > deadline) break;
  }

  return chosen;
}
