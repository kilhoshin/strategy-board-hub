'use client';

import { Link } from './Link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { GAME_IDS } from '@/lib/games/types';
import {
  DEFAULT_LOCALE,
  GAME_SLUG,
  LOCALES,
  LOCALE_LABEL,
  LOCALE_SHORT,
  type Locale,
  gamePath,
  localePath,
} from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/types';
import { Logo } from './Logo';

/** Rewrites the current path into another locale, keeping the same page. */
function swapLocale(pathname: string, target: Locale) {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length && (LOCALES as readonly string[]).includes(parts[0])) parts.shift();
  return localePath(target, parts.join('/'));
}

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const pathname = usePathname() ?? localePath(locale);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem('sbh-theme');
    const next = stored === 'light' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem('sbh-theme', next);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-shadow duration-500 ${
        scrolled ? 'glass-nav shadow-[0_10px_40px_-24px_rgba(0,0,0,0.9)]' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <Link
          href={localePath(locale)}
          className="group flex shrink-0 items-center gap-2 sm:gap-2.5"
          aria-label="Strategy Board Hub"
        >
          <span className="transition-transform duration-500 group-hover:rotate-45">
            <Logo />
          </span>
          <span className="display whitespace-nowrap text-[1.05rem] tracking-tight sm:text-[1.35rem]">
            <span className="gold-text">Strategy</span>
            <span className="opacity-70"> Board Hub</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label={dict.nav.games}>
          {GAME_IDS.map((game) => {
            const href = gamePath(locale, game);
            const active = pathname.replace(/\/$/, '') === href.replace(/\/$/, '');
            return (
              <Link
                key={game}
                href={href}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
                }`}
              >
                {dict.games[game].name}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="btn h-9 w-9 !p-0"
            aria-label={dict.nav.theme}
            title={dict.nav.theme}
          >
            <span aria-hidden="true" className="text-sm">
              {theme === 'dark' ? '☾' : '☀'}
            </span>
          </button>

          <div className="relative">
            <label className="sr-only" htmlFor="locale-switch">
              {dict.nav.language}
            </label>
            <select
              id="locale-switch"
              value={locale}
              onChange={(e) => {
                window.location.href = swapLocale(pathname, e.target.value as Locale);
              }}
              className="btn h-9 cursor-pointer appearance-none bg-transparent pr-7 text-xs"
              style={{ backgroundImage: 'none' }}
            >
              {LOCALES.map((l) => (
                <option
                  key={l}
                  value={l}
                  className="bg-[var(--bg-elev)] text-[var(--fg)]"
                  // The closed select is as wide as its widest option, so the
                  // label stays short — the code is enough to identify it.
                  title={`${LOCALE_SHORT[l]} · ${LOCALE_LABEL[l]}`}
                >
                  {LOCALE_LABEL[l]}
                </option>
              ))}
            </select>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.6rem] opacity-60"
            >
              ▼
            </span>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="btn h-9 w-9 !p-0 lg:hidden"
            aria-expanded={open}
            aria-label={dict.nav.games}
          >
            <span aria-hidden="true">{open ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="glass-nav border-t lg:hidden">
          <nav className="mx-auto grid max-w-7xl grid-cols-2 gap-1 px-4 py-3 sm:px-6">
            {GAME_IDS.map((game) => (
              <Link
                key={game}
                href={gamePath(locale, game)}
                className="rounded-lg px-3 py-2.5 text-sm text-[var(--fg-muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--fg)]"
              >
                {dict.games[game].name}
                <span className="ml-2 text-[0.65rem] opacity-50">{GAME_SLUG[game]}</span>
              </Link>
            ))}
            <Link
              href={localePath(locale, 'about')}
              className="rounded-lg px-3 py-2.5 text-sm text-[var(--fg-muted)]"
            >
              {dict.nav.about}
            </Link>
            <Link
              href={localePath(locale, 'privacy')}
              className="rounded-lg px-3 py-2.5 text-sm text-[var(--fg-muted)]"
            >
              {dict.nav.privacy}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export { DEFAULT_LOCALE };
