import { expect, type Download, type Locator, type Page, type Response } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { reportLog, flowWarn, flowLog } from "../Helpers/diagnosticLog";
import { resolveBaseUrl } from "../utils/appConfig";
import {
  waitForEInvoiceListValidatingGone,
  waitForLocatorWithPageRefresh,
} from "../Helpers/waitForWithPageRefresh";
import { fieldSectionMap } from "../testData/Master";
import { parallelWorkerDashboardOpenOpts } from "../Helpers/worker/parallelWorkerSubmitIdentity";

const EDIT_ERROR_TIMEOUT_MS = 10_000;

/** Reuse an on-dashboard row for Edit UI tests (skip Excel upload). */
export const EDIT_REUSE_INVOICE_STATUSES = ["error", "ready to submit"] as const;

/** Reuse an on-dashboard row for Copy UI tests (skip Excel upload). */
export const COPY_REUSE_INVOICE_STATUSES = [
  "delivered",
  "delivered to c5",
  "delivered to c3",
  "ready to submit",
] as const;

/** First dashboard row matching allowed statuses — used for Edit/Copy reuse (no invoice # lookup). */
export type ReusableDashboardInvoice = {
  invoiceNumber: string;
  status: string;
  row: Locator;
};
const SUBMIT_MENU_ATTEMPTS = 3;
const INVOICE_DOWNLOAD_RESPONSE_TIMEOUT_MS = 30_000;
const BULK_DOWNLOAD_RESPONSE_TIMEOUT_MS = 120_000;

/** UI labels in Options → Download submenu (`.sub-list-item`). */
export const INVOICE_DOWNLOAD_FORMAT_LABEL = {
  excel: "Excel",
  json: "JSON",
  pdf: "PDF",
  xml: "XML",
} as const;

export type InvoiceDownloadFormatUi = keyof typeof INVOICE_DOWNLOAD_FORMAT_LABEL;

export type InvoiceFileDownloadResponse = {
  buffer: Buffer;
  contentType: string;
  contentDisposition: string;
  downloadUrl: string;
  status: number;
};

const SELECTORS = {
  uploadInvoiceTrigger: "#upload-invoice-btn",
  invoiceTableCell: "td.MuiTableCell-body .ellipsis-container .ellipsis-text",
} as const;

export const EINVOICE_MASTERS_PATH = "/einvoice/masters";

const pageContextBusinessTin = new WeakMap<Page, string>();

function dashboardInvoiceDisplayInTable(invoiceNumber: string): string {
  return invoiceNumber === "" ? "-" : invoiceNumber;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Parse electronic TIN from UI copy.
 * Ground truth: e-invoice header `TIN - OM1108202600`; sidebar `p.tin-number` may use `TIN:` or `TIN -`.
 */
function parseElectronicTinFromUiText(text: string): string | null {
  const flat = text.replace(/\s+/g, " ").trim();
  const labeled = flat.match(/TIN\s*[:\-–]\s*((?:OM)\d{10}|\d{10})\b/i);
  if (labeled) {
    const tin = labeled[1];
    return /^om/i.test(tin) ? tin.toUpperCase() : tin;
  }
  const oman = flat.match(/\b(OM\d{10})\b/i);
  if (oman) return oman[1].toUpperCase();
  const bare = flat.match(/\b(17797\d{5})\b/);
  return bare ? bare[1] : null;
}

/** Sidebar card line from live picker: `TIN: OM1108202604`. */
function businessCardTinLine(tin: string): RegExp {
  return new RegExp(`^\\s*TIN:\\s*${escapeRegExp(tin)}\\s*$`, "i");
}

/** TRN often shown as 15 digits ending in 00003 → electronic is first 10. Oman VATIN is kept intact. */
function normalizeElectronicTinDigits(raw: string): string | null {
  const parsed = parseElectronicTinFromUiText(raw);
  if (parsed) return parsed;
  const d = raw.replace(/\D/g, "");
  if (d.length >= 15 && d.endsWith("00003")) return d.slice(0, 10);
  if (d.length >= 10) return d.slice(0, 10);
  return null;
}

/** Cell text for the invoice # column (`ellipsis-text`; empty number shows as "-"). */
function dashboardInvoiceNumberTextLocator(page: Page, invoiceNumber: string): Locator {
  const display = dashboardInvoiceDisplayInTable(invoiceNumber);
  const exact = new RegExp(`^\\s*${escapeRegExp(display)}\\s*$`);
  return page
    .locator(SELECTORS.invoiceTableCell)
    .filter({ hasText: exact });
}

export class DashboardPage {
  constructor(private page: Page) {}

  
  private goToEInvoicingButton = () =>
    this.page.getByRole("button", { name: /go to e-invoicing/i });

  private buildAppUrl(pathname: string): string {
    const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
    return `${resolveBaseUrl()}${normalizedPath}`;
  }

  private isBusinessDashboardPath(): boolean {
    try {
      return new URL(this.page.url()).pathname.toLowerCase().includes("business-dashboard");
    } catch {
      return false;
    }
  }

  /**
   * After **Go to E-Invoicing**, re-click while URL is still business-dashboard (no deep link).
   */
  private async retryGoToEInvoicingWhileOnBusinessDashboard(timeoutMs = 50_000): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (!this.isBusinessDashboardPath()) {
        return;
      }
      await this.clickEInvoiceDashboardEntry(20_000);
      await this.page.waitForTimeout(500);
    }
    if (this.isBusinessDashboardPath()) {
      throw new Error(
        `Still on business-dashboard after retrying "Go to E-Invoicing". URL=${this.page.url()}`
      );
    }
  }

  /** Prefer visible **Go to E-Invoicing** controls (new business dashboard); legacy View Dashboard as fallback. */
  private dashboardEntryLocatorsInOrder(): Locator[] {
    return [
      this.page
        .locator(
          ".dashboard-btn-cont .button-section .button-wrapper button:has(.btn-children:has-text('Go to E-Invoicing'))"
        )
        .first(),
      this.page
        .locator(
          ".button-section .button-wrapper button:has(.btn-children:has-text('Go to E-Invoicing'))"
        )
        .first(),
      this.page
        .locator(".button-wrapper button:has(.btn-children:has-text('Go to E-Invoicing'))")
        .first(),
      this.page.getByRole("button", { name: /go to e-invoicing/i }).first(),
      this.page
        .locator(
          ".button-section .button-wrapper button:has(.btn-children:has-text('View Dashboard'))"
        )
        .first(),
      this.page
        .locator(".button-wrapper button:has(.btn-children:has-text('View Dashboard'))")
        .first(),
      this.page.getByRole("button", { name: /view dashboard/i }).first(),
      this.page.getByRole("link", { name: /view dashboard/i }).first(),
      this.page.locator("button:has-text('View Dashboard')").first(),
      this.page.locator("[data-testid='view-dashboard'], [data-testid='dashboard-button']").first(),
    ];
  }

  private uploadInvoiceTrigger = () => this.page.locator(SELECTORS.uploadInvoiceTrigger).first();

    private createInvoiceButton = () =>
    this.page
      .locator(".button-wrapper")
      .filter({
        has: this.page.locator(".btn-children", { hasText: /^Create Invoice$/ }),
      })
      .getByRole("button")
      .first();

  private tinMissingBanner = () =>
    this.page.getByText(/tin missing in header/i).first();

  
    async isTinMissingBannerVisible(): Promise<boolean> {
    return this.tinMissingBanner().isVisible().catch(() => false);
  }

  private sidebarBusinessCardsContainer = () =>
    this.page.locator(".sidebar .business-cards-container");

  private sidebarBusinessCardByTin(tin: string): Locator {
    return this.sidebarBusinessCardsContainer()
      .locator(".business-detail")
      .filter({ has: this.page.locator("p.tin-number", { hasText: businessCardTinLine(tin) }) })
      .first();
  }

  private businessSearchInput = () =>
    this.page.getByRole("textbox", { name: /^search$/i });

  async readSelectedBusinessPickerTin(): Promise<string | null> {
    const selected = this.sidebarBusinessCardsContainer()
      .locator(".business-detail.business-details-selected")
      .first();
    if ((await selected.count()) === 0) return null;
    const raw = (await selected.locator("p.tin-number").first().innerText().catch(() => "")).trim();
    return parseElectronicTinFromUiText(raw) ?? normalizeElectronicTinDigits(raw);
  }

    async readEinvoiceShellElectronicTin(): Promise<string | null> {
    const headerLocs = [
      this.page.getByTestId("product-header").first(),
      this.page.locator("#product-header").first(),
      this.page.locator('[data-testid="product-header"]').first(),
    ];
    for (const loc of headerLocs) {
      if ((await loc.count()) === 0) continue;
      if (!(await loc.isVisible().catch(() => false))) continue;
      const text = (await loc.innerText().catch(() => "")) ?? "";
      const hit = parseElectronicTinFromUiText(text) ?? normalizeElectronicTinDigits(text);
      if (hit) return hit;
    }
    const body = ((await this.page.locator("body").innerText().catch(() => "")) ?? "").slice(0, 14_000);
    return parseElectronicTinFromUiText(body);
  }

  /** Table row for an invoice # (ancestor of the ellipsis cell). */
  private invoiceTableRow(invoiceNumber: string): Locator {
    return dashboardInvoiceNumberTextLocator(this.page, invoiceNumber)
      .locator("xpath=ancestor::tr")
      .first();
  }

  /** All table rows matching the invoice # (multi-line uploads can produce duplicates). */
  private invoiceTableRows(invoiceNumber: string): Locator {
    return dashboardInvoiceNumberTextLocator(this.page, invoiceNumber).locator(
      "xpath=ancestor::tr"
    );
  }

  private async readRowStatusNormalized(row: Locator): Promise<string> {
    const statusCell = row.locator("td.status-td p").first();
    const fallbackStatusCell = row
      .locator('td[class*="status"] p, td.status-td p, td.status-td')
      .first();
    const activeStatusCell =
      (await statusCell.count()) > 0 ? statusCell : fallbackStatusCell;
    if ((await activeStatusCell.count()) === 0) return "";
    const raw = await activeStatusCell.innerText().catch(() => "");
    return this.normalizeStatusText(raw);
  }

  private async readRowInvoiceNumber(row: Locator): Promise<string> {
    const invoiceCell = row.locator("td").nth(2).locator(".ellipsis-text").first();
    if ((await invoiceCell.count()) > 0) {
      return (await invoiceCell.innerText()).trim();
    }
    const fallback = row.locator(SELECTORS.invoiceTableCell).first();
    if ((await fallback.count()) === 0) return "";
    return (await fallback.innerText()).trim();
  }

  /** Click the invoice-number cell on a list row (select; do not open Options → View). */
  async clickInvoiceNumberOnRow(row: Locator): Promise<void> {
    await expect(row).toBeVisible({ timeout: 30_000 });
    const invoiceCell = row.locator("td").nth(2).locator(".ellipsis-text").first();
    const fallback = row.locator(SELECTORS.invoiceTableCell).first();
    const target = (await invoiceCell.count()) > 0 ? invoiceCell : fallback;
    await expect(target).toBeVisible({ timeout: 15_000 });
    await target.scrollIntoViewIfNeeded().catch(() => {});
    try {
      await target.click({ timeout: 8_000 });
    } catch {
      await target.click({ timeout: 8_000, force: true });
    }
  }

  /** List row for Options → Download after Ready to Submit (same picker as submit). */
  async invoiceRowForRoundTrip(invoiceNumber: string): Promise<Locator> {
    return this.chooseInvoiceRowForSubmit(invoiceNumber);
  }

  private invoiceDataRows(): Locator {
    return this.page.locator(
      "tbody tr.MuiTableRow-root:has(td.status-td), tbody tr.MuiTableRow-root:has(td[class*='status'])"
    );
  }

  /**
   * Dashboard shows **Completed** after a successful upload; submit flow uses the same rows as
   * **Ready to Submit**. Treat them as equivalent when matching reuse statuses.
   */
  private expandStatusesForReuse(allowedStatuses: readonly string[]): Set<string> {
    const set = new Set(allowedStatuses.map((status) => this.normalizeStatusText(status)));
    if (set.has("ready to submit")) {
      set.add("completed");
    }
    return set;
  }

  private async describeVisibleInvoiceRows(): Promise<string> {
    const rows = this.invoiceDataRows();
    const count = await rows.count();
    if (count === 0) {
      return "0 data rows in invoice table";
    }
    const parts: string[] = [];
    const limit = Math.min(count, 8);
    for (let i = 0; i < limit; i++) {
      const row = rows.nth(i);
      const status = await this.readRowStatusNormalized(row);
      const invoiceNumber = await this.readRowInvoiceNumber(row);
      parts.push(`${invoiceNumber || "?"}=${status || "(empty)"}`);
    }
    if (count > limit) {
      parts.push(`…+${count - limit} more`);
    }
    return parts.join("; ");
  }

  private async scanReusableInvoiceRowOnce(
    normalizedAllowed: Set<string>
  ): Promise<ReusableDashboardInvoice | null> {
    const rows = this.invoiceDataRows();
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const status = await this.readRowStatusNormalized(row);
      if (!status || !normalizedAllowed.has(status)) continue;

      const invoiceNumber = await this.readRowInvoiceNumber(row);
      if (!invoiceNumber || invoiceNumber === "-") continue;

      return { invoiceNumber, status, row };
    }
    return null;
  }

  private async ensureEinvoiceDashboardForReuse(options?: {
    businessTin?: string | null;
  }): Promise<void> {
    const openOpts =
      options?.businessTin !== undefined
        ? { businessTin: options.businessTin }
        : parallelWorkerDashboardOpenOpts();

    const shellUp = await this.uploadInvoiceTrigger().isVisible().catch(() => false);
    const onEinvoicePath = /\/einvoice/i.test(this.page.url());
    if (shellUp && onEinvoicePath) {
      await this.waitForEinvoiceDashboardShell(30_000);
      return;
    }
    await this.openDashboard(openOpts);
    await this.waitForEinvoiceDashboardShell(60_000);
  }

  /**
   * Scan the visible invoice table for the first row in one of `allowedStatuses`.
   * Opens the worker-scoped e-invoice dashboard, waits for validating rows to clear, then
   * matches on status only (no invoice-number search).
   */
  async findReusableInvoiceRow(
    allowedStatuses: readonly string[],
    options?: { businessTin?: string | null; pollTimeoutMs?: number }
  ): Promise<ReusableDashboardInvoice | null> {
    await this.ensureEinvoiceDashboardForReuse(options);

    const normalizedAllowed = this.expandStatusesForReuse(allowedStatuses);
    const pollIntervalMs = 5_000;
    const timeoutMs = options?.pollTimeoutMs ?? 90_000;
    const deadline = Date.now() + timeoutMs;
    let lastDiagnostics = "";

    while (Date.now() < deadline) {
      const remaining = deadline - Date.now();
      if (remaining <= 0) break;

      await waitForEInvoiceListValidatingGone(this.page, Math.min(30_000, remaining)).catch(
        () => {}
      );

      const found = await this.scanReusableInvoiceRowOnce(normalizedAllowed);
      if (found) {
        reportLog(
          `[DashboardPage] Reusing on-dashboard invoice ${found.invoiceNumber} (status: ${found.status}) — skipping upload.`
        );
        return found;
      }

      lastDiagnostics = await this.describeVisibleInvoiceRows();

      if (Date.now() + pollIntervalMs > deadline) break;
      await this.page.waitForTimeout(pollIntervalMs);
    }

    reportLog(
      `[DashboardPage] No reusable invoice row after ${timeoutMs}ms. ` +
        `Allowed statuses: ${[...normalizedAllowed].join(", ")}. ` +
        `Visible rows: ${lastDiagnostics || "(none)"}`
    );
    return null;
  }

  /** Prefer a row ready for Options → Submit when duplicate invoice numbers exist. */
  private async chooseInvoiceRowForSubmit(invoiceNumber: string): Promise<Locator> {
    const rows = this.invoiceTableRows(invoiceNumber);
    const n = await rows.count();
    if (n <= 1) return this.invoiceTableRow(invoiceNumber);

    let fallback: Locator | null = null;
    for (let i = 0; i < n; i++) {
      const row = rows.nth(i);
      const status = await this.readRowStatusNormalized(row);
      if (status === "error" || status === "submission error") continue;
      if (status === "completed") return row;
      if (!fallback) fallback = row;
    }
    return fallback ?? rows.first();
  }

  /**
   * Wait until the invoice row is visible in the dashboard table.
   * Timeouts ≤60s use a single wait; longer budgets allow one page refresh retry.
   */
  async waitForInvoiceRowVisible(
    invoiceNumber: string,
    timeoutMs = 90_000
  ): Promise<void> {
    const primary = this.invoiceTableRow(invoiceNumber);
    const display = dashboardInvoiceDisplayInTable(invoiceNumber);
    const fallbackRow = this.page
      .locator("tr")
      .filter({ has: this.page.getByText(display, { exact: true }) })
      .first();

    if (timeoutMs <= 60_000) {
      await waitForEInvoiceListValidatingGone(this.page, Math.min(90_000, timeoutMs + 30_000));
      await primary.or(fallbackRow).first().waitFor({
        state: "visible",
        timeout: timeoutMs,
      });
      return;
    }
    await waitForLocatorWithPageRefresh(this.page, primary, {
      state: "visible",
      attemptTimeoutMs: 60_000,
      afterRefreshTimeoutMs: timeoutMs - 60_000,
      maxRefreshes: 1,
      orLocators: [fallbackRow],
    });
  }

    async readVisibleEditValidationMessage(): Promise<string> {
    const modal = this.page.locator('[data-testid="modalBody"]');
    if (await modal.isVisible()) {
      const modalError = modal.locator(".MuiFormHelperText-root");
      try {
        await modalError.first().waitFor({
          state: "visible",
          timeout: EDIT_ERROR_TIMEOUT_MS,
        });
        return (await modalError.first().innerText()).trim();
      } catch {
        return "";
      }
    }
    const pageError = this.page.locator(
      '[id$="helper-text"], .MuiFormHelperText-root'
    );
    try {
      await pageError.first().waitFor({
        state: "visible",
        timeout: EDIT_ERROR_TIMEOUT_MS,
      });
      return (await pageError.first().innerText()).trim();
    } catch {
      return "";
    }
  }

    async readVisibleEditFieldValue(): Promise<string> {
    const modal = this.page.locator('[data-testid="modalBody"]');
    if (await modal.isVisible()) {
      const control = modal
        .locator(
          'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), textarea'
        )
        .first();
      if ((await control.count()) > 0 && (await control.isVisible())) {
        try {
          return (await control.inputValue()).trim();
        } catch {
          return (await control.textContent())?.trim() ?? "";
        }
      }
    }
    const fallback = this.page
      .locator(
        'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):visible, textarea:visible'
      )
      .first();
    if ((await fallback.count()) > 0) {
      try {
        return (await fallback.inputValue()).trim();
      } catch {
        return (await fallback.textContent())?.trim() ?? "";
      }
    }
    return "";
  }

  /** Public entry: MUI helper text for the field being edited (modal or inline), with fallbacks. */
  async readVisibleEditValidationMessageWithFallback(): Promise<string> {
    try {
      return await this.readVisibleEditValidationMessage();
    } catch {
      const fallback = this.page
        .locator(
          ".MuiFormHelperText-root, [id$='helper-text'], [role='alert'], p:has-text('Invalid'), p:has-text('Please enter')"
        )
        .first();
      if ((await fallback.count()) > 0 && (await fallback.isVisible())) {
        const text = (await fallback.innerText()).trim();
        if (text) return text;
      }
      return "";
    }
  }

    private async waitForPostDashboardEntry(timeoutMs = 70_000): Promise<void> {
    await this.retryGoToEInvoicingWhileOnBusinessDashboard(Math.min(50_000, timeoutMs));
    const upload = this.uploadInvoiceTrigger();
    const remaining = Math.max(20_000, timeoutMs - 50_000);
    await waitForLocatorWithPageRefresh(this.page, upload, {
      state: "visible",
      attemptTimeoutMs: Math.min(30_000, remaining),
      afterRefreshTimeoutMs: remaining,
      maxRefreshes: 1,
    });
  }

  /** E-invoice list shell after **Create Invoice** page Submit or **Go to E-Invoicing**. */
  async waitForEinvoiceDashboardShell(timeoutMs = 120_000): Promise<void> {
    const upload = this.uploadInvoiceTrigger();
    const myBiz = this.productHeader();
    if (timeoutMs <= 60_000) {
      await expect(upload.or(myBiz).first()).toBeVisible({ timeout: timeoutMs });
      return;
    }
    await waitForLocatorWithPageRefresh(this.page, upload, {
      state: "visible",
      attemptTimeoutMs: 60_000,
      afterRefreshTimeoutMs: timeoutMs - 60_000,
      maxRefreshes: 1,
      orLocators: [myBiz],
    });
  }

  /** Always click Go to E-Invoicing (ordered locators, then role fallback; legacy View Dashboard).
   *  Relaunches business-dashboard once when the entry button is still disabled during subscription hydration. */
  private async clickEInvoiceDashboardEntry(maxWaitMs = 45_000): Promise<void> {
    const timeout = Math.min(maxWaitMs, 25_000);
    const relaunchDashboardAndRestoreTin = async () => {
      await this.page.goto(this.buildAppUrl("/business-dashboard"), {
        waitUntil: "domcontentloaded",
      });
      await this.page.waitForLoadState("load", { timeout: 10_000 }).catch(() => {});
      await this.waitForDashboardStability(12_000);
      const tinToRestore = pageContextBusinessTin.get(this.page);
      if (tinToRestore) {
        await this.selectBusinessCardByTin(tinToRestore);
      }
      await this.selectEInvoiceProductCard();
    };

    for (const loc of this.dashboardEntryLocatorsInOrder()) {
      const target = loc.first();
      if ((await target.count()) === 0) continue;
      await target.waitFor({ state: "visible", timeout }).catch(() => {});
      if (!(await target.isVisible().catch(() => false))) continue;
      await target.scrollIntoViewIfNeeded().catch(() => {});
      const enabled = await target.isEnabled().catch(() => false);
      if (!enabled) {
        await relaunchDashboardAndRestoreTin();
        if (await target.isVisible().catch(() => false)) {
          const enabledAfterReload = await target.isEnabled().catch(() => false);
          if (!enabledAfterReload) continue;
        } else {
          continue;
        }
      }
      try {
        await target.click({ timeout: 12_000 });
      } catch {
        await target.click({ timeout: 12_000, force: true });
      }
      return;
    }
    const directButton = this.goToEInvoicingButton().or(this.page.getByRole("button", { name: /view dashboard/i }));
    await expect(
      directButton.first(),
      `No visible "Go to E-Invoicing" (or legacy "View Dashboard") control after trying card/DOM locators. URL=${this.page.url()}. ` +
        `If you already see "E-Invoice Dashboard" / upload UI, the app may have skipped the card; ` +
        `otherwise update locators in dashboardEntryLocatorsInOrder().`
    ).toBeVisible({ timeout });
    const resolvedDirect = directButton.first();
    const directEnabled = await resolvedDirect.isEnabled().catch(() => false);
    if (!directEnabled) {
      await relaunchDashboardAndRestoreTin();
      await expect(resolvedDirect).toBeVisible({ timeout });
      await expect(resolvedDirect).toBeEnabled({ timeout: 12_000 });
    }
    try {
      await resolvedDirect.click({ timeout: 12_000 });
    } catch {
      await resolvedDirect.click({ timeout: 12_000, force: true });
    }
  }

  private productHeader = () =>
    this.page.getByTestId("product-header").filter({ hasText: "My Business" }).first();

  private async waitForDashboardStability(timeoutMs = 10_000) {
    await this.page.waitForLoadState("domcontentloaded", { timeout: timeoutMs }).catch(() => {});
    await this.page.waitForLoadState("load", { timeout: timeoutMs }).catch(() => {});
    await this.page.waitForTimeout(300);
  }

    private async isDashboardShellVisible(): Promise<boolean> {
    if (await this.uploadInvoiceTrigger().isVisible().catch(() => false)) return true;
    if (await this.productHeader().isVisible().catch(() => false)) return true;
    for (const loc of this.dashboardEntryLocatorsInOrder()) {
      const target = loc.first();
      if ((await target.count()) === 0) continue;
      if (await target.isVisible().catch(() => false)) return true;
    }
    const direct = this.goToEInvoicingButton().or(this.page.getByRole("button", { name: /view dashboard/i }));
    if ((await direct.count()) > 0 && (await direct.first().isVisible().catch(() => false))) return true;
    return false;
  }

  private async evaluateBlankDashboard(): Promise<boolean> {
    return this.page
      .evaluate(() => {
        const bodyText = (document.body?.innerText ?? "").trim();
        const hasRoot = Boolean(
          document.querySelector("#root, [data-testid='product-header'], .button-wrapper, .content-wrapper")
        );
        const hasVisibleSurface = Array.from(document.querySelectorAll("button, a, input")).some((el) => {
          const rect = (el as HTMLElement).getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });
        return (!bodyText || bodyText.length < 8) && (!hasRoot || !hasVisibleSurface);
      })
      .catch(() => false);
  }

    private async refreshIfDashboardBlank() {
    if (await this.isDashboardShellVisible()) return;

    const looksBlank = await this.evaluateBlankDashboard();
    if (!looksBlank) return;

    await this.page.waitForTimeout(1000);
    if (await this.isDashboardShellVisible()) return;
    const stillBlank = await this.evaluateBlankDashboard();
    if (!stillBlank) return;

    const dashboardUrl = this.buildAppUrl("/business-dashboard");
    await this.page.reload({ waitUntil: "domcontentloaded" });
    await this.waitForDashboardStability(12_000);
    await this.page.waitForTimeout(600);
    if (await this.isDashboardShellVisible()) return;

    await this.page.goto(dashboardUrl, { waitUntil: "domcontentloaded" });
    await this.page.waitForLoadState("load", { timeout: 10_000 }).catch(() => {});
    await this.page.waitForTimeout(400);
    await this.waitForDashboardStability(12_000);
  }

  /**
   * On the subscription panel, ensure the **E-INVOICE** product card is selected before Go to E-Invoicing.
   */
  private async selectEInvoiceProductCard(): Promise<void> {
    const productCard = this.page
      .locator(".product-list .business-detail")
      .filter({ has: this.page.getByRole("heading", { name: /E-INVOICE/i }) })
      .filter({ visible: true })
      .first();
    if ((await productCard.count()) === 0) return;

    const alreadySelected = await productCard.evaluate((el) =>
      el.classList.contains("business-details-selected")
    );
    if (alreadySelected) return;

    await productCard.scrollIntoViewIfNeeded().catch(() => {});
    try {
      await productCard.click({ timeout: 8_000 });
    } catch {
      await productCard.click({ timeout: 8_000, force: true });
    }
    await expect(productCard).toHaveClass(/business-details-selected/, { timeout: 12_000 });
  }

  /**
   * Click the sidebar `.business-detail` whose `p.tin-number` is `TIN: {tin}`.
   * Ground truth: `.sidebar .business-cards-container` with `#searchBusiness` and
   * `p.tin-number` text `TIN: OM1108202604`.
   */
  async selectBusinessCardByTin(tin: string): Promise<void> {
    const trimmed = String(tin).trim();
    if (!trimmed) return;

    const tinLine = businessCardTinLine(trimmed);
    const search = this.businessSearchInput();
    if ((await search.count()) > 0) {
      await search.fill(trimmed).catch(() => {});
    }

    const card = this.sidebarBusinessCardByTin(trimmed);

    try {
      await card.waitFor({ state: "visible", timeout: 20_000 });
    } catch {
      flowWarn(
        "DashboardPage",
        `No visible .business-detail for TIN ${trimmed} (URL=${this.page.url()}).`
      );
      return;
    }

    await card.scrollIntoViewIfNeeded().catch(() => {});

    const tinLineEl = card.locator("p.tin-number").filter({ hasText: tinLine }).first();

    const alreadySelected = await card.evaluate((el) =>
      el.classList.contains("business-details-selected")
    );
    if (alreadySelected) {
      return;
    }

    let clicked = false;
    const tryClicks = [
      () => tinLineEl.click({ timeout: 8_000 }),
      () => card.click({ timeout: 8_000 }),
      () =>
        card.evaluate((el) => {
          (el as HTMLElement).click();
        }),
      () => card.click({ timeout: 8_000, force: true }),
    ];

    for (const attempt of tryClicks) {
      try {
        await attempt();
        clicked = true;
        break;
      } catch {}
    }

    if (!clicked) {
      flowWarn(
        "DashboardPage",
        `Could not activate business card for TIN ${trimmed} (all click strategies failed).`
      );
    }

    if (clicked) {
      await this.page.waitForTimeout(500);
      await expect(card).toHaveClass(/business-details-selected/, { timeout: 12_000 });
      await expect(tinLineEl).toContainText(tinLine, { timeout: 12_000 });
    }
  }

  /**
   * Go to business dashboard, optionally select `businessTin` card, click **Go to E-Invoicing**, wait for shell.
   * `businessTin: null` clears the per-page stored TIN (`pageContextBusinessTin`).
   */
  async openDashboard(opts?: { businessTin?: string | null }) {
    if (opts !== undefined) {
      if (opts.businessTin == null || String(opts.businessTin).trim() === "") {
        pageContextBusinessTin.delete(this.page);
      } else {
        pageContextBusinessTin.set(this.page, String(opts.businessTin).trim());
      }
    }
    const tinToSelect = pageContextBusinessTin.get(this.page);

    if (!this.isBusinessDashboardPath()) {
      await this.page.goto(this.buildAppUrl("/business-dashboard"), {
        waitUntil: "domcontentloaded",
      });
      await this.page.waitForLoadState("load", { timeout: 10_000 }).catch(() => {});
      await this.page.waitForTimeout(400);
    }

    await this.waitForDashboardStability(12_000);
    await this.refreshIfDashboardBlank();

    if (tinToSelect) {
      await this.selectBusinessCardByTin(tinToSelect);
    }
    await this.selectEInvoiceProductCard();
    if (process.env.UAE_EINVOICE_DEBUG_DASHBOARD === "1") {
      const pickerTin = await this.readSelectedBusinessPickerTin();
      reportLog(
        `[DashboardPage] After card step (pre–Go to E-Invoicing): picker TIN=${pickerTin ?? "n/a"} ` +
          `expected=${tinToSelect ?? "(default card, no click)"} url=${this.page.url()}`
      );
    }
    await this.clickEInvoiceDashboardEntry();
    await this.waitForPostDashboardEntry();
    if (process.env.UAE_EINVOICE_DEBUG_DASHBOARD === "1") {
      const shellTin = await this.readEinvoiceShellElectronicTin();
      reportLog(
        `[DashboardPage] After Go to E-Invoicing: shell TIN=${shellTin ?? "n/a"} ` +
          `expected=${tinToSelect ?? "~1779700001 if default first card"} url=${this.page.url()}`
      );
    }
  }

    private mastersMenuButton = () =>
    this.page
      .getByTestId("menu-wrapper")
      .filter({
        has: this.page.locator(`a[href="${EINVOICE_MASTERS_PATH}"]`, {
          hasText: /^Masters$/,
        }),
      })
      .getByRole("button", { name: "Masters", exact: true });

    async openMastersPage(): Promise<void> {
    const mastersButton = this.mastersMenuButton();
    await expect(mastersButton).toBeVisible({ timeout: 30_000 });
    await mastersButton.click();
    await this.page.waitForURL(`**${EINVOICE_MASTERS_PATH}**`, { timeout: 30_000 });
    await this.expectMastersPageLoaded();
  }

    async clickCreateInvoice(): Promise<void> {
    const createBtn = this.createInvoiceButton();
    await expect(createBtn).toBeVisible({ timeout: 30_000 });
    await createBtn.scrollIntoViewIfNeeded().catch(() => {});
    try {
      await createBtn.click({ timeout: 12_000 });
    } catch {
      await createBtn.click({ timeout: 12_000, force: true });
    }
    await this.expectCreateInvoiceEditModeLoaded();
  }

    async expectCreateInvoiceEditorLoaded(): Promise<void> {
    await expect(this.page.locator("main.invoice-content-container")).toBeVisible({
      timeout: 30_000,
    });
    await expect(this.page.locator('section.invoice-content-section[data-id="1"]')).toBeVisible();
    await expect(
      this.page.locator('section.invoice-content-section[data-id="B"]')
    ).toBeVisible();
    await expect(
      this.page.locator('section.invoice-content-section[data-id="3"]')
    ).toBeVisible();
  }

    async expectCreateInvoiceEditModeLoaded(): Promise<void> {
    await this.expectCreateInvoiceEditorLoaded();
    const document = this.page.locator('section.invoice-content-section[data-id="1"]');
    await expect(document.locator("#invNum")).toBeVisible({ timeout: 30_000 });
    await expect(
      document
        .locator(".form-footer")
        .getByRole("button", { name: "Save" })
        .or(document.locator(".form-footer").getByRole("button", { name: "Update" }))
    ).toBeVisible();
  }

    async expectViewInvoiceDetailsLoaded(): Promise<void> {
    await this.expectCreateInvoiceEditorLoaded();
    const document = this.page.locator('section.invoice-content-section[data-id="1"]');
    await expect(document.locator("#invNum")).toHaveCount(0);
    const readOnlyMarker = document
      .locator(
        ".input-box-container.read-only, .read-only-field, .display-inline.read-only-field, p.value, .disabled-text-field"
      )
      .first();
    await expect(readOnlyMarker).toBeVisible({ timeout: 30_000 });
  }

    async openSectionEdit(
    section: "document" | "seller" | "buyer" | "delivery" | "invoice" | "payment" | "custom"
  ): Promise<void> {
    const editIndex: Record<typeof section, number> = {
      document: 0,
      seller: 1,
      buyer: 2,
      delivery: 3,
      invoice: 4,
      payment: 5,
      custom: 6,
    };
    const editButtons = this.page.locator("button:has-text('Edit')");
    const button = editButtons.nth(editIndex[section]);
    await expect(button).toBeVisible({ timeout: 30_000 });
    await button.click();
  }

    async expectMastersPageLoaded(): Promise<void> {
    await expect(this.page.getByTestId("product-header")).toHaveText("Masters");
    await expect(this.page.getByTestId("header-wrapper")).toBeVisible();
    await expect(
      this.page.getByRole("button", { name: "Buyer/Seller", exact: true })
    ).toBeVisible();
    await expect(this.page.getByRole("button", { name: "Items", exact: true })).toBeVisible();
    await expect(
      this.page.getByRole("heading", { name: "Buyer/Seller List", level: 3 })
    ).toBeVisible();
    await expect(this.page.getByTestId("MASTERS")).toBeVisible();
    await expect(this.page.getByTestId("search-input")).toBeVisible();
    await expect(this.page.getByRole("button", { name: "Add New" })).toBeVisible();
    await expect(this.page.locator("table.masters-list-table")).toBeVisible();
  }

  private async clickRowOptions(row: Locator): Promise<void> {
    await expect(row).toBeVisible({ timeout: 30_000 });
    const optionsButton = row.locator('button:has-text("Options")');
    await expect(optionsButton).toBeVisible({ timeout: 30_000 });
    await optionsButton.scrollIntoViewIfNeeded().catch(() => {});
    try {
      await optionsButton.click({ timeout: 8_000 });
    } catch {
      await optionsButton.click({ timeout: 8_000, force: true });
    }
  }

  async openInvoiceEditOnRow(row: Locator): Promise<void> {
    await this.clickRowOptions(row);
    const editOption = this.page.locator("#sub-item-edit");
    await expect(editOption).toBeVisible();
    await editOption.click();
  }

  async openInvoiceEdit(invoiceNumber: string) {
    const row = this.invoiceTableRow(invoiceNumber);
    await this.openInvoiceEditOnRow(row);
  }

  /**
   * **Options → View** (read-only invoice details).
   * Menu id follows edit/submit pattern (`#sub-item-view`); text fallback if id differs.
   */
  async openInvoiceViewOnRow(row: Locator): Promise<void> {
    await this.clickRowOptions(row);
    const viewOption = this.page
      .locator("#sub-item-view")
      .or(this.page.locator('[id^="sub-item-"]').filter({ hasText: /^View$/i }))
      .or(this.page.getByRole("menuitem", { name: /^View$/i }))
      .or(this.page.getByText(/^View$/i))
      .first();
    await expect(viewOption).toBeVisible({ timeout: 15_000 });
    await viewOption.click();
    await this.expectViewInvoiceDetailsLoaded();
  }

  async openInvoiceView(invoiceNumber: string): Promise<void> {
    const row = this.invoiceTableRow(invoiceNumber);
    await this.openInvoiceViewOnRow(row);
  }

  private createCopyModalBody(): Locator {
    return this.page.locator('[data-testid="modalBody"]').first();
  }

  private createCopyModalButton(label: "Yes" | "No"): Locator {
    return this.createCopyModalBody().getByRole("button", { name: label, exact: true }).first();
  }

  async openInvoiceCopyOnRow(row: Locator, decision: "Yes" | "No"): Promise<void> {
    await this.clickRowOptions(row);

    const copyOption = this.page.locator("#sub-item-create-copy").first();
    await expect(copyOption).toBeVisible({ timeout: 15_000 });
    await copyOption.click();

    const modal = this.createCopyModalBody();
    await expect(modal).toBeVisible({ timeout: 15_000 });

    const decisionBtn = this.createCopyModalButton(decision);
    await expect(decisionBtn).toBeVisible({ timeout: 15_000 });
    await decisionBtn.click();

    await expect(modal).toBeHidden({ timeout: 15_000 });
  }

  /**
   * Open **Options → Create Copy** for the invoice row, then resolve the confirmation modal.
   * - decision: "No" keeps the user on the dashboard list
   * - decision: "Yes" opens the Create Invoice editor (copy prefilled)
   */
  async openInvoiceCopy(invoiceNumber: string, decision: "Yes" | "No"): Promise<void> {
    const row = this.invoiceTableRow(invoiceNumber);
    await this.openInvoiceCopyOnRow(row, decision);
  }

  /**
   * After Excel upload completes, return to the invoice table (upload modal blocks search/Options),
   * search, and wait for the row before Options → Submit.
   */
  async refreshDashboardForInvoiceTable(invoiceNumber: string): Promise<void> {
    await this.refreshDashboard();
    await this.searchInvoiceInTable(invoiceNumber);
    await this.waitForInvoiceRowVisible(invoiceNumber, 120_000);
  }

  async submitInvoiceFromTable(invoiceNumber: string) {
    const row = this.invoiceTableRow(invoiceNumber);

    await expect(row).toBeVisible({ timeout: 30000 });

    const optionsButton = row.locator('button:has-text("Options")');
    const submitOption = this.page.locator("#sub-item-submit");
    let submitted = false;

    for (let attempt = 1; attempt <= SUBMIT_MENU_ATTEMPTS; attempt++) {
      await expect(optionsButton).toBeVisible();
      await optionsButton.scrollIntoViewIfNeeded().catch(() => {});
      try {
        await optionsButton.click({ timeout: 4_000 });
      } catch {
        await optionsButton.click({ timeout: 4_000, force: true });
      }

      try {
        await expect(submitOption).toBeVisible({ timeout: 4_000 });
      } catch {
        continue;
      }

      try {
        await submitOption.click({ timeout: 4_000 });
      } catch {
        await submitOption.click({ timeout: 4_000, force: true });
      }

      const hiddenAfterClick = await submitOption
        .isHidden({ timeout: 5_000 })
        .catch(() => false);
      if (hiddenAfterClick) {
        submitted = true;
        break;
      }
    }

    if (!submitted) {
      throw new Error(
        `Could not complete Options -> Submit click flow for invoice ${invoiceNumber} after ${SUBMIT_MENU_ATTEMPTS} attempts`
      );
    }

    await expect(submitOption).toBeHidden({ timeout: 10000 });
    await expect(row).toBeVisible();
  }

  /**
   * Options → **Submit as PDF** (submit with PDF attachment).
   * Menu id follows submit pattern (`#sub-item-submit-as-pdf`); text fallback if id differs.
   */
  async submitInvoiceAsPdfFromTable(invoiceNumber: string) {
    const row = this.invoiceTableRow(invoiceNumber);

    await expect(row).toBeVisible({ timeout: 30000 });

    const optionsButton = row.locator('button:has-text("Options")');
    const submitAsPdfOption = this.page
      .locator("#sub-item-submit-as-pdf")
      .or(
        this.page.locator('[id^="sub-item-"]').filter({ hasText: /^Submit as PDF$/i })
      )
      .or(
        this.page
          .locator('.list-item[role="presentation"]')
          .filter({
            has: this.page.locator(".label-container", { hasText: /^Submit as PDF$/i }),
          })
      )
      .first();
    let submitted = false;

    for (let attempt = 1; attempt <= SUBMIT_MENU_ATTEMPTS; attempt++) {
      await expect(optionsButton).toBeVisible();
      await optionsButton.scrollIntoViewIfNeeded().catch(() => {});
      try {
        await optionsButton.click({ timeout: 4_000 });
      } catch {
        await optionsButton.click({ timeout: 4_000, force: true });
      }

      try {
        await expect(submitAsPdfOption).toBeVisible({ timeout: 4_000 });
      } catch {
        continue;
      }

      try {
        await submitAsPdfOption.click({ timeout: 4_000 });
      } catch {
        await submitAsPdfOption.click({ timeout: 4_000, force: true });
      }

      const hiddenAfterClick = await submitAsPdfOption
        .isHidden({ timeout: 5_000 })
        .catch(() => false);
      if (hiddenAfterClick) {
        submitted = true;
        break;
      }
    }

    if (!submitted) {
      throw new Error(
        `Could not complete Options -> Submit as PDF click flow for invoice ${invoiceNumber} after ${SUBMIT_MENU_ATTEMPTS} attempts`
      );
    }

    await expect(submitAsPdfOption).toBeHidden({ timeout: 10000 });
    await expect(row).toBeVisible();
  }

  /**
   * Multi-item uploads can show duplicate invoice-number rows; return to the invoice table (upload
   * modal blocks search/Options), wait for the row, pick the best duplicate, then Submit.
   */
  async submitMultiItemInvoiceFromTable(invoiceNumber: string): Promise<void> {
    await this.refreshDashboard();
    await this.searchInvoiceInTable(invoiceNumber);
    await this.waitForInvoiceRowVisible(invoiceNumber, 120_000);
    const row = await this.chooseInvoiceRowForSubmit(invoiceNumber);
    await expect(row).toBeVisible({ timeout: 30_000 });

    const optionsButton = row.locator('button:has-text("Options")');
    const submitOption = this.page.locator("#sub-item-submit");
    let submitted = false;

    for (let attempt = 1; attempt <= SUBMIT_MENU_ATTEMPTS; attempt++) {
      await expect(optionsButton).toBeVisible();
      await optionsButton.scrollIntoViewIfNeeded().catch(() => {});
      try {
        await optionsButton.click({ timeout: 4_000 });
      } catch {
        await optionsButton.click({ timeout: 4_000, force: true });
      }

      try {
        await expect(submitOption).toBeVisible({ timeout: 4_000 });
      } catch {
        await this.refreshDashboard();
        await this.searchInvoiceInTable(invoiceNumber);
        continue;
      }

      try {
        await submitOption.click({ timeout: 4_000 });
      } catch {
        await submitOption.click({ timeout: 4_000, force: true });
      }

      const hiddenAfterClick = await submitOption
        .isHidden({ timeout: 5_000 })
        .catch(() => false);
      if (hiddenAfterClick) {
        submitted = true;
        break;
      }
    }

    if (!submitted) {
      throw new Error(
        `Could not complete Options -> Submit click flow for invoice ${invoiceNumber} after ${SUBMIT_MENU_ATTEMPTS} attempts`
      );
    }
    await expect(submitOption).toBeHidden({ timeout: 10_000 });
    await expect(row).toBeVisible();
  }

  private invoiceRow(invoiceNumber: string) {
    const display = dashboardInvoiceDisplayInTable(invoiceNumber);
    const primary = this.invoiceTableRow(invoiceNumber);
    const fallback = this.page
      .locator("tr")
      .filter({ has: this.page.getByText(display, { exact: true }) })
      .first();
    return primary.or(fallback).first();
  }

  private async refreshDashboard() {
    const dashboardUrl = this.buildAppUrl("/business-dashboard");
    await this.page.goto(dashboardUrl, {
      waitUntil: "domcontentloaded",
    });
    await this.page.waitForLoadState("load", { timeout: 8000 }).catch(() => {});
    await this.page.waitForTimeout(400);
    await this.openDashboard();
  }

  private async searchInvoiceInTable(invoiceNumber: string) {
    const candidates = [
      'input[placeholder*="Search"]',
      'input[placeholder*="search"]',
      '[data-testid="search-input"] input',
      'input[type="search"]',
    ];
    for (const selector of candidates) {
      const input = this.page.locator(selector).first();
      if ((await input.count()) === 0) continue;
      try {
        await input.fill(dashboardInvoiceDisplayInTable(invoiceNumber));
        return;
      } catch {}
    }
  }

  private normalizeStatusText(raw: string): string {
    return raw.replace(/\s+/g, " ").trim().toLowerCase();
  }

  /**
   * Poll until the dashboard row shows **Ready to Submit** (or **Completed** — same as Excel upload).
   */
  async waitForInvoiceReadyToSubmitStatus(
    invoiceNumber: string,
    options?: { timeoutMs?: number }
  ): Promise<string> {
    const pollIntervalMs = 5_000;
    const timeoutMs = options?.timeoutMs ?? 2 * 60_000;
    const allowed = this.expandStatusesForReuse(["ready to submit"]);
    const deadline = Date.now() + timeoutMs;

    const readStatus = async (): Promise<string> => {
      await this.searchInvoiceInTable(invoiceNumber);
      const row = this.invoiceRow(invoiceNumber);
      await expect(row).toBeVisible({ timeout: 30_000 });
      return this.readRowStatusNormalized(row);
    };

    let status = await readStatus();
    while (!allowed.has(status)) {
      if (status === "error" || status === "submission error") {
        throw new Error(
          `Invoice ${invoiceNumber}: expected Ready to Submit but dashboard status is "${status}".`
        );
      }
      if (Date.now() >= deadline) {
        throw new Error(
          `Invoice ${invoiceNumber} did not reach Ready to Submit / Completed within ${timeoutMs}ms. Last dashboard status: "${status}".`
        );
      }
      await this.page.waitForTimeout(pollIntervalMs);
      await this.refreshDashboard();
      status = await readStatus();
    }
    return status;
  }

    private isSubmitFlowDeliveryComplete(normalizedStatus: string): boolean {
    return (
      normalizedStatus === "delivered" ||
      normalizedStatus === "delivered to c5" ||
      normalizedStatus === "delivered to c3"
    );
  }

  private assertNotSubmissionError(normalizedStatus: string, invoiceNumber: string) {
    if (normalizedStatus === "submission error") {
      throw new Error(`Invoice ${invoiceNumber}: status is Submission Error (test failed)`);
    }
  }

    async waitForInvoiceDeliveryStatus(
    invoiceNumber: string,
    options?: { timeoutMs?: number }
  ): Promise<string> {
    const pollIntervalMs = 5_000;
    const timeoutMs = options?.timeoutMs ?? 5 * 60 * 1000;
    const deadline = Date.now() + timeoutMs;

    const readStatus = async () => {
      const row = this.invoiceRow(invoiceNumber);
      await expect(row).toBeVisible({ timeout: 30000 });

      const statusCell = row.locator("td.status-td p").first();
      const fallbackStatusCell = row
        .locator('td[class*="status"] p, td.status-td p, td.status-td')
        .first();
      const activeStatusCell =
        (await statusCell.count()) > 0 ? statusCell : fallbackStatusCell;
      await expect(activeStatusCell).toBeVisible({ timeout: 10000 });
      return this.normalizeStatusText(await activeStatusCell.innerText());
    };

    let status = await readStatus();
    this.assertNotSubmissionError(status, invoiceNumber);

    while (!this.isSubmitFlowDeliveryComplete(status)) {
      if (Date.now() >= deadline) {
        throw new Error(
          `Invoice ${invoiceNumber} did not reach Delivered / Delivered to C5 / Delivered to C3 within ${timeoutMs}ms. Last dashboard status: "${status}". ` +
            `Stuck states usually mean backend/processing delay or a status label mismatch (check UI vs normalizeStatusText).`
        );
      }
      await this.page.waitForTimeout(pollIntervalMs);
      await this.refreshDashboard();
      status = await readStatus();
      this.assertNotSubmissionError(status, invoiceNumber);
    }
    return status;
  }

  async openErrorEdit(fieldName: string) {
    const section = fieldSectionMap[fieldName];
    if (section === "item") {
      const errorRow = this.page
        .locator("tr", {
          has: this.page.locator(".error-icon"),
        })
        .first();

      await expect(errorRow).toBeVisible();

      const editIcon = errorRow
        .locator('[data-testid="action-container"] .action-icon')
        .nth(1);

      await expect(editIcon).toBeVisible();
      await editIcon.click();
      await expect(this.page.locator('[data-testid="modalBody"]')).toBeVisible();
      return;
    }

    switch (section) {
      case "document":
      case "seller":
      case "buyer":
      case "delivery":
      case "invoice":
      case "payment":
      case "custom":
        await this.openSectionEdit(section);
        break;
      default:
        await this.openSectionEdit("document");
    }
  }

  /** Open worker-scoped e-invoice invoice list (upload trigger visible). */
  async openEinvoiceInvoiceList(): Promise<void> {
    await this.ensureEinvoiceDashboardForReuse();
  }

  async hasStatisticsCard(label: string): Promise<boolean> {
    return this.statisticsCardLocator(label)
      .isVisible({ timeout: 3_000 })
      .catch(() => false);
  }

  private statisticsCardLocator(label: string): Locator {
    return this.page
      .locator(".statistics-card")
      .filter({
        has: this.page.locator(".statistics-card__header span", {
          hasText: new RegExp(`^\\s*${escapeRegExp(label)}\\s*$`, "i"),
        }),
      })
      .first();
  }

  /** Click a dashboard statistics card (e.g. Delivered, Ready to Submit, Error in Records). */
  async clickStatisticsCard(label: string): Promise<void> {
    const card = this.statisticsCardLocator(label);

    await expect(card).toBeVisible({ timeout: 30_000 });
    await card.scrollIntoViewIfNeeded().catch(() => {});
    try {
      await card.click({ timeout: 8_000 });
    } catch {
      await card.click({ timeout: 8_000, force: true });
    }
    await this.page.waitForTimeout(500);
    await waitForEInvoiceListValidatingGone(this.page, 30_000).catch(() => {});
  }

  private matchesStatusForFileDownload(
    normalizedStatus: string,
    target: "ready to submit" | "delivered" | "error"
  ): boolean {
    if (target === "delivered") {
      return normalizedStatus === "delivered";
    }
    if (target === "ready to submit") {
      return normalizedStatus === "ready to submit";
    }
    if (target === "error") {
      return normalizedStatus === "error";
    }
    return false;
  }

  /**
   * First visible invoice row matching `status` after a statistics-card filter.
   * Plain **Delivered** only — excludes Delivered to C3 / C5.
   * Invoice statuses only (not upload file "completed").
   */
  async firstInvoiceRowForFileDownload(
    status: "ready to submit" | "delivered" | "error",
    options?: { pollTimeoutMs?: number }
  ): Promise<ReusableDashboardInvoice> {
    const pollIntervalMs = 3_000;
    const timeoutMs = options?.pollTimeoutMs ?? 60_000;
    const deadline = Date.now() + timeoutMs;
    let lastDiagnostics = "";

    while (Date.now() < deadline) {
      await waitForEInvoiceListValidatingGone(this.page, Math.min(30_000, deadline - Date.now())).catch(
        () => {}
      );

      const rows = this.invoiceDataRows();
      const count = await rows.count();
      for (let i = 0; i < count; i++) {
        const row = rows.nth(i);
        const normalized = await this.readRowStatusNormalized(row);
        if (!this.matchesStatusForFileDownload(normalized, status)) continue;

        const invoiceNumber = await this.readRowInvoiceNumber(row);
        if (!invoiceNumber || invoiceNumber === "-") continue;

        reportLog(
          `[DashboardPage] File-download row: ${invoiceNumber} (status: ${normalized})`
        );
        return { invoiceNumber, status: normalized, row };
      }

      lastDiagnostics = await this.describeVisibleInvoiceRows();
      if (Date.now() + pollIntervalMs > deadline) break;
      await this.page.waitForTimeout(pollIntervalMs);
    }

    throw new Error(
      `No invoice row with status "${status}" on dashboard within ${timeoutMs}ms. ` +
        `Visible rows: ${lastDiagnostics || "(none)"}`
    );
  }

  /** Row **Options** → assert **Download** parent menu item is visible. */
  async expectDownloadMenuEntryVisibleOnRow(row: Locator): Promise<void> {
    await this.clickRowOptions(row);
    await expect(this.page.locator("#sub-item-download").first()).toBeVisible({
      timeout: 15_000,
    });
  }

  /** Row **Options** → **Download**; returns the visible format submenu container. */
  async openInvoiceDownloadSubmenuOnRow(row: Locator): Promise<Locator> {
    await this.clickRowOptions(row);

    const downloadItem = this.page.locator("#sub-item-download").first();
    await expect(downloadItem).toBeVisible({ timeout: 15_000 });
    await downloadItem.scrollIntoViewIfNeeded().catch(() => {});

    try {
      await downloadItem.click({ timeout: 8_000 });
    } catch {
      await downloadItem.click({ timeout: 8_000, force: true });
    }

    const submenu = this.page.locator(".sub-dropdown-container").filter({ visible: true }).last();
    await expect(submenu).toBeVisible({ timeout: 10_000 });
    return submenu;
  }

  async expectDownloadFormatsInSubmenu(
    submenu: Locator,
    options: { visible: readonly string[]; hidden: readonly string[] }
  ): Promise<void> {
    for (const label of options.visible) {
      const item = submenu
        .locator(".sub-list-item")
        .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(label)}\\s*$`, "i") });
      await expect(item.first()).toBeVisible({ timeout: 10_000 });
    }
    for (const label of options.hidden) {
      const item = submenu
        .locator(".sub-list-item")
        .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(label)}\\s*$`, "i") });
      await expect(item).toHaveCount(0);
    }
  }

  /** Click one format in the open Download submenu; returns API response metadata + body. */
  async clickDownloadFormatInSubmenu(
    submenu: Locator,
    formatLabel: string,
    options?: { timeoutMs?: number; waitForBulkExport?: boolean }
  ): Promise<InvoiceFileDownloadResponse> {
    const item = submenu
      .locator(".sub-list-item")
      .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(formatLabel)}\\s*$`, "i") })
      .first();
    await expect(item).toBeVisible({ timeout: 10_000 });

    return this.waitForInvoiceDownloadAfterClick(() => item.click(), options);
  }

  private isInvoiceDownloadUrl(url: string): boolean {
    return /\/file\/v1\/download|\/file\/v1\/.*\/download|\/export\/|\/download/i.test(url);
  }

  private looksLikeInvoiceFileBuffer(buffer: Buffer, contentType: string): boolean {
    if (buffer.length === 0) return false;

    const ct = contentType.toLowerCase();
    if (buffer.subarray(0, 2).toString("utf8") === "PK") return true;
    if (buffer.subarray(0, 4).toString("utf8") === "%PDF") return true;
    if (buffer.toString("utf8", 0, 120).trimStart().startsWith("<")) return true;

    if (ct.includes("json")) return false;
    return (
      ct.includes("spreadsheet") ||
      ct.includes("excel") ||
      ct.includes("octet-stream") ||
      ct.includes("pdf") ||
      ct.includes("xml")
    );
  }

  private async waitForValidInvoiceDownloadResponse(
    timeoutMs: number
  ): Promise<InvoiceFileDownloadResponse | null> {
    const deadline = Date.now() + timeoutMs;

    return new Promise((resolve) => {
      let settled = false;
      let timer: ReturnType<typeof setInterval> | undefined;

      const finish = (value: InvoiceFileDownloadResponse | null) => {
        if (settled) return;
        settled = true;
        if (timer) clearInterval(timer);
        this.page.off("response", handler);
        resolve(value);
      };

      const handler = async (response: Response) => {
        if (!this.isInvoiceDownloadUrl(response.url())) return;
        if (response.status() !== 200 && response.status() !== 201) return;

        try {
          const headers = response.headers();
          const contentType = headers["content-type"] ?? "";
          const buffer = await response.body();
          if (!this.looksLikeInvoiceFileBuffer(buffer, contentType)) return;

          finish({
            buffer,
            contentType,
            contentDisposition: headers["content-disposition"] ?? "",
            downloadUrl: response.url(),
            status: response.status(),
          });
        } catch {
          /* response may be aborted while bulk export is still running */
        }
      };

      this.page.on("response", handler);
      timer = setInterval(() => {
        if (Date.now() >= deadline) finish(null);
      }, 250);
    });
  }

  private async toBrowserDownloadResponse(download: Download): Promise<InvoiceFileDownloadResponse> {
    const suggested = download.suggestedFilename() || `download-${Date.now()}.xlsx`;
    const savePath = path.join(process.cwd(), "test-results", suggested);
    fs.mkdirSync(path.dirname(savePath), { recursive: true });
    await download.saveAs(savePath);
    const buffer = fs.readFileSync(savePath);
    return {
      buffer,
      contentType: "",
      contentDisposition: suggested,
      downloadUrl: download.url(),
      status: 200,
    };
  }

  private async waitForInvoiceDownloadAfterClick(
    click: () => Promise<void>,
    options?: { timeoutMs?: number; waitForBulkExport?: boolean }
  ): Promise<InvoiceFileDownloadResponse> {
    const timeoutMs = options?.timeoutMs ?? INVOICE_DOWNLOAD_RESPONSE_TIMEOUT_MS;

    const apiResponsePromise = this.waitForValidInvoiceDownloadResponse(timeoutMs);
    const downloadPromise = this.page
      .waitForEvent("download", { timeout: timeoutMs })
      .then((download) => this.toBrowserDownloadResponse(download))
      .catch(() => null);

    await click();

    if (options?.waitForBulkExport) {
      await waitForEInvoiceListValidatingGone(this.page, timeoutMs).catch(() => {});
    }

    try {
      return await Promise.race([
        apiResponsePromise.then((api) => {
          if (!api) throw new Error("api-null");
          return api;
        }),
        downloadPromise.then((download) => {
          if (!download) throw new Error("dl-null");
          return download;
        }),
        new Promise<InvoiceFileDownloadResponse>((_, reject) =>
          setTimeout(() => reject(new Error("download-timeout")), timeoutMs)
        ),
      ]);
    } catch {
      const apiResponse = await apiResponsePromise;
      if (apiResponse) return apiResponse;

      const download = await downloadPromise;
      if (download) return download;

      const toastMessage = await this.peekVisibleToastMessage({ timeoutMs: 2_000 });
      const toastSuffix = toastMessage ? ` Toast message: ${toastMessage}` : "";
      throw new Error(
        "Invoice download did not start after menu click (no API response or browser download)." +
          toastSuffix
      );
    }
  }

  /** Remove an active sub-filter chip (e.g. Duplicate) if shown above the invoice table. */
  async dismissSubFilterIfPresent(filterLabel: string): Promise<void> {
    const chip = this.page.locator(".sub-filter-item").filter({
      has: this.page.locator(".sub-title", {
        hasText: new RegExp(`^\\s*${escapeRegExp(filterLabel)}\\s*$`, "i"),
      }),
    });
    if ((await chip.count()) === 0) return;

    const cancel = chip.locator('.cancel-icon[role="presentation"]').first();
    if (!(await cancel.isVisible().catch(() => false))) return;

    await cancel.click();
    await this.page.waitForTimeout(500);
    await waitForEInvoiceListValidatingGone(this.page, 30_000).catch(() => {});
  }

  /** Header **select all** checkbox (`data-testid="allData"`). */
  async selectAllInvoiceRowsCheckbox(): Promise<void> {
    await waitForEInvoiceListValidatingGone(this.page, 30_000).catch(() => {});
    const rows = this.invoiceDataRows();
    await expect(rows.first()).toBeVisible({ timeout: 30_000 });

    const checkbox = this.page.getByTestId("allData");
    await expect(checkbox).toBeAttached({ timeout: 30_000 });

    if (!(await checkbox.isChecked().catch(() => false))) {
      const checkmark = this.page
        .locator("th.checkbox-th label.checkbox-container .checkmarks")
        .first();
      if (await checkmark.count()) {
        await checkmark.scrollIntoViewIfNeeded().catch(() => {});
        try {
          await checkmark.click({ timeout: 8_000 });
        } catch {
          await checkbox.check({ force: true });
        }
      } else {
        await checkbox.check({ force: true });
      }
    }

    await expect(checkbox).toBeChecked({ timeout: 10_000 });
  }

  /** Open the **Bulk Action** toolbar dropdown. */
  async openBulkActionDropdown(): Promise<void> {
    const container = this.page.locator("#bulk-actionable-dropdown");
    const button = container.getByRole("button", { name: /bulk action/i });
    await expect(button).toBeVisible({ timeout: 30_000 });
    await button.scrollIntoViewIfNeeded().catch(() => {});
    try {
      await button.click({ timeout: 8_000 });
    } catch {
      await button.click({ timeout: 8_000, force: true });
    }
    await expect(container.locator(".select-btn-container")).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Bulk Action → toolbar list item by exact label (e.g. Submit, Submit as PDF).
   * Call after {@link selectAllInvoiceRowsCheckbox} (or per-row selection).
   */
  async clickBulkActionListItem(label: string): Promise<void> {
    await this.openBulkActionDropdown();
    const menu = this.page.locator("#bulk-actionable-dropdown .select-btn-container");
    const item = menu
      .locator('.list-item[role="presentation"]')
      .filter({
        has: this.page.locator(".label-container", {
          hasText: new RegExp(`^\\s*${escapeRegExp(label)}\\s*$`, "i"),
        }),
      })
      .first();
    await expect(item).toBeVisible({ timeout: 10_000 });
    try {
      await item.click({ timeout: 8_000 });
    } catch {
      await item.click({ timeout: 8_000, force: true });
    }
    await expect(menu).toBeHidden({ timeout: 15_000 }).catch(() => {});
  }

  /** Bulk Action → **Submit**. */
  async clickBulkActionSubmit(): Promise<void> {
    await this.clickBulkActionListItem("Submit");
  }

  /** Bulk Action → **Submit as PDF** (submit with PDF attachment). */
  async clickBulkActionSubmitAsPdf(): Promise<void> {
    await this.clickBulkActionListItem("Submit as PDF");
  }

  /**
   * Search the invoice table (partial/prefix OK when the UI filters with contains).
   * Used for bulk flows so only the uploaded batch is visible before select-all.
   */
  async searchInvoiceTable(query: string): Promise<void> {
    await this.searchInvoiceInTable(query);
  }

  /** Bulk Action → **Download** nested submenu container (Excel, JSON, XML, PDF). */
  async openBulkDownloadSubmenu(): Promise<Locator> {
    const menu = this.page.locator("#bulk-actionable-dropdown .select-btn-container");
    const download = menu
      .locator(".list-item.sub-dropdown")
      .filter({
        has: this.page.locator(".label-container", { hasText: /^Download$/i }),
      })
      .first();

    await expect(download).toBeVisible({ timeout: 10_000 });
    await download.click();

    const submenu = this.page.locator(".sub-dropdown-container").filter({ visible: true }).last();
    await expect(submenu).toBeVisible({ timeout: 10_000 });
    return submenu;
  }

  /** Bulk Action → **Download Records** nested submenu container. */
  async openBulkDownloadRecordsSubmenu(): Promise<Locator> {
    const menu = this.page.locator("#bulk-actionable-dropdown .select-btn-container");
    const downloadRecords = menu
      .locator(".list-item.sub-dropdown")
      .filter({
        has: this.page.locator(".label-container", { hasText: /^Download Records$/i }),
      })
      .first();

    await expect(downloadRecords).toBeVisible({ timeout: 10_000 });
    await downloadRecords.click();

    const submenu = this.page.locator(".sub-dropdown-container").filter({ visible: true }).last();
    await expect(submenu).toBeVisible({ timeout: 10_000 });
    return submenu;
  }

  /** Click a **Download Records** option (e.g. Error Records) and return the download response. */
  async clickBulkDownloadRecordsOption(
    submenu: Locator,
    optionLabel: string
  ): Promise<InvoiceFileDownloadResponse> {
    const item = submenu
      .locator('.sub-list-item[role="presentation"]')
      .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(optionLabel)}\\s*$`, "i") })
      .first();
    await expect(item).toBeVisible({ timeout: 10_000 });

    return this.waitForInvoiceDownloadAfterClick(() => item.click(), {
      timeoutMs: BULK_DOWNLOAD_RESPONSE_TIMEOUT_MS,
      waitForBulkExport: true,
    });
  }

  /**
   * Read a visible toast/alert if present (does not fail when absent).
   * Use on download failures so Allure/report errors include the UI message.
   */
  async peekVisibleToastMessage(options?: { timeoutMs?: number }): Promise<string | null> {
    const timeoutMs = options?.timeoutMs ?? 1_000;
    const deadline = Date.now() + timeoutMs;

    const locatorFactories: Array<() => Locator> = [
      () => this.page.locator('[role="alert"]').filter({ visible: true }),
      () => this.page.locator('[role="status"]').filter({ visible: true }),
      () => this.page.locator(".Toastify__toast, .Toastify__toast-body").filter({ visible: true }),
      () => this.page.locator(".MuiSnackbar-root, .MuiAlert-root, .MuiAlert-message").filter({ visible: true }),
      () =>
        this.page
          .locator(
            ".toast, .toast-container, .toast-box, .notification, .snackbar, .react-hot-toast, .message-box"
          )
          .filter({ visible: true }),
      () => this.page.locator(".alert, .warning, .info-banner").filter({ visible: true }),
    ];

    while (Date.now() < deadline) {
      for (const factory of locatorFactories) {
        const candidate = factory().first();
        if ((await candidate.count()) === 0) continue;
        if (!(await candidate.isVisible().catch(() => false))) continue;

        const text = (await candidate.innerText()).replace(/\s+/g, " ").trim();
        if (text.length > 0) {
          flowLog("DashboardPage", `Toast message: ${text}`);
          return text;
        }
      }
      await this.page.waitForTimeout(250);
    }

    return null;
  }

  /**
   * Bulk Download Records option that should **not** download a file (e.g. Valid Records on Error filter).
   * Expects a toast message instead.
   */
  async expectToastMessage(options?: { timeoutMs?: number }): Promise<string> {
    const timeoutMs = options?.timeoutMs ?? 20_000;
    const text = await this.peekVisibleToastMessage({ timeoutMs });
    if (text) return text;
    throw new Error("Toast message did not appear after bulk Download Records action.");
  }

  /**
   * Bulk Download Records option that should **not** download a file (e.g. Valid Records on Error filter).
   * Expects a toast message instead.
   */
  async clickBulkDownloadRecordsOptionExpectingToast(
    submenu: Locator,
    optionLabel: string
  ): Promise<string> {
    const item = submenu
      .locator('.sub-list-item[role="presentation"]')
      .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(optionLabel)}\\s*$`, "i") })
      .first();
    await expect(item).toBeVisible({ timeout: 10_000 });

    const toastPromise = this.expectToastMessage({ timeoutMs: 20_000 });
    await item.click();
    return toastPromise;
  }

  /**
   * Bulk / row Download format option that should **not** download a file
   * (e.g. JSON/PDF/XML on Ready to Submit or Error filter). Expects a toast instead.
   */
  async clickDownloadFormatInSubmenuExpectingToast(
    submenu: Locator,
    formatLabel: string
  ): Promise<string> {
    const item = submenu
      .locator(".sub-list-item")
      .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(formatLabel)}\\s*$`, "i") })
      .first();
    await expect(item).toBeVisible({ timeout: 10_000 });

    const toastPromise = this.expectToastMessage({ timeoutMs: 20_000 });
    await item.click();
    return toastPromise;
  }
}
