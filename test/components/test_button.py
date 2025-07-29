import gradio as gr


class TestButton:
    def test_postprocess(self):
        assert gr.Button().postprocess("5") == "5"
        assert gr.Button().postprocess(5) == "5"  # type: ignore
