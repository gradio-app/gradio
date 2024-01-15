import importlib
from pathlib import Path
from typing import Optional

import requests
import toml
from typer import Argument, Option
from typing_extensions import Annotated

from ._docs_utils import (
    extract_docstrings,
    get_deep,
    make_space,
)


def _docs(
    path: Annotated[
        Path, Argument(help="The directory of the custom component.")
    ] = Path("."),
    demo_dir: Annotated[
        Optional[Path], Option(help="Path to the demo directory.")
    ] = None,
    demo_name: Annotated[Optional[str], Option(help="Name of the demo file.")] = None,
    space_url: Annotated[
        Optional[str], Option(help="URL of the Space to use for the demo.")
    ] = None,
):
    """Runs the documentation generator."""

    _component_dir = Path(path).resolve()
    _demo_dir = Path(demo_dir).resolve() if demo_dir else Path("demo").resolve()
    _demo_name = demo_name if demo_name else "app.py"
    _demo_path = _demo_dir / _demo_name

    if not (_component_dir / "pyproject.toml").exists():
        raise ValueError(f"Cannot find pyproject.toml file in {_component_dir}")

    with open(_component_dir / "pyproject.toml") as f:
        data = toml.loads(f.read())
    with open(_demo_path) as f:
        demo = f.read()

    print("Generating documentation...")

    print(f"  - Reading pyproject.toml from {_component_dir}")
    name = data["project"]["name"]

    pypi_exists = requests.get(f"https://pypi.org/pypi/{name}/json").status_code

    pypi_exists = pypi_exists == 200 or False

    local_version = get_deep(data, ["project", "version"])
    description = get_deep(data, ["project", "description"])
    repo = get_deep(data, ["project", "urls", "repository"])
    space = space_url if space_url else get_deep(data, ["project", "urls", "space"])

    module = importlib.import_module(name)
    docs = extract_docstrings(module)

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

    print(f"  - Writing demo to {_demo_path}")

    with open(_demo_dir / "space.py", "w") as f:
        f.write(source)
