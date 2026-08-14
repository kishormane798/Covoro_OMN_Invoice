// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under a ui/ subfolder; executable code is commented out.
//
// import type { Page } from "@playwright/test";
// import type {
//   UiMasterBuyerConditionalScenario,
//   UiMasterItemConditionalScenario,
// } from "../../testData/ui/uiMasterConditionalValidation";
// import { isUiNullOrEmpty } from "../../testData/ui/uiInvoiceCreationConditionalValidation";
// import { UIMasterBuyerAndItemPage } from "../pageObjects/UIMasterBuyerAndItemPage";
// 
// async function applyMasterAuthorityName(
//   masters: UIMasterBuyerAndItemPage,
//   authorityName: string | undefined
// ): Promise<void> {
//   if (authorityName === undefined) {
//     return;
//   }
//   // Authority name is editable only for Commercial/Trade License; other types disable it.
//   if (!(await masters.isFormInputEnabled("authorityName"))) {
//     return;
//   }
//   if (isUiNullOrEmpty(authorityName)) {
//     await masters.clearInputById("authorityName");
//   } else {
//     await masters.fillInputById("authorityName", authorityName);
//   }
// }
// 
// async function applyMasterPassportCountry(
//   masters: UIMasterBuyerAndItemPage,
//   passportCountry: string | null | undefined
// ): Promise<void> {
//   if (passportCountry === undefined) {
//     return;
//   }
//   if (isUiNullOrEmpty(passportCountry)) {
//     await masters.clearInputById("passportCountry");
//   } else {
//     await masters.selectBuyerPassportCountry(passportCountry as string);
//   }
// }
// 
// async function applyMasterCountrySubdivision(
//   masters: UIMasterBuyerAndItemPage,
//   scenario: UiMasterBuyerConditionalScenario
// ): Promise<void> {
//   if (scenario.countryCode) {
//     await masters.selectBuyerCountry(
//       /^United Arab Emirates$/i.test(scenario.countryCode)
//         ? /^United Arab Emirates$/i
//         : scenario.countryCode
//     );
//   }
//   if (scenario.countrySubdivision !== undefined) {
//     if (isUiNullOrEmpty(scenario.countrySubdivision)) {
//       await masters.clearInputById("countrySubdivision");
//     } else {
//       await masters.selectBuyerCountrySubdivision(scenario.countrySubdivision as string);
//     }
//   }
// }
// 
// async function applyBuyerConditional(
//   masters: UIMasterBuyerAndItemPage,
//   scenario: UiMasterBuyerConditionalScenario,
//   testKey: string
// ): Promise<void> {
//   await masters.openBuyerSellerAddNewForm();
//   await masters.fillBuyerSellerBaseline(scenario.assertInputId, testKey);
// 
//   if (scenario.legalRegIdType) {
//     await masters.selectBuyerLegalRegIdType(scenario.legalRegIdType);
//   }
// 
//   switch (scenario.assertInputId) {
//     case "authorityName":
//       await applyMasterAuthorityName(masters, scenario.authorityName ?? undefined);
//       break;
//     case "passportCountry":
//       await applyMasterPassportCountry(masters, scenario.passportCountry);
//       break;
//     case "countrySubdivision":
//       await applyMasterCountrySubdivision(masters, scenario);
//       break;
//     default:
//       break;
//   }
// }
// 
// async function applyItemConditional(
//   masters: UIMasterBuyerAndItemPage,
//   scenario: UiMasterItemConditionalScenario
// ): Promise<void> {
//   await masters.openItemAddNewForm();
//   await masters.fillItemFieldsForType(scenario.itemType, {
//     classificationScheme: scenario.classificationScheme,
//     classificationIdentifier: scenario.classificationIdentifier,
//     serviceAccCode: scenario.serviceAccCode,
//   });
// }
// 
// export async function runUiMasterBuyerConditionalCase(
//   page: Page,
//   scenario: UiMasterBuyerConditionalScenario
// ): Promise<void> {
//   const masters = new UIMasterBuyerAndItemPage(page);
//   await masters.open();
//   await applyBuyerConditional(masters, scenario, scenario.title);
//   await masters.clickSave();
// 
//   if (scenario.shouldError) {
//     await masters.expectInputValidationError(scenario.assertInputId);
//   } else {
//     await masters.expectInputNoValidationError(scenario.assertInputId);
//   }
// }
// 
// export async function runUiMasterItemConditionalCase(
//   page: Page,
//   scenario: UiMasterItemConditionalScenario
// ): Promise<void> {
//   const masters = new UIMasterBuyerAndItemPage(page);
//   await masters.open();
//   await applyItemConditional(masters, scenario);
//   await masters.clickSave();
// 
//   if (scenario.shouldError) {
//     await masters.expectInputValidationError(scenario.assertInputId);
//   } else {
//     await masters.expectInputNoValidationError(scenario.assertInputId);
//   }
// }
