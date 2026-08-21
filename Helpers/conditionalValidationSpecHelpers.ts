import type { Page } from "@playwright/test";
import { uploadAndVerify } from "./uploadHelper";
import {
  runErrorValidation,
  runErrorValidationForAnyOfFields,
} from "./excelEditMessageCheck";
import {
  generateInvoiceFromSubmitData,
  patchInvoiceDataCellInFile,
  patchInvoiceTextCellInFile,
} from "../utils/invoiceExcel";
import {
  INVOICE_TOTAL_TAX_AMOUNT_FIELD,
  LINE_ITEM_VAT_AMOUNT_FIELD,
  PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD,
  SELLER_VAT_IDENTIFIER_FIELD,
} from "../testData/FieldValidations/ConditionalValidation";

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
 * ALIGNED-IBRP-E-09-OM: submit writer recalculates Invoice Total Tax Amount
 * (IBT-117 proxy). Re-apply 0 / non-zero after generate. Do not blank this
 * column to simulate IBG-23 omit — VAT breakdown is UI/backend auto-map.
 */
export function patchVatCategoryTaxAmountAfterGenerate(
  filePath: string,
  rowData: Record<string, string | null>
): void {
  const raw = String(rowData[INVOICE_TOTAL_TAX_AMOUNT_FIELD] ?? "");
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
