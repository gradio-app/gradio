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

    @pytest.mark.asyncio
    async def test_update_with_gr_update(self):
        """Test that gr.update(value=...) works with gr.State components."""
        with gr.Blocks() as demo:
            state = gr.State(value=False)
            btn = gr.Button()
            # First function sets state to True using gr.update
            btn.click(lambda: gr.update(value=True), None, state)
            # Second function returns the current state value
            btn2 = gr.Button()
            btn2.click(lambda x: x, state, state)

        # Call first function to set state to True
        result = await demo.call_function(0, [])
        # The prediction is the raw return value (gr.update dict)
        assert result["prediction"] == {"__type__": "update", "value": True}

        # Call second function to verify state was actually updated
        result = await demo.call_function(1, [True])  # Pass True as current state
        assert result["prediction"] is True

    @pytest.mark.asyncio
    async def test_update_with_gr_update_complex_value(self):
        """Test that gr.update(value=...) works with complex values."""
        with gr.Blocks() as demo:
            state = gr.State(value={"count": 0})
            btn = gr.Button()
            btn.click(
                lambda x: gr.update(value={"count": x["count"] + 1}), state, state
            )

        result = await demo.call_function(0, [{"count": 5}])
        # The prediction is the raw return value (gr.update dict)
        assert result["prediction"] == {"__type__": "update", "value": {"count": 6}}
