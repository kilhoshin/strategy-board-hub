export type GameId = 'gomoku' | 'reversi' | 'janggi' | 'chess' | 'shogi' | 'go' | 'baghchal';

export const GAME_IDS: GameId[] = [
  'gomoku',
  'reversi',
  'janggi',
  'chess',
  'shogi',
  'go',
  'baghchal',
];

/** 1 = the side that moves first (black / white-in-chess / Cho / Sente), 2 = the responder. */
export type Side = 1 | 2;

export type Level = 1 | 2 | 3 | 4;

/** Wall-clock budget the search is allowed to burn, per difficulty. */
export const TIME_BUDGET: Record<Level, number> = { 1: 120, 2: 500, 3: 1600, 4: 4200 };

export interface Outcome {
  over: boolean;
  /** 0 = draw, 1 / 2 = winning side. Undefined while the game is live. */
  winner?: 0 | Side;
  /** Machine-readable reason key, resolved to a localised string by the UI. */
  reason?: string;
}

export const LIVE: Outcome = { over: false };

export function other(side: Side): Side {
  return side === 1 ? 2 : 1;
}

/** Deterministic-ish PRNG so playouts stay reproducible inside one search. */
export function makeRng(seed: number) {
  let s = seed >>> 0 || 0x2f6e2b1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 0x100000000;
  };
}
