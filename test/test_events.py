import pytest
from fastapi.testclient import TestClient

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

    def test_event_data(self):
        with gr.Blocks() as demo:
            text = gr.Textbox()
            gallery = gr.Gallery()

            def fn_img_index(evt: gr.EventData):
                return evt.data["index"]

            gallery.focus(fn_img_index, None, text)

        app, _, _ = demo.launch(prevent_thread_lock=True)
        client = TestClient(app)

        resp = client.post(
            f"{demo.local_url}run/predict",
            json={"fn_index": 0, "data": [], "event_data": {"index": 1}},
        )
        assert resp.status_code == 200
        assert resp.json()["data"][0] == "1"


class TestEventErrors:
    def test_event_defined_invalid_scope(self):
        with gr.Blocks() as demo:
            textbox = gr.Textbox()
            textbox.blur(lambda x: x + x, textbox, textbox)

        with pytest.raises(AttributeError):
            demo.load(lambda: "hello", None, textbox)

        with pytest.raises(AttributeError):
            textbox.change(lambda x: x + x, textbox, textbox)
