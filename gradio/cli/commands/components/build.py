from __future__ import annotations

import importlib
import shutil
import subprocess
from pathlib import Path

import click
from packaging.version import Version
from tomlkit import dump, parse

import gradio
from gradio.analytics import custom_component_analytics
from gradio.cli.commands.components._docs_utils import (
    get_deep,
)
from gradio.cli.commands.components.docs import run_command
from gradio.cli.commands.components.install_component import (
    _get_executable_path,
    _get_frontend_dir,
)
from gradio.cli.commands.display import LivePanelDisplay

gradio_template_path = Path(gradio.__file__).parent / "templates" / "frontend"  # type: ignore


def _build(
    path: Path = Path("."),
    build_frontend: bool = True,
    bump_version: bool = False,
    generate_docs: bool = True,
    python_path: str | None = None,
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
        live.update(f"📦 Building package in {str(name.name)}", add_sleep=0.2)
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
            current = Version(str(pyproject_toml["project"]["version"]))  # type: ignore
            version = f"{current.major}.{current.minor}.{current.micro + 1}"
            live.update(
                f"🔢 Using version {version}. "
                "Set --no-bump-version to use the version in pyproject.toml file."
            )
            pyproject_toml["project"]["version"] = version  # type: ignore
            with open(path / "pyproject.toml", "w", encoding="utf-8") as f:
                dump(pyproject_toml, f)
        else:
            version = pyproject_toml["project"]["version"]  # type: ignore
            live.update(
                f"🔢 Package will use version {version} defined in pyproject.toml file. "
                "Set --bump-version to automatically bump the version number."
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
            live.update("🎨 Building frontend")
            component_directory = path.resolve()

            node = shutil.which("node")
            if not node:
                raise ValueError(
                    "node must be installed in order to run build command."
                )

            frontend_dir = _get_frontend_dir(component_directory)

            gradio_node_path = subprocess.run(
                [node, "-e", "console.log(require.resolve('@gradio/preview'))"],
                cwd=frontend_dir,
                check=False,
                capture_output=True,
            )

            if gradio_node_path.returncode != 0:
                raise ValueError(
                    f"Could not find `@gradio/preview`. Run `npm i -D @gradio/preview` in your frontend folder ({frontend_dir})."
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
                live.update("🟥 Build failed!")
                live.update(pipe.stderr)
                live.update(pipe.stdout)
                raise SystemExit("Frontend build failed")
            else:
                live.update("✅ Build succeeded!")

        cmds = [python_path, "-m", "build", str(name)]
        live.update(f"👷 Building... ({' '.join(cmds)})")
        pipe = subprocess.run(cmds, capture_output=True, text=True, check=False)
        if pipe.returncode != 0:
            live.update("🟥 Build failed!")
            live.update(pipe.stderr)
            raise SystemExit("Python build failed")
        else:
            live.update("✅ Build succeeded!")
            live.update(f"🎡 Wheel located in {str(name / 'dist')}")


build_command = click.Command(
    name="build",
    callback=_build,
    help="Build the component for distribution. Must be called from the component directory. PATH is the directory of the custom component (default: the current directory).",
    params=[
        click.Argument(["path"], type=click.Path(path_type=Path), default=Path(".")),
        click.Option(
            ["--build-frontend/--no-build-frontend"],
            default=True,
            show_default=True,
            help="Whether to build the frontend as well.",
        ),
        click.Option(
            ["--bump-version/--no-bump-version"],
            default=False,
            show_default=True,
            help="Whether to bump the version number automatically.",
        ),
        click.Option(
            ["--generate-docs/--no-generate-docs"],
            default=True,
            show_default=True,
            help="Whether to generate the documentation as well.",
        ),
        click.Option(
            ["--python-path"],
            help="Path to python executable. If None, will use the default path found by `which python3`. If python3 is not found, `which python` will be tried. If both fail an error will be raised.",
        ),
    ],
)
