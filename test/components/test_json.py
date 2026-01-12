import json

import numpy as np
import pytest

import gradio as gr


class TestJSON:
    def test_component_functions(self):
        """
        Postprocess
        """
        js_output = gr.JSON()
        assert js_output.postprocess('{"a":1, "b": 2}'), '"{\\"a\\":1, \\"b\\": 2}"'
        assert js_output.get_config() == {
            "container": True,
            "min_width": 160,
            "scale": None,
            "buttons": ["copy"],
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "value": None,
            "show_label": True,
            "label": None,
            "height": None,
            "name": "json",
            "proxy_url": None,
            "_selectable": False,
            "open": False,
            "key": None,
            "preserved_by_key": ["value"],
            "show_indices": False,
            "max_height": 500,
            "min_height": None,
        }
        js_component = gr.Json(value={"a": 1, "b": 2})
        assert js_component.get_config()["value"] == {"a": 1, "b": 2}

    def test_chatbot_selectable_in_config(self):
        with gr.Blocks() as demo:
            cb = gr.Chatbot(label="Chatbot")
            cb.like(lambda: print("foo"))
            gr.Chatbot(label="Chatbot2")

        assertion_count = 0
        for component in demo.config["components"]:
            if component["props"]["label"] == "Chatbot":
                assertion_count += 1
                assert component["props"]["likeable"]
            elif component["props"]["label"] == "Chatbot2":
                assertion_count += 1
                assert not component["props"]["likeable"]

        assert assertion_count == 2

    @pytest.mark.asyncio
    async def test_in_interface(self):
        """
        Interface, process
        """

        def get_avg_age_per_gender(data):
            return {
                "M": int(data[data["gender"] == "M"]["age"].mean()),
                "F": int(data[data["gender"] == "F"]["age"].mean()),
                "O": int(data[data["gender"] == "O"]["age"].mean()),
            }

        iface = gr.Interface(
            get_avg_age_per_gender,
            gr.Dataframe(headers=["gender", "age"]),
            "json",
        )
        y_data = [
            ["M", 30],
            ["F", 20],
            ["M", 40],
            ["O", 20],
            ["F", 30],
        ]
        assert (
            await iface.process_api(0, [{"data": y_data, "headers": ["gender", "age"]}])
        )["data"][0].model_dump() == {
            "M": 35,
            "F": 25,
            "O": 20,
        }

    @pytest.mark.asyncio
    async def test_dict_with_path_key_not_moved(self):
        iface = gr.Interface(lambda x: x, "json", "json")
        y_data = {"assets": {"path": "foo"}}
        assert (await iface.process_api(0, [y_data]))["data"][0].model_dump() == y_data

    @pytest.mark.parametrize(
        "value, expected",
        [
            (None, None),
            (True, True),
            ([1, 2, 3], [1, 2, 3]),
            ([np.array([1, 2, 3])], [[1, 2, 3]]),
            ({"foo": [1, 2, 3]}, {"foo": [1, 2, 3]}),
            ({"foo": np.array([1, 2, 3])}, {"foo": [1, 2, 3]}),
        ],
    )
    def test_postprocess_returns_json_serializable_value(self, value, expected):
        json_component = gr.JSON()
        postprocessed_value = json_component.postprocess(value)
        if postprocessed_value is None:
            assert value is None
        else:
            assert postprocessed_value.model_dump() == expected
            assert json.loads(json.dumps(postprocessed_value.model_dump())) == expected
