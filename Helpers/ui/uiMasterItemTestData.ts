// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under a ui/ subfolder; executable code is commented out.
//
// /** Item **Type** options on Masters â†’ Items â†’ Add New. */
// export const UI_MASTER_ITEM_TYPE_OPTIONS = ["Goods", "Service", "Both"] as const;
// 
// export const DEFAULT_UI_MASTER_ITEM_TYPE = UI_MASTER_ITEM_TYPE_OPTIONS[0];
// 
// export const UI_MASTER_ITEM_TYPE_GOODS = "Goods" as const;
// export const UI_MASTER_ITEM_TYPE_SERVICE = "Service" as const;
// export const UI_MASTER_ITEM_TYPE_BOTH = "Both" as const;
// 
// /**
//  * Only classification scheme on Items Add New (WCO Harmonised System).
//  * UI label: Harmonised system â€” Item number generated under WCO Harmonised System.
//  */
// export const UI_MASTER_CLASSIFICATION_SCHEME_LABEL =
//   "Harmonised system â€” Item number generated under WCO Harmonised System.";
// 
// export const DEFAULT_UI_MASTER_CLASSIFICATION_SCHEME = /Harmonised system/i;
// 
// export const UI_MASTER_CLASSIFICATION_SCHEME_FILTER_TEXT = "Harmonised system";
// 
// export const UI_MASTER_DEFAULT_CLASSIFICATION_IDENTIFIER = "12345";
// export const UI_MASTER_DEFAULT_SERVICE_ACCOUNTING_CODE = "SAC123";
// 
// /** Invoice item **Tax category** (`taxRateDtls[0].taxCategory`) on Items Add New. */
// export const UI_MASTER_ITEM_TAX_CATEGORY_OPTIONS = [
//   "Standard rate.",
//   "Standard rate additional VAT",
//   "Zero rated",
//   "Exempt from tax",
//   "VAT reverse charge",
//   "Not subject to VAT",
//   "Out of scope",
// ] as const;
// 
// /** Default tax category for baseline saves on Items Add New. */
// export const DEFAULT_UI_MASTER_ITEM_TAX_CATEGORY = /^Standard rate\.?$/i;
// 
// /** Unit of measure on Add New (`unitOfMeasure`) â€” large list; filter by typing. */
// export const DEFAULT_UI_MASTER_UNIT_OF_MEASURE = "becquerel per kilogram";
// 
// /** Listbox / option wait for UOM autocomplete (large dataset). */
// export const UI_MASTER_UNIT_OF_MEASURE_TIMEOUT_MS = 90_000;
// 
// /** Decimal places for quantity and gross price on Items Add New. */
// export const UI_MASTER_ITEM_DECIMAL_PLACES = 2;
// 
// /** Item price base quantity: max 10 digits (UI `maxlength` 11). */
// export const UI_MASTER_PRICE_BASE_QTY_MAX_INT_DIGITS = 10;
// 
// /** Item gross price: max 13 integer digits + 2 decimals. */
// export const UI_MASTER_ITEM_GROSS_PRICE_MAX_INT_DIGITS = 13;
// 
// function buildDecimalMinValue(): string {
//   return `1.${"0".repeat(UI_MASTER_ITEM_DECIMAL_PLACES)}`;
// }
// 
// function buildDecimalMaxValue(maxIntegerDigits: number): string {
//   return `${"1".repeat(maxIntegerDigits)}.${"9".repeat(UI_MASTER_ITEM_DECIMAL_PLACES)}`;
// }
// 
// function buildDecimalAboveMaxValue(maxIntegerDigits: number): string {
//   return `${"1".repeat(maxIntegerDigits)}.${"9".repeat(UI_MASTER_ITEM_DECIMAL_PLACES + 1)}`;
// }
// 
// /** Valid minimum price base quantity (`1.00`). */
// export function buildValidUiMasterPriceBaseQtyMin(): string {
//   return buildDecimalMinValue();
// }
// 
// /** Valid maximum price base quantity (10 digits). */
// export function buildValidUiMasterPriceBaseQtyMax(): string {
//   return "9".repeat(UI_MASTER_PRICE_BASE_QTY_MAX_INT_DIGITS);
// }
// 
// /** Invalid quantity â€” 11 digits (above 10-digit limit). */
// export function buildInvalidUiMasterPriceBaseQtyAboveMax(): string {
//   return "9".repeat(UI_MASTER_PRICE_BASE_QTY_MAX_INT_DIGITS + 1);
// }
// 
// /** Valid minimum gross price (`1.00`). */
// export function buildValidUiMasterItemGrossPriceMin(): string {
//   return buildDecimalMinValue();
// }
// 
// /** Valid maximum gross price (13 integer digits + 2 decimals). */
// export function buildValidUiMasterItemGrossPriceMax(): string {
//   return buildDecimalMaxValue(UI_MASTER_ITEM_GROSS_PRICE_MAX_INT_DIGITS);
// }
// 
// /** Invalid gross price â€” 13 integer digits + 3 decimal places. */
// export function buildInvalidUiMasterItemGrossPriceAboveMax(): string {
//   return buildDecimalAboveMaxValue(UI_MASTER_ITEM_GROSS_PRICE_MAX_INT_DIGITS);
// }
