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
import { printErrorWorkbookMessages } from "../../utils/excel/invoiceExcel";
// ENABLE: single-line Excel round-trip (Ready to Submit → Download Excel → compare).
// Say "enable it" to uncomment the import and the call in uploadAndVerify.
// import { assertSingleLineUploadedExcelRoundTrip } from "./invoiceExcelRoundTripHelper";

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

/** Avoid a second `goto` when baseTest already opened business-dashboard (SPA navigation race). */
async function ensureLoggedIn(page: Page): Promise<void> {
    const dashboardUrl = buildAppUrl('/business-dashboard');

    const settle = async (): Promise<void> => {
        await page.waitForLoadState('load', { timeout: 6000 }).catch(() => {});
        await page.waitForTimeout(400);
    };

    if (page.url().includes('business-dashboard') && !page.url().includes('/login')) {
        await settle();
        if (await isOnAuthenticatedDashboard(page)) {
            return;
        }
    }

    await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });
    await settle();
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
      const dashboardUrl = buildAppUrl('/business-dashboard');
      await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('load', { timeout: 6000 }).catch(() => {});
      await page.waitForTimeout(400);
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
    // ENABLE: await assertSingleLineUploadedExcelRoundTrip(page, filePath);
}


export async function uploadAndVerifyError(
    page: Page,
    filePath: string
) {
    await uploadAndVerifyStatus(page, filePath, 'error');
    const uploadPage = new UploadInvoicePage(page);
    await uploadPage.waitForErrorFileDownloadEnabled();
    const errorFilePath = await uploadPage.downloadErrorFileViaClick();
    printErrorWorkbookMessages(errorFilePath, 6);
}

/** Open upload dialog without waiting for file status (submit / edit flows). */
export async function openUploadPage(
  page: Page,
  options?: { businessTin?: string }
) {
    return navigateToUpload(page, options);
}
