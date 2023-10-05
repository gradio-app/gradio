import gradio as gr
from gradio.data_classes import PredictBody
from gradio.helpers import EventData
from gradio.route_utils import prepare_event_data, set_replica_url_in_config


def test_set_replica_url():
    config = {
        "components": [
            {"props": {}},
            {"props": {"root_url": "existing_url/"}},
            {"props": {"root_url": "different_url/"}},
            {},
        ]
    }
    replica_url = "https://abidlabs-test-client-replica--fttzk.hf.space?__theme=light"

    set_replica_url_in_config(config, replica_url, {"existing_url/"})
    assert (
        config["components"][0]["props"]["root_url"]
        == "https://abidlabs-test-client-replica--fttzk.hf.space/"
    )
    assert (
        config["components"][1]["props"]["root_url"]
        == "https://abidlabs-test-client-replica--fttzk.hf.space/"
    )
    assert config["components"][2]["props"]["root_url"] == "different_url/"
    assert "props" not in config["components"][3]


def test_url_without_trailing_slash():
    config = {"components": [{"props": {}}]}
    replica_url = "https://abidlabs-test-client-replica--fttzk.hf.space"

    set_replica_url_in_config(config, replica_url, set())
    assert (
        config["components"][0]["props"]["root_url"]
        == "https://abidlabs-test-client-replica--fttzk.hf.space/"
    )


def test_prepare_event_data():
    def on_select(evt: gr.SelectData):
        return f"You selected {evt.value} at {evt.index} from {evt.target}"

    with gr.Blocks() as demo:
        textbox = gr.Textbox("Hello World!")
        statement = gr.Textbox()
        textbox.select(on_select, None, statement)

    body = PredictBody(data=[], event_data={"value": "World", "index": [6, 11]})
    event_data = prepare_event_data(demo, body, 0)
    correct_event_data = EventData(textbox, {"value": "World", "index": [6, 11]})
    assert vars(event_data) == vars(correct_event_data)
