// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under a ui/ subfolder; executable code is commented out.
//
// import { expect, type Page } from "@playwright/test";
// import fs from "node:fs";
// import path from "node:path";
// import {
//   DashboardPage,
//   INVOICE_DOWNLOAD_FORMAT_LABEL,
//   type InvoiceDownloadFormatUi,
//   type InvoiceFileDownloadResponse,
//   type ReusableDashboardInvoice,
// } from "../pageObjects/DashboardPage";
// import { flowLog } from "./diagnosticLog";
// 
// export { INVOICE_DOWNLOAD_FORMAT_LABEL };
// 
// export type InvoiceDownloadFormat = InvoiceDownloadFormatUi;
// 
// export type InvoiceDownloadStatus = "ready to submit" | "delivered" | "error";
// 
// /** Invoice row statuses for Options â†’ Download. Upload file "completed" is out of scope here. */
// 
// export type InvoiceStatisticsCardLabel = "Ready to Submit" | "Delivered" | "Error in Records";
// 
// export type InvoiceFileDownloadPrepareOptions = {
//   status: InvoiceDownloadStatus;
//   statisticsCard?: InvoiceStatisticsCardLabel;
//   /** When false, scan the table without clicking a statistics card. */
//   useStatisticsCard?: boolean;
// };
// 
// export type InvoiceFileDownloadScenario = InvoiceFileDownloadPrepareOptions & {
//   id: string;
//   format: InvoiceDownloadFormat;
// };
// 
// export type InvoiceFileDownloadMenuScenario = InvoiceFileDownloadPrepareOptions & {
//   id: string;
//   visibleFormats: readonly InvoiceDownloadFormat[];
//   hiddenFormats: readonly InvoiceDownloadFormat[];
// };
// 
// export type InvoiceFileDownloadOptionScenario = InvoiceFileDownloadPrepareOptions & {
//   id: string;
// };
// 
// /** Bulk Action â†’ Download (or Download Records) â€” mirrors single-row download coverage per card. */
// export type InvoiceBulkDownloadFormatScenario = {
//   id: string;
//   statisticsCard: InvoiceStatisticsCardLabel;
//   /** Sub-filter chips to dismiss before select-all (e.g. Duplicate, Submission Error). */
//   subFiltersToRemove?: readonly string[];
//   format: InvoiceDownloadFormat;
//   /** Delivered: Bulk Action â†’ Download â†’ format. RTS/ERR: Bulk Action â†’ Download Records. */
//   menu: "download" | "download-records";
//   recordType?: "Valid Records" | "Error Records";
// };
// 
// /** Bulk mismatch action should toast, not download a file. */
// export type InvoiceBulkDownloadToastScenario = {
//   id: string;
//   statisticsCard: InvoiceStatisticsCardLabel;
//   subFiltersToRemove?: readonly string[];
//   /** Download Records mismatch, or Download â†’ format on a non-Delivered card. */
//   menu: "download" | "download-records";
//   /** Required when menu is download-records. */
//   recordType?: "Valid Records" | "Error Records";
//   /** Required when menu is download. */
//   format?: InvoiceDownloadFormat;
// };
// 
// export const UI_INVOICE_FILE_DOWNLOAD_TEST_TIMEOUT_MS = 3 * 60 * 1000;
// export const UI_INVOICE_BULK_DOWNLOAD_TEST_TIMEOUT_MS = 4 * 60 * 1000;
// 
// const RTS_CARD = "Ready to Submit" as const;
// const DEL_CARD = "Delivered" as const;
// const ERR_CARD = "Error in Records" as const;
// 
// const ALL_FORMATS: readonly InvoiceDownloadFormat[] = ["excel", "json", "pdf", "xml"];
// const EXCEL_ONLY: readonly InvoiceDownloadFormat[] = ["excel"];
// const NON_EXCEL: readonly InvoiceDownloadFormat[] = ["json", "pdf", "xml"];
// 
// function buildHiddenFormatMenuCases(
//   idPrefix: string,
//   status: InvoiceDownloadStatus,
//   card: InvoiceStatisticsCardLabel
// ): InvoiceFileDownloadMenuScenario[] {
//   return NON_EXCEL.map((format) => ({
//     id: `${idPrefix}-HIDDEN-${format.toUpperCase()}`,
//     status,
//     statisticsCard: card,
//     visibleFormats: EXCEL_ONLY,
//     hiddenFormats: [format],
//   }));
// }
// 
// const BASE_MENU_SCENARIOS: readonly InvoiceFileDownloadMenuScenario[] = [
//   {
//     id: "RTS-MENU",
//     status: "ready to submit",
//     statisticsCard: RTS_CARD,
//     visibleFormats: EXCEL_ONLY,
//     hiddenFormats: NON_EXCEL,
//   },
//   {
//     id: "DEL-MENU",
//     status: "delivered",
//     statisticsCard: DEL_CARD,
//     visibleFormats: ALL_FORMATS,
//     hiddenFormats: [],
//   },
//   {
//     id: "ERR-MENU",
//     status: "error",
//     statisticsCard: ERR_CARD,
//     visibleFormats: EXCEL_ONLY,
//     hiddenFormats: NON_EXCEL,
//   },
//   {
//     id: "RTS-NO-CARD-MENU",
//     status: "ready to submit",
//     useStatisticsCard: false,
//     visibleFormats: EXCEL_ONLY,
//     hiddenFormats: NON_EXCEL,
//   },
// ];
// 
// /** Menu visibility â€” aggregate + per-format hidden checks. */
// export const UI_INVOICE_FILE_DOWNLOAD_MENU_SCENARIOS: readonly InvoiceFileDownloadMenuScenario[] =
//   [
//     ...BASE_MENU_SCENARIOS,
//     ...buildHiddenFormatMenuCases("RTS", "ready to submit", RTS_CARD),
//     ...buildHiddenFormatMenuCases("ERR", "error", ERR_CARD),
//   ];
// 
// const BASE_DOWNLOAD_SCENARIOS: readonly InvoiceFileDownloadScenario[] = [
//   {
//     id: "RTS-EXCEL",
//     status: "ready to submit",
//     format: "excel",
//     statisticsCard: RTS_CARD,
//   },
//   {
//     id: "RTS-NO-CARD-EXCEL",
//     status: "ready to submit",
//     format: "excel",
//     useStatisticsCard: false,
//   },
//   {
//     id: "DEL-EXCEL",
//     status: "delivered",
//     format: "excel",
//     statisticsCard: DEL_CARD,
//   },
//   {
//     id: "DEL-JSON",
//     status: "delivered",
//     format: "json",
//     statisticsCard: DEL_CARD,
//   },
//   {
//     id: "DEL-PDF",
//     status: "delivered",
//     format: "pdf",
//     statisticsCard: DEL_CARD,
//   },
//   {
//     id: "DEL-XML",
//     status: "delivered",
//     format: "xml",
//     statisticsCard: DEL_CARD,
//   },
//   {
//     id: "ERR-EXCEL",
//     status: "error",
//     format: "excel",
//     statisticsCard: ERR_CARD,
//   },
// ];
// 
// /** File download â€” one test per format + no-card fallback. */
// export const UI_INVOICE_FILE_DOWNLOAD_SCENARIOS: readonly InvoiceFileDownloadScenario[] =
//   BASE_DOWNLOAD_SCENARIOS;
// 
// /** Options â†’ Download entry visible on the row (before opening format submenu). */
// export const UI_INVOICE_FILE_DOWNLOAD_OPTION_SCENARIOS: readonly InvoiceFileDownloadOptionScenario[] =
//   [
//     {
//       id: "RTS-DOWNLOAD-OPTION",
//       status: "ready to submit",
//       statisticsCard: RTS_CARD,
//     },
//     {
//       id: "DEL-DOWNLOAD-OPTION",
//       status: "delivered",
//       statisticsCard: DEL_CARD,
//     },
//     {
//       id: "ERR-DOWNLOAD-OPTION",
//       status: "error",
//       statisticsCard: ERR_CARD,
//     },
//     {
//       id: "RTS-NO-CARD-DOWNLOAD-OPTION",
//       status: "ready to submit",
//       useStatisticsCard: false,
//     },
//   ] as const;
// 
// function buildBulkFormatScenarios(
//   idPrefix: string,
//   statisticsCard: InvoiceStatisticsCardLabel,
//   formats: readonly InvoiceDownloadFormat[],
//   options: {
//     subFiltersToRemove?: readonly string[];
//     menu: "download" | "download-records";
//     recordType?: "Valid Records" | "Error Records";
//   }
// ): InvoiceBulkDownloadFormatScenario[] {
//   return formats.map((format) => ({
//     id: `${idPrefix}-BULK-${format.toUpperCase()}`,
//     statisticsCard,
//     subFiltersToRemove: options.subFiltersToRemove,
//     format,
//     menu: options.menu,
//     recordType: options.recordType,
//   }));
// }
// 
// /** Bulk download â€” mirrors single-row file download coverage per statistics card. */
// export const UI_INVOICE_BULK_DOWNLOAD_FORMAT_SCENARIOS: readonly InvoiceBulkDownloadFormatScenario[] =
//   [
//     ...buildBulkFormatScenarios("RTS", RTS_CARD, EXCEL_ONLY, {
//       subFiltersToRemove: ["Submission Error"],
//       menu: "download-records",
//       recordType: "Valid Records",
//     }),
//     ...buildBulkFormatScenarios("DEL", DEL_CARD, ALL_FORMATS, {
//       subFiltersToRemove: ["Delivered to C3", "Delivered to C5"],
//       menu: "download",
//     }),
//     ...buildBulkFormatScenarios("ERR", ERR_CARD, EXCEL_ONLY, {
//       subFiltersToRemove: ["Duplicate"],
//       menu: "download-records",
//       recordType: "Error Records",
//     }),
//   ] as const;
// 
// function buildBulkDownloadFormatToastScenarios(
//   idPrefix: string,
//   statisticsCard: InvoiceStatisticsCardLabel,
//   formats: readonly InvoiceDownloadFormat[],
//   subFiltersToRemove?: readonly string[]
// ): InvoiceBulkDownloadToastScenario[] {
//   return formats.map((format) => ({
//     id: `${idPrefix}-BULK-DOWNLOAD-${format.toUpperCase()}-TOAST`,
//     statisticsCard,
//     subFiltersToRemove,
//     menu: "download" as const,
//     format,
//   }));
// }
// 
// export const UI_INVOICE_BULK_DOWNLOAD_TOAST_SCENARIOS: readonly InvoiceBulkDownloadToastScenario[] =
//   [
//     {
//       id: "ERR-BULK-VALID-RECORDS-TOAST",
//       statisticsCard: ERR_CARD,
//       subFiltersToRemove: ["Duplicate"],
//       menu: "download-records",
//       recordType: "Valid Records",
//     },
//     {
//       id: "RTS-BULK-ERROR-RECORDS-TOAST",
//       statisticsCard: RTS_CARD,
//       subFiltersToRemove: ["Submission Error"],
//       menu: "download-records",
//       recordType: "Error Records",
//     },
//     {
//       id: "DEL-BULK-VALID-RECORDS-TOAST",
//       statisticsCard: DEL_CARD,
//       subFiltersToRemove: ["Delivered to C3", "Delivered to C5"],
//       menu: "download-records",
//       recordType: "Valid Records",
//     },
//     {
//       id: "DEL-BULK-ERROR-RECORDS-TOAST",
//       statisticsCard: DEL_CARD,
//       subFiltersToRemove: ["Delivered to C3", "Delivered to C5"],
//       menu: "download-records",
//       recordType: "Error Records",
//     },
//     ...buildBulkDownloadFormatToastScenarios("RTS", RTS_CARD, ALL_FORMATS, [
//       "Submission Error",
//     ]),
//     ...buildBulkDownloadFormatToastScenarios("ERR", ERR_CARD, ALL_FORMATS, ["Duplicate"]),
//   ] as const;
// 
// function invoiceStatusLabel(status: InvoiceDownloadStatus): string {
//   switch (status) {
//     case "ready to submit":
//       return "Ready to Submit";
//     case "delivered":
//       return "Delivered";
//     case "error":
//       return "Error";
//   }
// }
// 
// function formatLabel(format: InvoiceDownloadFormat): string {
//   return INVOICE_DOWNLOAD_FORMAT_LABEL[format];
// }
// 
// function formatList(formats: readonly InvoiceDownloadFormat[]): string {
//   return formats.map(formatLabel).join(", ");
// }
// 
// function listFilterPhrase(scenario: {
//   useStatisticsCard?: boolean;
//   statisticsCard?: string;
// }): string {
//   if (scenario.useStatisticsCard === false) {
//     return "from invoice table (no status card filter)";
//   }
//   return `using ${scenario.statisticsCard} card filter`;
// }
// 
// /** Playwright title for Options â†’ Download entry visibility. */
// export function downloadOptionTitle(scenario: InvoiceFileDownloadOptionScenario): string {
//   return (
//     `Invoice dashboard | ${invoiceStatusLabel(scenario.status)} invoice | ` +
//     `${listFilterPhrase(scenario)} | Options menu shows Download`
//   );
// }
// 
// /** Playwright title for Download submenu format visibility. */
// export function menuVisibilityTitle(scenario: InvoiceFileDownloadMenuScenario): string {
//   const status = invoiceStatusLabel(scenario.status);
//   const filter = listFilterPhrase(scenario);
// 
//   if (scenario.hiddenFormats.length === 1 && scenario.visibleFormats.length === 1) {
//     const hidden = formatLabel(scenario.hiddenFormats[0]);
//     return (
//       `Invoice dashboard | ${status} invoice | ${filter} | ` +
//       `Download submenu hides ${hidden} (Excel only)`
//     );
//   }
// 
//   if (scenario.hiddenFormats.length === 0) {
//     return (
//       `Invoice dashboard | ${status} invoice | ${filter} | ` +
//       `Download submenu shows ${formatList(scenario.visibleFormats)}`
//     );
//   }
// 
//   return (
//     `Invoice dashboard | ${status} invoice | ${filter} | ` +
//     `Download submenu shows ${formatList(scenario.visibleFormats)} only ` +
//     `(not ${formatList(scenario.hiddenFormats)})`
//   );
// }
// 
// /** Playwright title for single-row file download. */
// export function downloadTitle(scenario: InvoiceFileDownloadScenario): string {
//   return (
//     `Invoice dashboard | ${invoiceStatusLabel(scenario.status)} invoice | ` +
//     `${listFilterPhrase(scenario)} | Download ${formatLabel(scenario.format)} | ` +
//     `file is received and saved`
//   );
// }
// 
// /** Playwright title for bulk Action â†’ Download / Download Records export. */
// export function bulkDownloadFormatTitle(scenario: InvoiceBulkDownloadFormatScenario): string {
//   const filters =
//     scenario.subFiltersToRemove && scenario.subFiltersToRemove.length > 0
//       ? `remove ${scenario.subFiltersToRemove.join(", ")} filter, `
//       : "";
//   const action =
//     scenario.menu === "download-records"
//       ? `Bulk Action â†’ Download Records â†’ ${scenario.recordType}`
//       : `Bulk Action â†’ Download â†’ ${formatLabel(scenario.format)}`;
//   return (
//     `Invoice dashboard | ${scenario.statisticsCard} | ${filters}select all rows | ` +
//     `${action} | ${formatLabel(scenario.format)} file is received and saved`
//   );
// }
// 
// /** Playwright title for bulk download mismatch toast (negation). */
// export function bulkToastNegationTitle(scenario: InvoiceBulkDownloadToastScenario): string {
//   const filters =
//     scenario.subFiltersToRemove && scenario.subFiltersToRemove.length > 0
//       ? `remove ${scenario.subFiltersToRemove.join(", ")} filter, `
//       : "";
//   const action =
//     scenario.menu === "download-records"
//       ? `Bulk Action â†’ Download Records â†’ ${scenario.recordType}`
//       : `Bulk Action â†’ Download â†’ ${formatLabel(scenario.format!)}`;
//   return (
//     `Invoice dashboard | ${scenario.statisticsCard} | ${filters}select all rows | ` +
//     `${action} | toast message is shown`
//   );
// }
// 
// function formatLabels(formats: readonly InvoiceDownloadFormat[]): string[] {
//   return formats.map((f) => INVOICE_DOWNLOAD_FORMAT_LABEL[f]);
// }
// 
// function extensionForFormat(format: InvoiceDownloadFormat): string {
//   switch (format) {
//     case "excel":
//       return ".xlsx";
//     case "json":
//       return ".json";
//     case "pdf":
//       return ".pdf";
//     case "xml":
//       return ".xml";
//   }
// }
// 
// async function prepareInvoiceRowForFileDownload(
//   page: Page,
//   options: InvoiceFileDownloadPrepareOptions
// ): Promise<{ dashboard: DashboardPage; row: ReusableDashboardInvoice }> {
//   const dashboard = new DashboardPage(page);
//   await dashboard.openEinvoiceInvoiceList();
// 
//   const shouldUseCard = options.useStatisticsCard !== false && options.statisticsCard;
//   if (shouldUseCard && options.statisticsCard) {
//     if (await dashboard.hasStatisticsCard(options.statisticsCard)) {
//       await dashboard.clickStatisticsCard(options.statisticsCard);
//     }
//   }
// 
//   const row = await dashboard.firstInvoiceRowForFileDownload(options.status);
//   return { dashboard, row };
// }
// 
// type DownloadAssertionOptions = {
//   /** Bulk multi-row export may return a zip archive instead of one file. */
//   allowZipArchive?: boolean;
// };
// 
// function isZipBuffer(buffer: Buffer): boolean {
//   return buffer.length >= 2 && buffer.subarray(0, 2).toString("utf8") === "PK";
// }
// 
// function writeDownloadBuffer(
//   buffer: Buffer,
//   format: InvoiceDownloadFormat,
//   fileLabel: string,
//   options?: DownloadAssertionOptions
// ): string {
//   const safeLabel = fileLabel.replace(/[^\w.-]+/g, "_").slice(0, 48);
//   const extension =
//     options?.allowZipArchive && isZipBuffer(buffer) ? ".zip" : extensionForFormat(format);
//   const filePath = path.join(
//     process.cwd(),
//     "test-results",
//     `invoice-download-${safeLabel}-${format}-${Date.now()}${extension}`
//   );
//   fs.mkdirSync(path.dirname(filePath), { recursive: true });
//   fs.writeFileSync(filePath, buffer);
//   return filePath;
// }
// 
// function assertDownloadApiResponse(
//   download: InvoiceFileDownloadResponse,
//   format: InvoiceDownloadFormat,
//   options?: DownloadAssertionOptions
// ): void {
//   expect(download.status, "download API status").toBeGreaterThanOrEqual(200);
//   expect(download.status, "download API status").toBeLessThan(300);
//   expect(download.downloadUrl, "download API URL").toMatch(/download|export|file\/v1|blob:/i);
//   expect(download.buffer.length, "download response body").toBeGreaterThan(0);
// 
//   const contentType = download.contentType.toLowerCase();
//   if (options?.allowZipArchive && isZipBuffer(download.buffer)) {
//     expect(
//       contentType.includes("zip") ||
//         contentType.includes("octet-stream") ||
//         contentType.includes("spreadsheet") ||
//         contentType === "",
//       "bulk zip archive content-type or zip bytes"
//     ).toBe(true);
//     return;
//   }
// 
//   if (format === "excel") {
//     const isExcelContentType =
//       contentType.includes("spreadsheet") ||
//       contentType.includes("excel") ||
//       contentType.includes("octet-stream");
//     const isExcelBytes = isZipBuffer(download.buffer);
//     expect(isExcelContentType || isExcelBytes, "excel content-type or xlsx bytes").toBe(true);
//   } else if (format === "json") {
//     const isJsonBytes = (() => {
//       try {
//         JSON.parse(download.buffer.toString("utf8"));
//         return true;
//       } catch {
//         return false;
//       }
//     })();
//     expect(
//       contentType.includes("json") || contentType.includes("octet-stream") || isJsonBytes,
//       "json content-type or json bytes"
//     ).toBe(true);
//   } else if (format === "pdf") {
//     const isPdfBytes = download.buffer.subarray(0, 4).toString("utf8") === "%PDF";
//     expect(
//       contentType.includes("pdf") || contentType.includes("octet-stream") || isPdfBytes,
//       "pdf content-type or pdf bytes"
//     ).toBe(true);
//   } else if (format === "xml") {
//     const isXmlBytes = download.buffer.toString("utf8").trimStart().startsWith("<");
//     expect(
//       contentType.includes("xml") ||
//         contentType.includes("text/plain") ||
//         contentType.includes("octet-stream") ||
//         isXmlBytes,
//       "xml content-type or xml bytes"
//     ).toBe(true);
//   }
// }
// 
// function assertDownloadedFileOnDisk(
//   filePath: string,
//   format: InvoiceDownloadFormat,
//   options?: DownloadAssertionOptions
// ): void {
//   expect(fs.existsSync(filePath), `download file missing: ${filePath}`).toBe(true);
//   const stat = fs.statSync(filePath);
//   expect(stat.size, `download file empty: ${filePath}`).toBeGreaterThan(0);
// 
//   const bytes = fs.readFileSync(filePath);
//   if (options?.allowZipArchive && isZipBuffer(bytes)) {
//     expect(filePath.toLowerCase(), "bulk zip archive path").toMatch(/\.zip$/i);
//     return;
//   }
// 
//   expect(filePath.toLowerCase()).toMatch(
//     new RegExp(`${extensionForFormat(format).replace(".", "\\.")}$`, "i")
//   );
// 
//   if (format === "json") {
//     expect(() => JSON.parse(bytes.toString("utf8"))).not.toThrow();
//   } else if (format === "xml") {
//     expect(bytes.toString("utf8").trimStart().startsWith("<")).toBe(true);
//   } else if (format === "pdf") {
//     expect(bytes.subarray(0, 4).toString("utf8")).toBe("%PDF");
//   } else if (format === "excel") {
//     expect(bytes.subarray(0, 2).toString("utf8")).toBe("PK");
//   }
// }
// 
// async function rethrowWithToast(
//   dashboard: DashboardPage,
//   scenarioId: string,
//   error: unknown
// ): Promise<never> {
//   const toastMessage = await dashboard.peekVisibleToastMessage({ timeoutMs: 2_000 });
//   const base = error instanceof Error ? error.message : String(error);
//   if (toastMessage) {
//     flowLog("uiInvoiceFileDownload", `${scenarioId} | failure toast: ${toastMessage}`);
//   }
//   throw new Error(
//     toastMessage
//       ? `${base} | UI toast: ${toastMessage}`
//       : `${base} | UI toast: (none visible)`
//   );
// }
// 
// /** Options â†’ Download submenu: assert which format labels are visible / hidden (no file click). */
// export async function runUiInvoiceFileDownloadMenuVisibilityCase(
//   page: Page,
//   scenario: InvoiceFileDownloadMenuScenario
// ): Promise<{ invoiceNumber: string }> {
//   const { dashboard, row } = await prepareInvoiceRowForFileDownload(page, scenario);
//   flowLog(
//     "uiInvoiceFileDownload",
//     `${scenario.id} | menu visibility | invoice=${row.invoiceNumber} | status=${scenario.status}`
//   );
// 
//   try {
//     const submenu = await dashboard.openInvoiceDownloadSubmenuOnRow(row.row);
//     await dashboard.expectDownloadFormatsInSubmenu(submenu, {
//       visible: formatLabels(scenario.visibleFormats),
//       hidden: formatLabels(scenario.hiddenFormats),
//     });
//   } catch (error) {
//     await rethrowWithToast(dashboard, scenario.id, error);
//   }
// 
//   flowLog(
//     "uiInvoiceFileDownload",
//     `${scenario.id} | visible=[${scenario.visibleFormats.join(", ")}] hidden=[${scenario.hiddenFormats.join(", ")}]`
//   );
//   return { invoiceNumber: row.invoiceNumber };
// }
// 
// /** Options â†’ assert **Download** menu entry (`#sub-item-download`) is shown. */
// export async function runUiInvoiceFileDownloadOptionVisibleCase(
//   page: Page,
//   scenario: InvoiceFileDownloadOptionScenario
// ): Promise<{ invoiceNumber: string }> {
//   const { dashboard, row } = await prepareInvoiceRowForFileDownload(page, scenario);
//   flowLog(
//     "uiInvoiceFileDownload",
//     `${scenario.id} | download option | invoice=${row.invoiceNumber} | status=${scenario.status}`
//   );
// 
//   try {
//     await dashboard.expectDownloadMenuEntryVisibleOnRow(row.row);
//   } catch (error) {
//     await rethrowWithToast(dashboard, scenario.id, error);
//   }
//   return { invoiceNumber: row.invoiceNumber };
// }
// 
// /** Click one format, verify API response + saved file on disk. */
// export async function runUiInvoiceFileDownloadCase(
//   page: Page,
//   scenario: InvoiceFileDownloadScenario
// ): Promise<{ invoiceNumber: string; filePath: string }> {
//   const { dashboard, row } = await prepareInvoiceRowForFileDownload(page, scenario);
//   const formatLabel = INVOICE_DOWNLOAD_FORMAT_LABEL[scenario.format];
// 
//   flowLog(
//     "uiInvoiceFileDownload",
//     `${scenario.id} | download | invoice=${row.invoiceNumber} | format=${scenario.format}`
//   );
// 
//   let download: InvoiceFileDownloadResponse;
//   try {
//     const submenu = await dashboard.openInvoiceDownloadSubmenuOnRow(row.row);
//     download = await dashboard.clickDownloadFormatInSubmenu(submenu, formatLabel);
//   } catch (error) {
//     await rethrowWithToast(dashboard, scenario.id, error);
//     throw error; // unreachable; satisfies TS definite assignment after catch
//   }
// 
//   assertDownloadApiResponse(download, scenario.format);
// 
//   const filePath = writeDownloadBuffer(download.buffer, scenario.format, row.invoiceNumber);
//   assertDownloadedFileOnDisk(filePath, scenario.format);
// 
//   expect(fs.statSync(filePath).size).toBe(download.buffer.length);
// 
//   flowLog(
//     "uiInvoiceFileDownload",
//     `${scenario.id} | API ${download.status} ${download.contentType} | saved ${filePath} (${download.buffer.length} bytes)`
//   );
//   return { invoiceNumber: row.invoiceNumber, filePath };
// }
// 
// async function prepareBulkDownloadList(
//   page: Page,
//   statisticsCard: InvoiceStatisticsCardLabel,
//   subFiltersToRemove?: readonly string[]
// ): Promise<DashboardPage> {
//   const dashboard = new DashboardPage(page);
//   await dashboard.openEinvoiceInvoiceList();
//   await dashboard.clickStatisticsCard(statisticsCard);
// 
//   for (const filterLabel of subFiltersToRemove ?? []) {
//     await dashboard.dismissSubFilterIfPresent(filterLabel);
//   }
// 
//   await dashboard.selectAllInvoiceRowsCheckbox();
//   return dashboard;
// }
// 
// const BULK_DOWNLOAD_RESPONSE_TIMEOUT_MS = 120_000;
// 
// /** Bulk Action â†’ Download Records â†’ file export (internal â€” used by bulk format runner). */
// async function runBulkDownloadRecordsExport(
//   dashboard: DashboardPage,
//   scenario: Pick<
//     InvoiceBulkDownloadFormatScenario,
//     "id" | "format" | "recordType" | "statisticsCard"
//   >,
//   recordType: "Valid Records" | "Error Records"
// ): Promise<InvoiceFileDownloadResponse> {
//   flowLog(
//     "uiInvoiceFileDownload",
//     `${scenario.id} | bulk download records | ${recordType} | ${scenario.format}`
//   );
// 
//   await dashboard.openBulkActionDropdown();
//   const submenu = await dashboard.openBulkDownloadRecordsSubmenu();
//   return dashboard.clickBulkDownloadRecordsOption(submenu, recordType);
// }
// 
// /** Bulk Action â†’ Download â†’ format export (e.g. Delivered card, Excel/JSON/PDF/XML). */
// export async function runUiInvoiceBulkDownloadFormatCase(
//   page: Page,
//   scenario: InvoiceBulkDownloadFormatScenario
// ): Promise<{ filePath: string }> {
//   const dashboard = await prepareBulkDownloadList(
//     page,
//     scenario.statisticsCard,
//     scenario.subFiltersToRemove
//   );
// 
//   const formatLabel = INVOICE_DOWNLOAD_FORMAT_LABEL[scenario.format];
//   let download: InvoiceFileDownloadResponse;
// 
//   if (scenario.menu === "download-records") {
//     if (!scenario.recordType) {
//       throw new Error(`${scenario.id} requires recordType for download-records menu`);
//     }
//     download = await runBulkDownloadRecordsExport(dashboard, scenario, scenario.recordType);
//   } else {
//     flowLog(
//       "uiInvoiceFileDownload",
//       `${scenario.id} | bulk download | ${scenario.statisticsCard} | ${scenario.format}`
//     );
// 
//     await dashboard.openBulkActionDropdown();
//     const submenu = await dashboard.openBulkDownloadSubmenu();
//     download = await dashboard.clickDownloadFormatInSubmenu(submenu, formatLabel, {
//       timeoutMs: BULK_DOWNLOAD_RESPONSE_TIMEOUT_MS,
//       waitForBulkExport: true,
//     });
//   }
// 
//   const bulkDownloadOptions: DownloadAssertionOptions = {
//     allowZipArchive: scenario.format !== "excel",
//   };
// 
//   assertDownloadApiResponse(download, scenario.format, bulkDownloadOptions);
// 
//   const filePath = writeDownloadBuffer(
//     download.buffer,
//     scenario.format,
//     `bulk-${scenario.statisticsCard}`,
//     bulkDownloadOptions
//   );
//   assertDownloadedFileOnDisk(filePath, scenario.format, bulkDownloadOptions);
//   expect(fs.statSync(filePath).size).toBe(download.buffer.length);
// 
//   flowLog(
//     "uiInvoiceFileDownload",
//     `${scenario.id} | API ${download.status} ${download.contentType} | saved ${filePath} (${download.buffer.length} bytes)`
//   );
//   return { filePath };
// }
// 
// /** Bulk card-filter mismatch â†’ toast (no file download). */
// export async function runUiInvoiceBulkDownloadValidRecordsToastCase(
//   page: Page,
//   scenario: InvoiceBulkDownloadToastScenario
// ): Promise<{ toastMessage: string }> {
//   const dashboard = await prepareBulkDownloadList(
//     page,
//     scenario.statisticsCard,
//     scenario.subFiltersToRemove
//   );
// 
//   await dashboard.openBulkActionDropdown();
// 
//   let toastMessage: string;
//   if (scenario.menu === "download-records") {
//     if (!scenario.recordType) {
//       throw new Error(`${scenario.id} requires recordType for download-records toast`);
//     }
//     flowLog(
//       "uiInvoiceFileDownload",
//       `${scenario.id} | bulk toast negation | Download Records â†’ ${scenario.recordType}`
//     );
//     const submenu = await dashboard.openBulkDownloadRecordsSubmenu();
//     toastMessage = await dashboard.clickBulkDownloadRecordsOptionExpectingToast(
//       submenu,
//       scenario.recordType
//     );
//   } else {
//     if (!scenario.format) {
//       throw new Error(`${scenario.id} requires format for download toast`);
//     }
//     const formatLabel = INVOICE_DOWNLOAD_FORMAT_LABEL[scenario.format];
//     flowLog(
//       "uiInvoiceFileDownload",
//       `${scenario.id} | bulk toast negation | Download â†’ ${scenario.format}`
//     );
//     const submenu = await dashboard.openBulkDownloadSubmenu();
//     toastMessage = await dashboard.clickDownloadFormatInSubmenuExpectingToast(
//       submenu,
//       formatLabel
//     );
//   }
// 
//   flowLog("uiInvoiceFileDownload", `${scenario.id} | toast: ${toastMessage}`);
//   return { toastMessage };
// }
