import Link from 'next/link';
import { ClientNote } from '@/components/site/ClientNote';
import { Em } from '@/components/site/Em';
import { HOURS_NOTE } from '@/components/site/Footer';
import { HeroSlideshow } from '@/components/site/HeroSlideshow';
import { Icon, Vine } from '@/components/site/Icons';
import { MapPanel } from '@/components/site/MapPanel';
import { Photo } from '@/components/site/Photo';
import { WineMeta } from '@/components/site/WineBrowser';
import { copy, getCollection, getContent, getFeatured, getGalleryHome, getPageCopy, getSettings, styleOf } from '@/lib/api';
import type { Product, ProductCategory } from '@/lib/types';

/** The design's staggered category row: each tile drops a little further than the last (cycles for 5+ styles). */
const DROP = ['0px', 'clamp(0px, 6vw, 96px)', 'clamp(0px, 2.5vw, 40px)', 'clamp(0px, 8vw, 128px)'];

const ask = (p: Product) => `/contact?wine=${p.id}&type=availability`;

export default async function HomePage() {
  const [settings, pc, slides, collection, featured, highlights, gallery] = await Promise.all([
    getSettings(), getPageCopy(), getContent('hero_slide'), getCollection(), getFeatured(4), getContent('experience_item'), getGalleryHome(),
  ]);
  const hero = copy(pc, 'home_hero');
  const intro = copy(pc, 'home_intro');
  const cats = copy(pc, 'home_categories');
  const feat = copy(pc, 'home_featured');
  const exp = copy(pc, 'home_experience');
  const gal = copy(pc, 'home_gallery');
  const visit = copy(pc, 'home_visit');
  const catById = (id: number): ProductCategory | undefined => collection.allCategories.find((c) => c.id === id);
  const [lead, ...rest] = featured;

  return (
    <main id="main">
      <HeroSlideshow slides={slides} autoplay={settings.heroAutoplay} intervalSeconds={settings.heroIntervalSeconds} label={`Welcome to ${settings.businessName}`}>
        <div className="wrap hero-copy">
          {hero.eyebrow && <p className="eyebrow light reveal">{hero.eyebrow}</p>}
          <h1 className="disp reveal-2" style={{ marginTop: 26, fontSize: 'clamp(54px, 8vw, 132px)', color: '#F5F0E7', maxWidth: '11ch' }}><Em text={hero.title} onDark /></h1>
          {hero.body && <p className="reveal-3" style={{ maxWidth: 470, marginTop: 28, fontSize: 'clamp(16px, 1.25vw, 18.5px)', lineHeight: 1.8, color: '#E7DCD2' }}>{hero.body}</p>}
          <div className="reveal-3" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 38 }}>
            <Link className="btn btn-light" href="/collection">{hero.fields.cta || 'Explore Our Collection'} <span className="arr" aria-hidden="true">→</span></Link>
            <a className="btn btn-ghost-light" href="#visit-h">{hero.fields.cta2 || 'Visit Our Boutique'}</a>
          </div>
        </div>
      </HeroSlideshow>

      {/* Introduction */}
      <section aria-labelledby="intro-h" className="section">
        <div className="wrap g12" style={{ alignItems: 'center' }}>
          <div style={{ gridColumn: 'span 6' }}>
            {intro.eyebrow && <p className="eyebrow">{intro.eyebrow}</p>}
            <h2 id="intro-h" className="disp" style={{ marginTop: 22, fontSize: 'clamp(46px, 5.6vw, 92px)' }}><Em text={intro.title} /></h2>
            <span className="goldrule" style={{ marginTop: 36 }} />
            {intro.body && <p className="lead prose-copy" style={{ marginTop: 30, maxWidth: 520 }}>{intro.body}</p>}
            {intro.fields.body2 && <p className="lead prose-copy" style={{ marginTop: 16, maxWidth: 520 }}>{intro.fields.body2}</p>}
            <ClientNote note={intro.clientNote} style={{ marginTop: 26, maxWidth: 520 }} />
            <Link className="tlink" href="/about" style={{ marginTop: 28 }}>{intro.fields.cta || 'Discover Our Story'} <span className="arr" aria-hidden="true">→</span></Link>
          </div>
          <div style={{ gridColumn: '8 / span 5', position: 'relative', paddingBottom: 'clamp(40px, 6vw, 96px)' }}>
            <div className="frame"><Photo src={intro.imageUrl} alt={intro.alt} tint="dark" kenBurns style={{ aspectRatio: '4 / 5.2' }} /></div>
            <div className="intro-inset"><Photo src={intro.fields.image2Url} alt={intro.fields.alt2 ?? ''} tint="rose" shortTag style={{ aspectRatio: '1 / 1' }} /></div>
            {intro.fields.side && <p className="serif intro-vert" aria-hidden="true">{intro.fields.side}</p>}
          </div>
        </div>
      </section>

      {/* Wine categories: only styles the boutique actually has */}
      {collection.categories.length > 0 && (
        <section aria-labelledby="cats-h" className="ivory" style={{ padding: 'clamp(96px, 11vw, 168px) 0', borderTop: '1px solid #E5DACA', borderBottom: '1px solid #E5DACA' }}>
          <div className="wrap">
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 28 }}>
              <div>{cats.eyebrow && <p className="eyebrow">{cats.eyebrow}</p>}<h2 id="cats-h" className="h2"><Em text={cats.title} /></h2></div>
              {cats.clientNote && <p className="hint" style={{ maxWidth: 360 }}>{cats.clientNote}</p>}
            </div>
            <ul className="cat-row">
              {collection.categories.map((c, i) => (
                <li key={c.id} className="cat-card" style={{ marginTop: DROP[i % DROP.length] }}>
                  <Link className="cat-link zoom-host" href={`/wines?category=${c.slug}`}>
                    <div className="frame" style={{ position: 'relative', aspectRatio: '3 / 4.4' }}>
                      <Photo src={c.imageUrl} alt={c.imageAlt || c.name} label={`${c.name} — category photograph`} tint={c.tint} zoom style={{ position: 'absolute', inset: 0 }} />
                    </div>
                    <p className="label" style={{ marginTop: 22 }}>No. {String(i + 1).padStart(2, '0')} · {styleOf(c)}</p>
                    <h3 className="h3" style={{ marginTop: 10, fontSize: 'clamp(26px, 2.2vw, 32px)' }}>{c.name}</h3>
                    {c.blurb && <p className="hint" style={{ marginTop: 8 }}>{c.blurb}</p>}
                    <span className="tlink" style={{ marginTop: 6 }}>Explore <span className="arr" aria-hidden="true">→</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Featured: one prominent bottle + up to three supporting */}
      <section aria-labelledby="fc-h" className="section">
        <div className="wrap">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, marginBottom: 'clamp(44px, 5vw, 72px)' }}>
            <div>{feat.eyebrow && <p className="eyebrow">{feat.eyebrow}</p>}<h2 id="fc-h" className="h2"><Em text={feat.title} /></h2></div>
            <Link className="btn btn-ghost" href="/wines">{feat.fields.cta || 'Explore Wine Collection'} <span className="arr" aria-hidden="true">→</span></Link>
          </div>
          {lead ? (
            <div className="g12" style={{ alignItems: 'start' }}>
              <article aria-labelledby="fc-lead" style={{ gridColumn: rest.length ? 'span 7' : '1 / -1' }}>
                <div className="zoom-host frame bottle-panel" style={{ aspectRatio: '5 / 5.6' }}>
                  <Photo src={lead.imageUrl} alt={lead.imageAlt || lead.name} label={`Featured ${styleOf(catById(lead.categoryId)).toLowerCase()} wine bottle`} tint={lead.tint ?? catById(lead.categoryId)?.tint} zoom style={{ position: 'absolute', inset: 0 }} />
                  {lead.isSample && <span className="sample" style={{ position: 'absolute', top: 28, left: 28, zIndex: 4 }}>Sample</span>}
                </div>
                <div className="fc-lead-copy">
                  <p className="label">Featured · {styleOf(catById(lead.categoryId))}</p>
                  <h3 id="fc-lead" className="disp" style={{ marginTop: 14, fontSize: 'clamp(34px, 3.4vw, 50px)' }}>{lead.name}</h3>
                  {lead.description && <p className="hint" style={{ marginTop: 12, maxWidth: 460 }}>{lead.description}</p>}
                  <WineMeta wine={lead} />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 22 }}>
                    <Link className="btn" href={ask(lead)} aria-label={`Ask about ${lead.name}`}>Ask About This Wine <span className="arr" aria-hidden="true">→</span></Link>
                  </div>
                </div>
              </article>
              {rest.length > 0 && (
                <div style={{ gridColumn: '9 / span 4', display: 'flex', flexDirection: 'column', gap: 30, paddingTop: 'clamp(0px, 4vw, 64px)' }}>
                  {rest.map((p) => {
                    const c = catById(p.categoryId);
                    return (
                      <article key={p.id} className="fc-row" aria-labelledby={`fc-${p.id}`}>
                        <div className="zoom-host bottle-panel" style={{ aspectRatio: '4 / 5' }}>
                          <Photo src={p.imageUrl} alt={p.imageAlt || p.name} label={`${styleOf(c)} wine bottle`} tint={p.tint ?? c?.tint} zoom style={{ position: 'absolute', inset: 0 }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
                          <p className="label" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>{styleOf(c)} {p.isSample && <span className="sample">Sample</span>}</p>
                          <h3 id={`fc-${p.id}`} className="h3">{p.name}</h3>
                          <WineMeta wine={p} />
                          <Link className="tlink" href={ask(p)} aria-label={`Ask about ${p.name}`}>Ask About This Wine <span className="arr" aria-hidden="true">→</span></Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="empty-card">
              <p className="disp" style={{ fontSize: 34 }}>Featured wines are on their way</p>
              <p className="hint" style={{ marginTop: 10 }}>Ask the boutique what’s currently on the shelves.</p>
              <Link className="btn" href="/contact" style={{ marginTop: 22 }}>Contact the Boutique</Link>
            </div>
          )}
          {featured.some((p) => p.isSample) && <ClientNote note={feat.clientNote} style={{ marginTop: 52 }} />}
        </div>
      </section>

      {/* Experience */}
      <section aria-labelledby="exp-h" className="on-dark" style={{ padding: 'clamp(96px, 11vw, 168px) 0', position: 'relative', overflow: 'hidden' }}>
        <Vine w={380} color="#D9C08F" style={{ left: -60, bottom: -60, opacity: 0.18 }} />
        <div className="wrap exp-grid" style={{ position: 'relative' }}>
          <div className="exp-photos" aria-hidden="true">
            <div className="exp-p1 frame"><Photo src={exp.imageUrl} alt="" label={exp.alt} tint="char" kenBurns style={{ position: 'absolute', inset: 0 }} /></div>
            <div className="exp-p2"><Photo src={exp.fields.image2Url} alt="" label={exp.fields.alt2 ?? ''} shortTag style={{ position: 'absolute', inset: 0 }} /></div>
            <div className="exp-p3"><Photo src={exp.fields.image3Url} alt="" label={exp.fields.alt3 ?? ''} tint="gold" shortTag style={{ position: 'absolute', inset: 0 }} /></div>
          </div>
          <div className="exp-copy">
            {exp.eyebrow && <p className="eyebrow">{exp.eyebrow}</p>}
            <h2 id="exp-h" className="disp" style={{ marginTop: 22, fontSize: 'clamp(42px, 5vw, 80px)', color: '#F5F0E7' }}><Em text={exp.title} onDark /></h2>
            {exp.body && <p className="lead" style={{ marginTop: 24, maxWidth: 480 }}>{exp.body}</p>}
            {highlights.length > 0 && (
              <ul className="hl-list">
                {highlights.map((h, i) => (
                  <li key={h.id}>
                    <span style={{ color: '#D9C08F' }}><Icon name={h.fields.icon || 'glass'} size={26} /></span>
                    <p className="label" style={{ marginTop: 16, color: '#D9C08F' }}>{String(i + 1).padStart(2, '0')}</p>
                    <h3 className="h3" style={{ marginTop: 8, fontSize: 22, color: '#F5F0E7' }}>{h.title}</h3>
                    {h.body && <p className="hint" style={{ marginTop: 8 }}>{h.body}</p>}
                  </li>
                ))}
              </ul>
            )}
            <a className="btn btn-light" href="#visit-h" style={{ marginTop: 40 }}>{exp.fields.cta || 'Plan Your Visit'} <span className="arr" aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>

      {/* Gallery mosaic */}
      {gallery.length > 0 && (
        <section aria-labelledby="gal-h" className="section">
          <div className="wrap">
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, marginBottom: 'clamp(36px, 4vw, 56px)' }}>
              <div>{gal.eyebrow && <p className="eyebrow">{gal.eyebrow}</p>}<h2 id="gal-h" className="h2"><Em text={gal.title} /></h2></div>
              <Link className="tlink" href="/gallery">{gal.fields.cta || 'Explore the Gallery'} <span className="arr" aria-hidden="true">→</span></Link>
            </div>
            <div className="home-gal">
              {gallery.slice(0, 6).map((g, i) => (
                <Link key={g.id} className={`hg-g${i + 1} zoom-host`} href={`/gallery?category=${encodeURIComponent(g.category)}`} aria-label={`Open the gallery: ${g.title}`} style={{ position: 'relative', display: 'block' }}>
                  <Photo src={g.imageUrl} alt="" label={g.title} tint={g.tint} zoom shortTag style={{ position: 'absolute', inset: 0 }} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Visit */}
      <section aria-labelledby="visit-h" className="sand" style={{ padding: 'clamp(96px, 11vw, 160px) 0', scrollMarginTop: 70 }}>
        <div className="wrap g12" style={{ alignItems: 'center' }}>
          <div style={{ gridColumn: 'span 5' }}>
            {visit.eyebrow && <p className="eyebrow">{visit.eyebrow}</p>}
            <h2 id="visit-h" className="h2" style={{ fontSize: 'clamp(40px, 4.6vw, 70px)' }}><Em text={visit.title} /></h2>
            <dl className="visit-dl">
              <div><dt><Icon name="pin" size={16} /><span>Address</span></dt><dd><a href={settings.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{settings.addressLine1}<br />{settings.city}, {settings.region} {settings.postalCode}, {settings.country}<span className="sr"> (opens Google Maps in a new tab)</span></a></dd></div>
              {settings.phoneHref && <div><dt><Icon name="phone" size={16} /><span>Phone</span></dt><dd><a href={settings.phoneHref} style={{ textDecoration: 'none' }}>{settings.phone}</a></dd></div>}
              {settings.emailHref && <div><dt><Icon name="mail" size={16} /><span>Email</span></dt><dd><a href={settings.emailHref} style={{ textDecoration: 'none', wordBreak: 'break-all' }}>{settings.email}</a></dd></div>}
              <div><dt><Icon name="clock" size={16} /><span>Hours</span></dt>
                <dd style={{ fontFamily: 'var(--sans)', fontSize: 15, color: '#4A433E' }}>
                  {settings.hoursVerified ? (
                    <>
                      {settings.openStatus && <strong style={{ display: 'block', marginBottom: 6 }}>{settings.openStatus.label}</strong>}
                      {settings.hoursDisplay.map((h) => <span key={h.day} style={{ display: 'block' }}>{h.day}: {h.label}</span>)}
                    </>
                  ) : HOURS_NOTE}
                </dd>
              </div>
            </dl>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 34 }}>
              <a className="btn" href={settings.directionsUrl} target="_blank" rel="noopener noreferrer">Get Directions <span className="arr" aria-hidden="true">↗</span><span className="sr"> (opens Google Maps in a new tab)</span></a>
              {settings.phoneHref ? <a className="btn btn-ghost" href={settings.phoneHref}>Call the Store</a> : <Link className="btn btn-ghost" href="/contact">Contact the Boutique</Link>}
            </div>
          </div>
          <MapPanel settings={settings} style={{ gridColumn: '7 / span 6', aspectRatio: '7 / 5.2' }} />
        </div>
      </section>
    </main>
  );
}
