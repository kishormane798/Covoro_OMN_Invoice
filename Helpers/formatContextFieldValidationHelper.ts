/**
 * Build Oman full-tax Excel with one format/context overlay, then patch the
 * target field (seller VATIN errors after generate so worker identity is not used).
 */
import * as FV from "../testData/FieldValidations";
import type { FormatContextFieldCase } from "../testData/FieldValidations/FormatContextFieldValidation";
import {
  applyPartyIdentifiersByTxnType,
  buildValidOmanFullTaxInvoiceRow,
} from "./conditionalValidationHelper";
import {
  generateInvoiceFromSubmitData,
  patchInvoiceTextCellInFile,
} from "../utils/invoiceExcel";

const PREPAY_UUID_FIELD = "Prepayment invoice UUID";
const PREPAY_NUMBER_FIELD = "Prepayment invoice number";
const SUPPORT_REF_FIELD = "Supporting document reference";
const SUPPORT_UUID_FIELD = "Supporting document UUID";
const PROFIT_MARGIN_ITEM_TYPE_FIELD = "Profit margin item type code";

function applyOverlay(
  seed: Record<string, string>,
  overlay: FormatContextFieldCase["overlay"]
): Record<string, string | null> {
  let row: Record<string, string | null> = { ...seed };

  if (overlay === "thirdParty") {
    row[FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD] = FV.TXN_THIRD_PARTY_INVOICE;
    row[FV.THIRD_PARTY_NAME_FIELD] = "Oman Third Party LLC";
    row[FV.THIRD_PARTY_VATIN_FIELD] = FV.IBR_003_VALID_THIRD_PARTY_VATIN;
    row[FV.THIRD_PARTY_ADDRESS_LINE_1_FIELD] = "TP Building 1";
    row[FV.THIRD_PARTY_ADDRESS_LINE_2_FIELD] = "TP Street";
    row[FV.THIRD_PARTY_ADDRESS_LINE_3_FIELD] = "TP Area";
    row[FV.THIRD_PARTY_CITY_FIELD] = "Muscat";
    row[FV.THIRD_PARTY_POSTAL_CODE_FIELD] = "100";
    row[FV.THIRD_PARTY_COUNTRY_CODE_FIELD] = FV.OMAN_COUNTRY_CODE;
    row = applyPartyIdentifiersByTxnType(row);
  }

  if (overlay === "creditNote") {
    row[FV.INVOICE_TYPE_CODE_FIELD] = FV.INVOICE_TYPE_CREDIT_NOTE;
    row[FV.CREDIT_DEBIT_NOTE_REASON_CODE_FIELD] = FV.CREDIT_DEBIT_REASON_SAMPLE;
    row[FV.PRECEDING_INVOICE_REFERENCE_FIELD] = "PREV-OMN-001";
    row[FV.PRECEDING_INVOICE_UUID_FIELD] = FV.PRECEDING_INVOICE_UUID_SAMPLE;
    row[FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD] = "2026-06-01";
  }

  if (overlay === "prepayment") {
    row[FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD] = FV.TXN_PREPAYMENT_INVOICE;
    row[PREPAY_NUMBER_FIELD] = "PRE-OMN-001";
    row[PREPAY_UUID_FIELD] = FV.PRECEDING_INVOICE_UUID_SAMPLE;
    row = applyPartyIdentifiersByTxnType(row);
  }

  if (overlay === "supporting") {
    row[SUPPORT_REF_FIELD] = "SUP-OMN-001";
    row[SUPPORT_UUID_FIELD] = FV.PRECEDING_INVOICE_UUID_SAMPLE;
  }

  if (overlay === "usdFx") {
    row[FV.INVOICE_CURRENCY_CODE_FIELD] = FV.OMAN_CURRENCY_USD;
    row[FV.SOURCE_CURRENCY_CODE_FIELD] = FV.OMAN_CURRENCY_USD;
    row[FV.EXCHANGE_RATE_FIELD] = "0.3850000";
    row[FV.TAX_AMOUNT_IN_ACCOUNTING_CURRENCY_FIELD] = "50";
  }

  if (overlay === "profitMargin") {
    row[FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD] = FV.TXN_PROFIT_MARGIN_INVOICE;
    row[FV.TAX_CATEGORY_FIELD] = FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE;
    row[FV.INVOICED_ITEM_TAX_RATE_FIELD] = "";
    row[FV.LINE_ITEM_VAT_AMOUNT_FIELD] = "0";
    row[PROFIT_MARGIN_ITEM_TYPE_FIELD] = "Tangible Movable Property";
    row[FV.TOTAL_AMOUNT_DUE_PROFIT_MARGIN_FIELD] = "1.00";
    row = applyPartyIdentifiersByTxnType(row);
  }

  return row;
}

export async function generateFormatContextFieldExcel(
  tc: FormatContextFieldCase
): Promise<{ filePath: string; invoiceNumber: string }> {
  const seed = buildValidOmanFullTaxInvoiceRow();
  const row = applyOverlay(seed, tc.overlay);
  row[tc.field] = tc.value;

  const generated = await generateInvoiceFromSubmitData(row);
  if (tc.patchAfterGenerate) {
    patchInvoiceTextCellInFile(generated.filePath, tc.field, tc.value);
  }
  return generated;
}
