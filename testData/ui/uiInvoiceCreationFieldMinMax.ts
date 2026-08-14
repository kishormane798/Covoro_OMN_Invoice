// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under testData/ui/; executable code is commented out.
//
// /**
//  * Create Invoice manual UI — min/max rules aligned with Excel field validation
//  * (`fieldInvoice_number`, `fieldValidationMandatory`, `fieldValidationOptional`)
//  * and `fieldSectionMap` sections.
//  */
//
// import { fieldSectionMap } from "../FieldValidations/Master";
// import {
//   fieldInvoice_number,
//   fieldValidationMandatory,
//   fieldValidationOptional,
// } from "../FieldValidations/Min_max_field_validation";
// import type { FieldMinMaxRule, UiMasterMinMaxVariant } from "./uiMasterFieldMinMax";
// import {
//   expectsUiMasterValidationError,
//   uiMasterTestNumericString,
//   uiMasterTestString,
// } from "./uiMasterFieldMinMax";
//
// /** Matches `fieldSectionMap` + Create E-Invoice UI blocks. */
// export type CreateInvoiceSection =
//   | "document"
//   | "seller"
//   | "buyer"
//   | "delivery"
//   | "item"
//   | "invoice"
//   | "payment"
//   | "custom";
//
// export const CREATE_INVOICE_VALIDATION_SECTION_ORDER: readonly CreateInvoiceSection[] = [
//   "document",
//   "seller",
//   "buyer",
//   "delivery",
//   "item",
//   "invoice",
//   "payment",
//   "custom",
// ] as const;
//
// export const CREATE_INVOICE_SECTION_LABELS: Record<CreateInvoiceSection, string> = {
//   document: "1. Document Details",
//   seller: "2. A. Seller Details",
//   buyer: "2. B. Buyer Details",
//   delivery: "2. C. Shipping Details",
//   item: "3. Item Details",
//   invoice: "4. Invoice Details",
//   payment: "5. Payment Details",
//   custom: "6. Custom Details",
// };
//
// /** Short section name for Playwright test titles (e.g. `Create Invoice UI | Document | …`). */
// export const CREATE_INVOICE_SECTION_AREAS: Record<CreateInvoiceSection, string> = {
//   document: "Document",
//   seller: "Seller",
//   buyer: "Buyer",
//   delivery: "Delivery",
//   item: "Item",
//   invoice: "Invoice",
//   payment: "Payment",
//   custom: "Custom",
// };
//
// export type CreateInvoiceFieldRule = FieldMinMaxRule & {
//   section: CreateInvoiceSection;
//   /** Excel / template header (same as upload field validation). */
//   excelField: string;
// };
//
// type ExcelMinMax = {
//   field: string;
//   min: number;
//   max: number;
//   belowMin: number;
//   aboveMax: number;
// };
//
// /**
//  * Excel header → Create E-Invoice input `id` (from UI HTML / predefined-endpoints editor).
//  * Omit entries when the control is missing or not length-testable on create invoice.
//  */
// export const EXCEL_FIELD_TO_CREATE_INVOICE_INPUT_ID: Partial<Record<string, string>> = {
//   "Invoice Number": "invNum",
//   "Contract Reference": "contactReference",
//   "Contract Value": "contactValue",
//   "Purchase Order Number": "purchaseOrderRef",
//   "Invoice note": "invNote",
//   "Frequency of Billing": "frequencyOfBilling",
//   "Principle ID": "principleId",
//
//   "Seller name": "sellerName",
//   "Seller VAT Identifier (TRN / TIN)": "sellerVatIdentifier",
//   "Seller electronic address": "sellerElectronicAddress",
//   "Seller address line 1": "sellerAddressLine1",
//   "Seller city": "sellerCity",
//   "Seller post code": "sellerPostCode",
//
//   "Buyer name": "name",
//   "Buyer address line 1": "address",
//   "Buyer city": "city",
//   "Buyer post code": "postalCode",
//   "Buyer VAT identifier": "vatIdentifier",
//   "Buyer legal registration identifier": "legalRegId",
//   "Buyer - Authority name": "authorityName",
//   "Buyer identifier": "identifier",
//   "Buyer electronic address": "electronicAddress",
//   "Beneficiary ID": "beneficiaryId",
//
//   "Deliver to party name": "deliverToPartyName",
//   "Deliver to location identifier": "deliverToLocationIdentifier",
//   "Deliver to address line 1": "deliverToAddressLine1",
//   "Deliver to address line 2": "deliverToAddressLine2",
//   "Deliver to address line 3": "deliverToAddressLine3",
//   "Deliver to post code": "deliverToPostCode",
//
//   "Invoice line identifier": "invoiceLineIdentifier",
//   "Item name": "itemName",
//   "Item description": "itemDescription",
//   "Item standard identifier": "standardId",
//   "Item classification identifier": "classificationIdentifier",
//   "Service Accounting code": "serviceAccCode",
//   "Item price base quantity": "priceBaseQty",
//   "Item gross price": "itemGrossPrice",
//
//   "Payment means type code": "paymentMeansTypeCode",
//   "Scheme Identifier": "paymentSchemeIdentifier",
//   "Payment account identifier": "paymentAccountIdentifier",
//   "Payment account name": "paymentAccountName",
//   "Payment service provider identifier": "paymentServiceProviderIdentifier",
//   "Payment card primary account number": "paymentCardPrimaryAccountNumber",
//
//   "Custom 1": "custom1",
//   "Custom 2": "custom2",
//   "Custom 3": "custom3",
//   "Custom 4": "custom4",
//   "Custom 5": "custom5",
// };
//
// /** Excel min/max fields missing from `fieldSectionMap` (Create Invoice section). */
// const CREATE_INVOICE_SECTION_BY_EXCEL_FIELD: Partial<Record<string, CreateInvoiceSection>> = {
//   "Purchase Order Number": "document",
// };
//
// /** Not present on Create Invoice buyer editor (Masters-only). */
// const BUYER_FIELDS_SKIP_ON_CREATE_INVOICE = new Set(["Buyer identifier"]);
//
// const BUYER_INPUT_IDS_NOT_ON_CREATE_INVOICE = new Set(["identifier", "peppolSchemeIdentifier"]);
//
// /** Custom fields: in `fieldSectionMap` but not in Excel min/max arrays — use UI limits. */
// const CREATE_INVOICE_CUSTOM_UI_RULES: CreateInvoiceFieldRule[] = [1, 2, 3, 4, 5].map((n) => ({
//   field: `Custom ${n}`,
//   excelField: `Custom ${n}`,
//   inputId: `custom${n}`,
//   section: "custom" as const,
//   tab: "buyerSeller" as const,
//   min: 0,
//   max: 300,
//   belowMin: 0,
//   aboveMax: 301,
//   requiredOnForm: false,
// }));
//
// /**
//  * Create Invoice form limits that differ from Excel upload (`Min_max_field_validation.ts`).
//  * Mirrors Masters UI `maxlength` where applicable.
//  */
// const CREATE_INVOICE_UI_MIN_MAX_OVERRIDES: Partial<
//   Record<string, Pick<ExcelMinMax, "min" | "max">>
// > = {
//   "Seller post code": { min: 1, max: 30 },
//   "Buyer post code": { min: 1, max: 30 },
//   "Deliver to post code": { min: 1, max: 30 },
// };
//
// /** Invoice totals / charge tabs — read-only on create; no length tests. */
// const INVOICE_SECTION_EXCEL_FIELDS_SKIP = new Set([
//   "Sum of Invoice line net amount",
//   "Invoice total amount without tax",
//   "Invoice total tax amount",
//   "Invoice total amount with tax",
//   "Paid amount",
//   "Rounding amount",
//   "Amount due for payment",
//   "Charges on document level",
//   "Allowances on document level",
// ]);
//
// const EXCEL_MANDATORY_MIN_MAX_FIELDS = new Set(
//   [...fieldInvoice_number, ...fieldValidationMandatory].map((row) => row.field)
// );
//
// function excelConfigs(): ExcelMinMax[] {
//   const seen = new Set<string>();
//   const out: ExcelMinMax[] = [];
//   for (const row of [
//     ...fieldInvoice_number,
//     ...fieldValidationMandatory,
//     ...fieldValidationOptional,
//   ]) {
//     if (seen.has(row.field)) continue;
//     seen.add(row.field);
//     out.push(row);
//   }
//   return out;
// }
//
// function sectionForExcelField(field: string): CreateInvoiceSection | null {
//   const override = CREATE_INVOICE_SECTION_BY_EXCEL_FIELD[field];
//   if (override) return override;
//   const section = fieldSectionMap[field];
//   if (!section) return null;
//   return section as CreateInvoiceSection;
// }
//
// function toCreateInvoiceRule(excel: ExcelMinMax): CreateInvoiceFieldRule | null {
//   const section = sectionForExcelField(excel.field);
//   const inputId = EXCEL_FIELD_TO_CREATE_INVOICE_INPUT_ID[excel.field];
//   if (!section || !inputId) return null;
//   if (BUYER_FIELDS_SKIP_ON_CREATE_INVOICE.has(excel.field)) return null;
//   if (section === "invoice" && INVOICE_SECTION_EXCEL_FIELDS_SKIP.has(excel.field)) {
//     return null;
//   }
//
//   const override = CREATE_INVOICE_UI_MIN_MAX_OVERRIDES[excel.field];
//   const min = override?.min ?? excel.min;
//   const max = override?.max ?? excel.max;
//   const belowMin = override ? Math.max(0, min - 1) : Math.max(0, excel.belowMin);
//   const aboveMax = override ? max + 1 : excel.aboveMax;
//
//   return {
//     field: excel.field,
//     excelField: excel.field,
//     inputId,
//     section,
//     tab: section === "buyer" ? "buyerSeller" : section === "item" ? "item" : "buyerSeller",
//     min,
//     max,
//     belowMin,
//     aboveMax,
//     /** `min: 1` on optional Excel fields means “if provided”, not required on form. */
//     requiredOnForm: EXCEL_MANDATORY_MIN_MAX_FIELDS.has(excel.field),
//     numericOnly:
//       excel.field === "Seller post code" ||
//       excel.field === "Buyer post code" ||
//       excel.field === "Deliver to post code" ||
//       excel.field === "Buyer VAT identifier" ||
//       excel.field === "Beneficiary ID" ||
//       excel.field === "Invoice line identifier",
//   };
// }
//
// /** Custom fields only — not in `Min_max_field_validation.ts` (no Excel upload min/max rows). */
// function supplementCustomFieldsOnly(excelRules: CreateInvoiceFieldRule[]): CreateInvoiceFieldRule[] {
//   const seen = new Set(excelRules.map((r) => `${r.section}:${r.inputId}`));
//   const out: CreateInvoiceFieldRule[] = [];
//
//   for (const rule of CREATE_INVOICE_CUSTOM_UI_RULES) {
//     const key = `${rule.section}:${rule.inputId}`;
//     if (seen.has(key)) continue;
//     seen.add(key);
//     out.push(rule);
//   }
//
//   return out;
// }
//
// function allCreateInvoiceRules(): CreateInvoiceFieldRule[] {
//   const excelRules = excelConfigs()
//     .map(toCreateInvoiceRule)
//     .filter((r): r is CreateInvoiceFieldRule => r !== null);
//   return [...excelRules, ...supplementCustomFieldsOnly(excelRules)];
// }
//
// export function createInvoiceMinMaxRulesForSection(
//   section: CreateInvoiceSection
// ): CreateInvoiceFieldRule[] {
//   return allCreateInvoiceRules().filter((r) => r.section === section);
// }
//
// export function createInvoiceMinMaxRulesForSections(
//   sections: readonly CreateInvoiceSection[]
// ): CreateInvoiceFieldRule[] {
//   const set = new Set(sections);
//   return allCreateInvoiceRules().filter((r) => set.has(r.section));
// }
//
// export function createInvoiceTestValueForLength(
//   rule: CreateInvoiceFieldRule,
//   length: number
// ): string {
//   if (rule.numericOnly) {
//     return uiMasterTestNumericString(length);
//   }
//   return uiMasterTestString(length);
// }
//
// export function lengthForCreateInvoiceVariant(
//   rule: CreateInvoiceFieldRule,
//   variant: UiMasterMinMaxVariant
// ): number {
//   switch (variant) {
//     case "min":
//       return rule.min;
//     case "max":
//       return rule.max;
//     case "belowMin":
//       return rule.belowMin;
//     case "aboveMax":
//       return rule.aboveMax;
//   }
// }
//
// export function expectsCreateInvoiceValidationError(
//   rule: CreateInvoiceFieldRule,
//   variant: UiMasterMinMaxVariant
// ): boolean {
//   if (rule.inputId === "classificationIdentifier" && variant === "belowMin") {
//     return true;
//   }
//   if (rule.inputId === "beneficiaryId" && variant === "belowMin") {
//     return true;
//   }
//   return expectsUiMasterValidationError(rule, variant);
// }
//
