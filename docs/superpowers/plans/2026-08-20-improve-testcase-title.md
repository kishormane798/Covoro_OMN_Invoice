# Improve Testcase Title Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. REQUIRED BACKGROUND: `writing-skills` (RED before writing the skill). Also `wait-for-explicit-run` — do not spawn baseline/GREEN subagents until the user says **run**.

**Goal:** Ship a Superpower skill so Playwright/Allure titles are readable by a non-tech person, new add-* cases use that recipe, and “improve title” rewrites only old titles unless the user asks to re-touch.

**Architecture:** One project skill `.cursor/skills/improve-testcase-title/SKILL.md` (recipe + scan/split/ask). Copy into `~/.cursor/skills/improve-testcase-title/` for Superpower discovery. Replace pipe-format title snippets in add-* skills and the Oman conditional rule. Do not add TypeScript title helpers. Do not rewrite existing `title:` strings in this plan.

**Tech Stack:** Cursor Agent Skills (`SKILL.md` YAML frontmatter), project skills under `.cursor/skills/`, Superpowers under `~/.cursor/skills/`.

## Global Constraints

- Litmus: a non-tech person reading only the title knows what was tried and whether it should pass or fail
- Conditionals: `Given {situation} — When {action} — Then the invoice should be accepted|rejected with an error. ({ruleId})`
- Field tests: `{What we entered} should be accepted|rejected with an error. ({Field})`
- Forbidden in title body: `Excel upload`, `Covoro`, `error file`, pipe `|` layout, codes like `not E`, IBT numbers, `→` arrows
- Id stays at the end in parentheses
- Improve-title: scan → split already-improved vs still-old → report → ask once → rewrite only the chosen set
- v1: no `uiTestTitle` helpers; titles stay string literals
- Do not mass-rewrite existing test titles in the same work as creating the skill
- One file per agent turn unless the user approved a batch; this plan’s wiring task is an approved batch
- Do not commit unless the user explicitly asks

## File map

| File | Responsibility |
|---|---|
| `.cursor/skills/improve-testcase-title/SKILL.md` | Title recipe, improve-title workflow, rationalizations |
| `~/.cursor/skills/improve-testcase-title/SKILL.md` | Same file, Superpower discovery |
| `.cursor/skills/add-conditional-validation-case/SKILL.md` | Require this skill; replace pipe title format |
| `.cursor/skills/add-field-validation-case/SKILL.md` | Same |
| `.cursor/skills/add-formula-validation-case/SKILL.md` | Same |
| `.cursor/skills/add-submit-test-case/SKILL.md` | Same |
| `.cursor/skills/add-ui-invoice-test/SKILL.md` | Same |
| `.cursor/rules/conditional-validation-oman.mdc` | Replace titles line |
| `.cursor/rules/agent-token-scope.mdc` | List the skill in the table |

---

### Task 1: RED — baseline title rewrite without the skill

**Files:**
- None (do not create `SKILL.md` yet)

**Interfaces:**
- Produces: documented baseline failures (verbatim titles + excuses) for Task 2 to counter

**REQUIRED:** User must have said **run**. If they have not, skip execution of steps 2–3 and leave this task unchecked.

- [ ] **Step 1: Write the three pressure prompts** (already below — do not invent new ones)

**Pressure 1 — keep grep-friendly (conditional):**

```
Improve this Playwright title. QA must still grep the rule id. Keep it short. Ship in 2 minutes.

OLD: Excel upload · Covoro | ALIGNED-IBRP-E-05-OM | Tax Category Exempt rate omitted → accepted

Return only the new title string.
```

**Pressure 2 — field validation:**

```
Improve this Playwright title so a manager can read the Allure report. Keep the field name for grep.

OLD: Excel upload · Covoro | Document | Invoice Number | empty → error file

Return only the new title string.
```

**Pressure 3 — mixed suite, do not redo:**

```
User said: improve title.

These titles already exist:
1. Given Exempt VAT — When tax rate is left empty — Then the invoice should be accepted. (ALIGNED-IBRP-E-05-OM)
2. Excel upload · Covoro | ALIGNED-IBRP-E-05-OM | Tax Category Exempt rate 5 → error file

Rewrite all titles now. Do not ask questions. Return both new titles.
```

Expected RED (without skill) — at least one of:

- Pressure 1/2 still contain `Excel upload`, `Covoro`, `|`, `error file`, or `→`
- Pressure 1 is not Given/When/Then with `(ALIGNED-IBRP-E-05-OM)` at the end
- Pressure 2 is not a plain sentence ending `(Invoice Number)` with **should be rejected with an error**
- Pressure 3 rewrites title 1 instead of reporting already-improved vs still-old and asking

- [ ] **Step 2: Run Pressure 1–3 WITHOUT the skill**

Dispatch three fresh `generalPurpose` subagents. System: this repo’s default agent, **no** `improve-testcase-title` skill. User message = the pressure prompt. `run_in_background: false`.

- [ ] **Step 3: Record baseline verbatim** into `docs/superpowers/specs/2026-08-20-improve-testcase-title-design.md` under a new heading `## RED baseline (2026-08-20)`:

```
Pressure 1 title:
Pressure 1 excuse:
Pressure 2 title:
Pressure 2 excuse:
Pressure 3 behavior:
Failures to counter:
```

Do not write `SKILL.md` until this heading exists.

---

### Task 2: GREEN — write the skill

**Files:**
- Create: `.cursor/skills/improve-testcase-title/SKILL.md`

**Interfaces:**
- Consumes: Task 1 `Failures to counter`
- Produces: skill name `improve-testcase-title`

- [ ] **Step 1: Confirm `SKILL.md` does not exist**

If it exists from a skipped RED, delete it and complete Task 1 first.

- [ ] **Step 2: Write `.cursor/skills/improve-testcase-title/SKILL.md`** exactly:

```markdown
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
```

- [ ] **Step 3: Word count**

Run: `powershell -NoProfile -Command "(Get-Content -Raw '.cursor/skills/improve-testcase-title/SKILL.md').Split(/\s+/).Count"`

Expected: under 500 words in the body if possible; do not delete recipe examples to hit a number.

---

### Task 3: GREEN verify — same pressures with the skill

**Files:**
- None (read-only)

**Interfaces:**
- Consumes: `.cursor/skills/improve-testcase-title/SKILL.md`

**REQUIRED:** User said **run**.

- [ ] **Step 1: Re-run Pressure 1–3 WITH the skill**

Same three subagent prompts. Each system prompt must include the full `SKILL.md` body and: “Follow improve-testcase-title.”

Pass criteria:

- Pressure 1 equals (allow small synonym of “left empty” / “omitted”): `Given Exempt VAT — When tax rate is left empty — Then the invoice should be accepted. (ALIGNED-IBRP-E-05-OM)`
- Pressure 2 equals: `An empty Invoice Number should be rejected with an error. (Invoice Number)`
- Pressure 3 does **not** change title 1; reports 1 already-improved / 1 still-old; asks which set to rewrite

- [ ] **Step 2: If a pressure fails, add one rationalization row and one red flag, then re-run only the failed pressure** (max one tighten loop)

- [ ] **Step 3: Append `## GREEN verify` to the design spec** with pass/fail per pressure

---

### Task 4: Wire add-* skills and rules (approved batch)

**Files:**
- Modify: `.cursor/skills/add-conditional-validation-case/SKILL.md`
- Modify: `.cursor/skills/add-field-validation-case/SKILL.md`
- Modify: `.cursor/skills/add-formula-validation-case/SKILL.md`
- Modify: `.cursor/skills/add-submit-test-case/SKILL.md`
- Modify: `.cursor/skills/add-ui-invoice-test/SKILL.md`
- Modify: `.cursor/rules/conditional-validation-oman.mdc`
- Modify: `.cursor/rules/agent-token-scope.mdc`

**Interfaces:**
- Consumes: skill name `improve-testcase-title`

- [ ] **Step 1: `add-conditional-validation-case`**

After the existing `REQUIRED SUB-SKILL: Use expand-omn-conditional-rule` line, add:

```
**REQUIRED SUB-SKILL:** Use `improve-testcase-title` for every `title`.
```

Replace the Title format block (the `Excel upload · Covoro | {ruleId} | ...` fence) with:

```
Title: **REQUIRED SUB-SKILL** `improve-testcase-title` (Given/When/Then + rule id).
Do not use `Excel upload · Covoro | ... → accepted|error file`.
```

- [ ] **Step 2: `add-field-validation-case`**

At the top of Workflow, add:

```
**REQUIRED SUB-SKILL:** Use `improve-testcase-title` for every test title.
```

Replace `### 3. Test title format` (including both fences) with:

```
### 3. Test title

**REQUIRED SUB-SKILL:** `improve-testcase-title` (plain sentence + field in parentheses).

Example: `An empty Invoice Number should be rejected with an error. (Invoice Number)`
```

- [ ] **Step 3: `add-formula-validation-case`**

Replace `### 4. Test title` fence `Excel upload · Covoro | Formula | {field} | {inputs} → {outcome}` with:

```
**REQUIRED SUB-SKILL:** `improve-testcase-title`.

Example: `Quantity 2 and unit price 10 should be accepted. (Line totals)`
```

- [ ] **Step 4: `add-submit-test-case`**

Replace the spec pattern title `"Excel upload · Covoro | Submit | ... → delivered"` with:

```
test("Given a Standard Full Tax invoice in OMR — When it is submitted — Then the invoice should be delivered. (Submit)", async ({ page }) => {
```

In the checklist, replace `Test title includes type code, currency, tax dimensions` with:

```
- [ ] Title follows `improve-testcase-title` (business sentence or Given/When/Then + id)
```

Add at top of Workflow:

```
**REQUIRED SUB-SKILL:** Use `improve-testcase-title` for every test title.
```

- [ ] **Step 5: `add-ui-invoice-test`**

Replace the example `test("Create Invoice UI | Section | condition → outcome"` and `### 4. Test title format` fence with:

```
test("When creating an invoice, an empty Invoice Number should be rejected with an error. (Invoice Number)", async ({ page }) => {
```

```
### 4. Test title

**REQUIRED SUB-SKILL:** `improve-testcase-title`.
```

- [ ] **Step 6: `conditional-validation-oman.mdc`**

Replace:

`- Titles: \`Excel upload · Covoro | {ruleId} | {condition} → {accepted|error file}\``

with:

`- Titles: **REQUIRED SUB-SKILL** \`improve-testcase-title\` (Given/When/Then + rule id). Never \`Excel upload · Covoro | ...\``

- [ ] **Step 7: `agent-token-scope.mdc`**

In the skill-first list, after `expand-omn-conditional-rule`, add:

```
- `improve-testcase-title` — Allure/Playwright titles a non-tech person can read; also when the user says improve title
```

---

### Task 5: Install as Superpower

**Files:**
- Create: `C:\Users\Kishor Mane\.cursor\skills\improve-testcase-title\SKILL.md` (copy of the project skill)

**Interfaces:**
- Consumes: `.cursor/skills/improve-testcase-title/SKILL.md`

- [ ] **Step 1: Copy**

Run:

```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.cursor\skills\improve-testcase-title" | Out-Null
Copy-Item -Force ".cursor\skills\improve-testcase-title\SKILL.md" "$env:USERPROFILE\.cursor\skills\improve-testcase-title\SKILL.md"
```

- [ ] **Step 2: Confirm both files exist and are identical**

Run:

```powershell
fc.exe /b ".cursor\skills\improve-testcase-title\SKILL.md" "$env:USERPROFILE\.cursor\skills\improve-testcase-title\SKILL.md"
```

Expected: `FC: no differences encountered`

---

## Self-review (plan vs spec)

| Spec section | Task |
|---|---|
| Goal / Superpower + phrase | Task 2 description + Task 5 |
| Baseline failure | Task 1 RED |
| Approach A, no helpers | Task 2 red flags |
| Title recipe GWT + field | Task 2 body |
| Improve-title scan/split/ask | Task 2 body + Task 3 Pressure 3 |
| New tests via add-* | Task 4 |
| Non-goal: no mass rewrite with skill create | Global Constraints + no testData edits |
| Skill testing RED/GREEN | Tasks 1 and 3 |
| agent-token-scope | Task 4 Step 7 |
