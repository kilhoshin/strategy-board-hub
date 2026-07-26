import { Reveal } from '@/components/site/Reveal';
import type { StrategyItem } from '@/lib/i18n/types';

export function StaticView({
  title,
  intro,
  updated,
  body,
}: {
  title: string;
  intro?: string;
  updated?: string;
  body: StrategyItem[];
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal>
        <h1 className="display text-[clamp(2.2rem,6vw,3.6rem)]">
          <span className="gold-text">{title}</span>
        </h1>
        {updated && <p className="mt-3 text-xs text-[var(--fg-muted)]">{updated}</p>}
        {intro && (
          <p className="mt-6 text-lg leading-relaxed text-[var(--fg-muted)]">{intro}</p>
        )}
      </Reveal>

      <div className="rule my-12" />

      <article className="prose-hub space-y-10">
        {body.map((item, i) => (
          <Reveal key={item.h} delay={i * 60} as="section">
            <h2 className="!text-2xl">{item.h}</h2>
            <p className="mt-3">{item.p}</p>
          </Reveal>
        ))}
      </article>
    </div>
  );
}
