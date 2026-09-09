import {
  classifyAllMatrixCases,
  COPY_MATRIX_OUTPUT_RELATIVE_PATH,
  buildCopyValidationMatrixPlan,
} from "./copyValidationMatrixHelper";

function assert(cond: unknown, message: string): void {
  if (!cond) throw new Error(message);
}

assert(
  COPY_MATRIX_OUTPUT_RELATIVE_PATH.replace(/\\/g, "/").endsWith(
    "testcase/copy_invoice/EINV_OMAN_Copy_FullMatrix.xlsx"
  ),
  "output relative path"
);

const classified = classifyAllMatrixCases([{ id: "TC-1" }, { id: " TC-2 " }, { id: "" }]);
assert(classified.kept === 2, "kept count");
assert(classified.dropped === 0, "keep-all dropped is 0");
assert(classified.keepIds.join(",") === "TC-1,TC-2", "ids trimmed, blanks dropped");

let threw = false;
try {
  buildCopyValidationMatrixPlan({
    fieldMatrixPath: "testcase/_missing_copy_field.xlsx",
    formulaMatrixPath: "testcase/_missing_copy_formula.xlsx",
    conditionalMatrixPath: "testcase/_missing_copy_conditional.xlsx",
  });
} catch (err) {
  threw = String(err instanceof Error ? err.message : err).includes("Source matrix not found");
}
assert(threw, "missing source must throw");

console.log("copyValidationMatrixHelper.test.ts ok");
