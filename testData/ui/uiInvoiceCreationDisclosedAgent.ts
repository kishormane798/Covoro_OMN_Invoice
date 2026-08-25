// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under testData/ui/; executable code is commented out.
//
// /**
//  * Create Invoice UI — disclosed agent principle ID scenarios.
//  * Excel matrix titles use placeholder TIN/TRN; Playwright titles use stable worker labels
//  * (must not embed per-worker digits — Playwright discovery vs worker process titles must match).
//  */
//
// import {
//   DISCLOSED_AGENT_PRINCIPLE_ID_SCENARIOS,
//   type DisclosedAgentPrincipleIdScenario,
// } from "../FieldValidations/ConditionalValidation";
// import {
//   electronicTinForParallelIndex,
//   getParallelWorkerIndex,
// } from "../../Helpers/worker/parallelWorkerSubmitIdentity";
//
// /** Local copies — Helpers/uiInvoiceCreationConditional2Helper moved under Helpers/ui (disabled for OMN). */
// function resolveUiSellerVatIdentifier(raw: string): string {
//   const token = raw.trim().toUpperCase();
//   const workerTin = electronicTinForParallelIndex(getParallelWorkerIndex());
//   if (token === "__MW_TIN_VALID__") {
//     return workerTin;
//   }
//   if (token === "__MW_TRN_VALID__") {
//     const slot = getParallelWorkerIndex();
//     return `${workerTin}A${slot}B03`;
//   }
//   return raw;
// }
//
// function isUiWorkerIdentitySellerVatToken(raw: string): boolean {
//   const token = raw.trim().toUpperCase();
//   return token === "__MW_TIN_VALID__" || token === "__MW_TRN_VALID__";
// }
//
// function resolveUiPrincipleId(raw: string, sellerVatIdentifier: string): string {
//   const token = raw.trim().toUpperCase();
//   const workerTin = electronicTinForParallelIndex(getParallelWorkerIndex());
//   const slot = getParallelWorkerIndex();
//   const validTrn = `${workerTin}A${slot}B03`;
//   const otherTinLast = ((slot + 1) % 10).toString();
//   const otherTin = `${workerTin.slice(0, 9)}${otherTinLast}`;
//   const otherTrn = `${workerTin}X${slot}Y03`;
//
//   if (token === "__MATCH_SELLER_VAT__") {
//     return sellerVatIdentifier;
//   }
//   if (token === "__MW_TIN_VALID__") {
//     return workerTin;
//   }
//   if (token === "__MW_TIN_OTHER__") {
//     return otherTin;
//   }
//   if (token === "__MW_TRN_VALID__") {
//     return validTrn;
//   }
//   if (token === "__MW_TRN_OTHER__") {
//     return otherTrn;
//   }
//   return raw;
// }
//
// /** Excel matrix placeholders (not used on Create Invoice UI). */
// export const UI_DISCLOSED_AGENT_EXCEL_TIN = "1234567890";
// export const UI_DISCLOSED_AGENT_EXCEL_TRN = "1234567890ABC03";
// export const UI_DISCLOSED_AGENT_EXCEL_TRN_OTHER = "1234567890XYZ03";
//
// /** Stable Playwright title segments (same on every worker / at discovery time). */
// export const UI_DISCLOSED_AGENT_WORKER_TIN_LABEL = "[worker TIN]";
// export const UI_DISCLOSED_AGENT_WORKER_TRN_LABEL = "[worker TRN]";
// export const UI_DISCLOSED_AGENT_WORKER_TIN_OTHER_LABEL = "[worker TIN other]";
// export const UI_DISCLOSED_AGENT_WORKER_TRN_OTHER_LABEL = "[worker TRN other]";
//
// export type UiDisclosedAgentEnteredValues = {
//   /** Effective Seller VAT Identifier (prefilled worker value when not overwritten). */
//   sellerVatIdentifier: string;
//   /** Value typed into Principle ID when the control is enabled. */
//   principleId: string;
// };
//
// export function uiDisclosedAgentWorkerValues(): {
//   workerTin: string;
//   validTrn: string;
//   otherTin: string;
//   otherTrn: string;
// } {
//   const workerTin = electronicTinForParallelIndex(getParallelWorkerIndex());
//   const slot = getParallelWorkerIndex();
//   const validTrn = `${workerTin}A${slot}B03`;
//   const otherTinLast = ((slot + 1) % 10).toString();
//   const otherTin = `${workerTin.slice(0, 9)}${otherTinLast}`;
//   const otherTrn = `${workerTin}X${slot}Y03`;
//   return { workerTin, validTrn, otherTin, otherTrn };
// }
//
// /** Runtime values entered on Create Invoice (uses current worker slot). */
// export function resolveUiDisclosedAgentEnteredValues(
//   scenario: Pick<DisclosedAgentPrincipleIdScenario, "principleId" | "sellerVatIdentifier">
// ): UiDisclosedAgentEnteredValues {
//   const sellerVatIdentifier = resolveUiSellerVatIdentifier(scenario.sellerVatIdentifier);
//   const principleId = resolveUiPrincipleId(scenario.principleId, sellerVatIdentifier);
//   return { sellerVatIdentifier, principleId };
// }
//
// function replaceLabeledSegment(
//   title: string,
//   label: string,
//   excelValue: string,
//   uiValue: string
// ): string {
//   const needle = `${label} ${excelValue}`;
//   if (!title.includes(needle)) {
//     return title;
//   }
//   return title.replace(needle, `${label} ${uiValue}`);
// }
//
// function uiSellerVatTitleLabel(sellerVatToken: string): string {
//   const token = sellerVatToken.trim().toUpperCase();
//   if (token === "__MW_TRN_VALID__") {
//     return UI_DISCLOSED_AGENT_WORKER_TRN_LABEL;
//   }
//   return UI_DISCLOSED_AGENT_WORKER_TIN_LABEL;
// }
//
// function uiPrincipleIdTitleLabel(
//   principleToken: string,
//   sellerVatToken: string
// ): string | null {
//   const token = principleToken.trim().toUpperCase();
//   if (token === "__MATCH_SELLER_VAT__") {
//     return uiSellerVatTitleLabel(sellerVatToken);
//   }
//   if (token === "__MW_TIN_VALID__") {
//     return UI_DISCLOSED_AGENT_WORKER_TIN_LABEL;
//   }
//   if (token === "__MW_TIN_OTHER__") {
//     return UI_DISCLOSED_AGENT_WORKER_TIN_OTHER_LABEL;
//   }
//   if (token === "__MW_TRN_VALID__") {
//     return UI_DISCLOSED_AGENT_WORKER_TRN_LABEL;
//   }
//   if (token === "__MW_TRN_OTHER__") {
//     return UI_DISCLOSED_AGENT_WORKER_TRN_OTHER_LABEL;
//   }
//   return null;
// }
//
// /**
//  * Remap Excel placeholders to stable worker labels for Playwright `test()` titles.
//  * Actual TIN/TRN per worker are resolved at runtime in `runUiDisclosedAgentPrincipleIdScenario`.
//  */
// export function uiDisclosedAgentScenarioTitle(
//   scenario: DisclosedAgentPrincipleIdScenario
// ): string {
//   const sellerLabel = uiSellerVatTitleLabel(scenario.sellerVatIdentifier);
//   const principleLabel = uiPrincipleIdTitleLabel(
//     scenario.principleId,
//     scenario.sellerVatIdentifier
//   );
//
//   let title = scenario.title;
//
//   if (principleLabel) {
//     title = replaceLabeledSegment(
//       title,
//       "Principle ID Value TRN",
//       UI_DISCLOSED_AGENT_EXCEL_TRN_OTHER,
//       principleLabel
//     );
//     title = replaceLabeledSegment(
//       title,
//       "Principle ID Value TRN",
//       UI_DISCLOSED_AGENT_EXCEL_TRN,
//       principleLabel
//     );
//     title = replaceLabeledSegment(
//       title,
//       "Principle ID Value TIN",
//       UI_DISCLOSED_AGENT_EXCEL_TIN,
//       principleLabel
//     );
//     title = replaceLabeledSegment(
//       title,
//       "Principle ID Not Required Value TIN",
//       UI_DISCLOSED_AGENT_EXCEL_TIN,
//       principleLabel
//     );
//     title = replaceLabeledSegment(
//       title,
//       "Principle ID Not Required Value TRN",
//       UI_DISCLOSED_AGENT_EXCEL_TRN_OTHER,
//       principleLabel
//     );
//     title = replaceLabeledSegment(
//       title,
//       "Principle ID Not Required Value TRN",
//       UI_DISCLOSED_AGENT_EXCEL_TRN,
//       principleLabel
//     );
//   }
//
//   title = replaceLabeledSegment(
//     title,
//     "Seller VAT Identifier Value TRN",
//     UI_DISCLOSED_AGENT_EXCEL_TRN_OTHER,
//     sellerLabel
//   );
//   title = replaceLabeledSegment(
//     title,
//     "Seller VAT Identifier Value TRN",
//     UI_DISCLOSED_AGENT_EXCEL_TRN,
//     sellerLabel
//   );
//   title = replaceLabeledSegment(
//     title,
//     "Seller VAT Identifier Value TIN",
//     UI_DISCLOSED_AGENT_EXCEL_TIN,
//     sellerLabel
//   );
//
//   return title;
// }
//
// export type UiDisclosedAgentPrincipleIdScenario = DisclosedAgentPrincipleIdScenario & {
//   excelTitle: string;
// };
//
// export const CREATE_INVOICE_DISCLOSED_AGENT_SCENARIOS: UiDisclosedAgentPrincipleIdScenario[] =
//   DISCLOSED_AGENT_PRINCIPLE_ID_SCENARIOS.map((scenario) => ({
//     ...scenario,
//     excelTitle: scenario.title,
//     title: uiDisclosedAgentScenarioTitle(scenario),
//   }));
//
// /** Whether seller VAT is left prefilled (worker TIN/TRN) vs explicitly replaced on the UI. */
// export function uiDisclosedAgentSellerVatIsPrefilled(
//   sellerVatToken: string
// ): boolean {
//   return isUiWorkerIdentitySellerVatToken(sellerVatToken);
// }
//
