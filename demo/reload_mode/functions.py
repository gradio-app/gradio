import gradio as gr

if gr.NO_RELOAD:
    def get_status(): # type: ignore
        return "full"
else:
    def get_status():
        return "reloaded"
