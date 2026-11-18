'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Drawer, ErrorPanel, TableSkeleton, useDebounced, useToast } from '@/components/admin/ui';
import { adminDownload, adminFetch } from '@/lib/admin-api';
import type { Inquiry, InquiryStatus } from '@/lib/types';
import { SUBJECTS } from '@/lib/validation';

interface Page { items: Inquiry[]; total: number; page: number; pageSize: number; pages: number }
const STATUSES: { value: InquiryStatus; label: string }[] = [
  { value: 'new', label: 'New' }, { value: 'responded', label: 'Responded' }, { value: 'archived', label: 'Archived' },
];

function InquiriesInner() {
  const params = useSearchParams();
  const [data, setData] = useState<Page | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | InquiryStatus>('all');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [subject, setSubject] = useState<string>('all');
  const [source, setSource] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const toast = useToast();
  const q = useDebounced(search);

  const qs = useMemo(() => {
    const p = new URLSearchParams({ status, subject, source, sort, page: String(page), pageSize: '20' });
    if (q.trim()) p.set('search', q.trim());
    return p.toString();
  }, [q, status, subject, source, sort, page]);

  const load = useCallback(async () => {
    setError('');
    try { setData(await adminFetch<Page>(`/admin/inquiries?${qs}`)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not load inquiries.'); }
  }, [qs]);

  useEffect(() => { setData(null); load(); }, [load]);
  useEffect(() => { setPage(1); }, [q, status, subject, source, sort]);

  useEffect(() => {
    const id = Number(params.get('open'));
    if (id) adminFetch<Inquiry>(`/admin/inquiries/${id}`).then(openRow).catch(() => undefined);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function openRow(i: Inquiry) { setSelected(i); setNotes(i.adminNotes ?? ''); setConfirmDelete(false); }
  const close = useCallback(() => setSelected(null), []);

  async function update(patch: Partial<Pick<Inquiry, 'status' | 'adminNotes'>>, msg: string) {
    if (!selected) return;
    setBusy(true);
    try {
      const saved = await adminFetch<Inquiry>(`/admin/inquiries/${selected.id}`, { method: 'PATCH', body: JSON.stringify(patch) });
      setSelected(saved);
      toast.show(msg);
      load();
    } catch (e) { toast.show(e instanceof Error ? e.message : 'Update failed.', true); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (!selected) return;
    setBusy(true);
    try {
      await adminFetch(`/admin/inquiries/${selected.id}`, { method: 'DELETE' });
      toast.show('Inquiry deleted.');
      setSelected(null);
      load();
    } catch (e) { toast.show(e instanceof Error ? e.message : 'Delete failed.', true); }
    finally { setBusy(false); }
  }

  async function exportCsv() {
    try { await adminDownload(`/admin/inquiries/export.csv?${qs}`, 'velvet-vine-inquiries.csv'); }
    catch (e) { toast.show(e instanceof Error ? e.message : 'Export failed.', true); }
  }

  const subjectLabel = (t: string) => SUBJECTS.find((x) => x.value === t)?.label ?? t;
  const replyBody = selected
    ? `Hi ${selected.name.split(' ')[0]},\n\nThank you for getting in touch with Velvet Vine${selected.productName ? ` about ${selected.productName}` : ''}.\n\n`
    : '';
  const replyHref = selected ? `mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.productName ? selected.productName : subjectLabel(selected.subject)} · Velvet Vine`)}&body=${encodeURIComponent(replyBody)}` : '#';

  return (
    <>
      <div className="adm-head">
        <div><h1 className="adm-h1">Inquiries</h1><p className="adm-sub">Messages from the Contact page and “Ask About This Wine” inquiries from the collection. Reply by email (or phone, if they left a number), then mark them Responded.</p></div>
        <button type="button" className="adm-btn ghost" onClick={exportCsv}>Export CSV</button>
      </div>

      <div className="adm-toolbar">
        <input className="input" type="search" placeholder="Search name, email, phone, wine, reference or message…" aria-label="Search inquiries" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" aria-label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option value="all">All subjects</option>
          {SUBJECTS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select className="input" aria-label="Sent from" value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="all">Both forms</option><option value="contact">Contact page</option><option value="product">Wine inquiry dialog</option>
        </select>
        <select className="input" aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select className="input" aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
          <option value="newest">Newest first</option><option value="oldest">Oldest first</option>
        </select>
      </div>

      {error ? <ErrorPanel message={error} onRetry={load} /> : !data ? <TableSkeleton cols={5} /> : data.items.length === 0 ? (
        <div className="adm-empty">{q || status !== 'all' || subject !== 'all' || source !== 'all' ? 'No inquiries match these filters.' : 'No inquiries yet. They’ll appear here as soon as someone uses the contact form or asks about a wine.'}</div>
      ) : (
        <>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th scope="col">Received</th><th scope="col">From</th><th scope="col">Subject</th><th scope="col">Wine</th><th scope="col">Status</th></tr></thead>
              <tbody>
                {data.items.map((i) => (
                  <tr key={i.id} className={`clickable ${selected?.id === i.id ? 'selected' : ''}`} onClick={() => openRow(i)} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') openRow(i); }}>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(i.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}<br /><span className="hint">{i.reference}</span></td>
                    <td><strong>{i.name}</strong><br /><span className="hint" style={{ wordBreak: 'break-all' }}>{i.email}</span></td>
                    <td>{subjectLabel(i.subject)}<br /><span className="hint">{i.source === 'product' ? 'Wine dialog' : 'Contact page'}</span></td>
                    <td>{i.productName ?? <span className="hint">—</span>}</td>
                    <td><span className={`pill pill-${i.status}`}>{i.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pager">
            <span>{data.total} total · page {data.page} of {data.pages}</span>
            <button type="button" className="adm-btn ghost sm" disabled={data.page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
            <button type="button" className="adm-btn ghost sm" disabled={data.page >= data.pages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </>
      )}

      {selected && (
        <Drawer
          title={selected.name}
          onClose={close}
          footer={
            <>
              {confirmDelete ? (
                <span style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13 }}>Delete permanently?</span>
                  <button type="button" className="adm-btn danger sm" disabled={busy} onClick={remove}>Yes, delete</button>
                  <button type="button" className="adm-btn ghost sm" onClick={() => setConfirmDelete(false)}>Cancel</button>
                </span>
              ) : <button type="button" className="adm-btn danger ghost sm" onClick={() => setConfirmDelete(true)}>Delete</button>}
              <a className="adm-btn" href={replyHref}>Reply by email</a>
            </>
          }
        >
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className={`pill pill-${selected.status}`}>{selected.status}</span>
            <span className="hint">{selected.reference} · {new Date(selected.createdAt).toLocaleString()}</span>
          </div>
          <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 20px', margin: 0, fontSize: 15 }}>
            <dt className="hint">Subject</dt><dd style={{ margin: 0 }}>{subjectLabel(selected.subject)}</dd>
            <dt className="hint">Sent from</dt><dd style={{ margin: 0 }}>{selected.source === 'product' ? 'Wine inquiry dialog' : 'Contact page'}</dd>
            <dt className="hint">Wine</dt><dd style={{ margin: 0 }}>{selected.productName ?? '—'}</dd>
            <dt className="hint">Email</dt><dd style={{ margin: 0, wordBreak: 'break-all' }}><a href={`mailto:${selected.email}`}>{selected.email}</a></dd>
            <dt className="hint">Phone</dt><dd style={{ margin: 0 }}>{selected.phone ? <a href={`tel:${selected.phone.replace(/[^\d+]/g, '')}`}>{selected.phone}</a> : '—'}</dd>
          </dl>
          <div className="adm-card">
            <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Message</p>
            <p className="prose-copy" style={{ fontSize: 15, lineHeight: 1.6 }}>{selected.message || <span className="hint">No message.</span>}</p>
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Status</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} role="group" aria-label="Set status">
              {STATUSES.map((s) => (
                <button key={s.value} type="button" className={`adm-btn sm ${selected.status === s.value ? '' : 'ghost'}`} aria-pressed={selected.status === s.value} disabled={busy || selected.status === s.value} onClick={() => update({ status: s.value }, `Marked as ${s.label.toLowerCase()}.`)}>{s.label}</button>
              ))}
            </div>
          </div>
          <div className="field">
            <label htmlFor="notes">Internal notes</label>
            <textarea id="notes" className="input" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
            <div><button type="button" className="adm-btn ghost sm" disabled={busy || notes === (selected.adminNotes ?? '')} onClick={() => update({ adminNotes: notes }, 'Notes saved.')}>Save notes</button></div>
          </div>
        </Drawer>
      )}
      {toast.node}
    </>
  );
}

export default function InquiriesPage() {
  return <Suspense fallback={<TableSkeleton cols={5} />}><InquiriesInner /></Suspense>;
}
