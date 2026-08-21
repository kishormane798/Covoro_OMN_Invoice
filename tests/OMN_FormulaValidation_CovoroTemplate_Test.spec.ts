import { test } from "../Src/baseTest";
import * as FV from "../testData/FieldValidations";
import {
  CURRENCY_SUITES,
  FORMULA_TAX_CATEGORY_SWEEP,
  FORMULA_TWO_LINE_DOC_LEVEL_OVERLAY,
  FORMULA_TWO_LINE_SWEEP_BASE_ROW,
  documentLevelInvoiceTargetsForMode,
  invoiceLevelSweepTargetsForMode,
  invoiceLevelSweepToleranceTargetsForMode,
  isScenarioApplicableForMode,
  mismatchTargetsForMode,
  runCalculatedFieldMismatchErrorScenario,
  runCalculatedFieldOutsideToleranceErrorScenario,
  runCalculatedFieldWithinToleranceAcceptedScenario,
  runNegativeFormulaScenario,
  runPositiveFormulaScenario,
  runZeroLineVatForcedNonZeroErrorScenario,
  taxSweepOverlay,
  toleranceTargetsForMode,
  ZERO_LINE_VAT_CATEGORY_CASES,
  ALIGNED_IBRP_E_08_OM_CASES,
  runAlignedIbrpE08OmScenario,
  ALIGNED_IBRP_O_08_OM_CASES,
  runAlignedIbrpO08OmScenario,
  ALIGNED_IBRP_S_08_OM_CASES,
  runAlignedIbrpS08OmScenario,
  ALIGNED_IBRP_Z_08_OM_CASES,
  runAlignedIbrpZ08OmScenario,
  IBR_082_OM_CASES,
  runIbr082OmScenario,
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
   * ALIGNED-IBRP-E-08-OM: Exempt IBT-116 = Σ IBT-131(E) − Σ IBT-092(E) + Σ IBT-099(E).
   * Simplified + E: provide totals (do not blank IBT-116 proxy). Assert upload status.
   * Proxy for Σ mismatch: Invoice Total Amount Without Tax.
   */
  test.describe("ALIGNED-IBRP-E-08-OM — Exempt VAT category taxable amount", () => {
    test.describe.configure({ mode: "parallel" });

    for (const scenario of ALIGNED_IBRP_E_08_OM_CASES) {
      test(scenario.title, async ({ page }) => {
        await runAlignedIbrpE08OmScenario(page, scenario);
      });
    }
  });

  /**
   * ALIGNED-IBRP-O-08-OM: Not subject IBT-116 = Σ IBT-131(O) − Σ IBT-092(O) + Σ IBT-099(O).
   * Simplified + O: provide totals (do not blank IBT-116 proxy). Assert upload status.
   * Proxy for Σ mismatch: Invoice Total Amount Without Tax.
   */
  test.describe("ALIGNED-IBRP-O-08-OM — Not subject VAT category taxable amount", () => {
    test.describe.configure({ mode: "parallel" });

    for (const scenario of ALIGNED_IBRP_O_08_OM_CASES) {
      test(scenario.title, async ({ page }) => {
        await runAlignedIbrpO08OmScenario(page, scenario);
      });
    }
  });

  /**
   * ALIGNED-IBRP-S-08-OM: Standard IBT-116 = Σ IBT-131(S) + Σ IBT-099(S) − Σ IBT-092(S)
   * at the matching VAT category rate (IBT-119). Oman Standard rate is 5.
   * Proxy for Σ mismatch: Invoice Total Amount Without Tax.
   */
  test.describe("ALIGNED-IBRP-S-08-OM — Standard VAT category taxable amount", () => {
    test.describe.configure({ mode: "parallel" });

    for (const scenario of ALIGNED_IBRP_S_08_OM_CASES) {
      test(scenario.title, async ({ page }) => {
        await runAlignedIbrpS08OmScenario(page, scenario);
      });
    }
  });

  /**
   * ALIGNED-IBRP-Z-08-OM: Zero rated IBT-116 = Σ IBT-131(Z) − Σ IBT-092(Z) + Σ IBT-099(Z).
   * Simplified + Z: provide totals (do not blank IBT-116 proxy). Assert upload status.
   * Proxy for Σ mismatch: Invoice Total Amount Without Tax.
   */
  test.describe("ALIGNED-IBRP-Z-08-OM — Zero rated VAT category taxable amount", () => {
    test.describe.configure({ mode: "parallel" });

    for (const scenario of ALIGNED_IBRP_Z_08_OM_CASES) {
      test(scenario.title, async ({ page }) => {
        await runAlignedIbrpZ08OmScenario(page, scenario);
      });
    }
  });

  /**
   * IBR-082-OM: Profit Margin Invoice → Total Amount Due (BTOM-020) is mandatory
   * and must equal Σ Total amount including VAT (BTOM-017). Omit after generate
   * (the writer fills BTOM-020 for Profit Margin txn types).
   */
  test.describe("IBR-082-OM — Profit Margin Total Amount Due", () => {
    test.describe.configure({ mode: "parallel" });

    for (const scenario of IBR_082_OM_CASES) {
      test(scenario.title, async ({ page }) => {
        await runIbr082OmScenario(page, scenario);
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

  const MULTI = { lineCount: 2 as const };

  test.describe("Multi-line (2 items) — same tax category", () => {
    test.describe.configure({ mode: "parallel" });

    for (const { mode, label } of CURRENCY_SUITES) {
      const currency = mode === "omr" ? "OMR" : "USD";
      test.describe(`${label} — 2 lines`, () => {
        test.describe("Valid inputs", () => {
          for (const data of FV.invoiceFormulaTestData as FormulaScenarioRow[]) {
            if (!isScenarioApplicableForMode(mode, data)) continue;
            test(`Verify Excel upload formula is accepted with matching totals for ${TEMPLATE} – ${data.name} (2 lines, ${currency}).`, async ({
              page,
            }) => {
              await runPositiveFormulaScenario(page, mode, data, MULTI);
            });
          }
        });

        test.describe("Invalid inputs", () => {
          for (const data of FV.invoiceNegativeFormulaTestData as FormulaScenarioRow[]) {
            if (!isScenarioApplicableForMode(mode, data)) continue;
            test(`Verify Excel upload returns an error file for ${TEMPLATE} Formula – ${data.name} (2 lines, ${currency}).`, async ({
              page,
            }) => {
              await runNegativeFormulaScenario(page, mode, data, MULTI);
            });
          }
        });
      });
    }

    test.describe("Calculated field mismatch — error file — 2 lines", () => {
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
          test(`Verify Excel upload returns an error file for ${TEMPLATE} Formula – ${target.shortName} mismatch (2 lines, ${currency}).`, async ({
            page,
          }) => {
            test.skip(
              !mismatchSuiteEnabled,
              "Active template lacks columns required for formula generator checks"
            );
            test.skip(
              !hasHeaderLabel(mismatchCachedHeaders, target.excelHeader),
              `Template has no column: ${target.excelHeader}`
            );
            await runCalculatedFieldMismatchErrorScenario(page, mode, target, MULTI);
          });
        }
      }
    });

    test.describe("Calculated field tolerance — 2 lines", () => {
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
          test(`Verify Excel upload is accepted for ${TEMPLATE} Formula – ${target.shortName} within tolerance ±${target.tolerance} (2 lines, ${currency}).`, async ({
            page,
          }) => {
            test.skip(
              !toleranceSuiteEnabled,
              "Active template lacks columns required for formula generator checks"
            );
            test.skip(
              !hasHeaderLabel(toleranceCachedHeaders, target.excelHeader),
              `Template has no column: ${target.excelHeader}`
            );
            await runCalculatedFieldWithinToleranceAcceptedScenario(page, mode, target, MULTI);
          });

          test(`Verify Excel upload returns an error file for ${TEMPLATE} Formula – ${target.shortName} outside tolerance ±${target.tolerance} (2 lines, ${currency}).`, async ({
            page,
          }) => {
            test.skip(
              !toleranceSuiteEnabled,
              "Active template lacks columns required for formula generator checks"
            );
            test.skip(
              !hasHeaderLabel(toleranceCachedHeaders, target.excelHeader),
              `Template has no column: ${target.excelHeader}`
            );
            await runCalculatedFieldOutsideToleranceErrorScenario(page, mode, target, MULTI);
          });
        }
      }
    });

    test.describe("Zero Line Item VAT categories — forced non-zero error — 2 lines", () => {
      test.describe.configure({ mode: "parallel" });

      for (const categoryCase of ZERO_LINE_VAT_CATEGORY_CASES) {
        test(`Verify Excel upload returns an error file for ${TEMPLATE} Formula – ${categoryCase.ruleId} non-zero Line Item VAT (${categoryCase.shortName}, 2 lines).`, async ({
          page,
        }) => {
          await runZeroLineVatForcedNonZeroErrorScenario(page, "omr", categoryCase, MULTI);
        });
      }
    });

    test.describe("IBR-075-OM / IBR-071-OM — 2 lines", () => {
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

      test(`Excel upload · Covoro | IBR-075-OM | Item Net Price matches gross−discount → accepted (2 lines)`, async ({
        page,
      }) => {
        test.skip(
          !formulaSuiteEnabled,
          "Active template lacks columns required for formula generator checks"
        );
        await runPositiveFormulaScenario(
          page,
          "omr",
          {
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
          },
          MULTI
        );
      });

      test(`Excel upload · Covoro | IBR-075-OM | Item Net Price mismatch → error file (2 lines)`, async ({
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
        await runCalculatedFieldMismatchErrorScenario(page, "omr", ibr075Target, MULTI);
      });

      test(`Excel upload · Covoro | IBR-071-OM | Invoice Line Net Amount matches formula → accepted (2 lines)`, async ({
        page,
      }) => {
        test.skip(
          !formulaSuiteEnabled,
          "Active template lacks columns required for formula generator checks"
        );
        await runPositiveFormulaScenario(
          page,
          "omr",
          {
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
          },
          MULTI
        );
      });

      test(`Excel upload · Covoro | IBR-071-OM | Invoice Line Net Amount mismatch → error file (2 lines)`, async ({
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
        await runCalculatedFieldMismatchErrorScenario(page, "omr", ibr071Target, MULTI);
      });
    });

    test.describe("Tax category sweep — invoice-level fields — 2 lines", () => {
      test.describe.configure({ mode: "parallel" });

      let sweepSuiteEnabled = false;
      let sweepCachedHeaders: string[] = [];

      test.beforeAll(async () => {
        sweepCachedHeaders = await getCachedInvoiceTemplateHeaders();
        sweepSuiteEnabled = templateSupportsGenerateInvoiceExcel(sweepCachedHeaders);
      });

      const profitMarginTarget = CALCULATED_FIELD_MISMATCH_TARGETS.find(
        (t) => t.excelHeader === "Total Amount Due (Profit Margin)"
      )!;

      for (const category of FORMULA_TAX_CATEGORY_SWEEP) {
        const overlay = taxSweepOverlay(category);

        for (const { mode } of CURRENCY_SUITES) {
          const currency = mode === "omr" ? "OMR" : "USD";
          test(`Verify Excel upload formula is accepted for ${TEMPLATE} – 2-line ${category.shortName} aggregation (${currency}).`, async ({
            page,
          }) => {
            test.skip(
              !sweepSuiteEnabled,
              "Active template lacks columns required for formula generator checks"
            );
            await runPositiveFormulaScenario(page, mode, FORMULA_TWO_LINE_SWEEP_BASE_ROW, {
              ...MULTI,
              taxOverlay: overlay,
            });
          });

          for (const target of invoiceLevelSweepTargetsForMode(mode)) {
            test(`Verify Excel upload returns an error file for ${TEMPLATE} Formula – ${target.shortName} mismatch (2 lines, ${category.shortName}, ${currency}).`, async ({
              page,
            }) => {
              test.skip(
                !sweepSuiteEnabled,
                "Active template lacks columns required for formula generator checks"
              );
              test.skip(
                !hasHeaderLabel(sweepCachedHeaders, target.excelHeader),
                `Template has no column: ${target.excelHeader}`
              );
              await runCalculatedFieldMismatchErrorScenario(page, mode, target, {
                ...MULTI,
                taxOverlay: overlay,
              });
            });
          }

          for (const target of invoiceLevelSweepToleranceTargetsForMode(mode)) {
            test(`Verify Excel upload is accepted for ${TEMPLATE} Formula – ${target.shortName} within tolerance ±${target.tolerance} (2 lines, ${category.shortName}, ${currency}).`, async ({
              page,
            }) => {
              test.skip(
                !sweepSuiteEnabled,
                "Active template lacks columns required for formula generator checks"
              );
              test.skip(
                !hasHeaderLabel(sweepCachedHeaders, target.excelHeader),
                `Template has no column: ${target.excelHeader}`
              );
              await runCalculatedFieldWithinToleranceAcceptedScenario(page, mode, target, {
                ...MULTI,
                taxOverlay: overlay,
              });
            });

            test(`Verify Excel upload returns an error file for ${TEMPLATE} Formula – ${target.shortName} outside tolerance ±${target.tolerance} (2 lines, ${category.shortName}, ${currency}).`, async ({
              page,
            }) => {
              test.skip(
                !sweepSuiteEnabled,
                "Active template lacks columns required for formula generator checks"
              );
              test.skip(
                !hasHeaderLabel(sweepCachedHeaders, target.excelHeader),
                `Template has no column: ${target.excelHeader}`
              );
              await runCalculatedFieldOutsideToleranceErrorScenario(page, mode, target, {
                ...MULTI,
                taxOverlay: overlay,
              });
            });
          }
        }
      }

      test(`Verify Excel upload returns an error file for ${TEMPLATE} Formula – Total Amount Due (Profit Margin) mismatch (2 lines).`, async ({
        page,
      }) => {
        test.skip(
          !sweepSuiteEnabled,
          "Active template lacks columns required for formula generator checks"
        );
        test.skip(
          !hasHeaderLabel(sweepCachedHeaders, profitMarginTarget.excelHeader),
          `Template has no column: ${profitMarginTarget.excelHeader}`
        );
        await runCalculatedFieldMismatchErrorScenario(page, "omr", profitMarginTarget, MULTI);
      });
    });

    test.describe("Document charges/allowances — invoice-level totals — 2 lines", () => {
      test.describe.configure({ mode: "parallel" });

      let docSuiteEnabled = false;
      let docCachedHeaders: string[] = [];

      test.beforeAll(async () => {
        docCachedHeaders = await getCachedInvoiceTemplateHeaders();
        docSuiteEnabled = templateSupportsGenerateInvoiceExcel(docCachedHeaders);
      });

      const standardDocOverlay = {
        ...FORMULA_TWO_LINE_DOC_LEVEL_OVERLAY,
        ...taxSweepOverlay(FORMULA_TAX_CATEGORY_SWEEP[0]),
      };

      test(`Verify Excel upload formula is accepted for ${TEMPLATE} – 2-line Standard rate with document charges and allowances (OMR).`, async ({
        page,
      }) => {
        test.skip(
          !docSuiteEnabled,
          "Active template lacks columns required for formula generator checks"
        );
        await runPositiveFormulaScenario(page, "omr", FORMULA_TWO_LINE_SWEEP_BASE_ROW, {
          ...MULTI,
          taxOverlay: standardDocOverlay,
        });
      });

      test(`Verify Excel upload formula is accepted for ${TEMPLATE} – 2-line Standard rate with document charges and allowances (USD).`, async ({
        page,
      }) => {
        test.skip(
          !docSuiteEnabled,
          "Active template lacks columns required for formula generator checks"
        );
        await runPositiveFormulaScenario(page, "foreign", FORMULA_TWO_LINE_SWEEP_BASE_ROW, {
          ...MULTI,
          taxOverlay: standardDocOverlay,
        });
      });

      for (const target of documentLevelInvoiceTargetsForMode("omr")) {
        test(`Verify Excel upload returns an error file for ${TEMPLATE} Formula – ${target.shortName} mismatch (2 lines, document charges, Standard rate, OMR).`, async ({
          page,
        }) => {
          test.skip(
            !docSuiteEnabled,
            "Active template lacks columns required for formula generator checks"
          );
          test.skip(
            !hasHeaderLabel(docCachedHeaders, target.excelHeader),
            `Template has no column: ${target.excelHeader}`
          );
          await runCalculatedFieldMismatchErrorScenario(page, "omr", target, {
            ...MULTI,
            taxOverlay: standardDocOverlay,
          });
        });
      }

      for (const target of documentLevelInvoiceTargetsForMode("foreign")) {
        test(`Verify Excel upload returns an error file for ${TEMPLATE} Formula – ${target.shortName} mismatch (2 lines, document charges, Standard rate, USD).`, async ({
          page,
        }) => {
          test.skip(
            !docSuiteEnabled,
            "Active template lacks columns required for formula generator checks"
          );
          test.skip(
            !hasHeaderLabel(docCachedHeaders, target.excelHeader),
            `Template has no column: ${target.excelHeader}`
          );
          await runCalculatedFieldMismatchErrorScenario(page, "foreign", target, {
            ...MULTI,
            taxOverlay: standardDocOverlay,
          });
        });
      }
    });
  });
});
