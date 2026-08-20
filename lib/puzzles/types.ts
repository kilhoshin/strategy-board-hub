import type { ChessMove } from '../games/chess';
import type { JanggiMove } from '../games/janggi';
import type { ShogiMove } from '../games/shogi';
import type { Side } from '../games/types';

/** 1 = mate-in-1 (easiest) ... 3 = mate-in-3 (hardest) of the puzzle set. */
export type PuzzleTier = 1 | 2 | 3;

export interface PuzzleBase<M> {
  id: string;
  /** The solver's side once play reaches the actual puzzle position (after `setupMoves`). */
  sideToMove: Side;
  /** Every move of the forced line from the puzzle position, alternating solver/opponent, ending in mate. */
  solution: M[];
  /**
   * Moves silently replayed from the starting position (`initial()`, or the
   * chess FEN below) before the puzzle begins. For chess this is just the
   * opponent's one setup move (Lichess FENs are the position *before* it);
   * for janggi/shogi, which have no FEN-equivalent importer, it's the whole
   * self-play prefix that reached the puzzle position.
   */
  setupMoves: M[];
  tier: PuzzleTier;
  source: 'lichess' | 'generated';
}

export interface ChessPuzzle extends PuzzleBase<ChessMove> {
  fen: string;
}

export type JanggiPuzzle = PuzzleBase<JanggiMove>;
export type ShogiPuzzle = PuzzleBase<ShogiMove>;
