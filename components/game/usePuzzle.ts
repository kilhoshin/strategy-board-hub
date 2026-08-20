'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Outcome, Side } from '@/lib/games/types';
import type { PuzzleBase } from '@/lib/puzzles/types';

interface Options<S, M, P extends PuzzleBase<M>> {
  puzzles: P[];
  /** The position before any of the puzzle's own moves — `initial()`, or a parsed FEN for chess. */
  base: (puzzle: P) => S;
  apply: (state: S, move: M) => S;
  outcome: (state: S) => Outcome;
  turn: (state: S) => Side;
  movesEqual: (a: M, b: M) => boolean;
}

export type PuzzleStatus = 'active' | 'wrong' | 'solved';

export interface Puzzle<S, M, P extends PuzzleBase<M>> {
  puzzle: P;
  index: number;
  total: number;
  state: S;
  outcome: Outcome;
  status: PuzzleStatus;
  myTurn: boolean;
  play: (move: M) => void;
  retry: () => void;
  next: () => void;
  showHint: boolean;
  toggleHint: () => void;
  hintMove: M | null;
}

const WRONG_FLASH_MS = 700;

/**
 * Drives one puzzle at a time from a fixed set: the opponent's moves are the
 * puzzle's own scripted solution (no engine call), and a player move is
 * checked against the next expected solution move rather than validated by
 * search. Deliberately not `useMatch` — puzzles have no side/level pickers
 * and no free play, so sharing that hook would mean threading a lot of
 * puzzle-shaped exceptions through match semantics built for free play.
 */
export function usePuzzle<S, M, P extends PuzzleBase<M>>({
  puzzles,
  base,
  apply,
  outcome,
  turn,
  movesEqual,
}: Options<S, M, P>): Puzzle<S, M, P> {
  const [index, setIndex] = useState(0);
  const puzzle = puzzles[index];

  const start = useMemo(() => {
    let s = base(puzzle);
    for (const move of puzzle.setupMoves) s = apply(s, move);
    return s;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzle]);

  const [state, setState] = useState(start);
  const [solutionIndex, setSolutionIndex] = useState(0);
  const [status, setStatus] = useState<PuzzleStatus>('active');
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setState(start);
    setSolutionIndex(0);
    setStatus('active');
    setShowHint(false);
  }, [start]);

  useEffect(() => {
    if (status !== 'wrong') return;
    const id = window.setTimeout(() => setStatus('active'), WRONG_FLASH_MS);
    return () => window.clearTimeout(id);
  }, [status]);

  const myTurn = status === 'active' && turn(state) === puzzle.sideToMove;

  const play = (move: M) => {
    if (status !== 'active') return;
    const expected = puzzle.solution[solutionIndex];
    if (!movesEqual(move, expected)) {
      setStatus('wrong');
      return;
    }
    setShowHint(false);
    const afterMine = apply(state, move);
    const opponentIndex = solutionIndex + 1;
    if (opponentIndex >= puzzle.solution.length) {
      setState(afterMine);
      setSolutionIndex(opponentIndex);
      setStatus('solved');
      return;
    }
    const afterOpponent = apply(afterMine, puzzle.solution[opponentIndex]);
    setState(afterOpponent);
    setSolutionIndex(opponentIndex + 1);
  };

  const retry = () => {
    setState(start);
    setSolutionIndex(0);
    setStatus('active');
    setShowHint(false);
  };

  const next = () => setIndex((i) => (i + 1) % puzzles.length);
  const toggleHint = () => setShowHint((v) => !v);
  const hintMove = showHint && status === 'active' ? (puzzle.solution[solutionIndex] ?? null) : null;

  return {
    puzzle,
    index,
    total: puzzles.length,
    state,
    outcome: outcome(state),
    status,
    myTurn,
    play,
    retry,
    next,
    showHint,
    toggleHint,
    hintMove,
  };
}
