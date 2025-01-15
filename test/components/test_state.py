import pytest
from pydantic import BaseModel

import gradio as gr


class TestModel(BaseModel):
    name: str


class TestState:
    def test_as_component(self):
        state = gr.State(value=5)
        assert state.preprocess(10) == 10
        assert state.preprocess("abc") == "abc"
        assert state.stateful

    def test_initial_value_deepcopy(self):
        with pytest.raises(TypeError):
            gr.State(value=gr)  # modules are not deepcopyable

    def test_initial_value_pydantic(self):
        state = gr.State(value=TestModel(name="Freddy"))
        assert isinstance(state.value, TestModel)

    @pytest.mark.asyncio
    async def test_in_interface(self):
        def test(x, y=" def"):
            return (x + y, x + y)

        io = gr.Interface(test, ["text", "state"], ["text", "state"])
        result = await io.call_function(0, ["abc"])
        assert result["prediction"][0] == "abc def"
        result = await io.call_function(0, ["abc", result["prediction"][0]])
        assert result["prediction"][0] == "abcabc def"

    @pytest.mark.asyncio
    async def test_in_blocks(self):
        with gr.Blocks() as demo:
            score = gr.State()
            btn = gr.Button()
            btn.click(lambda x: x + 1, score, score)

        result = await demo.call_function(0, [0])
        assert result["prediction"] == 1
        result = await demo.call_function(0, [result["prediction"]])
        assert result["prediction"] == 2
