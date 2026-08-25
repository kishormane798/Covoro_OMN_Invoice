// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under a ui/ subfolder; executable code is commented out.
//
// import { getParallelWorkerIndex } from "../worker/parallelWorkerSubmitIdentity";
// 
// /** UAE **Country Subdivision** options on Buyer/Seller Add New (after Country = UAE). */
// export const UAE_COUNTRY_SUBDIVISION_DROPDOWN_OPTIONS = [
//   "Abu Dhabi",
//   "Dubai",
//   "Sharjah",
//   "Umm Al Quwain",
//   "Fujairah",
//   "Ajman",
//   "Ras Al Khaimah",
// ] as const;
// 
// export const DEFAULT_UAE_COUNTRY_SUBDIVISION = UAE_COUNTRY_SUBDIVISION_DROPDOWN_OPTIONS[0];
// 
// /** Stable small integer from a test name (field + variant) for parallel-safe VAT seeds. */
// function hashTestKey(key: string): number {
//   let h = 0;
//   for (let i = 0; i < key.length; i += 1) {
//     h = (h * 31 + key.charCodeAt(i)) % 1_000_000;
//   }
//   return h;
// }
// 
// /** Masters UI VAT: exactly 15 digits, numeric, starts with `1`, ends with `03`. */
// export const UI_MASTER_VAT_LENGTH = 15;
// export const UI_MASTER_VAT_SUFFIX = "03";
// /** Middle digits between leading `1` and trailing `03` (1 + 12 + 2 = 15). */
// export const UI_MASTER_VAT_MIDDLE_LENGTH = 12;
// 
// /**
//  * Valid 15-digit buyer VAT: `1` + 12 digits + `03`.
//  * Unique per worker + test + time (saved buyers persist in the app between runs).
//  */
// export function buildUniqueBuyerVatIdentifier(uniqueKey?: string): string {
//   const slot = getParallelWorkerIndex();
//   const keyPart = uniqueKey ? hashTestKey(uniqueKey) : 0;
//   const timePart = Date.now() % 100_000_000;
//   const rand = Math.floor(Math.random() * 10_000);
//   const middle = String(slot * 1_000_000_000_000 + keyPart * 1_000_000 + timePart + rand)
//     .replace(/\D/g, "")
//     .slice(-UI_MASTER_VAT_MIDDLE_LENGTH)
//     .padStart(UI_MASTER_VAT_MIDDLE_LENGTH, "0");
//   return `1${middle}${UI_MASTER_VAT_SUFFIX}`;
// }
// 
// /** Invalid VAT â€” 14 digits (`1` + 11 + `03`). */
// export function buildInvalidUiMasterBuyerVat14Chars(): string {
//   return `1${"0".repeat(11)}${UI_MASTER_VAT_SUFFIX}`;
// }
// 
// /** Invalid VAT â€” 16 digits (`1` + 13 + `03`). */
// export function buildInvalidUiMasterBuyerVat16Chars(): string {
//   return `1${"0".repeat(13)}${UI_MASTER_VAT_SUFFIX}`;
// }
// 
// /** VAT test value for min/max length variants (`vatIdentifier` on Masters Add New). */
// export function buildUiMasterBuyerVatForLength(length: number, uniqueKey?: string): string {
//   if (length <= 0) {
//     return "";
//   }
//   if (length === UI_MASTER_VAT_LENGTH) {
//     return buildUniqueBuyerVatIdentifier(uniqueKey);
//   }
//   if (length === UI_MASTER_VAT_LENGTH - 1) {
//     return buildInvalidUiMasterBuyerVat14Chars();
//   }
//   if (length === UI_MASTER_VAT_LENGTH + 1) {
//     return buildInvalidUiMasterBuyerVat16Chars();
//   }
//   return "1".repeat(length);
// }
// 
// /** Beneficiary ID (BTUAT-01): TIN = 10 numeric digits starting with `1`. */
// export const UI_MASTER_BENEFICIARY_TIN_LENGTH = 10;
// /** Beneficiary ID: TRN = same as VAT (`1` + 12 digits + `03`). */
// export const UI_MASTER_BENEFICIARY_TRN_LENGTH = UI_MASTER_VAT_LENGTH;
// 
// /** Valid 10-digit beneficiary TIN: `1` + 9 digits. */
// export function buildUniqueBeneficiaryIdTin(uniqueKey?: string): string {
//   const slot = getParallelWorkerIndex();
//   const keyPart = uniqueKey ? hashTestKey(uniqueKey) : 0;
//   const timePart = Date.now() % 100_000_000;
//   const rand = Math.floor(Math.random() * 10_000);
//   const nineDigits = String(slot * 100_000_000 + keyPart + timePart + rand)
//     .replace(/\D/g, "")
//     .slice(-9)
//     .padStart(9, "0");
//   return `1${nineDigits}`;
// }
// 
// /** Valid 15-digit beneficiary TRN (`1` â€¦ `03`). */
// export function buildUniqueBeneficiaryIdTrn(uniqueKey?: string): string {
//   return buildUniqueBuyerVatIdentifier(uniqueKey);
// }
// 
// /** Invalid beneficiary ID â€” 9 digits (not TIN or TRN). */
// export function buildInvalidBeneficiaryId9Chars(): string {
//   return `1${"0".repeat(8)}`;
// }
// 
// /** Invalid beneficiary ID â€” 16 digits (not TIN or TRN). */
// export function buildInvalidBeneficiaryId16Chars(): string {
//   return buildInvalidUiMasterBuyerVat16Chars();
// }
// 
// /** Beneficiary ID values for min/max variants (TIN 10 / TRN 15 only). */
// export function buildUiMasterBeneficiaryIdForLength(
//   length: number,
//   uniqueKey?: string
// ): string {
//   if (length <= 0) {
//     return "";
//   }
//   if (length === UI_MASTER_BENEFICIARY_TIN_LENGTH) {
//     return buildUniqueBeneficiaryIdTin(uniqueKey);
//   }
//   if (length === UI_MASTER_BENEFICIARY_TRN_LENGTH) {
//     return buildUniqueBeneficiaryIdTrn(uniqueKey);
//   }
//   if (length === UI_MASTER_BENEFICIARY_TIN_LENGTH - 1) {
//     return buildInvalidBeneficiaryId9Chars();
//   }
//   if (length === UI_MASTER_BENEFICIARY_TRN_LENGTH + 1) {
//     return buildInvalidBeneficiaryId16Chars();
//   }
//   return "1".repeat(length);
// }
