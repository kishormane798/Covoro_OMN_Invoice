// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under testData/ui/; executable code is commented out.
//
// /**
//  * Create / Edit / Copy Invoice UI — angle brackets (`<>`) must be rejected on free-text
//  * fields (not dropdowns / comboboxes, not date pickers, not numeric-only inputs).
//  *
//  * Electronic address is free text whose value may be TIN, URL, or other depending on the
//  * scheme dropdown — the address textbox itself still must reject `<>`.
//  */
//
// import {
//   createInvoiceMinMaxRulesForSection,
//   type CreateInvoiceFieldRule,
//   type CreateInvoiceSection,
// } from "./uiInvoiceCreationFieldMinMax";
//
// /** Value containing the forbidden characters (kept short for maxlength fields). */
// export const UI_ANGLE_BRACKET_INVALID_VALUE = "AB<>CD";
//
// /**
//  * Combobox / autocomplete ids that appear in length rules but are not free-text.
//  * Date fields and electronic-address *scheme* dropdowns are excluded.
//  */
// const CREATE_INVOICE_DROPDOWN_INPUT_IDS = new Set<string>([
//   "frequencyOfBilling",
//   "paymentMeansTypeCode",
//   "sellerElectronicAddressScheme",
//   "electronicAddressScheme",
// ]);
//
// /**
//  * Text fields missing from Excel min/max rules but present on Create Invoice UI.
//  * Scheme stays a dropdown; only the address value is tested for `<>`.
//  */
// const CREATE_INVOICE_ANGLE_BRACKET_EXTRA_RULES: CreateInvoiceFieldRule[] = [
//   {
//     field: "Seller electronic address",
//     excelField: "Seller electronic address",
//     inputId: "sellerElectronicAddress",
//     section: "seller",
//     tab: "buyerSeller",
//     min: 1,
//     max: 300,
//     belowMin: 0,
//     aboveMax: 301,
//     requiredOnForm: false,
//   },
//   {
//     field: "Buyer electronic address",
//     excelField: "Buyer electronic address",
//     inputId: "electronicAddress",
//     section: "buyer",
//     tab: "buyerSeller",
//     min: 1,
//     max: 300,
//     belowMin: 0,
//     aboveMax: 301,
//     requiredOnForm: false,
//   },
// ];
//
// /** True when the field is a free-text control eligible for `<>` negative validation. */
// export function isCreateInvoiceAngleBracketTextField(
//   rule: CreateInvoiceFieldRule
// ): boolean {
//   if (rule.numericOnly) {
//     return false;
//   }
//   if (CREATE_INVOICE_DROPDOWN_INPUT_IDS.has(rule.inputId)) {
//     return false;
//   }
//   return true;
// }
//
// /** Free-text fields in a section that must reject `<>`. */
// export function createInvoiceAngleBracketRulesForSection(
//   section: CreateInvoiceSection
// ): CreateInvoiceFieldRule[] {
//   const fromMinMax = createInvoiceMinMaxRulesForSection(section).filter(
//     isCreateInvoiceAngleBracketTextField
//   );
//   const seen = new Set(fromMinMax.map((r) => r.inputId));
//   const extras = CREATE_INVOICE_ANGLE_BRACKET_EXTRA_RULES.filter(
//     (r) => r.section === section && !seen.has(r.inputId)
//   );
//   return [...fromMinMax, ...extras];
// }
//
