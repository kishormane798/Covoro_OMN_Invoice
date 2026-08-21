import fs from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import {
  DashboardPage,
  INVOICE_DOWNLOAD_FORMAT_LABEL,
} from "../pageObjects/OMN_DashboardPage";
import { parallelWorkerDashboardOpenOpts } from "./parallelWorkerSubmitIdentity";
import { flowLog } from "./diagnosticLog";
import {
  compareInvoiceExcelRoundTrip,
  formatRoundTripMismatchMessage,
  readInvoiceExcelRoundTrip,
} from "../utils/invoiceExcelRoundTrip";
import { generatedFiles, getGeneratedInvoiceExcelDir } from "../utils/invoiceExcel";

export async function assertSingleLineUploadedExcelRoundTrip(
  page: Page,
  uploadFilePath: string
): Promise<void> {
  const uploaded = readInvoiceExcelRoundTrip(uploadFilePath);
  if (uploaded.dataRowCount !== 1) {
    flowLog(
      "ExcelRoundTrip",
      `Skip round-trip: ${uploaded.dataRowCount} data row(s) in ${uploadFilePath}`
    );
    return;
  }
  const invoiceNumber = uploaded.invoiceNumber.trim();
  if (!invoiceNumber) {
    throw new Error(
      `Single-line Excel round-trip: no Invoice Number in ${uploadFilePath}`
    );
  }

  const dashboard = new DashboardPage(page);
  await dashboard.openDashboard(parallelWorkerDashboardOpenOpts());
  await dashboard.refreshDashboardForInvoiceTable(invoiceNumber);
  await dashboard.waitForInvoiceReadyToSubmitStatus(invoiceNumber);

  const row = await dashboard.invoiceRowForRoundTrip(invoiceNumber);
  await dashboard.clickInvoiceNumberOnRow(row);
  const submenu = await dashboard.openInvoiceDownloadSubmenuOnRow(row);
  const downloaded = await dashboard.clickDownloadFormatInSubmenu(
    submenu,
    INVOICE_DOWNLOAD_FORMAT_LABEL.excel
  );

  const dir = getGeneratedInvoiceExcelDir();
  fs.mkdirSync(dir, { recursive: true });
  const downloadPath = path.join(dir, `${invoiceNumber}-downloaded.xlsx`);
  fs.writeFileSync(downloadPath, downloaded.buffer);
  if (!generatedFiles.includes(downloadPath)) {
    generatedFiles.push(downloadPath);
  }

  const result = compareInvoiceExcelRoundTrip(uploadFilePath, downloadPath);
  if (result.mismatches.length > 0) {
    throw new Error(
      formatRoundTripMismatchMessage(invoiceNumber, result.mismatches)
    );
  }
  flowLog("ExcelRoundTrip", `Filled columns match for ${invoiceNumber}`);
}
