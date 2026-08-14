import type { Page } from "@playwright/test";
import { uploadAndVerify } from "./uploadHelper";
import {
  runErrorValidation,
  runErrorValidationForAnyOfFields,
} from "./excelEditMessageCheck";
import {
  generateInvoiceFromSubmitData,
  patchInvoiceTextCellInFile,
} from "../utils/invoiceExcel";
import { SELLER_VAT_IDENTIFIER_FIELD } from "../testData/FieldValidations/ConditionalValidation";

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

export async function verifyConditionalScenario(
  page: Page,
  rowData: Record<string, string | null>,
  errorField: string,
  shouldError: boolean,
  options: ConditionalErrorOptions = {},
  transformRow?: ConditionalRowTransform
): Promise<void> {
  const prepared = transformRow ? transformRow(rowData) : rowData;
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
  const prepared = transformRow ? transformRow(rowData) : rowData;
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
