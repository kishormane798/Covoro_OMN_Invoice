import path from "node:path";
import { clearInvoiceTemplateHeaderCache } from "../../utils/excel/invoiceExcel";

/**
 * Points `INVOICE_TEMPLATE_PATH` at SimplifiedTemplate.xlsx for simplified specs.
 * Use `applySimplifiedTemplateEnv` in `beforeEach` and `clearSimplifiedTemplateEnv` in `afterAll`.
 *
 * Also stamps worker TIN slots + buyer electronic used by Excel identity helpers.
 */
export const SIMPLIFIED_TEMPLATE_WORKBOOK_RELATIVE_PATH = path.join(
  "testData",
  "uploads",
  "SimplifiedTemplate.xlsx"
);

/** Worker dashboard / seller VATIN slots for Simplified (Kishor PVT LTD 1–5). */
export const SIMPLIFIED_SELLER_TIN_SLOTS = [
  "OM1708202600",
  "OM1708202601",
  "OM1708202602",
  "OM1708202603",
  "OM1708202604",
] as const;

export const SIMPLIFIED_SELLER_NAMES = [
  "Kishor PVT LTD 1",
  "Kishor PVT LTD 2",
  "Kishor PVT LTD 3",
  "Kishor PVT LTD 4",
  "Kishor PVT LTD 5",
] as const;

export const SIMPLIFIED_BUYER_NAME = "Prashant";
export const SIMPLIFIED_BUYER_ELECTRONIC = "om1008994728";
export const SIMPLIFIED_ELECTRONIC_SCHEME =
  "Oman Value Added Tax Identification Number (VATIN)";

const TIN_SLOTS_ENV = "UAE_EINVOICE_SELLER_TIN_SLOTS";
const COUNTERPARTY_EL_ENV = "UAE_EINVOICE_COUNTERPARTY_ELECTRONIC";

type SavedSimplifiedEnv = {
  template?: string;
  tinSlots?: string;
  counterpartyEl?: string;
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
      tinSlots: process.env[TIN_SLOTS_ENV],
      counterpartyEl: process.env[COUNTERPARTY_EL_ENV],
    };
  }
  applyDepth += 1;
  process.env.INVOICE_TEMPLATE_PATH = SIMPLIFIED_TEMPLATE_WORKBOOK_RELATIVE_PATH;
  process.env[TIN_SLOTS_ENV] = SIMPLIFIED_SELLER_TIN_SLOTS.join(",");
  process.env[COUNTERPARTY_EL_ENV] = SIMPLIFIED_BUYER_ELECTRONIC;
  clearInvoiceTemplateHeaderCache();
}

export function clearSimplifiedTemplateEnv(): void {
  applyDepth = 0;
  const prev = savedEnv;
  savedEnv = null;
  if (!prev) {
    delete process.env.INVOICE_TEMPLATE_PATH;
    delete process.env[TIN_SLOTS_ENV];
    delete process.env[COUNTERPARTY_EL_ENV];
  } else {
    restoreEnvKey("INVOICE_TEMPLATE_PATH", prev.template);
    restoreEnvKey(TIN_SLOTS_ENV, prev.tinSlots);
    restoreEnvKey(COUNTERPARTY_EL_ENV, prev.counterpartyEl);
  }
  clearInvoiceTemplateHeaderCache();
}
