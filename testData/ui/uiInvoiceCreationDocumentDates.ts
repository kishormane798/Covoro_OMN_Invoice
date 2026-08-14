// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under testData/ui/; executable code is commented out.
//
// import {
//   INVOICE_TRANSACTION_TYPE_CODE_SUMMARY_INVOICE,
//   type InvoicingPeriodConditionalScenario,
//   type PaymentDueDateScenario,
// } from "../FieldValidations/ConditionalValidation";
//
// /**
//  * Create Invoice UI — document date fields (`#invIssueDate`, `#invStartDate`, `#invEndDate`,
//  * `#paymentDueDate`, …).
//  *
//  * - **Invoice issue date** defaults to today; period dates must be **on or after** issue in the UI.
//  * - Excel anchors (`2026-01-*`) map to **issue date → future** (not fixed January 2026 / 1st-of-month).
//  * - Excel/Covoro matrix values stay unchanged; resolution uses `#invIssueDate` at runtime.
//  */
//
// /** MUI date groups on Create Invoice document / payment sections. */
// export const CREATE_INVOICE_UI_DATE_FIELD_IDS = [
//   "invIssueDate",
//   "invStartDate",
//   "invEndDate",
//   "paymentDueDate",
// ] as const;
//
// export type CreateInvoiceUiDateFieldId = (typeof CREATE_INVOICE_UI_DATE_FIELD_IDS)[number];
//
// /** Excel matrix anchor for period start / single-day cases. */
// export const EXCEL_INVOICING_PERIOD_ANCHOR_START = "2026-01-01";
// /** Excel matrix anchor for period end (~30 days after anchor start). */
// export const EXCEL_INVOICING_PERIOD_ANCHOR_END = "2026-01-31";
// /** Excel matrix anchor for end one day after start. */
// export const EXCEL_INVOICING_PERIOD_ANCHOR_END_PLUS_ONE = "2026-01-02";
// /** Submit matrix export: `1-1-2026` (= {@link EXCEL_INVOICING_PERIOD_ANCHOR_START}). */
// export const EXCEL_INVOICING_PERIOD_ANCHOR_START_DMY = "1-1-2026";
// /** Submit matrix export: `31-12-2026`. */
// export const EXCEL_INVOICING_PERIOD_ANCHOR_END_DMY = "31-12-2026";
//
// /** Payment due: valid date = issue date + 3 days (Excel token). */
// export const EXCEL_PAYMENT_DUE_FUTURE_3_DAYS = "__FUTURE_3_DAYS__";
//
// /** UI period start = invoice issue date (earliest day the picker allows). */
// export const UI_INVOICING_PERIOD_START_DAYS_AFTER_ISSUE = 0;
// /** UI period end for Excel `2026-01-31` anchor ≈ one month after issue. */
// export const UI_INVOICING_PERIOD_END_DAYS_AFTER_ISSUE = 30;
//
// /** @deprecated Use {@link UI_INVOICING_PERIOD_START_DAYS_AFTER_ISSUE} / issue-based resolution. */
// export const UI_INVOICING_PERIOD_START_MONTH_OFFSET = 1;
// /** @deprecated Use {@link UI_INVOICING_PERIOD_END_DAYS_AFTER_ISSUE} / issue-based resolution. */
// export const UI_INVOICING_PERIOD_END_MONTH_OFFSET = 2;
//
// export function toIsoDateLocal(d: Date): string {
//   const y = d.getFullYear();
//   const m = String(d.getMonth() + 1).padStart(2, "0");
//   const day = String(d.getDate()).padStart(2, "0");
//   return `${y}-${m}-${day}`;
// }
//
// const UI_MONTH_PARSE: Record<string, number> = {
//   jan: 1,
//   feb: 2,
//   mar: 3,
//   apr: 4,
//   may: 5,
//   jun: 6,
//   jul: 7,
//   aug: 8,
//   sep: 9,
//   oct: 10,
//   nov: 11,
//   dec: 12,
// };
//
// /** Strip Excel datetime suffix (`2026-01-01 00:00:00` → `2026-01-01`). */
// export function stripExcelDateTime(value: string): string {
//   return value.trim().replace(/\s+\d{1,2}:\d{2}(?::\d{2})?.*$/, "").trim();
// }
//
// /** Parse picker / hidden input → ISO (`yyyy-mm-dd`, `d-m-yyyy`, `dd/MM/yyyy`, `May 20, 2026`). */
// export function parseUiDateToIso(value: string): string | null {
//   const v = stripExcelDateTime(value);
//   let m = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
//   if (m) {
//     return `${m[1]}-${m[2]}-${m[3]}`;
//   }
//   m = v.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
//   if (m) {
//     return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
//   }
//   m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
//   if (m) {
//     return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
//   }
//   m = v.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
//   if (m) {
//     const month = UI_MONTH_PARSE[m[1].slice(0, 3).toLowerCase()];
//     if (month) {
//       return `${m[3]}-${String(month).padStart(2, "0")}-${m[2].padStart(2, "0")}`;
//     }
//   }
//   return null;
// }
//
// /** True when `yyyy-mm-dd` is a real calendar day (rejects e.g. `2026-02-31`). */
// export function isValidCalendarIsoDate(iso: string): boolean {
//   const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
//   if (!m) return false;
//   const y = Number(m[1]);
//   const mo = Number(m[2]);
//   const d = Number(m[3]);
//   if (mo < 1 || mo > 12 || d < 1) return false;
//   const dt = new Date(y, mo - 1, d);
//   return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d;
// }
//
// export function addDaysIso(isoDate: string, days: number): string {
//   const d = new Date(`${isoDate}T12:00:00`);
//   d.setDate(d.getDate() + days);
//   return toIsoDateLocal(d);
// }
//
// /** Month delta (ISO year-month only) for calendar **Next/Previous month** navigation. */
// export function calendarMonthsAfterIssue(issueIso: string, targetIso: string): number {
//   const issueParts = issueIso.match(/^(\d{4})-(\d{2})/);
//   const targetParts = targetIso.match(/^(\d{4})-(\d{2})/);
//   if (!issueParts || !targetParts) {
//     return 0;
//   }
//   const issueYear = Number(issueParts[1]);
//   const issueMonth = Number(issueParts[2]);
//   const targetYear = Number(targetParts[1]);
//   const targetMonth = Number(targetParts[2]);
//   return (targetYear - issueYear) * 12 + (targetMonth - issueMonth);
// }
//
// /**
//  * Resolve payment due for UI from Excel token / ISO, relative to `#invIssueDate`.
//  * Invalid formats are returned unchanged for negative tests.
//  */
// export function resolveUiPaymentDueDate(raw: string, issueDateIso: string): string {
//   const trimmed = stripExcelDateTime(raw);
//   if (trimmed === "") {
//     return "";
//   }
//   if (trimmed.toUpperCase() === EXCEL_PAYMENT_DUE_FUTURE_3_DAYS) {
//     return addDaysIso(issueDateIso, 3);
//   }
//   const iso = parseUiDateToIso(trimmed);
//   if (!iso || !isValidCalendarIsoDate(iso)) {
//     return trimmed;
//   }
//   if (iso < issueDateIso) {
//     return addDaysIso(issueDateIso, 3);
//   }
//   return iso;
// }
//
// /** @deprecated Prefer {@link addDaysIso} from issue date for UI period fields. */
// export function firstDayOfMonthOffsetFromIssue(
//   issueDateIso: string,
//   monthOffset: number
// ): string {
//   const issue = new Date(`${issueDateIso}T12:00:00`);
//   const d = new Date(issue.getFullYear(), issue.getMonth() + monthOffset, 1, 12, 0, 0, 0);
//   return toIsoDateLocal(d);
// }
//
// /**
//  * Map Excel period token → ISO on/after **invoice issue date** (UI minimum).
//  */
// export function resolveUiInvoicingPeriodDate(
//   excelDate: string,
//   issueDateIso: string
// ): string {
//   const trimmed = stripExcelDateTime(excelDate);
//   if (trimmed === "") {
//     return "";
//   }
//
//   switch (trimmed) {
//     case EXCEL_INVOICING_PERIOD_ANCHOR_START:
//     case EXCEL_INVOICING_PERIOD_ANCHOR_START_DMY:
//     case "1/1/2026":
//       return addDaysIso(issueDateIso, UI_INVOICING_PERIOD_START_DAYS_AFTER_ISSUE);
//     case EXCEL_INVOICING_PERIOD_ANCHOR_END:
//       return addDaysIso(issueDateIso, UI_INVOICING_PERIOD_END_DAYS_AFTER_ISSUE);
//     case EXCEL_INVOICING_PERIOD_ANCHOR_END_PLUS_ONE:
//       return addDaysIso(issueDateIso, 1);
//     case EXCEL_INVOICING_PERIOD_ANCHOR_END_DMY: {
//       const iso = parseUiDateToIso(trimmed);
//       if (iso && iso >= issueDateIso) {
//         return iso;
//       }
//       return addDaysIso(issueDateIso, UI_INVOICING_PERIOD_END_DAYS_AFTER_ISSUE);
//     }
//     default: {
//       const iso = parseUiDateToIso(trimmed);
//       if (!iso) {
//         return trimmed;
//       }
//       if (iso < issueDateIso) {
//         return addDaysIso(issueDateIso, UI_INVOICING_PERIOD_START_DAYS_AFTER_ISSUE);
//       }
//       return iso;
//     }
//   }
// }
//
// export function resolveUiInvoicingPeriodStartEnd(
//   startExcel: string,
//   endExcel: string,
//   issueDateIso: string
// ): { start: string; end: string } {
//   const start = startExcel.trim();
//   const end = endExcel.trim();
//
//   const resolvedStart = resolveUiInvoicingPeriodDate(start, issueDateIso);
//   let resolvedEnd = resolveUiInvoicingPeriodDate(end, issueDateIso);
//
//   if (
//     start === EXCEL_INVOICING_PERIOD_ANCHOR_START &&
//     end === EXCEL_INVOICING_PERIOD_ANCHOR_END_PLUS_ONE &&
//     resolvedStart
//   ) {
//     resolvedEnd = addDaysIso(resolvedStart, 1);
//   }
//
//   return { start: resolvedStart, end: resolvedEnd };
// }
//
// export function describeUiInvoicingPeriodExcelDate(excelDate: string): string {
//   const trimmed = excelDate.trim();
//   if (trimmed === "") {
//     return "empty";
//   }
//   switch (trimmed) {
//     case EXCEL_INVOICING_PERIOD_ANCHOR_START:
//       return "invoice issue date (today)";
//     case EXCEL_INVOICING_PERIOD_ANCHOR_END:
//       return `issue + ${UI_INVOICING_PERIOD_END_DAYS_AFTER_ISSUE} days`;
//     case EXCEL_INVOICING_PERIOD_ANCHOR_END_PLUS_ONE:
//       return "issue + 1 day";
//     default:
//       return trimmed;
//   }
// }
//
// export function uiInvoicingPeriodScenarioTitle(
//   excelTitle: string,
//   startExcel: string,
//   endExcel: string
// ): string {
//   let title = excelTitle;
//   const startUi = describeUiInvoicingPeriodExcelDate(startExcel);
//   const endUi = describeUiInvoicingPeriodExcelDate(endExcel);
//
//   if (startExcel.trim()) {
//     title = title.replace(
//       `Invoicing Period Start Date Value ${startExcel.trim()}`,
//       `Invoicing Period Start [${startUi}]`
//     );
//   } else {
//     title = title.replace(
//       /Invoicing Period Start Date Value Empty/g,
//       "Invoicing Period Start [empty]"
//     );
//     title = title.replace(
//       /Invoicing Period Start Date Value Cleared/g,
//       "Invoicing Period Start [cleared]"
//     );
//   }
//
//   if (endExcel.trim()) {
//     title = title.replace(
//       `Invoicing Period End Date Value ${endExcel.trim()}`,
//       `Invoicing Period End [${endUi}]`
//     );
//   } else {
//     title = title.replace(
//       /Invoicing Period End Date Value Empty/g,
//       "Invoicing Period End [empty]"
//     );
//     title = title.replace(
//       /Invoicing Period End Date Value Cleared/g,
//       "Invoicing Period End [cleared]"
//     );
//   }
//
//   return title;
// }
//
// /** Payment due title hint when Excel uses `__FUTURE_3_DAYS__` or fixed ISO. */
// export function uiPaymentDueScenarioTitle(excelTitle: string, paymentDueExcel: string): string {
//   const raw = paymentDueExcel.trim();
//   if (raw.toUpperCase() === EXCEL_PAYMENT_DUE_FUTURE_3_DAYS) {
//     return excelTitle.replace(
//       "Payment Due Date Required Valid Date 2026-04-30",
//       "Payment Due Date [issue + 3 days, calendar]"
//     );
//   }
//   const iso = parseUiDateToIso(raw);
//   if (iso) {
//     return `${excelTitle} [UI calendar → ${iso}]`;
//   }
//   return excelTitle;
// }
//
// /** MUI calendar cannot pick impossible dates (e.g. 31 Feb); skip invalid-format Excel rows on UI. */
// export function isUiPaymentDueScenarioSupported(scenario: PaymentDueDateScenario): boolean {
//   if (/Invalid Format Value/i.test(scenario.title)) {
//     return false;
//   }
//   const trimmed = scenario.paymentDueDate.trim();
//   const iso = parseUiDateToIso(trimmed);
//   if (iso && !isValidCalendarIsoDate(iso)) {
//     return false;
//   }
//   return true;
// }
//
// export function defaultUiInvoicingPeriodRange(issueDateIso: string): {
//   start: string;
//   end: string;
// } {
//   return {
//     start: addDaysIso(issueDateIso, UI_INVOICING_PERIOD_START_DAYS_AFTER_ISSUE),
//     end: addDaysIso(issueDateIso, UI_INVOICING_PERIOD_END_DAYS_AFTER_ISSUE),
//   };
// }
//
// function isSummaryInvoiceTransactionType(
//   invoiceTransactionTypeCode?: string,
//   title?: string
// ): boolean {
//   const txn = (invoiceTransactionTypeCode ?? "").trim();
//   if (txn === INVOICE_TRANSACTION_TYPE_CODE_SUMMARY_INVOICE) {
//     return true;
//   }
//   return /summary invoice/i.test(title ?? "");
// }
//
// /**
//  * Excel IBG-14 pair rule (one of start/end without the other) applies to all transaction types;
//  * Create Invoice UI enforces it only for Summary Invoice (XXX1XXXX).
//  */
// export function uiInvoicingPeriodShouldError(
//   scenario: InvoicingPeriodConditionalScenario
// ): boolean {
//   if (!scenario.shouldError) {
//     return false;
//   }
//
//   const start = scenario.invoicingPeriodStartDate.trim();
//   const end = scenario.invoicingPeriodEndDate.trim();
//   const partialFill = (start !== "" && end === "") || (start === "" && end !== "");
//
//   if (
//     partialFill &&
//     !isSummaryInvoiceTransactionType(
//       scenario.invoiceTransactionTypeCode,
//       scenario.title
//     )
//   ) {
//     return false;
//   }
//
//   return scenario.shouldError;
// }
//
// /**
//  * Excel requires payment due date for Standard Invoice + Normal txn; Create Invoice UI treats it as optional.
//  */
// export function uiPaymentDueShouldError(scenario: PaymentDueDateScenario): boolean {
//   if (!scenario.shouldError) {
//     return false;
//   }
//
//   const isStandardCommercial =
//     scenario.invoiceTypeCode.trim() === "Commercial Invoice" &&
//     scenario.invoiceTransactionTypeCode.trim() === "Standard Tax Invoice";
//
//   if (!isStandardCommercial) {
//     return scenario.shouldError;
//   }
//
//   const raw = scenario.paymentDueDate;
//   const trimmed = raw.trim();
//   if (trimmed === "") {
//     return false;
//   }
//   if (raw !== "" && trimmed === "") {
//     return false;
//   }
//   if (!parseUiDateToIso(trimmed)) {
//     return false;
//   }
//
//   return scenario.shouldError;
// }
//
