import { expect } from "@playwright/test";
import { test } from "../Src/baseTest";
import { invoiceData } from "../testData/FieldValidations/SubmitInvoice";
import { multiItemInvoiceCases } from "../testData/FieldValidations/SubmitInvoiceMultiItem";
import {
  BULK_SUBMIT_INVOICE_TEST_TIMEOUT_MS,
  runBulkSubmitInvoiceCase,
  runSubmitInvoiceCase,
  runSubmitInvoiceMultiItemCase,
} from "../Helpers/excel/submitInvoiceCaseHelper";

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

test.describe("Submit sanity (post-deploy)", () => {
  test.describe.configure({ mode: "parallel" });

  test("Given a valid OMR invoice — When uploaded — Then the invoice should be delivered.", async ({
    page,
  }) => {
    test.setTimeout(SUBMIT_SANITY_TIMEOUT_MS);
    await runSubmitInvoiceCase(page, firstSingleRow());
  });

  test("Given a valid OMR invoice with 4 lines — When uploaded — Then the invoice should be delivered.", async ({
    page,
  }) => {
    test.setTimeout(SUBMIT_SANITY_TIMEOUT_MS);
    await runSubmitInvoiceMultiItemCase(page, firstMultiRows());
  });
});

test.describe("Bulk submit — sanity (post-deploy)", () => {
  test.describe.configure({ mode: "parallel" });

  test("Given 5 valid invoices — When bulk Submit is used — Then all invoices should be delivered.", async ({ page }) => {
    test.setTimeout(BULK_SUBMIT_INVOICE_TEST_TIMEOUT_MS);
    await runBulkSubmitInvoiceCase(page, firstSingleRow(), { invoiceCount: 5 });
  });

  test("Given 5 valid invoices — When bulk Submit as PDF is used — Then all invoices should be delivered.", async ({ page }) => {
    test.setTimeout(BULK_SUBMIT_INVOICE_TEST_TIMEOUT_MS);
    await runBulkSubmitInvoiceCase(page, firstSingleRow(), {
      invoiceCount: 5,
      bulkAction: "Submit as PDF",
    });
  });
});

test("Post-deploy submit fixtures should be present", () => {
  expect(invoiceData.length).toBeGreaterThan(0);
  expect(multiItemInvoiceCases.length).toBeGreaterThan(0);
  expect(multiItemInvoiceCases[0]?.rows.length).toBe(4);
});
