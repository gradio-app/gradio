import pytest

import gradio as gr


class TestDropdown:
    def test_component_functions(self):
        """
        Preprocess, postprocess, serialize, get_config
        """
        dropdown_input = gr.Dropdown(["a", "b", ("c", "c full")], multiselect=True)
        assert dropdown_input.preprocess("a") == "a"
        assert dropdown_input.postprocess("a") == ["a"]
        assert dropdown_input.preprocess("c full") == "c full"
        assert dropdown_input.postprocess("c full") == ["c full"]

        # When a Gradio app is loaded with gr.load, the tuples are converted to lists,
        # so we need to test that case as well
        dropdown_input = gr.Dropdown(["a", "b", ["c", "c full"]])  # type: ignore
        assert dropdown_input.choices == [("a", "a"), ("b", "b"), ("c", "c full")]

        dropdown = gr.Dropdown(choices=["a", "b"], type="index")
        assert dropdown.preprocess("a") == 0
        assert dropdown.preprocess("b") == 1
        assert dropdown.preprocess("c") is None

        dropdown = gr.Dropdown(choices=["a", "b"], type="index", multiselect=True)
        assert dropdown.preprocess(["a"]) == [0]
        assert dropdown.preprocess(["a", "b"]) == [0, 1]
        assert dropdown.preprocess(["a", "b", "c"]) == [0, 1, None]

        dropdown_input_multiselect = gr.Dropdown(["a", "b", ("c", "c full")])
        assert dropdown_input_multiselect.preprocess(["a", "c full"]) == ["a", "c full"]
        assert dropdown_input_multiselect.postprocess(["a", "c full"]) == [
            "a",
            "c full",
        ]
        dropdown_input_multiselect = gr.Dropdown(
            value=["a", "c"],
            choices=["a", "b", ("c", "c full")],
            label="Select Your Inputs",
            multiselect=True,
            max_choices=2,
        )
        assert dropdown_input_multiselect.get_config() == {
            "allow_custom_value": False,
            "choices": [("a", "a"), ("b", "b"), ("c", "c full")],
            "value": ["a", "c"],
            "name": "dropdown",
            "show_label": True,
            "label": "Select Your Inputs",
            "container": True,
            "min_width": 160,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "interactive": None,
            "proxy_url": None,
            "multiselect": True,
            "filterable": True,
            "max_choices": 2,
            "_selectable": False,
            "key": None,
            "type": "value",
            "info": None,
        }
        with pytest.raises(ValueError):
            gr.Dropdown(["a"], type="unknown")

        dropdown = gr.Dropdown(choices=["a", "b"], value="c")
        assert dropdown.get_config()["value"] == "c"
        assert dropdown.postprocess("a") == "a"

    def test_in_interface(self):
        """
        Interface, process
        """
        dropdown_input = gr.Dropdown(["a", "b", "c"])
        iface = gr.Interface(lambda x: "|".join(x), dropdown_input, "textbox")
        assert iface(["a", "c"]) == "a|c"
        assert iface([]) == ""
