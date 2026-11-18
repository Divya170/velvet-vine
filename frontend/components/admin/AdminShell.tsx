'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminFetch, token } from '@/lib/admin-api';

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/inquiries', label: 'Inquiries', badge: true },
  { href: '/admin/wines', label: 'Wines' },
  { href: '/admin/categories', label: 'Wine styles & selections' },
  { href: '/admin/gallery', label: 'Gallery' },
  { href: '/admin/content', label: 'Page content' },
  { href: '/admin/settings', label: 'Settings' },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [admin, setAdmin] = useState<{ email: string; name: string } | null>(null);
  const [newCount, setNewCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!token.get()) {
      router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    adminFetch<{ email: string; name: string }>('/admin-auth/me')
      .then((me) => { setAdmin(me); setReady(true); })
      .catch(() => router.replace('/admin/login'));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setOpen(false);
    if (!ready) return;
    adminFetch<{ new: number }>('/admin/inquiries/stats').then((s) => setNewCount(s.new)).catch(() => undefined);
  }, [pathname, ready]);

  if (!ready) {
    return <div className="login-wrap" role="status" aria-live="polite"><p style={{ color: '#E7DCD2' }}>Checking your session…</p></div>;
  }

  const active = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));
  const signOut = () => { token.clear(); router.replace('/admin/login'); };

  return (
    <div className="adm">
      <div className="adm-top">
        <span className="serif" style={{ fontSize: 20 }}>Velvet Vine · Admin</span>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="adm-side">{open ? 'Close' : 'Menu'}</button>
      </div>
      <aside id="adm-side" className={`adm-side ${open ? 'open' : ''}`} aria-label="Admin navigation">
        <div className="adm-brand">Velvet Vine<small>Shop admin</small></div>
        <nav className="adm-nav">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={active(n.href) ? 'page' : undefined}>
              {n.label}
              {n.badge && newCount > 0 && <span className="adm-badge" aria-label={`${newCount} new`}>{newCount}</span>}
            </Link>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid rgba(220,215,205,.18)', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
          <Link href="/" target="_blank">View website ↗</Link>
          <span style={{ color: '#CDBFB6', wordBreak: 'break-all' }}>{admin?.email}</span>
          <button type="button" className="adm-btn ghost sm" style={{ color: '#F5F0E7', borderColor: 'rgba(247,243,233,.4)' }} onClick={signOut}>Sign out</button>
        </div>
      </aside>
      {open && <div className="drawer-back" style={{ zIndex: 45 }} onClick={() => setOpen(false)} aria-hidden="true" />}
      <main className="adm-main" id="main">{children}</main>
    </div>
  );
}
