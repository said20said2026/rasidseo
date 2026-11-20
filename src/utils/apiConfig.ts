export const PRIMARY_SITE_DOMAIN = 'https://www.rasidseo.site';

/**
 * Resolves the API server base URL.
 * - Uses VITE_API_BASE_URL if provided at build time (e.g., when frontend & backend live on separate hosts).
 * - Uses optional localStorage override (`rasid_api_base_url`) if configured.
 * - Defaults to same-origin (`""`) so requests go to `/api/...` on `https://www.rasidseo.site` (Vercel Serverless)
 *   or the Express server on AI Studio / localhost.
 */
export function getApiBaseUrl(): string {
  const envUrl =
    typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_API_BASE_URL as string | undefined)
      : undefined;

  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem('rasid_api_base_url');
      if (stored && stored.trim()) {
        return stored.trim().replace(/\/+$/, '');
      }
    } catch {
      // Ignore storage errors
    }
  }

  return '';
}

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = getApiBaseUrl();
  return base ? `${base}${normalizedPath}` : normalizedPath;
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const primaryUrl = apiUrl(path);
  const resp = await fetch(primaryUrl, init);

  // If primary same-origin /api/* returned 404 (e.g. static host without serverless routing)
  // and a fallback backend URL is configured, retry on the fallback backend.
  if (resp.status === 404 && !getApiBaseUrl()) {
    const fallbackUrl =
      typeof import.meta !== 'undefined' && import.meta.env
        ? (import.meta.env.VITE_FALLBACK_API_URL as string | undefined)
        : undefined;
    if (fallbackUrl && fallbackUrl.trim()) {
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      const cleanFallback = fallbackUrl.trim().replace(/\/+$/, '');
      return fetch(`${cleanFallback}${normalizedPath}`, init);
    }
  }

  return resp;
}

export async function parseJsonSafely<T = any>(resp: Response): Promise<{ ok: boolean; status: number; data: T | null; isHtmlOrTextError: boolean }> {
  const contentType = resp.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = (await resp.json()) as T;
    return { ok: resp.ok, status: resp.status, data, isHtmlOrTextError: false };
  }

  // Response is not JSON (e.g., 404 NOT_FOUND HTML/text page from static host)
  return { ok: false, status: resp.status, data: null, isHtmlOrTextError: true };
}
