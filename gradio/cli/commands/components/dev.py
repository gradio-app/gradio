from __future__ import annotations

import shutil
import subprocess
from pathlib import Path
from typing import Optional

import typer
from rich import print
from typing_extensions import Annotated

import gradio
from gradio.cli.commands.components.install_component import _get_executable_path

gradio_template_path = Path(gradio.__file__).parent / "templates" / "frontend"
gradio_node_path = Path(gradio.__file__).parent / "node" / "dev" / "files" / "index.js"


def _dev(
    app: Annotated[
        Path,
        typer.Argument(
            help="The path to the app. By default, looks for demo/app.py in the current directory."
        ),
    ] = Path("demo") / "app.py",
    component_directory: Annotated[
        Path,
        typer.Option(
            help="The directory with the custom component source code. By default, uses the current directory."
        ),
    ] = Path("."),
    host: Annotated[
        str,
        typer.Option(
            help="The host to run the front end server on. Defaults to localhost.",
        ),
    ] = "localhost",
    python_path: Annotated[
        Optional[str],
        typer.Option(
            help="Path to python executable. If None, will use the default path found by `which python3`. If python3 is not found, `which python` will be tried. If both fail an error will be raised."
        ),
    ] = None,
    gradio_path: Annotated[
        Optional[str],
        typer.Option(
            help="Path to gradio executable. If None, will use the default path found by `shutil.which`."
        ),
    ] = None,
):
    component_directory = component_directory.resolve()

    print(f":recycle: [green]Launching[/] {app} in reload mode\n")

    node = shutil.which("node")
    if not node:
        raise ValueError("node must be installed in order to run dev mode.")

    python_path = _get_executable_path(
        "python", python_path, cli_arg_name="--python-path", check_3=True
    )
    gradio_path = _get_executable_path(
        "gradio", gradio_path, cli_arg_name="--gradio-path"
    )

    proc = subprocess.Popen(
        [
            node,
            gradio_node_path,
            "--component-directory",
            component_directory,
            "--root",
            gradio_template_path,
            "--app",
            str(app),
            "--mode",
            "dev",
            "--host",
            host,
            "--python-path",
            python_path,
            "--gradio-path",
            gradio_path,
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    while True:
        proc.poll()
        text = proc.stdout.readline()  # type: ignore
        err = None
        if proc.stderr:
            err = proc.stderr.readline()

        text = (
            text.decode("utf-8")
            .replace("Changes detected in:", "[orange3]Changed detected in:[/]")
            .replace("Watching:", "[orange3]Watching:[/]")
            .replace("Running on local URL", "[orange3]Backend Server[/]")
        )

        if "[orange3]Watching:[/]" in text:
            text += f"'{str(component_directory / 'frontend').strip()}',"
        if "To create a public link" in text:
            continue
        print(text)
        if err:
            print(err.decode("utf-8"))

        if proc.returncode is not None:
            print("Backend server failed to launch. Exiting.")
            return
