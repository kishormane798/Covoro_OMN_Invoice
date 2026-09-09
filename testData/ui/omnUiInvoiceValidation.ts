import {
  AMOUNT_DECIMAL_PRECISION_SCENARIOS,
  AMOUNT_QUANTITY_SIGN_SCENARIOS,
  BUYER_ADDRESS_LINE_1_FIELD,
  BUYER_ADDRESS_LINE_2_FIELD,
  BUYER_ADDRESS_LINE_3_FIELD,
  BUYER_ADDRESS_REQUIRED_SCENARIOS,
  BUYER_CITY_FIELD,
  BUYER_ID_OR_VATIN_SCENARIOS,
  BUYER_IDENTIFIER_FIELD,
  BUYER_IDENTIFIER_SCHEME_FIELD,
  BUYER_IDENTIFIER_SCHEME_SCENARIOS,
  BUYER_IDENTIFIER_TEXTUAL_CODE_FIELD,
  BUYER_POST_CODE_FIELD,
  BUYER_VAT_IDENTIFIER_FIELD,
  DOCUMENT_ALLOWANCE_CHARGE_RATE_SCENARIOS,
  DOCUMENT_ALLOWANCE_CHARGE_VAT_SCENARIOS,
  DOCUMENT_CHARGE_REASON_SCENARIOS,
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
  EXEMPT_FROM_TAX_TAX_CATEGORY_CODE,
  EXPORT_DELIVERY_SCENARIOS,
  EXPORT_DELIVER_COUNTRY_FORBIDDEN_OM_SCENARIOS,
  EXPORT_SERVICE_TYPE_SCENARIOS,
  EXPORT_SUPPORTING_DOCUMENT_SCENARIOS,
  INVOICED_ITEM_TAX_RATE_FIELD,
  NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE,
  IMPORT_DATE_FIELD,
  IMPORT_OF_GOODS_SCENARIOS,
  INCOTERMS_FIELD,
  INDUSTRIAL_CLASSIFICATION_CODE_FIELD,
  INDUSTRIAL_CLASSIFICATION_REQUIRED_SCENARIOS,
  GOODS_CLASSIFICATION_SCENARIOS,
  HS_CODE_FROM_ROP_LIST_SCENARIOS,
  HS_CODE_LENGTH_SCENARIOS,
  IBR_003_VALID_THIRD_PARTY_VATIN,
  IBR_CL_05_DOC_ALLOWANCE_SCENARIOS,
  INVOICE_TYPE_COMMERCIAL_INVOICE,
  INVOICE_TYPE_CREDIT_NOTE,
  INVOICE_TYPE_SELF_BILLED_CREDIT_NOTE,
  INVOICE_TYPE_SELF_BILLED_INVOICE,
  INVOICING_PERIOD_CONDITIONAL_SCENARIOS,
  INVOICING_PERIOD_END_DATE_FIELD,
  INVOICING_PERIOD_START_DATE_FIELD,
  ITEM_ATTRIBUTE_CONDITIONAL_SCENARIOS,
  ITEM_ATTRIBUTE_NAME_FIELD,
  ITEM_ATTRIBUTE_VALUE_FIELD,
  ITEM_COUNTRY_OF_ORIGIN_FIELD,
  ITEM_TYPE_GOODS,
  ITEM_TYPE_REQUIRED_SCENARIOS,
  OMAN_HS_CODE_12,
  CN_DN_SELF_BILLED_INVOICE_TYPES,
  PRECEDING_INVOICE_ISSUE_DATE_FIELD,
  PRECEDING_INVOICE_REFERENCE_FIELD,
  PRECEDING_INVOICE_SCENARIOS,
  PRECEDING_INVOICE_UUID_FIELD,
  PRECEDING_INVOICE_UUID_SAMPLE,
  PREPAYMENT_TXN_EXCLUSION_SCENARIOS,
  PROFIT_MARGIN_HS_PREFIX_SCENARIOS,
  PROFIT_MARGIN_ITEM_TYPE_SCENARIOS,
  PROFIT_MARGIN_SELF_INVOICE_SCENARIOS,
  PROFIT_MARGIN_PRECEDING_SCENARIOS,
  PREPAYMENT_PAID_AMOUNT_SCENARIOS,
  SELLER_ADDRESS_LINE_1_FIELD,
  SELLER_ADDRESS_LINE_2_FIELD,
  SELLER_ADDRESS_LINE_3_FIELD,
  SELLER_ADDRESS_REQUIRED_SCENARIOS,
  SELLER_CITY_FIELD,
  SELLER_IDENTIFIER_ICD_SCHEME_OMAN_VATIN,
  SELLER_POST_CODE_FIELD,
  SELLER_COUNTRY_RCM_SCENARIOS,
  SELLER_IDENTIFIER_SCHEME_SCENARIOS,
  SELLER_VAT_IDENTIFIER_FIELD,
  SELLER_VAT_MANDATORY_SCENARIOS,
  STANDARD_TAX_CATEGORY_CODE,
  STANDARD_TAX_RATE_SCENARIOS,
  TAX_CATEGORY_FIELD,
  TAX_EXEMPTION_REASON_CODE_FIELD,
  TAX_EXEMPTION_REASON_SAMPLE,
  TAX_EXEMPTION_REASON_TEXT_FIELD,
  TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE,
  TAX_RATE_STANDARD_OMAN,
  TAX_RATE_ZERO,
  VAT_ACCOUNTING_CURRENCY_STANDARD_RATE_SCENARIOS,
  VAT_BREAKDOWN_RATE_REQUIRED_SCENARIOS,
  VAT_CATEGORY_RATE_FORBIDDEN_SCENARIOS,
  VAT_EXEMPTION_REASON_CONDITIONAL_SCENARIOS,
  WHITESPACE_ONLY_FIELD_VALUE,
  ZERO_RATED_TAX_CATEGORY_CODE,
  ZERO_RATED_TAX_RATE_SCENARIOS,
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
  TXN_CONTINUOUS_SUPPLY,
  TXN_PROFIT_MARGIN_INVOICE,
  TXN_PROFIT_MARGIN_SELF_INVOICE,
  TXN_SELF_BILLED_INVOICE,
  TXN_SUMMARY_INVOICE,
  OMAN_COUNTRY_CODE,
  OMAN_CURRENCY_OMR,
  OMAN_CURRENCY_USD,
  SPECIAL_ZONE_COUNTRY_SUBDIVISION_CL13,
  SPECIAL_ZONE_COUNTRY_SUBDIVISION_SCENARIOS,
  SPECIAL_ZONE_SELLER_SCENARIOS,
  SELF_BILLED_BUYER_VAT_SCENARIOS,
  SELF_BILLED_RCM_BUYER_COUNTRY_SCENARIOS,
  SELF_BILLED_TXN_CONSTRAINT_SCENARIOS,
  SELF_BILLED_TXN_EXCLUSION_SCENARIOS,
  IBR_139_TXN_EXCLUSION_SCENARIOS,
  SUMMARY_TXN_EXCLUSION_SCENARIOS,
  CONTINUOUS_TXN_EXCLUSION_SCENARIOS,
  IBR_142_TXN_EXCLUSION_SCENARIOS,
  IBR_143_TXN_EXCLUSION_SCENARIOS,
  IBR_144_TXN_EXCLUSION_SCENARIOS,
  IBR_145_TXN_EXCLUSION_SCENARIOS,
  IBR_146_TXN_EXCLUSION_SCENARIOS,
  IBR_147_TXN_EXCLUSION_SCENARIOS,
  IBR_148_TXN_EXCLUSION_SCENARIOS,
  IBR_149_TXN_EXCLUSION_SCENARIOS,
  SELF_BILLED_OR_RCM_TXN_TYPES,
  btom001EnsureBaseTxnLabels,
  combineOmanTxnTypeDescriptions,
  splitOmanTxnMasterLabels,
  SUMMARY_INVOICE_PERIOD_SCENARIOS,
  SUMMARY_PERIOD_SAME_CALENDAR_MONTH_SCENARIOS,
  SPECIAL_ZONE_LICENSE_SCHEME,
  TXN_SPECIAL_ZONE_SUPPLIES,
  TAX_ACCOUNTING_CURRENCY_AMOUNT_SCENARIOS,
  VAT_BREAKDOWN_CATEGORY_PRESENCE_SCENARIOS,
  VAT_RATE_FORMAT_SCENARIOS,
  VATIN_PATTERN_SCENARIOS,
  PARTY_IDENTIFIER_COMPANION_SCENARIOS,
} from "../FieldValidations/ConditionalValidation";
import { buyerSellerIdentifierCodeValidTestData } from "../Master/Master.omnCore";
import {
  fieldInvoice_number,
  fieldValidationConditional,
  fieldValidationMandatory,
  fieldValidationOptional,
  formatOmanNumericBoundaryValue,
  invoiceFormulaTestData,
  invoiceNegativeFormulaTestData,
  type InvoiceFormulaScenario,
} from "../FieldValidations/Min_max_field_validation";
import { numericFieldConfigs } from "../../Helpers/excel/fieldValidationSpecSupport";
import {
  conditionalDropdownFieldMasterConfig,
  dropdownFieldMasterConfig,
} from "../FieldValidations/TestDataConfig";
import {
  PARTY_IDENTIFIER_LENGTH_CASES,
  type PartyIdentifierLengthCase,
} from "../FieldValidations/partyIdentifierCompanionLength";
import {
  CL06_OM_NEGATIVE_SCENARIOS,
  CL06_OM_POSITIVE_PACKS,
} from "../FieldValidations/buyerSellerIdentifierScheme";
import { IBR_082_OM_CASES } from "../../Helpers/excel/formulaValidationHelper";

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
/** ISIC label on `#industrialClassification` (autocomplete). Not the HS identifier. */
export const OMN_UI_INDUSTRIAL_CLASSIFICATION =
  INDUSTRIAL_CLASSIFICATION_REQUIRED_SCENARIOS[0].industrialClassificationCode;
export const OMN_UI_TAX_CATEGORY_STANDARD = STANDARD_TAX_CATEGORY_CODE;
export const OMN_UI_UNIT_OF_MEASURE = "each";
export const OMN_UI_PARTY_IDENTIFIER_SCHEME =
  SELLER_IDENTIFIER_ICD_SCHEME_OMAN_VATIN;
export const OMN_UI_PARTY_IDENTIFIER_TEXTUAL_CODE =
  buyerSellerIdentifierCodeValidTestData[0].label;

export const OMN_UI_PRECEDING_REF_ID = "proceedingDtls[0].invoiceReference";
export const OMN_UI_PRECEDING_DATE_ID = "proceedingDtls[0].invoiceIssueDate";
export const OMN_UI_PRECEDING_UUID_ID = "proceedingDtls[0].uniqueIdentifierNumber";

const OMN_UI_CREATE_ONLY: readonly OmnUiEntry[] = ["create"];
const CN_DN_261_TYPES = new Set<string>(CN_DN_SELF_BILLED_INVOICE_TYPES);

export type OmnUiEntry = "create" | "edit" | "copy";
export type OmnUiMinMaxVariant = "min" | "max" | "belowMin" | "aboveMax";
export type OmnUiMinMaxTxnContext = "fullTax" | "thirdParty";
export type OmnUiMinMaxCase = {
  variant: OmnUiMinMaxVariant;
  txnContext?: OmnUiMinMaxTxnContext;
};
export type OmnUiFieldKind = "text" | "digits" | "date" | "autocomplete";
/** Excel source of truth — never the UI asterisk. Conditional = optional until a PINT-OM row fires. */
export type OmnUiExcelPresence = "mandatory" | "optional" | "conditional";

export type OmnUiCatalogMode = "run" | "skip";

export const OMN_UI_SKIP = {
  noControl: (field: string) => `No Create Invoice control for ${field}.`,
  masterList:
    "UI does not replay the full field master list; one representative value is used on the form.",
  calculated: "This amount is calculated; the form does not let you enter it.",
  createOnly: "Create-only: Edit/Copy cannot set this the same way.",
  partyIdentity: "Worker identity is covered by the party-identity UI cases.",
  twentyLine:
    "UI does not replay the 20-line sweep; two lines cover multi-line entry.",
} as const;

export type OmnUiCatalogKind =
  | "pending"
  | "issueDate"
  | "numeric"
  | "partyIdentifierCompanion"
  | "cl06"
  | "dropdownInvalid"
  | "exemptionCompanion"
  | "formatContext"
  | "formulaNegative"
  | "formulaProfitMargin"
  | "formulaNonOmr"
  | "formulaTwoLine"
  | "formulaMismatch"
  | "txnExclusion";

export type OmnUiCatalogRow = {
  group: string;
  title: string;
  entries?: readonly OmnUiEntry[];
  mode: OmnUiCatalogMode;
  skipReason?: string;
  kind: OmnUiCatalogKind;
  field?: string;
  excelTitle?: string;
  numericValue?: string;
  expectsError?: boolean;
  partyIdentifierScenario?: PartyIdentifierLengthCase;
  cl06Party?: "buyer" | "seller";
  cl06Companion?: "scheme" | "code";
  cl06CompanionValue?: string;
  cl06Identifier?: string;
  vatContext?: "exempt" | "zero";
  exemptionCode?: string;
  exemptionText?: string;
  formulaScenario?: Omit<InvoiceFormulaScenario, "expect">;
  formulaFirstScenario?: Omit<InvoiceFormulaScenario, "expect">;
  invoiceTypeCode?: string;
  invoiceTransactionTypeCode?: string;
};

export function omnUiCatalogRowsFor(
  rows: readonly OmnUiCatalogRow[],
  entry: OmnUiEntry,
  group: string
): OmnUiCatalogRow[] {
  return rows.filter(
    (row) =>
      row.group === group && (!row.entries || row.entries.includes(entry))
  );
}

export function omnUiCatalogDisplayTitle(entry: OmnUiEntry, row: OmnUiCatalogRow): string {
  if (entry === "create") return row.title;
  return row.title
    .replaceAll("Then Save should succeed.", "Then Update should succeed.")
    .replaceAll(" — Save should succeed.", " — Update should succeed.");
}

export const OMN_UI_FIELD_CATALOG_GROUPS = [
  "Invoice Issue Date",
  "Party identifier — companion length",
  "CL-06-OM — Scheme Identifier and textual code masters",
  "Numeric fields — valid digit count",
  "Numeric fields — invalid digit count",
  "Invoice Currency dropdown",
  "Dropdown — valid values",
  "Dropdown — valid HS codes",
  "Dropdown — valid tax exemption reason (Zero rated)",
  "Dropdown — invalid values",
  "Dropdown — invalid tax exemption reason (charges/allowances companions)",
  "Tax exemption reason — code / text companion",
  "Format / context fields — VATIN, UUID, rate, FX, profit margin",
  "Invoice transaction type exclusion (IBR-138-OM … IBR-149-OM)",
] as const;

const issueDateRows: OmnUiCatalogRow[] = [
  {
    group: "Invoice Issue Date",
    title:
      "Invoice Issue Date format and whitespace cases pending UI date entry. (Invoice Issue Date)",
    mode: "skip",
    skipReason: OMN_UI_SKIP.noControl("Invoice Issue Date picker runner"),
    kind: "pending",
    field: "Invoice Issue Date",
  },
];

export type OmnUiNumericFieldLocation = {
  section: "item" | "invoice";
  inputId: string;
  altInputIds?: readonly string[];
};

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

const OMN_UI_ITEM_NUMERIC_FORMULA_KEYS: Record<string, string> = {
  "Item price base quantity": "itemPriceBaseQty",
  "Item gross price": "itemGrossPrice",
  "Item price discount": "itemPriceDiscount",
  "Invoiced quantity": "invoicedQty",
  "Invoice line charge amount": "lineCharge",
  "Invoice line allowance amount": "lineAllowance",
};

const OMN_UI_INVOICE_NUMERIC_FORMULA_KEYS: Record<string, string> = {
  "Charges on document level": "docCharges",
  "Allowances on document level": "docAllowances",
  "Paid amount": "paidAmount",
  "Rounding amount": "roundingAmount",
};

const OMN_UI_CALCULATED_NUMERIC_FIELDS = new Set<string>([
  "Item net price",
  "Invoice line net amount",
  "Line item VAT amount",
  "Total amount including VAT",
  "Sum of Invoice line net amount",
  "Invoice total amount without tax",
  "Invoice total tax amount",
  "Invoice total amount with tax",
  "Amount due for payment",
]);

export function omnUiNumericFieldLocation(
  field: string
): OmnUiNumericFieldLocation | undefined {
  const itemKey = OMN_UI_ITEM_NUMERIC_FORMULA_KEYS[field];
  const invoiceKey = OMN_UI_INVOICE_NUMERIC_FORMULA_KEYS[field];
  const formulaKey = itemKey ?? invoiceKey;
  const [inputId, ...altInputIds] =
    (formulaKey ? OMN_UI_FORMULA_INPUT_CANDIDATES[formulaKey] : undefined) ?? [];
  if (!inputId) return undefined;
  return {
    section: itemKey ? "item" : "invoice",
    inputId,
    ...(altInputIds.length ? { altInputIds } : {}),
  };
}

type NumericConfig = (typeof numericFieldConfigs)[number];

function numericCatalogMode(
  config: NumericConfig
): Pick<OmnUiCatalogRow, "mode" | "skipReason"> {
  if (OMN_UI_CALCULATED_NUMERIC_FIELDS.has(config.field)) {
    return { mode: "skip", skipReason: OMN_UI_SKIP.calculated };
  }
  if (!omnUiNumericFieldLocation(config.field)) {
    return {
      mode: "skip",
      skipReason: OMN_UI_SKIP.noControl(config.field),
    };
  }
  return { mode: "run" };
}

function numericCatalogRow(
  group: "Numeric fields — valid digit count" | "Numeric fields — invalid digit count",
  config: NumericConfig,
  title: string,
  numericValue: string,
  expectsError: boolean
): OmnUiCatalogRow {
  return {
    group,
    title,
    ...numericCatalogMode(config),
    kind: "numeric",
    field: config.field,
    numericValue,
    expectsError,
  };
}

function numericPersistTitle(expectsError?: boolean): string {
  return expectsError ? "the form should show an error" : "Save should succeed";
}

const numericValidRows: OmnUiCatalogRow[] = numericFieldConfigs.flatMap((config) => {
  const decimals = config.decimals ?? 2;
  const minValue = formatOmanNumericBoundaryValue(config.min, decimals);
  const maxValue = formatOmanNumericBoundaryValue(config.max, decimals);
  const rows = [
    numericCatalogRow(
      "Numeric fields — valid digit count",
      config,
      `${config.field} at minimum value (${minValue}) — ${numericPersistTitle(config.minExpectsError)}. (${config.field})`,
      minValue,
      Boolean(config.minExpectsError)
    ),
    numericCatalogRow(
      "Numeric fields — valid digit count",
      config,
      `${config.field} at maximum digits (${config.max}) — ${numericPersistTitle(config.maxExpectsError)}. (${config.field})`,
      maxValue,
      Boolean(config.maxExpectsError)
    ),
  ];

  if (config.belowMin === 0 && !config.omitEmptyTest) {
    rows.push(
      numericCatalogRow(
        "Numeric fields — valid digit count",
        config,
        `An empty ${config.field} — ${numericPersistTitle(config.emptyExpectsError)}. (${config.field})`,
        "",
        Boolean(config.emptyExpectsError)
      )
    );
  }

  if (config.allowsNegative) {
    const negativeValue = `-${minValue}`;
    rows.push(
      numericCatalogRow(
        "Numeric fields — valid digit count",
        config,
        `${config.field} with negative value (${negativeValue}) — Save should succeed. (${config.field})`,
        negativeValue,
        false
      )
    );
  }
  return rows;
});

const numericInvalidRows: OmnUiCatalogRow[] = numericFieldConfigs.map((config) =>
  numericCatalogRow(
    "Numeric fields — invalid digit count",
    config,
    `${config.field} of ${config.aboveMax} digits — the form should show an error. (${config.field})`,
    formatOmanNumericBoundaryValue(config.aboveMax, config.decimals ?? 2),
    true
  )
);

const partyIdentifierCompanionRows: OmnUiCatalogRow[] =
  PARTY_IDENTIFIER_LENGTH_CASES.map((scenario) => ({
    group: "Party identifier — companion length",
    title: `${scenario.identifierField} with ${scenario.titleSuffix} — ${
      scenario.shouldAccept
        ? "Save should succeed"
        : "the form should show an error"
    }. (${scenario.identifierField})`,
    mode: "run",
    kind: "partyIdentifierCompanion",
    field: scenario.identifierField,
    expectsError: !scenario.shouldAccept,
    partyIdentifierScenario: scenario,
  }));

const CL06_UI_GROUP =
  "CL-06-OM — Scheme Identifier and textual code masters";

const cl06Rows: OmnUiCatalogRow[] = [
  ...CL06_OM_POSITIVE_PACKS.map((pack) => {
    const companionValue = pack.master[0]?.label;
    if (!companionValue) {
      throw new Error(`CL-06 master is empty for ${pack.companionField}`);
    }
    return {
      group: CL06_UI_GROUP,
      title: pack.title.replace(
        "Then the invoice should be accepted.",
        "Then Save should succeed."
      ),
      mode: "run" as const,
      kind: "cl06" as const,
      field: pack.companionField,
      expectsError: false,
      cl06Party: pack.party,
      cl06Companion: pack.companion,
      cl06CompanionValue: companionValue,
      cl06Identifier: pack.identifier,
    };
  }),
  ...CL06_OM_NEGATIVE_SCENARIOS.map((scenario) => ({
    group: CL06_UI_GROUP,
    title: scenario.title.replace(
      "Then the invoice should be rejected with an error.",
      "Then the form should show an error."
    ),
    mode: "run" as const,
    kind: "cl06" as const,
    field: scenario.expectedErrorField,
    expectsError: true,
    cl06Party: scenario.party,
    cl06Companion: scenario.companion,
    cl06CompanionValue: scenario.companionValue,
    cl06Identifier: scenario.identifier,
  })),
  {
    group: CL06_UI_GROUP,
    title:
      "Remaining CL-06 scheme and textual code master values are covered by one representative UI selection per field. (CL-06-OM)",
    mode: "skip",
    skipReason: OMN_UI_SKIP.masterList,
    kind: "cl06",
  },
];

const exemptionCompanionRows: OmnUiCatalogRow[] = [
  {
    group: "Tax exemption reason — code / text companion",
    title:
      "Exempt VAT with exemption code and no text — Save should succeed. (Tax exemption reason text)",
    mode: "run",
    kind: "exemptionCompanion",
    field: TAX_EXEMPTION_REASON_TEXT_FIELD,
    exemptionCode: TAX_EXEMPTION_REASON_SAMPLE,
    exemptionText: "",
    expectsError: false,
  },
  {
    group: "Tax exemption reason — code / text companion",
    title:
      "Exempt VAT with exemption text and no code — the form should show an error. (Tax exemption reason code)",
    mode: "run",
    kind: "exemptionCompanion",
    field: TAX_EXEMPTION_REASON_CODE_FIELD,
    exemptionCode: "",
    exemptionText: "Exempt supply under Oman VAT",
    expectsError: true,
  },
];

const OMN_UI_TXN_EXCLUSION_GROUP =
  "Invoice transaction type exclusion (IBR-138-OM … IBR-149-OM)";
const OMN_UI_TXN_EXCLUSION_FORMULA_GROUP =
  "Invoice transaction type exclusion — formula (IBR-138-OM … IBR-149-OM)";

type TxnExclusionSource = {
  title: string;
  ruleId: string;
  shouldError: boolean;
  invoiceTransactionTypeCode: string;
};

function uiInvoiceTypeForTxnCell(cell: string): string {
  const labels = splitOmanTxnMasterLabels(cell);
  if (
    labels.some((label) =>
      (SELF_BILLED_OR_RCM_TXN_TYPES as readonly string[]).includes(label)
    )
  ) {
    return INVOICE_TYPE_SELF_BILLED_INVOICE;
  }
  return INVOICE_TYPE_COMMERCIAL_INVOICE;
}

/** Field/formula success cells: companion txn types must include Full Tax or Simplified. */
function uiTxnCellWithAllowedCompanions(cell: string): string {
  return combineOmanTxnTypeDescriptions(
    ...btom001EnsureBaseTxnLabels(splitOmanTxnMasterLabels(cell))
  );
}

function uniqueUiTxnExclusionSources(
  sources: readonly TxnExclusionSource[]
): TxnExclusionSource[] {
  const seen = new Set<string>();
  const out: TxnExclusionSource[] = [];
  for (const source of sources) {
    const key = `${source.ruleId}|${source.invoiceTransactionTypeCode}|${source.shouldError}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(source);
  }
  return out;
}

const txnExclusionFieldRows: OmnUiCatalogRow[] = uniqueUiTxnExclusionSources([
  ...SELF_BILLED_TXN_EXCLUSION_SCENARIOS,
  ...IBR_139_TXN_EXCLUSION_SCENARIOS,
  ...SUMMARY_TXN_EXCLUSION_SCENARIOS,
  ...CONTINUOUS_TXN_EXCLUSION_SCENARIOS,
  ...IBR_142_TXN_EXCLUSION_SCENARIOS,
  ...IBR_143_TXN_EXCLUSION_SCENARIOS,
  ...IBR_144_TXN_EXCLUSION_SCENARIOS,
  ...IBR_145_TXN_EXCLUSION_SCENARIOS,
  ...IBR_146_TXN_EXCLUSION_SCENARIOS,
  ...IBR_147_TXN_EXCLUSION_SCENARIOS,
  ...IBR_148_TXN_EXCLUSION_SCENARIOS,
  ...IBR_149_TXN_EXCLUSION_SCENARIOS,
]).map((source) => ({
  group: OMN_UI_TXN_EXCLUSION_GROUP,
  title: source.title
    .replace(/ \| Invoice Type: .+? \((IBR-\d+-OM)\)$/, " ($1)")
    .replace("When the invoice is uploaded", "When the form is saved")
    .replace("Then the invoice should be accepted.", "Then Save should succeed.")
    .replace(
      "Then the invoice should be rejected with an error.",
      "Then that transaction type checkbox should be disabled."
    ),
  mode: "run" as const,
  kind: "txnExclusion" as const,
  field: "Invoice Transaction Type Code",
  expectsError: source.shouldError,
  invoiceTypeCode: uiInvoiceTypeForTxnCell(source.invoiceTransactionTypeCode),
  invoiceTransactionTypeCode: source.shouldError
    ? source.invoiceTransactionTypeCode
    : uiTxnCellWithAllowedCompanions(source.invoiceTransactionTypeCode),
}));

const txnExclusionFormulaRows: OmnUiCatalogRow[] = txnExclusionFieldRows
  .filter((row) => !row.expectsError)
  .map((row) => ({
    ...row,
    group: OMN_UI_TXN_EXCLUSION_FORMULA_GROUP,
    title: row.title.replace(
      "When the form is saved",
      "When calculated totals match"
    ),
    formulaScenario: invoiceFormulaTestData[0],
  }));

export const OMN_UI_FIELD_CATALOG: OmnUiCatalogRow[] = [
  ...issueDateRows,
  ...partyIdentifierCompanionRows,
  ...cl06Rows,
  ...numericValidRows,
  ...numericInvalidRows,
  {
    group: "Invoice Currency dropdown",
    title: "Invoice Currency master list. (Invoice Currency Code)",
    mode: "skip",
    skipReason: OMN_UI_SKIP.masterList,
    kind: "pending",
    field: "Invoice Currency Code",
  },
  {
    group: "Dropdown — valid values",
    title: "Valid dropdown master lists. (dropdown)",
    mode: "skip",
    skipReason: OMN_UI_SKIP.masterList,
    kind: "pending",
  },
  {
    group: "Dropdown — valid HS codes",
    title: "HS code master list. (Item classification identifier)",
    mode: "skip",
    skipReason: OMN_UI_SKIP.masterList,
    kind: "pending",
    field: "Item classification identifier",
  },
  {
    group: "Dropdown — valid tax exemption reason (Zero rated)",
    title: "Zero rated exemption reason master list. (Tax exemption reason code)",
    mode: "skip",
    skipReason: OMN_UI_SKIP.masterList,
    kind: "pending",
    field: "Tax exemption reason code",
  },
  {
    group: "Dropdown — invalid values",
    title: "Invalid dropdown values pending UI select. (dropdown)",
    mode: "skip",
    skipReason: OMN_UI_SKIP.noControl("invalid dropdown runner"),
    kind: "pending",
  },
  {
    group: "Dropdown — invalid tax exemption reason (charges/allowances companions)",
    title:
      "Invalid tax exemption reason (charges/allowances companions) pending UI select. (dropdown)",
    mode: "skip",
    skipReason: OMN_UI_SKIP.noControl("exemption companion dropdown runner"),
    kind: "pending",
  },
  ...exemptionCompanionRows,
  {
    group: "Format / context fields — VATIN, UUID, rate, FX, profit margin",
    title: "Format/context fields pending UI entry. (format)",
    mode: "skip",
    skipReason: OMN_UI_SKIP.noControl("format context runner"),
    kind: "pending",
  },
  ...txnExclusionFieldRows,
];

export const OMN_UI_FORMULA_CATALOG_GROUPS = [
  "Invalid inputs",
  "Calculated field mismatch",
  "Calculated field tolerance",
  "Exempt VAT category taxable amount (ALIGNED-IBRP-E-08-OM)",
  "Not subject VAT category taxable amount (ALIGNED-IBRP-O-08-OM)",
  "Standard VAT category taxable amount (ALIGNED-IBRP-S-08-OM)",
  "Zero rated VAT category taxable amount (ALIGNED-IBRP-Z-08-OM)",
  "Profit Margin Total Amount Due (IBR-082-OM)",
  "Non-OMR tax in accounting currency (IBT-111)",
  "Item net price and line net formulas (IBR-075-OM / IBR-071-OM)",
  "Multi-line (2 lines) — same tax category",
  "Multi-line (20 lines) — positive (OMR)",
  "Invoice transaction type exclusion — formula (IBR-138-OM … IBR-149-OM)",
] as const;

const negativeFormulaRows: OmnUiCatalogRow[] = invoiceNegativeFormulaTestData.map(
  (scenario) => {
    const noEditableControl = scenario.errorField === "Tax Rate";
    return {
      group: "Invalid inputs",
      title: omnUiFormulaDisplayTitle("create", scenario.name, true),
      mode: noEditableControl ? "skip" : "run",
      ...(noEditableControl
        ? { skipReason: OMN_UI_SKIP.noControl(scenario.errorField) }
        : {}),
      kind: "formulaNegative",
      excelTitle: scenario.name,
      formulaScenario: scenario,
      expectsError: true,
    };
  }
);

const profitMarginFormulaRows: OmnUiCatalogRow[] = IBR_082_OM_CASES.map(
  (scenario) => ({
    group: "Profit Margin Total Amount Due (IBR-082-OM)",
    title: scenario.title,
    mode: "skip",
    skipReason: OMN_UI_SKIP.calculated,
    kind: "formulaProfitMargin",
    expectsError: scenario.shouldError,
  })
);

const nonOmrFormulaRows: OmnUiCatalogRow[] = invoiceFormulaTestData
  .filter((scenario) => Boolean(scenario.nonOmrOnly))
  .map((scenario) => ({
    group: "Non-OMR tax in accounting currency (IBT-111)",
    title: omnUiFormulaDisplayTitle("create", scenario.name),
    mode: "run",
    kind: "formulaNonOmr",
    formulaScenario: scenario,
  }));

const lineNetFormulaRows: OmnUiCatalogRow[] = [
  {
    group: "Item net price and line net formulas (IBR-075-OM / IBR-071-OM)",
    title:
      "Given Item Net Price — When it matches gross price minus discount — Then the invoice should be accepted. (IBR-075-OM)",
    mode: "run",
    kind: "formulaNegative",
    formulaScenario: {
      name: "IBR-075-OM valid net = gross − discount",
      itemPriceBaseQty: 1,
      itemGrossPrice: 1000,
      itemPriceDiscount: 100,
      invoicedQty: 1,
      lineCharge: 0,
      lineAllowance: 0,
      taxRate: 5,
      docCharges: 0,
      docAllowances: 0,
      paidAmount: 0,
      roundingAmount: 0,
    },
    expectsError: false,
  },
  {
    group: "Item net price and line net formulas (IBR-075-OM / IBR-071-OM)",
    title:
      "Given Item Net Price — When it does not match gross price minus discount — Then the invoice should be rejected with an error. (IBR-075-OM)",
    mode: "skip",
    skipReason: OMN_UI_SKIP.calculated,
    kind: "formulaMismatch",
  },
  {
    group: "Item net price and line net formulas (IBR-075-OM / IBR-071-OM)",
    title:
      "Given Invoice Line Net Amount — When it matches the formula — Then the invoice should be accepted. (IBR-071-OM)",
    mode: "run",
    kind: "formulaNegative",
    formulaScenario: {
      name: "IBR-071-OM valid line net with charge and allowance",
      itemPriceBaseQty: 1,
      itemGrossPrice: 1000,
      itemPriceDiscount: 0,
      invoicedQty: 2,
      lineCharge: 10,
      lineAllowance: 5,
      taxRate: 5,
      docCharges: 0,
      docAllowances: 0,
      paidAmount: 0,
      roundingAmount: 0,
    },
    expectsError: false,
  },
  {
    group: "Item net price and line net formulas (IBR-075-OM / IBR-071-OM)",
    title:
      "Given Invoice Line Net Amount — When it does not match the formula — Then the invoice should be rejected with an error. (IBR-071-OM)",
    mode: "skip",
    skipReason: OMN_UI_SKIP.calculated,
    kind: "formulaMismatch",
  },
];

const twoLineFormulaRows: OmnUiCatalogRow[] = [
  ...invoiceFormulaTestData.map((scenario) => ({ scenario, expectsError: false })),
  ...invoiceNegativeFormulaTestData.map((scenario) => ({ scenario, expectsError: true })),
].map(({ scenario, expectsError }) => ({
  group: "Multi-line (2 lines) — same tax category",
  title: omnUiFormulaDisplayTitle(
    "create",
    `${scenario.name} on two lines`,
    expectsError
  ),
  mode: "run",
  kind: "formulaTwoLine",
  formulaScenario: scenario,
  formulaFirstScenario: expectsError ? invoiceFormulaTestData[0] : scenario,
  expectsError,
}));

export const OMN_UI_FORMULA_CATALOG: OmnUiCatalogRow[] = [
  ...negativeFormulaRows,
  {
    group: "Calculated field mismatch",
    title:
      "Given Calculated field mismatch — When calculated totals match — Then Save should succeed. (Calculated field mismatch)",
    mode: "skip",
    skipReason: OMN_UI_SKIP.calculated,
    kind: "formulaMismatch",
  },
  {
    group: "Calculated field tolerance",
    title:
      "Given Calculated field tolerance — When calculated totals match — Then Save should succeed. (Calculated field tolerance)",
    mode: "skip",
    skipReason: OMN_UI_SKIP.calculated,
    kind: "formulaMismatch",
  },
  {
    group: "Exempt VAT category taxable amount (ALIGNED-IBRP-E-08-OM)",
    title:
      "Given Exempt VAT category taxable amount (ALIGNED-IBRP-E-08-OM) — When calculated totals match — Then Save should succeed. (Exempt VAT category taxable amount (ALIGNED-IBRP-E-08-OM))",
    mode: "skip",
    skipReason: OMN_UI_SKIP.calculated,
    kind: "formulaMismatch",
  },
  {
    group: "Not subject VAT category taxable amount (ALIGNED-IBRP-O-08-OM)",
    title:
      "Given Not subject VAT category taxable amount (ALIGNED-IBRP-O-08-OM) — When calculated totals match — Then Save should succeed. (Not subject VAT category taxable amount (ALIGNED-IBRP-O-08-OM))",
    mode: "skip",
    skipReason: OMN_UI_SKIP.calculated,
    kind: "formulaMismatch",
  },
  {
    group: "Standard VAT category taxable amount (ALIGNED-IBRP-S-08-OM)",
    title:
      "Given Standard VAT category taxable amount (ALIGNED-IBRP-S-08-OM) — When calculated totals match — Then Save should succeed. (Standard VAT category taxable amount (ALIGNED-IBRP-S-08-OM))",
    mode: "skip",
    skipReason: OMN_UI_SKIP.calculated,
    kind: "formulaMismatch",
  },
  {
    group: "Zero rated VAT category taxable amount (ALIGNED-IBRP-Z-08-OM)",
    title:
      "Given Zero rated VAT category taxable amount (ALIGNED-IBRP-Z-08-OM) — When calculated totals match — Then Save should succeed. (Zero rated VAT category taxable amount (ALIGNED-IBRP-Z-08-OM))",
    mode: "skip",
    skipReason: OMN_UI_SKIP.calculated,
    kind: "formulaMismatch",
  },
  ...profitMarginFormulaRows,
  ...nonOmrFormulaRows,
  ...lineNetFormulaRows,
  ...twoLineFormulaRows,
  {
    group: "Multi-line (20 lines) — positive (OMR)",
    title:
      "Given Multi-line (20 lines) — positive (OMR) — When calculated totals match — Then Save should succeed. (Multi-line (20 lines) — positive (OMR))",
    mode: "skip",
    skipReason: OMN_UI_SKIP.twentyLine,
    kind: "pending",
  },
  ...txnExclusionFormulaRows,
];

export const OMN_UI_CONDITIONAL_PENDING_GROUPS = [
  "Tax accounting currency amount required (ibr-053)",
  "VAT rate numeric format (IBR-046-OM)",
  "Document level charge reason code (IBR-042-OM)",
  "Line item VAT amount required (IBR-038-OM)",
  "Line VAT amount zero for Exempt (IBR-039-OM)",
  "Line VAT amount zero for Not subject and Zero rated (IBR-054/077-OM)",
  "Exempt VAT category tax amount must be zero (ALIGNED-IBRP-E-09-OM)",
  "Not subject VAT category tax amount must be zero (ALIGNED-IBRP-O-09-OM)",
  "Zero rated VAT category tax amount must be zero (ALIGNED-IBRP-Z-09-OM)",
] as const;

const OMN_UI_CALCULATED_PENDING_GROUPS = new Set<string>([
  "Line item VAT amount required (IBR-038-OM)",
  "Line VAT amount zero for Exempt (IBR-039-OM)",
  "Line VAT amount zero for Not subject and Zero rated (IBR-054/077-OM)",
  "Exempt VAT category tax amount must be zero (ALIGNED-IBRP-E-09-OM)",
  "Not subject VAT category tax amount must be zero (ALIGNED-IBRP-O-09-OM)",
  "Zero rated VAT category tax amount must be zero (ALIGNED-IBRP-Z-09-OM)",
]);

export const OMN_UI_CONDITIONAL_PENDING_CATALOG: OmnUiCatalogRow[] = [
  ...TAX_ACCOUNTING_CURRENCY_AMOUNT_SCENARIOS.map((scenario) => ({
    group: "Tax accounting currency amount required (ibr-053)",
    title: scenario.title,
    mode: "skip" as const,
    skipReason: OMN_UI_SKIP.calculated,
    kind: "pending" as const,
  })),
  ...DOCUMENT_CHARGE_REASON_SCENARIOS.map((scenario) => ({
    group: "Document level charge reason code (IBR-042-OM)",
    title: scenario.title,
    mode: "skip" as const,
    skipReason: OMN_UI_SKIP.noControl("Document level charge reason code"),
    kind: "pending" as const,
  })),
  ...VAT_RATE_FORMAT_SCENARIOS.map((scenario) => ({
    group: "VAT rate numeric format (IBR-046-OM)",
    title: scenario.title,
    mode: "skip" as const,
    skipReason: OMN_UI_SKIP.noControl("editable Tax Rate"),
    kind: "pending" as const,
  })),
  ...OMN_UI_CONDITIONAL_PENDING_GROUPS.filter(
    (group) =>
      group !== "Tax accounting currency amount required (ibr-053)" &&
      group !== "VAT rate numeric format (IBR-046-OM)" &&
      group !== "Document level charge reason code (IBR-042-OM)"
  ).map((group) => ({
    group,
    title: group,
    mode: "skip",
    skipReason: OMN_UI_CALCULATED_PENDING_GROUPS.has(group)
      ? OMN_UI_SKIP.calculated
      : OMN_UI_SKIP.noControl(`${group} runner`),
    kind: "pending",
  })),
];

export const OMN_UI_CONDITIONAL_SKIP_GROUPS = OMN_UI_CONDITIONAL_PENDING_GROUPS;

export const OMN_UI_CONDITIONAL_SKIP_CATALOG: OmnUiCatalogRow[] =
  OMN_UI_CONDITIONAL_PENDING_CATALOG;

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
  /** Disabled / autopopulated on the form — not min/max length. */
  noEditableControl?: boolean;
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
    noEditableControl?: boolean;
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
    noEditableControl: options?.noEditableControl,
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
    // Tax Rate is disabled and autopopulated; length is Excel-only.
    noEditableControl: true,
  }),
  dropdownRule("Tax exemption reason code", "item", "taxExemptionRsnType", {
    altInputIds: [
      "taxRateDtls[0].exemptionReasonCode",
      "taxExemptionReasonCode",
      "exemptionReasonType",
    ],
  }),
  fromExcel(
    "Tax exemption reason text",
    "item",
    "taxExemptionRsn",
    fieldValidationOptional,
    { altInputIds: ["taxRateDtls[0].exemptionReason", "taxExemptionReason"] }
  ),
  fromExcel("Item Custom 1", "item", "custom1", fieldValidationOptional),
  fromExcel("Item Custom 2", "item", "custom2", fieldValidationOptional),

  dropdownRule("Vat category - charges", "invoice", "docLevelCharges[0].vatCategory", {
    altInputIds: ["vatCategoryCharges"],
  }),
  dropdownRule("Tax exemption reason - charges", "invoice", "docLevelCharges[0].exemptionRsn", {
    altInputIds: [
      "docLevelCharges[0].exemptionReasonCode",
      "taxExemptionReasonCharges",
      "docLevelCharges[0].exemptionReasonType",
    ],
  }),
  dropdownRule("Vat category - allowances", "invoice", "docLevelAllowances[0].vatCategory", {
    altInputIds: ["vatCategoryAllowances"],
  }),
  dropdownRule(
    "Tax exemption reason - allowances",
    "invoice",
    "docLevelAllowances[0].exemptionRsn",
    {
      altInputIds: [
        "docLevelAllowances[0].exemptionReasonCode",
        "taxExemptionReasonAllowances",
        "docLevelAllowances[0].exemptionReasonType",
      ],
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
      !rule.noEditableControl &&
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

function lengthNoun(n: number): string {
  return n === 1 ? "character" : "characters";
}

function isOmanVatinLengthField(rule: OmnUiFieldRule): boolean {
  return rule.field === THIRD_PARTY_VATIN_FIELD;
}

function isThirdPartyEmptyOptionalField(rule: OmnUiFieldRule): boolean {
  return rule.section === "thirdParty" && rule.belowMin === 0;
}

/** IBR-003-OM: VATIN is OM + digits, never a 12-character letter string. */
export function omnUiVatinOfLength(
  length: number,
  valid = IBR_003_VALID_THIRD_PARTY_VATIN
): string {
  if (length <= 0) return "";
  if (length <= valid.length) return valid.slice(0, length);
  return valid + "0".repeat(length - valid.length);
}

/** Min and max are the same length for Third Party VATIN — keep one valid-length case. */
export function omnUiMinMaxVariantsFor(
  rule: OmnUiFieldRule
): readonly OmnUiMinMaxVariant[] {
  if (isOmanVatinLengthField(rule) && rule.min === rule.max) {
    return OMN_UI_MIN_MAX_VARIANTS.filter((variant) => variant !== "max");
  }
  return OMN_UI_MIN_MAX_VARIANTS;
}

/** Empty Third Party fields: Full Tax saves; Third-party invoice errors. */
export function omnUiMinMaxCasesFor(rule: OmnUiFieldRule): readonly OmnUiMinMaxCase[] {
  return omnUiMinMaxVariantsFor(rule).flatMap((variant) => {
    if (variant === "belowMin" && isThirdPartyEmptyOptionalField(rule)) {
      return [
        { variant, txnContext: "fullTax" },
        { variant, txnContext: "thirdParty" },
      ];
    }
    return [{ variant }];
  });
}

export function isOmnUiEmptyThirdPartyOnFullTax(
  rule: OmnUiFieldRule,
  variant: OmnUiMinMaxVariant,
  txnContext?: OmnUiMinMaxTxnContext
): boolean {
  return (
    isThirdPartyEmptyOptionalField(rule) &&
    variant === "belowMin" &&
    txnContext !== "thirdParty"
  );
}

export function omnUiMinMaxWhatEntered(
  variant: OmnUiMinMaxVariant,
  rule: OmnUiFieldRule,
  txnContext?: OmnUiMinMaxTxnContext
): string {
  if (isOmanVatinLengthField(rule) && variant === "min" && rule.min === rule.max) {
    return `${rule.field} of OM plus 10 digits`;
  }
  if (isThirdPartyEmptyOptionalField(rule) && variant === "belowMin") {
    return txnContext === "thirdParty"
      ? `An empty ${rule.field} on a Third-party invoice`
      : `An empty ${rule.field} on a Full Tax invoice`;
  }
  switch (variant) {
    case "min":
      return `${rule.field} at minimum length (${rule.min} ${lengthNoun(rule.min)})`;
    case "max":
      return `${rule.field} at maximum length (${rule.max} characters)`;
    case "belowMin":
      return rule.belowMin === 0
        ? `An empty ${rule.field}`
        : `${rule.field} of ${rule.belowMin} characters`;
    case "aboveMax":
      return `${rule.field} of ${rule.aboveMax} characters`;
  }
}

export function omnUiMinMaxExpectsError(
  rule: OmnUiFieldRule,
  variant: OmnUiMinMaxVariant,
  txnContext?: OmnUiMinMaxTxnContext
): boolean {
  if (variant === "aboveMax") return true;
  if (variant === "belowMin" && isThirdPartyEmptyOptionalField(rule)) {
    return txnContext === "thirdParty";
  }
  if (variant === "belowMin") return rule.requiredOnForm || rule.belowMin > 0;
  return false;
}

export function omnUiMinMaxDisplayTitle(
  entry: OmnUiEntry,
  variant: OmnUiMinMaxVariant,
  rule: OmnUiFieldRule,
  txnContext?: OmnUiMinMaxTxnContext
): string {
  const expectsError = omnUiMinMaxExpectsError(rule, variant, txnContext);
  const persist =
    expectsError
      ? "the form should show an error"
      : entry === "create"
        ? "Save should succeed"
        : "Update should succeed";
  return `${omnUiMinMaxWhatEntered(variant, rule, txnContext)} — ${persist}. (${rule.field})`;
}

export function omnUiFormulaDisplayTitle(
  entry: OmnUiEntry,
  name: string,
  expectsError = false
): string {
  const when = expectsError
    ? "When calculated totals do not match"
    : "When calculated totals match";
  const then = expectsError
    ? "Then the form should show an error."
    : entry === "create"
      ? "Then Save should succeed."
      : "Then Update should succeed.";
  return `Given ${name} — ${when} — ${then} (${name})`;
}

export function omnUiTestValue(length: number, kind: OmnUiFieldKind): string {
  if (length <= 0) return "";
  const ch = kind === "digits" ? "1" : "A";
  return ch.repeat(length);
}

export function omnUiMinMaxFieldValue(
  rule: OmnUiFieldRule,
  length: number
): string {
  if (isOmanVatinLengthField(rule)) return omnUiVatinOfLength(length);
  return omnUiTestValue(length, rule.kind);
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
  | "buyerIdentifierScheme"
  | "buyerAddress"
  | "deliverToAddress"
  | "industrialClassification"
  | "exemptionReason"
  | "vatCategoryRate"
  | "prepaymentPaidAmount"
  | "itemAttribute"
  | "catalogControl"
  | "copyInvoiceNumberEmpty";

export type OmnUiConditionalControlWrite = {
  section: OmnUiSection;
  inputId: string;
  altInputIds?: readonly string[];
  control: "text" | "autocomplete" | "autocompleteInput" | "date";
  value: string | null | undefined;
};

export type OmnUiConditionalScenario = {
  title: string;
  section: OmnUiSection;
  kind: OmnUiConditionalKind;
  shouldError: boolean;
  assertInputId: string;
  altInputIds?: readonly string[];
  ruleId?: string;
  entries?: readonly OmnUiEntry[];
  /** Continue prerequisite section commits through this section before asserting. */
  completeThrough?: OmnUiSection;
  /** Master txn/type expansion or a dropdown/autocomplete assert field. */
  dropdownStyle?: boolean;
  /** UI gate: field must stay disabled (do not type a value). */
  expectDisabled?: boolean;
  /** Named Allure skip; mapped loop must not call the runner. */
  skipReason?: string;
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
  buyerIdentifierScheme?: string;
  buyerIdentifierTextualCode?: string;
  buyerCountrySubdivision?: string;
  buyerVatIdentifier?: string;
  sellerIdentifier?: string;
  sellerIdentifierTextualCode?: string;
  sellerCountrySubdivision?: string;
  industrialClassificationCode?: string;
  taxCategory?: string;
  taxRate?: string | null;
  taxExemptionReasonCode?: string | null;
  taxExemptionReasonText?: string | null;
  paidAmount?: string;
  prepaymentInvoiceNumber?: string;
  prepaymentInvoiceUuid?: string;
  itemAttributeName?: string;
  itemAttributeValue?: string;
  catalogWrites?: readonly OmnUiConditionalControlWrite[];
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
  [ITEM_ATTRIBUTE_NAME_FIELD]: {
    section: "item",
    inputId: "itemAttributeName",
    altInputIds: ["attributeName"],
  },
  [ITEM_ATTRIBUTE_VALUE_FIELD]: {
    section: "item",
    inputId: "itemAttributeValue",
    altInputIds: ["attributeValue"],
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
  [BUYER_IDENTIFIER_SCHEME_FIELD]: {
    section: "buyer",
    inputId: "schemeIdentifier",
    altInputIds: ["buyerSchemeIdentifier"],
  },
  [BUYER_IDENTIFIER_TEXTUAL_CODE_FIELD]: {
    section: "buyer",
    inputId: "identifierCode",
    altInputIds: ["textualCode", "buyerIdentifierCode"],
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
  [TAX_CATEGORY_FIELD]: { section: "item", inputId: "taxRateDtls[0].taxCategory" },
  [INVOICED_ITEM_TAX_RATE_FIELD]: { section: "item", inputId: "taxRateDtls[0].taxRate" },
  [TAX_EXEMPTION_REASON_CODE_FIELD]: {
    section: "item",
    inputId: "taxExemptionRsnType",
    altInputIds: [
      "taxRateDtls[0].exemptionReasonCode",
      "taxExemptionReasonCode",
      "exemptionReasonType",
    ],
  },
  [TAX_EXEMPTION_REASON_TEXT_FIELD]: {
    section: "item",
    inputId: "taxExemptionRsn",
    altInputIds: ["taxRateDtls[0].exemptionReason", "taxExemptionReason"],
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
  "taxExemptionRsnType",
  "taxRateDtls[0].exemptionReasonCode",
  "taxExemptionReasonCode",
  "exemptionReasonType",
  "docLevelCharges[0].vatCategory",
  "vatCategoryCharges",
  "docLevelCharges[0].exemptionRsn",
  "docLevelCharges[0].exemptionReasonCode",
  "taxExemptionReasonCharges",
  "docLevelAllowances[0].vatCategory",
  "vatCategoryAllowances",
  "docLevelAllowances[0].exemptionRsn",
  "docLevelAllowances[0].exemptionReasonCode",
  "taxExemptionReasonAllowances",
]);

const DROPDOWN_STYLE_KINDS = new Set<OmnUiConditionalKind>([
  "creditDebitReason",
  "buyerIdOrVatin",
  "buyerIdentifierScheme",
  "buyerAddress",
  "deliverToAddress",
  "industrialClassification",
  "exemptionReason",
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

/** Excel applyTxnExclusionCompanions / applyIbr081TxnCompanions — document fields only. */
function uiImportTxnDocumentCompanions(txn?: string): Pick<
  OmnUiConditionalScenario,
  | "periodStart"
  | "periodEnd"
  | "precedingInvoiceReference"
  | "precedingInvoiceIssueDate"
  | "precedingInvoiceUuid"
  | "invoiceTypeCode"
> {
  if (txn === TXN_SUMMARY_INVOICE || txn === TXN_CONTINUOUS_SUPPLY) {
    return { periodStart: "2026-01-01", periodEnd: "2026-01-31" };
  }
  if (txn === TXN_PROFIT_MARGIN_INVOICE) {
    return {
      precedingInvoiceReference: "PREV-OMN-001",
      precedingInvoiceIssueDate: "2026-06-01",
      precedingInvoiceUuid: PRECEDING_INVOICE_UUID_SAMPLE,
    };
  }
  if (txn === TXN_SELF_BILLED_INVOICE) {
    return { invoiceTypeCode: INVOICE_TYPE_SELF_BILLED_INVOICE };
  }
  return {};
}

function locFor(field: string | undefined, fallback: CvFieldLoc): CvFieldLoc {
  return (field && CV_FIELD_LOC[field]) || fallback;
}

/** Same XOR heuristic as `buildBuyerIdentifierSchemeScenarioRow`. */
function uiBuyerIdentifierCompanion(
  s: (typeof BUYER_IDENTIFIER_SCHEME_SCENARIOS)[number]
): "scheme" | "code" {
  if (s.buyerCompanion) return s.buyerCompanion;
  const usesOmanBuyerSellerTextualCode = buyerSellerIdentifierCodeValidTestData.some(
    (item) => item.label === s.buyerIdentifierScheme
  );
  return s.invoiceTransactionTypeCode === TXN_IMPORT_OF_GOODS || usesOmanBuyerSellerTextualCode
    ? "code"
    : "scheme";
}

function mapUiBuyerIdentifierScheme(): OmnUiConditionalScenario[] {
  return BUYER_IDENTIFIER_SCHEME_SCENARIOS.map((s) => {
    const loc = locFor(s.expectedErrorField, CV_FIELD_LOC[BUYER_IDENTIFIER_FIELD]);
    const companion = uiBuyerIdentifierCompanion(s);
    const isSpecialZoneTxn = s.invoiceTransactionTypeCode === TXN_SPECIAL_ZONE_SUPPLIES;
    const usesSzSubdivision =
      isSpecialZoneTxn || s.buyerIdentifierScheme === SPECIAL_ZONE_LICENSE_SCHEME;
    return {
      title: s.title,
      ruleId: s.ruleId,
      kind: "buyerIdentifierScheme" as const,
      section: loc.section,
      shouldError: s.shouldError,
      assertInputId: loc.inputId,
      altInputIds: loc.altInputIds,
      dropdownStyle: true,
      invoiceTransactionTypeCode: s.invoiceTransactionTypeCode,
      buyerIdentifier: s.buyerIdentifier,
      buyerIdentifierScheme: companion === "scheme" ? s.buyerIdentifierScheme : "",
      buyerIdentifierTextualCode: companion === "code" ? s.buyerIdentifierScheme : "",
      buyerCountrySubdivision:
        s.buyerCountrySubdivisionCode ??
        (usesSzSubdivision ? SPECIAL_ZONE_COUNTRY_SUBDIVISION_CL13 : undefined),
      sellerIdentifier: isSpecialZoneTxn ? "SZ-SELLER-001" : undefined,
      sellerIdentifierTextualCode: isSpecialZoneTxn ? SPECIAL_ZONE_LICENSE_SCHEME : undefined,
      sellerCountrySubdivision: usesSzSubdivision
        ? SPECIAL_ZONE_COUNTRY_SUBDIVISION_CL13
        : undefined,
    };
  });
}

function isUiInvoicingPeriodSupported(title: string): boolean {
  return !/end is before period start|End Date Earlier Than Start Date/i.test(title);
}

/**
 * Tax Rate (`#taxRateDtls[0].taxRate`) is disabled and autopopulated.
 * Keep only polarities the form can produce without typing the rate.
 */
function isUiVatCategoryRateDriveable(s: {
  taxCategory: string;
  taxRate: string | null;
}): boolean {
  const rate = s.taxRate;
  if (rate === WHITESPACE_ONLY_FIELD_VALUE || (rate != null && /^\s+$/.test(rate))) {
    return false;
  }
  const omit = rate == null || rate === "";
  const categoryOmitsRate =
    s.taxCategory === EXEMPT_FROM_TAX_TAX_CATEGORY_CODE ||
    s.taxCategory === NOT_SUBJECT_TO_VAT_TAX_CATEGORY_CODE;
  if (omit) return categoryOmitsRate;
  if (s.taxCategory === STANDARD_TAX_CATEGORY_CODE && rate === TAX_RATE_STANDARD_OMAN) {
    return true;
  }
  if (s.taxCategory === ZERO_RATED_TAX_CATEGORY_CODE && rate === TAX_RATE_ZERO) {
    return true;
  }
  return false;
}

function vatCategoryExemptionCompanion(taxCategory: string): string {
  if (taxCategory === EXEMPT_FROM_TAX_TAX_CATEGORY_CODE) {
    return TAX_EXEMPTION_REASON_SAMPLE;
  }
  if (taxCategory === ZERO_RATED_TAX_CATEGORY_CODE) {
    return TAX_EXEMPTION_REASON_ZERO_RATED_SAMPLE;
  }
  return "";
}

function mapUiVatCategoryRate(
  list: readonly {
    ruleId: string;
    title: string;
    shouldError: boolean;
    expectedErrorField?: string;
    taxCategory: string;
    taxRate: string | null;
  }[],
  extra?: { invoiceCurrencyCode?: string; exchangeRate?: string }
): OmnUiConditionalScenario[] {
  return list.filter(isUiVatCategoryRateDriveable).map((s) => {
    const loc = locFor(s.expectedErrorField, CV_FIELD_LOC[INVOICED_ITEM_TAX_RATE_FIELD]);
    return {
      title: s.title,
      ruleId: s.ruleId,
      kind: "vatCategoryRate" as const,
      section: loc.section,
      shouldError: s.shouldError,
      assertInputId: loc.inputId,
      altInputIds: loc.altInputIds,
      taxCategory: s.taxCategory,
      taxRate: s.taxRate,
      taxExemptionReasonCode: vatCategoryExemptionCompanion(s.taxCategory),
      invoiceCurrencyCode: extra?.invoiceCurrencyCode,
      exchangeRate: extra?.exchangeRate,
    };
  });
}

type CatalogConditionalSource = {
  title: string;
  ruleId: string;
  shouldError: boolean;
  invoiceTypeCode?: string;
  invoiceTransactionTypeCode?: string;
};

function catalogControlScenario(
  source: CatalogConditionalSource,
  section: OmnUiSection,
  inputId: string,
  writes: readonly OmnUiConditionalControlWrite[],
  altInputIds?: readonly string[]
): OmnUiConditionalScenario {
  return {
    title: source.title,
    ruleId: source.ruleId,
    kind: "catalogControl",
    section,
    shouldError: source.shouldError,
    assertInputId: inputId,
    altInputIds,
    invoiceTypeCode: source.invoiceTypeCode,
    invoiceTransactionTypeCode: source.invoiceTransactionTypeCode,
    catalogWrites: writes,
  };
}

const UI_ITEM_TYPE_IDS = ["itemType"] as const;
const UI_CLASSIFICATION_IDS = ["classificationIdentifier"] as const;
const UI_SELLER_COUNTRY_IDS = ["country", "countryCode"] as const;
const UI_BUYER_COUNTRY_IDS = ["country", "countryCode"] as const;
const UI_SHIPPING_COUNTRY_IDS = ["country", "countryCode"] as const;

const remainingCatalogConditionalScenarios: OmnUiConditionalScenario[] = [
  ...AMOUNT_DECIMAL_PRECISION_SCENARIOS.map((s) =>
    catalogControlScenario(s, "item", "itemGrossPrice", [
      { section: "item", inputId: "itemGrossPrice", control: "text", value: s.itemGrossPrice },
    ])
  ),
  ...ITEM_TYPE_REQUIRED_SCENARIOS.map((s) =>
    catalogControlScenario(s, "item", UI_ITEM_TYPE_IDS[0], [
      {
        section: "item",
        inputId: UI_ITEM_TYPE_IDS[0],
        control: "autocomplete",
        value: s.itemType,
      },
    ])
  ),
  ...GOODS_CLASSIFICATION_SCENARIOS.map((s) =>
    catalogControlScenario(s, "item", UI_CLASSIFICATION_IDS[0], [
      { section: "item", inputId: "itemType", control: "autocomplete", value: s.itemType },
      {
        section: "item",
        inputId: UI_CLASSIFICATION_IDS[0],
        control:
          s.shouldError && Boolean(s.itemClassificationIdentifier)
            ? "autocompleteInput"
            : "autocomplete",
        value: s.itemClassificationIdentifier,
      },
    ])
  ),
  ...HS_CODE_FROM_ROP_LIST_SCENARIOS.map((s, index) => {
    const representative =
      index ===
      HS_CODE_FROM_ROP_LIST_SCENARIOS.findIndex(
        (candidate) => candidate.shouldError === s.shouldError
      );
    const row = catalogControlScenario(s, "item", UI_CLASSIFICATION_IDS[0], [
      { section: "item", inputId: "itemType", control: "autocomplete", value: s.itemType },
      {
        section: "item",
        inputId: UI_CLASSIFICATION_IDS[0],
        control:
          s.shouldError && Boolean(s.itemClassificationIdentifier)
            ? "autocompleteInput"
            : "autocomplete",
        value: s.itemClassificationIdentifier,
      },
    ]);
    return representative ? row : { ...row, skipReason: OMN_UI_SKIP.masterList };
  }),
  ...PROFIT_MARGIN_SELF_INVOICE_SCENARIOS.map((s) => ({
    ...catalogControlScenario(
      { ...s, invoiceTransactionTypeCode: TXN_PROFIT_MARGIN_SELF_INVOICE },
      s.expectedErrorField === "Seller country code" ? "seller" : "item",
      s.expectedErrorField === "Seller country code"
        ? UI_SELLER_COUNTRY_IDS[0]
        : "taxRateDtls[0].taxCategory",
      [
        {
          section: "item",
          inputId: "taxRateDtls[0].taxCategory",
          control: "autocomplete",
          value: s.taxCategory,
        },
        {
          section: "seller",
          inputId: UI_SELLER_COUNTRY_IDS[0],
          altInputIds: UI_SELLER_COUNTRY_IDS.slice(1),
          control: "autocomplete",
          value: s.sellerCountryCode,
        },
      ]
    ),
    completeThrough: "item" as const,
  })),
  ...SUMMARY_INVOICE_PERIOD_SCENARIOS.map((s) => ({
    title: s.title,
    ruleId: s.ruleId,
    kind: "invoicingPeriod" as const,
    section: "document" as const,
    shouldError: s.shouldError,
    assertInputId: "invStartDate",
    invoiceTypeCode: s.invoiceTypeCode,
    invoiceTransactionTypeCode: s.invoiceTransactionTypeCode,
    periodStart: s.periodStart,
    periodEnd: s.periodEnd,
  })),
  ...SUMMARY_PERIOD_SAME_CALENDAR_MONTH_SCENARIOS.map((s) => ({
    title: s.title,
    ruleId: s.ruleId,
    kind: "invoicingPeriod" as const,
    section: "document" as const,
    shouldError: s.shouldError,
    assertInputId: "invEndDate",
    invoiceTypeCode: s.invoiceTypeCode,
    invoiceTransactionTypeCode: s.invoiceTransactionTypeCode,
    periodStart: s.periodStart,
    periodEnd: s.periodEnd,
  })),
  ...EXPORT_DELIVERY_SCENARIOS.map((s) =>
    catalogControlScenario(s, "shipping", UI_SHIPPING_COUNTRY_IDS[0], [
      {
        section: "shipping",
        inputId: UI_SHIPPING_COUNTRY_IDS[0],
        altInputIds: UI_SHIPPING_COUNTRY_IDS.slice(1),
        control: "autocomplete",
        value: s.deliverToCountryCode,
      },
    ], UI_SHIPPING_COUNTRY_IDS.slice(1))
  ),
  ...EXPORT_SERVICE_TYPE_SCENARIOS.map((s) =>
    catalogControlScenario(s, "item", "serviceTypeCode", [
      {
        section: "item",
        inputId: "taxRateDtls[0].taxCategory",
        control: "autocomplete",
        value: ZERO_RATED_TAX_CATEGORY_CODE,
      },
      {
        section: "item",
        inputId: "taxExemptionRsnType",
        altInputIds: ["taxRateDtls[0].exemptionReasonCode", "taxExemptionReasonCode"],
        control: "autocomplete",
        value: s.taxExemptionReasonCode,
      },
      {
        section: "item",
        inputId: "serviceTypeCode",
        control: s.serviceTypeCode === "NOT-A-CL12-SERVICE-TYPE"
          ? "autocompleteInput"
          : "autocomplete",
        value: s.serviceTypeCode,
      },
    ])
  ),
  ...EXPORT_DELIVER_COUNTRY_FORBIDDEN_OM_SCENARIOS.map((s) =>
    catalogControlScenario(s, "shipping", UI_SHIPPING_COUNTRY_IDS[0], [
      {
        section: "item",
        inputId: "taxRateDtls[0].taxCategory",
        control: "autocomplete",
        value: ZERO_RATED_TAX_CATEGORY_CODE,
      },
      {
        section: "item",
        inputId: "taxExemptionRsnType",
        control: "autocomplete",
        value: s.taxExemptionReasonCode,
      },
      {
        section: "shipping",
        inputId: UI_SHIPPING_COUNTRY_IDS[0],
        altInputIds: UI_SHIPPING_COUNTRY_IDS.slice(1),
        control: "autocomplete",
        value: s.deliverToCountryCode,
      },
    ], UI_SHIPPING_COUNTRY_IDS.slice(1))
  ),
  ...EXPORT_SUPPORTING_DOCUMENT_SCENARIOS.map((s) =>
    catalogControlScenario(s, "payment", "supportingDocRef", [
      {
        section: "item",
        inputId: "taxRateDtls[0].taxCategory",
        control: "autocomplete",
        value: ZERO_RATED_TAX_CATEGORY_CODE,
      },
      {
        section: "item",
        inputId: "taxExemptionRsnType",
        control: "autocomplete",
        value: s.taxExemptionReasonCode,
      },
      {
        section: "payment",
        inputId: "supportingDocRef",
        altInputIds: ["supportingDocumentReference"],
        control: "text",
        value: s.supportingDocumentReference,
      },
      {
        section: "payment",
        inputId: "supportingDocUuid",
        altInputIds: ["supportingDocumentUUID"],
        control: "text",
        value: s.supportingDocumentUuid,
      },
    ], ["supportingDocumentReference"])
  ),
  ...SELF_BILLED_BUYER_VAT_SCENARIOS.map((s) =>
    catalogControlScenario(s, "buyer", "vatIdentifier", [
      {
        section: "buyer",
        inputId: "buyerIdentifier",
        altInputIds: ["identifier"],
        control: "text",
        value: s.buyerIdentifier,
      },
      { section: "buyer", inputId: "vatIdentifier", control: "text", value: s.buyerVatIdentifier },
    ])
  ),
  ...VATIN_PATTERN_SCENARIOS.map((s) => {
    const section = s.party;
    const inputId = "vatIdentifier";
    return catalogControlScenario(s, section, inputId, [
      { section, inputId, control: "text", value: s.vatinValue },
    ], section === "seller" ? ["sellerVatIdentifier"] : undefined);
  }),
  ...SELF_BILLED_RCM_BUYER_COUNTRY_SCENARIOS.map((s) =>
    catalogControlScenario(s, "buyer", UI_BUYER_COUNTRY_IDS[0], [
      {
        section: "buyer",
        inputId: UI_BUYER_COUNTRY_IDS[0],
        altInputIds: UI_BUYER_COUNTRY_IDS.slice(1),
        control: "autocomplete",
        value: s.buyerCountryCode,
      },
    ], UI_BUYER_COUNTRY_IDS.slice(1))
  ),
  ...SELF_BILLED_TXN_CONSTRAINT_SCENARIOS.map((s) =>
    catalogControlScenario(s, "document", "invTxnType", [])
  ),
  ...PREPAYMENT_TXN_EXCLUSION_SCENARIOS.map((s) =>
    catalogControlScenario(s, "document", "invTxnType", [])
  ),
  ...[
    ...DOCUMENT_ALLOWANCE_CHARGE_VAT_SCENARIOS,
    ...DOCUMENT_ALLOWANCE_CHARGE_RATE_SCENARIOS,
  ].map((s) => {
    const charge = s.kind === "charge";
    const amountId = charge
      ? "docLevelCharges[0].amount"
      : "docLevelAllowances[0].amount";
    const categoryId = charge
      ? "docLevelCharges[0].vatCategory"
      : "docLevelAllowances[0].vatCategory";
    const reasonId = charge
      ? "docLevelCharges[0].exemptionRsn"
      : "docLevelAllowances[0].exemptionRsn";
    return catalogControlScenario(s, "invoice", reasonId, [
      { section: "invoice", inputId: amountId, control: "text", value: s.amount },
      { section: "invoice", inputId: categoryId, control: "autocomplete", value: s.vatCategory },
      {
        section: "invoice",
        inputId: reasonId,
        control: s.shouldError && Boolean(s.exemptionReason)
          ? "autocompleteInput"
          : "autocomplete",
        value: s.exemptionReason,
      },
    ]);
  }),
  ...IBR_CL_05_DOC_ALLOWANCE_SCENARIOS.map((s) =>
    catalogControlScenario(s, "invoice", "docLevelAllowances[0].exemptionRsn", [
      { section: "invoice", inputId: "docLevelAllowances[0].amount", control: "text", value: s.amount },
      {
        section: "invoice",
        inputId: "docLevelAllowances[0].vatCategory",
        control: "autocomplete",
        value: s.vatCategory,
      },
      {
        section: "invoice",
        inputId: "docLevelAllowances[0].exemptionRsn",
        control: s.shouldError && Boolean(s.exemptionReason)
          ? "autocompleteInput"
          : "autocomplete",
        value: s.exemptionReason,
      },
    ])
  ),
  ...VAT_BREAKDOWN_CATEGORY_PRESENCE_SCENARIOS.map((s) => {
    const source = s.source ?? "line";
    const componentPrefix =
      source === "charge" ? "docLevelCharges[0]" : "docLevelAllowances[0]";
    const componentWrites: OmnUiConditionalControlWrite[] =
      source === "line"
        ? []
        : [
            {
              section: "invoice",
              inputId: `${componentPrefix}.amount`,
              control: "text",
              value: "10",
            },
            {
              section: "invoice",
              inputId: `${componentPrefix}.vatCategory`,
              control: "autocomplete",
              value: s.taxCategory,
            },
          ];
    const lineCategory =
      source === "line" || s.breakdownMatches !== false
        ? s.taxCategory
        : s.taxCategory === STANDARD_TAX_CATEGORY_CODE
          ? ZERO_RATED_TAX_CATEGORY_CODE
          : STANDARD_TAX_CATEGORY_CODE;
    const assertId =
      source === "line"
        ? "taxRateDtls[0].taxCategory"
        : `${componentPrefix}.vatCategory`;
    return catalogControlScenario(s, source === "line" ? "item" : "invoice", assertId, [
      {
        section: "item",
        inputId: "taxRateDtls[0].taxCategory",
        control: "autocomplete",
        value: lineCategory,
      },
      ...componentWrites,
    ]);
  }),
  ...SPECIAL_ZONE_COUNTRY_SUBDIVISION_SCENARIOS.map((s) =>
    ({
      ...catalogControlScenario(
        s,
        s.expectedErrorField?.startsWith("Seller") ? "seller" : "buyer",
        "countrySubdivision",
        [
        {
          section: "seller",
          inputId: "countrySubdivision",
          altInputIds: ["sellerCountrySubdivision"],
          control: "autocomplete",
          value: s.sellerCountrySubdivisionCode,
        },
        {
          section: "buyer",
          inputId: "countrySubdivision",
          altInputIds: ["buyerCountrySubdivision"],
          control: s.shouldError && Boolean(s.buyerCountrySubdivisionCode)
            ? "autocompleteInput"
            : "autocomplete",
          value: s.buyerCountrySubdivisionCode,
        },
        ]
      ),
      completeThrough: "buyer" as const,
    })
  ),
  ...SPECIAL_ZONE_SELLER_SCENARIOS.map((s) =>
    catalogControlScenario(s, "seller", "sellerIdentifier", [
      {
        section: "seller",
        inputId: "sellerIdentifier",
        altInputIds: ["identifier"],
        control: "text",
        value: s.sellerIdentifier,
      },
      {
        section: "seller",
        inputId: "schemeIdentifier",
        altInputIds: ["sellerSchemeIdentifier"],
        control: "autocomplete",
        value: s.sellerIdentifierScheme,
      },
      {
        section: "seller",
        inputId: "identifierCode",
        altInputIds: ["textualCode", "sellerIdentifierCode"],
        control: "autocomplete",
        value: s.sellerIdentifierTextualCode,
      },
      {
        section: "seller",
        inputId: "countrySubdivision",
        altInputIds: ["sellerCountrySubdivision"],
        control: "autocomplete",
        value: s.sellerCountrySubdivisionCode,
      },
    ], ["identifier"])
  ),
  ...SELLER_IDENTIFIER_SCHEME_SCENARIOS.map((s) =>
    catalogControlScenario(s, "seller", "sellerIdentifier", [
      {
        section: "seller",
        inputId: "sellerIdentifier",
        altInputIds: ["identifier"],
        control: "text",
        value: s.sellerIdentifierProvided ? "OM-SELLER-001" : "",
      },
      {
        section: "seller",
        inputId: "schemeIdentifier",
        altInputIds: ["sellerSchemeIdentifier"],
        control: "autocomplete",
        value: s.sellerCompanion === "scheme"
          ? SELLER_IDENTIFIER_ICD_SCHEME_OMAN_VATIN
          : "",
      },
      {
        section: "seller",
        inputId: "identifierCode",
        altInputIds: ["textualCode", "sellerIdentifierCode"],
        control: "autocomplete",
        value: s.sellerCompanion === "code"
          ? OMN_UI_PARTY_IDENTIFIER_TEXTUAL_CODE
          : "",
      },
    ], ["identifier"])
  ),
  ...HS_CODE_LENGTH_SCENARIOS.map((s) =>
    catalogControlScenario(s, "item", UI_CLASSIFICATION_IDS[0], [
      {
        section: "item",
        inputId: UI_CLASSIFICATION_IDS[0],
        control:
          s.shouldError && Boolean(s.itemClassificationIdentifier)
            ? "autocompleteInput"
            : "autocomplete",
        value: s.itemClassificationIdentifier,
      },
    ])
  ),
  ...SELLER_COUNTRY_RCM_SCENARIOS.map((s) =>
    catalogControlScenario(s, "seller", UI_SELLER_COUNTRY_IDS[0], [
      {
        section: "seller",
        inputId: UI_SELLER_COUNTRY_IDS[0],
        altInputIds: UI_SELLER_COUNTRY_IDS.slice(1),
        control: "autocomplete",
        value: s.sellerCountryCode,
      },
    ], UI_SELLER_COUNTRY_IDS.slice(1))
  ),
  ...PROFIT_MARGIN_HS_PREFIX_SCENARIOS.map((s) =>
    catalogControlScenario(
      { ...s, invoiceTransactionTypeCode: TXN_PROFIT_MARGIN_INVOICE },
      "item",
      UI_CLASSIFICATION_IDS[0],
      [{
        section: "item",
        inputId: UI_CLASSIFICATION_IDS[0],
        control: "autocomplete",
        value: s.itemClassificationIdentifier,
      }]
    )
  ),
  ...PROFIT_MARGIN_ITEM_TYPE_SCENARIOS.map((s) =>
    catalogControlScenario(s, "item", "profitMarginItemType", [
      {
        section: "item",
        inputId: "profitMarginItemType",
        altInputIds: ["profitMarginItemTypeCode"],
        control:
          s.shouldError && Boolean(s.profitMarginItemTypeCode)
            ? "autocompleteInput"
            : "autocomplete",
        value: s.profitMarginItemTypeCode,
      },
    ], ["profitMarginItemTypeCode"])
  ),
  ...PARTY_IDENTIFIER_COMPANION_SCENARIOS.map((s) => {
    const seller = s.party === "seller";
    const section = seller ? "seller" as const : "buyer" as const;
    const identifierId = seller ? "sellerIdentifier" : "buyerIdentifier";
    const schemeId = seller ? "schemeIdentifier" : "schemeIdentifier";
    const codeId = "identifierCode";
    return catalogControlScenario(s, section, identifierId, [
      { section, inputId: identifierId, altInputIds: ["identifier"], control: "text", value: s.identifier },
      {
        section,
        inputId: schemeId,
        altInputIds: seller ? ["sellerSchemeIdentifier"] : ["buyerSchemeIdentifier"],
        control: "autocomplete",
        value: s.companion === "scheme" || s.companion === "both"
          ? SELLER_IDENTIFIER_ICD_SCHEME_OMAN_VATIN
          : "",
      },
      {
        section,
        inputId: codeId,
        altInputIds: ["textualCode", seller ? "sellerIdentifierCode" : "buyerIdentifierCode"],
        control: "autocomplete",
        value: s.companion === "code" || s.companion === "both"
          ? OMN_UI_PARTY_IDENTIFIER_TEXTUAL_CODE
          : "",
      },
    ], ["identifier"]);
  }),
  ...AMOUNT_QUANTITY_SIGN_SCENARIOS.map((s) => {
    const field = s.amountField ?? s.expectedErrorField;
    const location = field ? omnUiNumericFieldLocation(field) : undefined;
    const value = s.amountValue ??
      (field === "Invoiced quantity" ? s.invoicedQuantity : s.roundingAmount);
    if (!location) {
      return {
        title: s.title,
        ruleId: s.ruleId,
        kind: "catalogControl" as const,
        section: "item" as const,
        shouldError: s.shouldError,
        assertInputId: "itemGrossPrice",
        skipReason: OMN_UI_SKIP.calculated,
      };
    }
    return catalogControlScenario(s, location.section, location.inputId, [{
      section: location.section,
      inputId: location.inputId,
      altInputIds: location.altInputIds,
      control: "text",
      value,
    }], location.altInputIds);
  }),
];

const OMN_UI_CONDITIONAL_SCENARIOS_ALL: OmnUiConditionalScenario[] = [
  ...remainingCatalogConditionalScenarios,
  ...EXCHANGE_RATE_SCENARIOS.filter((s) => s.expectedErrorField === EXCHANGE_RATE_FIELD).map(
    (s) => {
      const loc = locFor(s.expectedErrorField, CV_FIELD_LOC[EXCHANGE_RATE_FIELD]);
      const omrRateDisabled = s.ruleId === "IBR-172-OM" && s.shouldError && Boolean(s.exchangeRate);
      return {
        title: omrRateDisabled
          ? "Given currency OMR — When the exchange rate field is shown — Then it should be disabled. (IBR-172-OM)"
          : s.title,
        ruleId: s.ruleId,
        kind: "exchangeRate" as const,
        section: loc.section,
        shouldError: omrRateDisabled ? false : s.shouldError,
        expectDisabled: omrRateDisabled,
        assertInputId: loc.inputId,
        invoiceCurrencyCode: s.invoiceCurrencyCode,
        exchangeRate: omrRateDisabled ? undefined : s.exchangeRate,
      };
    }
  ),
  ...CREDIT_DEBIT_REASON_SCENARIOS.map((s) => {
    const loc = locFor(s.expectedErrorField, CV_FIELD_LOC[CREDIT_DEBIT_NOTE_REASON_CODE_FIELD]);
    const hasPreceding = Boolean(s.precedingInvoiceReference);
    return {
      title: s.title,
      ruleId: s.ruleId,
      kind: "creditDebitReason" as const,
      section: loc.section,
      shouldError: s.shouldError,
      assertInputId: loc.inputId,
      invoiceTypeCode: s.invoiceTypeCode,
      invoiceTransactionTypeCode:
        s.invoiceTypeCode === INVOICE_TYPE_SELF_BILLED_CREDIT_NOTE
          ? TXN_SELF_BILLED_INVOICE
          : undefined,
      creditNoteReasonCode: s.creditDebitNoteReasonCode,
      precedingInvoiceReference: s.precedingInvoiceReference,
      precedingInvoiceIssueDate: hasPreceding ? "2026-01-15" : "",
      precedingInvoiceUuid: hasPreceding ? PRECEDING_INVOICE_UUID_SAMPLE : "",
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
      invoiceTransactionTypeCode:
        s.invoiceTypeCode === INVOICE_TYPE_SELF_BILLED_CREDIT_NOTE
          ? TXN_SELF_BILLED_INVOICE
          : undefined,
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
      invoiceTypeCode: s.invoiceTypeCode,
      invoiceTransactionTypeCode: s.invoiceTransactionTypeCode,
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
      itemCountryOfOrigin: s.itemCountryOfOrigin,
      ...uiImportTxnDocumentCompanions(s.invoiceTransactionTypeCode),
      importDate: s.importDate,
      customsDeclarationNumber: s.customsDeclarationNumber,
      incoterms: s.incoterms,
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
      sellerVatIdentifier: s.sellerVatIdentifier ? undefined : s.sellerVatIdentifier,
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
      // Excel seed / IBR-019 row keeps Buyer country as Oman. Empty country is IBR-020-OM only.
      countryCode: OMAN_COUNTRY_CODE,
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
  ...VAT_EXEMPTION_REASON_CONDITIONAL_SCENARIOS.map((s) => {
    const loc = locFor(s.expectedErrorField, CV_FIELD_LOC[TAX_EXEMPTION_REASON_CODE_FIELD]);
    return {
      title: s.title,
      ruleId: s.ruleId,
      kind: "exemptionReason" as const,
      section: loc.section,
      shouldError: s.shouldError,
      assertInputId: loc.inputId,
      altInputIds: loc.altInputIds,
      dropdownStyle: s.expectedErrorField !== TAX_EXEMPTION_REASON_TEXT_FIELD,
      taxCategory: s.taxCategory,
      taxExemptionReasonCode: s.taxExemptionReasonCode,
      taxExemptionReasonText: s.taxExemptionReasonText,
    };
  }),
  ...mapUiVatCategoryRate(VAT_CATEGORY_RATE_FORBIDDEN_SCENARIOS),
  ...mapUiVatCategoryRate(STANDARD_TAX_RATE_SCENARIOS),
  ...mapUiVatCategoryRate(ZERO_RATED_TAX_RATE_SCENARIOS),
  ...mapUiVatCategoryRate(VAT_BREAKDOWN_RATE_REQUIRED_SCENARIOS),
  ...mapUiVatCategoryRate(VAT_ACCOUNTING_CURRENCY_STANDARD_RATE_SCENARIOS, {
    invoiceCurrencyCode: OMAN_CURRENCY_USD,
    exchangeRate: "0.385",
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
  ...mapUiBuyerIdentifierScheme(),
  ...ITEM_ATTRIBUTE_CONDITIONAL_SCENARIOS.map((s) => {
    const loc = locFor(s.expectedErrorField, CV_FIELD_LOC[ITEM_ATTRIBUTE_VALUE_FIELD]);
    return {
      title: s.title,
      ruleId: s.ruleId,
      kind: "itemAttribute" as const,
      section: loc.section,
      shouldError: s.shouldError,
      assertInputId: loc.inputId,
      altInputIds: loc.altInputIds,
      itemAttributeName: s.itemAttributeName,
      itemAttributeValue: s.itemAttributeValue,
    };
  }),
  {
    title: "Copied invoice number and invoice date are empty until filled",
    section: "document",
    kind: "copyInvoiceNumberEmpty",
    shouldError: false,
    assertInputId: "invNum",
    entries: ["copy"],
  },
];

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

const COPY_INVOICE_NUMBER_EMPTY_SOURCE =
  "Copied invoice number and invoice date are empty until filled";

export function omnUiConditionalDisplayTitle(entry: OmnUiEntry, sourceTitle: string): string {
  if (sourceTitle === COPY_INVOICE_NUMBER_EMPTY_SOURCE) {
    return "Given a copied invoice — When the copied form opens — Then Invoice Number and Invoice Issue Date should be empty. (Invoice Number, Invoice Issue Date)";
  }
  const when = entry === "create" ? "When the form is saved" : "When the form is updated";
  const accepted =
    entry === "create" ? "Then Save should succeed." : "Then Update should succeed.";
  return sourceTitle
    .replace(/^(?:(?:Create|Edit|Copy) Invoice UI \| )+/, "")
    .replace("When the invoice is uploaded", when)
    .replace("Then the invoice should be accepted.", accepted)
    .replace(
      "Then the invoice should be rejected with an error.",
      "Then the form should show an error."
    );
}
