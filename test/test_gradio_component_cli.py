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
