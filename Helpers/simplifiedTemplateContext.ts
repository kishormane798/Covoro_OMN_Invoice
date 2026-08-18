import path from "node:path";
import { clearInvoiceTemplateHeaderCache } from "../utils/invoiceExcel";

/**
 * Points `INVOICE_TEMPLATE_PATH` at SimplifiedTemplate.xlsx for simplified specs.
 * Use `applySimplifiedTemplateEnv` in `beforeEach` and `clearSimplifiedTemplateEnv` in `afterAll`.
 */
export const SIMPLIFIED_TEMPLATE_WORKBOOK_RELATIVE_PATH = path.join(
  "testData",
  "uploads",
  "SimplifiedTemplate.xlsx"
);

export function applySimplifiedTemplateEnv(): void {
  process.env.INVOICE_TEMPLATE_PATH = SIMPLIFIED_TEMPLATE_WORKBOOK_RELATIVE_PATH;
  clearInvoiceTemplateHeaderCache();
}

export function clearSimplifiedTemplateEnv(): void {
  delete process.env.INVOICE_TEMPLATE_PATH;
  clearInvoiceTemplateHeaderCache();
}
