/**
 * UAE E-Invoice Playwright suite runner (CI + local).
 *
 * Usage:
 *   node scripts/run-test-suite.mjs <suite_id>
 *   node scripts/run-test-suite.mjs --list
 *   node scripts/run-test-suite.mjs --list-scheduled
 *   node scripts/run-test-suite.mjs --print-name <suite_id>   # email / CI display name only
 *
 * Env:
 *   TEST_SUITE  — used when no suite_id arg is passed (Bitbucket/Jenkins/Azure)
 *
 * Workers: default 5 (--workers=5) for all suites (TIN slots 1779700001–1779700005).
 * Scheduled suites rotate on the CI schedule. Manual suites are for on-demand runs only.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const playwrightCli = path.join(projectRoot, 'node_modules', '@playwright', 'test', 'cli.js');

/** @typedef {'scheduled' | 'manual'} SuiteMode */
/**
 * @typedef {object} SuiteDef
 * @property {string} displayName  Human-readable name (emails / CI logs)
 * @property {SuiteMode} mode
 * @property {string[]} specs
 * @property {'chromium' | 'chromium-ui'} project
 * @property {number} [workers]
 */

/** @type {Record<string, SuiteDef>} */
const SUITES = {
  // ---------------------------------------------------------------------------
  // SCHEDULED — one job per day/slot; names appear in email notifications
  // ---------------------------------------------------------------------------
  excel_covoro_field_formula: {
    displayName: 'Covoro Template — Field & Formula Validation',
    mode: 'scheduled',
    project: 'chromium',
    specs: [
      'tests/OMN_FieldValidation_CovoroTemplate_Test.spec.ts',
      'tests/OMN_FormulaValidation_CovoroTemplate_Test.spec.ts',
    ],
  },
  excel_covoro_submit: {
    displayName: 'Covoro Template — Submit Invoice',
    mode: 'scheduled',
    project: 'chromium',
    specs: [
      'tests/kishorsubmit/OMN_SubmitInvoice_CovoroTemplate_Test.spec.ts',
      'tests/kishorsubmit/OMN_SubmitInvoice_MultiItem_CovoroTemplate_Test.spec.ts',
    ],
  },
  excel_covoro_conditional: {
    displayName: 'Covoro Template — Conditional Validation',
    mode: 'scheduled',
    project: 'chromium',
    specs: ['tests/OMN_ConditionalValidation_CovoroTemplate_Test.spec.ts'],
  },
  ui_create_invoice: {
    displayName: 'UI — Create Invoice',
    mode: 'scheduled',
    project: 'chromium-ui',
    specs: ['tests/KISHOR_UI/OMN_UIInvoiceCreation_Manual_Test.spec.ts'],
  },
  ui_edit_invoice: {
    displayName: 'UI — Edit Invoice',
    mode: 'scheduled',
    project: 'chromium-ui',
    specs: ['tests/KISHOR_UI/OMN_UIInvoiceEdit_Manual_Test.spec.ts'],
  },
  ui_copy_invoice: {
    displayName: 'UI — Copy Invoice',
    mode: 'scheduled',
    project: 'chromium-ui',
    specs: ['tests/KISHOR_UI/OMN_UIInvoiceCopy_Manual_Test.spec.ts'],
  },
  ui_submit_invoice: {
    displayName: 'UI — Submit Invoice',
    mode: 'scheduled',
    project: 'chromium-ui',
    specs: [
      'tests/KISHOR_UI/OMN_UISubmitInvoice_Test.spec.ts',
      'tests/KISHOR_UI/OMN_UISubmitInvoice_MultiItem_Test.spec.ts',
    ],
  },
  ui_attachment_download: {
    displayName: 'UI — Attachment & File Download',
    mode: 'scheduled',
    project: 'chromium-ui',
    specs: [
      'tests/KISHOR_UI/OMN_UIInvoiceEdit_Attachment_Test.spec.ts',
      'tests/KISHOR_UI/OMN_UIInvoiceFileDownload_Test.spec.ts',
    ],
  },

  // ---------------------------------------------------------------------------
  // MANUAL — on-demand / framework-wide; not on the daily schedule
  // ---------------------------------------------------------------------------
  all: {
    displayName: 'Full Suite — All Tests (Upload + UI)',
    mode: 'manual',
    project: 'chromium',
    specs: [], // empty = entire config (both projects via playwright default)
  },
  excel_covoro_all: {
    displayName: 'Covoro Template — All Specs',
    mode: 'manual',
    project: 'chromium',
    specs: ['tests/**/*CovoroTemplate*.spec.ts'],
  },
  sanity_submit: {
    displayName: 'Sanity — Submit Invoice',
    mode: 'manual',
    project: 'chromium',
    specs: ['tests/sanitysubmit/OMN_SubmitInvoice_Sanity_Test.spec.ts'],
  },
  ui_all: {
    displayName: 'UI — All Specs',
    mode: 'manual',
    project: 'chromium-ui',
    specs: ['tests/KISHOR_UI/*.spec.ts'],
  },
  ui_master: {
    displayName: 'UI — Master Buyer & Item',
    mode: 'manual',
    project: 'chromium-ui',
    specs: ['tests/KISHOR_UI/OMN_UIMaster_BuyerAndItem_Test.spec.ts'],
  },

  // Individual specs (manual)
  spec_excel_covoro_field: {
    displayName: 'Covoro Template Field Validation',
    mode: 'manual',
    project: 'chromium',
    specs: ['tests/OMN_FieldValidation_CovoroTemplate_Test.spec.ts'],
  },
  spec_excel_covoro_formula: {
    displayName: 'Covoro Template Formula Validation',
    mode: 'manual',
    project: 'chromium',
    specs: ['tests/OMN_FormulaValidation_CovoroTemplate_Test.spec.ts'],
  },
  spec_excel_covoro_conditional: {
    displayName: 'Covoro Template Conditional Validation',
    mode: 'manual',
    project: 'chromium',
    specs: ['tests/OMN_ConditionalValidation_CovoroTemplate_Test.spec.ts'],
  },
  spec_excel_covoro_submit: {
    displayName: 'Covoro Template Submit',
    mode: 'manual',
    project: 'chromium',
    specs: ['tests/kishorsubmit/OMN_SubmitInvoice_CovoroTemplate_Test.spec.ts'],
  },
  spec_excel_covoro_submit_multi: {
    displayName: 'Covoro Template Submit Multi-Item',
    mode: 'manual',
    project: 'chromium',
    specs: ['tests/kishorsubmit/OMN_SubmitInvoice_MultiItem_CovoroTemplate_Test.spec.ts'],
  },
  spec_sanity_submit: {
    displayName: 'Sanity Submit',
    mode: 'manual',
    project: 'chromium',
    specs: ['tests/sanitysubmit/OMN_SubmitInvoice_Sanity_Test.spec.ts'],
  },
  spec_ui_create_invoice: {
    displayName: 'UI Create Invoice',
    mode: 'manual',
    project: 'chromium-ui',
    specs: ['tests/KISHOR_UI/OMN_UIInvoiceCreation_Manual_Test.spec.ts'],
  },
  spec_ui_edit_invoice: {
    displayName: 'UI Edit Invoice',
    mode: 'manual',
    project: 'chromium-ui',
    specs: ['tests/KISHOR_UI/OMN_UIInvoiceEdit_Manual_Test.spec.ts'],
  },
  spec_ui_copy_invoice: {
    displayName: 'UI Copy Invoice',
    mode: 'manual',
    project: 'chromium-ui',
    specs: ['tests/KISHOR_UI/OMN_UIInvoiceCopy_Manual_Test.spec.ts'],
  },
  spec_ui_master: {
    displayName: 'UI Master Buyer & Item',
    mode: 'manual',
    project: 'chromium-ui',
    specs: ['tests/KISHOR_UI/OMN_UIMaster_BuyerAndItem_Test.spec.ts'],
  },
  spec_ui_submit: {
    displayName: 'UI Submit Invoice',
    mode: 'manual',
    project: 'chromium-ui',
    specs: ['tests/KISHOR_UI/OMN_UISubmitInvoice_Test.spec.ts'],
  },
  spec_ui_submit_multi: {
    displayName: 'UI Submit Multi-Item',
    mode: 'manual',
    project: 'chromium-ui',
    specs: ['tests/KISHOR_UI/OMN_UISubmitInvoice_MultiItem_Test.spec.ts'],
  },
  spec_ui_attachment: {
    displayName: 'UI Attachment',
    mode: 'manual',
    project: 'chromium-ui',
    specs: ['tests/KISHOR_UI/OMN_UIInvoiceEdit_Attachment_Test.spec.ts'],
  },
  spec_ui_file_download: {
    displayName: 'UI File Download',
    mode: 'manual',
    project: 'chromium-ui',
    specs: ['tests/KISHOR_UI/OMN_UIInvoiceFileDownload_Test.spec.ts'],
  },
};

/** Old CI choice ids → new suite ids (keep pipelines working during rename). */
const ALIASES = {
  full: 'all',
  covoro_field_formula: 'excel_covoro_field_formula',
  covoro_submit: 'excel_covoro_submit',
  covoro_conditional: 'excel_covoro_conditional',
  covoro: 'excel_covoro_all',
  sanity: 'sanity_submit',
  ui: 'ui_all',
  ui_invoice_creation: 'ui_create_invoice',
  ui_invoice_edit: 'ui_edit_invoice',
  ui_invoice_copy: 'ui_copy_invoice',
  ui_submit: 'ui_submit_invoice',
  spec_field_validation_covoro: 'spec_excel_covoro_field',
  spec_formula_validation_covoro: 'spec_excel_covoro_formula',
  spec_conditional_validation_covoro: 'spec_excel_covoro_conditional',
  spec_submit_covoro: 'spec_excel_covoro_submit',
  spec_submit_multi_covoro: 'spec_excel_covoro_submit_multi',
  spec_sanity: 'spec_sanity_submit',
  spec_ui_invoice_creation: 'spec_ui_create_invoice',
  spec_ui_invoice_edit_manual: 'spec_ui_edit_invoice',
  spec_ui_invoice_copy: 'spec_ui_copy_invoice',
  spec_ui_submit_multi: 'spec_ui_submit_multi',
};

function resolveSuiteId(raw) {
  if (!raw) return null;
  if (SUITES[raw]) return raw;
  if (ALIASES[raw]) return ALIASES[raw];
  return null;
}

function listSuites(modeFilter) {
  const rows = Object.entries(SUITES)
    .filter(([, def]) => !modeFilter || def.mode === modeFilter)
    .map(([id, def]) => `  ${id.padEnd(36)} [${def.mode}]  ${def.displayName}`);
  console.log(rows.join('\n'));
}

/** Default parallel workers (TIN slots 1779700001–1779700005). Override per suite via `workers`. */
const DEFAULT_WORKERS = 5;

function buildPlaywrightArgs(suiteId, def) {
  const workers = def.workers ?? DEFAULT_WORKERS;
  const args = ['test'];

  if (suiteId === 'all') {
    // Full suite: both projects (omit --project so config runs chromium + chromium-ui)
    args.push(`--workers=${workers}`);
    return args;
  }

  args.push(...def.specs, `--project=${def.project}`, `--workers=${workers}`);
  return args;
}

function printUsage() {
  console.log(`Usage:
  node scripts/run-test-suite.mjs <suite_id>
  node scripts/run-test-suite.mjs --list
  node scripts/run-test-suite.mjs --list-scheduled
  node scripts/run-test-suite.mjs --list-manual
  node scripts/run-test-suite.mjs --print-name <suite_id>

Or set TEST_SUITE=<suite_id> with no args.
`);
}

function main() {
  const argv = process.argv.slice(2);

  if (argv[0] === '--list') {
    console.log('All suites:\n');
    listSuites();
    return;
  }
  if (argv[0] === '--list-scheduled') {
    console.log('Scheduled suites (CI rotation):\n');
    listSuites('scheduled');
    return;
  }
  if (argv[0] === '--list-manual') {
    console.log('Manual suites (on-demand):\n');
    listSuites('manual');
    return;
  }
  if (argv[0] === '--print-name') {
    const id = resolveSuiteId(argv[1] || process.env.TEST_SUITE);
    if (!id) {
      console.error(`Unknown suite: ${argv[1] || '(empty)'}`);
      process.exit(1);
    }
    process.stdout.write(SUITES[id].displayName);
    return;
  }
  if (argv[0] === '--help' || argv[0] === '-h') {
    printUsage();
    return;
  }

  const rawId = argv[0] || process.env.TEST_SUITE;
  const suiteId = resolveSuiteId(rawId);
  if (!suiteId) {
    console.error(`Unknown or missing suite id: ${rawId || '(empty)'}\n`);
    printUsage();
    console.error('Scheduled ids:');
    listSuites('scheduled');
    process.exit(1);
  }

  if (!existsSync(playwrightCli)) {
    console.error(
      `Missing @playwright/test. From the project root run:\n  cd "${projectRoot}"\n  npm install`
    );
    process.exit(1);
  }

  const def = SUITES[suiteId];
  const pwArgs = buildPlaywrightArgs(suiteId, def);

  console.log(`SUITE_ID=${suiteId}`);
  console.log(`SUITE_NAME=${def.displayName}`);
  console.log(`SUITE_MODE=${def.mode}`);
  console.log(`Command: node …/cli.js ${pwArgs.join(' ')}\n`);

  // Expose for CI email templates that read env from this process tree
  process.env.SUITE_ID = suiteId;
  process.env.SUITE_NAME = def.displayName;
  process.env.SUITE_MODE = def.mode;

  const result = spawnSync(process.execPath, [playwrightCli, ...pwArgs], {
    cwd: projectRoot,
    stdio: 'inherit',
    env: process.env,
  });

  process.exit(result.status ?? 1);
}

main();
