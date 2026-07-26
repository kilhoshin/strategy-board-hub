'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameId, Level } from '../games/types';
import type { AiRequest, AiResponse } from './solve';

/**
 * Runs the search in a Web Worker so a four-second Go ponder never freezes the
 * page. If the worker cannot be created (older browser, blocked blob) we fall
 * back to the main thread after yielding a frame, so the "thinking" state is
 * at least painted first.
 */
export function useEngine() {
  const workerRef = useRef<Worker | null>(null);
  const pending = useRef(new Map<number, (move: unknown) => void>());
  const nextId = useRef(1);
  const [thinking, setThinking] = useState(false);

  useEffect(() => {
    let worker: Worker | null = null;
    try {
      worker = new Worker(new URL('./engine.worker.ts', import.meta.url));
      worker.onmessage = (event: MessageEvent<AiResponse>) => {
        const resolve = pending.current.get(event.data.id);
        if (resolve) {
          pending.current.delete(event.data.id);
          resolve(event.data.move);
        }
      };
      workerRef.current = worker;
    } catch {
      workerRef.current = null;
    }
    return () => {
      worker?.terminate();
      workerRef.current = null;
      pending.current.clear();
    };
  }, []);

  const think = useCallback(
    async <T,>(
      game: GameId,
      state: unknown,
      level: Level,
      /** Hint lookups pass `silent` so they do not read as "the AI is moving". */
      options: { silent?: boolean } = {},
    ): Promise<T | null> => {
      if (!options.silent) setThinking(true);
      try {
        const worker = workerRef.current;
        if (worker) {
          const id = nextId.current++;
          const move = await new Promise<unknown>((resolve) => {
            pending.current.set(id, resolve);
            const req: AiRequest = { id, game, level, state };
            worker.postMessage(req);
          });
          return move as T | null;
        }
        const { solve } = await import('./solve');
        await new Promise((r) => setTimeout(r, 30));
        return solve({ game, level, state }) as T | null;
      } finally {
        if (!options.silent) setThinking(false);
      }
    },
    [],
  );

  return { think, thinking };
}
