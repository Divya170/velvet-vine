'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { styleOf, tbs } from '@/lib/api';
import type { Product, ProductCategory } from '@/lib/types';
import { Photo } from './Photo';

/** Our Collection "Wine Details": pick a wine (click or arrow keys) to see type, region, grape and description where supplied. */
export function WineSpotlight({ wines, categories }: { wines: Product[]; categories: ProductCategory[] }) {
  const [id, setId] = useState(wines[0]?.id);
  const list = useRef<HTMLDivElement>(null);
  const cur = wines.find((w) => w.id === id) ?? wines[0];
  if (!cur) return null;
  const catOf = (w: Product) => categories.find((c) => c.id === w.categoryId);
  const c = catOf(cur);
  const style = styleOf(c);

  const onKey = (e: React.KeyboardEvent) => {
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    const i = wines.findIndex((w) => w.id === cur.id);
    const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1;
    const n = (i + d + wines.length) % wines.length;
    setId(wines[n].id);
    list.current?.querySelectorAll<HTMLButtonElement>('.spot-btn')[n]?.focus();
  };

  return (
    <div className="spot">
      <div ref={list} className="spot-list" role="group" aria-label="Choose a wine">
        {wines.map((w, i) => (
          <button key={w.id} type="button" className="spot-btn" aria-pressed={w.id === cur.id} aria-controls="spot-panel" onClick={() => setId(w.id)} onKeyDown={onKey}>
            <span className="spot-n">{String(i + 1).padStart(2, '0')}</span>
            <span className="spot-name">{w.name}</span>
            <span className="label spot-type">{styleOf(catOf(w))}</span>
          </button>
        ))}
      </div>
      <div id="spot-panel" key={cur.id} className="spot-panel" aria-live="polite">
        <Photo src={cur.imageUrl} alt={cur.imageAlt || cur.name} label={`${style} bottle`} tint={cur.tint ?? c?.tint} className="frame spot-img">
          {cur.isSample && <span className="sample" style={{ position: 'absolute', top: 26, left: 26, zIndex: 4 }}>Sample</span>}
        </Photo>
        <div className="spot-copy">
          <p className="label">{style} wine</p>
          <h3 className="disp" style={{ marginTop: 12, fontSize: 'clamp(32px, 3vw, 46px)' }}>{cur.name}</h3>
          <dl className="spot-dl">
            <div><dt>Wine type</dt><dd>{style}</dd></div>
            <div><dt>Region</dt><dd className={cur.region ? '' : 'tbs'}>{tbs(cur.region)}</dd></div>
            <div><dt>Grape variety</dt><dd className={cur.grapeVariety ? '' : 'tbs'}>{tbs(cur.grapeVariety)}</dd></div>
          </dl>
          {cur.description && <p className="lead prose-copy" style={{ marginTop: 20 }}>{cur.description}</p>}
          {cur.details && <p className="hint prose-copy" style={{ marginTop: 12 }}>{cur.details}</p>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
            <Link className="btn" href={`/contact?wine=${cur.id}&type=availability`}>Ask About This Wine <span className="arr" aria-hidden="true">→</span></Link>
            {c && <Link className="tlink" href={`/wines?category=${c.slug}`}>More {style} wines <span className="arr" aria-hidden="true">→</span></Link>}
          </div>
        </div>
      </div>
    </div>
  );
}
