import { expect } from "@playwright/test";
import { test } from "../Src/baseTest";
import * as FV from "../testData/FieldValidations";
import { multiItemInvoiceCases } from "../testData/FieldValidations/SubmitInvoiceMultiItem";
import { runSubmitInvoiceMultiItemCase } from "../Helpers/submitInvoiceCaseHelper";

const TEMPLATE = "Covoro";
const SUBMIT_INVOICE_TEST_TIMEOUT_MS = 8 * 60 * 1000;
const EXPECTED_CASE_COUNT =
  FV.OMAN_INVOICE_TYPES.length * FV.OMAN_TXN_TYPES.length;

test.describe(`Excel upload — submit invoice (multi-item) (${TEMPLATE})`, () => {
  test.describe.configure({ mode: "parallel" });

  test("Oman submit matrix shape: 32 types × 15 txns × 4 lines (2 Goods + 2 Services)", () => {
    expect(multiItemInvoiceCases.length).toBe(EXPECTED_CASE_COUNT);
    expect(EXPECTED_CASE_COUNT).toBe(480);
    const first = multiItemInvoiceCases[0];
    expect(first?.rows).toHaveLength(4);
    expect(first?.rows.map((r) => r["Item Type"])).toEqual([
      FV.ITEM_TYPE_GOODS,
      FV.ITEM_TYPE_GOODS,
      FV.ITEM_TYPE_SERVICES,
      FV.ITEM_TYPE_SERVICES,
    ]);
    expect(first?.rows.map((r) => r["Tax Category"])).toEqual([
      FV.STANDARD_TAX_CATEGORY_CODE,
      FV.ZERO_RATED_TAX_CATEGORY_CODE,
      FV.EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
    ]);
    for (const tc of multiItemInvoiceCases) {
      expect(tc.rows).toHaveLength(4);
      expect(tc.rows[0]?.["Invoice Currency Code"]).toBe(FV.OMAN_CURRENCY_OMR);
      expect(tc.rows[0]?.["Currency Exchange Rate"] ?? "").toBe("");
      expect(tc.rows[0]?.["Invoice Type Code"]).toBeTruthy();
      expect(tc.rows[0]?.["Invoice Transaction Type Code"]).toBeTruthy();
      for (const row of tc.rows) {
        expect(row["Invoice Type Code"]).toBe(tc.rows[0]?.["Invoice Type Code"]);
        expect(row["Invoice Transaction Type Code"]).toBe(
          tc.rows[0]?.["Invoice Transaction Type Code"]
        );
      }
    }
  });

  for (const tc of multiItemInvoiceCases) {
    const first = tc.rows[0] ?? {};
    test(
      `Excel upload · ${TEMPLATE} | Submit multi-item | ${first["Invoice Type Code"] ?? ""} | ${first["Invoice Transaction Type Code"] ?? ""} | OMR | 4 items (2 Goods + 2 Services) → delivered`,
      async ({ page }) => {
        test.setTimeout(SUBMIT_INVOICE_TEST_TIMEOUT_MS);
        await runSubmitInvoiceMultiItemCase(page, tc.rows);
      }
    );
  }
});
