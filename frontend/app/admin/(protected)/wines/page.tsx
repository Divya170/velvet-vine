'use client';

import { useEffect, useState } from 'react';
import { EntityManager } from '@/components/admin/EntityManager';
import { ErrorPanel, TableSkeleton } from '@/components/admin/ui';
import { mediaUrl } from '@/lib/api';
import { adminFetch } from '@/lib/admin-api';
import type { ProductCategory } from '@/lib/types';
import { TINT_OPTIONS } from '@/lib/admin-options';

export default function WinesAdmin() {
  const [cats, setCats] = useState<ProductCategory[] | null>(null);
  const [err, setErr] = useState('');
  const load = () => { setErr(''); adminFetch<ProductCategory[]>('/admin/product-categories').then(setCats).catch((e) => setErr(e.message)); };
  useEffect(load, []);
  if (err) return <ErrorPanel message={err} onRetry={load} />;
  if (!cats) return <TableSkeleton />;
  const CAT_OPTS = cats.map((c) => ({ value: String(c.id), label: c.name }));

  return (
    <EntityManager
      title="Wines"
      singular="Wine"
      subtitle="The boutique’s wine list. There are deliberately no price, stock, cart or shipping fields: wines are shown for discovery and visitors inquire or visit in store. Region, grape and notes appear on the site only when you fill them in — leave them blank rather than guessing. Turn off “Sample” once a wine is real."
      endpoint="/admin/products"
      searchPlaceholder="Search names, descriptions, regions or grapes…"
      filters={[
        { name: 'categoryId', label: 'Style', options: CAT_OPTS },
        { name: 'status', label: 'Status', options: [{ value: 'published', label: 'Published' }, { value: 'hidden', label: 'Hidden' }, { value: 'featured', label: 'Featured (homepage)' }, { value: 'curated', label: 'In Our Collection' }, { value: 'sample', label: 'Samples' }] },
      ]}
      defaults={{ categoryId: CAT_OPTS[0]?.value ?? '', name: '', description: '', region: '', grapeVariety: '', details: '', imageAlt: '', tint: '', featured: false, curated: true, isSample: false, published: true }}
      fields={[
        { name: 'name', label: 'Wine name', type: 'text', required: true },
        { name: 'categoryId', label: 'Style', type: 'select', options: CAT_OPTS, required: true, numeric: true },
        { name: 'description', label: 'Short description', type: 'textarea' },
        { name: 'region', label: 'Region (only if verified)', type: 'text', nullable: true },
        { name: 'grapeVariety', label: 'Grape variety (only if supplied)', type: 'text', nullable: true },
        { name: 'details', label: 'More details (only if supplied)', type: 'textarea', nullable: true, help: 'Shown in Our Collection’s Wine Details panel, e.g. tasting notes supplied by the boutique.' },
        { name: 'imageAlt', label: 'Photo description (alt text)', type: 'text' },
        { name: 'tint', label: 'Placeholder tint', type: 'select', options: [{ value: '', label: 'Same as style' }, ...TINT_OPTIONS], nullable: true },
        { name: 'featured', label: 'Feature on the homepage', type: 'boolean', help: 'The first four by display order are shown in “Bottles worth a closer look”.' },
        { name: 'curated', label: 'List in Our Collection', type: 'boolean', help: 'Includes this wine in its style’s editorial selection and in Wine Details.' },
        { name: 'isSample', label: 'Sample / placeholder wine', type: 'boolean', help: 'Shows a “Sample” tag on the site.' },
        { name: 'sortOrder', label: 'Display order', type: 'number' },
        { name: 'published', label: 'Published', type: 'boolean' },
      ]}
      columns={[
        { label: 'Photo', render: (r) => (r.imageUrl ? <img className="thumb" src={mediaUrl(r.imageUrl) ?? ''} alt="" /> : <div className="thumb-ph" />) }, // eslint-disable-line @next/next/no-img-element
        { label: 'Wine', render: (r) => <><strong>{r.name}</strong>{r.isSample && <> <span className="pill pill-todo">Sample</span></>}{r.featured && <> <span className="pill pill-on">Featured</span></>}</> },
        { label: 'Style', render: (r) => r.category?.name ?? '—' },
        { label: 'Region / grape', render: (r) => [r.region, r.grapeVariety].filter(Boolean).join(' · ') || <span className="hint">Not supplied</span> },
        { label: 'Status', render: (r) => <span className={`pill ${r.published ? 'pill-on' : 'pill-off'}`}>{r.published ? 'Published' : 'Hidden'}</span> },
      ]}
      image={{ getUrl: (r) => r.imageUrl, hint: 'JPG, PNG, WebP or AVIF, up to 8 MB. Use genuine photos of this bottle.' }}
      emptyText={cats.length ? 'No wines yet. Add the first one.' : 'Add a wine style first.'}
      rowLabel={(r) => r.name}
    />
  );
}
