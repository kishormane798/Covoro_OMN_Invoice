/**
 * CL-06-OM: if Buyer (IBT-046-1) or Seller (IBT-029-1) scheme is provided,
 * it must be coded with the Buyer/Seller Identifier list.
 * Omit is already covered by party-identifier companion `none`.
 */
import { buyerSellerIdentifierCodeValidTestData } from "../Master/Master.omnCore";

export const CL06_OM_RULE_ID = "CL-06-OM";
export const CL06_OM_INVALID_SCHEME = "NOT-A-BUYER-SELLER-SCHEME";

export type Cl06OmParty = "buyer" | "seller";

export type Cl06OmIdentifierSchemeScenario = {
  ruleId: string;
  title: string;
  party: Cl06OmParty;
  schemeValue: string;
  identifier: string;
  shouldError: boolean;
  expectedErrorField: string;
};

const BUYER_SCHEME_FIELD = "Scheme identifier";
const SELLER_SCHEME_FIELD = "Seller identifier - Scheme identifier";

function partyMeta(party: Cl06OmParty): {
  who: "Buyer" | "Seller";
  schemeField: string;
  identifier: string;
} {
  if (party === "buyer") {
    return {
      who: "Buyer",
      schemeField: BUYER_SCHEME_FIELD,
      identifier: "OM-BUYER-001",
    };
  }
  return {
    who: "Seller",
    schemeField: SELLER_SCHEME_FIELD,
    identifier: "OM-SELLER-001",
  };
}

function allowedScenarios(party: Cl06OmParty): Cl06OmIdentifierSchemeScenario[] {
  const { who, schemeField, identifier } = partyMeta(party);
  return buyerSellerIdentifierCodeValidTestData.map((item) => ({
    ruleId: CL06_OM_RULE_ID,
    title: `Given a ${who} identifier — When the scheme is ${item.label} — Then the invoice should be accepted. (${CL06_OM_RULE_ID})`,
    party,
    schemeValue: item.label,
    identifier,
    shouldError: false,
    expectedErrorField: schemeField,
  }));
}

function notAllowedScenario(party: Cl06OmParty): Cl06OmIdentifierSchemeScenario {
  const { who, schemeField, identifier } = partyMeta(party);
  return {
    ruleId: CL06_OM_RULE_ID,
    title: `Given a ${who} identifier — When the scheme is not on the Buyer/Seller Identifier list — Then the invoice should be rejected with an error. (${CL06_OM_RULE_ID})`,
    party,
    schemeValue: CL06_OM_INVALID_SCHEME,
    identifier,
    shouldError: true,
    expectedErrorField: schemeField,
  };
}

export const CL06_OM_IDENTIFIER_SCHEME_SCENARIOS: Cl06OmIdentifierSchemeScenario[] =
  [
    ...allowedScenarios("seller"),
    ...allowedScenarios("buyer"),
    notAllowedScenario("seller"),
    notAllowedScenario("buyer"),
  ];
