/**
 * Buyer/Seller identifier free-text length cases with scheme/code companions.
 * Identifier may stand alone; scheme and/or textual code require identifier.
 */
import type { FieldLengthRule } from "./Min_max_field_validation";

export type PartyIdentifierParty = "buyer" | "seller";
export type PartyIdentifierCompanion = "none" | "scheme" | "code" | "both";
export type PartyIdentifierLengthKind = "empty" | "min" | "max" | "aboveMax";

export type PartyIdentifierLengthCase = {
  party: PartyIdentifierParty;
  companion: PartyIdentifierCompanion;
  lengthKind: PartyIdentifierLengthKind;
  /** Character length to write into the identifier cell. */
  length: number;
  shouldAccept: boolean;
  /** Fragment for the Playwright title after the field name. */
  titleSuffix: string;
  identifierField: string;
};

const BUYER_RULE: FieldLengthRule = {
  field: "Buyer identifier",
  min: 1,
  max: 30,
  belowMin: 0,
  aboveMax: 31,
};

const SELLER_RULE: FieldLengthRule = {
  field: "Seller identifier",
  min: 1,
  max: 30,
  belowMin: 0,
  aboveMax: 31,
};

const COMPANIONS: PartyIdentifierCompanion[] = ["none", "scheme", "code", "both"];

function companionLabel(companion: PartyIdentifierCompanion): string {
  if (companion === "none") return "no scheme/code";
  if (companion === "scheme") return "scheme only";
  if (companion === "code") return "code only";
  return "scheme and textual code";
}

function lengthLabel(kind: PartyIdentifierLengthKind, rule: FieldLengthRule): string {
  if (kind === "empty") {
    return rule.belowMin === 0
      ? "empty (below minimum)"
      : `${rule.belowMin} chars (below minimum)`;
  }
  if (kind === "min") {
    return `minimum length (${rule.min} char${rule.min === 1 ? "" : "s"})`;
  }
  if (kind === "max") {
    return `maximum length (${rule.max} chars)`;
  }
  return `${rule.aboveMax} chars (above maximum)`;
}

function shouldAccept(
  companion: PartyIdentifierCompanion,
  kind: PartyIdentifierLengthKind
): boolean {
  if (companion === "none") {
    // Empty trio allowed; identifier without scheme/code is also allowed.
    return kind === "empty" || kind === "min" || kind === "max";
  }
  // Scheme and/or code present → identifier required and must be within length.
  return kind === "min" || kind === "max";
}

function lengthFor(
  kind: PartyIdentifierLengthKind,
  rule: FieldLengthRule
): number {
  if (kind === "empty") return rule.belowMin;
  if (kind === "min") return rule.min;
  if (kind === "max") return rule.max;
  return rule.aboveMax;
}

function buildCasesForParty(
  party: PartyIdentifierParty,
  rule: FieldLengthRule
): PartyIdentifierLengthCase[] {
  const kinds: PartyIdentifierLengthKind[] = [
    "empty",
    "min",
    "max",
    "aboveMax",
  ];
  const cases: PartyIdentifierLengthCase[] = [];
  for (const companion of COMPANIONS) {
    for (const lengthKind of kinds) {
      cases.push({
        party,
        companion,
        lengthKind,
        length: lengthFor(lengthKind, rule),
        shouldAccept: shouldAccept(companion, lengthKind),
        titleSuffix: `${lengthLabel(lengthKind, rule)}, ${companionLabel(companion)}`,
        identifierField: rule.field,
      });
    }
  }
  return cases;
}

export const PARTY_IDENTIFIER_LENGTH_CASES: PartyIdentifierLengthCase[] = [
  ...buildCasesForParty("buyer", BUYER_RULE),
  ...buildCasesForParty("seller", SELLER_RULE),
];
