---
name: expand-omn-conditional-rule
description: >-
  Use when the user pastes or names an Oman PINT-OM if-then rule
  (ALIGNED-IBRP-*-OM, IBR-*-OM), says check rule covered / is this covered /
  coverage, or pastes Invoice Type / UNCL codes with a rule. Also when they say
  cover all, applied for all, expand across types / tax categories, or when a
  treatment allowed only for X must error if applied to Y.
---

# Expand Oman Conditional Rule

**REQUIRED BACKGROUND:** `add-conditional-validation-case` (COND) or
`add-formula-validation-case` (FORMULA / Σ). Inventory triage in
[add-conditional-validation-case/reference.md](../add-conditional-validation-case/reference.md).

Parse the **pasted rule only**. Do not invent unnamed dimensions. Do not skip named ones.
When the user pastes **codes** (UNCL Invoice Type, bit-strings, `"E"`/`"S"`), resolve them via
[reference.md](reference.md) and show **label (code)** in the report.

## Modes (REQUIRED)

| User intent | Mode | Allowed actions |
|---|---|---|
| check / covered / coverage / “is this rule covered” | **Check** | Fill card → search suite → report Covered / Not covered → **ask** if Missing |
| yes / implement / add them / go ahead and add (after a Check ask) | **Implement** | Fill Missing polarities (one `ruleId` per turn) |
| cover all / expand / add this rule (no prior Check) | **Implement** after card | Still show Covered / Not covered first in the same turn, then edit only if Missing was empty **or** user already approved implement |

**Check never edits files.** If **Missing** is non-empty after Check, stop and ask:

> Some cases for `{ruleId}` are not covered. Do you want me to implement them? Reply **yes** to implement.

Do **not** implement on “try”, “check”, “verify”, or “see what’s missing”. Wait for **yes** / **implement** / **add them**.

## Coverage card (REQUIRED before any file edit)

Fill this, then report. **Implement** only when Missing is empty *or* user approved Implement.

```
RuleId:
Suite:            (COND → ConditionalValidation | FORMULA → FormulaValidation)
Sources:          (line / allowance / charge / breakdown — only if named)
Tax categories:   (S / E / Z / O — only if named; show label + code when user gave codes)
Invoice types:    (381 / 383 / 261 / 389 — only if named; resolve code → Excel label)
Per-type tests:   (one Playwright test per named invoice type × polarity — not one combined type)
Txn types:        (only labels/bits named, e.g. Simplified / X1XXXXXXXXXXXXXXXXXX)
Exceptions:       (unless / except / not required)
Only-for X:       (the scoped IF — this category / txn / source)
Wrong-target Y:   (one sibling in the same dimension)
Polarities:       Allowed(X) + Not Allowed(X) + Exception(X) + Wrong-target (T on Y → error)
Helpers:
Covered:          (polarities / sources / types already present in repo)
Not covered:      (required polarities / sources / types with no matching test)
Missing:          (same as Not covered; empty only when fully covered)
```

### Coverage report (REQUIRED on every Check)

After the card, print a short report:

```
## {ruleId} coverage
Suite: COND | FORMULA | …
Covered:
- …
Not covered:
- …
Next: {ask to implement OR “fully covered — nothing to add”}
```

When the user provided a **code table** or numeric codes, each Invoice types / Tax categories line must include both forms, e.g. `Credit note (381)`, `Exempt (E)`.

When **Invoice types** lists more than one value, **Per-type tests** must name each type with its own Allowed and Not Allowed case (`expandAcrossCnDnSelfBilledTypes` / `expandAcrossSelfBilledDocumentTypes`). One Credit note row does not cover Debit note or Self billed credit note. If any named type is collapsed into a combined test, put it on **Missing** and stop.

Maps and `expandAcross*` names: [reference.md](reference.md).

## Token rules

- Pasted text complete → do not fetch Peppol or read the full spec/helper.
- Truncated sheet line (`IBT-` cut off) → Peppol `{ruleId}` page only.
- User pastes Invoice Type **codes** without labels → resolve via [reference.md](reference.md) IBT-003 table; do not invent codes not in that table or the paste.
- Reuse existing `expandAcross*` / `source: line|allowance|charge`. For **Check**, search by `ruleId` in `testData/` + `Helpers/` + `tests/` (and formula helpers if Suite = FORMULA). Do not grep the whole suite to rediscover expansion helpers when implementing.

## After the card

- **Check:** report + ask if Missing non-empty. Stop.
- **Implement (approved):** same write path as `add-conditional-validation-case` or `add-formula-validation-case`. One `ruleId` per turn.

## VAT breakdown (IBG-23 / IBT-116 / IBT-117 / IBT-118) on Excel upload

VAT breakdown fields are **UI + backend**. The platform maps them from invoice / transaction type and line (and doc allowance/charge) tax categories. Covoro Excel has **no IBG-23 sheet columns**.

| Do | Do not |
|---|---|
| Provide correct line / doc / total values on the template | Blank `Invoice Total Amount Without Tax` (or other totals) to “omit IBT-116” |
| Assert **file upload + status** (accepted / error file) | Drive or assert raw IBG-23 UI controls in the Excel upload suite |
| For Simplified + E exception: keep taxable/total values populated → expect accepted | Treat clearing a total column as the Peppol “IBT-116 not required” omit |

**Simplified exception (e.g. E-08):** Excel case = Simplified Tax Invoice + category E + **values present** → upload accepted. Do not clear totals to simulate omit; backend maps VAT breakdown.

**Σ / mismatch (FORMULA):** still allowed to patch a calculated total **wrong** (e.g. corrupt `Invoice Total Amount Without Tax`) to expect an error file — that is mismatch, not omit.

Mark pure IBG-23 omit / presence (UI-only) as **Not covered (Excel N/A — UI/backend)** on the coverage card when the rule’s only gap is blanking breakdown fields.

## Wrong-target negative (REQUIRED)

When treatment **T** is allowed **only for X**, clone that Allowed row, switch X → **Y**, expect **error file**.

| X (only-for) | T (allowed on X) | Y (apply T here) | Expect |
|---|---|---|---|
| Category E | omit tax rate | Standard (or other named sibling) | error |
| Simplified | omit VAT breakdown | Full Tax | error |
| Line only (IBG-25 named, not IBG-20/21) | line T on allowance/charge | allowance or charge | error |

Pick **one** Y per X-scope. Do not cartesian every sibling. If Not Allowed is already T on Y, reuse that row — do not duplicate.

**Not this:** Y without T (rule does not fire) → accepted control. That is not the wrong-target error.

## Example

E-05 — T = omit tax rate, only for category E:

```
Only-for X: E
Wrong-target Y: Standard
Polarities: E+omit accepted / E+rate error / Standard+omit error
Missing: (empty)
```

E-01 — T = omit E breakdown, only for Simplified; sources are line **or** allowance **or** charge (all in scope, not Y):

```
Wrong-target Y: Full Tax + omit (same row as Not Allowed — do not duplicate)
Missing: empty only if line, allowance, and charge each have Allowed + Not Allowed + Simplified
```

Check example (Missing non-empty):

```
Covered: (none for E-08)
Not covered: Allowed sum match; Not Allowed mismatch; Simplified + E accepted (values present)
Next: ask “Reply yes to implement”
Note: IBG-23 omit via blanking Excel totals = N/A (UI/backend auto-map)
```

## Rationalizations

| Excuse | Reality |
|---|---|
| "Line Tax Category is the IBT-118 proxy, so line covers the rule" | Proxy is the THEN. Named IBG-20/IBG-21 still need their own IF cases. |
| "Full Tax stands in for every txn type" | Only unnamed types. Named Simplified (or others) get their own case. |
| "One Credit note test covers 381 / 383 / 261" | Each named invoice type is its own Playwright test. Fill Per-type tests. |
| "Y without the IF is accepted, so skip Y+T" | Non-trigger ≠ wrong-target. T allowed only for X and applied to Y → error. |
| "Need Peppol to be sure" | Fetch only if the paste is truncated. |
| "Check found gaps, so start coding" | Check asks first. Implement only after **yes**. |
| "User gave invoice type codes, so expand every code in the table" | Only codes **named in the rule text** (or explicitly scoped by the user for this rule). The table is a lookup, not a cartesian. |
| "Simplified is missing from Invoice Type Code list" | Simplified is BTOM-001 / txn type (`X1…`), not IBT-003. |
| "Blank Invoice Total Amount Without Tax to omit IBT-116" | VAT breakdown is UI/backend auto-map. Excel: provide values; assert upload status. |
| "Blank Invoice Total Tax Amount to omit IBT-117 (E-09)" | Same rule. Simplified + E → provide `0` (or correct value); do not clear the proxy column. |

## Red flags — STOP

- Coding before a coverage card
- Coding on Check without an explicit **yes** / implement
- One source when the rule lists `or` / several IBT codes
- One test standing in for several named invoice types (CN covering DN / 261)
- Skipping `unless` / `except`
- Allowed-for-X with no wrong-target Y error
- Opening Peppol or a full `*.spec.ts` when the paste is complete
- Treating a pasted Invoice Type code table as “every type must be tested” for a rule that does not name those types
- Blanking Excel total columns to fake IBG-23 / IBT-116 omit on Simplified (or any txn)
