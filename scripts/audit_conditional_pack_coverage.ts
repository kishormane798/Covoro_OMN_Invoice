/**
 * One-shot: list mappable conditional pack TCs missing on disk.
 * Usage: npx tsx scripts/audit_conditional_pack_coverage.ts
 */
import fs from "fs";
import path from "path";
import {
  loadConditionalValidationMatrix,
  isMappableExcelField,
  resolveEffectiveMatrixField,
  ruleFolderName,
  PACK_ROOT,
} from "../Helpers/excel/conditionalValidationExcelPackHelper";
import { buildValidOmanFullTaxInvoiceRow } from "../Helpers/excel/conditionalValidationHelper";

const INTENTIONAL_SKIP_FIELDS = new Set([
  // IBT-006 — backend default; no need to enter in Excel.
  "vat accounting currency",
  "tax accounting currency",
  "tax accounting currency code",
  "ibt-006",
  // IBT-134/135 — no Covoro line-period columns (backend default).
  "invoice line period start date",
  "invoice line period end date",
  // IBT-096 — no separate Allowance VAT Rate column.
  "document level allowance tax rate",
  "invoice line allowance percentage",
  "invoice line charge percentage",
  "for each different value of vat category rate",
  // IBT-192 Accounting Currency VAT Category Code — no Covoro column.
  "accounting currency vat category code",
  "accounting currency vat category",
]);
// Keep in sync with scripts/list_unmapped_conditional_rules.py /
// Helpers/excel/conditionalValidationExcelPackHelper.ts
const INTENTIONAL_SKIP_RULES = new Set([
  "IBR-033-OM",
  "IBR-041-OM",
  "IBR-066-OM",
  "IBR-096-OM",
  "IBR-097-OM",
  "IBR-073-OM",
  "IBR-074-OM",
  "IBR-173-OM",
  "IBR-059-OM",
]);

function norm(s: string) {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

function polarityOf(tc: {
  polarity?: string;
  title?: string;
}): "positive" | "negative" | "unknown" {
  const p = (tc.polarity || "").toLowerCase();
  if (p === "positive" || p === "negative") return p;
  const t = (tc.title || "").toLowerCase();
  if (t.includes("(positive)")) return "positive";
  if (t.includes("(negative)")) return "negative";
  return "unknown";
}

/** IBT-134/135 / IBG-26 — Covoro has document Invoicing Period only. */
function isInvoiceLinePeriodField(field: string): boolean {
  const n = norm(field);
  return (
    n.includes("invoice line period") ||
    n.includes("ibt-134") ||
    n.includes("ibt-135") ||
    n.includes("ibg-26")
  );
}

/** IBT-006 — backend default; standalone labels only. */
function isTaxAccountingCurrencyField(field: string): boolean {
  const f = (field || "").trim();
  if (!f) return false;
  if (/[,/–]/.test(f)) return false; // compound multi-field labels
  const n = norm(f);
  const base = norm(f.replace(/\s*\((?:IBT|IBG|BT|BTOM)-?[0-9A-Za-z\-]+\)\s*$/i, ""));
  return (
    base === "vat accounting currency" ||
    base === "tax accounting currency" ||
    base === "tax accounting currency code" ||
    base === "ibt-006" ||
    n === "ibt-006"
  );
}

function isIntentional(field: string, ruleId: string): boolean {
  if (INTENTIONAL_SKIP_RULES.has((ruleId || "").toUpperCase())) return true;
  if (isInvoiceLinePeriodField(field)) return true;
  if (isTaxAccountingCurrencyField(field)) return true;
  if (INTENTIONAL_SKIP_FIELDS.has(norm(field))) return true;
  const stripped = norm(
    (field || "").replace(/\s*\((?:IBT|IBG|BT|BTOM)-?[0-9A-Za-z\-]+\)\s*$/i, "")
  );
  if (INTENTIONAL_SKIP_FIELDS.has(stripped)) return true;
  return false;
}

function main() {
  const all = loadConditionalValidationMatrix();
  const seed = buildValidOmanFullTaxInvoiceRow();
  const missing: string[] = [];
  const present: string[] = [];
  const skipped: string[] = [];
  const unmapped: string[] = [];

  for (const tc of all) {
    const eff = resolveEffectiveMatrixField(tc);
    if (isIntentional(tc.field, tc.ruleId) || isIntentional(eff, tc.ruleId)) {
      skipped.push(tc.id);
      continue;
    }
    if (!isMappableExcelField(eff, seed)) {
      unmapped.push(tc.id);
      continue;
    }
    const pol = polarityOf(tc);
    const bucket = pol === "unknown" ? "positive" : pol;
    const filePath = path.join(
      PACK_ROOT,
      ruleFolderName(tc.ruleId),
      bucket,
      `${tc.id}.xlsx`
    );
    if (fs.existsSync(filePath)) present.push(tc.id);
    else missing.push(tc.id);
  }

  const out = {
    total: all.length,
    skipped: skipped.length,
    unmapped: unmapped.length,
    mappable: present.length + missing.length,
    present: present.length,
    missing: missing.length,
    missingIds: missing,
  };
  const outPath = path.join(
    process.cwd(),
    "testcase",
    "conditional_validation",
    "_missing_pack_ids.json"
  );
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), "utf8");
  console.log(
    JSON.stringify(
      {
        ...out,
        missingIds: undefined,
        outPath,
        missingSample: missing.slice(0, 20),
      },
      null,
      2
    )
  );
}

main();
