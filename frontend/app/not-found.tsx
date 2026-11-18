import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="main" className="wrap section"  style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start' }}>
      <p className="label">404</p>
      <h1 className="h2" style={{ margin: 0 }}>We couldn’t find that page.</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <Link className="btn" href="/">Back to Home</Link>
        <Link className="btn btn-ghost" href="/wines">Explore the Wine Collection</Link>
      </div>
    </main>
  );
}
