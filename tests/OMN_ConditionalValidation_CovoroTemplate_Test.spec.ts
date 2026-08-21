import { test } from "../Src/baseTest";
import {
  patchBlankLineItemVatAmountIfEmpty,
  patchProfitMarginItemTypeFromRow,
  patchSellerVatFromRow,
  patchVatCategoryTaxAmountAfterGenerate,
  verifyConditionalScenario,
  verifyConditionalScenarioAnyOf,
} from "../Helpers/conditionalValidationSpecHelpers";
import * as ConditionalRows from "../Helpers/conditionalValidationHelper";
import * as FV from "../testData/FieldValidations";

test.describe("Excel upload — conditional validation (Covoro / Oman PINT-OM)", () => {
  test.describe.configure({ mode: "parallel" });

  // Phase 1 — VAT category line rate / exemption
  test.describe("ALIGNED-IBRP-E/O-05-OM / IBR-061/067-OM — VAT category forbids tax rate", () => {
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

  test.describe("ALIGNED-IBRP-S-05-OM / IBR-053-OM — Standard rate must be 5", () => {
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

  test.describe("IBR-104-OM — Standard rate must be 5 in VAT accounting currency", () => {
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

  test.describe("ALIGNED-IBRP-Z-05-OM — Zero rated rate must be 0", () => {
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

  test.describe("ALIGNED-IBRP-048 — VAT breakdown rate required except O", () => {
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

  test.describe("IBR-069/070-OM / ALIGNED-IBRP-S-10-OM — exemption reason", () => {
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
  test.describe("ALIGNED-IBRP-028-OM / IBR-032-OM — preceding invoice", () => {
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

  test.describe("IBR-002-OM — Unique Identifier Number UUID v5", () => {
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
  test.describe("IBR-004/005/034/172/DEC-03-OM — currency exchange / accounting", () => {
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

  test.describe("IBR-DEC-03-OM — amount decimal precision", () => {
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
  test.describe("IBR-078-OM — Item Type required", () => {
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

  test.describe("IBR-079-OM — Goods classification identifier", () => {
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

  test.describe("IBR-174-OM — HS Code from ROP Customs list when Goods", () => {
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

  test.describe("IBR-084/085-OM — Import of Goods", () => {
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

  test.describe("IBR-086/087-OM — Profit Margin Self-Invoice", () => {
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

  test.describe("IBR-037-OM — Summary Invoice period", () => {
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

  test.describe("IBR-036-OM — Summary Invoice period same calendar month", () => {
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
  test.describe("IBR-062/064-OM — document allowance/charge VAT category and exemption", () => {
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

  test.describe("IBR-042-OM — document level charge reason code", () => {
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
  test.describe("IBR-023-OM — credit/debit note reason code", () => {
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
  test.describe("IBR-014-OM — Export Deliver to country", () => {
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

  test.describe("IBR-155-OM — Export Service Type (CL-12)", () => {
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

  test.describe("IBR-012-OM — Export deliver country not OM", () => {
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

  test.describe("IBR-013-OM — Export supporting documents", () => {
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

  test.describe("IBR-150-OM — Special Zone country subdivision", () => {
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

  test.describe("IBR-151-OM — Special Zone seller identifier", () => {
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

  test.describe("IBR-017-OM — Self-billed / RCM Buyer VATIN", () => {
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

  test.describe("IBR-003-OM — Seller / Buyer / Third Party VATIN pattern", () => {
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

  test.describe("IBR-020-OM — Self-billed / RCM Buyer country OM", () => {
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

  test.describe("IBR-177-OM — Self-billed document txn constraint", () => {
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

  test.describe("IBR-176-OM — Prepayment vs Summary/Deemed/PM-Self exclusion", () => {
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

  test.describe("IBR-045/047/094-OM — document charge/allowance category rate proxies", () => {
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
  test.describe("ALIGNED-IBRP-E/O/S/Z-01-OM — VAT breakdown category presence", () => {
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

  test.describe("IBR-038-OM — Line item VAT amount required", () => {
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

  test.describe("IBR-039/054/077-OM — Line VAT amount zero for E/O/Z", () => {
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

  test.describe("ALIGNED-IBRP-E-09-OM — VAT category tax amount zero for E", () => {
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

  test.describe("ALIGNED-IBRP-O-09-OM — VAT category tax amount zero for O", () => {
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

  test.describe("ALIGNED-IBRP-Z-09-OM — VAT category tax amount zero for Z", () => {
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

  // Commented on request: IBR-138-OM … IBR-149-OM BTOM-001 mutual exclusion.
  // Live suite only had IBR-138/149 representative pairs (IBR-139–148 were not wired).
  // test.describe("IBR-138/149-OM — transaction type mutual exclusion", () => {
  //   for (const scenario of FV.TXN_MUTUAL_EXCLUSION_SCENARIOS) {
  //     test(`${scenario.title}`, async ({ page }) => {
  //       const rowData =
  //         ConditionalRows.buildTxnMutualExclusionScenarioRow(scenario);
  //       await verifyConditionalScenario(
  //         page,
  //         rowData,
  //         scenario.expectedErrorField ?? FV.INVOICE_TRANSACTION_TYPE_CODE_FIELD,
  //         scenario.shouldError
  //       );
  //     });
  //   }
  // });

  test.describe("IBR-006-OM — Seller VATIN mandatory", () => {
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

  test.describe("IBR-007-OM — Seller identifier scheme", () => {
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

  test.describe("IBR-016-OM — Buyer identifier or VATIN", () => {
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

  test.describe("IBR-010-OM — Seller postal address required", () => {
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

  test.describe("IBR-015-OM — Third-party Invoice party block required", () => {
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

  test.describe("IBR-019-OM — Buyer address required", () => {
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

  test.describe("IBR-040-OM — Deliver To address all-or-nothing", () => {
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

  test.describe("IBR-029 / IBR-CO-19 — invoicing period", () => {
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

  test.describe("IBR-030 — invoice line period", () => {
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

  test.describe("IBR-058-OM — Paid amount prepayment refs", () => {
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

  test.describe("IBR-080-OM — HS code 12 digits", () => {
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

  test.describe("IBR-081-OM — Industrial Classification Code", () => {
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

  test.describe("IBR-CL-05-OM / IBR-CL-10-OM — doc allowance exemption reason codelist", () => {
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

  test.describe("IBR-160-OM — RCM seller country not OM", () => {
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

  test.describe("IBR-175-OM — Profit Margin preceding invoice", () => {
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

  test.describe("IBR-091-OM — Profit Margin HS prefix ban", () => {
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

  test.describe("CL-11-OM — Profit Margin item type code", () => {
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

  test.describe("IBR-152/153-OM — Buyer identifier scheme", () => {
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

  test.describe("IBR-CO-21 — Item attribute name ↔ value", () => {
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

  test.describe("PARTY-ID — Buyer/Seller identifier scheme and textual code", () => {
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

  test.describe("IBR-137-OM — amounts and quantities non-negative except rounding", () => {
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
