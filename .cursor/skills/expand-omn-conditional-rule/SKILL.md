---
name: expand-omn-conditional-rule
description: >-
  Use when the user pastes or names an Oman PINT-OM if-then rule
  (ALIGNED-IBRP-*-OM, IBR-*-OM) and coverage must include every source, tax
  category, invoice type, or exception that rule text names. Also when they say
  cover all, applied for all, expand across types / tax categories, or when a
  treatment allowed only for X must error if applied to Y.
---

# Expand Oman Conditional Rule

**REQUIRED BACKGROUND:** `add-conditional-validation-case` (files, titles, spec loop).

Parse the **pasted rule only**. Do not invent unnamed dimensions. Do not skip named ones.

## Coverage card (REQUIRED before any file edit)

Fill this, then code. If **Missing** is not empty, stop.

```
RuleId:
Sources:          (line / allowance / charge / breakdown — only if named)
Tax categories:   (S / E / Z / O — only if named)
Invoice types:    (381 / 383 / 261 / 389 — only if named)
Txn types:        (only labels/bits named, e.g. Simplified)
Exceptions:       (unless / except / not required)
Only-for X:       (the scoped IF — this category / txn / source)
Wrong-target Y:   (one sibling in the same dimension)
Polarities:       Allowed(X) + Not Allowed(X) + Exception(X) + Wrong-target (T on Y → error)
Helpers:
Missing:
```

Maps and `expandAcross*` names: [reference.md](reference.md).

## Token rules

- Pasted text complete → do not fetch Peppol or read the full spec/helper.
- Truncated sheet line (`IBT-` cut off) → Peppol `{ruleId}` page only.
- Reuse existing `expandAcross*` / `source: line|allowance|charge`. Do not grep the suite to rediscover expansion.

## After the card

Same write path as `add-conditional-validation-case`. One `ruleId` per turn.

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

## Rationalizations

| Excuse | Reality |
|---|---|
| "Line Tax Category is the IBT-118 proxy, so line covers the rule" | Proxy is the THEN. Named IBG-20/IBG-21 still need their own IF cases. |
| "Full Tax stands in for every txn type" | Only unnamed types. Named Simplified (or others) get their own case. |
| "Y without the IF is accepted, so skip Y+T" | Non-trigger ≠ wrong-target. T allowed only for X and applied to Y → error. |
| "Need Peppol to be sure" | Fetch only if the paste is truncated. |

## Red flags — STOP

- Coding before a coverage card
- One source when the rule lists `or` / several IBT codes
- Skipping `unless` / `except`
- Allowed-for-X with no wrong-target Y error
- Opening Peppol or a full `*.spec.ts` when the paste is complete
