"""Create a custom component template"""
import json
import pathlib
import shutil
import textwrap
import inspect
import gradio
import typer
from typing_extensions import Annotated
from gradio.components import generate_stubs

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
    backend = pathlib.Path(name.lower()) / name.lower()
    backend.mkdir(exist_ok=True)
    build_dir = backend / "build"
    build_dir.mkdir(exist_ok=True)

    build_hook = pathlib.Path(__file__).parent / "files" / "generate_interface_files.py"

    shutil.copy(
            str(build_hook),
            str(build_dir / "generate_interface_files.py"),
        )
    
    pyproject = pathlib.Path(__file__).parent / "files" / "pyproject_.toml"
    pyproject_contents = pyproject.read_text()
    pyproject_dest =  pathlib.Path(name.lower()) / "pyproject.toml"
    pyproject_dest.write_text(pyproject_contents.replace("<<name>>", name.lower()))

    shutil.copy(
            str(build_hook),
            str(build_dir / "generate_interface_files.py"),
        )

    init = backend / "__init__.py"
    init.touch(exist_ok=True)

    init_contents = textwrap.dedent(f"""
from .{name.lower()} import {name}

{inspect.getsource(generate_stubs)}
    """)

    init.write_text(init_contents)
    
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
            shutil.copy(
                str(source_pyi_file),
                str(pyi_file)
            )

        content = python_file.read_text()
        python_file.write_text(content.replace(f"class {template}", f"class {name}"))

        pyi_content = pyi_file.read_text()
        pyi_file.write_text(pyi_content.replace(f"class {template}", f"class {name}"))


@app.command("create")
def _create(
    name: str,
    template: Annotated[str, typer.Option(help="Component to use as a template.")] = "",
):
    pathlib.Path(name.lower()).mkdir(exist_ok=True)

    _create_frontend(name.lower(), template)
    _create_backend(name, template)


@app.command("develop")
def dev():
    # Pete adds code here to spin up local front-end 
    # and backend servers in development mode
    print("TODO")


@app.command("build")
def build():
    print("build")


def main():
    app()
