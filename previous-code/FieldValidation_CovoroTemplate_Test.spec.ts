/**
 * ARCHIVED — not run by Playwright (`testDir` is `./tests`; see previous-code/README.md).
 * Empty-template `updateExcelField` / `createInvoiceFileWithInvoiceNumber` path.
 * Live spec: tests/FieldValidation_CovoroTemplate_Test.spec.ts
 */
import { test } from "../Src/baseTest";
import { uploadAndVerify, uploadAndVerifyError } from "../Helpers/uploadHelper";
import {
  updateExcelField,
  generateDropdownMasterExcel,
  generateInvoiceCurrencyExchangeBatchExcel,
  updateExcelFieldWithInvoice,
  patchInvoiceTextCellInFile,
} from "../utils/invoiceExcel";
import * as FV from "../testData/FieldValidations";
import { unitOfMeasurementValidTestData } from "../testData/FieldValidations/Master";
import {
  createInvoiceFileWithInvoiceNumber,
  runErrorValidation,
} from "../Helpers/excelEditMessageCheck";
import { buildInvoiceNumber, randomAlphaNumeric } from "../Helpers/fieldValidationHelper";
import { generateFormatContextFieldExcel } from "../Helpers/formatContextFieldValidationHelper";

const TEMPLATE = "Covoro";
const dropdownMasterOnCovoro = FV.mergeDropdownFieldConfigs(
  FV.dropdownFieldMasterConfig,
  FV.conditionalDropdownFieldMasterConfig
);
const dropdownInvalidOnCovoro = FV.mergeDropdownFieldConfigs(
  FV.dropdownFieldInvalidConfig,
  FV.documentChargesAllowancesDropdownInvalidConfig,
  FV.conditionalDropdownFieldInvalidConfig
);
const NON_AED_INVOICE_CURRENCY_CODES = FV.INVOICE_CURRENCY_DROPDOWN_CODES.filter(
  (code) => code !== "AED"
);
const DROPDOWN_TIMEOUT_MS = 6 * 60 * 1000;
const UNIT_OF_MEASUREMENT_TIMEOUT_MS = 10 * 60 * 1000;

/**
 * Length-rule fields that need pattern/format suites (IBR-002 / IBR-003 / Tax Rate),
 * not random `updateExcelField` strings.
 */
const CONDITIONAL_LENGTH_SKIP = new Set([
  "Seller VAT Identifier (TRN / TIN)",
  "Buyer VAT identifier",
  "Third Party VATIN",
  "Unique Identifier Number",
  "Prepayment invoice UUID",
  "Supporting document UUID",
  "Tax Rate",
]);

/** Numeric fields that need FX / accounting-currency / profit-margin txn context. */
const NUMERIC_CONTEXT_SKIP = new Set([
  "Currency Exchange Rate",
  "Invoice total tax amount in tax accounting currency",
  "Total amount due (profit margin)",
]);

const conditionalLengthConfigs = FV.fieldValidationConditional.filter(
  (c) => !CONDITIONAL_LENGTH_SKIP.has(c.field)
);
const numericFieldConfigs = FV.fieldValidationNumeric.filter(
  (c) => !NUMERIC_CONTEXT_SKIP.has(c.field)
);

/** Digit-count value for amount/qty rules (matches fieldValidationExcelPackHelper). */
function formatNumericDigitCount(digitCount: number, decimals = 2): string {
  if (digitCount <= 0) return "";
  const intPart = "1".repeat(digitCount);
  if (decimals <= 0) return intPart;
  return `${intPart}.${"0".repeat(decimals)}`;
}

async function patchNumericFieldOnFreshInvoice(
  field: string,
  digitCount: number,
  decimals?: number
): Promise<{ filePath: string; invoiceNumber: string }> {
  const invoiceNumber = FV.buildDynamicInvoiceNumber("INV-NUM");
  const filePath = await createInvoiceFileWithInvoiceNumber(invoiceNumber);
  patchInvoiceTextCellInFile(
    filePath,
    field,
    formatNumericDigitCount(digitCount, decimals ?? 2)
  );
  return { filePath, invoiceNumber };
}

test.describe(`Excel upload — field validation (${TEMPLATE})`, () => {
  test.describe.configure({ mode: "parallel" });

  test.describe("Invoice Number — valid length", () => {
    for (const config of FV.fieldInvoice_number) {
      test(`Verify Excel upload is accepted for ${TEMPLATE} Document – ${config.field} (minimum length (${config.min} char${config.min === 1 ? "" : "s"})).`, async ({ page }) => {
        const filePath = await updateExcelField(config.field, config.min);
        await uploadAndVerify(page, filePath);
      });

      test(`Verify Excel upload is accepted for ${TEMPLATE} Document – ${config.field} (maximum length (${config.max} chars)).`, async ({ page }) => {
        const filePath = await updateExcelField(config.field, config.max);
        await uploadAndVerify(page, filePath);
      });
    }
  });

  test.describe("Invoice Number — invalid values", () => {
    test(`Verify Excel upload returns an error file for ${TEMPLATE} Document – Invoice Number (empty).`, async ({ page }) => {
      const filePath = await createInvoiceFileWithInvoiceNumber("");
      await runErrorValidation(
        page,
        { filePath, field: "Invoice Number", checkEdit: false });
    });

    test(`Verify Excel upload returns an error file for ${TEMPLATE} Document – Invoice Number (65+ chars).`, async ({ page }) => {
      const tooLong = "INV-" + randomAlphaNumeric(80);
      const invoiceNumber = buildInvoiceNumber(tooLong, 65);
      const filePath = await createInvoiceFileWithInvoiceNumber(invoiceNumber);
      await runErrorValidation(
        page,
        { filePath, field: "Invoice Number", invoiceNumber, checkEdit: true });
    });
  });

  test.describe("Invoice Issue Date", () => {
    const scenarios = FV.createInvoiceIssueDateScenarios();
    for (const scenario of scenarios) {
      const condition = scenario.name
        .replace(/ \(should pass\)/gi, "")
        .replace(/ \(should error\)/gi, "")
        .trim();
      test(`Verify Excel upload ${scenario.shouldError ? "returns an error file" : "is accepted"} for ${TEMPLATE} Document – Invoice Issue Date (${condition}).`, async ({ page }) => {
        const invoiceNumber = FV.buildDynamicInvoiceNumber(scenario.invoicePrefix);
        const filePath = await createInvoiceFileWithInvoiceNumber(invoiceNumber, {
          issueDateValue: scenario.issueDateValue,
          issueDateFormat: scenario.issueDateFormat,
        });
        if (scenario.shouldError) {
          await runErrorValidation(
            page,
            { filePath, field: "Invoice Issue Date", invoiceNumber, checkEdit: true });
          return;
        }
        await uploadAndVerify(page, filePath);
      });
    }
  });

  test.describe("Mandatory fields — valid length", () => {
    for (const config of FV.fieldValidationMandatory) {
      if (config.field === "Seller electronic address") continue;

      test(`Verify Excel upload is accepted for ${TEMPLATE} Mandatory – ${config.field} (minimum length (${config.min} char${config.min === 1 ? "" : "s"})).`, async ({ page }) => {
        const filePath = await updateExcelField(config.field, config.min);
        await uploadAndVerify(page, filePath);
      });

      test(`Verify Excel upload is accepted for ${TEMPLATE} Mandatory – ${config.field} (maximum length (${config.max} chars)).`, async ({ page }) => {
        const filePath = await updateExcelField(config.field, config.max);
        await uploadAndVerify(page, filePath);
      });
    }
  });

  test.describe("Mandatory fields — invalid length", () => {
    for (const config of FV.fieldValidationMandatory) {
      test(`Verify Excel upload returns an error file for ${TEMPLATE} Mandatory – ${config.field} (${config.belowMin === 0 ? "empty (below minimum)" : `${config.belowMin} chars (below minimum)`}).`, async ({ page }) => {
        const { filePath, invoiceNumber } = await updateExcelFieldWithInvoice(
          config.field,
          config.belowMin
        );
        await runErrorValidation(
          page,
          { filePath, field: config.field, invoiceNumber, checkEdit: true });
      });

      test(`Verify Excel upload returns an error file for ${TEMPLATE} Mandatory – ${config.field} (${config.aboveMax} chars (above maximum)).`, async ({ page }) => {
        const { filePath, invoiceNumber } = await updateExcelFieldWithInvoice(
          config.field,
          config.aboveMax
        );
        await runErrorValidation(
          page,
          { filePath, field: config.field, invoiceNumber, checkEdit: true });
      });
    }
  });

  test.describe("Optional fields — valid length", () => {
    for (const config of FV.fieldValidationOptional) {
      test(`Verify Excel upload is accepted for ${TEMPLATE} Optional – ${config.field} (minimum length (${config.min} char${config.min === 1 ? "" : "s"})).`, async ({ page }) => {
        const filePath = await updateExcelField(config.field, config.min);
        await uploadAndVerify(page, filePath);
      });

      test(`Verify Excel upload is accepted for ${TEMPLATE} Optional – ${config.field} (maximum length (${config.max} chars)).`, async ({ page }) => {
        const filePath = await updateExcelField(config.field, config.max);
        await uploadAndVerify(page, filePath);
      });

      test(`Verify Excel upload is accepted for ${TEMPLATE} Optional – ${config.field} (${config.belowMin === 0 ? "empty (below minimum)" : `${config.belowMin} chars (below minimum)`}).`, async ({ page }) => {
        const filePath = await updateExcelField(config.field, config.belowMin);
        await uploadAndVerify(page, filePath);
      });
    }
  });

  test.describe("Optional fields — invalid length", () => {
    for (const config of FV.fieldValidationOptional) {
      test(`Verify Excel upload returns an error file for ${TEMPLATE} Optional – ${config.field} (${config.aboveMax} chars (above maximum)).`, async ({ page }) => {
        const { filePath, invoiceNumber } = await updateExcelFieldWithInvoice(
          config.field,
          config.aboveMax
        );
        await runErrorValidation(
          page,
          { filePath, field: config.field, invoiceNumber, checkEdit: true });
      });
    }
  });

  test.describe("Conditional fields — valid length", () => {
    for (const config of conditionalLengthConfigs) {
      test(`Verify Excel upload is accepted for ${TEMPLATE} Conditional – ${config.field} (minimum length (${config.min} char${config.min === 1 ? "" : "s"})).`, async ({ page }) => {
        const filePath = await updateExcelField(config.field, config.min);
        await uploadAndVerify(page, filePath);
      });

      test(`Verify Excel upload is accepted for ${TEMPLATE} Conditional – ${config.field} (maximum length (${config.max} chars)).`, async ({ page }) => {
        const filePath = await updateExcelField(config.field, config.max);
        await uploadAndVerify(page, filePath);
      });

      test(`Verify Excel upload is accepted for ${TEMPLATE} Conditional – ${config.field} (${config.belowMin === 0 ? "empty (below minimum)" : `${config.belowMin} chars (below minimum)`}).`, async ({ page }) => {
        const filePath = await updateExcelField(config.field, config.belowMin);
        await uploadAndVerify(page, filePath);
      });
    }
  });

  test.describe("Conditional fields — invalid length", () => {
    for (const config of conditionalLengthConfigs) {
      test(`Verify Excel upload returns an error file for ${TEMPLATE} Conditional – ${config.field} (${config.aboveMax} chars (above maximum)).`, async ({ page }) => {
        const { filePath, invoiceNumber } = await updateExcelFieldWithInvoice(
          config.field,
          config.aboveMax
        );
        await runErrorValidation(
          page,
          { filePath, field: config.field, invoiceNumber, checkEdit: true });
      });
    }
  });

  test.describe("Numeric fields — valid digit count", () => {
    for (const config of numericFieldConfigs) {
      test(`Verify Excel upload is accepted for ${TEMPLATE} Numeric – ${config.field} (minimum digits (${config.min})).`, async ({ page }) => {
        const { filePath } = await patchNumericFieldOnFreshInvoice(
          config.field,
          config.min,
          config.decimals
        );
        await uploadAndVerify(page, filePath);
      });

      test(`Verify Excel upload is accepted for ${TEMPLATE} Numeric – ${config.field} (maximum digits (${config.max})).`, async ({ page }) => {
        const { filePath } = await patchNumericFieldOnFreshInvoice(
          config.field,
          config.max,
          config.decimals
        );
        await uploadAndVerify(page, filePath);
      });

      if (config.belowMin === 0) {
        test(`Verify Excel upload is accepted for ${TEMPLATE} Numeric – ${config.field} (empty (below minimum)).`, async ({ page }) => {
          const { filePath } = await patchNumericFieldOnFreshInvoice(
            config.field,
            config.belowMin,
            config.decimals
          );
          await uploadAndVerify(page, filePath);
        });
      }
    }
  });

  test.describe("Numeric fields — invalid digit count", () => {
    for (const config of numericFieldConfigs) {
      test(`Verify Excel upload returns an error file for ${TEMPLATE} Numeric – ${config.field} (${config.aboveMax} digits (above maximum)).`, async ({ page }) => {
        const { filePath, invoiceNumber } = await patchNumericFieldOnFreshInvoice(
          config.field,
          config.aboveMax,
          config.decimals
        );
        await runErrorValidation(
          page,
          { filePath, field: config.field, invoiceNumber, checkEdit: true });
      });
    }
  });

  test.describe("Invoice Currency dropdown", () => {
    test(`Verify Excel upload is accepted for ${TEMPLATE} Dropdown – Invoice Currency Code (all allowed codes).`, async ({ page }) => {
      const { filePath } = await generateInvoiceCurrencyExchangeBatchExcel(
        FV.INVOICE_CURRENCY_DROPDOWN_CODES,
        "allowed"
      );
      await uploadAndVerify(page, filePath);
    });

    test(`Verify Excel upload is rejected for ${TEMPLATE} Dropdown – Invoice Currency Code (non-AED with blank exchange rate).`, async ({ page }) => {
      test.setTimeout(DROPDOWN_TIMEOUT_MS);
      const { filePath } = await generateInvoiceCurrencyExchangeBatchExcel(
        NON_AED_INVOICE_CURRENCY_CODES,
        "invalid_blank_non_aed"
      );
      await uploadAndVerifyError(page, filePath);
    });
  });

  test.describe("Dropdown — valid values", () => {
    for (const config of dropdownMasterOnCovoro) {
      test(`Verify Excel upload is accepted for ${TEMPLATE} Dropdown – ${config.field} (all valid master values).`, async ({ page }) => {
        const timeoutMs =
          config.master === unitOfMeasurementValidTestData
            ? UNIT_OF_MEASUREMENT_TIMEOUT_MS
            : DROPDOWN_TIMEOUT_MS;
        test.setTimeout(timeoutMs);
        const files = await generateDropdownMasterExcel(config.field, config.master);
        for (const { filePath } of files) {
          await uploadAndVerify(page, filePath);
        }
      });
    }
  });

  test.describe("Dropdown — invalid values", () => {
    for (const config of dropdownInvalidOnCovoro) {
      for (const option of config.master) {
        test(`Verify Excel upload returns an error file for ${TEMPLATE} Dropdown – ${config.field} (invalid value "${option.label}").`, async ({ page }) => {
          const files = await generateDropdownMasterExcel(config.field, option);
          for (const { filePath, invoiceNumber } of files) {
            await runErrorValidation(
              page,
              { filePath, field: config.field, invoiceNumber, checkEdit: true });
          }
        });
      }
    }
  });

  test.describe("Format / context fields — VATIN, UUID, rate, FX, profit margin", () => {
    for (const tc of FV.formatContextFieldValidationCases) {
      const verb = tc.shouldError
        ? "returns an error file"
        : "is accepted";
      test(`Verify Excel upload ${verb} for ${TEMPLATE} ${tc.section} – ${tc.field} (${tc.condition}).`, async ({
        page,
      }) => {
        const { filePath, invoiceNumber } = await generateFormatContextFieldExcel(tc);
        if (tc.shouldError) {
          await runErrorValidation(page, {
            filePath,
            field: tc.field,
            invoiceNumber,
            checkEdit: true,
          });
        } else {
          await uploadAndVerify(page, filePath);
        }
      });
    }
  });
});
