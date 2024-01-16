import importlib
from pathlib import Path
from typing import Optional

import requests
import toml
from typer import Argument, Option
from typing_extensions import Annotated

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

    print(f"Reading project metadata from {_component_dir}/pyproject.toml\n")

    if not (_component_dir / "pyproject.toml").exists():
        raise ValueError(f"Cannot find pyproject.toml file in {_component_dir}")

    with open(_component_dir / "pyproject.toml") as f:
        data = toml.loads(f.read())
    with open(_demo_path) as f:
        demo = f.read()

    name = data["project"]["name"]

    pypi_exists = requests.get(f"https://pypi.org/pypi/{name}/json").status_code

    pypi_exists = pypi_exists == 200 or False

    local_version = get_deep(data, ["project", "version"])
    description = get_deep(data, ["project", "description"])
    repo = get_deep(data, ["project", "urls", "repository"])
    space = space_url if space_url else get_deep(data, ["project", "urls", "space"])

    module = importlib.import_module(name)
    docs = extract_docstrings(module)

    if generate_space:
        print("Generating space.")

        source = make_space(
            docs,
            name,
            description,
            local_version,
            demo,
            space,
            repo,
            pypi_exists,
        )

        with open(_demo_dir / "space.py", "w") as f:
            f.write(source)
            print(f"  - Space created in {_demo_dir}/space.py\n")

    if generate_readme:
        print("Generating README.")
        readme = make_markdown(
            docs, name, description, local_version, demo, space, repo, pypi_exists
        )

        with open(_readme_path, "w") as f:
            f.write(readme)
            print(f"  - README generated in {_readme_path}")
