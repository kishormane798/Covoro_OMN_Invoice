// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under testData/ui/; executable code is commented out.
//
// /**
//  * Null / empty / whitespace helpers for Create Invoice UI tests.
//  * Kept separate to avoid circular imports between conditional scenario modules.
//  */
//
// /** Null, empty, or whitespace-only Excel cell → `undefined` (empty on Create Invoice UI). */
// export function resolveUiNullOrEmpty(raw: string | null | undefined): string | undefined {
//   if (raw == null) {
//     return undefined;
//   }
//   if (raw.trim() === "") {
//     return undefined;
//   }
//   return raw;
// }
//
// /** @deprecated Use {@link resolveUiNullOrEmpty}. */
// export const resolveUiWhitespaceAsNull = resolveUiNullOrEmpty;
//
// export function isUiNullOrEmpty(value: string | null | undefined): boolean {
//   return resolveUiNullOrEmpty(value) === undefined;
// }
//
// /** @deprecated Use {@link isUiNullOrEmpty}. */
// export const isUiEmptyOrWhitespace = isUiNullOrEmpty;
//
