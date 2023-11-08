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

        assert demo.config["dependencies"][0]["targets"][0][1] == "clear"

    def test_event_data(self):
        with gr.Blocks() as demo:
            text = gr.Textbox()
            gallery = gr.Gallery()

            def fn_img_index(evt: gr.SelectData):
                return evt.index

            gallery.select(fn_img_index, None, text)

        app, _, _ = demo.launch(prevent_thread_lock=True)
        client = TestClient(app)

        resp = client.post(
            f"{demo.local_url}run/predict",
            json={"fn_index": 0, "data": [], "event_data": {"index": 1, "value": None}},
        )
        assert resp.status_code == 200
        assert resp.json()["data"][0] == "1"

    def test_consecutive_events(self):
        def double(x):
            return x + x

        def reverse(x):
            return x[::-1]

        def clear():
            return ""

        with gr.Blocks() as child:
            txt1 = gr.Textbox()
            txt2 = gr.Textbox()
            txt3 = gr.Textbox()

            txt1.submit(double, txt1, txt2).then(reverse, txt2, txt3).success(
                clear, None, txt1
            )

        with gr.Blocks() as parent:
            txt0 = gr.Textbox()
            txt0.submit(lambda x: x, txt0, txt0)
            child.render()

        assert parent.config["dependencies"][1]["trigger_after"] is None
        assert parent.config["dependencies"][2]["trigger_after"] == 1
        assert parent.config["dependencies"][3]["trigger_after"] == 2

        assert not parent.config["dependencies"][2]["trigger_only_on_success"]
        assert parent.config["dependencies"][3]["trigger_only_on_success"]

    def test_on_listener(self):
        with gr.Blocks() as demo:
            name = gr.Textbox(label="Name")
            output = gr.Textbox(label="Output Box")
            greet_btn = gr.Button("Greet")

            def greet(name):
                return "Hello " + name + "!"

            gr.on(
                triggers=[name.submit, greet_btn.click, demo.load],
                fn=greet,
                inputs=name,
                outputs=output,
            )

            with gr.Row():
                num1 = gr.Slider(1, 10)
                num2 = gr.Slider(1, 10)
                num3 = gr.Slider(1, 10)
            output = gr.Number(label="Sum")

            @gr.on(inputs=[num1, num2, num3], outputs=output)
            def sum(a, b, c):
                return a + b + c

        assert demo.config["dependencies"][0]["targets"] == [
            (name._id, "submit"),
            (greet_btn._id, "click"),
            (demo._id, "load"),
        ]
        assert demo.config["dependencies"][1]["targets"] == [
            (num1._id, "change"),
            (num2._id, "change"),
            (num3._id, "change"),
        ]

    def test_load_chaining(self):
        calls = 0

        def increment():
            nonlocal calls
            calls += 1
            return str(calls)

        with gr.Blocks() as demo:
            out = gr.Textbox(label="Call counter")
            demo.load(increment, inputs=None, outputs=out).then(
                increment, inputs=None, outputs=out
            )

        assert demo.config["dependencies"][0]["targets"][0][1] == "load"
        assert demo.config["dependencies"][0]["trigger_after"] is None
        assert demo.config["dependencies"][1]["targets"][0][1] == "then"
        assert demo.config["dependencies"][1]["trigger_after"] == 0

    def test_load_chaining_reuse(self):
        calls = 0

        def increment():
            nonlocal calls
            calls += 1
            return str(calls)

        with gr.Blocks() as demo:
            out = gr.Textbox(label="Call counter")
            demo.load(increment, inputs=None, outputs=out).then(
                increment, inputs=None, outputs=out
            )

        with gr.Blocks() as demo2:
            demo.render()

        assert demo2.config["dependencies"][0]["targets"][0][1] == "load"
        assert demo2.config["dependencies"][0]["trigger_after"] is None
        assert demo2.config["dependencies"][1]["targets"][0][1] == "then"
        assert demo2.config["dependencies"][1]["trigger_after"] == 0


class TestEventErrors:
    def test_event_defined_invalid_scope(self):
        with gr.Blocks() as demo:
            textbox = gr.Textbox()
            textbox.blur(lambda x: x + x, textbox, textbox)

        with pytest.raises(AttributeError):
            demo.load(lambda: "hello", None, textbox)

        with pytest.raises(AttributeError):
            textbox.change(lambda x: x + x, textbox, textbox)
