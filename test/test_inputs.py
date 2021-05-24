import unittest
import gradio as gr
import PIL
import numpy as np
import scipy
import os

class TestTextbox(unittest.TestCase):
    def test_in_interface(self):
        iface = gr.Interface(lambda x: x[::-1], "textbox", "textbox")
        self.assertEqual(iface.process(["Hello"])[0], ["olleH"])

class TestNumber(unittest.TestCase):
    def test_in_interface(self):
        iface = gr.Interface(lambda x: x[::-1], "textbox", "textbox")
        self.assertEqual(iface.process(["Hello"])[0], ["olleH"])
        iface = gr.Interface(lambda x: x*x, "number", "number")
        self.assertEqual(iface.process([5])[0], [25])

class TestSlider(unittest.TestCase):
    def test_in_interface(self):
        iface = gr.Interface(lambda x: str(x) + " cats", "slider", "textbox")
        self.assertEqual(iface.process([4])[0], ["4 cats"])


class TestCheckbox(unittest.TestCase):
    def test_in_interface(self):
        iface = gr.Interface(lambda x: "yes" if x else "no", "checkbox", "textbox")
        self.assertEqual(iface.process([False])[0], ["no"])


class TestCheckboxGroup(unittest.TestCase):
    def test_in_interface(self):
        checkboxes = gr.inputs.CheckboxGroup(["a", "b", "c"])
        iface = gr.Interface(lambda x: "|".join(x), checkboxes, "textbox")
        self.assertEqual(iface.process([["a", "c"]])[0], ["a|c"])
        self.assertEqual(iface.process([[]])[0], [""])
        checkboxes = gr.inputs.CheckboxGroup(["a", "b", "c"], type="index")
        iface = gr.Interface(lambda x: "|".join(map(str, x)), checkboxes, "textbox")
        self.assertEqual(iface.process([["a", "c"]])[0], ["0|2"])


class TestRadio(unittest.TestCase):
    def test_in_interface(self):
        radio = gr.inputs.Radio(["a", "b", "c"])
        iface = gr.Interface(lambda x: 2 * x, radio, "textbox")
        self.assertEqual(iface.process(["c"])[0], ["cc"])
        radio = gr.inputs.Radio(["a", "b", "c"], type="index")
        iface = gr.Interface(lambda x: 2 * x, radio, "number")
        self.assertEqual(iface.process(["c"])[0], [4])


class TestDropdown(unittest.TestCase):
    def test_in_interface(self):
        dropdown = gr.inputs.Dropdown(["a", "b", "c"])
        iface = gr.Interface(lambda x: 2 * x, dropdown, "textbox")
        self.assertEqual(iface.process(["c"])[0], ["cc"])
        dropdown = gr.inputs.Dropdown(["a", "b", "c"], type="index")
        iface = gr.Interface(lambda x: 2 * x, dropdown, "number")
        self.assertEqual(iface.process(["c"])[0], [4])


class TestImage(unittest.TestCase):
    def test_as_component(self):
        x_img = gr.test_data.BASE64_IMAGE
        image_input = gr.inputs.Image()
        self.assertEqual(image_input.preprocess(x_img).shape, (68, 61 ,3))
        image_input = gr.inputs.Image(image_mode="L", shape=(25, 25))
        self.assertEqual(image_input.preprocess(x_img).shape, (25, 25))
        image_input = gr.inputs.Image(shape=(30, 10), type="pil")
        self.assertEqual(image_input.preprocess(x_img).size, (30, 10))


    def test_in_interface(self):
        x_img = gr.test_data.BASE64_IMAGE
        
        def open_and_rotate(img_file):
            img = PIL.Image.open(img_file)
            return img.rotate(90, expand=True)

        iface = gr.Interface(
            open_and_rotate, 
            gr.inputs.Image(shape=(30, 10), type="file"),
            "image")
        output = iface.process([x_img])[0][0][0]
        self.assertEqual(gr.processing_utils.decode_base64_to_image(output).size, (10, 30))
        

class TestAudio(unittest.TestCase):
    def test_as_component(self):
        x_wav = gr.test_data.BASE64_AUDIO
        audio_input = gr.inputs.Audio()
        output = audio_input.preprocess(x_wav)
        self.assertEqual(output[0], 8000)
        self.assertEqual(output[1].shape, (8046,))

    def test_in_interface(self):
        x_wav = gr.test_data.BASE64_AUDIO
        def max_amplitude_from_wav_file(wav_file):
            _, data = scipy.io.wavfile.read(wav_file.name)
            return np.max(data)

        iface = gr.Interface(
            max_amplitude_from_wav_file, 
            gr.inputs.Audio(type="file"),
            "number")
        self.assertEqual(iface.process([x_wav])[0], [5239])

class TestFile(unittest.TestCase):
    def test_in_interface(self):
        x_file = {
            "name": "audio.wav",
            "data": gr.test_data.BASE64_AUDIO,
            "is_local_example": False
        }
        def get_size_of_file(file_obj):
            return os.path.getsize(file_obj.name)

        iface = gr.Interface(
            get_size_of_file, "file", "number")
        self.assertEqual(iface.process([[x_file]])[0], [16362])


class TestDataframe(unittest.TestCase):
    def test_as_component(self):
        x_data = [["Tim",12,False],["Jan",24,True]]
        dataframe_input = gr.inputs.Dataframe(headers=["Name","Age","Member"])
        output = dataframe_input.preprocess(x_data)
        self.assertEqual(output["Age"][1], 24)
        self.assertEqual(output["Member"][0], False)

    def test_in_interface(self):
        x_data = [[1,2,3],[4,5,6]]
        iface = gr.Interface(np.max, "numpy", "number")
        self.assertEqual(iface.process([x_data])[0], [6])

        x_data = [["Tim"], ["Jon"], ["Sal"]]
        def get_last(l):
            return l[-1]
        iface = gr.Interface(get_last, "list", "text")
        self.assertEqual(iface.process([x_data])[0], ["Sal"])

class TestSequential(unittest.TestCase):
    def test_as_component(self):
        x_data = [["Tim",12,False],["Jan",24,True]]
        dataframe_input = gr.inputs.Dataframe(headers=["Name","Age","Member"])
        output = dataframe_input.preprocess(x_data)
        self.assertEqual(output["Age"][1], 24)
        self.assertEqual(output["Member"][0], False)

    def test_in_interface(self):
        x_data = [[1,2,3],[4,5,6]]
        iface = gr.Interface(np.max, "numpy", "number")
        self.assertEqual(iface.process([x_data])[0], [6])

        x_data = [["Tim"], ["Jon"], ["Sal"]]
        def get_last(l):
            return l[-1]
        iface = gr.Interface(get_last, "list", "text")
        self.assertEqual(iface.process([x_data])[0], ["Sal"])


if __name__ == '__main__':
    unittest.main()