import gradio as gr


class TestButton:
    def test_postprocess(self):
        assert gr.Button().postprocess("5") == "5"
        assert gr.Button().postprocess(5) == "5"  # type: ignore

    def test_get_config(self):
        btn = gr.Button()
        config = btn.get_config()
        assert config["scale"] is None
        assert config["min_width"] is None

    def test_scale_in_config(self):
        btn = gr.Button(scale=2, min_width=100)
        config = btn.get_config()
        assert config["scale"] == 2
        assert config["min_width"] == 100

    def test_scale_zero(self):
        btn = gr.Button(scale=0)
        config = btn.get_config()
        assert config["scale"] == 0
