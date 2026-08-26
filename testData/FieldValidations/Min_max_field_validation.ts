/**
 * Oman (OMN) min/max configs for field validation; unified `invoiceFormulaScenarios`
 * with derived success/error rows for formula tests.
 * Field names match `FULL_TEMPLATE_HEADERS` in invoiceColumnMapping.ts.
 */

export type FieldLengthRule = {
  field: string;
  min: number;
  max: number;
  belowMin: number;
  aboveMax: number;
};

/** Digit/decimal amount rules: min/max are total digit counts (integer part); see `decimals`. */
export type FieldNumericRule = FieldLengthRule & {
  /** Decimal places allowed (Oman amount fields use 2; exchange rate uses 6–7). */
  decimals?: number;
  /**
   * Isolated minimum-value patch fails Peppol formula (wrong calculation).
   * Default false: length-valid min is accepted.
   */
  minExpectsError?: boolean;
  /**
   * Isolated maximum-digit patch fails Peppol formula (wrong calculation).
   * Default false: length-valid max is accepted.
   */
  maxExpectsError?: boolean;
  /**
   * Empty (belowMin === 0) fails length ("should be more than …").
   * Default false: empty is accepted for optional amounts.
   */
  emptyExpectsError?: boolean;
  /**
   * Skip the empty-value numeric test (presence owned by Conditional).
   * Digits min/max/aboveMax still run.
   */
  omitEmptyTest?: boolean;
  /**
   * Signed amounts: negative of the min boundary is accepted (e.g. rounding).
   * Default false: only unsigned (positive) values are generated.
   */
  allowsNegative?: boolean;
};

/** Formula output columns — isolated min/max patches fail calculation; empty fails length. */
export const FORMULA_OUTPUT_NUMERIC_FIELDS = [
  "Item net price",
  "Invoice line net amount",
  "Line item VAT amount",
  "Total amount including VAT",
  "Sum of Invoice line net amount",
  "Invoice total amount without tax",
  "Invoice total tax amount",
  "Invoice total amount with tax",
  "Amount due for payment",
] as const;

/**
 * IBR-062-OM / IBR-064-OM: a document-level allowance or charge amount with
 * empty VAT category fails on the VAT dropdown, not the amount column.
 */
export function documentLevelAmountVatErrorField(
  targetField: string
): string | undefined {
  const key = targetField.replace(/\s+/g, " ").trim().toLowerCase();
  if (key === "allowances on document level") return "Vat category - allowances";
  if (key === "charges on document level") return "Vat category - charges";
  return undefined;
}

/** Error-file fields to accept for a formula numeric case (patched column or a related total). */
export function formulaNumericRelatedErrorFields(targetField: string): string[] {
  const vatErrorField = documentLevelAmountVatErrorField(targetField);
  if (vatErrorField) return [vatErrorField];
  return [...new Set([targetField, ...FORMULA_OUTPUT_NUMERIC_FIELDS])];
}

/** Smallest positive Oman amount/qty for boundary tests (0.01 @ 2 dp, 0.0000001 @ 7 dp). */
export function formatOmanNumericBoundaryValue(
  digitCount: number,
  decimals = 2
): string {
  if (digitCount <= 0) return "";
  if (digitCount === 1 && decimals > 0) {
    return (1 / 10 ** decimals).toFixed(decimals);
  }
  const intPart = "1".repeat(digitCount);
  if (decimals <= 0) return intPart;
  return `${intPart}.${"0".repeat(decimals)}`;
}

export const fieldInvoice_number: FieldLengthRule[] = [
  { field: "Invoice Number", min: 1, max: 64, belowMin: 0, aboveMax: 65 },
];

export const fieldValidationMandatory: FieldLengthRule[] = [
  { field: "Seller name", min: 1, max: 300, belowMin: 0, aboveMax: 301 },
  { field: "Seller electronic address", min: 1, max: 30, belowMin: 0, aboveMax: 31 },
  { field: "Seller address line 1", min: 1, max: 300, belowMin: 0, aboveMax: 301 },
  { field: "Seller address line 2", min: 1, max: 300, belowMin: 0, aboveMax: 301 },
  { field: "Seller address line 3", min: 1, max: 300, belowMin: 0, aboveMax: 301 },
  { field: "Seller city", min: 1, max: 64, belowMin: 0, aboveMax: 65 },
  { field: "Seller post code", min: 1, max: 15, belowMin: 0, aboveMax: 16 },
  { field: "Buyer name", min: 1, max: 300, belowMin: 0, aboveMax: 301 },
  { field: "Buyer electronic address", min: 1, max: 30, belowMin: 0, aboveMax: 31 },
  { field: "Buyer address line 1", min: 1, max: 300, belowMin: 0, aboveMax: 301 },
  { field: "Buyer address line 2", min: 1, max: 300, belowMin: 0, aboveMax: 301 },
  { field: "Buyer address line 3", min: 1, max: 300, belowMin: 0, aboveMax: 301 },
  { field: "Buyer city", min: 1, max: 64, belowMin: 0, aboveMax: 65 },
  { field: "Buyer post code", min: 1, max: 15, belowMin: 0, aboveMax: 16 },
  { field: "Invoice line identifier", min: 1, max: 15, belowMin: 0, aboveMax: 16 },
  { field: "Item name", min: 1, max: 300, belowMin: 0, aboveMax: 301 },
];

export const fieldValidationOptional: FieldLengthRule[] = [
  { field: "Purchase Order Number", min: 1, max: 64, belowMin: 0, aboveMax: 65 },
  { field: "Deliver to party name", min: 1, max: 300, belowMin: 0, aboveMax: 301 },
  { field: "Deliver to country sub-division", min: 1, max: 64, belowMin: 0, aboveMax: 65 },
  { field: "Item description", min: 1, max: 300, belowMin: 0, aboveMax: 301 },
  { field: "Tax exemption reason text", min: 1, max: 300, belowMin: 0, aboveMax: 301 },
  { field: "Item Custom 1", min: 1, max: 300, belowMin: 0, aboveMax: 301 },
  { field: "Item Custom 2", min: 1, max: 300, belowMin: 0, aboveMax: 301 },
  { field: "Payment card primary account number", min: 1, max: 50, belowMin: 0, aboveMax: 51 },
  { field: "Custom 1", min: 1, max: 300, belowMin: 0, aboveMax: 301 },
  { field: "Custom 2", min: 1, max: 300, belowMin: 0, aboveMax: 301 },
  { field: "Custom 3", min: 1, max: 300, belowMin: 0, aboveMax: 301 },
  { field: "Custom 4", min: 1, max: 300, belowMin: 0, aboveMax: 301 },
  { field: "Custom 5", min: 1, max: 300, belowMin: 0, aboveMax: 301 },
];

/** Conditional Mandatory string/length fields (Oman). */
export const fieldValidationConditional: FieldLengthRule[] = [
  { field: "Prepayment invoice number", min: 1, max: 64, belowMin: 0, aboveMax: 65 },
  { field: "Prepayment invoice UUID", min: 1, max: 108, belowMin: 0, aboveMax: 109 },
  { field: "Customs Declaration number", min: 1, max: 64, belowMin: 0, aboveMax: 65 },
  { field: "Preceding Invoice reference", min: 1, max: 64, belowMin: 0, aboveMax: 65 },
  { field: "Unique Identifier Number", min: 1, max: 108, belowMin: 0, aboveMax: 109 },
  { field: "Seller identifier", min: 1, max: 30, belowMin: 0, aboveMax: 31 },
  { field: "Seller VAT Identifier (TRN / TIN)", min: 12, max: 12, belowMin: 11, aboveMax: 13 },
  { field: "Third Party Name", min: 1, max: 300, belowMin: 0, aboveMax: 301 },
  { field: "Third Party VATIN", min: 12, max: 12, belowMin: 11, aboveMax: 13 },
  { field: "Third Party Address Line 1", min: 1, max: 300, belowMin: 0, aboveMax: 301 },
  { field: "Third Party Address Line 2", min: 1, max: 300, belowMin: 0, aboveMax: 301 },
  { field: "Third Party Address Line 3", min: 1, max: 300, belowMin: 0, aboveMax: 301 },
  { field: "Third Party City", min: 1, max: 64, belowMin: 0, aboveMax: 65 },
  { field: "Third Party Postal Code - PO Box Number", min: 1, max: 15, belowMin: 0, aboveMax: 16 },
  { field: "Buyer identifier", min: 1, max: 30, belowMin: 0, aboveMax: 31 },
  { field: "Buyer VAT identifier", min: 12, max: 12, belowMin: 11, aboveMax: 13 },
  { field: "Deliver to address line 1", min: 1, max: 300, belowMin: 0, aboveMax: 301 },
  { field: "Deliver to address line 2", min: 1, max: 300, belowMin: 0, aboveMax: 301 },
  { field: "Deliver to address line 3", min: 1, max: 300, belowMin: 0, aboveMax: 301 },
  { field: "Deliver to city", min: 1, max: 64, belowMin: 0, aboveMax: 65 },
  { field: "Deliver to post code", min: 1, max: 15, belowMin: 0, aboveMax: 16 },
  { field: "Item classification identifier", min: 1, max: 15, belowMin: 0, aboveMax: 16 },
  { field: "Item attribute name", min: 1, max: 300, belowMin: 0, aboveMax: 301 },
  { field: "Item attribute value", min: 1, max: 300, belowMin: 0, aboveMax: 301 },
  { field: "Supporting document reference", min: 1, max: 64, belowMin: 0, aboveMax: 65 },
  { field: "Supporting document UUID", min: 1, max: 64, belowMin: 0, aboveMax: 65 },
  { field: "Scheme Identifier - Payment", min: 1, max: 10, belowMin: 0, aboveMax: 11 },
  { field: "Payment account identifier", min: 1, max: 35, belowMin: 0, aboveMax: 36 },
  /** Tax Rate: Oman length rule 1–1 (single character / single digit). */
  { field: "Tax Rate", min: 1, max: 1, belowMin: 0, aboveMax: 2 },
];

/**
 * Numeric amount / quantity / rate rules (Oman).
 * min/max = digit count of the integer part (or total significant digits for quantities).
 * belowMin/aboveMax used like length suites for out-of-range digit counts.
 */
export const fieldValidationNumeric: FieldNumericRule[] = [
  /** Exchange rate: min 1 digit + 6 decimals; max 7 digits + 7 decimals. */
  { field: "Currency Exchange Rate", min: 1, max: 7, belowMin: 0, aboveMax: 8, decimals: 7 },
  {
    field: "Item price base quantity",
    min: 1,
    max: 10,
    belowMin: 0,
    aboveMax: 11,
    decimals: 2,
    emptyExpectsError: true,
  },
  {
    field: "Item gross price",
    min: 1,
    max: 13,
    belowMin: 0,
    aboveMax: 14,
    decimals: 2,
    emptyExpectsError: true,
  },
  {
    field: "Item price discount",
    min: 1,
    max: 13,
    belowMin: 0,
    aboveMax: 14,
    decimals: 2,
    maxExpectsError: true,
  },
  {
    field: "Item net price",
    min: 1,
    max: 13,
    belowMin: 0,
    aboveMax: 14,
    decimals: 2,
    minExpectsError: true,
    maxExpectsError: true,
    emptyExpectsError: true,
  },
  {
    field: "Invoiced quantity",
    min: 1,
    max: 10,
    belowMin: 0,
    aboveMax: 11,
    decimals: 2,
    emptyExpectsError: true,
  },
  { field: "Invoice line charge amount", min: 1, max: 13, belowMin: 0, aboveMax: 14, decimals: 2 },
  {
    field: "Invoice line allowance amount",
    min: 1,
    max: 13,
    belowMin: 0,
    aboveMax: 14,
    decimals: 2,
    maxExpectsError: true,
  },
  {
    field: "Invoice line net amount",
    min: 1,
    max: 13,
    belowMin: 0,
    aboveMax: 14,
    decimals: 2,
    minExpectsError: true,
    maxExpectsError: true,
    emptyExpectsError: true,
  },
  {
    field: "Line item VAT amount",
    min: 1,
    max: 13,
    belowMin: 0,
    aboveMax: 14,
    decimals: 2,
    minExpectsError: true,
    maxExpectsError: true,
    // Empty presence → Conditional IBR-038-OM (Full Tax / Simplified matrix).
    omitEmptyTest: true,
  },

  {
    field: "Total amount including VAT",
    min: 1,
    max: 13,
    belowMin: 0,
    aboveMax: 14,
    decimals: 2,
    minExpectsError: true,
    maxExpectsError: true,
    emptyExpectsError: true,
  },
  {
    field: "Sum of Invoice line net amount",
    min: 1,
    max: 13,
    belowMin: 0,
    aboveMax: 14,
    decimals: 2,
    minExpectsError: true,
    maxExpectsError: true,
    emptyExpectsError: true,
  },
  {
    field: "Charges on document level",
    min: 1,
    max: 13,
    belowMin: 0,
    aboveMax: 14,
    decimals: 2,
    minExpectsError: true,
    maxExpectsError: true,
  },
  {
    field: "Allowances on document level",
    min: 1,
    max: 13,
    belowMin: 0,
    aboveMax: 14,
    decimals: 2,
    minExpectsError: true,
    maxExpectsError: true,
  },
  {
    field: "Invoice total amount without tax",
    min: 1,
    max: 13,
    belowMin: 0,
    aboveMax: 14,
    decimals: 2,
    minExpectsError: true,
    maxExpectsError: true,
    emptyExpectsError: true,
  },
  {
    field: "Invoice total tax amount",
    min: 1,
    max: 13,
    belowMin: 0,
    aboveMax: 14,
    decimals: 2,
    minExpectsError: true,
    maxExpectsError: true,
    emptyExpectsError: true,
  },
  {
    field: "Invoice total amount with tax",
    min: 1,
    max: 13,
    belowMin: 0,
    aboveMax: 14,
    decimals: 2,
    minExpectsError: true,
    maxExpectsError: true,
    emptyExpectsError: true,
  },
  {
    field: "Paid amount",
    min: 1,
    max: 13,
    belowMin: 0,
    aboveMax: 14,
    decimals: 2,
    // Min 0.01 is accepted when IBR-058-OM companions (prepayment number + UUID) are filled.
    maxExpectsError: true,
  },
  {
    field: "Rounding amount",
    min: 1,
    max: 13,
    belowMin: 0,
    aboveMax: 14,
    decimals: 2,
    // Optional empty/positive stay in Field; negative rounding → Conditional IBR-137-OM.
  },

  {
    field: "Amount due for payment",
    min: 1,
    max: 13,
    belowMin: 0,
    aboveMax: 14,
    decimals: 2,
    minExpectsError: true,
    maxExpectsError: true,
    emptyExpectsError: true,
  },
  {
    field: "Invoice total tax amount in tax accounting currency",
    min: 1,
    max: 13,
    belowMin: 0,
    aboveMax: 14,
    decimals: 2,
  },
  { field: "Total amount due (profit margin)", min: 1, max: 13, belowMin: 0, aboveMax: 14, decimals: 2 },
];

export type InvoiceFormulaScenario = {
  name: string;
  expect: "success" | "error";
  errorField?: string;
  /** When true, run only for non-OMR currency (invalid exchange rate has no OMR analogue). */
  nonOmrOnly?: boolean;
  taxCategory?: string | null;
  taxExemptionReasonCode?: string | null;
  taxExemptionReasonText?: string | null;
  invoiceTypeCode?: string | null;
  paymentMeansTypeCode?: string | null;
  invoiceTransactionTypeCode?: string | null;
  itemPriceBaseQty?: number | string | null;
  itemGrossPrice?: number | string | null;
  itemPriceDiscount?: number | string | null;
  invoicedQty?: number | string | null;
  lineCharge?: number | string | null;
  lineAllowance?: number | string | null;
  taxRate?: number | string | null;
  docCharges?: number | null;
  docAllowances?: number | null;
  paidAmount?: number | null;
  roundingAmount?: number | null;
  currencyRate?: number | null;
  /** Optional item text for formula Excel writes (e.g. multiline `\n` in description / classification). */
  invoiceLineIdentifier?: string | null;
  itemName?: string | null;
  itemDescription?: string | null;
  itemClassificationIdentifier?: string | null;
};

export const invoiceFormulaScenarios: InvoiceFormulaScenario[] = [
{
expect: "success",
name: "Base Minimum values",
itemPriceBaseQty:0.01,
itemGrossPrice:0.01,
itemPriceDiscount:0,
invoicedQty:0.01,
lineCharge:0,
lineAllowance:0,
taxRate:5,
docCharges:0,
docAllowances:0,
paidAmount:0,
roundingAmount:0
},
{
expect: "success",
name: "Max Gross Price",
itemPriceBaseQty:100,
itemGrossPrice:9000000000000,
itemPriceDiscount:1,
invoicedQty:1,
lineCharge:0,
lineAllowance:0,
taxRate:5,
docCharges:0,
docAllowances:0,
paidAmount:0,
roundingAmount:0
},
{
expect: "success",
name: "min Quantity",
itemPriceBaseQty:0.01,
itemGrossPrice:1000,
itemPriceDiscount:1,
invoicedQty:0.01,
lineCharge:0,
lineAllowance:0,
taxRate:5,
docCharges:0,
docAllowances:0,
paidAmount:0,
roundingAmount:0
},

{
expect: "success",
name: "Max Quantity",
itemPriceBaseQty:9999999999,
itemGrossPrice:1000,
itemPriceDiscount:1,
invoicedQty:9999999999,
lineCharge:0,
lineAllowance:0,
taxRate:5,
docCharges:0,
docAllowances:0,
paidAmount:0,
roundingAmount:0
},

{
expect: "success",
name: "Max Line Allowance",
itemPriceBaseQty:1,
itemGrossPrice:1000,
itemPriceDiscount:1,
invoicedQty:10,
lineCharge:0,
lineAllowance:999,
taxRate:5,
docCharges:0,
docAllowances:0,
paidAmount:0,
roundingAmount:0
},
{
expect: "success",
name: "Positive Rounding",
itemPriceBaseQty:1,
itemGrossPrice:1000,
itemPriceDiscount:1,
invoicedQty:10,
lineCharge:0,
lineAllowance:0,
taxRate:5,
docCharges:0,
docAllowances:0,
paidAmount:0,
roundingAmount:0.50
},
{
expect: "success",
name: "Valid Base Quantity",
itemPriceBaseQty: 1.65,
itemGrossPrice: 1000,
itemPriceDiscount: 1,
invoicedQty: 10,
lineCharge: 0,
lineAllowance: 0,
taxRate: 5,
docCharges: 0,
docAllowances: 0,
paidAmount: 0,
roundingAmount: 0
},

{
expect: "success",
name: "Valid Gross Price",
itemPriceBaseQty: 1,
itemGrossPrice: 9999.83,
itemPriceDiscount: 1,
invoicedQty: 10,
lineCharge: 0,
lineAllowance: 0,
taxRate: 5,
docCharges: 0,
docAllowances: 0,
paidAmount: 0,
roundingAmount: 0
},

{
expect: "success",
name: "Valid Quantity",
itemPriceBaseQty: 1,
itemGrossPrice: 1000,
itemPriceDiscount: 1,
invoicedQty: 1.65,
lineCharge: 0,
lineAllowance: 0,
taxRate: 5,
docCharges: 0,
docAllowances: 0,
paidAmount: 0,
roundingAmount: 0
},
/* Empty optional / mandatory empties + above-max digits → Field numeric suite.
   Negative rounding → Conditional IBR-137-OM. */
{
  expect: "error",
  name: "Base Quantity zero (below minimum)",
  errorField: "Item price base quantity",
  itemPriceBaseQty: 0,
  itemGrossPrice: 1000,
  itemPriceDiscount: 1,
  invoicedQty: 10,
  lineCharge: 0,
  lineAllowance: 0,
  taxRate: 5,
  docCharges: 0,
  docAllowances: 0,
  paidAmount: 0,
  roundingAmount: 0,
},

{
  expect: "error",
  name: "Invoiced quantity zero (below minimum)",
  errorField: "Invoiced quantity",
  itemPriceBaseQty: 1,
  itemGrossPrice: 1000,
  itemPriceDiscount: 1,
  invoicedQty: 0,
  lineCharge: 0,
  lineAllowance: 0,
  taxRate: 5,
  docCharges: 0,
  docAllowances: 0,
  paidAmount: 0,
  roundingAmount: 0,
},

/* ---- Oman formula coverage: Item net price (IBT-146) ---- */
{
  expect: "success",
  name: "Item net price = Item gross price - Item price discount",
  itemPriceBaseQty: 1,
  itemGrossPrice: 1000,
  itemPriceDiscount: 100,
  invoicedQty: 1,
  lineCharge: 0,
  lineAllowance: 0,
  taxRate: 5,
  docCharges: 0,
  docAllowances: 0,
  paidAmount: 0,
  roundingAmount: 0,
},
{
  expect: "success",
  name: "Item net price with zero discount",
  itemPriceBaseQty: 1,
  itemGrossPrice: 250.55,
  itemPriceDiscount: 0,
  invoicedQty: 2,
  lineCharge: 0,
  lineAllowance: 0,
  taxRate: 5,
  docCharges: 0,
  docAllowances: 0,
  paidAmount: 0,
  roundingAmount: 0,
},
{
  expect: "error",
  name: "Item gross price alphanumeric",
  errorField: "Item Gross Price",
  itemPriceBaseQty: 1,
  itemGrossPrice: "abc",
  itemPriceDiscount: 1,
  invoicedQty: 10,
  lineCharge: 0,
  lineAllowance: 0,
  taxRate: 5,
  docCharges: 0,
  docAllowances: 0,
  paidAmount: 0,
  roundingAmount: 0,
},
{
  expect: "success",
  name: "Item price discount whitespace",
  itemPriceBaseQty: 1,
  itemGrossPrice: 1000,
  itemPriceDiscount: "        ",
  invoicedQty: 10,
  lineCharge: 0,
  lineAllowance: 0,
  taxRate: 5,
  docCharges: 0,
  docAllowances: 0,
  paidAmount: 0,
  roundingAmount: 0,
},

/* ---- Invoice line net amount (IBT-131) ---- */
{
  expect: "success",
  name: "Invoice line net amount with qty base charge allowance",
  itemPriceBaseQty: 2,
  itemGrossPrice: 200,
  itemPriceDiscount: 0,
  invoicedQty: 4,
  lineCharge: 10,
  lineAllowance: 5,
  taxRate: 5,
  docCharges: 0,
  docAllowances: 0,
  paidAmount: 0,
  roundingAmount: 0,
},
{
  expect: "error",
  name: "Invoiced quantity alphanumeric",
  errorField: "Invoiced Quantity",
  itemPriceBaseQty: 1,
  itemGrossPrice: 1000,
  itemPriceDiscount: 1,
  invoicedQty: "10x",
  lineCharge: 0,
  lineAllowance: 0,
  taxRate: 5,
  docCharges: 0,
  docAllowances: 0,
  paidAmount: 0,
  roundingAmount: 0,
},
{
  expect: "error",
  name: "Item price base quantity blank whitespace",
  errorField: "Item Price Base Quantity",
  itemPriceBaseQty: "        ",
  itemGrossPrice: 1000,
  itemPriceDiscount: 1,
  invoicedQty: 10,
  lineCharge: 0,
  lineAllowance: 0,
  taxRate: 5,
  docCharges: 0,
  docAllowances: 0,
  paidAmount: 0,
  roundingAmount: 0,
},

/* ---- Line Item VAT + Total Amount Including VAT (BTOM-016 / 017) ---- */
/* Named IBR-158 / IBR-168 positives live under Conditional FORMULA gaps below. */

/* ---- Document totals (IBT-106 / 109 / 110 / 112) ---- */
{
  expect: "success",
  name: "Document totals with charges and allowances",
  itemPriceBaseQty: 1,
  itemGrossPrice: 1000,
  itemPriceDiscount: 0,
  invoicedQty: 1,
  lineCharge: 0,
  lineAllowance: 0,
  taxRate: 5,
  docCharges: 50,
  docAllowances: 25,
  paidAmount: 0,
  roundingAmount: 0,
},
{
  expect: "success",
  name: "Amount due for payment with paid and rounding",
  itemPriceBaseQty: 1,
  itemGrossPrice: 1000,
  itemPriceDiscount: 0,
  invoicedQty: 1,
  lineCharge: 0,
  lineAllowance: 0,
  taxRate: 5,
  docCharges: 0,
  docAllowances: 0,
  paidAmount: 100,
  roundingAmount: 0.5,
},

/* ---- Conditional FORMULA gaps (Excel-testable) ---- */

/* IBR-065-OM — IBT-111 = FX × Invoice total tax (non-OMR only) */
{
  expect: "success",
  name: "IBR-065-OM Invoice total tax in accounting currency equals FX times total tax",
  nonOmrOnly: true,
  itemPriceBaseQty: 1,
  itemGrossPrice: 1000,
  itemPriceDiscount: 0,
  invoicedQty: 1,
  lineCharge: 0,
  lineAllowance: 0,
  taxRate: 5,
  docCharges: 0,
  docAllowances: 0,
  paidAmount: 0,
  roundingAmount: 0,
  currencyRate: 3.67,
},

/* ALIGNED-IBRP-S-09 — Invoice total tax = line VAT + charges VAT − allowances VAT */
{
  expect: "success",
  name: "ALIGNED-IBRP-S-09-OM Invoice total tax aggregates line VAT with doc charge and allowance VAT",
  itemPriceBaseQty: 1,
  itemGrossPrice: 1000,
  itemPriceDiscount: 0,
  invoicedQty: 1,
  lineCharge: 0,
  lineAllowance: 0,
  taxRate: 5,
  docCharges: 100,
  docAllowances: 40,
  paidAmount: 0,
  roundingAmount: 0,
},

/* IBR-158-OM / IBR-168-OM — explicit named positives (totals already covered by calc) */
{
  expect: "success",
  name: "IBR-168-OM Line Item VAT Amount equals Tax Rate/100 times Invoice line net amount",
  itemPriceBaseQty: 1,
  itemGrossPrice: 500,
  itemPriceDiscount: 0,
  invoicedQty: 2,
  lineCharge: 0,
  lineAllowance: 0,
  taxRate: 5,
  docCharges: 0,
  docAllowances: 0,
  paidAmount: 0,
  roundingAmount: 0,
},
{
  expect: "success",
  name: "IBR-158-OM Total Amount Including VAT equals line net plus Line Item VAT",
  itemPriceBaseQty: 1,
  itemGrossPrice: 500,
  itemPriceDiscount: 0,
  invoicedQty: 2,
  lineCharge: 0,
  lineAllowance: 0,
  taxRate: 5,
  docCharges: 0,
  docAllowances: 0,
  paidAmount: 0,
  roundingAmount: 0,
},
{
  expect: "success",
  name: "IBR-082-OM Profit Margin Invoice Total Amount Due equals sum of Total Amount Including VAT",
  invoiceTransactionTypeCode: "Profit Margin Invoice",
  itemPriceBaseQty: 1,
  itemGrossPrice: 800,
  itemPriceDiscount: 0,
  invoicedQty: 1,
  lineCharge: 0,
  lineAllowance: 0,
  taxRate: 5,
  docCharges: 0,
  docAllowances: 0,
  paidAmount: 0,
  roundingAmount: 0,
},

/* IBR-046-OM — Tax Rate numeric format */
{
  expect: "error",
  name: "IBR-046-OM Tax Rate alphanumeric",
  errorField: "Tax Rate",
  taxRate: "abc",
  itemPriceBaseQty: 1,
  itemGrossPrice: 1000,
  itemPriceDiscount: 0,
  invoicedQty: 1,
  lineCharge: 0,
  lineAllowance: 0,
  docCharges: 0,
  docAllowances: 0,
  paidAmount: 0,
  roundingAmount: 0,
},
{
  expect: "error",
  name: "IBR-046-OM Tax Rate with percent symbol",
  errorField: "Tax Rate",
  taxRate: "5%",
  itemPriceBaseQty: 1,
  itemGrossPrice: 1000,
  itemPriceDiscount: 0,
  invoicedQty: 1,
  lineCharge: 0,
  lineAllowance: 0,
  docCharges: 0,
  docAllowances: 0,
  paidAmount: 0,
  roundingAmount: 0,
},
{
  expect: "error",
  name: "IBR-046-OM Tax Rate above 100",
  errorField: "Tax Rate",
  taxRate: 100.01,
  itemPriceBaseQty: 1,
  itemGrossPrice: 1000,
  itemPriceDiscount: 0,
  invoicedQty: 1,
  lineCharge: 0,
  lineAllowance: 0,
  docCharges: 0,
  docAllowances: 0,
  paidAmount: 0,
  roundingAmount: 0,
},
{
  expect: "error",
  name: "IBR-046-OM Tax Rate more than two decimals",
  errorField: "Tax Rate",
  taxRate: 5.555,
  itemPriceBaseQty: 1,
  itemGrossPrice: 1000,
  itemPriceDiscount: 0,
  invoicedQty: 1,
  lineCharge: 0,
  lineAllowance: 0,
  docCharges: 0,
  docAllowances: 0,
  paidAmount: 0,
  roundingAmount: 0,
},

];

/** Drops `expect` only so derived negatives still carry `nonOmrOnly` / `errorField`. */
function omitFormulaScenarioMeta(row: InvoiceFormulaScenario) {
  const { expect: _e, ...rest } = row;
  return rest;
}

/** Derived from `invoiceFormulaScenarios` for callers that only need success rows. */
export const invoiceFormulaTestData = invoiceFormulaScenarios
  .filter((r) => r.expect === "success")
  .map(omitFormulaScenarioMeta);

/** Derived from `invoiceFormulaScenarios` for callers that only need error rows. */
export const invoiceNegativeFormulaTestData = invoiceFormulaScenarios
  .filter((r) => r.expect === "error")
  .map(omitFormulaScenarioMeta);

export const defaultInvoiceData = {
  taxCategory: "Standard rate",
  itemPriceBaseQty: 1,
  itemGrossPrice: 1000,
  itemPriceDiscount: 1,
  invoicedQty: 1.65,
  lineCharge: 0,
  lineAllowance: 0,
  docCharges: 0,
  docAllowances: 0,
  paidAmount: 0,
  roundingAmount: 0,
};
