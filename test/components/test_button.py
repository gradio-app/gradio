import gradio as gr


class TestButton:
    def test_postprocess(self):
        assert gr.Button().postprocess("6") == "6"
        assert gr.Button().postprocess(6) == "6"  # type: ignore
