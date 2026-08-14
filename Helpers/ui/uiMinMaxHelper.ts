// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under a ui/ subfolder; executable code is commented out.
//
// /**
//  * Min/max length validation for **Create Invoice** UI and **Master** buyer/item forms.
//  */
// import { expect, type Page } from "@playwright/test";
// import type { FieldMinMaxRule, UiMasterMinMaxVariant } from "../../testData/ui/uiMasterFieldMinMax";
// import {
//   expectsUiMasterValidationError,
//   lengthForUiMasterVariant,
//   uiMasterTestValueForLength,
// } from "../../testData/ui/uiMasterFieldMinMax";
// import {
//   createInvoiceTestValueForLength,
//   expectsCreateInvoiceValidationError,
//   lengthForCreateInvoiceVariant,
//   type CreateInvoiceFieldRule,
// } from "../../testData/ui/uiInvoiceCreationFieldMinMax";
// import { UI_ANGLE_BRACKET_INVALID_VALUE } from "../../testData/ui/uiInvoiceCreationAngleBracketValidation";
// import { UIInvoiceCreationManualPage } from "../pageObjects/UIInvoiceCreationManualPage";
// import { UIMasterBuyerAndItemPage } from "../pageObjects/UIMasterBuyerAndItemPage";
// import {
//   assertUiFieldStateAfterSectionSave,
//   openInvoiceForConditionalFlow,
//   submitCopyInvoiceAfterSuccessIfNeeded,
//   type UiConditionalEntry,
// } from "./uiInvoiceEditEntryHelper";
// import {
//   buildUiMasterBeneficiaryIdForLength,
//   buildUiMasterBuyerVatForLength,
// } from "./uiMasterBuyerTestData";
// import {
//   buildInvalidUiMasterItemGrossPriceAboveMax,
//   buildInvalidUiMasterPriceBaseQtyAboveMax,
//   buildValidUiMasterItemGrossPriceMax,
//   buildValidUiMasterItemGrossPriceMin,
//   buildValidUiMasterPriceBaseQtyMax,
//   buildValidUiMasterPriceBaseQtyMin,
// } from "./uiMasterItemTestData";
// 
// function priceBaseQtyForVariant(variant: UiMasterMinMaxVariant): string {
//   switch (variant) {
//     case "min":
//       return buildValidUiMasterPriceBaseQtyMin();
//     case "max":
//       return buildValidUiMasterPriceBaseQtyMax();
//     case "belowMin":
//       return "";
//     case "aboveMax":
//       return buildInvalidUiMasterPriceBaseQtyAboveMax();
//   }
// }
// 
// function itemGrossPriceForVariant(variant: UiMasterMinMaxVariant): string {
//   switch (variant) {
//     case "min":
//       return buildValidUiMasterItemGrossPriceMin();
//     case "max":
//       return buildValidUiMasterItemGrossPriceMax();
//     case "belowMin":
//       return "";
//     case "aboveMax":
//       return buildInvalidUiMasterItemGrossPriceAboveMax();
//   }
// }
// 
// function sharedMinMaxValue(
//   inputId: string,
//   variant: UiMasterMinMaxVariant,
//   testKey: string,
//   length: number,
//   fallback: (length: number) => string
// ): string {
//   if (inputId === "vatIdentifier") {
//     return buildUiMasterBuyerVatForLength(length, testKey);
//   }
//   if (inputId === "beneficiaryId") {
//     return buildUiMasterBeneficiaryIdForLength(length, testKey);
//   }
//   if (inputId === "itemGrossPrice") {
//     return itemGrossPriceForVariant(variant);
//   }
//   if (inputId === "priceBaseQty") {
//     return priceBaseQtyForVariant(variant);
//   }
//   return fallback(length);
// }
// 
// function createInvoiceValueForRule(
//   rule: CreateInvoiceFieldRule,
//   variant: UiMasterMinMaxVariant,
//   testKey: string
// ): string {
//   const length = lengthForCreateInvoiceVariant(rule, variant);
//   return sharedMinMaxValue(rule.inputId, variant, testKey, length, (len) =>
//     createInvoiceTestValueForLength(rule, len)
//   );
// }
// 
// async function prepareCreateInvoiceSectionBaseline(
//   invoice: UIInvoiceCreationManualPage,
//   rule: CreateInvoiceFieldRule,
//   variant: UiMasterMinMaxVariant,
//   testKey: string
// ): Promise<void> {
//   switch (rule.section) {
//     case "seller":
//       await invoice.openSellerEditor();
//       break;
//     case "buyer":
//       await invoice.openBuyerEditor();
//       break;
//     case "delivery":
//       await invoice.openDeliveryEditor();
//       break;
//     case "item":
//       await invoice.openItemEditor();
//       break;
//     case "payment":
//       await invoice.openPaymentEditor();
//       break;
//     case "custom":
//       await invoice.openCustomEditor();
//       break;
//     case "document":
//     case "invoice":
//       break;
//   }
// 
//   await invoice.fillSectionBaselineForMinMax(rule.section, rule.inputId, {
//     uniqueKey: testKey,
//     classificationBelowMin:
//       rule.inputId === "classificationIdentifier" && variant === "belowMin",
//   });
// }
// 
// async function applyCreateInvoiceMinMaxValue(
//   invoice: UIInvoiceCreationManualPage,
//   rule: CreateInvoiceFieldRule,
//   variant: UiMasterMinMaxVariant,
//   value: string,
//   entry: UiConditionalEntry = "create"
// ): Promise<void> {
//   if (rule.inputId === "classificationIdentifier" && variant === "belowMin") {
//     return;
//   }
// 
//   const clearOptionalBelowMin =
//     variant === "belowMin" && rule.requiredOnForm === false && value === "";
// 
//   if (clearOptionalBelowMin) {
//     if (entry === "copy" || entry === "edit") {
//       await invoice.replaceInputById(rule.inputId, "");
//     } else {
//       await invoice.clearInputById(rule.inputId);
//     }
//   } else if (rule.section === "item" || (rule.section === "document" && entry !== "create")) {
//     await invoice.replaceInputById(rule.inputId, value);
//   } else {
//     await invoice.fillInputById(rule.inputId, value);
//   }
//   await invoice.blurActiveElement();
// }
// 
// async function runCreateInvoiceDocumentMinMaxCase(
//   invoice: UIInvoiceCreationManualPage,
//   rule: CreateInvoiceFieldRule,
//   variant: UiMasterMinMaxVariant,
//   value: string,
//   shouldError: boolean,
//   entry: UiConditionalEntry = "create"
// ): Promise<void> {
//   await invoice.expectDocumentEditMode();
//   await applyCreateInvoiceMinMaxValue(invoice, rule, variant, value, entry);
// 
//   if (shouldError) {
//     await invoice.clickDocumentSave();
//     expect(
//       await invoice.isDocumentEditMode(),
//       `${rule.excelField}: invalid value should keep document in edit mode (not View)`
//     ).toBe(true);
//     await invoice.expectInputValidationError(rule.inputId);
//     return;
//   }
// 
//   const submitInvoiceNumber =
//     rule.inputId === "invNum" ? value : await invoice.readDocumentInvoiceNumber();
//   if (!assertUiFieldStateAfterSectionSave(entry)) {
//     await invoice.expectInputNoValidationError(rule.inputId);
//   }
//   await invoice.clickDocumentSave();
//   await invoice.expectDocumentViewMode();
//   if (assertUiFieldStateAfterSectionSave(entry)) {
//     await invoice.expectInputNoValidationError(rule.inputId);
//   }
//   await submitCopyInvoiceAfterSuccessIfNeeded(
//     invoice,
//     entry,
//     shouldError,
//     submitInvoiceNumber
//   );
// }
// 
// export async function runUiInvoiceCreationMinMaxCase(
//   page: Page,
//   rule: CreateInvoiceFieldRule,
//   variant: UiMasterMinMaxVariant,
//   options?: { entry?: UiConditionalEntry }
// ): Promise<void> {
//   const entry = options?.entry ?? "create";
//   const testKey = `${entry}|${rule.excelField}|${variant}`;
//   const value = createInvoiceValueForRule(rule, variant, testKey);
//   const shouldError = expectsCreateInvoiceValidationError(rule, variant);
// 
//   const baseline =
//     (entry === "edit" || entry === "copy") && rule.section === "payment"
//       ? { forceUpload: true as const, invoiceTypeCode: "Commercial Invoice" }
//       : undefined;
//   const invoice = await openInvoiceForConditionalFlow(page, entry, baseline);
//   await prepareCreateInvoiceSectionBaseline(invoice, rule, variant, testKey);
// 
//   if (rule.section === "document") {
//     await runCreateInvoiceDocumentMinMaxCase(
//       invoice,
//       rule,
//       variant,
//       value,
//       shouldError,
//       entry
//     );
//     return;
//   }
// 
//   await applyCreateInvoiceMinMaxValue(invoice, rule, variant, value, entry);
//   await invoice.clickSectionSave(rule.section);
// 
//   if (shouldError) {
//     await invoice.expectInputValidationError(rule.inputId);
//     return;
//   }
// 
//   if (rule.section === "item") {
//     await invoice.expectItemFieldValueInView(rule.inputId, value);
//     await submitCopyInvoiceAfterSuccessIfNeeded(invoice, entry, shouldError);
//     return;
//   }
// 
//   await invoice.expectInputNoValidationError(rule.inputId);
//   await submitCopyInvoiceAfterSuccessIfNeeded(invoice, entry, shouldError);
// }
// 
// /**
//  * Negative validation: free-text fields must reject angle brackets (`<>`).
//  * Dropdowns / dates / numeric-only fields are filtered out by the caller.
//  */
// export async function runUiInvoiceCreationAngleBracketCase(
//   page: Page,
//   rule: CreateInvoiceFieldRule,
//   options?: { entry?: UiConditionalEntry; value?: string }
// ): Promise<void> {
//   const entry = options?.entry ?? "create";
//   const value = options?.value ?? UI_ANGLE_BRACKET_INVALID_VALUE;
//   const testKey = `${entry}|${rule.excelField}|angleBracket`;
//   const variant: UiMasterMinMaxVariant = "min";
// 
//   const baseline =
//     (entry === "edit" || entry === "copy") && rule.section === "payment"
//       ? { forceUpload: true as const, invoiceTypeCode: "Commercial Invoice" }
//       : undefined;
//   const invoice = await openInvoiceForConditionalFlow(page, entry, baseline);
//   await prepareCreateInvoiceSectionBaseline(invoice, rule, variant, testKey);
// 
//   if (rule.section === "document") {
//     await invoice.expectDocumentEditMode();
//     await applyCreateInvoiceMinMaxValue(invoice, rule, variant, value, entry);
//     await invoice.clickDocumentSave();
//     expect(
//       await invoice.isDocumentEditMode(),
//       `${rule.excelField}: value with <> should keep document in edit mode (not View)`
//     ).toBe(true);
//     await invoice.expectInputValidationError(rule.inputId);
//     return;
//   }
// 
//   await applyCreateInvoiceMinMaxValue(invoice, rule, variant, value, entry);
//   await invoice.clickSectionSave(rule.section);
//   await invoice.expectInputValidationError(rule.inputId);
// }
// 
// function masterValueForField(
//   config: FieldMinMaxRule,
//   variant: UiMasterMinMaxVariant,
//   testKey: string
// ): string {
//   const length = lengthForUiMasterVariant(config, variant);
//   return sharedMinMaxValue(config.inputId, variant, testKey, length, (len) =>
//     uiMasterTestValueForLength(config, len)
//   );
// }
// 
// async function prepareMasterItemAddNewForMinMax(
//   masters: UIMasterBuyerAndItemPage,
//   config: FieldMinMaxRule,
//   variant: UiMasterMinMaxVariant
// ): Promise<void> {
//   await masters.openItemAddNewForm();
// 
//   if (config.inputId === "classificationIdentifier") {
//     if (variant === "belowMin") {
//       await masters.fillItemFieldsForType("Goods", {
//         classificationScheme: null,
//         classificationIdentifier: null,
//       });
//     } else {
//       await masters.fillItemFieldsForType("Goods");
//     }
//     return;
//   }
// 
//   await masters.fillItemBaseline(config.inputId);
// }
// 
// function expectsUiMasterMinMaxError(
//   config: FieldMinMaxRule,
//   variant: UiMasterMinMaxVariant
// ): boolean {
//   if (config.inputId === "classificationIdentifier" && variant === "belowMin") {
//     return true;
//   }
//   if (config.inputId === "beneficiaryId" && variant === "belowMin") {
//     return true;
//   }
//   return expectsUiMasterValidationError(config, variant);
// }
// 
// export async function runUiMasterMinMaxCase(
//   page: Page,
//   config: FieldMinMaxRule,
//   variant: UiMasterMinMaxVariant
// ): Promise<void> {
//   const masters = new UIMasterBuyerAndItemPage(page);
//   const testKey = `${config.field}|${variant}`;
//   const value = masterValueForField(config, variant, testKey);
//   const shouldError = expectsUiMasterMinMaxError(config, variant);
// 
//   await masters.open();
//   if (config.tab === "buyerSeller") {
//     await masters.openBuyerSellerAddNewForm();
//     await masters.fillBuyerSellerBaseline(config.inputId, testKey);
//     // Authority name is disabled unless Commercial/Trade License is selected.
//     if (config.inputId === "authorityName") {
//       await masters.selectBuyerLegalRegIdType("Commercial/Trade License");
//     }
//   } else {
//     await prepareMasterItemAddNewForMinMax(masters, config, variant);
//   }
// 
//   const clearOptionalBelowMin =
//     variant === "belowMin" && config.requiredOnForm === false && value === "";
// 
//   const skipFillForBelowMinClassification =
//     config.inputId === "classificationIdentifier" && variant === "belowMin";
// 
//   if (!skipFillForBelowMinClassification) {
//     if (clearOptionalBelowMin) {
//       await masters.clearInputById(config.inputId);
//     } else {
//       await masters.fillInputById(config.inputId, value);
//     }
//   }
//   await masters.clickSave();
// 
//   if (shouldError) {
//     await masters.expectInputValidationError(config.inputId);
//   } else {
//     await masters.expectInputNoValidationError(config.inputId);
//   }
// }
