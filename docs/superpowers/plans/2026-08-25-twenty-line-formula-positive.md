# 20-line Formula Positive Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 5 OMR-only positive formula upload tests with 20 lines (mixed + same-category × 4), cycling Z/E exemption reasons.

**Architecture:** Extend `formulaValidationHelper.ts` to build 20 header-key submit rows and generate via `generateInvoiceFromSubmitRows`. Spec adds one describe with 5 thin tests calling a new runner. Existing 1/2-line paths stay untouched.

**Tech Stack:** Playwright, TypeScript, existing formula helper + `generateInvoiceFromSubmitRows`, Oman masters in `Master.omnCore.ts`.

## Global Constraints

- OMR only for these 5 cases
- Positive / accept only (`uploadAndVerify`)
- Exactly 20 lines per case
- Z/E reasons: `reasons[i % length]` after exhausting masters
- Do not change 1-line / 2-line formula behavior
- Do not run tests until the user says **run**

---

## File map

| File | Role |
|---|---|
| `Helpers/excel/formulaValidationHelper.ts` | Row builders + `runPositiveTwentyLineFormulaScenario` |
| `tests/OMN_FormulaValidation_CovoroTemplate_Test.spec.ts` | 5 OMR positive tests |

---

### Task 1: Helper — 20-line builders + runner

**Files:**
- Modify: `Helpers/excel/formulaValidationHelper.ts`

- [x] Add exported case ids / type for the five scenarios
- [x] Add `cycleReason(list, index)` and per-line tax defs (Standard / Zero / Exempt / Not subject) reusing FV + master labels
- [x] Add `buildTwentyLineFormulaSubmitRows(kind)` → 20 `Record<string, string>` via existing `buildFormulaSubmitRow` / companions; line 1 keeps doc amounts, lines 2–20 zero doc charges/allowances/paid/rounding
- [x] Add `generateTwentyLineFormulaWorkbook` using `generateInvoiceFromSubmitRows` + buyer VAT/EL patch on all 20 data rows (same pattern as 2-line)
- [x] Add `runPositiveTwentyLineFormulaScenario(page, kind)` → generate + `uploadAndVerify`

### Task 2: Spec — 5 OMR positive tests

**Files:**
- Modify: `tests/OMN_FormulaValidation_CovoroTemplate_Test.spec.ts`

- [x] Import new runner + case list
- [x] Add `describe("Multi-line (20 lines) — positive (OMR)")` with parallel config
- [x] One test per case; title includes mix/same category and accept outcome
- [x] Template skip guard consistent with other formula describes if headers missing

### Task 3: Ready for run

- [x] List the 5 test titles and grep command for the user
- [x] Do **not** execute until user says **run**
