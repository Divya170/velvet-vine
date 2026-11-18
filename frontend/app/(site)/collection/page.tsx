import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { ClientNote } from '@/components/site/ClientNote';
import { Em } from '@/components/site/Em';
import { Vine } from '@/components/site/Icons';
import { Photo } from '@/components/site/Photo';
import { WineSpotlight } from '@/components/site/WineSpotlight';
import { copy, getPageCopy, getSelections, getSettings, styleOf } from '@/lib/api';
import type { Product, Selection } from '@/lib/types';

export const metadata: Metadata = { title: 'Our Collection', description: 'Curated selections of red, white, rosé and sparkling wines at Velvet Vine, each with its own mood and occasion.' };

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

/** Numbered list of the selection's wines; each row opens an inquiry pre-filled with that wine. */
function Refs({ wines, light }: { wines: Product[]; light?: boolean }) {
  return (
    <ul className={`refs${light ? ' refs-light' : ''}`} aria-label="Selected wines">
      {wines.map((w, i) => (
        <li key={w.id}>
          <Link href={`/contact?wine=${w.id}&type=availability`} aria-label={`Ask about ${w.name}`}>
            <span className="ref-n">{String(i + 1).padStart(2, '0')}</span>
            <span className="ref-name">{w.name}</span>
            {w.isSample ? <span className="sample">Sample</span> : <span />}
            <span className="arr" aria-hidden="true">→</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Cta({ s, light }: { s: Selection; light?: boolean }) {
  return <Link className={`btn${light ? ' btn-light' : ''}`} href={`/wines?category=${s.slug}`}>Explore {s.name} <span className="arr" aria-hidden="true">→</span></Link>;
}

/** Accent photos come from the selection's own wines (their bottle photos, or labelled placeholders). */
function Accent({ w, fallbackLabel, tint, style }: { w?: Product; fallbackLabel: string; tint: string; style?: React.CSSProperties }) {
  return <Photo src={w?.imageUrl} alt={w ? w.imageAlt || w.name : ''} label={w?.imageUrl ? w.name : fallbackLabel} tint={w?.tint ?? tint} shortTag style={{ position: 'absolute', inset: 0, ...style }} />;
}

function Head({ s, i, light, center }: { s: Selection; i: number; light?: boolean; center?: boolean }) {
  const title = s.selectionTitle || `${s.name} *Selection.*`;
  return (
    <>
      <p className="label">Selection {ROMAN[i] ?? i + 1}</p>
      {center ? (
        <h2 id={`${s.slug}-h`} className="disp" style={{ marginTop: 18, fontSize: 'clamp(48px, 6.4vw, 104px)' }}><Em text={title} /></h2>
      ) : (
        <h2 id={`${s.slug}-h`} className="h2" style={light ? { color: '#F5F0E7' } : undefined}><Em text={title} onDark={light} /></h2>
      )}
      {s.selectionBody && <p className="lead" style={center ? { margin: '22px auto 0', maxWidth: 560 } : { marginTop: 18 }}>{s.selectionBody}</p>}
    </>
  );
}

/** Four editorial layouts from the design, cycled for any number of selections. */
function SelectionSection({ s, i }: { s: Selection; i: number }) {
  const id = `coll-${s.slug}`;
  const main = <Photo src={s.imageUrl} alt={s.imageAlt || s.name} label={`${s.name} — selection photograph`} tint={s.tint} zoom style={{ position: 'absolute', inset: 0 }} />;
  const [a, b] = [s.wines[0], s.wines[1]];
  const style = styleOf(s);

  switch (i % 4) {
    case 1:
      return (
        <section id={id} aria-labelledby={`${s.slug}-h`} className="ivory" style={{ padding: 'clamp(96px, 11vw, 168px) 0', borderTop: '1px solid #E5DACA', borderBottom: '1px solid #E5DACA', scrollMarginTop: 80 }}>
          <div className="wrap g12" style={{ alignItems: 'end' }}>
            <div className="sel-white-copy" style={{ gridColumn: 'span 5', order: 1 }}>
              <Head s={s} i={i} />
              <Refs wines={s.wines} />
              <div style={{ marginTop: 28 }}><Cta s={s} /></div>
            </div>
            <div style={{ gridColumn: '7 / span 6', order: 2, display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16, alignItems: 'end' }}>
              <div className="zoom-host" style={{ position: 'relative', aspectRatio: '3 / 4' }}>{main}</div>
              <div style={{ position: 'relative', aspectRatio: '2 / 3.4' }}><Accent w={a} fallbackLabel={`${style} glass, close up`} tint="gold" /></div>
            </div>
          </div>
        </section>
      );
    case 2:
      return (
        <section id={id} aria-labelledby={`${s.slug}-h`} className="section" style={{ textAlign: 'center', scrollMarginTop: 80 }}>
          <div className="wrap">
            <Head s={s} i={i} center />
            <div className="rose-band">
              <div style={{ position: 'relative', aspectRatio: '3 / 4' }}><Accent w={a} fallbackLabel={`${style} bottle on linen`} tint={s.tint} /></div>
              <div className="frame zoom-host" style={{ position: 'relative', aspectRatio: '4 / 3' }}>{main}</div>
              <div style={{ position: 'relative', aspectRatio: '3 / 4' }}><Accent w={b} fallbackLabel="Two glasses, late afternoon" tint="cream" /></div>
            </div>
            <div style={{ maxWidth: 560, margin: '36px auto 0', textAlign: 'left' }}><Refs wines={s.wines} /></div>
            <div style={{ marginTop: 28 }}><Cta s={s} /></div>
          </div>
        </section>
      );
    case 3:
      return (
        <section id={id} aria-labelledby={`${s.slug}-h`} className="on-wine" style={{ padding: 'clamp(96px, 11vw, 168px) 0', position: 'relative', overflow: 'hidden', scrollMarginTop: 80 }}>
          <Vine w={420} color="#D9C08F" style={{ right: -60, top: -40, opacity: 0.2 }} />
          <div className="wrap g12" style={{ position: 'relative', alignItems: 'center' }}>
            <div style={{ gridColumn: 'span 5' }}>
              <Head s={s} i={i} light />
              <Refs wines={s.wines} light />
              <div style={{ marginTop: 28 }}><Cta s={s} light /></div>
            </div>
            <div style={{ gridColumn: '7 / span 6', position: 'relative', padding: '0 0 clamp(40px, 5vw, 72px) clamp(40px, 5vw, 72px)' }}>
              <div className="zoom-host" style={{ position: 'relative', aspectRatio: '6 / 5' }}>{main}</div>
              <div style={{ position: 'absolute', left: 0, bottom: 0, width: '38%', aspectRatio: '3 / 4', border: '8px solid #541C2B' }}><Accent w={a} fallbackLabel={`${style}, close up`} tint="dark" /></div>
            </div>
          </div>
        </section>
      );
    default:
      return (
        <section id={id} aria-labelledby={`${s.slug}-h`} className="section" style={{ scrollMarginTop: 80 }}>
          <div className="wrap g12" style={{ alignItems: 'center' }}>
            <div className="frame zoom-host" style={{ gridColumn: 'span 7', position: 'relative', aspectRatio: '7 / 6' }}>{main}</div>
            <div style={{ gridColumn: '9 / span 4' }}>
              <Head s={s} i={i} />
              <Refs wines={s.wines} />
              <div style={{ marginTop: 28 }}><Cta s={s} /></div>
            </div>
          </div>
        </section>
      );
  }
}

export default async function OurCollectionPage() {
  const [pc, selections, settings] = await Promise.all([getPageCopy(), getSelections(), getSettings()]);
  const hero = copy(pc, 'selections_hero');
  const details = copy(pc, 'selections_details');
  const cta = copy(pc, 'selections_cta');
  const allWines = selections.flatMap((s) => s.wines);
  const first = selections[0];

  return (
    <main id="main">
      <section aria-labelledby="page-h" className="sel-hero">
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
          <Photo src={hero.imageUrl} alt="" tint="dark" kenBurns noTag priority style={{ position: 'absolute', inset: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(33,10,17,.25) 0%, rgba(33,10,17,.35) 45%, rgba(33,10,17,.88) 100%)' }} />
        </div>
        {!hero.imageUrl && <p className="ph-tag" style={{ top: 22, bottom: 'auto', left: 'auto', right: 'clamp(20px,5vw,76px)' }}>Photo placeholder · {hero.alt}</p>}
        <div className="wrap" style={{ position: 'relative', paddingTop: 48, paddingBottom: 'clamp(64px, 8vw, 112px)' }}>
          <Breadcrumbs current="Our Collection" light />
          <div className="g12" style={{ marginTop: 'clamp(48px, 9vw, 140px)', alignItems: 'end' }}>
            <h1 id="page-h" className="disp reveal" style={{ gridColumn: 'span 7', fontSize: 'clamp(58px, 8.6vw, 144px)', color: '#F5F0E7' }}><Em text={hero.title} onDark /></h1>
            <div className="reveal-2" style={{ gridColumn: '9 / span 4' }}>
              <span className="goldrule" />
              {hero.body && <p style={{ marginTop: 22, fontSize: 17, lineHeight: 1.8, color: '#E7DCD2' }}>{hero.body}</p>}
              {first && <a className="tlink" href={`#coll-${first.slug}`} style={{ marginTop: 14 }}>Begin with {styleOf(first).toLowerCase()}s <span className="arr" aria-hidden="true">↓</span></a>}
            </div>
          </div>
        </div>
      </section>

      {selections.length > 0 && (
        <nav aria-label="Selections on this page" className="sel-index">
          <div className="wrap">
            <ol>
              {selections.map((s, i) => <li key={s.id}><a href={`#coll-${s.slug}`}><span>{ROMAN[i] ?? i + 1}</span>{(s.selectionTitle || s.name).replace(/\*/g, '').replace(/\.$/, '')}</a></li>)}
              <li><a href="#spot-h"><span>{ROMAN[selections.length] ?? selections.length + 1}</span>Wine Details</a></li>
            </ol>
          </div>
        </nav>
      )}

      {allWines.some((w) => w.isSample) && <div className="wrap" style={{ marginTop: 'clamp(40px, 5vw, 64px)' }}><ClientNote note={hero.clientNote} /></div>}

      {selections.length === 0 ? (
        <section className="section">
          <div className="wrap">
            <div className="empty-card">
              <p className="disp" style={{ fontSize: 36 }}>New selections are being prepared</p>
              <p className="hint" style={{ marginTop: 10 }}>Browse the full wine collection, or ask the boutique what’s on the shelves right now.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 22 }}>
                <Link className="btn btn-ghost" href="/wines">Browse the Wines</Link>
                <Link className="btn" href="/contact">Contact the Boutique</Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        selections.map((s, i) => <SelectionSection key={s.id} s={s} i={i} />)
      )}

      {allWines.length > 0 && (
        <section aria-labelledby="spot-h" className="section" style={{ scrollMarginTop: 80 }}>
          <div className="wrap">
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24 }}>
              <div>{details.eyebrow && <p className="eyebrow">{details.eyebrow}</p>}<h2 id="spot-h" className="h2"><Em text={details.title} /></h2></div>
              {details.body && <p className="hint" style={{ maxWidth: 380 }}>{details.body}</p>}
            </div>
            <WineSpotlight wines={allWines} categories={selections} />
          </div>
        </section>
      )}

      <section aria-labelledby="cta-h" className="sand" style={{ padding: 'clamp(96px, 11vw, 160px) 0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <Vine w={300} style={{ left: '6%', bottom: -40, opacity: 0.4 }} />
        <div className="wrap" style={{ position: 'relative' }}>
          {cta.eyebrow && <p className="eyebrow" style={{ justifyContent: 'center' }}>{cta.eyebrow}</p>}
          <h2 id="cta-h" className="disp" style={{ margin: '22px auto 0', fontSize: 'clamp(46px, 6vw, 96px)', maxWidth: '14ch' }}><Em text={cta.title} /></h2>
          {cta.body && <p className="lead" style={{ margin: '22px auto 0', maxWidth: 520 }}>{cta.body}</p>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 36 }}>
            <Link className="btn" href="/contact">Contact the Boutique <span className="arr" aria-hidden="true">→</span></Link>
            {settings.phoneHref && <a className="btn btn-ghost" href={settings.phoneHref}>Call {settings.phone}</a>}
          </div>
        </div>
      </section>
    </main>
  );
}
