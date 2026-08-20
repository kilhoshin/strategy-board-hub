import { Link } from '@/components/site/Link';
import type { GameId } from '@/lib/games/types';
import { PUZZLE_GAMES, gamePath, puzzlePath, type Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/types';
import { Reveal } from '@/components/site/Reveal';
import { PuzzleStage } from '@/components/game/PuzzleStage';

export function PuzzleView({
  locale,
  dict,
  game,
}: {
  locale: Locale;
  dict: Dictionary;
  game: GameId;
}) {
  const c = dict.games[game];
  const p = dict.puzzle;
  const others = PUZZLE_GAMES.filter((g) => g !== game);

  return (
    <>
      <section className="relative isolate">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 h-[420px]"
          style={{
            background:
              'radial-gradient(60% 100% at 50% 0%, rgba(232,194,116,0.13), transparent 72%)',
          }}
        />
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 lg:px-8 lg:pt-16">
          <Reveal>
            <p className="eyebrow">{c.name}</p>
            <h1 className="display mt-2 text-[clamp(2.4rem,7vw,4.5rem)]">
              <span className="gold-text">{p.title}</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--fg-muted)] sm:text-base">
              {p.tagline}
            </p>
            <Link
              href={gamePath(locale, game)}
              className="mt-4 inline-block text-sm text-[var(--fg-muted)] underline underline-offset-2 transition-colors hover:text-[var(--fg)]"
            >
              ← {p.backToGame}
            </Link>
          </Reveal>

          <div className="mt-10">
            <PuzzleStage game={game} dict={dict} />
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <Reveal>
            <div className="rule mb-8" />
            <p className="eyebrow">{dict.sections.otherGames}</p>
          </Reveal>
          <div className="mt-4 flex flex-wrap gap-3">
            {others.map((g) => (
              <Link
                key={g}
                href={puzzlePath(locale, g)}
                className="btn"
              >
                {dict.games[g].name} {p.title}
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
