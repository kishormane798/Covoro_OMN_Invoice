import { test } from "../Src/baseTest";
import { multiItemInvoiceCasesNonOmr } from "../testData/FieldValidations/SubmitInvoiceMultiItem";
import { runSubmitInvoiceMultiItemCase } from "../Helpers/excel/submitInvoiceCaseHelper";
import {
  SUBMIT_INVOICE_TEMPLATE as TEMPLATE,
  SUBMIT_MULTI_ITEM_TEST_TIMEOUT_MS as SUBMIT_INVOICE_TEST_TIMEOUT_MS,
} from "../Helpers/excel/submitInvoiceSpecSupport";

test.describe(`Submit invoice multi-item non-OMR (${TEMPLATE})`, () => {
  test.describe.configure({ mode: "parallel" });

  for (const tc of multiItemInvoiceCasesNonOmr) {
    const first = tc.rows[0] ?? {};
    const currency = first["Invoice Currency Code"] ?? "";
    test(
      `Given invoice type ${first["Invoice Type Code"] ?? ""} and transaction type ${first["Invoice Transaction Type Code"] ?? ""} (${currency}, 4 lines) — When the invoice is uploaded — Then the invoice should be delivered.`,
      async ({ page }) => {
        test.setTimeout(SUBMIT_INVOICE_TEST_TIMEOUT_MS);
        await runSubmitInvoiceMultiItemCase(page, tc.rows);
      }
    );
  }
});
