#!/usr/bin/env python3
"""Prepare a Gradio issue worktree for reproduction and fixing."""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path


DEFAULT_REPO = Path.home() / "Desktop" / "Developer" / "gradio"
DEFAULT_WORKTREES_DIR = Path.home() / "Desktop" / "Developer" / "gradio-worktrees"
GH_REPO = "gradio-app/gradio"


def run(cmd: list[str], *, cwd: Path | None = None, capture: bool = False) -> str:
    kwargs = {
        "cwd": str(cwd) if cwd else None,
        "text": True,
        "check": True,
    }
    if capture:
        kwargs.update({"stdout": subprocess.PIPE, "stderr": subprocess.PIPE})
    try:
        result = subprocess.run(cmd, **kwargs)
    except subprocess.CalledProcessError as exc:
        if capture and exc.stderr:
            print(exc.stderr.strip(), file=sys.stderr)
        raise
    return result.stdout if capture else ""


def require_binary(name: str) -> None:
    if shutil.which(name) is None:
        raise SystemExit(f"Missing required command: {name}")


def parse_issue(value: str) -> int:
    value = value.strip()
    if value.isdigit():
        return int(value)
    match = re.search(r"github\.com/gradio-app/gradio/issues/(\d+)", value)
    if match:
        return int(match.group(1))
    raise SystemExit("Expected a gradio-app/gradio issue number or issue URL.")


def slugify(title: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", title.lower()).strip("-")
    return slug[:48] or "issue"


def ensure_repo(repo: Path) -> None:
    if not repo.exists():
        raise SystemExit(f"Repository does not exist: {repo}")
    if not (repo / ".git").exists() and not run(
        ["git", "rev-parse", "--is-inside-work-tree"], cwd=repo, capture=True
    ).strip() == "true":
        raise SystemExit(f"Not a git worktree: {repo}")


def issue_json(number: int) -> dict:
    raw = run(
        [
            "gh",
            "issue",
            "view",
            str(number),
            "--repo",
            GH_REPO,
            "--json",
            "number,title,state,url,body,createdAt,updatedAt",
        ],
        capture=True,
    )
    return json.loads(raw)


def worktree_exists(path: Path) -> bool:
    return path.exists() and any(path.iterdir())


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("issue", help="Gradio issue number or GitHub issue URL")
    parser.add_argument("--repo", type=Path, default=DEFAULT_REPO)
    parser.add_argument("--worktrees-dir", type=Path, default=DEFAULT_WORKTREES_DIR)
    parser.add_argument("--base", default="origin/main")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    require_binary("git")
    require_binary("gh")

    issue_number = parse_issue(args.issue)
    repo = args.repo.expanduser().resolve()
    worktrees_dir = args.worktrees_dir.expanduser().resolve()
    ensure_repo(repo)

    issue = issue_json(issue_number)
    branch = f"fix/issue-{issue_number}-{slugify(issue['title'])}"
    worktree = worktrees_dir / f"issue-{issue_number}"

    run(["git", "fetch", "origin", "main"], cwd=repo)
    worktrees_dir.mkdir(parents=True, exist_ok=True)

    if worktree_exists(worktree):
        if not args.force:
            raise SystemExit(
                f"Worktree already exists: {worktree}\n"
                "Use --force only if you intend to reuse it."
            )
    else:
        existing_branches = run(["git", "branch", "--list", branch], cwd=repo, capture=True)
        if existing_branches.strip():
            run(["git", "worktree", "add", str(worktree), branch], cwd=repo)
        else:
            run(["git", "worktree", "add", "-b", branch, str(worktree), args.base], cwd=repo)

    metadata = {
        "issue": issue,
        "repo": str(repo),
        "worktree": str(worktree),
        "branch": branch,
        "base": args.base,
        "github_repo": GH_REPO,
    }
    metadata_path = worktree / ".gradio_issue_metadata.json"
    metadata_path.write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")

    print(f"Issue: #{issue_number} {issue['title']}")
    print(f"State: {issue['state']}")
    print(f"URL: {issue['url']}")
    print(f"Worktree: {worktree}")
    print(f"Branch: {branch}")
    print(f"Metadata: {metadata_path}")
    print()
    print("Next:")
    print(f"  cd {worktree}")
    print(f"  gh issue view {issue_number} --repo {GH_REPO} --comments")
    print(f"  create an untracked demo_issue_{issue_number}.py")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
