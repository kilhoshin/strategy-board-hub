'use client';

import dynamic from 'next/dynamic';
import type { GameId } from '@/lib/games/types';
import type { Dictionary } from '@/lib/i18n/types';

/**
 * Boards and search engines are deferred so the first paint is just markup and
 * CSS — the plan calls for keeping LCP clean while the heavy code streams in.
 */
function Skeleton({ label }: { label: string }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div>
        <div className="panel mb-4 h-11 animate-pulse" />
        <div className="board-wood mx-auto aspect-square w-full max-w-[620px] animate-pulse rounded-[14px] opacity-40" />
      </div>
      <div className="flex flex-col gap-4">
        <div className="panel h-56 animate-pulse" />
        <div className="panel h-40 animate-pulse" />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

// next/dynamic requires its options to be an inline object literal, so these
// cannot be factored into a shared helper.
const Games = {
  gomoku: dynamic(() => import('./GomokuGame').then((m) => m.GomokuGame), {
    ssr: false,
    loading: () => <Skeleton label="gomoku" />,
  }),
  reversi: dynamic(() => import('./ReversiGame').then((m) => m.ReversiGame), {
    ssr: false,
    loading: () => <Skeleton label="reversi" />,
  }),
  chess: dynamic(() => import('./ChessGame').then((m) => m.ChessGame), {
    ssr: false,
    loading: () => <Skeleton label="chess" />,
  }),
  janggi: dynamic(() => import('./JanggiGame').then((m) => m.JanggiGame), {
    ssr: false,
    loading: () => <Skeleton label="janggi" />,
  }),
  shogi: dynamic(() => import('./ShogiGame').then((m) => m.ShogiGame), {
    ssr: false,
    loading: () => <Skeleton label="shogi" />,
  }),
  go: dynamic(() => import('./GoGame').then((m) => m.GoGame), {
    ssr: false,
    loading: () => <Skeleton label="go" />,
  }),
} as const;

export function GameStage({
  game,
  dict,
  hubHref,
}: {
  game: GameId;
  dict: Dictionary;
  hubHref: string;
}) {
  const Board = Games[game];
  return <Board dict={dict} hubHref={hubHref} />;
}
