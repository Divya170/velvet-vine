'use client';

import { EntityManager } from '@/components/admin/EntityManager';
import { mediaUrl } from '@/lib/api';
import { ICON_OPTIONS, TINT_OPTIONS } from '@/lib/admin-options';

const TYPES = [
  { value: 'page_copy', label: 'Page copy' },
  { value: 'hero_slide', label: 'Homepage hero photo' },
  { value: 'experience_item', label: 'Home: experience highlight' },
  { value: 'philosophy_item', label: 'About: principle' },
  { value: 'store_point', label: 'About: store point' },
];
const TINTS = [{ value: '', label: 'Default' }, ...TINT_OPTIONS];
const typeLabel = (t: string) => TYPES.find((x) => x.value === t)?.label ?? t;
type V = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
/** Page-copy blocks whose section shows one, two or three photos. */
const IMAGE_KEYS = ['home_intro', 'home_experience', 'wines_hero', 'about_hero', 'about_store', 'selections_hero', 'gallery_hero'];
const IMAGE2_KEYS = ['home_intro', 'home_experience', 'about_store'];
const IMAGE3_KEYS = ['home_experience', 'about_store'];
const hasPhoto = (v: V) => v.type === 'hero_slide' || IMAGE_KEYS.includes(v.key);
const is = (...t: string[]) => (v: V) => t.includes(v.type);
const key = (...k: string[]) => (v: V) => k.includes(v.key);
const has = (f: string) => (v: V) => v.type === 'page_copy' && typeof v.fields?.[f] === 'string';

export default function ContentAdmin() {
  return (
    <EntityManager
      title="Page content"
      singular="Content block"
      subtitle="Headings, paragraphs, hero photos and editorial sections across the site. Wrap words in *asterisks* to show them in the italic burgundy accent. Clear a “Client to supply” note once the real copy is approved. Don’t add founding dates, awards, statistics or testimonials unless Velvet Vine has supplied and verified them."
      endpoint="/admin/content"
      searchPlaceholder="Search titles, text or keys…"
      filters={[{ name: 'type', label: 'Type', options: TYPES }]}
      defaults={{ type: 'experience_item', key: '', title: '', body: '', fields: { eyebrow: '', clientNote: '', tint: '', icon: 'glass', numeral: '' }, published: true }}
      fields={[
        { name: 'type', label: 'Type', type: 'select', options: TYPES, createOnly: true, required: true },
        { name: 'key', label: 'Key', type: 'text', nullable: true, createOnly: true, showIf: is('page_copy'), help: 'Page copy is looked up by key (e.g. home_hero). Existing keys are already created.' },
        { name: 'title', label: 'Title / heading', type: 'textarea', required: true, help: 'Wrap words in *asterisks* for the accent, e.g. “Discover the Art of *Fine Wine.*” For hero photos, this is the photo description.' },
        { name: 'body', label: 'Body text', type: 'textarea', nullable: true, showIf: (v) => v.type !== 'hero_slide' && v.type !== 'store_point' },
        { name: 'fields.eyebrow', label: 'Small label above the heading', type: 'text', showIf: is('page_copy') },
        { name: 'fields.body2', label: 'Second paragraph', type: 'textarea', showIf: has('body2') },
        { name: 'fields.extra', label: 'Third paragraph', type: 'textarea', showIf: key('about_story') },
        { name: 'fields.quote', label: 'Pull quote', type: 'text', showIf: key('about_story'), help: 'Leave empty to hide the quote.' },
        { name: 'fields.quoteNote', label: 'Pull quote caption', type: 'text', showIf: key('about_story') },
        { name: 'fields.cta', label: 'Button / link text', type: 'text', showIf: has('cta') },
        { name: 'fields.cta2', label: 'Second button text', type: 'text', showIf: has('cta2') },
        { name: 'fields.side', label: 'Vertical side caption', type: 'text', showIf: key('home_intro') },
        { name: 'fields.icon', label: 'Icon', type: 'select', options: ICON_OPTIONS, showIf: is('experience_item', 'philosophy_item', 'store_point') },
        { name: 'fields.numeral', label: 'Numeral', type: 'text', showIf: is('philosophy_item'), help: 'e.g. “I”. Leave empty to number automatically.' },
        { name: 'fields.alt', label: 'Main photo description (alt text)', type: 'text', showIf: (v) => IMAGE_KEYS.includes(v.key) },
        { name: 'fields.alt2', label: 'Second photo description', type: 'text', showIf: (v) => IMAGE2_KEYS.includes(v.key) },
        { name: 'fields.alt3', label: 'Third photo description', type: 'text', showIf: (v) => IMAGE3_KEYS.includes(v.key) },
        { name: 'fields.tint', label: 'Placeholder tint', type: 'select', options: TINTS, showIf: is('hero_slide') },
        { name: 'fields.clientNote', label: '“Client to supply” note', type: 'textarea', showIf: (v) => v.type === 'page_copy', help: 'Shown on the site as a dashed placeholder note. Clear it to hide.' },
        { name: 'sortOrder', label: 'Display order', type: 'number' },
        { name: 'published', label: 'Published', type: 'boolean' },
      ]}
      columns={[
        { label: 'Type', render: (r) => typeLabel(r.type) },
        { label: 'Key', render: (r) => (r.key ? <code style={{ fontSize: 12 }}>{r.key}</code> : '—') },
        { label: 'Title', render: (r) => <><span style={{ display: 'block', maxWidth: 420 }}>{String(r.title).slice(0, 90)}</span>{r.fields?.clientNote && <span className="pill pill-todo">Needs content</span>}</> },
        { label: 'Photo', render: (r) => (r.fields?.imageUrl ? <img className="thumb" src={mediaUrl(r.fields.imageUrl) ?? ''} alt="" /> : hasPhoto(r) ? <div className="thumb-ph" /> : '—') }, // eslint-disable-line @next/next/no-img-element
        { label: 'Status', render: (r) => <span className={`pill ${r.published ? 'pill-on' : 'pill-off'}`}>{r.published ? 'Published' : 'Hidden'}</span> },
      ]}
      image={{
        getUrl: (r) => r.fields?.imageUrl,
        hint: 'JPG, PNG, WebP or AVIF, up to 8 MB. Upload genuine photos of Velvet Vine only — never stock images presented as the boutique.',
        slots: [
          { slot: '', label: 'Photo', getUrl: (r) => r.fields?.imageUrl, show: hasPhoto },
          { slot: 'image2Url', label: 'Second photo', getUrl: (r) => r.fields?.image2Url, show: (r) => IMAGE2_KEYS.includes(r.key) },
          { slot: 'image3Url', label: 'Third photo', getUrl: (r) => r.fields?.image3Url, show: (r) => IMAGE3_KEYS.includes(r.key) },
        ],
      }}
      emptyText="No content blocks."
      rowLabel={(r) => (r.key ? `${typeLabel(r.type)} · ${r.key}` : `${typeLabel(r.type)} · ${String(r.title).slice(0, 40)}`)}
    />
  );
}
