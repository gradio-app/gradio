from __future__ import annotations

import importlib
import shutil
import subprocess
from pathlib import Path
from typing import Annotated, Optional

import semantic_version
import typer
from tomlkit import dump, parse

import gradio
from gradio.analytics import custom_component_analytics
from gradio.cli.commands.components._docs_utils import (
    get_deep,
)
from gradio.cli.commands.components.docs import run_command
from gradio.cli.commands.components.install_component import _get_executable_path
from gradio.cli.commands.display import LivePanelDisplay

gradio_template_path = Path(gradio.__file__).parent / "templates" / "frontend"


def _build(
    path: Annotated[
        Path, typer.Argument(help="The directory of the custom component.")
    ] = Path("."),
    build_frontend: Annotated[
        bool, typer.Option(help="Whether to build the frontend as well.")
    ] = True,
    bump_version: Annotated[
        bool, typer.Option(help="Whether to bump the version number automatically.")
    ] = False,
    generate_docs: Annotated[
        bool, typer.Option(help="Whether to generate the documentation as well.")
    ] = True,
    python_path: Annotated[
        Optional[str],
        typer.Option(
            help="Path to python executable. If None, will use the default path found by `which python3`. If python3 is not found, `which python` will be tried. If both fail an error will be raised."
        ),
    ] = None,
):
    custom_component_analytics(
        "build",
        None,
        None,
        None,
        None,
        generate_docs=generate_docs,
        bump_version=bump_version,
    )
    name = Path(path).resolve()
    if not (name / "pyproject.toml").exists():
        raise ValueError(f"Cannot find pyproject.toml file in {name}")

    with LivePanelDisplay() as live:
        live.update(
            f":package: Building package in [orange3]{str(name.name)}[/]", add_sleep=0.2
        )
        pyproject_toml = parse((path / "pyproject.toml").read_text())
        package_name = get_deep(pyproject_toml, ["project", "name"])

        python_path = _get_executable_path(
            "python", python_path, "--python-path", check_3=True
        )

        if not isinstance(package_name, str):
            raise ValueError(
                "Your pyproject.toml file does not have a [project] name field!"
            )
        try:
            importlib.import_module(package_name)  # type: ignore
        except ModuleNotFoundError as e:
            raise ValueError(
                f"Your custom component package ({package_name}) is not installed! "
                "Please install it with the gradio cc install command before building it."
            ) from e
        if bump_version:
            pyproject_toml = parse((path / "pyproject.toml").read_text())
            version = semantic_version.Version(
                pyproject_toml["project"]["version"]  # type: ignore
            ).next_patch()
            live.update(
                f":1234: Using version [bold][magenta]{version}[/][/]. "
                "Set [bold][magenta]--no-bump-version[/][/] to use the version in pyproject.toml file."
            )
            pyproject_toml["project"]["version"] = str(version)  # type: ignore
            with open(path / "pyproject.toml", "w", encoding="utf-8") as f:
                dump(pyproject_toml, f)
        else:
            version = pyproject_toml["project"]["version"]  # type: ignore
            live.update(
                f":1234: Package will use version [bold][magenta]{version}[/][/] defined in pyproject.toml file. "
                "Set [bold][magenta]--bump-version[/][/] to automatically bump the version number."
            )

        if generate_docs:
            _demo_dir = Path("demo").resolve()
            _demo_name = "app.py"
            _demo_path = _demo_dir / _demo_name
            _readme_path = name / "README.md"

            run_command(
                live=live,
                name=package_name,
                suppress_demo_check=False,
                pyproject_toml=pyproject_toml,
                generate_space=True,
                generate_readme=True,
                type_mode="simple",
                _demo_path=_demo_path,
                _demo_dir=_demo_dir,
                _readme_path=_readme_path,
                space_url=None,
                _component_dir=name,
                simple=True,
            )

        if build_frontend:
            live.update(":art: Building frontend")
            component_directory = path.resolve()

            node = shutil.which("node")
            if not node:
                raise ValueError(
                    "node must be installed in order to run build command."
                )

            gradio_node_path = subprocess.run(
                [node, "-e", "console.log(require.resolve('@gradio/preview'))"],
                cwd=Path(component_directory / "frontend"),
                check=False,
                capture_output=True,
            )

            if gradio_node_path.returncode != 0:
                raise ValueError(
                    "Could not find `@gradio/preview`. Run `npm i -D @gradio/preview` in your frontend folder."
                )

            gradio_node_path = gradio_node_path.stdout.decode("utf-8").strip()

            node_cmds = [
                node,
                gradio_node_path,
                "--component-directory",
                component_directory,
                "--root",
                gradio_template_path,
                "--mode",
                "build",
                "--python-path",
                python_path,
            ]
            pipe = subprocess.run(
                node_cmds, capture_output=True, text=True, check=False
            )
            if pipe.returncode != 0:
                live.update(":red_square: Build failed!")
                live.update(pipe.stderr)
                live.update(pipe.stdout)
                raise SystemExit("Frontend build failed")
            else:
                live.update(":white_check_mark: Build succeeded!")

        cmds = [python_path, "-m", "build", str(name)]
        live.update(f":construction_worker: Building... [grey37]({' '.join(cmds)})[/]")
        pipe = subprocess.run(cmds, capture_output=True, text=True, check=False)
        if pipe.returncode != 0:
            live.update(":red_square: Build failed!")
            live.update(pipe.stderr)
            raise SystemExit("Python build failed")
        else:
            live.update(":white_check_mark: Build succeeded!")
            live.update(
                f":ferris_wheel: Wheel located in [orange3]{str(name / 'dist')}[/]"
            )
