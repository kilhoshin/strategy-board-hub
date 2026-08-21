import { EDGES } from '@/lib/games/baghchal';
import type { GameId } from '@/lib/games/types';

const WOOD = ['#d9b071', '#c08f4c'];

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={WOOD[0]} />
        <stop offset="100%" stopColor={WOOD[1]} />
      </linearGradient>
      <linearGradient id={`${id}-felt`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#2f7a5c" />
        <stop offset="100%" stopColor="#1d5540" />
      </linearGradient>
      <radialGradient id={`${id}-b`} cx="34%" cy="30%">
        <stop offset="0%" stopColor="#737b88" />
        <stop offset="45%" stopColor="#22262e" />
        <stop offset="100%" stopColor="#05070a" />
      </radialGradient>
      <radialGradient id={`${id}-w`} cx="34%" cy="30%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="55%" stopColor="#efe9dc" />
        <stop offset="100%" stopColor="#b8ae99" />
      </radialGradient>
    </defs>
  );
}

function Lattice({ n, pad = 8, stroke = 'rgba(60,35,12,0.5)' }: { n: number; pad?: number; stroke?: string }) {
  const span = 100 - pad * 2;
  const step = span / (n - 1);
  const lines = [];
  for (let i = 0; i < n; i++) {
    const p = pad + i * step;
    lines.push(<line key={`h${i}`} x1={pad} y1={p} x2={100 - pad} y2={p} stroke={stroke} strokeWidth="0.55" />);
    lines.push(<line key={`v${i}`} x1={p} y1={pad} x2={p} y2={100 - pad} stroke={stroke} strokeWidth="0.55" />);
  }
  return <g>{lines}</g>;
}

const pos = (i: number, n: number, pad = 8) => pad + (i * (100 - pad * 2)) / (n - 1);

/** Small decorative board vignette shown on the hub cards. */
export function BoardPreview({ game, id }: { game: GameId; id: string }) {
  const common = { viewBox: '0 0 100 100', className: 'h-full w-full' } as const;

  if (game === 'gomoku' || game === 'go') {
    const n = game === 'go' ? 9 : 11;
    const stones: [number, number, 0 | 1][] =
      game === 'go'
        ? [
            [2, 2, 0],
            [2, 6, 1],
            [6, 2, 1],
            [6, 6, 0],
            [4, 4, 0],
            [3, 5, 1],
            [5, 3, 1],
          ]
        : [
            [3, 7, 0],
            [4, 6, 0],
            [5, 5, 0],
            [6, 4, 0],
            [4, 7, 1],
            [5, 6, 1],
            [6, 6, 1],
            [3, 5, 1],
          ];
    const stars = game === 'go' ? [[2, 2], [2, 6], [6, 2], [6, 6], [4, 4]] : [[5, 5]];
    return (
      <svg {...common}>
        <Defs id={id} />
        <rect width="100" height="100" rx="6" fill={`url(#${id}-wood)`} />
        <Lattice n={n} />
        {stars.map(([x, y], i) => (
          <circle key={i} cx={pos(x, n)} cy={pos(y, n)} r="1.1" fill="rgba(60,35,12,0.7)" />
        ))}
        {stones.map(([x, y, c], i) => (
          <circle
            key={i}
            cx={pos(x, n)}
            cy={pos(y, n)}
            r={(100 - 16) / (n - 1) / 2.25}
            fill={`url(#${id}-${c === 0 ? 'b' : 'w'})`}
          />
        ))}
      </svg>
    );
  }

  if (game === 'reversi') {
    const n = 8;
    const cell = 84 / n;
    const discs: [number, number, 0 | 1][] = [
      [3, 3, 1],
      [4, 4, 1],
      [3, 4, 0],
      [4, 3, 0],
      [2, 3, 0],
      [5, 4, 1],
      [3, 5, 0],
      [4, 2, 1],
      [2, 2, 0],
    ];
    return (
      <svg {...common}>
        <Defs id={id} />
        <rect width="100" height="100" rx="6" fill={`url(#${id}-felt)`} />
        {Array.from({ length: n + 1 }, (_, i) => (
          <g key={i}>
            <line x1={8} y1={8 + i * cell} x2={92} y2={8 + i * cell} stroke="rgba(0,0,0,0.28)" strokeWidth="0.5" />
            <line x1={8 + i * cell} y1={8} x2={8 + i * cell} y2={92} stroke="rgba(0,0,0,0.28)" strokeWidth="0.5" />
          </g>
        ))}
        {discs.map(([x, y, c], i) => (
          <circle
            key={i}
            cx={8 + x * cell + cell / 2}
            cy={8 + y * cell + cell / 2}
            r={cell * 0.38}
            fill={`url(#${id}-${c === 0 ? 'b' : 'w'})`}
          />
        ))}
      </svg>
    );
  }

  if (game === 'chess') {
    const cell = 84 / 8;
    const squares = [];
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        squares.push(
          <rect
            key={`${r}${c}`}
            x={8 + c * cell}
            y={8 + r * cell}
            width={cell}
            height={cell}
            fill={(r + c) % 2 ? '#8a6236' : '#e3cfa8'}
          />,
        );
    const pieces: [number, number, string, string][] = [
      [7, 4, '♔', '#fffaf0'],
      [6, 3, '♙', '#fffaf0'],
      [5, 5, '♘', '#fffaf0'],
      [0, 4, '♚', '#14100b'],
      [2, 2, '♝', '#14100b'],
      [1, 6, '♟', '#14100b'],
    ];
    return (
      <svg {...common}>
        <Defs id={id} />
        <rect width="100" height="100" rx="6" fill="#3a2a18" />
        {squares}
        {pieces.map(([r, c, glyph, fill], i) => (
          <text
            key={i}
            x={8 + c * cell + cell / 2}
            y={8 + r * cell + cell / 2}
            fontSize={cell * 0.95}
            textAnchor="middle"
            dominantBaseline="central"
            fill={fill}
            stroke="rgba(0,0,0,0.4)"
            strokeWidth="0.25"
          >
            {glyph}
          </text>
        ))}
      </svg>
    );
  }

  if (game === 'janggi') {
    const cols = 9;
    const rows = 10;
    const px = (c: number) => 8 + (c * 84) / (cols - 1);
    const py = (r: number) => 6 + (r * 88) / (rows - 1);
    const pieces: [number, number, string, boolean][] = [
      [8, 4, '楚', false],
      [1, 4, '漢', true],
      [7, 1, '包', false],
      [2, 7, '包', true],
      [6, 2, '卒', false],
      [3, 6, '兵', true],
      [9, 0, '車', false],
      [0, 8, '車', true],
    ];
    return (
      <svg {...common}>
        <Defs id={id} />
        <rect width="100" height="100" rx="6" fill={`url(#${id}-wood)`} />
        {Array.from({ length: rows }, (_, r) => (
          <line key={`r${r}`} x1={px(0)} y1={py(r)} x2={px(8)} y2={py(r)} stroke="rgba(60,35,12,0.5)" strokeWidth="0.5" />
        ))}
        {Array.from({ length: cols }, (_, c) => (
          <line key={`c${c}`} x1={px(c)} y1={py(0)} x2={px(c)} y2={py(9)} stroke="rgba(60,35,12,0.5)" strokeWidth="0.5" />
        ))}
        {[0, 7].map((top) => (
          <g key={top} stroke="rgba(60,35,12,0.5)" strokeWidth="0.5">
            <line x1={px(3)} y1={py(top)} x2={px(5)} y2={py(top + 2)} />
            <line x1={px(5)} y1={py(top)} x2={px(3)} y2={py(top + 2)} />
          </g>
        ))}
        {pieces.map(([r, c, ch, han], i) => (
          <g key={i}>
            <circle cx={px(c)} cy={py(r)} r="4.6" fill="#f2e3c4" stroke={han ? '#c0392b' : '#1f6f4f'} strokeWidth="0.9" />
            <text
              x={px(c)}
              y={py(r)}
              fontSize="4.6"
              textAnchor="middle"
              dominantBaseline="central"
              fill={han ? '#c0392b' : '#1f6f4f'}
              fontWeight="700"
            >
              {ch}
            </text>
          </g>
        ))}
      </svg>
    );
  }

  if (game === 'baghchal') {
    const bn = 5;
    const px = (i: number) => 8 + (i % bn) * ((100 - 16) / (bn - 1));
    const py = (i: number) => 8 + Math.floor(i / bn) * ((100 - 16) / (bn - 1));
    const tigers = [0, 4, 20, 24];
    const goats = [6, 8, 12, 16, 18];
    return (
      <svg {...common}>
        <Defs id={id} />
        <rect width="100" height="100" rx="6" fill={`url(#${id}-wood)`} />
        {EDGES.map(([a, b], i) => (
          <line
            key={i}
            x1={px(a)}
            y1={py(a)}
            x2={px(b)}
            y2={py(b)}
            stroke="rgba(60,35,12,0.5)"
            strokeWidth="0.55"
          />
        ))}
        {goats.map((p, i) => (
          <circle key={`g${i}`} cx={px(p)} cy={py(p)} r="3.4" fill={`url(#${id}-w)`} />
        ))}
        {tigers.map((p, i) => (
          <circle key={`t${i}`} cx={px(p)} cy={py(p)} r="3.4" fill="#cf5540" stroke="#5c1c14" strokeWidth="0.5" />
        ))}
      </svg>
    );
  }

  // shogi
  const n = 9;
  const cell = 84 / n;
  const pieces: [number, number, string, boolean][] = [
    [8, 4, '玉', false],
    [7, 7, '飛', false],
    [6, 2, '歩', false],
    [0, 4, '玉', true],
    [1, 1, '飛', true],
    [2, 6, '歩', true],
    [4, 4, '角', false],
  ];
  return (
    <svg {...common}>
      <Defs id={id} />
      <rect width="100" height="100" rx="6" fill={`url(#${id}-wood)`} />
      {Array.from({ length: n + 1 }, (_, i) => (
        <g key={i}>
          <line x1={8} y1={8 + i * cell} x2={92} y2={8 + i * cell} stroke="rgba(60,35,12,0.55)" strokeWidth="0.5" />
          <line x1={8 + i * cell} y1={8} x2={8 + i * cell} y2={92} stroke="rgba(60,35,12,0.55)" strokeWidth="0.5" />
        </g>
      ))}
      {pieces.map(([r, c, ch, gote], i) => {
        const cx = 8 + c * cell + cell / 2;
        const cy = 8 + r * cell + cell / 2;
        const w = cell * 0.78;
        const h = cell * 0.86;
        return (
          <g key={i} transform={`translate(${cx} ${cy}) rotate(${gote ? 180 : 0})`}>
            <path
              d={`M0 ${-h / 2} L${w / 2} ${-h / 4} L${w / 2 - 0.4} ${h / 2} L${-w / 2 + 0.4} ${h / 2} L${-w / 2} ${-h / 4} Z`}
              fill="#f4e2bd"
              stroke="#7a5423"
              strokeWidth="0.5"
            />
            <text x="0" y="1" fontSize={cell * 0.5} textAnchor="middle" dominantBaseline="central" fill="#2a1d0c" fontWeight="700">
              {ch}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
