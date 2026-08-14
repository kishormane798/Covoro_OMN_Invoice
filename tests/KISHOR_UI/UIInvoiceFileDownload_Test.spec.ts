// UI SUITE DISABLED FOR OMN — entire file commented out (do not execute)
// import { test } from "../../Src/baseTest";
// import {
//   bulkDownloadFormatTitle,
//   bulkToastNegationTitle,
//   downloadOptionTitle,
//   downloadTitle,
//   menuVisibilityTitle,
//   runUiInvoiceFileDownloadCase,
//   runUiInvoiceFileDownloadMenuVisibilityCase,
//   runUiInvoiceFileDownloadOptionVisibleCase,
//   runUiInvoiceBulkDownloadValidRecordsToastCase,
//   runUiInvoiceBulkDownloadFormatCase,
//   UI_INVOICE_BULK_DOWNLOAD_FORMAT_SCENARIOS,
//   UI_INVOICE_BULK_DOWNLOAD_TOAST_SCENARIOS,
//   UI_INVOICE_FILE_DOWNLOAD_MENU_SCENARIOS,
//   UI_INVOICE_FILE_DOWNLOAD_OPTION_SCENARIOS,
//   UI_INVOICE_FILE_DOWNLOAD_SCENARIOS,
//   UI_INVOICE_FILE_DOWNLOAD_TEST_TIMEOUT_MS,
//   UI_INVOICE_BULK_DOWNLOAD_TEST_TIMEOUT_MS,
// } from "../../Helpers/ui/uiInvoiceFileDownloadHelper";
// 
// test.describe("Invoice dashboard â€” Options shows Download", () => {
//   test.describe.configure({ mode: "parallel" });
// 
//   for (const scenario of UI_INVOICE_FILE_DOWNLOAD_OPTION_SCENARIOS) {
//     test(downloadOptionTitle(scenario), async ({ page }) => {
//       test.setTimeout(UI_INVOICE_FILE_DOWNLOAD_TEST_TIMEOUT_MS);
//       await runUiInvoiceFileDownloadOptionVisibleCase(page, scenario);
//     });
//   }
// });
// 
// test.describe("Invoice dashboard â€” Download format menu", () => {
//   test.describe.configure({ mode: "parallel" });
// 
//   for (const scenario of UI_INVOICE_FILE_DOWNLOAD_MENU_SCENARIOS) {
//     test(menuVisibilityTitle(scenario), async ({ page }) => {
//       test.setTimeout(UI_INVOICE_FILE_DOWNLOAD_TEST_TIMEOUT_MS);
//       await runUiInvoiceFileDownloadMenuVisibilityCase(page, scenario);
//     });
//   }
// });
// 
// test.describe("Invoice dashboard â€” Download file per format", () => {
//   test.describe.configure({ mode: "parallel" });
// 
//   for (const scenario of UI_INVOICE_FILE_DOWNLOAD_SCENARIOS) {
//     test(downloadTitle(scenario), async ({ page }) => {
//       test.setTimeout(UI_INVOICE_FILE_DOWNLOAD_TEST_TIMEOUT_MS);
//       await runUiInvoiceFileDownloadCase(page, scenario);
//     });
//   }
// });
// 
// test.describe("Invoice dashboard â€” Bulk download", () => {
//   test.describe.configure({ mode: "parallel" });
// 
//   for (const scenario of UI_INVOICE_BULK_DOWNLOAD_FORMAT_SCENARIOS) {
//     test(bulkDownloadFormatTitle(scenario), async ({ page }) => {
//       test.setTimeout(UI_INVOICE_BULK_DOWNLOAD_TEST_TIMEOUT_MS);
//       await runUiInvoiceBulkDownloadFormatCase(page, scenario);
//     });
//   }
// });
// 
// test.describe("Invoice dashboard â€” Bulk download toast (negation)", () => {
//   test.describe.configure({ mode: "parallel" });
// 
//   for (const scenario of UI_INVOICE_BULK_DOWNLOAD_TOAST_SCENARIOS) {
//     test(bulkToastNegationTitle(scenario), async ({ page }) => {
//       test.setTimeout(UI_INVOICE_BULK_DOWNLOAD_TEST_TIMEOUT_MS);
//       await runUiInvoiceBulkDownloadValidRecordsToastCase(page, scenario);
//     });
//   }
// });
