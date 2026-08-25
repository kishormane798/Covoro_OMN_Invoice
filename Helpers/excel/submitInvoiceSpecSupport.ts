/**
 * Spec support for Covoro Excel submit-invoice suites (single + multi-item).
 * Keeps matrix filters / expected counts / timeouts out of `*.spec.ts`.
 */
import * as FV from "../../testData/FieldValidations";

export const SUBMIT_INVOICE_TEMPLATE = "Covoro";

export const SUBMIT_INVOICE_TEST_TIMEOUT_MS = 6 * 60 * 1000;
export const SUBMIT_MULTI_ITEM_TEST_TIMEOUT_MS = 8 * 60 * 1000;

/** Single-item: all tax categories except profit-margin self-invoice (IBR-086-OM). */
export const SUBMIT_TXN_TYPES_ALL_TAX_CATS = FV.OMAN_TXN_TYPES.filter(
  (t) => t !== FV.TXN_PROFIT_MARGIN_SELF_INVOICE
);

export const SELF_BILLED_TXN_TYPES_ALL_TAX_CATS =
  SUBMIT_TXN_TYPES_ALL_TAX_CATS.filter((t) =>
    (FV.SELF_BILLED_OR_RCM_TXN_TYPES as readonly string[]).includes(t)
  );

const NON_SELF_BILLED_TYPE_COUNT =
  FV.OMAN_INVOICE_TYPES.length - FV.SELF_BILLED_DOCUMENT_INVOICE_TYPES.length;

// IBR-086-OM: Profit Margin Self-Invoice uses only tax category O (1 of 4).
// IBR-177-OM: self-billed document types keep only the 4 allowed txns.
// IBR-138-OM … IBR-149-OM: master-label partner combination rules.
export const SUBMIT_EXPECTED_CASE_COUNT =
  NON_SELF_BILLED_TYPE_COUNT *
    (SUBMIT_TXN_TYPES_ALL_TAX_CATS.length * 4 + 1) +
  FV.SELF_BILLED_DOCUMENT_INVOICE_TYPES.length *
    (SELF_BILLED_TXN_TYPES_ALL_TAX_CATS.length * 4 + 1);

/** Multi-item: profit-margin self-invoice is single-item only. */
export const SUBMIT_MULTI_ITEM_TXN_TYPES = FV.OMAN_TXN_TYPES.filter(
  (t) => t !== FV.TXN_PROFIT_MARGIN_SELF_INVOICE
);

export const SELF_BILLED_MULTI_ITEM_TXN_TYPES = SUBMIT_MULTI_ITEM_TXN_TYPES.filter(
  (t) => (FV.SELF_BILLED_OR_RCM_TXN_TYPES as readonly string[]).includes(t)
);

export const SUBMIT_MULTI_ITEM_EXPECTED_CASE_COUNT =
  NON_SELF_BILLED_TYPE_COUNT * SUBMIT_MULTI_ITEM_TXN_TYPES.length +
  FV.SELF_BILLED_DOCUMENT_INVOICE_TYPES.length *
    SELF_BILLED_MULTI_ITEM_TXN_TYPES.length;
