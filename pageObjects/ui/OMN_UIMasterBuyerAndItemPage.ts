// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under a ui/ subfolder; executable code is commented out.
//
// import { expect, type Locator, type Page } from "@playwright/test";
// import {
//   buildUniqueBuyerVatIdentifier,
//   DEFAULT_UAE_COUNTRY_SUBDIVISION,
// } from "../Helpers/uiMasterBuyerTestData";
// import {
//   dismissOpenDropdownIfOpen,
//   selectMuiAutocompleteOption,
// } from "../Helpers/uiMuiAutocompleteHelper";
// import {
//   DEFAULT_UI_MASTER_CLASSIFICATION_SCHEME,
//   UI_MASTER_CLASSIFICATION_SCHEME_FILTER_TEXT,
//   DEFAULT_UI_MASTER_ITEM_TAX_CATEGORY,
//   DEFAULT_UI_MASTER_ITEM_TYPE,
//   DEFAULT_UI_MASTER_UNIT_OF_MEASURE,
//   UI_MASTER_DEFAULT_CLASSIFICATION_IDENTIFIER,
//   UI_MASTER_DEFAULT_SERVICE_ACCOUNTING_CODE,
//   UI_MASTER_ITEM_TYPE_BOTH,
//   UI_MASTER_ITEM_TYPE_GOODS,
//   UI_MASTER_ITEM_TYPE_SERVICE,
//   UI_MASTER_UNIT_OF_MEASURE_TIMEOUT_MS,
// } from "../Helpers/uiMasterItemTestData";
// import type { UiMasterDropdownField } from "../../testData/ui/uiMasterDropdowns";
// import {
//   listUiMasterFieldsForTab,
//   uiMasterTabForField,
// } from "../../testData/ui/uiMasterConfig";
// import { parallelWorkerDashboardOpenOpts } from "../Helpers/parallelWorkerSubmitIdentity";
// import { DashboardPage, EINVOICE_MASTERS_PATH } from "./DashboardPage";
// import {
//   isNonUaeCountryCode,
//   NON_UAE_TIN_SCHEME_LABEL,
//   UAE_TIN_SCHEME_LABEL,
// } from "../Helpers/uiSchemeCountryHelper";
// 
// export type UIMasterTab = "buyerSeller" | "item";
// 
// export const UI_MASTER_TAB_LABELS: Record<UIMasterTab, string> = {
//   buyerSeller: "Buyer/Seller",
//   item: "Items",
// };
// 
// const UI_MASTER_LIST_HEADINGS: Record<UIMasterTab, RegExp> = {
//   buyerSeller: /^Buyer\/Seller List$/i,
//   item: /^Items List$/i,
// };
// 
// export const EINVOICE_MASTERS_ITEM_ADD_NEW_PATH = "/einvoice/masters/item/add-new";
// 
// export const BUYER_ADD_NEW_INPUT_IDS = [
//   "name",
//   "vatIdentifier",
//   "legalRegIdType",
//   "legalRegId",
//   "passportCountry",
//   "authorityName",
//   "schemeIdentifier",
//   "identifier",
//   "beneficiaryId",
//   "peppolSchemeIdentifier",
//   "electronicAddress",
//   "address",
//   "countryCode",
//   "countrySubdivision",
//   "city",
//   "postalCode",
// ] as const;
// 
// export const ITEM_ADD_NEW_INPUT_IDS = [
//   "standardId",
//   "itemType",
//   "itemName",
//   "itemDescription",
//   "classifications",
//   "classificationIdentifier",
//   "serviceAccCode",
//   "priceBaseQty",
//   "unitOfMeasure",
//   "itemGrossPrice",
//   "itemNetPrice",
//   "invLineNetAmt",
//   "taxRateDtls[0].taxCategory",
//   "taxRateDtls[0].taxRate",
//   "taxRateDtls[0].taxAmt",
//   "vatLineAmt",
//   "invLineAmt",
// ] as const;
// 
// const SELECTORS = {
//   addNewButtonWrapper: ".button-wrapper.add-new-btn",
//   buyerAddNewContainer: ".add-new-dtls-container",
//   itemAddNewContainer: ".add-new-item-container",
//   listbox: '[role="listbox"]',
//   listboxOption: '[role="option"]',
//   helperText: ".MuiFormHelperText-root",
//   formControlAncestor:
//     "xpath=ancestor::div[contains(@class,'MuiFormControl-root')][1]",
// } as const;
// 
// function formInput(page: Page, id: string): Locator {
//   return page.locator(`[id="${id}"]`);
// }
// 
// function formControlForInput(page: Page, inputId: string): Locator {
//   return formInput(page, inputId).locator(SELECTORS.formControlAncestor);
// }
// 
// export function mastersTabForField(fieldName: string): UIMasterTab {
//   return uiMasterTabForField(fieldName);
// }
// 
// export function listMastersFieldsForTab(tab: UIMasterTab): readonly string[] {
//   return listUiMasterFieldsForTab(tab);
// }
// 
// export class UIMasterBuyerAndItemPage {
//   private readonly dashboard: DashboardPage;
// 
//   constructor(private readonly page: Page) {
//     this.dashboard = new DashboardPage(page);
//   }
// 
//   
//   private buyerSellerTabButton = () =>
//     this.page.getByRole("button", { name: UI_MASTER_TAB_LABELS.buyerSeller, exact: true });
// 
//   private itemsTabButton = () =>
//     this.page.getByRole("button", { name: UI_MASTER_TAB_LABELS.item, exact: true });
// 
//   private tabButton(tab: UIMasterTab): Locator {
//     return tab === "buyerSeller" ? this.buyerSellerTabButton() : this.itemsTabButton();
//   }
// 
//   private addNewButton = () =>
//     this.page.locator(SELECTORS.addNewButtonWrapper).getByRole("button", {
//       name: "Add New",
//       exact: true,
//     });
// 
//   
//   private async isTabButtonActive(button: Locator): Promise<boolean> {
//     const className = (await button.getAttribute("class")) ?? "";
//     return /\btab-active\b/.test(className);
//   }
// 
//   private async expectFormFieldsVisible(ids: readonly string[]): Promise<void> {
//     for (const id of ids) {
//       await expect(
//         formInput(this.page, id),
//         `Expected field #${id} to be visible on Add New form`
//       ).toBeVisible();
//     }
//   }
// 
//   private async expectAddNewFormFooter(): Promise<void> {
//     await expect(this.page.getByRole("button", { name: "Clear All" })).toBeVisible();
//     await expect(this.page.getByRole("button", { name: "Save" })).toBeVisible();
//   }
// 
//   
//   async open(): Promise<void> {
//     await this.dashboard.openDashboard(parallelWorkerDashboardOpenOpts());
//     await this.dashboard.openMastersPage();
//     await this.ensureMastersListPage();
//   }
// 
//     async ensureMastersListPage(): Promise<void> {
//     const url = this.page.url();
//     const onAddNew = /\/add-new/i.test(url);
// 
//     if (onAddNew || !url.includes(EINVOICE_MASTERS_PATH)) {
//       if (onAddNew) {
//         const back = this.page.getByTestId("back-arrow");
//         if (await back.isVisible().catch(() => false)) {
//           await back.click();
//         } else {
//           await this.dashboard.openMastersPage();
//         }
//       } else {
//         await this.dashboard.openMastersPage();
//       }
//       await this.page.waitForURL(/\/einvoice\/masters\/?(\?|$)/, { timeout: 30_000 });
//     }
// 
//     await expect(this.addNewButton()).toBeVisible({ timeout: 30_000 });
//     await this.dashboard.expectMastersPageLoaded();
//   }
// 
//   async expectBuyerSellerTabActive(): Promise<void> {
//     await expect(this.buyerSellerTabButton()).toHaveClass(/\btab-active\b/);
//     await expect(
//       this.page.getByRole("heading", { name: UI_MASTER_LIST_HEADINGS.buyerSeller, level: 3 })
//     ).toBeVisible();
//   }
// 
//   async expectItemsTabActive(): Promise<void> {
//     await expect(this.itemsTabButton()).toHaveClass(/\btab-active\b/);
//     await expect(
//       this.page.getByRole("heading", { name: UI_MASTER_LIST_HEADINGS.item, level: 3 })
//     ).toBeVisible();
//   }
// 
//   async openBuyerSellerTab(): Promise<void> {
//     await this.openTab("buyerSeller");
//   }
// 
//   async openItemsTab(): Promise<void> {
//     await this.openTab("item");
//   }
// 
//     async openTab(tab: UIMasterTab): Promise<void> {
//     const button = this.tabButton(tab);
//     await expect(button).toBeVisible({ timeout: 30_000 });
//     if (!(await this.isTabButtonActive(button))) {
//       await button.click();
//     }
//     if (tab === "buyerSeller") {
//       await this.expectBuyerSellerTabActive();
//     } else {
//       await this.expectItemsTabActive();
//     }
//   }
// 
//     async ensureTabForField(fieldName: string): Promise<UIMasterTab> {
//     const tab = mastersTabForField(fieldName);
//     await this.openTab(tab);
//     return tab;
//   }
// 
//   async clickAddNew(): Promise<void> {
//     const addNew = this.addNewButton();
//     await expect(addNew).toBeVisible({ timeout: 30_000 });
//     await addNew.click();
//   }
// 
//     async openBuyerSellerAddNewForm(): Promise<void> {
//     await this.ensureMastersListPage();
//     await this.openBuyerSellerTab();
//     await this.clickAddNew();
//     await expect(this.page.locator(SELECTORS.buyerAddNewContainer)).toBeVisible({
//       timeout: 30_000,
//     });
//     await expect(this.page.getByTestId("product-header")).toHaveText("Add New");
//     await expect(this.page).not.toHaveURL(/\/item\/add-new/);
//   }
// 
//     async openItemAddNewForm(): Promise<void> {
//     await this.ensureMastersListPage();
//     await this.openItemsTab();
//     await this.clickAddNew();
//     await this.page.waitForURL(`**${EINVOICE_MASTERS_ITEM_ADD_NEW_PATH}**`, {
//       timeout: 30_000,
//     });
//     await expect(this.page.locator(SELECTORS.itemAddNewContainer)).toBeVisible();
//     await expect(this.page.getByTestId("product-header")).toHaveText("Add New");
//   }
// 
//     async expectBuyerSellerAddNewFormVisible(): Promise<void> {
//     await expect(this.page.locator(`${SELECTORS.buyerAddNewContainer} form.add-new-form`)).toBeVisible();
// 
//     await this.expectFormFieldsVisible(BUYER_ADD_NEW_INPUT_IDS);
// 
//     await expect(
//       this.page.getByRole("heading", { name: "Peppol Details", level: 6 })
//     ).toBeVisible();
//     await expect(
//       this.page.getByRole("heading", { name: "Address Details", level: 6 })
//     ).toBeVisible();
//     await expect(
//       this.page.getByRole("button", { name: "electronic address info" })
//     ).toBeVisible();
// 
//     await this.expectAddNewFormFooter();
//   }
// 
//   async fillInputById(inputId: string, value: string): Promise<void> {
//     const input = formInput(this.page, inputId);
//     await input.scrollIntoViewIfNeeded();
//     await input.click();
//     await input.fill(value);
//   }
// 
//   /** Whether `#inputId` exists and is enabled (e.g. `#authorityName` only under Commercial/Trade License). */
//   async isFormInputEnabled(inputId: string): Promise<boolean> {
//     const input = formInput(this.page, inputId).first();
//     if ((await input.count()) === 0) {
//       return false;
//     }
//     return input.isEnabled();
//   }
// 
//   /** Close open MUI autocomplete / select overlays (e.g. after clearing a combobox). */
//   async dismissAutocompletePopperIfOpen(): Promise<void> {
//     await dismissOpenDropdownIfOpen(this.page);
//   }
// 
//   async clearInputById(inputId: string): Promise<void> {
//     const input = formInput(this.page, inputId);
//     await input.scrollIntoViewIfNeeded();
//     await input.click();
//     await input.clear();
//     await this.dismissAutocompletePopperIfOpen();
//   }
// 
//   /**
//    * Type into a MUI autocomplete without choosing a list option (invalid / free-text values).
//    */
//   async fillAutocompleteById(inputId: string, text: string): Promise<void> {
//     const input = formInput(this.page, inputId);
//     await input.scrollIntoViewIfNeeded();
//     await input.click();
//     await input.fill(text);
//     await this.dismissAutocompletePopperIfOpen();
//   }
// 
//   async selectBuyerLegalRegIdType(typeLabel: string | RegExp): Promise<void> {
//     await this.selectAutocompleteOption("legalRegIdType", typeLabel);
//   }
// 
//   async selectBuyerCountry(countryLabel: string | RegExp): Promise<void> {
//     await this.selectAutocompleteOption("countryCode", countryLabel);
//   }
// 
//   async selectBuyerCountrySubdivision(
//     subdivisionLabel: string | RegExp,
//     options?: { filterText?: string; optionTimeoutMs?: number }
//   ): Promise<void> {
//     await this.selectAutocompleteOption("countrySubdivision", subdivisionLabel, options);
//   }
// 
//   async selectBuyerPassportCountry(countryLabel: string | RegExp): Promise<void> {
//     await this.selectAutocompleteOption("passportCountry", countryLabel);
//   }
// 
//   async selectSchemeIdentifier(schemeLabel: string | RegExp): Promise<void> {
//     await this.selectAutocompleteOption("schemeIdentifier", schemeLabel, {
//       filterText:
//         typeof schemeLabel === "string" ? schemeLabel.slice(0, 24) : undefined,
//       optionTimeoutMs: 20_000,
//     });
//   }
// 
//   async isBuyerSellerCountryLockedToUae(): Promise<boolean> {
//     const country = formInput(this.page, "countryCode");
//     if ((await country.count()) === 0) {
//       return false;
//     }
//     const current = (await country.inputValue().catch(() => "")).trim();
//     const disabled = await country.isDisabled().catch(() => false);
//     return disabled && /United Arab Emirates/i.test(current);
//   }
// 
//   async selectItemType(typeLabel: string | RegExp): Promise<void> {
//     await this.selectAutocompleteOption("itemType", typeLabel);
//   }
// 
//     async clearClassificationScheme(): Promise<void> {
//     await this.clearInputById("classifications");
//   }
// 
//   async selectClassificationScheme(
//     schemeLabel: string | RegExp = DEFAULT_UI_MASTER_CLASSIFICATION_SCHEME
//   ): Promise<void> {
//     await selectMuiAutocompleteOption(
//       this.page,
//       formInput(this.page, "classifications"),
//       schemeLabel,
//       { filterText: UI_MASTER_CLASSIFICATION_SCHEME_FILTER_TEXT }
//     );
//   }
// 
//   async selectFirstAutocompleteOption(
//     inputId: string,
//     optionTimeoutMs = 15_000
//   ): Promise<void> {
//     const input = formInput(this.page, inputId);
//     await input.scrollIntoViewIfNeeded();
//     await input.click();
//     const listbox = this.page.locator(SELECTORS.listbox).last();
//     await expect(listbox).toBeVisible({ timeout: optionTimeoutMs });
//     await listbox.locator(SELECTORS.listboxOption).first().click();
//   }
// 
//   async selectAutocompleteOption(
//     inputId: string,
//     optionName: string | RegExp,
//     options?: { filterText?: string; optionTimeoutMs?: number }
//   ): Promise<void> {
//     await selectMuiAutocompleteOption(
//       this.page,
//       formInput(this.page, inputId),
//       optionName,
//       options
//     );
//   }
// 
//     async fillBuyerSellerBaseline(excludeInputId?: string, uniqueKey?: string): Promise<void> {
//     const set = async (id: string, value: string) => {
//       if (excludeInputId !== id) {
//         await this.fillInputById(id, value);
//       }
//     };
// 
//     const key = uniqueKey ?? String(Date.now());
//     await set("name", `UI Master Buyer ${key}`);
//     await set("vatIdentifier", buildUniqueBuyerVatIdentifier(key));
//     await set("address", "Warehouse 12");
//     await set("city", "Abu Dhabi");
// 
//     if (excludeInputId !== "schemeIdentifier") {
//       const scheme = formInput(this.page, "schemeIdentifier");
//       if ((await scheme.count()) > 0) {
//         const schemeValue = (await scheme.inputValue().catch(() => "")).trim();
//         if (!schemeValue) {
//           await this.selectSchemeIdentifier(UAE_TIN_SCHEME_LABEL);
//         }
//       }
//     }
// 
//     if (excludeInputId !== "countryCode") {
//       if (!(await this.isBuyerSellerCountryLockedToUae())) {
//         await this.selectAutocompleteOption("countryCode", /^United Arab Emirates$/i);
//       }
//     }
//     if (excludeInputId !== "countrySubdivision") {
//       await this.selectAutocompleteOption(
//         "countrySubdivision",
//         DEFAULT_UAE_COUNTRY_SUBDIVISION
//       );
//     }
//   }
// 
//     async fillItemBaseline(excludeInputId?: string): Promise<void> {
//     const set = async (id: string, value: string) => {
//       if (excludeInputId !== id) {
//         await this.fillInputById(id, value);
//       }
//     };
// 
//     if (excludeInputId !== "itemType") {
//       await this.selectAutocompleteOption("itemType", DEFAULT_UI_MASTER_ITEM_TYPE);
//     }
//     if (excludeInputId !== "unitOfMeasure") {
//       await this.selectAutocompleteOption("unitOfMeasure", DEFAULT_UI_MASTER_UNIT_OF_MEASURE, {
//         filterText: DEFAULT_UI_MASTER_UNIT_OF_MEASURE,
//         optionTimeoutMs: UI_MASTER_UNIT_OF_MEASURE_TIMEOUT_MS,
//       });
//     }
//     if (excludeInputId !== "taxRateDtls[0].taxCategory") {
//       await this.selectAutocompleteOption(
//         "taxRateDtls[0].taxCategory",
//         DEFAULT_UI_MASTER_ITEM_TAX_CATEGORY
//       );
//     }
// 
//     await set("itemName", "UI Master Item");
//     await set("itemDescription", "UI master item description");
//     await set("priceBaseQty", "1.00");
//     await set("itemGrossPrice", "100.00");
//     await set("taxRateDtls[0].taxRate", "5");
//   }
// 
//   async clickSave(): Promise<void> {
//     await this.dismissAutocompletePopperIfOpen();
//     await this.page.getByRole("button", { name: "Save" }).click();
//   }
// 
//   /** Assert listed dropdowns show no field-level validation error after Save. */
//   async expectDropdownsNoValidationError(dropdowns: readonly UiMasterDropdownField[]): Promise<void> {
//     for (const { inputId } of dropdowns) {
//       await this.expectInputNoValidationError(inputId);
//     }
//   }
// 
//     async fillBuyerSellerAllDropdownsAndSave(uniqueKey?: string): Promise<void> {
//     const key = uniqueKey ?? String(Date.now());
//     await this.fillBuyerSellerBaseline(undefined, key);
//     await this.selectBuyerLegalRegIdType("Emirates ID");
//     await this.selectSchemeIdentifier(UAE_TIN_SCHEME_LABEL);
//     await this.selectFirstAutocompleteOption("peppolSchemeIdentifier");
//     await this.clickSave();
//   }
// 
//     async fillItemAllDropdownsAndSave(): Promise<void> {
//     await this.fillItemBaseline();
//     await this.selectItemType(UI_MASTER_ITEM_TYPE_GOODS);
//     await this.selectClassificationScheme();
//     await this.fillInputById(
//       "classificationIdentifier",
//       UI_MASTER_DEFAULT_CLASSIFICATION_IDENTIFIER
//     );
//     await this.clickSave();
//   }
// 
//   /** Item type + classification/SAC only â€” no unit-of-measure or tax baseline. */
//   async applyItemTypeAndOverrides(
//     itemType: string,
//     overrides?: {
//       classificationScheme?: string | null;
//       classificationIdentifier?: string | null;
//       serviceAccCode?: string | null;
//     }
//   ): Promise<void> {
//     await this.selectItemType(itemType);
// 
//     const needsScheme =
//       itemType === UI_MASTER_ITEM_TYPE_GOODS || itemType === UI_MASTER_ITEM_TYPE_BOTH;
//     const needsClassification =
//       itemType === UI_MASTER_ITEM_TYPE_GOODS || itemType === UI_MASTER_ITEM_TYPE_BOTH;
//     const needsServiceCode =
//       itemType === UI_MASTER_ITEM_TYPE_SERVICE || itemType === UI_MASTER_ITEM_TYPE_BOTH;
// 
//     if (needsScheme) {
//       if (overrides?.classificationScheme === null) {
//         await this.clearClassificationScheme();
//       } else if (overrides?.classificationScheme !== undefined) {
//         await this.selectClassificationScheme(overrides.classificationScheme);
//       } else {
//         await this.selectClassificationScheme();
//       }
//     }
// 
//     if (needsClassification) {
//       if (overrides?.classificationIdentifier === null) {
//         await this.clearInputById("classificationIdentifier");
//       } else if (overrides?.classificationIdentifier !== undefined) {
//         await this.fillInputById("classificationIdentifier", overrides.classificationIdentifier);
//       } else {
//         await this.fillInputById(
//           "classificationIdentifier",
//           UI_MASTER_DEFAULT_CLASSIFICATION_IDENTIFIER
//         );
//       }
//     } else if (overrides?.classificationIdentifier !== undefined) {
//       if (overrides.classificationIdentifier === null) {
//         await this.clearInputById("classificationIdentifier");
//       } else {
//         await this.fillInputById("classificationIdentifier", overrides.classificationIdentifier);
//       }
//     }
// 
//     if (needsServiceCode) {
//       if (overrides?.serviceAccCode === null) {
//         await this.clearInputById("serviceAccCode");
//       } else if (overrides?.serviceAccCode !== undefined) {
//         await this.fillInputById("serviceAccCode", overrides.serviceAccCode);
//       } else {
//         await this.fillInputById("serviceAccCode", UI_MASTER_DEFAULT_SERVICE_ACCOUNTING_CODE);
//       }
//     } else if (overrides?.serviceAccCode !== undefined) {
//       if (overrides.serviceAccCode === null) {
//         await this.clearInputById("serviceAccCode");
//       } else {
//         await this.fillInputById("serviceAccCode", overrides.serviceAccCode);
//       }
//     }
//   }
// 
//     async fillItemFieldsForType(
//     itemType: string,
//     overrides?: {
//       classificationScheme?: string | null;
//       classificationIdentifier?: string | null;
//       serviceAccCode?: string | null;
//     }
//   ): Promise<void> {
//     await this.fillItemBaseline("itemType");
//     await this.applyItemTypeAndOverrides(itemType, overrides);
//   }
// 
//   /** MUI helper text under the field (shown when Save fails validation). */
//   async readFieldValidationMessage(inputId: string): Promise<string> {
//     const helper = formControlForInput(this.page, inputId).locator(SELECTORS.helperText);
//     await expect(helper).toBeVisible({ timeout: 10_000 });
//     return (await helper.innerText()).trim();
//   }
// 
//     async expectInputValidationError(inputId: string): Promise<void> {
//     const input = formInput(this.page, inputId);
//     await expect(input).toHaveAttribute("aria-invalid", "true", { timeout: 10_000 });
//     const message = await this.readFieldValidationMessage(inputId);
//     expect(message.length, `Expected validation message for #${inputId}`).toBeGreaterThan(0);
//   }
// 
//     async expectInputNoValidationError(inputId: string): Promise<void> {
//     const input = formInput(this.page, inputId);
//     await expect(input).toHaveAttribute("aria-invalid", "false", { timeout: 10_000 });
//     const helper = formControlForInput(this.page, inputId).locator(SELECTORS.helperText);
//     await expect(helper).toBeHidden();
//   }
// 
//     async expectItemAddNewFormVisible(): Promise<void> {
//     await expect(this.page.locator(`${SELECTORS.itemAddNewContainer} form.add-new-form`)).toBeVisible();
// 
//     await this.expectFormFieldsVisible(ITEM_ADD_NEW_INPUT_IDS);
// 
//     await expect(
//       this.page.getByRole("heading", { name: "Item Tax Details", level: 6 })
//     ).toBeVisible();
//     await expect(this.page.getByRole("button", { name: "Add", exact: true })).toBeVisible();
// 
//     await this.expectAddNewFormFooter();
//   }
// }
