/**
 * Multi-item submit cases (compact, CI-friendly).
 * Generated from the Excel and de-duplicated: `common` holds shared columns,
 * `lines` holds per-line overrides (only the differing, non-empty fields).
 *
 * This file intentionally contains a compact, committed dataset so CI/CD does NOT need
 * access to `multiSubmit.xlsx`.
 */

import compactCases from "./SubmitInvoiceMultiItem.compact.json";

export type MultiItemSubmitInvoiceCaseCompact = {
  name: string;
  common: Record<string, string>;
  lines: Array<Record<string, string>>;
};

export type MultiItemSubmitInvoiceCase = {
  name: string;
  rows: Array<Record<string, string>>;
};

export const MULTI_ITEM_SUBMIT_SOURCE_XLSX =
  "C:\\Users\\Kishor Mane\\Videos\\multiSubmit.xlsx";

export const multiItemInvoiceCasesCompact: MultiItemSubmitInvoiceCaseCompact[] =
  compactCases as unknown as MultiItemSubmitInvoiceCaseCompact[];

export function expandMultiItemCase(
  tc: MultiItemSubmitInvoiceCaseCompact
): Array<Record<string, string>> {
  return tc.lines.map((line) => ({ ...tc.common, ...line }));
}

export const multiItemInvoiceCases: MultiItemSubmitInvoiceCase[] =
  multiItemInvoiceCasesCompact.map((tc) => ({
    name: tc.name,
    rows: expandMultiItemCase(tc),
  }));

export const MULTI_ITEM_SUBMIT_CASE_COUNT = multiItemInvoiceCasesCompact.length;

