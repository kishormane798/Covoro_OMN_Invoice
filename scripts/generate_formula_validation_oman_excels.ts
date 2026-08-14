/**
 * Generate Oman formula-validation Excel packs from the FullMatrix testcase workbook.
 *
 * Usage:
 *   npx tsx scripts/generate_formula_validation_oman_excels.ts --section "ITEM PRICE"
 *   npx tsx scripts/generate_formula_validation_oman_excels.ts --ids TC-001,TC-002
 *   npx tsx scripts/generate_formula_validation_oman_excels.ts --rule IBR-157-OM
 *   npx tsx scripts/generate_formula_validation_oman_excels.ts --all
 *   npx tsx scripts/generate_formula_validation_oman_excels.ts --all --force
 */
import "dotenv/config";
import {
  generateFormulaValidationExcelPack,
  writeFormulaPackReadme,
  MATRIX_DEFAULT_PATH,
  PACK_ROOT,
} from "../Helpers/formulaValidationExcelPackHelper";

function parseArgs(argv: string[]): {
  section?: string;
  ids?: string[];
  ruleId?: string;
  all: boolean;
  matrixPath: string;
  packRoot: string;
  force: boolean;
} {
  let section: string | undefined;
  let ids: string[] | undefined;
  let ruleId: string | undefined;
  let all = false;
  let matrixPath = MATRIX_DEFAULT_PATH;
  let packRoot = PACK_ROOT;
  let force = false;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--all") {
      all = true;
    } else if (a === "--section") {
      section = argv[++i];
    } else if (a === "--ids") {
      ids = (argv[++i] || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
    } else if (a === "--rule") {
      ruleId = argv[++i];
    } else if (a === "--matrix") {
      matrixPath = argv[++i];
    } else if (a === "--out") {
      packRoot = argv[++i];
    } else if (a === "--force") {
      force = true;
    }
  }

  if (!all && !section && !ids?.length && !ruleId) {
    section = "ITEM PRICE";
  }

  return { section, ids, ruleId, all, matrixPath, packRoot, force };
}

async function main(): Promise<void> {
  process.env.UAE_EINVOICE_DISABLE_WORKER_IDENTITY = "1";
  process.env.UAE_EINVOICE_COUNTERPARTY_ELECTRONIC = "OM1000091919";

  const opts = parseArgs(process.argv.slice(2));
  console.log(
    JSON.stringify(
      {
        matrix: opts.matrixPath,
        out: opts.packRoot,
        section: opts.all ? "(all)" : opts.section ?? null,
        ruleId: opts.ruleId ?? null,
        ids: opts.ids ?? null,
        skipExisting: !opts.force,
      },
      null,
      2
    )
  );

  const results = await generateFormulaValidationExcelPack({
    matrixPath: opts.matrixPath,
    packRoot: opts.packRoot,
    section: opts.all ? undefined : opts.section,
    ids: opts.ids,
    ruleId: opts.ruleId,
    skipExisting: !opts.force,
  });

  const readme = writeFormulaPackReadme(results, opts.packRoot);
  const ok = results.filter((r) => r.status === "ok").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const errors = results.filter((r) => r.status === "error");

  console.log(
    `[formula-validation-pack] 100% completed — ok=${ok} skipped=${skipped} error=${errors.length}`
  );
  console.log(
    JSON.stringify(
      {
        total: results.length,
        ok,
        skipped,
        error: errors.length,
        readme,
        sampleErrors: errors.slice(0, 15).map((e) => ({
          id: e.id,
          reason: e.reason,
          mutation: e.mutation,
        })),
      },
      null,
      2
    )
  );

  if (errors.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
