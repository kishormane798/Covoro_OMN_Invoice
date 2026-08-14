import { test } from "./Src/baseTest";
import * as FV from "./testData";
import { runSubmitInvoiceMultiItemCase } from "./Helpers/submitInvoiceCaseHelper";

const TEMPLATE = "Covoro";
const SUBMIT_INVOICE_TEST_TIMEOUT_MS = 8 * 60 * 1000;

test.describe(`Excel upload — submit invoice (multi-item) (${TEMPLATE})`, () => {
  test.describe.configure({ mode: "parallel" });

  for (const tc of FV.multiItemInvoiceCases) {
    const first = tc.rows[0] ?? {};
    test(
      `Verify invoice delivered successfully for ${TEMPLATE} Template Excel upload for multi-item submitted with this combination (${first["Invoice Type Code"] ?? ""} | ${first["Invoice Transaction Type Code"] ?? ""} | ${first["Invoice Currency Code"] ?? ""} | ${tc.rows.length} items).`,
      async ({ page }) => {
        test.setTimeout(SUBMIT_INVOICE_TEST_TIMEOUT_MS);
        await runSubmitInvoiceMultiItemCase(page, tc.rows);
      }
    );
  }
});

