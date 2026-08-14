// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under a ui/ subfolder; executable code is commented out.
//
// /**
//  * Edit Invoice UI â€” Attachment Details scenarios.
//  * Entry: Submit-invoice Excel upload â†’ dashboard status â†’ Options â†’ Edit â†’ section 7.
//  */
// import type { Page } from "@playwright/test";
// import { expect } from "@playwright/test";
// import { DashboardPage } from "../pageObjects/DashboardPage";
// import {
//   buildAtLimitSingleAttachmentPath,
//   buildCombinedOversizeAttachmentPaths,
//   buildNearLimitMultiAttachmentPaths,
//   buildNearLimitSingleAttachmentPath,
//   buildOversizeAttachmentPath,
// } from "../utils/uiAttachmentFiles";
// import type {
//   UiAttachmentAcceptScenario,
//   UiAttachmentScenario,
// } from "../../testData/ui/uiInvoiceAttachmentScenarios";
// import {
//   UI_ATTACHMENT_MULTI_UNDER_LIMIT,
//   UI_ATTACHMENT_SIZE_ERROR,
// } from "../../testData/ui/uiInvoiceAttachmentScenarios";
// import { uploadBaselineInvoiceAndOpenEdit } from "./uiInvoiceEditEntryHelper";
// import { flowLog } from "./diagnosticLog";
// 
// /** Per-test budget: upload baseline + edit + attachment assert. */
// export const UI_ATTACHMENT_TEST_TIMEOUT_MS = 3 * 60 * 1000;
// 
// /** Persist Update + View (Ready to Submit poll + View). */
// export const UI_ATTACHMENT_PERSIST_TIMEOUT_MS = 4 * 60 * 1000;
// 
// /** Large near-limit uploads (setInputFiles + UI). */
// export const UI_ATTACHMENT_SIZE_TIMEOUT_MS = 4 * 60 * 1000;
// 
// /** Excel upload + attach + dashboard submit + delivery poll. */
// export const UI_ATTACHMENT_SUBMIT_TIMEOUT_MS = 7 * 60 * 1000;
// 
// /**
//  * Delivery poll for attachment submit (incl. Submit as PDF / large files).
//  * Override with `SUBMIT_INVOICE_DELIVERY_TIMEOUT_MS` (same knob as Excel submit).
//  */
// export const UI_ATTACHMENT_DELIVERY_TIMEOUT_MS = (() => {
//   const raw = process.env.SUBMIT_INVOICE_DELIVERY_TIMEOUT_MS?.trim();
//   if (raw) {
//     const n = Number.parseInt(raw, 10);
//     if (Number.isFinite(n) && n >= 60_000) return n;
//   }
//   return 8 * 60 * 1000;
// })();
// 
// /** Near-limit / exactly-10 MB attach + Submit as PDF needs extra wall clock. */
// export const UI_ATTACHMENT_LARGE_SUBMIT_TIMEOUT_MS =
//   UI_ATTACHMENT_DELIVERY_TIMEOUT_MS + 6 * 60 * 1000;
// 
// /**
//  * Playwright titles for Edit Invoice attachment cases â€” full readable sentences.
//  */
// 
// function formatLabel(scenario: UiAttachmentScenario): string {
//   if (scenario.expect === "accept" && scenario.expectedNames.length > 1) {
//     return "multiple files (PDF + PNG + PDF)";
//   }
//   if (scenario.id.startsWith("remove-yes-") || scenario.id.startsWith("remove-no-")) {
//     const ext = scenario.id.replace(/^remove-(yes|no)-/, "").toUpperCase();
//     return `a single ${ext} file`;
//   }
//   if (scenario.expect === "accept") {
//     return `a single ${scenario.id.toUpperCase()} file`;
//   }
//   if (scenario.id === "invalid-format" || scenario.id.startsWith("invalid-") || /invalid/i.test(scenario.title)) {
//     return "an invalid format file";
//   }
//   return scenario.title.replace(/\s*â†’\s*(listed|error)\s*$/i, "").trim();
// }
// 
// /** @deprecated Prefer specific helpers; kept for any ad-hoc detail titles. */
// export function uiAttachmentTestTitle(detail: string, outcome: string): string {
//   return `Verify Edit Invoice attachment with ${detail}: ${outcome}.`;
// }
// 
// export function uiAttachmentSectionVisibleTitle(): string {
//   return "Verify Edit Invoice attachment section is visible after Excel upload and Edit with the Add Files zone shown.";
// }
// 
// export function uiAttachmentListTitle(scenario: UiAttachmentScenario): string {
//   if (scenario.expect === "accept") {
//     const listed =
//       scenario.expectedNames.length > 1
//         ? "the attachments should be listed"
//         : "the attachment should be listed";
//     return `Verify Edit Invoice attachment with ${formatLabel(scenario)} is accepted and ${listed}.`;
//   }
//   return `Verify Edit Invoice attachment with ${formatLabel(scenario)} is rejected and an error should be shown.`;
// }
// 
// export function uiAttachmentRemoveTitle(
//   scenario: UiAttachmentAcceptScenario,
//   confirm: "Yes" | "No"
// ): string {
//   if (confirm === "Yes") {
//     return `Verify Edit Invoice attachment with ${formatLabel(scenario)} can be removed when confirm is Yes and the attachment should be removed.`;
//   }
//   return `Verify Edit Invoice attachment with ${formatLabel(scenario)} remains listed when remove is cancelled with No.`;
// }
// 
// export function uiAttachmentPersistTitle(
//   scenarioOrDetail: UiAttachmentAcceptScenario | string
// ): string {
//   const detail =
//     typeof scenarioOrDetail === "string"
//       ? scenarioOrDetail
//       : formatLabel(scenarioOrDetail);
//   return `Verify Edit Invoice attachment with ${detail} using Update reaches Ready to Submit and View shows the attachment.`;
// }
// 
// export function uiAttachmentSubmitTitle(
//   scenarioOrDetail: UiAttachmentAcceptScenario | string
// ): string {
//   const detail =
//     typeof scenarioOrDetail === "string"
//       ? scenarioOrDetail
//       : formatLabel(scenarioOrDetail);
//   return `Verify Edit Invoice attachment with ${detail} using Submit functionality and the invoice should be delivered.`;
// }
// 
// /**
//  * Example: "Verify Edit Invoice attachment with a single PNG file using Submit as PDF functionality and the invoice should be delivered."
//  */
// export function uiAttachmentSubmitAsPdfTitle(
//   scenarioOrDetail: UiAttachmentAcceptScenario | string
// ): string {
//   const detail =
//     typeof scenarioOrDetail === "string"
//       ? scenarioOrDetail
//       : formatLabel(scenarioOrDetail);
//   return `Verify Edit Invoice attachment with ${detail} using Submit as PDF functionality and the invoice should be delivered.`;
// }
// 
// export function uiAttachmentBulkSubmitTitle(
//   invoiceCount: number,
//   bulkAction: "Submit" | "Submit as PDF" = "Submit"
// ): string {
//   return `Verify Excel upload with ${invoiceCount} single-item invoices using Bulk Action ${bulkAction} functionality and the invoices should be delivered.`;
// }
// 
// /**
//  * Upload Submit-invoice baseline â†’ wait/list status â†’ Options â†’ Edit â†’
//  * Attachment Details scenario (accept list + zone hidden, or rejection message).
//  */
// export async function runUiEditAttachmentScenario(
//   page: Page,
//   scenario: UiAttachmentScenario
// ): Promise<{ invoiceNumber: string }> {
//   flowLog("UiAttachment", `Scenario ${scenario.id}: ${scenario.title}`);
//   const { invoice, invoiceNumber } = await uploadBaselineInvoiceAndOpenEdit(page, {
//     forceUpload: true,
//   });
//   await invoice.expectCreateInvoiceEditorLoaded();
//   await invoice.scrollToAttachmentSection();
// 
//   if (scenario.expect === "accept") {
//     await invoice.selectAttachmentFiles(...scenario.files);
//     await invoice.expectAttachedFilesListed(scenario.expectedNames);
//     await invoice.expectAttachmentUploadZoneHidden();
//   } else {
//     await invoice.selectAttachmentFiles(...scenario.files);
//     await invoice.expectAttachmentRejectionMessage(scenario.errorPattern);
//     await invoice.expectAttachmentUploadZoneVisible();
//   }
// 
//   return { invoiceNumber };
// }
// 
// /**
//  * Attach a single accepted file, open remove confirm, choose Yes or No.
//  * Yes â†’ file gone + Add Files zone returns; No â†’ file still listed.
//  */
// export async function runUiEditAttachmentRemoveCase(
//   page: Page,
//   scenario: UiAttachmentAcceptScenario,
//   confirm: "Yes" | "No"
// ): Promise<{ invoiceNumber: string }> {
//   flowLog("UiAttachment", `Remove ${confirm}: ${scenario.id}`);
//   if (scenario.expectedNames.length !== 1) {
//     throw new Error(
//       `runUiEditAttachmentRemoveCase expects exactly one file name, got ${scenario.expectedNames.length}`
//     );
//   }
//   const fileName = scenario.expectedNames[0]!;
//   const { invoice, invoiceNumber } = await uploadBaselineInvoiceAndOpenEdit(page, {
//     forceUpload: true,
//   });
//   await invoice.expectCreateInvoiceEditorLoaded();
//   await invoice.selectAttachmentFiles(...scenario.files);
//   await invoice.expectAttachedFilesListed(scenario.expectedNames);
//   await invoice.expectAttachmentUploadZoneHidden();
//   await invoice.removeAttachedFile(fileName, { confirm });
// 
//   if (confirm === "Yes") {
//     await expect(invoice.attachmentFileRows()).toHaveCount(0);
//     await invoice.expectAttachmentUploadZoneVisible();
//   } else {
//     await invoice.expectAttachedFilesListed(scenario.expectedNames);
//     await invoice.expectAttachmentUploadZoneHidden();
//   }
// 
//   return { invoiceNumber };
// }
// 
// /** Reject: one file &gt; 10 MB. */
// export async function runUiEditAttachmentOversizeCase(page: Page): Promise<void> {
//   const filePath = buildOversizeAttachmentPath();
//   await runUiEditAttachmentScenario(page, {
//     id: "single-over-10mb",
//     title: "single file over 10 MB â†’ error",
//     expect: "reject",
//     files: [filePath],
//     errorPattern: UI_ATTACHMENT_SIZE_ERROR,
//   });
// }
// 
// /** Reject: multiple files whose combined size &gt; 10 MB. */
// export async function runUiEditAttachmentCombinedOversizeCase(page: Page): Promise<void> {
//   const [a, b] = buildCombinedOversizeAttachmentPaths();
//   await runUiEditAttachmentScenario(page, {
//     id: "combined-over-10mb",
//     title: "combined size over 10 MB â†’ error",
//     expect: "reject",
//     files: [a, b],
//     errorPattern: UI_ATTACHMENT_SIZE_ERROR,
//   });
// }
// 
// /** Accept: single file just under 10 MB (~9.5 MB). */
// export async function runUiEditAttachmentNearLimitSingleCase(
//   page: Page
// ): Promise<UiAttachmentAcceptScenario> {
//   const { path: filePath, name } = buildNearLimitSingleAttachmentPath();
//   const scenario: UiAttachmentAcceptScenario = {
//     id: "single-near-10mb",
//     title: "single file ~9.5 MB (under 10 MB) â†’ listed",
//     expect: "accept",
//     files: [filePath],
//     expectedNames: [name],
//   };
//   await runUiEditAttachmentScenario(page, scenario);
//   return scenario;
// }
// 
// /** Accept: single file exactly 10 MB. */
// export async function runUiEditAttachmentAtLimitSingleCase(
//   page: Page
// ): Promise<UiAttachmentAcceptScenario> {
//   const { path: filePath, name } = buildAtLimitSingleAttachmentPath();
//   const scenario: UiAttachmentAcceptScenario = {
//     id: "single-at-10mb",
//     title: "single file exactly 10 MB â†’ listed",
//     expect: "accept",
//     files: [filePath],
//     expectedNames: [name],
//   };
//   await runUiEditAttachmentScenario(page, scenario);
//   return scenario;
// }
// 
// /** Accept: multiple files combined under 10 MB (4 + 5 = 9 MB). */
// export async function runUiEditAttachmentNearLimitMultiCase(
//   page: Page
// ): Promise<UiAttachmentAcceptScenario> {
//   const parts = buildNearLimitMultiAttachmentPaths();
//   const scenario: UiAttachmentAcceptScenario = {
//     id: "multi-near-10mb",
//     title: "multiple files combined ~9 MB (under 10 MB) â†’ listed",
//     expect: "accept",
//     files: parts.map((p) => p.path),
//     expectedNames: parts.map((p) => p.name),
//   };
//   await runUiEditAttachmentScenario(page, scenario);
//   return scenario;
// }
// 
// /** Accept large single (~9.5 MB) â†’ Update â†’ Ready to Submit / View. */
// export async function runUiEditAttachmentNearLimitSinglePersistCase(
//   page: Page
// ): Promise<void> {
//   const { path: filePath, name } = buildNearLimitSingleAttachmentPath();
//   await runUiEditAttachmentPersistAndViewCase(page, {
//     id: "single-near-10mb-persist",
//     title: "single ~9.5 MB â†’ Update â†’ View shows file",
//     expect: "accept",
//     files: [filePath],
//     expectedNames: [name],
//   });
// }
// 
// /** Accept large multi (~9 MB) â†’ Update â†’ Ready to Submit / View. */
// export async function runUiEditAttachmentNearLimitMultiPersistCase(
//   page: Page
// ): Promise<void> {
//   const parts = buildNearLimitMultiAttachmentPaths();
//   await runUiEditAttachmentPersistAndViewCase(page, {
//     id: "multi-near-10mb-persist",
//     title: "multi ~9 MB â†’ Update â†’ View shows files",
//     expect: "accept",
//     files: parts.map((p) => p.path),
//     expectedNames: parts.map((p) => p.name),
//   });
// }
// 
// /** Sanity: attachment section + empty upload zone visible after Edit open. */
// export async function runUiEditAttachmentSectionVisibleCase(page: Page): Promise<void> {
//   const { invoice } = await uploadBaselineInvoiceAndOpenEdit(page, { forceUpload: true });
//   await invoice.expectCreateInvoiceEditorLoaded();
//   await invoice.scrollToAttachmentSection();
//   await invoice.expectAttachmentUploadZoneVisible();
//   await expect(invoice.attachmentFileInput()).toBeAttached();
// }
// 
// /**
//  * Attach file(s) â†’ footer **Update** â†’ branch:
//  * - **Dashboard**: status Ready to Submit â†’ Options â†’ View â†’ attachment names listed (no remove).
//  * - **Still on edit**: attachment still listed on the edit shell.
//  */
// export async function runUiEditAttachmentPersistAndViewCase(
//   page: Page,
//   scenario: UiAttachmentAcceptScenario
// ): Promise<{ invoiceNumber: string; landedOn: "dashboard" | "edit" }> {
//   flowLog("UiAttachment", `Persist+View: ${scenario.id}`);
//   const { invoice, invoiceNumber } = await uploadBaselineInvoiceAndOpenEdit(page, {
//     forceUpload: true,
//   });
//   await invoice.expectCreateInvoiceEditorLoaded();
//   await invoice.selectAttachmentFiles(...scenario.files);
//   await invoice.expectAttachedFilesListed(scenario.expectedNames);
//   await invoice.expectAttachmentUploadZoneHidden();
// 
//   const updateVisible = await invoice.createInvoicePageUpdateButton().isVisible().catch(() => false);
//   if (updateVisible) {
//     await invoice.clickCreateInvoicePageUpdate();
//   } else {
//     await invoice.clickCreateInvoicePageSubmit();
//   }
// 
//   const landedOn = await invoice.waitAfterAttachmentPersist(90_000);
//   flowLog("UiAttachment", `After persist landed on: ${landedOn} (${invoiceNumber})`);
// 
//   if (landedOn === "dashboard") {
//     const dashboard = new DashboardPage(page);
//     await dashboard.waitForInvoiceReadyToSubmitStatus(invoiceNumber, { timeoutMs: 120_000 });
//     await dashboard.openInvoiceView(invoiceNumber);
//     await invoice.expectAttachmentsDisplayedInView(scenario.expectedNames);
//   } else {
//     await invoice.expectCreateInvoiceEditorLoaded();
//     await invoice.expectAttachedFilesListed(scenario.expectedNames);
//   }
// 
//   return { invoiceNumber, landedOn };
// }
// 
// /**
//  * Excel upload â†’ Options â†’ Edit â†’ attach file(s) â†’ Update â†’ dashboard
//  * Options â†’ Submit | Submit as PDF â†’ wait for Delivered/Accepted status.
//  */
// export async function runUiEditAttachmentSubmitCase(
//   page: Page,
//   scenario: UiAttachmentAcceptScenario,
//   options?: { submitAction?: "Submit" | "Submit as PDF" }
// ): Promise<{ invoiceNumber: string }> {
//   const submitAction = options?.submitAction ?? "Submit";
//   flowLog(
//     "UiAttachment",
//     `Excel upload + attachment ${submitAction}: ${scenario.id}`
//   );
//   const { invoice, invoiceNumber } = await uploadBaselineInvoiceAndOpenEdit(page, {
//     forceUpload: true,
//   });
//   await invoice.expectCreateInvoiceEditorLoaded();
//   await invoice.selectAttachmentFiles(...scenario.files);
//   await invoice.expectAttachedFilesListed(scenario.expectedNames);
//   await invoice.expectAttachmentUploadZoneHidden();
// 
//   const updateVisible = await invoice.createInvoicePageUpdateButton().isVisible().catch(() => false);
//   if (updateVisible) {
//     await invoice.clickCreateInvoicePageUpdate();
//   } else {
//     await invoice.clickCreateInvoicePageSubmit();
//   }
//   await invoice.waitAfterAttachmentPersist(90_000);
// 
//   const dashboard = new DashboardPage(page);
//   await dashboard.refreshDashboardForInvoiceTable(invoiceNumber);
//   await dashboard.waitForInvoiceReadyToSubmitStatus(invoiceNumber, { timeoutMs: 120_000 });
//   if (submitAction === "Submit as PDF") {
//     await dashboard.submitInvoiceAsPdfFromTable(invoiceNumber);
//   } else {
//     await dashboard.submitInvoiceFromTable(invoiceNumber);
//   }
//   await dashboard.waitForInvoiceDeliveryStatus(invoiceNumber, {
//     timeoutMs: UI_ATTACHMENT_DELIVERY_TIMEOUT_MS,
//   });
//   flowLog("UiAttachment", `Attachment invoice delivered via ${submitAction}: ${invoiceNumber}`);
// 
//   return { invoiceNumber };
// }
// 
// /** Multi fixtures under 10 MB â†’ Update â†’ submit â†’ delivered. */
// export async function runUiEditAttachmentMultiSubmitCase(page: Page): Promise<void> {
//   await runUiEditAttachmentSubmitCase(
//     page,
//     UI_ATTACHMENT_MULTI_UNDER_LIMIT as UiAttachmentAcceptScenario
//   );
// }
// 
// /** Multi fixtures under 10 MB â†’ Update â†’ Submit as PDF â†’ delivered. */
// export async function runUiEditAttachmentMultiSubmitAsPdfCase(page: Page): Promise<void> {
//   await runUiEditAttachmentSubmitCase(
//     page,
//     UI_ATTACHMENT_MULTI_UNDER_LIMIT as UiAttachmentAcceptScenario,
//     { submitAction: "Submit as PDF" }
//   );
// }
// 
// /** Exactly 10 MB single file â†’ Update â†’ submit â†’ delivered. */
// export async function runUiEditAttachmentAtLimitSubmitCase(page: Page): Promise<void> {
//   const { path: filePath, name } = buildAtLimitSingleAttachmentPath();
//   await runUiEditAttachmentSubmitCase(page, {
//     id: "single-at-10mb-submit",
//     title: "single exactly 10 MB â†’ submit â†’ delivered",
//     expect: "accept",
//     files: [filePath],
//     expectedNames: [name],
//   });
// }
// 
// /** Exactly 10 MB single file â†’ Update â†’ Submit as PDF â†’ delivered. */
// export async function runUiEditAttachmentAtLimitSubmitAsPdfCase(page: Page): Promise<void> {
//   const { path: filePath, name } = buildAtLimitSingleAttachmentPath();
//   await runUiEditAttachmentSubmitCase(
//     page,
//     {
//       id: "single-at-10mb-submit-as-pdf",
//       title: "single exactly 10 MB â†’ submit as PDF â†’ delivered",
//       expect: "accept",
//       files: [filePath],
//       expectedNames: [name],
//     },
//     { submitAction: "Submit as PDF" }
//   );
// }
