import { Link } from './Link';
import { GAME_IDS } from '@/lib/games/types';
import { SITE_NAME, type Locale, gamePath, localePath } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/types';
import { Logo } from './Logo';

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <footer className="mt-24 border-t border-[var(--hairline)]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <Logo size={30} />
              <span className="display text-xl">{SITE_NAME}</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--fg-muted)]">
              {dict.footer.blurb}
            </p>
          </div>

          <div>
            <h2 className="eyebrow">{dict.nav.games}</h2>
            <ul className="mt-4 space-y-2">
              {GAME_IDS.map((game) => (
                <li key={game}>
                  <Link
                    href={gamePath(locale, game)}
                    className="text-sm text-[var(--fg-muted)] transition-colors hover:text-[var(--accent)]"
                  >
                    {dict.games[game].name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="eyebrow">{SITE_NAME}</h2>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href={localePath(locale, 'about')}
                  className="text-sm text-[var(--fg-muted)] transition-colors hover:text-[var(--accent)]"
                >
                  {dict.nav.about}
                </Link>
              </li>
              <li>
                <Link
                  href={localePath(locale, 'privacy')}
                  className="text-sm text-[var(--fg-muted)] transition-colors hover:text-[var(--accent)]"
                >
                  {dict.nav.privacy}
                </Link>
              </li>
              <li>
                <Link
                  href={localePath(locale, 'terms')}
                  className="text-sm text-[var(--fg-muted)] transition-colors hover:text-[var(--accent)]"
                >
                  {dict.nav.terms}
                </Link>
              </li>
              <li>
                <Link
                  href={localePath(locale, 'contact')}
                  className="text-sm text-[var(--fg-muted)] transition-colors hover:text-[var(--accent)]"
                >
                  {dict.nav.contact}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="rule mt-12" />
        <div className="mt-6 flex flex-col gap-3 text-xs text-[var(--fg-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE_NAME}. {dict.footer.rights}
          </p>
          <p className="max-w-xl sm:text-right">{dict.footer.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
