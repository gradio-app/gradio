import subprocess
from pathlib import Path

import typer
from typing_extensions import Annotated

from gradio.cli.commands.display import LivePanelDisplay


def _build(
    path: Annotated[
        str, typer.Argument(help="The directory of the custom component.")
    ] = ".",
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

        cmds = ["python", "-m", "build", str(name)]
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
