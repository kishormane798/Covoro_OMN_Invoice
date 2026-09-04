/**
 * Spec support for Covoro Excel field-validation suites.
 * Keeps orchestration constants / filters out of `*.spec.ts` (tests-only).
 */
import type { Page } from "@playwright/test";
import * as FV from "../../testData/FieldValidations";
import { SIMPLIFIED_TEMPLATE_HEADER_LABELS } from "../../testData/invoiceTemplateHeaders/invoiceColumnMapping";
import { filterConfigsByHeaderLabels } from "../../utils/excel/invoiceExcel";
import type { DropdownWriteCasing } from "./omanFieldValidationExcelHelper";
import { uploadAndVerify } from "./uploadHelper";
import { assertSingleLineUploadedExcelRoundTrip } from "./invoiceExcelRoundTripHelper";

export const FIELD_VALIDATION_TEMPLATE = "Covoro";
export const FIELD_VALIDATION_TEMPLATE_SIMPLIFIED = "Simplified";

/** Seller/buyer party columns: fill identity only — no min/max, dropdown, or conditional cases. */
export function isSimplifiedIgnoredPartyField(field: string): boolean {
  const k = field.replace(/\s+/g, " ").trim().toLowerCase();
  return k === "scheme identifier" || k.startsWith("seller ") || k.startsWith("buyer ");
}

export function simplifiedFieldConfigs<T extends { field: string }>(
  configs: readonly T[] | T[]
): T[] {
  return filterConfigsByHeaderLabels(
    [...configs],
    SIMPLIFIED_TEMPLATE_HEADER_LABELS
  ).filter((c) => !isSimplifiedIgnoredPartyField(c.field));
}

export const dropdownMasterOnCovoro = FV.mergeDropdownFieldConfigs(
  FV.dropdownFieldMasterConfig,
  FV.conditionalDropdownFieldMasterConfig
);

export const dropdownInvalidOnCovoro = FV.mergeDropdownFieldConfigs(
  FV.dropdownFieldInvalidConfig,
  FV.documentChargesAllowancesDropdownInvalidConfig,
  FV.conditionalDropdownFieldInvalidConfig,
  FV.hsCodeDropdownInvalidConfig
);

export const dropdownMasterOnSimplified = simplifiedFieldConfigs(
  dropdownMasterOnCovoro
);
export const dropdownInvalidOnSimplified = simplifiedFieldConfigs(
  dropdownInvalidOnCovoro
);
export const fieldInvoiceNumberOnSimplified = simplifiedFieldConfigs(
  FV.fieldInvoice_number
);
export const mandatoryOnSimplified = simplifiedFieldConfigs(
  FV.fieldValidationMandatory
);
export const optionalOnSimplified = simplifiedFieldConfigs(
  FV.fieldValidationOptional
);

export const NON_OMR_INVOICE_CURRENCY_CODES = FV.INVOICE_CURRENCY_DROPDOWN_CODES.filter(
  (code) => code !== "OMR"
);

export const DROPDOWN_TIMEOUT_MS = 6 * 60 * 1000;
export const UNIT_OF_MEASUREMENT_TIMEOUT_MS = 10 * 60 * 1000;
/** One workbook per HS part (at least as large as the longer list). */
export const HS_CODE_DROPDOWN_BATCH_SIZE = Math.max(
  ...FV.hsCodeDropdownPartMasterConfig.map((config) => config.master.length)
);
export const HS_CODE_DROPDOWN_TIMEOUT_MS = 40 * 60 * 1000;

export const DROPDOWN_ACCEPT_CASINGS: Array<{
  writeCasing: DropdownWriteCasing;
  condition: string;
}> = [
  { writeCasing: "exact", condition: "exact master values" },
  { writeCasing: "lower", condition: "lowercase master values" },
  { writeCasing: "upper", condition: "uppercase master values" },
];

/**
 * Length-rule fields that need pattern/format suites (IBR-002 / IBR-003 / Tax Rate),
 * not random length strings.
 */
export const CONDITIONAL_LENGTH_SKIP = new Set([
  // Format / pattern suites (format-context + Conditional IBR-002 / IBR-003).
  "Seller VAT Identifier (TRN / TIN)",
  "Buyer VAT identifier",
  "Third Party VATIN",
  "Unique Identifier Number",
  "Prepayment invoice UUID",
  "Supporting document UUID",
  "Tax Rate",
  // Presence + length covered by Conditional IBR-CO-21.
  "Item attribute name",
  "Item attribute value",
  // 12-digit HS rule owned by Conditional IBR-080-OM (min/max length only re-assert it).
  "Item classification identifier",
  // Presence covered by Conditional PARTY-ID; length stays in party companion suite.
  "Buyer identifier",
  "Seller identifier",
]);

/** Numeric fields that need FX / accounting-currency / profit-margin txn context. */
export const NUMERIC_CONTEXT_SKIP = new Set([
  "Currency Exchange Rate",
  "Invoice total tax amount in tax accounting currency",
  "Total amount due (profit margin)",
]);

export const conditionalLengthConfigs = FV.fieldValidationConditional.filter(
  (c) => !CONDITIONAL_LENGTH_SKIP.has(c.field)
);

export const conditionalLengthOnSimplified = simplifiedFieldConfigs(
  conditionalLengthConfigs
);

export const numericFieldConfigs = FV.fieldValidationNumeric.filter(
  (c) => !NUMERIC_CONTEXT_SKIP.has(c.field)
);

export const numericFieldConfigsOnSimplified = simplifiedFieldConfigs(
  numericFieldConfigs
);

function headerMatchKey(name: string): string {
  return name.replace(/\s+/g, " ").trim().toLowerCase();
}

const simplifiedHeaderKeys = new Set(
  SIMPLIFIED_TEMPLATE_HEADER_LABELS.map((h) => headerMatchKey(h))
);

export const formatContextOnSimplified = FV.formatContextFieldValidationCases.filter(
  (tc) =>
    simplifiedHeaderKeys.has(headerMatchKey(tc.field)) &&
    !isSimplifiedIgnoredPartyField(tc.field)
);

export const hsCodeDropdownOnSimplified = simplifiedFieldConfigs(
  FV.hsCodeDropdownPartMasterConfig
);

/**
 * Accepted field-validation upload: completed, then Ready to Submit → Download Excel
 * and compare filled cells. Skips multi-line workbooks. Do not use for dropdown /
 * CL-06 master loops, formula, or conditional specs.
 */
export async function uploadAndVerifyFieldAccepted(
  page: Page,
  filePath: string
): Promise<void> {
  await uploadAndVerify(page, filePath);
  await assertSingleLineUploadedExcelRoundTrip(page, filePath);
}
