// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under a ui/ subfolder; executable code is commented out.
//
// import type { Page } from "@playwright/test";
// import {
//   buildFormulaExcelPayload,
//   DEFAULT_FOREIGN_EXCHANGE_RATE,
//   FOREIGN_CURRENCY_CODE,
//   type CurrencyMode,
//   type FormulaScenarioRow,
// } from "./formulaValidationHelper";
// import { calculateInvoiceValuesForGeneratorPayload } from "../utils/invoiceExcel";
// import { UIInvoiceCreationManualPage } from "../pageObjects/OMN_UIInvoiceCreationManualPage";
// import {
//   CREATE_INVOICE_FORMULA_INPUT_CANDIDATES,
//   CREATE_INVOICE_INVOICE_FORMULA_INPUT_KEYS,
//   CREATE_INVOICE_ITEM_FORMULA_INPUT_KEYS,
//   UI_INVOICE_FORMULA_CALCULATED_TARGETS,
//   type UiInvoiceCalculatedTarget,
// } from "../../testData/ui/uiInvoiceCreationFormulaValidation";
// import {
//   DEFAULT_UI_MASTER_CLASSIFICATION_SCHEME,
//   DEFAULT_UI_MASTER_ITEM_TAX_CATEGORY,
//   UI_MASTER_DEFAULT_CLASSIFICATION_IDENTIFIER,
//   UI_MASTER_ITEM_TYPE_GOODS,
// } from "./uiMasterItemTestData";
// import {
//   isUiPrefilledLineItemEntry,
//   openInvoiceForConditionalFlow,
//   type UiConditionalEntry,
// } from "./uiInvoiceEditEntryHelper";
// 
// const CALC_SETTLE_MS = 600;
// 
// /** UI vs Excel generator can differ by one cent on tax totals (e.g. 4999.41 vs 4999.42). */
// const UI_FORMULA_AMOUNT_PRECISION = 1;
// 
// /** Item modal amounts shown in invoice currency when document currency is not AED. */
// const ITEM_AMOUNT_IN_INVOICE_CURRENCY = new Set([
//   "vatLineAmt",
//   "invLineAmt",
//   "taxRateDtls[0].taxAmt",
// ]);
// 
// function formatAmount(n: number): string {
//   return n.toFixed(2);
// }
// 
// function toFillString(value: unknown): string | null {
//   if (value === null || value === undefined) return null;
//   return String(value);
// }
// 
// export async function runUiInvoiceCreationFormulaScenario(
//   page: Page,
//   mode: CurrencyMode,
//   row: FormulaScenarioRow,
//   options?: { entry?: UiConditionalEntry }
// ): Promise<void> {
//   const entry = options?.entry ?? "create";
//   const payload = buildFormulaExcelPayload(row, mode);
//   const expected = calculateInvoiceValuesForGeneratorPayload(payload);
//   const invoice = await openInvoiceForConditionalFlow(page, entry);
// 
//   await applyDocumentCurrency(invoice, mode, payload);
//   await fillItemFormulaInputs(invoice, payload, entry);
//   await invoice.waitForItemCalculatedFieldsSettle(CALC_SETTLE_MS);
// 
//   const itemTargets = UI_INVOICE_FORMULA_CALCULATED_TARGETS.filter((t) => t.scope === "item");
//   for (const target of itemTargets) {
//     if (target.foreignOnly && mode === "aed") continue;
//     await assertCalculatedTarget(invoice, target, expected, "item", mode);
//   }
// 
//   await persistItemFormulaLine(invoice, entry);
//   await invoice.waitForItemCalculatedFieldsSettle(CALC_SETTLE_MS);
// 
//   await invoice.openInvoiceEditor();
//   await fillInvoiceFormulaInputs(invoice, payload);
//   await invoice.waitForItemCalculatedFieldsSettle(CALC_SETTLE_MS);
// 
//   const invoiceTargets = UI_INVOICE_FORMULA_CALCULATED_TARGETS.filter((t) => t.scope === "invoice");
//   for (const target of invoiceTargets) {
//     if (target.foreignOnly && mode === "aed") continue;
//     await assertCalculatedTarget(invoice, target, expected, "invoice", mode);
//   }
// }
// 
// function expectedFormulaAmount(
//   mode: CurrencyMode,
//   target: UiInvoiceCalculatedTarget,
//   calc: ReturnType<typeof calculateInvoiceValuesForGeneratorPayload>
// ): number | null {
//   const aedValue = target.pickCorrect(calc);
//   if (aedValue === null || Number.isNaN(Number(aedValue))) {
//     return null;
//   }
//   if (mode === "aed" || !target.inputId || !ITEM_AMOUNT_IN_INVOICE_CURRENCY.has(target.inputId)) {
//     return Number(aedValue);
//   }
//   if (target.inputId === "vatLineAmt" || target.inputId === "taxRateDtls[0].taxAmt") {
//     const local = calc.vatLineAmount;
//     return local === null || Number.isNaN(Number(local)) ? null : Number(local);
//   }
//   if (target.inputId === "invLineAmt") {
//     const local = calc.invoiceLineAmount;
//     return local === null || Number.isNaN(Number(local)) ? null : Number(local);
//   }
//   return Number(aedValue);
// }
// 
// async function persistItemFormulaLine(
//   invoice: UIInvoiceCreationManualPage,
//   entry: UiConditionalEntry
// ): Promise<void> {
//   if (isUiPrefilledLineItemEntry(entry)) {
//     await invoice.clickItemSectionSave();
//   } else {
//     await invoice.clickItemModalAdd();
//   }
//   await invoice.ensureItemAddFormClosed();
// }
// 
// async function applyDocumentCurrency(
//   invoice: UIInvoiceCreationManualPage,
//   mode: CurrencyMode,
//   payload: Record<string, unknown>
// ): Promise<void> {
//   await invoice.ensureDocumentEditable();
//   await invoice.focusSection("document");
//   if (mode === "aed") {
//     await invoice.applyDocumentCurrencyAndExchangeRate("AED", "");
//     return;
//   }
// 
//   const code = String(payload.invoiceCurrencyCode ?? FOREIGN_CURRENCY_CODE);
//   const rate = payload.currencyRate ?? DEFAULT_FOREIGN_EXCHANGE_RATE;
//   await invoice.applyDocumentCurrencyAndExchangeRate(code, String(rate));
// }
// 
// async function fillItemFormulaInputs(
//   invoice: UIInvoiceCreationManualPage,
//   payload: Record<string, unknown>,
//   entry: UiConditionalEntry
// ): Promise<void> {
//   if (isUiPrefilledLineItemEntry(entry)) {
//     await invoice.openItemRowEdit(0);
//   } else {
//     await invoice.openItemEditor();
//     await invoice.fillItemBaseline();
//   }
// 
//   await invoice.selectItemType(UI_MASTER_ITEM_TYPE_GOODS);
//   await invoice.selectClassificationScheme(DEFAULT_UI_MASTER_CLASSIFICATION_SCHEME);
//   await invoice.fillInputById(
//     "classificationIdentifier",
//     UI_MASTER_DEFAULT_CLASSIFICATION_IDENTIFIER
//   );
//   await invoice.selectAutocompleteById(
//     "taxRateDtls[0].taxCategory",
//     DEFAULT_UI_MASTER_ITEM_TAX_CATEGORY
//   );
// 
//   for (const [key, candidates] of Object.entries(CREATE_INVOICE_FORMULA_INPUT_CANDIDATES)) {
//     if (!CREATE_INVOICE_ITEM_FORMULA_INPUT_KEYS.has(key)) continue;
//     if (!Object.prototype.hasOwnProperty.call(payload, key)) continue;
//     const value = toFillString(payload[key]);
//     if (value === null) {
//       await invoice.clearFirstAvailableId(candidates);
//     } else {
//       await invoice.fillFirstAvailableId(candidates, value);
//     }
//     if (key === "lineAllowance" || key === "lineCharge" || key === "invoicedQty") {
//       await invoice.waitForItemCalculatedFieldsSettle(CALC_SETTLE_MS);
//     }
//   }
// 
//   await invoice.blurActiveElement();
// }
// 
// async function fillInvoiceFormulaInputs(
//   invoice: UIInvoiceCreationManualPage,
//   payload: Record<string, unknown>
// ): Promise<void> {
//   for (const [key, candidates] of Object.entries(CREATE_INVOICE_FORMULA_INPUT_CANDIDATES)) {
//     if (!CREATE_INVOICE_INVOICE_FORMULA_INPUT_KEYS.has(key)) continue;
//     if (!Object.prototype.hasOwnProperty.call(payload, key)) continue;
//     const value = toFillString(payload[key]);
//     if (value === null) {
//       await invoice.clearFirstAvailableId(candidates);
//     } else {
//       await invoice.fillFirstAvailableId(candidates, value);
//     }
//   }
// 
//   await invoice.blurActiveElement();
// }
// 
// /**
//  * Assert one calculated total on the item modal or invoice section.
//  * Skips `totalTaxAmtInTaxAccCurr` when Create Invoice leaves it blank for non-AED currencies.
//  */
// async function assertCalculatedTarget(
//   invoice: UIInvoiceCreationManualPage,
//   target: UiInvoiceCalculatedTarget,
//   expected: ReturnType<typeof calculateInvoiceValuesForGeneratorPayload>,
//   scope: "item" | "invoice",
//   mode: CurrencyMode
// ): Promise<void> {
//   const correct = expectedFormulaAmount(mode, target, expected);
//   if (correct === null || Number.isNaN(Number(correct))) {
//     return;
//   }
// 
//   const expectedStr = formatAmount(correct);
// 
//   const amountAssertOptions = {
//     message: `${target.shortName} should equal ${expectedStr}`,
//     precision: UI_FORMULA_AMOUNT_PRECISION,
//   };
// 
//   if (scope === "item" && target.inputId) {
//     await invoice.expectNumericFieldValue(target.inputId, expectedStr, amountAssertOptions);
//     return;
//   }
// 
//   if (scope === "invoice" && target.inputId) {
//     if (target.inputId === "totalTaxAmtInTaxAccCurr") {
//       const raw = await invoice.readInvoiceNumericFieldValue(target.inputId);
//       const actual = Number(raw.replace(/,/g, ""));
//       if (!raw || !Number.isFinite(actual) || actual === 0) {
//         return;
//       }
//     }
//     await invoice.expectInvoiceNumericFieldValue(target.inputId, expectedStr, amountAssertOptions);
//     return;
//   }
// 
//   if (scope === "invoice" && target.invoiceLabel) {
//     await invoice.expectInvoiceSummaryAmount(target.invoiceLabel, expectedStr, amountAssertOptions);
//   }
// }
