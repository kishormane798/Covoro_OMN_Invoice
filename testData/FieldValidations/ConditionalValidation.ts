/**
 * Oman PINT-OM conditional validation scenarios (Excel upload).
 * Source: Conditional Validations sheet + Peppol PINT OM. No UAE / BTUAE rules.
 *
 * Shared constants below are also imported by `utils/invoiceExcel.ts` for submit writes.
 */

import {
  taxCategoryValidTestData,
  taxExemptionReasonValidTestData,
  invoiceTransactionTypeValidTestData,
  invoiceTypeCodeValidTestData,
  creditDebitNoteReasonValidTestData,
  itemTypeValidTestData,
  serviceTypeCodeValidTestData,
} from "./Master.omnCore";
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
export const SELLER_IDENTIFIER_SCHEME_FIELD =
  "Seller identifier - Scheme identifier";
export const SELLER_IDENTIFIER_TEXTUAL_CODE_FIELD =
  "Seller Identifier (textual code)";
export const SELLER_IDENTIFIER_FIELD = "Seller identifier";
export const LINE_ITEM_VAT_AMOUNT_FIELD = "Line item VAT amount";
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
export const SELLER_VAT_IDENTIFIER_FIELD = "Seller VAT Identifier (TRN / TIN)";
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
export const SERVICE_TYPE_CODE_FIELD = "Service Type Code";
export const BUYER_COUNTRY_CODE_FIELD = "Buyer country code";
export const SUPPORTING_DOCUMENT_REFERENCE_FIELD =
  "Supporting document reference";
export const SUPPORTING_DOCUMENT_UUID_FIELD = "Supporting document UUID";

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

/** CL-10-OM: Zero-rated VAT category must use a Zero-rated exemption reason code. */
export const TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE =
  taxExemptionReasonValidTestData.find((x) =>
    x.label.startsWith("Zero-rated")
  )!.label;

/** IBT-121 'Export of service' — Masters label (VATZR-OM-09). */
export const TAX_EXEMPTION_REASON_EXPORT_OF_SERVICES =
  taxExemptionReasonValidTestData.find((x) =>
    x.label.toLowerCase().includes("export of services")
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
 * Peppol BTOM-001 20-bit patterns (PINT-OM). Covoro Excel usually uses Master
 * labels (one primary bit); mutual-exclusion conflict rows write an OR'd bit
 * string so Prepayment + Summary/Deemed/PM-Self can both be set on one field.
 */
export const TXN_BIT_SUMMARY = "00001000000000000000";
export const TXN_BIT_DEEMED_SUPPLY = "00000001000000000000";
export const TXN_BIT_PROFIT_MARGIN_SELF = "00000000001000000000";
export const TXN_BIT_PREPAYMENT = "00000000000000100000";

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

export const SPECIAL_ZONE_LICENSE_SCHEME = "Special Zone License Number";
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
 * ALIGNED-IBRP-*-01-OM: when line (or doc allowance) uses category C, Full Tax
 * invoices must expose a matching VAT breakdown category. Covoro drives breakdown
 * via line `Tax Category` (IBT-118 proxy); Simplified Tax Invoice is exempt.
 */
export type VatBreakdownCategoryPresenceScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  taxCategory: string;
  taxRate: string | null;
  taxExemptionReasonCode?: string | null;
};

/** IBR-038-OM: Line item VAT amount required except Simplified. */
export type LineItemVatAmountRequiredScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  taxCategory: string;
  taxRate: string | null;
  lineItemVatAmount: string;
};

/** IBR-039/054/077-OM: Line VAT amount must be zero for E / O / Z. */
export type LineItemVatAmountZeroScenario = OmanConditionalScenario & {
  taxCategory: string;
  taxRate: string | null;
  taxExemptionReasonCode?: string;
  lineItemVatAmount: string;
};

/** Mutual-exclusion BTOM-001 pairs (IBR-138…149-OM family). */
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

/** IBR-016-OM: Buyer identifier OR Buyer VATIN for Full Tax / Third-party. */
export type BuyerIdOrVatinScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  buyerIdentifier: string;
  buyerVatIdentifier: string;
};

/** IBR-019-OM: Buyer address block mandatory for listed txn types. */
export type BuyerAddressRequiredScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  buyerAddressLine1: string;
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

/** IBR-080-OM: HS classification must be exactly 12 digits when provided. */
export type HsCodeLengthScenario = OmanConditionalScenario & {
  itemClassificationIdentifier: string;
};

/** IBR-081-OM: Industrial Classification Code required except Simplified. */
export type IndustrialClassificationRequiredScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  industrialClassificationCode: string;
};

/** IBR-CL-05-OM: doc allowance E/Z requires exemption reason code (IBT-196). */
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

/** IBR-152/153-OM: Special Zone / Import buyer identifier scheme. */
export type BuyerIdentifierSchemeScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  buyerIdentifierScheme: string;
  buyerIdentifier: string;
};

export type VatExemptionReasonScenario = OmanConditionalScenario & {
  taxCategory: string;
  taxExemptionReasonCode: string | null;
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

export type SpecialZoneSellerScenario = OmanConditionalScenario & {
  invoiceTransactionTypeCode: string;
  sellerIdentifierTextualCode: string;
  sellerIdentifier: string;
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

/** IBR-013-OM: Export + Export of Services → supporting document ref + UUID. */
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
    values: [
      TXN_THIRD_PARTY_INVOICE,
      TXN_EXPORT_INVOICE,
      TXN_IMPORT_OF_SERVICES_RCM,
      TXN_PROFIT_MARGIN_INVOICE,
      TXN_PROFIT_MARGIN_SELF_INVOICE,
      TXN_IMPORT_OF_GOODS,
    ],
  },
  "IBR-140-OM": {
    dimension: "txnType",
    values: [
      TXN_CONTINUOUS_SUPPLY,
      TXN_EXPORT_INVOICE,
      TXN_PROFIT_MARGIN_INVOICE,
      TXN_PROFIT_MARGIN_SELF_INVOICE,
      TXN_IMPORT_OF_GOODS,
    ],
  },
  "IBR-141-OM": {
    dimension: "txnType",
    values: [
      TXN_SUMMARY_INVOICE,
      TXN_DEEMED_SUPPLY_INVOICE,
      TXN_PROFIT_MARGIN_INVOICE,
      TXN_PROFIT_MARGIN_SELF_INVOICE,
      TXN_IMPORT_OF_GOODS,
    ],
  },
  "IBR-142-OM": {
    dimension: "txnType",
    values: [
      TXN_SELF_BILLED_INVOICE,
      TXN_SUMMARY_INVOICE,
      TXN_DEEMED_SUPPLY_INVOICE,
      TXN_IMPORT_OF_SERVICES_RCM,
      TXN_PROFIT_MARGIN_INVOICE,
      TXN_PROFIT_MARGIN_SELF_INVOICE,
      TXN_IMPORT_OF_GOODS,
    ],
  },
  "IBR-143-OM": {
    dimension: "txnType",
    values: [
      TXN_CONTINUOUS_SUPPLY,
      TXN_EXPORT_INVOICE,
      TXN_PROFIT_MARGIN_INVOICE,
      TXN_PROFIT_MARGIN_SELF_INVOICE,
    ],
  },
  "IBR-144-OM": {
    dimension: "txnType",
    values: [
      TXN_EXPORT_INVOICE,
      TXN_PROFIT_MARGIN_INVOICE,
      TXN_PROFIT_MARGIN_SELF_INVOICE,
      TXN_IMPORT_OF_GOODS,
      TXN_SELF_BILLED_INVOICE,
    ],
  },
  "IBR-145-OM": {
    dimension: "txnType",
    values: [
      TXN_SUMMARY_INVOICE,
      TXN_CONTINUOUS_SUPPLY,
      TXN_EXPORT_INVOICE,
      TXN_DEEMED_SUPPLY_INVOICE,
      TXN_IMPORT_OF_SERVICES_RCM,
      TXN_SELF_BILLED_INVOICE,
      TXN_IMPORT_OF_GOODS,
    ],
  },
  "IBR-146-OM": {
    dimension: "txnType",
    values: [
      TXN_SUMMARY_INVOICE,
      TXN_CONTINUOUS_SUPPLY,
      TXN_EXPORT_INVOICE,
      TXN_DEEMED_SUPPLY_INVOICE,
      TXN_IMPORT_OF_SERVICES_RCM,
      TXN_SELF_BILLED_INVOICE,
      TXN_IMPORT_OF_GOODS,
    ],
  },
  "IBR-147-OM": {
    dimension: "txnType",
    values: [
      TXN_SUMMARY_INVOICE,
      TXN_CONTINUOUS_SUPPLY,
      TXN_EXPORT_INVOICE,
      TXN_IMPORT_OF_SERVICES_RCM,
      TXN_PROFIT_MARGIN_INVOICE,
      TXN_PROFIT_MARGIN_SELF_INVOICE,
      TXN_SELF_BILLED_INVOICE,
      TXN_ECOMMERCE_TRANSACTION,
    ],
  },
  "IBR-149-OM": {
    dimension: "txnType",
    values: [
      TXN_SELF_BILLED_INVOICE,
      TXN_THIRD_PARTY_INVOICE,
      TXN_SUMMARY_INVOICE,
      TXN_EXPORT_INVOICE,
      TXN_IMPORT_OF_SERVICES_RCM,
      TXN_PROFIT_MARGIN_INVOICE,
      TXN_PROFIT_MARGIN_SELF_INVOICE,
      TXN_IMPORT_OF_GOODS,
      TXN_SPECIAL_ZONE_SUPPLIES,
    ],
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

/**
 * Expand one polarity across Summary / Deemed Supply / Profit Margin Self-Invoice.
 * Title must contain `{type}`. When `withPrepaymentBit`, cell value is partner⊕Prepayment.
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
      : partnerBit;
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


// ---------------------------------------------------------------------------
// vatCategoryTaxRate
// ---------------------------------------------------------------------------
/** ALIGNED-IBRP-E-05-OM / O-05-OM: E or O must not contain IBT-152 rate. */
export const VAT_CATEGORY_RATE_FORBIDDEN_SCENARIOS: VatCategoryTaxRateScenario[] =
  [
    {
      ruleId: "ALIGNED-IBRP-E-05-OM",
      title:
        "Excel upload · Covoro | ALIGNED-IBRP-E-05-OM | Tax Category Exempt rate omitted → accepted",
      taxCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      taxRate: null,
      shouldError: false,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-E-05-OM",
      title:
        "Excel upload · Covoro | ALIGNED-IBRP-E-05-OM | Tax Category Exempt rate 5 → error file",
      taxCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      shouldError: true,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-E-05-OM",
      title:
        "Excel upload · Covoro | ALIGNED-IBRP-E-05-OM | Tax Category Exempt rate whitespace → error file",
      taxCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      taxRate: "   ",
      shouldError: true,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      // Excel TC-16 Positive*: non-E category may carry a valid rate (Standard=5).
      ruleId: "ALIGNED-IBRP-E-05-OM",
      title:
        "Excel upload · Covoro | ALIGNED-IBRP-E-05-OM | Tax Category not E + rate 5 → accepted",
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      shouldError: false,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-O-05-OM",
      title:
        "Excel upload · Covoro | ALIGNED-IBRP-O-05-OM | Tax Category Not subject rate omitted → accepted",
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxRate: null,
      shouldError: false,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-O-05-OM",
      title:
        "Excel upload · Covoro | ALIGNED-IBRP-O-05-OM | Tax Category Not subject rate 5 → error file",
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      shouldError: true,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-O-05-OM",
      title:
        "Excel upload · Covoro | ALIGNED-IBRP-O-05-OM | Tax Category Not subject rate whitespace → error file",
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxRate: "   ",
      shouldError: true,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-O-05-OM",
      title:
        "Excel upload · Covoro | ALIGNED-IBRP-O-05-OM | Tax Category not O + rate 5 → accepted",
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      shouldError: false,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    // IBR-061-OM / IBR-067-OM: breakdown/line rate forbidden for O / E (Covoro Tax Rate).
    {
      ruleId: "IBR-067-OM",
      title:
        "Excel upload · Covoro | IBR-067-OM | Exempt Tax Rate omitted → accepted",
      taxCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      taxRate: null,
      shouldError: false,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      ruleId: "IBR-067-OM",
      title:
        "Excel upload · Covoro | IBR-067-OM | Exempt Tax Rate 5 → error file",
      taxCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      shouldError: true,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      ruleId: "IBR-061-OM",
      title:
        "Excel upload · Covoro | IBR-061-OM | Not subject Tax Rate omitted → accepted",
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxRate: null,
      shouldError: false,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      ruleId: "IBR-061-OM",
      title:
        "Excel upload · Covoro | IBR-061-OM | Not subject Tax Rate 5 → error file",
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
      "Excel upload · Covoro | ALIGNED-IBRP-S-05-OM | Standard rate Tax Rate 5 → accepted",
    taxCategory: STANDARD_TAX_CATEGORY_CODE,
    taxRate: TAX_RATE_STANDARD_OMAN,
    shouldError: false,
    expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
  },
  {
    ruleId: "ALIGNED-IBRP-S-05-OM",
    title:
      "Excel upload · Covoro | ALIGNED-IBRP-S-05-OM | Standard rate Tax Rate 0 → error file",
    taxCategory: STANDARD_TAX_CATEGORY_CODE,
    taxRate: TAX_RATE_ZERO,
    shouldError: true,
    expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
  },
  {
    ruleId: "ALIGNED-IBRP-S-05-OM",
    title:
      "Excel upload · Covoro | ALIGNED-IBRP-S-05-OM | Standard rate Tax Rate empty → error file",
    taxCategory: STANDARD_TAX_CATEGORY_CODE,
    taxRate: null,
    shouldError: true,
    expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
  },
  {
    ruleId: "ALIGNED-IBRP-S-05-OM",
    title:
      "Excel upload · Covoro | ALIGNED-IBRP-S-05-OM | Standard rate Tax Rate whitespace → error file",
    taxCategory: STANDARD_TAX_CATEGORY_CODE,
    taxRate: "   ",
    shouldError: true,
    expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
  },
  {
    ruleId: "IBR-053-OM",
    title:
      "Excel upload · Covoro | IBR-053-OM | Standard VAT category rate 5 → accepted",
    taxCategory: STANDARD_TAX_CATEGORY_CODE,
    taxRate: TAX_RATE_STANDARD_OMAN,
    shouldError: false,
    expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
  },
  {
    ruleId: "IBR-053-OM",
    title:
      "Excel upload · Covoro | IBR-053-OM | Standard VAT category rate 0 → error file",
    taxCategory: STANDARD_TAX_CATEGORY_CODE,
    taxRate: TAX_RATE_ZERO,
    shouldError: true,
    expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
  },
];

/** ALIGNED-IBRP-Z-05-OM: Zero rated → rate MUST be 0. */
export const ZERO_RATED_TAX_RATE_SCENARIOS: VatCategoryTaxRateScenario[] = [
  {
    ruleId: "ALIGNED-IBRP-Z-05-OM",
    title:
      "Excel upload · Covoro | ALIGNED-IBRP-Z-05-OM | Zero rated Tax Rate 0 → accepted",
    taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
    taxRate: TAX_RATE_ZERO,
    shouldError: false,
    expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
  },
  {
    ruleId: "ALIGNED-IBRP-Z-05-OM",
    title:
      "Excel upload · Covoro | ALIGNED-IBRP-Z-05-OM | Zero rated Tax Rate 5 → error file",
    taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
    taxRate: TAX_RATE_STANDARD_OMAN,
    shouldError: true,
    expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
  },
  {
    ruleId: "ALIGNED-IBRP-Z-05-OM",
    title:
      "Excel upload · Covoro | ALIGNED-IBRP-Z-05-OM | Zero rated Tax Rate empty → error file",
    taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
    taxRate: null,
    shouldError: true,
    expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
  },
  {
    ruleId: "ALIGNED-IBRP-Z-05-OM",
    title:
      "Excel upload · Covoro | ALIGNED-IBRP-Z-05-OM | Zero rated Tax Rate whitespace → error file",
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
        "Excel upload · Covoro | ALIGNED-IBRP-048 | Standard rate Tax Rate 5 → accepted",
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      shouldError: false,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-048",
      title:
        "Excel upload · Covoro | ALIGNED-IBRP-048 | Standard rate Tax Rate empty → error file",
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      taxRate: null,
      shouldError: true,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-048",
      title:
        "Excel upload · Covoro | ALIGNED-IBRP-048 | Zero rated Tax Rate 0 → accepted",
      taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_ZERO,
      shouldError: false,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-048",
      title:
        "Excel upload · Covoro | ALIGNED-IBRP-048 | Zero rated Tax Rate empty → error file",
      taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      taxRate: null,
      shouldError: true,
      expectedErrorField: INVOICED_ITEM_TAX_RATE_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-048",
      title:
        "Excel upload · Covoro | ALIGNED-IBRP-048 | Not subject Tax Rate omitted → accepted",
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
 * ALIGNED-IBRP-S-10-OM: S must not have exemption reason.
 */
export const VAT_EXEMPTION_REASON_CONDITIONAL_SCENARIOS: VatExemptionReasonScenario[] =
  [
    {
      ruleId: "IBR-069-OM",
      title:
        "Excel upload · Covoro | IBR-069-OM | Exempt + exemption reason → accepted",
      taxCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_SAMPLE,
      taxRate: null,
      shouldError: false,
      expectedErrorField: TAX_EXEMPTION_REASON_CODE_FIELD,
    },
    {
      ruleId: "IBR-069-OM",
      title:
        "Excel upload · Covoro | IBR-069-OM | Exempt + empty exemption reason → error file",
      taxCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      taxExemptionReasonCode: null,
      taxRate: null,
      shouldError: true,
      expectedErrorField: TAX_EXEMPTION_REASON_CODE_FIELD,
    },
    {
      ruleId: "IBR-069-OM",
      title:
        "Excel upload · Covoro | IBR-069-OM | Zero rated + exemption reason → accepted",
      taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
      taxRate: TAX_RATE_ZERO,
      shouldError: false,
      expectedErrorField: TAX_EXEMPTION_REASON_CODE_FIELD,
    },
    {
      ruleId: "IBR-069-OM",
      title:
        "Excel upload · Covoro | IBR-069-OM | Zero rated + empty exemption reason → error file",
      taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      taxExemptionReasonCode: null,
      taxRate: TAX_RATE_ZERO,
      shouldError: true,
      expectedErrorField: TAX_EXEMPTION_REASON_CODE_FIELD,
    },
    {
      ruleId: "IBR-070-OM",
      title:
        "Excel upload · Covoro | IBR-070-OM | Not subject + empty exemption → accepted",
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxExemptionReasonCode: null,
      taxRate: null,
      shouldError: false,
      expectedErrorField: TAX_EXEMPTION_REASON_CODE_FIELD,
    },
    {
      ruleId: "IBR-070-OM",
      title:
        "Excel upload · Covoro | IBR-070-OM | Not subject + exemption reason → error file",
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_SAMPLE,
      taxRate: null,
      shouldError: true,
      expectedErrorField: TAX_EXEMPTION_REASON_CODE_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-S-10-OM",
      title:
        "Excel upload · Covoro | ALIGNED-IBRP-S-10-OM | Standard + empty exemption → accepted",
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      taxExemptionReasonCode: null,
      taxRate: TAX_RATE_STANDARD_OMAN,
      shouldError: false,
      expectedErrorField: TAX_EXEMPTION_REASON_CODE_FIELD,
    },
    {
      ruleId: "ALIGNED-IBRP-S-10-OM",
      title:
        "Excel upload · Covoro | ALIGNED-IBRP-S-10-OM | Standard + exemption reason → error file",
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_SAMPLE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      shouldError: true,
      expectedErrorField: TAX_EXEMPTION_REASON_CODE_FIELD,
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
      "Excel upload · Covoro | ALIGNED-IBRP-028-OM | {type} + preceding ref → accepted",
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
      "Excel upload · Covoro | ALIGNED-IBRP-028-OM | {type} + empty preceding ref → error file",
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
      "Excel upload · Covoro | ALIGNED-IBRP-028-OM | Commercial invoice + empty preceding → accepted",
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
      "Excel upload · Covoro | IBR-032-OM | {type} + ref/date/UUID → accepted",
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
      "Excel upload · Covoro | IBR-032-OM | {type} + ref/date + empty UUID → error file",
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
      "Excel upload · Covoro | IBR-002-OM | Credit note + UUID v5 → accepted",
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
      "Excel upload · Covoro | IBR-002-OM | Credit note + UUID v4 → error file",
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
      "Excel upload · Covoro | IBR-002-OM | Credit note + non-UUID → error file",
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
      "Excel upload · Covoro | IBR-004-OM | Currency OMR + empty exchange rate → accepted",
    invoiceCurrencyCode: OMAN_CURRENCY_OMR,
    sourceCurrencyCode: OMAN_CURRENCY_OMR,
    exchangeRate: "",
    shouldError: false,
    expectedErrorField: EXCHANGE_RATE_FIELD,
  },
  {
    ruleId: "IBR-004-OM",
    title:
      "Excel upload · Covoro | IBR-004-OM | Currency USD + exchange rate → accepted",
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
      "Excel upload · Covoro | IBR-004-OM | Currency USD + empty exchange rate → error file",
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
      "Excel upload · Covoro | IBR-172-OM | Currency OMR + exchange rate present → error file",
    invoiceCurrencyCode: OMAN_CURRENCY_OMR,
    sourceCurrencyCode: OMAN_CURRENCY_OMR,
    exchangeRate: "0.385",
    shouldError: true,
    expectedErrorField: EXCHANGE_RATE_FIELD,
  },
  {
    ruleId: "IBR-172-OM",
    title:
      "Excel upload · Covoro | IBR-172-OM | Currency OMR + empty exchange rate → accepted",
    invoiceCurrencyCode: OMAN_CURRENCY_OMR,
    sourceCurrencyCode: OMAN_CURRENCY_OMR,
    exchangeRate: "",
    shouldError: false,
    expectedErrorField: EXCHANGE_RATE_FIELD,
  },
  {
    ruleId: "IBR-034-OM",
    title:
      "Excel upload · Covoro | IBR-034-OM | Currency USD + source currency + tax amount → accepted",
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
      "Excel upload · Covoro | IBR-034-OM | Currency USD + empty tax amount in accounting currency → error file",
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
      "Excel upload · Covoro | IBR-005-OM | Currency USD + exchange rate 7 decimals → accepted",
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
      "Excel upload · Covoro | IBR-005-OM | Currency USD + exchange rate 8 decimals → error file",
    invoiceCurrencyCode: OMAN_CURRENCY_USD,
    sourceCurrencyCode: OMAN_CURRENCY_USD,
    exchangeRate: "0.12345678",
    taxAmountInAccountingCurrency: "50",
    shouldError: true,
    expectedErrorField: EXCHANGE_RATE_FIELD,
  },
  {
    ruleId: "IBR-DEC-03-OM",
    title:
      "Excel upload · Covoro | IBR-DEC-03-OM | Currency USD + FX 7 decimals → accepted",
    invoiceCurrencyCode: OMAN_CURRENCY_USD,
    sourceCurrencyCode: OMAN_CURRENCY_USD,
    exchangeRate: "0.3850000",
    taxAmountInAccountingCurrency: "50",
    shouldError: false,
    expectedErrorField: EXCHANGE_RATE_FIELD,
  },
  {
    ruleId: "IBR-DEC-03-OM",
    title:
      "Excel upload · Covoro | IBR-DEC-03-OM | Currency USD + FX 8 decimals → error file",
    invoiceCurrencyCode: OMAN_CURRENCY_USD,
    sourceCurrencyCode: OMAN_CURRENCY_USD,
    exchangeRate: "0.38500001",
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
        "Excel upload · Covoro | IBR-DEC-03-OM | Item Gross Price 3 decimals → accepted",
      itemGrossPrice: "1000.123",
      shouldError: false,
      expectedErrorField: "Item Gross Price",
    },
    {
      ruleId: "IBR-DEC-03-OM",
      title:
        "Excel upload · Covoro | IBR-DEC-03-OM | Item Gross Price 4 decimals → error file",
      itemGrossPrice: "1000.1234",
      shouldError: true,
      expectedErrorField: "Item Gross Price",
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
      "Excel upload · Covoro | IBR-078-OM | Full Tax + Item Type Goods → accepted",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    itemType: ITEM_TYPE_GOODS,
    shouldError: false,
    expectedErrorField: ITEM_TYPE_FIELD,
  },
  {
    ruleId: "IBR-078-OM",
    title:
      "Excel upload · Covoro | IBR-078-OM | Full Tax + empty Item Type → error file",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    itemType: "",
    shouldError: true,
    expectedErrorField: ITEM_TYPE_FIELD,
  },
  {
    ruleId: "IBR-078-OM",
    title:
      "Excel upload · Covoro | IBR-078-OM | Simplified + empty Item Type → accepted",
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
      "Excel upload · Covoro | IBR-079-OM | Goods + HS classification → accepted",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    itemType: ITEM_TYPE_GOODS,
    itemClassificationIdentifier: OMAN_HS_CODE_12,
    shouldError: false,
    expectedErrorField: ITEM_CLASSIFICATION_IDENTIFIER_FIELD,
  },
  {
    ruleId: "IBR-079-OM",
    title:
      "Excel upload · Covoro | IBR-079-OM | Goods + empty classification → error file",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    itemType: ITEM_TYPE_GOODS,
    itemClassificationIdentifier: "",
    shouldError: true,
    expectedErrorField: ITEM_CLASSIFICATION_IDENTIFIER_FIELD,
  },
  {
    ruleId: "IBR-079-OM",
    title:
      "Excel upload · Covoro | IBR-079-OM | Services + empty classification → accepted",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    itemType: ITEM_TYPE_SERVICES,
    itemClassificationIdentifier: "",
    shouldError: false,
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
      "Excel upload · Covoro | IBR-084-OM | Import of Goods + country of origin → accepted",
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
      "Excel upload · Covoro | IBR-084-OM | Import of Goods + empty origin → error file",
    itemCountryOfOrigin: "",
    importDate: "2026-01-10",
    customsDeclarationNumber: "CD-12345",
    incoterms: "Free On Board",
    shouldError: true,
    expectedErrorField: ITEM_COUNTRY_OF_ORIGIN_FIELD,
  },
  {
    ruleId: "IBR-085-OM",
    title:
      "Excel upload · Covoro | IBR-085-OM | Import of Goods + empty customs declaration → error file",
    itemCountryOfOrigin: "India",
    importDate: "2026-01-10",
    customsDeclarationNumber: "",
    incoterms: "Free On Board",
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
        "Excel upload · Covoro | IBR-086-OM | Profit Margin Self-Invoice + Not subject → accepted",
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      sellerCountryCode: OMAN_COUNTRY_CODE,
      shouldError: false,
      expectedErrorField: TAX_CATEGORY_FIELD,
    },
    {
      ruleId: "IBR-086-OM",
      title:
        "Excel upload · Covoro | IBR-086-OM | Profit Margin Self-Invoice + Standard → error file",
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      sellerCountryCode: OMAN_COUNTRY_CODE,
      shouldError: true,
      expectedErrorField: TAX_CATEGORY_FIELD,
    },
    {
      ruleId: "IBR-087-OM",
      title:
        "Excel upload · Covoro | IBR-087-OM | Profit Margin Self-Invoice + seller not OM → error file",
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      sellerCountryCode: "India",
      shouldError: true,
      expectedErrorField: SELLER_COUNTRY_CODE_FIELD,
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
      "Excel upload · Covoro | IBR-037-OM | {txn} + period dates → accepted",
    periodStart: "2026-01-01",
    periodEnd: "2026-01-31",
    shouldError: false,
    expectedErrorField: INVOICING_PERIOD_START_DATE_FIELD,
  }),
  ...expandAcrossSummaryOrContinuousTxnTypes<SummaryPeriodScenario>({
    ruleId: "IBR-037-OM",
    title:
      "Excel upload · Covoro | IBR-037-OM | {txn} + empty period → error file",
    periodStart: "",
    periodEnd: "",
    shouldError: true,
    expectedErrorField: INVOICING_PERIOD_START_DATE_FIELD,
  }),
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
        "Excel upload · Covoro | IBR-062-OM | Allowance Exempt + exemption reason → accepted",
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
        "Excel upload · Covoro | IBR-062-OM | Allowance Exempt + empty exemption → error file",
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
        "Excel upload · Covoro | IBR-062-OM | Allowance Zero rated + exemption reason → accepted",
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
        "Excel upload · Covoro | IBR-062-OM | Allowance Zero rated + empty exemption → error file",
      kind: "allowance",
      vatCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      exemptionReason: "",
      amount: "50",
      shouldError: true,
      expectedErrorField: TAX_EXEMPTION_REASON_ALLOWANCES_FIELD,
    },
    {
      ruleId: "IBR-064-OM",
      title:
        "Excel upload · Covoro | IBR-064-OM | Charge Exempt + exemption reason → accepted",
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
        "Excel upload · Covoro | IBR-064-OM | Charge Exempt + empty exemption → error file",
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
        "Excel upload · Covoro | IBR-064-OM | Charge Zero rated + exemption reason → accepted",
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
        "Excel upload · Covoro | IBR-064-OM | Charge Zero rated + empty exemption → error file",
      kind: "charge",
      vatCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      exemptionReason: "",
      amount: "100",
      shouldError: true,
      expectedErrorField: TAX_EXEMPTION_REASON_CHARGES_FIELD,
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
      "Excel upload · Covoro | IBR-023-OM | {type} + reason code → accepted",
    creditDebitNoteReasonCode: CREDIT_DEBIT_REASON_SAMPLE,
    precedingInvoiceReference: "INV-PREV-023",
    shouldError: false,
    expectedErrorField: CREDIT_DEBIT_NOTE_REASON_CODE_FIELD,
  }),
  ...expandAcrossCnDnSelfBilledTypes<CreditDebitReasonScenario>({
    ruleId: "IBR-023-OM",
    title:
      "Excel upload · Covoro | IBR-023-OM | {type} + empty reason → error file",
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
 * invoice (389), Invoice Transaction Type must be one of the allowed self-bill /
 * import / profit-margin-self set. Live: one type per test; packs: both in one workbook.
 */
export const SELF_BILLED_TXN_CONSTRAINT_SCENARIOS: SelfBilledTxnConstraintScenario[] =
  [
    ...expandAcrossSelfBilledDocumentTypes<SelfBilledTxnConstraintScenario>({
      ruleId: "IBR-177-OM",
      title:
        "Excel upload · Covoro | IBR-177-OM | {type} + Self-billed txn → accepted",
      invoiceTransactionTypeCode: TXN_SELF_BILLED_INVOICE,
      shouldError: false,
      expectedErrorField: INVOICE_TRANSACTION_TYPE_CODE_FIELD,
    }),
    ...expandAcrossSelfBilledDocumentTypes<SelfBilledTxnConstraintScenario>({
      ruleId: "IBR-177-OM",
      title:
        "Excel upload · Covoro | IBR-177-OM | {type} + Full Tax txn → error file",
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
 * Profit Margin Self-Invoice on BTOM-001. Conflict rows use Peppol bit OR;
 * control uses Master label Prepayment alone. Live: one partner per test.
 * Pack: MULTI_VALUE_PACK_EXPAND emits Summary|Deemed|PM-Self rows (conflict bits
 * on invalidate); live suite keeps 1 partner per test.
 */
export const PREPAYMENT_TXN_EXCLUSION_SCENARIOS: PrepaymentTxnExclusionScenario[] =
  [
    ...expandAcrossPrepaymentExclusionPartners<PrepaymentTxnExclusionScenario>({
      ruleId: "IBR-176-OM",
      title:
        "Excel upload · Covoro | IBR-176-OM | Prepayment + {type} bits → error file",
      withPrepaymentBit: true,
      shouldError: true,
      expectedErrorField: INVOICE_TRANSACTION_TYPE_CODE_FIELD,
    }),
    {
      ruleId: "IBR-176-OM",
      title:
        "Excel upload · Covoro | IBR-176-OM | Prepayment alone (no Summary/Deemed/PM-Self) → accepted",
      conflictingTxnType: "",
      invoiceTransactionTypeCode: TXN_PREPAYMENT_INVOICE,
      shouldError: false,
      expectedErrorField: INVOICE_TRANSACTION_TYPE_CODE_FIELD,
    },
  ];


// ---------------------------------------------------------------------------
// exportDelivery (IBR-014-OM)
// ---------------------------------------------------------------------------
/** IBR-014-OM: Export Invoice requires Deliver to country code. */
export const EXPORT_DELIVERY_SCENARIOS: ExportDeliveryScenario[] = [
  {
    ruleId: "IBR-014-OM",
    title:
      "Excel upload · Covoro | IBR-014-OM | Export + Deliver to country → accepted",
    invoiceTransactionTypeCode: TXN_EXPORT_INVOICE,
    deliverToCountryCode: "United Arab Emirates",
    shouldError: false,
    expectedErrorField: DELIVER_TO_COUNTRY_CODE_FIELD,
  },
  {
    ruleId: "IBR-014-OM",
    title:
      "Excel upload · Covoro | IBR-014-OM | Export + empty Deliver to country → error file",
    invoiceTransactionTypeCode: TXN_EXPORT_INVOICE,
    deliverToCountryCode: "",
    shouldError: true,
    expectedErrorField: DELIVER_TO_COUNTRY_CODE_FIELD,
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
      "Excel upload · Covoro | IBR-151-OM | Special Zone + Special Zone License → accepted",
    invoiceTransactionTypeCode: TXN_SPECIAL_ZONE_SUPPLIES,
    sellerIdentifierTextualCode: SPECIAL_ZONE_LICENSE_SCHEME,
    sellerIdentifier: "SZ-LIC-001",
    shouldError: false,
    expectedErrorField: SELLER_IDENTIFIER_TEXTUAL_CODE_FIELD,
  },
  {
    ruleId: "IBR-151-OM",
    title:
      "Excel upload · Covoro | IBR-151-OM | Special Zone + empty seller identifier → error file",
    invoiceTransactionTypeCode: TXN_SPECIAL_ZONE_SUPPLIES,
    sellerIdentifierTextualCode: SPECIAL_ZONE_LICENSE_SCHEME,
    sellerIdentifier: "",
    shouldError: true,
    expectedErrorField: SELLER_IDENTIFIER_FIELD,
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
      "Excel upload · Covoro | IBR-017-OM | {txn} + Buyer VATIN → accepted",
    buyerVatIdentifier: "OM1000091919",
    shouldError: false,
    expectedErrorField: BUYER_VAT_IDENTIFIER_FIELD,
  }),
  ...expandAcrossSelfBilledOrRcmTxnTypes<SelfBilledBuyerVatScenario>({
    ruleId: "IBR-017-OM",
    title:
      "Excel upload · Covoro | IBR-017-OM | {txn} + empty Buyer VATIN → error file",
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
        "Excel upload · Covoro | IBR-047-OM | Allowance Standard (rate 5 implied) → accepted",
      kind: "allowance",
      vatCategory: STANDARD_TAX_CATEGORY_CODE,
      exemptionReason: "",
      amount: "50",
      shouldError: false,
      expectedErrorField: VAT_CATEGORY_ALLOWANCES_FIELD,
    },
    {
      ruleId: "IBR-094-OM",
      title:
        "Excel upload · Covoro | IBR-094-OM | Allowance Zero rated (rate 0 implied) → accepted",
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
        "Excel upload · Covoro | IBR-094-OM | Allowance Zero rated + empty exemption → error file",
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
      "Excel upload · Covoro | IBR-155-OM | Export + Export of Services + Service Type → accepted",
    invoiceTransactionTypeCode: TXN_EXPORT_INVOICE,
    taxExemptionReasonCode: TAX_EXEMPTION_REASON_EXPORT_OF_SERVICES,
    serviceTypeCode: SERVICE_TYPE_CODE_SAMPLE,
    shouldError: false,
    expectedErrorField: SERVICE_TYPE_CODE_FIELD,
  },
  {
    ruleId: "IBR-155-OM",
    title:
      "Excel upload · Covoro | IBR-155-OM | Export + Export of Services + empty Service Type → error file",
    invoiceTransactionTypeCode: TXN_EXPORT_INVOICE,
    taxExemptionReasonCode: TAX_EXEMPTION_REASON_EXPORT_OF_SERVICES,
    serviceTypeCode: "",
    shouldError: true,
    expectedErrorField: SERVICE_TYPE_CODE_FIELD,
  },
  {
    ruleId: "IBR-155-OM",
    title:
      "Excel upload · Covoro | IBR-155-OM | Export + Export of Services + invalid Service Type → error file",
    invoiceTransactionTypeCode: TXN_EXPORT_INVOICE,
    taxExemptionReasonCode: TAX_EXEMPTION_REASON_EXPORT_OF_SERVICES,
    serviceTypeCode: SERVICE_TYPE_CODE_INVALID,
    shouldError: true,
    expectedErrorField: SERVICE_TYPE_CODE_FIELD,
  },
  {
    ruleId: "IBR-155-OM",
    title:
      "Excel upload · Covoro | IBR-155-OM | Full Tax + empty Service Type (trigger off) → accepted",
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
        "Excel upload · Covoro | IBR-012-OM | Export + Export of Services + non-OM deliver → accepted",
      invoiceTransactionTypeCode: TXN_EXPORT_INVOICE,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_EXPORT_OF_SERVICES,
      deliverToCountryCode: UAE_COUNTRY_CODE,
      shouldError: false,
      expectedErrorField: DELIVER_TO_COUNTRY_CODE_FIELD,
    },
    {
      ruleId: "IBR-012-OM",
      title:
        "Excel upload · Covoro | IBR-012-OM | Export + Export of Services + OM deliver → error file",
      invoiceTransactionTypeCode: TXN_EXPORT_INVOICE,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_EXPORT_OF_SERVICES,
      deliverToCountryCode: OMAN_COUNTRY_CODE,
      shouldError: true,
      expectedErrorField: DELIVER_TO_COUNTRY_CODE_FIELD,
    },
    {
      ruleId: "IBR-012-OM",
      title:
        "Excel upload · Covoro | IBR-012-OM | Full Tax + OM deliver (trigger off) → accepted",
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
/** IBR-013-OM: Export + Export of Services → supporting document ref + UUID. */
export const EXPORT_SUPPORTING_DOCUMENT_SCENARIOS: ExportSupportingDocumentScenario[] =
  [
    {
      ruleId: "IBR-013-OM",
      title:
        "Excel upload · Covoro | IBR-013-OM | Export + Export of Services + supporting docs → accepted",
      invoiceTransactionTypeCode: TXN_EXPORT_INVOICE,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_EXPORT_OF_SERVICES,
      supportingDocumentReference: SUPPORTING_DOCUMENT_REFERENCE_SAMPLE,
      supportingDocumentUuid: SUPPORTING_DOCUMENT_UUID_SAMPLE,
      shouldError: false,
      expectedErrorField: SUPPORTING_DOCUMENT_REFERENCE_FIELD,
    },
    {
      ruleId: "IBR-013-OM",
      title:
        "Excel upload · Covoro | IBR-013-OM | Export + Export of Services + empty supporting docs → error file",
      invoiceTransactionTypeCode: TXN_EXPORT_INVOICE,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_EXPORT_OF_SERVICES,
      supportingDocumentReference: "",
      supportingDocumentUuid: "",
      shouldError: true,
      expectedErrorField: SUPPORTING_DOCUMENT_REFERENCE_FIELD,
    },
    {
      ruleId: "IBR-013-OM",
      title:
        "Excel upload · Covoro | IBR-013-OM | Full Tax + empty supporting docs (trigger off) → accepted",
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
        "Excel upload · Covoro | IBR-020-OM | {txn} + Buyer country OM → accepted",
      buyerCountryCode: OMAN_COUNTRY_CODE,
      shouldError: false,
      expectedErrorField: BUYER_COUNTRY_CODE_FIELD,
    }),
    ...expandAcrossSelfBilledOrRcmTxnTypes<SelfBilledRcmBuyerCountryScenario>({
      ruleId: "IBR-020-OM",
      title:
        "Excel upload · Covoro | IBR-020-OM | {txn} + Buyer country UAE → error file",
      buyerCountryCode: UAE_COUNTRY_CODE,
      shouldError: true,
      expectedErrorField: BUYER_COUNTRY_CODE_FIELD,
    }),
    ...expandAcrossSelfBilledOrRcmTxnTypes<SelfBilledRcmBuyerCountryScenario>({
      ruleId: "IBR-020-OM",
      title:
        "Excel upload · Covoro | IBR-020-OM | {txn} + empty Buyer country → error file",
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
      "Excel upload · Covoro | IBR-003-OM | Seller VATIN OM########## → accepted",
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
      "Excel upload · Covoro | IBR-003-OM | Seller VATIN wrong prefix XX########## → error file",
    party: "seller",
    vatinValue: "XX1108202600",
    shouldError: true,
    expectedErrorField: SELLER_VAT_IDENTIFIER_FIELD,
    patchSellerVatAfterGenerate: true,
  },
  {
    ruleId: "IBR-003-OM",
    title:
      "Excel upload · Covoro | IBR-003-OM | Seller VATIN OM + non-digit → error file",
    party: "seller",
    vatinValue: "OM110820260A",
    shouldError: true,
    expectedErrorField: SELLER_VAT_IDENTIFIER_FIELD,
    patchSellerVatAfterGenerate: true,
  },
  {
    ruleId: "IBR-003-OM",
    title:
      "Excel upload · Covoro | IBR-003-OM | Buyer VATIN OM########## → accepted",
    party: "buyer",
    vatinValue: IBR_003_VALID_BUYER_VATIN,
    shouldError: false,
    expectedErrorField: BUYER_VAT_IDENTIFIER_FIELD,
  },
  {
    ruleId: "IBR-003-OM",
    title:
      "Excel upload · Covoro | IBR-003-OM | Buyer VATIN wrong prefix XX########## → error file",
    party: "buyer",
    vatinValue: "XX1000091919",
    shouldError: true,
    expectedErrorField: BUYER_VAT_IDENTIFIER_FIELD,
  },
  {
    ruleId: "IBR-003-OM",
    title:
      "Excel upload · Covoro | IBR-003-OM | Buyer VATIN OM + non-digit → error file",
    party: "buyer",
    vatinValue: "OM100009191A",
    shouldError: true,
    expectedErrorField: BUYER_VAT_IDENTIFIER_FIELD,
  },
  {
    ruleId: "IBR-003-OM",
    title:
      "Excel upload · Covoro | IBR-003-OM | Third Party VATIN OM########## → accepted",
    party: "thirdParty",
    vatinValue: IBR_003_VALID_THIRD_PARTY_VATIN,
    shouldError: false,
    expectedErrorField: THIRD_PARTY_VATIN_FIELD,
  },
  {
    ruleId: "IBR-003-OM",
    title:
      "Excel upload · Covoro | IBR-003-OM | Third Party VATIN wrong prefix XX########## → error file",
    party: "thirdParty",
    vatinValue: "XX2000091919",
    shouldError: true,
    expectedErrorField: THIRD_PARTY_VATIN_FIELD,
  },
  {
    ruleId: "IBR-003-OM",
    title:
      "Excel upload · Covoro | IBR-003-OM | Third Party VATIN OM + non-digit → error file",
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
 * is the IBT-118 proxy. Blank/whitespace/null Excel negatives collapse to empty
 * Tax Category (omit). Simplified Tax Invoice is the documented exception.
 */
export const VAT_BREAKDOWN_CATEGORY_PRESENCE_SCENARIOS: VatBreakdownCategoryPresenceScenario[] =
  [
    // E-01
    {
      ruleId: "ALIGNED-IBRP-E-01-OM",
      title:
        "Excel upload · Covoro | ALIGNED-IBRP-E-01-OM | Full Tax + Exempt breakdown → accepted",
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
        "Excel upload · Covoro | ALIGNED-IBRP-E-01-OM | Full Tax + empty Exempt breakdown → error file",
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
        "Excel upload · Covoro | ALIGNED-IBRP-E-01-OM | Full Tax + whitespace Exempt breakdown → error file",
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
        "Excel upload · Covoro | ALIGNED-IBRP-E-01-OM | Full Tax + no E component → accepted",
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
        "Excel upload · Covoro | ALIGNED-IBRP-E-01-OM | Simplified + Exempt omit ok → accepted",
      invoiceTransactionTypeCode: TXN_SIMPLIFIED_TAX_INVOICE,
      taxCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      taxRate: null,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_SAMPLE,
      shouldError: false,
      expectedErrorField: TAX_CATEGORY_FIELD,
    },
    // O-01
    {
      ruleId: "ALIGNED-IBRP-O-01-OM",
      title:
        "Excel upload · Covoro | ALIGNED-IBRP-O-01-OM | Full Tax + Not subject breakdown → accepted",
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
        "Excel upload · Covoro | ALIGNED-IBRP-O-01-OM | Full Tax + empty O breakdown → error file",
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
        "Excel upload · Covoro | ALIGNED-IBRP-O-01-OM | Full Tax + no O component → accepted",
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
        "Excel upload · Covoro | ALIGNED-IBRP-O-01-OM | Simplified + Not subject omit ok → accepted",
      invoiceTransactionTypeCode: TXN_SIMPLIFIED_TAX_INVOICE,
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxRate: null,
      taxExemptionReasonCode: "",
      shouldError: false,
      expectedErrorField: TAX_CATEGORY_FIELD,
    },
    // S-01
    {
      ruleId: "ALIGNED-IBRP-S-01-OM",
      title:
        "Excel upload · Covoro | ALIGNED-IBRP-S-01-OM | Full Tax + Standard breakdown → accepted",
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
        "Excel upload · Covoro | ALIGNED-IBRP-S-01-OM | Full Tax + empty S breakdown → error file",
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
        "Excel upload · Covoro | ALIGNED-IBRP-S-01-OM | Simplified + Standard omit ok → accepted",
      invoiceTransactionTypeCode: TXN_SIMPLIFIED_TAX_INVOICE,
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      taxExemptionReasonCode: "",
      shouldError: false,
      expectedErrorField: TAX_CATEGORY_FIELD,
    },
    // Z-01
    {
      ruleId: "ALIGNED-IBRP-Z-01-OM",
      title:
        "Excel upload · Covoro | ALIGNED-IBRP-Z-01-OM | Full Tax + Zero rated breakdown → accepted",
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
        "Excel upload · Covoro | ALIGNED-IBRP-Z-01-OM | Full Tax + empty Z breakdown → error file",
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
        "Excel upload · Covoro | ALIGNED-IBRP-Z-01-OM | Full Tax + no Z component → accepted",
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
        "Excel upload · Covoro | ALIGNED-IBRP-Z-01-OM | Simplified + Zero rated omit ok → accepted",
      invoiceTransactionTypeCode: TXN_SIMPLIFIED_TAX_INVOICE,
      taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_ZERO,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
      shouldError: false,
      expectedErrorField: TAX_CATEGORY_FIELD,
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
        "Excel upload · Covoro | IBR-038-OM | Full Tax + line VAT amount → accepted",
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
        "Excel upload · Covoro | IBR-038-OM | Full Tax + empty line VAT amount → error file",
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
        "Excel upload · Covoro | IBR-038-OM | Simplified + empty line VAT amount → accepted",
      invoiceTransactionTypeCode: TXN_SIMPLIFIED_TAX_INVOICE,
      taxCategory: STANDARD_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_STANDARD_OMAN,
      lineItemVatAmount: "",
      shouldError: false,
      expectedErrorField: LINE_ITEM_VAT_AMOUNT_FIELD,
    },
  ];

export const LINE_ITEM_VAT_AMOUNT_ZERO_SCENARIOS: LineItemVatAmountZeroScenario[] =
  [
    {
      ruleId: "IBR-039-OM",
      title:
        "Excel upload · Covoro | IBR-039-OM | Exempt + line VAT 0 → accepted",
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
        "Excel upload · Covoro | IBR-039-OM | Exempt + line VAT 50 → error file",
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
        "Excel upload · Covoro | IBR-054-OM | Not subject + line VAT 0 → accepted",
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxRate: null,
      lineItemVatAmount: "0",
      shouldError: false,
      expectedErrorField: LINE_ITEM_VAT_AMOUNT_FIELD,
    },
    {
      ruleId: "IBR-054-OM",
      title:
        "Excel upload · Covoro | IBR-054-OM | Not subject + line VAT 50 → error file",
      taxCategory: NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
      taxRate: null,
      lineItemVatAmount: "50",
      shouldError: true,
      expectedErrorField: LINE_ITEM_VAT_AMOUNT_FIELD,
    },
    {
      ruleId: "IBR-077-OM",
      title:
        "Excel upload · Covoro | IBR-077-OM | Zero rated + line VAT 0 → accepted",
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
        "Excel upload · Covoro | IBR-077-OM | Zero rated + line VAT 50 → error file",
      taxCategory: ZERO_RATED_TAX_CATEGORY_CODE,
      taxRate: TAX_RATE_ZERO,
      taxExemptionReasonCode: TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
      lineItemVatAmount: "50",
      shouldError: true,
      expectedErrorField: LINE_ITEM_VAT_AMOUNT_FIELD,
    },
  ];

// ---------------------------------------------------------------------------
// txnMutualExclusion (IBR-138…149-OM) — representative conflict pairs
// ---------------------------------------------------------------------------
export const TXN_MUTUAL_EXCLUSION_SCENARIOS: TxnMutualExclusionScenario[] = [
  {
    ruleId: "IBR-138-OM",
    title:
      "Excel upload · Covoro | IBR-138-OM | Self-billed + Third-party bits → error file",
    invoiceTransactionTypeCode: combineOmanTxnTypeBits(
      "00100000000000000000",
      "00010000000000000000"
    ),
    shouldError: true,
    expectedErrorField: INVOICE_TRANSACTION_TYPE_CODE_FIELD,
  },
  {
    ruleId: "IBR-138-OM",
    title:
      "Excel upload · Covoro | IBR-138-OM | Self-billed alone → accepted",
    invoiceTransactionTypeCode: TXN_SELF_BILLED_INVOICE,
    shouldError: false,
    expectedErrorField: INVOICE_TRANSACTION_TYPE_CODE_FIELD,
  },
  {
    ruleId: "IBR-149-OM",
    title:
      "Excel upload · Covoro | IBR-149-OM | Simplified + Self-billed bits → error file",
    invoiceTransactionTypeCode: combineOmanTxnTypeBits(
      "01000000000000000000",
      "00100000000000000000"
    ),
    shouldError: true,
    expectedErrorField: INVOICE_TRANSACTION_TYPE_CODE_FIELD,
  },
  {
    ruleId: "IBR-149-OM",
    title:
      "Excel upload · Covoro | IBR-149-OM | Simplified alone → accepted",
    invoiceTransactionTypeCode: TXN_SIMPLIFIED_TAX_INVOICE,
    shouldError: false,
    expectedErrorField: INVOICE_TRANSACTION_TYPE_CODE_FIELD,
  },
];

// ---------------------------------------------------------------------------
// sellerVatMandatory (IBR-006-OM)
// ---------------------------------------------------------------------------
export const SELLER_VAT_MANDATORY_SCENARIOS: SellerVatMandatoryScenario[] = [
  {
    ruleId: "IBR-006-OM",
    title:
      "Excel upload · Covoro | IBR-006-OM | Full Tax + Seller VATIN → accepted",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    sellerVatIdentifier: IBR_003_VALID_SELLER_VATIN,
    shouldError: false,
    expectedErrorField: SELLER_VAT_IDENTIFIER_FIELD,
  },
  {
    ruleId: "IBR-006-OM",
    title:
      "Excel upload · Covoro | IBR-006-OM | Full Tax + empty Seller VATIN → error file",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    sellerVatIdentifier: "",
    patchSellerVatAfterGenerate: true,
    shouldError: true,
    expectedErrorField: SELLER_VAT_IDENTIFIER_FIELD,
  },
  {
    ruleId: "IBR-006-OM",
    title:
      "Excel upload · Covoro | IBR-006-OM | Import of Goods + empty Seller VATIN → accepted",
    invoiceTransactionTypeCode: TXN_IMPORT_OF_GOODS,
    sellerVatIdentifier: "",
    patchSellerVatAfterGenerate: true,
    shouldError: false,
    expectedErrorField: SELLER_VAT_IDENTIFIER_FIELD,
  },
];

// ---------------------------------------------------------------------------
// buyerIdOrVatin (IBR-016-OM)
// ---------------------------------------------------------------------------
export const BUYER_ID_OR_VATIN_SCENARIOS: BuyerIdOrVatinScenario[] = [
  {
    ruleId: "IBR-016-OM",
    title:
      "Excel upload · Covoro | IBR-016-OM | Full Tax + Buyer VATIN → accepted",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    buyerIdentifier: "OM-BUYER-001",
    buyerVatIdentifier: IBR_003_VALID_BUYER_VATIN,
    shouldError: false,
    expectedErrorField: BUYER_VAT_IDENTIFIER_FIELD,
  },
  {
    ruleId: "IBR-016-OM",
    title:
      "Excel upload · Covoro | IBR-016-OM | Full Tax + empty Buyer id and VATIN → error file",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    buyerIdentifier: "",
    buyerVatIdentifier: "",
    shouldError: true,
    expectedErrorField: BUYER_VAT_IDENTIFIER_FIELD,
  },
];

// ---------------------------------------------------------------------------
// buyerAddressRequired (IBR-019-OM)
// ---------------------------------------------------------------------------
export const BUYER_ADDRESS_REQUIRED_SCENARIOS: BuyerAddressRequiredScenario[] = [
  {
    ruleId: "IBR-019-OM",
    title:
      "Excel upload · Covoro | IBR-019-OM | Full Tax + Buyer address → accepted",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    buyerAddressLine1: "Shop 5, Ruwi High Street",
    shouldError: false,
    expectedErrorField: "Buyer address line 1",
  },
  {
    ruleId: "IBR-019-OM",
    title:
      "Excel upload · Covoro | IBR-019-OM | Full Tax + empty Buyer address line 1 → error file",
    invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
    buyerAddressLine1: "",
    shouldError: true,
    expectedErrorField: "Buyer address line 1",
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
        "Excel upload · Covoro | IBR-029 | Summary period end >= start → accepted",
      invoiceTransactionTypeCode: TXN_SUMMARY_INVOICE,
      periodStart: "2026-01-01",
      periodEnd: "2026-01-31",
      shouldError: false,
      expectedErrorField: INVOICING_PERIOD_END_DATE_FIELD,
    },
    {
      ruleId: "IBR-029",
      title:
        "Excel upload · Covoro | IBR-029 | Summary period end < start → error file",
      invoiceTransactionTypeCode: TXN_SUMMARY_INVOICE,
      periodStart: "2026-01-31",
      periodEnd: "2026-01-01",
      shouldError: true,
      expectedErrorField: INVOICING_PERIOD_END_DATE_FIELD,
    },
    {
      ruleId: "IBR-CO-19",
      title:
        "Excel upload · Covoro | IBR-CO-19 | Summary + start only → accepted",
      invoiceTransactionTypeCode: TXN_SUMMARY_INVOICE,
      periodStart: "2026-01-01",
      periodEnd: "",
      shouldError: false,
      expectedErrorField: INVOICING_PERIOD_START_DATE_FIELD,
    },
    {
      ruleId: "IBR-CO-19",
      title:
        "Excel upload · Covoro | IBR-CO-19 | Summary + both period empty → error file",
      invoiceTransactionTypeCode: TXN_SUMMARY_INVOICE,
      periodStart: "",
      periodEnd: "",
      shouldError: true,
      expectedErrorField: INVOICING_PERIOD_START_DATE_FIELD,
    },
  ];

// ---------------------------------------------------------------------------
// prepaymentPaidAmount (IBR-058-OM)
// ---------------------------------------------------------------------------
export const PREPAYMENT_PAID_AMOUNT_SCENARIOS: PrepaymentPaidAmountScenario[] = [
  {
    ruleId: "IBR-058-OM",
    title:
      "Excel upload · Covoro | IBR-058-OM | Paid amount + prepayment ref/UUID → accepted",
    paidAmount: "100",
    prepaymentInvoiceNumber: "PREPAY-001",
    prepaymentInvoiceUuid: PRECEDING_INVOICE_UUID_SAMPLE,
    shouldError: false,
    expectedErrorField: "Prepayment invoice number",
  },
  {
    ruleId: "IBR-058-OM",
    title:
      "Excel upload · Covoro | IBR-058-OM | Paid amount + empty prepayment ref → error file",
    paidAmount: "100",
    prepaymentInvoiceNumber: "",
    prepaymentInvoiceUuid: "",
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
      "Excel upload · Covoro | IBR-080-OM | HS classification 12 digits → accepted",
    itemClassificationIdentifier: OMAN_HS_CODE_12,
    shouldError: false,
    expectedErrorField: ITEM_CLASSIFICATION_IDENTIFIER_FIELD,
  },
  {
    ruleId: "IBR-080-OM",
    title:
      "Excel upload · Covoro | IBR-080-OM | HS classification 6 digits → error file",
    itemClassificationIdentifier: "123456",
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
        "Excel upload · Covoro | IBR-081-OM | Full Tax + ISIC → accepted",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      industrialClassificationCode: "Extraction of crude petroleum",
      shouldError: false,
      expectedErrorField: INDUSTRIAL_CLASSIFICATION_CODE_FIELD,
    },
    {
      ruleId: "IBR-081-OM",
      title:
        "Excel upload · Covoro | IBR-081-OM | Full Tax + empty ISIC → error file",
      invoiceTransactionTypeCode: TXN_FULL_TAX_INVOICE,
      industrialClassificationCode: "",
      shouldError: true,
      expectedErrorField: INDUSTRIAL_CLASSIFICATION_CODE_FIELD,
    },
    {
      ruleId: "IBR-081-OM",
      title:
        "Excel upload · Covoro | IBR-081-OM | Simplified + empty ISIC → accepted",
      invoiceTransactionTypeCode: TXN_SIMPLIFIED_TAX_INVOICE,
      industrialClassificationCode: "",
      shouldError: false,
      expectedErrorField: INDUSTRIAL_CLASSIFICATION_CODE_FIELD,
    },
  ];

// ---------------------------------------------------------------------------
// ibrCl05 doc allowance exemption (IBR-CL-05-OM)
// ---------------------------------------------------------------------------
export const IBR_CL_05_DOC_ALLOWANCE_SCENARIOS: DocAllowanceExemptionClScenario[] =
  [
    {
      ruleId: "IBR-CL-05-OM",
      title:
        "Excel upload · Covoro | IBR-CL-05-OM | Allowance Exempt + exemption reason → accepted",
      vatCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      exemptionReason: TAX_EXEMPTION_REASON_SAMPLE,
      amount: "10",
      shouldError: false,
      expectedErrorField: TAX_EXEMPTION_REASON_ALLOWANCES_FIELD,
    },
    {
      ruleId: "IBR-CL-05-OM",
      title:
        "Excel upload · Covoro | IBR-CL-05-OM | Allowance Exempt + empty exemption → error file",
      vatCategory: EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
      exemptionReason: "",
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
      "Excel upload · Covoro | IBR-160-OM | RCM + seller not OM → accepted",
    invoiceTransactionTypeCode: TXN_IMPORT_OF_SERVICES_RCM,
    sellerCountryCode: UAE_COUNTRY_CODE,
    shouldError: false,
    expectedErrorField: SELLER_COUNTRY_CODE_FIELD,
  },
  {
    ruleId: "IBR-160-OM",
    title:
      "Excel upload · Covoro | IBR-160-OM | RCM + seller OM → error file",
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
        "Excel upload · Covoro | IBR-175-OM | Profit Margin + preceding ref/UUID → accepted",
      precedingInvoiceReference: "INV-PREV-175",
      precedingInvoiceUuid: PRECEDING_INVOICE_UUID_SAMPLE,
      shouldError: false,
      expectedErrorField: PRECEDING_INVOICE_REFERENCE_FIELD,
    },
    {
      ruleId: "IBR-175-OM",
      title:
        "Excel upload · Covoro | IBR-175-OM | Profit Margin + empty preceding → error file",
      precedingInvoiceReference: "",
      precedingInvoiceUuid: "",
      shouldError: true,
      expectedErrorField: PRECEDING_INVOICE_REFERENCE_FIELD,
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
        "Excel upload · Covoro | IBR-152-OM | Special Zone + Special Zone License buyer → accepted",
      invoiceTransactionTypeCode: TXN_SPECIAL_ZONE_SUPPLIES,
      buyerIdentifierScheme: SPECIAL_ZONE_LICENSE_SCHEME,
      buyerIdentifier: "SZ-BUYER-001",
      shouldError: false,
      expectedErrorField: "Buyer identifier",
    },
    {
      ruleId: "IBR-152-OM",
      title:
        "Excel upload · Covoro | IBR-152-OM | Special Zone + empty buyer identifier → error file",
      invoiceTransactionTypeCode: TXN_SPECIAL_ZONE_SUPPLIES,
      buyerIdentifierScheme: SPECIAL_ZONE_LICENSE_SCHEME,
      buyerIdentifier: "",
      shouldError: true,
      expectedErrorField: "Buyer identifier",
    },
    {
      ruleId: "IBR-153-OM",
      title:
        "Excel upload · Covoro | IBR-153-OM | Import of Goods + Importer Customs ID → accepted",
      invoiceTransactionTypeCode: TXN_IMPORT_OF_GOODS,
      buyerIdentifierScheme: "Importer Customs ID",
      buyerIdentifier: "IMP-CUST-001",
      shouldError: false,
      expectedErrorField: "Buyer identifier",
    },
    {
      ruleId: "IBR-153-OM",
      title:
        "Excel upload · Covoro | IBR-153-OM | Import of Goods + empty buyer identifier → error file",
      invoiceTransactionTypeCode: TXN_IMPORT_OF_GOODS,
      buyerIdentifierScheme: "Importer Customs ID",
      buyerIdentifier: "",
      shouldError: true,
      expectedErrorField: "Buyer identifier",
    },
  ];

