/**
 * Build static Oman conditional-validation Excel packs from
 * `testcase/conditional_validation/EINV_OMAN_ConditionalValidation_FullMatrix.xlsx`.
 *
 * Each workbook = Oman seed + section/trigger overlay + main-field mutation from matrix polarity/title.
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { buildValidOmanFullTaxInvoiceRow, expandRowByMultiValueSpec } from "./conditionalValidationHelper";
import {
  applyDependentOverlay,
  applyOmanSellerBuyerIdentity,
  MATRIX_FIELD_TO_ROW_KEY,
  OMAN_BUYER_ELECTRONIC,
  OMAN_BUYER_VAT,
  OMAN_ELECTRONIC_SCHEME,
  OMAN_SELLER_ELECTRONIC,
  OMAN_SELLER_VAT,
  resolveRowKey,
} from "./fieldValidationExcelPackHelper";
import * as FV from "../testData/FieldValidations/ConditionalValidation";
import { InvalidTestData } from "../testData/FieldValidations/Master";
import {
  generateDistinctSubmitInvoices,
  generateInvoiceFromSubmitData,
  getCachedInvoiceTemplateHeaders,
  patchInvoiceTextCellInFile,
} from "../utils/invoiceExcel";
import { createPackProgressReporter, packOutputAlreadyExists } from "./packProgressReporter";
import { runPythonForStdout } from "../utils/pythonRunner";

export type ConditionalMatrixCase = {
  id: string;
  priority: string;
  polarity: string;
  section: string;
  field: string;
  title: string;
  description: string;
  preconditions?: string;
  steps?: string;
  expected?: string;
  ruleId: string;
};

export type ConditionalGeneratePackResult = {
  id: string;
  section: string;
  field: string;
  title: string;
  ruleId: string;
  polarity: "positive" | "negative" | "unknown";
  status: "ok" | "skipped" | "error";
  reason?: string;
  destPath?: string;
  invoiceNumber?: string;
  mutatedValue?: string;
  rowKey?: string;
};

const MATRIX_DEFAULT_PATH = path.join(
  process.cwd(),
  "testcase",
  "conditional_validation",
  "EINV_OMAN_ConditionalValidation_FullMatrix.xlsx"
);

const PACK_ROOT = path.join(
  process.cwd(),
  "testcase",
  "conditional_validation",
  "TestData"
);

/** Extra matrix field labels → Covoro template / seed headers. */
const CONDITIONAL_FIELD_TO_ROW_KEY: Record<string, string> = {
  ...MATRIX_FIELD_TO_ROW_KEY,
  "Preceding invoice reference": "Preceding Invoice reference",
  "Preceding Invoice Reference": "Preceding Invoice reference",
  "Invoice transaction type": "Invoice Transaction Type Code",
  "Invoice Transaction Type": "Invoice Transaction Type Code",
  "If invoice transaction type": "Invoice Transaction Type Code",
  "If Invoice transaction type": "Invoice Transaction Type Code",
  "When Invoice transaction type": "Invoice Transaction Type Code",
  // Dropdown description (not Peppol bit-string) for Simplified Tax Invoice cases.
  "Simplified Tax Invoice": "Invoice Transaction Type Code",
  // Peppol BTOM-001 = Invoice Transaction Type.
  "BTOM-001": "Invoice Transaction Type Code",
  "Invoice type code": "Invoice Type Code",
  "If Invoice type code": "Invoice Type Code",
  "if Invoice type code": "Invoice Type Code",
  "If Invoice Type code": "Invoice Type Code",
  "Currency exchange rate": "Currency Exchange Rate",
  "BTOM-003": "Currency Exchange Rate",
  "When Invoice currency code": "Invoice Currency Code",
  "Invoice currency code": "Invoice Currency Code",
  "If Invoice currency code": "Invoice Currency Code",
  "IBT-005": "Invoice Currency Code",
  // IBT-006 Tax Accounting Currency — backend default (intentional skip; do not alias).
  // IBR-065 / IBT-110 / IBT-111 (IBT-006 itself stays skip)
  "IBT-110": "Invoice Total Tax Amount",
  "IBT-111": "Invoice Total Tax Amount In Tax Accounting Currency",
  "Invoice Total VAT Amount in Tax Accounting Currency":
    "Invoice Total Tax Amount In Tax Accounting Currency",
  "Invoice Total Tax Amount in Accounting Currency":
    "Invoice Total Tax Amount In Tax Accounting Currency",
  "Invoice Total Tax Amount in Tax Accounting Currency":
    "Invoice Total Tax Amount In Tax Accounting Currency",
  // IBR-082
  "BTOM-020": "Total Amount Due (Profit Margin)",
  "Total Amount Due": "Total Amount Due (Profit Margin)",
  "BTOM-017": "Total Amount Including VAT",
  // ALIGNED-IBRP-*-08/09 + IBR-168 — breakdown amounts → closest document totals
  "IBT-116": "Invoice Total Amount Without Tax",
  "VAT Category Taxable Amount": "Invoice Total Amount Without Tax",
  "IBT-117": "Invoice Total Tax Amount",
  "VAT Category Tax Amount": "Invoice Total Tax Amount",
  "IBT-118": "Tax Category",
  "IBT-151": "Tax Category",
  "VAT Category Code": "Tax Category",
  "IBT-131": "Invoice Line Net Amount",
  "IBT-092": "Allowances On Document Level",
  "IBT-099": "Charges On Document Level",
  "IBT-095": "VAT Category - Allowances",
  "IBT-102": "VAT Category - Charges",
  "IBT-119": "Tax Rate",
  "IBT-152": "Tax Rate",
  "IBT-103": "Tax Rate",
  "VAT Category Rate": "Tax Rate",
  "Document Level Charge Tax Rate": "Tax Rate",
  "Document Level Allowance Tax Rate": "Tax Rate", // IBT-096 still field-skipped (no column)
  "Exchange Rate": "Currency Exchange Rate",
  "BTOM-016": "Line Item VAT Amount",
  // IBR-035
  "IBT-137": "Invoice Line Allowance Amount",
  "IBT-142": "Invoice Line Charge Amount",
  "Invoice Line Allowance/Charge Base Amount (IBT-137 / IBT-142)":
    "Invoice Line Allowance Amount",
  // IBR-046 multi-rate Filed name → Tax Rate (IBT-096 has no separate column)
  "VAT Rate (IBT-096, IBT-103, IBT-119, IBT-152, IBT-193)": "Tax Rate",
  // Compound ALIGNED-*-08 Filed name
  "Invoice Transaction Type (BTOM-001), VAT Category Code (IBT-118), VAT Category Taxable Amount (IBT-116)":
    "Invoice Total Amount Without Tax",
  // IBT-192 category code for accounting-currency tax amount → closest amount column.
  "If the TAX category code for tax category tax amount in accounting currency":
    "Invoice Total Tax Amount In Tax Accounting Currency",
  "Item Type": "Item Type",
  "When Item type": "Item Type",
  "Item classification identifier": "Item classification identifier",
  "Industrial Classification Code must be provided for each ITEM INFORMATION":
    "Industrial Classification Code",
  "Delivery to Country code": "Deliver to country code",
  "Deliver to Country code": "Deliver to country code",
  // Matrix prose names postal code; map to Deliver to post code (not address line 1).
  "Deliver to address line 1 - Postal code": "Deliver to post code",
  "Customs Declaration number": "Customs Declaration number",
  "Import date": "Import date",
  "Invoicing period start date": "Invoicing period start date",
  "Invoicing period Start date": "Invoicing period start date",
  "Invoicing Period Start Date": "Invoicing period start date",
  "Invoicing period end date": "Invoicing period end date",
  "Invoicing period End date": "Invoicing period end date",
  // IBT-134 — no line-period column; proxy to document Invoicing Period Start Date.
  "Invoice line period start date": "Invoicing period start date",
  "Invoice line period Start date": "Invoicing period start date",
  "Seller identifier": "Seller Identifier",
  "Seller Identifier": "Seller Identifier",
  "IBT-029": "Seller Identifier",
  "Seller Identifier Scheme Identifier": "Seller Identifier - Scheme Identifier",
  "IBT-029-1": "Seller Identifier - Scheme Identifier",
  "Seller Identifier (IBT-029) – Scheme Identifier (IBT-029-1)": "Seller Identifier",
  "Buyer identifier": "Buyer Identifier",
  "Buyer Identifier": "Buyer Identifier",
  "IBT-046": "Buyer Identifier",
  "the value in the Buyer identifier": "Buyer Identifier",
  "Buyer Identifier Scheme Identifier": "Scheme Identifier",
  "IBT-046-1": "Scheme Identifier",
  "Scheme Identifier": "Scheme Identifier",
  "Buyer Identifier (IBT-046), Buyer Identifier Scheme Identifier (IBT-046-1)":
    "Buyer Identifier",
  "Buyer Identifier (IBT-046) / Scheme Identifier (IBT-046-1)": "Buyer Identifier",
  "If Buyer electronic address": "Buyer electronic address",
  "Buyer electronic address": "Buyer electronic address",
  // CL-11 — Profit Margin Item Type (BTOM-025)
  "BTOM-025": "Profit Margin Item Type Code",
  "Profit Margin Item Type Code": "Profit Margin Item Type Code",
  "Profit Margin Item Reason Code": "Profit Margin Item Type Code",
  "Tax Category": "Tax Category",
  "VAT Category": "Tax Category",
  "VAT category code": "Tax Category",
  "Invoiced item VAT category code": "Tax Category",
  "Invoiced item Tax Category": "Tax Category",
  "Tax Rate": "Tax Rate",
  "VAT Rate": "Tax Rate",
  "Invoiced item VAT rate": "Tax Rate",
  "Invoice item VAT rate": "Tax Rate",
  // FullMatrix Filed name for ALIGNED-IBRP-E/S/Z-05-OM (Invoiced item VAT rate / IBT-152).
  "In an Invoice line": "Tax Rate",
  // FullMatrix Filed name for ALIGNED-IBRP-O-05-OM (Invoiced item VAT rate / IBT-152).
  "An Invoice line": "Tax Rate",
  // CL-10 exemption reason codes
  "Tax exemption reason code": "Tax Exemption Reason Code",
  "Tax Exemption Reason Code": "Tax Exemption Reason Code",
  "VAT Exemption Reason Code": "Tax Exemption Reason Code",
  "IBT-121": "Tax Exemption Reason Code",
  "IBT-186": "Tax Exemption Reason Code",
  "IBT-196": "Tax Exemption Reason - Allowances",
  "IBT-198": "Tax Exemption Reason - Charges",
  "Document Level Allowance VAT Exemption Reason Code":
    "Tax Exemption Reason - Allowances",
  "Document Level Allowance TAX Exemption Reason Code":
    "Tax Exemption Reason - Allowances",
  "Document Level Charge VAT Exemption Reason Code":
    "Tax Exemption Reason - Charges",
  "Document Level Charge TAX Exemption Reason Code":
    "Tax Exemption Reason - Charges",
  "Document Level Allowance VAT Exemption Reason Code (IBT-196) / Document Level Allowance VAT Category Code (IBT-095)":
    "Tax Exemption Reason - Allowances",
  "Document Level Allowance TAX Exemption Reason Code (IBT-196) / Document Level Allowance TAX Category Code (IBT-095)":
    "Tax Exemption Reason - Allowances",
  "Document Level Charge VAT Exemption Reason Code (IBT-198) / Document Level Charge VAT Category Code (IBT-102)":
    "Tax Exemption Reason - Charges",
  "VAT Exemption Reason Code (IBT-121) / VAT Exemption Reason Text (IBT-120)":
    "Tax Exemption Reason Code",
  // Closest sheet column for Peppol IBT-190 (category tax in accounting currency).
  "TAX category tax amount in accounting currency":
    "Invoice Total Tax Amount In Tax Accounting Currency",
  "Tax category tax amount in accounting currency":
    "Invoice Total Tax Amount In Tax Accounting Currency",
  "IBT-190": "Invoice Total Tax Amount In Tax Accounting Currency",
  // IBT-192 Accounting Currency VAT Category Code — no Covoro column (field skip).
  // Amount prose still maps to tax-in-accounting-currency total.
  "IBT-192(tax category tax amount in accounting currency)":
    "Invoice Total Tax Amount In Tax Accounting Currency",
  // Line-level VAT amount (BTOM-016)
  "In Line VAT information": "Line Item VAT Amount",
  "Each Invoice/CreditNote line must contain Item VAT Amount":
    "Line Item VAT Amount",
  "Line Item VAT Amount": "Line Item VAT Amount",
  "Item VAT Amount": "Line Item VAT Amount",
  // Party identifiers / address.
  "Seller tax identifier": "Seller VAT Identifier (TRN / TIN)",
  "Seller Tax Identifier": "Seller VAT Identifier (TRN / TIN)",
  "Buyer VATIN": "Buyer VAT Identifier",
  // Document-level VAT category (charge vs allowance).
  "If Document level charge TAX category code": "Vat category - charges",
  "Document level charge TAX category code": "Vat category - charges",
  "If Document level allowance TAX category code": "Vat category - allowances",
  "Document level allowance TAX category code": "Vat category - allowances",
  "Document level allowance": "Allowances on document level",
  "Document level charge": "Charges on document level",
  // FullMatrix Filed name for ALIGNED-IBRP-*-01-OM (IBG-25 + IBG-20/IBG-21 prose).
  // Primary → Allowances; companion dual-patch also writes Charges.
  "An Invoice that contains an Invoice line": "Allowances on document level",
  // Closest sheet column for Peppol IBT-142 (template has no separate charge-base %).
  "Charge base amount (IBT-142)": "Charges on document level",
  "Charge base amount": "Charges on document level",
  // Closest sheet column for Peppol IBT-093 / IBT-137 (template has no separate allowance-base %).
  "Allowance base amount (IBT-137)": "Allowances on document level",
  "Allowance base amount (IBT-093)": "Allowances on document level",
  "Allowance base amount": "Allowances on document level",
  "VAT breakdown(IBG-23)": "Invoice Total Tax Amount",
  "In a VAT breakdown": "Invoice Total Tax Amount",
  // ALIGNED-IBRP-*-01 — breakdown group Filed → Tax Category
  "VAT Breakdown Group (IBG-23) – VAT Category Code (IBT-118)": "Tax Category",
  "VAT Breakdown Group (IBG-23) - VAT Category Code (IBT-118)": "Tax Category",
  "VAT Breakdown (IBG-23) – VAT Category Code (IBT-118)": "Tax Category",
  "VAT Breakdown (IBG-23) - VAT Category Code (IBT-118)": "Tax Category",
  // Invoicing period (IBR-036/037)
  "IBT-073": "Invoicing Period Start Date",
  "IBT-074": "Invoicing Period End Date",
  "Invoicing Period Start Date": "Invoicing Period Start Date",
  "Invoicing Period End Date": "Invoicing Period End Date",
  "Invoicing Period Start Date (IBT-073) – Invoicing Period End Date (IBT-074)":
    "Invoicing Period Start Date",
  "Invoicing Period Start Date (IBT-073) - Invoicing Period End Date (IBT-074)":
    "Invoicing Period Start Date",
  // Invoice line period (IBR-030 / IBR-CO-20) → document Invoicing Period*
  "IBT-134": "Invoicing Period Start Date",
  "IBT-135": "Invoicing Period End Date",
  "Invoice Line Period Start Date": "Invoicing Period Start Date",
  "Invoice Line Period End Date": "Invoicing Period End Date",
  "Invoice Line Period Start Date (IBT-134)": "Invoicing Period Start Date",
  "Invoice Line Period End Date (IBT-135)": "Invoicing Period End Date",
  "Invoice Line Period Start Date (IBT-134) / Invoice Line Period End Date (IBT-135)":
    "Invoicing Period Start Date",
  "VAT Category Rate (IBT-119)": "Tax Rate",
  "IBT-119": "Tax Rate",
  "IBT-118": "Tax Category",
  "Invoice Total Tax Amount in Accounting Currency (IBT-111)":
    "Invoice Total Tax Amount In Tax Accounting Currency",
  "IBG-31": "Industrial Classification Code",
  "Item Classification Identifier (HS Code) (IBT-158)":
    "Item Classification Identifier",
  // ALIGNED-IBRP-*-05 / IBR-039/054/077
  "Invoiced Item VAT Category Code": "Tax Category",
  "Invoiced Item VAT Category Code (IBT-151) – Invoice Item VAT Rate (IBT-152)":
    "Tax Category",
  "Invoiced Item VAT Category Code (IBT-151) - Invoice Item VAT Rate (IBT-152)":
    "Tax Category",
  "Invoiced Item VAT Category Code (IBT-151) – Invoiced Item VAT Rate (IBT-152)":
    "Tax Category",
  "Invoiced Item VAT Category Code (IBT-151) - Invoiced Item VAT Rate (IBT-152)":
    "Tax Category",
  "Invoiced Item VAT Category Code (IBT-151) – Line Item VAT Amount (BTOM-016)":
    "Line Item VAT Amount",
  "Invoiced Item VAT Category Code (IBT-151) - Line Item VAT Amount (BTOM-016)":
    "Line Item VAT Amount",
  // Delivery / export
  "IBT-080": "Deliver To Country Code",
  "Delivery to Country Code": "Deliver To Country Code",
  "Deliver to Country Code": "Deliver To Country Code",
  "Deliver To Country Code": "Deliver To Country Code",
  "Delivery to Country code": "Deliver To Country Code",
  "Deliver to Country code": "Deliver To Country Code",
  // Seller / buyer tax ids
  "IBT-031": "Seller VAT Identifier (TRN / TIN)",
  "IBT-048": "Buyer VAT Identifier",
  "Buyer Identifier (IBT-046), Buyer VATIN (IBT-048)": "Buyer Identifier",
  // Country subdivision (IBR-150)
  "BTOM-026": "Buyer Country Subdivision Code",
  "BTOM-024": "Seller Country Subdivision Code",
  "Buyer Country Subdivision Code": "Buyer Country Subdivision Code",
  "Seller Country Subdivision Code": "Seller Country Subdivision Code",
  "Buyer Country Subdivision Code (BTOM-026) / Seller Country Subdivision Code (BTOM-024)":
    "Buyer Country Subdivision Code",
  // Credit / debit reason (IBR-023)
  "IBT-003": "Invoice Type Code",
  "BTOM-032": "Credit Note Or Debit Note Reason Code",
  "Credit Note / Debit Note Reason Code": "Credit Note Or Debit Note Reason Code",
  "Credit Note / Debit Note Reason Code (BTOM-032)":
    "Credit Note Or Debit Note Reason Code",
  "Credit note or Debit Note reason code": "Credit Note Or Debit Note Reason Code",
  // Document charge (IBR-042)
  "IBT-104": "Charges On Document Level",
  "Document Level Charge Reason Code": "Charges On Document Level",
  "Document Level Charge": "Charges On Document Level",
  "Document Level Charge Reason Code (IBT-104) / Document Level Charge (IBG-21)":
    "Charges On Document Level",
  // Preceding invoice (IBR-032 / IBR-175)
  "IBT-025": "Preceding Invoice Reference",
  "IBT-026": "Preceding Invoice Issue Date",
  "BTOM-031": "Unique Identifier Number",
  "Preceding Invoice UUID": "Unique Identifier Number",
  "Preceding Invoice Reference (IBT-025), Preceding Invoice Issue Date (IBT-026), Preceding Invoice UUID (BTOM-031)":
    "Preceding Invoice Reference",
  "Invoice Transaction Type (BTOM-001) – Preceding Invoice Reference (IBT-025), Preceding Invoice UUID (BTOM-031)":
    "Invoice Transaction Type Code",
  "Invoice Transaction Type (BTOM-001) - Preceding Invoice Reference (IBT-025), Preceding Invoice UUID (BTOM-031)":
    "Invoice Transaction Type Code",
  // Item classification / type
  "BTOM-019": "Item Type",
  "IBT-158": "Item Classification Identifier",
  "Item Classification Identifier": "Item Classification Identifier",
  "Item Classification Identifier (HS Code)": "Item Classification Identifier",
  "Item Classification Identifier (HS Code) (IBT-158)":
    "Item Classification Identifier",
  "Item Classification Identifier (IBT-158) – Invoice Transaction Type (BTOM-001)":
    "Item Classification Identifier",
  "Item Classification Identifier (IBT-158) - Invoice Transaction Type (BTOM-001)":
    "Item Classification Identifier",
  // IBR-104
  "VAT Category Rate (IBT-119) – VAT Accounting Currency": "Tax Rate",
  "VAT Category Rate (IBT-119) - VAT Accounting Currency": "Tax Rate",
  // Import details (IBR-085)
  "Import Details (IBG-33-OM)": "Import Date",
  "Import Details": "Import Date",
  "BTOM-021": "Customs Declaration Number",
  "BTOM-022": "Incoterms",
  "Customs Declaration Number": "Customs Declaration Number",
  "Customs Declaration number": "Customs Declaration Number",
  "Import date": "Import Date",
  "Import Date (BTOM-020)": "Import Date",
  // Prepayment / paid (IBR-058) + IBR-093 (non-OM): IBT-113 ≠ IBT-180
  "IBT-180": "Paid Amount",
  "Paid Amount": "Paid Amount",
  "IBT-113": "Invoice Total Amount With Tax",
  "Total Paid Amount": "Invoice Total Amount With Tax",
  "Total Paid Amount (IBT-113)": "Invoice Total Amount With Tax",
  "BTOM-027": "Prepayment Invoice Number",
  "BTOM-014": "Prepayment Invoice Uuid",
  "Prepayment Invoice Number": "Prepayment Invoice Number",
  "Prepayment Invoice UUID": "Prepayment Invoice Uuid",
  "Prepayment Invoice Uuid": "Prepayment Invoice Uuid",
  "Prepayment Invoice Number (BTOM-027), Prepayment Invoice UUID (BTOM-014)":
    "Prepayment Invoice Number",
  // Supporting documents (IBR-013)
  "IBT-122": "Supporting Document Reference",
  "BTOM-023": "Supporting Document Uuid",
  "Supporting document reference": "Supporting Document Reference",
  "Supporting Document Reference": "Supporting Document Reference",
  "Supporting document UUID": "Supporting Document Uuid",
  "Supporting Document Uuid": "Supporting Document Uuid",
  "Supporting document reference (IBT-122) and Supporting document UUID (BTOM-023)":
    "Supporting Document Reference",
  // Seller address (IBR-010)
  "Seller Postal Address": "Seller Address Line 1",
  "Seller postal address": "Seller Address Line 1",
  "Seller Address Line 1": "Seller Address Line 1",
  "Seller Address Line 2": "Seller Address Line 2",
  "Seller Address Line 3": "Seller Address Line 3",
  "Seller City": "Seller City",
  "Seller Postal Code": "Seller Post Code",
  "Seller Post Code": "Seller Post Code",
  "IBT-035": "Seller Address Line 1",
  "IBT-036": "Seller Address Line 2",
  "IBT-162": "Seller Address Line 3",
  "IBT-037": "Seller City",
  "IBT-038": "Seller Post Code",
  // BTOM-015 Service Type (CL-12-OM)
  "Service Type": "Service Type Code",
  "Service Type Code": "Service Type Code",
  "BTOM-015": "Service Type Code",
  "Buyer country code": "Buyer country code",
};

/**
 * Matrix labels that are rule prose / multi-field conditions — not a single Excel column.
 * Explicit CONDITIONAL_FIELD_TO_ROW_KEY aliases are checked first (see isMappableExcelField).
 */
const PSEUDO_FIELD_RE =
  /^(in a vat breakdown|conditional fields|an invoice that contains|in an invoice line|in line vat|the vat category tax amount(?!\s+in accounting)|related invoice|vat breakdown)/i;

/**
 * Fields that should not generate Excel packs (defaults / formula suite / out of scope).
 */
const INTENTIONAL_SKIP_FIELDS = new Set(
  [
    // IBT-006 — set by backend; no need to enter in Excel.
    "VAT accounting currency",
    "Vat accounting currency",
    "VAT Accounting Currency",
    "Tax Accounting Currency",
    "Tax accounting currency",
    "Tax Accounting Currency Code",
    "Tax accounting currency code",
    "IBT-006",
    // IBT-134/135: aliased to document Invoicing Period* (no separate line-period columns).
    // IBT-096 — no separate Allowance VAT Rate column.
    "Document Level Allowance Tax Rate",
    // IBT-138 / IBT-143 — no separate line allowance/charge percentage columns.
    "Invoice line allowance percentage",
    "Invoice line charge percentage",
    "For each different value of VAT category rate",
    // IBT-192 Accounting Currency VAT Category Code — no Covoro column.
    "Accounting Currency VAT Category Code",
    "Accounting Currency VAT Category",
  ].map((s) => s.replace(/\s+/g, " ").trim().toLowerCase())
);

/** Backend / remaining formula skips — do not generate Excels for these. */
const INTENTIONAL_SKIP_RULE_IDS = new Set(
  [
    // FORMULA — user: keep skip (not needed)
    "IBR-033-OM",
    "IBR-041-OM",
    // BACKEND — not exposed on Covoro Excel error file
    "IBR-066-OM",
    "IBR-096-OM",
    "IBR-097-OM",
    // User batch: not needed / backend / default
    "IBR-073-OM",
    "IBR-074-OM",
    "IBR-173-OM",
    "IBR-059-OM",
  ].map((s) => s.toUpperCase())
);

const FORMULA_SUITE_SKIP_FIELDS = new Set(
  ["For each different value of VAT category rate"].map((s) =>
    s.replace(/\s+/g, " ").trim().toLowerCase()
  )
);

function isIntentionalSkipField(matrixField: string): boolean {
  const raw = (matrixField || "").replace(/\s+/g, " ").trim().toLowerCase();
  // IBT-192 Accounting Currency VAT Category Code — no column (not amount prose).
  if (
    raw.includes("accounting currency vat category") ||
    (raw.includes("ibt-192") &&
      raw.includes("category") &&
      !raw.includes("amount"))
  ) {
    return true;
  }
  for (const candidate of matrixFieldLookupCandidates(matrixField)) {
    const n = candidate.replace(/\s+/g, " ").trim().toLowerCase();
    if (INTENTIONAL_SKIP_FIELDS.has(n)) return true;
    // Prefix: "VAT Category Tax Amount (IBT-117) …"
    for (const skip of INTENTIONAL_SKIP_FIELDS) {
      if (n === skip || n.startsWith(skip + " ") || n.startsWith(skip + "-")) {
        return true;
      }
    }
  }
  return false;
}

function isIntentionalSkipRule(ruleId: string): boolean {
  return INTENTIONAL_SKIP_RULE_IDS.has((ruleId || "").trim().toUpperCase());
}

/** Non-null when case should be skipped intentionally (no Excel / no alias). */
function intentionalSkipReason(
  matrixField: string,
  ruleId: string
): string | null {
  if (isIntentionalSkipRule(ruleId)) {
    return "intentional skip (formula suite / out of scope)";
  }
  if (!isIntentionalSkipField(matrixField)) return null;
  const n = normalizeMatrixFieldLabel(matrixField)
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  if (
    FORMULA_SUITE_SKIP_FIELDS.has(n) ||
    n.startsWith("vat category tax amount") ||
    n.startsWith("vat category taxable amount") ||
    n.startsWith("for each different value of vat category rate")
  ) {
    return "intentional skip (formula suite / out of scope)";
  }
  return "intentional skip (default value / out of scope)";
}

function normKey(s: string): string {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

/** True when matrix title/description is about invoice line period (IBT-134/135). */
export function isInvoiceLinePeriodRule(tc: ConditionalMatrixCase): boolean {
  const blob = `${tc.title}\n${tc.description || ""}\n${tc.steps || ""}`.toLowerCase();
  return (
    blob.includes("invoice line period") ||
    blob.includes("ibt-134") ||
    blob.includes("ibt-135") ||
    blob.includes("ibg-26")
  );
}

/**
 * True when the case targets Simplified Tax Invoice as the Excel mutation column
 * (literal Filed, or O-01/Z-01 prose Filed framed as Simplified Tax Invoice exception).
 * S-01 "An Invoice that contains…" without that exception framing stays on dual-charge.
 */
export function isSimplifiedTaxInvoiceMutationCase(
  tc: ConditionalMatrixCase
): boolean {
  const f = normKey(tc.field);
  if (f === "simplified tax invoice") return true;
  const title = (tc.title || "").toLowerCase();
  if (
    f === "an invoice that contains an invoice line" &&
    title.includes("simplified tax invoice exception")
  ) {
    return true;
  }
  return false;
}

/**
 * True when a valid mutation for Invoice Transaction Type Code should write the
 * dropdown description "Simplified Tax Invoice" (not a short Peppol code).
 */
export function prefersSimplifiedTaxInvoiceValue(
  tc: ConditionalMatrixCase
): boolean {
  if (caseWantsSimplifiedTaxInvoice(tc)) return true;
  if (isSimplifiedTaxInvoiceMutationCase(tc)) return true;
  const f = normKey(tc.field);
  if (
    f === "invoice transaction type" ||
    f === "invoice transaction type code" ||
    f === "if invoice transaction type" ||
    f === "when invoice transaction type" ||
    f === "btom-001"
  ) {
    const blob =
      `${tc.title}\n${tc.description || ""}\n${tc.steps || ""}`.toLowerCase();
    // Value is Simplified Tax Invoice when title/rule frames that description
    // (not Import of Goods / Summary / etc. triggers that also mention the word).
    if (
      blob.includes("simplified tax invoice exception") ||
      /invoice transaction type[^\n]{0,80}simplified tax invoice/i.test(
        `${tc.title}\n${tc.description || ""}`
      ) ||
      /['"]simplified tax invoice['"]/i.test(`${tc.title}\n${tc.description || ""}`)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * True when matrix Filed name is the document-level allowance+charge prose
 * (ALIGNED-IBRP-*-01-OM: IBG-20 / IBG-21 alongside IBG-25).
 * Drives dual Excel columns: Allowances + Charges on document level.
 */
export function isDocumentLevelAllowanceOrChargeRule(
  tc: ConditionalMatrixCase
): boolean {
  // O-01/Z-01 Simplified Tax Invoice exception → mutate txn type, not dual allowance/charge.
  if (isSimplifiedTaxInvoiceMutationCase(tc)) return false;
  const f = normKey(tc.field);
  if (f === "an invoice that contains an invoice line") return true;
  const hasAllowance =
    f.includes("document level allowance") || f.includes("ibg-20");
  const hasCharge =
    f.includes("document level charge") ||
    f.includes("document level charg") ||
    f.includes("ibg-21");
  return hasAllowance && hasCharge;
}

/**
 * Remap prose labels (e.g. Conditional fields) when the rule text is about
 * invoice line period. IBT-134 proxies to document Invoicing period start date
 * via CONDITIONAL_FIELD_TO_ROW_KEY.
 */
export function resolveEffectiveMatrixField(tc: ConditionalMatrixCase): string {
  const field = tc.field.trim();
  if (
    normKey(field) === "conditional fields" &&
    isInvoiceLinePeriodRule(tc)
  ) {
    return "Invoice line period start date";
  }
  // O-01/Z-01 Simplified Tax Invoice exception → Invoice Transaction Type Code.
  if (isSimplifiedTaxInvoiceMutationCase(tc)) {
    return "Simplified Tax Invoice";
  }
  // Multi-type CN/DN/261 rules: matrix Filed often says "Invoice type code" but the
  // mutation target is preceding reference or reason code.
  const rule = (tc.ruleId || "").trim().toUpperCase();
  if (rule === "ALIGNED-IBRP-028-OM" || rule === "IBR-032-OM") {
    return "Preceding invoice reference";
  }
  if (rule === "IBR-023-OM") {
    return "Credit note or Debit Note reason code";
  }
  // IBR-177: matrix field says "If Invoice Type code" but mutates BTOM-001 txn.
  if (rule === "IBR-177-OM") {
    return "Invoice Transaction Type Code";
  }
  // IBR-155: matrix Filed truncates to "If invoice transaction type" but mutates
  // Service Type (BTOM-015 / CL-12-OM).
  if (rule === "IBR-155-OM") {
    return "Service Type Code";
  }
  // IBR-013: ensure supporting-document mutation key (matrix is usually correct).
  if (rule === "IBR-013-OM") {
    return "Supporting document reference";
  }
  return field;
}

/** True when pack should emit one row per MULTI_VALUE_PACK_EXPAND alternate. */
export function shouldExpandMultiValuePack(
  tc: ConditionalMatrixCase
): boolean {
  const rule = (tc.ruleId || "").trim().toUpperCase();
  if (!FV.MULTI_VALUE_PACK_EXPAND[rule]) return false;
  // Trigger-off control stays commercial / single invoice.
  return !(tc.title || "").toLowerCase().includes("trigger not met");
}

/** @deprecated Prefer shouldExpandMultiValuePack — kept for call-site compatibility. */
export function shouldExpandMultiInvoiceTypes(
  tc: ConditionalMatrixCase
): boolean {
  const rule = (tc.ruleId || "").trim().toUpperCase();
  const spec = FV.MULTI_VALUE_PACK_EXPAND[rule];
  if (!spec || spec.dimension !== "invoiceType") return false;
  return shouldExpandMultiValuePack(tc);
}

/** @deprecated Prefer shouldExpandMultiValuePack. */
export function shouldExpandMultiSelfBilledDocTypes(
  tc: ConditionalMatrixCase
): boolean {
  return (
    (tc.ruleId || "").trim().toUpperCase() === "IBR-177-OM" &&
    shouldExpandMultiValuePack(tc)
  );
}

/**
 * For IBR-032 blank/whitespace/omit mutations, clear the full preceding trio
 * (ref + date + UUID) so the negative workbook is honest against IBR-032.
 */
function applyIbr032CompanionClears(
  tc: ConditionalMatrixCase,
  overlaid: Record<string, string>,
  mutationKind: string
): void {
  if ((tc.ruleId || "").trim().toUpperCase() !== "IBR-032-OM") return;
  if (
    mutationKind === "blank" ||
    mutationKind === "whitespace" ||
    mutationKind === "omit_null" ||
    mutationKind === "trigger_off_blank"
  ) {
    overlaid["Preceding Invoice reference"] = mutationKind === "whitespace" ? "   " : "";
    overlaid["Preceding Invoice issue date"] = "";
    overlaid["Unique Identifier Number"] = "";
  }
}

export function loadConditionalValidationMatrix(
  matrixPath = MATRIX_DEFAULT_PATH
): ConditionalMatrixCase[] {
  const script = path.join(
    process.cwd(),
    "utils",
    "read_conditional_validation_matrix.py"
  );
  const outJson = path.join(
    process.cwd(),
    "testcase",
    "conditional_validation",
    "TestData",
    "_tmp",
    "conditional-matrix.json"
  );
  fs.mkdirSync(path.dirname(outJson), { recursive: true });
  // Large matrix JSON is written to a file (stdout capture can hang on Windows).
  runPythonForStdout(script, [matrixPath, outJson], 120_000);
  const parsed = JSON.parse(fs.readFileSync(outJson, "utf8")) as {
    ok?: boolean;
    error?: string;
    cases?: ConditionalMatrixCase[];
  };
  if (!parsed.ok || !parsed.cases) {
    throw new Error(parsed.error || `Failed to read conditional matrix: ${outJson}`);
  }
  return parsed.cases;
}

/**
 * Strip Peppol tokens / compound separators from FullMatrix Filed names so
 * `Invoice Transaction Type (BTOM-001)` resolves like `Invoice Transaction Type`.
 */
export function normalizeMatrixFieldLabel(matrixField: string): string {
  return matrixField
    .replace(/\((?:IBT|BTOM|IBG)-[A-Z0-9\-]+\)/gi, "")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

/** Candidate labels to try against alias maps / seed headers (primary first). */
export function matrixFieldLookupCandidates(matrixField: string): string[] {
  const raw = matrixField.trim();
  if (!raw) return [];
  const stripped = normalizeMatrixFieldLabel(raw);
  const parts = stripped
    .split(/\s*\/\s*|\s+-\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const out: string[] = [];
  for (const c of [raw, stripped, ...parts]) {
    if (!c) continue;
    const ascii = c.replace(/[–—]/g, "-");
    for (const v of ascii === c ? [c] : [c, ascii]) {
      if (v && !out.some((x) => normKey(x) === normKey(v))) out.push(v);
    }
  }
  return out;
}

/**
 * Normalized Filed label (after Peppol strip) → Covoro seed / template header.
 * Used when exact CONDITIONAL_FIELD_TO_ROW_KEY / MATRIX_FIELD_TO_ROW_KEY miss.
 */
const NORMALIZED_FIELD_TO_ROW_KEY: Record<string, string> = {
  "invoice transaction type": "Invoice Transaction Type Code",
  "invoice type code": "Invoice Type Code",
  "if invoice type code": "Invoice Type Code",
  "if invoice transaction type": "Invoice Transaction Type Code",
  "when invoice transaction type": "Invoice Transaction Type Code",
  "preceding invoice reference": "Preceding Invoice reference",
  "preceding invoice issue date": "Preceding Invoice issue date",
  "preceding invoice uuid": "Unique Identifier Number",
  "credit note / debit note reason code": "Credit note or Debit Note reason code",
  "credit note or debit note reason code": "Credit note or Debit Note reason code",
  "invoiced item vat category code": "Tax Category",
  "invoice item vat rate": "Tax Rate",
  "invoiced item vat rate": "Tax Rate",
  "vat category code": "Tax Category",
  "vat category rate": "Tax Rate",
  "vat exemption reason code": "Tax exemption reason code",
  "vat exemption reason text": "Tax exemption reason text",
  "line item vat amount": "Line item VAT amount",
  "item vat amount": "Line item VAT amount",
  "item classification identifier": "Item classification identifier",
  "industrial classification code": "Industrial Classification Code",
  "item type": "Item Type",
  "item country of origin": "Item country of origin",
  "buyer identifier": "Buyer identifier",
  "buyer vatin": "Buyer VAT identifier",
  "buyer vat identifier": "Buyer VAT identifier",
  "buyer country code": "Buyer country code",
  "buyer electronic address": "Buyer electronic address",
  "scheme identifier": "Scheme identifier",
  "seller identifier": "Seller identifier",
  "seller tax identifier": "Seller VAT Identifier (TRN / TIN)",
  "seller country code": "Seller country code",
  "delivery to country code": "Deliver to country code",
  "deliver to country code": "Deliver to country code",
  "deliver to address line 1 - postal code": "Deliver to post code",
  "deliver to post code": "Deliver to post code",
  "invoicing period start date": "Invoicing period start date",
  "invoicing period end date": "Invoicing period end date",
  "invoice line period start date": "Invoicing period start date",
  "invoice line period end date": "Invoicing period end date",
  "currency exchange rate": "Currency Exchange Rate",
  "invoice currency code": "Invoice Currency Code",
  // IBT-006 tax/VAT accounting currency — backend default (intentional skip; not aliased).
  "source currency code": "Source currency code",
  "invoice total vat amount in tax accounting currency":
    "Invoice total tax amount in tax accounting currency",
  "tax category tax amount in accounting currency":
    "Invoice total tax amount in tax accounting currency",
  "document level charge tax rate": "Tax Rate",
  "document level allowance tax rate": "Tax Rate",
  "document level charge tax category code": "Vat category - charges",
  "document level allowance tax category code": "Vat category - allowances",
  "document level charge": "Charges on document level",
  "document level allowance": "Allowances on document level",
  "charges on document level": "Charges on document level",
  "allowances on document level": "Allowances on document level",
  "third party name": "Third Party Name",
  "third party vatin": "Third Party VATIN",
  "third party address line 1": "Third Party Address Line 1",
  "third party address line 2": "Third Party Address Line 2",
  "third party address line 3": "Third Party Address Line 3",
  "third party city": "Third Party City",
  "third party postal code": "Third Party Postal Code - PO Box Number",
  "third party country code": "Third Party Country Code",
  "customs declaration number": "Customs Declaration number",
  "import date": "Import date",
  "incoterms": "Incoterms",
  "supporting document reference": "Supporting document reference",
  "supporting document uuid": "Supporting document UUID",
  "service type": "Service Type Code",
  "service type code": "Service Type Code",
  "profit margin item reason code": "Profit margin item type code",
  "total amount due": "Total amount due (profit margin)",
  "paid amount": "Paid amount",
  "prepayment invoice number": "Prepayment invoice number",
  "prepayment invoice uuid": "Prepayment invoice UUID",
  "allowance base amount": "Allowances on document level",
  "allowance percentage": "Allowances on document level",
  "charge base amount": "Charges on document level",
  "vat breakdown group": "Tax Category",
  "vat breakdown": "Tax Category",
};

function lookupNormalizedRowKey(candidate: string): string | undefined {
  const n = normKey(candidate);
  if (NORMALIZED_FIELD_TO_ROW_KEY[n]) return NORMALIZED_FIELD_TO_ROW_KEY[n];
  // Prefix match for long matrix Filed prose that starts with a known label.
  for (const [k, v] of Object.entries(NORMALIZED_FIELD_TO_ROW_KEY)) {
    if (n === k || n.startsWith(k + " ") || n.startsWith(k + "-")) return v;
  }
  return undefined;
}

function findSeedHeader(
  want: string,
  seed: Record<string, string>
): string | undefined {
  const n = normKey(want);
  return Object.keys(seed).find((k) => normKey(k) === n);
}

export function resolveConditionalRowKey(
  matrixField: string,
  seed: Record<string, string>
): string {
  for (const candidate of matrixFieldLookupCandidates(matrixField)) {
    const exact =
      CONDITIONAL_FIELD_TO_ROW_KEY[candidate] ??
      MATRIX_FIELD_TO_ROW_KEY[candidate];
    if (exact) return resolveRowKey(exact, seed);

    const normalized = lookupNormalizedRowKey(candidate);
    if (normalized) {
      const hit = findSeedHeader(normalized, seed);
      return hit ?? resolveRowKey(normalized, seed);
    }

    const seedHit = findSeedHeader(candidate, seed);
    if (seedHit) return seedHit;
  }
  return resolveRowKey(matrixField, seed);
}

export function isMappableExcelField(
  matrixField: string,
  seed: Record<string, string>
): boolean {
  const trimmed = matrixField.trim();
  if (!trimmed) return false;
  if (isIntentionalSkipField(trimmed)) return false;
  // Explicit aliases win over pseudo-field prose filter.
  if (CONDITIONAL_FIELD_TO_ROW_KEY[trimmed] || MATRIX_FIELD_TO_ROW_KEY[trimmed]) {
    return true;
  }
  for (const candidate of matrixFieldLookupCandidates(trimmed)) {
    if (isIntentionalSkipField(candidate)) return false;
    if (
      CONDITIONAL_FIELD_TO_ROW_KEY[candidate] ||
      MATRIX_FIELD_TO_ROW_KEY[candidate] ||
      lookupNormalizedRowKey(candidate)
    ) {
      return true;
    }
    if (findSeedHeader(candidate, seed)) return true;
  }
  if (PSEUDO_FIELD_RE.test(trimmed) || PSEUDO_FIELD_RE.test(normalizeMatrixFieldLabel(trimmed))) {
    return false;
  }
  const key = resolveConditionalRowKey(trimmed, seed);
  const want = normKey(key);
  return Object.keys(seed).some((k) => normKey(k) === want);
}

function polarityOf(tc: ConditionalMatrixCase): "positive" | "negative" | "unknown" {
  const p = (tc.polarity || "").toLowerCase();
  if (p === "positive" || p === "negative") return p;
  const t = tc.title.toLowerCase();
  if (t.includes("(positive)")) return "positive";
  if (t.includes("(negative)")) return "negative";
  return "unknown";
}

type MutationPlan = {
  kind:
    | "valid"
    | "blank"
    | "whitespace"
    | "invalid"
    | "omit_null"
    | "trigger_off_blank";
  value: string;
};

/**
 * Peppol / matrix letter codes → Covoro dropdown descriptions written into Excel.
 * Codes (S/E/O/Z) are for understanding rule text only — never write the letter into the cell.
 */
const TAX_CATEGORY_CODE_TO_DESCRIPTION: Record<string, string> = {
  S: FV.STANDARD_TAX_CATEGORY_CODE,
  E: FV.EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
  O: FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
  Z: FV.ZERO_RATED_TAX_CATEGORY_CODE,
};

function isTaxCategoryValueRowKey(rowKey: string): boolean {
  const k = normKey(rowKey);
  if (
    k.includes("tax amount") ||
    k.includes("tax rate") ||
    k.includes("exemption")
  ) {
    return false;
  }
  return (
    k === "tax category" ||
    k.endsWith(" tax category") ||
    k === "vat category" ||
    k.includes("vat category - charges") ||
    k.includes("vat category - allowances")
  );
}

/**
 * Matrix steps/title variant that require the Simplified Tax Invoice dropdown label
 * (not the group prefix "Test Simplified Tax Invoice exception for…").
 */
export function caseWantsSimplifiedTaxInvoice(
  tc: ConditionalMatrixCase
): boolean {
  const steps = tc.steps || "";
  const title = tc.title || "";
  if (
    /Set\s+Invoice\s+Transaction\s+Type\s+Code\s*=\s*Simplified\s+Tax\s+Invoice/i.test(
      steps
    )
  ) {
    return true;
  }
  // Variant clause after the dash, e.g. "… - Simplified Tax Invoice exception and upload…"
  if (/[-–]\s*Simplified\s+Tax\s+Invoice\s+exception\b/i.test(title)) {
    return true;
  }
  return false;
}

/** Counterpart Full Tax Invoice txn when steps explicitly set it. */
function caseWantsFullTaxInvoiceTxn(tc: ConditionalMatrixCase): boolean {
  return /Set\s+Invoice\s+Transaction\s+Type\s+Code\s*=\s*Full\s+Tax\s+Invoice/i.test(
    tc.steps || ""
  );
}

/**
 * Peppol bitmask / aliases → Covoro Invoice Transaction Type Code dropdown description.
 * Never write cryptic codes like X1XXXXXXXXXXXXXXXXXX into Excel.
 */
export function transactionTypeExcelDescription(raw: string): string {
  const t = String(raw ?? "").trim();
  if (!t) return t;
  const n = normKey(t);
  if (
    n === "simplified tax invoice" ||
    n.startsWith("simplified tax") ||
    /^x1x+$/i.test(t)
  ) {
    return FV.TXN_SIMPLIFIED_TAX_INVOICE;
  }
  return t;
}

/** Map S/E/O/Z (or keep / canonicalize known descriptions) for Excel Tax Category cells. */
export function taxCategoryExcelDescription(raw: string): string {
  const t = String(raw ?? "").trim();
  if (!t) return t;
  if (t.length === 1) {
    const mapped = TAX_CATEGORY_CODE_TO_DESCRIPTION[t.toUpperCase()];
    if (mapped) return mapped;
  }
  const n = normKey(t).replace(/\.$/, "");
  for (const desc of Object.values(TAX_CATEGORY_CODE_TO_DESCRIPTION)) {
    if (normKey(desc).replace(/\.$/, "") === n) return desc;
  }
  if (n.startsWith("standard")) return FV.STANDARD_TAX_CATEGORY_CODE;
  if (n.startsWith("exempt")) return FV.EXEMPT_FROM_TAX_TAX_CATEGORY_CODE;
  if (n.startsWith("zero")) return FV.ZERO_RATED_TAX_CATEGORY_CODE;
  if (n.includes("not subject") || n.includes("outside scope")) {
    return FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE;
  }
  return t;
}

/** First quoted Peppol category code in matrix text, else letter from ALIGNED-IBRP-{S|E|O|Z}-*. */
export function inferTaxCategoryCodeFromCase(
  tc: ConditionalMatrixCase
): string | undefined {
  const blob = `${tc.title}\n${tc.description || ""}\n${tc.steps || ""}\n${tc.expected || ""}`;
  const patterns = [
    /Invoiced item (?:Tax Category|VAT category code)\s*(?:\(IBT-151\))?\s*is\s*["']([SEZO])["']/i,
    /VAT [Cc]ategory code\s*(?:\(IBT-118\))?\s*["']([SEZO])["']/i,
    /(?:Tax Category|VAT category(?: code)?)\s+is\s*["']([SEZO])["']/i,
    /IBT-151\)?\s*is\s*["']([SEZO])["']/i,
    /IBT-118\)?\s*["']([SEZO])["']/i,
    /(?:VAT category code|Tax Category|IBT-095|IBT-102)[^\n"']{0,80}["']([SEZO])["']/i,
  ];
  for (const re of patterns) {
    const m = blob.match(re);
    if (m?.[1]) return m[1].toUpperCase();
  }
  const rule = (tc.ruleId || "").toUpperCase();
  const rm = rule.match(/IBRP-([SEZO])-\d+/);
  if (rm) return rm[1];
  return undefined;
}

function normalizeTaxCategoryFieldsInRow(row: Record<string, string>): void {
  for (const key of Object.keys(row)) {
    if (!isTaxCategoryValueRowKey(key)) continue;
    const v = String(row[key] ?? "").trim();
    if (!v) continue;
    row[key] = taxCategoryExcelDescription(v);
  }
}

function isInvoiceTransactionTypeRowKey(rowKey: string): boolean {
  const k = normKey(rowKey);
  return (
    k === "invoice transaction type code" ||
    k === "invoice transaction type" ||
    k.endsWith(" invoice transaction type code")
  );
}

function pickValidValue(
  rowKey: string,
  seed: Record<string, string>,
  preferredTaxCategory?: string,
  preferredTxnType?: string
): string {
  const k = normKey(rowKey);
  if (isTaxCategoryValueRowKey(rowKey)) {
    if (preferredTaxCategory) return preferredTaxCategory;
    const existing = String(seed[rowKey] ?? "").trim();
    if (existing) return taxCategoryExcelDescription(existing);
    return FV.STANDARD_TAX_CATEGORY_CODE;
  }
  if (isInvoiceTransactionTypeRowKey(rowKey)) {
    // Prefer dropdown description (e.g. Simplified Tax Invoice), never short codes.
    if (preferredTxnType) {
      return transactionTypeExcelDescription(preferredTxnType);
    }
    const existing = String(seed[rowKey] ?? "").trim();
    if (existing) return transactionTypeExcelDescription(existing);
    return FV.TXN_FULL_TAX_INVOICE;
  }
  const existing = String(seed[rowKey] ?? "").trim();
  if (existing) return existing;
  if (k.includes("preceding") && k.includes("reference")) return "PREV-OMN-COND-001";
  if (k.includes("preceding") && k.includes("date")) return "2026-01-15";
  if (k.includes("exchange")) return "0.385";
  if (k.includes("tax amount") && k.includes("accounting")) return "5.00";
  if (k.includes("invoice currency")) return FV.OMAN_CURRENCY_USD;
  if (k.includes("line item vat") || (k.includes("vat amount") && k.includes("line"))) {
    return "50";
  }
  if (k.includes("seller vat") || k.includes("buyer vat")) {
    return k.includes("buyer") ? "OM1000091919" : OMAN_SELLER_VAT;
  }
  if (k.includes("seller post")) return "133";
  if (k.includes("tax rate") || k === "tax rate") return FV.TAX_RATE_STANDARD_OMAN;
  if (k.includes("item type")) return FV.ITEM_TYPE_GOODS;
  if (k.includes("classification")) return FV.OMAN_HS_CODE_12;
  if (k.includes("customs")) return "CD-COND-001";
  if (k.includes("import date")) return "2026-01-10";
  if (k.includes("incoterm")) return "Free On Board";
  if (k.includes("invoicing period start")) return "2026-01-01";
  if (k.includes("invoicing period end")) return "2026-01-31";
  if (
    k.includes("allowances on document") ||
    k.includes("charges on document")
  ) {
    return "10.00";
  }
  if (k.includes("credit") && k.includes("reason")) return FV.CREDIT_DEBIT_REASON_SAMPLE;
  if (k.includes("exemption reason code")) return FV.TAX_EXEMPTION_REASON_SAMPLE;
  if (k.includes("service type")) return FV.SERVICE_TYPE_CODE_SAMPLE;
  if (k.includes("supporting document reference")) {
    return FV.SUPPORTING_DOCUMENT_REFERENCE_SAMPLE;
  }
  if (k.includes("supporting document uuid")) {
    return FV.SUPPORTING_DOCUMENT_UUID_SAMPLE;
  }
  if (k.includes("buyer country")) return FV.OMAN_COUNTRY_CODE;
  if (k.includes("deliver to country")) return FV.UAE_COUNTRY_CODE;
  if (k.includes("currency") && !k.includes("exchange")) return FV.OMAN_CURRENCY_USD;
  return existing || "VALID-COND-001";
}

export function planConditionalMutation(
  tc: ConditionalMatrixCase,
  rowKey: string,
  seed: Record<string, string>
): MutationPlan {
  const title = tc.title.toLowerCase();
  const inferredCode = inferTaxCategoryCodeFromCase(tc);
  const preferredTax =
    inferredCode && TAX_CATEGORY_CODE_TO_DESCRIPTION[inferredCode]
      ? TAX_CATEGORY_CODE_TO_DESCRIPTION[inferredCode]
      : undefined;
  const preferredTxn = prefersSimplifiedTaxInvoiceValue(tc)
    ? FV.TXN_SIMPLIFIED_TAX_INVOICE
    : (tc.ruleId || "").trim().toUpperCase() === "IBR-177-OM"
      ? FV.TXN_SELF_BILLED_INVOICE
      : undefined;
  let valid = pickValidValue(rowKey, seed, preferredTax, preferredTxn);
  if (isTaxCategoryValueRowKey(rowKey) && valid) {
    valid = taxCategoryExcelDescription(valid);
  }
  if (isInvoiceTransactionTypeRowKey(rowKey) && valid) {
    valid = transactionTypeExcelDescription(valid);
  }

  if (title.includes("trigger not met")) {
    return { kind: "trigger_off_blank", value: "" };
  }
  if (title.includes("whitespace")) {
    return { kind: "whitespace", value: "   " };
  }
  if (title.includes("omit/null") || title.includes("omit / null") || title.includes("null cell")) {
    return { kind: "omit_null", value: "" };
  }
  if (title.includes("leave blank") || title.includes("clear ") || title.includes("empty")) {
    return { kind: "blank", value: "" };
  }
  if (title.includes("invalid value") || title.includes("wrong label") || title.includes("wrong value")) {
    // IBR-177: Full Tax is a real dropdown value that violates the allowed txn set.
    if ((tc.ruleId || "").trim().toUpperCase() === "IBR-177-OM") {
      return { kind: "invalid", value: FV.TXN_FULL_TAX_INVOICE };
    }
    return {
      kind: "invalid",
      value: InvalidTestData[0]?.label ?? "INVALID-COND-VALUE",
    };
  }
  if (
    title.includes("set valid") ||
    title.includes("valid value") ||
    title.includes("exact required") ||
    polarityOf(tc) === "positive"
  ) {
    return { kind: "valid", value: valid };
  }
  // Default negative → blank; positive → valid
  if (polarityOf(tc) === "negative") {
    return { kind: "blank", value: "" };
  }
  return { kind: "valid", value: valid };
}

/**
 * Apply section overlay, then adjust trigger ON/OFF from title.
 */
export function applyConditionalTriggerOverlay(
  tc: ConditionalMatrixCase,
  seed: Record<string, string>
): Record<string, string> {
  let row = applyDependentOverlay(tc.section, tc.field, { ...seed });
  const title = tc.title.toLowerCase();
  const steps = (tc.steps || "").toLowerCase();
  const blob = `${title}\n${steps}`;

  // Trigger OFF cases: keep commercial full-tax baseline for the controlling fields.
  if (title.includes("trigger not met")) {
    row["Invoice Type Code"] = FV.INVOICE_TYPE_COMMERCIAL_INVOICE;
    row["Invoice Transaction Type Code"] = FV.TXN_FULL_TAX_INVOICE;
    row["Credit note or Debit Note reason code"] = "";
    row["Preceding Invoice reference"] = "";
    row["Preceding Invoice issue date"] = "";
    row["Unique Identifier Number"] = "";
    if (blob.includes("currency") || blob.includes("exchange") || blob.includes("omr")) {
      row["Invoice Currency Code"] = FV.OMAN_CURRENCY_OMR;
      row["Currency Exchange Rate"] = "";
      row["Source currency code"] = FV.OMAN_CURRENCY_OMR;
    }
    normalizeTaxCategoryFieldsInRow(row);
    return applyOmanSellerBuyerIdentity(row);
  }

  // Extra triggers from title/steps when section overlay alone is insufficient.
  if (blob.includes("import of goods")) {
    row["Invoice Transaction Type Code"] = FV.TXN_IMPORT_OF_GOODS;
    row["Import date"] = row["Import date"] || "2026-01-10";
    row["Customs Declaration number"] =
      row["Customs Declaration number"] || "CD-COND-001";
    row["Incoterms"] = row["Incoterms"] || "Free On Board";
  }
  if (blob.includes("summary invoice")) {
    row["Invoice Transaction Type Code"] = FV.TXN_SUMMARY_INVOICE;
    row["Invoicing period start date"] =
      row["Invoicing period start date"] || "2026-01-01";
    row["Invoicing period end date"] =
      row["Invoicing period end date"] || "2026-01-31";
  }
  if (blob.includes("profit margin self")) {
    row["Invoice Transaction Type Code"] = FV.TXN_PROFIT_MARGIN_SELF_INVOICE;
    row["Tax Category"] = FV.NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE;
    row["Tax Rate"] = "";
  }
  // Export + Export of Services (IBR-012 / IBR-013 / IBR-155) trigger overlay.
  if (
    (tc.ruleId || "").trim().toUpperCase() === "IBR-012-OM" ||
    (tc.ruleId || "").trim().toUpperCase() === "IBR-013-OM" ||
    (tc.ruleId || "").trim().toUpperCase() === "IBR-155-OM" ||
    (blob.includes("export invoice") && blob.includes("export of service"))
  ) {
    if (!(tc.title || "").toLowerCase().includes("trigger not met")) {
      row["Invoice Transaction Type Code"] = FV.TXN_EXPORT_INVOICE;
      row["Tax Category"] = FV.ZERO_RATED_TAX_CATEGORY_CODE;
      row["Tax Rate"] = FV.TAX_RATE_ZERO;
      row["Tax exemption reason code"] =
        FV.TAX_EXEMPTION_REASON_EXPORT_OF_SERVICES;
      row["Item Type"] = FV.ITEM_TYPE_SERVICES;
      row["Item classification identifier"] = "";
      row["Deliver to country code"] =
        row["Deliver to country code"] || FV.UAE_COUNTRY_CODE;
      row["Deliver to party name"] =
        row["Deliver to party name"] || "Export Consignee";
      row["Deliver to address line 1"] =
        row["Deliver to address line 1"] || "Export Street 1";
      row["Deliver to city"] = row["Deliver to city"] || "Dubai";
      row["Deliver to post code"] = row["Deliver to post code"] || "00000";
      row["Supporting document reference"] =
        row["Supporting document reference"] ||
        FV.SUPPORTING_DOCUMENT_REFERENCE_SAMPLE;
      row["Supporting document UUID"] =
        row["Supporting document UUID"] || FV.SUPPORTING_DOCUMENT_UUID_SAMPLE;
      row["Service Type Code"] =
        row["Service Type Code"] || FV.SERVICE_TYPE_CODE_SAMPLE;
    }
  }
  if (
    (blob.includes("currency") && blob.includes("not equal to 'omr'")) ||
    blob.includes("invoice currency code (ibt-005) is not equal")
  ) {
    row["Invoice Currency Code"] = FV.OMAN_CURRENCY_USD;
    row["Source currency code"] = FV.OMAN_CURRENCY_OMR;
    row["Currency Exchange Rate"] = row["Currency Exchange Rate"] || "0.385";
  }

  // Compound AND triggers (Export + Export of service exemption).
  const ruleId = (tc.ruleId || "").trim().toUpperCase();
  if (
    ruleId === "IBR-155-OM" ||
    ruleId === "IBR-013-OM" ||
    ruleId === "IBR-012-OM"
  ) {
    if (!title.includes("trigger not met")) {
      row["Invoice Transaction Type Code"] = FV.TXN_EXPORT_INVOICE;
      row[FV.TAX_EXEMPTION_REASON_CODE_FIELD] =
        FV.TAX_EXEMPTION_REASON_EXPORT_OF_SERVICES;
      row[FV.TAX_CATEGORY_FIELD] = FV.ZERO_RATED_TAX_CATEGORY_CODE;
      row[FV.INVOICED_ITEM_TAX_RATE_FIELD] = "0";
      if (ruleId === "IBR-155-OM") {
        row[FV.SERVICE_TYPE_CODE_FIELD] =
          row[FV.SERVICE_TYPE_CODE_FIELD] || FV.SERVICE_TYPE_CODE_SAMPLE;
      }
      if (ruleId === "IBR-013-OM") {
        row[FV.SUPPORTING_DOCUMENT_REFERENCE_FIELD] =
          row[FV.SUPPORTING_DOCUMENT_REFERENCE_FIELD] ||
          FV.SUPPORTING_DOCUMENT_REFERENCE_SAMPLE;
        row[FV.SUPPORTING_DOCUMENT_UUID_FIELD] =
          row[FV.SUPPORTING_DOCUMENT_UUID_FIELD] ||
          FV.SUPPORTING_DOCUMENT_UUID_SAMPLE;
      }
      if (ruleId === "IBR-012-OM") {
        row["Deliver to country code"] =
          row["Deliver to country code"] || FV.UAE_COUNTRY_CODE;
      }
    }
  }

  // Simplified / Full Tax from matrix steps or title variant (description string, not bitmask).
  if (caseWantsSimplifiedTaxInvoice(tc)) {
    row["Invoice Transaction Type Code"] = FV.TXN_SIMPLIFIED_TAX_INVOICE;
  } else if (caseWantsFullTaxInvoiceTxn(tc)) {
    row["Invoice Transaction Type Code"] = FV.TXN_FULL_TAX_INVOICE;
  } else if (row["Invoice Transaction Type Code"]) {
    row["Invoice Transaction Type Code"] = transactionTypeExcelDescription(
      row["Invoice Transaction Type Code"]
    );
  }

  // Matrix/rule may say S/E/O/Z — write the dropdown description into Excel.
  const inferredCode = inferTaxCategoryCodeFromCase(tc);
  if (inferredCode && TAX_CATEGORY_CODE_TO_DESCRIPTION[inferredCode]) {
    row["Tax Category"] = TAX_CATEGORY_CODE_TO_DESCRIPTION[inferredCode];
  }
  normalizeTaxCategoryFieldsInRow(row);

  return applyOmanSellerBuyerIdentity(row);
}

async function resolvePatchHeader(
  rowKey: string,
  templateHeaders: string[]
): Promise<string> {
  const want = normKey(rowKey);
  const hit = templateHeaders.find((h) => normKey(h) === want);
  return hit ?? rowKey;
}

/** Folder name for a PINT-OM ruleId (filesystem-safe). Empty → `_NO_RULEID`. */
export function ruleFolderName(ruleId: string): string {
  const cleaned = (ruleId || "")
    .trim()
    .toUpperCase()
    .replace(/[<>:"/\\|?*]+/g, "_")
    .replace(/\s+/g, "_");
  return cleaned || "_NO_RULEID";
}

/**
 * Pack layout is **by rule**, not matrix section:
 * `TestData/<ruleId>/{positive|negative}/TC-*.xlsx`
 */
function caseOutputDir(
  packRoot: string,
  ruleId: string,
  polarity: "positive" | "negative" | "unknown"
): string {
  const bucket = polarity === "positive" ? "positive" : "negative";
  return path.join(packRoot, ruleFolderName(ruleId), bucket);
}

export async function generateConditionalValidationExcelForCase(
  tc: ConditionalMatrixCase,
  options: {
    packRoot?: string;
    templateHeaders?: string[];
  } = {}
): Promise<ConditionalGeneratePackResult> {
  const packRoot = options.packRoot ?? PACK_ROOT;
  const results = await generateConditionalValidationExcelPack({
    packRoot,
    ids: [tc.id],
    matrixPath: MATRIX_DEFAULT_PATH,
  });
  return (
    results[0] ?? {
      id: tc.id,
      section: tc.section,
      field: tc.field,
      title: tc.title,
      ruleId: tc.ruleId,
      polarity: polarityOf(tc),
      status: "error",
      reason: "no result",
    }
  );
}

function overlayProfileKey(row: Record<string, string>): string {
  const seed = applyOmanSellerBuyerIdentity(buildValidOmanFullTaxInvoiceRow());
  const diffs: string[] = [];
  for (const key of Object.keys(row).sort()) {
    if (String(row[key] ?? "") !== String(seed[key] ?? "")) {
      diffs.push(`${key}=${row[key]}`);
    }
  }
  return diffs.length ? diffs.join("|") : "FULL_TAX_BASE";
}

type BaseCacheEntry = { filePath: string; invoiceNumber: string };

async function getOrCreateConditionalBase(
  overlaid: Record<string, string>,
  cache: Map<string, BaseCacheEntry>
): Promise<BaseCacheEntry> {
  const key = overlayProfileKey(overlaid);
  const hit = cache.get(key);
  if (hit && fs.existsSync(hit.filePath)) return hit;

  const generated = await generateInvoiceFromSubmitData(overlaid);
  patchInvoiceTextCellInFile(
    generated.filePath,
    "Seller VAT Identifier (TRN / TIN)",
    OMAN_SELLER_VAT
  );
  patchInvoiceTextCellInFile(
    generated.filePath,
    "Seller Electronic Address",
    OMAN_SELLER_ELECTRONIC
  );
  patchInvoiceTextCellInFile(
    generated.filePath,
    "Seller Electronic Address Scheme",
    OMAN_ELECTRONIC_SCHEME
  );
  patchInvoiceTextCellInFile(
    generated.filePath,
    "Buyer VAT Identifier",
    OMAN_BUYER_VAT
  );
  patchInvoiceTextCellInFile(
    generated.filePath,
    "Buyer Electronic Address",
    OMAN_BUYER_ELECTRONIC
  );
  patchInvoiceTextCellInFile(
    generated.filePath,
    "Buyer Electronic Address Scheme",
    OMAN_ELECTRONIC_SCHEME
  );
  cache.set(key, generated);
  return generated;
}

function runPythonForStdoutLong(
  script: string,
  args: string[],
  timeoutMs: number
): string {
  const cmd = process.platform === "win32" ? "python" : "python3";
  const quoted = [script, ...args].map((a) => `"${a}"`).join(" ");
  try {
    return execSync(`${cmd} ${quoted}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: timeoutMs,
      windowsHide: true,
    });
  } catch (error: unknown) {
    const stderr =
      error && typeof error === "object" && "stderr" in error
        ? String((error as { stderr?: string }).stderr || "")
        : String(error);
    throw new Error(stderr.trim() || "Python execution failed");
  }
}

export async function generateConditionalValidationExcelPack(options: {
  matrixPath?: string;
  packRoot?: string;
  section?: string;
  ids?: string[];
  ruleId?: string;
  /** When true (default), skip cases whose TC-*.xlsx already exists under packRoot. */
  skipExisting?: boolean;
}): Promise<ConditionalGeneratePackResult[]> {
  const all = loadConditionalValidationMatrix(options.matrixPath);
  let selected = all;
  if (options.section) {
    const want = normKey(options.section);
    selected = selected.filter((c) => normKey(c.section) === want);
  }
  if (options.ruleId) {
    const want = options.ruleId.trim().toUpperCase();
    selected = selected.filter((c) => c.ruleId.toUpperCase() === want);
  }
  if (options.ids?.length) {
    const idSet = new Set(options.ids.map((x) => x.trim().toUpperCase()));
    selected = selected.filter((c) => idSet.has(c.id.toUpperCase()));
  }

  const packRoot = options.packRoot ?? PACK_ROOT;
  const skipExisting = options.skipExisting !== false;
  const templateHeaders = await getCachedInvoiceTemplateHeaders();
  const results: ConditionalGeneratePackResult[] = [];
  const progress = createPackProgressReporter(
    selected.length,
    "conditional-validation-pack"
  );
  const seed = buildValidOmanFullTaxInvoiceRow();
  let alreadyExists = 0;

  type Prepared = {
    tc: ConditionalMatrixCase;
    polarity: "positive" | "negative" | "unknown";
    rowKey: string;
    patchHeader: string;
    mutatedValue: string;
    mutationKind: string;
    overlaid: Record<string, string>;
    profile: string;
    /** Multi-OR expand via MULTI_VALUE_PACK_EXPAND (invoice/txn/tax). */
    multiValue: boolean;
    /** Second column for dual line-period rules (IBT-134 + IBT-135). */
    companionPatch?: { header: string; value: string };
  };

  const prepared: Prepared[] = [];
  for (const tc of selected) {
    const polarity = polarityOf(tc);
    const effectiveField = resolveEffectiveMatrixField(tc);
    const skipReason =
      intentionalSkipReason(tc.field, tc.ruleId) ||
      intentionalSkipReason(effectiveField, tc.ruleId);
    if (skipReason) {
      results.push({
        id: tc.id,
        section: tc.section,
        field: tc.field,
        title: tc.title,
        ruleId: tc.ruleId,
        polarity,
        status: "skipped",
        reason: skipReason,
      });
      progress.tick();
      continue;
    }
    if (!isMappableExcelField(effectiveField, seed)) {
      results.push({
        id: tc.id,
        section: tc.section,
        field: tc.field,
        title: tc.title,
        ruleId: tc.ruleId,
        polarity,
        status: "skipped",
        reason: "unmapped or non-Excel field label",
      });
      progress.tick();
      continue;
    }
    const destPathEarly = path.join(
      caseOutputDir(packRoot, tc.ruleId, polarity),
      `${tc.id}.xlsx`
    );
    if (skipExisting && packOutputAlreadyExists(destPathEarly)) {
      results.push({
        id: tc.id,
        section: tc.section,
        field: tc.field,
        title: tc.title,
        ruleId: tc.ruleId,
        polarity,
        status: "skipped",
        reason: "already exists",
        destPath: destPathEarly,
      });
      alreadyExists += 1;
      progress.tick();
      continue;
    }
    const overlaid = applyConditionalTriggerOverlay(tc, seed);
    const rowKey = resolveConditionalRowKey(effectiveField, overlaid);
    const mutation = planConditionalMutation(tc, rowKey, overlaid);
    const patchHeader = await resolvePatchHeader(rowKey, templateHeaders);
    const multiValue = shouldExpandMultiValuePack(tc);

    let companionPatch: Prepared["companionPatch"];
    if (normKey(effectiveField).includes("invoicing period")) {
      // Document invoicing period only (IBR-037) — pair start/end on same sheet columns.
      const endKey = resolveConditionalRowKey(
        "Invoicing period end date",
        overlaid
      );
      const endHeader = await resolvePatchHeader(endKey, templateHeaders);
      const endValue =
        mutation.kind === "blank" ||
        mutation.kind === "whitespace" ||
        mutation.kind === "omit_null" ||
        mutation.kind === "trigger_off_blank"
          ? mutation.value
          : mutation.kind === "valid"
            ? "2026-01-31"
            : mutation.value;
      overlaid["Invoicing period start date"] =
        mutation.kind === "valid" ? mutation.value || "2026-01-01" : mutation.value;
      overlaid["Invoicing period end date"] = endValue;
      companionPatch = { header: endHeader, value: endValue };
    } else if (isDocumentLevelAllowanceOrChargeRule(tc)) {
      // Dual-patch: primary alias → Allowances; companion → Charges (same mutation).
      const chargeKey = resolveConditionalRowKey(
        "Charges on document level",
        overlaid
      );
      const chargeHeader = await resolvePatchHeader(chargeKey, templateHeaders);
      overlaid["Allowances on document level"] = mutation.value;
      overlaid["Charges on document level"] = mutation.value;
      companionPatch = { header: chargeHeader, value: mutation.value };
    }

    // Multi-value path writes full rows (no clone+patch), so bake mutation into overlay.
    if (multiValue) {
      overlaid[rowKey] = mutation.value;
      applyIbr032CompanionClears(tc, overlaid, mutation.kind);
    }

    prepared.push({
      tc,
      polarity,
      rowKey,
      patchHeader,
      mutatedValue: mutation.value,
      mutationKind: mutation.kind,
      overlaid,
      profile: overlayProfileKey(overlaid),
      multiValue,
      companionPatch,
    });
  }

  const multiPrepared = prepared.filter((p) => p.multiValue);
  const singlePrepared = prepared.filter((p) => !p.multiValue);

  console.log(
    `[conditional-validation-pack] ${prepared.length} to generate (${multiPrepared.length} multi-value, ${singlePrepared.length} single), ${alreadyExists} already exist → ${packRoot}`
  );

  for (const p of multiPrepared) {
    const folder = caseOutputDir(packRoot, p.tc.ruleId, p.polarity);
    fs.mkdirSync(folder, { recursive: true });
    const destPath = path.join(folder, `${p.tc.id}.xlsx`);
    try {
      const rule = (p.tc.ruleId || "").trim().toUpperCase();
      const spec = FV.MULTI_VALUE_PACK_EXPAND[rule]!;
      const applyConflictBits =
        Boolean(spec.conflictBit) &&
        (p.mutationKind === "invalid" ||
          (p.polarity === "negative" &&
            /invalid|wrong|violate/i.test(p.tc.title || "")));
      const typedRows = expandRowByMultiValueSpec(p.overlaid, spec, {
        applyConflictBits,
      }).map((row) =>
        applyOmanSellerBuyerIdentity(
          Object.fromEntries(
            Object.entries(row).map(([k, v]) => [k, v ?? ""])
          ) as Record<string, string>
        )
      );
      // Large OR expansions (e.g. IBR-149 with 9 txn types) routinely exceed 10 minutes under load.
      const generated = await generateDistinctSubmitInvoices(typedRows, {
        fileName: `${p.tc.id}.xlsx`,
        timeoutMs: 1_200_000,
      });
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(generated.filePath, destPath);
      results.push({
        id: p.tc.id,
        section: p.tc.section,
        field: p.tc.field,
        title: p.tc.title,
        ruleId: p.tc.ruleId,
        polarity: p.polarity,
        status: "ok",
        destPath,
        invoiceNumber: generated.invoiceNumbers.join(","),
        mutatedValue: p.mutatedValue,
        rowKey: p.rowKey,
      });
    } catch (err) {
      results.push({
        id: p.tc.id,
        section: p.tc.section,
        field: p.tc.field,
        title: p.tc.title,
        ruleId: p.tc.ruleId,
        polarity: p.polarity,
        status: "error",
        reason: err instanceof Error ? err.message : String(err),
        rowKey: p.rowKey,
        mutatedValue: p.mutatedValue,
      });
    }
    progress.tick();
  }

  const byProfile = new Map<string, Prepared[]>();
  for (const p of singlePrepared) {
    const list = byProfile.get(p.profile) ?? [];
    list.push(p);
    byProfile.set(p.profile, list);
  }

  const batchScript = path.join(
    process.cwd(),
    "utils",
    "batch_clone_patch_invoice.py"
  );
  const tmpDir = path.join(packRoot, "_tmp");
  fs.mkdirSync(tmpDir, { recursive: true });
  const baseCache = new Map<string, BaseCacheEntry>();

  let profileIndex = 0;
  for (const [, group] of byProfile) {
    profileIndex += 1;
    console.log(
      `[conditional-validation-pack] profile ${profileIndex}/${byProfile.size} (${group.length} files)`
    );
    const sample = group[0];
    let base: BaseCacheEntry;
    try {
      base = await getOrCreateConditionalBase(sample.overlaid, baseCache);
    } catch (err) {
      for (const p of group) {
        results.push({
          id: p.tc.id,
          section: p.tc.section,
          field: p.tc.field,
          title: p.tc.title,
          ruleId: p.tc.ruleId,
          polarity: p.polarity,
          status: "error",
          reason: err instanceof Error ? err.message : String(err),
          rowKey: p.rowKey,
          mutatedValue: p.mutatedValue,
        });
        progress.tick();
      }
      continue;
    }

    const jobs = group.map((p) => {
      const folder = caseOutputDir(packRoot, p.tc.ruleId, p.polarity);
      fs.mkdirSync(folder, { recursive: true });
      return {
        destPath: path.join(folder, `${p.tc.id}.xlsx`),
        field: p.patchHeader,
        value: p.mutatedValue,
        meta: p,
      };
    });

    const CHUNK = 500;
    for (let offset = 0; offset < jobs.length; offset += CHUNK) {
      const chunk = jobs.slice(offset, offset + CHUNK);
      // Isolate parallel pack workers (unique UAE_EINVOICE_WORKER_INDEX / pid).
      const workerTag =
        process.env.UAE_EINVOICE_WORKER_INDEX?.trim() || String(process.pid);
      const jobsFile = path.join(
        tmpDir,
        `jobs-w${workerTag}-p${profileIndex}-${offset}-${process.pid}.json`
      );
      fs.writeFileSync(
        jobsFile,
        JSON.stringify({
          basePath: base.filePath,
          sheetName: "E Invoice",
          headerRow: 4,
          dataRow: 6,
          jobs: chunk.map(({ destPath, field, value }) => ({
            destPath,
            field,
            value,
          })),
        }),
        "utf8"
      );

      try {
        const stdout = runPythonForStdoutLong(batchScript, [jobsFile], 1_800_000);
        const parsedOut = JSON.parse(stdout.trim()) as {
          ok?: boolean;
          written?: number;
          errors?: Array<{ destPath: string; error: string }>;
        };
        const errByDest = new Map(
          (parsedOut.errors ?? []).map((e) => [
            path.normalize(e.destPath),
            e.error,
          ])
        );
        for (const job of chunk) {
          const err = errByDest.get(path.normalize(job.destPath));
          if (err) {
            results.push({
              id: job.meta.tc.id,
              section: job.meta.tc.section,
              field: job.meta.tc.field,
              title: job.meta.tc.title,
              ruleId: job.meta.tc.ruleId,
              polarity: job.meta.polarity,
              status: "error",
              reason: err,
              rowKey: job.meta.rowKey,
              mutatedValue: job.meta.mutatedValue,
            });
          } else {
            if (job.meta.companionPatch) {
              try {
                patchInvoiceTextCellInFile(
                  job.destPath,
                  job.meta.companionPatch.header,
                  job.meta.companionPatch.value
                );
              } catch (companionErr) {
                results.push({
                  id: job.meta.tc.id,
                  section: job.meta.tc.section,
                  field: job.meta.tc.field,
                  title: job.meta.tc.title,
                  ruleId: job.meta.tc.ruleId,
                  polarity: job.meta.polarity,
                  status: "error",
                  reason:
                    companionErr instanceof Error
                      ? companionErr.message
                      : String(companionErr),
                  rowKey: job.meta.rowKey,
                  mutatedValue: job.meta.mutatedValue,
                });
                progress.tick();
                continue;
              }
            }
            results.push({
              id: job.meta.tc.id,
              section: job.meta.tc.section,
              field: job.meta.tc.field,
              title: job.meta.tc.title,
              ruleId: job.meta.tc.ruleId,
              polarity: job.meta.polarity,
              status: "ok",
              destPath: job.destPath,
              invoiceNumber: base.invoiceNumber,
              mutatedValue: job.meta.mutatedValue,
              rowKey: job.meta.rowKey,
            });
          }
          progress.tick();
        }
      } catch (err) {
        for (const job of chunk) {
          results.push({
            id: job.meta.tc.id,
            section: job.meta.tc.section,
            field: job.meta.tc.field,
            title: job.meta.tc.title,
            ruleId: job.meta.tc.ruleId,
            polarity: job.meta.polarity,
            status: "error",
            reason: err instanceof Error ? err.message : String(err),
            rowKey: job.meta.rowKey,
            mutatedValue: job.meta.mutatedValue,
          });
          progress.tick();
        }
      }
    }
  }

  progress.forceComplete();
  return results;
}

export function writeConditionalPackReadme(
  results: ConditionalGeneratePackResult[],
  packRoot = PACK_ROOT
): string {
  const ok = results.filter((r) => r.status === "ok");
  const skipped = results.filter((r) => r.status === "skipped");
  const errors = results.filter((r) => r.status === "error");

  const lines: string[] = [
    "# Oman Conditional Validation — Generated Excel TestData",
    "",
    "Generated from `EINV_OMAN_ConditionalValidation_FullMatrix.xlsx`.",
    "Each file is a Full Tax Oman invoice seed (trigger overlay) with the matrix main field mutated per case.",
    "Rules listed in `MULTI_VALUE_PACK_EXPAND` (except trigger-not-met) write **one workbook with N invoices** — one row per alternate OR trigger (invoice type / txn type / tax category), same polarity mutation, distinct invoice numbers. Compound AND rules (IBR-155/013/012) use Export + Export-of-service overlays without multi-row expand.",
    "Rule IBR-177-OM writes **one workbook with two invoices**: Self billed credit note (261) and Self-billed invoice (389), mutating Invoice Transaction Type Code.",
    "Rule IBR-176-OM (Prepayment ⊕ Summary/Deemed/PM-Self) is **not** MULTI_* pack-expanded: matrix TC-611–614 are single-row polarities with a garbled must-not-provide template; the live suite expands the three conflict partners as separate tests (Peppol bit OR).",
    "",
    "## Seller / Buyer identity",
    "",
    `- Seller / Buyer electronic address Scheme: \`${OMAN_ELECTRONIC_SCHEME}\``,
    `- Seller VAT Identifier (TRN / TIN): \`${OMAN_SELLER_VAT}\``,
    `- Seller electronic address: \`${OMAN_SELLER_ELECTRONIC}\``,
    `- Buyer VAT identifier: \`${OMAN_BUYER_VAT}\``,
    `- Buyer electronic address: \`${OMAN_BUYER_ELECTRONIC}\``,
    "",
    "## Folder layout",
    "",
    "```",
    "TestData/<ruleId>/",
    "  positive/             # Polarity=positive (TC-*.xlsx)",
    "  negative/             # Polarity=negative (TC-*.xlsx)",
    "```",
    "",
    "Invoice count per workbook is decided **per rule** (not per section):",
    "- Rules in `MULTI_VALUE_PACK_EXPAND` (except trigger-not-met) → **N invoices** (one row per OR alternate).",
    "- All other mappable TCs → **1 invoice**.",
    "",
    "## Regenerate",
    "",
    "```bash",
    "npx tsx scripts/generate_conditional_validation_oman_excels.ts --all",
    "npx tsx scripts/generate_conditional_validation_oman_excels.ts --rule ALIGNED-IBRP-028-OM",
    "```",
    "",
    "## Summary",
    "",
    "| Status | Count |",
    "|---|---:|",
    `| ok | ${ok.length} |`,
    `| skipped | ${skipped.length} |`,
    `| error | ${errors.length} |`,
    "",
  ];

  const byRule = new Map<string, ConditionalGeneratePackResult[]>();
  for (const r of results) {
    const key = r.ruleId || "_NO_RULEID";
    const list = byRule.get(key) ?? [];
    list.push(r);
    byRule.set(key, list);
  }

  for (const [ruleId, rows] of [...byRule.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  )) {
    lines.push(`## ${ruleId}`);
    lines.push("");
    lines.push("| Test Case ID | Section | Field | Status | File |");
    lines.push("|---|---|---|---|---|");
    for (const r of rows) {
      const rel = r.destPath
        ? path.relative(packRoot, r.destPath).replace(/\\/g, "/")
        : r.reason || "";
      lines.push(
        `| ${r.id} | ${r.section.replace(/\|/g, "/")} | ${r.field.replace(/\|/g, "/")} | ${r.status} | ${rel} |`
      );
    }
    lines.push("");
  }

  if (skipped.length) {
    lines.push("## Skipped (unmapped / non-Excel fields)");
    lines.push("");
    for (const r of skipped.slice(0, 80)) {
      lines.push(`- ${r.id}: ${r.field} — ${r.reason}`);
    }
    if (skipped.length > 80) {
      lines.push(`- … and ${skipped.length - 80} more`);
    }
    lines.push("");
  }

  const readmePath = path.join(packRoot, "README.md");
  fs.mkdirSync(packRoot, { recursive: true });
  fs.writeFileSync(readmePath, lines.join("\n"), "utf8");
  return readmePath;
}

export { MATRIX_DEFAULT_PATH, PACK_ROOT };
