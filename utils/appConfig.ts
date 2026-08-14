/**
 * Application origin (`BASE_URL`) resolution from environment.
 */

function normalizeBaseUrlCandidate(raw: string): string | null {
  const normalized = raw.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
  if (
    !normalized ||
    normalized.toLowerCase() === 'undefined' ||
    normalized.toLowerCase() === 'null' ||
    !/^https?:\/\//i.test(normalized)
  ) {
    return null;
  }
  return normalized;
}

/** Resolve app origin from an optional override, then required `BASE_URL` env. */
export function resolveBaseUrl(raw?: string): string {
  if (raw != null) {
    const fromArg = normalizeBaseUrlCandidate(raw);
    if (fromArg) return fromArg;
  }

  const fromEnv = normalizeBaseUrlCandidate(process.env.BASE_URL ?? '');
  if (fromEnv) return fromEnv;

  throw new Error(
    'BASE_URL is required. Set the BASE_URL environment variable in `.env`.'
  );
}

/** Origin only (scheme + host + port), for host-matching helpers. */
export function resolveAppOrigin(raw?: string): string {
  const base = resolveBaseUrl(raw);
  try {
    return new URL(base).origin;
  } catch {
    return base;
  }
}