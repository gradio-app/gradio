from __future__ import annotations

import pathlib
from typing import Any

from hatchling.builders.hooks.plugin.interface import BuildHookInterface

class BuildHook(BuildHookInterface):

    def initialize(self, version: str, build_data: dict[str, Any]) -> None:

        import sys
        sys.path.insert(0, str(pathlib.Path("./")))
        try:
            import backend # type: ignore
            backend.generate_stubs()
        finally:
            sys.path.remove(str(pathlib.Path("./")))