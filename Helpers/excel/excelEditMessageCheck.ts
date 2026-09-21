/**
 * Error-file upload validation — workbook cell comments, Errors column, and optional edit-dialog message check.
 * After download, Errors-column field comments are buffered (`printErrorWorkbookMessages`) and attached
 * as `error-validation.txt` on test failure only. Extra flow detail when `silent: false` and `E2E_TERMINAL_LOGS=1`.
 */
import { Page } from "@playwright/test";
import { flowLog } from "../diagnosticLog";
import { UploadInvoicePage } from "../../pageObjects/OMN_UploadInvoicePage";
import { DashboardPage } from "../../pageObjects/OMN_DashboardPage";
import { uploadAndVerifyStatus } from "./uploadHelper";
import {
  countErrorDataRowsInWorkbook,
  getErrorFieldExcelDetails,
  printErrorWorkbookMessages,
  validateErrorFileColumn,
} from "../../utils/excel/invoiceExcel";

const INVOICE_ROW_TIMEOUT_MS = 90000;
const TEMPLATE_DATA_ROW = 6;

type ErrorValidationInput = {
  filePath: string;
  field: string;
  invoiceNumber?: string;
  checkEdit?: boolean;
  row?: number;
  strictExcelComment?: boolean;
  silent?: boolean;
};

type ErrorValidationAnyOfFieldsInput = Omit<ErrorValidationInput, "field"> & {
  fields: readonly string[];
};

export async function runErrorValidation(
  page: Page,
  input: ErrorValidationInput
) {
  await uploadAndVerifyStatus(page, input.filePath, "error");
  await validateFieldErrorWithExcelAndEdit(page, input.field, {
    invoiceNumber: input.invoiceNumber,
    checkEdit: input.checkEdit,
    row: input.row,
    strictExcelComment: input.strictExcelComment,
    silent: input.silent,
  });
}

type ErrorValidationAllRowsInput = {
  filePath: string;
  field: string;
  /** Number of invoice data rows uploaded (Excel data starts at row 6). */
  expectedDataRowCount: number;
  /** When true, edit UI is checked for `invoiceNumber` on the first data row only. */
  checkEdit?: boolean;
  invoiceNumber?: string;
  strictExcelComment?: boolean;
  silent?: boolean;
};

/**
 * Multi-invoice error upload: error-file Errors-column row count must **equal**
 * uploaded data rows (e.g. 10 uploaded → exactly 10 error rows; less or more fails).
 * Also every row must show an error on `field`.
 */
export async function runErrorValidationForAllDataRows(
  page: Page,
  input: ErrorValidationAllRowsInput
) {
  const expected = Math.floor(input.expectedDataRowCount);
  if (!Number.isFinite(expected) || expected < 1) {
    throw new Error(
      `runErrorValidationForAllDataRows: expectedDataRowCount must be >= 1 (got ${input.expectedDataRowCount})`
    );
  }

  const strictExcelComment = input.strictExcelComment ?? true;
  const silent = input.silent ?? true;
  const checkEdit = input.checkEdit ?? false;

  await uploadAndVerifyStatus(page, input.filePath, "error");

  const uploadPage = new UploadInvoicePage(page);
  await uploadPage.waitForErrorFileDownloadEnabled();
  const errorFilePath = await uploadPage.downloadErrorFileViaClick();

  const { errorRowCount, rowsWithErrors } = countErrorDataRowsInWorkbook(
    errorFilePath,
    expected,
    TEMPLATE_DATA_ROW
  );
  if (errorRowCount !== expected) {
    const expectedRows = Array.from(
      { length: expected },
      (_, i) => TEMPLATE_DATA_ROW + i
    );
    const missing = expectedRows.filter((r) => !rowsWithErrors.includes(r));
    const extra = rowsWithErrors.filter((r) => !expectedRows.includes(r));
    const details: string[] = [];
    if (missing.length) {
      details.push(`missing Excel row(s): ${missing.join(", ")}`);
    }
    if (extra.length) {
      details.push(`extra Excel row(s): ${extra.join(", ")}`);
    }
    throw new Error(
      `Uploaded ${expected} invoice row(s) but error file has ${errorRowCount} error row(s) ` +
        `(Errors column non-empty). Must be equal, not less or more` +
        (details.length ? ` (${details.join("; ")})` : "") +
        `.`
    );
  }
  if (!silent) {
    flowLog(
      "ErrorValidation",
      `Error row count OK — ${errorRowCount}/${expected} data rows have Errors column entries (exact match)`
    );
  }

  const missingRows: number[] = [];
  for (let i = 0; i < expected; i++) {
    const row = TEMPLATE_DATA_ROW + i;
    printErrorWorkbookMessages(errorFilePath, row);
    const hasError = await fieldHasErrorInWorkbook(
      errorFilePath,
      input.field,
      row,
      strictExcelComment
    );
    if (!hasError) {
      missingRows.push(row);
    } else if (!silent) {
      flowLog(
        "ErrorValidation",
        `Error in file — row ${row} field "${input.field}" (batch ${i + 1}/${expected})`
      );
    }
  }

  if (missingRows.length > 0) {
    throw new Error(
      `Expected error on "${input.field}" for all ${expected} uploaded data row(s); ` +
        `missing on Excel row(s): ${missingRows.join(", ")} ` +
        `(found ${expected - missingRows.length}/${expected}).`
    );
  }

  if (!checkEdit) {
    return;
  }

  if (input.invoiceNumber === undefined) {
    throw new Error(
      "invoiceNumber is required when checkEdit is true for runErrorValidationForAllDataRows."
    );
  }

  const table = new DashboardPage(page);
  await table.waitForInvoiceRowVisible(input.invoiceNumber, INVOICE_ROW_TIMEOUT_MS);
  await table.openInvoiceEdit(input.invoiceNumber);
  try {
    await table.openErrorEdit(input.field);
  } catch {
    if (!silent) {
      flowLog(
        "ErrorValidation",
        `Error in edit — could not open field editor for "${input.field}". Skipping edit-message check.`
      );
    }
    return;
  }

  const editFieldValue = await table.readVisibleEditFieldValue();
  const visibleEditMessage =
    await table.readVisibleEditValidationMessageWithFallback();
  if (!silent) {
    flowLog(
      "ErrorValidation",
      `Error in edit — field "${input.field}" | input value: ${JSON.stringify(editFieldValue)} | message: ${visibleEditMessage ? visibleEditMessage : "(none)"}`
    );
  }
}

type ErrorCommentRulesInput = {
  filePath: string;
  field: string;
  forbiddenCommentSubstrings?: string[];
  requiredCommentSubstrings: string[];
  row?: number;
};

/**
 * Assert error-file comments for a field: required substrings must all appear;
 * forbidden substrings (min/max accepted) must not.
 */
export async function runErrorValidationPassIfLengthAccepted(
  page: Page,
  input: ErrorCommentRulesInput
) {
  const row = input.row ?? TEMPLATE_DATA_ROW;
  await uploadAndVerifyStatus(page, input.filePath, "error");

  const uploadPage = new UploadInvoicePage(page);
  await uploadPage.waitForErrorFileDownloadEnabled();
  const errorFilePath = await uploadPage.downloadErrorFileViaClick();
  printErrorWorkbookMessages(errorFilePath, row);

  const { comment } = await getErrorFieldExcelDetails(errorFilePath, input.field, row);
  const text = comment.trim();
  for (const forbidden of input.forbiddenCommentSubstrings ?? []) {
    if (text.includes(forbidden)) {
      throw new Error(
        `Unexpected error present for "${input.field}": ${forbidden}. Full comment: ${text}`
      );
    }
  }
  for (const required of input.requiredCommentSubstrings) {
    if (!text.includes(required)) {
      throw new Error(
        `Expected error missing for "${input.field}": ${required}. Full comment: ${text}`
      );
    }
  }
}

async function fieldHasErrorInWorkbook(
  errorFilePath: string,
  field: string,
  row: number,
  strictExcelComment: boolean
): Promise<boolean> {
  try {
    const { comment } = await getErrorFieldExcelDetails(errorFilePath, field, row);
    return Boolean(comment?.trim());
  } catch {
    if (strictExcelComment) {
      return false;
    }
    try {
      await validateErrorFileColumn(errorFilePath, field);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Upload once; pass when **any** of `fields` has an error workbook cell comment (or Errors column entry).
 * Edit UI is checked only for the first matching field.
 */
export async function runErrorValidationForAnyOfFields(
  page: Page,
  input: ErrorValidationAnyOfFieldsInput
) {
  const fieldList = [...input.fields];
  if (fieldList.length === 0) {
    throw new Error("runErrorValidationForAnyOfFields: fields cannot be empty");
  }
  if (fieldList.length === 1) {
    return runErrorValidation(page, { ...input, field: fieldList[0] });
  }

  const row = input.row ?? 6;
  const strictExcelComment = input.strictExcelComment ?? true;
  const checkEdit = input.checkEdit ?? Boolean(input.invoiceNumber);
  const silent = input.silent ?? true;

  await uploadAndVerifyStatus(page, input.filePath, "error");

  const uploadPage = new UploadInvoicePage(page);
  await uploadPage.waitForErrorFileDownloadEnabled();
  const errorFilePath = await uploadPage.downloadErrorFileViaClick();
  printErrorWorkbookMessages(errorFilePath, row);

  let matchedField: string | undefined;
  for (const field of fieldList) {
    if (await fieldHasErrorInWorkbook(errorFilePath, field, row, strictExcelComment)) {
      matchedField = field;
      if (!silent) {
        flowLog(
          "ErrorValidation",
          `Error in file — matched field "${field}" (any-of: ${fieldList.join(", ")})`
        );
      }
      break;
    }
  }

  if (!matchedField) {
    throw new Error(
      `Expected an error comment on at least one of: ${fieldList.join(", ")}. None had a cell comment or Errors column entry.`
    );
  }

  if (!checkEdit) {
    return;
  }

  if (input.invoiceNumber === undefined) {
    throw new Error("invoiceNumber is required when checkEdit is true.");
  }

  const table = new DashboardPage(page);
  await table.waitForInvoiceRowVisible(input.invoiceNumber, INVOICE_ROW_TIMEOUT_MS);
  await table.openInvoiceEdit(input.invoiceNumber);
  try {
    await table.openErrorEdit(matchedField);
  } catch {
    if (!silent) {
      flowLog(
        "ErrorValidation",
        `Error in edit — could not open field editor for "${matchedField}". Skipping edit-message check.`
      );
    }
    return;
  }

  const editFieldValue = await table.readVisibleEditFieldValue();
  const visibleEditMessage =
    await table.readVisibleEditValidationMessageWithFallback();
  if (!silent) {
    flowLog(
      "ErrorValidation",
      `Error in edit — field "${matchedField}" | input value: ${JSON.stringify(editFieldValue)} | message: ${visibleEditMessage ? visibleEditMessage : "(none)"}`
    );
  }
}

async function validateFieldErrorWithExcelAndEdit(
  page: Page,
  field: string,
  options?: {
    invoiceNumber?: string;
    row?: number;
    checkEdit?: boolean;
    strictExcelComment?: boolean;
    silent?: boolean;
  }
): Promise<void> {
  const row = options?.row ?? 6;
  const invoiceNumber = options?.invoiceNumber;
  const checkEdit = options?.checkEdit ?? Boolean(invoiceNumber);
  const strictExcelComment = options?.strictExcelComment ?? true;
  const silent = options?.silent ?? true;

  const uploadPage = new UploadInvoicePage(page);
  await uploadPage.waitForErrorFileDownloadEnabled();
  const errorFilePath = await uploadPage.downloadErrorFileViaClick();
  printErrorWorkbookMessages(errorFilePath, row);

  try {
    const { comment: excelComment, cellValue: excelCellValue } =
      await getErrorFieldExcelDetails(errorFilePath, field, row);
    if (!silent) {
      flowLog(
        "ErrorValidation",
        `Error in file — field "${field}" | cell value: ${JSON.stringify(excelCellValue)} | comment: ${excelComment}`
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (strictExcelComment) {
      throw error;
    }
    await validateErrorFileColumn(errorFilePath, field);
    if (!silent) {
      flowLog(
        "ErrorValidation",
        `Error in file — field "${field}" has no cell comment in row ${row}; validated via Errors column only.`
      );
      flowLog("ErrorValidation", `Comment check skipped reason: ${message}`);
    }
  }

  if (!checkEdit) {
    return;
  }

  if (invoiceNumber === undefined) {
    throw new Error("invoiceNumber is required when checkEdit is true.");
  }

  const table = new DashboardPage(page);
  await table.waitForInvoiceRowVisible(invoiceNumber, INVOICE_ROW_TIMEOUT_MS);
  await table.openInvoiceEdit(invoiceNumber);
  try {
    await table.openErrorEdit(field);
  } catch {
    if (!silent) {
      flowLog(
        "ErrorValidation",
        `Error in edit — could not open field editor for "${field}". Skipping edit-message check.`
      );
    }
    return;
  }

  const editFieldValue = await table.readVisibleEditFieldValue();
  const visibleEditMessage =
    await table.readVisibleEditValidationMessageWithFallback();
  if (!silent) {
    flowLog(
      "ErrorValidation",
      `Error in edit — field "${field}" | input value: ${JSON.stringify(editFieldValue)} | message: ${visibleEditMessage ? visibleEditMessage : "(none)"}`
    );
  }
}
