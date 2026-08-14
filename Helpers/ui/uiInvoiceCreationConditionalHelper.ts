// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under a ui/ subfolder; executable code is commented out.
//
// /**
//  * Create / Edit / Copy Invoice UI conditional flows. Expectations (`shouldError`, field values) come from
//  * `ConditionalValidation.ts` via `uiInvoiceCreationConditionalValidation.ts` â€” same source as Excel.
//  * Pass `{ entry: "edit" }` for upload â†’ Options â†’ Edit; `{ entry: "copy" }` for Options â†’ Create Copy.
//  */
// import { expect, type Page } from "@playwright/test";
// import type {
//   CreateInvoiceBuyerConditionalScenario,
//   CreateInvoiceConditionalScenario,
//   CreateInvoiceDeliveryConditionalScenario,
//   CreateInvoiceDocumentConditionalScenario,
//   CreateInvoiceItemConditionalScenario,
//   CreateInvoicePaymentConditionalScenario,
//   CreateInvoiceSellerConditionalScenario,
// } from "../../testData/ui/uiInvoiceCreationConditionalValidation";
// import { isUiNullOrEmpty } from "../../testData/ui/uiInvoiceCreationConditionalValidation";
// import {
//   assertUiFieldStateAfterSectionSave,
//   openInvoiceForConditionalFlow,
//   submitCopyInvoiceAfterSuccessIfNeeded,
//   type UiConditionalEntry,
// } from "./uiInvoiceEditEntryHelper";
// import { UIInvoiceCreationManualPage } from "../pageObjects/UIInvoiceCreationManualPage";
// import {
//   BUYER_ELECTRONIC_ADDRESS_1_PATTERN,
//   BUYER_ELECTRONIC_ADDRESS_REQUIRES_LEGAL_REG,
//   BUYER_LEGAL_REG_TYPE_INVALID_OTHER,
//   INVOICE_TRANSACTION_TYPE_CODE_BENEFICIARY_OPTIONAL,
//   INVOICE_TRANSACTION_TYPE_CODE_FREE_TRADE_ZONE,
//   INVOICE_TRANSACTION_TYPE_CODE_SUMMARY_INVOICE,
//   INVOICE_TYPE_CODE_COMMERCIAL_INVOICE,
//   OTHER_SCHEME_IDENTIFIER,
// } from "../../testData/ui/ConditionalValidation";
// import {
//   defaultUiInvoicingPeriodRange,
//   EXCEL_INVOICING_PERIOD_ANCHOR_END,
//   EXCEL_INVOICING_PERIOD_ANCHOR_START,
//   isValidCalendarIsoDate,
//   parseUiDateToIso,
//   resolveUiInvoicingPeriodStartEnd,
//   resolveUiPaymentDueDate,
//   uiPaymentDueScenarioTitle,
// } from "../../testData/ui/uiInvoiceCreationDocumentDates";
// import { PAYMENT_DUE_DATE_SCENARIOS } from "../../testData/ui/ConditionalValidation";
// import {
//   creditNoteReasonRequiresPrecedingInvoice,
//   isKnownCreditNoteReasonDropdownOption,
//   isUiCreditNoteInvoiceType,
//   UI_CREDIT_NOTE_REASON_VOLUME_DISCOUNT,
// } from "../../testData/ui/uiInvoiceCreationCreditNote";
// import {
//   DEFAULT_UAE_COUNTRY_SUBDIVISION,
//   UAE_COUNTRY_SUBDIVISION_DROPDOWN_OPTIONS,
// } from "./uiMasterBuyerTestData";
// import {
//   isNonUaeCountryCode,
//   NON_UAE_TIN_SCHEME_LABEL,
//   parseBuyerCountryTransition,
//   parseSellerCountryTransition,
//   sellerCountryRequiresNonTinScheme,
//   UAE_TIN_SCHEME_LABEL,
// } from "./uiSchemeCountryHelper";
// import { DEFAULT_UI_MASTER_CLASSIFICATION_SCHEME } from "./uiMasterItemTestData";
// 
// /** Passport issuing country labels present on Create Invoice (Excel free-text invalid codes are not). */
// const UI_PASSPORT_COUNTRY_DROPDOWN_OPTIONS = new Set(["United Arab Emirates", "US"]);
// 
// function canSelectPassportCountryOnUi(value: string): boolean {
//   return UI_PASSPORT_COUNTRY_DROPDOWN_OPTIONS.has(value.trim());
// }
// 
// function canSelectUaeCountrySubdivisionOnUi(value: string): boolean {
//   return (UAE_COUNTRY_SUBDIVISION_DROPDOWN_OPTIONS as readonly string[]).includes(value.trim());
// }
// 
// /**
//  * Clear subdivision only when the scenario needs empty or a different value than what is already shown.
//  * Avoids wiping UAE defaults (e.g. Abu Dhabi) and failing to re-select from the emirates list.
//  */
// async function prepareCountrySubdivisionFieldForScenario(
//   invoice: UIInvoiceCreationManualPage,
//   inputId: string,
//   targetSubdivision: string | null | undefined
// ): Promise<void> {
//   const target = (targetSubdivision ?? "").trim();
//   if (target === "" || isUiNullOrEmpty(targetSubdivision)) {
//     await invoice.clearInputByIdIfNotEmpty(inputId);
//     return;
//   }
//   const current = await invoice.readInputValueById(inputId);
//   if (current !== target) {
//     await invoice.clearInputByIdIfNotEmpty(inputId);
//   }
// }
// 
// /**
//  * Country subdivision on Create Invoice: UAE country â†’ emirates dropdown; other countries â†’ free text.
//  * Invalid UAE values (e.g. Pune) are typed without choosing `role="option"`.
//  */
// async function applyCountrySubdivisionUiValue(
//   invoice: UIInvoiceCreationManualPage,
//   inputId: string,
//   countryCode: string | undefined,
//   value: string,
//   select: (label: string) => Promise<void>
// ): Promise<void> {
//   const trimmed = value.trim();
//   const current = await invoice.readInputValueById(inputId);
//   if (current === trimmed) {
//     return;
//   }
//   if (countryCode && isNonUaeCountryCode(countryCode)) {
//     await invoice.fillInputById(inputId, trimmed);
//     return;
//   }
//   if (!canSelectUaeCountrySubdivisionOnUi(trimmed)) {
//     await invoice.clearInputByIdIfNotEmpty(inputId);
//     await invoice.fillAutocompleteById(inputId, trimmed);
//     return;
//   }
//   await select(trimmed);
// }
// 
// /**
//  * Apply Excel conditional value to a combobox/autocomplete.
//  * Null/empty/whitespace (`undefined`): skip â€” do not click the control.
//  * Values not in the dropdown are typed as free text (no `role="option"` click).
//  */
// async function applyUiAutocompleteDropdownValue(
//   invoice: UIInvoiceCreationManualPage,
//   inputId: string,
//   value: string,
//   select: (label: string) => Promise<void>,
//   options?: { passportCountry?: boolean }
// ): Promise<void> {
//   const trimmed = value.trim();
//   if (options?.passportCountry && !canSelectPassportCountryOnUi(trimmed)) {
//     await invoice.fillAutocompleteById(inputId, trimmed);
//     return;
//   }
//   await select(trimmed);
// }
// 
// /** IBG-14 / BTUAE-002 â€” same trigger as Excel `ensureInvoicingPeriodForSummaryInvoice` (Summary Invoice txn only). */
// function documentRequiresInvoicingPeriod(
//   _invoiceTypeCode?: string,
//   invoiceTransactionTypeCode?: string
// ): boolean {
//   const txn = (invoiceTransactionTypeCode ?? "").trim();
//   return (
//     txn === INVOICE_TRANSACTION_TYPE_CODE_SUMMARY_INVOICE ||
//     /summary invoice/i.test(txn)
//   );
// }
// 
// /** Default period (Excel 2026-01-01 â€¦ 2026-01-31 â†’ UI calendar months after issue). */
// async function applyInvoicingPeriodWhenRequired(
//   invoice: UIInvoiceCreationManualPage,
//   invoiceTypeCode?: string,
//   invoiceTransactionTypeCode?: string
// ): Promise<void> {
//   if (!documentRequiresInvoicingPeriod(invoiceTypeCode, invoiceTransactionTypeCode)) {
//     return;
//   }
//   const issueIso = await invoice.readDocumentIssueDateIso();
//   const { start, end } = resolveUiInvoicingPeriodStartEnd(
//     EXCEL_INVOICING_PERIOD_ANCHOR_START,
//     EXCEL_INVOICING_PERIOD_ANCHOR_END,
//     issueIso
//   );
//   await invoice.setDocumentInvoicingPeriod(start, end);
// }
// 
// function invoicingPeriodExcelDates(scenario: CreateInvoiceDocumentConditionalScenario): {
//   startExcel: string;
//   endExcel: string;
// } {
//   return {
//     startExcel: (scenario.invoicingPeriodStartDate ?? "").trim(),
//     endExcel: (scenario.invoicingPeriodEndDate ?? "").trim(),
//   };
// }
// 
// /**
//  * IBG-14 partial fill: set only the side(s) Excel provides; clear the empty side(s) only when
//  * they still hold a value (e.g. copied invoice). Avoid clearing both fields before a one-sided set.
//  */
// async function applyScenarioInvoicingPeriodDates(
//   invoice: UIInvoiceCreationManualPage,
//   startExcel: string,
//   endExcel: string
// ): Promise<void> {
//   const issueIso = await invoice.readDocumentIssueDateIso();
//   const { start, end } = resolveUiInvoicingPeriodStartEnd(startExcel, endExcel, issueIso);
//   const wantStartEmpty = startExcel === "";
//   const wantEndEmpty = endExcel === "";
// 
//   if (!wantStartEmpty && !wantEndEmpty) {
//     await invoice.clearDocumentInvoicingPeriodSoft();
//     await invoice.setDocumentInvoicingPeriod(start, end);
//     return;
//   }
// 
//   if (!wantEndEmpty && end) {
//     await invoice.fillDocumentDateById("invEndDate", end);
//   }
//   if (!wantStartEmpty && start) {
//     await invoice.fillDocumentDateById("invStartDate", start);
//   }
//   if (wantStartEmpty) {
//     const currentStart = await invoice.readDocumentDateFieldIso("invStartDate");
//     if (currentStart) {
//       await invoice.clearDocumentDateById("invStartDate");
//     }
//   }
//   if (wantEndEmpty) {
//     const currentEnd = await invoice.readDocumentDateFieldIso("invEndDate");
//     if (currentEnd) {
//       await invoice.clearDocumentDateById("invEndDate");
//     }
//   }
// }
// 
// async function assertInvoicingPeriodBeforeDocumentSave(
//   invoice: UIInvoiceCreationManualPage,
//   scenario: CreateInvoiceDocumentConditionalScenario
// ): Promise<void> {
//   const issueIso = await invoice.readDocumentIssueDateIso();
//   const { start, end } = resolveUiInvoicingPeriodStartEnd(
//     scenario.invoicingPeriodStartDate ?? "",
//     scenario.invoicingPeriodEndDate ?? "",
//     issueIso
//   );
//   if (start) {
//     await invoice.expectDocumentDateFieldValue("invStartDate", start);
//     await invoice.expectInputNoValidationError("invStartDate");
//   }
//   if (end) {
//     await invoice.expectDocumentDateFieldValue("invEndDate", end);
//     await invoice.expectInputNoValidationError("invEndDate");
//   }
// }
// 
// async function applyInvoicingPeriodConditional(
//   invoice: UIInvoiceCreationManualPage,
//   scenario: CreateInvoiceDocumentConditionalScenario
// ): Promise<void> {
//   await invoice.fillDocumentBaseline(["invType", "invTxnType", "invStartDate", "invEndDate"]);
// 
//   const { startExcel, endExcel } = invoicingPeriodExcelDates(scenario);
//   const wantsEmptyPeriod = startExcel === "" && endExcel === "";
// 
//   const invoiceType =
//     scenario.invoiceTypeCode ?? INVOICE_TYPE_CODE_COMMERCIAL_INVOICE;
//   const targetTxn =
//     scenario.invoiceTransactionTypeCode ??
//     INVOICE_TRANSACTION_TYPE_CODE_BENEFICIARY_OPTIONAL;
//   const changeToSummary = /Changed From Commercial Invoice To Summary Invoice/i.test(
//     scenario.title
//   );
//   const changeToCommercial = /Changed From Summary Invoice To Commercial Invoice/i.test(
//     scenario.title
//   );
// 
//   if (changeToSummary) {
//     await invoice.selectDocumentInvoiceType(invoiceType);
//     await invoice.selectDocumentTransactionType(INVOICE_TRANSACTION_TYPE_CODE_BENEFICIARY_OPTIONAL);
//     if (!wantsEmptyPeriod) {
//       const issueIso = await invoice.readDocumentIssueDateIso();
//       const range = defaultUiInvoicingPeriodRange(issueIso);
//       await invoice.setDocumentInvoicingPeriod(range.start, range.end);
//     }
//     if (scenario.invoiceTransactionTypeCode) {
//       await invoice.selectDocumentTransactionType(scenario.invoiceTransactionTypeCode);
//     }
//   } else if (changeToCommercial) {
//     await invoice.selectDocumentInvoiceType(INVOICE_TYPE_CODE_COMMERCIAL_INVOICE);
//     await invoice.selectDocumentTransactionType(INVOICE_TRANSACTION_TYPE_CODE_SUMMARY_INVOICE);
// 
//     if (wantsEmptyPeriod) {
//       const issueIso = await invoice.readDocumentIssueDateIso();
//       const range = defaultUiInvoicingPeriodRange(issueIso);
//       await invoice.setDocumentInvoicingPeriod(range.start, range.end);
//     }
// 
//     if (scenario.invoiceTransactionTypeCode) {
//       await invoice.selectDocumentTransactionType(scenario.invoiceTransactionTypeCode);
//     }
// 
//     if (wantsEmptyPeriod) {
//       await invoice.clearDocumentInvoicingPeriodSoft();
//     } else if (!wantsEmptyPeriod) {
//       const issueIso = await invoice.readDocumentIssueDateIso();
//       const range = defaultUiInvoicingPeriodRange(issueIso);
//       await invoice.setDocumentInvoicingPeriod(range.start, range.end);
//     }
//   } else {
//     await invoice.selectDocumentInvoiceType(invoiceType);
//     await invoice.selectDocumentTransactionType(targetTxn);
//   }
// 
//   await invoice.ensureDocumentIssueDate();
// 
//   await applyScenarioInvoicingPeriodDates(invoice, startExcel, endExcel);
//   await invoice.ensureDocumentIssueDate();
// }
// 
// async function applyDocumentConditional(
//   invoice: UIInvoiceCreationManualPage,
//   scenario: CreateInvoiceDocumentConditionalScenario
// ): Promise<void> {
//   await invoice.ensureDocumentEditable();
//   await invoice.focusSection("document");
// 
//   switch (scenario.kind) {
//     case "exchangeRate":
//       await invoice.fillDocumentBaseline(["invCurrCode", "currExchangeRate"]);
//       if (scenario.invoiceCurrencyCode) {
//         await invoice.applyDocumentCurrencyAndExchangeRate(
//           scenario.invoiceCurrencyCode,
//           scenario.exchangeRate
//         );
//       } else if (scenario.exchangeRate !== undefined) {
//         await invoice.fillDocumentExchangeRate(scenario.exchangeRate);
//       }
//       return;
//     case "invoiceTypeVsTxn":
//       await invoice.fillDocumentBaseline([
//         "invType",
//         "invTxnType",
//         "invStartDate",
//         "invEndDate",
//       ]);
//       if (scenario.invoiceTypeCode) {
//         await invoice.selectDocumentInvoiceType(scenario.invoiceTypeCode);
//       }
//       if (isUiCreditNoteInvoiceType(scenario.invoiceTypeCode)) {
//         await invoice.selectDocumentCreditNoteReason(UI_CREDIT_NOTE_REASON_VOLUME_DISCOUNT);
//       }
//       if (scenario.invoiceTransactionTypeCode) {
//         await invoice.selectDocumentTransactionType(scenario.invoiceTransactionTypeCode);
//       }
//       await applyInvoicingPeriodWhenRequired(
//         invoice,
//         scenario.invoiceTypeCode,
//         scenario.invoiceTransactionTypeCode
//       );
//       return;
//     case "creditNoteReason":
//       await invoice.fillDocumentBaseline(["invType"]);
//       if (scenario.invoiceTypeCode) {
//         await invoice.selectDocumentInvoiceType(scenario.invoiceTypeCode);
//       }
//       const reasonCode = scenario.creditNoteReasonCode?.trim() ?? "";
//       if (reasonCode === "") {
//         await invoice.clearInputById("creditNoteRsn");
//       } else if (isKnownCreditNoteReasonDropdownOption(reasonCode)) {
//         await invoice.selectDocumentCreditNoteReason(reasonCode);
//       } else {
//         await invoice.fillDocumentCreditNoteReasonFreeText(reasonCode);
//       }
//       if (creditNoteReasonRequiresPrecedingInvoice(reasonCode)) {
//         const issueIso = await invoice.readDocumentIssueDateIso();
//         await invoice.fillDocumentPrecedingInvoice("INV-01", issueIso);
//       }
//       return;
//     case "invoicingPeriod":
//       await applyInvoicingPeriodConditional(invoice, scenario);
//       return;
//   }
// }
// 
// function normalizeLegalRegIdTypeLabel(label: string): string {
//   const t = label.replace(/\s+/g, " ").trim();
//   if (/commercial\s*\/?\s*trade\s*license/i.test(t)) {
//     return "Commercial/Trade License";
//   }
//   return t;
// }
// 
// function parseLegalRegIdTypeTransition(title: string): { from: string; to: string } | null {
//   const m = title.match(/Changed from (.+?) to (.+?) (?:Authority|Passport)/i);
//   if (!m) {
//     return null;
//   }
//   return {
//     from: normalizeLegalRegIdTypeLabel(m[1]),
//     to: normalizeLegalRegIdTypeLabel(m[2]),
//   };
// }
// 
// function expectedAuthorityPassportEnabledForLegalRegIdType(
//   legalRegIdType: string
// ): { authorityEnabled: boolean; passportEnabled: boolean } {
//   const t = normalizeLegalRegIdTypeLabel(legalRegIdType);
//   if (/commercial\/trade license/i.test(t)) {
//     return { authorityEnabled: true, passportEnabled: false };
//   }
//   if (/passport/i.test(t)) {
//     return { authorityEnabled: false, passportEnabled: true };
//   }
//   if (/emirates id/i.test(t) || /cabinet/i.test(t)) {
//     return { authorityEnabled: false, passportEnabled: false };
//   }
//   return { authorityEnabled: false, passportEnabled: false };
// }
// 
// async function expectLegalRegDependentFieldEnabledState(
//   invoice: UIInvoiceCreationManualPage,
//   opts: {
//     legalRegIdType: string;
//     inputId:
//       | "sellerAuthorityName"
//       | "authorityName"
//       | "sellerPassportCountry"
//       | "passportCountry";
//     field: "authority" | "passportCountry";
//   }
// ): Promise<void> {
//   const expected = expectedAuthorityPassportEnabledForLegalRegIdType(opts.legalRegIdType);
//   const shouldBeEnabled =
//     opts.field === "authority" ? expected.authorityEnabled : expected.passportEnabled;
//   // UI enablement for these conditional controls can vary by release (disabled vs enabled-but-optional).
//   // Only enforce the "must be enabled" expectation; when expected disabled, allow either state.
//   if (!shouldBeEnabled) {
//     return;
//   }
//   await expect(invoice.isFormInputEnabled(opts.inputId)).resolves.toBe(true);
// }
// 
// async function applyAuthorityNameField(
//   invoice: UIInvoiceCreationManualPage,
//   inputId: "sellerAuthorityName" | "authorityName",
//   authorityName: string | null | undefined
// ): Promise<void> {
//   // Authority name is editable only for Commercial/Trade License. For other legal
//   // registration types (Emirates ID, Passport, Cabinet Decision) the input is disabled;
//   // clicking it to type/clear would wait for actionability until the test times out.
//   if (!(await invoice.isFormInputEnabled(inputId))) {
//     return;
//   }
//   if (authorityName == null || isUiNullOrEmpty(authorityName)) {
//     await invoice.clearInputByIdIfNotEmpty(inputId);
//     return;
//   }
//   await invoice.replaceInputById(inputId, authorityName);
// }
// 
// /** Free Trade Zone â€” clear prefilled `#beneficiaryId` when Excel value is null/empty/whitespace. */
// async function applyBeneficiaryIdField(
//   invoice: UIInvoiceCreationManualPage,
//   beneficiaryId: string | undefined
// ): Promise<void> {
//   if (!(await invoice.hasBuyerInput("beneficiaryId"))) {
//     return;
//   }
//   if (beneficiaryId === undefined || isUiNullOrEmpty(beneficiaryId)) {
//     await invoice.clearInputByIdIfNotEmpty("beneficiaryId");
//     return;
//   }
//   await invoice.replaceInputById("beneficiaryId", beneficiaryId);
// }
// 
// /** Passport issuing country â€” clear or select only the field under test (not other buyer/seller inputs). */
// async function applyPassportCountryField(
//   invoice: UIInvoiceCreationManualPage,
//   inputId: "passportCountry" | "sellerPassportCountry",
//   passportCountry: string | null | undefined,
//   select: (label: string) => Promise<void>
// ): Promise<void> {
//   if (inputId === "passportCountry" && !(await invoice.hasBuyerInput(inputId))) {
//     return;
//   }
//   if (!(await invoice.isFormInputEnabled(inputId))) {
//     return;
//   }
//   if (passportCountry == null || isUiNullOrEmpty(passportCountry)) {
//     await invoice.clearInputByIdIfNotEmpty(inputId);
//     return;
//   }
//   const trimmed = passportCountry.trim();
//   if (!canSelectPassportCountryOnUi(trimmed)) {
//     await invoice.clearInputByIdIfNotEmpty(inputId);
//     await invoice.fillAutocompleteById(inputId, trimmed);
//     return;
//   }
//   if ((await invoice.readInputValueById(inputId)) === trimmed) {
//     return;
//   }
//   await select(trimmed);
// }
// 
// async function applyBuyerLegalRegIdTypeForScenario(
//   invoice: UIInvoiceCreationManualPage,
//   scenario: CreateInvoiceBuyerConditionalScenario
// ): Promise<void> {
//   const buyerTransition = parseLegalRegIdTypeTransition(scenario.title);
//   if (buyerTransition) {
//     await invoice.selectBuyerLegalRegIdType(buyerTransition.from);
//     await invoice.selectBuyerLegalRegIdType(buyerTransition.to);
//     await expectLegalRegDependentFieldEnabledState(invoice, {
//       legalRegIdType: buyerTransition.to,
//       inputId: scenario.kind === "authority" ? "authorityName" : "passportCountry",
//       field: scenario.kind === "authority" ? "authority" : "passportCountry",
//     });
//     if (scenario.kind === "authority" && /passport/i.test(buyerTransition.to)) {
//       await invoice.selectBuyerPassportCountry(/^United Arab Emirates$/i);
//     }
//     return;
//   }
//   if (scenario.legalRegIdType) {
//     await invoice.selectBuyerLegalRegIdType(scenario.legalRegIdType);
//     await expectLegalRegDependentFieldEnabledState(invoice, {
//       legalRegIdType: scenario.legalRegIdType,
//       inputId: scenario.kind === "authority" ? "authorityName" : "passportCountry",
//       field: scenario.kind === "authority" ? "authority" : "passportCountry",
//     });
//     if (scenario.kind === "authority" && /passport/i.test(scenario.legalRegIdType)) {
//       await invoice.selectBuyerPassportCountry(/^United Arab Emirates$/i);
//     }
//   }
// }
// 
// async function applySellerLegalRegIdTypeForScenario(
//   invoice: UIInvoiceCreationManualPage,
//   scenario: CreateInvoiceSellerConditionalScenario
// ): Promise<void> {
//   const transition = parseLegalRegIdTypeTransition(scenario.title);
//   if (transition) {
//     await invoice.selectSellerLegalRegIdType(transition.from);
//     await invoice.selectSellerLegalRegIdType(transition.to);
//     await expectLegalRegDependentFieldEnabledState(invoice, {
//       legalRegIdType: transition.to,
//       inputId: scenario.kind === "authority" ? "sellerAuthorityName" : "sellerPassportCountry",
//       field: scenario.kind === "authority" ? "authority" : "passportCountry",
//     });
//     if (scenario.kind === "authority" && /passport/i.test(transition.to)) {
//       await invoice.selectSellerPassportCountry(/^United Arab Emirates$/i);
//     }
//     return;
//   }
//   if (scenario.legalRegIdType) {
//     await invoice.selectSellerLegalRegIdType(scenario.legalRegIdType);
//     await expectLegalRegDependentFieldEnabledState(invoice, {
//       legalRegIdType: scenario.legalRegIdType,
//       inputId: scenario.kind === "authority" ? "sellerAuthorityName" : "sellerPassportCountry",
//       field: scenario.kind === "authority" ? "authority" : "passportCountry",
//     });
//     if (scenario.kind === "authority" && /passport/i.test(scenario.legalRegIdType)) {
//       await invoice.selectSellerPassportCountry(/^United Arab Emirates$/i);
//     }
//   }
// }
// 
// /**
//  * Country/subdivision conditional: baseline seller fields (country may auto-fill),
//  * set country when the scenario needs it, clear only {@link scenario.assertInputId},
//  * then apply the Excel value for that field.
//  */
// async function applySellerCountrySubdivisionConditional(
//   invoice: UIInvoiceCreationManualPage,
//   scenario: CreateInvoiceSellerConditionalScenario
// ): Promise<void> {
//   const assertField = scenario.assertInputId;
//   const countryTransition = parseSellerCountryTransition(scenario.title);
//   const needsNonUaeCountry =
//     countryTransition != null ||
//     sellerCountryRequiresNonTinScheme(scenario.countryCode);
// 
//   if (countryTransition) {
//     await invoice.selectSellerElectronicAddressScheme(NON_UAE_TIN_SCHEME_LABEL);
//     await invoice.fillSellerBaseline(assertField);
//     const fromCountry = /^United Arab Emirates$/i.test(countryTransition.from)
//       ? /^United Arab Emirates$/i
//       : countryTransition.from;
//     await invoice.selectSellerCountry(fromCountry);
//     if (!isNonUaeCountryCode(countryTransition.from)) {
//       await invoice.selectSellerCountrySubdivision(DEFAULT_UAE_COUNTRY_SUBDIVISION);
//     }
//     await invoice.selectSellerElectronicAddressScheme(UAE_TIN_SCHEME_LABEL);
//     const toCountry = /^United Arab Emirates$/i.test(countryTransition.to)
//       ? /^United Arab Emirates$/i
//       : countryTransition.to;
//     if (!(await invoice.isSellerCountryLockedToUae())) {
//       await invoice.selectSellerCountry(toCountry);
//     }
//   } else if (needsNonUaeCountry && scenario.countryCode) {
//     await invoice.ensureSellerSchemeAllowsCountryChange(scenario.countryCode);
//     await invoice.fillSellerBaseline(assertField);
//   } else {
//     await invoice.fillSellerBaseline(assertField);
//   }
// 
//   if (scenario.countryCode && !countryTransition) {
//     if (sellerCountryRequiresNonTinScheme(scenario.countryCode)) {
//       await invoice.ensureSellerSchemeAllowsCountryChange(scenario.countryCode);
//     }
//     await invoice.selectSellerCountry(
//       /^United Arab Emirates$/i.test(scenario.countryCode)
//         ? /^United Arab Emirates$/i
//         : scenario.countryCode
//     );
//   }
// 
//   await prepareCountrySubdivisionFieldForScenario(
//     invoice,
//     assertField,
//     scenario.countrySubdivision
//   );
// 
//   if (scenario.countrySubdivision === undefined || isUiNullOrEmpty(scenario.countrySubdivision)) {
//     return;
//   }
//   await applyCountrySubdivisionUiValue(
//     invoice,
//     assertField,
//     scenario.countryCode,
//     scenario.countrySubdivision as string,
//     (label) => invoice.selectSellerCountrySubdivision(label)
//   );
// }
// 
// /**
//  * Buyer country/subdivision â€” same rules as seller: UAE â†’ emirates dropdown; other countries â†’ free text.
//  */
// async function applyBuyerCountrySubdivisionConditional(
//   invoice: UIInvoiceCreationManualPage,
//   scenario: CreateInvoiceBuyerConditionalScenario,
//   testKey: string
// ): Promise<void> {
//   const assertField = scenario.assertInputId;
//   const countryTransition = parseBuyerCountryTransition(scenario.title);
// 
//   if (countryTransition) {
//     await invoice.fillBuyerSectionBaseline(assertField, testKey);
//     const fromCountry = /^United Arab Emirates$/i.test(countryTransition.from)
//       ? /^United Arab Emirates$/i
//       : countryTransition.from;
//     await invoice.selectBuyerCountry(fromCountry);
//     if (!isNonUaeCountryCode(countryTransition.from)) {
//       await invoice.selectBuyerCountrySubdivision(DEFAULT_UAE_COUNTRY_SUBDIVISION);
//     }
//     const toCountry = /^United Arab Emirates$/i.test(countryTransition.to)
//       ? /^United Arab Emirates$/i
//       : countryTransition.to;
//     await invoice.selectBuyerCountry(toCountry);
//   } else {
//     await invoice.fillBuyerSectionBaseline(assertField, testKey);
//   }
// 
//   if (scenario.countryCode && !countryTransition) {
//     await invoice.selectBuyerCountry(
//       /^United Arab Emirates$/i.test(scenario.countryCode)
//         ? /^United Arab Emirates$/i
//         : scenario.countryCode
//     );
//   }
// 
//   await prepareCountrySubdivisionFieldForScenario(
//     invoice,
//     assertField,
//     scenario.countrySubdivision
//   );
// 
//   if (scenario.countrySubdivision === undefined || isUiNullOrEmpty(scenario.countrySubdivision)) {
//     return;
//   }
//   await applyCountrySubdivisionUiValue(
//     invoice,
//     assertField,
//     scenario.countryCode,
//     scenario.countrySubdivision as string,
//     (label) => invoice.selectBuyerCountrySubdivision(label)
//   );
// }
// 
// /**
//  * Deliver-to country/subdivision â€” UAE â†’ emirates dropdown; other countries â†’ free text.
//  */
// async function applyDeliverToCountrySubdivisionConditional(
//   invoice: UIInvoiceCreationManualPage,
//   scenario: CreateInvoiceDeliveryConditionalScenario
// ): Promise<void> {
//   const assertField = scenario.assertInputId;
// 
//   await invoice.fillDeliveryBaseline(assertField);
// 
//   if (scenario.countryCode) {
//     await invoice.selectDeliverToCountry(
//       /^United Arab Emirates$/i.test(scenario.countryCode)
//         ? /^United Arab Emirates$/i
//         : scenario.countryCode
//     );
//   }
// 
//   await prepareCountrySubdivisionFieldForScenario(
//     invoice,
//     assertField,
//     scenario.countrySubdivision
//   );
// 
//   if (scenario.countrySubdivision === undefined || isUiNullOrEmpty(scenario.countrySubdivision)) {
//     return;
//   }
//   await applyCountrySubdivisionUiValue(
//     invoice,
//     assertField,
//     scenario.countryCode,
//     scenario.countrySubdivision as string,
//     (label) => invoice.selectDeliverToCountrySubdivision(label)
//   );
// }
// 
// async function applySellerAuthorityConditional(
//   invoice: UIInvoiceCreationManualPage,
//   scenario: CreateInvoiceSellerConditionalScenario
// ): Promise<void> {
//   await invoice.openSellerEditor();
//   await invoice.fillSellerBaseline(["sellerAuthorityName"]);
//   await applySellerLegalRegIdTypeForScenario(invoice, scenario);
//   await applyAuthorityNameField(invoice, "sellerAuthorityName", scenario.authorityName);
// }
// 
// async function applySellerPassportCountryConditional(
//   invoice: UIInvoiceCreationManualPage,
//   scenario: CreateInvoiceSellerConditionalScenario
// ): Promise<void> {
//   await invoice.openSellerEditor();
//   await invoice.fillSellerBaseline(["sellerPassportCountry"]);
//   await applySellerLegalRegIdTypeForScenario(invoice, scenario);
//   await applyPassportCountryField(
//     invoice,
//     "sellerPassportCountry",
//     scenario.passportCountry,
//     (label) => invoice.selectSellerPassportCountry(label)
//   );
// }
// 
// async function applySellerConditional(
//   invoice: UIInvoiceCreationManualPage,
//   scenario: CreateInvoiceSellerConditionalScenario
// ): Promise<void> {
//   if (scenario.kind === "countrySubdivision") {
//     await invoice.openSellerEditor();
//     await applySellerCountrySubdivisionConditional(invoice, scenario);
//     return;
//   }
//   if (scenario.kind === "authority") {
//     await applySellerAuthorityConditional(invoice, scenario);
//     return;
//   }
//   if (scenario.kind === "passportCountry") {
//     await applySellerPassportCountryConditional(invoice, scenario);
//   }
// }
// 
// async function applyBuyerTextField(
//   invoice: UIInvoiceCreationManualPage,
//   inputId: string,
//   value: string | null | undefined,
//   entry: UiConditionalEntry = "create"
// ): Promise<void> {
//   if (value === undefined) {
//     return;
//   }
//   if (!(await invoice.hasBuyerInput(inputId))) {
//     return;
//   }
//   const prefilledEntry = entry === "edit" || entry === "copy";
//   if (value === null || isUiNullOrEmpty(value)) {
//     if (prefilledEntry) {
//       await invoice.replaceInputById(inputId, "");
//     } else {
//       await invoice.clearInputByIdIfNotEmpty(inputId);
//     }
//     return;
//   }
//   if (prefilledEntry) {
//     await invoice.replaceInputById(inputId, value);
//     return;
//   }
//   await invoice.fillInputById(inputId, value);
// }
// 
// async function applyBuyerLegalRegIdTypeField(
//   invoice: UIInvoiceCreationManualPage,
//   legalRegIdType: string | null | undefined
// ): Promise<void> {
//   if (legalRegIdType === undefined) {
//     return;
//   }
//   if (!(await invoice.hasBuyerInput("legalRegIdType"))) {
//     return;
//   }
//   if (legalRegIdType == null || isUiNullOrEmpty(legalRegIdType)) {
//     await invoice.clearAutocompleteById("legalRegIdType");
//     return;
//   }
//   const trimmedType = legalRegIdType.trim();
//   if (trimmedType === BUYER_LEGAL_REG_TYPE_INVALID_OTHER) {
//     await invoice.clearAutocompleteById("legalRegIdType");
//     await invoice.fillAutocompleteById("legalRegIdType", trimmedType);
//     return;
//   }
//   await invoice.selectBuyerLegalRegIdType(trimmedType);
// }
// 
// async function applyBuyerLegalRegScheme0235Transition(
//   invoice: UIInvoiceCreationManualPage,
//   scenario: CreateInvoiceBuyerConditionalScenario,
//   entry: UiConditionalEntry = "create"
// ): Promise<boolean> {
//   if (scenario.kind !== "legalRegScheme0235" || !scenario.electronicAddressScheme) {
//     return false;
//   }
// 
//   const electronicAddress =
//     scenario.electronicAddress === undefined
//       ? BUYER_ELECTRONIC_ADDRESS_REQUIRES_LEGAL_REG
//       : scenario.electronicAddress;
// 
//   if (/Changed From Other To 0235/i.test(scenario.title)) {
//     await applyUiAutocompleteDropdownValue(
//       invoice,
//       "electronicAddressScheme",
//       OTHER_SCHEME_IDENTIFIER,
//       (label) => invoice.selectBuyerElectronicAddressScheme(label)
//     );
//     await applyBuyerTextField(invoice, "electronicAddress", electronicAddress, entry);
//     await applyBuyerTextField(invoice, "legalRegId", "", entry);
//     await applyUiAutocompleteDropdownValue(
//       invoice,
//       "electronicAddressScheme",
//       scenario.electronicAddressScheme,
//       (label) => invoice.selectBuyerElectronicAddressScheme(label)
//     );
//     await applyBuyerTextField(invoice, "electronicAddress", electronicAddress, entry);
//     await applyBuyerTextField(invoice, "legalRegId", scenario.legalRegId, entry);
//     await applyBuyerLegalRegIdTypeField(invoice, scenario.legalRegIdType);
//     return true;
//   }
// 
//   if (/Changed From 1XXXXXXXXX To Other/i.test(scenario.title)) {
//     await applyUiAutocompleteDropdownValue(
//       invoice,
//       "electronicAddressScheme",
//       scenario.electronicAddressScheme,
//       (label) => invoice.selectBuyerElectronicAddressScheme(label)
//     );
//     await applyBuyerTextField(invoice, "electronicAddress", BUYER_ELECTRONIC_ADDRESS_1_PATTERN, entry);
//     await applyBuyerTextField(invoice, "legalRegId", "", entry);
//     await applyBuyerTextField(invoice, "electronicAddress", electronicAddress, entry);
//     await applyBuyerTextField(invoice, "legalRegId", scenario.legalRegId, entry);
//     await applyBuyerLegalRegIdTypeField(invoice, scenario.legalRegIdType);
//     return true;
//   }
// 
//   return false;
// }
// 
// async function applyBuyerDependencyConditional(
//   invoice: UIInvoiceCreationManualPage,
//   scenario: CreateInvoiceBuyerConditionalScenario,
//   testKey: string,
//   entry: UiConditionalEntry = "create"
// ): Promise<void> {
//   const dependencyKinds = new Set([
//     "schemeIdentifier",
//     "legalRegType",
//     "electronicAddressScheme",
//     "legalRegTypeExcel",
//     "legalRegScheme0235",
//   ]);
//   if (!dependencyKinds.has(scenario.kind)) {
//     return;
//   }
// 
//   const exclude = new Set([
//     "schemeIdentifier",
//     "identifier",
//     "legalRegIdType",
//     "legalRegId",
//     "electronicAddressScheme",
//     "electronicAddress",
//   ]);
//   await invoice.fillBuyerConditionalBaseline(exclude, testKey, {
//     skipConditionalDependencies: true,
//   });
// 
//   if (await applyBuyerLegalRegScheme0235Transition(invoice, scenario, entry)) {
//     return;
//   }
// 
//   if (scenario.schemeIdentifier) {
//     await applyUiAutocompleteDropdownValue(
//       invoice,
//       "schemeIdentifier",
//       scenario.schemeIdentifier,
//       (label) => invoice.selectBuyerSchemeIdentifier(label)
//     );
//   }
//   const changedElectronicAddressSchemeFromOtherToUaeTin =
//     scenario.kind === "legalRegTypeExcel" &&
//     /Changed from Other to UAE Tax Identification Number/i.test(scenario.title) &&
//     Boolean(scenario.electronicAddressScheme);
//   if (changedElectronicAddressSchemeFromOtherToUaeTin) {
//     await applyUiAutocompleteDropdownValue(
//       invoice,
//       "electronicAddressScheme",
//       OTHER_SCHEME_IDENTIFIER,
//       (label) => invoice.selectBuyerElectronicAddressScheme(label)
//     );
//   }
//   if (scenario.electronicAddressScheme) {
//     await applyUiAutocompleteDropdownValue(
//       invoice,
//       "electronicAddressScheme",
//       scenario.electronicAddressScheme,
//       (label) => invoice.selectBuyerElectronicAddressScheme(label)
//     );
//   }
// 
//   if (
//     scenario.kind === "legalRegTypeExcel" ||
//     scenario.kind === "legalRegScheme0235" ||
//     scenario.legalRegIdType !== undefined
//   ) {
//     await applyBuyerLegalRegIdTypeField(invoice, scenario.legalRegIdType);
//   }
// 
//   await invoice.fillBuyerConditionalDependencyFields(exclude);
// 
//   await applyBuyerTextField(invoice, "identifier", scenario.buyerIdentifier, entry);
//   await applyBuyerTextField(invoice, "legalRegId", scenario.legalRegId, entry);
//   if (
//     scenario.kind === "legalRegTypeExcel" &&
//     scenario.electronicAddress === undefined &&
//     scenario.electronicAddressScheme
//   ) {
//     await applyBuyerTextField(
//       invoice,
//       "electronicAddress",
//       BUYER_ELECTRONIC_ADDRESS_REQUIRES_LEGAL_REG,
//       entry
//     );
//   } else {
//     await applyBuyerTextField(invoice, "electronicAddress", scenario.electronicAddress, entry);
//   }
// }
// 
// /** Persist document txn type â€” buyer Beneficiary ID (BTUAE-01) rules apply only after document Save. */
// async function applyDocumentTransactionTypeAndSave(
//   invoice: UIInvoiceCreationManualPage,
//   txnLabel: string | RegExp
// ): Promise<void> {
//   const wasViewMode = await invoice.isDocumentViewMode();
//   await invoice.ensureDocumentEditable();
//   if (!wasViewMode) {
//     await invoice.fillDocumentBaseline(["invTxnType"]);
//   }
//   await invoice.selectDocumentTransactionType(txnLabel);
//   await invoice.clickDocumentSave();
//   await invoice.expectDocumentViewMode();
// }
// 
// async function applyBuyerBeneficiaryFtzConditional(
//   invoice: UIInvoiceCreationManualPage,
//   scenario: CreateInvoiceBuyerConditionalScenario,
//   testKey: string
// ): Promise<void> {
//   const changedFromOtherToFtz =
//     /Changed from Other to .*Free Trade Zone/i.test(scenario.title) &&
//     scenario.invoiceTransactionTypeCode;
//   const changedFromFtzToOther =
//     /Changed from .*Free Trade Zone to Other/i.test(scenario.title) &&
//     scenario.invoiceTransactionTypeCode;
//   if (changedFromOtherToFtz) {
//     await applyDocumentTransactionTypeAndSave(
//       invoice,
//       INVOICE_TRANSACTION_TYPE_CODE_BENEFICIARY_OPTIONAL
//     );
//   }
//   if (changedFromFtzToOther) {
//     await applyDocumentTransactionTypeAndSave(
//       invoice,
//       INVOICE_TRANSACTION_TYPE_CODE_FREE_TRADE_ZONE
//     );
//   }
//   if (scenario.invoiceTransactionTypeCode) {
//     await applyDocumentTransactionTypeAndSave(
//       invoice,
//       scenario.invoiceTransactionTypeCode
//     );
//   }
// 
//   await invoice.openBuyerEditor();
//   await invoice.fillBuyerSectionBaseline("beneficiaryId", testKey);
//   await applyBeneficiaryIdField(invoice, scenario.beneficiaryId);
// }
// 
// async function applyBuyerAuthorityConditional(
//   invoice: UIInvoiceCreationManualPage,
//   scenario: CreateInvoiceBuyerConditionalScenario,
//   testKey: string
// ): Promise<void> {
//   await invoice.openBuyerEditor();
//   await invoice.fillBuyerSectionBaseline("authorityName", testKey);
//   await applyBuyerLegalRegIdTypeForScenario(invoice, scenario);
//   await applyAuthorityNameField(invoice, "authorityName", scenario.authorityName);
// }
// 
// async function applyBuyerPassportCountryConditional(
//   invoice: UIInvoiceCreationManualPage,
//   scenario: CreateInvoiceBuyerConditionalScenario,
//   testKey: string
// ): Promise<void> {
//   await invoice.openBuyerEditor();
//   await invoice.fillBuyerSectionBaseline("passportCountry", testKey);
//   await applyBuyerLegalRegIdTypeForScenario(invoice, scenario);
//   await applyPassportCountryField(
//     invoice,
//     "passportCountry",
//     scenario.passportCountry,
//     (label) => invoice.selectBuyerPassportCountry(label)
//   );
// }
// 
// async function applyBuyerConditional(
//   invoice: UIInvoiceCreationManualPage,
//   scenario: CreateInvoiceBuyerConditionalScenario,
//   testKey: string,
//   entry: UiConditionalEntry = "create"
// ): Promise<void> {
//   if (scenario.kind === "beneficiaryFtz") {
//     await applyBuyerBeneficiaryFtzConditional(invoice, scenario, testKey);
//     return;
//   }
// 
//   if (scenario.kind === "countrySubdivision") {
//     await invoice.openBuyerEditor();
//     await applyBuyerCountrySubdivisionConditional(invoice, scenario, testKey);
//     return;
//   }
// 
//   const dependencyKinds = new Set([
//     "schemeIdentifier",
//     "legalRegType",
//     "electronicAddressScheme",
//     "legalRegTypeExcel",
//     "legalRegScheme0235",
//   ]);
//   if (dependencyKinds.has(scenario.kind)) {
//     await invoice.openBuyerEditor();
//     await applyBuyerDependencyConditional(invoice, scenario, testKey, entry);
//     return;
//   }
// 
//   if (scenario.kind === "authority") {
//     await applyBuyerAuthorityConditional(invoice, scenario, testKey);
//     return;
//   }
// 
//   if (scenario.kind === "passportCountry") {
//     await applyBuyerPassportCountryConditional(invoice, scenario, testKey);
//   }
// }
// 
// async function applyDeliveryConditional(
//   invoice: UIInvoiceCreationManualPage,
//   scenario: CreateInvoiceDeliveryConditionalScenario
// ): Promise<void> {
//   await invoice.openDeliveryEditor();
// 
//   if (scenario.kind === "countrySubdivision") {
//     await applyDeliverToCountrySubdivisionConditional(invoice, scenario);
//     return;
//   }
// 
//   await invoice.fillDeliveryBaseline();
// }
// 
// async function applyPaymentDueDateForScenario(
//   invoice: UIInvoiceCreationManualPage,
//   paymentDueDate: string,
//   entry: UiConditionalEntry = "create"
// ): Promise<void> {
//   const raw = paymentDueDate ?? "";
//   const trimmed = raw.trim();
//   const issueIso = await invoice.readDocumentIssueDateIso();
//   const prefilledEntry = entry === "edit" || entry === "copy";
// 
//   /** Copy/Edit open with a source payment due date â€” clear only when a value is still present. */
//   async function clearPrefilledPaymentDueIfNeeded(): Promise<void> {
//     const current = await invoice.readDocumentDateFieldIso("paymentDueDate");
//     if (current) {
//       await invoice.clearDocumentDateById("paymentDueDate");
//     }
//   }
// 
//   if (trimmed === "" && raw === "") {
//     if (prefilledEntry) {
//       await clearPrefilledPaymentDueIfNeeded();
//       await invoice.setDocumentDateHiddenValue("paymentDueDate", "");
//     } else {
//       await invoice.clearDocumentDateById("paymentDueDate");
//     }
//     await invoice.touchDocumentDateFieldForValidation("paymentDueDate");
//     return;
//   }
// 
//   if (trimmed === "" && raw !== "") {
//     if (prefilledEntry) {
//       await clearPrefilledPaymentDueIfNeeded();
//     } else {
//       await invoice.clearDocumentDateById("paymentDueDate");
//     }
//     await invoice.setDocumentDateHiddenValue("paymentDueDate", raw);
//     await invoice.touchDocumentDateFieldForValidation("paymentDueDate");
//     return;
//   }
// 
//   const resolved = resolveUiPaymentDueDate(raw, issueIso);
//   const resolvedIso = parseUiDateToIso(resolved);
//   if (!resolvedIso || !isValidCalendarIsoDate(resolvedIso)) {
//     await invoice.setDocumentDateHiddenValue("paymentDueDate", resolved);
//     await invoice.touchDocumentDateFieldForValidation("paymentDueDate");
//     return;
//   }
// 
//   await invoice.fillDocumentDateById("paymentDueDate", resolvedIso);
//   await invoice.expectDocumentDateFieldValue("paymentDueDate", resolvedIso);
// }
// 
// /** Sets document type/txn, saves, then opens payment â€” selects means type so due-date rules can be isolated. */
// async function applyPaymentConditional(
//   invoice: UIInvoiceCreationManualPage,
//   scenario: CreateInvoicePaymentConditionalScenario,
//   entry: UiConditionalEntry = "create"
// ): Promise<void> {
//   await invoice.ensureDocumentEditable();
//   await invoice.fillDocumentBaseline(["invType", "invTxnType"]);
//   await invoice.selectDocumentInvoiceType(scenario.invoiceTypeCode);
//   if (isUiCreditNoteInvoiceType(scenario.invoiceTypeCode)) {
//     await invoice.selectDocumentCreditNoteReason(UI_CREDIT_NOTE_REASON_VOLUME_DISCOUNT);
//   }
//   await invoice.selectDocumentTransactionType(scenario.invoiceTransactionTypeCode);
//   await invoice.clickDocumentSave();
// 
//   await expect
//     .poll(async () => invoice.isDocumentViewMode(), { timeout: 30_000 })
//     .toBe(true);
// 
//   await invoice.openPaymentEditor();
//   if (await invoice.hasCreateInvoiceInput("paymentMeansTypeCode")) {
//     await invoice.selectPaymentMeansTypeCode("In cash");
//   }
//   await invoice.fillPaymentBaseline("paymentDueDate");
//   await applyPaymentDueDateForScenario(invoice, scenario.paymentDueDate, entry);
// }
// 
// async function applyItemConditional(
//   invoice: UIInvoiceCreationManualPage,
//   scenario: CreateInvoiceItemConditionalScenario
// ): Promise<void> {
//   await invoice.openItemEditor();
//   await invoice.fillItemFieldsForType(
//     scenario.itemType,
//     {
//       classificationScheme: scenario.classificationScheme,
//       classificationIdentifier: scenario.classificationIdentifier,
//       serviceAccCode: scenario.serviceAccCode,
//     },
//     scenario.assertInputId
//   );
// 
//   if (
//     scenario.classificationScheme === undefined &&
//     scenario.classificationIdentifier
//   ) {
//     await invoice.selectClassificationScheme(DEFAULT_UI_MASTER_CLASSIFICATION_SCHEME);
//   }
// }
// 
// async function assertConditionalResult(
//   invoice: UIInvoiceCreationManualPage,
//   assertInputId: string,
//   shouldError: boolean
// ): Promise<void> {
//   if (shouldError) {
//     if (
//       assertInputId === "paymentDueDate" &&
//       (await invoice.hasCreateInvoiceInput("paymentMeansTypeCode"))
//     ) {
//       await invoice.expectInputNoValidationError("paymentMeansTypeCode");
//     }
//     await invoice.expectInputValidationError(assertInputId);
//   } else {
//     // Some conditional fields are intentionally disabled (or absent) for certain upstream selections
//     // (e.g. Authority Name / Passport Issuing Country based on Legal Registration Identifier Type).
//     // In those cases we treat the scenario as "accepted" and avoid asserting `aria-invalid` on a
//     // non-actionable control.
//     if (!(await invoice.isFormInputEnabled(assertInputId))) {
//       return;
//     }
//     await invoice.expectInputNoValidationError(assertInputId);
//   }
// }
// 
// /** Create UI treats empty payment due on Standard Invoice as optional; Copy/Edit use Excel `shouldError`. */
// export function effectiveConditionalShouldError(
//   scenario: CreateInvoiceConditionalScenario,
//   entry: UiConditionalEntry = "create"
// ): boolean {
//   if ((entry === "edit" || entry === "copy") && scenario.section === "payment") {
//     const payment = scenario as CreateInvoicePaymentConditionalScenario;
//     const excel = PAYMENT_DUE_DATE_SCENARIOS.find(
//       (row) =>
//         uiPaymentDueScenarioTitle(row.title, row.paymentDueDate) === payment.title
//     );
//     return excel?.shouldError ?? payment.shouldError;
//   }
//   return scenario.shouldError;
// }
// 
// export async function runUiInvoiceCreationConditionalScenario(
//   page: Page,
//   scenario: CreateInvoiceConditionalScenario,
//   options?: { entry?: UiConditionalEntry }
// ): Promise<void> {
//   const entry = options?.entry ?? "create";
//   const invoiceTypeCode =
//     "invoiceTypeCode" in scenario ? scenario.invoiceTypeCode : undefined;
//   const baseline =
//     (entry === "edit" || entry === "copy") && scenario.section === "payment"
//       ? {
//           forceUpload: true as const,
//           invoiceTypeCode: invoiceTypeCode ?? "Commercial Invoice",
//         }
//       : invoiceTypeCode
//         ? { invoiceTypeCode }
//         : undefined;
//   const invoice = await openInvoiceForConditionalFlow(page, entry, baseline);
//   await runUiInvoiceConditionalScenarioOnInvoice(invoice, scenario, entry);
// }
// 
// export async function runUiInvoiceConditionalScenarioOnInvoice(
//   invoice: UIInvoiceCreationManualPage,
//   scenario: CreateInvoiceConditionalScenario,
//   entry: UiConditionalEntry = "create"
// ): Promise<void> {
//   const shouldError = effectiveConditionalShouldError(scenario, entry);
//   switch (scenario.section) {
//     case "document":
//       await applyDocumentConditional(invoice, scenario);
//       break;
//     case "seller":
//       await applySellerConditional(invoice, scenario);
//       break;
//     case "buyer":
//       await applyBuyerConditional(invoice, scenario, scenario.title, entry);
//       break;
//     case "delivery":
//       await applyDeliveryConditional(invoice, scenario);
//       break;
//     case "payment":
//       await applyPaymentConditional(invoice, scenario, entry);
//       break;
//     case "item":
//       await applyItemConditional(invoice, scenario);
//       break;
//     default:
//       return;
//   }
// 
//   if (scenario.section === "document") {
//     if (!shouldError) {
//       if (scenario.kind === "invoicingPeriod") {
//         await assertInvoicingPeriodBeforeDocumentSave(invoice, scenario);
//       } else if (!assertUiFieldStateAfterSectionSave(entry)) {
//         await invoice.expectInputNoValidationError(scenario.assertInputId);
//       }
//     }
//     await invoice.clickDocumentSave();
//     if (shouldError) {
//       await assertConditionalResult(invoice, scenario.assertInputId, true);
//     } else {
//       await expect
//         .poll(async () => invoice.isDocumentViewMode(), { timeout: 30_000 })
//         .toBe(true);
//       await invoice.expectDocumentViewMode();
//       if (assertUiFieldStateAfterSectionSave(entry)) {
//         if (scenario.kind === "invoicingPeriod") {
//           await invoice.ensureDocumentEditable();
//           await invoice.expectInputNoValidationError("invStartDate");
//           await invoice.expectInputNoValidationError("invEndDate");
//         } else {
//           await invoice.expectInputNoValidationError(scenario.assertInputId);
//         }
//       }
//       await submitCopyInvoiceAfterSuccessIfNeeded(invoice, entry, shouldError);
//     }
//     return;
//   }
// 
//   if (
//     scenario.section === "payment" &&
//     !shouldError &&
//     !assertUiFieldStateAfterSectionSave(entry)
//   ) {
//     const issueIso = await invoice.readDocumentIssueDateIso();
//     const dueIso = resolveUiPaymentDueDate(scenario.paymentDueDate, issueIso);
//     const dueIsoParsed = dueIso ? parseUiDateToIso(dueIso) : null;
//     if (dueIsoParsed) {
//       await invoice.expectDocumentDateFieldValue("paymentDueDate", dueIsoParsed);
//     }
//     await invoice.expectInputNoValidationError("paymentDueDate");
//   }
// 
//   await invoice.clickSectionSave(scenario.section);
//   if (
//     scenario.section === "payment" &&
//     !shouldError &&
//     assertUiFieldStateAfterSectionSave(entry)
//   ) {
//     await invoice.expectInputNoValidationError("paymentDueDate");
//   }
//   await assertConditionalResult(invoice, scenario.assertInputId, shouldError);
//   await submitCopyInvoiceAfterSuccessIfNeeded(invoice, entry, shouldError);
// }
