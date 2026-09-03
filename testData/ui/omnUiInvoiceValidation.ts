import {
  BUYER_ADDRESS_LINE_1_FIELD,
  BUYER_ADDRESS_LINE_2_FIELD,
  BUYER_ADDRESS_LINE_3_FIELD,
  BUYER_ADDRESS_REQUIRED_SCENARIOS,
  BUYER_CITY_FIELD,
  BUYER_ID_OR_VATIN_SCENARIOS,
  BUYER_IDENTIFIER_FIELD,
  BUYER_POST_CODE_FIELD,
  BUYER_VAT_IDENTIFIER_FIELD,
  CREDIT_DEBIT_NOTE_REASON_CODE_FIELD,
  CREDIT_DEBIT_REASON_SCENARIOS,
  CUSTOMS_DECLARATION_NUMBER_FIELD,
  DELIVER_TO_ADDRESS_LINE_1_FIELD,
  DELIVER_TO_ADDRESS_LINE_2_FIELD,
  DELIVER_TO_ADDRESS_LINE_3_FIELD,
  DELIVER_TO_ADDRESS_REQUIRED_SCENARIOS,
  DELIVER_TO_CITY_FIELD,
  DELIVER_TO_COUNTRY_SUBDIVISION_FIELD,
  DELIVER_TO_POST_CODE_FIELD,
  EXCHANGE_RATE_FIELD,
  SOURCE_CURRENCY_CODE_FIELD,
  EXCHANGE_RATE_SCENARIOS,
  IMPORT_DATE_FIELD,
  IMPORT_OF_GOODS_SCENARIOS,
  INCOTERMS_FIELD,
  INDUSTRIAL_CLASSIFICATION_CODE_FIELD,
  INDUSTRIAL_CLASSIFICATION_REQUIRED_SCENARIOS,
  INVOICE_TYPE_COMMERCIAL_INVOICE,
  INVOICE_TYPE_CREDIT_NOTE,
  INVOICE_TYPE_SELF_BILLED_INVOICE,
  INVOICING_PERIOD_CONDITIONAL_SCENARIOS,
  INVOICING_PERIOD_END_DATE_FIELD,
  INVOICING_PERIOD_START_DATE_FIELD,
  ITEM_COUNTRY_OF_ORIGIN_FIELD,
  ITEM_TYPE_GOODS,
  OMAN_HS_CODE_12,
  CN_DN_SELF_BILLED_INVOICE_TYPES,
  PRECEDING_INVOICE_ISSUE_DATE_FIELD,
  PRECEDING_INVOICE_REFERENCE_FIELD,
  PRECEDING_INVOICE_SCENARIOS,
  PRECEDING_INVOICE_UUID_FIELD,
  PROFIT_MARGIN_PRECEDING_SCENARIOS,
  PREPAYMENT_PAID_AMOUNT_SCENARIOS,
  SELLER_ADDRESS_LINE_1_FIELD,
  SELLER_ADDRESS_LINE_2_FIELD,
  SELLER_ADDRESS_LINE_3_FIELD,
  SELLER_ADDRESS_REQUIRED_SCENARIOS,
  SELLER_CITY_FIELD,
  SELLER_POST_CODE_FIELD,
  SELLER_VAT_IDENTIFIER_FIELD,
  SELLER_VAT_MANDATORY_SCENARIOS,
  STANDARD_TAX_CATEGORY_CODE,
  THIRD_PARTY_ADDRESS_LINE_1_FIELD,
  THIRD_PARTY_ADDRESS_LINE_2_FIELD,
  THIRD_PARTY_ADDRESS_LINE_3_FIELD,
  THIRD_PARTY_CITY_FIELD,
  THIRD_PARTY_COUNTRY_CODE_FIELD,
  THIRD_PARTY_NAME_FIELD,
  THIRD_PARTY_POSTAL_CODE_FIELD,
  THIRD_PARTY_REQUIRED_SCENARIOS,
  THIRD_PARTY_VATIN_FIELD,
  TXN_FULL_TAX_INVOICE,
  TXN_IMPORT_OF_GOODS,
  TXN_PROFIT_MARGIN_INVOICE,
  TXN_PROFIT_MARGIN_SELF_INVOICE,
  TXN_SELF_BILLED_INVOICE,
  OMAN_CURRENCY_OMR,
  OMAN_CURRENCY_USD,
} from "../FieldValidations/ConditionalValidation";
import {
  fieldInvoice_number,
  fieldValidationConditional,
  fieldValidationMandatory,
  fieldValidationOptional,
  invoiceFormulaTestData,
} from "../FieldValidations/Min_max_field_validation";
import {
  conditionalDropdownFieldMasterConfig,
  dropdownFieldMasterConfig,
} from "../FieldValidations/TestDataConfig";

export const OMN_UI_INVOICE_TEST_TIMEOUT_MS = 180_000;
export const OMN_UI_INVOICE_EDIT_COPY_TIMEOUT_MS = 240_000;
export const OMN_UI_INVOICE_FORMULA_TIMEOUT_MS = 180_000;

export const OMN_UI_INVOICE_TYPE_COMMERCIAL = INVOICE_TYPE_COMMERCIAL_INVOICE;
export const OMN_UI_INVOICE_TYPE_CREDIT_NOTE = INVOICE_TYPE_CREDIT_NOTE;
export const OMN_UI_INVOICE_TYPE_SELF_BILLED = INVOICE_TYPE_SELF_BILLED_INVOICE;
export const OMN_UI_TXN_FULL_TAX = TXN_FULL_TAX_INVOICE;
export const OMN_UI_TXN_SELF_BILLED = TXN_SELF_BILLED_INVOICE;
export const OMN_UI_CURRENCY_OMR = "Rial Omani";
export const OMN_UI_ITEM_TYPE_GOODS = ITEM_TYPE_GOODS;
export const OMN_UI_HS_CODE = OMAN_HS_CODE_12;
export const OMN_UI_TAX_CATEGORY_STANDARD = STANDARD_TAX_CATEGORY_CODE;
export const OMN_UI_UNIT_OF_MEASURE = "each";

export const OMN_UI_PRECEDING_REF_ID = "proceedingDtls[0].invoiceReference";
export const OMN_UI_PRECEDING_DATE_ID = "proceedingDtls[0].invoiceIssueDate";
export const OMN_UI_PRECEDING_UUID_ID = "proceedingDtls[0].uniqueIdentifierNumber";

const OMN_UI_CREATE_ONLY: readonly OmnUiEntry[] = ["create"];
const CN_DN_261_TYPES = new Set<string>(CN_DN_SELF_BILLED_INVOICE_TYPES);

export type OmnUiEntry = "create" | "edit" | "copy";
export type OmnUiMinMaxVariant = "min" | "max" | "belowMin" | "aboveMax";
export type OmnUiFieldKind = "text" | "digits" | "date" | "autocomplete";
/** Excel source of truth — never the UI asterisk. Conditional = optional until a PINT-OM row fires. */
export type OmnUiExcelPresence = "mandatory" | "optional" | "conditional";

export const OMN_UI_MIN_MAX_VARIANTS: readonly OmnUiMinMaxVariant[] = [
  "min",
  "max",
  "belowMin",
  "aboveMax",
] as const;

export const OMN_UI_ENTRIES: readonly OmnUiEntry[] = ["create", "edit", "copy"] as const;

export type OmnUiSection =
  | "document"
  | "seller"
  | "thirdParty"
  | "buyer"
  | "shipping"
  | "item"
  | "invoice"
  | "payment"
  | "custom";

export const OMN_UI_SECTION_DATA_ID: Record<OmnUiSection, string> = {
  document: "1",
  seller: "A",
  thirdParty: "B",
  buyer: "C",
  shipping: "D",
  item: "3",
  invoice: "4",
  payment: "5",
  custom: "6",
};

export const OMN_UI_SECTION_LABELS: Record<OmnUiSection, string> = {
  document: "Document",
  seller: "Seller",
  thirdParty: "Third Party",
  buyer: "Buyer",
  shipping: "Shipping",
  item: "Item",
  invoice: "Invoice",
  payment: "Payment",
  custom: "Custom",
};

export const OMN_UI_SECTION_ORDER: readonly OmnUiSection[] = [
  "document",
  "seller",
  "thirdParty",
  "buyer",
  "shipping",
  "item",
  "invoice",
  "payment",
  "custom",
] as const;

export type OmnUiFieldRule = {
  field: string;
  section: OmnUiSection;
  inputId: string;
  altInputIds?: readonly string[];
  min: number;
  max: number;
  belowMin: number;
  aboveMax: number;
  requiredOnForm: boolean;
  excelPresence: OmnUiExcelPresence;
  kind: OmnUiFieldKind;
  /** Autocomplete / dropdown fields are not covered by min/max length tests. */
  dropdown?: boolean;
  /** Seller/buyer TRN + electronic follow Excel worker identity — not min/max length. */
  excelPartyIdentity?: boolean;
};

type ExcelLengthRow = {
  field: string;
  min: number;
  max: number;
  belowMin: number;
  aboveMax: number;
};

function fromExcel(
  excelField: string,
  section: OmnUiSection,
  inputId: string,
  rows: ExcelLengthRow[],
  options?: {
    kind?: OmnUiFieldKind;
    altInputIds?: readonly string[];
    dropdown?: boolean;
    excelPartyIdentity?: boolean;
    /** When the UI gate that enables this field also makes it required. */
    requiredOnForm?: boolean;
  }
): OmnUiFieldRule {
  const row = rows.find((r) => r.field === excelField);
  if (!row) {
    throw new Error(`Excel min/max row missing for ${excelField}`);
  }
  const excelPresence = presenceFromLengthRows(rows);
  return {
    field: excelField,
    section,
    inputId,
    altInputIds: options?.altInputIds,
    min: row.min,
    max: row.max,
    belowMin: row.belowMin,
    aboveMax: row.aboveMax,
    excelPresence,
    requiredOnForm: options?.requiredOnForm ?? excelPresence === "mandatory",
    kind: options?.kind ?? "text",
    dropdown: options?.dropdown,
    excelPartyIdentity: options?.excelPartyIdentity,
  };
}

function normExcelField(field: string): string {
  return field.replace(/\s+/g, " ").trim().toLowerCase();
}

function fieldInList(field: string, rows: readonly { field: string }[]): boolean {
  const want = normExcelField(field);
  return rows.some((r) => normExcelField(r.field) === want);
}

function presenceFromLengthRows(rows: ExcelLengthRow[]): OmnUiExcelPresence {
  if (rows === fieldValidationMandatory || rows === fieldInvoice_number) return "mandatory";
  if (rows === fieldValidationOptional) return "optional";
  return "conditional";
}

/** Excel dropdown / date presence — UI asterisks are ignored. Conditional list wins over primary dropdown master. */
function excelPresenceForNamedField(field: string): OmnUiExcelPresence {
  if (fieldInList(field, fieldInvoice_number) || fieldInList(field, fieldValidationMandatory)) {
    return "mandatory";
  }
  if (fieldInList(field, fieldValidationOptional)) return "optional";
  if (fieldInList(field, fieldValidationConditional)) return "conditional";
  if (fieldInList(field, conditionalDropdownFieldMasterConfig)) return "conditional";
  if (normExcelField(field) === normExcelField(SOURCE_CURRENCY_CODE_FIELD)) return "conditional";
  if (
    field === IMPORT_DATE_FIELD ||
    field === INVOICING_PERIOD_START_DATE_FIELD ||
    field === INVOICING_PERIOD_END_DATE_FIELD ||
    field === PRECEDING_INVOICE_ISSUE_DATE_FIELD
  ) {
    return "conditional";
  }
  if (normExcelField(field) === "invoice issue date") return "mandatory";
  if (fieldInList(field, dropdownFieldMasterConfig)) return "mandatory";
  return "optional";
}

/** UI autocomplete — skipped by min/max. Excel names match `dropdownFieldMasterConfig` where they exist. */
function dropdownRule(
  field: string,
  section: OmnUiSection,
  inputId: string,
  options?: { altInputIds?: readonly string[] }
): OmnUiFieldRule {
  const excelPresence = excelPresenceForNamedField(field);
  return {
    field,
    section,
    inputId,
    altInputIds: options?.altInputIds,
    min: 0,
    max: 0,
    belowMin: 0,
    aboveMax: 0,
    excelPresence,
    requiredOnForm: excelPresence === "mandatory",
    kind: "autocomplete",
    dropdown: true,
  };
}

/** Date pickers — skipped by min/max length. */
function dateRule(
  field: string,
  section: OmnUiSection,
  inputId: string,
  options?: { altInputIds?: readonly string[] }
): OmnUiFieldRule {
  const excelPresence = excelPresenceForNamedField(field);
  return {
    field,
    section,
    inputId,
    altInputIds: options?.altInputIds,
    min: 0,
    max: 0,
    belowMin: 0,
    aboveMax: 0,
    excelPresence,
    requiredOnForm: excelPresence === "mandatory",
    kind: "date",
  };
}

export const OMN_UI_FIELD_RULES: OmnUiFieldRule[] = [
  fromExcel("Invoice Number", "document", "invNum", fieldInvoice_number),
  dateRule("Invoice Issue Date", "document", "invDate", {
    altInputIds: ["issueDate", "invIssueDate"],
  }),
  dropdownRule("Invoice Type Code", "document", "invType"),
  dropdownRule("Invoice Transaction Type Code", "document", "invTxnType"),
  dropdownRule("Invoice Currency Code", "document", "invCurrCode"),
  dropdownRule("Tax Accounting Currency", "document", "taxAccountingCurrency", {
    altInputIds: ["taxAccCurr", "taxAccountingCurrCode"],
  }),
  dropdownRule("Source currency code", "document", "sourceCurrCode", {
    altInputIds: ["sourceCurrency"],
  }),
  dateRule("Invoicing Period Start Date", "document", "invStartDate"),
  dateRule("Invoicing Period End Date", "document", "invEndDate"),
  dropdownRule("Incoterms", "document", "incoterms"),
  dateRule("Import Date", "document", "importDate"),
  dropdownRule("Credit note or Debit Note reason code", "document", "creditNoteRsn"),
  dateRule("Preceding Invoice Issue Date", "document", OMN_UI_PRECEDING_DATE_ID),
  fromExcel("Purchase Order Number", "document", "purchaseOrderRef", fieldValidationOptional),
  fromExcel(
    "Customs Declaration number",
    "document",
    "customsDeclarationNumber",
    fieldValidationConditional
  ),
  fromExcel(
    "Preceding Invoice reference",
    "document",
    "proceedingDtls[0].invoiceReference",
    fieldValidationConditional,
    // ALIGNED-IBRP-028-OM / IBR-032-OM: enabled and required on Credit note.
    { requiredOnForm: true }
  ),
  fromExcel(
    "Unique Identifier Number",
    "document",
    "proceedingDtls[0].uniqueIdentifierNumber",
    fieldValidationConditional,
    // IBR-032-OM: enabled and required on Credit note with the preceding trio.
    { requiredOnForm: true }
  ),

  fromExcel("Seller name", "seller", "name", fieldValidationMandatory, {
    altInputIds: ["sellerName"],
  }),
  fromExcel(
    "Seller VAT Identifier (TRN / TIN)",
    "seller",
    "vatIdentifier",
    fieldValidationConditional,
    {
      altInputIds: ["sellerVatIdentifier"],
      excelPartyIdentity: true,
    }
  ),
  dropdownRule("Seller electronic address Scheme", "seller", "peppolSchemeIdentifier"),
  fromExcel("Seller electronic address", "seller", "electronicAddress", fieldValidationMandatory, {
    altInputIds: ["sellerElectronicAddress"],
    excelPartyIdentity: true,
  }),
  dropdownRule("Seller identifier - Scheme identifier", "seller", "schemeIdentifier", {
    altInputIds: ["sellerSchemeIdentifier"],
  }),
  dropdownRule("Seller Identifier (textual code)", "seller", "identifierCode", {
    altInputIds: ["textualCode", "sellerIdentifierCode"],
  }),
  fromExcel("Seller address line 1", "seller", "address1", fieldValidationMandatory, {
    altInputIds: ["address", "sellerAddressLine1"],
  }),
  fromExcel("Seller address line 2", "seller", "address2", fieldValidationMandatory, {
    altInputIds: ["sellerAddressLine2"],
  }),
  fromExcel("Seller address line 3", "seller", "address3", fieldValidationMandatory, {
    altInputIds: ["sellerAddressLine3"],
  }),
  fromExcel("Seller city", "seller", "city", fieldValidationMandatory, {
    altInputIds: ["sellerCity"],
  }),
  fromExcel("Seller post code", "seller", "postCode", fieldValidationMandatory, {
    altInputIds: ["postalCode", "sellerPostCode"],
  }),
  dropdownRule("Seller country code", "seller", "country", {
    altInputIds: ["countryCode"],
  }),
  dropdownRule("Seller country subdivision code", "seller", "countrySubdivision", {
    altInputIds: ["sellerCountrySubdivision"],
  }),
  fromExcel("Seller identifier", "seller", "sellerIdentifier", fieldValidationConditional, {
    altInputIds: ["identifier"],
  }),

  fromExcel("Third Party Name", "thirdParty", "name", fieldValidationConditional),
  fromExcel("Third Party VATIN", "thirdParty", "vatIdentifier", fieldValidationConditional),
  fromExcel("Third Party Address Line 1", "thirdParty", "address1", fieldValidationConditional, {
    altInputIds: ["address"],
  }),
  fromExcel("Third Party Address Line 2", "thirdParty", "address2", fieldValidationConditional),
  fromExcel("Third Party Address Line 3", "thirdParty", "address3", fieldValidationConditional),
  fromExcel("Third Party City", "thirdParty", "city", fieldValidationConditional),
  fromExcel(
    "Third Party Postal Code - PO Box Number",
    "thirdParty",
    "postCode",
    fieldValidationConditional,
    { altInputIds: ["postalCode"] }
  ),
  dropdownRule("Third Party Country Code", "thirdParty", "country", {
    altInputIds: ["countryCode"],
  }),

  fromExcel("Buyer name", "buyer", "name", fieldValidationMandatory),
  fromExcel("Buyer VAT identifier", "buyer", "vatIdentifier", fieldValidationConditional, {
    excelPartyIdentity: true,
  }),
  dropdownRule("Buyer electronic address Scheme", "buyer", "peppolSchemeIdentifier"),
  fromExcel("Buyer electronic address", "buyer", "electronicAddress", fieldValidationMandatory, {
    excelPartyIdentity: true,
  }),
  dropdownRule("Scheme identifier", "buyer", "schemeIdentifier", {
    altInputIds: ["buyerSchemeIdentifier"],
  }),
  dropdownRule("Buyer Identifier (textual code)", "buyer", "identifierCode", {
    altInputIds: ["textualCode", "buyerIdentifierCode"],
  }),
  fromExcel("Buyer address line 1", "buyer", "address1", fieldValidationMandatory, {
    altInputIds: ["address"],
  }),
  fromExcel("Buyer address line 2", "buyer", "address2", fieldValidationMandatory),
  fromExcel("Buyer address line 3", "buyer", "address3", fieldValidationMandatory),
  fromExcel("Buyer city", "buyer", "city", fieldValidationMandatory),
  fromExcel("Buyer post code", "buyer", "postCode", fieldValidationMandatory, {
    altInputIds: ["postalCode"],
  }),
  dropdownRule("Buyer country code", "buyer", "country", {
    altInputIds: ["countryCode"],
  }),
  dropdownRule("Buyer country subdivision code", "buyer", "countrySubdivision", {
    altInputIds: ["buyerCountrySubdivision"],
  }),
  fromExcel("Buyer identifier", "buyer", "buyerIdentifier", fieldValidationConditional, {
    altInputIds: ["identifier"],
  }),

  fromExcel("Deliver to party name", "shipping", "name", fieldValidationOptional, {
    altInputIds: ["deliverToPartyName"],
  }),
  fromExcel("Deliver to address line 1", "shipping", "address1", fieldValidationConditional, {
    altInputIds: ["address", "deliverToAddressLine1"],
  }),
  fromExcel("Deliver to address line 2", "shipping", "address2", fieldValidationConditional, {
    altInputIds: ["deliverToAddressLine2"],
  }),
  fromExcel("Deliver to address line 3", "shipping", "address3", fieldValidationConditional, {
    altInputIds: ["deliverToAddressLine3"],
  }),
  fromExcel("Deliver to city", "shipping", "city", fieldValidationConditional, {
    altInputIds: ["deliverToCity"],
  }),
  fromExcel("Deliver to post code", "shipping", "postCode", fieldValidationConditional, {
    altInputIds: ["postalCode", "deliverToPostCode"],
  }),
  fromExcel(
    "Deliver to country sub-division",
    "shipping",
    "countrySubdivision",
    fieldValidationOptional,
    { altInputIds: ["deliverToCountrySubdivision"] }
  ),
  dropdownRule("Deliver to country code", "shipping", "country", {
    altInputIds: ["countryCode"],
  }),

  fromExcel("Invoice line identifier", "item", "invLineId", fieldValidationMandatory, {
    altInputIds: ["invoiceLineIdentifier", "lineId"],
  }),
  dropdownRule("Item Type", "item", "itemType"),
  dropdownRule("Item classification scheme", "item", "classificationScheme", {
    altInputIds: ["schemeIdentifier", "itemSchemeIdentifier"],
  }),
  fromExcel(
    "Item classification identifier",
    "item",
    "classificationIdentifier",
    fieldValidationConditional,
    {
      kind: "autocomplete",
      dropdown: true,
    }
  ),
  dropdownRule("Industrial Classification Code", "item", "industrialClassification"),
  dropdownRule("Profit margin item type code", "item", "profitMarginItemType", {
    altInputIds: ["profitMarginItemTypeCode"],
  }),
  dropdownRule("Service Type Code", "item", "serviceTypeCode", {
    altInputIds: ["serviceAccountingCode"],
  }),
  fromExcel("Item name", "item", "itemName", fieldValidationMandatory),
  fromExcel("Item description", "item", "itemDescription", fieldValidationOptional),
  fromExcel("Item attribute name", "item", "itemAttributeName", fieldValidationConditional, {
    altInputIds: ["attributeName"],
  }),
  fromExcel("Item attribute value", "item", "itemAttributeValue", fieldValidationConditional, {
    altInputIds: ["attributeValue"],
  }),
  dropdownRule("Item country of origin", "item", "originCountry", {
    altInputIds: ["itemCountryOfOrigin", "countryOfOrigin"],
  }),
  dropdownRule("Invoiced quantity unit of measure code", "item", "unitOfMeasure"),
  dropdownRule("Tax Category", "item", "taxRateDtls[0].taxCategory"),
  fromExcel("Tax Rate", "item", "taxRateDtls[0].taxRate", fieldValidationConditional, {
    kind: "digits",
  }),
  dropdownRule("Tax exemption reason code", "item", "taxRateDtls[0].exemptionReasonCode", {
    altInputIds: ["taxExemptionReasonCode", "exemptionReasonType"],
  }),
  fromExcel(
    "Tax exemption reason text",
    "item",
    "taxRateDtls[0].exemptionReason",
    fieldValidationOptional,
    { altInputIds: ["taxExemptionReason"] }
  ),
  fromExcel("Item Custom 1", "item", "custom1", fieldValidationOptional),
  fromExcel("Item Custom 2", "item", "custom2", fieldValidationOptional),

  dropdownRule("Vat category - charges", "invoice", "docLevelCharges[0].vatCategory", {
    altInputIds: ["vatCategoryCharges"],
  }),
  dropdownRule("Tax exemption reason - charges", "invoice", "docLevelCharges[0].exemptionReasonCode", {
    altInputIds: ["taxExemptionReasonCharges", "docLevelCharges[0].exemptionReasonType"],
  }),
  dropdownRule("Vat category - allowances", "invoice", "docLevelAllowances[0].vatCategory", {
    altInputIds: ["vatCategoryAllowances"],
  }),
  dropdownRule(
    "Tax exemption reason - allowances",
    "invoice",
    "docLevelAllowances[0].exemptionReasonCode",
    {
      altInputIds: ["taxExemptionReasonAllowances", "docLevelAllowances[0].exemptionReasonType"],
    }
  ),

  dropdownRule("Payment means type code", "payment", "meansType"),
  fromExcel("Scheme Identifier - Payment", "payment", "schemeId", fieldValidationConditional, {
    altInputIds: ["paymentSchemeIdentifier"],
  }),
  fromExcel("Payment account identifier", "payment", "accountId", fieldValidationConditional, {
    altInputIds: ["paymentAccountIdentifier"],
  }),
  dateRule("Payment due date", "payment", "dueDate", {
    altInputIds: ["paymentDueDate"],
  }),
  fromExcel(
    "Payment card primary account number",
    "payment",
    "primaryAccountNum",
    fieldValidationOptional,
    { altInputIds: ["paymentCardPrimaryAccountNumber"] }
  ),
  fromExcel(
    "Supporting document reference",
    "payment",
    "supportingDocRef",
    fieldValidationConditional,
    { altInputIds: ["supportingDocumentReference"] }
  ),
  fromExcel(
    "Supporting document UUID",
    "payment",
    "supportingDocUuid",
    fieldValidationConditional,
    { altInputIds: ["supportingDocumentUUID"] }
  ),
  fromExcel(
    "Prepayment invoice number",
    "payment",
    "prepaymentInvoiceNum",
    fieldValidationConditional,
    { altInputIds: ["prepaymentInvNum", "prepaymentInvoiceNumber"] }
  ),
  fromExcel("Prepayment invoice UUID", "payment", "prepaymentInvoiceUuid", fieldValidationConditional, {
    altInputIds: ["prepaymentUuid", "prepaymentInvoiceUUID"],
  }),

  fromExcel("Custom 1", "custom", "custom1", fieldValidationOptional),
  fromExcel("Custom 2", "custom", "custom2", fieldValidationOptional),
  fromExcel("Custom 3", "custom", "custom3", fieldValidationOptional),
  fromExcel("Custom 4", "custom", "custom4", fieldValidationOptional),
  fromExcel("Custom 5", "custom", "custom5", fieldValidationOptional),
];

export function omnUiFieldRulesForSection(section: OmnUiSection): OmnUiFieldRule[] {
  return OMN_UI_FIELD_RULES.filter(
    (rule) =>
      rule.section === section &&
      !rule.dropdown &&
      !rule.excelPartyIdentity &&
      rule.kind !== "autocomplete" &&
      rule.kind !== "date"
  );
}

export function omnUiDropdownRulesForSection(section: OmnUiSection): OmnUiFieldRule[] {
  return OMN_UI_FIELD_RULES.filter((rule) => rule.section === section && Boolean(rule.dropdown));
}

export type OmnUiExcelPartyIdentityCase = {
  invoiceType: "commercial" | "selfBilled";
  section: "seller" | "buyer";
};

/** Accept Excel worker/counterparty TRN + electronic (no min/max length). */
export const OMN_UI_EXCEL_PARTY_IDENTITY_CASES: readonly OmnUiExcelPartyIdentityCase[] = [
  { invoiceType: "commercial", section: "seller" },
  { invoiceType: "commercial", section: "buyer" },
  { invoiceType: "selfBilled", section: "buyer" },
];

export function omnUiExcelPartyIdentityTitle(
  heading: string,
  identityCase: OmnUiExcelPartyIdentityCase
): string {
  const party = identityCase.section === "seller" ? "Seller" : "Buyer";
  const condition =
    identityCase.invoiceType === "selfBilled"
      ? "self-billed Excel worker TIN"
      : "Excel identity";
  return `${heading} | ${party} | VAT Identifier and electronic address | ${condition} → accepted`;
}

export function omnUiMinMaxCondition(variant: OmnUiMinMaxVariant, rule: OmnUiFieldRule): string {
  switch (variant) {
    case "min":
      return `minimum length (${rule.min} char${rule.min === 1 ? "" : "s"})`;
    case "max":
      return `maximum length (${rule.max} chars)`;
    case "belowMin":
      return rule.belowMin === 0 ? "empty (below minimum)" : `${rule.belowMin} chars (below minimum)`;
    case "aboveMax":
      return `${rule.aboveMax} chars (above maximum)`;
  }
}

export function omnUiMinMaxExpectsError(
  rule: OmnUiFieldRule,
  variant: OmnUiMinMaxVariant
): boolean {
  if (variant === "aboveMax") return true;
  if (variant === "belowMin") return rule.requiredOnForm || rule.belowMin > 0;
  return false;
}

export function omnUiTestValue(length: number, kind: OmnUiFieldKind): string {
  if (length <= 0) return "";
  const ch = kind === "digits" ? "1" : "A";
  return ch.repeat(length);
}

/**
 * Excel writes whitespace as `="        "` so OOXML does not drop it.
 * UI types the inner characters (real spaces), never the formula text.
 */
export function excelFormulaToUiValue(raw: string | null | undefined): string | undefined {
  if (raw === undefined) return undefined;
  if (raw === null) return "";
  const text = String(raw);
  const match = /^="([\s\S]*)"$/.exec(text);
  if (!match) return text;
  return match[1].replace(/""/g, '"');
}

export function isUiEmptyValue(value: string): boolean {
  return value.length === 0;
}

export function isUiWhitespaceValue(value: string): boolean {
  return value.length > 0 && value.trim() === "";
}

export function buildOmnUiInvoiceNumber(uniqueKey?: string): string {
  const raw = `UI-${(uniqueKey ?? String(Date.now())).replace(/\|/g, "-")}`;
  return raw.length <= 64 ? raw : raw.slice(0, 64);
}

export type OmnUiConditionalKind =
  | "exchangeRate"
  | "creditDebitReason"
  | "precedingInvoice"
  | "invoicingPeriod"
  | "importOfGoods"
  | "sellerVat"
  | "sellerAddress"
  | "thirdPartyRequired"
  | "buyerIdOrVatin"
  | "buyerAddress"
  | "deliverToAddress"
  | "industrialClassification"
  | "prepaymentPaidAmount"
  | "copyInvoiceNumberEmpty";

export type OmnUiConditionalScenario = {
  title: string;
  section: OmnUiSection;
  kind: OmnUiConditionalKind;
  shouldError: boolean;
  assertInputId: string;
  altInputIds?: readonly string[];
  ruleId?: string;
  entries?: readonly OmnUiEntry[];
  /** Master txn/type expansion or a dropdown/autocomplete assert field. */
  dropdownStyle?: boolean;
  invoiceTypeCode?: string;
  invoiceTransactionTypeCode?: string;
  invoiceCurrencyCode?: string;
  exchangeRate?: string;
  creditNoteReasonCode?: string | null;
  precedingInvoiceReference?: string;
  precedingInvoiceIssueDate?: string;
  precedingInvoiceUuid?: string;
  periodStart?: string;
  periodEnd?: string;
  importDate?: string;
  customsDeclarationNumber?: string;
  incoterms?: string;
  itemCountryOfOrigin?: string;
  sellerVatIdentifier?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  city?: string;
  postCode?: string;
  countrySubdivision?: string;
  countryCode?: string;
  thirdPartyName?: string;
  thirdPartyVatin?: string;
  buyerIdentifier?: string;
  buyerVatIdentifier?: string;
  industrialClassificationCode?: string;
  paidAmount?: string;
  prepaymentInvoiceNumber?: string;
  prepaymentInvoiceUuid?: string;
};

export type OmnUiPrecedingEnablement = "all" | "refAndUuid" | "none";

/** IBR-032-OM (381/383/261) enables ref+date+UUID; IBR-175-OM enables ref+UUID. */
export function omnUiPrecedingInvoiceEnablement(
  scenario: Pick<OmnUiConditionalScenario, "invoiceTypeCode" | "invoiceTransactionTypeCode">
): OmnUiPrecedingEnablement {
  if (scenario.invoiceTypeCode && CN_DN_261_TYPES.has(scenario.invoiceTypeCode)) {
    return "all";
  }
  if (scenario.invoiceTransactionTypeCode === TXN_PROFIT_MARGIN_INVOICE) {
    return "refAndUuid";
  }
  return "none";
}

type CvFieldLoc = {
  section: OmnUiSection;
  inputId: string;
  altInputIds?: readonly string[];
};

const CV_FIELD_LOC: Record<string, CvFieldLoc> = {
  [EXCHANGE_RATE_FIELD]: { section: "document", inputId: "currExchangeRate" },
  [CREDIT_DEBIT_NOTE_REASON_CODE_FIELD]: { section: "document", inputId: "creditNoteRsn" },
  [PRECEDING_INVOICE_REFERENCE_FIELD]: {
    section: "document",
    inputId: OMN_UI_PRECEDING_REF_ID,
  },
  [PRECEDING_INVOICE_UUID_FIELD]: {
    section: "document",
    inputId: OMN_UI_PRECEDING_UUID_ID,
  },
  [PRECEDING_INVOICE_ISSUE_DATE_FIELD]: {
    section: "document",
    inputId: OMN_UI_PRECEDING_DATE_ID,
  },
  [INVOICING_PERIOD_START_DATE_FIELD]: { section: "document", inputId: "invStartDate" },
  [INVOICING_PERIOD_END_DATE_FIELD]: { section: "document", inputId: "invEndDate" },
  [IMPORT_DATE_FIELD]: { section: "document", inputId: "importDate" },
  [CUSTOMS_DECLARATION_NUMBER_FIELD]: { section: "document", inputId: "customsDeclarationNumber" },
  [INCOTERMS_FIELD]: { section: "document", inputId: "incoterms" },
  [ITEM_COUNTRY_OF_ORIGIN_FIELD]: {
    section: "item",
    inputId: "originCountry",
    altInputIds: ["itemCountryOfOrigin", "countryOfOrigin"],
  },
  [SELLER_VAT_IDENTIFIER_FIELD]: {
    section: "seller",
    inputId: "vatIdentifier",
    altInputIds: ["sellerVatIdentifier"],
  },
  [SELLER_ADDRESS_LINE_1_FIELD]: {
    section: "seller",
    inputId: "address1",
    altInputIds: ["address", "sellerAddressLine1"],
  },
  [SELLER_ADDRESS_LINE_2_FIELD]: { section: "seller", inputId: "address2" },
  [SELLER_ADDRESS_LINE_3_FIELD]: { section: "seller", inputId: "address3" },
  [SELLER_CITY_FIELD]: { section: "seller", inputId: "city" },
  [SELLER_POST_CODE_FIELD]: {
    section: "seller",
    inputId: "postCode",
    altInputIds: ["postalCode"],
  },
  [THIRD_PARTY_NAME_FIELD]: { section: "thirdParty", inputId: "name" },
  [THIRD_PARTY_VATIN_FIELD]: { section: "thirdParty", inputId: "vatIdentifier" },
  [THIRD_PARTY_ADDRESS_LINE_1_FIELD]: {
    section: "thirdParty",
    inputId: "address1",
    altInputIds: ["address"],
  },
  [THIRD_PARTY_ADDRESS_LINE_2_FIELD]: { section: "thirdParty", inputId: "address2" },
  [THIRD_PARTY_ADDRESS_LINE_3_FIELD]: { section: "thirdParty", inputId: "address3" },
  [THIRD_PARTY_CITY_FIELD]: { section: "thirdParty", inputId: "city" },
  [THIRD_PARTY_POSTAL_CODE_FIELD]: {
    section: "thirdParty",
    inputId: "postCode",
    altInputIds: ["postalCode"],
  },
  [THIRD_PARTY_COUNTRY_CODE_FIELD]: {
    section: "thirdParty",
    inputId: "country",
    altInputIds: ["countryCode"],
  },
  [BUYER_VAT_IDENTIFIER_FIELD]: { section: "buyer", inputId: "vatIdentifier" },
  [BUYER_IDENTIFIER_FIELD]: {
    section: "buyer",
    inputId: "buyerIdentifier",
    altInputIds: ["identifier"],
  },
  [BUYER_ADDRESS_LINE_1_FIELD]: { section: "buyer", inputId: "address1", altInputIds: ["address"] },
  [BUYER_ADDRESS_LINE_2_FIELD]: { section: "buyer", inputId: "address2" },
  [BUYER_ADDRESS_LINE_3_FIELD]: { section: "buyer", inputId: "address3" },
  [BUYER_CITY_FIELD]: { section: "buyer", inputId: "city" },
  [BUYER_POST_CODE_FIELD]: { section: "buyer", inputId: "postCode", altInputIds: ["postalCode"] },
  [DELIVER_TO_ADDRESS_LINE_1_FIELD]: {
    section: "shipping",
    inputId: "address1",
    altInputIds: ["address", "deliverToAddressLine1"],
  },
  [DELIVER_TO_ADDRESS_LINE_2_FIELD]: {
    section: "shipping",
    inputId: "address2",
    altInputIds: ["deliverToAddressLine2"],
  },
  [DELIVER_TO_ADDRESS_LINE_3_FIELD]: {
    section: "shipping",
    inputId: "address3",
    altInputIds: ["deliverToAddressLine3"],
  },
  [DELIVER_TO_CITY_FIELD]: { section: "shipping", inputId: "city", altInputIds: ["deliverToCity"] },
  [DELIVER_TO_POST_CODE_FIELD]: {
    section: "shipping",
    inputId: "postCode",
    altInputIds: ["postalCode", "deliverToPostCode"],
  },
  [DELIVER_TO_COUNTRY_SUBDIVISION_FIELD]: {
    section: "shipping",
    inputId: "countrySubdivision",
    altInputIds: ["deliverToCountrySubdivision"],
  },
  [INDUSTRIAL_CLASSIFICATION_CODE_FIELD]: {
    section: "item",
    inputId: "industrialClassification",
  },
  ["Prepayment invoice number"]: {
    section: "payment",
    inputId: "prepaymentInvoiceNum",
    altInputIds: ["prepaymentInvNum", "prepaymentInvoiceNumber"],
  },
  ["Prepayment invoice UUID"]: {
    section: "payment",
    inputId: "prepaymentInvoiceUuid",
    altInputIds: ["prepaymentUuid", "prepaymentInvoiceUUID"],
  },
};

/** Autocomplete / dropdown inputs — skipped in field min/max. */
export const OMN_UI_DROPDOWN_ASSERT_IDS = new Set([
  "creditNoteRsn",
  "incoterms",
  "industrialClassification",
  "classificationIdentifier",
  "classificationScheme",
  "classifications",
  "country",
  "countryCode",
  "originCountry",
  "itemCountryOfOrigin",
  "countryOfOrigin",
  "unitOfMeasure",
  "invType",
  "invTxnType",
  "invCurrCode",
  "taxAccountingCurrency",
  "taxAccCurr",
  "taxAccountingCurrCode",
  "sourceCurrCode",
  "sourceCurrency",
  "meansType",
  "itemType",
  "peppolSchemeIdentifier",
  "schemeIdentifier",
  "sellerSchemeIdentifier",
  "buyerSchemeIdentifier",
  "identifierCode",
  "textualCode",
  "sellerIdentifierCode",
  "buyerIdentifierCode",
  "profitMarginItemType",
  "profitMarginItemTypeCode",
  "serviceTypeCode",
  "serviceAccountingCode",
  "itemSchemeIdentifier",
  "taxRateDtls[0].taxCategory",
  "taxRateDtls[0].exemptionReasonCode",
  "taxExemptionReasonCode",
  "exemptionReasonType",
  "docLevelCharges[0].vatCategory",
  "vatCategoryCharges",
  "docLevelCharges[0].exemptionReasonCode",
  "taxExemptionReasonCharges",
  "docLevelAllowances[0].vatCategory",
  "vatCategoryAllowances",
  "docLevelAllowances[0].exemptionReasonCode",
  "taxExemptionReasonAllowances",
]);

const DROPDOWN_STYLE_KINDS = new Set<OmnUiConditionalKind>([
  "creditDebitReason",
  "buyerIdOrVatin",
  "buyerAddress",
  "deliverToAddress",
  "industrialClassification",
]);

function isDropdownAssert(
  scenario: Pick<OmnUiConditionalScenario, "assertInputId" | "altInputIds">
): boolean {
  if (OMN_UI_DROPDOWN_ASSERT_IDS.has(scenario.assertInputId)) return true;
  return (scenario.altInputIds ?? []).some((id) => OMN_UI_DROPDOWN_ASSERT_IDS.has(id));
}

function isImportOfGoodsDropdownStyle(s: {
  invoiceTransactionTypeCode?: string;
  importDate?: string;
  customsDeclarationNumber?: string;
  expectedErrorField?: string;
}): boolean {
  const loc = locFor(s.expectedErrorField, CV_FIELD_LOC[CUSTOMS_DECLARATION_NUMBER_FIELD]);
  if (OMN_UI_DROPDOWN_ASSERT_IDS.has(loc.inputId)) return true;
  const isImportTxn = s.invoiceTransactionTypeCode === TXN_IMPORT_OF_GOODS;
  const isFullTaxPairing =
    s.invoiceTransactionTypeCode === TXN_FULL_TAX_INVOICE &&
    Boolean(s.importDate) &&
    !s.customsDeclarationNumber;
  return !isImportTxn && !isFullTaxPairing;
}

function locFor(field: string | undefined, fallback: CvFieldLoc): CvFieldLoc {
  return (field && CV_FIELD_LOC[field]) || fallback;
}

function isUiInvoicingPeriodSupported(title: string): boolean {
  return !/end is before period start|End Date Earlier Than Start Date/i.test(title);
}

const OMN_UI_CONDITIONAL_SCENARIOS_ALL: OmnUiConditionalScenario[] = [
  ...EXCHANGE_RATE_SCENARIOS.filter((s) => s.expectedErrorField === EXCHANGE_RATE_FIELD).map(
    (s) => {
      const loc = locFor(s.expectedErrorField, CV_FIELD_LOC[EXCHANGE_RATE_FIELD]);
      return {
        title: s.title,
        ruleId: s.ruleId,
        kind: "exchangeRate" as const,
        section: loc.section,
        shouldError: s.shouldError,
        assertInputId: loc.inputId,
        invoiceCurrencyCode: s.invoiceCurrencyCode,
        exchangeRate: s.exchangeRate,
      };
    }
  ),
  ...CREDIT_DEBIT_REASON_SCENARIOS.map((s) => {
    const loc = locFor(s.expectedErrorField, CV_FIELD_LOC[CREDIT_DEBIT_NOTE_REASON_CODE_FIELD]);
    return {
      title: s.title,
      ruleId: s.ruleId,
      kind: "creditDebitReason" as const,
      section: loc.section,
      shouldError: s.shouldError,
      assertInputId: loc.inputId,
      invoiceTypeCode: s.invoiceTypeCode,
      creditNoteReasonCode: s.creditDebitNoteReasonCode,
      precedingInvoiceReference: s.precedingInvoiceReference,
    };
  }),
  ...PRECEDING_INVOICE_SCENARIOS.map((s) => {
    const loc = locFor(s.expectedErrorField, CV_FIELD_LOC[PRECEDING_INVOICE_REFERENCE_FIELD]);
    return {
      title: s.title,
      ruleId: s.ruleId,
      kind: "precedingInvoice" as const,
      section: loc.section,
      shouldError: s.shouldError,
      assertInputId: loc.inputId,
      entries: OMN_UI_CREATE_ONLY,
      invoiceTypeCode: s.invoiceTypeCode,
      creditNoteReasonCode: s.creditDebitNoteReasonCode,
      precedingInvoiceReference: s.precedingInvoiceReference,
      precedingInvoiceIssueDate: s.precedingInvoiceIssueDate,
      precedingInvoiceUuid: s.precedingInvoiceUuid,
    };
  }),
  ...PROFIT_MARGIN_PRECEDING_SCENARIOS.map((s) => {
    const loc = locFor(s.expectedErrorField, CV_FIELD_LOC[PRECEDING_INVOICE_REFERENCE_FIELD]);
    return {
      title: s.title,
      ruleId: s.ruleId,
      kind: "precedingInvoice" as const,
      section: loc.section,
      shouldError: s.shouldError,
      assertInputId: loc.inputId,
      entries: OMN_UI_CREATE_ONLY,
      invoiceTransactionTypeCode: TXN_PROFIT_MARGIN_INVOICE,
      precedingInvoiceReference: s.precedingInvoiceReference,
      precedingInvoiceIssueDate: s.precedingInvoiceReference ? "2026-01-15" : "",
      precedingInvoiceUuid: s.precedingInvoiceUuid,
    };
  }),
  ...INVOICING_PERIOD_CONDITIONAL_SCENARIOS.filter((s) =>
    isUiInvoicingPeriodSupported(s.title)
  ).map((s) => {
    const loc = locFor(s.expectedErrorField, CV_FIELD_LOC[INVOICING_PERIOD_END_DATE_FIELD]);
    return {
      title: s.title,
      ruleId: s.ruleId,
      kind: "invoicingPeriod" as const,
      section: loc.section,
      shouldError: s.shouldError,
      assertInputId: loc.inputId,
      invoiceTransactionTypeCode: s.invoiceTransactionTypeCode,
      periodStart: s.periodStart,
      periodEnd: s.periodEnd,
    };
  }),
  ...IMPORT_OF_GOODS_SCENARIOS.map((s) => {
    const loc = locFor(s.expectedErrorField, CV_FIELD_LOC[CUSTOMS_DECLARATION_NUMBER_FIELD]);
    return {
      title: s.title,
      ruleId: s.ruleId,
      kind: "importOfGoods" as const,
      section: loc.section,
      shouldError: s.shouldError,
      assertInputId: loc.inputId,
      altInputIds: loc.altInputIds,
      dropdownStyle: isImportOfGoodsDropdownStyle(s),
      invoiceTransactionTypeCode: s.invoiceTransactionTypeCode,
      importDate: s.importDate,
      customsDeclarationNumber: s.customsDeclarationNumber,
      incoterms: s.incoterms,
      itemCountryOfOrigin: s.itemCountryOfOrigin,
    };
  }),
  ...SELLER_VAT_MANDATORY_SCENARIOS.map((s) => {
    const loc = locFor(s.expectedErrorField, CV_FIELD_LOC[SELLER_VAT_IDENTIFIER_FIELD]);
    return {
      title: s.title,
      ruleId: s.ruleId,
      kind: "sellerVat" as const,
      section: loc.section,
      shouldError: s.shouldError,
      assertInputId: loc.inputId,
      altInputIds: loc.altInputIds,
      invoiceTransactionTypeCode: s.invoiceTransactionTypeCode,
      sellerVatIdentifier: s.sellerVatIdentifier,
    };
  }),
  ...SELLER_ADDRESS_REQUIRED_SCENARIOS.map((s) => {
    const loc = locFor(s.expectedErrorField, CV_FIELD_LOC[SELLER_ADDRESS_LINE_1_FIELD]);
    return {
      title: s.title,
      ruleId: s.ruleId,
      kind: "sellerAddress" as const,
      section: loc.section,
      shouldError: s.shouldError,
      assertInputId: loc.inputId,
      altInputIds: loc.altInputIds,
      addressLine1: s.addressLine1,
      addressLine2: s.addressLine2,
      addressLine3: s.addressLine3,
      city: s.city,
      postCode: s.postCode,
    };
  }),
  ...THIRD_PARTY_REQUIRED_SCENARIOS.map((s) => {
    const loc = locFor(s.expectedErrorField, CV_FIELD_LOC[THIRD_PARTY_NAME_FIELD]);
    return {
      title: s.title,
      ruleId: s.ruleId,
      kind: "thirdPartyRequired" as const,
      section: loc.section,
      shouldError: s.shouldError,
      assertInputId: loc.inputId,
      altInputIds: loc.altInputIds,
      invoiceTransactionTypeCode: s.invoiceTransactionTypeCode,
      thirdPartyName: s.thirdPartyName,
      thirdPartyVatin: s.thirdPartyVatin,
      addressLine1: s.addressLine1,
      addressLine2: s.addressLine2,
      addressLine3: s.addressLine3,
      city: s.city,
      postCode: s.postalCode,
      countryCode: s.countryCode,
    };
  }),
  ...BUYER_ID_OR_VATIN_SCENARIOS.map((s) => {
    const loc = locFor(s.expectedErrorField, CV_FIELD_LOC[BUYER_VAT_IDENTIFIER_FIELD]);
    return {
      title: s.title,
      ruleId: s.ruleId,
      kind: "buyerIdOrVatin" as const,
      section: loc.section,
      shouldError: s.shouldError,
      assertInputId: loc.inputId,
      altInputIds: loc.altInputIds,
      invoiceTransactionTypeCode: s.invoiceTransactionTypeCode,
      buyerIdentifier: s.buyerIdentifier,
      buyerVatIdentifier: s.buyerVatIdentifier,
    };
  }),
  ...BUYER_ADDRESS_REQUIRED_SCENARIOS.map((s) => {
    const loc = locFor(s.expectedErrorField, CV_FIELD_LOC[BUYER_ADDRESS_LINE_1_FIELD]);
    return {
      title: s.title,
      ruleId: s.ruleId,
      kind: "buyerAddress" as const,
      section: loc.section,
      shouldError: s.shouldError,
      assertInputId: loc.inputId,
      altInputIds: loc.altInputIds,
      invoiceTypeCode: s.invoiceTypeCode,
      invoiceTransactionTypeCode: s.invoiceTransactionTypeCode,
      addressLine1: s.addressLine1,
      addressLine2: s.addressLine2,
      addressLine3: s.addressLine3,
      city: s.city,
      postCode: s.postCode,
    };
  }),
  ...DELIVER_TO_ADDRESS_REQUIRED_SCENARIOS.map((s) => {
    const loc = locFor(s.expectedErrorField, CV_FIELD_LOC[DELIVER_TO_ADDRESS_LINE_1_FIELD]);
    return {
      title: s.title,
      ruleId: s.ruleId,
      kind: "deliverToAddress" as const,
      section: loc.section,
      shouldError: s.shouldError,
      assertInputId: loc.inputId,
      altInputIds: loc.altInputIds,
      invoiceTypeCode: s.invoiceTypeCode,
      invoiceTransactionTypeCode: s.invoiceTransactionTypeCode,
      addressLine1: s.addressLine1,
      addressLine2: s.addressLine2,
      addressLine3: s.addressLine3,
      city: s.city,
      postCode: s.postCode,
      countrySubdivision: s.countrySubDivision,
      countryCode: s.countryCode,
    };
  }),
  ...INDUSTRIAL_CLASSIFICATION_REQUIRED_SCENARIOS.map((s) => {
    const loc = locFor(s.expectedErrorField, CV_FIELD_LOC[INDUSTRIAL_CLASSIFICATION_CODE_FIELD]);
    return {
      title: s.title,
      ruleId: s.ruleId,
      kind: "industrialClassification" as const,
      section: loc.section,
      shouldError: s.shouldError,
      assertInputId: loc.inputId,
      altInputIds: loc.altInputIds,
      invoiceTransactionTypeCode: s.invoiceTransactionTypeCode,
      industrialClassificationCode: s.industrialClassificationCode,
    };
  }),
  ...PREPAYMENT_PAID_AMOUNT_SCENARIOS.map((s) => {
    const loc = locFor(s.expectedErrorField, CV_FIELD_LOC["Prepayment invoice number"]);
    return {
      title: s.title,
      ruleId: s.ruleId,
      kind: "prepaymentPaidAmount" as const,
      section: loc.section,
      shouldError: s.shouldError,
      assertInputId: loc.inputId,
      altInputIds: loc.altInputIds,
      paidAmount: s.paidAmount,
      prepaymentInvoiceNumber: s.prepaymentInvoiceNumber,
      prepaymentInvoiceUuid: s.prepaymentInvoiceUuid,
    };
  }),
  {
    title: "Copied invoice number is empty until filled",
    section: "document",
    kind: "copyInvoiceNumberEmpty",
    shouldError: false,
    assertInputId: "invNum",
    entries: ["copy"],
  },
];

void OMAN_CURRENCY_USD;

/** All mapped conditionals, including dropdown-style rows. Each row is one test in the Conditional spec. */
export const OMN_UI_CONDITIONAL_SCENARIOS = OMN_UI_CONDITIONAL_SCENARIOS_ALL;

function scenariosFor(
  list: readonly OmnUiConditionalScenario[],
  entry: OmnUiEntry,
  section: OmnUiSection
): OmnUiConditionalScenario[] {
  return list.filter(
    (scenario) =>
      scenario.section === section && (!scenario.entries || scenario.entries.includes(entry))
  );
}

export function omnUiConditionalScenariosFor(
  entry: OmnUiEntry,
  section: OmnUiSection
): OmnUiConditionalScenario[] {
  return scenariosFor(OMN_UI_CONDITIONAL_SCENARIOS, entry, section);
}

export const OMN_UI_FORMULA_SCENARIOS = invoiceFormulaTestData.filter(
  (row) => !row.nonOmrOnly && !omnUiShowsProfitMarginTotalDue(row.invoiceTransactionTypeCode)
);

/** IBR-082-OM only — field is hidden unless txn is Profit Margin Invoice / Self-Invoice. */
export const OMN_UI_PROFIT_MARGIN_FORMULA_SCENARIOS = invoiceFormulaTestData.filter(
  (row) => !row.nonOmrOnly && omnUiShowsProfitMarginTotalDue(row.invoiceTransactionTypeCode)
);

/**
 * IBR-065-OM / IBT-111 — amount is omitted when tax accounting currency is OMR
 * (Excel writer also omits IBT-111 when invoice currency is OMR).
 */
export const OMN_UI_NON_OMR_FORMULA_SCENARIOS = invoiceFormulaTestData.filter(
  (row) => Boolean(row.nonOmrOnly)
);

export function omnUiShowsProfitMarginTotalDue(txnType: string | null | undefined): boolean {
  const normalized = String(txnType ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  return (
    normalized === TXN_PROFIT_MARGIN_INVOICE.toLowerCase() ||
    normalized === TXN_PROFIT_MARGIN_SELF_INVOICE.toLowerCase()
  );
}

/** Excel "Total Amount Due (Profit Margin)" — UI shows this only for profit-margin txn types (IBR-082-OM). */
export const OMN_UI_PROFIT_MARGIN_TOTAL_DUE = {
  excelField: "Total amount due (profit margin)",
  section: "invoice" as const,
  inputIds: [
    "totalAmtDueProfitMargin",
    "profitMarginDueAmt",
    "totalAmountDueProfitMargin",
  ] as const,
};

const OMN_UI_OMR_CURRENCY_LABELS = new Set([
  OMAN_CURRENCY_OMR.toLowerCase(),
  OMN_UI_CURRENCY_OMR.toLowerCase(),
]);

/** True when Tax Accounting Currency is not OMR / Rial Omani (IBT-111 amount is shown). */
export function omnUiShowsTaxInAccountingCurrencyAmount(
  taxAccountingCurrency: string | null | undefined
): boolean {
  const normalized = String(taxAccountingCurrency ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  if (!normalized) {
    return false;
  }
  return !OMN_UI_OMR_CURRENCY_LABELS.has(normalized);
}

/**
 * Excel "Invoice Total Tax Amount In Tax Accounting Currency" (IBT-111).
 * UI reflects a value only when Tax Accounting Currency is other than OMR.
 */
export const OMN_UI_TAX_IN_ACCOUNTING_CURRENCY_AMOUNT = {
  excelField: "Invoice Total Tax Amount In Tax Accounting Currency",
  section: "invoice" as const,
  inputIds: [
    "invoiceTotalTaxAccountingCurrency",
    "taxAmtInAccCurr",
    "taxAmountInAccountingCurrency",
    "ibt111",
  ] as const,
};

export const OMN_UI_ITEM_FORMULA_KEYS = [
  "itemPriceBaseQty",
  "itemGrossPrice",
  "itemPriceDiscount",
  "invoicedQty",
  "lineCharge",
  "lineAllowance",
  "taxRate",
] as const;

export const OMN_UI_INVOICE_FORMULA_KEYS = [
  "docCharges",
  "docAllowances",
  "paidAmount",
  "roundingAmount",
] as const;

export const OMN_UI_FORMULA_INPUT_CANDIDATES: Record<string, readonly string[]> = {
  itemPriceBaseQty: ["priceBaseQty"],
  itemGrossPrice: ["itemGrossPrice"],
  itemPriceDiscount: ["itemPriceDiscount", "invLinePriceDiscount"],
  invoicedQty: ["invoiceQty", "invoicedQty", "invQty"],
  lineCharge: ["chargesDtls[0].amount", "invLineChargeAmount"],
  lineAllowance: ["allowanceDtls[0].amount", "invLineAllowanceAmount"],
  taxRate: ["taxRateDtls[0].taxRate"],
  docCharges: ["docLevelCharges[0].amount", "docCharges"],
  docAllowances: ["docLevelAllowances[0].amount", "docAllowances"],
  paidAmount: ["paidAmt", "paidAmount"],
  roundingAmount: ["roundingAmt", "roundingAmount"],
  profitMarginTotalDue: [
    "totalAmtDueProfitMargin",
    "profitMarginDueAmt",
    "totalAmountDueProfitMargin",
  ],
  taxInAccountingCurrencyAmount: [
    "invoiceTotalTaxAccountingCurrency",
    "taxAmtInAccCurr",
    "taxAmountInAccountingCurrency",
    "ibt111",
  ],
};

export function headingForEntry(entry: OmnUiEntry): string {
  switch (entry) {
    case "create":
      return "Create Invoice UI";
    case "edit":
      return "Edit Invoice UI";
    case "copy":
      return "Copy Invoice UI";
  }
}

export function omnUiTestTitle(
  heading: string,
  section: OmnUiSection,
  condition: string,
  expectsError: boolean
): string {
  const outcome = expectsError ? "field error" : "accepted";
  return `${heading} | ${OMN_UI_SECTION_LABELS[section]} | ${condition} → ${outcome}`;
}

export function omnUiFormulaTestTitle(heading: string, scenarioName: string): string {
  return `${heading} | Formula | ${scenarioName} → calculated totals`;
}
