/**
 * Create / Edit / Copy entry for Oman UI invoice tests.
 * Edit and Copy reuse an on-dashboard row (DashboardPage). They do not call or
 * modify Excel helpers / utils.
 */
import type { Page } from "@playwright/test";
import { test } from "../../Src/baseTest";
import {
  COPY_REUSE_INVOICE_STATUSES,
  EDIT_REUSE_INVOICE_STATUSES,
} from "../../pageObjects/OMN_DashboardPage";
import { OMN_UIInvoiceManualPage } from "../../pageObjects/OMN_UIInvoiceManualPage";
import { flowLog } from "../diagnosticLog";
import type { OmnUiEntry } from "../../testData/ui/omnUiInvoiceValidation";
import { invoiceData } from "../../testData/FieldValidations/SubmitInvoice";
import { runSubmitInvoiceUploadSanityCase } from "../excel/submitInvoiceCaseHelper";

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

async function findReusableInvoiceWithValidUploadFallback(
  page: Page,
  entry: Exclude<OmnUiEntry, "create">,
  statuses: readonly string[],
  pollTimeoutMs: number = COPY_REUSE_POLL_TIMEOUT_MS
) {
  const invoice = new OMN_UIInvoiceManualPage(page);
  const dashboard = invoice.dashboard;

  const reusable = await dashboard.findReusableInvoiceRow(statuses, {
    pollTimeoutMs,
  });
  if (reusable) {
    return reusable;
  }

  const baselineRow = invoiceData[0] as Record<string, string>;
  flowLog(
    entry === "copy" ? "OmnUiCopy" : "OmnUiEdit",
    `No reusable dashboard invoice for ${entry}; uploading a valid baseline invoice and retrying.`
  );

  const { invoiceNumber } = await runSubmitInvoiceUploadSanityCase(page, baselineRow);

  flowLog(
    entry === "copy" ? "OmnUiCopy" : "OmnUiEdit",
    `Uploaded valid baseline invoice ${invoiceNumber}; retrying dashboard reuse for ${entry}.`
  );

  return dashboard.findReusableInvoiceRow(statuses, {
    pollTimeoutMs,
  });
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
    const reusable = await findReusableInvoiceWithValidUploadFallback(
      page,
      "edit",
      EDIT_REUSE_INVOICE_STATUSES
    );
    if (!reusable) {
      test.skip(true, "No dashboard invoice in Error / Ready to Submit for Edit UI");
      throw new Error("Unreachable: reusable invoice missing after skip.");
    }
    flowLog("OmnUiEdit", `Reusing dashboard invoice ${reusable.invoiceNumber}.`);
    await dashboard.openInvoiceEditOnRow(reusable.row);
    await ensureDocumentEditableAfterReuse(invoice, "edit");
    return invoice;
  }

  const reusable = await findReusableInvoiceWithValidUploadFallback(
    page,
    "copy",
    COPY_REUSE_INVOICE_STATUSES,
    COPY_REUSE_POLL_TIMEOUT_MS
  );
  if (!reusable) {
    test.skip(true, "No dashboard invoice in Delivered / Ready to Submit for Copy UI");
    throw new Error("Unreachable: reusable invoice missing after skip.");
  }
  flowLog("OmnUiCopy", `Reusing dashboard invoice ${reusable.invoiceNumber}.`);
  await dashboard.openInvoiceCopyOnRow(reusable.row, "Yes");
  await ensureDocumentEditableAfterReuse(invoice, "copy");
  return invoice;
}
