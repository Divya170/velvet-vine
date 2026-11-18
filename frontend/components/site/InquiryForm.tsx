'use client';

import { useEffect, useRef, useState } from 'react';
import { ApiError, apiFetch } from '@/lib/api';
import type { InquiryReceipt, InquirySubject, SiteSettings } from '@/lib/types';
import { FIELD_LABELS, MESSAGE_MAX, SUBJECTS, fieldOrder, validateInquiry, type InquiryForm as Form, type InquiryMode } from '@/lib/validation';
import { Icon } from './Icons';
import { SuccessCard } from './SuccessCard';

export interface WineOption { id: number; name: string; style: string }
type Status = 'idle' | 'sending' | 'success' | 'failure' | 'duplicate';
type Errors = Partial<Record<keyof Form, string>>;

/** Visible labels exactly as in the design (the error summary uses the shorter FIELD_LABELS). */
const LABELS: Record<keyof Form, (m: InquiryMode) => string> = {
  name: () => 'Full name', email: () => 'Email address', phone: () => 'Phone number', subject: () => 'Inquiry type',
  product: (m) => (m === 'contact' ? 'Wine of interest' : 'Wine'), message: () => 'Message', website: () => 'Website',
};

/**
 * One form for both entry points: the Contact page (mode "contact": Inquiry Type required, wine optional)
 * and a wine card's "Ask About This Wine" dialog (mode "product": wine required). Rules are enforced by the NestJS API and
 * mirrored here for instant feedback; success is shown only after the API stores the message.
 */
export function InquiryForm({ mode, wines, settings, initialProduct, initialSubject, onSent, compact }: {
  mode: InquiryMode; wines: WineOption[]; settings: SiteSettings; initialProduct?: string; initialSubject?: InquirySubject; onSent?: () => void; compact?: boolean;
}) {
  const empty: Form = { name: '', email: '', phone: '', subject: initialSubject ?? '', product: initialProduct ?? '', message: '', website: '' };
  const [f, setF] = useState<Form>(empty);
  const [seen, setSeen] = useState<Partial<Record<keyof Form, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [failMsg, setFailMsg] = useState('');
  const [receipt, setReceipt] = useState<InquiryReceipt | null>(null);
  const successRef = useRef<HTMLParagraphElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const lastSent = useRef<string | null>(null);
  const order = fieldOrder(mode);
  const id = (k: string) => `${mode}-${k}`;

  useEffect(() => { if (status === 'success') successRef.current?.focus(); }, [status]);

  const clientErrors = validateInquiry(f, mode);
  const errors: Errors = { ...clientErrors, ...serverErrors };
  const show = (k: keyof Form) => ((submitted || seen[k]) && errors[k]) || '';
  const bad = order.filter((k) => errors[k]);

  const set = (k: keyof Form, v: string) => {
    setF((p) => ({ ...p, [k]: v }));
    if (serverErrors[k]) setServerErrors((p) => { const n = { ...p }; delete n[k]; return n; });
    if (status === 'failure' || status === 'duplicate') setStatus('idle');
  };
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => set(e.target.name as keyof Form, e.target.value);
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setSeen((s) => ({ ...s, [e.target.name]: true }));
  const aria = (k: keyof Form, hint?: string) => {
    const m = show(k);
    return { 'aria-invalid': m ? true : undefined, 'aria-describedby': [m ? `${id(k)}-err` : '', hint ?? ''].filter(Boolean).join(' ') || undefined };
  };
  const fingerprint = () => JSON.stringify([mode, f.email.trim().toLowerCase(), f.subject, f.product, f.message.trim().replace(/\s+/g, ' ').toLowerCase()]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    setSubmitted(true);
    const first = order.find((k) => clientErrors[k]);
    if (first) { setTimeout(() => document.getElementById(id(first))?.focus(), 0); return; }
    if (lastSent.current === fingerprint()) { setStatus('duplicate'); return; }
    setStatus('sending');
    try {
      const r = await apiFetch<InquiryReceipt>('/inquiries', {
        method: 'POST',
        body: JSON.stringify({ source: mode, name: f.name, email: f.email, phone: f.phone, subject: mode === 'contact' ? f.subject : undefined, product: f.product || null, message: f.message, website: f.website }),
      });
      lastSent.current = fingerprint();
      setReceipt(r);
      setStatus('success');
      onSent?.();
    } catch (err) {
      const ae = err instanceof ApiError ? err : new ApiError(0, null);
      if (ae.status === 409) { lastSent.current = fingerprint(); setStatus('duplicate'); return; }
      if (ae.status === 400 && Object.keys(ae.fieldErrors).length) {
        setServerErrors(ae.fieldErrors as Errors);
        setStatus('idle');
        setTimeout(() => summaryRef.current?.focus(), 0);
        return;
      }
      setFailMsg(ae.status === 429 || ae.status === 0 ? ae.message : '');
      setStatus('failure');
    }
  };

  const reset = () => {
    setF({ ...empty, product: mode === 'product' ? f.product : '', subject: '' });
    setSeen({}); setSubmitted(false); setServerErrors({}); setReceipt(null); setStatus('idle');
    setTimeout(() => document.getElementById(id('name'))?.focus(), 0);
  };

  const Label = ({ k, optional }: { k: keyof Form; optional?: boolean }) => (
    <label htmlFor={id(k)}>{LABELS[k](mode)} {optional ? <span style={{ fontWeight: 400, color: '#6E675F' }}>(optional)</span> : <span className="req" aria-hidden="true">*</span>}</label>
  );
  const Err = ({ k }: { k: keyof Form }) => (show(k) ? <p id={`${id(k)}-err`} className="err">{show(k)}</p> : null);
  /** Fallback after a failed send: the same message, pre-filled in the visitor's own email app. */
  const mailtoHref = () => {
    const wine = wines.find((w) => String(w.id) === f.product)?.name;
    const type = SUBJECTS.find((x) => x.value === f.subject)?.label;
    const subj = `${settings.businessName} inquiry${wine ? ` · ${wine}` : type ? ` · ${type}` : ''}`;
    const body = `${f.message}\n\n${f.name}${f.phone ? `\n${f.phone}` : ''}`;
    return `mailto:${settings.email}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
  };
  const contact = (
    <>
      {settings.emailHref && <>email <a href={settings.emailHref}>{settings.email}</a></>}
      {settings.emailHref && settings.phoneHref && ' or '}
      {settings.phoneHref && <>call <a href={settings.phoneHref}>{settings.phone}</a></>}
    </>
  );

  return (
    <div>
      <div aria-live="polite" role="status">
        {status === 'success' && receipt && (
          <SuccessCard receipt={receipt} businessName={settings.businessName} onReset={reset} headingRef={successRef}
            resetLabel={mode === 'product' ? 'Ask About Another Wine' : 'Send Another Message'}
            next={mode === 'product' ? { href: '/collection', label: 'Browse Our Collection' } : { href: '/wines', label: 'Explore the Wine Collection' }} />
        )}
        {status === 'failure' && (
          <div role="alert" className="notice notice-err" style={{ marginBottom: 24 }}>
            <p style={{ fontWeight: 700, color: '#8A2A26' }}>Your message couldn’t be sent.</p>
            <p className="hint" style={{ marginTop: 6 }}>{failMsg || 'Your details are still here. Please try again'}{settings.emailHref || settings.phoneHref ? <>, or {contact}</> : null}.</p>
            {settings.email && <a className="tlink" href={mailtoHref()} style={{ marginTop: 8 }}>Open This Message in Your Email <span className="arr" aria-hidden="true">→</span></a>}
          </div>
        )}
        {status === 'duplicate' && (
          <div className="notice notice-warn" style={{ marginBottom: 24 }}>
            <p style={{ fontWeight: 700 }}>This exact message was just sent.</p>
            <p className="hint" style={{ marginTop: 6 }}>To avoid a duplicate, it wasn’t sent again. Change a detail, or {contact || 'contact the boutique'} if you need to follow up.</p>
          </div>
        )}
      </div>
      {status !== 'success' && (
        <form noValidate onSubmit={onSubmit} aria-label={mode === 'product' ? 'Wine inquiry' : 'Inquiry form'} style={{ display: 'flex', flexDirection: 'column', gap: compact ? 22 : 24 }}>
          {submitted && bad.length > 0 && (
            <div ref={summaryRef} tabIndex={-1} role="alert" className="notice notice-err" style={{ fontSize: 14, color: '#8A2A26', fontWeight: 700 }}>
              {bad.length === 1 ? 'Please check 1 field: ' : `Please check ${bad.length} fields: `}
              {bad.map((k, i) => <span key={k}>{i ? ', ' : ''}<a href={`#${id(k)}`} style={{ color: '#8A2A26' }}>{FIELD_LABELS[k]}</a></span>)}.
            </div>
          )}
          {/* Honeypot: hidden from people and assistive tech; the API rejects submissions that fill it. */}
          <div aria-hidden="true" style={{ position: 'absolute', left: -10000, width: 1, height: 1, overflow: 'hidden' }}>
            <label htmlFor={id('website')}>Website</label>
            <input id={id('website')} name="website" type="text" tabIndex={-1} autoComplete="off" value={f.website} onChange={onChange} />
          </div>
          <div className="form-2">
            <div className="field"><Label k="name" /><input id={id('name')} name="name" type="text" className="input" autoComplete="name" required maxLength={120} value={f.name} onChange={onChange} onBlur={onBlur} {...aria('name')} /><Err k="name" /></div>
            <div className="field"><Label k="email" /><input id={id('email')} name="email" type="email" className="input" autoComplete="email" inputMode="email" required maxLength={160} value={f.email} onChange={onChange} onBlur={onBlur} {...aria('email')} /><Err k="email" /></div>
          </div>
          <div className="field">
            <Label k="phone" optional />
            <input id={id('phone')} name="phone" type="tel" className="input" autoComplete="tel" inputMode="tel" maxLength={30} value={f.phone} onChange={onChange} onBlur={onBlur} {...aria('phone', `${id('phone')}-hint`)} />
            <Err k="phone" />
            <p id={`${id('phone')}-hint`} className="hint" style={{ fontSize: 13 }}>Only if you’d prefer a call back.</p>
          </div>
          {mode === 'contact' ? (
            <div className="form-2">
              <div className="field">
                <Label k="subject" />
                <select id={id('subject')} name="subject" className="input" required value={f.subject} onChange={onChange} onBlur={onBlur} {...aria('subject')}>
                  <option value="">Choose an inquiry type</option>
                  {SUBJECTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <Err k="subject" />
              </div>
              <div className="field">
                <Label k="product" optional />
                <select id={id('product')} name="product" className="input" value={f.product} onChange={onChange} {...aria('product')}>
                  <option value="">No particular wine</option>
                  {wines.map((t) => <option key={t.id} value={String(t.id)}>{t.name} ({t.style})</option>)}
                </select>
                <Err k="product" />
              </div>
            </div>
          ) : (
            <div className="field">
              <Label k="product" />
              <select id={id('product')} name="product" className="input" required value={f.product} onChange={onChange} onBlur={onBlur} {...aria('product')}>
                <option value="">Choose a wine</option>
                {wines.map((t) => <option key={t.id} value={String(t.id)}>{t.name} ({t.style})</option>)}
                <option value="general">Not sure yet / general question</option>
              </select>
              <Err k="product" />
            </div>
          )}
          <div className="field">
            <Label k="message" />
            <textarea id={id('message')} name="message" className="input" rows={compact ? 4 : 5} maxLength={MESSAGE_MAX} required value={f.message} onChange={onChange} onBlur={onBlur}
              placeholder={mode === 'product' ? 'For example: is this wine currently in stock?' : 'How can we help?'} {...aria('message', `${id('message')}-count`)} />
            <Err k="message" />
            <p id={`${id('message')}-count`} className="hint" style={{ fontSize: 13, textAlign: 'right' }}>{f.message.length} / {MESSAGE_MAX}</p>
          </div>
          <p className="hint" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ color: '#7A6034', flex: 'none', marginTop: 2 }}><Icon name="glass" size={18} /></span>
            <span>Your details are used only to reply to your message. No mailing lists, and nothing is sold or shipped online.</span>
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 18 }}>
            <button type="submit" className="btn" disabled={status === 'sending'} aria-busy={status === 'sending'} style={{ minWidth: 220 }}>
              {status === 'sending' ? 'Sending…' : 'Send Inquiry'} <span className="arr" aria-hidden="true">→</span>
            </button>
            <p className="hint"><span className="req" aria-hidden="true">*</span> Required</p>
          </div>
        </form>
      )}
    </div>
  );
}
