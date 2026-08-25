import type { Page } from "@playwright/test";
import { test } from "../Src/baseTest";
import { uploadAndVerify, uploadAndVerifyError } from "../Helpers/excel/uploadHelper";
import { generateInvoiceCurrencyExchangeBatchExcel } from "../utils/excel/invoiceExcel";
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
  generateOmanPartyIdentifierLengthExcel,
  generateOmanCl06IdentifierSchemeExcel,
  generateOmanItemAttributePairExcel,
  generateOmanImportDateCustomsExcel,
  generateOmanPrepaymentPairExcel,
  generateOmanSeededFieldExcel,
  generateOmanSupportingDocumentPairExcel,
} from "../Helpers/excel/omanFieldValidationExcelHelper";
import {
  FIELD_VALIDATION_TEMPLATE as TEMPLATE,
  DROPDOWN_ACCEPT_CASINGS,
  DROPDOWN_TIMEOUT_MS,
  NON_OMR_INVOICE_CURRENCY_CODES,
  UNIT_OF_MEASUREMENT_TIMEOUT_MS,
  conditionalLengthConfigs,
  dropdownInvalidOnCovoro,
  dropdownMasterOnCovoro,
  numericFieldConfigs,
} from "../Helpers/excel/fieldValidationSpecSupport";

test.describe(`Field validation (${TEMPLATE})`, () => {
  test.describe.configure({ mode: "parallel" });

  test.describe("Invoice Number — valid length", () => {
    for (const config of FV.fieldInvoice_number) {
      test(`${config.field} at minimum length (${config.min} character${config.min === 1 ? "" : "s"}) should be accepted. (${config.field})`, async ({ page }) => {
        const { filePath } = await generateOmanFieldLengthExcel(config.field, config.min);
        await uploadAndVerify(page, filePath);
      });

      test(`${config.field} at maximum length (${config.max} characters) should be accepted. (${config.field})`, async ({ page }) => {
        const { filePath } = await generateOmanFieldLengthExcel(config.field, config.max);
        await uploadAndVerify(page, filePath);
      });
    }
  });

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
        await uploadAndVerify(page, filePath);
      });
    }
  });

  test.describe("Mandatory fields — valid length", () => {
    for (const config of FV.fieldValidationMandatory) {
      // Dummy min/max strings are not the logged-in seller TIN → error file.
      const mustBeLoginTin = config.field === "Seller electronic address";
      const outcome = mustBeLoginTin
        ? "should be rejected with an error"
        : "should be accepted";

      test(`${config.field} at minimum length (${config.min} character${config.min === 1 ? "" : "s"}) ${outcome}. (${config.field})`, async ({ page }) => {
        const { filePath, invoiceNumber } = await generateOmanFieldLengthExcel(
          config.field,
          config.min
        );
        if (mustBeLoginTin) {
          await runErrorValidation(
            page,
            { filePath, field: config.field, invoiceNumber, checkEdit: true });
          return;
        }
        await uploadAndVerify(page, filePath);
      });

      test(`${config.field} at maximum length (${config.max} characters) ${outcome}. (${config.field})`, async ({ page }) => {
        const { filePath, invoiceNumber } = await generateOmanFieldLengthExcel(
          config.field,
          config.max
        );
        if (mustBeLoginTin) {
          await runErrorValidation(
            page,
            { filePath, field: config.field, invoiceNumber, checkEdit: true });
          return;
        }
        await uploadAndVerify(page, filePath);
      });
    }
  });

  test.describe("Mandatory fields — invalid length", () => {
    for (const config of FV.fieldValidationMandatory) {
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

  test.describe("Optional fields — valid length", () => {
    for (const config of FV.fieldValidationOptional) {
      test(`${config.field} at minimum length (${config.min} character${config.min === 1 ? "" : "s"}) should be accepted. (${config.field})`, async ({ page }) => {
        const { filePath } = await generateOmanFieldLengthExcel(config.field, config.min);
        await uploadAndVerify(page, filePath);
      });

      test(`${config.field} at maximum length (${config.max} characters) should be accepted. (${config.field})`, async ({ page }) => {
        const { filePath } = await generateOmanFieldLengthExcel(config.field, config.max);
        await uploadAndVerify(page, filePath);
      });

      test(`${config.belowMin === 0 ? `An empty ${config.field}` : `${config.field} of ${config.belowMin} characters`} should be accepted. (${config.field})`, async ({ page }) => {
        const { filePath } = await generateOmanFieldLengthExcel(config.field, config.belowMin);
        await uploadAndVerify(page, filePath);
      });
    }
  });

  test.describe("Optional fields — invalid length", () => {
    for (const config of FV.fieldValidationOptional) {
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

  test.describe("Conditional fields — valid length", () => {
    for (const config of conditionalLengthConfigs) {
      test(`${config.field} at minimum length (${config.min} character${config.min === 1 ? "" : "s"}) should be accepted. (${config.field})`, async ({ page }) => {
        const { filePath } = await generateOmanFieldLengthExcel(config.field, config.min);
        await uploadAndVerify(page, filePath);
      });

      test(`${config.field} at maximum length (${config.max} characters) should be accepted. (${config.field})`, async ({ page }) => {
        const { filePath } = await generateOmanFieldLengthExcel(config.field, config.max);
        await uploadAndVerify(page, filePath);
      });

      // Credit Note overlay (ALIGNED-IBRP-028-OM / IBR-032-OM): empty is required → error file.
      if (config.field === "Preceding Invoice reference") continue;
      // IBR-155-OM: Export + Export of Services → empty Service Type is mandatory → error file.
      if (config.field === "Service Type Code") continue;

      test(`${config.belowMin === 0 ? `An empty ${config.field}` : `${config.field} of ${config.belowMin} characters`} should be accepted. (${config.field})`, async ({ page }) => {
        const { filePath } = await generateOmanFieldLengthExcel(config.field, config.belowMin);
        await uploadAndVerify(page, filePath);
      });
    }
  });

  test.describe("Party identifier — companion length", () => {
    for (const scenario of FV.PARTY_IDENTIFIER_LENGTH_CASES) {
      const outcome = scenario.shouldAccept
        ? "should be accepted"
        : "should be rejected with an error";
      test(`${scenario.identifierField} with ${scenario.titleSuffix} ${outcome}. (${scenario.identifierField})`, async ({
        page,
      }) => {
        const { filePath, invoiceNumber } =
          await generateOmanPartyIdentifierLengthExcel({
            party: scenario.party,
            companion: scenario.companion,
            length: scenario.length,
          });
        if (scenario.shouldAccept) {
          await uploadAndVerify(page, filePath);
        } else {
          await runErrorValidation(page, {
            filePath,
            field: scenario.identifierField,
            invoiceNumber,
            checkEdit: true,
          });
        }
      });
    }
  });

  test.describe("CL-06-OM — Buyer/Seller identifier scheme codelist", () => {
    for (const scenario of FV.CL06_OM_IDENTIFIER_SCHEME_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const { filePath, invoiceNumber } =
          await generateOmanCl06IdentifierSchemeExcel({
            party: scenario.party,
            schemeValue: scenario.schemeValue,
            identifier: scenario.identifier,
          });
        if (scenario.shouldError) {
          await runErrorValidation(page, {
            filePath,
            field: scenario.expectedErrorField,
            invoiceNumber,
            checkEdit: true,
          });
        } else {
          await uploadAndVerify(page, filePath);
        }
      });
    }
  });

  test.describe("Conditional fields — invalid length", () => {
    for (const config of conditionalLengthConfigs) {
      test(`${config.field} of ${config.aboveMax} characters should be rejected with an error. (${config.field})`, async ({ page }) => {
        const { filePath, invoiceNumber } = await generateOmanFieldLengthExcel(
          config.field,
          config.aboveMax
        );
        await runErrorValidation(
          page,
          { filePath, field: config.field, invoiceNumber, checkEdit: true });
      });

      if (
        config.field === "Preceding Invoice reference" ||
        config.field === "Service Type Code"
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

  test.describe("Numeric fields — valid digit count", () => {
    const titleOutcome = (expectsError?: boolean) =>
      expectsError ? "should be rejected with an error" : "should be accepted";

    const runNumericBoundary = async (
      page: Page,
      config: (typeof numericFieldConfigs)[number],
      digitCount: number,
      expectsError?: boolean
    ) => {
      const { filePath, invoiceNumber } = await generateOmanNumericFieldExcel(
        config.field,
        digitCount,
        config.decimals
      );
      if (!expectsError) {
        await uploadAndVerify(page, filePath);
        return;
      }
      // Formula fields: min/max → wrong calculation; empty → length.
      // Doc allowance/charge amount → Vat category - allowances/charges (IBR-062/064).
      await runErrorValidationForAnyOfFields(page, {
        filePath,
        fields: FV.formulaNumericRelatedErrorFields(config.field),
        invoiceNumber,
        checkEdit: true,
      });
    };

    for (const config of numericFieldConfigs) {
      test(`${config.field} at minimum value (${FV.formatOmanNumericBoundaryValue(config.min, config.decimals ?? 2)}) ${titleOutcome(config.minExpectsError)}. (${config.field})`, async ({ page }) => {
        await runNumericBoundary(page, config, config.min, config.minExpectsError);
      });

      test(`${config.field} at maximum digits (${config.max}) ${titleOutcome(config.maxExpectsError)}. (${config.field})`, async ({ page }) => {
        await runNumericBoundary(page, config, config.max, config.maxExpectsError);
      });

      if (config.belowMin === 0) {
        test(`An empty ${config.field} ${titleOutcome(config.emptyExpectsError)}. (${config.field})`, async ({ page }) => {
          await runNumericBoundary(page, config, config.belowMin, config.emptyExpectsError);
        });
      }

      if (config.allowsNegative) {
        const negativeValue = `-${FV.formatOmanNumericBoundaryValue(config.min, config.decimals ?? 2)}`;
        test(`${config.field} with negative value (${negativeValue}) should be accepted. (${config.field})`, async ({ page }) => {
          const { filePath } = await generateOmanSeededFieldExcel(config.field, negativeValue);
          await uploadAndVerify(page, filePath);
        });
      }
    }
  });

  test.describe("Numeric fields — invalid digit count", () => {
    for (const config of numericFieldConfigs) {
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

  test.describe("Invoice Currency dropdown", () => {
    for (const { writeCasing, condition } of DROPDOWN_ACCEPT_CASINGS) {
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

    test(`A non-OMR Invoice Currency Code with a blank exchange rate should be rejected with an error. (Invoice Currency Code)`, async ({ page }) => {
      test.setTimeout(DROPDOWN_TIMEOUT_MS);
      const { filePath } = await generateInvoiceCurrencyExchangeBatchExcel(
        NON_OMR_INVOICE_CURRENCY_CODES,
        "invalid_blank_non_aed"
      );
      await uploadAndVerifyError(page, filePath);
    });
  });

  test.describe("Dropdown — valid values", () => {
    for (const { writeCasing, condition } of DROPDOWN_ACCEPT_CASINGS) {
      test.describe(condition, () => {
        for (const config of dropdownMasterOnCovoro) {
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

  test.describe("Dropdown — invalid values", () => {
    for (const config of dropdownInvalidOnCovoro) {
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

  test.describe("Dropdown — invalid tax exemption reason (charges/allowances companions)", () => {
    for (const config of FV.taxExemptionReasonInvalidWithDocumentCompanionsConfig) {
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

  test.describe("Tax exemption reason — Exempt from tax interdependency", () => {
    const reasonCode = FV.TAX_EXEMPTION_REASON_SAMPLE;
    const reasonText = "Exempt supply under Oman VAT";

    test(`Exempt VAT with exemption code and text should be accepted. (Tax exemption reason)`, async ({
      page,
    }) => {
      const { filePath } = await generateOmanExemptReasonExcel(reasonCode, reasonText);
      await uploadAndVerify(page, filePath);
    });

    test(`Exempt VAT with exemption code and no text should be accepted. (Tax exemption reason text)`, async ({
      page,
    }) => {
      const { filePath } = await generateOmanExemptReasonExcel(reasonCode, "");
      await uploadAndVerify(page, filePath);
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

    test(`Exempt VAT with empty exemption code and text should be rejected with an error. (Tax exemption reason)`, async ({
      page,
    }) => {
      const { filePath, invoiceNumber } = await generateOmanExemptReasonExcel("", "");
      await runErrorValidation(page, {
        filePath,
        field: FV.TAX_EXEMPTION_REASON_CODE_FIELD,
        invoiceNumber,
        checkEdit: true,
      });
    });
  });

  test.describe("Prepayment invoice number / UUID interdependency", () => {
    const prepayNumberField = "Prepayment invoice number";
    const prepayUuidField = "Prepayment invoice UUID";
    const prepayNumber = "PRE-OMN-001";
    const prepayUuid = FV.PRECEDING_INVOICE_UUID_SAMPLE;

    test(`An empty Prepayment invoice number should be accepted. (Prepayment invoice number)`, async ({
      page,
    }) => {
      const { filePath } = await generateOmanFieldLengthExcel(prepayNumberField, 0);
      await uploadAndVerify(page, filePath);
    });

    test(`A Prepayment invoice number with UUID should be accepted. (Prepayment invoice number)`, async ({
      page,
    }) => {
      const { filePath } = await generateOmanPrepaymentPairExcel(
        prepayNumber,
        prepayUuid
      );
      await uploadAndVerify(page, filePath);
    });

    test(`A Prepayment invoice number without UUID should be rejected with an error. (Prepayment invoice UUID)`, async ({
      page,
    }) => {
      const { filePath, invoiceNumber } = await generateOmanPrepaymentPairExcel(
        prepayNumber,
        ""
      );
      await runErrorValidation(page, {
        filePath,
        field: prepayUuidField,
        invoiceNumber,
        checkEdit: true,
      });
    });

    test(`A transaction type without Prepayment invoice number and UUID should be accepted. (Prepayment invoice number)`, async ({
      page,
    }) => {
      const { filePath } = await generateOmanPrepaymentPairExcel("", "");
      await uploadAndVerify(page, filePath);
    });

    test(`A Prepayment invoice UUID without number should be rejected with an error. (Prepayment invoice number)`, async ({
      page,
    }) => {
      const { filePath, invoiceNumber } = await generateOmanPrepaymentPairExcel(
        "",
        prepayUuid
      );
      await runErrorValidation(page, {
        filePath,
        field: prepayNumberField,
        invoiceNumber,
        checkEdit: true,
      });
    });
  });

  test.describe("Supporting document reference / UUID interdependency", () => {
    const supportRef = FV.SUPPORTING_DOCUMENT_REFERENCE_SAMPLE;
    const supportUuid = FV.PRECEDING_INVOICE_UUID_SAMPLE;

    test(`A supporting document reference with UUID should be accepted. (Supporting document reference)`, async ({
      page,
    }) => {
      const { filePath } = await generateOmanSupportingDocumentPairExcel(
        supportRef,
        supportUuid
      );
      await uploadAndVerify(page, filePath);
    });

    test(`A supporting document reference without UUID should be rejected with an error. (Supporting document UUID)`, async ({
      page,
    }) => {
      const { filePath, invoiceNumber } =
        await generateOmanSupportingDocumentPairExcel(supportRef, "");
      await runErrorValidation(page, {
        filePath,
        field: FV.SUPPORTING_DOCUMENT_UUID_FIELD,
        invoiceNumber,
        checkEdit: true,
      });
    });

    test(`A supporting document UUID without reference should be rejected with an error. (Supporting document reference)`, async ({
      page,
    }) => {
      const { filePath, invoiceNumber } =
        await generateOmanSupportingDocumentPairExcel("", supportUuid);
      await runErrorValidation(page, {
        filePath,
        field: FV.SUPPORTING_DOCUMENT_REFERENCE_FIELD,
        invoiceNumber,
        checkEdit: true,
      });
    });
  });

  test.describe("Import date / Customs Declaration interdependency", () => {
    const importDate = "2026-06-15";
    const customsNumber = "CUST-OMN-001";

    test(`An import date with Customs Declaration number should be accepted. (Customs Declaration number)`, async ({
      page,
    }) => {
      const { filePath } = await generateOmanImportDateCustomsExcel({
        importDate,
        customsDeclarationNumber: customsNumber,
      });
      await uploadAndVerify(page, filePath);
    });

    test(`An import date without Customs Declaration number should be rejected with an error. (Customs Declaration number)`, async ({
      page,
    }) => {
      const { filePath, invoiceNumber } = await generateOmanImportDateCustomsExcel({
        importDate,
        customsDeclarationNumber: "",
      });
      await runErrorValidation(page, {
        filePath,
        field: FV.CUSTOMS_DECLARATION_NUMBER_FIELD,
        invoiceNumber,
        checkEdit: true,
      });
    });

    test(`Import of Goods without Customs Declaration number should be rejected with an error. (Customs Declaration number)`, async ({
      page,
    }) => {
      const { filePath, invoiceNumber } = await generateOmanImportDateCustomsExcel({
        importDate,
        customsDeclarationNumber: "",
        invoiceTransactionTypeCode: FV.TXN_IMPORT_OF_GOODS,
      });
      await runErrorValidation(page, {
        filePath,
        field: FV.CUSTOMS_DECLARATION_NUMBER_FIELD,
        invoiceNumber,
        checkEdit: true,
      });
    });
  });

  test.describe("Item attribute name / value interdependency", () => {
    const attributeName = "Color";
    const attributeValue = "Black";

    test(`An item attribute name with value should be accepted. (Item attribute name)`, async ({
      page,
    }) => {
      const { filePath } = await generateOmanItemAttributePairExcel(
        attributeName,
        attributeValue
      );
      await uploadAndVerify(page, filePath);
    });

    test(`An item attribute name without value should be rejected with an error. (Item attribute value)`, async ({
      page,
    }) => {
      const { filePath, invoiceNumber } = await generateOmanItemAttributePairExcel(
        attributeName,
        ""
      );
      await runErrorValidation(page, {
        filePath,
        field: FV.ITEM_ATTRIBUTE_VALUE_FIELD,
        invoiceNumber,
        checkEdit: true,
      });
    });

    test(`An item attribute value without name should be rejected with an error. (Item attribute name)`, async ({
      page,
    }) => {
      const { filePath, invoiceNumber } = await generateOmanItemAttributePairExcel(
        "",
        attributeValue
      );
      await runErrorValidation(page, {
        filePath,
        field: FV.ITEM_ATTRIBUTE_NAME_FIELD,
        invoiceNumber,
        checkEdit: true,
      });
    });
  });

  test.describe("Format / context fields — VATIN, UUID, rate, FX, profit margin", () => {
    for (const tc of FV.formatContextFieldValidationCases) {
      const outcome = tc.shouldError
        ? "should be rejected with an error"
        : "should be accepted";
      test(`${tc.field} with ${tc.condition} ${outcome}. (${tc.field})`, async ({
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
          await uploadAndVerify(page, filePath);
        }
      });
    }
  });
});
