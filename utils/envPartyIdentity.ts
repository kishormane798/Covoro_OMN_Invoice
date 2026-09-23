/**
 * Environment-specific counterparty electronic address (not worker TIN).
 * Normal invoices: counterparty → Buyer electronic address.
 * Self-billed (261/389): counterparty → Seller; worker/seller → Buyer (see swap helper).
 * Keep aligned with `invoice_excel_writer._counterparty_electronic_address`.
 */

import { resolveBaseUrl } from "./appConfig";

export type TargetEnv = "dev" | "preprod";

export function resolveTargetEnv(): TargetEnv {
  const url = resolveBaseUrl().toLowerCase();
  return url.includes("preprod") ? "preprod" : "dev";
}

const OMAN_VATIN_RE = /^OM(\d{10})$/i;
const SELLER_TIN_SLOTS_ENV = "OMN_EINVOICE_SELLER_TIN_SLOTS";
const SELLER_TIN_SLOTS_ENV_LEGACY = "UAE_EINVOICE_SELLER_TIN_SLOTS";
const COUNTERPARTY_EL_ENV = "OMN_EINVOICE_COUNTERPARTY_ELECTRONIC";
const COUNTERPARTY_EL_ENV_LEGACY = "UAE_EINVOICE_COUNTERPARTY_ELECTRONIC";
const SIMPLIFIED_COUNTERPARTY_EL_ENV =
  "OMN_EINVOICE_SIMPLIFIED_COUNTERPARTY_ELECTRONIC";
const SIMPLIFIED_COUNTERPARTY_EL_ENV_LEGACY =
  "UAE_EINVOICE_SIMPLIFIED_COUNTERPARTY_ELECTRONIC";
const SIMPLIFIED_IMPORT_GOODS_COUNTERPARTY_EL_ENV =
  "OMN_EINVOICE_SIMPLIFIED_IMPORT_GOODS_COUNTERPARTY_ELECTRONIC";
const SIMPLIFIED_IMPORT_GOODS_COUNTERPARTY_EL_ENV_LEGACY =
  "UAE_EINVOICE_SIMPLIFIED_IMPORT_GOODS_COUNTERPARTY_ELECTRONIC";

/** Prefer the Oman key. The UAE-prefixed key still works until `.env` and GitHub secrets are renamed. */
function readInvoiceEnv(name: string, legacyName: string): string {
  const current = process.env[name]?.trim() ?? "";
  if (current) return current;
  return process.env[legacyName]?.trim() ?? "";
}

/** `OM1708202600` / `om1708202600` → `OM1708202600`; else null. */
export function normalizeOmanVatin(raw: string): string | null {
  const m = raw.trim().match(OMAN_VATIN_RE);
  return m ? `OM${m[1]}` : null;
}

function unquoteEnvList(raw: string): string {
  const trimmed = raw.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

/** Seller dashboard / VATIN slots from `.env` (comma or semicolon). */
export function parseSellerTinSlotsFromEnv(): string[] {
  const raw = readInvoiceEnv(SELLER_TIN_SLOTS_ENV, SELLER_TIN_SLOTS_ENV_LEGACY);
  if (!raw) return [];
  return unquoteEnvList(raw)
    .split(/[,;]/)
    .map((part) => part.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

export function requireSellerTinSlots(): string[] {
  const slots = parseSellerTinSlotsFromEnv();
  if (slots.length === 0) {
    throw new Error(
      `${SELLER_TIN_SLOTS_ENV} is required in .env (comma-separated Oman VATINs, one per worker slot).`
    );
  }
  return slots;
}

export function sellerVatFromEnvSlot(slot = 0): string {
  const slots = requireSellerTinSlots();
  const idx = Math.max(0, Math.floor(slot)) % slots.length;
  return slots[idx];
}

function isSimplifiedTemplatePath(): boolean {
  return (process.env.INVOICE_TEMPLATE_PATH ?? "")
    .replace(/\\/g, "/")
    .toLowerCase()
    .includes("simplifiedtemplate.xlsx");
}

function requireCounterpartyElectronicRaw(): string {
  const override = readInvoiceEnv(COUNTERPARTY_EL_ENV, COUNTERPARTY_EL_ENV_LEGACY);
  if (!override) {
    throw new Error(
      `${COUNTERPARTY_EL_ENV} is required in .env (buyer Peppol electronic, e.g. om-receiver-dev).`
    );
  }
  return unquoteEnvList(override);
}

function requireSimplifiedCounterpartyElectronicRaw(): string {
  const override = readInvoiceEnv(
    SIMPLIFIED_COUNTERPARTY_EL_ENV,
    SIMPLIFIED_COUNTERPARTY_EL_ENV_LEGACY
  );
  if (!override) {
    throw new Error(
      `${SIMPLIFIED_COUNTERPARTY_EL_ENV} is required in .env (buyer Oman VATIN, e.g. OM1008994728).`
    );
  }
  return unquoteEnvList(override);
}

function requireSimplifiedImportGoodsCounterpartyElectronicRaw(): string {
  const override = readInvoiceEnv(
    SIMPLIFIED_IMPORT_GOODS_COUNTERPARTY_EL_ENV,
    SIMPLIFIED_IMPORT_GOODS_COUNTERPARTY_EL_ENV_LEGACY
  );
  if (!override) {
    throw new Error(
      `${SIMPLIFIED_IMPORT_GOODS_COUNTERPARTY_EL_ENV} is required in .env (Import of Goods buyer Oman VATIN, e.g. OM1708202605).`
    );
  }
  return unquoteEnvList(override);
}

/** Excel label `Import of Goods` or BTOM-001 bit `XXXXXXXXXXXX1XXXXXXX` / `00000000000010000000`. */
export function isImportOfGoodsTransactionType(value: unknown): boolean {
  const compact = String(value ?? "")
    .replace(/\s+/g, "")
    .trim()
    .toLowerCase();
  if (!compact) return false;
  if (compact.includes("importofgoods")) return true;
  return (
    compact === "xxxxxxxxxxxx1xxxxxxx" || compact === "00000000000010000000"
  );
}

function peppolElectronicFromRaw(raw: string): string {
  const oman = normalizeOmanVatin(raw);
  return oman ? oman.toLowerCase() : raw;
}

/**
 * Buyer / self-billed-seller electronic.
 * Simplified workbook: `OMN_EINVOICE_SIMPLIFIED_COUNTERPARTY_ELECTRONIC`, except
 * Import of Goods which uses `OMN_EINVOICE_SIMPLIFIED_IMPORT_GOODS_COUNTERPARTY_ELECTRONIC`.
 * Covoro Excel + UI use `OMN_EINVOICE_COUNTERPARTY_ELECTRONIC`.
 * Pass the row transaction type so simplified Import of Goods picks the import VATIN.
 */
export function getCounterpartyElectronicAddress(txnType?: unknown): string {
  if (isSimplifiedTemplatePath()) {
    const raw = isImportOfGoodsTransactionType(txnType)
      ? requireSimplifiedImportGoodsCounterpartyElectronicRaw()
      : requireSimplifiedCounterpartyElectronicRaw();
    return peppolElectronicFromRaw(raw);
  }
  return requireCounterpartyElectronicRaw();
}

/** Numeric UAE TIN → `{electronic}00003`; Oman VATIN (`OM…`) stays unchanged. */
export function vatIdentifierForElectronicAddress(electronic: string): string {
  const oman = normalizeOmanVatin(electronic);
  if (oman) return oman;
  return /^\d+$/.test(electronic) ? `${electronic}00003` : electronic;
}

/** Counterparty TRN/TIN — normal buyer / self-billed seller (Oman VATIN from Simplified env). */
export function getCounterpartyVatIdentifier(): string {
  const simplifiedRaw = requireSimplifiedCounterpartyElectronicRaw();
  const simplifiedOman = normalizeOmanVatin(simplifiedRaw);
  if (simplifiedOman) return simplifiedOman;

  const electronicOverride = requireCounterpartyElectronicRaw();
  const oman = normalizeOmanVatin(electronicOverride);
  if (oman) return oman;
  if (/^\d+$/.test(electronicOverride)) {
    return vatIdentifierForElectronicAddress(electronicOverride);
  }
  return electronicOverride;
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

const SELLER_ELECTRONIC_FIELD = "Seller electronic address";
const SELLER_VAT_FIELD = "Seller VAT Identifier (TRN / TIN)";
const BUYER_ELECTRONIC_FIELD = "Buyer electronic address";
const BUYER_VAT_FIELD = "Buyer VAT identifier";

/**
 * Self-billed invoice type 261/389: seller TRN/electronic ↔ buyer TRN/electronic.
 * Normal seller identity moves to buyer columns; counterparty moves to seller columns.
 */
export function applySelfBilledPartyIdentitySwap<
  T extends Record<string, string>,
>(row: T): T {
  const fallbackSellerVat = sellerVatFromEnvSlot(0);
  const sellerEl = String(
    row[SELLER_ELECTRONIC_FIELD] ?? fallbackSellerVat.toLowerCase()
  );
  const sellerVat = String(row[SELLER_VAT_FIELD] ?? fallbackSellerVat);
  const buyerEl = String(
    row[BUYER_ELECTRONIC_FIELD] ?? getCounterpartyElectronicAddress()
  );
  const buyerVat = String(row[BUYER_VAT_FIELD] ?? getCounterpartyVatIdentifier());

  return {
    ...row,
    [SELLER_ELECTRONIC_FIELD]: buyerEl,
    [SELLER_VAT_FIELD]: buyerVat,
    [BUYER_ELECTRONIC_FIELD]: sellerEl,
    [BUYER_VAT_FIELD]: sellerVat,
  };
}

/**
 * Counterparty Peppol + VAT on the correct party.
 * Normal: Buyer electronic (VAT stays on the row unless already set by identity).
 * Self-billed invoice / Self billed credit note: Seller electronic + Seller VAT.
 */
export function applyCounterpartyElectronicAddressOverrides<
  T extends Record<string, unknown>,
>(row: T): T {
  const selfBilled = isSelfBilledInvoiceType(row["Invoice Type Code"]);
  const el = getCounterpartyElectronicAddress(
    selfBilled ? undefined : row["Invoice Transaction Type Code"]
  );
  if (selfBilled) {
    const next: Record<string, unknown> = {
      ...row,
      [SELLER_ELECTRONIC_FIELD]: el,
      "Seller Electronic Address": el,
    };
    if (!isSimplifiedTemplatePath()) {
      next[SELLER_VAT_FIELD] = getCounterpartyVatIdentifier();
    }
    return next as T;
  }
  return {
    ...row,
    [BUYER_ELECTRONIC_FIELD]: el,
    "Buyer Electronic Address": el,
  };
}
