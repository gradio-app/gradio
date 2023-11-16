import textwrap
from pathlib import Path

import pytest

from gradio.cli.commands.components._create_utils import OVERRIDES
from gradio.cli.commands.components.build import _build
from gradio.cli.commands.components.create import _create
from gradio.cli.commands.components.install_component import _install
from gradio.cli.commands.components.publish import _get_version_from_file
from gradio.cli.commands.components.show import _show


@pytest.mark.parametrize(
    "template",
    [
        "Row",
        "Column",
        "Tabs",
        "Group",
        "Accordion",
        "AnnotatedImage",
        "HighlightedText",
        "BarPlot",
        "ClearButton",
        "ColorPicker",
        "DuplicateButton",
        "LinePlot",
        "LogoutButton",
        "LoginButton",
        "ScatterPlot",
        "UploadButton",
        "JSON",
        "FileExplorer",
        "Model3D",
    ],
)
def test_template_override_component(template, tmp_path):
    _create(
        "MyComponent",
        tmp_path,
        template=template,
        overwrite=True,
        install=False,
        configure_metadata=False,
    )
    app = (tmp_path / "demo" / "app.py").read_text()
    answer = textwrap.dedent(
        f"""
import gradio as gr
from gradio_mycomponent import MyComponent

{OVERRIDES[template].demo_code.format(name="MyComponent")}

demo.launch()
"""
    )
    assert app.strip() == answer.strip()
    assert (tmp_path / "backend" / "gradio_mycomponent" / "mycomponent.py").exists()


def test_raise_error_component_template_does_not_exist(tmp_path):
    with pytest.raises(
        ValueError,
        match="Cannot find NonExistentComponent in gradio.components or gradio.layouts",
    ):
        _create(
            "MyComponent",
            tmp_path,
            template="NonExistentComponent",
            overwrite=True,
            install=False,
            configure_metadata=False,
        )


def test_do_not_replace_class_name_in_import_statement(tmp_path):
    _create(
        "MyImage",
        template="Image",
        directory=tmp_path,
        overwrite=True,
        install=False,
        configure_metadata=False,
    )
    code = (tmp_path / "backend" / "gradio_myimage" / "myimage.py").read_text()
    assert "from PIL import Image as _Image" in code
    assert "class MyImage" in code
    assert "_Image.Image" in code


def test_raises_if_directory_exists(tmp_path):
    with pytest.raises(
        Exception
    ):  # Keeping it a general exception since the specific exception seems to differ between operating systems
        _create("MyComponent", tmp_path, configure_metadata=False)


def test_show(capsys):
    _show()
    stdout, _ = capsys.readouterr()
    assert "Form Component" in stdout
    assert "Beginner Friendly" in stdout
    assert "Layout" in stdout
    assert "Dataframe" not in stdout
    assert "Dataset" not in stdout


@pytest.mark.xfail
@pytest.mark.parametrize("template", ["Audio", "Video", "Image", "Textbox"])
def test_build(template, tmp_path):
    _create(
        "TestTextbox",
        template=template,
        directory=tmp_path,
        overwrite=True,
        install=True,
        configure_metadata=False,
    )
    _build(tmp_path, build_frontend=True)
    template_dir: Path = (
        tmp_path.resolve() / "backend" / "gradio_testtextbox" / "templates"
    )
    assert template_dir.exists() and template_dir.is_dir()
    assert list(template_dir.glob("**/index.js"))
    assert (tmp_path / "dist").exists() and list((tmp_path / "dist").glob("*.whl"))


def test_install(tmp_path):
    _create(
        "TestTextbox",
        template="Textbox",
        directory=tmp_path,
        overwrite=True,
        install=False,
        configure_metadata=False,
    )

    assert not (tmp_path / "frontend" / "node_modules").exists()
    _install(tmp_path)
    assert (tmp_path / "frontend" / "node_modules").exists()


def test_fallback_template_app(tmp_path):
    _create(
        "SimpleComponent2",
        directory=tmp_path,
        overwrite=True,
        install=False,
        configure_metadata=False,
    )
    app = (tmp_path / "demo" / "app.py").read_text()
    answer = textwrap.dedent(
        """

import gradio as gr
from gradio_simplecomponent2 import SimpleComponent2


with gr.Blocks() as demo:
    gr.Markdown("# Change the value (keep it JSON) and the front-end will update automatically.")
    SimpleComponent2(value={"message": "Hello from Gradio!"}, label="Static")


demo.launch()

"""
    )
    assert app.strip() == answer.strip()


def test_get_version_from_wheel():
    assert (
        _get_version_from_file(Path("gradio_textwithattachments-0.0.3-py3-none.whl"))
        == "0.0.3"
    )
    assert (
        _get_version_from_file(Path("gradio_textwithattachments-1.0.3b12-py3-none.whl"))
        == "1.0.3b12"
    )
