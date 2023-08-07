"""Create a custom component template"""
import typer
import json
import pathlib
from typing_extensions import Annotated
import importlib.resources
import shutil

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
		"./example": "./example/index.ts"
	},
	"dependencies": {
		"@gradio/atoms": "workspace:^",
		"@gradio/statustracker": "workspace:^",
		"@gradio/utils": "workspace:^"
	}
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
            shutil.copytree(str(p / template), frontend, dirs_exist_ok=True,
                            ignore=lambda s, names: ["CHANGELOG.md", "README.md"])

    json.dump(package_json, open(str(frontend / "package.json"), "w"), indent=2)


@app.command("create")
def _create(name: str, template: Annotated[str, typer.Option(help="Component to use as a template.")] = ""):
    pathlib.Path(name.lower()).mkdir(exist_ok=True)

    _create_frontend(name.lower(), template)

def main():
    app()