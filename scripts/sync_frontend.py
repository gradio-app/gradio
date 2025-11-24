from __future__ import annotations

import json
import pathlib

from huggingface_hub import upload_folder


def copy_js_code(root: str | pathlib.Path, hf_token: str | None = None):
    NOT_COMPONENT = [
        "app",
        "node_modules",
        "storybook",
        "playwright-report",
        "workbench",
        "tooltils",
        "component-test",
        "core",
        "spa",
    ]
    print("COPYING JS CODE TO gradio/_frontend_code/")
    version = json.load(open(pathlib.Path(root) / "gradio" / "package.json"))["version"]
    for entry in (pathlib.Path(root) / "js").iterdir():
        if (
            entry.is_dir()
            and not str(entry.name).startswith("_")
            and str(entry.name) not in NOT_COMPONENT
        ):
            print("entry:", entry)
            upload_folder(
                repo_id="gradio/frontend",
                repo_type="dataset",
                folder_path=str(entry),
                path_in_repo=f"{version}/{entry.name}",
                ignore_patterns=[
                    "CHANGELOG*",
                    "README.md",
                    "*/node_modules/*",  # Matches content within node_modules folders
                    "*.test.*",
                    "*.stories.*",
                    "*.spec.*",
                    ".svelte-kit/*",
                    "dist/**",
                ],
                allow_patterns=[
                    "*.ts",
                    "*.svelte",
                    "*.json",
                    "**/*.ts",
                    "**/*.svelte",
                    "**/*.json",
                ],
                token=hf_token,
            )
    upload_folder(
        repo_id="gradio/frontend",
        repo_type="dataset",
        folder_path=str(pathlib.Path(root) / "client" / "js"),
        path_in_repo=f"{version}/client",
        ignore_patterns=[
            "CHANGELOG*",
            "README.md",
            "*/node_modules/*",  # Matches content within node_modules folders
            "*.test.*",
            "*.stories.*",
            "*.spec.*",
            ".svelte-kit/*",
            "dist/**",
        ],
        allow_patterns=[
            "*.ts",
            "*.svelte",
            "*.json",
            "**/*.ts",
            "**/*.svelte",
            "**/*.json",
        ],
        token=hf_token,
            )


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Sync Frontend code to dataset")
    parser.add_argument("hf_token", type=str, help="HF API token")
    args = parser.parse_args()

    current_dir = pathlib.Path(__file__).parent.resolve()

    copy_js_code((current_dir / "..").resolve(), hf_token=args.hf_token)
