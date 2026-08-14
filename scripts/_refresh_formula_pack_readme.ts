/**
 * Rebuild TestData/README.md after reorganizing packs by Field name (no Excel regen).
 */
import {
  loadFormulaValidationMatrix,
  writeFormulaPackReadme,
  PACK_ROOT,
  fieldFolderName,
  type FormulaGeneratePackResult,
} from "../Helpers/formulaValidationExcelPackHelper";
import fs from "fs";
import path from "path";

function main(): void {
  const cases = loadFormulaValidationMatrix();
  const results: FormulaGeneratePackResult[] = [];

  for (const tc of cases) {
    const polarity =
      tc.polarity === "positive"
        ? "positive"
        : tc.polarity === "gap"
          ? "gap"
          : tc.polarity === "negative"
            ? "negative"
            : "unknown";

    if (polarity === "gap") {
      results.push({
        id: tc.id,
        section: tc.section,
        field: tc.field,
        title: tc.title,
        ruleId: tc.ruleId,
        polarity: "gap",
        mutation: "gap",
        status: "skipped",
        reason: "documented gap / not Excel-testable",
      });
      continue;
    }

    const bucket = polarity === "positive" ? "positive" : "negative";
    const destPath = path.join(
      PACK_ROOT,
      fieldFolderName(tc.field),
      bucket,
      `${tc.id}.xlsx`
    );
    const ok = fs.existsSync(destPath);
    results.push({
      id: tc.id,
      section: tc.section,
      field: tc.field,
      title: tc.title,
      ruleId: tc.ruleId,
      polarity,
      mutation: "valid_inputs",
      status: ok ? "ok" : "error",
      reason: ok ? undefined : "file missing after reorg",
      destPath: ok ? destPath : undefined,
    });
  }

  const readme = writeFormulaPackReadme(results, PACK_ROOT);
  const ok = results.filter((r) => r.status === "ok").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const error = results.filter((r) => r.status === "error").length;
  console.log(JSON.stringify({ readme, ok, skipped, error }, null, 2));
}

main();
