import gradio as gr
from gradio.data_classes import PredictBody
from gradio.helpers import EventData
from gradio.route_utils import prepare_event_data


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
