import { test } from "../Src/baseTest";
import {
  patchBlankTaxAmountInAccountingCurrencyIfEmpty,
  patchProfitMarginItemTypeFromRow,
  patchTaxRateFromRow,
  verifyAlignedIbrpE09OmAllowedBatch,
  verifyAlignedIbrpE09OmNotAllowedBatch,
  verifyAlignedIbrpO09OmAllowedBatch,
  verifyAlignedIbrpO09OmNotAllowedBatch,
  verifyAlignedIbrpZ09OmAllowedBatch,
  verifyAlignedIbrpZ09OmNotAllowedBatch,
  patchIbr137OmNegativeAmountAfterGenerate,
  verifyConditionalScenario,
  verifyConditionalScenarioAnyOf,
  verifyIbr038OmAllowedBatch,
  verifyIbr038OmNotAllowedBatch,
  verifyIbr039OmAllowedBatch,
  verifyIbr039OmNotAllowedBatch,
  verifyIbr036OmAllowedBatch,
  verifyIbr036OmNotAllowedBatch,
  verifyIbr037OmAllowedBatch,
  verifyIbr037OmNotAllowedBatch,
  verifyIbr081OmAllowedBatch,
  verifyIbr081OmExceptionBatch,
  verifyIbr081OmNotAllowedBatch,
} from "../Helpers/excel/conditionalValidationSpecHelpers";
import * as ConditionalRows from "../Helpers/excel/conditionalValidationHelper";
import * as FV from "../testData/FieldValidations";
import {
  applySimplifiedTemplateEnv,
  clearSimplifiedTemplateEnv,
} from "../Helpers/excel/simplifiedTemplateContext";
import { isSimplifiedIgnoredPartyField } from "../Helpers/excel/fieldValidationSpecSupport";
import { SIMPLIFIED_TEMPLATE_HEADER_LABELS } from "../testData/invoiceTemplateHeaders/invoiceColumnMapping";

function headerOnSimplified(field: string): boolean {
  const key = field.replace(/\s+/g, " ").trim().toLowerCase();
  return SIMPLIFIED_TEMPLATE_HEADER_LABELS.some(
    (header) => header.replace(/\s+/g, " ").trim().toLowerCase() === key
  );
}

function keepConditionalScenarios<T extends { expectedErrorField?: string }>(
  scenarios: readonly T[],
  fallbackField: string
): T[] {
  return scenarios.filter((scenario) => {
    const field = scenario.expectedErrorField ?? fallbackField;
    return !isSimplifiedIgnoredPartyField(field) && headerOnSimplified(field);
  });
}

const vatinPatternOnSimplified = FV.VATIN_PATTERN_SCENARIOS.filter(
  (scenario) => scenario.party === "thirdParty"
);

test.describe("Conditional validation (Simplified)", () => {
  test.describe.configure({ mode: "parallel" });

  test.beforeAll(() => {
    applySimplifiedTemplateEnv();
  });

  test.beforeEach(() => {
    applySimplifiedTemplateEnv();
  });

  test.afterAll(() => {
    clearSimplifiedTemplateEnv();
  });

  test.describe("VAT category forbids tax rate (ALIGNED-IBRP-E/O-05-OM / IBR-061/067-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.VAT_CATEGORY_RATE_FORBIDDEN_SCENARIOS,
      FV.INVOICED_ITEM_TAX_RATE_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildVatCategoryTaxRateScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICED_ITEM_TAX_RATE_FIELD,
          scenario.shouldError,
          { patchFile: patchTaxRateFromRow }
        );
      });
    }
  });

  test.describe("Standard rate must be 5 (ALIGNED-IBRP-S-05-OM / IBR-053-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.STANDARD_TAX_RATE_SCENARIOS,
      FV.INVOICED_ITEM_TAX_RATE_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildVatCategoryTaxRateScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICED_ITEM_TAX_RATE_FIELD,
          scenario.shouldError,
          { patchFile: patchTaxRateFromRow }
        );
      });
    }
  });

  test.describe("Standard rate must be 5 in VAT accounting currency (IBR-104-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.VAT_ACCOUNTING_CURRENCY_STANDARD_RATE_SCENARIOS,
      FV.INVOICED_ITEM_TAX_RATE_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildVatAccountingCurrencyTaxRateScenarioRow(
            scenario
          );
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICED_ITEM_TAX_RATE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Zero rated rate must be 0 (ALIGNED-IBRP-Z-05-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.ZERO_RATED_TAX_RATE_SCENARIOS,
      FV.INVOICED_ITEM_TAX_RATE_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildVatCategoryTaxRateScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICED_ITEM_TAX_RATE_FIELD,
          scenario.shouldError,
          { patchFile: patchTaxRateFromRow }
        );
      });
    }
  });

  test.describe("VAT breakdown rate required except Not subject (ALIGNED-IBRP-048)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.VAT_BREAKDOWN_RATE_REQUIRED_SCENARIOS,
      FV.INVOICED_ITEM_TAX_RATE_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildVatCategoryTaxRateScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICED_ITEM_TAX_RATE_FIELD,
          scenario.shouldError,
          { patchFile: patchTaxRateFromRow }
        );
      });
    }
  });

  test.describe("Tax exemption reason (IBR-069/070-OM / ALIGNED-IBRP-S-10-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.VAT_EXEMPTION_REASON_CONDITIONAL_SCENARIOS,
      FV.TAX_EXEMPTION_REASON_CODE_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildVatExemptionReasonScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.TAX_EXEMPTION_REASON_CODE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Preceding invoice (ALIGNED-IBRP-028-OM / IBR-032-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.PRECEDING_INVOICE_SCENARIOS,
      FV.PRECEDING_INVOICE_REFERENCE_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildPrecedingInvoiceScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.PRECEDING_INVOICE_REFERENCE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Unique Identifier Number must be UUID v5 (IBR-002-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.UUID_VERSION5_SCENARIOS,
      FV.PRECEDING_INVOICE_UUID_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildPrecedingInvoiceScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.PRECEDING_INVOICE_UUID_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Currency exchange and accounting (IBR-004/005/034/172/DEC-03-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.EXCHANGE_RATE_SCENARIOS,
      FV.EXCHANGE_RATE_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData = ConditionalRows.buildExchangeRateScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.EXCHANGE_RATE_FIELD,
          scenario.shouldError,
          { patchFile: patchBlankTaxAmountInAccountingCurrencyIfEmpty }
        );
      });
    }
  });

  test.describe("Tax accounting currency amount required (ibr-053)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.TAX_ACCOUNTING_CURRENCY_AMOUNT_SCENARIOS,
      FV.TAX_AMOUNT_IN_ACCOUNTING_CURRENCY_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildTaxAccountingCurrencyAmountScenarioRow(
            scenario
          );
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ??
            FV.TAX_AMOUNT_IN_ACCOUNTING_CURRENCY_FIELD,
          scenario.shouldError,
          { patchFile: patchBlankTaxAmountInAccountingCurrencyIfEmpty }
        );
      });
    }
  });

  test.describe("Amount decimal precision (IBR-DEC-03-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.AMOUNT_DECIMAL_PRECISION_SCENARIOS,
      "Item Gross Price"
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildAmountDecimalPrecisionScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? "Item Gross Price",
          scenario.shouldError
        );
      });
    }
  });

  test.describe("VAT rate numeric format (IBR-046-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.VAT_RATE_FORMAT_SCENARIOS,
      FV.INVOICED_ITEM_TAX_RATE_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData = ConditionalRows.buildVatRateFormatScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICED_ITEM_TAX_RATE_FIELD,
          scenario.shouldError,
          { patchFile: patchTaxRateFromRow }
        );
      });
    }
  });

  test.describe("Item Type required (IBR-078-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.ITEM_TYPE_REQUIRED_SCENARIOS,
      FV.ITEM_TYPE_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildItemTypeRequiredScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.ITEM_TYPE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Classification identifier for goods lines (IBR-079-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.GOODS_CLASSIFICATION_SCENARIOS,
      FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildGoodsClassificationScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("HS Code from ROP Customs list for goods lines (IBR-174-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.HS_CODE_FROM_ROP_LIST_SCENARIOS,
      FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildGoodsClassificationScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Import of Goods (IBR-084/085-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.IMPORT_OF_GOODS_SCENARIOS,
      FV.ITEM_COUNTRY_OF_ORIGIN_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildImportOfGoodsScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.ITEM_COUNTRY_OF_ORIGIN_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Profit Margin Self-Invoice (IBR-086/087-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.PROFIT_MARGIN_SELF_INVOICE_SCENARIOS,
      FV.TAX_CATEGORY_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildProfitMarginSelfInvoiceScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.TAX_CATEGORY_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Summary Invoice period (IBR-037-OM)", () => {
    for (const txn of FV.SUMMARY_OR_CONTINUOUS_TXN_TYPES) {
      const acceptedRowCount = FV.SUMMARY_INVOICE_PERIOD_SCENARIOS.filter(
        (scenario) =>
          !scenario.shouldError &&
          scenario.invoiceTransactionTypeCode === txn
      ).length;
      const errorRowCount = FV.SUMMARY_INVOICE_PERIOD_SCENARIOS.filter(
        (scenario) =>
          scenario.shouldError &&
          scenario.invoiceTransactionTypeCode === txn
      ).length;

      test(
        `Given ${txn} — When invoicing period dates are provided across all invoice types (${acceptedRowCount} rows) in one Excel — Then the invoice should be accepted. (IBR-037-OM)`,
        async ({ page }) => {
          test.setTimeout(10 * 60 * 1000);
          await verifyIbr037OmAllowedBatch(page, txn);
        }
      );

      test(
        `Given ${txn} — When invoicing period is left empty across all invoice types (${errorRowCount} rows) in one Excel — Then the error file should have ${errorRowCount} error rows. (IBR-037-OM)`,
        async ({ page }) => {
          test.setTimeout(10 * 60 * 1000);
          await verifyIbr037OmNotAllowedBatch(page, txn);
        }
      );
    }
  });

  test.describe("Summary Invoice period same calendar month (IBR-036-OM)", () => {
    const acceptedRowCount = FV.SUMMARY_PERIOD_SAME_CALENDAR_MONTH_SCENARIOS.filter(
      (scenario) => !scenario.shouldError
    ).length;
    const errorRowCount = FV.SUMMARY_PERIOD_SAME_CALENDAR_MONTH_SCENARIOS.filter(
      (scenario) => scenario.shouldError
    ).length;

    test(
      `Given Summary Invoice period dates are in the same calendar month across all invoice types (${acceptedRowCount} rows) — When uploaded in one Excel — Then the invoice should be accepted. (IBR-036-OM)`,
      async ({ page }) => {
        test.setTimeout(10 * 60 * 1000);
        await verifyIbr036OmAllowedBatch(page);
      }
    );

    test(
      `Given Summary Invoice period dates are in different calendar months across all invoice types (${errorRowCount} rows) — When uploaded in one Excel — Then the error file should have ${errorRowCount} error rows. (IBR-036-OM)`,
      async ({ page }) => {
        test.setTimeout(10 * 60 * 1000);
        await verifyIbr036OmNotAllowedBatch(page);
      }
    );
  });

  test.describe("Document allowance/charge VAT category and exemption (IBR-062/064-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.DOCUMENT_ALLOWANCE_CHARGE_VAT_SCENARIOS,
      FV.TAX_EXEMPTION_REASON_ALLOWANCES_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildDocumentAllowanceChargeVatScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ??
            (scenario.kind === "allowance"
              ? FV.TAX_EXEMPTION_REASON_ALLOWANCES_FIELD
              : FV.TAX_EXEMPTION_REASON_CHARGES_FIELD),
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Document level charge reason code (IBR-042-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.DOCUMENT_CHARGE_REASON_SCENARIOS,
      FV.CHARGES_ON_DOCUMENT_LEVEL_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildDocumentChargeReasonScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.CHARGES_ON_DOCUMENT_LEVEL_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Credit/debit note reason code (IBR-023-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.CREDIT_DEBIT_REASON_SCENARIOS,
      FV.CREDIT_DEBIT_NOTE_REASON_CODE_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildCreditDebitReasonScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.CREDIT_DEBIT_NOTE_REASON_CODE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Export Deliver to country (IBR-014-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.EXPORT_DELIVERY_SCENARIOS,
      FV.DELIVER_TO_COUNTRY_CODE_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildExportDeliveryScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.DELIVER_TO_COUNTRY_CODE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Export Service Type (IBR-155-OM / CL-12)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.EXPORT_SERVICE_TYPE_SCENARIOS,
      FV.SERVICE_TYPE_CODE_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildExportServiceTypeScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.SERVICE_TYPE_CODE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Export deliver country must not be Oman (IBR-012-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.EXPORT_DELIVER_COUNTRY_FORBIDDEN_OM_SCENARIOS,
      FV.DELIVER_TO_COUNTRY_CODE_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildExportDeliverCountryForbiddenOmScenarioRow(
            scenario
          );
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.DELIVER_TO_COUNTRY_CODE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Export supporting documents (IBR-013-OM)", () => {
    for (const scenario of FV.EXPORT_SUPPORTING_DOCUMENT_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildExportSupportingDocumentScenarioRow(scenario);
        await verifyConditionalScenarioAnyOf(
          page,
          rowData,
          FV.SUPPORTING_DOCUMENT_GROUP_FIELDS,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Third Party VATIN pattern (IBR-003-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      vatinPatternOnSimplified,
      FV.THIRD_PARTY_VATIN_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData = ConditionalRows.buildVatinPatternScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.THIRD_PARTY_VATIN_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Self-billed document transaction constraint (IBR-177-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.SELF_BILLED_TXN_CONSTRAINT_SCENARIOS,
      FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildSelfBilledTxnConstraintScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Prepayment cannot combine with Summary, Deemed, or Profit Margin Self-Invoice (IBR-176-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.PREPAYMENT_TXN_EXCLUSION_SCENARIOS,
      FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildPrepaymentTxnExclusionScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Document charge/allowance category rate (IBR-045/047/094-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.DOCUMENT_ALLOWANCE_CHARGE_RATE_SCENARIOS,
      FV.VAT_CATEGORY_ALLOWANCES_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildDocumentAllowanceChargeRateScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.VAT_CATEGORY_ALLOWANCES_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("VAT breakdown category presence (ALIGNED-IBRP-E/O/S/Z-01-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.VAT_BREAKDOWN_CATEGORY_PRESENCE_SCENARIOS,
      FV.TAX_CATEGORY_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildVatBreakdownCategoryPresenceScenarioRow(
            scenario
          );
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.TAX_CATEGORY_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Line item VAT amount required (IBR-038-OM)", () => {
    const acceptedRowCount =
      FV.LINE_ITEM_VAT_AMOUNT_REQUIRED_ALLOWED_SCENARIOS.length;

    test(
      `Given line VAT amount is provided across invoice types and transaction types (${acceptedRowCount} rows) — When uploaded in one Excel — Then the invoice should be accepted. (IBR-038-OM)`,
      async ({ page }) => {
        test.setTimeout(20 * 60 * 1000);
        await verifyIbr038OmAllowedBatch(page);
      }
    );

    for (const invoiceTypes of FV.LINE_ITEM_VAT_AMOUNT_NEGATIVE_INVOICE_TYPE_GROUPS) {
      const errorRowCount =
        FV.LINE_ITEM_VAT_AMOUNT_REQUIRED_NOT_ALLOWED_SCENARIOS.filter(
          (scenario) =>
            invoiceTypes.includes(
              scenario.invoiceTypeCode ?? FV.INVOICE_TYPE_COMMERCIAL_INVOICE
            )
        ).length;
      const typeList = invoiceTypes.join(" / ");

      test(
        `Given ${typeList} — When line VAT amount is left empty (${errorRowCount} rows) in one Excel — Then the error file should have ${errorRowCount} error rows. (IBR-038-OM)`,
        async ({ page }) => {
          test.setTimeout(10 * 60 * 1000);
          await verifyIbr038OmNotAllowedBatch(page, invoiceTypes);
        }
      );
    }
  });

  test.describe("Line VAT amount zero for Exempt (IBR-039-OM)", () => {
    const acceptedRowCount =
      FV.LINE_ITEM_VAT_AMOUNT_ZERO_E_ALLOWED_SCENARIOS.length;

    test(
      `Given Exempt line VAT amount is 0 across invoice types and transaction types (${acceptedRowCount} rows) — When uploaded in one Excel — Then the invoice should be accepted. (IBR-039-OM)`,
      async ({ page }) => {
        test.setTimeout(20 * 60 * 1000);
        await verifyIbr039OmAllowedBatch(page);
      }
    );

    for (const invoiceTypes of FV.LINE_ITEM_VAT_AMOUNT_NEGATIVE_INVOICE_TYPE_GROUPS) {
      const errorRowCount =
        FV.LINE_ITEM_VAT_AMOUNT_ZERO_E_NOT_ALLOWED_SCENARIOS.filter(
          (scenario) =>
            invoiceTypes.includes(
              scenario.invoiceTypeCode ??
                FV.INVOICE_TYPE_CODE_INVOICE_OUT_OF_SCOPE_OF_TAX
            )
        ).length;
      const typeList = invoiceTypes.join(" / ");

      test(
        `Given ${typeList} Exempt — When line VAT amount is 50 (${errorRowCount} rows) in one Excel — Then the error file should have ${errorRowCount} error rows. (IBR-039-OM)`,
        async ({ page }) => {
          test.setTimeout(10 * 60 * 1000);
          await verifyIbr039OmNotAllowedBatch(page, invoiceTypes);
        }
      );
    }
  });

  test.describe("Line VAT amount zero for Not subject and Zero rated (IBR-054/077-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.LINE_ITEM_VAT_AMOUNT_ZERO_SCENARIOS,
      FV.LINE_ITEM_VAT_AMOUNT_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildLineItemVatAmountZeroScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.LINE_ITEM_VAT_AMOUNT_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Exempt VAT category tax amount must be zero (ALIGNED-IBRP-E-09-OM)", () => {
    test(
      "Given Exempt VAT category tax amount is 0 across all tax transaction types — When uploaded in one Excel — Then the invoice should be accepted. (ALIGNED-IBRP-E-09-OM)",
      async ({ page }) => {
        test.setTimeout(10 * 60 * 1000);
        await verifyAlignedIbrpE09OmAllowedBatch(page);
      }
    );

    test(
      "Given Exempt VAT category tax amount is not 0 across all tax transaction types — When uploaded in one Excel — Then every row should be rejected with an error. (ALIGNED-IBRP-E-09-OM)",
      async ({ page }) => {
        test.setTimeout(10 * 60 * 1000);
        await verifyAlignedIbrpE09OmNotAllowedBatch(page);
      }
    );
  });

  test.describe("Not subject VAT category tax amount must be zero (ALIGNED-IBRP-O-09-OM)", () => {
    test(
      "Given Not subject VAT category tax amount is 0 across all tax transaction types — When uploaded in one Excel — Then the invoice should be accepted. (ALIGNED-IBRP-O-09-OM)",
      async ({ page }) => {
        test.setTimeout(10 * 60 * 1000);
        await verifyAlignedIbrpO09OmAllowedBatch(page);
      }
    );

    test(
      "Given Not subject VAT category tax amount is not 0 across all tax transaction types — When uploaded in one Excel — Then every row should be rejected with an error. (ALIGNED-IBRP-O-09-OM)",
      async ({ page }) => {
        test.setTimeout(10 * 60 * 1000);
        await verifyAlignedIbrpO09OmNotAllowedBatch(page);
      }
    );
  });

  test.describe("Zero rated VAT category tax amount must be zero (ALIGNED-IBRP-Z-09-OM)", () => {
    test(
      "Given Zero rated VAT category tax amount is 0 across all tax transaction types — When uploaded in one Excel — Then the invoice should be accepted. (ALIGNED-IBRP-Z-09-OM)",
      async ({ page }) => {
        test.setTimeout(10 * 60 * 1000);
        await verifyAlignedIbrpZ09OmAllowedBatch(page);
      }
    );

    test(
      "Given Zero rated VAT category tax amount is not 0 across all tax transaction types — When uploaded in one Excel — Then every row should be rejected with an error. (ALIGNED-IBRP-Z-09-OM)",
      async ({ page }) => {
        test.setTimeout(10 * 60 * 1000);
        await verifyAlignedIbrpZ09OmNotAllowedBatch(page);
      }
    );
  });

  test.describe("Third-party Invoice party block required (IBR-015-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.THIRD_PARTY_REQUIRED_SCENARIOS,
      FV.THIRD_PARTY_NAME_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildThirdPartyRequiredScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.THIRD_PARTY_NAME_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Deliver To address all-or-nothing (IBR-040-OM)", () => {
    for (const scenario of FV.DELIVER_TO_ADDRESS_REQUIRED_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildDeliverToAddressRequiredScenarioRow(scenario);
        await verifyConditionalScenarioAnyOf(
          page,
          rowData,
          FV.DELIVER_TO_ADDRESS_GROUP_FIELDS,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Invoicing period (IBR-029 / IBR-CO-19)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.INVOICING_PERIOD_CONDITIONAL_SCENARIOS,
      FV.INVOICING_PERIOD_START_DATE_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildInvoicingPeriodConditionalScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICING_PERIOD_START_DATE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Paid amount prepayment references (IBR-058-OM)", () => {
    for (const scenario of FV.PREPAYMENT_PAID_AMOUNT_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildPrepaymentPaidAmountScenarioRow(scenario);
        await verifyConditionalScenarioAnyOf(
          page,
          rowData,
          FV.missingPrepaymentPaidAmountErrorFields(scenario),
          scenario.shouldError
        );
      });
    }
  });

  test.describe("HS code must be 12 digits (IBR-080-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.HS_CODE_LENGTH_SCENARIOS,
      FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildHsCodeLengthScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Industrial Classification Code (IBR-081-OM)", () => {
    const acceptedRowCount =
      FV.INDUSTRIAL_CLASSIFICATION_REQUIRED_ALLOWED_SCENARIOS.length;
    const errorRowCount =
      FV.INDUSTRIAL_CLASSIFICATION_REQUIRED_NOT_ALLOWED_SCENARIOS.length;
    const exceptionRowCount =
      FV.INDUSTRIAL_CLASSIFICATION_EXCEPTION_SCENARIOS.length;

    test(
      `Given industrial classification is provided across required transaction types (${acceptedRowCount} rows) — When uploaded in one Excel — Then the invoice should be accepted. (IBR-081-OM)`,
      async ({ page }) => {
        test.setTimeout(10 * 60 * 1000);
        await verifyIbr081OmAllowedBatch(page);
      }
    );

    test(
      `Given industrial classification is left empty across required transaction types (${errorRowCount} rows) — When uploaded in one Excel — Then the error file should have ${errorRowCount} error rows. (IBR-081-OM)`,
      async ({ page }) => {
        test.setTimeout(10 * 60 * 1000);
        await verifyIbr081OmNotAllowedBatch(page);
      }
    );

    test(
      `Given industrial classification is left empty across exception transaction types (${exceptionRowCount} rows) — When uploaded in one Excel — Then the invoice should be accepted. (IBR-081-OM)`,
      async ({ page }) => {
        test.setTimeout(10 * 60 * 1000);
        await verifyIbr081OmExceptionBatch(page);
      }
    );
  });

  test.describe("Document allowance exemption reason codelist (IBR-CL-05-OM / IBR-CL-10-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.IBR_CL_05_DOC_ALLOWANCE_SCENARIOS,
      FV.TAX_EXEMPTION_REASON_ALLOWANCES_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildIbrCl05DocAllowanceScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.TAX_EXEMPTION_REASON_ALLOWANCES_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Profit Margin preceding invoice (IBR-175-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.PROFIT_MARGIN_PRECEDING_SCENARIOS,
      FV.PRECEDING_INVOICE_REFERENCE_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildProfitMarginPrecedingScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.PRECEDING_INVOICE_REFERENCE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Profit Margin HS prefix ban (IBR-091-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.PROFIT_MARGIN_HS_PREFIX_SCENARIOS,
      FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildProfitMarginHsPrefixScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.ITEM_CLASSIFICATION_IDENTIFIER_FIELD,
          scenario.shouldError,
          { patchFile: patchProfitMarginItemTypeFromRow }
        );
      });
    }
  });

  test.describe("Profit Margin item type code (CL-11-OM)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.PROFIT_MARGIN_ITEM_TYPE_SCENARIOS,
      FV.PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildProfitMarginItemTypeScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.PROFIT_MARGIN_ITEM_TYPE_CODE_FIELD,
          scenario.shouldError,
          { patchFile: patchProfitMarginItemTypeFromRow }
        );
      });
    }
  });

  test.describe("Item attribute name and value together (IBR-CO-21)", () => {
    for (const scenario of keepConditionalScenarios(
      FV.ITEM_ATTRIBUTE_CONDITIONAL_SCENARIOS,
      FV.ITEM_ATTRIBUTE_VALUE_FIELD
    )) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildItemAttributeConditionalScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.ITEM_ATTRIBUTE_VALUE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Amounts and quantities non-negative except rounding (IBR-137-OM)", () => {
    for (const scenario of FV.AMOUNT_QUANTITY_SIGN_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildAmountQuantitySignScenarioRow(scenario);
        await verifyConditionalScenarioAnyOf(
          page,
          rowData,
          FV.ibr137OmErrorFields(scenario),
          scenario.shouldError,
          {
            patchFile: (filePath, prepared) =>
              patchIbr137OmNegativeAmountAfterGenerate(
                filePath,
                prepared,
                scenario
              ),
          }
        );
      });
    }
  });
});
