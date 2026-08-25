// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under testData/ui/; executable code is commented out.
//
// /**
//  * Create E-Invoice manual UI — re-exports section-ordered validation rules (Excel-aligned).
//  */
//
// import { buildInvoiceNumber } from "../../Helpers/excel/fieldValidationHelper";
// import { getCounterpartyVatIdentifier } from "../../utils/envPartyIdentity";
//
// /** Per-test timeout for Create Invoice UI specs (no upload preamble). */
// export const UI_INVOICE_CREATION_TEST_TIMEOUT_MS = 150_000;
//
// /** Edit / Copy Invoice UI — upload + dashboard entry needs a larger budget under parallel workers. */
// export const UI_INVOICE_EDIT_TEST_TIMEOUT_MS = 150_000;
//
// export function uiInvoiceConditionalTestTimeoutMs(
//   entry: "create" | "edit" | "copy"
// ): number {
//   return entry === "create"
//     ? UI_INVOICE_CREATION_TEST_TIMEOUT_MS
//     : UI_INVOICE_EDIT_TEST_TIMEOUT_MS;
// }
//
// /** Create Invoice **Search Buyer** — master record used before field validation. */
// export const CREATE_INVOICE_SEARCH_BUYER_NAME = "Prashant";
// /** TRN on the Prashant search row — env-aware (`100009191900003` dev, `100821229500003` preprod). */
// export const CREATE_INVOICE_SEARCH_BUYER_VAT = getCounterpartyVatIdentifier();
//
// /** Unique invoice number for Create Invoice document Save (max 64 per Excel). */
// export function buildUniqueCreateInvoiceNumber(uniqueKey?: string): string {
//   const raw = `UI-${(uniqueKey ?? String(Date.now())).replace(/\|/g, "-")}`;
//   return buildInvoiceNumber(raw, 64);
// }
//
// export {
//   CREATE_INVOICE_SECTION_AREAS,
//   CREATE_INVOICE_VALIDATION_SECTION_ORDER,
//   CREATE_INVOICE_SECTION_LABELS,
//   createInvoiceMinMaxRulesForSection,
//   createInvoiceMinMaxRulesForSections,
//   type CreateInvoiceFieldRule,
//   type CreateInvoiceSection,
// } from "./uiInvoiceCreationFieldMinMax";
//
// import { uiMasterBuyerSellerMinMax, uiMasterItemMinMax } from "./uiMasterFieldMinMax";
// import type { FieldMinMaxRule } from "./uiMasterFieldMinMax";
//
// const BUYER_NOT_ON_EDITOR = new Set(["identifier", "peppolSchemeIdentifier"]);
//
// /** @deprecated Use `createInvoiceMinMaxRulesForSection("buyer")` — Excel-aligned rules. */
// export function uiInvoiceCreationBuyerMinMaxRules(): FieldMinMaxRule[] {
//   return uiMasterBuyerSellerMinMax.filter((c) => !BUYER_NOT_ON_EDITOR.has(c.inputId));
// }
//
// /** @deprecated Use `createInvoiceMinMaxRulesForSection("item")`. */
// export function uiInvoiceCreationItemMinMaxRules(): FieldMinMaxRule[] {
//   return uiMasterItemMinMax;
// }
//
// export const CREATE_INVOICE_BUYER_CORE_INPUT_IDS = [
//   "name",
//   "vatIdentifier",
//   "address",
//   "city",
//   "countryCode",
//   "countrySubdivision",
// ] as const;
//
// export const CREATE_INVOICE_ITEM_CORE_INPUT_IDS = [
//   "itemName",
//   "itemDescription",
//   "itemType",
//   "classifications",
//   "classificationIdentifier",
//   "priceBaseQty",
//   "unitOfMeasure",
//   "itemGrossPrice",
//   "taxRateDtls[0].taxCategory",
// ] as const;
//
