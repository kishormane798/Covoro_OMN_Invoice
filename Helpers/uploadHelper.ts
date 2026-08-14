/**
 * Upload navigation and status verification — session-safe path from login through
 * dashboard **Go to E-Invoicing**, template dropdown mapping, and upload dialog.
 *
 * Template label (`UPLOAD_TEMPLATE_LABEL_NORMAL`) must match the workbook from
 * `getInvoiceTemplatePath()` (Covoro / full / OMN primary template).
 */
import type { Page } from '@playwright/test';
import { DashboardPage } from '../pageObjects/DashboardPage';
import { UploadInvoicePage } from '../pageObjects/UploadInvoicePage';
import { LoginPage } from '../pageObjects/LoginPage';
import { parallelWorkerDashboardOpenOpts } from "./parallelWorkerSubmitIdentity";
import { resolveBaseUrl } from "../utils/appConfig";
import { flowLog } from "./diagnosticLog";
import { printErrorWorkbookMessages } from "../utils/invoiceExcel";

export type UploadTemplateUiMode = "normal";

export const UPLOAD_TEMPLATE_LABEL_NORMAL = "COVORO Template - Excel";

export function getExpectedUploadTemplateMode(): UploadTemplateUiMode {
  return "normal";
}

export function labelForUploadTemplateMode(_mode: UploadTemplateUiMode = "normal"): string {
  return UPLOAD_TEMPLATE_LABEL_NORMAL;
}

function buildAppUrl(pathname: string): string {
    const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
    return `${resolveBaseUrl()}${normalizedPath}`;
}

/** Avoid a second `goto` when baseTest already opened business-dashboard (SPA navigation race). */
async function ensureLoggedIn(page: Page): Promise<void> {
    const dashboardUrl = buildAppUrl('/business-dashboard');
    const current = page.url();
    if (current.includes('business-dashboard') && !current.includes('/login')) {
        await page.waitForLoadState('load', { timeout: 6000 }).catch(() => {});
        await page.waitForTimeout(400);
        return;
    }

    await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load', { timeout: 6000 }).catch(() => {});
    await page.waitForTimeout(400);

    if (!page.url().includes('/login')) {
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
