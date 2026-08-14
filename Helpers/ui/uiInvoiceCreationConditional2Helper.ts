// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under a ui/ subfolder; executable code is commented out.
//
// /**
//  * Create / Edit Invoice UI â€” conditional validation suite 2 (disclosed agent, frequency of billing, payment means).
//  * Excel matrices live in `ConditionalValidation.ts`.
//  */
// import type { Page } from "@playwright/test";
// import type {
//   DisclosedAgentPrincipleIdScenario,
//   FrequencyOfBillingInvoiceNoteScenario,
//   PaymentMeansAccountIdentifierScenario,
// } from "../../testData/ui/ConditionalValidation";
// import {
//   INVOICE_TRANSACTION_TYPE_CODE_BENEFICIARY_OPTIONAL,
//   INVOICE_TRANSACTION_TYPE_CODE_DISCLOSED_AGENT_BILLING,
// } from "../../testData/ui/ConditionalValidation";
// import { isUiNullOrEmpty } from "../../testData/ui/uiInvoiceCreationNullEmpty";
// import { UIInvoiceCreationManualPage } from "../pageObjects/UIInvoiceCreationManualPage";
// import {
//   electronicTinForParallelIndex,
//   getParallelWorkerIndex,
// } from "./parallelWorkerSubmitIdentity";
// import {
//   openInvoiceForConditionalFlow,
//   submitCopyInvoiceAfterSuccessIfNeeded,
//   type UiConditionalEntry,
// } from "./uiInvoiceEditEntryHelper";
// 
// const UI_SELLER_VAT_INPUT_ID = "sellerVatIdentifier";
// 
// export function resolveUiSellerVatIdentifier(raw: string): string {
//   const token = raw.trim().toUpperCase();
//   const workerTin = electronicTinForParallelIndex(getParallelWorkerIndex());
//   if (token === "__MW_TIN_VALID__") {
//     return workerTin;
//   }
//   if (token === "__MW_TRN_VALID__") {
//     const slot = getParallelWorkerIndex();
//     return `${workerTin}A${slot}B03`;
//   }
//   return raw;
// }
// 
// export function isUiWorkerIdentitySellerVatToken(raw: string): boolean {
//   const token = raw.trim().toUpperCase();
//   return token === "__MW_TIN_VALID__" || token === "__MW_TRN_VALID__";
// }
// 
// export function resolveUiPrincipleId(raw: string, sellerVatIdentifier: string): string {
//   const token = raw.trim().toUpperCase();
//   const workerTin = electronicTinForParallelIndex(getParallelWorkerIndex());
//   const slot = getParallelWorkerIndex();
//   const validTrn = `${workerTin}A${slot}B03`;
//   const otherTinLast = ((slot + 1) % 10).toString();
//   const otherTin = `${workerTin.slice(0, 9)}${otherTinLast}`;
//   const otherTrn = `${workerTin}X${slot}Y03`;
// 
//   if (token === "__MATCH_SELLER_VAT__") {
//     return sellerVatIdentifier;
//   }
//   if (token === "__MW_TIN_VALID__") {
//     return workerTin;
//   }
//   if (token === "__MW_TIN_OTHER__") {
//     return otherTin;
//   }
//   if (token === "__MW_TRN_VALID__") {
//     return validTrn;
//   }
//   if (token === "__MW_TRN_OTHER__") {
//     return otherTrn;
//   }
//   return raw;
// }
// 
// function isDisclosedAgentTransactionType(txn: string): boolean {
//   return txn.trim() === INVOICE_TRANSACTION_TYPE_CODE_DISCLOSED_AGENT_BILLING;
// }
// 
// async function ensureSellerVatForScenario(
//   invoice: UIInvoiceCreationManualPage,
//   sellerVatToken: string
// ): Promise<string> {
//   await invoice.openSellerEditor();
// 
//   if (isUiWorkerIdentitySellerVatToken(sellerVatToken)) {
//     await invoice.fillSellerBaseline([
//       UI_SELLER_VAT_INPUT_ID,
//       "sellerElectronicAddress",
//       "sellerElectronicAddressScheme",
//     ]);
//     const prefilled = await invoice.readInputValueById(UI_SELLER_VAT_INPUT_ID);
//     const effective = prefilled || resolveUiSellerVatIdentifier(sellerVatToken);
//     await invoice.clickSectionSave("seller");
//     return effective;
//   }
// 
//   const sellerVat = resolveUiSellerVatIdentifier(sellerVatToken);
//   await invoice.fillSellerBaseline([
//     UI_SELLER_VAT_INPUT_ID,
//     "sellerElectronicAddress",
//     "sellerElectronicAddressScheme",
//   ]);
//   await invoice.replaceInputById(UI_SELLER_VAT_INPUT_ID, sellerVat);
//   await invoice.clickSectionSave("seller");
//   return sellerVat;
// }
// 
// async function applyDocumentTransactionTypeAndSave(
//   invoice: UIInvoiceCreationManualPage,
//   txnLabel: string
// ): Promise<void> {
//   await invoice.ensureDocumentEditable();
//   await invoice.fillDocumentBaseline(["invTxnType"]);
//   await invoice.selectDocumentTransactionType(txnLabel);
//   await invoice.clickDocumentSave();
//   await invoice.expectDocumentViewMode();
// }
// 
// async function applyPrincipleIdWhenEnabled(
//   invoice: UIInvoiceCreationManualPage,
//   principleId: string
// ): Promise<void> {
//   if (!(await invoice.isFormInputEnabled("principleId"))) {
//     return;
//   }
//   if (isUiNullOrEmpty(principleId)) {
//     await invoice.clearInputByIdIfNotEmpty("principleId");
//     return;
//   }
//   await invoice.replaceInputById("principleId", principleId);
// }
// 
// export async function runUiDisclosedAgentPrincipleIdScenario(
//   page: Page,
//   scenario: DisclosedAgentPrincipleIdScenario,
//   options?: { entry?: UiConditionalEntry }
// ): Promise<void> {
//   const entry = options?.entry ?? "create";
//   const invoice = await openInvoiceForConditionalFlow(page, entry);
//   await invoice.ensureDocumentEditable();
// 
//   const sellerVat = await ensureSellerVatForScenario(invoice, scenario.sellerVatIdentifier);
//   const principleId = resolveUiPrincipleId(scenario.principleId, sellerVat);
// 
//   const changedFromOtherToDisclosed = /Changed From Other To Disclosed Agent Billing/i.test(
//     scenario.title
//   );
//   const changedFromDisclosedToOther =
//     /Changed From Disclosed Agent Billing To Other/i.test(scenario.title);
// 
//   await invoice.ensureDocumentEditable();
//   await invoice.fillDocumentBaseline(["invTxnType", "principleId"]);
// 
//   if (changedFromDisclosedToOther) {
//     await invoice.selectDocumentTransactionType(
//       INVOICE_TRANSACTION_TYPE_CODE_DISCLOSED_AGENT_BILLING
//     );
//     await applyPrincipleIdWhenEnabled(
//       invoice,
//       resolveUiPrincipleId("__MW_TIN_OTHER__", sellerVat)
//     );
//     await applyDocumentTransactionTypeAndSave(
//       invoice,
//       INVOICE_TRANSACTION_TYPE_CODE_BENEFICIARY_OPTIONAL
//     );
//     if (scenario.shouldError) {
//       await invoice.expectInputValidationError("principleId");
//     } else {
//       await invoice.expectDocumentViewMode();
//       await submitCopyInvoiceAfterSuccessIfNeeded(invoice, entry, scenario.shouldError);
//     }
//     return;
//   }
// 
//   if (changedFromOtherToDisclosed) {
//     await invoice.selectDocumentTransactionType(INVOICE_TRANSACTION_TYPE_CODE_BENEFICIARY_OPTIONAL);
//     await invoice.selectDocumentTransactionType(
//       INVOICE_TRANSACTION_TYPE_CODE_DISCLOSED_AGENT_BILLING
//     );
//     await applyPrincipleIdWhenEnabled(invoice, principleId);
//   } else {
//     await invoice.selectDocumentTransactionType(scenario.invoiceTransactionTypeCode);
//     if (isDisclosedAgentTransactionType(scenario.invoiceTransactionTypeCode)) {
//       await applyPrincipleIdWhenEnabled(invoice, principleId);
//     }
//   }
// 
//   await invoice.clickDocumentSave();
// 
//   if (scenario.shouldError) {
//     await invoice.expectInputValidationError("principleId");
//   } else {
//     await invoice.expectDocumentViewMode();
//     await submitCopyInvoiceAfterSuccessIfNeeded(invoice, entry, scenario.shouldError);
//   }
// }
// 
// const INVOICE_NOTE_INPUT_ID = "invNote";
// const FREQUENCY_OTHERS = "Others";
// const INVOICE_NOTE_MAX_LEN = 300;
// 
// const UI_FREQUENCY_BILLING_EXCLUDED_SCENARIO_TITLES = new Set([
//   "Frequency Of Billing Changed From Others To Monthly Invoice Note Optional Value Cleared (Allowed)",
// ]);
// 
// export function isUiFrequencyBillingScenarioRunnable(
//   scenario: FrequencyOfBillingInvoiceNoteScenario
// ): boolean {
//   return !UI_FREQUENCY_BILLING_EXCLUDED_SCENARIO_TITLES.has(scenario.title);
// }
// 
// function resolveUiInvoiceNoteValue(raw: string): string {
//   const token = raw.trim().toUpperCase();
//   if (token === "__LEN_300__") {
//     return "A".repeat(INVOICE_NOTE_MAX_LEN);
//   }
//   if (token === "__LEN_301__") {
//     return "A".repeat(INVOICE_NOTE_MAX_LEN + 1);
//   }
//   return raw;
// }
// 
// function isOthersFrequency(frequencyOfBilling: string): boolean {
//   return frequencyOfBilling.trim() === FREQUENCY_OTHERS;
// }
// 
// async function applyInvoiceNoteField(
//   invoice: UIInvoiceCreationManualPage,
//   invoiceNote: string
// ): Promise<void> {
//   if (isUiNullOrEmpty(invoiceNote)) {
//     await invoice.clearInputByIdIfNotEmpty(INVOICE_NOTE_INPUT_ID);
//     return;
//   }
//   await invoice.replaceInputById(INVOICE_NOTE_INPUT_ID, resolveUiInvoiceNoteValue(invoiceNote));
// }
// 
// async function applyFrequencyAndInvoiceNote(
//   invoice: UIInvoiceCreationManualPage,
//   frequencyOfBilling: string,
//   invoiceNote: string
// ): Promise<void> {
//   const hasNote = !isUiNullOrEmpty(invoiceNote);
//   const targetIsOthers = isOthersFrequency(frequencyOfBilling);
// 
//   if (hasNote && !targetIsOthers) {
//     await invoice.selectDocumentFrequencyOfBilling(FREQUENCY_OTHERS);
//     await applyInvoiceNoteField(invoice, invoiceNote);
//     await invoice.selectDocumentFrequencyOfBilling(frequencyOfBilling);
//     return;
//   }
// 
//   await invoice.selectDocumentFrequencyOfBilling(frequencyOfBilling);
//   await applyInvoiceNoteField(invoice, invoiceNote);
// }
// 
// export async function runUiFrequencyOfBillingInvoiceNoteScenario(
//   page: Page,
//   scenario: FrequencyOfBillingInvoiceNoteScenario,
//   options?: { entry?: UiConditionalEntry }
// ): Promise<void> {
//   const entry = options?.entry ?? "create";
//   const invoice = await openInvoiceForConditionalFlow(page, entry);
//   await invoice.ensureDocumentEditable();
//   await invoice.fillDocumentBaseline(["frequencyOfBilling", "invNote"]);
// 
//   const changedFromMonthlyToOthers = /Changed From Monthly To Others/i.test(scenario.title);
// 
//   if (changedFromMonthlyToOthers) {
//     await invoice.selectDocumentFrequencyOfBilling("Monthly");
//     await applyInvoiceNoteField(invoice, "");
//     await invoice.selectDocumentFrequencyOfBilling(scenario.frequencyOfBilling);
//     await applyInvoiceNoteField(invoice, scenario.invoiceNote);
//   } else {
//     await applyFrequencyAndInvoiceNote(
//       invoice,
//       scenario.frequencyOfBilling,
//       scenario.invoiceNote
//     );
//   }
// 
//   await invoice.clickDocumentSave();
// 
//   if (scenario.shouldError) {
//     await invoice.expectInputValidationError(INVOICE_NOTE_INPUT_ID);
//   } else {
//     await invoice.expectDocumentViewMode();
//     await submitCopyInvoiceAfterSuccessIfNeeded(invoice, entry, scenario.shouldError);
//   }
// }
// 
// const PAYMENT_ACCOUNT_IDENTIFIER_INPUT_ID = "paymentAccountIdentifier";
// const PAYMENT_MEANS_CASH_LABEL = "In cash";
// 
// function resolveUiPaymentAccountIdentifier(raw: string): string {
//   const token = raw.trim().toUpperCase();
//   if (token === "__LEN_35__") {
//     return "A".repeat(35);
//   }
//   if (token === "__LEN_36__") {
//     return "A".repeat(36);
//   }
//   return raw;
// }
// 
// async function applyPaymentAccountIdentifierField(
//   invoice: UIInvoiceCreationManualPage,
//   paymentAccountIdentifier: string
// ): Promise<void> {
//   if (isUiNullOrEmpty(paymentAccountIdentifier)) {
//     await invoice.clearInputByIdIfNotEmpty(PAYMENT_ACCOUNT_IDENTIFIER_INPUT_ID);
//     return;
//   }
//   await invoice.replaceInputById(
//     PAYMENT_ACCOUNT_IDENTIFIER_INPUT_ID,
//     resolveUiPaymentAccountIdentifier(paymentAccountIdentifier)
//   );
// }
// 
// export async function runUiPaymentMeansAccountIdentifierScenario(
//   page: Page,
//   scenario: PaymentMeansAccountIdentifierScenario,
//   options?: { entry?: UiConditionalEntry }
// ): Promise<void> {
//   const entry = options?.entry ?? "create";
//   const baseline =
//     entry === "edit" || entry === "copy"
//       ? { forceUpload: true as const, invoiceTypeCode: "Commercial Invoice" }
//       : undefined;
//   const invoice = await openInvoiceForConditionalFlow(page, entry, baseline);
//   await invoice.openPaymentEditor();
//   if (!(await invoice.hasPaymentMeansFields())) {
//     throw new Error(
//       `${options?.entry === "edit" ? "Edit" : options?.entry === "copy" ? "Copy" : "Create"} Invoice UI payment means fields not present`
//     );
//   }
//   await invoice.fillPaymentBaseline();
// 
//   const changedFromCashToCreditTransfer = /Changed From Cash To Credit Transfer/i.test(
//     scenario.title
//   );
// 
//   if (changedFromCashToCreditTransfer) {
//     await invoice.selectPaymentMeansTypeCode(PAYMENT_MEANS_CASH_LABEL);
//     await invoice.replaceInputById(PAYMENT_ACCOUNT_IDENTIFIER_INPUT_ID, "ACC-BASELINE");
//     await invoice.selectPaymentMeansTypeCode(scenario.paymentMeansTypeCode);
//     await applyPaymentAccountIdentifierField(invoice, scenario.paymentAccountIdentifier);
//   } else {
//     await invoice.selectPaymentMeansTypeCode(scenario.paymentMeansTypeCode);
//     await applyPaymentAccountIdentifierField(invoice, scenario.paymentAccountIdentifier);
//   }
// 
//   await invoice.clickSectionSave("payment");
// 
//   if (scenario.shouldError) {
//     await invoice.expectInputValidationError(PAYMENT_ACCOUNT_IDENTIFIER_INPUT_ID);
//   } else {
//     await invoice.expectInputNoValidationError(PAYMENT_ACCOUNT_IDENTIFIER_INPUT_ID);
//     await submitCopyInvoiceAfterSuccessIfNeeded(invoice, entry, scenario.shouldError);
//   }
// }
