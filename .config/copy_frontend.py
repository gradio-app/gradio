from __future__ import annotations

import shutil
import pathlib
from typing import Any

try:
    from hatchling.builders.hooks.plugin.interface import BuildHookInterface
except ImportError:
    raise ImportError("Please install the 'hatchling' package.")


def copy_js_code(root: str | pathlib.Path):
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
    for entry in (pathlib.Path(root) / "js").iterdir():
        if (
            entry.is_dir()
            and not str(entry.name).startswith("_")
            and not str(entry.name) in NOT_COMPONENT
        ):

            def ignore(s, names):
                ignored_patterns = {
                    "CHANGELOG",
                    "README.md",
                    "node_modules",
                }
                ignored = [n for n in names if any(n.startswith(pattern) for pattern in ignored_patterns) or ".test." in n or ".stories." in n or ".spec." in n]
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
        ignore=lambda d, names: ["node_modules", "test"],
        dirs_exist_ok=True,
    )


class BuildHook(BuildHookInterface):
    def initialize(self, version: str, build_data: dict[str, Any]) -> None:
        copy_js_code(pathlib.Path(self.root))


if __name__ == "__main__":
    copy_js_code(pathlib.Path("..").resolve())
