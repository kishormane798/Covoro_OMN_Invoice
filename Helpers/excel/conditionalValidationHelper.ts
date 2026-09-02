/**
 * Oman conditional validation row builders for
 * `tests/OMN_ConditionalValidation_CovoroTemplate_Test.spec.ts`.
 * No UAE / BTUAE scenario builders.
 */
import * as FV from "../../testData/FieldValidations/ConditionalValidation";
import { PRESERVE_EXEMPT_TAX_RATE_MARKER } from "../../utils/excel/invoiceExcel";
import {
  applySelfBilledPartyIdentitySwap,
  isSelfBilledInvoiceType,
} from "../../utils/envPartyIdentity";
import {
  buyerSellerIdentifierCodeValidTestData,
  industrialClassificationIsicValidTestData,
  omanCountrySubdivisionValidTestData,
  paymentMeansTypeValidTestData,
  schemeIdentifierValidTestData,
  unitOfMeasurementValidTestData,
} from "../../testData/Master";

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
  // Oman portal: EAS 0248 / Oman VATIN scheme; seller VATIN OM-prefixed;
  // seller electronic is lowercase Peppol ID; buyer electronic is Peppol receiver ID.
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

  // Electronic address: lowercase Peppol ID; VATIN stays OM-prefixed (12 chars).
  const sellerElectronic = "om1108202600";
  const buyerElectronic = "om-receiver-dev";
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
    "Item Custom 1": "",
    "Item Custom 2": "",

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
    "Scheme Identifier - Payment": "",
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

/** All Deliver-to columns (IBR-040-OM: section is all-or-nothing). */
export const OMAN_DELIVERY_FIELD_KEYS = [
  "Deliver to party name",
  "Deliver to address line 1",
  "Deliver to address line 2",
  "Deliver to address line 3",
  "Deliver to city",
  "Deliver to post code",
  "Deliver to country sub-division",
  "Deliver to country code",
] as const;

export function isOmanDeliveryField(field: string): boolean {
  const want = field.replace(/\s+/g, " ").trim().toLowerCase();
  return OMAN_DELIVERY_FIELD_KEYS.some(
    (key) => key.toLowerCase() === want
  );
}

/** Clear every deliver-to column so the section is fully absent. */
export function clearOmanDeliveryFields(
  row: Record<string, string | null>
): Record<string, string | null> {
  const next = { ...row };
  for (const key of OMAN_DELIVERY_FIELD_KEYS) {
    next[key] = "";
  }
  return next;
}

export type OmanDeliveryOverlayProfile = "domestic" | "export";

/**
 * IBR-040-OM: when any deliver-to field is in play, populate the full section.
 * Use profile `export` for Export + Export of Services contexts (non-OM country).
 */
export function applyOmanDeliveryOverlay(
  row: Record<string, string | null>,
  profile: OmanDeliveryOverlayProfile = "domestic",
  opts?: { countryCode?: string }
): Record<string, string | null> {
  const next = { ...row };
  if (profile === "export") {
    next["Deliver to party name"] =
      next["Deliver to party name"] || "Export Consignee";
    next["Deliver to address line 1"] =
      next["Deliver to address line 1"] || "Export Street 1";
    next["Deliver to address line 2"] =
      next["Deliver to address line 2"] || "Export Street 2";
    next["Deliver to address line 3"] =
      next["Deliver to address line 3"] || "Export Street 3";
    next["Deliver to city"] = next["Deliver to city"] || "Dubai";
    next["Deliver to post code"] = next["Deliver to post code"] || "00000";
    next["Deliver to country sub-division"] =
      next["Deliver to country sub-division"] || "Dubai";
    next["Deliver to country code"] =
      opts?.countryCode ??
      (next["Deliver to country code"] || FV.UAE_COUNTRY_CODE);
  } else {
    next["Deliver to party name"] =
      next["Deliver to party name"] || "Oman Delivery Partner";
    next["Deliver to address line 1"] =
      next["Deliver to address line 1"] || "Warehouse 9";
    next["Deliver to address line 2"] =
      next["Deliver to address line 2"] || "Industrial Area";
    next["Deliver to address line 3"] =
      next["Deliver to address line 3"] || "Ghala";
    next["Deliver to city"] = next["Deliver to city"] || "Muscat";
    next["Deliver to post code"] = next["Deliver to post code"] || "130";
    next["Deliver to country sub-division"] =
      next["Deliver to country sub-division"] || "Mainland Oman.";
    next["Deliver to country code"] =
      opts?.countryCode ??
      (next["Deliver to country code"] || FV.OMAN_COUNTRY_CODE);
  }
  return next;
}

function getSeedInvoiceRow(): Record<string, string> {
  return buildValidOmanFullTaxInvoiceRow();
}

/**
 * IBR-150-OM: Special Zone Supplies requires seller + buyer country subdivision (CL-13-OM).
 * Uses a free-zone label (not Mainland) so IBR-151/152 Special Zone License rules still apply.
 */
export function applySpecialZoneCountrySubdivisions(
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

/**
 * Positive Special Zone Supplies companions: CL-13 subdivisions (IBR-150-OM)
 * plus Seller identifier + ICD scheme (IBR-007-OM). Textual code stays empty
 * (XOR). Call after Invoice Transaction Type Code is Special Zone Supplies.
 */
export function applySpecialZonePositiveCompanions(
  row: Record<string, string | null>
): Record<string, string | null> {
  const txn = String(row[FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD] ?? "").trim();
  if (txn !== FV.TXN_SPECIAL_ZONE_SUPPLIES) {
    return row;
  }
  return applyPartyIdentifiersByTxnType(applySpecialZoneCountrySubdivisions(row));
}

/** IBR-007-OM seller scheme/identifier txn types. */
const IBR_007_SELLER_IDENTIFIER_TXN_TYPES = new Set<string>([
  FV.TXN_IMPORT_OF_GOODS,
  FV.TXN_IMPORT_OF_SERVICES_RCM,
  FV.TXN_PROFIT_MARGIN_SELF_INVOICE,
  FV.TXN_SPECIAL_ZONE_SUPPLIES,
]);

/**
 * Fill or clear seller/buyer party identifiers from Invoice transaction type.
 * - Seller (IBR-007-OM): Import of Goods / Import of Services (RCM) /
 *   Profit Margin Self-Invoice / Special Zone Supplies — overlay fills
 *   Seller identifier + ICD scheme (textual alone is Not Allowed).
 * - Buyer Import of Goods (IBR-153-OM): textual code `Importer Customs ID`
 *   (ICD scheme stays empty — XOR).
 * - Buyer Special Zone (IBR-152-OM): textual code `Special Zone License Number`
 *   (ICD scheme stays empty — XOR). Seller SZLN textual is IBR-151-OM
 *   scenario builders only — they overwrite after this overlay.
 * Scenario builders may overwrite these afterward (including empty for error cases).
 */
export function applyPartyIdentifiersByTxnType(
  row: Record<string, string | null>
): Record<string, string | null> {
  const txn = String(row[FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD] ?? "").trim();
  const next: Record<string, string | null> = { ...row };
  const defaultScheme = masterLabelIncluding(
    schemeIdentifierValidTestData,
    "Oman Value Added Tax",
    "Oman Value Added Tax Identification Number (VATIN) (OM:VAT) - Issuing agency: Tax Authority, Oman."
  );
  const importerCustomsIdCode = masterLabelIncluding(
    buyerSellerIdentifierCodeValidTestData,
    "Importer Customs ID",
    "Importer Customs ID"
  );
  const specialZoneLicenseCode = masterLabelIncluding(
    buyerSellerIdentifierCodeValidTestData,
    "Special Zone License Number",
    FV.SPECIAL_ZONE_LICENSE_SCHEME
  );

  if (IBR_007_SELLER_IDENTIFIER_TXN_TYPES.has(txn)) {
    // XOR: ICD scheme + identifier. Special Zone IBR-085/084 companions
    // must not use textual-only (IBR-007-OM errors on empty scheme).
    next[FV.SELLER_IDENTIFIER_SCHEME_FIELD] = defaultScheme;
    next[FV.SELLER_IDENTIFIER_TEXTUAL_CODE_FIELD] = "";
    next[FV.SELLER_IDENTIFIER_FIELD] =
      txn === FV.TXN_SPECIAL_ZONE_SUPPLIES ? "SZ-SELLER-001" : "OM-SELLER-001";
  } else {
    next[FV.SELLER_IDENTIFIER_SCHEME_FIELD] = "";
    next[FV.SELLER_IDENTIFIER_TEXTUAL_CODE_FIELD] = "";
    next[FV.SELLER_IDENTIFIER_FIELD] = "";
  }

  if (txn === FV.TXN_SPECIAL_ZONE_SUPPLIES) {
    next["Scheme identifier"] = "";
    next["Buyer Identifier (textual code)"] = specialZoneLicenseCode;
    next["Buyer identifier"] = "SZ-BUYER-001";
  } else if (txn === FV.TXN_IMPORT_OF_GOODS) {
    // IBR-153-OM: Buyer identifier code must be 'Importer Customs ID'.
    next["Scheme identifier"] = "";
    next["Buyer Identifier (textual code)"] = importerCustomsIdCode;
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
  const taxRate = resolveTaxRate(scenario.taxRate);
  const row: Record<string, string | null> = {
    ...seed,
    [FV.TAX_CATEGORY_FIELD]: scenario.taxCategory,
    [FV.INVOICED_ITEM_TAX_RATE_FIELD]: taxRate,
    [FV.TAX_EXEMPTION_REASON_CODE_FIELD]: exemption,
  };
  // E-05 / IBR-067: keep intentional rate on Exempt (incl. whitespace-only) through Excel write.
  if (
    scenario.taxCategory === FV.EXEMPT_FROM_TAX_TAX_CATEGORY_CODE &&
    taxRate !== null &&
    String(taxRate).length > 0
  ) {
    row[PRESERVE_EXEMPT_TAX_RATE_MARKER] = "1";
  }
  return row;
}

/**
 * IBR-104-OM: same Tax Category / Tax Rate as Phase 1, plus IBR-034 VAT
 * accounting currency context (USD + FX + tax amount in accounting currency).
 */
export function buildVatAccountingCurrencyTaxRateScenarioRow(
  scenario: FV.VatCategoryTaxRateScenario
): Record<string, string | null> {
  return {
    ...buildVatCategoryTaxRateScenarioRow(scenario),
    [FV.INVOICE_CURRENCY_CODE_FIELD]: FV.OMAN_CURRENCY_USD,
    [FV.SOURCE_CURRENCY_CODE_FIELD]: FV.OMAN_CURRENCY_USD,
    [FV.EXCHANGE_RATE_FIELD]: "0.385",
    [FV.TAX_AMOUNT_IN_ACCOUNTING_CURRENCY_FIELD]: "50",
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
  const exemptionText =
    scenario.taxExemptionReasonText !== undefined
      ? scenario.taxExemptionReasonText
      : scenario.taxExemptionReasonCode ?? "";
  return {
    ...seed,
    [FV.TAX_CATEGORY_FIELD]: scenario.taxCategory,
    [FV.INVOICED_ITEM_TAX_RATE_FIELD]: rate,
    [FV.TAX_EXEMPTION_REASON_CODE_FIELD]: scenario.taxExemptionReasonCode,
    [FV.TAX_EXEMPTION_REASON_TEXT_FIELD]: exemptionText,
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

/** Covoro Invoice Transaction Type Code cell: Master description, never Peppol bits. */
function toInvoiceTxnExcelDescription(raw: string): string {
  const t = String(raw ?? "").trim();
  const asBits = t.replace(/X/gi, "0");
  if (FV.isOmanTxnPeppolBitString(asBits)) {
    return FV.omanTxnBitsToExcelDescriptions(asBits) || t;
  }
  return t;
}

/** Expand a pack row across MULTI_VALUE_PACK_EXPAND dimension values. */
export function expandRowByMultiValueSpec(
  baseRow: Record<string, string | null>,
  spec: FV.MultiValuePackExpandSpec,
  opts?: { applyConflictBits?: boolean }
): Array<Record<string, string | null>> {
  const applyConflict = Boolean(
    opts?.applyConflictBits && (spec.conflictBit || spec.conflictLabel)
  );
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
    // txnType — Covoro Excel needs Master descriptions, never Peppol 0/1 codes.
    let txnValue = value;
    if (applyConflict && spec.conflictLabel) {
      txnValue = FV.combineOmanTxnTypeDescriptions(spec.conflictLabel, value);
    } else if (applyConflict && spec.valueBits?.[value] && spec.conflictBit) {
      txnValue = FV.combineOmanTxnTypeBits(
        spec.valueBits[value]!,
        spec.conflictBit
      );
    }
    txnValue = toInvoiceTxnExcelDescription(txnValue);
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
    "Item gross price": scenario.itemGrossPrice,
    "Item price discount": "0",
  };
}

/**
 * IBR-046-OM: format/range of Covoro `Tax Rate` (IBT-152 / IBT-119).
 * CN/DN/261 get preceding + reason companions; 261/389 use Self-billed txn + identity swap.
 */
export function buildVatRateFormatScenarioRow(
  scenario: FV.VatRateFormatScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const invoiceTypeCode = scenario.invoiceTypeCode;
  const txn = scenario.invoiceTransactionTypeCode;
  let row: Record<string, string | null> = {
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: txn,
    [FV.TAX_CATEGORY_FIELD]: FV.STANDARD_TAX_CATEGORY_CODE,
    [FV.INVOICED_ITEM_TAX_RATE_FIELD]: scenario.taxRate,
    [FV.TAX_EXEMPTION_REASON_CODE_FIELD]: "",
  };
  row = applyPartyIdentifiersByTxnType(row);
  if (txn === FV.TXN_SIMPLIFIED_TAX_INVOICE) {
    row[FV.ITEM_TYPE_FIELD] = "";
    row[FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD] = "";
    row[FV.INDUSTRIAL_CLASSIFICATION_CODE_FIELD] = "";
  }
  row = applyTxnExclusionInvoiceType(row, invoiceTypeCode);
  if (invoiceTypeCode === FV.INVOICE_TYPE_SELF_BILLED_CREDIT_NOTE) {
    row[FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD] = FV.TXN_SELF_BILLED_INVOICE;
    row = applyPartyIdentifiersByTxnType(row);
  }
  if (isSelfBilledInvoiceType(invoiceTypeCode)) {
    const stringRow: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      stringRow[key] = value == null ? "" : String(value);
    }
    row = applySelfBilledPartyIdentitySwap(stringRow);
  }
  row[FV.INVOICED_ITEM_TAX_RATE_FIELD] = scenario.taxRate;
  return row;
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
  const txn =
    scenario.invoiceTransactionTypeCode ?? FV.TXN_IMPORT_OF_GOODS;
  let row: Record<string, string | null> = {
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: txn,
    [FV.ITEM_TYPE_FIELD]: FV.ITEM_TYPE_GOODS,
    [FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD]: FV.OMAN_HS_CODE_12,
  };
  // Companions keep other Master txn dropdown labels valid; origin/import
  // stay scenario-driven so empty origin is not refilled.
  row = applyIbr081TxnCompanions(row, txn);
  row = applyPartyIdentifiersByTxnType(row);
  if (isSelfBilledInvoiceType(String(row[FV.INVOICE_TYPE_CODE_FIELD] ?? ""))) {
    const stringRow: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      stringRow[key] = value == null ? "" : String(value);
    }
    row = applySelfBilledPartyIdentitySwap(stringRow);
  }
  row[FV.ITEM_COUNTRY_OF_ORIGIN_FIELD] = scenario.itemCountryOfOrigin;
  row[FV.IMPORT_DATE_FIELD] = scenario.importDate;
  row[FV.CUSTOMS_DECLARATION_NUMBER_FIELD] = scenario.customsDeclarationNumber;
  row[FV.INCOTERMS_FIELD] = scenario.incoterms;
  return row;
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
    // CL-11-OM companion: BTOM-025 required on Profit Margin Self-Invoice.
    [FV.PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD]: FV.PROFIT_MARGIN_ITEM_TYPE_SAMPLE,
  });
}

/** Phase 4: Summary Invoice period (IBR-037-OM / IBR-036-OM). */
export function buildSummaryInvoicePeriodScenarioRow(
  scenario: FV.SummaryPeriodScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const row = applyPartyIdentifiersByTxnType({
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]:
      scenario.invoiceTransactionTypeCode,
    [FV.INVOICING_PERIOD_START_DATE_FIELD]: scenario.periodStart,
    [FV.INVOICING_PERIOD_END_DATE_FIELD]: scenario.periodEnd,
  });
  return applyTxnExclusionInvoiceType(row, scenario.invoiceTypeCode);
}

/** Phase 5: document allowance/charge VAT + exemption (IBR-062/064-OM). */
export function buildDocumentAllowanceChargeVatScenarioRow(
  scenario: FV.DocumentAllowanceChargeVatScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const docVat = String(scenario.vatCategory ?? "").replace(/\s+/g, " ").trim();
  // Empty document VAT category is the error case — item tax stays Standard.
  const itemCat = docVat || FV.STANDARD_TAX_CATEGORY_CODE;
  const row: Record<string, string | null> = {
    ...seed,
    [FV.TAX_CATEGORY_FIELD]: itemCat,
    [FV.INVOICED_ITEM_TAX_RATE_FIELD]:
      itemCat === FV.ZERO_RATED_TAX_CATEGORY_CODE
        ? FV.TAX_RATE_ZERO
        : itemCat === FV.STANDARD_TAX_CATEGORY_CODE
          ? FV.TAX_RATE_STANDARD_OMAN
          : null,
    [FV.TAX_EXEMPTION_REASON_CODE_FIELD]:
      itemCat === FV.ZERO_RATED_TAX_CATEGORY_CODE
        ? FV.TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE
        : itemCat === FV.EXEMPT_FROM_TAX_TAX_CATEGORY_CODE
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
  const base = applyPartyIdentifiersByTxnType({
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]:
      scenario.invoiceTransactionTypeCode,
    [FV.TAX_CATEGORY_FIELD]: FV.ZERO_RATED_TAX_CATEGORY_CODE,
    [FV.INVOICED_ITEM_TAX_RATE_FIELD]: FV.TAX_RATE_ZERO,
    [FV.TAX_EXEMPTION_REASON_CODE_FIELD]:
      FV.TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
  });
  const country = String(scenario.deliverToCountryCode ?? "").trim();
  if (!country) {
    return clearOmanDeliveryFields(base);
  }
  return applyOmanDeliveryOverlay(base, "export", { countryCode: country });
}

/**
 * IBR-155-OM: activate Export + Export of Services so Service Type (CL-12) tests
 * validate the target column with the correct trigger (BTOM-001 + IBT-121 → BTOM-015).
 */
export function applyServiceTypeDropdownValidationContext(
  row: Record<string, string>,
  options?: { serviceTypeCode?: string }
): Record<string, string> {
  const serviceTypeCode =
    options?.serviceTypeCode !== undefined
      ? options.serviceTypeCode
      : row[FV.SERVICE_TYPE_CODE_FIELD]?.trim() || FV.SERVICE_TYPE_CODE_SAMPLE;
  const updated = applyExportOfServicesTrigger(
    { ...row },
    {
      invoiceTransactionTypeCode: FV.TXN_EXPORT_INVOICE,
      taxExemptionReasonCode: FV.TAX_EXEMPTION_REASON_EXPORT_OF_SERVICES,
      serviceTypeCode,
    }
  );
  return Object.fromEntries(
    Object.entries(updated).map(([k, v]) => [k, v == null ? "" : String(v)])
  );
}

/**
 * Shared Export + Export of Services (IBT-121 / VATZR-OM-09) trigger overlay for IBR-012/155.
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
    // AND isolation: IBT-121 Export of Services without Export BTOM-001 —
    // keep Zero-rated Services so the reason is valid; IBR-012 must not fire.
    if (opts.taxExemptionReasonCode) {
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
  return applyOmanDeliveryOverlay(
    applyPartyIdentifiersByTxnType({
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
      [FV.SUPPORTING_DOCUMENT_REFERENCE_FIELD]:
        opts.supportingDocumentReference ??
        FV.SUPPORTING_DOCUMENT_REFERENCE_SAMPLE,
      [FV.SUPPORTING_DOCUMENT_UUID_FIELD]:
        opts.supportingDocumentUuid ?? FV.SUPPORTING_DOCUMENT_UUID_SAMPLE,
    }),
    "export",
    { countryCode: deliver }
  );
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
  const isExportOtherReason =
    scenario.invoiceTransactionTypeCode === FV.TXN_EXPORT_INVOICE &&
    Boolean(scenario.taxExemptionReasonCode) &&
    scenario.taxExemptionReasonCode !==
      FV.TAX_EXEMPTION_REASON_EXPORT_OF_SERVICES;

  // AND isolation: Export + other IBT-121 (not VATZR-OM-09) — IBR-012 must not fire.
  if (isExportOtherReason) {
    const needsReExportDocs =
      scenario.taxExemptionReasonCode ===
      FV.TAX_EXEMPTION_REASON_RE_EXPORT_OF_GOODS;
    let row = applyExportReExportOfGoodsTrigger(seed, {
      invoiceTransactionTypeCode: scenario.invoiceTransactionTypeCode,
      taxExemptionReasonCode: scenario.taxExemptionReasonCode,
      supportingDocumentReference: needsReExportDocs
        ? FV.SUPPORTING_DOCUMENT_REFERENCE_SAMPLE
        : "",
      supportingDocumentUuid: needsReExportDocs
        ? FV.SUPPORTING_DOCUMENT_UUID_SAMPLE
        : "",
    });
    if (scenario.deliverToCountryCode === FV.OMAN_COUNTRY_CODE) {
      row = applyOmanDeliveryOverlay(row, "domestic", {
        countryCode: FV.OMAN_COUNTRY_CODE,
      });
    } else {
      row = {
        ...row,
        [FV.DELIVER_TO_COUNTRY_CODE_FIELD]: scenario.deliverToCountryCode,
      };
    }
    return row;
  }

  return applyExportOfServicesTrigger(seed, {
    invoiceTransactionTypeCode: scenario.invoiceTransactionTypeCode,
    taxExemptionReasonCode: scenario.taxExemptionReasonCode,
    deliverToCountryCode: scenario.deliverToCountryCode,
  });
}

/** IBR-013-OM: Export + Re-export of goods (VATZR-OM-12) → supporting document ref + UUID. */
export function buildExportSupportingDocumentScenarioRow(
  scenario: FV.ExportSupportingDocumentScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  return applyExportReExportOfGoodsTrigger(seed, {
    invoiceTransactionTypeCode: scenario.invoiceTransactionTypeCode,
    taxExemptionReasonCode: scenario.taxExemptionReasonCode,
    supportingDocumentReference: scenario.supportingDocumentReference,
    supportingDocumentUuid: scenario.supportingDocumentUuid,
  });
}

/**
 * IBR-013-OM overlay: Export invoice (BTOM-001) AND Re-export of goods (IBT-121 /
 * VATZR-OM-12) require Supporting document reference (IBT-122) and UUID (BTOM-023).
 * Keeps Goods + HS so IBR-079 holds; does not use the Export of Services overlay
 * (that trigger belongs to IBR-012 / IBR-155).
 */
function applyExportReExportOfGoodsTrigger(
  row: Record<string, string | null>,
  opts: {
    invoiceTransactionTypeCode: string;
    taxExemptionReasonCode: string;
    supportingDocumentReference: string;
    supportingDocumentUuid: string;
  }
): Record<string, string | null> {
  const isExport =
    opts.invoiceTransactionTypeCode === FV.TXN_EXPORT_INVOICE;
  const hasExemptionReason = Boolean(opts.taxExemptionReasonCode);

  let next = applyPartyIdentifiersByTxnType({
    ...row,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]:
      opts.invoiceTransactionTypeCode,
  });

  if (isExport) {
    next = applyOmanDeliveryOverlay(next, "export");
  }

  if (hasExemptionReason) {
    next[FV.TAX_CATEGORY_FIELD] = FV.ZERO_RATED_TAX_CATEGORY_CODE;
    next[FV.INVOICED_ITEM_TAX_RATE_FIELD] = FV.TAX_RATE_ZERO;
    next[FV.TAX_EXEMPTION_REASON_CODE_FIELD] = opts.taxExemptionReasonCode;
    next[FV.TAX_EXEMPTION_REASON_TEXT_FIELD] = opts.taxExemptionReasonCode;
    next[FV.ITEM_TYPE_FIELD] = FV.ITEM_TYPE_GOODS;
    next[FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD] = FV.OMAN_HS_CODE_12;
    next[FV.SERVICE_TYPE_CODE_FIELD] = "";
  } else {
    next[FV.TAX_EXEMPTION_REASON_CODE_FIELD] = "";
    next[FV.TAX_EXEMPTION_REASON_TEXT_FIELD] = "";
  }

  next[FV.SUPPORTING_DOCUMENT_REFERENCE_FIELD] =
    opts.supportingDocumentReference;
  next[FV.SUPPORTING_DOCUMENT_UUID_FIELD] = opts.supportingDocumentUuid;
  return next;
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
  // Scenario values win (including empty fields for omit-one Not Allowed).
  // non-MO: scheme + textual SZLN + identifier. MO: scheme + identifier only.
  row[FV.SELLER_IDENTIFIER_SCHEME_FIELD] = scenario.sellerIdentifierScheme;
  row[FV.SELLER_IDENTIFIER_TEXTUAL_CODE_FIELD] =
    scenario.sellerIdentifierTextualCode;
  row[FV.SELLER_IDENTIFIER_FIELD] = scenario.sellerIdentifier;
  // Free-zone subdivisions for Special Zone and wrong-target Full Tax
  // (clone Allowed; only txn differs). Mainland exception overrides below.
  const next = applySpecialZoneCountrySubdivisions(row);
  if (scenario.invoiceTransactionTypeCode === FV.TXN_SPECIAL_ZONE_SUPPLIES) {
    // IBR-152 companion so seller-identifier polarities are the only IBR-151 probe.
    next[FV.BUYER_IDENTIFIER_SCHEME_FIELD] = "";
    next[FV.BUYER_IDENTIFIER_TEXTUAL_CODE_FIELD] = FV.SPECIAL_ZONE_LICENSE_SCHEME;
    next[FV.BUYER_IDENTIFIER_FIELD] =
      next[FV.BUYER_IDENTIFIER_FIELD] || "SZ-BUYER-001";
  }
  if (scenario.sellerCountrySubdivisionCode !== undefined) {
    next[FV.SELLER_COUNTRY_SUBDIVISION_CODE_FIELD] =
      scenario.sellerCountrySubdivisionCode;
  }
  return next;
}

/** Special Zone country subdivision (IBR-150-OM). */
export function buildSpecialZoneCountrySubdivisionScenarioRow(
  scenario: FV.SpecialZoneCountrySubdivisionScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const row = applySpecialZonePositiveCompanions({
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]:
      scenario.invoiceTransactionTypeCode,
  });
  // IBR-152 buyer companion so subdivision polarities are the only IBR-150 probe.
  // Seller keeps IBR-007 ICD scheme + identifier (textual SZLN fails IBR-007).
  row[FV.BUYER_IDENTIFIER_SCHEME_FIELD] = "";
  row[FV.BUYER_IDENTIFIER_TEXTUAL_CODE_FIELD] = FV.SPECIAL_ZONE_LICENSE_SCHEME;
  row[FV.BUYER_IDENTIFIER_FIELD] = "SZ-BUYER-001";
  // Scenario values win (including empty / non-CL-13 for error cases).
  row[FV.SELLER_COUNTRY_SUBDIVISION_CODE_FIELD] =
    scenario.sellerCountrySubdivisionCode;
  row[FV.BUYER_COUNTRY_SUBDIVISION_CODE_FIELD] =
    scenario.buyerCountrySubdivisionCode;
  return row;
}

/** Self-billed / RCM buyer VATIN (IBR-017-OM). */
export function buildSelfBilledBuyerVatScenarioRow(
  scenario: FV.SelfBilledBuyerVatScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const txn = scenario.invoiceTransactionTypeCode;
  const row: Record<string, string | null> = {
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: txn,
    [FV.BUYER_VAT_IDENTIFIER_FIELD]: scenario.buyerVatIdentifier,
    // IBR-020-OM: buyer country MUST be OM on all four IBR-017 txn types.
    [FV.BUYER_COUNTRY_CODE_FIELD]: FV.OMAN_COUNTRY_CODE,
  };
  if (txn === FV.TXN_IMPORT_OF_GOODS) {
    row[FV.ITEM_COUNTRY_OF_ORIGIN_FIELD] = FV.UAE_COUNTRY_CODE;
    row[FV.IMPORT_DATE_FIELD] = "2026-01-10";
    row[FV.CUSTOMS_DECLARATION_NUMBER_FIELD] = "CD-COND-001";
    row[FV.INCOTERMS_FIELD] = "Free On Board";
    row[FV.ITEM_TYPE_FIELD] = FV.ITEM_TYPE_GOODS;
    row[FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD] = FV.OMAN_HS_CODE_12;
  }
  if (txn === FV.TXN_IMPORT_OF_SERVICES_RCM) {
    // IBR-160-OM: seller country must not be OM (RCM companion, not the VATIN probe).
    row[FV.SELLER_COUNTRY_CODE_FIELD] = FV.UAE_COUNTRY_CODE;
    row[FV.ITEM_TYPE_FIELD] = FV.ITEM_TYPE_SERVICES;
    row[FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD] = "";
  }
  if (txn === FV.TXN_PROFIT_MARGIN_SELF_INVOICE) {
    // IBR-086-OM: line tax category MUST be O. IBR-087-OM + CL-11-OM companions.
    row[FV.TAX_CATEGORY_FIELD] = FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE;
    row[FV.INVOICED_ITEM_TAX_RATE_FIELD] = null;
    row[FV.TAX_EXEMPTION_REASON_CODE_FIELD] = "";
    row[FV.TAX_EXEMPTION_REASON_TEXT_FIELD] = "";
    row[FV.LINE_ITEM_VAT_AMOUNT_FIELD] = "0";
    row[FV.PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD] =
      FV.PROFIT_MARGIN_ITEM_TYPE_SAMPLE;
    row[FV.SELLER_COUNTRY_CODE_FIELD] = FV.OMAN_COUNTRY_CODE;
  }
  const next = applyPartyIdentifiersByTxnType(row);
  if (scenario.buyerIdentifier !== undefined) {
    next[FV.BUYER_IDENTIFIER_FIELD] = scenario.buyerIdentifier;
  }
  next[FV.BUYER_VAT_IDENTIFIER_FIELD] = scenario.buyerVatIdentifier;
  return next;
}

function resolveIbr020InvoiceType(
  scenario: FV.SelfBilledRcmBuyerCountryScenario
): string {
  if (scenario.invoiceTypeCode) {
    return scenario.invoiceTypeCode;
  }
  if (scenario.invoiceTransactionTypeCode === FV.TXN_SELF_BILLED_INVOICE) {
    return FV.INVOICE_TYPE_SELF_BILLED_INVOICE;
  }
  return FV.INVOICE_TYPE_COMMERCIAL_INVOICE;
}

/** IBR-020-OM: Self-billed / RCM → Buyer country must be OM. */
export function buildSelfBilledRcmBuyerCountryScenarioRow(
  scenario: FV.SelfBilledRcmBuyerCountryScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const txn = scenario.invoiceTransactionTypeCode;
  const invoiceTypeCode = resolveIbr020InvoiceType(scenario);
  let row: Record<string, string | null> = {
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: txn,
    [FV.INVOICE_TYPE_CODE_FIELD]: invoiceTypeCode,
  };
  if (txn === FV.TXN_IMPORT_OF_GOODS) {
    row[FV.ITEM_COUNTRY_OF_ORIGIN_FIELD] = FV.UAE_COUNTRY_CODE;
    row[FV.IMPORT_DATE_FIELD] = "2026-01-10";
    row[FV.CUSTOMS_DECLARATION_NUMBER_FIELD] = "CD-COND-001";
    row[FV.INCOTERMS_FIELD] = "Free On Board";
    row[FV.ITEM_TYPE_FIELD] = FV.ITEM_TYPE_GOODS;
    row[FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD] = FV.OMAN_HS_CODE_12;
    row[FV.SERVICE_TYPE_CODE_FIELD] = "";
  }
  if (txn === FV.TXN_IMPORT_OF_SERVICES_RCM) {
    // IBR-160-OM: seller country must not be OM (RCM companion, not the country probe).
    row[FV.SELLER_COUNTRY_CODE_FIELD] = FV.UAE_COUNTRY_CODE;
    row[FV.ITEM_TYPE_FIELD] = FV.ITEM_TYPE_SERVICES;
    row[FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD] = "";
    row[FV.SERVICE_TYPE_CODE_FIELD] = FV.SERVICE_TYPE_CODE_SAMPLE;
  }
  if (txn === FV.TXN_PROFIT_MARGIN_SELF_INVOICE) {
    // IBR-086-OM: line tax category MUST be O. IBR-087-OM + CL-11-OM companions.
    row[FV.TAX_CATEGORY_FIELD] = FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE;
    row[FV.INVOICED_ITEM_TAX_RATE_FIELD] = null;
    row[FV.TAX_EXEMPTION_REASON_CODE_FIELD] = "";
    row[FV.TAX_EXEMPTION_REASON_TEXT_FIELD] = "";
    row[FV.LINE_ITEM_VAT_AMOUNT_FIELD] = "0";
    row[FV.PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD] =
      FV.PROFIT_MARGIN_ITEM_TYPE_SAMPLE;
    row[FV.SELLER_COUNTRY_CODE_FIELD] = FV.OMAN_COUNTRY_CODE;
  }
  if (
    invoiceTypeCode === FV.INVOICE_TYPE_SELF_BILLED_INVOICE ||
    invoiceTypeCode === FV.INVOICE_TYPE_SELF_BILLED_CREDIT_NOTE
  ) {
    row = applySelfBilledDocumentInvoiceType(row, invoiceTypeCode);
  }
  row = applyPartyIdentifiersByTxnType(row);
  if (isSelfBilledInvoiceType(invoiceTypeCode)) {
    const stringRow: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      stringRow[key] = value == null ? "" : String(value);
    }
    row = applySelfBilledPartyIdentitySwap(stringRow);
  }
  row[FV.BUYER_COUNTRY_CODE_FIELD] = scenario.buyerCountryCode;
  return row;
}

/** IBR-177-OM: self-billed document types constrain allowed transaction types. */
export function buildSelfBilledTxnConstraintScenarioRow(
  scenario: FV.SelfBilledTxnConstraintScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const txn = scenario.invoiceTransactionTypeCode;
  const row: Record<string, string | null> = {
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: txn,
  };
  if (txn === FV.TXN_IMPORT_OF_GOODS) {
    row[FV.ITEM_COUNTRY_OF_ORIGIN_FIELD] = FV.UAE_COUNTRY_CODE;
    row[FV.IMPORT_DATE_FIELD] = "2026-01-10";
    row[FV.CUSTOMS_DECLARATION_NUMBER_FIELD] = "CD-COND-001";
    row[FV.INCOTERMS_FIELD] = "Free On Board";
    row[FV.ITEM_TYPE_FIELD] = FV.ITEM_TYPE_GOODS;
    row[FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD] = FV.OMAN_HS_CODE_12;
  }
  if (txn === FV.TXN_IMPORT_OF_SERVICES_RCM) {
    // IBR-160-OM: seller country must not be OM. IBR-017/020: buyer VATIN + OM.
    row[FV.SELLER_COUNTRY_CODE_FIELD] = FV.UAE_COUNTRY_CODE;
    row[FV.BUYER_VAT_IDENTIFIER_FIELD] = FV.IBR_003_VALID_BUYER_VATIN;
    row[FV.BUYER_COUNTRY_CODE_FIELD] = FV.OMAN_COUNTRY_CODE;
    row[FV.ITEM_TYPE_FIELD] = FV.ITEM_TYPE_SERVICES;
    row[FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD] = "";
  }
  if (txn === FV.TXN_PROFIT_MARGIN_SELF_INVOICE) {
    // IBR-086/087-OM + CL-11-OM companions so IBR-177 txn polarity is the only probe.
    row[FV.TAX_CATEGORY_FIELD] = FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE;
    row[FV.INVOICED_ITEM_TAX_RATE_FIELD] = null;
    row[FV.TAX_EXEMPTION_REASON_CODE_FIELD] = "";
    row[FV.TAX_EXEMPTION_REASON_TEXT_FIELD] = "";
    row[FV.LINE_ITEM_VAT_AMOUNT_FIELD] = "0";
    row[FV.PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD] =
      FV.PROFIT_MARGIN_ITEM_TYPE_SAMPLE;
    row[FV.SELLER_COUNTRY_CODE_FIELD] = FV.OMAN_COUNTRY_CODE;
  }
  return applyPartyIdentifiersByTxnType(
    applySelfBilledDocumentInvoiceType(row, scenario.invoiceTypeCode)
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
 * Apply Master Invoice Type Code for IBR-138…149 expansions.
 * CN/DN types get preceding + reason companions; does not overwrite BTOM-001.
 */
function applyTxnExclusionInvoiceType(
  row: Record<string, string | null>,
  invoiceTypeCode?: string
): Record<string, string | null> {
  if (!invoiceTypeCode) {
    return row;
  }
  const next: Record<string, string | null> = {
    ...row,
    [FV.INVOICE_TYPE_CODE_FIELD]: invoiceTypeCode,
  };
  const n = invoiceTypeCode.trim().toLowerCase();
  const isCnDn = n.includes("credit note") || n.includes("debit note");
  if (isCnDn) {
    if (!String(next[FV.PRECEDING_INVOICE_REFERENCE_FIELD] ?? "").trim()) {
      next[FV.PRECEDING_INVOICE_REFERENCE_FIELD] = "PREV-OMN-001";
    }
    if (!String(next[FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD] ?? "").trim()) {
      next[FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD] = "2026-06-01";
    }
    if (!String(next[FV.PRECEDING_INVOICE_UUID_FIELD] ?? "").trim()) {
      next[FV.PRECEDING_INVOICE_UUID_FIELD] = FV.PRECEDING_INVOICE_UUID_SAMPLE;
    }
    if (!String(next[FV.CREDIT_DEBIT_NOTE_REASON_CODE_FIELD] ?? "").trim()) {
      next[FV.CREDIT_DEBIT_NOTE_REASON_CODE_FIELD] =
        FV.CREDIT_DEBIT_REASON_SAMPLE;
    }
  } else if (invoiceTypeCode === FV.INVOICE_TYPE_SELF_BILLED_INVOICE) {
    const txn = String(next[FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD] ?? "");
    const labels = txn
      .split(/[,;|]+/)
      .map((p) => p.trim())
      .filter(Boolean);
    const keepPreceding = labels.includes(FV.TXN_PROFIT_MARGIN_INVOICE);
    next[FV.CREDIT_DEBIT_NOTE_REASON_CODE_FIELD] = "";
    if (!keepPreceding) {
      next[FV.PRECEDING_INVOICE_REFERENCE_FIELD] = "";
      next[FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD] = "";
      next[FV.PRECEDING_INVOICE_UUID_FIELD] = "";
    }
  }
  return next;
}

/**
 * IBR-138-OM: Self-billed combined with Third-party/Export/RCM/PM/Import
 * (joined Master descriptions) or Self-billed-alone control. Companions
 * avoid IBR-015 / IBR-014 / IBR-160 / IBR-175 / IBR-086 / IBR-084 masking
 * the rule. Excel cell is always a dropdown description, never a 0/1 code.
 */
export function buildSelfBilledTxnExclusionScenarioRow(
  scenario: FV.SelfBilledTxnExclusionScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const actualTxn = toInvoiceTxnExcelDescription(
    scenario.invoiceTransactionTypeCode
  );
  const partner = scenario.conflictingTxnType;
  const labels = collectTxnMasterLabels(actualTxn, partner);
  let row: Record<string, string | null> = {
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: actualTxn,
  };
  row = applyTxnExclusionCompanions(row, labels);
  const identifierTxn = pickIdentifierTxnLabel(
    labels,
    partner || FV.TXN_SELF_BILLED_INVOICE
  );
  row = applyPartyIdentifiersByTxnType({
    ...row,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: identifierTxn,
  });
  row[FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD] = actualTxn;
  return applyTxnExclusionInvoiceType(row, scenario.invoiceTypeCode);
}

/**
 * IBR-140-OM: Summary vs Continuous/Export/PM/PM-Self/Import.
 * Excel cell is a Master description, or comma-joined descriptions for
 * Not Allowed (never Peppol bit-strings).
 */
export function buildSummaryTxnExclusionScenarioRow(
  scenario: FV.SummaryTxnExclusionScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const actualTxn = toInvoiceTxnExcelDescription(
    scenario.invoiceTransactionTypeCode
  );
  const partner = scenario.conflictingTxnType;
  const labels = collectTxnMasterLabels(actualTxn, partner);
  let row: Record<string, string | null> = {
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: actualTxn,
  };
  row = applyTxnExclusionCompanions(row, labels);
  const identifierTxn = pickIdentifierTxnLabel(
    labels,
    partner || FV.TXN_SUMMARY_INVOICE
  );
  row = applyPartyIdentifiersByTxnType({
    ...row,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: identifierTxn,
  });
  row[FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD] = actualTxn;
  return applyTxnExclusionInvoiceType(row, scenario.invoiceTypeCode);
}

/**
 * IBR-141-OM: Continuous Supply vs Summary/Deemed/PM/PM-Self/Import.
 * Excel cell is a Master description, or comma-joined descriptions for
 * Not Allowed (never Peppol bit-strings). Companions avoid IBR-037 /
 * IBR-175 / IBR-086 / IBR-084 masking the rule.
 */
export function buildContinuousTxnExclusionScenarioRow(
  scenario: FV.ContinuousTxnExclusionScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const actualTxn = toInvoiceTxnExcelDescription(
    scenario.invoiceTransactionTypeCode
  );
  const partner = scenario.conflictingTxnType;
  const labels = collectTxnMasterLabels(actualTxn, partner);
  let row: Record<string, string | null> = {
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: actualTxn,
  };
  row = applyTxnExclusionCompanions(row, labels);
  const identifierTxn = pickIdentifierTxnLabel(
    labels,
    partner || FV.TXN_CONTINUOUS_SUPPLY
  );
  row = applyPartyIdentifiersByTxnType({
    ...row,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: identifierTxn,
  });
  row[FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD] = actualTxn;
  return applyTxnExclusionInvoiceType(row, scenario.invoiceTypeCode);
}

function collectTxnMasterLabels(cell: string, partner: string): string[] {
  const labels = String(cell ?? "")
    .split(/[,;|]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (partner && !labels.includes(partner)) {
    labels.push(partner);
  }
  return labels;
}

function pickIdentifierTxnLabel(labels: string[], fallback: string): string {
  const priority = [
    FV.TXN_SPECIAL_ZONE_SUPPLIES,
    FV.TXN_IMPORT_OF_GOODS,
    FV.TXN_IMPORT_OF_SERVICES_RCM,
    FV.TXN_PROFIT_MARGIN_SELF_INVOICE,
    FV.TXN_SELF_BILLED_INVOICE,
  ];
  for (const label of priority) {
    if (labels.includes(label)) {
      return label;
    }
  }
  return labels[0] || fallback;
}

function applyTxnExclusionCompanions(
  row: Record<string, string | null>,
  labels: string[]
): Record<string, string | null> {
  let next = { ...row };
  const has = (label: string) => labels.includes(label);

  if (has(FV.TXN_SUMMARY_INVOICE) || has(FV.TXN_CONTINUOUS_SUPPLY)) {
    next[FV.INVOICING_PERIOD_START_DATE_FIELD] = "2026-01-01";
    next[FV.INVOICING_PERIOD_END_DATE_FIELD] = "2026-01-31";
  }

  if (has(FV.TXN_THIRD_PARTY_INVOICE)) {
    next[FV.THIRD_PARTY_NAME_FIELD] = "Oman Third Party LLC";
    next[FV.THIRD_PARTY_VATIN_FIELD] = FV.IBR_003_VALID_THIRD_PARTY_VATIN;
    next[FV.THIRD_PARTY_ADDRESS_LINE_1_FIELD] = "TP Building 1";
    next[FV.THIRD_PARTY_ADDRESS_LINE_2_FIELD] = "TP Street";
    next[FV.THIRD_PARTY_ADDRESS_LINE_3_FIELD] = "TP Area";
    next[FV.THIRD_PARTY_CITY_FIELD] = "Muscat";
    next[FV.THIRD_PARTY_POSTAL_CODE_FIELD] = "100";
    next[FV.THIRD_PARTY_COUNTRY_CODE_FIELD] = FV.OMAN_COUNTRY_CODE;
  }

  if (has(FV.TXN_IMPORT_OF_SERVICES_RCM)) {
    next[FV.SELLER_COUNTRY_CODE_FIELD] = FV.UAE_COUNTRY_CODE;
    next[FV.BUYER_VAT_IDENTIFIER_FIELD] = FV.IBR_003_VALID_BUYER_VATIN;
    next[FV.BUYER_COUNTRY_CODE_FIELD] = FV.OMAN_COUNTRY_CODE;
  }

  if (has(FV.TXN_PROFIT_MARGIN_INVOICE)) {
    next[FV.PRECEDING_INVOICE_REFERENCE_FIELD] = "PREV-OMN-001";
    next[FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD] = "2026-06-01";
    next[FV.PRECEDING_INVOICE_UUID_FIELD] = FV.PRECEDING_INVOICE_UUID_SAMPLE;
    next[FV.PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD] =
      FV.PROFIT_MARGIN_ITEM_TYPE_SAMPLE;
  }

  if (has(FV.TXN_PROFIT_MARGIN_SELF_INVOICE)) {
    next[FV.TAX_CATEGORY_FIELD] = FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE;
    next[FV.INVOICED_ITEM_TAX_RATE_FIELD] = "";
    next[FV.TAX_EXEMPTION_REASON_CODE_FIELD] = "";
    next[FV.LINE_ITEM_VAT_AMOUNT_FIELD] = "0";
    next[FV.SELLER_COUNTRY_CODE_FIELD] = FV.OMAN_COUNTRY_CODE;
    next[FV.PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD] =
      FV.PROFIT_MARGIN_ITEM_TYPE_SAMPLE;
  }

  if (has(FV.TXN_IMPORT_OF_GOODS)) {
    next[FV.ITEM_COUNTRY_OF_ORIGIN_FIELD] = FV.UAE_COUNTRY_CODE;
    next[FV.IMPORT_DATE_FIELD] = "2026-01-10";
    next[FV.CUSTOMS_DECLARATION_NUMBER_FIELD] = "CD-COND-001";
    next[FV.INCOTERMS_FIELD] = "Free On Board";
  }

  if (has(FV.TXN_SPECIAL_ZONE_SUPPLIES)) {
    next = applySpecialZoneCountrySubdivisions(next);
  }

  if (has(FV.TXN_ECOMMERCE_TRANSACTION)) {
    next = applyOmanDeliveryOverlay(next, "domestic");
  }

  if (has(FV.TXN_EXPORT_INVOICE)) {
    next = applyOmanDeliveryOverlay(next, "export");
  }

  return next;
}

/**
 * IBR-142-OM … IBR-149-OM: subject vs named partner on BTOM-001.
 * Excel cell is Master description(s) only (never Peppol 0/1 codes).
 * Companions avoid sibling rules masking the exclusion.
 */
export function buildTxnPairExclusionScenarioRow(
  scenario: FV.TxnPairExclusionScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const actualTxn = toInvoiceTxnExcelDescription(
    scenario.invoiceTransactionTypeCode
  );
  const partner = scenario.conflictingTxnType;
  const labels = collectTxnMasterLabels(actualTxn, partner);
  let row: Record<string, string | null> = {
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: actualTxn,
  };
  row = applyTxnExclusionCompanions(row, labels);
  const identifierTxn = pickIdentifierTxnLabel(
    labels,
    partner || actualTxn
  );
  row = applyPartyIdentifiersByTxnType({
    ...row,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: identifierTxn,
  });
  row[FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD] = actualTxn;
  return applyTxnExclusionInvoiceType(row, scenario.invoiceTypeCode);
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

/** IBR-042-OM: IBG-21 amount present (IBT-104 has no distinct Covoro column). */
export function buildDocumentChargeReasonScenarioRow(
  scenario: FV.DocumentChargeReasonScenario
): Record<string, string | null> {
  return buildDocumentAllowanceChargeVatScenarioRow({
    ...scenario,
    kind: "charge",
    exemptionReason: "",
  });
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

/** ALIGNED-IBRP-E/O/S/Z-01-OM: VAT breakdown via line Tax Category (IBT-118 proxy). */
export function buildVatBreakdownCategoryPresenceScenarioRow(
  scenario: FV.VatBreakdownCategoryPresenceScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const source = scenario.source ?? "line";
  const breakdownMatches = scenario.breakdownMatches ?? true;
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
  const applyLineCategory = source === "line" || breakdownMatches;
  // S-01 mismatch cannot keep a Standard line — that would set IBT-118 = S.
  const mismatchStandard =
    !applyLineCategory &&
    scenario.taxCategory === FV.STANDARD_TAX_CATEGORY_CODE;
  const lineCategory = applyLineCategory
    ? scenario.taxCategory
    : mismatchStandard
      ? FV.ZERO_RATED_TAX_CATEGORY_CODE
      : FV.STANDARD_TAX_CATEGORY_CODE;
  const lineRate = applyLineCategory
    ? resolveTaxRate(scenario.taxRate)
    : mismatchStandard
      ? resolveTaxRate(FV.TAX_RATE_ZERO)
      : resolveTaxRate(scenario.taxRate ?? FV.TAX_RATE_STANDARD_OMAN);
  const lineExemption = applyLineCategory
    ? exemption
    : mismatchStandard
      ? FV.TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE
      : "";
  const row: Record<string, string | null> = {
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]:
      scenario.invoiceTransactionTypeCode,
    [FV.TAX_CATEGORY_FIELD]: lineCategory,
    [FV.INVOICED_ITEM_TAX_RATE_FIELD]: lineRate,
    [FV.TAX_EXEMPTION_REASON_CODE_FIELD]: lineExemption,
  };
  if (source === "allowance") {
    row[FV.ALLOWANCES_ON_DOCUMENT_LEVEL_FIELD] = "50";
    row[FV.VAT_CATEGORY_ALLOWANCES_FIELD] = scenario.taxCategory;
    row[FV.TAX_EXEMPTION_REASON_ALLOWANCES_FIELD] = exemption;
  } else if (source === "charge") {
    row[FV.CHARGES_ON_DOCUMENT_LEVEL_FIELD] = "100";
    row[FV.VAT_CATEGORY_CHARGES_FIELD] = scenario.taxCategory;
    row[FV.TAX_EXEMPTION_REASON_CHARGES_FIELD] = exemption;
  }
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
  const txn = scenario.invoiceTransactionTypeCode;
  let row: Record<string, string | null> = {
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: txn,
    [FV.TAX_CATEGORY_FIELD]: scenario.taxCategory,
    [FV.INVOICED_ITEM_TAX_RATE_FIELD]: resolveTaxRate(scenario.taxRate),
    [FV.TAX_EXEMPTION_REASON_CODE_FIELD]:
      scenario.taxExemptionReasonCode ?? "",
    [FV.LINE_ITEM_VAT_AMOUNT_FIELD]: scenario.lineItemVatAmount,
  };
  // Commercial invoice cannot contain only E/O lines — keep Exempt on out-of-scope type.
  if (scenario.taxCategory === FV.EXEMPT_FROM_TAX_TAX_CATEGORY_CODE) {
    row[FV.INVOICE_TYPE_CODE_FIELD] =
      FV.INVOICE_TYPE_CODE_INVOICE_OUT_OF_SCOPE_OF_TAX;
  }
  row = applyTxnExclusionCompanions(row, [txn]);
  if (txn === FV.TXN_PROFIT_MARGIN_INVOICE) {
    row[FV.TOTAL_AMOUNT_DUE_PROFIT_MARGIN_FIELD] = "1000";
  }
  row = applyPartyIdentifiersByTxnType(row);
  if (txn === FV.TXN_SIMPLIFIED_TAX_INVOICE) {
    row[FV.ITEM_TYPE_FIELD] = "";
    row[FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD] = "";
    row[FV.INDUSTRIAL_CLASSIFICATION_CODE_FIELD] = "";
  }
  row = applyTxnExclusionInvoiceType(row, scenario.invoiceTypeCode);
  // Re-apply BTOM-016 after companions (PM Self would otherwise force 0).
  row[FV.LINE_ITEM_VAT_AMOUNT_FIELD] = scenario.lineItemVatAmount;
  return row;
}

export function buildLineItemVatAmountZeroScenarioRow(
  scenario: FV.LineItemVatAmountZeroScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const txn = scenario.invoiceTransactionTypeCode;
  let row: Record<string, string | null> = {
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: txn,
    [FV.TAX_CATEGORY_FIELD]: scenario.taxCategory,
    [FV.INVOICED_ITEM_TAX_RATE_FIELD]: resolveTaxRate(scenario.taxRate),
    [FV.TAX_EXEMPTION_REASON_CODE_FIELD]:
      scenario.taxExemptionReasonCode ?? "",
    [FV.LINE_ITEM_VAT_AMOUNT_FIELD]: scenario.lineItemVatAmount,
  };
  // Commercial invoice cannot contain only E/O lines — keep Exempt on out-of-scope type.
  if (scenario.taxCategory === FV.EXEMPT_FROM_TAX_TAX_CATEGORY_CODE) {
    row[FV.INVOICE_TYPE_CODE_FIELD] =
      FV.INVOICE_TYPE_CODE_INVOICE_OUT_OF_SCOPE_OF_TAX;
  }
  row = applyTxnExclusionCompanions(row, [txn]);
  if (txn === FV.TXN_PROFIT_MARGIN_INVOICE) {
    row[FV.TOTAL_AMOUNT_DUE_PROFIT_MARGIN_FIELD] = "1000";
  }
  row = applyPartyIdentifiersByTxnType(row);
  if (txn === FV.TXN_SIMPLIFIED_TAX_INVOICE) {
    row[FV.ITEM_TYPE_FIELD] = "";
    row[FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD] = "";
    row[FV.INDUSTRIAL_CLASSIFICATION_CODE_FIELD] = "";
  }
  row = applyTxnExclusionInvoiceType(row, scenario.invoiceTypeCode);
  row[FV.LINE_ITEM_VAT_AMOUNT_FIELD] = scenario.lineItemVatAmount;
  return row;
}

export function buildVatCategoryTaxAmountE09ScenarioRow(
  scenario: FV.VatCategoryTaxAmountE09Scenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const txn = scenario.invoiceTransactionTypeCode;
  let row: Record<string, string | null> = {
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: txn,
    [FV.TAX_CATEGORY_FIELD]: scenario.taxCategory,
    [FV.INVOICED_ITEM_TAX_RATE_FIELD]: resolveTaxRate(scenario.taxRate),
    [FV.TAX_EXEMPTION_REASON_CODE_FIELD]:
      scenario.taxExemptionReasonCode ?? "",
    [FV.INVOICE_TOTAL_TAX_AMOUNT_FIELD]: scenario.vatCategoryTaxAmount,
  };
  // Commercial invoice cannot contain only E lines — keep Exempt on out-of-scope type.
  if (scenario.taxCategory === FV.EXEMPT_FROM_TAX_TAX_CATEGORY_CODE) {
    row[FV.INVOICE_TYPE_CODE_FIELD] =
      FV.INVOICE_TYPE_CODE_INVOICE_OUT_OF_SCOPE_OF_TAX;
  }

  if (txn === FV.TXN_THIRD_PARTY_INVOICE) {
    row[FV.THIRD_PARTY_NAME_FIELD] = "Oman Third Party LLC";
    row[FV.THIRD_PARTY_VATIN_FIELD] = FV.IBR_003_VALID_THIRD_PARTY_VATIN;
    row[FV.THIRD_PARTY_ADDRESS_LINE_1_FIELD] = "TP Building 1";
    row[FV.THIRD_PARTY_ADDRESS_LINE_2_FIELD] = "TP Street";
    row[FV.THIRD_PARTY_ADDRESS_LINE_3_FIELD] = "TP Area";
    row[FV.THIRD_PARTY_CITY_FIELD] = "Muscat";
    row[FV.THIRD_PARTY_POSTAL_CODE_FIELD] = "100";
    row[FV.THIRD_PARTY_COUNTRY_CODE_FIELD] = FV.OMAN_COUNTRY_CODE;
  }

  if (txn === FV.TXN_SUMMARY_INVOICE || txn === FV.TXN_CONTINUOUS_SUPPLY) {
    row[FV.INVOICING_PERIOD_START_DATE_FIELD] = "2026-01-01";
    row[FV.INVOICING_PERIOD_END_DATE_FIELD] = "2026-01-31";
  }

  if (txn === FV.TXN_EXPORT_INVOICE) {
    row = applyOmanDeliveryOverlay(row, "export");
  }

  if (txn === FV.TXN_ECOMMERCE_TRANSACTION) {
    row = applyOmanDeliveryOverlay(row, "domestic");
  }

  if (txn === FV.TXN_IMPORT_OF_GOODS) {
    row[FV.ITEM_COUNTRY_OF_ORIGIN_FIELD] = FV.UAE_COUNTRY_CODE;
    row[FV.IMPORT_DATE_FIELD] = "2026-01-10";
    row[FV.CUSTOMS_DECLARATION_NUMBER_FIELD] = "CD-COND-001";
    row[FV.INCOTERMS_FIELD] = "Free On Board";
  }

  if (txn === FV.TXN_IMPORT_OF_SERVICES_RCM) {
    row[FV.SELLER_COUNTRY_CODE_FIELD] = FV.UAE_COUNTRY_CODE;
    row[FV.BUYER_VAT_IDENTIFIER_FIELD] = FV.IBR_003_VALID_BUYER_VATIN;
    row[FV.BUYER_COUNTRY_CODE_FIELD] = FV.OMAN_COUNTRY_CODE;
  }

  if (txn === FV.TXN_PROFIT_MARGIN_INVOICE) {
    // Keep scenario Exempt category (do not force O). PM companions still required.
    row[FV.PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD] =
      FV.PROFIT_MARGIN_ITEM_TYPE_SAMPLE;
    row[FV.PRECEDING_INVOICE_REFERENCE_FIELD] = "PREV-OMN-001";
    row[FV.PRECEDING_INVOICE_UUID_FIELD] = FV.PRECEDING_INVOICE_UUID_SAMPLE;
    row[FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD] = "2026-06-01";
    row[FV.TOTAL_AMOUNT_DUE_PROFIT_MARGIN_FIELD] = "1000";
  }

  if (txn === FV.TXN_SPECIAL_ZONE_SUPPLIES) {
    row = applySpecialZoneCountrySubdivisions(row);
  }

  row = applyPartyIdentifiersByTxnType(row);

  if (txn === FV.TXN_SIMPLIFIED_TAX_INVOICE) {
    row[FV.ITEM_TYPE_FIELD] = "";
    row[FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD] = "";
    row[FV.INDUSTRIAL_CLASSIFICATION_CODE_FIELD] = "";
  }

  // Re-apply IBT-117 proxy after companions so seed/default totals cannot win.
  row[FV.INVOICE_TOTAL_TAX_AMOUNT_FIELD] = scenario.vatCategoryTaxAmount;
  return row;
}

export function buildVatCategoryTaxAmountO09ScenarioRow(
  scenario: FV.VatCategoryTaxAmountO09Scenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const txn = scenario.invoiceTransactionTypeCode;
  let row: Record<string, string | null> = {
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: txn,
    [FV.TAX_CATEGORY_FIELD]: scenario.taxCategory,
    [FV.INVOICED_ITEM_TAX_RATE_FIELD]: resolveTaxRate(scenario.taxRate),
    [FV.TAX_EXEMPTION_REASON_CODE_FIELD]:
      scenario.taxExemptionReasonCode ?? "",
    [FV.INVOICE_TOTAL_TAX_AMOUNT_FIELD]: scenario.vatCategoryTaxAmount,
  };
  // Commercial invoice cannot contain only O lines — keep Not subject on out-of-scope type.
  if (scenario.taxCategory === FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE) {
    row[FV.INVOICE_TYPE_CODE_FIELD] =
      FV.INVOICE_TYPE_CODE_INVOICE_OUT_OF_SCOPE_OF_TAX;
  }

  if (txn === FV.TXN_THIRD_PARTY_INVOICE) {
    row[FV.THIRD_PARTY_NAME_FIELD] = "Oman Third Party LLC";
    row[FV.THIRD_PARTY_VATIN_FIELD] = FV.IBR_003_VALID_THIRD_PARTY_VATIN;
    row[FV.THIRD_PARTY_ADDRESS_LINE_1_FIELD] = "TP Building 1";
    row[FV.THIRD_PARTY_ADDRESS_LINE_2_FIELD] = "TP Street";
    row[FV.THIRD_PARTY_ADDRESS_LINE_3_FIELD] = "TP Area";
    row[FV.THIRD_PARTY_CITY_FIELD] = "Muscat";
    row[FV.THIRD_PARTY_POSTAL_CODE_FIELD] = "100";
    row[FV.THIRD_PARTY_COUNTRY_CODE_FIELD] = FV.OMAN_COUNTRY_CODE;
  }

  if (txn === FV.TXN_SUMMARY_INVOICE || txn === FV.TXN_CONTINUOUS_SUPPLY) {
    row[FV.INVOICING_PERIOD_START_DATE_FIELD] = "2026-01-01";
    row[FV.INVOICING_PERIOD_END_DATE_FIELD] = "2026-01-31";
  }

  if (txn === FV.TXN_EXPORT_INVOICE) {
    row = applyOmanDeliveryOverlay(row, "export");
  }

  if (txn === FV.TXN_ECOMMERCE_TRANSACTION) {
    row = applyOmanDeliveryOverlay(row, "domestic");
  }

  if (txn === FV.TXN_IMPORT_OF_GOODS) {
    row[FV.ITEM_COUNTRY_OF_ORIGIN_FIELD] = FV.UAE_COUNTRY_CODE;
    row[FV.IMPORT_DATE_FIELD] = "2026-01-10";
    row[FV.CUSTOMS_DECLARATION_NUMBER_FIELD] = "CD-COND-001";
    row[FV.INCOTERMS_FIELD] = "Free On Board";
  }

  if (txn === FV.TXN_IMPORT_OF_SERVICES_RCM) {
    row[FV.SELLER_COUNTRY_CODE_FIELD] = FV.UAE_COUNTRY_CODE;
    row[FV.BUYER_VAT_IDENTIFIER_FIELD] = FV.IBR_003_VALID_BUYER_VATIN;
    row[FV.BUYER_COUNTRY_CODE_FIELD] = FV.OMAN_COUNTRY_CODE;
  }

  if (txn === FV.TXN_PROFIT_MARGIN_INVOICE) {
    row[FV.PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD] =
      FV.PROFIT_MARGIN_ITEM_TYPE_SAMPLE;
    row[FV.PRECEDING_INVOICE_REFERENCE_FIELD] = "PREV-OMN-001";
    row[FV.PRECEDING_INVOICE_UUID_FIELD] = FV.PRECEDING_INVOICE_UUID_SAMPLE;
    row[FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD] = "2026-06-01";
    row[FV.TOTAL_AMOUNT_DUE_PROFIT_MARGIN_FIELD] = "1000";
  }

  if (txn === FV.TXN_PROFIT_MARGIN_SELF_INVOICE) {
    // IBR-086/087-OM + CL-11-OM companions (O is required for PM Self).
    row[FV.TAX_CATEGORY_FIELD] = FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE;
    row[FV.INVOICED_ITEM_TAX_RATE_FIELD] = null;
    row[FV.TAX_EXEMPTION_REASON_CODE_FIELD] = "";
    row[FV.TAX_EXEMPTION_REASON_TEXT_FIELD] = "";
    row[FV.LINE_ITEM_VAT_AMOUNT_FIELD] = "0";
    row[FV.PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD] =
      FV.PROFIT_MARGIN_ITEM_TYPE_SAMPLE;
    row[FV.SELLER_COUNTRY_CODE_FIELD] = FV.OMAN_COUNTRY_CODE;
  }

  if (txn === FV.TXN_SPECIAL_ZONE_SUPPLIES) {
    row = applySpecialZoneCountrySubdivisions(row);
  }

  row = applyPartyIdentifiersByTxnType(row);

  if (txn === FV.TXN_SIMPLIFIED_TAX_INVOICE) {
    row[FV.ITEM_TYPE_FIELD] = "";
    row[FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD] = "";
    row[FV.INDUSTRIAL_CLASSIFICATION_CODE_FIELD] = "";
  }

  // Re-apply IBT-117 proxy after companions so seed/default totals cannot win.
  row[FV.INVOICE_TOTAL_TAX_AMOUNT_FIELD] = scenario.vatCategoryTaxAmount;
  return row;
}

export function buildVatCategoryTaxAmountZ09ScenarioRow(
  scenario: FV.VatCategoryTaxAmountZ09Scenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const txn = scenario.invoiceTransactionTypeCode;
  let row: Record<string, string | null> = {
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: txn,
    [FV.TAX_CATEGORY_FIELD]: scenario.taxCategory,
    [FV.INVOICED_ITEM_TAX_RATE_FIELD]: resolveTaxRate(scenario.taxRate),
    [FV.TAX_EXEMPTION_REASON_CODE_FIELD]:
      scenario.taxExemptionReasonCode ?? "",
    [FV.INVOICE_TOTAL_TAX_AMOUNT_FIELD]: scenario.vatCategoryTaxAmount,
  };

  if (txn === FV.TXN_THIRD_PARTY_INVOICE) {
    row[FV.THIRD_PARTY_NAME_FIELD] = "Oman Third Party LLC";
    row[FV.THIRD_PARTY_VATIN_FIELD] = FV.IBR_003_VALID_THIRD_PARTY_VATIN;
    row[FV.THIRD_PARTY_ADDRESS_LINE_1_FIELD] = "TP Building 1";
    row[FV.THIRD_PARTY_ADDRESS_LINE_2_FIELD] = "TP Street";
    row[FV.THIRD_PARTY_ADDRESS_LINE_3_FIELD] = "TP Area";
    row[FV.THIRD_PARTY_CITY_FIELD] = "Muscat";
    row[FV.THIRD_PARTY_POSTAL_CODE_FIELD] = "100";
    row[FV.THIRD_PARTY_COUNTRY_CODE_FIELD] = FV.OMAN_COUNTRY_CODE;
  }

  if (txn === FV.TXN_SUMMARY_INVOICE || txn === FV.TXN_CONTINUOUS_SUPPLY) {
    row[FV.INVOICING_PERIOD_START_DATE_FIELD] = "2026-01-01";
    row[FV.INVOICING_PERIOD_END_DATE_FIELD] = "2026-01-31";
  }

  if (txn === FV.TXN_EXPORT_INVOICE) {
    row = applyOmanDeliveryOverlay(row, "export");
  }

  if (txn === FV.TXN_ECOMMERCE_TRANSACTION) {
    row = applyOmanDeliveryOverlay(row, "domestic");
  }

  if (txn === FV.TXN_IMPORT_OF_GOODS) {
    row[FV.ITEM_COUNTRY_OF_ORIGIN_FIELD] = FV.UAE_COUNTRY_CODE;
    row[FV.IMPORT_DATE_FIELD] = "2026-01-10";
    row[FV.CUSTOMS_DECLARATION_NUMBER_FIELD] = "CD-COND-001";
    row[FV.INCOTERMS_FIELD] = "Free On Board";
  }

  if (txn === FV.TXN_IMPORT_OF_SERVICES_RCM) {
    row[FV.SELLER_COUNTRY_CODE_FIELD] = FV.UAE_COUNTRY_CODE;
    row[FV.BUYER_VAT_IDENTIFIER_FIELD] = FV.IBR_003_VALID_BUYER_VATIN;
    row[FV.BUYER_COUNTRY_CODE_FIELD] = FV.OMAN_COUNTRY_CODE;
  }

  if (txn === FV.TXN_PROFIT_MARGIN_INVOICE) {
    // Keep scenario Zero rated category (do not force O). PM companions still required.
    row[FV.PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD] =
      FV.PROFIT_MARGIN_ITEM_TYPE_SAMPLE;
    row[FV.PRECEDING_INVOICE_REFERENCE_FIELD] = "PREV-OMN-001";
    row[FV.PRECEDING_INVOICE_UUID_FIELD] = FV.PRECEDING_INVOICE_UUID_SAMPLE;
    row[FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD] = "2026-06-01";
    row[FV.TOTAL_AMOUNT_DUE_PROFIT_MARGIN_FIELD] = "1000";
  }

  if (txn === FV.TXN_SPECIAL_ZONE_SUPPLIES) {
    row = applySpecialZoneCountrySubdivisions(row);
  }

  row = applyPartyIdentifiersByTxnType(row);

  if (txn === FV.TXN_SIMPLIFIED_TAX_INVOICE) {
    row[FV.ITEM_TYPE_FIELD] = "";
    row[FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD] = "";
    row[FV.INDUSTRIAL_CLASSIFICATION_CODE_FIELD] = "";
  }

  // Re-apply IBT-117 proxy after companions so seed/default totals cannot win.
  row[FV.INVOICE_TOTAL_TAX_AMOUNT_FIELD] = scenario.vatCategoryTaxAmount;
  return row;
}

/** Prefer buildTxnPairExclusionScenarioRow for IBR-142–149 live scenarios. */
export function buildTxnMutualExclusionScenarioRow(
  scenario: FV.TxnMutualExclusionScenario
): Record<string, string | null> {
  return buildTxnPairExclusionScenarioRow({
    ...scenario,
    conflictingTxnType: "",
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
  if (scenario.invoiceTransactionTypeCode === FV.TXN_IMPORT_OF_SERVICES_RCM) {
    // IBR-160-OM: seller country must not be OM. IBR-017/020: buyer VATIN + OM.
    row[FV.SELLER_COUNTRY_CODE_FIELD] = FV.UAE_COUNTRY_CODE;
    row[FV.BUYER_VAT_IDENTIFIER_FIELD] = FV.IBR_003_VALID_BUYER_VATIN;
    row[FV.BUYER_COUNTRY_CODE_FIELD] = FV.OMAN_COUNTRY_CODE;
  }
  if (scenario.invoiceTransactionTypeCode === FV.TXN_PROFIT_MARGIN_SELF_INVOICE) {
    // IBR-086/087-OM + CL-11-OM companions so empty Seller VATIN is the only IBR-006 probe.
    row[FV.TAX_CATEGORY_FIELD] = FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE;
    row[FV.INVOICED_ITEM_TAX_RATE_FIELD] = null;
    row[FV.TAX_EXEMPTION_REASON_CODE_FIELD] = "";
    row[FV.TAX_EXEMPTION_REASON_TEXT_FIELD] = "";
    row[FV.LINE_ITEM_VAT_AMOUNT_FIELD] = "0";
    row[FV.PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD] = FV.PROFIT_MARGIN_ITEM_TYPE_SAMPLE;
    row[FV.SELLER_COUNTRY_CODE_FIELD] = FV.OMAN_COUNTRY_CODE;
  }
  return applyPartyIdentifiersByTxnType(row);
}

/** IBR-007-OM: named txn types require Seller identifier + scheme; textual alone errors. */
export function buildSellerIdentifierSchemeScenarioRow(
  scenario: FV.SellerIdentifierSchemeScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const txn = scenario.invoiceTransactionTypeCode;
  const schemeLabel = masterLabelIncluding(
    schemeIdentifierValidTestData,
    "Oman Value Added Tax",
    "Oman Value Added Tax Identification Number (VATIN) (OM:VAT) - Issuing agency: Tax Authority, Oman."
  );
  const codeLabel = masterLabelIncluding(
    buyerSellerIdentifierCodeValidTestData,
    "Tax Identification",
    "Tax Identification Number"
  );
  const row: Record<string, string | null> = {
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: txn,
  };
  if (txn === FV.TXN_IMPORT_OF_GOODS) {
    row[FV.ITEM_COUNTRY_OF_ORIGIN_FIELD] = FV.UAE_COUNTRY_CODE;
    row[FV.IMPORT_DATE_FIELD] = "2026-01-10";
    row[FV.CUSTOMS_DECLARATION_NUMBER_FIELD] = "CD-COND-001";
    row[FV.INCOTERMS_FIELD] = "Free On Board";
  }
  if (txn === FV.TXN_IMPORT_OF_SERVICES_RCM) {
    // IBR-160-OM: seller country must not be OM. IBR-017/020: buyer VATIN + OM.
    row[FV.SELLER_COUNTRY_CODE_FIELD] = FV.UAE_COUNTRY_CODE;
    row[FV.BUYER_VAT_IDENTIFIER_FIELD] = FV.IBR_003_VALID_BUYER_VATIN;
    row[FV.BUYER_COUNTRY_CODE_FIELD] = FV.OMAN_COUNTRY_CODE;
  }
  if (txn === FV.TXN_PROFIT_MARGIN_SELF_INVOICE) {
    // IBR-086/087-OM + CL-11-OM companions so scheme+ID is the only IBR-007 probe.
    row[FV.TAX_CATEGORY_FIELD] = FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE;
    row[FV.INVOICED_ITEM_TAX_RATE_FIELD] = null;
    row[FV.TAX_EXEMPTION_REASON_CODE_FIELD] = "";
    row[FV.TAX_EXEMPTION_REASON_TEXT_FIELD] = "";
    row[FV.LINE_ITEM_VAT_AMOUNT_FIELD] = "0";
    row[FV.PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD] = FV.PROFIT_MARGIN_ITEM_TYPE_SAMPLE;
    row[FV.SELLER_COUNTRY_CODE_FIELD] = FV.OMAN_COUNTRY_CODE;
  }
  let next = applyPartyIdentifiersByTxnType(row);
  if (txn === FV.TXN_SPECIAL_ZONE_SUPPLIES) {
    next = applySpecialZoneCountrySubdivisions(next);
  }
  // IBR-007 probe: set scheme / textual / ID from scenario (override txn overlays).
  next[FV.SELLER_IDENTIFIER_SCHEME_FIELD] =
    scenario.sellerCompanion === "scheme" ? schemeLabel : "";
  next[FV.SELLER_IDENTIFIER_TEXTUAL_CODE_FIELD] =
    scenario.sellerCompanion === "code"
      ? txn === FV.TXN_SPECIAL_ZONE_SUPPLIES
        ? FV.SPECIAL_ZONE_LICENSE_SCHEME
        : codeLabel
      : "";
  next[FV.SELLER_IDENTIFIER_FIELD] = scenario.sellerIdentifierProvided
    ? txn === FV.TXN_SPECIAL_ZONE_SUPPLIES
      ? "SZ-SELLER-001"
      : "OM-SELLER-001"
    : "";
  return next;
}

export function buildBuyerIdOrVatinScenarioRow(
  scenario: FV.BuyerIdOrVatinScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const txn = scenario.invoiceTransactionTypeCode;
  let row: Record<string, string | null> = {
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: txn,
    [FV.BUYER_VAT_IDENTIFIER_FIELD]: scenario.buyerVatIdentifier,
  };

  if (txn === FV.TXN_THIRD_PARTY_INVOICE) {
    row[FV.THIRD_PARTY_NAME_FIELD] = "Oman Third Party LLC";
    row[FV.THIRD_PARTY_VATIN_FIELD] = FV.IBR_003_VALID_THIRD_PARTY_VATIN;
    row[FV.THIRD_PARTY_ADDRESS_LINE_1_FIELD] = "TP Building 1";
    row[FV.THIRD_PARTY_ADDRESS_LINE_2_FIELD] = "TP Street";
    row[FV.THIRD_PARTY_ADDRESS_LINE_3_FIELD] = "TP Area";
    row[FV.THIRD_PARTY_CITY_FIELD] = "Muscat";
    row[FV.THIRD_PARTY_POSTAL_CODE_FIELD] = "100";
    row[FV.THIRD_PARTY_COUNTRY_CODE_FIELD] = FV.OMAN_COUNTRY_CODE;
  }

  if (txn === FV.TXN_SUMMARY_INVOICE || txn === FV.TXN_CONTINUOUS_SUPPLY) {
    row[FV.INVOICING_PERIOD_START_DATE_FIELD] = "2026-01-01";
    row[FV.INVOICING_PERIOD_END_DATE_FIELD] = "2026-01-31";
  }

  if (txn === FV.TXN_EXPORT_INVOICE) {
    row = applyOmanDeliveryOverlay(row, "export");
  }

  if (txn === FV.TXN_ECOMMERCE_TRANSACTION) {
    row = applyOmanDeliveryOverlay(row, "domestic");
  }

  if (txn === FV.TXN_PROFIT_MARGIN_INVOICE) {
    row[FV.TAX_CATEGORY_FIELD] = FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE;
    row[FV.INVOICED_ITEM_TAX_RATE_FIELD] = "";
    row[FV.TAX_EXEMPTION_REASON_CODE_FIELD] = "";
    row[FV.LINE_ITEM_VAT_AMOUNT_FIELD] = "0";
    row[FV.PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD] =
      FV.PROFIT_MARGIN_ITEM_TYPE_SAMPLE;
    row[FV.PRECEDING_INVOICE_REFERENCE_FIELD] = "PREV-OMN-001";
    row[FV.PRECEDING_INVOICE_UUID_FIELD] = FV.PRECEDING_INVOICE_UUID_SAMPLE;
    row[FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD] = "2026-06-01";
    row[FV.TOTAL_AMOUNT_DUE_PROFIT_MARGIN_FIELD] = "1050";
  }

  row = applyPartyIdentifiersByTxnType(row);
  // Scenario buyer id / VATIN win (either-or polarities, including both empty).
  row[FV.BUYER_IDENTIFIER_FIELD] = scenario.buyerIdentifier;
  row[FV.BUYER_VAT_IDENTIFIER_FIELD] = scenario.buyerVatIdentifier;
  return row;
}

/** IBR-010-OM: write the Seller postal address group (complete or one field omitted). */
export function buildSellerAddressRequiredScenarioRow(
  scenario: FV.SellerAddressRequiredScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  return applyPartyIdentifiersByTxnType({
    ...seed,
    [FV.SELLER_ADDRESS_LINE_1_FIELD]: scenario.addressLine1,
    [FV.SELLER_ADDRESS_LINE_2_FIELD]: scenario.addressLine2,
    [FV.SELLER_ADDRESS_LINE_3_FIELD]: scenario.addressLine3,
    [FV.SELLER_CITY_FIELD]: scenario.city,
    [FV.SELLER_POST_CODE_FIELD]: scenario.postCode,
  });
}

/** IBR-015-OM: Third-party Invoice + third-party party block (or one field omitted). */
export function buildThirdPartyRequiredScenarioRow(
  scenario: FV.ThirdPartyRequiredScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  return applyPartyIdentifiersByTxnType({
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]:
      scenario.invoiceTransactionTypeCode,
    [FV.THIRD_PARTY_NAME_FIELD]: scenario.thirdPartyName,
    [FV.THIRD_PARTY_VATIN_FIELD]: scenario.thirdPartyVatin,
    [FV.THIRD_PARTY_ADDRESS_LINE_1_FIELD]: scenario.addressLine1,
    [FV.THIRD_PARTY_ADDRESS_LINE_2_FIELD]: scenario.addressLine2,
    [FV.THIRD_PARTY_ADDRESS_LINE_3_FIELD]: scenario.addressLine3,
    [FV.THIRD_PARTY_CITY_FIELD]: scenario.city,
    [FV.THIRD_PARTY_POSTAL_CODE_FIELD]: scenario.postalCode,
    [FV.THIRD_PARTY_COUNTRY_CODE_FIELD]: scenario.countryCode,
  });
}

/** IBR-019-OM: txn companions matching submit / dropdown sweeps. */
function applyIbr019TxnDependents(
  row: Record<string, string | null>,
  txn: string
): Record<string, string | null> {
  let next: Record<string, string | null> = { ...row };

  if (txn === FV.TXN_THIRD_PARTY_INVOICE) {
    next[FV.THIRD_PARTY_NAME_FIELD] = "Oman Third Party LLC";
    next[FV.THIRD_PARTY_VATIN_FIELD] = FV.IBR_003_VALID_THIRD_PARTY_VATIN;
    next[FV.THIRD_PARTY_ADDRESS_LINE_1_FIELD] = "TP Building 1";
    next[FV.THIRD_PARTY_ADDRESS_LINE_2_FIELD] = "TP Street";
    next[FV.THIRD_PARTY_ADDRESS_LINE_3_FIELD] = "TP Area";
    next[FV.THIRD_PARTY_CITY_FIELD] = "Muscat";
    next[FV.THIRD_PARTY_POSTAL_CODE_FIELD] = "100";
    next[FV.THIRD_PARTY_COUNTRY_CODE_FIELD] = FV.OMAN_COUNTRY_CODE;
  }

  if (txn === FV.TXN_SUMMARY_INVOICE) {
    next[FV.INVOICING_PERIOD_START_DATE_FIELD] = "2026-01-01";
    next[FV.INVOICING_PERIOD_END_DATE_FIELD] = "2026-01-31";
  }

  if (txn === FV.TXN_EXPORT_INVOICE) {
    const exportExemption =
      FV.ZERO_RATED_EXEMPTION_REASON_LABELS.find((label) =>
        label.includes("Direct Export of Goods")
      ) ?? FV.TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE;
    next[FV.TAX_CATEGORY_FIELD] = FV.ZERO_RATED_TAX_CATEGORY_CODE;
    next[FV.INVOICED_ITEM_TAX_RATE_FIELD] = FV.TAX_RATE_ZERO;
    next[FV.TAX_EXEMPTION_REASON_CODE_FIELD] = exportExemption;
    next[FV.TAX_EXEMPTION_REASON_TEXT_FIELD] = exportExemption;
    next[FV.LINE_ITEM_VAT_AMOUNT_FIELD] = "0";
    next[FV.ITEM_TYPE_FIELD] = FV.ITEM_TYPE_GOODS;
    next[FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD] = FV.OMAN_HS_CODE_12;
    next[FV.SERVICE_TYPE_CODE_FIELD] = "";
    next = applyOmanDeliveryOverlay(next, "export");
  }

  if (txn === FV.TXN_IMPORT_OF_GOODS) {
    next[FV.ITEM_COUNTRY_OF_ORIGIN_FIELD] = FV.UAE_COUNTRY_CODE;
    next[FV.IMPORT_DATE_FIELD] = "2026-01-10";
    next[FV.CUSTOMS_DECLARATION_NUMBER_FIELD] = "CD-COND-001";
    next[FV.INCOTERMS_FIELD] = "Free On Board";
    next[FV.ITEM_TYPE_FIELD] = FV.ITEM_TYPE_GOODS;
    next[FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD] = FV.OMAN_HS_CODE_12;
    next[FV.SERVICE_TYPE_CODE_FIELD] = "";
  }

  if (txn === FV.TXN_IMPORT_OF_SERVICES_RCM) {
    next[FV.SELLER_COUNTRY_CODE_FIELD] = FV.UAE_COUNTRY_CODE;
    next[FV.BUYER_VAT_IDENTIFIER_FIELD] = FV.IBR_003_VALID_BUYER_VATIN;
    next[FV.BUYER_COUNTRY_CODE_FIELD] = FV.OMAN_COUNTRY_CODE;
    next[FV.ITEM_TYPE_FIELD] = FV.ITEM_TYPE_SERVICES;
    next[FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD] = "";
    next[FV.SERVICE_TYPE_CODE_FIELD] = FV.SERVICE_TYPE_CODE_SAMPLE;
  }

  if (txn === FV.TXN_PROFIT_MARGIN_INVOICE) {
    next[FV.TAX_CATEGORY_FIELD] = FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE;
    next[FV.INVOICED_ITEM_TAX_RATE_FIELD] = "";
    next[FV.TAX_EXEMPTION_REASON_CODE_FIELD] = "";
    next[FV.TAX_EXEMPTION_REASON_TEXT_FIELD] = "";
    next[FV.LINE_ITEM_VAT_AMOUNT_FIELD] = "0";
    next[FV.PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD] =
      FV.PROFIT_MARGIN_ITEM_TYPE_SAMPLE;
    next[FV.PRECEDING_INVOICE_REFERENCE_FIELD] = "PREV-OMN-001";
    next[FV.PRECEDING_INVOICE_UUID_FIELD] = FV.PRECEDING_INVOICE_UUID_SAMPLE;
    next[FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD] = "2026-06-01";
    next[FV.TOTAL_AMOUNT_DUE_PROFIT_MARGIN_FIELD] = "1050";
  }

  if (txn === FV.TXN_PROFIT_MARGIN_SELF_INVOICE) {
    next[FV.TAX_CATEGORY_FIELD] = FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE;
    next[FV.INVOICED_ITEM_TAX_RATE_FIELD] = null;
    next[FV.TAX_EXEMPTION_REASON_CODE_FIELD] = "";
    next[FV.TAX_EXEMPTION_REASON_TEXT_FIELD] = "";
    next[FV.LINE_ITEM_VAT_AMOUNT_FIELD] = "0";
    next[FV.PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD] =
      FV.PROFIT_MARGIN_ITEM_TYPE_SAMPLE;
    next[FV.SELLER_COUNTRY_CODE_FIELD] = FV.OMAN_COUNTRY_CODE;
  }

  if (txn === FV.TXN_SPECIAL_ZONE_SUPPLIES) {
    next = applySpecialZoneCountrySubdivisions(next);
  }

  return next;
}

function resolveIbr019InvoiceType(
  scenario: FV.BuyerAddressRequiredScenario
): string {
  if (scenario.invoiceTypeCode) {
    return scenario.invoiceTypeCode;
  }
  if (scenario.invoiceTransactionTypeCode === FV.TXN_SELF_BILLED_INVOICE) {
    return FV.INVOICE_TYPE_SELF_BILLED_INVOICE;
  }
  return FV.INVOICE_TYPE_COMMERCIAL_INVOICE;
}

/** IBR-019-OM: write the Buyer postal address group (complete or one field omitted). */
export function buildBuyerAddressRequiredScenarioRow(
  scenario: FV.BuyerAddressRequiredScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const txn = scenario.invoiceTransactionTypeCode;
  const invoiceTypeCode = resolveIbr019InvoiceType(scenario);
  let row: Record<string, string | null> = {
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: txn,
    [FV.INVOICE_TYPE_CODE_FIELD]: invoiceTypeCode,
  };

  row = applyIbr019TxnDependents(row, txn);
  if (
    invoiceTypeCode === FV.INVOICE_TYPE_SELF_BILLED_INVOICE ||
    invoiceTypeCode === FV.INVOICE_TYPE_SELF_BILLED_CREDIT_NOTE
  ) {
    row = applySelfBilledDocumentInvoiceType(row, invoiceTypeCode);
  }
  row = applyPartyIdentifiersByTxnType(row);

  if (isSelfBilledInvoiceType(invoiceTypeCode)) {
    const stringRow: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      stringRow[key] = value == null ? "" : String(value);
    }
    row = applySelfBilledPartyIdentitySwap(stringRow);
  }

  row[FV.BUYER_ADDRESS_LINE_1_FIELD] = scenario.addressLine1;
  row[FV.BUYER_ADDRESS_LINE_2_FIELD] = scenario.addressLine2;
  row[FV.BUYER_ADDRESS_LINE_3_FIELD] = scenario.addressLine3;
  row[FV.BUYER_CITY_FIELD] = scenario.city;
  row[FV.BUYER_POST_CODE_FIELD] = scenario.postCode;
  return row;
}

/** IBR-040-OM: write Deliver To from the scenario; invoice type companions for CN/DN. */
export function buildDeliverToAddressRequiredScenarioRow(
  scenario: FV.DeliverToAddressRequiredScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const txn = scenario.invoiceTransactionTypeCode;
  const invoiceTypeCode =
    scenario.invoiceTypeCode ?? FV.INVOICE_TYPE_COMMERCIAL_INVOICE;
  const deliverValues = [
    scenario.addressLine1,
    scenario.addressLine2,
    scenario.addressLine3,
    scenario.city,
    scenario.postCode,
    scenario.countrySubDivision,
    scenario.countryCode,
  ];
  const hasCompleteDeliverToAddress = deliverValues.every((value) =>
    String(value ?? "").trim()
  );
  // Do not call applyTxnExclusionCompanions: e-commerce overlay would refill omitted cells.
  let row: Record<string, string | null> = applyPartyIdentifiersByTxnType({
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: txn,
    [FV.INVOICE_TYPE_CODE_FIELD]: invoiceTypeCode,
  });
  row = applyTxnExclusionInvoiceType(row, invoiceTypeCode);
  row[FV.DELIVER_TO_ADDRESS_LINE_1_FIELD] = scenario.addressLine1;
  row[FV.DELIVER_TO_ADDRESS_LINE_2_FIELD] = scenario.addressLine2;
  row[FV.DELIVER_TO_ADDRESS_LINE_3_FIELD] = scenario.addressLine3;
  row[FV.DELIVER_TO_CITY_FIELD] = scenario.city;
  row[FV.DELIVER_TO_POST_CODE_FIELD] = scenario.postCode;
  row[FV.DELIVER_TO_COUNTRY_SUBDIVISION_FIELD] = scenario.countrySubDivision;
  row[FV.DELIVER_TO_COUNTRY_CODE_FIELD] = scenario.countryCode;
  row["Deliver to party name"] = hasCompleteDeliverToAddress
    ? seed["Deliver to party name"] || "Oman Delivery Partner"
    : "";
  return row;
}

export function buildInvoicingPeriodConditionalScenarioRow(
  scenario: FV.InvoicingPeriodScenario
): Record<string, string | null> {
  return buildSummaryInvoicePeriodScenarioRow(scenario);
}

/** IBR-030: line period end >= start (Excel proxies IBT-134/135 → document Invoicing Period*). */
export function buildInvoiceLinePeriodConditionalScenarioRow(
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

/** IBR-081-OM: txn companions so sibling rules do not mask the ISIC assert. */
function applyIbr081TxnCompanions(
  row: Record<string, string | null>,
  txn: string
): Record<string, string | null> {
  let next = applyTxnExclusionCompanions(
    row,
    FV.splitOmanTxnMasterLabels(txn)
  );

  if (txn === FV.TXN_PREPAYMENT_INVOICE) {
    next["Prepayment invoice number"] = "PRE-OMN-001";
    next["Prepayment invoice UUID"] = "prepay-uuid-oman-001";
  }

  if (txn === FV.TXN_SELF_BILLED_INVOICE) {
    next = applySelfBilledDocumentInvoiceType(
      next,
      FV.INVOICE_TYPE_SELF_BILLED_INVOICE
    );
    next[FV.BUYER_COUNTRY_CODE_FIELD] = FV.OMAN_COUNTRY_CODE;
  }

  if (txn === FV.TXN_EXPORT_INVOICE) {
    const exportExemption =
      FV.ZERO_RATED_EXEMPTION_REASON_LABELS.find((label) =>
        label.includes("Direct Export of Goods")
      ) ?? FV.TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE;
    next[FV.TAX_CATEGORY_FIELD] = FV.ZERO_RATED_TAX_CATEGORY_CODE;
    next[FV.INVOICED_ITEM_TAX_RATE_FIELD] = FV.TAX_RATE_ZERO;
    next[FV.TAX_EXEMPTION_REASON_CODE_FIELD] = exportExemption;
    next[FV.TAX_EXEMPTION_REASON_TEXT_FIELD] = exportExemption;
    next[FV.LINE_ITEM_VAT_AMOUNT_FIELD] = "0";
    next[FV.ITEM_TYPE_FIELD] = FV.ITEM_TYPE_GOODS;
    next[FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD] = FV.OMAN_HS_CODE_12;
    next[FV.SERVICE_TYPE_CODE_FIELD] = "";
  }

  if (txn === FV.TXN_PROFIT_MARGIN_INVOICE) {
    next[FV.TOTAL_AMOUNT_DUE_PROFIT_MARGIN_FIELD] = "1000";
  }

  return next;
}

export function buildIndustrialClassificationRequiredScenarioRow(
  scenario: FV.IndustrialClassificationRequiredScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const txn = scenario.invoiceTransactionTypeCode;
  let row: Record<string, string | null> = {
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: txn,
  };
  row = applyIbr081TxnCompanions(row, txn);
  row = applyPartyIdentifiersByTxnType(row);
  if (isSelfBilledInvoiceType(String(row[FV.INVOICE_TYPE_CODE_FIELD] ?? ""))) {
    const stringRow: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      stringRow[key] = value == null ? "" : String(value);
    }
    row = applySelfBilledPartyIdentitySwap(stringRow);
  }
  row[FV.INDUSTRIAL_CLASSIFICATION_CODE_FIELD] =
    scenario.industrialClassificationCode;
  return row;
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

/** IBR-091-OM: Profit Margin Invoice → IBT-158 MUST NOT start with banned prefixes. */
export function buildProfitMarginHsPrefixScenarioRow(
  scenario: FV.ProfitMarginHsPrefixScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  return applyPartyIdentifiersByTxnType({
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: FV.TXN_PROFIT_MARGIN_INVOICE,
    [FV.TAX_CATEGORY_FIELD]: FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
    [FV.INVOICED_ITEM_TAX_RATE_FIELD]: null,
    [FV.TAX_EXEMPTION_REASON_CODE_FIELD]: "",
    [FV.TAX_EXEMPTION_REASON_TEXT_FIELD]: "",
    [FV.LINE_ITEM_VAT_AMOUNT_FIELD]: "0",
    [FV.PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD]: FV.PROFIT_MARGIN_ITEM_TYPE_SAMPLE,
    [FV.PRECEDING_INVOICE_REFERENCE_FIELD]: "PREV-OMN-001",
    [FV.PRECEDING_INVOICE_UUID_FIELD]: FV.PRECEDING_INVOICE_UUID_SAMPLE,
    [FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD]: "2026-06-01",
    [FV.ITEM_TYPE_FIELD]: FV.ITEM_TYPE_GOODS,
    [FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD]:
      scenario.itemClassificationIdentifier,
  });
}

/** CL-11-OM: Profit Margin Invoice / Self-Invoice → BTOM-025 present + CL-11 code. */
export function buildProfitMarginItemTypeScenarioRow(
  scenario: FV.ProfitMarginItemTypeScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const txn = scenario.invoiceTransactionTypeCode;
  const row: Record<string, string | null> = {
    ...seed,
    [FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD]: txn,
    [FV.TAX_CATEGORY_FIELD]: FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
    [FV.INVOICED_ITEM_TAX_RATE_FIELD]: null,
    [FV.TAX_EXEMPTION_REASON_CODE_FIELD]: "",
    [FV.TAX_EXEMPTION_REASON_TEXT_FIELD]: "",
    [FV.LINE_ITEM_VAT_AMOUNT_FIELD]: "0",
    [FV.PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD]: scenario.profitMarginItemTypeCode,
  };
  if (txn === FV.TXN_PROFIT_MARGIN_INVOICE) {
    row[FV.PRECEDING_INVOICE_REFERENCE_FIELD] = "PREV-OMN-001";
    row[FV.PRECEDING_INVOICE_UUID_FIELD] = FV.PRECEDING_INVOICE_UUID_SAMPLE;
    row[FV.PRECEDING_INVOICE_ISSUE_DATE_FIELD] = "2026-06-01";
  }
  return applyPartyIdentifiersByTxnType(row);
}

export function buildItemAttributeConditionalScenarioRow(
  scenario: FV.ItemAttributeConditionalScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  return {
    ...seed,
    [FV.ITEM_ATTRIBUTE_NAME_FIELD]: scenario.itemAttributeName,
    [FV.ITEM_ATTRIBUTE_VALUE_FIELD]: scenario.itemAttributeValue,
  };
}

/**
 * Covoro party-identifier companions (IBT-029 / IBT-046):
 * identifier may stand alone; scheme and/or textual code require identifier.
 */
export function buildPartyIdentifierCompanionScenarioRow(
  scenario: FV.PartyIdentifierCompanionScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  const schemeLabel = masterLabelIncluding(
    schemeIdentifierValidTestData,
    "Oman Value Added Tax",
    "Oman Value Added Tax Identification Number (VATIN) (OM:VAT) - Issuing agency: Tax Authority, Oman."
  );
  const codeLabel = masterLabelIncluding(
    buyerSellerIdentifierCodeValidTestData,
    "Tax Identification",
    "Tax Identification Number"
  );
  const withScheme =
    scenario.companion === "scheme" || scenario.companion === "both";
  const withCode =
    scenario.companion === "code" || scenario.companion === "both";

  if (scenario.party === "seller") {
    return {
      ...seed,
      [FV.SELLER_IDENTIFIER_FIELD]: scenario.identifier,
      [FV.SELLER_IDENTIFIER_SCHEME_FIELD]: withScheme ? schemeLabel : "",
      [FV.SELLER_IDENTIFIER_TEXTUAL_CODE_FIELD]: withCode ? codeLabel : "",
    };
  }

  return {
    ...seed,
    [FV.BUYER_IDENTIFIER_FIELD]: scenario.identifier,
    [FV.BUYER_IDENTIFIER_SCHEME_FIELD]: withScheme ? schemeLabel : "",
    [FV.BUYER_IDENTIFIER_TEXTUAL_CODE_FIELD]: withCode ? codeLabel : "",
  };
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
  row["Buyer identifier"] = scenario.buyerIdentifier;
  const usesOmanBuyerSellerTextualCode =
    buyerSellerIdentifierCodeValidTestData.some(
      (item) => item.label === scenario.buyerIdentifierScheme
    );
  if (
    scenario.invoiceTransactionTypeCode === FV.TXN_IMPORT_OF_GOODS ||
    usesOmanBuyerSellerTextualCode
  ) {
    // Oman Buyer/Seller Identifier list (Importer Customs ID, Special Zone
    // License Number, …) is textual code, not ICD scheme. Wrong-target
    // (Full Tax + same T) must keep this mapping — clone Allowed, change txn only.
    row["Scheme identifier"] = "";
    row["Buyer Identifier (textual code)"] = scenario.buyerIdentifierScheme;
    if (scenario.invoiceTransactionTypeCode === FV.TXN_IMPORT_OF_GOODS) {
      row[FV.ITEM_COUNTRY_OF_ORIGIN_FIELD] = FV.UAE_COUNTRY_CODE;
      row[FV.IMPORT_DATE_FIELD] = "2026-01-10";
      row[FV.CUSTOMS_DECLARATION_NUMBER_FIELD] = "CD-COND-001";
      row[FV.INCOTERMS_FIELD] = "Free On Board";
    }
  } else {
    // XOR: scheme only — textual code stays empty.
    row["Scheme identifier"] = scenario.buyerIdentifierScheme;
    row["Buyer Identifier (textual code)"] = "";
  }
  // Free-zone subdivisions for Special Zone and wrong-target Full Tax + SZLN
  // (clone Allowed; only txn differs). Import of Goods leaves seed blank.
  // Mainland exception overrides buyer subdivision after the Sohar default.
  let next = row;
  if (
    scenario.invoiceTransactionTypeCode === FV.TXN_SPECIAL_ZONE_SUPPLIES ||
    scenario.buyerIdentifierScheme === FV.SPECIAL_ZONE_LICENSE_SCHEME
  ) {
    next = applySpecialZoneCountrySubdivisions(row);
  }
  if (scenario.buyerCountrySubdivisionCode !== undefined) {
    next[FV.BUYER_COUNTRY_SUBDIVISION_CODE_FIELD] =
      scenario.buyerCountrySubdivisionCode;
  }
  return next;
}

/**
 * Isolated 0 on formula-output columns is a Σ mismatch. Collapse line
 * inputs so the submit writer recalculates a coherent zero invoice.
 */
function applyIbr137OmAmountValue(
  row: Record<string, string | null>,
  field: string,
  value: string
): Record<string, string | null> {
  let next: Record<string, string | null> = { ...row, [field]: value };
  const numeric = Number(value);
  if (
    (FV.IBR_137_OM_FORMULA_ZERO_FIELDS as readonly string[]).includes(field) &&
    numeric === 0
  ) {
    next[FV.ITEM_GROSS_PRICE_FIELD] = "0";
    next[FV.ITEM_PRICE_DISCOUNT_FIELD] = "0";
    next[FV.ITEM_NET_PRICE_FIELD] = "0";
    next[FV.INVOICE_LINE_NET_AMOUNT_FIELD] = "0";
    next[FV.LINE_ITEM_VAT_AMOUNT_FIELD] = "0";
    next[FV.TOTAL_AMOUNT_INCLUDING_VAT_FIELD] = "0";
    next[FV.SUM_OF_INVOICE_LINE_NET_AMOUNT_FIELD] = "0";
    next[FV.INVOICE_TOTAL_AMOUNT_WITHOUT_TAX_FIELD] = "0";
    next[FV.INVOICE_TOTAL_TAX_AMOUNT_FIELD] = "0";
    next[FV.INVOICE_TOTAL_AMOUNT_WITH_TAX_FIELD] = "0";
    next[FV.AMOUNT_DUE_FOR_PAYMENT_FIELD] = "0";
    next[field] = value;
  }
  if (field === FV.CHARGES_ON_DOCUMENT_LEVEL_FIELD) {
    next[FV.VAT_CATEGORY_CHARGES_FIELD] = FV.STANDARD_TAX_CATEGORY_CODE;
  }
  if (field === FV.ALLOWANCES_ON_DOCUMENT_LEVEL_FIELD) {
    next[FV.VAT_CATEGORY_ALLOWANCES_FIELD] = FV.STANDARD_TAX_CATEGORY_CODE;
  }
  if (field === FV.PAID_AMOUNT_FIELD) {
    // IBR-058-OM: paid amount 0 is present → prepayment number + UUID required.
    next["Prepayment invoice number"] = "PREPAY-001";
    next["Prepayment invoice UUID"] = FV.PRECEDING_INVOICE_UUID_SAMPLE;
  }
  if (field === FV.TAX_AMOUNT_IN_ACCOUNTING_CURRENCY_FIELD) {
    // IBR-034/065: IBT-111 is only in play when invoice currency is not OMR.
    next[FV.INVOICE_CURRENCY_CODE_FIELD] = FV.OMAN_CURRENCY_USD;
    next[FV.SOURCE_CURRENCY_CODE_FIELD] = FV.OMAN_CURRENCY_USD;
    next[FV.EXCHANGE_RATE_FIELD] = "0.385";
    next[field] = value;
  }
  if (field === FV.TOTAL_AMOUNT_DUE_PROFIT_MARGIN_FIELD) {
    next[FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD] = FV.TXN_PROFIT_MARGIN_INVOICE;
    next = applyTxnExclusionCompanions(next, [FV.TXN_PROFIT_MARGIN_INVOICE]);
    next = applyPartyIdentifiersByTxnType(next);
    next[FV.TAX_CATEGORY_FIELD] = FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE;
    next[FV.INVOICED_ITEM_TAX_RATE_FIELD] = "";
    next[FV.TAX_EXEMPTION_REASON_CODE_FIELD] = "";
    next[FV.LINE_ITEM_VAT_AMOUNT_FIELD] = "0";
    next[field] = value;
  }
  return next;
}

/** IBR-137-OM: amounts/quantities ≥ 0 except Rounding Amount (IBT-114). */
export function buildAmountQuantitySignScenarioRow(
  scenario: FV.AmountQuantitySignScenario
): Record<string, string | null> {
  const seed = getSeedInvoiceRow();
  let row: Record<string, string | null> = {
    ...seed,
    [FV.INVOICED_QUANTITY_SEED_FIELD]: scenario.invoicedQuantity,
    [FV.ROUNDING_AMOUNT_SEED_FIELD]: scenario.roundingAmount,
  };
  if (scenario.amountField) {
    row = applyIbr137OmAmountValue(
      row,
      scenario.amountField,
      scenario.amountValue ?? "0"
    );
  }
  return row;
}
