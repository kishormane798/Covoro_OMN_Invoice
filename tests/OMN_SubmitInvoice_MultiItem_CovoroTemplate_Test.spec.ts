import { expect } from "@playwright/test";
import { test } from "../Src/baseTest";
import * as FV from "../testData/FieldValidations";
import { multiItemInvoiceCases } from "../testData/FieldValidations/SubmitInvoiceMultiItem";
import { runSubmitInvoiceMultiItemCase } from "../Helpers/excel/submitInvoiceCaseHelper";
import {
  SUBMIT_INVOICE_TEMPLATE as TEMPLATE,
  SUBMIT_MULTI_ITEM_TEST_TIMEOUT_MS as SUBMIT_INVOICE_TEST_TIMEOUT_MS,
  SUBMIT_MULTI_ITEM_EXPECTED_CASE_COUNT as EXPECTED_CASE_COUNT,
} from "../Helpers/excel/submitInvoiceSpecSupport";

test.describe(`Submit invoice multi-item (${TEMPLATE})`, () => {
  test.describe.configure({ mode: "parallel" });

  test("Submit multi-item matrix includes all invoice types and transaction types on 4 lines (IBR-086, IBR-177, IBR-138–149).", () => {
    expect(multiItemInvoiceCases.length).toBe(EXPECTED_CASE_COUNT);
    expect(EXPECTED_CASE_COUNT).toBe(426);
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
      expect(
        FV.txnViolatesIbr138Om(tc.rows[0]?.["Invoice Transaction Type Code"] ?? "")
      ).toBe(false);
      expect(
        FV.txnViolatesIbr139Om(tc.rows[0]?.["Invoice Transaction Type Code"] ?? "")
      ).toBe(false);
      expect(
        FV.txnViolatesIbr140Om(tc.rows[0]?.["Invoice Transaction Type Code"] ?? "")
      ).toBe(false);
      expect(
        FV.txnViolatesIbr141Om(tc.rows[0]?.["Invoice Transaction Type Code"] ?? "")
      ).toBe(false);
      expect(
        FV.txnViolatesIbr142Om(tc.rows[0]?.["Invoice Transaction Type Code"] ?? "")
      ).toBe(false);
      expect(
        FV.txnViolatesIbr143Om(tc.rows[0]?.["Invoice Transaction Type Code"] ?? "")
      ).toBe(false);
      expect(
        FV.txnViolatesIbr144Om(tc.rows[0]?.["Invoice Transaction Type Code"] ?? "")
      ).toBe(false);
      expect(
        FV.txnViolatesIbr145Om(tc.rows[0]?.["Invoice Transaction Type Code"] ?? "")
      ).toBe(false);
      expect(
        FV.txnViolatesIbr146Om(tc.rows[0]?.["Invoice Transaction Type Code"] ?? "")
      ).toBe(false);
      expect(
        FV.txnViolatesIbr147Om(tc.rows[0]?.["Invoice Transaction Type Code"] ?? "")
      ).toBe(false);
      expect(
        FV.txnViolatesIbr148Om(tc.rows[0]?.["Invoice Transaction Type Code"] ?? "")
      ).toBe(false);
      expect(
        FV.txnViolatesIbr149Om(tc.rows[0]?.["Invoice Transaction Type Code"] ?? "")
      ).toBe(false);
      expect(tc.rows[0]?.["Invoice Transaction Type Code"]).not.toBe(
        FV.TXN_PROFIT_MARGIN_SELF_INVOICE
      );
      if (
        (FV.SELF_BILLED_DOCUMENT_INVOICE_TYPES as readonly string[]).includes(
          tc.rows[0]?.["Invoice Type Code"] ?? ""
        )
      ) {
        expect(FV.SELF_BILLED_OR_RCM_TXN_TYPES).toContain(
          tc.rows[0]?.["Invoice Transaction Type Code"]
        );
      }
      for (const row of tc.rows) {
        expect(row["Invoice Type Code"]).toBe(tc.rows[0]?.["Invoice Type Code"]);
        expect(row["Invoice Transaction Type Code"]).toBe(
          tc.rows[0]?.["Invoice Transaction Type Code"]
        );
        if (
          row["Invoice Transaction Type Code"] === FV.TXN_IMPORT_OF_SERVICES_RCM
        ) {
          // IBR-160-OM: seller country must not be OM.
          expect(row[FV.SELLER_COUNTRY_CODE_FIELD]).not.toBe(
            FV.OMAN_COUNTRY_CODE
          );
        }
      }
    }
    const presentTxns = new Set(
      multiItemInvoiceCases.map(
        (tc) => tc.rows[0]?.["Invoice Transaction Type Code"] ?? ""
      )
    );
    for (const txn of FV.IBR_140_ALLOWED_STANDALONE_TXN_TYPES) {
      if (txn === FV.TXN_PROFIT_MARGIN_SELF_INVOICE) {
        continue;
      }
      expect(presentTxns.has(txn)).toBe(true);
    }
    for (const txn of FV.IBR_141_ALLOWED_STANDALONE_TXN_TYPES) {
      if (txn === FV.TXN_PROFIT_MARGIN_SELF_INVOICE) {
        continue;
      }
      expect(presentTxns.has(txn)).toBe(true);
    }
  });

  for (const tc of multiItemInvoiceCases) {
    const first = tc.rows[0] ?? {};
    test(
      `Given ${first["Invoice Type Code"] ?? ""} with ${first["Invoice Transaction Type Code"] ?? ""} (OMR, 4 lines) — When the invoice is uploaded — Then the invoice should be delivered.`,
      async ({ page }) => {
        test.setTimeout(SUBMIT_INVOICE_TEST_TIMEOUT_MS);
        await runSubmitInvoiceMultiItemCase(page, tc.rows);
      }
    );
  }
});
