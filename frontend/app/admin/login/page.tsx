'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import { adminFetch, token } from '@/lib/admin-api';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const next = params.get('next')?.startsWith('/admin') ? (params.get('next') as string) : '/admin';

  useEffect(() => { if (token.get()) router.replace(next); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const fe: Record<string, string> = {};
    if (!email.trim()) fe.email = 'Enter your email address.';
    if (!password) fe.password = 'Enter your password.';
    setErrors(fe);
    setError('');
    if (Object.keys(fe).length) return;
    setBusy(true);
    try {
      const res = await adminFetch<{ accessToken: string }>('/admin-auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      token.set(res.accessToken);
      router.replace(next);
    } catch (err) {
      if (err instanceof ApiError) { setErrors(err.fieldErrors); setError(err.message); }
      else setError('Sign-in failed. Please try again.');
      setBusy(false);
    }
  }

  return (
    <main className="login-wrap" id="main">
      <form className="login-card adm" style={{ minHeight: 0, display: 'flex', flexDirection: 'column', gap: 18 }} onSubmit={submit} noValidate>
        <div>
          <p className="label">Velvet Vine</p>
          <h1 className="adm-h1" style={{ marginTop: 10 }}>Admin sign in</h1>
        </div>
        {error && <div role="alert" className="notice-error" style={{ fontSize: 14 }}>{error}</div>}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" className="input" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-err' : undefined} />
          {errors.email && <p id="email-err" className="err">{errors.email}</p>}
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" className="input" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!errors.password} aria-describedby={errors.password ? 'password-err' : undefined} />
          {errors.password && <p id="password-err" className="err">{errors.password}</p>}
        </div>
        <button type="submit" className="btn" disabled={busy} aria-busy={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <a href="/" className="hint">← Back to the website</a>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={null}><LoginForm /></Suspense>;
}
