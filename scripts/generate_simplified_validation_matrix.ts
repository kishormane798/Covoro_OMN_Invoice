import "dotenv/config";
import fs from "fs";
import path from "path";
import {
  buildSimplifiedValidationMatrixPlan,
} from "../Helpers/excel/simplifiedValidationMatrixHelper";
import { runPythonForStdout } from "../utils/pythonRunner";

function argValue(argv: string[], flag: string): string | undefined {
  const i = argv.indexOf(flag);
  if (i < 0) return undefined;
  return argv[i + 1];
}

function main(): void {
  const argv = process.argv.slice(2);
  let plan;
  try {
    plan = buildSimplifiedValidationMatrixPlan({
      fieldMatrixPath: argValue(argv, "--field"),
      formulaMatrixPath: argValue(argv, "--formula"),
      conditionalMatrixPath: argValue(argv, "--conditional"),
      outputPath: argValue(argv, "--out"),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(message);
    process.exit(1);
  }

  for (const sheet of plan.sheets) {
    if (sheet.kept === 0) {
      console.warn(`${sheet.name}: 0 kept rows (header only)`);
    }
  }

  const tmpDir = path.join(process.cwd(), "testcase", "simplified_validation", "_tmp");
  fs.mkdirSync(tmpDir, { recursive: true });
  const planPath = path.join(tmpDir, "simplified-matrix-plan.json");
  fs.writeFileSync(
    planPath,
    JSON.stringify(
      {
        outputPath: plan.outputPath,
        sheets: plan.sheets.map((s) => ({
          name: s.name,
          sourcePath: s.sourcePath,
          keepIds: s.keepIds,
        })),
      },
      null,
      2
    ),
    "utf8"
  );

  const script = path.join(
    process.cwd(),
    "utils",
    "excel",
    "write_simplified_validation_matrix.py"
  );
  const stdout = runPythonForStdout(script, [planPath], 180_000);
  const parsed = JSON.parse(stdout.trim()) as {
    ok?: boolean;
    error?: string;
    outputPath?: string;
    sheets?: Array<{ name: string; copied: number }>;
  };
  if (!parsed.ok) {
    console.error(parsed.error || stdout);
    process.exit(1);
  }

  const copiedByName = new Map(
    (parsed.sheets ?? []).map((s) => [s.name, s.copied] as const)
  );
  const summary = {
    output: parsed.outputPath ?? plan.outputPath,
    sheets: plan.sheets.map((s) => ({
      name: s.name,
      kept: s.kept,
      dropped: s.dropped,
      copied: copiedByName.get(s.name) ?? 0,
    })),
  };
  for (const sheet of summary.sheets) {
    if (sheet.copied !== sheet.kept) {
      console.warn(
        `${sheet.name}: copied ${sheet.copied} !== kept ${sheet.kept} (duplicate IDs or ID mismatch)`
      );
    }
  }
  console.log(JSON.stringify(summary, null, 2));
}

main();
