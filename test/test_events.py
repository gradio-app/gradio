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

    def test_consecutive_events(self):
        def double(x):
            return x + x

        def reverse(x):
            return x[::-1]

        def clear():
            return ""

        with gr.Blocks() as parent:
            txt0 = gr.Textbox()
            txt0.submit(lambda x:x , txt0, txt0)
            with gr.Blocks() as demo:
                txt1 = gr.Textbox()
                txt2 = gr.Textbox()
                txt3 = gr.Textbox()

                txt1.submit(double, txt1, txt2).then(reverse, txt2, txt3).success(
                    clear, None, txt1
                )

        assert parent.config["dependencies"][1]["trigger_after"] == None
        assert parent.config["dependencies"][2]["trigger_after"] == 1
        assert parent.config["dependencies"][3]["trigger_after"] == 2

        assert parent.config["dependencies"][2]["trigger_only_on_success"] == False
        assert parent.config["dependencies"][3]["trigger_only_on_success"] == True


class TestEventErrors:
    def test_event_defined_invalid_scope(self):
        with gr.Blocks() as demo:
            textbox = gr.Textbox()
            textbox.blur(lambda x: x + x, textbox, textbox)

        with pytest.raises(AttributeError):
            demo.load(lambda: "hello", None, textbox)

        with pytest.raises(AttributeError):
            textbox.change(lambda x: x + x, textbox, textbox)
