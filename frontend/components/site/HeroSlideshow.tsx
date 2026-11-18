'use client';

import { useEffect, useRef, useState } from 'react';
import { mediaUrl, tintClass } from '@/lib/api';
import type { ContentBlock } from '@/lib/types';
import { Icon } from './Icons';

/**
 * Full-width hero cross-fade (1.8s fade every 6–8s). Pauses on hover/focus, on the pause button, when offscreen or
 * the tab is hidden, and for prefers-reduced-motion. The headline and CTAs (children) never move.
 */
export function HeroSlideshow({ slides, autoplay, intervalSeconds, label, children }: { slides: ContentBlock[]; autoplay: boolean; intervalSeconds: number; label: string; children: React.ReactNode }) {
  const count = Math.max(1, slides.length);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(!autoplay);
  const [hover, setHover] = useState(false);
  const [visible, setVisible] = useState(true);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) setPaused(true);
    const el = ref.current;
    const io = el && 'IntersectionObserver' in window ? new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 }) : null;
    if (io && el) io.observe(el);
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => { io?.disconnect(); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  useEffect(() => {
    if (paused || hover || !visible || count < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), Math.min(8, Math.max(6, intervalSeconds)) * 1000);
    return () => clearInterval(t);
  }, [paused, hover, visible, count, intervalSeconds]);

  const current = slides[index];
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <section ref={ref} aria-label={label} className="hero" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocus={() => setHover(true)} onBlur={() => setHover(false)}>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
        {(slides.length ? slides : [null]).map((s, i) => {
          const url = mediaUrl(s?.fields?.imageUrl);
          const tc = tintClass(s?.fields?.tint);
          return (
            <div key={s?.id ?? i} className={`ph ${tc} ${url ? 'has-img' : ''}`} style={{ position: 'absolute', inset: 0, opacity: i === index ? 1 : 0, transition: 'opacity 1.8s ease' }}>
              <div className={`ph ${tc} ${url ? 'has-img' : ''} kb`} style={{ position: 'absolute', inset: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {url && <img className="cover" src={url} alt="" loading={i === 0 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : 'auto'} />}
              </div>
            </div>
          );
        })}
        <div className="hero-shade" />
      </div>
      {current && !current.fields?.imageUrl && <p className="ph-tag" style={{ top: 22, bottom: 'auto', left: 'auto', right: 'clamp(20px,5vw,76px)' }}>Photo placeholder · {current.title}</p>}
      {current?.fields?.imageUrl && <p className="sr" aria-live="polite">{current.title}</p>}
      {children}
      {count > 1 && (
        <div className="hero-ctrl">
          <p className="label" style={{ color: '#D9C08F', minWidth: 64 }} aria-hidden="true">{pad(index + 1)} / {pad(count)}</p>
          {slides.map((s, i) => (
            <button key={s.id} type="button" className="hero-dot" aria-label={`Show photo ${i + 1} of ${count}`} aria-pressed={i === index} onClick={() => { setIndex(i); setPaused(true); }}>
              <span style={{ width: i === index ? 34 : 16, background: i === index ? '#D9C08F' : 'rgba(245,240,231,.45)' }} />
            </button>
          ))}
          <button type="button" className="icon-btn light" onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Play hero photos' : 'Pause hero photos'} style={{ marginLeft: 6, width: 44, height: 44 }}>
            <Icon name={paused ? 'play' : 'pause'} size={16} sw={1.6} />
          </button>
        </div>
      )}
      <a href="#intro-h" className="hero-cue">
        <span className="label" style={{ color: '#D9C08F', fontSize: 10 }}>Scroll</span>
        <svg className="scrollcue" width="14" height="24" viewBox="0 0 14 24" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true"><path d="M7 1v20M2 16l5 6 5-6" /></svg>
        <span className="sr">Skip to the introduction</span>
      </a>
    </section>
  );
}
