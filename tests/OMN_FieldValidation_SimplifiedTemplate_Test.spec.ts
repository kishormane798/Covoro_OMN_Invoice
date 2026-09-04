import type { Page } from "@playwright/test";
import { test } from "../Src/baseTest";
import { uploadAndVerify } from "../Helpers/excel/uploadHelper";
import * as FV from "../testData/FieldValidations";
import { unitOfMeasurementValidTestData } from "../testData/Master";
import {
  runErrorValidation,
  runErrorValidationForAnyOfFields,
  runErrorValidationPassIfLengthAccepted,
} from "../Helpers/excel/excelEditMessageCheck";
import { buildInvoiceNumber, randomAlphaNumeric } from "../Helpers/excel/fieldValidationHelper";
import { generateFormatContextFieldExcel } from "../Helpers/excel/formatContextFieldValidationHelper";
import {
  generateOmanDropdownMasterExcel,
  generateOmanExemptReasonExcel,
  generateOmanFieldLengthExcel,
  generateOmanIssueDateExcel,
  generateOmanNumericFieldExcel,
  generateOmanSeededFieldExcel,
} from "../Helpers/excel/omanFieldValidationExcelHelper";
import {
  applySimplifiedTemplateEnv,
  clearSimplifiedTemplateEnv,
} from "../Helpers/excel/simplifiedTemplateContext";
import {
  FIELD_VALIDATION_TEMPLATE_SIMPLIFIED as TEMPLATE,
  DROPDOWN_ACCEPT_CASINGS,
  DROPDOWN_TIMEOUT_MS,
  UNIT_OF_MEASUREMENT_TIMEOUT_MS,
  HS_CODE_DROPDOWN_BATCH_SIZE,
  HS_CODE_DROPDOWN_TIMEOUT_MS,
  conditionalLengthOnSimplified,
  dropdownInvalidOnSimplified,
  dropdownMasterOnSimplified,
  fieldInvoiceNumberOnSimplified,
  formatContextOnSimplified,
  hsCodeDropdownOnSimplified,
  mandatoryOnSimplified,
  numericFieldConfigsOnSimplified,
  optionalOnSimplified,
  simplifiedFieldConfigs,
  uploadAndVerifyFieldAccepted,
} from "../Helpers/excel/fieldValidationSpecSupport";

const taxExemptionInvalidOnSimplified = simplifiedFieldConfigs(
  FV.taxExemptionReasonInvalidWithDocumentCompanionsConfig
);

test.describe(`Field validation (${TEMPLATE})`, () => {
  test.describe.configure({ mode: "parallel" });

  test.beforeEach(() => {
    applySimplifiedTemplateEnv();
  });

  test.afterAll(() => {
    clearSimplifiedTemplateEnv();
  });

  if (fieldInvoiceNumberOnSimplified.length) {
    test.describe("Invoice Number — valid length", () => {
      for (const config of fieldInvoiceNumberOnSimplified) {
        test(`${config.field} at minimum length (${config.min} character${config.min === 1 ? "" : "s"}) should be accepted. (${config.field})`, async ({ page }) => {
          const { filePath } = await generateOmanFieldLengthExcel(config.field, config.min);
          await uploadAndVerifyFieldAccepted(page, filePath);
        });

        test(`${config.field} at maximum length (${config.max} characters) should be accepted. (${config.field})`, async ({ page }) => {
          const { filePath } = await generateOmanFieldLengthExcel(config.field, config.max);
          await uploadAndVerifyFieldAccepted(page, filePath);
        });
      }
    });
  }

  test.describe("Invoice Number — invalid values", () => {
    test(`An empty Invoice Number should be rejected with an error. (Invoice Number)`, async ({ page }) => {
      const { filePath } = await generateOmanSeededFieldExcel("Invoice Number", "");
      await runErrorValidation(
        page,
        { filePath, field: "Invoice Number", checkEdit: false });
    });

    test(`An Invoice Number of 65 or more characters should be rejected with an error. (Invoice Number)`, async ({ page }) => {
      const tooLong = "INV-" + randomAlphaNumeric(80);
      const invoiceNumber = buildInvoiceNumber(tooLong, 65);
      const { filePath } = await generateOmanSeededFieldExcel("Invoice Number", invoiceNumber);
      await runErrorValidation(
        page,
        { filePath, field: "Invoice Number", invoiceNumber, checkEdit: true });
    });
  });

  test.describe("Invoice Issue Date", () => {
    const scenarios = FV.createInvoiceIssueDateScenarios();
    for (const scenario of scenarios) {
      const condition = scenario.name.trim();
      test(`Invoice Issue Date in ${condition} should be ${scenario.shouldError ? "rejected with an error" : "accepted"}. (Invoice Issue Date)`, async ({ page }) => {
        const invoiceNumber = FV.buildDynamicInvoiceNumber(scenario.invoicePrefix);
        const { filePath } = await generateOmanIssueDateExcel(
          invoiceNumber,
          scenario.issueDateValue,
          scenario.issueDateFormat
        );
        if (scenario.shouldError) {
          await runErrorValidation(
            page,
            { filePath, field: "Invoice Issue Date", invoiceNumber, checkEdit: true });
          return;
        }
        await uploadAndVerifyFieldAccepted(page, filePath);
      });
    }
  });

  if (mandatoryOnSimplified.length) {
    test.describe("Mandatory fields — valid length", () => {
      for (const config of mandatoryOnSimplified) {
        test(`${config.field} at minimum length (${config.min} character${config.min === 1 ? "" : "s"}) should be accepted. (${config.field})`, async ({ page }) => {
          const { filePath } = await generateOmanFieldLengthExcel(config.field, config.min);
          await uploadAndVerifyFieldAccepted(page, filePath);
        });

        test(`${config.field} at maximum length (${config.max} characters) should be accepted. (${config.field})`, async ({ page }) => {
          const { filePath } = await generateOmanFieldLengthExcel(config.field, config.max);
          await uploadAndVerifyFieldAccepted(page, filePath);
        });
      }
    });

    test.describe("Mandatory fields — invalid length", () => {
      for (const config of mandatoryOnSimplified) {
        test(`${config.belowMin === 0 ? `An empty ${config.field}` : `${config.field} of ${config.belowMin} characters`} should be rejected with an error. (${config.field})`, async ({ page }) => {
          const { filePath, invoiceNumber } = await generateOmanFieldLengthExcel(
            config.field,
            config.belowMin
          );
          await runErrorValidation(
            page,
            { filePath, field: config.field, invoiceNumber, checkEdit: true });
        });

        test(`${config.field} of ${config.aboveMax} characters should be rejected with an error. (${config.field})`, async ({ page }) => {
          const { filePath, invoiceNumber } = await generateOmanFieldLengthExcel(
            config.field,
            config.aboveMax
          );
          await runErrorValidation(
            page,
            { filePath, field: config.field, invoiceNumber, checkEdit: true });
        });
      }
    });
  }

  if (optionalOnSimplified.length) {
    test.describe("Optional fields — valid length", () => {
      for (const config of optionalOnSimplified) {
        test(`${config.field} at minimum length (${config.min} character${config.min === 1 ? "" : "s"}) should be accepted. (${config.field})`, async ({ page }) => {
          const { filePath } = await generateOmanFieldLengthExcel(config.field, config.min);
          await uploadAndVerifyFieldAccepted(page, filePath);
        });

        test(`${config.field} at maximum length (${config.max} characters) should be accepted. (${config.field})`, async ({ page }) => {
          const { filePath } = await generateOmanFieldLengthExcel(config.field, config.max);
          await uploadAndVerifyFieldAccepted(page, filePath);
        });

        test(`${config.belowMin === 0 ? `An empty ${config.field}` : `${config.field} of ${config.belowMin} characters`} should be accepted. (${config.field})`, async ({ page }) => {
          const { filePath } = await generateOmanFieldLengthExcel(config.field, config.belowMin);
          await uploadAndVerifyFieldAccepted(page, filePath);
        });
      }
    });

    test.describe("Optional fields — invalid length", () => {
      for (const config of optionalOnSimplified) {
        test(`${config.field} of ${config.aboveMax} characters should be rejected with an error. (${config.field})`, async ({ page }) => {
          const { filePath, invoiceNumber } = await generateOmanFieldLengthExcel(
            config.field,
            config.aboveMax
          );
          await runErrorValidation(
            page,
            { filePath, field: config.field, invoiceNumber, checkEdit: true });
        });
      }
    });
  }

  if (conditionalLengthOnSimplified.length) {
    test.describe("Conditional fields — valid length", () => {
      for (const config of conditionalLengthOnSimplified) {
        test(`${config.field} at minimum length (${config.min} character${config.min === 1 ? "" : "s"}) should be accepted. (${config.field})`, async ({ page }) => {
          const { filePath } = await generateOmanFieldLengthExcel(config.field, config.min);
          await uploadAndVerifyFieldAccepted(page, filePath);
        });

        test(`${config.field} at maximum length (${config.max} characters) should be accepted. (${config.field})`, async ({ page }) => {
          const { filePath } = await generateOmanFieldLengthExcel(config.field, config.max);
          await uploadAndVerifyFieldAccepted(page, filePath);
        });

        if (config.field === "Preceding Invoice reference") continue;
        if (config.field === "Supporting document reference") {
          test(`An empty Supporting document reference and Supporting document UUID should be accepted. (Supporting document reference)`, async ({
            page,
          }) => {
            const { filePath } = await generateOmanSeededFieldExcel(
              config.field,
              "",
              { skipDependentOverlay: true }
            );
            await uploadAndVerifyFieldAccepted(page, filePath);
          });
          continue;
        }
        if (config.field === "Third Party Name") {
          test(`An empty Third Party Name on a Full Tax invoice should be accepted. (Third Party Name)`, async ({
            page,
          }) => {
            const { filePath } = await generateOmanSeededFieldExcel(
              config.field,
              "",
              { skipDependentOverlay: true }
            );
            await uploadAndVerifyFieldAccepted(page, filePath);
          });
          continue;
        }
        if (
          config.field === "Third Party Address Line 1" ||
          config.field === "Third Party Address Line 2" ||
          config.field === "Third Party Address Line 3" ||
          config.field === "Third Party City" ||
          config.field === "Third Party Postal Code - PO Box Number"
        ) {
          continue;
        }

        test(`${config.belowMin === 0 ? `An empty ${config.field}` : `${config.field} of ${config.belowMin} characters`} should be accepted. (${config.field})`, async ({ page }) => {
          const { filePath } = await generateOmanFieldLengthExcel(config.field, config.belowMin);
          await uploadAndVerifyFieldAccepted(page, filePath);
        });
      }
    });

    test.describe("Conditional fields — invalid length", () => {
      for (const config of conditionalLengthOnSimplified) {
        test(`${config.field} of ${config.aboveMax} characters should be rejected with an error. (${config.field})`, async ({ page }) => {
          const { filePath, invoiceNumber } = await generateOmanFieldLengthExcel(
            config.field,
            config.aboveMax
          );
          await runErrorValidation(
            page,
            { filePath, field: config.field, invoiceNumber, checkEdit: true });
        });

        if (config.field === "Supporting document reference") {
          test(`When Supporting document UUID is provided, an empty Supporting document reference should be rejected with an error. (Supporting document reference)`, async ({
            page,
          }) => {
            const { filePath, invoiceNumber } = await generateOmanFieldLengthExcel(
              config.field,
              config.belowMin
            );
            await runErrorValidation(page, {
              filePath,
              field: config.field,
              invoiceNumber,
              checkEdit: true,
            });
          });
        } else if (config.field === "Third Party Name") {
          test(`An empty Third Party Name on a Third-party invoice should be rejected with an error. (Third Party Name)`, async ({
            page,
          }) => {
            const { filePath, invoiceNumber } = await generateOmanFieldLengthExcel(
              config.field,
              config.belowMin
            );
            await runErrorValidation(page, {
              filePath,
              field: config.field,
              invoiceNumber,
              checkEdit: true,
            });
          });
        } else if (
          config.field === "Preceding Invoice reference" ||
          config.field === "Third Party Address Line 1" ||
          config.field === "Third Party Address Line 2" ||
          config.field === "Third Party Address Line 3" ||
          config.field === "Third Party City" ||
          config.field === "Third Party Postal Code - PO Box Number"
        ) {
          test(`${config.belowMin === 0 ? `An empty ${config.field}` : `${config.field} of ${config.belowMin} characters`} should be rejected with an error. (${config.field})`, async ({ page }) => {
            const { filePath, invoiceNumber } = await generateOmanFieldLengthExcel(
              config.field,
              config.belowMin
            );
            await runErrorValidation(
              page,
              { filePath, field: config.field, invoiceNumber, checkEdit: true });
          });
        }
      }
    });
  }

  if (numericFieldConfigsOnSimplified.length) {
    test.describe("Numeric fields — valid digit count", () => {
      const titleOutcome = (expectsError?: boolean) =>
        expectsError ? "should be rejected with an error" : "should be accepted";

      const runNumericBoundary = async (
        page: Page,
        config: (typeof numericFieldConfigsOnSimplified)[number],
        digitCount: number,
        expectsError?: boolean
      ) => {
        const { filePath, invoiceNumber } = await generateOmanNumericFieldExcel(
          config.field,
          digitCount,
          config.decimals
        );
        if (!expectsError) {
          await uploadAndVerifyFieldAccepted(page, filePath);
          return;
        }
        await runErrorValidationForAnyOfFields(page, {
          filePath,
          fields: FV.formulaNumericRelatedErrorFields(config.field),
          invoiceNumber,
          checkEdit: true,
        });
      };

      for (const config of numericFieldConfigsOnSimplified) {
        test(`${config.field} at minimum value (${FV.formatOmanNumericBoundaryValue(config.min, config.decimals ?? 2)}) ${titleOutcome(config.minExpectsError)}. (${config.field})`, async ({ page }) => {
          await runNumericBoundary(page, config, config.min, config.minExpectsError);
        });

        test(`${config.field} at maximum digits (${config.max}) ${titleOutcome(config.maxExpectsError)}. (${config.field})`, async ({ page }) => {
          await runNumericBoundary(page, config, config.max, config.maxExpectsError);
        });

        if (config.belowMin === 0 && !config.omitEmptyTest) {
          test(`An empty ${config.field} ${titleOutcome(config.emptyExpectsError)}. (${config.field})`, async ({ page }) => {
            await runNumericBoundary(page, config, config.belowMin, config.emptyExpectsError);
          });
        }

        if (config.allowsNegative) {
          const negativeValue = `-${FV.formatOmanNumericBoundaryValue(config.min, config.decimals ?? 2)}`;
          test(`${config.field} with negative value (${negativeValue}) should be accepted. (${config.field})`, async ({ page }) => {
            const { filePath } = await generateOmanSeededFieldExcel(config.field, negativeValue);
            await uploadAndVerifyFieldAccepted(page, filePath);
          });
        }
      }
    });

    test.describe("Numeric fields — invalid digit count", () => {
      for (const config of numericFieldConfigsOnSimplified) {
        test(`${config.field} of ${config.aboveMax} digits should be rejected with an error. (${config.field})`, async ({ page }) => {
          const { filePath, invoiceNumber } = await generateOmanNumericFieldExcel(
            config.field,
            config.aboveMax,
            config.decimals
          );
          await runErrorValidation(
            page,
            {
              filePath,
              field: FV.documentLevelAmountVatErrorField(config.field) ?? config.field,
              invoiceNumber,
              checkEdit: true,
            });
        });
      }
    });
  }

  test.describe("Invoice Currency dropdown", () => {
    for (const { writeCasing, condition } of DROPDOWN_ACCEPT_CASINGS.filter(
      ({ writeCasing: casing }) => casing !== "lower"
    )) {
      test(`Invoice Currency Code with ${condition} should be accepted. (Invoice Currency Code)`, async ({ page }) => {
        test.setTimeout(DROPDOWN_TIMEOUT_MS);
        const files = await generateOmanDropdownMasterExcel(
          FV.INVOICE_CURRENCY_CODE_FIELD,
          FV.INVOICE_CURRENCY_DROPDOWN_CODES,
          { writeCasing }
        );
        for (const { filePath } of files) {
          await uploadAndVerify(page, filePath);
        }
      });
    }
  });

  if (dropdownMasterOnSimplified.length) {
    test.describe("Dropdown — valid values", () => {
      for (const { writeCasing, condition } of DROPDOWN_ACCEPT_CASINGS) {
        test.describe(condition, () => {
          for (const config of dropdownMasterOnSimplified) {
            if (config.field === FV.INVOICE_CURRENCY_CODE_FIELD && writeCasing === "lower") continue;
            test(`${config.field} with ${condition} should be accepted. (${config.field})`, async ({ page }) => {
              const timeoutMs =
                config.master === unitOfMeasurementValidTestData
                  ? UNIT_OF_MEASUREMENT_TIMEOUT_MS
                  : DROPDOWN_TIMEOUT_MS;
              test.setTimeout(timeoutMs);
              const files = await generateOmanDropdownMasterExcel(
                config.field,
                config.master,
                { writeCasing }
              );
              for (const { filePath } of files) {
                await uploadAndVerify(page, filePath);
              }
            });
          }
        });
      }
    });
  }

  if (hsCodeDropdownOnSimplified.length) {
    test.describe("Dropdown — valid HS codes", () => {
      for (const config of hsCodeDropdownOnSimplified) {
        test(`Item classification identifier (${config.part}) with exact master values should be accepted. (Item classification identifier)`, async ({
          page,
        }) => {
          test.setTimeout(HS_CODE_DROPDOWN_TIMEOUT_MS);
          const files = await generateOmanDropdownMasterExcel(
            config.field,
            config.master,
            { writeCasing: "exact", batchSize: HS_CODE_DROPDOWN_BATCH_SIZE }
          );
          for (const { filePath } of files) {
            await uploadAndVerify(page, filePath);
          }
        });
      }
    });
  }

  test.describe("Dropdown — valid tax exemption reason (Zero rated)", () => {
    for (const { writeCasing, condition } of DROPDOWN_ACCEPT_CASINGS) {
      test(`Tax exemption reason code (Zero rated) with ${condition} should be accepted. (Tax exemption reason code)`, async ({
        page,
      }) => {
        test.setTimeout(DROPDOWN_TIMEOUT_MS);
        const files = await generateOmanDropdownMasterExcel(
          FV.taxExemptionReasonZeroRatedMasterConfig.field,
          FV.taxExemptionReasonZeroRatedMasterConfig.master,
          {
            writeCasing,
            vatContext: FV.taxExemptionReasonZeroRatedMasterConfig.vatContext,
          }
        );
        for (const { filePath } of files) {
          await uploadAndVerify(page, filePath);
        }
      });
    }
  });

  if (dropdownInvalidOnSimplified.length) {
    test.describe("Dropdown — invalid values", () => {
      for (const config of dropdownInvalidOnSimplified) {
        for (const option of config.master) {
          test(`${config.field} with invalid value "${option.label}" should be rejected with an error. (${config.field})`, async ({ page }) => {
            const files = await generateOmanDropdownMasterExcel(config.field, option);
            for (const { filePath, invoiceNumber } of files) {
              await runErrorValidation(
                page,
                { filePath, field: config.field, invoiceNumber, checkEdit: true });
            }
          });
        }
      }
    });
  }

  if (taxExemptionInvalidOnSimplified.length) {
    test.describe("Dropdown — invalid tax exemption reason (charges/allowances companions)", () => {
      for (const config of taxExemptionInvalidOnSimplified) {
        for (const option of config.master) {
          test(`${config.field} (${config.vatCategoryLabel}) with invalid value "${option.label}" should be rejected with an error. (${config.field})`, async ({
            page,
          }) => {
            test.setTimeout(DROPDOWN_TIMEOUT_MS);
            const files = await generateOmanDropdownMasterExcel(config.field, option, {
              vatContext: config.vatContext,
            });
            for (const { filePath, invoiceNumber } of files) {
              await runErrorValidation(page, {
                filePath,
                field: config.field,
                invoiceNumber,
                checkEdit: true,
              });
            }
          });
        }
      }
    });
  }

  test.describe("Tax exemption reason — code / text companion", () => {
    const reasonCode = FV.TAX_EXEMPTION_REASON_SAMPLE;
    const reasonText = "Exempt supply under Oman VAT";

    test(`Exempt VAT with exemption code and no text should be accepted. (Tax exemption reason text)`, async ({
      page,
    }) => {
      const { filePath } = await generateOmanExemptReasonExcel(reasonCode, "");
      await uploadAndVerifyFieldAccepted(page, filePath);
    });

    test(`Exempt VAT with exemption text and no code should be rejected with an error. (Tax exemption reason code)`, async ({
      page,
    }) => {
      const { filePath, invoiceNumber } = await generateOmanExemptReasonExcel(
        "",
        reasonText
      );
      await runErrorValidation(page, {
        filePath,
        field: FV.TAX_EXEMPTION_REASON_CODE_FIELD,
        invoiceNumber,
        checkEdit: true,
      });
    });
  });

  if (formatContextOnSimplified.length) {
    test.describe("Format / context fields — UUID, rate, FX, profit margin", () => {
      for (const tc of formatContextOnSimplified) {
        const outcome = tc.shouldError
          ? "should be rejected with an error"
          : "should be accepted";
        const title =
          tc.field === "Supporting document UUID" &&
          tc.value === "" &&
          tc.shouldError
            ? `When Supporting document reference is provided, an empty Supporting document UUID should be rejected with an error. (${tc.field})`
            : `${tc.field} with ${tc.condition} ${outcome}. (${tc.field})`;
        test(`${title}`, async ({
          page,
        }) => {
          const { filePath, invoiceNumber } = await generateFormatContextFieldExcel(tc);
          if (tc.requiredErrorSubstrings?.length) {
            await runErrorValidationPassIfLengthAccepted(page, {
              filePath,
              field: tc.field,
              forbiddenCommentSubstrings: tc.forbiddenErrorSubstrings,
              requiredCommentSubstrings: tc.requiredErrorSubstrings,
            });
          } else if (tc.shouldError) {
            await runErrorValidation(page, {
              filePath,
              field: tc.field,
              invoiceNumber,
              checkEdit: true,
            });
          } else {
            await uploadAndVerifyFieldAccepted(page, filePath);
          }
        });
      }
    });
  }
});
