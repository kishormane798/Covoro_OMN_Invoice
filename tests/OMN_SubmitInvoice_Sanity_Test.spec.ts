import { expect } from "@playwright/test";
import { test } from "../Src/baseTest";
import * as FV from "../testData/FieldValidations";
import { invoiceData } from "../testData/FieldValidations/SubmitInvoice";
import { multiItemInvoiceCases } from "../testData/FieldValidations/SubmitInvoiceMultiItem";
import { runErrorValidation } from "../Helpers/excel/excelEditMessageCheck";
import {
  generateOmanFieldLengthExcel,
  generateOmanSeededFieldExcel,
} from "../Helpers/excel/omanFieldValidationExcelHelper";
import { uploadAndVerifyFieldAccepted } from "../Helpers/excel/fieldValidationSpecSupport";
import {
  applySimplifiedTemplateEnv,
  clearSimplifiedTemplateEnv,
} from "../Helpers/excel/simplifiedTemplateContext";
import { filterSubmitInvoiceRowsByTemplateHeaders } from "../utils/excel/invoiceExcel";
import { SIMPLIFIED_TEMPLATE_HEADER_LABELS } from "../testData/invoiceTemplateHeaders/invoiceColumnMapping";
import {
  BULK_SUBMIT_INVOICE_TEST_TIMEOUT_MS,
  runBulkSubmitInvoiceCase,
  runSubmitInvoiceCase,
} from "../Helpers/excel/submitInvoiceCaseHelper";
import {
  UPLOAD_TEMPLATE_LABEL_NORMAL,
  UPLOAD_TEMPLATE_LABEL_SIMPLIFIED,
  openUploadPage,
} from "../Helpers/excel/uploadHelper";
import {
  omnUiAttachmentSubmitTitle,
  runOmnUiEditAttachmentMultiSubmitCase,
  runOmnUiEditAttachmentSubmitCase,
  OMN_UI_ATTACHMENT_SUBMIT_TIMEOUT_MS,
} from "../Helpers/ui/omnUiAttachmentHelper";
import {
  OMN_UI_ATTACHMENT_MULTI_UNDER_LIMIT,
  OMN_UI_ATTACHMENT_POSITIVE_FORMAT_SCENARIOS,
  type OmnUiAttachmentAcceptScenario,
} from "../testData/ui/omnUiInvoiceAttachmentScenarios";
import { OMN_UIInvoiceManualPage } from "../pageObjects/OMN_UIInvoiceManualPage";
import { openOmnUiInvoiceEditor } from "../Helpers/ui/omnUiInvoiceEntryHelper";
import {
  OMN_UI_INVOICE_EDIT_COPY_TIMEOUT_MS,
  OMN_UI_INVOICE_TEST_TIMEOUT_MS,
} from "../testData/ui/omnUiInvoiceValidation";
import {
  runOmnUiSubmitInvoiceMultiItemCase,
  OMN_UI_SUBMIT_INVOICE_MULTI_TEST_TIMEOUT_MS,
  OMN_UI_SUBMIT_INVOICE_TEST_TIMEOUT_MS,
} from "../Helpers/ui/omnUiSubmitInvoiceHelper";
import {
  OMN_SANITY_BULK_DOWNLOAD_FORMATS,
  OMN_SANITY_SINGLE_DOWNLOAD_FORMATS,
  OMN_UI_INVOICE_BULK_DOWNLOAD_TEST_TIMEOUT_MS,
  OMN_UI_INVOICE_FILE_DOWNLOAD_TEST_TIMEOUT_MS,
  runOmnSanityBulkDownloadFormatCase,
  runOmnSanityBulkErrorRecordsDownload,
  runOmnSanityBulkSuccessRecordsDownload,
  runOmnSanityErrorRecordDownload,
  runOmnSanityInvoiceFileDownloadCase,
  runOmnSanitySuccessRecordDownload,
} from "../Helpers/ui/omnUiInvoiceFileDownloadHelper";

/**
 * Post-deploy sanity — one case of each flow.
 * Full matrices stay in the Covoro / Simplified / UI specs. Run with `npm run test:sanity`.
 */
const SUBMIT_SANITY_TIMEOUT_MS = 6 * 60 * 1000;

const ATTACHMENT_PDF = OMN_UI_ATTACHMENT_POSITIVE_FORMAT_SCENARIOS.find(
  (s): s is OmnUiAttachmentAcceptScenario => s.expect === "accept" && s.id === "pdf"
)!;

const ATTACHMENT_MULTI = OMN_UI_ATTACHMENT_MULTI_UNDER_LIMIT as OmnUiAttachmentAcceptScenario;

function firstSingleRow(): Record<string, string> {
  const row = invoiceData[0];
  if (!row) throw new Error("Submit sanity: invoiceData[0] is missing");
  return row;
}

function firstMultiRows(): Array<Record<string, string>> {
  const tc = multiItemInvoiceCases[0];
  if (!tc?.rows?.length) {
    throw new Error("Submit sanity: multiItemInvoiceCases[0] is missing");
  }
  return tc.rows;
}

function firstSimplifiedSingleRow(): Record<string, string> {
  const rows = filterSubmitInvoiceRowsByTemplateHeaders(
    [firstSingleRow()],
    SIMPLIFIED_TEMPLATE_HEADER_LABELS
  );
  const row = rows[0];
  if (!row) throw new Error("Submit sanity: no simplified single-line row");
  return row;
}

async function withSimplifiedTemplate<T>(run: () => Promise<T>): Promise<T> {
  applySimplifiedTemplateEnv();
  try {
    return await run();
  } finally {
    clearSimplifiedTemplateEnv();
  }
}

test.describe("Excel upload — valid and negative (one case each)", () => {
  test.describe.configure({ mode: "parallel", retries: 0 });

  test("Covoro — valid Invoice Number should be accepted.", async ({ page }) => {
    const config = FV.fieldInvoice_number[0]!;
    const { filePath } = await generateOmanFieldLengthExcel(config.field, config.min);
    await uploadAndVerifyFieldAccepted(page, filePath);
  });

  test("Covoro — negative empty Invoice Number should be rejected and the error file should download.", async ({
    page,
  }) => {
    const { filePath } = await generateOmanSeededFieldExcel("Invoice Number", "");
    await runErrorValidation(page, { filePath, field: "Invoice Number", checkEdit: false });
  });

  test("Simplified — valid Invoice Number should be accepted.", async ({ page }) => {
    await withSimplifiedTemplate(async () => {
      const config = FV.fieldInvoice_number[0]!;
      const { filePath } = await generateOmanFieldLengthExcel(config.field, config.min);
      await uploadAndVerifyFieldAccepted(page, filePath);
    });
  });

  test("Simplified — negative empty Invoice Number should be rejected and the error file should download.", async ({
    page,
  }) => {
    await withSimplifiedTemplate(async () => {
      const { filePath } = await generateOmanSeededFieldExcel("Invoice Number", "");
      await runErrorValidation(page, { filePath, field: "Invoice Number", checkEdit: false });
    });
  });
});

test.describe("Template mapping", () => {
  test.describe.configure({ mode: "parallel", retries: 0 });

  test(`Covoro upload maps to ${UPLOAD_TEMPLATE_LABEL_NORMAL}.`, async ({ page }) => {
    await openUploadPage(page);
  });

  test(`Simplified upload maps to ${UPLOAD_TEMPLATE_LABEL_SIMPLIFIED}.`, async ({ page }) => {
    await withSimplifiedTemplate(() => openUploadPage(page));
  });
});

test.describe("Excel submit — Covoro and Simplified (one case)", () => {
  test.describe.configure({ mode: "parallel", retries: 0 });

  test("Covoro — one invoice should be submitted and delivered.", async ({ page }) => {
    test.setTimeout(SUBMIT_SANITY_TIMEOUT_MS);
    await runSubmitInvoiceCase(page, firstSingleRow());
  });

  test("Simplified — one invoice should be submitted and delivered.", async ({ page }) => {
    test.setTimeout(SUBMIT_SANITY_TIMEOUT_MS);
    await withSimplifiedTemplate(() => runSubmitInvoiceCase(page, firstSimplifiedSingleRow()));
  });
});

test.describe("Create and Copy Invoice UI", () => {
  test.describe.configure({ mode: "parallel", retries: 0 });

  test("Create Invoice form should open.", async ({ page }) => {
    test.setTimeout(OMN_UI_INVOICE_TEST_TIMEOUT_MS);
    const invoice = new OMN_UIInvoiceManualPage(page);
    await invoice.openCreate();
    await invoice.expectEditorVisible();
  });

  test("Copy Invoice form should open.", async ({ page }) => {
    test.setTimeout(OMN_UI_INVOICE_EDIT_COPY_TIMEOUT_MS);
    const invoice = await openOmnUiInvoiceEditor(page, "copy");
    await invoice.expectEditorVisible();
  });
});

test.describe("Create Invoice UI — submit (one line and multiple lines)", () => {
  test.describe.configure({ mode: "parallel", retries: 0 });

  test("Create Invoice — one line should be submitted and delivered.", async ({ page }) => {
    test.setTimeout(OMN_UI_SUBMIT_INVOICE_TEST_TIMEOUT_MS);
    await runOmnUiSubmitInvoiceMultiItemCase(page, [firstSingleRow()]);
  });

  test("Create Invoice — four lines should be submitted and delivered.", async ({ page }) => {
    test.setTimeout(OMN_UI_SUBMIT_INVOICE_MULTI_TEST_TIMEOUT_MS);
    await runOmnUiSubmitInvoiceMultiItemCase(page, firstMultiRows());
  });
});

test.describe("Submit with attachment", () => {
  test.describe.configure({ mode: "parallel", retries: 0 });

  test(omnUiAttachmentSubmitTitle(ATTACHMENT_PDF), async ({ page }) => {
    test.setTimeout(OMN_UI_ATTACHMENT_SUBMIT_TIMEOUT_MS);
    await runOmnUiEditAttachmentSubmitCase(page, ATTACHMENT_PDF);
  });

  test(omnUiAttachmentSubmitTitle(ATTACHMENT_MULTI), async ({ page }) => {
    test.setTimeout(OMN_UI_ATTACHMENT_SUBMIT_TIMEOUT_MS);
    await runOmnUiEditAttachmentMultiSubmitCase(page);
  });
});

test.describe("Bulk submit — 5 invoices and status", () => {
  test.describe.configure({ mode: "parallel", retries: 0 });

  test("Five uploaded invoices — bulk Submit — each status should be delivered.", async ({
    page,
  }) => {
    test.setTimeout(BULK_SUBMIT_INVOICE_TEST_TIMEOUT_MS);
    await runBulkSubmitInvoiceCase(page, firstSingleRow(), { invoiceCount: 5 });
  });
});

test.describe("Download error records", () => {
  test.describe.configure({ mode: "parallel", retries: 0 });

  test("Download one Error in Records invoice as Excel.", async ({ page }) => {
    test.setTimeout(OMN_UI_INVOICE_FILE_DOWNLOAD_TEST_TIMEOUT_MS);
    await runOmnSanityErrorRecordDownload(page);
  });

  test("Bulk download Error Records.", async ({ page }) => {
    test.setTimeout(OMN_UI_INVOICE_BULK_DOWNLOAD_TEST_TIMEOUT_MS);
    await runOmnSanityBulkErrorRecordsDownload(page);
  });
});

test.describe("Download success records", () => {
  test.describe.configure({ mode: "parallel", retries: 0 });

  test("Download one Ready to Submit invoice as Excel.", async ({ page }) => {
    test.setTimeout(OMN_UI_INVOICE_FILE_DOWNLOAD_TEST_TIMEOUT_MS);
    await runOmnSanitySuccessRecordDownload(page);
  });

  test("Bulk download Valid Records.", async ({ page }) => {
    test.setTimeout(OMN_UI_INVOICE_BULK_DOWNLOAD_TEST_TIMEOUT_MS);
    await runOmnSanityBulkSuccessRecordsDownload(page);
  });
});

test.describe("Download delivered records — Excel, PDF, XML, JSON", () => {
  test.describe.configure({ mode: "parallel", retries: 0 });

  for (const format of OMN_SANITY_SINGLE_DOWNLOAD_FORMATS) {
    test(`Download one Delivered invoice as ${format.toUpperCase()}.`, async ({ page }) => {
      test.setTimeout(OMN_UI_INVOICE_FILE_DOWNLOAD_TEST_TIMEOUT_MS);
      await runOmnSanityInvoiceFileDownloadCase(page, format);
    });
  }

  for (const format of OMN_SANITY_BULK_DOWNLOAD_FORMATS) {
    test(`Bulk download Delivered invoices as ${format.toUpperCase()}.`, async ({ page }) => {
      test.setTimeout(OMN_UI_INVOICE_BULK_DOWNLOAD_TEST_TIMEOUT_MS);
      await runOmnSanityBulkDownloadFormatCase(page, format);
    });
  }
});

test("Post-deploy sanity fixtures should be present", () => {
  expect(invoiceData.length).toBeGreaterThan(0);
  expect(multiItemInvoiceCases[0]?.rows.length).toBe(4);
  expect(ATTACHMENT_PDF).toBeTruthy();
  expect(ATTACHMENT_MULTI.files.length).toBeGreaterThan(1);
  expect(UPLOAD_TEMPLATE_LABEL_NORMAL).toBe("COVORO Template - Excel");
  expect(OMN_SANITY_SINGLE_DOWNLOAD_FORMATS).toEqual(["excel", "json", "pdf", "xml"]);
  expect(OMN_SANITY_BULK_DOWNLOAD_FORMATS).toEqual(["excel", "json", "pdf", "xml"]);
});
