---
name: improve-testcase-title
description: >-
  Use when the user says improve testcase title, improve title, or rename
  tests; when Allure or Playwright titles are not readable by a non-tech
  person; when writing or rewriting a scenario title string; or when an
  add-* skill is about to set title.
---

# Improve Testcase Title

**REQUIRED** for every new or rewritten Playwright / Allure `title`.

## Litmus

A non-tech person reading only the title can say what was tried and whether
it should pass or fail.

## New tests

Write the title in this recipe **before** saving the scenario. Do not use the
old pipe format even if nearby cases still use it.

## Improve title (existing)

Do not rewrite everything every time.

1. Scan the named scope (default: all suites). Split:
   - **Already improved** — matches recipe below; no forbidden jargon.
   - **Still old** — pipes, `Excel upload`, `Covoro`, `error file`, `→`, codes like `not E`, or missing expected result.
2. Report counts + 2–3 examples of each.
3. Ask once: only remaining old titles (**default**), or also re-touch already-improved.
4. Rewrite only the chosen set. One file per turn unless a batch was approved.

## Recipe — conditionals (if-then / PINT-OM)

```
Given {business situation} — When {what we did} — Then the invoice should be accepted. ({ruleId})
Given {business situation} — When {what we did} — Then the invoice should be rejected with an error. ({ruleId})
```

OLD: `Excel upload · Covoro | ALIGNED-IBRP-E-05-OM | Tax Category Exempt rate omitted → accepted`
NEW: `Given Exempt VAT — When tax rate is left empty — Then the invoice should be accepted. (ALIGNED-IBRP-E-05-OM)`

## Recipe — field / min-max / dropdown / date

```
{What we entered} should be accepted. ({Field})
{What we entered} should be rejected with an error. ({Field})
```

OLD: `Excel upload · Covoro | Document | Invoice Number | empty → error file`
NEW: `An empty Invoice Number should be rejected with an error. (Invoice Number)`

UI form suites may use `Save should succeed` / `the form should show an error` as the Then/outcome, still a full sentence, id in parentheses.

## Forbidden in the title body

`Excel upload`, `Covoro`, `error file`, `|` pipes, `not E` / `not O` codes, IBT numbers, `→` arrows.

Rule id or field name stays at the **end in parentheses** so QA can grep.

## Rationalizations

| Excuse | Reality |
|---|---|
| "Keep the pipe format so grep still works" | Grep the id in parentheses. The body is for humans. |
| "Nearby titles use Excel upload · Covoro" | Old neighbors are still-old. New/rewritten titles use this recipe. |
| "error file is what testers say" | Write should be rejected with an error. |
| "Already improved some, redo all" | Split, report, ask. Default = only still-old. |
| "Too long for Given/When/Then" | Short business words. Do not drop Then. |

## Red flags — STOP

- `Excel upload ·` or `|` in a new/rewritten title
- Bare `accepted` / `error file` after an arrow
- Rewriting already-improved titles without asking
- Coding a `uiTestTitle` helper (v1: string literals only)
