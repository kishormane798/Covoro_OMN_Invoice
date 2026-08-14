// UI SUITE DISABLED FOR OMN — entire file commented out (do not execute)
// import { test } from "../../Src/baseTest";
// import * as FV from "../../testData/FieldValidations";
// import {
//   runUiSubmitInvoiceMultiItemCase,
//   UI_SUBMIT_INVOICE_MULTI_TEST_TIMEOUT_MS,
// } from "../../Helpers/ui/uiSubmitInvoiceHelper";
// 
// test.describe("Create Invoice via UI with multi-item", () => {
//   test.describe.configure({ mode: "parallel" });
// 
//   for (const tc of FV.multiItemInvoiceCases) {
//     const first = tc.rows[0] ?? {};
//     test(
//       `Create Invoice via UI with multi-item â€“ verify delivery (${first["Invoice Type Code"] ?? ""} | ${first["Invoice Transaction Type Code"] ?? ""} | ${first["Invoice Currency Code"] ?? ""} | ${tc.rows.length} lines).`,
//       async ({ page }) => {
//         test.setTimeout(UI_SUBMIT_INVOICE_MULTI_TEST_TIMEOUT_MS);
//         await runUiSubmitInvoiceMultiItemCase(page, tc.rows);
//       }
//     );
//   }
// });
