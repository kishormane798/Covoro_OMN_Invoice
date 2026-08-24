/**
 * Oman submit single-item matrix (Excel header keys).
 * 32 invoice types × 15 transaction types × 4 tax categories.
 * One Goods line per invoice (one tax category per invoice).
 */
import * as FV from "./ConditionalValidation";
import {
  invoiceTypeCodeValidTestData,
  invoiceTransactionTypeValidTestData,
} from "../Master/Master.omnCore";
import { buildOmanSubmitDocumentRow } from "./SubmitInvoiceMultiItem";

type GoodsTaxDef = {
  taxCategory: string;
  taxRate: string;
  exemption: string;
};

const GOODS_TAX_DEFS: readonly GoodsTaxDef[] = [
  {
    taxCategory: FV.STANDARD_TAX_CATEGORY_CODE,
    taxRate: FV.TAX_RATE_STANDARD_OMAN,
    exemption: "",
  },
  {
    taxCategory: FV.ZERO_RATED_TAX_CATEGORY_CODE,
    taxRate: FV.TAX_RATE_ZERO,
    exemption: FV.TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
  },
  {
    taxCategory: FV.EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
    taxRate: "",
    exemption: FV.TAX_EXEMPTION_REASON_SAMPLE,
  },
  {
    taxCategory: FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
    taxRate: "",
    exemption: "",
  },
];

function overlayGoodsLine(
  common: Record<string, string>,
  def: GoodsTaxDef,
  txn: string
): Record<string, string> {
  const line: Record<string, string> = {
    ...common,
    "Invoice line identifier": "LINE-S-001",
    [FV.ITEM_TYPE_FIELD]: FV.ITEM_TYPE_GOODS,
    [FV.TAX_CATEGORY_FIELD]: def.taxCategory,
    [FV.INVOICED_ITEM_TAX_RATE_FIELD]: def.taxRate,
    [FV.TAX_EXEMPTION_REASON_CODE_FIELD]: def.exemption,
    [FV.TAX_EXEMPTION_REASON_TEXT_FIELD]: def.exemption,
    [FV.SERVICE_TYPE_CODE_FIELD]: "",
    [FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD]: FV.OMAN_HS_CODE_12,
    [FV.PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD]: "",
  };
  if (
    txn === FV.TXN_PROFIT_MARGIN_INVOICE ||
    txn === FV.TXN_PROFIT_MARGIN_SELF_INVOICE
  ) {
    line[FV.PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD] =
      FV.PROFIT_MARGIN_ITEM_TYPE_SAMPLE;
  }
  return line;
}

export function buildOmanSingleItemSubmitRows(): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  for (const typeEntry of invoiceTypeCodeValidTestData) {
    for (const txnEntry of invoiceTransactionTypeValidTestData) {
      const invoiceTypeCode = typeEntry.label;
      const txn = txnEntry.label;
      const common = buildOmanSubmitDocumentRow(invoiceTypeCode, txn);
      for (const taxDef of GOODS_TAX_DEFS) {
        rows.push(overlayGoodsLine(common, taxDef, txn));
      }
    }
  }
  return rows;
}

export const invoiceData: Record<string, string>[] =
  buildOmanSingleItemSubmitRows();
