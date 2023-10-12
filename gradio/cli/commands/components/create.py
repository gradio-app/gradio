import shutil
import subprocess
from pathlib import Path
from typing import Optional

import typer
from typing_extensions import Annotated

from gradio.cli.commands.display import LivePanelDisplay
from gradio.utils import set_directory

from . import _create_utils


def _create(
    name: Annotated[
        str,
        typer.Argument(
            help="Name of the component. Preferably in camel case, i.e. MyTextBox."
        ),
    ],
    directory: Annotated[
        Optional[Path],
        typer.Option(
            help="Directory to create the component in. Default is None. If None, will be created in <component-name> directory in the current directory."
        ),
    ] = None,
    package_name: Annotated[
        Optional[str],
        typer.Option(help="Name of the package. Default is gradio_{name.lower()}"),
    ] = None,
    template: Annotated[
        str,
        typer.Option(
            help="Component to use as a template. Should use exact name of python class."
        ),
    ] = "",
    install: Annotated[
        bool,
        typer.Option(
            help="Whether to install the component in your current environment as a local install"
        ),
    ] = False,
    npm_install: Annotated[
        str,
        typer.Option(help="NPM install command to use. Default is 'npm install'."),
    ] = "npm install",
    overwrite: Annotated[
        bool,
        typer.Option(help="Whether to overwrite the existing component if it exists."),
    ] = False,
):
    if not directory:
        directory = Path(name.lower())
    if not package_name:
        package_name = f"gradio_{name.lower()}"

    if directory.exists() and not overwrite:
        raise ValueError(
            f"The directory {directory.resolve()} already exists. "
            "Please set --overwrite flag or pass in the name "
            "of a directory that does not already exist via the --directory option."
        )
    elif directory.exists() and overwrite:
        _create_utils.delete_contents(directory)

    directory.mkdir(exist_ok=overwrite)

    if _create_utils._in_test_dir():
        npm_install = f"{shutil.which('pnpm')} i --ignore-scripts"

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

    with LivePanelDisplay() as live:
        live.update(
            f":building_construction:  Creating component [orange3]{name}[/] in directory [orange3]{directory}[/]",
            add_sleep=0.2,
        )
        if template:
            live.update(f":fax: Starting from template [orange3]{template}[/]")
        else:
            live.update(":page_facing_up: Creating a new component from scratch.")

        component = _create_utils._get_component_code(template)

        _create_utils._create_backend(name, component, directory, package_name)
        live.update(":snake: Created backend code", add_sleep=0.2)

        _create_utils._create_frontend(name.lower(), component, directory=directory)
        live.update(":art: Created frontend code", add_sleep=0.2)

        if install:
            cmds = [shutil.which("pip"), "install", "-e", f"{str(directory)}"]
            live.update(
                f":construction_worker: Installing python... [grey37]({' '.join(cmds)})[/]"
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
                pipe = subprocess.run(
                    npm_install.split(), capture_output=True, text=True
                )
                if pipe.returncode != 0:
                    live.update(":red_square: NPM install [bold][red]failed[/][/]")
                    live.update(pipe.stdout)
                    live.update(pipe.stderr)
                else:
                    live.update(":white_check_mark: NPM install succeeded!")
