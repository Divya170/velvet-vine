'use client';

import { useCallback, useEffect, useState } from 'react';
import { ErrorPanel, useToast } from '@/components/admin/ui';
import { ApiError } from '@/lib/api';
import { adminFetch } from '@/lib/admin-api';
import type { DayHours, SiteSettings, SocialLink } from '@/lib/types';

type Editable = Pick<SiteSettings,
  'businessName' | 'tagline' | 'addressLine1' | 'city' | 'region' | 'postalCode' | 'country' | 'phone' | 'phoneVerified' | 'email' | 'mapEmbedUrl' |
  'heroAutoplay' | 'heroIntervalSeconds' | 'galleryStripSeconds' | 'ageGateEnabled' | 'minimumAge' | 'hours' | 'hoursVerified' | 'socialLinks' | 'footerNote'>;

const TEXT: { name: keyof Editable; label: string; help?: string; wide?: boolean }[] = [
  { name: 'businessName', label: 'Business name' },
  { name: 'tagline', label: 'Header tagline' },
  { name: 'phone', label: 'Phone', help: 'Shown with tap-to-call links. Leave blank to hide.' },
  { name: 'email', label: 'Email', help: 'Shown with mailto links. Leave blank to hide.' },
  { name: 'addressLine1', label: 'Street address', wide: true },
  { name: 'city', label: 'City' },
  { name: 'region', label: 'State' },
  { name: 'postalCode', label: 'ZIP code' },
  { name: 'country', label: 'Country' },
  { name: 'mapEmbedUrl', label: 'Google Maps embed URL (optional)', wide: true, help: 'Google Maps → Share → Embed a map → copy the src="https://www.google.com/maps/embed?…" value. Leave blank to show the illustrated map (directions links still work).' },
  { name: 'footerNote', label: 'Footer note', wide: true },
];

const pick = (d: SiteSettings): Editable => ({
  businessName: d.businessName, tagline: d.tagline, addressLine1: d.addressLine1, city: d.city, region: d.region, postalCode: d.postalCode, country: d.country,
  phone: d.phone ?? '', phoneVerified: d.phoneVerified, email: d.email ?? '', mapEmbedUrl: d.mapEmbedUrl ?? '',
  heroAutoplay: d.heroAutoplay, heroIntervalSeconds: d.heroIntervalSeconds, galleryStripSeconds: d.galleryStripSeconds,
  ageGateEnabled: d.ageGateEnabled, minimumAge: d.minimumAge,
  hours: d.hours, hoursVerified: d.hoursVerified, socialLinks: d.socialLinks, footerNote: d.footerNote,
});

export default function SettingsAdmin() {
  const [s, setS] = useState<Editable | null>(null);
  const [preview, setPreview] = useState<SiteSettings | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwBusy, setPwBusy] = useState(false);
  const toast = useToast();

  const load = useCallback(async () => {
    setLoadError('');
    try {
      const d = await adminFetch<SiteSettings>('/admin/settings');
      setS(pick(d));
      setPreview(d);
    } catch (e) { setLoadError(e instanceof Error ? e.message : 'Could not load settings.'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const upd = <K extends keyof Editable>(k: K, v: Editable[K]) => setS((p) => (p ? { ...p, [k]: v } : p));
  const updDay = (i: number, patch: Partial<DayHours>) => setS((p) => (p ? { ...p, hours: p.hours.map((h, j) => (j === i ? { ...h, ...patch } : h)) } : p));
  const updLink = (i: number, patch: Partial<SocialLink>) => setS((p) => (p ? { ...p, socialLinks: p.socialLinks.map((l, j) => (j === i ? { ...l, ...patch } : l)) } : p));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!s) return;
    const fe: Record<string, string> = {};
    if (!s.businessName.trim()) fe.businessName = 'Business name is required.';
    if (s.hoursVerified) {
      const missing = s.hours.filter((h) => !h.closed && (!h.open || !h.close)).map((h) => h.day);
      if (missing.length) fe.hours = `Add times (or mark closed) for ${missing.join(', ')} before marking hours as verified.`;
    }
    setErrors(fe);
    if (Object.keys(fe).length) return;
    setSaving(true);
    try {
      const d = await adminFetch<SiteSettings>('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({ ...s, heroIntervalSeconds: Number(s.heroIntervalSeconds), galleryStripSeconds: Number(s.galleryStripSeconds), minimumAge: Number(s.minimumAge), socialLinks: s.socialLinks.filter((l) => l.label.trim() || l.url.trim()) }),
      });
      setS(pick(d));
      setPreview(d);
      toast.show('Settings saved. The website updates immediately.');
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fieldErrors);
      toast.show(err instanceof Error ? err.message : 'Save failed.', true);
    } finally { setSaving(false); }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    const fe: Record<string, string> = {};
    if (!pw.currentPassword) fe.currentPassword = 'Enter your current password.';
    if (pw.newPassword.length < 10) fe.newPassword = 'Use at least 10 characters.';
    if (pw.confirm !== pw.newPassword) fe.confirm = 'The passwords don’t match.';
    setPwErrors(fe);
    if (Object.keys(fe).length) return;
    setPwBusy(true);
    try {
      await adminFetch('/admin-auth/password', { method: 'PATCH', body: JSON.stringify({ currentPassword: pw.currentPassword, newPassword: pw.newPassword }) });
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      toast.show('Password changed.');
    } catch (err) {
      if (err instanceof ApiError) setPwErrors(err.fieldErrors);
      toast.show(err instanceof Error ? err.message : 'Could not change the password.', true);
    } finally { setPwBusy(false); }
  }

  if (loadError) return <ErrorPanel message={loadError} onRetry={load} />;
  if (!s) return <div className="skel" style={{ height: 420 }} role="status" aria-label="Loading settings" />;
  const errFor = (k: string) => Object.entries(errors).find(([key]) => key === k || key.startsWith(`${k}.`))?.[1];

  return (
    <>
      <div className="adm-head"><div><h1 className="adm-h1">Settings</h1><p className="adm-sub">Shop details, store hours, social links and homepage motion.</p></div></div>
      <form onSubmit={save} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>
        <section className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 18 }} aria-labelledby="det-h">
          <h2 id="det-h" className="serif" style={{ margin: 0, fontSize: 24 }}>Shop details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
            {TEXT.map((f) => (
              <div key={f.name} className="field" style={f.wide ? { gridColumn: '1 / -1' } : undefined}>
                <label htmlFor={`s-${f.name}`}>{f.label}</label>
                <input id={`s-${f.name}`} className="input" value={(s[f.name] as string | null) ?? ''} onChange={(e) => upd(f.name, e.target.value as never)} aria-invalid={!!errFor(f.name)} />
                {f.help && <p className="hint">{f.help}</p>}
                {errFor(f.name) && <p className="err">{errFor(f.name)}</p>}
              </div>
            ))}
          </div>
          <label className="check"><input type="checkbox" checked={s.phoneVerified} onChange={(e) => upd('phoneVerified', e.target.checked)} /><span><strong>Phone number verified with the client</strong><span className="hint" style={{ display: 'block' }}>For your records and the launch checklist. The supplied number uses area code 735, which is not a Ventura, CA area code — please confirm it with Velvet Vine first.</span></span></label>
        </section>

        <section className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }} aria-labelledby="hours-h">
          <h2 id="hours-h" className="serif" style={{ margin: 0, fontSize: 24 }}>Opening hours</h2>
          <p className="hint">No hours were supplied. Until hours are entered and marked verified, every day shows “[Hours to confirm]”, the site says “Store hours to be confirmed. Please call or email before visiting.” and no open/closed status is shown. Times are in the boutique’s timezone; a closing time earlier than opening means it closes after midnight.</p>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th scope="col">Day</th><th scope="col">Opens</th><th scope="col">Closes</th><th scope="col">Closed all day</th></tr></thead>
              <tbody>
                {s.hours.map((h, i) => (
                  <tr key={h.day}>
                    <th scope="row" style={{ textAlign: 'left', fontWeight: 700 }}>{h.day}</th>
                    <td><input type="time" className="input" aria-label={`${h.day} opening time`} value={h.open ?? ''} disabled={h.closed} onChange={(e) => updDay(i, { open: e.target.value || null })} style={{ minHeight: 40 }} /></td>
                    <td><input type="time" className="input" aria-label={`${h.day} closing time`} value={h.close ?? ''} disabled={h.closed} onChange={(e) => updDay(i, { close: e.target.value || null })} style={{ minHeight: 40 }} /></td>
                    <td><input type="checkbox" aria-label={`Closed on ${h.day}`} checked={h.closed} onChange={(e) => updDay(i, { closed: e.target.checked })} style={{ width: 18, height: 18, accentColor: '#541C2B' }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {errFor('hours') && <p className="err" role="alert">{errFor('hours')}</p>}
          <label className="check"><input type="checkbox" checked={s.hoursVerified} onChange={(e) => upd('hoursVerified', e.target.checked)} /><span><strong>These hours are confirmed by the boutique</strong><span className="hint" style={{ display: 'block' }}>Shows the hours everywhere and turns on the live “Open now / Closed now” status.</span></span></label>
          {preview?.openStatus && <p className="hint">Live status right now: <strong>{preview.openStatus.label}</strong></p>}
        </section>

        <section className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }} aria-labelledby="feat-h">
          <h2 id="feat-h" className="serif" style={{ margin: 0, fontSize: 24 }}>Motion</h2>
          <label className="check"><input type="checkbox" checked={s.heroAutoplay} onChange={(e) => upd('heroAutoplay', e.target.checked)} /><span><strong>Homepage hero photos change automatically</strong><span className="hint" style={{ display: 'block' }}>Always pauses on hover, on the pause button and for visitors who prefer reduced motion.</span></span></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
            <div className="field" style={{ width: 240 }}>
              <label htmlFor="s-hero">Seconds between hero photos (6–8)</label>
              <input id="s-hero" type="number" min={6} max={8} className="input" value={s.heroIntervalSeconds} onChange={(e) => upd('heroIntervalSeconds', Number(e.target.value))} aria-invalid={!!errFor('heroIntervalSeconds')} />
              {errFor('heroIntervalSeconds') && <p className="err">{errFor('heroIntervalSeconds')}</p>}
            </div>
            <div className="field" style={{ width: 280 }}>
              <label htmlFor="s-strip">Gallery featured strip: seconds per step (5–8)</label>
              <input id="s-strip" type="number" min={5} max={8} className="input" value={s.galleryStripSeconds} onChange={(e) => upd('galleryStripSeconds', Number(e.target.value))} aria-invalid={!!errFor('galleryStripSeconds')} />
              {errFor('galleryStripSeconds') && <p className="err">{errFor('galleryStripSeconds')}</p>}
            </div>
          </div>
        </section>

        <section className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }} aria-labelledby="age-h">
          <h2 id="age-h" className="serif" style={{ margin: 0, fontSize: 24 }}>Legal-age confirmation</h2>
          <p className="hint">Off by default. Turn it on only after Velvet Vine has confirmed the legal requirement for its website. Visitors are asked a yes/no question only: no date of birth or other personal information is collected or stored, and the answer is remembered for that browser visit only.</p>
          <label className="check"><input type="checkbox" checked={s.ageGateEnabled} onChange={(e) => upd('ageGateEnabled', e.target.checked)} /><span><strong>Ask visitors to confirm they are of legal drinking age</strong><span className="hint" style={{ display: 'block' }}>Shows a full-screen “Yes, I am {s.minimumAge} or older / No, I am not” prompt before the site.</span></span></label>
          <div className="field" style={{ width: 240 }}>
            <label htmlFor="s-age">Minimum age (18–25)</label>
            <input id="s-age" type="number" min={18} max={25} className="input" value={s.minimumAge} onChange={(e) => upd('minimumAge', Number(e.target.value))} aria-invalid={!!errFor('minimumAge')} />
            {errFor('minimumAge') && <p className="err">{errFor('minimumAge')}</p>}
          </div>
        </section>

        <section className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }} aria-labelledby="soc-h">
          <h2 id="soc-h" className="serif" style={{ margin: 0, fontSize: 24 }}>Social links</h2>
          <p className="hint">Official profiles only. They appear in the footer.</p>
          {s.socialLinks.length === 0 && <p className="hint">No social links yet.</p>}
          {s.socialLinks.map((l, i) => (
            <div key={i} style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
              <div className="field" style={{ flex: '0 1 180px' }}><label htmlFor={`sl-${i}`}>Label</label><input id={`sl-${i}`} className="input" value={l.label} onChange={(e) => updLink(i, { label: e.target.value })} /></div>
              <div className="field" style={{ flex: '1 1 280px' }}><label htmlFor={`su-${i}`}>Profile URL</label><input id={`su-${i}`} className="input" placeholder="https://" value={l.url} onChange={(e) => updLink(i, { url: e.target.value })} aria-invalid={!!errFor(`socialLinks.${i}`)} /></div>
              <button type="button" className="adm-btn danger ghost sm" onClick={() => upd('socialLinks', s.socialLinks.filter((_, j) => j !== i))}>Remove</button>
            </div>
          ))}
          {errFor('socialLinks') && <p className="err">{errFor('socialLinks')}</p>}
          <div><button type="button" className="adm-btn ghost sm" onClick={() => upd('socialLinks', [...s.socialLinks, { label: '', url: '' }])} disabled={s.socialLinks.length >= 8}>+ Add link</button></div>
        </section>

        <div><button type="submit" className="adm-btn" disabled={saving} aria-busy={saving}>{saving ? 'Saving…' : 'Save settings'}</button></div>
      </form>

      <form onSubmit={changePassword} noValidate className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 520 }}>
        <h2 className="serif" style={{ margin: 0, fontSize: 24 }}>Change password</h2>
        {([['currentPassword', 'Current password', 'current-password'], ['newPassword', 'New password (10+ characters)', 'new-password'], ['confirm', 'Confirm new password', 'new-password']] as const).map(([k, label, ac]) => (
          <div key={k} className="field">
            <label htmlFor={`pw-${k}`}>{label}</label>
            <input id={`pw-${k}`} type="password" autoComplete={ac} className="input" value={pw[k]} onChange={(e) => setPw((p) => ({ ...p, [k]: e.target.value }))} aria-invalid={!!pwErrors[k]} />
            {pwErrors[k] && <p className="err">{pwErrors[k]}</p>}
          </div>
        ))}
        <div><button type="submit" className="adm-btn" disabled={pwBusy}>{pwBusy ? 'Updating…' : 'Change password'}</button></div>
      </form>
      {toast.node}
    </>
  );
}
