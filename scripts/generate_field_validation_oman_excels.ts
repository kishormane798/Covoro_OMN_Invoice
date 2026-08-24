/**
 * Generate Oman field-validation Excel packs by section / testcase id / field.
 *
 * Usage:
 *   npx tsx scripts/generate_field_validation_oman_excels.ts --section "DOCUMENT DETAILS"
 *   npx tsx scripts/generate_field_validation_oman_excels.ts --ids TC-1,TC-2
 *   npx tsx scripts/generate_field_validation_oman_excels.ts --field "Seller Identifier,Buyer Identifier"
 *   npx tsx scripts/generate_field_validation_oman_excels.ts --all
 *   npx tsx scripts/generate_field_validation_oman_excels.ts --all --force
 *   npx tsx scripts/generate_field_validation_oman_excels.ts --field "Scheme identifier" --out testcase/field_validation/TestData2 --force
 */
import "dotenv/config";
import {
  generateFieldValidationExcelPack,
  writePackReadme,
  MATRIX_DEFAULT_PATH,
  PACK_ROOT,
} from "../Helpers/fieldValidationExcelPackHelper";

function parseArgs(argv: string[]): {
  section?: string;
  ids?: string[];
  fields?: string[];
  all: boolean;
  matrixPath: string;
  packRoot: string;
  force: boolean;
} {
  let section: string | undefined;
  let ids: string[] | undefined;
  let fields: string[] | undefined;
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
    } else if (a === "--field" || a === "--fields") {
      fields = (argv[++i] || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
    } else if (a === "--matrix") {
      matrixPath = argv[++i];
    } else if (a === "--out") {
      packRoot = argv[++i];
    } else if (a === "--force") {
      force = true;
    }
  }

  if (!all && !section && !ids?.length && !fields?.length) {
    // Default smoke: DOCUMENT DETAILS
    section = "DOCUMENT DETAILS";
  }

  return { section, ids, fields, all, matrixPath, packRoot, force };
}

async function main(): Promise<void> {
  process.env.UAE_EINVOICE_DISABLE_WORKER_IDENTITY = "1";
  process.env.UAE_EINVOICE_COUNTERPARTY_ELECTRONIC = "om-receiver-dev";

  const opts = parseArgs(process.argv.slice(2));
  console.log(
    JSON.stringify(
      {
        matrix: opts.matrixPath,
        out: opts.packRoot,
        section: opts.all ? "(all)" : opts.section ?? null,
        fields: opts.fields ?? null,
        ids: opts.ids ?? null,
        skipExisting: !opts.force,
      },
      null,
      2
    )
  );

  const results = await generateFieldValidationExcelPack({
    matrixPath: opts.matrixPath,
    packRoot: opts.packRoot,
    section: opts.all ? undefined : opts.section,
    ids: opts.ids,
    fields: opts.fields,
    skipExisting: !opts.force,
  });

  const readme = writePackReadme(results, opts.packRoot);
  const ok = results.filter((r) => r.status === "ok").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const alreadyExists = results.filter(
    (r) => r.status === "skipped" && r.reason === "already exists"
  ).length;
  const errors = results.filter((r) => r.status === "error");

  console.log(
    JSON.stringify(
      {
        total: results.length,
        ok,
        skipped,
        alreadyExists,
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
    `[field-validation-pack] 100% completed — ok=${ok} skipped=${skipped} (alreadyExists=${alreadyExists}) error=${errors.length}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
