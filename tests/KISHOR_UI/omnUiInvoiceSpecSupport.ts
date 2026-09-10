import type { Page } from "@playwright/test";
import { test } from "../../Src/baseTest";
import {
  runOmnUiConditionalScenario,
  runOmnUiExcelPartyIdentityCase,
  runOmnUiFieldCatalogRow,
  runOmnUiFormulaCatalogRow,
  runOmnUiFormulaScenario,
  runOmnUiMinMaxCase,
} from "../../Helpers/ui/omnUiInvoiceHelper";
import { openOmnUiInvoiceEditor } from "../../Helpers/ui/omnUiInvoiceEntryHelper";
import { OMN_UIInvoiceManualPage } from "../../pageObjects/OMN_UIInvoiceManualPage";
import {
  OMN_UI_INVOICE_EDIT_COPY_TIMEOUT_MS,
  OMN_UI_INVOICE_FORMULA_TIMEOUT_MS,
  OMN_UI_INVOICE_TEST_TIMEOUT_MS,
  type OmnUiEntry,
} from "../../testData/ui/omnUiInvoiceValidation";
import {
  OMN_UI_SPEC_PART_COUNT,
  omnUiConditionalCases,
  omnUiFieldFormulaCases,
  omnUiSpecPart,
  resolveOmnUiSpecPart,
  type OmnUiConditionalCase,
  type OmnUiFieldFormulaCase,
} from "../../testData/ui/omnUiInvoiceSpecParts";

function entryLabel(entry: OmnUiEntry): "Create" | "Edit" | "Copy" {
  if (entry === "create") return "Create";
  if (entry === "edit") return "Edit";
  return "Copy";
}

function suiteTimeoutMs(entry: OmnUiEntry): number {
  return entry === "create"
    ? OMN_UI_INVOICE_TEST_TIMEOUT_MS
    : OMN_UI_INVOICE_EDIT_COPY_TIMEOUT_MS;
}

async function openEditor(page: Page, entry: OmnUiEntry): Promise<OMN_UIInvoiceManualPage> {
  if (entry === "create") {
    const invoice = new OMN_UIInvoiceManualPage(page);
    await invoice.openCreate();
    return invoice;
  }
  return openOmnUiInvoiceEditor(page, entry);
}

async function runFieldFormulaCase(
  page: Page,
  entry: OmnUiEntry,
  item: OmnUiFieldFormulaCase
): Promise<void> {
  switch (item.kind) {
    case "smoke": {
      const invoice = await openEditor(page, entry);
      await invoice.expectEditorVisible();
      return;
    }
    case "partyIdentity":
      await runOmnUiExcelPartyIdentityCase(page, entry, item.identityCase);
      return;
    case "minMax":
      await runOmnUiMinMaxCase(
        page,
        entry,
        item.rule,
        item.variant,
        item.txnContext
      );
      return;
    case "formula":
      test.setTimeout(OMN_UI_INVOICE_FORMULA_TIMEOUT_MS);
      await runOmnUiFormulaScenario(page, entry, item.scenario);
      return;
    case "fieldCatalog":
      if (item.row.mode === "skip") {
        test.skip(true, item.row.skipReason ?? "missing skip reason");
      }
      await runOmnUiFieldCatalogRow(page, entry, item.row);
      return;
    case "formulaCatalog":
      test.setTimeout(OMN_UI_INVOICE_FORMULA_TIMEOUT_MS);
      if (item.row.mode === "skip") {
        test.skip(true, item.row.skipReason ?? "missing skip reason");
      }
      await runOmnUiFormulaCatalogRow(page, entry, item.row);
      return;
  }
}

async function runConditionalCase(
  page: Page,
  entry: OmnUiEntry,
  item: OmnUiConditionalCase
): Promise<void> {
  if (item.kind === "smoke") {
    const invoice = await openEditor(page, entry);
    await invoice.expectEditorVisible();
    return;
  }
  if (item.scenario.skipReason) {
    test.skip(true, item.scenario.skipReason);
  }
  await runOmnUiConditionalScenario(page, entry, item.scenario);
}

function describeSuffix(part: ReturnType<typeof resolveOmnUiSpecPart>): string {
  return part === "all" ? "" : ` (${part}/${OMN_UI_SPEC_PART_COUNT})`;
}

export function registerOmnUiFieldFormulaSpec(entry: OmnUiEntry): void {
  const label = entryLabel(entry);
  const part = resolveOmnUiSpecPart();
  const cases = omnUiSpecPart(omnUiFieldFormulaCases(entry), part);
  test.describe(
    `${label} Invoice UI — field and formula${describeSuffix(part)}`,
    () => {
      test.describe.configure({
        mode: "parallel",
        timeout: suiteTimeoutMs(entry),
      });
      if (cases.length === 0) {
        test.skip(
          `No field/formula cases in runtime split ${part}/${OMN_UI_SPEC_PART_COUNT}.`,
          () => {}
        );
        return;
      }
      for (const item of cases) {
        test(item.title, async ({ page }) => {
          await runFieldFormulaCase(page, entry, item);
        });
      }
    }
  );
}

export function registerOmnUiConditionalSpec(entry: OmnUiEntry): void {
  const label = entryLabel(entry);
  const part = resolveOmnUiSpecPart();
  const cases = omnUiSpecPart(omnUiConditionalCases(entry), part);
  test.describe(
    `${label} Invoice UI — conditional${describeSuffix(part)}`,
    () => {
      test.describe.configure({
        mode: "parallel",
        timeout: suiteTimeoutMs(entry),
      });
      if (cases.length === 0) {
        test.skip(
          `No conditional cases in runtime split ${part}/${OMN_UI_SPEC_PART_COUNT}.`,
          () => {}
        );
        return;
      }
      for (const item of cases) {
        test(item.title, async ({ page }) => {
          await runConditionalCase(page, entry, item);
        });
      }
    }
  );
}
