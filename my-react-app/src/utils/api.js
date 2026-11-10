export const API = import.meta.env.VITE_API_URL || '';

/** Build an /api/<endpoint> URL with the given query params (undefined/null skipped). */
export function apiUrl(endpoint, params = {}) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
  }
  return `${API}/api/${endpoint}?${q}`;
}

/**
 * Start a file download without buffering it in browser memory.
 * A hidden iframe lets the browser stream the response straight to disk (the
 * server replies with Content-Disposition: attachment) and, unlike navigating
 * the page, can never navigate the SPA away if the API replies with an error.
 */
export function startDownload(href) {
  const frame = document.createElement('iframe');
  frame.style.display = 'none';
  frame.setAttribute('aria-hidden', 'true');
  frame.src = href;
  document.body.appendChild(frame);
  setTimeout(() => frame.remove(), 10 * 60 * 1000);
}
