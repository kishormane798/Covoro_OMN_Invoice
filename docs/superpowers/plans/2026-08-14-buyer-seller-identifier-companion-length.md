# Buyer/Seller Identifier XOR Companions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enforce XOR scheme/code dropdown companions for buyer/seller identifiers in field-validation length tests and conditional helpers, with a 24-case length matrix.

**Architecture:** New config matrix drives field-validation Excel generation with companion mode `none|scheme|code`. Conditional `applyPartyIdentifiersByTxnType` and scenario builders set scheme only (clear textual code). Dropdown companions use Master labels.

**Tech Stack:** Playwright + TypeScript, existing Oman Excel seed/`generateInvoiceFromSubmitData`/`patchInvoiceTextCellInFile`.

## Global Constraints

- Never set scheme and textual code together on one row.
- Scheme and textual code are dropdowns only (Master labels).
- Identifier alone is not allowed; empty trio is allowed on Full Tax.
- Prefer scheme-only for conditional overlays that name a scheme.
- Payment `Scheme Identifier` (Title Case last column) is out of scope.
- One focused commit per task; push at end when all tasks done.

---

### Task 1: Config — remove textual-code length rules + add companion matrix

**Files:**
- Modify: `testData/FieldValidations/Min_max_field_validation.ts`
- Create: `testData/FieldValidations/partyIdentifierCompanionLength.ts`
- Modify: `testData/FieldValidations/index.ts` (re-export if needed)

- [ ] **Step 1:** Remove from `fieldValidationConditional`:
  - `"Seller Identifier (textual code)"`
  - `"Buyer Identifier (textual code)"`
- [ ] **Step 2:** Create matrix module exporting:
  - `PartyIdentifierCompanion = "none" | "scheme" | "code"`
  - `PartyIdentifierParty = "buyer" | "seller"`
  - `PartyIdentifierLengthCase` with `party`, `companion`, `lengthKind: "empty"|"min"|"max"|"aboveMax"`, `length`, `shouldAccept`, `titleSuffix`
  - `PARTY_IDENTIFIER_LENGTH_CASES: PartyIdentifierLengthCase[]` — 24 rows matching the design table
  - Field names: buyer `"Buyer identifier"`, seller `"Seller identifier"`; lengths from existing rules (0/1/30/31)
- [ ] **Step 3:** Commit `testData: party identifier companion length matrix`

---

### Task 2: Conditional XOR in party-identifier helpers

**Files:**
- Modify: `Helpers/conditionalValidationHelper.ts` (`applyPartyIdentifiersByTxnType`, `buildBuyerIdentifierSchemeScenarioRow`, seller-identifier builder ~839)

- [ ] **Step 1:** In `applyPartyIdentifiersByTxnType`, when filling seller/buyer identifiers, set **scheme only** and clear textual code (keep identifier value).
- [ ] **Step 2:** In `buildBuyerIdentifierSchemeScenarioRow`, set `Scheme identifier` from scenario; set `Buyer Identifier (textual code)` to `""`.
- [ ] **Step 3:** In seller identifier scenario builder, set scheme field; clear textual code (unless scenario is explicitly code-only — default scheme-only).
- [ ] **Step 4:** Commit `fix: XOR scheme/code in conditional party identifiers`

---

### Task 3: Field-validation overlay + generator

**Files:**
- Modify: `Helpers/fieldValidationExcelPackHelper.ts` (`fillBuyerPartyIdentifierCompanions` / `fillSellerPartyIdentifierCompanions`)
- Modify: `Helpers/omanFieldValidationExcelHelper.ts`

- [ ] **Step 1:** Change companions to XOR default **scheme only** (clear textual code) when overlay still fills for other callers; or stop auto-filling both and rely on the new generator for identifier tests.
- [ ] **Step 2:** Add `generateOmanPartyIdentifierLengthExcel(opts: { party; companion; length })`:
  - seed Full Tax, `skipDependentOverlay: true`
  - patch XOR companions from Master (`schemeIdentifierValidTestData` / `buyerSellerIdentifierCodeValidTestData`)
  - patch identifier to `lengthValue(length)`
  - keep buyer VAT/electronic stamps
- [ ] **Step 3:** Remove temporary empty-buyer-identifier-only special case if superseded by the new API.
- [ ] **Step 4:** Commit `feat: party identifier length Excel with XOR companions`

---

### Task 4: Wire field-validation spec

**Files:**
- Modify: `tests/OMN_FieldValidation_CovoroTemplate_Test.spec.ts`

- [ ] **Step 1:** Add `"Buyer identifier"` and `"Seller identifier"` to a skip set for generic `conditionalLengthConfigs` (textual code already removed from config).
- [ ] **Step 2:** Add describe `Party identifier — companion length` looping `PARTY_IDENTIFIER_LENGTH_CASES`:
  - `shouldAccept` → `uploadAndVerify`
  - else → `runErrorValidation` with identifier field
- [ ] **Step 3:** Commit `test: buyer/seller identifier companion length suite`

---

### Task 5: Verify + push

- [ ] **Step 1:** Smoke-generate 3 buyer workbooks (`none`/`scheme`/`code`) and assert cells XOR.
- [ ] **Step 2:** Run targeted Playwright greps from the design (or as many as environment allows).
- [ ] **Step 3:** `git push` all commits on the current branch.

## Spec coverage

| Spec requirement | Task |
|---|---|
| Field-validation 24-case matrix | 1, 3, 4 |
| Remove textual-code length configs | 1 |
| Conditional XOR helpers | 2 |
| Overlay stop dual-fill | 3 |
| Push when done | 5 |
