import inspect
import os

import numpy as np
import pandas as pd
import pytest
from gradio_client import utils as client_utils
from gradio_pdf import PDF

import gradio as gr
from gradio import processing_utils
from gradio.components.base import Component
from gradio.data_classes import GradioModel, GradioRootModel
from gradio.templates import TextArea

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class TestGettingComponents:
    def test_component_function(self):
        assert isinstance(gr.components.component("textarea", render=False), TextArea)

    @pytest.mark.parametrize(
        "component, render, unrender, should_be_rendered",
        [
            (gr.Textbox(render=True), False, True, False),
            (gr.Textbox(render=False), False, False, False),
            (gr.Textbox(render=False), True, False, True),
            ("textbox", False, False, False),
            ("textbox", True, False, True),
        ],
    )
    def test_get_component_instance_rendering(
        self, component, render, unrender, should_be_rendered
    ):
        with gr.Blocks():
            textbox = gr.components.get_component_instance(
                component, render=render, unrender=unrender
            )
            assert textbox.is_rendered == should_be_rendered


class TestNames:
    # This test ensures that `components.get_component_instance()` works correctly when instantiating from components
    def test_no_duplicate_uncased_names(self, io_components):
        unique_subclasses_uncased = {s.__name__.lower() for s in io_components}
        assert len(io_components) == len(unique_subclasses_uncased)


def test_dataframe_process_example_converts_dataframes():
    df_comp = gr.Dataframe()
    assert df_comp.process_example(
        pd.DataFrame({"a": [1, 2, 3, 4], "b": [5, 6, 7, 8]})
    ) == [
        [1, 5],
        [2, 6],
        [3, 7],
        [4, 8],
    ]
    assert df_comp.process_example(np.array([[1, 2], [3, 4.0]])) == [
        [1.0, 2.0],
        [3.0, 4.0],
    ]


@pytest.mark.parametrize("component", [gr.Model3D, gr.File, gr.Audio])
def test_process_example_returns_file_basename(component):
    component = component()
    assert (
        component.process_example("/home/freddy/sources/example.ext") == "example.ext"
    )
    assert component.process_example(None) == ""


def test_component_class_ids():
    button_id = gr.Button().component_class_id
    textbox_id = gr.Textbox().component_class_id
    json_id = gr.JSON().component_class_id
    mic_id = gr.Mic().component_class_id
    microphone_id = gr.Microphone().component_class_id
    audio_id = gr.Audio().component_class_id

    assert button_id == gr.Button().component_class_id
    assert textbox_id == gr.Textbox().component_class_id
    assert json_id == gr.JSON().component_class_id
    assert mic_id == gr.Mic().component_class_id
    assert microphone_id == gr.Microphone().component_class_id
    assert audio_id == gr.Audio().component_class_id
    assert mic_id == microphone_id

    # Make sure that the ids are unique
    assert len({button_id, textbox_id, json_id, microphone_id, audio_id}) == 5


def test_constructor_args():
    assert gr.Textbox(max_lines=314).constructor_args == {"max_lines": 314}
    assert gr.LoginButton(visible=False, value="Log in please").constructor_args == {
        "visible": False,
        "value": "Log in please",
    }


def test_template_component_configs(io_components):
    """
    This test ensures that every "template" (the classes defined in gradio/template.py)
    has all of the arguments that its parent class has. E.g. the constructor of the `Sketchpad`
    class should have all of the arguments that the constructor of `ImageEditor` has
    """
    template_components = [c for c in io_components if getattr(c, "is_template", False)]
    for component in template_components:
        component_parent_class = inspect.getmro(component)[1]
        template_config = component().get_config()
        parent_config = component_parent_class().get_config()
        assert set(parent_config.keys()).issubset(set(template_config.keys()))


def test_component_example_values(io_components):
    for component in io_components:
        if component == PDF:
            continue
        elif component in [gr.BarPlot, gr.LinePlot, gr.ScatterPlot]:
            c: Component = component(x="x", y="y")
        else:
            c: Component = component()
        c.postprocess(c.example_value())


def test_component_example_payloads(io_components):
    for component in io_components:
        if component == PDF:
            continue
        elif issubclass(component, gr.components.NativePlot):
            c: Component = component(x="x", y="y")
        elif component == gr.FileExplorer:
            c: Component = component(root_dir="gradio")
        else:
            c: Component = component()
        data = c.example_payload()
        data = client_utils.synchronize_async(
            processing_utils.async_move_files_to_cache,
            data,
            c,
            check_in_upload_folder=False,
        )
        if getattr(c, "data_model", None) and data is not None:
            if issubclass(c.data_model, GradioModel):  # type: ignore
                data = c.data_model(**data)  # type: ignore
            elif issubclass(c.data_model, GradioRootModel):  # type: ignore
                data = c.data_model(root=data)  # type: ignore
        c.preprocess(data)  # type: ignore
