/**
 * Submit one commercial invoice with many lines (1,000 through 10,000).
 *
 * Skipped during the normal suite. The delivery wait is fixed when Playwright
 * starts (`SUBMIT_INVOICE_DELIVERY_TIMEOUT_MS` in submitInvoiceCaseHelper).
 *
 * PowerShell (all sizes, one worker):
 *   $env:SUBMIT_INVOICE_DELIVERY_TIMEOUT_MS = "3600000"
 *   npx playwright test tests/Performance/OMN_SubmitInvoice_LineVolume_Test.spec.ts --project=chromium --workers=1
 *
 * One size:
 *   npx playwright test tests/Performance/OMN_SubmitInvoice_LineVolume_Test.spec.ts --project=chromium --workers=1 --grep "1000 lines"
 */
import { test } from "../../Src/baseTest";
import * as FV from "../../testData/FieldValidations";
import { buildOmanSubmitDocumentRow } from "../../testData/FieldValidations/SubmitInvoiceMultiItem";
import { runSubmitInvoiceMultiItemCase } from "../../Helpers/excel/submitInvoiceCaseHelper";

/** 1,000, 2,000, … 10,000 lines on a single invoice. */
const LINE_COUNTS = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000] as const;

/** Helper default when the env var is unset (see submitInvoiceCaseHelper). */
const DEFAULT_DELIVERY_TIMEOUT_MS = 2 * 60 * 1000;

/** Excel write + upload slack on top of the delivery wait. */
const GENERATE_AND_UPLOAD_SLACK_MS = 40 * 60 * 1000;

function deliveryTimeoutNeededMs(lineCount: number): number {
  // At least 10 minutes, or 0.3s per line (10,000 lines → 50 minutes).
  return Math.max(10 * 60 * 1000, lineCount * 300);
}

function configuredDeliveryTimeoutMs(): number {
  const raw = process.env.SUBMIT_INVOICE_DELIVERY_TIMEOUT_MS?.trim();
  if (!raw) return DEFAULT_DELIVERY_TIMEOUT_MS;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : DEFAULT_DELIVERY_TIMEOUT_MS;
}

function buildStandardTaxInvoiceLines(
  lineCount: number
): Array<Record<string, string>> {
  const seed = buildOmanSubmitDocumentRow(
    FV.INVOICE_TYPE_COMMERCIAL_INVOICE,
    FV.TXN_FULL_TAX_INVOICE
  );
  const rows: Array<Record<string, string>> = new Array(lineCount);
  for (let i = 0; i < lineCount; i++) {
    const n = i + 1;
    rows[i] = {
      ...seed,
      "Invoice line identifier": `L${n}`,
      "Item name": `Item ${n}`,
      "Item description": `Line ${n}`,
      // Seed is Goods and leaves this blank. The portal labels it Service Accounting Code.
      [FV.SERVICE_TYPE_CODE_FIELD]: FV.SERVICE_TYPE_CODE_SAMPLE,
    };
  }
  return rows;
}

test.describe("Submit invoice line volume", () => {
  test.describe.configure({ mode: "serial", retries: 0 });

  for (const lineCount of LINE_COUNTS) {
    const neededMs = deliveryTimeoutNeededMs(lineCount);
    test(
      `Given a commercial invoice with ${lineCount} lines in OMR at standard VAT — When the invoice is submitted — Then the invoice should be delivered.`,
      async ({ page }) => {
        const configuredMs = configuredDeliveryTimeoutMs();
        test.skip(
          configuredMs < neededMs,
          `Needs SUBMIT_INVOICE_DELIVERY_TIMEOUT_MS >= ${neededMs} in the shell before Playwright starts (10,000 lines needs 3600000). Current is ${configuredMs}.`
        );
        test.setTimeout(configuredMs + GENERATE_AND_UPLOAD_SLACK_MS);
        await runSubmitInvoiceMultiItemCase(
          page,
          buildStandardTaxInvoiceLines(lineCount),
          {
            inputOverrides: {
              "Item price base quantity": "1",
              "Invoiced quantity": "1",
              "Item gross price": "1000",
              "Item price discount": "0",
            },
          }
        );
      }
    );
  }
});
