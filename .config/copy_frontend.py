from __future__ import annotations

import os
import pathlib
import shutil
from typing import Any

from hatchling.builders.hooks.plugin.interface import BuildHookInterface


SKIP_THIS_HATCH_HOOK = os.environ.get("BUILD_GRADIO_LITE", False)


def copy_js_code(root: str | pathlib.Path):
    NOT_COMPONENT = [
        "app",
        "node_modules",
        "storybook",
        "playwright-report",
        "workbench",
        "tooltils",
    ]
    for entry in (pathlib.Path(root) / "js").iterdir():
        if (
            entry.is_dir()
            and not str(entry.name).startswith("_")
            and not str(entry.name) in NOT_COMPONENT
        ):

            def ignore(s, names):
                ignored = []
                for n in names:
                    if (
                        n.startswith("CHANGELOG")
                        or n.startswith("README.md")
                        or n.startswith("node_modules")
                        or ".test." in n
                        or ".stories." in n
                        or ".spec." in n
                    ):
                        ignored.append(n)
                return ignored

            shutil.copytree(
                str(entry),
                str(pathlib.Path("gradio") / "_frontend_code" / entry.name),
                ignore=ignore,
                dirs_exist_ok=True,
            )
    shutil.copytree(
        str(pathlib.Path(root) / "client" / "js"),
        str(pathlib.Path("gradio") / "_frontend_code" / "client"),
        ignore=lambda d, names: ["node_modules"],
        dirs_exist_ok=True,
    )


class BuildHook(BuildHookInterface):
    def initialize(self, version: str, build_data: dict[str, Any]) -> None:
        if SKIP_THIS_HATCH_HOOK:
            return
        copy_js_code(self.root)


if __name__ == "__main__":
    copy_js_code(pathlib.Path("..").resolve())
