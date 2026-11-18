'use client';

import { EntityManager } from '@/components/admin/EntityManager';
import { mediaUrl } from '@/lib/api';
import { TINT_OPTIONS } from '@/lib/admin-options';

export default function CategoriesAdmin() {
  return (
    <EntityManager
      title="Wine styles & selections"
      singular="Style"
      subtitle="Styles drive the Wine Collection filters, the homepage “Begin with a style” row and the footer links; each style also has an editorial selection on Our Collection. A style appears only while it is published and has at least one published wine; its selection appears only while it lists at least one wine marked “List in Our Collection”. The link (/wines?category=…) is fixed when the style is created."
      endpoint="/admin/product-categories"
      searchPlaceholder="Search styles…"
      defaults={{ name: '', shortName: '', blurb: '', imageAlt: '', tint: 'plain', selectionTitle: '', selectionBody: '', selectionPublished: true, published: true }}
      fields={[
        { name: 'name', label: 'Style name', type: 'text', required: true, help: 'e.g. “Red Wines”.' },
        { name: 'shortName', label: 'Short label', type: 'text', help: 'Used on wine cards and labels, e.g. “Red”.' },
        { name: 'blurb', label: 'Short description', type: 'textarea', help: 'One line on the homepage tile and above the filtered collection, e.g. “Deep, structured and expressive.”' },
        { name: 'imageAlt', label: 'Photo description (alt text)', type: 'text', help: 'The photo is used on the homepage tile and as the Our Collection selection photograph.' },
        { name: 'tint', label: 'Placeholder tint', type: 'select', options: TINT_OPTIONS, help: 'Only used while no photo is uploaded.' },
        { name: 'selectionTitle', label: 'Our Collection: selection title', type: 'text', help: 'Wrap the words to emphasise in *asterisks*, e.g. “Red Wine *Selection.*”' },
        { name: 'selectionBody', label: 'Our Collection: selection description', type: 'textarea' },
        { name: 'selectionPublished', label: 'Show this selection on Our Collection', type: 'boolean' },
        { name: 'sortOrder', label: 'Display order', type: 'number' },
        { name: 'published', label: 'Published', type: 'boolean' },
      ]}
      columns={[
        { label: 'Photo', render: (r) => (r.imageUrl ? <img className="thumb" src={mediaUrl(r.imageUrl) ?? ''} alt="" /> : <div className="thumb-ph" />) }, // eslint-disable-line @next/next/no-img-element
        { label: 'Style', render: (r) => <><strong>{r.name}</strong><br /><code style={{ fontSize: 12 }}>?category={r.slug}</code></> },
        { label: 'Wines', render: (r) => r.productCount ?? 0 },
        { label: 'Selection', render: (r) => <span className={`pill ${r.selectionPublished ? 'pill-on' : 'pill-off'}`}>{r.selectionPublished ? 'On' : 'Off'}</span> },
        { label: 'Status', render: (r) => <span className={`pill ${r.published ? 'pill-on' : 'pill-off'}`}>{r.published ? (r.productCount ? 'Published' : 'Published · hidden until it has wines') : 'Hidden'}</span> },
      ]}
      image={{ getUrl: (r) => r.imageUrl }}
      emptyText="No styles yet. Add one before adding wines."
      rowLabel={(r) => r.name}
    />
  );
}
