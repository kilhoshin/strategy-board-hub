import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { GAME_IDS, type GameId } from '@/lib/games/types';
import { GAME_SLUG, LANG_TAG, PUZZLE_GAMES, type Locale, localePath } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n';
import { displayFont, sansFont } from '@/lib/fonts';
import {
  breadcrumbJsonLd,
  collectionJsonLd,
  faqJsonLd,
  gameJsonLd,
  pageMetadata,
  websiteJsonLd,
} from '@/lib/seo';
import { AdSenseScript } from '@/components/site/AdSlot';
import { GoogleAnalyticsScript } from '@/components/site/Analytics';
import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { GameView } from '@/components/views/GameView';
import { HomeView } from '@/components/views/HomeView';
import { PuzzleView } from '@/components/views/PuzzleView';
import { StaticView } from '@/components/views/StaticView';

/* --------------------------------- shell --------------------------------- */

function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // Schema.org payload is built from our own dictionaries, never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Root document for one locale. Each locale route group renders its own so
 * <html lang> is correct without any client-side patching.
 */
export function SiteShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  const dict = getDictionary(locale);
  return (
    <html
      lang={LANG_TAG[locale]}
      className={`${displayFont.variable} ${sansFont.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#05070a" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* Restore the saved theme before first paint to avoid a flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('sbh-theme');if(t==='light')document.documentElement.dataset.theme='light';}catch(e){}`,
          }}
        />
        <AdSenseScript />
        <GoogleAnalyticsScript />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#241a08]"
        >
          {dict.nav.skipToGame}
        </a>
        <Header locale={locale} dict={dict} />
        <main id="main">{children}</main>
        <Footer locale={locale} dict={dict} />
      </body>
    </html>
  );
}

/* ---------------------------------- home ---------------------------------- */

export function homeMetadata(locale: Locale): Metadata {
  const dict = getDictionary(locale);
  return pageMetadata({
    locale,
    title: dict.meta.homeTitle,
    description: dict.meta.homeDescription,
    keywords: dict.meta.keywords,
  });
}

export function HomePage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <>
      <JsonLd data={[websiteJsonLd(locale, dict), collectionJsonLd(locale, dict)]} />
      <HomeView locale={locale} dict={dict} />
    </>
  );
}

/* ---------------------------------- game ---------------------------------- */

const BY_SLUG = Object.fromEntries(
  GAME_IDS.map((id) => [GAME_SLUG[id], id]),
) as Record<string, GameId>;

function resolveGame(slug: string): GameId | null {
  return BY_SLUG[slug] ?? null;
}

export function gameMetadata(locale: Locale, slug: string): Metadata {
  const game = resolveGame(slug);
  const dict = getDictionary(locale);
  if (!game) return pageMetadata({ locale, title: dict.meta.homeTitle, description: dict.meta.homeDescription });
  const c = dict.games[game];
  return pageMetadata({
    locale,
    sub: GAME_SLUG[game],
    title: c.metaTitle,
    description: c.metaDescription,
    keywords: c.keywords,
  });
}

export function GamePage({ locale, slug }: { locale: Locale; slug: string }) {
  const game = resolveGame(slug);
  const dict = getDictionary(locale);
  if (!game) return <HomeView locale={locale} dict={dict} />;
  return (
    <>
      <JsonLd
        data={[
          gameJsonLd(locale, dict, game),
          faqJsonLd(dict, game),
          breadcrumbJsonLd(locale, dict, game),
        ]}
      />
      <GameView locale={locale} dict={dict} game={game} />
    </>
  );
}

/* --------------------------------- puzzle --------------------------------- */

function resolvePuzzleGame(slug: string): GameId | null {
  const game = resolveGame(slug);
  return game && PUZZLE_GAMES.includes(game) ? game : null;
}

export function puzzleMetadata(locale: Locale, slug: string): Metadata {
  const game = resolvePuzzleGame(slug);
  const dict = getDictionary(locale);
  if (!game) return pageMetadata({ locale, title: dict.meta.homeTitle, description: dict.meta.homeDescription });
  const c = dict.games[game];
  return pageMetadata({
    locale,
    sub: `${GAME_SLUG[game]}/puzzles`,
    title: `${c.name} ${dict.puzzle.title}`,
    description: dict.puzzle.tagline,
  });
}

export function PuzzlePage({ locale, slug }: { locale: Locale; slug: string }) {
  const game = resolvePuzzleGame(slug);
  const dict = getDictionary(locale);
  if (!game) return <HomeView locale={locale} dict={dict} />;
  return <PuzzleView locale={locale} dict={dict} game={game} />;
}

/* --------------------------------- static --------------------------------- */

export function aboutMetadata(locale: Locale): Metadata {
  const dict = getDictionary(locale);
  return pageMetadata({
    locale,
    sub: 'about',
    title: `${dict.about.title} | ${dict.meta.siteTagline}`,
    description: dict.about.intro,
  });
}

export function AboutPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return <StaticView title={dict.about.title} intro={dict.about.intro} body={dict.about.body} />;
}

export function privacyMetadata(locale: Locale): Metadata {
  const dict = getDictionary(locale);
  return pageMetadata({
    locale,
    sub: 'privacy',
    title: `${dict.privacy.title} | ${dict.meta.siteTagline}`,
    description: dict.privacy.body[0]?.p ?? dict.meta.siteTagline,
  });
}

export function PrivacyPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <StaticView
      title={dict.privacy.title}
      updated={dict.privacy.updated}
      body={dict.privacy.body}
    />
  );
}

export { localePath };
