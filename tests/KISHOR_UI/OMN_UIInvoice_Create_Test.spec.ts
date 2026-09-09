import { test } from "../../Src/baseTest";
import {
  runOmnUiExcelPartyIdentityCase,
  runOmnUiFieldCatalogRow,
  runOmnUiFormulaCatalogRow,
  runOmnUiFormulaScenario,
  runOmnUiMinMaxCase,
} from "../../Helpers/ui/omnUiInvoiceHelper";
import { OMN_UIInvoiceManualPage } from "../../pageObjects/OMN_UIInvoiceManualPage";
import {
  OMN_UI_EXCEL_PARTY_IDENTITY_CASES,
  OMN_UI_FIELD_CATALOG,
  OMN_UI_FIELD_CATALOG_GROUPS,
  OMN_UI_FORMULA_CATALOG,
  OMN_UI_FORMULA_CATALOG_GROUPS,
  OMN_UI_FORMULA_SCENARIOS,
  OMN_UI_INVOICE_FORMULA_TIMEOUT_MS,
  OMN_UI_INVOICE_TEST_TIMEOUT_MS,
  OMN_UI_SECTION_ORDER,
  omnUiCatalogDisplayTitle,
  omnUiCatalogRowsFor,
  omnUiFieldRulesForSection,
  omnUiFormulaDisplayTitle,
  omnUiMinMaxCasesFor,
  omnUiMinMaxDisplayTitle,
} from "../../testData/ui/omnUiInvoiceValidation";

const ENTRY = "create" as const;

test.describe("Create Invoice UI — field and formula", () => {
  test.describe.configure({
    mode: "parallel",
    timeout: OMN_UI_INVOICE_TEST_TIMEOUT_MS,
  });

  test("Opening the editor should show the invoice form.", async ({ page }) => {
    const invoice = new OMN_UIInvoiceManualPage(page);
    await invoice.openCreate();
    await invoice.expectEditorVisible();
  });

  test.describe("Create Invoice UI — party identity", () => {
    for (const identityCase of OMN_UI_EXCEL_PARTY_IDENTITY_CASES) {
      const party = identityCase.section === "seller" ? "Seller" : "Buyer";
      const source =
        identityCase.invoiceType === "selfBilled"
          ? "from the self-billed worker TIN"
          : "from the worker identity";
      test(
        `${party} VAT Identifier and electronic address ${source} — Save should succeed. (VAT Identifier)`,
        async ({ page }) => {
          await runOmnUiExcelPartyIdentityCase(page, ENTRY, identityCase);
        }
      );
    }
  });

  for (const section of OMN_UI_SECTION_ORDER) {
    test.describe(`Create Invoice UI — ${section} min/max`, () => {
      for (const rule of omnUiFieldRulesForSection(section)) {
        for (const minMaxCase of omnUiMinMaxCasesFor(rule)) {
          test(
            omnUiMinMaxDisplayTitle(
              ENTRY,
              minMaxCase.variant,
              rule,
              minMaxCase.txnContext
            ),
            async ({ page }) => {
              await runOmnUiMinMaxCase(
                page,
                ENTRY,
                rule,
                minMaxCase.variant,
                minMaxCase.txnContext
              );
            }
          );
        }
      }
    });
  }

  test.describe("Create Invoice UI — formula", () => {
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
    const rows = omnUiCatalogRowsFor(OMN_UI_FIELD_CATALOG, ENTRY, group).filter(
      (row) => row.mode !== "skip"
    );
    if (rows.length === 0) continue;
    test.describe(`Create Invoice UI — ${group}`, () => {
      for (const row of rows) {
        test(omnUiCatalogDisplayTitle(ENTRY, row), async ({ page }) => {
          await runOmnUiFieldCatalogRow(page, ENTRY, row);
        });
      }
    });
  }

  for (const group of OMN_UI_FORMULA_CATALOG_GROUPS) {
    const rows = omnUiCatalogRowsFor(OMN_UI_FORMULA_CATALOG, ENTRY, group).filter(
      (row) => row.mode !== "skip"
    );
    if (rows.length === 0) continue;
    test.describe(`Create Invoice UI — ${group}`, () => {
      for (const row of rows) {
        test(omnUiCatalogDisplayTitle(ENTRY, row), async ({ page }) => {
          await runOmnUiFormulaCatalogRow(page, ENTRY, row);
        });
      }
    });
  }
});
