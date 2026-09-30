import { test } from "../../Src/baseTest";
import { invoiceData } from "../../testData/FieldValidations/SubmitInvoice";
import { shouldSkipSubmitSelfBilledCase } from "../../testData/FieldValidations/SubmitInvoiceMultiItem";
import {
  omnUiSubmitTransactionTypeSelections,
  runOmnUiSubmitInvoiceMultiItemCase,
  OMN_UI_SUBMIT_INVOICE_TEST_TIMEOUT_MS,
} from "../../Helpers/ui/omnUiSubmitInvoiceHelper";

test.describe("Create Invoice via UI with one line", () => {
  test.describe.configure({ mode: "parallel", retries: 0 });

  for (const row of invoiceData) {
    if (shouldSkipSubmitSelfBilledCase(row["Invoice Type Code"] ?? "")) {
      continue;
    }
    const invoiceType = row["Invoice Type Code"] ?? "";
    const transactionType = row["Invoice Transaction Type Code"] ?? "";
    const currency = row["Invoice Currency Code"] ?? "OMR";
    const taxRate = String(row["Tax Rate"] ?? "").trim();
    const taxLabel = taxRate ? `${row["Tax Category"]} ${taxRate}%` : row["Tax Category"];
    for (const transactionTypes of omnUiSubmitTransactionTypeSelections(transactionType)) {
      const transactionLabel = transactionTypes.join(" and ");
      test(
        `Given invoice type ${invoiceType} and transaction type ${transactionLabel} with ${taxLabel} (${currency}, 1 line) — When the invoice is created on the form and submitted — Then the invoice should be delivered.`,
        async ({ page }) => {
          test.setTimeout(OMN_UI_SUBMIT_INVOICE_TEST_TIMEOUT_MS);
          await runOmnUiSubmitInvoiceMultiItemCase(page, [row], { transactionTypes });
        }
      );
    }
  }
});
