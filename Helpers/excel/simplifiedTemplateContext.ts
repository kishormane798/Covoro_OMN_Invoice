import path from "node:path";
import { clearInvoiceTemplateHeaderCache } from "../../utils/excel/invoiceExcel";

/**
 * Points `INVOICE_TEMPLATE_PATH` at SimplifiedTemplate.xlsx for simplified specs.
 * Use `applySimplifiedTemplateEnv` in `beforeEach` and `clearSimplifiedTemplateEnv` in `afterAll`.
 *
 * Seller slots stay in `.env` (`OMN_EINVOICE_SELLER_TIN_SLOTS`).
 * Simplified buyer electronic is `OMN_EINVOICE_SIMPLIFIED_COUNTERPARTY_ELECTRONIC`
 * (written as `omXXXXXXXXXX`). Covoro Excel + UI buyer electronic is
 * `OMN_EINVOICE_COUNTERPARTY_ELECTRONIC`.
 */
export const SIMPLIFIED_TEMPLATE_WORKBOOK_RELATIVE_PATH = path.join(
  "testData",
  "uploads",
  "SimplifiedTemplate.xlsx"
);

export const SIMPLIFIED_SELLER_NAMES = [
  "Kishor PVT LTD 1",
  "Kishor PVT LTD 2",
  "Kishor PVT LTD 3",
  "Kishor PVT LTD 4",
  "Kishor PVT LTD 5",
] as const;

export const SIMPLIFIED_BUYER_NAME = "Prashant";
export const SIMPLIFIED_ELECTRONIC_SCHEME =
  "Oman Value Added Tax Identification Number (VATIN)";

type SavedSimplifiedEnv = {
  template?: string;
};

let savedEnv: SavedSimplifiedEnv | null = null;
let applyDepth = 0;

export function isSimplifiedTemplateEnv(): boolean {
  return (process.env.INVOICE_TEMPLATE_PATH ?? "")
    .replace(/\\/g, "/")
    .toLowerCase()
    .includes("simplifiedtemplate.xlsx");
}

function restoreEnvKey(name: string, previous: string | undefined): void {
  if (previous === undefined) {
    delete process.env[name];
    return;
  }
  process.env[name] = previous;
}

export function applySimplifiedTemplateEnv(): void {
  if (applyDepth === 0) {
    savedEnv = {
      template: process.env.INVOICE_TEMPLATE_PATH,
    };
  }
  applyDepth += 1;
  process.env.INVOICE_TEMPLATE_PATH = SIMPLIFIED_TEMPLATE_WORKBOOK_RELATIVE_PATH;
  clearInvoiceTemplateHeaderCache();
}

export function clearSimplifiedTemplateEnv(): void {
  applyDepth = 0;
  const prev = savedEnv;
  savedEnv = null;
  if (!prev) {
    delete process.env.INVOICE_TEMPLATE_PATH;
  } else {
    restoreEnvKey("INVOICE_TEMPLATE_PATH", prev.template);
  }
  clearInvoiceTemplateHeaderCache();
}
