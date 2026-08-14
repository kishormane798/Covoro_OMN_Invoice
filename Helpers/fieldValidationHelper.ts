import { Page } from "@playwright/test";
import { UploadInvoicePage } from "../pageObjects/UploadInvoicePage";
import { validateErrorFileColumn, printErrorWorkbookMessages } from "../utils/invoiceExcel";

/** Invoice # helpers for min/max and negative field-validation specs. */
export function buildInvoiceNumber(value: string, maxLen = 64): string {
  if (value.length <= maxLen) return value;
  return value.slice(0, maxLen);
}

export function randomAlphaNumeric(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

/** After upload error: download annotated workbook and assert Errors column mentions `field`. */
export async function verifyErrorFile(page: Page, field: string) {
  const uploadPage = new UploadInvoicePage(page);

  await uploadPage.waitForStatus("error");
  await uploadPage.waitForErrorFileDownloadEnabled();

  const errorFilePath = await uploadPage.downloadErrorFileViaClick();
  printErrorWorkbookMessages(errorFilePath, 6);
  await validateErrorFileColumn(errorFilePath, field);
}
