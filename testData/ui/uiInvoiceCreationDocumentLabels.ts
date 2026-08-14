// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under testData/ui/; executable code is commented out.
//
// /**
//  * Create Invoice document dropdowns — Excel / conditional matrix labels → UI autocomplete text.
//  * Excel keeps full names (e.g. **Profit Margin Scheme**); the UI shortens some options.
//  */
//
// function escapeRegExp(value: string): string {
//   return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// }
//
// /** Exact-match option (case-insensitive) for MUI autocomplete. */
// function exactOptionPattern(label: string): RegExp {
//   return new RegExp(`^${escapeRegExp(label.trim())}$`, "i");
// }
//
// /** Excel **Invoice Transaction Type Code** → visible UI option label. */
// export const INVOICE_TRANSACTION_TYPE_EXCEL_TO_UI_LABEL: Readonly<
//   Record<string, string>
// > = {
//   "Profit Margin Scheme": "Margin Scheme",
// };
//
// /** Excel **Invoice Type Code** → visible UI option label (only when UI differs from Excel). */
// export const INVOICE_TYPE_CODE_EXCEL_TO_UI_LABEL: Readonly<Record<string, string>> =
//   {};
//
// export function invoiceTransactionTypeUiOption(
//   excelOrUiLabel: string | RegExp
// ): string | RegExp {
//   if (typeof excelOrUiLabel !== "string") {
//     return excelOrUiLabel;
//   }
//   const key = excelOrUiLabel.trim();
//   const ui = INVOICE_TRANSACTION_TYPE_EXCEL_TO_UI_LABEL[key];
//   if (ui) {
//     return exactOptionPattern(ui);
//   }
//   return exactOptionPattern(key);
// }
//
// export function invoiceTransactionTypeUiFilterText(
//   excelOrUiLabel: string
// ): string | undefined {
//   const key = excelOrUiLabel.trim();
//   const ui = INVOICE_TRANSACTION_TYPE_EXCEL_TO_UI_LABEL[key];
//   return ui ?? key;
// }
//
// export function invoiceTypeUiOption(excelOrUiLabel: string | RegExp): string | RegExp {
//   if (typeof excelOrUiLabel !== "string") {
//     return excelOrUiLabel;
//   }
//   const key = excelOrUiLabel.trim();
//   const ui = INVOICE_TYPE_CODE_EXCEL_TO_UI_LABEL[key];
//   if (ui) {
//     return exactOptionPattern(ui);
//   }
//   return exactOptionPattern(key);
// }
//
// export function invoiceTypeUiFilterText(excelOrUiLabel: string): string {
//   const key = excelOrUiLabel.trim();
//   return INVOICE_TYPE_CODE_EXCEL_TO_UI_LABEL[key] ?? key;
// }
//
