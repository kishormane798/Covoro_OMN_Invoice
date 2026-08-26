/**
 * Single source of truth for Covoro/OMN Excel column mapping.
 * Keep row-4 labels aligned with `testData/uploads/template.xlsx` (sheet "E Invoice").
 */

/** Header document for one template workbook (row-4 labels on sheet "E Invoice"). */
export type InvoiceTemplateHeadersDocument = {
  source?: string;
  description?: string;
  headers: string[];
};

/** Row-4 column labels for `testData/uploads/template.xlsx`. */
export const FULL_TEMPLATE_HEADERS: readonly string[] = [
  "Invoice Transaction Type Code",
  "Invoice Type Code",
  "Invoice Number",
  "Invoice Issue Date",
  "Purchase Order Number",
  "Incoterms",
  "Import Date",
  "Customs Declaration Number",
  "Invoice Currency Code",
  "Source Currency Code",
  "Currency Exchange Rate",
  "Credit Note Or Debit Note Reason Code",
  "Preceding Invoice Reference",
  "Unique Identifier Number",
  "Preceding Invoice Issue Date",
  "Seller Name",
  "Seller Identifier - Scheme Identifier",
  "Seller Identifier (Textual Code)",
  "Seller Identifier",
  "Seller VAT Identifier (TRN / TIN)",
  "Seller Electronic Address Scheme",
  "Seller Electronic Address",
  "Seller Address Line 1",
  "Seller Address Line 2",
  "Seller Address Line 3",
  "Seller City",
  "Seller Post Code",
  "Seller Country Subdivision Code",
  "Seller Country Code",
  "Third Party Name",
  "Third Party VATin",
  "Third Party Address Line 1",
  "Third Party Address Line 2",
  "Third Party Address Line 3",
  "Third Party City",
  "Third Party Postal Code - Po Box Number",
  "Third Party Country Code",
  "Buyer Name",
  "Scheme Identifier",
  "Buyer Identifier (Textual Code)",
  "Buyer Identifier",
  "Buyer VAT Identifier",
  "Buyer Electronic Address Scheme",
  "Buyer Electronic Address",
  "Buyer Address Line 1",
  "Buyer Address Line 2",
  "Buyer Address Line 3",
  "Buyer City",
  "Buyer Post Code",
  "Buyer Country Subdivision Code",
  "Buyer Country Code",
  "Deliver To Party Name",
  "Deliver To Address Line 1",
  "Deliver To Address Line 2",
  "Deliver To Address Line 3",
  "Deliver To City",
  "Deliver To Post Code",
  "Deliver To Country Sub-Division",
  "Deliver To Country Code",
  "Invoice Line Identifier",
  "Item Name",
  "Item Description",
  "Item Type",
  "Item Classification Identifier",
  "Industrial Classification Code",
  "Service Type Code",
  "Profit Margin Item Type Code",
  "Item Price Base Quantity",
  "Item Gross Price",
  "Item Price Discount",
  "Item Net Price",
  "Invoiced Quantity",
  "Invoiced Quantity Unit Of Measure Code",
  "Invoice Line Charge Amount",
  "Invoice Line Allowance Amount",
  "Invoice Line Net Amount",
  "Tax Category",
  "Tax Rate",
  "Tax Exemption Reason Text",
  "Tax Exemption Reason Code",
  "Line Item VAT Amount",
  "Total Amount Including VAT",
  "Item Country Of Origin",
  "Item Attribute Name",
  "Item Attribute Value",
  "Item Custom 1",
  "Item Custom 2",
  "Charges On Document Level",
  "VAT Category - Charges",
  "Tax Exemption Reason - Charges",
  "Allowances On Document Level",
  "VAT Category - Allowances",
  "Tax Exemption Reason - Allowances",
  "Sum Of Invoice Line Net Amount",
  "Invoice Total Amount Without Tax",
  "Invoice Total Tax Amount",
  "Invoice Total Amount With Tax",
  "Invoice Total Tax Amount In Tax Accounting Currency",
  "Paid Amount",
  "Rounding Amount",
  "Amount Due For Payment",
  "Total Amount Due (Profit Margin)",
  "Prepayment Invoice Number",
  "Prepayment Invoice Uuid",
  "Supporting Document Reference",
  "Supporting Document Uuid",
  "Invoicing Period Start Date",
  "Invoicing Period End Date",
  "Payment Means Type Code",
  "Scheme Identifier - Payment",
  "Payment Account Identifier",
  "Payment Due Date",
  "Payment Card Primary Account Number",
  "Payment Account Name",
  "Custom 1",
  "Custom 2",
  "Custom 3",
  "Custom 4",
  "Custom 5",
] as const;

/** Row-4 headers document for `testData/uploads/template.xlsx`. */
export const FULL_TEMPLATE_HEADERS_DOCUMENT: InvoiceTemplateHeadersDocument = {
  source: "full-template",
  description:
    "Row-4 column labels for testData/uploads/template.xlsx. uploads/ holds only template workbooks. " +
    "Note: buyer `Scheme Identifier`, item `Item Custom 1/2`, payment `Scheme Identifier - Payment`, " +
    "and trailing `Custom 1/2` are distinct headers on the current Oman template.",
  headers: [...FULL_TEMPLATE_HEADERS],
};

/** Convenience list used by filtering helpers/spec registration. */
export const FULL_TEMPLATE_HEADER_LABELS: readonly string[] =
  FULL_TEMPLATE_HEADERS_DOCUMENT.headers;

/** Row-4 column labels for `testData/uploads/SimplifiedTemplate.xlsx`. */
export const SIMPLIFIED_TEMPLATE_HEADERS: readonly string[] = [
  "Invoice Transaction Type Code",
  "Invoice Type Code",
  "Invoice Number",
  "Invoice Issue Date",
  "Purchase Order Number",
  "Incoterms",
  "Import Date",
  "Customs Declaration Number",
  "Invoice Currency Code",
  "Source Currency Code",
  "Currency Exchange Rate",
  "Credit Note Or Debit Note Reason Code",
  "Preceding Invoice Reference",
  "Unique Identifier Number",
  "Preceding Invoice Issue Date",
  "Seller Name",
  "Seller Electronic Address Scheme",
  "Seller Electronic Address",
  "Third Party Name",
  "Third Party VATin",
  "Third Party Address Line 1",
  "Third Party Address Line 2",
  "Third Party Address Line 3",
  "Third Party City",
  "Third Party Postal Code - Po Box Number",
  "Third Party Country Code",
  "Buyer Name",
  "Buyer Electronic Address Scheme",
  "Buyer Electronic Address",
  "Deliver To Party Name",
  "Deliver To Address Line 1",
  "Deliver To Address Line 2",
  "Deliver To Address Line 3",
  "Deliver To City",
  "Deliver To Post Code",
  "Deliver To Country Sub-Division",
  "Deliver To Country Code",
  "Invoice Line Identifier",
  "Item Name",
  "Item Description",
  "Item Type",
  "Item Classification Identifier",
  "Industrial Classification Code",
  "Service Type Code",
  "Profit Margin Item Type Code",
  "Item Price Base Quantity",
  "Item Gross Price",
  "Item Price Discount",
  "Item Net Price",
  "Invoiced Quantity",
  "Invoiced Quantity Unit Of Measure Code",
  "Invoice Line Charge Amount",
  "Invoice Line Allowance Amount",
  "Invoice Line Net Amount",
  "Tax Category",
  "Tax Rate",
  "Tax Exemption Reason Text",
  "Tax Exemption Reason Code",
  "Line Item VAT Amount",
  "Total Amount Including VAT",
  "Item Country Of Origin",
  "Item Attribute Name",
  "Item Attribute Value",
  "Item Custom 1",
  "Item Custom 2",
  "Charges On Document Level",
  "VAT Category - Charges",
  "Tax Exemption Reason - Charges",
  "Allowances On Document Level",
  "VAT Category - Allowances",
  "Tax Exemption Reason - Allowances",
  "Sum Of Invoice Line Net Amount",
  "Invoice Total Amount Without Tax",
  "Invoice Total Tax Amount",
  "Invoice Total Amount With Tax",
  "Invoice Total Tax Amount In Tax Accounting Currency",
  "Paid Amount",
  "Rounding Amount",
  "Amount Due For Payment",
  "Total Amount Due (Profit Margin)",
  "Prepayment Invoice Number",
  "Prepayment Invoice Uuid",
  "Supporting Document Reference",
  "Supporting Document Uuid",
  "Invoicing Period Start Date",
  "Invoicing Period End Date",
  "Payment Means Type Code",
  "Scheme Identifier - Payment",
  "Payment Account Identifier",
  "Payment Due Date",
  "Payment Card Primary Account Number",
  "Payment Account Name",
  "Custom 1",
  "Custom 2",
  "Custom 3",
  "Custom 4",
  "Custom 5",
] as const;

/** Row-4 headers document for `testData/uploads/SimplifiedTemplate.xlsx`. */
export const SIMPLIFIED_TEMPLATE_HEADERS_DOCUMENT: InvoiceTemplateHeadersDocument = {
  source: "simplified-template",
  description:
    "Row-4 column labels for testData/uploads/SimplifiedTemplate.xlsx. Omits seller/buyer " +
    "address and identifier columns present on the full Oman template.",
  headers: [...SIMPLIFIED_TEMPLATE_HEADERS],
};

/** Convenience list used by simplified template specs and row filtering. */
export const SIMPLIFIED_TEMPLATE_HEADER_LABELS: readonly string[] =
  SIMPLIFIED_TEMPLATE_HEADERS_DOCUMENT.headers;

const SUBMIT_INVOICE_IDENTITY_HEADER_ALIASES: Record<string, string[]> =
  Object.fromEntries(
    FULL_TEMPLATE_HEADERS.map((header) => header.trim())
      .filter(Boolean)
      .map((header) => [header, [header]])
  );

/**
 * Maps SubmitInvoice JSON keys to Excel header labels (row 4, sheet "E Invoice");
 * first existing label wins.
 */
export const SUBMIT_INVOICE_TEST_KEY_TO_EXCEL_HEADERS: Record<string, string[]> =
  {
    ...SUBMIT_INVOICE_IDENTITY_HEADER_ALIASES,
    /** Buyer scheme dropdown key. */
    "Scheme identifier": ["Scheme identifier", "Scheme Identifier"],
    /** Legacy payment key kept for backward compatibility with existing row data. */
    "Scheme Identifier": ["Scheme Identifier - Payment", "Scheme Identifier"],
    /** Legacy item-custom keys kept for backward compatibility with existing row data. */
    "custom 1": ["Item Custom 1", "Custom 1"],
    "custom 2": ["Item Custom 2", "Custom 2"],
    /** Aliases for electronic address column wording across template versions. */
    "Seller electronic address": [
      "Seller Electronic Address",
      "Seller electronic address",
      "Seller electronic address (URL)",
      "Seller electronic address URL",
      "Seller URL",
    ],
    "Buyer electronic address": [
      "Buyer Electronic Address",
      "Buyer electronic address",
      "Buyer electronic address (URL)",
      "Buyer electronic address URL",
      "Buyer URL",
    ],
    /** Optional field; casing varies by template version. */
    "Purchase Order Number": [
      "Purchase Order Number",
      "Purchase order number",
      "Purchase order Number",
    ],
    /** Legacy test-data key; new template column is `Tax Rate`. */
    "Standard Tax Rate": ["Tax Rate", "Standard Tax Rate"],
  };

/**
 * Formula/invoice generator keys -> canonical Excel headers.
 * Keep this as the single source for header mapping used during Excel write.
 */
export const INVOICE_EXCEL_FIELD_TO_HEADER: Record<string, string> = {
  "Invoice Currency Code": "Invoice Currency Code",
  "Currency Exchange Rate": "Currency Exchange Rate",
  "Invoice Transaction Type Code": "Invoice Transaction Type Code",
  "Invoice total tax amount in tax accounting currency":
    "Invoice Total Tax Amount In Tax Accounting Currency",
  "Item Price Base Quantity": "Item Price Base Quantity",
  "Item Gross Price": "Item Gross Price",
  "Item Price Discount": "Item Price Discount",
  "Invoiced Quantity": "Invoiced Quantity",
  "Line Charge": "Invoice Line Charge Amount",
  "Line Allowance": "Invoice Line Allowance Amount",
  "Tax Category": "Tax Category",
  "Tax Rate": "Tax Rate",
  "Tax Exemption Reason Code": "Tax Exemption Reason Code",
  "Tax Exemption Reason Text": "Tax Exemption Reason Text",
  "Invoice Type Code": "Invoice Type Code",
  "Payment Means Type Code": "Payment Means Type Code",
  "Document Charges": "Charges On Document Level",
  "Document Allowances": "Allowances On Document Level",
  "Vat category - charges": "Vat category - charges",
  "Vat category - allowances": "Vat category - allowances",
  "Paid Amount": "Paid Amount",
  "Rounding Amount": "Rounding Amount",
  /** Optional formula-suite text (multiline allowed); written when present on the payload. */
  "Invoice line identifier": "Invoice Line Identifier",
  "Item name": "Item Name",
  "Item description": "Item Description",
  "Item classification identifier": "Item Classification Identifier",
  "Item Net Price": "Item Net Price",
  "Invoice Line Net Amount": "Invoice Line Net Amount",
  "Line Item VAT Amount": "Line Item VAT Amount",
  "Total Amount Including VAT": "Total Amount Including VAT",
  "Sum Invoice Line Net Amount": "Sum Of Invoice Line Net Amount",
  "Invoice Total Without Tax": "Invoice Total Amount Without Tax",
  "Invoice Total Tax": "Invoice Total Tax Amount",
  "Invoice Total With Tax": "Invoice Total Amount With Tax",
  "Amount Due": "Amount Due For Payment",
  "Total Amount Due (Profit Margin)": "Total Amount Due (Profit Margin)",
};

/**
 * Calculator output keys -> Excel headers.
 * Reused by combo generator to avoid duplicate local maps.
 */
export const CALC_OUTPUT_KEY_TO_EXCEL_HEADER: Record<string, string> = {
  itemNetPrice: "Item Net Price",
  invoiceLineNetAmount: "Invoice Line Net Amount",
  lineItemVatAmount: "Line Item VAT Amount",
  totalAmountIncludingVat: "Total Amount Including VAT",
  sumInvoiceLineNetAmount: "Sum Of Invoice Line Net Amount",
  invoiceTotalWithoutTax: "Invoice Total Amount Without Tax",
  invoiceTotalTax: "Invoice Total Tax Amount",
  invoiceTotalTaxAccountingCurrency:
    "Invoice Total Tax Amount In Tax Accounting Currency",
  invoiceTotalWithTax: "Invoice Total Amount With Tax",
  amountDue: "Amount Due For Payment",
  totalAmountDueProfitMargin: "Total Amount Due (Profit Margin)",
};
