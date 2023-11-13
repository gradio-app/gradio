"""
Tests for all of the components defined in components.py. Tests are divided into two types:
1. test_component_functions() are unit tests that check essential functions of a component, the functions that are checked are documented in the docstring.
2. test_in_interface() are functional tests that check a component's functionalities inside an Interface. Please do not use Interface.launch() in this file, as it slow downs the tests.
"""

import filecmp
import json
import os
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

try:
    from typing_extensions import cast
except ImportError:
    from typing import cast

import gradio as gr
from gradio import processing_utils, utils
from gradio.components.dataframe import DataframeData
from gradio.components.video import VideoData
from gradio.data_classes import FileData

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class TestGettingComponents:
    def test_component_function(self):
        assert isinstance(
            gr.components.component("textarea", render=False), gr.templates.TextArea
        )

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
        assert text_input.get_config() == {
            "lines": 1,
            "max_lines": 20,
            "placeholder": None,
            "value": "",
            "name": "textbox",
            "show_copy_button": False,
            "show_label": True,
            "type": "text",
            "label": None,
            "container": True,
            "min_width": 160,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "interactive": None,
            "proxy_url": None,
            "rtl": False,
            "text_align": None,
            "autofocus": False,
            "_selectable": False,
            "info": None,
            "autoscroll": True,
        }

    @pytest.mark.asyncio
    async def test_in_interface_as_input(self):
        """
        Interface, process
        """
        iface = gr.Interface(lambda x: x[::-1], "textbox", "textbox")
        assert iface("Hello") == "olleH"

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
        Preprocess, postprocess, serialize, get_config

        """
        numeric_input = gr.Number(elem_id="num", elem_classes="first")
        assert numeric_input.preprocess(3) == 3.0
        assert numeric_input.preprocess(None) is None
        assert numeric_input.postprocess(3) == 3
        assert numeric_input.postprocess(3) == 3.0
        assert numeric_input.postprocess(2.14) == 2.14
        assert numeric_input.postprocess(None) is None
        assert numeric_input.get_config() == {
            "value": None,
            "name": "number",
            "show_label": True,
            "step": 1,
            "label": None,
            "minimum": None,
            "maximum": None,
            "container": True,
            "min_width": 160,
            "scale": None,
            "elem_id": "num",
            "elem_classes": ["first"],
            "visible": True,
            "interactive": None,
            "proxy_url": None,
            "info": None,
            "precision": None,
            "_selectable": False,
        }

    def test_component_functions_integer(self):
        """
        Preprocess, postprocess, serialize, get_template_context

        """
        numeric_input = gr.Number(precision=0, value=42)
        assert numeric_input.preprocess(3) == 3
        assert numeric_input.preprocess(None) is None
        assert numeric_input.postprocess(3) == 3
        assert numeric_input.postprocess(3) == 3
        assert numeric_input.postprocess(2.85) == 3
        assert numeric_input.postprocess(None) is None
        assert numeric_input.get_config() == {
            "value": 42,
            "name": "number",
            "show_label": True,
            "step": 1,
            "label": None,
            "minimum": None,
            "maximum": None,
            "container": True,
            "min_width": 160,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "interactive": None,
            "proxy_url": None,
            "info": None,
            "precision": 0,
            "_selectable": False,
        }

    def test_component_functions_precision(self):
        """
        Preprocess, postprocess, serialize, get_template_context

        """
        numeric_input = gr.Number(precision=2, value=42.3428)
        assert numeric_input.preprocess(3.231241) == 3.23
        assert numeric_input.preprocess(None) is None
        assert numeric_input.postprocess(-42.1241) == -42.12
        assert numeric_input.postprocess(5.6784) == 5.68
        assert numeric_input.postprocess(2.1421) == 2.14
        assert numeric_input.postprocess(None) is None

    def test_in_interface_as_input(self):
        """
        Interface, process
        """
        iface = gr.Interface(lambda x: x**2, "number", "textbox")
        assert iface(2) == "4.0"

    def test_precision_0_in_interface(self):
        """
        Interface, process
        """
        iface = gr.Interface(lambda x: x**2, gr.Number(precision=0), "textbox")
        assert iface(2) == "4"

    def test_in_interface_as_output(self):
        """
        Interface, process
        """
        iface = gr.Interface(lambda x: int(x) ** 2, "textbox", "number")
        assert iface(2) == 4.0

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

        slider_input = gr.Slider(10, 20, value=15, step=1, label="Slide Your Input")
        assert slider_input.get_config() == {
            "minimum": 10,
            "maximum": 20,
            "step": 1,
            "value": 15,
            "name": "slider",
            "show_label": True,
            "label": "Slide Your Input",
            "container": True,
            "min_width": 160,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "interactive": None,
            "proxy_url": None,
            "info": None,
            "_selectable": False,
        }

    def test_in_interface(self):
        """ "
        Interface, process
        """
        iface = gr.Interface(lambda x: x**2, "slider", "textbox")
        assert iface(2) == "4"

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
        bool_input = gr.Checkbox(value=True, label="Check Your Input")
        assert bool_input.get_config() == {
            "value": True,
            "name": "checkbox",
            "show_label": True,
            "label": "Check Your Input",
            "container": True,
            "min_width": 160,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "interactive": None,
            "proxy_url": None,
            "_selectable": False,
            "info": None,
        }

    def test_in_interface(self):
        """
        Interface, process
        """
        iface = gr.Interface(lambda x: 1 if x else 0, "checkbox", "number")
        assert iface(True) == 1


class TestCheckboxGroup:
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, get_config
        """
        checkboxes_input = gr.CheckboxGroup(["a", "b", "c"])
        assert checkboxes_input.preprocess(["a", "c"]) == ["a", "c"]
        assert checkboxes_input.postprocess(["a", "c"]) == ["a", "c"]

        checkboxes_input = gr.CheckboxGroup(["a", "b"], type="index")
        assert checkboxes_input.preprocess(["a"]) == [0]
        assert checkboxes_input.preprocess(["a", "b"]) == [0, 1]
        assert checkboxes_input.preprocess(["a", "b", "c"]) == [0, 1, None]

        # When a Gradio app is loaded with gr.load, the tuples are converted to lists,
        # so we need to test that case as well
        checkboxgroup = gr.CheckboxGroup(["a", "b", ["c", "c full"]])  # type: ignore
        assert checkboxgroup.choices == [("a", "a"), ("b", "b"), ("c", "c full")]

        checkboxes_input = gr.CheckboxGroup(
            value=["a", "c"],
            choices=["a", "b", "c"],
            label="Check Your Inputs",
        )
        assert checkboxes_input.get_config() == {
            "choices": [("a", "a"), ("b", "b"), ("c", "c")],
            "value": ["a", "c"],
            "name": "checkboxgroup",
            "show_label": True,
            "label": "Check Your Inputs",
            "container": True,
            "min_width": 160,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "interactive": None,
            "proxy_url": None,
            "_selectable": False,
            "type": "value",
            "info": None,
        }
        with pytest.raises(ValueError):
            gr.CheckboxGroup(["a"], type="unknown")

        cbox = gr.CheckboxGroup(choices=["a", "b"], value="c")
        assert cbox.get_config()["value"] == ["c"]
        assert cbox.postprocess("a") == ["a"]
        with pytest.raises(ValueError):
            gr.CheckboxGroup().as_example("a")

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
        radio_input = gr.Radio(
            choices=["a", "b", "c"], value="a", label="Pick Your One Input"
        )
        assert radio_input.get_config() == {
            "choices": [("a", "a"), ("b", "b"), ("c", "c")],
            "value": "a",
            "name": "radio",
            "show_label": True,
            "label": "Pick Your One Input",
            "container": True,
            "min_width": 160,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "interactive": None,
            "proxy_url": None,
            "_selectable": False,
            "type": "value",
            "info": None,
        }

        radio = gr.Radio(choices=["a", "b"], type="index")
        assert radio.preprocess("a") == 0
        assert radio.preprocess("b") == 1
        assert radio.preprocess("c") is None

        # When a Gradio app is loaded with gr.load, the tuples are converted to lists,
        # so we need to test that case as well
        radio = gr.Radio(["a", "b", ["c", "c full"]])  # type: ignore
        assert radio.choices == [("a", "a"), ("b", "b"), ("c", "c full")]

        with pytest.raises(ValueError):
            gr.Radio(["a", "b"], type="unknown")

    def test_in_interface(self):
        """
        Interface, process
        """
        radio_input = gr.Radio(["a", "b", "c"])
        iface = gr.Interface(lambda x: 2 * x, radio_input, "textbox")
        assert iface("c") == "cc"


class TestDropdown:
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, get_config
        """
        dropdown_input = gr.Dropdown(["a", "b", ("c", "c full")], multiselect=True)
        assert dropdown_input.preprocess("a") == "a"
        assert dropdown_input.postprocess("a") == ["a"]
        assert dropdown_input.preprocess("c full") == "c full"
        assert dropdown_input.postprocess("c full") == ["c full"]

        # When a Gradio app is loaded with gr.load, the tuples are converted to lists,
        # so we need to test that case as well
        dropdown_input = gr.Dropdown(["a", "b", ["c", "c full"]])  # type: ignore
        assert dropdown_input.choices == [("a", "a"), ("b", "b"), ("c", "c full")]

        dropdown = gr.Dropdown(choices=["a", "b"], type="index")
        assert dropdown.preprocess("a") == 0
        assert dropdown.preprocess("b") == 1
        assert dropdown.preprocess("c") is None

        dropdown = gr.Dropdown(choices=["a", "b"], type="index", multiselect=True)
        assert dropdown.preprocess(["a"]) == [0]
        assert dropdown.preprocess(["a", "b"]) == [0, 1]
        assert dropdown.preprocess(["a", "b", "c"]) == [0, 1, None]

        dropdown_input_multiselect = gr.Dropdown(["a", "b", ("c", "c full")])
        assert dropdown_input_multiselect.preprocess(["a", "c full"]) == ["a", "c full"]
        assert dropdown_input_multiselect.postprocess(["a", "c full"]) == [
            "a",
            "c full",
        ]
        dropdown_input_multiselect = gr.Dropdown(
            value=["a", "c"],
            choices=["a", "b", ("c", "c full")],
            label="Select Your Inputs",
            multiselect=True,
            max_choices=2,
        )
        assert dropdown_input_multiselect.get_config() == {
            "allow_custom_value": False,
            "choices": [("a", "a"), ("b", "b"), ("c", "c full")],
            "value": ["a", "c"],
            "name": "dropdown",
            "show_label": True,
            "label": "Select Your Inputs",
            "container": True,
            "min_width": 160,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "interactive": None,
            "proxy_url": None,
            "multiselect": True,
            "filterable": True,
            "max_choices": 2,
            "_selectable": False,
            "type": "value",
            "info": None,
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
        dropdown_input = gr.Dropdown(["a", "b", "c"])
        iface = gr.Interface(lambda x: "|".join(x), dropdown_input, "textbox")
        assert iface(["a", "c"]) == "a|c"
        assert iface([]) == ""


class TestImage:
    def test_component_functions(self, gradio_temp_dir):
        """
        Preprocess, postprocess, serialize, get_config, _segment_by_slic
        type: pil, file, filepath, numpy
        """

        img = FileData(path="test/test_files/bus.png")
        image_input = gr.Image()

        image_input = gr.Image(type="filepath")
        image_temp_filepath = image_input.preprocess(img)
        assert image_temp_filepath in [
            str(f) for f in gradio_temp_dir.glob("**/*") if f.is_file()
        ]

        image_input = gr.Image(type="pil", label="Upload Your Image")
        assert image_input.get_config() == {
            "image_mode": "RGB",
            "sources": ["upload", "webcam", "clipboard"],
            "name": "image",
            "show_share_button": False,
            "show_download_button": True,
            "streaming": False,
            "show_label": True,
            "label": "Upload Your Image",
            "container": True,
            "min_width": 160,
            "scale": None,
            "height": None,
            "width": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "value": None,
            "interactive": None,
            "proxy_url": None,
            "mirror_webcam": True,
            "_selectable": False,
            "streamable": False,
            "type": "pil",
        }
        assert image_input.preprocess(None) is None
        image_input = gr.Image()
        assert image_input.preprocess(img) is not None
        image_input.preprocess(img)
        file_image = gr.Image(type="filepath")
        assert isinstance(file_image.preprocess(img), str)
        with pytest.raises(ValueError):
            gr.Image(type="unknown")

        string_source = gr.Image(sources="upload")
        assert string_source.sources == ["upload"]
        # Output functionalities
        image_output = gr.Image(type="pil")
        processed_image = image_output.postprocess(
            PIL.Image.open(img.path)
        ).model_dump()
        assert processed_image is not None
        if processed_image is not None:
            processed = PIL.Image.open(cast(dict, processed_image).get("path", ""))
            source = PIL.Image.open(img.path)
            assert processed.size == source.size

    def test_in_interface_as_output(self):
        """
        Interface, process
        """

        def generate_noise(height, width):
            return np.random.randint(0, 256, (height, width, 3))

        iface = gr.Interface(generate_noise, ["slider", "slider"], "image")
        assert iface(10, 20).endswith(".png")

    def test_static(self):
        """
        postprocess
        """
        component = gr.Image("test/test_files/bus.png")
        value = component.get_config().get("value")
        base64 = client_utils.encode_file_to_base64(value["path"])
        assert base64 == media_data.BASE64_IMAGE
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
        out = gr.Plot().postprocess(chart).model_dump()
        assert isinstance(out["plot"], str)
        assert out["plot"] == chart.to_json()


class TestAudio:
    def test_component_functions(self, gradio_temp_dir):
        """
        Preprocess, postprocess serialize, get_config, deserialize
        type: filepath, numpy, file
        """
        x_wav = FileData(path=media_data.BASE64_AUDIO["path"])
        audio_input = gr.Audio()
        output1 = audio_input.preprocess(x_wav)
        assert output1[0] == 8000
        assert output1[1].shape == (8046,)

        x_wav = processing_utils.move_files_to_cache([x_wav], audio_input)[0]
        audio_input = gr.Audio(type="filepath")
        output1 = audio_input.preprocess(x_wav)
        assert Path(output1).name.endswith("audio_sample.wav")

        audio_input = gr.Audio(label="Upload Your Audio")
        assert audio_input.get_config() == {
            "autoplay": False,
            "sources": ["upload", "microphone"],
            "name": "audio",
            "show_download_button": True,
            "show_share_button": False,
            "streaming": False,
            "show_label": True,
            "label": "Upload Your Audio",
            "container": True,
            "min_width": 160,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "value": None,
            "interactive": None,
            "proxy_url": None,
            "type": "numpy",
            "format": "wav",
            "streamable": False,
            "max_length": None,
            "min_length": None,
            "waveform_options": None,
            "_selectable": False,
        }
        assert audio_input.preprocess(None) is None

        audio_input = gr.Audio(type="filepath")
        assert isinstance(audio_input.preprocess(x_wav), str)
        with pytest.raises(ValueError):
            gr.Audio(type="unknown")

        # Confirm Audio can be instantiated with a numpy array
        gr.Audio((100, np.random.random(size=(1000, 2))), label="Play your audio")

        # Output functionalities
        y_audio = client_utils.decode_base64_to_file(
            deepcopy(media_data.BASE64_AUDIO)["data"]
        )
        audio_output = gr.Audio(type="filepath")
        assert filecmp.cmp(
            y_audio.name, audio_output.postprocess(y_audio.name).model_dump()["path"]
        )
        assert audio_output.get_config() == {
            "autoplay": False,
            "name": "audio",
            "show_download_button": True,
            "show_share_button": False,
            "streaming": False,
            "show_label": True,
            "label": None,
            "max_length": None,
            "min_length": None,
            "container": True,
            "min_width": 160,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "value": None,
            "interactive": None,
            "proxy_url": None,
            "type": "filepath",
            "format": "wav",
            "streamable": False,
            "sources": ["upload", "microphone"],
            "waveform_options": None,
            "_selectable": False,
        }

        output1 = audio_output.postprocess(y_audio.name).model_dump()
        output2 = audio_output.postprocess(Path(y_audio.name)).model_dump()
        assert output1 == output2

    def test_default_value_postprocess(self):
        x_wav = deepcopy(media_data.BASE64_AUDIO)
        audio = gr.Audio(value=x_wav["path"])
        assert utils.is_in_or_equal(audio.value["path"], audio.GRADIO_CACHE)

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

    def test_audio_preprocess_can_be_read_by_scipy(self, gradio_temp_dir):
        x_wav = FileData(
            path=processing_utils.save_base64_to_cache(
                media_data.BASE64_MICROPHONE["data"], cache_dir=gradio_temp_dir
            )
        )
        audio_input = gr.Audio(type="filepath")
        output = audio_input.preprocess(x_wav)
        wavfile.read(output)

    def test_prepost_process_to_mp3(self, gradio_temp_dir):
        x_wav = FileData(
            path=processing_utils.save_base64_to_cache(
                media_data.BASE64_MICROPHONE["data"], cache_dir=gradio_temp_dir
            )
        )
        audio_input = gr.Audio(type="filepath", format="mp3")
        output = audio_input.preprocess(x_wav)
        assert output.endswith("mp3")
        output = audio_input.postprocess(
            (48000, np.random.randint(-256, 256, (5, 3)).astype(np.int16))
        ).model_dump()
        assert output["path"].endswith("mp3")


class TestFile:
    def test_component_functions(self):
        """
        Preprocess, serialize, get_config, value
        """
        x_file = FileData(path=media_data.BASE64_FILE["path"])
        file_input = gr.File()
        output = file_input.preprocess(x_file)
        assert isinstance(output, str)

        input1 = file_input.preprocess(x_file)
        input2 = file_input.preprocess(x_file)
        assert input1 == input1.name  # Testing backwards compatibility
        assert input1 == input2
        assert Path(input1).name == "sample_file.pdf"

        file_input = gr.File(label="Upload Your File")
        assert file_input.get_config() == {
            "file_count": "single",
            "file_types": None,
            "name": "file",
            "show_label": True,
            "label": "Upload Your File",
            "container": True,
            "min_width": 160,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "value": None,
            "interactive": None,
            "proxy_url": None,
            "_selectable": False,
            "height": None,
            "type": "filepath",
        }
        assert file_input.preprocess(None) is None
        assert file_input.preprocess(x_file) is not None

        zero_size_file = FileData(path="document.txt", size=0)
        temp_file = file_input.preprocess(zero_size_file)
        assert not Path(temp_file.name).exists()

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
        x_file = media_data.BASE64_FILE["path"]

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
        x_file = FileData(path=media_data.BASE64_FILE["path"])
        upload_input = gr.UploadButton()
        input = upload_input.preprocess(x_file)
        assert isinstance(input, str)

        input1 = upload_input.preprocess(x_file)
        input2 = upload_input.preprocess(x_file)
        assert input1 == input1.name  # Testing backwards compatibility
        assert input1 == input2

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
            "metadata": None,
        }
        dataframe_input = gr.Dataframe(headers=["Name", "Age", "Member"])
        output = dataframe_input.preprocess(DataframeData(**x_data))
        assert output["Age"][1] == 24
        assert not output["Member"][0]
        assert dataframe_input.postprocess(x_data) == x_data

        dataframe_input = gr.Dataframe(
            headers=["Name", "Age", "Member"], label="Dataframe Input"
        )
        assert dataframe_input.get_config() == {
            "value": {
                "headers": ["Name", "Age", "Member"],
                "data": [["", "", ""]],
                "metadata": None,
            },
            "_selectable": False,
            "headers": ["Name", "Age", "Member"],
            "row_count": (1, "dynamic"),
            "col_count": (3, "dynamic"),
            "datatype": ["str", "str", "str"],
            "type": "pandas",
            "label": "Dataframe Input",
            "show_label": True,
            "scale": None,
            "min_width": 160,
            "interactive": None,
            "visible": True,
            "elem_id": None,
            "elem_classes": [],
            "wrap": False,
            "proxy_url": None,
            "name": "dataframe",
            "height": 500,
            "latex_delimiters": [{"display": True, "left": "$$", "right": "$$"}],
            "line_breaks": True,
            "column_widths": [],
        }
        dataframe_input = gr.Dataframe()
        output = dataframe_input.preprocess(DataframeData(**x_data))
        assert output["Age"][1] == 24

        x_data = {
            "data": [["Tim", 12, False], ["Jan", 24, True]],
            "headers": ["Name", "Age", "Member"],
            "metadata": {"display_value": None, "styling": None},
        }
        dataframe_input.preprocess(DataframeData(**x_data))

        with pytest.raises(ValueError):
            gr.Dataframe(type="unknown")

        dataframe_output = gr.Dataframe()
        assert dataframe_output.get_config() == {
            "value": {
                "headers": ["1", "2", "3"],
                "data": [["", "", ""]],
                "metadata": None,
            },
            "_selectable": False,
            "headers": ["1", "2", "3"],
            "row_count": (1, "dynamic"),
            "col_count": (3, "dynamic"),
            "datatype": ["str", "str", "str"],
            "type": "pandas",
            "label": None,
            "show_label": True,
            "scale": None,
            "min_width": 160,
            "interactive": None,
            "visible": True,
            "elem_id": None,
            "elem_classes": [],
            "wrap": False,
            "proxy_url": None,
            "name": "dataframe",
            "height": 500,
            "latex_delimiters": [{"display": True, "left": "$$", "right": "$$"}],
            "line_breaks": True,
            "column_widths": [],
        }

        dataframe_input = gr.Dataframe(column_widths=["100px", 200, "50%"])
        assert dataframe_input.get_config()["column_widths"] == [
            "100px",
            "200px",
            "50%",
        ]

    def test_postprocess(self):
        """
        postprocess
        """
        dataframe_output = gr.Dataframe()
        output = dataframe_output.postprocess([]).model_dump()
        assert output == {"data": [[]], "headers": [], "metadata": None}
        output = dataframe_output.postprocess(np.zeros((2, 2))).model_dump()
        assert output == {
            "data": [[0, 0], [0, 0]],
            "headers": ["1", "2"],
            "metadata": None,
        }
        output = dataframe_output.postprocess([[1, 3, 5]]).model_dump()
        assert output == {
            "data": [[1, 3, 5]],
            "headers": ["1", "2", "3"],
            "metadata": None,
        }
        output = dataframe_output.postprocess(
            pd.DataFrame([[2, True], [3, True], [4, False]], columns=["num", "prime"])
        ).model_dump()
        assert output == {
            "headers": ["num", "prime"],
            "data": [[2, True], [3, True], [4, False]],
            "metadata": None,
        }
        with pytest.raises(ValueError):
            gr.Dataframe(type="unknown")

        # When the headers don't match the data
        dataframe_output = gr.Dataframe(headers=["one", "two", "three"])
        output = dataframe_output.postprocess([[2, True], [3, True]]).model_dump()
        assert output == {
            "headers": ["one", "two"],
            "data": [[2, True], [3, True]],
            "metadata": None,
        }
        dataframe_output = gr.Dataframe(headers=["one", "two", "three"])
        output = dataframe_output.postprocess(
            [[2, True, "ab", 4], [3, True, "cd", 5]]
        ).model_dump()
        assert output == {
            "headers": ["one", "two", "three", "4"],
            "data": [[2, True, "ab", 4], [3, True, "cd", 5]],
            "metadata": None,
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
        output = component.postprocess(df).model_dump()
        assert output == {
            "headers": list(df.columns),
            "data": [
                [
                    pd.Timestamp("2021-01-01 00:00:00"),
                    "February 15, 2022, 12:00:00 AM",
                    0.2233,
                    84,
                    True,
                    "# Hello",
                ],
                [
                    pd.Timestamp("2021-01-02 00:00:00"),
                    "February 16, 2022, 12:00:00 AM",
                    0.57281,
                    23,
                    False,
                    "# Goodbye",
                ],
            ],
            "metadata": None,
        }

    def test_dataframe_postprocess_only_dates(self):
        df = pd.DataFrame(
            {
                "date_1": pd.date_range("2021-01-01", periods=2),
                "date_2": pd.date_range("2022-02-15", periods=2),
            }
        )
        component = gr.Dataframe(datatype=["date", "date"])
        output = component.postprocess(df).model_dump()
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
            "metadata": None,
        }

    def test_dataframe_postprocess_styler(self):
        component = gr.Dataframe()
        df = pd.DataFrame(
            {
                "name": ["Adam", "Mike"] * 4,
                "gpa": [1.1, 1.12] * 4,
                "sat": [800, 800] * 4,
            }
        )
        s = df.style.format(precision=1, decimal=",")
        output = component.postprocess(s).model_dump()
        assert output == {
            "data": [
                ["Adam", 1.1, 800],
                ["Mike", 1.12, 800],
                ["Adam", 1.1, 800],
                ["Mike", 1.12, 800],
                ["Adam", 1.1, 800],
                ["Mike", 1.12, 800],
                ["Adam", 1.1, 800],
                ["Mike", 1.12, 800],
            ],
            "headers": ["name", "gpa", "sat"],
            "metadata": {
                "display_value": [
                    ["Adam", "1,1", "800"],
                    ["Mike", "1,1", "800"],
                    ["Adam", "1,1", "800"],
                    ["Mike", "1,1", "800"],
                    ["Adam", "1,1", "800"],
                    ["Mike", "1,1", "800"],
                    ["Adam", "1,1", "800"],
                    ["Mike", "1,1", "800"],
                ],
                "styling": [
                    ["", "", ""],
                    ["", "", ""],
                    ["", "", ""],
                    ["", "", ""],
                    ["", "", ""],
                    ["", "", ""],
                    ["", "", ""],
                    ["", "", ""],
                ],
            },
        }

        df = pd.DataFrame(
            {
                "A": [14, 4, 5, 4, 1],
                "B": [5, 2, 54, 3, 2],
                "C": [20, 20, 7, 3, 8],
                "D": [14, 3, 6, 2, 6],
                "E": [23, 45, 64, 32, 23],
            }
        )

        t = df.style.highlight_max(color="lightgreen", axis=0)
        output = component.postprocess(t).model_dump()
        assert output == {
            "data": [
                [14, 5, 20, 14, 23],
                [4, 2, 20, 3, 45],
                [5, 54, 7, 6, 64],
                [4, 3, 3, 2, 32],
                [1, 2, 8, 6, 23],
            ],
            "headers": ["A", "B", "C", "D", "E"],
            "metadata": {
                "display_value": [
                    ["14", "5", "20", "14", "23"],
                    ["4", "2", "20", "3", "45"],
                    ["5", "54", "7", "6", "64"],
                    ["4", "3", "3", "2", "32"],
                    ["1", "2", "8", "6", "23"],
                ],
                "styling": [
                    [
                        "background-color: lightgreen",
                        "",
                        "background-color: lightgreen",
                        "background-color: lightgreen",
                        "",
                    ],
                    ["", "", "background-color: lightgreen", "", ""],
                    [
                        "",
                        "background-color: lightgreen",
                        "",
                        "",
                        "background-color: lightgreen",
                    ],
                    ["", "", "", "", ""],
                    ["", "", "", "", ""],
                ],
            },
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

        row = dataset.preprocess(1)
        assert row[0] == 15
        assert row[1] == "hi"
        assert row[2].endswith("bus.png")
        assert row[3] == "<i>Italics</i>"
        assert row[4] == "*Italics*"

        dataset = gr.Dataset(
            components=["number", "textbox", "image", "html", "markdown"],
            samples=[
                [5, "hello", bus, "<b>Bold</b>", "**Bold**"],
                [15, "hi", bus, "<i>Italics</i>", "*Italics*"],
            ],
            type="index",
        )

        assert dataset.preprocess(1) == 1

        radio = gr.Radio(choices=[("name 1", "value 1"), ("name 2", "value 2")])
        dataset = gr.Dataset(samples=[["value 1"], ["value 2"]], components=[radio])
        assert dataset.samples == [["name 1"], ["name 2"]]

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
        x_video = VideoData(
            video=FileData(path=deepcopy(media_data.BASE64_VIDEO)["path"])
        )
        video_input = gr.Video()

        x_video = processing_utils.move_files_to_cache([x_video], video_input)[0]

        output1 = video_input.preprocess(x_video)
        assert isinstance(output1, str)
        output2 = video_input.preprocess(x_video)
        assert output1 == output2

        video_input = gr.Video(include_audio=False)
        output1 = video_input.preprocess(x_video)
        output2 = video_input.preprocess(x_video)
        assert output1 == output2

        video_input = gr.Video(label="Upload Your Video")
        assert video_input.get_config() == {
            "autoplay": False,
            "sources": ["webcam", "upload"],
            "name": "video",
            "show_share_button": False,
            "show_label": True,
            "label": "Upload Your Video",
            "container": True,
            "min_width": 160,
            "scale": None,
            "height": None,
            "width": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "value": None,
            "interactive": None,
            "proxy_url": None,
            "mirror_webcam": True,
            "include_audio": True,
            "format": None,
            "min_length": None,
            "max_length": None,
            "_selectable": False,
        }
        assert video_input.preprocess(None) is None
        video_input = gr.Video(format="avi")
        output_video = video_input.preprocess(x_video)
        assert output_video[-3:] == "avi"
        assert "flip" not in output_video

        # Output functionalities
        y_vid_path = "test/test_files/video_sample.mp4"
        subtitles_path = "test/test_files/s1.srt"
        video_output = gr.Video()
        output1 = video_output.postprocess(y_vid_path).model_dump()["video"]["path"]
        assert output1.endswith("mp4")
        output2 = video_output.postprocess(y_vid_path).model_dump()["video"]["path"]
        assert output1 == output2
        assert (
            video_output.postprocess(y_vid_path).model_dump()["video"]["orig_name"]
            == "video_sample.mp4"
        )
        output_with_subtitles = video_output.postprocess(
            (y_vid_path, subtitles_path)
        ).model_dump()
        assert output_with_subtitles["subtitles"]["path"].endswith(".vtt")

        p_video = gr.Video()
        video_with_subtitle = gr.Video()
        postprocessed_video = p_video.postprocess(Path(y_vid_path)).model_dump()
        postprocessed_video_with_subtitle = video_with_subtitle.postprocess(
            (Path(y_vid_path), Path(subtitles_path))
        ).model_dump()

        processed_video = {
            "video": {
                "path": "video_sample.mp4",
                "orig_name": "video_sample.mp4",
                "mime_type": None,
                "size": None,
                "url": None,
            },
            "subtitles": None,
        }

        processed_video_with_subtitle = {
            "video": {
                "path": "video_sample.mp4",
                "orig_name": "video_sample.mp4",
                "mime_type": None,
                "size": None,
                "url": None,
            },
            "subtitles": {
                "path": "s1.srt",
                "mime_type": None,
                "orig_name": None,
                "size": None,
                "url": None,
            },
        }
        postprocessed_video["video"]["path"] = os.path.basename(
            postprocessed_video["video"]["path"]
        )
        assert processed_video == postprocessed_video
        postprocessed_video_with_subtitle["video"]["path"] = os.path.basename(
            postprocessed_video_with_subtitle["video"]["path"]
        )
        if postprocessed_video_with_subtitle["subtitles"]["path"]:
            postprocessed_video_with_subtitle["subtitles"]["path"] = "s1.srt"
        assert processed_video_with_subtitle == postprocessed_video_with_subtitle

    def test_in_interface(self):
        """
        Interface, process
        """
        x_video = media_data.BASE64_VIDEO["path"]
        iface = gr.Interface(lambda x: x, "video", "playable_video")
        assert iface({"video": x_video})["video"].endswith(".mp4")

    def test_with_waveform(self):
        """
        Interface, process
        """
        x_audio = media_data.BASE64_AUDIO["path"]
        iface = gr.Interface(lambda x: gr.make_waveform(x), "audio", "video")
        assert iface(x_audio)["video"].endswith(".mp4")

    def test_video_postprocess_converts_to_playable_format(self):
        test_file_dir = Path(Path(__file__).parent, "test_files")
        # This file has a playable container but not playable codec
        with tempfile.NamedTemporaryFile(
            suffix="bad_video.mp4", delete=False
        ) as tmp_not_playable_vid:
            bad_vid = str(test_file_dir / "bad_video_sample.mp4")
            assert not processing_utils.video_is_playable(bad_vid)
            shutil.copy(bad_vid, tmp_not_playable_vid.name)
            output = gr.Video().postprocess(tmp_not_playable_vid.name).model_dump()
            assert processing_utils.video_is_playable(output["video"]["path"])

        # This file has a playable codec but not a playable container
        with tempfile.NamedTemporaryFile(
            suffix="playable_but_bad_container.mkv", delete=False
        ) as tmp_not_playable_vid:
            bad_vid = str(test_file_dir / "playable_but_bad_container.mkv")
            assert not processing_utils.video_is_playable(bad_vid)
            shutil.copy(bad_vid, tmp_not_playable_vid.name)
            output = gr.Video().postprocess(tmp_not_playable_vid.name).model_dump()
            assert processing_utils.video_is_playable(output["video"]["path"])

    @patch("pathlib.Path.exists", MagicMock(return_value=False))
    @patch("gradio.components.video.FFmpeg")
    def test_video_preprocessing_flips_video_for_webcam(self, mock_ffmpeg):
        # Ensures that the cached temp video file is not used so that ffmpeg is called for each test
        x_video = VideoData(video=FileData(path=media_data.BASE64_VIDEO["path"]))
        video_input = gr.Video(sources=["webcam"])
        _ = video_input.preprocess(x_video)

        # Dict mapping filename to FFmpeg options
        output_params = mock_ffmpeg.call_args_list[0][1]["outputs"]
        assert "hflip" in list(output_params.values())[0]
        assert "flip" in list(output_params.keys())[0]

        mock_ffmpeg.reset_mock()
        _ = gr.Video(
            sources=["webcam"], mirror_webcam=False, include_audio=True
        ).preprocess(x_video)
        mock_ffmpeg.assert_not_called()

        mock_ffmpeg.reset_mock()
        _ = gr.Video(sources=["upload"], format="mp4", include_audio=True).preprocess(
            x_video
        )
        mock_ffmpeg.assert_not_called()

        mock_ffmpeg.reset_mock()
        output_file = gr.Video(
            sources=["webcam"], mirror_webcam=True, format="avi"
        ).preprocess(x_video)
        output_params = mock_ffmpeg.call_args_list[0][1]["outputs"]
        assert "hflip" in list(output_params.values())[0]
        assert "flip" in list(output_params.keys())[0]
        assert ".avi" in list(output_params.keys())[0]
        assert ".avi" in output_file

        mock_ffmpeg.reset_mock()
        output_file = gr.Video(
            sources=["webcam"], mirror_webcam=False, format="avi", include_audio=False
        ).preprocess(x_video)
        output_params = mock_ffmpeg.call_args_list[0][1]["outputs"]
        assert list(output_params.values())[0] == ["-an"]
        assert "flip" not in Path(list(output_params.keys())[0]).name
        assert ".avi" in list(output_params.keys())[0]
        assert ".avi" in output_file


class TestNames:
    # This test ensures that `components.get_component_instance()` works correctly when instantiating from components
    def test_no_duplicate_uncased_names(self, io_components):
        unique_subclasses_uncased = {s.__name__.lower() for s in io_components}
        assert len(io_components) == len(unique_subclasses_uncased)


class TestLabel:
    def test_component_functions(self):
        """
        Process, postprocess, deserialize
        """
        y = "happy"
        label_output = gr.Label()
        label = label_output.postprocess(y).model_dump()
        assert label == {"label": "happy", "confidences": None}

        y = {3: 0.7, 1: 0.2, 0: 0.1}
        label = label_output.postprocess(y).model_dump()
        assert label == {
            "label": 3,
            "confidences": [
                {"label": 3, "confidence": 0.7},
                {"label": 1, "confidence": 0.2},
                {"label": 0, "confidence": 0.1},
            ],
        }
        label_output = gr.Label(num_top_classes=2)
        label = label_output.postprocess(y).model_dump()

        assert label == {
            "label": 3,
            "confidences": [
                {"label": 3, "confidence": 0.7},
                {"label": 1, "confidence": 0.2},
            ],
        }
        with pytest.raises(ValueError):
            label_output.postprocess([1, 2, 3]).model_dump()

        test_file_dir = Path(Path(__file__).parent, "test_files")
        path = str(Path(test_file_dir, "test_label_json.json"))
        label_dict = label_output.postprocess(path).model_dump()
        assert label_dict["label"] == "web site"

        assert label_output.get_config() == {
            "name": "label",
            "show_label": True,
            "num_top_classes": 2,
            "value": {},
            "label": None,
            "container": True,
            "min_width": 160,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "proxy_url": None,
            "color": None,
            "_selectable": False,
        }

    def test_color_argument(self):
        label = gr.Label(value=-10, color="red")
        assert label.get_config()["color"] == "red"

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
        output = iface(x_img)
        assert output == {
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
        value = [
            ("", None),
            ("Wolfgang", "PER"),
            (" lives in ", None),
            ("Berlin", "LOC"),
            ("", None),
        ]
        result = [
            {"token": "", "class_or_confidence": None},
            {"token": "Wolfgang", "class_or_confidence": "PER"},
            {"token": " lives in ", "class_or_confidence": None},
            {"token": "Berlin", "class_or_confidence": "LOC"},
            {"token": "", "class_or_confidence": None},
        ]
        result_ = component.postprocess(value).model_dump()
        assert result == result_

        text = "Wolfgang lives in Berlin"
        entities = [
            {"entity": "PER", "start": 0, "end": 8},
            {"entity": "LOC", "start": 18, "end": 24},
        ]
        result_ = component.postprocess(
            {"text": text, "entities": entities}
        ).model_dump()
        assert result == result_

        text = "Wolfgang lives in Berlin"
        entities = [
            {"entity_group": "PER", "start": 0, "end": 8},
            {"entity": "LOC", "start": 18, "end": 24},
        ]
        result_ = component.postprocess(
            {"text": text, "entities": entities}
        ).model_dump()
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
            {"token": "", "class_or_confidence": None},
            {"token": "Wolfgang", "class_or_confidence": "PER"},
            {"token": " lives in ", "class_or_confidence": None},
            {"token": "Berlin", "class_or_confidence": "LOC"},
        ]
        result_ = component.postprocess(
            {"text": text, "entities": entities}
        ).model_dump()
        assert result != result_
        assert result_after_merge != result_

        component = gr.HighlightedText(combine_adjacent=True)
        result_ = component.postprocess(
            {"text": text, "entities": entities}
        ).model_dump()
        assert result_after_merge == result_

        component = gr.HighlightedText()

        text = "Wolfgang lives in Berlin"
        entities = [
            {"entity": "LOC", "start": 18, "end": 24},
            {"entity": "PER", "start": 0, "end": 8},
        ]
        result_ = component.postprocess(
            {"text": text, "entities": entities}
        ).model_dump()
        assert result == result_

        text = "I live there"
        entities = []
        result_ = component.postprocess(
            {"text": text, "entities": entities}
        ).model_dump()
        assert [{"token": text, "class_or_confidence": None}] == result_

        text = "Wolfgang"
        entities = [
            {"entity": "PER", "start": 0, "end": 8},
        ]
        result_ = component.postprocess(
            {"text": text, "entities": entities}
        ).model_dump()
        assert [
            {"token": "", "class_or_confidence": None},
            {"token": text, "class_or_confidence": "PER"},
            {"token": "", "class_or_confidence": None},
        ] == result_

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
            "container": True,
            "min_width": 160,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "value": None,
            "proxy_url": None,
            "_selectable": False,
            "combine_adjacent": False,
            "adjacent_separator": "",
            "interactive": None,
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
        output = iface("Helloooo")
        assert output == [
            {"token": "H", "class_or_confidence": "non"},
            {"token": "e", "class_or_confidence": "vowel"},
            {"token": "ll", "class_or_confidence": "non"},
            {"token": "oooo", "class_or_confidence": "vowel"},
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
        result = component.postprocess(input).model_dump()

        base_img_out = PIL.Image.open(result["image"]["path"])

        assert result["annotations"][0]["label"] == "mask1"

        mask1_img_out = PIL.Image.open(result["annotations"][0]["image"]["path"])
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
            "container": True,
            "min_width": 160,
            "scale": None,
            "color_map": None,
            "height": None,
            "width": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "value": None,
            "proxy_url": None,
            "_selectable": False,
        }

    def test_in_interface(self):
        def mask(img):
            top_left_corner = [0, 0, 20, 20]
            random_mask = np.random.randint(0, 2, img.shape[:2])
            return (img, [(top_left_corner, "left corner"), (random_mask, "random")])

        iface = gr.Interface(mask, "image", gr.AnnotatedImage())
        output = iface("test/test_files/bus.png")
        output_img, (mask1, _) = output["image"], output["annotations"]
        input_img = PIL.Image.open("test/test_files/bus.png")
        output_img = PIL.Image.open(output_img)
        mask1_img = PIL.Image.open(mask1["image"])

        assert output_img.size == input_img.size
        assert mask1_img.size == input_img.size


class TestChatbot:
    def test_component_functions(self):
        """
        Postprocess, get_config
        """
        chatbot = gr.Chatbot()
        assert chatbot.postprocess(
            [["You are **cool**\nand fun", "so are *you*"]]
        ).model_dump() == [("You are **cool**\nand fun", "so are *you*")]

        multimodal_msg = [
            [("test/test_files/video_sample.mp4",), "cool video"],
            [("test/test_files/audio_sample.wav",), "cool audio"],
            [("test/test_files/bus.png", "A bus"), "cool pic"],
            [(Path("test/test_files/video_sample.mp4"),), "cool video"],
            [(Path("test/test_files/audio_sample.wav"),), "cool audio"],
            [(Path("test/test_files/bus.png"), "A bus"), "cool pic"],
        ]
        postprocessed_multimodal_msg = chatbot.postprocess(multimodal_msg).model_dump()
        for msg in postprocessed_multimodal_msg:
            assert "file" in msg[0]
            assert msg[1] in {"cool video", "cool audio", "cool pic"}
            assert msg[0]["file"]["path"].split(".")[-1] in {"mp4", "wav", "png"}
            if msg[0]["alt_text"]:
                assert msg[0]["alt_text"] == "A bus"

        assert chatbot.get_config() == {
            "value": [],
            "label": None,
            "show_label": True,
            "name": "chatbot",
            "show_share_button": False,
            "visible": True,
            "elem_id": None,
            "elem_classes": [],
            "container": True,
            "min_width": 160,
            "scale": None,
            "height": None,
            "proxy_url": None,
            "_selectable": False,
            "latex_delimiters": [{"display": True, "left": "$$", "right": "$$"}],
            "likeable": False,
            "rtl": False,
            "show_copy_button": False,
            "avatar_images": [None, None],
            "sanitize_html": True,
            "render_markdown": True,
            "bubble_full_width": True,
            "line_breaks": True,
            "layout": None,
        }

    def test_avatar_images_are_moved_to_cache(self):
        chatbot = gr.Chatbot(avatar_images=("test/test_files/bus.png", None))
        assert chatbot.avatar_images[0]
        assert utils.is_in_or_equal(chatbot.avatar_images[0], chatbot.GRADIO_CACHE)
        assert chatbot.avatar_images[1] is None


class TestJSON:
    def test_component_functions(self):
        """
        Postprocess
        """
        js_output = gr.JSON()
        assert js_output.postprocess('{"a":1, "b": 2}'), '"{\\"a\\":1, \\"b\\": 2}"'
        assert js_output.get_config() == {
            "container": True,
            "min_width": 160,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "value": None,
            "show_label": True,
            "label": None,
            "name": "json",
            "proxy_url": None,
            "_selectable": False,
        }

    def test_chatbot_selectable_in_config(self):
        with gr.Blocks() as demo:
            cb = gr.Chatbot(label="Chatbot")
            cb.like(lambda: print("foo"))
            gr.Chatbot(label="Chatbot2")

        assertion_count = 0
        for component in demo.config["components"]:
            if component["props"]["label"] == "Chatbot":
                assertion_count += 1
                assert component["props"]["likeable"]
            elif component["props"]["label"] == "Chatbot2":
                assertion_count += 1
                assert not component["props"]["likeable"]

        assert assertion_count == 2

    @pytest.mark.asyncio
    async def test_in_interface(self):
        """
        Interface, process
        """

        def get_avg_age_per_gender(data):
            return {
                "M": int(data[data["gender"] == "M"]["age"].mean()),
                "F": int(data[data["gender"] == "F"]["age"].mean()),
                "O": int(data[data["gender"] == "O"]["age"].mean()),
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
        assert html_component.get_config() == {
            "value": "#Welcome onboard",
            "label": "HTML Input",
            "show_label": True,
            "visible": True,
            "elem_id": None,
            "elem_classes": [],
            "proxy_url": None,
            "name": "html",
            "_selectable": False,
        }

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
        assert markdown_component.get_config()["value"] == "# Let's learn about $x$"

    def test_in_interface(self):
        """
        Interface, process
        """
        iface = gr.Interface(lambda x: x, "text", "markdown")
        input_data = "    Here's an [image](https://gradio.app/images/gradio_logo.png)"
        output_data = iface(input_data)
        assert output_data == input_data.strip()


class TestModel3D:
    def test_component_functions(self):
        """
        get_config
        """
        model_component = gr.components.Model3D(None, label="Model")
        assert model_component.get_config() == {
            "value": None,
            "clear_color": [0, 0, 0, 0],
            "label": "Model",
            "show_label": True,
            "container": True,
            "scale": None,
            "min_width": 160,
            "visible": True,
            "elem_id": None,
            "elem_classes": [],
            "proxy_url": None,
            "interactive": None,
            "name": "model3d",
            "camera_position": (None, None, None),
            "height": None,
            "zoom_speed": 1,
            "pan_speed": 1,
            "_selectable": False,
        }

        file = "test/test_files/Box.gltf"
        output1 = model_component.postprocess(file)
        output2 = model_component.postprocess(Path(file))
        assert output1
        assert output2
        assert Path(output1.path).name == Path(output2.path).name

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

        assert color_picker_input.get_config() == {
            "value": None,
            "show_label": True,
            "label": None,
            "container": True,
            "min_width": 160,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "interactive": None,
            "proxy_url": None,
            "name": "colorpicker",
            "info": None,
            "_selectable": False,
        }

    def test_in_interface_as_input(self):
        """
        Interface, process
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


class TestGallery:
    def test_postprocess(self):
        url = "https://huggingface.co/Norod78/SDXL-VintageMagStyle-Lora/resolve/main/Examples/00015-20230906102032-7778-Wonderwoman VintageMagStyle   _lora_SDXL-VintageMagStyle-Lora_1_, Very detailed, clean, high quality, sharp image.jpg"
        gallery = gr.Gallery([url])
        assert gallery.get_config()["value"][0]["image"]["path"] == url

    @patch("uuid.uuid4", return_value="my-uuid")
    def test_gallery(self, mock_uuid):
        gallery = gr.Gallery()
        test_file_dir = Path(Path(__file__).parent, "test_files")
        [
            client_utils.encode_file_to_base64(Path(test_file_dir, "bus.png")),
            client_utils.encode_file_to_base64(Path(test_file_dir, "cheetah1.jpg")),
        ]

        postprocessed_gallery = gallery.postprocess(
            [Path("test/test_files/bus.png")]
        ).model_dump()
        processed_gallery = [
            {
                "image": {
                    "path": "bus.png",
                    "orig_name": None,
                    "mime_type": None,
                    "size": None,
                    "url": None,
                },
                "caption": None,
            }
        ]
        postprocessed_gallery[0]["image"]["path"] = os.path.basename(
            postprocessed_gallery[0]["image"]["path"]
        )
        assert processed_gallery == postprocessed_gallery


class TestState:
    def test_as_component(self):
        state = gr.State(value=5)
        assert state.preprocess(10) == 10
        assert state.preprocess("abc") == "abc"
        assert state.stateful

    def test_initial_value_deepcopy(self):
        with pytest.raises(TypeError):
            gr.State(value=gr)  # modules are not deepcopyable

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


@patch(
    "gradio.components.Component.as_example", spec=gr.components.Component.as_example
)
@patch("gradio.components.Image.as_example", spec=gr.Image.as_example)
@patch("gradio.components.File.as_example", spec=gr.File.as_example)
@patch("gradio.components.Dataframe.as_example", spec=gr.DataFrame.as_example)
@patch("gradio.components.Model3D.as_example", spec=gr.Model3D.as_example)
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
        print(gr.ScatterPlot().get_config())
        assert gr.ScatterPlot().get_config() == {
            "caption": None,
            "elem_id": None,
            "elem_classes": [],
            "interactive": None,
            "label": None,
            "name": "plot",
            "bokeh_version": "3.0.3",
            "show_actions_button": False,
            "proxy_url": None,
            "show_label": True,
            "container": True,
            "min_width": 160,
            "scale": None,
            "value": None,
            "visible": True,
            "x": None,
            "y": None,
            "color": None,
            "size": None,
            "shape": None,
            "title": None,
            "tooltip": None,
            "x_title": None,
            "y_title": None,
            "color_legend_title": None,
            "size_legend_title": None,
            "shape_legend_title": None,
            "color_legend_position": None,
            "size_legend_position": None,
            "shape_legend_position": None,
            "height": None,
            "width": None,
            "x_lim": None,
            "y_lim": None,
            "x_label_angle": None,
            "y_label_angle": None,
            "_selectable": False,
        }

    def test_no_color(self):
        plot = gr.ScatterPlot(
            x="Horsepower",
            y="Miles_per_Gallon",
            tooltip="Name",
            title="Car Data",
            x_title="Horse",
        )
        output = plot.postprocess(cars).model_dump()
        assert sorted(output.keys()) == ["chart", "plot", "type"]
        config = json.loads(output["plot"])
        assert config["encoding"]["x"]["field"] == "Horsepower"
        assert config["encoding"]["x"]["title"] == "Horse"
        assert config["encoding"]["y"]["field"] == "Miles_per_Gallon"
        assert config["title"] == "Car Data"
        assert "height" not in config
        assert "width" not in config

    def test_no_interactive(self):
        plot = gr.ScatterPlot(
            x="Horsepower", y="Miles_per_Gallon", tooltip="Name", interactive=False
        )
        output = plot.postprocess(cars).model_dump()
        assert sorted(output.keys()) == ["chart", "plot", "type"]
        config = json.loads(output["plot"])
        assert "selection" not in config

    def test_height_width(self):
        plot = gr.ScatterPlot(
            x="Horsepower", y="Miles_per_Gallon", height=100, width=200
        )
        output = plot.postprocess(cars).model_dump()
        assert sorted(output.keys()) == ["chart", "plot", "type"]
        config = json.loads(output["plot"])
        assert config["height"] == 100
        assert config["width"] == 200

    def test_xlim_ylim(self):
        plot = gr.ScatterPlot(
            x="Horsepower", y="Miles_per_Gallon", x_lim=[200, 400], y_lim=[300, 500]
        )
        output = plot.postprocess(cars).model_dump()
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
        output = plot.postprocess(cars).model_dump()
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
        output = plot.postprocess(cars).model_dump()
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
        output = plot.postprocess(cars).model_dump()
        config = json.loads(output["plot"])
        assert config["encoding"]["color"]["legend"] is None
        assert config["encoding"]["shape"]["legend"] is None
        assert config["encoding"]["size"]["legend"] is None

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
            "elem_classes": [],
            "interactive": None,
            "label": None,
            "name": "plot",
            "bokeh_version": "3.0.3",
            "show_actions_button": False,
            "proxy_url": None,
            "show_label": True,
            "container": True,
            "min_width": 160,
            "scale": None,
            "value": None,
            "visible": True,
            "x": None,
            "y": None,
            "color": None,
            "stroke_dash": None,
            "overlay_point": None,
            "title": None,
            "tooltip": None,
            "x_title": None,
            "y_title": None,
            "color_legend_title": None,
            "stroke_dash_legend_title": None,
            "color_legend_position": None,
            "stroke_dash_legend_position": None,
            "height": None,
            "width": None,
            "x_lim": None,
            "y_lim": None,
            "x_label_angle": None,
            "y_label_angle": None,
            "_selectable": False,
        }

    def test_no_color(self):
        plot = gr.LinePlot(
            x="date",
            y="price",
            tooltip=["symbol", "price"],
            title="Stock Performance",
            x_title="Trading Day",
        )
        output = plot.postprocess(stocks).model_dump()
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
        output = plot.postprocess(stocks).model_dump()
        assert sorted(output.keys()) == ["chart", "plot", "type"]
        config = json.loads(output["plot"])
        assert config["height"] == 100
        assert config["width"] == 200

    def test_xlim_ylim(self):
        plot = gr.LinePlot(x="date", y="price", x_lim=[200, 400], y_lim=[300, 500])
        output = plot.postprocess(stocks).model_dump()
        config = json.loads(output["plot"])
        for layer in config["layer"]:
            assert layer["encoding"]["x"]["scale"] == {"domain": [200, 400]}
            assert layer["encoding"]["y"]["scale"] == {"domain": [300, 500]}

    def test_color_encoding(self):
        plot = gr.LinePlot(
            x="date", y="price", tooltip="symbol", color="symbol", overlay_point=True
        )
        output = plot.postprocess(stocks).model_dump()
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
            "elem_classes": [],
            "interactive": None,
            "label": None,
            "name": "plot",
            "bokeh_version": "3.0.3",
            "show_actions_button": False,
            "proxy_url": None,
            "show_label": True,
            "container": True,
            "min_width": 160,
            "scale": None,
            "value": None,
            "visible": True,
            "x": None,
            "y": None,
            "color": None,
            "vertical": True,
            "group": None,
            "title": None,
            "tooltip": None,
            "x_title": None,
            "y_title": None,
            "color_legend_title": None,
            "group_title": None,
            "color_legend_position": None,
            "height": None,
            "width": None,
            "y_lim": None,
            "x_label_angle": None,
            "y_label_angle": None,
            "sort": None,
            "_selectable": False,
        }

    def test_no_color(self):
        plot = gr.BarPlot(
            x="a",
            y="b",
            tooltip=["a", "b"],
            title="Made Up Bar Plot",
            x_title="Variable A",
            sort="x",
        )
        output = plot.postprocess(simple).model_dump()
        assert sorted(output.keys()) == ["chart", "plot", "type"]
        assert output["chart"] == "bar"
        config = json.loads(output["plot"])
        assert config["encoding"]["x"]["sort"] == "x"
        assert config["encoding"]["x"]["field"] == "a"
        assert config["encoding"]["x"]["title"] == "Variable A"
        assert config["encoding"]["y"]["field"] == "b"
        assert config["encoding"]["y"]["title"] == "b"

        assert config["title"] == "Made Up Bar Plot"
        assert "height" not in config
        assert "width" not in config

    def test_height_width(self):
        plot = gr.BarPlot(x="a", y="b", height=100, width=200)
        output = plot.postprocess(simple).model_dump()
        assert sorted(output.keys()) == ["chart", "plot", "type"]
        config = json.loads(output["plot"])
        assert config["height"] == 100
        assert config["width"] == 200

    def test_ylim(self):
        plot = gr.BarPlot(x="a", y="b", y_lim=[15, 100])
        output = plot.postprocess(simple).model_dump()
        config = json.loads(output["plot"])
        assert config["encoding"]["y"]["scale"] == {"domain": [15, 100]}

    def test_horizontal(self):
        output = gr.BarPlot(
            simple,
            x="a",
            y="b",
            x_title="Variable A",
            y_title="Variable B",
            title="Simple Bar Plot with made up data",
            tooltip=["a", "b"],
            vertical=False,
            y_lim=[20, 100],
        ).get_config()
        assert output["value"]["chart"] == "bar"
        config = json.loads(output["value"]["plot"])
        assert config["encoding"]["x"]["field"] == "b"
        assert config["encoding"]["x"]["scale"] == {"domain": [20, 100]}
        assert config["encoding"]["x"]["title"] == "Variable B"

        assert config["encoding"]["y"]["field"] == "a"
        assert config["encoding"]["y"]["title"] == "Variable A"

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

        assert code.get_config() == {
            "value": None,
            "language": None,
            "lines": 5,
            "name": "code",
            "show_label": True,
            "label": None,
            "container": True,
            "min_width": 160,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "interactive": None,
            "proxy_url": None,
            "_selectable": False,
        }


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
