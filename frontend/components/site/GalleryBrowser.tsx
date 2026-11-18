'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { mediaUrl, tintClass } from '@/lib/api';
import type { GalleryItem } from '@/lib/types';
import { Icon } from './Icons';

/**
 * Category filters (only categories that have photos; kept in ?category=), masonry grid and an accessible lightbox:
 * counter, previous/next, Esc, arrow keys, swipe, focus trap, focus returned to the tile that opened it.
 */
export function GalleryBrowser({ items, categories, initialCategory = 'All' }: { items: GalleryItem[]; categories: { name: string; count: number }[]; initialCategory?: string }) {
  const names = categories.map((c) => c.name);
  const [cat, setCat] = useState<string>(names.includes(initialCategory) ? initialCategory : 'All');
  const [open, setOpen] = useState(-1);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);

  const shown = cat === 'All' ? items : items.filter((i) => i.category === cat);
  const n = shown.length;

  const pick = (c: string) => {
    setCat(c);
    setOpen(-1);
    const url = new URL(window.location.href);
    if (c === 'All') url.searchParams.delete('category');
    else url.searchParams.set('category', c);
    window.history.replaceState(null, '', url.toString());
  };

  const go = useCallback((d: number) => setOpen((o) => (n ? (o + d + n) % n : -1)), [n]);
  const close = useCallback(() => {
    setOpen(-1);
    setTimeout(() => lastTrigger.current?.focus(), 0);
  }, []);

  const isOpen = open >= 0;
  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    else if (e.key === 'Tab') {
      const nodes = (Array.from((e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('button')) as HTMLElement[]).filter((b: HTMLElement) => b.offsetParent !== null);
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };

  const lb = isOpen ? shown[open] : null;
  const lbUrl = mediaUrl(lb?.imageUrl);
  const Arrow = ({ dir, cls }: { dir: 'prev' | 'next'; cls: string }) => (
    <button type="button" className={`icon-btn light ${cls}`} onClick={() => go(dir === 'prev' ? -1 : 1)} aria-label={dir === 'prev' ? 'Previous photo' : 'Next photo'}><Icon name={dir} size={18} sw={1.5} /></button>
  );

  return (
    <>
      <div className="gal-bar">
        <div className="chips" role="group" aria-label="Filter photos by subject">
          {categories.map((c) => (
            <button key={c.name} type="button" className="chip" aria-pressed={cat === c.name} onClick={() => pick(c.name)}>{c.name}<span className="n">{c.count}</span></button>
          ))}
        </div>
        <p className="hint" aria-live="polite" style={{ flex: 'none' }}>{n} {n === 1 ? 'photo' : 'photos'}{cat === 'All' ? '' : ` · ${cat}`}</p>
      </div>

      {n === 0 ? (
        <div className="empty-card">
          <p className="disp" style={{ fontSize: 34 }}>No photos here yet</p>
          <p className="hint" style={{ marginTop: 10 }}>Photos appear once the boutique adds them.</p>
          {cat !== 'All' && <button type="button" className="btn btn-ghost" onClick={() => pick('All')} style={{ marginTop: 20 }}>Show All Photos</button>}
        </div>
      ) : (
        <ul className="gal-grid">
          {shown.map((g, i) => {
            const url = mediaUrl(g.imageUrl);
            const tc = tintClass(g.tint);
            return (
              <li key={g.id} className="gal-item" style={{ gridRow: `span ${Math.min(3, Math.max(1, g.rows))}`, gridColumn: `span ${Math.min(3, Math.max(1, g.cols))}`, animationDelay: `${Math.min(i, 10) * 50}ms` }}>
                <button type="button" className="gal-btn zoom-host" onClick={(e) => { lastTrigger.current = e.currentTarget; setOpen(i); }} aria-label={`Open photo ${i + 1} of ${n}: ${g.title} (${g.category})`}>
                  <div className={`ph ${tc} ${url ? 'has-img' : ''}`} style={{ position: 'absolute', inset: 0 }}>
                    <div className={`ph ${tc} zoom`} aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {url && <img className="cover" src={url} alt="" loading="lazy" decoding="async" />}
                    </div>
                    {!url && <p className="ph-tag">{g.category} · {g.title}</p>}
                  </div>
                  <span className="gal-plus" aria-hidden="true"><Icon name="plus" size={16} sw={1.5} /></span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {lb && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" onKeyDown={onKey}
          onTouchStart={(e) => { touchX.current = e.changedTouches[0]?.clientX ?? null; }}
          onTouchEnd={(e) => {
            const x = e.changedTouches[0]?.clientX;
            if (touchX.current == null || x == null) return;
            const dx = x - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1);
          }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, minHeight: 56 }}>
            <p className="label" style={{ color: '#D9C08F' }} aria-live="polite">{open + 1} / {n}</p>
            <button ref={closeRef} type="button" className="icon-btn light" onClick={close} aria-label="Close photo viewer"><Icon name="close" size={18} sw={1.5} /></button>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 24px)', minHeight: 0 }}>
            <Arrow dir="prev" cls="lb-side" />
            <figure style={{ flex: 1, margin: 0, height: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
              <div key={lb.id} className={`ph frame ${tintClass(lb.tint)} ${lbUrl ? 'has-img' : ''}`} style={{ flex: 1, minHeight: 240, animation: 'rise .45s ease both' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {lbUrl ? <img src={lbUrl} alt={lb.alt || lb.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} /> : <p className="ph-tag">Photo placeholder · {lb.category}</p>}
              </div>
              <figcaption style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'baseline' }}>
                <span className="serif" style={{ fontSize: 'clamp(22px, 2.2vw, 30px)', color: '#F5F0E7' }}>{lb.title}</span>
                <span className="label">{lb.category}</span>
              </figcaption>
            </figure>
            <Arrow dir="next" cls="lb-side" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, paddingTop: 14 }}>
            <Arrow dir="prev" cls="lb-mobile" />
            <p className="hide-sm" style={{ fontSize: 13, color: '#CDBFB6' }}>Arrow keys or swipe to browse · Esc to close</p>
            <p className="show-sm" style={{ fontSize: 13, color: '#CDBFB6' }}>Swipe to browse</p>
            <Arrow dir="next" cls="lb-mobile" />
          </div>
        </div>
      )}
    </>
  );
}
