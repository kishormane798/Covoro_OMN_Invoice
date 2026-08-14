// UI SUITE DISABLED FOR OMN — entire file commented out (do not execute)
// import { expect } from "@playwright/test";
// import { test } from "../../Src/baseTest";
// import {
//   runUiInvoiceCreationBuyerDropdownsSaveCase,
//   runUiInvoiceCreationItemDropdownsSaveCase,
// } from "../../Helpers/ui/uiDropdownHelper";
// import {
//   runUiInvoiceCreationAngleBracketCase,
//   runUiInvoiceCreationMinMaxCase,
// } from "../../Helpers/ui/uiMinMaxHelper";
// import { runUiInvoiceCreationFormulaScenario } from "../../Helpers/ui/uiInvoiceCreationFormulaHelper";
// import { runUiInvoiceCreationConditionalScenario } from "../../Helpers/ui/uiInvoiceCreationConditionalHelper";
// import {
//   runUiDisclosedAgentPrincipleIdScenario,
//   runUiFrequencyOfBillingInvoiceNoteScenario,
//   runUiPaymentMeansAccountIdentifierScenario,
//   isUiFrequencyBillingScenarioRunnable,
// } from "../../Helpers/ui/uiInvoiceCreationConditional2Helper";
// import {
//   openCopyBaselineFromStatus,
//   openCopyBaselineInvoiceAndEditor,
// } from "../../Helpers/ui/uiInvoiceEditEntryHelper";
// import { DashboardPage } from "../../pageObjects/OMN_DashboardPage";
// import {
//   uiAngleBracketTestTitle,
//   uiConditionalScenarioTitle,
//   uiFormulaTestTitle,
//   uiMinMaxTestTitle,
//   uiTestTitle,
// } from "../../Helpers/ui/uiTestTitle";
// import {
//   CREATE_INVOICE_SECTION_AREAS,
//   CREATE_INVOICE_SECTION_LABELS,
//   CREATE_INVOICE_VALIDATION_SECTION_ORDER,
//   createInvoiceMinMaxRulesForSection,
//   uiInvoiceConditionalTestTimeoutMs,
// } from "../../testData/ui/uiInvoiceCreationConfig";
// import { createInvoiceAngleBracketRulesForSection } from "../../testData/ui/uiInvoiceCreationAngleBracketValidation";
// import {
//   CREATE_INVOICE_AUTHORITY_NAME_RULE,
//   CREATE_INVOICE_INVOICING_PERIOD_RULE,
//   groupCreateInvoiceConditionalScenariosBySection,
// } from "../../testData/ui/uiInvoiceCreationConditionalValidation";
// import { CREATE_INVOICE_DISCLOSED_AGENT_SCENARIOS } from "../../testData/ui/uiInvoiceCreationDisclosedAgent";
// import {
//   CREATE_INVOICE_FORMULA_SCENARIOS,
//   CURRENCY_SUITES,
//   isScenarioApplicableForMode,
// } from "../../testData/ui/uiInvoiceCreationFormulaValidation";
// import {
//   UI_MASTER_MIN_MAX_VARIANTS,
//   uiMinMaxCondition,
//   uiMinMaxTestOutcome,
// } from "../../testData/ui/uiMasterFieldMinMax";
// import {
//   FREQUENCY_OF_BILLING_INVOICE_NOTE_SCENARIOS,
//   INVOICE_TRANSACTION_TYPE_CODE_BENEFICIARY_OPTIONAL,
//   INVOICE_TRANSACTION_TYPE_CODE_DISCLOSED_AGENT_BILLING,
//   PAYMENT_MEANS_ACCOUNT_IDENTIFIER_SCENARIOS,
// } from "../../testData/ui/ConditionalValidation";
// 
// const HEADING = "Copy Invoice UI";
// const ENTRY = "copy" as const;
// 
// test.describe(`${HEADING} â€” copy flow`, () => {
//   test.describe.configure({ mode: "parallel" });
// 
//   test(
//     "When editing an invoice, options â†’ Create Copy (No) â€” the user stays on the dashboard list.",
//     async ({ page }) => {
//       const dashboard = new DashboardPage(page);
//       await openCopyBaselineFromStatus(page, "No");
// 
//       await dashboard.waitForEinvoiceDashboardShell(60_000);
//       await expect(page.locator("main.invoice-content-container")).toHaveCount(0);
//     }
//   );
// 
//   test(
//     uiTestTitle(
//       HEADING,
//       "Document",
//       "Options â†’ Create Copy (Yes) without entering invoice number or issue date",
//       "editor visible"
//     ),
//     async ({ page }) => {
//       const { invoice } = await openCopyBaselineInvoiceAndEditor(page);
//       await invoice.expectCreateInvoiceEditorLoaded();
//       await invoice.expectDocumentDetailsVisible();
//     }
//   );
// 
//   test(
//     "When editing an invoice, in the Document section, invoice number empty â€” the form should show a field error.",
//     async ({ page }) => {
//       const { invoice } = await openCopyBaselineInvoiceAndEditor(page);
//       const dashboard = new DashboardPage(page);
// 
//       await invoice.ensureDocumentEditable();
//       await invoice.fillDocumentRequiredFields(["invNum"]);
//       await invoice.replaceInputById("invNum", "");
//       await invoice.clickDocumentSave();
// 
//       const message = await dashboard.readVisibleEditValidationMessageWithFallback();
//       expect(message).toBeTruthy();
//     }
//   );
// 
//   test(
//     "When editing an invoice, in the Document section, invoice issue date empty â€” the form should show a field error.",
//     async ({ page }) => {
//       const { invoice } = await openCopyBaselineInvoiceAndEditor(page);
//       const dashboard = new DashboardPage(page);
// 
//       await invoice.ensureDocumentEditable();
//       await invoice.fillDocumentRequiredFields(["invIssueDate", "invDate"]);
//       try {
//         await invoice.clearDocumentDateById("invIssueDate");
//       } catch {
//         await invoice.clearDocumentDateById("invDate");
//       }
//       await invoice.clickDocumentSave();
// 
//       const message = await dashboard.readVisibleEditValidationMessageWithFallback();
//       expect(message).toBeTruthy();
//     }
//   );
// });
// 
// test.describe(`${HEADING} â€” field validation`, () => {
//   test.describe.configure({
//     mode: "parallel",
//     timeout: uiInvoiceConditionalTestTimeoutMs(ENTRY),
//   });
// 
//   test(uiTestTitle(HEADING, "Navigation", "opening Copy from dashboard Options", "editor visible"), async ({
//     page,
//   }) => {
//     const { invoice } = await openCopyBaselineInvoiceAndEditor(page);
//     await invoice.expectCreateInvoiceEditorLoaded();
//     await invoice.expectDocumentDetailsVisible();
//   });
// 
//   for (const section of CREATE_INVOICE_VALIDATION_SECTION_ORDER) {
//     const label = CREATE_INVOICE_SECTION_LABELS[section];
//     const rules = createInvoiceMinMaxRulesForSection(section);
//     const sectionArea = CREATE_INVOICE_SECTION_AREAS[section];
//     const { invoicingPeriod, authority, other } =
//       groupCreateInvoiceConditionalScenariosBySection(section);
// 
//     test.describe(label, () => {
//       if (section !== "invoice" && section !== "document") {
//         test(uiTestTitle(HEADING, sectionArea, "opening the section editor", "editor visible"), async ({
//           page,
//         }) => {
//           const { invoice } = await openCopyBaselineInvoiceAndEditor(page);
//           await invoice.enterSectionEditor(section);
//         });
//       }
// 
//       if (section === "document") {
//         test(uiTestTitle(HEADING, "Document", "opening the document editor", "document fields visible"), async ({
//           page,
//         }) => {
//           const { invoice } = await openCopyBaselineInvoiceAndEditor(page);
//           await invoice.enterSectionEditor("document");
//         });
//       }
// 
//       if (rules.length > 0) {
//         test.describe("Min/max length", () => {
//           for (const config of rules) {
//             for (const variant of UI_MASTER_MIN_MAX_VARIANTS) {
//               const outcome = uiMinMaxTestOutcome(config, variant);
//               test(
//                 uiMinMaxTestTitle(
//                   HEADING,
//                   sectionArea,
//                   config.excelField,
//                   uiMinMaxCondition(variant, config),
//                   outcome === "field error"
//                 ),
//                 async ({ page }) => {
//                   await runUiInvoiceCreationMinMaxCase(page, config, variant, { entry: ENTRY });
//                 }
//               );
//             }
//           }
//         });
//       }
// 
//       const angleBracketRules = createInvoiceAngleBracketRulesForSection(section);
//       if (angleBracketRules.length > 0) {
//         test.describe("Angle brackets not allowed", () => {
//           for (const config of angleBracketRules) {
//             test(
//               uiAngleBracketTestTitle(HEADING, sectionArea, config.excelField),
//               async ({ page }) => {
//                 await runUiInvoiceCreationAngleBracketCase(page, config, { entry: ENTRY });
//               }
//             );
//           }
//         });
//       }
// 
//       if (section === "buyer") {
//         test(uiTestTitle(HEADING, "Buyer", "all dropdowns are selected", "Save succeeds"), async ({
//           page,
//         }) => {
//           await runUiInvoiceCreationBuyerDropdownsSaveCase(page, { entry: ENTRY });
//         });
//       }
// 
//       if (section === "item") {
//         test(uiTestTitle(HEADING, "Item", "all dropdowns are selected", "Save succeeds"), async ({
//           page,
//         }) => {
//           await runUiInvoiceCreationItemDropdownsSaveCase(page, { entry: ENTRY });
//         });
// 
//         test.describe("Formula auto-calculation", () => {
//           for (const { mode, label: currencyLabel } of CURRENCY_SUITES) {
//             const currency = currencyLabel.includes("AED") ? "AED" : "USD";
//             test.describe(currencyLabel, () => {
//               for (const scenario of CREATE_INVOICE_FORMULA_SCENARIOS) {
//                 if (!isScenarioApplicableForMode(mode, scenario)) continue;
//                 test(uiFormulaTestTitle(HEADING, scenario.name, currency), async ({ page }) => {
//                   await runUiInvoiceCreationFormulaScenario(page, mode, scenario, { entry: ENTRY });
//                 });
//               }
//             });
//           }
//         });
//       }
// 
//       if (invoicingPeriod.length > 0) {
//         test.describe(
//           `Invoicing period vs transaction type â€” ${CREATE_INVOICE_INVOICING_PERIOD_RULE}`,
//           () => {
//             for (const scenario of invoicingPeriod) {
//               test(
//                 uiConditionalScenarioTitle(
//                   HEADING,
//                   sectionArea,
//                   scenario,
//                   "invoicing period vs transaction type"
//                 ),
//                 async ({ page }) => {
//                   await runUiInvoiceCreationConditionalScenario(page, scenario, { entry: ENTRY });
//                 }
//               );
//             }
//           }
//         );
//       }
// 
//       if (authority.length > 0) {
//         test.describe(`Authority name â€” ${CREATE_INVOICE_AUTHORITY_NAME_RULE}`, () => {
//           for (const scenario of authority) {
//             test(
//               uiConditionalScenarioTitle(HEADING, sectionArea, scenario, "authority name"),
//               async ({ page }) => {
//                 await runUiInvoiceCreationConditionalScenario(page, scenario, { entry: ENTRY });
//               }
//             );
//           }
//         });
//       }
// 
//       if (other.length > 0) {
//         test.describe("Conditional validation â€” other rules", () => {
//           for (const scenario of other) {
//             test(uiConditionalScenarioTitle(HEADING, sectionArea, scenario), async ({ page }) => {
//               await runUiInvoiceCreationConditionalScenario(page, scenario, { entry: ENTRY });
//             });
//           }
//         });
//       }
//     });
//   }
// });
// 
// test.describe(`${HEADING} â€” conditional validation (suite 2)`, () => {
//   test.describe.configure({
//     mode: "parallel",
//     timeout: uiInvoiceConditionalTestTimeoutMs(ENTRY),
//   });
// 
//   test.describe("Disclosed agent principle ID", () => {
//     for (const scenario of CREATE_INVOICE_DISCLOSED_AGENT_SCENARIOS) {
//       test(
//         uiConditionalScenarioTitle(HEADING, "Document", scenario, "Disclosed agent principle ID"),
//         async ({ page }) => {
//           await runUiDisclosedAgentPrincipleIdScenario(page, scenario, { entry: ENTRY });
//         }
//       );
//     }
//   });
// 
//   test.describe("Frequency of billing vs invoice note", () => {
//     for (const scenario of FREQUENCY_OF_BILLING_INVOICE_NOTE_SCENARIOS.filter(
//       isUiFrequencyBillingScenarioRunnable
//     )) {
//       test(
//         uiConditionalScenarioTitle(HEADING, "Document", scenario, "Frequency of billing vs invoice note"),
//         async ({ page }) => {
//           await runUiFrequencyOfBillingInvoiceNoteScenario(page, scenario, { entry: ENTRY });
//         }
//       );
//     }
//   });
// 
//   test.describe("Payment means type vs payment account identifier", () => {
//     for (const scenario of PAYMENT_MEANS_ACCOUNT_IDENTIFIER_SCENARIOS) {
//       test(
//         uiConditionalScenarioTitle(
//           HEADING,
//           "Payment",
//           scenario,
//           "Payment means type vs payment account identifier"
//         ),
//         async ({ page }) => {
//           await runUiPaymentMeansAccountIdentifierScenario(page, scenario, { entry: ENTRY });
//         }
//       );
//     }
//   });
// 
//   test.describe("Config check â€” transaction type constants", () => {
//     test("Copy Invoice config: disclosed-agent and beneficiary transaction type constants should be defined.", async () => {
//       expect(INVOICE_TRANSACTION_TYPE_CODE_DISCLOSED_AGENT_BILLING).toBeTruthy();
//       expect(INVOICE_TRANSACTION_TYPE_CODE_BENEFICIARY_OPTIONAL).toBeTruthy();
//     });
//   });
// });
