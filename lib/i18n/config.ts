import type { GameId } from '../games/types';

export const LOCALES = ['en', 'ko', 'ja', 'zh'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';
/** Locales that live under a path prefix; English sits at the root. */
export const PREFIXED_LOCALES = LOCALES.filter((l) => l !== DEFAULT_LOCALE);

/** Values for <html lang> and for the hreflang attribute. */
export const LANG_TAG: Record<Locale, string> = {
  en: 'en',
  ko: 'ko',
  ja: 'ja',
  zh: 'zh-Hant',
};

export const LOCALE_LABEL: Record<Locale, string> = {
  en: 'English',
  ko: '한국어',
  ja: '日本語',
  zh: '繁體中文',
};

export const LOCALE_SHORT: Record<Locale, string> = {
  en: 'EN',
  ko: 'KO',
  ja: 'JA',
  zh: 'ZH',
};

/**
 * Production origin. Override at build time with NEXT_PUBLIC_SITE_URL so the
 * canonical and hreflang tags point at wherever this actually ships.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://strategyboardhub.com'
).replace(/\/$/, '');

export const SITE_NAME = 'Strategy Board Hub';

/** English slugs across every locale — easier to maintain, per the SEO plan. */
export const GAME_SLUG: Record<GameId, string> = {
  gomoku: 'gomoku',
  reversi: 'reversi',
  janggi: 'janggi',
  chess: 'chess',
  shogi: 'shogi',
  go: 'go',
  baghchal: 'baghchal',
};

export type StaticPage = 'about' | 'privacy';

/** Builds a site-relative path: '/', '/gomoku', '/ko', '/ko/gomoku'. */
export function localePath(locale: Locale, sub = ''): string {
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  const tail = sub ? `/${sub.replace(/^\//, '')}` : '';
  return `${prefix}${tail}` || '/';
}

export function gamePath(locale: Locale, game: GameId): string {
  return localePath(locale, GAME_SLUG[game]);
}

/** Games with a puzzle set — see scripts/import-chess-puzzles.ts / scripts/gen-puzzles.ts. */
export const PUZZLE_GAMES: GameId[] = ['chess', 'janggi', 'shogi'];

export function puzzlePath(locale: Locale, game: GameId): string {
  return localePath(locale, `${GAME_SLUG[game]}/puzzles`);
}

export function absoluteUrl(path: string): string {
  const clean = path === '/' ? '/' : `${path.replace(/\/$/, '')}/`;
  return `${SITE_URL}${clean}`;
}

/** hreflang map for one logical page across all locales, plus x-default. */
export function alternates(sub = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const locale of LOCALES) out[LANG_TAG[locale]] = absoluteUrl(localePath(locale, sub));
  out['x-default'] = absoluteUrl(localePath(DEFAULT_LOCALE, sub));
  return out;
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
