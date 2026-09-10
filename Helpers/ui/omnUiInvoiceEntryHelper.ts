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

/**
 * After Options → Edit / Create Copy, assert Document is ready for typing.
 *
 * - Edit: lands read-only (section Edit, no #invNum). Click Document Edit → Update.
 * - Copy: Document already editable with #invNum + Save (like Create).
 */
async function ensureDocumentEditableAfterReuse(
  invoice: OMN_UIInvoiceManualPage,
  entry: Exclude<OmnUiEntry, "create">
): Promise<void> {
  if (entry === "edit") {
    await invoice.dashboard.expectCreateInvoiceEditorLoaded();
    if (!(await invoice.isSectionInEditMode("document", "edit"))) {
      await invoice.openSectionForEdit("document", "edit");
    }
  }
  await invoice.expectEditorVisible();
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
    await ensureDocumentEditableAfterReuse(invoice, "edit");
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
  await ensureDocumentEditableAfterReuse(invoice, "copy");
  return invoice;
}
