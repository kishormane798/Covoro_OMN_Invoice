import { test } from "../Src/baseTest";
import { invoiceData } from "../testData/FieldValidations/SubmitInvoice";
import { shouldSkipSubmitSelfBilledCase } from "../testData/FieldValidations/SubmitInvoiceMultiItem";
import { runSubmitInvoiceCase } from "../Helpers/excel/submitInvoiceCaseHelper";
import {
  SUBMIT_INVOICE_TEMPLATE as TEMPLATE,
  SUBMIT_INVOICE_TEST_TIMEOUT_MS,
} from "../Helpers/excel/submitInvoiceSpecSupport";

test.describe(`Submit invoice (${TEMPLATE})`, () => {
  test.describe.configure({ mode: "parallel" });

  for (const data of invoiceData) {
    const row = data;
    if (shouldSkipSubmitSelfBilledCase(row["Invoice Type Code"] ?? "")) {
      continue;
    }
    const taxRate = String(row["Tax Rate"] ?? "").trim();
    const taxLabel = taxRate
      ? `${row["Tax Category"]} ${taxRate}%`
      : row["Tax Category"];
    test(
      `Given invoice type ${row["Invoice Type Code"]} and transaction type ${row["Invoice Transaction Type Code"]} with ${taxLabel} (OMR) — When the invoice is uploaded — Then the invoice should be delivered.`,
      async ({ page }) => {
        test.setTimeout(SUBMIT_INVOICE_TEST_TIMEOUT_MS);
        await runSubmitInvoiceCase(page, row);
      }
    );
  }
});
