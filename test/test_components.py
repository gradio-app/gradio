import filecmp
import json
import os
import pathlib
import shutil
import tempfile
import unittest
from copy import deepcopy
from difflib import SequenceMatcher
from unittest.mock import patch

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import PIL
import pytest
from scipy.io import wavfile

import gradio as gr
from gradio import media_data, processing_utils

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"

"""
Tests are divided into two
1. test_component_functions are unit tests that check essential functions of a component, the functions that are checked are documented in the docstring.
2. test_in_interface_... are functional tests that check a component's functionalities inside an Interface. Please do not use Interface.launch() in this file, as it slow downs the tests.
"""


class TestComponent(unittest.TestCase):
    def test_component_functions(self):
        """
        component
        """
        assert isinstance(gr.components.component("text"), gr.templates.Text)


def test_raise_warnings():
    for c_type, component in zip(
        ["inputs", "outputs"], [gr.inputs.Textbox, gr.outputs.Label]
    ):
        with pytest.warns(UserWarning, match=f"Usage of gradio.{c_type}"):
            component()


class TestTextbox(unittest.TestCase):
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, tokenize, generate_sample, get_config
        """
        text_input = gr.Textbox()
        self.assertEqual(text_input.preprocess("Hello World!"), "Hello World!")
        self.assertEqual(text_input.postprocess("Hello World!"), "Hello World!")
        self.assertEqual(text_input.postprocess(None), None)
        self.assertEqual(text_input.postprocess("Ali"), "Ali")
        self.assertEqual(text_input.postprocess(2), "2")
        self.assertEqual(text_input.postprocess(2.14), "2.14")
        self.assertEqual(text_input.serialize("Hello World!", True), "Hello World!")

        with self.assertWarns(Warning):
            _ = gr.Textbox(type="number")

        self.assertEqual(
            text_input.tokenize("Hello World! Gradio speaking."),
            (
                ["Hello", "World!", "Gradio", "speaking."],
                [
                    "World! Gradio speaking.",
                    "Hello Gradio speaking.",
                    "Hello World! speaking.",
                    "Hello World! Gradio",
                ],
                None,
            ),
        )
        text_input.interpretation_replacement = "unknown"
        self.assertEqual(
            text_input.tokenize("Hello World! Gradio speaking."),
            (
                ["Hello", "World!", "Gradio", "speaking."],
                [
                    "unknown World! Gradio speaking.",
                    "Hello unknown Gradio speaking.",
                    "Hello World! unknown speaking.",
                    "Hello World! Gradio unknown",
                ],
                None,
            ),
        )
        self.assertEqual(
            text_input.get_config(),
            {
                "lines": 1,
                "max_lines": 20,
                "placeholder": None,
                "value": "",
                "name": "textbox",
                "show_label": True,
                "label": None,
                "style": {},
                "elem_id": None,
                "visible": True,
                "interactive": None,
            },
        )
        self.assertIsInstance(text_input.generate_sample(), str)

    async def test_in_interface_as_input(self):
        """
        Interface, process, interpret,
        """
        iface = gr.Interface(lambda x: x[::-1], "textbox", "textbox")
        self.assertEqual(await iface(["Hello"]), ["olleH"])
        iface = gr.Interface(
            lambda sentence: max([len(word) for word in sentence.split()]),
            gr.Textbox(),
            "number",
            interpretation="default",
        )
        scores = await iface.interpret(
            ["Return the length of the longest word in this sentence"]
        )[0]["interpretation"]
        self.assertEqual(
            scores,
            [
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
            ],
        )

    async def test_in_interface_as_output(self):
        """
        Interface, process

        """
        iface = gr.Interface(lambda x: x[-1], "textbox", gr.Textbox())
        self.assertEqual(await iface(["Hello"]), ["o"])
        iface = gr.Interface(lambda x: x / 2, "number", gr.Textbox())
        self.assertEqual(iface([10]), ["5.0"])

    def test_static(self):
        """
        postprocess
        """
        component = gr.Textbox("abc")
        self.assertEqual(component.get_config().get("value"), "abc")


class TestNumber(unittest.TestCase):
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, generate_sample, set_interpret_parameters, get_interpretation_neighbors, get_config

        """
        numeric_input = gr.Number()
        self.assertEqual(numeric_input.preprocess(3), 3.0)
        self.assertEqual(numeric_input.preprocess(None), None)
        self.assertEqual(numeric_input.postprocess(3), 3)
        self.assertEqual(numeric_input.postprocess(3), 3.0)
        self.assertEqual(numeric_input.postprocess(2.14), 2.14)
        self.assertEqual(numeric_input.postprocess(None), None)
        self.assertEqual(numeric_input.serialize(3, True), 3)
        self.assertIsInstance(numeric_input.generate_sample(), float)
        numeric_input.set_interpret_parameters(steps=3, delta=1, delta_type="absolute")
        self.assertEqual(
            numeric_input.get_interpretation_neighbors(1),
            ([-2.0, -1.0, 0.0, 2.0, 3.0, 4.0], {}),
        )
        numeric_input.set_interpret_parameters(steps=3, delta=1, delta_type="percent")
        self.assertEqual(
            numeric_input.get_interpretation_neighbors(1),
            ([0.97, 0.98, 0.99, 1.01, 1.02, 1.03], {}),
        )
        self.assertEqual(
            numeric_input.get_config(),
            {
                "value": None,
                "name": "number",
                "show_label": True,
                "label": None,
                "style": {},
                "elem_id": None,
                "visible": True,
                "interactive": None,
            },
        )

    def test_component_functions_integer(self):
        """
        Preprocess, postprocess, serialize, generate_sample, set_interpret_parameters, get_interpretation_neighbors, get_template_context

        """
        numeric_input = gr.Number(precision=0, value=42)
        self.assertEqual(numeric_input.preprocess(3), 3)
        self.assertEqual(numeric_input.preprocess(None), None)
        self.assertEqual(numeric_input.postprocess(3), 3)
        self.assertEqual(numeric_input.postprocess(3), 3)
        self.assertEqual(numeric_input.postprocess(2.85), 3)
        self.assertEqual(numeric_input.postprocess(None), None)
        self.assertEqual(numeric_input.serialize(3, True), 3)
        self.assertIsInstance(numeric_input.generate_sample(), int)
        numeric_input.set_interpret_parameters(steps=3, delta=1, delta_type="absolute")
        self.assertEqual(
            numeric_input.get_interpretation_neighbors(1),
            ([-2.0, -1.0, 0.0, 2.0, 3.0, 4.0], {}),
        )
        numeric_input.set_interpret_parameters(steps=3, delta=1, delta_type="percent")
        self.assertEqual(
            numeric_input.get_interpretation_neighbors(100),
            ([97.0, 98.0, 99.0, 101.0, 102.0, 103.0], {}),
        )
        with self.assertRaises(ValueError) as error:
            numeric_input.get_interpretation_neighbors(1)
            assert error.msg == "Cannot generate valid set of neighbors"
        numeric_input.set_interpret_parameters(
            steps=3, delta=1.24, delta_type="absolute"
        )
        with self.assertRaises(ValueError) as error:
            numeric_input.get_interpretation_neighbors(4)
            assert error.msg == "Cannot generate valid set of neighbors"
        self.assertEqual(
            numeric_input.get_config(),
            {
                "value": 42,
                "name": "number",
                "show_label": True,
                "label": None,
                "style": {},
                "elem_id": None,
                "visible": True,
                "interactive": None,
            },
        )

    def test_component_functions_precision(self):
        """
        Preprocess, postprocess, serialize, generate_sample, set_interpret_parameters, get_interpretation_neighbors, get_template_context

        """
        numeric_input = gr.Number(precision=2, value=42.3428)
        self.assertEqual(numeric_input.preprocess(3.231241), 3.23)
        self.assertEqual(numeric_input.preprocess(None), None)
        self.assertEqual(numeric_input.postprocess(-42.1241), -42.12)
        self.assertEqual(numeric_input.postprocess(5.6784), 5.68)
        self.assertEqual(numeric_input.postprocess(2.1421), 2.14)
        self.assertEqual(numeric_input.postprocess(None), None)

    async def test_in_interface_as_input(self):
        """
        Interface, process, interpret
        """
        iface = gr.Interface(lambda x: x**2, "number", "textbox")
        self.assertEqual(iface([2]), ["4.0"])
        iface = gr.Interface(
            lambda x: x**2, "number", "number", interpretation="default"
        )
        scores = (await iface.interpret([2]))[0]["interpretation"]
        self.assertEqual(
            scores,
            [
                (1.94, -0.23640000000000017),
                (1.96, -0.15840000000000032),
                (1.98, -0.07960000000000012),
                [2, None],
                (2.02, 0.08040000000000003),
                (2.04, 0.16159999999999997),
                (2.06, 0.24359999999999982),
            ],
        )

    async def test_precision_0_in_interface(self):
        """
        Interface, process, interpret
        """
        iface = gr.Interface(lambda x: x**2, gr.Number(precision=0), "textbox")
        self.assertEqual(iface([2]), ["4"])
        iface = gr.Interface(
            lambda x: x**2, "number", gr.Number(precision=0), interpretation="default"
        )
        # Output gets rounded to 4 for all input so no change
        scores = (await iface.interpret([2]))[0]["interpretation"]
        self.assertEqual(
            scores,
            [
                (1.94, 0.0),
                (1.96, 0.0),
                (1.98, 0.0),
                [2, None],
                (2.02, 0.0),
                (2.04, 0.0),
                (2.06, 0.0),
            ],
        )

    async def test_in_interface_as_output(self):
        """
        Interface, process, interpret
        """
        iface = gr.Interface(lambda x: int(x) ** 2, "textbox", "number")
        self.assertEqual(iface([2]), [4.0])
        iface = gr.Interface(
            lambda x: x**2, "number", "number", interpretation="default"
        )
        scores = (await iface.interpret([2]))[0]["interpretation"]
        self.assertEqual(
            scores,
            [
                (1.94, -0.23640000000000017),
                (1.96, -0.15840000000000032),
                (1.98, -0.07960000000000012),
                [2, None],
                (2.02, 0.08040000000000003),
                (2.04, 0.16159999999999997),
                (2.06, 0.24359999999999982),
            ],
        )

    def test_static(self):
        """
        postprocess
        """
        component = gr.Number()
        self.assertEqual(component.get_config().get("value"), None)
        component = gr.Number(3)
        self.assertEqual(component.get_config().get("value"), 3.0)


class TestSlider(unittest.TestCase):
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, generate_sample, get_config
        """
        slider_input = gr.Slider()
        self.assertEqual(slider_input.preprocess(3.0), 3.0)
        self.assertEqual(slider_input.postprocess(3), 3)
        self.assertEqual(slider_input.postprocess(3), 3)
        self.assertEqual(slider_input.postprocess(None), 0)
        self.assertEqual(slider_input.serialize(3, True), 3)

        self.assertIsInstance(slider_input.generate_sample(), int)
        slider_input = gr.Slider(10, 20, value=15, step=1, label="Slide Your Input")
        self.assertEqual(
            slider_input.get_config(),
            {
                "minimum": 10,
                "maximum": 20,
                "step": 1,
                "value": 15,
                "name": "slider",
                "show_label": True,
                "label": "Slide Your Input",
                "style": {},
                "elem_id": None,
                "visible": True,
                "interactive": None,
            },
        )

    async def test_in_interface(self):
        """ "
        Interface, process, interpret
        """
        iface = gr.Interface(lambda x: x**2, "slider", "textbox")
        self.assertEqual(iface([2]), ["4"])
        iface = gr.Interface(
            lambda x: x**2, "slider", "number", interpretation="default"
        )
        scores = (await iface.interpret([2]))[0]["interpretation"]
        self.assertEqual(
            scores,
            [
                -4.0,
                200.08163265306123,
                812.3265306122449,
                1832.7346938775513,
                3261.3061224489797,
                5098.040816326531,
                7342.938775510205,
                9996.0,
            ],
        )

    def test_static(self):
        """
        postprocess
        """
        component = gr.Slider(0, 100, 5)
        self.assertEqual(component.get_config().get("value"), 5)
        component = gr.Slider(0, 100, None)
        self.assertEqual(component.get_config().get("value"), 0)

    @patch("gradio.Slider.get_random_value", return_value=7)
    def test_slider_get_random_value_on_load(self, mock_get_random_value):
        slider = gr.Slider(minimum=-5, maximum=10, randomize=True)
        assert slider.attach_load_event
        assert slider.value == 7
        assert slider.load_fn() == 7

    @patch("random.randint", return_value=3)
    def test_slider_rounds_when_using_default_randomizer(self, mock_randint):
        slider = gr.Slider(minimum=0, maximum=1, randomize=True, step=0.1)
        # If get_random_value didn't round, this test would fail
        # because 0.30000000000000004 != 0.3
        assert slider.get_random_value() == 0.3
        mock_randint.assert_called()


class TestCheckbox(unittest.TestCase):
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, generate_sample, get_config
        """
        bool_input = gr.Checkbox()
        self.assertEqual(bool_input.preprocess(True), True)
        self.assertEqual(bool_input.postprocess(True), True)
        self.assertEqual(bool_input.postprocess(True), True)
        self.assertEqual(bool_input.serialize(True, True), True)
        self.assertIsInstance(bool_input.generate_sample(), bool)
        bool_input = gr.Checkbox(value=True, label="Check Your Input")
        self.assertEqual(
            bool_input.get_config(),
            {
                "value": True,
                "name": "checkbox",
                "show_label": True,
                "label": "Check Your Input",
                "style": {},
                "elem_id": None,
                "visible": True,
                "interactive": None,
            },
        )

    async def test_in_interface(self):
        """
        Interface, process, interpret
        """
        iface = gr.Interface(lambda x: 1 if x else 0, "checkbox", "number")
        self.assertEqual(iface([True]), [1])
        iface = gr.Interface(
            lambda x: 1 if x else 0, "checkbox", "number", interpretation="default"
        )
        scores = (await iface.interpret([False]))[0]["interpretation"]
        self.assertEqual(scores, (None, 1.0))
        scores = (await iface.interpret([True]))[0]["interpretation"]
        self.assertEqual(scores, (-1.0, None))


class TestCheckboxGroup(unittest.TestCase):
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, generate_sample, get_config
        """
        checkboxes_input = gr.CheckboxGroup(["a", "b", "c"])
        self.assertEqual(checkboxes_input.preprocess(["a", "c"]), ["a", "c"])
        self.assertEqual(checkboxes_input.postprocess(["a", "c"]), ["a", "c"])
        self.assertEqual(checkboxes_input.serialize(["a", "c"], True), ["a", "c"])
        self.assertIsInstance(checkboxes_input.generate_sample(), list)
        checkboxes_input = gr.CheckboxGroup(
            value=["a", "c"],
            choices=["a", "b", "c"],
            label="Check Your Inputs",
        )
        self.assertEqual(
            checkboxes_input.get_config(),
            {
                "choices": ["a", "b", "c"],
                "value": ["a", "c"],
                "name": "checkboxgroup",
                "show_label": True,
                "label": "Check Your Inputs",
                "style": {},
                "elem_id": None,
                "visible": True,
                "interactive": None,
            },
        )
        with self.assertRaises(ValueError):
            wrong_type = gr.CheckboxGroup(["a"], type="unknown")
            wrong_type.preprocess(0)

    async def test_in_interface(self):
        """
        Interface, process
        """
        checkboxes_input = gr.CheckboxGroup(["a", "b", "c"])
        iface = gr.Interface(lambda x: "|".join(x), checkboxes_input, "textbox")
        self.assertEqual(await iface([["a", "c"]]), ["a|c"])
        self.assertEqual(await iface([[]]), [""])
        _ = gr.CheckboxGroup(["a", "b", "c"], type="index")


class TestRadio(unittest.TestCase):
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, generate_sample, get_config

        """
        radio_input = gr.Radio(["a", "b", "c"])
        self.assertEqual(radio_input.preprocess("c"), "c")
        self.assertEqual(radio_input.postprocess("a"), "a")
        self.assertEqual(radio_input.serialize("a", True), "a")
        self.assertIsInstance(radio_input.generate_sample(), str)
        radio_input = gr.Radio(
            choices=["a", "b", "c"], default="a", label="Pick Your One Input"
        )
        self.assertEqual(
            radio_input.get_config(),
            {
                "choices": ["a", "b", "c"],
                "value": None,
                "name": "radio",
                "show_label": True,
                "label": "Pick Your One Input",
                "style": {},
                "elem_id": None,
                "visible": True,
                "interactive": None,
            },
        )
        with self.assertRaises(ValueError):
            wrong_type = gr.Radio(["a", "b"], type="unknown")
            wrong_type.preprocess(0)

    async def test_in_interface(self):
        """
        Interface, process, interpret
        """
        radio_input = gr.Radio(["a", "b", "c"])
        iface = gr.Interface(lambda x: 2 * x, radio_input, "textbox")
        self.assertEqual(iface(["c"]), ["cc"])
        radio_input = gr.Radio(["a", "b", "c"], type="index")
        iface = gr.Interface(
            lambda x: 2 * x, radio_input, "number", interpretation="default"
        )
        self.assertEqual(iface(["c"]), [4])
        scores = (await iface.interpret(["b"]))[0]["interpretation"]
        self.assertEqual(scores, [-2.0, None, 2.0])


class TestImage(unittest.TestCase):
    async def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, generate_sample, get_config, _segment_by_slic
        type: pil, file, filepath, numpy
        """
        img = deepcopy(media_data.BASE64_IMAGE)
        image_input = gr.Image()
        self.assertEqual(image_input.preprocess(img).shape, (68, 61, 3))
        image_input = gr.Image(shape=(25, 25), image_mode="L")
        self.assertEqual(image_input.preprocess(img).shape, (25, 25))
        image_input = gr.Image(shape=(30, 10), type="pil")
        self.assertEqual(image_input.preprocess(img).size, (30, 10))
        self.assertEqual(image_input.postprocess("test/test_files/bus.png"), img)
        self.assertEqual(image_input.serialize("test/test_files/bus.png", True), img)

        self.assertIsInstance(image_input.generate_sample(), str)
        image_input = gr.Image(
            source="upload", tool="editor", type="pil", label="Upload Your Image"
        )
        self.assertEqual(
            image_input.get_config(),
            {
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
                "visible": True,
                "value": None,
                "interactive": None,
                "mirror_webcam": True,
            },
        )
        self.assertIsNone(image_input.preprocess(None))
        image_input = gr.Image(invert_colors=True)
        self.assertIsNotNone(image_input.preprocess(img))
        image_input.preprocess(img)
        with self.assertWarns(Warning):
            file_image = gr.Image(type="file")
            file_image.preprocess(deepcopy(media_data.BASE64_IMAGE))
        file_image = gr.Image(type="filepath")
        self.assertIsInstance(file_image.preprocess(img), str)
        with self.assertRaises(ValueError):
            wrong_type = gr.Image(type="unknown")
            wrong_type.preprocess(img)
        with self.assertRaises(ValueError):
            wrong_type = gr.Image(type="unknown")
            wrong_type.serialize("test/test_files/bus.png", False)
        img_pil = PIL.Image.open("test/test_files/bus.png")
        image_input = gr.Image(type="numpy")
        self.assertIsInstance(image_input.serialize(img_pil, False), str)
        image_input = gr.Image(type="pil")
        self.assertIsInstance(image_input.serialize(img_pil, False), str)
        image_input = gr.Image(type="file")
        with open("test/test_files/bus.png") as f:
            self.assertEqual(image_input.serialize(f, False), img)
        image_input.shape = (30, 10)
        self.assertIsNotNone(image_input._segment_by_slic(img))

        # Output functionalities
        y_img = gr.processing_utils.decode_base64_to_image(
            deepcopy(media_data.BASE64_IMAGE)
        )
        image_output = gr.Image()
        self.assertTrue(
            image_output.postprocess(y_img).startswith(
                "data:image/png;base64,iVBORw0KGgoAAA"
            )
        )
        self.assertTrue(
            image_output.postprocess(np.array(y_img)).startswith(
                "data:image/png;base64,iVBORw0KGgoAAA"
            )
        )
        with self.assertRaises(ValueError):
            image_output.postprocess([1, 2, 3])
        image_output = gr.Image(type="numpy")
        self.assertTrue(
            image_output.postprocess(y_img).startswith("data:image/png;base64,")
        )

    async def test_in_interface_as_input(self):
        """
        Interface, process, interpret
        type: file
        interpretation: default, shap,
        """
        img = deepcopy(media_data.BASE64_IMAGE)
        image_input = gr.Image()
        iface = gr.Interface(
            lambda x: PIL.Image.open(x).rotate(90, expand=True),
            gr.Image(shape=(30, 10), type="file"),
            "image",
        )
        output = (await iface([img]))[0]
        self.assertEqual(
            gr.processing_utils.decode_base64_to_image(output).size, (10, 30)
        )
        iface = gr.Interface(
            lambda x: np.sum(x), image_input, "number", interpretation="default"
        )
        scores = (await iface.interpret([img]))[0]["interpretation"]
        self.assertEqual(
            scores, deepcopy(media_data.SUM_PIXELS_INTERPRETATION)["scores"][0]
        )
        iface = gr.Interface(
            lambda x: np.sum(x), image_input, "label", interpretation="shap"
        )
        scores = (await iface.interpret([img]))[0]["interpretation"]
        self.assertEqual(
            len(scores[0]),
            len(deepcopy(media_data.SUM_PIXELS_SHAP_INTERPRETATION)["scores"][0][0]),
        )
        image_input = gr.Image(shape=(30, 10))
        iface = gr.Interface(
            lambda x: np.sum(x), image_input, "number", interpretation="default"
        )
        self.assertIsNotNone(await iface.interpret([img]))

    async def test_in_interface_as_output(self):
        """
        Interface, process
        """

        def generate_noise(width, height):
            return np.random.randint(0, 256, (width, height, 3))

        iface = gr.Interface(generate_noise, ["slider", "slider"], "image")
        self.assertTrue((await iface([10, 20]))[0].startswith("data:image/png;base64"))

    def test_static(self):
        """
        postprocess
        """
        component = gr.Image("test/test_files/bus.png")
        self.assertEqual(component.get_config().get("value"), media_data.BASE64_IMAGE)
        component = gr.Image(None)
        self.assertEqual(component.get_config().get("value"), None)


class TestPlot(unittest.TestCase):
    async def test_in_interface_as_output(self):
        """
        Interface, process
        """

        def plot(num):
            fig = plt.figure()
            plt.plot(range(num), range(num))
            return fig

        iface = gr.Interface(plot, "slider", "plot")
        output = (await iface([10]))[0]
        self.assertEqual(output["type"], "matplotlib")
        self.assertTrue(output["plot"].startswith("data:image/png;base64"))

    def test_static(self):
        """
        postprocess
        """
        fig = plt.figure()
        plt.plot([1, 2, 3], [1, 2, 3])

        component = gr.Plot(fig)
        self.assertNotEqual(component.get_config().get("value"), None)
        component = gr.Plot(None)
        self.assertEqual(component.get_config().get("value"), None)


class TestAudio(unittest.TestCase):
    def test_component_functions(self):
        """
        Preprocess, postprocess serialize, generate_sample, get_config, deserialize
        type: filepath, numpy, file
        """
        x_wav = deepcopy(media_data.BASE64_AUDIO)
        audio_input = gr.Audio()
        output = audio_input.preprocess(x_wav)
        self.assertEqual(output[0], 8000)
        self.assertEqual(output[1].shape, (8046,))
        assert filecmp.cmp(
            "test/test_files/audio_sample.wav",
            audio_input.serialize("test/test_files/audio_sample.wav")["name"],
        )

        self.assertIsInstance(audio_input.generate_sample(), dict)
        audio_input = gr.Audio(label="Upload Your Audio")
        self.assertEqual(
            audio_input.get_config(),
            {
                "source": "upload",
                "name": "audio",
                "streaming": False,
                "show_label": True,
                "label": "Upload Your Audio",
                "style": {},
                "elem_id": None,
                "visible": True,
                "value": None,
                "interactive": None,
            },
        )
        self.assertIsNone(audio_input.preprocess(None))
        x_wav["is_example"] = True
        x_wav["crop_min"], x_wav["crop_max"] = 1, 4
        self.assertIsNotNone(audio_input.preprocess(x_wav))

        audio_input = gr.Audio(type="filepath")
        self.assertIsInstance(audio_input.preprocess(x_wav), str)
        with self.assertRaises(ValueError):
            audio_input = gr.Audio(type="unknown")
            audio_input.preprocess(x_wav)
            audio_input.serialize(x_wav)
        audio_input = gr.Audio(type="numpy")

        # Output functionalities
        y_audio = gr.processing_utils.decode_base64_to_file(
            deepcopy(media_data.BASE64_AUDIO)["data"]
        )
        audio_output = gr.Audio(type="file")
        self.assertTrue(
            filecmp.cmp(y_audio.name, audio_output.postprocess(y_audio.name)["name"])
        )
        self.assertEqual(
            audio_output.get_config(),
            {
                "name": "audio",
                "streaming": False,
                "show_label": True,
                "label": None,
                "source": "upload",
                "style": {},
                "elem_id": None,
                "visible": True,
                "value": None,
                "interactive": None,
            },
        )
        self.assertTrue(
            audio_output.deserialize(
                {
                    "name": None,
                    "data": deepcopy(media_data.BASE64_AUDIO)["data"],
                    "is_file": False,
                }
            ).endswith(".wav")
        )

    def test_tokenize(self):
        """
        Tokenize, get_masked_inputs
        """
        x_wav = deepcopy(media_data.BASE64_AUDIO)
        audio_input = gr.Audio()
        tokens, _, _ = audio_input.tokenize(x_wav)
        self.assertEqual(len(tokens), audio_input.interpretation_segments)
        x_new = audio_input.get_masked_inputs(tokens, [[1] * len(tokens)])[0]
        similarity = SequenceMatcher(a=x_wav["data"], b=x_new).ratio()
        self.assertGreater(similarity, 0.9)

    async def test_in_interface(self):
        def reverse_audio(audio):
            sr, data = audio
            return (sr, np.flipud(data))

        iface = gr.Interface(reverse_audio, "audio", "audio")
        reversed_data = (await iface([deepcopy(media_data.BASE64_AUDIO)]))[0]
        reversed_input = {"name": "fake_name", "data": reversed_data}
        self.assertTrue(reversed_data.startswith("data:audio/wav;base64,UklGRgA/"))
        self.assertTrue(
            (await iface([deepcopy(media_data.BASE64_AUDIO)]))[0].startswith(
                "data:audio/wav;base64,UklGRgA/"
            )
        )
        self.maxDiff = None
        reversed_reversed_data = (await iface([reversed_input]))[0]
        similarity = SequenceMatcher(
            a=reversed_reversed_data, b=media_data.BASE64_AUDIO["data"]
        ).ratio()
        self.assertGreater(similarity, 0.99)

    async def test_in_interface_as_output(self):
        """
        Interface, process
        """

        def generate_noise(duration):
            return 48000, np.random.randint(-256, 256, (duration, 3)).astype(np.int16)

        iface = gr.Interface(generate_noise, "slider", "audio")
        self.assertTrue((await iface([100]))[0].startswith("data:audio/wav;base64"))

    def test_audio_preprocess_can_be_read_by_scipy(self):
        x_wav = deepcopy(media_data.BASE64_MICROPHONE)
        audio_input = gr.Audio(type="filepath")
        output = audio_input.preprocess(x_wav)
        wavfile.read(output)


class TestFile(unittest.TestCase):
    def test_component_functions(self):
        """
        Preprocess, serialize, generate_sample, get_config, value
        """
        x_file = deepcopy(media_data.BASE64_FILE)
        file_input = gr.File()
        output = file_input.preprocess(x_file)
        self.assertIsInstance(output, tempfile._TemporaryFileWrapper)
        serialized = file_input.serialize("test/test_files/sample_file.pdf")
        assert filecmp.cmp(
            serialized["name"],
            "test/test_files/sample_file.pdf",
        )
        assert serialized["orig_name"] == "sample_file.pdf"
        assert output.orig_name == "test/test_files/sample_file.pdf"

        self.assertIsInstance(file_input.generate_sample(), dict)
        file_input = gr.File(label="Upload Your File")
        self.assertEqual(
            file_input.get_config(),
            {
                "file_count": "single",
                "name": "file",
                "show_label": True,
                "label": "Upload Your File",
                "style": {},
                "elem_id": None,
                "visible": True,
                "value": None,
                "interactive": None,
            },
        )
        self.assertIsNone(file_input.preprocess(None))
        x_file["is_example"] = True
        self.assertIsNotNone(file_input.preprocess(x_file))

    async def test_in_interface_as_input(self):
        """
        Interface, process
        """
        x_file = deepcopy(media_data.BASE64_FILE)

        def get_size_of_file(file_obj):
            return os.path.getsize(file_obj.name)

        iface = gr.Interface(get_size_of_file, "file", "number")
        self.assertEqual(await iface([[x_file]]), [10558])

    async def test_as_component_as_output(self):
        """
        Interface, process
        """

        def write_file(content):
            with open("test.txt", "w") as f:
                f.write(content)
            return "test.txt"

        iface = gr.Interface(write_file, "text", "file")
        self.assertDictEqual(
            (await iface(["hello world"]))[0],
            {
                "name": "test.txt",
                "size": 11,
                "data": "data:text/plain;base64,aGVsbG8gd29ybGQ=",
            },
        )


class TestDataframe(unittest.TestCase):
    def test_component_functions(self):
        """
        Preprocess, serialize, generate_sample, get_config
        """
        x_data = {
            "data": [["Tim", 12, False], ["Jan", 24, True]],
            "headers": ["Name", "Age", "Member"],
        }
        dataframe_input = gr.Dataframe(headers=["Name", "Age", "Member"])
        output = dataframe_input.preprocess(x_data)
        self.assertEqual(output["Age"][1], 24)
        self.assertEqual(output["Member"][0], False)
        self.assertEqual(dataframe_input.postprocess(x_data), x_data)

        self.assertIsInstance(dataframe_input.generate_sample(), list)
        dataframe_input = gr.Dataframe(
            headers=["Name", "Age", "Member"], label="Dataframe Input"
        )
        self.assertEqual(
            dataframe_input.get_config(),
            {
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
                "visible": True,
                "interactive": None,
                "wrap": False,
            },
        )
        dataframe_input = gr.Dataframe()
        output = dataframe_input.preprocess(x_data)
        self.assertEqual(output["Age"][1], 24)
        with self.assertRaises(ValueError):
            wrong_type = gr.Dataframe(type="unknown")
            wrong_type.preprocess(x_data)

        dataframe_output = gr.Dataframe()
        self.assertEqual(
            dataframe_output.get_config(),
            {
                "headers": [1, 2, 3],
                "max_rows": 20,
                "max_cols": None,
                "overflow_row_behaviour": "paginate",
                "name": "dataframe",
                "show_label": True,
                "label": None,
                "style": {},
                "elem_id": None,
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
                "wrap": False,
            },
        )

    def test_postprocess(self):
        """
        postprocess
        """
        dataframe_output = gr.Dataframe()
        output = dataframe_output.postprocess(np.zeros((2, 2)))
        self.assertDictEqual(output, {"data": [[0, 0], [0, 0]], "headers": [1, 2]})
        output = dataframe_output.postprocess([[1, 3, 5]])
        self.assertDictEqual(output, {"data": [[1, 3, 5]], "headers": [1, 2, 3]})
        output = dataframe_output.postprocess(
            pd.DataFrame([[2, True], [3, True], [4, False]], columns=["num", "prime"])
        )
        self.assertDictEqual(
            output,
            {
                "headers": ["num", "prime"],
                "data": [[2, True], [3, True], [4, False]],
            },
        )
        with self.assertRaises(ValueError):
            wrong_type = gr.Dataframe(type="unknown")
            wrong_type.postprocess(0)

        # When the headers don't match the data
        dataframe_output = gr.Dataframe(headers=["one", "two", "three"])
        output = dataframe_output.postprocess([[2, True], [3, True]])
        self.assertDictEqual(
            output,
            {
                "headers": ["one", "two"],
                "data": [[2, True], [3, True]],
            },
        )
        dataframe_output = gr.Dataframe(headers=["one", "two", "three"])
        output = dataframe_output.postprocess([[2, True, "ab", 4], [3, True, "cd", 5]])
        self.assertDictEqual(
            output,
            {
                "headers": ["one", "two", "three", 4],
                "data": [[2, True, "ab", 4], [3, True, "cd", 5]],
            },
        )

    async def test_in_interface_as_input(self):
        """
        Interface, process,
        """
        x_data = {"data": [[1, 2, 3], [4, 5, 6]]}
        iface = gr.Interface(np.max, "numpy", "number")
        self.assertEqual(await iface([x_data]), [6])
        x_data = {"data": [["Tim"], ["Jon"], ["Sal"]], "headers": [1, 2, 3]}

        def get_last(my_list):
            return my_list[-1][-1]

        iface = gr.Interface(get_last, "list", "text")
        self.assertEqual(await iface([x_data]), ["Sal"])

    async def test_in_interface_as_output(self):
        """
        Interface, process
        """

        def check_odd(array):
            return array % 2 == 0

        iface = gr.Interface(check_odd, "numpy", "numpy")
        self.assertEqual(
            (await iface([{"data": [[2, 3, 4]]}]))[0],
            {"data": [[True, False, True]], "headers": [1, 2, 3]},
        )

    def test_dataframe_postprocess_all_types(self):
        df = pd.DataFrame(
            {
                "date_1": pd.date_range("2021-01-01", periods=2),
                "date_2": pd.date_range("2022-02-15", periods=2).strftime(
                    "%B %d, %Y, %r"
                ),
                "number": np.array([0.2233, 0.57281]),
                "number_2": np.array([84, 23]).astype(np.int),
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
        test_file_dir = pathlib.Path(pathlib.Path(__file__).parent, "test_files")
        bus = pathlib.Path(test_file_dir, "bus.png")

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
        test_file_dir = pathlib.Path(pathlib.Path(__file__).parent, "test_files")
        bus = pathlib.Path(test_file_dir, "bus.png")

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


class TestVideo(unittest.TestCase):
    def test_component_functions(self):
        """
        Preprocess, serialize, deserialize, generate_sample, get_config
        """
        x_video = deepcopy(media_data.BASE64_VIDEO)
        video_input = gr.Video()
        output = video_input.preprocess(x_video)
        self.assertIsInstance(output, str)

        self.assertIsInstance(video_input.generate_sample(), dict)
        video_input = gr.Video(label="Upload Your Video")
        self.assertEqual(
            video_input.get_config(),
            {
                "source": "upload",
                "name": "video",
                "show_label": True,
                "label": "Upload Your Video",
                "style": {},
                "elem_id": None,
                "visible": True,
                "value": None,
                "interactive": None,
                "mirror_webcam": True,
            },
        )
        self.assertIsNone(video_input.preprocess(None))
        x_video["is_example"] = True
        self.assertIsNotNone(video_input.preprocess(x_video))
        video_input = gr.Video(format="avi")
        self.assertEqual(video_input.preprocess(x_video)[-3:], "avi")

        assert filecmp.cmp(
            video_input.serialize(x_video["name"])["name"], x_video["name"]
        )

        # Output functionalities
        y_vid_path = "test/test_files/video_sample.mp4"
        video_output = gr.Video()
        self.assertTrue(video_output.postprocess(y_vid_path)["name"].endswith("mp4"))
        self.assertTrue(
            video_output.deserialize(
                {
                    "name": None,
                    "data": deepcopy(media_data.BASE64_VIDEO)["data"],
                    "is_file": False,
                }
            ).endswith(".mp4")
        )

    async def test_in_interface(self):
        """
        Interface, process
        """
        x_video = deepcopy(media_data.BASE64_VIDEO)
        iface = gr.Interface(lambda x: x, "video", "playable_video")
        self.assertEqual((await iface([x_video]))[0]["data"], x_video["data"])

    def test_video_postprocess_converts_to_playable_format(self):
        test_file_dir = pathlib.Path(pathlib.Path(__file__).parent, "test_files")
        # This file has a playable container but not playable codec
        with tempfile.NamedTemporaryFile(
            suffix="bad_video.mp4"
        ) as tmp_not_playable_vid:
            bad_vid = str(test_file_dir / "bad_video_sample.mp4")
            assert not processing_utils.video_is_playable(bad_vid)
            shutil.copy(bad_vid, tmp_not_playable_vid.name)
            _ = gr.Video().postprocess(tmp_not_playable_vid.name)
            # The original video gets converted to .mp4 format
            full_path_to_output = pathlib.Path(tmp_not_playable_vid.name).with_suffix(
                ".mp4"
            )
            assert processing_utils.video_is_playable(str(full_path_to_output))

        # This file has a playable codec but not a playable container
        with tempfile.NamedTemporaryFile(
            suffix="playable_but_bad_container.mkv"
        ) as tmp_not_playable_vid:
            bad_vid = str(test_file_dir / "playable_but_bad_container.mkv")
            assert not processing_utils.video_is_playable(bad_vid)
            shutil.copy(bad_vid, tmp_not_playable_vid.name)
            _ = gr.Video().postprocess(tmp_not_playable_vid.name)
            full_path_to_output = pathlib.Path(tmp_not_playable_vid.name).with_suffix(
                ".mp4"
            )
            assert processing_utils.video_is_playable(str(full_path_to_output))


class TestTimeseries(unittest.TestCase):
    def test_component_functions(self):
        """
        Preprocess, postprocess,  generate_sample, get_config,
        """
        timeseries_input = gr.Timeseries(x="time", y=["retail", "food", "other"])
        x_timeseries = {
            "data": [[1] + [2] * len(timeseries_input.y)] * 4,
            "headers": [timeseries_input.x] + timeseries_input.y,
        }
        output = timeseries_input.preprocess(x_timeseries)
        self.assertIsInstance(output, pd.core.frame.DataFrame)

        self.assertIsInstance(timeseries_input.generate_sample(), dict)
        timeseries_input = gr.Timeseries(
            x="time", y="retail", label="Upload Your Timeseries"
        )
        self.assertEqual(
            timeseries_input.get_config(),
            {
                "x": "time",
                "y": ["retail"],
                "name": "timeseries",
                "show_label": True,
                "label": "Upload Your Timeseries",
                "colors": None,
                "style": {},
                "elem_id": None,
                "visible": True,
                "value": None,
                "interactive": None,
            },
        )
        self.assertIsNone(timeseries_input.preprocess(None))
        x_timeseries["range"] = (0, 1)
        self.assertIsNotNone(timeseries_input.preprocess(x_timeseries))

        # Output functionalities

        timeseries_output = gr.Timeseries(label="Disease")

        self.assertEqual(
            timeseries_output.get_config(),
            {
                "x": None,
                "y": None,
                "name": "timeseries",
                "show_label": True,
                "label": "Disease",
                "colors": None,
                "style": {},
                "elem_id": None,
                "visible": True,
                "value": None,
                "interactive": None,
            },
        )
        data = {"Name": ["Tom", "nick", "krish", "jack"], "Age": [20, 21, 19, 18]}
        df = pd.DataFrame(data)
        self.assertEqual(
            timeseries_output.postprocess(df),
            {
                "headers": ["Name", "Age"],
                "data": [["Tom", 20], ["nick", 21], ["krish", 19], ["jack", 18]],
            },
        )

        timeseries_output = gr.Timeseries(y="Age", label="Disease")
        output = timeseries_output.postprocess(df)
        self.assertEqual(
            output,
            {
                "headers": ["Name", "Age"],
                "data": [["Tom", 20], ["nick", 21], ["krish", 19], ["jack", 18]],
            },
        )

    async def test_in_interface_as_input(self):
        """
        Interface, process
        """
        timeseries_input = gr.Timeseries(x="time", y=["retail", "food", "other"])
        x_timeseries = {
            "data": [[1] + [2] * len(timeseries_input.y)] * 4,
            "headers": [timeseries_input.x] + timeseries_input.y,
        }
        iface = gr.Interface(lambda x: x, timeseries_input, "dataframe")
        self.assertEqual(
            await iface([x_timeseries]),
            [
                {
                    "headers": ["time", "retail", "food", "other"],
                    "data": [
                        [1, 2, 2, 2],
                        [1, 2, 2, 2],
                        [1, 2, 2, 2],
                        [1, 2, 2, 2],
                    ],
                }
            ],
        )

    async def test_in_interface_as_output(self):
        """
        Interface, process
        """
        timeseries_output = gr.Timeseries(x="time", y=["retail", "food", "other"])
        iface = gr.Interface(lambda x: x, "dataframe", timeseries_output)
        df = {
            "data": pd.DataFrame(
                {
                    "time": [1, 2, 3, 4],
                    "retail": [1, 2, 3, 2],
                    "food": [1, 2, 3, 2],
                    "other": [1, 2, 4, 2],
                }
            )
        }
        self.assertEqual(
            await iface([df]),
            [
                {
                    "headers": ["time", "retail", "food", "other"],
                    "data": [
                        [1, 1, 1, 1],
                        [2, 2, 2, 2],
                        [3, 3, 3, 4],
                        [4, 2, 2, 2],
                    ],
                }
            ],
        )


class TestNames(unittest.TestCase):
    # This test ensures that `components.get_component_instance()` works correctly when instantiating from components
    def test_no_duplicate_uncased_names(self):
        subclasses = gr.components.Component.__subclasses__()
        unique_subclasses_uncased = set([s.__name__.lower() for s in subclasses])
        self.assertEqual(len(subclasses), len(unique_subclasses_uncased))


class TestLabel(unittest.TestCase):
    def test_component_functions(self):
        """
        Process, postprocess, deserialize
        """
        y = "happy"
        label_output = gr.Label()
        label = label_output.postprocess(y)
        self.assertDictEqual(label, {"label": "happy"})
        self.assertEqual(json.load(open(label_output.deserialize(label))), label)

        y = {3: 0.7, 1: 0.2, 0: 0.1}
        label = label_output.postprocess(y)
        self.assertDictEqual(
            label,
            {
                "label": 3,
                "confidences": [
                    {"label": 3, "confidence": 0.7},
                    {"label": 1, "confidence": 0.2},
                    {"label": 0, "confidence": 0.1},
                ],
            },
        )
        label_output = gr.Label(num_top_classes=2)
        label = label_output.postprocess(y)

        self.assertDictEqual(
            label,
            {
                "label": 3,
                "confidences": [
                    {"label": 3, "confidence": 0.7},
                    {"label": 1, "confidence": 0.2},
                ],
            },
        )
        with self.assertRaises(ValueError):
            label_output.postprocess([1, 2, 3])

        test_file_dir = pathlib.Path(pathlib.Path(__file__).parent, "test_files")
        path = str(pathlib.Path(test_file_dir, "test_label_json.json"))
        label = label_output.postprocess(path)
        self.assertEqual(label["label"], "web site")

        self.assertEqual(
            label_output.get_config(),
            {
                "name": "label",
                "show_label": True,
                "num_top_classes": 2,
                "value": None,
                "label": None,
                "style": {},
                "elem_id": None,
                "visible": True,
                "interactive": None,
            },
        )

    async def test_in_interface(self):
        """
        Interface, process
        """
        x_img = deepcopy(media_data.BASE64_IMAGE)

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
        output = (await iface([x_img]))[0]
        self.assertDictEqual(
            output,
            {
                "label": "red",
                "confidences": [
                    {"label": "red", "confidence": 0.44},
                    {"label": "green", "confidence": 0.28},
                    {"label": "blue", "confidence": 0.28},
                ],
            },
        )


class TestHighlightedText(unittest.TestCase):
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
        self.assertEqual(result, result_)

        text = "Wolfgang lives in Berlin"
        entities = [
            {"entity": "PER", "start": 0, "end": 8},
            {"entity": "LOC", "start": 18, "end": 24},
        ]
        result_ = component.postprocess({"text": text, "entities": entities})
        self.assertEqual(result, result_)

        text = "Wolfgang lives in Berlin"
        entities = [
            {"entity": "LOC", "start": 18, "end": 24},
            {"entity": "PER", "start": 0, "end": 8},
        ]
        result_ = component.postprocess({"text": text, "entities": entities})
        self.assertEqual(result, result_)

        text = "I live there"
        entities = []
        result_ = component.postprocess({"text": text, "entities": entities})
        self.assertEqual([(text, None)], result_)

        text = "Wolfgang"
        entities = [
            {"entity": "PER", "start": 0, "end": 8},
        ]
        result_ = component.postprocess({"text": text, "entities": entities})
        self.assertEqual([("", None), (text, "PER"), ("", None)], result_)

    def test_component_functions(self):
        """
        get_config
        """
        ht_output = gr.HighlightedText(color_map={"pos": "green", "neg": "red"})
        self.assertEqual(
            ht_output.get_config(),
            {
                "color_map": {"pos": "green", "neg": "red"},
                "name": "highlightedtext",
                "show_label": True,
                "label": None,
                "show_legend": False,
                "style": {},
                "elem_id": None,
                "visible": True,
                "value": None,
                "interactive": None,
            },
        )

    async def test_in_interface(self):
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
        self.assertListEqual(
            (await iface(["Helloooo"]))[0],
            [("H", "non"), ("e", "vowel"), ("ll", "non"), ("oooo", "vowel")],
        )


class TestJSON(unittest.TestCase):
    def test_component_functions(self):
        """
        Postprocess
        """
        js_output = gr.JSON()
        self.assertTrue(
            js_output.postprocess('{"a":1, "b": 2}'), '"{\\"a\\":1, \\"b\\": 2}"'
        )
        self.assertEqual(
            js_output.get_config(),
            {
                "style": {},
                "elem_id": None,
                "visible": True,
                "value": None,
                "show_label": True,
                "label": None,
                "name": "json",
                "interactive": None,
            },
        )

    async def test_in_interface(self):
        """
        Interface, process
        """

        def get_avg_age_per_gender(data):
            print(data)
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
        self.assertDictEqual(
            (await iface([{"data": y_data, "headers": ["gender", "age"]}]))[0],
            {"M": 35, "F": 25, "O": 20},
        )


class TestHTML(unittest.TestCase):
    def test_component_functions(self):
        """
        get_config
        """
        html_component = gr.components.HTML("#Welcome onboard", label="HTML Input")
        self.assertEqual(
            {
                "style": {},
                "elem_id": None,
                "visible": True,
                "value": "#Welcome onboard",
                "show_label": True,
                "label": "HTML Input",
                "name": "html",
                "interactive": None,
            },
            html_component.get_config(),
        )

    async def test_in_interface(self):
        """
        Interface, process
        """

        def bold_text(text):
            return "<strong>" + text + "</strong>"

        iface = gr.Interface(bold_text, "text", "html")
        self.assertEqual((await iface(["test"]))[0], "<strong>test</strong>")


class TestModel3D(unittest.TestCase):
    def test_component_functions(self):
        """
        get_config
        """
        component = gr.components.Model3D(None, label="Model")
        self.assertEqual(
            {
                "clearColor": [0.2, 0.2, 0.2, 1.0],
                "value": None,
                "label": "Model",
                "show_label": True,
                "interactive": None,
                "name": "model3d",
                "visible": True,
                "elem_id": None,
                "style": {},
            },
            component.get_config(),
        )

    async def test_in_interface(self):
        """
        Interface, process
        """
        iface = gr.Interface(lambda x: x, "model3d", "model3d")
        input_data = gr.media_data.BASE64_MODEL3D["data"]
        output_data = (await iface([{"name": "Box.gltf", "data": input_data}]))[0][
            "data"
        ]
        self.assertEqual(input_data.split(";")[1], output_data.split(";")[1])


class TestColorPicker(unittest.TestCase):
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, tokenize, generate_sample, get_config
        """
        color_picker_input = gr.ColorPicker()
        self.assertEqual(color_picker_input.preprocess("#000000"), "#000000")
        self.assertEqual(color_picker_input.postprocess("#000000"), "#000000")
        self.assertEqual(color_picker_input.postprocess(None), None)
        self.assertEqual(color_picker_input.postprocess("#FFFFFF"), "#FFFFFF")
        self.assertEqual(color_picker_input.serialize("#000000", True), "#000000")

        color_picker_input.interpretation_replacement = "unknown"

        self.assertEqual(
            color_picker_input.get_config(),
            {
                "value": None,
                "show_label": True,
                "label": None,
                "style": {},
                "elem_id": None,
                "visible": True,
                "interactive": None,
                "name": "colorpicker",
            },
        )
        self.assertIsInstance(color_picker_input.generate_sample(), str)

    async def test_in_interface_as_input(self):
        """
        Interface, process, interpret,
        """
        iface = gr.Interface(lambda x: x, "colorpicker", "colorpicker")
        self.assertEqual(await iface(["#000000"]), ["#000000"])

    async def test_in_interface_as_output(self):
        """
        Interface, process

        """
        iface = gr.Interface(lambda x: x, "colorpicker", gr.ColorPicker())
        self.assertEqual(await iface(["#000000"]), ["#000000"])

    def test_static(self):
        """
        postprocess
        """
        component = gr.ColorPicker("#000000")
        self.assertEqual(component.get_config().get("value"), "#000000")


class TestCarousel:
    def test_deprecation(self):
        test_file_dir = pathlib.Path(pathlib.Path(__file__).parent, "test_files")
        with pytest.raises(DeprecationWarning):
            gr.Carousel([pathlib.Path(test_file_dir, "bus.png")])

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
        test_file_dir = pathlib.Path(pathlib.Path(__file__).parent, "test_files")
        data = [
            gr.processing_utils.encode_file_to_base64(
                pathlib.Path(test_file_dir, "bus.png")
            ),
            gr.processing_utils.encode_file_to_base64(
                pathlib.Path(test_file_dir, "cheetah1.jpg")
            ),
        ]

        with tempfile.TemporaryDirectory() as tmpdir:
            path = gallery.deserialize(data, tmpdir)
            assert path.endswith("my-uuid")
            data_restored = gallery.serialize(path)
            assert sorted(data) == sorted([d["data"] for d in data_restored])


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


@pytest.mark.parametrize("component", [gr.Model3D, gr.File])
def test_as_example_returns_file_basename(component):
    component = component()
    assert component.as_example("/home/freddy/sources/example.ext") == "example.ext"


@patch("gradio.components.IOComponent.as_example")
@patch("gradio.components.File.as_example")
@patch("gradio.components.Dataframe.as_example")
@patch("gradio.components.Model3D.as_example")
def test_dataset_calls_as_example(*mocks):
    gr.Dataset(
        components=[gr.Dataframe(), gr.File(), gr.Image(), gr.Model3D()],
        samples=[
            [
                pd.DataFrame({"a": np.array([1, 2, 3])}),
                "foo.png",
                "bar.jpeg",
                "duck.obj",
            ]
        ],
    )
    assert all([m.called for m in mocks])


if __name__ == "__main__":
    unittest.main()
