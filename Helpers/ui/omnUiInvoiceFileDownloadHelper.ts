/**
 * Sanity-only invoice file download (one delivered row, or bulk Delivered card).
 * Full format matrix lives in the UAE suite; this helper covers one case per format.
 */
import { expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import {
  DashboardPage,
  INVOICE_DOWNLOAD_FORMAT_LABEL,
  type InvoiceDownloadFormatUi,
  type InvoiceFileDownloadResponse,
} from "../../pageObjects/OMN_DashboardPage";
import { flowLog } from "../diagnosticLog";

export const OMN_UI_INVOICE_FILE_DOWNLOAD_TEST_TIMEOUT_MS = 3 * 60 * 1000;
export const OMN_UI_INVOICE_BULK_DOWNLOAD_TEST_TIMEOUT_MS = 4 * 60 * 1000;

const BULK_DOWNLOAD_RESPONSE_TIMEOUT_MS = 120_000;

type SanityDownloadCard = {
  card: string;
  status: "ready to submit" | "delivered" | "error";
  subFilters: readonly string[];
};

const SUCCESS_CARD: SanityDownloadCard = {
  card: "Ready to Submit",
  status: "ready to submit",
  subFilters: ["Submission Error"],
};

const ERROR_CARD: SanityDownloadCard = {
  card: "Error in Records",
  status: "error",
  subFilters: ["Duplicate"],
};

const DELIVERED_CARD: SanityDownloadCard = {
  card: "Delivered",
  status: "delivered",
  subFilters: ["Delivered to C3", "Delivered to C5"],
};

export type OmnInvoiceDownloadFormat = InvoiceDownloadFormatUi;

const SINGLE_DOWNLOAD_FORMATS = ["excel", "json", "pdf", "xml"] as const;

export const OMN_SANITY_SINGLE_DOWNLOAD_FORMATS: readonly OmnInvoiceDownloadFormat[] =
  SINGLE_DOWNLOAD_FORMATS;

export const OMN_SANITY_BULK_DOWNLOAD_FORMATS: readonly OmnInvoiceDownloadFormat[] =
  SINGLE_DOWNLOAD_FORMATS;

function extensionForFormat(format: OmnInvoiceDownloadFormat): string {
  switch (format) {
    case "excel":
      return ".xlsx";
    case "json":
      return ".json";
    case "pdf":
      return ".pdf";
    case "xml":
      return ".xml";
  }
}

function isZipBuffer(buffer: Buffer): boolean {
  return buffer.length >= 2 && buffer.subarray(0, 2).toString("utf8") === "PK";
}

function writeDownloadBuffer(
  buffer: Buffer,
  format: OmnInvoiceDownloadFormat,
  fileLabel: string,
  allowZipArchive: boolean
): string {
  const safeLabel = fileLabel.replace(/[^\w.-]+/g, "_").slice(0, 48);
  const extension = allowZipArchive && isZipBuffer(buffer) ? ".zip" : extensionForFormat(format);
  const filePath = path.join(
    process.cwd(),
    "test-results",
    `invoice-download-${safeLabel}-${format}-${Date.now()}${extension}`
  );
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

function assertDownloadApiResponse(
  download: InvoiceFileDownloadResponse,
  format: OmnInvoiceDownloadFormat,
  allowZipArchive: boolean
): void {
  expect(download.status, "download API status").toBeGreaterThanOrEqual(200);
  expect(download.status, "download API status").toBeLessThan(300);
  expect(download.downloadUrl, "download API URL").toMatch(/download|export|file\/v1|blob:/i);
  expect(download.buffer.length, "download response body").toBeGreaterThan(0);

  const contentType = download.contentType.toLowerCase();
  if (allowZipArchive && isZipBuffer(download.buffer)) {
    expect(
      contentType.includes("zip") ||
        contentType.includes("octet-stream") ||
        contentType.includes("spreadsheet") ||
        contentType === "",
      "bulk zip archive content-type or zip bytes"
    ).toBe(true);
    return;
  }

  if (format === "excel") {
    const isExcelContentType =
      contentType.includes("spreadsheet") ||
      contentType.includes("excel") ||
      contentType.includes("octet-stream");
    expect(isExcelContentType || isZipBuffer(download.buffer), "excel content-type or xlsx bytes").toBe(
      true
    );
  } else if (format === "json") {
    let isJsonBytes = false;
    try {
      JSON.parse(download.buffer.toString("utf8"));
      isJsonBytes = true;
    } catch {
      isJsonBytes = false;
    }
    expect(
      contentType.includes("json") || contentType.includes("octet-stream") || isJsonBytes,
      "json content-type or json bytes"
    ).toBe(true);
  } else if (format === "pdf") {
    const isPdfBytes = download.buffer.subarray(0, 4).toString("utf8") === "%PDF";
    expect(
      contentType.includes("pdf") || contentType.includes("octet-stream") || isPdfBytes,
      "pdf content-type or pdf bytes"
    ).toBe(true);
  } else if (format === "xml") {
    const isXmlBytes = download.buffer.toString("utf8").trimStart().startsWith("<");
    expect(
      contentType.includes("xml") ||
        contentType.includes("text/plain") ||
        contentType.includes("octet-stream") ||
        isXmlBytes,
      "xml content-type or xml bytes"
    ).toBe(true);
  }
}

function assertDownloadedFileOnDisk(
  filePath: string,
  format: OmnInvoiceDownloadFormat,
  allowZipArchive: boolean
): void {
  expect(fs.existsSync(filePath), `download file missing: ${filePath}`).toBe(true);
  const bytes = fs.readFileSync(filePath);
  expect(bytes.length, `download file empty: ${filePath}`).toBeGreaterThan(0);

  if (allowZipArchive && isZipBuffer(bytes)) {
    expect(filePath.toLowerCase(), "bulk zip archive path").toMatch(/\.zip$/i);
    return;
  }

  expect(filePath.toLowerCase()).toMatch(
    new RegExp(`${extensionForFormat(format).replace(".", "\\.")}$`, "i")
  );

  if (format === "json") {
    expect(() => JSON.parse(bytes.toString("utf8"))).not.toThrow();
  } else if (format === "xml") {
    expect(bytes.toString("utf8").trimStart().startsWith("<")).toBe(true);
  } else if (format === "pdf") {
    expect(bytes.subarray(0, 4).toString("utf8")).toBe("%PDF");
  } else if (format === "excel") {
    expect(bytes.subarray(0, 2).toString("utf8")).toBe("PK");
  }
}

async function rethrowWithToast(
  dashboard: DashboardPage,
  label: string,
  error: unknown
): Promise<never> {
  const toastMessage = await dashboard.peekVisibleToastMessage({ timeoutMs: 2_000 });
  const base = error instanceof Error ? error.message : String(error);
  throw new Error(
    toastMessage ? `${label}: ${base} | UI toast: ${toastMessage}` : `${label}: ${base}`
  );
}

async function prepareDownloadCard(page: Page, target: SanityDownloadCard): Promise<DashboardPage> {
  const dashboard = new DashboardPage(page);
  await dashboard.openEinvoiceInvoiceList();
  if (await dashboard.hasStatisticsCard(target.card)) {
    await dashboard.clickStatisticsCard(target.card);
  }
  for (const filterLabel of target.subFilters) {
    await dashboard.dismissSubFilterIfPresent(filterLabel);
  }
  return dashboard;
}

async function downloadOneRow(
  page: Page,
  target: SanityDownloadCard,
  format: OmnInvoiceDownloadFormat
): Promise<{ invoiceNumber: string; filePath: string }> {
  const dashboard = await prepareDownloadCard(page, target);
  const row = await dashboard.firstInvoiceRowForFileDownload(target.status);
  const formatLabel = INVOICE_DOWNLOAD_FORMAT_LABEL[format];
  flowLog("omnSanityDownload", `single ${target.card} ${format} | invoice=${row.invoiceNumber}`);

  let download: InvoiceFileDownloadResponse;
  try {
    const submenu = await dashboard.openInvoiceDownloadSubmenuOnRow(row.row);
    download = await dashboard.clickDownloadFormatInSubmenu(submenu, formatLabel);
  } catch (error) {
    await rethrowWithToast(dashboard, `single ${target.card} ${format}`, error);
    throw error;
  }

  assertDownloadApiResponse(download, format, false);
  const filePath = writeDownloadBuffer(download.buffer, format, row.invoiceNumber, false);
  assertDownloadedFileOnDisk(filePath, format, false);
  expect(fs.statSync(filePath).size).toBe(download.buffer.length);
  return { invoiceNumber: row.invoiceNumber, filePath };
}

/** Error in Records → Options → Download Excel. */
export function runOmnSanityErrorRecordDownload(page: Page) {
  return downloadOneRow(page, ERROR_CARD, "excel");
}

/** Ready to Submit (success) → Options → Download Excel. */
export function runOmnSanitySuccessRecordDownload(page: Page) {
  return downloadOneRow(page, SUCCESS_CARD, "excel");
}

/** Delivered → Options → Download one format (Excel, JSON, PDF, XML). */
export function runOmnSanityInvoiceFileDownloadCase(page: Page, format: OmnInvoiceDownloadFormat) {
  return downloadOneRow(page, DELIVERED_CARD, format);
}

async function downloadBulkRecords(
  page: Page,
  target: SanityDownloadCard,
  recordType: "Valid Records" | "Error Records"
): Promise<{ filePath: string }> {
  const dashboard = await prepareDownloadCard(page, target);
  await dashboard.selectAllInvoiceRowsCheckbox();
  flowLog("omnSanityDownload", `bulk records ${target.card} | ${recordType}`);

  let download: InvoiceFileDownloadResponse;
  try {
    await dashboard.openBulkActionDropdown();
    const submenu = await dashboard.openBulkDownloadRecordsSubmenu();
    download = await dashboard.clickBulkDownloadRecordsOption(submenu, recordType);
  } catch (error) {
    await rethrowWithToast(dashboard, `bulk ${recordType}`, error);
    throw error;
  }

  assertDownloadApiResponse(download, "excel", true);
  const filePath = writeDownloadBuffer(download.buffer, "excel", `bulk-${recordType}`, true);
  assertDownloadedFileOnDisk(filePath, "excel", true);
  expect(fs.statSync(filePath).size).toBe(download.buffer.length);
  return { filePath };
}

/** Error in Records → select all → Download Records → Error Records. */
export function runOmnSanityBulkErrorRecordsDownload(page: Page) {
  return downloadBulkRecords(page, ERROR_CARD, "Error Records");
}

/** Ready to Submit → select all → Download Records → Valid Records. */
export function runOmnSanityBulkSuccessRecordsDownload(page: Page) {
  return downloadBulkRecords(page, SUCCESS_CARD, "Valid Records");
}

/** Delivered card → select all → Bulk Action → Download → one format. */
export async function runOmnSanityBulkDownloadFormatCase(
  page: Page,
  format: OmnInvoiceDownloadFormat
): Promise<{ filePath: string }> {
  const dashboard = await prepareDownloadCard(page, DELIVERED_CARD);
  await dashboard.selectAllInvoiceRowsCheckbox();

  const formatLabel = INVOICE_DOWNLOAD_FORMAT_LABEL[format];
  flowLog("omnSanityDownload", `bulk delivered ${format}`);

  let download: InvoiceFileDownloadResponse;
  try {
    await dashboard.openBulkActionDropdown();
    const submenu = await dashboard.openBulkDownloadSubmenu();
    download = await dashboard.clickDownloadFormatInSubmenu(submenu, formatLabel, {
      timeoutMs: BULK_DOWNLOAD_RESPONSE_TIMEOUT_MS,
      waitForBulkExport: true,
    });
  } catch (error) {
    await rethrowWithToast(dashboard, `bulk delivered ${format}`, error);
    throw error;
  }

  const allowZip = format !== "excel";
  assertDownloadApiResponse(download, format, allowZip);
  const filePath = writeDownloadBuffer(download.buffer, format, "bulk-Delivered", allowZip);
  assertDownloadedFileOnDisk(filePath, format, allowZip);
  expect(fs.statSync(filePath).size).toBe(download.buffer.length);
  return { filePath };
}
