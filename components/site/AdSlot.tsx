'use client';

import { useEffect, useRef } from 'react';

type Variant = 'leaderboard' | 'in-article' | 'rail';

const SIZING: Record<Variant, string> = {
  leaderboard: 'min-h-[90px] md:min-h-[100px]',
  'in-article': 'min-h-[250px]',
  rail: 'min-h-[600px]',
};

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

/**
 * AdSense slot. Renders the real responsive unit once NEXT_PUBLIC_ADSENSE_CLIENT
 * and a slot id are configured; otherwise it stays out of the layout entirely
 * (a faint outline shows in development so the placements stay visible).
 *
 * Deliberately never overlaps a board — see the placement notes in README.
 */
export function AdSlot({
  slot,
  variant = 'in-article',
  label,
  className = '',
}: {
  slot?: string;
  variant?: Variant;
  label?: string;
  className?: string;
}) {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!CLIENT || !slot || pushed.current) return;
    pushed.current = true;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
    } catch {
      /* AdSense not loaded yet — the script tag retries on its own. */
    }
  }, [slot]);

  if (!CLIENT || !slot) {
    if (process.env.NODE_ENV !== 'development') return null;
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-dashed border-[var(--hairline)] text-[0.6rem] uppercase tracking-[0.25em] text-[var(--fg-muted)] opacity-40 ${SIZING[variant]} ${className}`}
      >
        {label ?? 'ad slot'} · {variant}
      </div>
    );
  }

  return (
    <div className={`${SIZING[variant]} ${className}`}>
      <ins
        ref={ref}
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client={CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

export function AdSenseScript() {
  if (!CLIENT) return null;
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`}
      crossOrigin="anonymous"
    />
  );
}
