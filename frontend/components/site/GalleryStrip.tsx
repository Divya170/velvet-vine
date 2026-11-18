'use client';

import { useEffect, useRef, useState } from 'react';
import { mediaUrl, tintClass } from '@/lib/api';
import type { GalleryItem } from '@/lib/types';
import { Em } from './Em';
import { Icon } from './Icons';

/**
 * "Moments from the boutique": the Gallery page's only auto-moving element. Steps one frame every 5–8 s, loops
 * seamlessly, pauses on hover/focus, on the pause button, when the tab is hidden, and stays still for reduced motion.
 */
export function GalleryStrip({ items, seconds, eyebrow, title }: { items: GalleryItem[]; seconds: number; eyebrow: string; title: string }) {
  const n = items.length;
  const [k, setK] = useState(0);
  const [anim, setAnim] = useState(true);
  const [paused, setPaused] = useState(false);
  const [hold, setHold] = useState(false);
  const reset = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) setPaused(true);
  }, []);

  useEffect(() => {
    if (paused || hold || n < 2) return;
    const t = setInterval(() => {
      if (document.hidden) return;
      setAnim(true);
      setK((cur) => {
        const next = cur + 1;
        if (next >= n) { clearTimeout(reset.current); reset.current = setTimeout(() => { setAnim(false); setK(0); }, 1500); }
        return next;
      });
    }, Math.min(8, Math.max(5, seconds)) * 1000);
    return () => clearInterval(t);
  }, [paused, hold, n, seconds]);
  useEffect(() => () => clearTimeout(reset.current), []);

  if (n < 3) return null;
  const frames = [...items, ...items];
  return (
    <section aria-label="Featured photographs" style={{ padding: 'clamp(72px, 9vw, 120px) 0 0' }}
      onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)} onFocus={() => setHold(true)} onBlur={() => setHold(false)}>
      <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginBottom: 26 }}>
        <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2 className="h2" style={{ fontSize: 'clamp(30px, 3vw, 44px)' }}><Em text={title} /></h2></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <p className="hint hide-sm">Moves slowly · pauses on hover</p>
          <button type="button" className="icon-btn" onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Play featured photos' : 'Pause featured photos'}>
            <Icon name={paused ? 'play' : 'pause'} size={16} sw={1.6} />
          </button>
        </div>
      </div>
      <div style={{ overflow: 'hidden', paddingLeft: 'clamp(20px, 5vw, 76px)' }}>
        <div className="strip-track" style={{ marginLeft: `calc(var(--fw) * -${k})`, transition: anim ? 'margin-left 1.4s cubic-bezier(.45,0,.2,1)' : 'none' }}>
          {frames.map((g, i) => {
            const url = mediaUrl(g.imageUrl);
            return (
              <div key={`${g.id}-${i}`} className="strip-f" aria-hidden={i >= n}>
                <div className={`ph ${tintClass(g.tint)} ${url ? 'has-img' : ''}`} style={{ aspectRatio: '4 / 5' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {url ? <img className="cover" src={url} alt={i >= n ? '' : g.alt || g.title} loading="lazy" decoding="async" /> : <p className="ph-tag">{g.title}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
