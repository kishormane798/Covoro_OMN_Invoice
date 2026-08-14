// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under a ui/ subfolder; executable code is commented out.
//
// /**
//  * Shared entry for Edit Invoice UI tests: upload a valid baseline workbook (unique invoice #),
//  * then open the editor via dashboard **Options â†’ Edit** (`#sub-item-edit`).
//  */
// import type { Page } from "@playwright/test";
// import type { Locator } from "@playwright/test";
// import {
//   COPY_REUSE_INVOICE_STATUSES,
//   DashboardPage,
//   EDIT_REUSE_INVOICE_STATUSES,
// } from "../pageObjects/OMN_DashboardPage";
// import { UIInvoiceCreationManualPage } from "../pageObjects/OMN_UIInvoiceCreationManualPage";
// import { uploadAndVerify } from "./uploadHelper";
// import { flowLog } from "./diagnosticLog";
// import { applyParallelWorkerIdentityToSubmitRow } from "./parallelWorkerSubmitIdentity";
// import { generateInvoiceFromSubmitData } from "../utils/invoiceExcel";
// import { invoiceData } from "../../testData/ui/SubmitInvoice";
// 
// export type UiConditionalEntry = "create" | "edit" | "copy";
// 
// /** Baseline invoice for Edit/Copy UI entry (defaults to Commercial Invoice + Standard Tax Invoice). */
// export type UiBaselineOptions = {
//   invoiceTypeCode?: string;
//   /**
//    * Always upload a fresh baseline workbook instead of reusing an on-dashboard row.
//    * Use for payment-field tests â€” Credit Note / Deemed Supply rows omit payment means fields.
//    */
//   forceUpload?: boolean;
// };
// 
// /** Copy baseline falls back to upload quickly when no Delivered/Completed row is on the table. */
// const COPY_REUSE_POLL_TIMEOUT_MS = 20_000;
// 
// /** Edit and Copy open with a pre-filled item line; item tests edit row 0 instead of Add New. */
// export function isUiPrefilledLineItemEntry(entry: UiConditionalEntry): boolean {
//   return entry === "edit" || entry === "copy";
// }
// 
// /** Copy/Edit: assert field state only after section Save/Update (not while still editing). */
// export function assertUiFieldStateAfterSectionSave(entry: UiConditionalEntry): boolean {
//   return entry === "edit" || entry === "copy";
// }
// 
// /** Copy/Edit/Create field-validation flows stop after section Save â€” no footer Submit. */
// export async function submitCopyInvoiceAfterSuccessIfNeeded(
//   _invoice: UIInvoiceCreationManualPage,
//   _entry: UiConditionalEntry,
//   _shouldError: boolean,
//   _invoiceNumber?: string
// ): Promise<void> {
//   /* no-op â€” assertions run on section Save, same as create/edit */
// }
// 
// function normalizeInvoiceTypeCode(label: string | undefined): string {
//   return (label ?? "").replace(/\s+/g, " ").trim().toLowerCase();
// }
// 
// function pickBaselineSubmitRowByInvoiceType(
//   invoiceTypeCode?: string
// ): Record<string, string> {
//   const target = normalizeInvoiceTypeCode(invoiceTypeCode);
//   if (!target) {
//     return invoiceData[0] as Record<string, string>;
//   }
// 
//   const matches = invoiceData.find((row) => {
//     const current = normalizeInvoiceTypeCode(
//       (row as Record<string, string>)["Invoice Type Code"]
//     );
//     return current === target;
//   });
// 
//   return (matches ?? invoiceData[0]) as Record<string, string>;
// }
// 
// function buildEditBaselineSubmitRow(invoiceTypeCode?: string): Record<string, string> {
//   return applyParallelWorkerIdentityToSubmitRow({
//     ...pickBaselineSubmitRowByInvoiceType(invoiceTypeCode),
//   });
// }
// 
// async function uploadEditBaselineInvoice(
//   page: Page,
//   options?: Pick<UiBaselineOptions, "invoiceTypeCode">
// ): Promise<string> {
//   const row = buildEditBaselineSubmitRow(options?.invoiceTypeCode);
//   const { filePath, invoiceNumber } = await generateInvoiceFromSubmitData(row);
//   await uploadAndVerify(page, filePath);
//   return invoiceNumber;
// }
// 
// async function uploadCopyBaselineInvoice(
//   page: Page,
//   options?: Pick<UiBaselineOptions, "invoiceTypeCode">
// ): Promise<string> {
//   const row = buildEditBaselineSubmitRow(options?.invoiceTypeCode);
//   const { filePath, invoiceNumber } = await generateInvoiceFromSubmitData(row);
//   await uploadAndVerify(page, filePath);
//   return invoiceNumber;
// }
// 
// type BaselineResolution = {
//   invoiceNumber: string;
//   reusableRow: Locator | null;
// };
// 
// async function resolveEditBaseline(
//   page: Page,
//   options?: UiBaselineOptions
// ): Promise<BaselineResolution> {
//   const dashboard = new DashboardPage(page);
//   if (!options?.forceUpload) {
//     const reusable = await dashboard.findReusableInvoiceRow(EDIT_REUSE_INVOICE_STATUSES);
//     if (reusable) {
//       flowLog(
//         "UiEditBaseline",
//         `Reusing on-dashboard invoice ${reusable.invoiceNumber} for Edit UI.`
//       );
//       return { invoiceNumber: reusable.invoiceNumber, reusableRow: reusable.row };
//     }
//     flowLog(
//       "UiEditBaseline",
//       "No on-dashboard invoice with status Error or Ready to Submit â€” uploading workbook."
//     );
//   } else {
//     flowLog(
//       "UiEditBaseline",
//       "forceUpload â€” uploading Commercial Invoice baseline (skip dashboard reuse)."
//     );
//   }
//   const invoiceNumber = await uploadEditBaselineInvoice(page, options);
//   return { invoiceNumber, reusableRow: null };
// }
// 
// async function resolveCopyBaseline(
//   page: Page,
//   options?: UiBaselineOptions
// ): Promise<BaselineResolution> {
//   const dashboard = new DashboardPage(page);
//   if (!options?.forceUpload) {
//     const reusable = await dashboard.findReusableInvoiceRow(COPY_REUSE_INVOICE_STATUSES, {
//       pollTimeoutMs: COPY_REUSE_POLL_TIMEOUT_MS,
//     });
//     if (reusable) {
//       flowLog(
//         "UiCopyBaseline",
//         `Reusing on-dashboard invoice ${reusable.invoiceNumber} for Copy UI.`
//       );
//       return { invoiceNumber: reusable.invoiceNumber, reusableRow: reusable.row };
//     }
//     flowLog(
//       "UiCopyBaseline",
//       "No on-dashboard invoice with status Delivered or Ready to Submit â€” uploading workbook."
//     );
//   } else {
//     flowLog(
//       "UiCopyBaseline",
//       "forceUpload â€” uploading Commercial Invoice baseline (skip dashboard reuse)."
//     );
//   }
//   const invoiceNumber = await uploadCopyBaselineInvoice(page, options);
//   return { invoiceNumber, reusableRow: null };
// }
// 
// /** Upload or reuse baseline invoice, then open **Options â†’ Edit** for that invoice number. */
// export async function uploadBaselineInvoiceAndOpenEdit(
//   page: Page,
//   options?: UiBaselineOptions
// ): Promise<{
//   invoice: UIInvoiceCreationManualPage;
//   invoiceNumber: string;
// }> {
//   const { invoiceNumber, reusableRow } = await resolveEditBaseline(page, options);
//   const invoice = new UIInvoiceCreationManualPage(page);
//   if (reusableRow) {
//     await invoice.openFromReusableEditRow(reusableRow);
//   } else {
//     await invoice.openFromUploadedInvoice(invoiceNumber);
//   }
//   return { invoice, invoiceNumber };
// }
// 
// /** Reuse or upload baseline invoice, then open **Options â†’ Create Copy** with the given decision. */
// export async function openCopyBaselineFromStatus(
//   page: Page,
//   decision: "Yes" | "No",
//   options?: UiBaselineOptions
// ): Promise<{
//   invoiceNumber: string;
//   invoice?: UIInvoiceCreationManualPage;
// }> {
//   const { invoiceNumber, reusableRow } = await resolveCopyBaseline(page, options);
//   const invoice = new UIInvoiceCreationManualPage(page);
//   if (reusableRow) {
//     await invoice.openFromReusableCopyRow(reusableRow, decision);
//     return decision === "Yes" ? { invoiceNumber, invoice } : { invoiceNumber };
//   }
// 
//   if (decision === "Yes") {
//     await invoice.openFromCopiedInvoice(invoiceNumber);
//     return { invoiceNumber, invoice };
//   }
//   const dashboard = new DashboardPage(page);
//   await dashboard.refreshDashboardForInvoiceTable(invoiceNumber);
//   await dashboard.openInvoiceCopy(invoiceNumber, decision);
//   return { invoiceNumber };
// }
// 
// /** Reuse or upload baseline invoice, then open **Options â†’ Create Copy â†’ Yes**. */
// export async function openCopyBaselineInvoiceAndEditor(
//   page: Page,
//   options?: UiBaselineOptions
// ): Promise<{
//   invoice: UIInvoiceCreationManualPage;
//   invoiceNumber: string;
// }> {
//   const { invoiceNumber, invoice } = await openCopyBaselineFromStatus(page, "Yes", options);
//   if (!invoice) {
//     throw new Error("Copy baseline with decision Yes did not open the invoice editor.");
//   }
//   return { invoice, invoiceNumber };
// }
// 
// export async function openInvoiceForConditionalFlow(
//   page: Page,
//   entry: UiConditionalEntry,
//   options?: UiBaselineOptions
// ): Promise<UIInvoiceCreationManualPage> {
//   if (entry === "edit") {
//     return (await uploadBaselineInvoiceAndOpenEdit(page, options)).invoice;
//   }
//   if (entry === "copy") {
//     return (await openCopyBaselineInvoiceAndEditor(page, options)).invoice;
//   }
//   const invoice = new UIInvoiceCreationManualPage(page);
//   await invoice.open();
//   return invoice;
// }
