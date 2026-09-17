import { test } from "../Src/baseTest";
import { invoiceData } from "../testData/FieldValidations/SubmitInvoice";
import { runSubmitInvoiceCase } from "../Helpers/excel/submitInvoiceCaseHelper";
import { SUBMIT_INVOICE_TEST_TIMEOUT_MS } from "../Helpers/excel/submitInvoiceSpecSupport";
import {
  applySimplifiedTemplateEnv,
  clearSimplifiedTemplateEnv,
} from "../Helpers/excel/simplifiedTemplateContext";
import { filterSubmitInvoiceRowsByTemplateHeaders } from "../utils/excel/invoiceExcel";
import { SIMPLIFIED_TEMPLATE_HEADER_LABELS } from "../testData/invoiceTemplateHeaders/invoiceColumnMapping";

const TEMPLATE = "Simplified";

const invoiceDataOnSimplified = filterSubmitInvoiceRowsByTemplateHeaders(
  invoiceData,
  SIMPLIFIED_TEMPLATE_HEADER_LABELS
);

test.describe(`Submit invoice (${TEMPLATE})`, () => {
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

  for (const data of invoiceDataOnSimplified) {
    const row = data;
    const taxRate = String(row["Tax Rate"] ?? "").trim();
    const taxLabel = taxRate
      ? `${row["Tax Category"]} ${taxRate}%`
      : row["Tax Category"];
    test(
      `Given ${row["Invoice Type Code"]} with ${row["Invoice Transaction Type Code"]} and ${taxLabel} (OMR) — When the invoice is uploaded — Then the invoice should be delivered.`,
      async ({ page }) => {
        test.setTimeout(SUBMIT_INVOICE_TEST_TIMEOUT_MS);
        await runSubmitInvoiceCase(page, row);
      }
    );
  }
});
