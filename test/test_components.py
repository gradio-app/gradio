"""
Tests for all of the components defined in components.py. Tests are divided into two types:
1. test_component_functions() are unit tests that check essential functions of a component, the functions that are checked are documented in the docstring.
2. test_in_interface() are functional tests that check a component's functionalities inside an Interface. Please do not use Interface.launch() in this file, as it slow downs the tests.
"""

import filecmp
import json
import os
import pathlib  # noqa: F401
import shutil
import tempfile
from copy import deepcopy
from difflib import SequenceMatcher
from pathlib import Path
from unittest.mock import MagicMock, patch

import numpy as np
import pandas as pd
import PIL
import pytest
import vega_datasets
from gradio_client import media_data
from gradio_client import utils as client_utils
from scipy.io import wavfile

import gradio as gr
from gradio import processing_utils, utils

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class TestComponent:
    def test_component_functions(self):
        """
        component
        """
        assert isinstance(gr.components.component("textarea"), gr.templates.TextArea)


def test_raise_warnings():
    for c_type, component in zip(
        ["inputs", "outputs"], [gr.inputs.Textbox, gr.outputs.Label]
    ):
        with pytest.warns(UserWarning, match=f"Usage of gradio.{c_type}"):
            component()


class TestTextbox:
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, tokenize, get_config
        """
        text_input = gr.Textbox()
        assert text_input.preprocess("Hello World!") == "Hello World!"
        assert text_input.postprocess("Hello World!") == "Hello World!"
        assert text_input.postprocess(None) is None
        assert text_input.postprocess("Ali") == "Ali"
        assert text_input.postprocess(2) == "2"
        assert text_input.postprocess(2.14) == "2.14"
        assert text_input.serialize("Hello World!", True) == "Hello World!"

        assert text_input.tokenize("Hello World! Gradio speaking.") == (
            ["Hello", "World!", "Gradio", "speaking."],
            [
                "World! Gradio speaking.",
                "Hello Gradio speaking.",
                "Hello World! speaking.",
                "Hello World! Gradio",
            ],
            None,
        )
        text_input.interpretation_replacement = "unknown"
        assert text_input.tokenize("Hello World! Gradio speaking.") == (
            ["Hello", "World!", "Gradio", "speaking."],
            [
                "unknown World! Gradio speaking.",
                "Hello unknown Gradio speaking.",
                "Hello World! unknown speaking.",
                "Hello World! Gradio unknown",
            ],
            None,
        )
        assert text_input.get_config() == {
            "lines": 1,
            "max_lines": 20,
            "placeholder": None,
            "value": "",
            "name": "textbox",
            "show_label": True,
            "type": "text",
            "label": None,
            "style": {},
            "elem_id": None,
            "elem_classes": None,
            "visible": True,
            "interactive": None,
            "root_url": None,
        }

    @pytest.mark.asyncio
    async def test_in_interface_as_input(self):
        """
        Interface, process, interpret,
        """
        iface = gr.Interface(lambda x: x[::-1], "textbox", "textbox")
        assert iface("Hello") == "olleH"
        iface = gr.Interface(
            lambda sentence: max([len(word) for word in sentence.split()]),
            gr.Textbox(),
            "number",
            interpretation="default",
        )
        scores = await iface.interpret(
            ["Return the length of the longest word in this sentence"]
        )
        assert scores[0]["interpretation"] == [
            ("Return", 0.0),
            (" ", 0),
            ("the", 0.0),
            (" ", 0),
            ("length", 0.0),
            (" ", 0),
            ("of", 0.0),
            (" ", 0),
            ("the", 0.0),
            (" ", 0),
            ("longest", 0.0),
            (" ", 0),
            ("word", 0.0),
            (" ", 0),
            ("in", 0.0),
            (" ", 0),
            ("this", 0.0),
            (" ", 0),
            ("sentence", 1.0),
            (" ", 0),
        ]

    def test_in_interface_as_output(self):
        """
        Interface, process

        """
        iface = gr.Interface(lambda x: x[-1], "textbox", gr.Textbox())
        assert iface("Hello") == "o"
        iface = gr.Interface(lambda x: x / 2, "number", gr.Textbox())
        assert iface(10) == "5.0"

    def test_static(self):
        """
        postprocess
        """
        component = gr.Textbox("abc")
        assert component.get_config().get("value") == "abc"

    def test_override_template(self):
        """
        override template
        """
        component = gr.TextArea(value="abc")
        assert component.get_config().get("value") == "abc"
        assert component.get_config().get("lines") == 7
        component = gr.TextArea(value="abc", lines=4)
        assert component.get_config().get("value") == "abc"
        assert component.get_config().get("lines") == 4

    def test_faulty_type(self):
        with pytest.raises(
            ValueError, match='`type` must be one of "text", "password", or "email".'
        ):
            gr.Textbox(type="boo")

    def test_max_lines(self):
        assert gr.Textbox(type="password").get_config().get("max_lines") == 1
        assert gr.Textbox(type="email").get_config().get("max_lines") == 1
        assert gr.Textbox(type="text").get_config().get("max_lines") == 20
        assert gr.Textbox().get_config().get("max_lines") == 20


class TestNumber:
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, set_interpret_parameters, get_interpretation_neighbors, get_config

        """
        numeric_input = gr.Number(elem_id="num", elem_classes="first")
        assert numeric_input.preprocess(3) == 3.0
        assert numeric_input.preprocess(None) is None
        assert numeric_input.postprocess(3) == 3
        assert numeric_input.postprocess(3) == 3.0
        assert numeric_input.postprocess(2.14) == 2.14
        assert numeric_input.postprocess(None) is None
        assert numeric_input.serialize(3, True) == 3
        numeric_input.set_interpret_parameters(steps=3, delta=1, delta_type="absolute")
        assert numeric_input.get_interpretation_neighbors(1) == (
            [-2.0, -1.0, 0.0, 2.0, 3.0, 4.0],
            {},
        )
        numeric_input.set_interpret_parameters(steps=3, delta=1, delta_type="percent")
        assert numeric_input.get_interpretation_neighbors(1) == (
            [0.97, 0.98, 0.99, 1.01, 1.02, 1.03],
            {},
        )
        assert numeric_input.get_config() == {
            "value": None,
            "name": "number",
            "show_label": True,
            "label": None,
            "style": {},
            "elem_id": "num",
            "elem_classes": ["first"],
            "visible": True,
            "interactive": None,
            "root_url": None,
        }

    def test_component_functions_integer(self):
        """
        Preprocess, postprocess, serialize, set_interpret_parameters, get_interpretation_neighbors, get_template_context

        """
        numeric_input = gr.Number(precision=0, value=42)
        assert numeric_input.preprocess(3) == 3
        assert numeric_input.preprocess(None) is None
        assert numeric_input.postprocess(3) == 3
        assert numeric_input.postprocess(3) == 3
        assert numeric_input.postprocess(2.85) == 3
        assert numeric_input.postprocess(None) is None
        assert numeric_input.serialize(3, True) == 3
        numeric_input.set_interpret_parameters(steps=3, delta=1, delta_type="absolute")
        assert numeric_input.get_interpretation_neighbors(1) == (
            [-2.0, -1.0, 0.0, 2.0, 3.0, 4.0],
            {},
        )
        numeric_input.set_interpret_parameters(steps=3, delta=1, delta_type="percent")
        assert numeric_input.get_interpretation_neighbors(100) == (
            [97.0, 98.0, 99.0, 101.0, 102.0, 103.0],
            {},
        )
        with pytest.raises(ValueError) as error:
            numeric_input.get_interpretation_neighbors(1)
            assert error.msg == "Cannot generate valid set of neighbors"
        numeric_input.set_interpret_parameters(
            steps=3, delta=1.24, delta_type="absolute"
        )
        with pytest.raises(ValueError) as error:
            numeric_input.get_interpretation_neighbors(4)
            assert error.msg == "Cannot generate valid set of neighbors"
        assert numeric_input.get_config() == {
            "value": 42,
            "name": "number",
            "show_label": True,
            "label": None,
            "style": {},
            "elem_id": None,
            "elem_classes": None,
            "visible": True,
            "interactive": None,
            "root_url": None,
        }

    def test_component_functions_precision(self):
        """
        Preprocess, postprocess, serialize, set_interpret_parameters, get_interpretation_neighbors, get_template_context

        """
        numeric_input = gr.Number(precision=2, value=42.3428)
        assert numeric_input.preprocess(3.231241) == 3.23
        assert numeric_input.preprocess(None) is None
        assert numeric_input.postprocess(-42.1241) == -42.12
        assert numeric_input.postprocess(5.6784) == 5.68
        assert numeric_input.postprocess(2.1421) == 2.14
        assert numeric_input.postprocess(None) is None

    @pytest.mark.asyncio
    async def test_in_interface_as_input(self):
        """
        Interface, process, interpret
        """
        iface = gr.Interface(lambda x: x**2, "number", "textbox")
        assert iface(2) == "4.0"
        iface = gr.Interface(
            lambda x: x**2, "number", "number", interpretation="default"
        )
        scores = (await iface.interpret([2]))[0]["interpretation"]
        assert scores == [
            (1.94, -0.23640000000000017),
            (1.96, -0.15840000000000032),
            (1.98, -0.07960000000000012),
            (2, None),
            (2.02, 0.08040000000000003),
            (2.04, 0.16159999999999997),
            (2.06, 0.24359999999999982),
        ]

    @pytest.mark.asyncio
    async def test_precision_0_in_interface(self):
        """
        Interface, process, interpret
        """
        iface = gr.Interface(lambda x: x**2, gr.Number(precision=0), "textbox")
        assert iface(2) == "4"
        iface = gr.Interface(
            lambda x: x**2, "number", gr.Number(precision=0), interpretation="default"
        )
        # Output gets rounded to 4 for all input so no change
        scores = (await iface.interpret([2]))[0]["interpretation"]
        assert scores == [
            (1.94, 0.0),
            (1.96, 0.0),
            (1.98, 0.0),
            (2, None),
            (2.02, 0.0),
            (2.04, 0.0),
            (2.06, 0.0),
        ]

    @pytest.mark.asyncio
    async def test_in_interface_as_output(self):
        """
        Interface, process, interpret
        """
        iface = gr.Interface(lambda x: int(x) ** 2, "textbox", "number")
        assert iface(2) == 4.0
        iface = gr.Interface(
            lambda x: x**2, "number", "number", interpretation="default"
        )
        scores = (await iface.interpret([2]))[0]["interpretation"]
        assert scores == [
            (1.94, -0.23640000000000017),
            (1.96, -0.15840000000000032),
            (1.98, -0.07960000000000012),
            (2, None),
            (2.02, 0.08040000000000003),
            (2.04, 0.16159999999999997),
            (2.06, 0.24359999999999982),
        ]

    def test_static(self):
        """
        postprocess
        """
        component = gr.Number()
        assert component.get_config().get("value") is None
        component = gr.Number(3)
        assert component.get_config().get("value") == 3.0


class TestSlider:
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, get_config
        """
        slider_input = gr.Slider()
        assert slider_input.preprocess(3.0) == 3.0
        assert slider_input.postprocess(3) == 3
        assert slider_input.postprocess(3) == 3
        assert slider_input.postprocess(None) == 0
        assert slider_input.serialize(3, True) == 3

        slider_input = gr.Slider(10, 20, value=15, step=1, label="Slide Your Input")
        assert slider_input.get_config() == {
            "minimum": 10,
            "maximum": 20,
            "step": 1,
            "value": 15,
            "name": "slider",
            "show_label": True,
            "label": "Slide Your Input",
            "style": {},
            "elem_id": None,
            "elem_classes": None,
            "visible": True,
            "interactive": None,
            "root_url": None,
        }

    @pytest.mark.asyncio
    async def test_in_interface(self):
        """ "
        Interface, process, interpret
        """
        iface = gr.Interface(lambda x: x**2, "slider", "textbox")
        assert iface(2) == "4"
        iface = gr.Interface(
            lambda x: x**2, "slider", "number", interpretation="default"
        )
        scores = (await iface.interpret([2]))[0]["interpretation"]
        assert scores == [
            -4.0,
            200.08163265306123,
            812.3265306122449,
            1832.7346938775513,
            3261.3061224489797,
            5098.040816326531,
            7342.938775510205,
            9996.0,
        ]

    def test_static(self):
        """
        postprocess
        """
        component = gr.Slider(0, 100, 5)
        assert component.get_config().get("value") == 5
        component = gr.Slider(0, 100, None)
        assert component.get_config().get("value") == 0

    @patch("gradio.Slider.get_random_value", return_value=7)
    def test_slider_get_random_value_on_load(self, mock_get_random_value):
        slider = gr.Slider(minimum=-5, maximum=10, randomize=True)
        assert slider.value == 7
        assert slider.load_event_to_attach[0]() == 7
        assert slider.load_event_to_attach[1] is None

    @patch("random.randint", return_value=3)
    def test_slider_rounds_when_using_default_randomizer(self, mock_randint):
        slider = gr.Slider(minimum=0, maximum=1, randomize=True, step=0.1)
        # If get_random_value didn't round, this test would fail
        # because 0.30000000000000004 != 0.3
        assert slider.get_random_value() == 0.3
        mock_randint.assert_called()


class TestCheckbox:
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, get_config
        """
        bool_input = gr.Checkbox()
        assert bool_input.preprocess(True)
        assert bool_input.postprocess(True)
        assert bool_input.postprocess(True)
        assert bool_input.serialize(True, True)
        bool_input = gr.Checkbox(value=True, label="Check Your Input")
        assert bool_input.get_config() == {
            "value": True,
            "name": "checkbox",
            "show_label": True,
            "label": "Check Your Input",
            "style": {},
            "elem_id": None,
            "elem_classes": None,
            "visible": True,
            "interactive": None,
            "root_url": None,
        }

    @pytest.mark.asyncio
    async def test_in_interface(self):
        """
        Interface, process, interpret
        """
        iface = gr.Interface(lambda x: 1 if x else 0, "checkbox", "number")
        assert iface(True) == 1
        iface = gr.Interface(
            lambda x: 1 if x else 0, "checkbox", "number", interpretation="default"
        )
        scores = (await iface.interpret([False]))[0]["interpretation"]
        assert scores == (None, 1.0)
        scores = (await iface.interpret([True]))[0]["interpretation"]
        assert scores == (-1.0, None)


class TestCheckboxGroup:
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, get_config
        """
        checkboxes_input = gr.CheckboxGroup(["a", "b", "c"])
        assert checkboxes_input.preprocess(["a", "c"]) == ["a", "c"]
        assert checkboxes_input.postprocess(["a", "c"]) == ["a", "c"]
        assert checkboxes_input.serialize(["a", "c"], True) == ["a", "c"]
        checkboxes_input = gr.CheckboxGroup(
            value=["a", "c"],
            choices=["a", "b", "c"],
            label="Check Your Inputs",
        )
        assert checkboxes_input.get_config() == {
            "choices": ["a", "b", "c"],
            "value": ["a", "c"],
            "name": "checkboxgroup",
            "show_label": True,
            "label": "Check Your Inputs",
            "style": {},
            "elem_id": None,
            "elem_classes": None,
            "visible": True,
            "interactive": None,
            "root_url": None,
        }
        with pytest.raises(ValueError):
            gr.CheckboxGroup(["a"], type="unknown")

        cbox = gr.CheckboxGroup(choices=["a", "b"], value="c")
        assert cbox.get_config()["value"] == ["c"]
        assert cbox.postprocess("a") == ["a"]

    def test_in_interface(self):
        """
        Interface, process
        """
        checkboxes_input = gr.CheckboxGroup(["a", "b", "c"])
        iface = gr.Interface(lambda x: "|".join(x), checkboxes_input, "textbox")
        assert iface(["a", "c"]) == "a|c"
        assert iface([]) == ""
        _ = gr.CheckboxGroup(["a", "b", "c"], type="index")


class TestRadio:
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, get_config

        """
        radio_input = gr.Radio(["a", "b", "c"])
        assert radio_input.preprocess("c") == "c"
        assert radio_input.postprocess("a") == "a"
        assert radio_input.serialize("a", True) == "a"
        radio_input = gr.Radio(
            choices=["a", "b", "c"], default="a", label="Pick Your One Input"
        )
        assert radio_input.get_config() == {
            "choices": ["a", "b", "c"],
            "value": None,
            "name": "radio",
            "show_label": True,
            "label": "Pick Your One Input",
            "style": {},
            "elem_id": None,
            "elem_classes": None,
            "visible": True,
            "interactive": None,
            "root_url": None,
        }
        with pytest.raises(ValueError):
            gr.Radio(["a", "b"], type="unknown")

    @pytest.mark.asyncio
    async def test_in_interface(self):
        """
        Interface, process, interpret
        """
        radio_input = gr.Radio(["a", "b", "c"])
        iface = gr.Interface(lambda x: 2 * x, radio_input, "textbox")
        assert iface("c") == "cc"
        radio_input = gr.Radio(["a", "b", "c"], type="index")
        iface = gr.Interface(
            lambda x: 2 * x, radio_input, "number", interpretation="default"
        )
        assert iface("c") == 4
        scores = (await iface.interpret(["b"]))[0]["interpretation"]
        assert scores == [-2.0, None, 2.0]


class TestDropdown:
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, get_config
        """
        dropdown_input = gr.Dropdown(["a", "b", "c"], multiselect=True)
        assert dropdown_input.preprocess("a") == "a"
        assert dropdown_input.postprocess("a") == "a"

        dropdown_input_multiselect = gr.Dropdown(["a", "b", "c"])
        assert dropdown_input_multiselect.preprocess(["a", "c"]) == ["a", "c"]
        assert dropdown_input_multiselect.postprocess(["a", "c"]) == ["a", "c"]
        assert dropdown_input_multiselect.serialize(["a", "c"], True) == ["a", "c"]
        dropdown_input_multiselect = gr.Dropdown(
            value=["a", "c"],
            choices=["a", "b", "c"],
            label="Select Your Inputs",
            multiselect=True,
            max_choices=2,
        )
        assert dropdown_input_multiselect.get_config() == {
            "allow_custom_value": False,
            "choices": ["a", "b", "c"],
            "value": ["a", "c"],
            "name": "dropdown",
            "show_label": True,
            "label": "Select Your Inputs",
            "style": {},
            "elem_id": None,
            "elem_classes": None,
            "visible": True,
            "interactive": None,
            "root_url": None,
            "multiselect": True,
            "max_choices": 2,
        }
        with pytest.raises(ValueError):
            gr.Dropdown(["a"], type="unknown")

        dropdown = gr.Dropdown(choices=["a", "b"], value="c")
        assert dropdown.get_config()["value"] == "c"
        assert dropdown.postprocess("a") == "a"

    def test_in_interface(self):
        """
        Interface, process
        """
        checkboxes_input = gr.CheckboxGroup(["a", "b", "c"])
        iface = gr.Interface(lambda x: "|".join(x), checkboxes_input, "textbox")
        assert iface(["a", "c"]) == "a|c"
        assert iface([]) == ""
        _ = gr.CheckboxGroup(["a", "b", "c"], type="index")


class TestImage:
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, get_config, _segment_by_slic
        type: pil, file, filepath, numpy
        """
        img = deepcopy(media_data.BASE64_IMAGE)
        image_input = gr.Image()
        assert image_input.preprocess(img).shape == (68, 61, 3)
        image_input = gr.Image(shape=(25, 25), image_mode="L")
        assert image_input.preprocess(img).shape == (25, 25)
        image_input = gr.Image(shape=(30, 10), type="pil")
        assert image_input.preprocess(img).size == (30, 10)
        assert image_input.postprocess("test/test_files/bus.png") == img
        assert image_input.serialize("test/test_files/bus.png") == img
        image_input = gr.Image(type="filepath")
        image_temp_filepath = image_input.preprocess(img)
        assert image_temp_filepath in image_input.temp_files

        image_input = gr.Image(
            source="upload", tool="editor", type="pil", label="Upload Your Image"
        )
        assert image_input.get_config() == {
            "brush_radius": None,
            "image_mode": "RGB",
            "shape": None,
            "source": "upload",
            "tool": "editor",
            "name": "image",
            "streaming": False,
            "show_label": True,
            "label": "Upload Your Image",
            "style": {},
            "elem_id": None,
            "elem_classes": None,
            "visible": True,
            "value": None,
            "interactive": None,
            "root_url": None,
            "mirror_webcam": True,
            "selectable": False,
        }
        assert image_input.preprocess(None) is None
        image_input = gr.Image(invert_colors=True)
        assert image_input.preprocess(img) is not None
        image_input.preprocess(img)
        file_image = gr.Image(type="filepath")
        assert isinstance(file_image.preprocess(img), str)
        with pytest.raises(ValueError):
            gr.Image(type="unknown")
        image_input.shape = (30, 10)
        assert image_input._segment_by_slic(img) is not None

        # Output functionalities
        y_img = gr.processing_utils.decode_base64_to_image(
            deepcopy(media_data.BASE64_IMAGE)
        )
        image_output = gr.Image()
        assert image_output.postprocess(y_img).startswith(
            "data:image/png;base64,iVBORw0KGgoAAA"
        )
        assert image_output.postprocess(np.array(y_img)).startswith(
            "data:image/png;base64,iVBORw0KGgoAAA"
        )
        with pytest.raises(ValueError):
            image_output.postprocess([1, 2, 3])
        image_output = gr.Image(type="numpy")
        assert image_output.postprocess(y_img).startswith("data:image/png;base64,")

    @pytest.mark.flaky
    def test_serialize_url(self):
        img = "https://gradio.app/assets/img/header-image.jpg"
        expected = client_utils.encode_url_or_file_to_base64(img)
        assert gr.Image().serialize(img) == expected

    def test_in_interface_as_input(self):
        """
        Interface, process, interpret
        type: file
        interpretation: default, shap,
        """
        img = "test/test_files/bus.png"
        image_input = gr.Image()
        iface = gr.Interface(
            lambda x: PIL.Image.open(x).rotate(90, expand=True),
            gr.Image(shape=(30, 10), type="filepath"),
            "image",
        )
        output = iface(img)
        assert PIL.Image.open(output).size == (10, 30)
        iface = gr.Interface(
            lambda x: np.sum(x), image_input, "number", interpretation="default"
        )

    def test_in_interface_as_output(self):
        """
        Interface, process
        """

        def generate_noise(width, height):
            return np.random.randint(0, 256, (width, height, 3))

        iface = gr.Interface(generate_noise, ["slider", "slider"], "image")
        assert iface(10, 20).endswith(".png")

    def test_static(self):
        """
        postprocess
        """
        component = gr.Image("test/test_files/bus.png")
        assert component.get_config().get("value") == media_data.BASE64_IMAGE
        component = gr.Image(None)
        assert component.get_config().get("value") is None


class TestPlot:
    @pytest.mark.asyncio
    async def test_in_interface_as_output(self):
        """
        Interface, process
        """

        def plot(num):
            import matplotlib.pyplot as plt

            fig = plt.figure()
            plt.plot(range(num), range(num))
            return fig

        iface = gr.Interface(plot, "slider", "plot")
        with utils.MatplotlibBackendMananger():
            output = await iface.process_api(fn_index=0, inputs=[10], state={})
        assert output["data"][0]["type"] == "matplotlib"
        assert output["data"][0]["plot"].startswith("data:image/png;base64")

    def test_static(self):
        """
        postprocess
        """
        with utils.MatplotlibBackendMananger():
            import matplotlib.pyplot as plt

            fig = plt.figure()
            plt.plot([1, 2, 3], [1, 2, 3])

        component = gr.Plot(fig)
        assert component.get_config().get("value") is not None
        component = gr.Plot(None)
        assert component.get_config().get("value") is None

    def test_postprocess_altair(self):
        import altair as alt
        from vega_datasets import data

        cars = data.cars()
        chart = (
            alt.Chart(cars)
            .mark_point()
            .encode(
                x="Horsepower",
                y="Miles_per_Gallon",
                color="Origin",
            )
        )
        out = gr.Plot().postprocess(chart)
        assert isinstance(out["plot"], str)
        assert out["plot"] == chart.to_json()


class TestAudio:
    def test_component_functions(self):
        """
        Preprocess, postprocess serialize, get_config, deserialize
        type: filepath, numpy, file
        """
        x_wav = deepcopy(media_data.BASE64_AUDIO)
        audio_input = gr.Audio()
        output1 = audio_input.preprocess(x_wav)
        assert output1[0] == 8000
        assert output1[1].shape == (8046,)

        x_wav["is_file"] = True
        audio_input = gr.Audio(type="filepath")
        output1 = audio_input.preprocess(x_wav)
        assert Path(output1).name == "audio_sample-0-100.wav"

        assert filecmp.cmp(
            "test/test_files/audio_sample.wav",
            audio_input.serialize("test/test_files/audio_sample.wav")["name"],
        )

        audio_input = gr.Audio(label="Upload Your Audio")
        assert audio_input.get_config() == {
            "source": "upload",
            "name": "audio",
            "streaming": False,
            "show_label": True,
            "label": "Upload Your Audio",
            "style": {},
            "elem_id": None,
            "elem_classes": None,
            "visible": True,
            "value": None,
            "interactive": None,
            "root_url": None,
        }
        assert audio_input.preprocess(None) is None
        x_wav["is_example"] = True
        x_wav["crop_min"], x_wav["crop_max"] = 1, 4
        output2 = audio_input.preprocess(x_wav)
        assert output2 is not None
        assert output1 != output2

        audio_input = gr.Audio(type="filepath")
        assert isinstance(audio_input.preprocess(x_wav), str)
        with pytest.raises(ValueError):
            gr.Audio(type="unknown")

        # Output functionalities
        y_audio = client_utils.decode_base64_to_file(
            deepcopy(media_data.BASE64_AUDIO)["data"]
        )
        audio_output = gr.Audio(type="filepath")
        assert filecmp.cmp(y_audio.name, audio_output.postprocess(y_audio.name)["name"])
        assert audio_output.get_config() == {
            "name": "audio",
            "streaming": False,
            "show_label": True,
            "label": None,
            "source": "upload",
            "style": {},
            "elem_id": None,
            "elem_classes": None,
            "visible": True,
            "value": None,
            "interactive": None,
            "root_url": None,
        }
        assert audio_output.deserialize(
            {
                "name": None,
                "data": deepcopy(media_data.BASE64_AUDIO)["data"],
                "is_file": False,
            }
        ).endswith(".wav")

        output1 = audio_output.postprocess(y_audio.name)
        output2 = audio_output.postprocess(y_audio.name)
        assert output1 == output2

    def test_serialize(self):
        audio_input = gr.Audio()
        serialized_input = audio_input.serialize("test/test_files/audio_sample.wav")
        assert serialized_input["data"] == media_data.BASE64_AUDIO["data"]
        assert os.path.basename(serialized_input["name"]) == "audio_sample.wav"
        assert serialized_input["orig_name"] == "audio_sample.wav"
        assert not serialized_input["is_file"]

    def test_tokenize(self):
        """
        Tokenize, get_masked_inputs
        """
        x_wav = deepcopy(media_data.BASE64_AUDIO)
        audio_input = gr.Audio()
        tokens, _, _ = audio_input.tokenize(x_wav)
        assert len(tokens) == audio_input.interpretation_segments
        x_new = audio_input.get_masked_inputs(tokens, [[1] * len(tokens)])[0]
        similarity = SequenceMatcher(a=x_wav["data"], b=x_new).ratio()
        assert similarity > 0.9

    def test_in_interface(self):
        def reverse_audio(audio):
            sr, data = audio
            return (sr, np.flipud(data))

        iface = gr.Interface(reverse_audio, "audio", "audio")
        reversed_file = iface("test/test_files/audio_sample.wav")
        reversed_reversed_file = iface(reversed_file)
        reversed_reversed_data = client_utils.encode_url_or_file_to_base64(
            reversed_reversed_file
        )
        similarity = SequenceMatcher(
            a=reversed_reversed_data, b=media_data.BASE64_AUDIO["data"]
        ).ratio()
        assert similarity > 0.99

    def test_in_interface_as_output(self):
        """
        Interface, process
        """

        def generate_noise(duration):
            return 48000, np.random.randint(-256, 256, (duration, 3)).astype(np.int16)

        iface = gr.Interface(generate_noise, "slider", "audio")
        assert iface(100).endswith(".wav")

    def test_audio_preprocess_can_be_read_by_scipy(self):
        x_wav = deepcopy(media_data.BASE64_MICROPHONE)
        audio_input = gr.Audio(type="filepath")
        output = audio_input.preprocess(x_wav)
        wavfile.read(output)


class TestFile:
    def test_component_functions(self):
        """
        Preprocess, serialize, get_config, value
        """
        x_file = deepcopy(media_data.BASE64_FILE)
        file_input = gr.File()
        output = file_input.preprocess(x_file)
        assert isinstance(output, tempfile._TemporaryFileWrapper)
        serialized = file_input.serialize("test/test_files/sample_file.pdf")
        assert filecmp.cmp(
            serialized["name"],
            "test/test_files/sample_file.pdf",
        )
        assert serialized["orig_name"] == "sample_file.pdf"
        assert output.orig_name == "test/test_files/sample_file.pdf"

        x_file["is_file"] = True
        input1 = file_input.preprocess(x_file)
        input2 = file_input.preprocess(x_file)
        assert input1.name == input2.name
        assert Path(input1.name).name == "sample_file.pdf"

        file_input = gr.File(label="Upload Your File")
        assert file_input.get_config() == {
            "file_count": "single",
            "file_types": None,
            "name": "file",
            "show_label": True,
            "label": "Upload Your File",
            "style": {},
            "elem_id": None,
            "elem_classes": None,
            "visible": True,
            "value": None,
            "interactive": None,
            "root_url": None,
            "selectable": False,
        }
        assert file_input.preprocess(None) is None
        x_file["is_example"] = True
        assert file_input.preprocess(x_file) is not None

        zero_size_file = {"name": "document.txt", "size": 0, "data": "data:"}
        temp_file = file_input.preprocess(zero_size_file)
        assert os.stat(temp_file.name).st_size == 0

        file_input = gr.File(type="binary")
        output = file_input.preprocess(x_file)
        assert type(output) == bytes

        output1 = file_input.postprocess("test/test_files/sample_file.pdf")
        output2 = file_input.postprocess("test/test_files/sample_file.pdf")
        assert output1 == output2

    def test_file_type_must_be_list(self):
        with pytest.raises(
            ValueError, match="Parameter file_types must be a list. Received str"
        ):
            gr.File(file_types=".json")

    def test_in_interface_as_input(self):
        """
        Interface, process
        """
        x_file = media_data.BASE64_FILE["name"]

        def get_size_of_file(file_obj):
            return os.path.getsize(file_obj.name)

        iface = gr.Interface(get_size_of_file, "file", "number")
        assert iface(x_file) == 10558

    def test_as_component_as_output(self):
        """
        Interface, process
        """

        def write_file(content):
            with open("test.txt", "w") as f:
                f.write(content)
            return "test.txt"

        iface = gr.Interface(write_file, "text", "file")
        assert iface("hello world").endswith(".txt")


class TestUploadButton:
    def test_component_functions(self):
        """
        preprocess
        """
        x_file = deepcopy(media_data.BASE64_FILE)
        upload_input = gr.UploadButton()
        input = upload_input.preprocess(x_file)
        assert isinstance(input, tempfile._TemporaryFileWrapper)

        x_file["is_file"] = True
        input1 = upload_input.preprocess(x_file)
        input2 = upload_input.preprocess(x_file)
        assert input1.name == input2.name

    def test_raises_if_file_types_is_not_list(self):
        with pytest.raises(
            ValueError, match="Parameter file_types must be a list. Received int"
        ):
            gr.UploadButton(file_types=2)


class TestDataframe:
    def test_component_functions(self):
        """
        Preprocess, serialize, get_config
        """
        x_data = {
            "data": [["Tim", 12, False], ["Jan", 24, True]],
            "headers": ["Name", "Age", "Member"],
        }
        dataframe_input = gr.Dataframe(headers=["Name", "Age", "Member"])
        output = dataframe_input.preprocess(x_data)
        assert output["Age"][1] == 24
        assert not output["Member"][0]
        assert dataframe_input.postprocess(x_data) == x_data

        dataframe_input = gr.Dataframe(
            headers=["Name", "Age", "Member"], label="Dataframe Input"
        )
        assert dataframe_input.get_config() == {
            "headers": ["Name", "Age", "Member"],
            "datatype": ["str", "str", "str"],
            "row_count": (1, "dynamic"),
            "col_count": (3, "dynamic"),
            "value": {
                "data": [
                    ["", "", ""],
                ],
                "headers": ["Name", "Age", "Member"],
            },
            "name": "dataframe",
            "show_label": True,
            "label": "Dataframe Input",
            "max_rows": 20,
            "max_cols": None,
            "overflow_row_behaviour": "paginate",
            "style": {},
            "elem_id": None,
            "elem_classes": None,
            "visible": True,
            "interactive": None,
            "root_url": None,
            "wrap": False,
        }
        dataframe_input = gr.Dataframe()
        output = dataframe_input.preprocess(x_data)
        assert output["Age"][1] == 24
        with pytest.raises(ValueError):
            gr.Dataframe(type="unknown")

        dataframe_output = gr.Dataframe()
        assert dataframe_output.get_config() == {
            "headers": [1, 2, 3],
            "max_rows": 20,
            "max_cols": None,
            "overflow_row_behaviour": "paginate",
            "name": "dataframe",
            "show_label": True,
            "label": None,
            "style": {},
            "elem_id": None,
            "elem_classes": None,
            "visible": True,
            "datatype": ["str", "str", "str"],
            "row_count": (1, "dynamic"),
            "col_count": (3, "dynamic"),
            "value": {
                "data": [
                    ["", "", ""],
                ],
                "headers": [1, 2, 3],
            },
            "interactive": None,
            "root_url": None,
            "wrap": False,
        }

    def test_postprocess(self):
        """
        postprocess
        """
        dataframe_output = gr.Dataframe()
        output = dataframe_output.postprocess([])
        assert output == {"data": [[]], "headers": []}
        output = dataframe_output.postprocess(np.zeros((2, 2)))
        assert output == {"data": [[0, 0], [0, 0]], "headers": [1, 2]}
        output = dataframe_output.postprocess([[1, 3, 5]])
        assert output == {"data": [[1, 3, 5]], "headers": [1, 2, 3]}
        output = dataframe_output.postprocess(
            pd.DataFrame([[2, True], [3, True], [4, False]], columns=["num", "prime"])
        )
        assert output == {
            "headers": ["num", "prime"],
            "data": [[2, True], [3, True], [4, False]],
        }
        with pytest.raises(ValueError):
            gr.Dataframe(type="unknown")

        # When the headers don't match the data
        dataframe_output = gr.Dataframe(headers=["one", "two", "three"])
        output = dataframe_output.postprocess([[2, True], [3, True]])
        assert output == {
            "headers": ["one", "two"],
            "data": [[2, True], [3, True]],
        }
        dataframe_output = gr.Dataframe(headers=["one", "two", "three"])
        output = dataframe_output.postprocess([[2, True, "ab", 4], [3, True, "cd", 5]])
        assert output == {
            "headers": ["one", "two", "three", 4],
            "data": [[2, True, "ab", 4], [3, True, "cd", 5]],
        }

    def test_dataframe_postprocess_all_types(self):
        df = pd.DataFrame(
            {
                "date_1": pd.date_range("2021-01-01", periods=2),
                "date_2": pd.date_range("2022-02-15", periods=2).strftime(
                    "%B %d, %Y, %r"
                ),
                "number": np.array([0.2233, 0.57281]),
                "number_2": np.array([84, 23]).astype(np.int64),
                "bool": [True, False],
                "markdown": ["# Hello", "# Goodbye"],
            }
        )
        component = gr.Dataframe(
            datatype=["date", "date", "number", "number", "bool", "markdown"]
        )
        output = component.postprocess(df)
        assert output == {
            "headers": list(df.columns),
            "data": [
                [
                    pd.Timestamp("2021-01-01 00:00:00"),
                    "February 15, 2022, 12:00:00 AM",
                    0.2233,
                    84,
                    True,
                    "<h1>Hello</h1>\n",
                ],
                [
                    pd.Timestamp("2021-01-02 00:00:00"),
                    "February 16, 2022, 12:00:00 AM",
                    0.57281,
                    23,
                    False,
                    "<h1>Goodbye</h1>\n",
                ],
            ],
        }

    def test_dataframe_postprocess_only_dates(self):
        df = pd.DataFrame(
            {
                "date_1": pd.date_range("2021-01-01", periods=2),
                "date_2": pd.date_range("2022-02-15", periods=2),
            }
        )
        component = gr.Dataframe(datatype=["date", "date"])
        output = component.postprocess(df)
        assert output == {
            "headers": list(df.columns),
            "data": [
                [
                    pd.Timestamp("2021-01-01 00:00:00"),
                    pd.Timestamp("2022-02-15 00:00:00"),
                ],
                [
                    pd.Timestamp("2021-01-02 00:00:00"),
                    pd.Timestamp("2022-02-16 00:00:00"),
                ],
            ],
        }


class TestDataset:
    def test_preprocessing(self):
        test_file_dir = Path(__file__).parent / "test_files"
        bus = str(Path(test_file_dir, "bus.png").resolve())

        dataset = gr.Dataset(
            components=["number", "textbox", "image", "html", "markdown"],
            samples=[
                [5, "hello", bus, "<b>Bold</b>", "**Bold**"],
                [15, "hi", bus, "<i>Italics</i>", "*Italics*"],
            ],
        )

        assert dataset.preprocess(1) == [
            15,
            "hi",
            bus,
            "<i>Italics</i>",
            "<p><em>Italics</em></p>\n",
        ]

        dataset = gr.Dataset(
            components=["number", "textbox", "image", "html", "markdown"],
            samples=[
                [5, "hello", bus, "<b>Bold</b>", "**Bold**"],
                [15, "hi", bus, "<i>Italics</i>", "*Italics*"],
            ],
            type="index",
        )

        assert dataset.preprocess(1) == 1

    def test_postprocessing(self):
        test_file_dir = Path(Path(__file__).parent, "test_files")
        bus = Path(test_file_dir, "bus.png")

        dataset = gr.Dataset(
            components=["number", "textbox", "image", "html", "markdown"], type="index"
        )

        output = dataset.postprocess(
            samples=[
                [5, "hello", bus, "<b>Bold</b>", "**Bold**"],
                [15, "hi", bus, "<i>Italics</i>", "*Italics*"],
            ],
        )

        assert output == {
            "samples": [
                [5, "hello", bus, "<b>Bold</b>", "**Bold**"],
                [15, "hi", bus, "<i>Italics</i>", "*Italics*"],
            ],
            "__type__": "update",
        }


class TestVideo:
    def test_component_functions(self):
        """
        Preprocess, serialize, deserialize, get_config
        """
        x_video = deepcopy(media_data.BASE64_VIDEO)
        video_input = gr.Video()
        output1 = video_input.preprocess(x_video)
        assert isinstance(output1, str)
        output2 = video_input.preprocess(x_video)
        assert output1 == output2

        video_input = gr.Video(label="Upload Your Video")
        assert video_input.get_config() == {
            "source": "upload",
            "name": "video",
            "show_label": True,
            "label": "Upload Your Video",
            "style": {},
            "elem_id": None,
            "elem_classes": None,
            "visible": True,
            "value": None,
            "interactive": None,
            "root_url": None,
            "mirror_webcam": True,
            "include_audio": True,
        }
        assert video_input.preprocess(None) is None
        x_video["is_example"] = True
        assert video_input.preprocess(x_video) is not None
        video_input = gr.Video(format="avi")
        output_video = video_input.preprocess(x_video)
        assert output_video[-3:] == "avi"
        assert "flip" not in output_video

        assert filecmp.cmp(
            video_input.serialize(x_video["name"])[0]["name"], x_video["name"]
        )

        # Output functionalities
        y_vid_path = "test/test_files/video_sample.mp4"
        subtitles_path = "test/test_files/s1.srt"
        video_output = gr.Video()
        output1 = video_output.postprocess(y_vid_path)[0]["name"]
        assert output1.endswith("mp4")
        output2 = video_output.postprocess(y_vid_path)[0]["name"]
        assert output1 == output2
        assert (
            video_output.postprocess(y_vid_path)[0]["orig_name"] == "video_sample.mp4"
        )
        output_with_subtitles = video_output.postprocess((y_vid_path, subtitles_path))
        assert output_with_subtitles[1]["data"].startswith("data")

        assert video_output.deserialize(
            (
                {
                    "name": None,
                    "data": deepcopy(media_data.BASE64_VIDEO)["data"],
                    "is_file": False,
                },
                None,
            )
        ).endswith(".mp4")

    def test_in_interface(self):
        """
        Interface, process
        """
        x_video = media_data.BASE64_VIDEO["name"]
        iface = gr.Interface(lambda x: x, "video", "playable_video")
        assert iface(x_video).endswith(".mp4")

    def test_with_waveform(self):
        """
        Interface, process
        """
        x_audio = media_data.BASE64_AUDIO["name"]
        iface = gr.Interface(lambda x: gr.make_waveform(x), "audio", "video")
        assert iface(x_audio).endswith(".mp4")

    def test_video_postprocess_converts_to_playable_format(self):
        test_file_dir = Path(Path(__file__).parent, "test_files")
        # This file has a playable container but not playable codec
        with tempfile.NamedTemporaryFile(
            suffix="bad_video.mp4", delete=False
        ) as tmp_not_playable_vid:
            bad_vid = str(test_file_dir / "bad_video_sample.mp4")
            assert not processing_utils.video_is_playable(bad_vid)
            shutil.copy(bad_vid, tmp_not_playable_vid.name)
            _ = gr.Video().postprocess(tmp_not_playable_vid.name)
            # The original video gets converted to .mp4 format
            full_path_to_output = Path(tmp_not_playable_vid.name).with_suffix(".mp4")
            assert processing_utils.video_is_playable(str(full_path_to_output))

        # This file has a playable codec but not a playable container
        with tempfile.NamedTemporaryFile(
            suffix="playable_but_bad_container.mkv", delete=False
        ) as tmp_not_playable_vid:
            bad_vid = str(test_file_dir / "playable_but_bad_container.mkv")
            assert not processing_utils.video_is_playable(bad_vid)
            shutil.copy(bad_vid, tmp_not_playable_vid.name)
            _ = gr.Video().postprocess(tmp_not_playable_vid.name)
            full_path_to_output = Path(tmp_not_playable_vid.name).with_suffix(".mp4")
            assert processing_utils.video_is_playable(str(full_path_to_output))

    @patch("pathlib.Path.exists", MagicMock(return_value=False))
    @patch("gradio.components.FFmpeg")
    def test_video_preprocessing_flips_video_for_webcam(self, mock_ffmpeg):
        # Ensures that the cached temp video file is not used so that ffmpeg is called for each test
        x_video = deepcopy(media_data.BASE64_VIDEO)
        video_input = gr.Video(source="webcam")
        _ = video_input.preprocess(x_video)

        # Dict mapping filename to FFmpeg options
        output_params = mock_ffmpeg.call_args_list[0][1]["outputs"]
        assert "hflip" in list(output_params.values())[0]
        assert "flip" in list(output_params.keys())[0]

        mock_ffmpeg.reset_mock()
        _ = gr.Video(
            source="webcam", mirror_webcam=False, include_audio=True
        ).preprocess(x_video)
        mock_ffmpeg.assert_not_called()

        mock_ffmpeg.reset_mock()
        _ = gr.Video(source="upload", format="mp4", include_audio=True).preprocess(
            x_video
        )
        mock_ffmpeg.assert_not_called()

        mock_ffmpeg.reset_mock()
        output_file = gr.Video(
            source="webcam", mirror_webcam=True, format="avi"
        ).preprocess(x_video)
        output_params = mock_ffmpeg.call_args_list[0][1]["outputs"]
        assert "hflip" in list(output_params.values())[0]
        assert "flip" in list(output_params.keys())[0]
        assert ".avi" in list(output_params.keys())[0]
        assert ".avi" in output_file

        mock_ffmpeg.reset_mock()
        output_file = gr.Video(
            source="webcam", mirror_webcam=False, format="avi", include_audio=False
        ).preprocess(x_video)
        output_params = mock_ffmpeg.call_args_list[0][1]["outputs"]
        assert list(output_params.values())[0] == ["-an"]
        assert "flip" not in list(output_params.keys())[0]
        assert ".avi" in list(output_params.keys())[0]
        assert ".avi" in output_file


class TestTimeseries:
    def test_component_functions(self):
        """
        Preprocess, postprocess,  get_config,
        """
        timeseries_input = gr.Timeseries(x="time", y=["retail", "food", "other"])
        x_timeseries = {
            "data": [[1] + [2] * len(timeseries_input.y)] * 4,
            "headers": [timeseries_input.x] + timeseries_input.y,
        }
        output = timeseries_input.preprocess(x_timeseries)
        assert isinstance(output, pd.core.frame.DataFrame)

        timeseries_input = gr.Timeseries(
            x="time", y="retail", label="Upload Your Timeseries"
        )
        assert timeseries_input.get_config() == {
            "x": "time",
            "y": ["retail"],
            "name": "timeseries",
            "show_label": True,
            "label": "Upload Your Timeseries",
            "colors": None,
            "style": {},
            "elem_id": None,
            "elem_classes": None,
            "visible": True,
            "value": None,
            "interactive": None,
            "root_url": None,
        }
        assert timeseries_input.preprocess(None) is None
        x_timeseries["range"] = (0, 1)
        assert timeseries_input.preprocess(x_timeseries) is not None

        # Output functionalities

        timeseries_output = gr.Timeseries(label="Disease")

        assert timeseries_output.get_config() == {
            "x": None,
            "y": None,
            "name": "timeseries",
            "show_label": True,
            "label": "Disease",
            "colors": None,
            "style": {},
            "elem_id": None,
            "elem_classes": None,
            "visible": True,
            "value": None,
            "interactive": None,
            "root_url": None,
        }
        data = {"Name": ["Tom", "nick", "krish", "jack"], "Age": [20, 21, 19, 18]}
        df = pd.DataFrame(data)
        assert timeseries_output.postprocess(df) == {
            "headers": ["Name", "Age"],
            "data": [["Tom", 20], ["nick", 21], ["krish", 19], ["jack", 18]],
        }

        timeseries_output = gr.Timeseries(y="Age", label="Disease")
        output = timeseries_output.postprocess(df)
        assert output == {
            "headers": ["Name", "Age"],
            "data": [["Tom", 20], ["nick", 21], ["krish", 19], ["jack", 18]],
        }


class TestNames:
    # This test ensures that `components.get_component_instance()` works correctly when instantiating from components
    def test_no_duplicate_uncased_names(self):
        subclasses = gr.components.Component.__subclasses__()
        unique_subclasses_uncased = {s.__name__.lower() for s in subclasses}
        assert len(subclasses) == len(unique_subclasses_uncased)


class TestLabel:
    def test_component_functions(self):
        """
        Process, postprocess, deserialize
        """
        y = "happy"
        label_output = gr.Label()
        label = label_output.postprocess(y)
        assert label == {"label": "happy"}
        assert json.load(open(label_output.deserialize(label))) == label

        y = {3: 0.7, 1: 0.2, 0: 0.1}
        label = label_output.postprocess(y)
        assert label == {
            "label": 3,
            "confidences": [
                {"label": 3, "confidence": 0.7},
                {"label": 1, "confidence": 0.2},
                {"label": 0, "confidence": 0.1},
            ],
        }
        label_output = gr.Label(num_top_classes=2)
        label = label_output.postprocess(y)

        assert label == {
            "label": 3,
            "confidences": [
                {"label": 3, "confidence": 0.7},
                {"label": 1, "confidence": 0.2},
            ],
        }
        with pytest.raises(ValueError):
            label_output.postprocess([1, 2, 3])

        test_file_dir = Path(Path(__file__).parent, "test_files")
        path = str(Path(test_file_dir, "test_label_json.json"))
        label_dict = label_output.postprocess(path)
        assert label_dict["label"] == "web site"

        assert label_output.get_config() == {
            "name": "label",
            "show_label": True,
            "num_top_classes": 2,
            "value": None,
            "label": None,
            "style": {},
            "elem_id": None,
            "elem_classes": None,
            "visible": True,
            "interactive": None,
            "root_url": None,
            "color": None,
            "selectable": False,
        }

    def test_color_argument(self):

        label = gr.Label(value=-10, color="red")
        assert label.get_config()["color"] == "red"
        update_1 = gr.Label.update(value="bad", color="brown")
        assert update_1["color"] == "brown"
        update_2 = gr.Label.update(value="bad", color="#ff9966")
        assert update_2["color"] == "#ff9966"

        update_3 = gr.Label.update(
            value={"bad": 0.9, "good": 0.09, "so-so": 0.01}, color="green"
        )
        assert update_3["color"] == "green"

        update_4 = gr.Label.update(value={"bad": 0.8, "good": 0.18, "so-so": 0.02})
        assert update_4["color"] is None

        update_5 = gr.Label.update(
            value={"bad": 0.8, "good": 0.18, "so-so": 0.02}, color=None
        )
        assert update_5["color"] == "transparent"

    def test_in_interface(self):
        """
        Interface, process
        """
        x_img = "test/test_files/bus.png"

        def rgb_distribution(img):
            rgb_dist = np.mean(img, axis=(0, 1))
            rgb_dist /= np.sum(rgb_dist)
            rgb_dist = np.round(rgb_dist, decimals=2)
            return {
                "red": rgb_dist[0],
                "green": rgb_dist[1],
                "blue": rgb_dist[2],
            }

        iface = gr.Interface(rgb_distribution, "image", "label")
        output_filepath = iface(x_img)
        with open(output_filepath) as fp:
            assert json.load(fp) == {
                "label": "red",
                "confidences": [
                    {"label": "red", "confidence": 0.44},
                    {"label": "green", "confidence": 0.28},
                    {"label": "blue", "confidence": 0.28},
                ],
            }


class TestHighlightedText:
    def test_postprocess(self):
        """
        postprocess
        """
        component = gr.HighlightedText()
        result = [
            ("", None),
            ("Wolfgang", "PER"),
            (" lives in ", None),
            ("Berlin", "LOC"),
            ("", None),
        ]
        result_ = component.postprocess(result)
        assert result == result_

        text = "Wolfgang lives in Berlin"
        entities = [
            {"entity": "PER", "start": 0, "end": 8},
            {"entity": "LOC", "start": 18, "end": 24},
        ]
        result_ = component.postprocess({"text": text, "entities": entities})
        assert result == result_

        # Test split entity is merged when combine adjacent is set
        text = "Wolfgang lives in Berlin"
        entities = [
            {"entity": "PER", "start": 0, "end": 4},
            {"entity": "PER", "start": 4, "end": 8},
            {"entity": "LOC", "start": 18, "end": 24},
        ]
        # After a merge empty entries are stripped except the leading one
        result_after_merge = [
            ("", None),
            ("Wolfgang", "PER"),
            (" lives in ", None),
            ("Berlin", "LOC"),
        ]
        result_ = component.postprocess({"text": text, "entities": entities})
        assert result != result_
        assert result_after_merge != result_

        component = gr.HighlightedText(combine_adjacent=True)
        result_ = component.postprocess({"text": text, "entities": entities})
        assert result_after_merge == result_

        component = gr.HighlightedText()

        text = "Wolfgang lives in Berlin"
        entities = [
            {"entity": "LOC", "start": 18, "end": 24},
            {"entity": "PER", "start": 0, "end": 8},
        ]
        result_ = component.postprocess({"text": text, "entities": entities})
        assert result == result_

        text = "I live there"
        entities = []
        result_ = component.postprocess({"text": text, "entities": entities})
        assert [(text, None)] == result_

        text = "Wolfgang"
        entities = [
            {"entity": "PER", "start": 0, "end": 8},
        ]
        result_ = component.postprocess({"text": text, "entities": entities})
        assert [("", None), (text, "PER"), ("", None)] == result_

    def test_component_functions(self):
        """
        get_config
        """
        ht_output = gr.HighlightedText(color_map={"pos": "green", "neg": "red"})
        assert ht_output.get_config() == {
            "color_map": {"pos": "green", "neg": "red"},
            "name": "highlightedtext",
            "show_label": True,
            "label": None,
            "show_legend": False,
            "style": {},
            "elem_id": None,
            "elem_classes": None,
            "visible": True,
            "value": None,
            "interactive": None,
            "root_url": None,
            "selectable": False,
        }

    def test_in_interface(self):
        """
        Interface, process
        """

        def highlight_vowels(sentence):
            phrases, cur_phrase = [], ""
            vowels, mode = "aeiou", None
            for letter in sentence:
                letter_mode = "vowel" if letter in vowels else "non"
                if mode is None:
                    mode = letter_mode
                elif mode != letter_mode:
                    phrases.append((cur_phrase, mode))
                    cur_phrase = ""
                    mode = letter_mode
                cur_phrase += letter
            phrases.append((cur_phrase, mode))
            return phrases

        iface = gr.Interface(highlight_vowels, "text", "highlight")
        output_filepath = iface("Helloooo")
        with open(output_filepath) as fp:
            output = json.load(fp)
            assert output == [
                ["H", "non"],
                ["e", "vowel"],
                ["ll", "non"],
                ["oooo", "vowel"],
            ]


class TestAnnotatedImage:
    def test_postprocess(self):
        """
        postprocess
        """
        component = gr.AnnotatedImage()
        img = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
        mask1 = [40, 40, 50, 50]
        mask2 = np.zeros((100, 100), dtype=np.uint8)
        mask2[10:20, 10:20] = 1

        input = (img, [(mask1, "mask1"), (mask2, "mask2")])
        result = component.postprocess(input)

        base_img_out, (mask1_out, mask2_out) = result
        base_img_out = PIL.Image.open(base_img_out["name"])

        assert mask1_out[1] == "mask1"

        mask1_img_out = PIL.Image.open(mask1_out[0]["name"])
        assert mask1_img_out.size == base_img_out.size
        mask1_array_out = np.array(mask1_img_out)
        assert np.max(mask1_array_out[40:50, 40:50]) == 255
        assert np.max(mask1_array_out[50:60, 50:60]) == 0

    def test_component_functions(self):
        ht_output = gr.AnnotatedImage(label="sections", show_legend=False)
        assert ht_output.get_config() == {
            "name": "annotatedimage",
            "show_label": True,
            "label": "sections",
            "show_legend": False,
            "style": {},
            "elem_id": None,
            "elem_classes": None,
            "visible": True,
            "value": None,
            "root_url": None,
            "selectable": False,
            "interactive": None,
        }

    def test_in_interface(self):
        def mask(img):
            top_left_corner = [0, 0, 20, 20]
            random_mask = np.random.randint(0, 2, img.shape[:2])
            return (img, [(top_left_corner, "left corner"), (random_mask, "random")])

        iface = gr.Interface(mask, "image", gr.AnnotatedImage())
        output_json = iface("test/test_files/bus.png")
        with open(output_json) as fp:
            output = json.load(fp)
            output_img, (mask1, mask1) = output
        input_img = PIL.Image.open("test/test_files/bus.png")
        output_img = PIL.Image.open(output_img["name"])
        mask1_img = PIL.Image.open(mask1[0]["name"])

        assert output_img.size == input_img.size
        assert mask1_img.size == input_img.size


class TestChatbot:
    def test_component_functions(self):
        """
        Postprocess, get_config
        """
        chatbot = gr.Chatbot()
        assert chatbot.postprocess([["You are **cool**\nand fun", "so are *you*"]]) == [
            ["You are <strong>cool</strong>\nand fun", "so are <em>you</em>"]
        ]

        multimodal_msg = [
            [("test/test_files/video_sample.mp4",), "cool video"],
            [("test/test_files/audio_sample.wav",), "cool audio"],
            [("test/test_files/bus.png", "A bus"), "cool pic"],
        ]
        processed_multimodal_msg = [
            [
                {
                    "name": "video_sample.mp4",
                    "mime_type": "video/mp4",
                    "alt_text": None,
                    "data": None,
                    "is_file": True,
                },
                "cool video",
            ],
            [
                {
                    "name": "audio_sample.wav",
                    "mime_type": "audio/wav",
                    "alt_text": None,
                    "data": None,
                    "is_file": True,
                },
                "cool audio",
            ],
            [
                {
                    "name": "bus.png",
                    "mime_type": "image/png",
                    "alt_text": "A bus",
                    "data": None,
                    "is_file": True,
                },
                "cool pic",
            ],
        ]
        postprocessed_multimodal_msg = chatbot.postprocess(multimodal_msg)
        postprocessed_multimodal_msg_base_names = []
        for x, y in postprocessed_multimodal_msg:
            if isinstance(x, dict):
                x["name"] = os.path.basename(x["name"])
                postprocessed_multimodal_msg_base_names.append([x, y])
        assert postprocessed_multimodal_msg_base_names == processed_multimodal_msg

        preprocessed_multimodal_msg = chatbot.preprocess(processed_multimodal_msg)
        multimodal_msg_base_names = []
        for x, y in multimodal_msg:
            if isinstance(x, tuple):
                if len(x) > 1:
                    new_x = (os.path.basename(x[0]), x[1])
                else:
                    new_x = (os.path.basename(x[0]),)
                multimodal_msg_base_names.append([new_x, y])
        assert multimodal_msg_base_names == preprocessed_multimodal_msg

        assert chatbot.get_config() == {
            "value": [],
            "label": None,
            "show_label": True,
            "interactive": None,
            "name": "chatbot",
            "visible": True,
            "elem_id": None,
            "elem_classes": None,
            "style": {},
            "root_url": None,
            "selectable": False,
        }


class TestJSON:
    def test_component_functions(self):
        """
        Postprocess
        """
        js_output = gr.JSON()
        assert js_output.postprocess('{"a":1, "b": 2}'), '"{\\"a\\":1, \\"b\\": 2}"'
        assert js_output.get_config() == {
            "style": {},
            "elem_id": None,
            "elem_classes": None,
            "visible": True,
            "value": None,
            "show_label": True,
            "label": None,
            "name": "json",
            "interactive": None,
            "root_url": None,
        }

    @pytest.mark.asyncio
    async def test_in_interface(self):
        """
        Interface, process
        """

        def get_avg_age_per_gender(data):
            return {
                "M": int(data[data["gender"] == "M"].mean()),
                "F": int(data[data["gender"] == "F"].mean()),
                "O": int(data[data["gender"] == "O"].mean()),
            }

        iface = gr.Interface(
            get_avg_age_per_gender,
            gr.Dataframe(headers=["gender", "age"]),
            "json",
        )
        y_data = [
            ["M", 30],
            ["F", 20],
            ["M", 40],
            ["O", 20],
            ["F", 30],
        ]
        assert (
            await iface.process_api(
                0, [{"data": y_data, "headers": ["gender", "age"]}], state={}
            )
        )["data"][0] == {
            "M": 35,
            "F": 25,
            "O": 20,
        }


class TestHTML:
    def test_component_functions(self):
        """
        get_config
        """
        html_component = gr.components.HTML("#Welcome onboard", label="HTML Input")
        assert {
            "style": {},
            "elem_id": None,
            "elem_classes": None,
            "visible": True,
            "value": "#Welcome onboard",
            "show_label": True,
            "label": "HTML Input",
            "name": "html",
            "interactive": None,
            "root_url": None,
        } == html_component.get_config()

    def test_in_interface(self):
        """
        Interface, process
        """

        def bold_text(text):
            return f"<strong>{text}</strong>"

        iface = gr.Interface(bold_text, "text", "html")
        assert iface("test") == "<strong>test</strong>"


class TestMarkdown:
    def test_component_functions(self):
        markdown_component = gr.Markdown("# Let's learn about $x$", label="Markdown")
        assert markdown_component.get_config()["value"].startswith(
            """<h1>Let’s learn about <span class="math inline"><span style=\'font-size: 0px\'>x</span><svg xmlns:xlink="http://www.w3.org/1999/xlink" height="0.9678125em" viewBox="0 0 11.6 19.35625" xmlns="http://www.w3.org/2000/svg" version="1.1">\n \n <defs>\n  <style type="text/css">*{stroke-linejoin: round; stroke-linecap: butt}</style>\n </defs>\n <g id="figure_1">\n  <g id="patch_1">"""
        )

    def test_in_interface(self):
        """
        Interface, process
        """
        iface = gr.Interface(lambda x: x, "text", "markdown")
        input_data = "Here's an [image](https://gradio.app/images/gradio_logo.png)"
        output_data = iface(input_data)
        assert (
            output_data
            == """<p>Here’s an <a href="https://gradio.app/images/gradio_logo.png" target="_blank">image</a></p>\n"""
        )


class TestModel3D:
    def test_component_functions(self):
        """
        get_config
        """
        component = gr.components.Model3D(None, label="Model")
        assert {
            "clearColor": [0, 0, 0, 0],
            "value": None,
            "label": "Model",
            "show_label": True,
            "interactive": None,
            "root_url": None,
            "name": "model3d",
            "visible": True,
            "elem_id": None,
            "elem_classes": None,
            "style": {},
        } == component.get_config()

        file = "test/test_files/Box.gltf"
        output1 = component.postprocess(file)
        output2 = component.postprocess(file)
        assert output1 == output2

    def test_in_interface(self):
        """
        Interface, process
        """
        iface = gr.Interface(lambda x: x, "model3d", "model3d")
        input_data = "test/test_files/Box.gltf"
        output_data = iface(input_data)
        assert output_data.endswith(".gltf")


class TestColorPicker:
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, tokenize, get_config
        """
        color_picker_input = gr.ColorPicker()
        assert color_picker_input.preprocess("#000000") == "#000000"
        assert color_picker_input.postprocess("#000000") == "#000000"
        assert color_picker_input.postprocess(None) is None
        assert color_picker_input.postprocess("#FFFFFF") == "#FFFFFF"
        assert color_picker_input.serialize("#000000", True) == "#000000"

        color_picker_input.interpretation_replacement = "unknown"

        assert color_picker_input.get_config() == {
            "value": None,
            "show_label": True,
            "label": None,
            "style": {},
            "elem_id": None,
            "elem_classes": None,
            "visible": True,
            "interactive": None,
            "root_url": None,
            "name": "colorpicker",
        }

    def test_in_interface_as_input(self):
        """
        Interface, process, interpret,
        """
        iface = gr.Interface(lambda x: x, "colorpicker", "colorpicker")
        assert iface("#000000") == "#000000"

    def test_in_interface_as_output(self):
        """
        Interface, process

        """
        iface = gr.Interface(lambda x: x, "colorpicker", gr.ColorPicker())
        assert iface("#000000") == "#000000"

    def test_static(self):
        """
        postprocess
        """
        component = gr.ColorPicker("#000000")
        assert component.get_config().get("value") == "#000000"


class TestCarousel:
    def test_deprecation(self):
        test_file_dir = Path(Path(__file__).parent, "test_files")
        with pytest.raises(DeprecationWarning):
            gr.Carousel([Path(test_file_dir, "bus.png")])

    def test_deprecation_in_interface(self):
        with pytest.raises(DeprecationWarning):
            gr.Interface(lambda x: ["lion.jpg"], "textbox", "carousel")

    def test_deprecation_in_blocks(self):
        with pytest.raises(DeprecationWarning):
            with gr.Blocks():
                gr.Textbox()
                gr.Carousel()


class TestGallery:
    @patch("uuid.uuid4", return_value="my-uuid")
    def test_gallery(self, mock_uuid):
        gallery = gr.Gallery()
        test_file_dir = Path(Path(__file__).parent, "test_files")
        data = [
            client_utils.encode_file_to_base64(Path(test_file_dir, "bus.png")),
            client_utils.encode_file_to_base64(Path(test_file_dir, "cheetah1.jpg")),
        ]

        with tempfile.TemporaryDirectory() as tmpdir:
            path = gallery.deserialize(data, tmpdir)
            assert path.endswith("my-uuid")
            data_restored = gallery.serialize(path)
            data_restored = [d[0]["data"] for d in data_restored]
            assert sorted(data) == sorted(data_restored)


class TestState:
    def test_as_component(self):
        state = gr.State(value=5)
        assert state.preprocess(10) == 10
        assert state.preprocess("abc") == "abc"
        assert state.stateful

    @pytest.mark.asyncio
    async def test_in_interface(self):
        def test(x, y=" def"):
            return (x + y, x + y)

        io = gr.Interface(test, ["text", "state"], ["text", "state"])
        result = await io.call_function(0, ["abc"])
        assert result["prediction"][0] == "abc def"
        result = await io.call_function(0, ["abc", result["prediction"][0]])
        assert result["prediction"][0] == "abcabc def"

    @pytest.mark.asyncio
    async def test_in_blocks(self):
        with gr.Blocks() as demo:
            score = gr.State()
            btn = gr.Button()
            btn.click(lambda x: x + 1, score, score)

        result = await demo.call_function(0, [0])
        assert result["prediction"] == 1
        result = await demo.call_function(0, [result["prediction"]])
        assert result["prediction"] == 2

    @pytest.mark.asyncio
    async def test_variable_for_backwards_compatibility(self):
        with gr.Blocks() as demo:
            score = gr.Variable()
            btn = gr.Button()
            btn.click(lambda x: x + 1, score, score)

        result = await demo.call_function(0, [0])
        assert result["prediction"] == 1
        result = await demo.call_function(0, [result["prediction"]])
        assert result["prediction"] == 2


def test_dataframe_as_example_converts_dataframes():
    df_comp = gr.Dataframe()
    assert df_comp.as_example(pd.DataFrame({"a": [1, 2, 3, 4], "b": [5, 6, 7, 8]})) == [
        [1, 5],
        [2, 6],
        [3, 7],
        [4, 8],
    ]
    assert df_comp.as_example(np.array([[1, 2], [3, 4.0]])) == [[1.0, 2.0], [3.0, 4.0]]


@pytest.mark.parametrize("component", [gr.Model3D, gr.File, gr.Audio])
def test_as_example_returns_file_basename(component):
    component = component()
    assert component.as_example("/home/freddy/sources/example.ext") == "example.ext"
    assert component.as_example(None) == ""


@patch("gradio.components.IOComponent.as_example")
@patch("gradio.components.Image.as_example")
@patch("gradio.components.File.as_example")
@patch("gradio.components.Dataframe.as_example")
@patch("gradio.components.Model3D.as_example")
def test_dataset_calls_as_example(*mocks):
    gr.Dataset(
        components=[gr.Dataframe(), gr.File(), gr.Image(), gr.Model3D(), gr.Textbox()],
        samples=[
            [
                pd.DataFrame({"a": np.array([1, 2, 3])}),
                "foo.png",
                "bar.jpeg",
                "duck.obj",
                "hello",
            ]
        ],
    )
    assert all(m.called for m in mocks)


cars = vega_datasets.data.cars()
stocks = vega_datasets.data.stocks()
barley = vega_datasets.data.barley()
simple = pd.DataFrame(
    {
        "a": ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
        "b": [28, 55, 43, 91, 81, 53, 19, 87, 52],
    }
)


class TestScatterPlot:
    @patch.dict("sys.modules", {"bokeh": MagicMock(__version__="3.0.3")})
    def test_get_config(self):

        assert gr.ScatterPlot().get_config() == {
            "caption": None,
            "elem_id": None,
            "elem_classes": None,
            "interactive": None,
            "label": None,
            "name": "plot",
            "root_url": None,
            "show_label": True,
            "style": {},
            "value": None,
            "visible": True,
            "bokeh_version": "3.0.3",
        }

    def test_no_color(self):
        plot = gr.ScatterPlot(
            x="Horsepower",
            y="Miles_per_Gallon",
            tooltip="Name",
            title="Car Data",
            x_title="Horse",
        )
        output = plot.postprocess(cars)
        assert sorted(output.keys()) == ["chart", "plot", "type"]
        config = json.loads(output["plot"])
        assert config["encoding"]["x"]["field"] == "Horsepower"
        assert config["encoding"]["x"]["title"] == "Horse"
        assert config["encoding"]["y"]["field"] == "Miles_per_Gallon"
        assert config["selection"] == {
            "selector001": {
                "bind": "scales",
                "encodings": ["x", "y"],
                "type": "interval",
            }
        }
        assert config["title"] == "Car Data"
        assert "height" not in config
        assert "width" not in config

    def test_no_interactive(self):
        plot = gr.ScatterPlot(
            x="Horsepower", y="Miles_per_Gallon", tooltip="Name", interactive=False
        )
        output = plot.postprocess(cars)
        assert sorted(output.keys()) == ["chart", "plot", "type"]
        config = json.loads(output["plot"])
        assert "selection" not in config

    def test_height_width(self):
        plot = gr.ScatterPlot(
            x="Horsepower", y="Miles_per_Gallon", height=100, width=200
        )
        output = plot.postprocess(cars)
        assert sorted(output.keys()) == ["chart", "plot", "type"]
        config = json.loads(output["plot"])
        assert config["height"] == 100
        assert config["width"] == 200

    def test_xlim_ylim(self):
        plot = gr.ScatterPlot(
            x="Horsepower", y="Miles_per_Gallon", x_lim=[200, 400], y_lim=[300, 500]
        )
        output = plot.postprocess(cars)
        config = json.loads(output["plot"])
        assert config["encoding"]["x"]["scale"] == {"domain": [200, 400]}
        assert config["encoding"]["y"]["scale"] == {"domain": [300, 500]}

    def test_color_encoding(self):
        plot = gr.ScatterPlot(
            x="Horsepower",
            y="Miles_per_Gallon",
            tooltip="Name",
            title="Car Data",
            color="Origin",
        )
        output = plot.postprocess(cars)
        config = json.loads(output["plot"])
        assert config["encoding"]["color"]["field"] == "Origin"
        assert config["encoding"]["color"]["scale"] == {
            "domain": ["USA", "Europe", "Japan"],
            "range": [0, 1, 2],
        }
        assert config["encoding"]["color"]["type"] == "nominal"

    def test_two_encodings(self):
        plot = gr.ScatterPlot(
            show_label=False,
            title="Two encodings",
            x="Horsepower",
            y="Miles_per_Gallon",
            color="Acceleration",
            shape="Origin",
        )
        output = plot.postprocess(cars)
        config = json.loads(output["plot"])
        assert config["encoding"]["color"]["field"] == "Acceleration"
        assert config["encoding"]["color"]["scale"] == {
            "domain": [cars.Acceleration.min(), cars.Acceleration.max()],
            "range": [0, 1],
        }
        assert config["encoding"]["color"]["type"] == "quantitative"

        assert config["encoding"]["shape"]["field"] == "Origin"
        assert config["encoding"]["shape"]["type"] == "nominal"

    def test_legend_position(self):
        plot = gr.ScatterPlot(
            show_label=False,
            title="Two encodings",
            x="Horsepower",
            y="Miles_per_Gallon",
            color="Acceleration",
            color_legend_position="none",
            color_legend_title="Foo",
            shape="Origin",
            shape_legend_position="none",
            shape_legend_title="Bar",
            size="Acceleration",
            size_legend_title="Accel",
            size_legend_position="none",
        )
        output = plot.postprocess(cars)
        config = json.loads(output["plot"])
        assert config["encoding"]["color"]["legend"] is None
        assert config["encoding"]["shape"]["legend"] is None
        assert config["encoding"]["size"]["legend"] is None

        output = gr.ScatterPlot.update(
            value=cars,
            title="Two encodings",
            x="Horsepower",
            y="Miles_per_Gallon",
            color="Acceleration",
            color_legend_position="top",
            color_legend_title="Foo",
            shape="Origin",
            shape_legend_position="bottom",
            shape_legend_title="Bar",
            size="Acceleration",
            size_legend_title="Accel",
            size_legend_position="left",
        )

        config = json.loads(output["value"]["plot"])
        assert config["encoding"]["color"]["legend"]["orient"] == "top"
        assert config["encoding"]["shape"]["legend"]["orient"] == "bottom"
        assert config["encoding"]["size"]["legend"]["orient"] == "left"

    def test_update(self):
        output = gr.ScatterPlot.update(value=cars, x="Horsepower", y="Miles_per_Gallon")
        postprocessed = gr.ScatterPlot().postprocess(output["value"])
        assert postprocessed == output["value"]

    def test_update_visibility(self):
        output = gr.ScatterPlot.update(visible=False)
        assert not output["visible"]
        assert output["value"] is gr.components._Keywords.NO_VALUE

    def test_update_errors(self):
        with pytest.raises(
            ValueError, match="In order to update plot properties the value parameter"
        ):
            gr.ScatterPlot.update(x="foo", y="bar")

        with pytest.raises(
            ValueError,
            match="In order to update plot properties, the x and y axis data",
        ):
            gr.ScatterPlot.update(value=cars, x="foo")

    def test_scatterplot_accepts_fn_as_value(self):
        plot = gr.ScatterPlot(
            value=lambda: cars.sample(frac=0.1, replace=False),
            x="Horsepower",
            y="Miles_per_Gallon",
            color="Origin",
        )
        assert isinstance(plot.value, dict)
        assert isinstance(plot.value["plot"], str)


class TestLinePlot:
    @patch.dict("sys.modules", {"bokeh": MagicMock(__version__="3.0.3")})
    def test_get_config(self):
        assert gr.LinePlot().get_config() == {
            "caption": None,
            "elem_id": None,
            "elem_classes": None,
            "interactive": None,
            "label": None,
            "name": "plot",
            "root_url": None,
            "show_label": True,
            "style": {},
            "value": None,
            "visible": True,
            "bokeh_version": "3.0.3",
        }

    def test_no_color(self):
        plot = gr.LinePlot(
            x="date",
            y="price",
            tooltip=["symbol", "price"],
            title="Stock Performance",
            x_title="Trading Day",
        )
        output = plot.postprocess(stocks)
        assert sorted(output.keys()) == ["chart", "plot", "type"]
        config = json.loads(output["plot"])
        for layer in config["layer"]:
            assert layer["mark"]["type"] in ["line", "point"]
            assert layer["encoding"]["x"]["field"] == "date"
            assert layer["encoding"]["x"]["title"] == "Trading Day"
            assert layer["encoding"]["y"]["field"] == "price"

        assert config["title"] == "Stock Performance"
        assert "height" not in config
        assert "width" not in config

    def test_height_width(self):
        plot = gr.LinePlot(x="date", y="price", height=100, width=200)
        output = plot.postprocess(stocks)
        assert sorted(output.keys()) == ["chart", "plot", "type"]
        config = json.loads(output["plot"])
        assert config["height"] == 100
        assert config["width"] == 200

        output = gr.LinePlot.update(stocks, x="date", y="price", height=100, width=200)
        config = json.loads(output["value"]["plot"])
        assert config["height"] == 100
        assert config["width"] == 200

    def test_xlim_ylim(self):
        plot = gr.LinePlot(x="date", y="price", x_lim=[200, 400], y_lim=[300, 500])
        output = plot.postprocess(stocks)
        config = json.loads(output["plot"])
        for layer in config["layer"]:
            assert layer["encoding"]["x"]["scale"] == {"domain": [200, 400]}
            assert layer["encoding"]["y"]["scale"] == {"domain": [300, 500]}

    def test_color_encoding(self):
        plot = gr.LinePlot(
            x="date", y="price", tooltip="symbol", color="symbol", overlay_point=True
        )
        output = plot.postprocess(stocks)
        config = json.loads(output["plot"])
        for layer in config["layer"]:
            assert layer["encoding"]["color"]["field"] == "symbol"
            assert layer["encoding"]["color"]["scale"] == {
                "domain": ["MSFT", "AMZN", "IBM", "GOOG", "AAPL"],
                "range": [0, 1, 2, 3, 4],
            }
            assert layer["encoding"]["color"]["type"] == "nominal"
            if layer["mark"]["type"] == "point":
                assert layer["encoding"]["opacity"] == {}

    def test_two_encodings(self):
        output = gr.LinePlot.update(
            value=stocks,
            title="Two encodings",
            x="date",
            y="price",
            color="symbol",
            stroke_dash="symbol",
            color_legend_title="Color",
            stroke_dash_legend_title="Stroke Dash",
        )
        config = json.loads(output["value"]["plot"])
        for layer in config["layer"]:
            if layer["mark"]["type"] == "point":
                assert layer["encoding"]["opacity"] == {"value": 0}
            if layer["mark"]["type"] == "line":
                assert layer["encoding"]["strokeDash"]["field"] == "symbol"
                assert (
                    layer["encoding"]["strokeDash"]["legend"]["title"] == "Stroke Dash"
                )

    def test_legend_position(self):
        plot = gr.LinePlot(
            value=stocks,
            title="Two encodings",
            x="date",
            y="price",
            color="symbol",
            stroke_dash="symbol",
            color_legend_position="none",
            stroke_dash_legend_position="none",
        )
        output = plot.postprocess(stocks)
        config = json.loads(output["plot"])
        for layer in config["layer"]:
            if layer["mark"]["type"] == "point":
                assert layer["encoding"]["color"]["legend"] is None
            if layer["mark"]["type"] == "line":
                assert layer["encoding"]["strokeDash"]["legend"] is None
                assert layer["encoding"]["color"]["legend"] is None

        output = gr.LinePlot.update(
            value=stocks,
            title="Two encodings",
            x="date",
            y="price",
            color="symbol",
            stroke_dash="symbol",
            color_legend_position="top-right",
            stroke_dash_legend_position="top-left",
        )

        config = json.loads(output["value"]["plot"])
        for layer in config["layer"]:
            if layer["mark"]["type"] == "point":
                assert layer["encoding"]["color"]["legend"]["orient"] == "top-right"
            if layer["mark"]["type"] == "line":
                assert layer["encoding"]["strokeDash"]["legend"]["orient"] == "top-left"
                assert layer["encoding"]["color"]["legend"]["orient"] == "top-right"

    def test_update_visibility(self):
        output = gr.LinePlot.update(visible=False)
        assert not output["visible"]
        assert output["value"] is gr.components._Keywords.NO_VALUE

    def test_update_errors(self):
        with pytest.raises(
            ValueError, match="In order to update plot properties the value parameter"
        ):
            gr.LinePlot.update(x="foo", y="bar")

        with pytest.raises(
            ValueError,
            match="In order to update plot properties, the x and y axis data",
        ):
            gr.LinePlot.update(value=stocks, x="foo")

    def test_lineplot_accepts_fn_as_value(self):
        plot = gr.LinePlot(
            value=lambda: stocks.sample(frac=0.1, replace=False),
            x="date",
            y="price",
            color="symbol",
        )
        assert isinstance(plot.value, dict)
        assert isinstance(plot.value["plot"], str)


class TestBarPlot:
    @patch.dict("sys.modules", {"bokeh": MagicMock(__version__="3.0.3")})
    def test_get_config(self):
        assert gr.BarPlot().get_config() == {
            "caption": None,
            "elem_id": None,
            "elem_classes": None,
            "interactive": None,
            "label": None,
            "name": "plot",
            "root_url": None,
            "show_label": True,
            "style": {},
            "value": None,
            "visible": True,
            "bokeh_version": "3.0.3",
        }

    def test_no_color(self):
        plot = gr.BarPlot(
            x="a",
            y="b",
            tooltip=["a", "b"],
            title="Made Up Bar Plot",
            x_title="Variable A",
        )
        output = plot.postprocess(simple)
        assert sorted(output.keys()) == ["chart", "plot", "type"]
        assert output["chart"] == "bar"
        config = json.loads(output["plot"])
        assert config["encoding"]["x"]["field"] == "a"
        assert config["encoding"]["x"]["title"] == "Variable A"
        assert config["encoding"]["y"]["field"] == "b"
        assert config["encoding"]["y"]["title"] == "b"

        assert config["title"] == "Made Up Bar Plot"
        assert "height" not in config
        assert "width" not in config

    def test_height_width(self):
        plot = gr.BarPlot(x="a", y="b", height=100, width=200)
        output = plot.postprocess(simple)
        assert sorted(output.keys()) == ["chart", "plot", "type"]
        config = json.loads(output["plot"])
        assert config["height"] == 100
        assert config["width"] == 200

        output = gr.BarPlot.update(simple, x="a", y="b", height=100, width=200)
        config = json.loads(output["value"]["plot"])
        assert config["height"] == 100
        assert config["width"] == 200

    def test_ylim(self):
        plot = gr.BarPlot(x="a", y="b", y_lim=[15, 100])
        output = plot.postprocess(simple)
        config = json.loads(output["plot"])
        assert config["encoding"]["y"]["scale"] == {"domain": [15, 100]}

    def test_horizontal(self):
        output = gr.BarPlot.update(
            simple,
            x="a",
            y="b",
            x_title="Variable A",
            y_title="Variable B",
            title="Simple Bar Plot with made up data",
            tooltip=["a", "b"],
            vertical=False,
            y_lim=[20, 100],
        )
        assert output["value"]["chart"] == "bar"
        config = json.loads(output["value"]["plot"])
        assert config["encoding"]["x"]["field"] == "b"
        assert config["encoding"]["x"]["scale"] == {"domain": [20, 100]}
        assert config["encoding"]["x"]["title"] == "Variable B"

        assert config["encoding"]["y"]["field"] == "a"
        assert config["encoding"]["y"]["title"] == "Variable A"

    def test_stack_via_color(self):
        output = gr.BarPlot.update(
            barley,
            x="variety",
            y="yield",
            color="site",
            title="Barley Yield Data",
            color_legend_title="Site",
            color_legend_position="bottom",
        )
        config = json.loads(output["value"]["plot"])
        assert config["encoding"]["color"]["field"] == "site"
        assert config["encoding"]["color"]["legend"] == {
            "title": "Site",
            "orient": "bottom",
        }
        assert config["encoding"]["color"]["scale"] == {
            "domain": [
                "University Farm",
                "Waseca",
                "Morris",
                "Crookston",
                "Grand Rapids",
                "Duluth",
            ],
            "range": [0, 1, 2, 3, 4, 5],
        }

    def test_group(self):
        output = gr.BarPlot.update(
            barley,
            x="year",
            y="yield",
            color="year",
            group="site",
            title="Barley Yield by Year and Site",
            group_title="",
            tooltip=["yield", "site", "year"],
        )
        config = json.loads(output["value"]["plot"])
        assert config["encoding"]["column"] == {"field": "site", "title": ""}

    def test_group_horizontal(self):
        output = gr.BarPlot.update(
            barley,
            x="year",
            y="yield",
            color="year",
            group="site",
            title="Barley Yield by Year and Site",
            group_title="Site Title",
            tooltip=["yield", "site", "year"],
            vertical=False,
        )
        config = json.loads(output["value"]["plot"])
        assert config["encoding"]["row"] == {"field": "site", "title": "Site Title"}

    def test_barplot_accepts_fn_as_value(self):
        plot = gr.BarPlot(
            value=lambda: barley.sample(frac=0.1, replace=False),
            x="year",
            y="yield",
        )
        assert isinstance(plot.value, dict)
        assert isinstance(plot.value["plot"], str)


class TestCode:
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, get_config
        """
        code = gr.Code()

        assert code.preprocess("# hello friends") == "# hello friends"
        assert code.preprocess("def fn(a):\n  return a") == "def fn(a):\n  return a"

        assert (
            code.postprocess(
                """
            def fn(a):
                return a
            """
            )
            == """def fn(a):
                return a"""
        )

        test_file_dir = Path(Path(__file__).parent, "test_files")
        path = str(Path(test_file_dir, "test_label_json.json"))
        with open(path) as f:
            assert code.postprocess(path) == path
            assert code.postprocess((path,)) == f.read()

        assert code.serialize("def fn(a):\n  return a") == "def fn(a):\n  return a"
        assert code.deserialize("def fn(a):\n  return a") == "def fn(a):\n  return a"

        assert code.get_config() == {
            "value": None,
            "language": None,
            "lines": 5,
            "name": "code",
            "show_label": True,
            "label": None,
            "style": {},
            "elem_id": None,
            "elem_classes": None,
            "visible": True,
            "interactive": None,
            "root_url": None,
        }


class TestTempFileManagement:
    def test_hash_file(self):
        temp_file_manager = gr.File()
        h1 = temp_file_manager.hash_file("gradio/test_data/cheetah1.jpg")
        h2 = temp_file_manager.hash_file("gradio/test_data/cheetah1-copy.jpg")
        h3 = temp_file_manager.hash_file("gradio/test_data/cheetah2.jpg")
        assert h1 == h2
        assert h1 != h3

    @patch("shutil.copy2")
    def test_make_temp_copy_if_needed(self, mock_copy):
        temp_file_manager = gr.File()

        f = temp_file_manager.make_temp_copy_if_needed("gradio/test_data/cheetah1.jpg")
        try:  # Delete if already exists from before this test
            os.remove(f)
        except OSError:
            pass

        f = temp_file_manager.make_temp_copy_if_needed("gradio/test_data/cheetah1.jpg")
        assert mock_copy.called
        assert len(temp_file_manager.temp_files) == 1
        assert Path(f).name == "cheetah1.jpg"

        f = temp_file_manager.make_temp_copy_if_needed("gradio/test_data/cheetah1.jpg")
        assert len(temp_file_manager.temp_files) == 1

        f = temp_file_manager.make_temp_copy_if_needed(
            "gradio/test_data/cheetah1-copy.jpg"
        )
        assert len(temp_file_manager.temp_files) == 2
        assert Path(f).name == "cheetah1-copy.jpg"

    def test_base64_to_temp_file_if_needed(self):
        temp_file_manager = gr.File()

        base64_file_1 = media_data.BASE64_IMAGE
        base64_file_2 = media_data.BASE64_AUDIO["data"]

        f = temp_file_manager.base64_to_temp_file_if_needed(base64_file_1)
        try:  # Delete if already exists from before this test
            os.remove(f)
        except OSError:
            pass

        f = temp_file_manager.base64_to_temp_file_if_needed(base64_file_1)
        assert len(temp_file_manager.temp_files) == 1

        f = temp_file_manager.base64_to_temp_file_if_needed(base64_file_1)
        assert len(temp_file_manager.temp_files) == 1

        f = temp_file_manager.base64_to_temp_file_if_needed(base64_file_2)
        assert len(temp_file_manager.temp_files) == 2

        for file in temp_file_manager.temp_files:
            os.remove(file)

    @pytest.mark.flaky
    @patch("shutil.copyfileobj")
    def test_download_temp_copy_if_needed(self, mock_copy):
        temp_file_manager = gr.File()
        url1 = "https://raw.githubusercontent.com/gradio-app/gradio/main/gradio/test_data/test_image.png"
        url2 = "https://raw.githubusercontent.com/gradio-app/gradio/main/gradio/test_data/cheetah1.jpg"

        f = temp_file_manager.download_temp_copy_if_needed(url1)
        try:  # Delete if already exists from before this test
            os.remove(f)
        except OSError:
            pass

        f = temp_file_manager.download_temp_copy_if_needed(url1)
        assert mock_copy.called
        assert len(temp_file_manager.temp_files) == 1

        f = temp_file_manager.download_temp_copy_if_needed(url1)
        assert len(temp_file_manager.temp_files) == 1

        f = temp_file_manager.download_temp_copy_if_needed(url2)
        assert len(temp_file_manager.temp_files) == 2
