import {
  classifyMatrixCases,
  conditionalCaseOnSimplified,
  matrixFieldOnSimplified,
} from "./simplifiedValidationMatrixHelper";

function assert(cond: unknown, message: string): void {
  if (!cond) throw new Error(message);
}

assert(
  matrixFieldOnSimplified("Invoice Number") === true,
  "Invoice Number is on Simplified"
);
assert(
  matrixFieldOnSimplified("Seller Name") === true,
  "Seller Name is on Simplified"
);
assert(
  matrixFieldOnSimplified("Buyer Electronic Address") === true,
  "Buyer Electronic Address is on Simplified"
);
assert(
  matrixFieldOnSimplified("Seller Address Line 1") === false,
  "Seller address is full-template only"
);
assert(
  matrixFieldOnSimplified("Buyer VAT identifier") === false,
  "Buyer VAT TIN is full-template only"
);
assert(
  matrixFieldOnSimplified("Scheme Identifier") === false,
  "Buyer Scheme Identifier is full-template only"
);
assert(
  matrixFieldOnSimplified("Invoice Number (IBT-001)") === true,
  "Peppol token must strip before match"
);
assert(
  matrixFieldOnSimplified("VAT Category") === true,
  "VAT Category aliases to Tax Category"
);
assert(
  conditionalCaseOnSimplified({
    field: "Simplified Tax Invoice",
    title: "[ALIGNED-IBRP-O-01-OM] Simplified Tax Invoice exception",
    ruleId: "ALIGNED-IBRP-O-01-OM",
  }) === true,
  "Simplified Tax Invoice maps to Invoice Transaction Type Code"
);

const classified = classifyMatrixCases(
  [
    { id: "TC-KEEP", field: "Invoice Number" },
    { id: "TC-DROP", field: "Seller Address Line 1" },
  ],
  (tc) => tc.field
);
assert(classified.keepIds.join(",") === "TC-KEEP", "keepIds order preserved");
assert(classified.kept === 1, "kept count");
assert(classified.dropped === 1, "dropped count");

console.log("simplifiedValidationMatrixHelper.test.ts ok");
