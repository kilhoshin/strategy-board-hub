'use client';

import dynamic from 'next/dynamic';
import type { GameId } from '@/lib/games/types';
import type { Dictionary } from '@/lib/i18n/types';

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
const Puzzles = {
  chess: dynamic(() => import('./ChessPuzzle').then((m) => m.ChessPuzzle), {
    ssr: false,
    loading: () => <Skeleton label="chess puzzles" />,
  }),
  janggi: dynamic(() => import('./JanggiPuzzle').then((m) => m.JanggiPuzzle), {
    ssr: false,
    loading: () => <Skeleton label="janggi puzzles" />,
  }),
  shogi: dynamic(() => import('./ShogiPuzzle').then((m) => m.ShogiPuzzle), {
    ssr: false,
    loading: () => <Skeleton label="shogi puzzles" />,
  }),
} as const;

export function PuzzleStage({ game, dict }: { game: GameId; dict: Dictionary }) {
  const Board = Puzzles[game as keyof typeof Puzzles];
  if (!Board) return null;
  return <Board dict={dict} />;
}
