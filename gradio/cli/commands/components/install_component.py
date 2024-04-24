from __future__ import annotations

import shutil
import subprocess
from pathlib import Path
from typing import Optional

from rich.markup import escape
from typer import Argument, Option
from typing_extensions import Annotated

from gradio.cli.commands.display import LivePanelDisplay
from gradio.utils import set_directory


def _get_npm(npm_install: str):
    npm_install = npm_install.strip()
    if npm_install == "npm install":
        npm = shutil.which("npm")
        if not npm:
            raise ValueError(
                "By default, the install command uses npm to install "
                "the frontend dependencies. Please install npm or pass your own install command "
                "via the --npm-install option."
            )
        npm_install = f"{npm} install"
    return npm_install


def _get_executable_path(
    executable: str,
    executable_path: str | None,
    cli_arg_name: str,
    check_3: bool = False,
) -> str:
    """Get the path to an executable, either from the provided path or from the PATH environment variable.

    The value of executable_path takes precedence in case the value in PATH is incorrect.
    This should give more control to the developer in case their envrinment is not set up correctly.

    If check_3 is True, we append 3 to the executable name to give python3 priority over python (same for pip).
    """
    if executable_path:
        if not Path(executable_path).exists() or not Path(executable_path).is_file():
            raise ValueError(
                f"The provided {executable} path ({executable_path}) does not exist or is not a file."
            )
        return executable_path
    path = shutil.which(executable)
    if check_3:
        path = shutil.which(f"{executable}3") or path
    if not path:
        raise ValueError(
            f"Could not find {executable}. Please ensure it is installed and in your PATH or pass the {cli_arg_name} parameter."
        )
    return path


def _install_command(
    directory: Path, live: LivePanelDisplay, npm_install: str, pip_path: str | None
):
    pip_executable_path = _get_executable_path(
        "pip", executable_path=pip_path, cli_arg_name="--pip-path", check_3=True
    )
    cmds = [pip_executable_path, "install", "-e", f"{str(directory)}[dev]"]
    live.update(
        f":construction_worker: Installing python... [grey37]({escape(' '.join(cmds))})[/]"
    )
    pipe = subprocess.run(cmds, capture_output=True, text=True, check=False)

    if pipe.returncode != 0:
        live.update(":red_square: Python installation [bold][red]failed[/][/]")
        live.update(pipe.stderr)
    else:
        live.update(":white_check_mark: Python install succeeded!")

    live.update(
        f":construction_worker: Installing javascript... [grey37]({npm_install})[/]"
    )
    with set_directory(directory / "frontend"):
        pipe = subprocess.run(
            npm_install.split(), capture_output=True, text=True, check=False
        )
        if pipe.returncode != 0:
            live.update(":red_square: NPM install [bold][red]failed[/][/]")
            live.update(pipe.stdout)
            live.update(pipe.stderr)
        else:
            live.update(":white_check_mark: NPM install succeeded!")


def _install(
    directory: Annotated[
        Path, Argument(help="The directory containing the custom components.")
    ] = Path("."),
    npm_install: Annotated[
        str, Option(help="NPM install command to use. Default is 'npm install'.")
    ] = "npm install",
    pip_path: Annotated[
        Optional[str],
        Option(
            help="Path to pip executable. If None, will use the default path found by `which pip3`. If pip3 is not found, `which pip` will be tried. If both fail an error will be raised."
        ),
    ] = None,
):
    npm_install = _get_npm(npm_install)
    with LivePanelDisplay() as live:
        _install_command(directory, live, npm_install, pip_path)
