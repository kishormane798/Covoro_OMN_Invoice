/**
 * Oman conditional validation row builders for
 * `tests/ConditionalValidation_CovoroTemplate_Test.spec.ts`.
 * No UAE / BTUAE scenario builders.
 */
import * as FV from "../testData/FieldValidations";
import {
  buyerSellerIdentifierCodeValidTestData,
  industrialClassificationIsicValidTestData,
  omanCountrySubdivisionValidTestData,
  paymentMeansTypeValidTestData,
  unitOfMeasurementValidTestData,
} from "../testData/FieldValidations/Master";

function masterLabel(
  list: readonly { label: string }[] | undefined,
  fallback: string
): string {
  const label = list?.[0]?.label?.trim();
  return label || fallback;
}

function masterLabelIncluding(
  list: readonly { label: string }[] | undefined,
  match: string,
  fallback: string
): string {
  const hit = list?.find((x) =>
    x.label.toLowerCase().includes(match.toLowerCase())
  );
  return hit?.label?.trim() || masterLabel(list, fallback);
}

/**
 * Baseline accepted Oman Full Tax Invoice row.
 * Fills `fieldValidationMandatory`, Master dropdown labels, and Full Tax / OMR /
 * Standard-rate / Goods conditional rules (clears CN/import/exemption/charge fields).
 */
export function buildValidOmanFullTaxInvoiceRow(): Record<string, string> {
  // Oman portal: EAS 0248 / Oman VATIN scheme + OM-prefixed seller/buyer electronic + VATIN.
  const electronicScheme =
    "Oman Value Added Tax Identification Number (VATIN)";
  const uom = masterLabelIncluding(
    unitOfMeasurementValidTestData,
    "each",
    masterLabel(unitOfMeasurementValidTestData, "each")
  );
  const paymentMeans = masterLabel(
    paymentMeansTypeValidTestData,
    "Instrument not defined"
  );
  const isic = masterLabel(
    industrialClassificationIsicValidTestData,
    "Extraction of crude petroleum"
  );

  // Electronic address + VATIN: OM-prefixed values (12 chars; fieldValidationMandatory / conditional).
  const sellerElectronic = "OM1108202600";
  const buyerElectronic = "OM1000091919";
  const sellerVat = "OM1108202600";
  const buyerVat = "OM1000091919";

  return {
    // Document — Master + conditional (Full Tax / Commercial / OMR / no FX)
    "Invoice Transaction Type Code": FV.TXN_FULL_TAX_INVOICE,
    "Invoice Type Code": FV.INVOICE_TYPE_COMMERCIAL_INVOICE,
    "Invoice Number": "OMN-VALID-001",
    "Purchase Order Number": "PO-OMN-001",
    "Incoterms": "",
    "Import date": "",
    "Customs Declaration number": "",
    "Invoice Currency Code": FV.OMAN_CURRENCY_OMR,
    "Source currency code": FV.OMAN_CURRENCY_OMR,
    "Currency Exchange Rate": "",
    "Credit note or Debit Note reason code": "",
    "Preceding Invoice reference": "",
    "Unique Identifier Number": "",
    "Preceding Invoice issue date": "",

    // Seller — mandatory lengths + IBR-006 VAT + IBR-010 address + Oman country.
    // Party identifier / scheme: empty on Full Tax; filled only for IBR-007-OM txn types
    // via applyPartyIdentifiersByTxnType.
    "Seller name": "Covoro Oman Trading LLC",
    "Seller identifier - Scheme identifier": "",
    "Seller Identifier (textual code)": "",
    "Seller identifier": "",
    "Seller VAT Identifier (TRN / TIN)": sellerVat,
    "Seller electronic address Scheme": electronicScheme,
    "Seller electronic address": sellerElectronic,
    "Seller address line 1": "Building 12, Al Khuwair",
    "Seller address line 2": "Way 1234",
    "Seller address line 3": "Block 234",
    "Seller city": "Muscat",
    "Seller post code": "133",
    // Empty unless Special Zone Supplies (IBR-150-OM); filled by applySpecialZoneCountrySubdivisions.
    "Seller country subdivision code": "",
    "Seller country code": FV.OMAN_COUNTRY_CODE,

    // Third party — empty (not Third-party Invoice)
    "Third Party Name": "",
    "Third Party VATIN": "",
    "Third Party Address Line 1": "",
    "Third Party Address Line 2": "",
    "Third Party Address Line 3": "",
    "Third Party City": "",
    "Third Party Postal Code - PO Box Number": "",
    "Third Party Country Code": "",

    // Buyer — mandatory + IBR-016 VAT present for Full Tax.
    // Party identifier / scheme: empty unless IBR-152/153 txn types (see applyPartyIdentifiersByTxnType).
    "Buyer name": "Oman Buyer Trading Co",
    "Scheme identifier": "",
    "Buyer Identifier (textual code)": "",
    "Buyer identifier": "",
    "Buyer VAT identifier": buyerVat,
    "Buyer electronic address Scheme": electronicScheme,
    "Buyer electronic address": buyerElectronic,
    "Buyer address line 1": "Shop 5, Ruwi High Street",
    "Buyer address line 2": "Near Clock Tower",
    "Buyer address line 3": "Ruwi",
    "Buyer city": "Muscat",
    "Buyer post code": "112",
    // Empty unless Special Zone Supplies (IBR-150-OM); filled by applySpecialZoneCountrySubdivisions.
    "Buyer country subdivision code": "",
    "Buyer country code": FV.OMAN_COUNTRY_CODE,

    // Delivery — optional for Full Tax commercial (leave empty)
    "Deliver to party name": "",
    "Deliver to address line 1": "",
    "Deliver to address line 2": "",
    "Deliver to address line 3": "",
    "Deliver to city": "",
    "Deliver to post code": "",
    "Deliver to country sub-division": "",
    "Deliver to country code": "",

    // Item — mandatory + IBR-078/079 Goods + HS-12
    "Invoice line identifier": "LINE-001",
    "Item name": "Office Laptop",
    "Item description": "Business laptop for Oman supply",
    "Item Type": FV.ITEM_TYPE_GOODS,
    "Item classification identifier": FV.OMAN_HS_CODE_12,
    "Industrial Classification Code": isic,
    "Service Type Code": "",
    "Profit margin item type code": "",
    "Item price base quantity": "1",
    "Item gross price": "1000",
    "Item price discount": "0",
    "Item net price": "1000",
    "Invoiced quantity": "1",
    "Invoiced quantity unit of measure code": uom,
    "Invoice line charge amount": "",
    "Invoice line allowance amount": "",
    "Invoice line net amount": "1000",
    "Tax Category": FV.STANDARD_TAX_CATEGORY_CODE,
    "Tax Rate": FV.TAX_RATE_STANDARD_OMAN,
    "Tax exemption reason text": "",
    "Tax exemption reason code": "",
    "Line item VAT amount": "50",
    "Total amount including VAT": "1050",
    "Item country of origin": "",
    "Item attribute name": "",
    "Item attribute value": "",
    "custom 1": "",
    "custom 2": "",

    // Document charges/allowances — empty (no IBR charge/exemption rules)
    "Charges on document level": "",
    "Vat category - charges": "",
    "Tax exemption reason - charges": "",
    "Allowances on document level": "",
    "Vat category - allowances": "",
    "Tax exemption reason - allowances": "",

    // Totals — writer recalculates; seed provides coherent values
    "Sum of Invoice line net amount": "1000",
    "Invoice total amount without tax": "1000",
    "Invoice total tax amount": "50",
    "Invoice total amount with tax": "1050",
    "Invoice total tax amount in tax accounting currency": "",
    "Paid amount": "",
    "Rounding amount": "",
    "Amount due for payment": "1050",
    "Total amount due (profit margin)": "",

    // Prepayment / supporting / period — empty (not Prepayment/Summary)
    "Prepayment invoice number": "",
    "Prepayment invoice UUID": "",
    "Supporting document reference": "",
    "Supporting document UUID": "",
    "Invoicing period start date": "",
    "Invoicing period end date": "",

    // Payment — Master payment means
    "Payment means type code": paymentMeans,
    "Scheme Identifier": "",
    "Payment account identifier": "",
    "Payment due date": "2026-12-31",
    "Payment card primary account number": "",
    "Payment account name": "",
    "Custom 1": "",
    "Custom 2": "",
    "Custom 3": "",
    "Custom 4": "",
    "Custom 5": "",
  };
}

function getSeedInvoiceRow(): Record<string, string> {
  return buildValidOmanFullTaxInvoiceRow();
}

/**
 * IBR-150-OM: Special Zone Supplies requires seller + buyer country subdivision (CL-13-OM).
 * Uses a free-zone label (not Mainland) so IBR-151/152 Special Zone License rules still apply.
 */
function applySpecialZoneCountrySubdivisions(
  row: Record<string, string | null>
): Record<string, string | null> {
  const subdivision = masterLabelIncluding(
    omanCountrySubdivisionValidTestData,
    "Sohar",
    "Sohar Free Zone."
  );
  return {
    ...row,
    "Seller country subdivision code": subdivision,
    "Buyer country subdivision code": subdivision,
  };
}

/** IBR-007-OM seller scheme/identifier txn types. */
const IBR_007_SELLER_IDENTIFIER_TXN_TYPES = new Set<string>([
  FV.TXN_IMPORT_OF_GOODS,
  FV.TXN_IMPORT_OF_SERVICES_RCM,
  FV.TXN_PROFIT_MARGIN_SELF_INVOICE,
  FV.TXN_SPECIAL_ZONE_SUPPLIES,
]);

const IMPORTER_CUSTOMS_ID_SCHEME = "Importer Customs ID";

/**
 * Fill or clear seller/buyer party identifiers from Invoice transaction type.
 * - Seller (IBR-007-OM): Import of Goods / Import of Services (RCM) /
 *   Profit Margin Self-Invoice / Special Zone Supplies
 * - Buyer (IBR-152/153-OM): Special Zone → Special Zone License Number;
 *   Import of Goods → Importer Customs ID
 * Scenario builders may overwrite these afterward (including empty for error cases).
 */
export function applyPartyIdentifiersByTxnType(
  row: Record<string, string | null>
): Record<string, string | null> {
  const txn = String(row[FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD] ?? "").trim();
  const next: Record<string, string | null> = { ...row };
  const defaultScheme = masterLabelIncluding(
    buyerSellerIdentifierCodeValidTestData,
    "Tax Identification",
    "Tax Identification Number"
  );

  if (IBR_007_SELLER_IDENTIFIER_TXN_TYPES.has(txn)) {
    if (txn === FV.TXN_SPECIAL_ZONE_SUPPLIES) {
      next[FV.SELLER_IDENTIFIER_SCHEME_FIELD] = FV.SPECIAL_ZONE_LICENSE_SCHEME;
      next[FV.SELLER_IDENTIFIER_TEXTUAL_CODE_FIELD] =
        FV.SPECIAL_ZONE_LICENSE_SCHEME;
      next[FV.SELLER_IDENTIFIER_FIELD] = "SZ-SELLER-001";
    } else {
      next[FV.SELLER_IDENTIFIER_SCHEME_FIELD] = defaultScheme;
      next[FV.SELLER_IDENTIFIER_TEXTUAL_CODE_FIELD] = defaultScheme;
      next[FV.SELLER_IDENTIFIER_FIELD] = "OM-SELLER-001";
    }
  } else {
    next[FV.SELLER_IDENTIFIER_SCHEME_FIELD] = "";
    next[FV.SELLER_IDENTIFIER_TEXTUAL_CODE_FIELD] = "";
    next[FV.SELLER_IDENTIFIER_FIELD] = "";
  }

  if (txn === FV.TXN_SPECIAL_ZONE_SUPPLIES) {
    next["Scheme identifier"] = FV.SPECIAL_ZONE_LICENSE_SCHEME;
    next["Buyer Identifier (textual code)"] = FV.SPECIAL_ZONE_LICENSE_SCHEME;
    next["Buyer identifier"] = "SZ-BUYER-001";
  } else if (txn === FV.TXN_IMPORT_OF_GOODS) {
    next["Scheme identifier"] = IMPORTER_CUSTOMS_ID_SCHEME;
    next["Buyer Identifier (textual code)"] = IMPORTER_CUSTOMS_ID_SCHEME;
    next["Buyer identifier"] = "IMP-CUST-001";
  } else {
    next["Scheme identifier"] = "";
    next["Buyer Identifier (textual code)"] = "";
    next["Buyer identifier"] = "";
  }

  return next;
}

function resolveTaxRate(raw: string | null | undefined): string | null {
  if (raw === null || raw === undefined) {
    return null;
  }
  const token = raw.trim().toUpperCase();
  if (token === FV.INVOICED_ITEM_TAX_RATE_NULL_TOKEN.toUpperCase()) {
    return null;
  }
  return raw;
}

/** Phase 1: line tax category + rate (ALIGNED-IBRP-*-05-OM). */
export function buildVatCategoryTaxRateScenarioRow(
  scenario: FV.VatCategoryTaxRateScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  let exemption = "";
  if (scenario.taxCategory === FV.EXEMPT_FROM_TAX_TAX_CATEGORY_CODE) {
    exemption = FV.TAX_EXEMPTION_REASON_SAMPLE;
  } else if (scenario.taxCategory === FV.ZERO_RATED_TAX_CATEGORY_CODE) {
    exemption = FV.TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE;
  }
  return {
    ...seed,
    [FV.TAX_CATEGORY_FIELD]: scenario.taxCategory,
    [FV.INVOICED_ITEM_TAX_RATE_FIELD]: resolveTaxRate(scenario.taxRate),
    [FV.TAX_EXEMPTION_REASON_CODE_FIELD]: exemption,
  };
}

/** Phase 1: exemption reason vs VAT category (IBR-069/070, S-10). */
export function buildVatExemptionReasonScenarioRow(
  scenario: FV.VatExemptionReasonScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  let rate: string | null = resolveTaxRate(scenario.taxRate ?? null);
  if (rate === null) {
    if (scenario.taxCategory === FV.STANDARD_TAX_CATEGORY_CODE) {
      rate = FV.TAX_RATE_STANDARD_OMAN;
    } else if (scenario.taxCategory === FV.ZERO_RATED_TAX_CATEGORY_CODE) {
      rate = FV.TAX_RATE_ZERO;
    }
  }
  return {
    ...seed,
    [FV.TAX_CATEGORY_FIELD]: scenario.taxCategory,
    [FV.INVOICED_ITEM_TAX_RATE_FIELD]: rate,
    [FV.TAX_EXEMPTION_REASON_CODE_FIELD]: scenario.taxExemptionReasonCode,
    [FV.TAX_EXEMPTION_REASON_TEXT_FIELD]: scenario.taxExemptionReasonCode
      ? scenario.taxExemptionReasonCode
      : "",
  };
}

/** Re-export scenario type list (owned by ConditionalValidation.ts). */
export const CN_DN_SELF_BILLED_INVOICE_TYPES = FV.CN_DN_SELF_BILLED_INVOICE_TYPES;

/**
 * Apply Invoice Type Code (+ Self-billed txn for type 261) onto a submit row.
 * Keeps CN/DN on Full Tax; Self billed credit note uses Self-billed Invoice txn (IBR-177).
 */
export function applyCnDnSelfBilledInvoiceType(
  row: Record<string, string | null>,
  invoiceTypeCode: string
): Record<string, string | null> {
  const next: Record<string, string | null> = {
    ...row,
    [FV.INVOICE_TYPE_CODE_FIELD]: invoiceTypeCode,
  };
  if (invoiceTypeCode === FV.INVOICE_TYPE_SELF_BILLED_CREDIT_NOTE) {
    next[FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD] = FV.TXN_SELF_BILLED_INVOICE;
  } else if (
    invoiceTypeCode === FV.INVOICE_TYPE_CREDIT_NOTE ||
    invoiceTypeCode === FV.INVOICE_TYPE_DEBIT_NOTE
  ) {
    next[FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD] = FV.TXN_FULL_TAX_INVOICE;
  }
  return applyPartyIdentifiersByTxnType(next);
}

/**
 * Expand one overlaid/mutated base row into CN + DN + Self billed credit note rows
 * (same polarity / mutation; distinct invoice types for multi-invoice packs).
 */
export function expandRowToCnDnSelfBilledTypes(
  baseRow: Record<string, string | null>
): Array<Record<string, string | null>> {
  return FV.CN_DN_SELF_BILLED_INVOICE_TYPES.map((invoiceTypeCode) =>
    applyCnDnSelfBilledInvoiceType(baseRow, invoiceTypeCode)
  );
}

/**
 * Apply Invoice Type Code for IBR-177 (261 / 389) without overwriting txn —
 * pack/live mutation owns BTOM-001. Ensures CN companions for 261; clears them for 389.
 */
export function applySelfBilledDocumentInvoiceType(
  row: Record<string, string | null>,
  invoiceTypeCode: string
): Record<string, string | null> {
  const next: Record<string, string | null> = {
    ...row,
    [FV.INVOICE_TYPE_CODE_FIELD]: invoiceTypeCode,
  };
  if (invoiceTypeCode === FV.INVOICE_TYPE_SELF_BILLED_CREDIT_NOTE) {
    if (!String(next[FV.PRECEDING_INVOICE_REFERENCE_FIELD] ?? "").trim()) {
      next[FV.PRECEDING_INVOICE_REFERENCE_FIELD] = "PREV-OMN-177";
    }
    if (!String(next[FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD] ?? "").trim()) {
      next[FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD] = "2026-01-15";
    }
    if (!String(next[FV.PRECEDING_INVOICE_UUID_FIELD] ?? "").trim()) {
      next[FV.PRECEDING_INVOICE_UUID_FIELD] = FV.PRECEDING_INVOICE_UUID_SAMPLE;
    }
    if (!String(next[FV.CREDIT_DEBIT_NOTE_REASON_CODE_FIELD] ?? "").trim()) {
      next[FV.CREDIT_DEBIT_NOTE_REASON_CODE_FIELD] =
        FV.CREDIT_DEBIT_REASON_SAMPLE;
    }
  } else if (invoiceTypeCode === FV.INVOICE_TYPE_SELF_BILLED_INVOICE) {
    next[FV.CREDIT_DEBIT_NOTE_REASON_CODE_FIELD] = "";
    next[FV.PRECEDING_INVOICE_REFERENCE_FIELD] = "";
    next[FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD] = "";
    next[FV.PRECEDING_INVOICE_UUID_FIELD] = "";
  }
  return next;
}

/** Expand one overlaid/mutated base row into Self billed CN (261) + Self-billed invoice (389). */
export function expandRowToSelfBilledDocumentTypes(
  baseRow: Record<string, string | null>
): Array<Record<string, string | null>> {
  return FV.SELF_BILLED_DOCUMENT_INVOICE_TYPES.map((invoiceTypeCode) =>
    applySelfBilledDocumentInvoiceType(baseRow, invoiceTypeCode)
  );
}

/** Expand a pack row across MULTI_VALUE_PACK_EXPAND dimension values. */
export function expandRowByMultiValueSpec(
  baseRow: Record<string, string | null>,
  spec: FV.MultiValuePackExpandSpec,
  opts?: { applyConflictBits?: boolean }
): Array<Record<string, string | null>> {
  const applyConflict = Boolean(opts?.applyConflictBits && spec.conflictBit);
  return spec.values.map((value) => {
    if (spec.dimension === "invoiceType") {
      const isSelfBilledDocOnly =
        spec.values.length === FV.SELF_BILLED_DOCUMENT_INVOICE_TYPES.length &&
        spec.values.every((v) =>
          (FV.SELF_BILLED_DOCUMENT_INVOICE_TYPES as readonly string[]).includes(v)
        );
      if (isSelfBilledDocOnly) {
        return applySelfBilledDocumentInvoiceType(baseRow, value);
      }
      return applyCnDnSelfBilledInvoiceType(baseRow, value);
    }
    if (spec.dimension === "taxCategory") {
      const next: Record<string, string | null> = {
        ...baseRow,
        [FV.TAX_CATEGORY_FIELD]: value,
        "Vat category - allowances": value,
        "Vat category - charges": value,
      };
      if (value === FV.ZERO_RATED_TAX_CATEGORY_CODE) {
        next[FV.INVOICED_ITEM_TAX_RATE_FIELD] = "0";
      } else if (value === FV.EXEMPT_FROM_TAX_TAX_CATEGORY_CODE) {
        next[FV.INVOICED_ITEM_TAX_RATE_FIELD] = "";
      }
      return next;
    }
    // txnType
    let txnValue = value;
    if (applyConflict && spec.valueBits?.[value] && spec.conflictBit) {
      txnValue = FV.combineOmanTxnTypeBits(
        spec.valueBits[value]!,
        spec.conflictBit
      );
    }
    const next: Record<string, string | null> = {
      ...baseRow,
      [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: txnValue,
    };
    if (
      value === FV.TXN_SUMMARY_INVOICE ||
      value === FV.TXN_CONTINUOUS_SUPPLY
    ) {
      next["Invoicing period start date"] =
        next["Invoicing period start date"] || "2026-01-01";
      next["Invoicing period end date"] =
        next["Invoicing period end date"] || "2026-01-31";
    }
    if (value === FV.TXN_IMPORT_OF_GOODS) {
      next["Import date"] = next["Import date"] || "2026-01-10";
      next["Customs Declaration number"] =
        next["Customs Declaration number"] || "CD-COND-001";
      next["Incoterms"] = next["Incoterms"] || "Free On Board";
    }
    if (
      value === FV.TXN_PROFIT_MARGIN_SELF_INVOICE ||
      value === FV.TXN_PROFIT_MARGIN_INVOICE
    ) {
      next[FV.TAX_CATEGORY_FIELD] =
        next[FV.TAX_CATEGORY_FIELD] || FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE;
      next[FV.INVOICED_ITEM_TAX_RATE_FIELD] = "";
    }
    if (value === FV.TXN_SPECIAL_ZONE_SUPPLIES) {
      return applyPartyIdentifiersByTxnType(
        applySpecialZoneCountrySubdivisions(next)
      );
    }
    return applyPartyIdentifiersByTxnType(next);
  });
}

/** Phase 2: preceding invoice for CN/DN (ALIGNED-IBRP-028 / IBR-032). */
export function buildPrecedingInvoiceScenarioRow(
  scenario: FV.PrecedingInvoiceScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  return applyCnDnSelfBilledInvoiceType(
    {
      ...seed,
      [FV.PRECEDING_INVOICE_REFERENCE_FIELD]: scenario.precedingInvoiceReference,
      [FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD]: scenario.precedingInvoiceIssueDate,
      [FV.PRECEDING_INVOICE_UUID_FIELD]: scenario.precedingInvoiceUuid ?? "",
      [FV.CREDIT_DEBIT_NOTE_REASON_CODE_FIELD]:
        scenario.creditDebitNoteReasonCode,
    },
    scenario.invoiceTypeCode
  );
}

/** Phase 3: currency vs exchange rate (IBR-004 / IBR-034 / IBR-172 / IBR-005 / IBR-DEC-03 FX). */
export function buildExchangeRateScenarioRow(
  scenario: FV.ExchangeRateScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const source =
    scenario.sourceCurrencyCode ?? scenario.invoiceCurrencyCode;
  const taxInAccounting =
    scenario.taxAmountInAccountingCurrency !== undefined
      ? scenario.taxAmountInAccountingCurrency
      : scenario.invoiceCurrencyCode !== FV.OMAN_CURRENCY_OMR
        ? "50"
        : "";
  return {
    ...seed,
    [FV.INVOICE_CURRENCY_CODE_FIELD]: scenario.invoiceCurrencyCode,
    [FV.SOURCE_CURRENCY_CODE_FIELD]: source,
    [FV.EXCHANGE_RATE_FIELD]: scenario.exchangeRate,
    [FV.TAX_AMOUNT_IN_ACCOUNTING_CURRENCY_FIELD]: taxInAccounting,
  };
}

/** IBR-DEC-03-OM: amount decimal precision via Item Gross Price. */
export function buildAmountDecimalPrecisionScenarioRow(
  scenario: FV.AmountDecimalPrecisionScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  return {
    ...seed,
    "Item Gross Price": scenario.itemGrossPrice,
    "Item Price Discount": "0",
  };
}

/** Phase 4: Item Type required (IBR-078-OM). */
export function buildItemTypeRequiredScenarioRow(
  scenario: FV.ItemTypeRequiredScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  return applyPartyIdentifiersByTxnType({
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]:
      scenario.invoiceTransactionTypeCode,
    [FV.ITEM_TYPE_FIELD]: scenario.itemType,
    [FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD]:
      scenario.itemType === FV.ITEM_TYPE_GOODS ? FV.OMAN_HS_CODE_12 : "",
  });
}

/** Phase 4: Goods → classification (IBR-079-OM). */
export function buildGoodsClassificationScenarioRow(
  scenario: FV.GoodsClassificationScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  return applyPartyIdentifiersByTxnType({
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]:
      scenario.invoiceTransactionTypeCode,
    [FV.ITEM_TYPE_FIELD]: scenario.itemType,
    [FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD]:
      scenario.itemClassificationIdentifier,
  });
}

/** Phase 4: Import of Goods (IBR-084/085-OM). */
export function buildImportOfGoodsScenarioRow(
  scenario: FV.ImportOfGoodsScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  return applyPartyIdentifiersByTxnType({
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: FV.TXN_IMPORT_OF_GOODS,
    [FV.ITEM_TYPE_FIELD]: FV.ITEM_TYPE_GOODS,
    [FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD]: FV.OMAN_HS_CODE_12,
    [FV.ITEM_COUNTRY_OF_ORIGIN_FIELD]: scenario.itemCountryOfOrigin,
    [FV.IMPORT_DATE_FIELD]: scenario.importDate,
    [FV.CUSTOMS_DECLARATION_NUMBER_FIELD]: scenario.customsDeclarationNumber,
    [FV.INCOTERMS_FIELD]: scenario.incoterms,
  });
}

/** Phase 4: Profit Margin Self-Invoice (IBR-086/087-OM). */
export function buildProfitMarginSelfInvoiceScenarioRow(
  scenario: FV.ProfitMarginTaxCategoryScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  return applyPartyIdentifiersByTxnType({
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: FV.TXN_PROFIT_MARGIN_SELF_INVOICE,
    [FV.TAX_CATEGORY_FIELD]: scenario.taxCategory,
    [FV.INVOICED_ITEM_TAX_RATE_FIELD]:
      scenario.taxCategory === FV.STANDARD_TAX_CATEGORY_CODE
        ? FV.TAX_RATE_STANDARD_OMAN
        : null,
    [FV.TAX_EXEMPTION_REASON_CODE_FIELD]:
      scenario.taxCategory === FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE
        ? ""
        : scenario.taxCategory === FV.EXEMPT_FROM_TAX_TAX_CATEGORY_CODE
          ? FV.TAX_EXEMPTION_REASON_SAMPLE
          : scenario.taxCategory === FV.ZERO_RATED_TAX_CATEGORY_CODE
            ? FV.TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE
            : "",
    [FV.SELLER_COUNTRY_CODE_FIELD]: scenario.sellerCountryCode,
  });
}

/** Phase 4: Summary Invoice period (IBR-037-OM). */
export function buildSummaryInvoicePeriodScenarioRow(
  scenario: FV.SummaryPeriodScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  return applyPartyIdentifiersByTxnType({
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]:
      scenario.invoiceTransactionTypeCode,
    [FV.INVOICING_PERIOD_START_DATE_FIELD]: scenario.periodStart,
    [FV.INVOICING_PERIOD_END_DATE_FIELD]: scenario.periodEnd,
  });
}

/** Phase 5: document allowance/charge VAT + exemption (IBR-062/064-OM). */
export function buildDocumentAllowanceChargeVatScenarioRow(
  scenario: FV.DocumentAllowanceChargeVatScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const row: Record<string, string | null> = {
    ...seed,
    [FV.TAX_CATEGORY_FIELD]: scenario.vatCategory,
    [FV.INVOICED_ITEM_TAX_RATE_FIELD]:
      scenario.vatCategory === FV.ZERO_RATED_TAX_CATEGORY_CODE
        ? FV.TAX_RATE_ZERO
        : scenario.vatCategory === FV.STANDARD_TAX_CATEGORY_CODE
          ? FV.TAX_RATE_STANDARD_OMAN
          : null,
    [FV.TAX_EXEMPTION_REASON_CODE_FIELD]:
      scenario.vatCategory === FV.ZERO_RATED_TAX_CATEGORY_CODE
        ? FV.TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE
        : scenario.vatCategory === FV.EXEMPT_FROM_TAX_TAX_CATEGORY_CODE
          ? FV.TAX_EXEMPTION_REASON_SAMPLE
          : "",
  };
  if (scenario.kind === "allowance") {
    row[FV.ALLOWANCES_ON_DOCUMENT_LEVEL_FIELD] = scenario.amount;
    row[FV.VAT_CATEGORY_ALLOWANCES_FIELD] = scenario.vatCategory;
    row[FV.TAX_EXEMPTION_REASON_ALLOWANCES_FIELD] = scenario.exemptionReason;
  } else {
    row[FV.CHARGES_ON_DOCUMENT_LEVEL_FIELD] = scenario.amount;
    row[FV.VAT_CATEGORY_CHARGES_FIELD] = scenario.vatCategory;
    row[FV.TAX_EXEMPTION_REASON_CHARGES_FIELD] = scenario.exemptionReason;
  }
  return row;
}

/** Phase 6: credit/debit note reason (IBR-023-OM). */
export function buildCreditDebitReasonScenarioRow(
  scenario: FV.CreditDebitReasonScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const hasPreceding = Boolean(scenario.precedingInvoiceReference);
  return applyCnDnSelfBilledInvoiceType(
    {
      ...seed,
      [FV.CREDIT_DEBIT_NOTE_REASON_CODE_FIELD]:
        scenario.creditDebitNoteReasonCode,
      [FV.PRECEDING_INVOICE_REFERENCE_FIELD]: scenario.precedingInvoiceReference,
      [FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD]: hasPreceding ? "2026-01-15" : "",
      [FV.PRECEDING_INVOICE_UUID_FIELD]: hasPreceding
        ? FV.PRECEDING_INVOICE_UUID_SAMPLE
        : "",
    },
    scenario.invoiceTypeCode
  );
}

/** Export delivery country (IBR-014-OM). */
export function buildExportDeliveryScenarioRow(
  scenario: FV.ExportDeliveryScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  return applyPartyIdentifiersByTxnType({
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]:
      scenario.invoiceTransactionTypeCode,
    [FV.TAX_CATEGORY_FIELD]: FV.ZERO_RATED_TAX_CATEGORY_CODE,
    [FV.INVOICED_ITEM_TAX_RATE_FIELD]: FV.TAX_RATE_ZERO,
    [FV.TAX_EXEMPTION_REASON_CODE_FIELD]:
      FV.TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
    [FV.DELIVER_TO_COUNTRY_CODE_FIELD]: scenario.deliverToCountryCode,
  });
}

/**
 * Shared Export + Export of Services (IBT-121) trigger overlay for IBR-012/013/155.
 * Sets Zero-rated line, Services item, non-OM deliver + supporting docs so sibling
 * export rules do not mask the field under test.
 */
function applyExportOfServicesTrigger(
  row: Record<string, string | null>,
  opts: {
    invoiceTransactionTypeCode: string;
    taxExemptionReasonCode: string;
    deliverToCountryCode?: string;
    serviceTypeCode?: string;
    supportingDocumentReference?: string;
    supportingDocumentUuid?: string;
  }
): Record<string, string | null> {
  const isExportTrigger =
    opts.invoiceTransactionTypeCode === FV.TXN_EXPORT_INVOICE &&
    Boolean(opts.taxExemptionReasonCode);

  if (!isExportTrigger) {
    return applyPartyIdentifiersByTxnType({
      ...row,
      [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]:
        opts.invoiceTransactionTypeCode,
      [FV.TAX_EXEMPTION_REASON_CODE_FIELD]: opts.taxExemptionReasonCode,
      ...(opts.serviceTypeCode !== undefined
        ? { [FV.SERVICE_TYPE_CODE_FIELD]: opts.serviceTypeCode }
        : {}),
      ...(opts.deliverToCountryCode !== undefined
        ? { [FV.DELIVER_TO_COUNTRY_CODE_FIELD]: opts.deliverToCountryCode }
        : {}),
      ...(opts.supportingDocumentReference !== undefined
        ? {
            [FV.SUPPORTING_DOCUMENT_REFERENCE_FIELD]:
              opts.supportingDocumentReference,
          }
        : {}),
      ...(opts.supportingDocumentUuid !== undefined
        ? {
            [FV.SUPPORTING_DOCUMENT_UUID_FIELD]: opts.supportingDocumentUuid,
          }
        : {}),
    });
  }

  const deliver =
    opts.deliverToCountryCode ?? FV.UAE_COUNTRY_CODE;
  return applyPartyIdentifiersByTxnType({
    ...row,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]:
      opts.invoiceTransactionTypeCode,
    [FV.TAX_CATEGORY_FIELD]: FV.ZERO_RATED_TAX_CATEGORY_CODE,
    [FV.INVOICED_ITEM_TAX_RATE_FIELD]: FV.TAX_RATE_ZERO,
    [FV.TAX_EXEMPTION_REASON_CODE_FIELD]: opts.taxExemptionReasonCode,
    [FV.ITEM_TYPE_FIELD]: FV.ITEM_TYPE_SERVICES,
    [FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD]: "",
    [FV.SERVICE_TYPE_CODE_FIELD]:
      opts.serviceTypeCode ?? FV.SERVICE_TYPE_CODE_SAMPLE,
    [FV.DELIVER_TO_COUNTRY_CODE_FIELD]: deliver,
    "Deliver to party name":
      row["Deliver to party name"] || "Export Consignee",
    "Deliver to address line 1":
      row["Deliver to address line 1"] || "Export Street 1",
    "Deliver to city": row["Deliver to city"] || "Dubai",
    "Deliver to post code": row["Deliver to post code"] || "00000",
    [FV.SUPPORTING_DOCUMENT_REFERENCE_FIELD]:
      opts.supportingDocumentReference ??
      FV.SUPPORTING_DOCUMENT_REFERENCE_SAMPLE,
    [FV.SUPPORTING_DOCUMENT_UUID_FIELD]:
      opts.supportingDocumentUuid ?? FV.SUPPORTING_DOCUMENT_UUID_SAMPLE,
  });
}

/** IBR-155-OM: Export + Export of Services → Service Type mandatory. */
export function buildExportServiceTypeScenarioRow(
  scenario: FV.ExportServiceTypeScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  return applyExportOfServicesTrigger(seed, {
    invoiceTransactionTypeCode: scenario.invoiceTransactionTypeCode,
    taxExemptionReasonCode: scenario.taxExemptionReasonCode,
    serviceTypeCode: scenario.serviceTypeCode,
  });
}

/** IBR-012-OM: Export + Export of Services → Deliver to country must not be OM. */
export function buildExportDeliverCountryForbiddenOmScenarioRow(
  scenario: FV.ExportDeliverCountryForbiddenOmScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  return applyExportOfServicesTrigger(seed, {
    invoiceTransactionTypeCode: scenario.invoiceTransactionTypeCode,
    taxExemptionReasonCode: scenario.taxExemptionReasonCode,
    deliverToCountryCode: scenario.deliverToCountryCode,
  });
}

/** IBR-013-OM: Export + Export of Services → supporting document ref + UUID. */
export function buildExportSupportingDocumentScenarioRow(
  scenario: FV.ExportSupportingDocumentScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  return applyExportOfServicesTrigger(seed, {
    invoiceTransactionTypeCode: scenario.invoiceTransactionTypeCode,
    taxExemptionReasonCode: scenario.taxExemptionReasonCode,
    supportingDocumentReference: scenario.supportingDocumentReference,
    supportingDocumentUuid: scenario.supportingDocumentUuid,
  });
}

/** Special Zone seller identifier (IBR-151-OM). */
export function buildSpecialZoneSellerScenarioRow(
  scenario: FV.SpecialZoneSellerScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const row = applyPartyIdentifiersByTxnType({
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]:
      scenario.invoiceTransactionTypeCode,
  });
  // Scenario values win (including empty seller identifier for error cases).
  row[FV.SELLER_IDENTIFIER_SCHEME_FIELD] = scenario.sellerIdentifierTextualCode;
  row[FV.SELLER_IDENTIFIER_TEXTUAL_CODE_FIELD] =
    scenario.sellerIdentifierTextualCode;
  row[FV.SELLER_IDENTIFIER_FIELD] = scenario.sellerIdentifier;
  return applySpecialZoneCountrySubdivisions(row);
}

/** Self-billed / RCM buyer VATIN (IBR-017-OM). */
export function buildSelfBilledBuyerVatScenarioRow(
  scenario: FV.SelfBilledBuyerVatScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  return applyPartyIdentifiersByTxnType({
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]:
      scenario.invoiceTransactionTypeCode,
    [FV.BUYER_VAT_IDENTIFIER_FIELD]: scenario.buyerVatIdentifier,
  });
}

/** IBR-020-OM: Self-billed / RCM → Buyer country must be OM. */
export function buildSelfBilledRcmBuyerCountryScenarioRow(
  scenario: FV.SelfBilledRcmBuyerCountryScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  return applyPartyIdentifiersByTxnType({
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]:
      scenario.invoiceTransactionTypeCode,
    [FV.BUYER_COUNTRY_CODE_FIELD]: scenario.buyerCountryCode,
  });
}

/** IBR-177-OM: self-billed document types constrain allowed transaction types. */
export function buildSelfBilledTxnConstraintScenarioRow(
  scenario: FV.SelfBilledTxnConstraintScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  return applyPartyIdentifiersByTxnType(
    applySelfBilledDocumentInvoiceType(
      {
        ...seed,
        [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]:
          scenario.invoiceTransactionTypeCode,
      },
      scenario.invoiceTypeCode
    )
  );
}

/**
 * IBR-176-OM: Prepayment ⊕ Summary/Deemed/PM-Self conflict (Peppol bit OR) or
 * Prepayment-alone control. Companions avoid IBR-037 / IBR-086 masking the rule.
 */
export function buildPrepaymentTxnExclusionScenarioRow(
  scenario: FV.PrepaymentTxnExclusionScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const row: Record<string, string | null> = {
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]:
      scenario.invoiceTransactionTypeCode,
  };
  const partner = scenario.conflictingTxnType;
  if (
    partner === FV.TXN_SUMMARY_INVOICE ||
    String(scenario.invoiceTransactionTypeCode).charAt(4) === "1"
  ) {
    row[FV.INVOICING_PERIOD_START_DATE_FIELD] = "2026-01-01";
    row[FV.INVOICING_PERIOD_END_DATE_FIELD] = "2026-01-31";
  }
  if (
    partner === FV.TXN_PROFIT_MARGIN_SELF_INVOICE ||
    String(scenario.invoiceTransactionTypeCode).charAt(10) === "1"
  ) {
    row[FV.TAX_CATEGORY_FIELD] = FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE;
    row[FV.INVOICED_ITEM_TAX_RATE_FIELD] = "";
    row[FV.TAX_EXEMPTION_REASON_CODE_FIELD] = "";
    row[FV.LINE_ITEM_VAT_AMOUNT_FIELD] = "0";
    row[FV.SELLER_COUNTRY_CODE_FIELD] = FV.OMAN_COUNTRY_CODE;
  }
  return applyPartyIdentifiersByTxnType(row);
}

/**
 * Doc allowance/charge category-rate proxies (IBR-047 / IBR-094).
 * Reuses document allowance/charge VAT builder shape.
 */
export function buildDocumentAllowanceChargeRateScenarioRow(
  scenario: FV.DocumentAllowanceChargeRateScenario
): Record<string, string | null> {
  return buildDocumentAllowanceChargeVatScenarioRow(scenario);
}

/**
 * IBR-003-OM: Seller / Buyer / Third Party VATIN pattern OM + 10 digits.
 * Third-party cases activate Third-party Invoice + mandatory TP address fields.
 * Seller negatives rely on `patchSellerVatFromRow` after generate (worker identity).
 */
export function buildVatinPatternScenarioRow(
  scenario: FV.VatinPatternScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const row: Record<string, string | null> = { ...seed };

  if (scenario.party === "buyer") {
    row[FV.BUYER_VAT_IDENTIFIER_FIELD] = scenario.vatinValue;
    return row;
  }

  if (scenario.party === "seller") {
    // Valid seller: keep seed / worker identity (already OM##########).
    // Invalid seller: write intended value; spec patches after generate.
    if (scenario.shouldError) {
      row[FV.SELLER_VAT_IDENTIFIER_FIELD] = scenario.vatinValue;
    }
    return row;
  }

  // thirdParty — IBR-015 companions so VATIN pattern is the asserted failure.
  row[FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD] = FV.TXN_THIRD_PARTY_INVOICE;
  row[FV.THIRD_PARTY_NAME_FIELD] = "Oman Third Party LLC";
  row[FV.THIRD_PARTY_VATIN_FIELD] = scenario.vatinValue;
  row[FV.THIRD_PARTY_ADDRESS_LINE_1_FIELD] = "TP Building 1";
  row[FV.THIRD_PARTY_ADDRESS_LINE_2_FIELD] = "TP Street";
  row[FV.THIRD_PARTY_ADDRESS_LINE_3_FIELD] = "TP Area";
  row[FV.THIRD_PARTY_CITY_FIELD] = "Muscat";
  row[FV.THIRD_PARTY_POSTAL_CODE_FIELD] = "100";
  row[FV.THIRD_PARTY_COUNTRY_CODE_FIELD] = FV.OMAN_COUNTRY_CODE;
  return applyPartyIdentifiersByTxnType(row);
}

/** ALIGNED-IBRP-E/O/S/Z-01-OM: VAT breakdown category via line Tax Category proxy. */
export function buildVatBreakdownCategoryPresenceScenarioRow(
  scenario: FV.VatBreakdownCategoryPresenceScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  let exemption = scenario.taxExemptionReasonCode ?? "";
  if (
    exemption === undefined ||
    exemption === null ||
    exemption === ""
  ) {
    if (scenario.taxCategory === FV.EXEMPT_FROM_TAX_TAX_CATEGORY_CODE) {
      exemption = FV.TAX_EXEMPTION_REASON_SAMPLE;
    } else if (scenario.taxCategory === FV.ZERO_RATED_TAX_CATEGORY_CODE) {
      exemption = FV.TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE;
    }
  }
  const row: Record<string, string | null> = {
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]:
      scenario.invoiceTransactionTypeCode,
    [FV.TAX_CATEGORY_FIELD]: scenario.taxCategory,
    [FV.INVOICED_ITEM_TAX_RATE_FIELD]: resolveTaxRate(scenario.taxRate),
    [FV.TAX_EXEMPTION_REASON_CODE_FIELD]: exemption,
  };
  if (scenario.invoiceTransactionTypeCode === FV.TXN_SIMPLIFIED_TAX_INVOICE) {
    row[FV.ITEM_TYPE_FIELD] = "";
    row[FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD] = "";
    row[FV.INDUSTRIAL_CLASSIFICATION_CODE_FIELD] = "";
  }
  if (scenario.invoiceTransactionTypeCode === FV.TXN_IMPORT_OF_GOODS) {
    row[FV.ITEM_COUNTRY_OF_ORIGIN_FIELD] =
      row[FV.ITEM_COUNTRY_OF_ORIGIN_FIELD] || FV.UAE_COUNTRY_CODE;
    row[FV.IMPORT_DATE_FIELD] = row[FV.IMPORT_DATE_FIELD] || "2026-01-10";
    row[FV.CUSTOMS_DECLARATION_NUMBER_FIELD] =
      row[FV.CUSTOMS_DECLARATION_NUMBER_FIELD] || "CD-COND-001";
    row[FV.INCOTERMS_FIELD] = row[FV.INCOTERMS_FIELD] || "Free On Board";
  }
  return applyPartyIdentifiersByTxnType(row);
}

export function buildLineItemVatAmountRequiredScenarioRow(
  scenario: FV.LineItemVatAmountRequiredScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  return applyPartyIdentifiersByTxnType({
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]:
      scenario.invoiceTransactionTypeCode,
    [FV.TAX_CATEGORY_FIELD]: scenario.taxCategory,
    [FV.INVOICED_ITEM_TAX_RATE_FIELD]: resolveTaxRate(scenario.taxRate),
    [FV.LINE_ITEM_VAT_AMOUNT_FIELD]: scenario.lineItemVatAmount,
  });
}

export function buildLineItemVatAmountZeroScenarioRow(
  scenario: FV.LineItemVatAmountZeroScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  return {
    ...seed,
    [FV.TAX_CATEGORY_FIELD]: scenario.taxCategory,
    [FV.INVOICED_ITEM_TAX_RATE_FIELD]: resolveTaxRate(scenario.taxRate),
    [FV.TAX_EXEMPTION_REASON_CODE_FIELD]:
      scenario.taxExemptionReasonCode ?? "",
    [FV.LINE_ITEM_VAT_AMOUNT_FIELD]: scenario.lineItemVatAmount,
  };
}

export function buildTxnMutualExclusionScenarioRow(
  scenario: FV.TxnMutualExclusionScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  return applyPartyIdentifiersByTxnType({
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]:
      scenario.invoiceTransactionTypeCode,
  });
}

export function buildSellerVatMandatoryScenarioRow(
  scenario: FV.SellerVatMandatoryScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const row: Record<string, string | null> = {
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]:
      scenario.invoiceTransactionTypeCode,
    [FV.SELLER_VAT_IDENTIFIER_FIELD]: scenario.sellerVatIdentifier,
  };
  if (scenario.invoiceTransactionTypeCode === FV.TXN_IMPORT_OF_GOODS) {
    row[FV.ITEM_COUNTRY_OF_ORIGIN_FIELD] = FV.UAE_COUNTRY_CODE;
    row[FV.IMPORT_DATE_FIELD] = "2026-01-10";
    row[FV.CUSTOMS_DECLARATION_NUMBER_FIELD] = "CD-COND-001";
    row[FV.INCOTERMS_FIELD] = "Free On Board";
  }
  return applyPartyIdentifiersByTxnType(row);
}

export function buildBuyerIdOrVatinScenarioRow(
  scenario: FV.BuyerIdOrVatinScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const row = applyPartyIdentifiersByTxnType({
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]:
      scenario.invoiceTransactionTypeCode,
    [FV.BUYER_VAT_IDENTIFIER_FIELD]: scenario.buyerVatIdentifier,
  });
  // Scenario buyer identifier wins (may be empty when VATIN-only).
  row["Buyer identifier"] = scenario.buyerIdentifier;
  return row;
}

export function buildBuyerAddressRequiredScenarioRow(
  scenario: FV.BuyerAddressRequiredScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  return applyPartyIdentifiersByTxnType({
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]:
      scenario.invoiceTransactionTypeCode,
    "Buyer address line 1": scenario.buyerAddressLine1,
  });
}

export function buildInvoicingPeriodConditionalScenarioRow(
  scenario: FV.InvoicingPeriodScenario
): Record<string, string | null> {
  return buildSummaryInvoicePeriodScenarioRow(scenario);
}

export function buildPrepaymentPaidAmountScenarioRow(
  scenario: FV.PrepaymentPaidAmountScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  return {
    ...seed,
    "Paid amount": scenario.paidAmount,
    "Prepayment invoice number": scenario.prepaymentInvoiceNumber,
    "Prepayment invoice UUID": scenario.prepaymentInvoiceUuid,
  };
}

export function buildHsCodeLengthScenarioRow(
  scenario: FV.HsCodeLengthScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  return {
    ...seed,
    [FV.ITEM_TYPE_FIELD]: FV.ITEM_TYPE_GOODS,
    [FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD]:
      scenario.itemClassificationIdentifier,
  };
}

export function buildIndustrialClassificationRequiredScenarioRow(
  scenario: FV.IndustrialClassificationRequiredScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  return applyPartyIdentifiersByTxnType({
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]:
      scenario.invoiceTransactionTypeCode,
    [FV.INDUSTRIAL_CLASSIFICATION_CODE_FIELD]:
      scenario.industrialClassificationCode,
  });
}

export function buildIbrCl05DocAllowanceScenarioRow(
  scenario: FV.DocAllowanceExemptionClScenario
): Record<string, string | null> {
  return buildDocumentAllowanceChargeVatScenarioRow({
    ruleId: scenario.ruleId,
    title: scenario.title,
    shouldError: scenario.shouldError,
    expectedErrorField: scenario.expectedErrorField,
    kind: "allowance",
    vatCategory: scenario.vatCategory,
    exemptionReason: scenario.exemptionReason,
    amount: scenario.amount,
  });
}

export function buildSellerCountryRcmScenarioRow(
  scenario: FV.SellerCountryRcmScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  return applyPartyIdentifiersByTxnType({
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]:
      scenario.invoiceTransactionTypeCode,
    [FV.SELLER_COUNTRY_CODE_FIELD]: scenario.sellerCountryCode,
    [FV.BUYER_VAT_IDENTIFIER_FIELD]: FV.IBR_003_VALID_BUYER_VATIN,
    [FV.BUYER_COUNTRY_CODE_FIELD]: FV.OMAN_COUNTRY_CODE,
  });
}

export function buildProfitMarginPrecedingScenarioRow(
  scenario: FV.ProfitMarginPrecedingScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  return applyPartyIdentifiersByTxnType({
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: FV.TXN_PROFIT_MARGIN_INVOICE,
    [FV.TAX_CATEGORY_FIELD]: FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
    [FV.INVOICED_ITEM_TAX_RATE_FIELD]: null,
    [FV.PRECEDING_INVOICE_REFERENCE_FIELD]: scenario.precedingInvoiceReference,
    [FV.PRECEDING_INVOICE_UUID_FIELD]: scenario.precedingInvoiceUuid,
    [FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD]: scenario.precedingInvoiceReference
      ? "2026-01-15"
      : "",
  });
}

export function buildBuyerIdentifierSchemeScenarioRow(
  scenario: FV.BuyerIdentifierSchemeScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const row = applyPartyIdentifiersByTxnType({
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]:
      scenario.invoiceTransactionTypeCode,
  });
  // Scenario values win (including empty buyer identifier for error cases).
  row["Scheme identifier"] = scenario.buyerIdentifierScheme;
  row["Buyer Identifier (textual code)"] = scenario.buyerIdentifierScheme;
  row["Buyer identifier"] = scenario.buyerIdentifier;
  if (scenario.invoiceTransactionTypeCode === FV.TXN_IMPORT_OF_GOODS) {
    row[FV.ITEM_COUNTRY_OF_ORIGIN_FIELD] = FV.UAE_COUNTRY_CODE;
    row[FV.IMPORT_DATE_FIELD] = "2026-01-10";
    row[FV.CUSTOMS_DECLARATION_NUMBER_FIELD] = "CD-COND-001";
    row[FV.INCOTERMS_FIELD] = "Free On Board";
  }
  if (scenario.invoiceTransactionTypeCode === FV.TXN_SPECIAL_ZONE_SUPPLIES) {
    return applySpecialZoneCountrySubdivisions(row);
  }
  return row;
}
