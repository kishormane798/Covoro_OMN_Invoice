import { expect } from "@playwright/test";
import { test } from "./Src/baseTest";
import { invoiceData } from "./testData/SubmitInvoice";
import { multiItemInvoiceCases } from "./testData/SubmitInvoiceMultiItem";
import {
  BULK_SUBMIT_INVOICE_TEST_TIMEOUT_MS,
  runBulkSubmitInvoiceCase,
  runSubmitInvoiceCase,
  runSubmitInvoiceMultiItemCase,
} from "./Helpers/submitInvoiceCaseHelper";

/** Same wall-clock budget as Covoro submit specs (upload + Options Submit + delivery). */
const SUBMIT_SANITY_TIMEOUT_MS = 6 * 60 * 1000;

/**
 * Post-deploy sanity (single spec; auth via storageState.json / globalSetup):
 * Excel AED/USD/multi | Bulk submit
 *
 * UI submit / edit / attachment / download cases removed — UI helpers disabled under Helpers/ui.
 * Run with `npm run test:sanity` (5 workers).
 */
/** One Commercial Invoice row — keep sanity lean (not one-per-type). */
const AED_ONE_PER_TYPE_INDICES: readonly number[] = [0];
const MULTI_ONE_PER_TYPE_INDICES: readonly number[] = [0];

function taxLabelFor(row: Record<string, string>): string {
  const taxRate = String(row["Tax Rate"] ?? "").trim();
  return taxRate ? `${row["Tax Category"]} ${taxRate}%` : String(row["Tax Category"] ?? "");
}

function comboLabel(row: Record<string, string>): string {
  return (
    `${row["Invoice Type Code"]} | ${row["Invoice Transaction Type Code"]} | ` +
    `${row["Invoice Currency Code"]} | ${taxLabelFor(row)}`
  );
}

function rowAt(index: number): Record<string, string> {
  const row = invoiceData[index];
  if (!row) {
    throw new Error(`Submit sanity: invoiceData[${index}] is missing`);
  }
  return row as Record<string, string>;
}

function multiRowsAt(index: number): Array<Record<string, string>> {
  const tc = multiItemInvoiceCases[index];
  if (!tc?.rows?.length) {
    throw new Error(`Submit sanity: multiItemInvoiceCases[${index}] is missing`);
  }
  return tc.rows as Array<Record<string, string>>;
}

test.describe("Excel upload — submit sanity (post-deploy)", () => {
  test.describe.configure({ mode: "parallel" });

  test.describe("AED — single Commercial Invoice", () => {
    for (const index of AED_ONE_PER_TYPE_INDICES) {
      const row = rowAt(index);
      test(
        `Verify invoice delivered successfully for Covoro Submit Sanity – AED (${comboLabel(row)}).`,
        async ({ page }) => {
          test.setTimeout(SUBMIT_SANITY_TIMEOUT_MS);
          await runSubmitInvoiceCase(page, row);
        }
      );
    }
  });

  test.describe("Other than AED — single Commercial Invoice (USD)", () => {
    for (const index of AED_ONE_PER_TYPE_INDICES) {
      const base = rowAt(index);
      const usdRow: Record<string, string> = {
        ...base,
        "Invoice Currency Code": "USD",
        "Currency Exchange Rate": "3.67",
      };
      test(
        `Verify invoice delivered successfully for Covoro Submit Sanity – USD (${comboLabel(usdRow)}).`,
        async ({ page }) => {
          test.setTimeout(SUBMIT_SANITY_TIMEOUT_MS);
          await runSubmitInvoiceCase(page, usdRow);
        }
      );
    }
  });

  test.describe("Multi-item — single Commercial Invoice", () => {
    for (const index of MULTI_ONE_PER_TYPE_INDICES) {
      const rows = multiRowsAt(index);
      const first = rows[0]!;
      test(
        `Verify invoice delivered successfully for Covoro Submit Sanity – multi-item (${comboLabel(first)} | ${rows.length} lines).`,
        async ({ page }) => {
          test.setTimeout(SUBMIT_SANITY_TIMEOUT_MS);
          await runSubmitInvoiceMultiItemCase(page, rows);
        }
      );
    }
  });
});

test.describe("Bulk submit — sanity (post-deploy)", () => {
  test.describe.configure({ mode: "parallel" });

  test("Verify bulk submit delivers 5 invoices (Submit).", async ({ page }) => {
    test.setTimeout(BULK_SUBMIT_INVOICE_TEST_TIMEOUT_MS);
    await runBulkSubmitInvoiceCase(page, rowAt(0), { invoiceCount: 5 });
  });

  test("Verify bulk submit delivers 5 invoices (Submit as PDF).", async ({ page }) => {
    test.setTimeout(BULK_SUBMIT_INVOICE_TEST_TIMEOUT_MS);
    await runBulkSubmitInvoiceCase(page, rowAt(0), {
      invoiceCount: 5,
      bulkAction: "Submit as PDF",
    });
  });
});

test("Post-deploy sanity fixtures are present", () => {
  expect(AED_ONE_PER_TYPE_INDICES).toEqual([0]);
  expect(MULTI_ONE_PER_TYPE_INDICES).toEqual([0]);
  expect(invoiceData.length).toBeGreaterThan(0);
  expect(multiItemInvoiceCases.length).toBeGreaterThan(0);
});
