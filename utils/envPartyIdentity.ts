/**
 * Environment-specific counterparty electronic address (not worker TIN).
 * Normal invoices: buyer electronic address. Self-billed: seller electronic address.
 * Keep aligned with `invoice_excel_writer._counterparty_electronic_address`.
 */

import { resolveBaseUrl } from "./appConfig";

export type TargetEnv = "dev" | "preprod";

const COUNTERPARTY_ELECTRONIC_BY_ENV: Record<TargetEnv, string> = {
  dev: "OM1000091919",
  preprod: "1008212295",
};

/**
 * Worker TIN base per slot 0–4 (seller electronic / self-billed buyer electronic).
 *
 * Default values are environment-specific, but can be overridden via env:
 * - `UAE_EINVOICE_SELLER_TIN_BASE_DEV` (dev only)
 * - `UAE_EINVOICE_SELLER_TIN_BASE_PREPROD` (preprod only)
 * - `UAE_EINVOICE_SELLER_TIN_BASE` (applies to both, used if the env-specific one is missing)
 */
const WORKER_TIN_BASE_BY_ENV: Record<TargetEnv, number> = {
  dev: 1_779_700_001,
  preprod: 1_779_787_001,
};

/** Create Invoice UI — buyer electronic address when txn type is Deemed Supply. */
const DEEMED_SUPPLY_BUYER_ELECTRONIC_BY_ENV: Partial<Record<TargetEnv, string>> = {
  dev: "9900000097",
};

export function resolveTargetEnv(): TargetEnv {
  const url = resolveBaseUrl().toLowerCase();
  return url.includes("preprod") ? "preprod" : "dev";
}

/** Override with `UAE_EINVOICE_COUNTERPARTY_ELECTRONIC`; else derive from `BASE_URL`. */
export function getCounterpartyElectronicAddress(): string {
  const override = process.env.UAE_EINVOICE_COUNTERPARTY_ELECTRONIC?.trim();
  if (override) return override;
  return COUNTERPARTY_ELECTRONIC_BY_ENV[resolveTargetEnv()];
}

/** Worker TIN base for slot 0 (1779700001 dev, 1779787001 preprod). */
export function getWorkerTinBase(): number {
  const env = resolveTargetEnv();

  const envSpecific =
    env === "dev"
      ? process.env.UAE_EINVOICE_SELLER_TIN_BASE_DEV?.trim()
      : process.env.UAE_EINVOICE_SELLER_TIN_BASE_PREPROD?.trim();
  const globalOverride = process.env.UAE_EINVOICE_SELLER_TIN_BASE?.trim();

  const raw = envSpecific || globalOverride;
  if (raw) {
    const n = Number(raw);
    if (Number.isFinite(n)) return Math.trunc(n);
  }

  return WORKER_TIN_BASE_BY_ENV[env];
}

/** Numeric UAE TIN → `{electronic}00003`; Oman VATIN (`OM…`) stays unchanged. */
export function vatIdentifierForElectronicAddress(electronic: string): string {
  return /^\d+$/.test(electronic) ? `${electronic}00003` : electronic;
}

/** Counterparty TRN/TIN — normal buyer / self-billed seller. */
export function getCounterpartyVatIdentifier(): string {
  return vatIdentifierForElectronicAddress(getCounterpartyElectronicAddress());
}

/** Override with `UAE_EINVOICE_DEEMED_SUPPLY_BUYER_ELECTRONIC`; else env map / counterparty fallback. */
export function getDeemedSupplyBuyerElectronicAddress(): string {
  const override = process.env.UAE_EINVOICE_DEEMED_SUPPLY_BUYER_ELECTRONIC?.trim();
  if (override) return override;
  return (
    DEEMED_SUPPLY_BUYER_ELECTRONIC_BY_ENV[resolveTargetEnv()] ??
    getCounterpartyElectronicAddress()
  );
}

function normalizeInvoiceType(value: unknown): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/-/g, " ");
}

export function isSelfBilledInvoiceType(invoiceTypeCode: unknown): boolean {
  const n = normalizeInvoiceType(invoiceTypeCode);
  return n.includes("self billed credit note") || n.includes("self billed invoice");
}

/** Patch buyer (normal) or seller (self-billed) electronic address for the active environment. */
export function applyCounterpartyElectronicAddressOverrides<
  T extends Record<string, unknown>,
>(row: T): T {
  const counterparty = getCounterpartyElectronicAddress();
  if (isSelfBilledInvoiceType(row["Invoice Type Code"])) {
    return { ...row, "Seller electronic address": counterparty };
  }
  return { ...row, "Buyer electronic address": counterparty };
}
