'use client';

import Link from 'next/link';
import { RetryButton } from './RetryButton';

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="main" className="wrap section" style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start' }}>
      <p className="label">Something went wrong</p>
      <h1 className="h2" style={{ margin: 0 }}>This page couldn’t load.</h1>
      <p className="lead" style={{ maxWidth: 520 }}>Please try again. If it keeps happening, you can still reach the boutique from the Contact page.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <RetryButton reset={reset} />
        <Link className="btn btn-ghost" href="/contact">Contact the Boutique</Link>
      </div>
    </main>
  );
}
