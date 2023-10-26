import shutil
import subprocess
from pathlib import Path

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


def _install_command(directory: Path, live: LivePanelDisplay, npm_install: str):
    cmds = [shutil.which("pip"), "install", "-e", f"{str(directory)}[dev]"]
    live.update(
        f":construction_worker: Installing python... [grey37]({escape(' '.join(cmds))})[/]"
    )
    pipe = subprocess.run(cmds, capture_output=True, text=True)

    if pipe.returncode != 0:
        live.update(":red_square: Python installation [bold][red]failed[/][/]")
        live.update(pipe.stderr)
    else:
        live.update(":white_check_mark: Python install succeeded!")

    live.update(
        f":construction_worker: Installing javascript... [grey37]({npm_install})[/]"
    )
    with set_directory(directory / "frontend"):
        pipe = subprocess.run(npm_install.split(), capture_output=True, text=True)
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
):
    npm_install = _get_npm(npm_install)
    with LivePanelDisplay() as live:
        _install_command(directory, live, npm_install)
