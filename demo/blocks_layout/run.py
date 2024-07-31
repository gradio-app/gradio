import gradio as gr

demo = gr.Blocks()

with demo:
    with gr.Row():
        gr.Image(interactive=True, scale=2)
        gr.Image()
    with gr.Row():
        gr.Textbox(label="Text")
        gr.Number(label="Count", scale=2)
        gr.Radio(choices=["One", "Two"])
    with gr.Row():
        gr.Button("500", scale=0, min_width=500)
        gr.Button("A", scale=0)
        gr.Button("grow")
    with gr.Row():
        gr.Textbox()
        gr.Textbox()
        gr.Button()
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
