// UI SUITE DISABLED FOR OMN — entire file commented out (do not execute)
// import { expect } from "@playwright/test";
// import { test } from "../../Src/baseTest";
// import {
//   runUiMasterBuyerConditionalCase,
//   runUiMasterItemConditionalCase,
// } from "../../Helpers/ui/uiMasterConditionalHelper";
// import {
//   runUiMasterBuyerDropdownsSaveCase,
//   runUiMasterItemDropdownsSaveCase,
// } from "../../Helpers/ui/uiDropdownHelper";
// import { runUiMasterMinMaxCase } from "../../Helpers/ui/uiMinMaxHelper";
// import {
//   BUYER_ADD_NEW_INPUT_IDS,
//   ITEM_ADD_NEW_INPUT_IDS,
//   UIMasterBuyerAndItemPage,
//   listMastersFieldsForTab,
// } from "../../pageObjects/ui/UIMasterBuyerAndItemPage";
// import {
//   UI_MASTER_BUYER_SELLER_FIELD_NAMES,
//   UI_MASTER_ITEM_FIELD_NAMES,
// } from "../../testData/ui/uiMasterConfig";
// import {
//   UI_MASTER_BUYER_CONDITIONAL_SCENARIOS,
//   UI_MASTER_ITEM_CONDITIONAL_SCENARIOS,
// } from "../../testData/ui/uiMasterConditionalValidation";
// import {
//   UI_MASTER_MIN_MAX_VARIANTS,
//   uiMasterBuyerSellerMinMax,
//   uiMasterItemMinMax,
//   uiMinMaxCondition,
//   uiMinMaxTestOutcome,
// } from "../../testData/ui/uiMasterFieldMinMax";
// 
// test.describe("Masters UI â€” Buyer/Seller and Items", () => {
//   test.describe.configure({ mode: "parallel" });
// 
//   test("Verify Masters UI navigation opens with Buyer/Seller tab active.", async ({ page }) => {
//     const masters = new UIMasterBuyerAndItemPage(page);
//     await masters.open();
//     await masters.expectBuyerSellerTabActive();
//   });
// 
//   test("Verify Masters UI navigation selects Items tab as active.", async ({ page }) => {
//     const masters = new UIMasterBuyerAndItemPage(page);
//     await masters.open();
//     await masters.openItemsTab();
//     await masters.expectItemsTabActive();
//   });
// 
//   test("Verify Masters UI auto-selects Items tab for an Item field on the form.", async ({ page }) => {
//     const masters = new UIMasterBuyerAndItemPage(page);
//     await masters.open();
// 
//     const buyerField = UI_MASTER_BUYER_SELLER_FIELD_NAMES[0];
//     const itemField = UI_MASTER_ITEM_FIELD_NAMES[0];
// 
//     await masters.ensureTabForField(buyerField);
//     await masters.expectBuyerSellerTabActive();
// 
//     await masters.ensureTabForField(itemField);
//     await masters.expectItemsTabActive();
//   });
// 
//   test("Verify Masters UI Buyer/Seller Add New shows all fields.", async ({ page }) => {
//     const masters = new UIMasterBuyerAndItemPage(page);
//     await masters.open();
//     await masters.openBuyerSellerAddNewForm();
//     await masters.expectBuyerSellerAddNewFormVisible();
//   });
// 
//   test("Verify Masters UI Items Add New shows all fields.", async ({ page }) => {
//     const masters = new UIMasterBuyerAndItemPage(page);
//     await masters.open();
//     await masters.openItemAddNewForm();
//     await masters.expectItemAddNewFormVisible();
//   });
// 
//   test("Verify Masters UI Buyer/Seller Add New opens when the correct tab is active.", async ({ page }) => {
//     const masters = new UIMasterBuyerAndItemPage(page);
//     await masters.open();
//     await masters.openItemsTab();
//     await masters.expectItemsTabActive();
//     await masters.openBuyerSellerTab();
//     await masters.openBuyerSellerAddNewForm();
//     await masters.expectBuyerSellerAddNewFormVisible();
//   });
// 
//   test("Verify Masters UI Items Add New opens when the correct tab is active.", async ({ page }) => {
//     const masters = new UIMasterBuyerAndItemPage(page);
//     await masters.open();
//     await masters.expectBuyerSellerTabActive();
//     await masters.openItemAddNewForm();
//     await masters.expectItemAddNewFormVisible();
//   });
// 
//   test("Verify Masters UI field lists match Buyer/Seller and Items tabs.", () => {
//     expect(listMastersFieldsForTab("buyerSeller")).toEqual(UI_MASTER_BUYER_SELLER_FIELD_NAMES);
//     expect(listMastersFieldsForTab("item")).toEqual(UI_MASTER_ITEM_FIELD_NAMES);
//     expect(UI_MASTER_BUYER_SELLER_FIELD_NAMES.length).toBeGreaterThan(0);
//     expect(UI_MASTER_ITEM_FIELD_NAMES.length).toBeGreaterThan(0);
//     expect(BUYER_ADD_NEW_INPUT_IDS.length).toBeGreaterThan(0);
//     expect(ITEM_ADD_NEW_INPUT_IDS.length).toBeGreaterThan(0);
//     expect(uiMasterBuyerSellerMinMax.length).toBeGreaterThan(0);
//     expect(uiMasterItemMinMax.length).toBeGreaterThan(0);
//   });
// 
//   test("Verify Masters UI Buyer/Seller Save succeeds with all dropdowns selected.", async ({ page }) => {
//     await runUiMasterBuyerDropdownsSaveCase(page);
//   });
// 
//   test("Verify Masters UI Items Save succeeds with all dropdowns selected.", async ({ page }) => {
//     await runUiMasterItemDropdownsSaveCase(page);
//   });
// 
//   test.describe("Buyer/Seller Add New â€” min/max length", () => {
//     for (const config of uiMasterBuyerSellerMinMax) {
//       for (const variant of UI_MASTER_MIN_MAX_VARIANTS) {
//         const outcome = uiMinMaxTestOutcome(config, variant);
//         const expectPhrase =
//           outcome === "field error"
//             ? "the form should show a field error"
//             : "the value should be accepted";
//         test(
//           `Verify Masters UI Buyer/Seller â€“ ${config.field} (${uiMinMaxCondition(variant, config)}): ${expectPhrase}.`,
//           async ({ page }) => {
//             await runUiMasterMinMaxCase(page, config, variant);
//           }
//         );
//       }
//     }
//   });
// 
//   test.describe("Items Add New â€” min/max length", () => {
//     for (const config of uiMasterItemMinMax) {
//       for (const variant of UI_MASTER_MIN_MAX_VARIANTS) {
//         const outcome = uiMinMaxTestOutcome(config, variant);
//         const expectPhrase =
//           outcome === "field error"
//             ? "the form should show a field error"
//             : "the value should be accepted";
//         test(
//           `Verify Masters UI Items â€“ ${config.field} (${uiMinMaxCondition(variant, config)}): ${expectPhrase}.`,
//           async ({ page }) => {
//             await runUiMasterMinMaxCase(page, config, variant);
//           }
//         );
//       }
//     }
//   });
// 
//   test.describe("Buyer/Seller Add New â€” conditional validation", () => {
//     for (const scenario of UI_MASTER_BUYER_CONDITIONAL_SCENARIOS) {
//       test(scenario.title, async ({ page }) => {
//         await runUiMasterBuyerConditionalCase(page, scenario);
//       });
//     }
//   });
// 
//   test.describe("Items Add New â€” conditional validation", () => {
//     for (const scenario of UI_MASTER_ITEM_CONDITIONAL_SCENARIOS) {
//       test(scenario.title, async ({ page }) => {
//         await runUiMasterItemConditionalCase(page, scenario);
//       });
//     }
//   });
// });
