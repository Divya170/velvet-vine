'use client';

import { useEffect, useRef, useState } from 'react';
import { Logo } from './Icons';

const KEY = 'vv_age_ok';

/**
 * Legal-age confirmation. Rendered only when the admin has switched it on (settings.ageGateEnabled, off by default).
 * Yes/no only: no date of birth or other personal data is asked for, sent or stored. The answer lives in
 * sessionStorage for this visit. The site content stays in the page behind it (inert while the gate is open).
 */
export function AgeGate({ minimumAge, businessName, tagline }: { minimumAge: number; businessName: string; tagline: string }) {
  const [state, setState] = useState<'checking' | 'ask' | 'denied' | 'ok'>('checking');
  const yesRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let ok = false;
    try { ok = window.sessionStorage.getItem(KEY) === '1'; } catch { ok = false; }
    setState(ok ? 'ok' : 'ask');
  }, []);

  const open = state === 'ask' || state === 'denied';
  useEffect(() => {
    if (!open) return;
    const siblings = Array.from(document.querySelectorAll<HTMLElement>('body > *')).filter((n) => !n.contains(document.getElementById('age-gate')));
    siblings.forEach((n) => n.setAttribute('inert', ''));
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { siblings.forEach((n) => n.removeAttribute('inert')); document.body.style.overflow = prev; };
  }, [open]);
  useEffect(() => { if (state === 'ask') yesRef.current?.focus(); if (state === 'denied') backRef.current?.focus(); }, [state]);

  // While sessionStorage is being read, cover the page so content never flashes before the question.
  if (state === 'checking') return <div className="agegate" aria-hidden="true" />;
  if (!open) return null;

  const yes = () => { try { window.sessionStorage.setItem(KEY, '1'); } catch { /* storage unavailable: confirm for this page view */ } setState('ok'); };
  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const nodes = Array.from(e.currentTarget.querySelectorAll('button')) as HTMLElement[];
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  return (
    <div id="age-gate" className="agegate" role="dialog" aria-modal="true" aria-labelledby="age-h" aria-describedby="age-d" onKeyDown={onKey}>
      <div className="agegate-card">
        <div style={{ display: 'flex', justifyContent: 'center' }}><Logo color="#F5F0E7" sub="#D9C08F" name={businessName.toUpperCase()} tagline={tagline} /></div>
        <span className="goldrule" style={{ margin: '34px auto 0' }} />
        {state === 'ask' ? (
          <>
            <h2 id="age-h" className="disp" style={{ fontSize: 'clamp(32px, 4vw, 46px)', marginTop: 30 }}>Welcome to {businessName}.</h2>
            <p id="age-d" className="lead" style={{ marginTop: 16 }}>This website features wine. Please confirm that you are of legal drinking age ({minimumAge} or older in the United States) to continue.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 30 }}>
              <button ref={yesRef} type="button" className="btn btn-light" onClick={yes}>Yes, I Am {minimumAge} or Older</button>
              <button type="button" className="btn btn-ghost-light" onClick={() => setState('denied')}>No, I Am Not</button>
            </div>
            <p className="hint" style={{ marginTop: 22, fontSize: 12.5 }}>We don’t ask for or store your date of birth. Your answer is remembered only for this visit.</p>
          </>
        ) : (
          <>
            <h2 id="age-h" className="disp" style={{ fontSize: 'clamp(30px, 3.6vw, 42px)', marginTop: 30 }}>Thank you for visiting.</h2>
            <p id="age-d" className="lead" style={{ marginTop: 16 }}>{businessName}’s website is intended for visitors of legal drinking age, so we can’t show it to you right now.</p>
            <button ref={backRef} type="button" className="tlink" onClick={() => setState('ask')} style={{ margin: '22px auto 0', display: 'flex' }}>I chose the wrong answer</button>
          </>
        )}
      </div>
    </div>
  );
}
