import { test } from "../../Src/baseTest";
import { runOmnUiConditionalScenario } from "../../Helpers/ui/omnUiInvoiceHelper";
import { OMN_UIInvoiceManualPage } from "../../pageObjects/OMN_UIInvoiceManualPage";
import {
  OMN_UI_CONDITIONAL_SKIP_CATALOG,
  OMN_UI_CONDITIONAL_SKIP_GROUPS,
  OMN_UI_INVOICE_TEST_TIMEOUT_MS,
  OMN_UI_SECTION_ORDER,
  omnUiCatalogDisplayTitle,
  omnUiCatalogRowsFor,
  omnUiConditionalDisplayTitle,
  omnUiConditionalScenariosFor,
} from "../../testData/ui/omnUiInvoiceValidation";

const ENTRY = "create" as const;

test.describe("Create Invoice UI — conditional", () => {
  test.describe.configure({
    mode: "parallel",
    timeout: OMN_UI_INVOICE_TEST_TIMEOUT_MS,
  });

  test("Opening the editor should show the invoice form.", async ({ page }) => {
    const invoice = new OMN_UIInvoiceManualPage(page);
    await invoice.openCreate();
    await invoice.expectEditorVisible();
  });

  for (const section of OMN_UI_SECTION_ORDER) {
    test.describe(`Create Invoice UI — ${section} conditional`, () => {
      for (const scenario of omnUiConditionalScenariosFor(ENTRY, section)) {
        test(
          omnUiConditionalDisplayTitle(ENTRY, scenario.title),
          async ({ page }) => {
            if (scenario.skipReason) {
              test.skip(true, scenario.skipReason);
            }
            await runOmnUiConditionalScenario(page, ENTRY, scenario);
          }
        );
      }
    });
  }

  for (const group of OMN_UI_CONDITIONAL_SKIP_GROUPS) {
    test.describe(`Create Invoice UI — ${group}`, () => {
      for (const row of omnUiCatalogRowsFor(
        OMN_UI_CONDITIONAL_SKIP_CATALOG,
        ENTRY,
        group
      )) {
        test(omnUiCatalogDisplayTitle(ENTRY, row), async () => {
          if (row.mode === "skip") {
            test.skip(true, row.skipReason ?? "missing skip reason");
          }
        });
      }
    });
  }
});
