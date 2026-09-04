import { expect } from "@playwright/test";
import { test } from "../Src/baseTest";
import * as FV from "../testData/FieldValidations";
import { invoiceData } from "../testData/FieldValidations/SubmitInvoice";
import { runSubmitInvoiceCase } from "../Helpers/excel/submitInvoiceCaseHelper";
import {
  SUBMIT_INVOICE_TEST_TIMEOUT_MS,
  SUBMIT_EXPECTED_CASE_COUNT as EXPECTED_CASE_COUNT,
} from "../Helpers/excel/submitInvoiceSpecSupport";
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

  test("Submit matrix includes all invoice types, transaction types, and tax categories (IBR-086, IBR-177).", () => {
    expect(invoiceDataOnSimplified.length).toBe(EXPECTED_CASE_COUNT);
    expect(EXPECTED_CASE_COUNT).toBe(1736);
    for (const row of invoiceDataOnSimplified) {
      expect(row["Item Type"]).toBe(FV.ITEM_TYPE_GOODS);
      expect(row["Invoice Currency Code"]).toBe(FV.OMAN_CURRENCY_OMR);
      expect(row["Currency Exchange Rate"] ?? "").toBe("");
      expect(row["Invoice Type Code"]).toBeTruthy();
      expect(row["Invoice Transaction Type Code"]).toBeTruthy();
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
        row["Invoice Transaction Type Code"] ===
        FV.TXN_PROFIT_MARGIN_SELF_INVOICE
      ) {
        // IBR-086-OM: Invoiced item VAT category MUST be O.
        expect(row["Tax Category"]).toBe(FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE);
      }
    }
    const presentTxns = new Set(
      invoiceDataOnSimplified.map((row) => row["Invoice Transaction Type Code"])
    );
    for (const txn of FV.IBR_140_ALLOWED_STANDALONE_TXN_TYPES) {
      expect(presentTxns.has(txn)).toBe(true);
    }
    for (const txn of FV.IBR_141_ALLOWED_STANDALONE_TXN_TYPES) {
      expect(presentTxns.has(txn)).toBe(true);
    }
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
