from __future__ import annotations

import importlib
import re
from pathlib import Path
from typing import Annotated, Any, Optional

import requests
import tomlkit as toml
from typer import Argument, Option

from gradio.analytics import custom_component_analytics
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
    custom_component_analytics(
        "docs",
        None,
        None,
        None,
        None,
    )

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

        with open(_component_dir / "pyproject.toml", encoding="utf-8") as f:
            data = toml.loads(f.read())

        name = get_deep(data, ["project", "name"])

        if not isinstance(name, str):
            raise ValueError("Name not found in pyproject.toml")

        run_command(
            live=live,
            name=name,
            suppress_demo_check=suppress_demo_check,
            pyproject_toml=data,
            generate_space=generate_space,
            generate_readme=generate_readme,
            type_mode="simple",
            _demo_path=_demo_path,
            _demo_dir=_demo_dir,
            _readme_path=_readme_path,
            space_url=space_url,
            _component_dir=_component_dir,
        )


def run_command(
    live: LivePanelDisplay,
    name: str,
    pyproject_toml: dict[str, Any],
    suppress_demo_check: bool,
    generate_space: bool,
    generate_readme: bool,
    type_mode: str,
    _demo_path: Path,
    _demo_dir: Path,
    _readme_path: Path,
    space_url: str | None,
    _component_dir: Path,
    simple: bool = False,
):
    with open(_demo_path, encoding="utf-8") as f:
        demo = f.read()

    pypi_exists = requests.get(f"https://pypi.org/pypi/{name}/json").status_code

    pypi_exists = pypi_exists == 200 or False

    local_version = get_deep(pyproject_toml, ["project", "version"])
    description = str(get_deep(pyproject_toml, ["project", "description"]) or "")
    repo = get_deep(pyproject_toml, ["project", "urls", "repository"])
    space = (
        space_url
        if space_url
        else get_deep(pyproject_toml, ["project", "urls", "space"])
    )

    if not local_version and not pypi_exists:
        raise ValueError(
            f"Cannot find version in pyproject.toml or on PyPI for [orange3]{name}[/].\nIf you have just published to PyPI, please wait a few minutes and try again."
        )
    module = importlib.import_module(name)
    (docs, type_mode) = extract_docstrings(module)

    if generate_space:
        if not simple:
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

        with open(_demo_dir / "space.py", "w", encoding="utf-8") as f:
            f.write(source)
            if not simple:
                live.update(
                    f":white_check_mark: Space created in [orange3]{_demo_dir}/space.py[/]\n"
                )
        with open(_demo_dir / "css.css", "w", encoding="utf-8") as f:
            f.write(css)

    if generate_readme:
        if not simple:
            live.update(":pencil: [blue]Generating README.[/]")
        readme = make_markdown(
            docs, name, description, local_version, demo, space, repo, pypi_exists
        )

        readme_content = Path(_readme_path).read_text()

        with open(_readme_path, "w", encoding="utf-8") as f:
            yaml_regex = re.search(
                "(?:^|[\r\n])---[\n\r]+([\\S\\s]*?)[\n\r]+---([\n\r]|$)", readme_content
            )
            if yaml_regex is not None:
                readme = readme_content[: yaml_regex.span()[-1]] + readme
            f.write(readme)
            if not simple:
                live.update(
                    f":white_check_mark: README generated in [orange3]{_readme_path}[/]"
                )
    if simple:
        short_readme_path = Path(_readme_path).relative_to(_component_dir)
        short_demo_path = Path(_demo_dir / "space.py").relative_to(_component_dir)
        live.update(
            f":white_check_mark: Documentation generated in [orange3]{short_demo_path}[/] and [orange3]{short_readme_path}[/]. Pass --no-generate-docs to disable auto documentation."
        )

    if type_mode == "simple":
        live.update(
            "\n:orange_circle: [red]The docs were generated in simple mode. Updating python to a more recent version will result in richer documentation.[/]"
        )
