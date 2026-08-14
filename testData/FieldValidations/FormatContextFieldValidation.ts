/**
 * Field-validation cases that need Oman format or extra invoice context
 * (not random AAAA length patches). See
 * docs/superpowers/specs/2026-08-14-format-context-field-validation-design.md
 */
import {
  IBR_003_VALID_BUYER_VATIN,
  IBR_003_VALID_SELLER_VATIN,
  IBR_003_VALID_THIRD_PARTY_VATIN,
  PRECEDING_INVOICE_UUID_SAMPLE,
  TAX_RATE_STANDARD_OMAN,
} from "./ConditionalValidation";

export type FormatContextOverlay =
  | "none"
  | "thirdParty"
  | "creditNote"
  | "prepayment"
  | "supporting"
  | "usdFx"
  | "profitMargin";

export type FormatContextFieldCase = {
  field: string;
  section: string;
  overlay: FormatContextOverlay;
  condition: string;
  value: string;
  shouldError: boolean;
  /** Seller VATIN errors must patch after generate (worker identity). */
  patchAfterGenerate: boolean;
};

function padUuid(base: string, length: number): string {
  if (base.length >= length) return base.slice(0, length);
  return base + "x".repeat(length - base.length);
}

function numericDigits(digitCount: number, decimals: number): string {
  if (digitCount <= 0) return "";
  const intPart = "1".repeat(digitCount);
  if (decimals <= 0) return intPart;
  return `${intPart}.${"0".repeat(decimals)}`;
}

const SELLER_VAT = "Seller VAT Identifier (TRN / TIN)";
const BUYER_VAT = "Buyer VAT identifier";
const THIRD_PARTY_VATIN = "Third Party VATIN";
const UNIQUE_UUID = "Unique Identifier Number";
const PREPAY_UUID = "Prepayment invoice UUID";
const SUPPORT_UUID = "Supporting document UUID";
const TAX_RATE = "Tax Rate";
const FX = "Currency Exchange Rate";
const TAX_ACCT = "Invoice total tax amount in tax accounting currency";
const PM_DUE = "Total amount due (profit margin)";

function vatinCases(
  field: string,
  section: string,
  overlay: FormatContextOverlay,
  valid: string,
  patchSellerErrors: boolean
): FormatContextFieldCase[] {
  const tooShort = valid.slice(0, 11);
  const tooLong = `${valid}0`;
  const patchValid = field === SELLER_VAT ? false : true;
  return [
    {
      field,
      section,
      overlay,
      condition: "valid OM + 10 digits (12 chars)",
      value: valid,
      shouldError: false,
      patchAfterGenerate: patchValid,
    },
    {
      field,
      section,
      overlay,
      condition: "empty",
      value: "",
      shouldError: true,
      patchAfterGenerate: patchSellerErrors || true,
    },
    {
      field,
      section,
      overlay,
      condition: "whitespace only",
      value: "   ",
      shouldError: true,
      patchAfterGenerate: true,
    },
    {
      field,
      section,
      overlay,
      condition: "11 chars (below minimum)",
      value: tooShort,
      shouldError: true,
      patchAfterGenerate: true,
    },
    {
      field,
      section,
      overlay,
      condition: "13 chars (above maximum)",
      value: tooLong,
      shouldError: true,
      patchAfterGenerate: true,
    },
  ];
}

function uuidCases(
  field: string,
  section: string,
  overlay: FormatContextOverlay,
  aboveMaxLen: number
): FormatContextFieldCase[] {
  return [
    {
      field,
      section,
      overlay,
      condition: "valid UUID v5",
      value: PRECEDING_INVOICE_UUID_SAMPLE,
      shouldError: false,
      patchAfterGenerate: true,
    },
    {
      field,
      section,
      overlay,
      condition: "empty",
      value: "",
      shouldError: true,
      patchAfterGenerate: true,
    },
    {
      field,
      section,
      overlay,
      condition: "whitespace only",
      value: "   ",
      shouldError: true,
      patchAfterGenerate: true,
    },
    {
      field,
      section,
      overlay,
      condition: `${aboveMaxLen} chars (above maximum)`,
      value: padUuid(PRECEDING_INVOICE_UUID_SAMPLE, aboveMaxLen),
      shouldError: true,
      patchAfterGenerate: true,
    },
  ];
}

export const formatContextFieldValidationCases: FormatContextFieldCase[] = [
  ...vatinCases(SELLER_VAT, "Seller", "none", IBR_003_VALID_SELLER_VATIN, true),
  ...vatinCases(BUYER_VAT, "Buyer", "none", IBR_003_VALID_BUYER_VATIN, false),
  ...vatinCases(
    THIRD_PARTY_VATIN,
    "Third Party",
    "thirdParty",
    IBR_003_VALID_THIRD_PARTY_VATIN,
    false
  ),
  ...uuidCases(UNIQUE_UUID, "Credit Note", "creditNote", 109),
  ...uuidCases(PREPAY_UUID, "Prepayment", "prepayment", 109),
  ...uuidCases(SUPPORT_UUID, "Supporting document", "supporting", 65),
  {
    field: TAX_RATE,
    section: "Item Tax",
    overlay: "none",
    condition: "valid Standard rate (5)",
    value: TAX_RATE_STANDARD_OMAN,
    shouldError: false,
    patchAfterGenerate: true,
  },
  {
    field: TAX_RATE,
    section: "Item Tax",
    overlay: "none",
    condition: "2 chars (above maximum)",
    value: "55",
    shouldError: true,
    patchAfterGenerate: true,
  },
  {
    field: FX,
    section: "Currency",
    overlay: "usdFx",
    condition: "minimum digits (1) with 7 decimals",
    value: numericDigits(1, 7),
    shouldError: false,
    patchAfterGenerate: true,
  },
  {
    field: FX,
    section: "Currency",
    overlay: "usdFx",
    condition: "maximum digits (7) with 7 decimals",
    value: numericDigits(7, 7),
    shouldError: false,
    patchAfterGenerate: true,
  },
  {
    field: FX,
    section: "Currency",
    overlay: "usdFx",
    condition: "8 digits (above maximum)",
    value: numericDigits(8, 7),
    shouldError: true,
    patchAfterGenerate: true,
  },
  {
    field: TAX_ACCT,
    section: "Invoice",
    overlay: "usdFx",
    condition: "minimum digits (1)",
    value: numericDigits(1, 2),
    shouldError: false,
    patchAfterGenerate: true,
  },
  {
    field: TAX_ACCT,
    section: "Invoice",
    overlay: "usdFx",
    condition: "maximum digits (13)",
    value: numericDigits(13, 2),
    shouldError: false,
    patchAfterGenerate: true,
  },
  {
    field: TAX_ACCT,
    section: "Invoice",
    overlay: "usdFx",
    condition: "14 digits (above maximum)",
    value: numericDigits(14, 2),
    shouldError: true,
    patchAfterGenerate: true,
  },
  {
    field: PM_DUE,
    section: "Invoice",
    overlay: "profitMargin",
    condition: "minimum digits (1)",
    value: numericDigits(1, 2),
    shouldError: false,
    patchAfterGenerate: true,
  },
  {
    field: PM_DUE,
    section: "Invoice",
    overlay: "profitMargin",
    condition: "maximum digits (13)",
    value: numericDigits(13, 2),
    shouldError: false,
    patchAfterGenerate: true,
  },
  {
    field: PM_DUE,
    section: "Invoice",
    overlay: "profitMargin",
    condition: "empty",
    value: "",
    shouldError: true,
    patchAfterGenerate: true,
  },
  {
    field: PM_DUE,
    section: "Invoice",
    overlay: "profitMargin",
    condition: "14 digits (above maximum)",
    value: numericDigits(14, 2),
    shouldError: true,
    patchAfterGenerate: true,
  },
];
