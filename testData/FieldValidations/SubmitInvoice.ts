/**
 * Oman submit single-item matrix (Excel header keys).
 * 32 invoice types × 15 transaction types × 4 tax categories, except
 * IBR-086-OM: Profit Margin Self-Invoice uses only Not subject to VAT,
 * IBR-177-OM: Self billed credit note (261) / Self-billed invoice (389)
 * only pair with Self-billed Invoice, Import of Services (RCM), Profit
 * Margin Self-Invoice, or Import of Goods, IBR-138-OM: BTOM-001 must
 * not combine Self-billed with Third-party / Export / RCM / Profit
 * margin / Profit Margin Self-Invoice / Import of Goods, IBR-139-OM:
 * Self-billed Invoice/credit note cannot also be Third-party Invoice on
 * BTOM-001, IBR-140-OM: BTOM-001 must not combine Summary with
 * Continuous / Export / Profit margin / Profit Margin Self-Invoice /
 * Import of Goods, IBR-141-OM: BTOM-001 must not combine Continuous
 * Supply with Summary / Deemed Supply / Profit margin / Profit Margin
 * Self-Invoice / Import of Goods, and IBR-142-OM … IBR-149-OM:
 * BTOM-001 must not combine each subject txn with its named exclusion
 * partners (single Master labels never violate these pair rules).
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
      // IBR-177-OM: 261/389 may only use Self-billed / RCM / PM-Self / Import of Goods.
      if (!FV.isIbr177CompatibleInvoiceTxnPair(invoiceTypeCode, txn)) {
        continue;
      }
      // IBR-138-OM: drop Self-billed ⊕ Third-party/Export/RCM/PM/Import bits.
      if (FV.txnViolatesIbr138Om(txn)) {
        continue;
      }
      // IBR-139-OM: drop Self-billed ⊕ Third-party bits.
      if (FV.txnViolatesIbr139Om(txn)) {
        continue;
      }
      // IBR-140-OM: drop Summary ⊕ Continuous/Export/PM/Import bits.
      if (FV.txnViolatesIbr140Om(txn)) {
        continue;
      }
      // IBR-141-OM: drop Continuous ⊕ Summary/Deemed/PM/Import descriptions.
      if (FV.txnViolatesIbr141Om(txn)) {
        continue;
      }
      // IBR-142-OM … IBR-149-OM: drop subject ⊕ named partner combinations.
      if (FV.txnViolatesIbr142Om(txn)) {
        continue;
      }
      if (FV.txnViolatesIbr143Om(txn)) {
        continue;
      }
      if (FV.txnViolatesIbr144Om(txn)) {
        continue;
      }
      if (FV.txnViolatesIbr145Om(txn)) {
        continue;
      }
      if (FV.txnViolatesIbr146Om(txn)) {
        continue;
      }
      if (FV.txnViolatesIbr147Om(txn)) {
        continue;
      }
      if (FV.txnViolatesIbr148Om(txn)) {
        continue;
      }
      if (FV.txnViolatesIbr149Om(txn)) {
        continue;
      }
      const common = buildOmanSubmitDocumentRow(invoiceTypeCode, txn);
      // IBR-086-OM: Profit Margin Self-Invoice (BTOM-001) MUST use tax category O.
      const taxDefs =
        txn === FV.TXN_PROFIT_MARGIN_SELF_INVOICE
          ? GOODS_TAX_DEFS.filter(
              (d) => d.taxCategory === FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE
            )
          : GOODS_TAX_DEFS;
      for (const taxDef of taxDefs) {
        rows.push(overlayGoodsLine(common, taxDef, txn));
      }
    }
  }
  return rows;
}

export const invoiceData: Record<string, string>[] =
  buildOmanSingleItemSubmitRows();
