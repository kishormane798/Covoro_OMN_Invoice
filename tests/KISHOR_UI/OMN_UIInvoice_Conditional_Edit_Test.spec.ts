import { test } from "../../Src/baseTest";
import { runOmnUiConditionalScenario } from "../../Helpers/ui/omnUiInvoiceHelper";
import { openOmnUiInvoiceEditor } from "../../Helpers/ui/omnUiInvoiceEntryHelper";
import {
  OMN_UI_CONDITIONAL_SKIP_CATALOG,
  OMN_UI_CONDITIONAL_SKIP_GROUPS,
  OMN_UI_INVOICE_EDIT_COPY_TIMEOUT_MS,
  OMN_UI_SECTION_ORDER,
  omnUiCatalogDisplayTitle,
  omnUiCatalogRowsFor,
  omnUiConditionalDisplayTitle,
  omnUiConditionalScenariosFor,
} from "../../testData/ui/omnUiInvoiceValidation";

const ENTRY = "edit" as const;

test.describe("Edit Invoice UI — conditional", () => {
  test.describe.configure({
    mode: "parallel",
    timeout: OMN_UI_INVOICE_EDIT_COPY_TIMEOUT_MS,
  });

  test("Opening the editor should show the invoice form.", async ({ page }) => {
    const invoice = await openOmnUiInvoiceEditor(page, ENTRY);
    await invoice.expectEditorVisible();
  });

  for (const section of OMN_UI_SECTION_ORDER) {
    test.describe(`Edit Invoice UI — ${section} conditional`, () => {
      for (const scenario of omnUiConditionalScenariosFor(ENTRY, section)) {
        test(
          omnUiConditionalDisplayTitle(ENTRY, scenario.title),
          async ({ page }) => {
            await runOmnUiConditionalScenario(page, ENTRY, scenario);
          }
        );
      }
    });
  }

  for (const group of OMN_UI_CONDITIONAL_SKIP_GROUPS) {
    test.describe(`Edit Invoice UI — ${group}`, () => {
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
