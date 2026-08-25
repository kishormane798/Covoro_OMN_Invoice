/**
 * **Submit invoice (Covoro) end-to-end** — `invoiceData` rows → `generateInvoiceFromSubmitData` → upload → submit.
 * Not the Playwright “formula validation” suite (`generateInvoiceExcel`). Conditional validation specs also call
 * `generateInvoiceFromSubmitData` but only after their own row builders in `conditionalValidationHelper`.
 */
import { Page } from "@playwright/test";
import fs from "fs";
import { openUploadPage } from "./uploadHelper";
import {
  generateBulkSingleItemSubmitInvoices,
  generateInvoiceFromSubmitData,
  generateInvoiceFromSubmitRows,
} from "../../utils/excel/invoiceExcel";
import { DashboardPage } from "../../pageObjects/OMN_DashboardPage";
import { flowLog } from "../diagnosticLog";

/** Default 2m: parallel workers queue backend processing; override with SUBMIT_INVOICE_DELIVERY_TIMEOUT_MS (ms). */
const SUBMIT_INVOICE_DELIVERY_TIMEOUT_MS = (() => {
  const raw = process.env.SUBMIT_INVOICE_DELIVERY_TIMEOUT_MS?.trim();
  if (raw) {
    const n = Number.parseInt(raw, 10);
    if (Number.isFinite(n) && n >= 60_000) return n;
  }
  return 2 * 60 * 1000;
})();

/** Bulk (5 invoices): allow longer wall clock; override with same env or BULK_SUBMIT_DELIVERY_TIMEOUT_MS. */
const BULK_SUBMIT_DELIVERY_TIMEOUT_MS = (() => {
  const raw = process.env.BULK_SUBMIT_DELIVERY_TIMEOUT_MS?.trim();
  if (raw) {
    const n = Number.parseInt(raw, 10);
    if (Number.isFinite(n) && n >= 60_000) return n;
  }
  return Math.max(SUBMIT_INVOICE_DELIVERY_TIMEOUT_MS, 8 * 60 * 1000);
})();

export const BULK_SUBMIT_INVOICE_TEST_TIMEOUT_MS = BULK_SUBMIT_DELIVERY_TIMEOUT_MS + 4 * 60 * 1000;

/** Stable money/qty defaults — never tax category columns (submit uses Tax Category + Tax Rate). */
const FORMULA_INPUT_OVERRIDES: Record<string, string> = {
  "Item price base quantity": "1",
  "Item gross price": "9980",
  "Item price discount": "1",
  "Invoiced quantity": "10",
  "Invoice line charge amount": "",
  "Invoice line allowance amount": "",
  "Charges on document level": "",
  "Allowances on document level": "",
  "Paid amount": "",
  "Rounding amount": "",
};

/**
 * Apply tax-category rules before submit upload.
 * Effective VAT uses sheet `Tax Rate` for Standard rate; other categories total at 0% but literal
 * rate columns stay as test data. Outside-scope clears `Tax Rate` for “not subject” semantics.
 */
function applySubmitTaxCategoryAndRateRules(data: Record<string, string>): Record<string, string> {
  const taxCategory = String(data["Tax Category"] ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  if (!taxCategory) {
    return { ...data };
  }

  const next: Record<string, string> = { ...data };

  if (
    taxCategory === "services outside scope of tax / not subject to tax" ||
    taxCategory === "services outside scope of tax"
  ) {
    next["Tax Rate"] = "";
  }

  return next;
}

/** Merge stable money/qty overrides without overwriting tax category columns from test data. */
function mergeSubmitInvoiceOverrides(data: Record<string, string>): Record<string, string> {
  return { ...data, ...FORMULA_INPUT_OVERRIDES };
}

/** Upload-only sanity: generate workbook from submit row, upload, assert upload row is completed. */
export async function runSubmitInvoiceUploadSanityCase(
  page: Page,
  data: Record<string, string>
): Promise<{ invoiceNumber: string; filePath: string }> {
  const submissionData = mergeSubmitInvoiceOverrides(
    applySubmitTaxCategoryAndRateRules(data)
  );

  const { filePath, invoiceNumber } = await generateInvoiceFromSubmitData(
    submissionData
  );

  const uploadPage = await openUploadPage(page);
  await uploadPage.uploadFile(filePath);
  const uploadStatus = await uploadPage.waitForAnyStatus();

  if (uploadStatus === "error") {
    const errorHint = await page
      .locator(".content span.error, .content span.failed")
      .first()
      .innerText()
      .catch(() => "");
    const suffix = errorHint.trim() ? ` Parser/UI: ${errorHint.trim()}` : "";
    throw new Error(
      `Upload failed for ${invoiceNumber}.${suffix} Uploaded file attached in report.`
    );
  }

  return { invoiceNumber, filePath };
}

/** Upload-only multi-item sanity: generate multi-line workbook, upload, assert completed. */
export async function runSubmitInvoiceMultiItemUploadSanityCase(
  page: Page,
  rows: Array<Record<string, string>>
): Promise<{ invoiceNumber: string; filePath: string }> {
  if (!rows.length) {
    throw new Error("runSubmitInvoiceMultiItemUploadSanityCase: rows cannot be empty");
  }

  const submissionRows = rows.map((r) =>
    mergeSubmitInvoiceOverrides(applySubmitTaxCategoryAndRateRules(r))
  );

  const { filePath, invoiceNumber } = await generateInvoiceFromSubmitRows(
    submissionRows
  );

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Multi-item Excel was not created (expected ${filePath}). Check Python (py/python), template path, and invoice_excel_writer.py.`
    );
  }

  const uploadPage = await openUploadPage(page);
  await uploadPage.uploadFile(filePath);
  const uploadStatus = await uploadPage.waitForAnyStatus();

  if (uploadStatus === "error") {
    const errorHint = await page
      .locator(".content span.error, .content span.failed")
      .first()
      .innerText()
      .catch(() => "");
    const suffix = errorHint.trim() ? ` Parser/UI: ${errorHint.trim()}` : "";
    throw new Error(
      `Upload failed for ${invoiceNumber}.${suffix} Uploaded file attached in report.`
    );
  }

  return { invoiceNumber, filePath };
}

export async function runSubmitInvoiceCase(
  page: Page,
  data: Record<string, string>
) {
  const submissionData = mergeSubmitInvoiceOverrides(
    applySubmitTaxCategoryAndRateRules(data)
  );

  const { filePath, invoiceNumber } = await generateInvoiceFromSubmitData(
    submissionData
  );
  flowLog("SubmitInvoice", `Generated workbook for ${invoiceNumber} → upload.`);

  const table = new DashboardPage(page);
  const uploadPage = await openUploadPage(page);
  await uploadPage.uploadFile(filePath);
  const uploadStatus = await uploadPage.waitForAnyStatus();

  if (uploadStatus === "error") {
    const errorHint = await page
      .locator(".content span.error, .content span.failed")
      .first()
      .innerText()
      .catch(() => "");
    const suffix = errorHint.trim() ? ` Parser/UI: ${errorHint.trim()}` : "";
    throw new Error(
      `Upload failed for ${invoiceNumber}.${suffix} Uploaded file attached in report.`
    );
  }

  flowLog("SubmitInvoice", `Upload completed for ${invoiceNumber} — submitting from dashboard.`);
  await table.refreshDashboardForInvoiceTable(invoiceNumber);
  await table.submitInvoiceFromTable(invoiceNumber);
  await table.waitForInvoiceDeliveryStatus(invoiceNumber, {
    timeoutMs: SUBMIT_INVOICE_DELIVERY_TIMEOUT_MS,
  });
  flowLog("SubmitInvoice", `Delivery confirmed for ${invoiceNumber}.`);
}

export async function runSubmitInvoiceMultiItemCase(
  page: Page,
  rows: Array<Record<string, string>>
) {
  if (!rows.length) {
    throw new Error("runSubmitInvoiceMultiItemCase: rows cannot be empty");
  }

  const submissionRows = rows.map((r) =>
    mergeSubmitInvoiceOverrides(applySubmitTaxCategoryAndRateRules(r))
  );

  const { filePath, invoiceNumber } = await generateInvoiceFromSubmitRows(
    submissionRows
  );
  flowLog("SubmitInvoice", `Generated multi-item workbook for ${invoiceNumber} (${submissionRows.length} lines) → upload.`);

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Multi-item Excel was not created (expected ${filePath}). Check Python (py/python), template path, and invoice_excel_writer.py.`
    );
  }

  const table = new DashboardPage(page);
  const uploadPage = await openUploadPage(page);
  await uploadPage.uploadFile(filePath);
  const uploadStatus = await uploadPage.waitForAnyStatus();

  if (uploadStatus === "error") {
    const errorHint = await page
      .locator(".content span.error, .content span.failed")
      .first()
      .innerText()
      .catch(() => "");
    const suffix = errorHint.trim() ? ` Parser/UI: ${errorHint.trim()}` : "";
    throw new Error(
      `Upload failed for ${invoiceNumber}.${suffix} Uploaded file attached in report.`
    );
  }

  flowLog("SubmitInvoice", `Upload completed for ${invoiceNumber} — submitting multi-item from dashboard.`);
  await table.submitMultiItemInvoiceFromTable(invoiceNumber);
  await table.waitForInvoiceDeliveryStatus(invoiceNumber, {
    timeoutMs: SUBMIT_INVOICE_DELIVERY_TIMEOUT_MS,
  });
  flowLog("SubmitInvoice", `Multi-item delivery confirmed for ${invoiceNumber}.`);
}

/**
 * Upload one Excel with N distinct single-item invoices → Ready to Submit → select all →
 * Bulk Action → Submit | Submit as PDF → poll each invoice for Delivered / Delivered to C3 / Delivered to C5.
 */
export async function runBulkSubmitInvoiceCase(
  page: Page,
  data: Record<string, string>,
  options?: { invoiceCount?: number; bulkAction?: "Submit" | "Submit as PDF" }
) {
  const invoiceCount = options?.invoiceCount ?? 5;
  const bulkAction = options?.bulkAction ?? "Submit";
  const submissionData = mergeSubmitInvoiceOverrides(
    applySubmitTaxCategoryAndRateRules(data)
  );

  const { filePath, invoiceNumbers, batchPrefix } = await generateBulkSingleItemSubmitInvoices(
    submissionData,
    invoiceCount
  );
  flowLog(
    "SubmitInvoice",
    `Generated bulk workbook (${invoiceCount} invoices, prefix ${batchPrefix}) → upload.`
  );

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Bulk submit Excel was not created (expected ${filePath}). Check Python (py/python), template path, and invoice_excel_writer.py.`
    );
  }

  const table = new DashboardPage(page);
  const uploadPage = await openUploadPage(page);
  await uploadPage.uploadFile(filePath);
  const uploadStatus = await uploadPage.waitForAnyStatus();

  if (uploadStatus === "error") {
    const errorHint = await page
      .locator(".content span.error, .content span.failed")
      .first()
      .innerText()
      .catch(() => "");
    const suffix = errorHint.trim() ? ` Parser/UI: ${errorHint.trim()}` : "";
    throw new Error(
      `Bulk upload failed for prefix ${batchPrefix} (${invoiceNumbers.join(", ")}).${suffix} Uploaded file attached in report.`
    );
  }

  flowLog(
    "SubmitInvoice",
    `Upload completed for bulk ${batchPrefix} — waiting Ready to Submit for ${invoiceNumbers.length} invoices.`
  );

  for (const invoiceNumber of invoiceNumbers) {
    await table.refreshDashboardForInvoiceTable(invoiceNumber);
    await table.waitForInvoiceReadyToSubmitStatus(invoiceNumber, {
      timeoutMs: BULK_SUBMIT_DELIVERY_TIMEOUT_MS,
    });
  }

  await table.openEinvoiceInvoiceList();
  await table.clickStatisticsCard("Ready to Submit");
  await table.searchInvoiceTable(batchPrefix);
  for (const invoiceNumber of invoiceNumbers) {
    await table.waitForInvoiceRowVisible(invoiceNumber, 60_000);
  }

  await table.selectAllInvoiceRowsCheckbox();
  flowLog(
    "SubmitInvoice",
    `Bulk select-all for ${batchPrefix} — Bulk Action → ${bulkAction}.`
  );
  if (bulkAction === "Submit as PDF") {
    await table.clickBulkActionSubmitAsPdf();
  } else {
    await table.clickBulkActionSubmit();
  }

  for (const invoiceNumber of invoiceNumbers) {
    await table.refreshDashboardForInvoiceTable(invoiceNumber);
    await table.waitForInvoiceDeliveryStatus(invoiceNumber, {
      timeoutMs: BULK_SUBMIT_DELIVERY_TIMEOUT_MS,
    });
    flowLog("SubmitInvoice", `Bulk delivery confirmed for ${invoiceNumber} (${bulkAction}).`);
  }
}
