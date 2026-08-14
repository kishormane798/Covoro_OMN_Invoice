// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under testData/ui/; executable code is commented out.
//
// /**
//  * Create Invoice manual UI — buyer field dependencies (UI only).
//  *
//  * - `schemeIdentifier` selected → `identifier` required
//  * - `legalRegIdType` selected → `legalRegId` required
//  * - `electronicAddressScheme` selected → `electronicAddress` required
//  *
//  * Excel upload matrices (`BUYER_LEGAL_REG_TYPE_SCENARIOS`, `BUYER_LEGAL_REG_SCHEME_0235_SCENARIOS`)
//  * are remapped here to Create Invoice DOM ids (not re-used for Excel tests).
//  */
//
// import {
//   BUYER_LEGAL_REG_IDENTIFIER_FIELD,
//   BUYER_LEGAL_REG_IDENTIFIER_FOR_DROPDOWN_BATCH,
//   BUYER_LEGAL_REG_IDENTIFIER_TYPE_FIELD,
//   BUYER_LEGAL_REG_SCHEME_0235_SCENARIOS,
//   BUYER_LEGAL_REG_TYPE_SCENARIOS,
//   BUYER_ELECTRONIC_ADDRESS_REQUIRES_LEGAL_REG,
//   type BuyerLegalRegScheme0235Scenario,
//   type BuyerLegalRegTypeScenario,
// } from "../FieldValidations/ConditionalValidation";
// import type { CreateInvoiceBuyerConditionalScenario } from "./uiInvoiceCreationConditionalValidation";
// import { resolveUiNullOrEmpty } from "./uiInvoiceCreationNullEmpty";
// // UI helper moved to Helpers/ui (disabled for OMN) — use Excel ConditionalValidation labels instead.
// import {
//   OTHER_SCHEME_IDENTIFIER as NON_UAE_TIN_SCHEME_LABEL,
//   SCHEME_IDENTIFIER_0235 as UAE_TIN_SCHEME_LABEL,
// } from "../FieldValidations/ConditionalValidation";
//
// /** Valid buyer identifier when scheme identifier is set (Create Invoice UI baseline). */
// export const CREATE_INVOICE_BUYER_IDENTIFIER_SAMPLE = "1000091919v1203";
//
// function assertInputIdFromExcelField(field: string): string {
//   if (field === BUYER_LEGAL_REG_IDENTIFIER_FIELD) return "legalRegId";
//   if (field === BUYER_LEGAL_REG_IDENTIFIER_TYPE_FIELD) return "legalRegIdType";
//   return "electronicAddress";
// }
//
// /** Core UI dependency rules (scheme → identifier, type → legal reg id, e-address scheme → e-address). */
// const BUYER_DEPENDENCY_CORE_SCENARIOS: CreateInvoiceBuyerConditionalScenario[] = [
//   {
//     title: "Scheme identifier UAE TIN — buyer identifier empty (invalid)",
//     section: "buyer",
//     kind: "schemeIdentifier",
//     schemeIdentifier: UAE_TIN_SCHEME_LABEL,
//     buyerIdentifier: "",
//     shouldError: true,
//     assertInputId: "identifier",
//   },
//   {
//     title: "Scheme identifier UAE TIN — buyer identifier provided (valid)",
//     section: "buyer",
//     kind: "schemeIdentifier",
//     schemeIdentifier: UAE_TIN_SCHEME_LABEL,
//     buyerIdentifier: CREATE_INVOICE_BUYER_IDENTIFIER_SAMPLE,
//     shouldError: false,
//     assertInputId: "identifier",
//   },
//   {
//     title: "Scheme identifier Other — buyer identifier empty (invalid)",
//     section: "buyer",
//     kind: "schemeIdentifier",
//     schemeIdentifier: NON_UAE_TIN_SCHEME_LABEL,
//     buyerIdentifier: "",
//     shouldError: true,
//     assertInputId: "identifier",
//   },
//   {
//     title: "Scheme identifier Other — buyer identifier provided (valid)",
//     section: "buyer",
//     kind: "schemeIdentifier",
//     schemeIdentifier: NON_UAE_TIN_SCHEME_LABEL,
//     buyerIdentifier: CREATE_INVOICE_BUYER_IDENTIFIER_SAMPLE,
//     shouldError: false,
//     assertInputId: "identifier",
//   },
//   {
//     title: "Buyer legal registration identifier type Emirates ID — legal reg id empty (invalid)",
//     section: "buyer",
//     kind: "legalRegType",
//     legalRegIdType: "Emirates ID",
//     legalRegId: "",
//     shouldError: true,
//     assertInputId: "legalRegId",
//   },
//   {
//     title: "Buyer legal registration identifier type Emirates ID — legal reg id provided (valid)",
//     section: "buyer",
//     kind: "legalRegType",
//     legalRegIdType: "Emirates ID",
//     legalRegId: BUYER_LEGAL_REG_IDENTIFIER_FOR_DROPDOWN_BATCH,
//     shouldError: false,
//     assertInputId: "legalRegId",
//   },
//   {
//     title: "Buyer legal registration identifier type Commercial/Trade License — legal reg id empty (invalid)",
//     section: "buyer",
//     kind: "legalRegType",
//     legalRegIdType: "Commercial/Trade License",
//     legalRegId: "",
//     shouldError: true,
//     assertInputId: "legalRegId",
//   },
//   {
//     title: "Buyer electronic address scheme UAE TIN — buyer electronic address empty (invalid)",
//     section: "buyer",
//     kind: "electronicAddressScheme",
//     electronicAddressScheme: UAE_TIN_SCHEME_LABEL,
//     electronicAddress: "",
//     shouldError: true,
//     assertInputId: "electronicAddress",
//   },
//   {
//     title: "Buyer electronic address scheme UAE TIN — buyer electronic address provided (valid)",
//     section: "buyer",
//     kind: "electronicAddressScheme",
//     electronicAddressScheme: UAE_TIN_SCHEME_LABEL,
//     electronicAddress: BUYER_ELECTRONIC_ADDRESS_REQUIRES_LEGAL_REG,
//     shouldError: false,
//     assertInputId: "electronicAddress",
//   },
//   {
//     title: "Buyer electronic address scheme Other — buyer electronic address empty (invalid)",
//     section: "buyer",
//     kind: "electronicAddressScheme",
//     electronicAddressScheme: NON_UAE_TIN_SCHEME_LABEL,
//     electronicAddress: "",
//     shouldError: true,
//     assertInputId: "electronicAddress",
//   },
//   {
//     title: "Buyer electronic address scheme Other — buyer electronic address provided (valid)",
//     section: "buyer",
//     kind: "electronicAddressScheme",
//     electronicAddressScheme: NON_UAE_TIN_SCHEME_LABEL,
//     electronicAddress: BUYER_ELECTRONIC_ADDRESS_REQUIRES_LEGAL_REG,
//     shouldError: false,
//     assertInputId: "electronicAddress",
//   },
// ];
//
// function mapLegalRegTypeExcelScenario(
//   s: BuyerLegalRegTypeScenario
// ): CreateInvoiceBuyerConditionalScenario {
//   return {
//     title: s.title,
//     section: "buyer",
//     kind: "legalRegTypeExcel",
//     electronicAddressScheme: s.buyerElectronicAddressScheme,
//     legalRegId: s.buyerLegalRegistrationIdentifier,
//     // Pass through `""` / whitespace — `resolveUiNullOrEmpty` becomes `undefined` and skips clearing
//     // prefilled master-data values (buyer search → `#legalRegIdType`).
//     legalRegIdType: s.buyerLegalRegistrationIdentifierType,
//     shouldError: s.shouldError,
//     assertInputId: "legalRegIdType",
//   };
// }
//
// function mapLegalRegScheme0235ExcelScenario(
//   s: BuyerLegalRegScheme0235Scenario
// ): CreateInvoiceBuyerConditionalScenario {
//   return {
//     title: s.title,
//     section: "buyer",
//     kind: "legalRegScheme0235",
//     electronicAddressScheme: s.buyerElectronicAddressScheme,
//     electronicAddress:
//       s.buyerElectronicAddress === null
//         ? null
//         : resolveUiNullOrEmpty(s.buyerElectronicAddress) ?? "",
//     // Pass through `""` / whitespace — `resolveUiNullOrEmpty` would become `undefined` and skip clearing
//     // prefilled master-data values (e.g. buyer search → `#legalRegId`).
//     legalRegId: s.buyerLegalRegistrationIdentifier,
//     legalRegIdType: s.buyerLegalRegistrationIdentifierType,
//     shouldError: s.shouldError,
//     assertInputId: assertInputIdFromExcelField(s.expectedErrorField),
//   };
// }
//
// /** Buyer conditional scenarios for Create Invoice UI (dependencies + Excel-aligned remaps). */
// export const CREATE_INVOICE_BUYER_DEPENDENCY_CONDITIONAL_SCENARIOS: CreateInvoiceBuyerConditionalScenario[] =
//   [
//     ...BUYER_DEPENDENCY_CORE_SCENARIOS,
//     ...BUYER_LEGAL_REG_TYPE_SCENARIOS.map(mapLegalRegTypeExcelScenario),
//     ...BUYER_LEGAL_REG_SCHEME_0235_SCENARIOS.map(mapLegalRegScheme0235ExcelScenario),
//   ];
//
