// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under testData/ui/; executable code is commented out.
//
// /**
//  * Conditional validation for Masters **Add New** UI only (Buyer/Seller + Items).
//  * Does not import Excel upload data or invoice conditional-validation specs.
//  *
//  * **Null / empty / whitespace:** same as Create Invoice UI — `isUiNullOrEmpty` /
//  * `resolveUiNullOrEmpty` from `uiInvoiceCreationConditionalValidation.ts`.
//  *
//  * Item type rules on Add New:
//  * - **Goods**: classification scheme + classification identifier required; service code not required.
//  * - **Service**: service accounting code only; scheme / classification optional (values do not block save).
//  * - **Both**: scheme + classification identifier + service accounting code required.
//  */
//
// import type { UiMasterFormTab } from "./uiMasterFieldMinMax";
//
// export type UiMasterConditionalScenario = {
//   title: string;
//   tab: UiMasterFormTab;
//   shouldError: boolean;
//   /** Input `id` to assert (`aria-invalid` + helper text). */
//   assertInputId: string;
// };
//
// export type UiMasterBuyerConditionalScenario = UiMasterConditionalScenario & {
//   tab: "buyerSeller";
//   legalRegIdType?: string;
//   authorityName?: string | null;
//   countryCode?: string;
//   countrySubdivision?: string | null;
//   passportCountry?: string | null;
// };
//
// export type UiMasterItemConditionalScenario = UiMasterConditionalScenario & {
//   tab: "item";
//   itemType: string;
//   /** `null` = clear scheme (`#classifications`). Omit = valid default for item type. */
//   classificationScheme?: string | null;
//   classificationIdentifier?: string | null;
//   serviceAccCode?: string | null;
// };
//
// export const UI_MASTER_BUYER_CONDITIONAL_SCENARIOS: UiMasterBuyerConditionalScenario[] = [
//   {
//     title: "Commercial/Trade License — authority name empty (invalid)",
//     tab: "buyerSeller",
//     legalRegIdType: "Commercial/Trade License",
//     authorityName: "",
//     shouldError: true,
//     assertInputId: "authorityName",
//   },
//   {
//     title: "Commercial/Trade License — authority name Dubai DED (valid)",
//     tab: "buyerSeller",
//     legalRegIdType: "Commercial/Trade License",
//     authorityName: "Dubai DED",
//     shouldError: false,
//     assertInputId: "authorityName",
//   },
//   {
//     title: "Emirates ID — authority name empty (valid)",
//     tab: "buyerSeller",
//     legalRegIdType: "Emirates ID",
//     authorityName: "",
//     shouldError: false,
//     assertInputId: "authorityName",
//   },
//   {
//     title: "Passport — passport country empty (invalid)",
//     tab: "buyerSeller",
//     legalRegIdType: "Passport",
//     passportCountry: "",
//     shouldError: true,
//     assertInputId: "passportCountry",
//   },
//   {
//     title: "Passport — passport country United Arab Emirates (valid)",
//     tab: "buyerSeller",
//     legalRegIdType: "Passport",
//     passportCountry: "United Arab Emirates",
//     shouldError: false,
//     assertInputId: "passportCountry",
//   },
//   {
//     title: "UAE — country subdivision empty (invalid)",
//     tab: "buyerSeller",
//     countryCode: "United Arab Emirates",
//     countrySubdivision: null,
//     shouldError: true,
//     assertInputId: "countrySubdivision",
//   },
//   {
//     title: "UAE — country subdivision Abu Dhabi (valid)",
//     tab: "buyerSeller",
//     countryCode: "United Arab Emirates",
//     countrySubdivision: "Abu Dhabi",
//     shouldError: false,
//     assertInputId: "countrySubdivision",
//   },
//   {
//     title: "UAE — country subdivision Dubai (valid)",
//     tab: "buyerSeller",
//     countryCode: "United Arab Emirates",
//     countrySubdivision: "Dubai",
//     shouldError: false,
//     assertInputId: "countrySubdivision",
//   },
// ];
//
// export const UI_MASTER_ITEM_CONDITIONAL_SCENARIOS: UiMasterItemConditionalScenario[] = [
//   {
//     title: "Goods — classification scheme empty (invalid)",
//     tab: "item",
//     itemType: "Goods",
//     classificationScheme: null,
//     classificationIdentifier: "12345",
//     shouldError: true,
//     assertInputId: "classifications",
//   },
//   {
//     title: "Goods — classification identifier empty (invalid)",
//     tab: "item",
//     itemType: "Goods",
//     classificationIdentifier: "",
//     shouldError: true,
//     assertInputId: "classificationIdentifier",
//   },
//   {
//     title: "Goods — scheme and classification identifier filled (valid)",
//     tab: "item",
//     itemType: "Goods",
//     shouldError: false,
//     assertInputId: "classificationIdentifier",
//   },
//   {
//     title: "Goods — service accounting code filled, not required (valid)",
//     tab: "item",
//     itemType: "Goods",
//     serviceAccCode: "SAC123",
//     shouldError: false,
//     assertInputId: "serviceAccCode",
//   },
//   {
//     title: "Service — service accounting code empty (invalid)",
//     tab: "item",
//     itemType: "Service",
//     classificationScheme: null,
//     classificationIdentifier: null,
//     serviceAccCode: "",
//     shouldError: true,
//     assertInputId: "serviceAccCode",
//   },
//   {
//     title: "Service — SAC only, scheme and classification empty (valid)",
//     tab: "item",
//     itemType: "Service",
//     classificationScheme: null,
//     classificationIdentifier: null,
//     serviceAccCode: "SAC123",
//     shouldError: false,
//     assertInputId: "serviceAccCode",
//   },
//   {
//     title: "Service — SAC valid with scheme and classification filled (valid, extras ignored)",
//     tab: "item",
//     itemType: "Service",
//     classificationIdentifier: "NOISE-ID",
//     serviceAccCode: "SAC123",
//     shouldError: false,
//     assertInputId: "serviceAccCode",
//   },
//   {
//     title: "Both — classification scheme empty (invalid)",
//     tab: "item",
//     itemType: "Both",
//     classificationScheme: null,
//     classificationIdentifier: "12345",
//     serviceAccCode: "SAC123",
//     shouldError: true,
//     assertInputId: "classifications",
//   },
//   {
//     title: "Both — classification identifier empty (invalid)",
//     tab: "item",
//     itemType: "Both",
//     classificationIdentifier: "",
//     serviceAccCode: "SAC123",
//     shouldError: true,
//     assertInputId: "classificationIdentifier",
//   },
//   {
//     title: "Both — service accounting code empty (invalid)",
//     tab: "item",
//     itemType: "Both",
//     classificationIdentifier: "12345",
//     serviceAccCode: "",
//     shouldError: true,
//     assertInputId: "serviceAccCode",
//   },
//   {
//     title: "Both — scheme, classification identifier, and SAC filled (valid)",
//     tab: "item",
//     itemType: "Both",
//     shouldError: false,
//     assertInputId: "classificationIdentifier",
//   },
// ];
//
