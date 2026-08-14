// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under a ui/ subfolder; executable code is commented out.
//
// import type { Page } from "@playwright/test";
// import { CREATE_INVOICE_BUYER_DROPDOWN_FIELDS } from "../../testData/ui/uiInvoiceCreationDropdowns";
// import {
//   UI_MASTER_BUYER_SELLER_DROPDOWN_FIELDS,
//   UI_MASTER_ITEM_DROPDOWN_FIELDS,
// } from "../../testData/ui/uiMasterDropdowns";
// import { UIMasterBuyerAndItemPage } from "../pageObjects/UIMasterBuyerAndItemPage";
// import {
//   isUiPrefilledLineItemEntry,
//   openInvoiceForConditionalFlow,
//   submitCopyInvoiceAfterSuccessIfNeeded,
//   type UiConditionalEntry,
// } from "./uiInvoiceEditEntryHelper";
// 
// export async function runUiInvoiceCreationBuyerDropdownsSaveCase(
//   page: Page,
//   options?: { entry?: UiConditionalEntry }
// ): Promise<void> {
//   const entry = options?.entry ?? "create";
//   const invoice = await openInvoiceForConditionalFlow(page, entry);
//   const key = `${entry}-buyer-dropdowns|${Date.now()}`;
// 
//   await invoice.prepareBuyerDropdownsForSave(key);
//   await invoice.expectDropdownsNoValidationError(CREATE_INVOICE_BUYER_DROPDOWN_FIELDS);
//   await invoice.clickSectionSave("buyer");
//   await invoice.expectBuyerSectionSaveSucceeded();
//   await submitCopyInvoiceAfterSuccessIfNeeded(invoice, entry, false);
// }
// 
// export async function runUiInvoiceCreationItemDropdownsSaveCase(
//   page: Page,
//   options?: { entry?: UiConditionalEntry }
// ): Promise<void> {
//   const entry = options?.entry ?? "create";
//   const invoice = await openInvoiceForConditionalFlow(page, entry);
// 
//   if (isUiPrefilledLineItemEntry(entry)) {
//     await invoice.openItemRowEdit(0);
//   } else {
//     await invoice.prepareItemDropdownsForSave();
//   }
// 
//   await invoice.expectDropdownsNoValidationError(UI_MASTER_ITEM_DROPDOWN_FIELDS);
//   if (isUiPrefilledLineItemEntry(entry)) {
//     await invoice.clickItemSectionSave();
//   } else {
//     await invoice.clickSave();
//   }
//   await invoice.expectItemSectionSaveSucceeded();
//   await submitCopyInvoiceAfterSuccessIfNeeded(invoice, entry, false);
// }
// 
// export async function runUiMasterBuyerDropdownsSaveCase(page: Page): Promise<void> {
//   const masters = new UIMasterBuyerAndItemPage(page);
//   const key = `buyer-dropdowns|${Date.now()}`;
// 
//   await masters.open();
//   await masters.openBuyerSellerAddNewForm();
//   await masters.fillBuyerSellerAllDropdownsAndSave();
//   await masters.expectDropdownsNoValidationError(UI_MASTER_BUYER_SELLER_DROPDOWN_FIELDS);
// }
// 
// export async function runUiMasterItemDropdownsSaveCase(page: Page): Promise<void> {
//   const masters = new UIMasterBuyerAndItemPage(page);
// 
//   await masters.open();
//   await masters.openItemAddNewForm();
//   await masters.fillItemAllDropdownsAndSave();
//   await masters.expectDropdownsNoValidationError(UI_MASTER_ITEM_DROPDOWN_FIELDS);
// }
