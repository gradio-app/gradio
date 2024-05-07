import pytest

import gradio as gr


class TestCheckboxGroup:
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, get_config
        """
        checkboxes_input = gr.CheckboxGroup(["a", "b", "c"])
        assert checkboxes_input.preprocess(["a", "c"]) == ["a", "c"]
        assert checkboxes_input.postprocess(["a", "c"]) == ["a", "c"]

        checkboxes_input = gr.CheckboxGroup(["a", "b"], type="index")
        assert checkboxes_input.preprocess(["a"]) == [0]
        assert checkboxes_input.preprocess(["a", "b"]) == [0, 1]
        assert checkboxes_input.preprocess(["a", "b", "c"]) == [0, 1, None]

        # When a Gradio app is loaded with gr.load, the tuples are converted to lists,
        # so we need to test that case as well
        checkboxgroup = gr.CheckboxGroup(["a", "b", ["c", "c full"]])  # type: ignore
        assert checkboxgroup.choices == [("a", "a"), ("b", "b"), ("c", "c full")]

        checkboxes_input = gr.CheckboxGroup(
            value=["a", "c"],
            choices=["a", "b", "c"],
            label="Check Your Inputs",
        )
        assert checkboxes_input.get_config() == {
            "choices": [("a", "a"), ("b", "b"), ("c", "c")],
            "value": ["a", "c"],
            "name": "checkboxgroup",
            "show_label": True,
            "label": "Check Your Inputs",
            "container": True,
            "min_width": 160,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "interactive": None,
            "proxy_url": None,
            "_selectable": False,
            "key": None,
            "type": "value",
            "info": None,
        }
        with pytest.raises(ValueError):
            gr.CheckboxGroup(["a"], type="unknown")

        cbox = gr.CheckboxGroup(choices=["a", "b"], value="c")
        assert cbox.get_config()["value"] == ["c"]
        assert cbox.postprocess("a") == ["a"]
        assert cbox.process_example("a") == ["a"]

    def test_in_interface(self):
        """
        Interface, process
        """
        checkboxes_input = gr.CheckboxGroup(["a", "b", "c"])
        iface = gr.Interface(lambda x: "|".join(x), checkboxes_input, "textbox")
        assert iface(["a", "c"]) == "a|c"
        assert iface([]) == ""
        _ = gr.CheckboxGroup(["a", "b", "c"], type="index")
