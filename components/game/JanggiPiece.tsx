import * as j from '@/lib/games/janggi';
import type { Side } from '@/lib/games/types';

export type PieceStyle = 'hanja' | 'icon' | 'letter';
export type ColorScheme = 'traditional' | 'mono';

export const PIECE_ORDER = [
  j.GENERAL,
  j.GUARD,
  j.CHARIOT,
  j.CANNON,
  j.HORSE,
  j.ELEPHANT,
  j.SOLDIER,
] as const;

/** Dictionary key for each piece type. */
export const PIECE_KEY: Record<number, 'general' | 'guard' | 'chariot' | 'cannon' | 'horse' | 'elephant' | 'soldier'> = {
  [j.GENERAL]: 'general',
  [j.GUARD]: 'guard',
  [j.CHARIOT]: 'chariot',
  [j.CANNON]: 'cannon',
  [j.HORSE]: 'horse',
  [j.ELEPHANT]: 'elephant',
  [j.SOLDIER]: 'soldier',
};

/** Cho is written in the cursive form, Han in the standard one. */
export const HANJA: Record<number, [string, string]> = {
  [j.GENERAL]: ['楚', '漢'],
  [j.GUARD]: ['士', '士'],
  [j.ELEPHANT]: ['象', '象'],
  [j.HORSE]: ['馬', '馬'],
  [j.CHARIOT]: ['車', '車'],
  [j.CANNON]: ['包', '包'],
  [j.SOLDIER]: ['卒', '兵'],
};

/** Chess-style initials: N for kNight, so nothing collides with the general. */
export const LETTER: Record<number, string> = {
  [j.GENERAL]: 'K',
  [j.GUARD]: 'G',
  [j.CHARIOT]: 'R',
  [j.CANNON]: 'C',
  [j.HORSE]: 'N',
  [j.ELEPHANT]: 'E',
  [j.SOLDIER]: 'P',
};

/**
 * Traditional Janggi sizes the discs by rank — general largest, then the heavy
 * pieces, then guards and soldiers. That hierarchy is a real playing aid, so it
 * survives every notation style.
 */
export const SIZE: Record<number, number> = {
  [j.GENERAL]: 1.18,
  [j.CHARIOT]: 1,
  [j.CANNON]: 1,
  [j.HORSE]: 0.94,
  [j.ELEPHANT]: 0.94,
  [j.GUARD]: 0.84,
  [j.SOLDIER]: 0.84,
};

export interface PieceSkin {
  /** Disc face. */
  face: string;
  /** Glyph and rim colour. */
  ink: string;
  border: string;
}

export function skinFor(side: Side, scheme: ColorScheme): PieceSkin {
  if (scheme === 'mono') {
    // Cho moves first, so Cho takes white — the convention Western players expect.
    return side === 1
      ? {
          face: 'radial-gradient(circle at 34% 26%, #ffffff, #f1ece0 60%, #d8d0be)',
          ink: '#1b1a17',
          border: '#8d857a',
        }
      : {
          face: 'radial-gradient(circle at 34% 26%, #4b515a, #2a2f36 55%, #14171c)',
          ink: '#f2eee4',
          border: '#0c0e12',
        };
  }
  return side === 1
    ? {
        face: 'radial-gradient(circle at 34% 26%, #fdf4dd, #edd9ac 62%, #d8bd85)',
        ink: '#155c40',
        border: '#1f6f4f',
      }
    : {
        face: 'radial-gradient(circle at 34% 26%, #fdf4dd, #edd9ac 62%, #d8bd85)',
        ink: '#a8321f',
        border: '#b83c2c',
      };
}

/* ------------------------------- icon set -------------------------------- */

/**
 * Deliberately blunt silhouettes: at ~30px inside an octagon, a Western player
 * has to read these at a glance, so each one is the single most obvious symbol
 * for what the piece does.
 */
function IconPaths({ type }: { type: number }) {
  switch (type) {
    case j.GENERAL: // crown — the most important piece, exactly like a king
      return (
        <>
          <path d="M3 7.6 7.6 12.6 12 4.2 16.4 12.6 21 7.6 19.4 17.4H4.6Z" />
          <rect x="4.2" y="18.6" width="15.6" height="2.8" rx="0.9" />
        </>
      );
    case j.GUARD: // shield — it exists to stand in front of the general
      return (
        <path d="M12 2.4 20.4 5.6v6.1c0 5-3.4 8.5-8.4 10.1-5-1.6-8.4-5.1-8.4-10.1V5.6Zm0 2.6L6 7.3v4.4c0 3.5 2.2 6 6 7.4 3.8-1.4 6-3.9 6-7.4V7.3Z" />
      );
    case j.CHARIOT: // castle tower — moves exactly like a chess rook
      return (
        <path d="M4 3h4v2.2h2.6V3h2.8v2.2H16V3h4v7l-2.2 1.7v5.6L20 19v2.4H4V19l2.2-1.7v-5.6L4 10Z" />
      );
    case j.CANNON: // horizontal barrel, muzzle, trail and wheel
      return (
        <>
          <path d="M2.6 8.2h13.6a2 2 0 0 1 2 2v2.2a2 2 0 0 1-2 2H2.6Z" />
          <rect x="17.4" y="6.9" width="4" height="8.8" rx="1.4" />
          <path d="M1.2 21.2 5.4 13.6h3.2L4.4 21.2Z" />
          <circle cx="9.7" cy="17.3" r="4.4" />
          <circle cx="9.7" cy="17.3" r="1.5" fill="#fff" fillOpacity="0.85" />
        </>
      );
    case j.HORSE: // knight's head
      return (
        <path d="M6.6 21.4h11.5c.5-6-1-9.2-3.5-11.5l1.5-2.5c.6-1 .1-2.3-1-2.6l-3.5-1.1c-.7-.2-1.4.2-1.6.9l-.6 1.9-2.7 1.4C5.2 8.7 4.2 10.3 4.2 12v1.3c0 .8.9 1.3 1.5.7l2.4-2 1.3 1.3-2.4 3.4c-.9 1.3-1.4 3-1.4 4.7Z" />
      );
    case j.ELEPHANT: // front-facing head — two big ears and one long curling trunk
      return (
        <>
          <ellipse cx="5.2" cy="8.6" rx="4.3" ry="4.8" />
          <ellipse cx="18.8" cy="8.6" rx="4.3" ry="4.8" />
          <path d="M12 2.4c3.1 0 5.3 2.2 5.3 5.5v3.2c0 2.4-1.4 4.2-3.6 4.8h-3.4c-2.2-.6-3.6-2.4-3.6-4.8V7.9c0-3.3 2.2-5.5 5.3-5.5Z" />
          <path d="M10.4 13.6h3.2v5.7c0 1.6 1 2.7 2.6 2.7h1.4v-2.9h-.9c-.4 0-.7-.3-.7-.8v-4.7Z" />
          <circle cx="9.6" cy="8.4" r="1.2" fill="#fff" fillOpacity="0.9" />
          <circle cx="14.4" cy="8.4" r="1.2" fill="#fff" fillOpacity="0.9" />
        </>
      );
    default: // soldier — a chess pawn
      return (
        <path d="M12 2.6a3.4 3.4 0 0 1 2.1 6.1c1.3.9 2.1 2.3 2.1 4 0 1.6-.7 2.9-1.8 3.8l1.1 4.1h1.9v2.2H6.6v-2.2h1.9l1.1-4.1c-1.1-.9-1.8-2.2-1.8-3.8 0-1.7.8-3.1 2.1-4A3.4 3.4 0 0 1 12 2.6Z" />
      );
  }
}

/* ------------------------------ the piece --------------------------------- */

export function JanggiPiece({
  piece,
  style,
  scheme,
  size,
}: {
  piece: number;
  style: PieceStyle;
  scheme: ColorScheme;
  /** Relative scale from SIZE, so the rank hierarchy survives. */
  size: number;
}) {
  const type = j.jType(piece);
  const side = j.jOwner(piece);
  const skin = skinFor(side, scheme);

  return (
    <span
      className="flex h-full w-full items-center justify-center rounded-[22%] border-2 font-bold leading-none"
      style={{
        background: skin.face,
        color: skin.ink,
        borderColor: skin.border,
        boxShadow: '0 3px 6px rgba(0,0,0,0.42)',
        clipPath: 'polygon(28% 0,72% 0,100% 28%,100% 72%,72% 100%,28% 100%,0 72%,0 28%)',
        fontSize: style === 'letter' ? `${(size * 4.8).toFixed(2)}cqw` : `${(size * 5.2).toFixed(2)}cqw`,
      }}
    >
      {style === 'icon' ? (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-[62%] w-[62%]" aria-hidden="true">
          <IconPaths type={type} />
        </svg>
      ) : style === 'letter' ? (
        LETTER[type]
      ) : (
        HANJA[type][side - 1]
      )}
    </span>
  );
}

/** Small standalone chip used by the legend and the captured tray. */
export function JanggiChip({
  piece,
  style,
  scheme,
  className = '',
}: {
  piece: number;
  style: PieceStyle;
  scheme: ColorScheme;
  className?: string;
}) {
  const type = j.jType(piece);
  const side = j.jOwner(piece);
  const skin = skinFor(side, scheme);
  return (
    <span
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[22%] border text-[0.72rem] font-bold ${className}`}
      style={{ background: skin.face, color: skin.ink, borderColor: skin.border }}
    >
      {style === 'icon' ? (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <IconPaths type={type} />
        </svg>
      ) : style === 'letter' ? (
        LETTER[type]
      ) : (
        HANJA[type][side - 1]
      )}
    </span>
  );
}
