import gradio as gr


demo = gr.Blocks()

with demo:
    with gr.Row():
        gr.Image(interactive=True)
        gr.Image()
    with gr.Row():
        gr.Textbox(label="Text")
        gr.Number(label="Count")
        gr.Radio(choices=["One", "Two"])
    with gr.Row():
        with gr.Row():
            with gr.Column():
                gr.Textbox(label="Text")
                gr.Number(label="Count")
                gr.Radio(choices=["One", "Two"])
            gr.Image()
            with gr.Column():
                gr.Image(interactive=True)
                gr.Image()
    gr.Image()
    gr.Textbox(label="Text")
    gr.Number(label="Count")
    gr.Radio(choices=["One", "Two"])


if __name__ == "__main__":
    demo.launch()
