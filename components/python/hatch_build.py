"""Puts the files that `gradio_components` ships, but that live elsewhere in the
repository, into the package while it is being built:

- the built frontend, which `pnpm build` writes to `gradio/templates`, as
  `gradio_components/_frontend`
- the sample media in `gradio/media_assets`, as `gradio_components/media_assets`

An editable install does not need them: Gradio falls back to the `gradio` folder of
the checkout (see `gradio._components_package.bundled_dir`). When the build runs from
an sdist, the files are already in the package and there is nothing to copy.
"""

from __future__ import annotations

import shutil
from pathlib import Path

from hatchling.builders.hooks.plugin.interface import BuildHookInterface

BUNDLED = {"templates": "_frontend", "media_assets": "media_assets"}


class BundleHook(BuildHookInterface):
    def initialize(self, version, build_data):  # noqa: ARG002
        self.copied: list[Path] = []
        if version == "editable":
            return
        repository_gradio = Path(self.root).parent.parent / "gradio"
        if not (repository_gradio / "_components_package.py").exists():
            return
        for source_name, name in BUNDLED.items():
            source = repository_gradio / source_name
            target = Path(self.root) / "gradio_components" / name
            if not source.is_dir():
                continue
            if target.exists():
                shutil.rmtree(target)
            shutil.copytree(source, target)
            self.copied.append(target)

    def finalize(self, version, build_data, artifact_path):  # noqa: ARG002
        # A copy left behind would hide a newer frontend build from an editable
        # install, which prefers the package's own copy.
        for target in getattr(self, "copied", []):
            shutil.rmtree(target, ignore_errors=True)
