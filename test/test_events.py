import pytest

import gradio as gr


class TestEvent:
    def test_clear_event(self):
        def fn_img_cleared():
            print("image cleared")

        with gr.Blocks() as demo:
            img = gr.Image(
                type="pil", label="Start by uploading an image", elem_id="input_image"
            )

            img.clear(fn_img_cleared, [], [])

        assert demo.config["dependencies"][0]["trigger"] == "clear"


class TestEventErrors:
    def test_event_defined_invalid_scope(self):
        with gr.Blocks() as demo:
            textbox = gr.Textbox()
            textbox.blur(lambda x: x + x, textbox, textbox)

        with pytest.raises(AttributeError):
            demo.load(lambda: "hello", None, textbox)

        with pytest.raises(AttributeError):
            textbox.change(lambda x: x + x, textbox, textbox)
