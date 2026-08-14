/**
 * Playwright worker index 0–4 maps to Oman VATIN slots (mod 5). Dashboard card selection must match Python row patch
 * in `invoice_excel_writer.py` (`_apply_parallel_worker_identity_to_row`).
 *
 * Default slots: `OM1108202600` … `OM1108202604`. Optional `UAE_EINVOICE_SELLER_TIN_SLOTS`
 * (comma-separated) overrides that list. Electronic address and TRN/TIN are the same VATIN
 * (no UAE numeric TIN or `00003` suffix).
 */

import {
  getCounterpartyElectronicAddress,
  getCounterpartyVatIdentifier,
} from "../utils/envPartyIdentity";

/** Five dashboard TIN slots; indexes wrap when `PW_WORKERS` > 5. */
export const PARALLEL_WORKER_TIN_SLOT_COUNT = 5;

const DEFAULT_OMAN_SELLER_TIN_SLOTS = [
  "OM1108202600",
  "OM1108202601",
  "OM1108202602",
  "OM1108202603",
  "OM1108202604",
];

function parseSellerTinSlotsFromEnv(): string[] {
  const raw = process.env.UAE_EINVOICE_SELLER_TIN_SLOTS?.trim() ?? "";
  if (!raw) return [];
  const unquoted =
    (raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))
      ? raw.slice(1, -1).trim()
      : raw;
  return unquoted
    .split(/[,;]/)
    .map((part) => part.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

function sellerTinSlots(): string[] {
  const fromEnv = parseSellerTinSlotsFromEnv();
  return fromEnv.length > 0 ? fromEnv : DEFAULT_OMAN_SELLER_TIN_SLOTS;
}

/**
 * Map Playwright `parallelIndex` (or any integer) to 0 … PARALLEL_WORKER_TIN_SLOT_COUNT - 1.
 */
export function parallelWorkerTinSlot(parallelIndex: number | undefined): number {
  if (parallelIndex == null || Number.isNaN(Number(parallelIndex))) {
    return 0;
  }
  const idx = Math.max(0, Math.floor(Number(parallelIndex)));
  return idx % PARALLEL_WORKER_TIN_SLOT_COUNT;
}

/**
 * Active TIN slot for this test (0–4). Set from `baseTest` via `UAE_EINVOICE_WORKER_INDEX`
 * (already slotted); re-normalized here if the env is set manually.
 *
 * If `UAE_EINVOICE_WORKER_INDEX` is unset (e.g. code before `beforeEach`), falls back to
 * Playwright's `TEST_PARALLEL_INDEX` (0 … workers−1), which matches the worker process.
 */
export function getParallelWorkerIndex(): number {
  const raw = process.env.UAE_EINVOICE_WORKER_INDEX;
  if (raw !== undefined && raw !== "") {
    const n = Number(raw);
    if (Number.isFinite(n)) {
      return parallelWorkerTinSlot(Math.max(0, Math.floor(n)));
    }
  }
  const tp = process.env.TEST_PARALLEL_INDEX;
  if (tp !== undefined && tp !== "") {
    const n = Number(tp);
    if (Number.isFinite(n)) {
      return parallelWorkerTinSlot(n);
    }
  }
  return 0;
}

export function isParallelWorkerIdentityEnabled(): boolean {
  return process.env.UAE_EINVOICE_DISABLE_WORKER_IDENTITY !== "1";
}

/**
 * Worker electronic address (Oman VATIN) for a Playwright worker index or slot (0–4).
 * Uses `UAE_EINVOICE_SELLER_TIN_SLOTS` when set; else `OM1108202600` … `OM1108202604`.
 * `getParallelWorkerIndex()` already returns a slot; passing it here is correct.
 */
export function electronicTinForParallelIndex(parallelIndex: number): string {
  const slot = parallelWorkerTinSlot(parallelIndex);
  const slots = sellerTinSlots();
  return slots[slot % slots.length];
}

/**
 * Business card TIN before upload: aligned with `electronicTinForParallelIndex` / Python row patch.
 *
 * - Slot 0: `null` — skip card click (default first card).
 * - Slots 1–4: click the matching `.business-detail` Oman VATIN from slots.
 */
export function dashboardCardTinForParallelUpload(slotOrParallelIndex: number): string | null {
  const s = parallelWorkerTinSlot(slotOrParallelIndex);
  if (s === 0) return null;
  return electronicTinForParallelIndex(slotOrParallelIndex);
}

/** `DashboardPage.openDashboard` opts — worker TIN card selection shared by Excel upload and UI flows. */
export function parallelWorkerDashboardOpenOpts(options?: {
  businessTin?: string;
}): { businessTin: string | null } {
  const tinFromOptions =
    options?.businessTin != null && String(options.businessTin).trim() !== ""
      ? String(options.businessTin).trim()
      : null;
  const tinResolved =
    tinFromOptions ??
    (isParallelWorkerIdentityEnabled()
      ? dashboardCardTinForParallelUpload(getParallelWorkerIndex())
      : null);
  return tinResolved != null ? { businessTin: tinResolved } : { businessTin: null };
}

/**
 * Worker TRN/TIN for Excel/UI rows. Oman VATIN equals electronic address
 * (`OM1108202604`, not a numeric TIN + `00003`).
 */
export function workerVatIdentifierForParallelIndex(parallelIndex?: number): string {
  return electronicTinForParallelIndex(parallelIndex ?? getParallelWorkerIndex());
}

function normalizeSubmitInvoiceType(value: unknown): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/-/g, " ");
}

/**
 * Mirror `invoice_excel_writer._apply_parallel_worker_identity_to_row` for UI submit rows.
 * Patches seller/buyer electronic address and VAT/TIN columns per worker slot.
 */
export function applyParallelWorkerIdentityToSubmitRow(
  data: Record<string, string>
): Record<string, string> {
  if (!isParallelWorkerIdentityEnabled()) {
    return { ...data };
  }

  const workerIndex = getParallelWorkerIndex();
  const workerEl = electronicTinForParallelIndex(workerIndex);
  const workerVat = workerVatIdentifierForParallelIndex(workerIndex);
  const counterpartyEl = getCounterpartyElectronicAddress();

  const invType = normalizeSubmitInvoiceType(data["Invoice Type Code"]);
  const txnType = normalizeSubmitInvoiceType(data["Invoice Transaction Type Code"]);
  const selfBilled =
    invType.includes("self-billed") || invType.includes("self billed credit");
  const deemed = txnType === "deemed supply";

  const next: Record<string, string> = { ...data };

  if (selfBilled) {
    next["Seller electronic address"] = counterpartyEl;
    next["Seller VAT Identifier (TRN / TIN)"] = getCounterpartyVatIdentifier();
    next["Buyer electronic address"] = workerEl;
    next["Buyer VAT identifier"] = workerVat;
  } else if (deemed) {
    next["Seller electronic address"] = workerEl;
    next["Seller VAT Identifier (TRN / TIN)"] = workerVat;
    next["Buyer electronic address"] = counterpartyEl;
    next["Principle ID"] = workerVat;
    next["Seller legal registration identifier"] = workerVat;
  } else {
    next["Seller electronic address"] = workerEl;
    next["Seller VAT Identifier (TRN / TIN)"] = workerVat;
    next["Buyer electronic address"] = counterpartyEl;
    next["Buyer VAT identifier"] = getCounterpartyVatIdentifier();
  }

  return next;
}
