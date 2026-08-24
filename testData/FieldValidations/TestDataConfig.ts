/**
 * Wires Oman dropdown fields to `Master` lists (valid vs invalid).
 */

import {
  InvalidTestData,
  countryValidTestData,
  electronicAddressSchemeValidTestData,
  schemeIdentifierValidTestData,
  unitOfMeasurementValidTestData,
  invoiceTransactionTypeValidTestData,
  invoiceTypeCodeValidTestData,
  creditDebitNoteReasonValidTestData,
  currencyCodeValidTestData,
  buyerSellerIdentifierCodeValidTestData,
  omanCountrySubdivisionValidTestData,
  itemTypeValidTestData,
  taxCategoryValidTestData,
  taxExemptionReasonValidTestData,
  profitMarginItemTypeValidTestData,
  paymentMeansTypeValidTestData,
  incotermsValidTestData,
  industrialClassificationIsicValidTestData,
  serviceTypeCodeValidTestData,
} from "./Master";

export type DropdownFieldConfig = { field: string; master: readonly { label: string }[] };

/** Dedupe dropdown configs by field name (first occurrence wins). */
export function mergeDropdownFieldConfigs(
  ...configGroups: DropdownFieldConfig[][]
): DropdownFieldConfig[] {
  const seen = new Set<string>();
  const merged: DropdownFieldConfig[] = [];
  for (const group of configGroups) {
    for (const config of group) {
      if (seen.has(config.field)) continue;
      seen.add(config.field);
      merged.push(config);
    }
  }
  return merged;
}

/**
 * Oman conditional / document-level dropdown sweeps.
 * Trimmed vs UAE: passport / legal-reg / Frequency of Billing removed.
 * Full Oman-ization of ConditionalValidation.ts is a follow-up.
 */
export const conditionalDropdownFieldMasterConfig: DropdownFieldConfig[] = [
  {
    field: "Deliver to country code",
    master: countryValidTestData,
  },
  {
    field: "Payment means type code",
    master: paymentMeansTypeValidTestData,
  },
  {
    field: "Credit note or Debit Note reason code",
    master: creditDebitNoteReasonValidTestData,
  },
  {
    field: "Vat category - charges",
    master: taxCategoryValidTestData,
  },
  {
    field: "Vat category - allowances",
    master: taxCategoryValidTestData,
  },
  {
    field: "Tax exemption reason - charges",
    master: taxExemptionReasonValidTestData,
  },
  {
    field: "Tax exemption reason - allowances",
    master: taxExemptionReasonValidTestData,
  },
  {
    field: "Tax exemption reason code",
    master: taxExemptionReasonValidTestData,
  },
];

export const documentChargesAllowancesDropdownInvalidFields = [
  "Vat category - charges",
  "Vat category - allowances",
  "Tax exemption reason - charges",
  "Tax exemption reason - allowances",
  "Tax exemption reason code",
] as const;

export const documentChargesAllowancesDropdownInvalidConfig: DropdownFieldConfig[] =
  documentChargesAllowancesDropdownInvalidFields.map((field) => ({
    field,
    master: InvalidTestData,
  }));

export const conditionalDropdownFieldInvalidFields = [
  "Deliver to country code",
  "Payment means type code",
  "Credit note or Debit Note reason code",
] as const;

export const conditionalDropdownFieldInvalidConfig: DropdownFieldConfig[] =
  conditionalDropdownFieldInvalidFields.map((field) => ({
    field,
    master: InvalidTestData,
  }));

/** Primary Oman dropdown master sweeps for field-validation specs. */
export const dropdownFieldMasterConfig: DropdownFieldConfig[] = [
  { field: "Invoice Transaction Type Code", master: invoiceTransactionTypeValidTestData },
  { field: "Invoice Type Code", master: invoiceTypeCodeValidTestData },
  { field: "Incoterms", master: incotermsValidTestData },
  { field: "Invoice Currency Code", master: currencyCodeValidTestData },
  // Source currency code-only dropdown suite (valid + invalid). Companion FX rows still set this field.
  // { field: "Source currency code", master: currencyCodeValidTestData },
  { field: "Credit note or Debit Note reason code", master: creditDebitNoteReasonValidTestData },
  { field: "Seller electronic address Scheme", master: electronicAddressSchemeValidTestData },
  { field: "Seller identifier - Scheme identifier", master: schemeIdentifierValidTestData },
  { field: "Seller Identifier (textual code)", master: buyerSellerIdentifierCodeValidTestData },
  { field: "Seller country subdivision code", master: omanCountrySubdivisionValidTestData },
  { field: "Seller country code", master: countryValidTestData },
  { field: "Third Party Country Code", master: countryValidTestData },
  { field: "Buyer electronic address Scheme", master: electronicAddressSchemeValidTestData },
  { field: "Scheme identifier", master: schemeIdentifierValidTestData },
  { field: "Buyer Identifier (textual code)", master: buyerSellerIdentifierCodeValidTestData },
  { field: "Buyer country subdivision code", master: omanCountrySubdivisionValidTestData },
  { field: "Buyer country code", master: countryValidTestData },
  { field: "Deliver to country code", master: countryValidTestData },
  { field: "Item Type", master: itemTypeValidTestData },
  { field: "Industrial Classification Code", master: industrialClassificationIsicValidTestData },
  { field: "Service Type Code", master: serviceTypeCodeValidTestData },
  { field: "Profit margin item type code", master: profitMarginItemTypeValidTestData },
  { field: "Invoiced quantity unit of measure code", master: unitOfMeasurementValidTestData },
  { field: "Tax Category", master: taxCategoryValidTestData },
  { field: "Tax exemption reason code", master: taxExemptionReasonValidTestData },
  { field: "Item country of origin", master: countryValidTestData },
  { field: "Vat category - charges", master: taxCategoryValidTestData },
  { field: "Vat category - allowances", master: taxCategoryValidTestData },
  { field: "Tax exemption reason - charges", master: taxExemptionReasonValidTestData },
  { field: "Tax exemption reason - allowances", master: taxExemptionReasonValidTestData },
  { field: "Payment means type code", master: paymentMeansTypeValidTestData },
];

export const dropdownFieldInvalidConfig: DropdownFieldConfig[] =
  dropdownFieldMasterConfig.map(({ field }) => ({
    field,
    master: InvalidTestData,
  }));
