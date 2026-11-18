import Link from 'next/link';

export function Breadcrumbs({ current, light }: { current: string; light?: boolean }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol style={{ listStyle: 'none', display: 'flex', gap: 12, margin: 0, padding: 0, fontSize: 11.5, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: light ? '#CDBFB6' : '#6E675F' }}>
        <li><Link href="/" style={{ color: 'inherit', display: 'inline-flex', minHeight: 32, alignItems: 'center' }}>Home</Link></li>
        <li aria-hidden="true" style={{ display: 'flex', alignItems: 'center', color: '#B49A68' }}>/</li>
        <li aria-current="page" style={{ display: 'flex', alignItems: 'center', color: light ? '#D9C08F' : '#541C2B' }}>{current}</li>
      </ol>
    </nav>
  );
}
