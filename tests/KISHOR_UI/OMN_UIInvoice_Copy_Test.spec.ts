import { test } from "../../Src/baseTest";
import {
  runOmnUiExcelPartyIdentityCase,
  runOmnUiFieldCatalogRow,
  runOmnUiFormulaCatalogRow,
  runOmnUiFormulaScenario,
  runOmnUiMinMaxCase,
} from "../../Helpers/ui/omnUiInvoiceHelper";
import { openOmnUiInvoiceEditor } from "../../Helpers/ui/omnUiInvoiceEntryHelper";
import {
  OMN_UI_EXCEL_PARTY_IDENTITY_CASES,
  OMN_UI_FIELD_CATALOG,
  OMN_UI_FIELD_CATALOG_GROUPS,
  OMN_UI_FORMULA_CATALOG,
  OMN_UI_FORMULA_CATALOG_GROUPS,
  OMN_UI_FORMULA_SCENARIOS,
  OMN_UI_INVOICE_EDIT_COPY_TIMEOUT_MS,
  OMN_UI_INVOICE_FORMULA_TIMEOUT_MS,
  OMN_UI_MIN_MAX_VARIANTS,
  OMN_UI_SECTION_ORDER,
  omnUiCatalogDisplayTitle,
  omnUiCatalogRowsFor,
  omnUiFieldRulesForSection,
  omnUiFormulaDisplayTitle,
  omnUiMinMaxDisplayTitle,
} from "../../testData/ui/omnUiInvoiceValidation";

const ENTRY = "copy" as const;

test.describe("Copy Invoice UI — field and formula", () => {
  test.describe.configure({
    mode: "parallel",
    timeout: OMN_UI_INVOICE_EDIT_COPY_TIMEOUT_MS,
  });

  test("Opening the editor should show the invoice form.", async ({ page }) => {
    const invoice = await openOmnUiInvoiceEditor(page, ENTRY);
    await invoice.expectEditorVisible();
  });

  test.describe("Copy Invoice UI — Excel party identity", () => {
    for (const identityCase of OMN_UI_EXCEL_PARTY_IDENTITY_CASES) {
      const party = identityCase.section === "seller" ? "Seller" : "Buyer";
      const source =
        identityCase.invoiceType === "selfBilled"
          ? "from self-billed Excel worker TIN"
          : "from Excel identity";
      test(
        `${party} VAT Identifier and electronic address ${source} — Update should succeed. (VAT Identifier)`,
        async ({ page }) => {
          await runOmnUiExcelPartyIdentityCase(page, ENTRY, identityCase);
        }
      );
    }
  });

  for (const section of OMN_UI_SECTION_ORDER) {
    test.describe(`Copy Invoice UI — ${section} min/max`, () => {
      for (const rule of omnUiFieldRulesForSection(section)) {
        for (const variant of OMN_UI_MIN_MAX_VARIANTS) {
          test(
            omnUiMinMaxDisplayTitle(ENTRY, variant, rule),
            async ({ page }) => {
              await runOmnUiMinMaxCase(page, ENTRY, rule, variant);
            }
          );
        }
      }
    });
  }

  test.describe("Copy Invoice UI — formula", () => {
    test.describe.configure({ timeout: OMN_UI_INVOICE_FORMULA_TIMEOUT_MS });
    for (const scenario of OMN_UI_FORMULA_SCENARIOS) {
      test(
        omnUiFormulaDisplayTitle(ENTRY, scenario.name),
        async ({ page }) => {
          await runOmnUiFormulaScenario(page, ENTRY, scenario);
        }
      );
    }
  });

  for (const group of OMN_UI_FIELD_CATALOG_GROUPS) {
    test.describe(`Copy Invoice UI — ${group}`, () => {
      for (const row of omnUiCatalogRowsFor(OMN_UI_FIELD_CATALOG, ENTRY, group)) {
        test(omnUiCatalogDisplayTitle(ENTRY, row), async ({ page }) => {
          if (row.mode === "skip") {
            test.skip(true, row.skipReason ?? "missing skip reason");
          }
          await runOmnUiFieldCatalogRow(page, ENTRY, row);
        });
      }
    });
  }

  for (const group of OMN_UI_FORMULA_CATALOG_GROUPS) {
    test.describe(`Copy Invoice UI — ${group}`, () => {
      for (const row of omnUiCatalogRowsFor(OMN_UI_FORMULA_CATALOG, ENTRY, group)) {
        test(omnUiCatalogDisplayTitle(ENTRY, row), async ({ page }) => {
          if (row.mode === "skip") {
            test.skip(true, row.skipReason ?? "missing skip reason");
          }
          await runOmnUiFormulaCatalogRow(page, ENTRY, row);
        });
      }
    });
  }
});
