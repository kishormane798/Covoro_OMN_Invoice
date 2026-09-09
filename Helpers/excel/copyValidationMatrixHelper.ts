import fs from "fs";
import path from "path";
import {
  loadConditionalValidationMatrix,
  MATRIX_DEFAULT_PATH as CONDITIONAL_MATRIX_DEFAULT_PATH,
} from "./conditionalValidationExcelPackHelper";
import {
  loadFieldValidationMatrix,
  MATRIX_DEFAULT_PATH as FIELD_MATRIX_DEFAULT_PATH,
} from "./fieldValidationExcelPackHelper";
import {
  loadFormulaValidationMatrix,
  MATRIX_DEFAULT_PATH as FORMULA_MATRIX_DEFAULT_PATH,
} from "./formulaValidationExcelPackHelper";

export type CopyMatrixSheetName = "Field" | "Formula" | "Conditional";

export type CopyMatrixSheetPlan = {
  name: CopyMatrixSheetName;
  sourcePath: string;
  keepIds: string[];
  kept: number;
  dropped: number;
};

export type CopyMatrixBuildResult = {
  outputPath: string;
  sheets: CopyMatrixSheetPlan[];
};

export const COPY_MATRIX_OUTPUT_RELATIVE_PATH = path.join(
  "testcase",
  "copy_invoice",
  "EINV_OMAN_Copy_FullMatrix.xlsx"
);

export function classifyAllMatrixCases<T extends { id: string }>(
  cases: T[]
): { keepIds: string[]; kept: number; dropped: number } {
  const keepIds = cases.map((tc) => String(tc.id).trim()).filter(Boolean);
  return { keepIds, kept: keepIds.length, dropped: 0 };
}

function requireExistingFile(filePath: string): string {
  const resolved = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Source matrix not found: ${resolved}`);
  }
  return resolved;
}

export function buildCopyValidationMatrixPlan(options?: {
  fieldMatrixPath?: string;
  formulaMatrixPath?: string;
  conditionalMatrixPath?: string;
  outputPath?: string;
}): CopyMatrixBuildResult {
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
    : path.join(process.cwd(), COPY_MATRIX_OUTPUT_RELATIVE_PATH);

  const field = classifyAllMatrixCases(loadFieldValidationMatrix(fieldPath));
  const formula = classifyAllMatrixCases(loadFormulaValidationMatrix(formulaPath));
  const conditional = classifyAllMatrixCases(loadConditionalValidationMatrix(conditionalPath));

  return {
    outputPath,
    sheets: [
      {
        name: "Field",
        sourcePath: fieldPath,
        keepIds: field.keepIds,
        kept: field.kept,
        dropped: 0,
      },
      {
        name: "Formula",
        sourcePath: formulaPath,
        keepIds: formula.keepIds,
        kept: formula.kept,
        dropped: 0,
      },
      {
        name: "Conditional",
        sourcePath: conditionalPath,
        keepIds: conditional.keepIds,
        kept: conditional.kept,
        dropped: 0,
      },
    ],
  };
}
