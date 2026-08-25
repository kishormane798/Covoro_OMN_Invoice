// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under a ui/ subfolder; executable code is commented out.
//
// /**
//  * **Create E-Invoice Details** (manual create from dashboard **Create Invoice**).
//  * Section order mirrors Excel field validation: document â†’ seller â†’ buyer â†’ delivery â†’ item â†’ invoice â†’ payment â†’ custom.
//  */
// 
// import { expect, type Locator, type Page } from "@playwright/test";
// import {
//   BUYER_ADD_NEW_INPUT_IDS,
//   ITEM_ADD_NEW_INPUT_IDS,
//   UIMasterBuyerAndItemPage,
// } from "./UIMasterBuyerAndItemPage";
// import type { CreateInvoiceSection } from "../../testData/ui/uiInvoiceCreationFieldMinMax";
// import {
//   DEFAULT_UI_MASTER_CLASSIFICATION_SCHEME,
//   UI_MASTER_DEFAULT_CLASSIFICATION_IDENTIFIER,
//   UI_MASTER_ITEM_TYPE_GOODS,
// } from "../Helpers/uiMasterItemTestData";
// import {
//   buildUniqueBuyerVatIdentifier,
//   DEFAULT_UAE_COUNTRY_SUBDIVISION,
//   UAE_COUNTRY_SUBDIVISION_DROPDOWN_OPTIONS,
// } from "../Helpers/uiMasterBuyerTestData";
// import {
//   dismissOpenDropdownIfOpen,
//   selectMuiAutocompleteOption,
// } from "../Helpers/uiMuiAutocompleteHelper";
// import {
//   BUYER_ELECTRONIC_ADDRESS_REQUIRES_LEGAL_REG,
//   BUYER_LEGAL_REG_IDENTIFIER_FOR_DROPDOWN_BATCH,
// } from "../../testData/ui/ConditionalValidation";
// import { CREATE_INVOICE_BUYER_IDENTIFIER_SAMPLE } from "../../testData/ui/uiInvoiceCreationBuyerConditionalValidation";
// import {
//   buildUniqueCreateInvoiceNumber,
//   CREATE_INVOICE_SEARCH_BUYER_NAME,
//   CREATE_INVOICE_SEARCH_BUYER_VAT,
// } from "../../testData/ui/uiInvoiceCreationConfig";
// import {
//   exchangeRateValueForUi,
//   invoiceCurrencyUiPick,
//   isAedInvoiceCurrency,
//   normalizeInvoiceCurrencyCode,
// } from "../../testData/ui/uiInvoiceCreationCurrency";
// import {
//   invoiceTransactionTypeUiFilterText,
//   invoiceTransactionTypeUiOption,
//   invoiceTypeUiFilterText,
//   invoiceTypeUiOption,
// } from "../../testData/ui/uiInvoiceCreationDocumentLabels";
// import {
//   calendarMonthsAfterIssue,
//   parseUiDateToIso,
//   toIsoDateLocal,
// } from "../../testData/ui/uiInvoiceCreationDocumentDates";
// import {
//   UI_PRECEDING_INVOICE_ISSUE_DATE_INPUT_ID,
//   UI_PRECEDING_INVOICE_REFERENCE_INPUT_ID,
// } from "../../testData/ui/uiInvoiceCreationCreditNote";
// import { parallelWorkerDashboardOpenOpts } from "../Helpers/worker/parallelWorkerSubmitIdentity";
// import { waitForEInvoiceListValidatingGone } from "../Helpers/waitForWithPageRefresh";
// import { buildUniqueSubmitInvoiceNumber } from "../utils/excel/invoiceExcel";
// import { DashboardPage } from "./DashboardPage";
// import {
//   isNonUaeCountryCode,
//   NON_UAE_TIN_SCHEME_LABEL,
//   UAE_TIN_SCHEME_LABEL,
// } from "../Helpers/uiSchemeCountryHelper";
// 
// export { BUYER_ADD_NEW_INPUT_IDS, ITEM_ADD_NEW_INPUT_IDS };
// 
// /** Long values use fill(); per-keystroke entry is too slow for 300-char min/max cases in CI. */
// const REPLACE_INPUT_SEQUENTIAL_MAX_LEN = 64;
// 
// export const CREATE_INVOICE_SECTION = {
//   document: "1",
//   seller: "A",
//   buyer: "B",
//   shipping: "C",
//   items: "3",
//   invoice: "4",
//   payment: "5",
//   custom: "6",
//   /** Section **7. Attachment Details** (`#file-input` / Add Files). */
//   attachment: "7",
// } as const;
// 
// const SECTION_DATA_ID: Record<CreateInvoiceSection, string> = {
//   document: CREATE_INVOICE_SECTION.document,
//   seller: CREATE_INVOICE_SECTION.seller,
//   buyer: CREATE_INVOICE_SECTION.buyer,
//   delivery: CREATE_INVOICE_SECTION.shipping,
//   item: CREATE_INVOICE_SECTION.items,
//   invoice: CREATE_INVOICE_SECTION.invoice,
//   payment: CREATE_INVOICE_SECTION.payment,
//   custom: CREATE_INVOICE_SECTION.custom,
// };
// 
// /** Where to re-open/focus before asserting on `#inputId` after Save. */
// const INPUT_ID_TO_SECTION: Partial<Record<string, CreateInvoiceSection>> = {
//   invNum: "document",
//   contactReference: "document",
//   contactValue: "document",
//   purchaseOrderRef: "document",
//   invNote: "document",
//   frequencyOfBilling: "document",
//   principleId: "document",
//   currExchangeRate: "document",
//   invStartDate: "document",
//   invEndDate: "document",
//   creditNoteRsn: "document",
//   sellerName: "seller",
//   sellerVatIdentifier: "seller",
//   sellerElectronicAddress: "seller",
//   sellerElectronicAddressScheme: "seller",
//   sellerAddressLine1: "seller",
//   sellerCity: "seller",
//   sellerPostCode: "seller",
//   sellerLegalRegIdType: "seller",
//   sellerAuthorityName: "seller",
//   sellerPassportCountry: "seller",
//   sellerCountryCode: "seller",
//   sellerCountrySubdivision: "seller",
//   name: "buyer",
//   address: "buyer",
//   city: "buyer",
//   postalCode: "buyer",
//   vatIdentifier: "buyer",
//   legalRegId: "buyer",
//   authorityName: "buyer",
//   beneficiaryId: "buyer",
//   legalRegIdType: "buyer",
//   passportCountry: "buyer",
//   countryCode: "buyer",
//   countrySubdivision: "buyer",
//   electronicAddress: "buyer",
//   electronicAddressScheme: "buyer",
//   schemeIdentifier: "buyer",
//   identifier: "buyer",
//   deliverToPartyName: "delivery",
//   deliverToLocationIdentifier: "delivery",
//   deliverToLocationScheme: "delivery",
//   actualDeliveryDate: "delivery",
//   deliverToAddressLine1: "delivery",
//   deliverToAddressLine2: "delivery",
//   deliverToAddressLine3: "delivery",
//   deliverToCity: "delivery",
//   deliverToPostCode: "delivery",
//   deliverToCountryCode: "delivery",
//   deliverToCountrySubdivision: "delivery",
//   invoiceLineIdentifier: "item",
//   invLineId: "item",
//   itemType: "item",
//   itemNetPrice: "item",
//   invoiceQty: "item",
//   invLineNetAmt: "item",
//   invLineAmt: "item",
//   unitOfMeasure: "item",
//   classifications: "item",
//   itemName: "item",
//   itemDescription: "item",
//   standardId: "item",
//   classificationIdentifier: "item",
//   serviceAccCode: "item",
//   priceBaseQty: "item",
//   itemGrossPrice: "item",
//   "chargesDtls[0].amount": "item",
//   "allowanceDtls[0].amount": "item",
//   sumOfInvLineNetAmt: "invoice",
//   totalAmtWithoutTax: "invoice",
//   totalTaxAmt: "invoice",
//   totalAmtWithTax: "invoice",
//   paidAmt: "invoice",
//   roundingAmt: "invoice",
//   paymentDueAmt: "invoice",
//   paymentMeansTypeCode: "payment",
//   paymentSchemeIdentifier: "payment",
//   paymentAccountIdentifier: "payment",
//   paymentAccountName: "payment",
//   paymentServiceProviderIdentifier: "payment",
//   paymentCardPrimaryAccountNumber: "payment",
//   paymentDueDate: "payment",
//   custom1: "custom",
//   custom2: "custom",
//   custom3: "custom",
//   custom4: "custom",
//   custom5: "custom",
// };
// 
// type CreateInvoiceFieldMeta = {
//   label: RegExp;
//   role?: "textbox" | "combobox";
// };
// 
// /** Label-based locators when Create Invoice inline edit has no `#id` on the control. */
// const CREATE_INVOICE_FIELD_LABEL: Partial<Record<string, CreateInvoiceFieldMeta>> = {
//   invNum: { label: /^Invoice No\.?\s*$/i, role: "textbox" },
//   frequencyOfBilling: { label: /^Frequency of Billing/i, role: "combobox" },
//   invNote: { label: /^Invoice note/i, role: "textbox" },
//   sellerName: { label: /^Seller Name/i, role: "textbox" },
//   sellerVatIdentifier: {
//     label: /^Seller VAT Identifier \(TRN \/ TIN\)/i,
//     role: "textbox",
//   },
//   sellerElectronicAddress: { label: /^Seller Electronic Address/i, role: "textbox" },
//   sellerElectronicAddressScheme: {
//     label: /^Seller Electronic Address Scheme|^Scheme identifier/i,
//     role: "combobox",
//   },
//   sellerAddressLine1: { label: /^Seller Address Line 1/i, role: "textbox" },
//   sellerCity: { label: /^Seller City/i, role: "textbox" },
//   sellerPostCode: { label: /^Seller Post Code/i, role: "textbox" },
//   sellerLegalRegIdType: {
//     label: /^Seller Legal Registration Identifier Type/i,
//     role: "combobox",
//   },
//   sellerAuthorityName: { label: /^Authority Name/i, role: "textbox" },
//   sellerPassportCountry: { label: /^Passport Issuing Country/i, role: "combobox" },
//   sellerCountryCode: { label: /^Seller Country$/i, role: "combobox" },
//   sellerCountrySubdivision: { label: /^Seller Country Subdivision$/i, role: "combobox" },
//   name: { label: /^Buyer Name$/i, role: "textbox" },
//   address: { label: /^Buyer Address Line 1$/i, role: "textbox" },
//   city: { label: /^Buyer City$/i, role: "textbox" },
//   postalCode: { label: /^Buyer Post(?:\s?[Cc]ode)?$/i, role: "textbox" },
//   invoiceLineIdentifier: { label: /^Invoice Line Id$/i, role: "textbox" },
//   invLineId: { label: /^Invoice Line Id$/i, role: "textbox" },
//   vatIdentifier: { label: /^Buyer VAT Identifier$/i, role: "textbox" },
//   legalRegId: { label: /^Buyer Legal Registration Identifier$/i, role: "textbox" },
//   legalRegIdType: {
//     label: /^Buyer Legal Registration Identifier Type$/i,
//     role: "combobox",
//   },
//   authorityName: { label: /^Authority Name$/i, role: "textbox" },
//   passportCountry: { label: /^Passport Issuing Country$/i, role: "combobox" },
//   countryCode: { label: /^Buyer Country$/i, role: "combobox" },
//   countrySubdivision: { label: /^Buyer Country Subdivision$/i, role: "combobox" },
//   beneficiaryId: { label: /^Beneficiary ID$/i, role: "textbox" },
//   electronicAddress: { label: /^Buyer Electronic Address$/i, role: "textbox" },
//   electronicAddressScheme: {
//     label: /^Buyer Electronic Address Scheme|^Scheme Identifier - Electronic Address/i,
//     role: "combobox",
//   },
//   schemeIdentifier: { label: /^Scheme identifier$/i, role: "combobox" },
//   identifier: { label: /^Buyer identifier$/i, role: "textbox" },
//   deliverToPartyName: { label: /^Deliver To Party Name|^Delivery Party Name/i, role: "textbox" },
//   deliverToLocationIdentifier: {
//     label: /^Deliver [Tt]o Location Identifier/i,
//     role: "textbox",
//   },
//   deliverToLocationScheme: {
//     label: /^Scheme Identifier$/i,
//     role: "combobox",
//   },
//   deliverToCity: { label: /^Deliver [Tt]o City/i, role: "textbox" },
//   deliverToAddressLine1: { label: /^Deliver [Tt]o Address Line 1/i, role: "textbox" },
//   deliverToAddressLine2: { label: /^Deliver [Tt]o Address Line 2/i, role: "textbox" },
//   deliverToAddressLine3: { label: /^Deliver [Tt]o Address Line 3/i, role: "textbox" },
//   deliverToPostCode: { label: /^Deliver [Tt]o Post(?:\s?[Cc]ode)?/i, role: "textbox" },
//   deliverToCountryCode: { label: /^Deliver [Tt]o Country/i, role: "combobox" },
//   deliverToCountrySubdivision: {
//     label: /^Deliver [Tt]o Country Subdivision/i,
//     role: "combobox",
//   },
//   paymentMeansTypeCode: {
//     label: /^Payment [Mm]eans [Tt]ype [Cc]ode|^Payment Means Type/i,
//     role: "combobox",
//   },
//   paymentSchemeIdentifier: {
//     label: /^Scheme (?:[Ii]d|[Ii]dentifier)$/i,
//     role: "textbox",
//   },
//   paymentAccountIdentifier: {
//     label: /^Payment [Aa]ccount (?:[Ii]dentifier|[Ii]d)/i,
//     role: "textbox",
//   },
//   paymentAccountName: { label: /^Payment Account Name/i, role: "textbox" },
//   paymentServiceProviderIdentifier: {
//     label: /^Payment Service Provider/i,
//     role: "textbox",
//   },
//   paymentCardPrimaryAccountNumber: { label: /^Payment Card/i, role: "textbox" },
//   custom1: { label: /^Custom 1/i, role: "textbox" },
//   custom2: { label: /^Custom 2/i, role: "textbox" },
//   custom3: { label: /^Custom 3/i, role: "textbox" },
//   custom4: { label: /^Custom 4/i, role: "textbox" },
//   custom5: { label: /^Custom 5/i, role: "textbox" },
// };
// 
// /**
//  * Caption labels inside **Item Details** view modal (`data-testid="modalBody"`).
//  * UI captions vary (Excel name vs edit-form "Invoice Line Id"); list every alias.
//  */
// const CREATE_INVOICE_ITEM_VIEW_LABELS: Partial<Record<string, readonly RegExp[]>> = {
//   invoiceLineIdentifier: [
//     /Invoice line identifier/i,
//     /Invoice Line Id/i,
//     /Invoice Line Identifier/i,
//   ],
//   invLineId: [/Invoice line identifier/i, /Invoice Line Id/i, /Invoice Line Identifier/i],
//   itemName: [/Item name/i, /Item Name/i],
//   itemDescription: [/Item description/i, /Item Description/i],
//   standardId: [/Item standard identifier/i, /Item Standard Id/i],
//   classificationIdentifier: [
//     /Item classification identifier/i,
//     /Item Classification Identifier/i,
//   ],
//   serviceAccCode: [/Service Accounting code/i, /Service Accounting Code/i],
//   priceBaseQty: [/Item price base quantity/i, /Item Price Base Quantity/i],
//   itemGrossPrice: [/Item gross price/i, /Item Gross Price/i],
// };
// 
// /** Excel/inputId â†’ actual DOM `id` on Create Invoice inline section forms. */
// const CREATE_INVOICE_DOM_ID: Partial<Record<string, string>> = {
//   sellerVatIdentifier: "vatIdentifier",
//   sellerPostCode: "postCode",
//   postalCode: "postCode",
//   sellerCountryCode: "country",
//   sellerCountrySubdivision: "countrySubdivision",
//   countryCode: "country",
//   countrySubdivision: "countrySubdivision",
//   /** Section C (Shipping) â€” DOM ids differ from logical inputIds (see export / e-commerce HTML). */
//   deliverToPartyName: "name",
//   deliverToLocationIdentifier: "deliveryLocation",
//   deliverToLocationScheme: "schemeIdentifier",
//   deliverToAddressLine1: "address1",
//   deliverToAddressLine2: "address2",
//   deliverToAddressLine3: "address3",
//   deliverToCity: "city",
//   deliverToPostCode: "postCode",
//   deliverToCountryCode: "country",
//   deliverToCountrySubdivision: "countrySubdivision",
//   /** Add Item Details modal (`#invLineId`); Excel/upload key stays `invoiceLineIdentifier`. */
//   invoiceLineIdentifier: "invLineId",
//   /** Document section â€” try common DOM ids for Frequency of Billing. */
//   frequencyOfBilling: "billingFrequency",
//   paymentMeansTypeCode: "meansType",
//   paymentSchemeIdentifier: "schemeId",
//   paymentAccountIdentifier: "accountId",
//   paymentAccountName: "accountName",
//   paymentServiceProviderIdentifier: "serviceProviderId",
//   paymentCardPrimaryAccountNumber: "primaryAccountNum",
//   paymentDueDate: "dueDate",
//   actualDeliveryDate: "actualDeliveryDate",
// };
// 
// /** Subdivision fields: UAE â†’ emirates combobox; other countries â†’ free-text textbox. */
// const COUNTRY_SUBDIVISION_INPUT_IDS = new Set<string>([
//   "sellerCountrySubdivision",
//   "countrySubdivision",
//   "deliverToCountrySubdivision",
// ]);
// 
// const SECTION_EDIT_READY: Partial<
//   Record<CreateInvoiceSection, { id?: string; label: RegExp; role?: "textbox" | "combobox" }>
// > = {
//   seller: { id: "sellerName", label: /^Seller Name/i, role: "textbox" },
//   buyer: { id: "name", label: /^Buyer Name/i, role: "textbox" },
//   delivery: { id: "name", label: /^Deliver To Party Name/i, role: "textbox" },
//   payment: { id: "accountName", label: /^Payment Account Name/i, role: "textbox" },
//   custom: { id: "custom1", label: /^Custom 1/i, role: "textbox" },
// };
// 
// export class UIInvoiceCreationManualPage {
//   private readonly dashboard: DashboardPage;
//   private readonly form: UIMasterBuyerAndItemPage;
//   /** Set when opened via upload â†’ Options â†’ Edit; preserves uploaded `#invNum`. */
//   private editModeFromUpload = false;
//   /** Options â†’ Create Copy (prefilled line + section **Update** labels like dashboard edit). */
//   private copyModeFromDashboard = false;
//   /** Set when `#invNum` is filled â€” survives document view mode after Save (Copy submit). */
//   private cachedDocumentInvoiceNumber = "";
// 
//   private resetEntryMode(): void {
//     this.editModeFromUpload = false;
//     this.copyModeFromDashboard = false;
//     this.cachedDocumentInvoiceNumber = "";
//   }
// 
//   private rememberDocumentInvoiceNumber(value: string): void {
//     const trimmed = value.trim();
//     if (trimmed) {
//       this.cachedDocumentInvoiceNumber = trimmed;
//     }
//   }
// 
//   private hasPrefilledItemLineEntry(): boolean {
//     return this.editModeFromUpload || this.copyModeFromDashboard;
//   }
// 
//   /** Edit/Copy on `/einvoice/create` â€” document uses inline Save, not View E-Invoice Details. */
//   private isCreateInvoiceShellFromDashboard(): boolean {
//     return this.editModeFromUpload || this.copyModeFromDashboard;
//   }
// 
//   private documentMainScope(): Locator {
//     return this.page.locator("main.invoice-content-container");
//   }
// 
//   /**
//    * Document inline editor on Create/Copy shell â€” fields may use label-only inputs (no `#invNum`)
//    * and may sit directly under `main`, not only inside `section[data-id="1"]`.
//    */
//   private documentEditableRoot(): Locator {
//     const main = this.documentMainScope();
//     const invoiceNo = this.documentInvoiceNumberInput();
//     const documentForm = main.locator("form.form-container").filter({ has: invoiceNo });
//     const section = this.sectionLocator("document");
//     return documentForm
//       .or(section.locator("form.form-container"))
//       .or(section)
//       .or(main.filter({ has: invoiceNo }));
//   }
// 
//   private documentInvoiceNumberInput(): Locator {
//     const main = this.documentMainScope();
//     return main
//       .locator("#invNum")
//       .or(main.getByRole("textbox", { name: /^Invoice No\.?\s*$/i }));
//   }
// 
//   constructor(private readonly page: Page) {
//     this.dashboard = new DashboardPage(page);
//     this.form = new UIMasterBuyerAndItemPage(page);
//   }
// 
//   private invoiceSection(dataId: string): Locator {
//     return this.page.locator(`section.invoice-content-section[data-id="${dataId}"]`);
//   }
// 
//   private sectionLocator(section: CreateInvoiceSection): Locator {
//     return this.invoiceSection(SECTION_DATA_ID[section]);
//   }
// 
//   /** Login â†’ e-invoice dashboard (worker TIN card) â†’ **Create Invoice** â†’ Create E-Invoice Details. */
//   async open(): Promise<void> {
//     this.resetEntryMode();
//     await this.dashboard.openDashboard(parallelWorkerDashboardOpenOpts());
//     await this.dashboard.clickCreateInvoice();
//   }
// 
//   /**
//    * Reuse path: act on the dashboard row already matched by status (no invoice-number search).
//    */
//   async openFromReusableEditRow(row: Locator): Promise<void> {
//     this.resetEntryMode();
//     this.editModeFromUpload = true;
//     await this.dashboard.openInvoiceEditOnRow(row);
//     await this.expectCreateInvoiceEditorLoaded();
//     await this.waitForCreateInvoiceIdle();
//   }
// 
//   private async waitForCopyDocumentShellStable(): Promise<void> {
//     await this.waitForCreateInvoiceIdle();
//   }
// 
//   /**
//    * Reuse path: act on the dashboard row already matched by status (no invoice-number search).
//    */
//   async openFromReusableCopyRow(row: Locator, decision: "Yes" | "No" = "Yes"): Promise<void> {
//     this.resetEntryMode();
//     this.copyModeFromDashboard = true;
//     await this.dashboard.openInvoiceCopyOnRow(row, decision);
//     if (decision === "Yes") {
//       await this.expectCreateInvoiceEditorLoaded();
//       await this.waitForCreateInvoiceIdle();
//       await this.waitForCopyDocumentShellStable();
//       await this.ensureDocumentEditable();
//     }
//   }
// 
//   /**
//    * Upload fallback: returns to invoice table, searches row, **Options â†’ Edit**.
//    */
//   async openFromUploadedInvoice(invoiceNumber: string): Promise<void> {
//     this.resetEntryMode();
//     this.editModeFromUpload = true;
//     await this.dashboard.refreshDashboardForInvoiceTable(invoiceNumber);
//     await this.dashboard.openInvoiceEdit(invoiceNumber);
//     await this.expectCreateInvoiceEditorLoaded();
//     await this.waitForCreateInvoiceIdle();
//   }
// 
//   /**
//    * Upload must already have completed. Returns to invoice table, searches row,
//    * **Options â†’ Create Copy â†’ Yes**.
//    */
//   async openFromCopiedInvoice(invoiceNumber: string): Promise<void> {
//     this.resetEntryMode();
//     this.copyModeFromDashboard = true;
//     await this.dashboard.refreshDashboardForInvoiceTable(invoiceNumber);
//     await this.dashboard.openInvoiceCopy(invoiceNumber, "Yes");
//     await this.expectCreateInvoiceEditorLoaded();
//     await this.waitForCreateInvoiceIdle();
//     await this.waitForCopyDocumentShellStable();
//     await this.ensureDocumentEditable();
//   }
// 
//   async expectCreateInvoiceEditorLoaded(): Promise<void> {
//     await this.dashboard.expectCreateInvoiceEditorLoaded();
//   }
// 
//   async expectDocumentDetailsVisible(): Promise<void> {
//     await this.expectDocumentEditMode();
//   }
// 
//   /** Bring the named section into edit mode (create or upload â†’ Edit entry). */
//   async enterSectionEditor(section: CreateInvoiceSection): Promise<void> {
//     await this.expectCreateInvoiceEditorLoaded();
//     await this.waitForCreateInvoiceIdle();
// 
//     switch (section) {
//       case "document":
//         await this.ensureDocumentEditable();
//         await this.expectDocumentDetailsVisible();
//         return;
//       case "seller":
//         await this.openSellerEditor();
//         return;
//       case "buyer":
//         await this.openBuyerEditor();
//         return;
//       case "delivery":
//         await this.openDeliveryEditor();
//         return;
//       case "item":
//         await this.openItemEditor();
//         return;
//       case "invoice":
//         await this.openInvoiceEditor();
//         return;
//       case "payment":
//         await this.openPaymentEditor();
//         return;
//       case "custom":
//         await this.openCustomEditor();
//         return;
//       default: {
//         const _exhaustive: never = section;
//         throw new Error(`Unsupported section: ${_exhaustive}`);
//       }
//     }
//   }
// 
//   private async waitForCreateInvoiceIdle(timeoutMs = 20_000): Promise<void> {
//     await waitForEInvoiceListValidatingGone(this.page, timeoutMs, {
//       loaderStuckBeforeRefreshMs: 12_000,
//       maxLoaderRefreshes: 1,
//     });
//   }
// 
//   private sectionPersistButtonLabel(): "Save" | "Update" {
//     return this.isCreateInvoiceShellFromDashboard() ? "Update" : "Save";
//   }
// 
//   /**
//    * Document `.form-footer` with **Clear All** + **Save** (create/copy inline layout).
//    * Buttons sit in `.button-wrapper` > `button` > `.btn-children`.
//    */
//   private documentFormFooterWithClearAll(): Locator {
//     const main = this.documentMainScope();
//     return main.locator(".form-footer").filter({
//       has: main.locator("button .btn-children", { hasText: /^Clear All$/ }),
//     });
//   }
// 
//   /** Document **Save** / **Update** inside the Clear All `.form-footer`. */
//   private documentFormFooterPersistButton(): Locator {
//     const footer = this.documentFormFooterWithClearAll().first();
//     const preferred = this.sectionPersistButtonLabel();
//     return footer
//       .getByRole("button", { name: preferred, exact: true })
//       .or(footer.getByRole("button", { name: "Save", exact: true }))
//       .or(footer.getByRole("button", { name: "Update", exact: true }))
//       .or(footer.locator('button[type="submit"]'));
//   }
// 
//   /** Section `.form-footer` persist action â€” **Save** or **Update** (create vs edit/copy). */
//   private sectionFormFooterPersistButton(section: Locator): Locator {
//     const footer = section.locator(".form-footer");
//     const preferred = this.sectionPersistButtonLabel();
//     const preferredBtn = footer
//       .getByRole("button", { name: preferred, exact: true })
//       .or(section.getByRole("button", { name: preferred, exact: true }));
//     const saveBtn = footer
//       .getByRole("button", { name: "Save", exact: true })
//       .or(section.getByRole("button", { name: "Save", exact: true }));
//     const updateBtn = footer
//       .getByRole("button", { name: "Update", exact: true })
//       .or(section.getByRole("button", { name: "Update", exact: true }));
//     return preferredBtn.or(saveBtn).or(updateBtn);
//   }
// 
//   private async clickPersistButton(button: Locator): Promise<void> {
//     await expect(button).toBeVisible({ timeout: 30_000 });
//     await expect(button).toBeEnabled({ timeout: 30_000 });
//     await button.scrollIntoViewIfNeeded();
//     await this.dismissAutocompletePopperIfOpen();
//     try {
//       await button.click({ timeout: 12_000 });
//     } catch {
//       await button.click({ timeout: 12_000, force: true });
//     }
//   }
// 
//     async isDocumentEditMode(): Promise<boolean> {
//     const section = this.sectionLocator("document");
//     const sectionInvNum = await section.locator("#invNum").isVisible().catch(() => false);
//     if (sectionInvNum) {
//       return this.sectionFormFooterPersistButton(section)
//         .first()
//         .isVisible()
//         .catch(() => false);
//     }
//     if (this.isCreateInvoiceShellFromDashboard()) {
//       const invVisible = await this.documentInvoiceNumberInput()
//         .first()
//         .isVisible()
//         .catch(() => false);
//       if (!invVisible) {
//         return false;
//       }
//       return this.documentFormFooterPersistButton().isVisible().catch(() => false);
//     }
//     return false;
//   }
// 
//     async isDocumentViewMode(): Promise<boolean> {
//     const section = this.sectionLocator("document");
//     if (this.isCreateInvoiceShellFromDashboard()) {
//       return !(await this.isDocumentEditMode());
//     }
//     const noInvNumInput = (await section.locator("#invNum").count()) === 0;
//     if (!noInvNumInput) {
//       return false;
//     }
//     return section
//       .locator(
//         ".input-box-container.read-only, .read-only-field, .display-inline.read-only-field, p.value, .disabled-text-field"
//       )
//       .first()
//       .isVisible()
//       .catch(() => false);
//   }
// 
//   async expectDocumentEditMode(): Promise<void> {
//     await this.dashboard.expectCreateInvoiceEditorLoaded();
//     const document = this.sectionLocator("document");
//     if (await document.locator("#invNum").isVisible().catch(() => false)) {
//       await expect(document.locator("#invNum")).toBeVisible({ timeout: 30_000 });
//       await expect(this.sectionFormFooterPersistButton(document).first()).toBeVisible({
//         timeout: 30_000,
//       });
//       return;
//     }
//     if (this.isCreateInvoiceShellFromDashboard()) {
//       await expect(this.documentInvoiceNumberInput().first()).toBeVisible({ timeout: 30_000 });
//       await expect(this.documentFormFooterPersistButton()).toBeVisible({ timeout: 30_000 });
//       return;
//     }
//     await expect(document.locator("#invNum")).toBeVisible({ timeout: 30_000 });
//   }
// 
//   /**
//    * Re-open document inputs after **View E-Invoice Details** (post-Save).
//    * Create Invoice: section **Edit** â†’ `#invNum` (Bitbucket main).
//    * Copy Invoice: inline main form OR section **Edit** when present.
//    */
//   async openDocumentEditor(): Promise<void> {
//     await this.focusSection("document");
//     if (await this.isDocumentEditMode()) {
//       return;
//     }
// 
//     const section = this.sectionLocator("document");
//     const editBtn = section
//       .locator(".divider-btn")
//       .getByRole("button", { name: "Edit", exact: true })
//       .or(section.getByRole("button", { name: "Edit", exact: true }));
//     const editVisible = await editBtn.first().isVisible().catch(() => false);
//     if (editVisible) {
//       await this.waitForCreateInvoiceIdle();
//       await editBtn.first().click();
//       await this.expectDocumentEditMode();
//       return;
//     }
// 
//     if (this.isCreateInvoiceShellFromDashboard() && (await this.isDocumentEditMode())) {
//       return;
//     }
// 
//     await expect(editBtn.first()).toBeVisible({ timeout: 30_000 });
//     await this.waitForCreateInvoiceIdle();
//     await editBtn.first().click();
//     await this.expectDocumentEditMode();
//   }
// 
//   /** Document inputs visible; re-opens **Edit** from post-Save view mode when needed. */
//   async ensureDocumentEditable(): Promise<void> {
//     await this.openDocumentEditor();
//   }
// 
//     async expectDocumentViewMode(): Promise<void> {
//     if (this.isCreateInvoiceShellFromDashboard()) {
//       await this.dashboard.expectCreateInvoiceEditorLoaded();
//       const document = this.sectionLocator("document");
//       const sectionEdit = document.getByRole("button", { name: "Edit", exact: true }).first();
//       if (await sectionEdit.isVisible().catch(() => false)) {
//         await expect(sectionEdit).toBeVisible({ timeout: 30_000 });
//         await expect(this.sectionFormFooterPersistButton(document).first()).toBeHidden({
//           timeout: 30_000,
//         });
//         return;
//       }
//       await expect(this.documentFormFooterPersistButton()).toBeHidden({ timeout: 30_000 });
//       return;
//     }
//     await this.dashboard.expectViewInvoiceDetailsLoaded();
//   }
// 
//     async focusSection(section: CreateInvoiceSection): Promise<void> {
//     const loc = this.sectionLocator(section);
//     await expect(loc).toBeVisible({ timeout: 30_000 });
//     await loc.scrollIntoViewIfNeeded();
//   }
// 
//   private modalBody(): Locator {
//     return this.page
//       .locator('[data-testid="modalBody"]')
//       .or(this.page.locator(".predefined-endpoints-modal"));
//   }
// 
//   /**
//    * Inline accordion section OR overlay modal â€” resolve once, then field by `#id` / role.
//    * Update `sectionLocator` + `modalBody` only when app layout changes.
//    */
//   private sectionOrModalRoot(section: CreateInvoiceSection): Locator {
//     return this.sectionLocator(section).or(this.modalBody());
//   }
// 
//   /** Genuine DOM `id` (see `CREATE_INVOICE_DOM_ID` when Excel key â‰  `#id`). */
//   private fieldByIdInRoot(root: Locator, inputId: string): Locator {
//     const domId = CREATE_INVOICE_DOM_ID[inputId] ?? inputId;
//     const byDomId = root.locator(`[id="${domId}"]`);
//     if (domId === inputId) {
//       return byDomId;
//     }
//     return byDomId.or(root.locator(`[id="${inputId}"]`));
//   }
// 
//   /** Fallback when inline edit omits `#id` â€” label from live UI (`CREATE_INVOICE_FIELD_LABEL`). */
//   private fieldByLabelInRoot(
//     root: Locator,
//     meta: CreateInvoiceFieldMeta,
//     inputId: string
//   ): Locator {
//     const role = meta.role ?? "textbox";
//     let byLabel = root.getByRole(role, { name: meta.label });
//     if (COUNTRY_SUBDIVISION_INPUT_IDS.has(inputId)) {
//       byLabel = byLabel.or(root.getByRole("textbox", { name: meta.label }));
//     }
//     return byLabel;
//   }
// 
//   private sectionReadyLocator(
//     section: CreateInvoiceSection,
//     ready: NonNullable<(typeof SECTION_EDIT_READY)[CreateInvoiceSection]>
//   ): Locator {
//     const root = this.sectionOrModalRoot(section);
//     const role = ready.role ?? "textbox";
//     const parts: Locator[] = [root.getByRole(role, { name: ready.label })];
//     if (ready.id) {
//       parts.push(root.locator(`[id="${ready.id}"]`));
//     }
//     if (section === "seller") {
//       parts.push(
//         root.getByRole("combobox", { name: /^Seller Legal Registration Identifier Type/i })
//       );
//     }
//     return parts.reduce((acc, loc) => acc.or(loc));
//   }
// 
//   async isSectionEditable(section: CreateInvoiceSection): Promise<boolean> {
//     const ready = SECTION_EDIT_READY[section];
//     if (!ready) return false;
//     const target = this.sectionReadyLocator(section, ready).first();
//     return target.isVisible().catch(() => false);
//   }
// 
//   /** Open section Edit only when needed; wait for label-based fields (not only `#id`). */
//   private async ensureSectionEditable(section: CreateInvoiceSection): Promise<void> {
//     await this.focusSection(section);
//     if (await this.isSectionEditable(section)) return;
// 
//     const editBtn = this.sectionLocator(section)
//       .locator(".divider-btn")
//       .getByRole("button", { name: "Edit", exact: true });
//     if (await editBtn.isVisible().catch(() => false)) {
//       await this.waitForCreateInvoiceIdle();
//       try {
//         await editBtn.click({ timeout: 8_000 });
//       } catch {
//         await editBtn.click({ timeout: 8_000, force: true });
//       }
//     }
// 
//     const ready = SECTION_EDIT_READY[section];
//     if (!ready) {
//       throw new Error(`No ready field configured for section ${section}`);
//     }
//     await expect(this.sectionReadyLocator(section, ready).first()).toBeVisible({
//       timeout: 15_000,
//     });
//   }
// 
//   async openSellerEditor(): Promise<void> {
//     await this.ensureSectionEditable("seller");
//   }
// 
//   private buyerSearchInput(): Locator {
//     const section = this.sectionLocator("buyer");
//     return section
//       .locator("#searchValue")
//       .or(section.getByRole("textbox", { name: /^Search Buyer/i }));
//   }
// 
//   /**
//    * **Search Buyer** (`#searchValue`) â†’ pick master row (default **Prashant** / `100009191900003`).
//    * No-op when the control is absent. Returns whether a row was selected.
//    */
//   async searchAndSelectBuyerIfPresent(
//     buyerName: string = CREATE_INVOICE_SEARCH_BUYER_NAME,
//     options?: { vatHint?: string }
//   ): Promise<boolean> {
//     await this.focusSection("buyer");
//     const search = this.buyerSearchInput().first();
//     if ((await search.count()) === 0 || !(await search.isVisible().catch(() => false))) {
//       return false;
//     }
// 
//     const nameAfterSelect = await this.readInputValueById("name");
//     if (new RegExp(`^${buyerName}$`, "i").test(nameAfterSelect)) {
//       return true;
//     }
// 
//     const vatHint = options?.vatHint ?? CREATE_INVOICE_SEARCH_BUYER_VAT;
//     await search.scrollIntoViewIfNeeded();
//     await search.click();
//     await search.fill(buyerName);
// 
//     const section = this.sectionLocator("buyer");
//     const results = section.locator(".search-result");
//     await expect(results.first()).toBeVisible({ timeout: 15_000 });
// 
//     let item = section.locator(".search-item").filter({
//       has: this.page.getByText(buyerName, { exact: true }),
//     });
//     if (vatHint) {
//       item = item.filter({ has: this.page.getByText(vatHint) });
//     }
//     const row = item.first();
//     await expect(row).toBeVisible({ timeout: 10_000 });
//     await row.click();
// 
//     await expect
//       .poll(async () => {
//         const name = await this.readInputValueById("name");
//         if (new RegExp(`^${buyerName}$`, "i").test(name)) {
//           return name;
//         }
//         return await this.readInputValueById("vatIdentifier");
//       })
//       .toMatch(new RegExp(`${buyerName}|${vatHint.replace(/\s/g, "").slice(0, 10)}`, "i"));
// 
//     return true;
//   }
// 
//   async openBuyerEditor(): Promise<void> {
//     await this.focusSection("buyer");
//     await this.searchAndSelectBuyerIfPresent();
//     await this.ensureSectionEditable("buyer");
//   }
// 
//   /** Buyer saved â€” summary shows read-only values and **Edit** (inputs not in DOM). */
//   private async isBuyerSectionInViewMode(): Promise<boolean> {
//     const section = this.sectionLocator("buyer");
//     const editVisible = await section
//       .locator(".divider-btn")
//       .getByRole("button", { name: "Edit", exact: true })
//       .isVisible()
//       .catch(() => false);
//     if (!editVisible) {
//       return false;
//     }
//     return !(await this.isSectionEditable("buyer"));
//   }
// 
//   async openDeliveryEditor(): Promise<void> {
//     await this.ensureSectionEditable("delivery");
//   }
// 
//   private static readonly DELIVERY_BASELINE_FIELD_IDS = [
//     "deliverToPartyName",
//     "deliverToLocationIdentifier",
//     "deliverToAddressLine1",
//     "deliverToAddressLine2",
//     "deliverToAddressLine3",
//     "deliverToCity",
//     "deliverToPostCode",
//     "deliverToCountryCode",
//     "deliverToCountrySubdivision",
//   ] as const;
// 
//   /** All delivery inputs visible in edit mode (label-based; DOM may omit `#id`). */
//   async expectDeliveryEditorFieldsVisible(): Promise<void> {
//     for (const inputId of UIInvoiceCreationManualPage.DELIVERY_BASELINE_FIELD_IDS) {
//       await expect(this.formInput(inputId).first()).toBeVisible({ timeout: 15_000 });
//     }
//   }
// 
//     async expectDeliveryBaselineFilled(): Promise<void> {
//     await expect(this.formInput("deliverToPartyName").first()).toHaveValue("Deliver To Party");
//     await expect(this.formInput("deliverToAddressLine1").first()).toHaveValue("Warehouse 12");
//     await expect(this.formInput("deliverToAddressLine2").first()).toHaveValue("Gate 2");
//     await expect(this.formInput("deliverToAddressLine3").first()).toHaveValue("Bay 3");
//     await expect(this.formInput("deliverToLocationIdentifier").first()).toHaveValue("LOC-001");
//     await expect(this.formInput("deliverToCity").first()).toHaveValue("Abu Dhabi");
//     await expect(this.formInput("deliverToPostCode").first()).toHaveValue("12345");
//     await expect(this.formInput("deliverToCountryCode").first()).toHaveValue(
//       /United Arab Emirates/i
//     );
//     await expect(this.formInput("deliverToCountrySubdivision").first()).toHaveValue(
//       new RegExp(DEFAULT_UAE_COUNTRY_SUBDIVISION, "i")
//     );
//   }
// 
//   async openPaymentEditor(): Promise<void> {
//     await this.ensureSectionEditable("payment");
//   }
// 
//   async openCustomEditor(): Promise<void> {
//     await this.ensureSectionEditable("custom");
//   }
// 
//   async openItemEditor(): Promise<void> {
//     await this.focusSection("item");
// 
//     if (this.hasPrefilledItemLineEntry()) {
//       const hasRow = await this.itemTableBodyRow(0).isVisible().catch(() => false);
//       const itemFormOpen = await this.page.locator("#itemName").isVisible().catch(() => false);
//       if (hasRow && !itemFormOpen) {
//         await this.openItemRowEdit(0);
//         return;
//       }
//       if (itemFormOpen) {
//         return;
//       }
//     }
// 
//     const addItem = this.sectionLocator("item").getByRole("button", {
//       name: "Add Item",
//       exact: true,
//     });
//     await expect(addItem).toBeVisible({ timeout: 30_000 });
//     await addItem.click();
//     await expect(this.page.locator("#itemName")).toBeVisible({ timeout: 30_000 });
//   }
// 
//   /**
//    * Saved item lines â€” `table.add-item-table` / `tbody.add-item-tbody` (MUI table body rows only).
//    */
//   private itemLinesTable(): Locator {
//     return this.sectionLocator("item").locator("table.add-item-table");
//   }
// 
//   /** Data row in the item table (excludes `thead` header rows). */
//   private itemTableBodyRow(rowIndex = 0): Locator {
//     return this.itemLinesTable().locator("tbody.add-item-tbody tr").nth(rowIndex);
//   }
// 
//   /** View / Edit / Delete cell (`.action-container[data-testid="action-container"]`). */
//   private itemLineActionContainer(rowIndex = 0): Locator {
//     return this.itemTableBodyRow(rowIndex).locator('[data-testid="action-container"]');
//   }
// 
//   async expectItemTableRowVisible(rowIndex = 0): Promise<void> {
//     await expect(this.itemTableBodyRow(rowIndex)).toBeVisible({ timeout: 15_000 });
//     await expect(this.itemLineActionContainer(rowIndex)).toBeVisible({ timeout: 15_000 });
//   }
// 
//   /**
//    * After **Add**, wait until the line is listed, the inline Add form closes, or validation rejects Add.
//    * Avoids asserting View before the table row / action icons render.
//    */
//   private async waitForItemAddSettled(timeoutMs = 20_000): Promise<void> {
//     const section = this.sectionLocator("item");
//     const actions = section
//       .locator("table.add-item-table tbody.add-item-tbody [data-testid='action-container']")
//       .first();
//     const addForm = this.page.locator("#itemName");
//     const inlineValidationError = section.locator(
//       ".MuiFormHelperText-root.Mui-error, input[aria-invalid='true']"
//     );
// 
//     await expect
//       .poll(
//         async () => {
//           if (await actions.isVisible().catch(() => false)) {
//             const formOpen = await addForm.isVisible().catch(() => false);
//             if (!formOpen) {
//               return "row";
//             }
//           }
//           const formOpen = await addForm.isVisible().catch(() => false);
//           const lineFooterOpen = await this.isItemLineFormFooterOpen();
//           const saveFooterOpen = await this.isItemSaveFormFooterOpen();
//           if (!formOpen && !lineFooterOpen && !saveFooterOpen) {
//             return "closed";
//           }
//           if (saveFooterOpen) {
//             return "save-footer";
//           }
//           if (
//             formOpen &&
//             lineFooterOpen &&
//             (await inlineValidationError.first().isVisible().catch(() => false))
//           ) {
//             return "validation";
//           }
//           return "pending";
//         },
//         { timeout: timeoutMs }
//       )
//       .not.toBe("pending");
//     await this.dismissAutocompletePopperIfOpen();
//   }
// 
//   /** Close **Item Details** view modal when open. */
//   private async closeItemDetailsViewModalIfOpen(): Promise<void> {
//     const root = this.itemDetailsViewModalRoot();
//     if (!(await root.isVisible().catch(() => false))) {
//       return;
//     }
//     await root.locator('[data-testid="modalCloseButton"]').click();
//     await expect(root).toBeHidden({ timeout: 15_000 });
//   }
// 
//   /**
//    * Open **Edit** for a saved line (second action icon). Restores `#invLineId` and other inputs.
//    */
//   async openItemRowEdit(rowIndex = 0): Promise<void> {
//     await this.focusSection("item");
//     const actions = this.itemLineActionContainer(rowIndex);
//     await expect(actions).toBeVisible({ timeout: 15_000 });
//     const editIcon = actions.locator("span.action-icon, .action-icon").nth(1);
//     await expect(editIcon).toBeVisible({ timeout: 15_000 });
//     await editIcon.scrollIntoViewIfNeeded();
//     await this.dismissAutocompletePopperIfOpen();
//     await editIcon.click();
//     await expect(this.formInput("itemName").first()).toBeVisible({ timeout: 15_000 });
//   }
// 
//   /**
//    * Open read-only **View** for a saved line (first action icon / `#View_Default`).
//    * Used after a successful **Add** when inputs leave the inline form.
//    */
//   async openItemRowView(rowIndex = 0): Promise<void> {
//     await this.focusSection("item");
//     const actions = this.itemLineActionContainer(rowIndex);
//     await expect(actions).toBeVisible({ timeout: 15_000 });
//     const viewIcon = actions.locator("span.action-icon").first();
//     await expect(viewIcon).toBeVisible({ timeout: 15_000 });
//     await viewIcon.scrollIntoViewIfNeeded();
//     await this.dismissAutocompletePopperIfOpen();
//     await viewIcon.click();
//     await this.expectItemDetailsViewTitleVisible();
//     await expect(this.itemViewModal()).toBeVisible({ timeout: 15_000 });
//   }
// 
//   /**
//    * Read-only **Item Details** dialog (`data-testid="modalBody"`).
//    * Title: `.modal-header .modal-title h4` â†’ "Item Details"; close: `[data-testid="modalCloseButton"]`.
//    */
//   private itemDetailsViewModalRoot(): Locator {
//     return this.modalBody().filter({
//       has: this.page.locator(".modal-header .modal-title h4", {
//         hasText: /^Item Details$/i,
//       }),
//     });
//   }
// 
//   /** Assert **Item Details** modal header title and close control are visible. */
//   async expectItemDetailsViewTitleVisible(): Promise<void> {
//     const root = this.itemDetailsViewModalRoot();
//     await expect(root).toBeVisible({ timeout: 15_000 });
//     await expect(root.locator(".modal-header .modal-title h4")).toHaveText(/^Item Details$/i);
//     await expect(root.locator('[data-testid="modalCloseButton"]')).toBeVisible();
//   }
// 
//   /** Read-only body inside **Item Details** (modal root; fields may sit outside `.add-item-modal-container`). */
//   private itemViewContent(): Locator {
//     return this.itemDetailsViewModalRoot();
//   }
// 
//     private itemViewModal(): Locator {
//     const root = this.itemViewContent();
//     return root
//       .locator(".add-item-modal-container")
//       .or(root.locator(".modal-body, .modal-content"))
//       .first();
//   }
// 
//   /**
//    * Item Details view value for `inputId` â€” read-only `p.value`, disabled input, or label block.
//    * Some fields (e.g. `invoiceLineIdentifier`) are omitted from the view modal entirely.
//    */
//   private itemViewFieldByInputId(inputId: string): Locator {
//     const scope = this.itemViewContent();
//     const domId = CREATE_INVOICE_DOM_ID[inputId] ?? inputId;
//     const labelPatterns = CREATE_INVOICE_ITEM_VIEW_LABELS[inputId] ?? [];
// 
//     const blocks = scope.locator(
//       ".read-only-field, .input-box-container.read-only, .input-box-container, .MuiFormControl-root"
//     );
//     const domSelector = `#${domId}, [id="${domId}"], [name="${domId}"], [name="${inputId}"]`;
//     const domControl = scope.locator(domSelector).first();
// 
//     const valueIn = (block: Locator) =>
//       block
//         .locator("p.value")
//         .or(block.locator("p"))
//         .or(block.locator("div.value"))
//         .or(block.locator(domSelector))
//         .first();
// 
//     const byDomId = valueIn(blocks.filter({ has: scope.locator(domSelector) })).or(domControl);
// 
//     const byCaption = labelPatterns.flatMap((label) => [
//       valueIn(
//         blocks.filter({
//           has: scope.locator("span, label").filter({ hasText: label }).first(),
//         })
//       ),
//       valueIn(blocks.filter({ has: scope.getByText(label) })),
//       scope.getByRole("textbox", { name: label }),
//       scope.locator(`[aria-labelledby="${domId}-label"]`).locator("input, textarea"),
//     ]);
// 
//     let result = byDomId;
//     for (const loc of byCaption) {
//       result = result.or(loc);
//     }
//     return result.first();
//   }
// 
//   private async readItemViewFieldText(valueEl: Locator): Promise<string> {
//     const tag = await valueEl.evaluate((el) => el.tagName.toLowerCase()).catch(() => "");
//     if (tag === "input" || tag === "textarea" || tag === "select") {
//       return (await valueEl.inputValue().catch(() => "")).trim();
//     }
//     return (await valueEl.innerText().catch(() => "")).trim();
//   }
// 
//   /** View may drop trailing decimals (`1.00` â†’ `1`, `100.00` â†’ `100`). */
//   private static normalizeItemViewValue(text: string): string {
//     const t = text.trim();
//     if (/^\d+\.0+$/.test(t)) {
//       return t.replace(/\.0+$/, "");
//     }
//     return t;
//   }
// 
//   /**
//    * After **Add**, assert the saved field value. Tries **Item Details** view first; when the
//    * control is not rendered there (e.g. optional `invoiceLineIdentifier`), re-opens **Edit**.
//    * On **Create Invoice**, `invoiceLineIdentifier` / `invLineId` is verified before Add â€” the
//    * post-save view shows the next auto id, so only table visibility is asserted here.
//    */
//   async expectItemFieldValueInView(inputId: string, expectedValue: string): Promise<void> {
//     if (
//       !this.editModeFromUpload &&
//       (inputId === "invoiceLineIdentifier" || inputId === "invLineId")
//     ) {
//       await this.expectItemTableRowVisible();
//       await this.expectNoVisibleFieldErrorsOnCreateInvoice();
//       return;
//     }
// 
//     await this.expectItemTableRowVisible();
//     await this.openItemRowView();
//     const scope = this.itemViewModal();
//     await expect(scope.locator(".MuiFormHelperText-root.Mui-error")).toHaveCount(0);
// 
//     if (!CREATE_INVOICE_ITEM_VIEW_LABELS[inputId]) {
//       throw new Error(
//         `No Item Details view label mapped for inputId "${inputId}"; add to CREATE_INVOICE_ITEM_VIEW_LABELS`
//       );
//     }
// 
//     const expected = UIInvoiceCreationManualPage.normalizeItemViewValue(expectedValue);
//     const valueEl = this.itemViewFieldByInputId(inputId);
//     if (await valueEl.isVisible().catch(() => false)) {
//       const actual = UIInvoiceCreationManualPage.normalizeItemViewValue(
//         await this.readItemViewFieldText(valueEl)
//       );
//       expect(actual).toBe(expected);
//       return;
//     }
// 
//     await this.closeItemDetailsViewModalIfOpen();
//     await this.openItemRowEdit();
//     await expect(this.formInput(inputId).first()).toBeVisible({ timeout: 15_000 });
//     const actual = UIInvoiceCreationManualPage.normalizeItemViewValue(
//       await this.readInputValueById(inputId)
//     );
//     expect(actual).toBe(expected);
//   }
// 
//     async fillDocumentRequiredFields(
//     excludeInputId?: string | string[],
//     uniqueKey?: string
//   ): Promise<void> {
//     await this.ensureDocumentEditable();
// 
//     const excluded = new Set(
//       excludeInputId === undefined
//         ? []
//         : Array.isArray(excludeInputId)
//           ? excludeInputId
//           : [excludeInputId]
//     );
// 
//     if (!excluded.has("invNum")) {
//       await this.ensureDocumentInvoiceNumber(uniqueKey);
//     }
//     if (!excluded.has("invIssueDate") && !excluded.has("invDate")) {
//       await this.ensureDocumentIssueDate();
//     }
//   }
// 
//   /**
//    * Unique invoice number â€” Create uses `UI-â€¦` keys; Copy/Edit use upload-style `INV-â€¦` when empty.
//    */
//   async ensureDocumentInvoiceNumber(uniqueKey?: string): Promise<void> {
//     const field =
//       this.copyModeFromDashboard || this.editModeFromUpload
//         ? this.documentInvoiceNumberInput().first()
//         : this.formInput("invNum").first();
//     if ((await field.count()) === 0) {
//       return;
//     }
//     await expect(field).toBeVisible({ timeout: 15_000 });
//     const current = (await field.inputValue().catch(() => "")).trim();
//     if (this.copyModeFromDashboard) {
//       if (current) {
//         this.rememberDocumentInvoiceNumber(current);
//         return;
//       }
//       const value = buildUniqueSubmitInvoiceNumber();
//       await this.replaceInputById("invNum", value);
//       this.rememberDocumentInvoiceNumber(value);
//       return;
//     }
//     const value = buildUniqueCreateInvoiceNumber(uniqueKey);
//     if (this.inputValueMatches(current, value)) {
//       return;
//     }
//     if (this.hasPrefilledItemLineEntry()) {
//       await this.replaceInputById("invNum", value);
//       return;
//     }
//     await this.fillInputById("invNum", value);
//   }
// 
//   /** Invoice number from document inputs â€” same locators as {@link ensureDocumentInvoiceNumber}. */
//   async readDocumentInvoiceNumber(): Promise<string> {
//     const field =
//       this.copyModeFromDashboard || this.editModeFromUpload
//         ? this.documentInvoiceNumberInput().first()
//         : this.formInput("invNum").first();
//     if ((await field.count()) > 0) {
//       const value = (await field.inputValue().catch(() => "")).trim();
//       if (value) {
//         this.rememberDocumentInvoiceNumber(value);
//         return value;
//       }
//     }
//     const sectionField = this.sectionLocator("document").locator("#invNum").first();
//     if ((await sectionField.count()) > 0) {
//       const value = (await sectionField.inputValue().catch(() => "")).trim();
//       if (value) {
//         this.rememberDocumentInvoiceNumber(value);
//         return value;
//       }
//     }
//     if (this.cachedDocumentInvoiceNumber) {
//       return this.cachedDocumentInvoiceNumber;
//     }
//     throw new Error("Document invoice number is empty or not visible.");
//   }
// 
//   /** Today's issue date unless already set â€” uses `#invIssueDate` / `#invDate` group. */
//   async ensureDocumentIssueDate(isoDate?: string): Promise<void> {
//     const iso = isoDate ?? toIsoDateLocal(new Date());
//     const current = (await this.readDocumentIssueDateIso()).trim();
//     if (current && current === iso) {
//       return;
//     }
//     for (const inputId of ["invIssueDate", "invDate"] as const) {
//       const group = this.resolveDocumentDateGroup(inputId);
//       if ((await group.count()) === 0) {
//         continue;
//       }
//       if (await group.first().isVisible().catch(() => false)) {
//         await this.fillDocumentDateById(inputId, iso);
//         return;
//       }
//     }
//     await this.fillDocumentDateByGroupLabel(/^Invoice Issue Date/i, iso);
//   }
// 
//   /**
//    * Fill valid document-section defaults for fields not under test.
//    * Does not touch `#currExchangeRate` when currency is AED (control is disabled).
//    */
//   async fillDocumentBaseline(
//     excludeInputId?: string | string[],
//     uniqueKey?: string
//   ): Promise<void> {
//     await this.ensureDocumentEditable();
// 
//     const excluded = new Set(
//       excludeInputId === undefined
//         ? []
//         : Array.isArray(excludeInputId)
//           ? excludeInputId
//           : [excludeInputId]
//     );
// 
//     if (!excluded.has("invNum")) {
//       await this.ensureDocumentInvoiceNumber(uniqueKey);
//     }
//     if (!excluded.has("invIssueDate") && !excluded.has("invDate")) {
//       await this.ensureDocumentIssueDate();
//     }
// 
//     const setIfPresent = async (id: string, value: string) => {
//       if (!excluded.has(id) && (await this.page.locator(`#${id}`).count()) > 0) {
//         await this.fillInputById(id, value);
//       }
//     };
// 
//     const invTxn = this.page.locator("#invTxnType");
//     if ((await invTxn.count()) > 0) {
//       const txnValue = (await invTxn.inputValue().catch(() => "")).trim();
//       if (!excluded.has("invTxnType") && !txnValue) {
//         await this.selectDocumentTransactionType(/Standard Tax Invoice/i);
//       }
//     }
// 
//     const invType = this.page.locator("#invType");
//     if ((await invType.count()) > 0) {
//       const typeValue = (await invType.inputValue().catch(() => "")).trim();
//       if (!excluded.has("invType") && !typeValue) {
//         await this.selectDocumentInvoiceType(/Tax Invoice/i);
//       }
//     }
// 
//     const invCurr = this.page.locator("#invCurrCode");
//     const currValue = (await invCurr.inputValue().catch(() => "")).trim();
//     if (!excluded.has("invCurrCode") && !currValue) {
//       await this.selectDocumentCurrency("AED");
//     }
// 
//     await setIfPresent("contactReference", "REF-VALID");
//     await setIfPresent("purchaseOrderRef", "PO-VALID");
//   }
// 
//   private autocompleteValueMatches(
//     currentValue: string,
//     optionName: string | RegExp
//   ): boolean {
//     const current = currentValue.trim();
//     if (typeof optionName === "string") {
//       return current.toLowerCase() === optionName.trim().toLowerCase();
//     }
//     return optionName.test(current);
//   }
// 
//   /**
//    * MUI autocompletes locked by scheme (e.g. UAE TIN â†’ Seller Country) cannot be clicked.
//    * Skip re-selection when disabled and the value already matches the scenario.
//    */
//   private async selectAutocompleteByIdUnlessDisabledMatch(
//     inputId: string,
//     optionName: string | RegExp,
//     options?: { filterText?: string; optionTimeoutMs?: number }
//   ): Promise<void> {
//     const input = this.formInput(inputId).first();
//     if ((await input.count()) > 0) {
//       const current = (await input.inputValue().catch(() => "")).trim();
//       const disabled = await input.isDisabled().catch(() => false);
//       if (disabled && this.autocompleteValueMatches(current, optionName)) {
//         return;
//       }
//     }
//     await this.selectAutocompleteById(inputId, optionName, options);
//   }
// 
//   async selectAutocompleteById(
//     inputId: string,
//     optionName: string | RegExp,
//     options?: { filterText?: string; optionTimeoutMs?: number }
//   ): Promise<void> {
//     const input = this.formInput(inputId).first();
//     await expect(input).toBeVisible({ timeout: 15_000 });
//     await selectMuiAutocompleteOption(this.page, input, optionName, options);
//   }
// 
//   /** Close open MUI autocomplete / select overlays (e.g. after clearing a combobox). */
//   async dismissAutocompletePopperIfOpen(): Promise<void> {
//     await dismissOpenDropdownIfOpen(this.page);
//   }
// 
//   /**
//    * Type into a MUI autocomplete without choosing a list option (Excel invalid / free-text values).
//    * Closes the popper so the test does not wait for a non-existent `role="option"`.
//    */
//   async fillAutocompleteById(inputId: string, text: string): Promise<void> {
//     const input = this.formInput(inputId).first();
//     await expect(input).toBeVisible({ timeout: 15_000 });
//     await input.scrollIntoViewIfNeeded();
//     await input.click();
//     await input.fill(text);
//     await this.dismissAutocompletePopperIfOpen();
//   }
// 
//   /**
//    * Invoice currency autocomplete â€” Excel ISO code â†’ UI label (e.g. AED â†’ **UAE Dirham**).
//    * Toggles `#currExchangeRate`: **disabled** for AED, **enabled** for non-AED.
//    */
//   async selectDocumentCurrency(code: string | RegExp): Promise<void> {
//     await this.ensureDocumentEditable();
//     const pick = invoiceCurrencyUiPick(code);
//     await this.selectAutocompleteById("invCurrCode", pick.option, {
//       filterText: pick.filterText,
//       optionTimeoutMs: 20_000,
//     });
//     if (isAedInvoiceCurrency(code)) {
//       await this.expectDocumentExchangeRateDisabled();
//     } else {
//       await this.expectDocumentExchangeRateEnabled();
//     }
//   }
// 
//   async isDocumentExchangeRateEnabled(): Promise<boolean> {
//     const input = this.formInput("currExchangeRate");
//     if ((await input.count()) === 0) {
//       return false;
//     }
//     return input.isEnabled();
//   }
// 
//   /**
//    * On **Create Invoice**, `#currExchangeRate` is disabled for AED.
//    * On **Edit/Copy**, the field stays enabled for AED and may be empty.
//    */
//   async expectDocumentExchangeRateDisabled(): Promise<void> {
//     const input = this.formInput("currExchangeRate");
//     await expect(input).toBeVisible({ timeout: 15_000 });
//     if (this.hasPrefilledItemLineEntry()) {
//       await expect(input).toHaveValue("");
//       return;
//     }
//     await expect(input).toBeDisabled({ timeout: 15_000 });
//   }
// 
//   async expectDocumentExchangeRateEnabled(): Promise<void> {
//     const input = this.formInput("currExchangeRate");
//     await expect(input).toBeVisible({ timeout: 15_000 });
//     await expect(input).toBeEnabled({ timeout: 15_000 });
//   }
// 
//   /**
//    * `#currExchangeRate` â€” only when **enabled** (non-AED). Numeric rate (e.g. `3.67`), not ISO code.
//    */
//   async fillDocumentExchangeRate(value: string): Promise<void> {
//     if (!(await this.isDocumentExchangeRateEnabled())) {
//       return;
//     }
//     const rate = exchangeRateValueForUi(value);
//     if (rate === "") {
//       await this.clearInputById("currExchangeRate");
//     } else {
//       await this.fillInputById("currExchangeRate", rate);
//     }
//   }
// 
//   /** Set currency + exchange rate from Excel conditional / formula data. */
//   async applyDocumentCurrencyAndExchangeRate(
//     currencyCode: string,
//     exchangeRate?: string | null
//   ): Promise<void> {
//     const iso = normalizeInvoiceCurrencyCode(currencyCode);
//     await this.selectDocumentCurrency(iso);
// 
//     if (isAedInvoiceCurrency(iso)) {
//       return;
//     }
// 
//     if (this.hasPrefilledItemLineEntry()) {
//       await this.selectDocumentTaxAccountingCurrency("AED");
//     }
// 
//     const rate = exchangeRateValueForUi(exchangeRate, iso);
//     if (rate === "") {
//       await this.clearInputById("currExchangeRate");
//     } else {
//       await this.fillInputById("currExchangeRate", rate);
//     }
//   }
// 
//   /** Required on Edit Invoice when invoice currency is not AED (UAE tax accounting currency). */
//   async selectDocumentTaxAccountingCurrency(code: string | RegExp): Promise<void> {
//     await this.ensureDocumentEditable();
//     const pick = invoiceCurrencyUiPick(code);
//     const candidates = [
//       "taxAccCurrCode",
//       "taxAccountingCurrCode",
//       "taxAccountingCurrency",
//       "taxAccountingCurr",
//       "invTaxAccCurrCode",
//     ] as const;
//     for (const id of candidates) {
//       if ((await this.formInput(id).count()) > 0) {
//         await this.selectAutocompleteByIdUnlessDisabledMatch(id, pick.option, {
//           filterText: pick.filterText,
//           optionTimeoutMs: 20_000,
//         });
//         return;
//       }
//     }
//     const combo = this.sectionLocator("document")
//       .getByRole("combobox", { name: /Tax Accounting Currency/i })
//       .first();
//     if ((await combo.count()) === 0) {
//       return;
//     }
//     const current = (await combo.inputValue().catch(() => "")).trim();
//     const disabled = await combo.isDisabled().catch(() => false);
//     if (disabled && this.autocompleteValueMatches(current, pick.option)) {
//       return;
//     }
//     await selectMuiAutocompleteOption(this.page, combo, pick.option, {
//       filterText: pick.filterText,
//       optionTimeoutMs: 20_000,
//     });
//   }
// 
//   async selectDocumentInvoiceType(typeLabel: string | RegExp): Promise<void> {
//     await this.ensureDocumentEditable();
//     const option = invoiceTypeUiOption(typeLabel);
//     await this.selectAutocompleteById("invType", option, {
//       filterText: typeof typeLabel === "string" ? invoiceTypeUiFilterText(typeLabel) : undefined,
//       optionTimeoutMs: 20_000,
//     });
//   }
// 
//   /** Frequency of Billing â€” document section combobox (`#billingFrequency` or label). */
//   async selectDocumentFrequencyOfBilling(frequencyLabel: string | RegExp): Promise<void> {
//     await this.ensureDocumentEditable();
//     await this.selectAutocompleteByIdUnlessDisabledMatch("frequencyOfBilling", frequencyLabel);
//   }
// 
//   /** Payment means type â€” payment section combobox (`#meansType` or label). */
//   async selectPaymentMeansTypeCode(typeLabel: string | RegExp): Promise<void> {
//     const candidates = [
//       "paymentMeansTypeCode",
//       "meansType",
//       "paymentMeansType",
//       "meansTypeCode",
//       "paymentMeansTypeCodeId",
//     ] as const;
//     for (const id of candidates) {
//       if ((await this.formInput(id).count()) > 0) {
//         await this.selectAutocompleteById(id, typeLabel);
//         return;
//       }
//     }
//     await this.selectAutocompleteById("paymentMeansTypeCode", typeLabel);
//   }
// 
//   async hasCreateInvoiceInput(inputId: string): Promise<boolean> {
//     return (await this.formInput(inputId).count()) > 0;
//   }
// 
//     async hasPaymentMeansFields(): Promise<boolean> {
//     return (
//       (await this.hasCreateInvoiceInput("paymentMeansTypeCode")) &&
//       (await this.hasCreateInvoiceInput("paymentAccountIdentifier"))
//     );
//   }
// 
//   async selectDocumentTransactionType(txnLabel: string | RegExp): Promise<void> {
//     await this.ensureDocumentEditable();
//     const option = invoiceTransactionTypeUiOption(txnLabel);
//     await this.selectAutocompleteById("invTxnType", option, {
//       filterText:
//         typeof txnLabel === "string"
//           ? invoiceTransactionTypeUiFilterText(txnLabel)
//           : undefined,
//       optionTimeoutMs: 20_000,
//     });
//   }
// 
//   /**
//    * MUI Pickers v7: `role="group"` (`aria-labelledby="{id}-label"`), **Choose date** calendar popper,
//    * and contenteditable Year / Month / Day segments. Prefer the calendar (Next month â†’ pick day).
//    */
//   private static readonly CALENDAR_MONTH_NAMES = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ] as const;
//   private static readonly DOCUMENT_DATE_FIELD_IDS = new Set([
//     "invStartDate",
//     "invEndDate",
//     "invIssueDate",
//     "invDate",
//     "paymentDueDate",
//     "actualDeliveryDate",
//     "proceedingDtls[0].invoiceIssueDate",
//   ]);
// 
//   private static readonly DOCUMENT_DATE_GROUP_BY_INPUT_ID: Record<string, RegExp> = {
//     invStartDate: /^Invoicing Period Start Date/i,
//     invEndDate: /^Invoicing Period End Date/i,
//     invIssueDate: /^Invoice Issue Date/i,
//     invDate: /^Invoice Issue Date/i,
//     paymentDueDate: /^Payment Due Date/i,
//     actualDeliveryDate: /^Actual Delivery Date/i,
//     "proceedingDtls[0].invoiceIssueDate": /^Preceding Invoice Issue Date/i,
//   };
// 
//   /** `role="group"` wrapping `#invStartDate` (via `aria-labelledby="{id}-label"`). */
//   private documentDateGroupByInputId(inputId: string): Locator {
//     const byLabelledBy = this.page.locator(`[aria-labelledby="${inputId}-label"]`);
//     return byLabelledBy.first();
//   }
// 
//   private documentDateGroupByLabel(groupLabel: string | RegExp): Locator {
//     return this.page.getByRole("group", { name: groupLabel });
//   }
// 
//   private resolveDocumentDateGroup(inputId: string): Locator {
//     const label = UIInvoiceCreationManualPage.DOCUMENT_DATE_GROUP_BY_INPUT_ID[inputId];
//     const section = INPUT_ID_TO_SECTION[inputId];
//     const domId = CREATE_INVOICE_DOM_ID[inputId] ?? inputId;
// 
//     if (section === "payment" || section === "delivery") {
//       const root = this.sectionLocator(section);
//       if (label) {
//         return root.getByRole("group", { name: label });
//       }
//       return root
//         .locator(`[aria-labelledby="${domId}-label"]`)
//         .or(root.locator(`[aria-labelledby="${inputId}-label"]`));
//     }
// 
//     const searchRoot = this.sectionLocator("document");
//     const byId = searchRoot
//       .locator(`[aria-labelledby="${inputId}-label"]`)
//       .or(searchRoot.locator(`[aria-labelledby="${domId}-label"]`))
//       .or(this.documentDateGroupByInputId(inputId))
//       .or(this.page.locator(`[aria-labelledby="${domId}-label"]`));
//     return byId.or(label ? searchRoot.getByRole("group", { name: label }) : byId);
//   }
// 
//   private parseIsoDateParts(isoDate: string): { year: string; month: string; day: string } {
//     const m = isoDate.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
//     if (!m) {
//       throw new Error(`Expected ISO date YYYY-MM-DD, got "${isoDate}"`);
//     }
//     return { year: m[1], month: m[2], day: m[3] };
//   }
// 
//   private async readDateSegmentValue(spin: Locator): Promise<string> {
//     return ((await spin.textContent()) ?? "").trim();
//   }
// 
//   private async typeDateSegment(spin: Locator, value: string): Promise<void> {
//     await spin.scrollIntoViewIfNeeded();
//     await spin.click({ clickCount: 3 });
//     await spin.fill(value);
//     await spin.press("Tab");
//   }
// 
//   private parseCalendarHeaderLabel(
//     label: string
//   ): { year: number; monthIndex: number } | null {
//     const match = label.trim().match(/^(\w+)\s+(\d{4})$/);
//     if (!match) {
//       return null;
//     }
//     const monthIndex = UIInvoiceCreationManualPage.CALENDAR_MONTH_NAMES.findIndex(
//       (name) => name.toLowerCase() === match[1].toLowerCase()
//     );
//     if (monthIndex < 0) {
//       return null;
//     }
//     return { year: Number(match[2]), monthIndex };
//   }
// 
//   /** First **visible** **Next month** (live probe: `.last()` can target a stale closed popper). */
//   private visiblePickerNextMonthButton(): Locator {
//     return this.page.getByRole("button", { name: "Next month" }).first();
//   }
// 
//   /** Popper wrapping the visible **Next month** control (live class: `MuiPickerPopper-root`). */
//   private visibleDatePickerSurface(): Locator {
//     return this.visiblePickerNextMonthButton().locator(
//       "xpath=ancestor::*[contains(@class,'MuiPickerPopper-root') or contains(@class,'MuiPickersPopper-root')][1]"
//     );
//   }
// 
//   private async readPickerCalendarMonthLabel(surface: Locator): Promise<string | null> {
//     const header = surface.locator(
//       ".MuiPickersCalendarHeader-label, [id$='-grid-label']"
//     );
//     if ((await header.count()) > 0) {
//       const text = (await header.first().textContent())?.trim();
//       if (text) {
//         return text;
//       }
//     }
//     const gridLabel = await surface.getByRole("grid").first().getAttribute("aria-label");
//     if (gridLabel?.trim()) {
//       return gridLabel.trim();
//     }
//     return null;
//   }
// 
//   /** Clicks **Next month** on the visible picker (evaluate avoids flaky detached popper clicks). */
//   private async clickVisiblePickerNextMonthOnce(): Promise<void> {
//     const clicked = await this.page.evaluate(() => {
//       const isVisible = (el: Element) => {
//         const rect = el.getBoundingClientRect();
//         return rect.width > 0 && rect.height > 0;
//       };
//       const poppers = Array.from(
//         document.querySelectorAll(".MuiPickerPopper-root, .MuiPickersPopper-root")
//       ).filter(isVisible) as HTMLElement[];
//       const root = poppers[poppers.length - 1];
//       if (!root) {
//         return false;
//       }
//       const btn = root.querySelector(
//         'button[aria-label="Next month"]'
//       ) as HTMLButtonElement | null;
//       if (!btn || btn.disabled) {
//         return false;
//       }
//       btn.click();
//       return true;
//     });
//     if (!clicked) {
//       const nextBtn = this.visiblePickerNextMonthButton();
//       await expect(nextBtn).toBeEnabled({ timeout: 5_000 });
//       await nextBtn.click();
//     }
//   }
// 
//   private async clickPickerNextMonth(times: number): Promise<void> {
//     for (let i = 0; i < times; i++) {
//       await this.clickVisiblePickerNextMonthOnce();
//     }
//   }
// 
//   private async pickerDayIsAvailable(isoDate: string): Promise<boolean> {
//     const { year, month, day } = this.parseIsoDateParts(isoDate);
//     const y = Number(year);
//     const m = Number(month) - 1;
//     const d = Number(day);
//     return this.page.evaluate(
//       ({ y: year, m: month, d: day }) => {
//         const isVisible = (el: Element) => {
//           const rect = el.getBoundingClientRect();
//           return rect.width > 0 && rect.height > 0;
//         };
//         const poppers = Array.from(
//           document.querySelectorAll(".MuiPickerPopper-root, .MuiPickersPopper-root")
//         ).filter(isVisible) as HTMLElement[];
//         const root = poppers[poppers.length - 1];
//         if (!root) {
//           return false;
//         }
//         const buttons = Array.from(
//           root.querySelectorAll("button.MuiPickersDay-root[role='gridcell']")
//         ) as HTMLButtonElement[];
//         for (const btn of buttons) {
//           if (btn.disabled || btn.classList.contains("Mui-disabled")) {
//             continue;
//           }
//           const ts = btn.getAttribute("data-timestamp");
//           if (!ts) {
//             continue;
//           }
//           const dt = new Date(Number(ts));
//           const local =
//             dt.getFullYear() === year && dt.getMonth() === month && dt.getDate() === day;
//           const utc =
//             dt.getUTCFullYear() === year &&
//             dt.getUTCMonth() === month &&
//             dt.getUTCDate() === day;
//           if (local || utc) {
//             return true;
//           }
//         }
//         return false;
//       },
//       { y, m, d }
//     );
//   }
// 
//   private async navigatePickerUntilDayAvailable(
//     isoDate: string,
//     monthOffsetFromIssue: number
//   ): Promise<void> {
//     if (await this.pickerDayIsAvailable(isoDate)) {
//       return;
//     }
// 
//     const { year, month } = this.parseIsoDateParts(isoDate);
//     const targetYear = Number(year);
//     const targetMonthIndex = Number(month) - 1;
//     const targetMonthIdx = targetYear * 12 + targetMonthIndex;
// 
//     const surface = this.visibleDatePickerSurface();
//     const maxSteps = Math.max(Math.abs(monthOffsetFromIssue), 0) + 14;
// 
//     for (let i = 0; i < maxSteps; i++) {
//       if (await this.pickerDayIsAvailable(isoDate)) {
//         return;
//       }
// 
//       const label = await this.readPickerCalendarMonthLabel(surface);
//       const current = label ? this.parseCalendarHeaderLabel(label) : null;
//       if (!current) {
//         break;
//       }
// 
//       const currentMonthIdx = current.year * 12 + current.monthIndex;
//       if (currentMonthIdx < targetMonthIdx) {
//         const nextBtn = this.visiblePickerNextMonthButton();
//         if (!(await nextBtn.isEnabled().catch(() => false))) {
//           break;
//         }
//         await this.clickVisiblePickerNextMonthOnce();
//       } else if (currentMonthIdx > targetMonthIdx) {
//         const prevBtn = this.page.getByRole("button", { name: "Previous month" }).first();
//         if (!(await prevBtn.isEnabled().catch(() => false))) {
//           break;
//         }
//         await this.clickVisiblePickerPreviousMonthOnce();
//       } else {
//         break;
//       }
//     }
// 
//     await this.waitForPickerDayAvailable(isoDate);
//   }
// 
//   private async waitForPickerDayAvailable(isoDate: string): Promise<void> {
//     await expect(async () => {
//       expect(await this.pickerDayIsAvailable(isoDate)).toBe(true);
//     }).toPass({ timeout: 10_000 });
//   }
// 
//   /** Clicks **Previous month** on the visible picker (evaluate avoids flaky detached popper clicks). */
//   private async clickVisiblePickerPreviousMonthOnce(): Promise<void> {
//     const clicked = await this.page.evaluate(() => {
//       const isVisible = (el: Element) => {
//         const rect = el.getBoundingClientRect();
//         return rect.width > 0 && rect.height > 0;
//       };
//       const poppers = Array.from(
//         document.querySelectorAll(".MuiPickerPopper-root, .MuiPickersPopper-root")
//       ).filter(isVisible) as HTMLElement[];
//       const root = poppers[poppers.length - 1];
//       if (!root) {
//         return false;
//       }
//       const btn = root.querySelector(
//         'button[aria-label="Previous month"]'
//       ) as HTMLButtonElement | null;
//       if (!btn || btn.disabled) {
//         return false;
//       }
//       btn.click();
//       return true;
//     });
//     if (!clicked) {
//       const prevBtn = this.page.getByRole("button", { name: "Previous month" }).first();
//       await expect(prevBtn).toBeEnabled({ timeout: 5_000 });
//       await prevBtn.click({ force: true });
//     }
//   }
// 
//   private async clickPickerPreviousMonth(times: number): Promise<void> {
//     for (let i = 0; i < times; i++) {
//       await this.clickVisiblePickerPreviousMonthOnce();
//     }
//   }
// 
//   /** Click enabled `MuiPickersDay` via `data-timestamp` in the visible popper. */
//   private async clickPickerDay(isoDate: string): Promise<void> {
//     const { year, month, day } = this.parseIsoDateParts(isoDate);
//     const y = Number(year);
//     const m = Number(month) - 1;
//     const d = Number(day);
//     const clicked = await this.page.evaluate(
//       ({ y: year, m: month, d: day }) => {
//         const isVisible = (el: Element) => {
//           const rect = el.getBoundingClientRect();
//           return rect.width > 0 && rect.height > 0;
//         };
//         const poppers = Array.from(
//           document.querySelectorAll(".MuiPickerPopper-root, .MuiPickersPopper-root")
//         ).filter(isVisible) as HTMLElement[];
//         const root = poppers[poppers.length - 1];
//         if (!root) {
//           return false;
//         }
//         const buttons = Array.from(
//           root.querySelectorAll("button.MuiPickersDay-root[role='gridcell']")
//         ) as HTMLButtonElement[];
//         for (const btn of buttons) {
//           if (btn.disabled || btn.classList.contains("Mui-disabled")) {
//             continue;
//           }
//           const ts = btn.getAttribute("data-timestamp");
//           if (!ts) {
//             continue;
//           }
//           const dt = new Date(Number(ts));
//           const local =
//             dt.getFullYear() === year && dt.getMonth() === month && dt.getDate() === day;
//           const utc =
//             dt.getUTCFullYear() === year &&
//             dt.getUTCMonth() === month &&
//             dt.getUTCDate() === day;
//           if (local || utc) {
//             btn.click();
//             return true;
//           }
//         }
//         return false;
//       },
//       { y, m, d }
//     );
// 
//     if (clicked) {
//       return;
//     }
// 
//     const surface = this.visibleDatePickerSurface();
//     const monthLabel = (await this.readPickerCalendarMonthLabel(surface)) ?? "?";
//     const fallback = surface.getByRole("gridcell", {
//       name: String(d),
//       exact: true,
//       disabled: false,
//     });
//     if ((await fallback.count()) > 0) {
//       await fallback.first().click();
//       return;
//     }
// 
//     throw new Error(`Could not click picker day ${isoDate} (calendar "${monthLabel}")`);
//   }
// 
//   private async dismissDatePickerIfOpen(): Promise<void> {
//     const nextBtn = this.page.getByRole("button", { name: "Next month" }).first();
//     if (await nextBtn.isVisible().catch(() => false)) {
//       await this.page.keyboard.press("Escape");
//       await expect(nextBtn).toBeHidden({ timeout: 5_000 });
//     }
//   }
// 
//   private async fillDocumentDateViaCalendar(
//     group: Locator,
//     isoDate: string,
//     monthOffsetFromIssue?: number
//   ): Promise<void> {
//     await this.dismissDatePickerIfOpen();
// 
//     const chooseDate = group.getByRole("button", { name: /^Choose date/i });
//     await chooseDate.scrollIntoViewIfNeeded();
//     await chooseDate.click();
// 
//     const surface = this.visibleDatePickerSurface();
//     await expect(this.visiblePickerNextMonthButton()).toBeVisible({ timeout: 15_000 });
//     await expect(surface).toBeVisible({ timeout: 10_000 });
// 
//     const clicks =
//       monthOffsetFromIssue ??
//       calendarMonthsAfterIssue(await this.readDocumentIssueDateIso(), isoDate);
//     await this.navigatePickerUntilDayAvailable(isoDate, clicks);
//     await this.clickPickerDay(isoDate);
// 
//     await expect(surface).toBeHidden({ timeout: 15_000 });
//     await this.dismissDatePickerIfOpen();
//   }
// 
//   private async fillDocumentDateViaSegments(group: Locator, isoDate: string): Promise<void> {
//     const { year, month, day } = this.parseIsoDateParts(isoDate);
//     const yearSpin = group.getByRole("spinbutton", { name: "Year" });
//     const monthSpin = group.getByRole("spinbutton", { name: "Month" });
//     const daySpin = group.getByRole("spinbutton", { name: "Day" });
// 
//     await this.typeDateSegment(yearSpin, year);
//     await this.typeDateSegment(monthSpin, month);
//     await this.typeDateSegment(daySpin, day);
//     await daySpin.press("Tab");
// 
//     await expect(async () => {
//       expect(await this.readDateSegmentValue(yearSpin)).toBe(year);
//       expect((await this.readDateSegmentValue(monthSpin)).padStart(2, "0")).toBe(month);
//       expect((await this.readDateSegmentValue(daySpin)).padStart(2, "0")).toBe(day);
//     }).toPass({ timeout: 10_000 });
//   }
// 
//   private async fillDocumentDateGroup(
//     group: Locator,
//     isoDate: string,
//     monthOffsetFromIssue?: number
//   ): Promise<void> {
//     await group.scrollIntoViewIfNeeded();
//     await expect(group).toBeVisible({ timeout: 15_000 });
// 
//     const chooseDate = group.getByRole("button", { name: /^Choose date/i });
//     if ((await chooseDate.count()) > 0) {
//       await this.fillDocumentDateViaCalendar(group, isoDate, monthOffsetFromIssue);
//       await this.syncDocumentDateHiddenInput(group, isoDate);
//     } else {
//       await this.fillDocumentDateViaSegments(group, isoDate);
//     }
// 
//     await expect(async () => {
//       const readBack = await this.readDocumentDateGroupIso(group);
//       expect(readBack).toBe(isoDate);
//     }).toPass({ timeout: 15_000 });
//   }
// 
//   /** Read ISO date from a MUI date group; returns `null` when all hidden inputs are empty. */
//   private async readDocumentDateGroupIso(group: Locator): Promise<string | null> {
//     if ((await group.count()) === 0) {
//       return null;
//     }
// 
//     const inputValues = await group.evaluate((root) => {
//       const values: string[] = [];
//       root.querySelectorAll("input").forEach((el) => {
//         if (el.getAttribute("role") === "spinbutton") {
//           return;
//         }
//         values.push((el as HTMLInputElement).value.trim());
//       });
//       return values;
//     });
//     if (inputValues.length > 0 && inputValues.every((v) => v === "")) {
//       return null;
//     }
//     for (const raw of inputValues) {
//       const parsed = parseUiDateToIso(raw);
//       if (parsed) {
//         return parsed;
//       }
//     }
// 
//     for (const hiddenId of ["dueDate", "paymentDueDate"] as const) {
//       const hidden = group.locator(`input#${hiddenId}`);
//       if ((await hidden.count()) > 0) {
//         const byId = parseUiDateToIso((await hidden.first().inputValue()).trim());
//         if (byId) {
//           return byId;
//         }
//       }
//     }
// 
//     const chooseDate = group.getByRole("button", { name: /^Choose date/i });
//     if ((await chooseDate.count()) > 0) {
//       const label = (await chooseDate.getAttribute("aria-label")) ?? "";
//       const selected = label.match(/selected date is\s+(.+)$/i);
//       if (selected?.[1]) {
//         const fromLabel = parseUiDateToIso(selected[1].trim());
//         if (fromLabel) {
//           return fromLabel;
//         }
//       }
//     }
// 
//     const year = await this.readDateSegmentValue(group.getByRole("spinbutton", { name: "Year" }));
//     const month = await this.readDateSegmentValue(
//       group.getByRole("spinbutton", { name: "Month" })
//     );
//     const day = await this.readDateSegmentValue(group.getByRole("spinbutton", { name: "Day" }));
//     if (!year || !month || !day || /YYYY|MM|DD/i.test(`${year}${month}${day}`)) {
//       return null;
//     }
//     return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
//   }
// 
//   /** Document section label block â€” view mode `p.value`, edit mode `input`. */
//   private async readDocumentSectionFieldText(label: RegExp): Promise<string> {
//     const section = this.sectionLocator("document");
//     const readOnlyBlock = section
//       .locator(".display-inline.read-only-field, .read-only-field, .input-box-container")
//       .filter({ has: section.getByText(label) })
//       .first();
//     if ((await readOnlyBlock.count()) > 0) {
//       const valueEl = readOnlyBlock.locator("p.value, paragraph").first();
//       if ((await valueEl.count()) > 0) {
//         const text = (await valueEl.innerText()).trim();
//         if (text && text !== "------------") {
//           return text;
//         }
//       }
//     }
// 
//     const labeled = section.getByText(label).first();
//     if ((await labeled.count()) > 0) {
//       const row = labeled.locator(
//         "xpath=ancestor::div[contains(@class,'read-only-field') or contains(@class,'input-box') or contains(@class,'MuiFormControl') or contains(@class,'display-inline')][1]"
//       );
//       const valueEl = row.locator("p.value, div.value, paragraph").first();
//       if ((await valueEl.count()) > 0) {
//         const text = (await valueEl.innerText()).trim();
//         if (text && text !== "------------") {
//           return text;
//         }
//       }
//     }
// 
//     return "";
//   }
// 
//   async readDocumentIssueDateIso(): Promise<string> {
//     for (const inputId of ["invIssueDate", "invDate"] as const) {
//       const fromGroup = await this.readDocumentDateGroupIso(
//         this.resolveDocumentDateGroup(inputId)
//       );
//       if (fromGroup) {
//         return fromGroup;
//       }
//     }
//     const viewIssue = parseUiDateToIso(
//       await this.readDocumentSectionFieldText(/^Invoice Issue Date/i)
//     );
//     if (viewIssue) {
//       return viewIssue;
//     }
//     if (this.isCreateInvoiceShellFromDashboard()) {
//       return "";
//     }
//     return toIsoDateLocal(new Date());
//   }
// 
//   /** Read a document MUI date field as ISO (`yyyy-mm-dd`), or `null` when empty. */
//   async readDocumentDateFieldIso(inputId: string): Promise<string | null> {
//     const fromGroup = await this.readDocumentDateGroupIso(this.resolveDocumentDateGroup(inputId));
//     if (fromGroup) {
//       return fromGroup;
//     }
//     const label = UIInvoiceCreationManualPage.DOCUMENT_DATE_GROUP_BY_INPUT_ID[inputId];
//     if (!label) {
//       return null;
//     }
//     const viewText = await this.readDocumentSectionFieldText(label);
//     return viewText ? parseUiDateToIso(viewText) : null;
//   }
// 
//   async fillDocumentDateByGroupLabel(
//     groupLabel: string | RegExp,
//     isoDate: string
//   ): Promise<void> {
//     const group = this.documentDateGroupByLabel(groupLabel);
//     await this.fillDocumentDateGroup(group, isoDate);
//   }
// 
//   /** Clear hidden MUI date input inside a date group (no calendar / segment interaction). */
//   private async clearDocumentDateViaHiddenInput(group: Locator): Promise<void> {
//     const inputs = group.locator("input");
//     const count = await inputs.count();
//     for (let i = 0; i < count; i++) {
//       await inputs.nth(i).evaluate((el) => {
//         const input = el as HTMLInputElement;
//         input.value = "";
//         input.dispatchEvent(new Event("input", { bubbles: true }));
//         input.dispatchEvent(new Event("change", { bubbles: true }));
//       });
//     }
//     await this.blurActiveElement();
//   }
// 
//   /** After calendar pick, sync hidden `#dueDate` / `#paymentDueDate` when MUI leaves it empty. */
//   private async syncDocumentDateHiddenInput(group: Locator, isoDate: string): Promise<void> {
//     const inputs = group.locator("input");
//     const count = await inputs.count();
//     for (let i = 0; i < count; i++) {
//       const input = inputs.nth(i);
//       const current = (await input.inputValue()).trim();
//       if (current === isoDate) {
//         continue;
//       }
//       await input.evaluate((el, value) => {
//         const node = el as HTMLInputElement;
//         node.value = value;
//         node.dispatchEvent(new Event("input", { bubbles: true }));
//         node.dispatchEvent(new Event("change", { bubbles: true }));
//       }, isoDate);
//     }
//     await this.blurActiveElement();
//   }
// 
//   /**
//    * Clear a document MUI date group. Invoicing period and payment due use **Choose date**;
//    * segment spinbuttons exist in the DOM but are not reliably editable.
//    */
//   async clearDocumentDateGroup(group: Locator): Promise<void> {
//     await group.scrollIntoViewIfNeeded();
//     await expect(group).toBeVisible({ timeout: 15_000 });
//     await this.dismissDatePickerIfOpen();
// 
//     const clearBtn = group.getByRole("button", { name: /^Clear$/i });
//     if ((await clearBtn.count()) > 0 && (await clearBtn.first().isVisible().catch(() => false))) {
//       await clearBtn.first().click();
//       await this.blurActiveElement();
//       await this.dismissDatePickerIfOpen();
//       if ((await this.readDocumentDateGroupIso(group)) === null) {
//         return;
//       }
//     }
// 
//     const chooseDate = group.getByRole("button", { name: /^Choose date/i });
//     if ((await chooseDate.count()) > 0) {
//       await this.setDocumentDateGroupRawValue(group, "");
//       await this.clearDocumentDateViaHiddenInput(group);
//       const label = (await chooseDate.getAttribute("aria-label")) ?? "";
//       if (/selected date is/i.test(label)) {
//         await chooseDate.focus();
//         await this.page.keyboard.press("ControlOrMeta+A");
//         await this.page.keyboard.press("Backspace");
//         await chooseDate.press("Tab");
//         await this.setDocumentDateGroupRawValue(group, "");
//         await this.clearDocumentDateViaHiddenInput(group);
//       }
//       await expect
//         .poll(async () => await this.readDocumentDateGroupIso(group), { timeout: 10_000 })
//         .toBeNull();
//       await this.dismissDatePickerIfOpen();
//       return;
//     }
// 
//     const yearSpin = group.getByRole("spinbutton", { name: "Year" });
//     const hasSegments =
//       (await yearSpin.count()) > 0 &&
//       (await yearSpin.first().isVisible().catch(() => false));
// 
//     if (hasSegments) {
//       for (const part of ["Year", "Month", "Day"] as const) {
//         const spin = group.getByRole("spinbutton", { name: part });
//         await this.typeDateSegment(spin, "");
//       }
//       await group.getByRole("spinbutton", { name: "Day" }).press("Tab");
//       return;
//     }
// 
//     await this.clearDocumentDateViaHiddenInput(group);
//   }
// 
//   /** Set all non-spinbutton inputs inside a MUI date group (payment due `#dueDate` has no stable id). */
//   private async setDocumentDateGroupRawValue(group: Locator, rawValue: string): Promise<void> {
//     await group.scrollIntoViewIfNeeded();
//     await group.evaluate((root, value) => {
//       root.querySelectorAll("input").forEach((el) => {
//         const input = el as HTMLInputElement;
//         if (input.getAttribute("role") === "spinbutton") {
//           return;
//         }
//         input.value = value;
//         input.dispatchEvent(new Event("input", { bubbles: true }));
//         input.dispatchEvent(new Event("change", { bubbles: true }));
//       });
//     }, rawValue);
//     await this.blurActiveElement();
//   }
// 
//   async fillDocumentDateById(inputId: string, isoDate: string): Promise<void> {
//     if (UIInvoiceCreationManualPage.DOCUMENT_DATE_FIELD_IDS.has(inputId)) {
//       const group = this.resolveDocumentDateGroup(inputId);
//       let monthOffsetFromIssue: number | undefined;
//       const issueIso = await this.readDocumentIssueDateIso();
// 
//       if (
//         inputId === "invStartDate" ||
//         inputId === "invEndDate" ||
//         inputId === "paymentDueDate" ||
//         inputId === "actualDeliveryDate" ||
//         inputId === UI_PRECEDING_INVOICE_ISSUE_DATE_INPUT_ID
//       ) {
//         monthOffsetFromIssue = calendarMonthsAfterIssue(issueIso, isoDate);
//       } else if (inputId === "invIssueDate" || inputId === "invDate") {
//         const currentIssue =
//           (await this.readDocumentDateGroupIso(this.resolveDocumentDateGroup("invIssueDate"))) ??
//           issueIso;
//         monthOffsetFromIssue = calendarMonthsAfterIssue(currentIssue, isoDate);
//       }
// 
//       if (
//         (inputId === "paymentDueDate" || inputId === "actualDeliveryDate") &&
//         (monthOffsetFromIssue ?? 0) < 0
//       ) {
//         try {
//           await this.fillDocumentDateGroup(group, isoDate, monthOffsetFromIssue);
//         } catch {
//           await this.fillDocumentDateViaSegments(group, isoDate);
//           await expect(async () => {
//             expect(await this.readDocumentDateGroupIso(group)).toBe(isoDate);
//           }).toPass({ timeout: 15_000 });
//         }
//         return;
//       }
// 
//       await this.fillDocumentDateGroup(group, isoDate, monthOffsetFromIssue);
//       return;
//     }
//     await this.fillInputById(inputId, isoDate);
//   }
// 
//   /** Assert hidden MUI date input value (`#invStartDate`, `#paymentDueDate`, â€¦). */
//   async expectDocumentDateFieldValue(inputId: string, expectedIso: string): Promise<void> {
//     await expect
//       .poll(async () => await this.readDocumentDateFieldIso(inputId), { timeout: 10_000 })
//       .toBe(expectedIso);
//   }
// 
//   async clearDocumentDateById(inputId: string): Promise<void> {
//     if (UIInvoiceCreationManualPage.DOCUMENT_DATE_FIELD_IDS.has(inputId)) {
//       await this.clearDocumentDateGroup(this.resolveDocumentDateGroup(inputId));
//       return;
//     }
//     await this.clearInputById(inputId);
//   }
// 
//   /**
//    * Set payment / period hidden `#paymentDueDate` (or similar) without calendar navigation.
//    * Used for invalid format, whitespace-only, and other non-ISO Excel matrix values.
//    */
//   async setDocumentDateHiddenValue(inputId: string, rawValue: string): Promise<void> {
//     const group = this.resolveDocumentDateGroup(inputId);
//     await group.scrollIntoViewIfNeeded();
//     const domId = CREATE_INVOICE_DOM_ID[inputId] ?? inputId;
//     const hiddenByInputId = group.locator(`input[id="${inputId}"]`);
//     const hiddenByDomId = group.locator(`input[id="${domId}"]`);
//     const hiddenCount = await hiddenByInputId.count();
//     const domIdHiddenCount = await hiddenByDomId.count();
//     const hidden =
//       hiddenCount > 0
//         ? hiddenByInputId.first()
//         : domIdHiddenCount > 0
//           ? hiddenByDomId.first()
//           : null;
//     if (hidden) {
//       await hidden.evaluate((el, value) => {
//         const input = el as HTMLInputElement;
//         input.value = value;
//         input.dispatchEvent(new Event("input", { bubbles: true }));
//         input.dispatchEvent(new Event("change", { bubbles: true }));
//       }, rawValue);
//     } else if (inputId === "paymentDueDate" || inputId === "actualDeliveryDate") {
//       await this.setDocumentDateGroupRawValue(group, rawValue);
//     } else {
//       await this.fillInputById(inputId, rawValue);
//     }
//     await this.blurActiveElement();
//   }
// 
//   /**
//    * IBG-14 â€” `#invStartDate` / `#invEndDate`.
//    * Empty string = leave the field as-is (do not open calendar or clear segments).
//    */
//   async setDocumentInvoicingPeriod(
//     startDate: string | undefined,
//     endDate: string | undefined
//   ): Promise<void> {
//     const start = startDate?.trim() ?? "";
//     const end = endDate?.trim() ?? "";
// 
//     if (start !== "") {
//       await this.fillDocumentDateById("invStartDate", start);
//     }
//     if (end !== "") {
//       await this.fillDocumentDateById("invEndDate", end);
//     }
//   }
// 
//   /**
//    * Clear period via hidden `#invStartDate` / `#invEndDate` without requiring MUI read-back null.
//    * Use when calendar **Choose date** keeps a stale aria-label after clear (Summary â†’ Commercial flows).
//    */
//   async clearDocumentInvoicingPeriodSoft(): Promise<void> {
//     await this.page.keyboard.press("Escape");
//     for (const inputId of ["invStartDate", "invEndDate"] as const) {
//       await this.setDocumentDateHiddenValue(inputId, "");
//       await this.touchDocumentDateFieldForValidation(inputId);
//     }
//     await this.blurActiveElement();
//   }
// 
//   /** Type into `#creditNoteRsn` without picking a list option (whitespace / invalid values). */
//   async fillDocumentCreditNoteReasonFreeText(value: string): Promise<void> {
//     await this.clearAutocompleteById("creditNoteRsn");
//     const input = this.formInput("creditNoteRsn");
//     await input.scrollIntoViewIfNeeded();
//     await input.click();
//     await input.fill(value);
//     await input.press("Tab");
//   }
// 
//   async selectDocumentCreditNoteReason(reasonLabel: string | RegExp): Promise<void> {
//     const filterText =
//       typeof reasonLabel === "string" ? reasonLabel.trim().slice(0, 50) : undefined;
//     const option =
//       typeof reasonLabel === "string"
//         ? new RegExp(
//             `^${reasonLabel.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
//             "i"
//           )
//         : reasonLabel;
//     await this.selectAutocompleteById("creditNoteRsn", option, {
//       filterText,
//       optionTimeoutMs: 20_000,
//     });
//   }
// 
//   /**
//    * Preceding invoice reference + issue date (`proceedingDtls[0].*`).
//    * Fields are enabled after credit note type + a nonâ€“Volume Discount reason.
//    */
//   async fillDocumentPrecedingInvoice(
//     reference: string,
//     issueDateIso?: string
//   ): Promise<void> {
//     await this.focusSection("document");
//     const refInput = this.formInput(UI_PRECEDING_INVOICE_REFERENCE_INPUT_ID);
//     await expect(refInput).toBeEnabled({ timeout: 20_000 });
//     await this.fillInputById(UI_PRECEDING_INVOICE_REFERENCE_INPUT_ID, reference);
// 
//     const issueIso = (issueDateIso ?? "").trim() || (await this.readDocumentIssueDateIso());
//     const dateInput = this.formInput(UI_PRECEDING_INVOICE_ISSUE_DATE_INPUT_ID);
//     await expect(dateInput).toBeEnabled({ timeout: 20_000 });
//     await this.fillDocumentDateById(UI_PRECEDING_INVOICE_ISSUE_DATE_INPUT_ID, issueIso);
//   }
// 
//   async selectSellerLegalRegIdType(typeLabel: string | RegExp): Promise<void> {
//     await this.selectAutocompleteById("sellerLegalRegIdType", typeLabel);
//   }
// 
//   async selectSellerPassportCountry(countryLabel: string | RegExp): Promise<void> {
//     await this.selectAutocompleteById("sellerPassportCountry", countryLabel);
//   }
// 
//   async selectSellerCountry(countryLabel: string | RegExp): Promise<void> {
//     await this.selectAutocompleteByIdUnlessDisabledMatch(
//       "sellerCountryCode",
//       countryLabel
//     );
//   }
// 
//   async selectSellerCountrySubdivision(
//     subdivisionLabel: string | RegExp,
//     options?: { filterText?: string; optionTimeoutMs?: number }
//   ): Promise<void> {
//     const filterText =
//       options?.filterText ??
//       (typeof subdivisionLabel === "string" ? subdivisionLabel : undefined);
//     await this.selectAutocompleteById("sellerCountrySubdivision", subdivisionLabel, {
//       ...options,
//       filterText,
//       optionTimeoutMs: options?.optionTimeoutMs ?? 15_000,
//     });
//   }
// 
//   /** Seller scheme ids tried in order (Create Invoice may use any of these). */
//   private static readonly SELLER_SCHEME_INPUT_IDS = [
//     "sellerElectronicAddressScheme",
//     "schemeIdentifier",
//     "electronicAddressScheme",
//   ] as const;
// 
//   async isSellerCountryLockedToUae(): Promise<boolean> {
//     const country = this.formInput("sellerCountryCode").first();
//     if ((await country.count()) === 0) {
//       return false;
//     }
//     const current = (await country.inputValue().catch(() => "")).trim();
//     const disabled = await country.isDisabled().catch(() => false);
//     return disabled && /United Arab Emirates/i.test(current);
//   }
// 
//   async selectSellerElectronicAddressScheme(
//     schemeLabel: string | RegExp
//   ): Promise<void> {
//     for (const inputId of UIInvoiceCreationManualPage.SELLER_SCHEME_INPUT_IDS) {
//       if ((await this.formInput(inputId).count()) > 0) {
//         await this.selectAutocompleteById(inputId, schemeLabel, {
//           filterText:
//             typeof schemeLabel === "string"
//               ? schemeLabel.slice(0, 24)
//               : undefined,
//           optionTimeoutMs: 20_000,
//         });
//         return;
//       }
//     }
//     throw new Error(
//       "Seller electronic address scheme control not found on Create Invoice seller section"
//     );
//   }
// 
//   /**
//    * UAE TIN scheme locks country to United Arab Emirates; pick a non-TIN scheme first
//    * when the scenario needs another country.
//    */
//   async ensureSellerSchemeAllowsCountryChange(countryCode: string): Promise<void> {
//     if (!isNonUaeCountryCode(countryCode)) {
//       return;
//     }
//     if (await this.isSellerCountryLockedToUae()) {
//       await this.selectSellerElectronicAddressScheme(NON_UAE_TIN_SCHEME_LABEL);
//     }
//   }
// 
//   async selectDeliverToCountry(countryLabel: string | RegExp): Promise<void> {
//     await this.selectAutocompleteById("deliverToCountryCode", countryLabel);
//     await this.dismissAutocompletePopperIfOpen();
//     await expect(this.formInput("deliverToCountrySubdivision").first()).toBeVisible({
//       timeout: 20_000,
//     });
//   }
// 
//   async selectDeliverToCountrySubdivision(
//     subdivisionLabel: string | RegExp,
//     options?: { filterText?: string; optionTimeoutMs?: number }
//   ): Promise<void> {
//     const filterText =
//       options?.filterText ??
//       (typeof subdivisionLabel === "string" ? subdivisionLabel : undefined);
//     await this.selectAutocompleteById("deliverToCountrySubdivision", subdivisionLabel, {
//       ...options,
//       filterText,
//       optionTimeoutMs: options?.optionTimeoutMs ?? 15_000,
//     });
//   }
// 
//   /**
//    * Deliver-to subdivision â€” UAE â†’ emirates dropdown; other countries â†’ free text.
//    * Matches conditional UI helper behaviour for export / non-UAE delivery countries.
//    */
//   async fillDeliverToCountrySubdivision(countryCode: string, subdivision: string): Promise<void> {
//     const trimmed = subdivision.trim();
//     if (!trimmed) {
//       return;
//     }
//     const current = await this.readInputValueById("deliverToCountrySubdivision");
//     if (current === trimmed) {
//       return;
//     }
//     if (countryCode && isNonUaeCountryCode(countryCode)) {
//       await this.fillInputById("deliverToCountrySubdivision", trimmed);
//       return;
//     }
//     if (!(UAE_COUNTRY_SUBDIVISION_DROPDOWN_OPTIONS as readonly string[]).includes(trimmed)) {
//       await this.fillAutocompleteById("deliverToCountrySubdivision", trimmed);
//       return;
//     }
//     await this.selectDeliverToCountrySubdivision(trimmed);
//   }
// 
//   /** Reverse-charge line â€” **Type of goods or services subject to RCM** (MUI combobox). */
//   async selectTypeOfGoodsSubjectToRcm(optionLabel: string | RegExp): Promise<void> {
//     const section = this.sectionLocator("item");
//     const modal = this.modalBody();
//     const input = section
//       .getByRole("combobox", { name: /Type of goods or services subject to RCM/i })
//       .or(modal.getByRole("combobox", { name: /Type of goods or services subject to RCM/i }))
//       .first();
//     await expect(input).toBeVisible({ timeout: 15_000 });
//     const filterText = typeof optionLabel === "string" ? optionLabel.slice(0, 30) : undefined;
//     await selectMuiAutocompleteOption(this.page, input, optionLabel, {
//       filterText,
//       optionTimeoutMs: 20_000,
//     });
//   }
// 
//   async fillSellerBaseline(excludeInputId?: string | string[]): Promise<void> {
//     const excluded = new Set(
//       excludeInputId === undefined
//         ? []
//         : Array.isArray(excludeInputId)
//           ? excludeInputId
//           : [excludeInputId]
//     );
//     const set = async (id: string, value: string) => {
//       if (!excluded.has(id) && (await this.formInput(id).count()) > 0) {
//         await this.fillInputById(id, value);
//       }
//     };
//     await set("sellerName", "UI Create Invoice Seller");
//     await set("sellerElectronicAddress", "seller@test.example.com");
//     await set("sellerAddressLine1", "Office 101, Business Bay Tower");
//     await set("sellerCity", "Dubai");
//     await set("sellerPostCode", "12345");
// 
//     if (!excluded.has("sellerElectronicAddressScheme")) {
//       for (const schemeId of UIInvoiceCreationManualPage.SELLER_SCHEME_INPUT_IDS) {
//         if ((await this.formInput(schemeId).count()) > 0) {
//           const scheme = this.formInput(schemeId).first();
//           const schemeValue = (await scheme.inputValue().catch(() => "")).trim();
//           if (!schemeValue) {
//             await this.selectSellerElectronicAddressScheme(UAE_TIN_SCHEME_LABEL);
//           }
//           break;
//         }
//       }
//     }
// 
//     if (!excluded.has("sellerCountryCode")) {
//       const country = this.formInput("sellerCountryCode").first();
//       if ((await country.count()) > 0) {
//         if (!(await this.isSellerCountryLockedToUae())) {
//           await this.selectSellerCountry(/^United Arab Emirates$/i);
//         }
//       }
//     }
//     if (!excluded.has("sellerCountrySubdivision")) {
//       const subdivision = this.formInput("sellerCountrySubdivision").first();
//       if ((await subdivision.count()) > 0) {
//         const current = (await subdivision.inputValue().catch(() => "")).trim();
//         if (!current) {
//           await this.selectSellerCountrySubdivision(DEFAULT_UAE_COUNTRY_SUBDIVISION);
//         }
//       }
//     }
//   }
// 
//   async fillDeliveryBaseline(excludeInputId?: string): Promise<void> {
//     const set = async (id: string, value: string) => {
//       if (excludeInputId !== id && (await this.formInput(id).count()) > 0) {
//         await this.fillInputById(id, value);
//       }
//     };
//     await set("deliverToPartyName", "Deliver To Party");
//     await set("deliverToAddressLine1", "Warehouse 12");
//     await set("deliverToAddressLine2", "Gate 2");
//     await set("deliverToAddressLine3", "Bay 3");
//     await set("deliverToLocationIdentifier", "LOC-001");
//     await set("deliverToCity", "Abu Dhabi");
//     await set("deliverToPostCode", "12345");
// 
//     if (
//       excludeInputId !== "deliverToCountryCode" &&
//       (await this.formInput("deliverToCountryCode").count()) > 0
//     ) {
//       await this.selectDeliverToCountry(/^United Arab Emirates$/i);
//     }
//     if (
//       excludeInputId !== "deliverToCountrySubdivision" &&
//       (await this.formInput("deliverToCountrySubdivision").count()) > 0
//     ) {
//       await this.selectDeliverToCountrySubdivision(DEFAULT_UAE_COUNTRY_SUBDIVISION);
//     }
//   }
// 
//   async fillPaymentBaseline(excludeInputId?: string): Promise<void> {
//     const set = async (id: string, value: string) => {
//       if (excludeInputId !== id && (await this.formInput(id).count()) > 0) {
//         await this.fillInputById(id, value);
//       }
//     };
//     await set("paymentAccountName", "Payment Account");
//     await set("paymentServiceProviderIdentifier", "12345678901");
//     await set("paymentCardPrimaryAccountNumber", "4111111111111111");
//   }
// 
//   /** Focus / blur MUI date group so empty required `#paymentDueDate` validates on Save. */
//   async touchDocumentDateFieldForValidation(inputId: string): Promise<void> {
//     const group = this.resolveDocumentDateGroup(inputId);
//     await group.scrollIntoViewIfNeeded();
//     await this.dismissDatePickerIfOpen();
// 
//     const chooseDate = group.getByRole("button", { name: /^Choose date/i });
//     if ((await chooseDate.count()) > 0) {
//       await chooseDate.focus();
//       await this.page.keyboard.press("Tab");
//     }
// 
//     for (const part of ["Year", "Month", "Day"] as const) {
//       const spin = group.getByRole("spinbutton", { name: part });
//       if ((await spin.count()) > 0 && (await spin.first().isVisible().catch(() => false))) {
//         await spin.first().focus();
//         await spin.first().press("Tab");
//       }
//     }
// 
//     await this.blurActiveElement();
//     await this.dismissDatePickerIfOpen();
//   }
// 
//   async fillCustomBaseline(excludeInputId?: string): Promise<void> {
//     for (const n of [1, 2, 3, 4, 5]) {
//       const id = `custom${n}`;
//       if (excludeInputId !== id && (await this.page.locator(`#${id}`).count()) > 0) {
//         await this.fillInputById(id, `Custom field ${n}`);
//       }
//     }
//   }
// 
//   private formInput(inputId: string): Locator {
//     const section = INPUT_ID_TO_SECTION[inputId];
//     const meta = CREATE_INVOICE_FIELD_LABEL[inputId];
// 
//     let root: Locator;
//     if (section) {
//       root = this.sectionOrModalRoot(section);
//       if (section === "document" && this.copyModeFromDashboard) {
//         root = root.or(this.documentEditableRoot());
//       }
//       if (section === "item") {
//         const sectionRoot = this.sectionLocator(section);
//         const activeForm = sectionRoot.filter({
//           has: sectionRoot.locator('[id="itemName"]').filter({ visible: true }),
//         });
//         root = activeForm.or(this.modalBody());
//       }
//     } else {
//       root = this.modalBody().or(this.page.locator("main.invoice-content-container"));
//     }
// 
//     const byId = this.fieldByIdInRoot(root, inputId);
//     const locator = meta ? byId.or(this.fieldByLabelInRoot(root, meta, inputId)) : byId;
//     return locator.filter({ visible: true }).first();
//   }
// 
//   private formControlForInput(inputId: string): Locator {
//     return this.formInput(inputId)
//       .first()
//       .locator("xpath=ancestor::div[contains(@class,'MuiFormControl-root')][1]");
//   }
// 
//   private inputValueMatches(current: string, expected: string): boolean {
//     const c = current.trim();
//     const e = expected.trim();
//     if (c === e) {
//       return true;
//     }
//     const cn = Number(c.replace(/,/g, ""));
//     const en = Number(e.replace(/,/g, ""));
//     return Number.isFinite(cn) && Number.isFinite(en) && cn === en;
//   }
// 
//   /** Fill a visible text input; retries with force-click when an overlay blocks the first `fill()`. */
//   async fillInputById(inputId: string, value: string): Promise<void> {
//     await this.dismissAutocompletePopperIfOpen();
//     const input = this.formInput(inputId).first();
//     await expect(input).toBeVisible({ timeout: 15_000 });
//     await input.scrollIntoViewIfNeeded();
// 
//     const current = (await input.inputValue().catch(() => "")).trim();
//     if (this.inputValueMatches(current, value)) {
//       return;
//     }
// 
//     try {
//       await input.fill(value, { timeout: 10_000 });
//     } catch {
//       try {
//         await input.click({ force: true, timeout: 5_000 });
//       } catch {
//         /* fill() already attempted focus; force-click is a last resort */
//       }
//       await input.fill(value, { timeout: 10_000 });
//     }
//     await this.dismissAutocompletePopperIfOpen();
//   }
// 
//   /** Whether `#inputId` exists and is enabled. */
//   async isFormInputEnabled(inputId: string): Promise<boolean> {
//     const input = this.formInput(inputId).first();
//     if ((await input.count()) === 0) {
//       return false;
//     }
//     return input.isEnabled();
//   }
// 
//   /** No-op when the control is missing or disabled (e.g. `#principleId` when txn is not Disclosed Agent). */
//   async replaceInputByIdIfEnabled(inputId: string, value: string): Promise<void> {
//     if (!(await this.isFormInputEnabled(inputId))) {
//       return;
//     }
//     await this.replaceInputById(inputId, value);
//   }
// 
//   /**
//    * Replace a text input value (clears prefilled master/search data first).
//    * Values longer than {@link REPLACE_INPUT_SEQUENTIAL_MAX_LEN} use `fill()` for CI speed;
//    * shorter values use keystrokes so MUI/React keeps literal spaces.
//    */
//   async replaceInputById(inputId: string, value: string): Promise<void> {
//     const input =
//       inputId === "invNum" && this.copyModeFromDashboard
//         ? this.documentInvoiceNumberInput().first()
//         : this.formInput(inputId).first();
//     await expect(input).toBeVisible({ timeout: 15_000 });
//     await input.scrollIntoViewIfNeeded();
//     await input.click();
//     await input.press("Control+a");
//     await input.press("Backspace");
//     let applied = value;
//     if (value.length > 0) {
//       if (value.length > REPLACE_INPUT_SEQUENTIAL_MAX_LEN) {
//         await input.fill(value, { timeout: 10_000 });
//       } else {
//         await input.pressSequentially(value, { delay: 15 });
//       }
//       const maxLengthAttr = await input.getAttribute("maxlength");
//       const maxLength = maxLengthAttr ? Number.parseInt(maxLengthAttr, 10) : Number.NaN;
//       applied =
//         Number.isFinite(maxLength) && maxLength > 0 ? value.slice(0, maxLength) : value;
//       await expect(input).toHaveValue(applied, { timeout: 5_000 });
//     } else {
//       await this.dismissAutocompletePopperIfOpen();
//     }
//     if (inputId === "invNum" && applied.length > 0) {
//       this.rememberDocumentInvoiceNumber(applied);
//     }
//   }
// 
//   async readInputValueById(inputId: string): Promise<string> {
//     const input = this.formInput(inputId).first();
//     if ((await input.count()) === 0) {
//       return "";
//     }
//     return (await input.inputValue().catch(() => "")).trim();
//   }
// 
//   /** Clear MUI autocomplete â€” `.clear()` alone does not reset selected master-data values. */
//   async clearAutocompleteById(inputId: string): Promise<void> {
//     const input = this.formInput(inputId).first();
//     await expect(input).toBeVisible({ timeout: 15_000 });
//     await input.scrollIntoViewIfNeeded();
// 
//     const control = this.formControlForInput(inputId);
//     const clearBtn = control.locator(
//       'button[aria-label="Clear"], .MuiAutocomplete-clearIndicator'
//     );
//     if ((await clearBtn.count()) > 0 && (await clearBtn.first().isVisible().catch(() => false))) {
//       await clearBtn.first().click();
//       await this.dismissAutocompletePopperIfOpen();
//       return;
//     }
// 
//     await input.click();
//     await this.page.keyboard.press("ControlOrMeta+A");
//     await this.page.keyboard.press("Backspace");
//     await input.press("Tab");
//     await this.dismissAutocompletePopperIfOpen();
//   }
// 
//   async clearInputById(inputId: string): Promise<void> {
//     if (CREATE_INVOICE_FIELD_LABEL[inputId]?.role === "combobox") {
//       await this.clearAutocompleteById(inputId);
//       return;
//     }
//     const input = this.formInput(inputId).first();
//     await expect(input).toBeVisible({ timeout: 15_000 });
//     await input.scrollIntoViewIfNeeded();
//     await input.click();
//     await input.clear();
//     await this.dismissAutocompletePopperIfOpen();
//   }
// 
//   /** Clear only when the control already has a value (skip click when empty). */
//   async clearInputByIdIfNotEmpty(inputId: string): Promise<void> {
//     if ((await this.readInputValueById(inputId)) === "") {
//       return;
//     }
//     await this.clearInputById(inputId);
//   }
// 
//     async fillFirstAvailableId(candidateIds: readonly string[], value: string): Promise<void> {
//     for (const id of candidateIds) {
//       if ((await this.formInput(id).count()) > 0) {
//         await this.fillInputById(id, value);
//         return;
//       }
//     }
//   }
// 
//   async clearFirstAvailableId(candidateIds: readonly string[]): Promise<void> {
//     for (const id of candidateIds) {
//       if ((await this.formInput(id).count()) > 0) {
//         await this.clearInputById(id);
//         return;
//       }
//     }
//   }
// 
//   async readNumericFieldValue(inputId: string): Promise<string> {
//     const input = this.formInput(inputId);
//     await expect(input).toBeVisible({ timeout: 15_000 });
//     return (await input.inputValue().catch(async () => (await input.innerText()) ?? "")).trim();
//   }
// 
//   async expectNumericFieldValue(
//     inputId: string,
//     expected: string,
//     options?: { message?: string; precision?: number }
//   ): Promise<void> {
//     const raw = await this.readNumericFieldValue(inputId);
//     const actual = Number(raw.replace(/,/g, ""));
//     const exp = Number(expected);
//     expect(actual, options?.message).toBeCloseTo(exp, options?.precision ?? 2);
//   }
// 
//     async ensureItemAddFormClosed(timeoutMs = 15_000): Promise<void> {
//     await this.dismissAutocompletePopperIfOpen();
//     const addForm = this.itemAddDetailsFormOpen();
//     await expect
//       .poll(
//         async () => {
//           const formOpen = await addForm.isVisible().catch(() => false);
//           const lineFooterOpen = await this.isItemLineFormFooterOpen();
//           const rowVisible = await this.itemTableBodyRow(0).isVisible().catch(() => false);
//           if (rowVisible && !formOpen && !lineFooterOpen) {
//             return true;
//           }
//           const saveFooterOpen = await this.isItemSaveFormFooterOpen();
//           return !formOpen && !lineFooterOpen && !saveFooterOpen;
//         },
//         { timeout: timeoutMs }
//       )
//       .toBe(true);
//   }
// 
//   /** Invoice section **Total** tab (charges/allowance use other tab panels). */
//   private async ensureInvoiceTotalTabActive(): Promise<void> {
//     const section = this.sectionLocator("invoice");
//     const totalTab = section.getByRole("button", { name: /^Total$/i });
//     if (!(await totalTab.isVisible().catch(() => false))) {
//       return;
//     }
//     const cls = (await totalTab.getAttribute("class").catch(() => "")) ?? "";
//     if (!/\btab-active\b/.test(cls)) {
//       await totalTab.click({ timeout: 10_000 });
//     }
//     const totalPanel = section.locator('[data-testid="TOTAL"]').first();
//     if (await totalPanel.isVisible().catch(() => false)) {
//       await expect(totalPanel).toBeVisible({ timeout: 15_000 });
//     }
//   }
// 
//   /**
//    * Section 4 â€” open **Edit** on Total tab so all calculated `#id` fields (e.g. `#paymentDueAmt`) are visible.
//    * View mode often hides Amount Due below a collapsed block.
//    */
//   async openInvoiceEditor(): Promise<void> {
//     await this.dismissAutocompletePopperIfOpen();
//     await this.closeItemDetailsViewModalIfOpen();
//     await this.ensureItemAddFormClosed();
//     await this.focusSection("invoice");
//     await this.ensureInvoiceTotalTabActive();
//     const section = this.sectionLocator("invoice");
//     const sumField = section.locator("#sumOfInvLineNetAmt");
//     if (await sumField.isVisible().catch(() => false)) {
//       return;
//     }
//     const editBtn = section
//       .locator(".divider-btn")
//       .getByRole("button", { name: "Edit", exact: true });
//     if (await editBtn.isVisible().catch(() => false)) {
//       await this.waitForCreateInvoiceIdle();
//       await editBtn.click();
//     }
//     await expect(
//       sumField.or(
//         section
//           .locator('[data-testid="TOTAL"]')
//           .getByText(/Sum of Invoice Line Net Amount/i)
//           .first()
//       )
//     ).toBeVisible({ timeout: 15_000 });
//   }
// 
//   /** Section 4 â€” **Invoice Details** `.form-footer` **Save** / **Update**. */
//   async clickInvoiceSectionSave(): Promise<void> {
//     await this.openInvoiceEditor();
//     const section = this.sectionLocator("invoice");
//     const sectionSave = this.sectionFormFooterPersistButton(section).last();
//     await expect(sectionSave, `Invoice Details section ${this.sectionPersistButtonLabel()}`).toBeVisible({
//       timeout: 15_000,
//     });
//     await this.clickPersistButton(sectionSave);
//   }
// 
//     async readInvoiceNumericFieldValue(inputId: string): Promise<string> {
//     await this.openInvoiceEditor();
//     const field = this.sectionLocator("invoice").locator(`[id="${inputId}"]`).first();
//     if ((await field.count()) === 0) {
//       return "";
//     }
//     await field.scrollIntoViewIfNeeded();
//     return (
//       await field.inputValue().catch(async () => (await field.innerText()) ?? "")
//     ).trim();
//   }
// 
//     async expectInvoiceNumericFieldValue(
//     inputId: string,
//     expected: string,
//     options?: { message?: string; precision?: number }
//   ): Promise<void> {
//     await this.openInvoiceEditor();
//     const section = this.sectionLocator("invoice");
//     const field = section.locator(`[id="${inputId}"]`).first();
//     await field.scrollIntoViewIfNeeded();
//     const exp = Number(expected);
//     const message = options?.message ?? `Invoice field #${inputId}`;
// 
//     await expect
//       .poll(
//         async () => {
//           const raw = (
//             await field.inputValue().catch(async () => (await field.innerText()) ?? "")
//           ).trim();
//           return Number(raw.replace(/,/g, ""));
//         },
//         { message, timeout: 20_000 }
//       )
//       .toBeCloseTo(exp, options?.precision ?? 2);
//   }
// 
//   private invoiceSummaryScope(): Locator {
//     const section = this.sectionLocator("invoice");
//     const totalPanel = section.locator('[data-testid="TOTAL"]');
//     return totalPanel.or(section);
//   }
// 
//   /** Read invoice section (4) total by label â€” view mode uses `p.value`, edit mode may use `input`. */
//   private async readInvoiceSummaryAmount(label: RegExp): Promise<string> {
//     const section = this.sectionLocator("invoice");
//     await this.ensureInvoiceTotalTabActive();
//     const scope = this.invoiceSummaryScope();
// 
//     const readOnlyBlock = scope
//       .locator(".display-inline.read-only-field, .read-only-field")
//       .filter({ has: scope.getByText(label) })
//       .first();
//     if ((await readOnlyBlock.count()) > 0) {
//       const valueEl = readOnlyBlock.locator("p.value, paragraph").first();
//       if ((await valueEl.count()) > 0) {
//         const text = (await valueEl.innerText()).trim();
//         if (text && text !== "------------") return text;
//       }
//     }
// 
//     const byControl = scope.locator(".MuiFormControl-root").filter({
//       has: scope.getByText(label),
//     });
//     if ((await byControl.count()) > 0) {
//       const input = byControl.locator("input").first();
//       if ((await input.count()) > 0) {
//         const text = (
//           await input.inputValue().catch(async () => (await input.innerText()) ?? "")
//         ).trim();
//         if (text) return text;
//       }
//     }
// 
//     const labeled = scope.getByText(label).first();
//     if ((await labeled.count()) > 0) {
//       const row = labeled.locator(
//         "xpath=ancestor::div[contains(@class,'read-only-field') or contains(@class,'input-box') or contains(@class,'MuiFormControl') or contains(@class,'display-inline')][1]"
//       );
//       const valueEl = row.locator("p.value, div.value, paragraph").first();
//       if ((await valueEl.count()) > 0) {
//         const text = (await valueEl.innerText()).trim();
//         if (text && text !== "------------") return text;
//       }
//       const inputInRow = row.locator("input").first();
//       if ((await inputInRow.count()) > 0) {
//         const text = (
//           await inputInRow.inputValue().catch(async () => (await inputInRow.innerText()) ?? "")
//         ).trim();
//         if (text) return text;
//       }
//     }
// 
//     return "";
//   }
// 
//     async expectInvoiceSummaryAmount(
//     label: RegExp,
//     expected: string,
//     options?: { message?: string; precision?: number }
//   ): Promise<void> {
//     const section = this.sectionLocator("invoice");
//     await section.scrollIntoViewIfNeeded();
//     const exp = Number(expected);
//     const message = options?.message ?? `Invoice summary ${String(label)}`;
// 
//     await expect
//       .poll(
//         async () => {
//           const raw = await this.readInvoiceSummaryAmount(label);
//           return Number(raw.replace(/,/g, ""));
//         },
//         { message, timeout: 20_000 }
//       )
//       .toBeCloseTo(exp, options?.precision ?? 2);
//   }
// 
//   async waitForItemCalculatedFieldsSettle(ms: number): Promise<void> {
//     await this.page.waitForTimeout(ms);
//   }
// 
//   async blurActiveElement(): Promise<void> {
//     await this.page.keyboard.press("Tab");
//   }
// 
//   /** Page footer **Submit** (`.btn-container` â†’ pushes draft to e-invoice dashboard list). */
//   createInvoicePageSubmitButton(): Locator {
//     return this.page
//       .locator(".btn-container .button-wrapper button.base-btn")
//       .filter({ has: this.page.locator(".btn-children", { hasText: /^Submit$/ }) })
//       .or(
//         this.page.locator(".btn-container button", {
//           has: this.page.locator(".btn-children", { hasText: /^Submit$/ }),
//         })
//       )
//       .first();
//   }
// 
//   /**
//    * Click Create E-Invoice **Submit** after all sections are saved, then wait for the upload dashboard.
//    * Same entry point as manual create before dashboard **Options â†’ Submit**.
//    *
//    * Dev currently accepts `POST â€¦/einvoice/v1` (200) but often stays on `/einvoice/create`.
//    * After a successful create POST (or a short settle), leave create via back-arrow / dashboard
//    * instead of refreshing create (which wipes the draft and never shows `#upload-invoice-btn`).
//    */
//   async clickCreateInvoicePageSubmit(): Promise<void> {
//     await this.waitForCreateInvoiceIdle();
//     const submit = this.createInvoicePageSubmitButton();
//     await expect(submit).toBeVisible({ timeout: 30_000 });
//     await expect(submit).toBeEnabled({ timeout: 30_000 });
//     await submit.scrollIntoViewIfNeeded();
//     await this.dismissAutocompletePopperIfOpen();
// 
//     const createPost = this.page
//       .waitForResponse(
//         (res) =>
//           res.request().method() === "POST" &&
//           /\/einvoice\/v1\/?(\?|$)/i.test(res.url()) &&
//           res.ok(),
//         { timeout: 60_000 }
//       )
//       .catch(() => null);
// 
//     try {
//       await submit.click({ timeout: 12_000 });
//     } catch {
//       await submit.click({ timeout: 12_000, force: true });
//     }
// 
//     await createPost;
//     await this.waitForCreateInvoiceIdle();
// 
//     const uploadVisible = () =>
//       this.page.locator("#upload-invoice-btn").first().isVisible().catch(() => false);
// 
//     if (!(await uploadVisible()) && /\/einvoice\/create/i.test(this.page.url())) {
//       const back = this.page.getByTestId("back-arrow").first();
//       if (await back.isVisible().catch(() => false)) {
//         await back.click({ timeout: 10_000 }).catch(() => {});
//         await this.page.waitForLoadState("domcontentloaded").catch(() => {});
//         await this.waitForCreateInvoiceIdle(10_000);
//       }
//     }
// 
//     if (!(await uploadVisible()) && /\/einvoice\/create/i.test(this.page.url())) {
//       await this.dashboard.openDashboard(parallelWorkerDashboardOpenOpts());
//     }
// 
//     await this.dashboard.waitForEinvoiceDashboardShell(120_000);
//   }
// 
//   /** Document section **Save** / **Update** (Bitbucket main â€” outcome asserted by caller). */
//   async clickDocumentSave(): Promise<void> {
//     await this.ensureDocumentEditable();
//     await this.focusSection("document");
//     await this.blurActiveElement();
//     const section = this.sectionLocator("document");
//     const sectionSave = this.sectionFormFooterPersistButton(section).first();
//     if (await sectionSave.isVisible().catch(() => false)) {
//       await this.clickPersistButton(sectionSave);
//     } else {
//       await this.clickPersistButton(this.documentFormFooterPersistButton());
//     }
//     await this.waitForCreateInvoiceIdle();
//   }
// 
//   /** Open **Add Item Details** form (inline / modal). */
//   private itemAddDetailsFormOpen(): Locator {
//     return this.page.locator("#itemName");
//   }
// 
//   /** Container for the inline **Add / Edit Item Details** editor (heading + `#itemName`). */
//   private itemAddDetailsModalRoot(): Locator {
//     return this.itemSectionRoot()
//       .getByRole("heading", { name: /^(Add|Edit) Item Details$/i })
//       .locator("xpath=ancestor::*[.//*[@id='itemName']][1]");
//   }
// 
//   /** **Add** or **Update** beside **Cancel** at the bottom of the item line editor. */
//   private itemLineSubmitButton(): Locator {
//     const modal = this.itemAddDetailsModalRoot();
//     const cancelFooter = this.itemFormFooterWithCancel();
//     return modal
//       .locator(".form-footer")
//       .getByRole("button", { name: "Add", exact: true })
//       .or(modal.locator(".form-footer").getByRole("button", { name: "Update", exact: true }))
//       .or(
//         modal
//           .getByRole("button", { name: "Cancel", exact: true })
//           .locator("..")
//           .getByRole("button", { name: "Add", exact: true })
//       )
//       .or(cancelFooter.getByRole("button", { name: "Add", exact: true }))
//       .or(cancelFooter.getByRole("button", { name: "Update", exact: true }))
//       .first();
//   }
// 
//   /** @deprecated Use {@link itemLineSubmitButton}. */
//   private itemLineSubmitAddButton(): Locator {
//     return this.itemLineSubmitButton();
//   }
// 
//   /** Item section only â€” avoids matching Document **Clear All** + **Save** on the same page. */
//   private itemSectionRoot(): Locator {
//     return this.sectionLocator("item");
//   }
// 
//   /** `.form-footer` that pairs **Cancel** with **Add** (line submit â€” not charge/allowance + Add). */
//   private itemFormFooterWithCancel(): Locator {
//     const section = this.itemSectionRoot();
//     return section.locator(".form-footer").filter({
//       has: section.getByRole("button", { name: "Cancel", exact: true }),
//     });
//   }
// 
//   /** `.form-footer` that pairs **Clear All** with **Save** (persists item section). */
//   private itemFormFooterWithClearAll(): Locator {
//     const section = this.itemSectionRoot();
//     return section.locator(".form-footer").filter({
//       has: section.getByRole("button", { name: "Clear All", exact: true }),
//     });
//   }
// 
//   /** Item inline form footer â€” Save (Clear All + Save) or legacy Add (Cancel + Add). */
//   private itemFormFooterButton(name: "Save" | "Add"): Locator {
//     if (name === "Add") {
//       return this.itemFormFooterAddButton();
//     }
//     return this.itemFormFooterSaveButton();
//   }
// 
//   /** Item `.form-footer` **Add** (Cancel + Add) â€” adds line to table. */
//   private itemFormFooterAddButton(): Locator {
//     return this.itemFormFooterWithCancel()
//       .getByRole("button", { name: "Add", exact: true })
//       .or(this.itemLineSubmitAddButton())
//       .first();
//   }
// 
//   /** Item section `.form-footer` **Save** / **Update** (Clear All + persist) â€” after line Add. */
//   private itemFormFooterSaveButton(): Locator {
//     const footer = this.itemFormFooterWithClearAll();
//     const persist = this.sectionFormFooterPersistButton(footer);
//     return persist
//       .or(
//         this.itemSectionRoot()
//           .locator(".form-footer")
//           .getByRole("button", { name: this.sectionPersistButtonLabel(), exact: true })
//       )
//       .first();
//   }
// 
//   private async isItemAddFormFooterOpen(): Promise<boolean> {
//     return this.isItemLineFormFooterOpen();
//   }
// 
//   /** Cancel + Add/Update footer on an open item line editor (Add or row Edit). */
//   async isItemLineFormFooterOpen(): Promise<boolean> {
//     if (!(await this.itemAddDetailsFormOpen().isVisible().catch(() => false))) {
//       return false;
//     }
//     return this.itemLineSubmitButton().isVisible().catch(() => false);
//   }
// 
//   private async isItemSaveFormFooterOpen(): Promise<boolean> {
//     return this.itemFormFooterSaveButton().isVisible().catch(() => false);
//   }
// 
//   private async isItemInlineFormFooterOpen(): Promise<boolean> {
//     if (await this.isItemAddFormFooterOpen()) {
//       return true;
//     }
//     return this.isItemSaveFormFooterOpen();
//   }
// 
//   /** Same as {@link itemFormFooterAddButton}. */
//   private itemLineAddButton(): Locator {
//     return this.itemFormFooterAddButton();
//   }
// 
//   /** Click `.form-footer` **Add** or **Update** (Cancel footer) â€” persists the open item line. */
//   async clickItemLinePersist(): Promise<void> {
//     await this.focusSection("item");
//     const persistBtn = this.itemLineSubmitButton();
//     await expect(persistBtn, "Item line Add/Update (Cancel footer)").toBeVisible({
//       timeout: 15_000,
//     });
//     await this.dismissAutocompletePopperIfOpen();
//     await persistBtn.scrollIntoViewIfNeeded();
//     await persistBtn.click();
//     await this.waitForItemAddSettled();
//   }
// 
//   /** Click `.form-footer` **Add** (Cancel + Add) â€” adds line to the item table. */
//   async clickItemModalAdd(): Promise<void> {
//     await this.clickItemLinePersist();
//   }
// 
//   /** Click `.form-footer` **Save** (Clear All + Save) â€” persists item section after Add. */
//   async clickItemSectionSave(): Promise<void> {
//     await this.focusSection("item");
//     const saveBtn = this.itemFormFooterSaveButton();
//     await expect(saveBtn, "Item form-footer Save (Clear All + Save)").toBeVisible({
//       timeout: 15_000,
//     });
//     await this.dismissAutocompletePopperIfOpen();
//     await saveBtn.scrollIntoViewIfNeeded();
//     await saveBtn.click();
//     await this.dismissAutocompletePopperIfOpen();
//   }
// 
//     async clickSectionSave(section: CreateInvoiceSection): Promise<void> {
//     if (section === "document") {
//       await this.clickDocumentSave();
//       return;
//     }
//     if (section === "invoice") {
//       await this.clickInvoiceSectionSave();
//       return;
//     }
//     if (section === "item") {
//       if (await this.isItemAddFormFooterOpen()) {
//         await this.clickItemModalAdd();
//         return;
//       }
//       await this.clickItemSectionSave();
//       return;
//     }
// 
//     await this.focusSection(section);
//     const sectionRoot = this.sectionLocator(section);
//     const sectionSave = this.sectionFormFooterPersistButton(sectionRoot).last();
//     await this.clickPersistButton(sectionSave);
//   }
// 
//   private pagePersistButton(): Locator {
//     const label = this.sectionPersistButtonLabel();
//     return this.page.getByRole("button", { name: label, disabled: false });
//   }
// 
//     async clickSave(): Promise<void> {
//     await this.dismissAutocompletePopperIfOpen();
// 
//     if (await this.isItemAddFormFooterOpen()) {
//       await this.clickItemModalAdd();
//       return;
//     }
// 
//     const itemSave = this.itemFormFooterSaveButton();
//     if (await itemSave.isVisible().catch(() => false)) {
//       await itemSave.click();
//       return;
//     }
// 
//     const roots = [
//       this.page.locator('[data-testid="modalBody"]'),
//       this.page.locator(".add-item-modal"),
//       this.page.locator(".predefined-endpoints-modal"),
//     ];
// 
//     const persistLabel = this.sectionPersistButtonLabel();
//     for (const root of roots) {
//       if (!(await root.isVisible().catch(() => false))) continue;
//       const save = root.getByRole("button", { name: persistLabel, disabled: false });
//       if ((await save.count()) > 0 && (await save.first().isVisible())) {
//         await this.dismissAutocompletePopperIfOpen();
//         await save.first().click();
//         return;
//       }
//     }
// 
//     const documentSave = this.documentFormFooterPersistButton();
//     if (await documentSave.isVisible().catch(() => false)) {
//       await this.dismissAutocompletePopperIfOpen();
//       await this.clickPersistButton(documentSave);
//       return;
//     }
// 
//     const enabledPersist = this.pagePersistButton();
//     await expect(enabledPersist.first()).toBeVisible({ timeout: 15_000 });
//     await this.dismissAutocompletePopperIfOpen();
//     await enabledPersist.first().click();
//   }
// 
//   async selectBuyerLegalRegIdType(typeLabel: string | RegExp): Promise<void> {
//     await this.selectAutocompleteById("legalRegIdType", typeLabel);
//   }
// 
//   async selectBuyerCountry(countryLabel: string | RegExp): Promise<void> {
//     await this.selectAutocompleteByIdUnlessDisabledMatch("countryCode", countryLabel);
//   }
// 
//   async selectBuyerCountrySubdivision(
//     subdivisionLabel: string | RegExp,
//     options?: { filterText?: string; optionTimeoutMs?: number }
//   ): Promise<void> {
//     const filterText =
//       options?.filterText ??
//       (typeof subdivisionLabel === "string" ? subdivisionLabel : undefined);
//     await this.selectAutocompleteById("countrySubdivision", subdivisionLabel, {
//       ...options,
//       filterText,
//       optionTimeoutMs: options?.optionTimeoutMs ?? 15_000,
//     });
//   }
// 
//   async selectBuyerPassportCountry(countryLabel: string | RegExp): Promise<void> {
//     await this.selectAutocompleteById("passportCountry", countryLabel);
//   }
// 
//   async selectBuyerSchemeIdentifier(schemeLabel: string | RegExp): Promise<void> {
//     await this.form.selectSchemeIdentifier(schemeLabel);
//   }
// 
//   async selectBuyerElectronicAddressScheme(schemeLabel: string | RegExp): Promise<void> {
//     await this.selectAutocompleteByIdUnlessDisabledMatch("electronicAddressScheme", schemeLabel, {
//       filterText: typeof schemeLabel === "string" ? schemeLabel.slice(0, 24) : undefined,
//       optionTimeoutMs: 20_000,
//     });
//   }
// 
//   async hasBuyerInput(inputId: string): Promise<boolean> {
//     return (await this.formInput(inputId).count()) > 0;
//   }
// 
//   /**
//    * Buyer conditional tests â€” required text/country only; dependency fields left for the scenario.
//    */
//   async fillBuyerConditionalBaseline(
//     excludeInputIds?: ReadonlySet<string> | string,
//     uniqueKey?: string,
//     options?: { skipConditionalDependencies?: boolean }
//   ): Promise<void> {
//     const fromSearch = await this.searchAndSelectBuyerIfPresent();
//     const excluded =
//       typeof excludeInputIds === "string"
//         ? new Set([excludeInputIds])
//         : (excludeInputIds ?? new Set<string>());
//     const preserveIfFilled = new Set(
//       fromSearch || this.isCreateInvoiceShellFromDashboard()
//         ? ["name", "vatIdentifier", "address", "city", "identifier", "legalRegId"]
//         : []
//     );
//     const set = async (id: string, value: string) => {
//       if (!excluded.has(id) && (await this.formInput(id).count()) > 0) {
//         if (preserveIfFilled.has(id) && (await this.readInputValueById(id))) {
//           return;
//         }
//         await this.fillInputById(id, value);
//       }
//     };
// 
//     const key = uniqueKey ?? String(Date.now());
//     await set("name", `UI Create Invoice Buyer ${key}`);
//     await set("vatIdentifier", buildUniqueBuyerVatIdentifier(key));
//     await set("address", "Warehouse 12");
//     await set("city", "Abu Dhabi");
//     await set("postalCode", "123456");
// 
//     if (!excluded.has("countryCode")) {
//       const country = this.formInput("countryCode").first();
//       if ((await country.count()) > 0) {
//         const current = (await country.inputValue().catch(() => "")).trim();
//         const disabled = await country.isDisabled().catch(() => false);
//         if (!(disabled && /United Arab Emirates/i.test(current))) {
//           await this.selectBuyerCountry(/^United Arab Emirates$/i);
//         }
//       }
//     }
//     if (!excluded.has("countrySubdivision")) {
//       const subdivision = this.formInput("countrySubdivision").first();
//       if ((await subdivision.count()) > 0) {
//         const current = (await subdivision.inputValue().catch(() => "")).trim();
//         if (!current) {
//           await this.selectBuyerCountrySubdivision(DEFAULT_UAE_COUNTRY_SUBDIVISION);
//         }
//       }
//     }
// 
//     if (!options?.skipConditionalDependencies) {
//       await this.fillBuyerConditionalDependencyFields(excludeInputIds);
//     }
//   }
// 
//   selectItemType = (typeLabel: string | RegExp) => this.form.selectItemType(typeLabel);
//   clearClassificationScheme = () => this.form.clearClassificationScheme();
//   selectClassificationScheme = (schemeLabel?: string | RegExp) =>
//     this.form.selectClassificationScheme(schemeLabel);
//     async fillBuyerConditionalDependencyFields(
//     excludeInputIds?: ReadonlySet<string> | string
//   ): Promise<void> {
//     const excluded =
//       typeof excludeInputIds === "string"
//         ? new Set([excludeInputIds])
//         : (excludeInputIds ?? new Set<string>());
//     const skip = (id: string) => excluded.has(id);
// 
//     if (!skip("schemeIdentifier") && (await this.hasBuyerInput("schemeIdentifier"))) {
//       const scheme = this.formInput("schemeIdentifier").first();
//       const current = (await scheme.inputValue().catch(() => "")).trim();
//       if (!current) {
//         await this.selectBuyerSchemeIdentifier(UAE_TIN_SCHEME_LABEL);
//       }
//     }
//     if (!skip("identifier") && (await this.hasBuyerInput("identifier"))) {
//       if (!(await this.readInputValueById("identifier"))) {
//         await this.fillInputById("identifier", CREATE_INVOICE_BUYER_IDENTIFIER_SAMPLE);
//       }
//     }
//     if (!skip("legalRegIdType") && (await this.hasBuyerInput("legalRegIdType"))) {
//       const typeInput = this.formInput("legalRegIdType").first();
//       const typeCurrent = (await typeInput.inputValue().catch(() => "")).trim();
//       if (!typeCurrent) {
//         await this.selectBuyerLegalRegIdType("Emirates ID");
//       }
//     }
//     if (!skip("legalRegId") && (await this.hasBuyerInput("legalRegId"))) {
//       if (!(await this.readInputValueById("legalRegId"))) {
//         await this.fillInputById("legalRegId", BUYER_LEGAL_REG_IDENTIFIER_FOR_DROPDOWN_BATCH);
//       }
//     }
//     if (!skip("electronicAddressScheme") && (await this.hasBuyerInput("electronicAddressScheme"))) {
//       const scheme = this.formInput("electronicAddressScheme").first();
//       const current = (await scheme.inputValue().catch(() => "")).trim();
//       if (!current) {
//         await this.selectBuyerElectronicAddressScheme(UAE_TIN_SCHEME_LABEL);
//       }
//     }
//     if (!skip("electronicAddress") && (await this.hasBuyerInput("electronicAddress"))) {
//       if (!(await this.readInputValueById("electronicAddress"))) {
//         await this.fillInputById("electronicAddress", BUYER_ELECTRONIC_ADDRESS_REQUIRES_LEGAL_REG);
//       }
//     }
//   }
// 
//   async fillBuyerSectionBaseline(
//     excludeInputId?: string,
//     uniqueKey?: string,
//     options?: { skipConditionalDependencies?: boolean }
//   ): Promise<void> {
//     const fromSearch = await this.searchAndSelectBuyerIfPresent();
//     const preserveIfFilled = new Set(
//       fromSearch || this.isCreateInvoiceShellFromDashboard()
//         ? ["name", "vatIdentifier", "address", "city", "identifier", "legalRegId"]
//         : []
//     );
//     const set = async (id: string, value: string) => {
//       if (excludeInputId !== id && (await this.formInput(id).count()) > 0) {
//         if (preserveIfFilled.has(id) && (await this.readInputValueById(id))) {
//           return;
//         }
//         await this.fillInputById(id, value);
//       }
//     };
// 
//     const key = uniqueKey ?? String(Date.now());
//     await set("name", `UI Create Invoice Buyer ${key}`);
//     await set("vatIdentifier", buildUniqueBuyerVatIdentifier(key));
//     await set("address", "Warehouse 12");
//     await set("city", "Abu Dhabi");
//     await set("postalCode", "123456");
// 
//     if (excludeInputId !== "countryCode") {
//       const country = this.formInput("countryCode").first();
//       if ((await country.count()) > 0) {
//         const current = (await country.inputValue().catch(() => "")).trim();
//         const disabled = await country.isDisabled().catch(() => false);
//         if (!(disabled && /United Arab Emirates/i.test(current))) {
//           await this.selectBuyerCountry(/^United Arab Emirates$/i);
//         }
//       }
//     }
//     if (excludeInputId !== "countrySubdivision") {
//       const subdivision = this.formInput("countrySubdivision").first();
//       if ((await subdivision.count()) > 0) {
//         const current = (await subdivision.inputValue().catch(() => "")).trim();
//         if (!current) {
//           await this.selectBuyerCountrySubdivision(DEFAULT_UAE_COUNTRY_SUBDIVISION);
//         }
//       }
//     }
// 
//     if (!options?.skipConditionalDependencies) {
//       await this.fillBuyerConditionalDependencyFields(excludeInputId);
//     }
//   }
// 
//   /**
//    * Required Add Item Details fields on Create Invoice (not all are on Masters Add New).
//    * Both quantity fields are required: price base qty and invoiced qty.
//    */
//   private async fillCreateInvoiceItemModalRequiredExtras(excludeInputId?: string): Promise<void> {
//     const set = async (id: string, value: string) => {
//       if (excludeInputId !== id && (await this.formInput(id).count()) > 0) {
//         await this.fillInputById(id, value);
//       }
//     };
// 
//     await set("invoiceLineIdentifier", "1");
//     await set("priceBaseQty", "1.00");
//     await set("invoiceQty", "1");
//   }
// 
//     async fillItemSectionBaseline(
//     excludeInputId?: string,
//     options?: { classificationBelowMin?: boolean }
//   ): Promise<void> {
//     if (options?.classificationBelowMin) {
//       const skip = excludeInputId ?? "classificationIdentifier";
//       await this.fillItemBaseline(skip);
//       if (skip !== "itemType") {
//         await this.selectItemType(UI_MASTER_ITEM_TYPE_GOODS);
//       }
//       if (skip !== "classifications") {
//         await this.clearClassificationScheme();
//       }
//       if (skip !== "classificationIdentifier" && (await this.formInput("classificationIdentifier").count()) > 0) {
//         await this.clearInputById("classificationIdentifier");
//       }
//       return;
//     }
// 
//     await this.fillItemBaseline(excludeInputId);
// 
//     if (
//       excludeInputId !== "classifications" &&
//       excludeInputId !== "classificationIdentifier" &&
//       excludeInputId !== "itemType"
//     ) {
//       await this.selectItemType(UI_MASTER_ITEM_TYPE_GOODS);
//       await this.selectClassificationScheme(DEFAULT_UI_MASTER_CLASSIFICATION_SCHEME);
//       if (
//         excludeInputId !== "classificationIdentifier" &&
//         (await this.formInput("classificationIdentifier").count()) > 0
//       ) {
//         await this.fillInputById(
//           "classificationIdentifier",
//           UI_MASTER_DEFAULT_CLASSIFICATION_IDENTIFIER
//         );
//       }
//     }
//   }
// 
//   fillBuyerSellerBaseline = (excludeInputId?: string, uniqueKey?: string) =>
//     this.form.fillBuyerSellerBaseline(excludeInputId, uniqueKey);
// 
//   async fillItemBaseline(excludeInputId?: string): Promise<void> {
//     await this.form.fillItemBaseline(excludeInputId);
//     await this.fillCreateInvoiceItemModalRequiredExtras(excludeInputId);
//   }
// 
//   /**
//    * Fill item fields for the given type. On **Edit/Copy**, skips `unitOfMeasure` re-selection
//    * when a baseline row is already present â€” reopening that autocomplete blocks **Update**.
//    */
//   async fillItemFieldsForType(
//     itemType: string,
//     overrides?: {
//       classificationScheme?: string | null;
//       classificationIdentifier?: string | null;
//       serviceAccCode?: string | null;
//     },
//     excludeInputId?: string
//   ): Promise<void> {
//     const prefilled =
//       this.hasPrefilledItemLineEntry() &&
//       (await this.itemTableBodyRow(0).isVisible().catch(() => false));
// 
//     if (prefilled) {
//       await this.dismissAutocompletePopperIfOpen();
//       await this.form.applyItemTypeAndOverrides(itemType, overrides);
//       return;
//     }
// 
//     await this.form.fillItemFieldsForType(itemType, overrides);
//     await this.fillCreateInvoiceItemModalRequiredExtras(excludeInputId);
//   }
//   /** Re-focus section / re-open Edit modal so `#inputId` exists after Save. */
//   private async ensureFieldAccessibleForAssert(inputId: string): Promise<void> {
//     const section = INPUT_ID_TO_SECTION[inputId];
//     if (!section) return;
// 
//     switch (section) {
//       case "document":
//         await this.focusSection("document");
//         return;
//       case "seller":
//         if (!(await this.formInput(inputId).isVisible().catch(() => false))) {
//           await this.openSellerEditor();
//         }
//         return;
//       case "buyer":
//         if (await this.formInput(inputId).isVisible().catch(() => false)) {
//           return;
//         }
//         if (await this.isBuyerSectionInViewMode()) {
//           return;
//         }
//         if (!(await this.formInput(inputId).isVisible().catch(() => false))) {
//           await this.openBuyerEditor();
//         }
//         return;
//       case "delivery":
//         if (!(await this.formInput(inputId).isVisible().catch(() => false))) {
//           await this.openDeliveryEditor();
//         }
//         return;
//       case "item": {
//         if (await this.formInput(inputId).isVisible().catch(() => false)) {
//           return;
//         }
//         if (await this.isItemInlineFormFooterOpen()) {
//           return;
//         }
//         if (await this.itemLineActionContainer(0).isVisible().catch(() => false)) {
//           await this.openItemRowEdit();
//           await expect(this.formInput(inputId).first()).toBeVisible({ timeout: 15_000 });
//           return;
//         }
//         await this.openItemEditor();
//         return;
//       }
//       case "payment":
//         if (!(await this.formInput(inputId).isVisible().catch(() => false))) {
//           await this.openPaymentEditor();
//         }
//         return;
//       case "custom":
//         if (!(await this.formInput(inputId).isVisible().catch(() => false))) {
//           await this.openCustomEditor();
//         }
//         return;
//       default:
//         return;
//     }
//   }
// 
//   /**
//    * After a successful Save the control may leave the DOM (document summary / modal closed).
//    * Then assert there are no visible MUI field errors on the create-invoice screen.
//    */
//   private async expectNoVisibleFieldErrorsOnCreateInvoice(): Promise<void> {
//     await expect(this.page.locator("main.invoice-content-container")).toBeVisible({
//       timeout: 15_000,
//     });
//     await expect(this.page.locator(".MuiFormHelperText-root.Mui-error")).toHaveCount(0);
//   }
// 
//   async expectInputValidationError(inputId: string): Promise<void> {
//     if (inputId === "currExchangeRate" && !(await this.isDocumentExchangeRateEnabled())) {
//       throw new Error(
//         "Currency exchange rate is disabled (AED selected); cannot assert field validation error"
//       );
//     }
//     if (UIInvoiceCreationManualPage.DOCUMENT_DATE_FIELD_IDS.has(inputId)) {
//       const section = INPUT_ID_TO_SECTION[inputId];
//       if (section === "document" && (await this.isDocumentViewMode())) {
//         throw new Error(
//           `Document date #${inputId} should be invalid but UI switched to view mode (save was accepted)`
//         );
//       }
//       if (section === "payment" && !(await this.isSectionEditable("payment"))) {
//         throw new Error(
//           `Payment date #${inputId} should be invalid but payment section saved (view mode)`
//         );
//       }
//       await this.expectDocumentDateFieldValidationError(inputId);
//       return;
//     }
//     if (INPUT_ID_TO_SECTION[inputId] === "document" && (await this.isDocumentViewMode())) {
//       await expect(
//         this.page.locator(".MuiFormHelperText-root.Mui-error"),
//         `Document field #${inputId} invalid but UI switched to view mode`
//       ).toBeVisible({ timeout: 10_000 });
//       return;
//     }
//     await this.ensureFieldAccessibleForAssert(inputId);
//     const input = this.formInput(inputId);
//     await expect(input).toBeVisible({ timeout: 15_000 });
//     await expect(input).toHaveAttribute("aria-invalid", "true", { timeout: 10_000 });
//     const helper = this.formControlForInput(inputId).locator(".MuiFormHelperText-root");
//     await expect(helper).toBeVisible({ timeout: 10_000 });
//     expect((await helper.innerText()).trim().length).toBeGreaterThan(0);
//   }
// 
//   /**
//    * MUI date pickers: hidden `#invStartDate` / `#invEndDate` lack `aria-invalid`; errors show on
//    * spinbuttons, `.MuiFormHelperText-root.Mui-error`, or an inline `<p>` (e.g. "Please select the date.").
//    */
//   async expectDocumentDateFieldValidationError(inputId: string): Promise<void> {
//     await this.ensureFieldAccessibleForAssert(inputId);
//     const group = this.resolveDocumentDateGroup(inputId);
//     const control = group.locator(
//       "xpath=ancestor::div[contains(@class,'MuiFormControl-root')][1]"
//     );
// 
//     await expect(async () => {
//       const muiError = control.locator(".MuiFormHelperText-root.Mui-error");
//       if ((await muiError.count()) > 0 && (await muiError.first().isVisible())) {
//         expect((await muiError.first().innerText()).trim().length).toBeGreaterThan(0);
//         return;
//       }
// 
//       const helper = control.locator(".MuiFormHelperText-root");
//       if ((await helper.count()) > 0 && (await helper.first().isVisible())) {
//         const text = (await helper.first().innerText()).trim();
//         if (text.length > 0) {
//           return;
//         }
//       }
// 
//       const inlineMsg = control.locator("p").filter({ hasText: /\S/ });
//       if ((await inlineMsg.count()) > 0 && (await inlineMsg.first().isVisible())) {
//         expect((await inlineMsg.first().innerText()).trim().length).toBeGreaterThan(0);
//         return;
//       }
// 
//       const controlHasError = await control.evaluate((el) => el.classList.contains("Mui-error"));
//       if (controlHasError) {
//         return;
//       }
// 
//       for (const part of ["Year", "Month", "Day"] as const) {
//         const spin = group.getByRole("spinbutton", { name: part });
//         if ((await spin.count()) > 0) {
//           const invalid = await spin.getAttribute("aria-invalid");
//           if (invalid === "true") {
//             return;
//           }
//         }
//       }
// 
//       const groupInvalid = await group.getAttribute("aria-invalid");
//       if (groupInvalid === "true") {
//         return;
//       }
// 
//       const chooseDate = group.getByRole("button", { name: /^Choose date/i });
//       if ((await chooseDate.count()) > 0) {
//         const chooseInvalid = await chooseDate.getAttribute("aria-invalid");
//         if (chooseInvalid === "true") {
//           return;
//         }
//       }
// 
//       throw new Error(`No validation error visible for document date #${inputId}`);
//     }).toPass({ timeout: 10_000 });
//   }
// 
//   /** MUI date fields: hidden `#id` has no `aria-invalid`; assert on the visible group / spinbuttons. */
//   private async expectDocumentDateFieldNoValidationError(inputId: string): Promise<void> {
//     const group = this.resolveDocumentDateGroup(inputId);
//     const control = group.locator(
//       "xpath=ancestor::div[contains(@class,'MuiFormControl-root')][1]"
//     );
//     await expect(control.locator(".MuiFormHelperText-root")).toBeHidden({ timeout: 10_000 });
// 
//     const hidden = this.formInput(inputId);
//     if ((await hidden.count()) > 0) {
//       const invalid = await hidden.getAttribute("aria-invalid");
//       expect(invalid).not.toBe("true");
//     }
// 
//     for (const part of ["Year", "Month", "Day"] as const) {
//       const spin = group.getByRole("spinbutton", { name: part });
//       if ((await spin.count()) > 0) {
//         expect(await spin.getAttribute("aria-invalid")).not.toBe("true");
//       }
//     }
//   }
// 
//   async expectInputNoValidationError(inputId: string): Promise<void> {
//     if (INPUT_ID_TO_SECTION[inputId] === "document" && (await this.isDocumentViewMode())) {
//       await this.expectDocumentViewMode();
//       return;
//     }
//     if (inputId === "currExchangeRate" && !(await this.isDocumentExchangeRateEnabled())) {
//       await this.expectDocumentExchangeRateDisabled();
//       return;
//     }
//     if (UIInvoiceCreationManualPage.DOCUMENT_DATE_FIELD_IDS.has(inputId)) {
//       await this.ensureFieldAccessibleForAssert(inputId);
//       await this.expectDocumentDateFieldNoValidationError(inputId);
//       return;
//     }
//     await this.ensureFieldAccessibleForAssert(inputId);
//     const input = this.formInput(inputId);
//     const visible = await input.isVisible().catch(() => false);
//     if (visible) {
//       await expect(input).toHaveAttribute("aria-invalid", "false", { timeout: 10_000 });
//       const helper = this.formControlForInput(inputId).locator(".MuiFormHelperText-root");
//       await expect(helper).toBeHidden();
//       return;
//     }
//     await this.expectNoVisibleFieldErrorsOnCreateInvoice();
//   }
//   /**
//    * After Save, section inputs may leave the DOM (view mode). Use Create Invoice locators;
//    * skip missing controls; fall back to no visible MUI errors on the page.
//    */
//   async expectDropdownsNoValidationError(
//     dropdowns: Parameters<UIMasterBuyerAndItemPage["expectDropdownsNoValidationError"]>[0]
//   ): Promise<void> {
//     for (const { inputId } of dropdowns) {
//       const input = this.formInput(inputId).first();
//       if ((await input.count()) === 0 || !(await input.isVisible().catch(() => false))) {
//         continue;
//       }
//       await expect(input).toHaveAttribute("aria-invalid", "false", { timeout: 5_000 });
//       const helper = this.formControlForInput(inputId).locator(".MuiFormHelperText-root");
//       await expect(helper).toBeHidden();
//     }
//   }
// 
//     async fillSectionBaselineForMinMax(
//     section: CreateInvoiceSection,
//     excludeInputId?: string,
//     options?: { uniqueKey?: string; classificationBelowMin?: boolean }
//   ): Promise<void> {
//     const key = options?.uniqueKey;
//     switch (section) {
//       case "document":
//         await this.fillDocumentBaseline(excludeInputId, key);
//         return;
//       case "seller":
//         await this.fillSellerBaseline(excludeInputId);
//         return;
//       case "buyer":
//         await this.fillBuyerSectionBaseline(excludeInputId, key);
//         return;
//       case "delivery":
//         await this.fillDeliveryBaseline(excludeInputId);
//         return;
//       case "item":
//         if (
//           this.hasPrefilledItemLineEntry() &&
//           (await this.itemTableBodyRow(0).isVisible().catch(() => false))
//         ) {
//           return;
//         }
//         await this.fillItemSectionBaseline(excludeInputId, {
//           classificationBelowMin: options?.classificationBelowMin,
//         });
//         return;
//       case "payment":
//         await this.fillPaymentBaseline(excludeInputId);
//         return;
//       case "custom":
//         await this.fillCustomBaseline(excludeInputId);
//         return;
//       case "invoice":
//         return;
//     }
//   }
// 
//   /** @deprecated Use {@link fillSectionBaselineForMinMax}. */
//   fillSectionBaselineForSave = this.fillSectionBaselineForMinMax;
// 
//   /** Search Prashant, fill baseline + buyer dropdowns; does not Save. */
//   async prepareBuyerDropdownsForSave(uniqueKey?: string): Promise<void> {
//     const key = uniqueKey ?? String(Date.now());
//     await this.openBuyerEditor();
//     await this.fillBuyerSectionBaseline(undefined, key);
//     const peppol = this.sectionLocator("buyer").locator("#peppolSchemeIdentifier");
//     if ((await peppol.count()) > 0) {
//       await this.form.selectFirstAutocompleteOption("peppolSchemeIdentifier");
//     }
//   }
// 
//     async expectBuyerSectionSaveSucceeded(): Promise<void> {
//     await this.focusSection("buyer");
//     const section = this.sectionLocator("buyer");
//     await expect(section.locator(".MuiFormHelperText-root.Mui-error")).toHaveCount(0, {
//       timeout: 10_000,
//     });
//   }
// 
//   /** @deprecated Use {@link prepareBuyerDropdownsForSave} + {@link expectBuyerSectionSaveSucceeded}. */
//   async fillBuyerSellerAllDropdownsAndSave(uniqueKey?: string): Promise<void> {
//     await this.prepareBuyerDropdownsForSave(uniqueKey);
//     await this.clickSectionSave("buyer");
//   }
// 
//     async prepareItemDropdownsForSave(): Promise<void> {
//     await this.openItemEditor();
//     await this.fillItemSectionBaseline();
//     await this.form.selectFirstAutocompleteOption("unitOfMeasure");
//     await this.form.selectFirstAutocompleteOption("taxRateDtls[0].taxCategory");
//   }
// 
//   async expectItemSectionSaveSucceeded(): Promise<void> {
//     await this.expectNoVisibleFieldErrorsOnCreateInvoice();
//   }
// 
//   /** @deprecated Use {@link prepareItemDropdownsForSave} + {@link expectItemSectionSaveSucceeded}. */
//   async fillItemAllDropdownsAndSave(): Promise<void> {
//     await this.prepareItemDropdownsForSave();
//     await this.clickSave();
//   }
// 
//   /** Section **7. Attachment Details** (`section[data-id="7"]`). */
//   attachmentSection(): Locator {
//     return this.invoiceSection(CREATE_INVOICE_SECTION.attachment);
//   }
// 
//   /** Hidden multi-file input inside Attachment Details (`#file-input`) â€” present only before attach. */
//   attachmentFileInput(): Locator {
//     return this.attachmentSection().locator("#file-input");
//   }
// 
//   /**
//    * Empty drag & drop / Add Files zone (pre-attach).
//    * Post-attach HTML uses `div.uploaded-files.upload-section` instead (verified).
//    */
//   attachmentUploadZone(): Locator {
//     return this.attachmentSection().locator(".upload-section:not(.uploaded-files)");
//   }
// 
//   /** Post-attach file list: `div.uploaded-files.upload-section`. */
//   attachmentUploadedFiles(): Locator {
//     return this.attachmentSection().locator(".uploaded-files.upload-section");
//   }
// 
//   /** One row per attached file: `.file-details` (name + remove cross). */
//   attachmentFileRows(): Locator {
//     return this.attachmentUploadedFiles().locator(".file-details");
//   }
// 
//   /** Label that opens the native file picker (`for="file-input"`). */
//   attachmentAddFilesLabel(): Locator {
//     return this.attachmentSection().locator('label.file-button[for="file-input"]');
//   }
// 
//   async scrollToAttachmentSection(): Promise<void> {
//     const section = this.attachmentSection();
//     await section.scrollIntoViewIfNeeded();
//     await expect(
//       section.locator('hr[data-content="7. Attachment Details"]')
//     ).toBeVisible({ timeout: 30_000 });
//   }
// 
//   async expectAttachmentUploadZoneVisible(): Promise<void> {
//     await expect(this.attachmentUploadZone()).toBeVisible({ timeout: 15_000 });
//     await expect(this.attachmentAddFilesLabel()).toBeVisible();
//   }
// 
//   /**
//    * After success: empty drag/drop + `#file-input` are gone; `.uploaded-files` list is shown
//    * (1 file â†’ one `.file-details`; 2 files â†’ two `.file-details` â€” verified DOM).
//    */
//   async expectAttachmentUploadZoneHidden(): Promise<void> {
//     await expect(this.attachmentUploadZone()).toBeHidden({ timeout: 15_000 });
//     await expect(this.attachmentAddFilesLabel()).toBeHidden({ timeout: 15_000 });
//     await expect(this.attachmentUploadedFiles()).toBeVisible({ timeout: 15_000 });
//   }
// 
//   /** Row for a listed attachment (`.file-details` containing `.ellipsis-text`). */
//   attachedFileRow(fileName: string): Locator {
//     return this.attachmentFileRows().filter({ hasText: fileName });
//   }
// 
//   attachedFileName(fileName: string): Locator {
//     return this.attachedFileRow(fileName).locator(".ellipsis-text");
//   }
// 
//   async expectAttachedFilesListed(fileNames: string[]): Promise<void> {
//     await expect(this.attachmentUploadedFiles()).toBeVisible({ timeout: 20_000 });
//     await expect(
//       this.attachmentFileRows(),
//       `Expected ${fileNames.length} attached file row(s) under Attachment Details`
//     ).toHaveCount(fileNames.length, { timeout: 20_000 });
//     for (const name of fileNames) {
//       await expect(
//         this.attachedFileName(name).first(),
//         `Expected attached file "${name}" in .ellipsis-text`
//       ).toBeVisible({ timeout: 20_000 });
//     }
//   }
// 
//   /**
//    * View mode Attachment Details: file names in `.ellipsis-text`, no remove cross
//    * (`.icon-hover-effect` absent â€” verified view HTML).
//    */
//   async expectAttachmentsDisplayedInView(fileNames: string[]): Promise<void> {
//     await this.scrollToAttachmentSection();
//     await this.expectAttachedFilesListed(fileNames);
//     for (const name of fileNames) {
//       await expect(
//         this.attachedFileRow(name).locator(".icon-hover-effect"),
//         `View mode should not show remove cross for "${name}"`
//       ).toHaveCount(0);
//     }
//   }
// 
//   /**
//    * Confirm remove-attachment dialog (`data-testid="modalBody"`).
//    * Title: "Are you sure you want remove the selected file?" â€” buttons **No** / **Yes**.
//    */
//   attachmentRemoveConfirmModal(): Locator {
//     return this.page.locator('[data-testid="modalBody"]').filter({
//       hasText: /Are you sure you want remove the selected file/i,
//     });
//   }
// 
//   async expectAttachmentRemoveConfirmVisible(): Promise<void> {
//     const modal = this.attachmentRemoveConfirmModal();
//     await expect(modal).toBeVisible({ timeout: 15_000 });
//     await expect(modal.getByRole("button", { name: "No", exact: true })).toBeVisible();
//     await expect(modal.getByRole("button", { name: "Yes", exact: true })).toBeVisible();
//   }
// 
//   async confirmAttachmentRemove(decision: "Yes" | "No" = "Yes"): Promise<void> {
//     const modal = this.attachmentRemoveConfirmModal();
//     await this.expectAttachmentRemoveConfirmVisible();
//     await modal
//       .locator(".btn-container")
//       .getByRole("button", { name: decision, exact: true })
//       .click();
//     await expect(modal).toBeHidden({ timeout: 15_000 });
//   }
// 
//   /**
//    * Click Cross on a `.file-details` row, then confirm in the remove modal (**Yes** by default).
//    * Pass `confirm: "No"` to keep the file / dismiss without removing.
//    */
//   async removeAttachedFile(
//     fileName: string,
//     options?: { confirm?: "Yes" | "No" }
//   ): Promise<void> {
//     const confirm = options?.confirm ?? "Yes";
//     const row = this.attachedFileRow(fileName).first();
//     await expect(row).toBeVisible({ timeout: 15_000 });
//     await row.locator(".icon-hover-effect").click();
//     await this.confirmAttachmentRemove(confirm);
//     if (confirm === "Yes") {
//       await expect(
//         this.attachedFileRow(fileName),
//         `Attachment "${fileName}" should be removed after Yes`
//       ).toHaveCount(0, { timeout: 15_000 });
//     } else {
//       await expect(this.attachedFileName(fileName).first()).toBeVisible({ timeout: 10_000 });
//     }
//   }
// 
//   /**
//    * Soft assertion for rejection feedback (toast / alert / modal / inline copy).
//    * Ground-truth messages vary; pattern comes from the scenario.
//    */
//   async expectAttachmentRejectionMessage(errorPattern: RegExp): Promise<void> {
//     const section = this.attachmentSection();
//     const candidates = this.page
//       .getByRole("alert")
//       .or(this.page.locator(".MuiAlert-root, .Toastify__toast, [role='status']"))
//       .or(this.page.getByRole("dialog"))
//       .or(section.locator(".error, .error-message, .guidelines-container"))
//       .or(this.page.getByText(errorPattern));
//     await expect(
//       candidates.filter({ hasText: errorPattern }).first(),
//       `Expected attachment rejection matching ${errorPattern}`
//     ).toBeVisible({ timeout: 20_000 });
//   }
// 
//   /**
//    * Select file(s) via `#file-input` in one pick (1..n; UI enforces types + 10 MB total).
//    * After success the picker is removed â€” add all files in this single call when multiple.
//    */
//   async selectAttachmentFiles(...filePaths: string[]): Promise<void> {
//     if (!filePaths.length) {
//       throw new Error("selectAttachmentFiles: at least one file path is required");
//     }
//     await this.scrollToAttachmentSection();
//     await this.expectAttachmentUploadZoneVisible();
//     const input = this.attachmentFileInput();
//     await expect(input).toBeAttached({ timeout: 15_000 });
//     await input.setInputFiles(filePaths);
//   }
// 
//   /**
//    * Attach files and assert happy path: `.file-details` rows + empty upload zone gone.
//    */
//   async addAttachmentFiles(...filePaths: string[]): Promise<void> {
//     await this.selectAttachmentFiles(...filePaths);
//     const names = filePaths.map((p) => p.replace(/^.*[\\/]/, ""));
//     await this.expectAttachedFilesListed(names);
//     await this.expectAttachmentUploadZoneHidden();
//   }
// 
//   /** Edit shell page footer **Update** (same `.btn-container` pattern as Submit on create). */
//   createInvoicePageUpdateButton(): Locator {
//     return this.page
//       .locator(".btn-container .button-wrapper button.base-btn")
//       .filter({ has: this.page.locator(".btn-children", { hasText: /^Update$/ }) })
//       .or(
//         this.page.locator(".btn-container button", {
//           has: this.page.locator(".btn-children", { hasText: /^Update$/ }),
//         })
//       )
//       .or(this.page.getByRole("button", { name: "Update", exact: true }))
//       .first();
//   }
// 
//   async clickCreateInvoicePageUpdate(): Promise<void> {
//     await this.waitForCreateInvoiceIdle();
//     const update = this.createInvoicePageUpdateButton();
//     await expect(update).toBeVisible({ timeout: 30_000 });
//     await expect(update).toBeEnabled({ timeout: 30_000 });
//     await update.scrollIntoViewIfNeeded();
//     await this.dismissAutocompletePopperIfOpen();
//     try {
//       await update.click({ timeout: 12_000 });
//     } catch {
//       await update.click({ timeout: 12_000, force: true });
//     }
//   }
// 
//   /**
//    * After footer **Update** / **Submit**: either e-invoice dashboard, or still on the edit shell.
//    */
//   async waitAfterAttachmentPersist(
//     timeoutMs = 90_000
//   ): Promise<"dashboard" | "edit"> {
//     const deadline = Date.now() + timeoutMs;
//     const started = Date.now();
//     const upload = this.page.locator("#upload-invoice-btn").first();
//     const update = this.createInvoicePageUpdateButton();
//     const submit = this.createInvoicePageSubmitButton();
// 
//     while (Date.now() < deadline) {
//       if (await upload.isVisible().catch(() => false)) {
//         return "dashboard";
//       }
//       const url = this.page.url();
//       if (!/einvoice\/edit/i.test(url) && /\/einvoice/i.test(url)) {
//         // Navigated off edit; wait briefly for shell controls.
//         if (await upload.isVisible().catch(() => false)) {
//           return "dashboard";
//         }
//       }
//       // Only conclude "stayed on edit" after a settle window (avoid racing a slow redirect).
//       if (Date.now() - started >= 12_000 && /einvoice\/edit/i.test(url)) {
//         const onEditShell =
//           (await update.isVisible().catch(() => false)) ||
//           (await submit.isVisible().catch(() => false));
//         if (onEditShell) {
//           return "edit";
//         }
//       }
//       await this.page.waitForTimeout(1_000);
//     }
// 
//     if (await upload.isVisible().catch(() => false)) {
//       return "dashboard";
//     }
//     if (/einvoice\/edit/i.test(this.page.url())) {
//       return "edit";
//     }
//     throw new Error(
//       `After attachment Update/Submit: neither e-invoice dashboard nor edit shell within ${timeoutMs}ms (url=${this.page.url()})`
//     );
//   }
// }
