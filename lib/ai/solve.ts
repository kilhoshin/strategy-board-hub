import * as gomoku from '../games/gomoku';
import * as reversi from '../games/reversi';
import * as chess from '../games/chess';
import * as janggi from '../games/janggi';
import * as shogi from '../games/shogi';
import * as go from '../games/go';
import type { GameId, Level } from '../games/types';

export interface AiRequest {
  id: number;
  game: GameId;
  level: Level;
  state: unknown;
}

export interface AiResponse {
  id: number;
  move: unknown;
  error?: string;
}

/** Single entry point shared by the worker and the main-thread fallback. */
export function solve({ game, state, level }: Omit<AiRequest, 'id'>): unknown {
  switch (game) {
    case 'gomoku':
      return gomoku.bestMove(state as gomoku.GomokuState, level);
    case 'reversi':
      return reversi.bestMove(state as reversi.ReversiState, level);
    case 'chess':
      return chess.bestMove(state as chess.ChessState, level);
    case 'janggi':
      return janggi.bestMove(state as janggi.JanggiState, level);
    case 'shogi':
      return shogi.bestMove(state as shogi.ShogiState, level);
    case 'go':
      return go.bestMove(state as go.GoState, level);
    default:
      return null;
  }
}
