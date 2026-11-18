import type { SiteSettings } from '@/lib/types';

/** Live Google Maps embed once set in Settings; otherwise the design's illustrated map preview, linking to Google Maps. No coordinates are invented. */
export function MapPanel({ settings, style }: { settings: SiteSettings; style?: React.CSSProperties }) {
  if (settings.mapEmbedUrl) {
    return (
      <div className="map-prev" style={style}>
        <iframe className="map-frame" src={settings.mapEmbedUrl} title={`Map showing ${settings.businessName}, ${settings.fullAddress}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      </div>
    );
  }
  const street = settings.addressLine1.replace(/^\d+\s*/, '').toUpperCase();
  return (
    <a className="map-prev zoom-host" href={settings.mapsUrl} target="_blank" rel="noopener noreferrer" aria-label={`Map preview of ${settings.fullAddress}. Opens Google Maps in a new tab`} style={style}>
      <svg className="zoom" viewBox="0 0 700 460" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
        <rect width="700" height="460" fill="#E9DFCF" />
        <g stroke="#FCFAF5" strokeWidth="18" fill="none"><path d="M-20 290 L720 250" /><path d="M200 -20 L240 480" /><path d="M500 -20 L470 480" /></g>
        <g stroke="#FCFAF5" strokeWidth="7" fill="none"><path d="M-20 110 L720 84" /><path d="M-20 400 L720 372" /><path d="M70 -20 L100 480" /><path d="M620 -20 L600 480" /><path d="M355 -20 L362 480" /></g>
        <path d="M0 0 L180 0 C160 50 110 80 0 86 Z" fill="#CBB79A" opacity=".5" />
        <text x="262" y="234" fontFamily="Manrope, sans-serif" fontSize="13" fontWeight="700" letterSpacing="3" fill="#7A6034" transform="rotate(-3 262 234)">{street}</text>
        <g transform="translate(358 222)"><circle r="40" fill="#541C2B" opacity=".12" /><path d="M0 20s-17-15-17-28a17 17 0 0 1 34 0C17 5 0 20 0 20z" fill="#541C2B" transform="translate(0 -20)" /><circle cy="-28" r="6" fill="#F5F0E7" /></g>
      </svg>
      <span className="map-tag">Map preview · {settings.businessName} ↗</span>
    </a>
  );
}
