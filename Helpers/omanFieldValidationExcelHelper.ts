/**
 * Runtime field-validation Excel: full Oman seed (same as testcase packs), then
 * current worker seller + buyer identity, then patch one target field.
 */
import * as FV from "../testData/FieldValidations";
import { applyDependentOverlay, OMAN_BUYER_ELECTRONIC, OMAN_BUYER_VAT } from "./fieldValidationExcelPackHelper";
import { buildValidOmanFullTaxInvoiceRow } from "./conditionalValidationHelper";
import { randomAlphaNumeric } from "./fieldValidationHelper";
import { applyParallelWorkerIdentityToSubmitRow } from "./parallelWorkerSubmitIdentity";
import {
  generateInvoiceFromSubmitData,
  patchInvoiceTextCellInFile,
} from "../utils/invoiceExcel";

function lengthValue(length: number): string {
  if (length === 0) return "";
  if (length === -1) return " ";
  if (length === -2) return "   ";
  return randomAlphaNumeric(length);
}

/** Digit-count value for amount/qty rules (matches fieldValidationExcelPackHelper). */
export function formatNumericDigitCount(digitCount: number, decimals = 2): string {
  if (digitCount <= 0) return "";
  const intPart = "1".repeat(digitCount);
  if (decimals <= 0) return intPart;
  return `${intPart}.${"0".repeat(decimals)}`;
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

/**
 * Full Oman row + worker seller TIN + Oman buyer, then patch `field` so identity
 * stamp cannot overwrite the value under test.
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
