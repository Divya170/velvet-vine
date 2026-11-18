import Link from 'next/link';
import type { ProductCategory, SiteSettings } from '@/lib/types';
import { NAV } from './nav';
import { Logo, Vine } from './Icons';

const HOURS_NOTE = 'Store hours to be confirmed. Please call or email before visiting.';

export function Footer({ settings, styles }: { settings: SiteSettings; styles: Pick<ProductCategory, 'slug' | 'name'>[] }) {
  const year = new Date().getFullYear();
  return (
    <footer className="foot on-dark" style={{ padding: 'clamp(80px,9vw,120px) 0 36px', position: 'relative', overflow: 'hidden' }}>
      <Vine w={340} color="#B49A68" style={{ right: -50, top: -40, opacity: 0.22 }} />
      <div className="wrap" style={{ position: 'relative' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48, justifyContent: 'space-between', paddingBottom: 56, borderBottom: '1px solid rgba(180,154,104,.3)' }}>
          <div style={{ flex: '1 1 320px', maxWidth: 400 }}>
            <Logo color="#F5F0E7" sub="#D9C08F" name={settings.businessName.toUpperCase()} tagline={settings.tagline} />
            <p style={{ margin: '26px 0 28px', lineHeight: 1.8, fontSize: 15, color: '#CDBFB6' }}>{settings.footerNote}</p>
            <Link className="btn btn-light" href="/wines">Explore the Collection <span className="arr" aria-hidden="true">→</span></Link>
          </div>
          <nav aria-label="Footer" style={{ flex: '0 1 170px' }}>
            <p className="label" style={{ marginBottom: 20 }}>Explore</p>
            <ul>{NAV.map((n) => <li key={n.href}><Link href={n.href}>{n.label}</Link></li>)}</ul>
          </nav>
          {styles.length > 0 && (
            <nav aria-label="Wine collection" style={{ flex: '0 1 170px' }}>
              <p className="label" style={{ marginBottom: 20 }}>Wine collection</p>
              <ul>{styles.map((c) => <li key={c.slug}><Link href={`/wines?category=${c.slug}`}>{c.name}</Link></li>)}</ul>
            </nav>
          )}
          <div style={{ flex: '0 1 280px' }}>
            <p className="label" style={{ marginBottom: 20 }}>Visit &amp; contact</p>
            <address style={{ fontStyle: 'normal', lineHeight: 1.8, color: '#E7DCD2', fontSize: 15 }}>
              <a href={settings.mapsUrl} target="_blank" rel="noopener noreferrer">{settings.addressLine1}<br />{settings.city}, {settings.region} {settings.postalCode}, {settings.country}<span className="sr"> (opens Google Maps in a new tab)</span></a><br />
              {settings.phoneHref && <><a href={settings.phoneHref} style={{ display: 'inline-flex', minHeight: 40, alignItems: 'center' }}>{settings.phone}</a><br /></>}
              {settings.emailHref && <a href={settings.emailHref} style={{ display: 'inline-flex', minHeight: 40, alignItems: 'center', wordBreak: 'break-all' }}>{settings.email}</a>}
            </address>
            {settings.hoursVerified ? (
              <ul style={{ marginTop: 12, gap: 4, fontSize: 14, color: '#CDBFB6' }}>
                {settings.hoursDisplay.map((h) => <li key={h.day}><span style={{ display: 'inline-block', minWidth: 44 }}>{h.day.slice(0, 3)}</span> {h.label}</li>)}
              </ul>
            ) : (
              <p style={{ marginTop: 12, fontSize: 14, color: '#CDBFB6' }}>{HOURS_NOTE}</p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, paddingTop: 28, fontSize: 13, color: '#CDBFB6' }}>
          <p>© {year} {settings.businessName}. All rights reserved.</p>
          {settings.socialLinks.length > 0 && (
            <ul style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 18 }} aria-label="Social media">
              {settings.socialLinks.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}<span className="sr"> (opens in a new tab)</span></a></li>)}
            </ul>
          )}
          <p>Wine is displayed for discovery only. No online sales, shipping or delivery. Please enjoy responsibly.</p>
        </div>
      </div>
    </footer>
  );
}

export function StickyCta({ phoneHref }: { phoneHref: string | null }) {
  return (
    <div className="sticky-cta" role="region" aria-label="Quick actions">
      <Link className="btn" href="/contact">Inquire</Link>
      {phoneHref ? <a className="btn btn-ghost" href={phoneHref}>Call</a> : <Link className="btn btn-ghost" href="/wines">Wines</Link>}
    </div>
  );
}

export { HOURS_NOTE };
