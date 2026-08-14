/**
 * Worker TIN slots: Playwright Worker 5 (parallelIndex 4) must use Oman VATIN
 * OM1108202604 for dashboard card + Excel identity (electronic = TRN, no UAE 00003).
 */
import { expect } from "@playwright/test";
import { test } from "../Src/baseTest";
import {
  dashboardCardTinForParallelUpload,
  electronicTinForParallelIndex,
  workerVatIdentifierForParallelIndex,
} from "../Helpers/parallelWorkerSubmitIdentity";

const OMAN_SLOTS =
  "OM1108202600,OM1108202601,OM1108202602,OM1108202603,OM1108202604";

test.describe("Parallel worker TIN slots", () => {
  test.describe.configure({ mode: "serial" });

  let previousSlots: string | undefined;

  test.beforeAll(() => {
    previousSlots = process.env.UAE_EINVOICE_SELLER_TIN_SLOTS;
  });

  test.afterAll(() => {
    if (previousSlots === undefined) {
      delete process.env.UAE_EINVOICE_SELLER_TIN_SLOTS;
    } else {
      process.env.UAE_EINVOICE_SELLER_TIN_SLOTS = previousSlots;
    }
  });

  test("Worker 5 uses fifth UAE_EINVOICE_SELLER_TIN_SLOTS TIN @fresh-page", () => {
    process.env.UAE_EINVOICE_SELLER_TIN_SLOTS = OMAN_SLOTS;
    expect(electronicTinForParallelIndex(4)).toBe("OM1108202604");
    expect(dashboardCardTinForParallelUpload(4)).toBe("OM1108202604");
    expect(workerVatIdentifierForParallelIndex(4)).toBe("OM1108202604");
  });

  test("Worker 1 skips card click and still maps first slot TIN @fresh-page", () => {
    process.env.UAE_EINVOICE_SELLER_TIN_SLOTS = OMAN_SLOTS;
    expect(electronicTinForParallelIndex(0)).toBe("OM1108202600");
    expect(dashboardCardTinForParallelUpload(0)).toBeNull();
  });

  test("Worker 5 defaults to Oman VATIN when slots unset (no UAE 00003) @fresh-page", () => {
    delete process.env.UAE_EINVOICE_SELLER_TIN_SLOTS;
    expect(electronicTinForParallelIndex(4)).toBe("OM1108202604");
    expect(workerVatIdentifierForParallelIndex(4)).toBe("OM1108202604");
  });
});
