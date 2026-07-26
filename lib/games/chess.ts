import { LIVE, Level, Outcome, Side, TIME_BUDGET } from './types';

/* ------------------------------------------------------------------ *
 * 0x88 mailbox board. Index = rank * 16 + file, rank 0 is the 8th rank
 * (black's back rank), so white marches toward lower indices.
 * Piece code = type | (color << 3); white is colour bit 0.
 * ------------------------------------------------------------------ */

export const PAWN = 1;
export const KNIGHT = 2;
export const BISHOP = 3;
export const ROOK = 4;
export const QUEEN = 5;
export const KING = 6;

export const WHITE = 0;
export const BLACK = 1;

export const pieceType = (p: number) => p & 7;
export const pieceColor = (p: number) => p >> 3;
const onBoard = (sq: number) => (sq & 0x88) === 0;
export const sqRank = (sq: number) => sq >> 4;
export const sqFile = (sq: number) => sq & 7;
export const sq88 = (r: number, f: number) => r * 16 + f;

export const CASTLE_WK = 1;
export const CASTLE_WQ = 2;
export const CASTLE_BK = 4;
export const CASTLE_BQ = 8;

export interface ChessMove {
  from: number;
  to: number;
  promo?: number;
}

export interface ChessState {
  board: number[]; // 128 slots, 0x88
  turn: Side; // 1 = white, 2 = black
  castling: number;
  ep: number; // en-passant target square, -1 when none
  halfmove: number;
  fullmove: number;
  last: ChessMove | null;
  /** Algebraic move list for the sidebar. */
  san: string[];
  /** Position keys for threefold-repetition detection. */
  seen: string[];
}

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const CHAR_TO_PIECE: Record<string, number> = {
  p: PAWN | 8,
  n: KNIGHT | 8,
  b: BISHOP | 8,
  r: ROOK | 8,
  q: QUEEN | 8,
  k: KING | 8,
  P: PAWN,
  N: KNIGHT,
  B: BISHOP,
  R: ROOK,
  Q: QUEEN,
  K: KING,
};

export function fromFen(fen: string): ChessState {
  const [placement, active, castle, ep, half, full] = fen.split(' ');
  const board = new Array(128).fill(0);
  let r = 0;
  let f = 0;
  for (const ch of placement) {
    if (ch === '/') {
      r++;
      f = 0;
    } else if (ch >= '1' && ch <= '8') {
      f += Number(ch);
    } else {
      board[sq88(r, f)] = CHAR_TO_PIECE[ch];
      f++;
    }
  }
  let castling = 0;
  if (castle.includes('K')) castling |= CASTLE_WK;
  if (castle.includes('Q')) castling |= CASTLE_WQ;
  if (castle.includes('k')) castling |= CASTLE_BK;
  if (castle.includes('q')) castling |= CASTLE_BQ;
  const state: ChessState = {
    board,
    turn: active === 'w' ? 1 : 2,
    castling,
    ep: ep === '-' ? -1 : sq88(8 - Number(ep[1]), ep.charCodeAt(0) - 97),
    halfmove: Number(half ?? 0),
    fullmove: Number(full ?? 1),
    last: null,
    san: [],
    seen: [],
  };
  state.seen = [positionKey(state)];
  return state;
}

export function initial(): ChessState {
  return fromFen(START);
}

export function squareName(sq: number) {
  return String.fromCharCode(97 + sqFile(sq)) + (8 - sqRank(sq));
}

export function positionKey(s: { board: number[]; turn: Side; castling: number; ep: number }) {
  let k = '';
  for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) k += s.board[sq88(r, f)].toString(36);
  return `${k}|${s.turn}|${s.castling}|${s.ep}`;
}

/* ----------------------------- move generation ---------------------------- */

const KNIGHT_OFF = [-33, -31, -18, -14, 14, 18, 31, 33];
const BISHOP_OFF = [-17, -15, 15, 17];
const ROOK_OFF = [-16, -1, 1, 16];
const KING_OFF = [-17, -16, -15, -1, 1, 15, 16, 17];

class Board {
  b: Int8Array;
  turn: number; // 0 white, 1 black
  castling: number;
  ep: number;
  half: number;
  kings = [0, 0];
  private undo: number[][] = [];

  constructor(s: ChessState) {
    this.b = Int8Array.from(s.board);
    this.turn = s.turn === 1 ? WHITE : BLACK;
    this.castling = s.castling;
    this.ep = s.ep;
    this.half = s.halfmove;
    for (let sq = 0; sq < 128; sq++) {
      if (!onBoard(sq)) continue;
      const p = this.b[sq];
      if (p && pieceType(p) === KING) this.kings[pieceColor(p)] = sq;
    }
  }

  attacked(sq: number, by: number) {
    // pawns
    const pawn = PAWN | (by << 3);
    if (by === WHITE) {
      if (onBoard(sq + 15) && this.b[sq + 15] === pawn) return true;
      if (onBoard(sq + 17) && this.b[sq + 17] === pawn) return true;
    } else {
      if (onBoard(sq - 15) && this.b[sq - 15] === pawn) return true;
      if (onBoard(sq - 17) && this.b[sq - 17] === pawn) return true;
    }
    const knight = KNIGHT | (by << 3);
    for (const o of KNIGHT_OFF) {
      const t = sq + o;
      if (onBoard(t) && this.b[t] === knight) return true;
    }
    const king = KING | (by << 3);
    for (const o of KING_OFF) {
      const t = sq + o;
      if (onBoard(t) && this.b[t] === king) return true;
    }
    for (const o of ROOK_OFF) {
      let t = sq + o;
      while (onBoard(t)) {
        const p = this.b[t];
        if (p) {
          if (pieceColor(p) === by) {
            const ty = pieceType(p);
            if (ty === ROOK || ty === QUEEN) return true;
          }
          break;
        }
        t += o;
      }
    }
    for (const o of BISHOP_OFF) {
      let t = sq + o;
      while (onBoard(t)) {
        const p = this.b[t];
        if (p) {
          if (pieceColor(p) === by) {
            const ty = pieceType(p);
            if (ty === BISHOP || ty === QUEEN) return true;
          }
          break;
        }
        t += o;
      }
    }
    return false;
  }

  inCheck(color = this.turn) {
    return this.attacked(this.kings[color], color ^ 1);
  }

  /** Packed move: from | to<<8 | promo<<16 | ep<<20 | castle<<21 */
  generate(capturesOnly = false): number[] {
    const out: number[] = [];
    const me = this.turn;
    const push = (from: number, to: number, promo = 0, flag = 0) => {
      out.push(from | (to << 8) | (promo << 16) | flag);
    };

    for (let from = 0; from < 128; from++) {
      if (!onBoard(from)) continue;
      const p = this.b[from];
      if (!p || pieceColor(p) !== me) continue;
      const ty = pieceType(p);

      if (ty === PAWN) {
        const dir = me === WHITE ? -16 : 16;
        const startRank = me === WHITE ? 6 : 1;
        const lastRank = me === WHITE ? 0 : 7;
        const one = from + dir;
        if (!capturesOnly && onBoard(one) && !this.b[one]) {
          if (sqRank(one) === lastRank) {
            for (const q of [QUEEN, ROOK, BISHOP, KNIGHT]) push(from, one, q);
          } else {
            push(from, one);
            const two = one + dir;
            if (sqRank(from) === startRank && !this.b[two]) push(from, two);
          }
        }
        for (const d of [dir - 1, dir + 1]) {
          const to = from + d;
          if (!onBoard(to)) continue;
          const target = this.b[to];
          if (target && pieceColor(target) !== me) {
            if (sqRank(to) === lastRank) {
              for (const q of [QUEEN, ROOK, BISHOP, KNIGHT]) push(from, to, q);
            } else push(from, to);
          } else if (!target && to === this.ep) {
            push(from, to, 0, 1 << 20);
          }
        }
        continue;
      }

      if (ty === KNIGHT || ty === KING) {
        const offs = ty === KNIGHT ? KNIGHT_OFF : KING_OFF;
        for (const o of offs) {
          const to = from + o;
          if (!onBoard(to)) continue;
          const t = this.b[to];
          if (t && pieceColor(t) === me) continue;
          if (capturesOnly && !t) continue;
          push(from, to);
        }
        continue;
      }

      const offs = ty === BISHOP ? BISHOP_OFF : ty === ROOK ? ROOK_OFF : KING_OFF;
      for (const o of offs) {
        let to = from + o;
        while (onBoard(to)) {
          const t = this.b[to];
          if (t) {
            if (pieceColor(t) !== me) push(from, to);
            break;
          }
          if (!capturesOnly) push(from, to);
          to += o;
        }
      }
    }

    if (!capturesOnly) {
      const home = me === WHITE ? 7 : 0;
      const kSq = sq88(home, 4);
      const kingSide = me === WHITE ? CASTLE_WK : CASTLE_BK;
      const queenSide = me === WHITE ? CASTLE_WQ : CASTLE_BQ;
      if (this.b[kSq] === (KING | (me << 3)) && !this.attacked(kSq, me ^ 1)) {
        if (
          this.castling & kingSide &&
          !this.b[kSq + 1] &&
          !this.b[kSq + 2] &&
          this.b[sq88(home, 7)] === (ROOK | (me << 3)) &&
          !this.attacked(kSq + 1, me ^ 1)
        ) {
          push(kSq, kSq + 2, 0, 1 << 21);
        }
        if (
          this.castling & queenSide &&
          !this.b[kSq - 1] &&
          !this.b[kSq - 2] &&
          !this.b[kSq - 3] &&
          this.b[sq88(home, 0)] === (ROOK | (me << 3)) &&
          !this.attacked(kSq - 1, me ^ 1)
        ) {
          push(kSq, kSq - 2, 0, 1 << 21);
        }
      }
    }

    return out;
  }

  make(mv: number) {
    const from = mv & 0xff;
    const to = (mv >> 8) & 0xff;
    const promo = (mv >> 16) & 7;
    const isEp = (mv >> 20) & 1;
    const isCastle = (mv >> 21) & 1;
    const p = this.b[from];
    const me = this.turn;
    let captureSq = to;
    if (isEp) captureSq = me === WHITE ? to + 16 : to - 16;
    const captured = this.b[captureSq];

    this.undo.push([this.castling, this.ep, this.half, captured, captureSq, this.kings[me]]);

    this.b[captureSq] = 0;
    this.b[from] = 0;
    this.b[to] = promo ? promo | (me << 3) : p;

    if (isCastle) {
      const home = me === WHITE ? 7 : 0;
      if (sqFile(to) === 6) {
        this.b[sq88(home, 5)] = this.b[sq88(home, 7)];
        this.b[sq88(home, 7)] = 0;
      } else {
        this.b[sq88(home, 3)] = this.b[sq88(home, 0)];
        this.b[sq88(home, 0)] = 0;
      }
    }

    if (pieceType(p) === KING) {
      this.kings[me] = to;
      this.castling &= me === WHITE ? ~(CASTLE_WK | CASTLE_WQ) : ~(CASTLE_BK | CASTLE_BQ);
    }
    if (from === sq88(7, 7) || to === sq88(7, 7)) this.castling &= ~CASTLE_WK;
    if (from === sq88(7, 0) || to === sq88(7, 0)) this.castling &= ~CASTLE_WQ;
    if (from === sq88(0, 7) || to === sq88(0, 7)) this.castling &= ~CASTLE_BK;
    if (from === sq88(0, 0) || to === sq88(0, 0)) this.castling &= ~CASTLE_BQ;

    this.ep =
      pieceType(p) === PAWN && Math.abs(to - from) === 32 ? (me === WHITE ? to + 16 : to - 16) : -1;
    this.half = captured || pieceType(p) === PAWN ? 0 : this.half + 1;
    this.turn ^= 1;
  }

  unmake(mv: number) {
    const from = mv & 0xff;
    const to = (mv >> 8) & 0xff;
    const promo = (mv >> 16) & 7;
    const isCastle = (mv >> 21) & 1;
    const [castling, ep, half, captured, captureSq, kingSq] = this.undo.pop()!;
    this.turn ^= 1;
    const me = this.turn;

    this.b[from] = promo ? PAWN | (me << 3) : this.b[to];
    this.b[to] = 0;
    this.b[captureSq] = captured;

    if (isCastle) {
      const home = me === WHITE ? 7 : 0;
      if (sqFile(to) === 6) {
        this.b[sq88(home, 7)] = this.b[sq88(home, 5)];
        this.b[sq88(home, 5)] = 0;
      } else {
        this.b[sq88(home, 0)] = this.b[sq88(home, 3)];
        this.b[sq88(home, 3)] = 0;
      }
    }

    this.kings[me] = kingSq;
    this.castling = castling;
    this.ep = ep;
    this.half = half;
  }

  legal(): number[] {
    const out: number[] = [];
    for (const mv of this.generate()) {
      this.make(mv);
      if (!this.attacked(this.kings[this.turn ^ 1], this.turn)) out.push(mv);
      this.unmake(mv);
    }
    return out;
  }
}

const unpack = (mv: number): ChessMove => ({
  from: mv & 0xff,
  to: (mv >> 8) & 0xff,
  promo: ((mv >> 16) & 7) || undefined,
});

export function legalMoves(state: ChessState): ChessMove[] {
  return new Board(state).legal().map(unpack);
}

export function legalTargets(state: ChessState, from: number): ChessMove[] {
  return legalMoves(state).filter((m) => m.from === from);
}

/* -------------------------------- SAN ---------------------------------- */

const LETTER = ['', '', 'N', 'B', 'R', 'Q', 'K'];

function toSan(state: ChessState, mv: number): string {
  const board = new Board(state);
  const from = mv & 0xff;
  const to = (mv >> 8) & 0xff;
  const promo = (mv >> 16) & 7;
  const isEp = (mv >> 20) & 1;
  const isCastle = (mv >> 21) & 1;
  const p = board.b[from];
  const ty = pieceType(p);
  const capture = !!board.b[to] || isEp;

  let san: string;
  if (isCastle) {
    san = sqFile(to) === 6 ? 'O-O' : 'O-O-O';
  } else if (ty === PAWN) {
    san = capture ? `${String.fromCharCode(97 + sqFile(from))}x${squareName(to)}` : squareName(to);
    if (promo) san += `=${LETTER[promo]}`;
  } else {
    const rivals = board
      .legal()
      .filter(
        (m) =>
          ((m >> 8) & 0xff) === to &&
          (m & 0xff) !== from &&
          pieceType(board.b[m & 0xff]) === ty,
      );
    let disamb = '';
    if (rivals.length) {
      const sameFile = rivals.some((m) => sqFile(m & 0xff) === sqFile(from));
      const sameRank = rivals.some((m) => sqRank(m & 0xff) === sqRank(from));
      if (!sameFile) disamb = String.fromCharCode(97 + sqFile(from));
      else if (!sameRank) disamb = String(8 - sqRank(from));
      else disamb = squareName(from);
    }
    san = `${LETTER[ty]}${disamb}${capture ? 'x' : ''}${squareName(to)}`;
  }

  board.make(mv);
  if (board.inCheck()) san += board.legal().length ? '+' : '#';
  return san;
}

/* ------------------------------ apply / status ---------------------------- */

function packMove(state: ChessState, move: ChessMove): number | null {
  for (const mv of new Board(state).legal()) {
    if ((mv & 0xff) === move.from && ((mv >> 8) & 0xff) === move.to) {
      const promo = (mv >> 16) & 7;
      if (promo && move.promo && promo !== move.promo) continue;
      if (promo && !move.promo && promo !== QUEEN) continue;
      return mv;
    }
  }
  return null;
}

/** Algebraic notation for a legal move, e.g. "Nf3" or "exd5+". */
export function describeMove(state: ChessState, move: ChessMove): string {
  const mv = packMove(state, move);
  return mv === null ? '' : toSan(state, mv);
}

export function apply(state: ChessState, move: ChessMove): ChessState {
  const mv = packMove(state, move);
  if (mv === null) return state;
  const san = toSan(state, mv);
  const board = new Board(state);
  board.make(mv);
  const next: ChessState = {
    board: Array.from(board.b),
    turn: board.turn === WHITE ? 1 : 2,
    castling: board.castling,
    ep: board.ep,
    halfmove: board.half,
    fullmove: state.fullmove + (state.turn === 2 ? 1 : 0),
    last: unpack(mv),
    san: [...state.san, san],
    seen: state.seen,
  };
  next.seen = [...state.seen, positionKey(next)];
  return next;
}

export function inCheck(state: ChessState): boolean {
  return new Board(state).inCheck();
}

function insufficientMaterial(board: ArrayLike<number>): boolean {
  const minors: number[] = [];
  for (let sq = 0; sq < 128; sq++) {
    if (!onBoard(sq)) continue;
    const p = board[sq];
    if (!p) continue;
    const ty = pieceType(p);
    if (ty === KING) continue;
    if (ty === PAWN || ty === ROOK || ty === QUEEN) return false;
    minors.push(p);
  }
  return minors.length <= 1;
}

export function outcome(state: ChessState): Outcome {
  const board = new Board(state);
  const moves = board.legal();
  if (moves.length === 0) {
    if (board.inCheck()) return { over: true, winner: state.turn === 1 ? 2 : 1, reason: 'checkmate' };
    return { over: true, winner: 0, reason: 'stalemate' };
  }
  if (state.halfmove >= 100) return { over: true, winner: 0, reason: 'fiftyMove' };
  if (insufficientMaterial(state.board))
    return { over: true, winner: 0, reason: 'insufficientMaterial' };
  const key = state.seen[state.seen.length - 1];
  if (state.seen.filter((k) => k === key).length >= 3)
    return { over: true, winner: 0, reason: 'repetition' };
  return LIVE;
}

/* ------------------------------- evaluation ------------------------------- */

const VALUE = [0, 100, 320, 330, 500, 950, 0];

// Tables are written from white's point of view with index 0 = a8.
const PST: Record<number, number[]> = {
  [PAWN]: [
    0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5,
    10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20,
    -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [KNIGHT]: [
    -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10,
    0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10,
    5, -30, -40, -20, 0, 5, 5, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50,
  ],
  [BISHOP]: [
    -20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0,
    -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10,
    -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10, -10, -10, -10, -10, -10, -20,
  ],
  [ROOK]: [
    0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0,
    0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0,
    5, 5, 0, 0, 0,
  ],
  [QUEEN]: [
    -20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 5, 5, 5, 0, -10,
    -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0,
    0, 0, -10, -20, -10, -10, -5, -5, -10, -10, -20,
  ],
  [KING]: [
    -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40,
    -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30,
    -30, -20, -10, -20, -20, -20, -20, -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0,
    10, 30, 20,
  ],
};

const KING_END = [
  -50, -40, -30, -20, -20, -30, -40, -50, -30, -20, -10, 0, 0, -10, -20, -30, -30, -10, 20, 30, 30,
  20, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10,
  20, 30, 30, 20, -10, -30, -30, -30, 0, 0, 0, 0, -30, -30, -50, -30, -30, -30, -30, -30, -30, -50,
];

function evaluate(bd: Board): number {
  let score = 0;
  let phase = 0;
  const bishops = [0, 0];
  const pawnFiles = [new Int8Array(8), new Int8Array(8)];

  for (let sq = 0; sq < 128; sq++) {
    if (!onBoard(sq)) continue;
    const p = bd.b[sq];
    if (!p) continue;
    const c = pieceColor(p);
    const ty = pieceType(p);
    if (ty !== PAWN && ty !== KING) phase += ty === QUEEN ? 4 : ty === ROOK ? 2 : 1;
    if (ty === BISHOP) bishops[c]++;
    if (ty === PAWN) pawnFiles[c][sqFile(sq)]++;
  }
  const endgame = phase <= 6;

  for (let sq = 0; sq < 128; sq++) {
    if (!onBoard(sq)) continue;
    const p = bd.b[sq];
    if (!p) continue;
    const c = pieceColor(p);
    const ty = pieceType(p);
    const i64 = c === WHITE ? sqRank(sq) * 8 + sqFile(sq) : (7 - sqRank(sq)) * 8 + sqFile(sq);
    const table = ty === KING && endgame ? KING_END : PST[ty];
    const v = VALUE[ty] + table[i64];
    score += c === WHITE ? v : -v;
  }

  for (const c of [WHITE, BLACK]) {
    const sign = c === WHITE ? 1 : -1;
    if (bishops[c] >= 2) score += sign * 35;
    for (let f = 0; f < 8; f++) {
      const n = pawnFiles[c][f];
      if (n > 1) score -= sign * 18 * (n - 1);
      if (n > 0 && !pawnFiles[c][f - 1] && !pawnFiles[c][f + 1]) score -= sign * 14;
    }
  }

  const mobility = bd.generate().length;
  score += (bd.turn === WHITE ? mobility : -mobility) * 2;

  return bd.turn === WHITE ? score : -score;
}

/* --------------------------------- search --------------------------------- */

const TIMEOUT = Symbol('timeout');
const MATE = 100000;

function mvvLva(bd: Board, mv: number) {
  const to = (mv >> 8) & 0xff;
  const from = mv & 0xff;
  const victim = bd.b[to];
  if (!victim) return ((mv >> 16) & 7) ? 800 : 0;
  return VALUE[pieceType(victim)] * 10 - VALUE[pieceType(bd.b[from])];
}

function quiesce(bd: Board, alpha: number, beta: number, deadline: number, depth: number): number {
  if (Date.now() > deadline) throw TIMEOUT;
  const stand = evaluate(bd);
  if (stand >= beta) return beta;
  if (stand > alpha) alpha = stand;
  if (depth <= 0) return alpha;

  const caps = bd
    .generate(true)
    .map((mv) => ({ mv, s: mvvLva(bd, mv) }))
    .sort((a, b) => b.s - a.s);

  for (const { mv } of caps) {
    bd.make(mv);
    if (bd.attacked(bd.kings[bd.turn ^ 1], bd.turn)) {
      bd.unmake(mv);
      continue;
    }
    const v = -quiesce(bd, -beta, -alpha, deadline, depth - 1);
    bd.unmake(mv);
    if (v >= beta) return beta;
    if (v > alpha) alpha = v;
  }
  return alpha;
}

const killers: number[][] = Array.from({ length: 40 }, () => [0, 0]);

function negamax(
  bd: Board,
  depth: number,
  ply: number,
  alpha: number,
  beta: number,
  deadline: number,
): number {
  if (Date.now() > deadline) throw TIMEOUT;
  const check = bd.inCheck();
  if (check && ply < 16) depth++; // check extension, capped so perpetuals cannot recurse forever

  if (depth <= 0) return quiesce(bd, alpha, beta, deadline, 6);

  const moves = bd.generate();
  const km = killers[Math.min(ply, killers.length - 1)];
  moves.sort(
    (a, b) =>
      mvvLva(bd, b) - mvvLva(bd, a) + (b === km[0] || b === km[1] ? 500 : 0) -
      (a === km[0] || a === km[1] ? 500 : 0),
  );

  let legal = 0;
  let best = -Infinity;
  for (const mv of moves) {
    bd.make(mv);
    if (bd.attacked(bd.kings[bd.turn ^ 1], bd.turn)) {
      bd.unmake(mv);
      continue;
    }
    legal++;
    const v = -negamax(bd, depth - 1, ply + 1, -beta, -alpha, deadline);
    bd.unmake(mv);
    if (v > best) best = v;
    if (best > alpha) alpha = best;
    if (alpha >= beta) {
      if (!bd.b[(mv >> 8) & 0xff]) {
        km[1] = km[0];
        km[0] = mv;
      }
      break;
    }
  }

  if (legal === 0) return check ? -MATE + ply : 0;
  if (bd.half >= 100) return 0;
  return best;
}

const MAX_DEPTH: Record<Level, number> = { 1: 1, 2: 3, 3: 6, 4: 64 };

export function bestMove(state: ChessState, level: Level = 3): ChessMove | null {
  const bd = new Board(state);
  const roots = bd.legal();
  if (roots.length === 0) return null;
  if (roots.length === 1) return unpack(roots[0]);

  if (level === 1) {
    // Beginner: sees hanging material one ply deep, otherwise wanders.
    const scored = roots.map((mv) => {
      bd.make(mv);
      const v = -evaluate(bd) + Math.random() * 60;
      bd.unmake(mv);
      return { mv, v };
    });
    scored.sort((a, b) => b.v - a.v);
    return unpack(scored[0].mv);
  }

  for (const k of killers) k[0] = k[1] = 0;

  const deadline = Date.now() + TIME_BUDGET[level];
  let order = roots
    .map((mv) => ({ mv, s: mvvLva(bd, mv) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.mv);
  let chosen = order[0];

  for (let depth = 1; depth <= MAX_DEPTH[level]; depth++) {
    let alpha = -Infinity;
    let localBest = order[0];
    const scored: { mv: number; v: number }[] = [];
    try {
      for (const mv of order) {
        bd.make(mv);
        const v = -negamax(bd, depth - 1, 1, -Infinity, -alpha, deadline);
        bd.unmake(mv);
        scored.push({ mv, v });
        if (v > alpha) {
          alpha = v;
          localBest = mv;
        }
      }
    } catch (e) {
      if (e !== TIMEOUT) throw e;
      break;
    }
    chosen = localBest;
    scored.sort((a, b) => b.v - a.v);
    order = scored.map((s) => s.mv);
    if (alpha > MATE - 100) break;
    if (Date.now() > deadline) break;
  }

  return unpack(chosen);
}
