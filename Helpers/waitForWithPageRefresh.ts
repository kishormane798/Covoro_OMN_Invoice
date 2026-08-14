import { type Locator, type Page } from "@playwright/test";

export type WaitForLocatorWithPageRefreshOptions = {
  state?: "visible" | "attached";
  /** First wait before reload (default 60_000 ms = 1 min). */
  attemptTimeoutMs?: number;
  /** Wait after reload; defaults to `attemptTimeoutMs`. */
  afterRefreshTimeoutMs?: number;
  /** Full page reloads after a failed attempt (default 1). */
  maxRefreshes?: number;
  /**
   * Extra locators that count as the same success (e.g. two UIs for the same outcome).
   * Success if the primary **or** any alternate matches `state`.
   */
  orLocators?: Locator[];
};

function combinedLocator(primary: Locator, orLocators?: Locator[]): Locator {
  let t = primary.first();
  for (const alt of orLocators ?? []) {
    t = t.or(alt.first());
  }
  return t;
}

export type WaitForEInvoiceIdleOptions = {
  /**
   * If `[data-testid="loader-wrapper"]` or loading `role="status"` stays visible this long (continuously),
   * soft-navigate same URL. Default 30_000 ms (30 seconds).
   */
  loaderStuckBeforeRefreshMs?: number;
  /**
   * Max loader-driven refreshes per call. Default 2.
   */
  maxLoaderRefreshes?: number;
};

async function softNavigateSameUrl(page: Page): Promise<void> {
  const url = page.url();
  if (url && url !== "about:blank") {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90_000 });
  } else {
    await page.reload({ waitUntil: "domcontentloaded", timeout: 90_000 });
  }
  await page.waitForLoadState("load", { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(500);
}

/**
 * Best-effort hard refresh:
 * - Chromium: reload with `ignoreCache: true` via CDP + clear cache
 * - Fallback: normal same-URL navigation
 */
async function hardNavigateSameUrl(page: Page): Promise<void> {
  try {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Network.enable").catch(() => {});
    await cdp.send("Network.clearBrowserCache").catch(() => {});
    await cdp.send("Page.reload", { ignoreCache: true });
    await page.waitForLoadState("domcontentloaded", { timeout: 90_000 });
    await page.waitForLoadState("load", { timeout: 15_000 }).catch(() => {});
    await page.waitForTimeout(500);
    return;
  } catch {
    /* non-Chromium or CDP unavailable — soft navigate below */
  }
  await softNavigateSameUrl(page);
}

/**
 * Wait until “Validating” list text and the app loader (`loader-wrapper` / status Loading) are gone.
 * If the loader stays up past `loaderStuckBeforeRefreshMs`, same-URL navigates (up to `maxLoaderRefreshes`), then keeps waiting until `timeoutMs`.
 */
export async function waitForEInvoiceListValidatingGone(
  page: Page,
  timeoutMs = 90_000,
  options?: WaitForEInvoiceIdleOptions
): Promise<void> {
  if (page.isClosed()) {
    return;
  }
  const loaderStuckBeforeRefreshMs = options?.loaderStuckBeforeRefreshMs ?? 30_000;
  const maxLoaderRefreshes = options?.maxLoaderRefreshes ?? 2;
  const validatingStripe = page.getByText(/\bValidating\b/i).first();
  const appLoaderWrapper = page.locator('[data-testid="loader-wrapper"]').first();
  const loadingStatus = page.getByRole("status", { name: /loading/i }).first();

  let refreshesDone = 0;
  let loaderBlockStart: number | null = null;
  let deadline = Date.now() + timeoutMs;
  const tickMs = 400;

  async function isLoaderBlocking(): Promise<boolean> {
    const loader = await appLoaderWrapper.isVisible().catch(() => false);
    const status = await loadingStatus.isVisible().catch(() => false);
    return loader || status;
  }

  for (;;) {
    if (page.isClosed()) {
      return;
    }
    if (Date.now() > deadline) {
      throw new Error(
        `E-Invoice UI still busy after ${timeoutMs}ms` +
          (refreshesDone > 0 ? ` (${refreshesDone} loader refresh(es) after ${loaderStuckBeforeRefreshMs}ms stuck loader)` : "") +
          ` (Validating stripe and/or app loader [data-testid="loader-wrapper"] / status Loading). URL: ${page.url()}`
      );
    }

    const validating = await validatingStripe.isVisible().catch(() => false);
    const loaderBlocking = await isLoaderBlocking();

    if (!validating && !loaderBlocking) {
      return;
    }

    if (loaderBlocking) {
      if (loaderBlockStart === null) {
        loaderBlockStart = Date.now();
      } else if (
        Date.now() - loaderBlockStart >= loaderStuckBeforeRefreshMs &&
        refreshesDone < maxLoaderRefreshes
      ) {
        refreshesDone += 1;
        loaderBlockStart = null;
        await hardNavigateSameUrl(page);
        deadline = Date.now() + timeoutMs;
      }
    } else {
      loaderBlockStart = null;
    }

    await page.waitForTimeout(tickMs);
  }
}

/**
 * Wait for `locator` (or `orLocators`) after idle UI (`waitForEInvoiceListValidatingGone`); on timeout, same-URL navigate and retry up to `maxRefreshes`, then throw.
 */
export async function waitForLocatorWithPageRefresh(
  page: Page,
  locator: Locator,
  options?: WaitForLocatorWithPageRefreshOptions
): Promise<void> {
  const state = options?.state ?? "visible";
  const firstMs = options?.attemptTimeoutMs ?? 60_000;
  const afterMs = options?.afterRefreshTimeoutMs ?? firstMs;
  const maxRefreshes = options?.maxRefreshes ?? 1;
  const target = combinedLocator(locator, options?.orLocators);

  let refreshesDone = 0;
  let timeoutMs = firstMs;

  for (;;) {
    await waitForEInvoiceListValidatingGone(page, Math.min(90_000, timeoutMs + 30_000));
    try {
      await target.waitFor({ state, timeout: timeoutMs });
      return;
    } catch (err) {
      if (refreshesDone >= maxRefreshes) {
        const hint =
          state === "visible"
            ? "Element never became visible (row/button missing, wrong TIN, or UI still loading)."
            : `Element never reached state "${state}".`;
        throw new Error(
          `${hint} After ${refreshesDone} re-navigation(s). URL: ${page.url()} — ${err instanceof Error ? err.message : String(err)}`
        );
      }
      refreshesDone += 1;
      await hardNavigateSameUrl(page);
      timeoutMs = afterMs;
    }
  }
}
