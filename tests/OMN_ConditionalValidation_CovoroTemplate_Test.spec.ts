import { test } from "../Src/baseTest";
import {
  patchBlankLineItemVatAmountIfEmpty,
  patchProfitMarginItemTypeFromRow,
  patchSellerVatFromRow,
  patchVatCategoryTaxAmountAfterGenerate,
  verifyConditionalScenario,
  verifyConditionalScenarioAnyOf,
} from "../Helpers/excel/conditionalValidationSpecHelpers";
import * as ConditionalRows from "../Helpers/excel/conditionalValidationHelper";
import * as FV from "../testData/FieldValidations";

test.describe("Conditional validation (Oman PINT-OM)", () => {
  test.describe.configure({ mode: "parallel" });

  // Phase 1 — VAT category line rate / exemption
  test.describe("VAT category forbids tax rate (ALIGNED-IBRP-E/O-05-OM / IBR-061/067-OM)", () => {
    for (const scenario of FV.VAT_CATEGORY_RATE_FORBIDDEN_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildVatCategoryTaxRateScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICED_ITEM_TAX_RATE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Standard rate must be 5 (ALIGNED-IBRP-S-05-OM / IBR-053-OM)", () => {
    for (const scenario of FV.STANDARD_TAX_RATE_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildVatCategoryTaxRateScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICED_ITEM_TAX_RATE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Standard rate must be 5 in VAT accounting currency (IBR-104-OM)", () => {
    for (const scenario of FV.VAT_ACCOUNTING_CURRENCY_STANDARD_RATE_SCENARIOS) {
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
    for (const scenario of FV.ZERO_RATED_TAX_RATE_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildVatCategoryTaxRateScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICED_ITEM_TAX_RATE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("VAT breakdown rate required except Not subject (ALIGNED-IBRP-048)", () => {
    for (const scenario of FV.VAT_BREAKDOWN_RATE_REQUIRED_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildVatCategoryTaxRateScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICED_ITEM_TAX_RATE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Tax exemption reason (IBR-069/070-OM / ALIGNED-IBRP-S-10-OM)", () => {
    for (const scenario of FV.VAT_EXEMPTION_REASON_CONDITIONAL_SCENARIOS) {
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

  // Phase 2 — Preceding invoice / UUID
  test.describe("Preceding invoice (ALIGNED-IBRP-028-OM / IBR-032-OM)", () => {
    for (const scenario of FV.PRECEDING_INVOICE_SCENARIOS) {
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
    for (const scenario of FV.UUID_VERSION5_SCENARIOS) {
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

  // Phase 3 — FX
  test.describe("Currency exchange and accounting (IBR-004/005/034/172/DEC-03-OM)", () => {
    for (const scenario of FV.EXCHANGE_RATE_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData = ConditionalRows.buildExchangeRateScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.EXCHANGE_RATE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Amount decimal precision (IBR-DEC-03-OM)", () => {
    for (const scenario of FV.AMOUNT_DECIMAL_PRECISION_SCENARIOS) {
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

  // Phase 4 — Transaction type
  test.describe("Item Type required (IBR-078-OM)", () => {
    for (const scenario of FV.ITEM_TYPE_REQUIRED_SCENARIOS) {
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
    for (const scenario of FV.GOODS_CLASSIFICATION_SCENARIOS) {
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
    for (const scenario of FV.HS_CODE_FROM_ROP_LIST_SCENARIOS) {
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
    for (const scenario of FV.IMPORT_OF_GOODS_SCENARIOS) {
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
    for (const scenario of FV.PROFIT_MARGIN_SELF_INVOICE_SCENARIOS) {
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
    for (const scenario of FV.SUMMARY_INVOICE_PERIOD_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildSummaryInvoicePeriodScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICING_PERIOD_START_DATE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Summary Invoice period same calendar month (IBR-036-OM)", () => {
    for (const scenario of FV.SUMMARY_PERIOD_SAME_CALENDAR_MONTH_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildSummaryInvoicePeriodScenarioRow(scenario);
        await verifyConditionalScenarioAnyOf(
          page,
          rowData,
          [
            FV.INVOICING_PERIOD_START_DATE_FIELD,
            FV.INVOICING_PERIOD_END_DATE_FIELD,
          ],
          scenario.shouldError
        );
      });
    }
  });

  // Phase 5 — Doc allowance/charge
  test.describe("Document allowance/charge VAT category and exemption (IBR-062/064-OM)", () => {
    for (const scenario of FV.DOCUMENT_ALLOWANCE_CHARGE_VAT_SCENARIOS) {
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
    for (const scenario of FV.DOCUMENT_CHARGE_REASON_SCENARIOS) {
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

  // Phase 6 — Credit/debit reason
  test.describe("Credit/debit note reason code (IBR-023-OM)", () => {
    for (const scenario of FV.CREDIT_DEBIT_REASON_SCENARIOS) {
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

  // Phase 7 — Export / Special Zone / Self-bill / Doc rate proxies
  test.describe("Export Deliver to country (IBR-014-OM)", () => {
    for (const scenario of FV.EXPORT_DELIVERY_SCENARIOS) {
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
    for (const scenario of FV.EXPORT_SERVICE_TYPE_SCENARIOS) {
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
    for (const scenario of FV.EXPORT_DELIVER_COUNTRY_FORBIDDEN_OM_SCENARIOS) {
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

  test.describe("Special Zone country subdivision (IBR-150-OM)", () => {
    for (const scenario of FV.SPECIAL_ZONE_COUNTRY_SUBDIVISION_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildSpecialZoneCountrySubdivisionScenarioRow(
            scenario
          );
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ??
            FV.BUYER_COUNTRY_SUBDIVISION_CODE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Special Zone seller identifier (IBR-151-OM)", () => {
    for (const scenario of FV.SPECIAL_ZONE_SELLER_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildSpecialZoneSellerScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.SELLER_IDENTIFIER_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Self-billed / RCM Buyer VATIN (IBR-017-OM)", () => {
    for (const scenario of FV.SELF_BILLED_BUYER_VAT_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildSelfBilledBuyerVatScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.BUYER_VAT_IDENTIFIER_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Seller / Buyer / Third Party VATIN pattern (IBR-003-OM)", () => {
    for (const scenario of FV.VATIN_PATTERN_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData = ConditionalRows.buildVatinPatternScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.BUYER_VAT_IDENTIFIER_FIELD,
          scenario.shouldError,
          scenario.patchSellerVatAfterGenerate
            ? { patchFile: patchSellerVatFromRow }
            : {}
        );
      });
    }
  });

  test.describe("Self-billed / RCM Buyer country must be Oman (IBR-020-OM)", () => {
    for (const scenario of FV.SELF_BILLED_RCM_BUYER_COUNTRY_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildSelfBilledRcmBuyerCountryScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.BUYER_COUNTRY_CODE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Self-billed document transaction constraint (IBR-177-OM)", () => {
    for (const scenario of FV.SELF_BILLED_TXN_CONSTRAINT_SCENARIOS) {
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
    for (const scenario of FV.PREPAYMENT_TXN_EXCLUSION_SCENARIOS) {
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
    for (const scenario of FV.DOCUMENT_ALLOWANCE_CHARGE_RATE_SCENARIOS) {
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

  // GSP-54396 — ALIGNED-IBRP-*-01-OM VAT breakdown category presence
  test.describe("VAT breakdown category presence (ALIGNED-IBRP-E/O/S/Z-01-OM)", () => {
    for (const scenario of FV.VAT_BREAKDOWN_CATEGORY_PRESENCE_SCENARIOS) {
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
    for (const scenario of FV.LINE_ITEM_VAT_AMOUNT_REQUIRED_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildLineItemVatAmountRequiredScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.LINE_ITEM_VAT_AMOUNT_FIELD,
          scenario.shouldError,
          { patchFile: patchBlankLineItemVatAmountIfEmpty }
        );
      });
    }
  });

  test.describe("Line VAT amount zero for Exempt, Not subject, and Zero rated (IBR-039/054/077-OM)", () => {
    for (const scenario of FV.LINE_ITEM_VAT_AMOUNT_ZERO_SCENARIOS) {
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
    for (const scenario of FV.VAT_CATEGORY_TAX_AMOUNT_E09_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildVatCategoryTaxAmountE09ScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICE_TOTAL_TAX_AMOUNT_FIELD,
          scenario.shouldError,
          { patchFile: patchVatCategoryTaxAmountAfterGenerate }
        );
      });
    }
  });

  test.describe("Not subject VAT category tax amount must be zero (ALIGNED-IBRP-O-09-OM)", () => {
    for (const scenario of FV.VAT_CATEGORY_TAX_AMOUNT_O09_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildVatCategoryTaxAmountO09ScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICE_TOTAL_TAX_AMOUNT_FIELD,
          scenario.shouldError,
          { patchFile: patchVatCategoryTaxAmountAfterGenerate }
        );
      });
    }
  });

  test.describe("Zero rated VAT category tax amount must be zero (ALIGNED-IBRP-Z-09-OM)", () => {
    for (const scenario of FV.VAT_CATEGORY_TAX_AMOUNT_Z09_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildVatCategoryTaxAmountZ09ScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICE_TOTAL_TAX_AMOUNT_FIELD,
          scenario.shouldError,
          { patchFile: patchVatCategoryTaxAmountAfterGenerate }
        );
      });
    }
  });

  test.describe("Self-billed cannot combine with Third-party, Export, RCM, Profit Margin, or Import (IBR-138-OM)", () => {
    for (const scenario of FV.SELF_BILLED_TXN_EXCLUSION_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildSelfBilledTxnExclusionScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Self-billed cannot be Third-party (IBR-139-OM)", () => {
    for (const scenario of FV.IBR_139_TXN_EXCLUSION_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildSelfBilledTxnExclusionScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Summary cannot combine with Continuous, Export, Profit Margin, or Import (IBR-140-OM)", () => {
    for (const scenario of FV.SUMMARY_TXN_EXCLUSION_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildSummaryTxnExclusionScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Continuous Supply cannot combine with Summary, Deemed, Profit Margin, or Import (IBR-141-OM)", () => {
    for (const scenario of FV.CONTINUOUS_TXN_EXCLUSION_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildContinuousTxnExclusionScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Export cannot combine with Self-billed, Summary, Deemed, RCM, Profit Margin, or Import (IBR-142-OM)", () => {
    for (const scenario of FV.IBR_142_TXN_EXCLUSION_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildTxnPairExclusionScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Deemed Supply cannot combine with Continuous, Export, or Profit Margin (IBR-143-OM)", () => {
    for (const scenario of FV.IBR_143_TXN_EXCLUSION_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildTxnPairExclusionScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("RCM cannot combine with Export, Profit Margin, Import, or Self-billed (IBR-144-OM)", () => {
    for (const scenario of FV.IBR_144_TXN_EXCLUSION_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildTxnPairExclusionScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Profit Margin cannot combine with Summary, Continuous, Export, Deemed, RCM, Self-billed, or Import (IBR-145-OM)", () => {
    for (const scenario of FV.IBR_145_TXN_EXCLUSION_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildTxnPairExclusionScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Profit Margin Self-Invoice cannot combine with Summary, Continuous, Export, Deemed, RCM, Profit Margin, Import, or Self-billed (IBR-146-OM)", () => {
    for (const scenario of FV.IBR_146_TXN_EXCLUSION_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildTxnPairExclusionScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Import of Goods cannot combine with Summary, Continuous, Export, RCM, Profit Margin, E-commerce, or Self-billed (IBR-147-OM)", () => {
    for (const scenario of FV.IBR_147_TXN_EXCLUSION_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildTxnPairExclusionScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("E-commerce cannot combine with Profit Margin Self-Invoice (IBR-148-OM)", () => {
    for (const scenario of FV.IBR_148_TXN_EXCLUSION_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildTxnPairExclusionScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Simplified cannot combine with Self-billed, Third-party, Summary, Export, RCM, Profit Margin, Import, or Special Zone (IBR-149-OM)", () => {
    for (const scenario of FV.IBR_149_TXN_EXCLUSION_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildTxnPairExclusionScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Seller VATIN mandatory (IBR-006-OM)", () => {
    for (const scenario of FV.SELLER_VAT_MANDATORY_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildSellerVatMandatoryScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.SELLER_VAT_IDENTIFIER_FIELD,
          scenario.shouldError,
          scenario.patchSellerVatAfterGenerate
            ? { patchFile: patchSellerVatFromRow }
            : {}
        );
      });
    }
  });

  test.describe("Seller identifier scheme (IBR-007-OM)", () => {
    for (const scenario of FV.SELLER_IDENTIFIER_SCHEME_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildSellerIdentifierSchemeScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.SELLER_IDENTIFIER_SCHEME_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Buyer identifier or VATIN (IBR-016-OM)", () => {
    for (const scenario of FV.BUYER_ID_OR_VATIN_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildBuyerIdOrVatinScenarioRow(scenario);
        await verifyConditionalScenarioAnyOf(
          page,
          rowData,
          FV.BUYER_ID_OR_VATIN_ERROR_FIELDS,
          scenario.shouldError,
          scenario.invoiceTransactionTypeCode === FV.TXN_PROFIT_MARGIN_INVOICE
            ? { patchFile: patchProfitMarginItemTypeFromRow }
            : {}
        );
      });
    }
  });

  test.describe("Seller postal address required (IBR-010-OM)", () => {
    for (const scenario of FV.SELLER_ADDRESS_REQUIRED_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildSellerAddressRequiredScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.SELLER_ADDRESS_LINE_1_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Third-party Invoice party block required (IBR-015-OM)", () => {
    for (const scenario of FV.THIRD_PARTY_REQUIRED_SCENARIOS) {
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

  test.describe("Buyer address required (IBR-019-OM)", () => {
    for (const scenario of FV.BUYER_ADDRESS_REQUIRED_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildBuyerAddressRequiredScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.BUYER_ADDRESS_LINE_1_FIELD,
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
    for (const scenario of FV.INVOICING_PERIOD_CONDITIONAL_SCENARIOS) {
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

  test.describe("Invoice line period (IBR-030)", () => {
    for (const scenario of FV.INVOICE_LINE_PERIOD_CONDITIONAL_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildInvoiceLinePeriodConditionalScenarioRow(
            scenario
          );
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INVOICING_PERIOD_END_DATE_FIELD,
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
    for (const scenario of FV.HS_CODE_LENGTH_SCENARIOS) {
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
    for (const scenario of FV.INDUSTRIAL_CLASSIFICATION_REQUIRED_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildIndustrialClassificationRequiredScenarioRow(
            scenario
          );
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.INDUSTRIAL_CLASSIFICATION_CODE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Document allowance exemption reason codelist (IBR-CL-05-OM / IBR-CL-10-OM)", () => {
    for (const scenario of FV.IBR_CL_05_DOC_ALLOWANCE_SCENARIOS) {
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

  test.describe("RCM seller country must not be Oman (IBR-160-OM)", () => {
    for (const scenario of FV.SELLER_COUNTRY_RCM_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildSellerCountryRcmScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.SELLER_COUNTRY_CODE_FIELD,
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Profit Margin preceding invoice (IBR-175-OM)", () => {
    for (const scenario of FV.PROFIT_MARGIN_PRECEDING_SCENARIOS) {
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
    for (const scenario of FV.PROFIT_MARGIN_HS_PREFIX_SCENARIOS) {
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
    for (const scenario of FV.PROFIT_MARGIN_ITEM_TYPE_SCENARIOS) {
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

  test.describe("Buyer identifier scheme (IBR-152/153-OM)", () => {
    for (const scenario of FV.BUYER_IDENTIFIER_SCHEME_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildBuyerIdentifierSchemeScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? "Buyer identifier",
          scenario.shouldError
        );
      });
    }
  });

  test.describe("Item attribute name and value together (IBR-CO-21)", () => {
    for (const scenario of FV.ITEM_ATTRIBUTE_CONDITIONAL_SCENARIOS) {
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

  test.describe("Buyer/Seller identifier scheme and textual code (PARTY-ID)", () => {
    for (const scenario of FV.PARTY_IDENTIFIER_COMPANION_SCENARIOS) {
      test(`${scenario.title}`, async ({ page }) => {
        const rowData =
          ConditionalRows.buildPartyIdentifierCompanionScenarioRow(scenario);
        await verifyConditionalScenario(
          page,
          rowData,
          scenario.expectedErrorField ?? FV.SELLER_IDENTIFIER_FIELD,
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
          scenario.shouldError
            ? FV.AMOUNT_QUANTITY_NEGATIVE_ERROR_FIELDS
            : [scenario.expectedErrorField ?? FV.INVOICED_QUANTITY_FIELD],
          scenario.shouldError
        );
      });
    }
  });
});
