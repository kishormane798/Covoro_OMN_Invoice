// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under testData/ui/; executable code is commented out.
//
// /**
//  * Create Invoice — currency dropdown vs exchange rate field.
//  * Excel uses ISO codes (AED, USD); the UI autocomplete lists **currency names**
//  * (UAE Dirham, US Dollar, …). Filter/select by that label, not by typing "USD".
//  * `#currExchangeRate` is numeric only (e.g. 3.67) and disabled when currency is AED.
//  */
//
// import { INVOICE_CURRENCY_ISO_TO_DISPLAY_NAME } from "../FieldValidations/invoiceCurrencyIsoToDisplayName";
//
// export type InvoiceCurrencyUiPick = {
//   /** Typed into `#invCurrCode` to filter the list (full currency name). */
//   filterText: string;
//   /** Exact MUI option label to click. */
//   option: RegExp;
// };
//
// function escapeRegExp(value: string): string {
//   return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// }
//
// /** Exact-match option for a currency display name (avoids "US Dollar (Next day)" when picking USD). */
// export function currencyDisplayNameOptionPattern(displayName: string): RegExp {
//   return new RegExp(`^${escapeRegExp(displayName)}$`, "i");
// }
//
// export function isAedInvoiceCurrency(code: string | RegExp): boolean {
//   return normalizeInvoiceCurrencyCode(code) === "AED";
// }
//
// export function normalizeInvoiceCurrencyCode(code: string | RegExp): string {
//   if (typeof code === "string") {
//     return code.trim().toUpperCase();
//   }
//   const match = code.source.match(/([A-Z]{3})/i);
//   return match ? match[1].toUpperCase() : code.source;
// }
//
// export function invoiceCurrencyDisplayName(isoCode: string | RegExp): string {
//   const iso = normalizeInvoiceCurrencyCode(isoCode);
//   const name = INVOICE_CURRENCY_ISO_TO_DISPLAY_NAME[iso];
//   if (!name) {
//     throw new Error(
//       `Missing Create Invoice currency display name for ISO "${iso}". Add it to invoiceCurrencyIsoToDisplayName.ts.`
//     );
//   }
//   return name;
// }
//
// export function invoiceCurrencyUiPick(code: string | RegExp): InvoiceCurrencyUiPick {
//   const displayName = invoiceCurrencyDisplayName(code);
//   return {
//     filterText: displayName,
//     option: currencyDisplayNameOptionPattern(displayName),
//   };
// }
//
// /** True when `value` is a real invoice-currency ISO code (e.g. USD), not arbitrary 3 letters like `ABC`. */
// export function isKnownInvoiceCurrencyIsoCode(value: string): boolean {
//   const v = value.trim().toUpperCase();
//   return /^[A-Z]{3}$/.test(v) && Object.prototype.hasOwnProperty.call(
//     INVOICE_CURRENCY_ISO_TO_DISPLAY_NAME,
//     v
//   );
// }
//
// /**
//  * Value for `#currExchangeRate` — numeric/blank/invalid text from Excel scenarios.
//  * Allows intentional invalid values such as `ABC` (not a currency ISO code).
//  */
// export function exchangeRateValueForUi(
//   rateFromScenario: string | undefined | null,
//   currencyCodeForContext?: string
// ): string {
//   if (rateFromScenario === undefined || rateFromScenario === null) {
//     return "";
//   }
//   const rate = String(rateFromScenario).trim();
//   if (rate === "") {
//     return "";
//   }
//   if (isKnownInvoiceCurrencyIsoCode(rate)) {
//     const ctx = currencyCodeForContext ? ` (currency ${currencyCodeForContext})` : "";
//     throw new Error(
//       `Currency Exchange Rate must be a numeric value, not currency code "${rate}"${ctx}`
//     );
//   }
//   return rate;
// }
//
