/**
 * Edit Invoice UI — Attachment Details scenarios (Oman).
 * Entry: Submit-invoice Excel upload → dashboard status → Options → Edit → Attachment Details.
 */
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { DashboardPage } from "../../pageObjects/OMN_DashboardPage";
import { OMN_UIInvoiceManualPage } from "../../pageObjects/OMN_UIInvoiceManualPage";
import {
  buildAtLimitSingleAttachmentPath,
  buildCombinedOversizeAttachmentPaths,
  buildNearLimitMultiAttachmentPaths,
  buildNearLimitSingleAttachmentPath,
  buildOversizeAttachmentPath,
  buildSequentialAtLimitAttachmentPaths,
  buildSequentialOverLimitAttachmentPaths,
} from "../../utils/ui/omnUiAttachmentFiles";
import type {
  OmnUiAttachmentAcceptScenario,
  OmnUiAttachmentScenario,
} from "../../testData/ui/omnUiInvoiceAttachmentScenarios";
import {
  OMN_UI_ATTACHMENT_INVALID_FORMAT,
  OMN_UI_ATTACHMENT_MULTI_UNDER_LIMIT,
  OMN_UI_ATTACHMENT_POSITIVE_FORMAT_SCENARIOS,
  OMN_UI_ATTACHMENT_SIZE_ERROR,
} from "../../testData/ui/omnUiInvoiceAttachmentScenarios";
import { invoiceData } from "../../testData/FieldValidations/SubmitInvoice";
import { runSubmitInvoiceUploadSanityCase } from "../excel/submitInvoiceCaseHelper";
import { flowLog, terminalLog } from "../diagnosticLog";

type AttachmentToastNote = { label: string; toast: string | null };

/** When a toast was captured, it must match. No toast does not fail the case. */
function expectAttachmentToastWhenPresent(toast: string | null, errorPattern: RegExp): void {
  if (!toast) return;
  expect(toast, `Attachment toast did not match ${errorPattern}`).toMatch(errorPattern);
}

function attachmentKindLabel(fileName: string): string {
  const base = fileName.split(/[/\\]/).pop() ?? fileName;
  const dot = base.lastIndexOf(".");
  return (dot >= 0 ? base.slice(dot + 1) : base).toLowerCase();
}

/** One picker action, including several files together: one toast. */
function printBulkAttachmentToast(toast: string | null): void {
  if (!toast) return;
  terminalLog(`[OmnUiAttachment] Toast message: ${toast}`);
}

/** Files chosen one after another: `pdf - message, xml - message`. */
function printSequentialAttachmentToasts(notes: AttachmentToastNote[]): void {
  const line = notes
    .filter((note): note is { label: string; toast: string } => Boolean(note.toast))
    .map((note) => `${note.label} - ${note.toast}`)
    .join(", ");
  if (!line) return;
  terminalLog(`[OmnUiAttachment] ${line}`);
}

async function chooseAttachmentFiles(
  invoice: OMN_UIInvoiceManualPage,
  files: string[],
  names: string[]
): Promise<string | null> {
  const toast = await invoice.selectAttachmentFiles(...files);
  if (files.length > 1) {
    printBulkAttachmentToast(toast);
    return toast;
  }
  const label = attachmentKindLabel(names[0] ?? files[0] ?? "file");
  printSequentialAttachmentToasts([{ label, toast }]);
  return toast;
}

/** Per-test budget: upload baseline + edit + attachment assert. */
export const OMN_UI_ATTACHMENT_TEST_TIMEOUT_MS = 3 * 60 * 1000;

/** Persist Update + View (Ready to Submit poll + View). */
export const OMN_UI_ATTACHMENT_PERSIST_TIMEOUT_MS = 4 * 60 * 1000;

/** Large near-limit uploads (setInputFiles + UI). */
export const OMN_UI_ATTACHMENT_SIZE_TIMEOUT_MS = 4 * 60 * 1000;

/** Create/edit attach + dashboard submit + delivery poll. */
export const OMN_UI_ATTACHMENT_SUBMIT_TIMEOUT_MS = 12 * 60 * 1000;

export const OMN_UI_ATTACHMENT_DELIVERY_TIMEOUT_MS = (() => {
  const raw = process.env.SUBMIT_INVOICE_DELIVERY_TIMEOUT_MS?.trim();
  if (raw) {
    const n = Number.parseInt(raw, 10);
    if (Number.isFinite(n) && n >= 60_000) return n;
  }
  return 8 * 60 * 1000;
})();

export const OMN_UI_ATTACHMENT_LARGE_SUBMIT_TIMEOUT_MS =
  OMN_UI_ATTACHMENT_DELIVERY_TIMEOUT_MS + 6 * 60 * 1000;

function formatLabel(scenario: OmnUiAttachmentScenario): string {
  if (scenario.expect === "accept" && scenario.expectedNames.length > 1) {
    return "multiple files (PDF + PNG + PDF)";
  }
  if (scenario.id.startsWith("remove-yes-") || scenario.id.startsWith("remove-no-")) {
    const ext = scenario.id.replace(/^remove-(yes|no)-/, "").toUpperCase();
    return `a single ${ext} file`;
  }
  if (scenario.expect === "accept") {
    return `a single ${scenario.id.toUpperCase()} file`;
  }
  if (
    scenario.id === "invalid-format" ||
    scenario.id.startsWith("invalid-") ||
    /invalid/i.test(scenario.title)
  ) {
    return "an invalid format file";
  }
  return scenario.title.replace(/\s*→\s*(listed|error)\s*$/i, "").trim();
}

export function omnUiAttachmentSectionVisibleTitle(): string {
  return "Verify Edit Invoice attachment section is visible after Excel upload and Edit with the Add Files zone shown.";
}

export function omnUiAttachmentListTitle(scenario: OmnUiAttachmentScenario): string {
  if (scenario.expect === "accept") {
    const listed =
      scenario.expectedNames.length > 1
        ? "the attachments should be listed"
        : "the attachment should be listed";
    return `Verify Edit Invoice attachment with ${formatLabel(scenario)} is accepted and ${listed}.`;
  }
  return `Verify Edit Invoice attachment with ${formatLabel(scenario)} is rejected and an error should be shown.`;
}

export function omnUiAttachmentRemoveTitle(
  scenario: OmnUiAttachmentAcceptScenario,
  confirm: "Yes" | "No"
): string {
  if (confirm === "Yes") {
    return `Verify Edit Invoice attachment with ${formatLabel(scenario)} can be removed when confirm is Yes and the attachment should be removed.`;
  }
  return `Verify Edit Invoice attachment with ${formatLabel(scenario)} remains listed when remove is cancelled with No.`;
}

export function omnUiAttachmentPersistTitle(
  scenarioOrDetail: OmnUiAttachmentAcceptScenario | string
): string {
  const detail =
    typeof scenarioOrDetail === "string"
      ? scenarioOrDetail
      : formatLabel(scenarioOrDetail);
  return `Verify Edit Invoice attachment with ${detail} using Update reaches Ready to Submit and View shows the attachment.`;
}

export function omnUiAttachmentSubmitTitle(
  scenarioOrDetail: OmnUiAttachmentAcceptScenario | string
): string {
  const detail =
    typeof scenarioOrDetail === "string"
      ? scenarioOrDetail
      : formatLabel(scenarioOrDetail);
  return `Verify Edit Invoice attachment with ${detail} using Submit functionality and the invoice should be delivered.`;
}

async function uploadBaselineInvoiceAndOpenEdit(page: Page): Promise<{
  invoice: OMN_UIInvoiceManualPage;
  invoiceNumber: string;
}> {
  const row = invoiceData[0] as Record<string, string>;
  const { invoiceNumber } = await runSubmitInvoiceUploadSanityCase(page, row);
  const invoice = new OMN_UIInvoiceManualPage(page);
  await invoice.openFromUploadedInvoice(invoiceNumber);
  return { invoice, invoiceNumber };
}

export async function runOmnUiEditAttachmentScenario(
  page: Page,
  scenario: OmnUiAttachmentScenario
): Promise<{ invoiceNumber: string }> {
  flowLog("OmnUiAttachment", `Scenario ${scenario.id}: ${scenario.title}`);
  const { invoice, invoiceNumber } = await uploadBaselineInvoiceAndOpenEdit(page);
  await invoice.expectUploadedEditPageVisible();
  await invoice.scrollToAttachmentSection();

  if (scenario.expect === "accept") {
    await chooseAttachmentFiles(invoice, scenario.files, scenario.expectedNames);
    await invoice.expectAttachedFilesListed(scenario.expectedNames);
    await invoice.expectAttachmentUploadControlVisible();
  } else {
    const toast = await chooseAttachmentFiles(invoice, scenario.files, scenario.files);
    expectAttachmentToastWhenPresent(toast, scenario.errorPattern);
    await invoice.expectAttachmentUploadZoneVisible();
  }

  return { invoiceNumber };
}

export async function runOmnUiEditAttachmentRemoveCase(
  page: Page,
  scenario: OmnUiAttachmentAcceptScenario,
  confirm: "Yes" | "No"
): Promise<{ invoiceNumber: string }> {
  flowLog("OmnUiAttachment", `Remove ${confirm}: ${scenario.id}`);
  if (scenario.expectedNames.length !== 1) {
    throw new Error(
      `runOmnUiEditAttachmentRemoveCase expects exactly one file name, got ${scenario.expectedNames.length}`
    );
  }
  const fileName = scenario.expectedNames[0]!;
  const { invoice, invoiceNumber } = await uploadBaselineInvoiceAndOpenEdit(page);
  await invoice.expectUploadedEditPageVisible();
  await chooseAttachmentFiles(invoice, scenario.files, scenario.expectedNames);
  await invoice.expectAttachedFilesListed(scenario.expectedNames);
  await invoice.expectAttachmentUploadControlVisible();
  await invoice.removeAttachedFile(fileName, { confirm });

  if (confirm === "Yes") {
    await expect(invoice.attachmentFileRows()).toHaveCount(0);
    await invoice.expectAttachmentUploadZoneVisible();
  } else {
    await invoice.expectAttachedFilesListed(scenario.expectedNames);
    await invoice.expectAttachmentUploadControlVisible();
  }

  return { invoiceNumber };
}

export async function runOmnUiEditAttachmentOversizeCase(page: Page): Promise<void> {
  const filePath = buildOversizeAttachmentPath();
  await runOmnUiEditAttachmentScenario(page, {
    id: "single-over-10mb",
    title: "single file over 10 MB → error",
    expect: "reject",
    files: [filePath],
    errorPattern: OMN_UI_ATTACHMENT_SIZE_ERROR,
  });
}

export async function runOmnUiEditAttachmentCombinedOversizeCase(page: Page): Promise<void> {
  const [a, b] = buildCombinedOversizeAttachmentPaths();
  await runOmnUiEditAttachmentScenario(page, {
    id: "combined-over-10mb",
    title: "combined size over 10 MB → error",
    expect: "reject",
    files: [a, b],
    errorPattern: OMN_UI_ATTACHMENT_SIZE_ERROR,
  });
}

export async function runOmnUiEditAttachmentNearLimitSingleCase(
  page: Page
): Promise<OmnUiAttachmentAcceptScenario> {
  const { path: filePath, name } = buildNearLimitSingleAttachmentPath();
  const scenario: OmnUiAttachmentAcceptScenario = {
    id: "single-near-10mb",
    title: "single file ~9.5 MB (under 10 MB) → listed",
    expect: "accept",
    files: [filePath],
    expectedNames: [name],
  };
  await runOmnUiEditAttachmentScenario(page, scenario);
  return scenario;
}

export async function runOmnUiEditAttachmentAtLimitSingleCase(
  page: Page
): Promise<OmnUiAttachmentAcceptScenario> {
  const { path: filePath, name } = buildAtLimitSingleAttachmentPath();
  const scenario: OmnUiAttachmentAcceptScenario = {
    id: "single-at-10mb",
    title: "single file exactly 10 MB → listed",
    expect: "accept",
    files: [filePath],
    expectedNames: [name],
  };
  await runOmnUiEditAttachmentScenario(page, scenario);
  return scenario;
}

export async function runOmnUiEditAttachmentNearLimitMultiCase(
  page: Page
): Promise<OmnUiAttachmentAcceptScenario> {
  const parts = buildNearLimitMultiAttachmentPaths();
  const scenario: OmnUiAttachmentAcceptScenario = {
    id: "multi-near-10mb",
    title: "multiple files combined ~9 MB (under 10 MB) → listed",
    expect: "accept",
    files: parts.map((p) => p.path),
    expectedNames: parts.map((p) => p.name),
  };
  await runOmnUiEditAttachmentScenario(page, scenario);
  return scenario;
}

export async function runOmnUiEditAttachmentNearLimitSinglePersistCase(
  page: Page
): Promise<void> {
  const { path: filePath, name } = buildNearLimitSingleAttachmentPath();
  await runOmnUiEditAttachmentPersistAndViewCase(page, {
    id: "single-near-10mb-persist",
    title: "single ~9.5 MB → Update → View shows file",
    expect: "accept",
    files: [filePath],
    expectedNames: [name],
  });
}

export async function runOmnUiEditAttachmentNearLimitMultiPersistCase(
  page: Page
): Promise<void> {
  const parts = buildNearLimitMultiAttachmentPaths();
  await runOmnUiEditAttachmentPersistAndViewCase(page, {
    id: "multi-near-10mb-persist",
    title: "multi ~9 MB → Update → View shows files",
    expect: "accept",
    files: parts.map((p) => p.path),
    expectedNames: parts.map((p) => p.name),
  });
}

export async function runOmnUiEditAttachmentSectionVisibleCase(page: Page): Promise<void> {
  const { invoice } = await uploadBaselineInvoiceAndOpenEdit(page);
  await invoice.expectUploadedEditPageVisible();
  await invoice.scrollToAttachmentSection();
  await invoice.expectAttachmentUploadZoneVisible();
  await expect(invoice.attachmentFileInput()).toBeAttached();
}

async function saveAttachmentEditAndView(
  page: Page,
  invoice: OMN_UIInvoiceManualPage,
  invoiceNumber: string,
  expectedNames: string[]
): Promise<"dashboard" | "edit"> {
  const updateVisible = await invoice.createInvoicePageUpdateButton().isVisible().catch(() => false);
  if (updateVisible) {
    await invoice.clickCreateInvoicePageUpdate();
  } else {
    await invoice.clickCreateInvoicePageSubmit();
  }

  const landedOn = await invoice.waitAfterAttachmentPersist(90_000);
  flowLog("OmnUiAttachment", `After persist landed on: ${landedOn} (${invoiceNumber})`);

  if (landedOn === "dashboard") {
    const dashboard = new DashboardPage(page);
    await dashboard.waitForInvoiceReadyToSubmitStatus(invoiceNumber, { timeoutMs: 120_000 });
    await dashboard.openInvoiceView(invoiceNumber);
    await invoice.expectAttachmentsDisplayedInView(expectedNames);
  } else {
    await invoice.expectUploadedEditPageVisible();
    await invoice.expectAttachedFilesListed(expectedNames);
  }

  return landedOn;
}

function singleAcceptFile(id: string): { file: string; name: string } {
  const scenario = OMN_UI_ATTACHMENT_POSITIVE_FORMAT_SCENARIOS.find((item) => item.id === id);
  if (!scenario || scenario.expect !== "accept" || scenario.files.length !== 1) {
    throw new Error(`Expected a single-file accept scenario for ${id}`);
  }
  return { file: scenario.files[0]!, name: scenario.expectedNames[0]! };
}

async function attachFilesOneAtATime(
  invoice: OMN_UIInvoiceManualPage,
  steps: Array<{ file: string; name: string }>,
  options?: { report?: boolean; notes?: AttachmentToastNote[] }
): Promise<AttachmentToastNote[]> {
  const notes = options?.notes ?? [];
  const names: string[] = [];
  for (const step of steps) {
    const toast = await invoice.selectAttachmentFiles(step.file);
    notes.push({ label: attachmentKindLabel(step.name), toast });
    names.push(step.name);
    await invoice.expectAttachedFilesListed(names);
    await invoice.expectAttachmentUploadControlVisible();
  }
  if (options?.report !== false) printSequentialAttachmentToasts(notes);
  return notes;
}

export async function runOmnUiEditAttachmentPersistAndViewCase(
  page: Page,
  scenario: OmnUiAttachmentAcceptScenario
): Promise<{ invoiceNumber: string; landedOn: "dashboard" | "edit" }> {
  flowLog("OmnUiAttachment", `Persist+View: ${scenario.id}`);
  const { invoice, invoiceNumber } = await uploadBaselineInvoiceAndOpenEdit(page);
  await invoice.expectUploadedEditPageVisible();
  await chooseAttachmentFiles(invoice, scenario.files, scenario.expectedNames);
  await invoice.expectAttachedFilesListed(scenario.expectedNames);
  await invoice.expectAttachmentUploadControlVisible();
  const landedOn = await saveAttachmentEditAndView(
    page,
    invoice,
    invoiceNumber,
    scenario.expectedNames
  );
  return { invoiceNumber, landedOn };
}

export async function runOmnUiEditAttachmentSubmitCase(
  page: Page,
  scenario: OmnUiAttachmentAcceptScenario
): Promise<{ invoiceNumber: string }> {
  flowLog("OmnUiAttachment", `Excel upload + attachment Submit: ${scenario.id}`);
  const { invoice, invoiceNumber } = await uploadBaselineInvoiceAndOpenEdit(page);
  await invoice.expectUploadedEditPageVisible();
  await chooseAttachmentFiles(invoice, scenario.files, scenario.expectedNames);
  await invoice.expectAttachedFilesListed(scenario.expectedNames);
  await invoice.expectAttachmentUploadControlVisible();

  const updateVisible = await invoice.createInvoicePageUpdateButton().isVisible().catch(() => false);
  if (updateVisible) {
    await invoice.clickCreateInvoicePageUpdate();
  } else {
    await invoice.clickCreateInvoicePageSubmit();
  }
  await invoice.waitAfterAttachmentPersist(90_000);

  const dashboard = new DashboardPage(page);
  await dashboard.refreshDashboardForInvoiceTable(invoiceNumber);
  await dashboard.waitForInvoiceReadyToSubmitStatus(invoiceNumber, { timeoutMs: 120_000 });
  await dashboard.submitInvoiceFromTable(invoiceNumber);
  await dashboard.waitForInvoiceDeliveryStatus(invoiceNumber, {
    timeoutMs: OMN_UI_ATTACHMENT_DELIVERY_TIMEOUT_MS,
  });
  flowLog("OmnUiAttachment", `Attachment invoice delivered via Submit: ${invoiceNumber}`);

  return { invoiceNumber };
}

export async function runOmnUiEditAttachmentMultiSubmitCase(page: Page): Promise<void> {
  await runOmnUiEditAttachmentSubmitCase(
    page,
    OMN_UI_ATTACHMENT_MULTI_UNDER_LIMIT as OmnUiAttachmentAcceptScenario
  );
}

export async function runOmnUiEditAttachmentAtLimitSubmitCase(page: Page): Promise<void> {
  const { path: filePath, name } = buildAtLimitSingleAttachmentPath();
  await runOmnUiEditAttachmentSubmitCase(page, {
    id: "single-at-10mb-submit",
    title: "single exactly 10 MB → submit → delivered",
    expect: "accept",
    files: [filePath],
    expectedNames: [name],
  });
}

/** One accepted file, Add Files still available. */
export async function runOmnUiEditAttachmentUploadStaysAfterOneFileCase(page: Page): Promise<void> {
  const pdf = OMN_UI_ATTACHMENT_POSITIVE_FORMAT_SCENARIOS.find((item) => item.id === "pdf");
  if (!pdf) throw new Error("Missing PDF attachment scenario");
  await runOmnUiEditAttachmentScenario(page, pdf);
}

/** The same PDF chosen again through Add Files. */
export async function runOmnUiEditAttachmentSameFileTwiceCase(page: Page): Promise<void> {
  const pdf = singleAcceptFile("pdf");
  const { invoice } = await uploadBaselineInvoiceAndOpenEdit(page);
  await invoice.expectUploadedEditPageVisible();
  await attachFilesOneAtATime(invoice, [pdf, pdf]);
}

/** PDF, then PNG, in two uploads. */
export async function runOmnUiEditAttachmentSecondUploadCase(page: Page): Promise<void> {
  const { invoice } = await uploadBaselineInvoiceAndOpenEdit(page);
  await invoice.expectUploadedEditPageVisible();
  await attachFilesOneAtATime(invoice, [singleAcceptFile("pdf"), singleAcceptFile("png")]);
}

/** PDF, then PNG, then XML, in three uploads. */
export async function runOmnUiEditAttachmentThirdUploadCase(page: Page): Promise<void> {
  const { invoice } = await uploadBaselineInvoiceAndOpenEdit(page);
  await invoice.expectUploadedEditPageVisible();
  await attachFilesOneAtATime(invoice, [
    singleAcceptFile("pdf"),
    singleAcceptFile("png"),
    singleAcceptFile("xml"),
  ]);
}

/** 4 MB, then 5 MB (9 MB total). */
export async function runOmnUiEditAttachmentSequentialUnderLimitCase(page: Page): Promise<void> {
  const parts = buildNearLimitMultiAttachmentPaths();
  const { invoice } = await uploadBaselineInvoiceAndOpenEdit(page);
  await invoice.expectUploadedEditPageVisible();
  await attachFilesOneAtATime(
    invoice,
    parts.map((part) => ({ file: part.path, name: part.name }))
  );
}

/** 6 MB, then 4 MB (exactly 10 MB). */
export async function runOmnUiEditAttachmentSequentialAtLimitCase(page: Page): Promise<void> {
  const parts = buildSequentialAtLimitAttachmentPaths();
  const { invoice } = await uploadBaselineInvoiceAndOpenEdit(page);
  await invoice.expectUploadedEditPageVisible();
  await attachFilesOneAtATime(
    invoice,
    parts.map((part) => ({ file: part.path, name: part.name }))
  );
}

/** 6 MB accepted, then 5 MB rejected. First file stays and Add Files stays. */
export async function runOmnUiEditAttachmentSequentialOverLimitCase(page: Page): Promise<void> {
  const [first, second] = buildSequentialOverLimitAttachmentPaths();
  if (!first || !second) throw new Error("Expected two sequential over-limit attachment files");
  const { invoice } = await uploadBaselineInvoiceAndOpenEdit(page);
  await invoice.expectUploadedEditPageVisible();
  const notes: AttachmentToastNote[] = [];
  const firstToast = await invoice.selectAttachmentFiles(first.path);
  notes.push({ label: attachmentKindLabel(first.name), toast: firstToast });
  await invoice.expectAttachedFilesListed([first.name]);
  await invoice.expectAttachmentUploadControlVisible();
  const toast = await invoice.selectAttachmentFiles(second.path);
  notes.push({ label: attachmentKindLabel(second.name), toast });
  printSequentialAttachmentToasts(notes);
  expectAttachmentToastWhenPresent(toast, OMN_UI_ATTACHMENT_SIZE_ERROR);
  await invoice.expectAttachedFilesListed([first.name]);
  await expect(invoice.attachedFileRow(second.name)).toHaveCount(0);
  await invoice.expectAttachmentUploadControlVisible();
}

/** PDF accepted, then unsupported .txt rejected. PDF stays and Add Files stays. */
export async function runOmnUiEditAttachmentSecondInvalidFormatCase(page: Page): Promise<void> {
  if (OMN_UI_ATTACHMENT_INVALID_FORMAT.expect !== "reject") {
    throw new Error("Invalid format scenario must reject");
  }
  const pdf = singleAcceptFile("pdf");
  const rejected = OMN_UI_ATTACHMENT_INVALID_FORMAT.files[0];
  if (!rejected) throw new Error("Invalid format scenario has no file");
  const { invoice } = await uploadBaselineInvoiceAndOpenEdit(page);
  await invoice.expectUploadedEditPageVisible();
  const notes: AttachmentToastNote[] = [];
  const pdfToast = await invoice.selectAttachmentFiles(pdf.file);
  notes.push({ label: attachmentKindLabel(pdf.name), toast: pdfToast });
  await invoice.expectAttachedFilesListed([pdf.name]);
  await invoice.expectAttachmentUploadControlVisible();
  const rejectedName = rejected.split(/[/\\]/).pop() ?? rejected;
  const toast = await invoice.selectAttachmentFiles(rejected);
  notes.push({ label: attachmentKindLabel(rejectedName), toast });
  printSequentialAttachmentToasts(notes);
  expectAttachmentToastWhenPresent(toast, OMN_UI_ATTACHMENT_INVALID_FORMAT.errorPattern);
  await invoice.expectAttachedFilesListed([pdf.name]);
  await invoice.expectAttachmentUploadControlVisible();
}

/** PDF then PNG, remove PNG, add XML through the button that stayed. */
export async function runOmnUiEditAttachmentRemoveOneThenAddCase(page: Page): Promise<void> {
  const pdf = singleAcceptFile("pdf");
  const png = singleAcceptFile("png");
  const xml = singleAcceptFile("xml");
  const { invoice } = await uploadBaselineInvoiceAndOpenEdit(page);
  await invoice.expectUploadedEditPageVisible();
  const notes = await attachFilesOneAtATime(invoice, [pdf, png], { report: false });
  await invoice.removeAttachedFile(png.name, { confirm: "Yes" });
  await invoice.expectAttachedFilesListed([pdf.name]);
  await invoice.expectAttachmentUploadControlVisible();
  const xmlToast = await invoice.selectAttachmentFiles(xml.file);
  notes.push({ label: attachmentKindLabel(xml.name), toast: xmlToast });
  printSequentialAttachmentToasts(notes);
  await invoice.expectAttachedFilesListed([pdf.name, xml.name]);
  await invoice.expectAttachmentUploadControlVisible();
}

/** PDF then PNG, Update, View shows both. */
export async function runOmnUiEditAttachmentSequentialPersistCase(page: Page): Promise<void> {
  const pdf = singleAcceptFile("pdf");
  const png = singleAcceptFile("png");
  const { invoice, invoiceNumber } = await uploadBaselineInvoiceAndOpenEdit(page);
  await invoice.expectUploadedEditPageVisible();
  await attachFilesOneAtATime(invoice, [pdf, png]);
  await saveAttachmentEditAndView(page, invoice, invoiceNumber, [pdf.name, png.name]);
}
