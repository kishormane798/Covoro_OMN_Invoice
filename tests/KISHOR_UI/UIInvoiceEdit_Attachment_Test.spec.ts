// UI SUITE DISABLED FOR OMN — entire file commented out (do not execute)
// import { test } from "../../Src/baseTest";
// import {
//   runUiEditAttachmentAtLimitSingleCase,
//   runUiEditAttachmentAtLimitSubmitAsPdfCase,
//   runUiEditAttachmentAtLimitSubmitCase,
//   runUiEditAttachmentCombinedOversizeCase,
//   runUiEditAttachmentMultiSubmitAsPdfCase,
//   runUiEditAttachmentMultiSubmitCase,
//   runUiEditAttachmentNearLimitMultiCase,
//   runUiEditAttachmentNearLimitMultiPersistCase,
//   runUiEditAttachmentNearLimitSingleCase,
//   runUiEditAttachmentNearLimitSinglePersistCase,
//   runUiEditAttachmentOversizeCase,
//   runUiEditAttachmentPersistAndViewCase,
//   runUiEditAttachmentRemoveCase,
//   runUiEditAttachmentScenario,
//   runUiEditAttachmentSectionVisibleCase,
//   runUiEditAttachmentSubmitCase,
//   uiAttachmentBulkSubmitTitle,
//   uiAttachmentListTitle,
//   uiAttachmentPersistTitle,
//   uiAttachmentRemoveTitle,
//   uiAttachmentSectionVisibleTitle,
//   uiAttachmentSubmitAsPdfTitle,
//   uiAttachmentSubmitTitle,
//   UI_ATTACHMENT_PERSIST_TIMEOUT_MS,
//   UI_ATTACHMENT_SIZE_TIMEOUT_MS,
//   UI_ATTACHMENT_SUBMIT_TIMEOUT_MS,
//   UI_ATTACHMENT_LARGE_SUBMIT_TIMEOUT_MS,
//   UI_ATTACHMENT_TEST_TIMEOUT_MS,
// } from "../../Helpers/ui/uiAttachmentHelper";
// import {
//   BULK_SUBMIT_INVOICE_TEST_TIMEOUT_MS,
//   runBulkSubmitInvoiceCase,
// } from "../../Helpers/submitInvoiceCaseHelper";
// import { invoiceData } from "../../testData/ui/SubmitInvoice";
// import {
//   UI_ATTACHMENT_INVALID_FORMAT,
//   UI_ATTACHMENT_MULTI_UNDER_LIMIT,
//   UI_ATTACHMENT_POSITIVE_FORMAT_SCENARIOS,
//   UI_ATTACHMENT_REMOVE_NO_SCENARIOS,
//   UI_ATTACHMENT_REMOVE_YES_SCENARIOS,
//   type UiAttachmentAcceptScenario,
// } from "../../testData/ui/uiInvoiceAttachmentScenarios";
// 
// /**
//  * Excel upload â†’ Options â†’ Edit â†’ section **7. Attachment Details**
//  * (formats / multi / 10 MB / remove / Update+View / submit+delivery).
//  */
// test.describe("Edit Invoice â€” Attachment Details", () => {
//   test.describe.configure({ mode: "parallel" });
// 
//   test(uiAttachmentSectionVisibleTitle(), async ({ page }) => {
//     test.setTimeout(UI_ATTACHMENT_TEST_TIMEOUT_MS);
//     await runUiEditAttachmentSectionVisibleCase(page);
//   });
// 
//   for (const scenario of UI_ATTACHMENT_POSITIVE_FORMAT_SCENARIOS) {
//     test(uiAttachmentListTitle(scenario), async ({ page }) => {
//       test.setTimeout(UI_ATTACHMENT_TEST_TIMEOUT_MS);
//       await runUiEditAttachmentScenario(page, scenario);
//     });
//   }
// 
//   test(uiAttachmentListTitle(UI_ATTACHMENT_MULTI_UNDER_LIMIT), async ({ page }) => {
//     test.setTimeout(UI_ATTACHMENT_TEST_TIMEOUT_MS);
//     await runUiEditAttachmentScenario(page, UI_ATTACHMENT_MULTI_UNDER_LIMIT);
//   });
// 
//   for (const scenario of UI_ATTACHMENT_REMOVE_YES_SCENARIOS) {
//     test(uiAttachmentRemoveTitle(scenario, "Yes"), async ({ page }) => {
//       test.setTimeout(UI_ATTACHMENT_TEST_TIMEOUT_MS);
//       await runUiEditAttachmentRemoveCase(page, scenario, "Yes");
//     });
//   }
// 
//   for (const scenario of UI_ATTACHMENT_REMOVE_NO_SCENARIOS) {
//     test(uiAttachmentRemoveTitle(scenario, "No"), async ({ page }) => {
//       test.setTimeout(UI_ATTACHMENT_TEST_TIMEOUT_MS);
//       await runUiEditAttachmentRemoveCase(page, scenario, "No");
//     });
//   }
// 
//   for (const scenario of UI_ATTACHMENT_POSITIVE_FORMAT_SCENARIOS) {
//     if (scenario.expect !== "accept") continue;
//     const accept = scenario as UiAttachmentAcceptScenario;
//     test(uiAttachmentPersistTitle(accept), async ({ page }) => {
//       test.setTimeout(UI_ATTACHMENT_PERSIST_TIMEOUT_MS);
//       await runUiEditAttachmentPersistAndViewCase(page, accept);
//     });
//   }
// 
//   test(
//     uiAttachmentPersistTitle(UI_ATTACHMENT_MULTI_UNDER_LIMIT as UiAttachmentAcceptScenario),
//     async ({ page }) => {
//       test.setTimeout(UI_ATTACHMENT_PERSIST_TIMEOUT_MS);
//       await runUiEditAttachmentPersistAndViewCase(
//         page,
//         UI_ATTACHMENT_MULTI_UNDER_LIMIT as UiAttachmentAcceptScenario
//       );
//     }
//   );
// 
//   test(uiAttachmentListTitle(UI_ATTACHMENT_INVALID_FORMAT), async ({ page }) => {
//     test.setTimeout(UI_ATTACHMENT_TEST_TIMEOUT_MS);
//     await runUiEditAttachmentScenario(page, UI_ATTACHMENT_INVALID_FORMAT);
//   });
// 
//   test.describe("10 MB size limit", () => {
//     test(
//       "Verify Edit Invoice attachment with a single ~9.5 MB file under 10 MB is accepted and the attachment should be listed.",
//       async ({ page }) => {
//         test.setTimeout(UI_ATTACHMENT_SIZE_TIMEOUT_MS);
//         await runUiEditAttachmentNearLimitSingleCase(page);
//       }
//     );
// 
//     test(
//       "Verify Edit Invoice attachment with a single exactly 10 MB file is accepted and the attachment should be listed.",
//       async ({ page }) => {
//         test.setTimeout(UI_ATTACHMENT_SIZE_TIMEOUT_MS);
//         await runUiEditAttachmentAtLimitSingleCase(page);
//       }
//     );
// 
//     test(
//       "Verify Edit Invoice attachment with multiple files combined ~9 MB under 10 MB is accepted and the attachments should be listed.",
//       async ({ page }) => {
//         test.setTimeout(UI_ATTACHMENT_SIZE_TIMEOUT_MS);
//         await runUiEditAttachmentNearLimitMultiCase(page);
//       }
//     );
// 
//     test(
//       "Verify Edit Invoice attachment with a single file over 10 MB is rejected and an error should be shown.",
//       async ({ page }) => {
//         test.setTimeout(UI_ATTACHMENT_SIZE_TIMEOUT_MS);
//         await runUiEditAttachmentOversizeCase(page);
//       }
//     );
// 
//     test(
//       "Verify Edit Invoice attachment with multiple files combined over 10 MB is rejected and an error should be shown.",
//       async ({ page }) => {
//         test.setTimeout(UI_ATTACHMENT_SIZE_TIMEOUT_MS);
//         await runUiEditAttachmentCombinedOversizeCase(page);
//       }
//     );
// 
//     test(
//       uiAttachmentPersistTitle("a single ~9.5 MB file"),
//       async ({ page }) => {
//         test.setTimeout(UI_ATTACHMENT_PERSIST_TIMEOUT_MS);
//         await runUiEditAttachmentNearLimitSinglePersistCase(page);
//       }
//     );
// 
//     test(
//       uiAttachmentPersistTitle("multiple files combined ~9 MB"),
//       async ({ page }) => {
//         test.setTimeout(UI_ATTACHMENT_PERSIST_TIMEOUT_MS);
//         await runUiEditAttachmentNearLimitMultiPersistCase(page);
//       }
//     );
//   });
// 
//   test.describe("submit + delivery", () => {
//     for (const scenario of UI_ATTACHMENT_POSITIVE_FORMAT_SCENARIOS) {
//       if (scenario.expect !== "accept") continue;
//       const accept = scenario as UiAttachmentAcceptScenario;
//       test(uiAttachmentSubmitTitle(accept), async ({ page }) => {
//         test.setTimeout(UI_ATTACHMENT_SUBMIT_TIMEOUT_MS);
//         await runUiEditAttachmentSubmitCase(page, accept);
//       });
//     }
// 
//     test(
//       uiAttachmentSubmitTitle(UI_ATTACHMENT_MULTI_UNDER_LIMIT as UiAttachmentAcceptScenario),
//       async ({ page }) => {
//         test.setTimeout(UI_ATTACHMENT_SUBMIT_TIMEOUT_MS);
//         await runUiEditAttachmentMultiSubmitCase(page);
//       }
//     );
// 
//     test(
//       uiAttachmentSubmitTitle("a single exactly 10 MB file"),
//       async ({ page }) => {
//         test.setTimeout(UI_ATTACHMENT_LARGE_SUBMIT_TIMEOUT_MS);
//         await runUiEditAttachmentAtLimitSubmitCase(page);
//       }
//     );
// 
//     for (const scenario of UI_ATTACHMENT_POSITIVE_FORMAT_SCENARIOS) {
//       if (scenario.expect !== "accept") continue;
//       const accept = scenario as UiAttachmentAcceptScenario;
//       test(uiAttachmentSubmitAsPdfTitle(accept), async ({ page }) => {
//         test.setTimeout(UI_ATTACHMENT_SUBMIT_TIMEOUT_MS);
//         await runUiEditAttachmentSubmitCase(page, accept, {
//           submitAction: "Submit as PDF",
//         });
//       });
//     }
// 
//     test(
//       uiAttachmentSubmitAsPdfTitle(UI_ATTACHMENT_MULTI_UNDER_LIMIT as UiAttachmentAcceptScenario),
//       async ({ page }) => {
//         test.setTimeout(UI_ATTACHMENT_SUBMIT_TIMEOUT_MS);
//         await runUiEditAttachmentMultiSubmitAsPdfCase(page);
//       }
//     );
// 
//     test(
//       uiAttachmentSubmitAsPdfTitle("a single exactly 10 MB file"),
//       async ({ page }) => {
//         test.setTimeout(UI_ATTACHMENT_LARGE_SUBMIT_TIMEOUT_MS);
//         await runUiEditAttachmentAtLimitSubmitAsPdfCase(page);
//       }
//     );
// 
//     test(uiAttachmentBulkSubmitTitle(5, "Submit"), async ({ page }) => {
//       test.setTimeout(BULK_SUBMIT_INVOICE_TEST_TIMEOUT_MS);
//       const row = invoiceData[0] as Record<string, string>;
//       await runBulkSubmitInvoiceCase(page, row, { invoiceCount: 5 });
//     });
// 
//     test(uiAttachmentBulkSubmitTitle(5, "Submit as PDF"), async ({ page }) => {
//       test.setTimeout(BULK_SUBMIT_INVOICE_TEST_TIMEOUT_MS);
//       const row = invoiceData[0] as Record<string, string>;
//       await runBulkSubmitInvoiceCase(page, row, {
//         invoiceCount: 5,
//         bulkAction: "Submit as PDF",
//       });
//     });
//   });
// });
