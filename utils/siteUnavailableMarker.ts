import {existsSync,readFileSync,readdirSync,unlinkSync,writeFileSync,} from "node:fs";
import path from "node:path";
import { resolveAppOrigin } from "./appConfig";

/** Written by global-setup on login failure — applies to all workers. */
export const SITE_UNAVAILABLE_FILE = "site-unavailable.json";

/** Mid-run outages (requestfailed, session recovery) use one file per Playwright parallel worker so worker 0 cannot skip workers 1–4. */
export function siteUnavailableWorkerFile(parallelIndex: number): string {
  return `site-unavailable-w${parallelIndex}.json`;
}

export function clearSiteUnavailableMarker(): void {
  if (existsSync(SITE_UNAVAILABLE_FILE)) {
    unlinkSync(SITE_UNAVAILABLE_FILE);
  }
  const root = process.cwd();
  for (const name of readdirSync(root)) {
    if (/^site-unavailable-w\d+\.json$/i.test(name)) {
      try {
        unlinkSync(path.join(root, name));
      } catch {}
    }
  }
}

export type WriteSiteUnavailableOptions = {
  /** When set, only this worker's tests skip (see `siteUnavailableWorkerFile`). */
  parallelIndex?: number;
};

export function writeSiteUnavailableMarker(
  baseUrl: string,
  message: string,
  options?: WriteSiteUnavailableOptions
): void {
  const fileName =
    options?.parallelIndex !== undefined
      ? siteUnavailableWorkerFile(options.parallelIndex)
      : SITE_UNAVAILABLE_FILE;
  writeFileSync(
    fileName,
    JSON.stringify(
      {
        siteUnavailable: true,
        baseUrl,
        reason: message,
        at: new Date().toISOString(),
        parallelIndex: options?.parallelIndex,
      },
      null,
      2
    )
  );
}

/** Global setup marker first, then this worker's mid-run marker. */
export function readSiteUnavailableReasonForWorker(
  parallelIndex: number
): { baseUrl?: string; reason?: string } | null {
  for (const filePath of [
    SITE_UNAVAILABLE_FILE,
    siteUnavailableWorkerFile(parallelIndex),
  ]) {
    if (!existsSync(filePath)) continue;
    try {
      const raw = readFileSync(filePath, "utf-8");
      return JSON.parse(raw) as { baseUrl?: string; reason?: string };
    } catch {
      return { reason: `Invalid marker file: ${filePath}` };
    }
  }
  return null;
}

/**
 * Chrome / Chromium network errors and related Playwright messages (site unreachable, not app-level 400).
 *
 * Do not treat `net::ERR_ABORTED` as unreachable: Chromium emits it when a navigation is cancelled
 * or superseded (redirect / second goto). That is common under multi-worker runs and must not write
 * `site-unavailable-w*.json` or cascade-skip the rest of that worker's tests.
 */
export function isUnreachableNetworkError(message: string): boolean {
  if (!message || !message.trim()) return false;
  const m = message;
  // Cancelled/superseded navigation — not an outage (see multiworker sanity false skips).
  if (/net::ERR_ABORTED/i.test(m) || /\bERR_ABORTED\b/i.test(m)) return false;
  if (
    /ERR_TIMED_OUT|ERR_CONNECTION_TIMED_OUT|ERR_CONNECTION_REFUSED|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED|ERR_ADDRESS_UNREACHABLE|ERR_NETWORK_CHANGED|ERR_SSL_PROTOCOL_ERROR|ERR_CERT_/i.test(
      m
    )
  ) {
    return true;
  }
  // Remaining net::ERR_* (connection/DNS/SSL) after excluding ERR_ABORTED above.
  if (/net::ERR_/i.test(m)) return true;
  if (/this site can't be reached|this site cannot be reached|took too long to respond/i.test(m)) {
    return true;
  }
  return false;
}

export function resolveAppOriginForMarker(baseURL: string | undefined): string {
  return resolveAppOrigin(baseURL ?? process.env.BASE_URL);
}

/** Request URL host matches app host (navigation / API to same site). */
export function requestMatchesAppHost(
  requestUrl: string,
  appOrigin: string
): boolean {
  try {
    const req = new URL(requestUrl);
    const app = new URL(appOrigin.startsWith("http") ? appOrigin : `https://${appOrigin}`);
    return req.hostname === app.hostname;
  } catch {
    return false;
  }
}
