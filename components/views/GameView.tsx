import { Link } from '@/components/site/Link';
import { GAME_IDS, type GameId } from '@/lib/games/types';
import { PUZZLE_GAMES, type Locale, gamePath, puzzlePath } from '@/lib/i18n/config';
import { LEARN, LEARN_TITLE } from '@/lib/i18n/learn';
import type { Dictionary } from '@/lib/i18n/types';
import { AdSlot } from '@/components/site/AdSlot';
import { BoardPreview } from '@/components/site/BoardPreview';
import { Reveal } from '@/components/site/Reveal';
import { GameStage } from '@/components/game/GameStage';

export function GameView({
  locale,
  dict,
  game,
}: {
  locale: Locale;
  dict: Dictionary;
  game: GameId;
}) {
  const c = dict.games[game];
  const learn = LEARN[locale][game];
  const others = GAME_IDS.filter((g) => g !== game);
  const hubHref = `${gamePath(locale, game)}#more`;

  const toc = [
    { id: 'rules', label: c.rulesTitle },
    { id: 'strategy', label: c.strategyTitle },
    { id: 'learn', label: LEARN_TITLE[locale] },
    { id: 'history', label: c.historyTitle },
    { id: 'faq', label: c.faqTitle },
  ];

  return (
    <>
      {/* ---------------------------- board ---------------------------- */}
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
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">{c.aka}</p>
                <h1 className="display mt-2 text-[clamp(2.4rem,7vw,4.5rem)]">
                  <span className="gold-text">{c.name}</span>
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--fg-muted)] sm:text-base">
                  {c.tagline}
                </p>
                {PUZZLE_GAMES.includes(game) && (
                  <Link href={puzzlePath(locale, game)} className="btn btn-primary mt-4 inline-flex w-fit">
                    <span aria-hidden="true">✦</span>
                    {dict.puzzle.title}
                  </Link>
                )}
              </div>
              <div className="hidden h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-1 ring-[var(--hairline-strong)] sm:block">
                <BoardPreview game={game} id={`hero-${game}`} />
              </div>
            </div>
          </Reveal>

          <div className="mt-10">
            <GameStage game={game} dict={dict} hubHref={hubHref} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <AdSlot
          slot={process.env.NEXT_PUBLIC_AD_SLOT_UNDER_BOARD}
          variant="leaderboard"
          label="under board"
          className="mt-4"
        />
      </div>

      {/* --------------------------- content --------------------------- */}
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <nav aria-label={dict.sections.onThisPage} className="panel px-5 py-4">
            <p className="eyebrow mb-3">{dict.sections.onThisPage}</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="text-[var(--fg-muted)] transition-colors hover:text-[var(--accent)]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Reveal>

        <article className="prose-hub mt-14">
          <Reveal as="section">
            <div id="rules" className="scroll-mt-24">
              <h2>{c.rulesTitle}</h2>
              <ol className="mt-6 space-y-4">
                {c.rules.map((rule, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--hairline-strong)] text-[0.7rem] font-semibold text-[var(--accent)]">
                      {i + 1}
                    </span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>

          <div className="rule my-14" />

          <AdSlot
            slot={process.env.NEXT_PUBLIC_AD_SLOT_IN_ARTICLE}
            variant="in-article"
            label="in article"
            className="mb-14"
          />

          <Reveal as="section">
            <div id="strategy" className="scroll-mt-24">
              <h2>{c.strategyTitle}</h2>
              <div className="mt-6 space-y-7">
                {c.strategy.map((item, i) => (
                  <div key={i} className="border-l-2 border-[var(--hairline-strong)] pl-5">
                    <h3 className="!mt-0">{item.h}</h3>
                    <p>{item.p}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="rule my-14" />

          <Reveal as="section">
            <div id="learn" className="scroll-mt-24">
              <h2>{LEARN_TITLE[locale]}</h2>
              <div className="mt-6 space-y-7">
                {learn.map((item, i) => (
                  <div key={i} className="border-l-2 border-[var(--hairline-strong)] pl-5">
                    <h3 className="!mt-0">{item.h}</h3>
                    <p>{item.p}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="rule my-14" />

          <Reveal as="section">
            <div id="history" className="scroll-mt-24">
              <h2>{c.historyTitle}</h2>
              <div className="mt-6">
                {c.history.map((para, i) => (
                  <p key={i} className={i > 0 ? 'mt-4' : ''}>
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="rule my-14" />

          <Reveal as="section">
            <div id="faq" className="scroll-mt-24">
              <h2>{c.faqTitle}</h2>
              <dl className="mt-6 divide-y divide-[var(--hairline)]">
                {c.faq.map((item, i) => (
                  <div key={i} className="py-5">
                    <dt className="font-semibold text-[var(--fg)]">{item.q}</dt>
                    <dd className="mt-2">{item.a}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </article>
      </div>

      {/* ------------------------- other games ------------------------- */}
      <section id="more" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-8 sm:px-6 lg:px-8">
        <Reveal>
          <div className="rule mb-12" />
          <p className="eyebrow">{dict.sections.otherGames}</p>
          <h2 className="display mt-3 text-[clamp(1.7rem,4vw,2.6rem)]">
            {dict.sections.otherGamesNote}
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {others.map((other, i) => (
            <Reveal key={other} delay={i * 60}>
              <Link
                href={gamePath(locale, other)}
                className="frame group flex h-full items-center gap-4 rounded-xl border border-[var(--hairline)] bg-[var(--surface)] p-3 transition-transform duration-500 hover:-translate-y-1 lg:flex-col lg:items-start lg:p-4"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg ring-1 ring-black/25 transition-transform duration-500 group-hover:rotate-[-3deg] lg:h-full lg:w-full">
                  <BoardPreview game={other} id={`more-${game}-${other}`} />
                </div>
                <div className="min-w-0">
                  <div className="display text-lg">{dict.games[other].name}</div>
                  <div className="truncate text-[0.7rem] text-[var(--fg-muted)]">
                    {dict.games[other].aka}
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
