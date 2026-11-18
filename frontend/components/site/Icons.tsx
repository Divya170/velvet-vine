/** Stroke icons, the VELVET VINE wordmark and the vine tendril from the design. All decorative: aria-hidden. */
const P: Record<string, React.ReactNode> = {
  glass: <><path d="M7 3h10c0 5-1.5 9-5 9S7 8 7 3z" /><path d="M12 12v8" /><path d="M8 21h8" /><path d="M7.4 6.5h9.2" /></>,
  bottle: <><path d="M10 2h4v4c0 1 3 2.5 3 6v8a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-8c0-3.5 3-5 3-6z" /><path d="M7 13h10" /></>,
  grape: <><circle cx="9" cy="10" r="2.4" /><circle cx="14" cy="10" r="2.4" /><circle cx="11.5" cy="14" r="2.4" /><circle cx="16.5" cy="14" r="2.4" /><circle cx="14" cy="18" r="2.4" /><path d="M12 7.5c0-2 1-3.5 3-4.5" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></>,
  door: <><path d="M5 21V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17" /><path d="M3 21h18" /><circle cx="15" cy="12" r=".8" /></>,
  leaf: <><path d="M5 19c1.5-7 6-11.5 14-14-1 8-6 13-14 14z" /><path d="M5 19c4-4 8-8.5 14-14" /></>,
  pin: <><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  phone: <><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" /><path d="M3 7l9 6 9-6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  close: <><path d="M5 5l14 14M19 5L5 19" /></>,
  prev: <><path d="M15 5l-7 7 7 7" /></>,
  next: <><path d="M9 5l7 7-7 7" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  menu: <><path d="M3 8h18M3 16h18" /></>,
  pause: <><path d="M9 5v14M15 5v14" /></>,
  play: <><path d="M8 5l11 7-11 7z" /></>,
};
export const ICON_NAMES = ['glass', 'bottle', 'grape', 'compass', 'door', 'leaf', 'pin', 'phone', 'mail', 'clock'];

export function Icon({ name, size = 24, sw = 1.3 }: { name: string; size?: number; sw?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[name] ?? P.glass}
    </svg>
  );
}

/** Framed vine monogram + spaced serif caps. */
export function Logo({ color = '#211D1B', gold = '#B49A68', sub = '#7A6034', size = 1, tagline = 'Wine Boutique · Ventura', name = 'VELVET VINE' }: {
  color?: string; gold?: string; sub?: string; size?: number; tagline?: string; name?: string;
}) {
  const s = size;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(14 * s), color }}>
      <svg width={Math.round(38 * s)} height={Math.round(46 * s)} viewBox="0 0 38 46" fill="none" aria-hidden="true">
        <rect x=".5" y=".5" width="37" height="45" stroke={gold} strokeWidth="1" />
        <path d="M19 9c0 8-6 10-6 18 0 4 3 7 6 7s6-3 6-7c0-8-6-10-6-18z" stroke={color} strokeWidth="1.1" />
        <path d="M19 9c2-3 5-4 8-3" stroke={gold} strokeWidth="1.1" strokeLinecap="round" />
        <path d="M24.5 6.2c1.2-1.6 3.4-2 4.5-1-1 1.6-3 2.2-4.5 1z" fill={gold} />
        <path d="M13 38h12" stroke={gold} strokeWidth="1" />
      </svg>
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ font: `500 ${Math.round(21 * s)}px/1 var(--serif)`, letterSpacing: '.28em' }}>{name}</span>
        <span style={{ fontSize: +(9.5 * s).toFixed(1), fontWeight: 700, letterSpacing: '.38em', textTransform: 'uppercase', color: sub, marginTop: Math.round(7 * s) }}>{tagline}</span>
      </span>
    </span>
  );
}

/** Fine-line vine tendril decoration (hidden on small screens via .vine-deco). */
export function Vine({ w = 240, color = '#B49A68', className = 'vine-deco', style }: { w?: number; color?: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg width={w} height={w} viewBox="0 0 200 200" fill="none" stroke={color} strokeWidth=".9" strokeLinecap="round" aria-hidden="true" className={className} style={style}>
      <path d="M20 190C40 140 60 120 100 104s60-40 78-86" />
      <path d="M100 104c-6-14-2-28 10-36" /><path d="M110 68c4 0 9 3 9 8" />
      <path d="M62 132c-18 2-32-8-36-24 18-2 32 8 36 24z" /><path d="M62 132c-12-8-24-16-36-24" />
      <path d="M140 74c4-16 18-24 34-22-4 16-18 24-34 22z" /><path d="M140 74c10-8 22-16 34-22" />
      <circle cx="128" cy="96" r="5" /><circle cx="138" cy="102" r="5" /><circle cx="130" cy="107" r="5" /><circle cx="140" cy="113" r="5" /><circle cx="132" cy="118" r="5" /><circle cx="137" cy="126" r="5" />
    </svg>
  );
}
