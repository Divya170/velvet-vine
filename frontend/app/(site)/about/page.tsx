import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { ClientNote } from '@/components/site/ClientNote';
import { Em } from '@/components/site/Em';
import { Icon, Vine } from '@/components/site/Icons';
import { Photo } from '@/components/site/Photo';
import { copy, getContent, getPageCopy, getSettings } from '@/lib/api';

export const metadata: Metadata = { title: 'About', description: 'The story behind Velvet Vine, a wine boutique on Cherry Lane in Ventura, California.' };

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

export default async function AboutPage() {
  const [pc, principles, points, settings] = await Promise.all([getPageCopy(), getContent('philosophy_item'), getContent('store_point'), getSettings()]);
  const hero = copy(pc, 'about_hero');
  const story = copy(pc, 'about_story');
  const phil = copy(pc, 'about_philosophy');
  const store = copy(pc, 'about_store');

  return (
    <main id="main">
      <section aria-labelledby="page-h" style={{ padding: 'clamp(40px, 5vw, 64px) 0 clamp(80px, 10vw, 140px)', position: 'relative', overflow: 'hidden' }}>
        <div className="wrap">
          <Breadcrumbs current="About" />
          <div className="g12" style={{ marginTop: 'clamp(32px, 5vw, 64px)', alignItems: 'end' }}>
            <div style={{ gridColumn: 'span 7', position: 'relative', zIndex: 2 }}>
              {hero.eyebrow && <p className="eyebrow reveal">{hero.eyebrow}</p>}
              <h1 id="page-h" className="disp reveal-2" style={{ marginTop: 24, fontSize: 'clamp(58px, 8.6vw, 148px)', lineHeight: 0.98 }}><Em text={hero.title} /></h1>
              {hero.body && <p className="lead reveal-3" style={{ marginTop: 24, maxWidth: 520 }}>{hero.body}</p>}
            </div>
            <div className="reveal-3" style={{ gridColumn: '9 / span 4', position: 'relative' }}>
              <div className="frame"><Photo src={hero.imageUrl} alt={hero.alt} tint="char" kenBurns priority style={{ aspectRatio: '3 / 4.2' }} /></div>
              <p className="hint" style={{ marginTop: 14, fontSize: 13, letterSpacing: '.04em' }}>{settings.addressLine1}, {settings.city}, California</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="story-h" className="ivory" style={{ padding: 'clamp(96px, 11vw, 168px) 0', borderTop: '1px solid #E5DACA', borderBottom: '1px solid #E5DACA' }}>
        <div className="wrap g12" style={{ alignItems: 'start' }}>
          <div style={{ gridColumn: 'span 4' }}>
            {story.eyebrow && <p className="eyebrow">{story.eyebrow}</p>}
            <h2 id="story-h" className="h2" style={{ fontSize: 'clamp(36px, 3.6vw, 56px)' }}><Em text={story.title} /></h2>
            <span className="goldrule" style={{ marginTop: 34 }} />
          </div>
          <div className="story-cols" style={{ gridColumn: '6 / span 7' }}>
            {story.body && <p className="lead drop prose-copy">{story.body}</p>}
            {story.fields.body2 && <p className="lead prose-copy">{story.fields.body2}</p>}
            {story.fields.extra && <p className="lead prose-copy">{story.fields.extra}</p>}
            {story.fields.quote && (
              <blockquote className="pull">
                <p className="serif">“{story.fields.quote}”</p>
                {story.fields.quoteNote && <p className="label" style={{ marginTop: 14 }}>{story.fields.quoteNote}</p>}
              </blockquote>
            )}
            <ClientNote note={story.clientNote} style={{ gridColumn: '1 / -1' }} />
          </div>
        </div>
      </section>

      {principles.length > 0 && (
        <section aria-labelledby="phil-h" className="on-dark" style={{ padding: 'clamp(96px, 11vw, 168px) 0', position: 'relative', overflow: 'hidden' }}>
          <Vine w={460} style={{ left: -100, top: -40, opacity: 0.18 }} />
          <div className="wrap" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 28 }}>
              <div>{phil.eyebrow && <p className="eyebrow">{phil.eyebrow}</p>}<h2 id="phil-h" className="h2" style={{ color: '#F5F0E7' }}><Em text={phil.title} onDark /></h2></div>
              <ClientNote note={phil.clientNote} tag="Client to confirm" style={{ maxWidth: 400 }} />
            </div>
            <ol className="phil-row">
              {principles.map((p, i) => (
                <li key={p.id} className="ph-item">
                  <p className="serif ph-num" aria-hidden="true">{p.fields.numeral || ROMAN[i] || i + 1}</p>
                  <span style={{ color: '#D9C08F', display: 'block', marginTop: 18 }}><Icon name={p.fields.icon || 'glass'} size={26} /></span>
                  <h3 className="h3" style={{ marginTop: 18, color: '#F5F0E7' }}>{p.title}</h3>
                  {p.body && <p className="hint" style={{ marginTop: 12, fontSize: 15 }}>{p.body}</p>}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section aria-labelledby="store-h" className="section">
        <div className="wrap store-grid">
          <div className="st-a frame zoom-host"><Photo src={store.imageUrl} alt={store.alt} tint="dark" zoom style={{ position: 'absolute', inset: 0 }} /></div>
          <div className="st-b"><Photo src={store.fields.image2Url} alt={store.fields.alt2 ?? ''} tint="gold" shortTag style={{ position: 'absolute', inset: 0 }} /></div>
          <div className="st-c"><Photo src={store.fields.image3Url} alt={store.fields.alt3 ?? ''} tint="cream" shortTag style={{ position: 'absolute', inset: 0 }} /></div>
          <div className="st-copy">
            {store.eyebrow && <p className="eyebrow">{store.eyebrow}</p>}
            <h2 id="store-h" className="h2"><Em text={store.title} /></h2>
            {store.body && <p className="lead" style={{ marginTop: 22 }}>{store.body}</p>}
            {points.length > 0 && (
              <ul className="st-points">
                {points.map((p) => <li key={p.id}><Icon name={p.fields.icon || 'glass'} size={20} /><span>{p.title}</span></li>)}
              </ul>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 34 }}>
              <Link className="btn" href="/contact#visit-h">{store.fields.cta || 'Visit Velvet Vine'} <span className="arr" aria-hidden="true">→</span></Link>
              <Link className="btn btn-ghost" href="/wines">Browse the Wines</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
