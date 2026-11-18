'use client';

import { useEffect, useRef } from 'react';
import { styleOf } from '@/lib/api';
import type { Product, ProductCategory, SiteSettings } from '@/lib/types';
import { Icon } from './Icons';
import { InquiryForm, type WineOption } from './InquiryForm';
import { Photo } from './Photo';

/** "Ask About This Wine" dialog: focus moves in, Tab is trapped, Esc / backdrop close, focus returns to the opener (handled by the caller). */
export function WineDialog({ wine, category, wines, settings, onClose }: {
  wine: Product; category?: ProductCategory; wines: WineOption[]; settings: SiteSettings; onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setTimeout(() => panel.current?.querySelector<HTMLElement>('button')?.focus(), 0);
    return () => { document.body.style.overflow = prev; };
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
    if (e.key !== 'Tab' || !panel.current) return;
    const nodes = (Array.from(panel.current.querySelectorAll('button, a[href], input:not([tabindex="-1"]), select, textarea')) as HTMLElement[])
      .filter((n) => !n.hasAttribute('disabled') && n.offsetParent !== null);
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const style = styleOf(category);
  return (
    <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={panel} className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="inq-h" onKeyDown={onKey}>
        <Photo src={wine.imageUrl} alt={wine.imageAlt || wine.name} label={`${style} bottle`} tint={wine.tint ?? category?.tint} className="modal-art frame" style={{ minHeight: '100%' }} />
        <div style={{ padding: 'clamp(24px, 4vw, 52px)', position: 'relative' }}>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close inquiry form" style={{ position: 'absolute', top: 16, right: 16 }}><Icon name="close" size={18} sw={1.5} /></button>
          <p className="label">Wine inquiry</p>
          <h2 id="inq-h" className="disp" style={{ marginTop: 12, fontSize: 'clamp(30px, 3vw, 40px)', paddingRight: 56 }}>Ask about {wine.name}</h2>
          <p className="hint" style={{ marginTop: 10 }}>The boutique will reply by email. This is an inquiry only. {settings.businessName} doesn’t sell or ship wine online.</p>
          <div style={{ marginTop: 24 }}>
            <InquiryForm key={wine.id} mode="product" wines={wines} settings={settings} initialProduct={String(wine.id)} compact />
          </div>
        </div>
      </div>
    </div>
  );
}
