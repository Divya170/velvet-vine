'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef, useState } from 'react';
import { styleOf, tbs } from '@/lib/api';
import type { CollectionResponse, Product, SiteSettings } from '@/lib/types';
import { ClientNote } from './ClientNote';
import type { WineOption } from './InquiryForm';
import { Photo } from './Photo';
import { WineDialog } from './WineDialog';

/**
 * Wine Collection: style chips (mirrored to ?category= so links, the footer and refreshes keep it), a name/region/grape
 * search, the card grid, an honest empty state and the inquiry dialog. Only styles that actually have wines are offered.
 */
export function WineBrowser({ data, settings, initialCategory, initialQuery, note }: {
  data: CollectionResponse; settings: SiteSettings; initialCategory?: string; initialQuery?: string; note?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const cats = data.categories;
  const valid = (s?: string) => (s && cats.some((c) => c.slug === s) ? s : 'all');
  const [cat, setCat] = useState(valid(initialCategory));
  const [q, setQ] = useState(initialQuery ?? '');
  const [open, setOpen] = useState<Product | null>(null);
  const trigger = useRef<HTMLElement | null>(null);

  const catById = useCallback((id: number) => data.allCategories.find((c) => c.id === id), [data]);
  const wines: WineOption[] = useMemo(() => data.items.map((p) => ({ id: p.id, name: p.name, style: styleOf(catById(p.categoryId)) })), [data, catById]);
  const cur = cats.find((c) => c.slug === cat);
  const needle = q.trim().toLowerCase();
  const shown = data.items.filter((p) => (!cur || p.categoryId === cur.id)
    && (!needle || [p.name, p.region, p.grapeVariety, p.description].some((v) => (v ?? '').toLowerCase().includes(needle))));
  const anySample = data.items.some((p) => p.isSample);

  const sync = (slug: string, query: string) => {
    const sp = new URLSearchParams();
    if (slug !== 'all') sp.set('category', slug);
    if (query.trim()) sp.set('q', query.trim());
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const pick = (slug: string) => { setCat(slug); sync(slug, q); };
  const close = () => { setOpen(null); const t = trigger.current; setTimeout(() => t?.focus(), 0); };

  const live = `${shown.length} ${shown.length === 1 ? 'wine' : 'wines'}${cur ? ` · ${cur.name}` : ''}${needle ? ` matching “${q.trim()}”` : ''}`;

  return (
    <>
      {cats.length > 0 && (
        <nav aria-label="Wine categories" className="filter-bar">
          <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
            <div className="chips" role="group" aria-label="Filter wines by style">
              {[{ slug: 'all', name: 'All Wines', count: data.total }, ...cats].map((c) => (
                <button key={c.slug} type="button" className="chip" aria-pressed={cat === c.slug} onClick={() => pick(c.slug)}>{c.name}<span className="n">{c.count}</span></button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, paddingBottom: 6 }}>
              <label htmlFor="wine-search" className="sr">Search wines</label>
              <input id="wine-search" type="search" className="search-input" placeholder="Search by name, region or grape" value={q}
                onChange={(e) => setQ(e.target.value)} onBlur={() => sync(cat, q)} onKeyDown={(e) => { if (e.key === 'Enter') sync(cat, q); }} />
              <p className="hint hide-sm" aria-live="polite" style={{ flex: 'none' }}>{live}</p>
            </div>
          </div>
        </nav>
      )}

      <section aria-labelledby="cat-h" style={{ padding: 'clamp(44px, 5vw, 72px) 0 clamp(96px, 11vw, 150px)' }}>
        <div className="wrap">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, marginBottom: 'clamp(32px, 4vw, 52px)' }}>
            <div style={{ maxWidth: 640 }}>
              <h2 id="cat-h" className="h2" style={{ margin: 0, fontSize: 'clamp(32px, 3.4vw, 50px)' }}>{cur ? cur.name : 'All wines'}</h2>
              <p className="lead" style={{ marginTop: 12 }}>{cur ? cur.blurb : 'Every bottle in the boutique’s online collection. Choose a style to narrow it down.'}</p>
            </div>
            <p className="hint show-sm" aria-hidden="true">{live}</p>
          </div>
          {anySample && <ClientNote note={note} style={{ marginBottom: 'clamp(32px, 4vw, 48px)' }} />}

          {shown.length > 0 ? (
            <ul className="wine-grid">
              {shown.map((p, i) => {
                const c = catById(p.categoryId);
                const style = styleOf(c);
                return (
                  <li key={p.id} id={`wine-${p.id}`} className="wine-card" style={{ animationDelay: `${Math.min(i, 8) * 70}ms`, scrollMarginTop: 150 }}>
                    <article aria-labelledby={`wine-h-${p.id}`}>
                      <div className="wine-img zoom-host">
                        <Photo src={p.imageUrl} alt={p.imageAlt || p.name} label={`${style} bottle`} tint={p.tint ?? c?.tint} zoom style={{ position: 'absolute', inset: 0 }} />
                        {p.isSample && <span className="sample" style={{ position: 'absolute', top: 16, left: 16, zIndex: 3 }}>Sample</span>}
                      </div>
                      <div className="wine-body">
                        <p className="label">{style}</p>
                        <h3 id={`wine-h-${p.id}`} className="h3" style={{ marginTop: 10 }}>{p.name}</h3>
                        <WineMeta wine={p} />
                        {p.description && <p className="hint" style={{ marginTop: 6, fontSize: 14 }}>{p.description}</p>}
                        <div className="wine-actions">
                          <button type="button" className="btn" aria-haspopup="dialog" aria-label={`Ask about ${p.name}`} style={{ minHeight: 48, padding: '0 20px' }}
                            onClick={(e) => { trigger.current = e.currentTarget; setOpen(p); }}>Ask About This Wine</button>
                          <Link className="tlink" href={`/contact?wine=${p.id}&type=availability`} aria-label={`Ask about the availability of ${p.name}`}>Availability <span className="arr" aria-hidden="true">→</span></Link>
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="empty-card">
              <p className="disp" style={{ fontSize: 36 }}>{data.total === 0 ? 'The wine list is being prepared' : needle ? 'No wines match your search' : 'No wines in this style yet'}</p>
              <p className="hint" style={{ marginTop: 10 }}>Ask the boutique what’s currently available{data.total ? ', or browse the full collection' : ''}.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 22 }}>
                {data.total > 0 && <button type="button" className="btn btn-ghost" onClick={() => { setQ(''); setCat('all'); sync('all', ''); }}>Show All Wines</button>}
                <Link className="btn" href="/contact">Contact the Boutique</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {open && <WineDialog wine={open} category={catById(open.categoryId)} wines={wines} settings={settings} onClose={close} />}
    </>
  );
}

/** Region and grape: the boutique's supplied text, or the design's honest "To be supplied". */
export function WineMeta({ wine }: { wine: Pick<Product, 'region' | 'grapeVariety'> }) {
  const dd = (v: string | null) => <dd style={v ? { fontStyle: 'normal' } : undefined}>{tbs(v)}</dd>;
  return (
    <dl className="wine-meta">
      <div><dt>Region</dt>{dd(wine.region)}</div>
      <div><dt>Grape</dt>{dd(wine.grapeVariety)}</div>
    </dl>
  );
}
