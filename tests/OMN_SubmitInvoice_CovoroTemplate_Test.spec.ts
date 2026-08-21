import { expect } from "@playwright/test";
import { test } from "../Src/baseTest";
import * as FV from "../testData/FieldValidations";
import { invoiceData } from "../testData/FieldValidations/SubmitInvoice";
import { runSubmitInvoiceCase } from "../Helpers/submitInvoiceCaseHelper";

const TEMPLATE = "Covoro";
const SUBMIT_INVOICE_TEST_TIMEOUT_MS = 6 * 60 * 1000;
const EXPECTED_CASE_COUNT =
  FV.OMAN_INVOICE_TYPES.length * FV.OMAN_TXN_TYPES.length * 4;

test.describe(`Excel upload — submit invoice (${TEMPLATE})`, () => {
  test.describe.configure({ mode: "parallel" });

  test("Oman submit matrix shape: 32 types × 15 txns × 4 tax categories × Goods", () => {
    expect(invoiceData.length).toBe(EXPECTED_CASE_COUNT);
    expect(EXPECTED_CASE_COUNT).toBe(1920);
    for (const row of invoiceData) {
      expect(row["Item Type"]).toBe(FV.ITEM_TYPE_GOODS);
      expect(row["Invoice Currency Code"]).toBe(FV.OMAN_CURRENCY_OMR);
      expect(row["Currency Exchange Rate"] ?? "").toBe("");
      expect(row["Invoice Type Code"]).toBeTruthy();
      expect(row["Invoice Transaction Type Code"]).toBeTruthy();
      expect(row["Tax Category"]).toBeTruthy();
    }
  });

  for (const data of invoiceData) {
    const row = data;
    const taxRate = String(row["Tax Rate"] ?? "").trim();
    const taxLabel = taxRate
      ? `${row["Tax Category"]} ${taxRate}%`
      : row["Tax Category"];
    test(
      `Excel upload · ${TEMPLATE} | Submit | ${row["Invoice Type Code"]} | ${row["Invoice Transaction Type Code"]} | OMR | Goods | ${taxLabel} → delivered`,
      async ({ page }) => {
        test.setTimeout(SUBMIT_INVOICE_TEST_TIMEOUT_MS);
        await runSubmitInvoiceCase(page, row);
      }
    );
  }
});
