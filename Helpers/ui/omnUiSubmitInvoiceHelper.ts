/**
 * Create Invoice on the form from Excel submit rows, then dashboard Submit → delivered.
 * Same multi-item rows as `runSubmitInvoiceMultiItemCase`; no Excel upload.
 */
import { expect, type Page } from "@playwright/test";
import { OMN_UIInvoiceManualPage } from "../../pageObjects/OMN_UIInvoiceManualPage";
import { flowLog } from "../diagnosticLog";
import { applyParallelWorkerIdentityToSubmitRow } from "../worker/parallelWorkerSubmitIdentity";
import { buildUniqueSubmitInvoiceNumber } from "../../utils/excel/invoiceExcel";
import {
  BTOM_001_SINGLE_ALLOWED_TXN_TYPES,
  ITEM_TYPE_GOODS,
  TXN_FULL_TAX_INVOICE,
  TXN_SIMPLIFIED_TAX_INVOICE,
  splitOmanTxnMasterLabels,
} from "../../testData/FieldValidations/ConditionalValidation";
import { INVOICE_CURRENCY_ISO_TO_DISPLAY_NAME } from "../../testData/FieldValidations/invoiceCurrencyIsoToDisplayName";
import {
  omnUiNumericFieldLocation,
  OMN_UI_FIELD_RULES,
  type OmnUiFieldKind,
  type OmnUiSection,
} from "../../testData/ui/omnUiInvoiceValidation";

export const OMN_UI_SUBMIT_INVOICE_TEST_TIMEOUT_MS = 12 * 60 * 1000;
export const OMN_UI_SUBMIT_INVOICE_MULTI_TEST_TIMEOUT_MS = 15 * 60 * 1000;

/** Same env knob as Excel submit (`SUBMIT_INVOICE_DELIVERY_TIMEOUT_MS`). */
export const OMN_UI_SUBMIT_INVOICE_DELIVERY_TIMEOUT_MS = (() => {
  const raw = process.env.SUBMIT_INVOICE_DELIVERY_TIMEOUT_MS?.trim();
  if (raw) {
    const n = Number.parseInt(raw, 10);
    if (Number.isFinite(n) && n >= 60_000) return n;
  }
  return 2 * 60 * 1000;
})();

const ENTRY = "create" as const;

/** Totals the form calculates. Do not type them. */
const CALCULATED_EXCEL_FIELDS = [
  "Item net price",
  "Invoice line net amount",
  "Line item VAT amount",
  "Total amount including VAT",
  "Sum of Invoice line net amount",
  "Invoice total amount without tax",
  "Invoice total tax amount",
  "Invoice total amount with tax",
  "Amount due for payment",
] as const;

const SKIP_EXCEL_FIELDS = new Set(
  [
    "Invoice Number",
    "Invoice Issue Date",
    "Invoice Type Code",
    "Invoice Transaction Type Code",
    "Tax Rate",
    ...CALCULATED_EXCEL_FIELDS,
  ].map(normField)
);

const NUMERIC_EXCEL_FIELDS = [
  "Item price base quantity",
  "Item gross price",
  "Item price discount",
  "Invoiced quantity",
  "Invoice line charge amount",
  "Invoice line allowance amount",
  "Charges on document level",
  "Allowances on document level",
  "Paid amount",
  "Rounding amount",
] as const;

type UiSubmitField = {
  field: string;
  section: OmnUiSection;
  inputId: string;
  altInputIds?: readonly string[];
  kind: OmnUiFieldKind;
  noEditableControl?: boolean;
};

const UI_SUBMIT_FIELDS: readonly UiSubmitField[] = [
  ...OMN_UI_FIELD_RULES.map((rule) => ({
    field: rule.field,
    section: rule.section,
    inputId: rule.inputId,
    altInputIds: rule.altInputIds,
    kind: rule.kind,
    noEditableControl: rule.noEditableControl,
  })),
  {
    field: "Currency Exchange Rate",
    section: "document" as const,
    inputId: "currExchangeRate",
    kind: "text" as const,
  },
  ...NUMERIC_EXCEL_FIELDS.flatMap((field) => {
    const loc = omnUiNumericFieldLocation(field);
    if (!loc) return [];
    return [
      {
        field,
        section: loc.section,
        inputId: loc.inputId,
        altInputIds: loc.altInputIds,
        kind: "text" as const,
      },
    ];
  }),
];

function normField(field: string): string {
  return field.replace(/\s+/g, " ").trim().toLowerCase();
}

function rowValue(row: Record<string, string>, field: string): string {
  const want = normField(field);
  for (const [key, value] of Object.entries(row)) {
    if (normField(key) === want) {
      return String(value ?? "").trim();
    }
  }
  return "";
}

function applyUiSubmitTaxCategoryRules(
  data: Record<string, string>
): Record<string, string> {
  const taxCategory = String(data["Tax Category"] ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  if (
    taxCategory !== "services outside scope of tax / not subject to tax" &&
    taxCategory !== "services outside scope of tax"
  ) {
    return { ...data };
  }
  return { ...data, "Tax Rate": "" };
}

function prepareUiSubmitRow(row: Record<string, string>): Record<string, string> {
  return applyParallelWorkerIdentityToSubmitRow(applyUiSubmitTaxCategoryRules(row));
}

function todayIso(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function fieldsFor(section: OmnUiSection): UiSubmitField[] {
  return UI_SUBMIT_FIELDS.filter(
    (field) =>
      field.section === section &&
      !field.noEditableControl &&
      !SKIP_EXCEL_FIELDS.has(normField(field.field))
  );
}

function sectionHasValue(section: OmnUiSection, row: Record<string, string>): boolean {
  return fieldsFor(section).some((field) => rowValue(row, field.field) !== "");
}

/** Excel stores ISO codes (`OMR`). The currency dropdown lists the name (`Rial Omani`). */
const CURRENCY_INPUT_IDS = new Set([
  "invCurrCode",
  "sourceCurrCode",
  "taxAccountingCurrency",
  "taxAccCurr",
  "taxAccountingCurrCode",
]);

function currencyOptionLabel(
  inputId: string,
  altInputIds: readonly string[],
  value: string
): string {
  const isCurrency = [inputId, ...altInputIds].some((id) => CURRENCY_INPUT_IDS.has(id));
  if (!isCurrency) return value;
  return INVOICE_CURRENCY_ISO_TO_DISPLAY_NAME[value.trim().toUpperCase()] ?? value;
}

/** Create Invoice subdivision dropdown. Excel masters keep a trailing period. */
const COUNTRY_SUBDIVISION_UI_LABELS = [
  "Al Mazunah Free Zone",
  "Mainland Oman",
  "Other",
  "Sohar Free Zone",
  "Special Economic Zone at Duqm",
  "Salalah Free Zone",
] as const;

const COUNTRY_SUBDIVISION_INPUT_IDS = new Set([
  "countrySubdivision",
  "sellerCountrySubdivision",
  "buyerCountrySubdivision",
  "deliverToCountrySubdivision",
]);

function countrySubdivisionOptionLabel(
  inputId: string,
  altInputIds: readonly string[],
  value: string
): string {
  const isSubdivision = [inputId, ...altInputIds].some((id) =>
    COUNTRY_SUBDIVISION_INPUT_IDS.has(id)
  );
  if (!isSubdivision) return value;
  const bare = value.trim().replace(/\.$/, "");
  return (
    COUNTRY_SUBDIVISION_UI_LABELS.find((label) => label.toLowerCase() === bare.toLowerCase()) ??
    bare
  );
}

function autocompleteOptionLabel(
  inputId: string,
  altInputIds: readonly string[],
  value: string
): string {
  return countrySubdivisionOptionLabel(
    inputId,
    altInputIds,
    currencyOptionLabel(inputId, altInputIds, value)
  );
}

/** Excel stores the full CL-12 label. The goods dropdown filters on the short name. */
const GOODS_SERVICE_ACCOUNTING_SEARCH = "Healthcare Services.";

function goodsServiceAccountingOption(value: string): string {
  if (value.trim().toLowerCase().startsWith(GOODS_SERVICE_ACCOUNTING_SEARCH.toLowerCase())) {
    return GOODS_SERVICE_ACCOUNTING_SEARCH;
  }
  return value;
}

async function fillMappedField(
  invoice: OMN_UIInvoiceManualPage,
  field: UiSubmitField,
  row: Record<string, string>
): Promise<void> {
  const value = rowValue(row, field.field);
  if (!value) return;
  const goodsServiceAccounting =
    field.section === "item" &&
    field.inputId === "serviceTypeCode" &&
    rowValue(row, "Item Type").toLowerCase() === ITEM_TYPE_GOODS.toLowerCase();
  // Goods item dialog shows Service Accounting Code (#serviceAccCode), not Service Type.
  const inputId = goodsServiceAccounting ? "serviceAccCode" : field.inputId;
  const alts = goodsServiceAccounting
    ? ["serviceAccountingCode"]
    : (field.altInputIds ?? []);
  if (await invoice.isInputDisabled(field.section, inputId, alts)) return;

  if (field.kind === "autocomplete") {
    const option = goodsServiceAccounting
      ? goodsServiceAccountingOption(value)
      : autocompleteOptionLabel(inputId, alts, value);
    await invoice.selectAutocomplete(field.section, inputId, option, alts);
    return;
  }
  if (field.kind === "date") {
    await invoice.fillDate(field.section, field.inputId, value, alts);
    return;
  }
  await invoice.replaceInput(field.section, field.inputId, value, alts);
  if (field.section === "buyer" || field.section === "item" || field.section === "seller") {
    await invoice.dismissOpenDropdown();
  }
}

async function fillSectionFromRow(
  invoice: OMN_UIInvoiceManualPage,
  section: OmnUiSection,
  row: Record<string, string>
): Promise<void> {
  for (const field of fieldsFor(section)) {
    await fillMappedField(invoice, field, row);
  }
}

async function saveSection(
  invoice: OMN_UIInvoiceManualPage,
  section: OmnUiSection
): Promise<void> {
  await invoice.clickSectionCommit(section, ENTRY);
  await invoice.expectSectionSavedReadOnly(section);
}

async function fillAndSaveSection(
  invoice: OMN_UIInvoiceManualPage,
  section: OmnUiSection,
  row: Record<string, string>
): Promise<void> {
  await invoice.openSectionForEdit(section, ENTRY);
  await fillSectionFromRow(invoice, section, row);
  await saveSection(invoice, section);
}

/**
 * Full Tax and Simplified are each a single selection.
 * Every other transaction type (Self-billed Invoice, Export, …) is created
 * twice: once with Full Tax Invoice, once with Simplified Tax Invoice.
 */
export function omnUiSubmitTransactionTypeSelections(txnCell: string): string[][] {
  const labels = splitOmanTxnMasterLabels(txnCell);
  const bases = BTOM_001_SINGLE_ALLOWED_TXN_TYPES as readonly string[];
  const others = labels.filter((label) => !bases.includes(label));
  if (others.length === 0) {
    if (labels.includes(TXN_SIMPLIFIED_TAX_INVOICE) && !labels.includes(TXN_FULL_TAX_INVOICE)) {
      return [[TXN_SIMPLIFIED_TAX_INVOICE]];
    }
    return [[TXN_FULL_TAX_INVOICE]];
  }
  return [
    [TXN_FULL_TAX_INVOICE, ...others],
    [TXN_SIMPLIFIED_TAX_INVOICE, ...others],
  ];
}

async function fillDocumentSection(
  invoice: OMN_UIInvoiceManualPage,
  row: Record<string, string>,
  invoiceNumber: string,
  transactionTypes?: readonly string[]
): Promise<void> {
  await invoice.openSectionForEdit("document", ENTRY);
  await invoice.fillInvoiceNumber(invoiceNumber);
  await invoice.fillDate("document", "invDate", todayIso(), ["issueDate", "invIssueDate"]);

  const invoiceType = rowValue(row, "Invoice Type Code");
  const txnLabels =
    transactionTypes ??
    omnUiSubmitTransactionTypeSelections(rowValue(row, "Invoice Transaction Type Code"))[0] ??
    [];
  if (invoiceType) {
    await invoice.selectInvoiceType(invoiceType);
  }
  if (txnLabels.length > 0) {
    await invoice.selectTransactionTypes(txnLabels);
  }

  await fillSectionFromRow(invoice, "document", row);
  await saveSection(invoice, "document");
}

async function addItemLine(
  invoice: OMN_UIInvoiceManualPage,
  row: Record<string, string>
): Promise<void> {
  await invoice.openSectionForEdit("item", ENTRY);
  await fillSectionFromRow(invoice, "item", row);
  await invoice.clickItemCommit(ENTRY);
  await expect(invoice.itemModal()).toBeHidden({ timeout: 15_000 });
  await saveSection(invoice, "item");
}

/**
 * Fill Create Invoice from multi-item Excel rows, page Submit, then dashboard
 * Options → Submit, and wait until the invoice is delivered.
 */
export async function runOmnUiSubmitInvoiceMultiItemCase(
  page: Page,
  rows: Array<Record<string, string>>,
  options?: { transactionTypes?: readonly string[] }
): Promise<{ invoiceNumber: string }> {
  if (!rows.length) {
    throw new Error("runOmnUiSubmitInvoiceMultiItemCase: rows cannot be empty");
  }

  const prepared = rows.map((row) => prepareUiSubmitRow(row));
  const header = prepared[0]!;
  const invoiceNumber = buildUniqueSubmitInvoiceNumber();
  const invoice = new OMN_UIInvoiceManualPage(page);

  flowLog(
    "OmnUiSubmit",
    `Starting Create Invoice UI submit for ${invoiceNumber} (${prepared.length} lines).`
  );

  try {
    await invoice.openCreate();
    await fillDocumentSection(invoice, header, invoiceNumber, options?.transactionTypes);
    await fillAndSaveSection(invoice, "seller", header);
    if (sectionHasValue("thirdParty", header)) {
      await fillAndSaveSection(invoice, "thirdParty", header);
    }
    await fillAndSaveSection(invoice, "buyer", header);
    if (sectionHasValue("shipping", header)) {
      await fillAndSaveSection(invoice, "shipping", header);
    }
    for (const line of prepared) {
      await addItemLine(invoice, line);
    }
    await fillAndSaveSection(invoice, "invoice", header);
    await fillAndSaveSection(invoice, "payment", header);
    if (sectionHasValue("custom", header)) {
      await fillAndSaveSection(invoice, "custom", header);
    }

    await invoice.clickCreateInvoiceHeaderPersist(ENTRY);
    if (prepared.length > 1) {
      await invoice.dashboard.submitMultiItemInvoiceFromTable(invoiceNumber);
    } else {
      await invoice.dashboard.refreshDashboardForInvoiceTable(invoiceNumber);
      await invoice.dashboard.submitInvoiceFromTable(invoiceNumber);
    }
    await invoice.dashboard.waitForInvoiceDeliveryStatus(invoiceNumber, {
      timeoutMs: OMN_UI_SUBMIT_INVOICE_DELIVERY_TIMEOUT_MS,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes(invoiceNumber)) {
      throw error;
    }
    throw new Error(`Invoice ${invoiceNumber} failed. ${message}`, { cause: error });
  }

  flowLog("OmnUiSubmit", `Create Invoice UI submit delivered for ${invoiceNumber}.`);
  return { invoiceNumber };
}
