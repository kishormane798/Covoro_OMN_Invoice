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
} from "./ConditionalValidation";
import { formatOmanNumericBoundaryValue } from "./Min_max_field_validation";

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
  /**
   * Messages that must be absent (min/max digit count is accepted).
   */
  forbiddenErrorSubstrings?: string[];
  /**
   * Messages that must be present. Formula mismatch is expected when the
   * isolated amount does not equal tax × FX; limit errors apply to min-1 / max+1.
   */
  requiredErrorSubstrings?: string[];
  /**
   * Optional Item gross price. Submit generation recalculates line/doc totals and
   * IBT-111 (tax × FX) from this value. Needed when FX is 0.0000001 so tax-accounting
   * currency amount stays a valid 2-dp figure.
   */
  itemGrossPrice?: string;
};

function padUuid(base: string, length: number): string {
  if (base.length >= length) return base.slice(0, length);
  return base + "x".repeat(length - base.length);
}

function numericDigits(digitCount: number, decimals: number): string {
  return formatOmanNumericBoundaryValue(digitCount, decimals);
}

const SELLER_VAT = "Seller VAT Identifier (TRN / TIN)";
const BUYER_VAT = "Buyer VAT identifier";
const THIRD_PARTY_VATIN = "Third Party VATIN";
const UNIQUE_UUID = "Unique Identifier Number";
const PREPAY_UUID = "Prepayment invoice UUID";
const SUPPORT_UUID = "Supporting document UUID";
const TAX_RATE = "Tax Rate";
const FX = "Currency Exchange Rate";
const PM_DUE = "Total amount due (profit margin)";

type VatinCaseOpts = {
  /** Happy-path OM+10 — owned by Conditional IBR-003-OM. */
  includeValid?: boolean;
  /**
   * Empty presence — Seller → IBR-006-OM; Third Party → IBR-015-OM.
   * Buyer empty stays in Field (IBR-016 is ID-or-VATIN, not the same).
   */
  includeEmpty?: boolean;
};

function vatinCases(
  field: string,
  section: string,
  overlay: FormatContextOverlay,
  valid: string,
  patchSellerErrors: boolean,
  opts: VatinCaseOpts = {}
): FormatContextFieldCase[] {
  const { includeValid = false, includeEmpty = false } = opts;
  const tooShort = valid.slice(0, 11);
  const tooLong = `${valid}0`;
  const patchValid = field === SELLER_VAT ? false : true;
  const cases: FormatContextFieldCase[] = [];
  if (includeValid) {
    cases.push({
      field,
      section,
      overlay,
      condition: "valid OM + 10 digits (12 chars)",
      value: valid,
      shouldError: false,
      patchAfterGenerate: patchValid,
    });
  }
  if (includeEmpty) {
    cases.push({
      field,
      section,
      overlay,
      condition: "empty",
      value: "",
      shouldError: true,
      patchAfterGenerate: patchSellerErrors || true,
    });
  }
  cases.push(
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
    }
  );
  return cases;
}

type UuidCaseOpts = {
  /** UUID v5 accept — Credit Note owned by Conditional IBR-002-OM. */
  includeValid?: boolean;
  /** Empty — Credit Note owned by Conditional IBR-032-OM. */
  includeEmpty?: boolean;
};

function uuidCases(
  field: string,
  section: string,
  overlay: FormatContextOverlay,
  aboveMaxLen: number,
  opts: UuidCaseOpts = {}
): FormatContextFieldCase[] {
  const { includeValid = true, includeEmpty = true } = opts;
  const cases: FormatContextFieldCase[] = [];
  if (includeValid) {
    cases.push({
      field,
      section,
      overlay,
      condition: "valid UUID v5",
      value: PRECEDING_INVOICE_UUID_SAMPLE,
      shouldError: false,
      patchAfterGenerate: true,
    });
  }
  if (includeEmpty) {
    cases.push({
      field,
      section,
      overlay,
      condition: "empty",
      value: "",
      shouldError: true,
      patchAfterGenerate: true,
    });
  }
  cases.push(
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
    }
  );
  return cases;
}

export const formatContextFieldValidationCases: FormatContextFieldCase[] = [
  // Valid + Seller/TP empty → Conditional IBR-003 / IBR-006 / IBR-015; keep length extras.
  ...vatinCases(SELLER_VAT, "Seller", "none", IBR_003_VALID_SELLER_VATIN, true),
  ...vatinCases(BUYER_VAT, "Buyer", "none", IBR_003_VALID_BUYER_VATIN, false, {
    includeEmpty: true,
  }),
  ...vatinCases(
    THIRD_PARTY_VATIN,
    "Third Party",
    "thirdParty",
    IBR_003_VALID_THIRD_PARTY_VATIN,
    false
  ),
  // CN v5 accept / empty → Conditional IBR-002 / IBR-032; keep whitespace + over-max.
  ...uuidCases(UNIQUE_UUID, "Credit Note", "creditNote", 109, {
    includeValid: false,
    includeEmpty: false,
  }),
  ...uuidCases(PREPAY_UUID, "Prepayment", "prepayment", 109),
  ...uuidCases(SUPPORT_UUID, "Supporting document", "supporting", 65),
  // Length-only Tax Rate; value rules → Conditional S-05 / Formula IBR-046.
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
    condition: "minimum value (0.0000001) with 7 decimals",
    value: numericDigits(1, 7),
    shouldError: false,
    patchAfterGenerate: true,
    itemGrossPrice: "10000000",
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
    field: PM_DUE,
    section: "Invoice",
    overlay: "profitMargin",
    condition: "minimum value (0.01)",
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
    condition: "14 digits (above maximum)",
    value: numericDigits(14, 2),
    shouldError: true,
    patchAfterGenerate: true,
  },
];
