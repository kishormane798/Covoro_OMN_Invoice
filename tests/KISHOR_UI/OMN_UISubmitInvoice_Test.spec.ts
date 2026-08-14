// UI SUITE DISABLED FOR OMN — entire file commented out (do not execute)
// import { test } from "../../Src/baseTest";
// import * as FV from "../../testData/FieldValidations";
// import {
//   runUiSubmitInvoiceCase,
//   UI_SUBMIT_INVOICE_TEST_TIMEOUT_MS,
// } from "../../Helpers/ui/uiSubmitInvoiceHelper";
// 
// test.describe("Create Invoice UI â€” submit invoice (Covoro matrix)", () => {
//   test.describe.configure({ mode: "parallel" });
// 
//   for (const data of FV.invoiceData) {
//     const row = data as Record<string, string>;
//     const taxRate = String(row["Tax Rate"] ?? "").trim();
//     const taxLabel = taxRate ? `${row["Tax Category"]} ${taxRate}%` : row["Tax Category"];
//     test(
//       `Verify Create Invoice UI submit is delivered successfully (${row["Invoice Type Code"]} | ${row["Invoice Transaction Type Code"]} | ${row["Invoice Currency Code"]} | ${taxLabel}).`,
//       async ({ page }) => {
//         test.setTimeout(UI_SUBMIT_INVOICE_TEST_TIMEOUT_MS);
//         await runUiSubmitInvoiceCase(page, row);
//       }
//     );
//   }
// 
//   for (const data of FV.invoiceData) {
//     const usdData: Record<string, string> = {
//       ...(data as Record<string, string>),
//       "Invoice Currency Code": "USD",
//       "Currency Exchange Rate": "3.67",
//     };
//     const taxRate = String(usdData["Tax Rate"] ?? "").trim();
//     const taxLabel = taxRate ? `${usdData["Tax Category"]} ${taxRate}%` : usdData["Tax Category"];
//     test(
//       `Verify Create Invoice UI submit is delivered successfully (${usdData["Invoice Type Code"]} | ${usdData["Invoice Transaction Type Code"]} | ${usdData["Invoice Currency Code"]} | ${taxLabel}).`,
//       async ({ page }) => {
//         test.setTimeout(UI_SUBMIT_INVOICE_TEST_TIMEOUT_MS);
//         await runUiSubmitInvoiceCase(page, usdData);
//       }
//     );
//   }
// });
