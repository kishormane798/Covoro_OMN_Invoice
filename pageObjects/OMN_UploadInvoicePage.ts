/**
 * Upload invoice dialog: open modal, attach file, wait for completed/error UI, download error .xlsx.
 *
 * `waitForStatus` / `waitForAnyStatus` poll and optionally click refresh. Error download races the
 * file API response with Playwright's `download` event (`downloadErrorFileViaClick`).
 */

import { Page, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import {
  type UploadTemplateUiMode,
  labelForUploadTemplateMode,
} from '../Helpers/uploadHelper';
import { waitForLocatorWithPageRefresh } from '../Helpers/waitForWithPageRefresh';
import { generatedFiles } from '../utils/invoiceExcel';

const SELECTORS = {
    uploadButton: '#upload-invoice-btn',
    fileInput: '#file-input',
    uploadTitle: '.upload-title',
    refreshIcon: '.refresh-icon',
    uploadContent: '.content',
    completedStatus: '.content span.completed, .content span.success',
    errorStatus: '.content span.error, .content span.failed',
    downloadErrorIcon: '#download-error-file',
    currentSelection: '.current-selection',
    changeMappingButton: '.change-mapping-btn button',
    templateInput: '#template',
    templateListbox: '#template-listbox',
    templateAutocompleteRoot: '.MuiAutocomplete-root',
} as const;

const DOWNLOAD_RESPONSE_TIMEOUT_MS = 30000;
const DEFAULT_UPLOAD_STATUS_TIMEOUT_MS = 20 * 60 * 1000;
const UPLOAD_REFRESH_CLICK_TIMEOUT_MS = 1500;
const UPLOAD_STATUS_TIMEOUT_MS = (() => {
    const raw = process.env.UPLOAD_STATUS_TIMEOUT_MS?.trim();
    if (!raw) {
        return DEFAULT_UPLOAD_STATUS_TIMEOUT_MS;
    }
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n >= 60_000
        ? n
        : DEFAULT_UPLOAD_STATUS_TIMEOUT_MS;
})();

export class UploadInvoicePage {

    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    
    private uploadButton = () => this.page.locator(SELECTORS.uploadButton);

    private fileInput = () => this.page.locator(SELECTORS.fileInput);

    private uploadTitle = () =>
        this.page.locator(SELECTORS.uploadTitle).filter({ hasText: /Upload Excel File/i }).first();

    private refreshIcon = () => this.page.locator(SELECTORS.refreshIcon);

    /** Refresh beside upload row status — prefer scoped so we never hit another `.refresh-icon` on the page. */
    private uploadRowRefreshIcon = () =>
        this.page.locator(SELECTORS.uploadContent).locator(SELECTORS.refreshIcon).first();

    private completedStatus = () => this.page.locator(SELECTORS.completedStatus).first();

    private errorStatus = () => this.page.locator(SELECTORS.errorStatus).first();

    private completedStatuses = () => this.page.locator(SELECTORS.completedStatus);

    private errorStatuses = () => this.page.locator(SELECTORS.errorStatus);

    private downloadErrorIcon = () => this.page.locator(SELECTORS.downloadErrorIcon);

    private saveOrNextButton = () =>
        this.page.getByRole('button', { name: /(Process|Save)\s*&\s*Next/i }).first();

    
    private static normalizeSelectionText(value: string | null | undefined): string {
        return (value ?? '').replace(/\s+/g, ' ').trim();
    }

    /** First `.current-selection h5` is often the section title "Current Selection", not the template name. */
    private async readCurrentTemplateMapping(
        currentSelectionBlock: ReturnType<Page['locator']>
    ): Promise<{ templateLabel: string; blockText: string }> {
        const blockText = UploadInvoicePage.normalizeSelectionText(
            await currentSelectionBlock.innerText().catch(() => '')
        );
        const h5Texts = (await currentSelectionBlock.locator('h5').allTextContents())
            .map((t) => UploadInvoicePage.normalizeSelectionText(t))
            .filter(Boolean);
        const templateFromH5 = h5Texts.find((t) => !/^current selection$/i.test(t));
        return {
            templateLabel: templateFromH5 ?? h5Texts[0] ?? '',
            blockText,
        };
    }

    private isNotSelectedPlaceholder(templateLabel: string, blockText: string): boolean {
        if (/^not selected$/i.test(templateLabel)) {
            return true;
        }
        return /current selection\s+not selected/i.test(blockText);
    }

    private currentSelectionMatchesExpected(
        templateLabel: string,
        blockText: string,
        expectedLabel: string
    ): boolean {
        const label = UploadInvoicePage.normalizeSelectionText(templateLabel);
        const block = UploadInvoicePage.normalizeSelectionText(blockText);
        const expected = UploadInvoicePage.normalizeSelectionText(expectedLabel);
        if (!label && !block) {
            return false;
        }
        if (this.isNotSelectedPlaceholder(label, block)) {
            return false;
        }
        if (label === expected || block.includes(expected)) {
            return true;
        }
        const loose =
            /covoro\s+template\s*-\s*excel/i.test(expected) &&
            !/simplified/i.test(expected)
                ? /COVORO\s+Template\s*-\s*Excel/i.test(label) ||
                  (/COVORO\s+Template\s*-\s*Excel/i.test(block) &&
                    !/Simplified/i.test(block))
                : /COVORO.*Simplified.*Template|OMAN.*Simplified/i.test(label) ||
                  /COVORO.*Simplified.*Template|OMAN.*Simplified/i.test(block);
        return Boolean(loose);
    }

    /** UI often shows "Not Selected" briefly before the saved mapping label loads. */
    private async waitForResolvedTemplateSelection(
        currentSelectionBlock: ReturnType<Page['locator']>,
        expectedLabel: string,
        timeoutMs = 15000
    ): Promise<{ templateLabel: string; blockText: string; matched: boolean }> {
        const deadline = Date.now() + timeoutMs;
        let last = { templateLabel: '', blockText: '' };
        while (Date.now() < deadline) {
            last = await this.readCurrentTemplateMapping(currentSelectionBlock);
            if (
                this.currentSelectionMatchesExpected(
                    last.templateLabel,
                    last.blockText,
                    expectedLabel
                )
            ) {
                return { ...last, matched: true };
            }
            if (!this.isNotSelectedPlaceholder(last.templateLabel, last.blockText)) {
                return { ...last, matched: false };
            }
            await this.page.waitForTimeout(400);
        }
        return { ...last, matched: false };
    }

    private async readTemplateMappingInputValue(): Promise<string> {
        const templateInput = this.page.locator(SELECTORS.templateInput);
        if ((await templateInput.count()) > 0) {
            const value = UploadInvoicePage.normalizeSelectionText(
                await templateInput.inputValue().catch(() => '')
            );
            if (value) {
                return value;
            }
        }
        const templateCombo = this.page.getByRole('combobox', { name: /^Template/i }).first();
        if ((await templateCombo.count()) > 0) {
            const fromCombo = UploadInvoicePage.normalizeSelectionText(
                await templateCombo.innerText().catch(() => '')
            );
            if (fromCombo) {
                return fromCombo;
            }
        }
        return '';
    }

    /** Mapping wizard fields start disabled until **Edit** is clicked (common under parallel TIN load). */
    private async enableMappingWizardIfDisabled(): Promise<void> {
        const templateInput = this.page.locator(SELECTORS.templateInput);
        if (!(await templateInput.isDisabled().catch(() => false))) {
            return;
        }
        const edit = this.page.getByRole('button', { name: /^Edit$/i }).first();
        if ((await edit.count()) === 0) {
            return;
        }
        await edit.click({ timeout: 15000 });
        await expect(templateInput).toBeEnabled({ timeout: 20000 });
    }

    private async waitForTemplateMappingInputValue(timeoutMs = 20000): Promise<string> {
        let last = '';
        try {
            await expect.poll(async () => {
                last = await this.readTemplateMappingInputValue();
                return last.length > 0;
            }, { timeout: timeoutMs, intervals: [300, 500] }).toBe(true);
        } catch {
        }
        return last || (await this.readTemplateMappingInputValue());
    }

    private isOnChangeMappingRoute(): boolean {
        try {
            return new URL(this.page.url()).pathname.toLowerCase().includes('change-mapping');
        } catch {
            return this.page.url().toLowerCase().includes('change-mapping');
        }
    }

    private async hasUploadMappingModal(): Promise<boolean> {
        return (await this.saveOrNextButton().count()) > 0;
    }

    /** Leave mapping wizard via nav back-arrow, then ensure upload dialog is open. */
    private async returnToUploadViaBackArrow(): Promise<void> {
        const backArrow = this.page.getByTestId('back-arrow').first();
        if ((await backArrow.count()) > 0) {
            await backArrow.click({ timeout: 15000 });
        } else {
            const einvoiceDashboard = this.page
                .getByRole('link', { name: /E-Invoice Dashboard/i })
                .first();
            if ((await einvoiceDashboard.count()) > 0) {
                await einvoiceDashboard.click({ timeout: 15000 });
            } else {
                await this.page.goto('/einvoice-dashboard', { waitUntil: 'domcontentloaded' });
            }
        }

        const fileInputVisible =
            (await this.fileInput().count().catch(() => 0)) > 0 &&
            (await this.uploadTitle().isVisible().catch(() => false));
        if (!fileInputVisible) {
            await this.uploadButton().waitFor({ state: 'visible', timeout: 30000 });
            await this.openUploadDialog();
        } else {
            await this.fileInput().waitFor({ state: 'attached', timeout: 20000 });
        }
    }

    private async assertUploadTemplateSelection(
        currentSelectionBlock: ReturnType<Page['locator']>,
        expectedLabel: string
    ): Promise<void> {
        const matchesExpectedSelection = async () => {
            const { templateLabel, blockText } =
                await this.readCurrentTemplateMapping(currentSelectionBlock);
            return this.currentSelectionMatchesExpected(
                templateLabel,
                blockText,
                expectedLabel
            );
        };
        await expect.poll(matchesExpectedSelection, {
            timeout: 20000,
            intervals: [500],
        }).toBe(true);
        await this.fileInput().waitFor({ state: 'attached', timeout: 20000 });
        await expect(this.uploadTitle()).toBeVisible({ timeout: 20000 });
    }

    private async completeMappingWizardAndReturnToUpload(
        currentSelectionBlock: ReturnType<Page['locator']>,
        expectedLabel: string
    ): Promise<void> {
        if (this.isOnChangeMappingRoute() && !(await this.hasUploadMappingModal())) {
            await this.returnToUploadViaBackArrow();
            await this.assertUploadTemplateSelection(currentSelectionBlock, expectedLabel);
            return;
        }

        await this.enableMappingWizardIfDisabled();

        const saveOrNextBtn = this.saveOrNextButton();
        if ((await saveOrNextBtn.count()) === 0) {
            if (this.isOnChangeMappingRoute()) {
                await this.returnToUploadViaBackArrow();
                await this.assertUploadTemplateSelection(currentSelectionBlock, expectedLabel);
                return;
            }
            throw new Error('Save/Process & Next not found in template mapping wizard');
        }
        await saveOrNextBtn.click({ timeout: 15000 });
        await this.page.waitForTimeout(500);

        const returnedToUploadView =
            (await this.fileInput().count().catch(() => 0)) > 0 &&
            (await this.uploadTitle().isVisible().catch(() => false));
        if (!returnedToUploadView) {
            await this.returnToUploadViaBackArrow();
        }
        await this.assertUploadTemplateSelection(currentSelectionBlock, expectedLabel);
    }

    /**
     * Clicks the upload-row refresh control. MUI overlays / layout sometimes intercept normal clicks; we fall back to
     * `force` click only (no DOM `evaluate` — detached nodes can hang).
     */
    private async tryClickUploadRowRefresh(): Promise<void> {
        if (this.page.isClosed()) {
            return;
        }
        const scoped = this.uploadRowRefreshIcon();
        const fallback = this.refreshIcon().first();
        const icon = (await scoped.count()) > 0 ? scoped : fallback;
        if ((await icon.count()) === 0) {
            return;
        }
        if (!(await icon.isVisible().catch(() => false))) {
            return;
        }
        try {
            await icon.click({ timeout: UPLOAD_REFRESH_CLICK_TIMEOUT_MS });
            return;
        } catch {
            if (this.page.isClosed()) {
                return;
            }
        }
        try {
            await icon.click({ force: true, timeout: UPLOAD_REFRESH_CLICK_TIMEOUT_MS });
            return;
        } catch {
            if (this.page.isClosed()) {
                return;
            }
        }
    }

    async openUploadDialog() {
        const fileInputVisible =
            (await this.fileInput().count().catch(() => 0)) > 0 &&
            (await this.uploadTitle().isVisible().catch(() => false));
        if (!fileInputVisible) {
            const btn = this.uploadButton();
            await waitForLocatorWithPageRefresh(this.page, btn, {
                state: 'visible',
                attemptTimeoutMs: 30_000,
                afterRefreshTimeoutMs: 30_000,
                maxRefreshes: 1,
            });
            await btn.scrollIntoViewIfNeeded().catch(() => {});
            try {
                await btn.click({ timeout: 15000 });
            } catch {
                await btn.click({ timeout: 15000, force: true });
            }
        }
        await this.fileInput().waitFor({ state: 'attached' });
    }

    /**
     * Ensures "Current Selection" matches the expected COVORO template mapping before upload.
     * Re-reads the label after the wait loop and skips the wizard when mapping is already correct
     * (label can stay "Not Selected" while `#template` holds the right value).
     */
    async ensureExpectedTemplateMapping(mode: UploadTemplateUiMode): Promise<void> {
        const expectedLabel = labelForUploadTemplateMode(mode);
        const currentSelectionBlock = this.page.locator(SELECTORS.currentSelection).first();

        try {
            await currentSelectionBlock.waitFor({ state: 'visible', timeout: 15000 });
        } catch {
            return;
        }

        const resolved = await this.waitForResolvedTemplateSelection(
            currentSelectionBlock,
            expectedLabel,
            12000
        );
        if (resolved.matched) {
            return;
        }

        await this.page.waitForTimeout(800);
        const recheck = await this.readCurrentTemplateMapping(currentSelectionBlock);
        const preWizardTemplateValue = await this.readTemplateMappingInputValue();
        if (
            this.currentSelectionMatchesExpected(
                recheck.templateLabel,
                recheck.blockText,
                expectedLabel
            ) ||
            this.currentSelectionMatchesExpected(
                preWizardTemplateValue,
                preWizardTemplateValue,
                expectedLabel
            )
        ) {
            return;
        }

        if (
            this.isNotSelectedPlaceholder(recheck.templateLabel, recheck.blockText) &&
            this.isNotSelectedPlaceholder(resolved.templateLabel, resolved.blockText)
        ) {
            return;
        }

        const changeMapping = this.page
            .locator(SELECTORS.changeMappingButton)
            .filter({ hasText: /Change Mapping/i })
            .first();
        if ((await changeMapping.count()) === 0) {
            throw new Error(
                `Change Mapping not found; cannot set template to "${expectedLabel}" (current: "${resolved.templateLabel || resolved.blockText}")`
            );
        }
        await changeMapping.click({ timeout: 15000 });
        await this.page.waitForTimeout(300);

        const templateInput = this.page.locator(SELECTORS.templateInput);
        await templateInput.waitFor({ state: 'visible', timeout: 15000 });
        await this.enableMappingWizardIfDisabled();
        const mappingInputValue = await this.waitForTemplateMappingInputValue(20000);
        if (
            this.currentSelectionMatchesExpected(
                mappingInputValue,
                mappingInputValue,
                expectedLabel
            )
        ) {
            await this.completeMappingWizardAndReturnToUpload(
                currentSelectionBlock,
                expectedLabel
            );
            return;
        }

        await this.enableMappingWizardIfDisabled();
        if (await templateInput.isDisabled().catch(() => false)) {
            throw new Error(
                `Template field stayed disabled (value="${mappingInputValue || '(empty)'}"). ` +
                    `Expected "${expectedLabel}". Enable mapping via Edit or set template for this TIN.`
            );
        }
        await templateInput.click({ timeout: 15000 });

        const listbox = this.page.locator(SELECTORS.templateListbox);
        if (!(await listbox.isVisible().catch(() => false))) {
            const autoRoot = this.page
                .locator(SELECTORS.templateAutocompleteRoot)
                .filter({ has: this.page.locator(SELECTORS.templateInput) });
            const openBtn = autoRoot.locator('button[title="Open"]');
            if (await openBtn.count()) {
                await openBtn.first().click();
            }
        }

        await listbox.waitFor({ state: 'visible', timeout: 10000 });

        const exactOption = this.page.getByRole('option', {
            name: expectedLabel,
            exact: true
        });
        if ((await exactOption.count()) > 0) {
            await exactOption.click();
        } else {
            const loose =
                mode === 'simplified'
                    ? listbox
                          .locator('[role="option"]')
                          .filter({ hasText: /COVORO.*Simplified.*Template|OMAN.*Simplified/i })
                          .first()
                    : listbox
                          .locator('[role="option"]')
                          .filter({ hasText: /COVORO Template - Excel/i })
                          .filter({ hasNotText: /Simplified/i })
                          .first();
            if ((await loose.count()) === 0) {
                const fromListbox = await listbox.locator('[role="option"]').allTextContents();
                throw new Error(
                  `Template option "${expectedLabel}" not found in dropdown. Options: ${JSON.stringify(fromListbox)}`
                );
            }
            await loose.click();
        }

        if (this.isOnChangeMappingRoute() && !(await this.hasUploadMappingModal())) {
            const saveBtn = this.page.getByRole('button', { name: /^Save$/i }).first();
            if ((await saveBtn.count()) > 0 && (await saveBtn.isVisible().catch(() => false))) {
                await saveBtn.click({ timeout: 15000 });
                await this.page.waitForTimeout(500);
            }
        }

        await this.completeMappingWizardAndReturnToUpload(
            currentSelectionBlock,
            expectedLabel
        );
    }

    /** Registers the workbook path for failure attachments (uploaded file — not server download). */
    async uploadFile(filePath: string) {
        if (!generatedFiles.includes(filePath)) {
            generatedFiles.push(filePath);
        }
        await this.fileInput().waitFor({ state: 'attached', timeout: 20000 });
        await this.fileInput().setInputFiles(filePath);
    }

    async waitForStatus(status: 'completed' | 'error') {
        const expectedStatusLocator =
            status === 'completed'
                ? this.completedStatus()
                : this.errorStatus();
        const oppositeStatus = status === 'completed' ? 'error' : 'completed';
        const oppositeStatusLocator =
            status === 'completed'
                ? this.errorStatus()
                : this.completedStatus();

        await expect.poll(async () => {
            if (await expectedStatusLocator.count() > 0) {
                return true;
            }

            if (await oppositeStatusLocator.count() > 0) {
                const observedText =
                    (await oppositeStatusLocator.first().textContent().catch(() => null))?.trim() ?? oppositeStatus;
                throw new Error(
                    `Upload status mismatch: expected "${status}" but observed "${oppositeStatus}" (${observedText}).`
                );
            }

            await this.tryClickUploadRowRefresh();

            return false;

        }, {
            timeout: UPLOAD_STATUS_TIMEOUT_MS,
            intervals: [500],
        }).toBe(true);
    }

    async waitForAnyStatus(): Promise<'completed' | 'error'> {
        const timeoutMs = UPLOAD_STATUS_TIMEOUT_MS;
        const start = Date.now();

        while (Date.now() - start < timeoutMs) {
            if (this.page.isClosed()) {
                throw new Error('Upload wait ended: page or browser was closed');
            }
            if (await this.errorStatus().count() > 0) {
                return 'error';
            }
            if (await this.completedStatus().count() > 0) {
                return 'completed';
            }
            await this.tryClickUploadRowRefresh();
            try {
                await this.page.waitForTimeout(500);
            } catch (error) {
                if (this.page.isClosed()) {
                    throw new Error('Upload wait ended: page or browser was closed');
                }
                throw error;
            }
        }

        throw new Error('Upload status did not become completed/error within timeout');
    }

    /**
     * After attach: pass if Status becomes Error, or no terminal Completed/Error within
     * `timeoutMs` (client-side reject / AV block with no history row). Fail if Completed.
     */
    async waitForUploadRejected(timeoutMs = 90_000): Promise<'error' | 'no-status'> {
        const completed = this.completedStatus();
        const error = this.errorStatus();
        const deadline = Date.now() + timeoutMs;

        while (Date.now() < deadline) {
            if (this.page.isClosed()) {
                throw new Error('Upload reject wait ended: page or browser was closed');
            }
            if ((await completed.count()) > 0) {
                throw new Error(
                    'Upload reached Completed but rejection (error or no-status) was expected',
                );
            }
            if ((await error.count()) > 0) {
                return 'error';
            }
            await this.tryClickUploadRowRefresh();
            try {
                await this.page.waitForTimeout(500);
            } catch (error) {
                if (this.page.isClosed()) {
                    throw new Error('Upload reject wait ended: page or browser was closed');
                }
                throw error;
            }
        }

        return 'no-status';
    }

    async waitForErrorFileDownloadEnabled() {
        const downloadButton = this.downloadErrorIcon();
        const totalMs = 80_000;
        await waitForLocatorWithPageRefresh(this.page, downloadButton, {
            state: "visible",
            attemptTimeoutMs: 60_000,
            afterRefreshTimeoutMs: totalMs - 60_000,
            maxRefreshes: 1,
        });
        await expect(downloadButton).toBeEnabled({ timeout: totalMs });
    }

    private isErrorFileDownloadUrl(url: string): boolean {
        return /\/file\/v1\/download|\/file\/v1\/.*\/download/i.test(url);
    }

    async downloadErrorFileViaClick(): Promise<string> {
        const timeoutMs = DOWNLOAD_RESPONSE_TIMEOUT_MS;
        const filePath = path.join(
            process.cwd(),
            'test-results',
            `error-${Date.now()}.xlsx`
        );

        const fromApi = this.page
            .waitForResponse(
                (res) =>
                    this.isErrorFileDownloadUrl(res.url()) &&
                    (res.status() === 200 || res.status() === 201),
                { timeout: timeoutMs }
            )
            .then(async (response) => {
                const buffer = await response.body();
                fs.mkdirSync(path.dirname(filePath), { recursive: true });
                fs.writeFileSync(filePath, buffer);
                return filePath;
            });

        const fromBrowserDownload = this.page
            .waitForEvent('download', { timeout: timeoutMs })
            .then(async (download) => {
                fs.mkdirSync(path.dirname(filePath), { recursive: true });
                await download.saveAs(filePath);
                return filePath;
            });

        await this.downloadErrorIcon().click();

        try {
            return await Promise.race([fromBrowserDownload, fromApi]);
        } catch {
            const settled = await Promise.allSettled([fromBrowserDownload, fromApi]);
            const won = settled.find(
                (result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled'
            );
            if (won) {
                return won.value;
            }
            throw new Error(
                'Error file download did not start after clicking #download-error-file (no matching file download response or browser download event).'
            );
        }
    }
}
