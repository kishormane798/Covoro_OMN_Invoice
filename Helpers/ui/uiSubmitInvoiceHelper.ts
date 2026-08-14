// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under a ui/ subfolder; executable code is commented out.
//
// /**
//  * **Create Invoice UI submit E2E** â€” fill all manual sections from `invoiceData` / multi-item rows
//  * (Excel header keys), save each section, click page **Submit**, then dashboard Options â†’ Submit and wait for delivered.
//  *
//  * Date fields use the same resolution as conditional UI tests (`uiInvoiceCreationDocumentDates.ts`
//  * + `uiInvoiceCreationConditionalHelper.ts`): Excel anchors/tokens map to calendar-safe ISO dates
//  * relative to `#invIssueDate`, not literal past Excel calendar months.
//  *
//  * Row shaping applies tax-category rules only (does not import `submitInvoiceCaseHelper`).
//  */
// import type { Page } from "@playwright/test";
// import { DashboardPage } from "../pageObjects/OMN_DashboardPage";
// import { UIInvoiceCreationManualPage } from "../pageObjects/OMN_UIInvoiceCreationManualPage";
// import {
//   CREATE_INVOICE_SEARCH_BUYER_NAME,
//   CREATE_INVOICE_SEARCH_BUYER_VAT,
// } from "../../testData/ui/uiInvoiceCreationConfig";
// import {
//   creditNoteReasonRequiresPrecedingInvoice,
//   isKnownCreditNoteReasonDropdownOption,
//   isUiCreditNoteInvoiceType,
// } from "../../testData/ui/uiInvoiceCreationCreditNote";
// import {
//   parseUiDateToIso,
//   resolveUiPaymentDueDate,
//   resolveUiInvoicingPeriodStartEnd,
// } from "../../testData/ui/uiInvoiceCreationDocumentDates";
// import { INVOICE_TRANSACTION_TYPE_CODE_E_COMMERCE_SUPPLIES } from "../../testData/ui/ConditionalValidation";
// import { CREATE_INVOICE_FORMULA_INPUT_CANDIDATES } from "../../testData/ui/uiInvoiceCreationFormulaValidation";
// import {
//   DEFAULT_UI_MASTER_ITEM_TAX_CATEGORY,
//   UI_MASTER_CLASSIFICATION_SCHEME_LABEL,
//   UI_MASTER_ITEM_TAX_CATEGORY_OPTIONS,
// } from "./uiMasterItemTestData";
// import { applyParallelWorkerIdentityToSubmitRow } from "./parallelWorkerSubmitIdentity";
// import { getDeemedSupplyBuyerElectronicAddress } from "../utils/envPartyIdentity";
// import {
//   isUiSubmitFieldDebugEnabled,
//   terminalLog,
//   flowLog,
// } from "./diagnosticLog";
// 
// /**
//  * Per-test timeout for UI submit specs (fill all sections + page Submit + dashboard delivery).
//  * Must exceed fill time + waitForEinvoiceDashboardShell (120s) + row wait (120s) + delivery poll.
//  */
// export const UI_SUBMIT_INVOICE_TEST_TIMEOUT_MS = 12 * 60 * 1000;
// 
// /** Per-test timeout for UI multi-item submit specs only (`OMN_UISubmitInvoice_MultiItem_Test.spec.ts`). */
// export const UI_SUBMIT_INVOICE_MULTI_TEST_TIMEOUT_MS = 15 * 60 * 1000;
// 
// /** Delivery poll timeout â€” same env knob as Excel submit (`SUBMIT_INVOICE_DELIVERY_TIMEOUT_MS`). */
// export const UI_SUBMIT_INVOICE_DELIVERY_TIMEOUT_MS = (() => {
//   const raw = process.env.SUBMIT_INVOICE_DELIVERY_TIMEOUT_MS?.trim();
//   if (raw) {
//     const n = Number.parseInt(raw, 10);
//     if (Number.isFinite(n) && n >= 60_000) return n;
//   }
//   return 2 * 60 * 1000;
// })();
// 
// const ITEM_SETTLE_MS = 800;
// 
// export { UI_SUBMIT_FIELD_DEBUG_ENV, isUiSubmitFieldDebugEnabled } from "./diagnosticLog";
// 
// type UiSubmitFieldAction = "text" | "select" | "date" | "numeric" | "search" | "action" | "section-skip";
// 
// type UiSubmitFieldRecord = {
//   section: string;
//   excelKey: string;
//   inputId: string;
//   action: UiSubmitFieldAction;
//   excelValue: string;
//   status: "skip-empty" | "skip-disabled" | "ok" | "mismatch" | "error";
//   actualValue?: string;
//   error?: string;
// };
// 
// /** Per-field trace for UI submit fill when `UI_SUBMIT_DEBUG=1` (see `diagnosticLog.ts`). */
// export class UiSubmitFieldDebug {
//   private readonly records: UiSubmitFieldRecord[] = [];
//   private currentSection = "";
// 
//   constructor(private readonly enabled: boolean) {}
// 
//   static noop(): UiSubmitFieldDebug {
//     return new UiSubmitFieldDebug(false);
//   }
// 
//   private log(message: string): void {
//     if (!this.enabled) return;
//     terminalLog(message);
//   }
// 
//   enterSection(section: string): void {
//     this.currentSection = section;
//     this.log(`[ui-submit] â”€â”€ ${section} â”€â”€`);
//   }
// 
//   sectionSkip(reason: string): void {
//     this.log(`[ui-submit] ${this.currentSection} | SKIP SECTION | ${reason}`);
//   }
// 
//   skipDisabled(excelKey: string, inputId: string, excelValue: string, reason: string): void {
//     this.push({
//       section: this.currentSection,
//       excelKey,
//       inputId,
//       action: "text",
//       excelValue,
//       status: "skip-disabled",
//       actualValue: reason,
//     });
//   }
// 
//   private push(record: UiSubmitFieldRecord): void {
//     this.records.push(record);
//     const tag = record.status.toUpperCase().padEnd(11);
//     const actual =
//       record.actualValue !== undefined ? ` | actual=${JSON.stringify(record.actualValue)}` : "";
//     const err = record.error ? ` | error=${record.error}` : "";
//     this.log(
//       `[ui-submit] ${record.section} | ${tag} | ${record.action} | #${record.inputId} | ${record.excelKey} | excel=${JSON.stringify(record.excelValue)}${actual}${err}`
//     );
//   }
// 
//   async field(
//     invoice: UIInvoiceCreationManualPage,
//     excelKey: string,
//     inputId: string,
//     action: UiSubmitFieldAction,
//     excelValue: string,
//     body: () => Promise<void>,
//     options?: { verifyInputId?: string; skipIfEmpty?: boolean }
//   ): Promise<void> {
//     const skipIfEmpty = options?.skipIfEmpty !== false;
//     if (skipIfEmpty && excelValue === "") {
//       this.push({
//         section: this.currentSection,
//         excelKey,
//         inputId,
//         action,
//         excelValue,
//         status: "skip-empty",
//       });
//       return;
//     }
// 
//     if (!this.enabled) {
//       await body();
//       return;
//     }
// 
//     try {
//       await body();
//       let actualValue: string | undefined;
//       let status: UiSubmitFieldRecord["status"] = "ok";
//       const verifyId = options?.verifyInputId ?? (action === "text" || action === "numeric" ? inputId : undefined);
//       if (verifyId && excelValue !== "") {
//         actualValue = await invoice.readInputValueById(verifyId).catch(() => "");
//         if (actualValue !== excelValue && !actualValue.includes(excelValue) && excelValue !== actualValue) {
//           status = "mismatch";
//         }
//       }
//       this.push({
//         section: this.currentSection,
//         excelKey,
//         inputId,
//         action,
//         excelValue,
//         status,
//         actualValue,
//       });
//     } catch (error) {
//       const message = error instanceof Error ? error.message : String(error);
//       this.push({
//         section: this.currentSection,
//         excelKey,
//         inputId,
//         action,
//         excelValue,
//         status: "error",
//         error: message,
//       });
//       throw error;
//     }
//   }
// 
//   async action(excelKey: string, inputId: string, detail: string, body: () => Promise<void>): Promise<void> {
//     if (!this.enabled) {
//       await body();
//       return;
//     }
//     try {
//       await body();
//       this.push({
//         section: this.currentSection,
//         excelKey,
//         inputId,
//         action: "action",
//         excelValue: detail,
//         status: "ok",
//       });
//     } catch (error) {
//       const message = error instanceof Error ? error.message : String(error);
//       this.push({
//         section: this.currentSection,
//         excelKey,
//         inputId,
//         action: "action",
//         excelValue: detail,
//         status: "error",
//         error: message,
//       });
//       throw error;
//     }
//   }
// 
//   printSummary(): void {
//     if (!this.enabled || this.records.length === 0) return;
//     const skipEmpty = this.records.filter((r) => r.status === "skip-empty").length;
//     const skipDisabled = this.records.filter((r) => r.status === "skip-disabled").length;
//     const ok = this.records.filter((r) => r.status === "ok").length;
//     const mismatch = this.records.filter((r) => r.status === "mismatch");
//     const errors = this.records.filter((r) => r.status === "error");
//     this.log(
//       `[ui-submit] summary: ok=${ok} skip-empty=${skipEmpty} skip-disabled=${skipDisabled} mismatch=${mismatch.length} error=${errors.length}`
//     );
//     for (const row of [...mismatch, ...errors]) {
//       this.log(
//         `[ui-submit]   ! ${row.section} | #${row.inputId} | ${row.excelKey} | ${row.status} | excel=${JSON.stringify(row.excelValue)}${row.actualValue !== undefined ? ` actual=${JSON.stringify(row.actualValue)}` : ""}${row.error ? ` ${row.error}` : ""}`
//       );
//     }
//   }
// }
// 
// let activeFieldDebug: UiSubmitFieldDebug = UiSubmitFieldDebug.noop();
// 
// function fieldDebug(): UiSubmitFieldDebug {
//   return activeFieldDebug;
// }
// 
// async function fillRowText(
//   invoice: UIInvoiceCreationManualPage,
//   section: string,
//   row: Record<string, string>,
//   excelKey: string,
//   inputId: string
// ): Promise<void> {
//   const value = submitRowValue(row, excelKey);
//   if (value !== "" && !(await invoice.isFormInputEnabled(inputId))) {
//     fieldDebug().skipDisabled(excelKey, inputId, value, "control disabled for current document type");
//     return;
//   }
//   await fieldDebug().field(invoice, excelKey, inputId, "text", value, async () => {
//     if (!value) return;
//     await invoice.replaceInputByIdIfEnabled(inputId, value);
//   });
// }
// 
// async function fillRowTextValue(
//   invoice: UIInvoiceCreationManualPage,
//   section: string,
//   excelKey: string,
//   inputId: string,
//   value: string
// ): Promise<void> {
//   await fieldDebug().field(invoice, excelKey, inputId, "text", value, async () => {
//     if (!value) return;
//     await invoice.replaceInputById(inputId, value);
//   });
// }
// 
// async function selectRowValue(
//   invoice: UIInvoiceCreationManualPage,
//   section: string,
//   excelKey: string,
//   inputId: string,
//   value: string,
//   select: (v: string) => Promise<void>
// ): Promise<void> {
//   await fieldDebug().field(invoice, excelKey, inputId, "select", value, async () => {
//     if (!value) return;
//     await select(value);
//   });
// }
// 
// async function fillRowNumeric(
//   invoice: UIInvoiceCreationManualPage,
//   section: string,
//   row: Record<string, string>,
//   excelKey: string,
//   candidateKey: string,
//   candidates: readonly string[],
//   options?: { allowEmpty?: boolean }
// ): Promise<void> {
//   const value = submitRowValue(row, excelKey);
//   if (!options?.allowEmpty && value === "") {
//     await fieldDebug().field(invoice, excelKey, candidateKey, "numeric", value, async () => {});
//     return;
//   }
//   await fieldDebug().field(
//     invoice,
//     excelKey,
//     candidates[0] ?? candidateKey,
//     "numeric",
//     value,
//     async () => {
//       if (value === "") {
//         await invoice.clearFirstAvailableId(candidates);
//         return;
//       }
//       await invoice.fillFirstAvailableId(candidates, value);
//     },
//     { skipIfEmpty: false }
//   );
// }
// 
// function applyUiSubmitTaxCategoryRules(data: Record<string, string>): Record<string, string> {
//   const taxCategory = String(data["Tax Category"] ?? "")
//     .replace(/\s+/g, " ")
//     .trim()
//     .toLowerCase();
//   if (!taxCategory) {
//     return { ...data };
//   }
//   const next: Record<string, string> = { ...data };
//   if (
//     taxCategory === "services outside scope of tax / not subject to tax" ||
//     taxCategory === "services outside scope of tax"
//   ) {
//     next["Tax Rate"] = "";
//   }
//   return next;
// }
// 
// function applyUiSubmitDeemedSupplyBuyerElectronic(
//   data: Record<string, string>
// ): Record<string, string> {
//   if (normalizeSubmitTxnType(data) !== "deemed supply") {
//     return data;
//   }
//   return { ...data, "Buyer electronic address": getDeemedSupplyBuyerElectronicAddress() };
// }
// 
// /** Shape submit row for UI fill â€” tax rules + worker TIN/TRN patch (same as Excel upload). */
// export function prepareUiSubmitInvoiceRow(data: Record<string, string>): Record<string, string> {
//   return applyUiSubmitDeemedSupplyBuyerElectronic(
//     applyParallelWorkerIdentityToSubmitRow(applyUiSubmitTaxCategoryRules(data))
//   );
// }
// 
// /** First non-empty value among Excel header aliases. */
// export function submitRowValue(row: Record<string, string>, ...keys: string[]): string {
//   for (const key of keys) {
//     const raw = row[key];
//     if (raw === undefined || raw === null) continue;
//     const trimmed = String(raw).trim();
//     if (trimmed !== "") return trimmed;
//   }
//   return "";
// }
// 
// const UI_SUBMIT_EXPORT_TRANSACTION_TYPE = "Exports";
// 
// function normalizeSubmitTxnType(row: Record<string, string>): string {
//   return submitRowValue(row, "Invoice Transaction Type Code")
//     .replace(/\s+/g, " ")
//     .trim()
//     .toLowerCase()
//     .replace(/-/g, " ");
// }
// 
// function hasDeliveryData(row: Record<string, string>): boolean {
//   return (
//     submitRowValue(
//       row,
//       "Deliver to party name",
//       "Deliver to address line 1",
//       "Deliver to city",
//       "Deliver to country code",
//       "Deliver to location identifier",
//       "Actual delivery date",
//       "Delivery to location Scheme"
//     ) !== ""
//   );
// }
// 
// /** Export and e-commerce supplies always need the delivery section filled in UI submit. */
// function submitRowRequiresDeliverySection(row: Record<string, string>): boolean {
//   if (hasDeliveryData(row)) {
//     return true;
//   }
//   const txn = normalizeSubmitTxnType(row);
//   return (
//     txn === UI_SUBMIT_EXPORT_TRANSACTION_TYPE.toLowerCase() ||
//     txn === INVOICE_TRANSACTION_TYPE_CODE_E_COMMERCE_SUPPLIES.toLowerCase()
//   );
// }
// 
// const UI_ITEM_TAX_EXEMPTION_REASON_TYPE_INPUT_ID = "taxExemptionRsnType";
// const UI_ITEM_TAX_EXEMPTION_REASON_TEXT_INPUT_ID = "taxExemptionRsn";
// 
// function isExemptFromTaxCategory(taxCategory: string): boolean {
//   return taxCategory.trim().toLowerCase().replace(/\.$/, "") === "exempt from tax";
// }
// 
// async function waitForItemTaxExemptionFieldsReady(
//   invoice: UIInvoiceCreationManualPage
// ): Promise<void> {
//   const deadline = Date.now() + 15_000;
//   while (Date.now() < deadline) {
//     if (await invoice.isFormInputEnabled(UI_ITEM_TAX_EXEMPTION_REASON_TYPE_INPUT_ID)) {
//       return;
//     }
//     await invoice.waitForItemCalculatedFieldsSettle(200);
//   }
// }
// 
// /** IBG-30: **Exempt from tax** lines require reason type + reason text on the item modal. */
// async function applyItemTaxExemptionReasonFromRow(
//   invoice: UIInvoiceCreationManualPage,
//   row: Record<string, string>,
//   taxCategory: string
// ): Promise<void> {
//   if (!isExemptFromTaxCategory(taxCategory)) {
//     return;
//   }
// 
//   await betweenSections(invoice);
//   await waitForItemTaxExemptionFieldsReady(invoice);
// 
//   const reasonCode = submitRowValue(row, "Tax exemption reason code");
//   await selectRowValue(
//     invoice,
//     "item",
//     "Tax exemption reason code",
//     UI_ITEM_TAX_EXEMPTION_REASON_TYPE_INPUT_ID,
//     reasonCode,
//     async (value) => {
//       await invoice.selectAutocompleteById(UI_ITEM_TAX_EXEMPTION_REASON_TYPE_INPUT_ID, value, {
//         filterText: value.slice(0, 30),
//         optionTimeoutMs: 30_000,
//       });
//     }
//   );
// 
//   await fillRowText(
//     invoice,
//     "item",
//     row,
//     "Tax exemption reason text",
//     UI_ITEM_TAX_EXEMPTION_REASON_TEXT_INPUT_ID
//   );
// }
// 
// /** Map Excel tax category to MUI listbox option + filter text (trailing `.` is optional in UI). */
// function resolveUiItemTaxCategoryPick(label: string): { option: string | RegExp; filterText: string } {
//   const normalized = label.trim().toLowerCase().replace(/\.$/, "");
//   for (const optionLabel of UI_MASTER_ITEM_TAX_CATEGORY_OPTIONS) {
//     const optionNorm = optionLabel.toLowerCase().replace(/\.$/, "");
//     if (optionNorm !== normalized) continue;
//     if (/^standard rate$/i.test(optionNorm)) {
//       return { option: DEFAULT_UI_MASTER_ITEM_TAX_CATEGORY, filterText: "Standard rate" };
//     }
//     const escaped = optionLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//     return {
//       option: new RegExp(`^${escaped.replace(/\\\.$/, "\\.?")}$`, "i"),
//       filterText: optionLabel.replace(/\.$/, "").slice(0, 40),
//     };
//   }
//   return { option: label, filterText: label.replace(/\.$/, "").slice(0, 40) };
// }
// 
// async function betweenSections(invoice: UIInvoiceCreationManualPage): Promise<void> {
//   await invoice.dismissAutocompletePopperIfOpen();
//   await invoice.blurActiveElement();
// }
// 
// async function saveDocumentDraft(invoice: UIInvoiceCreationManualPage): Promise<void> {
//   await betweenSections(invoice);
//   await fieldDebug().action("document", "save", "click document Save", () => invoice.clickDocumentSave());
//   await invoice.expectDocumentViewMode();
// }
// 
// async function saveInlineSection(
//   invoice: UIInvoiceCreationManualPage,
//   section: "seller" | "buyer" | "delivery" | "item" | "payment" | "custom" | "invoice"
// ): Promise<void> {
//   await betweenSections(invoice);
//   await fieldDebug().action(section, "save", `click ${section} Save`, () =>
//     invoice.clickSectionSave(section)
//   );
//   await invoice.blurActiveElement();
// }
// 
// /**
//  * Invoicing period â€” same rules as `applyInvoicingPeriodConditional` / conditional UI spec.
//  * Excel `1-1-2026` / `31-12-2026` anchors resolve to issue-relative dates for MUI calendar.
//  */
// async function applySubmitRowInvoicingPeriod(
//   invoice: UIInvoiceCreationManualPage,
//   row: Record<string, string>
// ): Promise<void> {
//   const startExcel = submitRowValue(row, "Invoicing period start date");
//   const endExcel = submitRowValue(row, "Invoicing period end date");
// 
//   if (startExcel === "" && endExcel === "") {
//     await fieldDebug().field(
//       invoice,
//       "Invoicing period start date",
//       "invStartDate",
//       "date",
//       "",
//       async () => {}
//     );
//     return;
//   }
// 
//   const issueIso = await invoice.readDocumentIssueDateIso();
//   const { start, end } = resolveUiInvoicingPeriodStartEnd(startExcel, endExcel, issueIso);
//   if (!start && !end) {
//     return;
//   }
// 
//   await fieldDebug().field(
//     invoice,
//     "Invoicing period start date",
//     "invStartDate",
//     "date",
//     `start ${startExcel} â†’ ${start}; end ${endExcel} â†’ ${end}`,
//     async () => {
//       await invoice.setDocumentInvoicingPeriod(start || undefined, end || undefined);
//       if (start) {
//         await invoice.expectDocumentDateFieldValue("invStartDate", start);
//       }
//       if (end) {
//         await invoice.expectDocumentDateFieldValue("invEndDate", end);
//       }
//     },
//     { skipIfEmpty: false }
//   );
// }
// 
// /**
//  * Payment due date â€” same rules as `applyPaymentDueDateForScenario` in conditional UI helper.
//  */
// async function applySubmitRowPaymentDueDate(
//   invoice: UIInvoiceCreationManualPage,
//   row: Record<string, string>
// ): Promise<void> {
//   const raw = submitRowValue(row, "Payment due date");
//   const trimmed = raw.trim();
//   const issueIso = await invoice.readDocumentIssueDateIso();
// 
//   if (trimmed === "" && raw === "") {
//     await fieldDebug().field(invoice, "Payment due date", "paymentDueDate", "date", "", async () => {});
//     return;
//   }
// 
//   if (trimmed === "" && raw !== "") {
//     await fieldDebug().field(
//       invoice,
//       "Payment due date",
//       "paymentDueDate",
//       "date",
//       raw,
//       async () => {
//         await invoice.setDocumentDateHiddenValue("paymentDueDate", raw);
//         await invoice.touchDocumentDateFieldForValidation("paymentDueDate");
//       },
//       { skipIfEmpty: false }
//     );
//     return;
//   }
// 
//   const resolved = resolveUiPaymentDueDate(raw, issueIso);
//   const resolvedIso = parseUiDateToIso(resolved);
//   const displayValue = resolvedIso ?? resolved;
// 
//   await fieldDebug().field(
//     invoice,
//     "Payment due date",
//     "paymentDueDate",
//     "date",
//     `${raw} â†’ ${displayValue}`,
//     async () => {
//       if (!resolvedIso) {
//         await invoice.setDocumentDateHiddenValue("paymentDueDate", resolved);
//         await invoice.touchDocumentDateFieldForValidation("paymentDueDate");
//         return;
//       }
//       await invoice.fillDocumentDateById("paymentDueDate", resolvedIso);
//       await invoice.expectDocumentDateFieldValue("paymentDueDate", resolvedIso);
//     },
//     { skipIfEmpty: false }
//   );
// }
// 
// /** Actual delivery date â€” same Excel resolution as payment due date (issue-relative calendar). */
// async function applySubmitRowActualDeliveryDate(
//   invoice: UIInvoiceCreationManualPage,
//   row: Record<string, string>
// ): Promise<void> {
//   const raw = submitRowValue(row, "Actual delivery date");
//   const trimmed = raw.trim();
//   if (trimmed === "" && raw === "") {
//     await fieldDebug().field(invoice, "Actual delivery date", "actualDeliveryDate", "date", "", async () => {});
//     return;
//   }
// 
//   const issueIso = await invoice.readDocumentIssueDateIso();
//   const resolved = resolveUiPaymentDueDate(raw, issueIso);
//   const resolvedIso = parseUiDateToIso(resolved);
//   const displayValue = resolvedIso ?? resolved;
// 
//   await fieldDebug().field(
//     invoice,
//     "Actual delivery date",
//     "actualDeliveryDate",
//     "date",
//     `${raw} â†’ ${displayValue}`,
//     async () => {
//       if (!resolvedIso) {
//         await invoice.setDocumentDateHiddenValue("actualDeliveryDate", resolved);
//         await invoice.touchDocumentDateFieldForValidation("actualDeliveryDate");
//         return;
//       }
//       await invoice.fillDocumentDateById("actualDeliveryDate", resolvedIso);
//       await invoice.expectDocumentDateFieldValue("actualDeliveryDate", resolvedIso);
//     },
//     { skipIfEmpty: false }
//   );
// }
// 
// async function applySubmitRowCreditNoteFields(
//   invoice: UIInvoiceCreationManualPage,
//   row: Record<string, string>,
//   invoiceType: string
// ): Promise<void> {
//   if (!isUiCreditNoteInvoiceType(invoiceType)) {
//     return;
//   }
// 
//   const creditNoteReason = submitRowValue(row, "Credit note reason code");
//   await fieldDebug().field(
//     invoice,
//     "Credit note reason code",
//     "creditNoteRsn",
//     "select",
//     creditNoteReason,
//     async () => {
//       if (!creditNoteReason) return;
//       if (isKnownCreditNoteReasonDropdownOption(creditNoteReason)) {
//         await invoice.selectDocumentCreditNoteReason(creditNoteReason);
//       } else {
//         await invoice.fillDocumentCreditNoteReasonFreeText(creditNoteReason);
//       }
//     }
//   );
// 
//   if (!creditNoteReasonRequiresPrecedingInvoice(creditNoteReason)) {
//     return;
//   }
// 
//   const precedingRef = submitRowValue(row, "Preceding Invoice reference");
//   const issueIso = await invoice.readDocumentIssueDateIso();
//   const precedingIso = issueIso;
// 
//   await fieldDebug().field(
//     invoice,
//     "Preceding Invoice reference",
//     "precedingInvoiceRef",
//     "text",
//     `${precedingRef} @ ${precedingIso}`,
//     async () => {
//       if (!precedingRef) return;
//       await invoice.fillDocumentPrecedingInvoice(precedingRef, precedingIso);
//     }
//   );
// }
// 
// /** Invoice note is enabled in UI only when Frequency of Billing = Others (see conditional2 helper). */
// const UI_FREQUENCY_OF_BILLING_OTHERS = "Others";
// 
// async function applySubmitRowFrequencyAndInvoiceNote(
//   invoice: UIInvoiceCreationManualPage,
//   row: Record<string, string>
// ): Promise<void> {
//   const frequency = submitRowValue(row, "Frequency of Billing");
//   const invoiceNote = submitRowValue(row, "Invoice note");
// 
//   if (frequency) {
//     await selectRowValue(invoice, "document", "Frequency of Billing", "frequencyOfBilling", frequency, (v) =>
//       invoice.selectDocumentFrequencyOfBilling(v)
//     );
//   }
// 
//   if (!/^others$/i.test(frequency.trim())) {
//     fieldDebug().sectionSkip(
//       invoiceNote
//         ? `Invoice note ignored (excel has value) â€” only enabled when Frequency of Billing is "${UI_FREQUENCY_OF_BILLING_OTHERS}"`
//         : "Invoice note skipped â€” Frequency of Billing is not Others"
//     );
//     return;
//   }
// 
//   await fillRowText(invoice, "document", row, "Invoice note", "invNote");
// }
// 
// /** 1. Document â€” Excel row values; Save draft. */
// async function fillAndSaveDocumentSection(
//   invoice: UIInvoiceCreationManualPage,
//   row: Record<string, string>,
//   invoiceNumber: string
// ): Promise<void> {
//   fieldDebug().enterSection("document");
//   await invoice.ensureDocumentEditable();
//   await fillRowTextValue(invoice, "document", "Invoice number", "invNum", invoiceNumber);
// 
//   const invoiceType = submitRowValue(row, "Invoice Type Code");
//   await selectRowValue(invoice, "document", "Invoice Type Code", "invType", invoiceType, (v) =>
//     invoice.selectDocumentInvoiceType(v)
//   );
// 
//   const txnType = submitRowValue(row, "Invoice Transaction Type Code");
//   await selectRowValue(invoice, "document", "Invoice Transaction Type Code", "invTxnType", txnType, (v) =>
//     invoice.selectDocumentTransactionType(v)
//   );
// 
//   const currency = submitRowValue(row, "Invoice Currency Code") || "AED";
//   const exchangeRate = submitRowValue(row, "Currency Exchange Rate");
//   await fieldDebug().field(
//     invoice,
//     "Invoice Currency Code",
//     "invCurrCode",
//     "select",
//     currency,
//     async () => {
//       await invoice.applyDocumentCurrencyAndExchangeRate(currency, exchangeRate || null);
//     },
//     { skipIfEmpty: false }
//   );
//   if (exchangeRate) {
//     await fieldDebug().field(
//       invoice,
//       "Currency Exchange Rate",
//       "currExchangeRate",
//       "text",
//       exchangeRate,
//       async () => {},
//       { skipIfEmpty: false }
//     );
//   }
// 
//   await applySubmitRowCreditNoteFields(invoice, row, invoiceType);
// 
//   await fillRowText(invoice, "document", row, "Principle ID", "principleId");
//   await fillRowText(invoice, "document", row, "Contract Reference", "contactReference");
//   await fillRowText(invoice, "document", row, "Purchase Order Number", "purchaseOrderRef");
// 
//   await applySubmitRowFrequencyAndInvoiceNote(invoice, row);
// 
//   await applySubmitRowInvoicingPeriod(invoice, row);
//   await betweenSections(invoice);
//   await invoice.ensureDocumentEditable();
// 
//   await saveDocumentDraft(invoice);
// }
// 
// /** 2. Seller â€” Excel row only; Save section. */
// async function fillAndSaveSellerSection(
//   invoice: UIInvoiceCreationManualPage,
//   row: Record<string, string>
// ): Promise<void> {
//   fieldDebug().enterSection("seller");
//   await invoice.openSellerEditor();
// 
//   await selectRowValue(
//     invoice,
//     "seller",
//     "Seller electronic address Scheme",
//     "sellerElectronicAddressScheme",
//     submitRowValue(row, "Seller electronic address Scheme"),
//     (v) => invoice.selectSellerElectronicAddressScheme(v)
//   );
//   await selectRowValue(
//     invoice,
//     "seller",
//     "Seller legal registration identifier type",
//     "sellerLegalRegIdType",
//     submitRowValue(row, "Seller legal registration identifier type"),
//     (v) => invoice.selectSellerLegalRegIdType(v)
//   );
// 
//   const sellerCountry = submitRowValue(row, "Seller country code");
//   await selectRowValue(invoice, "seller", "Seller country code", "sellerCountryCode", sellerCountry, async (v) => {
//     await invoice.ensureSellerSchemeAllowsCountryChange(v);
//     await invoice.selectSellerCountry(/^United Arab Emirates$/i.test(v) ? /^United Arab Emirates$/i : v);
//   });
// 
//   await selectRowValue(
//     invoice,
//     "seller",
//     "Seller country subdivision",
//     "sellerCountrySubdivision",
//     submitRowValue(row, "Seller country subdivision"),
//     (v) => invoice.selectSellerCountrySubdivision(v)
//   );
//   await selectRowValue(
//     invoice,
//     "seller",
//     "Seller - Passport issuing Country code",
//     "sellerPassportCountry",
//     submitRowValue(row, "Seller - Passport issuing Country code"),
//     (v) => invoice.selectSellerPassportCountry(v)
//   );
// 
//   await fillRowText(
//     invoice,
//     "seller",
//     row,
//     "Seller legal registration identifier",
//     "sellerLegalRegId"
//   );
//   await fillRowText(invoice, "seller", row, "Seller name", "sellerName");
//   await fillRowText(invoice, "seller", row, "Seller VAT Identifier (TRN / TIN)", "sellerVatIdentifier");
//   await fillRowText(invoice, "seller", row, "Seller electronic address", "sellerElectronicAddress");
//   await fillRowText(invoice, "seller", row, "Seller address line 1", "sellerAddressLine1");
//   await fillRowText(invoice, "seller", row, "Seller city", "sellerCity");
//   await fillRowText(invoice, "seller", row, "Seller post code", "sellerPostCode");
//   await fillRowText(invoice, "seller", row, "Seller - Authority name", "sellerAuthorityName");
// 
//   await saveInlineSection(invoice, "seller");
// }
// 
// /** 3. Buyer â€” search master + Excel row; Save section. */
// async function fillAndSaveBuyerSection(
//   invoice: UIInvoiceCreationManualPage,
//   row: Record<string, string>
// ): Promise<void> {
//   fieldDebug().enterSection("buyer");
//   const buyerName = submitRowValue(row, "Buyer name") || CREATE_INVOICE_SEARCH_BUYER_NAME;
//   const buyerVat = submitRowValue(row, "Buyer VAT identifier") || CREATE_INVOICE_SEARCH_BUYER_VAT;
// 
//   await invoice.openBuyerEditor();
//   await fieldDebug().field(
//     invoice,
//     "Buyer name",
//     "buyerSearch",
//     "search",
//     `${buyerName} (vat ${buyerVat})`,
//     async () => {
//       await invoice.searchAndSelectBuyerIfPresent(buyerName, { vatHint: buyerVat });
//     },
//     { skipIfEmpty: false }
//   );
// 
//   await selectRowValue(
//     invoice,
//     "buyer",
//     "Scheme identifier",
//     "schemeIdentifier",
//     submitRowValue(row, "Scheme identifier"),
//     (v) => invoice.selectBuyerSchemeIdentifier(v)
//   );
//   await selectRowValue(
//     invoice,
//     "buyer",
//     "Buyer legal registration identifier type",
//     "legalRegIdType",
//     submitRowValue(row, "Buyer legal registration identifier type"),
//     (v) => invoice.selectBuyerLegalRegIdType(v)
//   );
//   await selectRowValue(
//     invoice,
//     "buyer",
//     "Buyer electronic address Scheme",
//     "electronicAddressScheme",
//     submitRowValue(row, "Buyer electronic address Scheme"),
//     (v) => invoice.selectBuyerElectronicAddressScheme(v)
//   );
//   await selectRowValue(
//     invoice,
//     "buyer",
//     "Buyer - Passport issuing Country code",
//     "passportCountry",
//     submitRowValue(row, "Buyer - Passport issuing Country code"),
//     (v) => invoice.selectBuyerPassportCountry(v)
//   );
// 
//   const country = submitRowValue(row, "Buyer country code");
//   await selectRowValue(invoice, "buyer", "Buyer country code", "countryCode", country, (v) =>
//     invoice.selectBuyerCountry(/^United Arab Emirates$/i.test(v) ? /^United Arab Emirates$/i : v)
//   );
//   await selectRowValue(
//     invoice,
//     "buyer",
//     "Buyer country subdivision",
//     "countrySubdivision",
//     submitRowValue(row, "Buyer country subdivision"),
//     (v) => invoice.selectBuyerCountrySubdivision(v)
//   );
// 
//   await fillRowText(invoice, "buyer", row, "Buyer identifier", "identifier");
//   await fillRowText(invoice, "buyer", row, "Buyer legal registration identifier", "legalRegId");
//   await fillRowText(invoice, "buyer", row, "Buyer - Authority name", "authorityName");
//   await fillRowText(invoice, "buyer", row, "Buyer electronic address", "electronicAddress");
//   await fillRowText(invoice, "buyer", row, "Beneficiary ID", "beneficiaryId");
//   await fillRowText(invoice, "buyer", row, "Buyer address line 1", "address");
//   await fillRowText(invoice, "buyer", row, "Buyer city", "city");
//   await fillRowText(invoice, "buyer", row, "Buyer post code", "postalCode");
// 
//   await fieldDebug().action("buyer", "dependencies", "fill buyer conditional dependencies", () =>
//     invoice.fillBuyerConditionalDependencyFields()
//   );
//   await saveInlineSection(invoice, "buyer");
//   await invoice.expectBuyerSectionSaveSucceeded();
// }
// 
// /** 4. Delivery â€” required for Export / e-commerce; Excel row values when present. */
// async function fillAndSaveDeliverySection(
//   invoice: UIInvoiceCreationManualPage,
//   row: Record<string, string>
// ): Promise<void> {
//   fieldDebug().enterSection("delivery");
//   if (!submitRowRequiresDeliverySection(row)) {
//     fieldDebug().sectionSkip("delivery not required for transaction type");
//     return;
//   }
// 
//   await invoice.openDeliveryEditor();
// 
//   if (!hasDeliveryData(row)) {
//     await invoice.fillDeliveryBaseline();
//   }
// 
//   const deliverCountry = submitRowValue(row, "Deliver to country code");
//   await selectRowValue(invoice, "delivery", "Deliver to country code", "deliverToCountryCode", deliverCountry, (v) =>
//     invoice.selectDeliverToCountry(/^United Arab Emirates$/i.test(v) ? /^United Arab Emirates$/i : v)
//   );
// 
//   const deliverSubdivision = submitRowValue(
//     row,
//     "Deliver to country subdivision",
//     "Deliver to country sub-division"
//   );
//   await selectRowValue(
//     invoice,
//     "delivery",
//     "Deliver to country subdivision",
//     "deliverToCountrySubdivision",
//     deliverSubdivision,
//     (v) => invoice.fillDeliverToCountrySubdivision(deliverCountry, v)
//   );
// 
//   await fillRowText(invoice, "delivery", row, "Deliver to party name", "deliverToPartyName");
//   await fillRowText(invoice, "delivery", row, "Deliver to location identifier", "deliverToLocationIdentifier");
// 
//   const locationScheme = submitRowValue(row, "Delivery to location Scheme");
//   await selectRowValue(
//     invoice,
//     "delivery",
//     "Delivery to location Scheme",
//     "deliverToLocationScheme",
//     locationScheme,
//     (v) => invoice.selectAutocompleteById("deliverToLocationScheme", v)
//   );
// 
//   await applySubmitRowActualDeliveryDate(invoice, row);
// 
//   await fillRowText(invoice, "delivery", row, "Deliver to address line 1", "deliverToAddressLine1");
//   await fillRowText(invoice, "delivery", row, "Deliver to address line 2", "deliverToAddressLine2");
//   await fillRowText(invoice, "delivery", row, "Deliver to address line 3", "deliverToAddressLine3");
//   await fillRowText(invoice, "delivery", row, "Deliver to city", "deliverToCity");
//   await fillRowText(invoice, "delivery", row, "Deliver to post code", "deliverToPostCode");
// 
//   await saveInlineSection(invoice, "delivery");
// }
// 
// /** 5. Item line â€” Excel row via `fillItemFieldsForType` + formula keys; Add to table. */
// async function addItemLineFromRow(
//   invoice: UIInvoiceCreationManualPage,
//   row: Record<string, string>
// ): Promise<void> {
//   fieldDebug().enterSection("item");
//   await invoice.openItemEditor();
// 
//   const itemTypeRaw = submitRowValue(row, "Item Type");
//   const rcmType = submitRowValue(row, "Type of goods or services subject to RCM");
//   const useRcmLine = rcmType !== "";
//   const classificationId = submitRowValue(row, "Item classification identifier");
//   const serviceAcc = submitRowValue(row, "Service Accounting code");
//   const hasClassificationScheme = submitRowValue(row, "Item classification - Scheme Identifier") !== "";
// 
//   if (useRcmLine) {
//     await fieldDebug().field(
//       invoice,
//       "Type of goods or services subject to RCM",
//       "typeOfGoodsOrServicesSubjectToRcm",
//       "select",
//       rcmType,
//       () => invoice.selectTypeOfGoodsSubjectToRcm(rcmType),
//       { skipIfEmpty: false }
//     );
//     if (itemTypeRaw) {
//       await fieldDebug().field(
//         invoice,
//         "Item Type",
//         "itemType",
//         "select",
//         itemTypeRaw,
//         () =>
//           invoice.fillItemFieldsForType(itemTypeRaw, {
//             classificationScheme: hasClassificationScheme ? UI_MASTER_CLASSIFICATION_SCHEME_LABEL : null,
//             classificationIdentifier: classificationId || null,
//             serviceAccCode: serviceAcc || null,
//           }),
//         { skipIfEmpty: false }
//       );
//     } else {
//       await fieldDebug().field(invoice, "Item Type", "itemType", "select", itemTypeRaw, async () => {}, {
//         skipIfEmpty: false,
//       });
//     }
//   } else {
//     const itemType = itemTypeRaw || "Goods";
//     await fieldDebug().field(
//       invoice,
//       "Item Type",
//       "itemType",
//       "select",
//       itemType,
//       () =>
//         invoice.fillItemFieldsForType(itemType, {
//           classificationScheme: hasClassificationScheme ? UI_MASTER_CLASSIFICATION_SCHEME_LABEL : null,
//           classificationIdentifier: classificationId || null,
//           serviceAccCode: serviceAcc || null,
//         }),
//       { skipIfEmpty: false }
//     );
//   }
// 
//   await fillRowText(invoice, "item", row, "Item name", "itemName");
//   await fillRowText(invoice, "item", row, "Item description", "itemDescription");
//   await fillRowText(invoice, "item", row, "Item standard identifier", "standardId");
//   await fillRowText(invoice, "item", row, "Invoice line identifier", "invoiceLineIdentifier");
// 
//   const uom = submitRowValue(row, "Invoiced quantity unit of measure code");
//   await fieldDebug().field(invoice, "Invoiced quantity unit of measure code", "unitOfMeasure", "select", uom, async () => {
//     if (!uom) return;
//     await invoice.selectAutocompleteById("unitOfMeasure", uom, {
//       filterText: uom.slice(0, 20),
//       optionTimeoutMs: 90_000,
//     });
//   });
// 
//   const taxCategory = submitRowValue(row, "Tax Category");
//   await fieldDebug().field(
//     invoice,
//     "Tax Category",
//     "taxRateDtls[0].taxCategory",
//     "select",
//     taxCategory,
//     async () => {
//       if (!taxCategory) return;
//       await betweenSections(invoice);
//       const pick = resolveUiItemTaxCategoryPick(taxCategory);
//       await invoice.selectAutocompleteById("taxRateDtls[0].taxCategory", pick.option, {
//         filterText: pick.filterText,
//         optionTimeoutMs: 30_000,
//       });
//     }
//   );
// 
//   await applyItemTaxExemptionReasonFromRow(invoice, row, taxCategory);
// 
//   const taxRate = submitRowValue(row, "Tax Rate");
//   await fieldDebug().field(invoice, "Tax Rate", "taxRateDtls[0].taxRate", "text", taxRate, async () => {
//     if (!taxRate) return;
//     await invoice.fillInputById("taxRateDtls[0].taxRate", taxRate);
//   });
// 
//   const numericMap: Array<[string, string, string]> = [
//     ["Item price base quantity", "itemPriceBaseQty", "itemPriceBaseQty"],
//     ["Item gross price", "itemGrossPrice", "itemGrossPrice"],
//     ["Item price discount", "itemPriceDiscount", "itemPriceDiscount"],
//     ["Invoiced quantity", "invoicedQty", "invoicedQty"],
//     ["Invoice line charge amount", "lineCharge", "lineCharge"],
//     ["Invoice line allowance amount", "lineAllowance", "lineAllowance"],
//   ];
// 
//   for (const [excelKey, candidateKey, formulaKey] of numericMap) {
//     const value = submitRowValue(row, excelKey);
//     if (value === "") {
//       await fieldDebug().field(invoice, excelKey, candidateKey, "numeric", value, async () => {});
//       continue;
//     }
//     const candidates = CREATE_INVOICE_FORMULA_INPUT_CANDIDATES[formulaKey];
//     if (!candidates) continue;
//     await fillRowNumeric(invoice, "item", row, excelKey, candidateKey, candidates, {
//       allowEmpty: formulaKey === "lineCharge" || formulaKey === "lineAllowance",
//     });
//     if (formulaKey === "invoicedQty" || formulaKey === "lineCharge" || formulaKey === "lineAllowance") {
//       await invoice.waitForItemCalculatedFieldsSettle(ITEM_SETTLE_MS);
//     }
//   }
// 
//   await fieldDebug().action("item", "addLine", "click Add item line", () =>
//     invoice.clickItemModalAdd()
//   );
//   await invoice.expectItemTableRowVisible();
//   await fieldDebug().action("item", "saveSection", "click Save item section", () =>
//     invoice.clickItemSectionSave()
//   );
//   await invoice.expectItemSectionSaveSucceeded();
//   await invoice.ensureItemAddFormClosed();
//   await invoice.waitForItemCalculatedFieldsSettle(ITEM_SETTLE_MS);
// }
// 
// /** 6. Invoice totals (section 4) â€” document-level charges from Excel row. */
// async function fillInvoiceDocumentLevelSection(
//   invoice: UIInvoiceCreationManualPage,
//   row: Record<string, string>
// ): Promise<void> {
//   fieldDebug().enterSection("invoice-totals");
//   await invoice.openInvoiceEditor();
//   await invoice.waitForItemCalculatedFieldsSettle(ITEM_SETTLE_MS);
// 
//   const docFields: Array<[string, string, string]> = [
//     ["Charges on document level", "docCharges", "docCharges"],
//     ["Allowances on document level", "docAllowances", "docAllowances"],
//     ["Paid amount", "paidAmount", "paidAmount"],
//     ["Rounding amount", "roundingAmount", "roundingAmount"],
//   ];
// 
//   let wroteDocLevel = false;
//   for (const [excelKey, candidateKey, formulaKey] of docFields) {
//     const value = submitRowValue(row, excelKey);
//     if (value === "") {
//       await fieldDebug().field(invoice, excelKey, candidateKey, "numeric", value, async () => {});
//       continue;
//     }
//     const candidates = CREATE_INVOICE_FORMULA_INPUT_CANDIDATES[formulaKey];
//     if (!candidates) continue;
//     await fillRowNumeric(invoice, "invoice-totals", row, excelKey, candidateKey, candidates);
//     wroteDocLevel = true;
//   }
// 
//   if (!wroteDocLevel) {
//     fieldDebug().sectionSkip("no document-level charges/allowances in Excel row");
//   }
// 
//   await fieldDebug().action("invoice-totals", "save", "click Invoice Details Save", () =>
//     invoice.clickInvoiceSectionSave()
//   );
//   await invoice.blurActiveElement();
// }
// 
// /** 7. Payment â€” Excel row + conditional-style payment due date; Save section. */
// async function fillAndSavePaymentSection(
//   invoice: UIInvoiceCreationManualPage,
//   row: Record<string, string>
// ): Promise<void> {
//   fieldDebug().enterSection("payment");
//   await invoice.openPaymentEditor();
// 
//   await selectRowValue(
//     invoice,
//     "payment",
//     "Payment means type code",
//     "paymentMeansTypeCode",
//     submitRowValue(row, "Payment means type code"),
//     (v) => invoice.selectPaymentMeansTypeCode(v)
//   );
// 
//   await fillRowText(invoice, "payment", row, "Payment account identifier", "paymentAccountIdentifier");
//   await fillRowText(invoice, "payment", row, "Payment account name", "paymentAccountName");
//   await fillRowText(
//     invoice,
//     "payment",
//     row,
//     "Payment service provider identifier",
//     "paymentServiceProviderIdentifier"
//   );
//   await fillRowText(
//     invoice,
//     "payment",
//     row,
//     "Payment card primary account number",
//     "paymentCardPrimaryAccountNumber"
//   );
// 
//   const schemeId = submitRowValue(row, "Scheme Identifier");
//   if (schemeId && (await invoice.hasCreateInvoiceInput("paymentSchemeIdentifier"))) {
//     await fieldDebug().field(
//       invoice,
//       "Scheme Identifier",
//       "paymentSchemeIdentifier",
//       "select",
//       schemeId,
//       () => invoice.selectAutocompleteById("paymentSchemeIdentifier", schemeId)
//     );
//   } else if (schemeId) {
//     await fieldDebug().field(invoice, "Scheme Identifier", "paymentSchemeIdentifier", "select", schemeId, async () => {});
//   }
// 
//   await applySubmitRowPaymentDueDate(invoice, row);
//   await saveInlineSection(invoice, "payment");
// }
// 
// /** 8. Custom fields from Excel row. */
// async function fillAndSaveCustomSection(
//   invoice: UIInvoiceCreationManualPage,
//   row: Record<string, string>
// ): Promise<void> {
//   fieldDebug().enterSection("custom");
//   const hasCustom = [1, 2, 3, 4, 5].some((n) => submitRowValue(row, `Custom ${n}`) !== "");
//   if (!hasCustom) {
//     fieldDebug().sectionSkip("no custom fields in Excel row");
//     return;
//   }
// 
//   await invoice.openCustomEditor();
//   for (let n = 1; n <= 5; n++) {
//     await fillRowText(invoice, "custom", row, `Custom ${n}`, `custom${n}`);
//   }
//   await saveInlineSection(invoice, "custom");
// }
// 
// /**
//  * Fill every Create Invoice section in UI order from Excel/`invoiceData` row keys.
//  * Document â†’ Seller â†’ Buyer â†’ Delivery â†’ Item(s) â†’ Invoice totals â†’ Payment â†’ Custom â†’ final Save.
//  */
// async function fillAllSectionsFromSubmitRow(
//   invoice: UIInvoiceCreationManualPage,
//   row: Record<string, string>,
//   invoiceNumber: string,
//   itemRows: Array<Record<string, string>>
// ): Promise<void> {
//   await fillAndSaveDocumentSection(invoice, row, invoiceNumber);
//   await fillAndSaveSellerSection(invoice, row);
//   await fillAndSaveBuyerSection(invoice, row);
//   await fillAndSaveDeliverySection(invoice, row);
// 
//   for (const lineRow of itemRows) {
//     await addItemLineFromRow(invoice, lineRow);
//   }
// 
//   await fillInvoiceDocumentLevelSection(invoice, row);
//   await fillAndSavePaymentSection(invoice, row);
//   await fillAndSaveCustomSection(invoice, row);
// 
//   await invoice.openDocumentEditor();
//   await saveDocumentDraft(invoice);
// }
// 
// /** Editor **Submit** â†’ dashboard row visible â†’ same Options â†’ Submit + delivery poll as Excel upload flow. */
// async function submitCreateInvoiceAndWaitForDelivery(
//   page: Page,
//   invoice: UIInvoiceCreationManualPage,
//   invoiceNumber: string,
//   options?: { multiItem?: boolean }
// ): Promise<void> {
//   const dashboard = new DashboardPage(page);
//   fieldDebug().enterSection("submit");
//   await fieldDebug().action("Create Invoice Submit", "pageSubmit", "click page Submit", () =>
//     invoice.clickCreateInvoicePageSubmit()
//   );
//   // Create POST may leave `/einvoice/create`; after shell recovery the new row is often off the first page.
//   await dashboard.refreshDashboardForInvoiceTable(invoiceNumber);
//   if (options?.multiItem) {
//     await dashboard.submitMultiItemInvoiceFromTable(invoiceNumber);
//   } else {
//     await dashboard.submitInvoiceFromTable(invoiceNumber);
//   }
//   await dashboard.waitForInvoiceDeliveryStatus(invoiceNumber, {
//     timeoutMs: UI_SUBMIT_INVOICE_DELIVERY_TIMEOUT_MS,
//   });
// }
// 
// export type UiSubmitStepRunner = (title: string, body: () => Promise<void>) => Promise<void>;
// 
// const passthroughStep: UiSubmitStepRunner = async (_title, body) => body();
// 
// /** Same as {@link runUiSubmitInvoiceCase} with named steps for live / headed debugging. */
// export async function runUiSubmitInvoiceCaseWithSteps(
//   page: Page,
//   data: Record<string, string>,
//   runStep: UiSubmitStepRunner = passthroughStep,
//   options?: {
//     submitFromDashboard?: boolean;
//     fieldDebug?: boolean;
//     /** Absolute or workspace-relative paths for section **7. Attachment Details**. */
//     attachmentPaths?: string[];
//   }
// ): Promise<{ invoiceNumber: string }> {
//   const row = prepareUiSubmitInvoiceRow(data);
//   const invoiceNumber = `INV-${Date.now()}`;
//   const invoice = new UIInvoiceCreationManualPage(page);
// 
//   flowLog("UiSubmit", `Starting Create Invoice UI submit for ${invoiceNumber}.`);
//   activeFieldDebug = new UiSubmitFieldDebug(options?.fieldDebug ?? isUiSubmitFieldDebugEnabled());
//   try {
//     await runStep("open create invoice", () => invoice.open());
//     await runStep("document", () => fillAndSaveDocumentSection(invoice, row, invoiceNumber));
//     await runStep("seller", () => fillAndSaveSellerSection(invoice, row));
//     await runStep("buyer", () => fillAndSaveBuyerSection(invoice, row));
//     await runStep("delivery", () => fillAndSaveDeliverySection(invoice, row));
//     await runStep("item line", () => addItemLineFromRow(invoice, row));
//     await runStep("invoice totals", () => fillInvoiceDocumentLevelSection(invoice, row));
//     await runStep("payment", () => fillAndSavePaymentSection(invoice, row));
//     await runStep("custom", () => fillAndSaveCustomSection(invoice, row));
// 
//     const attachments = options?.attachmentPaths?.filter(Boolean) ?? [];
//     if (attachments.length) {
//       await runStep("attachment", () => invoice.addAttachmentFiles(...attachments));
//     }
// 
//     await runStep("final document save", async () => {
//       fieldDebug().enterSection("document-final");
//       await invoice.openDocumentEditor();
//       await saveDocumentDraft(invoice);
//     });
// 
//     if (options?.submitFromDashboard !== false) {
//       await runStep("create invoice Submit + dashboard delivery", () =>
//         submitCreateInvoiceAndWaitForDelivery(page, invoice, invoiceNumber)
//       );
//     }
// 
//     flowLog("UiSubmit", `Create Invoice UI submit finished for ${invoiceNumber}.`);
//     return { invoiceNumber };
//   } finally {
//     activeFieldDebug.printSummary();
//     activeFieldDebug = UiSubmitFieldDebug.noop();
//   }
// }
// 
// export async function runUiSubmitInvoiceCase(
//   page: Page,
//   data: Record<string, string>
// ): Promise<{ invoiceNumber: string }> {
//   return runUiSubmitInvoiceCaseWithSteps(page, data);
// }
// 
// /** Create Invoice UI: fill all sections, add Attachment Details file(s), submit, wait delivered. */
// export async function runUiSubmitInvoiceWithAttachmentCase(
//   page: Page,
//   data: Record<string, string>,
//   attachmentPaths: string | string[]
// ): Promise<{ invoiceNumber: string }> {
//   const paths = (Array.isArray(attachmentPaths) ? attachmentPaths : [attachmentPaths]).filter(
//     Boolean
//   );
//   if (!paths.length) {
//     throw new Error("runUiSubmitInvoiceWithAttachmentCase: attachmentPaths cannot be empty");
//   }
//   return runUiSubmitInvoiceCaseWithSteps(page, data, passthroughStep, {
//     attachmentPaths: paths,
//   });
// }
// 
// export async function runUiSubmitInvoiceMultiItemCase(
//   page: Page,
//   rows: Array<Record<string, string>>
// ): Promise<{ invoiceNumber: string }> {
//   if (!rows.length) {
//     throw new Error("runUiSubmitInvoiceMultiItemCase: rows cannot be empty");
//   }
// 
//   const prepared = rows.map((r) => prepareUiSubmitInvoiceRow(r));
//   const headerRow = prepared[0]!;
//   const invoiceNumber = `INV-${Date.now()}`;
// 
//   const invoice = new UIInvoiceCreationManualPage(page);
//   await invoice.open();
//   await fillAllSectionsFromSubmitRow(invoice, headerRow, invoiceNumber, prepared);
//   await submitCreateInvoiceAndWaitForDelivery(page, invoice, invoiceNumber, {
//     multiItem: prepared.length > 1,
//   });
// 
//   return { invoiceNumber };
// }
