/**
 * CL-06-OM companion codelist: Buyer/Seller identifier with XOR companion.
 * Covoro has two dropdowns — each uses its own Master:
 * - Scheme Identifier → schemeIdentifierValidTestData (ICD)
 * - Buyer/Seller Identifier (textual code) → buyerSellerIdentifierCodeValidTestData
 *   (Peppol IBT-046-1 / IBT-029-1 @schemeName list: Civil ID, CR, …)
 *
 * Positive cases: one Playwright test per party × companion, multi-row Excel
 * (same pattern as dropdown master packs). Negatives stay single-value.
 * Omit is already covered by party-identifier companion `none`.
 */
import { schemeIdentifierValidTestData } from "../Master/Master";
import { buyerSellerIdentifierCodeValidTestData } from "../Master/Master.omnCore";

export const CL06_OM_RULE_ID = "CL-06-OM";
export const CL06_OM_INVALID_SCHEME = "NOT-A-BUYER-SELLER-SCHEME";
export const CL06_OM_INVALID_ICD_SCHEME = "NOT-A-SCHEME-IDENTIFIER";

export type Cl06OmParty = "buyer" | "seller";
export type Cl06OmCompanion = "scheme" | "code";

const BUYER_SCHEME_FIELD = "Scheme identifier";
const BUYER_CODE_FIELD = "Buyer Identifier (textual code)";
const SELLER_SCHEME_FIELD = "Seller identifier - Scheme identifier";
const SELLER_CODE_FIELD = "Seller Identifier (textual code)";

export type Cl06OmPositivePack = {
  ruleId: string;
  title: string;
  party: Cl06OmParty;
  companion: Cl06OmCompanion;
  companionField: string;
  identifier: string;
  master: { label: string }[];
};

export type Cl06OmNegativeScenario = {
  ruleId: string;
  title: string;
  party: Cl06OmParty;
  companion: Cl06OmCompanion;
  companionValue: string;
  identifier: string;
  expectedErrorField: string;
};

function uniqueMasterLabels(
  master: readonly { label: string }[]
): { label: string }[] {
  const seen = new Set<string>();
  const out: { label: string }[] = [];
  for (const item of master) {
    if (seen.has(item.label)) continue;
    seen.add(item.label);
    out.push(item);
  }
  return out;
}

function partyMeta(party: Cl06OmParty): {
  who: "Buyer" | "Seller";
  schemeField: string;
  codeField: string;
  identifier: string;
} {
  if (party === "buyer") {
    return {
      who: "Buyer",
      schemeField: BUYER_SCHEME_FIELD,
      codeField: BUYER_CODE_FIELD,
      identifier: "OM-BUYER-001",
    };
  }
  return {
    who: "Seller",
    schemeField: SELLER_SCHEME_FIELD,
    codeField: SELLER_CODE_FIELD,
    identifier: "OM-SELLER-001",
  };
}

function companionMeta(
  party: Cl06OmParty,
  companion: Cl06OmCompanion
): {
  who: "Buyer" | "Seller";
  companionField: string;
  companionLabel: string;
  identifier: string;
  master: { label: string }[];
  invalidValue: string;
} {
  const { who, schemeField, codeField, identifier } = partyMeta(party);
  if (companion === "scheme") {
    return {
      who,
      companionField: schemeField,
      companionLabel: "Scheme Identifier",
      identifier,
      master: uniqueMasterLabels(schemeIdentifierValidTestData),
      invalidValue: CL06_OM_INVALID_ICD_SCHEME,
    };
  }
  return {
    who,
    companionField: codeField,
    companionLabel: "Identifier (textual code)",
    identifier,
    master: uniqueMasterLabels(buyerSellerIdentifierCodeValidTestData),
    invalidValue: CL06_OM_INVALID_SCHEME,
  };
}

function positivePack(
  party: Cl06OmParty,
  companion: Cl06OmCompanion
): Cl06OmPositivePack {
  const { who, companionField, companionLabel, identifier, master } =
    companionMeta(party, companion);
  return {
    ruleId: CL06_OM_RULE_ID,
    title: `Given a ${who} identifier — When ${companionLabel} uses the master list — Then the invoice should be accepted. (${CL06_OM_RULE_ID} / ${companion})`,
    party,
    companion,
    companionField,
    identifier,
    master,
  };
}

function negativeScenario(
  party: Cl06OmParty,
  companion: Cl06OmCompanion
): Cl06OmNegativeScenario {
  const { who, companionField, companionLabel, identifier, invalidValue } =
    companionMeta(party, companion);
  return {
    ruleId: CL06_OM_RULE_ID,
    title: `Given a ${who} identifier — When ${companionLabel} is not on the master list — Then the invoice should be rejected with an error. (${CL06_OM_RULE_ID} / ${companion})`,
    party,
    companion,
    companionValue: invalidValue,
    identifier,
    expectedErrorField: companionField,
  };
}

/** One multi-row Excel pack per party × companion (dropdown-style). */
export const CL06_OM_POSITIVE_PACKS: Cl06OmPositivePack[] = [
  positivePack("seller", "scheme"),
  positivePack("seller", "code"),
  positivePack("buyer", "scheme"),
  positivePack("buyer", "code"),
];

/** Single-value invalid companion (not batched). */
export const CL06_OM_NEGATIVE_SCENARIOS: Cl06OmNegativeScenario[] = [
  negativeScenario("seller", "scheme"),
  negativeScenario("seller", "code"),
  negativeScenario("buyer", "scheme"),
  negativeScenario("buyer", "code"),
];
