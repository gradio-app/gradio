import gradio as gr

with gr.Blocks() as demo:

    gr.Dialogue(speakers=["Speaker 1", "Speaker 2"], formatter=None, tags=["laughs", "sighs", "clears throat"])
demo.launch()
