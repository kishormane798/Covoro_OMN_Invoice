/**
 * Runtime field-validation Excel: full Oman seed (same as testcase packs), then
 * current worker seller + buyer identity, then patch one target field.
 */
import * as FV from "../testData/FieldValidations";
import type {
  PartyIdentifierCompanion,
  PartyIdentifierParty,
} from "../testData/FieldValidations/partyIdentifierCompanionLength";
import {
  applyDependentOverlay,
  buildOmanDropdownBaseRow,
  resolveDropdownTemplateField,
  OMAN_BUYER_ELECTRONIC,
  OMAN_BUYER_VAT,
} from "./fieldValidationExcelPackHelper";
import { buildValidOmanFullTaxInvoiceRow } from "./conditionalValidationHelper";
import { randomAlphaNumeric } from "./fieldValidationHelper";
import { applyParallelWorkerIdentityToSubmitRow } from "./parallelWorkerSubmitIdentity";
import {
  buyerSellerIdentifierCodeValidTestData,
  schemeIdentifierValidTestData,
} from "../testData/FieldValidations/Master";
import {
  generateFullRowDropdownFieldExcel,
  generateInvoiceFromSubmitData,
  patchInvoiceTextCellInFile,
  readInvoiceTextCellFromFile,
} from "../utils/invoiceExcel";
import { formatOmanNumericBoundaryValue } from "../testData/FieldValidations/Min_max_field_validation";

function lengthValue(length: number): string {
  if (length === 0) return "";
  if (length === -1) return " ";
  if (length === -2) return "   ";
  return randomAlphaNumeric(length);
}

/** @deprecated Use `formatOmanNumericBoundaryValue` from Min_max_field_validation. */
export function formatNumericDigitCount(digitCount: number, decimals = 2): string {
  return formatOmanNumericBoundaryValue(digitCount, decimals);
}

function toLocalDateOnlyString(value: Date): string {
  const yyyy = value.getFullYear();
  const mm = String(value.getMonth() + 1).padStart(2, "0");
  const dd = String(value.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatIssueDateValue(
  issueDateValue: Date | string | number,
  issueDateFormat: string
): string {
  if (!(issueDateValue instanceof Date)) {
    return String(issueDateValue);
  }
  const ymd = toLocalDateOnlyString(issueDateValue);
  if (issueDateFormat === "dd-mm-yyyy") {
    const [y, m, d] = ymd.split("-");
    return `${d}-${m}-${y}`;
  }
  return ymd;
}

const BUYER_VAT_FIELD = "Buyer VAT identifier";
const BUYER_EL_FIELD = "Buyer electronic address";

const BUYER_SCHEME_FIELD = "Scheme identifier";
const BUYER_CODE_FIELD = "Buyer Identifier (textual code)";
const BUYER_IDENTIFIER_FIELD = "Buyer identifier";

const SELLER_SCHEME_FIELD = "Seller identifier - Scheme identifier";
const SELLER_CODE_FIELD = "Seller Identifier (textual code)";
const SELLER_IDENTIFIER_FIELD = "Seller identifier";

function masterLabel(
  list: readonly { label: string }[] | undefined,
  match: string,
  fallback: string
): string {
  const hit = list?.find((x) =>
    x.label.toLowerCase().includes(match.toLowerCase())
  );
  const fromHit = hit?.label?.trim();
  if (fromHit) return fromHit;
  const first = list?.[0]?.label?.trim();
  return first || fallback;
}

function buildOmanDropdownRuntimeBaseRow(field: string): Record<string, string> {
  const packBase = buildOmanDropdownBaseRow(field);
  const identified = applyParallelWorkerIdentityToSubmitRow({
    ...packBase,
    [BUYER_VAT_FIELD]: OMAN_BUYER_VAT,
    [BUYER_EL_FIELD]: OMAN_BUYER_ELECTRONIC,
  });
  identified[BUYER_VAT_FIELD] = OMAN_BUYER_VAT;
  identified[BUYER_EL_FIELD] = OMAN_BUYER_ELECTRONIC;
  return identified;
}

function dropdownValueLabel(item: unknown): string {
  if (typeof item === "string" || typeof item === "number") return String(item);
  if (item && typeof item === "object") {
    const rec = item as { label?: unknown; value?: unknown };
    return String(rec.label ?? rec.value ?? "");
  }
  return "";
}

/**
 * Dropdown master / invalid batches — same pipeline as TestData dropdown packs
 * (`buildOmanDropdownBaseRow` + `generateFullRowDropdownFieldExcel`), with worker
 * TIN identity layered on for parallel Playwright runs.
 *
 * Invalid (single-value) cases use the min/max path: one workbook, invalid label
 * written on the target column. Do not build a valid seed plus a second batch file.
 */
export async function generateOmanDropdownMasterExcel(
  field: string,
  masterData: unknown[] | unknown
): Promise<Array<{ filePath: string; invoiceNumber: string }>> {
  const values = Array.isArray(masterData) ? masterData : [masterData];
  const fieldForWrite = resolveDropdownTemplateField(field);
  const labels = values.map(dropdownValueLabel);
  const baseRow = buildOmanDropdownRuntimeBaseRow(field);

  if (labels.length === 1) {
    baseRow[fieldForWrite] = labels[0];
    const generated = await generateInvoiceFromSubmitData(baseRow);
    patchInvoiceTextCellInFile(generated.filePath, fieldForWrite, labels[0]);
    const saved = readInvoiceTextCellFromFile(generated.filePath, fieldForWrite);
    console.log(
      `[dropdown excel] ${fieldForWrite} saved=${JSON.stringify(saved.value)} expected=${JSON.stringify(labels[0])} dropdownPresent=${saved.dropdownPresent}`
    );
    if (saved.value !== labels[0]) {
      throw new Error(
        `Dropdown Excel did not keep invalid value for ${fieldForWrite}: ` +
          `saved ${JSON.stringify(saved.value)} expected ${JSON.stringify(labels[0])}`
      );
    }
    return [generated];
  }

  return generateFullRowDropdownFieldExcel(fieldForWrite, values, baseRow);
}

/**
 * Full Oman row + worker seller TIN + Oman buyer. The value under test is applied
 * on the row before generate so formula inputs (discount, qty, charges, …) are
 * included in totals; then patched again so identity/writer cannot overwrite it.
 * Calculated outputs are overwritten during generate and restored by that patch.
 */
export async function generateOmanSeededFieldExcel(
  field: string,
  value: string,
  options?: { skipDependentOverlay?: boolean }
): Promise<{ filePath: string; invoiceNumber: string }> {
  const seed = buildValidOmanFullTaxInvoiceRow();
  const overlaid = options?.skipDependentOverlay
    ? seed
    : applyDependentOverlay("", field, seed);
  const identified = applyParallelWorkerIdentityToSubmitRow({
    ...overlaid,
    [BUYER_VAT_FIELD]: OMAN_BUYER_VAT,
    [BUYER_EL_FIELD]: OMAN_BUYER_ELECTRONIC,
  });
  identified[BUYER_VAT_FIELD] = OMAN_BUYER_VAT;
  identified[BUYER_EL_FIELD] = OMAN_BUYER_ELECTRONIC;
  identified[field] = value;
  const generated = await generateInvoiceFromSubmitData(identified);
  if (field !== BUYER_VAT_FIELD) {
    patchInvoiceTextCellInFile(generated.filePath, BUYER_VAT_FIELD, OMAN_BUYER_VAT);
  }
  if (field !== BUYER_EL_FIELD) {
    patchInvoiceTextCellInFile(generated.filePath, BUYER_EL_FIELD, OMAN_BUYER_ELECTRONIC);
  }
  patchInvoiceTextCellInFile(generated.filePath, field, value);
  const invoiceNumber = field === "Invoice Number" ? value : generated.invoiceNumber;
  return { filePath: generated.filePath, invoiceNumber };
}

/**
 * Exempt-from-tax line with explicit reason code + text (IBG-30 interdependency).
 * Overlay sets Tax Category = Exempt from tax; both cells are patched afterward.
 */
export async function generateOmanExemptReasonExcel(
  reasonCode: string,
  reasonText: string
): Promise<{ filePath: string; invoiceNumber: string }> {
  const generated = await generateOmanSeededFieldExcel(
    FV.TAX_EXEMPTION_REASON_TEXT_FIELD,
    reasonText
  );
  patchInvoiceTextCellInFile(
    generated.filePath,
    FV.TAX_EXEMPTION_REASON_CODE_FIELD,
    reasonCode
  );
  patchInvoiceTextCellInFile(
    generated.filePath,
    FV.TAX_EXEMPTION_REASON_TEXT_FIELD,
    reasonText
  );
  return generated;
}

const PREPAY_NUMBER_FIELD = "Prepayment invoice number";
const PREPAY_UUID_FIELD = "Prepayment invoice UUID";

/**
 * Prepayment number + UUID pair (both-or-neither). Overlay fills prepayment
 * context; both cells are patched afterward so one-sided cases stay explicit.
 */
export async function generateOmanPrepaymentPairExcel(
  prepaymentNumber: string,
  prepaymentUuid: string
): Promise<{ filePath: string; invoiceNumber: string }> {
  const generated = await generateOmanSeededFieldExcel(
    PREPAY_NUMBER_FIELD,
    prepaymentNumber
  );
  patchInvoiceTextCellInFile(
    generated.filePath,
    PREPAY_NUMBER_FIELD,
    prepaymentNumber
  );
  patchInvoiceTextCellInFile(generated.filePath, PREPAY_UUID_FIELD, prepaymentUuid);
  return generated;
}

/**
 * Supporting document reference + UUID pair (both-or-neither). Overlay fills
 * supporting-document context; both cells are patched afterward.
 */
export async function generateOmanSupportingDocumentPairExcel(
  supportingReference: string,
  supportingUuid: string
): Promise<{ filePath: string; invoiceNumber: string }> {
  const generated = await generateOmanSeededFieldExcel(
    FV.SUPPORTING_DOCUMENT_REFERENCE_FIELD,
    supportingReference
  );
  patchInvoiceTextCellInFile(
    generated.filePath,
    FV.SUPPORTING_DOCUMENT_REFERENCE_FIELD,
    supportingReference
  );
  patchInvoiceTextCellInFile(
    generated.filePath,
    FV.SUPPORTING_DOCUMENT_UUID_FIELD,
    supportingUuid
  );
  return generated;
}

/**
 * Buyer/Seller identifier length with XOR companions (scheme OR code, never both).
 */
export async function generateOmanPartyIdentifierLengthExcel(opts: {
  party: PartyIdentifierParty;
  companion: PartyIdentifierCompanion;
  length: number;
}): Promise<{ filePath: string; invoiceNumber: string }> {
  const identifierField =
    opts.party === "buyer" ? BUYER_IDENTIFIER_FIELD : SELLER_IDENTIFIER_FIELD;
  const schemeField =
    opts.party === "buyer" ? BUYER_SCHEME_FIELD : SELLER_SCHEME_FIELD;
  const codeField =
    opts.party === "buyer" ? BUYER_CODE_FIELD : SELLER_CODE_FIELD;

  const schemeLabel = masterLabel(
    schemeIdentifierValidTestData,
    "Oman Value Added Tax",
    masterLabel(schemeIdentifierValidTestData, "Tax Identification", "Organisationsnummer")
  );
  const codeLabel = masterLabel(
    buyerSellerIdentifierCodeValidTestData,
    "Tax Identification",
    "Tax Identification Number"
  );

  let schemeValue = "";
  let codeValue = "";
  if (opts.companion === "scheme") schemeValue = schemeLabel;
  if (opts.companion === "code") codeValue = codeLabel;
  const identifierValue = lengthValue(opts.length);

  const generated = await generateOmanSeededFieldExcel(identifierField, identifierValue, {
    skipDependentOverlay: true,
  });
  patchInvoiceTextCellInFile(generated.filePath, schemeField, schemeValue);
  patchInvoiceTextCellInFile(generated.filePath, codeField, codeValue);
  patchInvoiceTextCellInFile(generated.filePath, identifierField, identifierValue);
  return generated;
}

export async function generateOmanFieldLengthExcel(
  field: string,
  length: number
): Promise<{ filePath: string; invoiceNumber: string }> {
  // Empty exemption text is valid on Standard rate. Overlay would switch to
  // Exempt and make empty an error (covered by the Exempt interdependency suite).
  if (field === FV.TAX_EXEMPTION_REASON_TEXT_FIELD && length === 0) {
    return generateOmanSeededFieldExcel(field, "", { skipDependentOverlay: true });
  }
  return generateOmanSeededFieldExcel(field, lengthValue(length));
}

export async function generateOmanNumericFieldExcel(
  field: string,
  digitCount: number,
  decimals?: number
): Promise<{ filePath: string; invoiceNumber: string }> {
  return generateOmanSeededFieldExcel(
    field,
    formatNumericDigitCount(digitCount, decimals ?? 2)
  );
}

export async function generateOmanIssueDateExcel(
  invoiceNumber: string,
  issueDateValue: Date | string | number,
  issueDateFormat: string
): Promise<{ filePath: string; invoiceNumber: string }> {
  const generated = await generateOmanSeededFieldExcel(
    "Invoice Issue Date",
    formatIssueDateValue(issueDateValue, issueDateFormat)
  );
  patchInvoiceTextCellInFile(generated.filePath, "Invoice Number", invoiceNumber);
  return { filePath: generated.filePath, invoiceNumber };
}
