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
  runSubmitInvoiceAsPdfCase,
  runSubmitInvoiceCase,
} from "../Helpers/excel/submitInvoiceCaseHelper";
import {
  UPLOAD_TEMPLATE_LABEL_NORMAL,
  openUploadPage,
} from "../Helpers/excel/uploadHelper";
import {
  runOmnUiEditAttachmentScenario,
  runOmnUiEditAttachmentSubmitCase,
  OMN_UI_ATTACHMENT_SUBMIT_TIMEOUT_MS,
  OMN_UI_ATTACHMENT_TEST_TIMEOUT_MS,
} from "../Helpers/ui/omnUiAttachmentHelper";
import { OMN_UI_ATTACHMENT_ALL_FORMATS } from "../testData/ui/omnUiInvoiceAttachmentScenarios";
import { INVOICE_DOWNLOAD_FORMAT_LABEL } from "../pageObjects/OMN_DashboardPage";
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
 * Post-deploy sanity. Attachments add every allowed document type on one invoice, then submit it.
 * Per-document matrices stay in the UI attachment spec. Run with `npm run test:sanity`.
 */
const SUBMIT_SANITY_TIMEOUT_MS = 6 * 60 * 1000;

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

test.describe("Excel upload — valid and negative", () => {
  test.describe.configure({ mode: "parallel", retries: 0 });

  test("Entering the shortest allowed Invoice Number on the Covoro template should be accepted. (Invoice Number)", async ({ page }) => {
    const config = FV.fieldInvoice_number[0]!;
    const { filePath } = await generateOmanFieldLengthExcel(config.field, config.min);
    await uploadAndVerifyFieldAccepted(page, filePath);
  });

  test("Leaving Invoice Number empty on the Covoro template should be rejected with an error. (Invoice Number)", async ({
    page,
  }) => {
    const { filePath } = await generateOmanSeededFieldExcel("Invoice Number", "");
    await runErrorValidation(page, { filePath, field: "Invoice Number", checkEdit: false });
  });

  test("Entering the shortest allowed Invoice Number on the simplified template should be accepted. (Invoice Number)", async ({ page }) => {
    await withSimplifiedTemplate(async () => {
      const config = FV.fieldInvoice_number[0]!;
      const { filePath } = await generateOmanFieldLengthExcel(config.field, config.min);
      await uploadAndVerifyFieldAccepted(page, filePath);
    });
  });

  test("Leaving Invoice Number empty on the simplified template should be rejected with an error. (Invoice Number)", async ({
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

  test("The upload screen should be mapped to the Covoro template. (Upload template)", async ({ page }) => {
    await openUploadPage(page);
  });

  test("The upload screen should be mapped to the simplified template. (Upload template)", async ({ page }) => {
    await withSimplifiedTemplate(() => openUploadPage(page));
  });
});

test.describe("Excel submit — Covoro and Simplified", () => {
  test.describe.configure({ mode: "parallel", retries: 0 });

  test("Submitting one invoice from the Covoro template should deliver the invoice. (Submit)", async ({ page }) => {
    test.setTimeout(SUBMIT_SANITY_TIMEOUT_MS);
    await runSubmitInvoiceCase(page, firstSingleRow());
  });

  test("Submitting one invoice from the simplified template should deliver the invoice. (Submit)", async ({ page }) => {
    test.setTimeout(SUBMIT_SANITY_TIMEOUT_MS);
    await withSimplifiedTemplate(() => runSubmitInvoiceCase(page, firstSimplifiedSingleRow()));
  });
});

test.describe("Create and Copy Invoice UI", () => {
  test.describe.configure({ mode: "parallel", retries: 0 });

  test("The Create Invoice screen should open. (Create Invoice)", async ({ page }) => {
    test.setTimeout(OMN_UI_INVOICE_TEST_TIMEOUT_MS);
    const invoice = new OMN_UIInvoiceManualPage(page);
    await invoice.openCreate();
    await invoice.expectEditorVisible();
  });

  test("The Copy Invoice screen should open from an existing invoice. (Copy Invoice)", async ({ page }) => {
    test.setTimeout(OMN_UI_INVOICE_EDIT_COPY_TIMEOUT_MS);
    const invoice = await openOmnUiInvoiceEditor(page, "copy");
    await invoice.expectEditorVisible();
  });
});

test.describe("Create Invoice UI — submit (one line and multiple lines)", () => {
  test.describe.configure({ mode: "parallel", retries: 0 });

  test("Creating an invoice with one line and submitting it should deliver the invoice. (Create Invoice)", async ({ page }) => {
    test.setTimeout(OMN_UI_SUBMIT_INVOICE_TEST_TIMEOUT_MS);
    await runOmnUiSubmitInvoiceMultiItemCase(page, [firstSingleRow()]);
  });

  test("Creating an invoice with four lines and submitting it should deliver the invoice. (Create Invoice)", async ({ page }) => {
    test.setTimeout(OMN_UI_SUBMIT_INVOICE_MULTI_TEST_TIMEOUT_MS);
    await runOmnUiSubmitInvoiceMultiItemCase(page, firstMultiRows());
  });
});

test.describe("Attachment — all allowed documents", () => {
  test.describe.configure({ mode: "parallel", retries: 0 });

  test("Adding a PDF, JPG, JPEG, PNG, XML, CSV, Excel, and ODS file on one invoice should list all eight attachments. (Attachment Details)", async ({
    page,
  }) => {
    test.setTimeout(OMN_UI_ATTACHMENT_TEST_TIMEOUT_MS);
    await runOmnUiEditAttachmentScenario(page, OMN_UI_ATTACHMENT_ALL_FORMATS);
  });

  test("Submitting an invoice that has a PDF, JPG, JPEG, PNG, XML, CSV, Excel, and ODS file attached should deliver the invoice. (Attachment Details)", async ({
    page,
  }) => {
    test.setTimeout(OMN_UI_ATTACHMENT_SUBMIT_TIMEOUT_MS);
    await runOmnUiEditAttachmentSubmitCase(page, OMN_UI_ATTACHMENT_ALL_FORMATS);
  });
});

test.describe("Bulk submit — 5 invoices and status", () => {
  test.describe.configure({ mode: "parallel", retries: 0 });

  test("Selecting five uploaded invoices and choosing Submit should deliver each invoice. (Bulk Submit)", async ({
    page,
  }) => {
    test.setTimeout(BULK_SUBMIT_INVOICE_TEST_TIMEOUT_MS);
    await runBulkSubmitInvoiceCase(page, firstSingleRow(), { invoiceCount: 5 });
  });
});

test.describe("Submit as PDF", () => {
  test.describe.configure({ mode: "parallel", retries: 0 });

  test(
    "Choosing Submit as PDF for one uploaded invoice should show the same success message as Submit, and the invoice should be delivered. (Submit as PDF)",
    async ({ page }) => {
      test.setTimeout(SUBMIT_SANITY_TIMEOUT_MS);
      await runSubmitInvoiceAsPdfCase(page, firstSingleRow());
    }
  );

  test(
    "Choosing Submit as PDF for five uploaded invoices should show the same success message as Submit, and each invoice should be delivered. (Submit as PDF)",
    async ({ page }) => {
      test.setTimeout(BULK_SUBMIT_INVOICE_TEST_TIMEOUT_MS);
      await runBulkSubmitInvoiceCase(page, firstSingleRow(), {
        invoiceCount: 5,
        bulkAction: "Submit as PDF",
      });
    }
  );
});

test.describe("Download error records", () => {
  test.describe.configure({ mode: "parallel", retries: 0 });

  test("Downloading one invoice from Error in Records as Excel should save the file. (Error in Records)", async ({ page }) => {
    test.setTimeout(OMN_UI_INVOICE_FILE_DOWNLOAD_TEST_TIMEOUT_MS);
    await runOmnSanityErrorRecordDownload(page);
  });

  test("Selecting every invoice in Error in Records and downloading Error Records should save an Excel file. (Error Records)", async ({ page }) => {
    test.setTimeout(OMN_UI_INVOICE_BULK_DOWNLOAD_TEST_TIMEOUT_MS);
    await runOmnSanityBulkErrorRecordsDownload(page);
  });
});

test.describe("Download success records", () => {
  test.describe.configure({ mode: "parallel", retries: 0 });

  test("Downloading one invoice that is Ready to Submit as Excel should save the file. (Ready to Submit)", async ({ page }) => {
    test.setTimeout(OMN_UI_INVOICE_FILE_DOWNLOAD_TEST_TIMEOUT_MS);
    await runOmnSanitySuccessRecordDownload(page);
  });

  test("Selecting every invoice that is Ready to Submit and downloading Valid Records should save an Excel file. (Valid Records)", async ({ page }) => {
    test.setTimeout(OMN_UI_INVOICE_BULK_DOWNLOAD_TEST_TIMEOUT_MS);
    await runOmnSanityBulkSuccessRecordsDownload(page);
  });
});

test.describe("Download delivered records — Excel, PDF, XML, JSON", () => {
  test.describe.configure({ mode: "parallel", retries: 0 });

  for (const format of OMN_SANITY_SINGLE_DOWNLOAD_FORMATS) {
    test(`Downloading one delivered invoice as ${INVOICE_DOWNLOAD_FORMAT_LABEL[format]} should save the file. (Delivered)`, async ({ page }) => {
      test.setTimeout(OMN_UI_INVOICE_FILE_DOWNLOAD_TEST_TIMEOUT_MS);
      await runOmnSanityInvoiceFileDownloadCase(page, format);
    });
  }

  for (const format of OMN_SANITY_BULK_DOWNLOAD_FORMATS) {
    test(`Selecting every delivered invoice and downloading them as ${INVOICE_DOWNLOAD_FORMAT_LABEL[format]} should save the file. (Delivered)`, async ({ page }) => {
      test.setTimeout(OMN_UI_INVOICE_BULK_DOWNLOAD_TEST_TIMEOUT_MS);
      await runOmnSanityBulkDownloadFormatCase(page, format);
    });
  }
});

test("The sanity sample data should include invoices, a four-line invoice, all eight attachment types, both upload template names, and Excel, JSON, PDF, and XML downloads. (Sanity data)", () => {
  expect(invoiceData.length).toBeGreaterThan(0);
  expect(multiItemInvoiceCases[0]?.rows.length).toBe(4);
  expect(OMN_UI_ATTACHMENT_ALL_FORMATS.expectedNames).toEqual([
    "ui-attachment-sample.pdf",
    "sample.jpg",
    "sample.jpeg",
    "sample.png",
    "sample.xml",
    "sample.csv",
    "sample.xlsx",
    "sample.ods",
  ]);
  expect(UPLOAD_TEMPLATE_LABEL_NORMAL).toBe("COVORO Template - Excel");
  expect(OMN_SANITY_SINGLE_DOWNLOAD_FORMATS).toEqual(["excel", "json", "pdf", "xml"]);
  expect(OMN_SANITY_BULK_DOWNLOAD_FORMATS).toEqual(["excel", "json", "pdf", "xml"]);
});
