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

/**
 * Подробное сообщение об ошибке из ответа API для показа админу/клиенту.
 * Бэкенд отдаёт конверт: message может быть строкой, массивом (валидация
 * class-validator) или объектом {message, code}. err.error — общее имя
 * («Conflict») — используем только как fallback.
 */
export function extractErrorMessage(err: any, status: number): string {
  const m = err?.message;
  if (Array.isArray(m) && m.length > 0) return m.join('; ');
  if (m && typeof m === 'object' && typeof m.message === 'string') return m.message;
  if (typeof m === 'string' && m) return m;
  const e = err?.error;
  if (typeof e === 'string' && e) return `${e} (HTTP ${status})`;
  return `HTTP ${status}`;
}
