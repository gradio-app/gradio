from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

import click

import gradio
from gradio.analytics import custom_component_analytics
from gradio.cli.commands.components.install_component import (
    _get_executable_path,
    _get_frontend_dir,
)

gradio_template_path = Path(gradio.__file__).parent / "templates" / "frontend"  # type: ignore


def _dev(
    app: Path = Path("demo") / "app.py",
    component_directory: Path = Path("."),
    host: str = "localhost",
    python_path: str | None = None,
    gradio_path: str | None = None,
):
    custom_component_analytics(
        "dev",
        None,
        None,
        None,
        None,
        python_path=python_path,
        gradio_path=gradio_path,
    )
    component_directory = component_directory.resolve()

    print(f"♻ Launching {app} in reload mode\n")

    node = shutil.which("node")
    if not node:
        raise ValueError("node must be installed in order to run dev mode.")

    python_path = _get_executable_path(
        "python", python_path, cli_arg_name="--python-path", check_3=True
    )
    gradio_path = _get_executable_path(
        "gradio", gradio_path, cli_arg_name="--gradio-path"
    )

    frontend_dir = _get_frontend_dir(component_directory)

    gradio_node_path = subprocess.run(
        [node, "-e", "console.log(require.resolve('@gradio/preview'))"],
        cwd=frontend_dir,
        check=False,
        capture_output=True,
    )

    if gradio_node_path.returncode != 0:
        raise ValueError(
            f"Could not find `@gradio/preview`. Run `npm i -D @gradio/preview` in your frontend folder ({frontend_dir})."
        )

    gradio_node_path = gradio_node_path.stdout.decode("utf-8").strip()

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
            .replace("Changes detected in:", "Changed detected in:")
            .replace("Watching:", "Watching:")
            .replace("* Running on:", "* Backend Server:")
        )

        if "Watching:" in text:
            text += f"'{str(frontend_dir).strip()}',"
        if text.startswith("* Tip:"):
            continue
        print(text)
        if err:
            print(err.decode("utf-8"))

        if proc.returncode is not None:
            print("Backend server failed to launch. Exiting.")
            return


dev_command = click.Command(
    name="dev",
    callback=_dev,
    help="Launch the custom component demo in development mode. APP is the path to the app (default: demo/app.py in the current directory).",
    params=[
        click.Argument(
            ["app"], type=click.Path(path_type=Path), default=Path("demo") / "app.py"
        ),
        click.Option(
            ["--component-directory"],
            type=click.Path(path_type=Path),
            default=Path("."),
            help="The directory with the custom component source code. By default, uses the current directory.",
        ),
        click.Option(
            ["--host"],
            default="localhost",
            show_default=True,
            help="The host to run the front end server on.",
        ),
        click.Option(
            ["--python-path"],
            help="Path to python executable. If None, will use the default path found by `which python3`. If python3 is not found, `which python` will be tried. If both fail an error will be raised.",
        ),
        click.Option(
            ["--gradio-path"],
            help="Path to gradio executable. If None, will use the default path found by `shutil.which`.",
        ),
    ],
)
