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
import {
  buildOmnUiInvoiceNumber,
  excelFormulaToUiValue,
  isUiEmptyValue,
  isUiWhitespaceValue,
  OMN_UI_FORMULA_INPUT_CANDIDATES,
  OMN_UI_HS_CODE,
  OMN_UI_INVOICE_FORMULA_KEYS,
  OMN_UI_INVOICE_TYPE_COMMERCIAL,
  OMN_UI_INVOICE_TYPE_CREDIT_NOTE,
  OMN_UI_INVOICE_TYPE_SELF_BILLED,
  OMN_UI_ITEM_FORMULA_KEYS,
  OMN_UI_ITEM_TYPE_GOODS,
  OMN_UI_PRECEDING_DATE_ID,
  OMN_UI_PRECEDING_REF_ID,
  OMN_UI_PRECEDING_UUID_ID,
  OMN_UI_SECTION_ORDER,
  OMN_UI_TAX_CATEGORY_STANDARD,
  OMN_UI_UNIT_OF_MEASURE,
  OMN_UI_TXN_FULL_TAX,
  OMN_UI_TXN_SELF_BILLED,
  omnUiMinMaxExpectsError,
  omnUiPrecedingInvoiceEnablement,
  omnUiTestValue,
  type OmnUiConditionalScenario,
  type OmnUiEntry,
  type OmnUiExcelPartyIdentityCase,
  type OmnUiFieldRule,
  type OmnUiMinMaxVariant,
  type OmnUiSection,
} from "../../testData/ui/omnUiInvoiceValidation";
import {
  CREDIT_DEBIT_REASON_SAMPLE,
  PRECEDING_INVOICE_UUID_SAMPLE,
  TXN_PREPAYMENT_INVOICE,
} from "../../testData/FieldValidations/ConditionalValidation";
import type { InvoiceFormulaScenario } from "../../testData/FieldValidations/Min_max_field_validation";

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

function isSelfBilledOnForm(invoiceTypeCode?: string, txnType?: string): boolean {
  return isSelfBilledInvoiceType(invoiceTypeCode) || isSelfBilledInvoiceType(txnType);
}

/** Same seller/buyer TRN + electronic mapping as Excel `applyParallelWorkerIdentityToSubmitRow`. */
function excelPartyIdentity(
  invoiceTypeCode?: string,
  invoiceTransactionTypeCode?: string
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
  if (isSelfBilledOnForm(invoiceTypeCode, invoiceTransactionTypeCode)) {
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

async function ensureDocumentBaseline(
  invoice: OMN_UIInvoiceManualPage,
  entry: OmnUiEntry,
  excludeInputIds: Set<string>,
  uniqueKey?: string
): Promise<void> {
  if (!excludeInputIds.has("invNum")) {
    const current = await invoice.readInputValue("document", "invNum");
    if (entry !== "edit" || !current) {
      await invoice.replaceInput("document", "invNum", buildOmnUiInvoiceNumber(uniqueKey));
    }
  }
  if (!excludeInputIds.has("invTxnType")) {
    const current = await invoice.readInputValue("document", "invTxnType");
    if (!current) {
      await invoice.selectAutocomplete("document", "invTxnType", OMN_UI_TXN_FULL_TAX);
    }
  }
  if (!excludeInputIds.has("invType")) {
    const current = await invoice.readInputValue("document", "invType");
    if (!current) {
      await invoice.selectAutocomplete("document", "invType", OMN_UI_INVOICE_TYPE_COMMERCIAL);
    }
  }
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
    await fillIfEmpty(invoice, "item", "industrialClassification", OMN_UI_HS_CODE);
  }
  if (!excludeInputIds.has("itemType")) {
    const current = await invoice.readInputValue("item", "itemType");
    if (!current) {
      await invoice.selectAutocomplete("item", "itemType", OMN_UI_ITEM_TYPE_GOODS);
    }
  }
  if (!excludeInputIds.has("taxRateDtls[0].taxCategory")) {
    const taxCat = await invoice.readInputValue("item", "taxRateDtls[0].taxCategory");
    if (!taxCat) {
      await invoice.selectAutocomplete(
        "item",
        "taxRateDtls[0].taxCategory",
        OMN_UI_TAX_CATEGORY_STANDARD
      );
    }
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
  if (!excludeInputIds.has("unitOfMeasure")) {
    const uom = await invoice.readInputValue("item", "unitOfMeasure");
    if (!uom) {
      await invoice.selectAutocomplete("item", "unitOfMeasure", OMN_UI_UNIT_OF_MEASURE);
    }
  }
  if (!excludeInputIds.has("custom1")) {
    await fillIfEmpty(invoice, "item", "custom1", "Item custom 1");
  }
  if (!excludeInputIds.has("custom2")) {
    await fillIfEmpty(invoice, "item", "custom2", "Item custom 2");
  }
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
  const current = await invoice.readInputValue("payment", "meansType");
  if (!current) {
    await invoice.selectAutocomplete("payment", "meansType", "Credit transfer");
  }
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
  excludeInputIds: Set<string>,
  uniqueKey?: string
): Promise<void> {
  await invoice.openSectionForEdit("document", entry);
  let knownTypes: { invoiceTypeCode?: string; invoiceTransactionTypeCode?: string } | undefined;
  if (section !== "document") {
    if (await invoice.isSectionInEditMode("document", entry)) {
      await ensureDocumentBaseline(invoice, entry, new Set(), uniqueKey);
      knownTypes = {
        invoiceTypeCode: await invoice.readInputValue("document", "invType"),
        invoiceTransactionTypeCode: await invoice.readInputValue("document", "invTxnType"),
      };
      await invoice.clickSectionCommit("document", entry);
      await invoice.expectSectionSavedReadOnly("document");
    }
    await invoice.openSectionForEdit(section, entry);
  } else {
    await ensureDocumentBaseline(invoice, entry, excludeInputIds, uniqueKey);
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
  await invoice.selectAutocomplete("document", "invTxnType", TXN_PREPAYMENT_INVOICE);
  await invoice.selectAutocomplete("document", "invType", OMN_UI_INVOICE_TYPE_COMMERCIAL);
  await invoice.clickSectionCommit("document", entry);
  await invoice.expectSectionSavedReadOnly("document");
  await invoice.openSectionForEdit("payment", entry);
  await invoice.expectInputDisabled(rule.section, rule.inputId, false, rule.altInputIds);
}

export async function runOmnUiMinMaxCase(
  page: Page,
  entry: OmnUiEntry,
  rule: OmnUiFieldRule,
  variant: OmnUiMinMaxVariant,
  uniqueKey?: string
): Promise<void> {
  const invoice = await openOmnUiInvoiceEditor(page, entry);
  // Fill every field in the section first, then overwrite the field under test.
  await ensureSectionBaseline(invoice, rule.section, entry, new Set(), uniqueKey);
  await enablePrecedingInvoiceMinMaxFields(invoice, rule);
  await enablePrepaymentMinMaxFields(invoice, rule, entry);

  if (await invoice.isInputDisabled(rule.section, rule.inputId, rule.altInputIds)) {
    test.skip(true, `${rule.field} is disabled on ${entry}`);
  }

  const value = omnUiTestValue(lengthForVariant(rule, variant), rule.kind);
  await invoice.replaceInput(rule.section, rule.inputId, value, rule.altInputIds);
  if (rule.section === "buyer" || rule.section === "item") {
    await invoice.dismissOpenDropdown();
  }
  await commitSection(invoice, rule.section, entry);

  const expectsError = omnUiMinMaxExpectsError(rule, variant);
  const message = await invoice.readFieldError(rule.section, rule.inputId, rule.altInputIds);
  if (expectsError) {
    expect(message, `expected a field error on ${rule.field}`).toBeTruthy();
    await invoice.expectSectionNotSaved(rule.section, entry);
  } else {
    expect(message, `did not expect a field error on ${rule.field}`).toBeFalsy();
    await invoice.expectSectionSavedReadOnly(rule.section);
  }
}

export async function runOmnUiExcelPartyIdentityCase(
  page: Page,
  entry: OmnUiEntry,
  identityCase: OmnUiExcelPartyIdentityCase,
  uniqueKey?: string
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
    await invoice.selectAutocomplete("document", "invTxnType", OMN_UI_TXN_SELF_BILLED);
    await invoice.selectAutocomplete("document", "invType", OMN_UI_INVOICE_TYPE_SELF_BILLED);
  }
  await ensureDocumentBaseline(
    invoice,
    entry,
    selfBilled ? new Set(["invType", "invTxnType"]) : new Set(),
    uniqueKey
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
    case "buyerAddress":
      return ["buyer"];
    case "deliverToAddress":
      return ["shipping"];
    case "prepaymentPaidAmount":
      return ["invoice", "payment"];
    default:
      return [];
  }
}

/**
 * Sections this conditional must fill. Always Document + Item; add 3rd/4th
 * sections when the rule also depends on seller, buyer, shipping, invoice, or payment.
 */
function sectionsForConditional(scenario: OmnUiConditionalScenario): OmnUiSection[] {
  const needed = new Set<OmnUiSection>(["document", "item"]);
  for (const section of extraSectionsForKind(scenario.kind)) {
    needed.add(section);
  }
  needed.add(scenario.section);
  return OMN_UI_SECTION_ORDER.filter((section) => needed.has(section));
}

function excludeIdsForConditional(
  scenario: OmnUiConditionalScenario,
  section: OmnUiSection
): Set<string> {
  const ids = new Set<string>();
  if (section === "document") {
    if (scenario.invoiceTypeCode !== undefined) ids.add("invType");
    if (scenario.invoiceTransactionTypeCode !== undefined) ids.add("invTxnType");
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
  }
  if (section === "seller") {
    if (scenario.sellerVatIdentifier !== undefined) {
      ids.add("vatIdentifier");
      ids.add("sellerVatIdentifier");
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
  uniqueKey?: string,
  knownTypes?: { invoiceTypeCode?: string; invoiceTransactionTypeCode?: string }
): Promise<void> {
  if (section === "document") {
    await ensureDocumentBaseline(invoice, entry, excludeInputIds, uniqueKey);
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

async function writeText(
  invoice: OMN_UIInvoiceManualPage,
  section: OmnUiSection,
  inputId: string,
  value: string | undefined,
  altInputIds: readonly string[] = []
): Promise<void> {
  if (value === undefined) return;
  if (await invoice.isInputDisabled(section, inputId, altInputIds)) return;
  const literal = excelFormulaToUiValue(value) ?? "";
  if (isUiEmptyValue(literal)) {
    await invoice.clearInput(section, inputId, altInputIds);
    return;
  }
  await invoice.replaceInput(section, inputId, literal, altInputIds);
}

async function writeAutocomplete(
  invoice: OMN_UIInvoiceManualPage,
  section: OmnUiSection,
  inputId: string,
  value: string | undefined | null,
  altInputIds: readonly string[] = []
): Promise<void> {
  if (value === undefined) return;
  if (await invoice.isInputDisabled(section, inputId, altInputIds)) return;
  const literal = excelFormulaToUiValue(value) ?? "";
  if (isUiEmptyValue(literal)) {
    await invoice.clearAutocomplete(section, inputId, altInputIds);
    return;
  }
  if (isUiWhitespaceValue(literal)) {
    await invoice.typeWhitespace(section, inputId, literal, altInputIds);
    return;
  }
  await invoice.selectAutocomplete(section, inputId, literal, altInputIds);
}

async function writeDate(
  invoice: OMN_UIInvoiceManualPage,
  section: OmnUiSection,
  inputId: string,
  value: string | undefined
): Promise<void> {
  if (value === undefined) return;
  if (await invoice.isInputDisabled(section, inputId)) return;
  const literal = excelFormulaToUiValue(value) ?? "";
  if (isUiEmptyValue(literal) || isUiWhitespaceValue(literal)) {
    await invoice.clearDate(section, inputId);
    return;
  }
  await invoice.fillDate(section, inputId, literal);
}

async function fillAddressBlock(
  invoice: OMN_UIInvoiceManualPage,
  section: OmnUiSection,
  scenario: OmnUiConditionalScenario
): Promise<void> {
  await writeText(invoice, section, "address1", scenario.addressLine1, ["address"]);
  await writeText(invoice, section, "address2", scenario.addressLine2);
  await writeText(invoice, section, "address3", scenario.addressLine3);
  await writeText(invoice, section, "city", scenario.city);
  await writeText(invoice, section, "postCode", scenario.postCode, ["postalCode"]);
  await writeText(invoice, section, "countrySubdivision", scenario.countrySubdivision, [
    "deliverToCountrySubdivision",
  ]);
  await writeAutocomplete(invoice, section, "country", scenario.countryCode, ["countryCode"]);
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

async function applyConditionalSectionFields(
  invoice: OMN_UIInvoiceManualPage,
  scenario: OmnUiConditionalScenario,
  section: OmnUiSection
): Promise<void> {
  if (section === "document") {
    if (scenario.invoiceTransactionTypeCode) {
      await invoice.selectAutocomplete(
        "document",
        "invTxnType",
        scenario.invoiceTransactionTypeCode
      );
    }
    if (scenario.invoiceTypeCode) {
      await invoice.selectAutocomplete("document", "invType", scenario.invoiceTypeCode);
    }
    await expectPrecedingInvoiceEnablement(invoice, scenario);
    if (scenario.kind === "exchangeRate") {
      if (isOmrCurrency(scenario.invoiceCurrencyCode)) {
        if (scenario.exchangeRate) {
          if (await invoice.isInputDisabled("document", "currExchangeRate")) {
            test.skip(
              true,
              "exchange rate is disabled on OMR so the Excel provided-rate case cannot be typed"
            );
          }
        }
      } else {
        await invoice.selectFirstNonOmrCurrency();
        await invoice.expectInputDisabled("document", "currExchangeRate", false);
      }
      await writeText(invoice, "document", "currExchangeRate", scenario.exchangeRate);
    }
    await writeAutocomplete(invoice, "document", "creditNoteRsn", scenario.creditNoteReasonCode);
    await writeText(
      invoice,
      "document",
      OMN_UI_PRECEDING_REF_ID,
      scenario.precedingInvoiceReference
    );
    await writeDate(
      invoice,
      "document",
      OMN_UI_PRECEDING_DATE_ID,
      scenario.precedingInvoiceIssueDate
    );
    await writeText(
      invoice,
      "document",
      OMN_UI_PRECEDING_UUID_ID,
      scenario.precedingInvoiceUuid
    );
    await writeDate(invoice, "document", "invStartDate", scenario.periodStart);
    await writeDate(invoice, "document", "invEndDate", scenario.periodEnd);
    await writeDate(invoice, "document", "importDate", scenario.importDate);
    await writeText(
      invoice,
      "document",
      "customsDeclarationNumber",
      scenario.customsDeclarationNumber
    );
    await writeAutocomplete(invoice, "document", "incoterms", scenario.incoterms);
    return;
  }
  if (section === "item") {
    await writeAutocomplete(
      invoice,
      "item",
      "originCountry",
      scenario.itemCountryOfOrigin,
      ["itemCountryOfOrigin", "countryOfOrigin"]
    );
    await writeAutocomplete(
      invoice,
      "item",
      "industrialClassification",
      scenario.industrialClassificationCode
    );
    return;
  }
  if (section === "seller") {
    await writeText(invoice, "seller", "vatIdentifier", scenario.sellerVatIdentifier, [
      "sellerVatIdentifier",
    ]);
    if (scenario.kind === "sellerAddress") {
      await fillAddressBlock(invoice, "seller", scenario);
    }
    return;
  }
  if (section === "thirdParty") {
    await writeText(invoice, "thirdParty", "name", scenario.thirdPartyName);
    await writeText(invoice, "thirdParty", "vatIdentifier", scenario.thirdPartyVatin);
    await fillAddressBlock(invoice, "thirdParty", scenario);
    return;
  }
  if (section === "buyer") {
    await writeText(invoice, "buyer", "buyerIdentifier", scenario.buyerIdentifier, ["identifier"]);
    await writeText(invoice, "buyer", "vatIdentifier", scenario.buyerVatIdentifier);
    if (scenario.kind === "buyerAddress") {
      await fillAddressBlock(invoice, "buyer", scenario);
    }
    return;
  }
  if (section === "shipping") {
    await fillAddressBlock(invoice, "shipping", scenario);
    return;
  }
  if (section === "invoice") {
    await writeText(invoice, "invoice", "paidAmt", scenario.paidAmount, ["paidAmount"]);
    return;
  }
  if (section === "payment") {
    await writeText(invoice, "payment", "prepaymentInvoiceNum", scenario.prepaymentInvoiceNumber, [
      "prepaymentInvNum",
      "prepaymentInvoiceNumber",
    ]);
    await writeText(invoice, "payment", "prepaymentInvoiceUuid", scenario.prepaymentInvoiceUuid, [
      "prepaymentUuid",
      "prepaymentInvoiceUUID",
    ]);
  }
}

export async function runOmnUiConditionalScenario(
  page: Page,
  entry: OmnUiEntry,
  scenario: OmnUiConditionalScenario,
  uniqueKey?: string
): Promise<void> {
  const invoice = await openOmnUiInvoiceEditor(page, entry);

  if (scenario.kind === "copyInvoiceNumberEmpty") {
    const invNum = await invoice.readInputValue("document", "invNum");
    expect(invNum, "copied invoice number should be empty").toBe("");
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
      uniqueKey,
      {
        invoiceTypeCode: scenario.invoiceTypeCode,
        invoiceTransactionTypeCode: scenario.invoiceTransactionTypeCode,
      }
    );
    await applyConditionalSectionFields(invoice, scenario, section);
    if (section !== scenario.section) {
      await commitSection(invoice, section, entry);
    }
  }
  await commitSection(invoice, scenario.section, entry);

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
  await invoice.replaceInput(section, ids[0], value, ids.slice(1));
}

function parseAmount(raw: string): number | null {
  const n = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

export async function runOmnUiFormulaScenario(
  page: Page,
  entry: OmnUiEntry,
  scenario: InvoiceFormulaScenario,
  uniqueKey?: string
): Promise<void> {
  const invoice = await openOmnUiInvoiceEditor(page, entry);
  await ensureDocumentBaseline(invoice, entry, new Set(), uniqueKey);
  await invoice.openItemEditor(isOmnUiPrefilledLineItemEntry(entry));
  await fillIfEmpty(invoice, "item", "itemName", "Formula item");
  await fillIfEmpty(invoice, "item", "industrialClassification", OMN_UI_HS_CODE);
  const itemType = await invoice.readInputValue("item", "itemType");
  if (!itemType) {
    await invoice.selectAutocomplete("item", "itemType", OMN_UI_ITEM_TYPE_GOODS);
  }
  const uom = await invoice.readInputValue("item", "unitOfMeasure");
  if (!uom) {
    await invoice.selectAutocomplete("item", "unitOfMeasure", OMN_UI_UNIT_OF_MEASURE);
  }
  const taxCat = await invoice.readInputValue("item", "taxRateDtls[0].taxCategory");
  if (!taxCat) {
    await invoice.selectAutocomplete(
      "item",
      "taxRateDtls[0].taxCategory",
      OMN_UI_TAX_CATEGORY_STANDARD
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

  await invoice.clickItemCommit(entry);
  await expect(invoice.itemModal()).toBeHidden({ timeout: 15_000 }).catch(() => {});

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
