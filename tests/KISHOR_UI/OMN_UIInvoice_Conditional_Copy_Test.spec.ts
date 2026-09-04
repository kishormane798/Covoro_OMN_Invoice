import { test } from "../../Src/baseTest";
import { runOmnUiConditionalScenario } from "../../Helpers/ui/omnUiInvoiceHelper";
import { openOmnUiInvoiceEditor } from "../../Helpers/ui/omnUiInvoiceEntryHelper";
import {
  OMN_UI_INVOICE_EDIT_COPY_TIMEOUT_MS,
  OMN_UI_SECTION_ORDER,
  omnUiConditionalDisplayTitle,
  omnUiConditionalScenariosFor,
} from "../../testData/ui/omnUiInvoiceValidation";

const ENTRY = "copy" as const;

test.describe("Copy Invoice UI — conditional", () => {
  test.describe.configure({
    mode: "parallel",
    timeout: OMN_UI_INVOICE_EDIT_COPY_TIMEOUT_MS,
  });

  test("Opening the editor should show the invoice form.", async ({ page }) => {
    const invoice = await openOmnUiInvoiceEditor(page, ENTRY);
    await invoice.expectEditorVisible();
  });

  for (const section of OMN_UI_SECTION_ORDER) {
    test.describe(`Copy Invoice UI — ${section} conditional`, () => {
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
