export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="sbh-gold" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#f5d99b" />
          <stop offset="55%" stopColor="#d3a34b" />
          <stop offset="100%" stopColor="#a97c31" />
        </linearGradient>
        <radialGradient id="sbh-stone" cx="34%" cy="30%">
          <stop offset="0%" stopColor="#7b8390" />
          <stop offset="55%" stopColor="#1b1f27" />
          <stop offset="100%" stopColor="#05070a" />
        </radialGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="9" stroke="url(#sbh-gold)" strokeWidth="1.4" />
      <path d="M20 7v26M7 20h26" stroke="url(#sbh-gold)" strokeWidth="0.9" opacity="0.5" />
      <path d="M12.5 12.5 27.5 27.5M27.5 12.5 12.5 27.5" stroke="url(#sbh-gold)" strokeWidth="0.6" opacity="0.28" />
      <circle cx="20" cy="20" r="6.4" fill="url(#sbh-stone)" />
      <circle cx="20" cy="20" r="6.4" stroke="url(#sbh-gold)" strokeWidth="0.9" />
      <circle cx="17.9" cy="17.7" r="1.7" fill="#eee6d6" opacity="0.5" />
    </svg>
  );
}
