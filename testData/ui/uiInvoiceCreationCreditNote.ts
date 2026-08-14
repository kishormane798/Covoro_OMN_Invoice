// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under testData/ui/; executable code is commented out.
//
// /**
//  * Create Invoice UI — credit note reason + preceding invoice (Excel-aligned).
//  */
//
// import { CREDIT_NOTE_REASON_CODE_ALLOWED_VALUES } from "../FieldValidations/ConditionalValidation";
//
// /** Excel `withCreditNoteReasonAndPaymentFieldsForInvoiceTypeVsTransactionType` default. */
// export const UI_CREDIT_NOTE_REASON_VOLUME_DISCOUNT =
//   CREDIT_NOTE_REASON_CODE_ALLOWED_VALUES[5];
//
// export const UI_PRECEDING_INVOICE_REFERENCE_INPUT_ID =
//   "proceedingDtls[0].invoiceReference";
//
// export const UI_PRECEDING_INVOICE_ISSUE_DATE_INPUT_ID =
//   "proceedingDtls[0].invoiceIssueDate";
//
// export function isUiCreditNoteInvoiceType(invoiceTypeCode?: string): boolean {
//   return /credit\s*note/i.test((invoiceTypeCode ?? "").trim());
// }
//
// /** Preceding invoice is required for all reasons except Volume Discount (matches Excel). */
// export function creditNoteReasonRequiresPrecedingInvoice(
//   creditNoteReasonCode: string | null | undefined
// ): boolean {
//   const normalized = (creditNoteReasonCode ?? "").trim().toLowerCase();
//   if (!normalized) {
//     return false;
//   }
//   return normalized !== UI_CREDIT_NOTE_REASON_VOLUME_DISCOUNT.trim().toLowerCase();
// }
//
// /** Narrow MUI autocomplete list for long credit-note reason labels. */
// export function creditNoteReasonUiFilterText(reason: string): string {
//   return reason.trim().slice(0, 50);
// }
//
// /** Known dropdown options — not free-text / invalid matrix values. */
// export function isKnownCreditNoteReasonDropdownOption(code: string): boolean {
//   return (CREDIT_NOTE_REASON_CODE_ALLOWED_VALUES as readonly string[]).includes(code);
// }
//
