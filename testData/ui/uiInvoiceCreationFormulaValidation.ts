// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under testData/ui/; executable code is commented out.
//
// /**
//  * Create Invoice manual UI — formula / auto-calculation checks (same math as Excel formula suite).
//  */
//
// import type { FormulaScenarioRow } from "../../Helpers/formulaValidationHelper";
// import {
//   CURRENCY_SUITES,
//   type CurrencyMode,
//   isScenarioApplicableForMode,
// } from "../../Helpers/formulaValidationHelper";
// import type { calculateInvoiceValues } from "../../utils/invoiceExcel";
// import { invoiceFormulaTestData } from "../FieldValidations/Min_max_field_validation";
//
// export { CURRENCY_SUITES, isScenarioApplicableForMode };
// export type { CurrencyMode, FormulaScenarioRow };
//
// /** Formula scenarios touch item modal + invoice totals; allow more than min/max (50s). */
// export const UI_INVOICE_FORMULA_TEST_TIMEOUT_MS = 90_000;
//
// /** Excel formula success scenarios run on Create Invoice UI. */
// export const CREATE_INVOICE_FORMULA_SCENARIOS: FormulaScenarioRow[] = invoiceFormulaTestData;
//
// /** Logical formula input → candidate Create Invoice / item modal `id`s (first match wins). */
// export const CREATE_INVOICE_FORMULA_INPUT_CANDIDATES: Record<string, readonly string[]> = {
//   itemPriceBaseQty: ["priceBaseQty"],
//   itemGrossPrice: ["itemGrossPrice"],
//   itemPriceDiscount: ["itemPriceDiscount", "invLinePriceDiscount"],
//   invoicedQty: ["invoiceQty", "invoicedQty", "invQty", "invoicedQuantity"],
//   lineCharge: [
//     "chargesDtls[0].amount",
//     "invLineChargeAmount",
//     "invoiceLineChargeAmount",
//     "lineCharge",
//   ],
//   lineAllowance: [
//     "allowanceDtls[0].amount",
//     "invLineAllowanceAmount",
//     "invoiceLineAllowanceAmount",
//     "lineAllowance",
//   ],
//   taxRate: ["taxRateDtls[0].taxRate"],
//   docCharges: ["docLevelCharges[0].amount", "docCharges", "invDocCharges"],
//   docAllowances: ["docLevelAllowances[0].amount", "docAllowances", "invDocAllowances"],
//   paidAmount: ["paidAmt", "paidAmount", "invPaidAmount"],
//   roundingAmount: ["roundingAmt", "roundingAmount", "invRoundingAmount"],
// };
//
// /** Filled in the Add Item modal (section 3). */
// export const CREATE_INVOICE_ITEM_FORMULA_INPUT_KEYS = new Set([
//   "itemPriceBaseQty",
//   "itemGrossPrice",
//   "itemPriceDiscount",
//   "invoicedQty",
//   "lineCharge",
//   "lineAllowance",
//   "taxRate",
// ]);
//
// /** Filled in Invoice Details / Total tab (section 4) after the line is added. */
// export const CREATE_INVOICE_INVOICE_FORMULA_INPUT_KEYS = new Set([
//   "docCharges",
//   "docAllowances",
//   "paidAmount",
//   "roundingAmount",
// ]);
//
// export type UiInvoiceCalculatedTarget = {
//   shortName: string;
//   /** Item modal `#id` (read-only calculated field). */
//   scope: "item" | "invoice";
//   inputId?: string;
//   /** Invoice section (4) label when there is no stable `id`. */
//   invoiceLabel?: RegExp;
//   pickCorrect: (calc: CalculateInvoiceValuesResult) => number | null;
//   foreignOnly?: boolean;
// };
//
// export type CalculateInvoiceValuesResult = ReturnType<typeof calculateInvoiceValues>;
//
// export const UI_INVOICE_FORMULA_CALCULATED_TARGETS: UiInvoiceCalculatedTarget[] = [
//   {
//     shortName: "Item net price",
//     scope: "item",
//     inputId: "itemNetPrice",
//     pickCorrect: (c) => c.itemNetPrice,
//   },
//   {
//     shortName: "Invoice line net amount",
//     scope: "item",
//     inputId: "invLineNetAmt",
//     pickCorrect: (c) => c.invoiceLineNetAmount,
//   },
//   {
//     shortName: "VAT line amount in AED",
//     scope: "item",
//     inputId: "vatLineAmt",
//     pickCorrect: (c) => c.vatLineAmountAED,
//   },
//   {
//     shortName: "Invoice line amount in AED",
//     scope: "item",
//     inputId: "invLineAmt",
//     pickCorrect: (c) => c.invoiceLineAmountAED,
//   },
//   {
//     shortName: "Line tax amount",
//     scope: "item",
//     inputId: "taxRateDtls[0].taxAmt",
//     pickCorrect: (c) => c.vatLineAmountAED,
//   },
//   {
//     shortName: "Sum of Invoice line net amount",
//     scope: "invoice",
//     inputId: "sumOfInvLineNetAmt",
//     invoiceLabel: /Sum of Invoice line net amount/i,
//     pickCorrect: (c) => c.sumInvoiceLineNetAmount,
//   },
//   {
//     shortName: "Invoice total amount without tax",
//     scope: "invoice",
//     inputId: "totalAmtWithoutTax",
//     invoiceLabel: /Invoice total amount without tax/i,
//     pickCorrect: (c) => c.invoiceTotalWithoutTax,
//   },
//   {
//     shortName: "Invoice total tax amount",
//     scope: "invoice",
//     inputId: "totalTaxAmt",
//     invoiceLabel: /Invoice total tax amount/i,
//     pickCorrect: (c) => c.invoiceTotalTax,
//   },
//   {
//     shortName: "Invoice total tax amount in tax accounting currency",
//     scope: "invoice",
//     inputId: "totalTaxAmtInTaxAccCurr",
//     invoiceLabel: /Invoice total tax amount in tax accounting currency/i,
//     pickCorrect: (c) => c.invoiceTotalTaxAccountingCurrency,
//     foreignOnly: true,
//   },
//   {
//     shortName: "Invoice total amount with tax",
//     scope: "invoice",
//     inputId: "totalAmtWithTax",
//     invoiceLabel: /Invoice total amount with tax/i,
//     pickCorrect: (c) => c.invoiceTotalWithTax,
//   },
//   {
//     shortName: "Amount due for payment",
//     scope: "invoice",
//     inputId: "paymentDueAmt",
//     invoiceLabel: /Amount due for payment/i,
//     pickCorrect: (c) => c.amountDue,
//   },
// ];
//
