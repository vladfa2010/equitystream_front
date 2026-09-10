/**
 * ТЗ-4 Задача 3.1: the session lives in the httpOnly `session` cookie —
 * the browser sends it automatically (credentials: 'include'), so no
 * Authorization header is ever built in JS. Задача 3.4: an expired session
 * (401 on a non-auth endpoint) redirects to the login page.
 */
export const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (res.status === 401 && !endpoint.startsWith('/auth/')) {
    const hash = window.location.hash;
    if (hash && hash !== '#/' && !hash.startsWith('#/reset-password')) {
      window.location.hash = '#/';
    }
  }
  return res;
}
