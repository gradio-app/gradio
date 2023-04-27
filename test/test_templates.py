import pytest

import gradio.templates


@pytest.mark.parametrize(
    "component",
    [
        gradio.templates.Files,
        gradio.templates.ImageMask,
        gradio.templates.ImagePaint,
        gradio.templates.List,
        gradio.templates.Matrix,
        gradio.templates.Microphone,
        gradio.templates.Numpy,
        gradio.templates.Paint,
        gradio.templates.Pil,
        gradio.templates.PlayableVideo,
        gradio.templates.Sketchpad,
        gradio.templates.TextArea,
        gradio.templates.Webcam,
    ],
)
def test_template_components(component):
    """
    Test that the template components correctly assign
    the template defaults to the component.
    """
    assert component._template_defaults is not None
    comp = component()
    for key, value in component._template_defaults.items():
        if component is gradio.templates.List and key == "col_count":
            # List is a special case where col_count is internally
            # mangled in the initializer
            value = (1, "dynamic")
        assert getattr(comp, key) == value
