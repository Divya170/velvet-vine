'use client';

import { ApiError, apiBase } from './api';

const KEY = 'sc_admin_token';

export const token = {
  get: () => (typeof window === 'undefined' ? null : window.localStorage.getItem(KEY)),
  set: (t: string) => window.localStorage.setItem(KEY, t),
  clear: () => window.localStorage.removeItem(KEY),
};

/** Authenticated admin request. A 401 clears the session and sends the admin back to /admin/login. */
export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const t = token.get();
  let res: Response;
  try {
    res = await fetch(`${apiBase()}${path}`, {
      ...init,
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...(init.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(0, { message: 'Can’t reach the API. Is the backend running?' });
  }
  if (res.status === 401 && !path.startsWith('/admin-auth/login')) {
    token.clear();
    if (!window.location.pathname.startsWith('/admin/login')) window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
  }
  const text = await res.text();
  let data: unknown = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) throw new ApiError(res.status, (data as never) ?? null);
  return data as T;
}

export async function adminDownload(path: string, filename: string) {
  const res = await fetch(`${apiBase()}${path}`, { headers: { Authorization: `Bearer ${token.get() ?? ''}` } });
  if (!res.ok) throw new ApiError(res.status, { message: 'Export failed.' });
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function uploadImage<T>(path: string, file: File) {
  const fd = new FormData();
  fd.append('file', file);
  return adminFetch<T>(path, { method: 'POST', body: fd });
}
