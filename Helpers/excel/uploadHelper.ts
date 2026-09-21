/**
 * Upload navigation and status verification — session-safe path from login through
 * dashboard **Go to E-Invoicing**, template dropdown mapping, and upload dialog.
 *
 * Template labels (`UPLOAD_TEMPLATE_LABEL_*`) must match the workbook from
 * `getInvoiceTemplatePath()` (Covoro full vs Simplified).
 */
import path from "node:path";
import type { Page } from '@playwright/test';
import { DashboardPage } from '../../pageObjects/OMN_DashboardPage';
import { UploadInvoicePage } from '../../pageObjects/OMN_UploadInvoicePage';
import { LoginPage } from '../../pageObjects/OMN_LoginPage';
import { getInvoiceTemplatePath } from "../../utils/excel/invoiceExcel";
import { parallelWorkerDashboardOpenOpts } from "../worker/parallelWorkerSubmitIdentity";
import { resolveBaseUrl } from "../../utils/appConfig";
import { flowLog } from "../diagnosticLog";
// Excel round-trip is field-validation only (`uploadAndVerifyFieldAccepted`).
// Do not hook it here — formula, conditional, dropdown, and multi-line would inherit it.

export type UploadTemplateUiMode = "normal" | "simplified";

export const UPLOAD_TEMPLATE_LABEL_NORMAL = "COVORO Template - Excel";
export const UPLOAD_TEMPLATE_LABEL_SIMPLIFIED =
  "COVORO - OMAN E-Invoice Simplified Template";

export function getExpectedUploadTemplateMode(): UploadTemplateUiMode {
  const resolved = getInvoiceTemplatePath();
  const base = path.basename(resolved).toLowerCase();
  return base.includes("simplified") ? "simplified" : "normal";
}

export function labelForUploadTemplateMode(mode: UploadTemplateUiMode): string {
  return mode === "normal"
    ? UPLOAD_TEMPLATE_LABEL_NORMAL
    : UPLOAD_TEMPLATE_LABEL_SIMPLIFIED;
}

function buildAppUrl(pathname: string): string {
    const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
    return `${resolveBaseUrl()}${normalizedPath}`;
}

async function hasPersistedAuthSession(page: Page): Promise<boolean> {
    return page
        .evaluate(() => {
            try {
                return sessionStorage.getItem('persist:root') != null;
            } catch {
                return false;
            }
        })
        .catch(() => false);
}

async function isOnAuthenticatedDashboard(page: Page): Promise<boolean> {
    const url = page.url();
    if (url.includes('/login') || !url.includes('business-dashboard')) {
        return false;
    }
    return hasPersistedAuthSession(page);
}

function isOnBusinessDashboard(page: Page): boolean {
    const url = page.url();
    return url.includes('business-dashboard') && !url.includes('/login');
}

/** Navigation budget only. Do not wait for document `load` — this SPA often never fires it (~1 min blank). */
const DASHBOARD_GOTO_TIMEOUT_MS = 20_000;

async function settleDashboardDocument(page: Page): Promise<void> {
    await page
        .waitForFunction(
            () => {
                try {
                    return window.sessionStorage.getItem('persist:root') != null;
                } catch {
                    return false;
                }
            },
            undefined,
            { timeout: 5_000 }
        )
        .catch(() => {});
}

async function gotoBusinessDashboard(page: Page): Promise<void> {
    await page.goto(buildAppUrl('/business-dashboard'), {
        waitUntil: 'commit',
        timeout: DASHBOARD_GOTO_TIMEOUT_MS,
    });
    if (!page.url().includes('business-dashboard')) {
        await page
            .waitForURL(/business-dashboard/, {
                timeout: DASHBOARD_GOTO_TIMEOUT_MS,
                waitUntil: 'commit',
            })
            .catch(() => {});
    }
    await settleDashboardDocument(page);
}

/** Avoid a second `goto` when baseTest already opened business-dashboard (SPA navigation race). */
async function ensureLoggedIn(page: Page): Promise<void> {
    if (isOnBusinessDashboard(page)) {
        await settleDashboardDocument(page);
        if (await isOnAuthenticatedDashboard(page)) {
            return;
        }
        await page
            .waitForFunction(
                () => {
                    try {
                        return window.sessionStorage.getItem('persist:root') != null;
                    } catch {
                        return false;
                    }
                },
                undefined,
                { timeout: 8_000 }
            )
            .catch(() => {});
        if (await isOnAuthenticatedDashboard(page)) {
            return;
        }
    }

    await gotoBusinessDashboard(page);
    if (await isOnAuthenticatedDashboard(page)) {
        return;
    }

    const email = process.env.TEST_USER_EMAIL ?? '';
    const password = process.env.TEST_USER_PASSWORD ?? '';
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email, password);
}

/**
 * Dashboard → upload dialog with correct template mapping.
 * Uses **Go to E-Invoicing** (not a deep link) so worker TIN header mapping is applied.
 */
async function navigateToUpload(
  page: Page,
  options?: { businessTin?: string }
): Promise<UploadInvoicePage> {
    const dashboardPage = new DashboardPage(page);
    const uploadPage = new UploadInvoicePage(page);
    await ensureLoggedIn(page);
    const dashboardOpenOpts = parallelWorkerDashboardOpenOpts(options);
    await dashboardPage.openDashboard(dashboardOpenOpts);

    if (await dashboardPage.isTinMissingBannerVisible()) {
      flowLog("UploadHelper", "TIN header missing — relaunching business-dashboard and retrying.");
      await gotoBusinessDashboard(page);
      await dashboardPage.openDashboard(dashboardOpenOpts);
    }

    await uploadPage.openUploadDialog();
    const mode = getExpectedUploadTemplateMode();
    flowLog("UploadHelper", `Ensuring upload template mapping: ${labelForUploadTemplateMode(mode)} (${mode}).`);
    await uploadPage.ensureExpectedTemplateMapping(mode);
    return uploadPage;
}

export async function uploadAndVerifyStatus(
    page: Page,
    filePath: string,
    expectedStatus: 'completed' | 'error'
) {
    const uploadPage = await navigateToUpload(page);
    await uploadPage.uploadFile(filePath);
    await uploadPage.waitForStatus(expectedStatus);
}

export async function uploadAndVerify(
    page: Page,
    filePath: string
) {
    await uploadAndVerifyStatus(page, filePath, 'completed');
}

/** Open upload dialog without waiting for file status (submit / edit flows). */
export async function openUploadPage(
  page: Page,
  options?: { businessTin?: string }
) {
    return navigateToUpload(page, options);
}
