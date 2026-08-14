/**
 * Worker TIN slots: Playwright Worker 5 (parallelIndex 4) must use the 5th
 * UAE_EINVOICE_SELLER_TIN_SLOTS value for dashboard card + Excel identity.
 */
import { expect } from "@playwright/test";
import { test } from "../Src/baseTest";
import {
  dashboardCardTinForParallelUpload,
  electronicTinForParallelIndex,
  workerVatIdentifierForParallelIndex,
} from "../Helpers/parallelWorkerSubmitIdentity";
import { getWorkerTinBase } from "../utils/envPartyIdentity";

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

  test("Numeric worker TIN still appends 00003 when slots unset @fresh-page", () => {
    delete process.env.UAE_EINVOICE_SELLER_TIN_SLOTS;
    const expected = String(getWorkerTinBase() + 4);
    expect(electronicTinForParallelIndex(4)).toBe(expected);
    expect(workerVatIdentifierForParallelIndex(4)).toBe(`${expected}00003`);
  });
});
