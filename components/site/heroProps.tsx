'use client';

import { useId, type ReactNode } from 'react';

/** Hand-drawn celebration props for the hero (cake, popcorn, poppers, balloons…), drawn in the site palette. */

export type PropKind = 'cake' | 'popcorn' | 'popper' | 'balloon' | 'bunch' | 'heart' | 'gift' | 'clapper' | 'glasses' | 'ticket' | 'star' | 'ring' | 'reel';
export type Tone = 'sky' | 'gold' | 'cream' | 'navy';

const TONES: Record<Tone, [string, string, string]> = {
  sky: ['#DDF0FC', '#4FB3E8', '#126496'],
  gold: ['#FFF6DC', '#E7C77D', '#A87A1F'],
  cream: ['#FFFFFF', '#FBF3DE', '#D9B25F'],
  navy: ['#86CBF1', '#1d4f7c', '#0E2A47'],
};

function useUid() { return useId().replace(/[^a-zA-Z0-9]/g, ''); }

function Svg({ vb, children }: { vb: string; children: ReactNode }) {
  return <svg viewBox={vb} className="block h-full w-full overflow-visible" aria-hidden>{children}</svg>;
}

function Cake() {
  const id = useUid();
  // A row of icing drips running right-to-left from the current point.
  const drips = (count: number, w: number) => Array.from({ length: count }, () => `q-${w / 2} 9 -${w} 0`).join(' ');
  return (
    <Svg vb="0 0 120 130">
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B9E1F8" /><stop offset="1" stopColor="#2A9BD9" /></linearGradient>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFDF9" /><stop offset="1" stopColor="#F3E3B5" /></linearGradient>
        <radialGradient id={`${id}f`}><stop offset="0" stopColor="#FFF6DC" /><stop offset="0.5" stopColor="#F3C74F" stopOpacity="0.7" /><stop offset="1" stopColor="#F3C74F" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx="60" cy="119" rx="56" ry="9" fill="#FFFDF9" stroke="#D9B25F" strokeWidth="2" />
      <rect x="12" y="70" width="96" height="48" rx="9" fill={`url(#${id}a)`} />
      <path d={`M12 80 Q12 70 22 70 H98 Q108 70 108 80 V86 ${drips(8, 12)} Z`} fill="#FFFDF9" />
      <rect x="12" y="105" width="96" height="4" fill="#E7C77D" />
      {[26, 44, 62, 80, 96].map((x, k) => <circle key={x} cx={x} cy={k % 2 ? 97 : 94} r="2.4" fill="#FFFDF9" />)}
      <rect x="30" y="40" width="60" height="32" rx="7" fill={`url(#${id}b)`} stroke="#E7C77D" strokeWidth="1.5" />
      <path d={`M30 48 Q30 40 37 40 H83 Q90 40 90 48 V52 ${drips(6, 10)} Z`} fill="#86CBF1" />
      {[44, 57, 70].map((x, k) => (
        <g key={x}>
          <circle cx={x + 3} cy="10" r="10" fill={`url(#${id}f)`} />
          <rect x={x} y="18" width="6" height="23" rx="2" fill={k === 1 ? '#E7C77D' : '#FFFDF9'} stroke="#D9B25F" strokeWidth="1" />
          <path d={`M${x + 3} 3 q6 8 0 13 q-6 -5 0 -13z`} fill="#F3C74F" />
          <path d={`M${x + 3} 8 q2.5 4 0 7 q-2.5 -3 0 -7z`} fill="#FFFDF9" />
        </g>
      ))}
    </Svg>
  );
}

function Popcorn() {
  const id = useUid();
  const stripes = Array.from({ length: 5 }, (_, i) => {
    const t0 = 16 + i * 15.6, t1 = t0 + 15.6, b0 = 27 + i * 11.2, b1 = b0 + 11.2;
    return i % 2 === 0 ? `M${t0} 52 L${t1} 52 L${b1} 126 L${b0} 126 Z` : '';
  }).join(' ');
  const puffs: [number, number, number][] = [[24, 46, 11], [40, 40, 12], [57, 36, 13], [74, 40, 12], [88, 47, 10], [32, 28, 10], [50, 22, 11], [67, 23, 11], [82, 30, 9], [58, 9, 9], [41, 11, 8], [75, 10, 7]];
  return (
    <Svg vb="0 0 110 130">
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#C9962E" /><stop offset="0.5" stopColor="#F3E3B5" /><stop offset="1" stopColor="#C9962E" /></linearGradient>
        <radialGradient id={`${id}p`} cx="0.35" cy="0.35"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#FFF6DC" /><stop offset="1" stopColor="#F3E3B5" /></radialGradient>
      </defs>
      {puffs.map(([x, y, r], k) => (
        <g key={k}>
          <circle cx={x} cy={y} r={r} fill={`url(#${id}p)`} stroke="#E7C77D" strokeWidth="0.8" />
          <circle cx={x + r * 0.45} cy={y - r * 0.2} r={r * 0.55} fill={`url(#${id}p)`} stroke="#E7C77D" strokeWidth="0.6" />
        </g>
      ))}
      <path d="M16 52 L94 52 L83 126 L27 126 Z" fill="#FFFDF9" />
      <path d={stripes} fill="#2A9BD9" />
      <path d="M16 52 L94 52 L83 126 L27 126 Z" fill="none" stroke="#126496" strokeOpacity="0.25" strokeWidth="1.5" />
      <rect x="11" y="45" width="88" height="11" rx="5.5" fill={`url(#${id}g)`} />
      <circle cx="55" cy="88" r="13" fill="#FFFDF9" stroke="#E7C77D" strokeWidth="2" />
      <path d="M55 79 l2.6 5.6 6 .6 -4.5 4 1.3 6 -5.4 -3.1 -5.4 3.1 1.3 -6 -4.5 -4 6 -.6z" fill="#D9B25F" />
    </Svg>
  );
}

function Popper() {
  const id = useUid();
  const bits: [number, number, string, 'r' | 'c', number][] = [
    [72, 40, '#E7C77D', 'r', 20], [88, 26, '#4FB3E8', 'c', 0], [98, 52, '#FFFFFF', 'r', -30], [60, 22, '#86CBF1', 'r', 45], [106, 30, '#C9962E', 'c', 0],
    [82, 60, '#FFFDF9', 'c', 0], [92, 10, '#D9B25F', 'r', 60], [112, 66, '#4FB3E8', 'r', 15], [70, 6, '#FFFFFF', 'c', 0], [104, 46, '#F3E3B5', 'r', -50], [80, 44, '#2A9BD9', 'c', 0],
  ];
  return (
    <Svg vb="0 0 120 120">
      <defs>
        <linearGradient id={`${id}c`} x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#A87A1F" /><stop offset="0.5" stopColor="#E7C77D" /><stop offset="1" stopColor="#F3E3B5" /></linearGradient>
      </defs>
      <path d="M58 66 q10 -12 4 -22 q-6 -10 6 -20" fill="none" stroke="#E7C77D" strokeWidth="3" strokeLinecap="round" />
      <path d="M66 76 q14 -2 20 -12 q6 -10 18 -8" fill="none" stroke="#4FB3E8" strokeWidth="3" strokeLinecap="round" />
      <path d="M62 70 q6 -18 22 -22" fill="none" stroke="#FFFDF9" strokeWidth="2.5" strokeLinecap="round" />
      {bits.map(([x, y, c, s, r], k) => s === 'c'
        ? <circle key={k} cx={x} cy={y} r="3.4" fill={c} />
        : <rect key={k} x={x - 2.5} y={y - 5} width="5" height="10" rx="1" fill={c} transform={`rotate(${r} ${x} ${y})`} />)}
      <path d="M10 112 L34 58 L64 88 Z" fill={`url(#${id}c)`} />
      <path d="M10 112 L41 66 L45 70 Z M10 112 L52 78 L56 82 Z" fill="#2A9BD9" opacity="0.85" />
      <ellipse cx="49" cy="73" rx="21" ry="6.5" transform="rotate(45 49 73)" fill="#FFF6DC" stroke="#C9962E" strokeWidth="1.5" />
    </Svg>
  );
}

function BalloonShape({ tone, x = 0, y = 0, s = 1, id }: { tone: Tone; x?: number; y?: number; s?: number; id: string }) {
  const [l, m, d] = TONES[tone];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <radialGradient id={`${id}${tone}`} cx="0.35" cy="0.3" r="0.75"><stop offset="0" stopColor={l} /><stop offset="0.55" stopColor={m} /><stop offset="1" stopColor={d} /></radialGradient>
      </defs>
      <ellipse cx="30" cy="34" rx="26" ry="31" fill={`url(#${id}${tone})`} />
      <ellipse cx="20" cy="20" rx="6" ry="10" transform="rotate(-25 20 20)" fill="#FFFFFF" opacity="0.55" />
      <path d="M26 66 L34 66 L30 61 Z" fill={d} />
    </g>
  );
}

function Balloon({ tone = 'sky' }: { tone?: Tone }) {
  const id = useUid();
  return (
    <Svg vb="0 0 60 125">
      <path d="M30 66 q-7 14 0 26 q7 12 -2 30" fill="none" stroke="#D9B25F" strokeWidth="1.6" />
      <BalloonShape tone={tone} id={id} />
    </Svg>
  );
}

function Bunch({ tones = ['sky', 'gold', 'cream'] }: { tones?: Tone[] }) {
  const id = useUid();
  return (
    <Svg vb="0 0 110 150">
      <path d="M28 66 Q40 110 55 146 M55 58 Q55 100 55 146 M82 70 Q70 110 55 146" fill="none" stroke="#D9B25F" strokeWidth="1.5" />
      <BalloonShape tone={tones[0]} x={-2} y={4} s={1} id={id + 'a'} />
      <BalloonShape tone={tones[2]} x={52} y={8} s={1} id={id + 'c'} />
      <BalloonShape tone={tones[1]} x={25} y={-8} s={1.02} id={id + 'b'} />
    </Svg>
  );
}

function Heart({ tone = 'gold' }: { tone?: Tone }) {
  const id = useUid();
  const [l, m, d] = TONES[tone];
  return (
    <Svg vb="0 0 80 135">
      <defs><radialGradient id={`${id}h`} cx="0.35" cy="0.3" r="0.8"><stop offset="0" stopColor={l} /><stop offset="0.55" stopColor={m} /><stop offset="1" stopColor={d} /></radialGradient></defs>
      <path d="M40 74 q-6 16 2 30 q8 14 -2 30" fill="none" stroke="#D9B25F" strokeWidth="1.6" />
      <path d="M40 72 C 6 50, 2 16, 22 9 C 32 5, 40 12, 40 21 C 40 12, 48 5, 58 9 C 78 16, 74 50, 40 72 Z" fill={`url(#${id}h)`} />
      <ellipse cx="22" cy="24" rx="5" ry="9" transform="rotate(-30 22 24)" fill="#FFFFFF" opacity="0.5" />
      <path d="M36 76 L44 76 L40 70 Z" fill={d} />
    </Svg>
  );
}

function Gift() {
  const id = useUid();
  return (
    <Svg vb="0 0 110 112">
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#86CBF1" /><stop offset="1" stopColor="#167DBA" /></linearGradient>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#C9962E" /><stop offset="0.5" stopColor="#F3E3B5" /><stop offset="1" stopColor="#C9962E" /></linearGradient>
      </defs>
      <rect x="14" y="48" width="82" height="60" rx="6" fill={`url(#${id}b)`} />
      <rect x="8" y="34" width="94" height="18" rx="5" fill="#4FB3E8" />
      <rect x="47" y="34" width="16" height="74" fill={`url(#${id}r)`} />
      <path d="M55 34 C 38 6, 16 20, 50 34 Z M55 34 C 72 6, 94 20, 60 34 Z" fill={`url(#${id}r)`} stroke="#A87A1F" strokeWidth="1" />
      <circle cx="55" cy="33" r="6" fill="#E7C77D" stroke="#A87A1F" strokeWidth="1" />
      <rect x="14" y="52" width="82" height="4" fill="#126496" opacity="0.25" />
    </Svg>
  );
}

function Clapper() {
  return (
    <Svg vb="0 0 120 100">
      <g transform="rotate(-16 12 36)">
        <rect x="10" y="20" width="100" height="16" rx="3" fill="#0E2A47" stroke="#FBF7EF" strokeWidth="1.5" />
        {[0, 1, 2, 3, 4].map((k) => <path key={k} d={`M${18 + k * 19} 21 l10 0 l-8 14 l-10 0z`} fill="#FBF7EF" />)}
      </g>
      <rect x="10" y="38" width="100" height="58" rx="6" fill="#0E2A47" stroke="#FBF7EF" strokeWidth="1.5" />
      <rect x="10" y="38" width="100" height="14" rx="3" fill="#FBF7EF" />
      {[0, 1, 2, 3, 4].map((k) => <path key={k} d={`M${16 + k * 19} 39 l10 0 l-8 12 l-10 0z`} fill="#0E2A47" />)}
      <rect x="20" y="62" width="44" height="4" rx="2" fill="#E7C77D" />
      <rect x="20" y="72" width="80" height="3" rx="1.5" fill="#FBF7EF" opacity="0.6" />
      <rect x="20" y="81" width="60" height="3" rx="1.5" fill="#FBF7EF" opacity="0.6" />
      <circle cx="14" cy="38" r="4" fill="#E7C77D" />
    </Svg>
  );
}

function Glasses() {
  const id = useUid();
  const flute = (tx: number, r: number) => (
    <g transform={`translate(${tx} 16) rotate(${r})`}>
      <path d="M-13 0 L13 0 L10 46 Q0 55 -10 46 Z" fill={`url(#${id}w)`} stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.5" />
      <path d="M-11.5 12 L11.5 12 L10 46 Q0 55 -10 46 Z" fill={`url(#${id}c)`} />
      {[[-4, 34], [3, 26], [-1, 20], [5, 40]].map(([x, y], k) => <circle key={k} cx={x} cy={y} r="1.4" fill="#FFFFFF" opacity="0.8" />)}
      <rect x="-1.6" y="51" width="3.2" height="30" fill="#FFFFFF" opacity="0.9" />
      <ellipse cx="0" cy="82" rx="14" ry="3.6" fill="#FFFFFF" opacity="0.9" />
    </g>
  );
  return (
    <Svg vb="0 0 120 112">
      <defs>
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FFFFFF" stopOpacity="0.45" /><stop offset="1" stopColor="#DDF0FC" stopOpacity="0.25" /></linearGradient>
        <linearGradient id={`${id}c`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF6DC" /><stop offset="1" stopColor="#D9B25F" /></linearGradient>
      </defs>
      {flute(42, -14)}
      {flute(78, 14)}
      <path d="M60 2 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" fill="#F3E3B5" />
    </Svg>
  );
}

function Ticket() {
  const id = useUid();
  return (
    <Svg vb="0 0 120 70">
      <defs><linearGradient id={`${id}t`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F3E3B5" /><stop offset="0.5" stopColor="#E7C77D" /><stop offset="1" stopColor="#C9962E" /></linearGradient></defs>
      <path d="M6 4 H114 V26 A9 9 0 0 0 114 44 V66 H6 V44 A9 9 0 0 0 6 26 Z" fill={`url(#${id}t)`} stroke="#A87A1F" strokeWidth="1.2" />
      <path d="M86 8 V62" stroke="#A87A1F" strokeWidth="1.5" strokeDasharray="3 3" />
      <rect x="14" y="12" width="64" height="46" rx="4" fill="none" stroke="#0E2A47" strokeOpacity="0.35" strokeWidth="1" />
      <text x="46" y="32" textAnchor="middle" fontSize="11" fontWeight="800" letterSpacing="1.5" fill="#0E2A47" fontFamily="system-ui, sans-serif">ADMIT</text>
      <text x="46" y="47" textAnchor="middle" fontSize="11" fontWeight="800" letterSpacing="1.5" fill="#0E2A47" fontFamily="system-ui, sans-serif">ONE</text>
      <path d="M100 27 l2.4 5 5.4 .6 -4 3.6 1.2 5.4 -5 -2.8 -5 2.8 1.2 -5.4 -4 -3.6 5.4 -.6z" fill="#0E2A47" />
    </Svg>
  );
}

function Sparkle() {
  const id = useUid();
  return (
    <Svg vb="0 0 100 100">
      <defs><linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFF6DC" /><stop offset="0.5" stopColor="#E7C77D" /><stop offset="1" stopColor="#C9962E" /></linearGradient></defs>
      <path d="M45 6 C49 38 58 47 90 50 C58 53 49 62 45 94 C41 62 32 53 0 50 C32 47 41 38 45 6 Z" fill={`url(#${id}s)`} />
      <path d="M86 6 C87.5 15 90 17.5 99 19 C90 20.5 87.5 23 86 32 C84.5 23 82 20.5 73 19 C82 17.5 84.5 15 86 6 Z" fill="#FFF6DC" />
    </Svg>
  );
}

function Ring() {
  const id = useUid();
  return (
    <Svg vb="0 0 110 110">
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F3E3B5" /><stop offset="0.5" stopColor="#D9B25F" /><stop offset="1" stopColor="#A87A1F" /></linearGradient>
        <linearGradient id={`${id}d`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#86CBF1" /></linearGradient>
      </defs>
      <path d="M18 12 H92 Q98 12 98 18 V44 H12 V18 Q12 12 18 12 Z" fill="#1d4f7c" stroke="#E7C77D" strokeWidth="1.5" />
      <rect x="20" y="18" width="70" height="20" rx="4" fill="#0E2A47" />
      <rect x="12" y="62" width="86" height="40" rx="8" fill="#0E2A47" stroke="#E7C77D" strokeWidth="1.5" />
      <ellipse cx="55" cy="64" rx="38" ry="9" fill="#FBF7EF" />
      <ellipse cx="55" cy="58" rx="13" ry="14" fill="none" stroke={`url(#${id}g)`} strokeWidth="5" />
      <path d="M55 30 L64 38 L55 48 L46 38 Z" fill={`url(#${id}d)`} stroke="#FFFFFF" strokeWidth="1" />
      <path d="M46 38 H64" stroke="#FFFFFF" strokeWidth="0.8" />
      <path d="M78 26 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5z" fill="#F3E3B5" />
    </Svg>
  );
}

function Reel() {
  const id = useUid();
  return (
    <Svg vb="0 0 100 100">
      <defs><radialGradient id={`${id}r`} cx="0.4" cy="0.35"><stop offset="0" stopColor="#2b78b5" /><stop offset="1" stopColor="#0E2A47" /></radialGradient></defs>
      <circle cx="50" cy="50" r="46" fill={`url(#${id}r)`} stroke="#E7C77D" strokeWidth="3" />
      {[0, 72, 144, 216, 288].map((a) => {
        const r = (a * Math.PI) / 180;
        return <circle key={a} cx={50 + Math.sin(r) * 25} cy={50 - Math.cos(r) * 25} r="11" fill="#FBF7EF" opacity="0.92" />;
      })}
      <circle cx="50" cy="50" r="7" fill="#E7C77D" />
      <circle cx="50" cy="50" r="2.5" fill="#0E2A47" />
    </Svg>
  );
}

export const PROP_ART: Record<PropKind, { ratio: number; render: (tone: Tone) => ReactNode }> = {
  cake: { ratio: 130 / 120, render: () => <Cake /> },
  popcorn: { ratio: 130 / 110, render: () => <Popcorn /> },
  popper: { ratio: 1, render: () => <Popper /> },
  balloon: { ratio: 125 / 60, render: (t) => <Balloon tone={t} /> },
  bunch: { ratio: 150 / 110, render: () => <Bunch /> },
  heart: { ratio: 135 / 80, render: (t) => <Heart tone={t} /> },
  gift: { ratio: 112 / 110, render: () => <Gift /> },
  clapper: { ratio: 100 / 120, render: () => <Clapper /> },
  glasses: { ratio: 112 / 120, render: () => <Glasses /> },
  ticket: { ratio: 70 / 120, render: () => <Ticket /> },
  star: { ratio: 1, render: () => <Sparkle /> },
  ring: { ratio: 1, render: () => <Ring /> },
  reel: { ratio: 1, render: () => <Reel /> },
};

/** Five sharp props around the photo, then two big blurred foreground props, picked by occasion name. */
export function propsFor(name: string): PropKind[] {
  const n = name.toLowerCase();
  if (/birthday|bday/.test(n)) return ['cake', 'popper', 'bunch', 'gift', 'popcorn', 'balloon', 'star'];
  if (/anniversar/.test(n)) return ['glasses', 'heart', 'cake', 'popcorn', 'star', 'heart', 'balloon'];
  if (/propos|date|valentine|love/.test(n)) return ['ring', 'heart', 'glasses', 'popcorn', 'star', 'heart', 'balloon'];
  if (/bachelor|bride|groom|hen/.test(n)) return ['glasses', 'popper', 'bunch', 'gift', 'star', 'balloon', 'popper'];
  if (/farewell|retire|goodbye/.test(n)) return ['popper', 'gift', 'ticket', 'popcorn', 'star', 'balloon', 'popper'];
  if (/baby|shower|gender/.test(n)) return ['balloon', 'gift', 'cake', 'star', 'bunch', 'balloon', 'star'];
  if (/corporate|office|team|movie|screening/.test(n)) return ['clapper', 'popcorn', 'ticket', 'glasses', 'reel', 'reel', 'star'];
  return ['popcorn', 'clapper', 'ticket', 'popper', 'cake', 'balloon', 'reel'];
}
