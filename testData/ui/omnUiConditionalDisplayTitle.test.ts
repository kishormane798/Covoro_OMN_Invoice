import { omnUiConditionalDisplayTitle } from "./omnUiInvoiceValidation";

function assert(cond: unknown, message: string): void {
  if (!cond) throw new Error(message);
}

const SOURCE = "Copied invoice number and invoice date are empty until filled";
const EXPECTED =
  "Given a copied invoice — When the copied form opens — Then Invoice Number and Invoice Issue Date should be empty. (Invoice Number, Invoice Issue Date)";

assert(
  omnUiConditionalDisplayTitle("copy", SOURCE) === EXPECTED,
  `Copy identity title mismatch: ${omnUiConditionalDisplayTitle("copy", SOURCE)}`
);
assert(
  omnUiConditionalDisplayTitle("create", SOURCE) === EXPECTED,
  "Create entry must still use the Copy-only special case when the source title matches"
);

console.log("omnUiConditionalDisplayTitle.test.ts ok");
