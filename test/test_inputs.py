import unittest
import gradio as gr


class TestTextbox(unittest.TestCase):
    def test_component(self):
        box = gr.inputs.Textbox()
        assert box.preprocess("Hello") == "Hello"
        box = gr.inputs.Textbox(type="str")
        assert box.preprocess(125) == 125

    def test_interface(self):
        iface = gr.Interface(lambda x: x[::-1], "textbox", "textbox")
        assert interface.process("Hello") == "olleH"
        iface = gr.Interface(lambda x: x*x, "number", "number")
        assert interface.process(5) == 25


class TestSlider(unittest.TestCase):
    pass


class TestCheckbox(unittest.TestCase):
    pass


class TestCheckboxGroup(unittest.TestCase):
    pass


class TestRadio(unittest.TestCase):
    pass


class TestDropdown(unittest.TestCase):
    pass


class TestImage(unittest.TestCase):
    pass


class TestAudio(unittest.TestCase):
    pass


class TestFile(unittest.TestCase):
    pass


class TestDataframe(unittest.TestCase):
    pass



if __name__ == '__main__':
    unittest.main()