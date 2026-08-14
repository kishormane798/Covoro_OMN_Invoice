/**
 * Build static Oman field-validation Excel packs from
 * `testcase/field_validation/EINV_OMAN_FullMatrix_AllColumns_sectionCategory.xlsx`.
 *
 * Each workbook = dependent/conditional Oman seed + section overlay + one field mutation.
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import {
  applyPartyIdentifiersByTxnType,
  buildValidOmanFullTaxInvoiceRow,
} from "./conditionalValidationHelper";
import * as FV from "../testData/FieldValidations";
import {
  dropdownFieldMasterConfig,
  conditionalDropdownFieldMasterConfig,
  mergeDropdownFieldConfigs,
} from "../testData/FieldValidations/TestDataConfig";
import {
  InvalidTestData,
  electronicAddressSchemeValidTestData,
} from "../testData/FieldValidations/Master";
import {
  fieldInvoice_number,
  fieldValidationMandatory,
  fieldValidationOptional,
  fieldValidationConditional,
  fieldValidationNumeric,
  type FieldLengthRule,
  type FieldNumericRule,
} from "../testData/FieldValidations/Min_max_field_validation";
import {
  generateInvoiceFromSubmitData,
  getCachedInvoiceTemplateHeaders,
  patchInvoiceTextCellInFile,
} from "../utils/invoiceExcel";
import { createPackProgressReporter, packOutputAlreadyExists } from "./packProgressReporter";
import { runPythonForStdout } from "../utils/pythonRunner";

export type FieldValidationMatrixCase = {
  id: string;
  priority: string;
  section: string;
  field: string;
  title: string;
  description: string;
};

export type MutationKind =
  | "dropdown_blank"
  | "dropdown_whitespace"
  | "dropdown_correct"
  | "dropdown_wrong"
  | "dropdown_casing"
  | "dropdown_trim"
  | "length_min"
  | "length_max"
  | "length_above_max"
  | "length_below_min"
  | "format_min"
  | "format_max"
  | "format_below_min"
  | "format_above_max"
  | "field_blank"
  | "field_whitespace"
  | "field_optional_blank"
  | "date_correct_format"
  | "date_other_allowed_format"
  | "date_wrong_format"
  | "date_text"
  | "date_valid"
  | "date_too_short"
  | "date_too_long"
  | "security_formula"
  | "security_html";

export type ParsedMutation = {
  kind: MutationKind;
  polarity: "positive" | "negative" | "unknown";
};

export type GeneratePackResult = {
  id: string;
  section: string;
  field: string;
  title: string;
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
  "field_validation",
  "EINV_OMAN_FullMatrix_AllColumns_sectionCategory.xlsx"
);

const PACK_ROOT = path.join(
  process.cwd(),
  "testcase",
  "field_validation",
  "TestData"
);

/** Matrix field label → seed / submit row key used by Oman builders. */
export const MATRIX_FIELD_TO_ROW_KEY: Record<string, string> = {
  "Seller VAT Identifier": "Seller VAT Identifier (TRN / TIN)",
  "Seller electronic address scheme": "Seller electronic address Scheme",
  "Buyer electronic scheme identifier": "Buyer electronic address Scheme",
  "Buyer Scheme identifier": "Scheme identifier",
  "VAT Category": "Tax Category",
  "VAT Rate": "Tax Rate",
  "Tax Exemption Reason Code": "Tax exemption reason code",
  "VAT exemption reason code": "Tax exemption reason code",
  "VAT exemption reason text": "Tax exemption reason text",
  "Vat Category Code - Charges": "Vat category - charges",
  "Vat Category Code - Allowances": "Vat category - allowances",
  "Allowances On Document Level": "Allowances on document level",
  "Document level charge amount": "Charges on document level",
  "The VAT amount for each line item.": "Line item VAT amount",
  "The total amount of the line including VAT.": "Total amount including VAT",
  "Deliver to country subdivision code": "Deliver to country sub-division",
  "Custom 1 for Item": "custom 1",
  "Custom 2 for Item": "custom 2",
  "Import date": "Import date",
  "Customs Declaration number": "Customs Declaration number",
  "Source currency code": "Source currency code",
  "Credit note or Debit Note reason code": "Credit note or Debit Note reason code",
  "Preceding Invoice reference": "Preceding Invoice reference",
  "Preceding Invoice issue date": "Preceding Invoice issue date",
  "Payment card holder name": "Payment account name",
  "Invoice total tax amount in tax accounting currency":
    "Invoice total tax amount in tax accounting currency",
};

const DIGIT_FIELDS = new Set(
  [
    "Third Party VATIN",
  ].map((s) => s.toLowerCase())
);

const ALL_LENGTH_RULES: FieldLengthRule[] = [
  ...fieldInvoice_number,
  ...fieldValidationMandatory,
  ...fieldValidationOptional,
  ...fieldValidationConditional,
];

const DROPDOWN_CONFIGS = mergeDropdownFieldConfigs(
  dropdownFieldMasterConfig,
  conditionalDropdownFieldMasterConfig,
  [
    {
      field: "Buyer electronic address Scheme",
      master: electronicAddressSchemeValidTestData,
    },
    {
      field: "Seller electronic address Scheme",
      master: electronicAddressSchemeValidTestData,
    },
  ]
);

function normKey(s: string): string {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

/** Line-item exemption columns — not document charges/allowances. */
function isLineTaxExemptionReasonField(fieldNorm: string): boolean {
  return (
    fieldNorm === "tax exemption reason text" ||
    fieldNorm === "tax exemption reason code" ||
    fieldNorm === "vat exemption reason text" ||
    fieldNorm === "vat exemption reason code"
  );
}

export function sectionFolderName(section: string): string {
  return section.trim().replace(/\s+/g, "_").toUpperCase();
}

/** positive | negative | dropdown_positive | dropdown_negative */
export type OutcomeBucket =
  | "positive"
  | "negative"
  | "dropdown_positive"
  | "dropdown_negative";

export function outcomeBucketFromTitle(title: string): OutcomeBucket {
  const cleaned = title.replace(/\s*\(Assumption:.*?\)\s*/gi, " ").trim().toLowerCase();
  const isDropdown = cleaned.includes("dropdown");
  const isPos = cleaned.includes("(positive)");
  const isNeg = cleaned.includes("(negative)");
  if (isDropdown && isPos) return "dropdown_positive";
  if (isDropdown && isNeg) return "dropdown_negative";
  if (isDropdown) return "dropdown_negative";
  if (isPos) return "positive";
  if (isNeg) return "negative";
  return "negative";
}

export function caseOutputDir(
  packRoot: string,
  section: string,
  title: string
): string {
  return path.join(
    packRoot,
    sectionFolderName(section),
    outcomeBucketFromTitle(title)
  );
}

/** Oman seller/buyer identity (EAS 0248 / Oman VATIN scheme + OM-prefixed values). */
export const OMAN_SELLER_VAT = "OM1108202600";
export const OMAN_BUYER_VAT = "OM1000091919";
export const OMAN_SELLER_ELECTRONIC = "OM1108202600";
export const OMAN_BUYER_ELECTRONIC = "OM1000091919";
export const OMAN_ELECTRONIC_SCHEME =
  "Oman Value Added Tax Identification Number (VATIN)";

export function applyOmanSellerBuyerIdentity(
  row: Record<string, string>
): Record<string, string> {
  return {
    ...row,
    "Seller VAT Identifier (TRN / TIN)": OMAN_SELLER_VAT,
    "Buyer VAT identifier": OMAN_BUYER_VAT,
    "Seller electronic address": OMAN_SELLER_ELECTRONIC,
    "Buyer electronic address": OMAN_BUYER_ELECTRONIC,
    "Seller electronic address Scheme": OMAN_ELECTRONIC_SCHEME,
    "Buyer electronic address Scheme": OMAN_ELECTRONIC_SCHEME,
  };
}

export function resolveRowKey(matrixField: string, seed: Record<string, string>): string {
  const aliased = MATRIX_FIELD_TO_ROW_KEY[matrixField] ?? matrixField;
  const want = normKey(aliased);
  for (const key of Object.keys(seed)) {
    if (normKey(key) === want) return key;
  }
  // Prefer alias/matrix wording even if not in seed (writer matches case-insensitively).
  return aliased;
}

export function parseMutationFromTitle(title: string): ParsedMutation | null {
  const cleaned = title.replace(/\s*\(Assumption:.*?\)\s*/gi, " ").trim();
  const m = cleaned.match(/\[[^\]]+\]\s*-\s*(.+)/);
  const body = (m ? m[1] : cleaned).trim().toLowerCase();
  const polarity: ParsedMutation["polarity"] = body.includes("(positive)")
    ? "positive"
    : body.includes("(negative)")
      ? "negative"
      : "unknown";

  const rules: Array<[RegExp, MutationKind]> = [
    [/dropdown\s*-\s*mandatory blank/, "dropdown_blank"],
    [/dropdown\s*-\s*mandatory whitespace/, "dropdown_whitespace"],
    [/dropdown\s*-\s*correct label/, "dropdown_correct"],
    [/dropdown\s*-\s*wrong label/, "dropdown_wrong"],
    [/dropdown\s*-\s*casing variation/, "dropdown_casing"],
    [/dropdown\s*-\s*leading\/trailing spaces/, "dropdown_trim"],
    [/length min accepted/, "length_min"],
    [/length max accepted/, "length_max"],
    [/length above max/, "length_above_max"],
    [/length below min/, "length_below_min"],
    [/format min accepted/, "format_min"],
    [/format max accepted/, "format_max"],
    [/format below min/, "format_below_min"],
    [/format above max/, "format_above_max"],
    [/field\s*-\s*blank rejected/, "field_blank"],
    [/field\s*-\s*whitespace only/, "field_whitespace"],
    [/field\s*-\s*optional blank/, "field_optional_blank"],
    [/date\s*-\s*correct format/, "date_correct_format"],
    [/date\s*-\s*other allowed format/, "date_other_allowed_format"],
    [/date\s*-\s*wrong format/, "date_wrong_format"],
    [/date\s*-\s*text\s*\/\s*non-date/, "date_text"],
    [/date length valid/, "date_valid"],
    [/date length too short/, "date_too_short"],
    [/date length too long/, "date_too_long"],
    [/security\s*-\s*formula injection/, "security_formula"],
    [/security\s*-\s*html\/script injection/, "security_html"],
  ];

  for (const [re, kind] of rules) {
    if (re.test(body)) return { kind, polarity };
  }
  return null;
}

function findLengthRule(rowKey: string): FieldLengthRule | undefined {
  const want = normKey(rowKey);
  return ALL_LENGTH_RULES.find((r) => normKey(r.field) === want);
}

function findNumericRule(rowKey: string): FieldNumericRule | undefined {
  const want = normKey(rowKey);
  return fieldValidationNumeric.find((r) => normKey(r.field) === want);
}

function findDropdownMaster(rowKey: string): readonly { label: string }[] | undefined {
  const want = normKey(rowKey);
  const hit = DROPDOWN_CONFIGS.find((c) => normKey(c.field) === want);
  return hit?.master;
}

function defaultLengthRule(rowKey: string): FieldLengthRule {
  return findLengthRule(rowKey) ?? {
    field: rowKey,
    min: 1,
    max: 64,
    belowMin: 0,
    aboveMax: 65,
  };
}

function repeatChars(n: number, digitField: boolean): string {
  if (n <= 0) return "";
  if (digitField) {
    const digits = "177970000100177970000100";
    let out = "";
    while (out.length < n) out += digits;
    return out.slice(0, n);
  }
  return "A".repeat(n);
}

function formatNumeric(digitCount: number, decimals = 2): string {
  if (digitCount <= 0) return "";
  const intPart = "1".repeat(digitCount);
  if (decimals <= 0) return intPart;
  return `${intPart}.${"0".repeat(decimals)}`;
}

function toggleCase(s: string): string {
  return s
    .split("")
    .map((ch) =>
      ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase()
    )
    .join("");
}

export function buildMutatedValue(
  rowKey: string,
  kind: MutationKind,
  seed: Record<string, string>
): string {
  const digit = DIGIT_FIELDS.has(normKey(rowKey));
  const lengthRule = defaultLengthRule(rowKey);
  const numericRule = findNumericRule(rowKey);
  const master = findDropdownMaster(rowKey);
  const validLabel =
    (String(seed[rowKey] ?? "").trim() ||
      master?.find((x) => x.label.trim())?.label ||
      "Commercial invoice");

  switch (kind) {
    case "dropdown_blank":
    case "field_blank":
    case "field_optional_blank":
      return "";
    case "dropdown_whitespace":
    case "field_whitespace":
      return "   ";
    case "dropdown_correct":
      return validLabel;
    case "dropdown_wrong":
      return InvalidTestData[0]?.label ?? "A123456";
    case "dropdown_casing":
      return toggleCase(validLabel);
    case "dropdown_trim":
      return `  ${validLabel}  `;
    case "length_min":
      return repeatChars(lengthRule.min, digit);
    case "length_max":
      return repeatChars(lengthRule.max, digit);
    case "length_above_max":
      return repeatChars(lengthRule.aboveMax, digit);
    case "length_below_min":
      return repeatChars(lengthRule.belowMin, digit);
    case "format_min": {
      const rule = numericRule ?? { ...lengthRule, decimals: 2 };
      return formatNumeric(rule.min, rule.decimals ?? 2);
    }
    case "format_max": {
      const rule = numericRule ?? { ...lengthRule, decimals: 2 };
      return formatNumeric(rule.max, rule.decimals ?? 2);
    }
    case "format_below_min": {
      const rule = numericRule ?? { ...lengthRule, decimals: 2 };
      return formatNumeric(rule.belowMin, rule.decimals ?? 2);
    }
    case "format_above_max": {
      const rule = numericRule ?? { ...lengthRule, decimals: 2 };
      return formatNumeric(rule.aboveMax, rule.decimals ?? 2);
    }
    case "date_correct_format":
    case "date_valid":
      return "2026-01-15";
    case "date_other_allowed_format":
      return "15-01-2026";
    case "date_wrong_format":
      return "31/02/2026";
    case "date_text":
      return "tesr2345";
    case "date_too_short":
      return "26-7-1";
    case "date_too_long":
      return "2026-07-15T12:00:00.000Z-EXTRA";
    case "security_formula":
      return "=1+1";
    case "security_html":
      return "<script>alert(1)</script>";
    default:
      return "";
  }
}

/**
 * Activate controlling values so conditional-mandatory target fields are in play.
 * Target-field mutation runs afterward (may blank the activated value on purpose).
 */
export function applyDependentOverlay(
  section: string,
  matrixField: string,
  seed: Record<string, string>
): Record<string, string> {
  const row = { ...seed };
  const sec = sectionFolderName(section);
  const fieldKey = resolveRowKey(matrixField, row);
  const fieldNorm = normKey(fieldKey);

  const fillThirdParty = () => {
    row["Invoice Transaction Type Code"] = "Third-party Invoice";
    row["Third Party Name"] = "Oman Third Party LLC";
    row["Third Party VATIN"] = "200009191900";
    row["Third Party Address Line 1"] = "TP Building 1";
    row["Third Party Address Line 2"] = "TP Street";
    row["Third Party Address Line 3"] = "TP Area";
    row["Third Party City"] = "Muscat";
    row["Third Party Postal Code - PO Box Number"] = "100";
    row["Third Party Country Code"] = FV.OMAN_COUNTRY_CODE;
  };

  const fillDelivery = () => {
    row["Deliver to party name"] = "Oman Delivery Partner";
    row["Deliver to address line 1"] = "Warehouse 9";
    row["Deliver to address line 2"] = "Industrial Area";
    row["Deliver to address line 3"] = "Ghala";
    row["Deliver to city"] = "Muscat";
    row["Deliver to post code"] = "130";
    row["Deliver to country sub-division"] = "Mainland Oman.";
    row["Deliver to country code"] = FV.OMAN_COUNTRY_CODE;
  };

  const fillCreditNote = () => {
    row["Invoice Type Code"] = FV.INVOICE_TYPE_CREDIT_NOTE;
    row["Credit note or Debit Note reason code"] = "Cancellation or return";
    row["Preceding Invoice reference"] = "PREV-OMN-001";
    row["Unique Identifier Number"] = "a1b2c3d4-e5f6-5a90-8bcd-ef1234567890";
    row["Preceding Invoice issue date"] = "2026-06-01";
  };

  const fillPrepayment = () => {
    row["Invoice Transaction Type Code"] = "Prepayment Invoice";
    row["Prepayment invoice number"] = "PRE-OMN-001";
    row["Prepayment invoice UUID"] = "prepay-uuid-oman-001";
  };

  const fillImport = () => {
    row["Invoice Transaction Type Code"] = FV.TXN_IMPORT_OF_GOODS;
    row["Import date"] = "2026-06-15";
    row["Customs Declaration number"] = "CUST-OMN-001";
    row["Incoterms"] = "Cost, Insurance, and Freight";
    // IBR-084-OM: origin required for Import of Goods.
    row[FV.ITEM_COUNTRY_OF_ORIGIN_FIELD] =
      row[FV.ITEM_COUNTRY_OF_ORIGIN_FIELD] || "India";
    // IBR-007-OM seller scheme + IBR-153-OM buyer Importer Customs ID.
    const withPartyIds = applyPartyIdentifiersByTxnType(row);
    for (const [key, value] of Object.entries(withPartyIds)) {
      row[key] = value == null ? "" : String(value);
    }
  };

  const fillCurrencyFx = () => {
    row["Invoice Currency Code"] = FV.OMAN_CURRENCY_USD;
    row["Source currency code"] = FV.OMAN_CURRENCY_OMR;
    row["Currency Exchange Rate"] = "0.3850000";
  };

  const fillSupporting = () => {
    row["Supporting document reference"] = "SUP-OMN-001";
    row["Supporting document UUID"] = "supp-uuid-oman-001";
  };

  const fillPeriod = () => {
    row["Invoice Transaction Type Code"] = FV.TXN_SUMMARY_INVOICE;
    row["Invoicing period start date"] = "2026-01-01";
    row["Invoicing period end date"] = "2026-01-31";
  };

  const fillExemptTax = () => {
    // Line exemption reason is valid only with Tax Category = Exempt from tax.
    // Commercial invoice cannot contain only E/O lines — use out-of-scope type.
    row[FV.INVOICE_TYPE_CODE_FIELD] =
      FV.INVOICE_TYPE_CODE_INVOICE_OUT_OF_SCOPE_OF_TAX;
    row[FV.TAX_CATEGORY_FIELD] = FV.EXEMPT_FROM_TAX_TAX_CATEGORY_CODE;
    row[FV.INVOICED_ITEM_TAX_RATE_FIELD] = "";
    row[FV.TAX_EXEMPTION_REASON_CODE_FIELD] = FV.TAX_EXEMPTION_REASON_SAMPLE;
    row[FV.TAX_EXEMPTION_REASON_TEXT_FIELD] = "Exempt supply under Oman VAT";
    row[FV.LINE_ITEM_VAT_AMOUNT_FIELD] = "";
  };

  /** Full Tax + Standard rate context for seller/buyer party-identifier field packs. */
  const fillFullTaxStandardContext = () => {
    row["Invoice Transaction Type Code"] = FV.TXN_FULL_TAX_INVOICE;
    row["Tax Category"] = FV.STANDARD_TAX_CATEGORY_CODE;
    row["Tax Rate"] = FV.TAX_RATE_STANDARD_OMAN;
    row["Tax exemption reason code"] = "";
    row["Tax exemption reason text"] = "";
  };

  /**
   * When testing one of scheme / textual-code / identifier, fill XOR companions
   * (scheme OR textual code, never both) plus identifier so CL-06 / Full Tax hold.
   * The case mutation still overwrites only the target column afterward.
   */
  const fillSellerPartyIdentifierCompanions = () => {
    fillFullTaxStandardContext();
    const scheme = "Tax Identification Number";
    row["Seller identifier - Scheme identifier"] =
      row["Seller identifier - Scheme identifier"] || scheme;
    row["Seller Identifier (textual code)"] = "";
    row["Seller identifier"] = row["Seller identifier"] || "OM-SELLER-001";
  };

  const fillBuyerPartyIdentifierCompanions = () => {
    fillFullTaxStandardContext();
    const scheme = "Tax Identification Number";
    row["Scheme identifier"] = row["Scheme identifier"] || scheme;
    row["Buyer Identifier (textual code)"] = "";
    row["Buyer identifier"] = row["Buyer identifier"] || "OM-BUYER-001";
  };

  switch (sec) {
    case "CREDIT_NOTE_DETAILS":
      fillCreditNote();
      break;
    case "PREPAYMENT_DETAILS":
      fillPrepayment();
      break;
    case "IMPORT_DETAILS":
      fillImport();
      break;
    case "THIRD_PARTY_DETAILS":
      fillThirdParty();
      break;
    case "CURRENCY_DETAILS":
      fillCurrencyFx();
      break;
    case "DELIVERY_DETAILS":
      fillDelivery();
      break;
    case "SUPPPORTING_DOCUMENT":
      fillSupporting();
      break;
    case "INVOICING_PERIOD":
      fillPeriod();
      break;
    case "ITEM_TAX_DETAILS":
      if (isLineTaxExemptionReasonField(fieldNorm)) {
        fillExemptTax();
      }
      break;
    case "PAYMENT_DETAILS":
      row["Payment means type code"] =
        row["Payment means type code"] || "Instrument not defined";
      row["Payment account identifier"] =
        row["Payment account identifier"] || "OM-PAY-001";
      row["Scheme Identifier"] = row["Scheme Identifier"] || "IBAN";
      break;
    case "ITEM_OTHER_DETAILS":
      if (fieldNorm.includes("service")) {
        row["Item Type"] = "Services";
        row["Item classification identifier"] = "";
        row["Service Type Code"] = "SVC-001";
      }
      if (fieldNorm.includes("profit margin")) {
        row["Invoice Transaction Type Code"] = FV.TXN_PROFIT_MARGIN_INVOICE;
        row["Profit margin item type code"] = "Goods";
      }
      if (fieldNorm.includes("attribute")) {
        row["Item attribute name"] = "Color";
        row["Item attribute value"] = "Black";
      }
      break;
    default:
      break;
  }

  // Field-level triggers when section is generic but title says conditional mandatory.
  if (fieldNorm.startsWith("third party")) fillThirdParty();
  if (fieldNorm.startsWith("prepayment")) fillPrepayment();
  if (fieldNorm.includes("preceding") || fieldNorm.includes("credit note")) {
    fillCreditNote();
  }
  if (fieldNorm === "import date" || fieldNorm.includes("customs")) fillImport();
  if (fieldNorm.includes("exchange") || fieldNorm.includes("source currency")) {
    fillCurrencyFx();
  }
  if (fieldNorm.includes("supporting document")) fillSupporting();
  if (fieldNorm.includes("invoicing period")) fillPeriod();
  if (fieldNorm.startsWith("deliver to")) fillDelivery();
  // Line exemption reason text/code: only valid when Tax Category is Exempt from tax.
  if (isLineTaxExemptionReasonField(fieldNorm)) fillExemptTax();

  // Seller / Buyer Identifier trio (scheme + textual code + identifier value).
  const isSellerPartyIdentifierField =
    fieldNorm.includes("seller identifier") ||
    fieldNorm === "seller identifier - scheme identifier";
  const isBuyerPartyIdentifierField =
    fieldNorm.includes("buyer identifier") ||
    fieldNorm === "buyer scheme identifier" ||
    (sec === "BUYER_DETAILS" && fieldNorm === "scheme identifier");
  if (isSellerPartyIdentifierField) fillSellerPartyIdentifierCompanions();
  if (isBuyerPartyIdentifierField) fillBuyerPartyIdentifierCompanions();

  return row;
}

export function loadFieldValidationMatrix(
  matrixPath = MATRIX_DEFAULT_PATH
): FieldValidationMatrixCase[] {
  const script = path.join(
    process.cwd(),
    "utils",
    "read_field_validation_matrix.py"
  );
  const stdout = runPythonForStdout(script, [matrixPath]);
  const parsed = JSON.parse(stdout.trim()) as {
    ok?: boolean;
    error?: string;
    cases?: FieldValidationMatrixCase[];
  };
  if (!parsed.ok || !parsed.cases) {
    throw new Error(parsed.error || `Failed to read matrix: ${stdout}`);
  }
  return parsed.cases;
}

async function resolvePatchHeader(
  rowKey: string,
  templateHeaders: string[]
): Promise<string> {
  const want = normKey(rowKey);
  const hit = templateHeaders.find((h) => normKey(h) === want);
  return hit ?? rowKey;
}

/** Stable key for caching one base workbook per dependent-overlay profile. */
export function overlayProfileKey(section: string, matrixField: string): string {
  const seed = buildValidOmanFullTaxInvoiceRow();
  const overlaid = applyDependentOverlay(section, matrixField, seed);
  const diffs: string[] = [];
  for (const key of Object.keys(overlaid).sort()) {
    if (String(overlaid[key] ?? "") !== String(seed[key] ?? "")) {
      diffs.push(`${key}=${overlaid[key]}`);
    }
  }
  return diffs.length ? diffs.join("|") : "FULL_TAX_BASE";
}

type BaseCacheEntry = { filePath: string; invoiceNumber: string };

async function getOrCreateBaseWorkbook(
  section: string,
  matrixField: string,
  cache: Map<string, BaseCacheEntry>
): Promise<BaseCacheEntry> {
  const key = overlayProfileKey(section, matrixField);
  const hit = cache.get(key);
  if (hit && fs.existsSync(hit.filePath)) return hit;

  const seed = buildValidOmanFullTaxInvoiceRow();
  const overlaid = applyOmanSellerBuyerIdentity(
    applyDependentOverlay(section, matrixField, seed)
  );

  const generated = await generateInvoiceFromSubmitData(overlaid);
  // Force OM identity on base (writer/worker identity can leave buyer electronic without OM).
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

export async function generateFieldValidationExcelForCase(
  tc: FieldValidationMatrixCase,
  options: {
    packRoot?: string;
    baseCache?: Map<string, BaseCacheEntry>;
    templateHeaders?: string[];
  } = {}
): Promise<GeneratePackResult> {
  const packRoot = options.packRoot ?? PACK_ROOT;
  const baseCache = options.baseCache ?? new Map<string, BaseCacheEntry>();
  const parsed = parseMutationFromTitle(tc.title);
  if (!parsed) {
    return {
      id: tc.id,
      section: tc.section,
      field: tc.field,
      title: tc.title,
      status: "skipped",
      reason: "unmapped title pattern",
    };
  }

  const seed = buildValidOmanFullTaxInvoiceRow();
  const overlaid = applyDependentOverlay(tc.section, tc.field, seed);
  const rowKey = resolveRowKey(tc.field, overlaid);
  const mutatedValue = buildMutatedValue(rowKey, parsed.kind, overlaid);

  try {
    const base = await getOrCreateBaseWorkbook(tc.section, tc.field, baseCache);
    const headers =
      options.templateHeaders ?? (await getCachedInvoiceTemplateHeaders());
    const patchHeader = await resolvePatchHeader(rowKey, headers);

    const folder = caseOutputDir(packRoot, tc.section, tc.title);
    fs.mkdirSync(folder, { recursive: true });
    const destPath = path.join(folder, `${tc.id}.xlsx`);
    fs.copyFileSync(base.filePath, destPath);
    // Force exact test value on the durable pack copy (after submit recalc).
    patchInvoiceTextCellInFile(destPath, patchHeader, mutatedValue);

    // If this case mutates seller/buyer VAT, leave that patch; otherwise TIN stays from base.
    return {
      id: tc.id,
      section: tc.section,
      field: tc.field,
      title: tc.title,
      status: "ok",
      destPath,
      invoiceNumber: base.invoiceNumber,
      mutatedValue,
      rowKey,
    };
  } catch (err) {
    return {
      id: tc.id,
      section: tc.section,
      field: tc.field,
      title: tc.title,
      status: "error",
      reason: err instanceof Error ? err.message : String(err),
      rowKey,
      mutatedValue,
    };
  }
}

export async function generateFieldValidationExcelPack(options: {
  matrixPath?: string;
  packRoot?: string;
  section?: string;
  ids?: string[];
  /** Substring match on matrix field label (comma-separated). */
  fields?: string[];
  /** When true (default), skip cases whose TC-*.xlsx already exists under packRoot. */
  skipExisting?: boolean;
}): Promise<GeneratePackResult[]> {
  const all = loadFieldValidationMatrix(options.matrixPath);
  let selected = all;
  if (options.section) {
    const want = normKey(options.section);
    selected = selected.filter((c) => normKey(c.section) === want);
  }
  if (options.ids?.length) {
    const idSet = new Set(options.ids.map((x) => x.trim().toUpperCase()));
    selected = selected.filter((c) => idSet.has(c.id.toUpperCase()));
  }
  if (options.fields?.length) {
    const needles = options.fields.map((f) => normKey(f)).filter(Boolean);
    selected = selected.filter((c) => {
      const field = normKey(c.field);
      return needles.some((n) => field === n || field.includes(n));
    });
  }

  const packRoot = options.packRoot ?? PACK_ROOT;
  const skipExisting = options.skipExisting !== false;
  const baseCache = new Map<string, BaseCacheEntry>();
  const templateHeaders = await getCachedInvoiceTemplateHeaders();
  const results: GeneratePackResult[] = [];
  const progress = createPackProgressReporter(
    selected.length,
    "field-validation-pack"
  );

  // Group by overlay profile so we generate one base, then batch-clone+patch.
  type Prepared = {
    tc: FieldValidationMatrixCase;
    parsed: ParsedMutation;
    rowKey: string;
    patchHeader: string;
    mutatedValue: string;
    profile: string;
  };
  const prepared: Prepared[] = [];
  let alreadyExists = 0;
  for (const tc of selected) {
    const parsed = parseMutationFromTitle(tc.title);
    if (!parsed) {
      results.push({
        id: tc.id,
        section: tc.section,
        field: tc.field,
        title: tc.title,
        status: "skipped",
        reason: "unmapped title pattern",
      });
      progress.tick();
      continue;
    }
    const destPath = path.join(
      caseOutputDir(packRoot, tc.section, tc.title),
      `${tc.id}.xlsx`
    );
    if (skipExisting && packOutputAlreadyExists(destPath)) {
      results.push({
        id: tc.id,
        section: tc.section,
        field: tc.field,
        title: tc.title,
        status: "skipped",
        reason: "already exists",
        destPath,
      });
      alreadyExists += 1;
      progress.tick();
      continue;
    }
    const seed = buildValidOmanFullTaxInvoiceRow();
    const overlaid = applyDependentOverlay(tc.section, tc.field, seed);
    const rowKey = resolveRowKey(tc.field, overlaid);
    const mutatedValue = buildMutatedValue(rowKey, parsed.kind, overlaid);
    const patchHeader = await resolvePatchHeader(rowKey, templateHeaders);
    prepared.push({
      tc,
      parsed,
      rowKey,
      patchHeader,
      mutatedValue,
      profile: overlayProfileKey(tc.section, tc.field),
    });
  }

  const byProfile = new Map<string, Prepared[]>();
  for (const p of prepared) {
    const list = byProfile.get(p.profile) ?? [];
    list.push(p);
    byProfile.set(p.profile, list);
  }

  console.log(
    `[field-validation-pack] ${prepared.length} to generate, ${alreadyExists} already exist, ${byProfile.size} overlay profiles → ${packRoot}`
  );

  const batchScript = path.join(
    process.cwd(),
    "utils",
    "batch_clone_patch_invoice.py"
  );
  const tmpDir = path.join(packRoot, "_tmp");
  fs.mkdirSync(tmpDir, { recursive: true });

  let profileIndex = 0;
  for (const [profile, group] of byProfile) {
    profileIndex += 1;
    console.log(
      `[field-validation-pack] profile ${profileIndex}/${byProfile.size} (${group.length} files)`
    );
    const sample = group[0];
    let base: BaseCacheEntry;
    try {
      base = await getOrCreateBaseWorkbook(
        sample.tc.section,
        sample.tc.field,
        baseCache
      );
    } catch (err) {
      for (const p of group) {
        results.push({
          id: p.tc.id,
          section: p.tc.section,
          field: p.tc.field,
          title: p.tc.title,
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
      const folder = caseOutputDir(packRoot, p.tc.section, p.tc.title);
      fs.mkdirSync(folder, { recursive: true });
      return {
        destPath: path.join(folder, `${p.tc.id}.xlsx`),
        field: p.patchHeader,
        value: p.mutatedValue,
        meta: p,
      };
    });

    // One Python process per profile when possible (single load + mutate/save/restore).
    const CHUNK = 500;
    for (let offset = 0; offset < jobs.length; offset += CHUNK) {
      const chunk = jobs.slice(offset, offset + CHUNK);
      const jobsFile = path.join(
        tmpDir,
        `jobs-${profileIndex}-${offset}.json`
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
          (parsedOut.errors ?? []).map((e) => [path.normalize(e.destPath), e.error])
        );
        for (const job of chunk) {
          const err = errByDest.get(path.normalize(job.destPath));
          if (err) {
            results.push({
              id: job.meta.tc.id,
              section: job.meta.tc.section,
              field: job.meta.tc.field,
              title: job.meta.tc.title,
              status: "error",
              reason: err,
              rowKey: job.meta.rowKey,
              mutatedValue: job.meta.mutatedValue,
            });
          } else {
            results.push({
              id: job.meta.tc.id,
              section: job.meta.tc.section,
              field: job.meta.tc.field,
              title: job.meta.tc.title,
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

/** Long-running Python (batch pack writer). */
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

export function writePackReadme(
  results: GeneratePackResult[],
  packRoot = PACK_ROOT
): string {
  const bySection = new Map<string, GeneratePackResult[]>();
  for (const r of results) {
    const list = bySection.get(r.section) ?? [];
    list.push(r);
    bySection.set(r.section, list);
  }

  const lines: string[] = [
    "# Oman Field Validation — Generated Excel TestData",
    "",
    "Generated from `EINV_OMAN_FullMatrix_AllColumns_sectionCategory.xlsx`.",
    "Each file is a Full Tax Oman invoice seed (dependent/conditional overlays) with one field mutated per test case.",
    "",
    "## Seller / Buyer identity (UAE TIN scheme + OM values)",
    "",
    "- Seller / Buyer electronic address Scheme: `Oman Value Added Tax Identification Number (VATIN)`",
    `- Seller VAT Identifier (TRN / TIN): \`${OMAN_SELLER_VAT}\``,
    `- Seller electronic address: \`${OMAN_SELLER_ELECTRONIC}\``,
    "- Buyer VAT identifier: `OM1000091919`",
    "- Buyer electronic address: `OM1000091919`",
    "",
    "## Folder layout",
    "",
    "```",
    "TestData/<SECTION>/",
    "  positive/ | negative/ | dropdown_positive/ | dropdown_negative/",
    "```",
    "",
    "- `positive` / `negative` — non-dropdown field cases (one Excel per TC-id)",
    "- `dropdown_positive` — full Oman multi-invoice Excel per field (all master labels + casing)",
    "- `dropdown_negative` — full Oman multi-invoice Excel (blank / whitespace / InvalidTestData)",
    "- Each dropdown invoice row fills all Oman columns; only the target dropdown column varies",
    "",
    "Source Currency Code defaults to `OMR` (same as Invoice Currency) on Oman seed.",
    "",
    "## Regenerate",
    "",
    "```bash",
    "npx tsx scripts/generate_field_validation_oman_excels.ts --section \"DOCUMENT DETAILS\"",
    "npx tsx scripts/generate_field_validation_oman_excels.ts --all",
    "npx tsx scripts/generate_dropdown_field_packs.ts",
    "```",
    "",
    "## Summary",
    "",
    `| Status | Count |`,
    `|---|---:|`,
    `| ok | ${results.filter((r) => r.status === "ok").length} |`,
    `| skipped | ${results.filter((r) => r.status === "skipped").length} |`,
    `| error | ${results.filter((r) => r.status === "error").length} |`,
    "",
  ];

  for (const [section, list] of [...bySection.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  )) {
    lines.push(`## ${section}`, "");
    lines.push(`| Test Case ID | Field | Status | File |`);
    lines.push(`|---|---|---|---|`);
    for (const r of list.sort((a, b) =>
      a.id.localeCompare(b.id, undefined, { numeric: true })
    )) {
      const rel = r.destPath
        ? path.relative(packRoot, r.destPath).replace(/\\/g, "/")
        : r.reason ?? "";
      lines.push(`| ${r.id} | ${r.field} | ${r.status} | ${rel} |`);
    }
    lines.push("");
  }

  const skipped = results.filter((r) => r.status !== "ok");
  if (skipped.length) {
    lines.push("## Skips / errors", "");
    for (const r of skipped) {
      lines.push(`- ${r.id}: ${r.status} — ${r.reason ?? ""}`);
    }
    lines.push("");
  }

  fs.mkdirSync(packRoot, { recursive: true });
  const readmePath = path.join(packRoot, "README.md");
  fs.writeFileSync(readmePath, lines.join("\n"), "utf8");
  return readmePath;
}

export { MATRIX_DEFAULT_PATH, PACK_ROOT };
