import { test } from "../../Src/baseTest";
import { runOmnUiConditionalScenario } from "../../Helpers/ui/omnUiInvoiceHelper";
import { OMN_UIInvoiceManualPage } from "../../pageObjects/OMN_UIInvoiceManualPage";
import {
  OMN_UI_INVOICE_TEST_TIMEOUT_MS,
  OMN_UI_SECTION_ORDER,
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
          async ({ page }, testInfo) => {
            await runOmnUiConditionalScenario(page, ENTRY, scenario, testInfo.testId);
          }
        );
      }
    });
  }
});
