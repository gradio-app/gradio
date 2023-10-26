import shutil
from pathlib import Path
from typing import Optional

import typer
from typing_extensions import Annotated

from gradio.cli.commands.components.install_component import _get_npm, _install_command
from gradio.cli.commands.display import LivePanelDisplay

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
            help="Whether to install the component in your current environment as a development install. Recommended for development."
        ),
    ] = True,
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
    else:
        npm_install = _get_npm(npm_install)

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

        _create_utils._create_frontend(
            name.lower(), component, directory=directory, package_name=package_name
        )
        live.update(":art: Created frontend code", add_sleep=0.2)

        if install:
            _install_command(directory, live, npm_install)
