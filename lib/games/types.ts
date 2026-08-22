export type GameId =
  | 'gomoku'
  | 'reversi'
  | 'janggi'
  | 'chess'
  | 'shogi'
  | 'go'
  | 'baghchal'
  | 'xiangqi'
  | 'oware';

export const GAME_IDS: GameId[] = [
  'gomoku',
  'reversi',
  'janggi',
  'chess',
  'shogi',
  'go',
  'baghchal',
  'xiangqi',
  'oware',
];

/**
 * Cultural/historical lineage each game belongs to — drives menu grouping and
 * category content as the catalogue grows toward other traditions (mancala,
 * tafl, draughts, ancient race games, ...). Order here is the display order
 * once a game is added to a culture with 2+ members; see gen-routes.mjs and
 * scripts/gen-routes.mjs for how GAME_IDS itself feeds routing.
 */
export type Culture =
  | 'go' // Go on its own — no close traditional cousin in the catalogue yet.
  | 'chaturanga' // Chess-family war games: chess, janggi, shogi, (future) xiangqi, makruk...
  | 'hunt' // Asymmetric predator-vs-prey games: baghchal, (future) fox & geese...
  | 'tafl' // Viking/Celtic siege-and-escape games.
  | 'mancala' // Sowing/count-and-capture games.
  | 'gonu' // Placement/alignment/blocking games (Korean gonu, nine men's morris...).
  | 'draughts' // Jump-capture games beyond standard checkers (fanorona, surakarta...).
  | 'race' // Dice/stick race games (senet, royal game of ur, pachisi...) — needs a
  // stochastic (expectiminimax-style) engine, not yet supported by bestMove().
  | 'modern'; // Games without a pre-20th-century lineage: gomoku, reversi.

export const GAME_CULTURE: Record<GameId, Culture> = {
  go: 'go',
  chess: 'chaturanga',
  janggi: 'chaturanga',
  shogi: 'chaturanga',
  xiangqi: 'chaturanga',
  baghchal: 'hunt',
  gomoku: 'modern',
  reversi: 'modern',
  oware: 'mancala',
};

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
