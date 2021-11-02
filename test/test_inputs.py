from re import sub
import unittest
import gradio as gr
import PIL
import numpy as np
import pandas
from pydub import AudioSegment
import os
import tempfile
import json


class TestTextbox(unittest.TestCase):
    def test_as_component(self):
        text_input = gr.inputs.Textbox()
        self.assertEqual(text_input.preprocess("Hello World!"), "Hello World!")
        self.assertEqual(text_input.preprocess_example("Hello World!"), "Hello World!")
        self.assertEqual(text_input.serialize("Hello World!", True), "Hello World!")
        to_save = text_input.save_flagged("flagged", "text_input", "Hello World!", None)
        self.assertEqual(to_save, "Hello World!")
        restored = text_input.restore_flagged("Hello World!")
        self.assertEqual(restored, "Hello World!")
        self.assertIsInstance(text_input.generate_sample(), str)

    def test_in_interface(self):
        iface = gr.Interface(lambda x: x[::-1], "textbox", "textbox")
        self.assertEqual(iface.process(["Hello"])[0], ["olleH"])
        iface = gr.Interface(lambda sentence: max([len(word) for word in sentence.split()]), gr.inputs.Textbox(),
                             gr.outputs.Textbox(), interpretation="default")
        scores, alternative_outputs = iface.interpret(["Return the length of the longest word in this sentence"])
        self.assertEqual(scores, [[('Return', 0.0), (' ', 0), ('the', 0.0), (' ', 0), ('length', 0.0), (' ', 0),
                                   ('of', 0.0), (' ', 0), ('the', 0.0), (' ', 0), ('longest', 0.0), (' ', 0),
                                   ('word', 0.0), (' ', 0), ('in', 0.0), (' ', 0), ('this', 0.0), (' ', 0),
                                   ('sentence', 1.0), (' ', 0)]])
        self.assertEqual(alternative_outputs, [[['8'], ['8'], ['8'], ['8'], ['8'], ['8'], ['8'], ['8'], ['8'], ['7']]])


class TestNumber(unittest.TestCase):
    def test_as_component(self):
        numeric_input = gr.inputs.Number()
        self.assertEqual(numeric_input.preprocess(3), 3.0)
        self.assertEqual(numeric_input.preprocess_example(3), 3)
        self.assertEqual(numeric_input.serialize(3, True), 3)
        to_save = numeric_input.save_flagged("flagged", "numeric_input", 3, None)
        self.assertEqual(to_save, 3)
        restored = numeric_input.restore_flagged(3)
        self.assertEqual(restored, 3)
        self.assertIsInstance(numeric_input.generate_sample(), float)

    def test_in_interface(self):
        iface = gr.Interface(lambda x: x**2, "number", "textbox")
        self.assertEqual(iface.process([2])[0], ['4.0'])
        iface = gr.Interface(lambda x: x**2, "number", "textbox", interpretation="default")
        scores, alternative_outputs = iface.interpret([2])
        self.assertEqual(scores, [[(1.94, -0.23640000000000017), (1.96, -0.15840000000000032),
                                    (1.98, -0.07960000000000012), [2, None], (2.02, 0.08040000000000003),
                                    (2.04, 0.16159999999999997), (2.06, 0.24359999999999982)]])
        self.assertEqual(alternative_outputs, [[['3.7636'], ['3.8415999999999997'], ['3.9204'], ['4.0804'], ['4.1616'],
                                                ['4.2436']]])


class TestSlider(unittest.TestCase):
    def test_as_component(self):
        slider_input = gr.inputs.Slider()
        self.assertEqual(slider_input.preprocess(3.0), 3.0)
        self.assertEqual(slider_input.preprocess_example(3), 3)
        self.assertEqual(slider_input.serialize(3, True), 3)
        to_save = slider_input.save_flagged("flagged", "slider_input", 3, None)
        self.assertEqual(to_save, 3)
        restored = slider_input.restore_flagged(3)
        self.assertEqual(restored, 3)
        self.assertIsInstance(slider_input.generate_sample(), int)

    def test_in_interface(self):
        iface = gr.Interface(lambda x: x**2, "slider", "textbox")
        self.assertEqual(iface.process([2])[0], ['4'])
        iface = gr.Interface(lambda x: x**2, "slider", "textbox", interpretation="default")
        scores, alternative_outputs = iface.interpret([2])
        self.assertEqual(scores, [[-4.0, 200.08163265306123, 812.3265306122449, 1832.7346938775513, 3261.3061224489797,
                                   5098.040816326531, 7342.938775510205, 9996.0]])
        self.assertEqual(alternative_outputs, [[['0.0'], ['204.08163265306123'], ['816.3265306122449'],
                                                ['1836.7346938775513'], ['3265.3061224489797'], ['5102.040816326531'],
                                                ['7346.938775510205'], ['10000.0']]])


class TestCheckbox(unittest.TestCase):
    def test_as_component(self):
        bool_input = gr.inputs.Checkbox()
        self.assertEqual(bool_input.preprocess(True), True)
        self.assertEqual(bool_input.preprocess_example(True), True)
        self.assertEqual(bool_input.serialize(True, True), True)
        to_save = bool_input.save_flagged("flagged", "bool_input", True, None)
        self.assertEqual(to_save, True)
        restored = bool_input.restore_flagged(True)
        self.assertEqual(restored, True)
        self.assertIsInstance(bool_input.generate_sample(), bool)

    def test_in_interface(self):
        iface = gr.Interface(lambda x: 1 if x else 0, "checkbox", "textbox")
        self.assertEqual(iface.process([True])[0], ['1'])
        iface = gr.Interface(lambda x: 1 if x else 0, "checkbox", "textbox", interpretation="default")
        scores, alternative_outputs = iface.interpret([False])
        self.assertEqual(scores, [(None, 1.0)])
        self.assertEqual(alternative_outputs, [[['1']]])


class TestCheckboxGroup(unittest.TestCase):
    def test_as_component(self):
        checkboxes_input = gr.inputs.CheckboxGroup(["a", "b", "c"])
        self.assertEqual(checkboxes_input.preprocess(["a", "c"]), ["a", "c"])
        self.assertEqual(checkboxes_input.preprocess_example(["a", "c"]), ["a", "c"])
        self.assertEqual(checkboxes_input.serialize(["a", "c"], True), ["a", "c"])
        to_save = checkboxes_input.save_flagged("flagged", "checkboxes_input", ["a", "c"], None)
        self.assertEqual(to_save, '["a", "c"]')
        restored = checkboxes_input.restore_flagged('["a", "c"]')
        self.assertEqual(restored, ["a", "c"])
        self.assertIsInstance(checkboxes_input.generate_sample(), list)

    def test_in_interface(self):
        checkboxes_input = gr.inputs.CheckboxGroup(["a", "b", "c"])
        iface = gr.Interface(lambda x: "|".join(x), checkboxes_input, "textbox")
        self.assertEqual(iface.process([["a", "c"]])[0], ["a|c"])
        self.assertEqual(iface.process([[]])[0], [""])
        checkboxes_input = gr.inputs.CheckboxGroup(["a", "b", "c"], type="index")
        iface = gr.Interface(lambda x: "|".join(map(str, x)), checkboxes_input, "textbox", interpretation="default")
        self.assertEqual(iface.process([["a", "c"]])[0], ["0|2"])
        scores, alternative_outputs = iface.interpret([["a", "c"]])
        self.assertEqual(scores, [[[-1, None], [None, -1], [-1, None]]])
        self.assertEqual(alternative_outputs, [[['2'], ['0|2|1'], ['0']]])


class TestRadio(unittest.TestCase):
    def test_as_component(self):
        radio_input = gr.inputs.Radio(["a", "b", "c"])
        self.assertEqual(radio_input.preprocess("c"), "c")
        self.assertEqual(radio_input.preprocess_example("a"), "a")
        self.assertEqual(radio_input.serialize("a", True), "a")
        to_save = radio_input.save_flagged("flagged", "radio_input", "a", None)
        self.assertEqual(to_save, 'a')
        restored = radio_input.restore_flagged("a")
        self.assertEqual(restored, "a")
        self.assertIsInstance(radio_input.generate_sample(), str)

    def test_in_interface(self):
        radio_input = gr.inputs.Radio(["a", "b", "c"])
        iface = gr.Interface(lambda x: 2 * x, radio_input, "textbox")
        self.assertEqual(iface.process(["c"])[0], ["cc"])
        radio_input = gr.inputs.Radio(["a", "b", "c"], type="index")
        iface = gr.Interface(lambda x: 2 * x, radio_input, "number", interpretation="default")
        self.assertEqual(iface.process(["c"])[0], [4])
        scores, alternative_outputs = iface.interpret(["b"])
        self.assertEqual(scores, [[-2.0, None, 2.0]])
        self.assertEqual(alternative_outputs, [[[0], [4]]])


class TestDropdown(unittest.TestCase):
    def test_as_component(self):
        dropdown_input = gr.inputs.Dropdown(["a", "b", "c"])
        self.assertEqual(dropdown_input.preprocess("c"), "c")
        self.assertEqual(dropdown_input.preprocess_example("a"), "a")
        self.assertEqual(dropdown_input.serialize("a", True), "a")
        to_save = dropdown_input.save_flagged("flagged", "dropdown_input", "a", None)
        self.assertEqual(to_save, 'a')
        restored = dropdown_input.restore_flagged("a")
        self.assertEqual(restored, "a")
        self.assertIsInstance(dropdown_input.generate_sample(), str)

    def test_in_interface(self):
        dropdown_input = gr.inputs.Dropdown(["a", "b", "c"])
        iface = gr.Interface(lambda x: 2 * x, dropdown_input, "textbox")
        self.assertEqual(iface.process(["c"])[0], ["cc"])
        dropdown = gr.inputs.Dropdown(["a", "b", "c"], type="index")
        iface = gr.Interface(lambda x: 2 * x, dropdown, "number", interpretation="default")
        self.assertEqual(iface.process(["c"])[0], [4])
        scores, alternative_outputs = iface.interpret(["b"])
        self.assertEqual(scores, [[-2.0, None, 2.0]])
        self.assertEqual(alternative_outputs, [[[0], [4]]])


class TestImage(unittest.TestCase):
    def test_as_component(self):
        img = gr.test_data.BASE64_IMAGE
        image_input = gr.inputs.Image()
        self.assertEqual(image_input.preprocess(img).shape, (68, 61, 3))
        image_input = gr.inputs.Image(image_mode="L", shape=(25, 25))
        self.assertEqual(image_input.preprocess(img).shape, (25, 25))
        image_input = gr.inputs.Image(shape=(30, 10), type="pil")
        self.assertEqual(image_input.preprocess(img).size, (30, 10))
        self.assertEqual(image_input.preprocess_example("test/test_files/bus.png"), img)
        self.assertEqual(image_input.serialize("test/test_files/bus.png", True), img)
        to_save = image_input.save_flagged("flagged", "image_input", img, None)
        self.assertTrue("image_input/" in to_save)
        restored = image_input.restore_flagged("test/test_files/bus.png")
        self.assertEqual(restored, "test/test_files/bus.png")
        self.assertIsInstance(image_input.generate_sample(), str)

    def test_in_interface(self):
        img = gr.test_data.BASE64_IMAGE
        image_input = gr.inputs.Image()
        iface = gr.Interface(lambda x: PIL.Image.open(x).rotate(90, expand=True),
                             gr.inputs.Image(shape=(30, 10), type="file"), "image")
        output = iface.process([img])[0][0]
        self.assertEqual(gr.processing_utils.decode_base64_to_image(output).size, (10, 30))
        iface = gr.Interface(lambda x: np.sum(x), image_input, "textbox", interpretation="default")
        scores, alternative_outputs = iface.interpret([img])
        self.assertEqual(scores, gr.test_data.SUM_PIXELS_INTERPRETATION["scores"])
        self.assertEqual(alternative_outputs, gr.test_data.SUM_PIXELS_INTERPRETATION["alternative_outputs"])


class TestAudio(unittest.TestCase):
    def test_as_component(self):
        x_wav = gr.test_data.BASE64_AUDIO
        audio_input = gr.inputs.Audio()
        output = audio_input.preprocess(x_wav)
        self.assertEqual(output[0], 8000)
        self.assertEqual(output[1].shape, (8046,))
        self.assertEqual(audio_input.preprocess_example("test/test_files/audio_sample.wav"), x_wav["data"])
        self.assertEqual(audio_input.serialize("test/test_files/audio_sample.wav", True)["data"], x_wav["data"])
        to_save = audio_input.save_flagged("flagged", "audio_input", x_wav["data"], None)
        self.assertTrue("audio_input/" in to_save)
        restored = audio_input.restore_flagged("test/test_files/audio_sample.wav")
        self.assertEqual(restored, "test/test_files/audio_sample.wav")
        self.assertIsInstance(audio_input.generate_sample(), dict)

    def test_in_interface(self):
        x_wav = gr.test_data.BASE64_AUDIO

        def max_amplitude_from_wav_file(wav_file):
            audio_segment = AudioSegment.from_file(wav_file.name)
            data = np.array(audio_segment.get_array_of_samples())
            return np.max(data)
        iface = gr.Interface(
            max_amplitude_from_wav_file,
            gr.inputs.Audio(type="file"),
            "number", interpretation="default")
        self.assertEqual(iface.process([x_wav])[0], [5239])
        # scores, alternative_outputs = iface.interpret([x_wav])
        # self.assertEqual(scores, ... )
        # self.assertEqual(alternative_outputs, ...)


class TestFile(unittest.TestCase):
    def test_as_component(self):
        x_file = gr.test_data.BASE64_FILE
        file_input = gr.inputs.File()
        output = file_input.preprocess(x_file)
        self.assertIsInstance(output, tempfile._TemporaryFileWrapper)
        self.assertEqual(file_input.preprocess_example(x_file), x_file)
        self.assertEqual(file_input.serialize("test/test_files/sample_file.pdf", True), 'test/test_files/sample_file.pdf')
        to_save = file_input.save_flagged("flagged", "file_input", x_file, None)
        self.assertTrue("file_input/" in to_save)
        restored = file_input.restore_flagged("test/test_files/sample_file.pdf")
        self.assertEqual(restored, "test/test_files/sample_file.pdf")
        self.assertIsInstance(file_input.generate_sample(), dict)

    def test_in_interface(self):
        x_file = gr.test_data.BASE64_FILE

        def get_size_of_file(file_obj):
            return os.path.getsize(file_obj.name)
        iface = gr.Interface(
            get_size_of_file, "file", "number")
        self.assertEqual(iface.process([[x_file]])[0], [10558])


class TestDataframe(unittest.TestCase):
    def test_as_component(self):
        x_data = [["Tim", 12, False], ["Jan", 24, True]]
        dataframe_input = gr.inputs.Dataframe(headers=["Name","Age","Member"])
        output = dataframe_input.preprocess(x_data)
        self.assertEqual(output["Age"][1], 24)
        self.assertEqual(output["Member"][0], False)
        self.assertEqual(dataframe_input.preprocess_example(x_data), x_data)
        self.assertEqual(dataframe_input.serialize(x_data, True), x_data)
        to_save = dataframe_input.save_flagged("flagged", "dataframe_input", x_data, None)
        self.assertEqual(json.dumps(x_data), to_save)
        restored = dataframe_input.restore_flagged(to_save)
        self.assertEqual(x_data, restored)
        self.assertIsInstance(dataframe_input.generate_sample(), list)

    def test_in_interface(self):
        x_data = [[1, 2, 3], [4, 5, 6]]
        iface = gr.Interface(np.max, "numpy", "number")
        self.assertEqual(iface.process([x_data])[0], [6])
        x_data = [["Tim"], ["Jon"], ["Sal"]]

        def get_last(l):
            return l[-1]
        iface = gr.Interface(get_last, "list", "text")
        self.assertEqual(iface.process([x_data])[0], ["Sal"])


class TestVideo(unittest.TestCase):
    def test_as_component(self):
        x_video = gr.test_data.BASE64_VIDEO
        video_input = gr.inputs.Video()
        output = video_input.preprocess(x_video)
        self.assertIsInstance(output, str)
        self.assertEqual(video_input.preprocess_example("test/test_files/video_sample.mp4"), x_video["data"])
        to_save = video_input.save_flagged("flagged", "video_input", x_video["data"], None)
        self.assertTrue("video_input/" in to_save)
        restored = video_input.restore_flagged("test/test_files/video_sample.mp4")
        self.assertEqual(restored, "test/test_files/video_sample.mp4")
        self.assertIsInstance(video_input.generate_sample(), dict)

    def test_in_interface(self):
        x_video = gr.test_data.BASE64_VIDEO
        iface = gr.Interface(
            lambda x:x,
            "video",
            "playable_video")
        self.assertEqual(iface.process([x_video])[0][0]["data"], x_video["data"])


class TestTimeseries(unittest.TestCase):
    def test_as_component(self):
        timeseries_input = gr.inputs.Timeseries(
            x="time",
            y=["retail", "food", "other"]
        )
        x_timeseries = {"data": [[1] + [2] * len(timeseries_input.y)] * 4, "headers": [timeseries_input.x] +
                                                                                      timeseries_input.y}
        output = timeseries_input.preprocess(x_timeseries)
        self.assertIsInstance(output, pandas.core.frame.DataFrame)
        self.assertEqual(timeseries_input.preprocess_example(x_timeseries), x_timeseries)
        to_save = timeseries_input.save_flagged("flagged", "video_input", x_timeseries, None)
        self.assertEqual(json.dumps(x_timeseries), to_save)
        restored = timeseries_input.restore_flagged(to_save)
        self.assertEqual(x_timeseries, restored)
        self.assertIsInstance(timeseries_input.generate_sample(), dict)

    def test_in_interface(self):
        timeseries_input = gr.inputs.Timeseries(
            x="time",
            y=["retail", "food", "other"]
        )
        x_timeseries = {"data": [[1] + [2] * len(timeseries_input.y)] * 4, "headers": [timeseries_input.x] +
                                                                                      timeseries_input.y}
        iface = gr.Interface(
            lambda x: x,
            timeseries_input,
            "dataframe")
        self.assertEqual(iface.process([x_timeseries])[0], [{'headers': ['time', 'retail', 'food', 'other'],
                                                                 'data': [[1, 2, 2, 2], [1, 2, 2, 2], [1, 2, 2, 2],
                                                                          [1, 2, 2, 2]]}])


class TestNames(unittest.TestCase):
    def test_no_duplicate_uncased_names(self):  # this ensures that get_input_instance() works correctly when instantiating from components
        subclasses = gr.inputs.InputComponent.__subclasses__()
        unique_subclasses_uncased = set([s.__name__.lower() for s in subclasses])
        self.assertEqual(len(subclasses), len(unique_subclasses_uncased))


if __name__ == '__main__':
    unittest.main()
