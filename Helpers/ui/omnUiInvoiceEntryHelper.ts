/**
 * Create / Edit / Copy entry for Oman UI invoice tests.
 * Edit and Copy reuse an on-dashboard row (DashboardPage). They do not call or
 * modify Excel helpers / utils.
 */
import { test, type Page } from "../../Src/baseTest";
import {
  COPY_REUSE_INVOICE_STATUSES,
  EDIT_REUSE_INVOICE_STATUSES,
} from "../../pageObjects/OMN_DashboardPage";
import { OMN_UIInvoiceManualPage } from "../../pageObjects/OMN_UIInvoiceManualPage";
import { flowLog } from "../diagnosticLog";
import type { OmnUiEntry } from "../../testData/ui/omnUiInvoiceValidation";

const COPY_REUSE_POLL_TIMEOUT_MS = 20_000;

export function isOmnUiPrefilledLineItemEntry(entry: OmnUiEntry): boolean {
  return entry === "edit" || entry === "copy";
}

export async function openOmnUiInvoiceEditor(
  page: Page,
  entry: OmnUiEntry
): Promise<OMN_UIInvoiceManualPage> {
  const invoice = new OMN_UIInvoiceManualPage(page);
  const dashboard = invoice.dashboard;

  if (entry === "create") {
    await invoice.openCreate();
    return invoice;
  }

  if (entry === "edit") {
    const reusable = await dashboard.findReusableInvoiceRow(EDIT_REUSE_INVOICE_STATUSES);
    if (!reusable) {
      test.skip(true, "No dashboard invoice in Error / Ready to Submit for Edit UI");
    }
    flowLog("OmnUiEdit", `Reusing dashboard invoice ${reusable.invoiceNumber}.`);
    await dashboard.openInvoiceEditOnRow(reusable.row);
    await invoice.expectEditorVisible();
    return invoice;
  }

  const reusable = await dashboard.findReusableInvoiceRow(COPY_REUSE_INVOICE_STATUSES, {
    pollTimeoutMs: COPY_REUSE_POLL_TIMEOUT_MS,
  });
  if (!reusable) {
    test.skip(true, "No dashboard invoice in Delivered / Ready to Submit for Copy UI");
  }
  flowLog("OmnUiCopy", `Reusing dashboard invoice ${reusable.invoiceNumber}.`);
  await dashboard.openInvoiceCopyOnRow(reusable.row, "Yes");
  await invoice.expectEditorVisible();
  return invoice;
}
