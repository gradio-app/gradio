import pytest

import gradio as gr


class TestEventErrors:
    def test_event_defined_invalid_scope(self):
        with gr.Blocks() as demo:
            textbox = gr.Textbox()
            textbox.blur(lambda x: x + x, textbox, textbox)

        with pytest.raises(AttributeError):
            demo.load(lambda: "hello", None, textbox)

        with pytest.raises(AttributeError):
            textbox.change(lambda x: x + x, textbox, textbox)
