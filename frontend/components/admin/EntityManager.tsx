'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError, mediaUrl } from '@/lib/api';
import { adminFetch, uploadImage } from '@/lib/admin-api';
import { Drawer, ErrorPanel, TableSkeleton, useDebounced, useToast } from './ui';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = { id: number } & Record<string, any>;

export interface FieldDef {
  /** Dotted names write into a JSON object, e.g. "fields.eyebrow". */
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'list' | 'pairs' | 'color';
  options?: { value: string; label: string }[];
  help?: string;
  required?: boolean;
  createOnly?: boolean;
  nullable?: boolean;
  /** Send a select's value as a number (e.g. a foreign key). */
  numeric?: boolean;
  showIf?: (values: Record<string, any>) => boolean;
}

export interface ColumnDef {
  label: string;
  render: (row: Row) => React.ReactNode;
}

interface Props {
  title: string;
  subtitle?: string;
  singular: string;
  endpoint: string;
  fields: FieldDef[];
  columns: ColumnDef[];
  defaults: Record<string, any>;
  filters?: { name: string; label: string; options: { value: string; label: string }[] }[];
  searchPlaceholder?: string;
  /** One photo per row, or several named slots (sent as ?slot=…) — e.g. a page section with secondary photos. */
  image?: {
    getUrl: (row: Row) => string | null | undefined; removable?: boolean; hint?: string; label?: string;
    slots?: { slot: string; label: string; getUrl: (row: Row) => string | null | undefined; show?: (row: Row) => boolean }[];
  };
  emptyText: string;
  rowLabel: (row: Row) => string;
  /** Query params always sent (e.g. type=faq to manage one content type on its own page). */
  fixedQuery?: Record<string, string>;
}

const get = (obj: Record<string, any>, path: string) => path.split('.').reduce<any>((o, k) => (o == null ? undefined : o[k]), obj);
function set(obj: Record<string, any>, path: string, value: any) {
  const keys = path.split('.');
  const out = { ...obj };
  let cur: Record<string, any> = out;
  keys.slice(0, -1).forEach((k) => { cur[k] = { ...(cur[k] ?? {}) }; cur = cur[k]; });
  cur[keys[keys.length - 1]] = value;
  return out;
}

export function EntityManager({ title, subtitle, singular, endpoint, fields, columns, defaults, filters = [], searchPlaceholder = 'Search…', image, emptyText, rowLabel, fixedQuery }: Props) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [filterVals, setFilterVals] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<Row | 'new' | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();
  const q = useDebounced(search);

  const query = useMemo(() => {
    const p = new URLSearchParams(fixedQuery);
    if (q.trim()) p.set('search', q.trim());
    Object.entries(filterVals).forEach(([k, v]) => { if (v) p.set(k, String(v)); });
    const s = p.toString();
    return s ? `?${s}` : '';
  }, [q, filterVals, fixedQuery ? JSON.stringify(fixedQuery) : '']); // eslint-disable-line react-hooks/exhaustive-deps

  const load = useCallback(async () => {
    setLoadError('');
    try {
      setRows(await adminFetch<Row[]>(`${endpoint}${query}`));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Could not load.');
    }
  }, [endpoint, query]);

  useEffect(() => { setRows(null); load(); }, [load]);

  const open = (row: Row | 'new') => {
    setEditing(row);
    setErrors({});
    setFormError('');
    setConfirmDelete(false);
    if (row === 'new') setValues({ ...defaults });
    else {
      let v: Record<string, any> = {};
      fields.forEach((f) => {
        const cur = get(row, f.name);
        v = set(v, f.name, f.type === 'list' ? (cur ?? []).join('\n') : f.type === 'pairs' ? ((cur ?? []) as { label: string; value: string }[]).map((p) => `${p.label}: ${p.value}`).join('\n') : f.numeric && cur != null ? String(cur) : cur ?? (f.type === 'boolean' ? false : ''));
      });
      setValues(v);
    }
  };
  const close = useCallback(() => setEditing(null), []);

  function payload() {
    let out: Record<string, any> = {};
    for (const f of fields) {
      if (editing !== 'new' && f.createOnly) continue;
      if (f.showIf && !f.showIf(values)) continue;
      let v = get(values, f.name);
      if (f.type === 'number' || f.numeric) v = v === '' || v == null ? undefined : Number(v);
      if (f.type === 'list') v = String(v ?? '').split('\n').map((s) => s.trim()).filter(Boolean);
      if (f.type === 'pairs') v = String(v ?? '').split('\n').map((s) => s.trim()).filter(Boolean).map((line) => { const i = line.indexOf(':'); return i < 0 ? { label: line, value: '' } : { label: line.slice(0, i).trim(), value: line.slice(i + 1).trim() }; });
      if (f.type === 'boolean') v = !!v;
      if ((f.type === 'text' || f.type === 'textarea' || f.type === 'select') && typeof v === 'string' && v.trim() === '' && f.nullable) v = null;
      if (v === undefined) continue;
      out = set(out, f.name, v);
    }
    return out;
  }

  function validate() {
    const e: Record<string, string> = {};
    for (const f of fields) {
      if (!f.required || (editing !== 'new' && f.createOnly)) continue;
      const v = get(values, f.name);
      if (v == null || String(v).trim() === '') e[f.name] = `${f.label} is required.`;
    }
    return e;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const ce = validate();
    setErrors(ce);
    setFormError('');
    if (Object.keys(ce).length) return;
    setSaving(true);
    try {
      const body = JSON.stringify(payload());
      const saved = editing === 'new'
        ? await adminFetch<Row>(endpoint, { method: 'POST', body })
        : await adminFetch<Row>(`${endpoint}/${(editing as Row).id}`, { method: 'PATCH', body });
      toast.show(`${singular} saved.`);
      await load();
      if (editing === 'new') open(saved); // stay open so an image can be added
      else setEditing(saved);
    } catch (err) {
      if (err instanceof ApiError) { setErrors(err.fieldErrors); setFormError(err.message); }
      else setFormError('Save failed.');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (editing === 'new' || !editing) return;
    setSaving(true);
    try {
      await adminFetch(`${endpoint}/${editing.id}`, { method: 'DELETE' });
      toast.show(`${singular} deleted.`);
      setEditing(null);
      await load();
    } catch (err) {
      toast.show(err instanceof Error ? err.message : 'Delete failed.', true);
    } finally {
      setSaving(false);
    }
  }

  const slotQ = (slot?: string) => (slot ? `?slot=${encodeURIComponent(slot)}` : '');

  async function onUpload(file?: File | null, slot?: string) {
    if (!file || editing === 'new' || !editing) return;
    setUploading(true);
    try {
      const saved = await uploadImage<Row>(`${endpoint}/${editing.id}/image${slotQ(slot)}`, file);
      setEditing(saved);
      toast.show('Image uploaded.');
      load();
    } catch (err) {
      toast.show(err instanceof Error ? err.message : 'Upload failed.', true);
    } finally {
      setUploading(false);
    }
  }

  async function removeImage(slot?: string) {
    if (editing === 'new' || !editing) return;
    setUploading(true);
    try {
      const saved = await adminFetch<Row>(`${endpoint}/${editing.id}/image${slotQ(slot)}`, { method: 'DELETE' });
      setEditing(saved);
      toast.show('Image removed — a placeholder will show instead.');
      load();
    } catch (err) {
      toast.show(err instanceof Error ? err.message : 'Could not remove the image.', true);
    } finally {
      setUploading(false);
    }
  }

  async function togglePublished(row: Row) {
    try {
      await adminFetch(`${endpoint}/${row.id}`, { method: 'PATCH', body: JSON.stringify({ published: !row.published }) });
      toast.show(row.published ? 'Hidden from the website.' : 'Published on the website.');
      load();
    } catch (err) {
      toast.show(err instanceof Error ? err.message : 'Update failed.', true);
    }
  }

  const photoSlots = image
    ? (image.slots ?? [{ slot: '', label: image.label ?? 'Photo', getUrl: image.getUrl }]).filter((sl) => !sl.show || (editing && editing !== 'new' && sl.show(editing)))
    : [];
  const hasPublished = fields.some((f) => f.name === 'published');

  return (
    <>
      <div className="adm-head">
        <div>
          <h1 className="adm-h1">{title}</h1>
          {subtitle && <p className="adm-sub">{subtitle}</p>}
        </div>
        <button type="button" className="adm-btn" onClick={() => open('new')}>+ Add {singular.toLowerCase()}</button>
      </div>

      <div className="adm-toolbar">
        <input className="input" type="search" placeholder={searchPlaceholder} aria-label={`Search ${title.toLowerCase()}`} value={search} onChange={(e) => setSearch(e.target.value)} />
        {filters.map((f) => (
          <select key={f.name} className="input" aria-label={f.label} value={filterVals[f.name] ?? ''} onChange={(e) => setFilterVals((p) => ({ ...p, [f.name]: e.target.value }))}>
            <option value="">{f.label}: all</option>
            {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ))}
      </div>

      {loadError ? <ErrorPanel message={loadError} onRetry={load} /> : rows === null ? <TableSkeleton cols={columns.length + 1} /> : rows.length === 0 ? (
        <div className="adm-empty">
          <p>{q || Object.values(filterVals).some(Boolean) ? 'Nothing matches your search or filters.' : emptyText}</p>
          <button type="button" className="adm-btn" style={{ marginTop: 16 }} onClick={() => open('new')}>+ Add {singular.toLowerCase()}</button>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr>{columns.map((c) => <th key={c.label} scope="col">{c.label}</th>)}<th scope="col"><span className="sr">Actions</span></th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="clickable" onClick={() => open(r)}>
                  {columns.map((c) => <td key={c.label}>{c.render(r)}</td>)}
                  <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    {hasPublished && <button type="button" className="adm-btn ghost sm" onClick={() => togglePublished(r)} style={{ marginRight: 6 }}>{r.published ? 'Hide' : 'Publish'}</button>}
                    <button type="button" className="adm-btn ghost sm" onClick={() => open(r)} aria-label={`Edit ${rowLabel(r)}`}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Drawer
          title={editing === 'new' ? `New ${singular.toLowerCase()}` : rowLabel(editing)}
          onClose={close}
          footer={
            <>
              {editing !== 'new' ? (
                confirmDelete ? (
                  <span style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13 }}>Delete permanently?</span>
                    <button type="button" className="adm-btn danger sm" onClick={remove} disabled={saving}>Yes, delete</button>
                    <button type="button" className="adm-btn ghost sm" onClick={() => setConfirmDelete(false)}>Cancel</button>
                  </span>
                ) : <button type="button" className="adm-btn danger ghost sm" onClick={() => setConfirmDelete(true)}>Delete</button>
              ) : <span />}
              <button type="submit" form="entity-form" className="adm-btn" disabled={saving} aria-busy={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </>
          }
        >
          {formError && <div role="alert" className="notice-error" style={{ fontSize: 14 }}>{formError}</div>}
          <form id="entity-form" onSubmit={save} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {fields.filter((f) => !(editing !== 'new' && f.createOnly)).filter((f) => !f.showIf || f.showIf(values)).map((f) => {
              const id = `f-${f.name.replace(/\./g, '-')}`;
              const v = get(values, f.name);
              const err = errors[f.name];
              const onVal = (val: any) => setValues((p) => set(p, f.name, val));
              if (f.type === 'boolean') {
                return (
                  <div key={f.name}>
                    <label className="check" htmlFor={id}><input id={id} type="checkbox" checked={!!v} onChange={(e) => onVal(e.target.checked)} /><span><strong>{f.label}</strong>{f.help && <span className="hint" style={{ display: 'block' }}>{f.help}</span>}</span></label>
                    {err && <p className="err">{err}</p>}
                  </div>
                );
              }
              return (
                <div className="field" key={f.name}>
                  <label htmlFor={id}>{f.label}{f.required && <span className="req" aria-hidden="true"> *</span>}</label>
                  {f.type === 'textarea' || f.type === 'list' || f.type === 'pairs' ? (
                    <textarea id={id} className="input" rows={f.type === 'list' || f.type === 'pairs' ? 4 : 5} value={v ?? ''} onChange={(e) => onVal(e.target.value)} aria-invalid={!!err} />
                  ) : f.type === 'select' ? (
                    <select id={id} className="input" value={v ?? ''} onChange={(e) => onVal(e.target.value)} aria-invalid={!!err}>
                      {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : f.type === 'color' ? (
                    <div style={{ display: 'flex', gap: 10 }}>
                      <input id={id} type="color" value={v || '#DCD7CD'} onChange={(e) => onVal(e.target.value.toUpperCase())} style={{ width: 56, height: 44, border: '1px solid #8A857B', background: '#fff' }} />
                      <input className="input" aria-label={`${f.label} hex value`} value={v ?? ''} onChange={(e) => onVal(e.target.value)} />
                    </div>
                  ) : (
                    <input id={id} className="input" type={f.type === 'number' ? 'number' : 'text'} value={v ?? ''} onChange={(e) => onVal(e.target.value)} aria-invalid={!!err} />
                  )}
                  {f.help && <p className="hint">{f.help}</p>}
                  {err && <p className="err">{err}</p>}
                </div>
              );
            })}
          </form>

          {image && photoSlots.map((sl) => {
            const imgUrl = editing && editing !== 'new' ? mediaUrl(sl.getUrl(editing)) : null;
            return (
              <div key={sl.slot || 'main'} className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{sl.label}</p>
                {editing === 'new' ? (
                  <p className="hint">Save first, then upload a photo.</p>
                ) : (
                  <>
                    {imgUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imgUrl} alt="" style={{ width: '100%', maxHeight: 260, objectFit: 'cover', background: '#DCD7CD' }} />
                    ) : (
                      <div className="ph" style={{ height: 160 }}><span className="ph-tag">No photo yet — the site shows a labelled placeholder</span></div>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                      <label className="adm-btn ghost sm" style={{ cursor: uploading ? 'wait' : 'pointer' }}>
                        {uploading ? 'Uploading…' : imgUrl ? 'Replace photo' : 'Upload photo'}
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr" disabled={uploading} onChange={(e) => { onUpload(e.target.files?.[0], sl.slot || undefined); e.target.value = ''; }} />
                      </label>
                      {imgUrl && image.removable !== false && <button type="button" className="adm-btn danger ghost sm" onClick={() => removeImage(sl.slot || undefined)} disabled={uploading}>Remove photo</button>}
                    </div>
                    <p className="hint">{image.hint ?? 'JPG, PNG, WebP or AVIF, up to 8 MB. Use genuine photographs of Velvet Vine only.'}</p>
                  </>
                )}
              </div>
            );
          })}
        </Drawer>
      )}
      {toast.node}
    </>
  );
}
