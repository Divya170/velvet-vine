import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { Em } from '@/components/site/Em';
import { Vine } from '@/components/site/Icons';
import { Photo } from '@/components/site/Photo';
import { WineBrowser } from '@/components/site/WineBrowser';
import { copy, getCollection, getPageCopy, getSettings } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Wine Collection',
  description: 'Browse Velvet Vine’s wines by style and ask the boutique about any bottle. Wines are available in store only.',
};

export default async function WinesPage({ searchParams }: { searchParams: { category?: string; q?: string } }) {
  const [pc, data, settings] = await Promise.all([getPageCopy(), getCollection(), getSettings()]);
  const hero = copy(pc, 'wines_hero');
  const talk = copy(pc, 'wines_talk');
  return (
    <main id="main">
      <section aria-labelledby="page-h" style={{ padding: 'clamp(40px, 5vw, 64px) 0 clamp(48px, 6vw, 80px)', position: 'relative', overflow: 'hidden' }}>
        <Vine w={360} style={{ left: -90, bottom: -80, opacity: 0.35 }} />
        <div className="wrap" style={{ position: 'relative' }}>
          <Breadcrumbs current="Wine Collection" />
          <div className="g12" style={{ marginTop: 'clamp(28px, 4vw, 52px)', alignItems: 'end' }}>
            <div style={{ gridColumn: 'span 6', paddingBottom: 'clamp(0px, 3vw, 40px)' }}>
              {hero.eyebrow && <p className="eyebrow reveal">{hero.eyebrow}</p>}
              <h1 id="page-h" className="disp reveal-2" style={{ marginTop: 22, fontSize: 'clamp(52px, 7vw, 112px)' }}><Em text={hero.title} /></h1>
              {hero.body && <p className="lead reveal-3" style={{ marginTop: 24, maxWidth: 470 }}>{hero.body}</p>}
            </div>
            <div className="reveal-3" style={{ gridColumn: '8 / span 5' }}>
              <div className="frame"><Photo src={hero.imageUrl} alt={hero.alt} tint="dark" kenBurns priority style={{ aspectRatio: '5 / 4' }} /></div>
            </div>
          </div>
        </div>
      </section>

      <WineBrowser data={data} settings={settings} initialCategory={searchParams.category} initialQuery={searchParams.q} note={hero.clientNote} />

      <section aria-labelledby="talk-h" className="on-wine" style={{ padding: 'clamp(72px, 9vw, 120px) 0', position: 'relative', overflow: 'hidden' }}>
        <Vine w={320} color="#D9C08F" style={{ right: '3%', top: -40, opacity: 0.25 }} />
        <div className="wrap" style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 32 }}>
          <div>
            {talk.eyebrow && <p className="eyebrow">{talk.eyebrow}</p>}
            <h2 id="talk-h" className="h2" style={{ color: '#F5F0E7' }}><Em text={talk.title} onDark /></h2>
            {talk.body && <p className="lead" style={{ marginTop: 16, maxWidth: 480 }}>{talk.body}</p>}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {settings.phoneHref && <a className="btn btn-light" href={settings.phoneHref}>Call {settings.phone}</a>}
            {settings.emailHref && <a className="btn btn-ghost-light" href={settings.emailHref}>Email the Boutique</a>}
            {!settings.phoneHref && !settings.emailHref && <a className="btn btn-light" href="/contact">Contact the Boutique</a>}
          </div>
        </div>
      </section>
    </main>
  );
}
