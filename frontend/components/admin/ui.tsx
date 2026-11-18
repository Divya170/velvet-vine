'use client';

import { useEffect, useState } from 'react';

export function useToast() {
  const [toast, setToast] = useState<{ msg: string; error?: boolean } | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);
  const node = toast ? <div role="status" aria-live="polite" className={`toast ${toast.error ? 'error' : ''}`}>{toast.msg}</div> : null;
  return { show: (msg: string, error = false) => setToast({ msg, error }), node };
}

export function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="adm-table-wrap" role="status" aria-label="Loading">
      <table className="adm-table"><tbody>
        {Array.from({ length: rows }).map((_, r) => (
          <tr key={r}>{Array.from({ length: cols }).map((__, c) => <td key={c}><div className="skel" style={{ height: 14, width: c === 0 ? '70%' : '50%' }} /></td>)}</tr>
        ))}
      </tbody></table>
    </div>
  );
}

export function ErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="notice-error" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{message}</span>
      <button type="button" className="adm-btn sm" onClick={onRetry}>Retry</button>
    </div>
  );
}

export function Drawer({ title, onClose, children, footer }: { title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);
  return (
    <>
      <div className="drawer-back" onClick={onClose} aria-hidden="true" />
      <div className="drawer-adm" role="dialog" aria-modal="true" aria-label={title}>
        <div className="drawer-head">
          <h2 className="disp" style={{ margin: 0, fontSize: 26, fontWeight: 500 }}>{title}</h2>
          <button type="button" className="adm-btn ghost sm" onClick={onClose} autoFocus>Close</button>
        </div>
        <div className="drawer-body">{children}</div>
        {footer && <div className="drawer-foot">{footer}</div>}
      </div>
    </>
  );
}
