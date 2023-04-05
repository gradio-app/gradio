import pytest
import transformers

import gradio as gr


@pytest.mark.flaky
class TestLoadFromPipeline:
    def test_text_to_text_model_from_pipeline(self):
        pipe = transformers.pipeline(model="sshleifer/bart-tiny-random")
        io = gr.Interface.from_pipeline(pipe)
        output = io("My name is Sylvain and I work at Hugging Face in Brooklyn")
        assert isinstance(output, str)
