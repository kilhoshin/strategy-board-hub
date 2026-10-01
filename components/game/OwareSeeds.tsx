const TONES = ['#e8c274', '#d3a34b', '#c8553d', '#f2ead8', '#8fb8a8'];
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/** Seeds laid out on a sunflower spiral so any count from 0 to 48 packs a pit evenly. */
export function OwareSeeds({ count, seed }: { count: number; seed: number }) {
  const r = Math.min(8, Math.max(4.2, 8.6 - count * 0.1));
  const c = Math.min(r * 1.9, (46 - r) / Math.sqrt(count + 0.5));
  return (
    <svg viewBox="-50 -50 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
      {Array.from({ length: count }, (_, j) => {
        const rad = c * Math.sqrt(j + 0.5);
        const a = j * GOLDEN + seed;
        const x = rad * Math.cos(a);
        const y = rad * Math.sin(a);
        return (
          <g key={j}>
            <circle cx={x} cy={y + 0.8} r={r} fill="rgb(0 0 0 / 0.35)" />
            <circle cx={x} cy={y} r={r} fill={TONES[(j + seed) % TONES.length]} />
            <circle cx={x - r * 0.3} cy={y - r * 0.35} r={r * 0.28} fill="rgb(255 255 255 / 0.55)" />
          </g>
        );
      })}
    </svg>
  );
}
