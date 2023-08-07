"""Create a custom component template"""
import importlib.resources
import json
import pathlib
import shutil
import textwrap

import typer
from typing_extensions import Annotated

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
        with importlib.resources.path("gradio", "_frontend_code") as p:

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
                str(p / template), frontend, dirs_exist_ok=True, ignore=ignore
            )

    json.dump(package_json, open(str(frontend / "package.json"), "w"), indent=2)


def _create_backend(name: str, template: str):
    backend = pathlib.Path(name.lower()) / "backend"
    backend.mkdir(exist_ok=True)
    init = backend / "__init__.py"
    init.touch(exist_ok=True)
    if not template:
        backend = backend / f"{name.lower()}.py"
        backend.write_text(
            textwrap.dedent(
                f"""
            import gradio as gr
            
            class {name}(gr.components.IOComponent):
                pass

            """
            )
        )
    else:
        with importlib.resources.path("gradio", "components") as p:
            shutil.copy(
                str(p / f"{template.lower()}.py"), str(backend / f"{name.lower()}.py")
            )
        with open(str(backend / f"{name.lower()}.py")) as f:
            content = f.read()
        with open(str(backend / f"{name.lower()}.py"), "w") as f:
            f.write(content.replace(f"class {template}", f"class {name}"))


@app.command("create")
def _create(
    name: str,
    template: Annotated[str, typer.Option(help="Component to use as a template.")] = "",
):
    pathlib.Path(name.lower()).mkdir(exist_ok=True)

    _create_frontend(name.lower(), template)
    _create_backend(name, template)


def main():
    app()
