import type { MetadataRoute } from 'next';
import { GAME_IDS } from '@/lib/games/types';
import { GAME_SLUG, LOCALES, PUZZLE_GAMES, absoluteUrl, alternates, localePath } from '@/lib/i18n/config';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const subs = [
    '',
    ...GAME_IDS.map((g) => GAME_SLUG[g]),
    ...PUZZLE_GAMES.map((g) => `${GAME_SLUG[g]}/puzzles`),
    'about',
    'privacy',
  ];
  const entries: MetadataRoute.Sitemap = [];

  for (const sub of subs) {
    for (const locale of LOCALES) {
      entries.push({
        url: absoluteUrl(localePath(locale, sub)),
        lastModified: new Date(),
        changeFrequency: sub === '' ? 'weekly' : 'monthly',
        priority: sub === '' ? 1 : sub === 'about' || sub === 'privacy' ? 0.3 : 0.8,
        alternates: { languages: alternates(sub) },
      });
    }
  }

  return entries;
}
