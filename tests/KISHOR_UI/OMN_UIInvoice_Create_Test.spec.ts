import { test } from "../../Src/baseTest";
import {
  runOmnUiExcelPartyIdentityCase,
  runOmnUiFormulaScenario,
  runOmnUiMinMaxCase,
} from "../../Helpers/ui/omnUiInvoiceHelper";
import { OMN_UIInvoiceManualPage } from "../../pageObjects/OMN_UIInvoiceManualPage";
import {
  OMN_UI_EXCEL_PARTY_IDENTITY_CASES,
  OMN_UI_FORMULA_SCENARIOS,
  OMN_UI_INVOICE_FORMULA_TIMEOUT_MS,
  OMN_UI_INVOICE_TEST_TIMEOUT_MS,
  OMN_UI_MIN_MAX_VARIANTS,
  OMN_UI_SECTION_ORDER,
  omnUiFieldRulesForSection,
  omnUiFormulaDisplayTitle,
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

  test.describe("Create Invoice UI — Excel party identity", () => {
    for (const identityCase of OMN_UI_EXCEL_PARTY_IDENTITY_CASES) {
      const party = identityCase.section === "seller" ? "Seller" : "Buyer";
      const source =
        identityCase.invoiceType === "selfBilled"
          ? "from self-billed Excel worker TIN"
          : "from Excel identity";
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
});
