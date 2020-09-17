import unittest
import gradio as gr
import PIL
import numpy as np

class TestTextbox(unittest.TestCase):
    def test_interface(self):
        iface = gr.Interface(lambda x: x[::-1], "textbox", "textbox")
        assert iface.process(["Hello"])[0] == ["olleH"]
        iface = gr.Interface(lambda x: x*x, "number", "number")
        assert iface.process(["5"])[0] == [25]

class TestSlider(unittest.TestCase):
    def test_interface(self):
        iface = gr.Interface(lambda x: str(x) + " cats", "slider", "textbox")
        assert iface.process([4])[0] == ["4 cats"]


class TestCheckbox(unittest.TestCase):
    def test_interface(self):
        iface = gr.Interface(lambda x: "yes" if x else "no", "checkbox", "textbox")
        assert iface.process([False])[0] == ["no"]


class TestCheckboxGroup(unittest.TestCase):
    def test_interface(self):
        checkboxes = gr.inputs.CheckboxGroup(["a", "b", "c"])
        iface = gr.Interface(lambda x: "|".join(x), checkboxes, "textbox")
        assert iface.process([["a", "c"]])[0] == ["a|c"]
        assert iface.process([[]])[0] == [""]
        checkboxes = gr.inputs.CheckboxGroup(["a", "b", "c"], type="index")
        iface = gr.Interface(lambda x: "|".join(map(str, x)), checkboxes, "textbox")
        assert iface.process([["a", "c"]])[0] == ["0|2"]


class TestRadio(unittest.TestCase):
    def test_interface(self):
        radio = gr.inputs.Radio(["a", "b", "c"])
        iface = gr.Interface(lambda x: 2 * x, radio, "textbox")
        assert iface.process(["c"])[0] == ["cc"]
        radio = gr.inputs.Radio(["a", "b", "c"], type="index")
        iface = gr.Interface(lambda x: 2 * x, radio, "number")
        assert iface.process(["c"])[0] == [4]


class TestDropdown(unittest.TestCase):
    def test_interface(self):
        dropdown = gr.inputs.Dropdown(["a", "b", "c"])
        iface = gr.Interface(lambda x: 2 * x, dropdown, "textbox")
        assert iface.process(["c"])[0] == ["cc"]
        dropdown = gr.inputs.Dropdown(["a", "b", "c"], type="index")
        iface = gr.Interface(lambda x: 2 * x, dropdown, "number")
        assert iface.process(["c"])[0] == [4]


class TestImage(unittest.TestCase):
    def test_component(self):
        x_img = gr.test_data.BASE64_IMAGE
        image_input = gr.inputs.Image()
        assert image_input.preprocess(x_img).shape == (68, 61 ,3)
        image_input = gr.inputs.Image(image_mode="L", shape=(25, 25))
        assert image_input.preprocess(x_img).shape == (25, 25)
        image_input = gr.inputs.Image(shape=(30, 10), type="pil")
        assert image_input.preprocess(x_img).size == (30, 10)


    def test_interface(self):
        x_img = gr.test_data.BASE64_IMAGE
        
        def open_and_rotate(img_file):
            img = PIL.Image.open(img_file)
            return img.rotate(90, expand=True)

        iface = gr.Interface(
            open_and_rotate, 
            gr.inputs.Image(shape=(30, 10), type="file"),
            "image")
        output = iface.process([x_img])[0][0]
        assert gr.processing_utils.decode_base64_to_image(output).size == (10, 30)
        

class TestAudio(unittest.TestCase):
    def test_component(self):
        x_wav = gr.test_data.BASE64_AUDIO
        audio_input = gr.inputs.Audio()
        output = audio_input.preprocess(x_wav)
        print(output[0])
        print(output[1].shape)
        assert output[0] == 44000
        assert output[1].shape == (100, 2)


    def test_interface(self):
        pass


class TestFile(unittest.TestCase):
    pass


class TestDataframe(unittest.TestCase):
    pass



if __name__ == '__main__':
    unittest.main()