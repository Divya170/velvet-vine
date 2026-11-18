'use client';

import { useRouter } from 'next/navigation';

export function RetryButton({ reset }: { reset?: () => void }) {
  const router = useRouter();
  return (
    <button type="button" className="btn" onClick={() => { reset?.(); router.refresh(); }}>
      Try Again <span className="arr" aria-hidden="true">→</span>
    </button>
  );
}
