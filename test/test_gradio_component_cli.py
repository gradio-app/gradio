import textwrap

import pytest

from gradio.cli.commands.components._create_utils import OVERRIDES
from gradio.cli.commands.components.create import _create
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
    ],
)
def test_template_override_component(template, tmp_path):
    _create("MyComponent", tmp_path, template=template, overwrite=True)
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
            "MyComponent", tmp_path, template="NonExistentComponent", overwrite=True
        )


def test_do_not_replace_class_name_in_import_statement(tmp_path):
    _create("MyImage", template="Image", directory=tmp_path, overwrite=True)
    code = (tmp_path / "backend" / "gradio_myimage" / "myimage.py").read_text()
    assert "from PIL import Image as _Image" in code
    assert "class MyImage" in code
    assert "_Image.Image" in code


def test_raises_if_directory_exists(tmp_path):
    with pytest.raises(
        ValueError, match=f"The directory {tmp_path.resolve()} already exists."
    ):
        _create("MyComponent", tmp_path)


def test_show(capsys):
    _show()
    stdout, _ = capsys.readouterr()
    assert "Form Component" in stdout
    assert "Beginner Friendly" in stdout
    assert "Layout" in stdout
    assert "Dataframe" not in stdout
    assert "Dataset" not in stdout
