"""Tests for the component props feature."""

import gradio as gr
from gradio import helpers


def test_special_args_detects_component_type_hints():
    """Test that special_args detects when a parameter is type-hinted with a component."""

    def func_with_component_hint(x: gr.Number):
        return x.value * 2

    def func_without_hint(x):
        return x * 2

    # Test that component type hint is detected
    _, _, _, component_prop_indices = helpers.special_args(func_with_component_hint)
    assert 0 in component_prop_indices

    # Test that no component type hint is detected
    _, _, _, component_prop_indices = helpers.special_args(func_without_hint)
    assert len(component_prop_indices) == 0


def test_special_args_creates_namespace_with_props():
    """Test that special_args creates a namespace object with component props."""

    def func(x: gr.Number):
        return x.value

    component_props = {
        0: {"value": 5, "minimum": 0, "maximum": 10, "label": "Test Number"}
    }

    inputs, *_ = helpers.special_args(func, inputs=[5], component_props=component_props)

    # Check that the input is a SimpleNamespace with all props
    assert hasattr(inputs[0], "value")
    assert hasattr(inputs[0], "minimum")
    assert hasattr(inputs[0], "maximum")
    assert hasattr(inputs[0], "label")
    assert inputs[0].value == 5
    assert inputs[0].minimum == 0
    assert inputs[0].maximum == 10
    assert inputs[0].label == "Test Number"


def test_mixed_type_hints():
    """Test that we can mix component type hints with regular parameters."""

    def func(a: gr.Number, b, c: gr.Textbox):
        return a.value + b + len(c.value)

    _, _, _, component_prop_indices = helpers.special_args(func)
    assert 0 in component_prop_indices  # a
    assert 1 not in component_prop_indices  # b
    assert 2 in component_prop_indices  # c


def test_block_function_stores_component_prop_inputs():
    """Test that BlockFunction correctly stores component_prop_inputs."""
    from gradio.block_function import BlockFunction

    def func(x: gr.Number):
        return x.value

    block_fn = BlockFunction(
        fn=func,
        inputs=[],
        outputs=[],
        preprocess=True,
        postprocess=True,
        inputs_as_dict=False,
        targets=[],
        _id=0,
        component_prop_inputs=[0, 2],
    )

    assert block_fn.component_prop_inputs == [0, 2]
    assert block_fn.get_config()["component_prop_inputs"] == [0, 2]


def test_component_props_in_blocks():
    """Test the full integration of component props in a Blocks app."""

    with gr.Blocks() as demo:
        a = gr.Number(value=5, minimum=0, maximum=10)
        b = gr.Number()

        def double_with_props(x: gr.Number):
            # Should receive namespace with all props
            return x.value * 2

        a.submit(double_with_props, a, b)

    # Check that the function has component_prop_inputs set
    fn = demo.fns[0]
    assert 0 in fn.component_prop_inputs
