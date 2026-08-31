import type { Page } from "@playwright/test";
import { uploadAndVerify } from "./uploadHelper";
import {
  runErrorValidation,
  runErrorValidationForAnyOfFields,
  runErrorValidationForAllDataRows,
} from "./excelEditMessageCheck";
import {
  BUYER_ADDRESS_LINE_1_FIELD,
  BUYER_ADDRESS_REQUIRED_SCENARIOS,
  BUYER_IDENTIFIER_FIELD,
  BUYER_VAT_IDENTIFIER_FIELD,
  INVOICE_TOTAL_TAX_AMOUNT_FIELD,
  INVOICE_TYPE_CODE_INVOICE_OUT_OF_SCOPE_OF_TAX,
  INVOICE_TYPE_COMMERCIAL_INVOICE,
  INVOICED_ITEM_TAX_RATE_FIELD,
  INVOICING_PERIOD_END_DATE_FIELD,
  INVOICING_PERIOD_START_DATE_FIELD,
  LINE_ITEM_VAT_AMOUNT_FIELD,
  LINE_ITEM_VAT_AMOUNT_REQUIRED_ALLOWED_SCENARIOS,
  LINE_ITEM_VAT_AMOUNT_REQUIRED_NOT_ALLOWED_SCENARIOS,
  LINE_ITEM_VAT_AMOUNT_ZERO_E_ALLOWED_SCENARIOS,
  LINE_ITEM_VAT_AMOUNT_ZERO_E_NOT_ALLOWED_SCENARIOS,
  PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD,
  SELLER_VAT_IDENTIFIER_FIELD,
  SUMMARY_INVOICE_PERIOD_SCENARIOS,
  SUMMARY_PERIOD_SAME_CALENDAR_MONTH_SCENARIOS,
  VAT_CATEGORY_TAX_AMOUNT_E09_ALLOWED_SCENARIOS,
  VAT_CATEGORY_TAX_AMOUNT_E09_NOT_ALLOWED_SCENARIOS,
  VAT_CATEGORY_TAX_AMOUNT_O09_ALLOWED_SCENARIOS,
  VAT_CATEGORY_TAX_AMOUNT_O09_NOT_ALLOWED_SCENARIOS,
  VAT_CATEGORY_TAX_AMOUNT_Z09_ALLOWED_SCENARIOS,
  VAT_CATEGORY_TAX_AMOUNT_Z09_NOT_ALLOWED_SCENARIOS,
  type BuyerAddressRequiredScenario,
  type LineItemVatAmountZeroScenario,
  type SummaryPeriodScenario,
  type VatCategoryTaxAmountE09Scenario,
  type VatCategoryTaxAmountO09Scenario,
  type VatCategoryTaxAmountZ09Scenario,
} from "../../testData/FieldValidations/ConditionalValidation";
import {
  buildBuyerAddressRequiredScenarioRow,
  buildLineItemVatAmountRequiredScenarioRow,
  buildLineItemVatAmountZeroScenarioRow,
  buildSummaryInvoicePeriodScenarioRow,
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
 * Re-apply blank Line item VAT amount after generate so the submit writer
 * cannot refill BTOM-016. One Python process for the whole workbook.
 */
function patchIbr038EmptyLineVatAfterGenerate(
  filePath: string,
  rows: Array<Record<string, string | null>>
): void {
  const patches = rows
    .map((row, i) => ({
      header: LINE_ITEM_VAT_AMOUNT_FIELD,
      value: String(row[LINE_ITEM_VAT_AMOUNT_FIELD] ?? ""),
      dataRow: INVOICE_TEMPLATE_DATA_ROW + i,
    }))
    .filter((patch) => !String(patch.value).trim());
  patchInvoiceTextCellsInFile(filePath, patches);
}

/**
 * IBR-038-OM Allowed: one workbook, one row per invoice type × compatible txn
 * (dropdown-style batch), VAT present (or Simplified omit) → completed.
 */
export async function verifyIbr038OmAllowedBatch(page: Page): Promise<void> {
  const scenarios = LINE_ITEM_VAT_AMOUNT_REQUIRED_ALLOWED_SCENARIOS;
  if (!scenarios.length) {
    throw new Error("verifyIbr038OmAllowedBatch: no allowed scenarios");
  }
  const rows = scenarios.map((scenario) =>
    collapseSubmitRowHeaderKeys(
      buildLineItemVatAmountRequiredScenarioRow(scenario)
    )
  );
  const { filePath } = await generateDistinctSubmitInvoices(rows, {
    fileName: `IBR-038-OM-allowed-${Date.now()}.xlsx`,
  });
  patchIbr038EmptyLineVatAfterGenerate(filePath, rows);
  await uploadAndVerify(page, filePath);
}

function invoiceTypeGroupFileSlug(invoiceTypes: readonly string[]): string {
  return invoiceTypes
    .map((label) => label.replace(/\s+/g, "-").slice(0, 20))
    .join("_");
}

function ibr038NotAllowedScenariosForTypes(
  invoiceTypes: readonly string[]
): typeof LINE_ITEM_VAT_AMOUNT_REQUIRED_NOT_ALLOWED_SCENARIOS {
  const allowed = new Set(invoiceTypes);
  return LINE_ITEM_VAT_AMOUNT_REQUIRED_NOT_ALLOWED_SCENARIOS.filter((scenario) =>
    allowed.has(scenario.invoiceTypeCode ?? INVOICE_TYPE_COMMERCIAL_INVOICE)
  );
}

/**
 * IBR-038-OM Not Allowed: one workbook for a group of invoice types, one row
 * per compatible non-Simplified txn, VAT empty.
 */
export async function verifyIbr038OmNotAllowedBatch(
  page: Page,
  invoiceTypes: readonly string[]
): Promise<void> {
  const scenarios = ibr038NotAllowedScenariosForTypes(invoiceTypes);
  if (!scenarios.length) {
    throw new Error(
      `verifyIbr038OmNotAllowedBatch: no not-allowed scenarios for ${invoiceTypes.join(", ")}`
    );
  }
  const rows = scenarios.map((scenario) =>
    collapseSubmitRowHeaderKeys(
      buildLineItemVatAmountRequiredScenarioRow(scenario)
    )
  );
  const { filePath } = await generateDistinctSubmitInvoices(rows, {
    fileName: `IBR-038-OM-not-allowed-${invoiceTypeGroupFileSlug(invoiceTypes)}-${Date.now()}.xlsx`,
  });
  patchIbr038EmptyLineVatAfterGenerate(filePath, rows);
  await runErrorValidationForAllDataRows(page, {
    filePath,
    field: LINE_ITEM_VAT_AMOUNT_FIELD,
    expectedDataRowCount: scenarios.length,
    checkEdit: false,
  });
}

/**
 * Re-apply Line item VAT amount after generate. Exempt recalculation would
 * force 0 (IBR-039 Allowed) and wipe the Not Allowed 50.
 */
function patchIbr039LineVatAfterGenerate(
  filePath: string,
  scenarios: readonly LineItemVatAmountZeroScenario[]
): void {
  const patches = scenarios.map((scenario, i) => ({
    header: LINE_ITEM_VAT_AMOUNT_FIELD,
    value: String(scenario.lineItemVatAmount ?? ""),
    dataRow: INVOICE_TEMPLATE_DATA_ROW + i,
  }));
  patchInvoiceTextCellsInFile(filePath, patches);
}

/**
 * IBR-039-OM Allowed: one workbook, one row per invoice type × compatible txn
 * (dropdown-style batch), Exempt + VAT 0 → completed.
 */
export async function verifyIbr039OmAllowedBatch(page: Page): Promise<void> {
  const scenarios = LINE_ITEM_VAT_AMOUNT_ZERO_E_ALLOWED_SCENARIOS;
  if (!scenarios.length) {
    throw new Error("verifyIbr039OmAllowedBatch: no allowed scenarios");
  }
  const rows = scenarios.map((scenario) =>
    collapseSubmitRowHeaderKeys(
      buildLineItemVatAmountZeroScenarioRow(scenario)
    )
  );
  const { filePath } = await generateDistinctSubmitInvoices(rows, {
    fileName: `IBR-039-OM-allowed-${Date.now()}.xlsx`,
  });
  patchIbr039LineVatAfterGenerate(filePath, scenarios);
  await uploadAndVerify(page, filePath);
}

function ibr039NotAllowedScenariosForTypes(
  invoiceTypes: readonly string[]
): typeof LINE_ITEM_VAT_AMOUNT_ZERO_E_NOT_ALLOWED_SCENARIOS {
  const allowed = new Set(invoiceTypes);
  return LINE_ITEM_VAT_AMOUNT_ZERO_E_NOT_ALLOWED_SCENARIOS.filter((scenario) =>
    allowed.has(
      scenario.invoiceTypeCode ?? INVOICE_TYPE_CODE_INVOICE_OUT_OF_SCOPE_OF_TAX
    )
  );
}

/**
 * IBR-039-OM Not Allowed: one workbook for a group of invoice types, Exempt +
 * VAT 50. Every uploaded row must error on Line item VAT amount.
 */
export async function verifyIbr039OmNotAllowedBatch(
  page: Page,
  invoiceTypes: readonly string[]
): Promise<void> {
  const scenarios = ibr039NotAllowedScenariosForTypes(invoiceTypes);
  if (!scenarios.length) {
    throw new Error(
      `verifyIbr039OmNotAllowedBatch: no not-allowed scenarios for ${invoiceTypes.join(", ")}`
    );
  }
  const rows = scenarios.map((scenario) =>
    collapseSubmitRowHeaderKeys(
      buildLineItemVatAmountZeroScenarioRow(scenario)
    )
  );
  const { filePath } = await generateDistinctSubmitInvoices(rows, {
    fileName: `IBR-039-OM-not-allowed-${invoiceTypeGroupFileSlug(invoiceTypes)}-${Date.now()}.xlsx`,
  });
  patchIbr039LineVatAfterGenerate(filePath, scenarios);
  await runErrorValidationForAllDataRows(page, {
    filePath,
    field: LINE_ITEM_VAT_AMOUNT_FIELD,
    expectedDataRowCount: scenarios.length,
    checkEdit: false,
  });
}

/**
 * IBR-016-OM: worker identity refills Buyer VAT identifier after generate.
 * Re-apply blanks so identifier-only and both-empty polarities stay empty.
 */
export function patchBlankBuyerIdOrVatinIfEmpty(
  filePath: string,
  rowData: Record<string, string | null>
): void {
  if (!String(rowData[BUYER_IDENTIFIER_FIELD] ?? "").trim()) {
    patchInvoiceTextCellInFile(filePath, BUYER_IDENTIFIER_FIELD, "");
  }
  if (!String(rowData[BUYER_VAT_IDENTIFIER_FIELD] ?? "").trim()) {
    patchInvoiceTextCellInFile(filePath, BUYER_VAT_IDENTIFIER_FIELD, "");
  }
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

function ibr019AllowedScenarios(): BuyerAddressRequiredScenario[] {
  return BUYER_ADDRESS_REQUIRED_SCENARIOS.filter((scenario) => !scenario.shouldError);
}

function ibr019EmptyScenariosForField(
  field: string
): BuyerAddressRequiredScenario[] {
  return BUYER_ADDRESS_REQUIRED_SCENARIOS.filter(
    (scenario) =>
      scenario.shouldError && scenario.expectedErrorField === field
  );
}

/**
 * Re-apply one empty buyer-address column after generate (one Python process).
 * Do not loop patchInvoiceTextCellInFile per cell — 11×5 spawns is several minutes on Windows.
 */
function patchIbr019EmptyAddressFieldAfterGenerate(
  filePath: string,
  rows: Array<Record<string, string | null>>,
  field: string
): void {
  patchInvoiceTextCellsInFile(
    filePath,
    rows.map((row, i) => ({
      header: field,
      value: String(row[field] ?? ""),
      dataRow: INVOICE_TEMPLATE_DATA_ROW + i,
    }))
  );
}

/**
 * IBR-019-OM Allowed: one workbook with one invoice row per txn type
 * (dropdown-style batch, same as ALIGNED-IBRP-E/O-09-OM), complete buyer address,
 * single upload → completed.
 */
export async function verifyIbr019OmAllowedBatch(page: Page): Promise<void> {
  const scenarios = ibr019AllowedScenarios();
  if (!scenarios.length) {
    throw new Error("verifyIbr019OmAllowedBatch: no allowed scenarios");
  }
  const rows = scenarios.map((scenario) =>
    collapseSubmitRowHeaderKeys(buildBuyerAddressRequiredScenarioRow(scenario))
  );
  const { filePath } = await generateDistinctSubmitInvoices(rows, {
    fileName: `IBR-019-OM-allowed-${Date.now()}.xlsx`,
  });
  await uploadAndVerify(page, filePath);
}

/**
 * IBR-019-OM Not Allowed: one workbook, one invoice row per txn type, one
 * buyer-address field empty. Error file must have exactly N error rows
 * (same as ALIGNED-IBRP-E/O-09-OM: upload N → error file N).
 */
export async function verifyIbr019OmEmptyFieldBatch(
  page: Page,
  field: string
): Promise<void> {
  const scenarios = ibr019EmptyScenariosForField(field);
  if (!scenarios.length) {
    throw new Error(
      `verifyIbr019OmEmptyFieldBatch: no empty scenarios for ${field}`
    );
  }
  const rows = scenarios.map((scenario) =>
    collapseSubmitRowHeaderKeys(buildBuyerAddressRequiredScenarioRow(scenario))
  );
  const { filePath } = await generateDistinctSubmitInvoices(rows, {
    fileName: `IBR-019-OM-empty-${field.replace(/\s+/g, "-")}-${Date.now()}.xlsx`,
  });
  patchIbr019EmptyAddressFieldAfterGenerate(filePath, rows, field);
  await runErrorValidationForAllDataRows(page, {
    filePath,
    field: scenarios[0]?.expectedErrorField ?? BUYER_ADDRESS_LINE_1_FIELD,
    expectedDataRowCount: scenarios.length,
    checkEdit: false,
  });
}

function ibr036AllowedScenarios(): SummaryPeriodScenario[] {
  return SUMMARY_PERIOD_SAME_CALENDAR_MONTH_SCENARIOS.filter(
    (scenario) => !scenario.shouldError
  );
}

function ibr036NotAllowedScenarios(): SummaryPeriodScenario[] {
  return SUMMARY_PERIOD_SAME_CALENDAR_MONTH_SCENARIOS.filter(
    (scenario) => scenario.shouldError
  );
}

/**
 * IBR-036-OM Allowed: one workbook with one invoice row per Master invoice type
 * (dropdown-style batch, same as IBR-019-OM), Summary txn + same-month period,
 * single upload → completed. Skips Self-billed document × Summary (IBR-177).
 */
export async function verifyIbr036OmAllowedBatch(page: Page): Promise<void> {
  const scenarios = ibr036AllowedScenarios();
  if (!scenarios.length) {
    throw new Error("verifyIbr036OmAllowedBatch: no allowed scenarios");
  }
  const rows = scenarios.map((scenario) =>
    collapseSubmitRowHeaderKeys(buildSummaryInvoicePeriodScenarioRow(scenario))
  );
  const { filePath } = await generateDistinctSubmitInvoices(rows, {
    fileName: `IBR-036-OM-allowed-${Date.now()}.xlsx`,
  });
  await uploadAndVerify(page, filePath);
}

/**
 * IBR-036-OM Not Allowed: one workbook, one invoice row per Master invoice type,
 * Summary txn + period dates in different months. Error file must have exactly
 * N error rows (same as IBR-019-OM: upload N → error file N).
 */
export async function verifyIbr036OmNotAllowedBatch(page: Page): Promise<void> {
  const scenarios = ibr036NotAllowedScenarios();
  if (!scenarios.length) {
    throw new Error("verifyIbr036OmNotAllowedBatch: no not-allowed scenarios");
  }
  const rows = scenarios.map((scenario) =>
    collapseSubmitRowHeaderKeys(buildSummaryInvoicePeriodScenarioRow(scenario))
  );
  const { filePath } = await generateDistinctSubmitInvoices(rows, {
    fileName: `IBR-036-OM-not-allowed-${Date.now()}.xlsx`,
  });
  await runErrorValidationForAllDataRows(page, {
    filePath,
    field:
      scenarios[0]?.expectedErrorField ?? INVOICING_PERIOD_END_DATE_FIELD,
    expectedDataRowCount: scenarios.length,
    checkEdit: false,
  });
}

function ibr037Scenarios(
  shouldError: boolean,
  invoiceTransactionTypeCode: string
): SummaryPeriodScenario[] {
  return SUMMARY_INVOICE_PERIOD_SCENARIOS.filter(
    (scenario) =>
      scenario.shouldError === shouldError &&
      scenario.invoiceTransactionTypeCode === invoiceTransactionTypeCode
  );
}

function ibr037TxnFileSlug(invoiceTransactionTypeCode: string): string {
  return invoiceTransactionTypeCode.replace(/\s+/g, "-");
}

/**
 * Re-apply empty invoicing period after generate so Summary / Continuous
 * companions cannot refill IBT-073 / IBT-074.
 */
function patchIbr037EmptyPeriodAfterGenerate(
  filePath: string,
  rows: Array<Record<string, string | null>>
): void {
  patchInvoiceTextCellsInFile(
    filePath,
    rows.flatMap((row, i) => [
      {
        header: INVOICING_PERIOD_START_DATE_FIELD,
        value: String(row[INVOICING_PERIOD_START_DATE_FIELD] ?? ""),
        dataRow: INVOICE_TEMPLATE_DATA_ROW + i,
      },
      {
        header: INVOICING_PERIOD_END_DATE_FIELD,
        value: String(row[INVOICING_PERIOD_END_DATE_FIELD] ?? ""),
        dataRow: INVOICE_TEMPLATE_DATA_ROW + i,
      },
    ])
  );
}

/**
 * IBR-037-OM Allowed: one workbook for a single txn type (Summary or
 * Continuous) with one invoice row per Master invoice type (30 rows),
 * period dates provided, single upload → completed.
 */
export async function verifyIbr037OmAllowedBatch(
  page: Page,
  invoiceTransactionTypeCode: string
): Promise<void> {
  const scenarios = ibr037Scenarios(false, invoiceTransactionTypeCode);
  if (!scenarios.length) {
    throw new Error(
      `verifyIbr037OmAllowedBatch: no allowed scenarios for ${invoiceTransactionTypeCode}`
    );
  }
  const rows = scenarios.map((scenario) =>
    collapseSubmitRowHeaderKeys(buildSummaryInvoicePeriodScenarioRow(scenario))
  );
  const { filePath } = await generateDistinctSubmitInvoices(rows, {
    fileName: `IBR-037-OM-allowed-${ibr037TxnFileSlug(invoiceTransactionTypeCode)}-${Date.now()}.xlsx`,
  });
  await uploadAndVerify(page, filePath);
}

/**
 * IBR-037-OM Not Allowed: one workbook for a single txn type, invoicing
 * period left empty. Error file must have exactly N error rows (30 invoice
 * types for that txn).
 */
export async function verifyIbr037OmNotAllowedBatch(
  page: Page,
  invoiceTransactionTypeCode: string
): Promise<void> {
  const scenarios = ibr037Scenarios(true, invoiceTransactionTypeCode);
  if (!scenarios.length) {
    throw new Error(
      `verifyIbr037OmNotAllowedBatch: no not-allowed scenarios for ${invoiceTransactionTypeCode}`
    );
  }
  const rows = scenarios.map((scenario) =>
    collapseSubmitRowHeaderKeys(buildSummaryInvoicePeriodScenarioRow(scenario))
  );
  const { filePath } = await generateDistinctSubmitInvoices(rows, {
    fileName: `IBR-037-OM-not-allowed-${ibr037TxnFileSlug(invoiceTransactionTypeCode)}-${Date.now()}.xlsx`,
  });
  patchIbr037EmptyPeriodAfterGenerate(filePath, rows);
  await runErrorValidationForAllDataRows(page, {
    filePath,
    field:
      scenarios[0]?.expectedErrorField ?? INVOICING_PERIOD_START_DATE_FIELD,
    expectedDataRowCount: scenarios.length,
    checkEdit: false,
  });
}
