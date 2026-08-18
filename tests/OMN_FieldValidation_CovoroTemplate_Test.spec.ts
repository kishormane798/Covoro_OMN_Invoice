import type { Page } from "@playwright/test";
import { test } from "../Src/baseTest";
import { uploadAndVerify, uploadAndVerifyError } from "../Helpers/uploadHelper";
import { generateInvoiceCurrencyExchangeBatchExcel } from "../utils/invoiceExcel";
import * as FV from "../testData/FieldValidations";
import { unitOfMeasurementValidTestData } from "../testData/FieldValidations/Master";
import {
  runErrorValidation,
  runErrorValidationForAnyOfFields,
} from "../Helpers/excelEditMessageCheck";
import { buildInvoiceNumber, randomAlphaNumeric } from "../Helpers/fieldValidationHelper";
import { generateFormatContextFieldExcel } from "../Helpers/formatContextFieldValidationHelper";
import {
  generateOmanDropdownMasterExcel,
  generateOmanExemptReasonExcel,
  generateOmanFieldLengthExcel,
  generateOmanIssueDateExcel,
  generateOmanNumericFieldExcel,
  generateOmanPartyIdentifierLengthExcel,
  generateOmanPrepaymentPairExcel,
  generateOmanSeededFieldExcel,
  generateOmanSupportingDocumentPairExcel,
} from "../Helpers/omanFieldValidationExcelHelper";

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
const NON_OMR_INVOICE_CURRENCY_CODES = FV.INVOICE_CURRENCY_DROPDOWN_CODES.filter(
  (code) => code !== "OMR"
);
const DROPDOWN_TIMEOUT_MS = 6 * 60 * 1000;
const UNIT_OF_MEASUREMENT_TIMEOUT_MS = 10 * 60 * 1000;

/**
 * Length-rule fields that need pattern/format suites (IBR-002 / IBR-003 / Tax Rate),
 * not random length strings.
 */
const CONDITIONAL_LENGTH_SKIP = new Set([
  // Covered by explicit accepted/error cases in the prepayment interdependency suite.
  "Prepayment invoice number",
  "Seller VAT Identifier (TRN / TIN)",
  "Buyer VAT identifier",
  "Third Party VATIN",
  "Unique Identifier Number",
  "Prepayment invoice UUID",
  "Supporting document UUID",
  "Tax Rate",
  // Covered by Party identifier — companion length (XOR scheme/code matrix).
  "Buyer identifier",
  "Seller identifier",
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

test.describe(`Excel upload — field validation (${TEMPLATE})`, () => {
  test.describe.configure({ mode: "parallel" });

  test.describe("Invoice Number — valid length", () => {
    for (const config of FV.fieldInvoice_number) {
      test(`Verify Excel upload is accepted for ${TEMPLATE} Document – ${config.field} (minimum length (${config.min} char${config.min === 1 ? "" : "s"})).`, async ({ page }) => {
        const { filePath } = await generateOmanFieldLengthExcel(config.field, config.min);
        await uploadAndVerify(page, filePath);
      });

      test(`Verify Excel upload is accepted for ${TEMPLATE} Document – ${config.field} (maximum length (${config.max} chars)).`, async ({ page }) => {
        const { filePath } = await generateOmanFieldLengthExcel(config.field, config.max);
        await uploadAndVerify(page, filePath);
      });
    }
  });

  test.describe("Invoice Number — invalid values", () => {
    test(`Verify Excel upload returns an error file for ${TEMPLATE} Document – Invoice Number (empty).`, async ({ page }) => {
      const { filePath } = await generateOmanSeededFieldExcel("Invoice Number", "");
      await runErrorValidation(
        page,
        { filePath, field: "Invoice Number", checkEdit: false });
    });

    test(`Verify Excel upload returns an error file for ${TEMPLATE} Document – Invoice Number (65+ chars).`, async ({ page }) => {
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
      const condition = scenario.name
        .replace(/ \(should pass\)/gi, "")
        .replace(/ \(should error\)/gi, "")
        .trim();
      test(`Verify Excel upload ${scenario.shouldError ? "returns an error file" : "is accepted"} for ${TEMPLATE} Document – Invoice Issue Date (${condition}).`, async ({ page }) => {
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
      const outcome = mustBeLoginTin ? "returns an error file" : "is accepted";

      test(`Verify Excel upload ${outcome} for ${TEMPLATE} Mandatory – ${config.field} (minimum length (${config.min} char${config.min === 1 ? "" : "s"})).`, async ({ page }) => {
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

      test(`Verify Excel upload ${outcome} for ${TEMPLATE} Mandatory – ${config.field} (maximum length (${config.max} chars)).`, async ({ page }) => {
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
      test(`Verify Excel upload returns an error file for ${TEMPLATE} Mandatory – ${config.field} (${config.belowMin === 0 ? "empty (below minimum)" : `${config.belowMin} chars (below minimum)`}).`, async ({ page }) => {
        const { filePath, invoiceNumber } = await generateOmanFieldLengthExcel(
          config.field,
          config.belowMin
        );
        await runErrorValidation(
          page,
          { filePath, field: config.field, invoiceNumber, checkEdit: true });
      });

      test(`Verify Excel upload returns an error file for ${TEMPLATE} Mandatory – ${config.field} (${config.aboveMax} chars (above maximum)).`, async ({ page }) => {
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
      test(`Verify Excel upload is accepted for ${TEMPLATE} Optional – ${config.field} (minimum length (${config.min} char${config.min === 1 ? "" : "s"})).`, async ({ page }) => {
        const { filePath } = await generateOmanFieldLengthExcel(config.field, config.min);
        await uploadAndVerify(page, filePath);
      });

      test(`Verify Excel upload is accepted for ${TEMPLATE} Optional – ${config.field} (maximum length (${config.max} chars)).`, async ({ page }) => {
        const { filePath } = await generateOmanFieldLengthExcel(config.field, config.max);
        await uploadAndVerify(page, filePath);
      });

      test(`Verify Excel upload is accepted for ${TEMPLATE} Optional – ${config.field} (${config.belowMin === 0 ? "empty (below minimum)" : `${config.belowMin} chars (below minimum)`}).`, async ({ page }) => {
        const { filePath } = await generateOmanFieldLengthExcel(config.field, config.belowMin);
        await uploadAndVerify(page, filePath);
      });
    }
  });

  test.describe("Optional fields — invalid length", () => {
    for (const config of FV.fieldValidationOptional) {
      test(`Verify Excel upload returns an error file for ${TEMPLATE} Optional – ${config.field} (${config.aboveMax} chars (above maximum)).`, async ({ page }) => {
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
      test(`Verify Excel upload is accepted for ${TEMPLATE} Conditional – ${config.field} (minimum length (${config.min} char${config.min === 1 ? "" : "s"})).`, async ({ page }) => {
        const { filePath } = await generateOmanFieldLengthExcel(config.field, config.min);
        await uploadAndVerify(page, filePath);
      });

      test(`Verify Excel upload is accepted for ${TEMPLATE} Conditional – ${config.field} (maximum length (${config.max} chars)).`, async ({ page }) => {
        const { filePath } = await generateOmanFieldLengthExcel(config.field, config.max);
        await uploadAndVerify(page, filePath);
      });

      // Credit Note overlay (ALIGNED-IBRP-028-OM / IBR-032-OM): empty is required → error file.
      if (config.field === "Preceding Invoice reference") continue;
      // IBR-155-OM: Export + Export of Services → empty Service Type is mandatory → error file.
      if (config.field === "Service Type Code") continue;

      test(`Verify Excel upload is accepted for ${TEMPLATE} Conditional – ${config.field} (${config.belowMin === 0 ? "empty (below minimum)" : `${config.belowMin} chars (below minimum)`}).`, async ({ page }) => {
        const { filePath } = await generateOmanFieldLengthExcel(config.field, config.belowMin);
        await uploadAndVerify(page, filePath);
      });
    }
  });

  test.describe("Party identifier — companion length", () => {
    for (const scenario of FV.PARTY_IDENTIFIER_LENGTH_CASES) {
      const titleVerb = scenario.shouldAccept
        ? "is accepted"
        : "returns an error file";
      test(`Verify Excel upload ${titleVerb} for ${TEMPLATE} Conditional – ${scenario.identifierField} (${scenario.titleSuffix}).`, async ({
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

  test.describe("Conditional fields — invalid length", () => {
    for (const config of conditionalLengthConfigs) {
      test(`Verify Excel upload returns an error file for ${TEMPLATE} Conditional – ${config.field} (${config.aboveMax} chars (above maximum)).`, async ({ page }) => {
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
        test(`Verify Excel upload returns an error file for ${TEMPLATE} Conditional – ${config.field} (${config.belowMin === 0 ? "empty (below minimum)" : `${config.belowMin} chars (below minimum)`}).`, async ({ page }) => {
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
    const titleVerb = (expectsError?: boolean) =>
      expectsError ? "returns an error file" : "is accepted";

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
      // Formula fields: min/max → wrong calculation; empty → length ("should be more/less than").
      await runErrorValidationForAnyOfFields(page, {
        filePath,
        fields: FV.formulaNumericRelatedErrorFields(config.field),
        invoiceNumber,
        checkEdit: true,
      });
    };

    for (const config of numericFieldConfigs) {
      test(`Verify Excel upload ${titleVerb(config.minExpectsError)} for ${TEMPLATE} Numeric – ${config.field} (minimum value (${FV.formatOmanNumericBoundaryValue(config.min, config.decimals ?? 2)})).`, async ({ page }) => {
        await runNumericBoundary(page, config, config.min, config.minExpectsError);
      });

      test(`Verify Excel upload ${titleVerb(config.maxExpectsError)} for ${TEMPLATE} Numeric – ${config.field} (maximum digits (${config.max})).`, async ({ page }) => {
        await runNumericBoundary(page, config, config.max, config.maxExpectsError);
      });

      if (config.belowMin === 0) {
        test(`Verify Excel upload ${titleVerb(config.emptyExpectsError)} for ${TEMPLATE} Numeric – ${config.field} (empty (below minimum)).`, async ({ page }) => {
          await runNumericBoundary(page, config, config.belowMin, config.emptyExpectsError);
        });
      }
    }
  });

  test.describe("Numeric fields — invalid digit count", () => {
    for (const config of numericFieldConfigs) {
      test(`Verify Excel upload returns an error file for ${TEMPLATE} Numeric – ${config.field} (${config.aboveMax} digits (above maximum)).`, async ({ page }) => {
        const { filePath, invoiceNumber } = await generateOmanNumericFieldExcel(
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
      test.setTimeout(DROPDOWN_TIMEOUT_MS);
      const files = await generateOmanDropdownMasterExcel(
        FV.INVOICE_CURRENCY_CODE_FIELD,
        FV.INVOICE_CURRENCY_DROPDOWN_CODES
      );
      for (const { filePath } of files) {
        await uploadAndVerify(page, filePath);
      }
    });

    test(`Verify Excel upload is rejected for ${TEMPLATE} Dropdown – Invoice Currency Code (non-OMR with blank exchange rate).`, async ({ page }) => {
      test.setTimeout(DROPDOWN_TIMEOUT_MS);
      const { filePath } = await generateInvoiceCurrencyExchangeBatchExcel(
        NON_OMR_INVOICE_CURRENCY_CODES,
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
        const files = await generateOmanDropdownMasterExcel(config.field, config.master);
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

  test.describe("Tax exemption reason — Exempt from tax interdependency", () => {
    const reasonCode = FV.TAX_EXEMPTION_REASON_SAMPLE;
    const reasonText = "Exempt supply under Oman VAT";

    test(`Verify Excel upload is accepted for ${TEMPLATE} Item Tax – Tax exemption reason (Exempt + code and text).`, async ({
      page,
    }) => {
      const { filePath } = await generateOmanExemptReasonExcel(reasonCode, reasonText);
      await uploadAndVerify(page, filePath);
    });

    test(`Verify Excel upload returns an error file for ${TEMPLATE} Item Tax – Tax exemption reason text (Exempt + code without text).`, async ({
      page,
    }) => {
      const { filePath, invoiceNumber } = await generateOmanExemptReasonExcel(
        reasonCode,
        ""
      );
      await runErrorValidation(page, {
        filePath,
        field: FV.TAX_EXEMPTION_REASON_TEXT_FIELD,
        invoiceNumber,
        checkEdit: true,
      });
    });

    test(`Verify Excel upload returns an error file for ${TEMPLATE} Item Tax – Tax exemption reason code (Exempt + text without code).`, async ({
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

    test(`Verify Excel upload returns an error file for ${TEMPLATE} Item Tax – Tax exemption reason (Exempt + both empty).`, async ({
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

    test(`Verify Excel upload is accepted for ${TEMPLATE} Conditional – Prepayment invoice number (empty (below minimum)).`, async ({
      page,
    }) => {
      const { filePath } = await generateOmanFieldLengthExcel(prepayNumberField, 0);
      await uploadAndVerify(page, filePath);
    });

    test(`Verify Excel upload is accepted for ${TEMPLATE} Prepayment – Prepayment invoice number (number and UUID).`, async ({
      page,
    }) => {
      const { filePath } = await generateOmanPrepaymentPairExcel(
        prepayNumber,
        prepayUuid
      );
      await uploadAndVerify(page, filePath);
    });

    test(`Verify Excel upload returns an error file for ${TEMPLATE} Prepayment – Prepayment invoice UUID (number without UUID).`, async ({
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

    test(`Verify Excel upload returns an error file for ${TEMPLATE} Prepayment – Prepayment invoice number (transaction type without number and UUID).`, async ({
      page,
    }) => {
      const { filePath, invoiceNumber } = await generateOmanPrepaymentPairExcel(
        "",
        ""
      );
      await runErrorValidation(page, {
        filePath,
        field: prepayNumberField,
        invoiceNumber,
        checkEdit: true,
      });
    });

    test(`Verify Excel upload returns an error file for ${TEMPLATE} Prepayment – Prepayment invoice number (UUID without number).`, async ({
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

    test(`Verify Excel upload is accepted for ${TEMPLATE} Supporting document – Supporting document reference (reference and UUID).`, async ({
      page,
    }) => {
      const { filePath } = await generateOmanSupportingDocumentPairExcel(
        supportRef,
        supportUuid
      );
      await uploadAndVerify(page, filePath);
    });

    test(`Verify Excel upload returns an error file for ${TEMPLATE} Supporting document – Supporting document UUID (reference without UUID).`, async ({
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

    test(`Verify Excel upload returns an error file for ${TEMPLATE} Supporting document – Supporting document reference (UUID without reference).`, async ({
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
