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
    """Check if the current working directory ends with gradio/js/preview/test."""
    return Path.cwd().parts[-4:] == ("gradio", "js", "preview", "test")


default_demo_code = """
example = {name}().example_value()

demo = gr.Interface(
    lambda x:x,
    {name}(),  # interactive version of your component
    {name}(),  # static version of your component
    # examples=[[example]],  # uncomment this line to view the "example version" of your component
)
"""

static_only_demo_code = """
example = {name}().example_value()

with gr.Blocks() as demo:
    with gr.Row():
        {name}(label="Blank"),  # blank component
        {name}(value=example, label="Populated"),  # populated component
"""

layout_demo_code = """
with gr.Blocks() as demo:
    with {name}():
        gr.Textbox(value="foo", interactive=True)
        gr.Number(value=10, interactive=True)
"""

fallback_code = """
with gr.Blocks() as demo:
    gr.Markdown("# Change the value (keep it JSON) and the front-end will update automatically.")
    {name}(value={{"message": "Hello from Gradio!"}}, label="Static")
"""


PATTERN_RE = r"gradio-template-\w+"
PATTERN = "gradio-template-{template}"


@dataclasses.dataclass
class ComponentFiles:
    template: str
    demo_code: str = default_demo_code
    python_file_name: str = ""
    js_dir: str = ""

    def __post_init__(self):
        self.js_dir = self.js_dir or self.template.lower()
        self.python_file_name = self.python_file_name or f"{self.template.lower()}.py"


OVERRIDES = {
    "AnnotatedImage": ComponentFiles(
        template="AnnotatedImage",
        python_file_name="annotated_image.py",
        demo_code=static_only_demo_code,
    ),
    "HighlightedText": ComponentFiles(
        template="HighlightedText",
        python_file_name="highlighted_text.py",
        demo_code=static_only_demo_code,
    ),
    "Chatbot": ComponentFiles(template="Chatbot", demo_code=static_only_demo_code),
    "Gallery": ComponentFiles(template="Gallery", demo_code=static_only_demo_code),
    "HTML": ComponentFiles(template="HTML", demo_code=static_only_demo_code),
    "Label": ComponentFiles(template="Label", demo_code=static_only_demo_code),
    "Markdown": ComponentFiles(template="Markdown", demo_code=static_only_demo_code),
    "Fallback": ComponentFiles(template="Fallback", demo_code=fallback_code),
    "Plot": ComponentFiles(template="Plot", demo_code=static_only_demo_code),
    "BarPlot": ComponentFiles(
        template="BarPlot",
        python_file_name="bar_plot.py",
        js_dir="plot",
        demo_code=static_only_demo_code,
    ),
    "ClearButton": ComponentFiles(
        template="ClearButton",
        python_file_name="clear_button.py",
        js_dir="button",
        demo_code=static_only_demo_code,
    ),
    "ColorPicker": ComponentFiles(
        template="ColorPicker", python_file_name="color_picker.py"
    ),
    "DuplicateButton": ComponentFiles(
        template="DuplicateButton",
        python_file_name="duplicate_button.py",
        js_dir="button",
        demo_code=static_only_demo_code,
    ),
    "FileExplorer": ComponentFiles(
        template="FileExplorer",
        python_file_name="file_explorer.py",
        js_dir="fileexplorer",
        demo_code=textwrap.dedent(
            """
        import os

        with gr.Blocks() as demo:
            {name}(value=os.path.dirname(__file__).split(os.sep))
    """
        ),
    ),
    "LinePlot": ComponentFiles(
        template="LinePlot",
        python_file_name="line_plot.py",
        js_dir="plot",
        demo_code=static_only_demo_code,
    ),
    "LogoutButton": ComponentFiles(
        template="LogoutButton",
        python_file_name="logout_button.py",
        js_dir="button",
        demo_code=static_only_demo_code,
    ),
    "LoginButton": ComponentFiles(
        template="LoginButton",
        python_file_name="login_button.py",
        js_dir="button",
        demo_code=static_only_demo_code,
    ),
    "ScatterPlot": ComponentFiles(
        template="ScatterPlot",
        python_file_name="scatter_plot.py",
        js_dir="plot",
        demo_code=static_only_demo_code,
    ),
    "UploadButton": ComponentFiles(
        template="UploadButton",
        python_file_name="upload_button.py",
        demo_code=static_only_demo_code,
    ),
    "JSON": ComponentFiles(
        template="JSON",
        python_file_name="json_component.py",
        demo_code=static_only_demo_code,
    ),
    "Row": ComponentFiles(
        template="Row",
        demo_code=layout_demo_code,
    ),
    "Column": ComponentFiles(
        template="Column",
        demo_code=layout_demo_code,
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
    ),
    "Group": ComponentFiles(
        template="Group",
        demo_code=layout_demo_code,
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
    ),
    "Model3D": ComponentFiles(
        template="Model3D",
        js_dir="model3D",
        demo_code=textwrap.dedent(
            """
        with gr.Blocks() as demo:
            {name}()
        """
        ),
    ),
}


def _get_component_code(template: str | None) -> ComponentFiles:
    template = template or "Fallback"
    if template in OVERRIDES:
        return OVERRIDES[template]
    else:
        return ComponentFiles(
            python_file_name=f"{template.lower()}.py",
            js_dir=template.lower(),
            template=template,
        )


def _get_js_dependency_version(name: str, local_js_dir: Path) -> str:
    package_json = json.loads(
        Path(local_js_dir / name.split("/")[1] / "package.json").read_text()
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


def delete_contents(directory: str | Path) -> None:
    """Delete all contents of a directory, but not the directory itself."""
    path = Path(directory)
    for child in path.glob("*"):
        if child.is_file():
            child.unlink()
        elif child.is_dir():
            shutil.rmtree(child)


def _create_frontend(
    name: str,  # noqa: ARG001
    component: ComponentFiles,
    directory: Path,
    package_name: str,
):
    frontend = directory / "frontend"
    frontend.mkdir(exist_ok=True)

    p = Path(inspect.getfile(gradio)).parent

    def ignore(_src, names):
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
    source_package_json = json.loads(Path(frontend / "package.json").read_text())
    source_package_json["name"] = package_name
    source_package_json = _modify_js_deps(source_package_json, "dependencies", p)
    source_package_json = _modify_js_deps(source_package_json, "devDependencies", p)
    (frontend / "package.json").write_text(json.dumps(source_package_json, indent=2))


def _replace_old_class_name(old_class_name: str, new_class_name: str, content: str):
    pattern = rf"(?<=\b)(?<!\bimport\s)(?<!\.){re.escape(old_class_name)}(?=\b)"
    return re.sub(pattern, new_class_name, content)


def _strip_document_lines(content: str):
    return "\n".join(
        [line for line in content.split("\n") if not line.startswith("@document(")]
    )


def _create_backend(
    name: str, component: ComponentFiles, directory: Path, package_name: str
):
    def find_template_in_list(template, list_to_search):
        for item in list_to_search:
            if template.lower() == item.lower():
                return item
        return None

    lists_to_search = [
        (gradio.components.__all__, "components"),
        (gradio.layouts.__all__, "layouts"),
        (gradio._simple_templates.__all__, "_simple_templates"),  # type: ignore
    ]

    correct_cased_template = None
    module = None

    for list_, module_name in lists_to_search:
        correct_cased_template = find_template_in_list(component.template, list_)
        if correct_cased_template:
            module = module_name
            break

    if not correct_cased_template:
        raise ValueError(
            f"Cannot find {component.template} in gradio.components, gradio.layouts, or gradio._simple_templates. "
            "Please pass in a valid component name via the --template option. It must match the name of the python class."
        )

    if not module:
        raise ValueError("Module not found")

    readme_contents = textwrap.dedent(
        """
# {package_name}
A Custom Gradio component.

## Example usage

```python
import gradio as gr
from {package_name} import {name}
```
"""
    ).format(package_name=package_name, name=name)
    (directory / "README.md").write_text(readme_contents)

    backend = directory / "backend" / package_name
    backend.mkdir(exist_ok=True, parents=True)

    gitignore = Path(__file__).parent / "files" / "gitignore"
    gitignore_contents = gitignore.read_text()
    gitignore_dest = directory / ".gitignore"
    gitignore_dest.write_text(gitignore_contents)

    pyproject = Path(__file__).parent / "files" / "pyproject_.toml"
    pyproject_contents = pyproject.read_text()
    pyproject_dest = directory / "pyproject.toml"
    pyproject_contents = pyproject_contents.replace("<<name>>", package_name).replace(
        "<<template>>", PATTERN.format(template=correct_cased_template)
    )
    pyproject_dest.write_text(pyproject_contents)

    demo_dir = directory / "demo"
    demo_dir.mkdir(exist_ok=True, parents=True)

    (demo_dir / "app.py").write_text(
        f"""
import gradio as gr
from {package_name} import {name}

{component.demo_code.format(name=name)}

if __name__ == "__main__":
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
    content = _replace_old_class_name(correct_cased_template, name, content)
    content = _strip_document_lines(content)
    python_file.write_text(content)
    if pyi_file.exists():
        pyi_content = pyi_file.read_text()
        pyi_content = _replace_old_class_name(correct_cased_template, name, content)
        pyi_content = _strip_document_lines(pyi_content)
        pyi_file.write_text(pyi_content)
