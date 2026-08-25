/**
 * Oman PINT-OM conditional validation scenarios (Excel upload).
 * Source: Conditional Validations sheet + Peppol PINT OM. No UAE / BTUAE rules.
 *
 * Shared constants below are also imported by `utils/excel/invoiceExcel.ts` for submit writes.
 */

import {
  taxCategoryValidTestData,
  taxExemptionReasonValidTestData,
  invoiceTransactionTypeValidTestData,
  invoiceTypeCodeValidTestData,
  creditDebitNoteReasonValidTestData,
  itemTypeValidTestData,
  serviceTypeCodeValidTestData,
  profitMarginItemTypeValidTestData,
} from "../Master/Master.omnCore";
import { INVOICE_CURRENCY_ISO_TO_DISPLAY_NAME } from "./invoiceCurrencyIsoToDisplayName";

/** ISO currency codes for Invoice Currency Code dropdown / batch field-validation. */
export const INVOICE_CURRENCY_DROPDOWN_CODES = Object.keys(
  INVOICE_CURRENCY_ISO_TO_DISPLAY_NAME
);

// ---------------------------------------------------------------------------
// Shared constants (kept for invoiceExcel submit pipeline)
// ---------------------------------------------------------------------------

export const DOCUMENT_LEVEL_FIELDS_CLEARED_FOR_VAT_REVERSE_CHARGE = [
  "Charges on document level",
  "Vat category - charges",
  "Tax exemption reason - charges",
  "Allowances on document level",
  "Vat category - allowances",
  "Tax exemption reason - allowances",
] as const;

export const INVOICE_TYPE_CODE_INVOICE_OUT_OF_SCOPE_OF_TAX =
  "Invoice out of scope of tax";

export const PAYMENT_MEANS_TYPE_CODE_INVOICE_OUT_OF_SCOPE_OF_TAX =
  "Instrument not defined";

// ---------------------------------------------------------------------------
// Template field names (Covoro / OMN header row 4)
// ---------------------------------------------------------------------------

export const TAX_CATEGORY_FIELD = "Tax Category";
export const INVOICED_ITEM_TAX_RATE_FIELD = "Tax Rate";
export const INVOICED_ITEM_TAX_RATE_NULL_TOKEN = "__TAX_RATE_NULL__";
export const TAX_EXEMPTION_REASON_CODE_FIELD = "Tax exemption reason code";
export const TAX_EXEMPTION_REASON_TEXT_FIELD = "Tax exemption reason text";
export const TAX_EXEMPTION_REASON_CODE_NULL_TOKEN =
  "__TAX_EXEMPTION_REASON_CODE_NULL__";
export const PRECEDING_INVOICE_REFERENCE_FIELD = "Preceding Invoice reference";
export const PRECEDING_INVOICE_ISSUE_DATE_FIELD = "Preceding Invoice issue date";
export const PRECEDING_INVOICE_UUID_FIELD = "Unique Identifier Number";
export const CREDIT_DEBIT_NOTE_REASON_CODE_FIELD =
  "Credit note or Debit Note reason code";
export const INVOICE_TYPE_CODE_FIELD = "Invoice Type Code";
export const INVOICE_TRANSACTION_TYPE_CODE_FIELD =
  "Invoice Transaction Type Code";
export const EXCHANGE_RATE_FIELD = "Currency Exchange Rate";
export const INVOICE_CURRENCY_CODE_FIELD = "Invoice Currency Code";
/**
 * Covoro template has no dedicated IBT-006 column. Source currency is the
 * FX companion used with Invoice Currency Code (IBR-059 source side).
 * IBR-034 packs that name "Tax accounting currency code" are intentional skips.
 */
export const SOURCE_CURRENCY_CODE_FIELD = "Source currency code";
export const TAX_AMOUNT_IN_ACCOUNTING_CURRENCY_FIELD =
  "Invoice total tax amount in tax accounting currency";
export const BUYER_VAT_IDENTIFIER_FIELD = "Buyer VAT identifier";
export const DELIVER_TO_COUNTRY_CODE_FIELD = "Deliver to country code";
export const DELIVER_TO_POST_CODE_FIELD = "Deliver to post code";
export const DELIVER_TO_ADDRESS_LINE_1_FIELD = "Deliver to address line 1";
export const DELIVER_TO_ADDRESS_LINE_2_FIELD = "Deliver to address line 2";
export const DELIVER_TO_ADDRESS_LINE_3_FIELD = "Deliver to address line 3";
export const DELIVER_TO_CITY_FIELD = "Deliver to city";
export const DELIVER_TO_COUNTRY_SUBDIVISION_FIELD =
  "Deliver to country sub-division";
/** IBR-040-OM: if any Deliver To address cell is filled, all of these must be filled. */
export const DELIVER_TO_ADDRESS_GROUP_FIELDS = [
  DELIVER_TO_ADDRESS_LINE_1_FIELD,
  DELIVER_TO_ADDRESS_LINE_2_FIELD,
  DELIVER_TO_ADDRESS_LINE_3_FIELD,
  DELIVER_TO_CITY_FIELD,
  DELIVER_TO_POST_CODE_FIELD,
  DELIVER_TO_COUNTRY_SUBDIVISION_FIELD,
  DELIVER_TO_COUNTRY_CODE_FIELD,
] as const;
export const SELLER_IDENTIFIER_SCHEME_FIELD =
  "Seller identifier - Scheme identifier";
export const SELLER_IDENTIFIER_TEXTUAL_CODE_FIELD =
  "Seller Identifier (textual code)";
export const SELLER_IDENTIFIER_FIELD = "Seller identifier";
export const BUYER_IDENTIFIER_SCHEME_FIELD = "Scheme identifier";
export const BUYER_IDENTIFIER_TEXTUAL_CODE_FIELD =
  "Buyer Identifier (textual code)";
export const BUYER_IDENTIFIER_FIELD = "Buyer identifier";
/** IBR-016-OM: error file may cite IBT-046 or IBT-048. */
export const BUYER_ID_OR_VATIN_ERROR_FIELDS = [
  BUYER_IDENTIFIER_FIELD,
  BUYER_VAT_IDENTIFIER_FIELD,
] as const;
export const LINE_ITEM_VAT_AMOUNT_FIELD = "Line item VAT amount";
/** IBR-137-OM: quantities must be ≥ 0 (except rounding, IBT-114). */
export const INVOICED_QUANTITY_FIELD = "Invoiced Quantity";
export const ROUNDING_AMOUNT_FIELD = "Rounding Amount";
export const INVOICE_LINE_NET_AMOUNT_FIELD = "Invoice line net amount";
/** Negative qty also recalculates line net; error file may cite either. */
export const AMOUNT_QUANTITY_NEGATIVE_ERROR_FIELDS = [
  INVOICED_QUANTITY_FIELD,
  INVOICE_LINE_NET_AMOUNT_FIELD,
] as const;
/** IBT-117 proxy — Covoro has no IBG-23 VAT breakdown tax-amount column. */
export const INVOICE_TOTAL_TAX_AMOUNT_FIELD = "Invoice Total Tax Amount";
export const ITEM_TYPE_FIELD = "Item Type";
export const ITEM_CLASSIFICATION_IDENTIFIER_FIELD =
  "Item classification identifier";
export const INDUSTRIAL_CLASSIFICATION_CODE_FIELD =
  "Industrial Classification Code";
export const ITEM_COUNTRY_OF_ORIGIN_FIELD = "Item country of origin";
export const IMPORT_DATE_FIELD = "Import date";
export const CUSTOMS_DECLARATION_NUMBER_FIELD = "Customs Declaration number";
export const INCOTERMS_FIELD = "Incoterms";
export const SELLER_COUNTRY_CODE_FIELD = "Seller country code";
export const SELLER_COUNTRY_SUBDIVISION_CODE_FIELD =
  "Seller country subdivision code";
export const SELLER_VAT_IDENTIFIER_FIELD = "Seller VAT Identifier (TRN / TIN)";
/** IBR-010-OM: Seller postal address (IBG-05) required fields. */
export const SELLER_ADDRESS_LINE_1_FIELD = "Seller address line 1";
export const SELLER_ADDRESS_LINE_2_FIELD = "Seller address line 2";
export const SELLER_ADDRESS_LINE_3_FIELD = "Seller address line 3";
export const SELLER_CITY_FIELD = "Seller city";
export const SELLER_POST_CODE_FIELD = "Seller post code";
export const SELLER_ADDRESS_GROUP_FIELDS = [
  SELLER_ADDRESS_LINE_1_FIELD,
  SELLER_ADDRESS_LINE_2_FIELD,
  SELLER_ADDRESS_LINE_3_FIELD,
  SELLER_CITY_FIELD,
  SELLER_POST_CODE_FIELD,
] as const;
/** IBR-019-OM: Buyer postal address fields that MUST be present. */
export const BUYER_ADDRESS_LINE_1_FIELD = "Buyer address line 1";
export const BUYER_ADDRESS_LINE_2_FIELD = "Buyer address line 2";
export const BUYER_ADDRESS_LINE_3_FIELD = "Buyer address line 3";
export const BUYER_CITY_FIELD = "Buyer city";
export const BUYER_POST_CODE_FIELD = "Buyer post code";
export const THIRD_PARTY_NAME_FIELD = "Third Party Name";
export const THIRD_PARTY_VATIN_FIELD = "Third Party VATIN";
export const THIRD_PARTY_ADDRESS_LINE_1_FIELD = "Third Party Address Line 1";
export const THIRD_PARTY_ADDRESS_LINE_2_FIELD = "Third Party Address Line 2";
export const THIRD_PARTY_ADDRESS_LINE_3_FIELD = "Third Party Address Line 3";
export const THIRD_PARTY_CITY_FIELD = "Third Party City";
export const THIRD_PARTY_POSTAL_CODE_FIELD =
  "Third Party Postal Code - PO Box Number";
export const THIRD_PARTY_COUNTRY_CODE_FIELD = "Third Party Country Code";
export const CHARGES_ON_DOCUMENT_LEVEL_FIELD = "Charges on document level";
export const ALLOWANCES_ON_DOCUMENT_LEVEL_FIELD = "Allowances on document level";
export const VAT_CATEGORY_CHARGES_FIELD = "Vat category - charges";
export const VAT_CATEGORY_ALLOWANCES_FIELD = "Vat category - allowances";
export const TAX_EXEMPTION_REASON_CHARGES_FIELD =
  "Tax exemption reason - charges";
export const TAX_EXEMPTION_REASON_ALLOWANCES_FIELD =
  "Tax exemption reason - allowances";
export const INVOICING_PERIOD_START_DATE_FIELD = "Invoicing period start date";
export const INVOICING_PERIOD_END_DATE_FIELD = "Invoicing period end date";
export const TOTAL_AMOUNT_DUE_PROFIT_MARGIN_FIELD =
  "Total amount due (profit margin)";
/** BTOM-025 / CL-11-OM — Covoro header (row 4). */
export const PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD =
  "Profit margin item type code";
export const SERVICE_TYPE_CODE_FIELD = "Service Type Code";
export const BUYER_COUNTRY_CODE_FIELD = "Buyer country code";
export const BUYER_COUNTRY_SUBDIVISION_CODE_FIELD =
  "Buyer country subdivision code";
export const SUPPORTING_DOCUMENT_REFERENCE_FIELD =
  "Supporting document reference";
export const SUPPORTING_DOCUMENT_UUID_FIELD = "Supporting document UUID";
/** IBR-013-OM: both IBT-122 and BTOM-023 must be present when the AND trigger fires. */
export const SUPPORTING_DOCUMENT_GROUP_FIELDS = [
  SUPPORTING_DOCUMENT_REFERENCE_FIELD,
  SUPPORTING_DOCUMENT_UUID_FIELD,
] as const;

// ---------------------------------------------------------------------------
// Oman labels (Master.omnCore)
// ---------------------------------------------------------------------------

export const STANDARD_TAX_CATEGORY_CODE =
  taxCategoryValidTestData.find((x) => x.label.startsWith("Standard"))!.label;
export const ZERO_RATED_TAX_CATEGORY_CODE = "Zero rated";
export const EXEMPT_FROM_TAX_TAX_CATEGORY_CODE = "Exempt from tax";
export const NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE =
  "Services outside scope of tax / Not subject to tax";

export const TAX_RATE_STANDARD_OMAN = "5";
export const TAX_RATE_ZERO = "0";

export const TAX_EXEMPTION_REASON_SAMPLE =
  taxExemptionReasonValidTestData.find((x) =>
    x.label.startsWith("Exemption-")
  )!.label;

/** IBT-120 free text (not a CL-10 dropdown). */
export const TAX_EXEMPTION_REASON_TEXT_SAMPLE =
  "Exemption text must not apply to Standard";

/** CL-10-OM / IBR-CL-10-OM: Zero rating codelist (VATZR-OM-01..VATZR-OM-16). */
export const ZERO_RATED_EXEMPTION_REASON_LABELS = [
  "Zero-rated - Qualifying Food Items",
  "Zero-rated- Medicines and Medical Equipment",
  "Zero-rated- Investment Precious Metals",
  "Zero-rated- International and Intra-GCC Transport",
  "Zero-rated- Transport-Related Services",
  "Zero-rated- Means of Transport",
  "Zero-rated- Rescue and Assistance Vehicles",
  "Zero-rated- Oil, Derivatives, and Natural Gas",
  "Zero-rated- Export of Services",
  "Zero-rated- Direct Export of Goods",
  "Zero-rated- Indirect Export of Goods",
  "Zero-rated- Re-export of Goods",
  "Zero-rated- Special Zone to Special Zone or Within Special Zone",
  "Zero-rated- Mainland to Special Zone",
  "Zero-rated- Customs Duty Suspension to Special Zone",
  "Zero-rated- Special Zone to Customs Duty Suspension",
] as const;

/** CL-10-OM: Zero-rated VAT category must use a Zero-rated exemption reason code. */
export const TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE =
  ZERO_RATED_EXEMPTION_REASON_LABELS[0];

/** IBT-121 'Export of service' — Masters label (VATZR-OM-09). */
export const TAX_EXEMPTION_REASON_EXPORT_OF_SERVICES =
  taxExemptionReasonValidTestData.find((x) =>
    x.label.toLowerCase().includes("export of services")
  )!.label;

/** CL-11-OM Profit Margin Items Codelist sample (Masters). */
export const PROFIT_MARGIN_ITEM_TYPE_SAMPLE =
  profitMarginItemTypeValidTestData[0]!.label;
/** Value not in CL-11-OM (field-validation InvalidTestData). */
export const PROFIT_MARGIN_ITEM_TYPE_INVALID_SAMPLE = "A123456";

/** IBT-121 'Re-export of goods' — Masters label (VATZR-OM-12). */
export const TAX_EXEMPTION_REASON_RE_EXPORT_OF_GOODS =
  taxExemptionReasonValidTestData.find((x) =>
    x.label.toLowerCase().includes("re-export of goods")
  )!.label;

/** CL-12-OM Type of Services sample (BTOM-015 / Service Type Code). */
export const SERVICE_TYPE_CODE_SAMPLE = serviceTypeCodeValidTestData.find((x) =>
  x.label.toLowerCase().includes("healthcare")
)!.label;

export const SERVICE_TYPE_CODE_INVALID = "NOT-A-CL12-SERVICE-TYPE";

export const SUPPORTING_DOCUMENT_REFERENCE_SAMPLE = "SUP-DOC-EXPORT-001";
export const SUPPORTING_DOCUMENT_UUID_SAMPLE =
  "b2c3d4e5-f6a7-8901-bcde-f12345678901";

export const INVOICE_TYPE_COMMERCIAL_INVOICE = "Commercial invoice";
export const INVOICE_TYPE_CREDIT_NOTE = "Credit note";
export const INVOICE_TYPE_DEBIT_NOTE = "Debit note";
export const INVOICE_TYPE_SELF_BILLED_CREDIT_NOTE = "Self billed credit note";
/** Peppol 389 — Masters label (hyphenated). */
export const INVOICE_TYPE_SELF_BILLED_INVOICE = "Self-billed invoice";

export const TXN_FULL_TAX_INVOICE = "Full Tax Invoice";
export const TXN_SIMPLIFIED_TAX_INVOICE = "Simplified Tax Invoice";
export const TXN_SUMMARY_INVOICE = "Summary Invoice";
export const TXN_CONTINUOUS_SUPPLY = "Continuous Supply";
export const TXN_DEEMED_SUPPLY_INVOICE = "Deemed Supply Invoice";
export const TXN_THIRD_PARTY_INVOICE = "Third-party Invoice";
export const TXN_IMPORT_OF_GOODS = "Import of Goods";
export const TXN_PROFIT_MARGIN_INVOICE = "Profit Margin Invoice";
export const TXN_PROFIT_MARGIN_SELF_INVOICE = "Profit Margin Self-Invoice";
export const TXN_EXPORT_INVOICE = "Export Invoice";
export const TXN_SELF_BILLED_INVOICE = "Self-billed Invoice";
export const TXN_SPECIAL_ZONE_SUPPLIES = "Special Zone Supplies";
export const TXN_IMPORT_OF_SERVICES_RCM = "Import of Services (RCM)";
export const TXN_ECOMMERCE_TRANSACTION = "E-commerce Transaction";
export const TXN_PREPAYMENT_INVOICE = "Prepayment Invoice";

/**
 * Peppol BTOM-001 20-bit patterns (documentation / pack internals only).
 * Covoro Excel `Invoice Transaction Type Code` MUST be a Master.omnCore
 * label (e.g. "Summary Invoice"), never these 0/1 strings.
 */
/** Peppol Self-billed Invoice/credit note (XX1XXXXXXXXXXXXXXXXX) — 1 at position 3. */
export const TXN_BIT_SELF_BILLED = "00100000000000000000";
/** Peppol Third-party Invoice (XXX1XXXXXXXXXXXXXXXX) — 1 at position 4. */
export const TXN_BIT_THIRD_PARTY = "00010000000000000000";
export const TXN_BIT_SUMMARY = "00001000000000000000";
export const TXN_BIT_CONTINUOUS = "00000100000000000000";
export const TXN_BIT_EXPORT = "00000010000000000000";
export const TXN_BIT_DEEMED_SUPPLY = "00000001000000000000";
/** Peppol Import of services for RCM (XXXXXXXX1XXXXXXXXXXX) — 1 at position 9. */
export const TXN_BIT_IMPORT_SERVICES_RCM = "00000000100000000000";
export const TXN_BIT_PROFIT_MARGIN = "00000000010000000000";
export const TXN_BIT_PROFIT_MARGIN_SELF = "00000000001000000000";
export const TXN_BIT_IMPORT_OF_GOODS = "00000000000010000000";
/** Peppol E-commerce supplies (XXXXXXXXXXX1XXXXXXXX) — 1 at position 12. */
export const TXN_BIT_ECOMMERCE = "00000000000100000000";
/** Peppol Special Zone Supplies (XXXXXXXXXXXXX1XXXXXX) — 1 at position 14. */
export const TXN_BIT_SPECIAL_ZONE = "00000000000001000000";
/** Peppol Full Tax Invoice (1XXXXXXXXXXXXXXXXXXX) — 1 at position 1. */
export const TXN_BIT_FULL_TAX = "10000000000000000000";
/** Peppol Simplified Tax Invoice (X1XXXXXXXXXXXXXXXXXX) — 1 at position 2. */
export const TXN_BIT_SIMPLIFIED = "01000000000000000000";
/** Peppol Prepayment (XXXXXXXXXXXXXXX1XXXX) — 1 at position 16. */
export const TXN_BIT_PREPAYMENT = "00000000000000010000";

/** Master.omnCore label → Peppol 20-bit (internal only; Excel still gets the label). */
export const OMAN_TXN_LABEL_TO_BIT: Readonly<Record<string, string>> = {
  [TXN_FULL_TAX_INVOICE]: TXN_BIT_FULL_TAX,
  [TXN_SIMPLIFIED_TAX_INVOICE]: TXN_BIT_SIMPLIFIED,
  [TXN_SELF_BILLED_INVOICE]: TXN_BIT_SELF_BILLED,
  [TXN_THIRD_PARTY_INVOICE]: TXN_BIT_THIRD_PARTY,
  [TXN_SUMMARY_INVOICE]: TXN_BIT_SUMMARY,
  [TXN_CONTINUOUS_SUPPLY]: TXN_BIT_CONTINUOUS,
  [TXN_EXPORT_INVOICE]: TXN_BIT_EXPORT,
  [TXN_DEEMED_SUPPLY_INVOICE]: TXN_BIT_DEEMED_SUPPLY,
  [TXN_IMPORT_OF_SERVICES_RCM]: TXN_BIT_IMPORT_SERVICES_RCM,
  [TXN_PROFIT_MARGIN_INVOICE]: TXN_BIT_PROFIT_MARGIN,
  [TXN_PROFIT_MARGIN_SELF_INVOICE]: TXN_BIT_PROFIT_MARGIN_SELF,
  [TXN_ECOMMERCE_TRANSACTION]: TXN_BIT_ECOMMERCE,
  [TXN_IMPORT_OF_GOODS]: TXN_BIT_IMPORT_OF_GOODS,
  [TXN_SPECIAL_ZONE_SUPPLIES]: TXN_BIT_SPECIAL_ZONE,
  [TXN_PREPAYMENT_INVOICE]: TXN_BIT_PREPAYMENT,
};

/** True when BTOM-001 is a Peppol 20-bit string rather than a Master label. */
export function isOmanTxnPeppolBitString(value: string): boolean {
  return /^[01]{20}$/.test(String(value ?? "").trim());
}

/** Join Covoro Master dropdown descriptions for one BTOM-001 Excel cell. */
export const combineOmanTxnTypeDescriptions = (
  ...labels: string[]
): string =>
  labels
    .map((x) => String(x ?? "").trim())
    .filter(Boolean)
    .join(", ");

/** Map a Peppol 20-bit BTOM-001 string to Covoro Master description(s). */
export function omanTxnBitsToExcelDescriptions(bits: string): string {
  const s = String(bits ?? "")
    .trim()
    .replace(/X/gi, "0")
    .padEnd(20, "0")
    .slice(0, 20);
  if (!/^[01]{20}$/.test(s)) {
    return "";
  }
  const pairs: Array<[string, string]> = [
    [TXN_BIT_FULL_TAX, TXN_FULL_TAX_INVOICE],
    [TXN_BIT_SIMPLIFIED, TXN_SIMPLIFIED_TAX_INVOICE],
    [TXN_BIT_SELF_BILLED, TXN_SELF_BILLED_INVOICE],
    [TXN_BIT_THIRD_PARTY, TXN_THIRD_PARTY_INVOICE],
    [TXN_BIT_SUMMARY, TXN_SUMMARY_INVOICE],
    [TXN_BIT_CONTINUOUS, TXN_CONTINUOUS_SUPPLY],
    [TXN_BIT_EXPORT, TXN_EXPORT_INVOICE],
    [TXN_BIT_DEEMED_SUPPLY, TXN_DEEMED_SUPPLY_INVOICE],
    [TXN_BIT_IMPORT_SERVICES_RCM, TXN_IMPORT_OF_SERVICES_RCM],
    [TXN_BIT_PROFIT_MARGIN, TXN_PROFIT_MARGIN_INVOICE],
    [TXN_BIT_PROFIT_MARGIN_SELF, TXN_PROFIT_MARGIN_SELF_INVOICE],
    [TXN_BIT_ECOMMERCE, TXN_ECOMMERCE_TRANSACTION],
    [TXN_BIT_IMPORT_OF_GOODS, TXN_IMPORT_OF_GOODS],
    [TXN_BIT_SPECIAL_ZONE, TXN_SPECIAL_ZONE_SUPPLIES],
    [TXN_BIT_PREPAYMENT, TXN_PREPAYMENT_INVOICE],
  ];
  const labels: string[] = [];
  for (const [bit, label] of pairs) {
    const idx = bit.indexOf("1");
    if (idx >= 0 && s.charAt(idx) === "1") {
      labels.push(label);
    }
  }
  return combineOmanTxnTypeDescriptions(...labels);
}

/** OR Peppol BTOM-001 bit strings (X treated as 0). */
export function combineOmanTxnTypeBits(...bits: string[]): string {
  const len = 20;
  const out = Array.from({ length: len }, () => "0");
  for (const raw of bits) {
    const s = String(raw ?? "")
      .trim()
      .replace(/X/gi, "0")
      .padEnd(len, "0")
      .slice(0, len);
    for (let i = 0; i < len; i++) {
      if (s[i] === "1") out[i] = "1";
    }
  }
  return out.join("");
}

/** True when BTOM-001 has both Self-billed and Third-party (bits or descriptions). */
export function omanTxnCombinesSelfBilledAndThirdParty(txn: string): boolean {
  return txnViolatesIbr139Om(txn);
}

/** IBR-139-OM: Self-billed cannot also be Third-party on the same BTOM-001 cell. */
export function txnViolatesIbr139Om(txn: string): boolean {
  const bits = normalizeOmanTxnBits(txn);
  return bits.charAt(2) === "1" && bits.charAt(3) === "1";
}

export const SPECIAL_ZONE_LICENSE_SCHEME = "Special Zone License Number";
/** CL-13-OM label used when IBR-150-OM requires both subdivisions. */
export const SPECIAL_ZONE_COUNTRY_SUBDIVISION_CL13 = "Sohar Free Zone.";
/** CL-13-OM Mainland — Peppol 'MO'; IBR-151/152 SZLN identifier is not mandatory. */
export const MAINLAND_OMAN_COUNTRY_SUBDIVISION_CL13 = "Mainland Oman.";
/** Not on CL-13-OM — IBR-150-OM Not Allowed (codelist) polarity. */
export const COUNTRY_SUBDIVISION_NOT_IN_CL13 = "NOT-A-CL13-SUBDIVISION";
/** Valid UUID version 5 (IBR-002-OM / BTOM-002|BTOM-031 pattern). */
export const PRECEDING_INVOICE_UUID_SAMPLE =
  "a1b2c3d4-e5f6-5a90-8bcd-ef1234567890";

/** UUID v4 — fails IBR-002-OM (version nibble must be 5). */
export const UUID_V4_INVALID_FOR_IBR_002 =
  "a1b2c3d4-e5f6-4a90-8bcd-ef1234567890";

/** Non-UUID garbage — fails IBR-002-OM. */
export const UUID_GARBAGE_INVALID_FOR_IBR_002 = "UUID-PREV-OMN-001";

export const ITEM_TYPE_GOODS = itemTypeValidTestData[0]!.label;
export const ITEM_TYPE_SERVICES = itemTypeValidTestData[1]!.label;

export const CREDIT_DEBIT_REASON_SAMPLE =
  creditDebitNoteReasonValidTestData[0]!.label;

/** Valid 12-digit Oman HS code from template Masters (heading 8471.30 — portable ADP machines). */
export const OMAN_HS_CODE_12 = "847130000002";
/** 12-digit value that is not on the ROP Customs HS master list (IBR-174-OM). */
export const OMAN_HS_CODE_NOT_ON_ROP_LIST = "999999999999";
export const OMAN_CURRENCY_OMR = "OMR";
export const OMAN_CURRENCY_USD = "USD";
export const OMAN_COUNTRY_CODE = "Oman";
/** Non-OM delivery / buyer country for export / forbidden-OM asserts. */
export const UAE_COUNTRY_CODE = "United Arab Emirates";

/** Sanity: masters exist for dropdown-driven scenarios. */
export const OMAN_TXN_TYPES = invoiceTransactionTypeValidTestData.map(
  (x) => x.label
);
export const OMAN_INVOICE_TYPES = invoiceTypeCodeValidTestData.map((x) => x.label);


// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
/** Baseline scenario contract — every case must carry a PINT-OM `ruleId`. */
export type OmanConditionalScenario = {
  ruleId: string;
  title: string;
  shouldError: boolean;
  expectedErrorField?: string;
};

export type VatCategoryTaxRateScenario = OmanConditionalScenario & {
  taxCategory: string;
  taxRate: string | null;
};

/**
 * ALIGNED-IBRP-*-01-OM: when line (IBT-151), doc allowance (IBT-95) or
 * doc charge (IBT-102) uses category C, Full Tax invoices must expose a
 * matching VAT breakdown category (IBT-118). Covoro drives breakdown via
 * line `Tax Category`; Simplified Tax Invoice is exempt.
 */
export type VatBreakdownCategoryPresenceScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  taxCategory: string;
  taxRate: string | null;
  taxExemptionReasonCode?: string | null;
  /** Driving component. Default `line` (IBT-151). */
  source?: "line" | "allowance" | "charge";
  /**
   * When source is allowance/charge: if false, leave line Tax Category as
   * Standard so IBT-118 is not the source category (error unless Simplified).
   * Standard (S) mismatch uses Zero rated on the line so IBT-118 is not S.
   */
  breakdownMatches?: boolean;
};

/** IBR-038-OM: Line item VAT amount required except Simplified. */
export type LineItemVatAmountRequiredScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  taxCategory: string;
  taxRate: string | null;
  lineItemVatAmount: string;
  taxExemptionReasonCode?: string;
};

/** IBR-039/054/077-OM: Line VAT amount must be zero for E / O / Z. */
export type LineItemVatAmountZeroScenario = OmanConditionalScenario & {
  taxCategory: string;
  taxRate: string | null;
  taxExemptionReasonCode?: string;
  lineItemVatAmount: string;
};

/**
 * ALIGNED-IBRP-E-09-OM: VAT category tax amount (IBT-117) in a VAT breakdown
 * (IBG-23) where VAT category code (IBT-118) is "E" MUST be 0, unless
 * Simplified Tax Invoice (X1XXXXXXXXXXXXXXXXXX). VAT breakdown is UI/backend
 * auto-map — Excel provides values and asserts upload status (do not blank
 * Invoice Total Tax Amount to fake IBT-117 omit).
 */
export type VatCategoryTaxAmountE09Scenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  taxCategory: string;
  taxRate: string | null;
  taxExemptionReasonCode?: string;
  /** IBT-117 proxy (Invoice Total Tax Amount). Use "0" / non-zero; do not blank for Simplified. */
  vatCategoryTaxAmount: string;
};

/**
 * ALIGNED-IBRP-O-09-OM: VAT category tax amount (IBT-117) in a VAT breakdown
 * (IBG-23) where VAT category code (IBT-118) is "O" MUST be 0, unless
 * Simplified Tax Invoice (X1XXXXXXXXXXXXXXXXXX). VAT breakdown is UI/backend
 * auto-map — Excel provides values and asserts upload status (do not blank
 * Invoice Total Tax Amount to fake IBT-117 omit).
 */
export type VatCategoryTaxAmountO09Scenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  taxCategory: string;
  taxRate: string | null;
  taxExemptionReasonCode?: string;
  /** IBT-117 proxy (Invoice Total Tax Amount). Use "0" / non-zero; do not blank for Simplified. */
  vatCategoryTaxAmount: string;
};

/**
 * ALIGNED-IBRP-Z-09-OM: VAT category tax amount (IBT-117) in a VAT breakdown
 * (IBG-23) where VAT category code (IBT-118) is "Z" MUST be 0, unless
 * Simplified Tax Invoice (X1XXXXXXXXXXXXXXXXXX). VAT breakdown is UI/backend
 * auto-map — Excel provides values and asserts upload status (do not blank
 * Invoice Total Tax Amount to fake IBT-117 omit).
 */
export type VatCategoryTaxAmountZ09Scenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  taxCategory: string;
  taxRate: string | null;
  taxExemptionReasonCode?: string;
  /** IBT-117 proxy (Invoice Total Tax Amount). Use "0" / non-zero; do not blank for Simplified. */
  vatCategoryTaxAmount: string;
};

/** Mutual-exclusion BTOM-001 pairs (IBR-149-OM representative). */
export type TxnMutualExclusionScenario = OmanConditionalScenario & {
  /** Conflict bit-string written into Invoice Transaction Type Code. */
  invoiceTransactionTypeCode: string;
};

/** IBR-006-OM: Seller VATIN mandatory except import / PM-self exceptions. */
export type SellerVatMandatoryScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  sellerVatIdentifier: string;
  /** Re-patch seller VAT after generate (worker identity overwrites on write). */
  patchSellerVatAfterGenerate?: boolean;
};

/** IBR-007-OM: Seller identifier scheme (IBT-029-1) required for named txn types. */
export type SellerIdentifierSchemeScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  /** When false, clear IBT-029-1 after overlay so the scheme column is the probe. */
  sellerIdentifierSchemeProvided: boolean;
};

/** IBR-016-OM: Buyer identifier OR Buyer VATIN for named BTOM-001 txn types. */
export type BuyerIdOrVatinScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  buyerIdentifier: string;
  buyerVatIdentifier: string;
};

/** IBR-010-OM: Seller postal address (IBG-05) fields must all be provided. */
export type SellerAddressRequiredScenario = OmanConditionalScenario & {
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  city: string;
  postCode: string;
};

/**
 * IBR-015-OM: Third-party Invoice requires the third-party party block
 * (BTOM-005..011 / BTOM-13). VAT Scheme Code (BTOM-06-1) has no Covoro column.
 */
export type ThirdPartyRequiredScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  thirdPartyName: string;
  thirdPartyVatin: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  city: string;
  postalCode: string;
  countryCode: string;
};

/** IBR-019-OM: Buyer address block mandatory for listed txn types. */
export type BuyerAddressRequiredScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  city: string;
  postCode: string;
};

/** IBR-040-OM: Deliver To address group is all-or-nothing when any cell is entered. */
export type DeliverToAddressRequiredScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode?: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  city: string;
  postCode: string;
  countrySubDivision: string;
  countryCode: string;
};

/** IBR-029 / IBR-CO-19: invoicing period start/end consistency. */
export type InvoicingPeriodScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  periodStart: string;
  periodEnd: string;
};

/** IBR-058-OM: Paid amount → prepayment invoice number + UUID. */
export type PrepaymentPaidAmountScenario = OmanConditionalScenario & {
  paidAmount: string;
  prepaymentInvoiceNumber: string;
  prepaymentInvoiceUuid: string;
};

export const PREPAYMENT_PAID_AMOUNT_REQUIRED_FIELDS = [
  "Prepayment invoice number",
  "Prepayment invoice UUID",
] as const;

/** Error workbook columns for the companions that were left empty (IBR-058-OM). */
export function missingPrepaymentPaidAmountErrorFields(scenario: {
  prepaymentInvoiceNumber: string;
  prepaymentInvoiceUuid: string;
  expectedErrorField?: string;
}): string[] {
  const missing: string[] = [];
  if (!String(scenario.prepaymentInvoiceNumber ?? "").trim()) {
    missing.push(PREPAYMENT_PAID_AMOUNT_REQUIRED_FIELDS[0]);
  }
  if (!String(scenario.prepaymentInvoiceUuid ?? "").trim()) {
    missing.push(PREPAYMENT_PAID_AMOUNT_REQUIRED_FIELDS[1]);
  }
  if (missing.length > 0) return missing;
  return [
    scenario.expectedErrorField ?? PREPAYMENT_PAID_AMOUNT_REQUIRED_FIELDS[0],
  ];
}

/** IBR-080-OM: HS classification must be exactly 12 digits when provided. */
export type HsCodeLengthScenario = OmanConditionalScenario & {
  itemClassificationIdentifier: string;
};

/** IBR-081-OM: Industrial Classification Code required except Simplified / Import of Goods / Import of Services RCM / Profit Margin Self-Invoice. */
export type IndustrialClassificationRequiredScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  industrialClassificationCode: string;
};

/** IBR-CL-05-OM / IBR-CL-10-OM: doc allowance E/Z IBT-196 must use Exemption / Zero-rating codelist. */
export type DocAllowanceExemptionClScenario = OmanConditionalScenario & {
  vatCategory: string;
  exemptionReason: string;
  amount: string;
};

/** IBR-160-OM: Import of Services RCM → Seller country must not be OM. */
export type SellerCountryRcmScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  sellerCountryCode: string;
};

/** IBR-175-OM: Profit Margin Invoice → preceding ref + UUID. */
export type ProfitMarginPrecedingScenario = OmanConditionalScenario & {
  precedingInvoiceReference: string;
  precedingInvoiceUuid: string;
};

/** IBR-091-OM: Profit Margin Invoice → IBT-158 MUST NOT start with banned prefixes. */
export type ProfitMarginHsPrefixScenario = OmanConditionalScenario & {
  itemClassificationIdentifier: string;
};

/** CL-11-OM: Profit Margin Invoice / Self-Invoice → BTOM-025 present + CL-11 code. */
export type ProfitMarginItemTypeScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  profitMarginItemTypeCode: string;
};

/** IBR-152/153-OM: Special Zone / Import buyer identifier scheme. */
export type BuyerIdentifierSchemeScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  buyerIdentifierScheme: string;
  buyerIdentifier: string;
};

export type VatExemptionReasonScenario = OmanConditionalScenario & {
  taxCategory: string;
  taxExemptionReasonCode: string | null;
  /** IBT-120. Omit to copy code into text (IBR-069/070). Set "" to isolate IBT-121. */
  taxExemptionReasonText?: string | null;
  taxRate?: string | null;
};

export type PrecedingInvoiceScenario = OmanConditionalScenario & {
  invoiceTypeCode: string;
  precedingInvoiceReference: string;
  precedingInvoiceIssueDate: string;
  precedingInvoiceUuid?: string;
  creditDebitNoteReasonCode: string;
};

export type ExchangeRateScenario = OmanConditionalScenario & {
  invoiceCurrencyCode: string;
  exchangeRate: string;
  /** Source / FX companion currency (Covoro). Empty clears the cell. */
  sourceCurrencyCode?: string;
  /** IBT-111 companion amount when invoice currency ≠ OMR. */
  taxAmountInAccountingCurrency?: string;
};

export type ExportDeliveryScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  deliverToCountryCode: string;
};

/** IBR-150-OM: Special Zone Supplies → buyer + seller country subdivision (CL-13-OM). */
export type SpecialZoneCountrySubdivisionScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  sellerCountrySubdivisionCode: string;
  buyerCountrySubdivisionCode: string;
};

export type SpecialZoneSellerScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  sellerIdentifierTextualCode: string;
  sellerIdentifier: string;
  /** BTOM-024. Omit to keep Sohar Free Zone (IBR-151 IF: subdivision ≠ MO). */
  sellerCountrySubdivisionCode?: string;
};

export type SelfBilledBuyerVatScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  buyerVatIdentifier: string;
};

/** IBR-003-OM: Seller / Buyer / Third Party VATIN = OM + exactly 10 digits. */
export type VatinParty = "seller" | "buyer" | "thirdParty";

export type VatinPatternScenario = OmanConditionalScenario & {
  party: VatinParty;
  /** Exact VATIN cell value to write for the party under test. */
  vatinValue: string;
  /**
   * When true, re-patch seller VAT after generate (worker identity overwrites
   * Seller VAT Identifier on write).
   */
  patchSellerVatAfterGenerate?: boolean;
};

export type DocumentAllowanceChargeRateScenario = OmanConditionalScenario & {
  kind: "allowance" | "charge";
  vatCategory: string;
  exemptionReason: string;
  amount: string;
};

export type ItemTypeRequiredScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  itemType: string;
};

export type GoodsClassificationScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  itemType: string;
  itemClassificationIdentifier: string;
};

export type ImportOfGoodsScenario = OmanConditionalScenario & {
  /** Defaults to Import of Goods (IBR-085-OM). Full Tax isolates Import date pairing. */
  invoiceTransactionTypeCode?: string;
  itemCountryOfOrigin: string;
  importDate: string;
  customsDeclarationNumber: string;
  incoterms: string;
};

export type ProfitMarginTaxCategoryScenario = OmanConditionalScenario & {
  taxCategory: string;
  sellerCountryCode: string;
};

export type SummaryPeriodScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  periodStart: string;
  periodEnd: string;
};

export type DocumentAllowanceChargeVatScenario = OmanConditionalScenario & {
  kind: "allowance" | "charge";
  vatCategory: string;
  exemptionReason: string;
  amount: string;
};

/**
 * IBR-042-OM: IBG-21 present → charge reason code (IBT-104) required.
 * Covoro has no IBT-104 column; amount cell is the pack proxy.
 */
export type DocumentChargeReasonScenario = OmanConditionalScenario & {
  amount: string;
  vatCategory: string;
};

export type CreditDebitReasonScenario = OmanConditionalScenario & {
  invoiceTypeCode: string;
  creditDebitNoteReasonCode: string;
  precedingInvoiceReference: string;
};

/** IBR-177-OM: invoice type 261/389 constrains allowed transaction types. */
export type SelfBilledTxnConstraintScenario = OmanConditionalScenario & {
  invoiceTypeCode: string;
  invoiceTransactionTypeCode: string;
};

/**
 * IBR-176-OM: Prepayment bit mutually exclusive with Summary / Deemed /
 * Profit Margin Self bits on the same BTOM-001 field.
 */
export type PrepaymentTxnExclusionScenario = OmanConditionalScenario & {
  /** Partner Master label for titles / companion overlays (empty = control). */
  conflictingTxnType: string;
  /** Excel cell: Master label or Peppol 20-bit string. */
  invoiceTransactionTypeCode: string;
};

/**
 * IBR-140-OM: Summary bit mutually exclusive with Continuous / Export /
 * Profit margin / Profit Margin Self-Invoice / Import of Goods.
 */
export type SummaryTxnExclusionScenario = OmanConditionalScenario & {
  /** Partner Master label for titles / companion overlays (empty = Summary-alone). */
  conflictingTxnType: string;
  /** Excel cell: Master description, or comma-joined descriptions for Not Allowed. */
  invoiceTransactionTypeCode: string;
  /** Master Invoice Type Code (expanded across OMAN_INVOICE_TYPES). */
  invoiceTypeCode?: string;
};

/**
 * IBR-141-OM: Continuous Supply mutually exclusive with Summary / Deemed /
 * Profit margin / Profit Margin Self-Invoice / Import of Goods.
 */
export type ContinuousTxnExclusionScenario = OmanConditionalScenario & {
  /** Partner Master label for titles / companion overlays (empty = Continuous-alone). */
  conflictingTxnType: string;
  /** Excel cell: Master description, or comma-joined descriptions for Not Allowed. */
  invoiceTransactionTypeCode: string;
  /** Master Invoice Type Code (expanded across OMAN_INVOICE_TYPES). */
  invoiceTypeCode?: string;
};

/** IBR-142-OM … IBR-149-OM: BTOM-001 Master-description exclusion pairs. */
export type TxnPairExclusionScenario = ContinuousTxnExclusionScenario;

/**
 * IBR-138-OM: Self-billed mutually exclusive with Third-party / Export /
 * RCM / Profit margin / Profit Margin Self / Import of Goods on BTOM-001.
 */
export type SelfBilledTxnExclusionScenario = OmanConditionalScenario & {
  /** Partner Master label for titles / companion overlays (empty = control). */
  conflictingTxnType: string;
  /** Excel cell: Master description, or comma-joined descriptions for Not Allowed. */
  invoiceTransactionTypeCode: string;
  /** Master Invoice Type Code (expanded across OMAN_INVOICE_TYPES). */
  invoiceTypeCode?: string;
};

/** IBR-155-OM: Export + Export of Services → Service Type (CL-12) mandatory. */
export type ExportServiceTypeScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  taxExemptionReasonCode: string;
  serviceTypeCode: string;
};

/** IBR-012-OM: Export + Export of Services → Deliver to country must not be OM. */
export type ExportDeliverCountryForbiddenOmScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  taxExemptionReasonCode: string;
  deliverToCountryCode: string;
};

/** IBR-013-OM: Export + Re-export of goods (VATZR-OM-12) → supporting document ref + UUID. */
export type ExportSupportingDocumentScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  taxExemptionReasonCode: string;
  supportingDocumentReference: string;
  supportingDocumentUuid: string;
};

/** IBR-020-OM: Self-billed / RCM → Buyer country must be OM. */
export type SelfBilledRcmBuyerCountryScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  buyerCountryCode: string;
};

/** Invoice types that trigger CN/DN/261 preceding-ref and reason-code rules. */
export const CN_DN_SELF_BILLED_INVOICE_TYPES = [
  INVOICE_TYPE_CREDIT_NOTE,
  INVOICE_TYPE_DEBIT_NOTE,
  INVOICE_TYPE_SELF_BILLED_CREDIT_NOTE,
] as const;

/** Invoice types that trigger IBR-177-OM (self-billed CN 261 + self-billed invoice 389). */
export const SELF_BILLED_DOCUMENT_INVOICE_TYPES = [
  INVOICE_TYPE_SELF_BILLED_CREDIT_NOTE,
  INVOICE_TYPE_SELF_BILLED_INVOICE,
] as const;

/**
 * Transaction types that trigger IBR-017 / IBR-020 (Self-billed OR Import of
 * Services RCM OR Profit Margin Self-Invoice OR Import of Goods).
 */
export const SELF_BILLED_OR_RCM_TXN_TYPES = [
  TXN_SELF_BILLED_INVOICE,
  TXN_IMPORT_OF_SERVICES_RCM,
  TXN_PROFIT_MARGIN_SELF_INVOICE,
  TXN_IMPORT_OF_GOODS,
] as const;

/** IBR-037-OM: Summary OR Continuous Supply → invoicing period required. */
export const SUMMARY_OR_CONTINUOUS_TXN_TYPES = [
  TXN_SUMMARY_INVOICE,
  TXN_CONTINUOUS_SUPPLY,
] as const;

/** Doc allowance/charge E|Z categories for IBR-062/064 expanders. */
export const DOC_ALLOWANCE_CHARGE_E_Z_CATEGORIES = [
  EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
  ZERO_RATED_TAX_CATEGORY_CODE,
] as const;

/** IBR-176-OM partners that must not combine with Prepayment on BTOM-001. */
export const PREPAYMENT_EXCLUSION_PARTNER_TXN_TYPES = [
  TXN_SUMMARY_INVOICE,
  TXN_DEEMED_SUPPLY_INVOICE,
  TXN_PROFIT_MARGIN_SELF_INVOICE,
] as const;

export const PREPAYMENT_EXCLUSION_PARTNER_BITS: Record<string, string> = {
  [TXN_SUMMARY_INVOICE]: TXN_BIT_SUMMARY,
  [TXN_DEEMED_SUPPLY_INVOICE]: TXN_BIT_DEEMED_SUPPLY,
  [TXN_PROFIT_MARGIN_SELF_INVOICE]: TXN_BIT_PROFIT_MARGIN_SELF,
};

/** IBR-140-OM partners that must not combine with Summary on BTOM-001. */
export const IBR_140_EXCLUSION_PARTNER_TXN_TYPES = [
  TXN_CONTINUOUS_SUPPLY,
  TXN_EXPORT_INVOICE,
  TXN_PROFIT_MARGIN_INVOICE,
  TXN_PROFIT_MARGIN_SELF_INVOICE,
  TXN_IMPORT_OF_GOODS,
] as const;

export const IBR_140_EXCLUSION_PARTNER_BITS: Record<string, string> = {
  [TXN_CONTINUOUS_SUPPLY]: TXN_BIT_CONTINUOUS,
  [TXN_EXPORT_INVOICE]: TXN_BIT_EXPORT,
  [TXN_PROFIT_MARGIN_INVOICE]: TXN_BIT_PROFIT_MARGIN,
  [TXN_PROFIT_MARGIN_SELF_INVOICE]: TXN_BIT_PROFIT_MARGIN_SELF,
  [TXN_IMPORT_OF_GOODS]: TXN_BIT_IMPORT_OF_GOODS,
};

/** IBR-140-OM Allowed polarities: Summary and each partner as a single Master label. */
export const IBR_140_ALLOWED_STANDALONE_TXN_TYPES = [
  TXN_SUMMARY_INVOICE,
  ...IBR_140_EXCLUSION_PARTNER_TXN_TYPES,
] as const;

/** IBR-141-OM partners that must not combine with Continuous Supply on BTOM-001. */
export const IBR_141_EXCLUSION_PARTNER_TXN_TYPES = [
  TXN_SUMMARY_INVOICE,
  TXN_DEEMED_SUPPLY_INVOICE,
  TXN_PROFIT_MARGIN_INVOICE,
  TXN_PROFIT_MARGIN_SELF_INVOICE,
  TXN_IMPORT_OF_GOODS,
] as const;

export const IBR_141_EXCLUSION_PARTNER_BITS: Record<string, string> = {
  [TXN_SUMMARY_INVOICE]: TXN_BIT_SUMMARY,
  [TXN_DEEMED_SUPPLY_INVOICE]: TXN_BIT_DEEMED_SUPPLY,
  [TXN_PROFIT_MARGIN_INVOICE]: TXN_BIT_PROFIT_MARGIN,
  [TXN_PROFIT_MARGIN_SELF_INVOICE]: TXN_BIT_PROFIT_MARGIN_SELF,
  [TXN_IMPORT_OF_GOODS]: TXN_BIT_IMPORT_OF_GOODS,
};

/** IBR-141-OM Allowed polarities: Continuous Supply and each partner as a single Master label. */
export const IBR_141_ALLOWED_STANDALONE_TXN_TYPES = [
  TXN_CONTINUOUS_SUPPLY,
  ...IBR_141_EXCLUSION_PARTNER_TXN_TYPES,
] as const;

/** IBR-138-OM partners that must not combine with Self-billed on BTOM-001. */
export const SELF_BILLED_EXCLUSION_PARTNER_TXN_TYPES = [
  TXN_THIRD_PARTY_INVOICE,
  TXN_EXPORT_INVOICE,
  TXN_IMPORT_OF_SERVICES_RCM,
  TXN_PROFIT_MARGIN_INVOICE,
  TXN_PROFIT_MARGIN_SELF_INVOICE,
  TXN_IMPORT_OF_GOODS,
] as const;

export const SELF_BILLED_EXCLUSION_PARTNER_BITS: Record<string, string> = {
  [TXN_THIRD_PARTY_INVOICE]: TXN_BIT_THIRD_PARTY,
  [TXN_EXPORT_INVOICE]: TXN_BIT_EXPORT,
  [TXN_IMPORT_OF_SERVICES_RCM]: TXN_BIT_IMPORT_SERVICES_RCM,
  [TXN_PROFIT_MARGIN_INVOICE]: TXN_BIT_PROFIT_MARGIN,
  [TXN_PROFIT_MARGIN_SELF_INVOICE]: TXN_BIT_PROFIT_MARGIN_SELF,
  [TXN_IMPORT_OF_GOODS]: TXN_BIT_IMPORT_OF_GOODS,
};

/** IBR-142-OM: Export Invoice cannot combine with these Master labels. */
export const IBR_142_EXCLUSION_PARTNER_TXN_TYPES = [
  TXN_SELF_BILLED_INVOICE,
  TXN_SUMMARY_INVOICE,
  TXN_DEEMED_SUPPLY_INVOICE,
  TXN_IMPORT_OF_SERVICES_RCM,
  TXN_PROFIT_MARGIN_INVOICE,
  TXN_PROFIT_MARGIN_SELF_INVOICE,
  TXN_IMPORT_OF_GOODS,
] as const;

export const IBR_142_EXCLUSION_PARTNER_BITS: Record<string, string> = {
  [TXN_SELF_BILLED_INVOICE]: TXN_BIT_SELF_BILLED,
  [TXN_SUMMARY_INVOICE]: TXN_BIT_SUMMARY,
  [TXN_DEEMED_SUPPLY_INVOICE]: TXN_BIT_DEEMED_SUPPLY,
  [TXN_IMPORT_OF_SERVICES_RCM]: TXN_BIT_IMPORT_SERVICES_RCM,
  [TXN_PROFIT_MARGIN_INVOICE]: TXN_BIT_PROFIT_MARGIN,
  [TXN_PROFIT_MARGIN_SELF_INVOICE]: TXN_BIT_PROFIT_MARGIN_SELF,
  [TXN_IMPORT_OF_GOODS]: TXN_BIT_IMPORT_OF_GOODS,
};

/** IBR-143-OM: Deemed Supply Invoice cannot combine with these Master labels. */
export const IBR_143_EXCLUSION_PARTNER_TXN_TYPES = [
  TXN_CONTINUOUS_SUPPLY,
  TXN_EXPORT_INVOICE,
  TXN_PROFIT_MARGIN_INVOICE,
  TXN_PROFIT_MARGIN_SELF_INVOICE,
] as const;

export const IBR_143_EXCLUSION_PARTNER_BITS: Record<string, string> = {
  [TXN_CONTINUOUS_SUPPLY]: TXN_BIT_CONTINUOUS,
  [TXN_EXPORT_INVOICE]: TXN_BIT_EXPORT,
  [TXN_PROFIT_MARGIN_INVOICE]: TXN_BIT_PROFIT_MARGIN,
  [TXN_PROFIT_MARGIN_SELF_INVOICE]: TXN_BIT_PROFIT_MARGIN_SELF,
};

/** IBR-144-OM: Import of Services (RCM) cannot combine with these Master labels. */
export const IBR_144_EXCLUSION_PARTNER_TXN_TYPES = [
  TXN_EXPORT_INVOICE,
  TXN_PROFIT_MARGIN_INVOICE,
  TXN_PROFIT_MARGIN_SELF_INVOICE,
  TXN_IMPORT_OF_GOODS,
  TXN_SELF_BILLED_INVOICE,
] as const;

export const IBR_144_EXCLUSION_PARTNER_BITS: Record<string, string> = {
  [TXN_EXPORT_INVOICE]: TXN_BIT_EXPORT,
  [TXN_PROFIT_MARGIN_INVOICE]: TXN_BIT_PROFIT_MARGIN,
  [TXN_PROFIT_MARGIN_SELF_INVOICE]: TXN_BIT_PROFIT_MARGIN_SELF,
  [TXN_IMPORT_OF_GOODS]: TXN_BIT_IMPORT_OF_GOODS,
  [TXN_SELF_BILLED_INVOICE]: TXN_BIT_SELF_BILLED,
};

/** IBR-145-OM: Profit Margin Invoice cannot combine with these Master labels. */
export const IBR_145_EXCLUSION_PARTNER_TXN_TYPES = [
  TXN_SUMMARY_INVOICE,
  TXN_CONTINUOUS_SUPPLY,
  TXN_EXPORT_INVOICE,
  TXN_DEEMED_SUPPLY_INVOICE,
  TXN_IMPORT_OF_SERVICES_RCM,
  TXN_SELF_BILLED_INVOICE,
  TXN_IMPORT_OF_GOODS,
] as const;

export const IBR_145_EXCLUSION_PARTNER_BITS: Record<string, string> = {
  [TXN_SUMMARY_INVOICE]: TXN_BIT_SUMMARY,
  [TXN_CONTINUOUS_SUPPLY]: TXN_BIT_CONTINUOUS,
  [TXN_EXPORT_INVOICE]: TXN_BIT_EXPORT,
  [TXN_DEEMED_SUPPLY_INVOICE]: TXN_BIT_DEEMED_SUPPLY,
  [TXN_IMPORT_OF_SERVICES_RCM]: TXN_BIT_IMPORT_SERVICES_RCM,
  [TXN_SELF_BILLED_INVOICE]: TXN_BIT_SELF_BILLED,
  [TXN_IMPORT_OF_GOODS]: TXN_BIT_IMPORT_OF_GOODS,
};

/** IBR-146-OM: Profit Margin Self-Invoice cannot combine with these Master labels. */
export const IBR_146_EXCLUSION_PARTNER_TXN_TYPES = [
  TXN_SUMMARY_INVOICE,
  TXN_CONTINUOUS_SUPPLY,
  TXN_EXPORT_INVOICE,
  TXN_DEEMED_SUPPLY_INVOICE,
  TXN_IMPORT_OF_SERVICES_RCM,
  TXN_PROFIT_MARGIN_INVOICE,
  TXN_SELF_BILLED_INVOICE,
  TXN_IMPORT_OF_GOODS,
] as const;

export const IBR_146_EXCLUSION_PARTNER_BITS: Record<string, string> = {
  [TXN_SUMMARY_INVOICE]: TXN_BIT_SUMMARY,
  [TXN_CONTINUOUS_SUPPLY]: TXN_BIT_CONTINUOUS,
  [TXN_EXPORT_INVOICE]: TXN_BIT_EXPORT,
  [TXN_DEEMED_SUPPLY_INVOICE]: TXN_BIT_DEEMED_SUPPLY,
  [TXN_IMPORT_OF_SERVICES_RCM]: TXN_BIT_IMPORT_SERVICES_RCM,
  [TXN_PROFIT_MARGIN_INVOICE]: TXN_BIT_PROFIT_MARGIN,
  [TXN_SELF_BILLED_INVOICE]: TXN_BIT_SELF_BILLED,
  [TXN_IMPORT_OF_GOODS]: TXN_BIT_IMPORT_OF_GOODS,
};

/** IBR-147-OM: Import of Goods cannot combine with these Master labels. */
export const IBR_147_EXCLUSION_PARTNER_TXN_TYPES = [
  TXN_SUMMARY_INVOICE,
  TXN_CONTINUOUS_SUPPLY,
  TXN_EXPORT_INVOICE,
  TXN_IMPORT_OF_SERVICES_RCM,
  TXN_PROFIT_MARGIN_INVOICE,
  TXN_PROFIT_MARGIN_SELF_INVOICE,
  TXN_SELF_BILLED_INVOICE,
  TXN_ECOMMERCE_TRANSACTION,
] as const;

export const IBR_147_EXCLUSION_PARTNER_BITS: Record<string, string> = {
  [TXN_SUMMARY_INVOICE]: TXN_BIT_SUMMARY,
  [TXN_CONTINUOUS_SUPPLY]: TXN_BIT_CONTINUOUS,
  [TXN_EXPORT_INVOICE]: TXN_BIT_EXPORT,
  [TXN_IMPORT_OF_SERVICES_RCM]: TXN_BIT_IMPORT_SERVICES_RCM,
  [TXN_PROFIT_MARGIN_INVOICE]: TXN_BIT_PROFIT_MARGIN,
  [TXN_PROFIT_MARGIN_SELF_INVOICE]: TXN_BIT_PROFIT_MARGIN_SELF,
  [TXN_SELF_BILLED_INVOICE]: TXN_BIT_SELF_BILLED,
  [TXN_ECOMMERCE_TRANSACTION]: TXN_BIT_ECOMMERCE,
};

/** IBR-148-OM: E-commerce Transaction cannot combine with Profit Margin Self-Invoice. */
export const IBR_148_EXCLUSION_PARTNER_TXN_TYPES = [
  TXN_PROFIT_MARGIN_SELF_INVOICE,
] as const;

export const IBR_148_EXCLUSION_PARTNER_BITS: Record<string, string> = {
  [TXN_PROFIT_MARGIN_SELF_INVOICE]: TXN_BIT_PROFIT_MARGIN_SELF,
};

/** IBR-149-OM: Simplified Tax Invoice cannot combine with these Master labels. */
export const IBR_149_EXCLUSION_PARTNER_TXN_TYPES = [
  TXN_SELF_BILLED_INVOICE,
  TXN_THIRD_PARTY_INVOICE,
  TXN_SUMMARY_INVOICE,
  TXN_EXPORT_INVOICE,
  TXN_IMPORT_OF_SERVICES_RCM,
  TXN_PROFIT_MARGIN_INVOICE,
  TXN_PROFIT_MARGIN_SELF_INVOICE,
  TXN_IMPORT_OF_GOODS,
  TXN_SPECIAL_ZONE_SUPPLIES,
] as const;

export const IBR_149_EXCLUSION_PARTNER_BITS: Record<string, string> = {
  [TXN_SELF_BILLED_INVOICE]: TXN_BIT_SELF_BILLED,
  [TXN_THIRD_PARTY_INVOICE]: TXN_BIT_THIRD_PARTY,
  [TXN_SUMMARY_INVOICE]: TXN_BIT_SUMMARY,
  [TXN_EXPORT_INVOICE]: TXN_BIT_EXPORT,
  [TXN_IMPORT_OF_SERVICES_RCM]: TXN_BIT_IMPORT_SERVICES_RCM,
  [TXN_PROFIT_MARGIN_INVOICE]: TXN_BIT_PROFIT_MARGIN,
  [TXN_PROFIT_MARGIN_SELF_INVOICE]: TXN_BIT_PROFIT_MARGIN_SELF,
  [TXN_IMPORT_OF_GOODS]: TXN_BIT_IMPORT_OF_GOODS,
  [TXN_SPECIAL_ZONE_SUPPLIES]: TXN_BIT_SPECIAL_ZONE,
};

/** Normalize Master label(s) or Peppol 20-bit BTOM-001 cell to a 0/1 string. */
export function normalizeOmanTxnBits(txn: string): string {
  const s = String(txn ?? "").trim();
  const asBits = s.replace(/X/gi, "0");
  if (/^[01]{20}$/.test(asBits)) {
    return asBits;
  }
  if (/[,;|]/.test(s)) {
    const parts = s
      .split(/[,;|]+/)
      .map((part) => part.trim())
      .filter(Boolean);
    return combineOmanTxnTypeBits(...parts.map((part) => normalizeOmanTxnBits(part)));
  }
  return OMAN_TXN_LABEL_TO_BIT[s] ?? "00000000000000000000";
}

/**
 * IBR-138-OM: Self-billed bit cannot be set together with Third-party, Export,
 * Import of Services (RCM), Profit margin, Profit Margin Self-Invoice, or
 * Import of Goods on the same BTOM-001 cell.
 */
export function txnViolatesIbr138Om(txn: string): boolean {
  const bits = normalizeOmanTxnBits(txn);
  if (bits.charAt(2) !== "1") {
    return false;
  }
  return Object.values(SELF_BILLED_EXCLUSION_PARTNER_BITS).some((partnerBit) => {
    const idx = partnerBit.indexOf("1");
    return idx >= 0 && bits.charAt(idx) === "1";
  });
}

/**
 * IBR-140-OM: Summary bit cannot be set together with Continuous, Export,
 * Profit margin, Profit Margin Self-Invoice, or Import of Goods on the
 * same BTOM-001 cell.
 */
export function txnViolatesIbr140Om(txn: string): boolean {
  const bits = normalizeOmanTxnBits(txn);
  if (bits.charAt(4) !== "1") {
    return false;
  }
  return Object.values(IBR_140_EXCLUSION_PARTNER_BITS).some((partnerBit) => {
    const idx = partnerBit.indexOf("1");
    return idx >= 0 && bits.charAt(idx) === "1";
  });
}

/**
 * IBR-141-OM: Continuous Supply bit cannot be set together with Summary,
 * Deemed Supply, Profit margin, Profit Margin Self-Invoice, or Import of
 * Goods on the same BTOM-001 cell.
 */
export function txnViolatesIbr141Om(txn: string): boolean {
  const bits = normalizeOmanTxnBits(txn);
  if (bits.charAt(5) !== "1") {
    return false;
  }
  return Object.values(IBR_141_EXCLUSION_PARTNER_BITS).some((partnerBit) => {
    const idx = partnerBit.indexOf("1");
    return idx >= 0 && bits.charAt(idx) === "1";
  });
}

function txnCombinesSubjectWithAnyPartner(
  txn: string,
  subjectBit: string,
  partnerBits: Record<string, string>
): boolean {
  const bits = normalizeOmanTxnBits(txn);
  const subjectIdx = subjectBit.indexOf("1");
  if (subjectIdx < 0 || bits.charAt(subjectIdx) !== "1") {
    return false;
  }
  return Object.values(partnerBits).some((partnerBit) => {
    const idx = partnerBit.indexOf("1");
    return idx >= 0 && bits.charAt(idx) === "1";
  });
}

/** IBR-142-OM: Export Invoice cannot combine with named exclusion partners. */
export function txnViolatesIbr142Om(txn: string): boolean {
  return txnCombinesSubjectWithAnyPartner(
    txn,
    TXN_BIT_EXPORT,
    IBR_142_EXCLUSION_PARTNER_BITS
  );
}

/** IBR-143-OM: Deemed Supply Invoice cannot combine with named exclusion partners. */
export function txnViolatesIbr143Om(txn: string): boolean {
  return txnCombinesSubjectWithAnyPartner(
    txn,
    TXN_BIT_DEEMED_SUPPLY,
    IBR_143_EXCLUSION_PARTNER_BITS
  );
}

/** IBR-144-OM: Import of Services (RCM) cannot combine with named exclusion partners. */
export function txnViolatesIbr144Om(txn: string): boolean {
  return txnCombinesSubjectWithAnyPartner(
    txn,
    TXN_BIT_IMPORT_SERVICES_RCM,
    IBR_144_EXCLUSION_PARTNER_BITS
  );
}

/** IBR-145-OM: Profit Margin Invoice cannot combine with named exclusion partners. */
export function txnViolatesIbr145Om(txn: string): boolean {
  return txnCombinesSubjectWithAnyPartner(
    txn,
    TXN_BIT_PROFIT_MARGIN,
    IBR_145_EXCLUSION_PARTNER_BITS
  );
}

/** IBR-146-OM: Profit Margin Self-Invoice cannot combine with named exclusion partners. */
export function txnViolatesIbr146Om(txn: string): boolean {
  return txnCombinesSubjectWithAnyPartner(
    txn,
    TXN_BIT_PROFIT_MARGIN_SELF,
    IBR_146_EXCLUSION_PARTNER_BITS
  );
}

/** IBR-147-OM: Import of Goods cannot combine with named exclusion partners. */
export function txnViolatesIbr147Om(txn: string): boolean {
  return txnCombinesSubjectWithAnyPartner(
    txn,
    TXN_BIT_IMPORT_OF_GOODS,
    IBR_147_EXCLUSION_PARTNER_BITS
  );
}

/** IBR-148-OM: E-commerce Transaction cannot combine with Profit Margin Self-Invoice. */
export function txnViolatesIbr148Om(txn: string): boolean {
  return txnCombinesSubjectWithAnyPartner(
    txn,
    TXN_BIT_ECOMMERCE,
    IBR_148_EXCLUSION_PARTNER_BITS
  );
}

/** IBR-149-OM: Simplified Tax Invoice cannot combine with named exclusion partners. */
export function txnViolatesIbr149Om(txn: string): boolean {
  return txnCombinesSubjectWithAnyPartner(
    txn,
    TXN_BIT_SIMPLIFIED,
    IBR_149_EXCLUSION_PARTNER_BITS
  );
}

/**
 * Pack multi-value expand: one same-polarity workbook with one invoice row per
 * alternate OR trigger. Trigger-not-met TCs stay single-row (pack helper).
 * Oman PINT-OM only — curated from FullMatrix Rule: lines.
 */
export type MultiValuePackDimension =
  | "invoiceType"
  | "txnType"
  | "taxCategory";

export type MultiValuePackExpandSpec = {
  dimension: MultiValuePackDimension;
  values: readonly string[];
  /**
   * IBR-176-style: on invalidate/violate mutations, OR `conflictBit` onto each
   * value's Peppol bit (via `valueBits`) so the Excel cell carries both flags.
   */
  conflictBit?: string;
  /**
   * Covoro dropdown description to join with each `values` label on conflict
   * rows (preferred over writing Peppol 0/1 strings).
   */
  conflictLabel?: string;
  valueBits?: Readonly<Record<string, string>>;
};

export const MULTI_VALUE_PACK_EXPAND: Readonly<
  Record<string, MultiValuePackExpandSpec>
> = {
  "ALIGNED-IBRP-028-OM": {
    dimension: "invoiceType",
    values: CN_DN_SELF_BILLED_INVOICE_TYPES,
  },
  "IBR-023-OM": {
    dimension: "invoiceType",
    values: CN_DN_SELF_BILLED_INVOICE_TYPES,
  },
  "IBR-032-OM": {
    dimension: "invoiceType",
    values: CN_DN_SELF_BILLED_INVOICE_TYPES,
  },
  "IBR-177-OM": {
    dimension: "invoiceType",
    values: SELF_BILLED_DOCUMENT_INVOICE_TYPES,
  },
  "CL-11-OM": {
    dimension: "txnType",
    values: [TXN_PROFIT_MARGIN_SELF_INVOICE, TXN_PROFIT_MARGIN_INVOICE],
  },
  "IBR-007-OM": {
    dimension: "txnType",
    values: [
      TXN_IMPORT_OF_GOODS,
      TXN_IMPORT_OF_SERVICES_RCM,
      TXN_PROFIT_MARGIN_SELF_INVOICE,
      TXN_SPECIAL_ZONE_SUPPLIES,
    ],
  },
  "IBR-017-OM": {
    dimension: "txnType",
    values: SELF_BILLED_OR_RCM_TXN_TYPES,
  },
  "IBR-020-OM": {
    dimension: "txnType",
    values: SELF_BILLED_OR_RCM_TXN_TYPES,
  },
  "IBR-037-OM": {
    dimension: "txnType",
    values: SUMMARY_OR_CONTINUOUS_TXN_TYPES,
  },
  "IBR-062-OM": {
    dimension: "taxCategory",
    values: DOC_ALLOWANCE_CHARGE_E_Z_CATEGORIES,
  },
  "IBR-064-OM": {
    dimension: "taxCategory",
    values: DOC_ALLOWANCE_CHARGE_E_Z_CATEGORIES,
  },
  "IBR-069-OM": {
    dimension: "taxCategory",
    values: DOC_ALLOWANCE_CHARGE_E_Z_CATEGORIES,
  },
  "IBR-CL-05-OM": {
    dimension: "taxCategory",
    values: DOC_ALLOWANCE_CHARGE_E_Z_CATEGORIES,
  },
  "IBR-CL-10-OM": {
    dimension: "taxCategory",
    values: DOC_ALLOWANCE_CHARGE_E_Z_CATEGORIES,
  },
  "IBR-176-OM": {
    dimension: "txnType",
    values: PREPAYMENT_EXCLUSION_PARTNER_TXN_TYPES,
    conflictBit: TXN_BIT_PREPAYMENT,
    valueBits: PREPAYMENT_EXCLUSION_PARTNER_BITS,
  },
  "IBR-138-OM": {
    dimension: "txnType",
    values: SELF_BILLED_EXCLUSION_PARTNER_TXN_TYPES,
    conflictLabel: TXN_SELF_BILLED_INVOICE,
    conflictBit: TXN_BIT_SELF_BILLED,
    valueBits: SELF_BILLED_EXCLUSION_PARTNER_BITS,
  },
  "IBR-139-OM": {
    dimension: "txnType",
    values: [TXN_THIRD_PARTY_INVOICE],
    conflictLabel: TXN_SELF_BILLED_INVOICE,
    conflictBit: TXN_BIT_SELF_BILLED,
    valueBits: { [TXN_THIRD_PARTY_INVOICE]: TXN_BIT_THIRD_PARTY },
  },
  "IBR-140-OM": {
    dimension: "txnType",
    values: IBR_140_EXCLUSION_PARTNER_TXN_TYPES,
    conflictLabel: TXN_SUMMARY_INVOICE,
    conflictBit: TXN_BIT_SUMMARY,
    valueBits: IBR_140_EXCLUSION_PARTNER_BITS,
  },
  "IBR-141-OM": {
    dimension: "txnType",
    values: IBR_141_EXCLUSION_PARTNER_TXN_TYPES,
    conflictLabel: TXN_CONTINUOUS_SUPPLY,
    conflictBit: TXN_BIT_CONTINUOUS,
    valueBits: IBR_141_EXCLUSION_PARTNER_BITS,
  },
  "IBR-142-OM": {
    dimension: "txnType",
    values: IBR_142_EXCLUSION_PARTNER_TXN_TYPES,
    conflictLabel: TXN_EXPORT_INVOICE,
    conflictBit: TXN_BIT_EXPORT,
    valueBits: IBR_142_EXCLUSION_PARTNER_BITS,
  },
  "IBR-143-OM": {
    dimension: "txnType",
    values: IBR_143_EXCLUSION_PARTNER_TXN_TYPES,
    conflictLabel: TXN_DEEMED_SUPPLY_INVOICE,
    conflictBit: TXN_BIT_DEEMED_SUPPLY,
    valueBits: IBR_143_EXCLUSION_PARTNER_BITS,
  },
  "IBR-144-OM": {
    dimension: "txnType",
    values: IBR_144_EXCLUSION_PARTNER_TXN_TYPES,
    conflictLabel: TXN_IMPORT_OF_SERVICES_RCM,
    conflictBit: TXN_BIT_IMPORT_SERVICES_RCM,
    valueBits: IBR_144_EXCLUSION_PARTNER_BITS,
  },
  "IBR-145-OM": {
    dimension: "txnType",
    values: IBR_145_EXCLUSION_PARTNER_TXN_TYPES,
    conflictLabel: TXN_PROFIT_MARGIN_INVOICE,
    conflictBit: TXN_BIT_PROFIT_MARGIN,
    valueBits: IBR_145_EXCLUSION_PARTNER_BITS,
  },
  "IBR-146-OM": {
    dimension: "txnType",
    values: IBR_146_EXCLUSION_PARTNER_TXN_TYPES,
    conflictLabel: TXN_PROFIT_MARGIN_SELF_INVOICE,
    conflictBit: TXN_BIT_PROFIT_MARGIN_SELF,
    valueBits: IBR_146_EXCLUSION_PARTNER_BITS,
  },
  "IBR-147-OM": {
    dimension: "txnType",
    values: IBR_147_EXCLUSION_PARTNER_TXN_TYPES,
    conflictLabel: TXN_IMPORT_OF_GOODS,
    conflictBit: TXN_BIT_IMPORT_OF_GOODS,
    valueBits: IBR_147_EXCLUSION_PARTNER_BITS,
  },
  "IBR-148-OM": {
    dimension: "txnType",
    values: IBR_148_EXCLUSION_PARTNER_TXN_TYPES,
    conflictLabel: TXN_ECOMMERCE_TRANSACTION,
    conflictBit: TXN_BIT_ECOMMERCE,
    valueBits: IBR_148_EXCLUSION_PARTNER_BITS,
  },
  "IBR-149-OM": {
    dimension: "txnType",
    values: IBR_149_EXCLUSION_PARTNER_TXN_TYPES,
    conflictLabel: TXN_SIMPLIFIED_TAX_INVOICE,
    conflictBit: TXN_BIT_SIMPLIFIED,
    valueBits: IBR_149_EXCLUSION_PARTNER_BITS,
  },
  "IBR-016-OM": {
    dimension: "txnType",
    values: [
      TXN_FULL_TAX_INVOICE,
      TXN_THIRD_PARTY_INVOICE,
      TXN_SUMMARY_INVOICE,
      TXN_CONTINUOUS_SUPPLY,
      TXN_EXPORT_INVOICE,
      TXN_PROFIT_MARGIN_INVOICE,
      TXN_ECOMMERCE_TRANSACTION,
    ],
  },
  "IBR-019-OM": {
    dimension: "txnType",
    values: [
      TXN_FULL_TAX_INVOICE,
      TXN_SELF_BILLED_INVOICE,
      TXN_THIRD_PARTY_INVOICE,
      TXN_SUMMARY_INVOICE,
      TXN_EXPORT_INVOICE,
      TXN_IMPORT_OF_SERVICES_RCM,
      TXN_PROFIT_MARGIN_SELF_INVOICE,
      TXN_PROFIT_MARGIN_INVOICE,
      TXN_IMPORT_OF_GOODS,
      TXN_SPECIAL_ZONE_SUPPLIES,
    ],
  },
};

/**
 * Expand one polarity template across Credit note / Debit note / Self billed credit note.
 * Title must contain `{type}` (replaced with the invoice type label).
 */
export function expandAcrossCnDnSelfBilledTypes<
  T extends { title: string; invoiceTypeCode: string },
>(template: Omit<T, "invoiceTypeCode"> & { invoiceTypeCode?: string }): T[] {
  return CN_DN_SELF_BILLED_INVOICE_TYPES.map(
    (invoiceTypeCode) =>
      ({
        ...template,
        invoiceTypeCode,
        title: template.title.replace(/\{type\}/g, invoiceTypeCode),
      }) as T
  );
}

/**
 * Expand one polarity template across Self billed credit note (261) + Self-billed invoice (389).
 * Title must contain `{type}` (replaced with the invoice type label).
 */
export function expandAcrossSelfBilledDocumentTypes<
  T extends { title: string; invoiceTypeCode: string },
>(template: Omit<T, "invoiceTypeCode"> & { invoiceTypeCode?: string }): T[] {
  return SELF_BILLED_DOCUMENT_INVOICE_TYPES.map(
    (invoiceTypeCode) =>
      ({
        ...template,
        invoiceTypeCode,
        title: template.title.replace(/\{type\}/g, invoiceTypeCode),
      }) as T
  );
}

/** Split a BTOM-001 Excel cell into Master description labels. */
export function splitOmanTxnMasterLabels(cell: string): string[] {
  return String(cell ?? "")
    .split(/[,;|]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * IBR-177-OM: Self-billed document invoice types may only use Self-billed /
 * RCM / Profit Margin Self-Invoice / Import of Goods Master labels on
 * BTOM-001. Used to skip invoice-type × txn pairs that would be rejected
 * by IBR-177 before an IBR-138…149 mutual-exclusion assertion.
 */
export function isIbr177CompatibleInvoiceTxnPair(
  invoiceTypeCode: string,
  txnCell: string
): boolean {
  if (
    !(SELF_BILLED_DOCUMENT_INVOICE_TYPES as readonly string[]).includes(
      invoiceTypeCode
    )
  ) {
    return true;
  }
  const labels = splitOmanTxnMasterLabels(txnCell);
  if (labels.length === 0) {
    return false;
  }
  return labels.every((label) =>
    (SELF_BILLED_OR_RCM_TXN_TYPES as readonly string[]).includes(label)
  );
}

/**
 * Multiply IBR-138…149 polarity scenarios across every Master invoice type
 * (`OMAN_INVOICE_TYPES` / `invoiceTypeCodeValidTestData`). Title gains
 * ` | Invoice Type: {label}` before the rule id. Skips Self-billed document
 * × txn cells that IBR-177 would reject first.
 */
export function expandTxnExclusionAcrossAllInvoiceTypes<
  T extends {
    title: string;
    invoiceTransactionTypeCode: string;
    invoiceTypeCode?: string;
  },
>(scenarios: readonly T[]): Array<T & { invoiceTypeCode: string }> {
  const out: Array<T & { invoiceTypeCode: string }> = [];
  for (const scenario of scenarios) {
    for (const invoiceTypeCode of OMAN_INVOICE_TYPES) {
      if (
        !isIbr177CompatibleInvoiceTxnPair(
          invoiceTypeCode,
          scenario.invoiceTransactionTypeCode
        )
      ) {
        continue;
      }
      out.push({
        ...scenario,
        invoiceTypeCode,
        title: scenario.title.replace(
          / \((IBR-\d+-OM)\)$/,
          ` | Invoice Type: ${invoiceTypeCode} ($1)`
        ),
      });
    }
  }
  return out;
}

/**
 * Expand one polarity across Summary / Deemed Supply / Profit Margin Self-Invoice.
 * Title must contain `{type}`. When `withPrepaymentBit`, cell is partner⊕Prepayment
 * bits; otherwise Master label (Allowed: partner without Prepayment).
 */
export function expandAcrossPrepaymentExclusionPartners<
  T extends {
    title: string;
    conflictingTxnType: string;
    invoiceTransactionTypeCode: string;
  },
>(
  template: Omit<T, "conflictingTxnType" | "invoiceTransactionTypeCode"> & {
    conflictingTxnType?: string;
    invoiceTransactionTypeCode?: string;
    withPrepaymentBit?: boolean;
  }
): T[] {
  const withPrepayment = Boolean(template.withPrepaymentBit);
  return PREPAYMENT_EXCLUSION_PARTNER_TXN_TYPES.map((partner) => {
    const partnerBit = PREPAYMENT_EXCLUSION_PARTNER_BITS[partner]!;
    const invoiceTransactionTypeCode = withPrepayment
      ? combineOmanTxnTypeBits(partnerBit, TXN_BIT_PREPAYMENT)
      : partner;
    const { withPrepaymentBit: _omit, ...rest } = template;
    return {
      ...rest,
      conflictingTxnType: partner,
      invoiceTransactionTypeCode,
      title: template.title.replace(/\{type\}/g, partner),
    } as T;
  });
}

/**
 * Expand one polarity across Third-party / Export / RCM / Profit margin /
 * Profit Margin Self-Invoice / Import of Goods. Title must contain `{type}`.
 * When `withSelfBilledBit`, cell is joined Master descriptions
 * (`Self-billed Invoice, {partner}`); otherwise partner description alone.
 */
export function expandAcrossSelfBilledExclusionPartners<
  T extends {
    title: string;
    conflictingTxnType: string;
    invoiceTransactionTypeCode: string;
  },
>(
  template: Omit<T, "conflictingTxnType" | "invoiceTransactionTypeCode"> & {
    conflictingTxnType?: string;
    invoiceTransactionTypeCode?: string;
    withSelfBilledBit?: boolean;
  }
): T[] {
  const withSelfBilled = Boolean(template.withSelfBilledBit);
  return SELF_BILLED_EXCLUSION_PARTNER_TXN_TYPES.map((partner) => {
    const invoiceTransactionTypeCode = withSelfBilled
      ? combineOmanTxnTypeDescriptions(TXN_SELF_BILLED_INVOICE, partner)
      : partner;
    const { withSelfBilledBit: _omit, ...rest } = template;
    return {
      ...rest,
      conflictingTxnType: partner,
      invoiceTransactionTypeCode,
      title: template.title.replace(/\{type\}/g, partner),
    } as T;
  });
}

/**
 * Expand one polarity across IBR-140-OM Summary exclusion partners.
 * Title must contain `{type}`. Excel cell is the partner Master description,
 * or comma-joined Summary + partner descriptions when `withSummaryBit`.
 */
export function expandAcrossIbr140ExclusionPartners<
  T extends {
    title: string;
    conflictingTxnType: string;
    invoiceTransactionTypeCode: string;
  },
>(
  template: Omit<T, "conflictingTxnType" | "invoiceTransactionTypeCode"> & {
    conflictingTxnType?: string;
    invoiceTransactionTypeCode?: string;
    withSummaryBit?: boolean;
  }
): T[] {
  const withSummary = Boolean(template.withSummaryBit);
  return IBR_140_EXCLUSION_PARTNER_TXN_TYPES.map((partner) => {
    const invoiceTransactionTypeCode = withSummary
      ? combineOmanTxnTypeDescriptions(TXN_SUMMARY_INVOICE, partner)
      : partner;
    const { withSummaryBit: _omit, ...rest } = template;
    return {
      ...rest,
      conflictingTxnType: partner,
      invoiceTransactionTypeCode,
      title: template.title.replace(/\{type\}/g, partner),
    } as T;
  });
}

/**
 * Expand one polarity across IBR-141-OM Continuous Supply exclusion partners.
 * Title must contain `{type}`. Excel cell is the partner Master description,
 * or comma-joined Continuous + partner descriptions when `withContinuousBit`.
 */
export function expandAcrossIbr141ExclusionPartners<
  T extends {
    title: string;
    conflictingTxnType: string;
    invoiceTransactionTypeCode: string;
  },
>(
  template: Omit<T, "conflictingTxnType" | "invoiceTransactionTypeCode"> & {
    conflictingTxnType?: string;
    invoiceTransactionTypeCode?: string;
    withContinuousBit?: boolean;
  }
): T[] {
  const withContinuous = Boolean(template.withContinuousBit);
  return IBR_141_EXCLUSION_PARTNER_TXN_TYPES.map((partner) => {
    const invoiceTransactionTypeCode = withContinuous
      ? combineOmanTxnTypeDescriptions(TXN_CONTINUOUS_SUPPLY, partner)
      : partner;
    const { withContinuousBit: _omit, ...rest } = template;
    return {
      ...rest,
      conflictingTxnType: partner,
      invoiceTransactionTypeCode,
      title: template.title.replace(/\{type\}/g, partner),
    } as T;
  });
}

/**
 * Expand one polarity across a BTOM-001 exclusion partner list.
 * Title must contain `{type}`. Excel cell is the partner Master description,
 * or comma-joined subject + partner descriptions when `withSubject`.
 */
export function expandAcrossTxnExclusionPartners<
  T extends {
    title: string;
    conflictingTxnType: string;
    invoiceTransactionTypeCode: string;
  },
>(
  subjectLabel: string,
  partners: readonly string[],
  template: Omit<T, "conflictingTxnType" | "invoiceTransactionTypeCode"> & {
    conflictingTxnType?: string;
    invoiceTransactionTypeCode?: string;
    withSubject?: boolean;
  }
): T[] {
  const withSubject = Boolean(template.withSubject);
  return partners.map((partner) => {
    const invoiceTransactionTypeCode = withSubject
      ? combineOmanTxnTypeDescriptions(subjectLabel, partner)
      : partner;
    const { withSubject: _omit, ...rest } = template;
    return {
      ...rest,
      conflictingTxnType: partner,
      invoiceTransactionTypeCode,
      title: template.title.replace(/\{type\}/g, partner),
    } as T;
  });
}

function buildTxnPairExclusionScenarios(
  ruleId: string,
  subjectLabel: string,
  partners: readonly string[],
  /** Forbidden partner labels listed after "without" when the subject stands alone. */
  subjectAloneWithoutList: string
): TxnPairExclusionScenario[] {
  return expandTxnExclusionAcrossAllInvoiceTypes([
    ...expandAcrossTxnExclusionPartners<TxnPairExclusionScenario>(
      subjectLabel,
      partners,
      {
        ruleId,
        title: `Given {type} without ${subjectLabel} — When the invoice is uploaded — Then the invoice should be accepted. (${ruleId})`,
        withSubject: false,
        shouldError: false,
        expectedErrorField: INVOICE_TRANSACTION_TYPE_CODE_FIELD,
      }
    ),
    ...expandAcrossTxnExclusionPartners<TxnPairExclusionScenario>(
      subjectLabel,
      partners,
      {
        ruleId,
        title: `Given ${subjectLabel} together with {type} — When the invoice is uploaded — Then the invoice should be rejected with an error. (${ruleId})`,
        withSubject: true,
        shouldError: true,
        expectedErrorField: INVOICE_TRANSACTION_TYPE_CODE_FIELD,
      }
    ),
    {
      ruleId,
      title: `Given ${subjectLabel} alone without ${subjectAloneWithoutList} — When the invoice is uploaded — Then the invoice should be accepted. (${ruleId})`,
      conflictingTxnType: "",
      invoiceTransactionTypeCode: subjectLabel,
      shouldError: false,
      expectedErrorField: INVOICE_TRANSACTION_TYPE_CODE_FIELD,
    },
  ]);
}

/**
 * Expand one polarity template across Self-billed / RCM / PM-Self / Import Goods.
 * Title must contain `{txn}` (replaced with the transaction type label).
 */
export function expandAcrossSelfBilledOrRcmTxnTypes<
  T extends { title: string; invoiceTransactionTypeCode: string },
>(
  template: Omit<T, "invoiceTransactionTypeCode"> & {
    invoiceTransactionTypeCode?: string;
  }
): T[] {
  return SELF_BILLED_OR_RCM_TXN_TYPES.map(
    (invoiceTransactionTypeCode) =>
      ({
        ...template,
        invoiceTransactionTypeCode,
        title: template.title.replace(/\{txn\}/g, invoiceTransactionTypeCode),
      }) as T
  );
}

/**
 * Expand one polarity across IBR-007-OM seller-scheme txn types
 * (Import of Goods / Import of Services RCM / Profit Margin Self-Invoice /
 * Special Zone Supplies). Title must contain `{txn}`.
 */
export function expandAcrossIbr007SellerSchemeTxnTypes<
  T extends { title: string; invoiceTransactionTypeCode: string },
>(
  template: Omit<T, "invoiceTransactionTypeCode"> & {
    invoiceTransactionTypeCode?: string;
  }
): T[] {
  return MULTI_VALUE_PACK_EXPAND["IBR-007-OM"].values.map(
    (invoiceTransactionTypeCode) =>
      ({
        ...template,
        invoiceTransactionTypeCode,
        title: template.title.replace(/\{txn\}/g, invoiceTransactionTypeCode),
      }) as T
  );
}

/**
 * Expand one polarity across IBR-016-OM buyer id/VATIN txn types
 * (Full Tax / Third-party / Summary / Continuous / Export / Profit margin /
 * E-commerce). Title must contain `{txn}`.
 */
export function expandAcrossIbr016BuyerIdOrVatinTxnTypes<
  T extends { title: string; invoiceTransactionTypeCode: string },
>(
  template: Omit<T, "invoiceTransactionTypeCode"> & {
    invoiceTransactionTypeCode?: string;
  }
): T[] {
  return MULTI_VALUE_PACK_EXPAND["IBR-016-OM"].values.map(
    (invoiceTransactionTypeCode) =>
      ({
        ...template,
        invoiceTransactionTypeCode,
        title: template.title.replace(/\{txn\}/g, invoiceTransactionTypeCode),
      }) as T
  );
}

/**
 * Expand one polarity across IBR-019-OM buyer-address txn types
 * (Full Tax / Self-billed / Third-party / Summary / Export / RCM /
 * Profit Margin Self-Invoice / Profit Margin / Import of Goods /
 * Special Zone Supplies). Title must contain `{txn}`.
 */
export function expandAcrossIbr019BuyerAddressTxnTypes<
  T extends { title: string; invoiceTransactionTypeCode: string },
>(
  template: Omit<T, "invoiceTransactionTypeCode"> & {
    invoiceTransactionTypeCode?: string;
  }
): T[] {
  return MULTI_VALUE_PACK_EXPAND["IBR-019-OM"].values.map(
    (invoiceTransactionTypeCode) =>
      ({
        ...template,
        invoiceTransactionTypeCode,
        title: template.title.replace(/\{txn\}/g, invoiceTransactionTypeCode),
      }) as T
  );
}

/**
 * Expand one polarity across Summary Invoice + Continuous Supply (IBR-037-OM).
 * Title must contain `{txn}`.
 */
export function expandAcrossSummaryOrContinuousTxnTypes<
  T extends { title: string; invoiceTransactionTypeCode: string },
>(
  template: Omit<T, "invoiceTransactionTypeCode"> & {
    invoiceTransactionTypeCode?: string;
  }
): T[] {
  return SUMMARY_OR_CONTINUOUS_TXN_TYPES.map(
    (invoiceTransactionTypeCode) =>
      ({
        ...template,
        invoiceTransactionTypeCode,
        title: template.title.replace(/\{txn\}/g, invoiceTransactionTypeCode),
      }) as T
  );
}

/**
 * Expand one polarity template across Exempt + Zero rated for doc allowance/charge.
 * Title must contain `{cat}` (replaced with the VAT category label).
 */
export function expandAcrossDocEzTaxCategories<
  T extends { title: string; vatCategory: string },
>(template: Omit<T, "vatCategory"> & { vatCategory?: string }): T[] {
  return DOC_ALLOWANCE_CHARGE_E_Z_CATEGORIES.map((vatCategory) => {
    const exemptionReason =
      vatCategory === ZERO_RATED_TAX_CATEGORY_CODE
        ? TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE
        : TAX_EXEMPTION_REASON_SAMPLE;
    return {
      ...template,
      vatCategory,
      exemptionReason:
        (template as { exemptionReason?: string }).exemptionReason === ""
          ? ""
          : (template as { exemptionReason?: string }).exemptionReason ??
            exemptionReason,
      title: template.title.replace(/\{cat\}/g, vatCategory),
    } as unknown as T;
  });
}

function zeroRatedReasonShortLabel(label: string): string {
  return label.replace(/^Zero-rated\s*-?\s*/i, "").trim();
}

/** IBR-CL-10-OM Allowed: remaining VATZR labels after the Qualifying Food Items sample. */
export function expandIbrCl10RemainingZeroRatedReasons(): DocAllowanceExemptionClScenario[] {
  return ZERO_RATED_EXEMPTION_REASON_LABELS.filter(
    (label) => label !== TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE
  ).map((exemptionReason) => ({
    ruleId: "IBR-CL-10-OM",
    title: `Given a Zero rated document allowance — When the exemption reason is ${zeroRatedReasonShortLabel(exemptionReason)} — Then the invoice should be accepted. (IBR-CL-10-OM)`,
    vatCategory: ZERO_RATED_TAX_CATEGORY_CODE,
    exemptionReason,
    amount: "10",
    shouldError: false,
    expectedErrorField: TAX_EXEMPTION_REASON_ALLOWANCES_FIELD,
  }));
}


// ---------------------------------------------------------------------------
// vatCategoryTaxRate
// ---------------------------------------------------------------------------
/** ALIGNED-IBRP-E-05-OM / O-05-OM: E or O must not contain IBT-152 rate. */
export const VAT_CATEGORY_RATE_FORBIDDEN_SCENARIOS: VatCategoryTaxRateScenario[] =
  [
    {
      ruleId: "ALIGNED-IBRP-E-05-OM",
      title:
        "Given Exempt VAT — When tax rate is left empty — Then the invoice should be accepted. (ALIGNED-IBRP-E-05-OM)",
      taxCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      taxRate: null,
      shouldError: false,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-E-05-OM",
      title:
        "Given Exempt VAT — When tax rate is 5 — Then the invoice should be rejected with an error. (ALIGNED-IBRP-E-05-OM)",
      taxCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      shouldError: true,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-E-05-OM",
      title:
        "Given Exempt VAT — When tax rate is only spaces — Then the invoice should be rejected with an error. (ALIGNED-IBRP-E-05-OM)",
      taxCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      taxRate: "   ",
      shouldError: true,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      // Excel TC-16 Positive*: non-E category may carry a valid rate (Standard=5).
      ruleId: "ALIGNED-IBRP-E-05-OM",
      title:
        "Given a VAT category that is not Exempt — When tax rate is 5 — Then the invoice should be accepted. (ALIGNED-IBRP-E-05-OM)",
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      shouldError: false,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-O-05-OM",
      title:
        "Given Not subject to VAT — When tax rate is left empty — Then the invoice should be accepted. (ALIGNED-IBRP-O-05-OM)",
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxRate: null,
      shouldError: false,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-O-05-OM",
      title:
        "Given Not subject to VAT — When tax rate is 5 — Then the invoice should be rejected with an error. (ALIGNED-IBRP-O-05-OM)",
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      shouldError: true,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-O-05-OM",
      title:
        "Given Not subject to VAT — When tax rate is only spaces — Then the invoice should be rejected with an error. (ALIGNED-IBRP-O-05-OM)",
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxRate: "   ",
      shouldError: true,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-O-05-OM",
      title:
        "Given a VAT category other than Not subject — When tax rate is 5 — Then the invoice should be accepted. (ALIGNED-IBRP-O-05-OM)",
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      shouldError: false,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    // IBR-061-OM / IBR-067-OM: breakdown/line rate forbidden for O / E (Covoro Tax Rate).
    {
      ruleId: "IBR-067-OM",
      title:
        "Given Exempt VAT — When tax rate is left empty — Then the invoice should be accepted. (IBR-067-OM)",
      taxCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      taxRate: null,
      shouldError: false,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      ruleId: "IBR-067-OM",
      title:
        "Given Exempt VAT — When tax rate is 5 — Then the invoice should be rejected with an error. (IBR-067-OM)",
      taxCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      shouldError: true,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      ruleId: "IBR-061-OM",
      title:
        "Given Not subject to VAT — When tax rate is left empty — Then the invoice should be accepted. (IBR-061-OM)",
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxRate: null,
      shouldError: false,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      ruleId: "IBR-061-OM",
      title:
        "Given Not subject to VAT — When tax rate is 5 — Then the invoice should be rejected with an error. (IBR-061-OM)",
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      shouldError: true,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
  ];

/** ALIGNED-IBRP-S-05-OM / IBR-053-OM: Standard → rate MUST be 5. */
export const STANDARD_TAX_RATE_SCENARIOS: VatCategoryTaxRateScenario[] = [
  {
    ruleId: "ALIGNED-IBRP-S-05-OM",
    title:
      "Given Standard rate VAT — When tax rate is 5 — Then the invoice should be accepted. (ALIGNED-IBRP-S-05-OM)",
    taxCategory: STANDARD_TAX_CATEGORY_CODE,
    taxRate: TAX_RATE_STANDARD_OMAN,
    shouldError: false,
    expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
  },
  {
    ruleId: "ALIGNED-IBRP-S-05-OM",
    title:
      "Given Standard rate VAT — When tax rate is 0 — Then the invoice should be rejected with an error. (ALIGNED-IBRP-S-05-OM)",
    taxCategory: STANDARD_TAX_CATEGORY_CODE,
    taxRate: TAX_RATE_ZERO,
    shouldError: true,
    expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
  },
  {
    ruleId: "ALIGNED-IBRP-S-05-OM",
    title:
      "Given Standard rate VAT — When tax rate is left empty — Then the invoice should be rejected with an error. (ALIGNED-IBRP-S-05-OM)",
    taxCategory: STANDARD_TAX_CATEGORY_CODE,
    taxRate: null,
    shouldError: true,
    expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
  },
  {
    ruleId: "ALIGNED-IBRP-S-05-OM",
    title:
      "Given Standard rate VAT — When tax rate is only spaces — Then the invoice should be rejected with an error. (ALIGNED-IBRP-S-05-OM)",
    taxCategory: STANDARD_TAX_CATEGORY_CODE,
    taxRate: "   ",
    shouldError: true,
    expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
  },
  ];

/**
 * IBR-104-OM: VAT breakdown (IBG-23) for VAT accounting currency, where
 * VAT category code (IBT-118) is S, VAT category rate (IBT-119) MUST be 5.
 * Covoro has no IBT-006 column — USD + source currency + tax-in-accounting
 * amount (IBR-034 pattern). Line Tax Category / Tax Rate proxy IBT-118 / IBT-119.
 */
export const VAT_ACCOUNTING_CURRENCY_STANDARD_RATE_SCENARIOS: VatCategoryTaxRateScenario[] =
  [
    {
      ruleId: "IBR-104-OM",
      title:
        "Given VAT accounting currency and Standard rate — When tax rate is 5 — Then the invoice should be accepted. (IBR-104-OM)",
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      shouldError: false,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      ruleId: "IBR-104-OM",
      title:
        "Given VAT accounting currency and Standard rate — When tax rate is 0 — Then the invoice should be rejected with an error. (IBR-104-OM)",
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_ZERO,
      shouldError: true,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      ruleId: "IBR-104-OM",
      title:
        "Given VAT accounting currency and Zero rated VAT — When tax rate is 5 — Then the invoice should be rejected with an error. (IBR-104-OM)",
      taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      shouldError: true,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
  ];

/** ALIGNED-IBRP-Z-05-OM: Zero rated → rate MUST be 0. */
export const ZERO_RATED_TAX_RATE_SCENARIOS: VatCategoryTaxRateScenario[] = [
  {
    ruleId: "ALIGNED-IBRP-Z-05-OM",
    title:
      "Given Zero rated VAT — When tax rate is 0 — Then the invoice should be accepted. (ALIGNED-IBRP-Z-05-OM)",
    taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
    taxRate: TAX_RATE_ZERO,
    shouldError: false,
    expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
  },
  {
    ruleId: "ALIGNED-IBRP-Z-05-OM",
    title:
      "Given Zero rated VAT — When tax rate is 5 — Then the invoice should be rejected with an error. (ALIGNED-IBRP-Z-05-OM)",
    taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
    taxRate: TAX_RATE_STANDARD_OMAN,
    shouldError: true,
    expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
  },
  {
    ruleId: "ALIGNED-IBRP-Z-05-OM",
    title:
      "Given Zero rated VAT — When tax rate is left empty — Then the invoice should be rejected with an error. (ALIGNED-IBRP-Z-05-OM)",
    taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
    taxRate: null,
    shouldError: true,
    expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
  },
  {
    ruleId: "ALIGNED-IBRP-Z-05-OM",
    title:
      "Given Zero rated VAT — When tax rate is only spaces — Then the invoice should be rejected with an error. (ALIGNED-IBRP-Z-05-OM)",
    taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
    taxRate: "   ",
    shouldError: true,
    expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
  },
];

/**
 * ALIGNED-IBRP-048: each VAT breakdown must have VAT category rate (IBT-119),
 * except when not subject to VAT (O). Covoro drives this via line Tax Rate.
 */
export const VAT_BREAKDOWN_RATE_REQUIRED_SCENARIOS: VatCategoryTaxRateScenario[] =
  [
    {
      ruleId: "ALIGNED-IBRP-048",
      title:
        "Given Standard rate VAT — When tax rate is 5 — Then the invoice should be accepted. (ALIGNED-IBRP-048)",
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      shouldError: false,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-048",
      title:
        "Given Standard rate VAT — When tax rate is left empty — Then the invoice should be rejected with an error. (ALIGNED-IBRP-048)",
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      taxRate: null,
      shouldError: true,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-048",
      title:
        "Given Zero rated VAT — When tax rate is 0 — Then the invoice should be accepted. (ALIGNED-IBRP-048)",
      taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_ZERO,
      shouldError: false,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-048",
      title:
        "Given Zero rated VAT — When tax rate is left empty — Then the invoice should be rejected with an error. (ALIGNED-IBRP-048)",
      taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      taxRate: null,
      shouldError: true,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-048",
      title:
        "Given Not subject to VAT — When tax rate is left empty — Then the invoice should be accepted. (ALIGNED-IBRP-048)",
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxRate: null,
      shouldError: false,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
  ];


// ---------------------------------------------------------------------------
// vatExemptionReason
// ---------------------------------------------------------------------------
/**
 * IBR-069-OM: E or Z breakdown/line must have exemption reason code.
 * IBR-070-OM: O must NOT have exemption reason code.
 * ALIGNED-IBRP-S-10-OM: S must not have IBT-121 code or IBT-120 text.
 */
export const VAT_EXEMPTION_REASON_CONDITIONAL_SCENARIOS: VatExemptionReasonScenario[] =
  [
    {
      ruleId: "IBR-069-OM",
      title:
        "Given Exempt VAT — When an exemption reason is provided — Then the invoice should be accepted. (IBR-069-OM)",
      taxCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_SAMPLE,
      taxRate: null,
      shouldError: false,
      expectedErrorField: TAX_EXEMPTION_REASON_CODE_FIELD,
    },
    {
      ruleId: "IBR-069-OM",
      title:
        "Given Exempt VAT — When exemption reason is left empty — Then the invoice should be rejected with an error. (IBR-069-OM)",
      taxCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      taxExemptionReasonCode: null,
      taxRate: null,
      shouldError: true,
      expectedErrorField: TAX_EXEMPTION_REASON_CODE_FIELD,
    },
    {
      ruleId: "IBR-069-OM",
      title:
        "Given Zero rated VAT — When an exemption reason is provided — Then the invoice should be accepted. (IBR-069-OM)",
      taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
      taxRate: TAX_RATE_ZERO,
      shouldError: false,
      expectedErrorField: TAX_EXEMPTION_REASON_CODE_FIELD,
    },
    {
      ruleId: "IBR-069-OM",
      title:
        "Given Zero rated VAT — When exemption reason is left empty — Then the invoice should be rejected with an error. (IBR-069-OM)",
      taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      taxExemptionReasonCode: null,
      taxRate: TAX_RATE_ZERO,
      shouldError: true,
      expectedErrorField: TAX_EXEMPTION_REASON_CODE_FIELD,
    },
    {
      ruleId: "IBR-070-OM",
      title:
        "Given Not subject to VAT — When exemption reason is left empty — Then the invoice should be accepted. (IBR-070-OM)",
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxExemptionReasonCode: null,
      taxRate: null,
      shouldError: false,
      expectedErrorField: TAX_EXEMPTION_REASON_CODE_FIELD,
    },
    {
      ruleId: "IBR-070-OM",
      title:
        "Given Not subject to VAT — When an exemption reason is provided — Then the invoice should be rejected with an error. (IBR-070-OM)",
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_SAMPLE,
      taxRate: null,
      shouldError: true,
      expectedErrorField: TAX_EXEMPTION_REASON_CODE_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-S-10-OM",
      title:
        "Given Standard rate VAT — When exemption reason is left empty — Then the invoice should be accepted. (ALIGNED-IBRP-S-10-OM)",
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      taxExemptionReasonCode: null,
      taxExemptionReasonText: "",
      taxRate: TAX_RATE_STANDARD_OMAN,
      shouldError: false,
      expectedErrorField: TAX_EXEMPTION_REASON_CODE_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-S-10-OM",
      title:
        "Given Standard rate VAT — When an exemption reason code is provided — Then the invoice should be rejected with an error. (ALIGNED-IBRP-S-10-OM)",
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_SAMPLE,
      taxExemptionReasonText: "",
      taxRate: TAX_RATE_STANDARD_OMAN,
      shouldError: true,
      expectedErrorField: TAX_EXEMPTION_REASON_CODE_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-S-10-OM",
      title:
        "Given Standard rate VAT — When exemption reason text is provided — Then the invoice should be rejected with an error. (ALIGNED-IBRP-S-10-OM)",
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      taxExemptionReasonCode: null,
      taxExemptionReasonText: TAX_EXEMPTION_REASON_TEXT_SAMPLE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      shouldError: true,
      expectedErrorField: TAX_EXEMPTION_REASON_TEXT_FIELD,
    },
  ];


// ---------------------------------------------------------------------------
// precedingInvoice
// ---------------------------------------------------------------------------
/**
 * ALIGNED-IBRP-028-OM: preceding reference (IBG-03) when CN/DN/self-billed CN.
 * IBR-032-OM: preceding reference + issue date + UUID (BTOM-031) for those types.
 * Accepted 028 cases also satisfy 032 so polarity is honest against the portal.
 * Live Playwright: one invoice type per test (CN / DN / Self billed).
 * Static packs: one polarity workbook with all three types (see pack helper).
 * Excel TC whitespace/omit negatives collapse to empty preceding ref (same cell).
 */
export const PRECEDING_INVOICE_SCENARIOS: PrecedingInvoiceScenario[] = [
  ...expandAcrossCnDnSelfBilledTypes<PrecedingInvoiceScenario>({
    ruleId: "ALIGNED-IBRP-028-OM",
    title:
      "Given {type} — When a preceding invoice reference is provided — Then the invoice should be accepted. (ALIGNED-IBRP-028-OM)",
    precedingInvoiceReference: "INV-PREV-028",
    precedingInvoiceIssueDate: "2026-01-15",
    precedingInvoiceUuid: PRECEDING_INVOICE_UUID_SAMPLE,
    creditDebitNoteReasonCode: CREDIT_DEBIT_REASON_SAMPLE,
    shouldError: false,
    expectedErrorField: PRECEDING_INVOICE_REFERENCE_FIELD,
  }),
  ...expandAcrossCnDnSelfBilledTypes<PrecedingInvoiceScenario>({
    ruleId: "ALIGNED-IBRP-028-OM",
    title:
      "Given {type} — When preceding invoice reference is left empty — Then the invoice should be rejected with an error. (ALIGNED-IBRP-028-OM)",
    precedingInvoiceReference: "",
    precedingInvoiceIssueDate: "",
    precedingInvoiceUuid: "",
    creditDebitNoteReasonCode: CREDIT_DEBIT_REASON_SAMPLE,
    shouldError: true,
    expectedErrorField: PRECEDING_INVOICE_REFERENCE_FIELD,
  }),
  {
    ruleId: "ALIGNED-IBRP-028-OM",
    title:
      "Given a Commercial invoice — When preceding invoice reference is left empty — Then the invoice should be accepted. (ALIGNED-IBRP-028-OM)",
    invoiceTypeCode: INVOICE_TYPE_COMMERCIAL_INVOICE,
    precedingInvoiceReference: "",
    precedingInvoiceIssueDate: "",
    precedingInvoiceUuid: "",
    creditDebitNoteReasonCode: "",
    shouldError: false,
    expectedErrorField: PRECEDING_INVOICE_REFERENCE_FIELD,
  },
  ...expandAcrossCnDnSelfBilledTypes<PrecedingInvoiceScenario>({
    ruleId: "IBR-032-OM",
    title:
      "Given {type} — When preceding reference, date, and UUID are provided — Then the invoice should be accepted. (IBR-032-OM)",
    precedingInvoiceReference: "INV-PREV-032",
    precedingInvoiceIssueDate: "2026-01-15",
    precedingInvoiceUuid: PRECEDING_INVOICE_UUID_SAMPLE,
    creditDebitNoteReasonCode: CREDIT_DEBIT_REASON_SAMPLE,
    shouldError: false,
    expectedErrorField: PRECEDING_INVOICE_UUID_FIELD,
  }),
  ...expandAcrossCnDnSelfBilledTypes<PrecedingInvoiceScenario>({
    ruleId: "IBR-032-OM",
    title:
      "Given {type} — When preceding reference and date are provided but UUID is left empty — Then the invoice should be rejected with an error. (IBR-032-OM)",
    precedingInvoiceReference: "INV-PREV-032",
    precedingInvoiceIssueDate: "2026-01-15",
    precedingInvoiceUuid: "",
    creditDebitNoteReasonCode: CREDIT_DEBIT_REASON_SAMPLE,
    shouldError: true,
    expectedErrorField: PRECEDING_INVOICE_UUID_FIELD,
  }),
];

/**
 * IBR-002-OM: Unique Identifier Number must match UUID version 5 when provided.
 * Covoro column sits with preceding-invoice fields (used as BTOM-031 on CN/DN).
 */
export const UUID_VERSION5_SCENARIOS: PrecedingInvoiceScenario[] = [
  {
    ruleId: "IBR-002-OM",
    title:
      "Given a Credit note — When the UUID is version 5 — Then the invoice should be accepted. (IBR-002-OM)",
    invoiceTypeCode: INVOICE_TYPE_CREDIT_NOTE,
    precedingInvoiceReference: "INV-PREV-002",
    precedingInvoiceIssueDate: "2026-01-15",
    precedingInvoiceUuid: PRECEDING_INVOICE_UUID_SAMPLE,
    creditDebitNoteReasonCode: CREDIT_DEBIT_REASON_SAMPLE,
    shouldError: false,
    expectedErrorField: PRECEDING_INVOICE_UUID_FIELD,
  },
  {
    ruleId: "IBR-002-OM",
    title:
      "Given a Credit note — When the UUID is version 4 — Then the invoice should be rejected with an error. (IBR-002-OM)",
    invoiceTypeCode: INVOICE_TYPE_CREDIT_NOTE,
    precedingInvoiceReference: "INV-PREV-002",
    precedingInvoiceIssueDate: "2026-01-15",
    precedingInvoiceUuid: UUID_V4_INVALID_FOR_IBR_002,
    creditDebitNoteReasonCode: CREDIT_DEBIT_REASON_SAMPLE,
    shouldError: true,
    expectedErrorField: PRECEDING_INVOICE_UUID_FIELD,
  },
  {
    ruleId: "IBR-002-OM",
    title:
      "Given a Credit note — When the UUID is not a valid UUID — Then the invoice should be rejected with an error. (IBR-002-OM)",
    invoiceTypeCode: INVOICE_TYPE_CREDIT_NOTE,
    precedingInvoiceReference: "INV-PREV-002",
    precedingInvoiceIssueDate: "2026-01-15",
    precedingInvoiceUuid: UUID_GARBAGE_INVALID_FOR_IBR_002,
    creditDebitNoteReasonCode: CREDIT_DEBIT_REASON_SAMPLE,
    shouldError: true,
    expectedErrorField: PRECEDING_INVOICE_UUID_FIELD,
  },
];


// ---------------------------------------------------------------------------
// exchangeRate
// ---------------------------------------------------------------------------
/**
 * IBR-004-OM: exchange rate required when invoice currency ≠ OMR.
 * IBR-172-OM: exchange rate MUST NOT be present when currency is OMR.
 * IBR-034-OM: VAT accounting currency (IBT-006) required when ≠ OMR — Covoro has
 * no IBT-006 column; USD cases set Source currency + tax-in-accounting amount.
 * IBR-005-OM / IBR-DEC-03-OM: FX max 7 decimal places when currency ≠ OMR.
 */
export const EXCHANGE_RATE_SCENARIOS: ExchangeRateScenario[] = [
  {
    ruleId: "IBR-004-OM",
    title:
      "Given currency OMR — When exchange rate is left empty — Then the invoice should be accepted. (IBR-004-OM)",
    invoiceCurrencyCode: OMAN_CURRENCY_OMR,
    sourceCurrencyCode: OMAN_CURRENCY_OMR,
    exchangeRate: "",
    shouldError: false,
    expectedErrorField: EXCHANGE_RATE_FIELD,
  },
  {
    ruleId: "IBR-004-OM",
    title:
      "Given currency USD — When an exchange rate is provided — Then the invoice should be accepted. (IBR-004-OM)",
    invoiceCurrencyCode: OMAN_CURRENCY_USD,
    sourceCurrencyCode: OMAN_CURRENCY_USD,
    exchangeRate: "0.385",
    taxAmountInAccountingCurrency: "50",
    shouldError: false,
    expectedErrorField: EXCHANGE_RATE_FIELD,
  },
  {
    ruleId: "IBR-004-OM",
    title:
      "Given currency USD — When exchange rate is left empty — Then the invoice should be rejected with an error. (IBR-004-OM)",
    invoiceCurrencyCode: OMAN_CURRENCY_USD,
    sourceCurrencyCode: OMAN_CURRENCY_USD,
    exchangeRate: "",
    taxAmountInAccountingCurrency: "50",
    shouldError: true,
    expectedErrorField: EXCHANGE_RATE_FIELD,
  },
  {
    ruleId: "IBR-172-OM",
    title:
      "Given currency OMR — When an exchange rate is provided — Then the invoice should be rejected with an error. (IBR-172-OM)",
    invoiceCurrencyCode: OMAN_CURRENCY_OMR,
    sourceCurrencyCode: OMAN_CURRENCY_OMR,
    exchangeRate: "0.385",
    shouldError: true,
    expectedErrorField: EXCHANGE_RATE_FIELD,
  },
  {
    ruleId: "IBR-172-OM",
    title:
      "Given currency OMR — When exchange rate is left empty — Then the invoice should be accepted. (IBR-172-OM)",
    invoiceCurrencyCode: OMAN_CURRENCY_OMR,
    sourceCurrencyCode: OMAN_CURRENCY_OMR,
    exchangeRate: "",
    shouldError: false,
    expectedErrorField: EXCHANGE_RATE_FIELD,
  },
  {
    ruleId: "IBR-034-OM",
    title:
      "Given currency USD — When source currency and tax amount in accounting currency are provided — Then the invoice should be accepted. (IBR-034-OM)",
    invoiceCurrencyCode: OMAN_CURRENCY_USD,
    sourceCurrencyCode: OMAN_CURRENCY_USD,
    exchangeRate: "0.385",
    taxAmountInAccountingCurrency: "50",
    shouldError: false,
    expectedErrorField: TAX_AMOUNT_IN_ACCOUNTING_CURRENCY_FIELD,
  },
  {
    ruleId: "IBR-034-OM",
    title:
      "Given currency USD — When tax amount in accounting currency is left empty — Then the invoice should be rejected with an error. (IBR-034-OM)",
    invoiceCurrencyCode: OMAN_CURRENCY_USD,
    sourceCurrencyCode: OMAN_CURRENCY_USD,
    exchangeRate: "0.385",
    taxAmountInAccountingCurrency: "",
    shouldError: true,
    expectedErrorField: TAX_AMOUNT_IN_ACCOUNTING_CURRENCY_FIELD,
  },
  {
    ruleId: "IBR-005-OM",
    title:
      "Given currency USD — When exchange rate has 7 decimal places — Then the invoice should be accepted. (IBR-005-OM)",
    invoiceCurrencyCode: OMAN_CURRENCY_USD,
    sourceCurrencyCode: OMAN_CURRENCY_USD,
    exchangeRate: "0.1234567",
    taxAmountInAccountingCurrency: "50",
    shouldError: false,
    expectedErrorField: EXCHANGE_RATE_FIELD,
  },
  {
    ruleId: "IBR-005-OM",
    title:
      "Given currency USD — When exchange rate has 8 decimal places — Then the invoice should be rejected with an error. (IBR-005-OM)",
    invoiceCurrencyCode: OMAN_CURRENCY_USD,
    sourceCurrencyCode: OMAN_CURRENCY_USD,
    exchangeRate: "0.12345678",
    taxAmountInAccountingCurrency: "50",
    shouldError: true,
    expectedErrorField: EXCHANGE_RATE_FIELD,
  },
];

/**
 * IBR-DEC-03-OM: monetary amounts must have ≤ 3 decimal places
 * (covers IBR-088-OM / IBR-109…IBR-135-OM family).
 */
export type AmountDecimalPrecisionScenario = OmanConditionalScenario & {
  itemGrossPrice: string;
};

export const AMOUNT_DECIMAL_PRECISION_SCENARIOS: AmountDecimalPrecisionScenario[] =
  [
    {
      ruleId: "IBR-DEC-03-OM",
      title:
        "Given an item gross price — When it has 3 decimal places — Then the invoice should be accepted. (IBR-DEC-03-OM)",
      itemGrossPrice: "1000.123",
      shouldError: false,
      expectedErrorField: "Item Gross Price",
    },
    {
      ruleId: "IBR-DEC-03-OM",
      title:
        "Given an item gross price — When it has 4 decimal places — Then the invoice should be rejected with an error. (IBR-DEC-03-OM)",
      itemGrossPrice: "1000.1234",
      shouldError: true,
      expectedErrorField: "Item Gross Price",
    },
  ];

/**
 * IBR-137-OM: all invoice amounts and quantities shall be zero or positive,
 * except rounding amount (IBT-114). Wrong-target Y = Invoiced Quantity
 * (Not Allowed reuses that row).
 */
export type AmountQuantitySignScenario = OmanConditionalScenario & {
  invoicedQuantity: string;
  roundingAmount: string;
};

export const AMOUNT_QUANTITY_SIGN_SCENARIOS: AmountQuantitySignScenario[] = [
  {
    ruleId: "IBR-137-OM",
    title:
      "Given amounts and quantities — When all values are zero or more — Then the invoice should be accepted. (IBR-137-OM)",
    invoicedQuantity: "1",
    roundingAmount: "0",
    shouldError: false,
    expectedErrorField: INVOICED_QUANTITY_FIELD,
  },
  {
    ruleId: "IBR-137-OM",
    title:
      "Given a negative rounding amount — When other amounts are zero or more — Then the invoice should be accepted. (IBR-137-OM)",
    invoicedQuantity: "1",
    roundingAmount: "-0.50",
    shouldError: false,
    expectedErrorField: ROUNDING_AMOUNT_FIELD,
  },
  {
    ruleId: "IBR-137-OM",
    title:
      "Given a negative invoiced quantity — When the invoice is uploaded — Then the invoice should be rejected with an error. (IBR-137-OM)",
    invoicedQuantity: "-1",
    roundingAmount: "0",
    shouldError: true,
    expectedErrorField: INVOICED_QUANTITY_FIELD,
  },
];


// ---------------------------------------------------------------------------
// itemAndGoods
// ---------------------------------------------------------------------------
/** IBR-078-OM: Item Type required except Simplified Tax Invoice. */
export const ITEM_TYPE_REQUIRED_SCENARIOS: ItemTypeRequiredScenario[] = [
  {
    ruleId: "IBR-078-OM",
    title:
      "Given a Full Tax invoice — When item type is Goods — Then the invoice should be accepted. (IBR-078-OM)",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    itemType: ITEM_TYPE_GOODS,
    shouldError: false,
    expectedErrorField: ITEM_TYPE_FIELD,
  },
  {
    ruleId: "IBR-078-OM",
    title:
      "Given a Full Tax invoice — When item type is Services — Then the invoice should be accepted. (IBR-078-OM)",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    itemType: ITEM_TYPE_SERVICES,
    shouldError: false,
    expectedErrorField: ITEM_TYPE_FIELD,
  },
  {
    ruleId: "IBR-078-OM",
    title:
      "Given a Full Tax invoice — When item type is left empty — Then the invoice should be rejected with an error. (IBR-078-OM)",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    itemType: "",
    shouldError: true,
    expectedErrorField: ITEM_TYPE_FIELD,
  },
  {
    ruleId: "IBR-078-OM",
    title:
      "Given a Simplified invoice — When item type is left empty — Then the invoice should be accepted. (IBR-078-OM)",
    invoiceTransactionTypeCode: TXN_SIMPLIFIED_TAX_INVOICE,
    itemType: "",
    shouldError: false,
    expectedErrorField: ITEM_TYPE_FIELD,
  },
];

/** IBR-079-OM: Goods → classification required (except Simplified). */
export const GOODS_CLASSIFICATION_SCENARIOS: GoodsClassificationScenario[] = [
  {
    ruleId: "IBR-079-OM",
    title:
      "Given Goods — When an HS classification is provided — Then the invoice should be accepted. (IBR-079-OM)",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    itemType: ITEM_TYPE_GOODS,
    itemClassificationIdentifier: OMAN_HS_CODE_12,
    shouldError: false,
    expectedErrorField: ITEM_CLASSIFICATION_IDENTIFIER_FIELD,
  },
  {
    ruleId: "IBR-079-OM",
    title:
      "Given Goods — When HS classification is left empty — Then the invoice should be rejected with an error. (IBR-079-OM)",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    itemType: ITEM_TYPE_GOODS,
    itemClassificationIdentifier: "",
    shouldError: true,
    expectedErrorField: ITEM_CLASSIFICATION_IDENTIFIER_FIELD,
  },
  {
    ruleId: "IBR-079-OM",
    title:
      "Given a Simplified invoice for Goods — When HS classification is left empty — Then the invoice should be accepted. (IBR-079-OM)",
    invoiceTransactionTypeCode: TXN_SIMPLIFIED_TAX_INVOICE,
    itemType: ITEM_TYPE_GOODS,
    itemClassificationIdentifier: "",
    shouldError: false,
    expectedErrorField: ITEM_CLASSIFICATION_IDENTIFIER_FIELD,
  },
  {
    ruleId: "IBR-079-OM",
    title:
      "Given Services — When HS classification is left empty — Then the invoice should be accepted. (IBR-079-OM)",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    itemType: ITEM_TYPE_SERVICES,
    itemClassificationIdentifier: "",
    shouldError: false,
    expectedErrorField: ITEM_CLASSIFICATION_IDENTIFIER_FIELD,
  },
];

/** IBR-174-OM: Goods (BTOM-019 = G) → IBT-158 must be from the ROP Customs HS list. */
export const HS_CODE_FROM_ROP_LIST_SCENARIOS: GoodsClassificationScenario[] = [
  {
    ruleId: "IBR-174-OM",
    title:
      "Given Goods — When the HS code is on the ROP list — Then the invoice should be accepted. (IBR-174-OM)",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    itemType: ITEM_TYPE_GOODS,
    itemClassificationIdentifier: OMAN_HS_CODE_12,
    shouldError: false,
    expectedErrorField: ITEM_CLASSIFICATION_IDENTIFIER_FIELD,
  },
  {
    ruleId: "IBR-174-OM",
    title:
      "Given Goods — When the HS code is not on the ROP list — Then the invoice should be rejected with an error. (IBR-174-OM)",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    itemType: ITEM_TYPE_GOODS,
    itemClassificationIdentifier: OMAN_HS_CODE_NOT_ON_ROP_LIST,
    shouldError: true,
    expectedErrorField: ITEM_CLASSIFICATION_IDENTIFIER_FIELD,
  },
  {
    ruleId: "IBR-174-OM",
    title:
      "Given Goods — When HS classification is left empty — Then the invoice should be rejected with an error. (IBR-174-OM)",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    itemType: ITEM_TYPE_GOODS,
    itemClassificationIdentifier: "",
    shouldError: true,
    expectedErrorField: ITEM_CLASSIFICATION_IDENTIFIER_FIELD,
  },
];


// ---------------------------------------------------------------------------
// importOfGoods
// ---------------------------------------------------------------------------
/** IBR-084-OM / IBR-085-OM: Import of Goods requires origin + import details. */
export const IMPORT_OF_GOODS_SCENARIOS: ImportOfGoodsScenario[] = [
  {
    ruleId: "IBR-084-OM",
    title:
      "Given Import of Goods — When country of origin is provided — Then the invoice should be accepted. (IBR-084-OM)",
    itemCountryOfOrigin: "India",
    importDate: "2026-01-10",
    customsDeclarationNumber: "CD-12345",
    incoterms: "Free On Board",
    shouldError: false,
    expectedErrorField: ITEM_COUNTRY_OF_ORIGIN_FIELD,
  },
  {
    ruleId: "IBR-084-OM",
    title:
      "Given Import of Goods — When country of origin is left empty — Then the invoice should be rejected with an error. (IBR-084-OM)",
    itemCountryOfOrigin: "",
    importDate: "2026-01-10",
    customsDeclarationNumber: "CD-12345",
    incoterms: "Free On Board",
    shouldError: true,
    expectedErrorField: ITEM_COUNTRY_OF_ORIGIN_FIELD,
  },
  {
    ruleId: "IBR-084-OM",
    title:
      "Given Full Tax Invoice — When country of origin is left empty — Then the invoice should be accepted. (IBR-084-OM)",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    itemCountryOfOrigin: "",
    importDate: "",
    customsDeclarationNumber: "",
    incoterms: "",
    shouldError: false,
    expectedErrorField: ITEM_COUNTRY_OF_ORIGIN_FIELD,
  },
  {
    ruleId: "IBR-085-OM",
    title:
      "Given Import of Goods — When customs declaration number is left empty — Then the invoice should be rejected with an error. (IBR-085-OM)",
    itemCountryOfOrigin: "India",
    importDate: "2026-01-10",
    customsDeclarationNumber: "",
    incoterms: "Free On Board",
    shouldError: true,
    expectedErrorField: CUSTOMS_DECLARATION_NUMBER_FIELD,
  },
  {
    ruleId: "IBR-085-OM",
    title:
      "Given Import of Goods — When Import date is left empty — Then the invoice should be rejected with an error. (IBR-085-OM)",
    itemCountryOfOrigin: "India",
    importDate: "",
    customsDeclarationNumber: "CD-12345",
    incoterms: "Free On Board",
    shouldError: true,
    expectedErrorField: IMPORT_DATE_FIELD,
  },
  {
    ruleId: "IBR-085-OM",
    title:
      "Given Import of Goods — When Incoterms is left empty — Then the invoice should be rejected with an error. (IBR-085-OM)",
    itemCountryOfOrigin: "India",
    importDate: "2026-01-10",
    customsDeclarationNumber: "CD-12345",
    incoterms: "",
    shouldError: true,
    expectedErrorField: INCOTERMS_FIELD,
  },
  {
    ruleId: "IBR-085-OM",
    title:
      "Given Import of Goods with an import date — When customs declaration number is left empty — Then the invoice should be rejected with an error. (IBR-085-OM)",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    itemCountryOfOrigin: "India",
    importDate: "2026-01-10",
    customsDeclarationNumber: "",
    incoterms: "",
    shouldError: true,
    expectedErrorField: CUSTOMS_DECLARATION_NUMBER_FIELD,
  },
];


// ---------------------------------------------------------------------------
// profitMarginSelfInvoice
// ---------------------------------------------------------------------------
/** IBR-086-OM / IBR-087-OM: Profit Margin Self-Invoice → tax cat O + seller OM. */
export const PROFIT_MARGIN_SELF_INVOICE_SCENARIOS: ProfitMarginTaxCategoryScenario[] =
  [
    {
      ruleId: "IBR-086-OM",
      title:
        "Given Profit Margin Self-Invoice — When VAT is Not subject — Then the invoice should be accepted. (IBR-086-OM)",
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      sellerCountryCode: OMAN_COUNTRY_CODE,
      shouldError: false,
      expectedErrorField: TAX_CATEGORY_FIELD,
    },
    {
      ruleId: "IBR-086-OM",
      title:
        "Given Profit Margin Self-Invoice — When VAT is Standard rate — Then the invoice should be rejected with an error. (IBR-086-OM)",
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      sellerCountryCode: OMAN_COUNTRY_CODE,
      shouldError: true,
      expectedErrorField: TAX_CATEGORY_FIELD,
    },
    {
      ruleId: "IBR-087-OM",
      title:
        "Given Profit Margin Self-Invoice — When the seller country is not Oman — Then the invoice should be rejected with an error. (IBR-087-OM)",
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      sellerCountryCode: "India",
      shouldError: true,
      expectedErrorField: SELLER_COUNTRY_CODE_FIELD,
    },
  ];

/** IBR-091-OM: Profit Margin Invoice → IBT-158 MUST NOT start with 7101/7102/7103/7104/01/06. */
export const PROFIT_MARGIN_HS_PREFIX_SCENARIOS: ProfitMarginHsPrefixScenario[] =
  [
    {
      ruleId: "IBR-091-OM",
      title:
        "Given Profit Margin Invoice — When HS code is 8471 — Then the invoice should be accepted. (IBR-091-OM)",
      itemClassificationIdentifier: OMAN_HS_CODE_12,
      shouldError: false,
      expectedErrorField: ITEM_CLASSIFICATION_IDENTIFIER_FIELD,
    },
    {
      ruleId: "IBR-091-OM",
      title:
        "Given Profit Margin Invoice — When HS code starts with 7101 — Then the invoice should be rejected with an error. (IBR-091-OM)",
      itemClassificationIdentifier: "710100000000",
      shouldError: true,
      expectedErrorField: ITEM_CLASSIFICATION_IDENTIFIER_FIELD,
    },
    {
      ruleId: "IBR-091-OM",
      title:
        "Given Profit Margin Invoice — When HS code starts with 7102 — Then the invoice should be rejected with an error. (IBR-091-OM)",
      itemClassificationIdentifier: "710200000000",
      shouldError: true,
      expectedErrorField: ITEM_CLASSIFICATION_IDENTIFIER_FIELD,
    },
    {
      ruleId: "IBR-091-OM",
      title:
        "Given Profit Margin Invoice — When HS code starts with 7103 — Then the invoice should be rejected with an error. (IBR-091-OM)",
      itemClassificationIdentifier: "710300000000",
      shouldError: true,
      expectedErrorField: ITEM_CLASSIFICATION_IDENTIFIER_FIELD,
    },
    {
      ruleId: "IBR-091-OM",
      title:
        "Given Profit Margin Invoice — When HS code starts with 7104 — Then the invoice should be rejected with an error. (IBR-091-OM)",
      itemClassificationIdentifier: "710400000000",
      shouldError: true,
      expectedErrorField: ITEM_CLASSIFICATION_IDENTIFIER_FIELD,
    },
    {
      ruleId: "IBR-091-OM",
      title:
        "Given Profit Margin Invoice — When HS code starts with 01 — Then the invoice should be rejected with an error. (IBR-091-OM)",
      itemClassificationIdentifier: "010000000000",
      shouldError: true,
      expectedErrorField: ITEM_CLASSIFICATION_IDENTIFIER_FIELD,
    },
    {
      ruleId: "IBR-091-OM",
      title:
        "Given Profit Margin Invoice — When HS code starts with 06 — Then the invoice should be rejected with an error. (IBR-091-OM)",
      itemClassificationIdentifier: "060000000000",
      shouldError: true,
      expectedErrorField: ITEM_CLASSIFICATION_IDENTIFIER_FIELD,
    },
  ];


// ---------------------------------------------------------------------------
// summaryInvoicePeriod
// ---------------------------------------------------------------------------
/** IBR-037-OM: Summary OR Continuous Supply requires invoicing period. */
export const SUMMARY_INVOICE_PERIOD_SCENARIOS: SummaryPeriodScenario[] = [
  ...expandAcrossSummaryOrContinuousTxnTypes<SummaryPeriodScenario>({
    ruleId: "IBR-037-OM",
    title:
      "Given {txn} — When invoicing period dates are provided — Then the invoice should be accepted. (IBR-037-OM)",
    periodStart: "2026-01-01",
    periodEnd: "2026-01-31",
    shouldError: false,
    expectedErrorField: INVOICING_PERIOD_START_DATE_FIELD,
  }),
  ...expandAcrossSummaryOrContinuousTxnTypes<SummaryPeriodScenario>({
    ruleId: "IBR-037-OM",
    title:
      "Given {txn} — When invoicing period is left empty — Then the invoice should be rejected with an error. (IBR-037-OM)",
    periodStart: "",
    periodEnd: "",
    shouldError: true,
    expectedErrorField: INVOICING_PERIOD_START_DATE_FIELD,
  }),
];

/**
 * IBR-036-OM: Summary invoice (XXXX1XXXXXXXXXXXXXXX) → IBT-073 and IBT-074
 * must belong to the same calendar month when both are provided.
 * End still >= start so IBR-029 does not fire on the different-month row.
 */
export const SUMMARY_PERIOD_SAME_CALENDAR_MONTH_SCENARIOS: SummaryPeriodScenario[] =
  [
    {
      ruleId: "IBR-036-OM",
      title:
        "Given a Summary Invoice — When period start and end are in the same calendar month — Then the invoice should be accepted. (IBR-036-OM)",
      invoiceTransactionTypeCode: TXN_SUMMARY_INVOICE,
      periodStart: "2026-01-01",
      periodEnd: "2026-01-31",
      shouldError: false,
      expectedErrorField: INVOICING_PERIOD_END_DATE_FIELD,
    },
    {
      ruleId: "IBR-036-OM",
      title:
        "Given a Summary Invoice — When period start and end are in different calendar months — Then the invoice should be rejected with an error. (IBR-036-OM)",
      invoiceTransactionTypeCode: TXN_SUMMARY_INVOICE,
      periodStart: "2026-01-01",
      periodEnd: "2026-02-01",
      shouldError: true,
      expectedErrorField: INVOICING_PERIOD_END_DATE_FIELD,
    },
  ];


// ---------------------------------------------------------------------------
// documentAllowanceChargeVat
// ---------------------------------------------------------------------------
/**
 * IBR-062-OM / IBR-064-OM: doc allowance/charge E or Z requires exemption reason.
 * IBR-092/093/094 (doc allowance rate E/O/Z) need IBT-096 — Covoro has no
 * separate allowance tax-rate column; see DOCUMENT_ALLOWANCE_CHARGE_RATE_SCENARIOS
 * for category-level proxies (IBR-047 / IBR-094).
 */
export const DOCUMENT_ALLOWANCE_CHARGE_VAT_SCENARIOS: DocumentAllowanceChargeVatScenario[] =
  [
    {
      ruleId: "IBR-062-OM",
      title:
        "Given an Exempt document allowance — When an exemption reason is provided — Then the invoice should be accepted. (IBR-062-OM)",
      kind: "allowance",
      vatCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      exemptionReason: TAX_EXEMPTION_REASON_SAMPLE,
      amount: "50",
      shouldError: false,
      expectedErrorField: TAX_EXEMPTION_REASON_ALLOWANCES_FIELD,
    },
    {
      ruleId: "IBR-062-OM",
      title:
        "Given an Exempt document allowance — When exemption reason is left empty — Then the invoice should be rejected with an error. (IBR-062-OM)",
      kind: "allowance",
      vatCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      exemptionReason: "",
      amount: "50",
      shouldError: true,
      expectedErrorField: TAX_EXEMPTION_REASON_ALLOWANCES_FIELD,
    },
    {
      ruleId: "IBR-062-OM",
      title:
        "Given a Zero rated document allowance — When an exemption reason is provided — Then the invoice should be accepted. (IBR-062-OM)",
      kind: "allowance",
      vatCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      exemptionReason: TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
      amount: "50",
      shouldError: false,
      expectedErrorField: TAX_EXEMPTION_REASON_ALLOWANCES_FIELD,
    },
    {
      ruleId: "IBR-062-OM",
      title:
        "Given a Zero rated document allowance — When exemption reason is left empty — Then the invoice should be rejected with an error. (IBR-062-OM)",
      kind: "allowance",
      vatCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      exemptionReason: "",
      amount: "50",
      shouldError: true,
      expectedErrorField: TAX_EXEMPTION_REASON_ALLOWANCES_FIELD,
    },
    {
      ruleId: "IBR-062-OM",
      title:
        "Given a Standard rate document allowance — When an exemption reason is provided — Then the invoice should be rejected with an error. (IBR-062-OM)",
      kind: "allowance",
      vatCategory: STANDARD_TAX_CATEGORY_CODE,
      exemptionReason: TAX_EXEMPTION_REASON_SAMPLE,
      amount: "50",
      shouldError: true,
      expectedErrorField: TAX_EXEMPTION_REASON_ALLOWANCES_FIELD,
    },
    {
      ruleId: "IBR-064-OM",
      title:
        "Given an Exempt document charge — When an exemption reason is provided — Then the invoice should be accepted. (IBR-064-OM)",
      kind: "charge",
      vatCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      exemptionReason: TAX_EXEMPTION_REASON_SAMPLE,
      amount: "100",
      shouldError: false,
      expectedErrorField: TAX_EXEMPTION_REASON_CHARGES_FIELD,
    },
    {
      ruleId: "IBR-064-OM",
      title:
        "Given an Exempt document charge — When exemption reason is left empty — Then the invoice should be rejected with an error. (IBR-064-OM)",
      kind: "charge",
      vatCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      exemptionReason: "",
      amount: "100",
      shouldError: true,
      expectedErrorField: TAX_EXEMPTION_REASON_CHARGES_FIELD,
    },
    {
      ruleId: "IBR-064-OM",
      title:
        "Given a Zero rated document charge — When an exemption reason is provided — Then the invoice should be accepted. (IBR-064-OM)",
      kind: "charge",
      vatCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      exemptionReason: TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
      amount: "100",
      shouldError: false,
      expectedErrorField: TAX_EXEMPTION_REASON_CHARGES_FIELD,
    },
    {
      ruleId: "IBR-064-OM",
      title:
        "Given a Zero rated document charge — When exemption reason is left empty — Then the invoice should be rejected with an error. (IBR-064-OM)",
      kind: "charge",
      vatCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      exemptionReason: "",
      amount: "100",
      shouldError: true,
      expectedErrorField: TAX_EXEMPTION_REASON_CHARGES_FIELD,
    },
    {
      ruleId: "IBR-062-OM",
      title:
        "Given a document allowance amount — When VAT category is left empty — Then the invoice should be rejected with an error. (IBR-062-OM)",
      kind: "allowance",
      vatCategory: "",
      exemptionReason: "",
      amount: "50",
      shouldError: true,
      expectedErrorField: VAT_CATEGORY_ALLOWANCES_FIELD,
    },
    {
      ruleId: "IBR-064-OM",
      title:
        "Given a document charge amount — When VAT category is left empty — Then the invoice should be rejected with an error. (IBR-064-OM)",
      kind: "charge",
      vatCategory: "",
      exemptionReason: "",
      amount: "100",
      shouldError: true,
      expectedErrorField: VAT_CATEGORY_CHARGES_FIELD,
    },
  ];


// ---------------------------------------------------------------------------
// documentChargeReason (IBR-042-OM)
// ---------------------------------------------------------------------------
/**
 * IBR-042-OM: if Document level charge (IBG-21) is present, document level
 * charge reason code (IBT-104) MUST be present.
 * Covoro has no IBT-104 column; the pack maps it to `Charges on document
 * level` (same cell as the IBG-21 amount). Filling the amount is Allowed.
 * Not Allowed (IBG-21 present + reason omitted) is Excel N/A — the proxy
 * cell cannot be filled and empty at once.
 */
export const DOCUMENT_CHARGE_REASON_SCENARIOS: DocumentChargeReasonScenario[] =
  [
    {
      ruleId: "IBR-042-OM",
      title:
        "Given a document level charge — When the charge is present — Then the invoice should be accepted. (IBR-042-OM)",
      amount: "100",
      vatCategory: STANDARD_TAX_CATEGORY_CODE,
      shouldError: false,
      expectedErrorField: CHARGES_ON_DOCUMENT_LEVEL_FIELD,
    },
  ];


// ---------------------------------------------------------------------------
// creditDebitReason
// ---------------------------------------------------------------------------
/** IBR-023-OM: CN/DN/self-billed CN require reason code. */
export const CREDIT_DEBIT_REASON_SCENARIOS: CreditDebitReasonScenario[] = [
  ...expandAcrossCnDnSelfBilledTypes<CreditDebitReasonScenario>({
    ruleId: "IBR-023-OM",
    title:
      "Given {type} — When a reason code is provided — Then the invoice should be accepted. (IBR-023-OM)",
    creditDebitNoteReasonCode: CREDIT_DEBIT_REASON_SAMPLE,
    precedingInvoiceReference: "INV-PREV-023",
    shouldError: false,
    expectedErrorField: CREDIT_DEBIT_NOTE_REASON_CODE_FIELD,
  }),
  ...expandAcrossCnDnSelfBilledTypes<CreditDebitReasonScenario>({
    ruleId: "IBR-023-OM",
    title:
      "Given {type} — When reason code is left empty — Then the invoice should be rejected with an error. (IBR-023-OM)",
    creditDebitNoteReasonCode: "",
    precedingInvoiceReference: "INV-PREV-023",
    shouldError: true,
    expectedErrorField: CREDIT_DEBIT_NOTE_REASON_CODE_FIELD,
  }),
];


// ---------------------------------------------------------------------------
// selfBilledTxnConstraint (IBR-177-OM)
// ---------------------------------------------------------------------------
/**
 * IBR-177-OM: when Invoice Type is Self billed credit note (261) or Self-billed
 * invoice (389), Invoice Transaction Type must be Self-billed / RCM / PM-Self /
 * Import of Goods. Live: one type × one txn per test; packs: both types in one workbook.
 */
export const SELF_BILLED_TXN_CONSTRAINT_SCENARIOS: SelfBilledTxnConstraintScenario[] =
  [
    ...expandAcrossSelfBilledDocumentTypes<SelfBilledTxnConstraintScenario>({
      ruleId: "IBR-177-OM",
      title:
        "Given {type} — When transaction type is {txn} — Then the invoice should be accepted. (IBR-177-OM)",
      invoiceTransactionTypeCode: TXN_SELF_BILLED_INVOICE,
      shouldError: false,
      expectedErrorField: INVOICE_TRANSACTION_TYPE_CODE_FIELD,
    }).flatMap((typeScenario) =>
      expandAcrossSelfBilledOrRcmTxnTypes<SelfBilledTxnConstraintScenario>(
        typeScenario
      )
    ),
    ...expandAcrossSelfBilledDocumentTypes<SelfBilledTxnConstraintScenario>({
      ruleId: "IBR-177-OM",
      title:
        "Given {type} — When transaction type is Full Tax — Then the invoice should be rejected with an error. (IBR-177-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      shouldError: true,
      expectedErrorField: INVOICE_TRANSACTION_TYPE_CODE_FIELD,
    }),
  ];


// ---------------------------------------------------------------------------
// prepaymentTxnExclusion (IBR-176-OM)
// ---------------------------------------------------------------------------
/**
 * IBR-176-OM: Prepayment cannot combine with Summary OR Deemed Supply OR
 * Profit Margin Self-Invoice on BTOM-001. Allowed = partner Master label
 * without Prepayment; Not Allowed = Peppol bit OR; control = Prepayment
 * label alone. Live: one partner per test.
 */
export const PREPAYMENT_TXN_EXCLUSION_SCENARIOS: PrepaymentTxnExclusionScenario[] =
  [
    ...expandAcrossPrepaymentExclusionPartners<PrepaymentTxnExclusionScenario>({
      ruleId: "IBR-176-OM",
      title:
        "Given {type} without Prepayment — When the invoice is uploaded — Then the invoice should be accepted. (IBR-176-OM)",
      withPrepaymentBit: false,
      shouldError: false,
      expectedErrorField: INVOICE_TRANSACTION_TYPE_CODE_FIELD,
    }),
    ...expandAcrossPrepaymentExclusionPartners<PrepaymentTxnExclusionScenario>({
      ruleId: "IBR-176-OM",
      title:
        "Given Prepayment together with {type} — When the invoice is uploaded — Then the invoice should be rejected with an error. (IBR-176-OM)",
      withPrepaymentBit: true,
      shouldError: true,
      expectedErrorField: INVOICE_TRANSACTION_TYPE_CODE_FIELD,
    }),
    {
      ruleId: "IBR-176-OM",
      title:
        "Given Prepayment alone without Summary, Deemed, or Profit Margin Self-Invoice — When the invoice is uploaded — Then the invoice should be accepted. (IBR-176-OM)",
      conflictingTxnType: "",
      invoiceTransactionTypeCode: TXN_PREPAYMENT_INVOICE,
      shouldError: false,
      expectedErrorField: INVOICE_TRANSACTION_TYPE_CODE_FIELD,
    },
  ];

// ---------------------------------------------------------------------------
// selfBilledTxnExclusion (IBR-138-OM)
// ---------------------------------------------------------------------------
/**
 * IBR-138-OM: Self-billed cannot combine with Third-party OR Export OR
 * Import of Services (RCM) OR Profit margin invoice OR Profit Margin
 * Self-Invoice OR Import of Goods on BTOM-001. Allowed = partner Master
 * description without Self-billed; Not Allowed = joined Master descriptions
 * (Self-billed Invoice, {partner}); control = Self-billed description alone.
 * Expanded across every Master invoice type (IBR-177 skips incompatible
 * Self-billed document × txn cells). Never write Peppol 0/1 bit-strings.
 */
export const SELF_BILLED_TXN_EXCLUSION_SCENARIOS: SelfBilledTxnExclusionScenario[] =
  expandTxnExclusionAcrossAllInvoiceTypes([
    ...expandAcrossSelfBilledExclusionPartners<SelfBilledTxnExclusionScenario>({
      ruleId: "IBR-138-OM",
      title:
        "Given {type} without Self-billed — When the invoice is uploaded — Then the invoice should be accepted. (IBR-138-OM)",
      withSelfBilledBit: false,
      shouldError: false,
      expectedErrorField: INVOICE_TRANSACTION_TYPE_CODE_FIELD,
    }),
    ...expandAcrossSelfBilledExclusionPartners<SelfBilledTxnExclusionScenario>({
      ruleId: "IBR-138-OM",
      title:
        "Given Self-billed together with {type} — When the invoice is uploaded — Then the invoice should be rejected with an error. (IBR-138-OM)",
      withSelfBilledBit: true,
      shouldError: true,
      expectedErrorField: INVOICE_TRANSACTION_TYPE_CODE_FIELD,
    }),
    {
      ruleId: "IBR-138-OM",
      title:
        "Given Self-billed alone without Third-party, Export, Import of Services (RCM), Profit Margin, Profit Margin Self-Invoice, or Import of Goods — When the invoice is uploaded — Then the invoice should be accepted. (IBR-138-OM)",
      conflictingTxnType: "",
      invoiceTransactionTypeCode: TXN_SELF_BILLED_INVOICE,
      shouldError: false,
      expectedErrorField: INVOICE_TRANSACTION_TYPE_CODE_FIELD,
    },
  ]);

// ---------------------------------------------------------------------------
// thirdPartyVsSelfBilledExclusion (IBR-139-OM)
// ---------------------------------------------------------------------------
/**
 * IBR-139-OM: cannot be Third-party Invoice if Self-billed Invoice/credit
 * note on BTOM-001. Allowed = Third-party without Self-billed, plus
 * Self-billed-alone; Not Allowed = combined Master descriptions in one cell.
 * Expanded across every Master invoice type (IBR-177 aware).
 */
export const IBR_139_TXN_EXCLUSION_SCENARIOS: SelfBilledTxnExclusionScenario[] =
  expandTxnExclusionAcrossAllInvoiceTypes([
    {
      ruleId: "IBR-139-OM",
      title:
        "Given Third-party Invoice without Self-billed — When the invoice is uploaded — Then the invoice should be accepted. (IBR-139-OM)",
      conflictingTxnType: TXN_THIRD_PARTY_INVOICE,
      invoiceTransactionTypeCode: TXN_THIRD_PARTY_INVOICE,
      shouldError: false,
      expectedErrorField: INVOICE_TRANSACTION_TYPE_CODE_FIELD,
    },
    {
      ruleId: "IBR-139-OM",
      title:
        "Given Self-billed together with Third-party Invoice — When the invoice is uploaded — Then the invoice should be rejected with an error. (IBR-139-OM)",
      conflictingTxnType: TXN_THIRD_PARTY_INVOICE,
      invoiceTransactionTypeCode: combineOmanTxnTypeDescriptions(
        TXN_SELF_BILLED_INVOICE,
        TXN_THIRD_PARTY_INVOICE
      ),
      shouldError: true,
      expectedErrorField: INVOICE_TRANSACTION_TYPE_CODE_FIELD,
    },
    {
      ruleId: "IBR-139-OM",
      title:
        "Given Self-billed alone without Third-party — When the invoice is uploaded — Then the invoice should be accepted. (IBR-139-OM)",
      conflictingTxnType: "",
      invoiceTransactionTypeCode: TXN_SELF_BILLED_INVOICE,
      shouldError: false,
      expectedErrorField: INVOICE_TRANSACTION_TYPE_CODE_FIELD,
    },
  ]);


// ---------------------------------------------------------------------------
// summaryTxnExclusion (IBR-140-OM)
// ---------------------------------------------------------------------------
/**
 * IBR-140-OM: Summary cannot combine with Continuous OR Export OR
 * Profit Margin Invoice OR Profit Margin Self-Invoice OR Import of Goods
 * on BTOM-001. Allowed = partner Master description without Summary, plus
 * Summary-alone; Not Allowed = comma-joined Master descriptions (never
 * Peppol bit-strings). Expanded across every Master invoice type.
 */
export const SUMMARY_TXN_EXCLUSION_SCENARIOS: SummaryTxnExclusionScenario[] =
  expandTxnExclusionAcrossAllInvoiceTypes([
    ...expandAcrossIbr140ExclusionPartners<SummaryTxnExclusionScenario>({
      ruleId: "IBR-140-OM",
      title:
        "Given {type} without Summary — When the invoice is uploaded — Then the invoice should be accepted. (IBR-140-OM)",
      withSummaryBit: false,
      shouldError: false,
      expectedErrorField: INVOICE_TRANSACTION_TYPE_CODE_FIELD,
    }),
    ...expandAcrossIbr140ExclusionPartners<SummaryTxnExclusionScenario>({
      ruleId: "IBR-140-OM",
      title:
        "Given Summary Invoice together with {type} — When the invoice is uploaded — Then the invoice should be rejected with an error. (IBR-140-OM)",
      withSummaryBit: true,
      shouldError: true,
      expectedErrorField: INVOICE_TRANSACTION_TYPE_CODE_FIELD,
    }),
    {
      ruleId: "IBR-140-OM",
      title:
        "Given Summary Invoice alone without Continuous, Export, Profit Margin, Profit Margin Self-Invoice, or Import of Goods — When the invoice is uploaded — Then the invoice should be accepted. (IBR-140-OM)",
      conflictingTxnType: "",
      invoiceTransactionTypeCode: TXN_SUMMARY_INVOICE,
      shouldError: false,
      expectedErrorField: INVOICE_TRANSACTION_TYPE_CODE_FIELD,
    },
  ]);


// ---------------------------------------------------------------------------
// continuousTxnExclusion (IBR-141-OM)
// ---------------------------------------------------------------------------
/**
 * IBR-141-OM: Continuous Supply cannot combine with Summary OR Deemed Supply
 * OR Profit Margin Invoice OR Profit Margin Self-Invoice OR Import of Goods
 * on BTOM-001. Allowed = partner Master description without Continuous, plus
 * Continuous-alone; Not Allowed = comma-joined Master descriptions (never
 * Peppol bit-strings). Expanded across every Master invoice type.
 */
export const CONTINUOUS_TXN_EXCLUSION_SCENARIOS: ContinuousTxnExclusionScenario[] =
  expandTxnExclusionAcrossAllInvoiceTypes([
    ...expandAcrossIbr141ExclusionPartners<ContinuousTxnExclusionScenario>({
      ruleId: "IBR-141-OM",
      title:
        "Given {type} without Continuous Supply — When the invoice is uploaded — Then the invoice should be accepted. (IBR-141-OM)",
      withContinuousBit: false,
      shouldError: false,
      expectedErrorField: INVOICE_TRANSACTION_TYPE_CODE_FIELD,
    }),
    ...expandAcrossIbr141ExclusionPartners<ContinuousTxnExclusionScenario>({
      ruleId: "IBR-141-OM",
      title:
        "Given Continuous Supply together with {type} — When the invoice is uploaded — Then the invoice should be rejected with an error. (IBR-141-OM)",
      withContinuousBit: true,
      shouldError: true,
      expectedErrorField: INVOICE_TRANSACTION_TYPE_CODE_FIELD,
    }),
    {
      ruleId: "IBR-141-OM",
      title:
        "Given Continuous Supply alone without Summary, Deemed Supply, Profit Margin, Profit Margin Self-Invoice, or Import of Goods — When the invoice is uploaded — Then the invoice should be accepted. (IBR-141-OM)",
      conflictingTxnType: "",
      invoiceTransactionTypeCode: TXN_CONTINUOUS_SUPPLY,
      shouldError: false,
      expectedErrorField: INVOICE_TRANSACTION_TYPE_CODE_FIELD,
    },
  ]);

/**
 * IBR-142-OM … IBR-149-OM: BTOM-001 cannot combine the subject Master
 * description with a named partner. Excel cell is always Master
 * description(s), never Peppol 0/1 codes. Expanded across every Master
 * invoice type via buildTxnPairExclusionScenarios.
 */
export const IBR_142_TXN_EXCLUSION_SCENARIOS: TxnPairExclusionScenario[] =
  buildTxnPairExclusionScenarios(
    "IBR-142-OM",
    TXN_EXPORT_INVOICE,
    IBR_142_EXCLUSION_PARTNER_TXN_TYPES,
    "Self-billed, Summary, Deemed Supply, Import of Services (RCM), Profit Margin, Profit Margin Self-Invoice, or Import of Goods"
  );

export const IBR_143_TXN_EXCLUSION_SCENARIOS: TxnPairExclusionScenario[] =
  buildTxnPairExclusionScenarios(
    "IBR-143-OM",
    TXN_DEEMED_SUPPLY_INVOICE,
    IBR_143_EXCLUSION_PARTNER_TXN_TYPES,
    "Continuous Supply, Export, Profit Margin, or Profit Margin Self-Invoice"
  );

export const IBR_144_TXN_EXCLUSION_SCENARIOS: TxnPairExclusionScenario[] =
  buildTxnPairExclusionScenarios(
    "IBR-144-OM",
    TXN_IMPORT_OF_SERVICES_RCM,
    IBR_144_EXCLUSION_PARTNER_TXN_TYPES,
    "Export, Profit Margin, Profit Margin Self-Invoice, Import of Goods, or Self-billed"
  );

export const IBR_145_TXN_EXCLUSION_SCENARIOS: TxnPairExclusionScenario[] =
  buildTxnPairExclusionScenarios(
    "IBR-145-OM",
    TXN_PROFIT_MARGIN_INVOICE,
    IBR_145_EXCLUSION_PARTNER_TXN_TYPES,
    "Summary, Continuous Supply, Export, Deemed Supply, Import of Services (RCM), Self-billed, or Import of Goods"
  );

export const IBR_146_TXN_EXCLUSION_SCENARIOS: TxnPairExclusionScenario[] =
  buildTxnPairExclusionScenarios(
    "IBR-146-OM",
    TXN_PROFIT_MARGIN_SELF_INVOICE,
    IBR_146_EXCLUSION_PARTNER_TXN_TYPES,
    "Summary, Continuous Supply, Export, Deemed Supply, Import of Services (RCM), Profit Margin, Import of Goods, or Self-billed"
  );

export const IBR_147_TXN_EXCLUSION_SCENARIOS: TxnPairExclusionScenario[] =
  buildTxnPairExclusionScenarios(
    "IBR-147-OM",
    TXN_IMPORT_OF_GOODS,
    IBR_147_EXCLUSION_PARTNER_TXN_TYPES,
    "Summary, Continuous Supply, Export, Import of Services (RCM), Profit Margin, Profit Margin Self-Invoice, E-commerce, or Self-billed"
  );

export const IBR_148_TXN_EXCLUSION_SCENARIOS: TxnPairExclusionScenario[] =
  buildTxnPairExclusionScenarios(
    "IBR-148-OM",
    TXN_ECOMMERCE_TRANSACTION,
    IBR_148_EXCLUSION_PARTNER_TXN_TYPES,
    "Profit Margin Self-Invoice"
  );

export const IBR_149_TXN_EXCLUSION_SCENARIOS: TxnPairExclusionScenario[] =
  buildTxnPairExclusionScenarios(
    "IBR-149-OM",
    TXN_SIMPLIFIED_TAX_INVOICE,
    IBR_149_EXCLUSION_PARTNER_TXN_TYPES,
    "Self-billed, Third-party, Summary, Export, Import of Services (RCM), Profit Margin, Profit Margin Self-Invoice, Import of Goods, or Special Zone Supplies"
  );


// ---------------------------------------------------------------------------
// exportDelivery (IBR-014-OM)
// ---------------------------------------------------------------------------
/** IBR-014-OM: Export Invoice requires Deliver to country code. */
export const EXPORT_DELIVERY_SCENARIOS: ExportDeliveryScenario[] = [
  {
    ruleId: "IBR-014-OM",
    title:
      "Given Export — When Deliver to country is provided — Then the invoice should be accepted. (IBR-014-OM)",
    invoiceTransactionTypeCode: TXN_EXPORT_INVOICE,
    deliverToCountryCode: "United Arab Emirates",
    shouldError: false,
    expectedErrorField: DELIVER_TO_COUNTRY_CODE_FIELD,
  },
  {
    ruleId: "IBR-014-OM",
    title:
      "Given Export — When Deliver to country is left empty — Then the invoice should be rejected with an error. (IBR-014-OM)",
    invoiceTransactionTypeCode: TXN_EXPORT_INVOICE,
    deliverToCountryCode: "",
    shouldError: true,
    expectedErrorField: DELIVER_TO_COUNTRY_CODE_FIELD,
  },
];


// ---------------------------------------------------------------------------
// specialZoneCountrySubdivision (IBR-150-OM)
// ---------------------------------------------------------------------------
/** IBR-150-OM: Special Zone Supplies → seller + buyer country subdivision from CL-13-OM. */
export const SPECIAL_ZONE_COUNTRY_SUBDIVISION_SCENARIOS: SpecialZoneCountrySubdivisionScenario[] =
  [
    {
      ruleId: "IBR-150-OM",
      title:
        "Given Special Zone Supplies — When buyer and seller subdivision are from the allowed list — Then the invoice should be accepted. (IBR-150-OM)",
      invoiceTransactionTypeCode: TXN_SPECIAL_ZONE_SUPPLIES,
      sellerCountrySubdivisionCode: SPECIAL_ZONE_COUNTRY_SUBDIVISION_CL13,
      buyerCountrySubdivisionCode: SPECIAL_ZONE_COUNTRY_SUBDIVISION_CL13,
      shouldError: false,
      expectedErrorField: BUYER_COUNTRY_SUBDIVISION_CODE_FIELD,
    },
    {
      ruleId: "IBR-150-OM",
      title:
        "Given Special Zone Supplies — When buyer subdivision is left empty — Then the invoice should be rejected with an error. (IBR-150-OM)",
      invoiceTransactionTypeCode: TXN_SPECIAL_ZONE_SUPPLIES,
      sellerCountrySubdivisionCode: SPECIAL_ZONE_COUNTRY_SUBDIVISION_CL13,
      buyerCountrySubdivisionCode: "",
      shouldError: true,
      expectedErrorField: BUYER_COUNTRY_SUBDIVISION_CODE_FIELD,
    },
    {
      ruleId: "IBR-150-OM",
      title:
        "Given Special Zone Supplies — When seller subdivision is left empty — Then the invoice should be rejected with an error. (IBR-150-OM)",
      invoiceTransactionTypeCode: TXN_SPECIAL_ZONE_SUPPLIES,
      sellerCountrySubdivisionCode: "",
      buyerCountrySubdivisionCode: SPECIAL_ZONE_COUNTRY_SUBDIVISION_CL13,
      shouldError: true,
      expectedErrorField: SELLER_COUNTRY_SUBDIVISION_CODE_FIELD,
    },
    {
      ruleId: "IBR-150-OM",
      title:
        "Given Special Zone Supplies — When subdivision is not on the allowed list — Then the invoice should be rejected with an error. (IBR-150-OM)",
      invoiceTransactionTypeCode: TXN_SPECIAL_ZONE_SUPPLIES,
      sellerCountrySubdivisionCode: SPECIAL_ZONE_COUNTRY_SUBDIVISION_CL13,
      buyerCountrySubdivisionCode: COUNTRY_SUBDIVISION_NOT_IN_CL13,
      shouldError: true,
      expectedErrorField: BUYER_COUNTRY_SUBDIVISION_CODE_FIELD,
    },
  ];


// ---------------------------------------------------------------------------
// specialZoneSeller (IBR-151-OM)
// ---------------------------------------------------------------------------
/** IBR-151-OM: Special Zone Supplies → Seller identifier with Special Zone License scheme. */
export const SPECIAL_ZONE_SELLER_SCENARIOS: SpecialZoneSellerScenario[] = [
  {
    ruleId: "IBR-151-OM",
    title:
      "Given Special Zone Supplies — When seller uses Special Zone License — Then the invoice should be accepted. (IBR-151-OM)",
    invoiceTransactionTypeCode: TXN_SPECIAL_ZONE_SUPPLIES,
    sellerIdentifierTextualCode: SPECIAL_ZONE_LICENSE_SCHEME,
    sellerIdentifier: "SZ-LIC-001",
    shouldError: false,
    expectedErrorField: SELLER_IDENTIFIER_TEXTUAL_CODE_FIELD,
  },
  {
    ruleId: "IBR-151-OM",
    title:
      "Given Special Zone Supplies — When seller identifier is left empty — Then the invoice should be rejected with an error. (IBR-151-OM)",
    invoiceTransactionTypeCode: TXN_SPECIAL_ZONE_SUPPLIES,
    sellerIdentifierTextualCode: SPECIAL_ZONE_LICENSE_SCHEME,
    sellerIdentifier: "",
    shouldError: true,
    expectedErrorField: SELLER_IDENTIFIER_FIELD,
  },
  {
    ruleId: "IBR-151-OM",
    title:
      "Given Special Zone Supplies in Mainland Oman — When seller identifier is omitted — Then the invoice should be accepted. (IBR-151-OM)",
    invoiceTransactionTypeCode: TXN_SPECIAL_ZONE_SUPPLIES,
    sellerIdentifierTextualCode: SPECIAL_ZONE_LICENSE_SCHEME,
    sellerIdentifier: "",
    sellerCountrySubdivisionCode: MAINLAND_OMAN_COUNTRY_SUBDIVISION_CL13,
    shouldError: false,
    expectedErrorField: SELLER_IDENTIFIER_FIELD,
  },
  {
    ruleId: "IBR-151-OM",
    title:
      "Given a Full Tax invoice — When seller uses Special Zone License — Then the invoice should be rejected with an error. (IBR-151-OM)",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    sellerIdentifierTextualCode: SPECIAL_ZONE_LICENSE_SCHEME,
    sellerIdentifier: "SZ-LIC-001",
    shouldError: true,
    expectedErrorField: SELLER_IDENTIFIER_TEXTUAL_CODE_FIELD,
  },
];


// ---------------------------------------------------------------------------
// selfBilledBuyerVat (IBR-017-OM)
// ---------------------------------------------------------------------------
/** IBR-017-OM: Self-billed / RCM / PM-Self / Import Goods → Buyer VATIN mandatory. */
export const SELF_BILLED_BUYER_VAT_SCENARIOS: SelfBilledBuyerVatScenario[] = [
  ...expandAcrossSelfBilledOrRcmTxnTypes<SelfBilledBuyerVatScenario>({
    ruleId: "IBR-017-OM",
    title:
      "Given {txn} — When Buyer VATIN is provided — Then the invoice should be accepted. (IBR-017-OM)",
    buyerVatIdentifier: "OM1000091919",
    shouldError: false,
    expectedErrorField: BUYER_VAT_IDENTIFIER_FIELD,
  }),
  ...expandAcrossSelfBilledOrRcmTxnTypes<SelfBilledBuyerVatScenario>({
    ruleId: "IBR-017-OM",
    title:
      "Given {txn} — When Buyer VATIN is left empty — Then the invoice should be rejected with an error. (IBR-017-OM)",
    buyerVatIdentifier: "",
    shouldError: true,
    expectedErrorField: BUYER_VAT_IDENTIFIER_FIELD,
  }),
];


// ---------------------------------------------------------------------------
// documentAllowanceChargeRate (IBR-047 / IBR-094 category proxies)
// ---------------------------------------------------------------------------
/**
 * Covoro has no IBT-096 / IBT-103 tax-rate columns for doc allowance/charge.
 * These scenarios assert category-level polarity the portal can enforce:
 * IBR-047-OM: S allowance accepted; IBR-094-OM: Z allowance accepted with
 * Zero-rated exemption (rate 0 implied by category).
 */
export const DOCUMENT_ALLOWANCE_CHARGE_RATE_SCENARIOS: DocumentAllowanceChargeRateScenario[] =
  [
    {
      ruleId: "IBR-047-OM",
      title:
        "Given a Standard rate document allowance — When tax rate 5 is implied by the category — Then the invoice should be accepted. (IBR-047-OM)",
      kind: "allowance",
      vatCategory: STANDARD_TAX_CATEGORY_CODE,
      exemptionReason: "",
      amount: "50",
      shouldError: false,
      expectedErrorField: VAT_CATEGORY_ALLOWANCES_FIELD,
    },
    {
      ruleId: "IBR-045-OM",
      title:
        "Given a Standard rate document charge — When tax rate 5 is implied by the category — Then the invoice should be accepted. (IBR-045-OM)",
      kind: "charge",
      vatCategory: STANDARD_TAX_CATEGORY_CODE,
      exemptionReason: "",
      amount: "100",
      shouldError: false,
      expectedErrorField: VAT_CATEGORY_CHARGES_FIELD,
    },
    {
      ruleId: "IBR-094-OM",
      title:
        "Given a Zero rated document allowance — When tax rate 0 is implied by the category — Then the invoice should be accepted. (IBR-094-OM)",
      kind: "allowance",
      vatCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      exemptionReason: TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
      amount: "50",
      shouldError: false,
      expectedErrorField: VAT_CATEGORY_ALLOWANCES_FIELD,
    },
    {
      ruleId: "IBR-094-OM",
      title:
        "Given a Zero rated document allowance — When exemption reason is left empty — Then the invoice should be rejected with an error. (IBR-094-OM)",
      kind: "allowance",
      vatCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      exemptionReason: "",
      amount: "50",
      shouldError: true,
      expectedErrorField: TAX_EXEMPTION_REASON_ALLOWANCES_FIELD,
    },
  ];


// ---------------------------------------------------------------------------
// exportServiceType (IBR-155-OM)
// ---------------------------------------------------------------------------
/**
 * IBR-155-OM: Export Invoice + VAT exemption 'Export of service' → Service Type
 * (BTOM-015 / CL-12-OM) mandatory. Invalid while trigger met → fail; trigger off → ok.
 */
export const EXPORT_SERVICE_TYPE_SCENARIOS: ExportServiceTypeScenario[] = [
  {
    ruleId: "IBR-155-OM",
    title:
      "Given Export of Services — When Service Type is provided — Then the invoice should be accepted. (IBR-155-OM)",
    invoiceTransactionTypeCode: TXN_EXPORT_INVOICE,
    taxExemptionReasonCode: TAX_EXEMPTION_REASON_EXPORT_OF_SERVICES,
    serviceTypeCode: SERVICE_TYPE_CODE_SAMPLE,
    shouldError: false,
    expectedErrorField: SERVICE_TYPE_CODE_FIELD,
  },
  {
    ruleId: "IBR-155-OM",
    title:
      "Given Export of Services — When Service Type is left empty — Then the invoice should be rejected with an error. (IBR-155-OM)",
    invoiceTransactionTypeCode: TXN_EXPORT_INVOICE,
    taxExemptionReasonCode: TAX_EXEMPTION_REASON_EXPORT_OF_SERVICES,
    serviceTypeCode: "",
    shouldError: true,
    expectedErrorField: SERVICE_TYPE_CODE_FIELD,
  },
  {
    ruleId: "IBR-155-OM",
    title:
      "Given Export of Services — When Service Type is invalid — Then the invoice should be rejected with an error. (IBR-155-OM)",
    invoiceTransactionTypeCode: TXN_EXPORT_INVOICE,
    taxExemptionReasonCode: TAX_EXEMPTION_REASON_EXPORT_OF_SERVICES,
    serviceTypeCode: SERVICE_TYPE_CODE_INVALID,
    shouldError: true,
    expectedErrorField: SERVICE_TYPE_CODE_FIELD,
  },
  {
    ruleId: "IBR-155-OM",
    title:
      "Given a Full Tax invoice — When Service Type is left empty — Then the invoice should be accepted. (IBR-155-OM)",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    taxExemptionReasonCode: "",
    serviceTypeCode: "",
    shouldError: false,
    expectedErrorField: SERVICE_TYPE_CODE_FIELD,
  },
];


// ---------------------------------------------------------------------------
// exportDeliverCountryForbiddenOm (IBR-012-OM)
// ---------------------------------------------------------------------------
/** IBR-012-OM: Export + Export of Services → Deliver to country must not be OM. */
export const EXPORT_DELIVER_COUNTRY_FORBIDDEN_OM_SCENARIOS: ExportDeliverCountryForbiddenOmScenario[] =
  [
    {
      ruleId: "IBR-012-OM",
      title:
        "Given Export of Services — When Deliver to country is not Oman — Then the invoice should be accepted. (IBR-012-OM)",
      invoiceTransactionTypeCode: TXN_EXPORT_INVOICE,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_EXPORT_OF_SERVICES,
      deliverToCountryCode: UAE_COUNTRY_CODE,
      shouldError: false,
      expectedErrorField: DELIVER_TO_COUNTRY_CODE_FIELD,
    },
    {
      ruleId: "IBR-012-OM",
      title:
        "Given Export of Services — When Deliver to country is Oman — Then the invoice should be rejected with an error. (IBR-012-OM)",
      invoiceTransactionTypeCode: TXN_EXPORT_INVOICE,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_EXPORT_OF_SERVICES,
      deliverToCountryCode: OMAN_COUNTRY_CODE,
      shouldError: true,
      expectedErrorField: DELIVER_TO_COUNTRY_CODE_FIELD,
    },
    {
      ruleId: "IBR-012-OM",
      title:
        "Given a Full Tax invoice — When Deliver to country is Oman — Then the invoice should be accepted. (IBR-012-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxExemptionReasonCode: "",
      deliverToCountryCode: OMAN_COUNTRY_CODE,
      shouldError: false,
      expectedErrorField: DELIVER_TO_COUNTRY_CODE_FIELD,
    },
  ];


// ---------------------------------------------------------------------------
// exportSupportingDocument (IBR-013-OM)
// ---------------------------------------------------------------------------
/** IBR-013-OM: Export + Re-export of goods (VATZR-OM-12) → supporting document ref + UUID. */
export const EXPORT_SUPPORTING_DOCUMENT_SCENARIOS: ExportSupportingDocumentScenario[] =
  [
    {
      ruleId: "IBR-013-OM",
      title:
        "Given Export with Re-export of goods — When supporting documents are provided — Then the invoice should be accepted. (IBR-013-OM)",
      invoiceTransactionTypeCode: TXN_EXPORT_INVOICE,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_RE_EXPORT_OF_GOODS,
      supportingDocumentReference: SUPPORTING_DOCUMENT_REFERENCE_SAMPLE,
      supportingDocumentUuid: SUPPORTING_DOCUMENT_UUID_SAMPLE,
      shouldError: false,
      expectedErrorField: SUPPORTING_DOCUMENT_REFERENCE_FIELD,
    },
    {
      ruleId: "IBR-013-OM",
      title:
        "Given Export with Re-export of goods — When supporting documents are left empty — Then the invoice should be rejected with an error. (IBR-013-OM)",
      invoiceTransactionTypeCode: TXN_EXPORT_INVOICE,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_RE_EXPORT_OF_GOODS,
      supportingDocumentReference: "",
      supportingDocumentUuid: "",
      shouldError: true,
      expectedErrorField: SUPPORTING_DOCUMENT_REFERENCE_FIELD,
    },
    {
      ruleId: "IBR-013-OM",
      title:
        "Given Export with Re-export of goods — When supporting document reference is left empty — Then the invoice should be rejected with an error. (IBR-013-OM)",
      invoiceTransactionTypeCode: TXN_EXPORT_INVOICE,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_RE_EXPORT_OF_GOODS,
      supportingDocumentReference: "",
      supportingDocumentUuid: SUPPORTING_DOCUMENT_UUID_SAMPLE,
      shouldError: true,
      expectedErrorField: SUPPORTING_DOCUMENT_REFERENCE_FIELD,
    },
    {
      ruleId: "IBR-013-OM",
      title:
        "Given Export with Re-export of goods — When supporting document UUID is left empty — Then the invoice should be rejected with an error. (IBR-013-OM)",
      invoiceTransactionTypeCode: TXN_EXPORT_INVOICE,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_RE_EXPORT_OF_GOODS,
      supportingDocumentReference: SUPPORTING_DOCUMENT_REFERENCE_SAMPLE,
      supportingDocumentUuid: "",
      shouldError: true,
      expectedErrorField: SUPPORTING_DOCUMENT_UUID_FIELD,
    },
    {
      ruleId: "IBR-013-OM",
      title:
        "Given Export with another zero-rated reason — When supporting documents are left empty — Then the invoice should be accepted. (IBR-013-OM)",
      invoiceTransactionTypeCode: TXN_EXPORT_INVOICE,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
      supportingDocumentReference: "",
      supportingDocumentUuid: "",
      shouldError: false,
      expectedErrorField: SUPPORTING_DOCUMENT_REFERENCE_FIELD,
    },
    {
      ruleId: "IBR-013-OM",
      title:
        "Given a Full Tax invoice with Re-export of goods — When supporting documents are left empty — Then the invoice should be accepted. (IBR-013-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_RE_EXPORT_OF_GOODS,
      supportingDocumentReference: "",
      supportingDocumentUuid: "",
      shouldError: false,
      expectedErrorField: SUPPORTING_DOCUMENT_REFERENCE_FIELD,
    },
    {
      ruleId: "IBR-013-OM",
      title:
        "Given a Full Tax invoice — When supporting documents are left empty — Then the invoice should be accepted. (IBR-013-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxExemptionReasonCode: "",
      supportingDocumentReference: "",
      supportingDocumentUuid: "",
      shouldError: false,
      expectedErrorField: SUPPORTING_DOCUMENT_REFERENCE_FIELD,
    },
  ];


// ---------------------------------------------------------------------------
// selfBilledRcmBuyerCountry (IBR-020-OM)
// ---------------------------------------------------------------------------
/** IBR-020-OM: Self-billed / Import of Services RCM → Buyer country must be OM. */
export const SELF_BILLED_RCM_BUYER_COUNTRY_SCENARIOS: SelfBilledRcmBuyerCountryScenario[] =
  [
    ...expandAcrossSelfBilledOrRcmTxnTypes<SelfBilledRcmBuyerCountryScenario>({
      ruleId: "IBR-020-OM",
      title:
        "Given {txn} — When buyer country is Oman — Then the invoice should be accepted. (IBR-020-OM)",
      buyerCountryCode: OMAN_COUNTRY_CODE,
      shouldError: false,
      expectedErrorField: BUYER_COUNTRY_CODE_FIELD,
    }),
    ...expandAcrossSelfBilledOrRcmTxnTypes<SelfBilledRcmBuyerCountryScenario>({
      ruleId: "IBR-020-OM",
      title:
        "Given {txn} — When buyer country is UAE — Then the invoice should be rejected with an error. (IBR-020-OM)",
      buyerCountryCode: UAE_COUNTRY_CODE,
      shouldError: true,
      expectedErrorField: BUYER_COUNTRY_CODE_FIELD,
    }),
    ...expandAcrossSelfBilledOrRcmTxnTypes<SelfBilledRcmBuyerCountryScenario>({
      ruleId: "IBR-020-OM",
      title:
        "Given {txn} — When buyer country is left empty — Then the invoice should be rejected with an error. (IBR-020-OM)",
      buyerCountryCode: "",
      shouldError: true,
      expectedErrorField: BUYER_COUNTRY_CODE_FIELD,
    }),
  ];


// ---------------------------------------------------------------------------
// vatinPattern (IBR-003-OM)
// ---------------------------------------------------------------------------
/** Valid Oman VATIN samples (OM + 10 digits). */
export const IBR_003_VALID_SELLER_VATIN = "OM1108202600";
export const IBR_003_VALID_BUYER_VATIN = "OM1000091919";
export const IBR_003_VALID_THIRD_PARTY_VATIN = "OM2000091919";

/**
 * IBR-003-OM: Seller / Buyer / Third Party VATIN MUST be 12 chars — 'OM' +
 * exactly 10 digits. Valid pattern + wrong-prefix / non-digit negatives.
 */
export const VATIN_PATTERN_SCENARIOS: VatinPatternScenario[] = [
  {
    ruleId: "IBR-003-OM",
    title:
      "Given a Seller VATIN that is OM plus 10 digits — When the invoice is uploaded — Then the invoice should be accepted. (IBR-003-OM)",
    party: "seller",
    vatinValue: IBR_003_VALID_SELLER_VATIN,
    shouldError: false,
    expectedErrorField: SELLER_VAT_IDENTIFIER_FIELD,
    // Leave worker identity seller VAT (already OM + 10 digits); do not patch.
    patchSellerVatAfterGenerate: false,
  },
  {
    ruleId: "IBR-003-OM",
    title:
      "Given a Seller VATIN with prefix XX instead of OM — When the invoice is uploaded — Then the invoice should be rejected with an error. (IBR-003-OM)",
    party: "seller",
    vatinValue: "XX1108202600",
    shouldError: true,
    expectedErrorField: SELLER_VAT_IDENTIFIER_FIELD,
    patchSellerVatAfterGenerate: true,
  },
  {
    ruleId: "IBR-003-OM",
    title:
      "Given a Seller VATIN that is OM plus a non-digit — When the invoice is uploaded — Then the invoice should be rejected with an error. (IBR-003-OM)",
    party: "seller",
    vatinValue: "OM110820260A",
    shouldError: true,
    expectedErrorField: SELLER_VAT_IDENTIFIER_FIELD,
    patchSellerVatAfterGenerate: true,
  },
  {
    ruleId: "IBR-003-OM",
    title:
      "Given a Buyer VATIN that is OM plus 10 digits — When the invoice is uploaded — Then the invoice should be accepted. (IBR-003-OM)",
    party: "buyer",
    vatinValue: IBR_003_VALID_BUYER_VATIN,
    shouldError: false,
    expectedErrorField: BUYER_VAT_IDENTIFIER_FIELD,
  },
  {
    ruleId: "IBR-003-OM",
    title:
      "Given a Buyer VATIN with prefix XX instead of OM — When the invoice is uploaded — Then the invoice should be rejected with an error. (IBR-003-OM)",
    party: "buyer",
    vatinValue: "XX1000091919",
    shouldError: true,
    expectedErrorField: BUYER_VAT_IDENTIFIER_FIELD,
  },
  {
    ruleId: "IBR-003-OM",
    title:
      "Given a Buyer VATIN that is OM plus a non-digit — When the invoice is uploaded — Then the invoice should be rejected with an error. (IBR-003-OM)",
    party: "buyer",
    vatinValue: "OM100009191A",
    shouldError: true,
    expectedErrorField: BUYER_VAT_IDENTIFIER_FIELD,
  },
  {
    ruleId: "IBR-003-OM",
    title:
      "Given a Third Party VATIN that is OM plus 10 digits — When the invoice is uploaded — Then the invoice should be accepted. (IBR-003-OM)",
    party: "thirdParty",
    vatinValue: IBR_003_VALID_THIRD_PARTY_VATIN,
    shouldError: false,
    expectedErrorField: THIRD_PARTY_VATIN_FIELD,
  },
  {
    ruleId: "IBR-003-OM",
    title:
      "Given a Third Party VATIN with prefix XX instead of OM — When the invoice is uploaded — Then the invoice should be rejected with an error. (IBR-003-OM)",
    party: "thirdParty",
    vatinValue: "XX2000091919",
    shouldError: true,
    expectedErrorField: THIRD_PARTY_VATIN_FIELD,
  },
  {
    ruleId: "IBR-003-OM",
    title:
      "Given a Third Party VATIN that is OM plus a non-digit — When the invoice is uploaded — Then the invoice should be rejected with an error. (IBR-003-OM)",
    party: "thirdParty",
    vatinValue: "OM200009191A",
    shouldError: true,
    expectedErrorField: THIRD_PARTY_VATIN_FIELD,
  },
];

// ---------------------------------------------------------------------------
// vatBreakdownCategoryPresence (ALIGNED-IBRP-E/O/S/Z-01-OM)
// ---------------------------------------------------------------------------
/**
 * Covoro Excel has no separate IBG-23 VAT category column — line Tax Category
 * is the IBT-118 proxy. E-01 / O-01 / S-01 / Z-01 also drive IBT-95 (allowance) and
 * IBT-102 (charge). Blank/whitespace/null Excel negatives collapse to empty
 * Tax Category (omit). Simplified Tax Invoice is the documented exception.
 */
export const VAT_BREAKDOWN_CATEGORY_PRESENCE_SCENARIOS: VatBreakdownCategoryPresenceScenario[] =
  [
    // E-01
    {
      ruleId: "ALIGNED-IBRP-E-01-OM",
      title:
        "Given a Full Tax invoice — When Exempt VAT breakdown is present — Then the invoice should be accepted. (ALIGNED-IBRP-E-01-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      taxRate: null,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_SAMPLE,
      shouldError: false,
      expectedErrorField: TAX_CATEGORY_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-E-01-OM",
      title:
        "Given a Full Tax invoice — When Exempt VAT breakdown is left empty — Then the invoice should be rejected with an error. (ALIGNED-IBRP-E-01-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: "",
      taxRate: null,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_SAMPLE,
      shouldError: true,
      expectedErrorField: TAX_CATEGORY_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-E-01-OM",
      title:
        "Given a Full Tax invoice — When Exempt VAT breakdown is only spaces — Then the invoice should be rejected with an error. (ALIGNED-IBRP-E-01-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: "   ",
      taxRate: null,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_SAMPLE,
      shouldError: true,
      expectedErrorField: TAX_CATEGORY_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-E-01-OM",
      title:
        "Given a Full Tax invoice with no Exempt VAT — When the invoice is uploaded — Then the invoice should be accepted. (ALIGNED-IBRP-E-01-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      taxExemptionReasonCode: "",
      shouldError: false,
      expectedErrorField: TAX_CATEGORY_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-E-01-OM",
      title:
        "Given a Simplified invoice — When Exempt VAT breakdown is omitted — Then the invoice should be accepted. (ALIGNED-IBRP-E-01-OM)",
      invoiceTransactionTypeCode: TXN_SIMPLIFIED_TAX_INVOICE,
      taxCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      taxRate: null,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_SAMPLE,
      shouldError: false,
      expectedErrorField: TAX_CATEGORY_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-E-01-OM",
      title:
        "Given a Full Tax invoice with an Exempt allowance — When Exempt VAT breakdown is present — Then the invoice should be accepted. (ALIGNED-IBRP-E-01-OM)",
      source: "allowance",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      taxRate: null,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_SAMPLE,
      shouldError: false,
      expectedErrorField: VAT_CATEGORY_ALLOWANCES_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-E-01-OM",
      title:
        "Given a Full Tax invoice with an Exempt allowance — When Exempt VAT breakdown is missing — Then the invoice should be rejected with an error. (ALIGNED-IBRP-E-01-OM)",
      source: "allowance",
      breakdownMatches: false,
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_SAMPLE,
      shouldError: true,
      expectedErrorField: VAT_CATEGORY_ALLOWANCES_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-E-01-OM",
      title:
        "Given a Simplified invoice with an Exempt allowance — When Exempt VAT breakdown is omitted — Then the invoice should be accepted. (ALIGNED-IBRP-E-01-OM)",
      source: "allowance",
      breakdownMatches: false,
      invoiceTransactionTypeCode: TXN_SIMPLIFIED_TAX_INVOICE,
      taxCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_SAMPLE,
      shouldError: false,
      expectedErrorField: VAT_CATEGORY_ALLOWANCES_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-E-01-OM",
      title:
        "Given a Full Tax invoice with an Exempt charge — When Exempt VAT breakdown is present — Then the invoice should be accepted. (ALIGNED-IBRP-E-01-OM)",
      source: "charge",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      taxRate: null,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_SAMPLE,
      shouldError: false,
      expectedErrorField: VAT_CATEGORY_CHARGES_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-E-01-OM",
      title:
        "Given a Full Tax invoice with an Exempt charge — When Exempt VAT breakdown is missing — Then the invoice should be rejected with an error. (ALIGNED-IBRP-E-01-OM)",
      source: "charge",
      breakdownMatches: false,
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_SAMPLE,
      shouldError: true,
      expectedErrorField: VAT_CATEGORY_CHARGES_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-E-01-OM",
      title:
        "Given a Simplified invoice with an Exempt charge — When Exempt VAT breakdown is omitted — Then the invoice should be accepted. (ALIGNED-IBRP-E-01-OM)",
      source: "charge",
      breakdownMatches: false,
      invoiceTransactionTypeCode: TXN_SIMPLIFIED_TAX_INVOICE,
      taxCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_SAMPLE,
      shouldError: false,
      expectedErrorField: VAT_CATEGORY_CHARGES_FIELD,
    },
    // O-01
    {
      ruleId: "ALIGNED-IBRP-O-01-OM",
      title:
        "Given a Full Tax invoice — When Not subject VAT breakdown is present — Then the invoice should be accepted. (ALIGNED-IBRP-O-01-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxRate: null,
      taxExemptionReasonCode: "",
      shouldError: false,
      expectedErrorField: TAX_CATEGORY_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-O-01-OM",
      title:
        "Given a Full Tax invoice — When Not subject VAT breakdown is left empty — Then the invoice should be rejected with an error. (ALIGNED-IBRP-O-01-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: "",
      taxRate: null,
      taxExemptionReasonCode: "",
      shouldError: true,
      expectedErrorField: TAX_CATEGORY_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-O-01-OM",
      title:
        "Given a Full Tax invoice with no Not subject VAT — When the invoice is uploaded — Then the invoice should be accepted. (ALIGNED-IBRP-O-01-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      taxExemptionReasonCode: "",
      shouldError: false,
      expectedErrorField: TAX_CATEGORY_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-O-01-OM",
      title:
        "Given a Simplified invoice — When Not subject VAT breakdown is omitted — Then the invoice should be accepted. (ALIGNED-IBRP-O-01-OM)",
      invoiceTransactionTypeCode: TXN_SIMPLIFIED_TAX_INVOICE,
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxRate: null,
      taxExemptionReasonCode: "",
      shouldError: false,
      expectedErrorField: TAX_CATEGORY_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-O-01-OM",
      title:
        "Given a Full Tax invoice with a Not subject allowance — When Not subject VAT breakdown is present — Then the invoice should be accepted. (ALIGNED-IBRP-O-01-OM)",
      source: "allowance",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxRate: null,
      taxExemptionReasonCode: "",
      shouldError: false,
      expectedErrorField: VAT_CATEGORY_ALLOWANCES_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-O-01-OM",
      title:
        "Given a Full Tax invoice with a Not subject allowance — When Not subject VAT breakdown is missing — Then the invoice should be rejected with an error. (ALIGNED-IBRP-O-01-OM)",
      source: "allowance",
      breakdownMatches: false,
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      taxExemptionReasonCode: "",
      shouldError: true,
      expectedErrorField: VAT_CATEGORY_ALLOWANCES_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-O-01-OM",
      title:
        "Given a Simplified invoice with a Not subject allowance — When Not subject VAT breakdown is omitted — Then the invoice should be accepted. (ALIGNED-IBRP-O-01-OM)",
      source: "allowance",
      breakdownMatches: false,
      invoiceTransactionTypeCode: TXN_SIMPLIFIED_TAX_INVOICE,
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      taxExemptionReasonCode: "",
      shouldError: false,
      expectedErrorField: VAT_CATEGORY_ALLOWANCES_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-O-01-OM",
      title:
        "Given a Full Tax invoice with a Not subject charge — When Not subject VAT breakdown is present — Then the invoice should be accepted. (ALIGNED-IBRP-O-01-OM)",
      source: "charge",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxRate: null,
      taxExemptionReasonCode: "",
      shouldError: false,
      expectedErrorField: VAT_CATEGORY_CHARGES_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-O-01-OM",
      title:
        "Given a Full Tax invoice with a Not subject charge — When Not subject VAT breakdown is missing — Then the invoice should be rejected with an error. (ALIGNED-IBRP-O-01-OM)",
      source: "charge",
      breakdownMatches: false,
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      taxExemptionReasonCode: "",
      shouldError: true,
      expectedErrorField: VAT_CATEGORY_CHARGES_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-O-01-OM",
      title:
        "Given a Simplified invoice with a Not subject charge — When Not subject VAT breakdown is omitted — Then the invoice should be accepted. (ALIGNED-IBRP-O-01-OM)",
      source: "charge",
      breakdownMatches: false,
      invoiceTransactionTypeCode: TXN_SIMPLIFIED_TAX_INVOICE,
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      taxExemptionReasonCode: "",
      shouldError: false,
      expectedErrorField: VAT_CATEGORY_CHARGES_FIELD,
    },
    // S-01
    {
      ruleId: "ALIGNED-IBRP-S-01-OM",
      title:
        "Given a Full Tax invoice — When Standard rate VAT breakdown is present — Then the invoice should be accepted. (ALIGNED-IBRP-S-01-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      taxExemptionReasonCode: "",
      shouldError: false,
      expectedErrorField: TAX_CATEGORY_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-S-01-OM",
      title:
        "Given a Full Tax invoice — When Standard rate VAT breakdown is left empty — Then the invoice should be rejected with an error. (ALIGNED-IBRP-S-01-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: "",
      taxRate: TAX_RATE_STANDARD_OMAN,
      taxExemptionReasonCode: "",
      shouldError: true,
      expectedErrorField: TAX_CATEGORY_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-S-01-OM",
      title:
        "Given a Simplified invoice — When Standard rate VAT breakdown is omitted — Then the invoice should be accepted. (ALIGNED-IBRP-S-01-OM)",
      invoiceTransactionTypeCode: TXN_SIMPLIFIED_TAX_INVOICE,
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      taxExemptionReasonCode: "",
      shouldError: false,
      expectedErrorField: TAX_CATEGORY_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-S-01-OM",
      title:
        "Given a Full Tax invoice with a Standard rate allowance — When Standard rate VAT breakdown is present — Then the invoice should be accepted. (ALIGNED-IBRP-S-01-OM)",
      source: "allowance",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      taxExemptionReasonCode: "",
      shouldError: false,
      expectedErrorField: VAT_CATEGORY_ALLOWANCES_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-S-01-OM",
      title:
        "Given a Full Tax invoice with a Standard rate allowance — When Standard rate VAT breakdown is missing — Then the invoice should be rejected with an error. (ALIGNED-IBRP-S-01-OM)",
      source: "allowance",
      breakdownMatches: false,
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      taxExemptionReasonCode: "",
      shouldError: true,
      expectedErrorField: VAT_CATEGORY_ALLOWANCES_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-S-01-OM",
      title:
        "Given a Full Tax invoice with a Standard rate charge — When Standard rate VAT breakdown is present — Then the invoice should be accepted. (ALIGNED-IBRP-S-01-OM)",
      source: "charge",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      taxExemptionReasonCode: "",
      shouldError: false,
      expectedErrorField: VAT_CATEGORY_CHARGES_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-S-01-OM",
      title:
        "Given a Full Tax invoice with a Standard rate charge — When Standard rate VAT breakdown is missing — Then the invoice should be rejected with an error. (ALIGNED-IBRP-S-01-OM)",
      source: "charge",
      breakdownMatches: false,
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      taxExemptionReasonCode: "",
      shouldError: true,
      expectedErrorField: VAT_CATEGORY_CHARGES_FIELD,
    },
    // Z-01
    {
      ruleId: "ALIGNED-IBRP-Z-01-OM",
      title:
        "Given a Full Tax invoice — When Zero rated VAT breakdown is present — Then the invoice should be accepted. (ALIGNED-IBRP-Z-01-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_ZERO,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
      shouldError: false,
      expectedErrorField: TAX_CATEGORY_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-Z-01-OM",
      title:
        "Given a Full Tax invoice — When Zero rated VAT breakdown is left empty — Then the invoice should be rejected with an error. (ALIGNED-IBRP-Z-01-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: "",
      taxRate: TAX_RATE_ZERO,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
      shouldError: true,
      expectedErrorField: TAX_CATEGORY_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-Z-01-OM",
      title:
        "Given a Full Tax invoice with no Zero rated VAT — When the invoice is uploaded — Then the invoice should be accepted. (ALIGNED-IBRP-Z-01-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      taxExemptionReasonCode: "",
      shouldError: false,
      expectedErrorField: TAX_CATEGORY_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-Z-01-OM",
      title:
        "Given a Simplified invoice — When Zero rated VAT breakdown is omitted — Then the invoice should be accepted. (ALIGNED-IBRP-Z-01-OM)",
      invoiceTransactionTypeCode: TXN_SIMPLIFIED_TAX_INVOICE,
      taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_ZERO,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
      shouldError: false,
      expectedErrorField: TAX_CATEGORY_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-Z-01-OM",
      title:
        "Given a Full Tax invoice with a Zero rated allowance — When Zero rated VAT breakdown is present — Then the invoice should be accepted. (ALIGNED-IBRP-Z-01-OM)",
      source: "allowance",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_ZERO,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
      shouldError: false,
      expectedErrorField: VAT_CATEGORY_ALLOWANCES_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-Z-01-OM",
      title:
        "Given a Full Tax invoice with a Zero rated allowance — When Zero rated VAT breakdown is missing — Then the invoice should be rejected with an error. (ALIGNED-IBRP-Z-01-OM)",
      source: "allowance",
      breakdownMatches: false,
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
      shouldError: true,
      expectedErrorField: VAT_CATEGORY_ALLOWANCES_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-Z-01-OM",
      title:
        "Given a Simplified invoice with a Zero rated allowance — When Zero rated VAT breakdown is omitted — Then the invoice should be accepted. (ALIGNED-IBRP-Z-01-OM)",
      source: "allowance",
      breakdownMatches: false,
      invoiceTransactionTypeCode: TXN_SIMPLIFIED_TAX_INVOICE,
      taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
      shouldError: false,
      expectedErrorField: VAT_CATEGORY_ALLOWANCES_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-Z-01-OM",
      title:
        "Given a Full Tax invoice with a Zero rated charge — When Zero rated VAT breakdown is present — Then the invoice should be accepted. (ALIGNED-IBRP-Z-01-OM)",
      source: "charge",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_ZERO,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
      shouldError: false,
      expectedErrorField: VAT_CATEGORY_CHARGES_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-Z-01-OM",
      title:
        "Given a Full Tax invoice with a Zero rated charge — When Zero rated VAT breakdown is missing — Then the invoice should be rejected with an error. (ALIGNED-IBRP-Z-01-OM)",
      source: "charge",
      breakdownMatches: false,
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
      shouldError: true,
      expectedErrorField: VAT_CATEGORY_CHARGES_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-Z-01-OM",
      title:
        "Given a Simplified invoice with a Zero rated charge — When Zero rated VAT breakdown is omitted — Then the invoice should be accepted. (ALIGNED-IBRP-Z-01-OM)",
      source: "charge",
      breakdownMatches: false,
      invoiceTransactionTypeCode: TXN_SIMPLIFIED_TAX_INVOICE,
      taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
      shouldError: false,
      expectedErrorField: VAT_CATEGORY_CHARGES_FIELD,
    },
  ];

// ---------------------------------------------------------------------------
// lineItemVatAmount (IBR-038 / 039 / 054 / 077-OM)
// ---------------------------------------------------------------------------
export const LINE_ITEM_VAT_AMOUNT_REQUIRED_SCENARIOS: LineItemVatAmountRequiredScenario[] =
  [
    {
      ruleId: "IBR-038-OM",
      title:
        "Given a Full Tax invoice — When line VAT amount is provided — Then the invoice should be accepted. (IBR-038-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      lineItemVatAmount: "50",
      shouldError: false,
      expectedErrorField: LINE_ITEM_VAT_AMOUNT_FIELD,
    },
    {
      ruleId: "IBR-038-OM",
      title:
        "Given a Full Tax invoice — When line VAT amount is left empty — Then the invoice should be rejected with an error. (IBR-038-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      lineItemVatAmount: "",
      shouldError: true,
      expectedErrorField: LINE_ITEM_VAT_AMOUNT_FIELD,
    },
    {
      ruleId: "IBR-038-OM",
      title:
        "Given a Simplified invoice — When line VAT amount is left empty — Then the invoice should be accepted. (IBR-038-OM)",
      invoiceTransactionTypeCode: TXN_SIMPLIFIED_TAX_INVOICE,
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      lineItemVatAmount: "",
      shouldError: false,
      expectedErrorField: LINE_ITEM_VAT_AMOUNT_FIELD,
    },
    {
      ruleId: "IBR-038-OM",
      title:
        "Given a Full Tax Exempt invoice — When line VAT amount is left empty — Then the invoice should be rejected with an error. (IBR-038-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      taxRate: null,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_SAMPLE,
      lineItemVatAmount: "",
      shouldError: true,
      expectedErrorField: LINE_ITEM_VAT_AMOUNT_FIELD,
    },
    {
      ruleId: "IBR-038-OM",
      title:
        "Given a Full Tax Zero rated invoice — When line VAT amount is left empty — Then the invoice should be rejected with an error. (IBR-038-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_ZERO,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
      lineItemVatAmount: "",
      shouldError: true,
      expectedErrorField: LINE_ITEM_VAT_AMOUNT_FIELD,
    },
  ];

export const LINE_ITEM_VAT_AMOUNT_ZERO_SCENARIOS: LineItemVatAmountZeroScenario[] =
  [
    {
      ruleId: "IBR-039-OM",
      title:
        "Given Exempt VAT — When line VAT amount is 0 — Then the invoice should be accepted. (IBR-039-OM)",
      taxCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      taxRate: null,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_SAMPLE,
      lineItemVatAmount: "0",
      shouldError: false,
      expectedErrorField: LINE_ITEM_VAT_AMOUNT_FIELD,
    },
    {
      ruleId: "IBR-039-OM",
      title:
        "Given Exempt VAT — When line VAT amount is 50 — Then the invoice should be rejected with an error. (IBR-039-OM)",
      taxCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      taxRate: null,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_SAMPLE,
      lineItemVatAmount: "50",
      shouldError: true,
      expectedErrorField: LINE_ITEM_VAT_AMOUNT_FIELD,
    },
    {
      ruleId: "IBR-054-OM",
      title:
        "Given Not subject to VAT — When line VAT amount is 0 — Then the invoice should be accepted. (IBR-054-OM)",
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxRate: null,
      lineItemVatAmount: "0",
      shouldError: false,
      expectedErrorField: LINE_ITEM_VAT_AMOUNT_FIELD,
    },
    {
      ruleId: "IBR-054-OM",
      title:
        "Given Not subject to VAT — When line VAT amount is 50 — Then the invoice should be rejected with an error. (IBR-054-OM)",
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxRate: null,
      lineItemVatAmount: "50",
      shouldError: true,
      expectedErrorField: LINE_ITEM_VAT_AMOUNT_FIELD,
    },
    {
      ruleId: "IBR-077-OM",
      title:
        "Given Zero rated VAT — When line VAT amount is 0 — Then the invoice should be accepted. (IBR-077-OM)",
      taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_ZERO,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
      lineItemVatAmount: "0",
      shouldError: false,
      expectedErrorField: LINE_ITEM_VAT_AMOUNT_FIELD,
    },
    {
      ruleId: "IBR-077-OM",
      title:
        "Given Zero rated VAT — When line VAT amount is 50 — Then the invoice should be rejected with an error. (IBR-077-OM)",
      taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_ZERO,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
      lineItemVatAmount: "50",
      shouldError: true,
      expectedErrorField: LINE_ITEM_VAT_AMOUNT_FIELD,
    },
  ];

// ---------------------------------------------------------------------------
// vatCategoryTaxAmount (ALIGNED-IBRP-E-09-OM)
// ---------------------------------------------------------------------------
export const VAT_CATEGORY_TAX_AMOUNT_E09_SCENARIOS: VatCategoryTaxAmountE09Scenario[] =
  [
    {
      ruleId: "ALIGNED-IBRP-E-09-OM",
      title:
        "Given a Full Tax Exempt invoice — When VAT category tax amount is 0 — Then the invoice should be accepted. (ALIGNED-IBRP-E-09-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      taxRate: null,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_SAMPLE,
      vatCategoryTaxAmount: "0",
      shouldError: false,
      expectedErrorField: INVOICE_TOTAL_TAX_AMOUNT_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-E-09-OM",
      title:
        "Given a Full Tax Exempt invoice — When VAT category tax amount is 50 — Then the invoice should be rejected with an error. (ALIGNED-IBRP-E-09-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      taxRate: null,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_SAMPLE,
      vatCategoryTaxAmount: "50",
      shouldError: true,
      expectedErrorField: INVOICE_TOTAL_TAX_AMOUNT_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-E-09-OM",
      title:
        "Given a Simplified Exempt invoice — When VAT category tax amount is 0 — Then the invoice should be accepted. (ALIGNED-IBRP-E-09-OM)",
      invoiceTransactionTypeCode: TXN_SIMPLIFIED_TAX_INVOICE,
      taxCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      taxRate: null,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_SAMPLE,
      vatCategoryTaxAmount: "0",
      shouldError: false,
      expectedErrorField: INVOICE_TOTAL_TAX_AMOUNT_FIELD,
    },
  ];

// ---------------------------------------------------------------------------
// vatCategoryTaxAmount (ALIGNED-IBRP-O-09-OM)
// ---------------------------------------------------------------------------
export const VAT_CATEGORY_TAX_AMOUNT_O09_SCENARIOS: VatCategoryTaxAmountO09Scenario[] =
  [
    {
      ruleId: "ALIGNED-IBRP-O-09-OM",
      title:
        "Given a Full Tax Not subject invoice — When VAT category tax amount is 0 — Then the invoice should be accepted. (ALIGNED-IBRP-O-09-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxRate: null,
      taxExemptionReasonCode: "",
      vatCategoryTaxAmount: "0",
      shouldError: false,
      expectedErrorField: INVOICE_TOTAL_TAX_AMOUNT_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-O-09-OM",
      title:
        "Given a Full Tax Not subject invoice — When VAT category tax amount is 50 — Then the invoice should be rejected with an error. (ALIGNED-IBRP-O-09-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxRate: null,
      taxExemptionReasonCode: "",
      vatCategoryTaxAmount: "50",
      shouldError: true,
      expectedErrorField: INVOICE_TOTAL_TAX_AMOUNT_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-O-09-OM",
      title:
        "Given a Simplified Not subject invoice — When VAT category tax amount is 0 — Then the invoice should be accepted. (ALIGNED-IBRP-O-09-OM)",
      invoiceTransactionTypeCode: TXN_SIMPLIFIED_TAX_INVOICE,
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxRate: null,
      taxExemptionReasonCode: "",
      vatCategoryTaxAmount: "0",
      shouldError: false,
      expectedErrorField: INVOICE_TOTAL_TAX_AMOUNT_FIELD,
    },
  ];

// ---------------------------------------------------------------------------
// vatCategoryTaxAmount (ALIGNED-IBRP-Z-09-OM)
// ---------------------------------------------------------------------------
export const VAT_CATEGORY_TAX_AMOUNT_Z09_SCENARIOS: VatCategoryTaxAmountZ09Scenario[] =
  [
    {
      ruleId: "ALIGNED-IBRP-Z-09-OM",
      title:
        "Given a Full Tax Zero rated invoice — When VAT category tax amount is 0 — Then the invoice should be accepted. (ALIGNED-IBRP-Z-09-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_ZERO,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
      vatCategoryTaxAmount: "0",
      shouldError: false,
      expectedErrorField: INVOICE_TOTAL_TAX_AMOUNT_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-Z-09-OM",
      title:
        "Given a Full Tax Zero rated invoice — When VAT category tax amount is 50 — Then the invoice should be rejected with an error. (ALIGNED-IBRP-Z-09-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_ZERO,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
      vatCategoryTaxAmount: "50",
      shouldError: true,
      expectedErrorField: INVOICE_TOTAL_TAX_AMOUNT_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-Z-09-OM",
      title:
        "Given a Simplified Zero rated invoice — When VAT category tax amount is 0 — Then the invoice should be accepted. (ALIGNED-IBRP-Z-09-OM)",
      invoiceTransactionTypeCode: TXN_SIMPLIFIED_TAX_INVOICE,
      taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_ZERO,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
      vatCategoryTaxAmount: "0",
      shouldError: false,
      expectedErrorField: INVOICE_TOTAL_TAX_AMOUNT_FIELD,
    },
  ];

// ---------------------------------------------------------------------------
// txnMutualExclusion (IBR-149-OM) — full partner set, Master descriptions
// ---------------------------------------------------------------------------
export const TXN_MUTUAL_EXCLUSION_SCENARIOS: TxnPairExclusionScenario[] =
  IBR_149_TXN_EXCLUSION_SCENARIOS;

// ---------------------------------------------------------------------------
// sellerVatMandatory (IBR-006-OM)
// ---------------------------------------------------------------------------
export const SELLER_VAT_MANDATORY_SCENARIOS: SellerVatMandatoryScenario[] = [
  {
    ruleId: "IBR-006-OM",
    title:
      "Given a Full Tax invoice — When Seller VATIN is provided — Then the invoice should be accepted. (IBR-006-OM)",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    sellerVatIdentifier: IBR_003_VALID_SELLER_VATIN,
    shouldError: false,
    expectedErrorField: SELLER_VAT_IDENTIFIER_FIELD,
  },
  {
    ruleId: "IBR-006-OM",
    title:
      "Given a Full Tax invoice — When Seller VATIN is left empty — Then the invoice should be rejected with an error. (IBR-006-OM)",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    sellerVatIdentifier: "",
    patchSellerVatAfterGenerate: true,
    shouldError: true,
    expectedErrorField: SELLER_VAT_IDENTIFIER_FIELD,
  },
  {
    ruleId: "IBR-006-OM",
    title:
      "Given Import of Goods — When Seller VATIN is left empty — Then the invoice should be accepted. (IBR-006-OM)",
    invoiceTransactionTypeCode: TXN_IMPORT_OF_GOODS,
    sellerVatIdentifier: "",
    patchSellerVatAfterGenerate: true,
    shouldError: false,
    expectedErrorField: SELLER_VAT_IDENTIFIER_FIELD,
  },
  {
    ruleId: "IBR-006-OM",
    title:
      "Given Import of Services (RCM) — When Seller VATIN is left empty — Then the invoice should be accepted. (IBR-006-OM)",
    invoiceTransactionTypeCode: TXN_IMPORT_OF_SERVICES_RCM,
    sellerVatIdentifier: "",
    patchSellerVatAfterGenerate: true,
    shouldError: false,
    expectedErrorField: SELLER_VAT_IDENTIFIER_FIELD,
  },
  {
    ruleId: "IBR-006-OM",
    title:
      "Given Profit Margin Self-Invoice — When Seller VATIN is left empty — Then the invoice should be accepted. (IBR-006-OM)",
    invoiceTransactionTypeCode: TXN_PROFIT_MARGIN_SELF_INVOICE,
    sellerVatIdentifier: "",
    patchSellerVatAfterGenerate: true,
    shouldError: false,
    expectedErrorField: SELLER_VAT_IDENTIFIER_FIELD,
  },
];

// ---------------------------------------------------------------------------
// sellerIdentifierScheme (IBR-007-OM)
// ---------------------------------------------------------------------------
/** IBR-007-OM: named txn types require Seller identifier scheme (IBT-029-1). */
export const SELLER_IDENTIFIER_SCHEME_SCENARIOS: SellerIdentifierSchemeScenario[] =
  [
    ...expandAcrossIbr007SellerSchemeTxnTypes<SellerIdentifierSchemeScenario>({
      ruleId: "IBR-007-OM",
      title:
        "Given {txn} — When Seller identifier scheme is provided — Then the invoice should be accepted. (IBR-007-OM)",
      sellerIdentifierSchemeProvided: true,
      shouldError: false,
      expectedErrorField: SELLER_IDENTIFIER_SCHEME_FIELD,
    }),
    ...expandAcrossIbr007SellerSchemeTxnTypes<SellerIdentifierSchemeScenario>({
      ruleId: "IBR-007-OM",
      title:
        "Given {txn} — When Seller identifier scheme is left empty — Then the invoice should be rejected with an error. (IBR-007-OM)",
      sellerIdentifierSchemeProvided: false,
      shouldError: true,
      expectedErrorField: SELLER_IDENTIFIER_SCHEME_FIELD,
    }),
  ];

// ---------------------------------------------------------------------------
// buyerIdOrVatin (IBR-016-OM)
// ---------------------------------------------------------------------------
export const BUYER_ID_OR_VATIN_SCENARIOS: BuyerIdOrVatinScenario[] = [
  ...expandAcrossIbr016BuyerIdOrVatinTxnTypes<BuyerIdOrVatinScenario>({
    ruleId: "IBR-016-OM",
    title:
      "Given {txn} — When only Buyer VATIN is provided — Then the invoice should be accepted. (IBR-016-OM)",
    buyerIdentifier: "",
    buyerVatIdentifier: IBR_003_VALID_BUYER_VATIN,
    shouldError: false,
    expectedErrorField: BUYER_VAT_IDENTIFIER_FIELD,
  }),
  {
    ruleId: "IBR-016-OM",
    title:
      "Given a Full Tax Invoice — When only Buyer identifier is provided — Then the invoice should be accepted. (IBR-016-OM)",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    buyerIdentifier: "OM-BUYER-001",
    buyerVatIdentifier: "",
    shouldError: false,
    expectedErrorField: BUYER_IDENTIFIER_FIELD,
  },
  ...expandAcrossIbr016BuyerIdOrVatinTxnTypes<BuyerIdOrVatinScenario>({
    ruleId: "IBR-016-OM",
    title:
      "Given {txn} — When Buyer identifier and VATIN are left empty — Then the invoice should be rejected with an error. (IBR-016-OM)",
    buyerIdentifier: "",
    buyerVatIdentifier: "",
    shouldError: true,
    expectedErrorField: BUYER_VAT_IDENTIFIER_FIELD,
  }),
];

// ---------------------------------------------------------------------------
// sellerAddressRequired (IBR-010-OM)
// ---------------------------------------------------------------------------
const SELLER_ADDRESS_COMPLETE = {
  addressLine1: "Building 12, Al Khuwair",
  addressLine2: "Way 1234",
  addressLine3: "Block 234",
  city: "Muscat",
  postCode: "133",
} as const;

/** IBR-010-OM: IBG-05 Seller postal address fields must all be provided. */
export const SELLER_ADDRESS_REQUIRED_SCENARIOS: SellerAddressRequiredScenario[] =
  [
    {
      ruleId: "IBR-010-OM",
      title:
        "Given a complete Seller postal address — When the invoice is uploaded — Then the invoice should be accepted. (IBR-010-OM)",
      ...SELLER_ADDRESS_COMPLETE,
      shouldError: false,
      expectedErrorField: SELLER_ADDRESS_LINE_1_FIELD,
    },
    {
      ruleId: "IBR-010-OM",
      title:
        "Given Seller postal address — When address line 1 is left empty — Then the invoice should be rejected with an error. (IBR-010-OM)",
      ...SELLER_ADDRESS_COMPLETE,
      addressLine1: "",
      shouldError: true,
      expectedErrorField: SELLER_ADDRESS_LINE_1_FIELD,
    },
    {
      ruleId: "IBR-010-OM",
      title:
        "Given Seller postal address — When address line 2 is left empty — Then the invoice should be rejected with an error. (IBR-010-OM)",
      ...SELLER_ADDRESS_COMPLETE,
      addressLine2: "",
      shouldError: true,
      expectedErrorField: SELLER_ADDRESS_LINE_2_FIELD,
    },
    {
      ruleId: "IBR-010-OM",
      title:
        "Given Seller postal address — When address line 3 is left empty — Then the invoice should be rejected with an error. (IBR-010-OM)",
      ...SELLER_ADDRESS_COMPLETE,
      addressLine3: "",
      shouldError: true,
      expectedErrorField: SELLER_ADDRESS_LINE_3_FIELD,
    },
    {
      ruleId: "IBR-010-OM",
      title:
        "Given Seller postal address — When city is left empty — Then the invoice should be rejected with an error. (IBR-010-OM)",
      ...SELLER_ADDRESS_COMPLETE,
      city: "",
      shouldError: true,
      expectedErrorField: SELLER_CITY_FIELD,
    },
    {
      ruleId: "IBR-010-OM",
      title:
        "Given Seller postal address — When post code is left empty — Then the invoice should be rejected with an error. (IBR-010-OM)",
      ...SELLER_ADDRESS_COMPLETE,
      postCode: "",
      shouldError: true,
      expectedErrorField: SELLER_POST_CODE_FIELD,
    },
  ];

// ---------------------------------------------------------------------------
// thirdPartyRequired (IBR-015-OM)
// ---------------------------------------------------------------------------
const THIRD_PARTY_COMPLETE = {
  thirdPartyName: "Oman Third Party LLC",
  thirdPartyVatin: IBR_003_VALID_THIRD_PARTY_VATIN,
  addressLine1: "TP Building 1",
  addressLine2: "TP Street",
  addressLine3: "TP Area",
  city: "Muscat",
  postalCode: "100",
  countryCode: OMAN_COUNTRY_CODE,
} as const;

/**
 * IBR-015-OM: Third-party Invoice (XXX1XXXXXXXXXXXXXXXX) requires the third-party
 * party block. BTOM-06-1 VAT Scheme Code and "occur only once" are Excel N/A.
 */
export const THIRD_PARTY_REQUIRED_SCENARIOS: ThirdPartyRequiredScenario[] = [
  {
    ruleId: "IBR-015-OM",
    title:
      "Given a Third-party invoice — When the third party block is complete — Then the invoice should be accepted. (IBR-015-OM)",
    invoiceTransactionTypeCode: TXN_THIRD_PARTY_INVOICE,
    ...THIRD_PARTY_COMPLETE,
    shouldError: false,
    expectedErrorField: THIRD_PARTY_NAME_FIELD,
  },
  {
    ruleId: "IBR-015-OM",
    title:
      "Given a Third-party invoice — When Third Party Name is left empty — Then the invoice should be rejected with an error. (IBR-015-OM)",
    invoiceTransactionTypeCode: TXN_THIRD_PARTY_INVOICE,
    ...THIRD_PARTY_COMPLETE,
    thirdPartyName: "",
    shouldError: true,
    expectedErrorField: THIRD_PARTY_NAME_FIELD,
  },
  {
    ruleId: "IBR-015-OM",
    title:
      "Given a Third-party invoice — When Third Party VATIN is left empty — Then the invoice should be rejected with an error. (IBR-015-OM)",
    invoiceTransactionTypeCode: TXN_THIRD_PARTY_INVOICE,
    ...THIRD_PARTY_COMPLETE,
    thirdPartyVatin: "",
    shouldError: true,
    expectedErrorField: THIRD_PARTY_VATIN_FIELD,
  },
  {
    ruleId: "IBR-015-OM",
    title:
      "Given a Third-party invoice — When Address Line 1 is left empty — Then the invoice should be rejected with an error. (IBR-015-OM)",
    invoiceTransactionTypeCode: TXN_THIRD_PARTY_INVOICE,
    ...THIRD_PARTY_COMPLETE,
    addressLine1: "",
    shouldError: true,
    expectedErrorField: THIRD_PARTY_ADDRESS_LINE_1_FIELD,
  },
  {
    ruleId: "IBR-015-OM",
    title:
      "Given a Third-party invoice — When Address Line 2 is left empty — Then the invoice should be rejected with an error. (IBR-015-OM)",
    invoiceTransactionTypeCode: TXN_THIRD_PARTY_INVOICE,
    ...THIRD_PARTY_COMPLETE,
    addressLine2: "",
    shouldError: true,
    expectedErrorField: THIRD_PARTY_ADDRESS_LINE_2_FIELD,
  },
  {
    ruleId: "IBR-015-OM",
    title:
      "Given a Third-party invoice — When Address Line 3 is left empty — Then the invoice should be rejected with an error. (IBR-015-OM)",
    invoiceTransactionTypeCode: TXN_THIRD_PARTY_INVOICE,
    ...THIRD_PARTY_COMPLETE,
    addressLine3: "",
    shouldError: true,
    expectedErrorField: THIRD_PARTY_ADDRESS_LINE_3_FIELD,
  },
  {
    ruleId: "IBR-015-OM",
    title:
      "Given a Third-party invoice — When Third Party City is left empty — Then the invoice should be rejected with an error. (IBR-015-OM)",
    invoiceTransactionTypeCode: TXN_THIRD_PARTY_INVOICE,
    ...THIRD_PARTY_COMPLETE,
    city: "",
    shouldError: true,
    expectedErrorField: THIRD_PARTY_CITY_FIELD,
  },
  {
    ruleId: "IBR-015-OM",
    title:
      "Given a Third-party invoice — When postal code is left empty — Then the invoice should be rejected with an error. (IBR-015-OM)",
    invoiceTransactionTypeCode: TXN_THIRD_PARTY_INVOICE,
    ...THIRD_PARTY_COMPLETE,
    postalCode: "",
    shouldError: true,
    expectedErrorField: THIRD_PARTY_POSTAL_CODE_FIELD,
  },
  {
    ruleId: "IBR-015-OM",
    title:
      "Given a Third-party invoice — When Country Code is left empty — Then the invoice should be rejected with an error. (IBR-015-OM)",
    invoiceTransactionTypeCode: TXN_THIRD_PARTY_INVOICE,
    ...THIRD_PARTY_COMPLETE,
    countryCode: "",
    shouldError: true,
    expectedErrorField: THIRD_PARTY_COUNTRY_CODE_FIELD,
  },
  {
    ruleId: "IBR-015-OM",
    title:
      "Given a Full Tax invoice — When a third party block is provided — Then the invoice should be rejected with an error. (IBR-015-OM)",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    ...THIRD_PARTY_COMPLETE,
    shouldError: true,
    expectedErrorField: THIRD_PARTY_NAME_FIELD,
  },
];

// ---------------------------------------------------------------------------
// buyerAddressRequired (IBR-019-OM)
// ---------------------------------------------------------------------------
const BUYER_ADDRESS_COMPLETE = {
  addressLine1: "Shop 5, Ruwi High Street",
  addressLine2: "Near Clock Tower",
  addressLine3: "Ruwi",
  city: "Muscat",
  postCode: "112",
} as const;

/** IBR-019-OM: listed txn types require the buyer postal address block. */
export const BUYER_ADDRESS_REQUIRED_SCENARIOS: BuyerAddressRequiredScenario[] = [
  ...expandAcrossIbr019BuyerAddressTxnTypes<BuyerAddressRequiredScenario>({
    ruleId: "IBR-019-OM",
    title:
      "Given {txn} — When Buyer address is complete — Then the invoice should be accepted. (IBR-019-OM)",
    ...BUYER_ADDRESS_COMPLETE,
    shouldError: false,
    expectedErrorField: BUYER_ADDRESS_LINE_1_FIELD,
  }),
  ...expandAcrossIbr019BuyerAddressTxnTypes<BuyerAddressRequiredScenario>({
    ruleId: "IBR-019-OM",
    title:
      "Given {txn} — When Buyer address line 1 is left empty — Then the invoice should be rejected with an error. (IBR-019-OM)",
    ...BUYER_ADDRESS_COMPLETE,
    addressLine1: "",
    shouldError: true,
    expectedErrorField: BUYER_ADDRESS_LINE_1_FIELD,
  }),
  {
    ruleId: "IBR-019-OM",
    title:
      "Given a Full Tax Invoice — When Buyer address line 2 is left empty — Then the invoice should be rejected with an error. (IBR-019-OM)",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    ...BUYER_ADDRESS_COMPLETE,
    addressLine2: "",
    shouldError: true,
    expectedErrorField: BUYER_ADDRESS_LINE_2_FIELD,
  },
  {
    ruleId: "IBR-019-OM",
    title:
      "Given a Full Tax Invoice — When Buyer address line 3 is left empty — Then the invoice should be rejected with an error. (IBR-019-OM)",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    ...BUYER_ADDRESS_COMPLETE,
    addressLine3: "",
    shouldError: true,
    expectedErrorField: BUYER_ADDRESS_LINE_3_FIELD,
  },
  {
    ruleId: "IBR-019-OM",
    title:
      "Given a Full Tax Invoice — When Buyer city is left empty — Then the invoice should be rejected with an error. (IBR-019-OM)",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    ...BUYER_ADDRESS_COMPLETE,
    city: "",
    shouldError: true,
    expectedErrorField: BUYER_CITY_FIELD,
  },
  {
    ruleId: "IBR-019-OM",
    title:
      "Given a Full Tax Invoice — When Buyer post code is left empty — Then the invoice should be rejected with an error. (IBR-019-OM)",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    ...BUYER_ADDRESS_COMPLETE,
    postCode: "",
    shouldError: true,
    expectedErrorField: BUYER_POST_CODE_FIELD,
  },
];

// ---------------------------------------------------------------------------
// deliverToAddressRequired (IBR-040-OM)
// ---------------------------------------------------------------------------
const DELIVER_TO_ADDRESS_COMPLETE = {
  addressLine1: "Warehouse 9",
  addressLine2: "Industrial Area",
  addressLine3: "Ghala",
  city: "Muscat",
  postCode: "130",
  countrySubDivision: "Mainland Oman.",
  countryCode: OMAN_COUNTRY_CODE,
} as const;

/**
 * IBR-040-OM: if any Deliver To address field is entered, all group columns are required.
 * E-commerce: delivery section is REQUIRED (all empty → error).
 * Non-ecommerce: delivery section is OPTIONAL (all empty → accepted, all filled → accepted).
 * Both: partial fill → error (group rule).
 */
export const DELIVER_TO_ADDRESS_REQUIRED_SCENARIOS: DeliverToAddressRequiredScenario[] =
  [
    // --- E-commerce: delivery required; group rule applies ---
    {
      ruleId: "IBR-040-OM",
      title:
        "Given e-commerce — When all Deliver To address fields are provided — Then the invoice should be accepted. (IBR-040-OM)",
      invoiceTransactionTypeCode: TXN_ECOMMERCE_TRANSACTION,
      ...DELIVER_TO_ADDRESS_COMPLETE,
      shouldError: false,
      expectedErrorField: DELIVER_TO_ADDRESS_LINE_1_FIELD,
    },
    {
      ruleId: "IBR-040-OM",
      title:
        "Given e-commerce — When only Address Line 1 is entered — Then the invoice should be rejected with an error. (IBR-040-OM)",
      invoiceTransactionTypeCode: TXN_ECOMMERCE_TRANSACTION,
      addressLine1: DELIVER_TO_ADDRESS_COMPLETE.addressLine1,
      addressLine2: "",
      addressLine3: "",
      city: "",
      postCode: "",
      countrySubDivision: "",
      countryCode: "",
      shouldError: true,
      expectedErrorField: DELIVER_TO_ADDRESS_LINE_2_FIELD,
    },
    {
      ruleId: "IBR-040-OM",
      title:
        "Given e-commerce — When the Deliver To address group is left empty — Then the invoice should be rejected with an error. (IBR-040-OM)",
      invoiceTransactionTypeCode: TXN_ECOMMERCE_TRANSACTION,
      addressLine1: "",
      addressLine2: "",
      addressLine3: "",
      city: "",
      postCode: "",
      countrySubDivision: "",
      countryCode: "",
      shouldError: true,
      expectedErrorField: DELIVER_TO_ADDRESS_LINE_1_FIELD,
    },
    // --- Non-ecommerce: delivery optional; group rule applies if any field present ---
    {
      ruleId: "IBR-040-OM",
      title:
        "Given a non-ecommerce invoice — When all Deliver To address fields are provided — Then the invoice should be accepted. (IBR-040-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      ...DELIVER_TO_ADDRESS_COMPLETE,
      shouldError: false,
      expectedErrorField: DELIVER_TO_ADDRESS_LINE_1_FIELD,
    },
    {
      ruleId: "IBR-040-OM",
      title:
        "Given a non-ecommerce invoice — When only Address Line 1 is entered — Then the invoice should be rejected with an error. (IBR-040-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      addressLine1: DELIVER_TO_ADDRESS_COMPLETE.addressLine1,
      addressLine2: "",
      addressLine3: "",
      city: "",
      postCode: "",
      countrySubDivision: "",
      countryCode: "",
      shouldError: true,
      expectedErrorField: DELIVER_TO_ADDRESS_LINE_2_FIELD,
    },
    {
      ruleId: "IBR-040-OM",
      title:
        "Given a non-ecommerce invoice — When the Deliver To address group is left empty — Then the invoice should be accepted. (IBR-040-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      addressLine1: "",
      addressLine2: "",
      addressLine3: "",
      city: "",
      postCode: "",
      countrySubDivision: "",
      countryCode: "",
      shouldError: false,
      expectedErrorField: DELIVER_TO_ADDRESS_LINE_1_FIELD,
    },
  ];

// ---------------------------------------------------------------------------
// invoicingPeriod (IBR-029 / IBR-CO-19)
// ---------------------------------------------------------------------------
export const INVOICING_PERIOD_CONDITIONAL_SCENARIOS: InvoicingPeriodScenario[] =
  [
    {
      ruleId: "IBR-029",
      title:
        "Given a Summary Invoice — When period end is on or after period start — Then the invoice should be accepted. (IBR-029)",
      invoiceTransactionTypeCode: TXN_SUMMARY_INVOICE,
      periodStart: "2026-01-01",
      periodEnd: "2026-01-31",
      shouldError: false,
      expectedErrorField: INVOICING_PERIOD_END_DATE_FIELD,
    },
    {
      ruleId: "IBR-029",
      title:
        "Given a Summary Invoice — When period end is before period start — Then the invoice should be rejected with an error. (IBR-029)",
      invoiceTransactionTypeCode: TXN_SUMMARY_INVOICE,
      periodStart: "2026-01-31",
      periodEnd: "2026-01-01",
      shouldError: true,
      expectedErrorField: INVOICING_PERIOD_END_DATE_FIELD,
    },
    {
      ruleId: "IBR-CO-19",
      title:
        "Given a Full Tax invoice — When only period start is provided — Then the invoice should be accepted. (IBR-CO-19)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      periodStart: "2026-01-01",
      periodEnd: "",
      shouldError: false,
      expectedErrorField: INVOICING_PERIOD_START_DATE_FIELD,
    },
    {
      ruleId: "IBR-CO-19",
      title:
        "Given a Full Tax invoice — When only period end is provided — Then the invoice should be accepted. (IBR-CO-19)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      periodStart: "",
      periodEnd: "2026-01-31",
      shouldError: false,
      expectedErrorField: INVOICING_PERIOD_END_DATE_FIELD,
    },
    {
      ruleId: "IBR-CO-19",
      title:
        "Given a Full Tax invoice — When both period dates are provided — Then the invoice should be accepted. (IBR-CO-19)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      periodStart: "2026-01-01",
      periodEnd: "2026-01-31",
      shouldError: false,
      expectedErrorField: INVOICING_PERIOD_START_DATE_FIELD,
    },
  ];

// ---------------------------------------------------------------------------
// invoiceLinePeriod (IBR-030)
// Covoro Excel has no IBT-134/135 columns; pack proxies to document Invoicing Period*.
// ---------------------------------------------------------------------------
export const INVOICE_LINE_PERIOD_CONDITIONAL_SCENARIOS: InvoicingPeriodScenario[] =
  [
    {
      ruleId: "IBR-030",
      title:
        "Given a line period — When end is on or after start — Then the invoice should be accepted. (IBR-030)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      periodStart: "2026-01-01",
      periodEnd: "2026-01-31",
      shouldError: false,
      expectedErrorField: INVOICING_PERIOD_END_DATE_FIELD,
    },
    {
      ruleId: "IBR-030",
      title:
        "Given a line period — When end is before start — Then the invoice should be rejected with an error. (IBR-030)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      periodStart: "2026-01-31",
      periodEnd: "2026-01-01",
      shouldError: true,
      expectedErrorField: INVOICING_PERIOD_END_DATE_FIELD,
    },
  ];

// ---------------------------------------------------------------------------
// prepaymentPaidAmount (IBR-058-OM)
// ---------------------------------------------------------------------------
export const PREPAYMENT_PAID_AMOUNT_SCENARIOS: PrepaymentPaidAmountScenario[] = [
  {
    ruleId: "IBR-058-OM",
    title:
      "Given a paid amount — When prepayment number and UUID are provided — Then the invoice should be accepted. (IBR-058-OM)",
    paidAmount: "100",
    prepaymentInvoiceNumber: "PREPAY-001",
    prepaymentInvoiceUuid: PRECEDING_INVOICE_UUID_SAMPLE,
    shouldError: false,
    expectedErrorField: "Prepayment invoice number",
  },
  {
    ruleId: "IBR-058-OM",
    title:
      "Given a paid amount — When prepayment number is left empty — Then the invoice should be rejected with an error. (IBR-058-OM)",
    paidAmount: "100",
    prepaymentInvoiceNumber: "",
    prepaymentInvoiceUuid: "",
    shouldError: true,
    expectedErrorField: "Prepayment invoice number",
  },
  {
    ruleId: "IBR-058-OM",
    title:
      "Given paid amount 0 — When prepayment number and UUID are provided — Then the invoice should be accepted. (IBR-058-OM)",
    paidAmount: "0",
    prepaymentInvoiceNumber: "PREPAY-001",
    prepaymentInvoiceUuid: PRECEDING_INVOICE_UUID_SAMPLE,
    shouldError: false,
    expectedErrorField: "Prepayment invoice number",
  },
  {
    ruleId: "IBR-058-OM",
    title:
      "Given paid amount 0 — When prepayment number and UUID are left empty — Then the invoice should be rejected with an error. (IBR-058-OM)",
    paidAmount: "0",
    prepaymentInvoiceNumber: "",
    prepaymentInvoiceUuid: "",
    shouldError: true,
    expectedErrorField: "Prepayment invoice number",
  },
  {
    ruleId: "IBR-058-OM",
    title:
      "Given paid amount 0 — When prepayment UUID is left empty — Then the invoice should be rejected with an error. (IBR-058-OM)",
    paidAmount: "0",
    prepaymentInvoiceNumber: "PREPAY-001",
    prepaymentInvoiceUuid: "",
    shouldError: true,
    expectedErrorField: "Prepayment invoice UUID",
  },
  {
    ruleId: "IBR-058-OM",
    title:
      "Given paid amount 0 — When prepayment number is left empty — Then the invoice should be rejected with an error. (IBR-058-OM)",
    paidAmount: "0",
    prepaymentInvoiceNumber: "",
    prepaymentInvoiceUuid: PRECEDING_INVOICE_UUID_SAMPLE,
    shouldError: true,
    expectedErrorField: "Prepayment invoice number",
  },
];

// ---------------------------------------------------------------------------
// hsCodeLength (IBR-080-OM)
// ---------------------------------------------------------------------------
export const HS_CODE_LENGTH_SCENARIOS: HsCodeLengthScenario[] = [
  {
    ruleId: "IBR-080-OM",
    title:
      "Given an HS classification — When the value has 12 digits — Then the invoice should be accepted. (IBR-080-OM)",
    itemClassificationIdentifier: OMAN_HS_CODE_12,
    shouldError: false,
    expectedErrorField: ITEM_CLASSIFICATION_IDENTIFIER_FIELD,
  },
  {
    ruleId: "IBR-080-OM",
    title:
      "Given an HS classification — When the value has 6 digits — Then the invoice should be rejected with an error. (IBR-080-OM)",
    itemClassificationIdentifier: "123456",
    shouldError: true,
    expectedErrorField: ITEM_CLASSIFICATION_IDENTIFIER_FIELD,
  },
  {
    ruleId: "IBR-080-OM",
    title:
      "Given an item classification that is not an HS code — When the invoice is uploaded — Then the invoice should be rejected with an error. (IBR-080-OM)",
    itemClassificationIdentifier: "FREE-TEXT-CODE",
    shouldError: true,
    expectedErrorField: ITEM_CLASSIFICATION_IDENTIFIER_FIELD,
  },
];

// ---------------------------------------------------------------------------
// industrialClassification (IBR-081-OM)
// ---------------------------------------------------------------------------
export const INDUSTRIAL_CLASSIFICATION_REQUIRED_SCENARIOS: IndustrialClassificationRequiredScenario[] =
  [
    {
      ruleId: "IBR-081-OM",
      title:
        "Given a Full Tax invoice — When industrial classification is provided — Then the invoice should be accepted. (IBR-081-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      industrialClassificationCode: "Extraction of crude petroleum",
      shouldError: false,
      expectedErrorField: INDUSTRIAL_CLASSIFICATION_CODE_FIELD,
    },
    {
      ruleId: "IBR-081-OM",
      title:
        "Given a Full Tax invoice — When industrial classification is left empty — Then the invoice should be rejected with an error. (IBR-081-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      industrialClassificationCode: "",
      shouldError: true,
      expectedErrorField: INDUSTRIAL_CLASSIFICATION_CODE_FIELD,
    },
    {
      ruleId: "IBR-081-OM",
      title:
        "Given a Simplified invoice — When industrial classification is left empty — Then the invoice should be accepted. (IBR-081-OM)",
      invoiceTransactionTypeCode: TXN_SIMPLIFIED_TAX_INVOICE,
      industrialClassificationCode: "",
      shouldError: false,
      expectedErrorField: INDUSTRIAL_CLASSIFICATION_CODE_FIELD,
    },
    {
      ruleId: "IBR-081-OM",
      title:
        "Given Import of Goods — When industrial classification is left empty — Then the invoice should be accepted. (IBR-081-OM)",
      invoiceTransactionTypeCode: TXN_IMPORT_OF_GOODS,
      industrialClassificationCode: "",
      shouldError: false,
      expectedErrorField: INDUSTRIAL_CLASSIFICATION_CODE_FIELD,
    },
    {
      ruleId: "IBR-081-OM",
      title:
        "Given Import of Services (RCM) — When industrial classification is left empty — Then the invoice should be accepted. (IBR-081-OM)",
      invoiceTransactionTypeCode: TXN_IMPORT_OF_SERVICES_RCM,
      industrialClassificationCode: "",
      shouldError: false,
      expectedErrorField: INDUSTRIAL_CLASSIFICATION_CODE_FIELD,
    },
    {
      ruleId: "IBR-081-OM",
      title:
        "Given Profit Margin Self-Invoice — When industrial classification is left empty — Then the invoice should be accepted. (IBR-081-OM)",
      invoiceTransactionTypeCode: TXN_PROFIT_MARGIN_SELF_INVOICE,
      industrialClassificationCode: "",
      shouldError: false,
      expectedErrorField: INDUSTRIAL_CLASSIFICATION_CODE_FIELD,
    },
  ];

// ---------------------------------------------------------------------------
// ibrCl05 / ibrCl10 doc allowance exemption codelist (IBR-CL-05-OM, IBR-CL-10-OM)
// ---------------------------------------------------------------------------
export const IBR_CL_05_DOC_ALLOWANCE_SCENARIOS: DocAllowanceExemptionClScenario[] =
  [
    {
      ruleId: "IBR-CL-05-OM",
      title:
        "Given an Exempt document allowance — When an exemption reason is provided — Then the invoice should be accepted. (IBR-CL-05-OM)",
      vatCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      exemptionReason: TAX_EXEMPTION_REASON_SAMPLE,
      amount: "10",
      shouldError: false,
      expectedErrorField: TAX_EXEMPTION_REASON_ALLOWANCES_FIELD,
    },
    {
      ruleId: "IBR-CL-05-OM",
      title:
        "Given an Exempt document allowance — When exemption reason is left empty — Then the invoice should be rejected with an error. (IBR-CL-05-OM)",
      vatCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      exemptionReason: "",
      amount: "10",
      shouldError: true,
      expectedErrorField: TAX_EXEMPTION_REASON_ALLOWANCES_FIELD,
    },
    {
      ruleId: "IBR-CL-05-OM",
      title:
        "Given an Exempt document allowance — When a Zero-rated exemption reason is used — Then the invoice should be rejected with an error. (IBR-CL-05-OM)",
      vatCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      exemptionReason: TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
      amount: "10",
      shouldError: true,
      expectedErrorField: TAX_EXEMPTION_REASON_ALLOWANCES_FIELD,
    },
    {
      ruleId: "IBR-CL-05-OM",
      title:
        "Given a Standard rate document allowance — When an exemption reason is provided — Then the invoice should be rejected with an error. (IBR-CL-05-OM)",
      vatCategory: STANDARD_TAX_CATEGORY_CODE,
      exemptionReason: TAX_EXEMPTION_REASON_SAMPLE,
      amount: "10",
      shouldError: true,
      expectedErrorField: TAX_EXEMPTION_REASON_ALLOWANCES_FIELD,
    },
    {
      ruleId: "IBR-CL-10-OM",
      title:
        "Given a Zero rated document allowance — When a Zero-rated exemption reason is provided — Then the invoice should be accepted. (IBR-CL-10-OM)",
      vatCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      exemptionReason: TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
      amount: "10",
      shouldError: false,
      expectedErrorField: TAX_EXEMPTION_REASON_ALLOWANCES_FIELD,
    },
    ...expandIbrCl10RemainingZeroRatedReasons(),
    {
      ruleId: "IBR-CL-10-OM",
      title:
        "Given a Zero rated document allowance — When exemption reason is left empty — Then the invoice should be rejected with an error. (IBR-CL-10-OM)",
      vatCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      exemptionReason: "",
      amount: "10",
      shouldError: true,
      expectedErrorField: TAX_EXEMPTION_REASON_ALLOWANCES_FIELD,
    },
    {
      ruleId: "IBR-CL-10-OM",
      title:
        "Given a Zero rated document allowance — When an Exempt exemption reason is used — Then the invoice should be rejected with an error. (IBR-CL-10-OM)",
      vatCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      exemptionReason: TAX_EXEMPTION_REASON_SAMPLE,
      amount: "10",
      shouldError: true,
      expectedErrorField: TAX_EXEMPTION_REASON_ALLOWANCES_FIELD,
    },
  ];

// ---------------------------------------------------------------------------
// sellerCountryRcm (IBR-160-OM)
// ---------------------------------------------------------------------------
export const SELLER_COUNTRY_RCM_SCENARIOS: SellerCountryRcmScenario[] = [
  {
    ruleId: "IBR-160-OM",
    title:
      "Given Import of Services (RCM) — When the seller country is not Oman — Then the invoice should be accepted. (IBR-160-OM)",
    invoiceTransactionTypeCode: TXN_IMPORT_OF_SERVICES_RCM,
    sellerCountryCode: UAE_COUNTRY_CODE,
    shouldError: false,
    expectedErrorField: SELLER_COUNTRY_CODE_FIELD,
  },
  {
    ruleId: "IBR-160-OM",
    title:
      "Given Import of Services (RCM) — When the seller country is Oman — Then the invoice should be rejected with an error. (IBR-160-OM)",
    invoiceTransactionTypeCode: TXN_IMPORT_OF_SERVICES_RCM,
    sellerCountryCode: OMAN_COUNTRY_CODE,
    shouldError: true,
    expectedErrorField: SELLER_COUNTRY_CODE_FIELD,
  },
];

// ---------------------------------------------------------------------------
// profitMarginPreceding (IBR-175-OM)
// ---------------------------------------------------------------------------
export const PROFIT_MARGIN_PRECEDING_SCENARIOS: ProfitMarginPrecedingScenario[] =
  [
    {
      ruleId: "IBR-175-OM",
      title:
        "Given Profit Margin — When preceding reference and UUID are provided — Then the invoice should be accepted. (IBR-175-OM)",
      precedingInvoiceReference: "INV-PREV-175",
      precedingInvoiceUuid: PRECEDING_INVOICE_UUID_SAMPLE,
      shouldError: false,
      expectedErrorField: PRECEDING_INVOICE_REFERENCE_FIELD,
    },
    {
      ruleId: "IBR-175-OM",
      title:
        "Given Profit Margin — When preceding reference is left empty — Then the invoice should be rejected with an error. (IBR-175-OM)",
      precedingInvoiceReference: "",
      precedingInvoiceUuid: "",
      shouldError: true,
      expectedErrorField: PRECEDING_INVOICE_REFERENCE_FIELD,
    },
    {
      ruleId: "IBR-175-OM",
      title:
        "Given Profit Margin — When preceding reference is left empty and UUID is provided — Then the invoice should be rejected with an error. (IBR-175-OM)",
      precedingInvoiceReference: "",
      precedingInvoiceUuid: PRECEDING_INVOICE_UUID_SAMPLE,
      shouldError: true,
      expectedErrorField: PRECEDING_INVOICE_REFERENCE_FIELD,
    },
    {
      ruleId: "IBR-175-OM",
      title:
        "Given Profit Margin — When preceding UUID is left empty and reference is provided — Then the invoice should be rejected with an error. (IBR-175-OM)",
      precedingInvoiceReference: "INV-PREV-175",
      precedingInvoiceUuid: "",
      shouldError: true,
      expectedErrorField: PRECEDING_INVOICE_UUID_FIELD,
    },
  ];

// ---------------------------------------------------------------------------
// profitMarginItemType (CL-11-OM)
// ---------------------------------------------------------------------------
/**
 * CL-11-OM: Profit Margin Invoice / Self-Invoice → BTOM-025 present and in
 * Profit Margin Items Codelist. PM Invoice + valid / invalid dropdown is
 * already covered by field-validation master sweep.
 */
export const PROFIT_MARGIN_ITEM_TYPE_SCENARIOS: ProfitMarginItemTypeScenario[] =
  [
    {
      ruleId: "CL-11-OM",
      title:
        "Given Profit Margin Invoice — When item type is left empty — Then the invoice should be rejected with an error. (CL-11-OM)",
      invoiceTransactionTypeCode: TXN_PROFIT_MARGIN_INVOICE,
      profitMarginItemTypeCode: "",
      shouldError: true,
      expectedErrorField: PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD,
    },
    {
      ruleId: "CL-11-OM",
      title:
        "Given Profit Margin Self-Invoice — When item type is left empty — Then the invoice should be rejected with an error. (CL-11-OM)",
      invoiceTransactionTypeCode: TXN_PROFIT_MARGIN_SELF_INVOICE,
      profitMarginItemTypeCode: "",
      shouldError: true,
      expectedErrorField: PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD,
    },
    {
      ruleId: "CL-11-OM",
      title:
        "Given Profit Margin Self-Invoice — When a valid profit-margin item type is provided — Then the invoice should be accepted. (CL-11-OM)",
      invoiceTransactionTypeCode: TXN_PROFIT_MARGIN_SELF_INVOICE,
      profitMarginItemTypeCode: PROFIT_MARGIN_ITEM_TYPE_SAMPLE,
      shouldError: false,
      expectedErrorField: PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD,
    },
    {
      ruleId: "CL-11-OM",
      title:
        "Given Profit Margin Self-Invoice — When item type is invalid — Then the invoice should be rejected with an error. (CL-11-OM)",
      invoiceTransactionTypeCode: TXN_PROFIT_MARGIN_SELF_INVOICE,
      profitMarginItemTypeCode: PROFIT_MARGIN_ITEM_TYPE_INVALID_SAMPLE,
      shouldError: true,
      expectedErrorField: PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD,
    },
  ];

// ---------------------------------------------------------------------------
// buyerIdentifierScheme (IBR-152 / IBR-153-OM)
// ---------------------------------------------------------------------------
export const BUYER_IDENTIFIER_SCHEME_SCENARIOS: BuyerIdentifierSchemeScenario[] =
  [
    {
      ruleId: "IBR-152-OM",
      title:
        "Given Special Zone Supplies — When the buyer uses Special Zone License — Then the invoice should be accepted. (IBR-152-OM)",
      invoiceTransactionTypeCode: TXN_SPECIAL_ZONE_SUPPLIES,
      buyerIdentifierScheme: SPECIAL_ZONE_LICENSE_SCHEME,
      buyerIdentifier: "SZ-BUYER-001",
      shouldError: false,
      expectedErrorField: "Buyer identifier",
    },
    {
      ruleId: "IBR-152-OM",
      title:
        "Given Special Zone Supplies — When buyer identifier is left empty — Then the invoice should be rejected with an error. (IBR-152-OM)",
      invoiceTransactionTypeCode: TXN_SPECIAL_ZONE_SUPPLIES,
      buyerIdentifierScheme: SPECIAL_ZONE_LICENSE_SCHEME,
      buyerIdentifier: "",
      shouldError: true,
      expectedErrorField: "Buyer identifier",
    },
    {
      ruleId: "IBR-153-OM",
      title:
        "Given Import of Goods — When buyer uses Importer Customs ID — Then the invoice should be accepted. (IBR-153-OM)",
      invoiceTransactionTypeCode: TXN_IMPORT_OF_GOODS,
      buyerIdentifierScheme: "Importer Customs ID",
      buyerIdentifier: "IMP-CUST-001",
      shouldError: false,
      expectedErrorField: "Buyer identifier",
    },
    {
      ruleId: "IBR-153-OM",
      title:
        "Given Import of Goods — When buyer identifier is left empty — Then the invoice should be rejected with an error. (IBR-153-OM)",
      invoiceTransactionTypeCode: TXN_IMPORT_OF_GOODS,
      buyerIdentifierScheme: "Importer Customs ID",
      buyerIdentifier: "",
      shouldError: true,
      expectedErrorField: "Buyer identifier",
    },
    {
      ruleId: "IBR-153-OM",
      title:
        "Given a Full Tax invoice — When buyer uses Importer Customs ID — Then the invoice should be rejected with an error. (IBR-153-OM)",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      buyerIdentifierScheme: "Importer Customs ID",
      buyerIdentifier: "IMP-CUST-001",
      shouldError: true,
      expectedErrorField: "Buyer identifier",
    },
  ];

// ---------------------------------------------------------------------------
// itemAttributeNameValue (IBR-CO-21)
// If Item attribute name is provided → Item attribute value MUST be provided,
// and vice versa. Max length 300 chars each.
// ---------------------------------------------------------------------------
export type ItemAttributeConditionalScenario = {
  ruleId: string;
  title: string;
  itemAttributeName: string;
  itemAttributeValue: string;
  shouldError: boolean;
  expectedErrorField: string;
};

export const ITEM_ATTRIBUTE_NAME_FIELD = "Item attribute name";
export const ITEM_ATTRIBUTE_VALUE_FIELD = "Item attribute value";

export const ITEM_ATTRIBUTE_CONDITIONAL_SCENARIOS: ItemAttributeConditionalScenario[] =
  [
    // --- Conditional presence ---
    {
      ruleId: "IBR-CO-21",
      title:
        "Given an item attribute name — When attribute value is left empty — Then the invoice should be rejected with an error. (IBR-CO-21)",
      itemAttributeName: "Color",
      itemAttributeValue: "",
      shouldError: true,
      expectedErrorField: ITEM_ATTRIBUTE_VALUE_FIELD,
    },
    {
      ruleId: "IBR-CO-21",
      title:
        "Given an item attribute value — When attribute name is left empty — Then the invoice should be rejected with an error. (IBR-CO-21)",
      itemAttributeName: "",
      itemAttributeValue: "Black",
      shouldError: true,
      expectedErrorField: ITEM_ATTRIBUTE_NAME_FIELD,
    },
    {
      ruleId: "IBR-CO-21",
      title:
        "Given item attributes — When name and value are both left empty — Then the invoice should be accepted. (IBR-CO-21)",
      itemAttributeName: "",
      itemAttributeValue: "",
      shouldError: false,
      expectedErrorField: ITEM_ATTRIBUTE_NAME_FIELD,
    },

    // --- Item attribute name length boundaries (min 1, max 300) ---
    {
      ruleId: "IBR-CO-21",
      title:
        "Given an item attribute name of 1 character — When a value is provided — Then the invoice should be accepted. (IBR-CO-21)",
      itemAttributeName: "A",
      itemAttributeValue: "SomeValue",
      shouldError: false,
      expectedErrorField: ITEM_ATTRIBUTE_NAME_FIELD,
    },
    {
      ruleId: "IBR-CO-21",
      title:
        "Given an item attribute name of 300 characters — When a value is provided — Then the invoice should be accepted. (IBR-CO-21)",
      itemAttributeName: "A".repeat(300),
      itemAttributeValue: "SomeValue",
      shouldError: false,
      expectedErrorField: ITEM_ATTRIBUTE_NAME_FIELD,
    },
    {
      ruleId: "IBR-CO-21",
      title:
        "Given an item attribute name of 301 characters — When a value is provided — Then the invoice should be rejected with an error. (IBR-CO-21)",
      itemAttributeName: "A".repeat(301),
      itemAttributeValue: "SomeValue",
      shouldError: true,
      expectedErrorField: ITEM_ATTRIBUTE_NAME_FIELD,
    },

    // --- Item attribute value length boundaries (min 1, max 300) ---
    {
      ruleId: "IBR-CO-21",
      title:
        "Given an item attribute value of 1 character — When a name is provided — Then the invoice should be accepted. (IBR-CO-21)",
      itemAttributeName: "Color",
      itemAttributeValue: "B",
      shouldError: false,
      expectedErrorField: ITEM_ATTRIBUTE_VALUE_FIELD,
    },
    {
      ruleId: "IBR-CO-21",
      title:
        "Given an item attribute value of 300 characters — When a name is provided — Then the invoice should be accepted. (IBR-CO-21)",
      itemAttributeName: "Color",
      itemAttributeValue: "B".repeat(300),
      shouldError: false,
      expectedErrorField: ITEM_ATTRIBUTE_VALUE_FIELD,
    },
    {
      ruleId: "IBR-CO-21",
      title:
        "Given an item attribute value of 301 characters — When a name is provided — Then the invoice should be rejected with an error. (IBR-CO-21)",
      itemAttributeName: "Color",
      itemAttributeValue: "B".repeat(301),
      shouldError: true,
      expectedErrorField: ITEM_ATTRIBUTE_VALUE_FIELD,
    },
  ];

// ---------------------------------------------------------------------------
// partyIdentifierCompanion (Covoro Excel / IBT-029 + IBT-046)
// Identifier may stand alone. Scheme and/or textual code are optional
// companions. Identifier MUST be present if either companion is present.
// Same polarities for seller and buyer.
// ---------------------------------------------------------------------------
export type PartyIdentifierCompanionMode = "none" | "scheme" | "code" | "both";
export type PartyIdentifierCompanionParty = "seller" | "buyer";

export type PartyIdentifierCompanionScenario = OmanConditionalScenario & {
  party: PartyIdentifierCompanionParty;
  companion: PartyIdentifierCompanionMode;
  identifier: string;
};

function partyIdentifierCompanionScenarios(
  party: PartyIdentifierCompanionParty,
  identifierField: string,
  validIdentifier: string
): PartyIdentifierCompanionScenario[] {
  const who = party === "seller" ? "Seller" : "Buyer";
  const ruleId = "PARTY-ID";
  const base = {
    ruleId,
    party,
    expectedErrorField: identifierField,
  } as const;
  return [
    {
      ...base,
      title: `Given ${who} identifier without scheme or textual code — When the invoice is uploaded — Then the invoice should be accepted. (${ruleId})`,
      companion: "none",
      identifier: validIdentifier,
      shouldError: false,
    },
    {
      ...base,
      title: `Given ${who} identifier with scheme only — When the invoice is uploaded — Then the invoice should be accepted. (${ruleId})`,
      companion: "scheme",
      identifier: validIdentifier,
      shouldError: false,
    },
    {
      ...base,
      title: `Given ${who} identifier with textual code only — When the invoice is uploaded — Then the invoice should be accepted. (${ruleId})`,
      companion: "code",
      identifier: validIdentifier,
      shouldError: false,
    },
    {
      ...base,
      title: `Given ${who} identifier with scheme and textual code — When the invoice is uploaded — Then the invoice should be accepted. (${ruleId})`,
      companion: "both",
      identifier: validIdentifier,
      shouldError: false,
    },
    {
      ...base,
      title: `Given empty ${who} identifier with no scheme or textual code — When the invoice is uploaded — Then the invoice should be accepted. (${ruleId})`,
      companion: "none",
      identifier: "",
      shouldError: false,
    },
    {
      ...base,
      title: `Given ${who} identifier scheme without identifier — When the invoice is uploaded — Then the invoice should be rejected with an error. (${ruleId})`,
      companion: "scheme",
      identifier: "",
      shouldError: true,
    },
    {
      ...base,
      title: `Given ${who} identifier textual code without identifier — When the invoice is uploaded — Then the invoice should be rejected with an error. (${ruleId})`,
      companion: "code",
      identifier: "",
      shouldError: true,
    },
    {
      ...base,
      title: `Given ${who} identifier scheme and textual code without identifier — When the invoice is uploaded — Then the invoice should be rejected with an error. (${ruleId})`,
      companion: "both",
      identifier: "",
      shouldError: true,
    },
  ];
}

export const PARTY_IDENTIFIER_COMPANION_SCENARIOS: PartyIdentifierCompanionScenario[] =
  [
    ...partyIdentifierCompanionScenarios(
      "seller",
      SELLER_IDENTIFIER_FIELD,
      "OM-SELLER-001"
    ),
    ...partyIdentifierCompanionScenarios(
      "buyer",
      BUYER_IDENTIFIER_FIELD,
      "OM-BUYER-001"
    ),
  ];

