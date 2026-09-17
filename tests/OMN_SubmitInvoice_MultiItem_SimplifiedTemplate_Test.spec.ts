import { test } from "../Src/baseTest";
import * as FV from "../testData/FieldValidations";
import { multiItemInvoiceCases } from "../testData/FieldValidations/SubmitInvoiceMultiItem";
import { runSubmitInvoiceMultiItemCase } from "../Helpers/excel/submitInvoiceCaseHelper";
import { SUBMIT_MULTI_ITEM_TEST_TIMEOUT_MS as SUBMIT_INVOICE_TEST_TIMEOUT_MS } from "../Helpers/excel/submitInvoiceSpecSupport";
import {
  applySimplifiedTemplateEnv,
  clearSimplifiedTemplateEnv,
} from "../Helpers/excel/simplifiedTemplateContext";
import { filterSubmitInvoiceRowsByTemplateHeaders } from "../utils/excel/invoiceExcel";
import { SIMPLIFIED_TEMPLATE_HEADER_LABELS } from "../testData/invoiceTemplateHeaders/invoiceColumnMapping";

const TEMPLATE = "Simplified";

const multiItemInvoiceCasesOnSimplified = multiItemInvoiceCases.map((tc) => ({
  ...tc,
  rows: filterSubmitInvoiceRowsByTemplateHeaders(
    tc.rows,
    SIMPLIFIED_TEMPLATE_HEADER_LABELS
  ),
}));

test.describe(`Submit invoice multi-item (${TEMPLATE})`, () => {
  test.describe.configure({ mode: "parallel" });

  test.beforeAll(() => {
    applySimplifiedTemplateEnv();
  });

  test.beforeEach(() => {
    applySimplifiedTemplateEnv();
  });

  test.afterAll(() => {
    clearSimplifiedTemplateEnv();
  });

  for (const tc of multiItemInvoiceCasesOnSimplified) {
    const first = tc.rows[0] ?? {};
    // Do not run Self-billed invoice / Self billed credit note.
    if (
      (FV.SELF_BILLED_DOCUMENT_INVOICE_TYPES as readonly string[]).includes(
        first["Invoice Type Code"] ?? ""
      )
    ) {
      continue;
    }
    test(
      `Given ${first["Invoice Type Code"] ?? ""} with ${first["Invoice Transaction Type Code"] ?? ""} (OMR, 4 lines) — When the invoice is uploaded — Then the invoice should be delivered.`,
      async ({ page }) => {
        test.setTimeout(SUBMIT_INVOICE_TEST_TIMEOUT_MS);
        await runSubmitInvoiceMultiItemCase(page, tc.rows);
      }
    );
  }
});
