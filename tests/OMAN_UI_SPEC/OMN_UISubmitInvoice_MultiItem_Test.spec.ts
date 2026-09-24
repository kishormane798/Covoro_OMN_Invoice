import { test } from "../../Src/baseTest";
import * as FV from "../../testData/FieldValidations";
import { multiItemInvoiceCases } from "../../testData/FieldValidations/SubmitInvoiceMultiItem";
import {
  omnUiSubmitTransactionTypeSelections,
  runOmnUiSubmitInvoiceMultiItemCase,
  OMN_UI_SUBMIT_INVOICE_MULTI_TEST_TIMEOUT_MS,
} from "../../Helpers/ui/omnUiSubmitInvoiceHelper";

test.describe("Create Invoice via UI with multi-item", () => {
  test.describe.configure({ mode: "parallel" });

  for (const tc of multiItemInvoiceCases) {
    const invoiceTypeCode = tc.rows[0]?.["Invoice Type Code"] ?? "";
    if (
      (FV.SELF_BILLED_DOCUMENT_INVOICE_TYPES as readonly string[]).includes(
        invoiceTypeCode
      )
    ) {
      continue;
    }
    const first = tc.rows[0] ?? {};
    const invoiceType = first["Invoice Type Code"] ?? "";
    const transactionType = first["Invoice Transaction Type Code"] ?? "";
    const currency = first["Invoice Currency Code"] ?? "OMR";
    for (const transactionTypes of omnUiSubmitTransactionTypeSelections(transactionType)) {
      const transactionLabel = transactionTypes.join(" and ");
      test(
        `Given invoice type ${invoiceType} and transaction type ${transactionLabel} (${currency}, ${tc.rows.length} lines) — When the invoice is created on the form and submitted — Then the invoice should be delivered.`,
        async ({ page }) => {
          test.setTimeout(OMN_UI_SUBMIT_INVOICE_MULTI_TEST_TIMEOUT_MS);
          await runOmnUiSubmitInvoiceMultiItemCase(page, tc.rows, { transactionTypes });
        }
      );
    }
  }
});
