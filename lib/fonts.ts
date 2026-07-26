import { Cormorant_Garamond, Inter } from 'next/font/google';

/** High-contrast serif for display type — the "old book" half of the design. */
export const displayFont = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display-loaded',
  display: 'swap',
});

/** UI face. CJK glyphs fall through to the system stack declared in globals.css. */
export const sansFont = Inter({
  subsets: ['latin'],
  variable: '--font-sans-loaded',
  display: 'swap',
});
