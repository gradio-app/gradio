---
name: gradio-issue-fixer
description: Reproduce, diagnose, fix, verify, and draft-PR Gradio GitHub issues, including public before/after Hugging Face Spaces deployed with the hf CLI and linked in the PR description. Use when the user provides a gradio-app/gradio issue URL or issue number and wants an agent to create an isolated worktree, build a minimal untracked reproduction demo, confirm the bug, patch Gradio, verify the fix, and open a draft PR.
---

# Gradio Issue Fixer

## Defaults

- Use the local Gradio repository at `~/Desktop/Developer/gradio`.
- Create issue worktrees under `~/Desktop/Developer/gradio-worktrees/issue-<number>`.
- Use `gh` for GitHub issue, pull request, and CI operations.
- Use the official Hugging Face `hf` CLI for Space operations.
- Keep the reproduction demo and Space upload directories temporary and untracked.
- Leave the verified local demo running at the end and report its URL.

## Workflow

1. Resolve the issue input.
   - Accept either a bare issue number or a GitHub issue URL.
   - Run `scripts/setup_gradio_issue.py <issue-or-url>` from this skill directory.
   - Read the printed issue title, state, worktree path, branch name, and metadata file path.
   - If the issue is closed, still inspect it unless the user explicitly asked to skip closed issues; closed regressions may still be reproducible.

2. Read the issue and check for duplicate work.
   - Use `gh issue view <number> --repo gradio-app/gradio --comments` when the script output is not enough.
   - Extract the expected behavior, actual behavior, repro steps, affected component, likely version range, and any maintainer guidance.
   - Search open pull requests for overlapping fixes and check whether someone already owns the issue. Do not open a duplicate PR.

3. Build a minimal repro demo in the worktree.
   - Put it in a clearly named untracked file such as `demo_issue_<number>.py`.
   - Keep it small and focused on the reported behavior.
   - Prefer Gradio APIs that match the issue report. Avoid unrelated dependencies.
   - Run the demo from the worktree against the local package under test.

4. Verify the bug before editing source.
   - Exercise the demo exactly enough to observe the reported failure.
   - If the issue no longer reproduces on current `origin/main`, stop immediately:
     - Do not modify code or open a PR.
     - Report the demo path, command, observed result, and any uncertainty.

5. Fix the issue in Gradio.
   - Keep the patch scoped to the failing behavior.
   - Follow local Gradio patterns and tests.
   - Add or update tests when practical, but keep the temporary demo untracked.
   - Do not revert unrelated worktree changes unless the user explicitly asks.

6. Rerun verification.
   - Rerun the minimal demo and confirm the issue is fixed.
   - Run the narrowest relevant Gradio tests for the changed area.
   - Run the required formatter for every changed area.
   - Record the exact command and failure reason for any test blocked by the environment.

7. Prepare the branch and draft PR.
   - Confirm the demo file is untracked with `git status --short`.
   - Stage and commit only source and test changes needed for the fix.
   - Push only the dedicated issue branch.
   - Open a draft PR against `main` with `gh pr create --draft --repo gradio-app/gradio`.
   - Use the repository PR template, complete the AI disclosure, and include `Closes: #<issue>`.
   - Keep the main description concise: explain the root cause and the fix before the closing reference.

8. Publish before and after Spaces with the `hf` CLI.
   - Follow the [official Hugging Face CLI guide](https://huggingface.co/docs/huggingface_hub/en/guides/cli). Use the `hf` executable, not browser automation or the Python Hub API.
   - Run `hf version` and `hf auth whoami`. If `hf` is unavailable, install it using the official guide. If authentication is unavailable, ask the user to run `hf auth login`; never print or commit tokens.
   - Create two temporary upload directories containing the same minimal app and interaction path. Change only the Gradio dependency needed to demonstrate the comparison:
     - Pin the before Space to the affected released version or other immutable baseline that reproduces the issue.
     - Pin the after Space to the immutable preview wheel produced for the exact PR head SHA. Do not use a mutable branch reference.
   - Create public Gradio Spaces with stable, issue-specific names and upload them:

     ```bash
     hf repos create <namespace>/gradio-<issue>-before --type space --sdk gradio --public --exist-ok
     hf upload <namespace>/gradio-<issue>-before <before-directory> . --repo-type space
     hf repos create <namespace>/gradio-<issue>-after --type space --sdk gradio --public --exist-ok
     hf upload <namespace>/gradio-<issue>-after <after-directory> . --repo-type space
     ```

   - Wait for both deployments with `hf spaces wait <space-id> --timeout 10m`.
   - Verify both public URLs return successfully and exercise the reproduction. Confirm the before Space shows the bug and the after Space shows the fix.
   - Do not link a Space that is still building, fails to start, or does not demonstrate the intended comparison.

9. Put the Space links in the PR description.
   - Preserve every PR-template section.
   - Insert the links directly after the main description and immediately before `Closes: #<issue>` using this layout:

     ```markdown
     ## Description

     <root cause and fix summary>

     ## Before / after Spaces

     - [Before fix](https://huggingface.co/spaces/<namespace>/gradio-<issue>-before)
     - [After fix](https://huggingface.co/spaces/<namespace>/gradio-<issue>-after)

     Closes: #<issue>
     ```

   - Read the PR body back from GitHub and verify that both links are correct, the section appears exactly once, and it precedes the closing reference.

10. Ensure CI passes and hand off.
   - Poll required checks with `gh pr checks <pr> --required --watch` and fix failures until they pass.
   - Leave the local demo running.
   - Report the local URL, worktree, branch, demo path, PR URL, both Space URLs, and remaining non-required review checks.

## Helper Script

Use `scripts/setup_gradio_issue.py` for setup. It validates `gh`, `git`, and the local repository; resolves the issue number; reads issue metadata; fetches `origin/main`; creates a dedicated branch and worktree; and writes `.gradio_issue_metadata.json` in the worktree.

```bash
python3 .agents/skills/gradio-issue-fixer/scripts/setup_gradio_issue.py 12345
```

Optional flags:

```bash
--repo /path/to/gradio
--worktrees-dir /path/to/worktrees
--base origin/main
--force
```

Use `--force` only when intentionally reusing an existing issue worktree.
