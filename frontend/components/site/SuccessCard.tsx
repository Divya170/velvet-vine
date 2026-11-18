import Link from 'next/link';
import type { InquiryReceipt } from '@/lib/types';
import { Icon } from './Icons';

/** Shown only after the API has stored the message (HTTP 201). Always includes a clear next action. */
export function SuccessCard({ receipt, businessName, onReset, resetLabel, next, headingRef }: {
  receipt: InquiryReceipt; businessName: string; onReset: () => void; resetLabel: string; next: { href: string; label: string }; headingRef?: React.Ref<HTMLParagraphElement>;
}) {
  const first = receipt.name.trim().split(/\s+/)[0] || 'there';
  return (
    <div style={{ animation: 'rise .5s ease both', padding: '8px 0' }}>
      <span style={{ width: 58, height: 58, border: '1px solid #B49A68', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#541C2B' }}><Icon name="glass" size={26} /></span>
      <p ref={headingRef} tabIndex={-1} className="disp" style={{ fontSize: 'clamp(32px, 3.2vw, 44px)', marginTop: 22, outline: 'none' }}>
        Thank you, {first}. Your {receipt.source === 'product' ? 'inquiry' : 'message'} has been sent.
      </p>
      <p className="lead" style={{ marginTop: 14 }}>
        {receipt.productName ? <>{businessName} has your question about <strong>{receipt.productName}</strong> and will reply to <strong>{receipt.email}</strong> as soon as possible.</>
          : <>{businessName} will reply to <strong>{receipt.email}</strong> as soon as possible. If your question is urgent, please call the boutique.</>}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 28 }}>
        <Link className="btn" href={next.href}>{next.label} <span className="arr" aria-hidden="true">→</span></Link>
        <button type="button" className="btn btn-ghost" onClick={onReset}>{resetLabel}</button>
      </div>
    </div>
  );
}
