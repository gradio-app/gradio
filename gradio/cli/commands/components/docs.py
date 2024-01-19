from __future__ import annotations

import importlib
from pathlib import Path
from typing import Optional

import requests
import tomlkit as toml
from rich import print
from typer import Argument, Option
from typing_extensions import Annotated

from gradio.cli.commands.display import LivePanelDisplay

from ._docs_assets import css
from ._docs_utils import extract_docstrings, get_deep, make_markdown, make_space


def _docs(
    path: Annotated[
        Path, Argument(help="The directory of the custom component.")
    ] = Path("."),
    demo_dir: Annotated[
        Optional[Path], Option(help="Path to the demo directory.")
    ] = None,
    demo_name: Annotated[Optional[str], Option(help="Name of the demo file.")] = None,
    readme_path: Annotated[
        Optional[Path], Option(help="Path to the README.md file.")
    ] = None,
    space_url: Annotated[
        Optional[str], Option(help="URL of the Space to use for the demo.")
    ] = None,
    generate_space: Annotated[
        bool,
        Option(
            help="Create a documentation space for the custom compone.", is_flag=True
        ),
    ] = True,
    generate_readme: Annotated[
        bool,
        Option(help="Create a README.md file for the custom component.", is_flag=True),
    ] = True,
    suppress_demo_check: Annotated[
        bool,
        Option(
            help="Suppress demo warnings and errors.",
            is_flag=True,
        ),
    ] = False,
):
    """Runs the documentation generator."""

    _component_dir = Path(path).resolve()
    _demo_dir = Path(demo_dir).resolve() if demo_dir else Path("demo").resolve()
    _demo_name = demo_name if demo_name else "app.py"
    _demo_path = _demo_dir / _demo_name
    _readme_path = (
        Path(readme_path).resolve() if readme_path else _component_dir / "README.md"
    )

    if not generate_space and not generate_readme:
        raise ValueError("Must generate at least one of space or readme")

    with LivePanelDisplay() as live:
        live.update(
            f":page_facing_up: Generating documentation for [orange3]{str(_component_dir.name)}[/]",
            add_sleep=0.2,
        )
        live.update(
            f":eyes: Reading project metadata from [orange3]{_component_dir}/pyproject.toml[/]\n"
        )

        if not (_component_dir / "pyproject.toml").exists():
            raise ValueError(
                f"Cannot find pyproject.toml file in [orange3]{_component_dir}[/]"
            )

        with open(_component_dir / "pyproject.toml") as f:
            data = toml.loads(f.read())
        with open(_demo_path) as f:
            demo = f.read()

        name = get_deep(data, ["project", "name"])

        if not isinstance(name, str):
            raise ValueError("Name not found in pyproject.toml")

        pypi_exists = requests.get(f"https://pypi.org/pypi/{name}/json").status_code

        pypi_exists = pypi_exists == 200 or False

        local_version = get_deep(data, ["project", "version"])
        description = str(get_deep(data, ["project", "description"]) or "")
        repo = get_deep(data, ["project", "urls", "repository"])
        space = space_url if space_url else get_deep(data, ["project", "urls", "space"])

        if not local_version and not pypi_exists:
            raise ValueError(
                f"Cannot find version in pyproject.toml or on PyPI for [orange3]{name}[/].\nIf you have just published to PyPI, please wait a few minutes and try again."
            )

        module = importlib.import_module(name)
        (docs, type_mode) = extract_docstrings(module)

        if generate_space:
            live.update(":computer: [blue]Generating space.[/]")

            source = make_space(
                docs=docs,
                name=name,
                description=description,
                local_version=local_version
                if local_version is None
                else str(local_version),
                demo=demo,
                space=space if space is None else str(space),
                repo=repo if repo is None else str(repo),
                pypi_exists=pypi_exists,
                suppress_demo_check=suppress_demo_check,
            )

            with open(_demo_dir / "space.py", "w") as f:
                f.write(source)
                live.update(
                    f":white_check_mark: Space created in [orange3]{_demo_dir}/space.py[/]\n"
                )
            with open(_demo_dir / "css.css", "w") as f:
                f.write(css)

        if generate_readme:
            live.update(":pencil: [blue]Generating README.[/]")
            readme = make_markdown(
                docs, name, description, local_version, demo, space, repo, pypi_exists
            )

            with open(_readme_path, "w") as f:
                f.write(readme)
                live.update(
                    f":white_check_mark: README generated in [orange3]{_readme_path}[/]"
                )

    if type_mode == "simple":
        print(
            "\n:orange_circle: [red]The docs were generated in simple mode. Updating python to a version greater than 3.9 will result in richer documentation.[/]"
        )
