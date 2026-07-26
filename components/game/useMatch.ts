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

  /* --- AI hint --------------------------------------------------------- */
  /** Whether the hint control is offered at all; persisted per browser. */
  hintsEnabled: boolean;
  setHintsEnabled: (on: boolean) => void;
  /** The current suggestion, or null when none has been asked for. */
  hint: M | null;
  hintLoading: boolean;
  /** True once a hint was requested but the engine had nothing to offer. */
  hintEmpty: boolean;
  requestHint: () => void;
  clearHint: () => void;
  canHint: boolean;
}

const HINT_PREF_KEY = 'sbh-hints';

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

  const [hintsEnabled, setHintsEnabledState] = useState(true);
  const [hint, setHint] = useState<M | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintEmpty, setHintEmpty] = useState(false);

  const state = history[history.length - 1];
  /** Lets async hint callbacks tell whether the position has moved on. */
  const latest = useRef(state);
  latest.current = state;
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

  /* ------------------------------ AI hint ------------------------------ */

  useEffect(() => {
    try {
      setHintsEnabledState(window.localStorage.getItem(HINT_PREF_KEY) !== 'off');
    } catch {
      /* private mode — keep the default */
    }
  }, []);

  const setHintsEnabled = useCallback((on: boolean) => {
    setHintsEnabledState(on);
    if (!on) {
      setHint(null);
      setHintEmpty(false);
    }
    try {
      window.localStorage.setItem(HINT_PREF_KEY, on ? 'on' : 'off');
    } catch {
      /* nothing to persist to */
    }
  }, []);

  const clearHint = useCallback(() => {
    setHint(null);
    setHintEmpty(false);
  }, []);

  // A suggestion is only about the position it was computed for.
  useEffect(() => {
    setHint(null);
    setHintEmpty(false);
  }, [state]);

  const canHint = hintsEnabled && myTurn && !thinking && !hintLoading;

  const requestHint = useCallback(() => {
    if (!canHint) return;
    const forState = state;
    setHintLoading(true);
    setHintEmpty(false);
    (async () => {
      // The advisor is the same engine as the opponent, at the same level —
      // which is exactly why the UI says it can be wrong.
      const move = await think<M>(game, forState, level, { silent: true });
      setHintLoading(false);
      // Ignore a suggestion the player has already moved past.
      if (latest.current !== forState) return;
      if (move === null || move === undefined) setHintEmpty(true);
      else setHint(move);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canHint, state, game, level]);

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
    hintsEnabled,
    setHintsEnabled,
    hint,
    hintLoading,
    hintEmpty,
    requestHint,
    clearHint,
    canHint,
  };
}
