from __future__ import annotations

import shutil
import pathlib
from typing import Any
from huggingface_hub import upload_folder
import json


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
            upload_folder(repo_id="gradio/frontend", repo_type="dataset",
                          folder_path=str(entry),
                          path_in_repo=f"{version}/{entry.name}",
                          ignore_patterns = [
                                "CHANGELOG*",
                                "README.md",
                                "*/node_modules/*", # Matches content within node_modules folders
                                "*.test.*",
                                "*.stories.*",
                                "*.spec.*",
                                ".svelte-kit/*",
                                "dist/**"
                            ],
                            allow_patterns = [
                                    "*.ts",
                                    "*.svelte",
                                    "*.json",
                                    "**/*.ts",
                                    "**/*.svelte",
                                    "**/*.json",
                                ]
            )
    #         shutil.copytree(
    #             str(entry),
    #             str(pathlib.Path("gradio") / "_frontend_code" / entry.name),
    #             ignore=ignore,
    #             dirs_exist_ok=True,
    #         )
    # shutil.copytree(
    #     str(pathlib.Path(root) / "client" / "js"),
    #     str(pathlib.Path("gradio") / "_frontend_code" / "client"),
    #     ignore=lambda d, names: ["node_modules", "test"],
    #     dirs_exist_ok=True,
    # )


if __name__ == "__main__":
    copy_js_code(pathlib.Path("..").resolve(), hf_token=None)
