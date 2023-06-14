import gradio as gr


class TestClearButton:
    def test_clear_event_setup_correctly(self):
        with gr.Blocks() as demo:
            chatbot = gr.Chatbot([("Hello", "How are you?")])
            with gr.Row():
                textbox = gr.Textbox(scale=3, interactive=True)
                gr.ClearButton([textbox, chatbot], scale=1)

        clear_event_trigger = demo.dependencies.pop()
        assert not clear_event_trigger["backend_fn"]
        assert clear_event_trigger["js"]
        assert clear_event_trigger["outputs"] == [textbox._id, chatbot._id]
