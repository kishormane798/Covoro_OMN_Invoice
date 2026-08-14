# QA workflow — Cursor + Bitbucket (L4 playbook)

Governed workflow for writing and reviewing UAE E-Invoice tests with Cursor while controlling token cost and review risk.

## Principles

| Control | What it does |
|---------|----------------|
| **Headroom** | Compresses logs, diffs, and tool output (proxy + RTK + CCR retrieve) before they fill the context window |
| **GitNexus** | Call-chain / dependency graph via MCP (`gitnexus analyze`) — structural search without full-file reads |
| **Graphify** | Optional knowledge graph via `graphify-out/` — complements GitNexus for cross-doc exploration |
| **Scoped rules** | Agent stays in `tests/`, `pageObjects/`, `utils/` per `.cursor/rules/*.mdc` |
| **Incremental edits** | One file or one test per agent turn; manual diff review before accept |
| **Locator verification** | Playwright MCP / snapshot required — never merge chat-only guesses |

## Team workflow (Bitbucket)

```
main ──► feature branch ──► write/edit tests ──► push ──► Cursor review ──► PR ──► human sign-off ──► merge
```

### Steps

1. **Branch** — Create a feature branch from `main` in Bitbucket (e.g. `feature/covoro-invoice-number-empty`).
2. **Author** — Edit tests with Cursor using project rules and skills:
   - `add-field-validation-case`, `add-submit-test-case`, `add-ui-invoice-test`, etc.
   - Scope prompts to a single spec or page object (see `incremental-agent-edits` rule).
3. **Push** — Commit test/pageObject changes; push to the remote branch.
4. **Cursor review** — Run Cursor PR or code review on the **diff** (not the whole repo). Reject multi-file drive-by edits.
5. **PR** — Open a Bitbucket pull request for human sign-off and CI.
6. **Merge** — Merge after review + green pipeline.

### Positive pattern

Direct test authoring → push → **Cursor review on diff** → PR. Avoid “fix everything in one agent session.”

## Token setup (one-time per machine)

### GitNexus (installed)

```powershell
npm install -g gitnexus@latest
gitnexus setup          # MCP + skills for Cursor
cd <repo-root>
gitnexus analyze        # index repo → .gitnexus/ (gitignored)
```

Re-run `gitnexus analyze` after large refactors. MCP server: `gitnexus mcp` (configured in `~/.cursor/mcp.json`).

### Headroom (Windows — installed v0.20.15)

Latest `headroom-ai` (0.21+) has **no Windows wheels** yet; it needs MSVC Build Tools + Rust to compile. This machine uses the last pip wheel:

```powershell
pip install "headroom-ai[mcp,proxy]==0.20.15" fastapi uvicorn
```

Add Python Scripts to PATH (once per user):

```powershell
[Environment]::SetEnvironmentVariable(
  "Path",
  $env:Path + ";$env:APPDATA\Python\Python313\Scripts",
  "User"
)
```

Then:

```powershell
headroom proxy --port 8787          # compress all traffic (optional)
headroom mcp serve                  # on-demand compress/retrieve (MCP in Cursor)
```

For full proxy + CCR in Cursor, set Anthropic/OpenAI base URL to `http://127.0.0.1:8787/v1` while `headroom proxy` is running.

**Upgrade path (when MSVC installed):** `pip install "headroom-ai[all]"` then `headroom wrap cursor`.

Use RTK-aware shell commands in agent sessions (`git diff --stat`, targeted `npx playwright test <file>`).

### Graphify

```bash
# From repo root — first time
/graphify .

# After code changes
graphify update .

# Explore without full-file reads
/graphify query "How does submit delivery polling work?" --budget 1500
```

Regenerate after large refactors. `graphify-out/` is gitignored.

## Locator changes

Use skill **`playwright-locator-expert`** (`.cursor/skills/playwright-locator-expert/`).

1. Reproduce the UI step (local run or trace).
2. Capture **Playwright MCP** or browser snapshot for the target control.
3. Apply locator priority: `getByTestId` → `getByRole` → `getByLabel` → … (see skill).
4. Update locator in `pageObjects/**` only.
5. Include snapshot evidence in PR description when the selector is non-obvious.

## Review gates (never skip)

- [ ] Diff is limited to the stated test or page object
- [ ] No raw selectors added to `tests/`
- [ ] Locator changes have snapshot/MCP confirmation
- [ ] Multi-file diffs were explicitly requested and each file reviewed
- [ ] Targeted npm script run passes (e.g. `npm run test:covoro -- tests/...`)

## Related docs

- `docs/testing-guidelines.md` — naming, waits, selectors
- `docs/newcomer-guide.md` — repo map and execution model
- `.cursor/rules/agent-token-scope.mdc` — scope and exploration
- `.cursor/rules/incremental-agent-edits.mdc` — single-change discipline
- `.cursor/rules/locator-verification.mdc` — selector ground truth
- `.cursor/skills/playwright-locator-expert/SKILL.md` — locator priority, rules, output format

## Rollout checklist (L4)

- [ ] QA trained on branch → skill-scoped prompt → push → diff review → PR
- [ ] Headroom enabled on QA workstations (proxy and/or MCP)
- [ ] GitNexus index built (`gitnexus analyze` → `.gitnexus/` present locally)
- [ ] Team agrees: **no multi-file agent accept without manual diff review**
