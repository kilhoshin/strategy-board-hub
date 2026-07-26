import type { Metadata } from 'next';
import type { GameId } from './games/types';
import {
  GAME_SLUG,
  LANG_TAG,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  alternates,
  localePath,
  type Locale,
} from './i18n/config';
import type { Dictionary } from './i18n/types';

export function pageMetadata({
  locale,
  sub,
  title,
  description,
  keywords,
}: {
  locale: Locale;
  sub?: string;
  title: string;
  description: string;
  keywords?: string[];
}): Metadata {
  const url = absoluteUrl(localePath(locale, sub));
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
      languages: alternates(sub),
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: LANG_TAG[locale].replace('-', '_'),
      title,
      description,
      url,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
  };
}

/* ------------------------------ structured data ---------------------------- */

export function websiteJsonLd(locale: Locale, dict: Dictionary) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: absoluteUrl(localePath(locale)),
    description: dict.meta.homeDescription,
    inLanguage: LANG_TAG[locale],
  };
}

export function collectionJsonLd(locale: Locale, dict: Dictionary) {
  const games = Object.entries(dict.games) as [GameId, Dictionary['games'][GameId]][];
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: dict.home.pickTitle,
    itemListElement: games.map(([id, content], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: content.name,
      url: absoluteUrl(localePath(locale, GAME_SLUG[id])),
    })),
  };
}

export function gameJsonLd(locale: Locale, dict: Dictionary, game: GameId) {
  const c = dict.games[game];
  const url = absoluteUrl(localePath(locale, GAME_SLUG[game]));
  return {
    '@context': 'https://schema.org',
    '@type': 'Game',
    name: c.name,
    alternateName: c.aka.split('·').map((s) => s.trim()),
    description: c.metaDescription,
    url,
    inLanguage: LANG_TAG[locale],
    genre: 'Abstract strategy',
    numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2 },
    gameLocation: url,
    isAccessibleForFree: true,
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  };
}

export function faqJsonLd(dict: Dictionary, game: GameId) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: dict.games[game].faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

export function breadcrumbJsonLd(locale: Locale, dict: Dictionary, game: GameId) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: SITE_NAME,
        item: absoluteUrl(localePath(locale)),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: dict.games[game].name,
        item: absoluteUrl(localePath(locale, GAME_SLUG[game])),
      },
    ],
  };
}
