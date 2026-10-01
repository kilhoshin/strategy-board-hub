/** Minimal line-drawn animal faces for Bagh-Chal, sized to sit inside a round token. */
export function TigerGlyph() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" aria-hidden="true">
      <g stroke="#e8c274" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 40 L26 18 L42 28 Q50 25 58 28 L74 18 L78 40 Q80 64 50 83 Q20 64 22 40Z" />
        <path d="M50 30 V44 M40 33 L43 44 M60 33 L57 44" strokeWidth="3" />
        <path d="M32 51 L43 54 M68 51 L57 54" />
      </g>
      <path d="M44 64 H56 L50 71Z" fill="#e8c274" />
    </svg>
  );
}

export function GoatGlyph() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" aria-hidden="true">
      <g stroke="#2a2116" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M38 46 Q50 40 62 46 L58 72 Q50 80 42 72Z" />
        <path d="M40 42 Q22 38 24 18 Q34 28 43 37" />
        <path d="M60 42 Q78 38 76 18 Q66 28 57 37" />
        <path d="M37 52 L25 57 M63 52 L75 57" />
        <path d="M50 78 V88" />
      </g>
      <circle cx="44" cy="55" r="2.6" fill="#2a2116" />
      <circle cx="56" cy="55" r="2.6" fill="#2a2116" />
    </svg>
  );
}
