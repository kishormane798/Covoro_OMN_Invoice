// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under a ui/ subfolder; executable code is commented out.
//
// import {
//   OTHER_SCHEME_IDENTIFIER,
//   SCHEME_IDENTIFIER_0235,
// } from "../../testData/ui/ConditionalValidation";
// 
// /** ISO 6523 / electronic-address scheme label for UAE TIN (0235). */
// export const UAE_TIN_SCHEME_LABEL = SCHEME_IDENTIFIER_0235;
// 
// /** Non-TIN scheme used when country must be editable (e.g. India). */
// export const NON_UAE_TIN_SCHEME_LABEL = OTHER_SCHEME_IDENTIFIER;
// 
// export function isNonUaeCountryCode(countryCode: string): boolean {
//   const trimmed = countryCode.trim();
//   return trimmed !== "" && !/^United Arab Emirates$/i.test(trimmed);
// }
// 
// export function sellerCountryRequiresNonTinScheme(countryCode?: string): boolean {
//   return countryCode != null && isNonUaeCountryCode(countryCode);
// }
// 
// export function parseSellerCountryTransition(
//   title: string
// ): { from: string; to: string } | null {
//   const m = title.match(/Changed from (.+?) to (.+?) Seller Country/i);
//   if (!m) {
//     return null;
//   }
//   return { from: m[1].trim(), to: m[2].trim() };
// }
// 
// export function parseBuyerCountryTransition(
//   title: string
// ): { from: string; to: string } | null {
//   const m = title.match(/Changed from (.+?) to (.+?) Buyer Country/i);
//   if (!m) {
//     return null;
//   }
//   return { from: m[1].trim(), to: m[2].trim() };
// }
