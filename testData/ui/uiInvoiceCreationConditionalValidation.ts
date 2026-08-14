// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under testData/ui/; executable code is commented out.
//
// /**
//  * Create Invoice manual UI — conditional validation aligned with Excel
//  * (`ConditionalValidation.ts` / Covoro conditional spec).
//  *
//  * **Edit Invoice UI** reuses these scenarios and `shouldError` values via the same helpers
//  * (`runUiInvoiceCreationConditionalScenario` with `{ entry: "edit" }`); only entry differs
//  * (upload → Options → Edit, **Update** instead of **Save**).
//  *
//  * **Excel safety:** Covoro Excel tests read `ConditionalValidation.ts` directly. UI may override
//  * `shouldError` only where Create Invoice behaviour differs (`uiInvoicingPeriodShouldError`).
//  *
//  * **Null / empty / whitespace (all Create Invoice UI):** Excel `null`, `""`, and whitespace-only
//  * strings are equivalent — use `resolveUiNullOrEmpty` → `undefined` (clear text inputs; skip
//  * autocomplete interaction). Assert with `isUiNullOrEmpty`.
//  *
//  * UI-only differences allowed here:
//  * - Drop scenarios the Create Invoice screen cannot run (`isUiInvoicingPeriodScenarioSupported`).
//  * - Remap titles for Playwright reports (`uiInvoicingPeriodScenarioTitle`).
//  * - Override `shouldError` when manual Create Invoice behaviour differs from Excel (see below).
//  * - Map Excel field names → DOM `assertInputId` / section.
//  *
//  * **Authority name (seller / buyer, Commercial/Trade License):**
//  * - Buyer search (**Prashant**) prefills `#authorityName`; null/empty/whitespace → clear before Save.
//  * - Buyer/seller **Save** is the inline section button (not `.form-footer`); use `clickSectionSave`.
//  */
//
// import type { CreateInvoiceSection } from "./uiInvoiceCreationFieldMinMax";
// import {
//   BUYER_AUTHORITY_SCENARIOS,
//   BUYER_COUNTRY_SUBDIVISION_SCENARIOS,
//   BUYER_PASSPORT_COUNTRY_SCENARIOS,
//   CREDIT_NOTE_REASON_CODE_CONDITIONAL_SCENARIOS,
//   DELIVER_TO_COUNTRY_SUBDIVISION_SCENARIOS,
//   EXCHANGE_RATE_SCENARIOS,
//   FREE_TRADE_ZONE_BENEFICIARY_SCENARIOS,
//   INVOICE_TYPE_VS_TRANSACTION_TYPE_CONDITIONAL_SCENARIOS,
//   INVOICING_PERIOD_CONDITIONAL_SCENARIOS,
//   INVOICING_PERIOD_END_DATE_FIELD,
//   INVOICING_PERIOD_START_DATE_FIELD,
//   type InvoicingPeriodConditionalScenario,
//   PAYMENT_DUE_DATE_SCENARIOS,
//   SELLER_AUTHORITY_SCENARIOS,
//   SELLER_COUNTRY_SUBDIVISION_SCENARIOS,
//   SELLER_PASSPORT_COUNTRY_SCENARIOS,
// } from "../FieldValidations/ConditionalValidation";
// import {
//   UI_MASTER_ITEM_CONDITIONAL_SCENARIOS,
//   type UiMasterItemConditionalScenario,
// } from "./uiMasterConditionalValidation";
// import { CREATE_INVOICE_BUYER_DEPENDENCY_CONDITIONAL_SCENARIOS } from "./uiInvoiceCreationBuyerConditionalValidation";
// import {
//   uiInvoicingPeriodScenarioTitle,
//   uiInvoicingPeriodShouldError,
//   isUiPaymentDueScenarioSupported,
//   uiPaymentDueScenarioTitle,
//   uiPaymentDueShouldError,
// } from "./uiInvoiceCreationDocumentDates";
// import {
//   isUiNullOrEmpty,
//   resolveUiNullOrEmpty,
// } from "./uiInvoiceCreationNullEmpty";
//
// export type { UiMasterItemConditionalScenario };
// export {
//   isUiEmptyOrWhitespace,
//   isUiNullOrEmpty,
//   resolveUiNullOrEmpty,
//   resolveUiWhitespaceAsNull,
// } from "./uiInvoiceCreationNullEmpty";
//
// /**
//  * IBG-14 / BTUAE-002: **Invoicing period start date** and **Invoicing period end date** are required when
//  * **Invoice transaction type code** is Summary Invoice (XXX1XXXX); otherwise optional on Create Invoice UI.
//  * UI fields: `#invStartDate`, `#invEndDate`, `#invType`, `#invTxnType`.
//  *
//  * **Document dates (manual UI):** `#invIssueDate` (defaults to today), `#invStartDate`, `#invEndDate`,
//  * `#paymentDueDate` — filled via MUI calendar (`Choose date` → **Next month** → day). Period Excel
//  * anchors map to **1st of month** after issue; payment due `__FUTURE_3_DAYS__` = issue + 3 days.
//  * See `uiInvoiceCreationDocumentDates.ts`.
//  */
// export const CREATE_INVOICE_INVOICING_PERIOD_RULE =
//   "Invoicing period [IBG-14] is MUST for Summary Invoice transaction type (BTUAE-002 / XXX1XXXX); optional for other transaction types";
//
// /**
//  * Authority name when legal reg type is Commercial/Trade License (seller + buyer).
//  * Null, empty, and whitespace-only are treated as empty (required on Save when Not Allowed).
//  */
// export const CREATE_INVOICE_AUTHORITY_NAME_RULE =
//   "Authority name is required for Commercial/Trade License; null, empty, and whitespace-only count as empty";
//
// /** Create Invoice DOM `id`s for conditional controls (document section from UI HTML). */
// export const CREATE_INVOICE_CONDITIONAL_INPUT_IDS = {
//   invCurrCode: "invCurrCode",
//   currExchangeRate: "currExchangeRate",
//   invType: "invType",
//   invTxnType: "invTxnType",
//   creditNoteRsn: "creditNoteRsn",
//   invStartDate: "invStartDate",
//   invEndDate: "invEndDate",
//   sellerLegalRegIdType: "sellerLegalRegIdType",
//   sellerAuthorityName: "sellerAuthorityName",
//   sellerPassportCountry: "sellerPassportCountry",
//   sellerCountryCode: "sellerCountryCode",
//   sellerCountrySubdivision: "sellerCountrySubdivision",
//   legalRegIdType: "legalRegIdType",
//   legalRegId: "legalRegId",
//   schemeIdentifier: "schemeIdentifier",
//   identifier: "identifier",
//   electronicAddressScheme: "electronicAddressScheme",
//   electronicAddress: "electronicAddress",
//   authorityName: "authorityName",
//   passportCountry: "passportCountry",
//   countryCode: "countryCode",
//   countrySubdivision: "countrySubdivision",
//   beneficiaryId: "beneficiaryId",
//   deliverToCountryCode: "deliverToCountryCode",
//   deliverToCountrySubdivision: "deliverToCountrySubdivision",
//   paymentDueDate: "paymentDueDate",
// } as const;
//
// function resolveAuthorityName(raw: string): string {
//   const token = raw.trim().toUpperCase();
//   if (token === "__LEN_300__") return "A".repeat(300);
//   if (token === "__LEN_301__") return "A".repeat(301);
//   return raw;
// }
//
// function resolveUiAuthorityName(raw: string): string | undefined {
//   return resolveUiNullOrEmpty(resolveAuthorityName(raw));
// }
//
// export type CreateInvoiceConditionalScenarioBase = {
//   title: string;
//   section: CreateInvoiceSection;
//   shouldError: boolean;
//   assertInputId: string;
// };
//
// export type CreateInvoiceDocumentConditionalScenario = CreateInvoiceConditionalScenarioBase & {
//   section: "document";
//   kind: "exchangeRate" | "invoiceTypeVsTxn" | "creditNoteReason" | "invoicingPeriod";
//   invoiceCurrencyCode?: string;
//   exchangeRate?: string;
//   invoiceTypeCode?: string;
//   invoiceTransactionTypeCode?: string;
//   creditNoteReasonCode?: string | null;
//   invoicingPeriodStartDate?: string;
//   invoicingPeriodEndDate?: string;
// };
//
// export type CreateInvoiceSellerConditionalScenario = CreateInvoiceConditionalScenarioBase & {
//   section: "seller";
//   kind: "authority" | "passportCountry" | "countrySubdivision";
//   legalRegIdType?: string;
//   authorityName?: string | null;
//   passportCountry?: string | null;
//   countryCode?: string;
//   countrySubdivision?: string | null;
// };
//
// export type CreateInvoiceBuyerConditionalScenario = CreateInvoiceConditionalScenarioBase & {
//   section: "buyer";
//   kind:
//     | "authority"
//     | "passportCountry"
//     | "countrySubdivision"
//     | "beneficiaryFtz"
//     | "schemeIdentifier"
//     | "legalRegType"
//     | "electronicAddressScheme"
//     | "legalRegTypeExcel"
//     | "legalRegScheme0235";
//   /** `schemeIdentifier` dropdown (buyer party id scheme). */
//   schemeIdentifier?: string;
//   buyerIdentifier?: string | null;
//   legalRegIdType?: string | null;
//   legalRegId?: string | null;
//   /** `Buyer electronic address Scheme` on Create Invoice (`electronicAddressScheme`). */
//   electronicAddressScheme?: string;
//   electronicAddress?: string | null;
//   authorityName?: string | null;
//   passportCountry?: string | null;
//   countryCode?: string;
//   countrySubdivision?: string | null;
//   invoiceTransactionTypeCode?: string;
//   beneficiaryId?: string;
// };
//
// export type CreateInvoiceDeliveryConditionalScenario = CreateInvoiceConditionalScenarioBase & {
//   section: "delivery";
//   kind: "countrySubdivision";
//   countryCode?: string;
//   countrySubdivision?: string | null;
// };
//
// export type CreateInvoicePaymentConditionalScenario = CreateInvoiceConditionalScenarioBase & {
//   section: "payment";
//   kind: "paymentDueDate";
//   invoiceTypeCode: string;
//   invoiceTransactionTypeCode: string;
//   paymentDueDate: string;
// };
//
// export type CreateInvoiceItemConditionalScenario = UiMasterItemConditionalScenario & {
//   section: "item";
// };
//
// export type CreateInvoiceConditionalScenario =
//   | CreateInvoiceDocumentConditionalScenario
//   | CreateInvoiceSellerConditionalScenario
//   | CreateInvoiceBuyerConditionalScenario
//   | CreateInvoiceDeliveryConditionalScenario
//   | CreateInvoicePaymentConditionalScenario
//   | CreateInvoiceItemConditionalScenario;
//
// const DOCUMENT_EXCHANGE_SCENARIOS: CreateInvoiceDocumentConditionalScenario[] =
//   EXCHANGE_RATE_SCENARIOS.map((s) => ({
//     title: s.title,
//     section: "document" as const,
//     kind: "exchangeRate" as const,
//     invoiceCurrencyCode: s.invoiceCurrencyCode,
//     exchangeRate: s.exchangeRate,
//     shouldError: s.shouldError,
//     assertInputId: CREATE_INVOICE_CONDITIONAL_INPUT_IDS.currExchangeRate,
//   }));
//
// const DOCUMENT_INV_TYPE_TXN_SCENARIOS: CreateInvoiceDocumentConditionalScenario[] =
//   INVOICE_TYPE_VS_TRANSACTION_TYPE_CONDITIONAL_SCENARIOS.map((s) => ({
//     title: s.title,
//     section: "document" as const,
//     kind: "invoiceTypeVsTxn" as const,
//     invoiceTypeCode: s.invoiceTypeCode,
//     invoiceTransactionTypeCode: s.invoiceTransactionTypeCode,
//     shouldError: s.shouldError,
//     assertInputId: CREATE_INVOICE_CONDITIONAL_INPUT_IDS.invTxnType,
//   }));
//
// const DOCUMENT_CREDIT_NOTE_SCENARIOS: CreateInvoiceDocumentConditionalScenario[] =
//   CREDIT_NOTE_REASON_CODE_CONDITIONAL_SCENARIOS.map((s) => ({
//     title: s.title,
//     section: "document" as const,
//     kind: "creditNoteReason" as const,
//     invoiceTypeCode: s.invoiceTypeCode,
//     creditNoteReasonCode: s.creditNoteReasonCode,
//     shouldError: s.shouldError,
//     assertInputId: CREATE_INVOICE_CONDITIONAL_INPUT_IDS.creditNoteRsn,
//   }));
//
// /** Excel-only: end before start uses fixed dates; MUI calendar only allows period dates on/after issue date. */
// function isUiInvoicingPeriodScenarioSupported(s: InvoicingPeriodConditionalScenario): boolean {
//   if (/End Date Earlier Than Start Date/i.test(s.title)) {
//     return false;
//   }
//   return true;
// }
//
// function resolveUiInvoicingPeriodAssertInputId(
//   scenario: InvoicingPeriodConditionalScenario
// ): string {
//   if (scenario.expectedErrorField === INVOICING_PERIOD_END_DATE_FIELD) {
//     return CREATE_INVOICE_CONDITIONAL_INPUT_IDS.invEndDate;
//   }
//   if (scenario.expectedErrorField === INVOICING_PERIOD_START_DATE_FIELD) {
//     return CREATE_INVOICE_CONDITIONAL_INPUT_IDS.invStartDate;
//   }
//   const start = scenario.invoicingPeriodStartDate.trim();
//   const end = scenario.invoicingPeriodEndDate.trim();
//   if (start !== "" && end === "") {
//     return CREATE_INVOICE_CONDITIONAL_INPUT_IDS.invEndDate;
//   }
//   if (start === "" && end !== "") {
//     return CREATE_INVOICE_CONDITIONAL_INPUT_IDS.invStartDate;
//   }
//   return CREATE_INVOICE_CONDITIONAL_INPUT_IDS.invStartDate;
// }
//
// export const CREATE_INVOICE_INVOICING_PERIOD_CONDITIONAL_SCENARIOS: CreateInvoiceDocumentConditionalScenario[] =
//   INVOICING_PERIOD_CONDITIONAL_SCENARIOS.filter(isUiInvoicingPeriodScenarioSupported).map((s) => ({
//     title: uiInvoicingPeriodScenarioTitle(
//       s.title,
//       s.invoicingPeriodStartDate,
//       s.invoicingPeriodEndDate
//     ),
//     section: "document" as const,
//     kind: "invoicingPeriod" as const,
//     invoiceTypeCode: s.invoiceTypeCode,
//     invoiceTransactionTypeCode: s.invoiceTransactionTypeCode,
//     invoicingPeriodStartDate: s.invoicingPeriodStartDate,
//     invoicingPeriodEndDate: s.invoicingPeriodEndDate,
//     shouldError: uiInvoicingPeriodShouldError(s),
//     assertInputId: resolveUiInvoicingPeriodAssertInputId(s),
//   }));
//
// const SELLER_CONDITIONAL_SCENARIOS: CreateInvoiceSellerConditionalScenario[] = [
//   ...SELLER_AUTHORITY_SCENARIOS.map((s) => ({
//     title: s.title,
//     section: "seller" as const,
//     kind: "authority" as const,
//     legalRegIdType: s.sellerLegalRegistrationIdentifierType,
//     authorityName: resolveUiAuthorityName(s.sellerAuthorityName),
//     shouldError: s.shouldError,
//     assertInputId: CREATE_INVOICE_CONDITIONAL_INPUT_IDS.sellerAuthorityName,
//   })),
//   ...SELLER_PASSPORT_COUNTRY_SCENARIOS.map((s) => ({
//     title: s.title,
//     section: "seller" as const,
//     kind: "passportCountry" as const,
//     legalRegIdType: s.sellerLegalRegistrationIdentifierType,
//     passportCountry: resolveUiNullOrEmpty(s.passportIssuingCountryCode),
//     shouldError: s.shouldError,
//     assertInputId: CREATE_INVOICE_CONDITIONAL_INPUT_IDS.sellerPassportCountry,
//   })),
//   ...SELLER_COUNTRY_SUBDIVISION_SCENARIOS.map((s) => ({
//     title: s.title,
//     section: "seller" as const,
//     kind: "countrySubdivision" as const,
//     countryCode: s.sellerCountryCode,
//     countrySubdivision: resolveUiNullOrEmpty(s.sellerCountrySubdivision),
//     shouldError: s.shouldError,
//     assertInputId: CREATE_INVOICE_CONDITIONAL_INPUT_IDS.sellerCountrySubdivision,
//   })),
// ];
//
// const BUYER_CONDITIONAL_SCENARIOS: CreateInvoiceBuyerConditionalScenario[] = [
//   ...BUYER_AUTHORITY_SCENARIOS.map((s) => ({
//     title: s.title,
//     section: "buyer" as const,
//     kind: "authority" as const,
//     legalRegIdType: s.buyerLegalRegistrationIdentifierType,
//     authorityName: resolveUiAuthorityName(s.buyerAuthorityName),
//     shouldError: s.shouldError,
//     assertInputId: CREATE_INVOICE_CONDITIONAL_INPUT_IDS.authorityName,
//   })),
//   ...BUYER_PASSPORT_COUNTRY_SCENARIOS.map((s) => ({
//     title: s.title,
//     section: "buyer" as const,
//     kind: "passportCountry" as const,
//     legalRegIdType: s.buyerLegalRegistrationIdentifierType,
//     passportCountry: resolveUiNullOrEmpty(s.passportIssuingCountryCode),
//     shouldError: s.shouldError,
//     assertInputId: CREATE_INVOICE_CONDITIONAL_INPUT_IDS.passportCountry,
//   })),
//   ...BUYER_COUNTRY_SUBDIVISION_SCENARIOS.map((s) => ({
//     title: s.title,
//     section: "buyer" as const,
//     kind: "countrySubdivision" as const,
//     countryCode: s.buyerCountryCode,
//     countrySubdivision: resolveUiNullOrEmpty(s.buyerCountrySubdivision),
//     shouldError: s.shouldError,
//     assertInputId: CREATE_INVOICE_CONDITIONAL_INPUT_IDS.countrySubdivision,
//   })),
//   ...FREE_TRADE_ZONE_BENEFICIARY_SCENARIOS.map((s) => ({
//     title: s.title,
//     section: "buyer" as const,
//     kind: "beneficiaryFtz" as const,
//     invoiceTransactionTypeCode: s.invoiceTransactionTypeCode,
//     beneficiaryId: resolveUiNullOrEmpty(s.beneficiaryId),
//     shouldError: s.shouldError,
//     assertInputId: CREATE_INVOICE_CONDITIONAL_INPUT_IDS.beneficiaryId,
//   })),
//   ...CREATE_INVOICE_BUYER_DEPENDENCY_CONDITIONAL_SCENARIOS,
// ];
//
// const DELIVERY_CONDITIONAL_SCENARIOS: CreateInvoiceDeliveryConditionalScenario[] =
//   DELIVER_TO_COUNTRY_SUBDIVISION_SCENARIOS.map((s) => ({
//     title: s.title,
//     section: "delivery" as const,
//     kind: "countrySubdivision" as const,
//     countryCode: s.deliverToCountryCode,
//     countrySubdivision: resolveUiNullOrEmpty(s.deliverToCountrySubdivision),
//     shouldError: s.shouldError,
//     assertInputId: CREATE_INVOICE_CONDITIONAL_INPUT_IDS.deliverToCountrySubdivision,
//   }));
//
// const PAYMENT_CONDITIONAL_SCENARIOS: CreateInvoicePaymentConditionalScenario[] =
//   PAYMENT_DUE_DATE_SCENARIOS.filter(isUiPaymentDueScenarioSupported).map((s) => ({
//     title: uiPaymentDueScenarioTitle(s.title, s.paymentDueDate),
//     section: "payment" as const,
//     kind: "paymentDueDate" as const,
//     invoiceTypeCode: s.invoiceTypeCode,
//     invoiceTransactionTypeCode: s.invoiceTransactionTypeCode,
//     paymentDueDate: s.paymentDueDate,
//     shouldError: uiPaymentDueShouldError(s),
//     assertInputId: CREATE_INVOICE_CONDITIONAL_INPUT_IDS.paymentDueDate,
//   }));
//
// export const CREATE_INVOICE_ITEM_CONDITIONAL_SCENARIOS: CreateInvoiceItemConditionalScenario[] =
//   UI_MASTER_ITEM_CONDITIONAL_SCENARIOS.map((s) => ({ ...s, section: "item" as const }));
//
// const SCENARIOS_BY_SECTION: Record<CreateInvoiceSection, CreateInvoiceConditionalScenario[]> = {
//   document: [
//     ...DOCUMENT_EXCHANGE_SCENARIOS,
//     ...DOCUMENT_INV_TYPE_TXN_SCENARIOS,
//     ...DOCUMENT_CREDIT_NOTE_SCENARIOS,
//     ...CREATE_INVOICE_INVOICING_PERIOD_CONDITIONAL_SCENARIOS,
//   ],
//   seller: SELLER_CONDITIONAL_SCENARIOS,
//   buyer: BUYER_CONDITIONAL_SCENARIOS,
//   delivery: DELIVERY_CONDITIONAL_SCENARIOS,
//   item: CREATE_INVOICE_ITEM_CONDITIONAL_SCENARIOS,
//   invoice: [],
//   payment: PAYMENT_CONDITIONAL_SCENARIOS,
//   custom: [],
// };
//
// export function createInvoiceConditionalScenariosForSection(
//   section: CreateInvoiceSection
// ): readonly CreateInvoiceConditionalScenario[] {
//   return SCENARIOS_BY_SECTION[section];
// }
//
// export function isCreateInvoiceInvoicingPeriodScenario(
//   section: CreateInvoiceSection,
//   scenario: CreateInvoiceConditionalScenario
// ): scenario is CreateInvoiceDocumentConditionalScenario {
//   return (
//     section === "document" && "kind" in scenario && scenario.kind === "invoicingPeriod"
//   );
// }
//
// export function isCreateInvoiceAuthorityConditionalScenario(
//   scenario: CreateInvoiceConditionalScenario
// ): boolean {
//   return "kind" in scenario && scenario.kind === "authority";
// }
//
// export type CreateInvoiceConditionalScenarioGroups = {
//   invoicingPeriod: CreateInvoiceDocumentConditionalScenario[];
//   authority: CreateInvoiceConditionalScenario[];
//   other: CreateInvoiceConditionalScenario[];
// };
//
// export function groupCreateInvoiceConditionalScenariosBySection(
//   section: CreateInvoiceSection
// ): CreateInvoiceConditionalScenarioGroups {
//   const conditionalScenarios = createInvoiceConditionalScenariosForSection(section);
//   const invoicingPeriod =
//     section === "document"
//       ? conditionalScenarios.filter((s) =>
//           isCreateInvoiceInvoicingPeriodScenario(section, s)
//         )
//       : [];
//   const authority =
//     section === "seller" || section === "buyer"
//       ? conditionalScenarios.filter(isCreateInvoiceAuthorityConditionalScenario)
//       : [];
//   const other = conditionalScenarios.filter((s) => {
//     if (section === "document" && isCreateInvoiceInvoicingPeriodScenario(section, s)) {
//       return false;
//     }
//     if (
//       (section === "seller" || section === "buyer") &&
//       isCreateInvoiceAuthorityConditionalScenario(s)
//     ) {
//       return false;
//     }
//     return true;
//   });
//   return { invoicingPeriod, authority, other };
// }
//
