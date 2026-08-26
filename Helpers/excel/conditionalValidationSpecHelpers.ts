import type { Page } from "@playwright/test";
import { uploadAndVerify } from "./uploadHelper";
import {
  runErrorValidation,
  runErrorValidationForAnyOfFields,
  runErrorValidationForAllDataRows,
} from "./excelEditMessageCheck";
import {
  INVOICE_TOTAL_TAX_AMOUNT_FIELD,
  INVOICED_ITEM_TAX_RATE_FIELD,
  LINE_ITEM_VAT_AMOUNT_FIELD,
  PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD,
  SELLER_VAT_IDENTIFIER_FIELD,
  VAT_CATEGORY_TAX_AMOUNT_E09_ALLOWED_SCENARIOS,
  VAT_CATEGORY_TAX_AMOUNT_E09_NOT_ALLOWED_SCENARIOS,
  VAT_CATEGORY_TAX_AMOUNT_O09_ALLOWED_SCENARIOS,
  VAT_CATEGORY_TAX_AMOUNT_O09_NOT_ALLOWED_SCENARIOS,
  VAT_CATEGORY_TAX_AMOUNT_Z09_ALLOWED_SCENARIOS,
  VAT_CATEGORY_TAX_AMOUNT_Z09_NOT_ALLOWED_SCENARIOS,
  type VatCategoryTaxAmountE09Scenario,
  type VatCategoryTaxAmountO09Scenario,
  type VatCategoryTaxAmountZ09Scenario,
} from "../../testData/FieldValidations/ConditionalValidation";
import {
  buildVatCategoryTaxAmountE09ScenarioRow,
  buildVatCategoryTaxAmountO09ScenarioRow,
  buildVatCategoryTaxAmountZ09ScenarioRow,
} from "./conditionalValidationHelper";
import {
  generateDistinctSubmitInvoices,
  INVOICE_TEMPLATE_DATA_ROW,
  patchInvoiceDataCellInFile,
  patchInvoiceTextCellInFile,
  patchInvoiceTextCellsInFile,
  generateInvoiceFromSubmitData,
} from "../../utils/excel/invoiceExcel";

export type ConditionalErrorOptions = {
  checkEdit?: boolean;
  strictExcelComment?: boolean;
  silent?: boolean;
  patchFile?: (
    filePath: string,
    rowData: Record<string, string | null>
  ) => void;
};

export type ConditionalRowTransform = (
  rowData: Record<string, string | null>
) => Record<string, string | null>;

/** Playwright test name: drop leading `TC_01 ` / `TC_12 ` trace id from scenario title. */
export function playwrightTitleFromScenarioTitle(title: string): string {
  return title.replace(/^TC_\d+\s+/, "");
}

/**
 * Collapse Title-Case duplicates onto the first spelling (seed keys). Later values win
 * so formula inputs like Item gross price are what generateInvoiceFromSubmitData totals use.
 */
function collapseSubmitRowHeaderKeys(
  row: Record<string, string | null>
): Record<string, string | null> {
  const out: Record<string, string | null> = {};
  const byNorm = new Map<string, string>();
  for (const [key, value] of Object.entries(row)) {
    const norm = key.trim().toLowerCase().replace(/\s+/g, " ");
    const existing = byNorm.get(norm);
    if (existing !== undefined) {
      out[existing] = value;
    } else {
      byNorm.set(norm, key);
      out[key] = value;
    }
  }
  return out;
}

/** Patch generated workbook seller VAT cell from row data. */
export function patchSellerVatFromRow(
  filePath: string,
  rowData: Record<string, string | null>
): void {
  patchInvoiceTextCellInFile(
    filePath,
    SELLER_VAT_IDENTIFIER_FIELD,
    String(rowData[SELLER_VAT_IDENTIFIER_FIELD] ?? "")
  );
}

/**
 * IBR-038-OM: submit writer recalculates Line item VAT amount. Re-apply an
 * explicit blank after generate so Full Tax empty cases stay empty.
 */
export function patchBlankLineItemVatAmountIfEmpty(
  filePath: string,
  rowData: Record<string, string | null>
): void {
  if (String(rowData[LINE_ITEM_VAT_AMOUNT_FIELD] ?? "").trim()) {
    return;
  }
  patchInvoiceTextCellInFile(filePath, LINE_ITEM_VAT_AMOUNT_FIELD, "");
}

/**
 * CL-11-OM: Excel dropdowns can overwrite empty / invalid BTOM-025. Re-apply
 * the scenario value after generate so presence and codelist cases stick.
 */
export function patchProfitMarginItemTypeFromRow(
  filePath: string,
  rowData: Record<string, string | null>
): void {
  patchInvoiceTextCellInFile(
    filePath,
    PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD,
    String(rowData[PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD] ?? "")
  );
}

/**
 * ALIGNED-IBRP-E/O/S/Z-05-OM: submit Exempt blanking / Excel OOXML can drop
 * intentional Tax Rate (especially whitespace-only). Re-apply via JSON patch
 * (argv cannot carry pure spaces reliably on Windows).
 */
export function patchTaxRateFromRow(
  filePath: string,
  rowData: Record<string, string | null>
): void {
  if (
    !Object.prototype.hasOwnProperty.call(rowData, INVOICED_ITEM_TAX_RATE_FIELD)
  ) {
    return;
  }
  const rate = rowData[INVOICED_ITEM_TAX_RATE_FIELD];
  if (rate === null || rate === undefined) {
    return;
  }
  // Keep "" as omit; whitespace-only has length > 0 and must be re-written.
  if (String(rate).length === 0) {
    return;
  }
  patchInvoiceTextCellsInFile(filePath, [
    { header: INVOICED_ITEM_TAX_RATE_FIELD, value: String(rate) },
  ]);
}

/**
 * ALIGNED-IBRP-E-09-OM: submit writer recalculates Invoice total tax amount
 * (IBT-117 proxy). Re-apply 0 / non-zero after generate. Do not blank this
 * column to simulate IBG-23 omit — VAT breakdown is UI/backend auto-map.
 * Resolve header case-insensitively so seed casing ("Invoice total tax amount")
 * still supplies the scenario value after collapseSubmitRowHeaderKeys.
 */
export function patchVatCategoryTaxAmountAfterGenerate(
  filePath: string,
  rowData: Record<string, string | null>
): void {
  const raw = readRowFieldIgnoringCase(rowData, INVOICE_TOTAL_TAX_AMOUNT_FIELD);
  if (!raw.trim()) {
    return;
  }
  const amount = Number(raw);
  if (Number.isNaN(amount)) {
    patchInvoiceTextCellInFile(filePath, INVOICE_TOTAL_TAX_AMOUNT_FIELD, raw);
    return;
  }
  patchInvoiceDataCellInFile(filePath, INVOICE_TOTAL_TAX_AMOUNT_FIELD, amount);
}

/**
 * ALIGNED-IBRP-E-09-OM Allowed: one workbook with one invoice row per txn type
 * (dropdown-style batch), tax amount 0, single upload → completed.
 */
export async function verifyAlignedIbrpE09OmAllowedBatch(
  page: Page,
  scenarios: readonly VatCategoryTaxAmountE09Scenario[] = VAT_CATEGORY_TAX_AMOUNT_E09_ALLOWED_SCENARIOS
): Promise<void> {
  if (!scenarios.length) {
    throw new Error("verifyAlignedIbrpE09OmAllowedBatch: no allowed scenarios");
  }
  const rows = scenarios.map((scenario) =>
    collapseSubmitRowHeaderKeys(buildVatCategoryTaxAmountE09ScenarioRow(scenario))
  );
  const { filePath } = await generateDistinctSubmitInvoices(rows, {
    fileName: `ALIGNED-IBRP-E-09-OM-allowed-${Date.now()}.xlsx`,
  });
  for (let i = 0; i < scenarios.length; i++) {
    const amount = Number(scenarios[i]!.vatCategoryTaxAmount);
    if (Number.isNaN(amount)) {
      continue;
    }
    patchInvoiceDataCellInFile(
      filePath,
      INVOICE_TOTAL_TAX_AMOUNT_FIELD,
      amount,
      INVOICE_TEMPLATE_DATA_ROW + i
    );
  }
  await uploadAndVerify(page, filePath);
}

/**
 * ALIGNED-IBRP-E-09-OM Not Allowed: same batch shape as Allowed — one workbook,
 * one invoice row per non-Simplified txn, tax amount ≠ 0. Every uploaded row must
 * show an error on Invoice total tax amount (fails if fewer rows have errors).
 */
export async function verifyAlignedIbrpE09OmNotAllowedBatch(
  page: Page,
  scenarios: readonly VatCategoryTaxAmountE09Scenario[] = VAT_CATEGORY_TAX_AMOUNT_E09_NOT_ALLOWED_SCENARIOS
): Promise<void> {
  if (!scenarios.length) {
    throw new Error(
      "verifyAlignedIbrpE09OmNotAllowedBatch: no not-allowed scenarios"
    );
  }
  const rows = scenarios.map((scenario) =>
    collapseSubmitRowHeaderKeys(buildVatCategoryTaxAmountE09ScenarioRow(scenario))
  );
  const { filePath } = await generateDistinctSubmitInvoices(rows, {
    fileName: `ALIGNED-IBRP-E-09-OM-not-allowed-${Date.now()}.xlsx`,
  });
  for (let i = 0; i < scenarios.length; i++) {
    const amount = Number(scenarios[i]!.vatCategoryTaxAmount);
    if (Number.isNaN(amount)) {
      continue;
    }
    patchInvoiceDataCellInFile(
      filePath,
      INVOICE_TOTAL_TAX_AMOUNT_FIELD,
      amount,
      INVOICE_TEMPLATE_DATA_ROW + i
    );
  }
  await runErrorValidationForAllDataRows(page, {
    filePath,
    field: INVOICE_TOTAL_TAX_AMOUNT_FIELD,
    expectedDataRowCount: scenarios.length,
    checkEdit: false,
  });
}

/**
 * ALIGNED-IBRP-O-09-OM Allowed: one workbook with one invoice row per txn type
 * (dropdown-style batch), tax amount 0, single upload → completed.
 */
export async function verifyAlignedIbrpO09OmAllowedBatch(
  page: Page,
  scenarios: readonly VatCategoryTaxAmountO09Scenario[] = VAT_CATEGORY_TAX_AMOUNT_O09_ALLOWED_SCENARIOS
): Promise<void> {
  if (!scenarios.length) {
    throw new Error("verifyAlignedIbrpO09OmAllowedBatch: no allowed scenarios");
  }
  const rows = scenarios.map((scenario) =>
    collapseSubmitRowHeaderKeys(buildVatCategoryTaxAmountO09ScenarioRow(scenario))
  );
  const { filePath } = await generateDistinctSubmitInvoices(rows, {
    fileName: `ALIGNED-IBRP-O-09-OM-allowed-${Date.now()}.xlsx`,
  });
  for (let i = 0; i < scenarios.length; i++) {
    const amount = Number(scenarios[i]!.vatCategoryTaxAmount);
    if (Number.isNaN(amount)) {
      continue;
    }
    patchInvoiceDataCellInFile(
      filePath,
      INVOICE_TOTAL_TAX_AMOUNT_FIELD,
      amount,
      INVOICE_TEMPLATE_DATA_ROW + i
    );
  }
  await uploadAndVerify(page, filePath);
}

/**
 * ALIGNED-IBRP-O-09-OM Not Allowed: same batch shape as Allowed — one workbook,
 * one invoice row per non-Simplified txn, tax amount ≠ 0. Every uploaded row must
 * show an error on Invoice total tax amount (fails if fewer rows have errors).
 */
export async function verifyAlignedIbrpO09OmNotAllowedBatch(
  page: Page,
  scenarios: readonly VatCategoryTaxAmountO09Scenario[] = VAT_CATEGORY_TAX_AMOUNT_O09_NOT_ALLOWED_SCENARIOS
): Promise<void> {
  if (!scenarios.length) {
    throw new Error(
      "verifyAlignedIbrpO09OmNotAllowedBatch: no not-allowed scenarios"
    );
  }
  const rows = scenarios.map((scenario) =>
    collapseSubmitRowHeaderKeys(buildVatCategoryTaxAmountO09ScenarioRow(scenario))
  );
  const { filePath } = await generateDistinctSubmitInvoices(rows, {
    fileName: `ALIGNED-IBRP-O-09-OM-not-allowed-${Date.now()}.xlsx`,
  });
  for (let i = 0; i < scenarios.length; i++) {
    const amount = Number(scenarios[i]!.vatCategoryTaxAmount);
    if (Number.isNaN(amount)) {
      continue;
    }
    patchInvoiceDataCellInFile(
      filePath,
      INVOICE_TOTAL_TAX_AMOUNT_FIELD,
      amount,
      INVOICE_TEMPLATE_DATA_ROW + i
    );
  }
  await runErrorValidationForAllDataRows(page, {
    filePath,
    field: INVOICE_TOTAL_TAX_AMOUNT_FIELD,
    expectedDataRowCount: scenarios.length,
    checkEdit: false,
  });
}

/**
 * ALIGNED-IBRP-Z-09-OM Allowed: one workbook with one invoice row per txn type
 * (dropdown-style batch), tax amount 0, single upload → completed.
 */
export async function verifyAlignedIbrpZ09OmAllowedBatch(
  page: Page,
  scenarios: readonly VatCategoryTaxAmountZ09Scenario[] = VAT_CATEGORY_TAX_AMOUNT_Z09_ALLOWED_SCENARIOS
): Promise<void> {
  if (!scenarios.length) {
    throw new Error("verifyAlignedIbrpZ09OmAllowedBatch: no allowed scenarios");
  }
  const rows = scenarios.map((scenario) =>
    collapseSubmitRowHeaderKeys(buildVatCategoryTaxAmountZ09ScenarioRow(scenario))
  );
  const { filePath } = await generateDistinctSubmitInvoices(rows, {
    fileName: `ALIGNED-IBRP-Z-09-OM-allowed-${Date.now()}.xlsx`,
  });
  for (let i = 0; i < scenarios.length; i++) {
    const amount = Number(scenarios[i]!.vatCategoryTaxAmount);
    if (Number.isNaN(amount)) {
      continue;
    }
    patchInvoiceDataCellInFile(
      filePath,
      INVOICE_TOTAL_TAX_AMOUNT_FIELD,
      amount,
      INVOICE_TEMPLATE_DATA_ROW + i
    );
  }
  await uploadAndVerify(page, filePath);
}

/**
 * ALIGNED-IBRP-Z-09-OM Not Allowed: same batch shape as Allowed — one workbook,
 * one invoice row per non-Simplified txn, tax amount ≠ 0. Every uploaded row must
 * show an error on Invoice total tax amount (fails if fewer rows have errors).
 */
export async function verifyAlignedIbrpZ09OmNotAllowedBatch(
  page: Page,
  scenarios: readonly VatCategoryTaxAmountZ09Scenario[] = VAT_CATEGORY_TAX_AMOUNT_Z09_NOT_ALLOWED_SCENARIOS
): Promise<void> {
  if (!scenarios.length) {
    throw new Error(
      "verifyAlignedIbrpZ09OmNotAllowedBatch: no not-allowed scenarios"
    );
  }
  const rows = scenarios.map((scenario) =>
    collapseSubmitRowHeaderKeys(buildVatCategoryTaxAmountZ09ScenarioRow(scenario))
  );
  const { filePath } = await generateDistinctSubmitInvoices(rows, {
    fileName: `ALIGNED-IBRP-Z-09-OM-not-allowed-${Date.now()}.xlsx`,
  });
  for (let i = 0; i < scenarios.length; i++) {
    const amount = Number(scenarios[i]!.vatCategoryTaxAmount);
    if (Number.isNaN(amount)) {
      continue;
    }
    patchInvoiceDataCellInFile(
      filePath,
      INVOICE_TOTAL_TAX_AMOUNT_FIELD,
      amount,
      INVOICE_TEMPLATE_DATA_ROW + i
    );
  }
  await runErrorValidationForAllDataRows(page, {
    filePath,
    field: INVOICE_TOTAL_TAX_AMOUNT_FIELD,
    expectedDataRowCount: scenarios.length,
    checkEdit: false,
  });
}

function readRowFieldIgnoringCase(
  rowData: Record<string, string | null>,
  preferredHeader: string
): string {
  if (Object.prototype.hasOwnProperty.call(rowData, preferredHeader)) {
    return String(rowData[preferredHeader] ?? "");
  }
  const norm = preferredHeader.trim().toLowerCase().replace(/\s+/g, " ");
  for (const [key, value] of Object.entries(rowData)) {
    if (key.trim().toLowerCase().replace(/\s+/g, " ") === norm) {
      return String(value ?? "");
    }
  }
  return "";
}

export async function verifyConditionalScenario(
  page: Page,
  rowData: Record<string, string | null>,
  errorField: string,
  shouldError: boolean,
  options: ConditionalErrorOptions = {},
  transformRow?: ConditionalRowTransform
): Promise<void> {
  const prepared = collapseSubmitRowHeaderKeys(
    transformRow ? transformRow(rowData) : rowData
  );
  const { filePath, invoiceNumber } = await generateInvoiceFromSubmitData(prepared);
  options.patchFile?.(filePath, prepared);

  if (shouldError) {
    await runErrorValidation(page, {
      filePath,
      field: errorField,
      invoiceNumber,
      checkEdit: options.checkEdit ?? true,
      strictExcelComment: options.strictExcelComment,
      silent: options.silent,
    });
    return;
  }

  await uploadAndVerify(page, filePath);
}

export async function verifyConditionalScenarioAnyOf(
  page: Page,
  rowData: Record<string, string | null>,
  errorFields: readonly string[],
  shouldError: boolean,
  options: ConditionalErrorOptions = {},
  transformRow?: ConditionalRowTransform
): Promise<void> {
  const prepared = collapseSubmitRowHeaderKeys(
    transformRow ? transformRow(rowData) : rowData
  );
  const { filePath, invoiceNumber } = await generateInvoiceFromSubmitData(prepared);
  options.patchFile?.(filePath, prepared);

  if (shouldError) {
    await runErrorValidationForAnyOfFields(page, {
      filePath,
      fields: [...errorFields],
      invoiceNumber,
      checkEdit: options.checkEdit ?? true,
      silent: options.silent ?? true,
      strictExcelComment: options.strictExcelComment ?? true,
    });
    return;
  }

  await uploadAndVerify(page, filePath);
}
