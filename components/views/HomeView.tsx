import { Link } from '@/components/site/Link';
import { GAME_IDS } from '@/lib/games/types';
import { type Locale, gamePath, localePath } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/types';
import { AdSlot } from '@/components/site/AdSlot';
import { BoardPreview } from '@/components/site/BoardPreview';
import { GameCard } from '@/components/site/GameCard';
import { HeroCanvas } from '@/components/site/HeroCanvas';
import { Reveal } from '@/components/site/Reveal';

const FLOATERS = [
  { game: 'go' as const, className: 'right-0 top-0 h-56 w-56', delay: 0, rotate: 5 },
  { game: 'shogi' as const, className: 'right-48 top-40 h-40 w-40', delay: 1400, rotate: -7 },
  { game: 'chess' as const, className: 'right-10 top-64 h-36 w-36', delay: 2800, rotate: 10 },
];

export function HomeView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <HeroCanvas />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(70% 55% at 50% 8%, rgba(232,194,116,0.15), transparent 70%), radial-gradient(90% 60% at 50% 100%, var(--bg), transparent 60%)',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pb-28 lg:pt-36">
          {/* Floating board vignettes — decorative, hidden on small screens. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-6 top-24 hidden w-[26rem] xl:block"
          >
            {FLOATERS.map(({ game, className, delay, rotate }) => (
              <div
                key={game}
                className={`float-slow absolute overflow-hidden rounded-2xl shadow-[0_40px_80px_-30px_rgba(0,0,0,0.95)] ring-1 ring-[rgba(232,194,116,0.22)] ${className}`}
                style={{ animationDelay: `${delay}ms`, transform: `rotate(${rotate}deg)` }}
              >
                <BoardPreview game={game} id={`float-${game}`} />
              </div>
            ))}
          </div>

          <Reveal>
            <span className="chip !border-[rgba(232,194,116,0.35)] !text-[var(--accent)]">
              {dict.hero.eyebrow}
            </span>
          </Reveal>

          <Reveal delay={90}>
            <h1 className="display mt-7 text-[clamp(2.9rem,10vw,7.5rem)]">
              <span className="block opacity-90">{dict.hero.titleLine1}</span>
              <span className="gold-text block">{dict.hero.titleLine2}</span>
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-[var(--fg-muted)] sm:text-lg">
              {dict.hero.subtitle}
            </p>
          </Reveal>

          <Reveal delay={260}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href={gamePath(locale, 'gomoku')} className="btn btn-primary !px-6 !py-3">
                {dict.hero.ctaPlay}
                <span aria-hidden="true">→</span>
              </Link>
              <a href="#games" className="btn !px-6 !py-3">
                {dict.hero.ctaBrowse}
              </a>
            </div>
          </Reveal>

          <Reveal delay={340}>
            <dl className="mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t border-[var(--hairline)] pt-8">
              {[
                [dict.hero.stat1, dict.hero.stat1Label],
                [dict.hero.stat2, dict.hero.stat2Label],
                [dict.hero.stat3, dict.hero.stat3Label],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="display text-4xl text-[var(--accent)] sm:text-5xl">{value}</dt>
                  <dd className="mt-1.5 text-xs leading-snug text-[var(--fg-muted)]">{label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_TOP} variant="leaderboard" label="home top" />
      </div>

      <section id="games" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <p className="eyebrow">{dict.home.pickEyebrow}</p>
          <h2 className="display mt-3 text-[clamp(2rem,5vw,3.5rem)]">{dict.home.pickTitle}</h2>
          <p className="mt-4 max-w-2xl text-[var(--fg-muted)]">{dict.home.pickSubtitle}</p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:gap-5 lg:grid-cols-2">
          {GAME_IDS.map((game, i) => (
            <Reveal key={game} delay={i * 70}>
              <GameCard
                game={game}
                index={i}
                href={gamePath(locale, game)}
                name={dict.games[game].name}
                aka={dict.games[game].aka}
                blurb={dict.games[game].blurb}
                cta={dict.game.play}
              />
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <p className="mt-8 text-center text-xs text-[var(--fg-muted)]">
            {dict.home.difficultyNote}
          </p>
        </Reveal>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_MID} variant="in-article" label="home mid" />
      </div>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <p className="eyebrow">{dict.home.whyEyebrow}</p>
          <h2 className="display mt-3 max-w-3xl text-[clamp(1.8rem,4.2vw,3rem)]">
            {dict.home.whyTitle}
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--hairline)] sm:grid-cols-2">
          {dict.home.why.map((item, i) => (
            <Reveal key={item.h} delay={i * 80}>
              <div className="h-full bg-[var(--bg)] p-7 transition-colors duration-500 hover:bg-[var(--surface)]">
                <span className="display text-3xl text-[var(--accent)] opacity-45">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{item.h}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[var(--fg-muted)]">{item.p}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <Reveal>
          <div className="frame relative overflow-hidden rounded-3xl border border-[var(--hairline)] px-6 py-16 text-center sm:px-12">
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10"
              style={{
                background:
                  'radial-gradient(70% 120% at 50% 0%, rgba(232,194,116,0.16), transparent 68%)',
              }}
            />
            <h2 className="display text-[clamp(1.9rem,4.5vw,3.2rem)]">
              {dict.home.closingTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[var(--fg-muted)]">{dict.home.closingBody}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-2.5">
              {GAME_IDS.map((game) => (
                <Link key={game} href={gamePath(locale, game)} className="btn">
                  {dict.games[game].name}
                </Link>
              ))}
            </div>
            <p className="mt-8 text-xs text-[var(--fg-muted)]">
              <Link href={localePath(locale, 'about')} className="hover:text-[var(--accent)]">
                {dict.nav.about}
              </Link>
              <span className="mx-2 opacity-40">·</span>
              <Link href={localePath(locale, 'privacy')} className="hover:text-[var(--accent)]">
                {dict.nav.privacy}
              </Link>
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
