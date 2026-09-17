import { test } from "../Src/baseTest";
import * as FV from "../testData/FieldValidations";
import { multiItemInvoiceCases } from "../testData/FieldValidations/SubmitInvoiceMultiItem";
import { runSubmitInvoiceMultiItemCase } from "../Helpers/excel/submitInvoiceCaseHelper";
import {
  SUBMIT_INVOICE_TEMPLATE as TEMPLATE,
  SUBMIT_MULTI_ITEM_TEST_TIMEOUT_MS as SUBMIT_INVOICE_TEST_TIMEOUT_MS,
} from "../Helpers/excel/submitInvoiceSpecSupport";

test.describe(`Submit invoice multi-item (${TEMPLATE})`, () => {
  test.describe.configure({ mode: "parallel" });

  for (const tc of multiItemInvoiceCases) {
    const invoiceTypeCode = tc.rows[0]?.["Invoice Type Code"] ?? "";
    // Do not run Self-billed invoice / Self billed credit note.
    if (
      (FV.SELF_BILLED_DOCUMENT_INVOICE_TYPES as readonly string[]).includes(
        invoiceTypeCode
      )
    ) {
      continue;
    }
    const first = tc.rows[0] ?? {};
    test(
      `Given ${first["Invoice Type Code"] ?? ""} with ${first["Invoice Transaction Type Code"] ?? ""} (OMR, 4 lines) — When the invoice is uploaded — Then the invoice should be delivered.`,
      async ({ page }) => {
        test.setTimeout(SUBMIT_INVOICE_TEST_TIMEOUT_MS);
        await runSubmitInvoiceMultiItemCase(page, tc.rows);
      }
    );
  }
});
