import { test } from "../../Src/baseTest";
import {
  runOmnUiConditionalScenario,
  runOmnUiExcelPartyIdentityCase,
  runOmnUiFormulaScenario,
  runOmnUiMinMaxCase,
} from "./omnUiInvoiceHelper";
import { openOmnUiInvoiceEditor } from "./omnUiInvoiceEntryHelper";
import { OMN_UIInvoiceManualPage } from "../../pageObjects/OMN_UIInvoiceManualPage";
import {
  headingForEntry,
  OMN_UI_EXCEL_PARTY_IDENTITY_CASES,
  OMN_UI_FORMULA_SCENARIOS,
  OMN_UI_INVOICE_EDIT_COPY_TIMEOUT_MS,
  OMN_UI_INVOICE_FORMULA_TIMEOUT_MS,
  OMN_UI_INVOICE_TEST_TIMEOUT_MS,
  OMN_UI_MIN_MAX_VARIANTS,
  OMN_UI_SECTION_ORDER,
  omnUiConditionalScenariosFor,
  omnUiExcelPartyIdentityTitle,
  omnUiFieldRulesForSection,
  omnUiFormulaTestTitle,
  omnUiMinMaxCondition,
  omnUiMinMaxExpectsError,
  omnUiTestTitle,
  type OmnUiEntry,
} from "../../testData/ui/omnUiInvoiceValidation";

function timeoutFor(entry: OmnUiEntry): number {
  return entry === "create" ? OMN_UI_INVOICE_TEST_TIMEOUT_MS : OMN_UI_INVOICE_EDIT_COPY_TIMEOUT_MS;
}

function bindNavigationSmoke(heading: string, entry: OmnUiEntry): void {
  test(`${heading} | Navigation | opening the editor → form visible`, async ({ page }) => {
    if (entry === "create") {
      const invoice = new OMN_UIInvoiceManualPage(page);
      await invoice.openCreate();
      await invoice.expectEditorVisible();
      return;
    }
    const invoice = await openOmnUiInvoiceEditor(page, entry);
    await invoice.expectEditorVisible();
  });
}

/** Field min/max (no dropdowns) + formula. Conditional lives in a separate spec. */
export function bindOmnUiInvoiceSuite(entry: OmnUiEntry): void {
  const heading = headingForEntry(entry);
  const timeout = timeoutFor(entry);

  test.describe(`${heading} — field and formula`, () => {
    test.describe.configure({
      mode: "parallel",
      timeout,
    });

    bindNavigationSmoke(heading, entry);

    test.describe(`${heading} — Excel party identity`, () => {
      for (const identityCase of OMN_UI_EXCEL_PARTY_IDENTITY_CASES) {
        test(omnUiExcelPartyIdentityTitle(heading, identityCase), async ({ page }, testInfo) => {
          await runOmnUiExcelPartyIdentityCase(page, entry, identityCase, testInfo.testId);
        });
      }
    });

    for (const section of OMN_UI_SECTION_ORDER) {
      test.describe(`${heading} — ${section} min/max`, () => {
        for (const rule of omnUiFieldRulesForSection(section)) {
          for (const variant of OMN_UI_MIN_MAX_VARIANTS) {
            const expectsError = omnUiMinMaxExpectsError(rule, variant);
            test(
              omnUiTestTitle(
                heading,
                section,
                `${rule.field} | ${omnUiMinMaxCondition(variant, rule)}`,
                expectsError
              ),
              async ({ page }, testInfo) => {
                await runOmnUiMinMaxCase(page, entry, rule, variant, testInfo.testId);
              }
            );
          }
        }
      });
    }

    test.describe(`${heading} — formula`, () => {
      test.describe.configure({ timeout: OMN_UI_INVOICE_FORMULA_TIMEOUT_MS });
      for (const scenario of OMN_UI_FORMULA_SCENARIOS) {
        test(omnUiFormulaTestTitle(heading, scenario.name), async ({ page }, testInfo) => {
          await runOmnUiFormulaScenario(page, entry, scenario, testInfo.testId);
        });
      }
    });
  });
}

/** All conditionals (including dropdown-style rows). Each Excel row is its own test. */
export function bindOmnUiConditionalSuite(entry: OmnUiEntry): void {
  const heading = headingForEntry(entry);
  const timeout = timeoutFor(entry);

  test.describe(`${heading} — conditional`, () => {
    test.describe.configure({
      mode: "parallel",
      timeout,
    });

    bindNavigationSmoke(heading, entry);

    for (const section of OMN_UI_SECTION_ORDER) {
      test.describe(`${heading} — ${section} conditional`, () => {
        for (const scenario of omnUiConditionalScenariosFor(entry, section)) {
          test(`${heading} | ${scenario.title}`, async ({ page }, testInfo) => {
            await runOmnUiConditionalScenario(page, entry, scenario, testInfo.testId);
          });
        }
      });
    }
  });
}
