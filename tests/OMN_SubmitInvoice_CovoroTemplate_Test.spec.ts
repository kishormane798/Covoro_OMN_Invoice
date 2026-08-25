import { expect } from "@playwright/test";
import { test } from "../Src/baseTest";
import * as FV from "../testData/FieldValidations";
import { invoiceData } from "../testData/FieldValidations/SubmitInvoice";
import { runSubmitInvoiceCase } from "../Helpers/excel/submitInvoiceCaseHelper";
import {
  SUBMIT_INVOICE_TEMPLATE as TEMPLATE,
  SUBMIT_INVOICE_TEST_TIMEOUT_MS,
  SUBMIT_EXPECTED_CASE_COUNT as EXPECTED_CASE_COUNT,
} from "../Helpers/excel/submitInvoiceSpecSupport";

test.describe(`Excel upload — submit invoice (${TEMPLATE})`, () => {
  test.describe.configure({ mode: "parallel" });

  test("Oman submit matrix shape: 32 types × txns × tax cats (IBR-086 / IBR-177 / IBR-138 / IBR-139 / IBR-140 / IBR-141 / IBR-142…149) × Goods", () => {
    expect(invoiceData.length).toBe(EXPECTED_CASE_COUNT);
    expect(EXPECTED_CASE_COUNT).toBe(1736);
    for (const row of invoiceData) {
      expect(row["Item Type"]).toBe(FV.ITEM_TYPE_GOODS);
      expect(row["Invoice Currency Code"]).toBe(FV.OMAN_CURRENCY_OMR);
      expect(row["Currency Exchange Rate"] ?? "").toBe("");
      expect(row["Invoice Type Code"]).toBeTruthy();
      expect(row["Invoice Transaction Type Code"]).toBeTruthy();
      expect(
        FV.txnViolatesIbr138Om(row["Invoice Transaction Type Code"])
      ).toBe(false);
      expect(
        FV.txnViolatesIbr139Om(row["Invoice Transaction Type Code"])
      ).toBe(false);
      expect(
        FV.txnViolatesIbr140Om(row["Invoice Transaction Type Code"])
      ).toBe(false);
      expect(
        FV.txnViolatesIbr141Om(row["Invoice Transaction Type Code"])
      ).toBe(false);
      expect(
        FV.txnViolatesIbr142Om(row["Invoice Transaction Type Code"])
      ).toBe(false);
      expect(
        FV.txnViolatesIbr143Om(row["Invoice Transaction Type Code"])
      ).toBe(false);
      expect(
        FV.txnViolatesIbr144Om(row["Invoice Transaction Type Code"])
      ).toBe(false);
      expect(
        FV.txnViolatesIbr145Om(row["Invoice Transaction Type Code"])
      ).toBe(false);
      expect(
        FV.txnViolatesIbr146Om(row["Invoice Transaction Type Code"])
      ).toBe(false);
      expect(
        FV.txnViolatesIbr147Om(row["Invoice Transaction Type Code"])
      ).toBe(false);
      expect(
        FV.txnViolatesIbr148Om(row["Invoice Transaction Type Code"])
      ).toBe(false);
      expect(
        FV.txnViolatesIbr149Om(row["Invoice Transaction Type Code"])
      ).toBe(false);
      expect(row["Tax Category"]).toBeTruthy();
      if (
        (FV.SELF_BILLED_DOCUMENT_INVOICE_TYPES as readonly string[]).includes(
          row["Invoice Type Code"]
        )
      ) {
        expect(FV.SELF_BILLED_OR_RCM_TXN_TYPES).toContain(
          row["Invoice Transaction Type Code"]
        );
      }
      if (
        row["Invoice Transaction Type Code"] === FV.TXN_IMPORT_OF_SERVICES_RCM
      ) {
        // IBR-160-OM: seller country must not be OM.
        expect(row[FV.SELLER_COUNTRY_CODE_FIELD]).not.toBe(FV.OMAN_COUNTRY_CODE);
      }
      if (
        row["Invoice Transaction Type Code"] ===
        FV.TXN_PROFIT_MARGIN_SELF_INVOICE
      ) {
        // IBR-086-OM: Invoiced item VAT category MUST be O.
        expect(row["Tax Category"]).toBe(FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE);
      }
    }
    const presentTxns = new Set(
      invoiceData.map((row) => row["Invoice Transaction Type Code"])
    );
    for (const txn of FV.IBR_140_ALLOWED_STANDALONE_TXN_TYPES) {
      expect(presentTxns.has(txn)).toBe(true);
    }
    for (const txn of FV.IBR_141_ALLOWED_STANDALONE_TXN_TYPES) {
      expect(presentTxns.has(txn)).toBe(true);
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
