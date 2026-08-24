/**
 * Generate Oman conditional-validation Excel packs from the FullMatrix testcase workbook.
 * Layout: TestData/<ruleId>/{positive|negative}/TC-*.xlsx
 * Invoice count: MULTI_VALUE_PACK_EXPAND → N rows; else 1 (trigger-not-met stays 1).
 *
 * Usage:
 *   npx tsx scripts/generate_conditional_validation_oman_excels.ts --all
 *   npx tsx scripts/generate_conditional_validation_oman_excels.ts --rule ALIGNED-IBRP-028-OM
 *   npx tsx scripts/generate_conditional_validation_oman_excels.ts --ids TC-01,TC-02
 *   npx tsx scripts/generate_conditional_validation_oman_excels.ts --section "CREDIT NOTE DETAILS"
 *   npx tsx scripts/generate_conditional_validation_oman_excels.ts --all --force
 */
import "dotenv/config";
import {
  generateConditionalValidationExcelPack,
  writeConditionalPackReadme,
  MATRIX_DEFAULT_PATH,
  PACK_ROOT,
} from "../Helpers/conditionalValidationExcelPackHelper";

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
    all = true;
  }

  return { section, ids, ruleId, all, matrixPath, packRoot, force };
}

async function main(): Promise<void> {
  // Parallel pack regen sets UAE_EINVOICE_WORKER_INDEX per child — keep pw-<n> isolation.
  // Sequential / ad-hoc CLI runs still disable worker identity (shared generated dir).
  if (!process.env.UAE_EINVOICE_WORKER_INDEX?.trim()) {
    process.env.UAE_EINVOICE_DISABLE_WORKER_IDENTITY = "1";
  }
  process.env.UAE_EINVOICE_COUNTERPARTY_ELECTRONIC = "om-receiver-dev";

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

  const results = await generateConditionalValidationExcelPack({
    matrixPath: opts.matrixPath,
    packRoot: opts.packRoot,
    section: opts.all ? undefined : opts.section,
    ids: opts.ids,
    ruleId: opts.ruleId,
    skipExisting: !opts.force,
  });

  const readme = writeConditionalPackReadme(results, opts.packRoot);
  const ok = results.filter((r) => r.status === "ok").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const errors = results.filter((r) => r.status === "error");

  console.log(
    JSON.stringify(
      {
        total: results.length,
        ok,
        skipped,
        error: errors.length,
        readme,
        sampleErrors: errors.slice(0, 10).map((e) => ({
          id: e.id,
          reason: e.reason,
        })),
      },
      null,
      2
    )
  );

  if (errors.length) {
    process.exitCode = 1;
  }
  console.log(
    `[conditional-validation-pack] 100% completed — ok=${ok} skipped=${skipped} error=${errors.length}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
