import type { InvoiceFormulaScenario } from "../FieldValidations/Min_max_field_validation";
import {
  OMN_UI_EXCEL_PARTY_IDENTITY_CASES,
  OMN_UI_FIELD_CATALOG,
  OMN_UI_FIELD_CATALOG_GROUPS,
  OMN_UI_FORMULA_CATALOG,
  OMN_UI_FORMULA_CATALOG_GROUPS,
  OMN_UI_FORMULA_SCENARIOS,
  OMN_UI_SECTION_ORDER,
  omnUiCatalogDisplayTitle,
  omnUiCatalogRowsFor,
  omnUiConditionalDisplayTitle,
  omnUiConditionalScenariosFor,
  omnUiFieldRulesForSection,
  omnUiFormulaDisplayTitle,
  omnUiMinMaxCasesFor,
  omnUiMinMaxDisplayTitle,
  type OmnUiCatalogRow,
  type OmnUiConditionalScenario,
  type OmnUiEntry,
  type OmnUiExcelPartyIdentityCase,
  type OmnUiFieldRule,
  type OmnUiMinMaxTxnContext,
  type OmnUiMinMaxVariant,
} from "./omnUiInvoiceValidation";

/** CI sets `OMN_UI_SPEC_PART=1|2|3` so one spec file runs at most this many tests. */
export const OMN_UI_SPEC_PART_MAX_TESTS = 200;
export const OMN_UI_SPEC_PART_COUNT = 3;
export type OmnUiSpecPart = 1 | 2 | 3;

/** Unset = local/full run. CI numbered suites set 1, 2, or 3. */
export function resolveOmnUiSpecPart(): OmnUiSpecPart | "all" {
  const raw = process.env.OMN_UI_SPEC_PART?.trim();
  if (!raw) return "all";
  if (raw === "1" || raw === "2" || raw === "3") return Number(raw) as OmnUiSpecPart;
  throw new Error(`OMN_UI_SPEC_PART must be 1, 2, or 3 (got ${JSON.stringify(raw)}).`);
}

export type OmnUiFieldFormulaCase =
  | { kind: "smoke"; title: string }
  | {
      kind: "partyIdentity";
      title: string;
      identityCase: OmnUiExcelPartyIdentityCase;
    }
  | {
      kind: "minMax";
      title: string;
      rule: OmnUiFieldRule;
      variant: OmnUiMinMaxVariant;
      txnContext?: OmnUiMinMaxTxnContext;
    }
  | { kind: "formula"; title: string; scenario: InvoiceFormulaScenario }
  | { kind: "fieldCatalog"; title: string; row: OmnUiCatalogRow }
  | { kind: "formulaCatalog"; title: string; row: OmnUiCatalogRow };

export type OmnUiConditionalCase =
  | { kind: "smoke"; title: string }
  | { kind: "conditional"; title: string; scenario: OmnUiConditionalScenario };

export function omnUiSpecPart<T>(
  items: readonly T[],
  part: OmnUiSpecPart | "all"
): T[] {
  if (part === "all") return [...items];
  const ceiling = OMN_UI_SPEC_PART_COUNT * OMN_UI_SPEC_PART_MAX_TESTS;
  if (items.length > ceiling) {
    throw new Error(
      `UI suite has ${items.length} tests; ${OMN_UI_SPEC_PART_COUNT} runtime splits × ${OMN_UI_SPEC_PART_MAX_TESTS} = ${ceiling}. Raise OMN_UI_SPEC_PART_COUNT.`
    );
  }
  const start = (part - 1) * OMN_UI_SPEC_PART_MAX_TESTS;
  return items.slice(start, start + OMN_UI_SPEC_PART_MAX_TESTS);
}

function persistVerb(entry: OmnUiEntry): "Save" | "Update" {
  return entry === "create" ? "Save" : "Update";
}

function catalogRowsForGroup(
  rows: readonly OmnUiCatalogRow[],
  entry: OmnUiEntry,
  group: string
): OmnUiCatalogRow[] {
  return [...omnUiCatalogRowsFor(rows, entry, group)];
}

export function omnUiFieldFormulaCases(
  entry: OmnUiEntry
): OmnUiFieldFormulaCase[] {
  const persist = persistVerb(entry);
  const cases: OmnUiFieldFormulaCase[] = [
    { kind: "smoke", title: "Opening the editor should show the invoice form." },
  ];

  for (const identityCase of OMN_UI_EXCEL_PARTY_IDENTITY_CASES) {
    const party = identityCase.section === "seller" ? "Seller" : "Buyer";
    const source =
      identityCase.invoiceType === "selfBilled"
        ? "from the self-billed worker TIN"
        : "from the worker identity";
    cases.push({
      kind: "partyIdentity",
      title: `${party} VAT Identifier and electronic address ${source} — ${persist} should succeed. (VAT Identifier)`,
      identityCase,
    });
  }

  for (const section of OMN_UI_SECTION_ORDER) {
    for (const rule of omnUiFieldRulesForSection(section)) {
      for (const minMaxCase of omnUiMinMaxCasesFor(rule)) {
        cases.push({
          kind: "minMax",
          title: omnUiMinMaxDisplayTitle(
            entry,
            minMaxCase.variant,
            rule,
            minMaxCase.txnContext
          ),
          rule,
          variant: minMaxCase.variant,
          txnContext: minMaxCase.txnContext,
        });
      }
    }
  }

  for (const scenario of OMN_UI_FORMULA_SCENARIOS) {
    cases.push({
      kind: "formula",
      title: omnUiFormulaDisplayTitle(entry, scenario.name),
      scenario,
    });
  }

  for (const group of OMN_UI_FIELD_CATALOG_GROUPS) {
    for (const row of catalogRowsForGroup(OMN_UI_FIELD_CATALOG, entry, group)) {
      cases.push({
        kind: "fieldCatalog",
        title: omnUiCatalogDisplayTitle(entry, row),
        row,
      });
    }
  }

  for (const group of OMN_UI_FORMULA_CATALOG_GROUPS) {
    for (const row of catalogRowsForGroup(OMN_UI_FORMULA_CATALOG, entry, group)) {
      cases.push({
        kind: "formulaCatalog",
        title: omnUiCatalogDisplayTitle(entry, row),
        row,
      });
    }
  }

  return cases;
}

export function omnUiConditionalCases(entry: OmnUiEntry): OmnUiConditionalCase[] {
  const cases: OmnUiConditionalCase[] = [
    { kind: "smoke", title: "Opening the editor should show the invoice form." },
  ];
  for (const section of OMN_UI_SECTION_ORDER) {
    for (const scenario of omnUiConditionalScenariosFor(entry, section)) {
      cases.push({
        kind: "conditional",
        title: omnUiConditionalDisplayTitle(entry, scenario.title),
        scenario,
      });
    }
  }
  return cases;
}
