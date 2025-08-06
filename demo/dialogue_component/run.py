import gradio as gr

with gr.Blocks() as demo:

    gr.Dialogue(speakers=["Speaker 1", "Speaker 2"], formatter=None, tags=["(laughs)", "(sighs)", "(clears throat)"],
                value=[
                    {"speaker": "Speaker 1", "text": "Hello, how are you?"},
                    {"speaker": "Speaker 2", "text": "I'm fine, thank you!"},
                ], separator="\n", interactive=True)
demo.launch()
