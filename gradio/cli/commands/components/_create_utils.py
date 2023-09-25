from __future__ import annotations

import dataclasses
import inspect
import json
import re
import shutil
import textwrap
from pathlib import Path
from typing import Literal

import gradio


def _in_test_dir():
    """Determine if we're in the test dir."""
    gradio_dir = (Path(gradio.__file__) / ".." / "..").resolve()
    try:
        (gradio_dir / "js" / "gradio-preview" / "test").relative_to(Path().cwd())
        return True
    except ValueError:
        return False


default_demo_code = """
example = {name}().example_inputs()

with gr.Blocks() as demo:
    {name}(value=example, interactive=True)
    {name}(value=example, interactive=False)
"""


@dataclasses.dataclass
class ComponentFiles:
    template: str
    demo_code: str = default_demo_code
    python_file_name: str = ""
    js_dir: str = ""


OVERRIDES = {
    "JSON": ComponentFiles(template="JSON", python_file_name="json_component"),
    "Row": ComponentFiles(
        template="Row",
        demo_code=textwrap.dedent(
            """
        with gr.Blocks() as demo:
            with {name}():
                gr.Textbox(value="foo", interactive=True)
                gr.Number(value=10, interactive=True)
        """
        ),
        python_file_name="row",
    ),
    "Column": ComponentFiles(
        template="Column",
        demo_code=textwrap.dedent(
            """
        with gr.Blocks() as demo:
            with {name}():
                gr.Textbox(value="foo", interactive=True)
                gr.Number(value=10, interactive=True)
        """
        ),
        python_file_name="column",
    ),
    "Tabs": ComponentFiles(
        template="Tabs",
        demo_code=textwrap.dedent(
            """
        with gr.Blocks() as demo:
            with {name}():
                with gr.Tab("Tab 1"):
                    gr.Textbox(value="foo", interactive=True)
                with gr.Tab("Tab 2"):
                    gr.Number(value=10, interactive=True)
        """
        ),
        python_file_name="tabs",
    ),
    "Group": ComponentFiles(
        template="Group",
        demo_code=textwrap.dedent(
            """
        with gr.Blocks() as demo:
            with {name}():
                gr.Textbox(value="foo", interactive=True)
                gr.Number(value=10, interactive=True)
        """
        ),
        python_file_name="group",
    ),
    "Accordion": ComponentFiles(
        template="Accordion",
        demo_code=textwrap.dedent(
            """
        with gr.Blocks() as demo:
            with {name}(label="Accordion"):
                gr.Textbox(value="foo", interactive=True)
                gr.Number(value=10, interactive=True)
        """
        ),
        python_file_name="accordion",
    ),
}


def _get_component_code(template: str | None) -> ComponentFiles:
    template = template or "Fallback"
    return ComponentFiles(
        python_file_name=f"{template.lower()}.py",
        js_dir=template.lower(),
        template=template,
    )


def _get_js_dependency_version(name: str, local_js_dir: Path) -> str:
    package_json = json.load(
        open(str(local_js_dir / name.split("/")[1] / "package.json"))
    )
    return package_json["version"]


def _modify_js_deps(
    package_json: dict,
    key: Literal["dependencies", "devDependencies"],
    gradio_dir: Path,
):
    for dep in package_json.get(key, []):
        # if curent working directory is the gradio repo, use the local version of the dependency'
        if not _in_test_dir() and dep.startswith("@gradio/"):
            package_json[key][dep] = _get_js_dependency_version(
                dep, gradio_dir / "_frontend_code"
            )
    return package_json


def _create_frontend(name: str, component: ComponentFiles, directory: Path):
    frontend = directory / "frontend"
    frontend.mkdir(exist_ok=True)

    p = Path(inspect.getfile(gradio)).parent

    def ignore(s, names):
        ignored = []
        for n in names:
            if (
                n.startswith("CHANGELOG")
                or n.startswith("README.md")
                or ".test." in n
                or ".stories." in n
                or ".spec." in n
            ):
                ignored.append(n)
        return ignored

    shutil.copytree(
        str(p / "_frontend_code" / component.js_dir),
        frontend,
        dirs_exist_ok=True,
        ignore=ignore,
    )
    source_package_json = json.load(open(str(frontend / "package.json")))
    source_package_json["name"] = name.lower()
    source_package_json = _modify_js_deps(source_package_json, "dependencies", p)
    source_package_json = _modify_js_deps(source_package_json, "devDependencies", p)

    json.dump(source_package_json, open(str(frontend / "package.json"), "w"), indent=2)


def _replace_old_class_name(old_class_name: str, new_class_name: str, content: str):
    pattern = rf"(?<=\b){re.escape(old_class_name)}(?=\b)"
    return re.sub(pattern, new_class_name, content)


def _create_backend(
    name: str, component: ComponentFiles, directory: Path, package_name: str
):
    if component.template in gradio.components.__all__:
        module = "components"
    elif component.template in gradio.layouts.__all__:
        module = "layouts"
    else:
        raise ValueError(
            f"Cannot find {component.template} in gradio.components or gradio.layouts"
        )

    backend = directory / "backend" / package_name
    backend.mkdir(exist_ok=True, parents=True)

    gitignore = Path(__file__).parent / "files" / "gitignore"
    gitignore_contents = gitignore.read_text()
    gitignore_dest = directory / ".gitignore"
    gitignore_dest.write_text(gitignore_contents)

    pyproject = Path(__file__).parent / "files" / "pyproject_.toml"
    pyproject_contents = pyproject.read_text()
    pyproject_dest = directory / "pyproject.toml"
    pyproject_dest.write_text(pyproject_contents.replace("<<name>>", package_name))

    demo_dir = directory / "demo"
    demo_dir.mkdir(exist_ok=True, parents=True)

    (demo_dir / "app.py").write_text(
        f"""
import gradio as gr
from {package_name} import {name}

{component.demo_code.format(name=name)} 

demo.launch()
"""
    )
    (demo_dir / "__init__.py").touch()

    init = backend / "__init__.py"
    init.write_text(
        f"""
from .{name.lower()} import {name}

__all__ = ['{name}']
"""
    )

    p = Path(inspect.getfile(gradio)).parent
    python_file = backend / f"{name.lower()}.py"

    shutil.copy(
        str(p / module / component.python_file_name),
        str(python_file),
    )

    source_pyi_file = p / module / component.python_file_name.replace(".py", ".pyi")
    pyi_file = backend / f"{name.lower()}.pyi"
    if source_pyi_file.exists():
        shutil.copy(str(source_pyi_file), str(pyi_file))

    content = python_file.read_text()
    python_file.write_text(_replace_old_class_name(component.template, name, content))
    if pyi_file.exists():
        pyi_content = pyi_file.read_text()
        pyi_file.write_text(
            _replace_old_class_name(component.template, name, pyi_content)
        )
