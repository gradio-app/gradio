import pytest

from gradio.cli.commands.components.create import _create


def test_template_layout_component(tmp_path):
    _create("MyRow", tmp_path, template="Row", overwrite=True)
    assert (
        (tmp_path / "demo" / "app.py").read_text()
        == """
import gradio as gr
from gradio_myrow import MyRow


with gr.Blocks() as demo:
    with MyRow():
        gr.Textbox(value="foo", interactive=True)
        gr.Number(value=10, interactive=True)
 

demo.launch()
"""
    )
    assert (tmp_path / "backend" / "gradio_myrow" / "myrow.py").exists()


def test_raise_error_component_template_does_not_exist(tmp_path):
    with pytest.raises(
        ValueError,
        match="Cannot find NonExistentComponent in gradio.components or gradio.layouts",
    ):
        _create(
            "MyComponent", tmp_path, template="NonExistentComponent", overwrite=True
        )


def test_overwrite_deletes_previous_content(tmp_path):
    _create("MyGallery", tmp_path, template="Gallery", overwrite=True)
    _create("MySlider", tmp_path, template="Slider", overwrite=True)
    assert (tmp_path / "frontend" / "interactive" / "StaticSlider.svelte").exists()
    assert not (tmp_path / "frontend" / "static" / "StaticGallery.svelte").exists()


def test_do_not_replace_class_name_in_import_statement(tmp_path):
    _create("MyImage", template="Image", directory=tmp_path, overwrite=True)
    code = (tmp_path / "backend" / "gradio_myimage" / "myimage.py").read_text()
    assert "from PIL import Image as _Image" in code
    assert "class MyImage" in code
    assert "_Image.Image" in code
