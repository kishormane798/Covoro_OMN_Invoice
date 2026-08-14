import { test } from "../Src/baseTest";
import * as FV from "../testData/FieldValidations";
import {
  CURRENCY_SUITES,
  isScenarioApplicableForMode,
  mismatchTargetsForMode,
  runCalculatedFieldMismatchErrorScenario,
  runCalculatedFieldOutsideToleranceErrorScenario,
  runCalculatedFieldWithinToleranceAcceptedScenario,
  runNegativeFormulaScenario,
  runPositiveFormulaScenario,
  runZeroLineVatForcedNonZeroErrorScenario,
  toleranceTargetsForMode,
  ZERO_LINE_VAT_CATEGORY_CASES,
  CALCULATED_FIELD_MISMATCH_TARGETS,
  type FormulaScenarioRow,
} from "../Helpers/formulaValidationHelper";
import {
  getCachedInvoiceTemplateHeaders,
  hasHeaderLabel,
  templateSupportsGenerateInvoiceExcel,
} from "../utils/invoiceExcel";

const TEMPLATE = "Covoro";

test.describe(`Excel upload — formula validation (${TEMPLATE})`, () => {
  test.describe.configure({ mode: "parallel" });

  for (const { mode, label } of CURRENCY_SUITES) {
    const currency = mode === "omr" ? "OMR" : "USD";
    test.describe(label, () => {
      test.describe("Valid inputs", () => {
        for (const data of FV.invoiceFormulaTestData as FormulaScenarioRow[]) {
          if (!isScenarioApplicableForMode(mode, data)) continue;
          test(`Verify Excel upload formula is accepted with matching totals for ${TEMPLATE} – ${data.name} (${currency}).`, async ({ page }) => {
            await runPositiveFormulaScenario(page, mode, data);
          });
        }
      });

      test.describe("Invalid inputs", () => {
        for (const data of FV.invoiceNegativeFormulaTestData as FormulaScenarioRow[]) {
          if (!isScenarioApplicableForMode(mode, data)) continue;
          test(`Verify Excel upload returns an error file for ${TEMPLATE} Formula – ${data.name} (${currency}).`, async ({ page }) => {
            await runNegativeFormulaScenario(page, mode, data);
          });
        }
      });
    });
  }

  test.describe("Calculated field mismatch — error file", () => {
    test.describe.configure({ mode: "parallel" });

    let mismatchSuiteEnabled = false;
    let mismatchCachedHeaders: string[] = [];

    test.beforeAll(async () => {
      mismatchCachedHeaders = await getCachedInvoiceTemplateHeaders();
      mismatchSuiteEnabled = templateSupportsGenerateInvoiceExcel(mismatchCachedHeaders);
    });

    for (const { mode } of CURRENCY_SUITES) {
      const currency = mode === "omr" ? "OMR" : "USD";
      for (const target of mismatchTargetsForMode(mode)) {
        test(`Verify Excel upload returns an error file for ${TEMPLATE} Formula – ${target.shortName} mismatch (${currency}).`, async ({ page }) => {
          test.skip(
            !mismatchSuiteEnabled,
            "Active template lacks columns required for formula generator checks"
          );
          test.skip(
            !hasHeaderLabel(mismatchCachedHeaders, target.excelHeader),
            `Template has no column: ${target.excelHeader}`
          );
          await runCalculatedFieldMismatchErrorScenario(page, mode, target);
        });
      }
    }
  });

  test.describe("Calculated field tolerance — conditional residual slack", () => {
    test.describe.configure({ mode: "parallel" });

    let toleranceSuiteEnabled = false;
    let toleranceCachedHeaders: string[] = [];

    test.beforeAll(async () => {
      toleranceCachedHeaders = await getCachedInvoiceTemplateHeaders();
      toleranceSuiteEnabled = templateSupportsGenerateInvoiceExcel(toleranceCachedHeaders);
    });

    for (const { mode } of CURRENCY_SUITES) {
      const currency = mode === "omr" ? "OMR" : "USD";
      for (const target of toleranceTargetsForMode(mode)) {
        test(`Verify Excel upload is accepted for ${TEMPLATE} Formula – ${target.shortName} within tolerance ±${target.tolerance} (${currency}).`, async ({ page }) => {
          test.skip(
            !toleranceSuiteEnabled,
            "Active template lacks columns required for formula generator checks"
          );
          test.skip(
            !hasHeaderLabel(toleranceCachedHeaders, target.excelHeader),
            `Template has no column: ${target.excelHeader}`
          );
          await runCalculatedFieldWithinToleranceAcceptedScenario(page, mode, target);
        });

        test(`Verify Excel upload returns an error file for ${TEMPLATE} Formula – ${target.shortName} outside tolerance ±${target.tolerance} (${currency}).`, async ({ page }) => {
          test.skip(
            !toleranceSuiteEnabled,
            "Active template lacks columns required for formula generator checks"
          );
          test.skip(
            !hasHeaderLabel(toleranceCachedHeaders, target.excelHeader),
            `Template has no column: ${target.excelHeader}`
          );
          await runCalculatedFieldOutsideToleranceErrorScenario(page, mode, target);
        });
      }
    }
  });

  test.describe("Zero Line Item VAT categories — forced non-zero error", () => {
    test.describe.configure({ mode: "parallel" });

    for (const categoryCase of ZERO_LINE_VAT_CATEGORY_CASES) {
      test(`Verify Excel upload returns an error file for ${TEMPLATE} Formula – ${categoryCase.ruleId} non-zero Line Item VAT (${categoryCase.shortName}).`, async ({ page }) => {
        await runZeroLineVatForcedNonZeroErrorScenario(page, "omr", categoryCase);
      });
    }
  });

  /**
   * IBR-075-OM: Item net price = gross − discount when gross is provided.
   * IBR-071-OM: Line net = qty × (net / base qty) + line charges − line allowances.
   * Covered via calculated-field mismatch on the matching Excel headers.
   */
  test.describe("IBR-075-OM / IBR-071-OM — net price and line net formulas", () => {
    test.describe.configure({ mode: "parallel" });

    let formulaSuiteEnabled = false;
    let formulaCachedHeaders: string[] = [];

    test.beforeAll(async () => {
      formulaCachedHeaders = await getCachedInvoiceTemplateHeaders();
      formulaSuiteEnabled = templateSupportsGenerateInvoiceExcel(formulaCachedHeaders);
    });

    const ibr075Target = CALCULATED_FIELD_MISMATCH_TARGETS.find(
      (t) => t.excelHeader === "Item Net Price"
    )!;
    const ibr071Target = CALCULATED_FIELD_MISMATCH_TARGETS.find(
      (t) => t.excelHeader === "Invoice Line Net Amount"
    )!;

    test(`Excel upload · Covoro | IBR-075-OM | Item Net Price matches gross−discount → accepted`, async ({
      page,
    }) => {
      test.skip(
        !formulaSuiteEnabled,
        "Active template lacks columns required for formula generator checks"
      );
      await runPositiveFormulaScenario(page, "omr", {
        name: "IBR-075-OM valid net = gross − discount",
        itemPriceBaseQty: 1,
        itemGrossPrice: 1000,
        itemPriceDiscount: 100,
        invoicedQty: 1,
        lineCharge: 0,
        lineAllowance: 0,
        taxRate: 5,
        docCharges: 0,
        docAllowances: 0,
        paidAmount: 0,
        roundingAmount: 0,
      });
    });

    test(`Excel upload · Covoro | IBR-075-OM | Item Net Price mismatch → error file`, async ({
      page,
    }) => {
      test.skip(
        !formulaSuiteEnabled,
        "Active template lacks columns required for formula generator checks"
      );
      test.skip(
        !hasHeaderLabel(formulaCachedHeaders, ibr075Target.excelHeader),
        `Template has no column: ${ibr075Target.excelHeader}`
      );
      await runCalculatedFieldMismatchErrorScenario(page, "omr", ibr075Target);
    });

    test(`Excel upload · Covoro | IBR-071-OM | Invoice Line Net Amount matches formula → accepted`, async ({
      page,
    }) => {
      test.skip(
        !formulaSuiteEnabled,
        "Active template lacks columns required for formula generator checks"
      );
      await runPositiveFormulaScenario(page, "omr", {
        name: "IBR-071-OM valid line net with charge and allowance",
        itemPriceBaseQty: 1,
        itemGrossPrice: 1000,
        itemPriceDiscount: 0,
        invoicedQty: 2,
        lineCharge: 10,
        lineAllowance: 5,
        taxRate: 5,
        docCharges: 0,
        docAllowances: 0,
        paidAmount: 0,
        roundingAmount: 0,
      });
    });

    test(`Excel upload · Covoro | IBR-071-OM | Invoice Line Net Amount mismatch → error file`, async ({
      page,
    }) => {
      test.skip(
        !formulaSuiteEnabled,
        "Active template lacks columns required for formula generator checks"
      );
      test.skip(
        !hasHeaderLabel(formulaCachedHeaders, ibr071Target.excelHeader),
        `Template has no column: ${ibr071Target.excelHeader}`
      );
      await runCalculatedFieldMismatchErrorScenario(page, "omr", ibr071Target);
    });
  });
});
