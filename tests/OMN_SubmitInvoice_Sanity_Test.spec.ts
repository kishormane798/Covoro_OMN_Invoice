import { expect } from "@playwright/test";
import { test } from "../Src/baseTest";
import { invoiceData } from "../testData/FieldValidations/SubmitInvoice";
import { multiItemInvoiceCases } from "../testData/FieldValidations/SubmitInvoiceMultiItem";
import {
  BULK_SUBMIT_INVOICE_TEST_TIMEOUT_MS,
  runBulkSubmitInvoiceCase,
  runSubmitInvoiceCase,
  runSubmitInvoiceMultiItemCase,
} from "../Helpers/submitInvoiceCaseHelper";

const SUBMIT_SANITY_TIMEOUT_MS = 6 * 60 * 1000;

function firstSingleRow(): Record<string, string> {
  const row = invoiceData[0];
  if (!row) {
    throw new Error("Submit sanity: invoiceData[0] is missing");
  }
  return row;
}

function firstMultiRows(): Array<Record<string, string>> {
  const tc = multiItemInvoiceCases[0];
  if (!tc?.rows?.length) {
    throw new Error("Submit sanity: multiItemInvoiceCases[0] is missing");
  }
  return tc.rows;
}

test.describe("Excel upload — submit sanity (post-deploy)", () => {
  test.describe.configure({ mode: "parallel" });

  test("Verify invoice delivered successfully for Covoro Submit Sanity – OMR single-item.", async ({
    page,
  }) => {
    test.setTimeout(SUBMIT_SANITY_TIMEOUT_MS);
    await runSubmitInvoiceCase(page, firstSingleRow());
  });

  test("Verify invoice delivered successfully for Covoro Submit Sanity – OMR multi-item.", async ({
    page,
  }) => {
    test.setTimeout(SUBMIT_SANITY_TIMEOUT_MS);
    await runSubmitInvoiceMultiItemCase(page, firstMultiRows());
  });
});

test.describe("Bulk submit — sanity (post-deploy)", () => {
  test.describe.configure({ mode: "parallel" });

  test("Verify bulk submit delivers 5 invoices (Submit).", async ({ page }) => {
    test.setTimeout(BULK_SUBMIT_INVOICE_TEST_TIMEOUT_MS);
    await runBulkSubmitInvoiceCase(page, firstSingleRow(), { invoiceCount: 5 });
  });

  test("Verify bulk submit delivers 5 invoices (Submit as PDF).", async ({ page }) => {
    test.setTimeout(BULK_SUBMIT_INVOICE_TEST_TIMEOUT_MS);
    await runBulkSubmitInvoiceCase(page, firstSingleRow(), {
      invoiceCount: 5,
      bulkAction: "Submit as PDF",
    });
  });
});

test("Post-deploy sanity fixtures are present", () => {
  expect(invoiceData.length).toBeGreaterThan(0);
  expect(multiItemInvoiceCases.length).toBeGreaterThan(0);
  expect(multiItemInvoiceCases[0]?.rows.length).toBe(4);
});
