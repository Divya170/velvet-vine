'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ErrorPanel } from '@/components/admin/ui';
import { adminFetch } from '@/lib/admin-api';
import type { Inquiry, SiteSettings } from '@/lib/types';
import { SUBJECTS } from '@/lib/validation';

interface Stats {
  new: number; responded: number; archived: number; total: number; lastWeek: number;
  bySubject: { subject: string; label: string; count: number }[]; topWines: { name: string; count: number }[];
}
interface Counts { total: number; samples: number; published: number; featured: number; noPhoto: number }
interface Checklist extends Counts { galleryPlaceholders: number; gallery: number; contentNotes: number; hoursVerified: boolean; phoneVerified: boolean; social: number; ageGate: boolean }

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Inquiry[] | null>(null);
  const [check, setCheck] = useState<Checklist | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [s, r, counts, gallery, content, settings] = await Promise.all([
        adminFetch<Stats>('/admin/inquiries/stats'),
        adminFetch<{ items: Inquiry[] }>('/admin/inquiries?status=new&pageSize=6'),
        adminFetch<Counts>('/admin/products/counts'),
        adminFetch<{ imageUrl: string | null }[]>('/admin/gallery'),
        adminFetch<{ fields: Record<string, string | null> }[]>('/admin/content'),
        adminFetch<SiteSettings>('/admin/settings'),
      ]);
      setStats(s);
      setRecent(r.items);
      setCheck({
        ...counts, gallery: gallery.length, galleryPlaceholders: gallery.filter((g) => !g.imageUrl).length,
        contentNotes: content.filter((c) => c.fields?.clientNote).length, hoursVerified: settings.hoursVerified, phoneVerified: settings.phoneVerified, social: settings.socialLinks.length, ageGate: settings.ageGateEnabled,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the dashboard.');
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  const subj = (v: string) => SUBJECTS.find((x) => x.value === v)?.label ?? v;
  const max = Math.max(1, ...(stats?.bySubject.map((b) => b.count) ?? [1]));

  return (
    <>
      <div className="adm-head"><div><h1 className="adm-h1">Dashboard</h1><p className="adm-sub">Inquiries from the website, plus what still needs real content before launch.</p></div></div>
      {error && <ErrorPanel message={error} onRetry={load} />}
      <div className="adm-grid" style={{ marginBottom: 28 }}>
        {([['New inquiries', stats?.new], ['Last 7 days', stats?.lastWeek], ['Responded', stats?.responded], ['All inquiries', stats?.total]] as const).map(([label, v]) => (
          <div key={label} className="adm-card adm-stat"><p>{label}</p><p>{v ?? '–'}</p></div>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start' }}>
        <section className="adm-card" style={{ flex: '2 1 420px' }} aria-labelledby="recent-h">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 id="recent-h" className="serif" style={{ margin: 0, fontSize: 24 }}>New inquiries</h2>
            <Link href="/admin/inquiries" className="adm-btn ghost sm">View all</Link>
          </div>
          {recent === null ? <div className="skel" style={{ height: 120 }} /> : recent.length === 0 ? <p className="hint">No new inquiries. You’re all caught up.</p> : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {recent.map((i) => (
                <li key={i.id} style={{ padding: '12px 0', borderTop: '1px solid #E8DDC9' }}>
                  <Link href={`/admin/inquiries?open=${i.id}`} style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <span><strong>{i.name}</strong> <span className="hint">· {i.productName ?? subj(i.subject)}</span></span>
                    <span className="hint">{new Date(i.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {stats && stats.total > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, marginTop: 24 }}>
              <div style={{ flex: '1 1 240px' }}>
                <h3 style={{ fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: '#6E675F', margin: '0 0 10px' }}>Open inquiries by subject</h3>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {stats.bySubject.map((b) => (
                    <li key={b.subject} style={{ display: 'grid', gridTemplateColumns: 'minmax(110px, 170px) 1fr 28px', gap: 10, alignItems: 'center', fontSize: 14 }}>
                      <span>{b.label}</span>
                      <span aria-hidden="true" style={{ height: 6, background: '#E8DDC9' }}><span style={{ display: 'block', height: '100%', width: `${(b.count / max) * 100}%`, background: '#541C2B' }} /></span>
                      <strong style={{ textAlign: 'right' }}>{b.count}</strong>
                    </li>
                  ))}
                </ul>
              </div>
              {stats.topWines.length > 0 && (
                <div style={{ flex: '1 1 200px' }}>
                  <h3 style={{ fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: '#6E675F', margin: '0 0 10px' }}>Most-asked-about wines</h3>
                  <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14 }}>
                    {stats.topWines.map((t) => <li key={t.name}>{t.name} <span className="hint">({t.count})</span></li>)}
                  </ol>
                </div>
              )}
            </div>
          )}
        </section>
        <section className="adm-card" style={{ flex: '1 1 300px' }} aria-labelledby="launch-h">
          <h2 id="launch-h" className="serif" style={{ margin: '0 0 12px', fontSize: 24 }}>Launch checklist</h2>
          {!check ? <div className="skel" style={{ height: 140 }} /> : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <li><Link href="/admin/settings">{check.phoneVerified ? 'Phone number verified ✓' : 'Verify the phone number (735 is not a Ventura, CA area code — confirm it with Velvet Vine)'}</Link></li>
              <li><Link href="/admin/settings">{check.hoursVerified ? 'Store hours verified ✓' : 'Store hours not confirmed — every day shows “[Hours to confirm]”'}</Link></li>
              <li><Link href="/admin/wines">{check.samples ? `${check.samples} of ${check.total} wines are still samples` : 'No sample wines left ✓'}</Link></li>
              <li><Link href="/admin/wines">{check.noPhoto ? `${check.noPhoto} wines have no photo yet` : 'Every wine has a photo ✓'}</Link></li>
              <li><Link href="/admin/gallery">{check.galleryPlaceholders ? `${check.galleryPlaceholders} of ${check.gallery} gallery photos are placeholders` : 'All gallery items have photos ✓'}</Link></li>
              <li><Link href="/admin/content">{check.contentNotes ? `${check.contentNotes} content blocks still show “Client to supply/confirm” notes` : 'No placeholder notes left ✓'}</Link></li>
              <li><Link href="/admin/settings">{check.ageGate ? 'Age confirmation is ON ✓ (keep only if legally required)' : 'Age confirmation is off — confirm the legal requirement with Velvet Vine before launch'}</Link></li>
              <li><Link href="/admin/settings">{check.social ? `${check.social} official social links added ✓` : 'No social links (optional; add only official accounts)'}</Link></li>
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
