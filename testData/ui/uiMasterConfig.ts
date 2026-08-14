// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under testData/ui/; executable code is commented out.
//
// /**
//  * Masters **Add New** UI only — not tied to Excel upload / invoice field maps.
//  */
//
// import type { UiMasterFormTab } from "./uiMasterFieldMinMax";
//
// /** Invoice-style labels exercised on Buyer/Seller Add New (UI). */
// export const UI_MASTER_BUYER_SELLER_FIELD_NAMES = [
//   "Buyer name",
//   "Buyer VAT identifier",
//   "Buyer address line 1",
//   "Buyer city",
//   "Buyer post code",
//   "Buyer legal registration identifier",
//   "Buyer - Authority name",
//   "Buyer identifier",
//   "Buyer electronic address",
//   "Beneficiary ID",
// ] as const;
//
// /** Invoice-style labels exercised on Items Add New (UI). */
// export const UI_MASTER_ITEM_FIELD_NAMES = [
//   "Item name",
//   "Item description",
//   "Item standard identifier",
//   "Item classification identifier",
//   "Service Accounting code",
//   "Item price base quantity",
//   "Item gross price",
// ] as const;
//
// const BUYER_SELLER_SET = new Set<string>(UI_MASTER_BUYER_SELLER_FIELD_NAMES);
// const ITEM_SET = new Set<string>(UI_MASTER_ITEM_FIELD_NAMES);
//
// export function uiMasterTabForField(fieldName: string): UiMasterFormTab {
//   if (BUYER_SELLER_SET.has(fieldName)) {
//     return "buyerSeller";
//   }
//   if (ITEM_SET.has(fieldName)) {
//     return "item";
//   }
//   throw new Error(
//     `Field "${fieldName}" is not configured for Masters UI tests (see uiMasterConfig.ts).`
//   );
// }
//
// export function listUiMasterFieldsForTab(tab: UiMasterFormTab): readonly string[] {
//   return tab === "buyerSeller" ? UI_MASTER_BUYER_SELLER_FIELD_NAMES : UI_MASTER_ITEM_FIELD_NAMES;
// }
//
