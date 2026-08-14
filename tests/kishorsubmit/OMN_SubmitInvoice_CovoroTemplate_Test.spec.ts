import { test } from "./Src/baseTest";
import * as FV from "./testData";
import { runSubmitInvoiceCase } from "./Helpers/submitInvoiceCaseHelper";

const TEMPLATE = "Covoro";
const SUBMIT_INVOICE_TEST_TIMEOUT_MS = 6 * 60 * 1000;

test.describe(`Excel upload — submit invoice (${TEMPLATE})`, () => {
  test.describe.configure({ mode: "parallel" });

  for (const data of FV.invoiceData) {
    const row = data as Record<string, string>;
    const taxRate = String(row["Tax Rate"] ?? "").trim();
    const taxLabel = taxRate ? `${row["Tax Category"]} ${taxRate}%` : row["Tax Category"];
    test(
      `Verify invoice delivered successfully for ${TEMPLATE} Template Excel upload for submitted with this combination (${row["Invoice Type Code"]} | ${row["Invoice Transaction Type Code"]} | ${row["Invoice Currency Code"]} | ${taxLabel}).`,
      async ({ page }) => {
        test.setTimeout(SUBMIT_INVOICE_TEST_TIMEOUT_MS);
        await runSubmitInvoiceCase(page, row);
      }
    );
  }

  for (const data of FV.invoiceData) {
    const usdData: Record<string, string> = {
      ...(data as Record<string, string>),
      "Invoice Currency Code": "USD",
      "Currency Exchange Rate": "3.67",
    };
    const taxRate = String(usdData["Tax Rate"] ?? "").trim();
    const taxLabel = taxRate ? `${usdData["Tax Category"]} ${taxRate}%` : usdData["Tax Category"];
    test(
      `Verify invoice delivered successfully for ${TEMPLATE} Template Excel upload for submitted with this combination (${usdData["Invoice Type Code"]} | ${usdData["Invoice Transaction Type Code"]} | ${usdData["Invoice Currency Code"]} | ${taxLabel}).`,
      async ({ page }) => {
        test.setTimeout(6 * 60 * 1000);
        await runSubmitInvoiceCase(page, usdData);
      }
    );
  }
});
