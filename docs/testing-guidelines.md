# Testing Guidelines

This guide defines conventions for writing and maintaining readable, stable tests in this framework.

## Core Principles

- Prefer clarity over cleverness.
- Keep one source of truth for each behavior.
- Isolate flaky recovery logic to Page Objects/helpers, not specs.
- Use domain language in test titles and errors.

## File and Layer Conventions

- Add/modify scenarios in `tests/`.
- Put reusable business flow in `Helpers/`.
- Put selectors + UI actions in `pageObjects/`.
- Put infra/process utilities in `utils/`.
- Put input datasets in `testData/`.

## Spec Authoring Rules

- Import `test` from `Src/baseTest.ts` (not directly from `@playwright/test`).
- Keep each test focused on one end-to-end expectation.
- Prefer data-driven loops when scenario shape is repeated.
- Use explicit timeouts only where business processing is known to be long-running.

## Naming Conventions

- **Spec file names**: `<Flow>_<Template>_Test.spec.ts` (or existing project pattern).
- **Test titles**: include case identity and critical business dimensions.
- **Helper functions**: action-oriented verbs (`runSubmitInvoiceCase`, `openUploadPage`).
- **Page methods**: user-intent methods (`openDashboard`, `waitForAnyStatus`), not implementation details.

## Wait and Retry Policy

- Prefer `expect(...).toBe...` and targeted poll loops over fixed sleeps.
- Use `waitForLocatorWithPageRefresh` when UI may need one controlled refresh.
- Treat refresh/reload as recovery, not a default first action.
- Every retry path should have:
  - bounded attempts
  - clear error if exhausted
  - comment stating the real-world reason

## Selector Policy

Follow `.cursor/skills/playwright-locator-expert/SKILL.md` for priority and rules. Summary:

- Prefer stable identifiers (`getByTestId`, `getByRole`, `getByLabel`, unique stable IDs).
- Use fallback locators only where UI variants exist.
- Avoid broad selectors that can match hidden/duplicate nodes.
- Scope locators to row/container whenever possible.

## Error Message Standards

- Include business context in throws:
  - invoice number
  - expected state
  - actual last state
  - relevant template mode or TIN if applicable
- Avoid generic errors like “not found” without context.

## Data and Workbook Practices

- Keep static templates in `testData/uploads/`.
- Write generated files to worker-isolated generated folders.
- Never assume formulas auto-recalculate; use framework calculation helpers.
- Keep template/header mapping in one place to avoid drift.

## Parallel Safety

- Do not write shared mutable files outside designed generated directories.
- Do not hardcode invoice identifiers that can collide across workers.
- Use worker identity helpers when business-TIN selection matters.

## Reporting and Diagnostics

- Ensure failed tests surface enough evidence without rerunning:
  - console log and API traffic attachments (failure only)
  - workbook attachment
  - Playwright screenshot / trace when enabled

## Code Review Checklist (Readability First)

- Is test intent understandable in under 30 seconds?
- Are waits and retries bounded and justified?
- Is locator strategy robust and scoped?
- Is business logic in helpers (not duplicated across specs)?
- Are error messages actionable?
- Is naming consistent with existing conventions?

## Agent-assisted QA (Cursor)

- Use **scoped prompts** (one spec or page object) and project **skills** — not open-ended “fix all tests.”
- **Graphify** for exploration; **Headroom** for log/diff compression — avoid loading full files into chat.
- **Never accept multi-file agent diffs** without manual review; locators need MCP/snapshot proof.
- Full Bitbucket + Cursor playbook: `docs/qa-cursor-workflow.md`.
