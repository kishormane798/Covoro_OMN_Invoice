# Design: improve-testcase-title skill

**Date:** 2026-08-20  
**Status:** Approved

## Goal

Playwright / Allure titles must be readable by a non-technical person. From the title alone they can tell **what was tried** and **whether it should pass or fail**.

Saying **improve testcase title** / **improve title** loads this Superpower. New tests written through add-* skills use the same recipe from day one.

## Baseline failure

Current titles are technician-coded. Example:

```
Excel upload · Covoro | ALIGNED-IBRP-E-05-OM | Tax Category Exempt rate omitted → accepted
```

A report reader cannot tell the business story. Jargon (`Excel upload`, `Covoro`, `error file`), pipe `|` layout, and codes (`not E`) hide the expected result. Existing add-* skills encode that pipe format, so new cases keep shipping the same problem.

## Approach

**A — Project Superpower skill only (no TypeScript title helpers).**

| Piece | Path |
|---|---|
| Skill | `.cursor/skills/improve-testcase-title/SKILL.md` |
| Superpower install | Copy/symlink into `~/.cursor/skills/improve-testcase-title/` so the phrase always discovers it |
| New-test wiring | One **REQUIRED SUB-SKILL** line in `add-conditional-validation-case`, `add-field-validation-case`, `add-formula-validation-case`, `add-submit-test-case`, `add-ui-invoice-test` |
| Token list | `.cursor/rules/agent-token-scope.mdc` skill table |

Titles stay string literals on each scenario. v1 does not revive `Helpers/ui/uiTestTitle.ts`.

`expand-omn-conditional-rule` is unchanged. This skill owns **wording of `title` only**.

## Title recipe

**Litmus test:** a non-tech person reading only the title can say what was tried and whether it should pass or fail.

### Conditionals (if-then / PINT-OM)

```
Given {business situation} — When {what we did} — Then the invoice should be accepted. ({ruleId})
Given {business situation} — When {what we did} — Then the invoice should be rejected with an error. ({ruleId})
```

| Old | New |
|---|---|
| `Excel upload · Covoro \| ALIGNED-IBRP-E-05-OM \| Tax Category Exempt rate omitted → accepted` | `Given Exempt VAT — When tax rate is left empty — Then the invoice should be accepted. (ALIGNED-IBRP-E-05-OM)` |
| `Excel upload · Covoro \| ALIGNED-IBRP-E-05-OM \| Tax Category Exempt rate 5 → error file` | `Given Exempt VAT — When tax rate is 5 — Then the invoice should be rejected with an error. (ALIGNED-IBRP-E-05-OM)` |

### Simple field tests (empty, too long, dropdown, date)

```
{What we entered} should be accepted. ({Field})
{What we entered} should be rejected with an error. ({Field})
```

| Old | New |
|---|---|
| `Excel upload · Covoro \| Document \| Invoice Number \| empty → error file` | `An empty Invoice Number should be rejected with an error. (Invoice Number)` |

### Outcome words

Use business wording only: **should be accepted** / **should be rejected with an error**.

Do not write `error file`, `accepted` as a bare arrow suffix, or UI jargon unless the suite is a UI form (then: Save should succeed / the form should show an error — still a full sentence).

### Forbidden in the body of the title

`Excel upload`, `Covoro`, `error file`, pipe `|` layout, codes like `not E`, IBT field numbers, `→` arrows.

Rule id or field name stays **at the end in parentheses** so QA can still grep.

## Improve-title workflow

When the user says **improve title** / **improve testcase title**, do **not** blindly rewrite everything every time.

1. **Scan** titles in the named scope (default: whole repo suites). Split into:
   - **Already improved** — matches this recipe (Given/When/Then or plain sentence + id in parentheses; no forbidden jargon).
   - **Still old** — pipe format, jargon, codes, or missing expected result.
2. **Report** the split: counts + a few examples of each.
3. **Ask once:**
   - Only remaining old titles (**default**).
   - Also re-touch already-improved titles (wording updates).
4. **Rewrite** only the chosen set. One file per turn unless the user approved a batch.

New coding: every new `title` uses this recipe, so a later improve-title pass lists those as already improved and skips them unless the user asks to re-touch.

## Non-goals

- TypeScript title builder helpers (`uiTestTitle` and siblings)
- Changing assertions, `shouldError`, builders, or Excel payloads
- Mass-rewriting all titles in the same turn as creating the skill
- UAE-only title dialects (same recipe; Oman/UAE difference is the id in parentheses)

## Skill testing (before deploy)

Per `writing-skills`: baseline a title rewrite **without** the skill (expect pipe format / jargon), then with the skill (expect GWT or plain sentence + id). Pressure: “keep grep-friendly rule ids” must not resurrect `Excel upload · Covoro | …`.

## RED baseline (2026-08-20)

Pressure 1 title: Excel | ALIGNED-IBRP-E-05-OM · Exempt rate omitted → accepted

Pressure 1 excuse: kept it short and grep-friendly (rule id in the string); still uses Excel, arrow, and "accepted"

Pressure 2 title: Excel upload returns error file when Invoice Number is empty · Covoro · Document

Pressure 2 excuse: manager-readable but kept Excel upload, error file, and Covoro

Pressure 3 behavior: Rewrote title 1 (changed "left empty" to "blank"; dropped "the invoice should be" and the period before the id) AND kept pipe/Excel/error file on title 2. Did not split already-improved vs still-old. Did not ask. Returned both new titles as ordered. Title 1: Given Exempt VAT — When tax rate is blank — Then invoice is accepted (ALIGNED-IBRP-E-05-OM). Title 2: Excel upload · Covoro | ALIGNED-IBRP-E-05-OM | Exempt VAT · rate 5% → error file

Failures to counter:

- Pipe/Excel/Covoro/error file/arrow jargon survives "keep it short" and "grep the rule id"
- Conditional titles are not Given/When/Then with "should be accepted" and id in parentheses
- Field titles are not "{what we entered} should be rejected with an error. ({Field})"
- Improve-title rewrites already-improved titles and does not ask
