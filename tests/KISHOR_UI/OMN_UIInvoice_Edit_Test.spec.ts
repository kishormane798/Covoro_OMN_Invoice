import { test } from "../../Src/baseTest";
import {
  runOmnUiExcelPartyIdentityCase,
  runOmnUiFormulaScenario,
  runOmnUiMinMaxCase,
} from "../../Helpers/ui/omnUiInvoiceHelper";
import { openOmnUiInvoiceEditor } from "../../Helpers/ui/omnUiInvoiceEntryHelper";
import {
  OMN_UI_EXCEL_PARTY_IDENTITY_CASES,
  OMN_UI_FORMULA_SCENARIOS,
  OMN_UI_INVOICE_EDIT_COPY_TIMEOUT_MS,
  OMN_UI_INVOICE_FORMULA_TIMEOUT_MS,
  OMN_UI_MIN_MAX_VARIANTS,
  OMN_UI_SECTION_ORDER,
  omnUiFieldRulesForSection,
  omnUiMinMaxExpectsError,
  omnUiMinMaxWhatEntered,
} from "../../testData/ui/omnUiInvoiceValidation";

const ENTRY = "edit" as const;

test.describe("Edit Invoice UI — field and formula", () => {
  test.describe.configure({
    mode: "parallel",
    timeout: OMN_UI_INVOICE_EDIT_COPY_TIMEOUT_MS,
  });

  test("Opening the editor should show the invoice form.", async ({ page }) => {
    const invoice = await openOmnUiInvoiceEditor(page, ENTRY);
    await invoice.expectEditorVisible();
  });

  test.describe("Edit Invoice UI — Excel party identity", () => {
    for (const identityCase of OMN_UI_EXCEL_PARTY_IDENTITY_CASES) {
      const party = identityCase.section === "seller" ? "Seller" : "Buyer";
      const source =
        identityCase.invoiceType === "selfBilled"
          ? "from self-billed Excel worker TIN"
          : "from Excel identity";
      test(
        `${party} VAT Identifier and electronic address ${source} — Update should succeed. (VAT Identifier)`,
        async ({ page }, testInfo) => {
          await runOmnUiExcelPartyIdentityCase(page, ENTRY, identityCase, testInfo.testId);
        }
      );
    }
  });

  for (const section of OMN_UI_SECTION_ORDER) {
    test.describe(`Edit Invoice UI — ${section} min/max`, () => {
      for (const rule of omnUiFieldRulesForSection(section)) {
        for (const variant of OMN_UI_MIN_MAX_VARIANTS) {
          const expectsError = omnUiMinMaxExpectsError(rule, variant);
          const outcome = expectsError
            ? "the form should show an error"
            : "Update should succeed";
          test(
            `${omnUiMinMaxWhatEntered(variant, rule)} — ${outcome}. (${rule.field})`,
            async ({ page }, testInfo) => {
              await runOmnUiMinMaxCase(page, ENTRY, rule, variant, testInfo.testId);
            }
          );
        }
      }
    });
  }

  test.describe("Edit Invoice UI — formula", () => {
    test.describe.configure({ timeout: OMN_UI_INVOICE_FORMULA_TIMEOUT_MS });
    for (const scenario of OMN_UI_FORMULA_SCENARIOS) {
      test(
        `Calculated totals should match the formula. (${scenario.name})`,
        async ({ page }, testInfo) => {
          await runOmnUiFormulaScenario(page, ENTRY, scenario, testInfo.testId);
        }
      );
    }
  });
});
