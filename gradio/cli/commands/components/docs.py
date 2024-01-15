import importlib
import re
from pathlib import Path
from typing import List, Optional

import requests
import semantic_version
import toml
from typer import Option, Argument
from typing_extensions import Annotated

from ._docs_utils import (
    extract_docstrings,
    get_deep,
    make_space,
)

colors = ["red", "yellow", "green", "blue", "indigo", "purple", "pink", "gray"]

PYPI_REGISTER_URL = "https://pypi.org/account/register/"

README_CONTENTS = """
---
tags: [gradio-custom-component{template}]
title: {package_name} V{version}
colorFrom: {color_from}
colorTo: {color_to}
sdk: docker
pinned: false
license: apache-2.0
---
"""

DOCKERFILE = """
FROM python:3.9

WORKDIR /code

COPY --link --chown=1000 . .

RUN mkdir -p /tmp/cache/
RUN chmod a+rwx -R /tmp/cache/
ENV TRANSFORMERS_CACHE=/tmp/cache/ 

RUN pip install --no-cache-dir -r requirements.txt

ENV PYTHONUNBUFFERED=1 \
	GRADIO_ALLOW_FLAGGING=never \
	GRADIO_NUM_PORTS=1 \
	GRADIO_SERVER_NAME=0.0.0.0 \
    GRADIO_SERVER_PORT=7860 \
	SYSTEM=spaces

CMD ["python", "app.py"]
"""


def _ignore(s, names):
    ignored = []
    for n in names:
        if "__pycache__" in n or n.startswith("dist") or n.startswith("node_modules"):
            ignored.append(n)
    return ignored


def _get_version_from_file(dist_file: Path) -> Optional[str]:
    match = re.search(r"-(\d+\.\d+\.\d+[a-zA-Z]*\d*)-", dist_file.name)
    if match:
        return match.group(1)


def _get_max_version(distribution_files: List[Path]) -> Optional[str]:
    versions = []
    for p in distribution_files:
        version = _get_version_from_file(p)
        # If anything goes wrong, just return None so we upload all files
        # better safe than sorry
        if version:
            try:
                versions.append(semantic_version.Version(version))
            except ValueError:
                return None
    return str(max(versions)) if versions else None


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
