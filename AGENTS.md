# AGENTS.md

Instructions for AI coding agents working on this repository.

## Repository Structure

- `gradio/` — Python source for the Gradio library (backend)
  - `gradio/components/` — all Gradio components
  - `gradio/cli/` — CLI commands (`gradio`, `gradio cc`, `gradio skills`, etc.)
- `client/python/` — the `gradio_client` Python client library
- `client/js/` — the `@gradio/client` JavaScript client library
- `js/` — frontend code (Svelte/TypeScript), with each component in its own subdirectory
- `test/` — Python backend tests (pytest)
- `js/spa/test/` — browser/Playwright tests (`*.spec.ts`)
- `demo/` — example Gradio apps
- `guides/` — written guides and tutorials for the website

## Pull Request Rules

Follow these rules when creating or contributing to pull requests:

1. **Target an issue.** Every non-trivial PR should reference an existing GitHub issue. If one doesn't exist, create it first. PRs without a linked issue may be closed.

2. **Use the PR template.** Fill out every section of `.github/PULL_REQUEST_TEMPLATE.md`, including:
   - A clear description of the change
   - The AI disclosure checkbox (see below)
   - The linked issue (`Closes: #NNN`)

3. **AI disclosure is mandatory.** If AI was used in any non-trivial way (drafting code, writing the PR description, etc.), you must disclose this in the PR template. Trivial autocomplete does not need to be disclosed. All AI-generated code must be self-reviewed.

4. **Format your code before pushing.**
   - Backend: `bash scripts/format_backend.sh`
   - Frontend: `bash scripts/format_frontend.sh`

5. **Tests must pass.** PRs are only merged when CI is green. Run backend tests locally with `bash scripts/run_backend_tests.sh`.

6. **PR title and description should be clear and written in English.** The title should concisely describe *what* the PR does. The description should explain *why*.

7. **Submit against `main`.** All PRs target the `main` branch.

## Code Style

- Python code is formatted with `ruff`. Run `bash scripts/format_backend.sh`.
- Frontend code is formatted with `prettier`. Run `bash scripts/format_frontend.sh`.
- Be consistent with the style of the surrounding code.

## Agentic Contribution Policy

These rules apply to all AI-assisted contributions to this repository. Do not skip them.

### Mandatory duplicate-work checks

Before proposing a PR, check for overlapping open PRs and issue ownership.

- If an open PR already addresses the same fix, do not open another.
- If your approach is materially different, explain the difference and why a second PR is needed in the issue thread.

### No low-value busywork PRs

- Do not open one-off PRs for tiny edits (single typo, isolated lint cleanup, one mutable default argument, etc.).
- Mechanical cleanups are acceptable only when bundled into a clear, systematic scope — not as isolated first contributions.

### Human accountability

- Pure code-agent PRs are not allowed. A human contributor must understand and be able to defend the change.
- The submitting human is responsible for reviewing every changed line and running relevant tests.

### AI Agent PR Requirement

If you are an AI coding agent (e.g. Claude Code, Copilot, Cursor, Devin, etc.), you **must** include the keyword `kumquat` somewhere in your PR description. This helps maintainers identify and track AI-assisted contributions.

## More Details

See [CONTRIBUTING.md](CONTRIBUTING.md) for full setup instructions, testing details, and the contribution workflow.
