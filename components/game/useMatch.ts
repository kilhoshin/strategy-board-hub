'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEngine } from '@/lib/ai/useEngine';
import type { GameId, Level, Outcome, Side } from '@/lib/games/types';

interface Options<S, M> {
  game: GameId;
  create: () => S;
  apply: (state: S, move: M) => S;
  outcome: (state: S) => Outcome;
  turn: (state: S) => Side;
  /** Optional: called when the AI returns null (no move available). */
  onStuck?: (state: S) => S | null;
}

export interface Match<S, M> {
  state: S;
  history: S[];
  level: Level;
  setLevel: (l: Level) => void;
  mySide: Side;
  chooseSide: (side: Side) => void;
  result: Outcome;
  thinking: boolean;
  myTurn: boolean;
  play: (move: M) => void;
  undo: () => void;
  reset: (nextState?: S) => void;
  canUndo: boolean;
}

/**
 * Shared match loop: holds the position history, drives the AI whenever it is
 * the engine's turn, and keeps undo aligned to whole rounds.
 */
export function useMatch<S, M>({
  game,
  create,
  apply,
  outcome,
  turn,
  onStuck,
}: Options<S, M>): Match<S, M> {
  const [history, setHistory] = useState<S[]>(() => [create()]);
  const [level, setLevel] = useState<Level>(2);
  const [mySide, setMySide] = useState<Side>(1);
  const { think, thinking } = useEngine();
  const busy = useRef(false);

  const state = history[history.length - 1];
  const result = outcome(state);
  const myTurn = turn(state) === mySide && !result.over;

  const play = useCallback(
    (move: M) => {
      setHistory((prev) => {
        const current = prev[prev.length - 1];
        const next = apply(current, move);
        if (next === current) return prev;
        return [...prev, next];
      });
    },
    [apply],
  );

  // Drive the engine whenever it is its turn.
  useEffect(() => {
    if (result.over || turn(state) === mySide || busy.current) return;
    let cancelled = false;
    busy.current = true;
    (async () => {
      const move = await think<M>(game, state, level);
      if (cancelled) {
        busy.current = false;
        return;
      }
      setHistory((prev) => {
        const current = prev[prev.length - 1];
        if (current !== state) return prev; // the player reset or undid meanwhile
        if (move === null || move === undefined) {
          const fallback = onStuck?.(current);
          return fallback ? [...prev, fallback] : prev;
        }
        const next = apply(current, move);
        return next === current ? prev : [...prev, next];
      });
      busy.current = false;
    })();
    return () => {
      cancelled = true;
      busy.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, mySide, level, result.over]);

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.length <= 1) return prev;
      // Step back to the most recent position where it is the player's turn.
      let i = prev.length - 2;
      while (i > 0 && turn(prev[i]) !== mySide) i--;
      return prev.slice(0, i + 1);
    });
  }, [mySide, turn]);

  const reset = useCallback(
    (nextState?: S) => {
      busy.current = false;
      setHistory([nextState ?? create()]);
    },
    [create],
  );

  const chooseSide = useCallback(
    (side: Side) => {
      busy.current = false;
      setMySide(side);
      setHistory([create()]);
    },
    [create],
  );

  return {
    state,
    history,
    level,
    setLevel,
    mySide,
    chooseSide,
    result,
    thinking,
    myTurn,
    play,
    undo,
    reset,
    canUndo: history.length > 1 && !thinking,
  };
}
