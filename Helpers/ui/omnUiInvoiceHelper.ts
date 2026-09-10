import { expect, type Page } from "@playwright/test";
import { test } from "../../Src/baseTest";
import { OMN_UIInvoiceManualPage } from "../../pageObjects/OMN_UIInvoiceManualPage";
import {
  getCounterpartyElectronicAddress,
  getCounterpartyVatIdentifier,
  isSelfBilledInvoiceType,
} from "../../utils/envPartyIdentity";
import {
  getParallelWorkerIndex,
  omanElectronicAddressFromWorkerTin,
  workerVatIdentifierForParallelIndex,
} from "../worker/parallelWorkerSubmitIdentity";
import {
  openOmnUiInvoiceEditor,
  isOmnUiPrefilledLineItemEntry,
} from "./omnUiInvoiceEntryHelper";
import { buildUniqueSubmitInvoiceNumber } from "../../utils/excel/invoiceExcel";
import {
  excelFormulaToUiValue,
  isUiEmptyValue,
  isUiWhitespaceValue,
  OMN_UI_DROPDOWN_ASSERT_IDS,
  OMN_UI_FORMULA_INPUT_CANDIDATES,
  OMN_UI_HS_CODE,
  OMN_UI_INDUSTRIAL_CLASSIFICATION,
  OMN_UI_INVOICE_FORMULA_KEYS,
  OMN_UI_INVOICE_TYPE_COMMERCIAL,
  OMN_UI_INVOICE_TYPE_CREDIT_NOTE,
  OMN_UI_INVOICE_TYPE_SELF_BILLED,
  OMN_UI_ITEM_FORMULA_KEYS,
  OMN_UI_ITEM_TYPE_GOODS,
  OMN_UI_FIELD_RULES,
  OMN_UI_PARTY_IDENTIFIER_SCHEME,
  OMN_UI_PARTY_IDENTIFIER_TEXTUAL_CODE,
  OMN_UI_PRECEDING_DATE_ID,
  OMN_UI_PRECEDING_REF_ID,
  OMN_UI_PRECEDING_UUID_ID,
  OMN_UI_PROFIT_MARGIN_TOTAL_DUE,
  OMN_UI_SECTION_ORDER,
  OMN_UI_TAX_IN_ACCOUNTING_CURRENCY_AMOUNT,
  OMN_UI_TAX_CATEGORY_STANDARD,
  OMN_UI_UNIT_OF_MEASURE,
  OMN_UI_TXN_FULL_TAX,
  OMN_UI_TXN_SELF_BILLED,
  omnUiNumericFieldLocation,
  isOmnUiEmptyThirdPartyOnFullTax,
  omnUiMinMaxExpectsError,
  omnUiMinMaxFieldValue,
  omnUiPrecedingInvoiceEnablement,
  type OmnUiCatalogRow,
  type OmnUiConditionalScenario,
  type OmnUiEntry,
  type OmnUiExcelPartyIdentityCase,
  type OmnUiFieldRule,
  type OmnUiMinMaxTxnContext,
  type OmnUiMinMaxVariant,
  type OmnUiSection,
} from "../../testData/ui/omnUiInvoiceValidation";
import type { PartyIdentifierLengthCase } from "../../testData/FieldValidations/partyIdentifierCompanionLength";
import {
  CREDIT_DEBIT_REASON_SAMPLE,
  EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
  NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
  OMAN_CURRENCY_USD,
  PRECEDING_INVOICE_UUID_SAMPLE,
  PROFIT_MARGIN_ITEM_TYPE_SAMPLE,
  STANDARD_TAX_CATEGORY_CODE,
  TAX_EXEMPTION_REASON_SAMPLE,
  TAX_EXEMPTION_REASON_TEXT_SAMPLE,
  TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
  TAX_RATE_ZERO,
  TXN_CONTINUOUS_SUPPLY,
  TXN_FULL_TAX_INVOICE,
  TXN_IMPORT_OF_GOODS,
  TXN_IMPORT_OF_SERVICES_RCM,
  TXN_PREPAYMENT_INVOICE,
  TXN_PROFIT_MARGIN_INVOICE,
  TXN_PROFIT_MARGIN_SELF_INVOICE,
  TXN_SELF_BILLED_INVOICE,
  TXN_SIMPLIFIED_TAX_INVOICE,
  TXN_SUMMARY_INVOICE,
  TXN_THIRD_PARTY_INVOICE,
  SELF_BILLED_OR_RCM_TXN_TYPES,
  btom001EnsureBaseTxnLabels,
  UAE_COUNTRY_CODE,
  ZERO_RATED_TAX_CATEGORY_CODE,
  splitOmanTxnMasterLabels,
} from "../../testData/FieldValidations/ConditionalValidation";
import { createInvoiceIssueDateScenarios } from "../../testData/FieldValidations/InvoiceIssueDateValidation";
import {
  invoiceFormulaTestData,
  type InvoiceFormulaScenario,
} from "../../testData/FieldValidations/Min_max_field_validation";

function toNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || String(value).trim() === "") {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** UI-side expected totals (OMR). Kept here so formula tests do not import Excel utils. */
function omnUiExpectedTotals(scenario: InvoiceFormulaScenario): {
  itemNetPrice: number;
  invoiceLineNetAmount: number;
  vatLineAmount: number;
  invoiceLineAmount: number;
  invoiceTotalWithTax: number;
  amountDue: number;
} {
  const fix6 = (num: number) => Number(num.toFixed(6));
  const ceil2 = (num: number) => {
    if (!Number.isFinite(num)) return 0;
    return Math.ceil(num * 100 - 1e-12) / 100;
  };
  const itemPriceBaseQty = toNumber(scenario.itemPriceBaseQty, 1);
  const itemGrossPrice = toNumber(scenario.itemGrossPrice);
  const itemPriceDiscount = toNumber(scenario.itemPriceDiscount);
  const invoicedQty = toNumber(scenario.invoicedQty);
  const lineCharge = toNumber(scenario.lineCharge);
  const lineAllowance = toNumber(scenario.lineAllowance);
  const taxRate = toNumber(scenario.taxRate);
  const docCharges = toNumber(scenario.docCharges);
  const docAllowances = toNumber(scenario.docAllowances);
  const paidAmount = toNumber(scenario.paidAmount);
  const roundingAmount = toNumber(scenario.roundingAmount);

  const rawItemNet = fix6(itemGrossPrice - itemPriceDiscount);
  const rawLineNet = fix6(
    itemPriceBaseQty > 0
      ? (rawItemNet * invoicedQty) / itemPriceBaseQty + lineCharge - lineAllowance
      : lineCharge - lineAllowance
  );
  const rawVatBase = fix6(rawLineNet * (taxRate / 100));
  const rawInvoiceTotalTax = fix6(rawVatBase);
  const rawTotalWithoutTax = fix6(rawLineNet + docCharges - docAllowances);
  const rawTotalWithTax = fix6(rawTotalWithoutTax + rawInvoiceTotalTax);

  return {
    itemNetPrice: ceil2(rawItemNet),
    invoiceLineNetAmount: ceil2(rawLineNet),
    vatLineAmount: ceil2(rawVatBase),
    invoiceLineAmount: ceil2(rawLineNet + rawVatBase),
    invoiceTotalWithTax: ceil2(rawTotalWithTax),
    amountDue: ceil2(fix6(rawTotalWithTax - paidAmount + roundingAmount)),
  };
}

function lengthForVariant(rule: OmnUiFieldRule, variant: OmnUiMinMaxVariant): number {
  switch (variant) {
    case "min":
      return rule.min;
    case "max":
      return rule.max;
    case "belowMin":
      return rule.belowMin;
    case "aboveMax":
      return rule.aboveMax;
  }
}

function workerVat(): string {
  return workerVatIdentifierForParallelIndex(getParallelWorkerIndex());
}

function workerElectronic(): string {
  return omanElectronicAddressFromWorkerTin(workerVat());
}

const OMAN_PEPPOL_VATIN_SCHEME_LABEL = "Oman Value Added Tax Identification Number (VATIN)";
const OMAN_PEPPOL_VATIN_SCHEME = /Oman Value Added Tax Identification Number \(VATIN\)/i;

function isSelfBilledOnForm(invoiceTypeCode?: string): boolean {
  // Invoice Type Code only — Transaction Type "Self-billed Invoice" must not swap parties.
  return isSelfBilledInvoiceType(invoiceTypeCode);
}

/** Same seller/buyer TRN + electronic mapping as Excel `applyParallelWorkerIdentityToSubmitRow`. */
function excelPartyIdentity(
  invoiceTypeCode?: string,
  _invoiceTransactionTypeCode?: string
): {
  sellerVat: string;
  sellerElectronic: string;
  buyerVat: string;
  buyerElectronic: string;
} {
  const workerTin = workerVat();
  const workerEl = workerElectronic();
  const counterpartyVat = getCounterpartyVatIdentifier();
  const counterpartyEl = getCounterpartyElectronicAddress();
  if (isSelfBilledOnForm(invoiceTypeCode)) {
    return {
      sellerVat: counterpartyVat,
      sellerElectronic: counterpartyEl,
      buyerVat: workerTin,
      buyerElectronic: workerEl,
    };
  }
  return {
    sellerVat: workerTin,
    sellerElectronic: workerEl,
    buyerVat: counterpartyVat,
    buyerElectronic: counterpartyEl,
  };
}

async function excelPartyIdentityFromForm(
  invoice: OMN_UIInvoiceManualPage,
  knownTypes?: { invoiceTypeCode?: string; invoiceTransactionTypeCode?: string }
) {
  const invoiceTypeCode =
    knownTypes?.invoiceTypeCode || (await invoice.readInputValue("document", "invType"));
  const invoiceTransactionTypeCode =
    knownTypes?.invoiceTransactionTypeCode ||
    (await invoice.readInputValue("document", "invTxnType"));
  return excelPartyIdentity(invoiceTypeCode, invoiceTransactionTypeCode);
}

async function peppolSchemeState(
  invoice: OMN_UIInvoiceManualPage,
  section: "seller" | "buyer"
): Promise<"filled" | "enabled" | "disabled"> {
  const value = await invoice.readInputValue(section, "peppolSchemeIdentifier");
  if (OMAN_PEPPOL_VATIN_SCHEME.test(value)) return "filled";
  if (await invoice.isInputDisabled(section, "peppolSchemeIdentifier")) return "disabled";
  return "enabled";
}

async function selectOmanPeppolScheme(
  invoice: OMN_UIInvoiceManualPage,
  section: "seller" | "buyer"
): Promise<void> {
  const initial = await peppolSchemeState(invoice, section);
  if (initial === "filled") return;
  if (initial === "disabled") {
    // Self-billed buyer: own-party scheme is MUI-disabled. Clicking it hangs;
    // DOM writes are reset by React. Leave it for the product / Save.
    return;
  }
  await invoice.selectAutocomplete(section, "peppolSchemeIdentifier", OMAN_PEPPOL_VATIN_SCHEME_LABEL);
  const actual = await invoice.readInputValue(section, "peppolSchemeIdentifier");
  expect(actual, `${section} electronic address scheme should be Oman VATIN`).toMatch(
    OMAN_PEPPOL_VATIN_SCHEME
  );
}

async function writePartyIdentity(
  invoice: OMN_UIInvoiceManualPage,
  section: "seller" | "buyer",
  inputId: string,
  value: string,
  altInputIds: readonly string[] = []
): Promise<void> {
  if (await invoice.isInputDisabled(section, inputId, altInputIds)) {
    await invoice.replaceInputForced(section, inputId, value, altInputIds);
  } else {
    await invoice.replaceInput(section, inputId, value, altInputIds);
  }
  if (section === "buyer") {
    await invoice.dismissOpenDropdown();
  }
  const actual = await invoice.readInputValue(section, inputId, altInputIds);
  expect(actual, `${section}.${inputId} should be entered`).toBe(value);
}

function invoiceTypeForTxnLabels(labels: readonly string[]): string {
  if (
    labels.some((label) =>
      (SELF_BILLED_OR_RCM_TXN_TYPES as readonly string[]).includes(label)
    )
  ) {
    return OMN_UI_INVOICE_TYPE_SELF_BILLED;
  }
  return OMN_UI_INVOICE_TYPE_COMMERCIAL;
}

function resolvedUiInvoiceType(scenario: OmnUiConditionalScenario): string | undefined {
  if (scenario.invoiceTypeCode) return scenario.invoiceTypeCode;
  if (!scenario.invoiceTransactionTypeCode) return undefined;
  return invoiceTypeForTxnLabels(
    splitOmanTxnMasterLabels(scenario.invoiceTransactionTypeCode)
  );
}

async function selectDocumentTransactionTypes(
  invoice: OMN_UIInvoiceManualPage,
  txnCell: string | readonly string[],
  invoiceTypeOverride?: string
): Promise<void> {
  const labels =
    typeof txnCell === "string" ? splitOmanTxnMasterLabels(txnCell) : [...txnCell];
  const wanted = labels.map((label) => label.trim()).filter(Boolean);
  if (wanted.length === 0) return;
  const invoiceType = invoiceTypeOverride || invoiceTypeForTxnLabels(wanted);
  // Always click-commit Invoice Type. fill() can make inputValue look right
  // while the form still gates txn checkboxes from the previous type.
  await invoice.selectInvoiceType(invoiceType);
  await invoice.selectTransactionTypes(btom001EnsureBaseTxnLabels(wanted));
}

async function ensureDocumentBaseline(
  invoice: OMN_UIInvoiceManualPage,
  entry: OmnUiEntry,
  excludeInputIds: Set<string>
): Promise<void> {
  if (!excludeInputIds.has("invNum")) {
    const current = await invoice.readInputValue("document", "invNum");
    if (entry !== "edit" || !current) {
      await invoice.replaceInput("document", "invNum", buildUniqueSubmitInvoiceNumber());
    }
  }
  // Invoice type first so transaction-type options match the selected document.
  // Always apply: Edit/Copy and Create prefills keep a previous type if we only
  // fill when empty.
  if (!excludeInputIds.has("invType") && !excludeInputIds.has("invTxnType")) {
    await selectDocumentTransactionTypes(invoice, OMN_UI_TXN_FULL_TAX);
    return;
  }
  if (!excludeInputIds.has("invType")) {
    await invoice.selectAutocomplete("document", "invType", OMN_UI_INVOICE_TYPE_COMMERCIAL);
  }
  if (!excludeInputIds.has("invTxnType")) {
    await selectDocumentTransactionTypes(invoice, OMN_UI_TXN_FULL_TAX);
  }
}

function isDropdownInput(inputId: string, altInputIds: readonly string[] = []): boolean {
  return [inputId, ...altInputIds].some((id) => OMN_UI_DROPDOWN_ASSERT_IDS.has(id));
}

async function fillIfEmpty(
  invoice: OMN_UIInvoiceManualPage,
  section: OmnUiSection,
  inputId: string,
  value: string,
  altInputIds: readonly string[] = []
): Promise<void> {
  if (await invoice.isInputDisabled(section, inputId, altInputIds)) return;
  const current = await invoice.readInputValue(section, inputId, altInputIds);
  if (current) return;
  // Empty dropdown column: leave it. Do not click the autocomplete.
  if (isDropdownInput(inputId, altInputIds) || isUiEmptyValue(value)) return;
  await invoice.replaceInput(section, inputId, value, altInputIds);
  if (section === "buyer" || section === "item") {
    // Type the value; do not pick Search Buyer / Search Item master hits.
    await invoice.dismissOpenDropdown();
  }
}

async function ensurePartyBaseline(
  invoice: OMN_UIInvoiceManualPage,
  section: "seller" | "buyer",
  excludeInputIds: Set<string>,
  knownTypes?: { invoiceTypeCode?: string; invoiceTransactionTypeCode?: string }
): Promise<void> {
  const identity = await excelPartyIdentityFromForm(invoice, knownTypes);
  const vat = section === "seller" ? identity.sellerVat : identity.buyerVat;
  const electronic =
    section === "seller" ? identity.sellerElectronic : identity.buyerElectronic;
  const partyName = section === "seller" ? "Seller Co" : "Buyer Co";
  const vatAlts = section === "seller" ? ["sellerVatIdentifier"] : [];
  const electronicAlts =
    section === "seller" ? ["sellerElectronicAddress"] : ["buyerElectronicAddress"];

  if (!excludeInputIds.has("name")) {
    await fillIfEmpty(
      invoice,
      section,
      "name",
      partyName,
      section === "seller" ? ["sellerName"] : []
    );
  }
  if (!excludeInputIds.has("country") && !excludeInputIds.has("countryCode")) {
    const country = await invoice.readInputValue(section, "country", ["countryCode"]);
    if (!country) {
      await invoice.selectAutocomplete(section, "country", /oman/i, ["countryCode"]);
    }
  }
  if (
    !excludeInputIds.has("vatIdentifier") &&
    !excludeInputIds.has("sellerVatIdentifier") &&
    !excludeInputIds.has("buyerVatIdentifier")
  ) {
    await writePartyIdentity(invoice, section, "vatIdentifier", vat, vatAlts);
  }
  if (!excludeInputIds.has("peppolSchemeIdentifier")) {
    await selectOmanPeppolScheme(invoice, section);
  }
  if (
    !excludeInputIds.has("electronicAddress") &&
    !excludeInputIds.has("sellerElectronicAddress")
  ) {
    await writePartyIdentity(
      invoice,
      section,
      "electronicAddress",
      electronic,
      electronicAlts
    );
  }
  if (!excludeInputIds.has("address1") && !excludeInputIds.has("address")) {
    await fillIfEmpty(invoice, section, "address1", "Address line 1", ["address"]);
  }
  if (!excludeInputIds.has("address2")) {
    await fillIfEmpty(invoice, section, "address2", "Address line 2");
  }
  if (!excludeInputIds.has("address3")) {
    await fillIfEmpty(invoice, section, "address3", "Address line 3");
  }
  if (!excludeInputIds.has("city")) {
    await fillIfEmpty(invoice, section, "city", "Muscat");
  }
  if (!excludeInputIds.has("postCode") && !excludeInputIds.has("postalCode")) {
    await fillIfEmpty(invoice, section, "postCode", "100", ["postalCode"]);
  }
}

async function ensureItemBaseline(
  invoice: OMN_UIInvoiceManualPage,
  entry: OmnUiEntry,
  excludeInputIds: Set<string>
): Promise<void> {
  await invoice.openItemEditor(isOmnUiPrefilledLineItemEntry(entry));
  if (!excludeInputIds.has("invLineId") && !excludeInputIds.has("invoiceLineIdentifier") && !excludeInputIds.has("lineId")) {
    await fillIfEmpty(invoice, "item", "invLineId", "LINE-001", [
      "invoiceLineIdentifier",
      "lineId",
    ]);
  }
  if (!excludeInputIds.has("itemName")) {
    await fillIfEmpty(invoice, "item", "itemName", "Goods item");
  }
  if (!excludeInputIds.has("itemDescription")) {
    await fillIfEmpty(invoice, "item", "itemDescription", "Goods description");
  }
  if (!excludeInputIds.has("industrialClassification")) {
    await invoice.selectAutocomplete(
      "item",
      "industrialClassification",
      OMN_UI_INDUSTRIAL_CLASSIFICATION
    );
  }
  if (!excludeInputIds.has("itemType")) {
    await invoice.selectAutocomplete("item", "itemType", OMN_UI_ITEM_TYPE_GOODS);
  }
  if (!excludeInputIds.has("classificationIdentifier")) {
    await invoice.selectAutocomplete("item", "classificationIdentifier", OMN_UI_HS_CODE);
  }
  if (!excludeInputIds.has("taxRateDtls[0].taxCategory")) {
    await invoice.selectAutocomplete(
      "item",
      "taxRateDtls[0].taxCategory",
      OMN_UI_TAX_CATEGORY_STANDARD
    );
  }
  if (!excludeInputIds.has("unitOfMeasure")) {
    await invoice.selectAutocomplete("item", "unitOfMeasure", OMN_UI_UNIT_OF_MEASURE);
  }
  if (!excludeInputIds.has("priceBaseQty")) {
    await fillIfEmpty(invoice, "item", "priceBaseQty", "1");
  }
  if (!excludeInputIds.has("itemGrossPrice")) {
    await fillIfEmpty(invoice, "item", "itemGrossPrice", "100");
  }
  if (!excludeInputIds.has("invoiceQty") && !excludeInputIds.has("invoicedQty") && !excludeInputIds.has("invQty")) {
    await fillIfEmpty(invoice, "item", "invoiceQty", "1", ["invoicedQty", "invQty"]);
  }
  if (!excludeInputIds.has("custom1")) {
    await fillIfEmpty(invoice, "item", "custom1", "Item custom 1");
  }
  if (!excludeInputIds.has("custom2")) {
    await fillIfEmpty(invoice, "item", "custom2", "Item custom 2");
  }
}

/** Invoice Details Save needs a line item first; totals stay read-only until then. */
async function addAndCommitBaselineItem(
  invoice: OMN_UIInvoiceManualPage,
  entry: OmnUiEntry
): Promise<void> {
  await ensureItemBaseline(invoice, entry, new Set());
  await invoice.clickItemCommit(entry);
  await expect(invoice.itemModal()).toBeHidden({ timeout: 15_000 });
}

async function ensureThirdPartyBaseline(
  invoice: OMN_UIInvoiceManualPage,
  excludeInputIds: Set<string>
): Promise<void> {
  if (!excludeInputIds.has("name")) {
    await fillIfEmpty(invoice, "thirdParty", "name", "Third Party Co");
  }
  if (!excludeInputIds.has("vatIdentifier")) {
    await fillIfEmpty(invoice, "thirdParty", "vatIdentifier", "OM1999999998");
  }
  if (!excludeInputIds.has("address1") && !excludeInputIds.has("address")) {
    await fillIfEmpty(invoice, "thirdParty", "address1", "Address line 1", ["address"]);
  }
  if (!excludeInputIds.has("address2")) {
    await fillIfEmpty(invoice, "thirdParty", "address2", "Address line 2");
  }
  if (!excludeInputIds.has("address3")) {
    await fillIfEmpty(invoice, "thirdParty", "address3", "Address line 3");
  }
  if (!excludeInputIds.has("city")) {
    await fillIfEmpty(invoice, "thirdParty", "city", "Muscat");
  }
  if (!excludeInputIds.has("postCode") && !excludeInputIds.has("postalCode")) {
    await fillIfEmpty(invoice, "thirdParty", "postCode", "100", ["postalCode"]);
  }
  if (!excludeInputIds.has("country") && !excludeInputIds.has("countryCode")) {
    const country = await invoice.readInputValue("thirdParty", "country", ["countryCode"]);
    if (!country) {
      await invoice.selectAutocomplete("thirdParty", "country", /oman/i, ["countryCode"]);
    }
  }
}

async function ensureShippingBaseline(
  invoice: OMN_UIInvoiceManualPage,
  excludeInputIds: Set<string>
): Promise<void> {
  if (!excludeInputIds.has("name") && !excludeInputIds.has("deliverToPartyName")) {
    await fillIfEmpty(invoice, "shipping", "name", "Deliver To Co", ["deliverToPartyName"]);
  }
  if (!excludeInputIds.has("address1") && !excludeInputIds.has("address") && !excludeInputIds.has("deliverToAddressLine1")) {
    await fillIfEmpty(invoice, "shipping", "address1", "Address line 1", [
      "address",
      "deliverToAddressLine1",
    ]);
  }
  if (!excludeInputIds.has("address2") && !excludeInputIds.has("deliverToAddressLine2")) {
    await fillIfEmpty(invoice, "shipping", "address2", "Address line 2", ["deliverToAddressLine2"]);
  }
  if (!excludeInputIds.has("address3") && !excludeInputIds.has("deliverToAddressLine3")) {
    await fillIfEmpty(invoice, "shipping", "address3", "Address line 3", ["deliverToAddressLine3"]);
  }
  if (!excludeInputIds.has("city") && !excludeInputIds.has("deliverToCity")) {
    await fillIfEmpty(invoice, "shipping", "city", "Muscat", ["deliverToCity"]);
  }
  if (
    !excludeInputIds.has("postCode") &&
    !excludeInputIds.has("postalCode") &&
    !excludeInputIds.has("deliverToPostCode")
  ) {
    await fillIfEmpty(invoice, "shipping", "postCode", "100", ["postalCode", "deliverToPostCode"]);
  }
  if (!excludeInputIds.has("countrySubdivision") && !excludeInputIds.has("deliverToCountrySubdivision")) {
    await fillIfEmpty(invoice, "shipping", "countrySubdivision", "Muscat", [
      "deliverToCountrySubdivision",
    ]);
  }
  if (!excludeInputIds.has("country") && !excludeInputIds.has("countryCode")) {
    const country = await invoice.readInputValue("shipping", "country", ["countryCode"]);
    if (!country) {
      await invoice.selectAutocomplete("shipping", "country", /oman/i, ["countryCode"]);
    }
  }
}

async function ensureCustomBaseline(
  invoice: OMN_UIInvoiceManualPage,
  excludeInputIds: Set<string>
): Promise<void> {
  for (const id of ["custom1", "custom2", "custom3", "custom4", "custom5"] as const) {
    if (excludeInputIds.has(id)) continue;
    await fillIfEmpty(invoice, "custom", id, `Custom ${id.slice(-1)}`);
  }
}

async function ensurePaymentBaseline(
  invoice: OMN_UIInvoiceManualPage,
  excludeInputIds: Set<string>
): Promise<void> {
  if (excludeInputIds.has("meansType")) {
    await invoice.clearAutocomplete("payment", "meansType");
    return;
  }
  await invoice.selectAutocomplete("payment", "meansType", "Credit transfer");
  if (!excludeInputIds.has("schemeId") && !excludeInputIds.has("paymentSchemeIdentifier")) {
    await fillIfEmpty(invoice, "payment", "schemeId", "SCH1", ["paymentSchemeIdentifier"]);
  }
  if (!excludeInputIds.has("accountId") && !excludeInputIds.has("paymentAccountIdentifier")) {
    await fillIfEmpty(invoice, "payment", "accountId", "ACC-001", ["paymentAccountIdentifier"]);
  }
  if (
    !excludeInputIds.has("primaryAccountNum") &&
    !excludeInputIds.has("paymentCardPrimaryAccountNumber")
  ) {
    await fillIfEmpty(invoice, "payment", "primaryAccountNum", "4111111111111111", [
      "paymentCardPrimaryAccountNumber",
    ]);
  }
  if (
    !excludeInputIds.has("prepaymentInvoiceNum") &&
    !excludeInputIds.has("prepaymentInvNum") &&
    !excludeInputIds.has("prepaymentInvoiceNumber")
  ) {
    await fillIfEmpty(invoice, "payment", "prepaymentInvoiceNum", "PRE-001", [
      "prepaymentInvNum",
      "prepaymentInvoiceNumber",
    ]);
  }
  if (
    !excludeInputIds.has("prepaymentInvoiceUuid") &&
    !excludeInputIds.has("prepaymentUuid") &&
    !excludeInputIds.has("prepaymentInvoiceUUID")
  ) {
    await fillIfEmpty(invoice, "payment", "prepaymentInvoiceUuid", "PRE-UUID-001", [
      "prepaymentUuid",
      "prepaymentInvoiceUUID",
    ]);
  }
}

async function ensureSectionBaseline(
  invoice: OMN_UIInvoiceManualPage,
  section: OmnUiSection,
  entry: OmnUiEntry,
  excludeInputIds: Set<string>
): Promise<void> {
  await invoice.openSectionForEdit("document", entry);
  let knownTypes: { invoiceTypeCode?: string; invoiceTransactionTypeCode?: string } | undefined;
  if (section !== "document") {
    if (await invoice.isSectionInEditMode("document", entry)) {
      await ensureDocumentBaseline(invoice, entry, new Set());
      knownTypes = {
        invoiceTypeCode: await invoice.readInputValue("document", "invType"),
        invoiceTransactionTypeCode: await invoice.readInputValue("document", "invTxnType"),
      };
      await invoice.clickSectionCommit("document", entry);
      await invoice.expectSectionSavedReadOnly("document");
    }
    if (section === "invoice") {
      await addAndCommitBaselineItem(invoice, entry);
    }
    await invoice.openSectionForEdit(section, entry);
  } else {
    await ensureDocumentBaseline(invoice, entry, excludeInputIds);
  }
  if (section === "seller" || section === "buyer") {
    await ensurePartyBaseline(invoice, section, excludeInputIds, knownTypes);
  }
  if (section === "thirdParty") {
    await ensureThirdPartyBaseline(invoice, excludeInputIds);
  }
  if (section === "shipping") {
    await ensureShippingBaseline(invoice, excludeInputIds);
  }
  if (section === "item") {
    await ensureItemBaseline(invoice, entry, excludeInputIds);
  }
  if (section === "payment") {
    await ensurePaymentBaseline(invoice, excludeInputIds);
  }
  if (section === "custom") {
    await ensureCustomBaseline(invoice, excludeInputIds);
  }
}

async function commitSection(
  invoice: OMN_UIInvoiceManualPage,
  section: OmnUiSection,
  entry: OmnUiEntry
): Promise<void> {
  if (section === "item") {
    await invoice.clickItemCommit(entry);
    return;
  }
  await invoice.clickSectionCommit(section, entry);
}

function isPrecedingInvoiceLengthField(rule: OmnUiFieldRule): boolean {
  return rule.inputId === OMN_UI_PRECEDING_REF_ID || rule.inputId === OMN_UI_PRECEDING_UUID_ID;
}

/**
 * ALIGNED-IBRP-028-OM / IBR-032-OM: Credit note enables preceding ref, date, and UUID.
 * Fill the other required trio fields so length tests are not blocked by presence rules.
 */
async function enablePrecedingInvoiceMinMaxFields(
  invoice: OMN_UIInvoiceManualPage,
  rule: OmnUiFieldRule
): Promise<void> {
  if (!isPrecedingInvoiceLengthField(rule)) return;

  await invoice.selectAutocomplete("document", "invType", OMN_UI_INVOICE_TYPE_CREDIT_NOTE);
  await invoice.expectInputDisabled("document", OMN_UI_PRECEDING_REF_ID, false);
  await invoice.expectInputDisabled("document", OMN_UI_PRECEDING_DATE_ID, false);
  await invoice.expectInputDisabled("document", OMN_UI_PRECEDING_UUID_ID, false);
  await invoice.selectAutocomplete("document", "creditNoteRsn", CREDIT_DEBIT_REASON_SAMPLE);

  if (rule.inputId !== OMN_UI_PRECEDING_REF_ID) {
    await invoice.replaceInput("document", OMN_UI_PRECEDING_REF_ID, "INV-PREV-MM");
  }
  await invoice.fillDate("document", OMN_UI_PRECEDING_DATE_ID, "2026-01-15");
  if (rule.inputId !== OMN_UI_PRECEDING_UUID_ID) {
    await invoice.replaceInput("document", OMN_UI_PRECEDING_UUID_ID, PRECEDING_INVOICE_UUID_SAMPLE);
  }
}

function isPrepaymentLengthField(rule: OmnUiFieldRule): boolean {
  return (
    rule.inputId === "prepaymentInvoiceNum" ||
    rule.inputId === "prepaymentInvoiceUuid" ||
    rule.inputId === "prepaymentInvNum" ||
    rule.inputId === "prepaymentUuid" ||
    (rule.altInputIds?.includes("prepaymentInvoiceNum") ?? false) ||
    (rule.altInputIds?.includes("prepaymentInvoiceUuid") ?? false)
  );
}

/**
 * Prepayment number/UUID stay disabled until Document uses Prepayment Invoice
 * plus a compatible invoice type (Commercial invoice).
 */
async function enablePrepaymentMinMaxFields(
  invoice: OMN_UIInvoiceManualPage,
  rule: OmnUiFieldRule,
  entry: OmnUiEntry
): Promise<void> {
  if (!isPrepaymentLengthField(rule)) return;

  await invoice.openSectionForEdit("document", entry);
  await invoice.selectAutocomplete("document", "invType", OMN_UI_INVOICE_TYPE_COMMERCIAL);
  await selectDocumentTransactionTypes(invoice, TXN_PREPAYMENT_INVOICE, OMN_UI_INVOICE_TYPE_COMMERCIAL);
  await invoice.clickSectionCommit("document", entry);
  await invoice.expectSectionSavedReadOnly("document");
  await invoice.openSectionForEdit("payment", entry);
  await invoice.expectInputDisabled(rule.section, rule.inputId, false, rule.altInputIds);
}

function isCustomsDeclarationLengthField(rule: OmnUiFieldRule): boolean {
  return rule.inputId === "customsDeclarationNumber";
}

/** Empty customs is allowed on Full Tax with import details absent (IBR-085-OM). */
function isEmptyCustomsDeclarationMinMax(
  rule: OmnUiFieldRule,
  variant: OmnUiMinMaxVariant
): boolean {
  return (
    isCustomsDeclarationLengthField(rule) &&
    variant === "belowMin" &&
    rule.belowMin === 0
  );
}

/**
 * Edit/Copy may reuse an Import of Goods row. Clear leftover import details
 * while the fields are still enabled, then Full Tax can disable them.
 */
async function clearImportDetailsOnEditOrCopy(
  invoice: OMN_UIInvoiceManualPage,
  entry: OmnUiEntry
): Promise<void> {
  if (entry === "create") return;

  const hasLeftover =
    Boolean(await invoice.readInputValue("document", "customsDeclarationNumber")) ||
    Boolean(await invoice.readInputValue("document", "importDate")) ||
    Boolean(await invoice.readInputValue("document", "incoterms"));
  if (!hasLeftover) return;

  if (await invoice.isInputDisabled("document", "customsDeclarationNumber")) {
    await selectDocumentTransactionTypes(invoice, TXN_IMPORT_OF_GOODS);
    await invoice.expectInputDisabled("document", "customsDeclarationNumber", false);
  }
  await leaveOrClearEmpty(
    invoice,
    entry,
    "document",
    "customsDeclarationNumber",
    [],
    "text"
  );
  await leaveOrClearEmpty(invoice, entry, "document", "importDate", [], "date");
  await leaveOrClearEmpty(invoice, entry, "document", "incoterms", [], "autocomplete");
}

/**
 * Length tests need Import of Goods so Customs Declaration is enabled.
 * Empty stays Full Tax (field disabled) and just Save/Update.
 * Edit/Copy clears leftover import details first. Create does not touch the field.
 */
async function enableImportOfGoodsMinMaxFields(
  invoice: OMN_UIInvoiceManualPage,
  rule: OmnUiFieldRule,
  entry: OmnUiEntry,
  variant: OmnUiMinMaxVariant
): Promise<void> {
  if (!isCustomsDeclarationLengthField(rule)) return;

  if (isEmptyCustomsDeclarationMinMax(rule, variant)) {
    await clearImportDetailsOnEditOrCopy(invoice, entry);
    await selectDocumentTransactionTypes(invoice, OMN_UI_TXN_FULL_TAX);
    return;
  }

  await selectDocumentTransactionTypes(invoice, TXN_IMPORT_OF_GOODS);
  await invoice.expectInputDisabled("document", "importDate", false);
  await invoice.expectInputDisabled("document", "customsDeclarationNumber", false);
  await writeDate(invoice, entry, "document", "importDate", "2026-01-10");
  await writeAutocomplete(invoice, entry, "document", "incoterms", "Free On Board");
}

function isThirdPartyLengthField(rule: OmnUiFieldRule): boolean {
  return rule.section === "thirdParty";
}

/**
 * Third Party fields stay disabled on Full Tax. Empty Full Tax keeps them
 * disabled and just Save/Update. Length and Third-party-empty tests switch txn.
 */
async function enableThirdPartyMinMaxFields(
  invoice: OMN_UIInvoiceManualPage,
  rule: OmnUiFieldRule,
  entry: OmnUiEntry,
  variant: OmnUiMinMaxVariant,
  txnContext?: OmnUiMinMaxTxnContext
): Promise<void> {
  if (!isThirdPartyLengthField(rule)) return;
  if (isOmnUiEmptyThirdPartyOnFullTax(rule, variant, txnContext)) {
    await invoice.openSectionForEdit("document", entry);
    await selectDocumentTransactionTypes(invoice, OMN_UI_TXN_FULL_TAX);
    await invoice.clickSectionCommit("document", entry);
    await invoice.expectSectionSavedReadOnly("document");
    await invoice.openSectionForEdit("thirdParty", entry);
    return;
  }

  await invoice.openSectionForEdit("document", entry);
  await selectDocumentTransactionTypes(invoice, TXN_THIRD_PARTY_INVOICE);
  await invoice.clickSectionCommit("document", entry);
  await invoice.expectSectionSavedReadOnly("document");
  await invoice.openSectionForEdit("thirdParty", entry);
  await ensureThirdPartyBaseline(
    invoice,
    new Set([rule.inputId, ...(rule.altInputIds ?? [])])
  );
  await invoice.expectInputDisabled(rule.section, rule.inputId, false, rule.altInputIds);
}

/** IBR-CO-21: if name or value is entered, the other must be present. Empty both is allowed. */
function itemAttributeMinMaxCompanion(
  rule: OmnUiFieldRule
): { inputId: string; altInputIds: readonly string[]; value: string } | null {
  const ids = [rule.inputId, ...(rule.altInputIds ?? [])];
  if (ids.some((id) => id === "itemAttributeName" || id === "attributeName")) {
    return { inputId: "itemAttributeValue", altInputIds: ["attributeValue"], value: "Black" };
  }
  if (ids.some((id) => id === "itemAttributeValue" || id === "attributeValue")) {
    return { inputId: "itemAttributeName", altInputIds: ["attributeName"], value: "Color" };
  }
  return null;
}

async function fillItemAttributeMinMaxCompanion(
  invoice: OMN_UIInvoiceManualPage,
  entry: OmnUiEntry,
  rule: OmnUiFieldRule,
  fieldValue: string
): Promise<void> {
  const companion = itemAttributeMinMaxCompanion(rule);
  if (!companion) return;
  if (isUiEmptyValue(fieldValue)) {
    await leaveOrClearEmpty(
      invoice,
      entry,
      "item",
      companion.inputId,
      companion.altInputIds,
      "text"
    );
    return;
  }
  await invoice.replaceInput("item", companion.inputId, companion.value, companion.altInputIds);
}

function isTaxExemptionReasonTextField(rule: OmnUiFieldRule): boolean {
  return (
    rule.inputId === "taxExemptionRsn" ||
    (rule.altInputIds?.includes("taxExemptionRsn") ?? false) ||
    (rule.altInputIds?.includes("taxExemptionReason") ?? false) ||
    (rule.altInputIds?.includes("taxRateDtls[0].exemptionReason") ?? false)
  );
}

/**
 * Exemption text is valid only with Tax Category Exempt or Zero rated plus a
 * reason code (IBR-069-OM). Standard + text is ALIGNED-IBRP-S-10-OM.
 * Zero rated keeps a commercial invoice (Exempt-only lines need out-of-scope).
 */
async function enableExemptionReasonTextMinMaxFields(
  invoice: OMN_UIInvoiceManualPage,
  rule: OmnUiFieldRule
): Promise<void> {
  if (!isTaxExemptionReasonTextField(rule)) return;

  const reasonCodeAlts = [
    "taxRateDtls[0].exemptionReasonCode",
    "taxExemptionReasonCode",
    "exemptionReasonType",
  ];
  await invoice.selectAutocomplete("item", "taxRateDtls[0].taxCategory", ZERO_RATED_TAX_CATEGORY_CODE);
  if (!(await invoice.isInputDisabled("item", "taxRateDtls[0].taxRate"))) {
    await invoice.replaceInput("item", "taxRateDtls[0].taxRate", TAX_RATE_ZERO);
  }
  await invoice.expectInputDisabled("item", "taxExemptionRsnType", false, reasonCodeAlts);
  await invoice.selectAutocomplete(
    "item",
    "taxExemptionRsnType",
    TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
    reasonCodeAlts
  );
  await invoice.expectInputDisabled("item", rule.inputId, false, rule.altInputIds);
}

function isTaxRateLengthField(rule: OmnUiFieldRule): boolean {
  return rule.inputId === "taxRateDtls[0].taxRate";
}

/** Empty Tax Rate is allowed on Not subject (ALIGNED-IBRP-O-05-OM / IBR-061-OM). */
function isEmptyTaxRateMinMax(
  rule: OmnUiFieldRule,
  variant: OmnUiMinMaxVariant
): boolean {
  return (
    isTaxRateLengthField(rule) &&
    variant === "belowMin" &&
    rule.belowMin === 0
  );
}

/**
 * Length tests need Standard rate so Tax Rate is enabled.
 * Empty stays Not subject (field disabled) and just Save/Update.
 */
async function enableTaxRateMinMaxFields(
  invoice: OMN_UIInvoiceManualPage,
  rule: OmnUiFieldRule,
  variant: OmnUiMinMaxVariant
): Promise<void> {
  if (!isTaxRateLengthField(rule)) return;
  if (isEmptyTaxRateMinMax(rule, variant)) {
    await invoice.selectAutocomplete(
      "item",
      "taxRateDtls[0].taxCategory",
      NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE
    );
    return;
  }
  await invoice.selectAutocomplete(
    "item",
    "taxRateDtls[0].taxCategory",
    OMN_UI_TAX_CATEGORY_STANDARD
  );
  await invoice.expectInputDisabled("item", "taxRateDtls[0].taxRate", false);
}

export async function runOmnUiMinMaxCase(
  page: Page,
  entry: OmnUiEntry,
  rule: OmnUiFieldRule,
  variant: OmnUiMinMaxVariant,
  txnContext?: OmnUiMinMaxTxnContext
): Promise<void> {
  const invoice = await openOmnUiInvoiceEditor(page, entry);
  // Fill every field in the section first, then overwrite the field under test.
  await ensureSectionBaseline(invoice, rule.section, entry, new Set());
  await enablePrecedingInvoiceMinMaxFields(invoice, rule);
  await enablePrepaymentMinMaxFields(invoice, rule, entry);
  await enableImportOfGoodsMinMaxFields(invoice, rule, entry, variant);
  await enableThirdPartyMinMaxFields(invoice, rule, entry, variant, txnContext);
  await enableExemptionReasonTextMinMaxFields(invoice, rule);
  await enableTaxRateMinMaxFields(invoice, rule, variant);

  const value = omnUiMinMaxFieldValue(rule, lengthForVariant(rule, variant));
  const emptyCustomsOnFullTax = isEmptyCustomsDeclarationMinMax(rule, variant);
  const emptyTaxRateOnNotSubject = isEmptyTaxRateMinMax(rule, variant);
  const emptyThirdPartyOnFullTax = isOmnUiEmptyThirdPartyOnFullTax(
    rule,
    variant,
    txnContext
  );
  const emptyAllowedWhenDisabled =
    emptyCustomsOnFullTax || emptyTaxRateOnNotSubject || emptyThirdPartyOnFullTax;
  const fieldDisabled = await invoice.isInputDisabled(
    rule.section,
    rule.inputId,
    rule.altInputIds
  );
  // Full Tax / Not subject leave the field disabled; that is the empty-allowed state, not a skip.
  if (fieldDisabled && !emptyAllowedWhenDisabled) {
    test.skip(true, `${rule.field} is disabled on ${entry}`);
  }
  const writeMinMaxField = async () => {
    if (isUiEmptyValue(value)) {
      // Disabled empty is the allowed state. Create just Save. Edit/Copy already cleared.
      if (emptyAllowedWhenDisabled && fieldDisabled) return;
      await leaveOrClearEmpty(
        invoice,
        entry,
        rule.section,
        rule.inputId,
        rule.altInputIds ?? [],
        rule.kind === "date" ? "date" : "text"
      );
      return;
    }
    await invoice.replaceInput(rule.section, rule.inputId, value, rule.altInputIds);
    if (rule.section === "buyer" || rule.section === "item") {
      await invoice.dismissOpenDropdown();
    }
  };

  await writeMinMaxField();
  // Long text can re-render the item modal and drop Zero rated + reason code.
  if (isTaxExemptionReasonTextField(rule) && !isUiEmptyValue(value)) {
    await enableExemptionReasonTextMinMaxFields(invoice, rule);
    await writeMinMaxField();
  }
  await fillItemAttributeMinMaxCompanion(invoice, entry, rule, value);
  await commitSection(invoice, rule.section, entry);

  const expectsError = omnUiMinMaxExpectsError(rule, variant, txnContext);
  const message = await invoice.readFieldError(rule.section, rule.inputId, rule.altInputIds);
  if (expectsError) {
    expect(message, `expected a field error on ${rule.field}`).toBeTruthy();
    await invoice.expectSectionNotSaved(rule.section, entry);
  } else {
    expect(message, `did not expect a field error on ${rule.field}`).toBeFalsy();
    await invoice.expectSectionSavedReadOnly(rule.section);
  }
}

function formatOmnUiIssueDateValue(
  issueDateValue: Date | string | number,
  issueDateFormat: string
): string {
  if (!(issueDateValue instanceof Date)) {
    return String(issueDateValue);
  }
  const yyyy = issueDateValue.getFullYear();
  const mm = String(issueDateValue.getMonth() + 1).padStart(2, "0");
  const dd = String(issueDateValue.getDate()).padStart(2, "0");
  if (issueDateFormat === "dd-mm-yyyy") {
    return `${dd}-${mm}-${yyyy}`;
  }
  return `${yyyy}-${mm}-${dd}`;
}

export async function runOmnUiIssueDateCase(
  page: Page,
  entry: OmnUiEntry,
  scenarioName: string
): Promise<void> {
  const scenario = createInvoiceIssueDateScenarios().find(
    (candidate) => candidate.name === scenarioName
  );
  if (!scenario) {
    throw new Error(`Unknown issue date scenario ${scenarioName}`);
  }

  const invoice = await openOmnUiInvoiceEditor(page, entry);
  await ensureSectionBaseline(invoice, "document", entry, new Set());
  const value = formatOmnUiIssueDateValue(
    scenario.issueDateValue,
    scenario.issueDateFormat
  );
  await invoice.replaceInput("document", "invDate", value, ["issueDate", "invIssueDate"]);

  if (scenario.shouldError) {
    const message = await invoice.readFieldError(
      "document",
      "invDate",
      ["issueDate", "invIssueDate"]
    );
    expect(
      message.length,
      `expected a field error for Invoice Issue Date in ${scenario.name}`
    ).toBeGreaterThan(0);
    return;
  }
  await invoice.clickSectionCommit("document", entry);
  await invoice.expectSectionSavedReadOnly("document");
}

export async function runOmnUiNumericCase(
  page: Page,
  entry: OmnUiEntry,
  field: string,
  digits: string,
  expectsError: boolean
): Promise<void> {
  const location = omnUiNumericFieldLocation(field);
  if (!location) {
    throw new Error(`No editable UI numeric control for ${field}`);
  }

  const invoice = await openOmnUiInvoiceEditor(page, entry);
  await ensureSectionBaseline(invoice, location.section, entry, new Set());
  await invoice.replaceInput(
    location.section,
    location.inputId,
    digits,
    location.altInputIds
  );

  await commitSection(invoice, location.section, entry);
  const message = await invoice.readFieldError(
    location.section,
    location.inputId,
    location.altInputIds
  );
  if (expectsError) {
    expect(message, `expected a field error for ${field}`).toBeTruthy();
    await invoice.expectSectionNotSaved(location.section, entry);
    return;
  }

  expect(message, `did not expect a field error for ${field}`).toBeFalsy();
  await invoice.expectSectionSavedReadOnly(location.section);
}

export async function runOmnUiPartyIdentifierCompanionCase(
  page: Page,
  entry: OmnUiEntry,
  scenario: PartyIdentifierLengthCase
): Promise<void> {
  const section = scenario.party;
  const schemeField =
    section === "seller"
      ? "Seller identifier - Scheme identifier"
      : "Scheme identifier";
  const codeField =
    section === "seller"
      ? "Seller Identifier (textual code)"
      : "Buyer Identifier (textual code)";
  const identifierRule = OMN_UI_FIELD_RULES.find(
    (rule) => rule.field === scenario.identifierField
  );
  const schemeRule = OMN_UI_FIELD_RULES.find(
    (rule) => rule.field === schemeField
  );
  const codeRule = OMN_UI_FIELD_RULES.find((rule) => rule.field === codeField);

  if (!identifierRule || !schemeRule || !codeRule) {
    throw new Error(
      `Missing party identifier UI rule metadata for ${scenario.identifierField}`
    );
  }

  const invoice = await openOmnUiInvoiceEditor(page, entry);
  await ensureSectionBaseline(invoice, section, entry, new Set([
    identifierRule.inputId,
    schemeRule.inputId,
    codeRule.inputId,
  ]));

  if (scenario.companion === "scheme" || scenario.companion === "both") {
    await invoice.selectAutocomplete(
      section,
      schemeRule.inputId,
      OMN_UI_PARTY_IDENTIFIER_SCHEME,
      schemeRule.altInputIds
    );
  } else if (
    await invoice.readInputValue(
      section,
      schemeRule.inputId,
      schemeRule.altInputIds
    )
  ) {
    await invoice.clearAutocomplete(
      section,
      schemeRule.inputId,
      schemeRule.altInputIds
    );
  }
  if (scenario.companion === "code" || scenario.companion === "both") {
    await invoice.selectAutocomplete(
      section,
      codeRule.inputId,
      OMN_UI_PARTY_IDENTIFIER_TEXTUAL_CODE,
      codeRule.altInputIds
    );
  } else if (
    await invoice.readInputValue(
      section,
      codeRule.inputId,
      codeRule.altInputIds
    )
  ) {
    await invoice.clearAutocomplete(
      section,
      codeRule.inputId,
      codeRule.altInputIds
    );
  }
  await invoice.replaceInput(
    section,
    identifierRule.inputId,
    "x".repeat(scenario.length),
    identifierRule.altInputIds
  );
  await commitSection(invoice, section, entry);

  const message = await invoice.readFieldError(
    section,
    identifierRule.inputId,
    identifierRule.altInputIds
  );
  if (!scenario.shouldAccept) {
    expect(
      message,
      `expected a field error for ${scenario.identifierField}`
    ).toBeTruthy();
    await invoice.expectSectionNotSaved(section, entry);
    return;
  }

  expect(
    message,
    `did not expect a field error for ${scenario.identifierField}`
  ).toBeFalsy();
  await invoice.expectSectionSavedReadOnly(section);
}

export async function runOmnUiCl06Case(
  page: Page,
  entry: OmnUiEntry,
  row: OmnUiCatalogRow
): Promise<void> {
  const {
    cl06Party: section,
    cl06Companion: companion,
    cl06CompanionValue: companionValue,
    cl06Identifier: identifier,
  } = row;
  if (!section || !companion || !companionValue || !identifier) {
    throw new Error(`CL-06 catalog row is missing scenario metadata: ${row.title}`);
  }

  const identifierField =
    section === "seller" ? "Seller identifier" : "Buyer identifier";
  const schemeField =
    section === "seller"
      ? "Seller identifier - Scheme identifier"
      : "Scheme identifier";
  const codeField =
    section === "seller"
      ? "Seller Identifier (textual code)"
      : "Buyer Identifier (textual code)";
  const identifierRule = OMN_UI_FIELD_RULES.find(
    (rule) => rule.field === identifierField
  );
  const schemeRule = OMN_UI_FIELD_RULES.find(
    (rule) => rule.field === schemeField
  );
  const codeRule = OMN_UI_FIELD_RULES.find((rule) => rule.field === codeField);
  if (!identifierRule || !schemeRule || !codeRule) {
    throw new Error(`Missing CL-06 UI rule metadata for ${row.field}`);
  }

  const selectedRule = companion === "scheme" ? schemeRule : codeRule;
  const unusedRule = companion === "scheme" ? codeRule : schemeRule;
  const invoice = await openOmnUiInvoiceEditor(page, entry);
  await ensureSectionBaseline(
    invoice,
    section,
    entry,
    new Set([identifierRule.inputId, schemeRule.inputId, codeRule.inputId])
  );

  if (entry !== "create") {
    await invoice.clearAutocomplete(
      section,
      unusedRule.inputId,
      unusedRule.altInputIds
    );
  }
  await invoice.replaceInput(
    section,
    identifierRule.inputId,
    identifier,
    identifierRule.altInputIds
  );

  if (row.expectsError) {
    await invoice.replaceInput(
      section,
      selectedRule.inputId,
      companionValue,
      selectedRule.altInputIds
    );
    await invoice.dismissOpenDropdown();
  } else {
    await invoice.selectAutocomplete(
      section,
      selectedRule.inputId,
      companionValue,
      selectedRule.altInputIds
    );
  }

  await commitSection(invoice, section, entry);
  const message = await invoice.readFieldError(
    section,
    selectedRule.inputId,
    selectedRule.altInputIds
  );
  if (row.expectsError) {
    const actualValue = await invoice.readInputValue(
      section,
      selectedRule.inputId,
      selectedRule.altInputIds
    );
    expect(
      Boolean(message) || actualValue !== companionValue,
      `${row.field} should show an error or reject the invalid CL-06 value`
    ).toBe(true);
    await invoice.expectSectionNotSaved(section, entry);
    return;
  }

  expect(message, `did not expect a field error for ${row.field}`).toBeFalsy();
  await invoice.expectSectionSavedReadOnly(section);
}

async function runOmnUiInvalidExemptionCase(
  page: Page,
  entry: OmnUiEntry,
  row: OmnUiCatalogRow
): Promise<void> {
  const rule = OMN_UI_FIELD_RULES.find((candidate) => candidate.field === row.field);
  if (!rule || !row.exemptionCode || !row.vatContext) {
    throw new Error(`Invalid exemption row is missing UI metadata: ${row.title}`);
  }
  const vatCategory =
    row.vatContext === "exempt"
      ? EXEMPT_FROM_TAX_TAX_CATEGORY_CODE
      : ZERO_RATED_TAX_CATEGORY_CODE;
  const vatField =
    row.field === "Tax exemption reason code"
      ? OMN_UI_FIELD_RULES.find((candidate) => candidate.field === "Tax Category")
      : OMN_UI_FIELD_RULES.find((candidate) =>
          candidate.field ===
          (row.field === "Tax exemption reason - charges"
            ? "Vat category - charges"
            : "Vat category - allowances")
        );
  if (!vatField) {
    throw new Error(`Missing VAT category rule for ${row.field}`);
  }

  const invoice = await openOmnUiInvoiceEditor(page, entry);
  await ensureSectionBaseline(invoice, rule.section, entry, new Set([
    rule.inputId,
    vatField.inputId,
  ]));
  await invoice.selectAutocomplete(
    rule.section,
    vatField.inputId,
    vatCategory,
    vatField.altInputIds
  );
  await invoice.replaceInput(
    rule.section,
    rule.inputId,
    row.exemptionCode,
    rule.altInputIds
  );
  await invoice.dismissOpenDropdown();
  await commitSection(invoice, rule.section, entry);
  const message = await invoice.readFieldError(
    rule.section,
    rule.inputId,
    rule.altInputIds
  );
  const actual = await invoice.readInputValue(
    rule.section,
    rule.inputId,
    rule.altInputIds
  );
  expect(
    Boolean(message) || actual !== row.exemptionCode,
    `${row.field} should show an error or reject the invalid value`
  ).toBe(true);
  await invoice.expectSectionNotSaved(rule.section, entry);
}

async function runOmnUiExemptionCompanionCase(
  page: Page,
  entry: OmnUiEntry,
  row: OmnUiCatalogRow
): Promise<void> {
  const categoryRule = OMN_UI_FIELD_RULES.find((rule) => rule.field === "Tax Category");
  const codeRule = OMN_UI_FIELD_RULES.find(
    (rule) => rule.field === "Tax exemption reason code"
  );
  const textRule = OMN_UI_FIELD_RULES.find(
    (rule) => rule.field === "Tax exemption reason text"
  );
  if (!categoryRule || !codeRule || !textRule) {
    throw new Error("Missing item exemption companion UI rules");
  }
  const invoice = await openOmnUiInvoiceEditor(page, entry);
  await ensureSectionBaseline(invoice, "item", entry, new Set([
    categoryRule.inputId,
    codeRule.inputId,
    textRule.inputId,
  ]));
  await invoice.selectAutocomplete(
    "item",
    categoryRule.inputId,
    EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
    categoryRule.altInputIds
  );
  await writeAutocomplete(
    invoice,
    entry,
    "item",
    codeRule.inputId,
    row.exemptionCode,
    codeRule.altInputIds
  );
  await writeText(
    invoice,
    entry,
    "item",
    textRule.inputId,
    row.exemptionText,
    textRule.altInputIds
  );
  await commitSection(invoice, "item", entry);
  const assertedRule = row.expectsError ? codeRule : textRule;
  const message = await invoice.readFieldError(
    "item",
    assertedRule.inputId,
    assertedRule.altInputIds
  );
  if (row.expectsError) {
    expect(message, `expected a field error for ${row.field}`).toBeTruthy();
    await invoice.expectSectionNotSaved("item", entry);
    return;
  }
  expect(message, `did not expect a field error for ${row.field}`).toBeFalsy();
  await invoice.expectSectionSavedReadOnly("item");
}

async function runOmnUiTxnExclusionCase(
  page: Page,
  entry: OmnUiEntry,
  row: OmnUiCatalogRow,
  fillFormula: boolean
): Promise<void> {
  const txnCell = row.invoiceTransactionTypeCode;
  if (!txnCell) {
    throw new Error(`txnExclusion row is missing invoiceTransactionTypeCode: ${row.title}`);
  }
  const invoice = await openOmnUiInvoiceEditor(page, entry);
  await invoice.openSectionForEdit("document", entry);
  await ensureDocumentBaseline(invoice, entry, new Set(["invType", "invTxnType"]));
  const labels = splitOmanTxnMasterLabels(txnCell);
  if (row.expectsError) {
    const [applicable, ...forbidden] = labels;
    if (!applicable || forbidden.length === 0) {
      throw new Error(
        `txnExclusion Not Allowed row needs a pair of transaction types: ${row.title}`
      );
    }
    await selectDocumentTransactionTypes(
      invoice,
      applicable,
      invoiceTypeForTxnLabels([applicable])
    );
    await invoice.expectTransactionTypesDisabled(forbidden);
    return;
  }
  await selectDocumentTransactionTypes(invoice, txnCell, row.invoiceTypeCode);
  for (const txn of labels) {
    await applyTxnDocumentCompanions(invoice, entry, {
      title: row.title,
      section: "document",
      kind: "catalogControl",
      shouldError: false,
      assertInputId: "invTxnType",
      invoiceTypeCode: row.invoiceTypeCode,
      invoiceTransactionTypeCode: txn,
    });
  }
  await invoice.clickSectionCommit("document", entry);
  await invoice.expectSectionSavedReadOnly("document");
  if (!fillFormula) return;
  const formula = row.formulaScenario ?? invoiceFormulaTestData[0];
  if (!formula) return;
  await fillOmnUiFormulaItem(
    invoice,
    entry,
    formula as InvoiceFormulaScenario,
    isOmnUiPrefilledLineItemEntry(entry)
  );
}

export async function runOmnUiFieldCatalogRow(
  page: Page,
  entry: OmnUiEntry,
  row: OmnUiCatalogRow
): Promise<void> {
  if (row.mode === "skip") {
    throw new Error(`runOmnUiFieldCatalogRow called for skip row: ${row.group}`);
  }
  if (row.kind === "issueDate") {
    await runOmnUiIssueDateCase(page, entry, row.excelTitle ?? "");
    return;
  }
  if (row.kind === "numeric") {
    if (!row.field || row.numericValue === undefined) {
      throw new Error(`Numeric catalog row is missing field/value metadata: ${row.title}`);
    }
    await runOmnUiNumericCase(
      page,
      entry,
      row.field,
      row.numericValue,
      Boolean(row.expectsError)
    );
    return;
  }
  if (row.kind === "partyIdentifierCompanion") {
    if (!row.partyIdentifierScenario) {
      throw new Error(
        `Party identifier catalog row is missing scenario metadata: ${row.title}`
      );
    }
    await runOmnUiPartyIdentifierCompanionCase(
      page,
      entry,
      row.partyIdentifierScenario
    );
    return;
  }
  if (row.kind === "cl06") {
    await runOmnUiCl06Case(page, entry, row);
    return;
  }
  if (row.kind === "dropdownInvalid") {
    await runOmnUiInvalidExemptionCase(page, entry, row);
    return;
  }
  if (row.kind === "exemptionCompanion") {
    await runOmnUiExemptionCompanionCase(page, entry, row);
    return;
  }
  if (row.kind === "txnExclusion") {
    await runOmnUiTxnExclusionCase(page, entry, row, false);
    return;
  }
  throw new Error(`No UI runner for field catalog kind ${row.kind} (${row.group})`);
}

async function fillOmnUiFormulaItem(
  invoice: OMN_UIInvoiceManualPage,
  entry: OmnUiEntry,
  scenario: InvoiceFormulaScenario,
  prefilled: boolean
): Promise<void> {
  await invoice.openItemEditor(prefilled);
  await fillIfEmpty(invoice, "item", "itemName", "Formula item");
  if (!(await invoice.readInputValue("item", "industrialClassification"))) {
    await invoice.selectAutocomplete(
      "item",
      "industrialClassification",
      OMN_UI_INDUSTRIAL_CLASSIFICATION
    );
  }
  if (!(await invoice.readInputValue("item", "itemType"))) {
    await invoice.selectAutocomplete("item", "itemType", OMN_UI_ITEM_TYPE_GOODS);
  }
  if (!(await invoice.readInputValue("item", "unitOfMeasure"))) {
    await invoice.selectAutocomplete("item", "unitOfMeasure", OMN_UI_UNIT_OF_MEASURE);
  }
  if (!(await invoice.readInputValue("item", "taxRateDtls[0].taxCategory"))) {
    await invoice.selectAutocomplete(
      "item",
      "taxRateDtls[0].taxCategory",
      OMN_UI_TAX_CATEGORY_STANDARD
    );
  }
  for (const key of OMN_UI_ITEM_FORMULA_KEYS) {
    await fillFormulaCandidate(invoice, "item", key, scenario[key]);
  }
  await invoice.clickItemCommit(entry);
  await expect(invoice.itemModal()).toBeHidden({ timeout: 15_000 }).catch(() => {});
}

async function expectAnyFormulaError(
  invoice: OMN_UIInvoiceManualPage,
  scenario: InvoiceFormulaScenario
): Promise<void> {
  const messages: string[] = [];
  for (const key of [...OMN_UI_ITEM_FORMULA_KEYS, ...OMN_UI_INVOICE_FORMULA_KEYS]) {
    const ids = OMN_UI_FORMULA_INPUT_CANDIDATES[key];
    if (!ids?.length || scenario[key] === undefined) continue;
    const section: OmnUiSection = OMN_UI_ITEM_FORMULA_KEYS.includes(
      key as (typeof OMN_UI_ITEM_FORMULA_KEYS)[number]
    )
      ? "item"
      : "invoice";
    messages.push(await invoice.readFieldError(section, ids[0], ids.slice(1)));
  }
  expect(
    messages.some(Boolean),
    `expected a formula field error for ${scenario.name}`
  ).toBe(true);
}

async function runOmnUiFormulaCatalogScenario(
  page: Page,
  entry: OmnUiEntry,
  row: OmnUiCatalogRow
): Promise<void> {
  const scenario = row.formulaScenario;
  if (!scenario) {
    throw new Error(`Formula catalog row is missing scenario metadata: ${row.title}`);
  }
  const invoice = await openOmnUiInvoiceEditor(page, entry);
  await invoice.openSectionForEdit("document", entry);
  // Changing invoice type clears transaction type. Do not skip invTxnType or
  // Create leaves the control empty and Document Save never completes.
  // Profit-margin rows overwrite Full Tax below.
  await ensureDocumentBaseline(invoice, entry, new Set(["invCurrCode"]));

  if (row.kind === "formulaProfitMargin") {
    await selectDocumentTransactionTypes(
      invoice,
      scenario.invoiceTransactionTypeCode || TXN_PROFIT_MARGIN_INVOICE
    );
  } else if (row.kind === "formulaNonOmr") {
    await invoice.selectFirstNonOmrCurrency();
    await invoice.expectInputDisabled("document", "currExchangeRate", false);
    const fx =
      scenario.currencyRate === undefined || scenario.currencyRate === null
        ? "3.67"
        : String(scenario.currencyRate);
    await writeText(invoice, entry, "document", "currExchangeRate", fx);
    await writeAutocomplete(
      invoice,
      entry,
      "document",
      "taxAccountingCurrency",
      OMAN_CURRENCY_USD,
      ["taxAccCurr", "taxAccountingCurrCode"]
    );
  }
  await invoice.clickSectionCommit("document", entry);
  await invoice.expectSectionSavedReadOnly("document");

  await fillOmnUiFormulaItem(
    invoice,
    entry,
    (row.formulaFirstScenario ?? scenario) as InvoiceFormulaScenario,
    isOmnUiPrefilledLineItemEntry(entry)
  );
  if (row.expectsError && (await invoice.itemModal().isVisible().catch(() => false))) {
    await expectAnyFormulaError(invoice, scenario as InvoiceFormulaScenario);
    await invoice.expectSectionNotSaved("item", entry);
    return;
  }
  if (row.kind === "formulaTwoLine") {
    await fillOmnUiFormulaItem(invoice, entry, scenario as InvoiceFormulaScenario, false);
    if (row.expectsError && (await invoice.itemModal().isVisible().catch(() => false))) {
      await expectAnyFormulaError(invoice, scenario as InvoiceFormulaScenario);
      await invoice.expectSectionNotSaved("item", entry);
      return;
    }
  }
  await invoice.openSectionForEdit("invoice", entry);
  for (const key of OMN_UI_INVOICE_FORMULA_KEYS) {
    await fillFormulaCandidate(invoice, "invoice", key, scenario[key]);
  }
  await commitSection(invoice, "invoice", entry);

  if (row.expectsError) {
    await expectAnyFormulaError(invoice, scenario as InvoiceFormulaScenario);
    await invoice.expectSectionNotSaved("invoice", entry);
    return;
  }
  const target =
    row.kind === "formulaProfitMargin"
      ? OMN_UI_PROFIT_MARGIN_TOTAL_DUE
      : row.kind === "formulaNonOmr"
        ? OMN_UI_TAX_IN_ACCOUNTING_CURRENCY_AMOUNT
        : undefined;
  if (target) {
    const [inputId, ...altInputIds] = target.inputIds;
    const value = await invoice.readInputValue(target.section, inputId, altInputIds);
    expect(value, `${target.excelField} should be visible and calculated`).not.toBe("");
  }
  await invoice.expectSectionSavedReadOnly("invoice");
}

export async function runOmnUiFormulaCatalogRow(
  page: Page,
  entry: OmnUiEntry,
  row: OmnUiCatalogRow
): Promise<void> {
  if (row.mode === "skip") {
    throw new Error(`runOmnUiFormulaCatalogRow called for skip row: ${row.group}`);
  }
  if (
    row.kind === "formulaNegative" ||
    row.kind === "formulaProfitMargin" ||
    row.kind === "formulaNonOmr" ||
    row.kind === "formulaTwoLine"
  ) {
    await runOmnUiFormulaCatalogScenario(page, entry, row);
    return;
  }
  if (row.kind === "txnExclusion") {
    await runOmnUiTxnExclusionCase(page, entry, row, true);
    return;
  }
  throw new Error(`No UI runner for formula catalog kind ${row.kind} (${row.group})`);
}

export async function runOmnUiExcelPartyIdentityCase(
  page: Page,
  entry: OmnUiEntry,
  identityCase: OmnUiExcelPartyIdentityCase
): Promise<void> {
  const invoice = await openOmnUiInvoiceEditor(page, entry);
  const selfBilled = identityCase.invoiceType === "selfBilled";
  const knownTypes = {
    invoiceTypeCode: selfBilled
      ? OMN_UI_INVOICE_TYPE_SELF_BILLED
      : OMN_UI_INVOICE_TYPE_COMMERCIAL,
    invoiceTransactionTypeCode: selfBilled ? OMN_UI_TXN_SELF_BILLED : OMN_UI_TXN_FULL_TAX,
  };
  await invoice.openSectionForEdit("document", entry);
  if (selfBilled) {
    await selectDocumentTransactionTypes(invoice, OMN_UI_TXN_SELF_BILLED);
  }
  await ensureDocumentBaseline(
    invoice,
    entry,
    selfBilled ? new Set(["invType", "invTxnType"]) : new Set()
  );
  await invoice.clickSectionCommit("document", entry);
  await invoice.expectSectionSavedReadOnly("document");

  await invoice.openSectionForEdit(identityCase.section, entry);
  await ensurePartyBaseline(invoice, identityCase.section, new Set(), knownTypes);

  const vatAlts = identityCase.section === "seller" ? ["sellerVatIdentifier"] : [];
  const electronicAlts =
    identityCase.section === "seller"
      ? ["sellerElectronicAddress"]
      : ["buyerElectronicAddress"];
  const expected = excelPartyIdentity(
    knownTypes.invoiceTypeCode,
    knownTypes.invoiceTransactionTypeCode
  );
  const expectedVat =
    identityCase.section === "seller" ? expected.sellerVat : expected.buyerVat;
  const expectedElectronic =
    identityCase.section === "seller" ? expected.sellerElectronic : expected.buyerElectronic;
  const scheme = await invoice.readInputValue(
    identityCase.section,
    "peppolSchemeIdentifier"
  );
  const actualVat = await invoice.readInputValue(
    identityCase.section,
    "vatIdentifier",
    vatAlts
  );
  const actualElectronic = await invoice.readInputValue(
    identityCase.section,
    "electronicAddress",
    electronicAlts
  );
  if (scheme) {
    expect(scheme, "electronic address scheme should be Oman VATIN").toMatch(
      OMAN_PEPPOL_VATIN_SCHEME
    );
  }
  expect(actualVat, "VAT Identifier should be entered before Save").toBe(expectedVat);
  expect(actualElectronic, "electronic address should be entered before Save").toBe(
    expectedElectronic
  );

  await commitSection(invoice, identityCase.section, entry);
  const vatMessage = await invoice.readFieldError(
    identityCase.section,
    "vatIdentifier",
    vatAlts
  );
  const electronicMessage = await invoice.readFieldError(
    identityCase.section,
    "electronicAddress",
    electronicAlts
  );
  expect(vatMessage, "did not expect a field error on VAT Identifier").toBeFalsy();
  expect(electronicMessage, "did not expect a field error on electronic address").toBeFalsy();
  await invoice.expectSectionSavedReadOnly(identityCase.section);
}

function isOmrCurrency(code?: string): boolean {
  return !code || /OMR|Rial Omani/i.test(code);
}

const ADDRESS_INPUT_IDS = [
  "address1",
  "address2",
  "address3",
  "city",
  "postCode",
  "postalCode",
  "address",
  "countrySubdivision",
  "deliverToCountrySubdivision",
  "country",
  "countryCode",
] as const;

/** Extra sections a rule writes besides Document (transaction) and Item. */
function extraSectionsForKind(kind: OmnUiConditionalScenario["kind"]): OmnUiSection[] {
  switch (kind) {
    case "sellerVat":
    case "sellerAddress":
      return ["seller"];
    case "thirdPartyRequired":
      return ["thirdParty"];
    case "buyerIdOrVatin":
    case "buyerIdentifierScheme":
    case "buyerAddress":
      return kind === "buyerIdentifierScheme" ? ["buyer", "seller"] : ["buyer"];
    case "deliverToAddress":
      return ["shipping"];
    case "prepaymentPaidAmount":
      return ["invoice", "payment"];
    default:
      return [];
  }
}

/**
 * Sections this conditional must fill, in OMN_UI_SECTION_ORDER. Document is
 * always first. Item and extra party/totals sections are included when needed,
 * but runOmnUiConditionalScenario commits the section under test and then
 * stops so later sections (e.g. Add Item) cannot take Document out of edit.
 */
function sectionsForConditional(scenario: OmnUiConditionalScenario): OmnUiSection[] {
  const needed = new Set<OmnUiSection>(["document", "item"]);
  for (const section of extraSectionsForKind(scenario.kind)) {
    needed.add(section);
  }
  for (const write of scenario.catalogWrites ?? []) {
    needed.add(write.section);
  }
  needed.add(scenario.section);
  if (scenario.completeThrough) needed.add(scenario.completeThrough);
  return OMN_UI_SECTION_ORDER.filter((section) => needed.has(section));
}

function excludeIdsForConditional(
  scenario: OmnUiConditionalScenario,
  section: OmnUiSection
): Set<string> {
  const ids = new Set<string>();
  for (const write of scenario.catalogWrites ?? []) {
    if (write.section !== section) continue;
    ids.add(write.inputId);
    for (const alt of write.altInputIds ?? []) ids.add(alt);
  }
  if (section === "document") {
    if (scenario.invoiceTypeCode !== undefined) ids.add("invType");
    if (scenario.invoiceTransactionTypeCode !== undefined) ids.add("invTxnType");
    if (scenario.kind === "prepaymentPaidAmount") {
      ids.add("invType");
      ids.add("invTxnType");
    }
    if (scenario.invoiceCurrencyCode !== undefined) ids.add("invCurrCode");
    if (scenario.exchangeRate !== undefined) ids.add("currExchangeRate");
    if (scenario.creditNoteReasonCode !== undefined) ids.add("creditNoteRsn");
    if (scenario.precedingInvoiceReference !== undefined) {
      ids.add(OMN_UI_PRECEDING_REF_ID);
    }
    if (scenario.precedingInvoiceIssueDate !== undefined) {
      ids.add(OMN_UI_PRECEDING_DATE_ID);
    }
    if (scenario.precedingInvoiceUuid !== undefined) {
      ids.add(OMN_UI_PRECEDING_UUID_ID);
    }
    if (scenario.periodStart !== undefined) ids.add("invStartDate");
    if (scenario.periodEnd !== undefined) ids.add("invEndDate");
    if (scenario.importDate !== undefined) ids.add("importDate");
    if (scenario.customsDeclarationNumber !== undefined) ids.add("customsDeclarationNumber");
    if (scenario.incoterms !== undefined) ids.add("incoterms");
    if (scenario.expectDisabled) ids.add(scenario.assertInputId);
  }
  if (section === "item") {
    if (scenario.itemCountryOfOrigin !== undefined) {
      ids.add("originCountry");
      ids.add("itemCountryOfOrigin");
      ids.add("countryOfOrigin");
    }
    if (scenario.industrialClassificationCode !== undefined) {
      ids.add("industrialClassification");
    }
    if (scenario.taxCategory !== undefined) {
      ids.add("taxRateDtls[0].taxCategory");
    }
    if (scenario.taxRate !== undefined) {
      ids.add("taxRateDtls[0].taxRate");
    }
    if (scenario.taxExemptionReasonCode !== undefined) {
      ids.add("taxExemptionRsnType");
      ids.add("taxRateDtls[0].exemptionReasonCode");
      ids.add("exemptionReasonType");
      ids.add("taxExemptionReasonCode");
    }
    if (scenario.taxExemptionReasonText !== undefined) {
      ids.add("taxExemptionRsn");
      ids.add("taxRateDtls[0].exemptionReason");
      ids.add("taxExemptionReason");
    }
    if (scenario.itemAttributeName !== undefined) {
      ids.add("itemAttributeName");
      ids.add("attributeName");
    }
    if (scenario.itemAttributeValue !== undefined) {
      ids.add("itemAttributeValue");
      ids.add("attributeValue");
    }
  }
  if (section === "seller") {
    if (scenario.sellerVatIdentifier !== undefined) {
      ids.add("vatIdentifier");
      ids.add("sellerVatIdentifier");
    }
    if (scenario.sellerIdentifier !== undefined) {
      ids.add("sellerIdentifier");
      ids.add("identifier");
    }
    if (scenario.sellerIdentifierTextualCode !== undefined) {
      ids.add("identifierCode");
      ids.add("textualCode");
      ids.add("sellerIdentifierCode");
    }
    if (scenario.sellerCountrySubdivision !== undefined) {
      ids.add("countrySubdivision");
      ids.add("sellerCountrySubdivision");
    }
  }
  if (section === "thirdParty") {
    if (scenario.thirdPartyName !== undefined) ids.add("name");
    if (scenario.thirdPartyVatin !== undefined) ids.add("vatIdentifier");
  }
  if (section === "buyer") {
    if (scenario.buyerIdentifier !== undefined) {
      ids.add("buyerIdentifier");
      ids.add("identifier");
    }
    if (scenario.buyerVatIdentifier !== undefined) ids.add("vatIdentifier");
    if (scenario.buyerIdentifierScheme !== undefined) {
      ids.add("schemeIdentifier");
      ids.add("buyerSchemeIdentifier");
    }
    if (scenario.buyerIdentifierTextualCode !== undefined) {
      ids.add("identifierCode");
      ids.add("textualCode");
      ids.add("buyerIdentifierCode");
    }
    if (scenario.buyerCountrySubdivision !== undefined) {
      ids.add("countrySubdivision");
      ids.add("buyerCountrySubdivision");
    }
  }
  if (section === "invoice" && scenario.paidAmount !== undefined) {
    ids.add("paidAmt");
    ids.add("paidAmount");
  }
  if (section === "payment") {
    if (scenario.prepaymentInvoiceNumber !== undefined) {
      ids.add("prepaymentInvoiceNum");
      ids.add("prepaymentInvNum");
      ids.add("prepaymentInvoiceNumber");
    }
    if (scenario.prepaymentInvoiceUuid !== undefined) {
      ids.add("prepaymentInvoiceUuid");
      ids.add("prepaymentUuid");
      ids.add("prepaymentInvoiceUUID");
    }
  }
  const usesAddress =
    scenario.kind === "sellerAddress" ||
    scenario.kind === "buyerAddress" ||
    scenario.kind === "deliverToAddress" ||
    scenario.kind === "thirdPartyRequired" ||
    scenario.addressLine1 !== undefined ||
    scenario.addressLine2 !== undefined ||
    scenario.addressLine3 !== undefined ||
    scenario.city !== undefined ||
    scenario.postCode !== undefined ||
    scenario.countrySubdivision !== undefined ||
    scenario.countryCode !== undefined;
  if (
    usesAddress &&
    (section === "seller" ||
      section === "buyer" ||
      section === "shipping" ||
      section === "thirdParty")
  ) {
    for (const id of ADDRESS_INPUT_IDS) ids.add(id);
  }
  return ids;
}

async function ensureThisSectionBaseline(
  invoice: OMN_UIInvoiceManualPage,
  section: OmnUiSection,
  entry: OmnUiEntry,
  excludeInputIds: Set<string>,
  knownTypes?: { invoiceTypeCode?: string; invoiceTransactionTypeCode?: string }
): Promise<void> {
  if (section === "document") {
    await ensureDocumentBaseline(invoice, entry, excludeInputIds);
    return;
  }
  if (section === "seller" || section === "buyer") {
    await ensurePartyBaseline(invoice, section, excludeInputIds, knownTypes);
    return;
  }
  if (section === "thirdParty") {
    await ensureThirdPartyBaseline(invoice, excludeInputIds);
    return;
  }
  if (section === "shipping") {
    await ensureShippingBaseline(invoice, excludeInputIds);
    return;
  }
  if (section === "item") {
    await ensureItemBaseline(invoice, entry, excludeInputIds);
    return;
  }
  if (section === "payment") {
    await ensurePaymentBaseline(invoice, excludeInputIds);
  }
  if (section === "custom") {
    await ensureCustomBaseline(invoice, excludeInputIds);
  }
}

/** Leave empty fields alone. Clear when the form already has a value (Create prefills included). */
async function leaveOrClearEmpty(
  invoice: OMN_UIInvoiceManualPage,
  _entry: OmnUiEntry,
  section: OmnUiSection,
  inputId: string,
  altInputIds: readonly string[],
  kind: "text" | "autocomplete" | "date"
): Promise<void> {
  const current = await invoice.readInputValue(section, inputId, altInputIds);
  if (!current) return;
  if (kind === "autocomplete") {
    await invoice.clearAutocomplete(section, inputId, altInputIds);
    return;
  }
  if (kind === "date") {
    await invoice.clearDate(section, inputId, altInputIds);
    return;
  }
  await invoice.clearInput(section, inputId, altInputIds);
}

async function writeText(
  invoice: OMN_UIInvoiceManualPage,
  entry: OmnUiEntry,
  section: OmnUiSection,
  inputId: string,
  value: string | undefined,
  altInputIds: readonly string[] = []
): Promise<void> {
  if (value === undefined) return;
  if (await invoice.isInputDisabled(section, inputId, altInputIds)) return;
  const literal = excelFormulaToUiValue(value) ?? "";
  if (isUiEmptyValue(literal)) {
    await leaveOrClearEmpty(invoice, entry, section, inputId, altInputIds, "text");
    return;
  }
  await invoice.replaceInput(section, inputId, literal, altInputIds);
}

async function writeAutocomplete(
  invoice: OMN_UIInvoiceManualPage,
  entry: OmnUiEntry,
  section: OmnUiSection,
  inputId: string,
  value: string | undefined | null,
  altInputIds: readonly string[] = []
): Promise<void> {
  if (value === undefined) return;
  if (await invoice.isInputDisabled(section, inputId, altInputIds)) return;
  const literal = excelFormulaToUiValue(value) ?? "";
  if (isUiEmptyValue(literal)) {
    await leaveOrClearEmpty(invoice, entry, section, inputId, altInputIds, "autocomplete");
    return;
  }
  if (isUiWhitespaceValue(literal)) {
    await invoice.typeWhitespace(section, inputId, literal, altInputIds);
    return;
  }
  if (inputId === "invTxnType" || altInputIds.includes("invTxnType")) {
    await selectDocumentTransactionTypes(invoice, literal);
    return;
  }
  await invoice.selectAutocomplete(section, inputId, literal, altInputIds);
}

async function writeDate(
  invoice: OMN_UIInvoiceManualPage,
  entry: OmnUiEntry,
  section: OmnUiSection,
  inputId: string,
  value: string | undefined
): Promise<void> {
  if (value === undefined) return;
  if (await invoice.isInputDisabled(section, inputId)) return;
  const literal = excelFormulaToUiValue(value) ?? "";
  if (isUiEmptyValue(literal) || isUiWhitespaceValue(literal)) {
    await leaveOrClearEmpty(invoice, entry, section, inputId, [], "date");
    return;
  }
  await invoice.fillDate(section, inputId, literal);
}

async function fillAddressBlock(
  invoice: OMN_UIInvoiceManualPage,
  entry: OmnUiEntry,
  section: OmnUiSection,
  scenario: OmnUiConditionalScenario
): Promise<void> {
  await writeText(invoice, entry, section, "address1", scenario.addressLine1, ["address"]);
  await writeText(invoice, entry, section, "address2", scenario.addressLine2);
  await writeText(invoice, entry, section, "address3", scenario.addressLine3);
  await writeText(invoice, entry, section, "city", scenario.city);
  await writeText(invoice, entry, section, "postCode", scenario.postCode, ["postalCode"]);
  await writeText(invoice, entry, section, "countrySubdivision", scenario.countrySubdivision, [
    "deliverToCountrySubdivision",
  ]);
  await writeAutocomplete(invoice, entry, section, "country", scenario.countryCode, ["countryCode"]);
}

async function expectPrecedingInvoiceEnablement(
  invoice: OMN_UIInvoiceManualPage,
  scenario: OmnUiConditionalScenario
): Promise<void> {
  const gate = omnUiPrecedingInvoiceEnablement(scenario);
  if (gate === "all") {
    await invoice.expectInputDisabled("document", OMN_UI_PRECEDING_REF_ID, false);
    await invoice.expectInputDisabled("document", OMN_UI_PRECEDING_DATE_ID, false);
    await invoice.expectInputDisabled("document", OMN_UI_PRECEDING_UUID_ID, false);
    return;
  }
  if (gate === "refAndUuid") {
    await invoice.expectInputDisabled("document", OMN_UI_PRECEDING_REF_ID, false);
    await invoice.expectInputDisabled("document", OMN_UI_PRECEDING_UUID_ID, false);
    return;
  }
  if (scenario.kind === "precedingInvoice") {
    await invoice.expectInputDisabled("document", OMN_UI_PRECEDING_REF_ID, true);
    await invoice.expectInputDisabled("document", OMN_UI_PRECEDING_DATE_ID, true);
    await invoice.expectInputDisabled("document", OMN_UI_PRECEDING_UUID_ID, true);
  }
}

/** Excel applyTxnExclusionCompanions — fill only fields the scenario did not set (including explicit empty). */
async function applyTxnDocumentCompanions(
  invoice: OMN_UIInvoiceManualPage,
  entry: OmnUiEntry,
  scenario: OmnUiConditionalScenario
): Promise<void> {
  const txn = scenario.invoiceTransactionTypeCode;
  if (!txn) return;

  if (
    (txn === TXN_SUMMARY_INVOICE || txn === TXN_CONTINUOUS_SUPPLY) &&
    scenario.periodStart === undefined &&
    scenario.periodEnd === undefined
  ) {
    await writeDate(invoice, entry, "document", "invStartDate", "2026-01-01");
    await writeDate(invoice, entry, "document", "invEndDate", "2026-01-31");
  }

  if (txn === TXN_PROFIT_MARGIN_INVOICE && scenario.precedingInvoiceReference === undefined) {
    await writeText(invoice, entry, "document", OMN_UI_PRECEDING_REF_ID, "PREV-OMN-001");
    await writeDate(invoice, entry, "document", OMN_UI_PRECEDING_DATE_ID, "2026-06-01");
    await writeText(invoice, entry, "document", OMN_UI_PRECEDING_UUID_ID, PRECEDING_INVOICE_UUID_SAMPLE);
  }

  if (txn === TXN_IMPORT_OF_GOODS) {
    if (scenario.importDate === undefined) {
      await writeDate(invoice, entry, "document", "importDate", "2026-01-10");
    }
    if (scenario.customsDeclarationNumber === undefined) {
      await writeText(invoice, entry, "document", "customsDeclarationNumber", "CD-12345");
    }
    if (scenario.incoterms === undefined) {
      await writeAutocomplete(invoice, entry, "document", "incoterms", "Free On Board");
    }
  }
}

function txnCellIncludesProfitMargin(txn?: string): boolean {
  if (!txn) return false;
  return splitOmanTxnMasterLabels(txn).some(
    (label) =>
      label === TXN_PROFIT_MARGIN_INVOICE ||
      label === TXN_PROFIT_MARGIN_SELF_INVOICE
  );
}

/** Excel CL-11-OM companion: Profit Margin / Self-Invoice cannot save without item type. */
async function applyTxnItemCompanions(
  invoice: OMN_UIInvoiceManualPage,
  entry: OmnUiEntry,
  scenario: OmnUiConditionalScenario
): Promise<void> {
  if (!txnCellIncludesProfitMargin(scenario.invoiceTransactionTypeCode)) return;
  await writeAutocomplete(
    invoice,
    entry,
    "item",
    "profitMarginItemType",
    PROFIT_MARGIN_ITEM_TYPE_SAMPLE,
    ["profitMarginItemTypeCode"]
  );
}

async function applyConditionalSectionFields(
  invoice: OMN_UIInvoiceManualPage,
  entry: OmnUiEntry,
  scenario: OmnUiConditionalScenario,
  section: OmnUiSection
): Promise<void> {
  if (section === "document") {
    const txn =
      scenario.invoiceTransactionTypeCode ||
      (scenario.kind === "prepaymentPaidAmount" ? TXN_PREPAYMENT_INVOICE : undefined);
    const invoiceType =
      scenario.invoiceTypeCode ||
      (txn === TXN_SELF_BILLED_INVOICE ? OMN_UI_INVOICE_TYPE_SELF_BILLED : undefined) ||
      (scenario.kind === "prepaymentPaidAmount" ? OMN_UI_INVOICE_TYPE_COMMERCIAL : undefined);
    if (txn) {
      await invoice.expectInputDisabled("document", "invTxnType", false);
      await selectDocumentTransactionTypes(invoice, txn, invoiceType);
    } else if (invoiceType) {
      await invoice.selectAutocomplete("document", "invType", invoiceType);
      await invoice.expectInputDisabled("document", "invTxnType", false);
      const currentTxn = await invoice.readInputValue("document", "invTxnType");
      if (!currentTxn) {
        await selectDocumentTransactionTypes(
          invoice,
          OMN_UI_TXN_FULL_TAX,
          invoiceType
        );
      }
    }
    await expectPrecedingInvoiceEnablement(invoice, scenario);
    await applyTxnDocumentCompanions(invoice, entry, scenario);
    if (scenario.expectDisabled) {
      await invoice.expectInputDisabled(
        "document",
        scenario.assertInputId,
        true,
        scenario.altInputIds
      );
    } else if (scenario.kind === "exchangeRate") {
      if (!isOmrCurrency(scenario.invoiceCurrencyCode)) {
        await invoice.selectFirstNonOmrCurrency();
        await invoice.expectInputDisabled("document", "currExchangeRate", false);
      }
      await writeText(invoice, entry, "document", "currExchangeRate", scenario.exchangeRate);
    } else if (
      scenario.kind === "vatCategoryRate" &&
      !isOmrCurrency(scenario.invoiceCurrencyCode)
    ) {
      await invoice.selectFirstNonOmrCurrency();
      await invoice.expectInputDisabled("document", "currExchangeRate", false);
      await writeText(invoice, entry, "document", "currExchangeRate", scenario.exchangeRate);
    }
    await writeAutocomplete(invoice, entry, "document", "creditNoteRsn", scenario.creditNoteReasonCode);
    await writeText(
      invoice,
      entry,
      "document",
      OMN_UI_PRECEDING_REF_ID,
      scenario.precedingInvoiceReference
    );
    await writeDate(
      invoice,
      entry,
      "document",
      OMN_UI_PRECEDING_DATE_ID,
      scenario.precedingInvoiceIssueDate
    );
    await writeText(
      invoice,
      entry,
      "document",
      OMN_UI_PRECEDING_UUID_ID,
      scenario.precedingInvoiceUuid
    );
    await writeDate(invoice, entry, "document", "invStartDate", scenario.periodStart);
    await writeDate(invoice, entry, "document", "invEndDate", scenario.periodEnd);
    await writeDate(invoice, entry, "document", "importDate", scenario.importDate);
    await writeText(
      invoice,
      entry,
      "document",
      "customsDeclarationNumber",
      scenario.customsDeclarationNumber
    );
    await writeAutocomplete(invoice, entry, "document", "incoterms", scenario.incoterms);
    return;
  }
  if (section === "item") {
    await applyTxnItemCompanions(invoice, entry, scenario);
    await writeAutocomplete(
      invoice,
      entry,
      "item",
      "originCountry",
      scenario.itemCountryOfOrigin,
      ["itemCountryOfOrigin", "countryOfOrigin"]
    );
    await writeAutocomplete(
      invoice,
      entry,
      "item",
      "industrialClassification",
      scenario.industrialClassificationCode
    );
    const reasonCodeAlts = [
      "taxRateDtls[0].exemptionReasonCode",
      "exemptionReasonType",
      "taxExemptionReasonCode",
    ] as const;
    if (scenario.taxCategory) {
      await invoice.selectAutocomplete(
        "item",
        "taxRateDtls[0].taxCategory",
        scenario.taxCategory
      );
    }
    const taxCat = scenario.taxCategory;
    const needsExemption =
      taxCat === EXEMPT_FROM_TAX_TAX_CATEGORY_CODE ||
      taxCat === ZERO_RATED_TAX_CATEGORY_CODE;
    if (needsExemption) {
      await invoice.expectInputDisabled("item", "taxExemptionRsnType", false, reasonCodeAlts);
    }
    await writeAutocomplete(
      invoice,
      entry,
      "item",
      "taxExemptionRsnType",
      scenario.taxExemptionReasonCode,
      reasonCodeAlts
    );
    if (taxCat === STANDARD_TAX_CATEGORY_CODE && scenario.taxRate != null && scenario.taxRate !== "") {
      await invoice.expectInputDisabled("item", "taxRateDtls[0].taxRate", false);
    }
    await writeText(
      invoice,
      entry,
      "item",
      "taxRateDtls[0].taxRate",
      scenario.taxRate === null ? undefined : scenario.taxRate
    );
    const exemptionText =
      scenario.taxExemptionReasonText ??
      (scenario.taxExemptionReasonCode && !isUiEmptyValue(scenario.taxExemptionReasonCode)
        ? TAX_EXEMPTION_REASON_TEXT_SAMPLE
        : undefined);
    if (needsExemption && exemptionText !== undefined && !isUiEmptyValue(exemptionText)) {
      await invoice.expectInputDisabled(
        "item",
        "taxExemptionRsn",
        false,
        ["taxRateDtls[0].exemptionReason", "taxExemptionReason"]
      );
    }
    await writeText(
      invoice,
      entry,
      "item",
      "taxExemptionRsn",
      exemptionText,
      ["taxRateDtls[0].exemptionReason", "taxExemptionReason"]
    );
    await writeText(invoice, entry, "item", "itemAttributeName", scenario.itemAttributeName, [
      "attributeName",
    ]);
    await writeText(invoice, entry, "item", "itemAttributeValue", scenario.itemAttributeValue, [
      "attributeValue",
    ]);
    return;
  }
  if (section === "seller") {
    if (scenario.invoiceTransactionTypeCode === TXN_IMPORT_OF_SERVICES_RCM) {
      await writeAutocomplete(invoice, entry, "seller", "country", UAE_COUNTRY_CODE, ["countryCode"]);
    }
    await writeText(invoice, entry, "seller", "vatIdentifier", scenario.sellerVatIdentifier, [
      "sellerVatIdentifier",
    ]);
    if (scenario.kind === "sellerAddress") {
      await fillAddressBlock(invoice, entry, "seller", scenario);
    }
    if (scenario.kind === "buyerIdentifierScheme") {
      await writeText(invoice, entry, "seller", "sellerIdentifier", scenario.sellerIdentifier, [
        "identifier",
      ]);
      await writeAutocomplete(
        invoice,
        entry,
        "seller",
        "identifierCode",
        scenario.sellerIdentifierTextualCode,
        ["textualCode", "sellerIdentifierCode"]
      );
      await writeAutocomplete(
        invoice,
        entry,
        "seller",
        "countrySubdivision",
        scenario.sellerCountrySubdivision,
        ["sellerCountrySubdivision"]
      );
    }
    return;
  }
  if (section === "thirdParty") {
    await writeText(invoice, entry, "thirdParty", "name", scenario.thirdPartyName);
    await writeText(invoice, entry, "thirdParty", "vatIdentifier", scenario.thirdPartyVatin);
    await fillAddressBlock(invoice, entry, "thirdParty", scenario);
    return;
  }
  if (section === "buyer") {
    await writeText(invoice, entry, "buyer", "buyerIdentifier", scenario.buyerIdentifier, ["identifier"]);
    await writeText(
      invoice,
      entry,
      "buyer",
      "vatIdentifier",
      await resolveBuyerVatWrite(invoice, scenario, scenario.buyerVatIdentifier)
    );
    if (scenario.kind === "buyerIdentifierScheme") {
      await writeAutocomplete(
        invoice,
        entry,
        "buyer",
        "schemeIdentifier",
        scenario.buyerIdentifierScheme,
        ["buyerSchemeIdentifier"]
      );
      await writeAutocomplete(
        invoice,
        entry,
        "buyer",
        "identifierCode",
        scenario.buyerIdentifierTextualCode,
        ["textualCode", "buyerIdentifierCode"]
      );
      await writeAutocomplete(
        invoice,
        entry,
        "buyer",
        "countrySubdivision",
        scenario.buyerCountrySubdivision,
        ["buyerCountrySubdivision"]
      );
    }
    if (scenario.kind === "buyerAddress") {
      await fillAddressBlock(invoice, entry, "buyer", scenario);
    }
    return;
  }
  if (section === "shipping") {
    await fillAddressBlock(invoice, entry, "shipping", scenario);
    return;
  }
  if (section === "invoice") {
    await writeText(invoice, entry, "invoice", "paidAmt", scenario.paidAmount, ["paidAmount"]);
    return;
  }
  if (section === "payment") {
    await writeText(invoice, entry, "payment", "prepaymentInvoiceNum", scenario.prepaymentInvoiceNumber, [
      "prepaymentInvNum",
      "prepaymentInvoiceNumber",
    ]);
    await writeText(invoice, entry, "payment", "prepaymentInvoiceUuid", scenario.prepaymentInvoiceUuid, [
      "prepaymentUuid",
      "prepaymentInvoiceUUID",
    ]);
  }
}

/**
 * Self-billed invoice type (261/389) swaps parties: Buyer VATIN must be the
 * logged-in worker TIN. Catalog samples use the counterparty VATIN, which the
 * UI rejects as not associated with the selected VAT identifier.
 */
async function resolveBuyerVatWrite(
  invoice: OMN_UIInvoiceManualPage,
  scenario: OmnUiConditionalScenario,
  value: string | undefined
): Promise<string | undefined> {
  if (value === undefined || isUiEmptyValue(value)) return value;
  const invoiceType =
    resolvedUiInvoiceType(scenario) ||
    (await invoice.readInputValue("document", "invType"));
  if (!isSelfBilledOnForm(invoiceType)) return value;
  if (value !== getCounterpartyVatIdentifier()) return value;
  return excelPartyIdentity(invoiceType, scenario.invoiceTransactionTypeCode)
    .buyerVat;
}

async function applyCatalogControlWrites(
  invoice: OMN_UIInvoiceManualPage,
  entry: OmnUiEntry,
  scenario: OmnUiConditionalScenario,
  section: OmnUiSection
): Promise<void> {
  for (const write of scenario.catalogWrites ?? []) {
    if (write.section !== section) continue;
    const catalogValue =
      section === "buyer" && write.inputId === "vatIdentifier"
        ? await resolveBuyerVatWrite(invoice, scenario, write.value ?? undefined)
        : write.value;
    if (write.control === "autocompleteInput") {
      const literal = excelFormulaToUiValue(catalogValue) ?? "";
      if (isUiEmptyValue(literal)) {
        await leaveOrClearEmpty(
          invoice,
          entry,
          section,
          write.inputId,
          write.altInputIds ?? [],
          "autocomplete"
        );
      } else {
        await invoice.replaceInput(
          section,
          write.inputId,
          literal,
          write.altInputIds
        );
        await invoice.dismissOpenDropdown();
      }
    } else if (write.control === "autocomplete") {
      await writeAutocomplete(
        invoice,
        entry,
        section,
        write.inputId,
        catalogValue,
        write.altInputIds
      );
    } else if (write.control === "date") {
      await writeDate(
        invoice,
        entry,
        section,
        write.inputId,
        catalogValue ?? undefined
      );
    } else {
      await writeText(
        invoice,
        entry,
        section,
        write.inputId,
        catalogValue ?? undefined,
        write.altInputIds
      );
    }
  }
}

export async function runOmnUiConditionalScenario(
  page: Page,
  entry: OmnUiEntry,
  scenario: OmnUiConditionalScenario
): Promise<void> {
  if (scenario.skipReason) {
    throw new Error(
      `runOmnUiConditionalScenario called for skipped row: ${scenario.title}`
    );
  }
  const invoice = await openOmnUiInvoiceEditor(page, entry);

  if (scenario.kind === "copyInvoiceNumberEmpty") {
    const invNum = await invoice.readInputValue("document", "invNum");
    const invDate = await invoice.readInputValue("document", "invDate", [
      "issueDate",
      "invIssueDate",
    ]);
    expect(invNum, "copied invoice number should be empty").toBe("");
    expect(invDate, "copied invoice date should be empty").toBe("");
    return;
  }

  const sections = sectionsForConditional(scenario);
  for (const section of sections) {
    await invoice.openSectionForEdit(section, entry);
    await ensureThisSectionBaseline(
      invoice,
      section,
      entry,
      excludeIdsForConditional(scenario, section),
      {
        invoiceTypeCode: resolvedUiInvoiceType(scenario),
        invoiceTransactionTypeCode: scenario.invoiceTransactionTypeCode,
      }
    );
    await applyConditionalSectionFields(invoice, entry, scenario, section);
    await applyCatalogControlWrites(invoice, entry, scenario, section);
    await commitSection(invoice, section, entry);
    // Save the section under test before later sections. Add Item takes
    // Document out of edit mode, so a Save after the item modal times out
    // (footer Save is gone — only Edit remains).
    if (section === (scenario.completeThrough ?? scenario.section)) {
      break;
    }
  }

  const message = await invoice.readFieldError(
    scenario.section,
    scenario.assertInputId,
    scenario.altInputIds
  );
  if (scenario.shouldError) {
    expect(message, `expected a field error for ${scenario.title}`).toBeTruthy();
  } else {
    expect(message, `did not expect a field error for ${scenario.title}`).toBeFalsy();
  }
}

async function fillFormulaCandidate(
  invoice: OMN_UIInvoiceManualPage,
  section: OmnUiSection,
  key: string,
  raw: unknown
): Promise<void> {
  if (raw === undefined || raw === null) return;
  const ids = OMN_UI_FORMULA_INPUT_CANDIDATES[key];
  if (!ids?.length) return;
  const value = String(raw);
  if (isUiEmptyValue(value)) return;
  // Missing nested charge/allowance rows are skipped. replaceInput would wait
  // until the 3-minute formula timeout on a never-matching id.
  if (await invoice.isInputDisabled(section, ids[0], ids.slice(1))) return;
  await invoice.replaceInput(section, ids[0], value, ids.slice(1));
}

function parseAmount(raw: string): number | null {
  const n = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

export async function runOmnUiFormulaScenario(
  page: Page,
  entry: OmnUiEntry,
  scenario: InvoiceFormulaScenario
): Promise<void> {
  const invoice = await openOmnUiInvoiceEditor(page, entry);
  await invoice.openSectionForEdit("document", entry);
  if (await invoice.isSectionInEditMode("document", entry)) {
    await ensureDocumentBaseline(invoice, entry, new Set());
    await invoice.clickSectionCommit("document", entry);
    await invoice.expectSectionSavedReadOnly("document");
  }
  await ensureItemBaseline(invoice, entry, new Set());
  if (scenario.taxCategory) {
    await invoice.selectAutocomplete(
      "item",
      "taxRateDtls[0].taxCategory",
      String(scenario.taxCategory)
    );
  }

  for (const key of OMN_UI_ITEM_FORMULA_KEYS) {
    await fillFormulaCandidate(invoice, "item", key, scenario[key]);
  }

  const expected = omnUiExpectedTotals(scenario);
  const itemNet = parseAmount(await invoice.readInputValue("item", "itemNetPrice"));
  const lineNet = parseAmount(await invoice.readInputValue("item", "invLineNetAmt"));
  const vatLine = parseAmount(await invoice.readInputValue("item", "vatLineAmt"));
  const lineAmt = parseAmount(await invoice.readInputValue("item", "invLineAmt"));
  if (itemNet != null) expect(itemNet).toBeCloseTo(expected.itemNetPrice, 1);
  if (lineNet != null) expect(lineNet).toBeCloseTo(expected.invoiceLineNetAmount, 1);
  if (vatLine != null) expect(vatLine).toBeCloseTo(expected.vatLineAmount, 1);
  if (lineAmt != null) expect(lineAmt).toBeCloseTo(expected.invoiceLineAmount, 1);

  const whitespaceItemKeys = OMN_UI_ITEM_FORMULA_KEYS.filter((key) =>
    isUiWhitespaceValue(String(scenario[key] ?? ""))
  );
  await invoice.clickItemCommit(entry);
  if (whitespaceItemKeys.length > 0) {
    for (const key of whitespaceItemKeys) {
      const ids = OMN_UI_FORMULA_INPUT_CANDIDATES[key];
      const message = await invoice.readFieldError("item", ids[0], ids.slice(1));
      expect(message, `expected a field error for whitespace ${key}`).toBeTruthy();
    }
    await expect(invoice.itemModal()).toBeVisible();
    return;
  }
  await expect(invoice.itemModal()).toBeHidden({ timeout: 15_000 });

  await invoice.openSectionForEdit("invoice", entry);
  for (const key of OMN_UI_INVOICE_FORMULA_KEYS) {
    await fillFormulaCandidate(invoice, "invoice", key, scenario[key]);
  }

  const totalWithTax = parseAmount(
    await invoice.readInputValue("invoice", "totalAmtWithVatOm", ["totalAmtWithTax"])
  );
  const amountDue = parseAmount(
    await invoice.readInputValue("invoice", "paymentDueAmt", ["amountDue"])
  );
  if (totalWithTax != null) expect(totalWithTax).toBeCloseTo(expected.invoiceTotalWithTax, 1);
  if (amountDue != null) expect(amountDue).toBeCloseTo(expected.amountDue, 1);
}
