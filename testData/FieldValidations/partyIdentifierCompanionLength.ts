/**
 * Buyer/Seller identifier free-text length cases with scheme/code companions.
 * Identifier may stand alone; scheme and/or textual code require identifier.
 * Empty/companion presence XOR is covered by Conditional PARTY-ID — this suite
 * only asserts min / max / above-max length under each companion mode.
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
  if (companion === "none") return "no scheme or textual code";
  if (companion === "scheme") return "scheme only";
  if (companion === "code") return "textual code only";
  return "scheme and textual code";
}

function lengthLabel(kind: PartyIdentifierLengthKind, rule: FieldLengthRule): string {
  if (kind === "empty") {
    return rule.belowMin === 0 ? "an empty value" : `${rule.belowMin} characters`;
  }
  if (kind === "min") {
    return `minimum length (${rule.min} character${rule.min === 1 ? "" : "s"})`;
  }
  if (kind === "max") {
    return `maximum length (${rule.max} characters)`;
  }
  return `${rule.aboveMax} characters (above maximum)`;
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
  // Presence empty/companion XOR lives in Conditional PARTY-ID; Field keeps length only.
  const kinds: PartyIdentifierLengthKind[] = ["min", "max", "aboveMax"];
  const cases: PartyIdentifierLengthCase[] = [];
  for (const companion of COMPANIONS) {
    for (const lengthKind of kinds) {
      cases.push({
        party,
        companion,
        lengthKind,
        length: lengthFor(lengthKind, rule),
        shouldAccept: shouldAccept(companion, lengthKind),
        titleSuffix: `${lengthLabel(lengthKind, rule)} and ${companionLabel(companion)}`,
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
