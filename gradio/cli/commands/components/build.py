import shutil
import subprocess
import sys
from pathlib import Path

import typer
from typing_extensions import Annotated

import gradio
from gradio.cli.commands.display import LivePanelDisplay

gradio_template_path = Path(gradio.__file__).parent / "templates" / "frontend"
gradio_node_path = Path(gradio.__file__).parent / "node" / "dev" / "files" / "index.js"


def _build(
    path: Annotated[
        Path, typer.Argument(help="The directory of the custom component.")
    ] = Path("."),
    build_frontend: Annotated[
        bool, typer.Option(help="Whether to build the frontend as well.")
    ] = True,
):
    name = Path(path).resolve()
    if not (name / "pyproject.toml").exists():
        raise ValueError(f"Cannot find pyproject.toml file in {name}")

    with LivePanelDisplay() as live:
        live.update(
            f":package: Building package in [orange3]{str(name.name)}[/]", add_sleep=0.2
        )
        if build_frontend:
            live.update(":art: Building frontend")
            component_directory = path.resolve()

            node = shutil.which("node")
            if not node:
                raise ValueError(
                    "node must be installed in order to run build command."
                )

            node_cmds = [
                node,
                gradio_node_path,
                "--component-directory",
                component_directory,
                "--root",
                gradio_template_path,
                "--mode",
                "build",
            ]
            pipe = subprocess.run(node_cmds, capture_output=True, text=True)
            if pipe.returncode != 0:
                live.update(":red_square: Build failed!")
                live.update(pipe.stderr)
                live.update(pipe.stdout)
                return
            else:
                live.update(":white_check_mark: Build succeeded!")

        cmds = [sys.executable, "-m", "build", str(name)]
        live.update(f":construction_worker: Building... [grey37]({' '.join(cmds)})[/]")
        pipe = subprocess.run(cmds, capture_output=True, text=True)
        if pipe.returncode != 0:
            live.update(":red_square: Build failed!")
            live.update(pipe.stderr)
        else:
            live.update(":white_check_mark: Build succeeded!")
            live.update(
                f":ferris_wheel: Wheel located in [orange3]{str(name / 'dist')}[/]"
            )
