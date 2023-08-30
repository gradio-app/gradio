"""Create a custom component template"""
import inspect
import json
import pathlib
import shutil
import subprocess
import textwrap
import time

import typer
from rich import print
from rich.live import Live
from rich.panel import Panel
from typing_extensions import Annotated

import gradio

package_json = {
    "name": "<component-name>",
    "version": "0.0.1",
    "description": "Custom Component",
    "type": "module",
    "main": "./index.svelte",
    "author": "",
    "license": "ISC",
    "private": True,
    "exports": {
        ".": "./index.svelte",
        "./package.json": "./package.json",
        "./interactive": "./interactive/index.ts",
        "./static": "./static/index.ts",
        "./example": "./example/index.ts",
    },
    "dependencies": {
        "@gradio/atoms": "workspace:^",
        "@gradio/statustracker": "workspace:^",
        "@gradio/utils": "workspace:^",
    },
}

app = typer.Typer()


def _create_frontend_dir(name: str, dir: pathlib.Path):
    dir.mkdir(exist_ok=True)
    (dir / f"{name}.svelte").write_text("")
    (dir / "index.ts").write_text(f'export {{ default }} from "./{name}.svelte";')


def _create_frontend(name: str, template: str):
    package_json["name"] = name

    path = pathlib.Path(name)
    frontend = path / "frontend"
    frontend.mkdir(exist_ok=True)

    if not template:
        for dirname in ["example", "interactive", "shared", "static"]:
            dir = frontend / dirname
            _create_frontend_dir(name, dir)
    else:
        p = pathlib.Path(inspect.getfile(gradio)).parent

        def ignore(s, names):
            ignored = []
            for n in names:
                if (
                    n.startswith("CHANGELOG")
                    or n.startswith("README.md")
                    or ".test." in n
                    or ".stories." in n
                ):
                    ignored.append(n)
            return ignored

        shutil.copytree(
            str(p / "_frontend_code" / template),
            frontend,
            dirs_exist_ok=True,
            ignore=ignore,
        )

    json.dump(package_json, open(str(frontend / "package.json"), "w"), indent=2)


def _create_backend(name: str, template: str):
    backend = pathlib.Path(name.lower()) / "backend" / name.lower()
    backend.mkdir(exist_ok=True, parents=True)

    gitignore = pathlib.Path(__file__).parent / "files" / "gitignore"
    gitignore_contents = gitignore.read_text()
    gitignore_dest = pathlib.Path(name.lower()) / ".gitignore"
    gitignore_dest.write_text(gitignore_contents)

    pyproject = pathlib.Path(__file__).parent / "files" / "pyproject_.toml"
    pyproject_contents = pyproject.read_text()
    pyproject_dest = pathlib.Path(name.lower()) / "pyproject.toml"
    pyproject_dest.write_text(pyproject_contents.replace("<<name>>", name.lower()))

    init = backend / "__init__.py"
    init.write_text(
        f"""
from .{name.lower()} import {name}

__all__ = ['{name}']
"""
    )

    if not template:
        backend = backend / f"{name.lower()}.py"
        backend.write_text(
            textwrap.dedent(
                f"""
            import gradio as gr
            
            class {name}(gr.components.Component):
                pass

            """
            )
        )
    else:
        p = pathlib.Path(inspect.getfile(gradio)).parent
        python_file = backend / f"{name.lower()}.py"

        shutil.copy(
            str(p / "components" / f"{template.lower()}.py"),
            str(python_file),
        )

        source_pyi_file = p / "components" / f"{template.lower()}.pyi"
        pyi_file = backend / f"{name.lower()}.pyi"
        if source_pyi_file.exists():
            shutil.copy(str(source_pyi_file), str(pyi_file))

        content = python_file.read_text()
        python_file.write_text(content.replace(f"class {template}", f"class {name}"))
        if pyi_file.exists():
            pyi_content = pyi_file.read_text()
            pyi_file.write_text(
                pyi_content.replace(f"class {template}", f"class {name}")
            )


@app.command("create", help="Create a new component.")
def _create(
    name: Annotated[
        str,
        typer.Argument(
            help="Name of the component. Preferably in camel case, i.e. MyTextBox."
        ),
    ],
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
):
    pathlib.Path(name.lower()).mkdir(exist_ok=True)

    all_lines = [
        f":building_construction:  Creating component [orange3]{name}[/] in directory [orange3]{name.lower()}[/]"
    ]
    with Live(Panel("\n".join(all_lines)), refresh_per_second=5) as live:
        if template:
            all_lines.append(f":fax: Starting from template [orange3]{template}[/]")
        else:
            all_lines.append(":page_facing_up: Creating a new component")
        time.sleep(0.2)
        live.update(Panel("\n".join(all_lines)))
        _create_frontend(name.lower(), template)
        all_lines.append(":art: Created frontend code")
        live.update(Panel("\n".join(all_lines)))
        _create_backend(name, template)
        time.sleep(0.2)
        all_lines.append(":snake: Created backend code")
        live.update(Panel("\n".join(all_lines)))
        if install:
            cmds = ["pip", "install", "-e", f"{name.lower()}"]
            all_lines.append(
                f":construction_worker: Installing... [grey37]({' '.join(cmds)})[/]"
            )
            live.update(Panel("\n".join(all_lines)))
            pipe = subprocess.run(cmds, capture_output=True, text=True)
            if pipe.returncode != 0:
                all_lines.append(":red_square: Installation [bold][red]failed[/][/]")
                all_lines.append(pipe.stderr)
            else:
                all_lines.append(":white_check_mark: Install succeeded!")
            live.update(Panel("\n".join(all_lines)))


@app.command("dev")
def dev():
    # Pete adds code here to spin up local front-end
    # and backend servers in development mode
    print("[bold red]TODO![/bold red]")


@app.command(
    "build",
    help="Build the component for distribution. Must be called from the component directory.",
)
def build(
    build_frontend: Annotated[
        bool, typer.Argument(help="Whether to build the frontend as well..")
    ] = True
):
    name = pathlib.Path(".").resolve()
    all_lines = [f":package: Building package in [orange3]{str(name.name)}[/]"]
    with Live(Panel("\n".join(all_lines)), refresh_per_second=5) as live:
        time.sleep(0.25)
        if build_frontend:
            all_lines.append(":art: Building frontend")
        live.update(Panel("\n".join(all_lines)))
        cmds = ["python", "-m", "build"]
        pipe = subprocess.run(cmds, capture_output=True, text=True)
        all_lines.append(
            f":construction_worker: Building... [grey37]({' '.join(cmds)})[/]"
        )
        if pipe.returncode != 0:
            all_lines.append(":red_square: Build failed!")
            all_lines.append(pipe.stderr)
        else:
            all_lines.append(":white_check_mark: Build succeeded!")
            all_lines.append(
                f":ferris_wheel: Wheel located in [orange3]{str(name / 'dist')}[/]"
            )
        live.update(Panel("\n".join(all_lines)))
        all_lines.append("")


def main():
    app()
