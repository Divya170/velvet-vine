import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { ClientNote } from '@/components/site/ClientNote';
import { Em } from '@/components/site/Em';
import { HOURS_NOTE } from '@/components/site/Footer';
import { GalleryBrowser } from '@/components/site/GalleryBrowser';
import { GalleryStrip } from '@/components/site/GalleryStrip';
import { Vine } from '@/components/site/Icons';
import { Photo } from '@/components/site/Photo';
import { copy, getGallery, getGalleryStrip, getPageCopy, getSettings } from '@/lib/api';

export const metadata: Metadata = { title: 'Gallery', description: 'A glimpse inside Velvet Vine: the boutique, its shelves, bottle displays and quiet details.' };

export default async function GalleryPage({ searchParams }: { searchParams: { category?: string } }) {
  const [pc, gallery, strip, settings] = await Promise.all([getPageCopy(), getGallery(), getGalleryStrip(), getSettings()]);
  const hero = copy(pc, 'gallery_hero');
  const stripCopy = copy(pc, 'gallery_strip');
  const grid = copy(pc, 'gallery_grid');
  const cta = copy(pc, 'gallery_cta');
  const placeholders = gallery.items.filter((i) => !i.imageUrl).length;

  return (
    <main id="main">
      <section aria-labelledby="page-h" style={{ position: 'relative', minHeight: 'clamp(540px, 80vh, 860px)', display: 'flex', alignItems: 'flex-end', overflow: 'hidden', background: '#32131D', color: '#F5F0E7' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
          <Photo src={hero.imageUrl} alt="" tint="char" kenBurns noTag priority style={{ position: 'absolute', inset: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(33,10,17,.2) 0%, rgba(33,10,17,.3) 50%, rgba(33,10,17,.86) 100%)' }} />
        </div>
        {!hero.imageUrl && <p className="ph-tag" style={{ top: 22, bottom: 'auto', left: 'auto', right: 'clamp(20px,5vw,76px)' }}>Photo placeholder · {hero.alt}</p>}
        <div className="wrap" style={{ position: 'relative', paddingTop: 48, paddingBottom: 'clamp(60px, 7vw, 100px)' }}>
          <Breadcrumbs current="Gallery" light />
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 28, marginTop: 'clamp(40px, 7vw, 100px)' }}>
            <h1 id="page-h" className="disp reveal" style={{ fontSize: 'clamp(56px, 8.4vw, 140px)', maxWidth: '11ch', color: '#F5F0E7' }}><Em text={hero.title} onDark /></h1>
            <a className="tlink reveal-2" href="#gal-h">Browse the gallery <span className="arr" aria-hidden="true">↓</span></a>
          </div>
        </div>
      </section>

      {/* The page's only auto-moving element; hidden until at least three photos are picked for it. */}
      <GalleryStrip items={strip} seconds={settings.galleryStripSeconds} eyebrow={stripCopy.eyebrow} title={stripCopy.title} />

      <section aria-labelledby="gal-h" style={{ padding: 'clamp(80px, 10vw, 140px) 0 clamp(96px, 11vw, 160px)' }}>
        <div className="wrap">
          <div className="g12" style={{ alignItems: 'end' }}>
            <div style={{ gridColumn: 'span 7' }}>{grid.eyebrow && <p className="eyebrow">{grid.eyebrow}</p>}<h2 id="gal-h" className="h2"><Em text={grid.title} /></h2></div>
            {placeholders > 0 && <div style={{ gridColumn: '8 / span 5' }}><ClientNote note={hero.clientNote} /></div>}
          </div>
          <GalleryBrowser items={gallery.items} categories={gallery.categories} initialCategory={searchParams.category} />
        </div>
      </section>

      <section aria-labelledby="cta-h" className="on-wine" style={{ padding: 'clamp(88px, 10vw, 150px) 0', position: 'relative', overflow: 'hidden' }}>
        <Vine w={380} color="#D9C08F" style={{ left: -50, bottom: -70, opacity: 0.22 }} />
        <div className="wrap split" style={{ position: 'relative' }}>
          <div>{cta.eyebrow && <p className="eyebrow">{cta.eyebrow}</p>}<h2 id="cta-h" className="h2" style={{ color: '#F5F0E7', fontSize: 'clamp(42px, 5vw, 78px)' }}><Em text={cta.title} onDark /></h2></div>
          <div>
            <p className="lead">{settings.fullAddress}</p>
            <p className="hint" style={{ marginTop: 8 }}>{settings.hoursVerified ? settings.openStatus?.label ?? 'See the Contact page for opening hours.' : HOURS_NOTE}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
              <a className="btn btn-light" href={settings.directionsUrl} target="_blank" rel="noopener noreferrer">Get Directions <span className="arr" aria-hidden="true">↗</span><span className="sr"> (opens Google Maps in a new tab)</span></a>
              <Link className="btn btn-ghost-light" href="/contact">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
