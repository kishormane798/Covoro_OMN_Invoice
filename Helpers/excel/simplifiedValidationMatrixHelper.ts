import fs from "fs";
import path from "path";
import { SIMPLIFIED_TEMPLATE_HEADER_LABELS } from "../../testData/invoiceTemplateHeaders/invoiceColumnMapping";
import { hasHeaderLabel } from "../../utils/excel/invoiceExcel";
import { buildValidOmanFullTaxInvoiceRow } from "./conditionalValidationHelper";
import {
  loadConditionalValidationMatrix,
  MATRIX_DEFAULT_PATH as CONDITIONAL_MATRIX_DEFAULT_PATH,
  normalizeMatrixFieldLabel,
  matrixFieldLookupCandidates,
  resolveConditionalRowKey,
  resolveEffectiveMatrixField,
  type ConditionalMatrixCase,
} from "./conditionalValidationExcelPackHelper";
import {
  loadFieldValidationMatrix,
  MATRIX_DEFAULT_PATH as FIELD_MATRIX_DEFAULT_PATH,
  MATRIX_FIELD_TO_ROW_KEY,
} from "./fieldValidationExcelPackHelper";
import {
  loadFormulaValidationMatrix,
  MATRIX_DEFAULT_PATH as FORMULA_MATRIX_DEFAULT_PATH,
} from "./formulaValidationExcelPackHelper";

export type SimplifiedMatrixSheetName = "Field" | "Formula" | "Conditional";

export type SimplifiedMatrixSheetPlan = {
  name: SimplifiedMatrixSheetName;
  sourcePath: string;
  keepIds: string[];
  kept: number;
  dropped: number;
};

export type SimplifiedMatrixBuildResult = {
  outputPath: string;
  sheets: SimplifiedMatrixSheetPlan[];
};

export const SIMPLIFIED_MATRIX_OUTPUT_RELATIVE_PATH = path.join(
  "testcase",
  "simplified_validation",
  "EINV_OMAN_Simplified_FullMatrix.xlsx"
);

export function matrixFieldOnSimplified(matrixField: string): boolean {
  const labels = SIMPLIFIED_TEMPLATE_HEADER_LABELS;
  if (!matrixField.trim()) return false;
  if (hasHeaderLabel(labels, matrixField)) return true;
  const stripped = normalizeMatrixFieldLabel(matrixField);
  if (stripped && hasHeaderLabel(labels, stripped)) return true;
  const aliasedDirect = MATRIX_FIELD_TO_ROW_KEY[matrixField] ?? MATRIX_FIELD_TO_ROW_KEY[stripped];
  if (aliasedDirect && hasHeaderLabel(labels, aliasedDirect)) return true;
  for (const candidate of matrixFieldLookupCandidates(matrixField)) {
    if (hasHeaderLabel(labels, candidate)) return true;
    const aliased = MATRIX_FIELD_TO_ROW_KEY[candidate];
    if (aliased && hasHeaderLabel(labels, aliased)) return true;
  }
  return false;
}

export function conditionalCaseOnSimplified(
  tc: Partial<ConditionalMatrixCase> & Pick<ConditionalMatrixCase, "field">
): boolean {
  const effective = resolveEffectiveMatrixField({
    id: "",
    priority: "",
    polarity: "",
    section: "",
    title: "",
    description: "",
    ruleId: "",
    ...tc,
  });
  if (matrixFieldOnSimplified(effective) || matrixFieldOnSimplified(tc.field)) {
    return true;
  }
  const seed = buildValidOmanFullTaxInvoiceRow();
  const rowKey = resolveConditionalRowKey(effective, seed);
  return hasHeaderLabel(SIMPLIFIED_TEMPLATE_HEADER_LABELS, rowKey);
}

export function classifyMatrixCases<T extends { id: string }>(
  cases: T[],
  fieldOf: (tc: T) => string
): { keepIds: string[]; kept: number; dropped: number } {
  const keepIds: string[] = [];
  let dropped = 0;
  for (const tc of cases) {
    if (matrixFieldOnSimplified(fieldOf(tc))) {
      keepIds.push(tc.id);
    } else {
      dropped += 1;
    }
  }
  return { keepIds, kept: keepIds.length, dropped };
}

function requireExistingFile(filePath: string): string {
  const resolved = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Source matrix not found: ${resolved}`);
  }
  return resolved;
}

export function buildSimplifiedValidationMatrixPlan(options?: {
  fieldMatrixPath?: string;
  formulaMatrixPath?: string;
  conditionalMatrixPath?: string;
  outputPath?: string;
}): SimplifiedMatrixBuildResult {
  const fieldPath = requireExistingFile(options?.fieldMatrixPath ?? FIELD_MATRIX_DEFAULT_PATH);
  const formulaPath = requireExistingFile(
    options?.formulaMatrixPath ?? FORMULA_MATRIX_DEFAULT_PATH
  );
  const conditionalPath = requireExistingFile(
    options?.conditionalMatrixPath ?? CONDITIONAL_MATRIX_DEFAULT_PATH
  );
  const outputPath = options?.outputPath
    ? path.isAbsolute(options.outputPath)
      ? options.outputPath
      : path.join(process.cwd(), options.outputPath)
    : path.join(process.cwd(), SIMPLIFIED_MATRIX_OUTPUT_RELATIVE_PATH);

  const fieldClassified = classifyMatrixCases(loadFieldValidationMatrix(fieldPath), (tc) => tc.field);
  const formulaClassified = classifyMatrixCases(
    loadFormulaValidationMatrix(formulaPath),
    (tc) => tc.field
  );
  const conditionalCases = loadConditionalValidationMatrix(conditionalPath);
  const conditionalKeepIds: string[] = [];
  let conditionalDropped = 0;
  for (const tc of conditionalCases) {
    if (conditionalCaseOnSimplified(tc)) {
      conditionalKeepIds.push(tc.id);
    } else {
      conditionalDropped += 1;
    }
  }

  return {
    outputPath,
    sheets: [
      {
        name: "Field",
        sourcePath: fieldPath,
        keepIds: fieldClassified.keepIds,
        kept: fieldClassified.kept,
        dropped: fieldClassified.dropped,
      },
      {
        name: "Formula",
        sourcePath: formulaPath,
        keepIds: formulaClassified.keepIds,
        kept: formulaClassified.kept,
        dropped: formulaClassified.dropped,
      },
      {
        name: "Conditional",
        sourcePath: conditionalPath,
        keepIds: conditionalKeepIds,
        kept: conditionalKeepIds.length,
        dropped: conditionalDropped,
      },
    ],
  };
}
