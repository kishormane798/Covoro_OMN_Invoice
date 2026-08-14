// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under a ui/ subfolder; executable code is commented out.
//
// /** Flow label for Create / Edit Invoice UI Playwright test titles. */
// export type UiInvoiceFlow = "Create Invoice UI" | "Edit Invoice UI" | "Copy Invoice UI";
// 
// export type UiTestOutcome =
//   | "field error"
//   | "accepted"
//   | "Save succeeds"
//   | "editor visible"
//   | "document fields visible"
//   | "totals match on screen"
//   | "delivered";
// 
// function flowPhrase(flow: UiInvoiceFlow): string {
//   if (flow === "Create Invoice UI") {
//     return "When creating an invoice";
//   }
//   if (flow === "Copy Invoice UI") {
//     return "When copying an invoice";
//   }
//   return "When editing an invoice";
// }
// 
// function outcomePhrase(outcome: UiTestOutcome): string {
//   switch (outcome) {
//     case "field error":
//       return "the form should show a field error";
//     case "accepted":
//       return "the value should be accepted";
//     case "Save succeeds":
//       return "Save should succeed";
//     case "editor visible":
//       return "the invoice editor should load";
//     case "document fields visible":
//       return "document fields should be visible";
//     case "totals match on screen":
//       return "on-screen totals should match the formula";
//     case "delivered":
//       return "the invoice should be delivered";
//   }
// }
// 
// function sectionPhrase(section: string): string {
//   if (section === "Navigation") {
//     return "";
//   }
//   return `in the ${section} section`;
// }
// 
// function shortRuleLabel(rule?: string): string | undefined {
//   if (!rule?.trim()) {
//     return undefined;
//   }
//   const trimmed = rule.trim();
//   if (trimmed.length <= 72) {
//     return trimmed;
//   }
//   const firstSentence = trimmed.split(/[.;]/)[0]?.trim();
//   return firstSentence && firstSentence.length <= 72 ? firstSentence : `${trimmed.slice(0, 69)}â€¦`;
// }
// 
// /**
//  * Readable Playwright title as a full sentence.
//  *
//  * Example: "When creating an invoice, in the Buyer section, with all dropdowns selected â€” Save should succeed."
//  */
// export function uiTestTitle(
//   flow: UiInvoiceFlow,
//   section: string,
//   condition: string,
//   outcome: UiTestOutcome,
//   rule?: string
// ): string {
//   const parts = [flowPhrase(flow)];
//   const sectionPart = sectionPhrase(section);
//   if (sectionPart) {
//     parts.push(sectionPart);
//   }
//   const ruleLabel = shortRuleLabel(rule);
//   if (ruleLabel) {
//     parts.push(`(${ruleLabel})`);
//   }
//   const when = normalizeUiTestCondition(condition);
//   parts.push(when.charAt(0).toLowerCase() + when.slice(1));
//   return `${parts.join(", ")} â€” ${outcomePhrase(outcome)}.`;
// }
// 
// /** Min/max field validation title as a sentence. */
// export function uiMinMaxTestTitle(
//   flow: UiInvoiceFlow,
//   section: string,
//   field: string,
//   lengthCondition: string,
//   expectsError: boolean
// ): string {
//   const expect = expectsError
//     ? "the form should show a field error"
//     : "the value should be accepted";
//   return (
//     `${flowPhrase(flow)}, in the ${section} section, ` +
//     `${field} at ${lengthCondition} â€” ${expect}.`
//   );
// }
// 
// /** Free-text angle-bracket (`<>`) negative validation title. */
// export function uiAngleBracketTestTitle(
//   flow: UiInvoiceFlow,
//   section: string,
//   field: string
// ): string {
//   return (
//     `${flowPhrase(flow)}, in the ${section} section, ` +
//     `${field} with angle brackets <> â€” the form should show a field error.`
//   );
// }
// 
// /** Formula auto-calculation title as a sentence. */
// export function uiFormulaTestTitle(
//   flow: UiInvoiceFlow,
//   scenarioName: string,
//   currency: string
// ): string {
//   return (
//     `${flowPhrase(flow)}, in the Item section, ` +
//     `formula "${scenarioName}" with ${currency} â€” on-screen totals should match the formula.`
//   );
// }
// 
// /** Conditional scenario from Excel-aligned test data (`title` + `shouldError`). */
// export function uiConditionalScenarioTitle(
//   flow: UiInvoiceFlow,
//   section: string,
//   scenario: { title: string; shouldError: boolean },
//   rule?: string
// ): string {
//   const parts = [flowPhrase(flow), `in the ${section} section`];
//   const ruleLabel = shortRuleLabel(rule);
//   if (ruleLabel) {
//     parts.push(`(${ruleLabel})`);
//   }
//   const condition = humanizeExcelScenarioTitle(scenario.title);
//   parts.push(condition);
//   const expect = scenario.shouldError
//     ? "the form should show a field error"
//     : "the input should be accepted";
//   return `${parts.join(", ")} â€” ${expect}.`;
// }
// 
// /** Strip Excel trace ids and redundant outcome suffixes. */
// export function normalizeUiTestCondition(condition: string): string {
//   return condition
//     .replace(/^TC_\d+\s+/, "")
//     .replace(/\s*\(Not Allowed\)\s*$/i, "")
//     .replace(/\s*\(Allowed\)\s*$/i, "")
//     .replace(/\s*\(invalid\)\s*$/i, "")
//     .replace(/\s*\(valid\)\s*$/i, "")
//     .trim();
// }
// 
// /** Turn Excel matrix titles into a short readable phrase for sentence titles. */
// export function humanizeExcelScenarioTitle(title: string): string {
//   let t = normalizeUiTestCondition(title);
//   t = t.replace(/\s*â€”\s*/g, " and ");
// 
//   t = t.replace(/Invoicing Period Start \[([^\]]+)\]/gi, "invoicing period start is $1");
//   t = t.replace(/Invoicing Period End \[([^\]]+)\]/gi, "invoicing period end is $1");
// 
//   const replacements: ReadonlyArray<[RegExp, string]> = [
//     [/^Invoice Type Code /i, "invoice type is "],
//     [/^Invoice Transaction Type Code /i, "transaction type is "],
//     [/Invoice Currency Code (\w+)/gi, "currency is $1"],
//     [/Exchange Rate Not Required Value Empty/i, "exchange rate is empty (optional)"],
//     [/Exchange Rate Not Required Value Cleared/i, "exchange rate is cleared (optional)"],
//     [/Exchange Rate Required Value Empty/i, "exchange rate is empty"],
//     [/Exchange Rate Required Value Whitespace/i, "exchange rate is whitespace"],
//     [/Exchange Rate Required Invalid Value (\S+)/i, "exchange rate is invalid ($1)"],
//     [/Exchange Rate Required Value ([\d.-]+)/i, "exchange rate is $1"],
//     [/Exchange Rate Required Min Value ([\d.]+)/i, "exchange rate is minimum $1"],
//     [/Exchange Rate Required Max Value ([\d.]+)/i, "exchange rate is maximum $1"],
//     [/Exchange Rate Becomes Required Value Empty/i, "exchange rate becomes required and is empty"],
//     [/Invoice Currency Code Change AED to USD/i, "currency changes from AED to USD"],
//     [/Invoice Currency Code Change USD to AED/i, "currency changes from USD to AED"],
//     [/Payment Due Date Required Value Empty/i, "payment due date is empty"],
//     [/Payment Due Date Required Valid Date ([\d-]+)/i, "payment due date is $1"],
//     [/Payment Due Date Past Date Value ([\d-]+)/i, "payment due date is past date $1"],
//     [/Payment Due Date Future Date Value ([\d-]+)/i, "payment due date is future date $1"],
//     [/Payment Due Date Required Value Whitespace/i, "payment due date is whitespace"],
//     [/Payment Due Date Required Null Value/i, "payment due date is null"],
//     [/Payment Means Type Code ([^,]+?) Payment Account Identifier/i, "payment means is $1 and payment account identifier"],
//     [/Payment Account Identifier Required Value Empty/i, "payment account identifier is empty"],
//     [/Payment Account Identifier Required Value Whitespace/i, "payment account identifier is whitespace"],
//     [/Payment Account Identifier Required Null Value/i, "payment account identifier is null"],
//     [/Payment Account Identifier Becomes Required Value Empty/i, "payment account identifier becomes required and is empty"],
//     [/Principle ID Required Value Empty/i, "principle ID is empty"],
//     [/Principle ID Required Value Whitespace/i, "principle ID is whitespace"],
//     [/Principle ID Required Null Value/i, "principle ID is null"],
//     [/Principle ID Not Required Value Empty/i, "principle ID is empty (optional)"],
//     [/Principle ID Becomes Required Value Empty/i, "principle ID becomes required and is empty"],
//     [/Principle ID Not Required Value Cleared/i, "principle ID is cleared (optional)"],
//     [/Principle ID Value TIN/i, "principle ID is TIN"],
//     [/Principle ID Value TRN/i, "principle ID is TRN"],
//     [/Seller VAT Identifier Value TIN/i, "seller VAT is TIN"],
//     [/Seller VAT Identifier Value TRN/i, "seller VAT is TRN"],
//     [/Same Values/i, "principle ID matches seller VAT"],
//     [/Different Values/i, "principle ID differs from seller VAT"],
//     [/Frequency Of Billing (\w+)/i, "frequency of billing is $1"],
//     [/Invoice Note Required Value Empty/i, "invoice note is empty"],
//     [/Invoice Note Optional Value Empty/i, "invoice note is empty (optional)"],
//     [/Invoice Note Becomes Required Value Empty/i, "invoice note becomes required and is empty"],
//     [/Invoice Note Required Value Whitespace/i, "invoice note is whitespace"],
//     [/Invoice Note Required Null Value/i, "invoice note is null"],
//     [/Credit Note Reason Code Required Value Empty/i, "credit note reason is empty"],
//     [/Credit Note Reason Code Required Value Whitespace/i, "credit note reason is whitespace"],
//     [/Credit Note Reason Code Required Null Value/i, "credit note reason is null"],
//     [/Credit Note Reason Code Required Invalid Value /i, "credit note reason is invalid: "],
//     [/Credit Note Reason Code Required Value /i, "credit note reason is "],
//     [/Authority Name Required Value Empty/i, "authority name is empty"],
//     [/Authority Name Required Value Whitespace/i, "authority name is whitespace"],
//     [/Authority Name Required Value /i, "authority name is "],
//     [/Invoicing Period Start Date Value Empty/i, "invoicing period start is empty"],
//     [/Invoicing Period End Date Value Empty/i, "invoicing period end is empty"],
//     [/Changed From ([^]+?) To /i, "changed from $1 to "],
//     [/Required Value Empty/i, "is empty"],
//     [/Required Value Whitespace/i, "is whitespace"],
//     [/Required Null Value/i, "is null"],
//     [/Optional Value Empty/i, "is empty (optional)"],
//     [/Not Required Value Empty/i, "is empty (optional)"],
//     [/Not Required Value Cleared/i, "is cleared (optional)"],
//     [/Required Min Length Value /i, "minimum length "],
//     [/Required Max Length Value /i, "maximum length "],
//     [/Required Exceed Max Length Value /i, "exceeds maximum length "],
//     [/Required Value Special Characters /i, "value with special characters "],
//     [/Required Value Numeric /i, "numeric value "],
//     [/Required Value Alphanumeric /i, "alphanumeric value "],
//   ];
// 
//   for (const [pattern, replacement] of replacements) {
//     t = t.replace(pattern, replacement);
//   }
// 
//   t = t.replace(/currency is (\w+) exchange rate/gi, "currency is $1, exchange rate");
//   t = t.replace(/\s+/g, " ").trim();
//   if (!/^when /i.test(t)) {
//     t = `when ${t.charAt(0).toLowerCase()}${t.slice(1)}`;
//   }
//   return t;
// }
