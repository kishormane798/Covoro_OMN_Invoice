// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under testData/ui/; executable code is commented out.
//
// /**
//  * Min / max / below-min / above-max rules for Masters **Add New** forms (UI only).
//  * Limits mirror the Masters form (`maxlength` / required flags), not Excel upload files.
//  */
//
// export type UiMasterFormTab = "buyerSeller" | "item";
//
// export type FieldMinMaxRule = {
//   field: string;
//   inputId: string;
//   tab: UiMasterFormTab;
//   min: number;
//   max: number;
//   belowMin: number;
//   aboveMax: number;
//   /** When false, empty / below-min may save without length error on this field. */
//   requiredOnForm?: boolean;
//   /** Masters UI accepts digits only (e.g. Buyer post code). */
//   numericOnly?: boolean;
// };
//
// function uiMinMaxRule(
//   field: string,
//   inputId: string,
//   tab: UiMasterFormTab,
//   min: number,
//   max: number,
//   options?: { requiredOnForm?: boolean; numericOnly?: boolean }
// ): FieldMinMaxRule {
//   return {
//     field,
//     inputId,
//     tab,
//     min,
//     max,
//     belowMin: Math.max(0, min - 1),
//     aboveMax: max + 1,
//     requiredOnForm: options?.requiredOnForm ?? true,
//     numericOnly: options?.numericOnly,
//   };
// }
//
// /** Buyer/Seller Add New — text fields on the Masters UI. */
// export const uiMasterBuyerSellerMinMax: FieldMinMaxRule[] = [
//   uiMinMaxRule("Buyer name", "name", "buyerSeller", 1, 300),
//   uiMinMaxRule("Buyer address line 1", "address", "buyerSeller", 1, 300),
//   uiMinMaxRule("Buyer city", "city", "buyerSeller", 1, 64),
//   uiMinMaxRule("Buyer post code", "postalCode", "buyerSeller", 1, 30, {
//     requiredOnForm: false,
//     numericOnly: true,
//   }),
//   // 15 numeric digits: starts with `1`, ends with `03` (see buildUniqueBuyerVatIdentifier).
//   uiMinMaxRule("Buyer VAT identifier", "vatIdentifier", "buyerSeller", 15, 15, {
//     numericOnly: true,
//   }),
//   uiMinMaxRule("Buyer legal registration identifier", "legalRegId", "buyerSeller", 1, 20, {
//     requiredOnForm: false,
//   }),
//   // Editable only under Commercial/Trade License; min/max helper selects that type first.
//   uiMinMaxRule("Buyer - Authority name", "authorityName", "buyerSeller", 1, 300),
//   // Required on Masters Add New (live UI: "Please enter buyer identifier.").
//   uiMinMaxRule("Buyer identifier", "identifier", "buyerSeller", 1, 300),
//   uiMinMaxRule("Buyer electronic address", "electronicAddress", "buyerSeller", 1, 300, {
//     requiredOnForm: false,
//   }),
//   // BTUAT-01: TIN (10) or TRN (15) only; 9 / 16 digits invalid even though field is optional.
//   uiMinMaxRule("Beneficiary ID", "beneficiaryId", "buyerSeller", 10, 15, {
//     requiredOnForm: false,
//     numericOnly: true,
//   }),
// ];
//
// /** Items Add New — text fields on the Masters UI. */
// export const uiMasterItemMinMax: FieldMinMaxRule[] = [
//   uiMinMaxRule("Item name", "itemName", "item", 1, 300),
//   uiMinMaxRule("Item description", "itemDescription", "item", 1, 300),
//   uiMinMaxRule("Item standard identifier", "standardId", "item", 1, 15, {
//     requiredOnForm: false,
//   }),
//   // Below min: Goods + empty classification scheme (`classifications`) + empty identifier.
//   uiMinMaxRule("Item classification identifier", "classificationIdentifier", "item", 1, 30, {
//     requiredOnForm: false,
//   }),
//   uiMinMaxRule("Service Accounting code", "serviceAccCode", "item", 1, 10, {
//     requiredOnForm: false,
//   }),
//   // Numeric: max 10 digits; min `1.00` (4 chars).
//   uiMinMaxRule("Item price base quantity", "priceBaseQty", "item", 4, 10),
//   // Numeric: max 13 integer digits + 2 decimals (16 chars); min `1.00`.
//   uiMinMaxRule("Item gross price", "itemGrossPrice", "item", 4, 16),
// ];
//
// export type UiMasterMinMaxVariant = "min" | "max" | "belowMin" | "aboveMax";
//
// export const UI_MASTER_MIN_MAX_VARIANTS: readonly UiMasterMinMaxVariant[] = [
//   "min",
//   "max",
//   "belowMin",
//   "aboveMax",
// ] as const;
//
// /** Playwright test title fragment for a min/max variant (Masters + Create Invoice UI). */
// export function uiMinMaxCondition(
//   variant: UiMasterMinMaxVariant,
//   config: FieldMinMaxRule
// ): string {
//   switch (variant) {
//     case "min":
//       return `minimum length (${config.min} char${config.min === 1 ? "" : "s"})`;
//     case "max":
//       return `maximum length (${config.max} chars)`;
//     case "belowMin":
//       return config.belowMin === 0
//         ? "empty (below minimum)"
//         : `${config.belowMin} chars (below minimum)`;
//     case "aboveMax":
//       return `${config.aboveMax} chars (above maximum)`;
//   }
// }
//
// export function uiMasterTestString(length: number): string {
//   if (length <= 0) {
//     return "";
//   }
//   return "A".repeat(length);
// }
//
// /** Digits-only test values for numeric-only master inputs (post code). */
// export function uiMasterTestNumericString(length: number): string {
//   if (length <= 0) {
//     return "";
//   }
//   return "1".repeat(length);
// }
//
// export function uiMasterTestValueForLength(config: FieldMinMaxRule, length: number): string {
//   if (config.numericOnly) {
//     return uiMasterTestNumericString(length);
//   }
//   return uiMasterTestString(length);
// }
//
// export function lengthForUiMasterVariant(
//   config: FieldMinMaxRule,
//   variant: UiMasterMinMaxVariant
// ): number {
//   switch (variant) {
//     case "min":
//       return config.min;
//     case "max":
//       return config.max;
//     case "belowMin":
//       return config.belowMin;
//     case "aboveMax":
//       return config.aboveMax;
//   }
// }
//
// export function expectsUiMasterValidationError(
//   config: FieldMinMaxRule,
//   variant: UiMasterMinMaxVariant
// ): boolean {
//   if (variant === "belowMin") {
//     return config.requiredOnForm !== false && config.belowMin < config.min;
//   }
//   if (variant === "aboveMax") {
//     return config.aboveMax > config.max;
//   }
//   return false;
// }
//
// export function uiMinMaxTestOutcome(
//   config: FieldMinMaxRule,
//   variant: UiMasterMinMaxVariant
// ): "field error" | "accepted" {
//   return expectsUiMasterValidationError(config, variant) ? "field error" : "accepted";
// }
//
