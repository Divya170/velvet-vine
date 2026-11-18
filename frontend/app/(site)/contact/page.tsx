import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { Em } from '@/components/site/Em';
import { HoursTable } from '@/components/site/HoursTable';
import { Icon, Logo, Vine } from '@/components/site/Icons';
import { InquiryForm, type WineOption } from '@/components/site/InquiryForm';
import { MapPanel } from '@/components/site/MapPanel';
import { copy, getCollection, getPageCopy, getSettings, styleOf } from '@/lib/api';
import type { InquirySubject } from '@/lib/types';
import { SUBJECTS } from '@/lib/validation';

export const metadata: Metadata = { title: 'Contact', description: 'Call, email or visit Velvet Vine at 6381 Cherry Lane, Ventura, CA, or send an inquiry about a wine or your visit.' };

export default async function ContactPage({ searchParams }: { searchParams: { wine?: string; type?: string } }) {
  const [pc, settings, collection] = await Promise.all([getPageCopy(), getSettings(), getCollection()]);
  const hero = copy(pc, 'contact_hero');
  const form = copy(pc, 'contact_form');
  const loc = copy(pc, 'contact_location');
  const wines: WineOption[] = collection.items.map((p) => ({ id: p.id, name: p.name, style: styleOf(collection.allCategories.find((c) => c.id === p.categoryId)) }));
  // ?wine=<id> (from a wine card, Our Collection or the homepage) preselects that wine; ?type= preselects the inquiry type.
  const picked = wines.find((w) => String(w.id) === searchParams?.wine);
  const type = SUBJECTS.find((s) => s.value === searchParams?.type)?.value as InquirySubject | undefined;
  const subj = type ?? (picked ? 'availability' : undefined);
  const [line1, line2] = [settings.addressLine1, `${settings.city}, ${settings.region} ${settings.postalCode}, ${settings.country}`];

  return (
    <main id="main">
      <section aria-labelledby="page-h" style={{ padding: 'clamp(40px, 5vw, 64px) 0 clamp(64px, 8vw, 104px)', position: 'relative', overflow: 'hidden' }}>
        <Vine w={400} style={{ right: -60, top: 20, opacity: 0.4 }} />
        <div className="wrap" style={{ position: 'relative' }}>
          <Breadcrumbs current="Contact" />
          <div className="g12" style={{ marginTop: 'clamp(36px, 5vw, 72px)', alignItems: 'end' }}>
            <h1 id="page-h" className="disp reveal" style={{ gridColumn: 'span 8', fontSize: 'clamp(56px, 8.4vw, 140px)' }}><Em text={hero.title} /></h1>
            {hero.body && <p className="lead reveal-2" style={{ gridColumn: '9 / span 4' }}>{hero.body}</p>}
          </div>
        </div>
      </section>

      <section aria-label="Contact details and inquiry form" style={{ paddingBottom: 'clamp(96px, 11vw, 160px)' }}>
        <div className="wrap g12" style={{ alignItems: 'start' }}>
          <div className="ct-panel" style={{ gridColumn: 'span 5' }}>
            <div className="ct-name"><Logo color="#F5F0E7" sub="#D9C08F" size={0.86} name={settings.businessName.toUpperCase()} tagline={settings.tagline} /></div>
            <div className="ct-block">
              <p className="label"><Icon name="pin" size={18} /> Address</p>
              <address className="serif ct-val" style={{ fontStyle: 'normal' }}>{line1}<br />{line2}</address>
              <a className="tlink" href={settings.directionsUrl} target="_blank" rel="noopener noreferrer">Get Directions <span className="arr" aria-hidden="true">↗</span><span className="sr"> (opens Google Maps in a new tab)</span></a>
            </div>
            {settings.phoneHref && (
              <div className="ct-block">
                <p className="label"><Icon name="phone" size={18} /> Phone</p>
                <a className="serif ct-val" href={settings.phoneHref}>{settings.phone}</a>
                <a className="tlink" href={settings.phoneHref}>Call the Boutique <span className="arr" aria-hidden="true">→</span></a>
              </div>
            )}
            {settings.emailHref && (
              <div className="ct-block">
                <p className="label"><Icon name="mail" size={18} /> Email</p>
                <a className="serif ct-val" href={settings.emailHref} style={{ wordBreak: 'break-all' }}>{settings.email}</a>
                <a className="tlink" href={`${settings.emailHref}?subject=${encodeURIComponent(`Hello ${settings.businessName}`)}`}>Write to Us <span className="arr" aria-hidden="true">→</span></a>
              </div>
            )}
            <div className="ct-block">
              <p className="label"><Icon name="clock" size={18} /> Hours</p>
              <HoursTable settings={settings} />
            </div>
          </div>

          <div className="ct-form" style={{ gridColumn: '7 / span 6' }}>
            {form.eyebrow && <p className="eyebrow">{form.eyebrow}</p>}
            <h2 className="h2" style={{ fontSize: 'clamp(32px, 3.2vw, 48px)', marginBottom: 30 }}><Em text={form.title} /></h2>
            {picked && <p className="notice" style={{ marginBottom: 24 }}>You’re asking about <strong>{picked.name}</strong>. We’ve filled that in for you.</p>}
            <InquiryForm mode="contact" wines={wines} settings={settings} initialProduct={picked ? String(picked.id) : undefined} initialSubject={subj} />
          </div>
        </div>
      </section>

      <section id="visit" aria-labelledby="visit-h" className="sand" style={{ padding: 'clamp(88px, 10vw, 150px) 0', scrollMarginTop: 70 }}>
        <div className="wrap g12" style={{ alignItems: 'center' }}>
          <div style={{ gridColumn: 'span 4' }}>
            {loc.eyebrow && <p className="eyebrow">{loc.eyebrow}</p>}
            <h2 id="visit-h" className="h2" style={{ fontSize: 'clamp(38px, 4vw, 60px)' }}><Em text={loc.title} /></h2>
            <p className="lead" style={{ marginTop: 18 }}>{settings.fullAddress}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 30 }}>
              <a className="btn" href={settings.directionsUrl} target="_blank" rel="noopener noreferrer">Get Directions <span className="arr" aria-hidden="true">↗</span><span className="sr"> (opens Google Maps in a new tab)</span></a>
              <a className="btn btn-ghost" href={settings.mapsUrl} target="_blank" rel="noopener noreferrer">View Map<span className="sr"> (opens in a new tab)</span></a>
            </div>
            {!settings.mapEmbedUrl && <p className="hint" style={{ marginTop: 18, fontSize: 13 }}>Map shown is a preview. Add a Google Maps embed link in Settings to show a live map. No coordinates are invented.</p>}
          </div>
          <MapPanel settings={settings} style={{ gridColumn: '6 / span 7' }} />
        </div>
      </section>
    </main>
  );
}
