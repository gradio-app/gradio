import pytest

from gradio.cli.commands.components.create import _create


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
