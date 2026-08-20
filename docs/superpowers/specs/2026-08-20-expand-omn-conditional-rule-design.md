# Design: expand-omn-conditional-rule skill

**Date:** 2026-08-20  
**Status:** Approved

## Goal

When a user pastes any Oman PINT-OM if-then rule, the agent expands **only dimensions named in that rule** (sources, tax categories, document/txn types, exceptions) with Allowed / Not Allowed / exception polarities — without re-reading Peppol or grepping the suite to rediscover coverage.

## Baseline failure

`ALIGNED-IBRP-E-01-OM` shipped line-only (IBT-151). The rule also names IBG-20 / IBT-95 and IBG-21 / IBT-102. The agent treated line Tax Category as enough until the user said “this also applied for all”.

## Approach

New project skill `.cursor/skills/expand-omn-conditional-rule/` (thin `SKILL.md` + `reference.md`).  
`add-conditional-validation-case` requires it before coding.

Polarities: Allowed / Not Allowed / exception / **wrong-target** (treatment allowed only for X, applied to sibling Y → error file).

## Non-goals

- Cartesian explosion of unnamed txn types or unnamed tax categories
- Formula / Σ rules (formula suite)
- Parser script (v1)
- UAE / BTUAE rules
