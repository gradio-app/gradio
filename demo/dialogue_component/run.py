import gradio as gr

with gr.Blocks() as demo:
    dd = gr.Dialogue(speakers=["Speaker 1", "Speaker 2"],
                     tags=["(laughs)", "(sighs)", "(clears throat)"],
                value=[
                    {"speaker": "Speaker 1", "text": "Hello, how are you?"},
                    {"speaker": "Speaker 2", "text": "I'm fine, thank you!"},
                ], separator="\n", interactive=True)
    output = gr.Textbox(label="Output", value="")
    dd.submit(lambda x: x, inputs=dd, outputs=output)
demo.launch()
